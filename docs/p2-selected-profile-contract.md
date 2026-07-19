# P2 selected profile evidence contract

Status: **Expected and the non-executing four-scenario Docker create plan are
fixed; the exact codegen pair is independently accepted as selected profile
Observed; Vite exact context, bindings, projection, fixed runner, and 128-file
staging assembly are implemented and statically verified; fresh independent
Docker-non-executing re-reviews closed P2-V01 and P2-V03 with no remaining
runner blocker; the minimal Vite executor is implemented, statically verified,
and independently approved for its exhausted exact one-shot execution gate;
that gate was used exactly once and exited 1 during the permissive scenario
before any canonical receipt or constrained result root was created; Vite
selected profile and experiment-matrix Observed remain unmeasured; a fresh
Docker-free failure review classified the pair attempt Inconclusive, found
P2-V04 in receipt assembly/output availability, and successive fresh
Docker-non-executing re-reviews now close P2-V06, residual P2-V05, and parent
P2-V04 with no new blocker; the fixed `20260719-02` Vite run-ID and distinct
container-name proposal is implemented as a Docker-non-executing binding and
exact staging candidate with static/unit evidence; a fresh independent
Docker-non-executing review found no blocker and approved only its exact
one-shot execution gate; a fresh worker revalidated the approved snapshot and
used standing authorization for exactly that command; it exited 1 with a
canonical permissive Inconclusive attempt record, no receipt, and no constrained
result root; a fresh Docker-free read-only review reproduced the canonical
attempt, approved source identities, bounded projection, and fixed root states,
accepting the exhausted attempt only as Inconclusive; neither Vite scenario is
selected-profile Observed and the Vite P2 slice is closed with that explicit
limitation; the next task is P3 artifact-demo implementation**.

Contract date: 2026-07-19

This is the presentation-MVP contract for the only four profile runs needed by
C-02 through C-04. It fixes inputs and Expected outcomes before execution. For
P2 it supersedes the stale codegen projection in `experiment-matrix.md`, whose
whole-file M2-D snapshot remains frozen until runner implementation updates its
guard without weakening the Observed boundary. The Expected sections below
remain the pre-execution contract; the later status sections record the gated
execution without rewriting Expected.

## Four-run boundary

Run exactly these scenarios:

1. `vite-observe-p`
2. `vite-observe-c`
3. `codegen-observe-p`
4. `codegen-observe-c`

Do not add baseline, API, watch, cache, parallel, or M4 control/recovery runs.
The runner exposes no caller-selected image, command, argument, mount, path,
environment key, or runtime option.

## Adapter binding

The matrix scenario ID, profile, and run ID are fixed before the adapter creates
its producer session. Existing local output must not be relabeled as profile
evidence.

| Scenario | Profile | Existing adapter | Route / capability / tool change / total |
|---|---|---|---:|
| `vite-observe-p` | permissive | M2-D `observe` | `6 / 6 / 3 / 15` |
| `vite-observe-c` | constrained | M2-D `observe` | `6 / 6 / 3 / 15` |
| `codegen-observe-p` | permissive | M2-E `observe` | `5 / 6 / 1 / 12` |
| `codegen-observe-c` | constrained | M2-E `observe` | `5 / 6 / 1 / 12` |

The codegen mapping uses the complete reviewed M2-E sequence; it does not
filter the producer down to the two route events previously projected by the
matrix:

```text
0  codegen-cli-startup
1  codegen-argument-parse
2  codegen-generation-start
3  codegen-attempt-environment
4  codegen-attempt-file-read
5  codegen-attempt-file-hash
6  codegen-attempt-file-write
7  codegen-attempt-loopback
8  codegen-attempt-child
9  codegen-generation-api-change
10 codegen-file-write
11 codegen-completion
```

The file-hash event is an integrity measurement, not a sixth capability. The
codegen tool-change event and all three Vite tool-change events remain
`skipped / NOT_APPLICABLE` because this is the observe variant.

## Fixed pair inputs

- Each permissive/constrained pair uses identical immutable image and staged
  fixture/config/adapter bytes. The already-local Linux/amd64 Node base is
  available by repository digest
  `node@sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`;
  P2 requires no registry access and does not require a new image builder.
- Vite uses Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, esbuild
  `0.25.12`, the existing fixed fixture, and
  `vite build --config vite.scenario.config.ts --configLoader runner --mode production`.
- Codegen uses Node.js `v20.18.2`, the existing fixed input/snapshot, and
  `node dist/cli.js observe` with no additional arguments.
- Profile policy may change only the canary exposure and fixed permission
  options required to produce the Expected differences below.

## Expected outcomes

Every capability stays enabled in the manifest and is attempted. A constrained
outcome must not be replaced by `manifest-skip`.

| Scenario | Environment | File read | Source hash | Direct write | Loopback | Fixed child |
|---|---|---|---|---|---|---|
| `vite-observe-p` | success | success | success, unchanged | success | success | success |
| `vite-observe-c` | absent | missing/denied | success, unchanged | denied | failure | success; limitation |
| `codegen-observe-p` | success | success | success, unchanged | success | success | success |
| `codegen-observe-c` | absent | missing/denied | success, unchanged | denied | failure | denied |

The Vite constrained build needs its pinned esbuild child process. Therefore
this pair cannot demonstrate child denial without changing the tool execution;
the successful probe child remains visible as a limitation. Codegen has no such
tool requirement and may omit child permission while still attempting the fixed
probe child.

These are hypotheses. Missing attempts, unexpected reason codes, timeouts, or
incomplete adapter output become mismatches or `inconclusive`; Expected is not
rewritten after observation.

## Minimal runner and evidence boundary

The implementation adds one presentation-only fixed runner, separate from the
frozen M4 recovery path. Before the four runs, perform one focused
Docker-non-executing review of the runner and its exact commands.

The runner must use a credential-empty disposable Docker config and fixed CLI,
run non-root with source read-only, keep tool/result/direct-write paths
separate, bound time and output, disable external network, and never mount or
forward the Docker socket. Permissive loopback is an experiment-owned service;
neither profile contacts an external host. Only repository-owned staged inputs
and run-owned writable directories may be mounted.

For each scenario retain the scenario/profile/run IDs, image ID, tool versions,
closed adapter events, source before/after hash, and bounded output inventory.
Sanitized results exclude canary values, file contents, absolute host paths,
environment values, raw errors, commands, and credentials.

One complete run per scenario is sufficient for the narrow presentation
comparison. It is not a reproducibility claim or evidence for unselected matrix
rows. P4 will create the talk-facing projection and show the Vite child
limitation beside it.

Next implementation scope is limited to the fixed scenario binding, runner,
small result projection, and relevant tests. Generic collectors, offline image
builders, cleanup-recovery state machines, retained M4 state, P3 artifacts, and
P4 evidence-map work are out of scope.

## Implementation status

`containers/presentation-profiles/src/plan.ts` now provides an argument-free,
immutable four-scenario plan. Static/unit verification fixes the local image
reference, pair-identical staging roots and semantic commands, separate run
roots, and Docker `create` arguments for offline, non-root, read-only execution
without a runtime-socket mount.

This is configuration intent, not runtime evidence. The codegen runner source
fixes its two selected identities, child environment, loopback service,
permission arguments, timeout, and output limits. Its argument-free assembly
copies exactly 30 regular files: the runner/snapshot/package bytes, nine codegen
CLI modules, and the probe-core package plus 17 runtime modules. It rejects an
existing staging root, symlink/non-file sources, duplicate copies, and escaping
targets. A local offline assembly verified the 30-file inventory and module
resolution; generated staging remains ignored. No Docker command is exposed or
executed, and `experiment-matrix.md` remains unchanged. The next slice is the
focused Docker-non-executing review of this codegen plan, runner, and staged
inventory required before an executor may be added.

Codegen binding update (2026-07-19): M2-E accepts only the exact
`codegen-observe-p/c` scenario, run, and profile tuples recorded by this
contract. It binds the scenario ID before manifest/session creation and keeps
the existing local M2-E context unchanged. Its selected runtime binding now
separates the event, tool/canary, read-only source snapshot, and direct-write
roots; the constrained Docker plan mounts the direct-write root read-only. A
small projection retains exact identity/order/counts and separates expected
matches, mismatches, and inconclusive streams without raw fields. The fixed
runner source and exact closure can now be assembled offline; the executor
remains absent, so this update creates no profile observation.

