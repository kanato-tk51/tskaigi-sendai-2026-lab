# P2 Vite detached-transfer residual P2-DT03 remediation

## Goal

Remediate only the two residual Docker-free P2-DT03 force-transition gaps in
the selected Vite `20260720-02` detached lifecycle and durable-transfer
contract. Produce one exhaustive record/terminal/runner-exit table ready for a
later fresh independent re-review. Do not implement or execute the contract.

## Read first

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
- `prompts/reviews/p2-vite-detached-transfer-contract-remediation-review.md`
- this prompt

## Required residual remediation

1. Close the natural-close residue race where
   `child-residue-detected: post-close-group-present` is durable but the group
   disappears before force delivery. Bind the exact
   `child-force-sent: group-already-absent` suffix, final group-absence proof,
   known `P2_CHILD_FAILED` terminal, and no-success/no-output consequence.
2. Close the failure-first path where TERM is sent, an accepted `SIGTERM` close
   is observed, the group remains, and bounded force settlement is required.
   Bind exact suffixes for both `child-force-sent: sent` and
   `group-already-absent`, the final group-absence predicate, retention of the
   original deadline/output/process failure code, and known child settlement.
3. Keep failed force delivery, contradictory close, missing close, and failure
   to prove final group absence on the existing unknown-settlement path. Do not
   weaken any branch into known settlement or success.
4. Make the table and validator consequences unambiguous about whether every
   attempted TERM/force operation is durably represented. Recount the
   13-record/4,096-byte bound against every longest valid path and change no
   existing timeout or output limit.
5. Preserve the accepted P2-V03 rule: once post-close residue is detected, no
   later disappearance can reach `child-settled: success`, output export, a
   completed terminal, evidence access, or a receipt.

## Scope

- `docs/p2-vite-detached-transfer-contract.md`
- minimal status/handoff updates in `docs/index.md`, `docs/milestones.md`, and
  `docs/p2-vite-completion.md`
- a separate fresh residual re-review prompt under `prompts/reviews/`
- this prompt only if a pre-work ambiguity must be clarified without rewriting
  its observed history

## Out of scope

- Executor, runner, adapter, probe, schema, test, package-script, or staging
  implementation
- Reopening P2-DT01, P2-DT02, P2-DT04, or P2-DT05 without a newly demonstrated
  contract contradiction
- Staging rebuild/input access, Docker, runtime sockets, result roots, evidence
  subtrees, or historical runtime state
- An execution gate, pair execution, result review, receipt acceptance,
  presentation promotion, Expected change, or experiment-matrix Observed change
- Accepted codegen/P3/P4 evidence or frozen M4 state

## Constraints

- Do not invoke Docker, a lifecycle fixture, build, unit suite, broad
  verification, staging, or a production executor.
- Do not access ignored staging/results or create either `20260720-02` root.
- Do not use external network, credentials, Remote Git, publication,
  deployment, or third-party communication.
- Keep Docker CLI, container, runner, child, transfer, evidence, receipt, and
  same-image predicates distinct.
- Keep the 60,000 ms absolute container deadline and every existing child,
  server, CLI-settlement, Docker-output, progress, event, and output bound
  unchanged.

## Deliverables

- Remediated `docs/p2-vite-detached-transfer-contract.md` closing only the
  residual P2-DT03 force transitions at configuration-contract scope
- `prompts/reviews/p2-vite-detached-transfer-contract-residual-remediation-review.md`
  for a fresh independent Docker-free re-review
- Minimal authoritative status/handoff updates naming only that re-review as
  next

## Verification

Use only the smallest Docker-free tracked-source and table assertions needed
to prove that every TERM/force branch has one exact record suffix and terminal
mapping. `git diff --check` and a focused Prettier check may be run. Do not
build, run unit suites, rebuild staging, invoke Docker, or inspect result state.

## Completion report

- Exact force branches and record suffixes added
- Longest-path record/byte-bound result
- Evidence classification and remaining trust/runtime limitations
- Changed files and commands run
- Commands intentionally not run
- Exact residual re-review boundary
- One concrete `Next:` task
