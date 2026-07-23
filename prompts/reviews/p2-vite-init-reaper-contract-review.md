# Goal

Freshly and independently review the proposed selected-Vite `20260723-01`
fixed init/reaping contract. Approve or block only one later Docker-free
implementation task. Do not fix findings, stage the candidate, or call Docker.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/p2-vite-completion.md`
- `docs/p2-vite-detached-transfer-contract.md`
- `docs/p2-vite-init-reaper-contract.md`
- `docs/reviews/p2-vite-detached-transfer-execution-gate.md`
- `docs/reviews/p2-vite-detached-transfer-result.md`
- `docs/milestones.md` selected-Vite addenda and current issue #54 handoff
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `prompts/p2-vite-init-reaper-contract.md`
- this prompt

# Scope

- Independently reproduce the fifth attempt's durable facts and confirm that the
  contract does not convert a possible zombie/reaping explanation into an
  observed cause.
- Review the exact Vite-only Docker `--init` argument position, absence of an
  arbitrary init path, unchanged image/command/mount/network boundary, and
  exclusion of codegen plans.
- Review the exact six-field inspect projection and the requirement that both
  created and final owned-container inspections bind `HostConfig.Init` to
  literal `true`.
- Confirm that configured init is not accepted as process settlement and that
  actual natural close, process-group absence, runner/container settlement,
  transfer validity, evidence access, receipt, and same-image predicates remain
  conjunctive.
- Confirm that post-close residue still cannot become child success even when
  bounded force and later reaping establish group absence.
- Confirm exact `20260723-01` identity separation, old-identity rejection,
  permissive-first pair progression, no retry, and unchanged Expected values.
- Decide `APPROVED` or `BLOCKED` only for one later Docker-free implementation
  and focused static/unit test task.

# Out of scope

- Repairing the contract or implementing plan, executor, runner, schema, test,
  staging, or scenario changes
- Docker/container commands, runtime sockets, probes, lifecycle fixtures,
  staging, execution, result-root access, image pulls, or retained-state access
- Execution-gate approval, one-shot authorization, receipt acceptance,
  Expected/Observed changes, or presentation promotion
- Frozen M4 work, Remote Git, external network, credentials, publication,
  deployment, or third-party communication

# Constraints

- Review read-only except for the review record and minimal handoff metadata.
- Do not enumerate or inspect historical or proposed result roots, containers,
  ignored staging, or parent runtime directories.
- Treat `--init` support and any future reaping effect as configuration intent,
  not static evidence or a historical runtime fact.
- Do not run a build or broad test suite merely to restate prior results.
- Record findings without fixing them in this session.

# Deliverables

- `docs/reviews/p2-vite-init-reaper-contract.md` with decision, blocking and
  non-blocking findings, independently traced evidence, exact approved or
  blocked boundary, and remaining limitations
- Minimal authoritative handoff updates only
- If approved, one bounded Docker-free implementation task; if blocked, one
  bounded contract-remediation task

# Verification

Use only the smallest fixed-path tracked-source assertions needed to reproduce
the contract's source claims. A focused local Prettier check and
`git diff --check` may be used for the review record. Do not run Docker, a
probe/lifecycle fixture, build, staging command, execution command, result
inspection, or broad verification.

# Completion report

- Decision and findings
- Evidence classification and unresolved runtime facts
- Exact approved or blocked boundary
- Changed files and commands run
- Commands intentionally not run and remaining limitations
- One concrete `Next:` task
