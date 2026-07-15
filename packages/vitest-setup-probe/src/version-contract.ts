import { access, readFile } from "node:fs/promises";
import path from "node:path";

import {
  ADAPTER_NAME,
  ADAPTER_VERSION,
  NODE_VERSION,
  NPM_VERSION,
  VITEST_VERSION,
} from "./constants.js";
import { ADAPTER_ROOT } from "./config-contract.js";
import { AdapterError } from "./errors.js";

interface VersionContractResult {
  readonly vitestCliPath: string;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

async function readJsonObject(
  filePath: string,
): Promise<Record<string, unknown>> {
  try {
    const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"));
    const object = objectValue(parsed);
    if (object === undefined) {
      throw new AdapterError("M2C_VERSION_MISMATCH");
    }
    return object;
  } catch (error) {
    if (error instanceof AdapterError) {
      throw error;
    }
    throw new AdapterError("M2C_VERSION_MISMATCH");
  }
}

export function assertExactVersion(actual: string, expected: string): void {
  if (actual !== expected) {
    throw new AdapterError("M2C_VERSION_MISMATCH");
  }
}

export async function verifyVersionContract(): Promise<VersionContractResult> {
  assertExactVersion(process.version, NODE_VERSION);
  const repositoryRoot = path.resolve(ADAPTER_ROOT, "../..");
  const rootPackage = await readJsonObject(
    path.join(repositoryRoot, "package.json"),
  );
  const adapterPackage = await readJsonObject(
    path.join(ADAPTER_ROOT, "package.json"),
  );
  const lockfile = await readJsonObject(
    path.join(repositoryRoot, "package-lock.json"),
  );
  const installedVitest = await readJsonObject(
    path.join(repositoryRoot, "node_modules/vitest/package.json"),
  );
  const rootDevDependencies = objectValue(rootPackage.devDependencies);
  const rootEngines = objectValue(rootPackage.engines);
  const adapterDependencies = objectValue(adapterPackage.dependencies);
  const adapterEngines = objectValue(adapterPackage.engines);
  const lockPackages = objectValue(lockfile.packages);
  const lockRoot = objectValue(lockPackages?.[""]);
  const lockRootDevDependencies = objectValue(lockRoot?.devDependencies);
  const lockInstalledVitest = objectValue(
    lockPackages?.["node_modules/vitest"],
  );
  const lockAdapter = objectValue(
    lockPackages?.["packages/vitest-setup-probe"],
  );
  const lockAdapterDependencies = objectValue(lockAdapter?.dependencies);
  const vitestCliPath = path.join(
    repositoryRoot,
    "node_modules/vitest/vitest.mjs",
  );

  if (
    rootPackage.packageManager !== `npm@${NPM_VERSION}` ||
    rootEngines?.npm !== NPM_VERSION ||
    rootDevDependencies?.vitest !== VITEST_VERSION ||
    adapterPackage.name !== ADAPTER_NAME ||
    adapterPackage.version !== ADAPTER_VERSION ||
    adapterDependencies?.["@tskaigi-lab/probe-core"] !== "0.0.0" ||
    adapterDependencies.vitest !== VITEST_VERSION ||
    adapterEngines?.node !== NODE_VERSION.slice(1) ||
    adapterEngines.npm !== NPM_VERSION ||
    lockRootDevDependencies?.vitest !== VITEST_VERSION ||
    lockInstalledVitest?.version !== VITEST_VERSION ||
    lockAdapter?.name !== ADAPTER_NAME ||
    lockAdapter?.version !== ADAPTER_VERSION ||
    lockAdapterDependencies?.["@tskaigi-lab/probe-core"] !== "0.0.0" ||
    lockAdapterDependencies.vitest !== VITEST_VERSION ||
    installedVitest.version !== VITEST_VERSION
  ) {
    throw new AdapterError("M2C_VERSION_MISMATCH");
  }
  try {
    await access(vitestCliPath);
  } catch {
    throw new AdapterError("M2C_VERSION_MISMATCH");
  }
  return Object.freeze({ vitestCliPath });
}
