# M4 execution-profile remediation independent re-review

## Review target and decision

- Target: the current uncommitted M4 static/unit remediation working tree
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Static/unit implementation gate: **BLOCKED**
- Runtime enforcement gate: **PENDING / BLOCKED; not executed**
- Original findings closed for the static/unit boundary: B-01, B-02, B-05, B-06
- Original findings not closed: B-03, B-04
- New blocking finding: B-07
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The remediation materially improves the original implementation, and all specified static/unit checks pass. The gate nevertheless remains blocked because the accepted staging bytes and approved base-environment inventory are not carried through one immutable production snapshot to the build and inspection state machine. The tests provide matching values by convention, but the public execution boundary permits them to diverge.

Input-binding remediation handoff update (2026-07-18): a focused implementation and negative tests for B-07 are present in the working tree. This is implementation status, not an independent closure decision; B-03, B-04, B-07, and the static/unit gate in this record remain blocked until a separate read-only re-review follows [`prompts/reviews/m4-execution-profiles-input-binding-remediation-review.md`](../../prompts/reviews/m4-execution-profiles-input-binding-remediation-review.md). Docker/runtime execution remains unapproved and unexecuted.

Closure update (2026-07-18): the subsequent [input-binding remediation independent re-review](m4-execution-profiles-input-binding-remediation.md) closed B-03, B-04, and B-07 for the static/unit boundary and approved the static/unit implementation gate. This record preserves its historical blocked decision; the runtime enforcement gate remains pending/blocked and unexecuted.

This decision does not approve Docker access, image build or pull, container execution, runtime enforcement, or Observed evidence. The orchestrator continues to return `M4_EXECUTION_NOT_APPROVED` before Docker access.

## Reviewed snapshot identity

The hashes below identify the reviewed working-tree bytes before this record, its follow-up prompt, and status metadata were added. They establish byte identity only, not approval.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `736d067074a96f56e1ec18dc46519a935c9d95e1d672f3d9c6c50069b08dc4ee` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |
| `docs/m4-execution-profiles.md` | `e6202257fa1be67eb0ab0b1f6422b805a7d49720c31a144b8d44461f08dc6b4c` |
| `docs/milestones.md` | `eb4dc761e819f360a8842827b0951d8ac37d3fa3c3514600333a8b2025ad28ff` |
| `docs/architecture.md` | `154b9386a9c1a8891d5b7dcb1319f39fb7677af586607466149e0038ce6c3156` |
| `prompts/m4-execution-profiles-remediation.md` | `e21efee92646ed04821fe597962871424ac345917fc3c93233c5c92a4a66bf96` |
| `prompts/reviews/m4-execution-profiles-remediation-review.md` | `755fb208b9d5eec532676edcbcb968b71a0f6d8a39c61010126a6928e793e71c` |

The aggregate manifest was produced by sorting the repository-relative file list, hashing each file, and hashing that sorted manifest.

## B-01 through B-06 closure assessment

| Finding | Decision | Closure evidence |
|---|---|---|
| B-01 — immutable control input and host-owned completion | **Closed for static/unit** | The manifest uses a separate read-only `/input` bind; host metadata is not mounted into the container; canonical manifest bytes, regular-file/symlink identity, before/after equality, and completion digests are validated. Mutation, identity, symlink, inventory, and missing-transfer tests become inconclusive. Evidence: `docker-plan.ts:291-296`, `execution.ts:189-210`, `execution.ts:293-307`, `completion.ts:151-188`, `execution.test.ts:276-291`. |
| B-02 — same-target scratch | **Closed for static/unit** | Both profiles attempt `/scratch/scratch-marker.txt`; scratch is separate from source and result, and only mount writability differs. The pair requires separate run roots and writable state. Evidence: `constants.ts:21`, `control-runner.mjs:14`, `docker-plan.ts:291-296`, `docker-plan.ts:336-353`, `execution.ts:309-316`. |
| B-03 — same image, staging bytes, and two-run identity | **Not closed** | Pair-level image digest, distinct run IDs, distinct roots, and staging-digest equality are present. However, the accepted byte copies are only reachable through `copyPreparedStagingFile()`, which has no production consumer. The build command reads `layout.stagingRoot`, while the executor verifies only the plan's digest metadata and never stages or re-hashes the bytes at that path. This is part of B-07. |
| B-04 — complete pre-start inspection | **Not closed** | The projection now includes device requests, runtime selection, namespaces, mounts, environment, capabilities, security options, logging, restart policy, and resource limits; focused drift tests cover every projected key. However, `FixedExecutionInput.baseEnvironmentKeys` is independent of the `ApprovedImageInput` used to create the branded build plan, so the accepted base-environment inventory can be replaced before inspection. This is part of B-07. |
| B-05 — canonical and semantic evidence | **Closed for static/unit** | Shared backing buffers are rejected before copying, public serializers first validate typed snapshots, and every control/outcome/reason combination is checked independently from Expected matching. Negative tests cover shared buffers, accessors, `toJSON`, noncanonical bytes, and impossible semantics. Evidence: `canonical.ts:10-26`, `canonical.ts:37-49`, `evidence.ts:47-118`, `canonical.test.ts:40-81`, `evidence.test.ts:68-95`. |
| B-06 — bounded execution and inconclusive validity | **Closed for the reviewed fake-backend boundary** | The fixed state machine supplies timeout/output limits, rejects timeout/output/command/inspection/transfer/evidence failures, preserves the first failure, always attempts per-container removal, discards completion/comparison on invalid runs, and continues the second profile without hiding the first failure. Focused tests cover timeout, output limit, cleanup, missing/invalid transfer, immutable-input drift, and first-failure precedence. Evidence: `execution.ts:106-145`, `execution.ts:231-375`, `execution.ts:400-462`, `execution.test.ts:237-304`. Runtime backend implementation and enforcement remain unapproved. |

