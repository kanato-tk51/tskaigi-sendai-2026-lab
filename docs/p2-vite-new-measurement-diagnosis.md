# P2 selected Vite `20260720-01` Docker-free diagnosis

Status: **diagnosis/contract review, bounded Docker-free implementation, fresh
execution-gate review, the exact one-shot execution, and the fresh Docker-free
result review are complete; the runtime outcome is accepted only as the fourth
immutable Inconclusive attempt**

Diagnosis date: 2026-07-20

This document compares the three immutable selected Vite Inconclusive attempts
and defines the smallest changed measurement boundary that could justify the
reserved `20260720-01` generation. It uses only tracked source, tracked review
records, and the sanitized historical projections already recorded by those
reviews. No retained result, evidence subtree, historical container, Docker
state, runtime socket, or ignored staging tree was accessed.

## Evidence classes used here

| Input | Classification | What it can establish |
|---|---|---|
| The three accepted result-review records | Observed Inconclusive attempt facts at their exact recorded scope | The retained lifecycle fields, missing fields, command outcome, and pair incompleteness already accepted by each review |
| Current and historical Git-tracked source/tests | static/unit evidence | Reachable state transitions, bounds, missing diagnostics, and current regressions; not the lower-level runtime cause of an old attempt |
| The reserved `20260720-01` tuple and unchanged event contract | Expected-only | A proposed future identity and acceptance contract; not runtime evidence |

An inference below is never promoted to a demonstrated runtime fact. In
particular, configuration intent, a passing unit test, a timeout hierarchy, or
a container option does not establish runtime enforcement or the cause of the
`-03` timeout.

## Three-attempt causal comparison

| Generation | Demonstrated by the accepted record | Supported inference | Unknown runtime fact |
|---|---|---|---|
| `20260719-01` | The one-shot pair stopped in permissive; the entry retained only `P2_EXECUTOR_FAILED`; partial event/direct-write files existed; no canonical attempt or receipt existed; constrained did not run. | The then-current receipt path could cross unavailable output and lose an in-memory lifecycle disposition; the later P2-V04 through P2-V06 source findings explain how diagnostic state could be discarded. | The first failing lifecycle stage, Docker/runner settlement, inspected image/exit, cleanup result, and whether the retained partial bytes formed a complete producer segment. |
| `20260719-02` | Canonical `p2-vite-attempt/v1` retained the approved created-state image, known Docker settlement, completed cleanup, null final exit, null runner, `not-inspected` output, no receipt, and no constrained root. | Failure occurred after the valid created-state inspect and before a valid final exited-state result was retained. The then-fixed 40-second attached-start bound was a plausible contributor, but v1 collapsed attached-start and later inspect/validation failures. | Whether attached start timed out, failed another way, returned and was followed by invalid inspect/runner framing, or reached any inner runner phase. |
| `20260719-03` | Canonical `p2-vite-attempt/v2` retained primary `attached-start / P2_EXECUTOR_DOCKER_TIMEOUT`, the approved created-state image, null final exit, known Docker CLI settlement, runner settlement `not-established`, completed cleanup, `not-inspected` output, no receipt, and no constrained root. | The host-side attached Docker CLI remained open until its 60-second deadline and then reached the accepted post-signal close disposition. The following one-inspect path did not establish a valid exited-state outcome before fixed cleanup completed. | Whether the container was still running, which runner phase was last reached, whether any runner framing was emitted, whether a filesystem/server/child/runtime operation stalled, and how much time was Docker attach transport rather than runner work. |

The causal progression is therefore better diagnostics, not repeated proof of
one lower-level failure: `-01` retained no canonical lifecycle state, `-02`
retained a v1 envelope without a primary stage, and `-03` located the host-side
failure at attached start without locating the inner runner phase.

## `-03` attached-start trace

The reviewed `-03` executor path was fixed as follows:

1. The host created the fixed container and validated the owned `created`
   inspect and image before start.
2. It invoked only `docker start --attach <fixed-name>`. The attached-start
   process had a 60,000 ms deadline, a 16,384-byte combined-output limit, and a
   1,000 ms post-`SIGKILL` settlement deadline.
