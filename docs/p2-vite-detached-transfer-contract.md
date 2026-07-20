# P2 selected Vite detached lifecycle and durable transfer contract

Status: **P2-DTG01/P2-DTG02 closed; exact one-shot execution gate exhausted;
fresh Docker-free result review accepts only the fifth immutable
Inconclusive attempt**

Contract date: 2026-07-20

## Decision and evidence boundary

The `20260720-02` generation contract replaces the selected-Vite host dependency on a
long-running attached start with a detached start, a separately bounded
container-settlement step, and a run-owned durable progress snapshot. This is
now implemented as described in the later status section, but it is not an
execution approval.

The fixed identities are:

| Role | Fixed identity |
|---|---|
| Expected revision | `p2-vite-expected-20260720-02` |
| permissive run/root | `p2-vite-observe-p-20260720-02` |
| constrained run/root | `p2-vite-observe-c-20260720-02` |
| permissive container | `tskaigi-p2-vite-observe-p-20260720-02` |
| constrained container | `tskaigi-p2-vite-observe-c-20260720-02` |

All earlier Expected revisions, run IDs, result roots, container names,
receipts, attempt records, and progress records are immutable historical
evidence. Later bindings must accept only the table above and reject every
earlier tuple. The accepted image, 128-file input closure, tool versions,
semantic Vite command, capability Expected values, output limits, and
constrained-child limitation remain unchanged. A later implementation must use
new attempt, receipt, and pair schema revisions and must not reinterpret a
prior result.

At contract publication no new runtime result existed. The later one-shot
execution described below does not by itself establish an accepted Docker,
container, runner, child, capability, same-image, writer-isolation, or
enforcement observation. Result access, receipt acceptance, and any `Observed`
promotion remain gated on a fresh independent result review.

## Why the attached transfer stopped at `child-launched`

The accepted `20260720-01` record establishes three different facts that must
not be collapsed:

1. The runner emitted a valid, identity-bound `p2-vite-progress/v1` prefix
   through `child-launched`. In the reviewed source, that checkpoint occurs
   only after `spawn()` returns a positive child process-group ID. It does not
   wait for a child close event or for the process group to disappear.
2. The host-side `docker start --attach` CLI exceeded its fixed 60,000 ms
   deadline, accepted `SIGKILL`, and produced the reviewed close disposition.
   This establishes settlement of that Docker CLI process only.
3. The later fixed inspect did not establish the required exited-container
   outcome. Force-removal then completed. The canonical attempt consequently
   retains a null container exit, runner settlement `not-established`, output
   `not-inspected`, no receipt, and no constrained root.

The attached command multiplexed two otherwise separate channels: Docker CLI
transport settlement and runner stdout/stderr transfer. Killing and settling
the CLI did not settle the container PID 1, the runner's child process group,
or the runner. Conversely, receiving `child-launched` proved only that the
runner reached that checkpoint before the stream stopped. No later checkpoint
was transferred before the host deadline.

The historical bytes therefore support only this interval:

```text
runner accepted a positive child process-group ID
  -> child/runner/container settlement not established
  -> host attached CLI reached its own fixed timeout and settled
```

They do not distinguish a child that remained live, an unobserved child close,
a runner stall, a container lifecycle delay, or an attach-transport failure.
The lower-level cause remains unknown. Reclassifying the prefix, extending the
timeout, or reading raw container logs would manufacture certainty that the
attempt does not contain.

## Exact result-root and create-mount contract

Before `docker create`, the host creates the existing fixed result, Docker
configuration, event, tool, and direct-write paths plus exactly
`<fixed-result-root>/progress`. The progress directory must be a non-symlink
directory, initially empty, and mode `01777`. Its two fixed child paths must be
absent. Numeric host ownership and host-to-container user mapping are neither
required nor accepted as evidence.

The later fixed create command adds exactly one writable bind mount. In the
argument array it occurs immediately after the existing fixed `/tmp` tmpfs and
before the existing read-only staging mount:

```text
--tmpfs /tmp:rw,noexec,nosuid,nodev,size=64m,uid=65532,gid=65532,mode=0700
--mount type=bind,src=<fixed-result-root>/progress,dst=/tmp/p2-progress
--mount type=bind,src=<fixed-vite-staging-root>,dst=/opt/p2/input,readonly
```

The remaining event, tool, and direct-write mounts retain their reviewed order
and modes. No other mount, environment key, argument, network option, runtime
socket, device, log channel, or caller-selected input is added. The exact
progress mount source is plan-derived from the active run root; a caller cannot
select or override it.

Mode `01777` deliberately supplies read, write, and search permission to the
fixed non-root writer without relying on numeric ownership. The sticky bit
does not isolate the runner from the same-UID child; that separate trust limit
is explicit below. It does make the required directory open feasible while
retaining a host-owned directory that the host can seal after writer stop.

## Exact detached host command graph

Every Docker CLI child inherits only the credential-empty fixed
`DOCKER_CONFIG`, uses `shell: false`, has a 16,384-byte combined stdout/stderr
ceiling, and uses the existing 1,000 ms post-`SIGKILL` CLI-settlement deadline.
Raw CLI output is parsed in bounded memory and discarded; it is never
serialized into an attempt or receipt.

For each plan the exact ordered lifecycle is:

1. Verify the fixed staging closure, all fixed run-path modes and absence
   predicates, and absence of only that exact result root before creating it.