## Focused codegen non-executing review

Review date: 2026-07-19. Result: **approved for minimal executor implementation,
not approved as runtime evidence**.

The review checked the fixed image/CLI/create arguments, pair-shared 30-file
staging bytes, read-only and separated mounts, non-root user, network-none plus
loopback-only service, fixed child command, bounded output/time, and sanitized
projection. Local Node.js `v20.18.2` help confirms the repeated
`--allow-fs-read`, `--allow-fs-write`, and omitted `--allow-child-process`
options used by the constrained runner. No Docker command was called.

One finding was fixed before approval: Node.js denies an unpermitted spawn by
synchronously throwing `ERR_ACCESS_DENIED`. `probe-core` previously normalized
that path to `INTERNAL_ERROR`; it now emits the intended sanitized
`CHILD_PROCESS_FAILURE`, with a unit test that excludes the raw error. The
rebuilt local staging again matches all 30 fixed sources byte-for-byte.

## Minimal codegen executor implementation

The argument-free executor now selects only `codegen-observe-p/c`. It verifies
the 30 staged bytes, creates an empty disposable Docker config and fresh
UID-writable run directories, then fixes the `/usr/bin/docker` sequence to
`create`, identity/state `inspect`, attached `start`, a second `inspect`, and
force-removal of the named disposable container. Each CLI call is bounded to 20
seconds and 16 KiB combined output; commands inherit only `DOCKER_CONFIG`.

The runner makes its exact event segment host-readable, records source
before/after hashes, and also makes a partial segment readable on failure. The
executor discards raw CLI stderr, parses bounded JSONL into the existing
allowlisted projection, preserves nonzero/partial runs as `inconclusive`, and
writes a small receipt containing fixed identities, image ID, tool versions,
output presence/sizes, hashes, and the projection. It never copies commands,
canary values, raw errors, contents, environment values, or absolute host paths
into the receipt.

This implementation has static/unit coverage and a successful compiled import,
but no Docker command has been executed. A fresh independent read-only review of
the executor and exact command sequence is required before the recorded
`npm run p2:execute:codegen` command may be used. This is configuration intent,
not Observed evidence.

## Minimal codegen executor independent review

Review date: 2026-07-19. Result: **blocked; do not execute**.

The [fresh independent read-only review](reviews/p2-selected-profile-executor.md)
confirmed the fixed argument-free plan, credential-empty Docker configuration,
closed command shapes, non-root/offline/read-only create options, bounded receipt
schema, and raw-field exclusion. It also found four execution-gate blockers:
command results are validated only after later side effects (P2-B01), the 20-second
Docker CLI limit does not bound post-signal settlement (P2-B02), the event segment
is fully read before its host-side size limit is applied (P2-B03), and the two
scenario receipts are not cross-bound to one inspected image ID (P2-B04).

The review ran static/unit verification only. It did not call Docker or create an
Observed result. The next task is a Docker-non-executing remediation of P2-B01
through P2-B04, followed by a fresh independent read-only re-review. Do not run
`npm run p2:execute:codegen` before that re-review approves the remediated bytes.

## Executor blocker remediation

Remediation date: 2026-07-19. State: **implemented and statically verified;
independent re-review required before execution**.

- P2-B01: create output is parsed before ownership is established, the first
  inspect is parsed and bound to the owned container in `created` state before
  start, and every failed transition stops the next command. Cleanup targets the
  fixed name only after ownership is established and is suppressed if a command
  may still be active.
- P2-B02: timeout, output-overflow, and process failures preserve the first
  failure, send the fixed force signal, and wait for close only through a fixed
  one-second settlement deadline. Only the accepted `SIGKILL` close disposition
  establishes settled failure. Unknown or unexpected settlement remains explicit
  and prevents cleanup; cleanup failure is retained only as secondary state after
  an earlier primary failure.
- P2-B03: the event file is opened without following symlinks, rejected from its
  descriptor size before read when over 65,536 bytes, read through a fixed
  65,537-byte ceiling, and re-statted to detect growth or truncation. Oversize or
  unstable content becomes an empty-input `inconclusive` projection without raw
  bytes being retained.
- P2-B04: the two per-scenario receipts remain unchanged and a bounded pair
  projection separately requires the fixed identities and equal inspected image
  IDs. A differing ID produces `inconclusive` with `IMAGE_ID_MISMATCH`; the entry
  does not report that pair as completed.

Docker-free fake-backend/process/file-handle tests cover create and first-inspect
failures, identity mismatch, start failure, cleanup ordering, timeout/output/error
close orderings, unknown settlement, exact/oversize/growing event segments, and
equal/different pair image IDs. Observed static verification: `npm run p2:verify`
exited 0 with 5 files / 44 tests, `npm run p2:build` exited 0, and
`npm run check` exited 0 with 92 files / 595 tests. No Docker command, profile
run, matrix update, or Observed value was produced. The next task is a fresh
independent read-only re-review of the remediated executor and entry;
`npm run p2:execute:codegen` remains blocked until that review approves the exact
bytes.

## Executor remediation independent re-review

Re-review date: 2026-07-19. Result: **approved for the exact one-shot codegen
execution gate; no new blocking finding**.

The [fresh independent read-only re-review](reviews/p2-selected-profile-executor.md)
closed P2-B01 through P2-B04 against the remediated executor and entry. It
reproduced the fixed command transition, bounded process settlement, bounded
descriptor read, same-image pair projection, key-file hashes, and exact 30-file
staging equality. `npm run p2:verify` exited 0 with 5 files / 44 tests,
`npm run p2:build` exited 0, and `npm run check` exited 0 with 92 files / 595
tests. No Docker command, profile run, matrix update, or Observed value was
produced by the review.

The next task is a fresh worker revalidating the recorded executor/entry hashes,
exact staging inventory, and absence of both fixed codegen result roots, then
using the `continue-repository-work` standing authorization to run the
argument-free `npm run p2:execute:codegen` command exactly once. The approval
does not cover another Docker command, retry, Vite work, or promotion of an
incomplete/mismatched receipt to Observed, and it is not a separate human review.

## One-shot codegen execution

Execution date: 2026-07-19. State: **the fixed pair completed and its candidate
sanitized receipts pass local structural validation; fresh independent receipt
review is pending**.

A fresh worker reproduced the recorded executor, entry, package, and tracked
manifest SHA-256 values, the exact 30-file staging inventory/source equality and
logical manifest `de9eddfcb320063b8cfa3151541ec328515c5c2171fc3b8ebb8f5ef1221d1ecd`,
and absence of both fixed result roots. It then used the
`continue-repository-work` standing authorization to run the approved
argument-free `npm run p2:execute:codegen` command exactly once. This was not a
separate human review. The command exited 0; no other Docker command, retry, Vite
operation, or M4 operation was performed.

The pair projection is `same-image` with inspected image ID
`sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`.
Both containers exited 0, both source before/after hashes are equal, and both
profile projections are `matches-expected` with counts `5 / 6 / 1 / 12` and no
issues. The candidate receipt identities are:

| Scenario | Run ID | Summary SHA-256 | Bytes | Event bytes | Direct write |
|---|---|---|---:|---:|---|
| `codegen-observe-p` | `p2-codegen-observe-p-20260719-01` | `6b24148d57dc37d4cae67b12b19da3b75f64da4724cd1f8ab3462c5ae27a6e24` | 1,400 | 8,977 | present |
| `codegen-observe-c` | `p2-codegen-observe-c-20260719-01` | `7c83e41a20577e1e4be09a92fa8d7d39225489d92d36a33ba741f54a15739423` | 1,477 | 8,999 | absent |

The permissive receipt records success for all six fixed attempts. The
constrained receipt records environment absent, read denied, source hash
success, write denied, loopback failure, and child-process failure using only
the normalized codes fixed by this contract. Post-run `npm run p2:verify`
exited 0 with 5 files / 44 tests. The ignored run roots and raw segments remain
local inputs; `experiment-matrix.md` was not hand-edited or promoted.

