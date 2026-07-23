# M0/M2-A dependency-input implementation-remediation re-review

## Review target and decision

- Target: frozen-research issue #43's bounded M2A-IBI01/M2A-IBI02
  dependency-input implementation remediation
- Review type: fresh independent Docker-free read-only re-review
- Review prompt:
  [m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation-review.md)
- Decision: **BLOCKED on residual M2A-IBI01; no producer-execution contract or
  execution is approved**
- Closed in this review: M2A-IBI02
- Preserved closed: M2A-IB01, M2A-IB02, M2A-IB04, and M2A-IB05 at their
  Docker-free static/unit implementation scopes
- Still open: M2A-IBI01 and therefore M2A-IB03/M2A-IB06 at implementation
  scope
- Implementation, declaration, test, verifier, or prompt repair performed in
  this review: none

The production remediation now keeps the original held `WORK_ROOT` descriptor
and its exact no-follow child through parent sync and the canonical initial
checkpoint transaction. The runtime, source, destination, every-package-family,
and actual-constructor inverse matrix also reaches the production-consumed pure
boundaries and closes M2A-IBI02.

One narrower production/fake correlation contradiction remains. The fake
`attempt-parent-sync` result is checked only as a generic successful marker and
is then discarded. The shared transition validator receives
`parentSynced: true` as a literal independently of that fake result. The same
fake can therefore represent a false sync fact while the correlation decision
accepts a true one. The implementation also narrows `bigint` attempt identity
size to `Number` before the shared exact-identity decision, while the reviewed
contract requires the device, inode, size, and mtime identity fields to retain
their exact BigInt-derived representation.

These are Docker-free static/unit findings. This review did not import or
execute either producer, access a fixed input or runtime root, read the live
Node executable or process report, inspect installed packages, communicate
externally, construct an image, call Docker, transfer or accept a result, or
promote evidence. Standing authorization was not needed or used.

## Reviewed boundary and identities

The re-review inspected only the remediation support/declaration, static
verifier, focused test, saved prompt pair, and minimal status records permitted
by the review prompt. Current identities for the six implementation, test, and
prompt paths are:

| Path | SHA-256 |
| --- | --- |
| `experiments/npm12-install/scripts/m2a-transfer-inputs.mjs` | `2ca192e942df3b457f24b8915b569ca178fb509c067a4f53480a3c2d6d4fcf62` |
| `experiments/npm12-install/scripts/m2a-transfer-inputs.d.mts` | `aba27852a6329b84540ff8b4b8fc56fdab5229a210a8668e61931c1a5bc14176` |
| `experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs` | `3e04550b45087553505f1c4d9fb45b2a563bccbcc020020a24d963a8729b295e` |
| `tests/m2a-evidence-transfer.test.ts` | `4b43af2a00721aa4ffaae6650ac40e3204e86fc1a5f1416753851a5a40848332` |
| `prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md` | `92b6e56ffc014ef9f331ac6e43440bec9efe0a1c00b032bc8ea69debdc8ef289` |
| `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation-review.md` | `7256ea6eb67ee4dea047200fe547d2d5575eebcb19ccc1c5a7f1ce061fa9adf7` |

The repository remains one accumulated, uncommitted multi-session worktree,
and the relevant implementation paths are untracked. Git therefore cannot
attribute their internal remediation delta to one worker. This review instead
reproduced the current prompt-bounded implementation, test, static-verifier,
import, package-script, and status boundaries without resetting or rewriting
unrelated M3, M4, presentation, result, or user work.

Neither no-argument producer entry is present in root package scripts. Focused
tests import only the side-effect-free support library and read both producer
entries as source text. The static verifier likewise reads their source and
does not import them. The construction and production modules do not import
the dependency-input support library. Fake npm and toolchain backends remain
separately weak-branded, and their declaration exposes no caller-selected
path, descriptor, process object, environment, runtime report, package root,
production brand, callback, or retry authority.

## M2A-IBI01 held-authority re-review

### Production held-parent/child/checkpoint trace

Source inspection reproduced this production order:

1. `createAttemptRootSynchronously()` opens the fixed `WORK_ROOT` once with
   `O_DIRECTORY | O_NOFOLLOW`, registers the descriptor in the authority
   before its first descriptor check, and captures held/path parent identity
   plus the complete bytewise-sorted child inventory.
2. The one synchronous non-recursive `mkdirSync(..., { mode: 0o700,
   recursive: false })` is the sole attempt-root commit. The same held parent
   remains open while the exact lexical child is opened with no-follow
   directory semantics.
