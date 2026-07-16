import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertExactDesignatedModuleId,
  exactIdFilter,
} from "../src/transform-target.js";

const designated = path.resolve("fixture/designated.ts");

describe("exact designated transform target", () => {
  it("accepts only the canonical designated source once selected", () => {
    expect(() =>
      assertExactDesignatedModuleId(designated, designated),
    ).not.toThrow();
    expect(exactIdFilter(designated).test(designated)).toBe(true);
  });

  it.each([
    path.resolve("fixture/entry.ts"),
    `${designated}?raw`,
    `${designated}#fragment`,
    "\0vite/internal",
    path.resolve("fixture/unexpected.ts"),
  ])("fails closed for non-designated identity %s", (candidate) => {
    expect(() =>
      assertExactDesignatedModuleId(candidate, designated),
    ).toThrowError("M2D_TRANSFORM_TARGET_INVALID");
    expect(exactIdFilter(designated).test(candidate)).toBe(false);
  });
});