The next task is a fresh independent Docker-free read-only review of these exact
two summary bytes and this execution record. It must reproduce the receipt
hashes, identities, same-image binding, unchanged source hashes, counts, attempt
outcomes, and bounded output inventory before deciding whether they are suitable
as selected codegen Observed evidence. Do not rerun Docker; Vite implementation
remains a later task.

## Codegen receipt independent review

Review date: 2026-07-19. Result: **approved as selected codegen profile
Observed at the exact scenario/run scope; no blocking finding**.

The
[fresh independent Docker-free review](reviews/p2-selected-profile-codegen-receipts.md)
reproduced both canonical summary SHA-256 values and sizes, exact identities,
same inspected image ID, container exit 0, equal source before/after hashes,
`5 / 6 / 1 / 12` counts, six ordered attempt outcomes per profile, empty issue
lists, and the bounded output inventory. It also recomputed both receipt
projections from the local raw event segments without printing or persisting raw
fields, and independently reconstructed `same-image` from the two receipts.

The receipts are accepted as Observed only for `codegen-observe-p` and
`codegen-observe-c`. They are one local pair, not a reproducibility result, a
general sandbox claim, or evidence for Vite, M4 controls, unselected rows, or
external-egress isolation. Their standalone bytes do not carry the staging
manifest or prove the recorded no-retry history; those boundaries remain tied
to the reviewed executor and the one-shot execution record above.
`experiment-matrix.md` remains unchanged, and the ignored raw/run roots remain
local review inputs rather than tracked talk-facing examples.

The receipt review also observed that the old root-wide Prettier scan encountered
the intentionally unreadable ignored constrained canary directory before
applying its ignore rule. That ordinary verification issue did not change the
receipt decision or evidence permissions.

## Root verification hardening

Hardening date: 2026-07-19. State: **complete; root check restored without
accessing or mutating either P2 run root**.

`scripts/check-format.mjs` replaces directory expansion in `format:check` with a
NUL-delimited Git enumeration of tracked and non-ignored untracked inputs, then
passes only those file paths to Prettier with unknown file types ignored. A
focused repository-local regression keeps an ignored nested directory
unreadable while checking both the discovered file list and the formatter exit.
It restores and removes only its own fixture. The implementation and test do not
read, change permissions on, move, or delete either codegen run root.

The focused regression, targeted lint, root formatter check, and root typecheck
passed. `npm run check` then passed formatting, lint, typecheck, and 93 test files
/ 596 tests. No Docker command, selected receipt, raw event, Expected value,
Observed value, or experiment-matrix field changed. The next P2 slice is the
Docker-non-executing M2-D binding and bounded projection for
`vite-observe-p/c`.

## Vite binding and bounded projection

Binding date: 2026-07-19. State: **implemented and statically verified; no
Docker command or Vite profile run executed**.

M2-D now accepts only the exact `vite-observe-p/c` scenario, run, and profile
tuples fixed by this contract and binds the selected identity before manifest
or probe-session creation. Its existing random local `observe`/`api` context
remains unchanged. Selected runtime bindings separate the event root
`/tmp/p2-result`, tool/canary/cache/output root `/tmp/p2-tool`, fixed read-only
staged adapter source, and `/tmp/p2-direct-write`; the existing constrained
Docker create plan makes only the final root read-only. Resolved Vite config
ownership checks use the fixed tool root rather than treating the event sink as
their parent.

The bounded projection accepts at most 65,536 JSONL bytes and 32 events, retains
only the fixed tuple, order, `6 / 6 / 3 / 15` counts, six normalized attempt
outcomes, issues, and the constrained Vite child limitation, and discards
unknown/raw fields. Missing, reordered, malformed, oversized, or relabeled
input is `inconclusive`; complete structural evidence with an unexpected
capability outcome is a preserved `mismatch`. The constrained child remains
Expected `success` with `CONSTRAINED_CHILD_REQUIRED_BY_TOOL`; the projection
does not disguise a child denial as a match.

Observed static verification: M2-D typecheck/build/static verification passed,
its 12 test files / 72
tests passed including fresh local fixed-adapter contract runs, P2 typecheck
and build passed, its 6 test files / 52 tests passed, and the root check passed
95 test files / 613 tests. No Docker command, Vite staging assembly, executor,
profile run, receipt, Expected edit, Observed promotion, or experiment-matrix
change occurred. The next task is the Docker-non-executing argument-free fixed
Vite runner and exact staging assembly; executor/review and pair execution
remain later gates.

## Fixed Vite runner and staging assembly

Runner/staging date: 2026-07-19. State: **implemented, assembled offline, and
statically verified; no Docker command or Vite profile run executed**.

The argument-free runner accepts only the exact `vite-observe-p/c` identities
and launches the same pinned Vite production-build argv for both profiles. It
passes only fixed scenario and tool-temporary environment keys, exposes the
environment canary and loopback service only for permissive, makes the
constrained file canary unreadable, and leaves the tool-required Vite/esbuild
child reachable in both profiles. The constrained direct-write denial remains
the fixed read-only Docker mount from the already reviewed create plan rather
than a manifest skip or hidden child denial.

The child runs in its own process group with a 30-second time bound, 65,536-byte
combined-output bound, bounded TERM/KILL settlement, and no inherited host
environment. The runner accepts only one bounded event segment and one fixed
entry output, rechecks the staged designated source bytes, makes a complete or
partial event segment host-readable, and prints only fixed identities, source
hashes, and a bounded logical output inventory.

The argument-free staging command builds the existing probe-core and M2-D
outputs, rejects an existing target, and copies exactly 128 regular non-symlink
files with byte equality and fixed modes. The inventory contains the runner,
adapter config/fixture/source/runtime closure, probe-core runtime closure,
pinned Vite/Rollup/esbuild runtime packages, and only the Linux amd64 Rollup
native module and esbuild executable required by the fixed image. The generated
tree remains ignored, pair-shared, and source-read-only at runtime.

Observed static verification: `npm run p2:verify` exited 0 with 8 test files /
62 tests, `npm run p2:build` exited 0, `npm run p2:stage:vite` exited 0 with 128
files, and a Docker-free byte/mode/import check reproduced all staged sources
and the exact Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild
`0.25.12` versions. The fixed plan-order logical-path/file-hash manifest SHA-256 is
`cc4e8dbc5df4e4f19246c48fb164b1d32157dc04423ddcc1388c95b9fb384677`.
The root `npm run check` exited 0 with 97 test files / 623 tests. No Docker
command, runtime socket, profile run, receipt, Expected edit, Observed promotion,
or experiment-matrix change occurred.

## Fixed Vite runner/staging independent review

Review date: 2026-07-19. Result: **blocked; do not add an executor or run
Docker**.

The
[fresh focused Docker-non-executing review](reviews/p2-selected-profile-vite-runner.md)
reproduced the exact identities, fixed command/environment/mount boundaries,
constrained-child limitation, 128 source-equal staged files and modes, tool
versions, and fixed plan-order manifest. It also corrected the manifest-order
description without changing bytes.

The review found P2-V01: after a coordinator close, the runner discards the
final process-group-exit result and can collapse a still-active group into an
ordinary child failure. Failure-first paths also do not require a bounded
accepted close disposition. The runner then closes the loopback service and
attempts partial-segment chmod even when settlement may be unknown. Existing
tests assert source strings rather than exercising these transitions.

The next task is a Docker-non-executing remediation that retains explicit
settlement state, suppresses cleanup while unknown, bounds known-safe server
settlement, and adds behavioral fake process/server lifecycle tests. Rebuild
the 128-file staging tree and perform a fresh re-review before adding a Vite
executor or calling Docker.

## Vite settlement remediation

Remediation date: 2026-07-19. State: **implemented and statically verified;
P2-V01 remains open until a fresh independent Docker-non-executing re-review**.

The runner now preserves the first child timeout, output-limit, or process
failure separately from an explicit `known` / `unknown` settlement state. A
close-first result is accepted only as a natural coordinator disposition with
confirmed process-group absence. Failure-first paths require the exact bounded
`SIGTERM` or final `SIGKILL` close disposition plus group absence; a missing or
contradictory close and a group remaining after final KILL produce
`P2_CHILD_SETTLEMENT_UNKNOWN` without losing the first failure code.

