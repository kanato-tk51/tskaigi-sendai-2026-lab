# P2 selected Vite `20260720-02` detached-transfer contract review

## Review target and decision

- Target: the proposed Docker-free detached lifecycle and durable progress
  contract in
  [`p2-vite-detached-transfer-contract.md`](../p2-vite-detached-transfer-contract.md)
- Review type: fresh independent Docker-free tracked-source/static contract
  review
- Decision: **BLOCKED; do not implement, stage, or execute this contract**
- Blocking findings: P2-DT01 through P2-DT05
- Non-blocking findings: none
- Docker execution or execution gate: not approved and not performed
- Selected Vite and experiment-matrix Observed: unchanged and unmeasured

The historical diagnosis is sound: the accepted `20260720-01` bytes establish
an identity-bound prefix through `child-launched`, settlement of the host
attached-start CLI, and no child, runner, or container settlement. The proposed
separation of Docker CLI, container, runner, child, transfer, receipt, and
same-image predicates is also directionally correct. No reviewed historical
fact supports a lower-level timeout cause.

The proposed implementation contract is nevertheless blocked. Its fixed
filesystem mode cannot support its required directory durability operation;
its transition graph can turn the previously rejected post-close-residue path
back into child success; several required terminal/failure branches are not
closed; the detached-start failure path has no exact next-command rule; and the
declared runner-only writer boundary is not enforced against the same-UID Vite
child. These are contract findings. They must not be repaired in this review
session.

## Blocking findings

### P2-DT01 — `0733` does not establish the required directory-sync capability

The host-created progress directory is fixed at mode `0733`, while host numeric
ownership is explicitly not accepted as evidence. A non-owner container user
therefore has write and search permission but no read permission. The
publication algorithm separately requires opening and syncing the directory
after every rename. On the reviewed Node/Linux boundary, an `O_RDONLY |
O_DIRECTORY` open without the applicable directory read bit fails with
`EACCES`; an `O_PATH` descriptor cannot satisfy `fsync`.

A repository-local Docker-free assertion reproduced `directory-open=EACCES`
for a directory whose effective owner class had write/search but no read bit.
The proposed implementation could therefore fail its first publication even
when file creation and rename are permitted. The contract must fix a feasible
mode/ownership/open strategy or remove and replace the directory-sync claim;
it may not assume an unreviewed host-to-container ownership mapping.

### P2-DT02 — the graph permits post-close residue to become success

The accepted runner boundary treats a natural `0 / null` child close followed
by a still-present process group as known `P2_CHILD_FAILED`, even when bounded
`SIGKILL` later proves group absence. Current tracked source throws that known
failure, and its behavioral regression proves output verification is skipped.

The proposed natural-close path instead permits
`child-close-observed: exit-0`, optional `child-force-sent`,
`child-group-absent`, and `child-settled`. Its stated success predicate requires
only exit 0, no `child-failure-detected` record, and group absence. Because the
closed values contain no post-close-residue failure marker, that exact rejected
path satisfies `child-settled: success` and may proceed to successful terminal
publication. This reopens P2-V03. The remediated graph must make post-close
residue a closed known-failure transition that cannot reach output export or a
completed terminal.

### P2-DT03 — terminal and transition consistency is not closed

Only the three post-`child-watch-armed` paths are enumerated. The contract does
not define the exact valid record/terminal relation for pre-service failure,
spawn throw, invalid process-group identity, natural nonzero close, server
settlement failure, output validation failure, or a failed progress
publication. It also says only that terminal status must be
"cross-consistent" with inspected container exit without fixing the accepted
exit mapping, and it does not fix which close dispositions are accepted for
each `deadline`, `output-limit`, or `process-error` branch.

Those omissions leave both writer behavior and host sequence validation open
to incompatible implementations. Remediation must provide a closed transition
table or equivalent executable predicates for every reachable prefix,
terminal shape, runner exit, and settlement code, including the distinction
between no child, known child failure, and unknown child settlement.

### P2-DT04 — known-settled detached-start failure has no exact host branch

The sequence starts `docker wait` only after successful detached start, then
permits final inspect only after the wait CLI is known settled. It does not say
what exact inspect/remove/progress actions follow when detached start itself
returns nonzero, malformed bounded output, timeout, or another known-settled
failure. A container may be still created or may have started despite a failed
host command, so choosing direct removal, one inspect, or no later command is a
material lifecycle decision.

