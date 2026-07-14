import { describe, expect, it } from "vitest";

import { normalizeProbeError } from "../src/index.js";

function nodeError(code: string, raw: string): object {
  return Object.defineProperties(
    {},
    {
      code: { enumerable: true, value: code },
      message: { enumerable: true, value: raw },
      path: { enumerable: true, value: raw },
    },
  );
}

describe("operation-specific error taxonomy", () => {
  for (const code of ["EACCES", "EPERM"] as const) {
    it(`classifies ${code} by read, hash, and write context`, () => {
      const error = nodeError(code, "/tmp/raw-disposable-path");
      expect(normalizeProbeError(error, "read")).toBe("READ_DENIED");
      expect(normalizeProbeError(error, "hash")).toBe("HASH_DENIED");
      expect(normalizeProbeError(error, "write")).toBe("WRITE_DENIED");
    });
  }

  it("does not evaluate a throwing code getter", () => {
    let getterCalls = 0;
    const error = Object.defineProperty({}, "code", {
      enumerable: true,
      get() {
        getterCalls += 1;
        throw new Error("raw disposable path");
      },
    });
    expect(normalizeProbeError(error, "read")).toBe("INTERNAL_ERROR");
    expect(getterCalls).toBe(0);
  });

  it("rejects Proxy, non-object, and unknown errors as INTERNAL_ERROR", () => {
    const proxy = new Proxy(
      {},
      {
        getOwnPropertyDescriptor() {
          throw new Error("raw disposable canary");
        },
      },
    );
    expect(normalizeProbeError(proxy, "hash")).toBe("INTERNAL_ERROR");
    expect(normalizeProbeError("raw disposable canary", "write")).toBe(
      "INTERNAL_ERROR",
    );
    expect(
      normalizeProbeError(
        nodeError("EUNKNOWN", "/tmp/raw-disposable-path"),
        "read",
      ),
    ).toBe("INTERNAL_ERROR");
  });

  it("maps missing, already-existing, and symlink failures explicitly", () => {
    expect(normalizeProbeError(nodeError("ENOENT", "raw"), "read")).toBe(
      "FILE_NOT_FOUND",
    );
    expect(normalizeProbeError(nodeError("EEXIST", "raw"), "write")).toBe(
      "FILE_ALREADY_EXISTS",
    );
    expect(normalizeProbeError(nodeError("ELOOP", "raw"), "hash")).toBe(
      "SYMLINK_ESCAPE",
    );
  });

  it("never returns raw error message, stack, or path text", () => {
    const raw = "/tmp/raw-disposable-path-and-canary";
    const normalized = normalizeProbeError(nodeError("EACCES", raw), "read");
    expect(normalized).toBe("READ_DENIED");
    expect(normalized).not.toContain(raw);
  });
});
