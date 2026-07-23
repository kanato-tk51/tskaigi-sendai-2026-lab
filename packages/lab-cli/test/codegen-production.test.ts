import {
  PROBE_EVENT_SCHEMA_VERSION,
  PROBE_MANIFEST_SCHEMA_VERSION,
  serializeProbeEvent,
  type ProbeEvent,
  type ProbeManifest,
} from "@tskaigi-lab/probe-core";
import { readFileSync } from "node:fs";
import {
  chmod,
  link,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  collectCodegenProductionRun,
  collectCodegenProductionRunInOwnedRoot,
  validateCodegenScenarioDefinition,
  validateCodegenScenarioSnapshot,
  type CodegenProductionCheckpoint,
} from "../src/codegen-production.js";
import {
  CODEGEN_SCENARIO_SNAPSHOT_SCHEMA_VERSION,
  RUN_COMPLETION_SCHEMA_VERSION,
} from "../src/constants.js";
import { serializeJson } from "../src/renderer.js";
import type {
  CodegenProfileId,
  CodegenScenarioDefinition,
  CodegenScenarioSnapshot,
  RunCompletion,
} from "../src/types.js";

const SOURCE_DIGEST = `sha256:${"a".repeat(64)}` as const;
const CONTAINER_DIGEST = `sha256:${"b".repeat(64)}` as const;

function definition(profile: CodegenProfileId): CodegenScenarioDefinition {
  const name =
    profile === "permissive"
      ? "codegen-observe-p.json"
      : "codegen-observe-c.json";
  const source = readFileSync(
    new URL(`../../../scenarios/${name}`, import.meta.url),
    "utf8",
  );
  return validateCodegenScenarioDefinition(JSON.parse(source) as unknown);
}

function manifest(
  runId: string,
  scenarioId: CodegenScenarioDefinition["scenarioId"],
): ProbeManifest {
  return {
    schemaVersion: PROBE_MANIFEST_SCHEMA_VERSION,
    runId,
    scenarioId,
    route: "codegen-cli",
    phases: [
      "cli-startup",
      "argument-parse",
      "generation-start",
      "generation-api",
      "file-write",
      "completion",
    ],
    triggerTypes: ["explicit"],
    adapterVersion: "0.0.0",
    producerId: "codegen-cli-producer",
    workerId: null,
    cwdId: "codegen-adapter-workspace",
    toolName: "codegen",
    toolVersion: "0.0.0",
    eventSinkTargetId: "codegen-event-segment",
    targets: [
      { targetId: "codegen-event-segment", kind: "event-segment" },
      {
        targetId: "codegen-environment-canary",
        kind: "environment",
        variableName: "PROBE_CANARY_M2E_ENVIRONMENT",
      },
      {
        targetId: "codegen-file-canary",
        kind: "file-read",
        classification: "canary",
        maxBytes: 4096,
      },
      {
        targetId: "codegen-input-snapshot",
        kind: "file-hash",
        classification: "source",
        maxBytes: 4096,
      },
      {
        targetId: "codegen-direct-output",
        kind: "file-write",
        classification: "output",
        maxBytes: 4096,
      },
      {
        targetId: "codegen-loopback",
        kind: "loopback-http",
        timeoutMs: 2000,
      },
      {
        targetId: "codegen-fixed-child",
        kind: "fixed-child",
        timeoutMs: 2000,
        maxOutputBytes: 1024,
      },
    ],
    attempts: [
      {
        attemptId: "codegen-attempt-environment",
        type: "environment-canary-read",
        targetId: "codegen-environment-canary",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
      },
      {
        attemptId: "codegen-attempt-file-read",
        type: "canary-file-read",
        targetId: "codegen-file-canary",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
      },
      {
        attemptId: "codegen-attempt-file-hash",
        type: "file-hash",
        targetId: "codegen-input-snapshot",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
        hashPosition: "before",
      },
      {
        attemptId: "codegen-attempt-file-write",
        type: "direct-filesystem-write",
        targetId: "codegen-direct-output",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
      },
      {
        attemptId: "codegen-attempt-loopback",
        type: "loopback-connect",
        targetId: "codegen-loopback",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
      },
      {
        attemptId: "codegen-attempt-child",
        type: "child-node-process",
        targetId: "codegen-fixed-child",
        phase: "generation-start",
        triggerType: "explicit",
        enabled: true,
      },
    ],
    routeInvocations: [
      {
        routeInvocationId: "codegen-cli-startup",
        phase: "cli-startup",
        triggerType: "explicit",
        invocationKind: "module-evaluation",
        logicalUnitId: "codegen-cli-entry",
        enabled: true,
      },
      {
        routeInvocationId: "codegen-argument-parse",
        phase: "argument-parse",
        triggerType: "explicit",
        invocationKind: "cli-stage",
        logicalUnitId: "codegen-fixed-arguments",
        enabled: true,
      },
      {
        routeInvocationId: "codegen-generation-start",
        phase: "generation-start",
        triggerType: "explicit",
        invocationKind: "cli-stage",
        logicalUnitId: "codegen-generation",
        enabled: true,
      },
      {
        routeInvocationId: "codegen-file-write",
        phase: "file-write",
        triggerType: "explicit",
        invocationKind: "cli-stage",
        logicalUnitId: "codegen-output",
        enabled: true,
      },
      {
        routeInvocationId: "codegen-completion",
        phase: "completion",
        triggerType: "explicit",
        invocationKind: "cli-stage",
        logicalUnitId: "codegen-cli-completion",
        enabled: true,
      },
    ],
    toolApiTargets: [
      {
        targetId: "codegen-generated-artifact",
        classification: "artifact",
      },
    ],
    toolApiChanges: [
      {
        toolApiChangeId: "codegen-generation-api-change",
        phase: "generation-api",
        triggerType: "explicit",
        changeKind: "emitted-asset",
        targetId: "codegen-generated-artifact",
        enabled: true,
      },
    ],
  };
}

