# Goal

Remediate only frozen-research issue #43's remaining M2A-CGR03 contract gap by
giving the three fixed absence-preflight Docker children distinct canonical
attempt-step identities and binding each identity one-to-one to its already
fixed argv. Do not implement the boundary, change any Docker command, acquire a
dependency, construct a context or image, call Docker, or access runtime/result
state.

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
- every issue #43 implementation/remediation review routed by `docs/index.md`
- `docs/m2-a-evidence-transfer-construction-execution-gate.md`
- `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-review.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate.md`
- `prompts/m2-a-evidence-transfer-construction-execution-gate-remediation.md`
- `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-remediation-review.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-remediation.md`
- this prompt

# Scope

Change only the contract in
`docs/m2-a-evidence-transfer-construction-execution-gate.md` and the minimal
handoff records in:

- `docs/m2-a-evidence-transfer-contract.md`
- `docs/m2-a-npm-lifecycle-adapter.md`
- `docs/index.md`
- `docs/milestones.md`
- `docs/frozen-research-execution-plan.md`

This saved remediation/re-review prompt pair remains unchanged. Preserve both
blocking review records as immutable review results. Do not change an
implementation, declaration, test, verifier, package script, Containerfile,
manifest, container entry, adapter/probe source, fixture, scenario, result,
Expected, or `Observed` byte.

## Exact canonical absence identities

1. Replace the generic future execution-gate attempt-step identity
   `absence-preflight` with exactly these three canonical identities in this
   exact order:

   ```text
   absence-volume
   absence-initializer-container
   absence-measurement-container
   ```

   Keep schema `m2a-transfer-attempt/v1`. Add no attempt field, issue code, or
   caller-selected identity. The generic `absence-preflight` spelling is not a
   valid step for the later issue #43 production execution boundary.

2. Bind the identities one-to-one to the existing fixed `/usr/bin/docker`
   argv, without changing any argv byte:

   ```text
   absence-volume:
   ["volume","inspect","tskaigi-m2a-evidence-20260721-01"]

   absence-initializer-container:
   ["container","inspect","tskaigi-m2a-transfer-init-20260721-01"]

   absence-measurement-container:
   ["container","inspect","tskaigi-m2a-transfer-run-20260721-01"]
   ```

   The future implementation must derive the persisted step from the fixed
   plan entry, not accept a separate caller projection. Reject a swapped,
   duplicate, missing, reordered, generic, unknown, or correct-name/wrong-argv
   mapping.

3. Each child retains only the existing step-compatible issue codes:
   `M2A_SETTLEMENT_UNKNOWN` for unknown close or
   `M2A_ABSENCE_PREFLIGHT_FAILED` for a known failed absence check. Preserve
   the chronological write-once first issue, exact command order, and
   prerequisite state. Do not split or rename either issue code.

## Exact checkpoint and validation boundary

1. Before each of the three preflight children, the existing write-ahead
   transaction must publish canonical `attempt.json` bytes whose sole issue
   names that child's exact canonical identity and
   `M2A_SETTLEMENT_UNKNOWN`. Launch only the argv bound to that identity after
   the checkpoint write, sync, reread, close, rename, and directory sync all
   settle.
2. After a known successful close, settle all owned output and descriptors
   before publishing the next identity's checkpoint. After a known absence
   failure, publish only `M2A_ABSENCE_PREFLIGHT_FAILED` with the same exact
   identity after settlement. After an unknown close, keep the already synced
   checkpoint immutable and perform no post-unknown Docker, inspect, copy,
   validation, cleanup, or filesystem publication.
3. Attempt validation must accept each exact identity only at its corresponding
   first-issue/prerequisite boundary. At any preflight failure, volume and both
   containers remain not created, later plan steps remain unperformed, and all
   transfers remain `not-attempted`. Reject a later-state claim, wrong issue
   code, multiple issue, or performed-step contradiction.
4. Preserve every already reviewed M2A-CGR01/M2A-CGR02 value and every other
   M2A-CGR03 transaction property: result-root cwd/identity, fixed command
   order and argv, completion-first conditional copy, known-settlement
   publication, immutable final bytes, no retry/repair/cleanup, and the
   cooperative-host limitation.

# Out of scope

- Source/declaration/test/verifier/package-script changes or static/unit
  implementation
- Npm or constructor-toolchain acquisition, constructor/compiler execution,
  context creation, image build/inspect, Docker/container/runtime-socket
  action, lifecycle/probe/transfer execution, result or retained-state access,
  cleanup, or evidence promotion
- Changing schema `m2a-transfer-attempt/v1`, issue codes, any Docker argv,
  fixed tuple, 31-row/41-row identity, Containerfile, manifest, historical
  M0/M2-A evidence, Expected, or `Observed`
- Reopening M2A-CGR01/M2A-CGR02 or making an implementation, acquisition,
  construction, image-build, or runtime approval

# Constraints

- Make the smallest contract-only change that closes only the reviewed exact
  checkpoint-identity gap.
- Treat configuration intent, contract text, static/unit evidence, and runtime
  observations as distinct evidence classes.
- Preserve unrelated M3, M4, presentation, result, and user working-tree
  changes.
- Do not inspect fixed ignored acquisition/construction/build/result roots,
  retained Docker state, host home/environment/cache, credentials, or runtime
  sockets.
- Do not use standing authorization, external network, Remote Git,
  publication, deployment, or third-party communication.

# Deliverables

- A minimal contract remediation in
  `docs/m2-a-evidence-transfer-construction-execution-gate.md` that defines the
  three exact identities, argv mapping, checkpoint transitions, issue
  compatibility, and validation negatives above
- Minimal status updates in `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`
- One concrete `Next:` item naming the saved fresh independent re-review

# Verification

- Inspect the contract diff and confirm exactly three unique canonical
  identities map one-to-one and in order to the three unchanged absence argv.
- Run focused Prettier checking over the remediated contract, this prompt pair,
  and the five status records.
- Run `git diff --check`.
- No test is required for this documentation-only remediation. Do not run npm
  acquisition, construction, build, Docker, lifecycle, transfer, or runtime
  commands.

# Completion report

- Exact identities and mapping defined, plus M2A-CGR03 and M2A-CG status
- Changed files and commands actually run
- Observed verification results and intentionally unrun commands
- Remaining acquisition/construction/runtime/evidence limitations
- Exact fresh independent Docker-free read-only re-review boundary
