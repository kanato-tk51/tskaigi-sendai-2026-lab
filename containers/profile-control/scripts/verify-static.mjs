import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const controlRoot = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
const repositoryRoot = path.resolve(controlRoot, "../..");

function fail(message) {
  throw new Error(`M4 static verification failed: ${message}`);
}

async function text(relativePath) {
  return readFile(path.join(controlRoot, relativePath), "utf8");
}

if (process.argv.length !== 2) fail("arguments are not accepted");

const sourceNames = (await readdir(path.join(controlRoot, "src")))
  .filter((name) => name.endsWith(".ts"))
  .sort();
const sourceEntries = await Promise.all(
  sourceNames.map(async (name) => [name, await text(`src/${name}`)]),
);
const sources = Object.fromEntries(sourceEntries);
const allSource = sourceEntries.map(([, source]) => source).join("\n");
const [
  rootPackageSource,
  rootTsconfigSource,
  rootVitestSource,
  containerfile,
  controlRunner,
  fixedChild,
  versionedImageInputSource,
  permissiveReadme,
  constrainedReadme,
  permissiveProfileSource,
  constrainedProfileSource,
  milestoneSource,
  contractSource,
  exactInputContractSource,
  adrSource,
  implementationPrompt,
  reviewPrompt,
  remediationReviewPrompt,
  inputBindingPrompt,
  inputBindingReviewPrompt,
  exactInputPrompt,
  exactInputReviewPrompt,
  exactInputBackendRemediationPrompt,
  exactInputBackendRemediationReviewPrompt,
  doctorPrompt,
  doctorReviewPrompt,
  doctorRemediationPrompt,
  doctorRemediationReviewPrompt,
  doctorCanonicalBytesRemediationPrompt,
  doctorCanonicalBytesRemediationReviewPrompt,
  offlineBuildPrompt,
  offlineBuildReviewPrompt,
  offlineBuildResultRemediationPrompt,
  offlineBuildResultRemediationReviewPrompt,
  offlineBuildRecoveryPrompt,
  offlineBuildRecoveryReviewPrompt,
  runControlsRemediationPrompt,
  runControlsRemediationReviewPrompt,
] = await Promise.all([
  readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  readFile(path.join(repositoryRoot, "tsconfig.json"), "utf8"),
  readFile(path.join(repositoryRoot, "vitest.config.ts"), "utf8"),
  text("Containerfile"),
  text("fixture/control-runner.mjs"),
  text("fixture/fixed-child.mjs"),
  text("image-input.json"),
  readFile(path.join(repositoryRoot, "profiles/permissive/README.md"), "utf8"),
  readFile(path.join(repositoryRoot, "profiles/constrained/README.md"), "utf8"),
  readFile(
    path.join(repositoryRoot, "profiles/permissive/profile.json"),
    "utf8",
  ),
  readFile(
    path.join(repositoryRoot, "profiles/constrained/profile.json"),
    "utf8",
  ),
  readFile(path.join(repositoryRoot, "docs/milestones.md"), "utf8"),
  readFile(path.join(repositoryRoot, "docs/m4-execution-profiles.md"), "utf8"),
  readFile(
    path.join(repositoryRoot, "docs/m4-execution-profiles-exact-input.md"),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "docs/decisions/0001-separate-profile-controls-from-route-evidence.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(repositoryRoot, "prompts/m4-execution-profiles.md"),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-input-binding-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-input-binding-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-exact-input-contract.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-exact-input-contract-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-exact-input-backend-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-doctor-boundary.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-doctor-boundary-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-doctor-boundary-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-doctor-boundary-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-doctor-canonical-bytes-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-doctor-canonical-bytes-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-offline-build-backend.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-offline-build-backend-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-offline-build-result-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-offline-build-recovery.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/m4-execution-profiles-run-controls-remediation.md",
    ),
    "utf8",
  ),
  readFile(
    path.join(
      repositoryRoot,
      "prompts/reviews/m4-execution-profiles-run-controls-remediation-review.md",
    ),
    "utf8",
  ),
]);