The lifecycle does not close the permissive loopback service, verify output, or
chmod a partial segment after unknown child settlement. Once child settlement is
known, loopback close has a fixed one-second deadline. Unknown server settlement
retains the first failure, suppresses partial-segment chmod, and becomes
`P2_SERVER_SETTLEMENT_UNKNOWN`. A future executor must preserve this cleanup
barrier; the runner's bounded failure projection exposes the normalized first
failure and settlement fields without raw errors so that gate can be enforced.
No executor is added by this remediation.

Docker-free process and server seams behaviorally cover normal success, nonzero
close, timeout, output overflow, process error, TERM/KILL order, missing and
contradictory close, residue after final KILL, bounded server close, and cleanup
suppression/order. The runner, declaration, and lifecycle-test SHA-256 values
are respectively `6824a48f...`, `d68dd6e9...`, and `054e2b19...`. The rebuilt
128-file source-equal fixed-mode staging inventory has plan-order manifest
SHA-256 `edeb861279e0b4c09539456b434e3b5747e53c9069937f7756ba9b7238a23078`.

Observed static verification: `npm run p2:verify` exited 0 with 8 files / 76
tests, `npm run p2:build` exited 0, and the root `npm run check` exited 0 with 97
files / 637 tests. No Docker command, runtime socket, selected Vite run, receipt,
Expected edit, Observed promotion, matrix change, external network, or retained
M4 access occurred. The `continue-repository-work` standing authorization was
not needed because this task was Docker-non-executing. The next task is a fresh
independent Docker-non-executing re-review of these remediated runner/test bytes
and the rebuilt staging inventory. Do not add a Vite executor or call Docker
before that review closes P2-V01.

## Vite settlement remediation independent re-review

Re-review date: 2026-07-19. Result: **P2-V01 closed; P2-V03 blocks executor
implementation and Docker execution**.

The
[fresh independent Docker-non-executing re-review](reviews/p2-selected-profile-vite-runner.md)
reproduced the remediated runner/declaration/test hashes, all 128 source-equal
fixed-mode staged files, plan-order manifest
`edeb861279e0b4c09539456b434e3b5747e53c9069937f7756ba9b7238a23078`,
fixed tool versions, and the behavioral P2-V01 settlement/cleanup coverage.
P2-V01 is closed.

The re-review found P2-V03: after natural coordinator close `0 / null`, a
still-present process group is force-killed and awaited, but successful later
group exit is then returned as ordinary runner success. The accepted M2-D
boundary instead treats post-close process/esbuild residue as a
run-invalidating known failure even when termination later makes cleanup safe.
A focused Docker-free fake-backend assertion reproduced candidate resolution
with trace `launch, group-exists, SIGKILL, wait-group`; the 76-test suite omits
that transition.

`npm run p2:verify` exited 0 with 8 files / 76 tests, but that pass does not
close P2-V03. No runner/test/staging input, Docker command, runtime socket,
selected Vite run, receipt, Expected value, Observed value, or matrix field was
changed by the re-review. The next task is a Docker-non-executing P2-V03
remediation and focused behavioral test, followed by another fresh independent
re-review. Do not add a Vite executor or call Docker before that gate approves
the exact rebuilt bytes.

## Vite P2-V03 remediation

Remediation date: 2026-07-19. State: **implemented and statically verified;
P2-V03 remains open until a fresh independent Docker-non-executing re-review**.

The close-first lifecycle now retains whether the process group was present
after coordinator close. If bounded `SIGKILL` settlement proves final group
absence, that residue is a known `P2_CHILD_FAILED` result rather than success;
if final absence cannot be proved, the existing
`P2_CHILD_SETTLEMENT_UNKNOWN` cleanup barrier remains unchanged. Therefore a
successful run still requires natural close `0 / null` and immediate group
absence, while force settlement only makes later cleanup safe.

The focused fake-backend lifecycle test covers natural `0 / null` close,
initially present residue, `SIGKILL`, and bounded group exit. It asserts the
known failure projection and proves output verification is skipped while
bounded server close and partial-segment cleanup proceed only after settlement
is known. The runner and lifecycle-test SHA-256 values are respectively
`480b5fd3b2fa49b2853d82d3db5f5fd46f52911397860f2e0c8f1b4a79dbd284`
and `761dca75407294c2cdcefdf4ca0e5c557f37a241138d09e65d25f57560504613`;
the unchanged declaration hashes to
`d68dd6e93334015d7f9cbac68998286e02d93237d139eae9ca59249e59d52bd0`.
The rebuilt 128-file source-equal fixed-mode staging inventory has plan-order
manifest SHA-256
`13f019cb9d9636023d43350ed13932e5fbc2d1f8ae2a01abe85458ffcd89ae22`
and the fixed Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild
`0.25.12` versions.

Observed static verification: the focused runner test passed 1 file / 19 tests;
`npm run p2:verify` passed 8 files / 77 tests; `npm run p2:build` passed; and
`npm run p2:stage:vite` rebuilt exactly 128 files before the byte/mode/version
assertion above passed. The root `npm run check` passed 97 files / 638 tests. No
Docker command, runtime socket, Vite profile run, receipt, Expected edit,
Observed promotion, matrix change, external network, or retained M4 access
occurred. Standing authorization was not needed because this task was
Docker-non-executing. The next task is a fresh independent Docker-non-executing
re-review of the exact remediated runner/test and rebuilt staging bytes. Do not
add a Vite executor or call Docker before that review closes P2-V03.

## Vite P2-V03 remediation independent re-review

Re-review date: 2026-07-19. Result: **P2-V03 closed with no new blocking
finding; minimal Vite executor implementation approved; Docker execution not
approved**.

The
[fresh independent Docker-non-executing re-review](reviews/p2-selected-profile-vite-runner.md)
reproduced the seven candidate hashes, exact 128-file source-equal fixed-mode
staging tree, plan-order manifest
`13f019cb9d9636023d43350ed13932e5fbc2d1f8ae2a01abe85458ffcd89ae22`,
and fixed Node/Vite/Rollup/esbuild versions. The focused 19-test suite and full
P2 77-test suite passed.

The reviewed close-first lifecycle accepts success only after natural close
`0 / null` with immediate process-group absence. Post-close residue that exits
only after bounded `SIGKILL` is retained as known `P2_CHILD_FAILED`, skips output
verification, and permits later cleanup only after settlement is known. Failure
to prove final group absence remains the cleanup-suppressing unknown barrier.
P2-V03 is therefore closed without creating runtime evidence.

No Docker command, runtime socket, Vite run, receipt, Expected edit, Observed
promotion, matrix change, external network, credential, retained M4 access, or
remote Git operation occurred. Standing authorization was not needed because
the review was non-executing. The next task is the Docker-non-executing minimal
Vite executor bound to the exact reviewed runner/staging/projection and cleanup
barrier, followed by a fresh independent review before any execution gate.

## Minimal Vite executor implementation

Implementation date: 2026-07-19. State: **implemented and statically verified;
fresh independent Docker-non-executing review required before execution**.

The argument-free executor selects only the exact `vite-observe-p/c` plans and
result roots. It revalidates the complete 128-file source-equal fixed-mode
staging tree, creates a credential-empty run-owned Docker configuration and
fresh writable roots, and exposes only the fixed `/usr/bin/docker` sequence
`create`, identity/state `inspect`, attached `start`, a second `inspect`, and
force-removal of the owned fixed-name container. Create ownership and the
created/image identity are validated before start. Each Docker CLI process has
bounded combined output, a fixed command deadline, and bounded post-signal
settlement; the attached start deadline includes the runner's reviewed
30-second child deadline and settlement allowances.

The executor parses only the runner's exact sanitized success/failure framing.
Known runner settlement permits later container cleanup, while
`P2_CHILD_SETTLEMENT_UNKNOWN` or `P2_SERVER_SETTLEMENT_UNKNOWN` suppresses that
cleanup and is retained as an inconclusive runner disposition. Unknown Docker
CLI settlement and malformed runner framing also suppress cleanup. Event bytes
are size-checked before allocation and rechecked through an `O_NOFOLLOW` file
handle. The canonical receipt retains fixed identities, inspected image ID,
Node/Vite/Rollup/esbuild versions, container/runner completion, settlement and
cleanup state, source hashes, bounded output presence/sizes, and the existing
sanitized projection. It excludes commands, container names/IDs, raw output or
errors, canary values, contents, environment values, credentials, and absolute
host paths. Pair completion requires the two exact identities, one inspected
image ID, and two complete runner/receipt boundaries.