Remediation must define the known- versus unknown-settlement branches for
detached start, including whether the one final inspect is permitted, when the
fixed remove is required or suppressed, whether the progress writer is known
stopped, and which canonical attempt fields/issues result. Unknown CLI
settlement must remain the existing no-later-command/no-filesystem barrier.

### P2-DT05 — the runner-only writer statement is not an enforced boundary

The proposed progress directory is mounted read-write into the same container
that runs both the runner and its Vite child. Both execute as `65532:65532`, and
the two fixed progress names are known. Directory mode `0733` prevents listing
but permits same-identity creation, replacement, and deletion by the child;
file mode `0444` also does not prevent the owning same-UID process from changing
mode. The mount and modes therefore do not establish that the runner is the
only writer.

This matters because a valid completed snapshot participates in runner/child
settlement, evidence access, receipt, and eventual Observed predicates. The
contract must either add a reviewed writer-isolation mechanism or explicitly
bind the artifact to the repository-owned cooperative fixture as a static
trust assumption and prevent it from being presented as an adversarial
integrity boundary. The chosen boundary and its focused negative assertions
must be fixed before implementation review.

## Independently traced evidence

The tracked runner emits `child-launched` only after `spawn()` returns a
positive process-group ID. Its current callback runs before close/error/output
observers and the child deadline are installed, which supports the proposed
need for a distinct durable `child-watch-armed` checkpoint. The accepted result
review records only the four-stage `p2-vite-progress/v1` prefix and the
host-side attached-start timeout; it does not establish any later runner or
child transition.

The current child lifecycle and focused tests separately establish:

- natural exit 0 is success only with immediate process-group absence;
- post-close residue remains known `P2_CHILD_FAILED` after bounded force
  settlement;
- timeout/output/process failure requires the accepted TERM/KILL close and
  group-absence predicates; and
- missing or contradictory close and force-bound residue remain unknown.

These are static/unit boundaries, not facts about the exhausted runtime
attempt. The proposed `20260720-02` identities do not appear in tracked
implementation. They remain Expected-only reserved identities.

## Evidence classification and unresolved runtime facts

- **Observed Inconclusive history:** the reviewed `20260720-01` attempt has a
  valid prefix through `child-launched`, known host Docker CLI settlement,
  completed force-removal, no receipt, and no constrained root.
- **Static/unit evidence:** current source and tests establish the positive-PGID
  checkpoint, accepted child close/group rules, fixed bounds, and current
  `20260720-01` implementation identity.
- **Configuration intent only:** detached start/wait/inspect/remove, durable
  progress v2, the `20260720-02` tuple, and every proposed receipt/Observed
  predicate.
- **Still unresolved:** child close and group disposition, runner/container
  settlement, the lower-level timeout cause, output export, every Vite
  capability outcome, the constrained member, and a same-image pair.

## Exact blocked boundary and next contract task

No executor, runner, plan, schema, staging, result-root, Docker command, or
execution gate may be added from this contract. The next task is limited to a
Docker-free contract remediation that:

1. makes atomic publication and directory durability feasible without assuming
   host numeric ownership;
2. closes every record/terminal/exit/settlement branch and preserves
   post-close residue as known failure;
3. fixes the complete detached-start and wait failure command graph;
4. fixes or explicitly narrows the progress-writer trust boundary; and
5. corrects the identity-count wording and records exact create-mount/attempt
   implications needed by the closed graph.

That remediation may change only the contract, its prompt/status metadata, and
small Docker-free source assertions. A later fresh independent re-review must
decide whether one implementation task is approved. Staging, Docker, execution,
result access, receipt acceptance, and Observed promotion remain later gates.

## Verification observed and safety boundary

| Command or assertion | Observed result |
|---|---|
| Applicable `AGENTS.md`, documentation, prompts, tracked runner/executor/tests, and accepted result-review inspection | Completed without invoking Docker, a build, a lifecycle fixture, staging, or a result-root read. |
| Tracked exact `20260720-02` implementation-identity scan | Exit 1 with no matches; the new tuple remains absent from tracked implementation. |
| Effective no-read directory-open assertion | Exit 0 and printed `directory-open=EACCES`; the task-owned empty directory was restored and removed. |
| `git diff --check` before review edits | Exit 0. |
| Focused Prettier check over the contract/review/prompt/status files | Exit 0; all named files matched repository formatting. |
| `git diff --check` after review edits | Exit 0. |

