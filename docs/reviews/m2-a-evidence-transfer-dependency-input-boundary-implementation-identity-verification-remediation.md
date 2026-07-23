# M0/M2-A dependency-input identity-verification remediation re-review

## Review target and decision

- Target: frozen-research issue #43's bounded M2A-IBI01R01/R02
  identity-verification remediation
- Review type: fresh independent Docker-free read-only re-review
- Review prompt:
  [m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation-review.md)
- Decision: **APPROVED at Docker-free static/unit cooperative-host
  implementation scope; no producer execution is approved**
- Closed in this review: M2A-IBI01R01, M2A-IBI01R02, and therefore
  M2A-IBI01/M2A-IB03/M2A-IB06 at that scope
- Preserved closed: M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 at
  their recorded Docker-free static/unit scopes
- Source, declaration, verifier, test, or prompt repair performed in this
  review: none

The focused suite now submits every required malformed attempt identity through
the separately branded fake and the shared `readAttemptIdentity()` boundary.
Each missing, extra, reordered, inherited, accessor, symbol, and Proxy
representation reaches the same retained
`M2A_TOOLCHAIN_ATTEMPT_CORRELATION_INVALID` terminal before initial-checkpoint
publication or runtime/source/package reads. The accessor getter and Proxy
traps remain uninvoked.

The static verifier now requires the exact current production
`stat.dev.toString()`, `stat.ino.toString()`, `stat.size.toString()`, and
`stat.mtimeNs.toString()` encodings and rejects direct `Number` narrowing of
each corresponding BigInt stat field. The focused behavior remains a required
part of `npm run m2a:transfer:verify`; production source markers alone are not
the command's complete gate.

No producer was imported or executed. This review did not access a fixed
input, construction, or result root; read `/usr/bin/node`, a live process
report, installed package bytes, environment, credentials, home/cache state,
or retained runtime state; communicate externally or over loopback/a Unix
socket; construct an image; call Docker; transfer or validate a result; or
promote evidence. Standing authorization was not needed or used.

## Reviewed identities and allowlist

| Path | SHA-256 |
| --- | --- |
| `experiments/npm12-install/scripts/m2a-transfer-inputs.mjs` | `edac896625a2b534438d4ff9cfd4f92d06a69ee902dbfb892876a72f6fd250b7` |
| `experiments/npm12-install/scripts/m2a-transfer-inputs.d.mts` | `aba27852a6329b84540ff8b4b8fc56fdab5229a210a8668e61931c1a5bc14176` |
| `experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs` | `e098878dcd5cc958e56f244e7143ab4cdcd1f10688e8592b403f4c8703348565` |
| `tests/m2a-evidence-transfer.test.ts` | `12c39882bf17daefe386090cf5f9df0bf4a1fbffb5a288a529d0481d71e5cda5` |
| `prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md` | `685d4412c5179cca6ac3a0bfdfae32f7683bba55cb4b4d1edea3f5b5d8593794` |
| `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation-review.md` | `8d74c7f1259f978c61250895e4ab3dea3386933a5d84cf2eb8b0eb595177ae8d` |

The support and declaration hashes exactly match the immediately preceding
residual-remediation review. They therefore did not change in this
verification-only remediation. The current change boundary is limited to the
static verifier, focused test, saved prompt pair, and minimal status records
allowed by the remediation/re-review prompts.

The repository remains an accumulated, uncommitted multi-session worktree, and
the implementation paths are untracked relative to `main`; Git alone cannot
attribute every older untracked path to one worker. This review used the
recorded prior hashes, exact current allowlist, source/import inspection, and
focused command behavior without resetting or rewriting unrelated M3, M4,
presentation, result, or user work.

Neither no-argument producer entry occurs in root package scripts. The focused
test imports only the side-effect-free support library and reads the producer
entries as source text; the static verifier likewise reads source without
importing a producer. Construction and production modules do not import the
dependency-input support module. The separately branded fake declaration
exposes no production path, descriptor, process object, environment, runtime
report, package root, production brand, callback, cleanup, or retry authority.

## M2A-IBI01R01 exact-key-shape behavior

`readAttemptIdentity()` first applies the shared plain-data `readRecord()`
decoder and then requires this exact ordered nine-key shape:

```text
type, mode, uid, gid, links, device, inode, size, mtimeNs
```

The focused test independently submits:

- a missing `mtimeNs` key;
- an extra `extra` key;
- the same nine keys beginning with `mtimeNs`, so key order is wrong;
- a missing own `mtimeNs` supplied only through an inherited prototype;
- an accessor-backed own `mtimeNs`;
- an otherwise valid identity with a symbol key; and
- an otherwise valid identity wrapped in a Proxy with counting traps.

Each value is assigned to the fake's `open-attempt-root` `pathChild`. The fake
first preserves the committed occurrence, then passes its opened/correlated
records and represented parent-sync fact to the same
`validateAttemptRootCommitTransition()` used by production. That transition
calls `readAttemptIdentity()` for parent path/descriptor identities, the
committed-child inventory, and both child path/descriptor identities.

All seven cases reproduced this exact trace:

```text
root-preflight
create-attempt-root
open-attempt-root
correlate-attempt-root
attempt-parent-sync
failed-checkpoint
```

Every result retained the committed occurrence and failed checkpoint, set
`toolchainPublished: false`, `retry: false`, `cleanup: false`, and
`evidenceReview: "not-performed"`, and omitted
`attempt-in-progress-write`, `runtime`, `source-first`, `source-second`, and
`inventory`. The accessor and Proxy counters both remained zero. Removing this
focused test boundary also removes text that the static verifier requires, and
the command separately executes the focused Vitest file, so the passing
production-source markers do not replace behavioral execution.

