# P2 selected Vite runner and staging independent review

## P2-V03 remediation independent re-review target and decision

- Target: the exact remediated `vite-observe-p/c` runner/declaration/tests and
  rebuilt 128-file staging assembly identified by the P2-V03 remediation
  handoff below
- Review type: fresh independent Docker-non-executing static/unit re-review
- Decision: **APPROVED for minimal Vite executor implementation**
- Closed finding: P2-V03
- New blocking findings: none
- Selected Vite profile Observed: unmeasured
- Experiment-matrix Observed: unchanged
- Docker execution: not approved and not performed

The remediation retains process-group presence after a natural coordinator
close. Immediate group absence plus close `0 / null` remains the only successful
child disposition. If residue is present, bounded `SIGKILL` settlement can make
later cleanup safe but now produces a known `P2_CHILD_FAILED`; failure to prove
final group absence remains `P2_CHILD_SETTLEMENT_UNKNOWN`. The surrounding
lifecycle skips output verification on the known residue failure and performs
server/evidence cleanup only after child settlement is known. This matches the
accepted M2-D residue validity boundary and closes P2-V03.

The focused fake-backend regression covers the exact `launch, group-exists,
SIGKILL, wait-group` transition and rejects it. Fresh review found no new blocker
in the bounded process/server settlement or cleanup behavior. This decision
approves only the next Docker-non-executing executor implementation task; it is
not an execution gate and does not approve either selected Vite run.

This re-review changed no runner, declaration, test, adapter, projection,
staging, Expected, or Observed bytes. Review-owned changes are this record and
the authoritative status/handoff metadata. It did not call Docker, access a
runtime socket or retained M4 state, inspect either ignored codegen run root,
use external network or credentials, or perform remote Git. The
`continue-repository-work` standing authorization was not needed because this
task was non-executing.

## Approved remediated snapshot identity