An initial broad tracked-source search was incorrectly scoped to all of
`containers/` and traversed ignored generated Vite staging paths, returning
matching source-line snippets. It did not read a result root, print evidence
bytes, or mutate staging, and none of this review's evidence or findings relies
on those matches; the subsequent assertions use exact tracked paths and
`git grep`. This review therefore does **not** claim that no ignored staging
access was attempted.

No Docker/container command, runtime socket, probe/lifecycle fixture, build,
staging operation, result-root or evidence-subtree access, new-root creation,
external network, credential, Remote Git, publication, deployment, or third-
party communication was used. Standing authorization was not needed because
the review reached no repository-recorded execution gate. No broad verification
was run merely to repeat prior reports.

Next: remediate P2-DT01 through P2-DT05 under
`prompts/p2-vite-detached-transfer-contract-remediation.md`, then request a
fresh independent contract re-review before any implementation or staging.

## Remediation re-review (2026-07-20)

### Decision

- Review type: fresh independent Docker-free tracked-source/static contract
  re-review
- Decision: **BLOCKED; P2-DT03 remains open and implementation is not
  approved**
- Closed findings: P2-DT01, P2-DT02, P2-DT04, and P2-DT05
- Open finding: residual P2-DT03 force-transition closure
- New non-blocking findings: none
- Docker execution or execution gate: not approved and not performed
- Selected Vite and experiment-matrix Observed: unchanged and unmeasured

The remediation makes the publication directory feasible for the fixed
non-root writer, prevents a post-close-residue path from becoming success,
closes the detached host command graph, and states the progress writer as a
cooperative-fixture trust assumption with an explicit limitation marker.
Those four boundaries are sufficient at contract scope.

The claimed exhaustive runner table is not yet closed. It defines
`child-force-sent` values `sent` and `group-already-absent`, but leaves two
reachable force-settlement transitions without one exact record suffix:

1. After a natural close, `child-residue-detected` may be published and the
   process group may disappear before force delivery. The table's known-failure
   residue row requires `child-force-sent: sent`; it does not admit
   `group-already-absent`, while the following unknown row covers a group that
   fails to disappear, a failed force operation, or a signal close. The race
   therefore has no exact valid sequence even though the detected residue must
   remain known `P2_CHILD_FAILED` and must not reach output export.
2. On a deadline/output/process failure, an accepted `SIGTERM` close may arrive
   while the process group is still present. The tracked accepted lifecycle
   then sends `SIGKILL` and can establish final group absence. The table's
   accepted-TERM-close row omits `child-force-sent`, while its force row applies
   only when TERM grace expires and the accepted close is `SIGKILL`. It does
   not say whether `sent` or `group-already-absent` is valid for the reachable
   post-TERM-close force step.

Because the table labels itself exhaustive and is the future writer and host
validator contract, omitting these branches permits incompatible publication
and validation implementations. The broad fallback cannot resolve the gap
without either discarding an otherwise accepted known-settlement transition
or silently omitting a force action from the durable record. This is the
residual part of P2-DT03, not runtime evidence and not a repair performed by
this review.

### Closure of the other findings

- **P2-DT01 closed:** mode `01777` supplies the non-owner read/write/search
  permissions required by the fixed `O_RDONLY | O_DIRECTORY | O_NOFOLLOW`
  directory descriptor while retaining same-directory rename, file/directory
  sync, stable read, and explicit crash-invalidity rules without numeric host
  ownership evidence.
- **P2-DT02 closed:** `child-residue-detected` is excluded from the only
  completed path. A force-settled residue is a child known-failure and cannot
  reach `child-settled: success`, `output-exported`, or a completed terminal.
- **P2-DT04 closed:** detached start, wait, one final inspect, and removal each
  have exact known/unknown CLI-settlement consequences. Unknown settlement
  suppresses later Docker and filesystem actions; diagnostic transfer requires
  a stopped writer; first failure and attempt-write barriers remain explicit.
- **P2-DT05 closed:** the same-UID writable mount is expressly not an
  adversarial integrity boundary. Negative source/plan assertions and the
  `repository-cooperative-fixture` marker constrain every later attempt,
  receipt, pair, and talk projection from implying OS writer isolation.