3. At 60 seconds, `runBoundedFixedDockerCommand()` selected
   `P2_EXECUTOR_DOCKER_TIMEOUT`, discarded its raw stdout/stderr buffers,
   signalled the host Docker CLI process, and accepted only the exact closed
   `null / SIGKILL` disposition as known Docker CLI settlement. That is not
   container or runner settlement.
4. Known CLI settlement allowed exactly one fixed final inspect. The canonical
   null exit proves only that no valid exited-state outcome was retained; v2
   deliberately kept the earlier attached-start timeout primary.
5. Fixed force-removal then completed. The executor wrote the canonical
   Inconclusive attempt without reading output, and ordered pair execution
   stopped before constrained.

Inside the container, the runner performed fixed input preparation, permissive
loopback startup, the Vite child lifecycle, server settlement, output
validation/export, and terminal framing. Only the child portion had the
30,000 ms child deadline plus 500 ms TERM grace and 1,000 ms force-settlement
bound; server close had 1,000 ms. Input preparation, initial server listen,
output filesystem validation/export, scheduling, container start/attach, and
CLI transport were not represented by that 32.5-second sum. The runner emitted
only a terminal frame, so the executor retained no sanitized inner checkpoint
when attached start timed out.

Consequently, `60,000 > 32,500` is static timeout-order evidence, not proof that
the runner had to finish within 60 seconds. Increasing the same outer timeout
again would change a condition without locating the failed phase and is not an
approved remediation.

## Current tracked-source findings

The current tracked source is not the reviewed `-03` runtime snapshot and
cannot be used unchanged for the new generation.

### P2-V12 — accepted runner settlement invariants are regressed

Current `executeBoundedChild()` accepts a natural `0 / null` coordinator close
with a still-present process group as success after bounded `SIGKILL`
settlement. Its focused test explicitly expects output verification on that
path. This contradicts the previously accepted P2-V03 rule: force settlement
can make cleanup safe but cannot turn post-close residue into runner success.

Current `executeSettledViteLifecycle()` also calls the loopback-server close
path before rethrowing an unknown child-settlement failure. Its focused test
records `server-close` on that path even though its description says cleanup is
suppressed. This contradicts the accepted P2-V01 cleanup barrier.

These are demonstrated static regressions introduced after the immutable `-03`
attempt; they are not its historical cause. They block any later implementation
or gate until restored and behaviorally covered.

### P2-V13 — attached-start retains no bounded inner progress

The current host command collector retains only terminal stdout/stderr and
clears both raw buffers when a timeout/output/process failure becomes primary.
The runner emits no checkpoint before terminal success/failure framing. Thus
the exact `-03` outer timeout would again collapse input preparation, loopback
startup, child launch/settlement, server settlement, output export, and attach
transport into the same primary code.

The active tracked Vite binding is also an unobserved `20260719-11` static
tuple, not any accepted runtime generation and not the reserved new tuple. It
must not be described as a fourth attempt or added to presentation history.

## Decision

An unchanged fourth attached-start execution is **not justified**. It would:

- reuse terminal-only inner framing that already produced an unresolved
  60-second outer timeout;
- run with the demonstrated P2-V12 settlement/cleanup regression; and
- activate neither the reserved `20260720-01` tuple nor a diagnostic that can
  distinguish the next timeout by runner phase.

A new execution may be considered only after the contract below is implemented
without Docker, independently reviewed, and then approved by a separate exact
one-shot execution-gate review. The remediation is intentionally diagnostic:
it does not assert that it will make Vite complete, and another Inconclusive
result remains an acceptable truthful outcome.

## Exact bounded remediation contract

### 1. Restore the fail-closed runner boundary

- A natural coordinator close with post-close process-group residue must
  become known `P2_CHILD_FAILED` even when bounded force settlement later
  proves group absence. Output verification must not run on that path.
- Unknown child settlement must return before loopback close, output
  verification, partial-event chmod, or any other runner cleanup/evidence
  mutation. Known child settlement may use the existing bounded server close.
