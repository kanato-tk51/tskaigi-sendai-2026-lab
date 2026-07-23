import { createHash } from "node:crypto";
import {
  chmod,
  link,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import {
  captureExecutorFileIdentityForTest,
  executeFrozenResearchBoundaryForTest,
  parseCanonicalPairResultForTest,
  type ExecutorBoundariesForTest,
  type ExecutorChildForTest,
  type ExecutorIdentityLeaseForTest,
  type ExecutorStreamForTest,
} from "../src/frozen-research-profile-control-executor.js";

const controlRoot = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
const repositoryRoot = path.resolve(controlRoot, "../..");
const sourcePath = path.join(
  controlRoot,
  "src/frozen-research-profile-control-executor.ts",
);
const javascriptPath = path.join(
  controlRoot,
  "dist/frozen-research-profile-control-executor.js",
);
const declarationPath = path.join(
  controlRoot,
  "dist/frozen-research-profile-control-executor.d.ts",
);
const exactImports = `import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants, type BigIntStats } from "node:fs";
import {
  lstat,
  open,
  readdir,
  realpath,
  type FileHandle,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
`;
const exactJavascriptImports = `import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, readdir, realpath, } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
`;
const expectedSpecifiers = [
  "node:child_process",
  "node:crypto",
  "node:fs",
  "node:fs/promises",
  "node:path",
  "node:process",
  "node:url",
];
const encoder = new TextEncoder();

function sha256(input: Uint8Array | string): string {
  return createHash("sha256").update(input).digest("hex");
}

function importSpecifiers(source: string, scriptKind: ts.ScriptKind): string[] {
  const file = ts.createSourceFile(
    "wrapper",
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
  const specifiers: string[] = [];
  function visit(node: ts.Node): void {
    if (
      (ts.isCallExpression(node) || ts.isNewExpression(node)) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          ["require", "eval", "createRequire", "Function"].includes(
            node.expression.text,
          )) ||
        (ts.isPropertyAccessExpression(node.expression) &&
          ["require", "eval", "createRequire", "getBuiltinModule"].includes(
            node.expression.name.text,
          )) ||
        (ts.isElementAccessExpression(node.expression) &&
          ts.isStringLiteral(node.expression.argumentExpression) &&
          ["require", "eval", "createRequire", "getBuiltinModule"].includes(
            node.expression.argumentExpression.text,
          )))
    ) {
      throw new Error("M4_WRAPPER_DYNAMIC_EDGE");
    }
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined
    ) {
      if (!ts.isStringLiteral(node.moduleSpecifier)) {
        throw new Error("M4_WRAPPER_COMPUTED_EDGE");
      }
      specifiers.push(node.moduleSpecifier.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return specifiers;
}

function validateWrapperEdges(
  source: string,
  scriptKind: ts.ScriptKind,
  exactImportBlock: string,
): void {
  if (!source.startsWith(exactImportBlock)) {
    throw new Error("M4_WRAPPER_BINDING");
  }
  if (
    importSpecifiers(source, scriptKind).join("\0") !==
    expectedSpecifiers.join("\0")
  ) {
    throw new Error("M4_WRAPPER_EDGE_SET");
  }
}

function assertReviewedObject(
  bytes: Uint8Array,
  expectedBytes: number,
  expectedHash: string,
  scriptKind?: ts.ScriptKind,
  exactImportBlock?: string,
): void {
  if (bytes.byteLength !== expectedBytes || sha256(bytes) !== expectedHash) {
    throw new Error("M4_WRAPPER_TRUST_ANCHOR");
  }
  if (scriptKind !== undefined && exactImportBlock !== undefined) {
    validateWrapperEdges(
      new TextDecoder().decode(bytes),
      scriptKind,
      exactImportBlock,
    );
  }
}

function completion(profileId: "permissive" | "constrained", runId: string) {
  const permissive = profileId === "permissive";
  return {
    schemaVersion: "lab-profile-control-completion/v1",
    runId,
    controlId: permissive ? "m4-profile-control-p" : "m4-profile-control-c",
    profileId,
    containerImageDigest:
      "sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd",
    hostInspectionComplete: true,
    controlEvidenceComplete: true,
    evidenceTransferred: true,
    manifestSha256: `sha256:${"1".repeat(64)}`,
    hostInspectionSha256: `sha256:${"2".repeat(64)}`,
    controlEvidenceSha256: `sha256:${"3".repeat(64)}`,
    inventory: permissive
      ? [
          "input/control-manifest.json",
          "host/host-inspection.json",
          "container-result/control-evidence.json",
          "container-result/result-marker.txt",
          "scratch/scratch-marker.txt",
          "host/completion.json",
          "host/comparison.json",
        ]
      : [
          "input/control-manifest.json",
          "host/host-inspection.json",
          "container-result/control-evidence.json",
          "container-result/result-marker.txt",
          "host/completion.json",
          "host/comparison.json",
        ],
    complete: true,
  };
}

function completeProfile(profileId: "permissive" | "constrained") {
  const runId = `m4-profile-control-${profileId === "permissive" ? "p" : "c"}-20260720-02`;
  const completedSteps = [
    "create",
    "inspect",
    "start",
    "transfer",
    "remove",
  ].map((step) => `${profileId}:${step}`);
  return {
    validity: "complete",
    primaryFailure: null,
    completedSteps,
    comparison: {
      runId,
      profileId,
      complete: true,
      mismatchCount: 0,
      mismatches: [],
    },
    completion: completion(profileId, runId),
  };
}

function pairBytes(validity: "complete" | "inconclusive"): Uint8Array {
  const value =
    validity === "complete"
      ? (() => {
          const permissive = completeProfile("permissive");
          const constrained = completeProfile("constrained");
          return {
            validity: "complete",
            primaryFailure: null,
            completedSteps: [
              ...permissive.completedSteps,
              ...constrained.completedSteps,
            ],
            permissive,
            constrained,
          };
        })()
      : {
          validity: "inconclusive",
          primaryFailure: "COMMAND_FAILURE",
          completedSteps: [],
          permissive: null,
          constrained: null,
        };
  return encoder.encode(`${JSON.stringify(value)}\n`);
}

class FakeStream implements ExecutorStreamForTest {
  private readonly listeners: Array<(chunk: Uint8Array) => void> = [];

  on(_event: "data", listener: (chunk: Uint8Array) => void): void {
    this.listeners.push(listener);
  }

  emit(bytes: Uint8Array): void {
    for (const listener of this.listeners) listener(bytes);
  }
}

class FakeChild implements ExecutorChildForTest {
  readonly pid: number;
  readonly stdout: FakeStream | null;
  readonly stderr: FakeStream | null;
  private readonly listeners = new Map<
    string,
    Array<(...args: unknown[]) => void>
  >();

  constructor(options?: {
    readonly pid?: number;
    readonly stdout?: boolean;
    readonly stderr?: boolean;
  }) {
    this.pid = options?.pid ?? 4242;
    this.stdout = options?.stdout === false ? null : new FakeStream();
    this.stderr = options?.stderr === false ? null : new FakeStream();
  }

  on(event: string, listener: (...args: unknown[]) => void): void {
    const listeners = this.listeners.get(event) ?? [];
    listeners.push(listener);
    this.listeners.set(event, listeners);
  }

  emit(event: string, ...args: unknown[]): void {
    for (const listener of this.listeners.get(event) ?? []) listener(...args);
  }
}

class FakeLease implements ExecutorIdentityLeaseForTest {
  validations = 0;
  closes = 0;

  constructor(
    private readonly failValidationAt: number | null = null,
    private readonly failClose = false,
    private readonly events: string[] = [],
  ) {}

  async validate(): Promise<void> {
    this.validations += 1;
    this.events.push(`validate:${this.validations}`);
    if (this.validations === this.failValidationAt) throw new Error("identity");
  }

  async close(): Promise<void> {
    this.closes += 1;
    this.events.push("close");
    if (this.failClose) throw new Error("close");
  }
}

interface TimerRow {
  readonly milliseconds: number;
  readonly callback: () => void;
  cancelled: boolean;
}

function harness(options?: {
  readonly spawnError?: boolean;
  readonly signalResult?: boolean;
  readonly signalResults?: Readonly<
    Partial<Record<"SIGTERM" | "SIGKILL", boolean>>
  >;
  readonly lease?: FakeLease;
  readonly child?: ConstructorParameters<typeof FakeChild>[0];
}) {
  const events: string[] = [];
  const child = new FakeChild(options?.child);
  const lease = options?.lease ?? new FakeLease(null, false, events);
  const timers: TimerRow[] = [];
  const stdout: Uint8Array[] = [];
  const stderr: Uint8Array[] = [];
  const signals: string[] = [];
  let exitCode: number | null = null;
  let spawns = 0;
  const boundaries: ExecutorBoundariesForTest = {
    spawnChild: () => {
      spawns += 1;
      events.push("spawn");
      if (options?.spawnError) throw new Error("spawn");
      return child;
    },
    signalGroup: (_pid, signal) => {
      signals.push(signal);
      events.push(`signal:${signal}`);
      return options?.signalResults?.[signal] ?? options?.signalResult ?? true;
    },
    schedule: (callback, milliseconds) => {
      const row = { callback, milliseconds, cancelled: false };
      timers.push(row);
      return row;
    },
    cancel: (handle) => {
      (handle as TimerRow).cancelled = true;
    },
    writeStdout: (bytes) => {
      events.push("write:stdout");
      stdout.push(bytes);
    },
    writeStderr: (bytes) => {
      events.push("write:stderr");
      stderr.push(bytes);
    },
    setExitCode: (code) => {
      events.push(`exit:${code}`);
      exitCode = code;
    },
  };
  return {
    boundaries,
    child,
    events,
    lease,
    signals,
    stderr,
    stdout,
    timers,
    get exitCode() {
      return exitCode;
    },
    get spawns() {
      return spawns;
    },
  };
}

function parsedActivationOutput(bytes: Uint8Array): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
}

describe("M4 frozen-research activation wrapper", () => {
  it("binds exact construction, inventories, imports, package edge, and fresh IDs", async () => {
    const [
      source,
      javascript,
      declaration,
      constantsSource,
      constantsJs,
      constantsDts,
    ] = await Promise.all([
      readFile(sourcePath),
      readFile(javascriptPath),
      readFile(declarationPath),
      readFile(path.join(controlRoot, "src/constants.ts")),
      readFile(path.join(controlRoot, "dist/constants.js")),
      readFile(path.join(controlRoot, "dist/constants.d.ts")),
    ]);
    expect([source.byteLength, sha256(source)]).toEqual([
      42_865,
      "80829982f10266f27382393cb07faa8c41eff1de677788e018f671b7752a3174",
    ]);
    expect([javascript.byteLength, sha256(javascript)]).toEqual([
      41_159,
      "ab36b509837ea32353df60f5319bbdca865c284ed809b313c0de32692dd7294d",
    ]);
    expect([declaration.byteLength, sha256(declaration)]).toEqual([
      1_244,
      "ed1e6145b9f3adc43234bd82720e22041f61a514124b3531cf99560dbd9d92f5",
    ]);
    expect(source.toString("utf8").startsWith(exactImports)).toBe(true);
    expect(importSpecifiers(source.toString("utf8"), ts.ScriptKind.TS)).toEqual(
      expectedSpecifiers,
    );
    expect(
      importSpecifiers(javascript.toString("utf8"), ts.ScriptKind.JS),
    ).toEqual(expectedSpecifiers);
    expect(source.toString("utf8")).not.toMatch(
      /(?:from\s+["'](?:\.|\/|file:)|\b(?:require|createRequire|eval)\s*\(|\bimport\s*\()/u,
    );
    expect([constantsSource.byteLength, sha256(constantsSource)]).toEqual([
      4_635,
      "60d0512bd55c87b990f1476fa4634e54661feac81d2abf59dc7975058ac96f65",
    ]);
    expect([constantsJs.byteLength, sha256(constantsJs)]).toEqual([
      4_298,
      "2e6109fcf9f6cb779b7f402ff9e172f18ecfe95771033f21b490a538ddb465cb",
    ]);
    expect([constantsDts.byteLength, sha256(constantsDts)]).toEqual([
      4_628,
      "d4fc330fee498a9b4c3f1c6d2e9be35ef793a3412d43d8059910bbd516319651",
    ]);
    expect((await readdir(path.join(controlRoot, "src"))).sort()).toHaveLength(
      32,
    );
    expect((await readdir(path.join(controlRoot, "dist"))).sort()).toHaveLength(
      64,
    );
    const packageJson = JSON.parse(
      await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
    ) as { readonly scripts: Readonly<Record<string, string>> };
    expect(packageJson.scripts["m4:execute:frozen-research"]).toBe(
      "node containers/profile-control/dist/frozen-research-profile-control-executor.js",
    );
    expect(source.toString("utf8")).not.toContain("20260720-01");
    expect(source.toString("utf8")).toContain("20260720-02");
  });

  it("uses the three reviewed full objects as the external pre-command trust anchor", async () => {
    const [source, javascript, declaration] = await Promise.all([
      readFile(sourcePath),
      readFile(javascriptPath),
      readFile(declarationPath),
    ]);
    assertReviewedObject(
      source,
      42_865,
      "80829982f10266f27382393cb07faa8c41eff1de677788e018f671b7752a3174",
      ts.ScriptKind.TS,
      exactImports,
    );
    assertReviewedObject(
      javascript,
      41_159,
      "ab36b509837ea32353df60f5319bbdca865c284ed809b313c0de32692dd7294d",
      ts.ScriptKind.JS,
      exactJavascriptImports,
    );
    assertReviewedObject(
      declaration,
      1_244,
      "ed1e6145b9f3adc43234bd82720e22041f61a514124b3531cf99560dbd9d92f5",
    );

    const samePrefixBodyChange = Uint8Array.from(source);
    const mutationIndex = samePrefixBodyChange.byteLength - 2;
    samePrefixBodyChange[mutationIndex] =
      (samePrefixBodyChange[mutationIndex] ?? 0) ^ 1;
    expect(() =>
      assertReviewedObject(
        samePrefixBodyChange,
        42_865,
        "80829982f10266f27382393cb07faa8c41eff1de677788e018f671b7752a3174",
        ts.ScriptKind.TS,
        exactImports,
      ),
    ).toThrow("M4_WRAPPER_TRUST_ANCHOR");
    expect(() =>
      assertReviewedObject(
        encoder.encode(`${new TextDecoder().decode(source)}\neval("extra");`),
        42_865,
        "80829982f10266f27382393cb07faa8c41eff1de677788e018f671b7752a3174",
        ts.ScriptKind.TS,
        exactImports,
      ),
    ).toThrow("M4_WRAPPER_TRUST_ANCHOR");
  });

  it("rejects every missing, extra, reordered, alternate, or unleased wrapper edge", async () => {
    const [source, javascript] = await Promise.all([
      readFile(sourcePath, "utf8"),
      readFile(javascriptPath, "utf8"),
    ]);
    validateWrapperEdges(source, ts.ScriptKind.TS, exactImports);
    validateWrapperEdges(javascript, ts.ScriptKind.JS, exactJavascriptImports);

    const sourceImportRows = exactImports.match(/^import[\s\S]*?;\n/gmu) ?? [];
    expect(sourceImportRows).toHaveLength(7);
    const invalidBindings = [
      [
        'import { spawn } from "node:child_process";',
        'import { exec } from "node:child_process";',
      ],
      [
        'import { createHash } from "node:crypto";',
        'import { webcrypto } from "node:crypto";',
      ],
      [
        'import { constants, type BigIntStats } from "node:fs";',
        'import { constants as fsConstants, type BigIntStats } from "node:fs";',
      ],
      [
        '  type FileHandle,\n} from "node:fs/promises";',
        '  readFile,\n  type FileHandle,\n} from "node:fs/promises";',
      ],
      ['import path from "node:path";', 'import * as path from "node:path";'],
      [
        'import process from "node:process";',
        'import { argv } from "node:process";',
      ],
      [
        'import { fileURLToPath } from "node:url";',
        'import { pathToFileURL } from "node:url";',
      ],
    ] as const;
    const invalidSources = [
      ...sourceImportRows.map((row) => source.replace(row, "")),
      `${source}\nimport { readFile } from "node:fs/promises";\n`,
      source.replace(
        `${sourceImportRows[0]}${sourceImportRows[1]}`,
        `${sourceImportRows[1]}${sourceImportRows[0]}`,
      ),
      ...invalidBindings.map(([before, after]) =>
        source.replace(before, after),
      ),
    ];
    for (const invalid of invalidSources) {
      expect(() =>
        validateWrapperEdges(invalid, ts.ScriptKind.TS, exactImports),
      ).toThrow();
    }

    const invalidJavascript = [
      javascript.replace(
        'import { spawn } from "node:child_process";',
        'import { exec as spawn } from "node:child_process";',
      ),
      javascript.replace(
        'import { lstat, open, readdir, realpath, } from "node:fs/promises";',
        'import { lstat, open, readFile, readdir, realpath, } from "node:fs/promises";',
      ),
    ];
    for (const invalid of invalidJavascript) {
      expect(() =>
        validateWrapperEdges(invalid, ts.ScriptKind.JS, exactJavascriptImports),
      ).toThrow();
    }

    for (const specifier of [
      "./relative.js",
      "../parent.js",
      "/absolute/entry.js",
      "file:///absolute/entry.js",
      "package-name",
      "package-name/subpath",
      "#import-map",
      "./frozen-research-profile-control-entry.js",
      "./orchestrator-entry.js",
      "./control-host-backend.js",
      "./run-controls.js",
    ]) {
      const invalid = `${source}\nimport value from ${JSON.stringify(specifier)};\n`;
      expect(() =>
        validateWrapperEdges(invalid, ts.ScriptKind.TS, exactImports),
      ).toThrow();
    }

    for (const loadingForm of [
      'import("./entry.js");',
      "import(moduleName);",
      'require("./entry.js");',
      'createRequire(import.meta.url)("./entry.js");',
      'module.createRequire(import.meta.url)("./entry.js");',
      'globalThis["require"]("./entry.js");',
      'globalThis.eval("entry");',
      'globalThis["eval"]("entry");',
      'process.getBuiltinModule("fs");',
      'new Function("return import(\\"./entry.js\\")");',
    ]) {
      expect(() => importSpecifiers(loadingForm, ts.ScriptKind.TS)).toThrow();
    }
    expect(() =>
      validateWrapperEdges(
        `${source}\nexport { value } from "./entry.js";\n`,
        ts.ScriptKind.TS,
        exactImports,
      ),
    ).toThrow();
  });

  it("holds a bounded file descriptor across replacement, mutation, mode, link, and symlink drift", async () => {
    const root = await mkdtemp(
      path.join(repositoryRoot, ".tmp/m4-executor-identity-"),
    );
    try {
      const target = path.join(root, "target.txt");
      const bytes = encoder.encode("fixed-bytes\n");
      await writeFile(target, bytes);
      await chmod(target, 0o664);
      const stable = await captureExecutorFileIdentityForTest(
        target,
        bytes.byteLength,
        sha256(bytes),
      );
      await stable.validate();
      await stable.close();

      await writeFile(target, bytes);
      await chmod(target, 0o664);
      const replaced = await captureExecutorFileIdentityForTest(
        target,
        bytes.byteLength,
        sha256(bytes),
      );
      await rename(target, path.join(root, "old.txt"));
      await writeFile(target, bytes);
      await chmod(target, 0o664);
      await expect(replaced.validate()).rejects.toThrow();
      await replaced.close();

      const mutated = await captureExecutorFileIdentityForTest(
        target,
        bytes.byteLength,
        sha256(bytes),
      );
      await writeFile(target, encoder.encode("other-byte!\n"));
      await expect(mutated.validate()).rejects.toThrow();
      await mutated.close();

      await writeFile(target, bytes);
      await chmod(target, 0o664);
      const mode = await captureExecutorFileIdentityForTest(
        target,
        bytes.byteLength,
        sha256(bytes),
      );
      await chmod(target, 0o2664);
      await expect(mode.validate()).rejects.toThrow();
      await mode.close();

      await chmod(target, 0o664);
      await link(target, path.join(root, "hardlink.txt"));
      await expect(
        captureExecutorFileIdentityForTest(
          target,
          bytes.byteLength,
          sha256(bytes),
        ),
      ).rejects.toThrow();
      await symlink(target, path.join(root, "symlink.txt"));
      await expect(
        captureExecutorFileIdentityForTest(
          path.join(root, "symlink.txt"),
          bytes.byteLength,
          sha256(bytes),
        ),
      ).rejects.toThrow();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["complete", 0, 0],
    ["inconclusive", 1, 1],
  ] as const)(
    "accepts a canonical %s child only after close",
    async (validity, childExit, wrapperExit) => {
      const test = harness();
      const pending = executeFrozenResearchBoundaryForTest(
        test.lease,
        test.boundaries,
      );
      test.child.stdout!.emit(pairBytes(validity));
      test.child.emit("exit", childExit, null);
      test.child.emit("close", childExit, null);
      await pending;
      expect(test.exitCode).toBe(wrapperExit);
      expect(test.spawns).toBe(1);
      expect(test.lease.validations).toBe(2);
      expect(test.lease.closes).toBe(1);
      expect(test.stderr).toEqual([]);
      const output = parsedActivationOutput(test.stdout[0]!);
      expect(output.validity).toBe(validity);
      expect(output.completedSteps).toEqual([
        "identity-preflight",
        "child-spawned",
        "child-closed",
        "identity-postflight",
        "control-result-validated",
      ]);
      expect(Object.keys(output)).toEqual([
        "schemaVersion",
        "expectedRevision",
        "validity",
        "primaryFailure",
        "completedSteps",
        "activation",
        "controlResult",
      ]);
      expect(Object.keys(output.activation as Record<string, unknown>)).toEqual(
        [
          "logicalRole",
          "sourceBytes",
          "sourceSha256",
          "executableBytes",
          "executableSha256",
          "identityStable",
        ],
      );
      const publicText = new TextDecoder().decode(test.stdout[0]);
      for (const privateField of [
        "pid",
        "target",
        "repositoryRoot",
        "dev",
        "ino",
        "uid",
        "gid",
        "mode",
        "mtimeNs",
        "ctimeNs",
        "SIGTERM",
        "SIGKILL",
      ]) {
        expect(publicText).not.toContain(privateField);
      }
      expect(
        test.events.filter(
          (event) =>
            event.startsWith("validate:") ||
            event === "close" ||
            event === "write:stdout",
        ),
      ).toEqual(["validate:1", "validate:2", "close", "write:stdout"]);
    },
  );

  it("settles a synchronous no-child failure with four total lease validations", async () => {
    const test = harness({ spawnError: true });
    await executeFrozenResearchBoundaryForTest(test.lease, test.boundaries);
    expect(test.spawns).toBe(1);
    expect(test.lease.validations).toBe(2);
    expect(test.lease.closes).toBe(1);
    expect(test.stdout).toEqual([]);
    expect(new TextDecoder().decode(test.stderr[0])).toBe(
      "M4_ACTIVATION_SPAWN_FAILED\n",
    );
    expect(test.exitCode).toBe(70);
  });

  it.each([1, 2] as const)(
    "suppresses the no-child terminal when post-spawn validation %s fails",
    async (failValidationAt) => {
      const lease = new FakeLease(failValidationAt);
      const test = harness({ spawnError: true, lease });
      await executeFrozenResearchBoundaryForTest(lease, test.boundaries);
      expect(lease.validations).toBe(failValidationAt);
      expect(lease.closes).toBe(1);
      expect(test.stdout).toEqual([]);
      expect(test.stderr).toEqual([]);
      expect(test.exitCode).toBe(70);
    },
  );

  it("suppresses the no-child terminal when reverse release fails", async () => {
    const lease = new FakeLease(null, true);
    const test = harness({ spawnError: true, lease });
    await executeFrozenResearchBoundaryForTest(lease, test.boundaries);
    expect(lease.validations).toBe(2);
    expect(lease.closes).toBe(1);
    expect(test.stdout).toEqual([]);
    expect(test.stderr).toEqual([]);
    expect(test.exitCode).toBe(70);
  });

  it("touches only the two exact fresh roots during production absence preflight", async () => {
    const source = await readFile(sourcePath, "utf8");
    const start = source.indexOf("async function captureProductionLease(");
    const end = source.indexOf(
      "    await hold(\n      captureDirectory",
      start,
    );
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const absenceBoundary = source.slice(start, end);
    expect(absenceBoundary.match(/await requireAbsent\(/gu)).toHaveLength(2);
    expect(absenceBoundary).toContain("PERMISSIVE_RUN_ID");
    expect(absenceBoundary).toContain("CONSTRAINED_RUN_ID");
    expect(absenceBoundary).not.toContain("20260720-01");
    expect(absenceBoundary).not.toContain("readdir(");
    expect(absenceBoundary).not.toContain("rm(");
    expect(absenceBoundary).not.toContain("unlink(");
  });

  it.each([
    ["stdout", { stdout: false }],
    ["stderr", { stderr: false }],
  ] as const)("rejects a child with null %s", async (_label, child) => {
    const test = harness({ child });
    const pending = executeFrozenResearchBoundaryForTest(
      test.lease,
      test.boundaries,
    );
    test.child.emit("exit", 0, null);
    test.child.emit("close", 0, null);
    await pending;
    const output = parsedActivationOutput(test.stdout[0]!);
    expect(output.primaryFailure).toBe("ACTIVATION_PROCESS_FAILURE");
    expect(output.completedSteps).toEqual([
      "identity-preflight",
      "child-spawned",
      "child-closed",
      "identity-postflight",
    ]);
  });

  it("fails closed without signaling an invalid child PID", async () => {
    const test = harness({ child: { pid: 0 } });
    const pending = executeFrozenResearchBoundaryForTest(
      test.lease,
      test.boundaries,
    );
    test.timers.find((timer) => timer.milliseconds === 90_000)!.callback();
    test.child.stdout!.emit(pairBytes("complete"));
    test.child.emit("exit", 0, null);
    test.child.emit("close", 0, null);
    await pending;
    expect(test.signals).toEqual([]);
    expect(parsedActivationOutput(test.stdout[0]!).primaryFailure).toBe(
      "ACTIVATION_TIMEOUT",
    );
  });

  it.each([
    ["missing exit", [] as const, [0, null] as const],
    [
      "duplicate exit",
      [
        [0, null],
        [0, null],
      ] as const,
      [0, null] as const,
    ],
    [
      "contradictory exits",
      [
        [0, null],
        [1, null],
      ] as const,
      [0, null] as const,
    ],
    ["contradictory close", [[0, null]] as const, [1, null] as const],
    [
      "signal settlement",
      [[null, "SIGTERM"]] as const,
      [null, "SIGTERM"] as const,
    ],
    ["unexpected code", [[2, null]] as const, [2, null] as const],
  ] as const)(
    "rejects %s settlement tuples",
    async (_label, exits, closeTuple) => {
      const test = harness();
      const pending = executeFrozenResearchBoundaryForTest(
        test.lease,
        test.boundaries,
      );
      test.child.stdout!.emit(pairBytes("complete"));
      for (const exitTuple of exits) test.child.emit("exit", ...exitTuple);
      test.child.emit("close", ...closeTuple);
      await pending;
      const output = parsedActivationOutput(test.stdout[0]!);
      expect(output.primaryFailure).toBe("ACTIVATION_PROCESS_FAILURE");
      expect(output.controlResult).toBeNull();
    },
  );

  it.each([
    ["timeout", "ACTIVATION_TIMEOUT"],
    ["process", "ACTIVATION_PROCESS_FAILURE"],
    ["output", "ACTIVATION_OUTPUT_LIMIT"],
  ] as const)(
    "preserves the first chronological %s failure",
    async (kind, expected) => {
      const test = harness({ signalResult: false });
      const pending = executeFrozenResearchBoundaryForTest(
        test.lease,
        test.boundaries,
      );
      if (kind === "timeout") {
        test.timers.find((timer) => timer.milliseconds === 90_000)!.callback();
        test.child.stdout!.emit(pairBytes("complete"));
      } else if (kind === "process") {
        test.child.emit("error", new Error("synthetic"));
        test.child.stdout!.emit(pairBytes("complete"));
      } else {
        test.child.stdout!.emit(new Uint8Array(65_537));
      }
      test.child.emit("exit", 0, null);
      test.child.emit("close", 0, null);
      await pending;
      const output = parsedActivationOutput(test.stdout[0]!);
      expect(output.primaryFailure).toBe(expected);
      expect(output.controlResult).toBeNull();
      expect(output.completedSteps).toEqual([
        "identity-preflight",
        "child-spawned",
        "child-closed",
        "identity-postflight",
      ]);
      expect(test.exitCode).toBe(1);
      if (kind !== "process") expect(test.signals[0]).toBe("SIGTERM");
    },
  );

  it("retains the child and lease after exit until a later close", async () => {
    const test = harness();
    let settled = false;
    const pending = executeFrozenResearchBoundaryForTest(
      test.lease,
      test.boundaries,
    ).then(() => {
      settled = true;
    });
    test.child.stdout!.emit(pairBytes("complete"));
    test.child.emit("exit", 0, null);
    await Promise.resolve();
    expect(settled).toBe(false);
    expect(test.lease.closes).toBe(0);
    expect(test.stdout).toEqual([]);
    test.child.emit("close", 0, null);
    await pending;
    expect(settled).toBe(true);
    expect(test.exitCode).toBe(0);
  });

  it("retains an asynchronously failed child and its lease while close is absent", async () => {
    const test = harness();
    let settled = false;
    void executeFrozenResearchBoundaryForTest(test.lease, test.boundaries).then(
      () => {
        settled = true;
      },
    );
    test.child.emit("error", new Error("synthetic"));
    test.child.emit("exit", 1, null);
    await Promise.resolve();
    expect(settled).toBe(false);
    expect(test.lease.validations).toBe(0);
    expect(test.lease.closes).toBe(0);
    expect(test.stdout).toEqual([]);
    expect(test.stderr).toEqual([]);
    expect(test.exitCode).toBeNull();
  });

  it("retains an asynchronously failed child through TERM/KILL failure and accepts only late close settlement", async () => {
    const test = harness({ signalResult: false });
    let settled = false;
    const pending = executeFrozenResearchBoundaryForTest(
      test.lease,
      test.boundaries,
    ).then(() => {
      settled = true;
    });
    test.child.emit("error", new Error("synthetic"));
    test.timers.find((timer) => timer.milliseconds === 90_000)!.callback();
    test.timers.find((timer) => timer.milliseconds === 1_000)!.callback();
    test.child.stdout!.emit(pairBytes("inconclusive"));
    test.child.emit("exit", 1, null);
    await Promise.resolve();
    expect(settled).toBe(false);
    expect(test.signals).toEqual(["SIGTERM", "SIGKILL"]);
    expect(test.lease.closes).toBe(0);
    expect(test.stdout).toEqual([]);
    test.child.emit("close", 1, null);
    await pending;
    expect(parsedActivationOutput(test.stdout[0]!).primaryFailure).toBe(
      "ACTIVATION_PROCESS_FAILURE",
    );
    expect(test.exitCode).toBe(1);
  });

  it.each([
    ["TERM", { SIGTERM: false, SIGKILL: true }],
    ["KILL", { SIGTERM: true, SIGKILL: false }],
  ] as const)(
    "preserves timeout precedence when %s delivery fails",
    async (_label, signalResults) => {
      const test = harness({ signalResults });
      const pending = executeFrozenResearchBoundaryForTest(
        test.lease,
        test.boundaries,
      );
      test.timers.find((timer) => timer.milliseconds === 90_000)!.callback();
      test.timers.find((timer) => timer.milliseconds === 1_000)!.callback();
      test.child.stdout!.emit(pairBytes("complete"));
      test.child.emit("exit", 0, null);
      test.child.emit("close", 0, null);
      await pending;
      expect(test.signals).toEqual(["SIGTERM", "SIGKILL"]);
      expect(parsedActivationOutput(test.stdout[0]!).primaryFailure).toBe(
        "ACTIVATION_TIMEOUT",
      );
    },
  );

  it.each([
    ["timeout", "complete"],
    ["timeout", "inconclusive"],
    ["process", "complete"],
    ["process", "inconclusive"],
    ["output", "complete"],
    ["output", "inconclusive"],
    ["term-failure", "complete"],
    ["term-failure", "inconclusive"],
    ["kill-failure", "complete"],
    ["kill-failure", "inconclusive"],
  ] as const)(
    "never lets an earlier %s failure accept later valid %s bytes",
    async (failure, validity) => {
      const signalResults =
        failure === "term-failure"
          ? ({ SIGTERM: false, SIGKILL: true } as const)
          : failure === "kill-failure"
            ? ({ SIGTERM: true, SIGKILL: false } as const)
            : undefined;
      const test = harness(
        signalResults === undefined ? undefined : { signalResults },
      );
      const pending = executeFrozenResearchBoundaryForTest(
        test.lease,
        test.boundaries,
      );
      if (
        failure === "timeout" ||
        failure === "term-failure" ||
        failure === "kill-failure"
      ) {
        test.timers.find((timer) => timer.milliseconds === 90_000)!.callback();
        if (failure !== "timeout") {
          test.timers.find((timer) => timer.milliseconds === 1_000)!.callback();
        }
        test.child.stdout!.emit(pairBytes(validity));
      } else if (failure === "process") {
        test.child.emit("error", new Error("synthetic"));
        test.child.stdout!.emit(pairBytes(validity));
      } else {
        test.child.stdout!.emit(pairBytes(validity));
        test.child.stderr!.emit(new Uint8Array(65_537));
      }
      const childExit = validity === "complete" ? 0 : 1;
      test.child.emit("exit", childExit, null);
      test.child.emit("close", childExit, null);
      await pending;
      const output = parsedActivationOutput(test.stdout[0]!);
      expect(output.validity).toBe("inconclusive");
      expect(output.controlResult).toBeNull();
      expect(output.completedSteps).toEqual([
        "identity-preflight",
        "child-spawned",
        "child-closed",
        "identity-postflight",
      ]);
      expect(output.primaryFailure).toBe(
        failure === "output"
          ? "ACTIVATION_OUTPUT_LIMIT"
          : failure === "process"
            ? "ACTIVATION_PROCESS_FAILURE"
            : "ACTIVATION_TIMEOUT",
      );
    },
  );

  it("suppresses canonical output on identity or release failure", async () => {
    for (const failValidationAt of [1, 2]) {
      const identity = harness({
        lease: new FakeLease(failValidationAt),
      });
      const identityPending = executeFrozenResearchBoundaryForTest(
        identity.lease,
        identity.boundaries,
      );
      identity.child.emit("exit", 0, null);
      identity.child.emit("close", 0, null);
      await identityPending;
      expect(identity.stdout).toEqual([]);
      expect(new TextDecoder().decode(identity.stderr[0])).toBe(
        "M4_ACTIVATION_IDENTITY_CHANGED\n",
      );
      expect(identity.lease.validations).toBe(failValidationAt);
      expect(identity.lease.closes).toBe(1);
      expect(identity.exitCode).toBe(70);
    }

    const release = harness({ lease: new FakeLease(null, true) });
    const releasePending = executeFrozenResearchBoundaryForTest(
      release.lease,
      release.boundaries,
    );
    release.child.stdout!.emit(pairBytes("inconclusive"));
    release.child.emit("exit", 1, null);
    release.child.emit("close", 1, null);
    await releasePending;
    expect(release.stdout).toEqual([]);
    expect(release.stderr).toEqual([]);
    expect(release.exitCode).toBe(70);
  });

  it("rejects noncanonical framing, key order, and exit-invalid child data", () => {
    const valid = pairBytes("inconclusive");
    expect(parseCanonicalPairResultForTest(valid)).toMatchObject({
      validity: "inconclusive",
    });
    const validText = new TextDecoder().decode(valid);
    for (const invalid of [
      valid.slice(0, -1),
      encoder.encode(`\ufeff${validText}`),
      encoder.encode(`${validText}\n`),
      encoder.encode(validText.replace("\n", "\r\n")),
      encoder.encode(validText.replace("\n", "\u0000\n")),
      Uint8Array.from([0xff, 0x0a]),
      encoder.encode(
        '{"primaryFailure":"COMMAND_FAILURE","validity":"inconclusive","completedSteps":[],"permissive":null,"constrained":null}\n',
      ),
      encoder.encode(
        '{"validity":"inconclusive","primaryFailure":"COMMAND_FAILURE","completedSteps":[],"permissive":null,"constrained":null,"pid":4242}\n',
      ),
      encoder.encode(
        '{"validity":"inconclusive","primaryFailure":"COMMAND_FAILURE","primaryFailure":"TIMEOUT","completedSteps":[],"permissive":null,"constrained":null}\n',
      ),
    ]) {
      expect(() => parseCanonicalPairResultForTest(invalid)).toThrow();
    }
  });
});
