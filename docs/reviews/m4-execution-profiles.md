# M4 execution-profile static/unit implementation independent review

## Review target and decision

- Target: the current uncommitted M4 static/unit implementation working tree
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Static/unit implementation gate: **BLOCKED**
- Runtime enforcement gate: **PENDING / BLOCKED; not executed**
- Blocking findings: B-01 through B-06
- Non-blocking findings: N-01
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

Remediation handoff update (2026-07-18): implementation changes and focused tests for B-01 through B-06 are present in the working tree. This is an implementation status update, not an independent closure decision; every finding and the static/unit gate in this record remain blocked until a separate read-only re-review follows [`prompts/reviews/m4-execution-profiles-remediation-review.md`](../../prompts/reviews/m4-execution-profiles-remediation-review.md). The Docker/runtime gate remains unapproved and unexecuted.

The fail-closed orchestrator gate worked as documented: the implementation accepts only the five fixed operation names and returns `M4_EXECUTION_NOT_APPROVED` before Docker access. This review does not approve container execution. Passing static/unit checks establishes only the behavior covered by those checks and does not establish runtime enforcement.

## Reviewed snapshot identity

The review applies to the uncommitted working tree identified below, before this review record and its remediation prompt were added. Hashes identify bytes only; they are not approval evidence by themselves.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `6aeee96fb4721e13ef1359c99e4d439730ab3f12fb3c225802e314eb1459969d` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |
| `docs/m4-execution-profiles.md` | `c149acd3be263f3bd8894cd3e4f6df27289ac54d1c587ff9ed0c685602cc07ed` |
| `docs/milestones.md` | `3048400411450daa244afd23d54b89e1d1eb51ed9a7ea71a3edaa4ffc354bba6` |
| `prompts/m4-execution-profiles.md` | `b11d80b69860ab92e0640390c7808d84457301fc8682455b6d56d708ce12c1c3` |
| `prompts/reviews/m4-execution-profiles-review.md` | `1977265c7ea34fc4c079ea66c7ead3c8fe953f7e720e7584fe58d02c442f258e` |

## Blocking findings

### B-01 — Immutable control input is inside the writable result channel

`createProfileDockerPlan()` exposes one read-write bind at the result destination, while the fixed manifest path is inside that same destination. The fixture reads `control-manifest.json` from that writable directory, and completion validates only a filename inventory. There is no read-only input mount, immutable byte snapshot, before/after identity check, or digest binding that proves the manifest remained unchanged while the container ran.

This also leaves future host-inspection/completion material in the same container-writable tree unless the absent executor establishes a separate post-run channel. The current plan therefore does not satisfy the immutable-control-input requirement or the independence between host inspection and in-container evidence.

Evidence: `containers/profile-control/src/docker-plan.ts:22`, `containers/profile-control/src/docker-plan.ts:226`, `containers/profile-control/fixture/control-runner.mjs:11`, `containers/profile-control/src/completion.ts:32`.

Required remediation: provide a fixed read-only immutable input boundary, keep host-authored inspection/completion outside container write authority, bind the accepted bytes/digests into completion, and add mutation/replace/symlink/identity negative tests.

### B-02 — Scratch exposure is confounded with the result channel and a different target

The permissive scratch attempt writes into the writable result directory, while the constrained attempt writes to a different path under the read-only image root. A permissive success therefore proves the already-required result channel is writable; the constrained failure proves a different target is read-only. It does not compare the same logical scratch capability under the two reviewed runtime policies.

Evidence: `containers/profile-control/fixture/control-runner.mjs:14`, `containers/profile-control/fixture/control-runner.mjs:15`, `containers/profile-control/fixture/control-runner.mjs:273`, `profiles/permissive/README.md:3`.

Required remediation: use one fixed logical scratch target, distinct from source and result/evidence, and make only its reviewed runtime exposure differ. Pre-start inspection and tests must verify that exact boundary for both profiles.

### B-03 — Same-image, staging-byte, and two-run invariants are not enforced

`ApprovedImageInput.stagingDigest` is validated but never consumed by the build plan or another staging-byte verifier. Profile and Docker-plan creation accept each profile independently, so no production boundary requires the two profiles to use the same image digest, fixture/control bytes, limits, or control order. The command-plan test supplies the same synthetic digest by convention and uses the same run ID for both profiles; it does not test the required distinct run identities and writable state.

Evidence: `containers/profile-control/src/image-input.ts:64`, `containers/profile-control/src/docker-plan.ts:96`, `containers/profile-control/src/docker-plan.ts:171`, `containers/profile-control/test/docker-plan.test.ts:14`.

Required remediation: validate a pair-level immutable input, verify the exact staged-file inventory/digest, derive both profiles from that one accepted built-image identity, require distinct run IDs and destinations, and reject drift in negative tests.

### B-04 — The claimed full pre-start inspection omits security-relevant Docker fields

The inspection projection validates the fields it selects, but the fixed projection does not include security-relevant fields such as device requests and the selected container runtime. Checking `HostConfig.Devices` alone does not reject a non-empty device-request configuration. Consequently the validator can label an inspection complete without having examined all fields needed for the no-device/fixed-runtime boundary.

Evidence: `containers/profile-control/src/docker-plan.ts:24`, `containers/profile-control/src/inspect.ts:30`, `containers/profile-control/src/inspect.ts:148`.

Required remediation: define and validate a complete reviewed projection for all security-relevant create state, including alternate device exposure and runtime selection, and add drift tests for every projected field. Runtime-specific representation must remain unapproved until observed in the separately authorized environment.