function commonEvent(
  runId: string,
  scenarioId: CodegenScenarioDefinition["scenarioId"],
  producerSequence: number,
  phase: string,
) {
  return {
    schemaVersion: PROBE_EVENT_SCHEMA_VERSION,
    runId,
    scenarioId,
    route: "codegen-cli" as const,
    triggerType: "explicit" as const,
    adapterVersion: "0.0.0",
    producerId: "codegen-cli-producer",
    producerSequence,
    phase,
    timestamp: "2026-07-20T00:00:00.000Z",
    durationMs: 1,
    pid: 20,
    ppid: 1,
    workerId: null,
    cwdId: "codegen-adapter-workspace",
    nodeVersion: "v20.18.2",
    toolName: "codegen",
    toolVersion: "0.0.0",
  };
}

function routeEvent(
  runId: string,
  scenarioId: CodegenScenarioDefinition["scenarioId"],
  producerSequence: number,
  routeIndex: number,
): ProbeEvent {
  const definition = manifest(runId, scenarioId).routeInvocations[routeIndex];
  if (definition === undefined) throw new Error("missing route definition");
  return {
    ...commonEvent(runId, scenarioId, producerSequence, definition.phase),
    eventKind: "route-invocation",
    routeInvocationId: definition.routeInvocationId,
    invocationKind: definition.invocationKind,
    logicalUnitId: definition.logicalUnitId,
    outcome: "success",
    normalizedErrorCode: null,
  };
}

function attemptEvent(
  profile: CodegenProfileId,
  runId: string,
  scenarioId: CodegenScenarioDefinition["scenarioId"],
  producerSequence: number,
  attemptIndex: number,
): ProbeEvent {
  const attempts = manifest(runId, scenarioId).attempts;
  const attempt = attempts[attemptIndex];
  if (attempt === undefined) throw new Error("missing attempt definition");
  const success = profile === "permissive" || attempt.type === "file-hash";
  const failureCodes = [
    "ENVIRONMENT_VARIABLE_ABSENT",
    "READ_DENIED",
    null,
    "WRITE_DENIED",
    "NETWORK_FAILURE",
    "CHILD_PROCESS_FAILURE",
  ] as const;
  const normalizedErrorCode = success
    ? null
    : (failureCodes[attemptIndex] ?? null);
  const base = {
    ...commonEvent(runId, scenarioId, producerSequence, "generation-start"),
    eventKind: "capability-attempt" as const,
    attemptId: attempt.attemptId,
    attemptType: attempt.type,
    targetId: attempt.targetId,
    outcome: success ? ("success" as const) : ("failure" as const),
    normalizedErrorCode,
    beforeHash: null,
    afterHash: null,
  };
  switch (attempt.type) {
    case "environment-canary-read":
      return {
        ...base,
        attemptType: attempt.type,
        details: {
          kind: "environment",
          present: success,
          byteLength: success ? 8 : null,
        },
      };
    case "canary-file-read":
      return {
        ...base,
        attemptType: attempt.type,
        details: {
          kind: "file-read",
          present: true,
          regularFile: true,
          readSucceeded: success,
          sizeBytes: 8,
        },
      };
    case "file-hash":
      return {
        ...base,
        attemptType: attempt.type,
        beforeHash: SOURCE_DIGEST,
        details: { kind: "file-hash", state: "present", sizeBytes: 8 },
      };
    case "direct-filesystem-write":
      return {
        ...base,
        attemptType: attempt.type,
        afterHash: success ? SOURCE_DIGEST : null,
        details: {
          kind: "file-write",
          markerSchemaVersion: "probe-marker/v1",
        },
      };
    case "loopback-connect":
      return {
        ...base,
        attemptType: attempt.type,
        details: {
          kind: "loopback",
          statusCode: success ? 200 : null,
          timedOut: false,
          protocolVerified: success,
          bodyBytes: success ? 17 : 0,
        },
      };
    case "child-node-process":
      return {
        ...base,
        attemptType: attempt.type,
        details: {
          kind: "child",
          exitCode: success ? 0 : 1,
          timedOut: false,
          responseVerified: success,
          stdoutBytes: success ? 20 : 0,
          stderrBytes: 0,
        },
      };
  }
}