| Target | SHA-256 |
|---|---|
| `runner/vite-runner.js` | `480b5fd3b2fa49b2853d82d3db5f5fd46f52911397860f2e0c8f1b4a79dbd284` |
| `runner/vite-runner.d.ts` | `d68dd6e93334015d7f9cbac68998286e02d93237d139eae9ca59249e59d52bd0` |
| `test/vite-runner.test.ts` | `761dca75407294c2cdcefdf4ca0e5c557f37a241138d09e65d25f57560504613` |
| `runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `src/plan.ts` | `77c91efb1e7af9259aa040f8b3bafc77ca2afb299a61c920b07b69baeaa5dec5` |
| `src/vite-projection.ts` | `1f9cdf101b97fdcb16bb0296d31512829b7262d504a124d489e5513c8267d0a7` |
| Root `package.json` | `e12904273d1fb554c5f5d39fba2cd790d1cc29313dcad2a8df3020e5afe20b0e` |

The ignored staging tree contains exactly 128 regular non-symlink files. Every
target equals its fixed source byte-for-byte and has its declared `0444` or
`0555` mode. The fixed plan-order manifest reproduces
`13f019cb9d9636023d43350ed13932e5fbc2d1f8ae2a01abe85458ffcd89ae22`,
with Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.
This is static input identity, not runtime enforcement evidence.

## P2-V03 re-review verification observed

| Command | Observed result |
|---|---|
| Key-file SHA-256 calculation | Exit 0; reproduced all seven candidate identities above. |
| Docker-free staging byte/mode/version/manifest assertion | Exit 0; exactly 128 source-equal regular non-symlink files, exact modes, fixed tool versions, and plan-order `13f019cb...` reproduced. |
| Focused `vite-runner.test.ts` | Exit 0; 1 file / 19 tests passed, including the force-settled post-close residue regression. |
| `npm run p2:verify` | Exit 0; P2 typecheck and 8 test files / 77 tests passed. |
| `npm run p2:build` | Exit 0; probe-core, M2-D, M2-E, and the presentation executor compiled. |
| `npm run check` | Exit 0; formatting, lint, root typecheck, and 97 test files / 638 tests passed. |

The next task is a Docker-non-executing minimal Vite executor implementation
bound to the reviewed fixed runner, staging, plans, projection, settlement
barrier, and exact two-scenario result roots. Submit those bytes to a fresh
independent review before defining or using any Docker execution gate. Do not
call Docker, rerun codegen, or promote selected Vite or experiment-matrix
Observed in that implementation task.

## Settlement-remediation re-review target and decision

- Target: the remediated fixed `vite-observe-p/c` runner/declaration/tests and
  rebuilt 128-file staging assembly identified by the remediation handoff below
- Review type: fresh independent Docker-non-executing static/unit re-review
- Decision: **BLOCKED; do not add an executor or run Docker**
- Closed finding: P2-V01
- New blocking finding: P2-V03
- Selected Vite profile Observed: unmeasured
- Experiment-matrix Observed: unchanged

The remediation now preserves first failure and explicit settlement state,
requires bounded accepted failure-first close dispositions, suppresses output,
loopback, and partial-segment cleanup while settlement is unknown, and bounds
known-safe server close. The behavioral fake process/server tests cover the
transitions required by P2-V01, so P2-V01 is closed.

The execution gate remains blocked by P2-V03. A natural successful coordinator
close with a still-present process group is followed by `SIGKILL` and a bounded
group-exit wait, but a later successful wait is then accepted as ordinary runner
success. The approved M2-D boundary instead treats any residue observed after a
successful coordinator close as a run-invalidating residue failure. A focused
Docker-free fake-backend assertion reproduced the unintended success, and the
current behavioral suite omits this exact transition.

This re-review changed no runner, declaration, test, adapter, projection,
staging, Expected, or Observed bytes. Review-owned changes are this record and
the authoritative status/handoff metadata. It did not call Docker, access a
runtime socket or retained M4 state, use external network or credentials,
inspect either ignored codegen run root, or perform remote Git. The
`continue-repository-work` standing authorization was not needed because this
review was non-executing.

## Remediated snapshot identity

| Target | SHA-256 |
|---|---|
| `runner/vite-runner.js` | `6824a48f5c26abbd90fe97817eba5ebc1dfb06a7d9f686b09259693919482394` |
| `runner/vite-runner.d.ts` | `d68dd6e93334015d7f9cbac68998286e02d93237d139eae9ca59249e59d52bd0` |
| `test/vite-runner.test.ts` | `054e2b19c41d03c3aa601eb46412f5d04e6a06943d25c73fa86e0a537736bbb8` |
| `runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `src/plan.ts` | `77c91efb1e7af9259aa040f8b3bafc77ca2afb299a61c920b07b69baeaa5dec5` |
| `src/vite-projection.ts` | `1f9cdf101b97fdcb16bb0296d31512829b7262d504a124d489e5513c8267d0a7` |
| Root `package.json` | `e12904273d1fb554c5f5d39fba2cd790d1cc29313dcad2a8df3020e5afe20b0e` |

The rebuilt staging tree contains exactly 128 regular non-symlink files. Every
target equals its fixed source byte-for-byte and has its declared `0444` or
`0555` mode. The fixed plan-order manifest reproduces
`edeb861279e0b4c09539456b434e3b5747e53c9069937f7756ba9b7238a23078`,
with Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.
This is static input identity, not runtime enforcement evidence.

## New blocking finding

### P2-V03 — Post-close process residue can be accepted as success

`executeBoundedChild()` observes whether the process group exists after the
coordinator close. When it does, the runner sends `SIGKILL` and waits for group
exit (`runner/vite-runner.js:473-482`). If that wait succeeds, the function then
returns success solely because the earlier natural close was `0 / null`
(`runner/vite-runner.js:483-487`). It does not retain that process residue was
present and force-terminated after the coordinator claimed success.

