# P2 selected Vite `20260720-01` diagnosis independent review

## Review target and decision

- Target: the Docker-free diagnosis and exact bounded measurement contract in
  [`p2-vite-new-measurement-diagnosis.md`](../p2-vite-new-measurement-diagnosis.md)
- Review type: fresh independent Docker-free tracked-source/static review
- Decision: **APPROVED for one later Docker-non-executing implementation task**
- Blocking findings: none
- Non-blocking findings: none
- Docker execution or execution gate: not approved and not performed
- Selected Vite and experiment-matrix Observed: unchanged and unmeasured

The diagnosis keeps the three accepted runtime attempt records separate from
static source findings and does not convert a missing lower-level cause into a
demonstrated fact. The `20260719-03` record establishes only the host-side
`attached-start / P2_EXECUTOR_DOCKER_TIMEOUT` boundary and its closed Docker CLI
settlement; it does not establish the container, runner, child, filesystem,
server, or attach-transport cause below that boundary. The proposal correctly
blocks an unchanged fourth replay.

The exact remediation is approved only as a non-executing implementation
contract. It restores the previously accepted fail-closed child/cleanup
invariants, adds a bounded sanitized progress prefix without increasing any
timeout or output ceiling, keeps command failure primary, and cannot turn
progress, missing evidence, or one incomplete permissive outcome into a
receipt, pair completion, or capability observation. A separate fresh gate
review remains required before any Docker command.

This review changed no implementation, runner, adapter, probe, staging,
Expected, Observed, codegen/P3/P4 evidence, experiment matrix, or M4 byte.
Review-owned changes are this record and minimal status/handoff metadata.

## Independently traced evidence

### Three immutable attempt classes

| Attempt | Independently reproduced tracked boundary | Review conclusion |
|---|---|---|
| `20260719-01` | The accepted failure review records command exit 1, generic `P2_EXECUTOR_FAILED`, permissive-only partial metadata, no canonical attempt/receipt, and no constrained root. | The later P2-V04 through P2-V06 findings demonstrate a source mechanism that could lose lifecycle state, but they do not recover this attempt's first failed stage or settlement. |
| `20260719-02` | The accepted attempt review records canonical v1 with the approved created-state image, null final exit/runner, known Docker settlement, completed cleanup, `not-inspected` output, no receipt, and no constrained root. | The failure lies after created-state validation and before a retained valid exited-state result; attached start versus later inspect/framing remains unknown. |
| `20260719-03` | The accepted result review records canonical v2 primary `attached-start / P2_EXECUTOR_DOCKER_TIMEOUT`, null final exit, known Docker CLI settlement, runner settlement `not-established`, completed cleanup, no receipt, and no constrained root. | The host-side attached-start timeout is demonstrated. No retained record establishes an inner runner phase or lower-level runtime cause. |

The `20260719-03` reviewed source snapshot was also reproduced directly from
tracked commit `3c54135`: the executor, runner, projection, plan, and M2-D
context hashes match the accepted result-review table. That source fixes the
60,000 ms attached-start deadline, 1,000 ms Docker settlement, 16,384-byte
combined Docker output, known-settled failure handling, at most one final
inspect, and fixed cleanup path. The runner independently fixes the 30,000 ms
child deadline, 500 ms TERM grace, 1,000 ms force settlement, and 1,000 ms
server settlement. Preparation, listen, export, scheduling, Docker attach, and
transport are outside that 32.5-second controlled-child sum, so the timeout
ordering is static evidence rather than proof of completion or cause.

### Current tracked regressions and diagnostic gap

The tracked diff from accepted commit `3c54135` to `HEAD` independently
reproduces both P2-V12 regressions named by the diagnosis:

1. `executeBoundedChild()` no longer rejects a process group that existed after
   natural `0 / null` close but disappeared after bounded `SIGKILL` settlement.
   The current focused test explicitly accepts the path and proceeds through
   server close and output verification.
2. `executeSettledViteLifecycle()` no longer returns immediately after unknown
   child settlement. The current focused test records `server-close` before the
   original unknown-settlement failure is rethrown.

