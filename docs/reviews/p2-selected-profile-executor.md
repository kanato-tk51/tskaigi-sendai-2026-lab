# P2 selected codegen executor independent review

## Remediation re-review target and decision

- Target: P2-B01 through P2-B04 remediation bytes on review base
  `47bac2ec9373`
- Review type: fresh independent read-only static/unit re-review
- Decision: **APPROVED for the exact one-shot codegen execution gate**
- Closed findings: P2-B01, P2-B02, P2-B03, P2-B04
- New blocking findings: none
- Docker execution: approved only through the recorded argument-free
  `npm run p2:execute:codegen` command; not performed by this review
- Selected profile Observed: unmeasured
- Experiment-matrix Observed: unchanged

The remediation closes all four initial execution-gate blockers. Create output
now establishes the owned container ID before the first inspect; that inspect is
bound to the ID, fixed image, and `created` state before start. Timeout, output,
and process failures retain their first failure, force the fixed signal, and wait
only through a one-second settlement deadline; unknown settlement suppresses
cleanup. Event bytes are opened without following a final symlink, checked before
read, read through a 65,537-byte ceiling, and re-statted before projection. The
entry reports the pair as completed only when both fixed identities retain the
same inspected image ID.

Docker-free seams cover failed/malformed create, failed/malformed/mismatched first
inspect, start failure, cleanup order, timeout/output/error close orderings,
unknown settlement, exact/oversize/growing event segments, and equal/different
pair image IDs. The fixed command, mount, environment, staging, and receipt
boundaries accepted by the initial review remain unchanged.

This re-review changed no executor, runner, adapter, probe, staging, Expected, or
Observed bytes. It did not access Docker, a runtime socket, retained M4 state,
credentials, external network, or remote Git. The `continue-repository-work`
standing authorization was not needed for this non-executing review; the next
worker may use that standing authorization for the exact reviewed one-shot
command after revalidating the snapshot and fixed preconditions. This is an
independent Codex review, not a separate human review.

## Remediation snapshot identity

The following hashes identify the executor remediation bytes before this
re-review record and its status metadata were added. They establish byte identity
and static evidence, not runtime enforcement.

| Target | SHA-256 |
|---|---|
| Sorted tracked-file manifest for `containers/presentation-profiles/**` | `fc0504130dd13ac02a794f6fdb0506e221252561c3aa1420b8f2ddb1b5753612` |
| `src/codegen-executor.ts` | `091f09a89f3c4f145442d07a72b7414a92eb429ae1f03fc1ce219f939c2cc57d` |
| `src/codegen-projection.ts` | `95853a28ec1f2265f91bf807b75048398b85f62789b4ec8e828feaff850a1cdd` |
| `src/plan.ts` | `77c91efb1e7af9259aa040f8b3bafc77ca2afb299a61c920b07b69baeaa5dec5` |
| `runner/codegen-executor-entry.js` | `a2b4916118f3846bf51c0959a5b76a5d0cfe08c4b28937d27c37742e0e8fa4af` |
| `runner/codegen-runner.js` | `f423fd8b48b56994d48818abb9592b7808251ac9d5ac311c3a9cfb0252f1b701` |
| `test/codegen-executor.test.ts` | `a0755b4be3e7c74f87136593410ab016dd10d0d29683aed0cc24a8ca2c78c526` |
| Root `package.json` | `2b5f8d353b2e146f8aff3728a7961254cf51d8900a7bb111dc3bdf61a53000b5` |

The ignored local staging tree contains exactly 30 regular files, each equal to
its fixed source. The sorted logical-path/file-hash manifest hashes to
`de9eddfcb320063b8cfa3151541ec328515c5c2171fc3b8ebb8f5ef1221d1ecd`.
This remains static staging evidence rather than a container observation.

## Remediation finding closure

### P2-B01 — Closed

`executeFixedCodegenLifecycle()` parses and validates create before issuing
inspect, validates the first inspect against the retained ID/image/created state
before issuing start, and stops at every failed transition. Cleanup begins only
after create established the owned ID and only when the last command has known
settlement. Fake-backend traces prove the failure and cleanup ordering.

### P2-B02 — Closed