That classification conflicts with the accepted M2-D lifecycle. The adapter's
fixed process boundary routes any process group still present after coordinator
close through residue settlement and throws `M2D_ESBUILD_RESIDUE` for a natural
successful close (`packages/vite-plugin-probe/src/process-lifecycle.ts:351-363`).
Its contract requires successful runs to establish close `0 / null`, group
absence, and no esbuild residue before acceptance. Killing a late descendant
may make cleanup safe, but it does not turn the run into success.

The current normal-success test starts with the group already absent, while the
final-residue test makes the bounded group wait fail. Neither covers the middle
case where close is `0 / null`, residue is initially present, `SIGKILL` is sent,
and the group then exits. The re-review's Docker-free fake backend exercised
that exact case and observed resolution with trace
`launch, group-exists, SIGKILL, wait-group`.

Impact: output verification and later server/evidence cleanup can proceed as a
successful selected Vite run even though a tool-owned or probe-owned descendant
outlived the successful coordinator and required force termination. That drops
the accepted M2-D residue validity condition and could promote an invalid run.

Required remediation:

1. Retain whether the process group was present after natural coordinator close.
   Even if bounded termination later proves the group absent, reject that run as
   a known child/residue failure; keep settlement unknown if final absence cannot
   be proved.
2. Add a behavioral fake-backend test for `0 / null` close plus initially
   present residue that exits after termination, and assert that output
   verification cannot run on that path.
3. Rebuild the 128-file staging tree and submit the exact runner/test/staging
   bytes to another fresh Docker-non-executing re-review before adding an
   executor or calling Docker.

## Remediation re-review verification observed

| Command | Observed result |
|---|---|
| Key-file SHA-256 calculation | Exit 0; reproduced the seven remediated identities above. |
| Docker-free staging byte/mode/version/manifest assertion | Exit 0; exactly 128 source-equal regular non-symlink files, exact modes, fixed tool versions, and plan-order `edeb8612...` reproduced. |
| Docker-free close-zero/residue fake-backend assertion | Exit 0; the candidate unexpectedly resolved success after `SIGKILL` and bounded group exit. |
| `npm run p2:verify` | Exit 0; P2 typecheck and 8 test files / 76 tests passed. The P2-V03 transition is not covered by those tests. |

The next task is a Docker-non-executing P2-V03 remediation of the close-zero
residue classification and behavioral test, followed by a fresh independent
re-review. Do not add a Vite executor, call Docker, or run either selected Vite
scenario before that re-review approves the exact bytes.

## P2-V03 remediation handoff (not a re-review)

The 2026-07-19 Docker-non-executing remediation retains process-group presence
after coordinator close. A natural `0 / null` close followed by residue that
disappears only after bounded `SIGKILL` settlement is now a known
`P2_CHILD_FAILED` result; failure to prove final group absence remains the
existing `P2_CHILD_SETTLEMENT_UNKNOWN` cleanup barrier. The focused behavioral
lifecycle regression exercises the exact `launch, group-exists, SIGKILL,
wait-group` transition, rejects it, proves output verification is skipped, and
allows only the cleanup that follows known settlement.

The candidate identities for the next independent re-review are:

