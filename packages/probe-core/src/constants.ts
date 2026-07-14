export const PROBE_MANIFEST_SCHEMA_VERSION = "probe-manifest/v2" as const;
export const PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION =
  "probe-runtime-bindings/v1" as const;
export const PROBE_EVENT_SCHEMA_VERSION = "probe-event/v2" as const;
export const PROBE_MARKER_SCHEMA_VERSION = "probe-marker/v1" as const;

export const MAX_ID_LENGTH = 64;
export const MAX_VERSION_LENGTH = 64;
export const MAX_ENVIRONMENT_NAME_LENGTH = 128;
export const MAX_BINDING_PATH_LENGTH = 4096;
export const MAX_RELATIVE_PATH_LENGTH = 512;
export const MAX_FILE_BYTES = 1_048_576;
export const MAX_CHILD_OUTPUT_BYTES = 4_096;
export const MAX_NETWORK_RESPONSE_BYTES = 4_096;
export const MAX_NETWORK_RESPONSE_HEADER_BYTES = 4_096;
export const MAX_EVENT_LINE_BYTES = 16_384;
export const MAX_EVENTS_PER_SEGMENT = 1_024;
export const MAX_SEGMENT_BYTES = 4_194_304;
export const MIN_ATTEMPT_TIMEOUT_MS = 1;
export const MAX_ATTEMPT_TIMEOUT_MS = 10_000;

export const NETWORK_CANARY_METHOD = "GET" as const;
export const NETWORK_CANARY_PATH = "/probe-canary" as const;
export const NETWORK_CANARY_STATUS = 200 as const;
export const NETWORK_CANARY_HEADER_NAME = "x-tskaigi-probe-canary" as const;
export const NETWORK_CANARY_HEADER_VALUE = "probe-network-v1" as const;
export const NETWORK_CANARY_BODY = "probe-network-v1\n" as const;

export const ROUTES = [
  "npm-install-lifecycle",
  "eslint-plugin",
  "vitest-setup",
  "vite-plugin",
  "codegen-cli",
] as const;

export const EVENT_KINDS = [
  "capability-attempt",
  "route-invocation",
  "tool-api-change",
] as const;

export const TRIGGER_TYPES = ["automatic", "configured", "explicit"] as const;

export const INVOCATION_KINDS = [
  "module-evaluation",
  "lifecycle-hook",
  "tool-initialization",
  "plugin-factory",
  "rule-create",
  "visitor-callback",
  "fixer-invocation",
  "setup-execution",
  "file-hook",
  "module-hook",
  "build-hook",
  "cli-stage",
] as const;

export const TOOL_API_CHANGE_KINDS = [
  "source-fix",
  "source-generation",
  "module-transform",
  "emitted-asset",
  "emitted-chunk",
  "bundle-mutation",
] as const;

export const ATTEMPT_TYPES = [
  "environment-canary-read",
  "canary-file-read",
  "direct-filesystem-write",
  "loopback-connect",
  "child-node-process",
  "file-hash",
] as const;

export const OUTCOMES = ["success", "failure", "skipped"] as const;

export const NORMALIZED_ERROR_CODES = [
  "INVALID_MANIFEST",
  "INVALID_TARGET",
  "PATH_OUTSIDE_ALLOWED_ROOT",
  "PATH_TRAVERSAL",
  "SYMLINK_ESCAPE",
  "ENVIRONMENT_VARIABLE_NOT_ALLOWED",
  "ENVIRONMENT_VARIABLE_ABSENT",
  "FILE_NOT_FOUND",
  "FILE_ALREADY_EXISTS",
  "FILE_TOO_LARGE",
  "FILE_NOT_REGULAR",
  "FILE_TARGET_LEXICAL_ALIAS",
  "FILE_TARGET_CANONICAL_ALIAS",
  "FILE_TARGET_IDENTITY_ALIAS",
  "FILE_TARGET_OUTPUT_ALIAS",
  "READ_DENIED",
  "HASH_DENIED",
  "WRITE_DENIED",
  "NON_LOOPBACK_TARGET",
  "NETWORK_TIMEOUT",
  "NETWORK_FAILURE",
  "NETWORK_PROTOCOL_ERROR",
  "NETWORK_RESPONSE_TOO_LARGE",
  "CHILD_PROCESS_TIMEOUT",
  "CHILD_PROCESS_FAILURE",
  "CHILD_OUTPUT_TOO_LARGE",
  "SERIALIZATION_FAILURE",
  "EVIDENCE_WRITE_FAILURE",
  "SEGMENT_LIMIT_EXCEEDED",
  "SESSION_NOT_OPEN",
  "MANIFEST_DISALLOWED",
  "NOT_APPLICABLE",
  "ROUTE_INVOCATION_FAILED",
  "TOOL_API_CHANGE_FAILED",
  "INTERNAL_ERROR",
] as const;