function events(
  profile: CodegenProfileId,
  runId: string,
  scenarioId: CodegenScenarioDefinition["scenarioId"],
): ProbeEvent[] {
  const output: ProbeEvent[] = [
    routeEvent(runId, scenarioId, 0, 0),
    routeEvent(runId, scenarioId, 1, 1),
    routeEvent(runId, scenarioId, 2, 2),
  ];
  for (let index = 0; index < 6; index += 1) {
    output.push(attemptEvent(profile, runId, scenarioId, index + 3, index));
  }
  output.push({
    ...commonEvent(runId, scenarioId, 9, "generation-api"),
    eventKind: "tool-api-change",
    toolApiChangeId: "codegen-generation-api-change",
    changeKind: "emitted-asset",
    targetId: "codegen-generated-artifact",
    targetClassification: "artifact",
    outcome: "skipped",
    normalizedErrorCode: "NOT_APPLICABLE",
    changed: false,
    beforeHash: null,
    afterHash: null,
    byteSizeBefore: null,
    byteSizeAfter: null,
  });
  output.push(routeEvent(runId, scenarioId, 10, 3));
  output.push(routeEvent(runId, scenarioId, 11, 4));
  return output;
}

interface RawFixture {
  readonly runId: string;
  readonly snapshot: CodegenScenarioSnapshot;
  readonly completion: RunCompletion;
  readonly manifestBytes: Uint8Array;
  readonly completionBytes: Uint8Array;
  readonly segmentBytes: Uint8Array;
}

function rawFixture(
  profile: CodegenProfileId,
  runId = `m3-codegen-${profile}-test`,
  transform?: (events: ProbeEvent[]) => ProbeEvent[],
): RawFixture {
  const scenario = definition(profile);
  const snapshot = validateCodegenScenarioSnapshot({
    schemaVersion: CODEGEN_SCENARIO_SNAPSHOT_SCHEMA_VERSION,
    runId,
    scenarioId: scenario.scenarioId,
    adapterId: scenario.adapterId,
    evidenceClass: scenario.evidenceClass,
    profileId: scenario.profileId,
    outputLocation: scenario.outputLocation,
    producerId: scenario.producerId,
    segmentId: scenario.segmentId,
    expected: scenario.expected,
    runtimeContext: {
      profileRevision: "profile-revision-test",
      containerInput: CONTAINER_DIGEST,
      segmentRetention: "immutable-raw-input",
    },
    segments: [
      {
        segmentId: "codegen-cli-producer",
        producerId: "codegen-cli-producer",
        manifest: manifest(runId, scenario.scenarioId),
      },
    ],
  });
  const completion: RunCompletion = {
    schemaVersion: RUN_COMPLETION_SCHEMA_VERSION,
    scenarioStarted: true,
    toolTerminated: true,
    scenarioEnded: true,
    hashFinalized: true,
    timedOut: false,
    segmentCloses: [{ segmentId: "codegen-cli-producer", complete: true }],
  };
  const eventList =
    transform?.(events(profile, runId, scenario.scenarioId)) ??
    events(profile, runId, scenario.scenarioId);
  const segmentSource = `${eventList
    .map((event) => serializeProbeEvent(event, snapshot.segments[0].manifest))
    .join("\n")}\n`;
  return {
    runId,
    snapshot,
    completion,
    manifestBytes: new Uint8Array(Buffer.from(serializeJson(snapshot))),
    completionBytes: new Uint8Array(Buffer.from(serializeJson(completion))),
    segmentBytes: new Uint8Array(Buffer.from(segmentSource)),
  };
}

function collectRaw(raw: RawFixture) {
  return collectCodegenProductionRun({
    manifestSnapshotBytes: raw.manifestBytes,
    completionSnapshotBytes: raw.completionBytes,
    segmentBytes: raw.segmentBytes,
  });
}

