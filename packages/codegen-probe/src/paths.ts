import path from "node:path";
import { fileURLToPath } from "node:url";

export const FIXED_PACKAGE_ROOT = path.resolve(
  fileURLToPath(new URL("../", import.meta.url)),
);
export const FIXED_REPOSITORY_ROOT = path.resolve(FIXED_PACKAGE_ROOT, "../..");
