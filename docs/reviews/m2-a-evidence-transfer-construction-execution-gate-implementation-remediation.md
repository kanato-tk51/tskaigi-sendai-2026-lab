# M0/M2-A construction/execution-gate implementation-remediation re-review

## Review target and decision

- Target: frozen-research issue #43's bounded M2A-CGI01 through M2A-CGI04
  Docker-free implementation-remediation candidate
- Review type: fresh independent Docker-free read-only remediation re-review
- Review prompt:
  [m2-a-evidence-transfer-construction-execution-gate-implementation-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation-review.md)
- Decision: **BLOCKED; no acquisition, production construction, image build,
  Docker execution, transfer, or result task is approved**
- Closed finding: M2A-CGI01
- Residual blocking findings: M2A-CGI02 through M2A-CGI04 below
- Non-blocking findings: none
- Implementation or test repair performed in this review: none

The remediation closes the exact toolchain-family union and complete
constructed-context correlation from M2A-CGI01. It also rejects the original
null candidate-inspect, mismatched initializer-exit, and null copied-artifact
contradictions, reaches the canonical combined-candidate boundary on its
positive fake path, and adds three private authority implementations behind
the closed gates. Those changes do not yet close the reviewed transaction as a
whole: known-invalid early build values advance through the later offline-build
row, noncanonical runtime settlement discriminators can be treated as success,
and the private production implementations do not yet enforce the complete
reviewed descriptor/process/phase transaction.

Standing authorization was not needed or used. This review did not inspect a
fixed ignored root, import or execute a production entry, acquire npm or
toolchain bytes, construct a context or image, call Docker, execute a lifecycle
or transfer, or access runtime/result state.

## Reproduced identities and allowlist

The review opened the 41 fixed repository inputs read-only with `O_NOFOLLOW`,
checked one-link regular-file identity before and after each read, settled each
descriptor close, and independently reproduced:

```text
31 rows: sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04
41 rows: sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526
```

The exact remediation implementation, declaration, verification, test, and
saved-prompt identities reviewed at this decision are:

| Path | SHA-256 |
| --- | --- |
| `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` | `d6b1359b0ea4db1a4208e05330c4cc469685f996d14acfff834563711ed30d78` |
| `experiments/npm12-install/scripts/m2a-transfer-construction.d.mts` | `baf28418feac3f8936133dfe98e6b7a498eead24be7033c9a62eab90b7ac435b` |
| `experiments/npm12-install/scripts/m2a-transfer-production.mjs` | `603f8e85b217328ea2d85aeca2b80770cde65fe619078a83a2d078ff6d45074a` |
| `experiments/npm12-install/scripts/m2a-transfer-production.d.mts` | `6d77b6e9e9361ecb536d8b7be8533a037c8d406a252bb99a4461424038fa3652` |
| `experiments/npm12-install/scripts/construct-m2a-transfer-context.mjs` | `9844425a5daa7391ecd7cbddd96be11e49ddfe35f4d9b5a7e176f2abd3200e20` |
| `experiments/npm12-install/scripts/build-m2a-transfer-image.mjs` | `b9259c7e5209b2765626d659124d520e0b789e71272e3528936de24ee04d3234` |
| `experiments/npm12-install/scripts/execute-m2a-transfer.mjs` | `512fe46c3708e57243a41526d9f599a6fc9d1bff962fdd4144dc20410fc198cf` |
| `experiments/npm12-install/scripts/m2a-transfer-lib.mjs` | `1940a9b2c6256cd8386fbe3a020bb05357242fb9590c2559e4058f60a8a8388a` |
| `experiments/npm12-install/scripts/m2a-transfer-lib.d.mts` | `770a06a4346880b6ee9b202dadae13a3f5f73ca39f439dfb4415d33d6afca885` |
| `experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs` | `9d9bd74a401b98e9aeaa9301863b137a20c9bb6582d91b2f14a6f3db84dd9128` |
| `tests/m2a-evidence-transfer.test.ts` | `9f5e08416cd737de7bb5a2d1f9926bfe2efd80a19ff5d7cdc1adb992b438332e` |
| `prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md` | `6e99596916c9d8ab0501031ecf093c2dc105084bf1f40fbee42265af21d03e5b` |
| `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation-review.md` | `17cd2d004f38085e9ba3907497fe5fc139b6503ed4948f6a90425518e25c2b15` |

