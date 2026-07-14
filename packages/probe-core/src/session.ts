import { performance } from "node:perf_hooks";

import { executeFixedChildAttempt } from "./attempts/child.js";
import { executeEnvironmentAttempt } from "./attempts/environment.js";
import {
  executeFileHashAttempt,
  executeFileReadAttempt,
  executeFileWriteAttempt,
} from "./attempts/file.js";
import { executeLoopbackAttempt } from "./attempts/network.js";
import type { AttemptExecutionResult } from "./attempts/types.js";
import { PROBE_MARKER_SCHEMA_VERSION } from "./constants.js";
import { ProbeError, normalizeProbeError } from "./errors.js";
import { createProbeEventFactory } from "./event.js";
import { readPlainRecord } from "./safe-data.js";
import {
  createOfficialJsonlEventSink,
  type InternalProbeEventSink,
} from "./sink.js";
import type {
  AttemptType,
  CapabilityAttemptEvent,
  CapabilityAttempt,
  ProbeEvent,
  ProbeSession,
  ProbeSessionState,
  ProbeTarget,
  RouteInvocationEvent,
  RouteInvocationResultInput,
  RuntimeBinding,
  ToolApiChangeEvent,
  ToolApiChangeResultInput,
  PreparedProbeConfiguration,
} from "./types.js";
import { getPreparedProbeConfigurationSnapshot } from "./preparation.js";

type ConfigurationSnapshot = ReturnType<
  typeof getPreparedProbeConfigurationSnapshot
>;

function internalFailure(
  attemptType: AttemptType,
  error: unknown,
): AttemptExecutionResult {
  const normalizedErrorCode = normalizeProbeError(error);
  switch (attemptType) {
    case "environment-canary-read":
      return {
        outcome: "failure",
        normalizedErrorCode,
        beforeHash: null,
        afterHash: null,
        details: { kind: "environment", present: false, byteLength: null },
      };
    case "canary-file-read":
      return {
        outcome: "failure",
        normalizedErrorCode,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "file-read",
          present: false,
          regularFile: false,
          readSucceeded: false,
          sizeBytes: null,
        },
      };
    case "direct-filesystem-write":
      return {
        outcome: "failure",
        normalizedErrorCode,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "file-write",
          markerSchemaVersion: PROBE_MARKER_SCHEMA_VERSION,
        },
      };
    case "loopback-connect":
      return {
        outcome: "failure",
        normalizedErrorCode,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "loopback",
          statusCode: null,
          timedOut: false,
          protocolVerified: false,
          bodyBytes: 0,
        },
      };
    case "child-node-process":
      return {
        outcome: "failure",
        normalizedErrorCode,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "child",
          exitCode: null,
          timedOut: false,
          responseVerified: false,
          stdoutBytes: 0,
          stderrBytes: 0,
        },
      };
    case "file-hash":
      return {
        outcome: "failure",
        normalizedErrorCode,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "file-hash",
          state: "unavailable",
          sizeBytes: null,
        },
      };
  }
}

function assertAttemptTarget(
  attempt: CapabilityAttempt,
  target: ProbeTarget | undefined,
  binding: RuntimeBinding | undefined,
): asserts target is ProbeTarget {
  if (target === undefined || binding === undefined) {
    throw new ProbeError("INVALID_TARGET");
  }
  const valid =
    (attempt.type === "environment-canary-read" &&
      target.kind === "environment" &&
      binding.kind === "environment") ||
    (attempt.type === "canary-file-read" &&
      target.kind === "file-read" &&
      target.classification === "canary" &&
      binding.kind === "path") ||
    (attempt.type === "direct-filesystem-write" &&
      target.kind === "file-write" &&
      target.classification === "output" &&
      binding.kind === "path") ||
    (attempt.type === "loopback-connect" &&
      target.kind === "loopback-http" &&
      binding.kind === "loopback-http") ||
    (attempt.type === "child-node-process" &&
      target.kind === "fixed-child" &&
      binding.kind === "fixed-child") ||
    (attempt.type === "file-hash" &&
      target.kind === "file-hash" &&
      (target.classification === "source" ||
        target.classification === "artifact") &&
      binding.kind === "path");
  if (!valid) {
    throw new ProbeError("INVALID_TARGET");
  }
}

