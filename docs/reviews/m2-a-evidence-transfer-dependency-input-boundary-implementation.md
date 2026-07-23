# M0/M2-A dependency-input implementation review

## Review target and decision

- Target: frozen-research issue #43's bounded M0/M2-A dependency-input
  static/unit implementation
- Review type: fresh independent Docker-free read-only implementation review
- Review prompt:
  [m2-a-evidence-transfer-dependency-input-boundary-implementation-review](../../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md)
- Decision: **BLOCKED; no input-producer execution is approved**
- Blocking findings: M2A-IBI01 and M2A-IBI02 below
- Non-blocking findings: none
- Implementation, declaration, test, verifier, or prompt repair performed in
  this review: none

M2A-IB01, M2A-IB02, M2A-IB04, and M2A-IB05 close at the Docker-free
static/unit implementation scope described below. M2A-IB03 remains blocked on
the missing production attempt-root correlation, and M2A-IB06 remains blocked
on both that production/fake mismatch and the incomplete required inverse
matrix. The closed M2A-IB01 through M2A-IB06 and M2A-IBR01 through M2A-IBR03
contract decisions are unchanged.

This decision does not authorize either no-argument producer, npm acquisition,
host runtime or installed-package reads, external communication, construction,
image build, Docker, transfer, result access, input acceptance, or evidence
promotion. Standing authorization was not needed or used.

## Reviewed implementation boundary

The review compared the implementation against the exact M2A-IB06 allowlist:

```text
experiments/npm12-install/scripts/m2a-transfer-inputs.mjs
experiments/npm12-install/scripts/m2a-transfer-inputs.d.mts
experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs
experiments/npm12-install/scripts/capture-m2a-transfer-toolchain.mjs
experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs
experiments/npm12-install/scripts/m2a-transfer-construction.mjs
experiments/npm12-install/scripts/m2a-transfer-construction.d.mts
tests/m2a-evidence-transfer.test.ts
experiments/npm12-install/README.md
docs/m2-a-evidence-transfer-dependency-input-boundary.md
docs/m2-a-evidence-transfer-construction-execution-gate.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md
prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md
```

The implementation adds no package command for either producer. Static source
inspection found neither entry in root package scripts, ordinary construction
or production imports, focused tests, or verification command reachability.
The review did not import or execute either entry. Existing accumulated M3,
M4, presentation, result, and other user working-tree changes were preserved.

## M2A-IB01 and M2A-IB02 — acquisition implementation

The fixed data reproduces generation `20260721-01`, npm `12.0.1`, both exact
`registry.npmjs.org:443` request paths, TLS `>=1.2`, certificate verification,
identity encoding, connection close, exact request headers, 30,000 ms absolute
deadlines, 250 ms destroy grace, 1,000 ms close bounds, and
1,048,576/67,108,864-byte response bounds. The production entry is
argument-free, requires an empty environment, and exposes no caller-selected
URL, registry, proxy, credential, header, path, timeout, retry, redirect,
backend, or callback.

The metadata validator fixes npm `12.0.1`, the exact tarball URL, and canonical
SHA-512 SRI. The tarball transaction correlates observed bytes, SRI, SHA-256,
size, EOF, request/response close, mode, held file identity, and the canonical
receipt. Archive and receipt publication each use one exclusive mode-`0600`
staging file, complete write/sync/reread, mode-`0444` transition, known close,
rename, directory inventory comparison, and directory sync. The final
`m2a-transfer-acquisition/v1` record preserves `scriptsRun: false`,
`credentialsUsed: false`, `externalNetworkPhase:
"dependency-acquisition-only"`, and `evidenceReview: "not-performed"`.

The separately branded fake state machine follows metadata before tarball,
stops after every exercised response/publication failure, retains partial
state, and reports no cleanup or retry. Exact-own-data request validation
rejects sparse arrays, accessors, Proxies, and field drift without invoking
attacker getters. M2A-IB01 and M2A-IB02 therefore close at Docker-free
static/unit implementation scope; no external request or fixed-root operation
was performed by this review.

## M2A-IB03 and M2A-IB04 — attempt, source, copy, and publication

The support implementation fixes the synchronous initial commit
classification, canonical
`m2a-transfer-toolchain-attempt/v1` records, fixed Node/package identities,
first and second package-source graph projections, held source file reads,
seven destination directories, complete destination traversal, copied-file
mode/size/hash correlation, canonical `m2a-transfer-toolchain/v1` bytes, and
the receipt-bound complete checkpoint as the final mutation.

The source and destination algorithms retain file/directory identities,
reject aliases and graph disagreement, keep source file handles through copy,
close owned handles fail closed, and publish no receipt before the final
destination traversal. These relations close M2A-IB04 at the reviewed
Docker-free static/unit scope, subject to the cooperative repository-owned
Linux-host limitation.

M2A-IB03 does not close because the production occurrence transition does not
implement one required identity edge:

### M2A-IBI01 — production attempt-root correlation is not held across commit

The contract requires the producer, after the synchronous exclusive
`mkdirSync` commit, to open and hold the new attempt root with no-follow
semantics, correlate that exact lexical child and full identity to the held
parent, and sync that held parent before checkpoint publication.

`createAttemptRootSynchronously()` opens and snapshots `WORK_ROOT`, checks the
two names, calls `mkdirSync(TOOLCHAIN_ATTEMPT_ROOT, { mode: 0o700,
recursive: false })`, rechecks only the parent identity, and then closes the
parent descriptor. It does not open or identity-check the committed child and
does not return a parent/child correlation. The caller later reopens
`WORK_ROOT` in `syncDirectory()` and independently opens the attempt-root path
inside `publishAttempt()`.

