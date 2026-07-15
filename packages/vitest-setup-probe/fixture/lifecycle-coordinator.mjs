import { spawn } from "node:child_process";
import process from "node:process";
import { setInterval } from "node:timers";
import { fileURLToPath, URL } from "node:url";

const mode = process.argv[2];
if (
  mode !== "hang" &&
  mode !== "output" &&
  mode !== "graceful" &&
  mode !== "exit"
) {
  process.exitCode = 2;
} else if (mode === "exit") {
  process.exitCode = 0;
} else {
  const workerPath = fileURLToPath(
    new URL("./lifecycle-worker.mjs", import.meta.url),
  );
  const worker = spawn(process.execPath, [workerPath], {
    env: {},
    shell: false,
    stdio: "ignore",
  });
  worker.once("error", () => {
    process.exitCode = 3;
  });
  if (mode !== "graceful") {
    process.on("SIGTERM", () => undefined);
  }
  if (mode === "output") {
    process.stdout.write("x".repeat(2_048));
  }
  setInterval(() => undefined, 1_000);
}