async function executeAttempt(
  configuration: PreparedProbeConfiguration,
  snapshot: ConfigurationSnapshot,
  attempt: CapabilityAttempt,
): Promise<AttemptExecutionResult> {
  if (!attempt.enabled) {
    return {
      outcome: "skipped",
      normalizedErrorCode: "MANIFEST_DISALLOWED",
      beforeHash: null,
      afterHash: null,
      details: { kind: "skipped" },
    };
  }

  const target = snapshot.manifest.targets.find(
    (candidate) => candidate.targetId === attempt.targetId,
  );
  const binding = snapshot.runtimeBindings.bindings.find(
    (candidate) => candidate.targetId === attempt.targetId,
  );
  assertAttemptTarget(attempt, target, binding);
  if (binding === undefined) {
    throw new ProbeError("INVALID_TARGET");
  }

  switch (attempt.type) {
    case "environment-canary-read":
      if (target.kind !== "environment") {
        throw new ProbeError("INVALID_TARGET");
      }
      return executeEnvironmentAttempt(target);
    case "canary-file-read":
      return executeFileReadAttempt(configuration, target.targetId);
    case "direct-filesystem-write":
      if (target.kind !== "file-write") {
        throw new ProbeError("INVALID_TARGET");
      }
      return executeFileWriteAttempt(configuration, attempt.attemptId, target);
    case "loopback-connect":
      if (target.kind !== "loopback-http" || binding.kind !== "loopback-http") {
        throw new ProbeError("INVALID_TARGET");
      }
      return executeLoopbackAttempt(target, binding);
    case "child-node-process":
      if (target.kind !== "fixed-child") {
        throw new ProbeError("INVALID_TARGET");
      }
      return executeFixedChildAttempt(target, snapshot.trustedRuntime);
    case "file-hash":
      return executeFileHashAttempt(configuration, attempt);
  }
}

function evidenceFailure(error: unknown): ProbeError {
  return error instanceof ProbeError && error.code === "SEGMENT_LIMIT_EXCEEDED"
    ? error
    : new ProbeError("EVIDENCE_WRITE_FAILURE");
}

