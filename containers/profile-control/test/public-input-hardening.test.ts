import { Buffer } from "node:buffer";
import vm from "node:vm";

import { describe, expect, it } from "vitest";

import {
  FIXED_BASE_IMAGE_ARCHITECTURE,
  FIXED_BASE_IMAGE_NAME,
  FIXED_BASE_IMAGE_OS,
  FIXED_BASE_IMAGE_TAG,
  FIXED_DOCKER_CLI_VERSION,
  FIXED_DOCKER_SERVER_VERSION,
  FIXED_NODE_VERSION,
  FIXED_STAGING_FILES,
} from "../src/constants.js";
import { expectedControls } from "../src/definitions.js";
import { fixedContainerArguments } from "../src/docker-plan.js";
import { executeFixedDoctor, type FixedDoctorBackend } from "../src/doctor.js";
import { ProfileControlError } from "../src/errors.js";
import { parseOrchestratorArguments } from "../src/orchestrator.js";
import { serializeCanonicalPairExecutionResult } from "../src/run-controls.js";
import {
  captureAuthority,
  readPlainArray,
  readPlainRecord,
  snapshotBytes,
} from "../src/safe-data.js";
import {
  copyPreparedStagingFile,
  prepareStagingInput,
} from "../src/staging.js";

const encoder = new TextEncoder();
const exactDigest =
  "sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0";

function expectCode(action: () => unknown, code: string): void {
  try {
    action();
    throw new Error("EXPECTED_PROFILE_CONTROL_ERROR");
  } catch (error) {
    expect(error).toBeInstanceOf(ProfileControlError);
    expect((error as ProfileControlError).code).toBe(code);
  }
}