- The executor must continue to suppress container cleanup after unknown
  Docker or runner settlement. Progress state defined below never establishes
  settlement and never authorizes cleanup or evidence access.

### 2. Add a sanitized attached-start progress protocol

The runner must emit at most this exact ordered prefix of checkpoint stages:

```text
0 runner-entered
1 inputs-prepared
2 service-ready
3 child-launched
4 child-settled
5 service-settled
6 output-exported
```

Each checkpoint is one canonical JSON line with only:

- schema `p2-vite-progress/v1`;
- the exact Expected/scenario/profile/run identity;
- integer sequence `0..6`; and
- the matching closed stage value above.

`runner-entered` occurs only after exact argv/version/scenario resolution.
`service-ready` means the permissive fixed loopback listen completed or the
constrained fixed no-service branch was selected. `child-launched` occurs only
after a valid child PID/process-group identity is established.
`child-settled` and `service-settled` require their existing known settlement
conditions. `output-exported` occurs only after exact output validation and the
reviewed host-readable mode changes complete.

Progress lines use runner stdout, which remains separate from the child output
captured inside the runner. On success, the existing terminal success object is
the final stdout line and stderr is empty. On failure, stdout contains only the
valid progress prefix and the existing terminal failure object remains the
single stderr line. The executor incrementally accepts no more than 7 progress
lines, 1,024 bytes per line, and 4,096 progress bytes total, within the
unchanged 16,384-byte Docker CLI combined-output ceiling. It must handle
arbitrary chunk boundaries, retain only the parsed closed projection, and
never serialize raw chunks, unknown keys, raw errors, paths, commands,
environment values, canaries, timestamps, or durations.

The terminal success/failure frame remains mandatory. Success requires the
complete `0..6` progress sequence. A known child failure may reach
`service-settled` but not `output-exported`; unknown child settlement cannot
claim `child-settled` or a later stage; unknown server settlement cannot claim
`service-settled`; and an output-validation failure may reach
`service-settled` but not `output-exported`. A malformed, duplicated,
out-of-order, identity-mismatched, oversized, settlement-inconsistent, or
post-terminal checkpoint makes progress `invalid`; it cannot become a receipt
or success.

### 3. Preserve progress in a new attempt schema

New attempts use `p2-vite-attempt/v3`; receipts use
`p2-vite-execution/v3`; and pair projections use `p2-vite-pair/v3`. The
attempt adds exactly
`runnerProgress: { schemaVersion: "p2-vite-progress/v1", validity, stages }`,
where `validity` is `not-established`, `valid-prefix`, or `invalid` and
`stages` is the accepted prefix above. `not-established` has an empty stage
list; `invalid` retains only the valid prefix before the rejected frame and
never its raw bytes. Missing progress is not an empty successful sequence.

On attached-start timeout/output/process failure, the existing command failure
stage/code remains primary. A valid progress prefix is diagnostic secondary
state only. Later final-inspect failure, invalid progress, or cleanup failure
must not replace that primary. Cleanup and progress-invalid conditions remain
separately visible through closed dispositions/issues.

Known-settled attached-start failure still permits at most one fixed final
inspect. Unknown Docker CLI settlement permits neither that inspect nor
cleanup. Output evidence remains `not-inspected` for an incomplete runner, and
no progress prefix can create `summary.json`.

### 4. Keep the timeout and pair boundary fixed

- Keep outer attached start at 60,000 ms, Docker settlement at 1,000 ms, child
  at 30,000 ms, TERM grace at 500 ms, child force settlement at 1,000 ms, and
  server settlement at 1,000 ms. This task does not increase a timeout.
- Keep Docker command combined output at 16,384 bytes and the existing bounded
  event/output limits.
- Execute permissive first and stop after any non-complete outcome. Constrained
  may start only after a complete permissive receipt. A progress record or
  Inconclusive attempt is not a receipt.
- `same-image` still requires two complete exact-identity receipts with the
  required inspected image ID. Missing constrained remains missing, never zero
  or denial.

