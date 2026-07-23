# M3 first production raw-to-derived collector contract

Status: **complete at the reviewed Docker-free static/unit implementation
boundary; ingestion and activation are not approved**

This document defines frozen-research issue #47's first production adapter
boundary. It extends the independently approved synthetic M3 contract in one
direction only: the `@tskaigi-lab/adapter-codegen` `observe` scenarios. It does
not turn the existing selected-profile receipts into M3 runs, ingest an
historical result root, or define a runtime occurrence.

## Decision IDs and scope

The fresh contract review must decide these findings:

- **M3-PC01 — exact adapter and schema boundary**
- **M3-PC02 — immutable raw input and filesystem identity**
- **M3-PC03 — deterministic clean derivation and publication**
- **M3-PC04 — rejection preservation and sanitization**
- **M3-PC05 — evidence-class and Expected/Observed separation**
- **M3-PC06 — implementation and negative-test allowlist**

Only the codegen adapter is in scope. It is the first boundary because its M2-E
adapter contract is independently approved and its selected-profile pair has a
separate accepted receipt review. That choice does not import the receipt
review's conclusion into this collector. M2-A still lacks an approved transfer
boundary, and the selected Vite generations remain Inconclusive, so neither is
a valid first production collector input.

## M3-PC01 — exact adapter and schema boundary

### Versioning

The synthetic M3 fixture and all of its v2 bytes remain unchanged. The first
production boundary introduces these new versions:

- `lab-scenario-definition/v3`;
- `lab-scenario-snapshot/v3`;
- `lab-run-metadata/v3`;
- `lab-summary/v3`; and
- `lab-hash-evidence/v3`.

It reuses `probe-manifest/v2`, `probe-event/v2`,
`lab-run-completion/v1`, and `lab-canonical-event/v1` without changing them.
The v3 validators are additive. They must not reinterpret a v2 synthetic object
as v3 or emit v3 bytes for a v2 run.

### Fixed scenario family

The only accepted production scenario definitions are the version-controlled
files:

- `scenarios/codegen-observe-p.json`; and
- `scenarios/codegen-observe-c.json`.

Their fixed fields are:

| Field            | permissive                | constrained               |
| ---------------- | ------------------------- | ------------------------- |
| `scenarioId`     | `codegen-observe-p`       | `codegen-observe-c`       |
| `adapterId`      | `codegen`                 | `codegen`                 |
| `evidenceClass`  | `adapter-run`             | `adapter-run`             |
| `profileId`      | `permissive`              | `constrained`             |
| `outputLocation` | `results/runs/m3-codegen` | `results/runs/m3-codegen` |
| producer         | `codegen-cli-producer`    | `codegen-cli-producer`    |
| segment          | `codegen-cli-producer`    | `codegen-cli-producer`    |

`adapter-run` means only that the bytes came through this production adapter
schema. It is not an `Observed` promotion or a presentation claim.

The v3 snapshot adds a sanitized runtime-context input:

```text
runtimeContext.profileRevision  = bounded logical revision ID
runtimeContext.containerInput   = sha256:<64 lowercase hex>
runtimeContext.segmentRetention = immutable-raw-input
```

This contract fixes the shape and validation, not an actual profile revision,
image digest, run ID, result root, or measurement generation. A later runtime
gate must choose and review those values before an adapter run. The collector
accepts no host path, container name/ID, command, environment value, timestamp,
or raw runtime output in this context.

### Exact codegen manifest

The v3 snapshot contains exactly one segment definition with a complete
`probe-manifest/v2`. In addition to generic probe-core validation, the
production validator must bind all of the following codegen `observe` facts:

- route `codegen-cli`, adapter/tool version `0.0.0`, tool name `codegen`,
  producer `codegen-cli-producer`, worker `null`, and cwd logical ID
  `codegen-adapter-workspace`;
- the exact five ordered route invocations, six ordered capability attempts,
  and one tool API change currently fixed by the M2-E contract;
- exact target IDs, kinds, classifications, phases, trigger `explicit`,
  time/size ceilings, and `codegen-event-segment` sink;
- `observe` enables direct filesystem write, while the generator API change is
  present but disabled and therefore emits `skipped / NOT_APPLICABLE`; and
- manifest run/scenario/producer IDs match the v3 snapshot and the raw segment
  filename/definition exactly.

The M3 package must not gain a runtime dependency on the codegen package. The
v3 validator owns this frozen adapter-boundary projection and its static tests.
A later adapter-contract revision needs a new schema/review rather than silent
acceptance by this v3 boundary.

