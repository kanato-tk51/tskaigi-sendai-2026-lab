import { spawn } from "node:child_process";
import {
  lstat,
  mkdir,
  mkdtemp,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { DOCTOR_LIMITS } from "./constants.js";
import {
  assertFixedDoctorCommand,
  type FixedDoctorBackend,
  type FixedDoctorCommand,
} from "./doctor.js";

const repositoryRootCandidate = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const DOCKER_CONFIG_JSON = '{"auths":{}}\n';

function errnoCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }
  return typeof error.code === "string" ? error.code : null;
}

async function requireDirectory(target: string): Promise<void> {
  const entry = await lstat(target);
  if (!entry.isDirectory() || entry.isSymbolicLink()) {
    throw new Error("M4_DOCTOR_PATH");
  }
  if ((await realpath(target)) !== target) throw new Error("M4_DOCTOR_PATH");
}

async function createOwnedDirectory(
  parent: string,
  name: string,
): Promise<string> {
  const target = path.join(parent, name);
  try {
    await requireDirectory(target);
  } catch (error) {
    if (errnoCode(error) !== "ENOENT") throw error;
    await mkdir(target, { mode: 0o700 });
    await requireDirectory(target);
  }
  return target;
}

function fixedEnvironment(dockerConfigRoot: string): NodeJS.ProcessEnv {
  return Object.freeze({ DOCKER_CONFIG: dockerConfigRoot });
}

class DoctorHostBackend implements FixedDoctorBackend {
  private activeChildren = 0;
  private closed = false;

  constructor(
    private readonly repositoryRoot: string,
    private readonly dockerConfigRoot: string,
    private readonly doctorWorkRoot: string,
  ) {}

  async run(
    commandInput: FixedDoctorCommand,
    limits: Readonly<{ timeoutMs: number; outputBytes: number }>,
  ): Promise<unknown> {
    if (
      this.closed ||
      limits.timeoutMs !== DOCTOR_LIMITS.timeoutMs ||
      limits.outputBytes !== DOCTOR_LIMITS.outputBytes
    ) {
      throw new Error("M4_DOCTOR_BACKEND");
    }
    const command = assertFixedDoctorCommand(commandInput);
    return await new Promise((resolve) => {
      const stdoutChunks: Uint8Array[] = [];
      let stdoutBytes = 0;
      let stderrBytes = 0;
      let timedOut = false;
      let outputLimitExceeded = false;
      let settled = false;
      let closeGrace: ReturnType<typeof setTimeout> | null = null;
      let timeout: ReturnType<typeof setTimeout> | null = null;
      const child = spawn(command.executable, command.arguments, {
        cwd: this.repositoryRoot,
        env: fixedEnvironment(this.dockerConfigRoot),
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });
      this.activeChildren += 1;
      const settle = (exitCode: number | null): void => {
        if (settled) return;
        settled = true;
        if (timeout !== null) clearTimeout(timeout);
        if (closeGrace !== null) clearTimeout(closeGrace);
        resolve({
          exitCode,
          timedOut,
          outputLimitExceeded,
          stdoutBytes,
          stderrBytes,
          stdout:
            outputLimitExceeded || timedOut
              ? new Uint8Array()
              : Uint8Array.from(
                  Buffer.concat(
                    stdoutChunks.map((chunk) => Buffer.from(chunk)),
                    stdoutBytes,
                  ),
                ),
        });
      };
      const stop = (): void => {
        if (!child.killed) child.kill("SIGKILL");
        closeGrace ??= setTimeout(
          () => settle(null),
          DOCTOR_LIMITS.closeGraceMs,
        );
      };
      const count = (chunk: Buffer, stdout: boolean): void => {
        if (stdout) {
          stdoutBytes += chunk.byteLength;
          if (!outputLimitExceeded && !timedOut) {
            stdoutChunks.push(Uint8Array.from(chunk));
          }
        } else {
          stderrBytes += chunk.byteLength;
        }
        if (stdoutBytes + stderrBytes > limits.outputBytes) {
          outputLimitExceeded = true;
          stdoutChunks.length = 0;
          stop();
        }
      };
      child.stdout.on("data", (chunk: Buffer) => count(chunk, true));
      child.stderr.on("data", (chunk: Buffer) => count(chunk, false));
      child.once("error", () => settle(null));
      child.once("close", (exitCode) => {
        this.activeChildren -= 1;
        settle(exitCode);
      });
      timeout = setTimeout(() => {
        timedOut = true;
        stdoutChunks.length = 0;
        stop();
      }, limits.timeoutMs);
    });
  }

  async cleanup(): Promise<void> {
    if (this.closed) return;
    if (this.activeChildren !== 0) throw new Error("M4_DOCTOR_PROCESS_STATE");
    this.closed = true;
    const prefix = `${this.doctorWorkRoot}${path.sep}doctor-`;
    if (!this.dockerConfigRoot.startsWith(prefix)) {
      throw new Error("M4_DOCTOR_PATH");
    }
    await rm(this.dockerConfigRoot, { recursive: true, force: false });
  }
}

export async function createFixedDoctorHostBackend(): Promise<FixedDoctorBackend> {
  const repositoryRoot = await realpath(repositoryRootCandidate);
  if (repositoryRoot !== repositoryRootCandidate) {
    throw new Error("M4_DOCTOR_PATH");
  }
  const resultsRoot = path.join(repositoryRoot, "results");
  const runsRoot = path.join(resultsRoot, "runs");
  await requireDirectory(resultsRoot);
  await requireDirectory(runsRoot);
  const m4Root = await createOwnedDirectory(runsRoot, "m4-profile-controls");
  const doctorWorkRoot = await createOwnedDirectory(m4Root, "doctor-work");
  const dockerConfigRoot = await mkdtemp(path.join(doctorWorkRoot, "doctor-"));
  try {
    await writeFile(
      path.join(dockerConfigRoot, "config.json"),
      DOCKER_CONFIG_JSON,
      {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      },
    );
    return new DoctorHostBackend(
      repositoryRoot,
      dockerConfigRoot,
      doctorWorkRoot,
    );
  } catch (error) {
    await rm(dockerConfigRoot, { recursive: true, force: true });
    throw error;
  }
}
