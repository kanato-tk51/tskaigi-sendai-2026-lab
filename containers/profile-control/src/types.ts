import type {
  CONTROL_EVIDENCE_SCHEMA_VERSION,
  CONTROL_COMPLETION_SCHEMA_VERSION,
  CONTROL_MANIFEST_SCHEMA_VERSION,
  CONTROL_ORDER,
  HOST_INSPECTION_SCHEMA_VERSION,
  IMAGE_INPUT_SCHEMA_VERSION,
  FIXED_STAGING_FILES,
  PROFILE_SCHEMA_VERSION,
} from "./constants.js";

declare const acceptedImageStagingSnapshotBrand: unique symbol;

export type ProfileId = "permissive" | "constrained";
export type ControlName = (typeof CONTROL_ORDER)[number];
export type EnforcementMechanism =
  | "container"
  | "filesystem"
  | "node-runtime"
  | "target-absent"
  | "manifest-skip";

export interface ResourceLimits {
  readonly controlTimeoutMs: number;
  readonly outputBytes: number;
  readonly evidenceBytes: number;
  readonly evidenceFiles: number;
  readonly memoryBytes: number;
  readonly nanoCpus: number;
  readonly pids: number;
}

export interface OuterBoundary {
  readonly nonRoot: true;
  readonly readOnlyRoot: true;
  readonly dropAllCapabilities: true;
  readonly noNewPrivileges: true;
  readonly externalNetwork: "disabled";
  readonly hostHome: "absent";
  readonly credentials: "absent";
  readonly runtimeSocket: "absent";
  readonly devices: "absent";
}

export interface CapabilityPolicy {
  readonly environmentCanary: "present" | "absent";
  readonly canaryFile: "present" | "absent";
  readonly scratchWrite: "writable" | "read-only";
  readonly sourceWrite: "read-only";
  readonly loopbackService: "present" | "absent";
  readonly childProcess: "allowed" | "denied";
  readonly resultChannel: "writable";
  readonly deniedBy: Readonly<
    Record<
      | "environmentCanary"
      | "canaryFile"
      | "scratchWrite"
      | "sourceWrite"
      | "loopbackService"
      | "childProcess",
      EnforcementMechanism | "not-denied"
    >
  >;
}

export interface LogicalEvidenceLocations {
  readonly runRoot: "results/runs/m4-profile-controls";
  readonly inputRoot: "input";
  readonly hostRoot: "host";
  readonly resultRoot: "container-result";
  readonly scratchRoot: "scratch";
  readonly manifest: "input/control-manifest.json";
  readonly hostInspection: "host/host-inspection.json";
  readonly controlEvidence: "container-result/control-evidence.json";
  readonly completion: "host/completion.json";
  readonly comparison: "host/comparison.json";
}

export interface ExecutionProfile {
  readonly schemaVersion: typeof PROFILE_SCHEMA_VERSION;
  readonly profileId: ProfileId;
  readonly profileRevision: "m4-profile-v1";
  readonly containerInputId: "m4-profile-control-image-v1";
  readonly containerImageDigest: `sha256:${string}`;
  readonly nodeVersion: "v20.18.2";
  readonly outerBoundary: OuterBoundary;
  readonly capabilities: CapabilityPolicy;
  readonly limits: ResourceLimits;
  readonly evidence: LogicalEvidenceLocations;
}

export type ControlOutcome = "success" | "failure";
export type ControlReason =
  | "ENV_PRESENT"
  | "ENV_ABSENT"
  | "FILE_READABLE"
  | "FILE_NOT_FOUND"
  | "WRITE_CREATED"
  | "WRITE_DENIED"
  | "LOOPBACK_PROTOCOL_VERIFIED"
  | "NETWORK_FAILURE"
  | "CHILD_PROTOCOL_VERIFIED"
  | "CHILD_PROCESS_DENIED"
  | "RESULT_WRITTEN";

export interface ExpectedControlOutcome {
  readonly sequence: number;
  readonly control: ControlName;
  readonly outcome: ControlOutcome;
  readonly reason: ControlReason;
  readonly enforcement: EnforcementMechanism | "control-plane";
}

export interface ControlManifest {
  readonly schemaVersion: typeof CONTROL_MANIFEST_SCHEMA_VERSION;
  readonly runId: string;
  readonly controlId: "m4-profile-control-p" | "m4-profile-control-c";
  readonly profileId: ProfileId;
  readonly profileRevision: "m4-profile-v1";
  readonly containerInputId: "m4-profile-control-image-v1";
  readonly containerImageDigest: `sha256:${string}`;
  readonly nodeVersion: "v20.18.2";
  readonly controlOrder: readonly ControlName[];
  readonly expected: readonly ExpectedControlOutcome[];
  readonly limits: ResourceLimits;
}

export interface ControlObservation {
  readonly sequence: number;
  readonly control: ControlName;
  readonly outcome: ControlOutcome;
  readonly reason: ControlReason;
}

export interface ControlEvidence {
  readonly schemaVersion: typeof CONTROL_EVIDENCE_SCHEMA_VERSION;
  readonly runId: string;
  readonly controlId: "m4-profile-control-p" | "m4-profile-control-c";
  readonly profileId: ProfileId;
  readonly containerImageDigest: `sha256:${string}`;
  readonly nodeVersion: "v20.18.2";
  readonly observations: readonly ControlObservation[];
  readonly complete: true;
}

