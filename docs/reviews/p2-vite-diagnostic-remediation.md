# P2 Vite diagnostic remediation independent review

## P2-V07 remediation independent re-review target and decision

- Target: the exact Docker-non-executing P2-V07 first-failure diagnostic-latch
  remediation and fixed `20260719-03` candidate recorded in
  [`docs/p2-vite-completion.md`](../p2-vite-completion.md)
- Review type: fresh independent Docker-non-executing static/unit re-review
- Decision: **APPROVED for the exact one-shot
  `npm run p2:execute:vite` gate**
- Closed finding: P2-V07
- New blocking or non-blocking findings: none
- Selected Vite profile Observed: unmeasured
- Experiment-matrix Observed: unchanged
- Docker execution: approved only through the fixed command below; not
  performed by this review

The remediation uses one first-failure diagnostic latch across command,
validation, runner-disposition, and cleanup stages. A known runner failure now
retains `runner-disposition` and its closed runner failure code when the later
fixed remove command fails. Cleanup remains separately visible through the
failed cleanup disposition and allowlisted issue codes, and the attempt remains
Inconclusive without evidence access or a receipt. The focused regression
drives exactly `create`, created-state `inspect`, attached `start`, final
exited-state `inspect`, and fixed `rm`, then asserts the canonical v2 attempt.

An independent compiled-backend reproduction exercised the same runner-failure
then cleanup-failure ordering and reproduced primary
`runner-disposition / P2_CHILD_FAILED`, failed cleanup, a written Inconclusive
attempt, and no evidence or receipt access. Fresh review found no new blocker in
the bounded P2-V07 change or the surrounding known/unknown settlement,
attached-start diagnostic, Expected/image/tuple, receipt, and pair boundaries.
P2-V07 is closed.

This review changed no executor, runner, adapter, probe, staging, Expected, or
Observed bytes. Review-owned changes are this re-review record and minimal
authoritative status/handoff metadata. It did not call Docker, access a runtime
socket or either historical result/container state, create a result root, pull
an image, use external network or credentials, access retained M4 state,
perform Remote Git, publish, deploy, or communicate with a third party. The
`continue-repository-work` standing authorization was not used because this
review was Docker-non-executing. This is an independent Codex review, not a
separate human review.

### Approved P2-V07 candidate identity

The following SHA-256 values were independently reproduced. They establish
static input identity, not runtime behavior.

