import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ATTEMPT_TYPES,
  MAX_ATTEMPT_TIMEOUT_MS,
  MAX_BINDING_PATH_LENGTH,
  MAX_CHILD_OUTPUT_BYTES,
  MAX_ENVIRONMENT_NAME_LENGTH,
  MAX_FILE_BYTES,
  MAX_ID_LENGTH,
  MAX_RELATIVE_PATH_LENGTH,
  MAX_VERSION_LENGTH,
  MIN_ATTEMPT_TIMEOUT_MS,
  INVOCATION_KINDS,
  PROBE_MANIFEST_SCHEMA_VERSION,
  PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION,
  ROUTES,
  TOOL_API_CHANGE_KINDS,
  TRIGGER_TYPES,
} from "./constants.js";
import { ProbeError } from "./errors.js";
import {
  readPlainArray,
  readPlainRecord,
  snapshotPlainRecord,
} from "./safe-data.js";
import type {
  CapabilityAttempt,
  ProbeManifest,
  ProbeRuntimeBindings,
  ProbeTarget,
  RouteInvocationDefinition,
  RuntimeBinding,
  ToolApiChangeDefinition,
  ToolApiTarget,
  ValidatedProbeConfiguration,
} from "./types.js";

interface TrustedRuntimeSnapshot {
  readonly nodeExecutable: string;
  readonly fixedChildScriptPath: string;
}

interface InternalValidatedProbeConfiguration {
  readonly manifest: ProbeManifest;
  readonly runtimeBindings: ProbeRuntimeBindings;
  readonly trustedRuntime: TrustedRuntimeSnapshot;
}

const validatedConfigurations = new WeakMap<
  object,
  InternalValidatedProbeConfiguration
>();
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/u;
const versionPattern = /^[A-Za-z0-9][A-Za-z0-9._+-]*$/u;
const environmentNamePattern = /^PROBE_CANARY_[A-Za-z0-9_]+$/u;

function containsControlCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (codePoint !== undefined && (codePoint <= 0x1f || codePoint === 0x7f)) {
      return true;
    }
  }
  return false;
}

function assertExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
  code: "INVALID_MANIFEST" | "INVALID_TARGET",
): void {
  const expected = new Set(keys);
  const actual = Object.keys(value);
  if (
    actual.length !== keys.length ||
    actual.some((key) => !expected.has(key))
  ) {
    throw new ProbeError(code);
  }
}

function assertString(
  value: unknown,
  maximumLength: number,
  pattern: RegExp,
  code: "INVALID_MANIFEST" | "INVALID_TARGET",
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maximumLength ||
    containsControlCharacter(value) ||
    !pattern.test(value)
  ) {
    throw new ProbeError(code);
  }
}

function assertId(
  value: unknown,
  code: "INVALID_MANIFEST" | "INVALID_TARGET" = "INVALID_MANIFEST",
): asserts value is string {
  assertString(value, MAX_ID_LENGTH, idPattern, code);
}

function assertVersion(value: unknown): asserts value is string {
  assertString(value, MAX_VERSION_LENGTH, versionPattern, "INVALID_MANIFEST");
}

function assertIntegerRange(
  value: unknown,
  minimum: number,
  maximum: number,
  code: "INVALID_MANIFEST" | "INVALID_TARGET",
): asserts value is number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new ProbeError(code);
  }
}

function assertBoolean(value: unknown): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new ProbeError("INVALID_MANIFEST");
  }
}

