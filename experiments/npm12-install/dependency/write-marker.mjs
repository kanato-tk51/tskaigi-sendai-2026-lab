import { appendFile } from "node:fs/promises";
import process from "node:process";

const markerPath = "/m0-output/marker.jsonl";
const markerEvent = {
  schemaVersion: 1,
  packageName: "@tskaigi-lab/m0-install-marker",
  packageVersion: "1.0.0",
  lifecycle: "postinstall",
  pid: process.pid,
  timestamp: new Date().toISOString(),
};

await appendFile(markerPath, `${JSON.stringify(markerEvent)}\n`, {
  encoding: "utf8",
  flag: "a",
});
