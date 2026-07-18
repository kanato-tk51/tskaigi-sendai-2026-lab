# M4 offline-build result remediation independent re-review

## Review target and decision

- Target: the current uncommitted B-13/B-14/B-15 remediation working tree
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- B-13 known synthetic built-image digest finding: **CLOSED for static/unit**
- B-14 canonical result semantic-matrix finding: **CLOSED for static/unit**
- B-15 process first-failure ordering finding: **CLOSED for static/unit**
- Production offline-build backend static/unit gate: **APPROVED**
- Exact-input production adoption and backend activation: **PENDING / BLOCKED; not executed**
- One-time offline-build execution gate: **PENDING; not yet defined or executed**
- Built-image/profile binding and runtime enforcement gates: **PENDING / BLOCKED; not executed**
- New blocking findings: none
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The remediation rejects the exact repository-known synthetic profile digest at
the inspect, plain-result, and canonical-byte boundaries. It binds every result
failure to the exact ordered completed-step prefix and corresponding runtime
version/digest state. A bounded process lifecycle state now latches only the
first timeout, output-limit, or process-error event and is used by the
production host backend; contradictory timeout/output flags from an untrusted
backend fail closed rather than receiving a guessed priority.

The accepted base/staging input, fixed three-command plan, build-only
filesystem boundary, and ordinary `M4_EXECUTION_NOT_APPROVED` path remain
unchanged. This is a fresh independent read-only re-review. It did not access
Docker, activate the backend, build or inspect an image, create `profile.json`,
run controls, or establish runtime evidence. It is not a separate human review.

## Reviewed snapshot identity

The hashes below identify the reviewed bytes before this review record and its
status metadata were added. They establish byte identity only; they do not
establish runtime availability or enforcement.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `231cda862163c050b31f4b15b962c24555d0e67fb5c0b30b40e0a60f43ac399a` |
| `containers/profile-control/image-input.json` | `27700a64c4bf4211f21ea5efa534601232f5fa7aea6ef70f306fbb5ba61da7e9` |
| `containers/profile-control/src/docker-plan.ts` | `5bc051512ba9f0a60f709b4b633a2eb105ec2c1c166cfb73301706158ef314a1` |
| `containers/profile-control/src/staging.ts` | `795fd1a75981439f3f70956bd383fa8cf85a3703634dc6eef58cfd698343c9e5` |
| `containers/profile-control/src/offline-build.ts` | `490ba07e2f10e40d6fbf731e538948e2d21482df6853065536c1a2680428096f` |
| `containers/profile-control/src/offline-build-process.ts` | `e32177d3c8f1f6be31f37572aeaf8abf12da961527cb1a830dd2121d1c08639c` |
| `containers/profile-control/src/offline-build-host-backend.ts` | `e4aee00302148ccc75b7b7a2b642bb90f1a1dc01db9f6a3628f7c57281ccf7a2` |
| `containers/profile-control/src/orchestrator.ts` | `fefc2af9c7f69428383eba03d8bb49b0caa51a5332043e8741db39352fb1faf6` |
| `containers/profile-control/src/orchestrator-entry.ts` | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| `containers/profile-control/src/index.ts` | `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4` |
| `containers/profile-control/test/offline-build.test.ts` | `17bd29fbd5f1462f8ce24dbcc03754929c201190d153cd92f2e5fdab5af03dac` |
| `containers/profile-control/test/offline-build-process.test.ts` | `e31dc03926e8825241bec00b0d7dfb3564851c9478ec0d20af7398e31c7bb760` |
| `containers/profile-control/test/offline-build-host-backend.test.ts` | `f454d147d6d9b5577e106ea3e4b4e56b6e78c8732150ca4cd268917cf48cb9d5` |
| `containers/profile-control/scripts/verify-static.mjs` | `fe0662810a5fecba224d57a1c2b5b7c9ad24a280333f8a6dd0be4627fa34bc55` |
| `prompts/m4-execution-profiles-offline-build-result-remediation.md` | `d073ee52e1fd77b5e1407a7cbd6925596239b0499e126fedb6f21ceb20cda2a3` |
| `prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md` | `59a8e3d9d42abcb2d9f6f267f3c8abb01c3f3e4d9f84520827eb2048781daa2d` |
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
values, host environment, credential, host path, stderr, raw error, or canary
value.

The review independently reproduced the fixed staging inventory:

| Order | Logical path | Bytes | SHA-256 |
|---:|---|---:|---|
| 0 | `Containerfile` | 347 | `sha256:9547126c36478783d0312d007cce35aa2de36b9c0994cfc4d19c0ff9336275fc` |
| 1 | `fixture/canary.txt` | 29 | `sha256:6bbdf1baeca26db45068ed461044e6c0941d3b644c1d5d7444a848eb930a3fc4` |
| 2 | `fixture/control-runner.mjs` | 9,159 | `sha256:f914a28fc827592c370ed855717bb55ba856733e8c423ea39baf4bc2254dcf8e` |
| 3 | `fixture/fixed-child.mjs` | 152 | `sha256:3f2fc1c0fb6cd0166d2afab93c0b8f2e4ab50ed404f385d2317d7b9756960191` |

The 388-byte ordered aggregate input hashes to
`sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03`.
The unchanged plan remains exactly `doctor`, offline `build`, and
`inspect-image`, bound to the same accepted snapshot and runtime layout.

## Finding closure assessment

### B-13 — Exact known synthetic digest rejection: closed for static/unit

`parseBuiltImageDigest()` applies the normal lowercase nonzero SHA-256 check,
canonical original-byte comparison, and exact rejection of the base digest,
M0 Node.js 24 digest, and repository-known synthetic profile digest. The plain
result validator repeats those exact exclusions, so canonical parsing inherits
the same semantic rejection. It does not generalize the rejection to unrelated
valid future image IDs.