The four identity fields, exact progress-mount position, unchanged time/output
bounds, v4 gates, permissive-first stop rule, and `20260720-02` separation are
otherwise internally consistent. These are configuration/static conclusions;
no runtime enforcement or capability fact is established.

### Verification and safety boundary

| Command or assertion | Observed result |
|---|---|
| Applicable instructions, active P2 records, contract/remediation prompts, tracked runner/plan/tests, workflow, and threat-model inspection | Completed without invoking Docker, a build, staging, a lifecycle fixture, or a result-root read. |
| Exact force-transition table/source comparison | Reproduced both unbound force-settlement branches above; the accepted tracked runner can force-settle a group after an accepted TERM close. |
| Tracked implementation scan for `20260720-02` | No tracked implementation binding exists; the generation remains configuration intent. |
| `git diff --check` and focused Prettier check | Exit 0; all named tracked and untracked review/handoff files matched repository formatting. |

No Docker/container command, runtime socket, probe/lifecycle fixture, build,
unit suite, staging operation or input, ignored result, result-root or evidence
subtree, new result root, external network, credential, Remote Git,
publication, deployment, or third-party communication was used. Standing
authorization was not needed because this review reached no
repository-recorded execution gate.

No executor, runner, plan, schema, staging, or test implementation is approved.
The next task is limited to adding exact known/unknown record suffixes for the
two residual force transitions, preserving P2-V03 and every fixed bound, then
requesting another fresh Docker-free contract re-review.

Next: remediate only residual P2-DT03 under
`prompts/p2-vite-detached-transfer-contract-residual-remediation.md`.

## Residual P2-DT03 remediation re-review (2026-07-20)

### Decision

- Review type: fresh independent Docker-free tracked-source/static residual
  contract re-review
- Decision: **APPROVED for one later bounded Docker-free implementation task;
  staging and execution are not approved**
- Closed finding: residual P2-DT03 force-transition closure
- Previously closed findings unchanged: P2-DT01, P2-DT02, P2-DT04, and P2-DT05
- Remaining blocking findings: none
- New non-blocking findings: none
- Docker execution or execution gate: not approved and not performed
- Selected Vite and experiment-matrix Observed: unchanged and unmeasured

The remediated table gives each of the two previously unbound races one exact
known-failure suffix for every accepted force disposition. Its broad fallback
retains failed delivery, contradictory or missing close, and unproved final
group absence as unknown settlement. The table and validator contract are now
exhaustive and contradiction-free at configuration scope.

This is an independent Codex review, not a separate human review. It establishes
only that one later implementation task may encode the approved contract; it
does not establish implementation correctness or any runtime fact.

### Independently reproduced residual closure

For natural `exit-0` or `exit-nonzero` with a durably detected post-close
process-group residue, the only known-settlement suffixes are:

```text
child-close-observed: exit-0|exit-nonzero
child-residue-detected: post-close-group-present
child-force-sent: sent|group-already-absent
child-group-absent: confirmed
child-settled: known-failure
service-settled: closed|not-started
terminal: P2_CHILD_FAILED / known / null
runner exit: 1
```

Both force dispositions require final group absence and retain the accepted
P2-V03 boundary. Once `child-residue-detected` exists, no later disappearance
can reach `child-settled: success`, `output-exported`, a completed terminal,
regular evidence access, a receipt, constrained setup, or pair completion.

For `deadline`, `output-limit`, or `process-error` followed by an accepted TERM
delivery and `SIGTERM` close while the group remains, the only known-settlement
force suffixes are:

```text
child-failure-detected: deadline|output-limit|process-error
child-terminate-sent: sent
child-close-observed: sigterm
child-force-sent: sent|group-already-absent
child-group-absent: confirmed
child-settled: known-failure
service-settled: closed|not-started
terminal: original mapped failure code / known / null
runner exit: 1
```

The terminal retains `P2_CHILD_TIMEOUT`, `P2_OUTPUT_LIMIT`, or
`P2_CHILD_FAILED` respectively. A completed signal delivery must publish
`sent`, and a pre-delivery absence must publish `group-already-absent`, before
any later close, absence, settlement, or service record. Failed delivery adds
no false signal record and, together with missing/contradictory close or
unproved final absence, reaches only the existing unknown-settlement terminal.

