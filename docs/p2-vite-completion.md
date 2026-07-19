# P2 Vite completion addendum

Status: **complete; the fixed `-03` one-shot pair is exhausted and its fresh
Docker-free result review accepted it only as the third immutable Inconclusive
attempt; no selected Vite Observed evidence or further retry remains**.

This addendum reopens only the selected Vite permissive/constrained comparison.
The accepted codegen pair, P3 result, P4 projections, frozen M4 track, and the
two exhausted Vite attempts remain unchanged until a fresh result review accepts
new evidence.

## Diagnosis

The two historical attempts are immutable Inconclusive records:

| Attempt | Fixed identity | Retained conclusion |
|---|---|---|
| first | `p2-vite-observe-p/c-20260719-01` | The one-shot command stopped in the permissive scenario. Partial event/direct-write bytes existed, but host-readable output and a canonical receipt were not established; the constrained scenario did not run. P2-V03 through P2-V06 were subsequently remediated and independently reviewed. |
| second | `p2-vite-observe-p/c-20260719-02` | The one-shot command stopped in the permissive scenario. `attempt.json` records the created-state image, known Docker settlement, completed cleanup, no final exit, no runner disposition, no inspected output, no receipt, and no constrained root. |

The second record proves that fixed `create` and created-state `inspect`
completed. Failure occurred after that inspect and before a valid final
exited-state result was retained. The source has only two relevant paths in that
interval: the bounded attached `start`, or its following fixed `inspect` and
validation.

The exact operational cause cannot be recovered from the retained record.
`p2-vite-attempt/v1` maps both paths to
`P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED` and does not retain a failure stage or the
bounded `FixedViteCommandError.failureCode`. The attached-start limit was 40
seconds while the inner runner can spend 30 seconds on the child, 0.5 seconds on
graceful termination, 1 second on forced settlement, and 1 second on loopback
server settlement, leaving a relatively small unmeasured container/CLI and
finalization margin. This timeout hierarchy is a plausible contributor, not a
fact established by the old evidence.

Therefore the actionable failure cause is diagnostic-state loss across the
fixed Docker lifecycle, with a bounded timeout-margin risk. Neither old attempt
may be retried, recovered, rewritten, deleted, or promoted to Observed.

## Required Docker-free remediation

Before another execution is proposed:

1. Preserve a closed enum for the primary lifecycle stage and a sanitized
   failure code in a new attempt schema. Never retain raw stdout, stderr, errors,
   paths, or runtime-selected values.
2. After an attached-start command failure whose Docker CLI settlement is known,
   perform at most the already fixed final inspect once, retain only validated
   image/state/exit fields, keep the original failure primary, and remain
   Inconclusive. Do not inspect after unknown settlement.
3. Set the fixed outer attached-start timeout to 60 seconds. Keep the runner's
   inner timeout/termination boundaries unchanged and add focused tests for the
   timeout ordering and every retained failure stage.
4. Rebind only the selected Vite context, plan, runner, projection, executor,
   tests, and staging to the new fixed identities below. Codegen stays
   unchanged.
5. Verify all changes without Docker, then require a fresh independent
   Docker-non-executing review. Implementation and review are separate tasks.

## New immutable experiment contract

The next candidate fixes the following values before execution:

- Expected revision: `p2-vite-expected-20260719-03`
- Expected event order: the existing 15-event order, producer sequence `0..14`
- Expected counts per profile: route `6`, capability `6`, tool API change `3`,
  total `15`
- Observe tool changes: three `skipped / NOT_APPLICABLE`
- Permissive capabilities: environment, file read, source hash, direct write,
  loopback, and fixed child are `success`
- Constrained capabilities: environment absent; file missing/denied; source hash
  success and unchanged; direct write denied; loopback failure; fixed child
  success with the existing tool-required-child limitation
- Image reference:
  `node@sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`
- Required inspected image ID:
  `sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`

The image bytes intentionally remain the same as the reviewed prior candidate.
This is a new freeze of the exact identity, not a new pull, so the remediation
is the only changed runtime variable and no external network is needed.