### 5. Bind only the reserved generation

The later implementation must cross-bind exactly:

| Scenario | Profile | Run/root | Container |
|---|---|---|---|
| `vite-observe-p` | permissive | `p2-vite-observe-p-20260720-01` | `tskaigi-p2-vite-observe-p-20260720-01` |
| `vite-observe-c` | constrained | `p2-vite-observe-c-20260720-01` | `tskaigi-p2-vite-observe-c-20260720-01` |

Expected revision is exactly `p2-vite-expected-20260720-01`. This is an
identity revision only: the existing 15-event order, counts, Expected outcomes,
fixed image reference/ID, tool versions, fixture, command, and constrained
child limitation do not change. Active bindings must reject the immutable
`20260719-01`, `-02`, and `-03` tuples and the current unobserved `-11` static
tuple. Codegen/P3/P4 and M4 bytes/evidence remain unchanged.

Only the two exact new result paths may be checked for absence, without parent
enumeration, at a future gate review and immediately before a future execution.
This diagnosis performs no absence check and creates no root.

## Docker-free acceptance regressions

A later implementation is review-ready only when focused tests demonstrate:

1. post-close residue is a known failure and skips output verification;
2. unknown child settlement reaches no server/evidence cleanup;
3. all seven valid checkpoint prefixes survive arbitrary chunk splitting and
   retain no raw fields;
4. malformed, duplicate, reordered, identity-mismatched, oversized, and
   post-terminal progress fail closed;
5. attached-start timeout at each retained prefix keeps
   `attached-start / P2_EXECUTOR_DOCKER_TIMEOUT` primary, preserves known versus
   unknown CLI settlement, and follows the one-inspect/cleanup rules;
6. Docker output overflow and terminal-frame failure remain bounded and cannot
   manufacture completion;
7. runner failure plus cleanup failure preserves the runner/command first
   failure and records cleanup only as secondary;
8. pair progression stops after an Inconclusive permissive outcome and
   `same-image` still requires two complete receipts;
9. only the exact `20260720-01` tuple/container/Expected cross-binding is
   accepted and every old/static Vite tuple above is rejected; and
10. codegen-specific tracked bytes and accepted presentation evidence do not
    change.

Focused Vite runner/executor/plan/projection/context verification, P2
typecheck/build, import-safety checks, and a source-equal fixed-mode staging
rebuild are appropriate only in the later implementation/review tasks. Static
checks do not approve execution.

## Execution and evidence boundary

This diagnosis opens no execution gate. After a fresh independent review
approves the contract, one Docker-free implementation task may restore P2-V12,
implement P2-V13, bind `20260720-01`, add the regressions, and rebuild staging.
A separate fresh execution-gate review must then approve exact candidate bytes,
staging, fixed command, codegen non-change, and only the two exact new-root
absence checks.

Only that later exact gate may authorize one argument-free
`npm run p2:execute:vite` pair attempt. It is never retried on any outcome.
Progress remains diagnostic static/runtime attempt state, not capability
Observed evidence. Any produced result requires a fresh Docker-free result
review before selected Vite or experiment-matrix Observed can change.

No Docker command, execution command, retained-state access, staging rebuild,
network access, credential access, Remote Git, publication, or deployment was
used for this diagnosis. Standing authorization was not used because no
repository-recorded execution gate was reached.

The
[`fresh independent Docker-free review`](reviews/p2-vite-new-measurement-diagnosis.md)
approved this exact contract with no finding for one later non-executing
implementation task. It did not approve execution.

## Docker-free implementation candidate

The approved implementation task is complete. It restores both P2-V12
fail-closed invariants, activates only the reserved `20260720-01` tuple, and
adds the bounded `p2-vite-progress/v1` collector. The runner emits only the
ordered seven-stage prefix; the executor incrementally retains only its closed
projection across arbitrary chunks and preserves it in
`p2-vite-attempt/v3`. Success requires the complete prefix plus the existing
terminal success frame. Receipts and pair projections now use v3, while
progress remains diagnostic and cannot establish settlement, authorize cleanup
or evidence access, create a receipt, or complete a pair.