The current tracked runner independently demonstrates both transition shapes:
the close-first branch detects post-close residue before bounded KILL
settlement, and the failure-first branch can receive an accepted `SIGTERM`
close, observe the group still present, then perform bounded force settlement.
That source evidence establishes reachability only; the v2 writer and validator
do not yet exist.

### Bounds and unchanged findings

A Docker-free canonical-serialization assertion enumerated all nine 12-record
paths: three bounded failure values across both post-`SIGTERM` force
dispositions, plus the three TERM-grace/accepted-`SIGKILL` paths. Each uses 12
of 13 records. Their canonical line sizes range from 1,082 to 1,102 bytes; the
maximum is the constrained `process-error` plus
`group-already-absent` path. The independently reconstructed 10-record
completed constrained line remains the byte-longest valid line at 1,158 of
4,096 bytes. No timeout, Docker-output, progress, event, or output limit changed.

No new contradiction reopens the previous closures:

- P2-DT01 retains exact mode `01777`, the non-root readable directory
  descriptor, same-directory atomic replacement, sync, stable host read, and
  explicit crash-invalidity rules without numeric ownership evidence.
- P2-DT02 retains post-close residue as known failure only.
- P2-DT04 retains the closed detached start/wait/final-inspect/remove graph,
  all-CLI-settled and writer-stop transfer gate, first-failure rule, and
  no-filesystem barrier after unknown CLI settlement.
- P2-DT05 retains the explicit `repository-cooperative-fixture` trust marker
  and negative static assertions; the same-UID mount remains expressly not an
  adversarial integrity boundary.

The corrected four identity fields, exact create-mount position, v4 attempt/
receipt/pair gates, permissive-first rule, exact `20260720-02` separation, and
terminal-to-container-exit mapping remain internally consistent.

### Evidence classification, verification, and approved boundary

| Command or assertion | Observed result |
|---|---|
| Applicable instructions, active P2 records, contract/remediation history and prompts, tracked runner/tests, workflow, and threat-model inspection | Completed without invoking Docker, a build, staging, a lifecycle fixture, or result-state access. |
| Exact tracked runner/source comparison | Reproduced both residual force-transition shapes; this is reachability/static evidence only. |
| Tracked non-document implementation scan for `20260720-02`, `p2-vite-progress/v2`, and the cooperative trust marker | No matches; the approved generation remains unimplemented configuration intent. |
| Canonical longest-path serialization assertion | Exit 0; all nine record-longest paths used 12 records and at most 1,102 bytes, while the completed line used 10 records and 1,158 bytes. |
| `git diff --check` before review edits | Exit 0. |
| Focused Prettier check over the five review/handoff documents | Exit 0; all files matched repository formatting. |
| `git diff --check` after review edits | Exit 0. |

Observed history remains limited to the immutable `20260720-01` Inconclusive
attempt and its prefix through `child-launched`. Child, runner, and container
settlement, lower-level cause, output export, capabilities, the constrained
member, same-image pairing, and adversarial writer isolation remain
unestablished.

An initial broad `find . -name AGENTS.md -print` was incorrectly scoped to the
repository root and attempted to traverse ignored retained-result
subdirectories. It emitted permission-denied warnings, read no retained file
contents, changed no state, and supplies no evidence to this decision.
Subsequent inspection used exact tracked instruction, documentation, prompt,
runner, and test paths. This review therefore does not claim that no ignored
result-directory traversal was attempted.

The approved next boundary is exactly one Docker-free implementation of the
fixed `20260720-02` bindings, create mount and detached host graph,
`p2-vite-progress/v2` atomic writer/stable reader, closed transition validator,
v4 attempt/receipt/pair gates, cooperative-fixture negative assertions, focused
tests, and exact 128-file staging rebuild. A fresh execution-gate review is
still required before Docker. This review does not approve a runtime command,
result-root access, receipt acceptance, presentation promotion, or `Observed`
change.

No Docker/container command, runtime socket, probe/lifecycle fixture, build,
unit suite, staging operation/input, retained result content, evidence subtree,
external network, credential, Remote Git, publication, deployment, third-party
communication, or frozen M4 state was used. Standing authorization was not used
because this review reached no repository-recorded runtime approval gate.

Next: implement the independently approved `20260720-02` detached lifecycle
and durable-transfer contract without Docker, including focused tests and the
exact staging rebuild, then submit the candidate to a fresh Docker-free
execution-gate review before any runtime action.
