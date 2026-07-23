# M0/M2-A construction/execution-gate residual-remediation re-review

## Review target and decision

- Target: frozen-research issue #43's bounded M2A-CGI02 through M2A-CGI04
  Docker-free residual-remediation candidate
- Review type: fresh independent Docker-free read-only residual-remediation
  re-review
- Review prompt:
  [m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation-review.md)
- Decision: **BLOCKED; no acquisition, production construction, image build,
  Docker execution, transfer, or result task is approved**
- Closed findings: M2A-CGI02 and M2A-CGI03
- Preserved closed finding: M2A-CGI01
- Residual blocking finding: M2A-CGI04 on the exact process-cause and held-
  directory transaction gaps below
- Non-blocking findings: none
- Implementation or test repair performed in this review: none

The remediation closes row-local image observation and exact runtime
settlement discrimination. It also holds the complete constructor input set,
bounds no-exit children, and adds result/transfer directory handles. The fixed
private authorities do not yet close the reviewed transaction as a whole:
compiler and Docker helpers can overwrite an earlier error/exit cause with a
later successful close, and runtime inventory/publication/copy operations
resolve string paths independently of the held directory descriptors. Those
two controlled contradictions keep only M2A-CGI04 open.

Standing authorization was not needed or used. This review did not inspect a
fixed ignored root, import or execute a production entry, acquire npm or
toolchain bytes, construct a context or image, call Docker, execute a
lifecycle or transfer, or access runtime/result state.

## Reproduced identities and allowlist

The review opened the 41 fixed repository inputs read-only with `O_NOFOLLOW`,
checked one-link regular-file identity before and after each read, settled each
descriptor close, and reproduced:

```text
31 rows: sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04
41 rows: sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526
```

The exact implementation, declaration, verification, test, and saved-prompt
identities reviewed at this decision are:

| Path | SHA-256 |
| --- | --- |
| `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` | `7fe6a97b003f180621ad38ef6ad5a549f00c01d1e76f7d53ac14d7d76171d29c` |
| `experiments/npm12-install/scripts/m2a-transfer-construction.d.mts` | `baf28418feac3f8936133dfe98e6b7a498eead24be7033c9a62eab90b7ac435b` |
| `experiments/npm12-install/scripts/m2a-transfer-production.mjs` | `a7520638b98e16e5d7a397f3f67ebf37ba1555530d66f468bc022c99f0f41b30` |
| `experiments/npm12-install/scripts/m2a-transfer-production.d.mts` | `6d77b6e9e9361ecb536d8b7be8533a037c8d406a252bb99a4461424038fa3652` |
| `experiments/npm12-install/scripts/construct-m2a-transfer-context.mjs` | `9844425a5daa7391ecd7cbddd96be11e49ddfe35f4d9b5a7e176f2abd3200e20` |
| `experiments/npm12-install/scripts/build-m2a-transfer-image.mjs` | `b9259c7e5209b2765626d659124d520e0b789e71272e3528936de24ee04d3234` |
| `experiments/npm12-install/scripts/execute-m2a-transfer.mjs` | `512fe46c3708e57243a41526d9f599a6fc9d1bff962fdd4144dc20410fc198cf` |
| `experiments/npm12-install/scripts/m2a-transfer-lib.mjs` | `1940a9b2c6256cd8386fbe3a020bb05357242fb9590c2559e4058f60a8a8388a` |
| `experiments/npm12-install/scripts/m2a-transfer-lib.d.mts` | `770a06a4346880b6ee9b202dadae13a3f5f73ca39f439dfb4415d33d6afca885` |
| `experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs` | `5d2e3109285b5812d69c615caf2a491484dd066f65259ed8b511acc051a271c6` |
| `tests/m2a-evidence-transfer.test.ts` | `bec554ad18fc1ddc66f8eb9cf53bbf2f5fbd9eac1bdafdff98f2cbb02329f38c` |
| `prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md` | `b11d3ffa48fed6feddb39bab10784ee8ff5555ce6ae8ff2bf6783081fc51135f` |
| `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation-review.md` | `c4aca90e2d123e1f38562b3694a7bc8fb2c2bfe4271ff2194ad9513da766d41e` |

The four residual implementation/test deltas remain inside the unchanged
M2A-CG06 allowlist. The three production constructors remain private and
absent from declarations, exports, package scripts, and tests. The
Containerfile, transfer manifest, container sources, adapter/probe sources,
package manifests, fixtures, scenarios, fixed ignored roots, historical
evidence, Expected, and `Observed` were not changed by this read-only review.
Because the repository is one accumulated uncommitted worktree, Git cannot
attribute every earlier untracked byte to one worker; this review instead
binds the current identities and prompt-first repository record.

## Finding and M2A-CG status

| Item | Re-review decision |
| --- | --- |
| M2A-CGI01 — exact input closure | **CLOSED; preserved** |
| M2A-CGI02 — row-local image observation and binding | **CLOSED** |
| M2A-CGI03 — exact runtime settlement discrimination | **CLOSED** |
| M2A-CGI04 — complete fixed private production authority | **OPEN** on process-cause retention and held-directory correlation |

