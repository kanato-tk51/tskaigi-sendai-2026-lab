import type {
  ATTEMPT_TYPES,
  EVENT_KINDS,
  INVOCATION_KINDS,
  NORMALIZED_ERROR_CODES,
  OUTCOMES,
  PROBE_EVENT_SCHEMA_VERSION,
  PROBE_MANIFEST_SCHEMA_VERSION,
  PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION,
  ROUTES,
  TOOL_API_CHANGE_KINDS,
  TRIGGER_TYPES,
} from "./constants.js";

export type Route = (typeof ROUTES)[number];
export type Phase = string;
export type TriggerType = (typeof TRIGGER_TYPES)[number];
export type EventKind = (typeof EVENT_KINDS)[number];
export type InvocationKind = (typeof INVOCATION_KINDS)[number];
export type ToolApiChangeKind = (typeof TOOL_API_CHANGE_KINDS)[number];
export type AttemptType = (typeof ATTEMPT_TYPES)[number];
export type Outcome = (typeof OUTCOMES)[number];
export type NormalizedErrorCode = (typeof NORMALIZED_ERROR_CODES)[number];
export type Sha256Digest = `sha256:${string}`;

export type JsonValue =
  null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

interface TargetBase {
  readonly targetId: string;
}

export interface EnvironmentTarget extends TargetBase {
  readonly kind: "environment";
  readonly variableName: string;
}

export interface FileReadTarget extends TargetBase {
  readonly kind: "file-read";
  readonly classification: "canary";
  readonly maxBytes: number;
}

export interface FileWriteTarget extends TargetBase {
  readonly kind: "file-write";
  readonly classification: "output";
  readonly maxBytes: number;
}

export interface FileHashTarget extends TargetBase {
  readonly kind: "file-hash";
  readonly classification: "source" | "artifact";
  readonly maxBytes: number;
}

export interface LoopbackHttpTarget extends TargetBase {
  readonly kind: "loopback-http";
  readonly timeoutMs: number;
}

export interface FixedChildTarget extends TargetBase {
  readonly kind: "fixed-child";
  readonly timeoutMs: number;
  readonly maxOutputBytes: number;
}

export interface EventSegmentTarget extends TargetBase {
  readonly kind: "event-segment";
}

export type ProbeTarget =
  | EnvironmentTarget
  | FileReadTarget
  | FileWriteTarget
  | FileHashTarget
  | LoopbackHttpTarget
  | FixedChildTarget
  | EventSegmentTarget;

interface AttemptBase {
  readonly attemptId: string;
  readonly targetId: string;
  readonly phase: Phase;
  readonly triggerType: TriggerType;
  readonly enabled: boolean;
}

export interface EnvironmentAttempt extends AttemptBase {
  readonly type: "environment-canary-read";
}

export interface FileReadAttempt extends AttemptBase {
  readonly type: "canary-file-read";
}

export interface FileWriteAttempt extends AttemptBase {
  readonly type: "direct-filesystem-write";
}

export interface LoopbackAttempt extends AttemptBase {
  readonly type: "loopback-connect";
}

export interface FixedChildAttempt extends AttemptBase {
  readonly type: "child-node-process";
}

export interface FileHashAttempt extends AttemptBase {
  readonly type: "file-hash";
  readonly hashPosition: "before" | "after";
}

export type CapabilityAttempt =
  | EnvironmentAttempt
  | FileReadAttempt
  | FileWriteAttempt
  | LoopbackAttempt
  | FixedChildAttempt
  | FileHashAttempt;

export interface RouteInvocationDefinition {
  readonly routeInvocationId: string;
  readonly phase: Phase;
  readonly triggerType: TriggerType;
  readonly invocationKind: InvocationKind;
  readonly logicalUnitId: string;
  readonly enabled: boolean;
}

export interface ToolApiTarget {
  readonly targetId: string;
  readonly classification: "source" | "artifact";
}

export interface ToolApiChangeDefinition {
  readonly toolApiChangeId: string;
  readonly phase: Phase;
  readonly triggerType: TriggerType;
  readonly changeKind: ToolApiChangeKind;
  readonly targetId: string;
  readonly enabled: boolean;
}

export interface ProbeManifest {
  readonly schemaVersion: typeof PROBE_MANIFEST_SCHEMA_VERSION;
  readonly runId: string;
  readonly scenarioId: string;
  readonly route: Route;
  readonly phases: readonly Phase[];
  readonly triggerTypes: readonly TriggerType[];
  readonly adapterVersion: string;
  readonly producerId: string;
  readonly workerId: string | null;
  readonly cwdId: string;
  readonly toolName: string;
  readonly toolVersion: string;
  readonly eventSinkTargetId: string;
  readonly targets: readonly ProbeTarget[];
  readonly attempts: readonly CapabilityAttempt[];
  readonly routeInvocations: readonly RouteInvocationDefinition[];
  readonly toolApiTargets: readonly ToolApiTarget[];
  readonly toolApiChanges: readonly ToolApiChangeDefinition[];
}

interface RuntimeBindingBase {
  readonly targetId: string;
}

export interface PathRuntimeBinding extends RuntimeBindingBase {
  readonly kind: "path";
  readonly rootPath: string;
  readonly relativePath: string;
}