| Scenario | Profile | New run ID | New container name |
|---|---|---|---|
| `vite-observe-p` | permissive | `p2-vite-observe-p-20260719-03` | `tskaigi-p2-vite-observe-p-20260719-03` |
| `vite-observe-c` | constrained | `p2-vite-observe-c-20260719-03` | `tskaigi-p2-vite-observe-c-20260719-03` |

Expected remains a pre-run hypothesis. It must not be changed in response to
the new outcome. Both new exact result roots must be absent at gate review and
immediately before execution. Do not enumerate or access the two historical
result trees while checking them.

## Docker-free remediation candidate (2026-07-19)

The bounded implementation under
[`prompts/p2-vite-diagnostic-remediation.md`](../prompts/p2-vite-diagnostic-remediation.md)
is complete and ready for a fresh independent review. It is static/unit
evidence only and does not approve or execute Docker.

New attempts use canonical `p2-vite-attempt/v2`. The schema adds the exact
`p2-vite-expected-20260719-03` revision and nullable
`primaryFailureStage` / `primaryFailureCode` fields. The stage is restricted to
`create`, `created-inspect`, `attached-start`, `final-inspect`,
`runner-disposition`, or `cleanup`. The failure code is restricted to the fixed
Docker command codes, fixed runner codes, or the allowlisted
create/inspect/runner/fallback validation codes. The canonical object has no
field for stdout, stderr, raw errors, paths, container names, or
runtime-selected values. New receipts and pair projections are correspondingly
`p2-vite-execution/v2` and `p2-vite-pair/v2`; both exact scenarios are bound to
the same Expected revision, and receipt/pair completion requires the fixed
inspected image ID.

An attached-start `FixedViteCommandError` with known closed settlement keeps
its attached-start stage/code primary and invokes the already fixed final
inspect at most once. A valid exact-image `exited` result may retain its bounded
exit field, but the attempt remains Inconclusive and cannot inspect evidence or
write a receipt. An invalid following inspect cannot replace the original
failure and retains no unvalidated exit. Unknown start settlement performs no
following inspect and continues to suppress cleanup. Focused fake-command tests
cover all six retained primary stages, known/unknown settlement, single-inspect
ordering, original-failure preservation, and validated final-state retention.

The fixed outer attached-start limit is now 60,000 ms. The runner-internal
limits remain 30,000 ms child timeout, 500 ms graceful termination, 1,000 ms
force settlement, and 1,000 ms server settlement. A focused assertion binds
those exact values and proves the 60-second outer boundary exceeds the complete
32.5-second controlled inner failure path.

Only the selected Vite plan, M2-D selected context, runner, projection,
executor, tests, and staging are rebound to
`p2-vite-observe-p/c-20260719-03` and
`tskaigi-p2-vite-observe-p/c-20260719-03`. Both the plan and canonical new
attempt/receipt identity contain `p2-vite-expected-20260719-03`. The required
image reference and image ID remain the exact values above. Tests reject both
historical `-01` and `-02` tuples. Codegen's combined tracked source identity
was `936ba1aec9e8f415c9a675c6f133ceed5436c3edfd7dd127351eb8fee20aea3d`
before and after implementation.

The candidate identities for independent review are:

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

The prior verified staging tree was preserved intact under the ignored exact
path `staging/vite.pre-p2-vite-diagnostic-96e81f81`. The ordinary argument-free
staging command rebuilt exactly 128 regular, non-symlink, source-equal files
with their declared `0444` or `0555` modes. Its plan-order logical-path, NUL,
file-SHA-256, LF manifest is
`f7cae69f0bfb80b6ae9f0f4909e66f2bb826b204fe5bb592bfa2700e3ece67b3`,
with Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.
Exact checks of only the two `-03` result paths found both absent after staging.

