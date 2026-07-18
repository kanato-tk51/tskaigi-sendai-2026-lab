export interface FixedCodegenStagingEntry {
  readonly sourcePath: string;
  readonly targetPath: string;
}

export interface FixedCodegenStagingPlan {
  readonly stagingRoot: string;
  readonly entries: readonly FixedCodegenStagingEntry[];
}

export function createFixedCodegenStagingPlan(): FixedCodegenStagingPlan;

export function assembleFixedCodegenStaging(): Promise<void>;
