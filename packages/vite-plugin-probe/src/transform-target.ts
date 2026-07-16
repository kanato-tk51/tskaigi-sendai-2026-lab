import { AdapterError } from "./errors.js";

export function exactIdFilter(id: string): RegExp {
  return new RegExp(`^${id.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}$`, "u");
}

export function assertExactDesignatedModuleId(
  id: string,
  expectedId: string,
): void {
  if (
    id.includes("?") ||
    id.includes("#") ||
    id !== expectedId ||
    !id.endsWith("/fixture/designated.ts")
  ) {
    throw new AdapterError("M2D_TRANSFORM_TARGET_INVALID");
  }
}