`runBoundedFixedDockerCommand()` uses a monotonic first-failure latch, discards
subsequent output, records signal acceptance, and bounds post-signal close to one
second. Only `null / SIGKILL` after an accepted force signal is known failed
settlement; absent or contradictory close remains `unknown`, and lifecycle
cleanup is suppressed. Cleanup failure cannot replace an earlier primary code.

### P2-B03 — Closed

The host opens the segment with `O_NOFOLLOW`, rejects a descriptor size above
65,536 bytes before reading, allocates only the fixed 65,537-byte ceiling, and
requires stable pre/post descriptor sizes plus an exact read count. Oversize,
growth, truncation, or incomplete read retains no raw segment and projects an
empty-input `inconclusive` result.

### P2-B04 — Closed

`projectFixedCodegenExecutionPair()` binds exactly the two ordered scenario,
profile, and run identities and requires equal inspected image IDs. A mismatch
retains both scenario receipts but emits `inconclusive / IMAGE_ID_MISMATCH`; the
entry cannot label that pair completed.

## Remediation verification observed

| Command | Observed result |
|---|---|
| `npm run p2:verify` | Exit 0; P2 typecheck and 5 test files / 44 tests passed. |
| `npm run p2:build` | Exit 0; probe-core, M2-E, and presentation executor compiled successfully. |
| Key-file and sorted tracked-manifest SHA-256 calculation | Exit 0; reproduced the remediation hashes above. |
| Ignored staging inventory/source comparison | Exit 0; exactly 30 files, every fixed target equal to its source; logical manifest hash recorded above. |
| `npm run check` | Exit 0; formatting, lint, root typecheck, and 92 test files / 595 tests passed. |

The next task is a fresh worker revalidating the recorded executor/entry hashes,
the exact 30-file staging inventory, and absence of both fixed result roots, then
using the `continue-repository-work` standing authorization to run
`npm run p2:execute:codegen` exactly once. Do not call any other Docker command,
retry a partial attempt, update Vite, or promote the result to Observed unless the
canonical receipts satisfy the fixed gate.

## Initial review target and decision (historical)

- Target: committed minimal codegen executor implementation from `3c790d5`,
  integrated at review base `47bac2e`
- Review type: fresh independent read-only static/unit review
- Decision: **BLOCKED**
- Blocking findings: P2-B01, P2-B02, P2-B03, P2-B04
- Docker execution: not approved and not performed
- Selected profile Observed: unmeasured
- Experiment-matrix Observed: unchanged

The implementation keeps the host entry argument-free and fixes the codegen pair,
Docker executable, create options, container names, lifecycle commands, disposable
Docker configuration, result roots, and sanitized receipt shape. Static/unit checks
pass. Those positive properties do not approve execution: command transitions are
not fail-closed, the advertised command timeout does not bound process settlement,
the event segment is read before its size limit is enforced, and the two receipts
are not cross-bound to one inspected image ID.

This review changed no executor, runner, adapter, probe, staging, Expected, or
Observed bytes. It did not access Docker, a runtime socket, retained M4 state,
credentials, external network, or remote Git. The `continue-repository-work`
standing authorization was not used to execute `npm run p2:execute:codegen`
because reviewed safety and validity blockers remain; approval wording is not the
sole blocker.

## Reviewed snapshot identity

The following hashes identify the implementation bytes before this review record
and status metadata were added. They establish byte identity and not runtime
enforcement.

| Target | SHA-256 |
|---|---|
| Sorted tracked-file manifest for `containers/presentation-profiles/**` | `473c6c5872baa6c3b69d672d2418bf648b011eeabd5923f853f9ff8433fefdd1` |
| `src/codegen-executor.ts` | `989eeca0dcf3bab9a93df16e0907076e70594f5ed40653512e05e8ae8aef341b` |
| `src/codegen-projection.ts` | `95853a28ec1f2265f91bf807b75048398b85f62789b4ec8e828feaff850a1cdd` |
| `src/plan.ts` | `77c91efb1e7af9259aa040f8b3bafc77ca2afb299a61c920b07b69baeaa5dec5` |
| `runner/codegen-executor-entry.js` | `ebaa1f4fa640ecf3410b2577e3e4a6d60cab480e3ee45e45f2bd03155527700b` |
| `runner/codegen-runner.js` | `f423fd8b48b56994d48818abb9592b7808251ac9d5ac311c3a9cfb0252f1b701` |
| `test/codegen-executor.test.ts` | `56aba2a2f2931adf22e3e6e7f53fdc9928654dddcdfb731d11ab4ff8361e6ec6` |
| Root `package.json` | `2b5f8d353b2e146f8aff3728a7961254cf51d8900a7bb111dc3bdf61a53000b5` |

