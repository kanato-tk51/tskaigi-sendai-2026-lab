# M0: npm 12 install lifecycle minimal spike

This experiment measures npm 12 dependency install-lifecycle approval behavior with a marker-only local package. It is deliberately independent of the root npm workspace and does not implement `probe-core`, an adapter, a common event schema, profiles, or a general report harness.

## Fixed environment

- Node.js: `24.18.0`
- npm: `12.0.1`
- Docker base: `node:24.18.0-bookworm-slim`
- dependency: `@tskaigi-lab/m0-install-marker@1.0.0`
- dependency supply: image-built local `.tgz`
- lifecycle: `postinstall`
- marker: `/m0-output/marker.jsonl`
- approval command: `npm approve-scripts`

`npm run m0:build` first pulls the exact base tag, resolves its `sha256` repository digest, and passes `node:24.18.0-bookworm-slim@sha256:...` as the `BASE_IMAGE` build argument. The build fails instead of using a different tag or version when Docker, the base image, npm `12.0.1`, or the expected toolchain is unavailable.

The measured environment resolved the base digest to `sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5` and used Docker `29.6.1`.

## Network boundary

Network availability is separated by phase:

- Preparation may use external network only for the Docker Official Image pull and `npm@12.0.1` installation during image build.
- Dependency packaging happens in the image build with `npm pack --ignore-scripts`; the dependency is never published.
- Every official-evidence and scenario container is created with `--network none`.
- Scenario npm commands use the local tarball plus `offline=true`; registry acquisition is not part of a scenario.

## Scenarios

Each ID gets a fresh container and fresh `/work`, `/tmp`, and `/m0-output` tmpfs:

1. `unapproved-install`: measures `npm install` with no `allowScripts` entry.
2. `approved-rebuild`: performs an initial install, invokes the official approval command, clears the marker, then measures `npm rebuild @tskaigi-lab/m0-install-marker`.
3. `approved-scripts-disabled`: retains official approval and lock state, removes `node_modules` and the marker, then measures `npm ci --ignore-scripts`.
4. `approved-reinstall`: retains approval, removes `node_modules` and the marker, then measures `npm install`.
5. `approved-ci`: retains approval and the generated lockfile, removes `node_modules` and the marker, then measures `npm ci`.

The runner records what happens. A particular marker count is not an implementation success condition.

## Commands

From the repository root:

```sh
npm run m0:build
npm run m0:doctor
npm run m0:run
npm run m0:verify
```

`m0:build` resolves the base digest and builds the image. `m0:doctor` requires the fixed image and validates static inputs plus the image labels. `m0:run` captures npm help/config evidence before starting the five scenarios. `m0:verify` validates static safety, summary shape, scenario completeness, container inspection policy, and sanitized output. A failure or Inconclusive run makes `m0:run`/`m0:verify` exit nonzero after preserving evidence.

`npm run m0:clean` removes only the fixed M0 image and disposable `experiments/npm12-install/.work` state. It preserves raw and sanitized evidence.

## Outputs

Raw results are written under `results/runs/m0/<run-id>/` and remain ignored by Git. The stable, minimal derived example is written to `results/examples/m0-npm12/`.

Each completed scenario records measured stdout/stderr, package and lockfile snapshots when present, marker JSONL when present, exact command argument arrays, and Docker inspection. Missing evidence is represented as `absent` in `result.json`; an empty file is not manufactured. The sanitizer omits raw package/lock snapshots and retains summary, commands, toolchain metadata, scenario results, approval fragments, minimal logs, and projected container policy.

## Safety boundary

The host orchestrator invokes only fixed Docker operations with `shell: false` and a disposable Docker CLI config directory, so it does not read host Docker credentials. It never accepts an image name, Docker option, mount path, or arbitrary command from user input.

Official/scenario `docker create` uses `--pull never`; image acquisition is confined to the explicit build preparation step.

Runtime containers are configured with:

- `--network none`
- `--read-only`
- `--cap-drop ALL`
- `--security-opt no-new-privileges`
- `--user 1000:1000`
- bounded memory, CPU, and PID count
- tmpfs only at `/work`, `/tmp`, and `/m0-output`
- no bind mounts, Docker socket, host home, SSH agent, credential directory, or repository mount

