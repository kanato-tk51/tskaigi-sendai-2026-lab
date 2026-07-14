import { describe, expect, it } from "vitest";

import { validateProbeEvent } from "../src/index.js";
import { createProbeEventFactory, type ProbeEventDraft } from "../src/event.js";
import type { ProbeTarget } from "../src/index.js";
import { baseManifest, type TestCapabilityAttempt } from "./helpers.js";

const digest = `sha256:${"a".repeat(64)}` as const;

interface SemanticCase {
  readonly name: string;
  readonly target: ProbeTarget;
  readonly attempt: TestCapabilityAttempt;
  readonly valid: readonly ProbeEventDraft[];
  readonly invalid: readonly ProbeEventDraft[];
}

const semanticCases: readonly SemanticCase[] = [
  {
    name: "environment",
    target: {
      targetId: "target",
      kind: "environment",
      variableName: "PROBE_CANARY_SEMANTIC",
    },
    attempt: {
      attemptId: "attempt",
      type: "environment-canary-read",
      targetId: "target",
      enabled: true,
    },
    valid: [
      {
        attemptId: "attempt",
        attemptType: "environment-canary-read",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: null,
        details: { kind: "environment", present: true, byteLength: 3 },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "environment-canary-read",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: "ENVIRONMENT_VARIABLE_ABSENT",
        beforeHash: null,
        afterHash: null,
        details: { kind: "environment", present: false, byteLength: null },
        durationMs: 0,
      },
    ],
    invalid: [
      {
        attemptId: "attempt",
        attemptType: "environment-canary-read",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: "INTERNAL_ERROR",
        beforeHash: null,
        afterHash: null,
        details: { kind: "environment", present: true, byteLength: 3 },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "environment-canary-read",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: null,
        details: { kind: "environment", present: false, byteLength: null },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "environment-canary-read",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: digest,
        afterHash: null,
        details: { kind: "environment", present: true, byteLength: 3 },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "environment-canary-read",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: "NETWORK_FAILURE",
        beforeHash: null,
        afterHash: null,
        details: { kind: "environment", present: false, byteLength: null },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "environment-canary-read",
        targetId: "target",
        outcome: "skipped",
        normalizedErrorCode: "MANIFEST_DISALLOWED",
        beforeHash: null,
        afterHash: null,
        details: { kind: "environment", present: false, byteLength: null },
        durationMs: 0,
      },
    ],
  },
  {
    name: "file read",
    target: {
      targetId: "target",
      kind: "file-read",
      classification: "canary",
      maxBytes: 100,
    },
    attempt: {
      attemptId: "attempt",
      type: "canary-file-read",
      targetId: "target",
      enabled: true,
    },
    valid: [
      {
        attemptId: "attempt",
        attemptType: "canary-file-read",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "file-read",
          present: true,
          regularFile: true,
          readSucceeded: true,
          sizeBytes: 3,
        },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "canary-file-read",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: "FILE_NOT_FOUND",
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "file-read",
          present: false,
          regularFile: false,
          readSucceeded: false,
          sizeBytes: null,
        },
        durationMs: 0,
      },
    ],
    invalid: [
      {
        attemptId: "attempt",
        attemptType: "canary-file-read",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: digest,
        details: {
          kind: "file-read",
          present: true,
          regularFile: true,
          readSucceeded: true,
          sizeBytes: 3,
        },
        durationMs: 0,
      },
    ],
  },
  {
    name: "file write",
    target: {
      targetId: "target",
      kind: "file-write",
      classification: "output",
      maxBytes: 100,
    },
    attempt: {
      attemptId: "attempt",
      type: "direct-filesystem-write",
      targetId: "target",
      enabled: true,
    },
    valid: [
      {
        attemptId: "attempt",
        attemptType: "direct-filesystem-write",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: digest,
        details: {
          kind: "file-write",
          markerSchemaVersion: "probe-marker/v1",
        },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "direct-filesystem-write",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: "WRITE_DENIED",
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "file-write",
          markerSchemaVersion: "probe-marker/v1",
        },
        durationMs: 0,
      },
    ],
    invalid: [
      {
        attemptId: "attempt",
        attemptType: "direct-filesystem-write",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: "WRITE_DENIED",
        beforeHash: null,
        afterHash: digest,
        details: {
          kind: "file-write",
          markerSchemaVersion: "probe-marker/v1",
        },
        durationMs: 0,
      },
    ],
  },
  {
    name: "network",
    target: { targetId: "target", kind: "loopback-http", timeoutMs: 100 },
    attempt: {
      attemptId: "attempt",
      type: "loopback-connect",
      targetId: "target",
      enabled: true,
    },
    valid: [
      {
        attemptId: "attempt",
        attemptType: "loopback-connect",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "loopback",
          statusCode: 200,
          timedOut: false,
          protocolVerified: true,
          bodyBytes: 17,
        },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "loopback-connect",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: "NETWORK_TIMEOUT",
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "loopback",
          statusCode: null,
          timedOut: true,
          protocolVerified: false,
          bodyBytes: 0,
        },
        durationMs: 0,
      },
    ],
    invalid: [
      {
        attemptId: "attempt",
        attemptType: "loopback-connect",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: "NETWORK_TIMEOUT",
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "loopback",
          statusCode: null,
          timedOut: false,
          protocolVerified: false,
          bodyBytes: 0,
        },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "loopback-connect",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "loopback",
          statusCode: null,
          timedOut: false,
          protocolVerified: false,
          bodyBytes: 0,
        },
        durationMs: 0,
      },
    ],
  },
  {
    name: "fixed child",
    target: {
      targetId: "target",
      kind: "fixed-child",
      timeoutMs: 100,
      maxOutputBytes: 100,
    },
    attempt: {
      attemptId: "attempt",
      type: "child-node-process",
      targetId: "target",
      enabled: true,
    },
    valid: [
      {
        attemptId: "attempt",
        attemptType: "child-node-process",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "child",
          exitCode: 0,
          timedOut: false,
          responseVerified: true,
          stdoutBytes: 20,
          stderrBytes: 0,
        },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "child-node-process",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: "CHILD_PROCESS_FAILURE",
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "child",
          exitCode: 1,
          timedOut: false,
          responseVerified: false,
          stdoutBytes: 0,
          stderrBytes: 0,
        },
        durationMs: 0,
      },
    ],
    invalid: [
      {
        attemptId: "attempt",
        attemptType: "child-node-process",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "child",
          exitCode: 0,
          timedOut: false,
          responseVerified: false,
          stdoutBytes: 20,
          stderrBytes: 0,
        },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "child-node-process",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: "CHILD_PROCESS_TIMEOUT",
        beforeHash: null,
        afterHash: null,
        details: {
          kind: "child",
          exitCode: 0,
          timedOut: true,
          responseVerified: false,
          stdoutBytes: 0,
          stderrBytes: 0,
        },
        durationMs: 0,
      },
    ],
  },
  {
    name: "file hash",
    target: {
      targetId: "target",
      kind: "file-hash",
      classification: "source",
      maxBytes: 100,
    },
    attempt: {
      attemptId: "attempt",
      type: "file-hash",
      targetId: "target",
      enabled: true,
      hashPosition: "before",
    },
    valid: [
      {
        attemptId: "attempt",
        attemptType: "file-hash",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: digest,
        afterHash: null,
        details: { kind: "file-hash", state: "present", sizeBytes: 3 },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "file-hash",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: "FILE_NOT_FOUND",
        beforeHash: null,
        afterHash: null,
        details: { kind: "file-hash", state: "missing", sizeBytes: null },
        durationMs: 0,
      },
    ],
    invalid: [
      {
        attemptId: "attempt",
        attemptType: "file-hash",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: null,
        details: { kind: "file-hash", state: "present", sizeBytes: 3 },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "file-hash",
        targetId: "target",
        outcome: "failure",
        normalizedErrorCode: "FILE_NOT_FOUND",
        beforeHash: null,
        afterHash: null,
        details: { kind: "file-hash", state: "present", sizeBytes: 3 },
        durationMs: 0,
      },
      {
        attemptId: "attempt",
        attemptType: "file-hash",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: digest,
        details: { kind: "file-hash", state: "present", sizeBytes: 3 },
        durationMs: 0,
      },
    ],
  },
  {
    name: "disabled attempt",
    target: {
      targetId: "target",
      kind: "environment",
      variableName: "PROBE_CANARY_DISABLED_SEMANTIC",
    },
    attempt: {
      attemptId: "attempt",
      type: "environment-canary-read",
      targetId: "target",
      enabled: false,
    },
    valid: [
      {
        attemptId: "attempt",
        attemptType: "environment-canary-read",
        targetId: "target",
        outcome: "skipped",
        normalizedErrorCode: "MANIFEST_DISALLOWED",
        beforeHash: null,
        afterHash: null,
        details: { kind: "skipped" },
        durationMs: 0,
      },
    ],
    invalid: [
      {
        attemptId: "attempt",
        attemptType: "environment-canary-read",
        targetId: "target",
        outcome: "success",
        normalizedErrorCode: null,
        beforeHash: null,
        afterHash: null,
        details: { kind: "environment", present: true, byteLength: 1 },
        durationMs: 0,
      },
    ],
  },
];

describe("attempt-specific event semantic invariants", () => {
  for (const testCase of semanticCases) {
    it(`accepts valid and rejects inconsistent ${testCase.name} events in validator and factory`, () => {
      const manifest = baseManifest([testCase.target], [testCase.attempt]);
      for (const draft of testCase.valid) {
        const event = createProbeEventFactory(manifest).create(draft);
        expect(validateProbeEvent(event, manifest)).toEqual(event);
      }

      const baseEvent = createProbeEventFactory(manifest).create(
        testCase.valid[0]!,
      );
      for (const draft of testCase.invalid) {
        expect(() =>
          createProbeEventFactory(manifest).create(draft),
        ).toThrowError(
          expect.objectContaining({ code: "SERIALIZATION_FAILURE" }),
        );
        expect(() =>
          validateProbeEvent({ ...baseEvent, ...draft }, manifest),
        ).toThrowError(
          expect.objectContaining({ code: "SERIALIZATION_FAILURE" }),
        );
      }
    });
  }
});