| Target | SHA-256 |
|---|---|
| `src/vite-executor.ts` | `db793c49e3d3070df1f1dbd36561dd1b20ff7950baae7825e5ba5d602282e25f` |
| `test/vite-executor.test.ts` | `d8d83333b85b05c7339e9ffda3c7feabfea25d0d3f35b94c7d70469e4774881d` |
| `runner/vite-executor-entry.js` | `daeee923a7887fc7747c39058a5d59a4b02bdcca55a3692653b2980d16d02dc9` |
| `runner/vite-executor-entry.d.ts` | `1246122cc5cbda3b9a50872e3f25451aecfb0e9df4b2103718564b4d86532e10` |
| `runner/vite-runner.js` | `e2e070e0dd0fafbd6d7cc400aa1e18db7c97dd74c72d4b881a7b8c6d4e1e72ea` |
| `runner/vite-runner.d.ts` | `20478c9c0766383a45e54608e3fecbabc41f9e8ea3c7b1efec8f51e9fef2749f` |
| `test/vite-runner.test.ts` | `4058c2e76fd7a415fe15044e45a772f63555c0c769bb2453b906144e9858e0ad` |
| `src/vite-projection.ts` | `a89e63c3696e01ef12105c2f9f497b93560ed87426ff4b26d5cf6ddececf62eb` |
| `test/vite-projection.test.ts` | `bfb5a7ed88154bbdf57e481fc6786f042091c2ef062e3c8e1dae2a164473cda3` |
| `runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `test/vite-staging.test.ts` | `b7a4a5bde14dfb093da8882f37667f099fe9f0c7b469695f9f5059be9c42d0d0` |
| `src/plan.ts` | `cc6268926d68079caede0140833a740f0100e786e62f39cf8396e94d3d903d0e` |
| `test/plan.test.ts` | `2fc09b7e173e09b4ddf28a673b3241a2caa524edaca7269bafbbd8a773835c5c` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `45449dd4cf0bfacc6c065935bd47af8799fcb66acf9d9605a98a72db41ac231c` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `d522fa5bb50e664e67e0ee9a33cbab17705356288bed4843bd1a614f1659e171` |
| Root `package.json` | `6a715c3f3559254d7b7611b380c9eae1b6b8354c09c5878ea44fcc3672b5f10f` |

Both the authoritative staging tree and the preserved exact
`staging/vite.pre-p2-v07-f7cae69f` tree contain 128 regular non-symlink files.
Every target is source-equal with its declared `0444` or `0555` mode. Both
reproduce the fixed plan-order logical-path, NUL, file-SHA-256, LF manifest
`f7cae69f0bfb80b6ae9f0f4909e66f2bb826b204fe5bb592bfa2700e3ece67b3`,
with Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.

The exact active binding is `p2-vite-expected-20260719-03`, the fixed image
reference and required image ID recorded in the completion addendum, run IDs
`p2-vite-observe-p/c-20260719-03`, and distinct matching
`tskaigi-p2-vite-observe-p/c-20260719-03` container names. Exact checks of only
these paths found both result roots absent:

- `results/runs/p2-selected-profiles/p2-vite-observe-p-20260719-03`
- `results/runs/p2-selected-profiles/p2-vite-observe-c-20260719-03`

The five accepted codegen-specific hashes reproduce executor `091f09a8...`,
projection `95853a28...`, entry `a2b49161...`, runner `f423fd8b...`, and
executor test `a0755b4b...`. Their codegen-specific tracked diff and the
`packages/codegen-probe` tracked diff are empty. No accepted receipt or result
root was accessed.

### P2-V07 re-review verification observed

| Command or assertion | Observed result |
|---|---|
| Candidate SHA-256 calculation | Exit 0; all sixteen approved identities above reproduced. |
| Focused Vite plan/runner/projection/executor/staging tests | Exit 0; 5 files / 85 tests passed. |
| Focused M2-D context test | Exit 0; 1 file / 11 tests passed. |
| Independent compiled P2-V07 fake-backend reproduction | Exit 0; the exact five-command transition retained `runner-disposition / P2_CHILD_FAILED` across failed cleanup and wrote only an Inconclusive attempt. |
| `npm run m2d:verify` | Exit 0; typecheck/build/static checks and 12 files / 75 tests passed. |
| `npm run p2:verify` | Exit 0; typecheck and 9 files / 124 tests passed. |
| `npm run p2:build` | Exit 0; probe-core, M2-D, M2-E, and presentation TypeScript outputs compiled. |
| Compiled executor/entry import check | Exit 0 with no output; both imports completed without Docker execution or result creation. |
| Docker-free staging byte/mode/version/manifest assertion | Exit 0; both exact 128-file trees reproduced all source bytes, modes, versions, and plan-order `f7cae69f...`. |
| Exact two-path `-03` root absence checks | Exit 0 before and after compiled imports/reproduction; both fixed roots remained absent without parent or historical-root enumeration. |
| Codegen-specific hash and diff checks | Exit 0; accepted hashes reproduced and no codegen-specific tracked diff exists. |
| `npm run check` | Exit 0; formatting, lint, typecheck, and 101 files / 699 tests passed. |
| `git diff --check` | Exit 0 after the re-review record and handoff metadata were finalized. |

Static/unit checks do not establish Docker availability, local-image
resolution, runtime option enforcement, non-root/offline behavior, runner
completion, cleanup, a receipt, a same-image pair, or any capability outcome.
Both historical attempts remain immutable Inconclusive records; selected Vite
and experiment-matrix Observed remain unmeasured. Accepted codegen/P3/P4
evidence remains unchanged.

### Exact one-shot execution gate

A fresh worker must first reproduce the sixteen hashes above, both exact
staging identities, the fixed argument-free package script, and absence of both
exact `-03` result roots. It may then use the `continue-repository-work`
standing authorization to invoke exactly once:

```text
npm run p2:execute:vite
```

That command is one ordered permissive/constrained pair and is never retried on
any outcome. It authorizes no other Docker command, direct runtime-socket
access, historical-state access, image pull, codegen rerun, retained M4 work,
external communication, publication, deployment, or Observed promotion. This
approval is not a separate human review. A later fresh Docker-free result review
must classify the exact canonical result before selected Vite Observed or the
tracked presentation projection can change.

Next: a fresh worker revalidates the approved hashes, staging identities,
argument-free package script, and both absent exact `-03` roots, then uses
standing authorization for exactly one `npm run p2:execute:vite` pair attempt
with no retry.

## Initial diagnostic-remediation review target and decision (historical)

- Target: the Docker-non-executing `p2-vite-attempt/v2` diagnostic-state,
  fixed timeout, Expected-revision, image, and `20260719-03` identity candidate
  recorded in [`docs/p2-vite-completion.md`](../p2-vite-completion.md)
- Review type: fresh independent Docker-non-executing static/unit gate review
- Decision: **BLOCKED; do not run `npm run p2:execute:vite`**
- Blocking finding: P2-V07
- Non-blocking findings: none
- Selected Vite profile Observed: unmeasured
- Experiment-matrix Observed: unchanged

The candidate correctly binds the active M2-D context, plan, runner,
projection, executor, attempt, receipt, and pair boundaries to the exact
`p2-vite-observe-p/c-20260719-03` identities. The plan and canonical v2
attempt/receipt/pair records bind both profiles to
`p2-vite-expected-20260719-03`; create and every fixed follow-up command use
the matching distinct `tskaigi-p2-vite-observe-p/c-20260719-03` name. Both
historical `-01` and `-02` tuples are rejected by focused context/projection
coverage.

The canonical attempt object has a closed six-stage primary-stage union and a
closed failure-code union. Its exact serialized keys contain no stdout,
stderr, raw error, path, container-name, or runtime-selected field. A known-
settled attached-start command failure performs exactly one final inspect,
keeps the attached-start stage/code primary when that inspect succeeds or is
invalid, remains Inconclusive, and then follows the existing known-settlement
cleanup boundary. Unknown attached-start settlement performs neither inspect
nor cleanup. The fixed 60,000 ms attached-start boundary exceeds the unchanged
30,000 + 500 + 1,000 + 1,000 ms controlled runner failure path.

Those positive checks do not approve execution because a known runner failure
followed by cleanup failure overwrites the earlier runner diagnostic in the
new primary fields. This breaks the meaning of the primary stage/code and the
existing first-failure-preservation boundary.

This review changed no executor, runner, adapter, probe, staging, Expected, or
Observed bytes. Review-owned changes are this record and minimal authoritative
status/handoff metadata. It did not call Docker, access a runtime socket, read
or mutate either historical result/container state, create a new result root,
pull an image, use external network or credentials, access retained M4 state,
perform Remote Git, publish, deploy, or communicate with a third party. The
`continue-repository-work` standing authorization was not used because this
review was Docker-non-executing and did not approve the recorded execution
gate. This is an independent Codex review, not a separate human review.

## Blocking finding

### P2-V07 — Cleanup failure can replace an earlier runner primary diagnostic

After exact runner failure framing is parsed,
`executeFixedViteLifecycleAttempt()` stores
`primaryFailureStage: "runner-disposition"` and the bounded runner failure code,
but it deliberately leaves the separate `primaryFailure` error latch unset
(`src/vite-executor.ts:1403-1409`). If the later fixed remove command fails,
the cleanup branch tests only that error latch, treats cleanup as if no prior
failure existed, and replaces the already-recorded stage/code with `cleanup`
and the cleanup command code (`src/vite-executor.ts:1451-1454`).

A Docker-free compiled-backend reproduction used exact created/exited image
identity, a known `P2_CHILD_FAILED` runner disposition, and a nonzero fixed
remove result. The canonical attempt retained the runner object but serialized:

```json
{
  "primaryFailureStage": "cleanup",
  "primaryFailureCode": "P2_EXECUTOR_DOCKER_FAILED",
  "runnerFailureCode": "P2_CHILD_FAILED",
  "cleanupDisposition": "failed"
}
```

The issues also classify the attempt with both Docker-lifecycle and runner
failure codes. Cleanup is secondary in this ordering; it must not replace the
earlier runner disposition in fields explicitly named primary. The candidate's
41-test executor suite covers cleanup as primary after an otherwise successful
lifecycle and runner failure with successful cleanup, but not their
combination.

Impact: a later Inconclusive attempt can again discard the exact stage/code
needed to distinguish runner failure from cleanup failure. That weakens the
diagnostic-state remediation whose purpose is to make a third one-shot outcome
classifiable and violates the previously accepted rule that cleanup failure
cannot replace an earlier primary failure. The exact one-shot gate is blocked.

Required remediation:

1. Use one first-failure diagnostic latch across command, validation, runner,
   and cleanup stages. A runner failure must keep `runner-disposition` and its
   sanitized runner code primary when cleanup later fails; cleanup must remain
   visible only through its bounded disposition/issue fields.
2. Add a focused fake-command-to-canonical-attempt regression for known runner
   failure followed by failed cleanup. Assert exact command order, preserved
   runner primary fields, failed cleanup, no evidence access, and no receipt.
3. Reproduce the candidate hashes, exact staging identity, fixed timeout and
   Expected/image/tuple bindings, codegen non-change, and two absent `-03`
   roots, then submit the bounded remediation to another fresh
   Docker-non-executing review. Do not execute Docker in either task.

## Reviewed candidate identity

The following SHA-256 values were independently reproduced from the candidate
bytes. They establish static identity, not runtime behavior.

| Target | SHA-256 |
|---|---|
| `src/vite-executor.ts` | `4a1e77379b55fee864ce771d7dc5ca507f7048fb4cccc6cf1e8ac767544b72ff` |
| `test/vite-executor.test.ts` | `f54c60daa723bb6b3e99b79ac8f94e13d4a0defdce958753c899953953a32274` |
| `runner/vite-executor-entry.js` | `daeee923a7887fc7747c39058a5d59a4b02bdcca55a3692653b2980d16d02dc9` |
| `runner/vite-executor-entry.d.ts` | `1246122cc5cbda3b9a50872e3f25451aecfb0e9df4b2103718564b4d86532e10` |
| `runner/vite-runner.js` | `e2e070e0dd0fafbd6d7cc400aa1e18db7c97dd74c72d4b881a7b8c6d4e1e72ea` |
| `runner/vite-runner.d.ts` | `20478c9c0766383a45e54608e3fecbabc41f9e8ea3c7b1efec8f51e9fef2749f` |
| `test/vite-runner.test.ts` | `4058c2e76fd7a415fe15044e45a772f63555c0c769bb2453b906144e9858e0ad` |
| `src/vite-projection.ts` | `a89e63c3696e01ef12105c2f9f497b93560ed87426ff4b26d5cf6ddececf62eb` |
| `test/vite-projection.test.ts` | `bfb5a7ed88154bbdf57e481fc6786f042091c2ef062e3c8e1dae2a164473cda3` |
| `runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `test/vite-staging.test.ts` | `b7a4a5bde14dfb093da8882f37667f099fe9f0c7b469695f9f5059be9c42d0d0` |
| `src/plan.ts` | `cc6268926d68079caede0140833a740f0100e786e62f39cf8396e94d3d903d0e` |
| `test/plan.test.ts` | `2fc09b7e173e09b4ddf28a673b3241a2caa524edaca7269bafbbd8a773835c5c` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `45449dd4cf0bfacc6c065935bd47af8799fcb66acf9d9605a98a72db41ac231c` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `d522fa5bb50e664e67e0ee9a33cbab17705356288bed4843bd1a614f1659e171` |
| Root `package.json` | `6a715c3f3559254d7b7611b380c9eae1b6b8354c09c5878ea44fcc3672b5f10f` |

