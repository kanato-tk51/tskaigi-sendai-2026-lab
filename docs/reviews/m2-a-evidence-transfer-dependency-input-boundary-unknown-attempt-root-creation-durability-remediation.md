# M0/M2-A M2A-IBR02 durability contract-remediation re-review

## Review target and decision

- Target: frozen-research issue #43's residual M2A-IBR02
  unknown-attempt-root-creation durability remediation
- Review type: fresh independent Docker-free read-only contract re-review
- Review prompt:
  [m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation-review.md)
- Decision: **APPROVED at contract scope**
- Closed in this review: M2A-IBR02 and therefore M2A-IB03 through M2A-IB06 at
  contract scope
- Preserved closed: M2A-IB01, M2A-IB02, M2A-IBR01, and M2A-IBR03 at their
  recorded contract scopes
- Blocking and non-blocking findings: none
- Contract repair, implementation, test change, or producer execution
  performed in this review: none

The remediation removes the only root-absent unknown-create-consumed
contradiction. Initial attempt-root creation is now one synchronous,
non-recursive, exclusive mode-`0700` `mkdirSync` operation after the held-parent
absence preflight. The atomic directory commit is the occurrence boundary; the
primitive exposes no returned unknown-create result. A committed root is the
durable non-evidence occurrence even when the canonical checkpoint is not yet
published.

This decision approves at most the already fixed M2A-IB06 Docker-free
static/unit implementation boundary. It does not approve either producer
entry, npm acquisition, host runtime/package reads, external communication,
construction, image build, Docker, transfer, result access, input acceptance,
or evidence promotion. Standing authorization was not needed or used.

## Preserved identities, schemas, and authority

Descriptor-controlled read-only inspection of the fixed repository-controlled
rows reproduced:

```text
31 rows: sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04
41 rows: sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526
```

Generation `20260721-01`, the acquisition/toolchain/construction/result roots,
all five null reviewed bindings, `runtimeExecutionApproved: false`, and
`evidenceReview: "not-performed"` remain fixed. The lockfile still supplies the
three exact package tuples for TypeScript `5.9.3`, `@types/node` `20.19.43`,
and `undici-types` `6.21.0`.

The three ordered receipt/control schemas remain:

```text
m2a-transfer-acquisition/v1:
schemaVersion, generation, packageName, version, tarballSize,
tarballSha256, integrity, status, scriptsRun, credentialsUsed,
externalNetworkPhase, evidenceReview

m2a-transfer-toolchain/v1:
schemaVersion, generation, runtime, packages, inventory,
inventoryAggregate, status, evidenceReview

m2a-transfer-toolchain-attempt/v1:
schemaVersion, generation, state, issue, toolchainReceiptSha256,
inventoryAggregate, evidenceReview
```

The credential-empty sequential two-request npm boundary, separate
external-acquisition authority, atomic archive/receipt transaction, and
candidate/evidence separation are unchanged. M2A-IB01 and M2A-IB02 remain
closed at contract scope without authorizing external communication.

The M2A-IBR01 source graph still requires complete first and second bytewise
traversals through the same held directory authority, and the destination
graph still requires the complete held-root physical comparison before receipt
serialization. The M2A-IBR03 implementation allowlist still reaches only
`m2a-transfer-construction.mjs` and its declaration for the actual consumer's
live-Node mode `0555`, copied-row mode `0444`, and positive package-size
relations. M2A-IBR01 and M2A-IBR03 remain closed at contract scope.

## Independently modeled initial commit boundary

The focused in-memory model reproduced all five exact initial boundaries:

| Boundary | Durable root | Occurrence | Fresh invocation |
| --- | --- | --- | --- |
| Known no-create synchronous error | absent | never started | may attempt the first commit |
| Process loss before atomic commit | absent | never started | may attempt the first commit |
| Normal return after atomic commit | present | started and consumed | stop without inspection |
| Process loss at or after atomic commit | present | started and consumed | stop without inspection |
| `EEXIST` or absence not established | present or uncertain | existing occurrence wins | stop without inspection |

