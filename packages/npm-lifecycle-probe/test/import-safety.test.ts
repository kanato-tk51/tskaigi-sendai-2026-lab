import { readFile } from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

describe("npm lifecycle package import safety", () => {
  it("does not start the lifecycle entry at package import", async () => {
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
    const source = await readFile(
      new URL("../src/index.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toContain("node:child_process");
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
});
