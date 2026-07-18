# M4 production offline-build backend independent review

## Review target and decision

- Target: the current uncommitted production offline-build backend working tree
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Accepted base/staging/fixed-plan identity: **UNCHANGED / REPRODUCED**
- Build-only filesystem and activation boundary: **ACCEPTABLE for static/unit**
- Production offline-build backend static/unit gate: **BLOCKED**
- Blocking findings: B-13, B-14, B-15
- Exact-input production adoption and backend activation: **PENDING / BLOCKED; not executed**
- Offline image build and built-image/profile binding: **PENDING / BLOCKED; not executed**
- Runtime enforcement gate: **PENDING / BLOCKED; not executed**
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The implementation adds a build-only executor and a production filesystem/process
backend without making either reachable from the ordinary orchestrator or package
root. The accepted snapshot, branded runtime layout, and fixed doctor/build/image
inspect plan retain identity binding. Private staging, exact repository-byte
read-back, a credential-empty Docker config, fixed command identity, bounded output
and close handling, and owned-path cleanup are present.

The gate is nevertheless blocked. The built-image boundary accepts the repository's
known synthetic image placeholder as a complete observed digest. The canonical
result validator accepts impossible primary-failure/completed-step combinations.
The production process backend records timeout and output overflow as independent
booleans, so output arriving after timeout can replace the actual first failure.
Those gaps contradict the fixed no-placeholder, canonical-result, and first-failure
contract and must be remediated before an execution gate is written.

This is a fresh independent read-only review. It did not modify the reviewed
implementation or accepted input, access Docker, activate the production backend,
build or inspect an image, create `profile.json`, run controls, or establish runtime
evidence. It is not a separate human review.

## Reviewed snapshot identity

The hashes below identify the reviewed bytes before this review record, remediation
prompt, and status metadata were added. They establish byte identity only; they do
not establish runtime availability or enforcement.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `cf799cd134988359bbc9c4b0ddde0410cfcaa02a2874a52569e37199c64cb22f` |
| `containers/profile-control/src/docker-plan.ts` | `5bc051512ba9f0a60f709b4b633a2eb105ec2c1c166cfb73301706158ef314a1` |
| `containers/profile-control/src/staging.ts` | `795fd1a75981439f3f70956bd383fa8cf85a3703634dc6eef58cfd698343c9e5` |
| `containers/profile-control/src/offline-build.ts` | `40b81e4f633a7837b45689bebc5377b997efccfb24d0b9d1d4c66cc33b0f0758` |
| `containers/profile-control/src/offline-build-host-backend.ts` | `31f96a1f0dce67384657100c1eb06420821b1f6ed0a97ce27c94e2176355584d` |
| `containers/profile-control/src/orchestrator.ts` | `fefc2af9c7f69428383eba03d8bb49b0caa51a5332043e8741db39352fb1faf6` |
| `containers/profile-control/src/orchestrator-entry.ts` | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| `containers/profile-control/src/index.ts` | `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4` |
| `containers/profile-control/test/offline-build.test.ts` | `21f134fb885f937416292fbf899b6fbbc786da10cb9d1357eae095555508ace8` |
| `containers/profile-control/test/offline-build-host-backend.test.ts` | `f454d147d6d9b5577e106ea3e4b4e56b6e78c8732150ca4cd268917cf48cb9d5` |
| `containers/profile-control/scripts/verify-static.mjs` | `40d852af86f0e7adfaee37a408a1c3428cc618dcfeced086aaa486118755200c` |
| `containers/profile-control/image-input.json` | `27700a64c4bf4211f21ea5efa534601232f5fa7aea6ef70f306fbb5ba61da7e9` |
| `prompts/m4-execution-profiles-offline-build-backend.md` | `077f577853c3ad307d57a54eb3a6a774c214dd9052e07fc25f7aa3feaa6b67fb` |
| `prompts/reviews/m4-execution-profiles-offline-build-backend-review.md` | `c305a9be4367c5543c81c659402dc897f3bc97ecd67ef049842c56b234d4fe1d` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |

The aggregate manifest was produced by sorting repository-relative file names,
hashing each file, and hashing the sorted manifest.

## Accepted input and fixed plan invariance

The versioned input still contains Docker client/server `29.6.1`, base digest
`sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`,
Node.js `v20.18.2`, `linux` / `amd64`, and the ordered key-only base environment
inventory `PATH`, `NODE_VERSION`, `YARN_VERSION`. It contains no environment
values, host environment, credential, host path, stderr, raw error, or canary value.

The four fixed staging files independently reproduce the accepted inventory:

| Order | Logical path | Bytes | SHA-256 |
|---:|---|---:|---|
| 0 | `Containerfile` | 347 | `sha256:9547126c36478783d0312d007cce35aa2de36b9c0994cfc4d19c0ff9336275fc` |
| 1 | `fixture/canary.txt` | 29 | `sha256:6bbdf1baeca26db45068ed461044e6c0941d3b644c1d5d7444a848eb930a3fc4` |
| 2 | `fixture/control-runner.mjs` | 9,159 | `sha256:f914a28fc827592c370ed855717bb55ba856733e8c423ea39baf4bc2254dcf8e` |
| 3 | `fixture/fixed-child.mjs` | 152 | `sha256:3f2fc1c0fb6cd0166d2afab93c0b8f2e4ab50ed404f385d2317d7b9756960191` |

The 388-byte ordered aggregate input hashes to
`sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03`.
The build plan remains exactly `doctor`, offline `build`, and `inspect-image`, bound
to the same snapshot/layout identities and fixed `/usr/bin/docker` command objects.

## Positive boundary assessment

### Build-only state and activation boundary

`executeFixedOfflineBuild()` has only `stage-build-context`, `doctor`, `build`, and
`inspect-image`. It does not request a profile pair or continue to create, start,
transfer, or remove controls. Snapshot, plan, and layout substitutions fail before
backend access. Runtime version and image-ID payloads require fatal UTF-8, one final
LF, canonical original bytes, and fixed shapes.

The ordinary orchestrator still accepts only five fixed operation names and returns
`M4_EXECUTION_NOT_APPROVED` without importing or constructing either offline-build
module. The package root exports neither executor nor production backend. Module
imports have no filesystem, process, timer, or Docker side effect.

### Filesystem, command, and cleanup boundary

The host factory resolves the repository root from `import.meta.url`, revalidates
the accepted snapshot, branded layout, and plan, and independently checks the four
repository staging files. Run-owned staging and Docker-config directories are
private and exclusive. Staged files are exclusive regular files with identity,
link-count, permissions, exact inventory, read-back bytes, per-file digest, and
aggregate digest checks before commands can run.

Each command must be the next exact plan object. Spawn is fixed to
`/usr/bin/docker`, the repository cwd, only the credential-empty `DOCKER_CONFIG`
environment, ignored stdin, piped bounded output, and `shell: false`. Raw stderr and
build output are counted but not retained. Cleanup rechecks active-child and owned
path identity and removes only run-owned staging/config state. The built image is
not removed because it is intended for a later binding gate.

These positive properties do not close the result and process-order blockers below.

## Blocking findings

### B-13 — Known synthetic image digest can become a complete build result

The implementation excludes the accepted base digest and the M0 Node.js 24 digest,
but it does not exclude the repository's established synthetic profile image digest
`sha256:1111111111111111111111111111111111111111111111111111111111111111`.
Both `parseBuiltImageDigest()` and `validateOfflineBuildResult()` accept it. The
focused substitution table tests zero, uppercase, base, and M0 values, but not the
known synthetic placeholder.

Evidence: `offline-build.ts:252-276`, `offline-build.ts:488-500`,
`offline-build.test.ts:266-300`, and `test/helpers.ts:30-31`.

Impact: a canonical placeholder can be reported as the observed output of a complete
offline build and later mistaken for profile-binding input, contrary to the explicit
no-synthetic-digest contract.

Required remediation: reject the exact known synthetic profile digest in both the
inspect parser and canonical result validator and add focused parser/validator/
canonical-byte tests. Do not invent a built digest, change the accepted input, or
generalize the rule into rejecting arbitrary valid future image IDs.

### B-14 — Canonical result validation accepts impossible failure/step combinations

`validateCompletedSteps()` verifies only that the list is a prefix. The final result
checks require full steps for `complete` and a non-null failure for `inconclusive`,
but never bind a failure code to the prefix at which it can occur. For example, an
`inconclusive` `STAGING_FAILURE` with doctor/build marked complete, an
`INSPECTION_FAILURE` before build, or a `CLEANUP_FAILURE` before all command steps is
accepted when the version fields follow the supplied prefix.

Evidence: `offline-build.ts:447-509` and
`offline-build.test.ts:350-389`.

Impact: canonical parsing can authenticate semantically impossible history even
though the executor itself emits an ordered first-failure prefix. This weakens the
sanitized build result that a later execution/profile-binding gate is expected to
consume.

Required remediation: encode and test the exact failure/prefix matrix.
`STAGING_FAILURE` requires no completed step; `INSPECTION_FAILURE` requires the first
three; `CLEANUP_FAILURE` requires all four; command failure/timeout/output limit may
occur only before completion of one of the three command steps; and `complete`
requires all four with no failure and one built-image digest. Preserve the existing
version-observed and no-built-digest-on-inconclusive rules.

### B-15 — Host process failure flags do not preserve event order

The production process backend records `timedOut`, `outputLimitExceeded`, and
`processError` independently. After timeout sets `timedOut`, later drained output can
still set `outputLimitExceeded`; the executor checks output overflow before timeout.
The returned primary failure can therefore become `OUTPUT_LIMIT` even when timeout
was observed first. A similar later overflow can override an earlier process error.
The fake-backend tests exercise one failure at a time, and host-backend tests reject a
substituted command before spawn; no combined-event ordering regression covers the
production lifecycle.

