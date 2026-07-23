# Goal

Freshly and independently review the frozen-research issue #45 exact
filesystem-object identity contract. Decide whether it approves exactly one
later Docker-free static/unit implementation task. Do not fix findings, run
tests, call Docker, or access retained runtime state.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `docs/index.md`
- `docs/frozen-research-execution-plan.md`
- `docs/milestones.md` M4 and frozen-research sections
- `docs/codex-workflow.md`
- `docs/presentation-scope.md` deferred high-assurance section
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/m4-exact-filesystem-identity.md`
- `docs/reviews/m4-execution-profiles-offline-build-backend.md`
- `docs/reviews/m4-execution-profiles-offline-build-execution-gate.md`
- `docs/reviews/m4-execution-profiles-offline-build-recovery.md`
- `docs/reviews/m4-execution-profiles-run-controls-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Scope

- Independently trace the current numeric/path identity behavior through the
  repository source loader, staging backend, profile loader, temporary
  activation history, control backend, transfer, host result, cleanup, and
  focused tests/static verifier.
- Review the proposed private BigInt identity record, exact type/full-mode/link/
  size/time/hash handling, public redaction, and rejection of device/inode-
  derived public tokens.
- Review fixed path/ancestor binding, descriptor/path comparison, unique logical
  identity, symlink/hardlink rejection, absent-destination binding, inventories,
  and byte lineage.
- Review the preflight/use/post-use protocol, process-close settlement,
  rename/replacement/in-place mutation handling, cleanup identity, and
  unsupported-platform behavior.
- Review the separate repository-source, staging, profile, activation-entry,
  and result-destination rules and their exact allowed mode transitions.
- Confirm that host direct mutations, container direct mutations, official tool
  materialization, and route-specific official API changes remain separate
  evidence classes.
- Decide `APPROVED` or `BLOCKED` only for one later Docker-free static/unit
  implementation boundary. Record every blocking and non-blocking finding.

# Out of scope

- Editing the contract or implementation, tests, static verifier, M4 runtime
  code, Expected values, profile files, or historical records
- Choosing a new Expected revision, run ID, result root, container identity,
  activation command, or execution gate
- Docker/container/runtime-socket access, retained-state inspection or mutation,
  staging rebuild, profile execution, probe/lifecycle execution, retry, cleanup,
  result repair, or `Observed` promotion
- Issue #46 or later frozen-research backlog work
- External network, credentials, host home, remote Git, publication, or
  deployment

# Constraints

- Treat configuration intent, historical runtime observations, current
  static/unit behavior, and the proposed future guarantee as distinct evidence
  classes.
- Check whether BigInt stat fields, full special-bit comparison, descriptors,
  size/hash reads, ancestor inventories, and held-handle lifetime are internally
  coherent on the fixed Linux/Node boundary.
- Evaluate whether the cooperative-host limitation is explicit enough for every
  path-only official tool use. Block any claim of atomic race resistance that
  the proposed boundary cannot support.
- Confirm that ordinary fail-closed activation is not overwritten by the future
  contract and that a separate activation object does not become ordinarily
  reachable through a package script or root export.
- Confirm that result files cannot be read before producer/transfer process
  settlement or overwrite an existing destination.
- Confirm that unsupported identity semantics and every pre/use/post drift are
  Inconclusive and cannot be repaired, retried, or promoted.
- Review read-only. If blocked, define one bounded contract-remediation next
  task; do not repair it in this session.

# Deliverables

- `docs/reviews/m4-exact-filesystem-identity-contract.md` with decision,
  blocking/non-blocking findings, independently traced current-state evidence,
  contract analysis, exact approved/blocked boundary, and limitations
- Minimal `docs/index.md` and `docs/frozen-research-execution-plan.md` handoff
  updates only
- If approved, one bounded Docker-free static/unit implementation next task; if
  blocked, one bounded contract-remediation next task
- No implementation prompt unless a blocking finding requires a separately
  scoped remediation prompt

# Verification

Use read-only source assertions only. `git diff --check` may be run for the
review record. Do not run tests, typecheck, build, staging, a lifecycle fixture,
Docker, or a broad verification command merely to repeat historical reports.

# Completion report

- Decision and findings
- Current evidence class versus proposed guarantee
- Exact approved or blocked boundary
- Changed files and commands run
- Commands intentionally not run and remaining limitations
- One concrete `Next:` task