The ignored local staging tree contained the expected 30 regular files, and each
staged target matched its fixed source byte-for-byte during this review. The sorted
logical-path/file-hash manifest hashes to
`cbf6a0f29175844dcc5be173da8812b9fc90e1fe408e37b23c1e7e143f0c26e0`.
This is static staging evidence, not a container observation.

## Positive boundary assessment

- The public entry accepts no arguments and imports the executor only when
  explicitly invoked.
- The executor selects only `codegen-observe-p` and `codegen-observe-c`; Vite,
  M4 recovery, arbitrary images, arguments, mounts, paths, environment keys, and
  runtime options are not exposed.
- Docker commands use fixed `/usr/bin/docker`, `shell: false`, ignored stdin, and
  only a credential-empty run-owned `DOCKER_CONFIG` environment.
- Create options retain `--pull never`, `--network none`, a non-root user,
  read-only root/source, dropped capabilities, no-new-privileges, resource limits,
  and separate run-owned event/tool/direct-write mounts. No runtime socket is
  mounted or forwarded.
- Inspect parsing binds container ID, configured digest reference, state, image ID,
  and exit code when validation is eventually called. Raw Docker stderr and raw
  runner stderr are not copied into receipts.
- The projection keeps only fixed identities, counts, normalized outcomes/codes,
  hashes, sizes, and issue codes. Missing, malformed, partial, or structurally
  inconsistent events become `inconclusive` rather than success.

## Blocking findings

### P2-B01 — Command results are validated after later side effects

`executeOne()` runs `create`, pre-start `inspect`, attached `start`, and post-start
`inspect` before calling `validateFixedCodegenLifecycle()`. A nonzero `create`
result is therefore followed by inspect/start calls. If the fixed name already
belongs to a pre-existing container, Docker can reject create for the name conflict
and the executor can then start that unowned container. Likewise, a nonzero or
malformed pre-start inspect result does not prevent start.

Evidence: `src/codegen-executor.ts:483-496`. Existing tests validate already
collected result objects but do not observe command ordering or a create/inspect
failure stopping the next command.

Impact: the executor can perform a runtime side effect without first proving that
the container was newly created by this run and is in the exact reviewed
created/image state. `created = create.exitCode === 0` is also weaker than the
later parsed ID/clean-stderr validation used to establish ownership.

Required remediation: validate create immediately, retain the parsed owned
container ID, validate the first inspect immediately, and only then start. Every
failed transition must prevent the next side-effecting command. Cleanup may target
the fixed name only after ownership is established. Add Docker-free fake-backend
tests for nonzero/malformed create, name collision, failed/malformed first inspect,
identity mismatch, start failure, and cleanup ordering.

### P2-B02 — The 20-second limit does not bound Docker CLI settlement

On timeout or output overflow, `runFixedDockerCommand()` sends `SIGKILL` but has no
bounded post-signal close deadline and does not check whether the signal was
accepted. The promise settles only if `close` is eventually observed. A stuck CLI
can therefore exceed the documented 20-second boundary indefinitely. For create or
attached start, an ambiguous client lifetime also makes daemon-side completion and
cleanup ordering uncertain.

Evidence: `src/codegen-executor.ts:199-269`. Current tests inspect fixed command
objects but do not exercise timeout, output overflow, process error, close, or
cleanup races.

Impact: the fixed runner is not actually bounded as documented, and cleanup can be
skipped or race an unsettled command after the most important failure paths.

Required remediation: implement a monotonic first-failure lifecycle with a bounded
post-signal settlement deadline, require an accepted close disposition, and do not
begin cleanup while a command may still be active. Preserve the primary
timeout/output/process failure and report cleanup/settlement only as secondary
state. Cover timeout/output/error/close orderings through a Docker-free private
process seam or fixed repository-owned child fixture.

### P2-B03 — Event data is read before enforcing its host-side byte limit