### Identity-bearing Expected contract

The v3 Expected schema replaces aggregate-only outcome/hash expectations with
ordered identity-bearing records. It names every route invocation, attempt,
tool change, and hash target. The reducer derives aggregate counts from those
records and compares both identity and semantics. This resolves M3 follow-up
F-01 for this adapter without changing v2.

Each route expectation binds route invocation ID, phase, `success`, and a null
normalized error. Each attempt expectation binds attempt ID, attempt type,
outcome, and the exact allowed normalized-error set. Each tool expectation
binds tool change ID, kind, target/classification, outcome, normalized error,
and change state. Each hash expectation binds evidence kind, producer, target,
classification, and delta state.

The exact codegen `observe` Expected rows are:

- five successful route invocations in the M2-E order;
- permissive: all six attempts succeed with null error;
- constrained: environment fails with
  `ENVIRONMENT_VARIABLE_ABSENT`; file read fails with either
  `FILE_NOT_FOUND` or `READ_DENIED`; file hash succeeds; direct write fails
  with `WRITE_DENIED`; loopback fails with either `NETWORK_FAILURE` or
  `NETWORK_TIMEOUT`; and fixed child fails with `CHILD_PROCESS_FAILURE`;
- one `emitted-asset` tool change is `skipped / NOT_APPLICABLE`; and
- `codegen-input-snapshot` source hash and
  `codegen-generated-artifact` tool evidence are both `unavailable` deltas.

The unavailable source delta is intentional. The raw event manifest declares
only the before hash. The collector must not import the separate P2 receipt's
host-side unchanged-source conclusion or invent an after hash. The tool event
is skipped, so its change state is also unavailable.

An observed result outside an allowed Expected set is a deterministic mismatch
on a complete run. It is not dropped, converted to Inconclusive, or used to
rewrite Expected.

## M3-PC02 — immutable raw input and filesystem identity

### Clean raw-only inventory

The future production activation may point only at a fixed repository-owned
parent and a separately reviewed bounded run ID. The first implementation does
not add that activation. Its internal/test entry consumes this exact raw-only
layout:

```text
<owned-root>/<run-id>/
└── raw/
    ├── manifest.snapshot.json
    ├── run-completion.snapshot.json
    └── segments/
        └── codegen-cli-producer.jsonl
```

At entry, `derived/`, `derived.staging/`, and every other sibling or raw child
must be absent. The run ID is validated as a bounded logical ID and must equal
the snapshot/manifest/event run ID; it is never accepted as an arbitrary path.

The adapter/orchestrator is responsible for creating these three immutable
raw files. The manifest snapshot is created from reviewed Expected and fixed
adapter input before the run. The completion snapshot is settled only after
the tool and segment sink close. The collector does not synthesize either one
from a P2 summary receipt.

### Held input identity

On the fixed Linux/Node.js boundary, the later implementation must:

- require run/raw/segments directories to be private `0700`, regular input
  files to be private `0600`, and every object to have the current process
  owner/group relation;
- reject symlinks, special files, extra names, multiple links, duplicate
  device/inode identities, size overflow, and a non-canonical owned root;
- open each input once with no-follow semantics, retain that same descriptor
  through both named content revalidation checkpoints and precommit close
  settlement, never reopen it, and read content only from that descriptor;
- privately record full type/mode, BigInt device/inode/uid/gid/link count and
  size, then perform the initial accepted capture by reading from descriptor
  offset zero through the exact recorded byte count, proving immediate EOF,
  copying those bytes into a fresh non-shared in-memory value, and recording
  their SHA-256 before any parse or render;
- reject replacement, rename, truncation, extension, in-place content change,
  mode/owner/link drift, or ancestor replacement without rewriting or deleting
  any raw byte.

The two repeated content checkpoints are named and ordered exactly:

1. **R1 post-render:** after the accepted capture has been fully parsed,
   validated, reduced, and rendered into the complete decided in-memory
   derived inventory, but before `derived.staging/` is created.
2. **R2 precommit:** after every staged derived file and the staging directory
   have been written, synced, read back, and identity-checked, but before any
   raw, staged-file, or held-directory descriptor is closed.

