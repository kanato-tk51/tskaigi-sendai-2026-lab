import process from "node:process";
import { setInterval } from "node:timers";

process.on("SIGTERM", () => undefined);
setInterval(() => undefined, 1_000);