2. Run the existing fixed `docker create` command with the progress mount above,
   then the existing created-state inspect. Bind the returned 64-hex container
   ID, configured image, image ID, exact container name, and `created` state.
3. Run exactly `docker start <fixed-container-name>` with no `--attach`. It uses
   the existing 20,000 ms Docker-command deadline. Success is exit 0, empty
   stderr, and exactly `<fixed-container-name>\n` on stdout.
4. Only after a successful detached start, launch exactly
   `docker wait <fixed-container-name>`. Its deadline is the remaining time
   before an absolute monotonic 60,000 ms container deadline measured from
   detached-start launch. Success is exit 0, empty stderr, and one canonical
   decimal container-exit line.
5. After a successful or known-settled failed wait, run exactly one final fixed
   inspect. After a known-settled detached-start failure, skip wait and run that
   same one final inspect. No path runs more than one final inspect.
6. If final inspect establishes `exited`, run the existing fixed force-remove
   only as cleanup. If it establishes a non-exited state, fails validation, or
   has a known-settled command failure, the same force-remove is the sole
   permitted termination operation. No stop, exec, logs, copy, attach, retry,
   or caller-selected command is added.
7. Transfer progress only after every launched Docker CLI is known settled and
   either the final inspect established `exited` or force-remove completed
   successfully. Write the canonical attempt before regular evidence access.
8. Access regular event/direct-write/tool output only for a receipt-pending
   attempt satisfying every success predicate below. A non-complete permissive
   outcome forbids constrained setup and execution.

The complete command-branch closure is:

| Command outcome | Exact next action | Filesystem/attempt consequence |
|---|---|---|
| create success with canonical ID | run created-state inspect | no progress or attempt access yet |
| create failure, CLI known settled, or malformed create output | stop; no later Docker command because ownership was not established | no progress read; write an Inconclusive attempt only after all CLIs are settled |
| create CLI settlement unknown | stop all later Docker and filesystem actions | no inspect, remove, progress read, or canonical attempt write |
| created-state inspect valid and exact | run detached start | bind ownership, created image, name, and state |
| created-state inspect known-settled failure or invalid result | stop; no remove because full ownership was not established | no progress read; write an Inconclusive attempt |
| created-state inspect CLI settlement unknown | stop all later Docker and filesystem actions | no start, remove, progress read, or canonical attempt write |
| detached start success | start wait | no progress or attempt access yet |
| detached start failure, CLI known settled | skip wait; run one final inspect | keep `detached-start` and its sanitized code primary |
| detached start CLI settlement unknown | stop all later Docker and filesystem actions | no inspect, remove, progress read, or canonical attempt write; bounded entry reports `attemptRecord: not-written` |
| wait success | run one final inspect | keep parsed wait exit for equality check |
| wait failure, CLI known settled | run one final inspect | keep `container-wait` and its sanitized code primary even if inspect later finds `exited` |
| wait CLI settlement unknown | stop all later Docker and filesystem actions | no inspect, remove, progress read, or canonical attempt write |
| final inspect valid `exited` | retain validated image/exit, then fixed remove | writer is stopped; diagnostic transfer is allowed after remove CLI settlement, even if known-settled cleanup fails |
| final inspect valid non-exited, invalid, or known-settled failure | fixed remove | transfer only if remove succeeds; otherwise record no transfer |
| final inspect CLI settlement unknown | stop all later Docker and filesystem actions | no remove, progress read, or canonical attempt write |
| remove success | no later Docker command | writer is stopped; diagnostic transfer allowed |
| remove known-settled failure | no later Docker command | transfer only if final inspect had already established `exited`; cleanup remains a closed secondary failure unless it was first |
| remove CLI settlement unknown | stop all filesystem actions | no progress read or canonical attempt write, even after an earlier exited inspect |

A Docker command timeout, output overflow, spawn/error, nonzero close, malformed
success output, or unexpected close always preserves its existing sanitized
`P2_EXECUTOR_DOCKER_FAILED`, `P2_EXECUTOR_DOCKER_OUTPUT`, or
`P2_EXECUTOR_DOCKER_TIMEOUT` code and known/unknown CLI settlement. The earliest
primary failure is never replaced by final inspect, cleanup, transfer, runner,
or evidence failure.

## Durable progress snapshot

### Fixed paths, writer descriptor, and atomic publication

The container sees exactly:

```text
/tmp/p2-progress/runner-progress.json
/tmp/p2-progress/runner-progress.next
```

At runner initialization, after fixed identity resolution, the runner
`lstat`s `/tmp/p2-progress`, requires a non-symlink directory with exact mode
`01777`, and opens it once with the platform equivalents of
`O_RDONLY | O_DIRECTORY | O_NOFOLLOW`. It retains the descriptor's device and
inode and requires the fixed directory path to resolve to that same non-symlink
directory before every publication. The opened descriptor is retained until
runner exit and is the descriptor synced after rename. File operations use
only the two fixed child paths and no-follow/exclusive flags below.

For every accepted transition the runner:

1. builds the complete next snapshot in memory and checks the record/byte
   bounds;
2. requires the fixed temporary name to be absent;
3. creates it exclusively without following a symlink, mode `0644`;
4. writes the whole canonical line, syncs it, applies `0644` for an
   intermediate snapshot or `0444` for a terminal snapshot, verifies the
   resulting regular-file mode, and closes it;
5. atomically renames the temporary name over the canonical name in the same
   opened directory; and
