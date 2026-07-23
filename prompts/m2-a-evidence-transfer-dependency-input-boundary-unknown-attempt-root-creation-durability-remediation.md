# Goal

Remediate only frozen-research issue #43's residual M2A-IBR02
unknown-attempt-root-creation durability gap. Replace the contradictory
root-absent unknown-create-consumed branch with one exact cooperative-host
synchronous exclusive-directory commit boundary, then hand the contract to a
fresh independent Docker-free read-only re-review. Do not implement or execute
either input producer, acquire or inspect future input bytes, construct a
context or image, call Docker, or access runtime/result state.

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
- this prompt

# Scope

Change only the dependency-input contract and the minimal records needed to
hand its remediated bytes to a fresh independent review:

```text
docs/m2-a-evidence-transfer-dependency-input-boundary.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation-review.md
```

Resolve only M2A-IBR02 as follows:

1. Preserve M2A-IB01/M2A-IB02 and closed M2A-IBR01/M2A-IBR03 exactly at
   their recorded contract scope. Preserve generation `20260721-01`, every
   fixed input/construction/result path, both tracked aggregates, all null
   reviewed bindings, all three receipt schemas, the credential-empty
   two-request npm boundary, the external-communication gate, the exact
   held-authority source/destination traversals, the two-path actual-consumer
   allowlist, and evidence non-promotion.
2. Replace the initial attempt-root operation's current three-outcome
   create/deny/unknown model with exactly one synchronous, non-recursive,
   exclusive `mkdirSync` operation for:

   ```text
   experiments/npm12-install/.work/m2a-transfer-toolchain-attempt-20260721-01
   ```

   The future production operation uses mode `0700`, runs only after the
   existing held-parent absence preflight, and has no timeout, cancellation,
   callback, promise, child, or backend result that can return
   settlement-unknown. Do not add another lock, sentinel, generation root, or
   external durable authority.
3. Bind occurrence start to the atomic directory commit, not to call issuance
   or an in-memory decision:

   - normal synchronous return means the attempt root was created and the
     occurrence started;
   - `EEXIST` or an already-present/not-provably-absent root means an existing
     durable occurrence wins and the invocation stops without opening,
     inspecting, cleaning, repairing, resuming, or retrying either fixed root;
   - any other synchronous `mkdir` error is a known no-create terminal for
     that invocation and starts no producer occurrence; and
   - process loss is not a returned settlement branch. Loss before the atomic
     commit leaves the root absent and starts no occurrence. Loss at or after
     commit leaves the root present, which durably blocks every fresh
     invocation.

   Remove every claim that a root-absent unknown creation consumed the
   generation. Do not relabel a no-create outcome as a failed occurrence.
4. After known creation, preserve the existing held-root open, exact identity
   correlation, parent sync, `attempt.next`/`attempt.json` in-progress
   transaction, and all later failed/unknown/complete replacements. Every
   open, identity, parent-sync, checkpoint-write, file-sync, reread, mode,
   close, rename, or root-sync failure after directory commit retains the root
   as the durable non-evidence occurrence. No host runtime, process-report,
   tracked-source, or installed-package read may precede the fully settled
   canonical in-progress checkpoint.
5. Make the fresh-invocation decision exact: a root absent after a
   before-commit loss or known no-create result is a never-started generation
   and may later attempt the one atomic commit; a root present after commit
   consumes the generation even if `attempt.json` was never published. No
   fresh invocation reads either root to make that decision.
6. Replace only the affected later fake-only negative requirements. Require
   focused cases for synchronous known no-create, `EEXIST`, process loss
   immediately before and immediately after the atomic commit, process loss
   before initial checkpoint publication, every post-commit
   open/identity/sync/checkpoint failure, a fresh invocation after each
   root-absent/root-present case, and rejection of any backend or contract
   projection that returns `unknown` from the initial creation primitive.
   Preserve every existing M2A-IBR01/M2A-IBR03 negative.

# Out of scope

- Editing implementation, declaration, test, static-verifier, package-script,
  lockfile, manifest, Containerfile/container, adapter/probe/package, fixture,
  scenario, result, Expected, or `Observed` bytes
- Changing the attempt-root path, attempt schema/key order, issue vocabulary,
  toolchain-root transaction, source/destination completeness graph,
  constructor consumer, allowlist, receipt schema, aggregate, reviewed
  binding, or any closed transfer/construction decision
- Acquiring, inspecting, hashing, copying, or executing npm, `/usr/bin/node`,
  installed package, shared-object, toolchain, construction, image, transfer,
  runtime, or result bytes
- Importing or executing either future producer entry, npm, a compiler,
  constructor, lifecycle, Docker command, or runtime-socket operation
- External network, loopback/Unix-socket communication, credentials,
  environment/home/cache access, Remote Git, publication, deployment,
  cleanup, producer retry, or third-party communication

# Constraints

- Make the smallest contract-only repair and close only residual M2A-IBR02.
- Fix the exact primitive, path, mode, atomic commit point, returned outcomes,
  process-loss boundaries, and fresh-invocation decisions in the contract. Do
  not defer a choice to implementation, an arbitrary backend, or result review.
- The initial creation primitive must not expose a settlement-unknown return.
  A fake backend cannot add a third result that the production synchronous
  primitive does not have.
- Do not claim hostile-kernel resistance or machine-crash persistence. Preserve
  the cooperative repository-owned Linux host and exact synced-transition
  limitations.
- Treat never-started, started/non-evidence, candidate, independently reviewed
  input, construction input, runtime result, and `Observed` as distinct
  classes.
- Preserve unrelated M3, M4, presentation, result, and user working-tree
  changes.
- No standing authorization is used in this documentation-only remediation.

# Deliverables

- remediated
  `docs/m2-a-evidence-transfer-dependency-input-boundary.md` resolving only
  residual M2A-IBR02 at contract scope
- fresh independent re-review prompt at
  `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation-review.md`
- minimal authoritative status updates naming only that fresh re-review as
  next

# Verification

- Use a focused read-only state-machine assertion to prove that initial
  creation has no returned unknown outcome; before-commit root absence is
  never-started; commit/post-commit root presence is generation-consuming;
  and every post-commit failure remains durable before source reads.
- Confirm the remediated text contains no claim that root-absent unknown
  creation consumed the generation and does not alter M2A-IBR01/M2A-IBR03.
- Run a focused Prettier check over the remediated contract, saved prompt pair,
  and changed status records.
- Run `git diff --check`.
- Do not run tests, typecheck, a build, either producer, a lifecycle fixture,
  construction, Docker, transfer, result-root inspection, or a broad check;
  those commands cannot establish this contract-only remediation.

# Completion report

- Exact synchronous exclusive-create commit and process-loss boundary
- M2A-IBR02 and M2A-IB01 through M2A-IB06 status
- Preserved M2A-IBR01/M2A-IBR03 and authority/evidence boundaries
- Changed files and commands actually run
- Commands intentionally not run and remaining limitations
- Exact fresh independent re-review boundary
- One concrete `Next:` task
