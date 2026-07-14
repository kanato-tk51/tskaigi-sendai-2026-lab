import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  buildContainerCreateArgs,
  SCENARIO_IDS,
  validateContainerInspection,
} from "./lib.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../../..");
const experimentRoot = path.join(repositoryRoot, "experiments/npm12-install");

function check(condition, message, failures) {
  if (!condition) failures.push(message);
}

export async function verifyStaticSafety() {
  const failures = [];
  const dependencyPackage = JSON.parse(
    await readFile(
      path.join(experimentRoot, "dependency/package.json"),
      "utf8",
    ),
  );
  const markerScript = await readFile(
    path.join(experimentRoot, "dependency/write-marker.mjs"),
    "utf8",
  );
  const consumerPackage = JSON.parse(
    await readFile(path.join(experimentRoot, "consumer/package.json"), "utf8"),
  );
  const consumerNpmrc = await readFile(
    path.join(experimentRoot, "consumer/.npmrc"),
    "utf8",
  );
  const rootPackage = JSON.parse(
    await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  );
  const rootNpmrc = await readFile(path.join(repositoryRoot, ".npmrc"), "utf8");
  const containerfile = await readFile(
    path.join(experimentRoot, "Containerfile"),
    "utf8",
  );

  check(
    dependencyPackage.name === "@tskaigi-lab/m0-install-marker" &&
      dependencyPackage.version === "1.0.0" &&
      dependencyPackage.private === true,
    "dependency identity or private flag is invalid",
    failures,
  );
  check(
    JSON.stringify(dependencyPackage.scripts) ===
      JSON.stringify({ postinstall: "node ./write-marker.mjs" }),
    "dependency must have exactly the fixed postinstall command",
    failures,
  );
  check(
    dependencyPackage.dependencies === undefined &&
      dependencyPackage.devDependencies === undefined &&
      dependencyPackage.optionalDependencies === undefined,
    "dependency fixture must not have external dependencies",
    failures,
  );
  check(
    markerScript.includes('const markerPath = "/m0-output/marker.jsonl";'),
    "marker path is not fixed",
    failures,
  );
  for (const forbidden of [
    "process.env",
    "node:child_process",
    "node:net",
    "node:http",
    "node:https",
    "node:dns",
    "fetch(",
    "exec(",
    "spawn(",
  ]) {
    check(
      !markerScript.includes(forbidden),
      `marker script contains forbidden token: ${forbidden}`,
      failures,
    );
  }
  check(
    markerScript.match(/^import /gm)?.length === 2 &&
      markerScript.includes('from "node:fs/promises"') &&
      markerScript.includes('from "node:process"'),
    "marker script may only import node:fs/promises and node:process",
    failures,
  );

  const dependencies = consumerPackage.dependencies ?? {};
  check(
    Object.keys(dependencies).length === 1 &&
      dependencies["@tskaigi-lab/m0-install-marker"] ===
        "file:../input/m0-install-marker-1.0.0.tgz",
    "consumer must have exactly one local tarball dependency",
    failures,
  );
  check(
    !/(?:https?|git\+|ssh):/iu.test(JSON.stringify(consumerPackage)),
    "consumer package contains an external URL",
    failures,
  );

  const requiredNpmConfiguration = {
    "ignore-scripts": "false",
    audit: "false",
    fund: "false",
    "update-notifier": "false",
    offline: "true",
    "allow-file": "root",
    "allow-directory": "none",
    "allow-git": "none",
    "allow-remote": "none",
  };
  const configuration = Object.fromEntries(
    consumerNpmrc
      .trim()
      .split("\n")
      .map((line) => line.split("=", 2)),
  );
  for (const [key, value] of Object.entries(requiredNpmConfiguration)) {
    check(
      configuration[key] === value,
      `consumer .npmrc is missing ${key}=${value}`,
      failures,
    );
  }
  check(
    !consumerNpmrc.includes(rootNpmrc.trim()),
    "consumer .npmrc must not be copied from the root config",
    failures,
  );

  check(
    JSON.stringify(rootPackage.workspaces) === JSON.stringify(["packages/*"]),
    "root workspaces must remain packages/* only",
    failures,
  );
  for (const lifecycle of [
    "preinstall",
    "install",
    "postinstall",
    "prepare",
    "prepack",
    "postpack",
  ]) {
    check(
      rootPackage.scripts?.[lifecycle] === undefined,
      `root lifecycle script is forbidden: ${lifecycle}`,
      failures,
    );
  }
  check(
    !JSON.stringify(rootPackage.dependencies ?? {}).includes(
      "m0-install-marker",
    ) &&
      !JSON.stringify(rootPackage.devDependencies ?? {}).includes(
        "m0-install-marker",
      ),
    "root package must not depend on the M0 fixture",
    failures,
  );

  check(
    containerfile.includes("ARG BASE_IMAGE=node:24.18.0-bookworm-slim"),
    "Containerfile base image tag is not exact",
    failures,
  );
  check(
    containerfile.includes("npm@12.0.1") &&
      containerfile.includes("npm pack --ignore-scripts"),
    "Containerfile must install npm 12.0.1 and disable scripts while packing",
    failures,
  );
  check(
    !containerfile.includes("COPY . ") &&
      !containerfile.includes("COPY ../") &&
      !containerfile.includes(".npmrc /root"),
    "Containerfile must not copy the repository or root npm config",
    failures,
  );
  check(
    containerfile.includes("USER 1000:1000"),
    "runtime image must declare a non-root user",
    failures,
  );

  for (const scenarioId of SCENARIO_IDS) {
    const args = buildContainerCreateArgs({
      containerName: `m0-static-${scenarioId}`,
      mode: "scenario",
      scenarioId,
    });
    const serialized = JSON.stringify(args);
    for (const required of [
      "--network",
      "none",
      "--read-only",
      "--cap-drop",
      "ALL",
      "no-new-privileges",
      "1000:1000",
      "--pull",
      "never",
      "/work:",
      "/tmp:",
      "/m0-output:",
    ]) {
      check(
        serialized.includes(required),
        `Docker create args are missing ${required}`,
        failures,
      );
    }
    for (const forbidden of [
      "--volume",
      "--mount",
      "docker.sock",
      "/home/",
      "--privileged",
    ]) {
      check(
        !serialized.includes(forbidden),
        `Docker create args contain forbidden token: ${forbidden}`,
        failures,
      );
    }
  }

  const validInspectionFixture = [
    {
      Config: { User: "1000:1000" },
      HostConfig: {
        NetworkMode: "none",
        ReadonlyRootfs: true,
        Privileged: false,
        CapDrop: ["ALL"],
        CapAdd: [],
        SecurityOpt: ["no-new-privileges"],
        Binds: null,
        Tmpfs: {
          "/work": "rw",
          "/tmp": "rw",
          "/m0-output": "rw",
        },
      },
      Mounts: [],
    },
  ];
  check(
    validateContainerInspection(validInspectionFixture).length === 0,
    "container inspection policy validator rejected the fixed policy",
    failures,
  );

  return {
    status: failures.length === 0 ? "success" : "failure",
    failures,
    limitations: [
      "Static checks do not prove runtime isolation or lifecycle harmlessness.",
      "A human must review the complete lifecycle script and Docker boundary before execution.",
    ],
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = await verifyStaticSafety();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.status !== "success") process.exitCode = 1;
}