function parseTarget(input: unknown): ProbeTarget {
  const value = snapshotPlainRecord(input, "INVALID_MANIFEST");
  assertId(value.targetId);

  switch (value.kind) {
    case "environment": {
      assertExactKeys(
        value,
        ["targetId", "kind", "variableName"],
        "INVALID_MANIFEST",
      );
      if (
        typeof value.variableName !== "string" ||
        value.variableName.length === 0 ||
        value.variableName.length > MAX_ENVIRONMENT_NAME_LENGTH ||
        containsControlCharacter(value.variableName) ||
        !environmentNamePattern.test(value.variableName)
      ) {
        throw new ProbeError("ENVIRONMENT_VARIABLE_NOT_ALLOWED");
      }
      return Object.freeze({
        targetId: value.targetId,
        kind: "environment",
        variableName: value.variableName,
      });
    }
    case "file-read": {
      assertExactKeys(
        value,
        ["targetId", "kind", "classification", "maxBytes"],
        "INVALID_MANIFEST",
      );
      if (value.classification !== "canary") {
        throw new ProbeError("INVALID_MANIFEST");
      }
      assertIntegerRange(value.maxBytes, 1, MAX_FILE_BYTES, "INVALID_MANIFEST");
      return Object.freeze({
        targetId: value.targetId,
        kind: "file-read",
        classification: "canary",
        maxBytes: value.maxBytes,
      });
    }
    case "file-write": {
      assertExactKeys(
        value,
        ["targetId", "kind", "classification", "maxBytes"],
        "INVALID_MANIFEST",
      );
      if (value.classification !== "output") {
        throw new ProbeError("INVALID_MANIFEST");
      }
      assertIntegerRange(value.maxBytes, 1, MAX_FILE_BYTES, "INVALID_MANIFEST");
      return Object.freeze({
        targetId: value.targetId,
        kind: "file-write",
        classification: "output",
        maxBytes: value.maxBytes,
      });
    }
    case "file-hash": {
      assertExactKeys(
        value,
        ["targetId", "kind", "classification", "maxBytes"],
        "INVALID_MANIFEST",
      );
      if (
        value.classification !== "source" &&
        value.classification !== "artifact"
      ) {
        throw new ProbeError("INVALID_MANIFEST");
      }
      assertIntegerRange(value.maxBytes, 1, MAX_FILE_BYTES, "INVALID_MANIFEST");
      return Object.freeze({
        targetId: value.targetId,
        kind: "file-hash",
        classification: value.classification,
        maxBytes: value.maxBytes,
      });
    }
    case "loopback-http": {
      assertExactKeys(
        value,
        ["targetId", "kind", "timeoutMs"],
        "INVALID_MANIFEST",
      );
      assertIntegerRange(
        value.timeoutMs,
        MIN_ATTEMPT_TIMEOUT_MS,
        MAX_ATTEMPT_TIMEOUT_MS,
        "INVALID_MANIFEST",
      );
      return Object.freeze({
        targetId: value.targetId,
        kind: "loopback-http",
        timeoutMs: value.timeoutMs,
      });
    }
    case "fixed-child": {
      assertExactKeys(
        value,
        ["targetId", "kind", "timeoutMs", "maxOutputBytes"],
        "INVALID_MANIFEST",
      );
      assertIntegerRange(
        value.timeoutMs,
        MIN_ATTEMPT_TIMEOUT_MS,
        MAX_ATTEMPT_TIMEOUT_MS,
        "INVALID_MANIFEST",
      );
      assertIntegerRange(
        value.maxOutputBytes,
        1,
        MAX_CHILD_OUTPUT_BYTES,
        "INVALID_MANIFEST",
      );
      return Object.freeze({
        targetId: value.targetId,
        kind: "fixed-child",
        timeoutMs: value.timeoutMs,
        maxOutputBytes: value.maxOutputBytes,
      });
    }
    case "event-segment": {
      assertExactKeys(value, ["targetId", "kind"], "INVALID_MANIFEST");
      return Object.freeze({
        targetId: value.targetId,
        kind: "event-segment",
      });
    }
    default:
      throw new ProbeError("INVALID_MANIFEST");
  }
}

