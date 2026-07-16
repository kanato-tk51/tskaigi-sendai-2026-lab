import {
  mkdir,
  mkdtemp,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  assertConfigTemporaryAbsent,
  captureOwnedRunBoundary,
  configTemporaryExists,
  inspectTemporaryInventory,
  resolveNearestConfigTemporaryBoundary,
} from "../src/tool-temporary.js";

const roots: string[] = [];

async function temporaryRoot(): Promise<string> {
  const root = await mkdtemp("/tmp/tskaigi-m2d-temp-test-");
  roots.push(root);
  return root;
}

async function configFixture(): Promise<{
  readonly root: string;
  readonly config: string;
  readonly nodeModules: string;
}> {
  const root = await temporaryRoot();
  const adapter = path.join(root, "packages/adapter");
  const nodeModules = path.join(adapter, "node_modules");
  const config = path.join(adapter, "vite.scenario.config.ts");
  await mkdir(nodeModules, { recursive: true });
  await writeFile(config, "export default {};\n");
  return { root, config, nodeModules };
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("nearest Vite config temporary boundary", () => {
  it("resolves the nearest node_modules and accepts only absence", async () => {
    const fixture = await configFixture();
    await mkdir(path.join(fixture.root, "node_modules"));
    const boundary = await resolveNearestConfigTemporaryBoundary(
      fixture.root,
      fixture.config,
    );
    expect(boundary.nodeModulesRoot).toBe(fixture.nodeModules);
    expect(await configTemporaryExists(boundary)).toBe(false);
    await expect(
      assertConfigTemporaryAbsent(boundary),
    ).resolves.toBeUndefined();
  });

  it.each(["file", "directory", "symlink", "dangling"])(
    "rejects a pre-existing %s without deleting it",
    async (kind) => {
      const fixture = await configFixture();
      const boundary = await resolveNearestConfigTemporaryBoundary(
        fixture.root,
        fixture.config,
      );
      if (kind === "file") {
        await writeFile(boundary.configTempRoot, "occupied\n");
      } else if (kind === "directory") {
        await mkdir(boundary.configTempRoot);
      } else if (kind === "symlink") {
        const target = path.join(fixture.root, "target");
        await mkdir(target);
        await symlink(target, boundary.configTempRoot);
      } else {
        await symlink(
          path.join(fixture.root, "missing-target"),
          boundary.configTempRoot,
        );
      }
      expect(await configTemporaryExists(boundary)).toBe(true);
      await expect(assertConfigTemporaryAbsent(boundary)).rejects.toThrowError(
        "M2D_TEMP_BOUNDARY_VIOLATION",
      );
      expect(await configTemporaryExists(boundary)).toBe(true);
    },
  );

  it("fails closed on missing config inspection errors", async () => {
    const fixture = await configFixture();
    await rm(fixture.config);
    await expect(
      resolveNearestConfigTemporaryBoundary(fixture.root, fixture.config),
    ).rejects.toThrowError("M2D_TEMP_BOUNDARY_VIOLATION");
  });

  it("rejects node_modules parent identity replacement", async () => {
    const fixture = await configFixture();
    const boundary = await resolveNearestConfigTemporaryBoundary(
      fixture.root,
      fixture.config,
    );
    await rename(fixture.nodeModules, `${fixture.nodeModules}-old`);
    await mkdir(fixture.nodeModules);
    await expect(configTemporaryExists(boundary)).rejects.toThrowError(
      "M2D_TEMP_BOUNDARY_VIOLATION",
    );
  });
});

describe("owned run temp/cache/outDir boundary", () => {
  it("records empty pre-inventory and rejects identity replacement", async () => {
    const config = await configFixture();
    const configBoundary = await resolveNearestConfigTemporaryBoundary(
      config.root,
      config.config,
    );
    const runRoot = await temporaryRoot();
    await Promise.all([
      mkdir(path.join(runRoot, "tool-temp")),
      mkdir(path.join(runRoot, "cache/vite"), { recursive: true }),
      mkdir(path.join(runRoot, "out")),
    ]);
    const run = await captureOwnedRunBoundary(runRoot);
    await expect(
      inspectTemporaryInventory(run, configBoundary),
    ).resolves.toEqual({
      toolTempEntries: 0,
      cacheEntries: 0,
      outDirEntries: 0,
      configTempExists: false,
    });
    await rename(run.cacheRoot, `${run.cacheRoot}-old`);
    await mkdir(run.cacheRoot);
    await expect(
      inspectTemporaryInventory(run, configBoundary),
    ).rejects.toThrowError("M2D_TEMP_BOUNDARY_VIOLATION");
  });

  it("rejects symlink and dangling-symlink owned children", async () => {
    for (const dangling of [false, true]) {
      const runRoot = await temporaryRoot();
      const target = path.join(runRoot, dangling ? "missing" : "real-temp");
      if (!dangling) {
        await mkdir(target);
      }
      await symlink(target, path.join(runRoot, "tool-temp"));
      await mkdir(path.join(runRoot, "cache/vite"), { recursive: true });
      await mkdir(path.join(runRoot, "out"));
      await expect(captureOwnedRunBoundary(runRoot)).rejects.toThrowError(
        "M2D_TEMP_BOUNDARY_VIOLATION",
      );
    }
  });
});