Focused tests reject the known synthetic digest through the inspect parser,
plain result validator, and canonical-byte parser while accepting a different
nonzero lowercase test digest.

Evidence: `offline-build.ts:254-279`, `offline-build.ts:525-538`,
`offline-build.test.ts:281-312`, and `offline-build.test.ts:529-550`.

### B-14 — Exact result history matrix: closed for static/unit

Completed steps must be an exact prefix of `stage-build-context`, `doctor`,
`build`, `inspect-image`. `STAGING_FAILURE` accepts only prefix length 0,
`INSPECTION_FAILURE` length 3, `CLEANUP_FAILURE` length 4, and command
failure/timeout/output-limit lengths 0 through 3. Complete results require all
four steps, no failure, exact runtime versions, and one non-placeholder built
digest. Inconclusive results require a failure, forbid a built digest, and
require runtime versions exactly when the doctor step completed.

The focused matrix checks all five prefix lengths for every failure code through
both the plain and canonical-byte validators. Additional cases reject complete
or inconclusive validity, version, and digest contradictions.

Evidence: `offline-build.ts:466-560` and
`offline-build.test.ts:477-551`.

### B-15 — Monotonic process first failure: closed for static/unit

`offline-build-process.ts` defines a bounded state whose first failure is set
with null-coalescing assignment semantics and never overwritten. Output counts
continue only up to `limit + 1`, allowing bounded drain evidence without raw
output retention. The production host backend creates and updates this state
for stdout, stderr, timeout, and process-error events; on the first failure it
clears retained stdout, sends the fixed kill signal, and waits for close or a
bounded grace deadline. Its returned timeout/output flags reflect only the
latched first failure.

The executor rejects simultaneous timeout/output flags. It preserves
timeout-first late overflow, overflow-first late timeout, and process-error-first
late output without guessing from later counts. An unclosed process remains the
primary command failure when cleanup also fails. The pure lifecycle tests cover
all three event orders, and the helper is used by the production backend without
adding an arbitrary executable, argv, process factory, or package-root export.

Evidence: `offline-build-process.ts:1-64`,
`offline-build-host-backend.ts:445-546`, `offline-build.ts:282-343`,
`offline-build-process.test.ts:1-55`, and
`offline-build.test.ts:346-430`.

## Safety and activation boundary

The production host backend remains bound to the accepted snapshot, branded
layout, exact command object identity, fixed repository-owned staging, private
credential-empty Docker config, `/usr/bin/docker`, fixed argv/cwd/environment,
`shell: false`, bounded output/timeout/close handling, and owned-path cleanup.
The remediation did not add a control phase, arbitrary production process seam,
runtime-socket forwarding, inherited environment, or raw result field.

The ordinary orchestrator still parses only five fixed operation names and
returns `M4_EXECUTION_NOT_APPROVED` before importing or constructing the
offline-build backend. The package root exports neither the offline-build
executor nor the production host backend. Static/unit tests use fake backends,
filesystem-only owned staging checks, and a pure process state; they do not
access Docker.

## Remaining limitations

Static/unit evidence cannot establish local runtime behavior, base-image
availability at execution time, a successful offline build, or built-image
identity. Inspect failure can leave the fixed staged image tag because the
reviewed plan contains no image cleanup command. Cleanup failure remains fail
closed and can retain owned staging/config state for diagnosis; it does not
replace an earlier primary failure.

No `profile.json`, built-image/profile binding record, control backend, runtime
inspection, evidence transfer, Node permission-model denial, scratch/source
enforcement, loopback result, profile-control Observed, or route Observed was
reviewed or created. Expected values and ADR-0001 are unchanged.

## Verification observed

| Command | Observed result |
|---|---|
| Sorted manifest, independent `sha256sum` / `wc -c`, and ordered NUL/LF aggregate calculation | Exit 0; reviewed aggregate `231cda86...399a`, reproduced 347 / 29 / 9,159 / 152 bytes, all four file hashes, 388 aggregate bytes, and staging aggregate `sha256:81d6cfee...146a03`. |
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 17 test files, 176 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 17 files / 176 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 84 test files / 507 tests passed. |
| `git diff --check` | Exit 0 before this review record and status metadata were added. |
| `git status --short` | Confirmed the target is the existing uncommitted M3/M4 working tree; unrelated work was preserved. |

After adding this review record and status metadata, `npm run m4:verify` was
repeated and exited 0 with 17 files / 176 tests. `npm run check` was repeated
and exited 0 with 84 files / 507 tests.

The review did not run `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:run:controls`, or `npm run m4:verify:evidence`. It did not access
Docker or a runtime socket, inspect/pull/build an image, create/start/run a
container, use external network or credentials, enumerate a host environment,
run a lifecycle experiment, use remote Git, commit, publish, or communicate
externally. No host-home project data was accessed; the only non-repository read
was the environment-provided skill instruction required by this invocation.
Standing authorization was not used to cross an execution gate because this
review expressly prohibited Docker execution.

## Gate conclusion and next task

B-13, B-14, and B-15 are closed for the static/unit boundary. The production
offline-build backend static/unit gate is approved with no new blocking finding.
This does not adopt the exact input for production, activate the backend,
authorize or execute an offline build, establish a built-image digest, bind
profiles, approve controls, or establish runtime enforcement.

The next task is to create the narrow repository-recorded one-time offline-build
execution gate. It must pin this reviewed source snapshot, exact run ID/layout,
accepted snapshot and command-plan identities, fixed side-effect/cleanup
boundary, sanitized result contract, and post-run restoration/verification
steps without running Docker. The later execution itself and built-image/profile
binding remain separate tasks.
