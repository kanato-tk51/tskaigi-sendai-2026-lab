import {
  chmod,
  lstat,
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
  CACHE_RELATIVE_PATH,
  TOOL_TEMP_RELATIVE_PATH,
} from "../src/constants.js";
import {
  assertPostRunTemporaryInventory,
  cleanupToolTemporaryBoundary,
  inspectToolTemporaryBoundary,
  resolveFixedConfigTemporaryBoundary,
  TOOL_TEMPORARY_TEST_ONLY,
} from "../src/tool-temporary.js";

const temporaryRoots: string[] = [];
const FIXED_ADAPTER_RELATIVE_PATH = "packages/vitest-setup-probe";

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

async function freshRoot(label: string): Promise<string> {
  const root = await mkdtemp(`/tmp/tskaigi-vitest-m2c-${label}-`);
  temporaryRoots.push(root);
  return root;
}

async function createFixedWorkspace(
  workspaceRoot: string,
  options: {
    readonly adapterNodeModules?: boolean;
    readonly repositoryNodeModules?: boolean;
  } = {},
): Promise<{ readonly adapterRoot: string; readonly configTempRoot: string }> {
  const adapterRoot = path.join(workspaceRoot, FIXED_ADAPTER_RELATIVE_PATH);
  await mkdir(adapterRoot, { recursive: true });
  await writeFile(path.join(adapterRoot, "vitest.scenario.config.ts"), "");
  if (options.adapterNodeModules !== false) {
    await mkdir(path.join(adapterRoot, "node_modules"));
  }
  if (options.repositoryNodeModules !== false) {
    await mkdir(path.join(workspaceRoot, "node_modules"));
  }
  return {
    adapterRoot,
    configTempRoot: path.join(adapterRoot, "node_modules", ".vite-temp"),
  };
}