const rootPackage = JSON.parse(rootPackageSource);
const rootTsconfig = JSON.parse(rootTsconfigSource);
const versionedImageInput = JSON.parse(versionedImageInputSource);
if (
  JSON.stringify(rootPackage.workspaces) !== JSON.stringify(["packages/*"]) ||
  rootPackage.engines?.node !== ">=20.18.2 <21" ||
  rootPackage.engines?.npm !== "11.12.1"
) {
  fail("root workspace/toolchain boundary");
}
for (const script of [
  "m4:typecheck",
  "m4:static",
  "m4:test",
  "m4:verify",
  "m4:doctor",
  "m4:build",
  "m4:run:controls",
  "m4:verify:evidence",
]) {
  if (typeof rootPackage.scripts?.[script] !== "string") {
    fail(`missing root script ${script}`);
  }
}
if (
  !rootTsconfig.include?.includes("containers/profile-control/src/**/*.ts") ||
  !rootTsconfig.include?.includes("containers/profile-control/test/**/*.ts") ||
  !rootVitestSource.includes("containers/profile-control/test/**/*.test.ts")
) {
  fail("root TypeScript/test wiring");
}

const exactInputKeys = [
  "schemaVersion",
  "baseImageName",
  "baseImageDigest",
  "nodeVersion",
  "baseEnvironmentKeys",
  "stagingFiles",
  "stagingDigest",
];
const exactStagingFiles = [
  "Containerfile",
  "fixture/canary.txt",
  "fixture/control-runner.mjs",
  "fixture/fixed-child.mjs",
];
const stagingEvidence = await Promise.all(
  exactStagingFiles.map(async (logicalPath) => {
    const fileBytes = await readFile(path.join(controlRoot, logicalPath));
    return {
      logicalPath,
      byteLength: fileBytes.byteLength,
      sha256: `sha256:${createHash("sha256").update(fileBytes).digest("hex")}`,
    };
  }),
);
const stagingAggregate = `${stagingEvidence
  .map(
    ({ logicalPath, byteLength, sha256 }) =>
      `${logicalPath}\0${byteLength}\0${sha256}`,
  )
  .join("\n")}\n`;
const exactStagingDigest = `sha256:${createHash("sha256")
  .update(stagingAggregate, "utf8")
  .digest("hex")}`;
if (
  JSON.stringify(Object.keys(versionedImageInput)) !==
    JSON.stringify(exactInputKeys) ||
  versionedImageInput.schemaVersion !== "lab-profile-image-input/v1" ||
  versionedImageInput.baseImageName !== "node" ||
  versionedImageInput.baseImageDigest !==
    "sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0" ||
  versionedImageInput.nodeVersion !== "v20.18.2" ||
  JSON.stringify(versionedImageInput.baseEnvironmentKeys) !==
    JSON.stringify(["PATH", "NODE_VERSION", "YARN_VERSION"]) ||
  JSON.stringify(versionedImageInput.stagingFiles) !==
    JSON.stringify(exactStagingFiles) ||
  versionedImageInput.stagingDigest !== exactStagingDigest
) {
  fail("versioned exact image input proposal");
}

if (
  !containerfile.includes("ARG BASE_IMAGE") ||
  !containerfile.includes("FROM ${BASE_IMAGE}") ||
  !containerfile.includes("USER 10001:10001") ||
  !containerfile.includes(
    'ENTRYPOINT ["/usr/local/bin/node", "/opt/m4-control/control-runner.mjs"]',
  ) ||
  /^(?:RUN|ADD)\s/imu.test(containerfile) ||
  /https?:\/\//iu.test(containerfile)
) {
  fail("shared offline Containerfile boundary");
}

