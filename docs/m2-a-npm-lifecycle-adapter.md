# M2-A npm lifecycle adapter

## Status and contract role

Status: **adapter implementation complete and independently approved with
non-blocking follow-ups; issue #43 M2A-TRR01 through M2A-TRR03 and M2A-TR01
through M2A-TR06 are closed only at the Docker-free static/unit implementation
boundary; M2A-CGR01 through M2A-CGR03 and M2A-CG01 through M2A-CG06 are closed
at construction/execution-gate contract scope; the bounded
construction/execution-gate implementation re-review closes M2A-CGI01 through
M2A-CGI03; the private-authority residual-remediation re-review closes process
settlement and implementation-scope M2A-CG02/M2A-CG03 but remains blocked on
M2A-CGI04 unchanged-child identity adoption; M2A-CG04 through M2A-CG06 remain
open;
runtime evidence-transfer boundary blocked/Inconclusive; experiment-matrix
Observed unmeasured**. See the [adapter review
record](reviews/m2-a-npm-lifecycle-adapter.md), the [fresh evidence-transfer
contract and implementation handoff](m2-a-evidence-transfer-contract.md), the
[construction/execution-gate
proposal](m2-a-evidence-transfer-construction-execution-gate.md), the
[construction/execution-gate
review](reviews/m2-a-evidence-transfer-construction-execution-gate.md), the
[construction/execution-gate remediation
re-review](reviews/m2-a-evidence-transfer-construction-execution-gate-remediation.md),
the [absence-checkpoint identity remediation
re-review](reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation.md),
the [construction/execution-gate implementation
review](reviews/m2-a-evidence-transfer-construction-execution-gate-implementation.md),
the [issue #43 contract review](reviews/m2-a-evidence-transfer-contract.md),
the [issue #43 implementation
review](reviews/m2-a-evidence-transfer-implementation.md), the [issue #43
remediation re-review](reviews/m2-a-evidence-transfer-implementation-remediation.md),
the [issue #43 residual-remediation
re-review](reviews/m2-a-evidence-transfer-implementation-residual-remediation.md),
and the [issue #43 failure-candidate correlation
re-review](reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation.md).

This document defines the Expected-only M2-A adapter boundary. The host builds and tests adapter source and static contracts only. The instrumented package is packed, installed, and executed only inside the disposable npm 12 container after the evidence-transfer boundary is approved.

## Fixed route and event contract

The private package is `@tskaigi-lab/adapter-npm-lifecycle` in `packages/npm-lifecycle-probe`. Its container-only lifecycle entry is the fixed repository-owned file:

```text
node /opt/m2a-adapter/dist/lifecycle-entry.js
```

The lifecycle entry reads only these enumerated bindings:

```text
PROBE_CANARY_M2A_RUN_ID
PROBE_CANARY_M2A_RUN_ROOT
PROBE_CANARY_M2A_LOOPBACK_PORT
PROBE_CANARY_M2A_ENVIRONMENT
```

It records one `automatic` `npm-install-lifecycle` route invocation followed by six capability attempts:

```text
0 npm-lifecycle-invocation
1 npm-lifecycle-attempt-environment
2 npm-lifecycle-attempt-file-read
3 npm-lifecycle-attempt-file-hash
4 npm-lifecycle-attempt-file-write
5 npm-lifecycle-attempt-loopback
6 npm-lifecycle-attempt-child
```

There are no official npm tool API changes. The producer segment is owned and serialized by `probe-core`; raw canary values, file content, absolute paths, errors, command output, and diffs are not event data.

## M0 boundary

The adapter carries forward M0's Node.js `v24.18.0`, npm `12.0.1`, `postinstall`, local tarball, and isolated-container assumptions. It does not modify M0's marker evidence or stdout fallback. M0's Docker `29.6.1` tmpfs-to-`docker cp` transfer remains Inconclusive, so M2-A container execution and any Observed matrix update remain blocked until a human-approved result transfer boundary exists.

## Fresh issue #43 transfer proposal

The proposed `20260721-01` contract uses one retained named volume and only
fixed post-exit `docker cp` file transfers from a naturally exited container.
It does not accept M0's stdout bundle as an M1/M2 transport, and it does not
claim that Docker `29.6.1` will expose the volume-backed files until a reviewed
one-shot occurrence observes that result. The bounded Docker-free
implementation now fixes the manifest, command and inspection plans,
container-only initializer/runner source, canonical transfer validators,
fake-only state machine, and negative/static verification without adding a
production Docker backend or execution script. Its focused 16 tests, the
existing 5 M2-A tests, and root typecheck pass. An initial root run passed all
819 tests; the final rerun retained 818 passes with one out-of-scope dirty M4
`M4_CONTROL_PATH` failure, and aggregate `check` stops earlier on the existing
M4 formatting warning. This is static/unit evidence only: no image was
constructed and no lifecycle, container, transfer, result, or `Observed`
behavior was measured.

The fresh independent Docker-free implementation review reproduces the 31-file
aggregate and closes M2A-TR01/M2A-TR02, but blocks M2A-TR03 through M2A-TR06.
The fixed host command/environment plan is incomplete, terminal descriptor
settlement is predeclared while a later close failure is ignored, complete npm
flow validation admits timeout/signal/truncation drift, and the canonical
attempt validator admits incoherent or unsanitized states. The passing positive
checks remain static/unit evidence and do not approve construction or runtime.

The exact bounded remediation and fresh independent re-review prompts are now
saved before any remediation source or test change. No adapter, probe,
transfer implementation, runtime, result, or evidence byte changed in that
prompt-only task.

That bounded Docker-free remediation is now complete. The plan fixes and
strictly validates every lifecycle argv plus the exact credential-empty
environment and empty-directory policy; container sources fail closed on all
owned descriptor close paths; complete npm terminals reject exit/signal/
timeout/truncation drift; and the fake/canonical attempt paths share a closed,
step-compatible, write-once issue/prerequisite chain. Focused static and
table-driven negatives cover all command, environment, settlement, terminal,
transfer, identity/metadata, issue, fallback, retry/cleanup, and promotion
families without importing either container source.

`npm run m2a:transfer:verify` passes 1 file / 22 tests, the existing
`npm run m2a:verify` passes 4 files / 5 tests, root typecheck passes, and root
`npm test` passes 109 files / 825 tests. Aggregate `npm run check` still stops
at the reproduced pre-existing out-of-scope M4 formatting warning before its
later stages. This remains static/unit evidence: no image, container,
lifecycle, transfer, result, or `Observed` behavior was measured.

The fresh independent Docker-free remediation re-review in
`reviews/m2-a-evidence-transfer-implementation-remediation.md` closes
M2A-TRI03 but keeps M2A-TRI01, M2A-TRI02, and M2A-TRI04 open. A read-only
negative accepted an inherited `DOCKER_HOST` because nested plan data is
compared only through JSON serialization. The completion still claims
`descriptorsClosed: true` before publication opens and closes its own handles,
and rejecting parallel handle work has no all-settled ownership barrier. The
completion/artifact and attempt validators also accept a completion with no
marker alongside an attempt claiming a valid marker transfer. These residuals
are M2A-TRR01 through M2A-TRR03; no construction/execution gate is approved.

The exact bounded residual-remediation and fresh re-review prompts are now
saved before residual source/test changes. They bind only recursive own-data
plan validation, the exact pre-publication/all-settled descriptor boundary,
and one combined candidate transfer validator. No adapter, probe, transfer
implementation, verification, runtime, result, historical, Expected, or
`Observed` byte changed in this prompt-only task, and standing authorization
was not used.

That bounded Docker-free residual remediation is now complete. The exact plan
validator recursively rejects inherited, accessor, symbol, custom-prototype,
sparse, reordered, extra, and substituted nested data without invoking input
getters. The runner uses all-settled ownership barriers for private inputs and
output captures, records only pre-publication descriptor closure, and leaves
publication settlement to natural exit plus the host correlation boundary.
The pure combined candidate validator revalidates canonical attempt,
completion, and artifact inputs and binds segment/marker inventory to exact
transfer states and the sole rebuild-failure candidate.

Focused transfer verification passes 1 file / 25 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 828 tests. Aggregate `check` still stops on the pre-existing
out-of-scope M4 formatting warning before later stages. This is Docker-free
static/unit evidence only. No container source was imported or executed; no
image, Docker, lifecycle, transfer, result, evidence, or `Observed` behavior
was measured, and standing authorization was not used. M2A-TR03 through
M2A-TR06 remain open until the saved fresh review reproduces the remediation.

Next: perform the fresh independent Docker-free read-only M2A-TRR01 through
M2A-TRR03 residual-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-implementation-residual-remediation-review.md`;
do not construct an image or execute transfer/runtime commands.

That fresh re-review closes M2A-TRR01 and M2A-TRR02 but keeps M2A-TRR03 open.
The combined candidate validator rejects the prior marker contradictions, yet
accepts `M2A_REBUILD_FAILED` when every npm step actually succeeded and all
runner-settlement booleans are false. M2A-TR03 through M2A-TR06 therefore
remain blocked; no construction/execution gate is approved. This was a
Docker-free read-only review, and no runtime action, evidence promotion, or
standing authorization was used.

The exact bounded Docker-free M2A-TRR03 failure-candidate correlation
remediation and fresh independent re-review prompts are now saved before
source/test changes. They restrict the next implementation to the pure transfer
library/declaration, focused test, static verifier if needed, and minimal five
status records. The combined candidate must correlate truthful runner
settlement, successful install/approval prerequisites, a settled integer
nonzero rebuild failure, and exact valid segment plus conditional-marker
transport. No adapter, probe, transfer implementation, verification, runtime,
result, historical, Expected, or `Observed` byte changed in this prompt-only
task, and standing authorization was not used.

Next: perform the exact bounded Docker-free M2A-TRR03 failure-candidate
correlation remediation under
`../prompts/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation.md`;
do not construct an image or execute transfer/runtime commands.

That bounded Docker-free remediation is now complete. The pure combined
candidate validator keeps complete observations unchanged and admits the sole
`M2A_REBUILD_FAILED` candidate only with truthful runner settlement, successful
install/approval terminals and approval/lock prerequisites, a settled integer
nonzero rebuild failure, exact valid segment transport, and conditional marker
consistency. The focused matrix rejects each settlement, npm-prerequisite,
rebuild-terminal, segment-state, and marker-contradiction family.

`npm run m2a:transfer:verify` passes 1 file / 26 tests, existing
`npm run m2a:verify` passes 4 files / 5 tests, root typecheck passes, and root
tests pass 109 files / 829 tests. Aggregate `npm run check` exits `1` at the
pre-existing out-of-scope M4 formatting warning before its later stages. This
remains Docker-free static/unit evidence only: no container source was imported
or executed, and no image, Docker, lifecycle, transfer, result access,
evidence promotion, external communication, or standing authorization was
used. M2A-TRR03 and M2A-TR03 through M2A-TR06 remain blocked until fresh
independent review.

Next: perform the fresh independent Docker-free read-only M2A-TRR03
failure-candidate correlation remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation-review.md`;
do not construct an image or execute transfer/runtime commands.

That fresh independent Docker-free re-review now closes M2A-TRR03 with no new
finding. It independently reproduces four positive complete/failure candidates,
36 inverse candidate contradictions, the exact 31-file identity, and the
preserved M2A-TRR01/M2A-TRR02 plan/descriptor boundaries. M2A-TR01 through
M2A-TR06 are closed only at static/unit scope; runtime behavior and evidence
remain unobserved and unapproved.

Next: define the exact Docker-free issue #43 construction/execution-gate
contract and save its fresh independent review prompt, binding the complete
constructed context and exact local `sha256:` image ID without constructing an
image or executing transfer/runtime commands.

That proposal and its fresh independent Docker-free review prompt are now
saved. The proposal preserves this adapter/event contract while fixing an
immutable tracked-source and separate npm-acquisition boundary, complete
context manifest, later offline image binding, phase-separated no-argument
entries, one-shot execution order, and evidence non-promotion. It changes no
adapter, probe, fixture, Containerfile, manifest, package script, Expected, or
`Observed` byte and approves no construction or runtime action.

Next: perform the fresh independent Docker-free read-only construction/
execution-gate contract review under the saved prompt; do not acquire npm,
construct a context or image, call Docker, or access runtime/result state.

That fresh contract review is now recorded in
`reviews/m2-a-evidence-transfer-construction-execution-gate.md` and is
`BLOCKED` on M2A-CGR01 through M2A-CGR03. The proposal does not yet bind the
actual compiler/runtime/resolver inputs and exact construction schema, the
complete numeric/argv/platform/image-binding build packet, or one exact host
copy/result publication transaction. It also both requires every one-shot
outcome to be preserved and says unknown settlement suppresses publication.
M2A-CG01 through M2A-CG06 remain open, and no implementation, acquisition,
construction, image build, or execution is approved.

Next: save the exact bounded Docker-free M2A-CGR01 through M2A-CGR03 contract-
remediation prompt and fresh independent re-review prompt; do not acquire npm,
construct a context or image, call Docker, or access runtime/result state.

The exact bounded Docker-free M2A-CGR01 through M2A-CGR03 contract-remediation
prompt and fresh independent re-review prompt are now saved before contract
repair. The next contract-only task is restricted to fixing the separately
reviewed constructor-toolchain/manifest chain, exact offline image-build and
binding packet, and exact host write-ahead copy/result transaction. It cannot
change this adapter/event contract or acquire, construct, build, execute,
transfer, inspect result state, or promote evidence.

No adapter, probe, fixture, implementation, verification, runtime, result,
historical, Expected, or `Observed` byte changed in this prompt-only task. No
Docker, external communication, or standing authorization was used.

Next: perform the exact bounded Docker-free M2A-CGR01 through M2A-CGR03
contract remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-remediation.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

M2-A construction/execution-gate contract-remediation update (2026-07-21):
the bounded Docker-free remediation is complete under the exact saved scope.
M2A-CGR01 now binds a separate not-yet-authorized Node/TypeScript toolchain
receipt, two exact private compiler processes, and the complete ordered
construction-manifest schema. M2A-CGR02 fixes the private credential-empty
build layout, five exact offline Docker argv arrays and bounds, complete
inspect projections, and canonical image-binding packet. M2A-CGR03 fixes the
result-root cwd and identity boundary plus a pessimistic write-ahead
`attempt.json` checkpoint before every Docker child; an unknown child close
permits no post-unknown action while preserving the already synced sanitized
Inconclusive checkpoint.

A repository-controlled in-memory audit reproduced the unchanged 31-row
`sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04`
and 41-row
`sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526`
aggregates. Focused Prettier checking passes for the contract, prompt pair, and
five status records; `git diff --check` exits `0`. This is contract-only
evidence. No dependency or toolchain byte was
acquired or read; no production constructor or compiler child, context, image,
Docker command, runtime/result state, transfer, evidence promotion, external
communication, or standing authorization was used. M2A-CGR01 through M2A-CGR03 and M2A-CG01
through M2A-CG06 remain open pending fresh independent re-review.

Next: perform the fresh independent Docker-free read-only M2A-CGR01 through
M2A-CGR03 contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-remediation-review.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

That fresh independent Docker-free re-review now closes M2A-CGR01 and
M2A-CGR02 at contract scope. It reproduces the fixed 31-row/41-row identities,
constructor-toolchain and construction schemas, exact offline build packet,
and canonical image binding. M2A-CGR03 remains open because the three distinct
volume/initializer/measurement absence Docker children all persist the same
canonical `absence-preflight` unknown step, so the durable checkpoint does not
identify the exact next child. No adapter, probe, implementation, acquisition,
construction, Docker, runtime/result, evidence, or `Observed` byte changed,
and standing authorization was not used.

Next: save the exact bounded Docker-free M2A-CGR03 absence-checkpoint identity
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, construct a context or image, call Docker, or access
runtime/result state.

The exact bounded Docker-free M2A-CGR03 absence-checkpoint identity remediation
and fresh independent re-review prompts are now saved before contract repair.
They fix `absence-volume`, `absence-initializer-container`, and
`absence-measurement-container` as the exact ordered step identities, each
bound to its unchanged absence-inspect argv. The adapter/event contract,
attempt schema and issue codes, write-ahead transaction, first-issue rule, and
no-post-unknown boundary remain unchanged.

No adapter, probe, fixture, normative transfer or construction contract,
implementation, verification, acquisition, construction, image, Docker,
runtime/result, historical, Expected, or `Observed` byte changed. Only the
prompt pair and status records changed. No external communication or standing
authorization was used.

Next: perform the exact bounded Docker-free M2A-CGR03 absence-checkpoint
identity contract remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

The bounded Docker-free M2A-CGR03 absence-checkpoint identity contract
remediation is now complete. The later production plan uses exactly
`absence-volume`, `absence-initializer-container`, and
`absence-measurement-container` in that order, with each step derived from and
bound one-to-one to its unchanged inspect argv. The adapter/event contract,
attempt schema, two compatible issue codes, write-ahead transaction,
chronological first issue, and no-post-unknown rule remain unchanged.

M2A-CGR03 and M2A-CG04 through M2A-CG06 remain open pending fresh independent
re-review; acquisition, construction, image build, Docker execution, transfer,
result acceptance, evidence promotion, and experiment-matrix `Observed`
remain unapproved. A repository-controlled identity inspection confirms the
exact ordered one-to-one mapping; focused Prettier checking and
`git diff --check` pass. No test was required or run. No implementation,
verification, runtime, result,
historical, Expected, or `Observed` byte changed, and no external
communication or standing authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-CGR03
absence-checkpoint identity remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation-review.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

That fresh independent Docker-free re-review now closes M2A-CGR03 with no new
finding and keeps M2A-CGR01/M2A-CGR02 closed. It reproduced the exact three
ordered child-specific step/argv mappings, all six failure/unknown preflight
checkpoints, and the inverse identity, issue, prerequisite, later-state, and
settlement contradictions. M2A-CG01 through M2A-CG06 are closed only at
contract scope; the adapter/event implementation and every runtime/evidence
boundary remain unchanged.

No adapter, probe, transfer implementation, acquisition, construction, image,
Docker, runtime/result, evidence, or `Observed` byte was changed or executed,
and standing authorization was not used. Only a later bounded Docker-free
static/unit implementation under M2A-CG06 may proceed after its prompt pair is
saved.

Next: save the exact bounded Docker-free construction/execution-gate
implementation prompt and fresh independent implementation-review prompt
before source changes; do not acquire npm or toolchain bytes, construct a
production context or image, call Docker, or access runtime/result state.

The exact bounded Docker-free construction/execution-gate implementation and
fresh independent implementation-review prompts are now saved before any
implementation or verification source change. The later task is confined to
the unchanged M2A-CG06 allowlist and must realize the reviewed constructor,
offline build/image-binding plan, child-specific write-ahead runtime plan,
canonical transfer validation, branded fake boundaries, and inverse matrix
without activating the adapter or any production entry.

No adapter, probe, transfer/construction implementation, verification,
package script, fixture, acquisition, construction, image, Docker,
runtime/result, evidence, or `Observed` byte changed or executed in this
prompt-only task. No fixed ignored root, external communication, or standing
authorization was used. M2A-CG01 through M2A-CG06 remain closed only at
contract scope.

Next: perform the exact bounded Docker-free construction/execution-gate
static/unit implementation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation.md`;
do not acquire npm or toolchain bytes, construct a production context or
image, call Docker, or access runtime/result state.

That bounded Docker-free implementation candidate is now complete. The exact
31-row/41-row identities, separate synthetic acquisition/toolchain validators,
construction manifest, five-command offline build/image binding, three
child-specific absence checkpoints, write-ahead no-post-unknown transaction,
import-safe entries, and evidence non-promotion all have focused static/unit
coverage. Focused verification passes 1 file / 36 tests, existing adapter
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 839 tests. Aggregate `check` stops at the existing
out-of-scope M4 formatting warning.

No production entry, npm/toolchain acquisition, compiler, construction, image,
Docker, lifecycle, transfer, result, evidence promotion, external
communication, or standing authorization was used. The candidate remains
below fresh independent implementation review and every runtime/result gate.

Next: perform the fresh independent Docker-free read-only construction/
execution-gate implementation review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

That fresh independent Docker-free implementation review is `BLOCKED` on
M2A-CGI01 through M2A-CGI04. It reproduced the exact 31-row/41-row identities
and preserved the adapter/event contract, but the new construction/execution
candidate still admits an unbound toolchain inventory row, publishes fake
build success without an exact image observation/binding transaction, accepts
mismatched runtime exits and null artifact-validation payloads as final
success, and has no fixed private production authority behind its three
fail-closed entries.

Focused transfer verification passes 1 file / 36 tests, existing adapter
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 839 tests. Aggregate `check` stops at the existing
out-of-scope M4 formatting warning. No adapter, probe, source/test repair,
production entry, acquisition, construction, image, Docker, lifecycle,
transfer, runtime/result, evidence promotion, external communication, or
standing authorization was used.

Next: save the exact bounded Docker-free M2A-CGI01 through M2A-CGI04
implementation-remediation prompt and fresh independent re-review prompt; do
not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

The exact bounded M2A-CGI01 through M2A-CGI04 Docker-free remediation prompt
and fresh independent re-review prompt are now saved before any source or test
repair. The later task stays inside the unchanged M2A-CG06 allowlist and may
change only the construction/execution candidate, not this adapter/event
contract, historical evidence, or any runtime result.

No adapter, probe, transfer/construction implementation, verification,
package script, fixture, acquisition, construction, image, Docker,
runtime/result, evidence, or `Observed` byte changed or executed. No fixed
ignored root, external communication, or standing authorization was used.
M2A-CGI01 through M2A-CGI04 and M2A-CG01 through M2A-CG06 remain open at
implementation scope.

Next: perform the exact bounded Docker-free M2A-CGI01 through M2A-CGI04
implementation remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI01 through M2A-CGI04 implementation-remediation handoff

The bounded Docker-free remediation candidate is now implemented inside the
unchanged M2A-CG06 allowlist. M2A-CGI01's toolchain validator rejects every
row outside the exact four-family union, and the construction manifest now
consumes a privately branded correlation derived twice from the separately
validated npm archive, both settled compiler inventories, all fixed held
inputs, the deterministic fixture archive, and the complete held context
inventory. Extra, missing, reordered, aliased, sparse, unsettled, or
source-disconnected rows reject even when a caller recomputes its own
aggregate.

M2A-CGI02's fake build transaction now consumes exact terminal and value data
for all five commands, re-runs the complete image observation validator,
creates and revalidates the same canonical image-binding bytes, and records
publication only after a settled same-byte commit. M2A-CGI03's runtime
transaction now cross-binds wait/final exits, consumes copied bytes and fixed
metadata, runs completion/file/segment/marker/artifact/attempt/combined-
candidate validators in order, creates the marker parent only after completion
validation, and permits final candidate publication only after those barriers.
Unknown settlement leaves the durable checkpoint and reaches no later action.

M2A-CGI04 adds distinct private fixed constructor, image-build, and runtime
authorities behind the unchanged closed gates. Their constructors and brands
are absent from declarations and package scripts; reusable imports remain
side-effect-free. All future receipt/context/image digests remain `null`,
both build/runtime approvals remain `false`, and every
`evidenceReview` remains `not-performed`, so current entries fail before
authority creation or filesystem/process activity.

`npm run m2a:transfer:verify` passes its static verifier and 1 file / 37
tests, `npm run m2a:verify` passes 4 files / 5 tests, root typecheck passes,
and root tests pass 109 files / 840 tests. Aggregate `npm run check` exits 1
at the pre-existing
out-of-scope formatting warning in
`containers/profile-control/test/control-host-backend.test.ts` before its
lint/typecheck/test stages. These are Docker-free static/unit and
cooperative-host observations only. No production entry, acquisition,
compiler, construction, image build/inspect, Docker/runtime-socket action,
lifecycle/probe, transfer, fixed ignored-root or runtime/result access,
evidence promotion, external communication, or standing authorization was
used.

M2A-CGI01 through M2A-CGI04 and M2A-CG01 through M2A-CG06 remain open pending
the saved fresh independent Docker-free remediation re-review; no later
acquisition, construction, image, runtime, result, or evidence gate is opened.

Next: perform the fresh independent Docker-free read-only M2A-CGI01 through
M2A-CGI04 remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

The fresh independent Docker-free construction/execution-gate remediation
re-review is now `BLOCKED` in
`reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`.
M2A-CGI01 closes, while M2A-CGI02 through M2A-CGI04 remain open on early
image-build phase validation, exact runtime settlement discrimination, and the
complete fixed private-authority transaction. The original extra-input, null-
candidate, exit-mismatch, and null-artifact contradictions now reject, but
new controlled inverses still reach offline build or final publication.

This review does not change the M2-A adapter/event contract or its prior
Docker-free static/unit closure. No adapter/probe repair, production entry,
acquisition, construction, image, Docker, lifecycle, transfer, runtime/result,
evidence promotion, external communication, or standing authorization was
used. M2A-CG01 through M2A-CG06 remain open at implementation scope.

Next: save the exact bounded Docker-free M2A-CGI02 through M2A-CGI04 residual-
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, execute a production entry, construct a context or image,
call Docker, or access runtime/result state.

The exact bounded M2A-CGI02 through M2A-CGI04 Docker-free residual-remediation
and fresh independent re-review prompts are now saved before source/test
repair. They preserve the adapter/event contract and closed M2A-CGI01 while
binding only the early-build, settlement-discriminator, and fixed private-
authority transaction gaps inside the unchanged M2A-CG06 allowlist.

No adapter, probe, transfer/construction implementation, verification, package
script, fixture, acquisition, construction, image, Docker, runtime/result,
evidence, or `Observed` byte changed or executed. No fixed ignored root,
external communication, or standing authorization was used. M2A-CGI02 through
M2A-CGI04 and M2A-CG01 through M2A-CG06 remain open at implementation scope.

Next: perform the exact bounded Docker-free M2A-CGI02 through M2A-CGI04
residual remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

The exact bounded M2A-CGI02 through M2A-CGI04 Docker-free residual remediation
is complete inside the unchanged M2A-CG06 allowlist. It adds immediate image-
row validation, exact runtime settlement branches, complete held constructor
inputs, compiler/Docker final-settlement bounds, and held result/transfer
identity and inventory checks without changing the adapter/event contract.

Focused verification passes 1 file / 42 tests, existing M2-A verification
passes 4 files / 5 tests, root typecheck passes, and root tests pass 109 files /
845 tests. Aggregate `check` stops at the pre-existing out-of-scope M4
formatting failure before lint. No adapter/probe behavior, production entry, acquisition,
construction, image, Docker, lifecycle, transfer, runtime/result state,
evidence, or `Observed` value was executed or changed. Standing authorization
was not used. M2A-CGI02 through M2A-CGI04 and M2A-CG01 through M2A-CG06 remain
open pending fresh independent re-review.

Next: perform the fresh independent Docker-free read-only residual-remediation
re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

The fresh independent residual-remediation re-review closes M2A-CGI02 and
M2A-CGI03 while preserving closed M2A-CGI01. Independent fake-only matrices
reproduced row-local image rejection, exact settlement-domain rejection, the
canonical image binding, and positive combined candidate without changing the
adapter/event contract.

M2A-CGI04 remains open because the private process helpers do not retain first
terminal cause and path-based runtime operations are not correlated to the
held result/transfer directory identities or exact full-mode/link contract.
Only M2A-CG01 closes at implementation scope. No adapter/probe repair,
production entry, acquisition, construction, image, Docker, lifecycle,
transfer, runtime/result access, evidence promotion, external communication,
or standing authorization was used.

Next: save the exact bounded Docker-free M2A-CGI04 private-authority residual-
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, execute a production entry, construct a context or image,
call Docker, or access runtime/result state.

The exact bounded Docker-free M2A-CGI04 private-authority residual-remediation
and fresh independent re-review prompts are now saved before source/test
repair. They preserve this adapter/event contract, closed M2A-CGI01 through
M2A-CGI03, and implementation-scope M2A-CG01 while binding only first-cause
process settlement and held-directory/path transaction correlation inside the
unchanged M2A-CG06 boundary.

No adapter, probe, transfer/construction implementation, declaration,
verification, package script, fixture, acquisition, construction, image,
Docker, runtime/result, evidence, or `Observed` byte changed or executed. No
fixed ignored root, external communication, or standing authorization was
used. M2A-CGI04 and M2A-CG02 through M2A-CG06 remain open at implementation
scope.

Next: perform the exact bounded Docker-free M2A-CGI04 private-authority
residual remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI04 private-authority residual-remediation handoff

The bounded Docker-free candidate now shares one first-cause/first-exit state
machine between the compiler and Docker helpers and replaces path-independent
runtime checks with held BigInt directory/path correlation. Exact full mode,
owner, link, child identity, and operation-specific inventory transitions
bracket attempt publication, held-directory sync, copies, and marker creation.
Unknown copy settlement cannot advance or publish and settles only owned local
handles. Separately branded fake-only process and directory traces exercise
the production decision boundaries without a real child, host path, or fixed
runtime root.

Focused transfer verification passes 1 file / 46 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 849 tests. Focused formatting and `git diff --check` pass;
aggregate `check` stops only at the pre-existing out-of-scope M4 formatting
warning. This is Docker-free static/unit and cooperative-host evidence only.

No adapter/probe contract, production entry, acquisition, compiler,
construction, image, Docker, lifecycle, transfer, runtime/result, evidence,
or `Observed` boundary changed or executed. No external communication or
standing authorization was used. Closed M2A-CGI01 through M2A-CGI03 and
M2A-CG01 are preserved; M2A-CGI04 and M2A-CG02 through M2A-CG06 remain open
pending fresh independent re-review.

Next: perform the fresh independent Docker-free read-only M2A-CGI04 private-
authority residual-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI04 private-authority residual-remediation re-review

The fresh Docker-free re-review closes first-cause process settlement and the
earlier parent path-replacement contradiction but remains `BLOCKED` on one
operation-specific child-identity gap. A permitted transition adopts every
post-operation child identity without proving unchanged siblings remained
stable, and the fake trace exposes no child identities for that negative.

Focused transfer verification passes 1 file / 46 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Root tests
observed one out-of-scope M4 failure after 108 files / 848 tests passed;
aggregate `check` stops at the out-of-scope M4 formatting warning. No adapter,
probe, production entry, acquisition, compiler, construction, image, Docker,
lifecycle, transfer, runtime/result, evidence, or `Observed` boundary changed
or executed.

M2A-CGI01 through M2A-CGI03 and M2A-CG01 remain closed. M2A-CG02/M2A-CG03
close at Docker-free static/unit scope; M2A-CGI04 and M2A-CG04 through
M2A-CG06 remain open.

Next: save the exact bounded Docker-free M2A-CGI04 unchanged-child-identity
residual-remediation prompt and fresh independent re-review prompt; do not
repair source or tests in that prompt-only task.

## M2A-CGI04 unchanged-child-identity prompt handoff

The exact bounded Docker-free M2A-CGI04 unchanged-child-identity residual-
remediation prompt and fresh independent re-review prompt are now saved before
any source or test repair. The pair preserves M2A-CGI01 through M2A-CGI03 and
M2A-CG01 through M2A-CG03, and limits the later repair to full unchanged-child
identity preservation, fixed operation-specific add/rename/copy/nested-marker
deltas, hardlink-alias rejection, and matching fake-only behavioral traces
inside a strict four-path subset of the unchanged M2A-CG06 allowlist.

This prompt-only task changed no implementation, declaration, verification,
package script, lockfile, Containerfile, manifest, container source, adapter/
probe source, fixture, scenario, acquisition, construction, image, Docker
object, runtime/result, historical, Expected, or `Observed` byte. It did not
access a fixed ignored root, use external communication, or use standing
authorization. M2A-CGI04 and M2A-CG04 through M2A-CG06 remain open pending the
bounded remediation and fresh re-review; M2A-CG02/M2A-CG03 retain Docker-free
static/unit closure.

Next: perform the exact bounded Docker-free M2A-CGI04 unchanged-child-identity
residual remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation.md`;
do not repair any path outside its exact allowlist or perform acquisition,
construction, Docker, transfer, or runtime/result work.

## M2A-CGI04 unchanged-child-identity residual-remediation handoff

The bounded Docker-free candidate now validates every lexical directory entry
against one full child-identity record before any transition is accepted. The
same decision boundary is used by production and the separately branded fake
trace, and binds type, full mode, effective owner/group, link count, and BigInt
device, inode, size, and mtime while rejecting disconnected, reordered,
sparse, accessor, inherited, special, and cross-name alias data.

Six fixed operation kinds cover only `attempt.next` creation, exact-identity
rename/replacement into `attempt.json`, the fixed completion and segment copy
destinations, `probe-output/` creation, and the nested fixed marker. Every
unchanged sibling must remain fully identical. The nested marker transaction
validates both marker-parent addition and the transfer parent's inode-stable
`probe-output` size/mtime update before committing either held baseline.
Unknown nested-copy settlement marks both affected parents uncertain.

Focused transfer verification passes 1 file / 48 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 851 tests. Focused formatting and `git diff --check` pass.
The aggregate `npm run check` exits 1 at the pre-existing out-of-scope
formatting warning in
`containers/profile-control/test/control-host-backend.test.ts` before lint,
typecheck, or test stages. These observations remain Docker-free static/unit
and cooperative-host evidence only.

No adapter/probe contract, production entry, fixed ignored-root access,
acquisition, production construction, image, Docker, lifecycle, transfer,
runtime/result access, evidence promotion, external communication, or
standing authorization was used. M2A-CGI01 through M2A-CGI03 and M2A-CG01
through M2A-CG03 remain closed at their recorded scopes. M2A-CGI04 and
M2A-CG04 through M2A-CG06 remain open pending the saved fresh independent
re-review; every later issue #43 gate remains frozen.

Next: perform the fresh independent Docker-free read-only M2A-CGI04 unchanged-
child-identity residual-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI04 unchanged-child-identity residual-remediation re-review

The fresh independent Docker-free re-review closes the remaining M2A-CGI04
unchanged-child-identity finding and closes M2A-CG04 through M2A-CG06 at the
static/unit cooperative-host scope while preserving M2A-CGI01 through
M2A-CGI03 and M2A-CG01 through M2A-CG03. Exact sibling, rename/replacement,
copy, nested-marker, alias, process-settlement, and pre-adoption stop traces
were independently reproduced through the production decisions' fake brands.

Focused transfer verification passes 1 file / 48 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 851 tests. Aggregate `check` still stops at the pre-existing
out-of-scope M4 formatting warning. No adapter/probe repair, production entry,
fixed ignored-root access, acquisition, construction, image, Docker,
lifecycle, transfer, runtime/result access, external communication, standing
authorization, or evidence promotion occurred in the review.

Next: save the exact Docker-free issue #43 npm-acquisition/constructor-
toolchain input-boundary contract and fresh independent review prompt; do not
acquire or inspect those future bytes or perform construction, Docker,
transfer, or runtime/result work.

## Dependency-input boundary contract handoff

The proposed Docker-free M2A-IB01 through M2A-IB06 contract is saved at
`m2-a-evidence-transfer-dependency-input-boundary.md`. It preserves this
adapter/event contract while fixing only the separate future npm archive and
constructor Node/TypeScript toolchain input candidates, atomic canonical
receipts, one-shot failure/evidence separation, and later static/unit-only
implementation boundary. Its fresh independent review prompt is saved at
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-review.md`.

No adapter/probe, fixed input root, npm/toolchain byte, host runtime byte,
integrity, digest, inventory, receipt, reviewed binding, external
communication, producer, construction, image, Docker/runtime, lifecycle,
transfer, result, standing authorization, evidence, or `Observed` boundary was
accessed or changed. M2A-IB01 through M2A-IB06 remain open pending fresh
Docker-free contract review.

Next: perform the fresh independent Docker-free read-only dependency-input
boundary contract review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-review.md`;
do not acquire or inspect npm/toolchain bytes, use external communication,
execute either producer, construct a context or image, call Docker, or access
runtime/result state.

## Dependency-input boundary contract review

The fresh independent Docker-free review closes M2A-IB01/M2A-IB02 at contract
scope and records `BLOCKED` on M2A-IB03 through M2A-IB06. The adapter/event
contract remains unchanged. The input proposal still needs exact held-
directory/second-traversal source and destination correlation, a durable
toolchain occurrence before fallible source reads, and a constructor consumer
that rejects wrong inventory modes and empty package rows.

The exact tracked aggregates and pure receipt schemas were reproduced without
reading future input roots, `/usr/bin/node` bytes, or installed package bytes.
No adapter/probe source, external communication, producer, construction,
Docker/runtime, lifecycle, transfer, result, evidence, or `Observed` boundary
was accessed or changed, and standing authorization was not used.

Next: save the exact bounded Docker-free M2A-IBR01 through M2A-IBR03 contract-
remediation prompt and fresh independent re-review prompt; do not acquire or
inspect npm/toolchain bytes, execute either producer, construct a context or
image, call Docker, or access runtime/result state.

## Dependency-input contract-remediation prompt handoff

The exact bounded Docker-free M2A-IBR01 through M2A-IBR03 contract-remediation
prompt and fresh independent re-review prompt are now saved before contract
repair. The adapter/event contract remains unchanged. The later task is
limited to complete identity-bound toolchain source/destination traversal, one
durable pre-source occurrence, and exact actual-consumer enforcement of the
selected runtime/package mode and package-size relations.

No adapter/probe, implementation, declaration, test, static verifier, package
script, fixture, scenario, input, construction, image, Docker, lifecycle,
transfer, runtime/result, evidence, Expected, or `Observed` byte changed. No
fixed ignored root, future input, host runtime/package byte, external
communication, or standing authorization was used. M2A-IB03 through M2A-IB06
remain open pending the bounded remediation and fresh re-review.

Next: perform the exact bounded Docker-free M2A-IBR01 through M2A-IBR03
contract remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-remediation.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## Dependency-input contract remediation

The bounded Docker-free M2A-IBR01 through M2A-IBR03 remediation is complete.
It adds exact same-authority source/destination completeness traversals, one
separate durable pre-source toolchain checkpoint, and only the two construction
consumer paths needed for strict live/copy mode and package-size validation.
The adapter/event contract is unchanged. M2A-IB01/M2A-IB02 remain closed;
M2A-IB03 through M2A-IB06 remain open pending fresh independent re-review.

No adapter/probe or implementation byte changed, and no input, host runtime,
producer, external communication, construction, Docker, transfer, result,
evidence, Expected, or `Observed` boundary was accessed or promoted. Standing
authorization was not used.

Next: perform the fresh independent Docker-free read-only M2A-IBR01 through
M2A-IBR03 contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation-review.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## Dependency-input contract-remediation re-review

The fresh independent Docker-free re-review closes M2A-IBR01 source/
destination completeness and M2A-IBR03 actual-consumer allowlisting at
contract scope. The adapter/event contract remains unchanged.

M2A-IBR02 remains open only on the unknown initial attempt-root creation
branch: when that operation leaves no durable root, a fresh invocation cannot
observe the prior generation-consuming uncertainty. M2A-IB03 through M2A-IB06
remain open, and no producer implementation, adapter runtime, lifecycle, or
evidence task is approved.

The exact aggregates and current consumer behavior were reproduced without
input/root access, external communication, producer execution, construction,
Docker/runtime, transfer, result access, evidence promotion, or standing
authorization.

Next: save the exact bounded Docker-free M2A-IBR02 unknown-attempt-root-
creation durability remediation prompt and fresh independent re-review prompt;
do not repair the contract in that prompt-only task or access input,
construction, Docker, transfer, or runtime/result state.

## Dependency-input M2A-IBR02 unknown-attempt-root-creation durability prompt handoff

The exact bounded Docker-free residual M2A-IBR02 contract-remediation and
fresh independent re-review prompts are saved before contract repair. The
adapter/event contract remains unchanged. The later dependency-input task is
limited to replacing the contradictory root-absent unknown-create-consumed
branch with one synchronous exclusive attempt-root `mkdirSync` commit
boundary: absence before commit is never-started, while presence at or after
commit is the durable occurrence.

No adapter/probe or dependency-input contract repair was performed, and no
implementation, declaration, test, verifier, producer, fixed input, host
runtime/package, external communication, construction, image, Docker,
lifecycle, transfer, runtime/result, evidence, Expected, or `Observed` byte
changed. Standing authorization was not used. M2A-IBR01/M2A-IBR03 remain
closed; M2A-IBR02 and M2A-IB03 through M2A-IB06 remain open pending the
bounded remediation and fresh re-review.

Next: perform the exact bounded Docker-free residual M2A-IBR02 contract
remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## Dependency-input M2A-IBR02 durability contract remediation

The bounded Docker-free dependency-input contract now replaces the root-absent
unknown-create-consumed branch with one synchronous, non-recursive, exclusive
mode-`0700` `mkdirSync` commit for the fixed attempt root. A known no-create
error or before-commit process loss is never-started; root presence at or after
atomic commit is the durable non-evidence occurrence that blocks every fresh
invocation without inspection. The adapter/event contract remains unchanged.

No adapter/probe, implementation, producer, fixed input, host runtime/package,
external communication, construction, image, Docker, lifecycle, transfer,
runtime/result, evidence, Expected, or `Observed` byte was accessed or changed.
Standing authorization was not used. M2A-IBR01/M2A-IBR03 remain closed;
M2A-IBR02 and M2A-IB03 through M2A-IB06 remain open pending fresh independent
re-review.

Next: perform the fresh independent Docker-free read-only residual M2A-IBR02
contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation-review.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## Dependency-input M2A-IBR02 durability contract-remediation re-review

The fresh independent Docker-free review closes M2A-IBR02 with no new finding.
M2A-IB01 through M2A-IB06 and M2A-IBR01 through M2A-IBR03 are now closed at
contract scope. The synchronous exclusive attempt-root commit has no returned
unknown-create branch; root absence before commit is never-started and root
presence at or after commit durably blocks every fresh invocation without
inspection. The adapter/event contract remains unchanged.

No adapter/probe or implementation byte changed. No producer, input, host
runtime/package, external communication, construction, image, Docker,
lifecycle, transfer, runtime/result, evidence, Expected, or `Observed` state
was accessed or changed. Standing authorization was not used.

Next: save the exact bounded Docker-free dependency-input implementation prompt
and fresh independent review prompt under the existing M2A-IB06 allowlist; do
not change implementation or access input, external communication,
construction, Docker, transfer, or runtime/result state in that prompt-only
task.

## Dependency-input implementation prompt handoff

The exact bounded Docker-free dependency-input implementation and fresh
independent implementation-review prompts are saved before source changes.
The later task remains inside the exact M2A-IB06 allowlist and must implement
the fixed npm/toolchain candidate producers, held-authority transactions,
actual constructor-consumer mode/size rules, fake-only inverse coverage,
import safety, and evidence separation without activating this adapter or
either producer entry.

No adapter, probe, fixture, implementation, verification, producer, input,
host runtime/package, external communication, construction, image, Docker,
lifecycle, transfer, runtime/result, evidence, Expected, or `Observed` byte
changed or executed in this prompt-only task. No fixed ignored root or
standing authorization was used. M2A-IB01 through M2A-IB06 remain closed only
at contract scope.

Next: perform the exact bounded Docker-free dependency-input static/unit
implementation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`;
do not execute either producer or access input, external communication,
construction, Docker, transfer, or runtime/result state.

## Dependency-input static/unit implementation handoff

The bounded Docker-free dependency-input implementation is complete. It leaves
this adapter, probe, fixture, lifecycle event contract, Expected values, and
`Observed` values unchanged. The no-argument producer entries remain outside
package scripts and ordinary adapter activation. Focused transfer verification
passes 1 file / 56 tests, existing adapter verification passes 4 files / 5
tests, and root typecheck passes. Aggregate root tests retain 40 out-of-scope
failures, while aggregate `check` stops at eight pre-existing formatting
warnings.

No lifecycle fixture, producer, fixed input, construction, Docker, transfer,
runtime/result, evidence promotion, external communication, or standing
authorization was used.

Next: perform the fresh independent Docker-free read-only dependency-input
implementation review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md`;
do not repair or activate this adapter or either producer in that review.

## Dependency-input implementation review decision

The fresh independent Docker-free dependency-input review is `BLOCKED` on
M2A-IBI01/M2A-IBI02. M2A-IB01, M2A-IB02, M2A-IB04, and M2A-IB05 close at
static/unit scope; M2A-IB03/M2A-IB06 remain open because production lacks the
fake-claimed held attempt-root correlation and the required runtime/source/
per-package inverse matrix is incomplete.

This adapter, its fixture and event contract, Expected, and `Observed` remain
unchanged. No lifecycle fixture, producer, input, external communication,
construction, Docker, transfer, runtime/result, evidence promotion, or
standing authorization was used.

Next: save the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation-remediation prompt and fresh independent re-review prompt; do
not repair or activate this adapter or either producer in that prompt-only
task.

## Dependency-input M2A-IBI remediation prompt handoff

The exact bounded Docker-free M2A-IBI01/M2A-IBI02 implementation-remediation
prompt and fresh independent re-review prompt are saved before source or test
repair. The later task remains outside this adapter and is limited to held
attempt-root correlation plus missing behavioral fake/unit inverse coverage.
The adapter, fixture, lifecycle event contract, Expected, and `Observed`
remain unchanged.

No adapter, probe, fixture, lifecycle, producer, fixed input, host runtime/
package, external communication, construction, image, Docker, transfer,
runtime/result, evidence promotion, or standing authorization was used.

Next: perform the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`;
do not activate this adapter or either producer, access input, call Docker, or
access runtime/result state.

## Dependency-input M2A-IBI01/M2A-IBI02 remediation handoff

The bounded Docker-free dependency-input candidate now preserves the held
attempt parent/child through initial checkpoint settlement and exercises the
complete required fake/unit inverse matrix. It leaves this adapter, probe,
fixture, lifecycle event contract, Expected values, and `Observed` values
unchanged. Focused transfer verification passes 1 file / 60 tests, existing
adapter verification passes 4 files / 5 tests, and root typecheck passes.

No lifecycle fixture, producer, fixed input, host runtime/package, external
communication, construction, Docker, transfer, runtime/result, evidence
promotion, or standing authorization was used. M2A-IBI01/M2A-IBI02 remain
pending fresh independent re-review.

Next: perform the fresh independent Docker-free read-only M2A-IBI01/M2A-IBI02
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation-review.md`;
do not activate this adapter or either producer in that review.

## Dependency-input M2A-IBI remediation re-review decision

The fresh independent Docker-free re-review closes M2A-IBI02 but remains
`BLOCKED` on residual M2A-IBI01. The fake parent-sync fact is discarded before
the shared transition receives literal `parentSynced: true`, and attempt
identity narrows BigInt size through `Number`.

The adapter, probe, fixture, lifecycle event contract, Expected, and
`Observed` remain unchanged. No lifecycle fixture, producer, fixed input, host
runtime/package, external communication, construction, Docker, transfer,
runtime/result, evidence promotion, or standing authorization was used.

Next: save the exact bounded Docker-free residual M2A-IBI01 parent-sync and
BigInt-identity remediation prompt plus fresh independent re-review prompt; do
not activate this adapter or either producer in that prompt-only task.

## Dependency-input residual M2A-IBI01 prompt handoff

The exact bounded Docker-free residual-remediation and fresh independent
re-review prompt pair is saved before source or test repair. The later task is
limited to the dependency-input support/declaration, static verifier, focused
test, and minimal status records; this adapter and its lifecycle event contract
remain outside the repair.

No implementation/test byte changed. The adapter, probe, fixture, lifecycle
event contract, Expected, and `Observed` remain unchanged. No lifecycle
fixture, producer, fixed input, host runtime/package, external communication,
construction, Docker, transfer, runtime/result, evidence promotion, or
standing authorization was used.

Next: perform the exact bounded Docker-free residual M2A-IBI01 remediation
under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md`;
do not activate this adapter or either producer, access input, construct an
image, call Docker, or access runtime/result state.

## Dependency-input residual M2A-IBI01 remediation handoff

The bounded Docker-free dependency-input candidate now carries exact
parent-sync own data and canonical BigInt-derived attempt identity through the
shared production/fake transition. Focused transfer verification passes 1
file / 61 tests, existing adapter verification passes 4 files / 5 tests, and
root typecheck passes. M2A-IBI02 retains reviewed closure;
M2A-IBI01/M2A-IB03/M2A-IB06 remain open pending fresh independent re-review.

The adapter, probe, fixture, lifecycle event contract, Expected, and
`Observed` remain unchanged. No lifecycle fixture, producer, fixed input, host
runtime/package, external communication, construction, Docker, transfer,
runtime/result, evidence promotion, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only residual M2A-IBI01
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md`;
do not activate this adapter or either producer in that review.

## Dependency-input residual M2A-IBI01 re-review decision

The fresh independent Docker-free re-review is `BLOCKED` only on missing
attempt-identity exact-key-shape behavior and an incomplete four-field static
identity guard. The current dependency-input source closes the original
parent-sync and BigInt-size contradictions. M2A-IBI02 retains closure, while
M2A-IBI01/M2A-IB03/M2A-IB06 remain open pending bounded remediation and fresh
re-review.

This adapter, probe, fixture, lifecycle event contract, Expected, and
`Observed` remain unchanged. No lifecycle fixture, producer, fixed input, host
runtime/package, external communication, construction, Docker, transfer,
runtime/result, evidence promotion, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-IBI01 identity-shape/static-
verifier remediation prompt and fresh independent re-review prompt; do not
activate this adapter or repair source/tests in that prompt-only task.

## Dependency-input M2A-IBI01 identity-verification prompt handoff

The exact bounded Docker-free M2A-IBI01 identity-verification remediation and
fresh independent re-review prompt pair is saved before verifier or focused-
test repair. The later task is limited to the dependency-input static verifier,
focused test, and minimal status allowlist; this adapter, probe, fixture, and
lifecycle event contract remain outside the repair.

No implementation, declaration, verifier, test, adapter, probe, fixture,
lifecycle, producer, fixed input, host runtime/package, external
communication, construction, image, Docker, transfer, runtime/result,
evidence, Expected, or `Observed` byte changed. Standing authorization was not
used. M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain reviewed
static/unit closure; M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

Next: perform the exact bounded Docker-free M2A-IBI01 identity-verification
remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md`;
do not activate this adapter, edit the dependency-input support
source/declaration, import or execute either producer, access input, call
Docker, or access runtime/result state.

## Dependency-input M2A-IBI01 identity-verification remediation handoff

The bounded Docker-free dependency-input candidate now covers all seven
attempt-identity exact-key-shape failures and all four BigInt-derived
production encoding guards. Focused transfer verification passes 1 file / 62
tests, existing adapter verification passes 4 files / 5 tests, and root
typecheck passes. Aggregate root tests retain 39 out-of-scope failures, and
aggregate `check` stops at eight pre-existing formatting warnings.

This adapter, probe, fixture, lifecycle event contract, Expected, and
`Observed` remain unchanged. The reviewed support/declaration, parent-sync
edge, and M2A-IBI02 matrix remain unchanged.
M2A-IBI01/M2A-IB03/M2A-IB06 remain open pending fresh independent re-review.
No lifecycle fixture, producer, fixed input, host runtime/package, external
communication, construction, Docker, transfer, runtime/result, evidence
promotion, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-IBI01 identity-
verification remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation-review.md`;
do not activate this adapter, repair source/tests, or execute either producer
in that review.

## Dependency-input M2A-IBI01 identity-verification re-review decision

The fresh independent Docker-free read-only re-review is `APPROVED` at
static/unit cooperative-host implementation scope. The focused behavior
submits all seven malformed attempt-identity shapes through the branded fake
and shared decoder without invoking accessor/Proxy attacker hooks, and the
static verifier binds device/inode/size/mtime production encodings against
direct `Number` narrowing.

M2A-IBI01/M2A-IBI02 and M2A-IB01 through M2A-IB06 are closed at implementation
scope. This adapter, probe, fixture, lifecycle event contract, Expected, and
`Observed` remain unchanged and inactive.

No lifecycle fixture, producer, fixed input, host runtime/package, external
communication, construction, Docker, transfer, runtime/result, evidence
promotion, or standing authorization was used.

Next: save the exact bounded npm-acquisition producer-execution contract and
fresh independent review prompt; do not activate this adapter, execute the
producer, access fixed input, or use external communication in that
prompt-only task.

## npm-acquisition producer execution-gate contract handoff

The Docker-free M2A-NG01 through M2A-NG06 proposal and its fresh review prompt
are saved. They bind only the separately implemented npm input producer and
preserve this adapter, probe, fixture, lifecycle contract, Expected, and
`Observed` unchanged and inactive. The contract remains pending independent
review and does not authorize external communication or producer execution.

No lifecycle fixture, producer, fixed root, host environment/runtime, external
communication, construction, Docker, transfer, runtime/result, evidence
promotion, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-NG01 through
M2A-NG06 contract review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-review.md`;
do not activate this adapter, execute or import the producer, access the fixed
acquisition root or host environment/runtime, or use external communication.

## npm-acquisition producer execution-gate contract-review decision

The fresh independent Docker-free read-only review is `BLOCKED` on the exact
entry argv identity and acquisition-root directory-link semantics
(M2A-NGR01/M2A-NGR02). M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 close at
contract scope; M2A-NG01/M2A-NG03 remain open.

This adapter, probe, fixture, lifecycle contract, Expected, and `Observed`
remain unchanged and inactive. Focused transfer verification passes 1 file /
62 tests. No lifecycle fixture, producer, fixed root, host
environment/runtime, external communication, construction, Docker,
runtime/result, evidence promotion, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-NGR01/M2A-NGR02
contract-remediation prompt and fresh independent re-review prompt; do not
activate this adapter, repair contract/source/tests, or execute the producer in
that prompt-only task.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation prompt handoff

The exact bounded Docker-free remediation and fresh independent re-review
prompt pair is saved before contract, acquisition-entry, verifier, or focused-
test repair. The later task binds the fixed host command to exact
process-observable entry authority and aligns the acquisition-root directory
with the positive-link-count production rule while retaining exact-one
archive/receipt files.

This adapter, probe, fixture, lifecycle contract, Expected, and `Observed`
remain unchanged and inactive. Only the saved prompt pair and minimal status
records changed. No execution-gate requirement, implementation, verifier,
test, lifecycle fixture, producer, fixed root, host environment/runtime,
external communication, npm candidate, construction, Docker, runtime/result,
evidence promotion, or standing authorization changed or was used.
M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 retain contract-scope closure;
M2A-NG01/M2A-NG03 remain open.

Next: perform the exact bounded Docker-free M2A-NGR01/M2A-NGR02 remediation
under
`../prompts/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation.md`;
do not activate this adapter, import or execute the producer, access fixed or
host runtime state, or use external communication.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation handoff

The bounded Docker-free candidate now separates the reviewed lexical host
command from exact canonical Node process state checked before producer
reachability and aligns the acquisition-root directory with production's
positive-link-count predicate while preserving exact-one publication files.
Function-scoped static weakening cases cover both repairs. The fresh
three-file aggregate is
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.

Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests retain 99 passing / 10 failing files and 826 passing / 39 failing
tests; aggregate `check` stops at eight pre-existing formatting warnings.
M2A-NG01/M2A-NG03 remain open pending fresh re-review; the other M2A-NG items
retain contract-scope closure. The adapter and lifecycle fixture remain
inactive.

No lifecycle fixture or producer was run, and no fixed root, host runtime,
external communication, npm candidate, construction, Docker, runtime/result,
evidence, Expected, or `Observed` boundary was used. Standing authorization
was not used.

Next: perform the fresh independent Docker-free read-only M2A-NGR01/M2A-NGR02
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation-review.md`;
do not repair source/tests, activate this adapter, execute the producer, access
fixed or host runtime state, or use external communication.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation re-review

The fresh independent Docker-free read-only re-review is `APPROVED` at
contract/static entry-guard scope. It closes M2A-NGR01/M2A-NGR02 and
M2A-NG01/M2A-NG03 while retaining M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06
closure. All six M2A-NG items are complete only at contract scope.

This adapter, probe, fixture, lifecycle contract, Expected, and `Observed`
remain unchanged and inactive. Focused transfer verification passes 1 file /
62 tests, existing M2-A verification passes 4 files / 5 tests, and root
typecheck passes. No lifecycle fixture or producer was run, and no fixed root,
host runtime, external communication, npm candidate, construction, Docker,
runtime/result, evidence, or `Observed` boundary was used. Standing
authorization was not used and cannot authorize the external occurrence.

Next: save the exact adjacent-preflight/one-occurrence execution prompt and
separate Docker-free fixed-root result-review prompt; do not activate this
adapter, execute the producer, access fixed or host runtime state, or use
external communication in that prompt-only task.

## npm-acquisition one-occurrence/result-review prompt handoff

The exact execution and separate fixed-root result-review prompts are now
saved with SHA-256 identities `cab8482f...57b0d8f` and
`a62a49b1...856aa8b`. They preserve this inactive adapter/fixture boundary:
the only future external action is the independently guarded npm input
producer, and even an accepted candidate cannot activate the lifecycle adapter
or update construction bindings in its result-review task.

No lifecycle fixture or producer was run, and no fixed root, host runtime,
external communication, npm candidate, construction, Docker, runtime/result,
evidence, Expected, or `Observed` boundary was used. Standing authorization
was not used and cannot authorize the external occurrence.

Next: a person must freshly review the saved prompt pair and explicitly
authorize its exact four-part M2A-NG06 external/fixed-side-effect boundary
before the one-occurrence execution prompt may run.
