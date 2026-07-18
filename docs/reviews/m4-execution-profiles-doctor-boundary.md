# M4 fixed doctor boundary independent review

## Review target and decision

- Target: the current uncommitted fixed doctor command/backend/parser working tree
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Fixed doctor static/unit gate: **BLOCKED**
- Existing M4 static/unit implementation gate: **APPROVED; unchanged**
- Doctor execution gate: **PENDING / BLOCKED; not executed**
- Runtime enforcement gate: **PENDING / BLOCKED; not executed**
- New blocking findings: B-08, B-09, B-10
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The reviewed implementation keeps the production Docker call surface narrow: it creates three nominally branded commands with the absolute `/usr/bin/docker` executable, and the production backend revalidates that runtime brand before spawning with fixed argv, `shell: false`, an environment containing only a disposable `DOCKER_CONFIG`, a timeout, and a combined output limit. The orchestrator still does not import or create that backend and returns `M4_EXECUTION_NOT_APPROVED` before Docker access.

The gate nevertheless remains blocked. The environment-key observation is not bound to the image identity observed by the preceding command, JSON output is parsed without enforcing the promised canonical byte representation, and the line-oriented environment projection cannot prove a one-to-one mapping between image environment entries and accepted keys. These gaps can combine an identity from one local image with a sanitized inventory from another or accept ambiguous backend bytes as an exact-input candidate.

This decision does not revoke the previously approved M4 static/unit profile-control boundary. It blocks only the newly added doctor boundary and every later step that depends on doctor inventory.

Remediation handoff update (2026-07-18): focused implementation and negative tests for B-08 through B-10 are present in the working tree. The third doctor observation now repeats sanitized image identity with a structured key-only array, all three outputs require exact canonical bytes, and the parser cross-validates the step 2/3 identities. This is implementation status, not an independent closure decision; this record's blocked gate remains unchanged until a fresh read-only re-review follows [`prompts/reviews/m4-execution-profiles-doctor-boundary-remediation-review.md`](../../prompts/reviews/m4-execution-profiles-doctor-boundary-remediation-review.md). Doctor execution remains unapproved and unexecuted.

Re-review update (2026-07-18): the subsequent [doctor remediation independent re-review](m4-execution-profiles-doctor-boundary-remediation.md) closed B-08 and B-10 for static/unit but left B-09 blocking because the default UTF-8 decoder consumes a leading BOM before the decoded-text canonical comparison. This record preserves its historical decision; the current next task is the narrow original-byte remediation in [`prompts/m4-execution-profiles-doctor-canonical-bytes-remediation.md`](../../prompts/m4-execution-profiles-doctor-canonical-bytes-remediation.md).

## Reviewed snapshot identity

The hashes below identify the reviewed working-tree bytes before this record, its remediation prompt, and status metadata were added. They establish byte identity only, not approval or runtime evidence.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `3b9724a8c9840308134a196e466f24cda7008e429596f3ce90a633ac1bcb594e` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |
| `docs/m4-execution-profiles.md` | `e0ed53c248e88a1826d98f8fbb89547f648ccea631b34fb6087b561c36d6a36e` |
| `docs/milestones.md` | `01646c05b20b20d7a52819933c57211b27ed815ea0b2f374ec31a95afdb06f3b` |
| `docs/architecture.md` | `05ca38e7668262c32fbe2aecb30dbf8525869e044b7c7b29bec43cdc1181f126` |
| `prompts/m4-execution-profiles-exact-input-contract.md` | `fcd9891f0305601a9632ac5ae4396739f378596e428cc78397720f38373cf930` |
| `prompts/m4-execution-profiles-doctor-boundary.md` | `54f335b84d61bda0922cc18dcbf180027c51ea9a1d5201f3f96d69454cc72db2` |
| `prompts/reviews/m4-execution-profiles-doctor-boundary-review.md` | `536ceee2350e0c4d5ec89c392696d02b93c9edbd3b1f8729d4c3d29290a23fd7` |

The aggregate manifest was produced by sorting the repository-relative file list, hashing each file, and hashing that sorted manifest.

## Source and test evidence that passed review

### Fixed command and host backend surface

