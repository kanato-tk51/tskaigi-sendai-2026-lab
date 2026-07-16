import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export type Sha256Digest = `sha256:${string}`;

export function hashBytes(value: Uint8Array): Sha256Digest {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export async function hashFile(filePath: string): Promise<{
  readonly hash: Sha256Digest;
  readonly sizeBytes: number;
}> {
  const bytes = await readFile(filePath);
  return Object.freeze({ hash: hashBytes(bytes), sizeBytes: bytes.byteLength });
}