6. syncs the opened directory before beginning the next lifecycle action.

The canonical file is `0644` until the terminal transition and `0444` after a
terminal publication. The temporary name is absent after every successful
publication. A crash before rename leaves the previous complete canonical
snapshot and possibly the temporary file; that is invalid at transfer. A crash
after rename leaves the complete previous or complete next snapshot, never an
accepted torn line. The host seals only the exact progress directory to `0555`
after the writer-stop gate; it does not change a progress-file mode or rely on
numeric ownership.

Any create, write, sync, chmod, close, rename, or directory-sync failure is the
runner-local `P2_TRANSFER_WRITE_FAILED`. The runner performs no later progress
publication or repair and exits with the reserved runner exit `70` after only
the already-fixed bounded child/server settlement actions that remain safe.
Any earlier runner failure remains primary inside the runner, but cannot be
published after transfer failure. The host classifies
`P2_TRANSFER_WRITE_FAILED` only when natural container exit `70` is established;
it never synthesizes that code merely from a missing or invalid file.

### Schema, identity, and bounds

The artifact is one canonical UTF-8 JSON line with schema
`p2-vite-progress/v2`, exactly one trailing LF, at most 4,096 bytes, and at
most 13 records. The top-level keys are exactly, in this order:

```text
schemaVersion, expectedRevision, scenarioId, profileId, runId, records, terminal
```

There are four identity fields: `expectedRevision`, `scenarioId`, `profileId`,
and `runId`. All four must equal the active fixed plan. `records` has contiguous
zero-based `sequence` values. Every record has exactly `sequence`, `stage`, and
`value`; every stage occurs at most once.

| Stage | Allowed value |
|---|---|
| `runner-entered` | `accepted` |
| `inputs-prepared` | `accepted` |
| `service-ready` | `listening` or `not-required` |
| `child-launched` | `positive-process-group` |
| `child-watch-armed` | `close-error-output-deadline` |
| `child-failure-detected` | `spawn-error`, `invalid-process-group`, `deadline`, `output-limit`, or `process-error` |
| `child-terminate-sent` | `sent` or `group-already-absent` |
| `child-force-sent` | `sent` or `group-already-absent` |
| `child-close-observed` | `exit-0`, `exit-nonzero`, `sigterm`, or `sigkill` |
| `child-residue-detected` | `post-close-group-present` |
| `child-group-absent` | `confirmed` |
| `child-settled` | `success` or `known-failure` |
| `service-settled` | `closed` or `not-started` |
| `output-exported` | `validated-and-sealed` |

The runner installs close/error/output observers and the 30,000 ms deadline
immediately after accepting a positive process-group ID and before awaiting
either `child-launched` or `child-watch-armed` publication. A close that arrives
during publication is retained by those already-installed observers and is
processed only after both publications complete.

For each TERM or force step, `sent` means the fixed backend accepted delivery
of that signal, while `group-already-absent` means the immediately preceding
fixed existence check proved that no delivery was needed. The runner publishes
that disposition before it can publish a later close, group-absence,
child-settlement, or service-settlement record. A failed signal operation has
neither allowed value: it retains only the prefix through the last completed
operation and reaches the applicable unknown-settlement failure terminal.
Thus every accepted TERM/force disposition on a known-settlement path is
durable and cannot be silently omitted; the contract does not misstate a failed
delivery as `sent`.

The successful terminal object has exactly:

```json
{
  "status": "completed",
  "failureCode": null,
  "settlement": "known",
  "settlementCode": null,
  "sourceBeforeHash": "sha256:<64-lower-hex>",
  "sourceAfterHash": "sha256:<64-lower-hex>",
  "entryOutputBytes": 1
}
```

`entryOutputBytes` denotes an integer in `1..65536`, not the literal value one.
The failure terminal has exactly the first four keys and no hash/size keys:

```json
{
  "status": "failure",
  "failureCode": "<closed-code>",
  "settlement": "known-or-unknown",
  "settlementCode": "<closed-code-or-null>"
}
```

Allowed failure codes are `P2_CHILD_FAILED`, `P2_CHILD_TIMEOUT`,
`P2_OUTPUT_LIMIT`, `P2_RESULT_INVALID`, `P2_RUNNER_FAILED`, and
`P2_SERVER_CLOSE_FAILED`. Allowed non-null settlement codes are
`P2_CHILD_SETTLEMENT_UNKNOWN` and `P2_SERVER_SETTLEMENT_UNKNOWN`. Known
settlement requires a null settlement code; unknown settlement requires exactly
the applicable non-null code.

No snapshot contains a PID, timestamp, duration, absolute path, command,
environment value, canary, raw stdout/stderr/error, event content, file content,
container name, host identity, arbitrary string, or numeric child exit code.

## Closed writer transition and runner-exit table

The following table is exhaustive for the cooperative fixed runner. `P` means
the exact prefix `runner-entered`, `inputs-prepared`, `service-ready`; `L` means
`child-launched`, `child-watch-armed`; and `service-settled` is `closed` for the
permissive service or `not-started` for constrained.

