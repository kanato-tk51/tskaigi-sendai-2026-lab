# Goal

Freshly and independently review the proposed selected Vite `20260720-02`
detached lifecycle and durable transfer contract. Approve or block only a
later Docker-free implementation task. Do not fix findings and do not call
Docker.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/p2-selected-profile-contract.md`
- `docs/p2-vite-completion.md`
- `docs/p2-vite-new-measurement-diagnosis.md`
- `docs/p2-vite-detached-transfer-contract.md`
- `docs/reviews/p2-vite-new-measurement-diagnosis.md`
- `docs/reviews/p2-vite-new-measurement-execution-gate.md`
- `docs/reviews/p2-vite-new-measurement-result.md`
- `docs/milestones.md` selected Vite addenda
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `prompts/p2-vite-detached-transfer-contract.md`
- this prompt

# Scope

- Independently trace the `20260720-01` `child-launched` boundary through the
  tracked executor, runner, tests, and sanitized result review.
- Confirm that the diagnosis separates Docker CLI, container, runner, and child
  settlement and does not claim an unobserved lower-level cause.
- Review the exact detached start/wait/inspect/remove order, unchanged absolute
  deadline, output bounds, first-failure handling, cleanup suppression, and
  permissive-first rule.
- Review the fixed progress paths, schema, allowed transition graph, terminal
  shapes, record/byte limits, modes, no-symlink and stable-read rules, atomic
  publication semantics, sanitized values, and failure classes.
- Confirm that the conjunctive settlement and evidence-access predicates cannot
  convert a prefix, force-removal, missing terminal, or invalid transfer into a
  receipt or `Observed` result.
- Confirm exact `20260720-02` identity separation and rejection of every earlier
  generation without reading ignored or retained runtime state.
- Decide `APPROVED` or `BLOCKED` only for one later Docker-free implementation.

# Out of scope

- Fixing a finding or implementing the executor, runner, schema, staging, or
  tests
- Reviewing or changing Expected capability values, accepted codegen/P3/P4
  evidence, presentation claims, experiment-matrix Observed, or frozen M4 state
- Opening an execution gate, staging inputs, executing either profile, reading
  result evidence, or choosing a retry/recovery strategy

# Constraints

- Do not invoke Docker, access a runtime socket, execute a probe/lifecycle
  fixture, rebuild staging, or access ignored/historical result or staging
  paths.
- Do not create either `20260720-02` result root or container.
- Do not use external network, credentials, Remote Git, publication, deployment,
  or third-party communication.
- Treat configuration intent, static/unit evidence, historical observed bytes,
  and unresolved runtime facts as distinct evidence classes.
- Review read-only. Record findings; do not repair them in this session.

# Deliverables

- `docs/reviews/p2-vite-detached-transfer-contract.md` with decision, blocking
  and non-blocking findings, independently traced evidence, settlement analysis,
  exact approved/blocked boundary, and remaining limitations
- Minimal authoritative handoff updates only
- If approved, one bounded Docker-free implementation next task; if blocked,
  one bounded contract-remediation next task

# Verification

Use only the smallest Docker-free source assertions needed to reproduce claims
made by the contract. `git diff --check` may be used for the review record. Do
not run a build, lifecycle fixture, Docker command, staging operation, or broad
verification merely to repeat prior reports.

# Completion report

- Decision and findings
- Evidence classification and unresolved runtime facts
- Exact approved or blocked boundary
- Changed files and commands run
- Commands intentionally not run and remaining limitations
- One concrete `Next:` task
