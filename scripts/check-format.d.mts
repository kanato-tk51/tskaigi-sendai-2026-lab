export interface CheckFormatOptions {
  cwd?: string;
  stdio?: "inherit" | "pipe";
}

export function listFormatInputs(options?: { cwd?: string }): string[];
export function checkFormat(options?: CheckFormatOptions): number;
