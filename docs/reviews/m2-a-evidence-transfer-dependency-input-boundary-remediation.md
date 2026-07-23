# M0/M2-A dependency-input contract-remediation re-review

## Review target and decision

- Target: frozen-research issue #43's bounded M2A-IBR01 through M2A-IBR03
  dependency-input contract remediation
- Review type: fresh independent Docker-free read-only contract re-review
- Review prompt:
  [m2-a-evidence-transfer-dependency-input-boundary-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation-review.md)
- Decision: **BLOCKED; no input-producer implementation or execution is
  approved**
- Closed in this review: M2A-IBR01 and M2A-IBR03
- Preserved closed: M2A-IB01 and M2A-IB02 at contract scope
- Still open: M2A-IBR02 and therefore M2A-IB03 through M2A-IB06
- Contract repair, implementation, test change, or producer execution
  performed in this review: none

The remediation now binds both complete package-source traversals and the
complete pre-receipt destination traversal through held directory authority.
It also adds only the two actual-constructor consumer paths needed to enforce
the selected inventory mode/size relations. Those changes close M2A-IBR01 and
M2A-IBR03 at contract scope.

One narrower durable-occurrence contradiction remains. The contract says an
unknown attempt-root creation consumes the generation, but a creation that
settles unknown while leaving the root absent has no durable state that a
fresh invocation can observe. That later invocation can establish both fixed
roots absent and start a new occurrence. M2A-IBR02 therefore remains open.

Standing authorization was not needed or used. This review did not access a
fixed ignored root, future input bytes, the host runtime or installed package
trees, credentials, environment, external communication, a producer,
construction, Docker/runtime, transfer, result state, or evidence.

## Reproduced fixed identities and schemas

The review opened the 41 fixed repository-controlled input rows read-only with
`O_NOFOLLOW`, required stable one-link regular-file identity before and after
each read, settled every descriptor close, and reproduced:

```text
31 rows: sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04
41 rows: sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526
```

Generation `20260721-01`, the acquisition/toolchain/construction/result roots,
and all null reviewed bindings remain unchanged. The three package tuples
still match the construction constants and lockfile:

| Package | Version |
| --- | --- |
| `typescript` | `5.9.3` |
| `@types/node` | `20.19.43` |
| `undici-types` | `6.21.0` |

The ordered acquisition and toolchain receipt schemas remain
`m2a-transfer-acquisition/v1` and `m2a-transfer-toolchain/v1`. The remediation
adds the ordered `m2a-transfer-toolchain-attempt/v1` schema with exactly:

```text
schemaVersion, generation, state, issue, toolchainReceiptSha256,
inventoryAggregate, evidenceReview
```

The fixed credential-empty two-request npm transport, archive/receipt
transaction, unknown future digest fields, external-communication gate, and
candidate/evidence separation are unchanged. M2A-IB01 and M2A-IB02 remain
closed at contract scope without authorizing acquisition.

## M2A-IBR01 source and destination completeness

### Source graph — closed

Each package root and nested directory is opened from its already held lexical
parent. The private graph binds package family, relative path, parent/name,
type, full mode, effective owner/group, link count, and BigInt device, inode,
size, and mtime. Children are enumerated in bytewise lexical order through the
same authority, and every admitted file is held by its own no-follow
descriptor.

After the first complete graph holds every admitted source file and before
output creation, the contract requires a second complete traversal through
the same held directory descriptors. It compares the complete ordered
directory/file graph and separately revalidates every held file descriptor.
Added, removed, renamed, reparented, replaced, aliased, reordered,
inaccessible, or uncertain data rejects before output. All source-directory
closes settle known before output, while admitted file descriptors remain held
through their copy transactions.

This closes the original missing-directory-identity and missing-second-
traversal finding. The contract no longer treats a stable held file set alone
as proof of source-tree completeness.

### Destination graph — closed

The fixed toolchain root and exactly seven mode-`0700` destination directories
are created beneath already held parents with operation-specific before/after
inventories. Every copied file uses one held source descriptor and one
mode-`0600` sibling staging descriptor, then sync/reread/hash/mode/known-close
and exact non-replacing rename to a mode-`0444`, one-link final row.

