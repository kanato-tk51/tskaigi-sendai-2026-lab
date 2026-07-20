# P2 Vite detached-transfer residual P2-DT03 remediation review

## Goal

Freshly and independently re-review only the residual Docker-free P2-DT03
force-transition remediation for the selected Vite `20260720-02` detached
lifecycle and durable-transfer contract. Decide whether the two residual gaps
are closed and approve or block only one later Docker-free implementation
task. Do not fix findings and do not call Docker.

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
- `prompts/p2-vite-detached-transfer-contract-residual-remediation.md`
- this prompt

## Review questions

1. Does natural close followed by durable
   `child-residue-detected: post-close-group-present` have exactly one valid
   known-failure suffix for each accepted force disposition: `sent` and
   `group-already-absent`? Confirm both require final group absence, retain
   `P2_CHILD_FAILED`, and can never reach child success, output export, a
   completed terminal, evidence access, or a receipt.
2. After deadline/output/process failure, accepted `SIGTERM` close, and an
   initially present group, does each accepted force disposition have one exact
   suffix? Confirm `sent` and `group-already-absent` both retain the original
   failure code and require final group absence before known child settlement.
3. Confirm that every accepted TERM/force disposition on a known-settlement
   path must appear durably before later lifecycle records. Failed signal
   delivery, contradictory or missing close, and unproved final group absence
   must remain on the existing unknown-settlement terminal and must not be
   mislabeled as `sent`.
4. Recount every longest valid path. Confirm that the longest record-count
   families use 12 of 13 records, their largest canonical line is 1,102 bytes,
   and the byte-longest completed canonical line is 1,158 of 4,096 bytes, with
   no timeout or output-bound change.
5. Confirm the accepted P2-V03 boundary, terminal-to-container-exit mapping,
   v4 attempt/receipt/pair gates, permissive-first rule, and
   `repository-cooperative-fixture` limitation are unchanged.
6. Confirm P2-DT01, P2-DT02, P2-DT04, and P2-DT05 remain closed. Do not reopen
   them without a newly reproduced contract contradiction.

## Scope

- Independently compare the remediated writer table and validator predicates
  with the smallest relevant tracked Vite runner and lifecycle tests.
- Review only tracked documentation, prompts, and tracked source. This is
  configuration/static review, not runtime evidence.
- Decide `APPROVED` only if the residual P2-DT03 force transitions are
  exhaustive and contradiction-free. Approval may authorize one later
  Docker-free implementation task, never staging or execution.

## Out of scope

- Fixing a finding or implementing the executor, runner, adapter, schema,
  writer/reader, test, staging, or package script
- Rebuilding or reading staging, reading result roots/evidence, invoking Docker,
  opening an execution gate, or executing either profile
- Changing Expected capability values, accepted codegen/P3/P4 evidence,
  experiment-matrix Observed, presentation claims, or frozen M4 state

## Constraints

- Do not invoke Docker, access a runtime socket, run a probe/lifecycle fixture,
  build, unit suite, broad verification, staging operation, production
  executor, or result review.
- Do not create either `20260720-02` result root or inspect ignored/historical
  staging or result state.
- Do not use external network, credentials, Remote Git, publication,
  deployment, or third-party communication.
- Keep Docker CLI, container, runner, child, transfer, evidence, receipt, and
  same-image predicates distinct.
- Keep configuration intent, tracked-source evidence, historical Observed
  bytes, and unresolved runtime facts separate.
- Review read-only. Record findings; do not repair them in this session.

## Deliverables

- Append a clearly dated residual-remediation re-review decision to
  `docs/reviews/p2-vite-detached-transfer-contract.md`, preserving both earlier
  review decisions as history.
- Minimal authoritative status/handoff updates only.
- If approved, name one bounded Docker-free implementation task next. If
  blocked, name one bounded residual contract-remediation task next.

## Verification

Use only the smallest Docker-free tracked-source and table/serialization
assertions needed for the decision. `git diff --check` and a focused Prettier
check over touched documentation may be run. Do not build, run unit suites,
rebuild staging, invoke Docker, or inspect result state.

## Completion report

- Decision and residual P2-DT03 closure status
- Independently reproduced force branches, exact suffixes, and bound counts
- Evidence classification and remaining trust/runtime limitations
- Changed files and commands run
- Commands intentionally not run
- Exact approved or blocked boundary
- One concrete `Next:` task
