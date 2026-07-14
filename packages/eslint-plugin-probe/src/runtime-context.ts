import type {
  ProbeSession,
  ToolApiChangeResultInput,
} from "@tskaigi-lab/probe-core";
import type { ESLint } from "eslint";

import { ATTEMPT_IDS, ROUTE_IDS, TOOL_API_CHANGE_ID } from "./constants.js";
import { AdapterError } from "./errors.js";
import type {
  OfficialSourceFixEvidence,
  ScenarioContextHandle,
  ScenarioContextInstallInput,
} from "./types.js";

type ContextState = ScenarioContextHandle["state"];

type FixedTask =
  | { readonly kind: "module-evaluation" }
  | { readonly kind: "plugin-initialization" }
  | { readonly kind: "rule-create" }
  | { readonly kind: "visitor-callback" }
  | { readonly kind: "fixer-callback" }
  | { readonly kind: "capability-environment" }
  | { readonly kind: "capability-file-read" }
  | { readonly kind: "capability-file-hash" }
  | { readonly kind: "capability-file-write" }
  | { readonly kind: "capability-loopback" }
  | { readonly kind: "capability-child" }
  | {
      readonly kind: "official-source-fix";
      readonly result: ToolApiChangeResultInput;
    }
  | { readonly kind: "official-source-fix-skipped" };

interface InstalledContext {
  readonly session: ProbeSession;
  readonly scenarioToken: string;
  readonly handle: ScenarioContextHandle;
  state: ContextState;
  firstFailure: unknown;
  tail: Promise<void>;
  pluginPromise: Promise<ESLint.Plugin> | undefined;
  capabilitiesScheduled: boolean;
}

const contextByHandle = new WeakMap<object, InstalledContext>();
let activeContext: InstalledContext | undefined;

function validateScenarioToken(value: string): void {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/u.test(value)) {
    throw new AdapterError("ESLINT_CONTEXT_INVALID");
  }
}

function installedContext(handle: ScenarioContextHandle): InstalledContext {
  const context = contextByHandle.get(handle);
  if (context === undefined) {
    throw new AdapterError("ESLINT_CONTEXT_INVALID");
  }
  return context;
}

function requireActiveContext(): InstalledContext {
  const context = activeContext;
  if (context === undefined) {
    throw new AdapterError("ESLINT_CONTEXT_NOT_INSTALLED");
  }
  if (context.state === "disposed" || context.state === "disposing") {
    throw new AdapterError("ESLINT_CONTEXT_DISPOSED");
  }
  if (context.firstFailure !== undefined || context.state === "failed") {
    throw context.firstFailure;
  }
  return context;
}

async function executeFixedTask(
  session: ProbeSession,
  task: FixedTask,
): Promise<void> {
  switch (task.kind) {
    case "module-evaluation":
      await session.recordRouteInvocation(ROUTE_IDS.moduleEvaluation, {
        outcome: "success",
      });
      return;
    case "plugin-initialization":
      await session.recordRouteInvocation(ROUTE_IDS.pluginInitialization, {
        outcome: "success",
      });
      return;
    case "rule-create":
      await session.recordRouteInvocation(ROUTE_IDS.ruleCreate, {
        outcome: "success",
      });
      return;
    case "visitor-callback":
      await session.recordRouteInvocation(ROUTE_IDS.visitorCallback, {
        outcome: "success",
      });
      return;
    case "fixer-callback":
      await session.recordRouteInvocation(ROUTE_IDS.fixerCallback, {
        outcome: "success",
      });
      return;
    case "capability-environment":
      await session.runAttempt(ATTEMPT_IDS.environment);
      return;
    case "capability-file-read":
      await session.runAttempt(ATTEMPT_IDS.fileRead);
      return;
    case "capability-file-hash":
      await session.runAttempt(ATTEMPT_IDS.fileHash);
      return;
    case "capability-file-write":
      await session.runAttempt(ATTEMPT_IDS.fileWrite);
      return;
    case "capability-loopback":
      await session.runAttempt(ATTEMPT_IDS.loopback);
      return;
    case "capability-child":
      await session.runAttempt(ATTEMPT_IDS.child);
      return;
    case "official-source-fix":
      await session.recordToolApiChange(TOOL_API_CHANGE_ID, task.result);
      return;
    case "official-source-fix-skipped":
      await session.recordToolApiChange(TOOL_API_CHANGE_ID, {
        outcome: "skipped",
        changed: false,
        beforeHash: null,
        afterHash: null,
        byteSizeBefore: null,
        byteSizeAfter: null,
      });
      return;
  }
}

