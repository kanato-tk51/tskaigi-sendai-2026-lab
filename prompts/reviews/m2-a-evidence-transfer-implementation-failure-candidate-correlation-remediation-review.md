# Goal

Perform a fresh independent Docker-free read-only re-review of only frozen-
research issue #43's bounded M2A-TRR03 failure-candidate correlation
remediation. Decide whether the pure combined candidate validator now proves
valid complete transport plus a truthful settled rebuild failure while
M2A-TRR01/M2A-TRR02 and every previously accepted boundary remain intact. Do
not repair implementation or tests, construct an image, define or execute a
runtime command, or accept evidence.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, and `experiments/AGENTS.md`
- `docs/index.md` and the issue #43 documents routed there
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md` deferred high-assurance section
- `docs/milestones.md` M0, M2-A, and frozen-research sections
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `docs/experiment-protocol.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/spike-npm12.md`
- `docs/m2-a-npm-lifecycle-adapter.md`
- `docs/reviews/m2-a-npm-lifecycle-adapter.md`
- `docs/m2-a-evidence-transfer-contract.md`
- `docs/reviews/m2-a-evidence-transfer-contract.md`
- `prompts/m2-a-evidence-transfer-implementation.md`
- `prompts/reviews/m2-a-evidence-transfer-implementation-review.md`
- `docs/reviews/m2-a-evidence-transfer-implementation.md`
- `prompts/m2-a-evidence-transfer-implementation-remediation.md`
- `prompts/reviews/m2-a-evidence-transfer-implementation-remediation-review.md`
- `docs/reviews/m2-a-evidence-transfer-implementation-remediation.md`
- `prompts/m2-a-evidence-transfer-implementation-residual-remediation.md`
- `prompts/reviews/m2-a-evidence-transfer-implementation-residual-remediation-review.md`
- `docs/reviews/m2-a-evidence-transfer-implementation-residual-remediation.md`
- `prompts/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation.md`
- every changed production and verification path in that prompt's exact
  allowlist
- this prompt

# Review target

Review only the M2A-TRR03 failure-candidate correlation remediation diff and
its minimal prompt/status records. Treat reported command passes and finding
closure as claims to reproduce. Do not edit implementation or verification
paths. Preserve unrelated M3, M4, presentation, and user working-tree changes.

# Required finding decision

1. Exercise `validateCandidateTransfer()` with controlled canonical in-memory
   candidates and confirm it still independently re-runs the attempt,
   completion, producer-segment, and conditional marker validators. Confirm an
   individually valid bounded Inconclusive completion is not automatically a
   transferable candidate.
2. Reproduce the sole positive `M2A_REBUILD_FAILED` candidate and trace all of
   its exact prerequisites: natural initializer/measurement settlement, valid
   completion transfer, the one canonical issue at `validate-completion`, all
   three runner-settlement booleans true, successful install and approval
   terminals/approval/lock chain, a settled integer nonzero rebuild exit with
   null signal/no timeout/no truncation, and an exact listed/valid producer
   segment plus conditional marker consistency.
3. Reproduce inverse rejection for a rebuild exit `0` and null/unknown exit;
   rebuild signal, timeout, stdout truncation, and stderr truncation; each false
   runner-settlement boolean; nonzero/signal/timeout/truncation and wrong
   approval/lock prerequisites for install or approve-scripts; absent,
   not-attempted, invalid, or contradictory segment transfer; and both marker
   contradiction directions. Confirm no input is repaired or reinterpreted.
4. Reproduce the marker-present and marker-absent complete candidates and all
   earlier combined-candidate contradictions. Confirm complete capability
   outcomes remain observations, issue/status spelling stays closed, transfer
   order is exact, and no other Inconclusive issue can become a candidate.
5. Confirm M2A-TRR01/M2A-TRR02 remain closed: recursively exact own plan data,
   truthful pre-publication/all-settled ownership, publication-handle natural-
   exit correlation, and late-close Inconclusive handling must not regress.
   Reproduce the fixed tuple, ordered 31-file aggregate and anchors, 1/6/0
   event contract, exact command/environment/layout values, private inputs,
   historical non-reuse, evidence non-promotion, fake-only backend, pure
   library, verification-only root reachability, and M2A-TR01/M2A-TR02/
   M2A-TRI03 closure.
6. Confirm the exact change allowlist: transfer library/declaration, focused
   transfer test, static verifier if needed, saved prompt pair, and minimal
   five status records only. The initializer, runner, manifest, Containerfile,
   package scripts, adapter/probe source, fixtures, scenarios, results, and all
   other implementation/verification paths must remain unchanged by this
   remediation.

# Review method and safety boundary

- Inspect the complete failure-candidate correlation remediation diff, exact
  allowlist, library/declaration, focused tests, and static verifier. Do not
  infer closure from names, source strings, or positive tests alone.
- Run `npm run m2a:transfer:verify`, `npm run m2a:verify`, and root no-emit
  typecheck. Reproduce root tests/check only as proportionate and record any
  unrelated aggregate failure without changing out-of-scope files. Run
  focused formatting and `git diff --check`.
- Use only repository-controlled in-memory inputs and Docker-free source/static
  checks. Do not import either container source or execute any fixture,
  adapter, lifecycle entry, probe, transfer, or runtime wrapper.
- Do not access Docker/runtime sockets, result roots, retained state,
  credentials, host home/environment, external network, Remote Git,
  publication, deployment, or third-party communication. Do not clean up,
  retry, repair, signal, or promote evidence.

# Decision boundary

The maximum positive decision closes M2A-TRR03 and M2A-TR03 through M2A-TR06
only at the Docker-free static/unit implementation boundary while preserving
M2A-TR01/M2A-TR02 and all earlier finding closures. It may permit only one
later, separately defined Docker-free construction/execution-gate contract
that must bind the complete constructed context and exact local `sha256:`
image ID before any candidate command can be reviewed. It does not itself
approve construction, Docker, standing-authorization use, transfer, result
access/review, evidence acceptance, M3 ingestion, profile/matrix/presentation
evidence, or `Observed`. A blocked decision must name only the smallest
remaining issue #43 remediation.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation.md`
  with an `APPROVED` or `BLOCKED` decision, M2A-TR01 through M2A-TR06 statuses,
  finding evidence, exact settlement/npm/rebuild/segment/marker analysis,
  commands actually run, limitations, and one permitted next boundary
- minimal status updates in `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`, `docs/milestones.md`,
  and `docs/frozen-research-execution-plan.md`
- one concrete `Next:` item

# Completion report

- Decision and M2A-TR01 through M2A-TR06 status
- Independently reproduced failure-candidate, preserved plan/descriptor,
  allowlist, identity, and evidence-class boundaries
- Changed files and commands actually run
- Intentionally unrun commands, remaining limitations, and the exact next
  boundary