The resulting implementation-scope status is:

| Item | Implementation-scope decision |
| --- | --- |
| M2A-CG01 — immutable source and acquisition closure | **CLOSED** |
| M2A-CG02 — complete deterministic construction manifest | **BLOCKED by M2A-CGI04 process settlement** |
| M2A-CG03 — offline one-build image identity and retention | **BLOCKED by M2A-CGI04 process settlement** |
| M2A-CG04 — exact production entry and one-shot lifecycle | **BLOCKED by M2A-CGI04** |
| M2A-CG05 — failure, result, and evidence separation | **BLOCKED by M2A-CGI04** |
| M2A-CG06 — allowlist, negative coverage, and import safety | **BLOCKED by M2A-CGI04 transaction-level negative coverage** |

M2A-CGR01 through M2A-CGR03 remain closed at contract scope. M2A-TR01
through M2A-TR06 remain closed only at their earlier Docker-free static/unit
transfer scope. This re-review does not reopen either earlier decision.

## Closed finding evidence

### M2A-CGI01 — preserved

The pure toolchain and context validators retain the exact four-family union,
lexical unique inventory, package/runtime aggregates, private acquisition and
context brands, two separately derived complete context inventories, and
field-for-field held-inventory comparison. The constructor now opens,
registers, reads, and holds all 41 tracked rows, the acquisition receipt and
archive, the toolchain receipt, fixed `/usr/bin/node`, and every receipt-listed
runtime/package row before the first output. The reproduced aggregates and the
42-test focused suite retain extra, missing, reordered, aliased, sparse,
unsettled, and source-disconnected rejection. M2A-CGI01 remains closed.

### M2A-CGI02 — closed

An independent in-memory matrix submitted 23 known-invalid command values
across version, tag absence, pinned base, offline build, and candidate inspect.
Every case rejected before its next forbidden action. The controlled first-row
`timedOut: true` action log was exactly `docker-version`. Five independently
submitted exact `unknown` rows returned Inconclusive and stopped before the
next action.

The positive transaction performed the exact five rows, validated the complete
observation, created canonical `m2a-transfer-image-binding/v1` bytes,
revalidated them against the exact local `sha256:` ID, and published only after
an exact settled same-byte record. Malformed, forged, contradictory unknown,
and type-drift publication records did not publish success. Static control-flow
inspection confirmed the fixed image authority calls
`validateImageBuildStepValue()` immediately inside the command loop before the
next Docker row. M2A-CGI02 closes at the Docker-free static/unit transaction
boundary; M2A-CGI04 still blocks the real child helper below.

### M2A-CGI03 — closed

The independent matrix submitted null, numeric, forged, missing, extra,
inherited, accessor, custom-prototype, and contradictory unknown settlement
records at checkpoint, marker-parent, final-publication, completion, segment,
and marker barriers. It reproduced 27 publication-record and 30 validation-
record rejections. Each action log ended at the exact affected barrier and
contained no forbidden later child, copy, marker-parent, validation, or final
publication.

Exact unknown publication and validation records remain Inconclusive; exact
settled records with a false subfield or mismatched digest take the known-
failure path. The positive transaction still cross-binds wait/final exits,
completion/segment/marker bytes and metadata, chronological first issue,
conditional copy, canonical attempt bytes, and the final combined candidate.
M2A-CGI03 closes.

## Residual blocking finding

### M2A-CGI04 — process cause can be overwritten by a later close

Both `runFixedCompiler()` and `runFixedDockerCommand()` start an absolute
final-close bound after timeout, overflow, error, or exit, but neither records
an asynchronous `error` as terminal state. Both assign `exitCode` and
`signal` in the `exit` callback and assign them again in the later `close`
callback. The returned terminal has no error/first-cause field.

A controlled state trace matching those assignments supplied `error`, then a
later `close(0, null)` with closed output descriptors. The resulting terminal
had zero exit, null signal, no timeout/truncation, and all close booleans true;
`assertSuccessfulFixedCompilerTerminal()` accepted it. The same terminal
satisfies the image/runtime Docker success predicates. Likewise, an earlier
nonzero `exit` can be overwritten by a later zero `close`. Synchronous spawn
failure and no-exit final bounds remain fail closed, but those facts do not
retain the first asynchronous terminal cause.

No separately branded fake process boundary exercises these private helpers;
the current tests assert only source markers and the public fake transactions.
M2A-CGI04 remains open until compiler and Docker helpers retain the first
error/exit/timeout/overflow cause exactly once, a later event cannot improve
it, and fake-timer/process traces cover error, inconsistent late events,
signal failure, no-exit, exit-without-close, overflow, and descriptor
uncertainty without hang or later phase advance.

### M2A-CGI04 — path operations are not correlated to held directories