The focused regressions cover post-close residue rejection, the unknown-child
cleanup barrier, every retained prefix, malformed/duplicate/reordered/identity-
mismatched/oversized/post-terminal input, attached-start timeout at every
prefix, output overflow, terminal-frame failure, first-failure/cleanup
ordering, permissive-first pair stop, exact new identity acceptance, and all
old/static tuple rejection. Codegen tests remain in the full P2 suite and its
tracked implementation/evidence paths were not changed.

Candidate tracked identities are:

| Target | SHA-256 |
|---|---|
| `containers/presentation-profiles/src/plan.ts` | `a51227f045c77f3b3f23fa310413d57078c689a2d53a5f5d3336ff3374ae87aa` |
| `containers/presentation-profiles/src/vite-projection.ts` | `ced7b9572f862d77283a44ac453b570c469b5a085635c7330bd768df9cf26ca2` |
| `containers/presentation-profiles/src/vite-executor.ts` | `18cef6133fdb82f7ab8cb176d435d107a8db2cc6d24a3c449d4e9eb6cba81818` |
| `containers/presentation-profiles/runner/vite-executor-entry.js` | `daeee923a7887fc7747c39058a5d59a4b02bdcca55a3692653b2980d16d02dc9` |
| `containers/presentation-profiles/runner/vite-executor-entry.d.ts` | `1246122cc5cbda3b9a50872e3f25451aecfb0e9df4b2103718564b4d86532e10` |
| `containers/presentation-profiles/runner/vite-runner.js` | `e590a23b1a81da97cccde3017bdf8f707bb00821135d48fae2fdb13f29b2a934` |
| `containers/presentation-profiles/runner/vite-runner.d.ts` | `00680f692ef3f31f1cf1b9e6b57e29c6d6041acfb67188fd2ba232f98fbfbf20` |
| `containers/presentation-profiles/runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `containers/presentation-profiles/runner/vite-staging.d.ts` | `2fa86743232202602ad7d5a60745d1e12b68050c9d8e084b091fbe70ebd316d4` |
| `containers/presentation-profiles/test/plan.test.ts` | `05a1b59477184a1cfbaea1bd5fd68bd57b586231cae3062870b2fe9e1d38ca06` |
| `containers/presentation-profiles/test/vite-projection.test.ts` | `cb9718d99e696cdd42cecbc21889e441d31be030e257e34a3afecff3bb331ccb` |
| `containers/presentation-profiles/test/vite-runner.test.ts` | `98a398dbaff65bbd7e2929b99c4f5b98376e06305ab8c3d56ec3a6426bbb8112` |
| `containers/presentation-profiles/test/vite-executor.test.ts` | `bd331ac0a71e0464805771d0dea472093c62d731139d5096c07440f814917e7e` |
| `containers/presentation-profiles/test/vite-staging.test.ts` | `b7a4a5bde14dfb093da8882f37667f099fe9f0c7b469695f9f5059be9c42d0d0` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `cab4afe7954cb6e10473831b70a0c148ce15be0596157ebf2aa35131f3a6654c` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `272cf2ce33a9ada16ea393a200569cd720055f4b67e9e9f79cd7532602d588b9` |
| root `package.json` | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |

The argument-free staging command rebuilt exactly 128 regular non-symlink
files. Every target is source-equal and has its fixed `0444` or `0555` mode.
The SHA-256 of the plan-order canonical JSON array of
`{targetPath,mode,sha256}` records is
`43d74ca73188ab734ad459766401882193d22228f2d70715b2e86767a1791268`
(`plan-order-json[path,mode,sha256]/v1`). The staged versions are Node.js
`v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.

Observed Docker-free verification:

- `npm run p2:build`: exit 0.
- Focused Vite plan/staging/runner/projection/executor tests: 5 files, 113
  tests passed.
- Focused M2-D scenario-context test: 1 file, 15 tests passed.
- `npm run p2:typecheck`: exit 0.
- `npm run p2:test`: 9 files, 152 tests passed, including all codegen tests.
- `npm run p2:verify`: exit 0; typecheck and the same 9 files / 152 tests
  passed.