All eleven implementation/verification paths stay inside the unchanged
M2A-CG06 allowlist. The three entry files remain absent from package scripts;
tests and the static verifier do not import an entry or either container
source. Private authority constructors and brands are absent from declarations
and package exports. The Containerfile, transfer manifest, container sources,
adapter/probe sources, package manifests, fixtures, scenarios, fixed ignored
roots, historical evidence, Expected, and `Observed` were not edited by this
read-only review. Because the repository is one accumulated uncommitted
worktree, Git cannot independently attribute every earlier untracked byte to a
single worker; this review instead binds the exact current allowlist identities
and the prompt-first repository record.

## Finding status and M2A-CG decision

| Item | Re-review decision |
| --- | --- |
| M2A-CGI01 — exact input closure | **CLOSED** |
| M2A-CGI02 — image observation and canonical binding | **OPEN** on early-row validation/phase order |
| M2A-CGI03 — runtime terminal, copied artifacts, and final candidate | **OPEN** on exact settlement discrimination |
| M2A-CGI04 — fixed private production authority | **OPEN** on complete descriptor/process/phase enforcement |

The resulting implementation-scope status is:

| Item | Implementation-scope decision |
| --- | --- |
| M2A-CG01 — immutable source and acquisition closure | **BLOCKED by M2A-CGI04** |
| M2A-CG02 — complete deterministic construction manifest | **BLOCKED by M2A-CGI04** |
| M2A-CG03 — offline one-build image identity and retention | **BLOCKED by M2A-CGI02 and M2A-CGI04** |
| M2A-CG04 — exact production entry and one-shot lifecycle | **BLOCKED by M2A-CGI03 and M2A-CGI04** |
| M2A-CG05 — failure, result, and evidence separation | **BLOCKED by M2A-CGI03 and M2A-CGI04** |
| M2A-CG06 — allowlist, negative coverage, and import safety | **BLOCKED by M2A-CGI02 through M2A-CGI04** |

M2A-CGR01 through M2A-CGR03 remain closed at contract scope. M2A-TR01
through M2A-TR06 remain closed only at their earlier Docker-free static/unit
transfer scope. This re-review does not reopen either earlier decision.

## M2A-CGI01 closure evidence

`validateConstructorToolchain()` now requires every inventory row to belong to
exactly one of `runtime/`, `packages/typescript/`, `packages/@types/node/`, or
`packages/undici-types/`; it also retains lexical ordering, uniqueness,
runtime-executable, package-aggregate, full-inventory aggregate, canonical-byte,
and reviewed-binding checks. A separately constructed otherwise-valid receipt
was accepted, while adding `unbound/extra-input.bin` and recomputing the
receipt SHA-256 and every self-described aggregate rejected with
`M2A_TOOLCHAIN_INVALID`.

`validateConstructionContextInputs()` accepts only a branded npm acquisition,
two exact settled compiler inventories, the seven fixed held source rows, and a
complete held context inventory. It derives the npm tree and CLI, both compiler
trees, fixed files, deterministic fixture archive, and every directory row,
derives that complete lexical inventory again from copied source snapshots,
then compares the held inventory field-for-field before branding the
correlation. `validateConstructionManifestBytes()` accepts only that private
correlation and compares the complete inventory and aggregate. Focused inverse
coverage rejected extra/missing/reordered, mode/mtime, source-disconnected,
noncanonical, alias/link/sparse, and settlement contradictions. This closes
M2A-CGI01 at the pure Docker-free validation/correlation boundary; it does not
close the production authority finding below.