for (const forbidden of [
  "Object.keys(process.env)",
  "Object.entries(process.env)",
  "for (const key in process.env)",
  "shell: true",
  "node:https",
  "0.0.0.0",
  "169.254.169.254",
  "/var/run/docker.sock",
  "console.log",
  "console.error",
]) {
  if (controlRunner.includes(forbidden)) {
    fail(`fixture forbidden marker ${forbidden}`);
  }
}
for (const required of [
  "Object.hasOwn(process.env, ENVIRONMENT_KEY)",
  'const ENVIRONMENT_KEY = "PROBE_CANARY_M4_CONTROL"',
  "host: LOOPBACK_HOST",
  'const LOOPBACK_HOST = "127.0.0.1"',
  "execFileAsync(process.execPath, [FIXED_CHILD_PATH]",
  "shell: false",
  "env: {}",
  "flag: constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY",
  'schemaVersion: "lab-profile-control-evidence/v1"',
]) {
  if (!controlRunner.includes(required)) {
    fail(`fixture required marker ${required}`);
  }
}
if (
  !fixedChild.includes('process.stdout.write("m4-fixed-child-v1\\n")') ||
  fixedChild.includes("node:child_process") ||
  /process\.env/u.test(fixedChild)
) {
  fail("fixed child boundary");
}

for (const forbidden of [
  "node:https",
  "shell: true",
  "child_process.exec(",
  "child_process.spawn(",
  "/var/run/docker.sock",
  "host.docker.internal",
  "--privileged",
  "--network=host",
  "--pid=host",
]) {
  if (allSource.includes(forbidden)) {
    fail(`source forbidden marker ${forbidden}`);
  }
}
const dockerPlan = sources["docker-plan.ts"] ?? "";
const dockerFormats = sources["docker-formats.ts"] ?? "";
const canonical = sources["canonical.ts"] ?? "";
const completion = sources["completion.ts"] ?? "";
const execution = sources["execution.ts"] ?? "";
const inspect = sources["inspect.ts"] ?? "";
const indexSource = sources["index.ts"] ?? "";
const orchestrator = sources["orchestrator.ts"] ?? "";
const staging = sources["staging.ts"] ?? "";
const doctor = sources["doctor.ts"] ?? "";
const doctorHostBackend = sources["doctor-host-backend.ts"] ?? "";
const offlineBuild = sources["offline-build.ts"] ?? "";
const offlineBuildHostBackend = sources["offline-build-host-backend.ts"] ?? "";
const offlineBuildProcess = sources["offline-build-process.ts"] ?? "";
const offlineBuildRecovery = sources["offline-build-recovery.ts"] ?? "";
const offlineBuildRecoveryHostBackend =
  sources["offline-build-recovery-host-backend.ts"] ?? "";