The candidate implementation hashes are `c3d84e46...` for
`src/vite-executor.ts`, `dc773814...` for its 21-test suite,
`87ab4b45...` / `dc1924df...` for the entry source/declaration, and
`473a0d5a...` for the projection type extension. The reviewed runner and staging
source hashes remain `480b5fd3...` and `d23c64bf...`; the root package hash with
the recorded but unexecuted `p2:execute:vite` entry is `c6b03db4...`.

Observed static verification: the focused executor suite passed 1 file / 21
tests; `npm run p2:verify` passed 9 files / 98 tests; `npm run p2:build` passed;
and compiled executor/entry imports completed without side effects. The
executor staging regression revalidated exactly 128 regular, non-symlink,
source-equal files and their fixed modes. The root `npm run check` passed
formatting, lint, typecheck, and 98 files / 659 tests. No Docker command, runtime
socket, Vite profile run, receipt, Expected edit, Observed promotion, matrix change,
external network, credential, retained M4 access, or remote Git operation
occurred. Standing authorization was not needed because this implementation
task was non-executing.

The next task is a fresh independent Docker-non-executing review of the exact
executor, entry, tests, staging revalidation, receipt/pair projection, command
settlement, and runner cleanup-barrier preservation. Do not run
`npm run p2:execute:vite`, define an execution gate, or promote selected Vite or
experiment-matrix Observed before that review.

## Minimal Vite executor independent review

Review date: 2026-07-19. Result: **approved for the exact one-shot Vite
execution gate; no new blocking finding**.

The
[fresh independent Docker-non-executing review](reviews/p2-selected-profile-vite-executor.md)
reproduced the nine candidate hashes, exact 128-file source-equal fixed-mode
staging tree, plan-order manifest, fixed tool versions, command transition,
bounded process/event channels, exact sanitized runner framing, receipt/pair
projection, and preservation of the child/server settlement-unknown cleanup
barrier. The focused 21-test suite, P2 98-test suite, P2 build, compiled import
check, independent staging assertion, and root 659-test check passed without
calling Docker.

The exact one-shot execution gate is approved only through the argument-free
`npm run p2:execute:vite` command. A fresh worker must first reproduce the
approved hashes, staging identity, and absence of both fixed Vite result roots,
then may use the `continue-repository-work` standing authorization for exactly
one pair attempt. This is not a separate human review. No other Docker command,
retry, codegen run, retained M4 access, external network, or Observed promotion
is approved. A later fresh Docker-free receipt review is required before any
candidate result may become selected Vite profile Observed.

## One-shot Vite execution

Execution date: 2026-07-19. State: **the approved one-shot gate was used and
failed before a canonical receipt was written; do not retry**.

A fresh worker reproduced all nine hashes in the executor review, the exact
128-file source-equal regular non-symlink staging tree and fixed `0444`/`0555`
modes, plan-order manifest
`13f019cb9d9636023d43350ed13932e5fbc2d1f8ae2a01abe85458ffcd89ae22`,
Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, esbuild `0.25.12`, and both
absent fixed Vite result roots. It then used the
`continue-repository-work` standing authorization to invoke the approved
argument-free `npm run p2:execute:vite` exactly once. This was not a separate
human review. The build phase completed and the executor entry exited 1 with
the bounded projection
`{"status":"failure","code":"P2_EXECUTOR_FAILED"}`. The pair was not
retried, and the worker called no Docker command outside that fixed executor
sequence.

Docker-free post-attempt metadata inspection found only the permissive result
root. It contains an 11,064-byte event segment and a 144-byte direct-write
marker, both owned by the fixed container user with mode `0600`. The fixed
`tool/out` directory is also container-owned with mode `0700`, so the host user
cannot establish the entry-output state through it without changing retained
state. No `summary.json` was written, and the constrained result root remains
absent. The worker did not change permissions, read inaccessible bytes, move or
delete the roots, access a runtime socket or retained M4 state, use external
network, edit Expected, or promote `experiment-matrix.md`.

This is a failed/incomplete pair attempt, not selected Vite profile Observed.
The exact top-level failure classification beyond `P2_EXECUTOR_FAILED`, runner
settlement, container cleanup state, raw event projection, image binding, and
constrained attempt are unestablished. Post-attempt `npm run p2:verify` passed
typecheck and 9 files / 98 tests, `npm run format:check` passed, and
`git diff --check` exited 0. The exhausted one-shot gate does not authorize a
retry or another Docker command. The next task is a fresh Docker-free read-only
failure review of the fixed executor/runner paths and the metadata above. It
must preserve the retained runtime paths and decide whether a bounded
non-executing remediation/evidence-recovery contract can be defined before any
new execution authority is considered.

## Vite failed-attempt independent review

Review date: 2026-07-19. Result: **attempt Inconclusive; P2-V04 blocks another
execution gate; current retained evidence is not safely recoverable**.

The
[fresh Docker-free read-only review](reviews/p2-selected-profile-vite-failure.md)
reproduced the nine approved source hashes and only the fixed retained metadata:
the permissive 11,064-byte event segment and 144-byte direct-write marker are
container-owned mode `0600`, `tool/out` is container-owned mode `0700`, the
canonical summary is absent, and the constrained root is absent. It did not
read retained content, traverse the output directory, change permissions, call
Docker, or retry the exhausted pair.

P2-V04 records that lifecycle processing may retain a sanitized runner/image/
cleanup disposition, but `buildReceipt()` then unconditionally opens or
traverses container-owned evidence. An unavailable path rejects receipt
assembly, after which the top-level entry emits only `P2_EXECUTOR_FAILED` and
the in-memory disposition is lost. The tests cover lifecycle cleanup suppression
but not receipt construction against inaccessible paths. The retained modes and
sizes cannot reconstruct the missing runner framing, inspected image, cleanup
state, or constrained scenario, so no Docker-free read-only recovery can create
a candidate selected-profile receipt for this attempt.

The next task is a Docker-non-executing P2-V04 remediation. It must write a
separate canonical attempt record before evidence access, preserve unavailable
evidence as `not-inspected`, avoid all evidence-subtree access while settlement
is unknown, establish a host-readable fixed output boundary only after known
settlement, keep complete receipts separate from failed attempts, and add
behavioral filesystem/backend tests. It must not change the existing run IDs,
call Docker, inspect or mutate the retained root, edit Expected/Observed, or
define a new execution gate. A fresh independent review and a later separate
new-run-ID gate remain required before any future pair attempt.

## Vite P2-V04 attempt/output remediation

Implementation date: 2026-07-19. State: **implemented and statically verified;
fresh independent Docker-non-executing review required**.

The runner now waits for both known child and loopback-server settlement before
it inspects output. Its success path validates the exact bounded event segment,
the exact single `entry.js` output, and unchanged source, then exposes only the
event and entry files as `0444` and the fixed output directory as `0555` before
emitting success framing. Unknown child or server settlement reaches none of
the event, direct-write, or tool-output verification/export operations. Known
runner failures may make only the fixed partial event host-readable after
settlement; the host executor records their output as `not-inspected` and does
not traverse it.

The executor now writes canonical `p2-vite-attempt/v1` `attempt.json` bytes
before opening any evidence path. The record is distinct from
`p2-vite-execution/v1` `summary.json` and contains only the fixed tuple,
nullable inspected image/container outcome, Docker and runner settlement,
cleanup disposition, sanitized runner disposition, explicit output
availability, and allowlisted issue codes. A complete known-settled runner may
then use the bounded event/direct/output readers and write a separate receipt.
Known runner failure, runner/Docker settlement unknown, inaccessible metadata,
or attempt-record write failure cannot manufacture a receipt. The entry
projection distinguishes `attemptRecord: written` inconclusive results from
`attemptRecord: not-written` failures, and pair `same-image` still requires two
complete receipts with the exact ordered identities and one image ID.

