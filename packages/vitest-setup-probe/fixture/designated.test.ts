import { expect, test } from "vitest";

import { designatedValue } from "./source-target.js";

test("designated fixture completes after setup", () => {
  expect(designatedValue).toBe(42);
});