export interface LoopbackRuntimeBinding extends RuntimeBindingBase {
  readonly kind: "loopback-http";
  readonly address: "127.0.0.1" | "::1";
  readonly port: number;
}

export interface EnvironmentRuntimeBinding extends RuntimeBindingBase {
  readonly kind: "environment";
}

export interface FixedChildRuntimeBinding extends RuntimeBindingBase {
  readonly kind: "fixed-child";
}

export type RuntimeBinding =
  | PathRuntimeBinding
  | LoopbackRuntimeBinding
  | EnvironmentRuntimeBinding
  | FixedChildRuntimeBinding;

export interface ProbeRuntimeBindings {
  readonly schemaVersion: typeof PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION;
  readonly bindings: readonly RuntimeBinding[];
}

declare const validatedConfigurationBrand: unique symbol;
declare const preparedConfigurationBrand: unique symbol;

export interface ValidatedProbeConfiguration {
  readonly manifest: ProbeManifest;
  readonly runtimeBindings: ProbeRuntimeBindings;
  readonly [validatedConfigurationBrand]: true;
}

export interface PreparedProbeConfiguration {
  readonly manifest: ProbeManifest;
  readonly runtimeBindings: ProbeRuntimeBindings;
  readonly [preparedConfigurationBrand]: true;
}

export type ProbeEventDetails =
  | {
      readonly kind: "environment";
      readonly present: boolean;
      readonly byteLength: number | null;
    }
  | {
      readonly kind: "file-read";
      readonly present: boolean;
      readonly regularFile: boolean;
      readonly readSucceeded: boolean;
      readonly sizeBytes: number | null;
    }
  | {
      readonly kind: "file-write";
      readonly markerSchemaVersion: string;
    }
  | {
      readonly kind: "loopback";
      readonly statusCode: number | null;
      readonly timedOut: boolean;
      readonly protocolVerified: boolean;
      readonly bodyBytes: number;
    }
  | {
      readonly kind: "child";
      readonly exitCode: number | null;
      readonly timedOut: boolean;
      readonly responseVerified: boolean;
      readonly stdoutBytes: number;
      readonly stderrBytes: number;
    }
  | {
      readonly kind: "file-hash";
      readonly state: "present" | "missing" | "unavailable";
      readonly sizeBytes: number | null;
    }
  | { readonly kind: "skipped" };

interface ProbeEventCommon {
  readonly schemaVersion: typeof PROBE_EVENT_SCHEMA_VERSION;
  readonly eventKind: EventKind;
  readonly runId: string;
  readonly scenarioId: string;
  readonly route: Route;
  readonly phase: Phase;
  readonly triggerType: TriggerType;
  readonly adapterVersion: string;
  readonly producerId: string;
  readonly producerSequence: number;
  readonly timestamp: string;
  readonly durationMs: number;
  readonly pid: number;
  readonly ppid: number;
  readonly workerId: string | null;
  readonly cwdId: string;
  readonly nodeVersion: string;
  readonly toolName: string;
  readonly toolVersion: string;
  readonly outcome: Outcome;
  readonly normalizedErrorCode: NormalizedErrorCode | null;
}

export interface CapabilityAttemptEvent extends ProbeEventCommon {
  readonly eventKind: "capability-attempt";
  readonly attemptId: string;
  readonly attemptType: AttemptType;
  readonly targetId: string;
  readonly beforeHash: Sha256Digest | null;
  readonly afterHash: Sha256Digest | null;
  readonly details: ProbeEventDetails;
}

export interface RouteInvocationEvent extends ProbeEventCommon {
  readonly eventKind: "route-invocation";
  readonly routeInvocationId: string;
  readonly invocationKind: InvocationKind;
  readonly logicalUnitId: string;
}

export interface ToolApiChangeEvent extends ProbeEventCommon {
  readonly eventKind: "tool-api-change";
  readonly toolApiChangeId: string;
  readonly changeKind: ToolApiChangeKind;
  readonly targetId: string;
  readonly targetClassification: "source" | "artifact";
  readonly changed: boolean;
  readonly beforeHash: Sha256Digest | null;
  readonly afterHash: Sha256Digest | null;
  readonly byteSizeBefore: number | null;
  readonly byteSizeAfter: number | null;
}

export type ProbeEvent =
  CapabilityAttemptEvent | RouteInvocationEvent | ToolApiChangeEvent;

export interface RouteInvocationResultInput {
  readonly outcome: Outcome;
}

export interface ToolApiChangeResultInput {
  readonly outcome: Outcome;
  readonly changed: boolean;
  readonly beforeHash: Sha256Digest | null;
  readonly afterHash: Sha256Digest | null;
  readonly byteSizeBefore: number | null;
  readonly byteSizeAfter: number | null;
}

export type ProbeSessionState = "open" | "closing" | "closed" | "failed";

export interface ProbeSession {
  readonly state: ProbeSessionState;
  runAttempt(attemptId: string): Promise<CapabilityAttemptEvent>;
  recordRouteInvocation(
    routeInvocationId: string,
    result: RouteInvocationResultInput,
  ): Promise<RouteInvocationEvent>;
  recordToolApiChange(
    toolApiChangeId: string,
    result: ToolApiChangeResultInput,
  ): Promise<ToolApiChangeEvent>;
  close(): Promise<void>;
}