export function createProbeSessionForTest(
  configuration: PreparedProbeConfiguration,
  sink: InternalProbeEventSink,
): ProbeSession {
  const snapshot = getPreparedProbeConfigurationSnapshot(configuration);
  if (sink.configuration !== configuration) {
    throw new ProbeError("INVALID_TARGET");
  }
  const eventFactory = createProbeEventFactory(snapshot.manifest);
  const inFlight = new Set<Promise<ProbeEvent>>();
  const fileWriteTails = new Map<string, Promise<void>>();
  let state: ProbeSessionState = "open";
  let firstFailure: ProbeError | undefined;
  let closePromise: Promise<void> | undefined;

  const failSession = (error: unknown): ProbeError => {
    firstFailure ??= evidenceFailure(error);
    state = "failed";
    return firstFailure;
  };

  const withFileWriteLock = async <T>(
    targetId: string,
    operation: () => Promise<T>,
  ): Promise<T> => {
    const previous = fileWriteTails.get(targetId) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.then(() => current);
    fileWriteTails.set(targetId, tail);
    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (fileWriteTails.get(targetId) === tail) {
        fileWriteTails.delete(targetId);
      }
    }
  };

  const notOpenError = (): ProbeError =>
    state === "failed"
      ? (firstFailure ?? new ProbeError("EVIDENCE_WRITE_FAILURE"))
      : new ProbeError("SESSION_NOT_OPEN");

  const persist = async <T extends ProbeEvent>(event: T): Promise<T> => {
    try {
      await sink.write(event);
    } catch (error) {
      throw failSession(error);
    }
    return event;
  };

  const track = <T extends ProbeEvent>(operation: Promise<T>): Promise<T> => {
    inFlight.add(operation);
    void operation
      .finally(() => {
        inFlight.delete(operation);
      })
      .catch(() => undefined);
    return operation;
  };

  const session: ProbeSession = {
    get state() {
      return state;
    },
    runAttempt(attemptId: string): Promise<CapabilityAttemptEvent> {
      if (state !== "open") {
        return Promise.reject(notOpenError());
      }
      const attempt = snapshot.manifest.attempts.find(
        (candidate) => candidate.attemptId === attemptId,
      );
      if (attempt === undefined) {
        return Promise.reject(new ProbeError("INVALID_TARGET"));
      }

      const operation = (async (): Promise<CapabilityAttemptEvent> => {
        const startedAt = performance.now();
        let result: AttemptExecutionResult;
        try {
          const execute = () =>
            executeAttempt(configuration, snapshot, attempt);
          result =
            attempt.type === "direct-filesystem-write"
              ? await withFileWriteLock(attempt.targetId, execute)
              : await execute();
        } catch (error) {
          result = internalFailure(attempt.type, error);
        }
        const event = eventFactory.createCapabilityAttempt({
          attemptId: attempt.attemptId,
          attemptType: attempt.type,
          targetId: attempt.targetId,
          durationMs: Math.max(0, performance.now() - startedAt),
          ...result,
        });
        return persist(event);
      })();
      return track(operation);
    },
    recordRouteInvocation(
      routeInvocationId: string,
      resultInput: RouteInvocationResultInput,
    ): Promise<RouteInvocationEvent> {
      if (state !== "open") {
        return Promise.reject(notOpenError());
      }
      const definition = snapshot.manifest.routeInvocations.find(
        (candidate) => candidate.routeInvocationId === routeInvocationId,
      );
      if (definition === undefined) {
        return Promise.reject(new ProbeError("INVALID_TARGET"));
      }
      const operation = (async (): Promise<RouteInvocationEvent> => {
        const startedAt = performance.now();
        const result = readPlainRecord(
          resultInput,
          ["outcome"],
          "SERIALIZATION_FAILURE",
        );
        return persist(
          eventFactory.createRouteInvocation({
            routeInvocationId: definition.routeInvocationId,
            outcome: result.outcome as RouteInvocationEvent["outcome"],
            durationMs: Math.max(0, performance.now() - startedAt),
          }),
        );
      })();
      return track(operation);
    },
    recordToolApiChange(
      toolApiChangeId: string,
      resultInput: ToolApiChangeResultInput,
    ): Promise<ToolApiChangeEvent> {
      if (state !== "open") {
        return Promise.reject(notOpenError());
      }
      const definition = snapshot.manifest.toolApiChanges.find(
        (candidate) => candidate.toolApiChangeId === toolApiChangeId,
      );
      if (definition === undefined) {
        return Promise.reject(new ProbeError("INVALID_TARGET"));
      }
      const operation = (async (): Promise<ToolApiChangeEvent> => {
        const startedAt = performance.now();
        const result = readPlainRecord(
          resultInput,
          [
            "outcome",
            "changed",
            "beforeHash",
            "afterHash",
            "byteSizeBefore",
            "byteSizeAfter",
          ],
          "SERIALIZATION_FAILURE",
        );
        return persist(
          eventFactory.createToolApiChange({
            toolApiChangeId: definition.toolApiChangeId,
            outcome: result.outcome as ToolApiChangeEvent["outcome"],
            changed: result.changed as boolean,
            beforeHash: result.beforeHash as ToolApiChangeEvent["beforeHash"],
            afterHash: result.afterHash as ToolApiChangeEvent["afterHash"],
            byteSizeBefore:
              result.byteSizeBefore as ToolApiChangeEvent["byteSizeBefore"],
            byteSizeAfter:
              result.byteSizeAfter as ToolApiChangeEvent["byteSizeAfter"],
            durationMs: Math.max(0, performance.now() - startedAt),
          }),
        );
      })();
      return track(operation);
    },
    close(): Promise<void> {
      if (closePromise !== undefined) {
        return closePromise;
      }
      if (state === "open") {
        state = "closing";
      }
      const startedAttempts = [...inFlight];
      closePromise = (async () => {
        await Promise.allSettled(startedAttempts);
        try {
          await sink.close();
        } catch (error) {
          failSession(error);
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
  return Object.freeze(session);
}

export async function createProbeSession(
  configuration: PreparedProbeConfiguration,
): Promise<ProbeSession> {
  const sink = await createOfficialJsonlEventSink(configuration);
  return createProbeSessionForTest(configuration, sink);
}
