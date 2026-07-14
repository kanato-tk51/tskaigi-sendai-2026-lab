import { open, realpath, stat } from "node:fs/promises";
import path from "node:path";

import {
  MAX_EVENT_LINE_BYTES,
  MAX_EVENTS_PER_SEGMENT,
  MAX_SEGMENT_BYTES,
} from "./constants.js";
import { ProbeError } from "./errors.js";
import { serializeProbeEvent, validateProbeEvent } from "./event.js";
import { getBoundPath } from "./path-policy.js";
import type { PreparedProbeConfiguration, ProbeEvent } from "./types.js";
import { getPreparedProbeConfigurationSnapshot } from "./preparation.js";

export type EventSinkState = "open" | "closing" | "closed" | "failed";

export interface EventSegmentPolicy {
  readonly maxEventCount: number;
  readonly maxEventBytes: number;
  readonly maxSegmentBytes: number;
}

export interface EventSegmentFileHandle {
  write(
    buffer: Buffer,
    offset: number,
    length: number,
    position: number,
  ): Promise<{ readonly bytesWritten: number }>;
  close(): Promise<void>;
}

export interface InternalProbeEventSink {
  readonly configuration: PreparedProbeConfiguration;
  readonly state: EventSinkState;
  readonly partialLine: boolean;
  write(event: ProbeEvent): Promise<void>;
  close(): Promise<void>;
}

export const FIXED_EVENT_SEGMENT_POLICY: EventSegmentPolicy = Object.freeze({
  maxEventCount: MAX_EVENTS_PER_SEGMENT,
  maxEventBytes: MAX_EVENT_LINE_BYTES,
  maxSegmentBytes: MAX_SEGMENT_BYTES,
});

function isWithin(rootPath: string, candidatePath: string): boolean {
  const relative = path.relative(rootPath, candidatePath);
  return (
    relative !== "" &&
    !relative.startsWith(`..${path.sep}`) &&
    relative !== ".." &&
    !path.isAbsolute(relative)
  );
}

function sinkFailure(): ProbeError {
  return new ProbeError("EVIDENCE_WRITE_FAILURE");
}

function createEventSink(
  configuration: PreparedProbeConfiguration,
  fileHandle: EventSegmentFileHandle,
  policy: EventSegmentPolicy,
): InternalProbeEventSink {
  const snapshot = getPreparedProbeConfigurationSnapshot(configuration);
  let queue: Promise<void> = Promise.resolve();
  let state: EventSinkState = "open";
  let firstFailure: ProbeError | undefined;
  let closePromise: Promise<void> | undefined;
  let nextProducerSequence = 0;
  let acceptedEventCount = 0;
  let acceptedSegmentBytes = 0;
  let partialLine = false;

  const failTerminal = (
    failure: ProbeError,
    hasPartialLine = false,
  ): ProbeError => {
    if (firstFailure === undefined) {
      firstFailure = failure;
    }
    partialLine ||= hasPartialLine;
    state = "failed";
    return firstFailure;
  };

  const writeFully = async (
    line: Buffer,
    linePosition: number,
  ): Promise<void> => {
    let offset = 0;
    try {
      while (offset < line.byteLength) {
        const result = await fileHandle.write(
          line,
          offset,
          line.byteLength - offset,
          linePosition + offset,
        );
        if (
          !Number.isInteger(result.bytesWritten) ||
          result.bytesWritten <= 0 ||
          result.bytesWritten > line.byteLength - offset
        ) {
          throw sinkFailure();
        }
        offset += result.bytesWritten;
      }
    } catch {
      throw failTerminal(sinkFailure(), offset > 0);
    }
  };

  const sink: InternalProbeEventSink = {
    configuration,
    get state() {
      return state;
    },
    get partialLine() {
      return partialLine;
    },
    write(event: ProbeEvent): Promise<void> {
      if (firstFailure !== undefined) {
        return Promise.reject(firstFailure);
      }
      if (state !== "open") {
        return Promise.reject(sinkFailure());
      }

      let line: Buffer;
      try {
        const canonicalEvent = validateProbeEvent(event, snapshot.manifest);
        if (canonicalEvent.producerSequence !== nextProducerSequence) {
          throw new ProbeError("SERIALIZATION_FAILURE");
        }
        line = Buffer.from(
          `${serializeProbeEvent(canonicalEvent, snapshot.manifest)}\n`,
          "utf8",
        );
      } catch {
        return Promise.reject(new ProbeError("SERIALIZATION_FAILURE"));
      }

      if (
        acceptedEventCount + 1 > policy.maxEventCount ||
        line.byteLength > policy.maxEventBytes ||
        acceptedSegmentBytes + line.byteLength > policy.maxSegmentBytes
      ) {
        return Promise.reject(
          failTerminal(new ProbeError("SEGMENT_LIMIT_EXCEEDED")),
        );
      }

      const linePosition = acceptedSegmentBytes;
      nextProducerSequence += 1;
      acceptedEventCount += 1;
      acceptedSegmentBytes += line.byteLength;
      const operation = queue.then(async () => {
        if (firstFailure !== undefined) {
          throw firstFailure;
        }
        await writeFully(line, linePosition);
      });
      queue = operation.catch(() => undefined);
      return operation;
    },
    close(): Promise<void> {
      if (closePromise !== undefined) {
        return closePromise;
      }
      if (state === "open") {
        state = "closing";
      }
      closePromise = (async () => {
        await queue;
        try {
          await fileHandle.close();
        } catch {
          failTerminal(sinkFailure());
        }
        if (firstFailure !== undefined) {
          state = "failed";
          throw firstFailure;
        }
        state = "closed";
      })();
      void closePromise.catch(() => undefined);
      return closePromise;
    },
  };
  return Object.freeze(sink);
}

export function createJsonlEventSinkForTest(
  configuration: PreparedProbeConfiguration,
  fileHandle: EventSegmentFileHandle,
  policy: EventSegmentPolicy = FIXED_EVENT_SEGMENT_POLICY,
): InternalProbeEventSink {
  return createEventSink(
    configuration,
    fileHandle,
    Object.freeze({ ...policy }),
  );
}

export async function createOfficialJsonlEventSink(
  configuration: PreparedProbeConfiguration,
): Promise<InternalProbeEventSink> {
  const snapshot = getPreparedProbeConfigurationSnapshot(configuration);
  const boundPath = getBoundPath(
    configuration,
    snapshot.manifest.eventSinkTargetId,
  );
  if (boundPath.target.kind !== "event-segment") {
    throw new ProbeError("INVALID_TARGET");
  }

  let temporaryRoot: string;
  let segmentRoot: string;
  try {
    temporaryRoot = await realpath("/tmp");
    segmentRoot = await realpath(boundPath.binding.rootPath);
    const rootStats = await stat(segmentRoot);
    if (!rootStats.isDirectory() || !isWithin(temporaryRoot, segmentRoot)) {
      throw new ProbeError("PATH_OUTSIDE_ALLOWED_ROOT");
    }
  } catch (error) {
    if (error instanceof ProbeError) {
      throw error;
    }
    throw sinkFailure();
  }

  const segmentPath = path.join(segmentRoot, boundPath.binding.relativePath);
  if (!isWithin(segmentRoot, segmentPath)) {
    throw new ProbeError("PATH_OUTSIDE_ALLOWED_ROOT");
  }

  try {
    const fileHandle = await open(segmentPath, "wx", 0o600);
    return createEventSink(
      configuration,
      fileHandle,
      FIXED_EVENT_SEGMENT_POLICY,
    );
  } catch {
    throw sinkFailure();
  }
}