| Reachable branch | Required record suffix and terminal | Runner exit |
| --- | --- | ----------: |
| failure before fixed identity/writer initialization | no accepted snapshot; host later reports missing/invalid transfer only | `1` |
| fixed input preparation failure | `runner-entered`; failure `P2_RESULT_INVALID / known / null` | `1` |
| service start fails but bounded close proves no live server | `runner-entered, inputs-prepared`; failure `P2_SERVER_CLOSE_FAILED / known / null` | `1` |
| service start or close settlement unknown before child | same prefix; failure `P2_SERVER_CLOSE_FAILED / unknown / P2_SERVER_SETTLEMENT_UNKNOWN` | `1` |
| spawn throws, so no child exists | `P`, `child-failure-detected: spawn-error`, `service-settled`; failure `P2_CHILD_FAILED / known / null` | `1` |
| spawn returns absent/nonpositive process-group identity | `P`, `child-failure-detected: invalid-process-group`; failure `P2_CHILD_FAILED / unknown / P2_CHILD_SETTLEMENT_UNKNOWN`; no service close | `1` |
| natural exit 0 with immediate group absence | `P, L`, `child-close-observed: exit-0`, `child-group-absent`, `child-settled: success`, `service-settled`, `output-exported`; completed terminal with equal source hashes | `0` |
| natural nonzero with immediate group absence | `P, L`, `child-close-observed: exit-nonzero`, `child-group-absent`, `child-settled: known-failure`, `service-settled`; failure `P2_CHILD_FAILED / known / null` | `1` |
| natural exit 0 or nonzero with post-close residue and accepted force delivery followed by proven group absence | `P, L`, close record, `child-residue-detected`, `child-force-sent: sent`, `child-group-absent`, `child-settled: known-failure`, `service-settled`; failure `P2_CHILD_FAILED / known / null` | `1` |
| natural exit 0 or nonzero with post-close residue, then group disappearance before force delivery | `P, L`, close record, `child-residue-detected`, `child-force-sent: group-already-absent`, `child-group-absent`, `child-settled: known-failure`, `service-settled`; failure `P2_CHILD_FAILED / known / null` | `1` |
| post-close residue with failed force delivery, unproved final group absence within the 1,000 ms force bound, or close-first signal disposition | `P, L`, close record, `child-residue-detected`, then `child-force-sent: sent` only after accepted delivery; otherwise only the preceding prefix; failure `P2_CHILD_FAILED / unknown / P2_CHILD_SETTLEMENT_UNKNOWN`; no `child-group-absent`, `child-settled`, or service/output record | `1` |
| deadline, output limit, or process error, TERM actually sent, accepted TERM close, and group absent | `P, L`, matching failure record, `child-terminate-sent: sent`, `child-close-observed: sigterm`, `child-group-absent`, `child-settled: known-failure`, `service-settled`; matching failure code, known | `1` |
| same bounded failure, accepted TERM close with group still present, accepted force delivery, and final group absence | `P, L`, matching failure record, `child-terminate-sent: sent`, `child-close-observed: sigterm`, `child-force-sent: sent`, `child-group-absent`, `child-settled: known-failure`, `service-settled`; retain the matching original failure code, known | `1` |
| same bounded failure, accepted TERM close with group still present, then group disappearance before force delivery | `P, L`, matching failure record, `child-terminate-sent: sent`, `child-close-observed: sigterm`, `child-force-sent: group-already-absent`, `child-group-absent`, `child-settled: known-failure`, `service-settled`; retain the matching original failure code, known | `1` |
| same bounded failure, group already absent before TERM | matching failure record, `child-terminate-sent: group-already-absent`, then only `exit-0` or `exit-nonzero`, group absent, known-failure, service-settled; matching failure code, known | `1` |
| same bounded failure, TERM grace expires and KILL settles | matching failure record, `child-terminate-sent: sent`, `child-force-sent: sent`, `child-close-observed: sigkill`, group absent, known-failure, service-settled; matching failure code, known | `1` |
| bounded-failure signal/close/group predicate differs from the five accepted rows | retain the matching failure record and every completed signal disposition in order: an accepted delivery requires its `sent` record, a pre-delivery absence requires `group-already-absent`, and a failed delivery adds no signal record; contradictory or missing close, failed force delivery, or unproved final absence yields the matching original failure code with unknown child settlement; no `child-settled` or service/output record | `1` |
| server settlement fails after known child success | valid child-success path without `service-settled`; failure `P2_SERVER_CLOSE_FAILED / unknown / P2_SERVER_SETTLEMENT_UNKNOWN` | `1` |
| server settlement fails after known child failure | valid child-failure path without `service-settled`; preserve the child failure code with unknown server settlement | `1` |
| output/source/event validation or sealing fails after child and service success | full success path through `service-settled`, no `output-exported`; failure `P2_RESULT_INVALID / known / null` | `1` |
| unexpected fixed runner failure before any subordinate resource is acquired | last valid prefix; failure `P2_RUNNER_FAILED / known / null` | `1` |
| unexpected fixed runner failure after child or server acquisition | last valid prefix; failure `P2_RUNNER_FAILED / unknown` with the applicable child/server settlement code; no later success record | `1` |
| any snapshot publication fails | no later publication; retain only the previously durable snapshot and exit after safe bounded settlement | `70` |

For every bounded-failure row, `deadline` maps only to
`P2_CHILD_TIMEOUT`, `output-limit` only to `P2_OUTPUT_LIMIT`, and
`process-error` only to `P2_CHILD_FAILED`. A failure selected before close
remains failure even if the accepted later close is `exit-0`. Post-close
residue is never success: bounded force settlement makes cleanup safe but
cannot reach output export or a completed terminal.