After every copied-file rename and source/copy settlement, and before any
`toolchain.next` byte is serialized, the contract requires a complete
traversal through the same held toolchain-root and destination-directory
authority. The physical graph must contain exactly the seven directories and
one copied file per canonical inventory row other than the virtual live-Node
row. It rejects extra, missing, staging, replaced, aliased, disconnected,
reordered, inaccessible, or uncertain entries and correlates every admitted
file identity, mode, link count, size, and SHA-256 to its copy transaction.

The separate attempt root is outside this graph. No reopening substitutes for
the held destination authority, and receipt rows derived only from copy
operations are explicitly invalid. This closes the original pre-receipt
destination-completeness finding.

## M2A-IBR02 durable occurrence

### Closed checkpoint branches

The separate fixed attempt root and canonical `attempt.json` are created
before any fallible host runtime, process-report, tracked-source, or installed-
package read. Once exclusive root creation is known successful:

1. the root is correlated to the held parent and synced;
2. canonical `in-progress` bytes are written through `attempt.next`, synced,
   reread, changed to mode `0444`, closed known, renamed, and root-synced;
3. no source read begins before that publication settles;
4. every later known failure attempts one sanitized `failed` replacement, with
   the synced `in-progress` record remaining durable if replacement is
   unknown; and
5. success replaces the checkpoint only after the exact candidate receipt and
   inventory aggregate settle.

A present attempt root blocks every later invocation without opening or
inspecting either fixed root. These branches correctly distinguish a
never-started candidate from every failure after a known successful root
creation, including failures that leave the toolchain root absent.

### Residual unknown-create contradiction — M2A-IBR02 remains open

The first root-creation transition has three stated outcomes:

| Creation outcome | Contract state |
| --- | --- |
| Known denial before commit | no producer occurrence |
| Known success | durable attempt root, followed by canonical `in-progress` |
| Unknown settlement | terminal and generation-consuming |

Only the known-success branch has a necessarily durable object. Consider the
allowed unknown branch in which the creation did not materialize a directory:

```text
first invocation:
  attempt root absent
  toolchain root absent
  create attempt root -> settlement unknown, root actually absent
  in-memory decision -> generation consumed

fresh invocation:
  attempt root absence is now established
  toolchain root absence is established
  "present or cannot establish absence" guard is false
  exclusive attempt-root creation may run again
```

The earlier uncertainty is not encoded in the repository. A fresh invocation
cannot distinguish it from the contract's known pre-commit no-occurrence
branch. The claim that unknown creation consumes the generation is therefore
an instruction held by the first process, not the required durable one-shot
state.

This gap is narrower than the original pre-source failure finding: unknown
initial checkpoint publication after a created root, and every later failure,
remain durable because the root is present. Only unknown settlement of the
exclusive attempt-root creation while the root remains absent is open.

## M2A-IBR03 actual constructor consumer — closed at contract scope

The current pure `validateConstructorToolchain()` was independently exercised
with three canonical contradictory receipts. As expected before
implementation, it still accepted:

```text
runtime/constructor-node mode 0444
packages/typescript/bin/tsc mode 0555
packages/@types/node/index.d.ts size 0
```

This observation does not reopen the contract remediation. M2A-IB06 now adds
only:

```text
experiments/npm12-install/scripts/m2a-transfer-construction.mjs
experiments/npm12-install/scripts/m2a-transfer-construction.d.mts
```

Those are the actual validator and its declaration. The later bounded
implementation can therefore require mode `0555` only for the sole live-Node
row, mode `0444` for every copied runtime/package row, and positive size for
every package row, with focused negatives reaching the actual consumer. No
other construction or runtime path is opened. M2A-IBR03 closes at contract
scope; the three observed acceptances remain required future implementation
negatives rather than accepted behavior.

## Decision summary