export interface HostInspection {
  readonly schemaVersion: typeof HOST_INSPECTION_SCHEMA_VERSION;
  readonly runId: string;
  readonly controlId: "m4-profile-control-p" | "m4-profile-control-c";
  readonly profileId: ProfileId;
  readonly containerImageDigest: `sha256:${string}`;
  readonly commandId: "permissive-node" | "constrained-node-permission-model";
  readonly user: "10001:10001";
  readonly readOnlyRoot: true;
  readonly networkMode: "none";
  readonly privileged: false;
  readonly capAdd: readonly [];
  readonly capDrop: readonly ["ALL"];
  readonly securityOptions: readonly ["no-new-privileges"];
  readonly mountIds: readonly ["input", "result", "scratch"];
  readonly scratchAccess: "writable" | "read-only";
  readonly environmentKeys: readonly [] | readonly ["PROBE_CANARY_M4_CONTROL"];
  readonly devices: readonly [];
  readonly deviceRequests: readonly [];
  readonly groupAdd: readonly [];
  readonly runtime: "runc";
  readonly usernsMode: "private";
  readonly pidMode: "private";
  readonly resourceLimits: Readonly<{
    memoryBytes: number;
    nanoCpus: number;
    pids: number;
  }>;
}

export interface EvidenceComparison {
  readonly runId: string;
  readonly profileId: ProfileId;
  readonly complete: boolean;
  readonly mismatchCount: number;
  readonly mismatches: readonly ControlName[];
}

export interface ApprovedImageInput {
  readonly schemaVersion: typeof IMAGE_INPUT_SCHEMA_VERSION;
  readonly baseImageName: "node";
  readonly baseImageDigest: `sha256:${string}`;
  readonly nodeVersion: "v20.18.2";
  readonly baseEnvironmentKeys: readonly string[];
  readonly stagingFiles: typeof FIXED_STAGING_FILES;
  readonly stagingDigest: `sha256:${string}`;
}

export type StagingFilePath = (typeof FIXED_STAGING_FILES)[number];

export interface StagingFileEvidence {
  readonly logicalPath: StagingFilePath;
  readonly byteLength: number;
  readonly sha256: `sha256:${string}`;
}

export interface PreparedStagingInput {
  readonly files: readonly StagingFileEvidence[];
  readonly stagingDigest: `sha256:${string}`;
}

export interface AcceptedImageStagingSnapshot {
  readonly [acceptedImageStagingSnapshotBrand]: true;
  readonly schemaVersion: typeof IMAGE_INPUT_SCHEMA_VERSION;
  readonly baseImageName: "node";
  readonly baseImageDigest: `sha256:${string}`;
  readonly nodeVersion: "v20.18.2";
  readonly baseEnvironmentKeys: readonly string[];
  readonly stagingInventory: readonly StagingFileEvidence[];
  readonly stagingDigest: `sha256:${string}`;
}

export interface StagingFileCopy {
  readonly logicalPath: StagingFilePath;
  readonly bytes: Uint8Array;
}

export interface ProfileRunDefinition {
  readonly profile: ExecutionProfile;
  readonly manifest: ControlManifest;
}

export interface ProfileControlPair {
  readonly containerImageDigest: `sha256:${string}`;
  readonly stagingDigest: `sha256:${string}`;
  readonly permissive: ProfileRunDefinition;
  readonly constrained: ProfileRunDefinition;
}

export interface ControlCompletion {
  readonly schemaVersion: typeof CONTROL_COMPLETION_SCHEMA_VERSION;
  readonly runId: string;
  readonly controlId: "m4-profile-control-p" | "m4-profile-control-c";
  readonly profileId: ProfileId;
  readonly containerImageDigest: `sha256:${string}`;
  readonly hostInspectionComplete: true;
  readonly controlEvidenceComplete: true;
  readonly evidenceTransferred: true;
  readonly manifestSha256: `sha256:${string}`;
  readonly hostInspectionSha256: `sha256:${string}`;
  readonly controlEvidenceSha256: `sha256:${string}`;
  readonly inventory: readonly string[];
  readonly complete: true;
}

export interface ControlTransferProjection {
  readonly manifestBefore: Uint8Array;
  readonly manifestAfter: Uint8Array;
  readonly manifestIdentityStable: true;
  readonly controlEvidence: Uint8Array;
  readonly resultFiles: readonly ["control-evidence.json", "result-marker.txt"];
  readonly scratchFiles: readonly [] | readonly ["scratch-marker.txt"];
}

export type ExecutionFailureCode =
  | "STAGING_FAILURE"
  | "COMMAND_FAILURE"
  | "COMMAND_TIMEOUT"
  | "OUTPUT_LIMIT"
  | "INSPECTION_FAILURE"
  | "TRANSFER_FAILURE"
  | "IMMUTABLE_INPUT_CHANGED"
  | "EVIDENCE_INVALID"
  | "CLEANUP_FAILURE";

export interface InconclusiveExecutionResult {
  readonly validity: "inconclusive";
  readonly primaryFailure: ExecutionFailureCode;
  readonly completedSteps: readonly string[];
  readonly comparison: null;
  readonly completion: null;
}

export interface CompleteExecutionResult {
  readonly validity: "complete";
  readonly primaryFailure: null;
  readonly completedSteps: readonly string[];
  readonly comparison: EvidenceComparison;
  readonly completion: ControlCompletion;
}

export type ProfileExecutionResult =
  InconclusiveExecutionResult | CompleteExecutionResult;

export interface PairExecutionResult {
  readonly validity: "complete" | "inconclusive";
  readonly primaryFailure: ExecutionFailureCode | null;
  readonly completedSteps: readonly string[];
  readonly permissive: ProfileExecutionResult | null;
  readonly constrained: ProfileExecutionResult | null;
}