The 13-record and 4,096-byte bounds remain unchanged. Every longest
record-count family uses 12 records: accepted `SIGTERM` close followed by
either force disposition and final absence, or TERM-grace expiry followed by
accepted force delivery, accepted `SIGKILL` close, and final absence. Using the
longest fixed constrained identity and values, the largest of those canonical
lines is 1,102 bytes. The byte-longest valid line is instead the 10-record
completed constrained terminal with both fixed SHA-256 fields and
`entryOutputBytes: 65536`, at 1,158 bytes. Both leave the fixed record and byte
bounds intact.

Only the completed row may publish a completed terminal. Every terminal is the
last publication. No record follows `output-exported`, and no record or
terminal is added after a transfer write failure.

## Terminal-to-container cross-consistency

The runner entry owns these exact exit mappings:

- natural exit `0` is valid only with a valid completed terminal and the full
  successful record path;
- natural exit `1` is valid only with a valid failure terminal and a record
  path allowed by the table;
- natural exit `70` means the runner encountered
  `P2_TRANSFER_WRITE_FAILED`; no terminal is required or accepted as complete;
- signal exit or any other numeric exit never establishes a runner disposition.

A completed terminal with any inspected exit other than `0`, a failure terminal
with any exit other than `1`, or a terminal/record contradiction is
`P2_TRANSFER_SEQUENCE_INVALID`. Exit `0` or `1` without its required terminal
is `P2_TRANSFER_MISSING` or the applicable transfer-validation failure. Exit
`70` is classified as runner-local transfer failure only after final inspect
establishes that natural exit; force-removal never manufactures an exit code.

This mapping establishes only the runner process/disposition represented by the
validated terminal. A failure terminal may explicitly retain unknown child or
server settlement. It does not turn that unknown subordinate settlement into
known settlement.

## Host transfer validation

After the writer-stop and all-CLI-settled gate, the host:

1. changes only the exact `progress/` directory to mode `0555`;
2. enumerates only that directory and requires exactly
   `runner-progress.json`, with no temporary or additional entry;
3. opens the canonical file without following symlinks;
4. descriptor-checks regular-file type, mode (`0644` for prefix or `0444` for
   terminal), and size before reading;
5. reads through a 4,097-byte ceiling and rejects overflow, empty input,
   invalid UTF-8, missing/surplus LF, non-canonical JSON, identity/schema/key
   mismatch, record overflow, invalid transition, or terminal/exit mismatch;
6. re-stats the descriptor and exact path and requires unchanged device, inode,
   size, mode, and regular-file identity; and
7. retains only the validated closed projection in the canonical attempt.

The host never retains raw progress bytes and never enumerates the parent
result directory. Missing progress is distinct from an empty valid prefix. The
exact transfer failure classes are:

- `P2_TRANSFER_MISSING`
- `P2_TRANSFER_FILESYSTEM_INVALID`
- `P2_TRANSFER_OVERSIZED`
- `P2_TRANSFER_UNSTABLE`
- `P2_TRANSFER_SCHEMA_INVALID`
- `P2_TRANSFER_IDENTITY_MISMATCH`
- `P2_TRANSFER_SEQUENCE_INVALID`
- `P2_TRANSFER_WRITE_FAILED` only from established natural runner exit `70`

Each makes the attempt Inconclusive, can be primary only if no earlier failure
exists, and cannot be repaired or retried in this generation.

If final inspect establishes natural exit `70`,
`progress-transfer / P2_TRANSFER_WRITE_FAILED` is latched before host file
validation when no earlier host failure exists. A missing, stale-temporary, or
otherwise invalid artifact then remains a secondary transfer category only. If
the inspected exit is not `70`, the first specific host transfer-validation
code is primary when no earlier failure exists. In every case an earlier host
Docker/validation failure remains primary.

## Cooperative progress-writer trust boundary

The writable progress mount is **not** an adversarial integrity or same-UID
writer-isolation boundary. The runner and Vite child both execute as
`65532:65532`; that child could name, replace, chmod, or remove progress files.
Mode `01777`, the sticky bit, `0444`, no-follow opens, atomic rename, and stable
host reads do not change that fact.

Progress integrity is accepted only under this static trust assumption: the
reviewed immutable 128-file repository-owned closure is a cooperative fixture,
the fixed child argv/environment/cwd do not expose the progress path, and no
non-runner file in that exact closure contains the fixed mount path, either
progress basename, or the `p2-vite-progress/v2` writer protocol. This reduces
accidental multi-writer risk; it does not constrain arbitrary hostile
dependency code.

A later implementation and re-review must provide focused negative assertions
that:

1. the create plan contains exactly one progress mount at the fixed position
   and no other mount overlaps `/tmp/p2-progress`;
2. the fixed child argv, cwd, and environment contain no progress path or
   progress key;
3. only the reviewed runner writer module in the source-equal 128-file staging
   plan contains `/tmp/p2-progress`, either basename, or the v2 writer schema;
4. old tuple/schema inputs and a second writer/backend are rejected by tests;
   and
5. attempts, receipts, pair projections, and talk-facing projections carry the
   fixed limitation marker
   `progressTrust: "repository-cooperative-fixture"` and never label progress
   as OS-enforced, adversarially isolated, or tamper-proof.

The trust marker is configuration/static evidence. It is required in every
later receipt and pair projection precisely so a receipt cannot imply a
stronger writer boundary.

## Canonical attempt and receipt gating