The model rejected a fake returned `unknown` creation result, retry from a
present root, and a consumed classification for an absent pre-commit root.
There is no separate lock, sentinel, generation authority, cleanup, repair,
resume, or producer retry.

## Post-commit checkpoint and second-invocation trace

The review separately injected failure at held-root open, identity correlation,
held-parent sync, `attempt.next` write, file sync, reread, mode change, close,
rename, and held-root sync. Each case retains the already committed attempt
root, starts no host runtime, process-report, tracked-source, or installed-
package read, and makes a fresh invocation stop from the held parent without
opening either fixed root.

After the canonical in-progress checkpoint settles, the existing sanitized
failed/unknown replacements and the receipt-bound complete replacement remain
unchanged. Candidate visibility still does not perform review, establish a
construction input, accept runtime evidence, or promote `Observed`.

## Decision summary

| Item | Re-review decision |
| --- | --- |
| M2A-IB01 — npm acquisition authority | **CLOSED at contract scope; preserved; execution separately unauthorized** |
| M2A-IB02 — npm publication | **CLOSED at contract scope; preserved** |
| M2A-IB03 — toolchain source closure | **CLOSED at contract scope** |
| M2A-IB04 — toolchain publication | **CLOSED at contract scope** |
| M2A-IB05 — failure, review, and evidence classes | **CLOSED at contract scope** |
| M2A-IB06 — implementation boundary | **CLOSED at contract scope; at most one bounded Docker-free static/unit implementation may follow** |

| Finding | Re-review decision |
| --- | --- |
| M2A-IBR01 — source/destination completeness | **CLOSED; preserved** |
| M2A-IBR02 — durable pre-source occurrence | **CLOSED** |
| M2A-IBR03 — actual-consumer allowlist | **CLOSED; preserved** |

## Evidence classes, limitations, and verification

This is documentation, repository-controlled byte identity, and in-memory
state-machine evidence only. It establishes no registry response, npm archive,
runtime closure, installed package inventory, producer filesystem observation,
receipt digest, accepted input, construction input, image, lifecycle, transfer,
result, or `Observed` evidence.

The cooperative repository-owned Linux-host boundary remains. The contract
does not claim resistance to a hostile kernel or same-authority interference,
and process-loss classification does not establish machine-crash durability
beyond the exact synced transitions.

| Command | Observed result |
| --- | --- |
| `git status --short --branch` and scoped AGENTS/document/source inspection | Existing accumulated multi-session worktree changes were preserved; no cleanup or reset was performed. |
| Focused descriptor-controlled aggregate/schema/commit-state assertion | Exit `0`; reproduced 31/41 rows and both aggregates, three package tuples, three schemas, five initial boundaries, ten post-commit failures, and three inverse contradictions. |
| Focused Prettier check over the remediated contract, saved prompt pair, this review, and six status records | Exit `0`; all selected files matched Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error was reported in the accumulated tracked diff. |

Tests, typecheck, builds, broad checks, either producer, lifecycle fixtures,
construction, Docker, transfer, fixed-root inspection, and result validation
were intentionally not run because they are outside this contract-only
read-only re-review.

No fixed ignored root, future input byte, `/usr/bin/node` byte, process report,
installed package tree, environment, credential, home/cache path, network or
socket, child, producer entry, npm, compiler, constructor, Docker/runtime
socket, transfer, runtime/result operation, Remote Git, publication,
deployment, evidence promotion, or standing authorization was used.

## Approved boundary and next task

The contract permits one later Docker-free static/unit implementation under
the exact existing M2A-IB06 allowlist. Repository convention requires its exact
implementation and fresh independent review prompts to be saved before source
changes. Neither prompt creation nor implementation authorizes either producer
execution or future input access.

Next: save the exact bounded Docker-free dependency-input implementation prompt
and fresh independent review prompt under the existing M2A-IB06 allowlist; do
not change implementation or access input, external communication,
construction, Docker, transfer, or runtime/result state in that prompt-only
task.
