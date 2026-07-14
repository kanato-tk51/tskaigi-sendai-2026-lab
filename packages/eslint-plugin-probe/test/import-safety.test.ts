import { readFile } from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

describe("package root import safety", () => {
  it("imports without output, timers, or the instrumented plugin entry", async () => {
    vi.useFakeTimers();
    const stdout = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    const root = await import("../src/index.js");
    expect(root.ADAPTER_VERSION).toBe("0.0.0");
    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);

    const indexSource = await readFile(
      new URL("../src/index.ts", import.meta.url),
      "utf8",
    );
    const runtimeSource = await readFile(
      new URL("../src/runtime-context.ts", import.meta.url),
      "utf8",
    );
    expect(indexSource).not.toContain("plugin-entry");
    expect(indexSource).not.toContain("node:");
    expect(runtimeSource).not.toMatch(
      /from ["']node:(?:fs|http|https|net|child_process|timers)/u,
    );
    vi.useRealTimers();
  });
});