The fake state machine contains explicit `open-attempt-root`,
`correlate-attempt-root`, and `attempt-parent-sync` steps, and its tests inject
failure at each step. Those fake steps have no matching production decision
that can establish the contracted same-held-parent child identity. The static
verifier checks only source-string presence for `mkdirSync` and
`O_NOFOLLOW`; it does not bridge this production/fake gap.

The durable root still prevents a fresh invocation after the commit, so this
finding does not reopen the contract's synchronous commit classification. It
blocks implementation approval until production preserves one held parent,
correlates the committed mode-`0700` child by exact identity, syncs through
that authority, and the fake/static checks prove the same transition.

## M2A-IB05 and M2A-IB06 — evidence separation, consumer, and coverage

Known failures and settlement-unknown branches retain the reached root or
checkpoint, expose only sanitized issue codes, and do not promote a visible
candidate into reviewed input, construction, runtime result, or `Observed`.
Receipt/checkpoint records keep `evidenceReview: "not-performed"` and reviewed
construction bindings remain `null`. M2A-IB05 closes at Docker-free
static/unit implementation scope.

The actual `validateConstructorToolchain()` consumer now requires mode `0555`
only for `runtime/constructor-node`, mode `0444` for every other runtime row
and every package row, and positive package sizes. Its existing four-family
partition, lexical inventory order, per-family/whole aggregates, reviewed
binding, and canonical byte checks remain in place.

M2A-IB06 does not close because its exact inverse-coverage deliverable is
incomplete:

### M2A-IBI02 — required fake/unit inverse matrix is incomplete

The focused tests demonstrate one live-Node wrong mode, one copied-runtime
wrong mode, one TypeScript wrong package mode, and one zero-size
`@types/node` row through the actual constructor consumer. They do not exercise
wrong package mode independently for `@types/node` and `undici-types`, or a
zero-size package row independently for TypeScript and `undici-types`, despite
the contract requiring every wrong family mode and zero-size package row.

The separately branded toolchain fake is also not exercised with wrong Node
version, platform, architecture, executable mode/link count, non-dense report,
duplicate shared-object rows, or shared-object path drift. The source-graph
tests cover a small add/remove/parent/identity/case subset, but do not reproduce
the contract's full package type/link/sparse/replacement/alias/traversal
matrix. Passing the 56 focused tests therefore cannot establish the complete
M2A-IB06 negative boundary claimed by the implementation handoff.

The smallest remediation must add the missing fake/unit inverse cases and
make the static verifier require behavioral coverage rather than source
strings alone. It must not import or execute either producer or access live
runtime/package or fixed-root bytes.

## Decision summary

| Item | Implementation-scope decision |
| --- | --- |
| M2A-IB01 — npm acquisition authority | **CLOSED at Docker-free static/unit scope; execution separately unauthorized** |
| M2A-IB02 — npm publication | **CLOSED at Docker-free static/unit scope** |
| M2A-IB03 — toolchain source closure | **BLOCKED by M2A-IBI01** |
| M2A-IB04 — toolchain publication | **CLOSED at Docker-free static/unit cooperative-host scope** |
| M2A-IB05 — one-shot, review, and evidence classes | **CLOSED at Docker-free static/unit scope** |
| M2A-IB06 — implementation boundary | **BLOCKED by M2A-IBI01 and M2A-IBI02** |

## Verification and observed results

| Command | Observed result |
| --- | --- |
| `git status --short --branch` and scoped AGENTS/document/source inspection | Existing accumulated multi-session worktree changes were preserved; no cleanup or reset was performed. |
| `npm run m2a:transfer:verify` | Exit `0`; static verification passed and 1 focused file / 56 tests passed. |
| `npm run m2a:verify` | Exit `0`; adapter typecheck/build/static verification passed and 4 files / 5 tests passed. |
| `npm run typecheck` | Exit `0`; root TypeScript checking passed. |
| `npm test` | Exit `1`; 99 files passed and 10 failed, with 820 tests passed and 39 failed. The focused M2-A file passed; failures remained in out-of-scope version-drift, M2-E CLI, probe-core network-expectation cases. |
| `npm run check` | Exit `1` during formatting; eight existing warnings remained under `.serena/` and `containers/profile-control/test/control-host-backend.test.ts`, so lint/typecheck/test stages did not run in this aggregate command. |
| Focused Prettier check over the exact implementation allowlist, saved prompt pair, this review record, and changed status files | Exit `0`; every selected file matched Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error was reported in the accumulated tracked diff. |

The focused passes are static/unit observations only. They establish no
registry response, npm archive, host runtime closure, installed package
inventory, producer occurrence, accepted input, construction input, image,
Docker/runtime result, transfer, or `Observed` evidence.

The implementation remains limited to a cooperative repository-owned Linux
host. It does not prove hostile-kernel or same-authority interference
resistance, machine-crash durability beyond the exact synced transitions,
external transport behavior, or future input correctness.

No fixed ignored input/construction/result root, `/usr/bin/node` byte, live
process report, installed package tree, environment, credential, home/cache
path, network or socket, child, producer entry, npm acquisition/install/pack,
compiler, constructor, lifecycle fixture, image build, Docker/runtime socket,
transfer, runtime/result operation, Remote Git, publication, deployment,
evidence promotion, or standing authorization was used.

## Blocked boundary and next task

No producer-execution contract is permitted while M2A-IBI01 and M2A-IBI02
remain open. Repository convention requires the exact bounded Docker-free
implementation-remediation and fresh independent re-review prompts to be saved
before source or test repair.

Next: save the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation-remediation prompt and fresh independent re-review prompt; do
not repair implementation or tests, import or execute either producer, access
input, use external communication, construct an image, call Docker, or access
runtime/result state in that prompt-only task.
