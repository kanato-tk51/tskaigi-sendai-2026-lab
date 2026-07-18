# M4 one-time offline-build execution gate independent review

## Review target and decision

- Target: the current uncommitted one-time offline-build execution gate
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Reviewed source/staging snapshot identity: **REPRODUCED**
- Temporary activation and ordinary restoration boundary: **ACCEPTABLE**
- Exact one-time offline-build execution gate: **APPROVED**
- Blocking findings: none
- Offline build and built-image digest: not executed or observed by this review
- Built-image/profile binding and runtime enforcement gates: **PENDING / BLOCKED; not executed**
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The gate binds one temporary activation to the independently reproduced source
snapshot, fixed run ID `m4-offline-build-20260718-01`, repository-owned run
layout, fixed staged image tag, accepted base/staging snapshot, branded image
build plan, production host backend, and build-only executor. The only runtime
command authorized by this decision is the exact package command recorded in
the execution prompt, and its production backend can issue only the ordered
runtime-version, offline-build, and built-image-ID-inspect commands.

The gate is approved for a fresh `continue-repository-work` worker to use the
skill's standing authorization for that exact one-time action. This decision is
an independent worker review, not a separate human review. This review did not
use standing authorization to cross the execution gate, did not apply the
temporary activation, and did not access Docker.

## Reviewed gate snapshot identity

