import type { OutputAsset, OutputBundle, OutputChunk } from "rollup";
import type { Plugin } from "vite";

import {
  ASSET_OUTPUT_FILE,
  ATTEMPT_IDS,
  BUNDLE_MUTATION_LITERAL,
  BUNDLE_MUTATION_TEXT,
  DESIGNATED_SOURCE_CONTENT,
  EMITTED_ASSET_CONTENT,
  ENTRY_OUTPUT_FILE,
  EXPECTED_DESIGNATED_TRANSFORM_COUNT,
  PLUGIN_NAME,
  ROUTE_IDS,
  TOOL_CHANGE_IDS,
  TRANSFORMED_LITERAL,
  TRANSFORMED_SOURCE_CONTENT,
} from "./constants.js";
import { AdapterError } from "./errors.js";
import { hashBytes } from "./hash.js";
import { createPluginRuntime } from "./plugin-runtime.js";
import {
  assertExactDesignatedModuleId,
  exactIdFilter,
} from "./transform-target.js";

const runtime = await createPluginRuntime();
await runtime.session.recordRouteInvocation(
  ROUTE_IDS.latePluginModuleCheckpoint,
  { outcome: "success" },
);

function asAssetSource(asset: OutputAsset): Uint8Array {
  return typeof asset.source === "string"
    ? Buffer.from(asset.source, "utf8")
    : asset.source;
}

function findFixedEntry(bundle: OutputBundle): OutputChunk {
  const entry = bundle[ENTRY_OUTPUT_FILE];
  if (
    entry?.type !== "chunk" ||
    !entry.isEntry ||
    entry.fileName !== ENTRY_OUTPUT_FILE
  ) {
    throw new AdapterError("M2D_OUTPUT_INVALID");
  }
  return entry;
}

function assertExactBundleKeys(
  bundle: OutputBundle,
  expected: readonly string[],
): void {
  const actual = Object.keys(bundle).sort();
  const fixed = [...expected].sort();
  if (
    actual.length !== fixed.length ||
    actual.some((value, index) => value !== fixed[index])
  ) {
    throw new AdapterError("M2D_OUTPUT_INVALID");
  }
}

function skippedToolChange() {
  return {
    outcome: "skipped" as const,
    changed: false,
    beforeHash: null,
    afterHash: null,
    byteSizeBefore: null,
    byteSizeAfter: null,
  };
}