## M2A-IBI01R02 four-field production binding

Source inspection reproduced one canonical production identity projection:

```text
device: stat.dev.toString()
inode: stat.ino.toString()
size: stat.size.toString()
mtimeNs: stat.mtimeNs.toString()
```

`readAttemptIdentity()` requires every projected value to be a canonical
nonnegative decimal string and round-trip through `BigInt`; there is no mixed
number/string or public JavaScript-`bigint` identity branch. `sameIdentity()`
compares the complete ordered identity. Parent path/descriptor, committed
child, child path/descriptor, and inventory observations originate from
`{ bigint: true }` stat calls in production.

The static verifier requires all four exact `.toString()` expressions and
contains independent rejection expressions for
`Number(stat.dev)`, `Number(stat.ino)`, `Number(stat.size)`, and
`Number(stat.mtimeNs)`. It also retains the canonical-decimal decoder, shared
production/fake parent-sync edge, exactly two
`parentSynced: parentSync.parentSynced` consumers, absence of
`syncDirectory(WORK_ROOT)`, producer-import exclusions, closed construction
reachability, and the focused-test markers.

The focused positive transition still carries size
`"9007199254740993"`—greater than `Number.MAX_SAFE_INTEGER`—unchanged through
path child, held child, committed inventory, and the accepted shared
transition. The existing inverse behavior still rejects device, inode, size,
and mtime contradictions; numeric/BigInt/precision-colliding size; malformed
canonical decimals; parent/child identity drift; wrong type/mode/owner/link;
unchanged-sibling replacement; ordering and physical-alias contradictions;
sync and descriptor-close failures; and initial-checkpoint failures.

## Preserved M2A-IBI02 and evidence decision

The 62-test focused run retains the already accepted M2A-IBI02 matrix:

- the production-consumed runtime projection and runtime inventory reject
  version/platform/architecture, executable metadata, sparse/non-dense
  reports, path/order/alias, source-connection, row metadata, and complete
  inventory contradictions;
- TypeScript, `@types/node`, and `undici-types` each retain package tuple,
  first/second traversal, identity, alias, size, mode, and graph
  contradictions;
- the destination graph retains extra, missing, staging, reordered, aliased,
  disconnected, metadata, and copied-inventory contradictions; and
- the unchanged actual `validateConstructorToolchain()` consumer retains the
  positive receipt plus wrong live-Node mode, wrong copied-runtime mode, every
  package-family wrong mode, and every package-family zero-size negative after
  canonical aggregate reconstruction.

The reviewed support/declaration and parent-sync edge remain byte-identical.
All contract-scope M2A-IB01 through M2A-IB06 and M2A-IBR01 through M2A-IBR03
decisions remain closed. At implementation scope, this review closes
M2A-IBI01 and therefore M2A-IB03/M2A-IB06; M2A-IBI02 and
M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain closure.

Every reviewed construction binding remains `null`, every execution approval
remains `false`, and producer candidates retain
`evidenceReview: "not-performed"`. No candidate became accepted input,
construction prerequisite, runtime result, or `Observed`.

## Verification and observed results

| Command | Observed result |
| --- | --- |
| `git status --short --branch`, scoped source/status inspection, and SHA-256 inventory | Existing accumulated multi-session dirty worktree preserved; the six identities above were recorded without cleanup or reset. |
| `npm run m2a:transfer:verify` | Exit `0`; static verification passed and 1 focused file / 62 tests passed. |
| `npm run m2a:verify` | Exit `0`; adapter typecheck/build/static verification passed and 4 files / 5 tests passed. |
| `npm run typecheck` | Exit `0`; root no-emit TypeScript check passed. |
| `npm test` | Exit `1`; 99 files passed and 10 failed, with 826 tests passed and 39 failed. All 62 focused M2-A tests passed. Failures remained in out-of-scope M2-C/M2-D version contracts, M2-E CLI execution, and one probe-core network expectation. |
| `npm run check` | Exit `1`; aggregate checking stopped during formatting on seven `.serena/` files and `containers/profile-control/test/control-host-backend.test.ts`, before lint, typecheck, or test stages. |
| Focused Prettier check over the exact remediation/re-review allowlist | Exit `0`; all 15 selected support, declaration, verifier, test, prompt, review, and status paths matched Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error was reported in the accumulated tracked diff. |

Passing checks are Docker-free static/unit cooperative-host observations. They
do not establish hostile-kernel or same-authority resistance, machine-crash
durability beyond the reviewed synchronous transitions, live input, external
transport, producer occurrence, accepted input, construction, Docker, runtime
result, or evidence acceptance.

`m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, either producer, npm
acquisition/install/pack/approve/rebuild, a lifecycle fixture, compiler,
constructor, image build, Docker, transfer, fixed-root inspection, result
validation, cleanup, retry, Remote Git, publication, deployment, and evidence
promotion were intentionally not run.

## Exact smallest next boundary

Implementation closure does not approve either producer. The smallest next
task is prompt-only: save one exact bounded npm-acquisition producer-execution
contract and fresh independent review prompt. That contract must bind the
current reviewed producer/support/verifier identities, the argument-free
empty-environment command, the exact two-request HTTPS plan, absent fixed
acquisition root, one-shot/no-retry publication boundary, bounded sanitized
terminal, and a later independent candidate-result review.

That next task must not execute the producer, access the fixed input root,
communicate externally, acquire npm bytes, use standing authorization, or
approve toolchain capture, construction, Docker, runtime/result access, or
evidence promotion. The later external acquisition occurrence still requires
explicit authority beyond standing authorization.

Next: save the exact bounded npm-acquisition producer-execution contract and
fresh independent review prompt; do not execute the producer, access fixed
input, or use external communication in that prompt-only task.
