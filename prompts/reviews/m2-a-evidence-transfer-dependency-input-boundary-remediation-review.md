# Goal

Perform a fresh independent Docker-free read-only re-review of only frozen-
research issue #43's M2A-IBR01 through M2A-IBR03 dependency-input contract
remediation. Decide whether M2A-IB03 through M2A-IB06 now close at contract
scope while M2A-IB01/M2A-IB02 remain closed, and whether at most one bounded
Docker-free static/unit implementation may proceed. Do not repair the
contract, implement or execute either producer, acquire or inspect future
input bytes, construct a context or image, call Docker, or access runtime/
result state.

# Read first

- root `AGENTS.md`
- `docs/index.md` and the issue #43 documents routed there
- `packages/AGENTS.md`
- `experiments/AGENTS.md`
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md`, especially the resumed/deferred high-assurance
  boundary
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
- every issue #43 transfer and construction/execution-gate contract,
  implementation, remediation, and review record routed by `docs/index.md`
- `docs/m2-a-evidence-transfer-dependency-input-boundary.md`
- `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-review.md`
- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary.md`
- `prompts/m2-a-evidence-transfer-dependency-input-boundary-remediation.md`
- this prompt

# Scope

Review only the remediated dependency-input contract, its original review,
the saved prompt pair, minimal status records, and repository-controlled
tracked source needed to reproduce the fixed schemas, constants, current
consumer, allowlist, package tuples, and aggregates.

Make these decisions explicitly:

1. Confirm M2A-IB01/M2A-IB02 remain unchanged and closed at contract scope.
   Reproduce generation `20260721-01`, the fixed roots/aggregates/null
   bindings, exact credential-empty two-request npm boundary, atomic archive/
   receipt transaction, future external-communication gate, and evidence non-
   promotion. Reject any repair that silently broadens npm or runtime
   authority.
2. For M2A-IBR01 source completeness, trace the first traversal, held source-
   directory and file identities, complete second traversal through the same
   authority, comparison/adoption point, and every descriptor settlement.
   Inject add/remove/rename/reparent/replacement/alias/order/uncertainty
   contradictions and confirm none can produce output or a complete claim.
3. For M2A-IBR01 destination completeness, trace every held destination
   directory and copied-file transition through the final complete traversal
   immediately before `toolchain.next` construction. Confirm the canonical
   receipt cannot omit, add, alias, disconnect, or adopt a row whose exact
   identity/mode/link/size/hash transaction was not reproduced, and that no
   reopening substitutes for held authority.
4. For M2A-IBR02, trace the exact exclusive checkpoint from absence through
   in-progress and every sanitized failure/success terminal. Confirm it is
   durable before the first fallible host/tracked-source read, an absent
   toolchain root after failure cannot look unattempted, and any present or
   uncertain checkpoint prevents inspection, cleanup, repair, resume, retry,
   or a second producer occurrence. Confirm candidate visibility remains
   distinct from review/evidence acceptance.
5. For M2A-IBR03, reproduce the exact two-path addition to M2A-IB06 and inspect
   the actual `validateConstructorToolchain()` consumer boundary. Confirm the
   later approved implementation can make it reject live Node mode other than
   `0555`, copied runtime/package mode other than `0444`, and zero-length
   package rows, with focused negatives reaching that consumer and no broader
   construction/runtime change.
6. Reconcile every required negative class with the exact later implementation
   and prompt allowlists. If all findings close with no new blocker, approve at
   most that one Docker-free static/unit implementation; otherwise name only
   the smallest remaining contract remediation. Neither decision authorizes
   producer execution, input access, external communication, construction, or
   Docker.

In those traces, reproduce these exact remediated choices rather than
substituting an equivalent design:

- the separate
  `experiments/npm12-install/.work/m2a-transfer-toolchain-attempt-20260721-01`
  root is the exclusive attempt authority and contains only canonical
  `attempt.json` before source reads; `attempt.next` is its sole staging/
  replacement name, while the fixed toolchain root may remain absent after a
  failed occurrence;