A later implementation must introduce `p2-vite-attempt/v4`,
`p2-vite-execution/v4`, and `p2-vite-pair/v4`. The attempt has exactly these
top-level keys in this order:

```text
schemaVersion, scenarioId, profileId, runId, expectedRevision, attemptStatus,
primaryFailureStage, primaryFailureCode, inspectedImageId,
inspectedContainerExitCode, dockerSettlement, containerSettlement,
runnerProcessSettlement, cleanupDisposition, runner, runnerProgress,
progressTrust, outputAvailability, issues
```

`attemptStatus` is `inconclusive` or `receipt-pending`.
`containerSettlement` is `natural-exited`, `force-removed`, or
`not-established`; `runnerProcessSettlement` is `exited`, `force-stopped`, or
`not-established`; and `progressTrust` is exactly
`repository-cooperative-fixture`. `runner` is the validated terminal projection
or null. `outputAvailability` is `fixed-paths-exported` or `not-inspected`.

`runnerProgress` has exactly `schemaVersion`, `validity`, `records`, and
`terminal`. Its validity is `not-read`, `missing`, `invalid`, `valid-prefix`, or
`valid-terminal`. `not-read` and `missing` retain empty records and null
terminal. `invalid` retains only the longest identity-bound record prefix that
was fully validated before the first rejection and a null terminal.
`valid-prefix` retains the whole valid nonterminal snapshot; `valid-terminal`
retains the whole valid terminal snapshot. It never retains raw bytes or an
unvalidated record/value.

The host-stage set is exactly `create`, `created-inspect`, `detached-start`,
`container-wait`, `final-inspect`, `cleanup`, `progress-transfer`, and
`runner-disposition`. Docker stages use only the existing three Docker failure
codes. Create/inspect/runner validation uses only the existing closed executor
validation codes. Progress transfer uses only the eight transfer codes above.

The canonical issue set is closed and ordered as follows, with duplicates
removed:

```text
P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED
P2_ATTEMPT_CONTAINER_SETTLEMENT_NOT_ESTABLISHED
P2_ATTEMPT_RUNNER_FAILED
P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN
P2_ATTEMPT_TRANSFER_FAILED
P2_ATTEMPT_CLEANUP_FAILED
P2_ATTEMPT_OUTPUT_NOT_INSPECTED
```

The exact primary stage/code retains the specific Docker, runner, validation,
or transfer code; the issue list is its bounded category projection.

Attempt consequences are exact:

- unknown settlement of any Docker CLI writes no canonical attempt and returns
  only `attemptRecord: not-written` plus
  `P2_ATTEMPT_DOCKER_SETTLEMENT_UNKNOWN` in the bounded entry projection;
- known Docker CLI settlement but no writer-stop predicate writes an
  Inconclusive attempt with transfer `not-read`, container settlement
  `not-established`, output `not-inspected`, and no receipt;
- writer stop plus missing/invalid progress writes an Inconclusive attempt with
  the exact transfer issue and no receipt;
- force-removal may establish `force-removed` and permit a diagnostic progress
  read, but never runner natural completion, evidence access, or a receipt;
- a valid failure terminal writes an Inconclusive attempt, preserves its
  runner/child/server disposition, and never accesses regular evidence;
- exit `70` records transfer write failure only when naturally inspected and
  never creates a receipt;
- cleanup failure remains secondary when another primary exists; receipt
  remains forbidden even if the container had already exited naturally;
- an attempt-record write failure remains
  `P2_ATTEMPT_RECORD_WRITE_FAILED` and cannot fall through to evidence access;
  and
- after a receipt-pending attempt is written, regular evidence failure is
  reported only as `not-inspected` or `partially-inspected` in the bounded
  execution outcome with `P2_RECEIPT_ASSEMBLY_FAILED`; receipt-write failure is
  `P2_RECEIPT_WRITE_FAILED`. Neither rewrites the canonical attempt or creates
  a receipt.

`attemptStatus: receipt-pending` is permitted only when all of these are true:

1. no primary or secondary failure exists;
2. every Docker CLI is known settled;
3. final inspect establishes the exact owned image/container naturally exited
   with code `0`, equal to successful wait output;
4. fixed cleanup completed;
5. runner exit `0`, the completed terminal, equal source hashes, successful
   child path, service settlement, and output export are cross-consistent;
6. progress transfer is stable and has no issue; and
7. `progressTrust` has the exact cooperative-fixture limitation value.

Only then may the existing serial bounded regular-evidence preflight/read run.
A receipt additionally requires every existing event, output, source,
direct-write, projection, and receipt-write check. A receipt must carry the
same trust marker. A complete permissive receipt is the sole condition that
allows constrained setup; an Inconclusive permissive attempt exhausts the pair.
`same-image` still requires two complete exact-identity v4 receipts with the
fixed inspected image ID and the cooperative trust marker.

## Settlement predicates