Docker `29.6.1` did not expose a running container's tmpfs content through `docker cp`: a fixed control file was present according to its writer, while copy reported it absent. Stopping the container also removes tmpfs data. The runner therefore emits one fixed framed JSON bundle through `docker start --attach`; the host enforces mode-specific relative paths, file count/size bounds, and per-file SHA-256 integrity before writing raw results. This fallback preserves the no-bind/no-socket boundary but does not satisfy the requested `docker cp` flow, so the run remains Inconclusive. The inspection policy is validated before startup and stored afterward. Static checks do not prove runtime isolation; the full marker script, Docker arguments, transfer fallback, and resulting inspection require human review.

## Reproduction and current limitation

The latest committed sanitized example contains all five measured scenarios. Their marker counts are respectively `0`, `1`, `0`, `1`, and `1`; every measured command exited `0`. npm recorded approval as the observed local tarball entry `allowScripts["file:/work/input/m0-install-marker-1.0.0.tgz"] = true`, and approval-scenario lock hashes were unchanged. The overall summary is Inconclusive only because the required tmpfs-to-`docker cp` evidence transfer was unavailable and the validated stdout fallback was used. Consequently `m0:run` and `m0:verify` return nonzero after preserving and checking the evidence.

The marker uses one small `appendFile` call per invocation. This supports record counting, but filesystem-level append atomicity is not proven. M0 measures only this package's `postinstall` behavior and must not be generalized to all dependency execution.

## Issue #43 M2-A transfer static/unit boundary

The fresh `20260721-01` M2-A proposal is separate from the historical M0 run.
Its versioned manifest, non-executed Containerfile, fixed no-argument volume
initializer and measurement runner, pure host-side validators, fake-only state
machine, and focused tests implement only the Docker-free boundary approved in
[`docs/m2-a-evidence-transfer-contract.md`](../../docs/m2-a-evidence-transfer-contract.md).

The only root commands added by this phase are verification commands:

```sh
npm run m2a:transfer:static
npm run m2a:transfer:test
npm run m2a:transfer:verify
```

They do not build an image, invoke Docker, run npm lifecycle commands, import
either container source, create a result root, or access retained state.

The construction/execution-gate static/unit candidate now adds pure fixed
construction, offline-build, and runtime plans; canonical acquisition,
toolchain, construction-manifest, image-binding, checkpoint, and transfer
validators; branded fake backends; and three import-safe no-argument entry
files. The entries are not package scripts and fail closed while their future
review bindings are `null` and their build/runtime approvals are `false`.
Focused verification passes 1 file / 36 tests. No acquisition, production
construction, image/context creation, Docker child, lifecycle, transfer,
result access, or evidence promotion occurred. A fresh independent Docker-free
implementation review is required before any separately gated acquisition or
construction task.

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

## M2A-CGI02 through M2A-CGI04 residual-remediation handoff

The bounded Docker-free candidate now validates every image-build row before
the next command, rejects noncanonical or contradictory runtime settlement
records, holds every fixed constructor input and receipt-listed runtime row,
fail-closes compiler phases, bounds compiler/Docker settlement without relying
on `exit`, and holds/checks the fixed result and transfer identities throughout
the private runtime transaction. All production entry gates remain closed.

`npm run m2a:transfer:verify` passes 1 file / 42 tests,
`npm run m2a:verify` passes 4 files / 5 tests, root typecheck passes, and root
tests pass 109 files / 845 tests. Aggregate `npm run check` stops at the
pre-existing out-of-scope M4 formatting warning. No production entry,
acquisition, compiler, construction, image build, Docker, lifecycle, transfer,
fixed ignored-root or runtime/result access, external communication, or
standing authorization was used.

Next: perform the fresh independent Docker-free read-only residual-remediation
re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