| Target | SHA-256 |
|---|---|
| `runner/vite-runner.js` | `480b5fd3b2fa49b2853d82d3db5f5fd46f52911397860f2e0c8f1b4a79dbd284` |
| `runner/vite-runner.d.ts` | `d68dd6e93334015d7f9cbac68998286e02d93237d139eae9ca59249e59d52bd0` |
| `test/vite-runner.test.ts` | `761dca75407294c2cdcefdf4ca0e5c557f37a241138d09e65d25f57560504613` |
| `runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `src/plan.ts` | `77c91efb1e7af9259aa040f8b3bafc77ca2afb299a61c920b07b69baeaa5dec5` |
| `src/vite-projection.ts` | `1f9cdf101b97fdcb16bb0296d31512829b7262d504a124d489e5513c8267d0a7` |
| Root `package.json` | `e12904273d1fb554c5f5d39fba2cd790d1cc29313dcad2a8df3020e5afe20b0e` |

The rebuilt ignored staging tree contains exactly 128 regular non-symlink
files. Every target is source-equal with its declared `0444` or `0555` mode,
and the fixed plan-order manifest is
`13f019cb9d9636023d43350ed13932e5fbc2d1f8ae2a01abe85458ffcd89ae22`.
The Docker-free assertion also reproduced Node.js `v20.18.2`, Vite `6.4.3`,
Rollup `4.62.2`, and esbuild `0.25.12`.

The focused runner test passed 1 file / 19 tests, `npm run p2:verify` passed 8
files / 77 tests, `npm run p2:build` passed, and `npm run p2:stage:vite`
rebuilt 128 files before the byte/mode/version/manifest assertion passed. The
root `npm run check` passed 97 files / 638 tests. No Docker command, runtime
socket, Vite profile run, receipt, Expected edit, Observed promotion, matrix
change, external network, credential, retained M4 access, or remote Git
occurred. Standing authorization was not needed because the task was
Docker-non-executing.

This handoff records implementation evidence only. It does not revise the
review decision or close P2-V03. The next task is a fresh independent
Docker-non-executing re-review of these exact candidate bytes and rebuilt
staging inventory before any Vite executor or Docker operation.

## Initial review target and decision (historical)

- Target: the uncommitted fixed `vite-observe-p/c` runner, projection,
  adapter binding, and 128-file staging assembly on review base
  `47bac2ec9373`
- Review type: fresh focused Docker-non-executing static/unit review
- Decision: **BLOCKED; do not add an executor or run Docker**
- Blocking finding: P2-V01
- Review-resolved documentation finding: P2-V02
- Selected Vite profile Observed: unmeasured
- Experiment-matrix Observed: unchanged

The fixed identities, argument-free runner surface, pair-shared staging plan,
separated mounts, constrained-child limitation, bounded evidence shape, and
exact tool closure are suitable foundations for a later executor. The current
runner does not yet preserve settlement-unknown as a cleanup barrier, however.
A coordinator close with a still-present process group can be collapsed into an
ordinary child failure, after which loopback teardown and partial-segment mode
changes still run. The current tests inspect source strings but do not exercise
these lifecycle transitions.

This review changed no runner, adapter, projection, staging, Expected, or
Observed bytes. Review-owned changes are this record, status/handoff metadata,
and a correction that names the recorded staging digest's actual fixed plan
order. It did not call Docker, access a runtime socket or retained M4 state, use
external network or credentials, inspect either ignored codegen run root, or
perform remote Git. The `continue-repository-work` standing authorization was
not needed because this review was non-executing.

## Reviewed snapshot identity

The following SHA-256 values identify the implementation bytes before this
review record and its status metadata were added. They establish static byte
identity, not runtime enforcement.

| Target | SHA-256 |
|---|---|
| `runner/vite-runner.js` | `29806904b842430b61b85a542257b9dc835464de0edb06b771f8f9e02af32c38` |
| `runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `src/plan.ts` | `77c91efb1e7af9259aa040f8b3bafc77ca2afb299a61c920b07b69baeaa5dec5` |
| `src/vite-projection.ts` | `1f9cdf101b97fdcb16bb0296d31512829b7262d504a124d489e5513c8267d0a7` |
| `test/vite-runner.test.ts` | `d015e1366cc7c4e29a63b31270a9591f3c7bdf321e66dfd92d130733aebee1bd` |
| `test/vite-staging.test.ts` | `b7a4a5bde14dfb093da8882f37667f099fe9f0c7b469695f9f5059be9c42d0d0` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `fe6aaf00b470387a58b7199f60906345c490cc5ce3702c41d00c00f0f57994f6` |
| `packages/vite-plugin-probe/src/coordinator-input.ts` | `b6c85d8e81a1288830f256da63a625bc2ad9d7dc7074e0c81bfb9bc9d021f57a` |
| `packages/vite-plugin-probe/src/manifest.ts` | `c1450eb9c95a16abe68eb635b2413849b071d07faf3f58a2d180a8f629e5b675` |
| Root `package.json` | `e12904273d1fb554c5f5d39fba2cd790d1cc29313dcad2a8df3020e5afe20b0e` |