- `createFixedDoctorPlan()` creates only `runtime-version`, `base-image-identity`, and `base-environment-keys`; every command is frozen, uses `/usr/bin/docker`, and is held in a private `WeakSet` brand. The production backend calls `assertFixedDoctorCommand()` before spawn. Evidence: `doctor.ts:158-203`, `doctor-host-backend.ts:69-96`.
- The three argv lists contain Docker `version` or local `image inspect` only. They do not contain pull, build, create, start, or run. A caller-constructed command with otherwise valid public fields is rejected. Evidence: `doctor.ts:172-195`, `doctor.test.ts:99-153`.
- The production backend passes no inherited host environment, uses an absolute executable, `shell: false`, ignored stdin, bounded stdout/stderr accounting, timeout, forced termination, and process-state checking before cleanup. Stderr content and raw child errors are discarded. Evidence: `doctor-host-backend.ts:55-165`.
- The Docker config is created under the fixed repository-owned M4 result hierarchy with a newly generated directory and an auth-empty `config.json`; cleanup targets only that generated directory. Evidence: `doctor-host-backend.ts:169-199`.
- Importing the module does not create the backend or start filesystem, process, network, Docker, or timer work. The orchestrator accepts only five operation names and fails closed before importing the host backend. Evidence: `index.ts`, `orchestrator.ts`, `import-safety.test.ts`, `orchestrator.test.ts`.

### Failure normalization

- UTF-8 failure, missing LF termination, command failure, timeout, combined output overflow, malformed backend result, identity/platform/version mismatch, and cleanup failure do not produce an accepted inventory in the reviewed tests. Evidence: `doctor.ts:223-375`, `doctor.test.ts:189-280`.
- An accepted object contains only fixed versions/tag/platform, validated SHA-256 identities, and sanitized environment key names. Raw environment values, stderr, error text, stack, host absolute paths, and runtime-socket details are absent from the inventory type and construction. Evidence: `doctor.ts:63-75`, `doctor.ts:377-407`.

## Blocking findings

### B-08 — Environment inventory is not bound to the observed image identity

The second and third doctor commands independently inspect the mutable tag `node:20.18.2-bookworm-slim`. The identity command returns image ID and repository digest, while the environment command returns only key lines. `executeFixedDoctor()` combines both results without requiring the third observation to repeat and match the ID/digest/platform from the second observation.

If the local tag is retargeted between the two inspect calls, the doctor can return an accepted inventory containing image identity from image A and environment keys from image B. The result therefore does not establish the exact immutable base-input snapshot required by the exact-input task.

Evidence: `doctor.ts:180-193`, `doctor.ts:312-375`, `doctor.ts:389-406`. Existing tests return matching data by convention and have no identity-drift case: `doctor.test.ts:155-187`.

Required remediation: keep the fixed three command IDs, but make the environment observation carry a sanitized repeat of the same local image ID, repository digest, OS, and architecture, or otherwise derive a runtime-branded third command from the already accepted immutable identity. Cross-validate the identities before accepting keys. Add a negative test where the second and third observations contain different valid image identities and require `inventory: null`.

### B-09 — Noncanonical JSON is accepted as exact doctor output

`lineText()` enforces UTF-8 and final LF, but both JSON parsers then call `JSON.parse()` and validate only the parsed key set and values. They do not compare the input bytes with one exact canonical serialization. Whitespace variants, alternate key order, and duplicate JSON member names can therefore be accepted even though the implementation contract explicitly requires noncanonical output to fail closed.

Evidence: `doctor.ts:276-310`, `doctor.ts:312-356`. The negative tests cover malformed objects, missing LF, and invalid UTF-8, but not valid noncanonical JSON bytes or duplicate members: `doctor.test.ts:234-269`.

Required remediation: define the exact canonical byte form for each structured doctor output, reserialize a validated plain snapshot, and compare the bytes before accepting it. Add negative tests for whitespace, key-order drift, duplicate keys, extra trailing data, and a canonical positive case.

### B-10 — Line-oriented environment projection has ambiguous entry framing

The environment format splits each raw `Config.Env` entry on `=` and prints the first component followed by LF. It emits a fixed marker only when `=` is absent. A raw entry whose key component contains an embedded LF can project as multiple individually valid key lines. The parser splits the aggregate output on LF and cannot prove that each accepted line came from exactly one valid environment entry. For example, one malformed entry can project the required `PATH` and `NODE_VERSION` lines and be accepted without exposing an `M4_INVALID_ENV_ENTRY` marker.

This does not intentionally retain raw values, but it fails the exact key-only inventory boundary and makes the accepted inventory ambiguous.

