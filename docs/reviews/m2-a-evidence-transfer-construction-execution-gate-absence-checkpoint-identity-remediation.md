# M0/M2-A absence-checkpoint identity remediation re-review

## Review target and decision

- Target: frozen-research issue #43's bounded M2A-CGR03 absence-checkpoint
  identity contract remediation
- Review type: fresh independent Docker-free read-only contract re-review
- Review prompt:
  [m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation-review.md)
- Decision: **APPROVED at contract scope for one later bounded Docker-free
  static/unit implementation under M2A-CG06**
- Finding status: M2A-CGR03 closes; M2A-CGR01 and M2A-CGR02 remain closed
- Contract repair or implementation performed in this review: none

M2A-CG01 through M2A-CG06 are now closed only at contract scope. This review
does not approve npm or constructor-toolchain acquisition, production context
construction, an image build or inspect, Docker execution, transfer, result
access or acceptance, standing-authorization use, evidence promotion, M3
ingestion, profile/matrix/presentation evidence, or an `Observed` value.

## Exact identity and argv decision

The current pure fixed plan reproduced three distinct absence argv in this
order, and the remediated contract binds each to one canonical future
production identity:

| Canonical attempt step | Fixed argv |
| --- | --- |
| `absence-volume` | `["volume","inspect","tskaigi-m2a-evidence-20260721-01"]` |
| `absence-initializer-container` | `["container","inspect","tskaigi-m2a-transfer-init-20260721-01"]` |
| `absence-measurement-container` | `["container","inspect","tskaigi-m2a-transfer-run-20260721-01"]` |

The contract fixes those rows as unique and ordered, derives the persisted step
from the same immutable fixed-plan row that owns the argv, and admits no
separate caller projection. The independent model rejected seven inverse
mapping families: swapped argv, duplicate identity, missing row, reordered
rows, the old generic identity, an unknown identity, and a correct identity
with wrong argv. The old `absence-preflight` spelling remains in the current
pre-construction static implementation only; the contract explicitly rejects
it for a later issue #43 production candidate rather than treating that old
implementation as already remediated.

The attempt schema remains `m2a-transfer-attempt/v1`. Each of the three new
steps accepts only `M2A_SETTLEMENT_UNKNOWN` at its pessimistic prelaunch or
unknown-close boundary and `M2A_ABSENCE_PREFLIGHT_FAILED` after a known failed
absence check. No attempt field or issue code was added, split, or renamed.

## Checkpoint and state decision

The in-memory transaction model reproduced all six child-specific preflight
outcomes: known failure and unknown settlement for each of the volume,
initializer-container, and measurement-container absence children. For every
outcome it required:

1. the exact prior absence rows to have settled successfully in fixed order;
2. exclusive `.next` creation, complete write and sync, same-descriptor reread,
   known close, rename, and result-directory sync before the bound child argv
   can launch;
3. one chronological first issue carrying that same row's identity;
4. volume and both containers to remain not created, both container
   settlements to remain `not-started`, `naturalExit` to remain `false`, and
   all three transfers to remain `not-attempted`; and
5. no later absence, mutation, lifecycle, copy, validation, cleanup, or
   publication after unknown settlement.

A known successful absence close cannot advance to the next distinct
checkpoint until its child close, output capture, and descriptors all settle.
A known failed absence check publishes only the same identity with
`M2A_ABSENCE_PREFLIGHT_FAILED` after settlement. An unknown close leaves the
already synced `M2A_SETTLEMENT_UNKNOWN` checkpoint immutable.

The model rejected 12 controlled identity/code/state contradictions: old-
generic identity, wrong issue code, wrong identity/argv binding, wrong prior
prefix, multiple issues, a created-object projection, an impossible container
settlement, an early valid transfer, a later mutating step, an unsettled
checkpoint, a wrong launched argv, and post-unknown publication. Three
additional negatives rejected advancing after unknown child close, output
settlement, or descriptor settlement. No input was repaired or reinterpreted.

## Preserved reviewed boundaries

The review independently reproduced:

- the ordered 31-row source aggregate
  `sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04`;
- the ordered 41-row construction baseline
  `sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526`;
- all ten fixed manifest/library tuple fields and the eight existing
  Containerfile `COPY` sources; and
- the lockfile-bound TypeScript `5.9.3`, `@types/node` `20.19.43`, and
  `undici-types` `6.21.0` versions and exact contract integrity strings.