export async function createViteProbePlugin(): Promise<Plugin> {
  await runtime.session.recordRouteInvocation(ROUTE_IDS.pluginFactory, {
    outcome: "success",
  });
  let buildStartCount = 0;
  let transformCount = 0;
  let generateBundleCount = 0;
  let writeBundleCount = 0;
  let assetOperationStarted = false;

  return {
    name: PLUGIN_NAME,
    apply: "build",
    enforce: "pre",
    buildStart: {
      sequential: true,
      async handler() {
        buildStartCount += 1;
        if (buildStartCount !== 1) {
          throw new AdapterError("M2D_ROUTE_INVALID");
        }
        await runtime.session.recordRouteInvocation(ROUTE_IDS.buildStart, {
          outcome: "success",
        });
        for (const attemptId of Object.values(ATTEMPT_IDS)) {
          await runtime.session.runAttempt(attemptId);
        }
        if (runtime.inputs.variant === "api") {
          this.emitFile({
            type: "asset",
            fileName: ASSET_OUTPUT_FILE,
            source: EMITTED_ASSET_CONTENT,
          });
          assetOperationStarted = true;
        }
      },
    },
    transform: {
      filter: { id: exactIdFilter(runtime.designatedModuleId) },
      async handler(code, id) {
        assertExactDesignatedModuleId(id, runtime.designatedModuleId);
        transformCount += 1;
        if (
          transformCount !== EXPECTED_DESIGNATED_TRANSFORM_COUNT ||
          code !== DESIGNATED_SOURCE_CONTENT
        ) {
          throw new AdapterError("M2D_TRANSFORM_TARGET_INVALID");
        }
        await runtime.session.recordRouteInvocation(
          ROUTE_IDS.designatedTransform,
          { outcome: "success" },
        );
        if (runtime.inputs.variant === "observe") {
          await runtime.session.recordToolApiChange(
            TOOL_CHANGE_IDS.moduleTransform,
            skippedToolChange(),
          );
          return null;
        }
        const before = Buffer.from(code, "utf8");
        const after = Buffer.from(TRANSFORMED_SOURCE_CONTENT, "utf8");
        await runtime.session.recordToolApiChange(
          TOOL_CHANGE_IDS.moduleTransform,
          {
            outcome: "success",
            changed: true,
            beforeHash: hashBytes(before),
            afterHash: hashBytes(after),
            byteSizeBefore: before.byteLength,
            byteSizeAfter: after.byteLength,
          },
        );
        return { code: TRANSFORMED_SOURCE_CONTENT, map: null };
      },
    },
    generateBundle: {
      async handler(_options, bundle) {
        generateBundleCount += 1;
        if (
          generateBundleCount !== 1 ||
          transformCount !== EXPECTED_DESIGNATED_TRANSFORM_COUNT
        ) {
          throw new AdapterError("M2D_ROUTE_INVALID");
        }
        await runtime.session.recordRouteInvocation(ROUTE_IDS.generateBundle, {
          outcome: "success",
        });
        const entry = findFixedEntry(bundle);
        if (runtime.inputs.variant === "observe") {
          assertExactBundleKeys(bundle, [ENTRY_OUTPUT_FILE]);
          if (
            assetOperationStarted ||
            entry.code.includes(TRANSFORMED_LITERAL) ||
            entry.code.includes(BUNDLE_MUTATION_LITERAL)
          ) {
            throw new AdapterError("M2D_TOOL_CHANGE_INVALID");
          }
          await runtime.session.recordToolApiChange(
            TOOL_CHANGE_IDS.emittedAsset,
            skippedToolChange(),
          );
          await runtime.session.recordToolApiChange(
            TOOL_CHANGE_IDS.bundleMutation,
            skippedToolChange(),
          );
          return;
        }

        assertExactBundleKeys(bundle, [ENTRY_OUTPUT_FILE, ASSET_OUTPUT_FILE]);
        const asset = bundle[ASSET_OUTPUT_FILE];
        if (asset?.type !== "asset" || !assetOperationStarted) {
          throw new AdapterError("M2D_TOOL_CHANGE_INVALID");
        }
        const assetBytes = asAssetSource(asset);
        if (
          !Buffer.from(assetBytes).equals(Buffer.from(EMITTED_ASSET_CONTENT))
        ) {
          throw new AdapterError("M2D_TOOL_CHANGE_INVALID");
        }
        await runtime.session.recordToolApiChange(
          TOOL_CHANGE_IDS.emittedAsset,
          {
            outcome: "success",
            changed: true,
            beforeHash: null,
            afterHash: hashBytes(assetBytes),
            byteSizeBefore: null,
            byteSizeAfter: assetBytes.byteLength,
          },
        );

        if (!entry.code.includes(TRANSFORMED_LITERAL)) {
          throw new AdapterError("M2D_TOOL_CHANGE_INVALID");
        }
        const beforeCode = entry.code;
        const afterCode = `${beforeCode}${BUNDLE_MUTATION_TEXT}`;
        entry.code = afterCode;
        await runtime.session.recordToolApiChange(
          TOOL_CHANGE_IDS.bundleMutation,
          {
            outcome: "success",
            changed: true,
            beforeHash: hashBytes(beforeCode),
            afterHash: hashBytes(afterCode),
            byteSizeBefore: Buffer.byteLength(beforeCode),
            byteSizeAfter: Buffer.byteLength(afterCode),
          },
        );
      },
    },
    writeBundle: {
      async handler(_options, bundle) {
        writeBundleCount += 1;
        if (
          writeBundleCount !== 1 ||
          generateBundleCount !== 1 ||
          transformCount !== EXPECTED_DESIGNATED_TRANSFORM_COUNT
        ) {
          throw new AdapterError("M2D_ROUTE_INVALID");
        }
        assertExactBundleKeys(
          bundle,
          runtime.inputs.variant === "api"
            ? [ENTRY_OUTPUT_FILE, ASSET_OUTPUT_FILE]
            : [ENTRY_OUTPUT_FILE],
        );
        await runtime.session.recordRouteInvocation(ROUTE_IDS.writeBundle, {
          outcome: "success",
        });
        await runtime.session.close();
      },
    },
  };
}