Observed verification: the focused Vite suite passed 5 files / 84 tests and
the focused M2-D context suite passed 1 file / 11 tests; `npm run m2d:verify`
passed 12 files / 75 tests; `npm run p2:verify` passed 9 files / 123 tests;
`npm run p2:build`, the corrected compiled executor/entry import check, and
`npm run check` passed, with the root suite at 101 files / 698 tests. The first
import-check command named a non-generated `dist/vite-executor-entry.js` and
failed with `ERR_MODULE_NOT_FOUND`; the corrected check imported the compiled
executor and argument-free runner entry and passed without side effects.

No Docker command, runtime socket, historical result/container access, result
creation, image pull, external network, credential, M4 retained-state access,
Remote Git, publication, or deployment occurred. The two historical attempts
remain immutable Inconclusive, selected Vite Observed remains unmeasured, and
the accepted codegen/P3/P4 evidence and experiment-matrix Observed are
unchanged. Standing authorization was not used because this task was
Docker-non-executing.

## Independent diagnostic-remediation review (2026-07-19)

The
[fresh independent Docker-non-executing review](reviews/p2-vite-diagnostic-remediation.md)
reproduced all sixteen candidate hashes, the exact 128-file source-equal
fixed-mode staging manifest `f7cae69f...`, fixed tool versions, both absent
`-03` roots, Expected/image/tuple binding, focused and full static checks, and
the known/unknown attached-start behavior. It confirms that a known-settled
attached-start failure keeps its original stage/code across its single final
inspect and cleanup, while unknown settlement performs neither inspect nor
cleanup.

The review is **BLOCKED** on P2-V07. A known runner failure records
`runner-disposition` and its runner code, but a later failed fixed cleanup
command replaces those primary fields with `cleanup` and the cleanup command
code. A Docker-free compiled-backend reproduction confirmed the loss; the
focused suite does not cover that combination. No execution gate is approved.

The next task is a bounded Docker-non-executing P2-V07 remediation that uses one
first-failure diagnostic latch across runner and cleanup, preserves cleanup as
a secondary disposition/issue, and adds a fake-command-to-canonical-attempt
regression. It must then reproduce the exact candidate/staging/root-absence
evidence and return to a fresh independent review before any Docker command.
The two historical attempts remain immutable Inconclusive, selected Vite
Observed remains unmeasured, and accepted codegen/P3/P4 evidence is unchanged.

## P2-V07 remediation candidate (2026-07-19)

The bounded Docker-non-executing remediation now uses one first-failure
diagnostic latch for command, validation, runner-disposition, and cleanup
stages. The operational error object remains separate: a known runner failure
can therefore complete its fixed cleanup transition, while its already-latched
`runner-disposition` stage and sanitized runner code cannot be replaced by a
later cleanup error. Cleanup remains visible through `cleanupDisposition`, the
closed issue codes, and the absence of evidence access or a receipt.

The focused fake-command regression drives exact create, created inspect,
known `P2_CHILD_FAILED` runner disposition, final exited inspect, and failed
fixed remove results through canonical attempt finalization. It asserts the
five-command order, preserves `runner-disposition` / `P2_CHILD_FAILED`, retains
the validated image and exit code, records failed cleanup, writes only the
attempt, does not inspect evidence, and emits no receipt.

The review candidate identities are:

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

The preceding `f7cae69f...` staging tree was preserved at the exact ignored
`staging/vite.pre-p2-v07-f7cae69f` path before the ordinary argument-free
staging command rebuilt 128 regular non-symlink files. Both trees reproduce
the exact source-equal fixed-mode plan-order manifest
`f7cae69f0bfb80b6ae9f0f4909e66f2bb826b204fe5bb592bfa2700e3ece67b3`
with Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.
The focused Vite/context suite passed 6 files / 96 tests, M2-D verification
passed 12 files / 75 tests, P2 verification passed 9 files / 124 tests, P2
build and compiled import checks passed, and both exact `-03` roots remained
absent before and after the imports. The five independently accepted
codegen-specific hashes were reproduced and their tracked diff remained empty.
The root check passed formatting, lint, typecheck, and 101 files / 699 tests.