describe("M2-C actual Vite config-temporary boundary", () => {
  it("resolves the fixed adapter-local nearest node_modules instead of the repository root", async () => {
    const production = await resolveFixedConfigTemporaryBoundary();
    expect(production.nodeModulesRoot).toBe(
      path.resolve(import.meta.dirname, "../node_modules"),
    );
    expect(production.configTempRoot).toBe(
      path.resolve(import.meta.dirname, "../node_modules/.vite-temp"),
    );

    const workspace = await freshRoot("nearest-workspace");
    const fixture = await createFixedWorkspace(workspace);
    const resolved =
      await TOOL_TEMPORARY_TEST_ONLY.resolveFixedFixtureBoundary(workspace);
    expect(resolved.nodeModulesRoot).toBe(
      path.join(fixture.adapterRoot, "node_modules"),
    );
    expect(resolved.nodeModulesRoot).not.toBe(
      path.join(workspace, "node_modules"),
    );
  });

  it("fails closed if the fixed adapter-local candidate is absent or has the wrong type", async () => {
    const missing = await freshRoot("missing-nearest");
    await createFixedWorkspace(missing, { adapterNodeModules: false });
    await expect(
      TOOL_TEMPORARY_TEST_ONLY.resolveFixedFixtureBoundary(missing),
    ).rejects.toMatchObject({ code: "M2C_TEMP_BOUNDARY_VIOLATION" });

    const wrongType = await freshRoot("wrong-nearest");
    const fixture = await createFixedWorkspace(wrongType, {
      adapterNodeModules: false,
    });
    await writeFile(path.join(fixture.adapterRoot, "node_modules"), "x");
    await expect(
      TOOL_TEMPORARY_TEST_ONLY.resolveFixedFixtureBoundary(wrongType),
    ).rejects.toMatchObject({ code: "M2C_TEMP_BOUNDARY_VIOLATION" });
  });

  it("accepts an in-workspace package symlink and rejects a parent symlink escape", async () => {
    const insideWorkspace = await freshRoot("inside-package-symlink");
    const actualAdapter = path.join(insideWorkspace, "actual-adapter");
    await mkdir(path.join(actualAdapter, "node_modules"), { recursive: true });
    await writeFile(path.join(actualAdapter, "vitest.scenario.config.ts"), "");
    await mkdir(path.join(insideWorkspace, "packages"), { recursive: true });
    await mkdir(path.join(insideWorkspace, "node_modules"));
    await symlink(
      actualAdapter,
      path.join(insideWorkspace, FIXED_ADAPTER_RELATIVE_PATH),
    );
    await expect(
      TOOL_TEMPORARY_TEST_ONLY.resolveFixedFixtureBoundary(insideWorkspace),
    ).resolves.toMatchObject({
      canonicalNodeModulesRoot: path.join(actualAdapter, "node_modules"),
    });

    const escapedWorkspace = await freshRoot("escaped-package-symlink");
    const outside = await freshRoot("outside-package");
    await mkdir(path.join(outside, "node_modules"));
    await writeFile(path.join(outside, "vitest.scenario.config.ts"), "");
    await mkdir(path.join(escapedWorkspace, "packages"), { recursive: true });
    await mkdir(path.join(escapedWorkspace, "node_modules"));
    await symlink(
      outside,
      path.join(escapedWorkspace, FIXED_ADAPTER_RELATIVE_PATH),
    );
    await expect(
      TOOL_TEMPORARY_TEST_ONLY.resolveFixedFixtureBoundary(escapedWorkspace),
    ).rejects.toMatchObject({ code: "M2C_TEMP_BOUNDARY_VIOLATION" });
  });

  it.each(["directory", "file", "symlink", "dangling-symlink"] as const)(
    "rejects and preserves a pre-existing config temp %s",
    async (kind) => {
      const workspace = await freshRoot(`config-${kind}`);
      const runRoot = await freshRoot(`run-${kind}`);
      const fixture = await createFixedWorkspace(workspace);
      if (kind === "directory") {
        await mkdir(fixture.configTempRoot);
      } else if (kind === "file") {
        await writeFile(fixture.configTempRoot, "x");
      } else if (kind === "symlink") {
        const target = path.join(workspace, "symlink-target");
        await mkdir(target);
        await symlink(target, fixture.configTempRoot);
      } else {
        await symlink(
          path.join(workspace, "missing-target"),
          fixture.configTempRoot,
        );
      }
      const before = await lstat(fixture.configTempRoot);
      await expect(
        TOOL_TEMPORARY_TEST_ONLY.initializeWithFixedFixture(runRoot, workspace),
      ).rejects.toMatchObject({ code: "M2C_TEMP_BOUNDARY_VIOLATION" });
      const after = await lstat(fixture.configTempRoot);
      expect({ dev: after.dev, ino: after.ino, mode: after.mode }).toEqual({
        dev: before.dev,
        ino: before.ino,
        mode: before.mode,
      });
    },
  );

  it("does not convert permission or unknown filesystem errors into absence", async () => {
    const deniedWorkspace = await freshRoot("permission-error");
    const deniedRun = await freshRoot("permission-run");
    const denied = await createFixedWorkspace(deniedWorkspace);
    await chmod(path.join(denied.adapterRoot, "node_modules"), 0o000);
    try {
      await expect(
        TOOL_TEMPORARY_TEST_ONLY.initializeWithFixedFixture(
          deniedRun,
          deniedWorkspace,
        ),
      ).rejects.toMatchObject({ code: "M2C_TEMP_BOUNDARY_VIOLATION" });
    } finally {
      await chmod(path.join(denied.adapterRoot, "node_modules"), 0o700);
    }

    const unknownWorkspace = await freshRoot("unknown-error");
    const unknown = await createFixedWorkspace(unknownWorkspace);
    await rm(path.join(unknown.adapterRoot, "node_modules"), {
      recursive: true,
    });
    await writeFile(path.join(unknown.adapterRoot, "node_modules"), "x");
    await expect(
      TOOL_TEMPORARY_TEST_ONLY.resolveFixedFixtureBoundary(unknownWorkspace),
    ).rejects.toMatchObject({ code: "M2C_TEMP_BOUNDARY_VIOLATION" });
  });
});

