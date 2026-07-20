# P2 Vite detached-transfer implementation execution-gate review

## Goal

Freshly and independently review the Docker-free implementation candidate for
the selected Vite `20260720-02` detached lifecycle and durable transfer
contract. Decide whether exactly one later argument-free pair execution may be
approved. Do not fix findings and do not invoke Docker.

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
- `docs/milestones.md` selected Vite addenda
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `prompts/p2-vite-detached-transfer-contract.md`
- both contract-remediation prompts and all three contract-review prompts
- this prompt

## Review questions

1. Confirm the exact `20260720-02` expected/run/container bindings, the Vite-
   only progress mount immediately after the fixed `/tmp` tmpfs, detached
   `start`, bounded `wait`, one final inspect, fixed removal, first-failure
   retention, unknown-CLI no-later-action barrier, and permissive-first stop.
2. Confirm the runner installs child close/error/output/deadline observers
   before awaiting `child-launched` and `child-watch-armed`, durably records
   every accepted TERM/force disposition, preserves both residual P2-DT03
   force branches, and never turns post-close residue into success.
3. Confirm the v2 writer uses only the fixed paths, mode `01777`, a retained
   no-follow directory descriptor, exclusive temporary creation, file and
   directory sync, atomic replacement, fixed modes, 13-record/4,096-byte
   bounds, and exit `70` after transfer-write failure without later progress.
4. Confirm the host seals and enumerates only the fixed progress directory,
   uses a no-follow stable bounded read, validates canonical UTF-8 JSON,
   identity, records, terminal, and natural exit consistency, and never retains
   raw or unvalidated progress.
5. Confirm v4 attempt/receipt/pair gating, canonical issue ordering, attempt-
   before-evidence access, natural-exit/cleanup/runner success predicates,
   same-image binding, and the exact
   `progressTrust: "repository-cooperative-fixture"` limitation.
6. Confirm the staged cooperative fixture exposes no progress path/key through
   fixed child argv/cwd/environment, contains the writer tokens in only
   `presentation-runner.js`, rejects old tuples/schemas and invalid transitions,
   and does not claim same-UID or adversarial writer isolation.
7. Reproduce the exact 128-file source-equal fixed-mode staging manifest and
   its plan-order digest. Confirm focused/full P2 and M2-D verification directly
   cover the fixed branches and no Docker/runtime evidence is claimed.

## Scope

- Tracked Vite plan, runner, executor, evidence reader, projection, adapter
  binding, declarations, focused tests, package scripts, and active status
  records
- The exact generated Vite staging closure only
- Exact absence checks for only
  `results/runs/p2-selected-profiles/p2-vite-observe-p-20260720-02` and
  `results/runs/p2-selected-profiles/p2-vite-observe-c-20260720-02`
- A new read-only decision record at
  `docs/reviews/p2-vite-detached-transfer-execution-gate.md` and minimal
  handoff updates

## Out of scope

- Fixing a finding or changing implementation, tests, schemas, bindings,
  staging inputs, Expected values, or historical evidence
- Reading or enumerating any historical/retained result root or evidence
  subtree
- Docker, a runtime socket, a lifecycle fixture, either active result root,
  execution, retry, receipt acceptance, presentation promotion, or `Observed`
- Accepted codegen/P3/P4 evidence and frozen M4 state

## Constraints

- Do not invoke Docker, `npm run p2:execute:vite`, a probe/lifecycle fixture,
  or any command that opens or creates either active result root.
- Do not use external network, credentials, Remote Git, publication,
  deployment, or third-party communication.
- Keep Docker CLI, container, runner, child, transfer, evidence, receipt,
  pair, and trust predicates distinct.
- Review read-only. Record findings without repairing them.

## Verification

Run only Docker-free ordinary-development checks: focused Vite tests,
`npm run m2d:verify`, `npm run p2:verify`, `npm run p2:build`, compiled
import-safety checks, exact staging source/byte/mode/version/manifest
assertions, focused formatting, `git diff --check`, and any smaller static
assertion needed for the decision. Do not rebuild staging in the review.

## Decision boundary

Approve only if the implementation and exact staged candidate reproduce the
contract with no blocking or non-blocking finding. Approval may authorize at
most one later argument-free `npm run p2:execute:vite` invocation, no retry,
with constrained setup reachable only after a complete permissive receipt.
Otherwise name one smallest Docker-free remediation task.

## Completion report

- Decision and findings
- Reproduced identities, command graph, transition/validator/gating predicates
- Exact staging count, manifest digest, versions, and candidate source hashes
- Commands run and observed results
- Commands intentionally not run
- Evidence classification and remaining cooperative-fixture/runtime limits
- Exact approved or blocked boundary
- One concrete `Next:` task