At both R1 and R2, the collector uses positioned reads from offset zero on
each originally held raw descriptor. It must read exactly the initial accepted
byte count, prove immediate EOF, recompute SHA-256, and compare both values
with the initial capture. It separately repeats full descriptor type/mode,
BigInt device/inode/uid/gid/link-count/size checks and no-follow logical path
plus run/raw/segments ancestor identity checks. A content digest never
substitutes for filesystem identity, and matching metadata never substitutes
for the same-descriptor digest. Any mismatch at either checkpoint is a
precommit filesystem rejection.

Accepted raw-file SHA-256 and size may appear in complete v3 metadata under
their logical relative names. An Inconclusive or filesystem-rejected input
must not publish raw digests: corrupt input might contain a low-entropy canary
or other prohibited value. Private device/inode/owner/path information is
never serialized.

This is a cooperative repository-owned filesystem contract, not an OS sandbox
or authenticity proof. It cannot prevent a privileged process, hostile kernel,
or malicious same-UID process from racing every path-only step. Any detected
drift fails closed.

## M3-PC03 — deterministic clean derivation and publication

### Derived inventory

A complete or Expected-mismatch input produces exactly:

```text
derived/
├── run-metadata.json
├── events.jsonl
├── summary.json
├── comparison.md
└── hashes.json
```

A safely captured but invalid, partial, corrupt, timed-out, or incomplete
content input produces exactly the sanitized Inconclusive files:

```text
derived/
├── run-metadata.json
└── summary.json
```

A missing input, invalid filesystem inventory/identity, or input drift before
publication produces no `derived/` directory. It returns only a sanitized
fixed error code to its internal caller.

All JSON is fixed-order two-space JSON plus one final LF. `events.jsonl`
contains canonical `lab-canonical-event/v1` lines with one final LF per line.
Markdown has fixed headings/order and one final LF. Producer/global ordering,
comparison ordering, error-code ordering, hash ordering, and evidence-location
ordering are independent of filesystem enumeration, timestamps, insertion
order, and absolute root.

The v3 metadata projects the snapshot's sanitized runtime context and accepted
raw input identities. Its evidence locations are logical paths below `raw/` and
`derived/`. v3 summary/comparison includes identity-bearing Expected/Observed
rows as well as deterministic aggregates. Raw `probe-event/v2` bytes remain
unchanged; canonical envelopes do not rewrite event fields.

### Transactional publication

The collector performs the initial accepted capture, fully validates/copies
those bytes, and renders the complete target inventory in private memory before
creating output. Its exact publication state machine is:

1. complete R1 post-render successfully while both output names remain absent;
2. exclusively create `derived.staging/` as private `0700`;
3. exclusively create only the decided two- or five-file inventory as `0600`;
4. write, sync, read back, and identity-check every staged file and the exact
   staging inventory, rejecting any extra, missing, aliased, replaced, or
   byte-different object;
5. complete R2 precommit successfully, repeat the staged read-back and
   inventory checks, finish every serialization and evidence classification,
   sync the staging directory, and preconstruct the exact immutable success
   result for the decided two- or five-file inventory plus the one fixed
   immutable sanitized filesystem-failure result shared by every remaining
   close or rename failure;
6. settle every raw-file, staged-file, run/raw/segments, and staging-directory
   descriptor close outcome while the output is still named only
   `derived.staging/`; every close is attempted and awaited, and any rejected
   or uncertain close prevents the rename after all remaining close outcomes
   settle; and
7. as the sole publication commit and final fallible operation, atomically
   rename exact `derived.staging/` to the previously absent `derived/` on the
   same owned filesystem.

Every error through descriptor settlement, and a failed final rename, leaves
`derived/` absent. It preserves every raw byte/name/mode, may retain at most
the exact run-owned staging state reached before failure for later diagnosis,
and returns only the already constructed sanitized internal failure
result. The collector does not clean, rewrite, classify as evidence,
or retry that state under the same run ID. No consumer reads or treats
`derived.staging/` as evidence.

A successful final rename creates exactly the decided two- or five-file
`derived/` inventory and is the only state consumers may treat as derived
evidence. After rename success, the implementation may only return the
preconstructed immutable success result: it performs no stat/read-back,
descriptor close, sync, serialization, cleanup, evidence classification,
callback, accessor invocation, or other operation that can introduce a new
failure. There is no post-publication failure branch or visible uncertain
complete-looking inventory.

"Clean regeneration" means starting with a raw-only root where both output
names are absent. Two distinct clean roots containing byte-identical raw input
and the same logical run ID must produce byte-identical declared derived
files. The collector does not delete an existing `derived/`, rewrite a raw
file, or regenerate in place over prior output.

## M3-PC04 — rejection preservation and sanitization

