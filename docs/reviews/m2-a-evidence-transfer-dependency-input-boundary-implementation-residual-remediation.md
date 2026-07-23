# M0/M2-A residual dependency-input implementation re-review

## Review target and decision

- Target: frozen-research issue #43's residual M2A-IBI01 parent-sync and
  BigInt-identity remediation
- Review type: fresh independent Docker-free read-only re-review
- Review prompt:
  [m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md)
- Decision: **BLOCKED on the two residual verification findings below; no
  producer-execution contract or execution is approved**
- Current source decision: the original false-parent-sync and
  `Number(stat.size)` contradictions are closed in the inspected candidate
- Preserved closed: M2A-IBI02 and M2A-IB01, M2A-IB02, M2A-IB04, and M2A-IB05
  at their Docker-free static/unit implementation scopes
- Still open: M2A-IBI01 and therefore M2A-IB03/M2A-IB06 at implementation
  scope
- Source, declaration, test, verifier, or prompt repair performed in this
  review: none

The current production and separately branded fake paths now use the same
private exact-own-data parent-sync decoder and pass only its represented
`parentSynced` fact into `validateAttemptRootCommitTransition()`. The current
`statIdentity()` also retains BigInt-derived device, inode, size, and mtime as
canonical decimal strings, including a focused positive size above
`Number.MAX_SAFE_INTEGER`.

The review cannot close M2A-IBI01 because the required evidence boundary is
still incomplete. The focused behavior does not submit missing, extra, or
reordered attempt-identity keys, and it does not submit inherited, accessor,
symbol, or proxy attempt identities. Those cases are covered for the separate
parent-sync record, not for `readAttemptIdentity()`. In addition, the static
verifier requires and protects the exact string representation only for
`size`; it does not require the corresponding device, inode, and mtime
production encodings or reject their `Number(...)` narrowing. The fake
identity tests do not execute `statIdentity()`, so they cannot close that
production-verifier gap.

These are M2A-IBI01 verification findings, not a claim that the current
production source still contains the original semantic defects. Source
inspection alone and source-marker counts are insufficient for the exact
behavioral/static gate required by the saved review prompt.

No producer was imported or executed. This review did not access a fixed input
root, `/usr/bin/node`, a process report, installed packages, environment,
credentials, home/cache state, external or loopback communication,
construction, Docker, transfer, runtime/result state, or `Observed` evidence.
Standing authorization was not needed or used.

## Reviewed identities and allowlist

| Path | SHA-256 |
| --- | --- |
| `experiments/npm12-install/scripts/m2a-transfer-inputs.mjs` | `edac896625a2b534438d4ff9cfd4f92d06a69ee902dbfb892876a72f6fd250b7` |
| `experiments/npm12-install/scripts/m2a-transfer-inputs.d.mts` | `aba27852a6329b84540ff8b4b8fc56fdab5229a210a8668e61931c1a5bc14176` |
| `experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs` | `1a9767a64b758f5df34ed540a7e3085fd9ad55286cf7a54fc882e3b843015cd6` |
| `tests/m2a-evidence-transfer.test.ts` | `ac31d3bd9a018a207ffe02ed4fc52e4e173a82fffd0138c9e4a5dd0fe55ee539` |
| `prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md` | `92f1125731afbd3d8042e7e1d2d26b767d79089adbf7dbb7f2ac807860bd1c98` |
| `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md` | `1d488c14c0e9d7023149958b6b8bcdb30d6676481631bcc762398e1f2c1dd616` |

The repository remains an accumulated uncommitted multi-session worktree, and
the support, declaration, verifier, and focused test are untracked relative to
`main`. Git therefore cannot attribute their internal delta to one worker.
This review inspected only the residual prompt's implementation, declaration,
static-verifier, focused-test, prompt, and status allowlists and preserved all
unrelated M3, M4, presentation, result, and user work.

The residual implementation did not change either producer entry,
construction source/declaration, root package scripts, lockfiles, manifests,
Containerfiles/container sources, adapter/probe/package sources, fixtures,
scenarios, historical/results, Expected, or `Observed`. Neither producer entry
is reachable from root package scripts, construction, production, focused
tests, or verification imports. The declaration continues to expose only the
separately branded fake plain-data boundary and no path, descriptor, process
object, environment, runtime report, package root, production brand, callback,
cleanup, or retry authority.

## Parent-sync trace

### Production

Source inspection reproduced this exact order:

1. `createAttemptRootSynchronously()` opens fixed `WORK_ROOT` once with
   `O_DIRECTORY | O_NOFOLLOW`, retains that descriptor, and records held/path
   parent identity plus the bytewise-sorted child inventory.
