# M0/M2-A dependency-input boundary contract review

## Review target and decision

- Target: frozen-research issue #43's proposed npm-acquisition/constructor-
  toolchain dependency-input boundary
- Review type: fresh independent Docker-free read-only contract review
- Review prompt:
  [m2-a-evidence-transfer-dependency-input-boundary-review](../../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-review.md)
- Decision: **BLOCKED; no input-producer implementation or execution is
  approved**
- Blocking findings: M2A-IBR01 through M2A-IBR03 below
- Non-blocking findings: none
- Contract repair, implementation, or producer execution performed in this
  review: none

The proposal closes the credential-empty npm request and archive/receipt
transaction at contract scope. The constructor-toolchain half does not yet
close a complete identity-bound source/copy transaction, a durable one-shot
failure occurrence, or the existing constructor consumer's exact receipt
semantics. The maximum M2A-IB06 decision is therefore not reached. Standing
authorization was not needed or used.

## Reproduced fixed identities and schemas

The review opened only the contract-listed repository-controlled tracked
inputs with `O_NOFOLLOW`, required stable one-link regular-file identity before
and after each read, settled all 41 descriptor closes, and reproduced:

```text
31 rows: sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04
41 rows: sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526
```

The fixed generation remains `20260721-01`. The acquisition, toolchain,
construction, and result roots match the reviewed construction constants, and
all five constructor reviewed digests/aggregates remain `null`; build/runtime
approvals remain `false`; every `evidenceReview` remains `not-performed`.

The current pure validators accepted synthetic canonical records with the
proposal's exact ordered schemas:

```text
m2a-transfer-acquisition/v1:
schemaVersion, generation, packageName, version, tarballSize,
tarballSha256, integrity, status, scriptsRun, credentialsUsed,
externalNetworkPhase, evidenceReview

m2a-transfer-toolchain/v1:
schemaVersion, generation, runtime, packages, inventory,
inventoryAggregate, status, evidenceReview

runtime:
logicalId, version, platform, architecture, executableSize,
executableSha256, loadedRuntimeInventoryAggregate

package:
name, version, integrity, inventoryAggregate

inventory:
logicalPath, mode, size, sha256
```

The three package tuples also match the current construction constants and
lockfile: TypeScript `5.9.3`, `@types/node` `20.19.43`, and `undici-types`
`6.21.0`, with the contract's exact SHA-512 integrity strings.

## Reproduced npm boundary

The only proposed npm entry is the argument-free, empty-environment
`/usr/bin/node experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs`.
Contract review does not authorize it, and the future external HTTPS occurrence
still requires separate explicit authority that standing authorization cannot
supply.

The request plan is exactly two sequential, no-retry, no-child HTTPS GETs to
`registry.npmjs.org:443`, first
`https://registry.npmjs.org/npm/12.0.1` and then
`https://registry.npmjs.org/npm/-/npm-12.0.1.tgz`. It fixes TLS `>=1.2`, server
name, certificate verification, identity encoding, closed connections, the two
exact `Accept` values, 30,000 ms request deadlines, 250 ms destroy grace,
1,000 ms close bounds, and 1,048,576/67,108,864-byte response limits. Redirect,
credential, proxy, compression, partial response, retry, npm, extraction,
script, lifecycle, loopback, and Unix-socket paths are unavailable.

The untrusted metadata must select only npm `12.0.1`, the fixed tarball URL,
and canonical SHA-512 SRI. The held archive write correlates streamed SHA-512,
SHA-256, byte count, status, EOF, close, optional length, and the metadata SRI.
Actual SRI, size, SHA-256, and receipt digest remain unknown future
observations; none was inferred in this review.

The acquisition root is exclusive mode `0700`. Archive and receipt each use a
mode-`0600` `.next` same-descriptor write/sync/reread/hash/mode/identity/close
transaction followed by one rename and held-directory sync. Success requires
only `npm-12.0.1.tgz` and `acquisition.json`, both mode `0444`, and the receipt
retains `scriptsRun: false`, `credentialsUsed: false`,
`externalNetworkPhase: "dependency-acquisition-only"`, and
`evidenceReview: "not-performed"`. Failure retains the reached partial state as
non-evidence and permits no later request, cleanup, overwrite, resume, or
retry. M2A-IB01 and M2A-IB02 close at contract scope.

## Reproduced toolchain direction

The separately gated toolchain entry is argument-free, empty-environment,
offline, child-free, and restricted to fixed `/usr/bin/node`, its own process
report's dense shared-object list, and the three repository-local package
roots. It fixes Node `v20.18.2` on Linux/x64, imports the reviewed ten built-ins
before its report, excludes `/proc`, discovery, alternate executables, caches,
home paths, global inputs, and source absolute-path persistence, and assigns
deterministic runtime logical names.

The proposed receipt keeps four disjoint lexical families, the live
`runtime/constructor-node` row, copied shared objects, complete package-tree
rows, family and whole aggregates, and the exact canonical schema above. The
root/file modes, bounds, `.next` copy/receipt transactions, one-link policy,
retention-only failures, and evidence non-promotion are useful fixed direction.
They do not close the three findings below.

## M2A-IB decision summary

| Item | Contract-scope decision |
| --- | --- |
| M2A-IB01 — npm acquisition authority | **CLOSED at contract scope; execution remains separately unauthorized** |
| M2A-IB02 — npm publication | **CLOSED at contract scope** |
| M2A-IB03 — toolchain source closure | **BLOCKED by M2A-IBR01 and M2A-IBR02** |
| M2A-IB04 — toolchain publication | **BLOCKED by M2A-IBR01 through M2A-IBR03** |
| M2A-IB05 — failure, review, and evidence classes | **BLOCKED by M2A-IBR02** |
| M2A-IB06 — implementation boundary | **BLOCKED by all three findings** |