`holdProductionDirectory()` captures repository/result/transfer descriptors,
but `exactProductionDirectoryInventory(target, expected)` enumerates with
`readdir(target)` and classifies children with `lstat(path.join(target,
name))`. Attempt publication similarly opens `attempt.next`, renames it, and
syncs the result directory through string paths. Copy validation constructs
`path.join(resultRoot, destination)` and opens that path after Docker returns.
None of those operations proves that the current pathname still resolves to
the inode held by `resultIdentity` or `transferIdentity`.

The controlled identity trace retained stable held inode `1`, replaced the
path with inode `2`, and gave inode `2` the exact expected inventory. Held-
descriptor revalidation and path-based inventory validation both passed while
the identities differed. The next path-based write/copy validation would act
on inode `2`, outside the held transaction. `allowInventoryMutation: true`
then adopts observed link/size/mtime changes without first correlating the
pathname to the held inode.

The directory identity also stores only `mode & 0777`; initial hold does not
require the contract's exact link value and ignores special permission bits.
Thus owner, lower permission bits, and subsequent descriptor stability do not
establish the required full-mode/link/path identity. Existing tests check only
the presence of helper names, not controlled replacement, extra/missing,
special-bit/link, attempt-next, copy-destination, or pre/post identity drift
through the production transaction.

M2A-CGI04 remains open until every inventory, attempt write/rename/sync, copy
destination, marker-parent, and final publication is performed through or
re-correlated immediately to the held directory identity; exact full mode,
owner, link, and BigInt identity are checked; and separately branded fake
filesystem traces reject every required replacement/inventory/metadata drift.

## Preserved evidence and limitations

- Future acquisition, toolchain, construction, context, image, and local-image
  digests remain `null`; build/runtime approvals remain `false`; every
  `evidenceReview` remains `not-performed`.
- Current entries still fail before authority construction and filesystem or
  process activity. Constructors/brands remain private and reusable imports
  remain side-effect-free.
- Passing checks and fake transactions are Docker-free static/unit and
  cooperative-host evidence only. They do not establish npm/toolchain
  acquisition, compiler/filesystem publication, Docker behavior, image
  identity, lifecycle behavior, named-volume transfer, result validity,
  runtime enforcement, or `Observed`.
- Construction intent, candidate bytes, fake observations, a runtime attempt,
  accepted evidence, M3 ingestion, matrix/profile/presentation evidence, and
  `Observed` remain distinct. No evidence was promoted.

## Verification observed

| Command | Observed result |
| --- | --- |
| `git status --short --branch` and scoped source/allowlist inspection | Existing accumulated dirty worktree inventoried and preserved; no cleanup/reset. |
| `sha256sum` over the eleven implementation/verification paths and saved residual prompt pair | Recorded the thirteen current identities above. |
| Descriptor-controlled 31/41-row calculation | Reproduced both exact aggregates with all 41 reads identity-stable and closed. |
| Repository-controlled image/runtime contradiction matrix | 23 image invalids and five unknown rows stopped before later action; 27 publication and 30 validation malformed records rejected at their exact barrier; positive image binding and runtime candidate passed. |
| Repository-controlled private-authority source/identity/process audit | Confirmed private reachability and reproduced the held-inode/path-inode and error/close-zero contradictions. |
| `npm run m2a:transfer:verify` | Exit `0`; static verifier passed and 1 file / 42 tests passed. |
| `npm run m2a:verify` | Exit `0`; adapter typecheck/build/static passed and 4 files / 5 tests passed. |
| `npm run typecheck` | Exit `0`; root no-emit typecheck passed. |
| `npm test` | Exit `0`; 109 files / 845 tests passed. |
| `npm run check` | Exit `1`; stopped at the pre-existing out-of-scope `containers/profile-control/test/control-host-backend.test.ts` formatting warning before lint/typecheck/test. |
| Focused Prettier check over the residual allowlist, prompt pair, this review, and status paths | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error reported in the accumulated tracked diff. |

The review intentionally did not run `m0:doctor`, `m0:build`, `m0:run`,
`m0:verify`, a production entry, Docker, npm acquisition/install/pack/approve/
rebuild, a lifecycle, a probe, transfer, fixed-root/result validation, cleanup,
retry, or evidence promotion.

## Decision and next boundary

M2A-CGI01 through M2A-CGI03 are closed. M2A-CGI04 remains open, so only
M2A-CG01 closes at implementation scope; M2A-CG02 through M2A-CG06 remain
open. One prompt-first bounded Docker-free M2A-CGI04 remediation may address
only first-cause process settlement and held-directory/path transaction
correlation inside the unchanged M2A-CG06 allowlist, followed by a fresh
independent Docker-free re-review. Every acquisition, fixed-root construction,
image build, Docker/runtime, transfer, result, and evidence boundary remains
unapproved.

Next: save the exact bounded Docker-free M2A-CGI04 private-authority residual-
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, execute a production entry, construct a context or image,
call Docker, or access runtime/result state.