The fresh independent residual-remediation re-review closes M2A-CGI02 and
M2A-CGI03 while preserving closed M2A-CGI01. M2A-CGI04 remains open because
the private compiler/Docker helpers can overwrite an earlier error or exit
with later close data, and runtime path operations are not correlated to the
held result/transfer directory inode or exact full-mode/link identity. No
production entry, fixed ignored-root access, acquisition, construction, image,
Docker, lifecycle, transfer, runtime/result access, evidence promotion,
external communication, or standing authorization was used. Only M2A-CG01
closes at implementation scope.

The exact bounded Docker-free M2A-CGI04 private-authority residual-remediation
and fresh independent re-review prompts are now saved before source/test
repair. They preserve the adapter/event/transfer contracts and closed
M2A-CGI01 through M2A-CGI03 while binding only first-cause process settlement
and held-directory/path transaction correlation inside the unchanged M2A-CG06
boundary.

No experiment implementation, declaration, verification, package script,
fixture, acquisition, construction, image, Docker, runtime/result, evidence,
or `Observed` byte changed or executed. No fixed ignored root, external
communication, or standing authorization was used. M2A-CGI04 and M2A-CG02
through M2A-CG06 remain open at implementation scope.

Next: perform the exact bounded Docker-free M2A-CGI04 private-authority
residual remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI04 private-authority residual-remediation handoff

The bounded Docker-free candidate now shares one first-cause/first-exit state
machine between the compiler and Docker helpers. It retains the first failure
and exit tuple, requires an identical later close and exact descriptor
settlement for success, bounds no-exit traces, clears owned timers once, and
ignores late events. The separately branded fake driver covers spawn, error,
exit/close mismatch, timeout, overflow, signal failure, descriptor uncertainty,
late-event, exact-success, and final-bound traces without spawning a process.

The runtime transaction now correlates held BigInt identity, effective owner,
full mode, link count, stable child identities, and exact inventory before and
after every attempt publication, copy destination, and marker-parent mutation.
It syncs through the held result/transfer descriptors and replaces broad
mutation adoption with operation-specific transitions. Unknown copy settlement
does not advance, validate, or publish and settles only already owned handles.
Fake-only traces reject replacement, metadata, inventory, copy/marker
substitution, and post-operation drift before later action.

`npm run m2a:transfer:verify` passes 1 file / 46 tests,
`npm run m2a:verify` passes 4 files / 5 tests, root typecheck passes, and root
tests pass 109 files / 849 tests. Focused Prettier checking and
`git diff --check` pass. Aggregate `npm run check` exits 1 at the pre-existing
out-of-scope formatting warning in
`containers/profile-control/test/control-host-backend.test.ts`. These are
Docker-free static/unit and cooperative-host observations only.

No production entry, fixed ignored-root access, acquisition, compiler,
construction, image build, Docker/runtime-socket action, lifecycle, transfer,
runtime/result access, evidence promotion, external communication, or standing
authorization was used. M2A-CGI01 through M2A-CGI03 and M2A-CG01 remain
closed. M2A-CGI04 and M2A-CG02 through M2A-CG06 remain open pending fresh
independent re-review; every later issue #43 gate remains frozen.

Next: perform the fresh independent Docker-free read-only M2A-CGI04 private-
authority residual-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI04 private-authority residual-remediation re-review

The fresh Docker-free re-review closes the first-cause compiler/Docker process
finding and the original held-parent/path replacement finding. It remains
`BLOCKED` because permitted transitions adopt the entire post-operation child
identity map without comparing unchanged child identities, while the fake
trace cannot express that sibling replacement.

Focused transfer verification passes 1 file / 46 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Root tests
observed one out-of-scope M4 failure after 108 files / 848 tests passed;
aggregate `check` stops at the out-of-scope M4 formatting warning. No
production entry, fixed root, acquisition, compiler, construction, image,
Docker, lifecycle, transfer, runtime/result, evidence promotion, external
communication, or standing authorization was used.

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
`prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation.md`;
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

No production entry, fixed ignored-root access, acquisition, production
construction, image, Docker, lifecycle, transfer, runtime/result access,
evidence promotion, external communication, or standing authorization was
used. M2A-CGI01 through M2A-CGI03 and M2A-CG01 through M2A-CG03 remain closed
at their recorded scopes. M2A-CGI04 and M2A-CG04 through M2A-CG06 remain open
pending the saved fresh independent re-review; every later issue #43 gate
remains frozen.

