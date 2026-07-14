import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import {
  runtimeSourceFilePolicy,
  verifyProbeCoreStaticInputs,
} from "../scripts/verify-static.mjs";

const packageDirectory = path.resolve(import.meta.dirname, "..");
const adapterDirectory = path.resolve(
  packageDirectory,
  "../eslint-plugin-probe",
);
let packageJson: Record<string, unknown>;
let sources: Record<string, string>;

async function readSources(directory: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      Object.assign(result, await readSources(entryPath));
    } else if (/\.(?:ts|js)$/u.test(entry.name)) {
      result[
        path.relative(packageDirectory, entryPath).replaceAll(path.sep, "/")
      ] = await readFile(entryPath, "utf8");
    }
  }
  return result;
}

function check(
  overrides: {
    readonly packageJson?: Record<string, unknown>;
    readonly source?: string;
    readonly sourceFileName?: string;
    readonly compilerOptions?: Record<string, unknown>;
  } = {},
) {
  const sourceFileName =
    overrides.sourceFileName ?? "src/reverse-dependency-fixture.ts";
  return verifyProbeCoreStaticInputs({
    packageJson: overrides.packageJson ?? packageJson,
    sources: {
      ...sources,
      ...(overrides.source === undefined
        ? {}
        : { [sourceFileName]: overrides.source }),
    },
    packageDirectory,
    workspacePackages: [
      { name: "@tskaigi-lab/probe-core", directory: packageDirectory },
      {
        name: "@tskaigi-lab/eslint-plugin-probe",
        directory: adapterDirectory,
        packageJson: {
          dependencies: { "@tskaigi-lab/probe-core": "workspace:*" },
        },
      },
    ],
    compilerOptions: overrides.compilerOptions ?? {},
  });
}

beforeAll(async () => {
  packageJson = JSON.parse(
    await readFile(path.join(packageDirectory, "package.json"), "utf8"),
  ) as Record<string, unknown>;
  sources = await readSources(path.join(packageDirectory, "src"));
});

