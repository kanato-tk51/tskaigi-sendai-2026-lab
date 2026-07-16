import process from "node:process";

const before = process.listenerCount("beforeExit");
const imported = await import("@tskaigi-lab/adapter-vite-plugin");
const after = process.listenerCount("beforeExit");

process.stdout.write(
  `${JSON.stringify({
    exportedRunnerCount: [
      imported.runFixedObserveScenario,
      imported.runFixedApiScenario,
    ].filter((value) => typeof value === "function").length,
    listenerDelta: after - before,
  })}\n`,
);