Next: perform the fresh independent Docker-free read-only M2A-CGI04 unchanged-
child-identity residual-remediation re-review under
`prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI04 unchanged-child-identity residual-remediation re-review

The fresh independent Docker-free re-review closes the remaining unchanged-
child-identity finding. Production and the separately branded fake trace use
the same complete child-identity transition decision for all six fixed
operation kinds; exact siblings, rename/replacement, top-level copies, the
correlated nested marker, hardlink aliases, and pre-adoption stops were
independently reproduced. M2A-CGI01 through M2A-CGI04 and M2A-CG01 through
M2A-CG06 are closed at their recorded contract or Docker-free static/unit
cooperative-host scopes.

Focused transfer verification passes 1 file / 48 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 851 tests. Aggregate `check` still stops at the pre-existing
out-of-scope M4 formatting warning. No implementation repair, production
entry, fixed ignored-root access, acquisition, construction, image, Docker,
lifecycle, transfer, runtime/result access, external communication, standing
authorization, or evidence promotion occurred in the review.

Next: save the exact Docker-free issue #43 npm-acquisition/constructor-
toolchain input-boundary contract and fresh independent review prompt; do not
acquire or inspect those future bytes or perform construction, Docker,
transfer, or runtime/result work.

## Dependency-input static/unit implementation handoff

The bounded Docker-free dependency-input implementation is complete. The two
fixed no-argument producer entries remain outside package scripts and were
never imported or executed. The support library, declaration, fake-only
state machines, strict validators, held-authority production transitions, and
actual constructor-consumer mode/size correction pass focused transfer
verification (1 file / 56 tests), existing M2-A verification (4 files / 5
tests), and root typecheck. Aggregate root tests retain 40 out-of-scope
failures; aggregate `check` stops at eight pre-existing formatting warnings.

No npm acquisition, toolchain capture, lifecycle, fixed input, external
communication, construction, image, Docker, transfer, runtime/result,
evidence promotion, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only dependency-input
implementation review under
`prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md`;
do not repair or execute either producer in that review.

## Dependency-input M2A-IBI remediation prompt handoff

The fresh independent implementation review records `BLOCKED` on M2A-IBI01
and M2A-IBI02. The exact bounded Docker-free remediation prompt is now saved
at
`prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`,
with its fresh independent re-review prompt saved before source or test
repair. The pair limits the later task to one held attempt-parent/child
correlation through initial checkpoint settlement and the missing behavioral
runtime/source/destination/every-package-family inverse matrix.

No implementation, declaration, test, static verifier, producer, fixed input,
host runtime/package, external communication, construction, image, Docker,
transfer, runtime/result, evidence, Expected, or `Observed` byte changed or
was accessed. Standing authorization was not used.

Next: perform the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation remediation under the saved prompt; do not import or execute
either producer, access input, use external communication, construct an image,
call Docker, or access runtime/result state.

## Dependency-input M2A-IBI01/M2A-IBI02 remediation handoff

The bounded Docker-free remediation candidate now keeps the original held
`WORK_ROOT` descriptor and its no-follow opened, exactly correlated committed
attempt-root child through original-parent sync and the complete in-progress
checkpoint transaction. Production and the separately branded fake consume
the same parent/child/inventory correlation validator. Focused behavioral
coverage now rejects the held-authority contradictions and the complete
runtime, source, destination, every-package-family, and actual-constructor
inverse matrix.

Focused transfer verification passes 1 file / 60 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests observed 99 passing / 10 failing files and 824 passing / 39 failing
tests; the failures remain outside this bounded M2-A remediation.
Aggregate `npm run check` exits during formatting on eight pre-existing
out-of-scope warnings before lint, typecheck, or tests.
M2A-IBI01/M2A-IBI02 and M2A-IB03/M2A-IB06 remain open pending the saved fresh
independent re-review; M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain their
reviewed static/unit closure.

Neither producer was imported or executed. No fixed input, host
runtime/package, external communication, construction, image, Docker,
transfer, runtime/result, evidence promotion, `Observed`, or standing
authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-IBI01/M2A-IBI02
remediation re-review under
`prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation-review.md`;
do not repair implementation or execute either producer in that review.

## Dependency-input M2A-IBI remediation re-review decision

The fresh independent Docker-free re-review is `BLOCKED` only on residual
M2A-IBI01. M2A-IBI02 closes at static/unit scope after the runtime, source,
destination, every-package-family, and eight actual-constructor negatives were
reproduced. M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain implementation-scope
closure; M2A-IB03/M2A-IB06 remain open.

The fake `attempt-parent-sync` result is still only a marker: it is discarded
before the shared transition validator receives literal
`parentSynced: true`. Attempt identity also narrows BigInt size through
`Number`. No producer was imported or executed, and no fixed input, host
runtime/package, external communication, construction, Docker, transfer,
runtime/result, evidence promotion, `Observed`, or standing authorization was
used.

Next: save the exact bounded Docker-free residual M2A-IBI01 parent-sync and
BigInt-identity remediation prompt plus fresh independent re-review prompt; do
not repair implementation or tests in that prompt-only task.

## Dependency-input residual M2A-IBI01 prompt handoff

The exact bounded Docker-free residual-remediation prompt is saved at
`prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md`,
with its fresh independent re-review prompt saved under `prompts/reviews/`
before source or test repair. The later task is limited to the dependency-input
support/declaration, static verifier, focused test, and minimal status records.
It must carry one exact-own-data parent-sync fact through the same production/
fake commit transition and retain device, inode, size, and mtime in one exact
non-narrowed BigInt-derived representation.

No implementation, declaration, test, verifier, producer, fixed input, host
runtime/package, construction, image, Docker, transfer, runtime/result,
evidence, Expected, or `Observed` byte changed in this prompt-only task. No
external communication or standing authorization was used. M2A-IBI02 and
M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 remain closed at their recorded static/
unit scopes; M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

Next: perform the exact bounded Docker-free residual M2A-IBI01 remediation
under the saved prompt; do not import or execute either producer, access input,
use external communication, construct an image, call Docker, or access
runtime/result state.

## Dependency-input residual M2A-IBI01 remediation handoff

The bounded Docker-free residual candidate now decodes one exact-own-data
parent-sync record in both production and the separately branded fake before
passing only its `parentSynced` fact into the shared commit transition.
BigInt-derived device, inode, size, and mtime remain canonical nonnegative
decimal strings, including a focused greater-than-safe-integer size. False,
missing, extra, reordered, inherited, accessor, symbol, proxy, wrong-success,
unknown-settlement, precision-colliding, numeric, BigInt, and malformed
representations fail before checkpoint publication or runtime/source reads.

Focused transfer verification passes 1 file / 61 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests observed 99 passing / 10 failing files and 825 passing / 39 failing
tests. Aggregate `check` stops at eight pre-existing out-of-scope formatting
warnings. M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain their
reviewed static/unit closure; M2A-IBI01/M2A-IB03/M2A-IB06 remain open pending
fresh independent re-review.

Neither producer was imported or executed. No fixed input, host
runtime/package, external communication, construction, image, Docker,
transfer, runtime/result, evidence promotion, `Observed`, or standing
authorization was used.

Next: perform the fresh independent Docker-free read-only residual M2A-IBI01
remediation re-review under
`prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md`;
do not repair source or tests or execute either producer in that review.

## Residual M2A-IBI01 remediation re-review decision

The fresh independent Docker-free re-review is `BLOCKED` only on two remaining
verification findings. The current source closes the original false-parent-
sync and `Number(stat.size)` contradictions, but the focused suite does not
submit exact-key-shape attempt identities and the static verifier binds only
the size encoding rather than all four BigInt-derived device/inode/size/mtime
encodings. M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain reviewed
static/unit closure; M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

No producer, fixed input, external communication, construction, Docker,
transfer, runtime/result, evidence, `Observed`, or standing authorization was
used.

Next: save the exact bounded Docker-free M2A-IBI01 identity-shape/static-
verifier remediation prompt and fresh independent re-review prompt; do not
repair source or tests in that prompt-only task.

## M2A-IBI01 identity-verification prompt handoff

The exact bounded Docker-free M2A-IBI01 identity-verification remediation
prompt is saved at
`prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md`,
with its fresh independent re-review prompt saved under `prompts/reviews/`
before verifier or focused-test repair. The later task is limited to the
static verifier, focused test, and minimal status records.

No implementation, declaration, verifier, test, producer, fixed input, host
runtime/package, external communication, construction, image, Docker,
transfer, runtime/result, evidence, Expected, or `Observed` byte changed.
Standing authorization was not used. M2A-IBI02 and
M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain reviewed static/unit closure;
M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

Next: perform the exact bounded Docker-free M2A-IBI01 identity-verification
remediation under the saved prompt; do not edit the support
source/declaration, import or execute either producer, access input, use
external communication, construct an image, call Docker, or access
runtime/result state.

## M2A-IBI01 identity-verification remediation handoff

The bounded Docker-free candidate now submits missing, extra, reordered,
inherited, accessor, symbol, and Proxy attempt identities through the branded
fake and shared attempt-correlation decoder. Every case stops with
`M2A_TOOLCHAIN_ATTEMPT_CORRELATION_INVALID` after the retained failed
checkpoint and before checkpoint publication or runtime/source/package reads;
the accessor getter and Proxy traps remain uninvoked. Static verification now
requires the exact device, inode, size, and mtime BigInt `.toString()`
encodings and rejects `Number` narrowing of each field.

Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests observed 99 passing / 10 failing files and 826 passing / 39 failing
tests. Aggregate `check` stops at eight pre-existing out-of-scope formatting
warnings. The reviewed support source/declaration, parent-sync edge,
M2A-IBI02 matrix, adapter/fixture, and evidence boundaries remain unchanged.
M2A-IBI01/M2A-IB03/M2A-IB06 remain open pending fresh independent re-review.

Neither producer was imported or executed. No fixed input, host
runtime/package, external communication, construction, image, Docker,
transfer, runtime/result, evidence promotion, `Observed`, or standing
authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-IBI01 identity-
verification remediation re-review under
`prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation-review.md`;
do not repair source/tests or execute either producer in that review.

## M2A-IBI01 identity-verification remediation re-review

The fresh independent Docker-free read-only re-review is `APPROVED` at
static/unit cooperative-host implementation scope. Missing, extra, reordered,
inherited, accessor, symbol, and Proxy attempt identities all reach the branded
fake/shared decoder terminal with the committed occurrence and failed
checkpoint retained, no candidate publication or cleanup/retry, no checkpoint
publication or runtime/source/package read, and zero accessor/Proxy invocation.

Static verification binds the exact BigInt-derived device/inode/size/mtime
production encodings against direct `Number` narrowing. Focused verification
passes 1 file / 62 tests; M2A-IBI01/M2A-IBI02 and M2A-IB01 through M2A-IB06
are closed at implementation scope. Producer execution remains separately
unauthorized.

No producer, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, evidence promotion,
`Observed`, or standing authorization was used.

Next: save the exact bounded npm-acquisition producer-execution contract and
fresh independent review prompt; do not execute the producer, access fixed
input, or use external communication in that prompt-only task.

## npm-acquisition producer execution-gate contract handoff

The Docker-free M2A-NG01 through M2A-NG06 proposal binds the current
three-file acquisition executable closure, exact credential-empty two-request
transport, durable root-first occurrence, bounded terminal projection,
separate candidate review, and explicit-human external authority. Its fresh
review prompt is saved; the contract remains unreviewed and execution remains
unauthorized.

No producer, ignored root, host environment/runtime, external communication,
npm candidate byte, lifecycle, construction, Docker, transfer, runtime/result,
evidence promotion, `Observed`, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-NG01 through
M2A-NG06 contract review under
`prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-review.md`;
do not execute or import the producer, access the fixed acquisition root or
host environment/runtime, or use external communication.

## npm-acquisition producer execution-gate contract review

The fresh independent Docker-free read-only review is `BLOCKED` on
M2A-NGR01/M2A-NGR02. M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 close at contract
scope. M2A-NG01 remains open because the entry does not bind the exact
`/usr/bin/node` and lexical script argv pair; M2A-NG03 remains open because
the contract's one-link acquisition-root directory conflicts with
production's positive-link-count check.

The exact three-file identity and aggregate, two-request transport,
root-first retention direction, process/result separation, and
explicit-human external authority were reproduced. Focused transfer
verification passes 1 file / 62 tests. No producer, fixed root, host
environment/runtime, external communication, npm candidate, lifecycle,
construction, Docker, transfer, runtime/result, evidence promotion,
`Observed`, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-NGR01/M2A-NGR02
contract-remediation prompt and fresh independent re-review prompt; do not
repair contract/source/tests or execute the producer in that prompt-only task.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation prompt handoff

The exact bounded Docker-free remediation prompt and its fresh independent
re-review prompt are saved before contract, acquisition-entry, verifier, or
focused-test repair. The later task fixes only the host/process invocation
authority and acquisition-root directory-link semantics while keeping this
lifecycle experiment inactive.

Only the saved prompt pair and minimal status records changed. No execution-
gate requirement, implementation, verifier, test, lifecycle fixture, producer,
fixed root, host environment/runtime, external communication, npm candidate,
construction, Docker, transfer, runtime/result, evidence promotion,
`Observed`, or standing authorization changed or was used. M2A-NG02/M2A-NG04/
M2A-NG05/M2A-NG06 retain contract-scope closure; M2A-NG01/M2A-NG03 remain
open.

Next: perform the exact bounded Docker-free M2A-NGR01/M2A-NGR02 remediation
under
`prompts/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation.md`;
do not run the lifecycle fixture, import or execute the producer, access fixed
or host runtime state, or use external communication.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation handoff

The bounded Docker-free candidate now binds the reviewed lexical host command
separately from the exact canonical executable/argv/cwd/empty-environment
state checked before producer reachability. It also aligns the acquisition
root with production's positive directory-link predicate while preserving
exact-one publication files. Function-scoped static weakening cases cover both
repairs. The fresh three-file aggregate is
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.

Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests retain 99 passing / 10 failing files and 826 passing / 39 failing
tests; aggregate `check` stops at eight pre-existing out-of-scope formatting
warnings. M2A-NG01/M2A-NG03 remain open pending fresh independent re-review;
M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 retain contract-scope closure.

No lifecycle fixture or producer was run, and no fixed root, host runtime,
external communication, npm candidate, construction, Docker, runtime/result,
evidence, or `Observed` boundary was used. Standing authorization was not
used.

Next: perform the fresh independent Docker-free read-only M2A-NGR01/M2A-NGR02
remediation re-review under
`prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation-review.md`;
do not repair source/tests, run the lifecycle fixture or producer, access fixed
or host runtime state, or use external communication.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation re-review

The fresh independent Docker-free read-only re-review is `APPROVED` at
contract/static entry-guard scope. The exact lexical host command and
canonical Node-observable guard are complementary authorities, and the
positive acquisition-root directory-link rule remains separate from exact-one
publication files. M2A-NGR01/M2A-NGR02 and M2A-NG01/M2A-NG03 close; all six
M2A-NG items are now closed only at contract scope.

Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests retain 99 passing / 10 failing files and 826 passing / 39 failing
tests. No lifecycle fixture or producer was run, and no fixed root, host
runtime, external communication, npm candidate, construction, Docker,
runtime/result, evidence, or `Observed` boundary was used. Standing
authorization was not used and cannot authorize the later external occurrence.

Next: save the exact adjacent-preflight/one-occurrence execution prompt and
separate Docker-free fixed-root result-review prompt; do not run the lifecycle
fixture or producer, access fixed or host runtime state, or use external
communication in that prompt-only task.
