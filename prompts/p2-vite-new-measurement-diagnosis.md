# Goal

Diagnose the three immutable selected Vite Inconclusive attempts from tracked,
sanitized records and source only, then define a review-ready, Docker-free
measurement/remediation contract for the reserved `20260720-01` generation.
Do not implement the remediation and do not execute Docker in this task.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/presentation-evidence-inventory.md`
- `docs/p2-selected-profile-contract.md`
- `docs/p2-vite-completion.md`
- `docs/reviews/p2-selected-profile-vite-runner.md`
- `docs/reviews/p2-selected-profile-vite-executor.md`
- `docs/reviews/p2-selected-profile-vite-failure.md`
- `docs/reviews/p2-selected-profile-vite-new-run-gate.md`
- `docs/reviews/p2-vite-diagnostic-remediation.md`
- `docs/reviews/p2-vite-diagnostic-result.md`
- `docs/reviews/p2-selected-profile-vite-observed.md`
- `docs/milestones.md` Presentation MVP / selected Vite sections
- `docs/codex-workflow.md`
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- this prompt

# Fixed new generation

- Expected revision: `p2-vite-expected-20260720-01`
- permissive run/root: `p2-vite-observe-p-20260720-01`
- constrained run/root: `p2-vite-observe-c-20260720-01`
- permissive container: `tskaigi-p2-vite-observe-p-20260720-01`
- constrained container: `tskaigi-p2-vite-observe-c-20260720-01`

These identities are reserved, not active runtime bindings. Existing
`20260719-01`, `20260719-02`, and `20260719-03` identities and results are
immutable and must remain rejected by any later active binding.

# Scope

- Build a side-by-side causal analysis of the three attempts using only
  tracked sanitized records and tracked source/static tests.
- Trace the `-03` `attached-start / P2_EXECUTOR_DOCKER_TIMEOUT` path through the
  fixed executor, process-lifecycle, runner, and cleanup state machines.
- Distinguish demonstrated cause, supported inference, and unknown runtime fact.
- Decide whether an unchanged fourth run would merely replay an unresolved
  failure. If so, specify the smallest fail-closed remediation needed before a
  new gate; if no safe remediation is justified, record a blocker instead of
  manufacturing one.
- Define exact acceptance properties and focused Docker-free regressions for
  the remediation, including primary-failure preservation, settlement,
  timeout ordering, output bounds, pair progression, cleanup, and no-retry.
- Define the later exact fixed tuple/container/Expected cross-binding and exact
  absence checks for only the two new result roots.
- Record the diagnosis and proposed contract in a new reviewable document,
  update authoritative handoff metadata, and leave one fresh independent
  review as the next task.

# Prohibited

- Any Docker/container command, direct runtime-socket access, execution, image
  pull, or `npm run p2:execute:vite`
- Reading, stating, enumerating, moving, chmoding, deleting, or repairing any
  retained result root, evidence subtree, historical container, Docker state,
  or ignored fixed staging tree
- Activating the reserved IDs in code, rebuilding staging, or creating either
  new result root
- Changing Expected event values, selected Vite/experiment-matrix Observed,
  accepted codegen/P3/P4 evidence, M4 state, or presentation claims
- External network, credentials, Remote Git, publication, or deployment

# Deliverables

- `docs/p2-vite-new-measurement-diagnosis.md` with evidence-classified causal
  analysis, decision, exact bounded remediation contract, acceptance criteria,
  and explicitly unresolved runtime facts
- `prompts/reviews/p2-vite-new-measurement-diagnosis-review.md` updates only if
  the implemented diagnosis shows the review boundary below is incomplete
- Minimal status updates in `docs/p2-vite-completion.md` and `docs/milestones.md`
- No production code or runtime-state change

# Verification

Run only the smallest Docker-free focused static/unit commands needed to
validate claims made by the diagnosis. `git diff --check` and
`git status --short` may be used for the handoff. Do not run the production
execution command or broad verification merely to restate prior results.

# Completion report

- Changed files
- Commands run and observed results
- Demonstrated causes, supported inferences, and unknown runtime facts
- Proposed remediation and exact acceptance properties
- Commands intentionally not run and preserved evidence classifications
- `Next:` fresh independent Docker-free diagnosis/contract review
