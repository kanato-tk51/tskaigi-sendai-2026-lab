import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";

import { beforeEach, describe, expect, it, vi } from "vitest";

const spawnMock = vi.hoisted(() => vi.fn());

vi.mock("node:child_process", () => ({ spawn: spawnMock }));

import { createProbeSession } from "../src/index.js";
import { createTestConfiguration } from "./helpers.js";

class FakeChild extends EventEmitter {
  readonly stdout = new PassThrough();
  readonly stderr = new PassThrough();
  readonly kill = vi.fn(() => true);
}

beforeEach(() => {
  spawnMock.mockReset();
  spawnMock.mockImplementation(() => {
    const child = new FakeChild();
    queueMicrotask(() => {
      child.stdout.end('{"probeChild":"ok"}\n');
      child.stderr.end();
      child.emit("close", 0);
    });
    return child;
  });
});

describe("fixed child executable integrity", () => {
  it("uses the trusted initialization snapshot after process.execPath changes", async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      process,
      "execPath",
    );
    expect(originalDescriptor).toBeDefined();
    const trustedExecutable = process.execPath;
    const fixture = await createTestConfiguration(
      [
        {
          targetId: "child-target",
          kind: "fixed-child",
          timeoutMs: 500,
          maxOutputBytes: 1024,
        },
      ],
      [
        {
          attemptId: "child-attempt",
          type: "child-node-process",
          targetId: "child-target",
          enabled: true,
        },
      ],
      [{ targetId: "child-target", kind: "fixed-child" }],
    );
    const configuration = fixture.configuration;

    const fakeExecutable = "/tmp/probe-core-fake-node";
    Object.defineProperty(process, "execPath", {
      ...originalDescriptor,
      value: fakeExecutable,
    });
    try {
      const session = await createProbeSession(configuration);
      const event = await session.runAttempt("child-attempt");
      await session.close();
      expect(event).toMatchObject({
        outcome: "success",
        details: {
          kind: "child",
          exitCode: 0,
          responseVerified: true,
        },
      });
      expect(spawnMock).toHaveBeenCalledTimes(1);
      const [executable, arguments_, options] = spawnMock.mock.calls[0]!;
      expect(executable).toBe(trustedExecutable);
      expect(executable).not.toBe(fakeExecutable);
      expect(arguments_).toHaveLength(1);
      expect(arguments_[0]).toMatch(
        /packages\/probe-core\/src\/fixed-child\.js$/u,
      );
      expect(options).toEqual({
        shell: false,
        env: {},
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });
      expect(JSON.stringify(event)).not.toContain(trustedExecutable);
      expect(JSON.stringify(event)).not.toContain(arguments_[0]);
    } finally {
      Object.defineProperty(process, "execPath", originalDescriptor!);
      await fixture.cleanup();
    }
  });
});