Docker-free behavioral tests cover successful attempt/receipt ordering through
exported fixed paths, known and unknown runner failures whose evidence backend
must not be touched, inaccessible output metadata, attempt-record write
failure, bounded entry classification, and the two-complete-receipt pair rule.
The focused runner/executor suite passed 2 files / 47 tests,
`npm run p2:verify` passed 9 files / 105 tests, and `npm run p2:build` passed.
The root `npm run check` passed 98 files / 666 tests.
The rebuilt exact 128-file source-equal fixed-mode staging manifest is
`b321c8b629ec5967c5bfdfc04f5e8dbd5042dbe602f03d818a6a8f8a8b794976`.
Candidate hashes are `cb716d4a...` for `src/vite-executor.ts`,
`3dd83c2a...` for its test, `daeee923...` / `1246122c...` for the entry source
and declaration, and `bf272cbc...` / `6649599f...` for the runner and test.

No Docker command, runtime-socket access, retained-result read or mutation,
retry, run-ID change, Expected/Observed edit, external network, credential,
retained M4 access, remote Git, or new execution gate occurred. Standing
authorization was not needed for this non-executing task. The next task is a
fresh independent Docker-non-executing review of these exact remediation bytes,
tests, attempt/receipt schemas, entry projection, and rebuilt staging identity.
The exhausted `20260719-01` gate remains non-retryable; any later execution
proposal still requires new fixed run IDs and a separate reviewed gate.

## Vite P2-V04 remediation independent re-review

Review date: 2026-07-19. Result: **blocked; P2-V04 remains open on P2-V05 and
P2-V06**.

The
[fresh independent Docker-non-executing re-review](reviews/p2-selected-profile-vite-failure.md)
reproduced the exact remediation hashes, 128 source-equal fixed-mode staged
files, plan-order `b321c8b...` manifest, fixed tool versions, P2 105-test suite,
P2 build, and import-safe executor/entry boundary. It accepted that the
finalizer writes a separate attempt before its evidence backend is called,
unknown settlement and known runner failure do not create a receipt, the entry
distinguishes record-write failure, and `same-image` requires two complete
receipts.

P2-V05 records that the lifecycle attempt object is assigned only after start,
final inspect, and runner framing all validate. A later start or framing failure
therefore writes `null` for an image ID or exit outcome already established by
an earlier fixed inspect. P2-V06 records that the production evidence reader
launches event content and metadata reads concurrently, so an inaccessible path
can be reported as wholly `not-inspected` after another branch read bytes. The
tests use preconstructed/throwing evidence and output backends rather than the
real fixed-path validation/export and bounded-reader filesystem boundary.

No Docker command, retry, new gate, run-ID change, Expected/Observed promotion,
external communication, or retained-state mutation occurred. One overly broad
`git status --short --ignored` attempted ignored-directory enumeration and
emitted permission-denied warnings without reading retained contents or
mutating state; the review does not claim that no retained-path access was
attempted. The next task is the Docker-non-executing P2-V05/P2-V06 remediation:
retain each established inspected lifecycle field, make evidence inspection
atomic or explicitly partial, and add repository-local behavioral coverage for
the production fixed-path export/read boundary. The exhausted `20260719-01`
gate remains non-retryable, and no new execution gate may be defined before a
fresh re-review closes these findings.

## Vite P2-V05/P2-V06 remediation

Implementation date: 2026-07-19. State: **implemented and statically verified;
fresh independent Docker-non-executing re-review required**.

The lifecycle attempt now stores the inspected image ID immediately after the
fixed created-state inspect validates and stores the inspected container exit
code immediately after the fixed exited-state inspect and image/start-exit
cross-check validate. A later Docker start settlement failure therefore retains
the image ID, malformed runner framing after the final inspect retains both
fields, and create/first-inspect failures retain exact `null` values. The
canonical attempt record consumes those partial fields instead of depending on
the all-or-nothing completed lifecycle object.

The production evidence reader now completes a serial fixed-path metadata and
mode preflight before opening the event segment. It validates the exported event
mode `0444`, direct-write marker metadata, output-directory mode `0555`, exact
single `entry.js`, and entry mode `0444`; only then does it perform the bounded
event read. A failure before open remains `not-inspected`, while a failure after
open is explicitly `partially-inspected`. The runner exposes an argument-free
fixed test seam, and a repository-local Docker-free filesystem regression joins
the real runner export to the real executor reader, confirms the three export
modes and direct-write metadata, builds a successful receipt, and rejects an
unexported fixed mode before event content access.

Fake-command-to-attempt-record regressions cover unknown start settlement,
malformed runner framing after a valid final inspect, create failure, and first-
inspect failure. The focused runner/executor suite passed 2 files / 54 tests,
`npm run p2:verify` passed 9 files / 112 tests, `npm run p2:build` passed, and
compiled executor/entry imports completed without side effects. The root
`npm run check` passed formatting, lint, typecheck, and 98 files / 673 tests.
The rebuilt 128-file source-equal fixed-mode staging manifest is
`e1f83e220d80f51168a4e9335001fa08b92b29c2a4530c7e0115857e173c6a27`
with the fixed Node.js/Vite/Rollup/esbuild versions. Candidate hashes are
`5fb85fd6...` for `src/vite-executor.ts`, `ed3adaed...` for its test,
`9031bcb6...` / `3c652818...` for the runner source/declaration, and
`6841a1fa...` for the runner test. The old generated staging tree was preserved
without deletion under the ignored
`staging/vite.pre-p2-v05-v06-b321c8b`; the authoritative fixed staging root is
the newly assembled `staging/vite` tree above.

No Docker command, runtime-socket access, retained-result read or mutation,
retry, run-ID change, Expected/Observed edit, external network, credential,
retained M4 access, remote Git, or new execution gate occurred. Standing
authorization was not needed because this task was non-executing. The next task
is a fresh independent Docker-non-executing re-review of the exact P2-V05/P2-V06
implementation, fake-command and filesystem regressions, explicit partial-
inspection projection, and rebuilt staging identity. The exhausted
`20260719-01` gate remains non-retryable; another execution proposal still
requires closed findings, new fixed run IDs, and a separate reviewed gate.

## Vite P2-V05/P2-V06 remediation independent re-review

Review date: 2026-07-19. Result: **P2-V06 closed; P2-V05 remains open; no
execution gate approved**.

The
[fresh independent Docker-non-executing re-review](reviews/p2-selected-profile-vite-failure.md)
reproduced all twelve candidate hashes, the exact 128-file source-equal
fixed-mode staging tree, plan-order `e1f83e22...` manifest, fixed tool versions,
P2 112-test suite, P2 build, and import-safe executor/entry boundary. Serial
fixed-path metadata/mode preflight, post-open `partially-inspected`
classification, and the production runner-export/executor-reader filesystem
regression close P2-V06.

P2-V05 remains open because `inspectedContainerExitCode` is assigned only after
the validated final `exited` inspect also passes the image/start-exit
cross-check. A Docker-free fake-command reproduction gave the same fixed image,
start exit 0, and a valid final `exited|1` inspect; the canonical attempt remained
Inconclusive as required but emitted `null` instead of the established inspected
exit code `1`. No Docker command, runtime-socket access, retained-state access
or mutation, retry, run-ID/Expected/Observed change, external communication,
remote Git, or new execution gate occurred. Standing authorization was not
needed for this non-executing review.

The next task is the residual Docker-non-executing P2-V05 remediation: snapshot
the final-inspect exit outcome before cross-checking and add focused exit/image
cross-check fake-command regressions. Rebuild the exact staging tree and perform
another fresh re-review before considering any new-run-ID gate. The exhausted
`20260719-01` attempt remains non-retryable.

## Vite residual P2-V05 remediation

Implementation date: 2026-07-19. State: **implemented and statically verified;
fresh independent Docker-non-executing re-review required**.

`executeFixedViteLifecycleAttempt()` now stores the inspected container exit
code immediately after the fixed final `exited` inspect validates and before
the after/before image and start/inspect exit-code comparisons. A mismatch still
makes the attempt Inconclusive and cannot create a receipt, but the canonical
attempt no longer conflates an established final outcome with an unreached
inspect.