### B-05 — Canonical and semantic evidence validation is incomplete

The canonical-byte guard checks whether the `Uint8Array` view itself is a `SharedArrayBuffer`; that condition cannot identify a view backed by shared memory. The decoder then reads the shared buffer without making an immutable copy. In addition, observation validation accepts any reason from the global reason union for any control/outcome pair. Nonsensical evidence such as an environment success with a write-denied reason is accepted as a complete run and downgraded to an Expected mismatch instead of being rejected as malformed evidence.

The exported `serializeCanonical(unknown)` also invokes generic JSON serialization without first establishing a validated plain-data snapshot, so accessors, proxies, or `toJSON` remain callable at that public boundary.

Evidence: `containers/profile-control/src/canonical.ts:10`, `containers/profile-control/src/canonical.ts:41`, `containers/profile-control/src/evidence.ts:47`.

Required remediation: reject shared backing buffers or copy bytes before validation, serialize only schema-validated canonical snapshots, enforce control/outcome/reason semantic combinations independently from Expected matching, and add negative tests.

### B-06 — Bounded execution, transfer, and inconclusive run validity are not implemented

The current orchestrator intentionally stops before Docker access. That is a safe execution gate, but it also means there is no approved-host executor that applies `controlTimeoutMs` and `outputBytes`, stages and verifies input, captures and sanitizes process output, transfers evidence, preserves the first failure, or records missing/invalid/timeout/transfer failure as inconclusive. `ControlCompletion` accepts only an already-complete object, and `EvidenceComparison.complete` is always true; these types do not yet model the required incomplete path.

Evidence: `containers/profile-control/src/orchestrator.ts:25`, `containers/profile-control/src/completion.ts:50`, `containers/profile-control/src/evidence.ts:170`.

Required remediation: implement the fixed executor behind a still-disabled approval gate, add bounded process/transfer/cleanup state and explicit inconclusive results, and test all failure paths without calling Docker. Enabling the executor or running Docker remains a separate explicit approval step.

## Non-blocking finding

### N-01 — Top-level M3 status remains stale

The top-level README still says the M3 independent re-review is pending, while the M3 milestone and remediation re-review record say it is approved with non-blocking follow-ups. This does not change the M4 findings, but should be corrected in a separate documentation-only task.

## Acceptance-criteria assessment

| Acceptance area | Review result |
|---|---|
| Exact-key profile/manifest/evidence input rejection | Partial; structural rejection is tested, but evidence semantics and shared canonical bytes are blocked by B-05. |
| Fixed orchestrator without user runtime input | Partial; argument rejection and the fail-closed gate pass, but the fixed executor is absent (B-06). |
| Disposable Docker CLI config, offline build, no pull | Static plan only; no directory ownership/staging/execution evidence exists. B-03 and B-06 remain. |
| Full pre-start image/command/user/root/network/mount/env/capability/security/resource inspection | Blocked by B-04. |
| No host home, credential, agent, runtime socket, device, host PID/network exposure | Planned fields pass unit tests, but alternate device/runtime state is not fully inspected and runtime is unmeasured (B-04). |
| Same image/control digest; distinct run ID and writable state | Blocked by B-03. |
| Seven ordered controls with bounded sanitized evidence | Partial; ordering and raw-output omission are implemented, but immutable input, scratch separation, and semantic validation are blocked by B-01, B-02, and B-05. |
| Constrained scratch/child are attempted failures, not skips | Child and write calls are present in fixture code; scratch is not a valid same-target comparison (B-02), and neither outcome is runtime evidence. |
| Permissive source write and external network remain denied | Static command/fixture intent is present; runtime enforcement is unmeasured. |
| Host inspection plus container evidence; incomplete paths are inconclusive | Blocked by B-01 and B-06. |
| Expected mismatch is retained | Passes focused unit coverage. |
| Control evidence is not promoted to route/matrix/presentation evidence | Passes documentation/diff review; matrix Observed was unchanged. |
| Static/unit/integration/root checks and independent runtime review | Static/unit/root checks pass; approved-host integration and runtime review were not run, so the overall criterion is not met. |

## Verification observed

The review ran the commands below against the reviewed snapshot before adding this record.

| Command | Observed result |
|---|---|
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported static contract verification and no runtime enforcement claim. |
| `npm run m4:test` | Exit 0; 10 test files, 27 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 10 files, 27 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 77 test files / 358 tests passed. |
| `git diff --check` | Exit 0 before the review record was added. |
| `git status --short` | Confirmed the review target was an uncommitted working tree with existing M3/M4 changes. |

The following commands were **not run**: `npm run m4:doctor`, `npm run m4:build`, `npm run m4:run:controls`, and `npm run m4:verify:evidence`. The fixed runtime input, executor review, and explicit execution approval do not exist. No Docker/container command, runtime-socket access, external network access, image pull, package install, credential access, host lifecycle experiment, remote Git operation, commit, or publication was performed.

After adding this review record, remediation prompt, and status metadata, `npm run m4:verify` and `npm run check` were repeated with the same passing file/test counts, and `git diff --check` remained successful.

## Gate conclusion and next task

The original static/unit implementation is not approved for runtime activation. The remediation implementation has been handed off, so the next task is a fresh independent read-only re-review under `prompts/reviews/m4-execution-profiles-remediation-review.md`. Only after that review passes may a separate task propose exact version-controlled profile/image input and request explicit Docker execution approval. Runtime enforcement, profile-control Observed, adapter/profile route evidence, and presentation evidence remain unmeasured.