| Item | Re-review decision |
| --- | --- |
| M2A-IB01 — npm acquisition authority | **CLOSED at contract scope; preserved** |
| M2A-IB02 — npm publication | **CLOSED at contract scope; preserved** |
| M2A-IB03 — toolchain source closure | **BLOCKED only by residual M2A-IBR02** |
| M2A-IB04 — toolchain publication | **BLOCKED only by residual M2A-IBR02** |
| M2A-IB05 — failure, review, and evidence classes | **BLOCKED only by residual M2A-IBR02** |
| M2A-IB06 — implementation boundary | **BLOCKED pending M2A-IBR02 closure** |

| Finding | Re-review decision |
| --- | --- |
| M2A-IBR01 — source/destination completeness | **CLOSED** |
| M2A-IBR02 — durable pre-source occurrence | **OPEN only on unknown root creation with a root-absent durable state** |
| M2A-IBR03 — actual-consumer allowlist | **CLOSED at contract scope** |

## Exact smallest remediation

One further prompt-first Docker-free contract remediation may change only the
dependency-input contract, its fresh re-review prompt, and the minimal status
records. It must make the first attempt-root transition distinguish exactly:

1. a known no-create result that starts no occurrence; and
2. every started or settlement-unknown occurrence through state that remains
   durably observable to every fresh invocation before any source read.

It must not claim that a root-absent unknown creation consumed the generation
unless another already fixed durable authority represents that fact. If the
contract instead chooses a root-creation primitive with only known settled
create/no-create outcomes at the cooperative-host boundary, it must remove the
contradictory unknown-consumed branch and bind the primitive, settlement
limit, and focused fresh-invocation negatives exactly. No implementation,
producer execution, input access, external communication, construction, or
Docker work may enter that remediation.

M2A-IBR01 and M2A-IBR03 must remain closed. The next re-review must reproduce
unknown create with both materialized and absent roots, process loss between
creation and initial checkpoint publication, a fresh second invocation, and
the exact no-inspection/no-retry decision.

## Evidence classes, limitations, and verification

This is documentation, tracked-byte identity, and pure-validator evidence
only. It establishes no registry response, npm archive, runtime closure,
installed package inventory, filesystem producer transaction, receipt digest,
construction input, image, lifecycle, transfer, result, or `Observed`
evidence. Cooperative-host, DNS/TLS, filesystem, runtime/library drift, and
same-authority race limitations remain explicit.

| Command | Observed result |
| --- | --- |
| `git status --short --branch` and scoped repository-controlled inspection | Existing accumulated multi-session dirty worktree was preserved; no cleanup/reset. |
| Descriptor-controlled aggregate/schema/consumer/checkpoint assertion | Exit `0`; reproduced 31/41 rows and both aggregates, all three package tuples and receipt schema IDs, the three current consumer acceptances, and the root-absent unknown-create second-invocation contradiction. |
| Focused Prettier check over the remediated contract, saved prompt pair, this review, and six status records | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error was reported in the accumulated tracked diff. |

Tests, typecheck, builds, broad checks, either producer, lifecycle fixtures,
construction, Docker, transfer, fixed-root inspection, and result validation
were intentionally not run because they cannot establish this contract-only
decision and are outside the saved review prompt.

No fixed ignored root, future input byte, `/usr/bin/node` byte, process report,
installed package tree, environment, credential, home/cache path, network or
socket, child, producer entry, npm, compiler, constructor, Docker/runtime
socket, transfer, runtime/result operation, Remote Git, publication,
deployment, evidence promotion, or standing authorization was used.

## Decision and next boundary

M2A-IBR01 and M2A-IBR03 close at contract scope. M2A-IBR02 remains open only
on unknown attempt-root creation with no durable root. M2A-IB01/M2A-IB02
remain closed; M2A-IB03 through M2A-IB06 remain open. No producer
implementation may begin.

Next: save the exact bounded Docker-free M2A-IBR02 unknown-attempt-root-
creation durability remediation prompt and fresh independent re-review prompt;
do not repair the contract in that prompt-only task or access input,
construction, Docker, transfer, or runtime/result state.
