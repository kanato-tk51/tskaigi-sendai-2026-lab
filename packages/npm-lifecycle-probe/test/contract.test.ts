import { describe, expect, it } from "vitest";

import {
  ATTEMPT_IDS,
  EXPECTED_CAPABILITY_COUNT,
  EXPECTED_EVENT_COUNT,
  EXPECTED_EVENT_ORDER,
  EXPECTED_PRODUCER_COUNT,
  EXPECTED_ROUTE_COUNT,
  EXPECTED_TOOL_API_CHANGE_COUNT,
  NPM_VERSION,
  PHASE,
  ROUTE_ID,
} from "../src/constants.js";
import {
  createLifecycleManifest,
  validateLifecycleManifest,
} from "../src/manifest.js";

describe("M2-A npm lifecycle contract", () => {
  it("pins one automatic lifecycle route and six capabilities", () => {
    const manifest = createLifecycleManifest(
      "m2a-npm-lifecycle-00000000000000000000000000000000",
    );
    validateLifecycleManifest(manifest);
    expect({
      route: EXPECTED_ROUTE_COUNT,
      capabilities: EXPECTED_CAPABILITY_COUNT,
      toolApi: EXPECTED_TOOL_API_CHANGE_COUNT,
      total: EXPECTED_EVENT_COUNT,
      producers: EXPECTED_PRODUCER_COUNT,
    }).toEqual({
      route: 1,
      capabilities: 6,
      toolApi: 0,
      total: 7,
      producers: 1,
    });
    expect(manifest.toolVersion).toBe(NPM_VERSION);
    expect(manifest.phases).toEqual([PHASE]);
    expect(manifest.triggerTypes).toEqual(["automatic"]);
    expect(manifest.routeInvocations).toEqual([
      expect.objectContaining({
        routeInvocationId: ROUTE_ID,
        triggerType: "automatic",
        invocationKind: "lifecycle-hook",
      }),
    ]);
    expect(manifest.attempts.map((attempt) => attempt.attemptId)).toEqual(
      Object.values(ATTEMPT_IDS),
    );
    expect(EXPECTED_EVENT_ORDER).toHaveLength(7);
  });

  it("has no official tool API change definition", () => {
    const manifest = createLifecycleManifest(
      "m2a-npm-lifecycle-00000000000000000000000000000000",
    );
    expect(manifest.toolApiTargets).toEqual([]);
    expect(manifest.toolApiChanges).toEqual([]);
  });
});