`optionalRegularFile()` records any regular file size, but `buildReceipt()` calls
`readFile(eventPath, "utf8")` whenever the file is present. The 65,536-byte limit is
checked only after the entire string has been allocated by
`projectCodegenProfileSegment()`.

Evidence: `src/codegen-executor.ts:388-434` and
`src/codegen-projection.ts:293-320`.

Impact: untrusted or failed adapter output is not a bounded evidence channel at the
host boundary. An oversized result can consume memory before it is converted to an
inconclusive projection, contrary to the contract and threat model.

Required remediation: reject or mark inconclusive from the pre-read regular-file
size when it exceeds the exact segment limit, then perform a bounded read that
detects growth/races. Add focused exact-limit, limit-plus-one, and post-stat growth
tests without retaining raw bytes.

### P2-B04 — Pair validity is not bound to one inspected image ID

Each scenario receipt records its own inspected image ID, but
`executeFixedCodegenProfiles()` returns both receipts without requiring equality.
The entry reports each projection's validity without a pair-level same-image check.
The fixed digest reference is configuration intent; the P2 gate requires the
permissive/constrained comparison to retain observed same-image identity.

Evidence: `src/codegen-executor.ts:449-473,514-522` and
`runner/codegen-executor-entry.js:21-30`.

Impact: two individually `matches-expected` projections could be reported as a
valid comparison even if the inspected image IDs differ, weakening C-02 through
C-04's same-image premise.

Required remediation: compare the two inspected codegen image IDs before reporting
pair completion, retain a bounded pair-level mismatch/inconclusive state, and test
equal/different IDs. Do not rewrite either scenario's raw observation.

## Remaining boundaries

- Static/unit checks do not establish Docker availability, local image presence,
  create option support, non-root execution, mount enforcement, offline behavior,
  Node permission enforcement, or any attempt outcome.
- The constrained file/read/write/child results and permissive loopback service are
  still Expected-only. No profile, route, or matrix Observed value was created.
- Vite executor/staging/profile work remains separate and unimplemented.
- The generated staging tree remains ignored local state. A later execution gate
  must re-establish its exact inventory and source equality before Docker access.
- The frozen M4 retained tag and run-owned state remain untouched.

## Verification observed

| Command | Observed result |
|---|---|
| `npm run p2:verify` | Exit 0; P2 typecheck and 5 test files / 27 tests passed. |
| `npm run p2:build` | Exit 0; probe-core, M2-E, and presentation executor compiled successfully. |
| Key-file and sorted tracked-manifest SHA-256 calculation | Exit 0; reproduced the reviewed hashes above. |
| Ignored staging inventory/source comparison | Exit 0; 30 files, each fixed target equal to its source; logical manifest hash recorded above. |
| `npm run check` | Exit 0; formatting, lint, root typecheck, and 92 test files / 578 tests passed. |
| `git diff --check` | Exit 0 after the review record and status metadata were added. |

The next task is a Docker-non-executing executor remediation for P2-B01 through
P2-B04, followed by a fresh independent read-only re-review. Do not run
`npm run p2:execute:codegen` before that gate approves the remediated bytes.

## Current handoff (supersedes historical next-task clauses)

The remediation re-review at the top of this document closed P2-B01 through
P2-B04 with no new blocker and approved the exact one-shot codegen execution
gate. A fresh worker reproduced the recorded hashes, exact staging inventory,
and absent result roots, then used the `continue-repository-work` standing
authorization to run `npm run p2:execute:codegen` exactly once. This was not a
separate human review. The command exited 0 with a `same-image` pair and two
`matches-expected` receipts; it was not retried and no other Docker command was
called. The two summary SHA-256 values are
`6b24148d57dc37d4cae67b12b19da3b75f64da4724cd1f8ab3462c5ae27a6e24`
and `7c83e41a20577e1e4be09a92fa8d7d39225489d92d36a33ba741f54a15739423`.

The
[fresh independent Docker-free receipt review](p2-selected-profile-codegen-receipts.md)
subsequently reproduced the exact summary and raw-projection invariants and
accepted both scenarios as selected codegen profile Observed at their narrow
one-pair scope. `experiment-matrix.md` remains unchanged. The next task is the
ordinary root verification hardening recorded in the receipt review; the
Docker-non-executing M2-D binding/projection slice follows it. No codegen or
Vite Docker retry is approved by this executor review.