| Fact | Required predicate |
|---|---|
| Docker CLI settlement | Every launched Docker CLI has an accepted natural close or accepted host `SIGKILL` close within 1,000 ms. Unknown close suppresses every later Docker and filesystem action. |
| Container settlement | `natural-exited` requires the exact final inspect binding and exit; `force-removed` requires successful fixed removal. Force removal is not natural completion. |
| Runner process settlement | Natural container exit plus valid terminal/exit cross-consistency, or natural exit `70` for transfer failure. Force removal only yields `force-stopped`. |
| Child settlement | Valid runner failure/success path containing the exact accepted close/group predicates. Unknown close, signal mismatch, missing group absence, or force-bound expiry remains unknown. |
| Diagnostic transfer | All Docker CLIs settled and the writer stopped through natural exit or successful force removal. |
| Evidence access | Natural exit `0`, completed cleanup, valid completed terminal and full success path, stable transfer, cooperative trust marker, and no issue. |
| Receipt | Evidence access plus every existing bounded event/output/source/direct-write/projection check. |
| Same-image pair | Two complete exact-identity receipts, permissive first, constrained second, same fixed image ID, and the same explicit cooperative trust marker. |

A valid prefix may localize the last durably published transition. It cannot
change an earlier primary failure, authorize evidence access, create a receipt,
start constrained, complete a pair, or establish selected-profile,
experiment-matrix, presentation, writer-isolation, or enforcement `Observed`.

## Fixed bounds and no-retry rule

The absolute container deadline remains 60,000 ms from detached-start launch.
Detached start retains its 20,000 ms Docker-command deadline. Wait receives
only the remaining absolute budget. Child deadline remains 30,000 ms, TERM
grace 500 ms, child force settlement 1,000 ms, server settlement 1,000 ms, and
Docker CLI post-kill settlement 1,000 ms. Docker combined output remains 16,384
bytes, progress remains 4,096 bytes/13 records, and regular event/output bounds
remain 65,536 bytes.

No timeout may be increased, no raw/log output may be collected, no historical
or active run may be replayed, and neither scenario may be retried on any
outcome. Missing or incomplete evidence remains Inconclusive.

## P2-DT01 through P2-DT05 remediation map

| Finding | Remediated contract predicate |
|---|---|
| P2-DT01 | Exact mode `01777`, retained `O_RDONLY | O_DIRECTORY | O_NOFOLLOW` descriptor, same-directory rename, file and directory sync, and host seal after writer stop make publication feasible without numeric ownership. |
| P2-DT02 | `child-residue-detected` is a closed failure transition; force-settled residue reaches only `child-settled: known-failure` and `P2_CHILD_FAILED`, never output export/completed. |
| P2-DT03 | The writer table now closes both residual force transitions: post-close residue disappearing before force delivery has the exact `group-already-absent` failure suffix, and accepted TERM close followed by force settlement has exact `sent` and `group-already-absent` suffixes that retain the original failure code. Failed delivery, contradictory/missing close, and unproved final absence remain unknown. |
| P2-DT04 | The host table fixes every start/wait/inspect/remove known/unknown branch, writer-stop/read rule, first failure, attempt-write barrier, and cleanup consequence. |
| P2-DT05 | The contract explicitly uses a cooperative immutable-fixture trust assumption, requires negative static assertions and a receipt limitation marker, and disclaims same-UID/adversarial isolation. |

This remediation is configuration intent only. The mode assertion and tracked
source inspection used to prepare it are Docker-free static/filesystem evidence,
not a runtime profile observation.

## Docker-free implementation outcome

The independently approved implementation boundary is complete. The active
tracked candidate now provides:

- the exact `20260720-02` plan, adapter, runner, projection, result-root, and
  container-name bindings, rejecting prior tuples and schemas;
- the Vite-only fixed progress mount in the reviewed position and the detached
  start, remaining-budget wait, final-inspect, fixed-remove command graph;
- atomic `p2-vite-progress/v2` publication, stable bounded host transfer, closed
  transition/terminal/exit validation, and runner exit `70` classification;
- `p2-vite-attempt/v4`, `p2-vite-execution/v4`, and `p2-vite-pair/v4` gates
  with the exact `repository-cooperative-fixture` limitation; and
- focused negative and lifecycle tests, including both residual P2-DT03 force
  dispositions and the no-success P2-V03 residue boundary.

Observed Docker-free checks include 73 focused tests, 105 full P2 tests, 79
M2-D tests, successful P2 typecheck/build, and side-effect-free compiled
imports. The exact staging rebuild produced 128 source-equal regular files with
fixed modes, Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, esbuild
`0.25.12`, writer tokens in only `presentation-runner.js`, and plan-order
manifest digest
`17c0543f5a00c3952c632b5c07ccaffabb00dd8c7c0e46ece1eb798da1f92b9f`.

The `continue-repository-work` standing authorization was used only to replace
and rebuild the exact already-approved generated Vite staging directory. It was
not a separate human review. No Docker/container command, runtime socket,
probe/lifecycle fixture, result root, evidence subtree, external network,
credential, Remote Git, publication, deployment, or frozen M4 state was used.

The later bounded host remediation closes the two execution-gate findings
without changing the runner, staging bytes, identity, bounds, command graph, or
trust marker. For P2-DTG01, unknown child/server settlement now has a closed
record-to-failure mapping: invalid process-group, bounded failure, close-first
residue, known child failure/success, pre-service close, and unexpected
post-acquisition runner paths each accept only their contract code and reject
settlement-code substitution. For P2-DTG02, an established natural runner exit
`70` now always contributes `P2_ATTEMPT_TRANSFER_FAILED` to the v4 canonical
issue projection, including a valid-prefix snapshot with no parser-level
transfer failure. Focused tests reproduce both rejected terminal examples and
the exit-70 attempt; full Docker-free P2 verification passes 9 files / 114
tests. This is static/unit evidence only. The fresh execution-gate re-review is
now complete and closes both findings with no new blocking or non-blocking
finding. It approves only one later argument-free `npm run p2:execute:vite`
pair attempt after fresh candidate/staging/script/root-absence revalidation,
with no retry and no constrained setup before a complete permissive receipt.
The remediated tracked source hashes
are `2a602b54f9c3f1c83ed43a8da18273a4b69b17f83eb6b020d87ef381deb0ce2f`
for `src/vite-executor.ts` and
`b0550fb2cbf1fc70ad3797d402b34067814aa9872f3e64ea391721699a84dbf0`
for `test/vite-executor.test.ts`; the Docker-free compiled executor hash is
`2a5d731cba97fe3cb34ea2c702af729763fdeec7ceaa0ebb903307086173418c`.