The same current runner still emits only one terminal success or failure frame,
while the current host collector clears raw stdout/stderr after timeout,
overflow, or process failure. Therefore no current tracked checkpoint can
distinguish input preparation, service readiness, child launch/settlement,
service settlement, or output export beneath another attached-start failure.
These current static findings block implementation/execution as-is but are not
retroactive causes of `20260719-03`.

## Approved contract boundary

The later implementation task is approved only when it performs all of the
following without Docker:

1. restore rejection of force-settled post-close residue as known
   `P2_CHILD_FAILED`, skip output verification on that path, and preserve the
   unknown-child-settlement barrier before loopback/evidence cleanup;
2. emit and incrementally parse only the exact ordered
   `p2-vite-progress/v1` prefix from `runner-entered` through
   `output-exported`, with the fixed identity, line/count/byte bounds, arbitrary
   chunk handling, and raw-field exclusion in the reviewed contract;
3. require the existing terminal frame, complete `0..6` progress for success,
   and fail closed on malformed, duplicated, reordered, identity-mismatched,
   oversized, settlement-inconsistent, or post-terminal progress;
4. persist only the closed `p2-vite-attempt/v3` progress projection, retain the
   original command stage/code as primary, and keep progress unable to
   establish settlement, authorize evidence access, create a receipt, or
   manufacture pair completion;
5. keep every existing timeout/output/event bound and permissive-first pair
   stop rule unchanged, and require two complete exact-identity receipts with
   the reviewed image before `same-image`;
6. cross-bind only Expected `p2-vite-expected-20260720-01`, runs
   `p2-vite-observe-p/c-20260720-01`, and containers
   `tskaigi-p2-vite-observe-p/c-20260720-01`, while rejecting all three
   immutable historical tuples and current unobserved `20260719-11`; and
7. add all ten Docker-free acceptance regressions recorded by the diagnosis,
   preserve codegen/P3/P4 and M4 bytes/evidence, and rebuild only the reviewed
   source-equal fixed Vite staging candidate.

The five reserved `20260720-01` identities are exact and do not currently
appear in implementation or accepted evidence. They remain reserved rather
than active. The identity revision does not change the existing 15-event
Expected order/count/outcome contract.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Focused current `vite-runner.test.ts` regression selection | Exit 0; 1 file, 2 tests passed, 18 skipped. It reproduced acceptance of force-settled residue and the current `server-close` call after unknown child settlement. |
| Tracked `3c54135` source SHA-256 reconstruction | Exit 0; the five historical executor/runner/projection/plan/context hashes reproduced the accepted `20260719-03` result-review identities. |
| `git diff --unified=0 3c54135..HEAD` over the Vite runner | Exit 0; it reproduced deletion of the post-close-residue rejection and movement of the unknown-settlement return barrier below server close. |
| Current source/bound static assertion | Exit 0; current residue rejection is absent, outer timeout remains 60,000 ms, Docker output remains 16,384 bytes, and the active static tuple remains unobserved `20260719-11`. |
| Initial reserved-identity scan | Exit 1 because the reviewer-authored pattern was too broad and matched unrelated fixed M4 control IDs ending in `20260720-01`; no state changed and no P2 conclusion uses that scan. |
| Corrected exact P2 Vite reserved-identity scan | Exit 0; none of the five exact reserved identities appears in implementation or accepted evidence. |
| Protected-path tracked diff assertion | Exit 0; implementation, Expected/Observed, experiment matrix, presentation evidence, and accepted codegen/P3/P4 files were unchanged. |

No Docker/container command, runtime socket, retained or ignored runtime state,
evidence subtree, staging rebuild, new-root check or creation, external network,
credential, Remote Git, publication, or deployment was used. The
`continue-repository-work` standing authorization was not used because this
review reached no repository-recorded execution gate. This is an independent
Codex review, not a separate human review.

Next: implement the exact approved P2-V12/P2-V13 Docker-free remediation,
`p2-vite-attempt/execution/pair` v3 progress handling, and only the reserved
`20260720-01` bindings and focused regressions; rebuild fixed Vite staging, but
do not run Docker or create/check a result root.