2. One synchronous non-recursive mode-`0700` `mkdirSync` commits the fixed
   attempt root. The exact child is opened with directory/no-follow flags and
   correlated with the still-held parent.
3. The implementation captures BigInt-stat held/path parent and child
   identities and the complete after-inventory, then directly calls
   `fsyncSync(authority.parentFd)`. It does not reopen `WORK_ROOT` for the sync.
4. Only after `fsyncSync` returns does production construct
   `{ ok: true, settlement: "known", parentSynced: true }`, decode it through
   `validateAttemptParentSync()`, and pass
   `parentSync.parentSynced` into `validateAttemptRootCommitTransition()`.
   A thrown sync reaches the catch before a successful record or transition
   can be constructed.
5. `publishInitialAttempt()` uses the retained child descriptor for exclusive
   `attempt.next` creation, complete write and sync, same-descriptor reread,
   mode transition, close, rename to `attempt.json`, child-root sync, and final
   held child/parent correlation. `closeAttemptAuthority()` settles staging,
   child, and parent descriptors. Post-commit failure retains the root and
   enables no cleanup, repair, resume, or retry.

### Separately branded fake

The fake's `attempt-parent-sync` result now reaches the same
`validateAttemptParentSync()` decoder. `readRecord()` rejects Proxies, custom
or inherited prototypes, symbols, and accessors without invoking a getter;
`assertKeys()` requires exactly `ok`, `settlement`, and `parentSynced` in that
order. Only known success with literal `parentSynced: true` returns the frozen
represented fact used by the same commit transition.

Focused behavior submitted false, missing, extra, reordered, inherited,
accessor, symbol, proxy, wrong-`ok`, and unknown-settlement records. All ten
cases retained the committed occurrence, attempted only the sanitized failed
checkpoint, reached no `attempt-in-progress-write` or runtime read, published
no toolchain candidate, and exposed neither cleanup nor retry. The accessor
getter was never invoked.

The prior held/path parent, exact child, special-mode, owner/group, link,
unchanged-sibling, physical-alias, bytewise-order, initial-checkpoint, and
descriptor-close failure cases remain behavioral. The original parent-sync
fake/production data-edge contradiction is therefore closed in the current
source.

## BigInt-derived identity trace

Every attempt parent path/descriptor, committed child path/descriptor, and
child inventory observation uses `{ bigint: true }` and reaches
`statIdentity()`. That helper currently emits device, inode, size, and mtime as
`stat.dev.toString()`, `stat.ino.toString()`, `stat.size.toString()`, and
`stat.mtimeNs.toString()`. `readAttemptIdentity()` requires the four values to
match the canonical nonnegative decimal grammar and round-trip through
`BigInt`, while `sameIdentity()` compares the complete ordered identity.

The focused positive transition carries `"9007199254740993"` unchanged across
the path child, held child, committed inventory child, and accepted shared
transition. The focused inverse rejects:

- parent/path device and inode contradictions;
- path/held child inode, size, and mtime contradictions;
- a committed-child physical alias;
- the precision-colliding `"9007199254740992"` size;
- numeric and JavaScript-BigInt sizes;
- signed, fractional, exponent, whitespace, empty, and leading-zero sizes;
- noncanonical device, inode, and mtime strings; and
- preserved type, special-mode, owner/group, link, ordering, unchanged
  sibling, and physical-alias contradictions.

Each case stopped before `attempt-in-progress-write` and runtime/source reads,
retained the occurrence, published no candidate, and enabled no cleanup or
retry. The current source therefore closes the original `Number(stat.size)`
defect.

## Residual M2A-IBI01 verification findings

### M2A-IBI01R01 — attempt-identity exact-key behavior is not submitted

`readAttemptIdentity()` currently calls the strict shared `readRecord()` and
then `assertKeys()` over all nine identity keys, so inspection indicates the
right fail-closed behavior. The focused suite, however, mutates values only.
It does not submit an attempt identity with a missing, extra, or reordered key
or an inherited, accessor, symbol, or proxy representation. Parent-sync
exact-own-data cases exercise a different decoder and do not reproduce this
identity boundary.

The saved review prompt explicitly requires exact-key-shape identity failures
to be independently submitted. M2A-IBI01 remains open until those cases
behaviorally stop before checkpoint and runtime/source reads with the same
retention/non-publication result.

### M2A-IBI01R02 — static verification does not bind all four encodings

The static verifier requires `isCanonicalNonnegativeDecimal()`,
`size: stat.size.toString()`, and absence of `size: Number(stat.size)`. It does
not require the current device, inode, and mtime `.toString()` encodings or
reject `Number(stat.dev)`, `Number(stat.ino)`, or `Number(stat.mtimeNs)`.