The ignored Vite staging tree contains exactly 128 regular non-symlink files.
Every target equals its fixed source byte-for-byte and has its declared `0444`
or `0555` mode. The fixed plan-order manifest, encoded as logical path, NUL,
file SHA-256, and LF for each entry, reproduces
`cc4e8dbc5df4e4f19246c48fb164b1d32157dc04423ddcc1388c95b9fb384677`.
The independently lexicographically sorted form hashes instead to
`7b6f953ddc207d0307a04d70f4bf63f7276bf7118183d6e26b381f941406448d`.
This ordering distinction is P2-V02 below; neither digest is runtime evidence.

## Positive boundary assessment

- The public runner entry accepts only the two exact selected scenario IDs and
  maps them to fixed run/profile tuples. It exposes no caller-selected image,
  executable, arguments, cwd, path, environment key, network target, or runtime
  option.
- Both profiles use the same pinned Vite production-build argv, staged source,
  Node image plan, and tool closure. Only the declared canary/server exposure
  and the constrained read-only direct-write mount differ.
- The child receives no inherited host environment. Environment keys, cwd,
  executable, arguments, loopback address/port, event path, tool paths, source,
  and output file are fixed.
- The permissive service is fixed to `127.0.0.1` and the reviewed canary
  protocol. Both container plans retain `--network none`; no external network
  target or runtime-socket mount is present.
- The constrained Vite process intentionally retains child reachability because
  the same pinned Vite/esbuild build needs a tool-owned child. The projection
  expects the probe child to succeed and displays
  `CONSTRAINED_CHILD_REQUIRED_BY_TOOL`; it does not relabel that success as a
  denial.
- The runner bounds child wall time and combined output, verifies the fixed
  source before and after, requires one bounded event segment and one logical
  output file, and emits only fixed identities, hashes, and byte counts.
- Staging rejects an existing target, final-source symlinks and non-files,
  escaping targets, and duplicate copies; it copies the exact adapter,
  probe-core, Vite/Rollup/esbuild, and fixed Linux amd64 native closure with
  byte equality and fixed read/execute modes.

## Blocking finding

### P2-V01 — Settlement unknown does not suppress cleanup

When the coordinator emits `close`, the runner accepts only `0 / null` plus an
absent process group as success. For every other close result it sends
`SIGKILL`, waits up to one second, discards the boolean returned by
`waitForProcessGroupExit()`, and throws `P2_CHILD_FAILED`
(`runner/vite-runner.js:365-376`). A nonzero coordinator exit or a successful
coordinator whose esbuild/probe descendant remains alive is therefore reported
as an ordinary settled failure even when the group is still present.

The failure-first branch also does not require the bounded `close` promise to
settle with an accepted disposition before returning the primary timeout,
output, or child failure (`runner/vite-runner.js:379-398`). Process-group absence
is useful evidence, but the approved M2-D boundary separately requires a known
coordinator close disposition. The current code can finish this branch without
retaining whether `close` was absent or contradictory.

Regardless of which error is thrown, `executeFixedViteScenario()` unconditionally
closes the permissive loopback service in `finally`
(`runner/vite-runner.js:467-473`), and the top-level catch then attempts to
chmod the partial segment (`runner/vite-runner.js:494-498`). Those are cleanup
or evidence mutations that the contract requires to be suppressed while child
settlement is unknown. `closeServer()` itself has no settlement deadline, so a
connection retained by an unsettled child can also extend the runner beyond its
advertised bound.

The runner tests do not reach these paths. They only assert that the source text
contains `detached: true`, a `SIGKILL` call, and limit constants
(`test/vite-runner.test.ts:97-114`). Thus the static/unit pass does not establish
the claimed TERM/KILL/close/cleanup ordering.