async function writeRawRoot(
  raw: RawFixture,
): Promise<{ readonly root: string; readonly runRoot: string }> {
  const root = await mkdtemp("/tmp/tskaigi-m3-codegen-");
  const runRoot = path.join(root, raw.runId);
  const rawRoot = path.join(runRoot, "raw");
  const segmentRoot = path.join(rawRoot, "segments");
  await mkdir(segmentRoot, { recursive: true, mode: 0o700 });
  await chmod(runRoot, 0o700);
  await chmod(rawRoot, 0o700);
  await chmod(segmentRoot, 0o700);
  await writeFile(
    path.join(rawRoot, "manifest.snapshot.json"),
    raw.manifestBytes,
    { flag: "wx", mode: 0o600 },
  );
  await writeFile(
    path.join(rawRoot, "run-completion.snapshot.json"),
    raw.completionBytes,
    { flag: "wx", mode: 0o600 },
  );
  await writeFile(
    path.join(segmentRoot, "codegen-cli-producer.jsonl"),
    raw.segmentBytes,
    { flag: "wx", mode: 0o600 },
  );
  return { root, runRoot };
}

async function rawBytes(runRoot: string): Promise<readonly Buffer[]> {
  return Promise.all([
    readFile(path.join(runRoot, "raw/manifest.snapshot.json")),
    readFile(path.join(runRoot, "raw/run-completion.snapshot.json")),
    readFile(path.join(runRoot, "raw/segments/codegen-cli-producer.jsonl")),
  ]);
}

async function namesOrNull(directoryPath: string): Promise<string[] | null> {
  try {
    return (await readdir(directoryPath)).sort();
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { readonly code?: unknown }).code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}