function enqueueFixedTask(task: FixedTask): void {
  const context = requireActiveContext();
  const operation = context.tail.then(async () => {
    if (context.firstFailure !== undefined) {
      throw context.firstFailure;
    }
    await executeFixedTask(context.session, task);
  });
  context.tail = operation.catch((error: unknown) => {
    context.firstFailure ??= error;
    context.state = "failed";
    throw context.firstFailure;
  });
  void context.tail.catch(() => undefined);
}

export function installScenarioContext(
  input: ScenarioContextInstallInput,
): ScenarioContextHandle {
  if (activeContext !== undefined) {
    throw new AdapterError("ESLINT_CONTEXT_ALREADY_INSTALLED");
  }
  validateScenarioToken(input.scenarioToken);
  const handle = Object.freeze({
    get state(): ContextState {
      const context = contextByHandle.get(handle);
      return context?.state ?? "disposed";
    },
  }) as ScenarioContextHandle;
  const context: InstalledContext = {
    session: input.session,
    scenarioToken: input.scenarioToken,
    handle,
    state: "active",
    firstFailure: undefined,
    tail: Promise.resolve(),
    pluginPromise: undefined,
    capabilitiesScheduled: false,
  };
  contextByHandle.set(handle, context);
  activeContext = context;
  return handle;
}

export async function loadFixedPluginEntry(
  handle: ScenarioContextHandle,
): Promise<ESLint.Plugin> {
  const context = installedContext(handle);
  if (context !== activeContext) {
    throw new AdapterError("ESLINT_CONTEXT_DISPOSED");
  }
  requireActiveContext();
  context.pluginPromise ??= (async () => {
    const pluginUrl = new URL("./plugin-entry.js", import.meta.url);
    pluginUrl.searchParams.set("scenario", context.scenarioToken);
    try {
      const module = (await import(pluginUrl.href)) as {
        readonly default: ESLint.Plugin;
      };
      return module.default;
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }
      throw new AdapterError("ESLINT_PLUGIN_LOAD_FAILED");
    }
  })();
  return context.pluginPromise;
}

export async function drainScenarioTasks(
  handle: ScenarioContextHandle,
): Promise<void> {
  const context = installedContext(handle);
  if (context.state === "disposed") {
    throw new AdapterError("ESLINT_CONTEXT_DISPOSED");
  }
  await context.tail;
  if (context.firstFailure !== undefined) {
    throw context.firstFailure;
  }
}

export async function disposeScenarioContext(
  handle: ScenarioContextHandle,
): Promise<void> {
  const context = installedContext(handle);
  if (context.state === "disposed") {
    throw new AdapterError("ESLINT_CONTEXT_DISPOSED");
  }
  if (context !== activeContext) {
    throw new AdapterError("ESLINT_CONTEXT_INVALID");
  }
  if (context.state !== "failed") {
    context.state = "disposing";
  }
  try {
    await context.tail;
  } finally {
    context.state = "disposed";
    activeContext = undefined;
  }
  if (context.firstFailure !== undefined) {
    throw context.firstFailure;
  }
}

export function recordPluginModuleEvaluation(): void {
  enqueueFixedTask({ kind: "module-evaluation" });
}

export function recordPluginInitialization(): void {
  enqueueFixedTask({ kind: "plugin-initialization" });
}

export function recordRuleCreate(): void {
  enqueueFixedTask({ kind: "rule-create" });
}

export function recordVisitorCallback(): void {
  enqueueFixedTask({ kind: "visitor-callback" });
}

export function recordFixerCallback(): void {
  enqueueFixedTask({ kind: "fixer-callback" });
}

export function scheduleCapabilitiesOnce(): void {
  const context = requireActiveContext();
  if (context.capabilitiesScheduled) {
    return;
  }
  context.capabilitiesScheduled = true;
  enqueueFixedTask({ kind: "capability-environment" });
  enqueueFixedTask({ kind: "capability-file-read" });
  enqueueFixedTask({ kind: "capability-file-hash" });
  enqueueFixedTask({ kind: "capability-file-write" });
  enqueueFixedTask({ kind: "capability-loopback" });
  enqueueFixedTask({ kind: "capability-child" });
}

export function scheduleOfficialSourceFix(
  evidence: OfficialSourceFixEvidence,
): void {
  enqueueFixedTask({
    kind: "official-source-fix",
    result: Object.freeze({ outcome: "success", ...evidence }),
  });
}

export function scheduleSkippedOfficialSourceFix(): void {
  enqueueFixedTask({ kind: "official-source-fix-skipped" });
}