Impact: an executor cannot safely distinguish a settled failed build from a
runner that may still have active descendants or an active loopback connection.
Adding Docker lifecycle cleanup on top of this runner would reintroduce the
same command/cleanup race that the codegen executor remediation intentionally
closed. The exact Vite execution gate is not approved.

Required remediation:

1. Preserve a first failure plus an explicit known/unknown settlement state.
   Require a bounded accepted coordinator close disposition and confirmed
   process-group absence; after the final KILL wait, a remaining group must be
   `P2_CHILD_SETTLEMENT_UNKNOWN`.
2. Suppress loopback teardown, partial-segment chmod, and later executor cleanup
   whenever settlement is unknown. Bound loopback-server settlement after the
   process group is known absent.
3. Add a Docker-free fake process/server seam with behavioral tests for normal
   success, nonzero close, timeout/output/process error, TERM/KILL ordering,
   missing or contradictory close, a group remaining after KILL, and cleanup
   suppression/order. Source-string assertions are not sufficient.
4. Submit the remediated exact runner/tests and rebuilt 128-file staging bytes
   to a fresh Docker-non-executing re-review before adding an executor.

## Review-resolved documentation finding

### P2-V02 — Recorded staging digest was described with the wrong order

The existing digest value `cc4e8dbc...` reproduces the 128 entries in the fixed
staging-plan order. A lexicographically sorted logical-path/hash stream produces
`7b6f953d...` instead. The implementation inventory is exact and byte-equal, so
this is a description error rather than an input drift. This review changes the
contract wording from “sorted” to “fixed plan-order” and retains both independent
calculations here. Finding P2-V02 is resolved without changing staging bytes.

## Verification observed

| Command | Observed result |
|---|---|
| `npm run p2:verify` | Exit 0; P2 typecheck and 8 test files / 62 tests passed. The lifecycle gap described in P2-V01 is not behaviorally covered by those tests. |
| `npm run p2:build` | Exit 0; probe-core, M2-D, M2-E, and presentation TypeScript outputs compiled. |
| Docker-free staging byte/mode/version/manifest assertion | Exit 0; exactly 128 source-equal regular files, fixed modes, Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, esbuild `0.25.12`, plan-order `cc4e8dbc...`, and sorted `7b6f953d...` reproduced. |
| Key-file SHA-256 calculation | Exit 0; reproduced the reviewed hashes above. |
| `npm run format:check` | Exit 0; all tracked and non-ignored untracked inputs matched Prettier style. |
| `npm run check` | Exit 0; formatting, lint, root typecheck, and 97 test files / 623 tests passed. |
| `git diff --check` | Exit 0 after review-owned documentation and handoff updates. |

The next task is a Docker-non-executing remediation of P2-V01 with behavioral
process/server lifecycle tests. Do not add a Vite executor, call Docker, or run
either selected Vite scenario until a fresh re-review approves the remediated
runner and rebuilt exact staging bytes.

## Remediation handoff (historical; not a re-review)

The 2026-07-19 Docker-non-executing remediation now retains the first child
failure and explicit settlement state, requires an accepted bounded coordinator
close plus process-group absence, suppresses loopback/evidence cleanup while
settlement is unknown, and bounds known-safe server close. Docker-free fake
process/server tests cover the lifecycle transitions required by P2-V01. The
candidate runner, declaration, and test hashes are `6824a48f...`, `d68dd6e9...`,
and `054e2b19...`; the rebuilt 128-file plan-order staging manifest is
`edeb861279e0b4c09539456b434e3b5747e53c9069937f7756ba9b7238a23078`.

This handoff records implementation evidence only. It does not revise the review
decision or close P2-V01. `npm run p2:verify` passed 8 files / 76 tests,
`npm run p2:build` passed, and the root check passed 97 files / 637 tests without
Docker, runtime-socket access, external network, selected Vite execution, or
retained M4 access. Standing authorization was not needed. The next task is a
fresh independent Docker-non-executing re-review of these exact candidate bytes
and rebuilt staging inventory before any Vite executor or Docker operation.
