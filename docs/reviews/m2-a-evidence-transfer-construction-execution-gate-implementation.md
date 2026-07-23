# M0/M2-A construction/execution-gate implementation review

## Review target and decision

- Target: frozen-research issue #43's bounded M2A-CG01 through M2A-CG06
  Docker-free static/unit implementation candidate
- Review type: fresh independent Docker-free read-only implementation review
- Review prompt:
  [m2-a-evidence-transfer-construction-execution-gate-implementation-review](../../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-review.md)
- Decision: **BLOCKED; no acquisition, production construction, image build,
  Docker execution, transfer, or result task is approved**
- Blocking findings: M2A-CGI01 through M2A-CGI04 below
- Non-blocking findings: none
- Implementation or test repair performed in this review: none

The candidate fixes useful pure plans, canonical schemas, child-specific
absence identities, fail-closed entry gates, and fake-only ordering. It does
not yet close the complete toolchain/context input set, exact image-build
observation-to-binding transaction, exact runtime terminal/artifact
transaction, or production authority boundary required by the approved
contract. Passing static/unit checks therefore remain positive candidate
evidence and do not reach the maximum implementation decision.

Standing authorization was not needed or used. This review did not inspect a
fixed ignored root, execute a production entry, acquire npm or toolchain bytes,
construct a context or image, call Docker, execute a lifecycle or transfer, or
access runtime/result state.

## Reproduced identities and allowlist

The review independently recomputed the exact ordered source identities:

```text
31 rows: sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04
41 rows: sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526
```

The fixed generation, expected revision, scenario, run ID, result root,
container names, named volume, candidate tag, pinned base, and old M0
non-reuse boundary remain unchanged. The implementation/test/prompt identities
reviewed at this decision are:

| Path | SHA-256 |
| --- | --- |
| `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` | `8fd33d1698946874949483ab1bc0829dcf5b0bc48c4e955efa48dbee8c4a3fd2` |
| `experiments/npm12-install/scripts/m2a-transfer-construction.d.mts` | `6a95595c03d0f6c2c3912c9446bb79e72bad469a2fc7b93e94a0f8709c6aba25` |
| `experiments/npm12-install/scripts/m2a-transfer-production.mjs` | `e634ca3d6db2c12fb23cace18ea9b4d2e7b0a57f34dd5c5a8098a3eeed391cca` |
| `experiments/npm12-install/scripts/m2a-transfer-production.d.mts` | `1f00d8ad11932febdcd96ecf89604c0a150d27cd63680df6be8cf0b7a85625bb` |
| `experiments/npm12-install/scripts/construct-m2a-transfer-context.mjs` | `9844425a5daa7391ecd7cbddd96be11e49ddfe35f4d9b5a7e176f2abd3200e20` |
| `experiments/npm12-install/scripts/build-m2a-transfer-image.mjs` | `b9259c7e5209b2765626d659124d520e0b789e71272e3528936de24ee04d3234` |
| `experiments/npm12-install/scripts/execute-m2a-transfer.mjs` | `512fe46c3708e57243a41526d9f599a6fc9d1bff962fdd4144dc20410fc198cf` |
| `experiments/npm12-install/scripts/m2a-transfer-lib.mjs` | `1940a9b2c6256cd8386fbe3a020bb05357242fb9590c2559e4058f60a8a8388a` |
| `experiments/npm12-install/scripts/m2a-transfer-lib.d.mts` | `770a06a4346880b6ee9b202dadae13a3f5f73ca39f439dfb4415d33d6afca885` |
| `experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs` | `b036a1becd8b00917177fa3d6b3b3a0f3ed3ad5cb4350ad01000fdb0f816b4cb` |
| `tests/m2a-evidence-transfer.test.ts` | `242f217115bcdcb551532a72118ca982e80890939a27eaf40364647ed2e9f849` |
| `prompts/m2-a-evidence-transfer-construction-execution-gate-implementation.md` | `24cd4a643834471dd9cd748f100d98e4ee46f2c0ac0436e1b5f45f1afe4f3e2b` |
| `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-review.md` | `085145cd0985665a6faff3be7a670e519ae84bb0b87ea9f3ec8316e0e1dbf8ea` |

The three entry files remain absent from package scripts and protected by a
direct-invocation guard. Tests and the static verifier import only reusable
libraries, not an entry or either container source. The existing Containerfile,
manifest, initializer/runner sources, package scripts, adapter/probe source,
package manifests, fixtures, scenarios, results, historical bytes, Expected,
and `Observed` were not repaired or changed by this review. Because the
repository is an accumulated uncommitted worktree, Git alone cannot attribute
every earlier untracked file to one worker; the review instead bound the
current allowlist identities and repository-recorded prompt sequence.