No Docker command, runtime socket, historical result/container access, new
result creation, image pull, external network, credential, frozen M4 retained
state, Remote Git, publication, or deployment occurred. Standing authorization
was not used because this task was Docker-non-executing. Expected, selected
Vite Observed, experiment-matrix Observed, and accepted codegen/P3/P4 evidence
remain unchanged.

## P2-V07 remediation independent re-review (2026-07-19)

The
[fresh independent Docker-non-executing re-review](reviews/p2-vite-diagnostic-remediation.md)
reproduced all sixteen candidate hashes, both exact 128-file source-equal
fixed-mode `f7cae69f...` staging trees, fixed tool versions, Expected/image/run/
container binding, codegen non-change, both absent `-03` roots, focused/full
checks, and compiled import safety. An independent compiled fake-backend
reproduction drove the exact five-command runner-failure/cleanup-failure
ordering and retained `runner-disposition / P2_CHILD_FAILED` as primary while
cleanup remained a failed secondary disposition/issue. Only the canonical
Inconclusive attempt was written; evidence and receipt paths were not reached.

The review closes P2-V07 with no new blocking or non-blocking finding and
approves only one later argument-free `npm run p2:execute:vite` pair attempt.
That command is never retried on any outcome and authorizes no other Docker
operation or Observed promotion. The review itself did not call Docker or use
standing authorization and is not a separate human review. Both historical
attempts remain immutable Inconclusive, selected Vite Observed remains
unmeasured, and accepted codegen/P3/P4 evidence remains unchanged. The next task
is a fresh worker revalidating the approved hashes, staging identities, fixed
package script, and both absent exact `-03` roots, then using standing
authorization for that exact one-shot command.

## `20260719-03` one-shot execution (2026-07-19)

A fresh worker reproduced all sixteen approved hashes, both exact 128-file
source-equal fixed-mode staging trees and their plan-order `f7cae69f...`
manifest, the fixed Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and
esbuild `0.25.12` versions, the argument-free package script, and absence of
both exact `-03` result roots. It then used the `continue-repository-work`
standing authorization to invoke exactly one `npm run p2:execute:vite` pair
attempt. This was not a separate human review. The command exited 1, was not
retried, and no Docker command outside the fixed executor sequence was called.
Its fixed `p2:build` phase completed before the executor entry returned the
bounded result below.

The bounded entry projection is `inconclusive`: pair schema
`p2-vite-pair/v2`, Expected revision `p2-vite-expected-20260719-03`, validity
`inconclusive`, null image ID, and issue `PAIR_IDENTITY_MISMATCH`. Only
`vite-observe-p` appears. Its completion is `inconclusive`, the attempt record
is written, evidence is `not-inspected`, no receipt is written, validity is
`not-inspected`, and the issues are
`P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED` and
`P2_ATTEMPT_OUTPUT_NOT_INSPECTED`.

An exact-path Docker-free check found the permissive result root to be a
non-symlink mode `0700` directory. Its canonical non-symlink mode `0600`,
661-byte `attempt.json` has SHA-256
`5f90a582664b1f5d068a01341dfb71fc029c9a5f445e64b930729dd6a4f398b6`
and records:

- schema `p2-vite-attempt/v2`, the exact permissive scenario/run/profile, and
  Expected revision `p2-vite-expected-20260719-03`;
- primary `attached-start` / `P2_EXECUTOR_DOCKER_TIMEOUT` failure;
- the approved inspected image ID, null inspected container exit, known Docker
  settlement, and runner settlement `not-established`;
- completed cleanup, null runner disposition, output `not-inspected`, and the
  two bounded issues above.

The exact permissive `summary.json` and constrained `-03` result root are
absent. The worker did not inspect an evidence subtree or historical result or
container state, change retained permissions, access a runtime socket, pull an
image, use external network or credentials, access frozen M4 state, perform
Remote Git, publish, or deploy. Expected, selected Vite Observed,
experiment-matrix Observed, and accepted codegen/P3/P4 evidence remain
unchanged. This is a third immutable Inconclusive attempt candidate, not a
receipt or same-image pair.