Evidence: `doctor.ts:31-35`, `doctor.ts:187-193`, `doctor.ts:359-374`. Existing tests check the fixed invalid marker, duplicate lines, canary keys, LF termination, and UTF-8, but not embedded delimiter/control characters at the projection boundary: `doctor.test.ts:234-250`.

Required remediation: emit a structured, escaped, key-only representation in which one image environment entry maps to exactly one array element; reject control characters and malformed entries before inventory acceptance. Bind that structured projection to B-08's repeated image identity and add newline/delimiter/raw-value negative tests without storing a raw value in fixtures or snapshots.

## Non-blocking findings and limitations

### N-01 — Top-level M3 status remains stale

`README.md` still says the M3 independent re-review is pending, while the M3 milestone and remediation review say it is approved with non-blocking follow-ups. This pre-existing documentation issue does not affect the doctor decision and remains a separate documentation-only task.

### N-02 — Cleanup failure is fail-closed but not retryable or secondary-visible

The production backend marks itself closed before `rm()` completes. If removal fails, a later cleanup call becomes a no-op. In addition, `executeFixedDoctor()` records `CLEANUP_FAILURE` only when no earlier command failure exists. An earlier failure therefore remains correctly inconclusive, but the retained disposable config directory and secondary cleanup failure are not represented in the result.

Evidence: `doctor-host-backend.ts:157-165`, `doctor.ts:414-418`. This does not permit an accepted inventory and the disposable config contains no credential, so it is non-blocking for the current gate. A future remediation may make cleanup retryable and preserve a sanitized secondary failure without weakening first-failure semantics.

The fixed Docker client/server `29.6.1`, local Node base identity, and base environment inventory remain candidates only. Their availability has not been observed. No version-controlled `profile.json`, accepted image-input file, built-image digest, runtime inspection, control evidence, or profile Observed result exists.

## Acceptance assessment

| Area | Review result |
|---|---|
| Three fixed command IDs and no arbitrary command/path/option | Passes source/test review. Runtime-branded production commands reject caller-constructed objects. |
| Fixed executable, argv, shell, cwd, environment, timeout, and combined output limit | Passes reviewed source boundary; production execution was not performed. |
| Disposable credential-free Docker config and bounded cleanup target | Passes the fail-closed source boundary, with N-02 remaining. |
| Exact Docker client/server version and image digest/platform validation | Structurally passes for each individual response. Runtime values are unobserved. |
| Same-image binding for base environment inventory | **Blocked by B-08.** |
| UTF-8, JSON exact-key, and canonical-byte validation | **Blocked by B-09.** |
| Raw-value-free, unambiguous environment-key projection | **Blocked by B-10.** |
| Malformed/oversized/timeout/nonzero/cleanup failure remains unaccepted | Passes reviewed tests for covered cases; B-09/B-10 identify uncovered valid-looking ambiguity. |
| Import-time safety and orchestrator fail-closed state | Passes source/test review. |
| Runtime availability/enforcement evidence | Not assessed, not executed, and not approved. |

## Verification observed

| Command | Observed result |
|---|---|
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 13 test files, 96 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 13 files / 96 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 80 test files / 427 tests passed. |
| `git diff --check` | Exit 0 before review-owned files were added. |
| `git status --short` | Confirmed that the target is an uncommitted working tree containing existing M3/M4 changes. |

After adding this review record, remediation prompt, and status metadata, `npm run m4:verify` and `npm run check` were repeated with the same passing file/test counts. `git diff --check` also remained successful.

The following commands were not run: `npm run m4:doctor`, `npm run m4:build`, `npm run m4:run:controls`, and `npm run m4:verify:evidence`. No Docker/container command, runtime-socket access, local image or host environment enumeration, external network access, credential access, host-home access, package install, host lifecycle experiment, remote Git operation, commit, or publication was performed.

## Review-owned changes and next task

Review-owned changes are limited to this record, M4 status metadata, documentation routing, and [`prompts/m4-execution-profiles-doctor-boundary-remediation.md`](../../prompts/m4-execution-profiles-doctor-boundary-remediation.md). Implementation source, Expected outcomes, ADR-0001, profile-control Observed, and experiment-matrix route Observed were not changed.

The fixed doctor static/unit gate remains blocked by B-08 through B-10. The next task is the narrow doctor binding/canonical-projection remediation defined by the follow-up prompt. A fresh independent read-only re-review is required before any request to run `m4:doctor`; build and control execution require later separate approvals.

The remediation implementation has now been handed off. The next gate is the separate independent re-review; this historical decision does not close B-08 through B-10 by itself.
