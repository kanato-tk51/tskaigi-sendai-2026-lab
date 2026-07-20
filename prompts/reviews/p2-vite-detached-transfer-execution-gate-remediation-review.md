# P2 Vite detached-transfer execution-gate remediation re-review

## Goal

Freshly and independently re-review only the Docker-free P2-DTG01/P2-DTG02
host remediation for the selected Vite `20260720-02` detached lifecycle and
durable-transfer candidate. Decide whether both findings are closed and whether
exactly one later argument-free pair execution may be approved. Do not fix a
finding and do not invoke Docker.

## Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/p2-selected-profile-contract.md`
- `docs/p2-vite-completion.md`
- `docs/p2-vite-detached-transfer-contract.md`
- `docs/reviews/p2-vite-detached-transfer-contract.md`
- `docs/reviews/p2-vite-detached-transfer-execution-gate.md`
- `docs/milestones.md` selected Vite addendum
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `prompts/p2-vite-detached-transfer-contract.md`
- both detached-transfer contract-remediation prompts and all contract-review
  prompts
- `prompts/reviews/p2-vite-detached-transfer-execution-gate-review.md`
- this prompt

## Review questions

1. P2-DTG01: confirm every accepted unknown-child terminal is bound to the
   exact durable path: invalid process group and close-first residue retain
   `P2_CHILD_FAILED`; deadline, output limit, and process error retain their
   mapped child code; an otherwise clean last prefix after child acquisition
   can retain only `P2_RUNNER_FAILED`. Reject a spawn-error child-settlement
   substitution and every terminal code that contradicts the recorded failure.
2. P2-DTG01: confirm every accepted unknown-server terminal is bound to the
   exact durable path: pre-service failure retains `P2_SERVER_CLOSE_FAILED`,
   spawn or known child failure retains the child code, known child success
   selects `P2_SERVER_CLOSE_FAILED`, and an otherwise clean last prefix after
   server acquisition can retain only `P2_RUNNER_FAILED`. Reject unknown-server
   settlement while child settlement is still unknown and reject all
   child/server settlement-code substitutions.
3. Confirm known-settlement terminals, the residual P2-DT03 force paths,
   terminal/container exit consistency, canonical ordering/bounds, and the
   no-success residue rule remain unchanged.
4. P2-DTG02: reproduce natural inspected exit `70` with a valid durable prefix
   and null parser-level transfer failure. Confirm primary
   `progress-transfer / P2_TRANSFER_WRITE_FAILED` and canonical ordered issue
   `P2_ATTEMPT_TRANSFER_FAILED`, with no evidence access or receipt.
5. Confirm parser-level transfer failures still project the same transfer issue
   and no force-removed/non-natural outcome manufactures runner exit `70`.
6. Confirm exact `20260720-02` identities, detached command graph, v4 schemas,
   permissive-first rule, staging bytes, fixed bounds, and
   `repository-cooperative-fixture` limitation are unchanged.

## Scope

- Read-only review of the tracked Vite host validator/attempt projection,
  focused tests, active status records, compiled candidate, and exact generated
  Vite staging closure
- Exact absence checks for only the two fixed `20260720-02` result roots
- Append a fresh dated decision to
  `docs/reviews/p2-vite-detached-transfer-execution-gate.md` and make only
  minimal authoritative handoff updates

## Out of scope

- Fixing a finding or changing implementation, tests, schemas, bindings,
  staging, Expected values, or historical evidence
- Reading or enumerating historical/retained result roots or evidence subtrees
- Docker, a runtime socket, lifecycle fixture, either active result root,
  execution, retry, receipt acceptance, presentation promotion, or `Observed`
- Accepted codegen/P3/P4 evidence and frozen M4 state

## Constraints

- Do not invoke Docker, `npm run p2:execute:vite`, a probe/lifecycle fixture,
  staging rebuild, or any command that opens or creates either active result
  root.
- Do not use external network, credentials, Remote Git, publication,
  deployment, or third-party communication.
- Keep static/unit evidence, compiled behavior, staging identity, and unresolved
  runtime facts separate.
- Review read-only. Record findings without repairing them.

## Verification

Run only Docker-free ordinary-development checks: focused validator/attempt
tests, `npm run p2:verify`, `npm run p2:build`, compiled import-safety and exact
P2-DTG reproductions, exact staging source/byte/mode/version/manifest
assertions, focused formatting, and `git diff --check`. Do not rebuild staging.

## Decision boundary

Approve only if P2-DTG01 and P2-DTG02 are closed with no blocking or
non-blocking finding and the exact unchanged staged candidate still reproduces
the contract. Approval may authorize at most one later argument-free
`npm run p2:execute:vite` invocation, no retry, with constrained setup reachable
only after a complete permissive receipt. Otherwise name one smallest
Docker-free remediation task.

## Completion report

- Decision and P2-DTG01/P2-DTG02 closure status
- Reproduced unknown-terminal path matrix and exit-70 issue projection
- Commands run and observed results
- Commands intentionally not run
- Evidence classification and remaining cooperative-fixture/runtime limits
- Exact approved or blocked boundary
- One concrete `Next:` task