const controlHostBackend = sources["control-host-backend.ts"] ?? "";
const profileInput = sources["profile-input.ts"] ?? "";
const runControls = sources["run-controls.ts"] ?? "";
for (const [sourceName, source] of sourceEntries) {
  if (
    sourceName !== "doctor-host-backend.ts" &&
    sourceName !== "offline-build-host-backend.ts" &&
    sourceName !== "offline-build-recovery-host-backend.ts" &&
    sourceName !== "control-host-backend.ts" &&
    source.includes('from "node:child_process"')
  ) {
    fail(`unexpected host child-process source ${sourceName}`);
  }
}
for (const required of [
  "FIXED_CONTROL_IMAGE_DIGEST",
  "FIXED_PERMISSIVE_RUN_ID",
  "FIXED_CONSTRAINED_RUN_ID",
  "parseCanonicalExecutionProfileBytes",
  "serializeCanonicalExecutionProfile",
  "createFixedProductionControlDefinition",
  "createFixedControlHostBackend",
  "executeFixedExistingImageProfilePair",
]) {
  if (!runControls.includes(required) && !profileInput.includes(required)) {
    fail(`run-controls binding marker ${required}`);
  }
}
for (const forbidden of [
  "executeFixedProfilePair(",
  "createImageBuildPlan",
  "stageBuildContext",
  "readBuildContext",
  '"doctor"',
  '"build"',
  '"inspect-image"',
]) {
  if (runControls.includes(forbidden)) {
    fail(`run-controls rebuild marker ${forbidden}`);
  }
}
for (const required of [
  'import { spawn, type ChildProcessByStdio } from "node:child_process"',
  "createFixedControlHostBackend",
  "createControlHostBackend",
  "requireAbsent(input.permissiveLayout.runRoot)",
  "requireAbsent(input.constrainedLayout.runRoot)",
  "command !== expectedCommand",
  "command.executable !== FIXED_DOCKER_EXECUTABLE",
  "env: Object.freeze({",
  "DOCKER_CONFIG: command.environment.DOCKER_CONFIG",
  "shell: false",
  'stdio: ["ignore", "pipe", "pipe"]',
  'child.kill("SIGKILL")',
  "this.activeChildren.size !== 0",
  "constants.O_NOFOLLOW",
  "serializeCanonicalControlManifest",
  '"cp"',
  '"/result/control-evidence.json"',
  '"/result/result-marker.txt"',
  '"/scratch/scratch-marker.txt"',
  'flag: "wx"',
  '"control-evidence.json"',
  '"host-inspection.json"',
  '"completion.json"',
  '"comparison.json"',
]) {
  if (!controlHostBackend.includes(required)) {
    fail(`control host backend marker ${required}`);
  }
}
for (const forbidden of [
  "process.env",
  "HOME",
  "DOCKER_HOST",
  "/var/run/docker.sock",
  '"build"',
  '"image"',
  '"version"',
  "FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID",
]) {
  if (controlHostBackend.includes(forbidden)) {
    fail(`control host backend forbidden marker ${forbidden}`);
  }
}
for (const required of [
  'export const FIXED_DOCKER_EXECUTABLE = "/usr/bin/docker"',
  '"--pull",\n    "never"',
  '"--network",\n    "none"',
  '"--read-only"',
  '"--ipc",\n    "private"',
  '"--cgroupns",\n    "private"',
  '"--entrypoint",\n    FIXED_NODE_EXECUTABLE',
  '"--cap-drop",\n    "ALL"',
  '"--security-opt",\n    "no-new-privileges"',
  '"--log-driver",\n    "none"',
  '"--runtime",\n    FIXED_CONTAINER_RUNTIME',
  '"--experimental-permission"',
  '"--allow-fs-read=/opt/m4-control,/input,/result,/scratch"',
  '"--allow-fs-write=/opt/m4-control,/result,/scratch"',
  "dst=${FIXED_INPUT_DESTINATION},ro",
  "dst=${FIXED_RESULT_DESTINATION},rw",
  "dst=${FIXED_SCRATCH_DESTINATION}",
  "FIXED_INSPECT_FORMAT",
  "FIXED_IMAGE_ID_FORMAT",
  "FIXED_RUNTIME_VERSION_FORMAT",
]) {
  if (!dockerPlan.includes(required)) fail(`Docker plan marker ${required}`);
}
for (const required of [
  '"runtime-version"',
  '"base-image-identity"',
  '"base-environment-keys"',
  '"version",\n        "--format"',
  '"image",\n        "inspect"',
  "FIXED_BASE_IMAGE_TAG",
  "FIXED_RUNTIME_VERSION_FORMAT",
  "assertCanonicalJsonBytes",
  "canonicalEncoder.encode",
  "canonicalBytes.byteLength !== bytes.byteLength",
  "parseBaseEnvironmentSnapshot",
  "sameImageIdentity",
  "assertFixedDoctorCommand",
  "validateBaseEnvironmentKeys",
  'doctorFailure("COMMAND_TIMEOUT")',
  'doctorFailure("OUTPUT_LIMIT")',
  'failure = "CLEANUP_FAILURE"',
]) {
  if (!doctor.includes(required)) fail(`doctor marker ${required}`);
}
for (const forbidden of ['"pull"', '"build"', '"create"', '"run"', '"start"']) {
  if (doctor.includes(forbidden)) fail(`doctor forbidden verb ${forbidden}`);
}
for (const required of [
  "FIXED_RUNTIME_VERSION_FORMAT",
  "FIXED_BASE_IMAGE_INSPECT_FORMAT",
  "FIXED_BASE_ENVIRONMENT_KEYS_FORMAT",
  "FIXED_IMAGE_ID_FORMAT",
  "FIXED_INSPECT_FORMAT",
  "FIXED_DOCKER_FORMATS",
  ".Client.Version",
  ".Server.Version",
  "M4_INVALID_ENV_ENTRY",
  ".HostConfig.ReadonlyRootfs",
  ".HostConfig.SecurityOpt",
  ".HostConfig.DeviceRequests",
  ".HostConfig.PortBindings",
  ".HostConfig.LogConfig.Config",
  ".HostConfig.RestartPolicy.MaximumRetryCount",
  ".State.Status",
]) {
  if (!dockerFormats.includes(required))
    fail(`Docker format marker ${required}`);
}
if (/\{\{[^}]*\bdict\b/u.test(dockerFormats)) {
  fail("unsupported Docker template function dict");
}
for (const required of [
  'import { spawn } from "node:child_process"',
  "spawn(command.executable, command.arguments",
  "env: fixedEnvironment(this.dockerConfigRoot)",
  "shell: false",
  'stdio: ["ignore", "pipe", "pipe"]',
  'child.kill("SIGKILL")',
  "private activeChildren = 0",
  "if (this.activeChildren !== 0)",
  "const DOCKER_CONFIG_JSON = '{\"auths\":{}}\\n'",
  'path.join(repositoryRoot, "results")',
  'path.join(resultsRoot, "runs")',
  'createOwnedDirectory(runsRoot, "m4-profile-controls")',
  'createOwnedDirectory(m4Root, "doctor-work")',
]) {
  if (!doctorHostBackend.includes(required)) {
    fail(`doctor host backend marker ${required}`);
  }
}
for (const forbidden of [
  "process.env",
  "HOME",
  "DOCKER_HOST",
  "stderrChunks",
]) {
  if (doctorHostBackend.includes(forbidden)) {
    fail(`doctor host backend forbidden marker ${forbidden}`);
  }
}
for (const required of [
  "FIXED_OFFLINE_BUILD_RECOVERY_RUN_ID",
  "FIXED_OFFLINE_BUILD_RECOVERY_IMAGE_TAG",
  "OFFLINE_BUILD_RECOVERY_STEP_IDS",
  "createFixedOfflineBuildRecoveryInput",
  "fixedInputBindings",
  "validateRecordedFailedBuildResult",
  "assertFixedOfflineBuildRecoveryCommand",
  '"image",',
  '"inspect",',
  "FIXED_IMAGE_ID_FORMAT",
  '"validate-retained-state"',
  '"inspect-image"',
  '"validate-retained-state-after-inspect"',
  "parseRecoveredImageDigest",
  "KNOWN_SYNTHETIC_PROFILE_IMAGE_DIGEST",
  "validFailureState",
  'ownedStateDisposition: "retained"',
  "serializeCanonicalOfflineBuildRecoveryResult",
  "parseCanonicalOfflineBuildRecoveryResultBytes",
]) {
  if (!offlineBuildRecovery.includes(required)) {
    fail(`offline build recovery marker ${required}`);
  }
}
for (const required of [
  'import { spawn, type ChildProcessByStdio } from "node:child_process"',
  "FIXED_RETAINED_STATE_INVENTORY",
  'relativePath: "docker-config/.token_seed"',
  "byteLength: 74",
  '"docker-config/buildx/refs/default/default/tdjwufr4i7552r09bibchdkva"',
  "byteLength: 281",
  "entry.nlink !== 1",
  "captureExactRetainedState",
  "validateCapturedRetainedState",
  "productionFactoryConsumed",
  "consumeOfflineBuildRecoveryInspectAttempt",
  "assertFixedOfflineBuildRecoveryCommand(command)",
  "spawn(command.executable, command.arguments",
  "cwd: this.repositoryRoot",
  "env: Object.freeze({ DOCKER_CONFIG: this.dockerConfigRoot })",
  "shell: false",
  'stdio: ["ignore", "pipe", "pipe"]',
  'child.kill("SIGKILL")',
  "createOfflineBuildProcessState",
  "observeOfflineBuildProcessFailure",
  "observeOfflineBuildProcessOutput",
]) {
  if (!offlineBuildRecoveryHostBackend.includes(required)) {
    fail(`offline build recovery host backend marker ${required}`);
  }
}
for (const forbidden of [
  "process.env",
  "HOME",
  "DOCKER_HOST",
  "readFile",
  "open(",
  "writeFile",
  "unlink(",
  "rmdir(",
  "rm(",
  "rename(",
  "chmod(",
  "mkdir(",
  "/var/run/docker.sock",
]) {
  if (offlineBuildRecoveryHostBackend.includes(forbidden)) {
    fail(`offline build recovery forbidden marker ${forbidden}`);
  }
}
for (const required of [
  "OFFLINE_BUILD_STEP_IDS",
  "createFixedOfflineBuildInput",
  "fixedInputBindings",
  '"stage-build-context"',
  '"doctor"',
  '"build"',
  '"inspect-image"',
  "assertFixedImageBuildPlan",
  "copyAcceptedStagingFiles",
  "verifyAcceptedStagingFiles",
  "parseRuntimeVersion",
  "parseBuiltImageDigest",
  "FIXED_DOCKER_CLI_VERSION",
  "FIXED_DOCKER_SERVER_VERSION",
  "FIXED_BASE_IMAGE_DIGEST",
  "M0_NODE24_IMAGE_DIGEST",
  "KNOWN_SYNTHETIC_PROFILE_IMAGE_DIGEST",
  "validFailurePrefixLength",
  "validateOfflineBuildResult",
  "serializeCanonicalOfflineBuildResult",
  "parseCanonicalOfflineBuildResultBytes",
  'primaryFailure ??= "CLEANUP_FAILURE"',
]) {
  if (!offlineBuild.includes(required)) {
    fail(`offline build executor marker ${required}`);
  }
}
for (const required of [
  'import { spawn, type ChildProcessByStdio } from "node:child_process"',
  "spawn(command.executable, command.arguments",
  "cwd: this.repositoryRoot",
  "env: Object.freeze({ DOCKER_CONFIG: this.layout.dockerConfigRoot })",
  "shell: false",
  'stdio: ["ignore", "pipe", "pipe"]',
  'child.kill("SIGKILL")',
  "this.activeChildren.size !== 0",
  "constants.O_NOFOLLOW",
  "entry.nlink !== 1",
  'flag: "wx"',
  "DOCKER_CONFIG_JSON",
  "verifyAcceptedStagingFiles(snapshot, repositoryFiles)",
  "assertFixedImageBuildPlan",
  "createExclusiveDirectory(m4Root, input.layout.runId)",
  "createOfflineBuildProcessState",
  "observeOfflineBuildProcessFailure",
  "observeOfflineBuildProcessOutput",
]) {
  if (!offlineBuildHostBackend.includes(required)) {
    fail(`offline build host backend marker ${required}`);
  }
}
for (const required of [
  '"output-limit"',
  '"process-error"',
  '"timeout"',
  "state.firstFailure ?? failure",
  "state.firstFailure ??",
  "stdoutBytes + stderrBytes > outputLimitBytes",
  "Math.min(current + added, limit + 1)",
]) {
  if (!offlineBuildProcess.includes(required)) {
    fail(`offline build process marker ${required}`);
  }
}
for (const forbidden of [
  "process.env",
  "HOME",
  "DOCKER_HOST",
  "stderrChunks",
  "/var/run/docker.sock",
  "executeFixedProfilePair",
  '"create"',
  '"start"',
  '"run-controls"',
]) {
  if (offlineBuildHostBackend.includes(forbidden)) {
    fail(`offline build host backend forbidden marker ${forbidden}`);
  }
}
for (const required of [
  'const MANIFEST_PATH = "/input/control-manifest.json"',
  'const SCRATCH_PATH = "/scratch/scratch-marker.txt"',
]) {
  if (!controlRunner.includes(required))
    fail(`fixture path marker ${required}`);
}
for (const [sourceName, source, requiredMarkers] of [
  [
    "staging",
    staging,
    [
      "FIXED_STAGING_FILES",
      "preparedBytes",
      "acceptedBytes",
      "inventoryDigest",
      "verifyAcceptedStagingFiles",
      "SharedArrayBuffer",
    ],
  ],
  [
    "canonical",
    canonical,
    [
      "serializeCanonicalControlManifest",
      "serializeCanonicalControlEvidence",
      "SharedArrayBuffer",
    ],
  ],
  [
    "completion",
    completion,
    [
      '"input/control-manifest.json"',
      '"host/host-inspection.json"',
      '"container-result/control-evidence.json"',
      "manifestSha256",
      "hostInspectionSha256",
      "controlEvidenceSha256",
    ],
  ],
  [
    "inspect",
    inspect,
    [
      '"deviceRequests"',
      '"runtime"',
      '"usernsMode"',
      '"portBindings"',
      '"logType"',
    ],
  ],
  [
    "execution",
    execution,
    [
      "assertFixedImageBuildPlan",
      "assertFixedProfilePairDockerPlans",
      "stageBuildContext",
      "readBuildContext",
      "copyAcceptedStagingFiles",
      "input.acceptedSnapshot.baseEnvironmentKeys",
      "validatePreBuildRuntimeVersion",
      "RUNTIME_VERSION_KEYS",
      "FIXED_DOCKER_CLI_VERSION",
      "FIXED_DOCKER_SERVER_VERSION",
      "canonicalEncoder.encode",
      "result.payload.byteLength !== result.stdoutBytes",
      'failStep("COMMAND_TIMEOUT")',
      'failStep("OUTPUT_LIMIT")',
      'failStep("IMMUTABLE_INPUT_CHANGED")',
      'primaryFailure = "CLEANUP_FAILURE"',
      "executeFixedExistingImageProfilePair",
      "validateExistingImageExecutionPlan",
      "recordProfileResult",
      "await input.backend.cleanup()",
    ],
  ],
]) {
  for (const marker of requiredMarkers) {
    if (!source.includes(marker)) fail(`${sourceName} marker ${marker}`);
  }
}
if (
  !orchestrator.includes('"doctor"') ||
  !orchestrator.includes('"run-controls"') ||
  !orchestrator.includes('failProfile("M4_EXECUTION_NOT_APPROVED")') ||
  orchestrator.includes("process.argv") ||
  orchestrator.includes("doctor-host-backend") ||
  orchestrator.includes("offline-build") ||
  orchestrator.includes("control-host-backend") ||
  orchestrator.includes("run-controls.js") ||
  indexSource.includes("doctor-host-backend") ||
  indexSource.includes("offline-build") ||
  indexSource.includes("control-host-backend") ||
  indexSource.includes("run-controls.js")
) {
  fail("fixed orchestrator gate");
}

const fixedControlDigest =
  "sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd";
for (const [profileId, profileReadme, profileSource] of [
  ["permissive", permissiveReadme, permissiveProfileSource],
  ["constrained", constrainedReadme, constrainedProfileSource],
]) {
  const profile = JSON.parse(profileSource);
  if (
    profileSource !== `${JSON.stringify(profile)}\n` ||
    profile.schemaVersion !== "lab-execution-profile/v1" ||
    profile.profileId !== profileId ||
    profile.containerImageDigest !== fixedControlDigest ||
    !profileReadme.includes("`profile.json` は") ||
    !profileReadme.includes(fixedControlDigest) ||
    !profileReadme.includes("fresh independent") ||
    profileReadme.includes("Observed enforcement result が存在する")
  ) {
    fail(`fixed ${profileId} profile input`);
  }
}
for (const profileId of ["permissive", "constrained"]) {
  const entries = await readdir(
    path.join(repositoryRoot, "profiles", profileId),
  );
  if (
    JSON.stringify(entries.sort()) !==
    JSON.stringify(["README.md", "profile.json"])
  ) {
    fail(`unexpected ${profileId} profile input`);
  }
}
if (
  !milestoneSource.includes("ADR-0001 承認済み") ||
  !contractSource.includes("human reviewer が明示的に承認済み") ||
  !exactInputContractSource.includes("independent read-only review pending") ||
  !adrSource.includes("Status: Accepted") ||
  !implementationPrompt.includes("# Goal") ||
  !implementationPrompt.includes("# Completion report") ||
  !reviewPrompt.includes("# Goal") ||
  !reviewPrompt.includes("# Completion report") ||
  !remediationReviewPrompt.includes("# Goal") ||
  !remediationReviewPrompt.includes("# Completion report") ||
  !inputBindingPrompt.includes("# Goal") ||
  !inputBindingPrompt.includes("# Completion report") ||
  !inputBindingReviewPrompt.includes("# Goal") ||
  !inputBindingReviewPrompt.includes("# Completion report") ||
  !exactInputPrompt.includes("# Goal") ||
  !exactInputPrompt.includes("# Completion report") ||
  !exactInputReviewPrompt.includes("# Goal") ||
  !exactInputReviewPrompt.includes("# Completion report") ||
  !exactInputBackendRemediationPrompt.includes("# Goal") ||
  !exactInputBackendRemediationPrompt.includes("# Completion report") ||
  !exactInputBackendRemediationReviewPrompt.includes("# Goal") ||
  !exactInputBackendRemediationReviewPrompt.includes("# Completion report") ||
  !doctorPrompt.includes("# Goal") ||
  !doctorPrompt.includes("# Completion report") ||
  !doctorReviewPrompt.includes("# Goal") ||
  !doctorReviewPrompt.includes("# Completion report") ||
  !doctorRemediationPrompt.includes("# Goal") ||
  !doctorRemediationPrompt.includes("# Completion report") ||
  !doctorRemediationReviewPrompt.includes("# Goal") ||
  !doctorRemediationReviewPrompt.includes("# Completion report") ||
  !doctorCanonicalBytesRemediationPrompt.includes("# Goal") ||
  !doctorCanonicalBytesRemediationPrompt.includes("# Completion report") ||
  !doctorCanonicalBytesRemediationReviewPrompt.includes("# Goal") ||
  !doctorCanonicalBytesRemediationReviewPrompt.includes(
    "# Completion report",
  ) ||
  !offlineBuildPrompt.includes("# Goal") ||
  !offlineBuildPrompt.includes("# Completion report") ||
  !offlineBuildReviewPrompt.includes("# Goal") ||
  !offlineBuildReviewPrompt.includes("# Completion report") ||
  !offlineBuildResultRemediationPrompt.includes("# Goal") ||
  !offlineBuildResultRemediationPrompt.includes("# Completion report") ||
  !offlineBuildResultRemediationReviewPrompt.includes("# Goal") ||
  !offlineBuildResultRemediationReviewPrompt.includes("# Completion report") ||
  !offlineBuildRecoveryPrompt.includes("# Goal") ||
  !offlineBuildRecoveryPrompt.includes("# Completion report") ||
  !offlineBuildRecoveryReviewPrompt.includes("# Goal") ||
  !offlineBuildRecoveryReviewPrompt.includes("# Completion report") ||
  !runControlsRemediationPrompt.includes("# Goal") ||
  !runControlsRemediationPrompt.includes("# Completion report") ||
  !runControlsRemediationReviewPrompt.includes("# Goal") ||
  !runControlsRemediationReviewPrompt.includes("# Completion report")
) {
  fail("approved documentation/prompt boundary");
}

process.stdout.write(
  "M4 static contract verified (no Docker execution; no runtime enforcement claim)\n",
);