function parseAttempt(input: unknown): CapabilityAttempt {
  const value = snapshotPlainRecord(input, "INVALID_MANIFEST");
  assertId(value.attemptId);
  assertId(value.targetId);
  assertId(value.phase);
  if (
    !TRIGGER_TYPES.includes(value.triggerType as (typeof TRIGGER_TYPES)[number])
  ) {
    throw new ProbeError("INVALID_MANIFEST");
  }
  assertBoolean(value.enabled);

  if (!ATTEMPT_TYPES.includes(value.type as (typeof ATTEMPT_TYPES)[number])) {
    throw new ProbeError("INVALID_MANIFEST");
  }

  if (value.type === "file-hash") {
    assertExactKeys(
      value,
      [
        "attemptId",
        "type",
        "targetId",
        "phase",
        "triggerType",
        "enabled",
        "hashPosition",
      ],
      "INVALID_MANIFEST",
    );
    if (value.hashPosition !== "before" && value.hashPosition !== "after") {
      throw new ProbeError("INVALID_MANIFEST");
    }
    return Object.freeze({
      attemptId: value.attemptId,
      type: "file-hash",
      targetId: value.targetId,
      phase: value.phase,
      triggerType: value.triggerType as CapabilityAttempt["triggerType"],
      enabled: value.enabled,
      hashPosition: value.hashPosition as "before" | "after",
    });
  }

  assertExactKeys(
    value,
    ["attemptId", "type", "targetId", "phase", "triggerType", "enabled"],
    "INVALID_MANIFEST",
  );
  return Object.freeze({
    attemptId: value.attemptId,
    type: value.type,
    targetId: value.targetId,
    phase: value.phase,
    triggerType: value.triggerType,
    enabled: value.enabled,
  }) as CapabilityAttempt;
}

function parseRouteInvocation(input: unknown): RouteInvocationDefinition {
  const value = readPlainRecord(
    input,
    [
      "routeInvocationId",
      "phase",
      "triggerType",
      "invocationKind",
      "logicalUnitId",
      "enabled",
    ],
    "INVALID_MANIFEST",
  );
  assertId(value.routeInvocationId);
  assertId(value.phase);
  assertId(value.logicalUnitId);
  assertBoolean(value.enabled);
  if (
    !TRIGGER_TYPES.includes(
      value.triggerType as (typeof TRIGGER_TYPES)[number],
    ) ||
    !INVOCATION_KINDS.includes(
      value.invocationKind as (typeof INVOCATION_KINDS)[number],
    )
  ) {
    throw new ProbeError("INVALID_MANIFEST");
  }
  return Object.freeze({
    routeInvocationId: value.routeInvocationId,
    phase: value.phase,
    triggerType: value.triggerType as RouteInvocationDefinition["triggerType"],
    invocationKind:
      value.invocationKind as RouteInvocationDefinition["invocationKind"],
    logicalUnitId: value.logicalUnitId,
    enabled: value.enabled,
  });
}

function parseToolApiTarget(input: unknown): ToolApiTarget {
  const value = readPlainRecord(
    input,
    ["targetId", "classification"],
    "INVALID_MANIFEST",
  );
  assertId(value.targetId);
  if (
    value.classification !== "source" &&
    value.classification !== "artifact"
  ) {
    throw new ProbeError("INVALID_MANIFEST");
  }
  return Object.freeze({
    targetId: value.targetId,
    classification: value.classification,
  });
}

function parseToolApiChange(input: unknown): ToolApiChangeDefinition {
  const value = readPlainRecord(
    input,
    [
      "toolApiChangeId",
      "phase",
      "triggerType",
      "changeKind",
      "targetId",
      "enabled",
    ],
    "INVALID_MANIFEST",
  );
  assertId(value.toolApiChangeId);
  assertId(value.phase);
  assertId(value.targetId);
  assertBoolean(value.enabled);
  if (
    !TRIGGER_TYPES.includes(
      value.triggerType as (typeof TRIGGER_TYPES)[number],
    ) ||
    !TOOL_API_CHANGE_KINDS.includes(
      value.changeKind as (typeof TOOL_API_CHANGE_KINDS)[number],
    )
  ) {
    throw new ProbeError("INVALID_MANIFEST");
  }
  return Object.freeze({
    toolApiChangeId: value.toolApiChangeId,
    phase: value.phase,
    triggerType: value.triggerType as ToolApiChangeDefinition["triggerType"],
    changeKind: value.changeKind as ToolApiChangeDefinition["changeKind"],
    targetId: value.targetId,
    enabled: value.enabled,
  });
}