Evidence: `offline-build-host-backend.ts:459-535`,
`offline-build.ts:299-313`, `offline-build.test.ts:303-326`, and
`offline-build-host-backend.test.ts:67-183`.

Impact: the backend violates the recorded first-failure semantics during the exact
timeout/output races for which bounded termination is required.

Required remediation: latch the first process failure monotonically, continue only
the bounded drain/close work needed for settlement, reject contradictory untrusted
backend result flags, and add focused timeout-then-overflow, overflow-then-timeout,
process-error ordering, and cleanup-secondary tests. Tests must not access Docker;
use a private pure lifecycle helper or the allowed fixed `process.execPath`/
repository-owned-script boundary without exporting an arbitrary production process
seam.

## Remaining limitations

Even after remediation, static/unit evidence cannot establish local image
availability, Docker process behavior, successful offline build, or built-image
identity. Inspect failure can leave the fixed staged image tag behind because the
approved plan contains no image cleanup command. Cleanup failure is fail closed and
can leave owned staging/config state for diagnosis. These limitations must be
evaluated again before a one-time execution gate.

No `profile.json`, control backend, runtime inspection, evidence transfer, Node
permission-model denial, scratch/source enforcement, loopback result,
profile-control Observed, or route Observed was reviewed or created. Expected values
and ADR-0001 are unchanged.

## Verification observed

| Command | Observed result |
|---|---|
| Sorted manifest plus independent `sha256sum`, `wc -c`, and Node aggregate calculation | Exit 0; reviewed aggregate `cf799cd1...cb22f`; reproduced 347 / 29 / 9,159 / 152 bytes, all four file hashes, a 388-byte aggregate, and staging aggregate `sha256:81d6cfee...146a03`. |
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 16 test files, 165 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 16 files / 165 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 83 test files / 496 tests passed. |
| `git diff --check` | Exit 0 before this review record, remediation prompt, and status metadata were added. |
| `git status --short` | Confirmed the target is the existing uncommitted M3/M4 working tree; unrelated work was preserved. |

After adding this review record, remediation prompt, and status metadata,
`npm run m4:verify` was repeated and exited 0 with 16 files / 165 tests.
`npm run check` was repeated and exited 0 with 83 files / 496 tests, and
`git diff --check` remained successful.

The review did not run `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:run:controls`, or `npm run m4:verify:evidence`. It did not access Docker
or a runtime socket, inspect/pull/build an image, create/start/run a container, use
external network or credentials, access host-home contents, enumerate a host
environment, run a lifecycle experiment, use remote Git, commit, publish, or
communicate externally.

## Gate conclusion and next task

The accepted base/staging/fixed plan and the build-only filesystem/activation
boundary remain acceptable, but B-13 through B-15 block the production offline-build
backend static/unit gate. Production activation and one offline build must not be
authorized from this snapshot.

The next task is the narrow, non-executing result and process-order remediation in
[`prompts/m4-execution-profiles-offline-build-result-remediation.md`](../../prompts/m4-execution-profiles-offline-build-result-remediation.md),
followed by a fresh independent read-only re-review. Docker access, image build,
built-image/profile binding, and control execution remain separate later gates.

## Post-review remediation handoff

The narrow non-executing B-13/B-14/B-15 remediation is now implemented. This
handoff records implementation state only; it does not revise this review's
blocked decision or claim that any finding is independently closed.

- B-13: the exact known synthetic profile digest is rejected by the built-image
  inspect parser, plain result validator, and canonical result byte parser. A
  separate nonzero lowercase unit digest remains valid.
- B-14: `STAGING_FAILURE` requires zero completed steps,
  `INSPECTION_FAILURE` three, `CLEANUP_FAILURE` four, command failures zero
  through three, and complete requires all four. Existing exact runtime-version
  and no-built-digest-on-inconclusive constraints remain bound to that matrix.
- B-15: a bounded pure process state latches only the first timeout, output-limit,
  or process-error event and is used by the production host backend. Focused
  tests cover both timeout/output orders, process-error then late output,
  contradictory untrusted flags, abnormal close, and cleanup as a secondary
  failure without accessing Docker.
- The accepted base/staging input, fixed plan, and ordinary
  `M4_EXECUTION_NOT_APPROVED` boundary are unchanged. No Docker/container command
  was run for the remediation.

During initial instruction discovery, the worker inadvertently ran
`find .. -name AGENTS.md -print`, which enumerated sibling `AGENTS.md` path names
outside the repository. It did not read those sibling files or credential
contents, but the path enumeration exceeded the intended repository-only
discovery boundary and is recorded here as a process deviation.

The next task is the fresh independent read-only re-review in
[`prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md`](../../prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md).
Production adoption, offline build execution, built-image/profile binding,
controls, runtime enforcement, and Observed evidence remain separate later gates.
