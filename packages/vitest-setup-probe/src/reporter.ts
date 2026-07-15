import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { Reporter } from "vitest/reporters";

import { readCoordinatorInputs } from "./coordinator-input.js";
import { REPORT_RELATIVE_PATH, REPORT_SCHEMA_VERSION } from "./constants.js";
import type { CoordinatorReport } from "./types.js";

export class M2CReporter implements Reporter {
  async onTestRunEnd(
    testModules: Parameters<NonNullable<Reporter["onTestRunEnd"]>>[0],
    unhandledErrors: Parameters<NonNullable<Reporter["onTestRunEnd"]>>[1],
    reason: Parameters<NonNullable<Reporter["onTestRunEnd"]>>[2],
  ): Promise<void> {
    const inputs = readCoordinatorInputs();
    const tests = testModules.flatMap((testModule) => [
      ...testModule.children.allTests(),
    ]);
    const states = tests.map((testCase) => testCase.result().state);
    const report: CoordinatorReport = Object.freeze({
      schemaVersion: REPORT_SCHEMA_VERSION,
      coordinatorPid: process.pid,
      testFileCount: testModules.length,
      testCaseCount: tests.length,
      passedTestCaseCount: states.filter((state) => state === "passed").length,
      failedTestCaseCount: states.filter((state) => state === "failed").length,
      unhandledErrorCount: unhandledErrors.length,
      reason,
    });
    await writeFile(
      path.join(inputs.runRoot, REPORT_RELATIVE_PATH),
      `${JSON.stringify(report)}\n`,
      { encoding: "utf8", mode: 0o600, flag: "wx" },
    );
  }
}