## Residual blocking findings

### M2A-CGI02 — known-invalid early build rows still reach offline build

`runM2aImageBuildForTest()` stops immediately only when a row has settlement
`unknown`. For every known-settled row it stores the unvalidated `value`, runs
all remaining rows, and calls `validateImageBuildObservation()` only after the
candidate-inspect row. The production image authority has the same phase
shape: it checks terminal closure while collecting all five command outputs,
but parses and validates the version, tag-absence, base, build, and candidate
projections only after the offline build and final inspect have already run.

The controlled fake supplied the first `docker-version` row with `timedOut:
true`. The transaction eventually rejected with
`M2A_IMAGE_BUILD_OBSERVATION_INVALID`, but its action log was already exactly:

```text
docker-version
candidate-tag-absence
pinned-base-inspect
offline-build
candidate-inspect
```

Thus known terminal/value failure does not prevent a later build child. The
original null candidate projection now rejects and no binding publishes, and
the positive path validates the canonical binding bytes, but those later facts
do not repair this pre-build phase-order bypass. M2A-CGI02 remains open until
each known-settled row's exact terminal and value are validated before the next
row, especially before `offline-build`, in both the fake transaction and fixed
production authority.

### M2A-CGI03 — noncanonical settlement tokens can publish final success

The runtime remediation correctly cross-binds initializer and measurement
wait/final exits, copied completion/segment/marker bytes and metadata, all
canonical artifact validators, the attempt validator, and the combined
candidate boundary. The original initializer `9`/`8` contradiction now returns
Inconclusive without final publication; a null segment payload throws before a
later action; and the positive candidate independently passes
`validateCandidateTransfer()` with no issue.

However, `assertValidationSettlement()` and `assertPublicationResult()` treat
only the literal `unknown` as non-success and do not require the other branch
to equal `settled`. Controlled branded fakes supplied
`settlement: "forged-success"` with otherwise matching completion-validation
fields and, separately, otherwise successful final-publication fields. Both
transactions returned `status: "complete"` and `finalPublished: true`.
Checkpoint publication uses the same publication helper. Therefore exact
settlement state remains self-asserted at three transaction barriers.

M2A-CGI03 remains open until publication and validation records accept only
the exact `settled`/`unknown` domain, require the complete matching field shape
for each branch, and transaction-level inverses prove that no other token can
advance, publish, or launch a later action.

### M2A-CGI04 — private authorities exist but do not implement the complete reviewed transaction

The three private constructors and distinct WeakSet brands now exist, are
absent from declarations/scripts/tests, and are created only after the current
null/false gates. Static control flow confirms that current entry calls fail
before authority creation, filesystem access, or process launch. The remaining
finding concerns what those authorities would do after a later valid gate, not
their current reachability.

The constructor validates the toolchain receipt, then creates the construction
workspace before opening the receipt-listed toolchain package files. It skips
every `runtime/` inventory row entirely, so it never revalidates the fixed
`/usr/bin/node` executable and its receipt-bound runtime closure. After the
first compiler returns, it reads and copies its output and launches the second
compiler before `validateConstructionContextInputs()` first checks the first
terminal. A failed or settlement-unknown first compiler can therefore reach a
later compiler/process phase. Both compiler and Docker process helpers start
their 1,000 ms final-close timers only after an `exit` event; after deadline,
TERM, and KILL, a child that never emits `exit` has no absolute final-close
settlement bound.

The runtime authority creates and path-validates result/transfer directories,
but it does not retain directory descriptors or revalidate ancestor identity
and exact in-progress inventory around checkpoint, copy, validation, marker-
parent, and final-publication operations as required by the reviewed host
layout. Its path-based `attempt.next` write/rename transaction therefore does
not implement the contract's held result/transfer identity boundary, even
though the fake state machine models the correct order.