Every failure preserves all raw bytes and their names/modes. Rejection is
whole-run: no valid-looking prefix, event subset, count, hash, or P2 projection
is adopted from a rejected segment. Inconclusive output uses null/unavailable
counts and has no canonical event, comparison, or hash file.

The later implementation must retain the existing descriptor-only plain-data
boundary and fatal UTF-8/canonical JSONL checks. It must reject rather than
redact:

- Proxy/accessor/custom-prototype/symbol/non-enumerable/unknown/cyclic
  structured input and shared or mutable byte aliases at public pure APIs;
- missing/extra/symlink/hardlink/special/wrong-mode raw objects and every
  pre/use/post replacement or mutation;
- noncanonical JSON, invalid UTF-8, missing final LF, blank/oversize line,
  segment/event limit overflow, sequence gap/duplicate, unexpected producer,
  wrong run/scenario/profile/evidence class/runtime context, or manifest drift;
- incomplete close, timeout, unstarted/unsettled tool, or incomplete hash
  finalization; and
- an unknown route/attempt/tool/hash target, wrong outcome/error pairing, or
  data that would require best-effort interpretation.

Derived output must not contain raw canary/environment values, file content,
host absolute paths, executable/argument values, container ID/name, runtime
configuration paths, stdout/stderr, loopback bodies, unsanitized errors/stacks,
private filesystem identities, or rejected-input hashes. Known logical IDs,
normalized error codes, bounded sizes, approved source/artifact digests from
accepted events, image digest, Node/tool versions, event timestamps, and
PID/PPID/worker fields permitted by `probe-event/v2` remain allowed. PID values
are observations, not cross-run identities.

The exact negative suite must compare every raw input file byte-for-byte before
and after each rejection and prove no published derived inventory for
filesystem rejection, or exactly the two-file null/unavailable inventory for a
safely captured content rejection. It must inject same-size in-place content
mutation separately at R1 and R2; descriptor-object, logical-path, and ancestor
drift before commit; every raw/staged/directory close failure before commit;
and final rename failure. Each branch must prove raw preservation,
`derived/` absence, only exact bounded staging retention, and no retry or
cleanup. The positive commit test must also prove that no fault-injection hook,
validation, close, serialization, or classification branch exists after the
successful rename. Tests must never read or copy an historical adapter result.

## M3-PC05 — evidence-class and non-promotion boundary

- Scenario files and this document are Expected/contract evidence.
- A later passing implementation is Docker-free static/unit evidence only.
- A future complete `adapter-run` derivation is a deterministic projection of
  one immutable adapter raw bundle. It is not automatically experiment-matrix,
  selected-profile, presentation, M4-control, or general sandbox `Observed`.
- A separate fresh result review must decide whether a particular future run
  is eligible for any claim. The collector cannot edit the matrix, evidence
  map, P2 receipts, tracked presentation examples, or Expected definitions.
- Existing `p2-codegen-observe-p/c-20260719-01` roots and receipts remain
  immutable historical evidence. They are not in this raw layout, are not
  backfilled, and must not be opened by this contract or its first
  implementation/review.
- Failure, timeout, corruption, missing evidence, output uncertainty, and
  Expected mismatch remain visible. No condition is changed under the same run
  ID to force a match.
- `derived.staging/` is always non-evidence. A filesystem rejection or final
  rename failure has no published derived inventory. A successfully committed
  two-file inventory is evidence only of the sanitized Inconclusive collector
  result, while a successfully committed five-file inventory is eligible only
  for the contract's complete or Expected-mismatch projection. Neither state
  is promoted beyond `adapter-run` without a separate fresh result review.
- Because the successful rename is the final fallible operation, a visible
  exact `derived/` inventory cannot coexist with an internal postcommit
  rejection or unsettled descriptor state in this contract.

No runtime identity, command, adapter execution, Docker access, retained state,
result-root inspection, retry, publication, remote operation, or `Observed`
promotion is selected by this contract.

## M3-PC06 — exact later implementation allowlist

After a positive fresh contract review, exactly one Docker-free static/unit
implementation may change only these production paths:

- `packages/lab-cli/src/constants.ts`;
- `packages/lab-cli/src/types.ts`;
- `packages/lab-cli/src/errors.ts`;
- `packages/lab-cli/src/safe-data.ts`;
- `packages/lab-cli/src/scenario.ts`;
- `packages/lab-cli/src/collector.ts`;
- `packages/lab-cli/src/reducer.ts`;
- `packages/lab-cli/src/renderer.ts`;
- `packages/lab-cli/src/persistence.ts`;
- new `packages/lab-cli/src/codegen-production.ts`; and
- `packages/lab-cli/src/index.ts` only for pure v3 validator/collector types
  and functions, never the filesystem activation.

