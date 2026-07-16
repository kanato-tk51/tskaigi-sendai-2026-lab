import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import type { Sha256Digest } from "@tskaigi-lab/probe-core";

export function hashBytes(value: string | Uint8Array): Sha256Digest {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export async function hashFile(filePath: string): Promise<{
  readonly hash: Sha256Digest;
  readonly sizeBytes: number;
}> {
  const bytes = await readFile(filePath);
  return Object.freeze({ hash: hashBytes(bytes), sizeBytes: bytes.byteLength });
}