## Exact one-shot execution outcome

A fresh worker reproduced all 19 approved tracked/compiled hashes, the exact
128-file source-equal non-symlink staging tree and
`17c0543f5a00c3952c632b5c07ccaffabb00dd8c7c0e46ece1eb798da1f92b9f`
manifest, the fixed Node.js/Vite/Rollup/esbuild versions, the argument-free
package script, and absence of both exact active roots. It then used the
`continue-repository-work` standing authorization for exactly one
`npm run p2:execute:vite` pair attempt. This was not a separate human review.
The command exited 1, was not retried, and no Docker command outside the fixed
executor sequence was invoked.

The bounded direct stdout is an `inconclusive` `p2-vite-pair/v4` projection for
`p2-vite-expected-20260720-02`, with null image ID, the exact
`repository-cooperative-fixture` trust marker, and `PAIR_IDENTITY_MISMATCH`.
Only `vite-observe-p` is represented. Its attempt is reported written,
evidence `not-inspected`, receipt `not-written`, and its direct issues
are `P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED`,
`P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN`, `P2_ATTEMPT_TRANSFER_FAILED`, and
`P2_ATTEMPT_OUTPUT_NOT_INSPECTED`.

This worker did not open, enumerate, or classify either active result root. It
did not accept a receipt, set `Observed`, change the experiment matrix or talk
projection, retry the pair, call another Docker command, use a runtime socket,
access credentials or frozen M4 state, communicate externally, publish, or
deploy. At execution handoff, the direct entry projection remained an
unreviewed bounded outcome pending the fresh Docker-free result review below.

## Exact Docker-free result-review outcome

The fresh independent
[`result review`](reviews/p2-vite-detached-transfer-result.md) reproduced all 19
approved candidate hashes, the exact 128-file staging manifest, fixed tool
versions and package script, and only the two fixed active root states. The
permissive root is a non-symlink `0700` directory; its canonical v4 attempt is
`0600`, 1,462 bytes, and SHA-256 `842b914e...`. The sealed progress directory
is `0555`; its canonical v2 control record is `0444`, 866 bytes, and SHA-256
`77a91970...`. The summary, temporary progress path, and constrained root are
absent.

With the actual null inspected container exit, the approved pure validator
rejects the serialized progress terminal as `P2_TRANSFER_SEQUENCE_INVALID` and
reproduces the canonical attempt's `invalid` projection containing only the
eight identity-bound records through `child-force-sent`. The pure pair/entry
projectors reproduce the exact 598-byte direct stdout. The review finds no
blocking or non-blocking finding and accepts only the fifth immutable
Inconclusive attempt. It establishes no natural container/runner exit, child or
service settlement, output export, receipt, capability outcome, constrained
member, same-image pair, selected-Vite Observed, or experiment-matrix Observed
result. The tracked presentation projection retains all five attempts in
exactly three talk tables. No retry or runtime recovery is authorized.

## Work still required

The fresh independent residual-remediation re-review is complete and records
`APPROVED` with no remaining blocking or non-blocking finding. The ordered
remaining work is:

1. **Complete:** one Docker-free implementation task for the new bindings,
   exact create mount, detached command graph, v2 snapshot writer/reader, v4
   schemas, negative trust assertions, and focused tests;
2. **Complete:** focused static/unit verification and a fresh exact 128-file
   staging rebuild;
3. **Complete with a blocked decision:** the fresh Docker-free execution-gate
   review reproduced the
   candidate but found P2-DTG01 in unknown-settlement terminal-code binding and
   P2-DTG02 in the exit-70 canonical transfer-issue projection;
4. **Complete:** one Docker-free host-side remediation for only those findings
   plus focused negative regressions;
5. **Complete:** a fresh independent Docker-free execution-gate remediation
   re-review closes P2-DTG01/P2-DTG02 with no new finding and approves only the
   exact one-shot command boundary;
6. **Complete:** one exact argument-free pair execution used standing
   authorization once, exited 1, emitted only the bounded v4 `Inconclusive`
   projection above, and was not retried; and
7. **Complete:** the exact Docker-free result review reproduced the fixed
   candidate, control records, roots, and bounded stdout and accepted only the
   fifth immutable Inconclusive attempt; the tracked three-table projection is
   updated without any Observed promotion.

The one-shot execution gate is exhausted. No result access, receipt acceptance,
or `Observed` promotion has occurred.

The execution used only the reviewed fixed executor's Docker command sequence.
No direct runtime-socket access, staging mutation, ignored-result access,
external network, credential, Remote Git operation, publication, deployment,
or frozen M4 state access occurred. Standing authorization was used for the
single exact command and does not mean a separate human review occurred.

Next: none.