## M2A-CG decision summary

| Item | Implementation-scope decision |
| --- | --- |
| M2A-CG01 — immutable source and acquisition closure | **BLOCKED by M2A-CGI01** |
| M2A-CG02 — complete deterministic construction manifest | **BLOCKED by M2A-CGI01 and M2A-CGI04** |
| M2A-CG03 — offline one-build image identity and retention | **BLOCKED by M2A-CGI02 and M2A-CGI04** |
| M2A-CG04 — exact production entry and one-shot lifecycle | **BLOCKED by M2A-CGI03 and M2A-CGI04** |
| M2A-CG05 — failure, result, and evidence separation | **BLOCKED by M2A-CGI03** |
| M2A-CG06 — allowlist, negative coverage, and import safety | **BLOCKED by M2A-CGI01 through M2A-CGI04** |

M2A-CGR01 through M2A-CGR03 remain closed at contract scope. M2A-TR01 through
M2A-TR06 remain closed only at their earlier Docker-free static/unit transfer
scope. This review does not reopen either decision; it blocks the new
construction/execution implementation candidate at its own boundary.

## Blocking findings

### M2A-CGI01 — toolchain and constructed-context input closure is incomplete

`validateConstructorToolchain()` proves that each required runtime/package
prefix is nonempty and self-consistent, but it does not reject inventory rows
outside `runtime/`, `packages/typescript/`, `packages/@types/node/`, and
`packages/undici-types/`. A controlled canonical receipt containing the valid
four required rows plus `unbound/extra-input.bin` was accepted after its
self-described aggregates were recomputed. That fifth row is not part of any
reviewed runtime or package closure.

`validateConstructionManifestBytes()` likewise admits a self-consistent
lexical inventory from broad path prefixes and a required-path subset. It is
not cross-bound to the validated npm archive inventory, compiler-produced
inventories, held context descriptors, or a second clean derivation. The
focused positive manifest deliberately uses a small synthetic inventory rather
than the complete derived npm and compiler trees. Changing a permitted row and
recomputing the self-described aggregate is therefore not independently tied
back to constructed bytes.

This leaves an unbound resolver input and a self-asserted context inventory at
the combined CG01/CG02 boundary. The smallest remediation is to close the
toolchain root-family union exactly and pass exact validated archive/compiler/
filesystem inventories into one pure construction-manifest correlation
boundary, with inverse extra/missing/alias and recomputed-aggregate tests.

### M2A-CGI02 — fake image-build success bypasses the reviewed observation and binding

`validateImageBuildObservation()` and `validateImageBindingBytes()` separately
check the intended exact terminal, platform, config, image ID, construction,
and canonical packet shapes. `runM2aImageBuildForTest()`, however, never calls
either validator. It advances on only `settlement: "settled"` and `ok: true`,
ignores every command's `value`, and sets `imageBindingPublished: true` after
the fifth abstract success.

The independent contradiction replaced the candidate-inspect value with
`null`; the transaction still returned `status: "complete"` and
`imageBindingPublished: true`. It therefore does not prove Docker version, tag
absence, pinned base, one build, candidate projection, exact local image ID,
context revalidation, terminal/output/descriptor settlement, or canonical
binding publication as one transaction.

The smallest remediation is to make the branded fake build boundary consume
the complete fixed command terminals/projections, re-run the canonical
observation and construction-binding validators, publish exact binding bytes
only after every barrier, and reject every inverse projection/settlement
family through the transaction rather than only through isolated validators.

### M2A-CGI03 — runtime success bypasses terminal and artifact correlation

The fake runtime result schema collapses child close, output capture, and
descriptor settlement into one abstract `settlement` string. For wait and
final-inspect rows, `assertRuntimeResult()` requires only integer exits and an
`exited` state; it does not require initializer exit zero or bind wait exit to
final inspect. The independent matrix supplied initializer wait exit `9` and
final-inspect exit `8`; execution continued.

After completion copy, the transaction trusts only an `outputs` path list.
Segment and marker validation accept `settlement: "settled", ok: true,
value: null`; the transaction never invokes the canonical completion,
transferred-file, producer-segment, marker, artifact, attempt, or combined-
candidate validators. With those contradictory terminals and null artifact
payloads it still returned `status: "complete"` and `finalPublished: true`.

