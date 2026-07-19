export interface FixedViteStagingEntry {
  readonly sourcePath: string;
  readonly targetPath: string;
  readonly mode: 0o444 | 0o555;
}

export interface FixedViteStagingPlan {
  readonly stagingRoot: string;
  readonly entries: readonly FixedViteStagingEntry[];
}

export function createFixedViteStagingPlan(): FixedViteStagingPlan;

export function assembleFixedViteStaging(): Promise<void>;
