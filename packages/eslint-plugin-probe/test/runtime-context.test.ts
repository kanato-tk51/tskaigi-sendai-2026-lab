import type {
  CapabilityAttemptEvent,
  ProbeSession,
  RouteInvocationEvent,
  ToolApiChangeEvent,
} from "@tskaigi-lab/probe-core";
import { describe, expect, it } from "vitest";

import {
  disposeScenarioContext,
  drainScenarioTasks,
  installScenarioContext,
  loadFixedPluginEntry,
  recordRuleCreate,
} from "../src/runtime-context.js";

function fakeSession(calls: string[], failure?: unknown): ProbeSession {
  let state: ProbeSession["state"] = "open";
  return {
    get state() {
      return state;
    },
    runAttempt(attemptId) {
      calls.push(`attempt:${attemptId}`);
      return Promise.resolve({} as CapabilityAttemptEvent);
    },
    recordRouteInvocation(routeInvocationId) {
      calls.push(`route:${routeInvocationId}`);
      if (failure !== undefined) {
        return Promise.reject(failure);
      }
      return Promise.resolve({} as RouteInvocationEvent);
    },
    recordToolApiChange(toolApiChangeId) {
      calls.push(`change:${toolApiChangeId}`);
      return Promise.resolve({} as ToolApiChangeEvent);
    },
    async close() {
      state = "closed";
    },
  };
}

describe("adapter runtime context", () => {
  it("installs, loads the fixed entry once, drains, and disposes", async () => {
    const calls: string[] = [];
    const handle = installScenarioContext({
      session: fakeSession(calls),
      scenarioToken: "runtime-success-1",
    });
    const first = await loadFixedPluginEntry(handle);
    const duplicate = await loadFixedPluginEntry(handle);
    expect(duplicate).toBe(first);
    await drainScenarioTasks(handle);
    expect(calls).toEqual([
      "route:eslint-module-evaluation",
      "route:eslint-plugin-initialization",
    ]);
    await disposeScenarioContext(handle);
    expect(handle.state).toBe("disposed");
  });

  it("rejects duplicate installation", async () => {
    const handle = installScenarioContext({
      session: fakeSession([]),
      scenarioToken: "duplicate-install-1",
    });
    try {
      expect(() =>
        installScenarioContext({
          session: fakeSession([]),
          scenarioToken: "duplicate-install-2",
        }),
      ).toThrowError(
        expect.objectContaining({ code: "ESLINT_CONTEXT_ALREADY_INSTALLED" }),
      );
    } finally {
      await disposeScenarioContext(handle);
    }
  });

  it("rejects instrumented entry evaluation before install", async () => {
    const entrySpecifier =
      "../src/plugin-entry.js?without-context-runtime-test";
    await expect(import(entrySpecifier)).rejects.toMatchObject({
      code: "ESLINT_CONTEXT_NOT_INSTALLED",
    });
  });

  it("preserves the first queued failure and rejects later tasks", async () => {
    const failure = Object.assign(new Error("FIRST_QUEUE_FAILURE"), {
      code: "FIRST_QUEUE_FAILURE",
    });
    const handle = installScenarioContext({
      session: fakeSession([], failure),
      scenarioToken: "queue-failure-1",
    });
    try {
      await loadFixedPluginEntry(handle);
      await expect(drainScenarioTasks(handle)).rejects.toBe(failure);
      expect(() => recordRuleCreate()).toThrow(failure);
      await expect(disposeScenarioContext(handle)).rejects.toBe(failure);
      expect(handle.state).toBe("disposed");
    } finally {
      if (handle.state !== "disposed") {
        await disposeScenarioContext(handle).catch(() => undefined);
      }
    }
  });

  it("rejects reuse after disposal", async () => {
    const handle = installScenarioContext({
      session: fakeSession([]),
      scenarioToken: "disposed-context-1",
    });
    await disposeScenarioContext(handle);
    await expect(drainScenarioTasks(handle)).rejects.toMatchObject({
      code: "ESLINT_CONTEXT_DISPOSED",
    });
    await expect(loadFixedPluginEntry(handle)).rejects.toMatchObject({
      code: "ESLINT_CONTEXT_DISPOSED",
    });
  });

  it("does not leak state between scenario contexts", async () => {
    const firstCalls: string[] = [];
    const first = installScenarioContext({
      session: fakeSession(firstCalls),
      scenarioToken: "isolated-context-1",
    });
    await loadFixedPluginEntry(first);
    await drainScenarioTasks(first);
    await disposeScenarioContext(first);

    const secondCalls: string[] = [];
    const second = installScenarioContext({
      session: fakeSession(secondCalls),
      scenarioToken: "isolated-context-2",
    });
    await loadFixedPluginEntry(second);
    await drainScenarioTasks(second);
    await disposeScenarioContext(second);
    expect(firstCalls).toEqual(secondCalls);
  });

  it("does not expose an arbitrary callback or raw event API", async () => {
    const root = await import("../src/index.js");
    expect(Object.keys(root)).not.toContain("enqueue");
    expect(Object.keys(root)).not.toContain("recordEvent");
    expect(Object.keys(root)).not.toContain("scheduleTask");
    expect(Object.keys(root)).not.toContain("recordRuleCreate");
  });
});
