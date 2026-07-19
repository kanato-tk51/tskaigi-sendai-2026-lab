# Goal

Freshly and independently review the Docker-free selected Vite diagnosis and
the proposed `20260720-01` measurement/remediation contract. Approve or block
only the later non-executing implementation task. Do not fix findings and do
not call Docker.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/p2-vite-completion.md`
- `docs/p2-vite-new-measurement-diagnosis.md`
- all tracked review records cited by that diagnosis
- `docs/milestones.md` selected Vite addendum
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- `prompts/p2-vite-new-measurement-diagnosis.md`
- this prompt

# Review scope

- Independently trace every claimed lifecycle transition to tracked source,
  test, or sanitized historical record.
- Reject any conversion of missing runtime facts into demonstrated causes.
- Confirm the proposed remediation addresses the supported failure mechanism,
  preserves first failure and settlement safety, remains bounded and offline,
  and cannot turn missing evidence into success.
- Confirm the fixed `20260720-01` identities are new, exact, caller-independent,
  and not yet active, and that old identities remain immutable/rejected.
- Confirm the contract preserves Expected values, codegen/P3/P4 evidence,
  experiment-matrix Observed, M4 state, and the three-attempt presentation gap.
- Decide `APPROVED` or `BLOCKED` for a later Docker-non-executing implementation
  only. This review cannot approve execution.

# Prohibited

- Candidate fixes or production implementation
- Docker/container commands, runtime sockets, execution, image pulls, staging
  rebuild, or any retained/ignored runtime-state access
- Creating new roots, changing Expected/Observed, Remote Git, external network,
  credentials, publication, or deployment

# Deliverables

- `docs/reviews/p2-vite-new-measurement-diagnosis.md` with decision, findings,
  independently traced evidence, and the exact reviewed contract boundary
- Minimal authoritative handoff updates only
- If approved, one bounded Docker-free implementation/remediation next task;
  if blocked, one bounded contract-remediation next task

# Verification

Use only the smallest Docker-free source/static/unit checks needed to reproduce
the diagnosis claims. Record exact commands and observed results. Do not use
prior test reports as if they were newly observed.

# Completion report

- Decision and findings
- Evidence classification and unresolved runtime facts
- Exact approved or blocked boundary
- Changed files and commands run
- Commands intentionally not run
- One concrete `Next:` task
