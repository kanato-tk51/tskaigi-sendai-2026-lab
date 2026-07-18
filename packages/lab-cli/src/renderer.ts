import type {
  CompleteSummary,
  InconclusiveRunMetadata,
  InconclusiveSummary,
} from "./types.js";

export function serializeJson(input: unknown): string {
  return `${JSON.stringify(input, null, 2)}\n`;
}

export function renderComparison(summary: CompleteSummary): string {
  const lines = [
    "# M3 comparison",
    "",
    `- Run validity: \`${summary.validity}\``,
    `- Expected/Observed match: \`${summary.comparison.matches ? "yes" : "no"}\``,
    `- Evidence: \`${summary.evidenceLocation}\``,
    "- Global sequence is deterministic ingestion order, not causal or real-time order.",
    "",
    "| Metric | Expected | Observed | Match |",
    "|---|---:|---:|---|",
  ];
  for (const comparison of summary.comparison.metrics) {
    lines.push(
      `| \`${comparison.metric}\` | ${comparison.expected} | ${comparison.observed} | ${comparison.matches ? "yes" : "no"} |`,
    );
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

export function serializeInconclusive(
  metadata: InconclusiveRunMetadata,
  summary: InconclusiveSummary,
): { readonly metadataJson: string; readonly summaryJson: string } {
  return Object.freeze({
    metadataJson: serializeJson(metadata),
    summaryJson: serializeJson(summary),
  });
}