describe("M4 public-input hardening", () => {
  it("rejects invalid primitive profile selectors before selecting output", () => {
    let traps = 0;
    const proxy = new Proxy(
      {},
      {
        get() {
          traps += 1;
          throw new Error("selector proxy");
        },
        getOwnPropertyDescriptor() {
          traps += 1;
          throw new Error("selector proxy");
        },
        getPrototypeOf() {
          traps += 1;
          throw new Error("selector proxy");
        },
      },
    );
    for (const rejected of [
      "PERMISSIVE",
      "",
      null,
      undefined,
      0,
      true,
      proxy,
    ]) {
      expectCode(() => expectedControls(rejected as never), "INVALID_PROFILE");
      expectCode(
        () => fixedContainerArguments(rejected as never),
        "INVALID_DOCKER_PLAN",
      );
    }
    expect(traps).toBe(0);
    expect(expectedControls("permissive")[0]?.reason).toBe("ENV_PRESENT");
    expect(expectedControls("constrained")[0]?.reason).toBe("ENV_ABSENT");
    expect(fixedContainerArguments("permissive")[0]).toBe(
      "/opt/m4-control/control-runner.mjs",
    );
    expect(fixedContainerArguments("constrained")[0]).toBe(
      "--experimental-permission",
    );
  });

  it("rejects Proxy, accessor, prototype, symbol, and dense-shape drift without hooks", () => {
    let traps = 0;
    const proxy = new Proxy(
      { value: "ok" },
      {
        get() {
          traps += 1;
          throw new Error("proxy trap");
        },
        getOwnPropertyDescriptor() {
          traps += 1;
          throw new Error("proxy trap");
        },
        getPrototypeOf() {
          traps += 1;
          throw new Error("proxy trap");
        },
      },
    );
    expectCode(
      () => readPlainRecord(proxy, "INVALID_PROFILE"),
      "INVALID_PROFILE",
    );
    expect(traps).toBe(0);

    let getters = 0;
    const accessor = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(accessor, "value", {
      enumerable: true,
      get() {
        getters += 1;
        throw new Error("accessor");
      },
    });
    expectCode(
      () => readPlainRecord(accessor, "INVALID_PROFILE"),
      "INVALID_PROFILE",
    );
    expect(getters).toBe(0);

    for (const rejected of [
      Object.assign(Object.create({ inherited: true }), { value: "ok" }),
      vm.runInNewContext("({ value: 'ok' })") as unknown,
      Object.assign({ value: "ok" }, { [Symbol("extra")]: true }),
      Object.defineProperty({}, "value", {
        value: "ok",
        enumerable: false,
      }),
    ]) {
      expectCode(
        () => readPlainRecord(rejected, "INVALID_PROFILE"),
        "INVALID_PROFILE",
      );
    }

    const sparse = new Array(1);
    const extra = ["ok"] as unknown[] & { extra?: boolean };
    extra.extra = true;
    const elementAccessor: unknown[] = [];
    Object.defineProperty(elementAccessor, "0", {
      enumerable: true,
      configurable: true,
      get() {
        getters += 1;
        throw new Error("array accessor");
      },
    });
    Object.defineProperty(elementAccessor, "length", { value: 1 });
    for (const rejected of [
      sparse,
      extra,
      elementAccessor,
      { 0: "ok", length: 1 },
    ]) {
      expectCode(
        () => readPlainArray(rejected, "INVALID_PROFILE"),
        "INVALID_PROFILE",
      );
    }
    expect(getters).toBe(0);

    Object.defineProperty(Object.prototype, "m4Polluted", {
      configurable: true,
      value: "not-consumed",
    });
    try {
      expect(readPlainRecord({ value: "ok" }, "INVALID_PROFILE")).toEqual({
        value: "ok",
      });
    } finally {
      delete (Object.prototype as { m4Polluted?: unknown }).m4Polluted;
    }
  });

  it("copies only fixed ordinary Uint8Array and Buffer ranges and rejects unsafe storage", () => {
    const backing = new ArrayBuffer(8);
    const whole = new Uint8Array(backing);
    whole.set([9, 1, 2, 3, 9], 1);
    const selected = new Uint8Array(backing, 2, 3);
    const snapshot = snapshotBytes(selected, {
      code: "INVALID_STAGING_INPUT",
      maximum: 8,
      allowEmpty: false,
    });
    expect([...snapshot]).toEqual([1, 2, 3]);
    selected[0] = 7;
    expect([...snapshot]).toEqual([1, 2, 3]);
    expect([
      ...snapshotBytes(Buffer.from([4, 5]), {
        code: "INVALID_STAGING_INPUT",
        maximum: 8,
      }),
    ]).toEqual([4, 5]);

    class ByteSubclass extends Uint8Array {}
    const expando = new Uint8Array([1]) as Uint8Array & { extra?: unknown };
    Object.defineProperty(expando, "extra", {
      enumerable: true,
      get() {
        throw new Error("byte accessor");
      },
    });
    const detachedBuffer = new ArrayBuffer(1);
    const detached = new Uint8Array(detachedBuffer);
    structuredClone(detachedBuffer, { transfer: [detachedBuffer] });
    const rejected: unknown[] = [
      new Proxy(new Uint8Array([1]), {}),
      new ByteSubclass([1]),
      new Int8Array([1]),
      new DataView(new ArrayBuffer(1)),
      new ArrayBuffer(1),
      expando,
      detached,
      vm.runInNewContext("new Uint8Array([1])") as unknown,
    ];
    if (typeof SharedArrayBuffer === "function") {
      rejected.push(new Uint8Array(new SharedArrayBuffer(1)));
    }
    for (const value of rejected) {
      expectCode(
        () =>
          snapshotBytes(value, {
            code: "INVALID_STAGING_INPUT",
            maximum: 8,
          }),
        "INVALID_STAGING_INPUT",
      );
    }

    const resizableGetter = Object.getOwnPropertyDescriptor(
      ArrayBuffer.prototype,
      "resizable",
    )?.get;
    if (resizableGetter !== undefined) {
      const ResizableArrayBuffer = ArrayBuffer as unknown as new (
        byteLength: number,
        options: { readonly maxByteLength: number },
      ) => ArrayBuffer;
      const maybeResizable = new ResizableArrayBuffer(1, {
        maxByteLength: 2,
      });
      expect(Reflect.apply(resizableGetter, maybeResizable, [])).toBe(true);
      expectCode(
        () =>
          snapshotBytes(new Uint8Array(maybeResizable), {
            code: "INVALID_STAGING_INPUT",
            maximum: 8,
          }),
        "INVALID_STAGING_INPUT",
      );
    }
  });

  it("captures plain and class authority once and rejects authority hooks", async () => {
    interface Backend {
      run(value: string): Promise<string>;
      cleanup(): Promise<void>;
    }
    class ClassBackend implements Backend {
      calls = 0;
      async run(value: string): Promise<string> {
        this.calls += 1;
        return value;
      }
      async cleanup(): Promise<void> {
        this.calls += 1;
      }
    }
    const carrier = new ClassBackend();
    const authority = captureAuthority<Backend>(
      carrier,
      ["run", "cleanup"],
      "INVALID_DOCTOR_OUTPUT",
    );
    const originalRun = carrier.run;
    carrier.run = async () => "replaced";
    expect(await authority.run("captured")).toBe("captured");
    expect(carrier.calls).toBe(1);
    carrier.run = originalRun;

    let hooks = 0;
    const accessorCarrier = {
      get run() {
        hooks += 1;
        throw new Error("method accessor");
      },
      async cleanup() {},
    };
    expectCode(
      () =>
        captureAuthority<Backend>(
          accessorCarrier,
          ["run", "cleanup"],
          "INVALID_DOCTOR_OUTPUT",
        ),
      "INVALID_DOCTOR_OUTPUT",
    );
    expect(hooks).toBe(0);
    for (const rejected of [
      new Proxy(carrier, {
        get() {
          hooks += 1;
          throw new Error("carrier proxy");
        },
      }),
      { run: new Proxy(async () => "ok", {}), async cleanup() {} },
      { run: "not-callable", async cleanup() {} },
    ]) {
      expectCode(
        () =>
          captureAuthority<Backend>(
            rejected,
            ["run", "cleanup"],
            "INVALID_DOCTOR_OUTPUT",
          ),
        "INVALID_DOCTOR_OUTPUT",
      );
    }
    expect(hooks).toBe(0);
  });

  it("captures doctor methods before await and snapshots each settled return", async () => {
    const outputs = [
      {
        client: FIXED_DOCKER_CLI_VERSION,
        server: FIXED_DOCKER_SERVER_VERSION,
      },
      {
        architecture: FIXED_BASE_IMAGE_ARCHITECTURE,
        id: exactDigest,
        os: FIXED_BASE_IMAGE_OS,
        repoDigests: [`${FIXED_BASE_IMAGE_NAME}@${exactDigest}`],
      },
      {
        architecture: FIXED_BASE_IMAGE_ARCHITECTURE,
        environmentKeys: ["PATH", "NODE_VERSION", "YARN_VERSION"],
        id: exactDigest,
        os: FIXED_BASE_IMAGE_OS,
        repoDigests: [`${FIXED_BASE_IMAGE_NAME}@${exactDigest}`],
      },
    ].map((value) => encoder.encode(`${JSON.stringify(value)}\n`));
    let calls = 0;
    let cleanupCalls = 0;
    const firstReturn: Record<string, unknown> = Object.create(null);
    const backend: FixedDoctorBackend = {
      async run() {
        const stdout = outputs[calls]!;
        calls += 1;
        const result = {
          exitCode: 0,
          timedOut: false,
          outputLimitExceeded: false,
          stdoutBytes: stdout.byteLength,
          stderrBytes: 0,
          stdout,
        };
        if (calls === 1) Object.assign(firstReturn, result);
        if (calls === 2) {
          firstReturn.exitCode = 9;
          (firstReturn.stdout as Uint8Array)[0] = 0;
        }
        return result;
      },
      async cleanup() {
        cleanupCalls += 1;
      },
    };
    const resultPromise = executeFixedDoctor(backend);
    backend.run = async () => {
      throw new Error("replacement must not run");
    };
    backend.cleanup = async () => {
      throw new Error("replacement must not run");
    };
    const result = await resultPromise;
    expect(result.validity).toBe("accepted");
    if (result.validity === "accepted") {
      expect(result.inventory.nodeVersion).toBe(FIXED_NODE_VERSION);
      expect(result.inventory.baseImageTag).toBe(FIXED_BASE_IMAGE_TAG);
    }
    expect(calls).toBe(3);
    expect(cleanupCalls).toBe(1);
  });

  it("keeps private staging bytes non-aliased and rejects argument Proxy without traps", () => {
    const originals = FIXED_STAGING_FILES.map((logicalPath, index) => ({
      logicalPath,
      bytes: new Uint8Array([index + 1]),
    }));
    const prepared = prepareStagingInput(originals);
    originals[0]!.bytes[0] = 99;
    const first = copyPreparedStagingFile(prepared, FIXED_STAGING_FILES[0]);
    expect([...first]).toEqual([1]);
    first[0] = 88;
    expect([
      ...copyPreparedStagingFile(prepared, FIXED_STAGING_FILES[0]),
    ]).toEqual([1]);

    let traps = 0;
    const args = new Proxy(["doctor"], {
      get() {
        traps += 1;
        throw new Error("argv trap");
      },
    });
    expectCode(
      () => parseOrchestratorArguments(args),
      "ORCHESTRATOR_ARGUMENT_REJECTED",
    );
    expect(traps).toBe(0);
  });

  it("reconstructs the complete pair-result wrapper before serialization", () => {
    const bytes = serializeCanonicalPairExecutionResult({
      validity: "inconclusive",
      primaryFailure: "COMMAND_FAILURE",
      completedSteps: Object.freeze([]),
      permissive: null,
      constrained: null,
    });
    expect(new TextDecoder().decode(bytes)).toBe(
      '{"validity":"inconclusive","primaryFailure":"COMMAND_FAILURE","completedSteps":[],"permissive":null,"constrained":null}\n',
    );
    let traps = 0;
    const resultProxy = new Proxy(
      {
        validity: "inconclusive",
        primaryFailure: "COMMAND_FAILURE",
        completedSteps: [],
        permissive: null,
        constrained: null,
      },
      {
        get() {
          traps += 1;
          throw new Error("pair trap");
        },
      },
    );
    expectCode(
      () => serializeCanonicalPairExecutionResult(resultProxy as never),
      "EXECUTION_INCONCLUSIVE",
    );
    expect(traps).toBe(0);

    const cyclicSteps: unknown[] = [];
    cyclicSteps.push(cyclicSteps);
    expectCode(
      () =>
        serializeCanonicalPairExecutionResult({
          validity: "inconclusive",
          primaryFailure: "COMMAND_FAILURE",
          completedSteps: cyclicSteps,
          permissive: null,
          constrained: null,
        } as never),
      "EXECUTION_INCONCLUSIVE",
    );
  });
});
