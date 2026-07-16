import { spawn } from "node:child_process";
import process from "node:process";
import { setInterval } from "node:timers";
import { fileURLToPath, URL } from "node:url";

const mode = process.argv[2];
if (!new Set(["hang", "output", "graceful", "exit", "nonzero"]).has(mode)) {
  process.exit(2);
}

const worker = spawn(
  process.execPath,
  [fileURLToPath(new URL("./lifecycle-worker.mjs", import.meta.url))],
  { shell: false, stdio: "ignore" },
);

const closeWorker = () => {
  worker.kill("SIGTERM");
};
process.once("exit", closeWorker);

if (mode === "hang" || mode === "output") {
  process.on("SIGTERM", () => undefined);
}

if (mode === "output") {
  setInterval(() => process.stdout.write("x".repeat(512)), 1);
} else if (mode === "hang") {
  setInterval(() => undefined, 1_000);
} else if (mode === "exit") {
  closeWorker();
  process.exit(0);
} else if (mode === "nonzero") {
  closeWorker();
  process.exit(7);
}