function parseProbeManifest(input: unknown): ProbeManifest {
  const value = readPlainRecord(
    input,
    [
      "schemaVersion",
      "runId",
      "scenarioId",
      "route",
      "phases",
      "triggerTypes",
      "adapterVersion",
      "producerId",
      "workerId",
      "cwdId",
      "toolName",
      "toolVersion",
      "eventSinkTargetId",
      "targets",
      "attempts",
      "routeInvocations",
      "toolApiTargets",
      "toolApiChanges",
    ],
    "INVALID_MANIFEST",
  );

  if (value.schemaVersion !== PROBE_MANIFEST_SCHEMA_VERSION) {
    throw new ProbeError("INVALID_MANIFEST");
  }
  assertId(value.runId);
  assertId(value.scenarioId);
  assertId(value.producerId);
  assertId(value.cwdId);
  assertId(value.toolName);
  assertId(value.eventSinkTargetId);
  assertVersion(value.adapterVersion);
  assertVersion(value.toolVersion);
  if (!ROUTES.includes(value.route as (typeof ROUTES)[number])) {
    throw new ProbeError("INVALID_MANIFEST");
  }
  if (value.workerId !== null) {
    assertId(value.workerId);
  }

  const phases = readPlainArray(value.phases, "INVALID_MANIFEST").map(
    (phase) => {
      assertId(phase);
      return phase;
    },
  );
  const triggerTypes = readPlainArray(
    value.triggerTypes,
    "INVALID_MANIFEST",
  ).map((triggerType) => {
    if (
      !TRIGGER_TYPES.includes(triggerType as (typeof TRIGGER_TYPES)[number])
    ) {
      throw new ProbeError("INVALID_MANIFEST");
    }
    return triggerType as ProbeManifest["triggerTypes"][number];
  });
  if (phases.length === 0 || triggerTypes.length === 0) {
    throw new ProbeError("INVALID_MANIFEST");
  }
  const targets = readPlainArray(value.targets, "INVALID_MANIFEST").map(
    parseTarget,
  );
  const attempts = readPlainArray(value.attempts, "INVALID_MANIFEST").map(
    parseAttempt,
  );
  const routeInvocations = readPlainArray(
    value.routeInvocations,
    "INVALID_MANIFEST",
  ).map(parseRouteInvocation);
  const toolApiTargets = readPlainArray(
    value.toolApiTargets,
    "INVALID_MANIFEST",
  ).map(parseToolApiTarget);
  const toolApiChanges = readPlainArray(
    value.toolApiChanges,
    "INVALID_MANIFEST",
  ).map(parseToolApiChange);
  const targetIds = new Set<string>();
  const attemptIds = new Set<string>();
  const routeInvocationIds = new Set<string>();
  const toolApiChangeIds = new Set<string>();
  const phaseIds = new Set<string>();
  const allowedTriggerTypes = new Set(triggerTypes);
  for (const phase of phases) {
    if (phaseIds.has(phase)) {
      throw new ProbeError("INVALID_MANIFEST");
    }
    phaseIds.add(phase);
  }
  if (allowedTriggerTypes.size !== triggerTypes.length) {
    throw new ProbeError("INVALID_MANIFEST");
  }
  for (const target of targets) {
    if (targetIds.has(target.targetId)) {
      throw new ProbeError("INVALID_MANIFEST");
    }
    targetIds.add(target.targetId);
  }
  for (const target of toolApiTargets) {
    if (targetIds.has(target.targetId)) {
      throw new ProbeError("INVALID_MANIFEST");
    }
    targetIds.add(target.targetId);
  }
  for (const attempt of attempts) {
    if (attemptIds.has(attempt.attemptId)) {
      throw new ProbeError("INVALID_MANIFEST");
    }
    attemptIds.add(attempt.attemptId);
  }
  for (const definition of routeInvocations) {
    if (routeInvocationIds.has(definition.routeInvocationId)) {
      throw new ProbeError("INVALID_MANIFEST");
    }
    routeInvocationIds.add(definition.routeInvocationId);
  }
  for (const definition of toolApiChanges) {
    if (toolApiChangeIds.has(definition.toolApiChangeId)) {
      throw new ProbeError("INVALID_MANIFEST");
    }
    toolApiChangeIds.add(definition.toolApiChangeId);
  }

  for (const definition of [
    ...attempts,
    ...routeInvocations,
    ...toolApiChanges,
  ]) {
    if (
      !phaseIds.has(definition.phase) ||
      !allowedTriggerTypes.has(definition.triggerType)
    ) {
      throw new ProbeError("INVALID_MANIFEST");
    }
  }
  const writeTargets = new Set<string>();
  for (const attempt of attempts) {
    if (attempt.type !== "direct-filesystem-write") {
      continue;
    }
    if (writeTargets.has(attempt.targetId)) {
      throw new ProbeError("INVALID_MANIFEST");
    }
    writeTargets.add(attempt.targetId);
  }

  const eventTarget = targets.find(
    (target) => target.targetId === value.eventSinkTargetId,
  );
  if (eventTarget?.kind !== "event-segment") {
    throw new ProbeError("INVALID_TARGET");
  }

  const toolApiTargetMap = new Map(
    toolApiTargets.map((target) => [target.targetId, target] as const),
  );
  for (const change of toolApiChanges) {
    const target = toolApiTargetMap.get(change.targetId);
    const sourceKind =
      change.changeKind === "source-fix" ||
      change.changeKind === "source-generation" ||
      change.changeKind === "module-transform";
    if (
      target === undefined ||
      (sourceKind && target.classification !== "source") ||
      (!sourceKind && target.classification !== "artifact")
    ) {
      throw new ProbeError("INVALID_TARGET");
    }
  }

  return Object.freeze({
    schemaVersion: PROBE_MANIFEST_SCHEMA_VERSION,
    runId: value.runId,
    scenarioId: value.scenarioId,
    route: value.route as ProbeManifest["route"],
    phases: Object.freeze(phases),
    triggerTypes: Object.freeze(triggerTypes),
    adapterVersion: value.adapterVersion,
    producerId: value.producerId,
    workerId: value.workerId,
    cwdId: value.cwdId,
    toolName: value.toolName,
    toolVersion: value.toolVersion,
    eventSinkTargetId: value.eventSinkTargetId,
    targets: Object.freeze(targets),
    attempts: Object.freeze(attempts),
    routeInvocations: Object.freeze(routeInvocations),
    toolApiTargets: Object.freeze(toolApiTargets),
    toolApiChanges: Object.freeze(toolApiChanges),
  });
}