3. Held/path parent and child identities, before/after inventory, effective
   owner/group, full mode, link count, device/inode, size, and mtime are passed
   to `validateAttemptRootCommitTransition()`. The original parent descriptor
   is then synced directly; no `syncDirectory(WORK_ROOT)` substitution occurs.
4. `publishInitialAttempt()` uses the same held child descriptor for initial
   inventory, exclusive mode-`0600` `attempt.next`, complete write and
   descriptor sync, same-descriptor reread, mode-`0444`, identity/inventory
   revalidation, known staging close, non-replacing rename to `attempt.json`,
   child-directory sync, and final child/parent correlation.
5. `closeAttemptAuthority()` settles the staging, child, and parent
   descriptors once. Every post-commit exception retains the root; the
   production catch may write only a sanitized failed replacement and performs
   no cleanup or retry.

The focused fake trace rejects held/path parent replacement, child
path/descriptor mismatch, wrong type, special mode, owner/group, link,
device/inode alias, size/mtime mismatch, extra/missing/reordered child entries,
and unchanged-sibling replacement. Every open, correlate, parent-sync,
checkpoint, child-close, and parent-close failure retains the occurrence and
reaches no runtime step.

### Residual M2A-IBI01 finding

The reviewed remediation required the fake `open-attempt-root`,
`correlate-attempt-root`, and `attempt-parent-sync` outcomes to be data for the
same private decision consumed by production rather than stronger marker-only
claims.

The first two fake outcomes supply identity and inventory data to
`validateAttemptRootCommitTransition()`. The parent-sync outcome does not:

```text
validateKnownStep(await perform("attempt-parent-sync"), ...)
validateAttemptRootCommitTransition({
  ...
  parentSynced: true,
})
```

`validateKnownStep()` only reads `ok` and `settlement`; it does not require an
exact key set or forward a sync fact. Consequently a branded fake
`attempt-parent-sync` result with `ok: true`, `settlement: "known"`, and a
represented `parentSynced: false` passes the generic check, after which the
literal `true` is accepted by the shared validator. The existing negative
matrix checks `{ ok: false, settlement: "unknown" }`, but it does not reproduce
this false-fact/accepted-transition contradiction.

Production does execute `fsyncSync(authority.parentFd)` before supplying its
literal true, so this finding does not claim the production descriptor was not
synced. It establishes that the fake can still claim a stronger correlation
than the production/fake shared decision actually represents, precisely the
marker-only divergence that M2A-IBI01 required the remediation to close.

The exact identity helper also returns `size: Number(stat.size)` from a
BigInt-stat call while device, inode, and mtime remain exact decimal strings.
`readAttemptIdentity()` and its fake matrix then require a safe integer number.
This fails closed outside the safe range, but it does not implement or
behaviorally exercise the reviewed BigInt-derived size representation. The
same residual remediation should keep all four exact identity fields in one
non-narrowed representation.

M2A-IBI01 therefore remains open. The static verifier's occurrence-count and
source-string checks cannot close this semantic divergence.

## M2A-IBI02 inverse-matrix re-review

M2A-IBI02 closes at Docker-free static/unit cooperative-host scope. Inspection
and the focused 60-test run reproduced the required production-consumed
boundaries:

- `validateRuntimeProjection()` rejects wrong Node version, platform,
  architecture, executable type/mode/link/size/hash, sparse/non-dense report
  forms, non-string/relative/duplicate shared-object paths, row reordering and
  path drift, physical aliases, source disconnection, wrong row
  type/mode/link/size/hash, and runtime-inventory missing/extra/duplicate/order/
  size/hash/virtual-Node contradictions.
- Each TypeScript, `@types/node`, and `undici-types` family independently
  rejects version/integrity drift and root/path/tree/type/mode/owner/group/
  link/sparse/nonempty/logical-duplicate/physical-alias/case/order
  contradictions. First/second graph comparison rejects add, remove, rename,
  reparent, directory or file identity replacement, hash/mtime drift, and
  unknown rows through `validateHeldGraphPair()`, the boundary production
  consumes after its two held traversals.
- `validateDestinationGraph()` rejects extra, missing, staging, reordered,
  physically aliased, disconnected, replaced, wrong-metadata,
  inventory/source-copy, and virtual-Node contradictions before receipt
  construction.