The ignored staging tree contains exactly 128 regular non-symlink files. Every
target is source-equal with its declared `0444` or `0555` mode. The fixed
plan-order logical-path, NUL, file-SHA-256, LF manifest is
`f7cae69f0bfb80b6ae9f0f4909e66f2bb826b204fe5bb592bfa2700e3ece67b3`,
with Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.
Exact checks of only these two paths found both absent:

- `results/runs/p2-selected-profiles/p2-vite-observe-p-20260719-03`
- `results/runs/p2-selected-profiles/p2-vite-observe-c-20260719-03`

The five codegen-specific identities recorded by its approved executor review
remain exact: executor `091f09a8...`, projection `95853a28...`, entry
`a2b49161...`, runner `f423fd8b...`, and executor test `a0755b4b...`.
`git diff --exit-code` over all codegen-specific presentation files and
`packages/codegen-probe` exited 0. The shared plan retains the accepted codegen
run IDs, names, image, counts, staging, and commands, and the full codegen tests
passed inside P2/root verification. No accepted receipt or result root was
read.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Candidate SHA-256 calculation | Exit 0; all sixteen identities above reproduced. |
| Focused Vite plan/runner/projection/executor/staging tests | Exit 0; 5 files / 84 tests passed. |
| Focused M2-D context test | The first command was launched from the repository root with a package-relative Vitest include and exited 1 with no test files; the corrected package-root command exited 0 with 1 file / 11 tests. No state changed. |
| `npm run m2d:verify` | Exit 0; typecheck/build/static checks and 12 files / 75 tests passed. |
| `npm run p2:verify` | Exit 0; typecheck and 9 files / 123 tests passed. |
| `npm run p2:build` | Exit 0; probe-core, M2-D, M2-E, and presentation TypeScript outputs compiled. |
| Compiled executor/entry import check | Exit 0 with no output; both modules imported without Docker execution or result creation. |
| Docker-free staging byte/mode/version/manifest assertion | Exit 0; exactly 128 source-equal fixed-mode regular non-symlink files, exact tool versions, and plan-order `f7cae69f...` reproduced. |
| Exact two-path `-03` root absence check | Exit 0; both fixed roots were absent without parent or historical-root enumeration. |
| Argument-free package-script assertion | Exit 0; `p2:execute:vite` remains the fixed build plus entry command. |
| Codegen-specific hash and diff checks | Exit 0; approved hashes reproduced and no codegen-specific tracked diff exists. |
| Docker-free runner-failure/cleanup-failure reproduction | Exit 0; reproduced P2-V07 with runner `P2_CHILD_FAILED` retained inside the runner object but cleanup replacing the primary stage/code. |
| `npm run check` | Exit 0; formatting, lint, typecheck, and 101 files / 698 tests passed. The untested P2-V07 combination remains outside that suite. |
| `npm run format:check` and `git diff --check` | Exit 0 after the review record and handoff metadata were added. |
| `git status --short` | Captured the existing remediation candidate plus the review-owned record/status changes; no ignored result-root enumeration was used. |

Static/unit checks do not establish Docker availability, local-image
resolution, option enforcement, non-root/offline behavior, runner completion,
container cleanup, a receipt, a same-image pair, or any capability outcome.
Both historical attempts remain immutable Inconclusive records; selected Vite
and experiment-matrix Observed remain unmeasured. The accepted codegen/P3/P4
evidence remains unchanged.

Next: remediate P2-V07 by preserving the known runner disposition as primary
across a later cleanup failure and add the focused canonical-attempt regression,
then submit the exact Docker-free candidate to a fresh independent re-review.