describe("M3 codegen production pure v3 boundary", () => {
  it("accepts exactly the two fixed additive scenario definitions", () => {
    const permissive = definition("permissive");
    const constrained = definition("constrained");
    expect(permissive.schemaVersion).toBe("lab-scenario-definition/v3");
    expect(constrained.profileId).toBe("constrained");
    expect(permissive.expected.routes).toHaveLength(5);
    expect(permissive.expected.attempts).toHaveLength(6);
    expect(permissive.expected.hashes.map((item) => item.state)).toEqual([
      "unavailable",
      "unavailable",
    ]);
    const drift = structuredClone(permissive) as unknown as {
      adapterId: string;
    };
    drift.adapterId = "vite";
    expect(() => validateCodegenScenarioDefinition(drift)).toThrowError();
  });

  it("rejects Proxy, accessor, custom prototype, hidden key, and shared bytes", () => {
    const scenario = structuredClone(definition("permissive"));
    expect(() =>
      validateCodegenScenarioDefinition(new Proxy(scenario, {})),
    ).toThrowError();
    const accessor = structuredClone(scenario) as unknown as Record<
      string,
      unknown
    >;
    Object.defineProperty(accessor, "adapterId", { get: () => "codegen" });
    expect(() => validateCodegenScenarioDefinition(accessor)).toThrowError();
    const custom = Object.assign(Object.create({ inherited: true }), scenario);
    expect(() => validateCodegenScenarioDefinition(custom)).toThrowError();
    const hidden = structuredClone(scenario) as unknown as Record<
      string,
      unknown
    >;
    Object.defineProperty(hidden, "hidden", { value: true });
    expect(() => validateCodegenScenarioDefinition(hidden)).toThrowError();
    const raw = rawFixture("permissive");
    const shared = new Uint8Array(
      new SharedArrayBuffer(raw.segmentBytes.length),
    );
    shared.set(raw.segmentBytes);
    expect(
      collectCodegenProductionRun({
        manifestSnapshotBytes: raw.manifestBytes,
        completionSnapshotBytes: raw.completionBytes,
        segmentBytes: shared,
      }).validity,
    ).toBe("inconclusive");
  });

  it("derives the exact permissive identity-bearing five-file result", () => {
    const result = collectRaw(rawFixture("permissive"));
    expect(result.validity).toBe("complete");
    if (result.validity !== "complete") throw new Error("expected complete");
    expect(Object.keys(result.files).sort()).toEqual([
      "comparison.md",
      "events.jsonl",
      "hashes.json",
      "run-metadata.json",
      "summary.json",
    ]);
    expect(result.summary.counts).toEqual({
      totalEvents: 12,
      routeInvocations: 5,
      capabilityAttempts: 6,
      toolApiChanges: 1,
    });
    expect(result.summary.comparison.matches).toBe(true);
    expect(result.hashes.records.map((record) => record.state)).toEqual([
      "unavailable",
      "unavailable",
    ]);
    expect(result.metadata.rawInputs).toHaveLength(3);
    const output = Object.values(result.files).join("\n");
    expect(output).not.toContain("PROBE_CANARY_M2E_ENVIRONMENT");
    expect(output).not.toContain("/tmp/");
    expect(output).not.toContain("raw-output-content");
  });

  it("accepts constrained alternatives and keeps an unexpected outcome as a complete mismatch", () => {
    const accepted = collectRaw(rawFixture("constrained"));
    expect(accepted.validity).toBe("complete");
    if (accepted.validity !== "complete") throw new Error("expected complete");
    expect(accepted.summary.comparison.matches).toBe(true);

    const mismatch = rawFixture(
      "constrained",
      "m3-codegen-constrained-mismatch",
      (eventList) => {
        const fileRead = eventList[4];
        if (
          fileRead === undefined ||
          fileRead.eventKind !== "capability-attempt" ||
          fileRead.attemptType !== "canary-file-read"
        ) {
          throw new Error("missing file-read event");
        }
        eventList[4] = { ...fileRead, normalizedErrorCode: "INTERNAL_ERROR" };
        return eventList;
      },
    );
    const mismatched = collectRaw(mismatch);
    expect(mismatched.validity).toBe("complete");
    if (mismatched.validity !== "complete") {
      throw new Error("expected complete mismatch");
    }
    expect(mismatched.summary.comparison.matches).toBe(false);
  });

  it("keeps a cross-kind event permutation visible as a complete Expected mismatch", () => {
    const reordered = rawFixture(
      "permissive",
      "m3-codegen-cross-kind-order-mismatch",
      (eventList) =>
        [
          ...eventList.slice(0, 3),
          ...eventList.slice(10, 12),
          ...eventList.slice(3, 10),
        ].map((event, producerSequence) => ({
          ...event,
          producerSequence,
        })) as ProbeEvent[],
    );
    const result = collectRaw(reordered);
    expect(result.validity).toBe("complete");
    if (result.validity !== "complete") {
      throw new Error("expected complete order mismatch");
    }
    const orderRecords = result.summary.comparison.records.filter((record) =>
      record.identity.startsWith("event-order:"),
    );
    expect(orderRecords).toHaveLength(12);
    expect(orderRecords.some((record) => !record.matches)).toBe(true);
    expect(
      result.summary.comparison.records
        .filter((record) => !record.identity.startsWith("event-order:"))
        .every((record) => record.matches),
    ).toBe(true);
    expect(result.summary.comparison.matches).toBe(false);
  });

  it("emits only sanitized null/unavailable files for safely captured corrupt content", () => {
    const raw = rawFixture("permissive");
    const result = collectCodegenProductionRun({
      manifestSnapshotBytes: raw.manifestBytes,
      completionSnapshotBytes: raw.completionBytes,
      segmentBytes: new Uint8Array(Buffer.from("not-json\n")),
    });
    expect(result.validity).toBe("inconclusive");
    expect(Object.keys(result.files).sort()).toEqual([
      "run-metadata.json",
      "summary.json",
    ]);
    expect(result.metadata.rawInputs).toBeNull();
    expect(Object.values(result.files).join("\n")).not.toContain("not-json");
  });

  it("is byte-deterministic for equal raw input", () => {
    const raw = rawFixture("permissive", "m3-codegen-deterministic");
    const first = collectRaw(raw);
    const second = collectRaw({
      ...raw,
      manifestBytes: raw.manifestBytes.slice(),
      completionBytes: raw.completionBytes.slice(),
      segmentBytes: raw.segmentBytes.slice(),
    });
    expect(second.files).toEqual(first.files);
  });

  it("exports only pure v3 functions from the package root", async () => {
    const root = await import("../src/index.js");
    expect(root.collectCodegenProductionRun).toBeTypeOf("function");
    expect(root.validateCodegenScenarioSnapshot).toBeTypeOf("function");
    expect(root).not.toHaveProperty("collectCodegenProductionRunInOwnedRoot");
  });
});