export function validateProbeManifest(input: unknown): ProbeManifest {
  try {
    return parseProbeManifest(input);
  } catch (error) {
    if (error instanceof ProbeError) {
      throw error;
    }
    throw new ProbeError("INVALID_MANIFEST");
  }
}

function assertPathString(value: unknown): asserts value is string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > MAX_BINDING_PATH_LENGTH ||
    containsControlCharacter(value)
  ) {
    throw new ProbeError("INVALID_TARGET");
  }
}

function assertRelativePath(value: unknown): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new ProbeError("INVALID_TARGET");
  }
  if (
    value.length > MAX_RELATIVE_PATH_LENGTH ||
    containsControlCharacter(value) ||
    path.isAbsolute(value) ||
    /^[A-Za-z]:[\\/]/u.test(value)
  ) {
    throw new ProbeError("PATH_OUTSIDE_ALLOWED_ROOT");
  }
  if (
    value.includes("\\") ||
    value
      .split("/")
      .some(
        (component) =>
          component === "" || component === "." || component === "..",
      )
  ) {
    throw new ProbeError("PATH_TRAVERSAL");
  }
}

function parseRuntimeBinding(input: unknown): RuntimeBinding {
  const value = snapshotPlainRecord(input, "INVALID_TARGET");
  assertId(value.targetId, "INVALID_TARGET");

  switch (value.kind) {
    case "path": {
      assertExactKeys(
        value,
        ["targetId", "kind", "rootPath", "relativePath"],
        "INVALID_TARGET",
      );
      assertPathString(value.rootPath);
      if (!path.isAbsolute(value.rootPath)) {
        throw new ProbeError("PATH_OUTSIDE_ALLOWED_ROOT");
      }
      assertRelativePath(value.relativePath);
      return Object.freeze({
        targetId: value.targetId,
        kind: "path",
        rootPath: value.rootPath,
        relativePath: value.relativePath,
      });
    }
    case "loopback-http": {
      assertExactKeys(
        value,
        ["targetId", "kind", "address", "port"],
        "INVALID_TARGET",
      );
      if (value.address !== "127.0.0.1" && value.address !== "::1") {
        throw new ProbeError("NON_LOOPBACK_TARGET");
      }
      assertIntegerRange(value.port, 1, 65_535, "INVALID_TARGET");
      return Object.freeze({
        targetId: value.targetId,
        kind: "loopback-http",
        address: value.address,
        port: value.port,
      });
    }
    case "environment":
    case "fixed-child": {
      assertExactKeys(value, ["targetId", "kind"], "INVALID_TARGET");
      return Object.freeze({ targetId: value.targetId, kind: value.kind });
    }
    default:
      throw new ProbeError("INVALID_TARGET");
  }
}

