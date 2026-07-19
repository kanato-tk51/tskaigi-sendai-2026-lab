import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

import type { Plugin, ResolvedConfig } from "vite";

import {
  ASSET_OUTPUT_FILE,
  CHUNK_OUTPUT_FILE,
  CONFIG_LOADER,
  CONFIG_RELATIVE_PATH,
  CONTROL_PLUGIN_NAME,
  ENTRY_OUTPUT_FILE,
  ENTRY_RELATIVE_PATH,
  FALLBACK_ASSET_OUTPUT_FILE,
  FIXED_VITE_ARGUMENTS,
  PLUGIN_NAME,
  VITE_ENV_PREFIX,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import type { CoordinatorInputs } from "./types.js";

function sameValues(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

async function assertOwnedDirectory(
  directoryPath: string,
  runRoot: string,
): Promise<void> {
  try {
    const metadata = await lstat(directoryPath);
    const canonicalDirectory = await realpath(directoryPath);
    const canonicalRunRoot = await realpath(runRoot);
    const relative = path.relative(canonicalRunRoot, canonicalDirectory);
    if (
      metadata.isSymbolicLink() ||
      !metadata.isDirectory() ||
      relative === "" ||
      relative.startsWith("..") ||
      path.isAbsolute(relative)
    ) {
      throw new AdapterError("M2D_CONFIG_INVALID");
    }
  } catch (error) {
    if (error instanceof AdapterError) {
      throw error;
    }
    throw new AdapterError("M2D_CONFIG_INVALID");
  }
}

export async function validateResolvedViteConfig(
  config: ResolvedConfig,
  inputs: CoordinatorInputs,
  adapterRoot: string,
): Promise<void> {
  const fixedInput = path.join(adapterRoot, ENTRY_RELATIVE_PATH);
  const rollup = config.build.rollupOptions;
  const output = rollup.output;
  const dependencyPlugins = config.plugins.filter(
    (plugin) => plugin.name === PLUGIN_NAME,
  );
  const argv = process.argv.slice(2);
  const noWatchArgument = !argv.includes("--watch");
  const checks = [
    ["cwd", process.cwd() === adapterRoot],
    ["argv", sameValues(argv, FIXED_VITE_ARGUMENTS)],
    ["watch-argv", noWatchArgument],
    ["command", config.command === "build"],
    ["mode", config.mode === "production"],
    ["legacy-builder", config.builder === undefined],
    ["plugin-count", dependencyPlugins.length === 1],
    ["plugin-apply", dependencyPlugins[0]?.apply === "build"],
    ["root", config.root === adapterRoot],
    ["public-dir", config.publicDir === ""],
    ["env-dir", config.envDir === false],
    ["env-prefix", config.envPrefix === VITE_ENV_PREFIX],
    ["cache-dir", config.cacheDir === inputs.cacheDir],
    ["build-watch", config.build.watch === null],
    ["build-write", config.build.write === true],
    ["out-dir", config.build.outDir === inputs.outDir],
    ["empty-out-dir", config.build.emptyOutDir === true],
    ["copy-public-dir", config.build.copyPublicDir === false],
    ["manifest", config.build.manifest === false],
    ["ssr-manifest", config.build.ssrManifest === false],
    ["sourcemap", config.build.sourcemap === false],
    ["minify", config.build.minify === false],
    ["module-preload", config.build.modulePreload === false],
    ["assets-inline-limit", config.build.assetsInlineLimit === 0],
    ["compressed-size", config.build.reportCompressedSize === false],
    ["rollup-cache", rollup.cache === false],
    ["rollup-input", rollup.input === fixedInput],
    ["output-object", !Array.isArray(output) && output !== undefined],
    ["output-format", !Array.isArray(output) && output?.format === "es"],
    [
      "entry-filename",
      !Array.isArray(output) && output?.entryFileNames === ENTRY_OUTPUT_FILE,
    ],
    [
      "chunk-filename",
      !Array.isArray(output) && output?.chunkFileNames === CHUNK_OUTPUT_FILE,
    ],
    [
      "asset-filename",
      !Array.isArray(output) &&
        output?.assetFileNames === FALLBACK_ASSET_OUTPUT_FILE,
    ],
    [
      "no-dynamic-chunk",
      !Array.isArray(output) && output?.inlineDynamicImports === true,
    ],
    ["optimize-no-discovery", config.optimizeDeps.noDiscovery === true],
    [
      "optimize-include",
      Array.isArray(config.optimizeDeps.include) &&
        config.optimizeDeps.include.length === 0,
    ],
    ["no-deprecated-disabled", config.optimizeDeps.disabled === undefined],
    ["config-loader", CONFIG_LOADER === "runner"],
    ["config-name", CONFIG_RELATIVE_PATH === "vite.scenario.config.ts"],
    ["asset-name", ASSET_OUTPUT_FILE === "probe-asset.txt"],
  ] as const;
  const failedChecks = checks
    .filter(([, passed]) => !passed)
    .map(([logicalId]) => logicalId);
  if (failedChecks.length > 0) {
    throw new AdapterError("M2D_CONFIG_INVALID");
  }
  await Promise.all([
    assertOwnedDirectory(inputs.toolTempRoot, inputs.toolRoot),
    assertOwnedDirectory(inputs.cacheDir, inputs.toolRoot),
    assertOwnedDirectory(inputs.outDir, inputs.toolRoot),
  ]);
}

export function createTrustedControlPlugin(
  inputs: CoordinatorInputs,
  adapterRoot: string,
): Plugin {
  return {
    name: CONTROL_PLUGIN_NAME,
    apply: "build",
    async configResolved(config) {
      await validateResolvedViteConfig(config, inputs, adapterRoot);
    },
  };
}