## Blocking findings

### M2A-IBR01 — package-source and published-tree completeness are not identity-bound

The proposal requires a complete lexical traversal, then holds every admitted
file descriptor before output. It does not fix the package-root and nested-
directory descriptor inventory, a second descriptor-correlated traversal, or
an equivalent barrier that proves no file was added, removed, renamed, or
reparented between traversal and copy. A controlled model can therefore retain
every originally opened file identity while a new regular file appears in an
already traversed directory; the held-file set and its self-described receipt
remain internally consistent but no longer represent the complete fixed source
tree.

The publication half similarly constructs receipt rows from the copy
operations but does not require one final held-root recursive identity/
inventory revalidation after all file renames and before `toolchain.next` is
constructed. The prose says success leaves the exact copied inventory, but it
does not choose the directory identities, full metadata, transition snapshots,
or pre-receipt comparison that enforce that claim. Fresh later review can
reject a bad visible root; it cannot make the producer's earlier `complete`
claim truthful.

The smallest remediation must bind every source directory and the destination
root to exact no-follow descriptor identity, compare a complete second lexical
source traversal to the originally held file set, and compare the complete
published tree to the canonical inventory immediately before receipt
construction. It must settle every traversal/copy/root descriptor without
reading future file contents in the remediation task.

### M2A-IBR02 — a pre-root toolchain failure has no durable one-shot occurrence

The toolchain contract deliberately validates `/usr/bin/node`, its process
report, all shared objects, the 41 tracked rows, and all three package trees
before creating the fixed toolchain root. It also states that every producer
has at most one occurrence and that any failure is retained without retry.

If version/report/source/traversal/descriptor settlement fails before root
creation, the exact reached repository state is still root-absent. A later
invocation cannot distinguish that consumed occurrence from a never-started
candidate. No exclusive attempt/checkpoint object or external durable record
is fixed by this contract, so the one-shot rule is only an instruction and is
not represented by the producer transaction. This is the same failure class
for source drift, an unknown source close, or the 120,000 ms producer bound.

The smallest remediation must fix one exclusive durable toolchain-attempt
checkpoint before the first fallible host-source read, bind its exact
in-progress/failure/success transitions and modes, and make every later
invocation stop on its presence without inspection, cleanup, repair, or retry.
It must preserve the canonical `toolchain.json` as candidate rather than
evidence.

### M2A-IBR03 — the approved implementation cannot close the existing consumer schema

The proposal requires the live `runtime/constructor-node` row to retain mode
`0555`, every copied runtime/package row to use mode `0444`, and package files
to be nonempty. The current construction consumer
`validateConstructorToolchain()` accepts either `0444` or `0555` for every
inventory family and accepts zero-length package rows. The independent pure
matrix recomputed every family/whole aggregate and receipt digest and observed
all three contradictory canonical receipts accepted:

```text
runtime/constructor-node mode 0444     accepted
packages/typescript/bin/tsc mode 0555  accepted
packages/@types/node/index.d.ts size 0 accepted
```

The M2A-IB06 allowlist permits a new input module and entries but excludes
`m2a-transfer-construction.mjs` and its declaration, so the approved
implementation cannot make the existing construction prerequisite enforce the
new exact receipt contract. A later reviewed digest is not a substitute for a
pure validator rejecting structurally invalid candidate classes.

The smallest remediation must either add only the exact existing construction
validator/declaration paths needed to enforce these already chosen mode/size
relations or define one exact new validated-input object consumed by the
constructor before any later binding update. Focused negatives must reach the
actual consumer boundary, not only a disconnected producer validator.

## Evidence classes, limitations, and verification

This is documentation, tracked-byte identity, and pure-validator evidence
only. It establishes no registry response, npm archive, runtime closure,
installed package inventory, filesystem transaction, receipt digest,
construction input, image, lifecycle, transfer, result, or `Observed`
evidence. Cooperative-host, DNS/TLS, filesystem, runtime/library drift, and
same-authority race limitations remain explicit.

An initial unscoped `find . -name AGENTS.md` lookup encountered permission-
denied entries beneath pre-existing result directories and was abandoned. It
read no result file content; every task inspection and calculation after that
diagnostic was restricted to the repository-controlled documentation and
tracked source listed by the review boundary.

| Command | Observed result |
| --- | --- |
| `git status --short --branch` and scoped read-only inspection | Existing accumulated multi-session dirty worktree was preserved; no cleanup/reset. |
| Repository-controlled descriptor/validator audit | Reproduced 31/41 rows and both exact aggregates; the exact acquisition schema and nominal toolchain schema validated; all three wrong-mode/empty-row toolchain variants were accepted. |
| Focused Prettier check over the contract, saved review prompt, this review, and five status records | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error was reported in the accumulated tracked diff. |

No test is required for this documentation-only review. Apart from the
permission-denied metadata traversal disclosed above, no fixed ignored root,
result file content, installed package tree, `/usr/bin/node` byte, process
report, environment, credential, home/cache path, network/socket, child,
producer entry, npm, compiler, constructor, Docker/runtime socket, transfer,
runtime/result operation, Remote Git, publication, deployment, evidence
promotion, or standing authorization was used.

## Decision and next boundary

M2A-IB01 and M2A-IB02 close at contract scope. M2A-IB03 through M2A-IB06
remain open. No producer implementation may begin until one bounded Docker-
free contract remediation fixes M2A-IBR01 through M2A-IBR03 and a fresh
independent read-only re-review closes them.

Next: save the exact bounded Docker-free M2A-IBR01 through M2A-IBR03 contract-
remediation prompt and fresh independent re-review prompt; do not acquire or
inspect npm/toolchain bytes, execute either producer, construct a context or
image, call Docker, or access runtime/result state.