The hashes below identify the reviewed bytes before this review record and its
status metadata were added. They establish byte identity and the approved
execution boundary; they do not establish runtime availability, build success,
or a built-image digest.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `231cda862163c050b31f4b15b962c24555d0e67fb5c0b30b40e0a60f43ac399a` |
| `containers/profile-control/image-input.json` | `27700a64c4bf4211f21ea5efa534601232f5fa7aea6ef70f306fbb5ba61da7e9` |
| `containers/profile-control/src/constants.ts` | `6c4f2e6177cc44fa6e0f9dd47f11709537d85adc88f87b2c0e40abac949fb93e` |
| `containers/profile-control/src/image-input.ts` | `3d62d6842d7b0aafde8cc42a647c31235860411a9c77acaaae8e60b4de7fe16c` |
| `containers/profile-control/src/staging.ts` | `795fd1a75981439f3f70956bd383fa8cf85a3703634dc6eef58cfd698343c9e5` |
| `containers/profile-control/src/docker-plan.ts` | `5bc051512ba9f0a60f709b4b633a2eb105ec2c1c166cfb73301706158ef314a1` |
| `containers/profile-control/src/offline-build.ts` | `490ba07e2f10e40d6fbf731e538948e2d21482df6853065536c1a2680428096f` |
| `containers/profile-control/src/offline-build-process.ts` | `e32177d3c8f1f6be31f37572aeaf8abf12da961527cb1a830dd2121d1c08639c` |
| `containers/profile-control/src/offline-build-host-backend.ts` | `e4aee00302148ccc75b7b7a2b642bb90f1a1dc01db9f6a3628f7c57281ccf7a2` |
| ordinary `containers/profile-control/src/orchestrator.ts` | `fefc2af9c7f69428383eba03d8bb49b0caa51a5332043e8741db39352fb1faf6` |
| ordinary `containers/profile-control/src/orchestrator-entry.ts` | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| `containers/profile-control/src/index.ts` | `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |
| `prompts/m4-execution-profiles-offline-build-execution.md` | `0ec59d26fdcbbd9fac8772b3cc2a081f380f35e825a879eb240edf942fa8f9b4` |
| `prompts/reviews/m4-execution-profiles-offline-build-execution-gate-review.md` | `a6ab6aae2fde62670830f486f297e166a868ca04f1ad3095ceb9ccd59aa38c99` |

The aggregate manifest was produced by sorting repository-relative file names,
hashing every file, and hashing the sorted manifest. The fixed run root did not
exist during this review.

## Independent staging and activation assessment

The four fixed repository staging files independently reproduced the accepted
inventory:

| Order | Logical path | Bytes | SHA-256 |
|---:|---|---:|---|
| 0 | `Containerfile` | 347 | `sha256:9547126c36478783d0312d007cce35aa2de36b9c0994cfc4d19c0ff9336275fc` |
| 1 | `fixture/canary.txt` | 29 | `sha256:6bbdf1baeca26db45068ed461044e6c0941d3b644c1d5d7444a848eb930a3fc4` |
| 2 | `fixture/control-runner.mjs` | 9,159 | `sha256:f914a28fc827592c370ed855717bb55ba856733e8c423ea39baf4bc2254dcf8e` |
| 3 | `fixture/fixed-child.mjs` | 152 | `sha256:3f2fc1c0fb6cd0166d2afab93c0b8f2e4ab50ed404f385d2317d7b9756960191` |

The documented NUL/LF inventory encoding is 388 bytes and hashes to
`sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03`.
The exact temporary activation block extracted from the execution prompt is
2,993 bytes and hashes to
`34ad3097655ab71ed3673ba1a18e568978a393cc35f8bba3d544ae6965b62622`.
The ordinary entry and existing ordinary compiled entry independently match
the required restoration hashes
`73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f`
and `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4`.

The activation accepts only the exact `build` operation, reads only the fixed
versioned input and four repository staging files, creates one branded
permissive build layout from the fixed run ID, and supplies the same snapshot,
layout, and plan identities to the production backend and build-only executor.
Any pre-executor exception becomes the fixed canonical zero-step
`STAGING_FAILURE` result; raw exceptions, stderr, host paths, environment
values, and credentials are not serialized.

## Exact command, side-effect, and cleanup assessment

The approved activation command is exactly:

```sh
npm run --silent m4:build
```

After compilation, the production backend can spawn only `/usr/bin/docker`
with `shell: false`, the fixed repository cwd, and a run-owned
credential-empty `DOCKER_CONFIG`; it does not inherit the host environment.
The ordered plan is limited to exact client/server `29.6.1` version validation,
an offline build using the digest-pinned local base with `--network none` and
`--pull=false`, and canonical inspection of the fixed staged tag
`tskaigi-m4-profile-control:staged-m4-offline-build-20260718-01`.

The backend privately stages and re-reads only the four accepted files before
the first command. Output, timeout, process-close, first-failure, and canonical
result validation remain bounded and fail closed. The repository code does not
open a runtime socket, and no socket is mounted or forwarded into an experiment
container. The fixed host CLI may use the runtime indirectly only during the
approved execution.

Success intentionally leaves the fixed staged tag for a later profile-binding
gate. Inspect failure can also leave that tag. Cleanup removes only identity-
checked run-owned staging/config state; unsafe or failed cleanup retains owned
state and an inconclusive result rather than broadening deletion. The gate adds
no image-removal, pull, login, create, start, run, or control command.

## One-time and restoration assessment

The execution prompt requires the fixed run root to be absent before
activation, the exact command to be invoked once, and no retry even when the
result is inconclusive. After any attempt, the execution worker must record the
canonical result and remaining fixed-tag/run-state limitation in this review
record before another task can be selected. Standing authorization applies to
that exact attempt only and does not authorize a second attempt, alternate run
ID, or alternate tag.

This is a repository-recorded procedural one-time boundary, not a crash-
recovery or concurrent-runtime lease. The runtime tag is not pre-inspected by
this review because that would itself require an additional Docker command; the
repository history records that no prior offline build used this gate. These
limitations do not add another runtime operation to the approved fixed plan.

Regardless of command exit or result validity, the execution task requires
immediate exact restoration of the ordinary source, recompilation to the fixed
ordinary output hash, and post-restoration `m4:verify` plus root `check` before
profile binding or any other runtime task. Restoration failure cannot authorize
additional Docker access.

## Verification observed

| Command | Observed result |
|---|---|
| Independent sorted manifest, critical `sha256sum`, staging `wc -c`, NUL/LF aggregate, and activation-block calculation | Exit 0; reproduced every required source/toolchain hash, all four staging sizes/hashes, the 388-byte staging aggregate, and the 2,993-byte activation hash. |
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 17 test files, 176 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 17 files / 176 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 84 test files / 507 tests passed. |
| `git diff --check` | Exit 0 before this review record and status metadata were added. |
| `git status --short` | Confirmed the target is the existing uncommitted M3/M4 working tree; unrelated work was preserved. |

After adding this review record and status metadata, `npm run m4:verify` was
repeated and exited 0 with 17 files / 176 tests. `npm run check` was repeated
and exited 0 with 84 files / 507 tests, and `git diff --check` remained
successful.

The review did not run `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:run:controls`, or `npm run m4:verify:evidence`. It did not apply the
temporary activation, access Docker or a runtime socket, inspect/pull/build an
image, create/start/run a container, use external network or credentials,
enumerate a host environment, access host-home contents, run a lifecycle
experiment, use remote Git, commit, publish, or communicate externally. The
only non-repository read was the environment-provided skill instruction required
by this invocation.

## Gate conclusion and next task

The reviewed one-time offline-build execution gate is approved with no blocking
finding. The next task is a fresh worker execution under
[`prompts/m4-execution-profiles-offline-build-execution.md`](../../prompts/m4-execution-profiles-offline-build-execution.md):
revalidate this exact approved snapshot and absent fixed run root, apply the
reviewed activation, invoke `npm run --silent m4:build` exactly once using
standing authorization, restore the ordinary source/compiled output, and record
the canonical sanitized result here. That standing authorization is not a
separate human review.

Built-image/profile binding, `profile.json`, controls, runtime enforcement,
profile-control Observed, and experiment-matrix route Observed remain separate
later gates.

## One-time execution follow-up

On 2026-07-18, a fresh `continue-repository-work` worker revalidated the
approved manifest and every critical source/toolchain hash, reproduced the four
staging-file sizes and SHA-256 values plus the 388-byte aggregate, confirmed
that the fixed run root was absent, and ran pre-activation `npm run m4:verify`
successfully with 17 test files / 176 tests. The worker then applied the exact
2,993-byte activation source, reproduced its required SHA-256, and passed
`npm run m4:typecheck`.

The worker used standing authorization for exactly one invocation of
`npm run --silent m4:build`; this was not a separate human review. The command
exited 1 with this canonical sanitized result:

```json
{"schemaVersion":"lab-profile-offline-build-result/v1","validity":"inconclusive","primaryFailure":"CLEANUP_FAILURE","completedSteps":["stage-build-context","doctor","build","inspect-image"],"baseImageDigest":"sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0","stagingDigest":"sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03","dockerClientVersion":"29.6.1","dockerServerVersion":"29.6.1","builtImageDigest":null}
```

All four ordered steps completed, but cleanup failed after the Docker CLI added
run-owned state below the credential-empty configuration directory. The fixed
plan contains no image-removal command, so the inspected staged tag
`tskaigi-m4-profile-control:staged-m4-offline-build-20260718-01` was left for a
later recovery gate; no post-run Docker command re-inspected it. The fixed run
root remains. Its `staging` directory and `docker-config/config.json` are absent,
while `docker-config` retains runtime-created buildx/token-seed state. No retry,
alternate run ID, forced cleanup, or additional Docker command was used.

The ordinary entry source and compiled output were immediately restored to
SHA-256 `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f`
and `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4`.
Post-restoration `npm run m4:verify` passed with 17 files / 176 tests, and root
`npm run check` passed with 84 files / 507 tests. The result does not establish
a built-image digest, profile binding, controls, runtime enforcement,
profile-control Observed, or route Observed.

The next task is to define a non-executing post-cleanup-failure recovery
contract and independent review prompt. It must bind only the existing fixed
tag and retained fixed run root, specify at most one exact digest inspection and
identity-checked treatment of the run-owned state, and must not run Docker,
delete state, retry the build, bind profiles, or run controls while defining
that gate.

## Recovery contract handoff

On 2026-07-18, a fresh worker created the
[non-executing recovery implementation contract](../../prompts/m4-execution-profiles-offline-build-recovery.md)
and its
[independent review prompt](../../prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md).
They bind the next implementation to the exact recorded cleanup failure, fixed
run ID/tag, and retained exact tree. The proposed backend can issue at most one
local canonical image-ID inspect. It must not read retained runtime-created file
contents; it privately captures and revalidates path identities and retains all
owned state on every outcome. This contract task did not access Docker, delete
or modify the retained state, retry the build, bind profiles, or run controls.

The next task is the non-executing static/unit implementation of that
recovery-only executor, canonical result, retained-state validator, and
production host backend. A fresh independent review and separately recorded
one-time recovery execution gate remain required before any Docker access.