Only these scenario/verification paths may also change:

- new `scenarios/codegen-observe-p.json`;
- new `scenarios/codegen-observe-c.json`;
- `results/runs/README.md`;
- `packages/lab-cli/scripts/verify-static.mjs`;
- new `packages/lab-cli/test/codegen-production.test.ts`;
- `packages/lab-cli/test/collector.test.ts`;
- `packages/lab-cli/test/determinism.test.ts`;
- `packages/lab-cli/test/invalid.test.ts`;
- `packages/lab-cli/test/runner.test.ts`;
- `packages/lab-cli/test/helpers.ts`; and
- `packages/lab-cli/test/static-safety.test.ts`.

The implementation may save its own prompt and update only this document,
`docs/index.md`, `docs/milestones.md`, and
`docs/frozen-research-execution-plan.md` as status records.

No codegen-adapter source, probe-core source/schema, container/profile source,
M3 CLI/runner/fixture, package manifest/script/export map, compiled `dist`,
historical result, tracked example, matrix, evidence map, Expected outside the
two new scenario files, runtime entry, or other path is allowed. The package
root must remain import-safe and must not expose a filesystem-taking or
arbitrary-path production entry. Creating the actual raw bundle and activating
the filesystem collector require later separately reviewed tasks.

The exact implementation verification boundary is:

```sh
npm run m3:typecheck
npm run m3:build
npm run m3:static
npm run m3:test
npm run m3:verify
npm run verify:static --workspace packages/probe-core
npm run check
git diff --check
```

Tests may use only in-memory values and repository-owned disposable test roots.
They must not run an adapter, probe, lifecycle fixture, Docker/container
operation, production collector activation, external network, or historical
result-root read.

## Evidence and limitations

This is contract evidence only. It does not show that an adapter emitted the
v3 raw bundle, that the filesystem transaction works outside fake/disposable
tests, that a runtime profile enforced a capability, or that any experiment
row is Observed. SHA-256 establishes byte identity, not authenticity or
semantic harmlessness. The transaction assumes the fixed cooperative
repository-owned Linux filesystem boundary and does not claim crash-atomic
durability across hostile storage or kernel failure. In particular, the
no-postcommit-operation rule intentionally supplies no fallible parent-
directory sync after rename and makes no power-loss durability claim.

The first fresh independent Docker-free review is recorded in
`reviews/m3-production-raw-to-derived-collector-contract.md`. It closes
M3-PC01 and M3-PC06 at contract scope but keeps M3-PC02 through M3-PC05 open.
The bounded contract remediation now defines exact R1/R2 same-descriptor
byte-count and SHA-256 revalidation, keeps every raw/staged check and close
settlement under the non-evidence staging name, and makes the final rename the
sole publication commit and last fallible operation. The fresh independent
Docker-free remediation re-review in
`reviews/m3-production-raw-to-derived-collector-contract-remediation.md`
closes M3-PC02 through M3-PC05 with no new finding while M3-PC01/M3-PC06 remain
closed. It approves at most one bounded Docker-free static/unit implementation
under the unchanged M3-PC06 allowlist; ingestion, activation, runtime evidence,
and `Observed` promotion remain unapproved.

The bounded implementation saved
`../prompts/m3-production-raw-to-derived-collector-implementation.md` before
the first source change. It adds the two exact codegen `observe` v3 scenario
definitions, fixed manifest/runtime/identity-bearing Expected validators,
deterministic complete/mismatch and sanitized Inconclusive derivation, and an
internal non-package-root filesystem collector. Initial capture and R1/R2 use
the originally held descriptors for exact byte-count/EOF/SHA-256 checks while
checking object, logical-path, and ancestor identity separately. The
transaction exclusively writes, syncs, reads back, and identity-checks exact
private staging; preconstructs its result; settles every close; and uses the
successful staging-to-derived rename as its final fallible operation.