Post-execution `npm run p2:verify` passed typecheck and 9 files / 124 tests,
`npm run format:check` passed, and `git diff --check` passed after the handoff
metadata was written.

The next task is a fresh Docker-free read-only result review. It must reproduce
the sixteen approved source hashes, the canonical attempt bytes/hash/mode,
bounded projection, and exact summary/constrained-root absence without reading
an evidence subtree. It must not call Docker, retry the pair, inspect runtime or
historical state, change retained permissions, or promote Observed before the
review decision. If the canonical result is accepted, the review must record
all three attempts side by side and update the tracked presentation projection
and evidence map while preserving the two earlier Inconclusive records.

## `20260719-03` result independent review (2026-07-19)

The
[fresh Docker-free read-only result review](reviews/p2-vite-diagnostic-result.md)
reproduced all sixteen approved source identities and the exact canonical
permissive attempt. The result root is a non-symlink mode `0700` directory;
`attempt.json` is canonical one-line `p2-vite-attempt/v2`, non-symlink mode
`0600`, 661 bytes, and SHA-256 `5f90a582...`. Its fixed identity, Expected
revision, approved image ID, primary
`attached-start / P2_EXECUTOR_DOCKER_TIMEOUT`, null exit, known Docker
settlement, runner settlement `not-established`, completed cleanup, null runner,
`not-inspected` output, and two bounded issues all match the execution record.
The exact summary and constrained root remain absent.

Applying the approved pure pair and entry projectors to that canonical attempt
reproduced the bounded `inconclusive / PAIR_IDENTITY_MISMATCH` projection with
only the permissive written attempt, no receipt, and no inspected capability
evidence. The review therefore accepts `20260719-03` only as a third observed
Inconclusive execution attempt. It does not establish a constrained outcome,
same-image pair, capability result, selected Vite Observed, or experiment-matrix
Observed.

The tracked `profiles.json` and generated evidence map now retain all three
attempts side by side: `20260719-01` has no canonical diagnostic record,
`20260719-02` has the canonical v1 record without a primary-stage diagnostic,
and `20260719-03` has the canonical v2 attached-start timeout diagnostic. All
three remain immutable Inconclusive history. The accepted codegen/P3 evidence,
Expected values, and experiment matrix are unchanged.

The review did not call Docker, retry a pair, inspect runtime or historical
state, read an evidence subtree, change retained permissions, use external
network or credentials, access frozen M4 state, perform Remote Git, publish, or
deploy. The prior execution worker used the recorded standing authorization for
the exact one-shot command; this non-executing review did not use standing
authorization and is not a separate human review.

## Ordered completion path

1. **Complete:** implement the Docker-free remediation and fixed `-03` binding under
   [`prompts/p2-vite-diagnostic-remediation.md`](../prompts/p2-vite-diagnostic-remediation.md).
2. **Complete but BLOCKED:** in a fresh session, review the exact candidate under
   [`prompts/reviews/p2-vite-diagnostic-remediation-review.md`](../prompts/reviews/p2-vite-diagnostic-remediation-review.md).
3. **Complete:** remediate P2-V07 without Docker and reproduce the exact
   candidate/staging/root-absence evidence.
4. **Complete:** in a fresh session, independently re-review the exact candidate under
   [`prompts/reviews/p2-vite-diagnostic-remediation-review.md`](../prompts/reviews/p2-vite-diagnostic-remediation-review.md).
   The review closed P2-V07 with no new finding and approved only the one-shot
   argument-free execution gate.
5. **Complete:** a fresh session invoked exactly one
   `npm run p2:execute:vite`. It was one ordered permissive/constrained pair,
   exited 1 with only a canonical permissive Inconclusive attempt, and was not
   retried.
6. **Complete:** a final fresh Docker-free review classified the new canonical
   result and updated the tracked presentation projection/evidence map. The
   history lists `20260719-01`, `20260719-02`, and `20260719-03` side by side;
   all three remain Inconclusive.

Selected Vite Observed remains unmeasured, the updated talk projection retains
the explicit three-attempt gap, and no retry or runtime recovery is authorized.

Next: none