- `m2a-transfer-toolchain-attempt/v1` has ordered keys `schemaVersion,
  generation, state, issue, toolchainReceiptSha256, inventoryAggregate,
  evidenceReview` and only the fixed in-progress, failed/unknown, and complete
  projections;
- the package graph binds exact lexical parent/name, type, full mode, effective
  owner/group, link count, and BigInt device/inode/size/mtime through two
  bytewise ordered traversals over the same held directory descriptors;
- the separate toolchain root's pre-receipt physical graph contains exactly
  seven named mode-`0700` directories and copied inventory rows other than the
  virtual `runtime/constructor-node`, with no checkpoint, staging, or receipt
  row; and
- the later allowlist adds only
  `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` and
  `experiments/npm12-install/scripts/m2a-transfer-construction.d.mts` for the
  actual consumer's `0555` live-Node, `0444` copied-row, and positive package-
  size relations.

# Out of scope

- Editing the remediated contract or changing implementation, declarations,
  tests, static verification, package scripts, lockfiles, manifests,
  Containerfiles/container source, adapters/probes/packages, fixtures,
  scenarios, results, Expected, or `Observed`
- Inspecting fixed ignored input/construction/result roots, installed package
  trees, `/usr/bin/node` bytes, process reports, host environment/home/cache,
  credentials, Docker state, runtime state, or historical result contents
- Importing or executing either future producer entry, npm, a compiler,
  constructor, lifecycle fixture, Docker command, or runtime-socket action
- External network, loopback/Unix-socket communication, Remote Git,
  publication, deployment, cleanup, repair, retry, or third-party
  communication
- Inventing registry integrity, archive size/hash, runtime closure, inventory,
  receipt digest, reviewed binding, or other future input observation
- Reopening prior closed M2A transfer/construction findings or any M3, M4, or
  presentation item

# Constraints

- Use only read-only repository-controlled tracked source inspection and in-
  memory schema/state-machine calculations.
- Treat source bytes, source-directory completeness, destination transaction,
  receipt structure, candidate review, and construction consumption as
  separate evidence classes.
- Require exact path/name, type, full-mode, owner, link, BigInt identity,
  ordering, close, and adoption edges where the remediated contract claims
  them. Positive prose or held file descriptors alone do not prove tree
  completeness.
- Require the durable checkpoint to distinguish never-started from every
  pre-root failure without relying on terminal output or a later invocation.
- Confirm the actual constructor consumer can enforce all three mode/size
  relations inside the exact allowlist; a disconnected validator is
  insufficient.
- A blocked decision must name only the smallest remaining contract gap. Do
  not repair it or defer a contract choice to implementation/runtime evidence.
- No standing authorization is used in this documentation-only review.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation.md`
  with an `APPROVED` or `BLOCKED` decision, M2A-IB01 through M2A-IB06 and M2A-
  IBR01 through M2A-IBR03 statuses, independently traced source/destination/
  checkpoint/consumer state machines, limitations, commands, and one permitted
  next boundary
- minimal status updates in
  `docs/m2-a-evidence-transfer-dependency-input-boundary.md`,
  `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`

# Verification

- Recompute the exact tracked 31-row and 41-row aggregates in memory from only
  the listed repository-controlled tracked files.
- Use focused read-only assertions to reproduce the two receipt schemas,
  source and destination traversal transitions, durable checkpoint state
  machine, exact two-path consumer allowlist, and all three consumer mode/size
  negatives without importing either producer entry or accessing fixed roots.
- Run a focused Prettier check over the remediated contract, saved prompt pair,
  new review record, and changed status records.
- Run `git diff --check`.
- Do not run tests, typecheck, a build, either producer, a lifecycle fixture,
  construction, Docker, transfer, result-root inspection, or a broad check;
  those commands are outside this contract-only read-only re-review.

# Completion report

- Decision and M2A-IB01 through M2A-IB06/M2A-IBR01 through M2A-IBR03 status
- Reproduced source/destination completeness and checkpoint state machines
- Reproduced actual-consumer mode/size boundary and exact allowlist
- Preserved authority, one-shot, candidate-review, and evidence separation
- Changed files and commands actually run
- Commands intentionally not run and remaining limitations
- Exact approved implementation or blocked remediation boundary
- One concrete `Next:` task
