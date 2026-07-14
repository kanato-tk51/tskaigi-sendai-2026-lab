import { afterEach, describe, expect, it, vi } from "vitest";

const sideEffects = vi.hoisted(() => ({
  open: vi.fn(),
  lstat: vi.fn(),
  realpath: vi.fn(),
  stat: vi.fn(),
  spawn: vi.fn(),
  request: vi.fn(),
  createHash: vi.fn(),
}));

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...actual,
    open: sideEffects.open,
    lstat: sideEffects.lstat,
    realpath: sideEffects.realpath,
    stat: sideEffects.stat,
  };
});

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return { ...actual, spawn: sideEffects.spawn };
});

vi.mock("node:http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:http")>();
  return { ...actual, request: sideEffects.request };
});

vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();
  return { ...actual, createHash: sideEffects.createHash };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("import-time safety", () => {
  it("does not read/write files, print, start timers, spawn, or use network", async () => {
    const timer = vi.spyOn(globalThis, "setTimeout");
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await import("../src/index.js");

    expect(sideEffects.open).not.toHaveBeenCalled();
    expect(sideEffects.lstat).not.toHaveBeenCalled();
    expect(sideEffects.realpath).not.toHaveBeenCalled();
    expect(sideEffects.stat).not.toHaveBeenCalled();
    expect(sideEffects.createHash).not.toHaveBeenCalled();
    expect(sideEffects.spawn).not.toHaveBeenCalled();
    expect(sideEffects.request).not.toHaveBeenCalled();
    expect(timer).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
