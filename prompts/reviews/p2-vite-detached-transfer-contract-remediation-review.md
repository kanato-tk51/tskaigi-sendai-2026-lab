# Goal

Freshly and independently re-review the remediated selected Vite
`20260720-02` detached lifecycle and durable-transfer contract. Decide whether
P2-DT01 through P2-DT05 are closed and approve or block only one later
Docker-free implementation task. Do not fix findings and do not call Docker.

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
- `docs/reviews/p2-vite-detached-transfer-contract.md`
- `docs/reviews/p2-vite-new-measurement-result.md`
- `docs/milestones.md` selected Vite addenda
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `prompts/p2-vite-detached-transfer-contract.md`
- `prompts/p2-vite-detached-transfer-contract-remediation.md`
- this prompt

# Review questions

1. P2-DT01: does exact mode `01777` make the fixed non-root
   `O_RDONLY | O_DIRECTORY | O_NOFOLLOW` open and directory sync feasible
   without numeric ownership, while retaining same-directory atomic rename,
   stable host read, and explicit crash behavior?
2. P2-DT02: can any natural exit-0 close with post-close group residue reach
   `child-settled: success`, output export, a completed terminal, evidence
   access, or a receipt? It must not, even after bounded force settlement.
3. P2-DT03: is the record/terminal/runner-exit table exhaustive and
   contradiction-free for pre-service, spawn/invalid PGID, natural
   success/nonzero/residue, deadline/output/process-error, server settlement,
   output validation, and publication failure? Are the accepted close mappings
   and terminal-to-container-exit rules exact?
4. P2-DT04: is every detached-start, wait, final-inspect, and remove success,
   known failure, and unknown-settlement branch closed? Confirm exact command
   order, one-inspect maximum, writer-stop/progress-read predicate,
   no-filesystem barrier, first-failure retention, and canonical-attempt
   consequence.
5. P2-DT05: does the contract clearly treat the same-UID writable mount as a
   cooperative immutable-fixture assumption rather than adversarial writer
   isolation? Are the negative static assertions and receipt/pair limitation
   marker sufficient to prevent a stronger claim?
6. Confirm the corrected four identity fields, exact create-mount position,
   unchanged time/output bounds, v4 attempt/receipt/pair gates,
   permissive-first stop rule, and exact `20260720-02` identity separation.

# Scope

- Review only tracked documentation, prompts, and the smallest relevant
  tracked plan/runner/executor/test source needed to test contract claims.
- Use a task-owned repository-local temporary directory only if needed for one
  Docker-free filesystem-semantics assertion; restore/remove only that fixture.
- Decide `APPROVED` only if P2-DT01 through P2-DT05 are closed with no new
  blocker. Approval may authorize one later Docker-free implementation task,
  never staging or execution.

# Out of scope

- Fixing findings or implementing the executor, runner, adapter, schema, test,
  staging, or package script
- Rebuilding or reading staging, reading result roots/evidence, invoking Docker,
  opening an execution gate, or executing either profile
- Changing Expected capability values, accepted codegen/P3/P4 evidence,
  experiment-matrix Observed, presentation claims, or frozen M4 state

# Constraints

- Do not invoke Docker, access a runtime socket, run a probe/lifecycle fixture,
  build, broad verification, staging operation, production executor, or result
  review.
- Do not create either `20260720-02` result root or inspect ignored/historical
  staging or result state.
- Do not use external network, credentials, Remote Git, publication,
  deployment, or third-party communication.
- Keep configuration intent, static/unit evidence, historical Observed bytes,
  and unresolved runtime facts separate.
- Review read-only. Record findings; do not repair them in this session.

# Deliverables

- Replace or append a clearly dated remediation re-review decision in
  `docs/reviews/p2-vite-detached-transfer-contract.md`, preserving the original
  P2-DT01 through P2-DT05 findings as review history.
- Minimal authoritative handoff updates only.
- If approved, name one bounded Docker-free implementation task next. If
  blocked, name one bounded contract-remediation task next.

# Verification

Use only the smallest Docker-free tracked-source and filesystem-semantics
assertions needed for the decision. `git diff --check` and a focused Prettier
check over touched documentation may be used. Do not build, run unit suites,
rebuild staging, invoke Docker, or inspect result state merely to repeat prior
reports.

# Completion report

- Decision and P2-DT01 through P2-DT05 closure status
- Independently reproduced contract predicates and any findings
- Evidence classification and remaining trust/runtime limitations
- Changed files and commands run
- Commands intentionally not run
- Exact approved or blocked boundary
- One concrete `Next:` task