These are implementation-visible authority gaps; runtime observation cannot
close them. M2A-CGI04 remains open for one bounded Docker-free repair that
validates and holds the complete toolchain before first output, fail-closes
each compiler/build phase before the next, gives termination an absolute final
settlement bound, and implements the exact held result/transfer identity and
inventory transaction without opening any gate.

## Preserved positive evidence and boundaries

- Canonical validators retain descriptor-only exact-own-data rejection,
  canonical one-line bytes, private snapshots/brands, and rejection of Proxy,
  accessor, symbol, custom-prototype, sparse, reordered, extra, and mutable
  caller input without invoking caller hooks.
- The original null candidate, mismatched initializer exits, null copied
  artifact payload, unknown child, validation unknown, and publication unknown
  cases now stop without successful final publication.
- The positive runtime transaction produces exact completion, segment, marker,
  attempt, and combined-candidate bytes; this is synthetic fake-only evidence,
  not a runtime result.
- Future acquisition/toolchain/construction/image digests and local image ID
  remain `null`; build/runtime approvals remain `false`; every evidence review
  remains `not-performed`.
- Construction intent, fake observations, candidate bytes, reviewed result,
  M3 ingestion, matrix/profile/presentation evidence, and `Observed` remain
  distinct. No evidence was promoted.

## Verification observed

| Command | Observed result |
| --- | --- |
| `git status --short --branch` and scoped allowlist inspection | Existing accumulated dirty worktree inventoried and preserved; no cleanup or reset. |
| Descriptor-controlled 31/41-row calculation and self-described-extra toolchain contradiction | Reproduced both exact aggregates; rejected `unbound/extra-input.bin` with `M2A_TOOLCHAIN_INVALID`. |
| `sha256sum` over the eleven implementation/verification paths and saved remediation prompt pair | Recorded the thirteen current identities above. |
| Repository-controlled image/runtime contradiction matrix | Rejected the original null candidate, initializer-exit mismatch, and null segment; positive combined candidate passed; reproduced offline-build reachability after an invalid first terminal and successful publication from two forged settlement tokens. |
| Static private-authority control-flow inspection | Confirmed closed gates/private brands and reproduced skipped runtime inventory, late first-compiler validation, exit-triggered close deadlines, and path-only result publication. |
| `npm run m2a:transfer:verify` | Exit `0`; static verifier passed and 1 file / 37 tests passed. |
| `npm run m2a:verify` | Exit `0`; adapter typecheck/build/static passed and 4 files / 5 tests passed. |
| `npm run typecheck` | Exit `0`; root no-emit typecheck passed. |
| `npm test` | Exit `0`; 109 files / 840 tests passed. |
| `npm run check` | Exit `1`; it stopped at the pre-existing out-of-scope `containers/profile-control/test/control-host-backend.test.ts` formatting warning before lint/typecheck/test. |
| Focused Prettier check over the complete remediation allowlist, saved prompt pair, this review, and changed status files | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error reported in the accumulated tracked diff. |

Passing checks do not close the controlled residual contradictions. The review
did not run `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, a production entry,
Docker, npm acquisition/install/pack/approve/rebuild, a lifecycle, a probe,
transfer, fixed-root/result validation, cleanup, retry, or evidence promotion.

## Decision and next boundary

M2A-CGI01 is closed. M2A-CGI02 through M2A-CGI04 and M2A-CG01 through
M2A-CG06 remain open at implementation scope. One bounded Docker-free residual
remediation may address only the three exact findings above inside the
unchanged M2A-CG06 implementation/verification allowlist, followed by a fresh
independent Docker-free re-review. The residual remediation/re-review prompt
pair must be saved before source or test repair. Every acquisition, fixed-root
construction, image build, Docker/runtime, transfer, result, and evidence
boundary remains unapproved.

Next: save the exact bounded Docker-free M2A-CGI02 through M2A-CGI04 residual-
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, execute a production entry, construct a context or image,
call Docker, or access runtime/result state.