- The unchanged actual `validateConstructorToolchain()` consumer accepts the
  positive canonical receipt and rejects all eight independently rebuilt
  contradictions: live Node wrong mode, copied runtime wrong mode, wrong mode
  for each package family, and zero size for each package family. Each rebuild
  recomputes family, runtime, and whole-inventory aggregates and passes the new
  canonical receipt hash so the selected mode/size mismatch remains isolated.

These tests use repository-controlled synthetic data and the separately
branded fake only. They do not read live runtime or package bytes, import a
producer, or establish a producer occurrence, accepted input, construction,
runtime result, or `Observed` evidence.

## Status and evidence decision

| Item | Re-review decision |
| --- | --- |
| M2A-IBI01 — held attempt-root commit correlation | **OPEN on parent-sync fake/production decision divergence and exact BigInt-derived size representation** |
| M2A-IBI02 — complete inverse matrix | **CLOSED at Docker-free static/unit cooperative-host scope** |

| Item | Implementation-scope decision |
| --- | --- |
| M2A-IB01 — npm acquisition authority | **CLOSED; preserved, execution separately unauthorized** |
| M2A-IB02 — npm publication | **CLOSED; preserved** |
| M2A-IB03 — toolchain source closure | **BLOCKED only by residual M2A-IBI01** |
| M2A-IB04 — destination and toolchain publication | **CLOSED; preserved** |
| M2A-IB05 — one-shot and evidence separation | **CLOSED; preserved** |
| M2A-IB06 — implementation/coverage boundary | **BLOCKED only by residual M2A-IBI01** |

All contract-scope M2A-IB01 through M2A-IB06 and M2A-IBR01 through M2A-IBR03
decisions remain closed at their recorded scope. Construction inputs remain
unreviewed and `null`, every execution approval remains `false`, and
`evidenceReview` remains `"not-performed"`. No candidate was promoted to
accepted input, construction prerequisite, runtime result, or `Observed`.

## Verification and observed results

| Command | Observed result |
| --- | --- |
| `git status --short --branch`, scoped source/status inspection, and SHA-256 inventory | Existing accumulated multi-session dirty worktree preserved; the six current identities above were recorded without cleanup or reset. |
| `npm run m2a:transfer:verify` | Exit `0`; static verification passed and 1 focused file / 60 tests passed. |
| `npm run m2a:verify` | Exit `0`; adapter typecheck/build/static verification passed and 4 files / 5 tests passed. |
| `npm run typecheck` | Exit `0`; root no-emit TypeScript check passed. |
| `npm test` | Exit `1`; 99 files passed and 10 failed, with 824 tests passed and 39 failed. All 60 focused M2-A tests passed. Failures remained in out-of-scope M2-C/M2-D version contracts, M2-E CLI execution, and one probe-core network expectation. |
| `npm run check` | Exit `1`; aggregate checking stopped during formatting on seven `.serena/` files and `containers/profile-control/test/control-host-backend.test.ts`, before lint, typecheck, or test stages. |
| Focused Prettier check over the exact remediation/review allowlist | Exit `0`; all selected implementation, test, prompt, review, and status paths matched Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error was reported in the accumulated tracked diff. |

Passing commands remain static/unit observations and do not override the
independently reproduced M2A-IBI01 contradiction. `m0:doctor`, `m0:build`,
`m0:run`, `m0:verify`, either producer, npm acquisition/install/pack/approve/
rebuild, a lifecycle fixture, compiler, constructor, image build, Docker,
transfer, fixed-root inspection, result validation, cleanup, retry, Remote
Git, publication, deployment, and evidence promotion were intentionally not
run.

## Exact smallest next boundary

Save one prompt-first bounded Docker-free residual-remediation and fresh
independent re-review pair. The repair may change only the existing
dependency-input support/declaration, focused test, static verifier if needed,
and minimal status allowlist. It must:

1. make the represented parent-sync result exact own data consumed by the same
   private transition validator in production and the branded fake, with
   false/missing/extra/reordered sync-fact negatives;
2. retain device, inode, size, and mtime in one exact non-narrowed
   BigInt-derived identity representation and behaviorally reject each
   contradiction; and
3. preserve the closed M2A-IBI02 matrix and every no-producer, no-input,
   no-construction, no-Docker, no-result, and evidence non-promotion boundary.

Next: save the exact bounded Docker-free residual M2A-IBI01 parent-sync and
BigInt-identity remediation prompt plus fresh independent re-review prompt; do
not repair source or tests in that prompt-only task.