describe("probe-core dependency direction static verifier", () => {
  it("allows a future adapter package and adapter-to-core dependency to exist", () => {
    expect(check()).toMatchObject({ status: "success", failures: [] });
  });

  it("allows recognized Node.js builtins in node: and bare form", () => {
    for (const source of [
      'import fs from "node:fs"; void fs;\n',
      'import path from "node:path"; void path;\n',
      'import test from "node:test"; void test;\n',
      'import fs from "fs"; void fs;\n',
    ]) {
      expect(check({ source })).toMatchObject({
        status: "success",
        failures: [],
      });
    }
    expect(
      check({ source: 'import "node:left-pad";\n' }).failures,
    ).toContainEqual(
      expect.stringContaining("external bare module import is forbidden"),
    );
    expect(check({ source: 'import "test";\n' }).failures).toContainEqual(
      expect.stringContaining("external bare module import is forbidden"),
    );
  });

  it("allows package-internal relative static, type-only, and export-from references", () => {
    for (const source of [
      'import "./constants.js";\n',
      'import type { ProbeEvent } from "./types.js";\n',
      'export { ProbeError } from "./errors.js";\n',
    ]) {
      expect(check({ source })).toMatchObject({
        status: "success",
        failures: [],
      });
    }
  });

  it("rejects a probe-core source import from an adapter package", () => {
    const result = check({
      source:
        'import { adapter } from "@tskaigi-lab/eslint-plugin-probe";\n' +
        "void adapter;\n",
    });
    expect(result.status).toBe("failure");
    expect(result.failures).toContainEqual(
      expect.stringContaining(
        "source dependency is forbidden: src/reverse-dependency-fixture.ts",
      ),
    );
  });

  it("rejects an adapter workspace dependency in probe-core package.json", () => {
    const result = check({
      packageJson: {
        ...packageJson,
        dependencies: {
          "@tskaigi-lab/eslint-plugin-probe": "workspace:*",
        },
      },
    });
    expect(result.failures).toContain(
      "probe-core runtime dependency is forbidden: @tskaigi-lab/eslint-plugin-probe",
    );
    expect(result.failures).toContain(
      "probe-core dependency direction is forbidden: @tskaigi-lab/eslint-plugin-probe",
    );
  });

  it("rejects ESLint, Vitest, and Vite imports including type-only imports", () => {
    for (const source of [
      'import eslint from "eslint"; void eslint;\n',
      'import type { TestProject } from "vitest/node";\n',
      'export { defineConfig } from "vite";\n',
    ]) {
      const result = check({ source });
      expect(result.failures).toContainEqual(
        expect.stringContaining("source dependency is forbidden"),
      );
    }
  });

  it("rejects every external bare import, whether declared or undeclared", () => {
    expect(check({ source: 'import "left-pad";\n' }).failures).toContainEqual(
      expect.stringContaining("external bare module import is forbidden"),
    );
    const declared = check({
      packageJson: {
        ...packageJson,
        dependencies: { "left-pad": "1.3.0" },
      },
      source: 'import "left-pad";\n',
    });
    expect(declared.failures).toContain(
      "probe-core runtime dependency is forbidden: left-pad",
    );
    expect(declared.failures).toContainEqual(
      expect.stringContaining("external bare module import is forbidden"),
    );
  });

  it("rejects package self-references from runtime source", () => {
    expect(
      check({ source: 'import "@tskaigi-lab/probe-core";\n' }).failures,
    ).toContainEqual(expect.stringContaining("self-reference is forbidden"));
  });

  it("handles literal dynamic import and require, and rejects computed loading", () => {
    for (const source of [
      'await import("@tskaigi-lab/eslint-plugin-probe");\n',
      'require("@tskaigi-lab/eslint-plugin-probe");\n',
    ]) {
      expect(check({ source }).failures).toContainEqual(
        expect.stringContaining("source dependency is forbidden"),
      );
    }
    expect(
      check({ source: "await import(adapterPackageName);\n" }).failures,
    ).toContain(
      "computed module loading is forbidden: src/reverse-dependency-fixture.ts",
    );
    for (const source of [
      'await import("left-pad");\n',
      'require("left-pad");\n',
    ]) {
      expect(check({ source }).failures).toContainEqual(
        expect.stringContaining("external bare module import is forbidden"),
      );
    }
    for (const source of [
      "await import(moduleName);\n",
      "await import(`${moduleName}`);\n",
      "require(moduleName);\n",
    ]) {
      expect(check({ source }).failures).toContain(
        "computed module loading is forbidden: src/reverse-dependency-fixture.ts",
      );
    }
  });

  it("does not treat comments or ordinary string literals as module loading", () => {
    const source =
      '// import "left-pad"\n' +
      `const example = 'require("vitest")';\n` +
      "void example;\n";
    expect(check({ source })).toMatchObject({
      status: "success",
      failures: [],
    });
  });

  it("rejects a relative import that escapes into an adapter directory", () => {
    const result = check({
      source: 'import "../../eslint-plugin-probe/src/index.js";\n',
    });
    expect(result.failures).toContainEqual(
      expect.stringContaining("source imports a workspace package"),
    );
  });

  it("resolves aliases before checking the dependency direction", () => {
    const result = check({
      source: 'import "@adapter/index.js";\n',
      compilerOptions: {
        baseUrl: ".",
        paths: { "@adapter/*": ["../eslint-plugin-probe/src/*"] },
      },
    });
    expect(result.failures).toContainEqual(
      expect.stringContaining("source imports a workspace package"),
    );
  });

  it("continues to allow TypeScript paths aliases that stay inside src", () => {
    const result = check({
      source: 'import "@internal/constants.js";\n',
      compilerOptions: {
        baseUrl: ".",
        paths: { "@internal/*": ["src/*"] },
      },
    });
    expect(result).toMatchObject({ status: "success", failures: [] });
  });

  it("rejects an escape from any matching TypeScript paths pattern", () => {
    const result = check({
      source: 'import "@internal/constants.js";\n',
      compilerOptions: {
        baseUrl: ".",
        paths: {
          "@internal/*": ["src/*"],
          "@internal/constants.js": ["../eslint-plugin-probe/src/index.js"],
        },
      },
    });
    expect(result.failures).toContainEqual(
      expect.stringContaining("source imports a workspace package"),
    );
  });

  it("rejects package imports aliases, including safe exact aliases, until separately approved", () => {
    const result = check({
      packageJson: {
        ...packageJson,
        imports: { "#internal": "./src/constants.js" },
      },
      source: 'import "#internal";\n',
    });
    expect(result.failures).toContain(
      "package imports aliases are not approved for probe-core runtime source: #internal",
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining("package imports alias is forbidden"),
    );
  });

  it("allows package metadata with no package imports aliases", () => {
    expect(check()).toMatchObject({ status: "success", failures: [] });
    expect(
      check({ packageJson: { ...packageJson, imports: {} } }),
    ).toMatchObject({ status: "success", failures: [] });
  });

  it("rejects package imports aliases to tools, adapters, and package-root escapes", () => {
    for (const [specifier, target, expected] of [
      ["#tool", "vitest", "package imports external target is forbidden"],
      [
        "#adapter",
        "@tskaigi-lab/eslint-plugin-probe",
        "package imports external target is forbidden",
      ],
      [
        "#escape",
        "./../outside.js",
        "package imports target escapes package root",
      ],
    ] as const) {
      const result = check({
        packageJson: { ...packageJson, imports: { [specifier]: target } },
        source: `import "${specifier}";\n`,
      });
      expect(result.failures).toContainEqual(expect.stringContaining(expected));
      expect(result.failures).toContainEqual(
        expect.stringContaining("package imports alias is forbidden"),
      );
    }
  });

  it("fails closed for unknown and unsupported package imports forms", () => {
    expect(check({ source: 'import "#unknown";\n' }).failures).toContainEqual(
      expect.stringContaining("unresolved package imports alias is forbidden"),
    );

    for (const [imports, expected] of [
      [
        { "#conditional": { node: "./src/constants.js" } },
        "package imports conditional targets are unsupported",
      ],
      [
        { "#array": ["./src/constants.js"] },
        "package imports target arrays are unsupported",
      ],
      [
        { "#pattern/*": "./src/*.js" },
        "package imports wildcard patterns are unsupported",
      ],
    ] as const) {
      expect(
        check({ packageJson: { ...packageJson, imports } }).failures,
      ).toContainEqual(expect.stringContaining(expected));
    }
  });

  it("covers all approved runtime source extensions and rejects JSX source", () => {
    for (const extension of [".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"]) {
      expect(runtimeSourceFilePolicy(`source${extension}`)).toBe("supported");
    }
    expect(runtimeSourceFilePolicy("source.tsx")).toBe("forbidden-jsx");
    expect(runtimeSourceFilePolicy("source.jsx")).toBe("forbidden-jsx");

    for (const [extension, source] of [
      [".mts", 'import "left-pad";\n'],
      [".cts", 'require("left-pad");\n'],
      [".mjs", 'import "left-pad";\n'],
      [".cjs", 'require("left-pad");\n'],
    ] as const) {
      expect(
        check({
          sourceFileName: `src/reverse-dependency-fixture${extension}`,
          source,
        }).failures,
      ).toContainEqual(
        expect.stringContaining("external bare module import is forbidden"),
      );
    }

    for (const extension of [".tsx", ".jsx"]) {
      expect(
        check({
          sourceFileName: `src/reverse-dependency-fixture${extension}`,
          source: "export const value = 1;\n",
        }).failures,
      ).toContainEqual(
        expect.stringContaining("JSX runtime source is forbidden"),
      );
    }
  });
});