M2A-CGR01's separate unperformed acquisition/toolchain receipt and construction
schema remain unchanged. M2A-CGR02's credential-empty five-command offline
build packet and canonical image-binding schema remain unchanged. The existing
write-ahead transaction, result-root cwd and identity rules, exact command
order, completion-first conditional copy, write-once first issue, immutable
post-unknown record, no retry/repair/cleanup rule, and cooperative-host
limitation remain intact. The two earlier blocking review records were not
modified.

## M2A-CGR decision summary

| Item | Re-review decision |
| --- | --- |
| M2A-CGR01 — compiler authority and construction schema | **CLOSED at contract scope** |
| M2A-CGR02 — exact offline build and image-binding packet | **CLOSED at contract scope** |
| M2A-CGR03 — exact host transaction and unknown-settlement identity | **CLOSED at contract scope** |

## M2A-CG decision summary

| Item | Contract-scope decision |
| --- | --- |
| M2A-CG01 — immutable source and acquisition closure | **CLOSED at contract scope** |
| M2A-CG02 — complete deterministic construction manifest | **CLOSED at contract scope** |
| M2A-CG03 — offline one-build image identity and retention | **CLOSED at contract scope** |
| M2A-CG04 — exact production entry and one-shot lifecycle | **CLOSED at contract scope** |
| M2A-CG05 — failure, result, and evidence separation | **CLOSED at contract scope** |
| M2A-CG06 — later implementation and verification allowlist | **CLOSED at contract scope** |

## Evidence classes and remaining limitations

- This is contract-review evidence only. The in-memory model and source hashes
  do not establish constructor, filesystem, Docker, image, lifecycle,
  named-volume, transfer, or result behavior.
- The npm distribution and constructor toolchain remain unacquired and
  unreviewed. No construction manifest, local image ID, runtime attempt, or
  accepted issue #43 result exists.
- The current transfer implementation still has its pre-construction generic
  step vocabulary. Only a later Docker-free static/unit implementation under
  the exact M2A-CG06 allowlist may realize this approved contract.
- Historical M0 remains Inconclusive; M3 ingestion, profile/matrix/
  presentation evidence, and `Observed` remain unchanged.

## Verification observed

| Command | Observed result |
| --- | --- |
| `git status --short --branch` and scoped repository/source inspection | Existing multi-session dirty worktree inventoried and preserved; no cleanup or reset. No future production construction/execution source exists yet. |
| First repository-controlled in-memory audit attempt | Exit `1`; a reviewer-only exact prose assertion did not normalize a Markdown line wrap. No repository finding or file change resulted. |
| Second corrected audit attempt | Exit `1`; one reviewer-only wrong-argv negative accidentally reused the already-correct third argv, so 11 rather than 12 state contradictions rejected. No repository finding or file change resulted. |
| Final corrected repository-controlled in-memory identity/checkpoint audit | Exit `0`; reproduced both aggregates, ten tuple fields, eight copy sources, three exact ordered mappings, six positive preflight outcomes, seven inverse mapping rejections, 12 state contradiction rejections, and three known-success settlement-barrier rejections. |
| Repository-controlled preserved-contract assertion audit | Exit `0`; 19 M2A-CGR01/M2A-CGR02 construction, toolchain, build, image-binding, result-root, checkpoint, and no-post-unknown assertions matched, including both compiler rows and all five exact offline Docker command rows. |
| Focused Prettier check over the contract, saved prompt pair, this review, and five status records | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error reported in the accumulated tracked diff. |

No test is required for this documentation-only re-review. No compiler build,
npm pack/install/approve/rebuild, constructor, lifecycle entry, adapter, probe,
Docker/container/runtime-socket command, transfer, ignored acquisition/
construction/build/result-root access, retained-state access, external network,
Remote Git, publication, deployment, third-party communication, or standing
authorization was used.

## Decision and next boundary

The bounded absence-checkpoint remediation closes M2A-CGR03 and therefore
M2A-CG04 through M2A-CG06 at contract scope. The maximum later authority is one
Docker-free static/unit implementation under the unchanged exact M2A-CG06
allowlist after its implementation and fresh independent review prompts are
saved. Acquisition, construction, image build, Docker execution, and result
work remain separate later gates.

Next: save the exact bounded Docker-free construction/execution-gate
implementation prompt and fresh independent implementation-review prompt
before source changes; do not acquire npm or toolchain bytes, construct a
production context or image, call Docker, or access runtime/result state.