Focused static/unit coverage exercises both profiles, unexpected-but-complete
mismatch, corrupt-content Inconclusive output, two-clean-root determinism,
R1/R2 same-size content mutation, descriptor/path/ancestor/staging drift,
every close gate, rename failure, invalid inventory/type/mode/link state, raw
preservation, private output modes, and package-root non-activation.
`npm run m3:verify` passes typecheck, build, static verification, 9 test files,
and all 52 tests. Probe-core static verification reports 19 checked source
files and no failure. Root typecheck and 108 test files / 801 tests pass, as
does `git diff --check`; the aggregate `npm run check` remains non-green only
because pre-existing out-of-scope M4 files fail root formatting/lint. The exact
details remain implementation handoff evidence and must not be presented as a
passing root check.

This is Docker-free static/unit evidence only. No adapter or production
collector activation ran, no raw/historical result was opened or created, and
no profile, matrix, presentation, runtime-enforcement, or other `Observed`
evidence changed.

The fresh independent Docker-free implementation review is recorded in
`reviews/m3-production-raw-to-derived-collector-implementation.md`. It
reproduces the exact v3 definitions/manifests, R1/R2 held-descriptor checks,
private staging, registered-close settlement, final-rename terminal, 9-file /
52-test M3 pass, probe-core static pass, and 108-file / 801-test root pass. It
nevertheless records `BLOCKED`: per-kind filtering loses the fixed 12-event
cross-kind producer order, and the raw-directory, raw-file, and staged-file
open helpers can fail their first descriptor `stat()` before the opened handle
enters the close-settlement set. M3-PC02/M3-PC05 close; M3-PC01/M3-PC03/
M3-PC04/M3-PC06 remain open only on those two bounded gaps. Ingestion,
activation, runtime evidence, and `Observed` remain frozen.

Next: remediate only the cross-kind 12-event order and post-open descriptor-
settlement gaps under the unchanged M3-PC06 allowlist, saving the remediation
and fresh re-review prompts before the first source change.

The bounded implementation remediation saved
`../prompts/m3-production-raw-to-derived-collector-implementation-remediation.md`
and its fresh independent re-review prompt before the first source change. The
pure v3 collector now compares a locally frozen exact 12-entry event identity
sequence across route, capability-attempt, and tool-change kinds before the
existing per-kind semantic and hash comparisons. A canonical segment with
renumbered producer sequence but reordered cross-kind events stays complete
and is now an explicit Expected mismatch; every per-kind record in that test
continues to match.

The directory, raw-file, and staged-file helpers now register every successful
open in the owned close-settlement set before the first post-open checkpoint
and descriptor `stat()`. Fault injection at that exact boundary for all three
helper families proves the just-opened handle reaches the deterministic close
loop, raw bytes remain unchanged, `derived/` remains absent, and staging is
absent or retains only the exact partial inventory reached. The static verifier
checks the exact event-order bytes and each open/register/checkpoint/stat
topology while preserving the final-rename terminal check.

`npm run m3:verify` passes typecheck, build, static verification, 9 test files,
and all 54 tests. Probe-core static verification passes 19 source files. Root
typecheck and 108 test files / 803 tests pass. Aggregate root `npm run check`
is not recorded as passing: the pre-existing out-of-scope M4 formatting
finding stops it before later stages, and a separate lint run reports only the
existing 11 M4 errors. No production adapter occurrence or production
collector, Docker, retained/historical result, runtime identity,
Expected/Observed value,
external network, publication, or standing authorization was used or changed.

This remains Docker-free static/unit implementation evidence. M3-PC01,
M3-PC03, M3-PC04, and M3-PC06 remain pending fresh independent closure;
M3-PC02 and M3-PC05 remain closed from the first implementation review.
Ingestion, activation, runtime evidence, issue #43, and later backlog work stay
frozen.

The fresh independent Docker-free remediation re-review in
`reviews/m3-production-raw-to-derived-collector-implementation-remediation.md`
closes M3-PC01 through M3-PC06 at implementation scope with no new finding. It
reproduces the exact 12-event cross-kind comparison, immediate ownership and
settlement for all three open-helper families, final-rename terminal, focused
negative matrix, 9-file / 54-test M3 pass, probe-core static pass, and 108-file
/ 803-test root pass. The aggregate root check remains non-green only on the
recorded pre-existing out-of-scope M4 formatting/lint findings.

Issue #47 is complete only at this Docker-free static/unit boundary. No
collector activation, adapter ingestion, runtime identity/result, or
`Observed` promotion is approved.

Issue #43's first Docker-free new-generation M0/M2-A evidence-transfer
contract and fresh independent contract-review prompt are now saved. No
transfer was implemented or executed.

Next: perform the fresh independent Docker-free read-only issue #43
M2A-TR01 through M2A-TR06 contract review under the saved prompt.