function expectedBindingKind(target: ProbeTarget): RuntimeBinding["kind"] {
  if (
    target.kind === "file-read" ||
    target.kind === "file-write" ||
    target.kind === "file-hash" ||
    target.kind === "event-segment"
  ) {
    return "path";
  }
  if (target.kind === "loopback-http") {
    return "loopback-http";
  }
  return target.kind;
}

function expectedTargetKind(attempt: CapabilityAttempt): ProbeTarget["kind"] {
  switch (attempt.type) {
    case "environment-canary-read":
      return "environment";
    case "canary-file-read":
      return "file-read";
    case "direct-filesystem-write":
      return "file-write";
    case "loopback-connect":
      return "loopback-http";
    case "child-node-process":
      return "fixed-child";
    case "file-hash":
      return "file-hash";
  }
}

function parseRuntimeBindings(
  manifest: ProbeManifest,
  input: unknown,
): ProbeRuntimeBindings {
  const value = readPlainRecord(
    input,
    ["schemaVersion", "bindings"],
    "INVALID_TARGET",
  );
  if (value.schemaVersion !== PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION) {
    throw new ProbeError("INVALID_TARGET");
  }
  const bindings = readPlainArray(value.bindings, "INVALID_TARGET").map(
    parseRuntimeBinding,
  );
  const bindingMap = new Map<string, RuntimeBinding>();
  for (const binding of bindings) {
    if (bindingMap.has(binding.targetId)) {
      throw new ProbeError("INVALID_TARGET");
    }
    bindingMap.set(binding.targetId, binding);
  }
  const fileBindingPaths = new Set<string>();
  for (const target of manifest.targets) {
    if (
      target.kind !== "file-read" &&
      target.kind !== "file-write" &&
      target.kind !== "file-hash"
    ) {
      continue;
    }
    const binding = bindingMap.get(target.targetId);
    if (binding?.kind !== "path") {
      throw new ProbeError("INVALID_TARGET");
    }
    const bindingKey = path.resolve(binding.rootPath, binding.relativePath);
    if (fileBindingPaths.has(bindingKey)) {
      throw new ProbeError("FILE_TARGET_LEXICAL_ALIAS");
    }
    fileBindingPaths.add(bindingKey);
  }
  if (bindings.length !== manifest.targets.length) {
    throw new ProbeError("INVALID_TARGET");
  }

  const targetMap = new Map(
    manifest.targets.map((target) => [target.targetId, target] as const),
  );
  for (const target of manifest.targets) {
    const binding = bindingMap.get(target.targetId);
    if (binding?.kind !== expectedBindingKind(target)) {
      throw new ProbeError("INVALID_TARGET");
    }
  }
  for (const binding of bindings) {
    if (!targetMap.has(binding.targetId)) {
      throw new ProbeError("INVALID_TARGET");
    }
  }
  for (const attempt of manifest.attempts) {
    const target = targetMap.get(attempt.targetId);
    if (target?.kind !== expectedTargetKind(attempt)) {
      throw new ProbeError("INVALID_TARGET");
    }
  }

  const eventBinding = bindingMap.get(manifest.eventSinkTargetId);
  if (
    eventBinding?.kind !== "path" ||
    eventBinding.relativePath !== `${manifest.producerId}.jsonl`
  ) {
    throw new ProbeError("INVALID_TARGET");
  }

  return Object.freeze({
    schemaVersion: PROBE_RUNTIME_BINDINGS_SCHEMA_VERSION,
    bindings: Object.freeze(bindings),
  });
}