## Blocking finding

### B-07 — Accepted image input is not bound to the bytes and environment inventory used by execution

`prepareStagingInput()` creates immutable private copies and an aggregate digest, and `createImageBuildPlan()` checks that digest against `ApprovedImageInput`. After that point, the production path retains only digest metadata and a command that reads a host `stagingRoot`. `copyPreparedStagingFile()` is used only by tests. `executeFixedProfilePair()` has no stage/verify step for the exact files at the build context, so matching digest fields do not prove that Docker would consume the accepted bytes.

The same boundary independently accepts `FixedExecutionInput.baseEnvironmentKeys`. `ImageBuildPlan` does not retain the approved inventory, and execution merely validates the independently supplied array before passing it to inspection. A caller can therefore pair a branded build plan with a different syntactically valid environment-key inventory. Existing tests pass `imageInput.baseEnvironmentKeys` by convention and do not exercise this divergence.

Evidence: `staging.ts:21-24`, `staging.ts:42-83`, `staging.ts:104-113`, `docker-plan.ts:144-194`, `execution.ts:71-79`, `execution.ts:377-397`, `execution.test.ts:193-232`.

Impact: B-03's exact staged-byte requirement and B-04's approved environment projection are not established at the production boundary. Advancing to exact profile/image input selection would rely on caller convention for security-relevant inputs.

Required remediation:

- create one branded accepted image/staging snapshot that retains the immutable staged byte copies, exact inventory/digest, and approved base-environment keys;
- derive the build plan, pair execution, and inspect allowlist from that snapshot instead of accepting parallel metadata;
- add a pre-build stage/verification boundary that proves the fixed build context has exactly the accepted files and bytes;
- add negative tests for staged-path byte/inventory drift and for base-environment inventory substitution;
- keep Docker execution disabled and Observed evidence unmeasured.

## Non-blocking finding

### N-01 — Top-level M3 status remains stale

`README.md` still says the M3 independent re-review gate is pending, while the M3 milestone and remediation review record say it is approved with non-blocking follow-ups. This pre-existing documentation issue does not change the M4 decision and remains a separate documentation-only task.

## Acceptance-criteria assessment

| Acceptance area | Re-review result |
|---|---|
| Exact-key profile/manifest/evidence validation | Passes the reviewed static/unit tests, including semantic and shared-buffer rejection. |
| Fixed orchestrator without user runtime input | The five-operation entry remains fail-closed before Docker. Runtime activation is not approved. |
| Disposable CLI config, offline build, exact staging input | Command construction is fixed and offline, but exact accepted bytes are not bound to the build-context path; blocked by B-07. |
| Full pre-start security projection | Projected Docker fields and drift tests are materially complete, but the base-environment inventory is not derived from the accepted image input; blocked by B-07. |
| Same image, control bytes, run identity, and writable state | Same image and distinct run state pass; control-byte use at the build context is not proven; blocked by B-07. |
| Seven ordered controls and sanitized evidence | Passes static/unit schema, fixture, canonicalization, and mismatch tests. Runtime outcomes remain unmeasured. |
| Incomplete paths are inconclusive | Passes the reviewed fake-backend tests; no runtime evidence was reviewed. |
| Expected/Observed separation | Passes document/diff review. Profile-control and route Observed remain unchanged and unmeasured. |

## Verification observed

| Command | Observed result |
|---|---|
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; explicitly reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 12 test files, 72 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 12 files, 72 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 79 test files / 403 tests passed. |
| `git diff --check` | Exit 0 after adding this review-owned record and status metadata. |
| `git status --short` | Confirmed the target is an uncommitted working tree containing existing M3/M4 changes. |

The following commands were not run: `npm run m4:doctor`, `npm run m4:build`, `npm run m4:run:controls`, and `npm run m4:verify:evidence`. Exact runtime input, static/unit approval, and explicit execution approval are absent. No Docker/container command, runtime-socket access, external network access, image pull, package install, credential access, host lifecycle experiment, remote Git operation, commit, or publication was performed.

After adding this review record, follow-up prompt, and status metadata, `npm run m4:verify` and `npm run check` were repeated with the same passing file/test counts, and `git diff --check` remained successful.

## Gate conclusion and next task

The static/unit implementation gate remains blocked by B-07, and the runtime enforcement gate remains pending/blocked and unexecuted. The next task is the narrow accepted-input binding remediation in `prompts/m4-execution-profiles-input-binding-remediation.md`. A fresh read-only re-review is required before exact profile/image input selection or any request for Docker execution approval.