describe("M3 codegen production filesystem transaction", () => {
  it("commits exactly five files after R1/R2 and preserves raw bytes", async () => {
    const raw = rawFixture("permissive", "m3-codegen-fs-success");
    const fixture = await writeRawRoot(raw);
    try {
      const before = await rawBytes(fixture.runRoot);
      const checkpoints: CodegenProductionCheckpoint[] = [];
      const result = await collectCodegenProductionRunInOwnedRoot(
        fixture.root,
        raw.runId,
        {
          checkpoint: (checkpoint) => {
            checkpoints.push(checkpoint);
          },
        },
      );
      expect(result).toEqual({
        status: "committed",
        validity: "complete",
        files: [
          "comparison.md",
          "events.jsonl",
          "hashes.json",
          "run-metadata.json",
          "summary.json",
        ],
      });
      expect(await namesOrNull(path.join(fixture.runRoot, "derived"))).toEqual(
        result.status === "committed" ? result.files : [],
      );
      expect(
        await namesOrNull(path.join(fixture.runRoot, "derived.staging")),
      ).toBeNull();
      expect(await rawBytes(fixture.runRoot)).toEqual(before);
      expect(checkpoints).toContain("before-r1");
      expect(checkpoints).toContain("before-r2");
      expect(
        checkpoints.filter((item) => item.startsWith("after-open:")),
      ).toHaveLength(12);
      expect(checkpoints.at(-1)).toBe("before-rename");
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });

  it("commits only the two-file Inconclusive inventory for captured corrupt content", async () => {
    const valid = rawFixture("permissive", "m3-codegen-fs-inconclusive");
    const raw = {
      ...valid,
      segmentBytes: new Uint8Array(Buffer.from("bad\n")),
    };
    const fixture = await writeRawRoot(raw);
    try {
      const before = await rawBytes(fixture.runRoot);
      const result = await collectCodegenProductionRunInOwnedRoot(
        fixture.root,
        raw.runId,
      );
      expect(result).toEqual({
        status: "committed",
        validity: "inconclusive",
        files: ["run-metadata.json", "summary.json"],
      });
      expect(await namesOrNull(path.join(fixture.runRoot, "derived"))).toEqual([
        "run-metadata.json",
        "summary.json",
      ]);
      expect(await rawBytes(fixture.runRoot)).toEqual(before);
      const derived = await readFile(
        path.join(fixture.runRoot, "derived/summary.json"),
        "utf8",
      );
      expect(derived).not.toContain("bad");
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });

  it("produces byte-identical derived files in two distinct clean roots", async () => {
    const raw = rawFixture("permissive", "m3-codegen-two-clean-roots");
    const first = await writeRawRoot(raw);
    const second = await writeRawRoot(raw);
    try {
      expect(
        await collectCodegenProductionRunInOwnedRoot(first.root, raw.runId),
      ).toMatchObject({ status: "committed", validity: "complete" });
      expect(
        await collectCodegenProductionRunInOwnedRoot(second.root, raw.runId),
      ).toMatchObject({ status: "committed", validity: "complete" });
      const names = await readdir(path.join(first.runRoot, "derived"));
      for (const name of names) {
        expect(
          await readFile(path.join(first.runRoot, "derived", name)),
        ).toEqual(await readFile(path.join(second.runRoot, "derived", name)));
      }
    } finally {
      await rm(first.root, { recursive: true, force: true });
      await rm(second.root, { recursive: true, force: true });
    }
  });

  for (const checkpoint of ["before-r1", "before-r2"] as const) {
    it(`rejects same-size held-descriptor content mutation at ${checkpoint}`, async () => {
      const raw = rawFixture("permissive", `m3-codegen-mutation-${checkpoint}`);
      const fixture = await writeRawRoot(raw);
      try {
        const segmentPath = path.join(
          fixture.runRoot,
          "raw/segments/codegen-cli-producer.jsonl",
        );
        const original = await readFile(segmentPath);
        const mutated = Buffer.from(original);
        mutated[0] = mutated[0] === 0x7b ? 0x5b : 0x7b;
        const result = await collectCodegenProductionRunInOwnedRoot(
          fixture.root,
          raw.runId,
          {
            checkpoint: async (current) => {
              if (current === checkpoint) await writeFile(segmentPath, mutated);
            },
          },
        );
        expect(result.status).toBe("filesystem-rejected");
        expect(await readFile(segmentPath)).toEqual(mutated);
        expect(
          await namesOrNull(path.join(fixture.runRoot, "derived")),
        ).toBeNull();
        const staging = await namesOrNull(
          path.join(fixture.runRoot, "derived.staging"),
        );
        if (checkpoint === "before-r1") expect(staging).toBeNull();
        else expect(staging).toHaveLength(5);
      } finally {
        await rm(fixture.root, { recursive: true, force: true });
      }
    });
  }

  it("rejects logical-path replacement and staged replacement without cleanup", async () => {
    const raw = rawFixture("permissive", "m3-codegen-path-replacement");
    const fixture = await writeRawRoot(raw);
    try {
      const manifestPath = path.join(
        fixture.runRoot,
        "raw/manifest.snapshot.json",
      );
      const movedPath = path.join(fixture.runRoot, "raw/manifest.moved.json");
      const result = await collectCodegenProductionRunInOwnedRoot(
        fixture.root,
        raw.runId,
        {
          checkpoint: async (checkpoint) => {
            if (checkpoint === "before-r1") {
              await rename(manifestPath, movedPath);
              await writeFile(manifestPath, raw.manifestBytes, {
                flag: "wx",
                mode: 0o600,
              });
            }
          },
        },
      );
      expect(result.status).toBe("filesystem-rejected");
      expect(
        await namesOrNull(path.join(fixture.runRoot, "derived")),
      ).toBeNull();
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }

    const stagedRaw = rawFixture("permissive", "m3-codegen-stage-replacement");
    const stagedFixture = await writeRawRoot(stagedRaw);
    try {
      const stagedSummary = path.join(
        stagedFixture.runRoot,
        "derived.staging/summary.json",
      );
      const result = await collectCodegenProductionRunInOwnedRoot(
        stagedFixture.root,
        stagedRaw.runId,
        {
          checkpoint: async (checkpoint) => {
            if (checkpoint === "before-r2") {
              const moved = `${stagedSummary}.moved`;
              await rename(stagedSummary, moved);
              await writeFile(stagedSummary, "{}\n", {
                flag: "wx",
                mode: 0o600,
              });
            }
          },
        },
      );
      expect(result.status).toBe("filesystem-rejected");
      expect(
        await namesOrNull(path.join(stagedFixture.runRoot, "derived")),
      ).toBeNull();
      expect(
        await namesOrNull(path.join(stagedFixture.runRoot, "derived.staging")),
      ).toContain("summary.json.moved");
    } finally {
      await rm(stagedFixture.root, { recursive: true, force: true });
    }
  });

  for (const drift of ["descriptor", "ancestor"] as const) {
    it(`rejects ${drift} identity drift before commit`, async () => {
      const raw = rawFixture("permissive", `m3-codegen-${drift}-drift`);
      const fixture = await writeRawRoot(raw);
      try {
        const segmentPath = path.join(
          fixture.runRoot,
          "raw/segments/codegen-cli-producer.jsonl",
        );
        const segmentRoot = path.dirname(segmentPath);
        const result = await collectCodegenProductionRunInOwnedRoot(
          fixture.root,
          raw.runId,
          {
            checkpoint: async (checkpoint) => {
              if (checkpoint !== "before-r1") return;
              if (drift === "descriptor") await chmod(segmentPath, 0o640);
              else {
                await rename(segmentRoot, `${segmentRoot}.moved`);
                await mkdir(segmentRoot, { mode: 0o700 });
              }
            },
          },
        );
        expect(result.status).toBe("filesystem-rejected");
        expect(
          await namesOrNull(path.join(fixture.runRoot, "derived")),
        ).toBeNull();
        expect(
          await namesOrNull(path.join(fixture.runRoot, "derived.staging")),
        ).toBeNull();
        if (drift === "descriptor") {
          expect((await lstat(segmentPath)).mode & 0o7777).toBe(0o640);
        } else {
          expect(await namesOrNull(`${segmentRoot}.moved`)).toEqual([
            "codegen-cli-producer.jsonl",
          ]);
        }
      } finally {
        await rm(fixture.root, { recursive: true, force: true });
      }
    });
  }

  it("settles every close failure before refusing rename and retaining staging", async () => {
    const labels = [
      "raw-manifest",
      "raw-completion",
      "raw-segment",
      "staged-comparison.md",
      "staged-events.jsonl",
      "staged-hashes.json",
      "staged-run-metadata.json",
      "staged-summary.json",
      "raw-directory",
      "run-directory",
      "segments-directory",
      "staging-directory",
    ];
    for (const [index, label] of labels.entries()) {
      const raw = rawFixture("permissive", `m3-codegen-close-${index}`);
      const fixture = await writeRawRoot(raw);
      try {
        const before = await rawBytes(fixture.runRoot);
        const seen: string[] = [];
        const result = await collectCodegenProductionRunInOwnedRoot(
          fixture.root,
          raw.runId,
          {
            checkpoint: (checkpoint) => {
              seen.push(checkpoint);
              if (checkpoint === `before-close:${label}`) {
                throw new Error("injected close failure");
              }
            },
          },
        );
        expect(result.status).toBe("filesystem-rejected");
        expect(
          seen.filter((item) => item.startsWith("before-close:")),
        ).toHaveLength(labels.length);
        expect(
          await namesOrNull(path.join(fixture.runRoot, "derived")),
        ).toBeNull();
        expect(
          await namesOrNull(path.join(fixture.runRoot, "derived.staging")),
        ).toEqual([
          "comparison.md",
          "events.jsonl",
          "hashes.json",
          "run-metadata.json",
          "summary.json",
        ]);
        expect(await rawBytes(fixture.runRoot)).toEqual(before);
      } finally {
        await rm(fixture.root, { recursive: true, force: true });
      }
    }
  });

  it("owns directory, raw-file, and staged-file descriptors before their first post-open fallible step", async () => {
    const cases = [
      { label: "raw-directory", stagingNames: null },
      { label: "raw-manifest", stagingNames: null },
      {
        label: "staged-run-metadata.json",
        stagingNames: [
          "comparison.md",
          "events.jsonl",
          "hashes.json",
          "run-metadata.json",
        ],
      },
    ] as const;
    for (const [index, testCase] of cases.entries()) {
      const raw = rawFixture(
        "permissive",
        `m3-codegen-post-open-settlement-${index}`,
      );
      const fixture = await writeRawRoot(raw);
      try {
        const before = await rawBytes(fixture.runRoot);
        const seen: string[] = [];
        const result = await collectCodegenProductionRunInOwnedRoot(
          fixture.root,
          raw.runId,
          {
            checkpoint: (checkpoint) => {
              seen.push(checkpoint);
              if (checkpoint === `after-open:${testCase.label}`) {
                throw new Error("injected first post-open failure");
              }
            },
          },
        );
        expect(result.status).toBe("filesystem-rejected");
        expect(seen).toContain(`after-open:${testCase.label}`);
        expect(seen).toContain(`before-close:${testCase.label}`);
        expect(seen.indexOf(`after-open:${testCase.label}`)).toBeLessThan(
          seen.indexOf(`before-close:${testCase.label}`),
        );
        expect(
          await namesOrNull(path.join(fixture.runRoot, "derived")),
        ).toBeNull();
        expect(
          await namesOrNull(path.join(fixture.runRoot, "derived.staging")),
        ).toEqual(testCase.stagingNames);
        expect(await rawBytes(fixture.runRoot)).toEqual(before);
      } finally {
        await rm(fixture.root, { recursive: true, force: true });
      }
    }
  });

  it("treats rename as the final fallible operation and never retries or cleans it", async () => {
    const raw = rawFixture("permissive", "m3-codegen-rename-failure");
    const fixture = await writeRawRoot(raw);
    try {
      const before = await rawBytes(fixture.runRoot);
      let renameAttempts = 0;
      const result = await collectCodegenProductionRunInOwnedRoot(
        fixture.root,
        raw.runId,
        {
          checkpoint: (checkpoint) => {
            if (checkpoint === "before-rename") {
              renameAttempts += 1;
              throw new Error("injected rename failure");
            }
          },
        },
      );
      expect(result.status).toBe("filesystem-rejected");
      expect(renameAttempts).toBe(1);
      expect(
        await namesOrNull(path.join(fixture.runRoot, "derived")),
      ).toBeNull();
      expect(
        await namesOrNull(path.join(fixture.runRoot, "derived.staging")),
      ).toHaveLength(5);
      expect(await rawBytes(fixture.runRoot)).toEqual(before);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });

  it("rejects extra, wrong-mode, symlink, and hard-link raw inventory", async () => {
    const cases: readonly ("extra" | "wrong-mode" | "symlink" | "hard-link")[] =
      ["extra", "wrong-mode", "symlink", "hard-link"];
    for (const [index, testCase] of cases.entries()) {
      const raw = rawFixture("permissive", `m3-codegen-inventory-${index}`);
      const fixture = await writeRawRoot(raw);
      try {
        const rawRoot = path.join(fixture.runRoot, "raw");
        const completionPath = path.join(
          rawRoot,
          "run-completion.snapshot.json",
        );
        if (testCase === "extra") {
          await writeFile(path.join(rawRoot, "extra"), "x", { mode: 0o600 });
        } else if (testCase === "wrong-mode") {
          await chmod(completionPath, 0o644);
        } else if (testCase === "symlink") {
          const moved = `${completionPath}.real`;
          await rename(completionPath, moved);
          await symlink(path.basename(moved), completionPath);
        } else {
          const manifestPath = path.join(rawRoot, "manifest.snapshot.json");
          await rm(completionPath);
          await link(manifestPath, completionPath);
        }
        const result = await collectCodegenProductionRunInOwnedRoot(
          fixture.root,
          raw.runId,
        );
        expect(result.status).toBe("filesystem-rejected");
        expect(
          await namesOrNull(path.join(fixture.runRoot, "derived")),
        ).toBeNull();
        expect(
          await namesOrNull(path.join(fixture.runRoot, "derived.staging")),
        ).toBeNull();
      } finally {
        await rm(fixture.root, { recursive: true, force: true });
      }
    }
  });

  it("uses private exact modes for committed output", async () => {
    const raw = rawFixture("permissive", "m3-codegen-modes");
    const fixture = await writeRawRoot(raw);
    try {
      const result = await collectCodegenProductionRunInOwnedRoot(
        fixture.root,
        raw.runId,
      );
      expect(result.status).toBe("committed");
      const directoryStatus = await lstat(
        path.join(fixture.runRoot, "derived"),
      );
      expect(directoryStatus.mode & 0o7777).toBe(0o700);
      for (const name of await readdir(path.join(fixture.runRoot, "derived"))) {
        const status = await lstat(path.join(fixture.runRoot, "derived", name));
        expect(status.mode & 0o7777).toBe(0o600);
        expect(status.isFile()).toBe(true);
      }
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });
});
