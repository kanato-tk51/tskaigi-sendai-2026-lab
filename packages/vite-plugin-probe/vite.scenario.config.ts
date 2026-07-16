import path from "node:path";
import { fileURLToPath } from "node:url";

import { createViteProbePlugin } from "@tskaigi-lab/adapter-vite-plugin/plugin";
import { defineConfig } from "vite";
import type { UserConfig } from "vite";

import {
  CHUNK_OUTPUT_FILE,
  ENTRY_OUTPUT_FILE,
  ENTRY_RELATIVE_PATH,
  FALLBACK_ASSET_OUTPUT_FILE,
  VITE_ENV_PREFIX,
} from "./src/constants.js";
import { readCoordinatorInputs } from "./src/coordinator-input.js";
import { createTrustedControlPlugin } from "./src/config-contract.js";
import { AdapterError } from "./src/errors.js";

const adapterRoot = path.resolve(fileURLToPath(new URL("./", import.meta.url)));

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  if (command !== "build" || mode !== "production") {
    throw new AdapterError("M2D_CONFIG_INVALID");
  }
  const inputs = readCoordinatorInputs();
  const dependencyPlugin = await createViteProbePlugin();
  return {
    root: adapterRoot,
    publicDir: false,
    envDir: false,
    envPrefix: VITE_ENV_PREFIX,
    cacheDir: inputs.cacheDir,
    logLevel: "error",
    clearScreen: false,
    plugins: [
      dependencyPlugin,
      createTrustedControlPlugin(inputs, adapterRoot),
    ],
    optimizeDeps: {
      noDiscovery: true,
      include: [],
    },
    build: {
      target: "es2022",
      watch: null,
      write: true,
      outDir: inputs.outDir,
      emptyOutDir: true,
      copyPublicDir: false,
      manifest: false,
      ssrManifest: false,
      sourcemap: false,
      minify: false,
      modulePreload: false,
      assetsInlineLimit: 0,
      reportCompressedSize: false,
      rollupOptions: {
        cache: false,
        input: path.join(adapterRoot, ENTRY_RELATIVE_PATH),
        output: {
          format: "es",
          entryFileNames: ENTRY_OUTPUT_FILE,
          chunkFileNames: CHUNK_OUTPUT_FILE,
          assetFileNames: FALLBACK_ASSET_OUTPUT_FILE,
          inlineDynamicImports: true,
        },
      },
    },
  };
});
