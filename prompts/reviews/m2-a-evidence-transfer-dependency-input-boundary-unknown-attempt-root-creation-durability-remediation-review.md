# Goal

Perform a fresh independent Docker-free read-only re-review of only frozen-
research issue #43's residual M2A-IBR02 unknown-attempt-root-creation
durability remediation. Decide whether the contract now distinguishes every
never-started root-absent outcome from every durably started occurrence
without a returned unknown-create-consumed branch. Do not repair the contract,
implement or execute either input producer, acquire or inspect future input
bytes, construct a context or image, call Docker, or access runtime/result
state.

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
- `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation-review.md`
- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation.md`
- `prompts/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md`
- this prompt

# Scope

Review only the residual M2A-IBR02 contract diff, its saved prompt pair,
minimal status records, immutable earlier reviews, and repository-controlled
tracked source needed to reproduce the fixed schemas, path, primitive, and
state machine.

Make these decisions explicitly:

1. Confirm M2A-IB01/M2A-IB02 and closed M2A-IBR01/M2A-IBR03 remain unchanged
   at contract scope. Reproduce generation `20260721-01`, fixed roots,
   aggregates, null bindings, three receipt schemas, external-acquisition
   gate, held-authority source/destination traversals, exact two-path
   actual-consumer allowlist, and evidence non-promotion.
2. Confirm the initial attempt-root transition is exactly one synchronous,
   non-recursive, exclusive `mkdirSync` call with mode `0700` after the
   existing held-parent absence preflight. It must expose no timeout,
   cancellation, callback, promise, child, arbitrary backend, or
   settlement-unknown result.
3. Reproduce the exact atomic-commit classification:

   | Boundary | Durable root | Occurrence decision |
   | --- | --- | --- |
   | known no-create synchronous error | absent | never started |
   | process loss before atomic commit | absent | never started |
   | normal return after atomic commit | present | started and consumed |
   | process loss at/after atomic commit | present | started and consumed |
   | `EEXIST` or absence not established | present or uncertain | stop for the existing occurrence without inspection |

   Reject any branch that treats root-absent uncertainty as a consumed
   occurrence, any branch that treats a present root as retryable, and any
   separate lock/sentinel/generation authority.
4. Trace process loss and every failure between directory commit and canonical
   in-progress checkpoint publication. Confirm the already created root is
   retained and blocks a fresh invocation without inspection even when
   held-root open, identity correlation, parent sync, `attempt.next` write,
   file sync, reread, mode, close, rename, or root sync does not settle.
   Confirm no host runtime, process-report, tracked-source, or installed-
   package read can precede the fully settled in-progress checkpoint.
5. Model a fresh second invocation after each before-commit and post-commit
   fault. A root-absent before-commit case may attempt the first actual
   occurrence later; a root-present post-commit case must stop from the held
   parent without opening or inspecting either fixed root. Confirm this is
   occurrence classification, not cleanup, repair, resume, or producer retry.
6. Reconcile the exact fake-only negative matrix with the production
   primitive. It must cover known no-create, `EEXIST`, before/after-commit
   process loss, process loss before checkpoint publication, all post-commit
   checkpoint transitions, a fresh invocation for each durable-state class,
   and rejection of a fake returned `unknown` creation result.
7. If residual M2A-IBR02 closes with no new blocker, decide whether M2A-IB03
   through M2A-IB06 close at contract scope and approve at most the already
   fixed one Docker-free static/unit implementation boundary. Otherwise name
   only the smallest remaining contract remediation. Neither decision
   authorizes producer execution, input access, external communication,
   construction, or Docker.

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
- Reopening prior closed M2A transfer/construction findings or any M3, M4, or
  presentation item

# Constraints

- Use only read-only repository-controlled tracked source inspection and
  in-memory state-machine calculations.
- Treat syscall commit, process observation, durable root state, checkpoint
  state, candidate review, and evidence acceptance as separate facts.
- Do not accept an implementation-defined or fake-only third result for the
  synchronous creation primitive.
- Process loss is a boundary fault, not a return value. Require fresh-
  invocation behavior to derive only from the durable root state without
  opening either fixed root.
- A blocked decision must name only the smallest remaining contract gap. Do
  not repair it or defer a contract choice to implementation/runtime evidence.
- Preserve the cooperative-host and non-hostile-kernel limitation; do not
  infer machine-crash durability beyond the exact synced transitions.
- No standing authorization is used in this documentation-only review.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md`
  with an `APPROVED` or `BLOCKED` decision, M2A-IB01 through M2A-IB06 and
  M2A-IBR01 through M2A-IBR03 statuses, independently modeled create/commit/
  process-loss/fresh-invocation transitions, limitations, commands, and one
  permitted next boundary
- minimal status updates in
  `docs/m2-a-evidence-transfer-dependency-input-boundary.md`,
  `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`

# Verification

- Use a focused repository-controlled in-memory model to exercise the five
  exact initial boundaries, every post-commit checkpoint failure, both fresh-
  invocation durable-state classes, and inverse unknown-return/present-retry/
  absent-consumed contradictions.
- Reproduce the fixed attempt path and attempt schema, plus M2A-IBR01/M2A-IBR03
  closure, without opening either producer entry or fixed ignored root.
- Run a focused Prettier check over the remediated contract, saved prompt pair,
  new review record, and changed status records.
- Run `git diff --check`.
- Do not run tests, typecheck, a build, either producer, a lifecycle fixture,
  construction, Docker, transfer, result-root inspection, or a broad check;
  those commands are outside this contract-only read-only re-review.

# Completion report

- Decision and M2A-IB01 through M2A-IB06/M2A-IBR01 through M2A-IBR03 status
- Reproduced synchronous create/commit/process-loss/fresh-invocation boundary
- Preserved source/destination/consumer and authority/evidence boundaries
- Changed files and commands actually run
- Commands intentionally not run and remaining limitations
- Exact approved implementation or blocked remediation boundary
- One concrete `Next:` task
