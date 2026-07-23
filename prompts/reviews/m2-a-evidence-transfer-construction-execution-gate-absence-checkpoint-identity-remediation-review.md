# Goal

Perform a fresh independent Docker-free read-only re-review of only frozen-
research issue #43's M2A-CGR03 absence-checkpoint identity contract
remediation. Decide whether the remediated contract gives all three fixed
absence Docker children distinct canonical attempt identities and proves the
one-to-one checkpoint/argv correlation without reopening any already reviewed
boundary. Do not repair the contract, implement source, acquire a dependency,
construct a context or image, call Docker, or access runtime/result state.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, and `experiments/AGENTS.md`
- `docs/index.md` and the issue #43 documents routed there
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md` deferred high-assurance section
- `docs/milestones.md` M0, M2-A, and frozen-research sections
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `docs/experiment-protocol.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/spike-npm12.md`
- `docs/m2-a-npm-lifecycle-adapter.md`
- `docs/reviews/m2-a-npm-lifecycle-adapter.md`
- `docs/m2-a-evidence-transfer-contract.md`
- every issue #43 implementation/remediation review routed by `docs/index.md`
- `docs/m2-a-evidence-transfer-construction-execution-gate.md`
- `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-review.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate.md`
- `prompts/m2-a-evidence-transfer-construction-execution-gate-remediation.md`
- `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-remediation-review.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-remediation.md`
- `prompts/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation.md`
- this prompt

# Scope

Review only the M2A-CGR03 absence-checkpoint identity contract diff, this saved
prompt pair, the minimal five status records, the two immutable blocking review
records, and repository-controlled tracked source needed to reproduce the
fixed command/attempt boundary. Preserve unrelated M3, M4, presentation,
result, and user working-tree changes.

## Exact identity and argv decision

1. Confirm the later execution boundary has exactly these three ordered
   canonical identities and no generic or caller-selected alternative:

   ```text
   absence-volume
   absence-initializer-container
   absence-measurement-container
   ```

2. Confirm their one-to-one mapping to the unchanged fixed argv:

   ```text
   absence-volume ->
   ["volume","inspect","tskaigi-m2a-evidence-20260721-01"]

   absence-initializer-container ->
   ["container","inspect","tskaigi-m2a-transfer-init-20260721-01"]

   absence-measurement-container ->
   ["container","inspect","tskaigi-m2a-transfer-run-20260721-01"]
   ```

   Reject a swapped, duplicate, missing, reordered, generic, unknown, or
   correct-name/wrong-argv mapping. Confirm the persisted identity is derived
   from the fixed plan entry and cannot disagree through a separate input.

3. Confirm schema `m2a-transfer-attempt/v1` and the issue vocabulary remain
   unchanged: each of these steps admits only `M2A_SETTLEMENT_UNKNOWN` or
   `M2A_ABSENCE_PREFLIGHT_FAILED` at the appropriate settlement boundary. The
   old generic `absence-preflight` step must not remain valid for a later issue
   #43 production candidate.

## Exact checkpoint and state decision

1. Model each prelaunch transaction and prove the fully synced canonical
   checkpoint names the exact next child before that child's argv can launch.
   After known success, require owned output/descriptor settlement before the
   next checkpoint. After known failure, require the same identity in the
   final first issue. After unknown close, require the same already committed
   checkpoint to remain the sole durable record with no post-unknown action.
2. Confirm chronological first issue, exact three-command order, state
   prerequisites, not-created object projections, `not-attempted` transfers,
   and performed-step claims remain coherent for all six known-failure/unknown
   preflight outcomes.
3. Confirm the remediation rejects old-generic, wrong-code, wrong-order,
   wrong-argv, duplicate identity, multiple-issue, and impossible later-state
   contradictions at the future implementation boundary.
4. Confirm every M2A-CGR01/M2A-CGR02 value and every other reviewed M2A-CGR03
   property is unchanged. Do not approve implementation, acquisition,
   construction, image build, Docker execution, transfer, result acceptance,
   or evidence promotion.

# Out of scope

- Contract repair, implementation/declaration/test/verifier/package-script
  edits, npm or toolchain acquisition, production construction, image
  build/inspect, Docker/container/runtime-socket action, lifecycle/probe/
  transfer execution, result or retained-state access, cleanup, or evidence
  promotion
- Inspecting fixed ignored acquisition/construction/build/result roots, host
  home/environment/cache, credentials, Docker state, or historical result
  contents
- Changing the fixed tuple, 31-row/41-row identity, Docker argv, issue codes,
  schema version, existing transfer implementation, historical evidence,
  Expected, or `Observed`

# Constraints

- Use read-only repository-controlled source inspection and in-memory modeling
  only.
- A blocked decision must name only the smallest remaining contract gap. Do
  not repair it in this review or defer an exact contract ambiguity to runtime.
- Distinguish contract/configuration claims, static/unit evidence, and runtime
  observations.
- Do not use standing authorization, credentials, external network, Remote
  Git, publication, deployment, or third-party communication.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation.md`
  with an `APPROVED` or `BLOCKED` decision, M2A-CGR03 and M2A-CG04 through
  M2A-CG06 status, exact identity/argv/checkpoint evidence, commands run,
  limitations, and one permitted next boundary
- Minimal status updates in `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`
- One concrete `Next:` item

# Verification

- Use a repository-controlled in-memory model to prove the three identities
  are unique, ordered, and mapped one-to-one to the three unchanged argv, and
  to exercise all six known-failure/unknown preflight outcomes plus inverse
  identity/code/state contradictions.
- Run focused Prettier checking over the contract, this prompt pair, the new
  review record, and the five status records.
- Run `git diff --check`.
- No test is required for this documentation-only re-review. If a static/unit
  command is run, report it exactly and do not treat it as construction,
  image, runtime, transfer, or evidence proof.

# Completion report

- Decision and M2A-CGR03 / M2A-CG04 through M2A-CG06 status
- Reproduced identity, argv, issue, checkpoint, and state correlation
- Changed files and commands actually run
- Intentionally unrun commands and remaining limitations
- Exact next boundary