export function validateRuntimeBindings(
  manifestInput: ProbeManifest,
  input: unknown,
): ProbeRuntimeBindings {
  try {
    const manifest = validateProbeManifest(manifestInput);
    return parseRuntimeBindings(manifest, input);
  } catch (error) {
    if (error instanceof ProbeError) {
      throw error;
    }
    throw new ProbeError("INVALID_TARGET");
  }
}

function cloneManifest(manifest: ProbeManifest): ProbeManifest {
  return Object.freeze({
    ...manifest,
    phases: Object.freeze([...manifest.phases]),
    triggerTypes: Object.freeze([...manifest.triggerTypes]),
    targets: Object.freeze(
      manifest.targets.map((target) => Object.freeze({ ...target })),
    ),
    attempts: Object.freeze(
      manifest.attempts.map((attempt) => Object.freeze({ ...attempt })),
    ),
    routeInvocations: Object.freeze(
      manifest.routeInvocations.map((definition) =>
        Object.freeze({ ...definition }),
      ),
    ),
    toolApiTargets: Object.freeze(
      manifest.toolApiTargets.map((target) => Object.freeze({ ...target })),
    ),
    toolApiChanges: Object.freeze(
      manifest.toolApiChanges.map((definition) =>
        Object.freeze({ ...definition }),
      ),
    ),
  });
}

function cloneRuntimeBindings(
  runtimeBindings: ProbeRuntimeBindings,
): ProbeRuntimeBindings {
  return Object.freeze({
    schemaVersion: runtimeBindings.schemaVersion,
    bindings: Object.freeze(
      runtimeBindings.bindings.map((binding) => Object.freeze({ ...binding })),
    ),
  });
}

function trustedRuntimeSnapshot(): TrustedRuntimeSnapshot {
  const nodeExecutable = process.execPath;
  if (
    typeof nodeExecutable !== "string" ||
    nodeExecutable.length === 0 ||
    nodeExecutable.length > MAX_BINDING_PATH_LENGTH ||
    containsControlCharacter(nodeExecutable) ||
    !path.isAbsolute(nodeExecutable)
  ) {
    throw new ProbeError("INVALID_TARGET");
  }
  return Object.freeze({
    nodeExecutable,
    fixedChildScriptPath: fileURLToPath(
      new URL("./fixed-child.js", import.meta.url),
    ),
  });
}

export function validateProbeConfiguration(
  manifestInput: unknown,
  runtimeBindingsInput: unknown,
): ValidatedProbeConfiguration {
  try {
    const parsedManifest = parseProbeManifest(manifestInput);
    const parsedRuntimeBindings = parseRuntimeBindings(
      parsedManifest,
      runtimeBindingsInput,
    );

    const internalSnapshot = Object.freeze({
      manifest: cloneManifest(parsedManifest),
      runtimeBindings: cloneRuntimeBindings(parsedRuntimeBindings),
      trustedRuntime: trustedRuntimeSnapshot(),
    });
    const configuration = Object.freeze({
      manifest: cloneManifest(parsedManifest),
      runtimeBindings: cloneRuntimeBindings(parsedRuntimeBindings),
    }) as ValidatedProbeConfiguration;
    validatedConfigurations.set(configuration, internalSnapshot);
    return configuration;
  } catch (error) {
    if (error instanceof ProbeError) {
      throw error;
    }
    throw new ProbeError("INVALID_MANIFEST");
  }
}

export function getValidatedProbeConfigurationSnapshot(
  configuration: ValidatedProbeConfiguration,
): InternalValidatedProbeConfiguration {
  const snapshot = validatedConfigurations.get(configuration);
  if (snapshot === undefined) {
    throw new ProbeError("INVALID_MANIFEST");
  }
  return snapshot;
}

export function assertValidatedProbeConfiguration(
  configuration: ValidatedProbeConfiguration,
): void {
  getValidatedProbeConfigurationSnapshot(configuration);
}
