# Goal

Remediate only the Docker-free selected Vite `20260720-02` detached lifecycle
and durable-transfer contract findings P2-DT01 through P2-DT05. Produce one
closed contract that is ready for a later fresh independent review. Do not
implement or execute it.

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
- this prompt

# Required remediation

1. P2-DT01: make the exact progress-directory mode/ownership/open/sync
   procedure feasible for the fixed non-root writer without relying on an
   unreviewed host numeric ownership mapping. Keep atomic same-directory
   replacement, bounded bytes, stable host read, and crash behavior explicit.
2. P2-DT02: preserve the accepted P2-V03 boundary. A natural exit-0 close with
   post-close process-group residue must remain a closed known
   `P2_CHILD_FAILED` path after bounded force settlement and must never reach
   output export or a completed terminal.
3. P2-DT03: define a closed record/terminal/runner-exit/settlement table or
   equivalent executable predicates for every reachable branch: pre-service,
   spawn/invalid PGID, natural success/nonzero/residue, deadline/output/error,
   server settlement, output validation, and transfer-publication failure. Fix
   the accepted close mapping and exact terminal-to-container-exit
   cross-consistency.
4. P2-DT04: close the host command graph for every detached-start and wait
   outcome. Separate known and unknown CLI settlement, exact final-inspect and
   remove permissions, writer-stop/progress-read predicates, first failure,
   and canonical attempt fields/issues.
5. P2-DT05: bind progress integrity to the repository-owned immutable
   cooperative fixture/runner closure as a static trust assumption, not an OS
   same-UID writer-isolation claim. State that the writable same-UID mount is
   not an adversarial integrity boundary and ensure no claim or receipt implies
   otherwise. Add the smallest negative/static assertions a later
   implementation must provide.
6. Correct the progress identity-field count, fix the exact new create-mount
   command implication/order, and make the attempt/receipt gating consequences
   of every remediated branch explicit.

# Scope

- `docs/p2-vite-detached-transfer-contract.md`
- minimal status/handoff updates in `docs/index.md`, `docs/milestones.md`, and
  `docs/p2-vite-completion.md`
- a separate fresh re-review prompt under `prompts/reviews/`
- this prompt only if a pre-work ambiguity must be clarified without rewriting
  its observed history

# Out of scope

- Executor, runner, adapter, probe, schema, test, package-script, or staging
  implementation
- Staging rebuild or input access
- Docker, runtime sockets, result roots, evidence subtrees, or historical state
- An execution gate, pair execution, receipt/result review, presentation
  promotion, Expected outcome change, or experiment-matrix Observed change
- Accepted codegen/P3/P4 evidence or frozen M4 state

# Constraints

- Do not invoke Docker, a lifecycle fixture, build, broad verification, staging,
  or a production executor.
- Do not access ignored staging/results or create either `20260720-02` root.
- Do not use external network, credentials, Remote Git, publication, deployment,
  or third-party communication.
- Keep Docker CLI, container, runner, child, transfer, evidence, receipt, and
  same-image predicates distinct.
- Keep the 60,000 ms absolute container deadline and every existing child,
  server, CLI settlement, Docker output, and event/output bound unchanged.
- Do not fix a finding by weakening missing/incomplete evidence into success or
  by adding raw logs, retries, caller-selected input, or an increased timeout.

# Deliverables

- Remediated `docs/p2-vite-detached-transfer-contract.md` closing P2-DT01
  through P2-DT05 at configuration-contract scope
- `prompts/reviews/p2-vite-detached-transfer-contract-remediation-review.md`
  for a fresh independent Docker-free re-review
- Minimal authoritative status/handoff updates naming only that re-review as
  next

# Verification

Use only the smallest Docker-free tracked-source and filesystem-semantics
assertions needed to prove that the remediated contract is internally closed.
`git diff --check` may be run. Do not build, run focused/full unit suites,
rebuild staging, invoke Docker, or inspect result state.

# Completion report

- Findings remediated and the exact new contract predicates
- Evidence classification and remaining trust/runtime limitations
- Changed files and commands run
- Commands intentionally not run
- Exact re-review boundary
- One concrete `Next:` task