describe("M2-C run-root tool temporary identity", () => {
  it("creates fresh canonical tool/cache roots and cleans them after inventory", async () => {
    const workspace = await freshRoot("tool-workspace");
    const runRoot = await freshRoot("tool-run");
    await createFixedWorkspace(workspace);
    const boundary = await TOOL_TEMPORARY_TEST_ONLY.initializeWithFixedFixture(
      runRoot,
      workspace,
    );
    await expect(inspectToolTemporaryBoundary(boundary)).resolves.toEqual({
      toolEntryCount: 0,
      cacheEntryCount: 0,
      configTempExists: false,
    });
    await writeFile(path.join(boundary.cacheRoot, "fixed-cache"), "x");
    await expect(inspectToolTemporaryBoundary(boundary)).resolves.toEqual({
      toolEntryCount: 0,
      cacheEntryCount: 1,
      configTempExists: false,
    });
    await cleanupToolTemporaryBoundary(boundary);
    await expect(lstat(boundary.toolTempRoot)).rejects.toMatchObject({
      code: "ENOENT",
    });
    await expect(lstat(boundary.cacheParentRoot)).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("rejects pre-existing tool/cache paths and identity replacement", async () => {
    const workspace = await freshRoot("identity-workspace");
    await createFixedWorkspace(workspace);

    const toolSymlinkRun = await freshRoot("tool-symlink");
    const target = path.join(toolSymlinkRun, "target");
    await mkdir(target);
    await symlink(target, path.join(toolSymlinkRun, TOOL_TEMP_RELATIVE_PATH));
    await expect(
      TOOL_TEMPORARY_TEST_ONLY.initializeWithFixedFixture(
        toolSymlinkRun,
        workspace,
      ),
    ).rejects.toMatchObject({ code: "M2C_TEMP_BOUNDARY_VIOLATION" });

    const cacheSymlinkRun = await freshRoot("cache-symlink");
    await mkdir(path.join(cacheSymlinkRun, "cache"));
    await symlink(target, path.join(cacheSymlinkRun, CACHE_RELATIVE_PATH));
    await expect(
      TOOL_TEMPORARY_TEST_ONLY.initializeWithFixedFixture(
        cacheSymlinkRun,
        workspace,
      ),
    ).rejects.toMatchObject({ code: "M2C_TEMP_BOUNDARY_VIOLATION" });

    const replacedRun = await freshRoot("identity-replaced");
    const boundary = await TOOL_TEMPORARY_TEST_ONLY.initializeWithFixedFixture(
      replacedRun,
      workspace,
    );
    await rename(boundary.toolTempRoot, `${boundary.toolTempRoot}-original`);
    await mkdir(boundary.toolTempRoot);
    await expect(inspectToolTemporaryBoundary(boundary)).rejects.toMatchObject({
      code: "M2C_TEMP_BOUNDARY_VIOLATION",
    });
  });

  it("rejects replacement of the resolved nearest node_modules identity", async () => {
    const workspace = await freshRoot("config-identity-workspace");
    const runRoot = await freshRoot("config-identity-run");
    const fixture = await createFixedWorkspace(workspace);
    const boundary = await TOOL_TEMPORARY_TEST_ONLY.initializeWithFixedFixture(
      runRoot,
      workspace,
    );
    const nodeModulesRoot = path.join(fixture.adapterRoot, "node_modules");
    await rename(nodeModulesRoot, `${nodeModulesRoot}-original`);
    await mkdir(nodeModulesRoot);
    await expect(inspectToolTemporaryBoundary(boundary)).rejects.toMatchObject({
      code: "M2C_TEMP_BOUNDARY_VIOLATION",
    });
  });

  it("fails on post-run config temp appearance and never deletes it", async () => {
    const workspace = await freshRoot("post-config-workspace");
    const runRoot = await freshRoot("post-config-run");
    const fixture = await createFixedWorkspace(workspace);
    const boundary = await TOOL_TEMPORARY_TEST_ONLY.initializeWithFixedFixture(
      runRoot,
      workspace,
    );
    await mkdir(fixture.configTempRoot);
    const inventory = await inspectToolTemporaryBoundary(boundary);
    expect(inventory.configTempExists).toBe(true);
    expect(() =>
      assertPostRunTemporaryInventory(inventory, false),
    ).toThrowError(
      expect.objectContaining({ code: "M2C_TEMP_BOUNDARY_VIOLATION" }),
    );
    await expect(cleanupToolTemporaryBoundary(boundary)).rejects.toMatchObject({
      code: "M2C_TEMP_BOUNDARY_VIOLATION",
    });
    await expect(lstat(fixture.configTempRoot)).resolves.toBeDefined();
  });
});