Focused fake-command-to-attempt-record regressions cover both mismatch classes.
The exit mismatch retains the created-state image ID and final inspected exit
`1`; the image mismatch retains the created-state image ID and final inspected
exit `0`. Both execute only the fixed create/inspect/start/inspect/remove
transition, write the canonical attempt, avoid the evidence backend, preserve
known Docker settlement and completed cleanup, and emit no receipt.

The focused executor suite passed 1 file / 36 tests, `npm run p2:verify` passed
9 files / 114 tests, `npm run p2:build` passed, and the compiled executor/entry
imports completed without side effects. The root `npm run check` passed
formatting, lint, typecheck, and 98 files / 675 tests. The rebuilt exact 128-file
source-equal fixed-mode staging tree reproduces plan-order manifest
`e1f83e220d80f51168a4e9335001fa08b92b29c2a4530c7e0115857e173c6a27`
with Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.
Candidate hashes are
`f8bda03cbb2e6482ee9d119d8e9fd35c7fed7b4dbb3644e7a17117e662385508`
for `src/vite-executor.ts` and
`51d2210c5b0989ecf4d8c7518a5a45bc0e0f22dc002896595a1f1bddf6238958`
for its 36-test suite. The previous staging tree is preserved without deletion
under the ignored `staging/vite.pre-p2-v05-residual-e1f83e22` path.

No Docker command, runtime-socket access, retained-result read or mutation,
retry, run-ID/Expected/Observed change, external communication, remote Git, or
new execution gate occurred. Standing authorization was not needed because this
task was non-executing. P2-V05 remains open until review. The next task is a
fresh independent Docker-non-executing re-review of the exact residual
implementation/tests and rebuilt staging identity. The exhausted `20260719-01`
attempt remains non-retryable, and no new-run-ID gate may be defined by this
implementation record.

## Vite residual P2-V05 remediation independent re-review

The fresh independent Docker-non-executing re-review reproduced the residual
executor/test hashes, both fake-command mismatch transitions, the full P2
114-test suite, the compiled import-safe executor boundary, and the exact
128-file source-equal fixed-mode staging manifest `e1f83e22...`. It found no
new blocker and closes P2-V05. Because P2-V06 was already closed, the parent
P2-V04 remediation is also closed.

The exhausted `20260719-01` attempt remains Inconclusive and non-retryable;
neither Vite scenario becomes selected profile Observed. The review did not
call Docker, access retained result state, change a run ID, define an execution
gate, or use standing authorization. The next task is a Docker-non-executing
proposal for new fixed Vite run IDs and a separate exact one-shot execution
gate bound to the approved snapshot and absent new result roots.

## Vite new-run-ID execution-gate proposal

Definition date: 2026-07-19. State: **proposal fixed; Docker-non-executing
implementation and fresh independent gate review pending; no execution gate
approved**.

The proposal fixes only the Vite pair to these new identities:

| Scenario | Profile | New run ID | New container name |
|---|---|---|---|
| `vite-observe-p` | permissive | `p2-vite-observe-p-20260719-02` | `tskaigi-p2-vite-observe-p-20260719-02` |
| `vite-observe-c` | constrained | `p2-vite-observe-c-20260719-02` | `tskaigi-p2-vite-observe-c-20260719-02` |

The distinct container names avoid depending on, inspecting, or mutating any
runtime state that may remain under the exhausted scenario-only names. The
active plan, M2-D context, runner, projection, executor command set, tests, and
exact staging bytes must all bind the same new tuples. The old `20260719-01`
IDs remain immutable historical evidence identifiers and must be rejected by
the active selected binding. Codegen identities and accepted receipts remain
unchanged.

Before this proposal was recorded, the sixteen critical approved-base hashes
listed in
[`prompts/p2-selected-profile-vite-new-run-gate.md`](../prompts/p2-selected-profile-vite-new-run-gate.md)
were reproduced exactly. Exact path checks, without parent-directory or
retained-root enumeration, observed both new result roots absent. Before those
checks, one over-broad `find` used for AGENTS discovery attempted to traverse
ignored retained-result subdirectories and emitted permission-denied warnings;
it did not read retained contents or change state, and subsequent discovery
excluded `results/**`. No Docker state was inspected or changed.

The implementation prompt permits only a Docker-free tuple/container-name
rebind, focused regressions, candidate hashes, and exact 128-file staging
rebuild. It preserves the P2-V04/P2-V05/P2-V06 closures and cannot authorize
execution. A later fresh worker must follow the separate
[`gate review prompt`](../prompts/reviews/p2-selected-profile-vite-new-run-gate-review.md)
and independently reproduce the candidate bytes, old-ID rejection, new names,
staging identity, codegen non-change, and both absent new roots. Only an
APPROVED review may authorize a still later worker to use standing authorization
for exactly one argument-free command:

```text
npm run p2:execute:vite
```

That future command is one pair attempt and is never retried on any outcome. It
authorizes no other Docker command, old-state access, direct runtime-socket
access, codegen rerun, external communication, or Observed promotion. Any
candidate receipts still require a separate Docker-free receipt review.

This proposal did not call Docker, use standing authorization, read or mutate
retained result contents, change source binding/runtime/staging bytes, create a
new result root, edit Expected/Observed, or perform external communication or
remote Git. The attempted traversal above is a recorded boundary deviation and
is not evidence from the retained attempt. The next task is the
Docker-non-executing implementation under
`prompts/p2-selected-profile-vite-new-run-gate.md`.

## Vite new-run-ID binding and staging implementation

Implementation date: 2026-07-19. State: **Docker-non-executing candidate
implemented and statically verified; fresh independent gate review required;
no execution gate approved**.

Before changing the active binding, the implementation worker reproduced all
sixteen required approved-base hashes from the implementation prompt and
reproduced the authoritative 128-file source-equal fixed-mode staging manifest
`e1f83e220d80f51168a4e9335001fa08b92b29c2a4530c7e0115857e173c6a27`.
The proposal's exact checks of only the two new result paths had found both
absent. This implementation worker's first local absence command accidentally
omitted the `p2-selected-profiles` parent and therefore is not counted as the
required pre-change recheck. No implementation command accessed, created,
moved, or deleted either correct result path, and a corrected exact-path check
after staging found both absent. The fresh gate review must independently check
them again. The verified staging tree was moved intact to the ignored
`staging/vite.pre-p2-new-run-e1f83e22` backup before the argument-free staging
command rebuilt the candidate.

The active plan, M2-D context, fixed runner, bounded projection, and executor
now accept only `p2-vite-observe-p/c-20260719-02`. Create, inspect,
attached-start, and force-remove are cross-bound to the exact distinct
`tskaigi-p2-vite-observe-p/c-20260719-02` names. Focused context and projection
regressions reject both exhausted `20260719-01` tuples. The codegen run IDs and
container-name values remain the exact prior values, and its runner,
projection, executor, receipts, and staging sources were not changed. The
P2-V04/P2-V05/P2-V06 attempt-before-evidence, partial-lifecycle, serial
preflight, partial-inspection, settlement, and cleanup boundaries remain under
their focused regressions.

The candidate identities for independent review are:

| Target | SHA-256 |
|---|---|
| `src/vite-executor.ts` | `644425cb93da6e4b3f0a107eae16868126f807a3021b05369882ba4be7d70b3d` |
| `test/vite-executor.test.ts` | `0319f3f8a0fdfb9c14e40f8528d330b4b131dad55e57268292315be9834253c4` |
| `runner/vite-executor-entry.js` | `daeee923a7887fc7747c39058a5d59a4b02bdcca55a3692653b2980d16d02dc9` |
| `runner/vite-executor-entry.d.ts` | `1246122cc5cbda3b9a50872e3f25451aecfb0e9df4b2103718564b4d86532e10` |
| `runner/vite-runner.js` | `c43a1bca2867dfb0724aa214f7eaaf20f5464f3c1a5dee9f69ed5c77743e1243` |
| `runner/vite-runner.d.ts` | `3c652818985523d940defffe8b6045dc53005ffb0d95df48c9b9941f7c042648` |
| `test/vite-runner.test.ts` | `3018a2811837909ccb0aee1baf5e7063261e1e6d75129a7dc85fdad6c15e5809` |
| `src/vite-projection.ts` | `4eadac906b28102c48899e43b5494e76d40e55271d54cbc1ec546d7620a631f4` |
| `runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `test/vite-staging.test.ts` | `b7a4a5bde14dfb093da8882f37667f099fe9f0c7b469695f9f5059be9c42d0d0` |
| `src/plan.ts` | `19396dbdeee7c9b510a883261f0074d3b0bb0568a9c54da3afc2e624aacd11d8` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `5337b98554963f46e42b2e0a22110202da0a4bf64e8ede282793e8b68d7df245` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `237c3e26306ae96d1f788410a6f5a5122a940dacc02fb67b0f49a3fd36538b13` |
| `test/vite-projection.test.ts` | `92522da1406eabd504610140d80da8231d11f05832b3e2fcf4537a07600acb18` |
| `test/plan.test.ts` | `3e5b2cf34a117f30080f44f4f16893dbba3fee98f9d4702b26b3319f6629d8c2` |
| Root `package.json` | `c6b03db42cc15fabc477663eb394a6c221f73a20a88e31293a9e968ad7f9ef82` |

The rebuilt ignored staging tree contains exactly 128 regular non-symlink
files, each source-equal with its declared `0444` or `0555` mode. Its fixed
plan-order manifest is
`96e81f8118c787d2d862182a1f5076c98015c574b6a9db3d0111a1c5716d8bed`,
with Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.
Focused M2-D context verification passed 1 file / 9 tests, the focused P2 Vite
plan/runner/projection/executor/staging suite passed 5 files / 77 tests,
`npm run m2d:verify` passed 12 files / 73 tests, `npm run p2:verify` passed 9
files / 116 tests, `npm run p2:build` and the compiled executor/entry import
check passed, `npm run p2:stage:vite` rebuilt 128 files, and the root
`npm run check` passed formatting, lint, typecheck, and 98 files / 678 tests.

This work is static/unit implementation evidence, not Docker availability,
runtime enforcement, a receipt, a same-image pair, or selected Vite Observed.
It did not call Docker, access a runtime socket, read or mutate either exhausted
result root, create either new result root, use standing authorization, change
Expected/Observed or the experiment matrix, access M4 retained state, use
external network or credentials, perform remote Git, publish, or deploy. The
initial shorthand-path deviation above is not result-root evidence. The next
task is a fresh independent Docker-non-executing review under
`prompts/reviews/p2-selected-profile-vite-new-run-gate-review.md`; the
argument-free execution command remains prohibited unless that review records
APPROVED.

## Vite new-run-ID execution-gate independent review

Review date: 2026-07-19. State: **APPROVED for the exact one-shot
`npm run p2:execute:vite` gate; not executed by this review**.

The [fresh independent Docker-non-executing gate review](reviews/p2-selected-profile-vite-new-run-gate.md)
reproduced all sixteen candidate hashes, the exact new tuple/container-name
binding, old-tuple rejection, codegen non-change, focused closure regressions,
and the 128-file source-equal fixed-mode staging manifest `96e81f81...` with
the fixed tool versions. Exact checks of only the two new result paths found
both absent. No Docker command, runtime-socket or retained-state access,
result-root creation, Expected/Observed or matrix change, external
communication, credential access, remote Git, publication, or deployment
occurred. Standing authorization was not used by this non-executing review.

The next task is a fresh worker revalidating the approved hashes, staging
identity, argument-free package script, and both absent exact new roots, then
using the `continue-repository-work` standing authorization to invoke exactly
one `npm run p2:execute:vite` pair attempt. This is not a separate human review.
The command is never retried on any outcome, no other Docker command is
authorized, and any candidate receipts require a later fresh Docker-free
review before selected Vite Observed acceptance.

## Vite new-run-ID one-shot execution

Execution date: 2026-07-19. State: **one approved pair attempt exhausted;
Inconclusive; fresh Docker-free attempt review pending**.

A fresh worker reproduced all sixteen hashes approved by the gate review, the
exact 128-file source-equal fixed-mode staging manifest
`96e81f8118c787d2d862182a1f5076c98015c574b6a9db3d0111a1c5716d8bed`,
the fixed Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild
`0.25.12` identities, the exact argument-free package script, and absence of
both fixed `20260719-02` result roots. It then used the
`continue-repository-work` standing authorization to invoke exactly one
`npm run p2:execute:vite` pair attempt. This was not a separate human review.
No Docker command outside that fixed executor sequence was invoked and the pair
was not retried.

The command exited 1 with the bounded entry projection `status: inconclusive`,
pair validity `inconclusive`, and issue `PAIR_IDENTITY_MISMATCH`. Only
`vite-observe-p` appears in the projection: completion is `inconclusive`, its
attempt record is written, evidence is `not-inspected`, no receipt is written,
and the issues are `P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED` and
`P2_ATTEMPT_OUTPUT_NOT_INSPECTED`. The exact permissive root exists as a
non-symlink mode `0700` directory. Its exact mode `0600`, 522-byte
`attempt.json` records the approved image ID, null container exit, known Docker
settlement, runner settlement `not-established`, completed cleanup, null runner,
and output availability `not-inspected`. `summary.json` is absent. The exact
constrained root remains absent. These are observed attempt facts, not a
successful profile comparison or receipt acceptance.

Neither Vite scenario is selected-profile Observed, no same-image pair exists,
and `experiment-matrix.md` remains unchanged. The next task is a fresh
Docker-free read-only review of the exact canonical attempt record, bounded
entry projection, approved source identities, and fixed root states. It must not
call Docker, inspect runtime state, read an evidence subtree, change retained
permissions, or retry either exhausted Vite attempt.

## Vite new-run-ID attempt independent review

Review date: 2026-07-19. State: **accepted only as an Inconclusive execution
attempt; P2 Vite closes with an explicit limitation**.

The [fresh Docker-free read-only review](reviews/p2-selected-profile-vite-failure.md)
reproduced all sixteen approved source identities, the exact argument-free
package script, and the canonical attempt SHA-256 `1dd63280...`. An exact-path
check found the permissive root to be a non-symlink mode `0700` directory and
`attempt.json` to be a non-symlink mode `0600`, 522-byte file. Its complete
bounded fields match the fixed permissive identity and approved image, null
container exit, known Docker settlement, runner settlement `not-established`,
completed cleanup, null runner, output `not-inspected`, and the two recorded
issues. The exact summary and constrained root remain absent.

The review reconstructed the repository-recorded bounded entry projection from
that canonical record and the approved pure projectors: pair validity remains
`inconclusive` with `PAIR_IDENTITY_MISMATCH`, and the only scenario remains a
written Inconclusive attempt with no inspected evidence or receipt. P2
verification passed 9 files / 116 tests and P2 build passed. No Docker command,
retry, runtime-state inspection, evidence-subtree read, permission change,
result write, Expected/Observed promotion, or matrix edit occurred; standing
authorization was not needed.

This review cannot establish the missing constrained outcome or same-image
pair, and the exhausted gate cannot be retried. The Vite pair remains an
explicit presentation limitation rather than selected-profile Observed. No
further safe Vite execution/recovery action remains. The next task is the
Docker-non-executing P3 minimal artifact-demo implementation and focused tests;
the fixed artifact must not be built until its exact one-build boundary is
review-ready.

## Post-MVP selected Vite measurement result

Update date: 2026-07-20. State: **the separately reviewed `20260720-01`
one-shot gate is exhausted and its fresh Docker-free result review accepts the
outcome only as the fourth immutable Inconclusive attempt**.

The canonical v3 permissive attempt retains primary
`attached-start / P2_EXECUTOR_DOCKER_TIMEOUT`, known Docker CLI settlement,
completed cleanup, no runner settlement, no inspected output, no receipt, and a
valid bounded progress prefix through `child-launched`. The constrained root is
absent. The accepted progress narrows the diagnostic history but establishes no
child settlement, lower-level timeout cause, capability outcome, constrained
attempt, or same-image pair. The tracked talk projection lists all four
attempts; selected Vite and experiment-matrix Observed remain unmeasured.

The exact result decision and fixed-path/hash evidence are recorded in
[`reviews/p2-vite-new-measurement-result.md`](reviews/p2-vite-new-measurement-result.md).
No retry, runtime-state recovery, or further selected Vite execution is
authorized.

Next: none.