The smallest remediation is to represent and validate every child/output/
descriptor barrier, cross-bind wait/final natural exits, feed exact copied
bytes and metadata through all canonical validators in order, and permit final
attempt publication only from the combined candidate boundary. Add inverse
nonzero/mismatched exit, truncation/close, invalid-byte, missing-artifact, and
validator-bypass tests at transaction scope.

### M2A-CGI04 — the three production entries have no production authority implementation

The contract requires privately branded fixed production filesystem/process
authority separated from branded test fakes. The constructor entry currently
recomputes tracked rows and then fails on null review constants; it contains no
fixed acquisition/toolchain reads, private compiler workspace, two compiler
children, context derivation, or publication transaction. The image-build and
runtime entry functions similarly end in `M2A_IMAGE_BUILD_BACKEND_UNAVAILABLE`
and `M2A_RUNTIME_BACKEND_UNAVAILABLE` after their null/false gates. No
production backend or authority brand exists in either library.

Failing closed is necessary and preserved, but an unavailable backend is not
the reviewed fixed production constructor/build/executor implementation. A
later receipt or local-image review cannot activate these entries by binding
the missing immutable values alone; another source implementation would still
be required.

The smallest remediation is to add the fixed private production authorities
and connect each already fail-closed entry only after its immutable review
bindings. The remediation remains Docker-free and must not fill a future
digest, set an approval true, inspect a fixed ignored root, execute an entry,
construct bytes, or call Docker. Fake brands and production brands must remain
distinct and production reachability must remain absent from scripts/tests.

## Preserved positive evidence

- Exact-own-data plan validators reject inherited, accessor, symbol,
  custom-prototype, sparse, reordered, and extra structural inputs without
  invoking caller getters.
- The pure schemas retain canonical one-line bytes, exact fixed tuple values,
  reviewed compiler/build/runtime plans, three distinct absence identities,
  chronological attempt vocabulary, and evidence non-promotion.
- The fake runtime preserves checkpoint-before-child ordering and stops its
  abstract action log after an `unknown` result. The findings concern missing
  field-level settlement/artifact correlation, not that ordering property.
- The three entries have direct-invocation, no-argument, empty-environment
  guards and are not reachable from root package scripts. Reusable module
  imports did not activate them.

These positive facts are Docker-free static/unit evidence only. They do not
establish filesystem publication, compiler settlement, Docker behavior,
image identity, lifecycle behavior, named-volume visibility, copy validity,
candidate acceptance, or runtime enforcement.

## Verification observed

| Command | Observed result |
| --- | --- |
| `git status --short --branch` and scoped source/allowlist inspection | Existing accumulated dirty worktree inventoried and preserved; no cleanup or reset. |
| Repository-controlled 31/41-row identity calculation | Reproduced 31 and 41 rows and both exact aggregates. |
| `sha256sum` over the 11 implementation/verification paths and saved prompt pair | Recorded the 13 exact current identities above. |
| Repository-controlled toolchain/build/runtime contradiction matrix | Accepted one unbound toolchain inventory row; published fake image-build success with null candidate projection; published fake runtime success with mismatched initializer exits and null segment/marker validation payloads. |
| `npm run m2a:transfer:verify` | Exit `0`; static verifier passed and 1 file / 36 tests passed. |
| `npm run m2a:verify` | Exit `0`; typecheck/build/static passed and 4 files / 5 tests passed. |
| `npm run typecheck` | Exit `0`; root no-emit typecheck passed. |
| `npm test` | Exit `0`; 109 files / 839 tests passed. |
| `npm run check` | Exit `1`; it stopped at the pre-existing out-of-scope `containers/profile-control/test/control-host-backend.test.ts` formatting warning before lint/typecheck/test. |
| Focused Prettier check over the complete implementation allowlist, saved prompt pair, this review, and changed status files | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error reported in the accumulated tracked diff. |

Passing checks do not close the controlled contradictions above. The review
did not run `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, a production entry,
Docker, npm acquisition/install/pack/approve/rebuild, a lifecycle, a probe,
transfer, result validation, cleanup, retry, or evidence promotion.

## Decision and next boundary

M2A-CG01 through M2A-CG06 remain open at implementation scope. One bounded
Docker-free remediation may address only M2A-CGI01 through M2A-CGI04 inside the
unchanged M2A-CG06 implementation/verification allowlist, followed by a fresh
independent Docker-free re-review. The prompt pair must be saved before source
or test repair. Every acquisition, fixed-root construction, image build,
Docker/runtime, transfer, result, and evidence boundary remains unapproved.

Next: save the exact bounded Docker-free M2A-CGI01 through M2A-CGI04
implementation-remediation prompt and fresh independent re-review prompt; do
not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.