Because focused fake transitions provide already projected identities, they
do not execute production `statIdentity()`. A future narrowing of any of those
three production fields could therefore pass the current static verifier and
focused fake behavior. The saved remediation contract required the static
gate to bind one exact four-field production representation. M2A-IBI01 and
M2A-IB06 remain open until the verifier enforces all four fields and the
focused behavioral suite remains part of the verification command.

## Preserved M2A-IBI02 and evidence decision

The focused 61-test run preserved the closed M2A-IBI02 matrix:

- the production-consumed runtime projection and runtime inventory reject
  version, platform, architecture, executable metadata, sparse/non-dense
  report, path/order/alias, source-connection, row metadata, and inventory
  contradictions;
- TypeScript, `@types/node`, and `undici-types` each reject package tuple,
  first/second source traversal, identity, alias, size, mode, and graph drift;
- the complete destination graph rejects extra, missing, staging, reordered,
  aliased, disconnected, metadata, and copied-inventory contradictions; and
- the unchanged actual `validateConstructorToolchain()` consumer rejects live
  Node, copied runtime, every package-family mode, and every package-family
  zero-size contradiction after rebuilt canonical aggregates.

All contract-scope M2A-IB01 through M2A-IB06 and M2A-IBR01 through M2A-IBR03
decisions remain closed at their recorded scope. At implementation scope,
M2A-IB01, M2A-IB02, M2A-IB04, M2A-IB05, and M2A-IBI02 remain closed.
M2A-IBI01, M2A-IB03, and M2A-IB06 remain open only on M2A-IBI01R01 and
M2A-IBI01R02.

Every construction input binding remains `null`, every execution approval
remains `false`, and every producer receipt/candidate retains
`evidenceReview: "not-performed"`. No candidate became an accepted input,
construction prerequisite, runtime result, or `Observed`.

## Verification and observed results

| Command | Observed result |
| --- | --- |
| `git status --short --branch`, scoped source/status inspection, and SHA-256 inventory | Existing accumulated multi-session worktree preserved; the six reviewed identities above were recorded without cleanup or reset. |
| `npm run m2a:transfer:verify` | Exit `0`; static verification passed and 1 focused file / 61 tests passed. |
| `npm run m2a:verify` | Exit `0`; adapter typecheck/build/static verification passed and 4 files / 5 tests passed. |
| `npm run typecheck` | Exit `0`; root no-emit TypeScript check passed. |
| `npm test` | Exit `1`; 99 files passed and 10 failed, with 825 tests passed and 39 failed. All 61 focused M2-A tests passed. Failures remained in out-of-scope M2-C/M2-D version contracts, M2-E CLI execution, and one probe-core network expectation. |
| `npm run check` | Exit `1`; aggregate checking stopped during formatting on seven `.serena/` files and `containers/profile-control/test/control-host-backend.test.ts`, before lint, typecheck, or test stages. |
| Focused Prettier check over the exact residual implementation/review allowlist | Exit `0`; all 15 selected implementation, declaration, verifier, test, prompt, review, and status paths matched Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error was reported in the accumulated tracked diff. |

Passing commands are Docker-free static/unit cooperative-host observations.
They do not establish hostile-kernel or same-authority resistance,
machine-crash durability beyond the exact synchronous transitions, live input,
external transport, producer occurrence, accepted input, construction,
Docker, runtime result, or evidence acceptance.

`m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, either producer, npm
acquisition/install/pack/approve/rebuild, a lifecycle fixture, compiler,
constructor, image build, Docker, transfer, fixed-root inspection, result
validation, cleanup, retry, Remote Git, publication, deployment, and evidence
promotion were intentionally not run.

## Exact smallest next boundary

Save one prompt-first bounded Docker-free M2A-IBI01 verification remediation
and fresh independent re-review pair. The later repair may change only the
existing dependency-input static verifier, focused test, and minimal status
allowlist. It must:

1. behaviorally submit missing, extra, reordered, inherited, accessor, symbol,
   and proxy attempt identities through the branded fake and reproduce the
   retained pre-checkpoint/pre-runtime stop; and
2. make the static verifier require the canonical decimal encoding and reject
   `Number` narrowing for device, inode, size, and mtime while preserving the
   shared parent-sync edge, M2A-IBI02 matrix, absent producer imports, and
   closed construction/evidence reachability.

Next: save the exact bounded Docker-free M2A-IBI01 identity-shape/static-
verifier remediation prompt and fresh independent re-review prompt; do not
repair source or tests in that prompt-only task.