- `npm run m2d:verify`: exit 0; 12 files, 79 tests passed.
- `npm run p2:stage:vite`: exit 0 and reported 128 staged files; the compiled
  verifier then accepted the exact inventory, bytes, and modes.
- Compiled executor/entry import check: exit 0 with no import-time execution.
- Root `npm run check`: exit 0; format, lint, typecheck, and 103 files / 743
  tests passed.

No Docker/container command, runtime socket, result-root check/access/creation,
retained-state access, external network, credential, Remote Git, publication,
deployment, Expected outcome change, Observed promotion, experiment-matrix
change, or codegen/P3/P4/M4 evidence mutation occurred. Standing authorization
was not used because this task reached no repository-recorded runtime execution
gate.

The
[`fresh independent Docker-free execution-gate review`](reviews/p2-vite-new-measurement-execution-gate.md)
reproduced the candidate hashes, exact staging identity, fixed command,
protected-path non-change, and only the two exact new-root absence checks. It
found no finding and approved only one later argument-free
`npm run p2:execute:vite` invocation with no retry. It did not run Docker or use
standing authorization.

## Exact one-shot execution outcome

A fresh worker reproduced all seventeen approved hashes, the exact 128-file
source-equal fixed-mode staging tree and
`43d74ca73188ab734ad459766401882193d22228f2d70715b2e86767a1791268`
manifest, the fixed Node.js/Vite/Rollup/esbuild versions, the argument-free
package script, and absence of both exact new roots. It then used the
`continue-repository-work` standing authorization for exactly one
`npm run p2:execute:vite` pair attempt. This was not a separate human review.
The command exited 1, was not retried, and no Docker command outside the fixed
executor sequence was invoked.

The bounded entry projection is `inconclusive`: pair schema
`p2-vite-pair/v3`, Expected revision
`p2-vite-expected-20260720-01`, null image ID, and issue
`PAIR_IDENTITY_MISMATCH`. Only `vite-observe-p` appears. Its attempt record is
written, evidence is `not-inspected`, no receipt is written, and the two issues
are `P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED` and
`P2_ATTEMPT_OUTPUT_NOT_INSPECTED`.

An exact-path Docker-free check found the permissive root as a non-symlink mode
`0700` directory. Its canonical non-symlink mode `0600`, 823-byte
`p2-vite-attempt/v3` record has SHA-256
`9175487c2ed92eb8265e9047c362bc1d0a42d79e1911ba951fcf235530f6eada`.
It retains primary `attached-start / P2_EXECUTOR_DOCKER_TIMEOUT`, the approved
image ID, null container exit, known Docker CLI settlement, runner settlement
`not-established`, completed cleanup, null runner disposition, and output
`not-inspected`. Its `p2-vite-progress/v1` projection is a `valid-prefix` with
exact stages `runner-entered`, `inputs-prepared`, `service-ready`, and
`child-launched`. The exact permissive `summary.json` and constrained root are
absent.

These are observed Inconclusive attempt facts. The prefix establishes that the
runner reached a valid child launch before the host-side attached-start
timeout; it does not establish child settlement, the lower-level timeout cause,
a capability outcome, a receipt, or a same-image pair. The worker did not
inspect an evidence subtree or historical result/container state, change a
retained permission, pull an image, access a runtime socket, use external
network or credentials, access frozen M4 state, perform Remote Git, publish, or
deploy. Expected, selected Vite Observed, experiment-matrix Observed, and the
accepted codegen/P3/P4 evidence remain unchanged.

The
[`fresh Docker-free result review`](reviews/p2-vite-new-measurement-result.md)
reproduced the seventeen approved source identities, canonical v3 bytes,
fixed-path modes/hash/absence, and pure bounded projection. It accepted the
record only as the fourth immutable Inconclusive attempt and retained the
four-stage prefix as diagnostic secondary state. The tracked talk projection
now lists all four attempts without changing selected Vite or
experiment-matrix Observed.

Next: none.
