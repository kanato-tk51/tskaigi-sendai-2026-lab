export const SCENARIO_IDS: readonly string[];
export const OPERATIONS: readonly string[];
export const BASE_IMAGE: string;
export const IMAGE_NAME: string;
export const EXPECTED_NODE: string;
export const EXPECTED_NPM: string;
export const OUTPUT_BUNDLE_PREFIX: string;
export const EXPECTED_BY_SCENARIO: Readonly<Record<string, string>>;

export function assertScenarioId(value: unknown): string;
export function assertOperation(value: unknown): string;
export function createRunId(now?: Date, suffix?: string): string;
export function resolveResultPath(
  repositoryRoot: string,
  runId: string,
): string;
export function assertOutputFilePath(value: unknown): string;
export function parseOutputBundle(
  rawOutput: unknown,
  options: { mode: "official" | "scenario"; scenarioId?: string },
): {
  bundle: Record<string, unknown>;
  decodedFiles: Array<{ path: string; contents: Buffer }>;
};
export function buildContainerCreateArgs(input: {
  containerName: string;
  mode: "official" | "scenario";
  scenarioId?: string;
}): string[];
export function validateContainerInspection(value: unknown): string[];
export function projectInspectionPolicy(
  value: unknown,
): Record<string, unknown>;
export function validateSummary(value: unknown): string[];
export function sanitizeText(
  value: unknown,
  options?: { repositoryRoot?: string; runId?: string },
): string;
export function sanitizeValue(
  value: unknown,
  options?: { repositoryRoot?: string; runId?: string },
): unknown;
export function extractAllowScripts(
  value: Record<string, unknown> | null,
): Record<string, unknown> | null;
export function readJsonIfPresent(
  filePath: string,
): Promise<Record<string, unknown> | null>;
export function sha256FileIfPresent(filePath: string): Promise<string | null>;
export function writeJson(filePath: string, value: unknown): Promise<void>;
import type { Buffer } from "node:buffer";
