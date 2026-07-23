# Goal

Remediate only M2A-TRR01 through M2A-TRR03 from frozen-research issue #43's
fresh Docker-free M0/M2-A evidence-transfer implementation-remediation
re-review. Make the fixed Docker plan recursively exact own data, make runner
descriptor/publication settlement truthful, and add one pure combined
completion/artifact/attempt candidate validator. Preserve M2A-TR01/M2A-TR02
and M2A-TRI03 closure, the fixed `20260721-01` tuple, historical evidence, and
every construction/runtime gate.

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
- this prompt

# Exact residual change boundary

Production changes are limited to:

- `experiments/npm12-install/container/run-m2a-transfer.mjs`
- `experiments/npm12-install/scripts/m2a-transfer-lib.mjs`
- `experiments/npm12-install/scripts/m2a-transfer-lib.d.mts`

Verification changes are limited to:

- `experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs`
- `tests/m2a-evidence-transfer.test.ts`

Update only `docs/m2-a-evidence-transfer-contract.md`,
`docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`, `docs/milestones.md`, and
`docs/frozen-research-execution-plan.md` as minimal remediation-status and
handoff records. The saved residual-remediation/re-review prompt pair may
remain as documentation. Do not change the initializer, `package.json`, the
transfer manifest, Containerfile, adapter/probe source, fixtures, result paths,
scenario definitions, or any other implementation or verification path.

# Required residual remediation

## M2A-TRR01 — recursively exact own plan data

1. Replace the nested `JSON.stringify()` comparison in
   `validateFixedDockerPlan()` with a recursive validator that checks every
   node before reading or comparing its value. Every record must have the
   exact ordinary-object prototype, own ordered string keys, no symbol keys,
   and only own data-property descriptors. Every array must have the exact
   array prototype, exact dense index sequence and length, no holes or extra
   keys, and only own data entries. Reject `null`/custom prototypes, inherited
   properties, accessors, proxies that cannot satisfy the complete snapshot,
   symbols, sparse arrays, and non-JSON primitive data.
2. Apply that boundary to the entire plan, including `environment`, every argv
   array, `forbiddenInheritedEnvironmentPrefixes`, `hostLayoutPolicy`, its
   `directories` array, and each directory row. Compare the validated snapshot
   with `createFixedDockerPlan(imageId)` without invoking an input getter or
   omitting inherited/extra state. Return only the internally constructed,
   deeply frozen expected plan.
3. Add controlled negatives for inherited `DOCKER_HOST`, inherited non-Docker
   data, accessor properties at nested record/argv/directory levels, null and
   custom prototypes, symbol keys, sparse/holey arrays, extra array
   properties, own-key reordering, and exact value substitution. Keep all
   existing full-command/environment positives and the fixed
   `/usr/bin/docker`, `shell: false`, deadline/output/layout, and
   `executionApproved: false` data unchanged.

## M2A-TRR02 — complete pre-publication ownership settlement

1. Replace the completion key `runnerSettlement.descriptorsClosed` with the
   exact key `runnerSettlement.prePublicationDescriptorsClosed`. It may be
   `true` only after every runner descriptor opened before
   `publishCompletion()` has completed its one close attempt and every
   parallel descriptor-owning branch has settled. The completion record must
   not claim that the publication descriptors, which are opened only after
   serialization, are already closed.
2. Replace the rejecting `Promise.all()` groups for the two private-input
   writes and the two output captures with an explicit all-settled ownership
   barrier. Await every branch to fulfillment or rejection, preserve fixed
   input/output order, and proceed only after all successful opens have reached
   exactly one awaited close. A rejection remains fail closed; do not publish
   success, discard a sibling rejection, or continue while a sibling may own a
   descriptor.
3. Keep `publishCompletion()` as the sole canonical-name commit. Its `.next`
   and run-root handles must still close through the awaited fail-closed path;
   it may resolve only after the final owned close. A close failure after the
   visible rename must leave process exit `70`, retained state, and a host
   Inconclusive `M2A_COMPLETION_EXIT_MISMATCH`, never a zero exit or valid
   candidate. Natural process exit plus the host wait/final-inspect correlation
   is the later proof of publication-handle settlement; the persisted
   pre-publication field does not claim it.
4. Update `validateCompletionBytes()` and controlled/static tests for the exact
   replacement key and meaning. Cover private-input and output-capture sibling
   rejection/close settlement, no early completion construction, publication
   close failure, one close per successful open, canonical commit ordering,
   and absence of success after unsettled work. Do not import or execute the
   container source.

## M2A-TRR03 — combined candidate transfer cross-validation

1. Export one pure `validateCandidateTransfer()` from the library and its
   declaration with this fixed argument order:

   ```text
   attemptInput, reviewedImageId, completionInput, segmentInput, markerInput
   ```

   It must internally call the existing canonical attempt, completion, and
   artifact validators; do not trust caller-asserted validated projections.
   Return only their deeply frozen validated attempt/completion/segment/marker
   projections after all cross-record checks pass.
2. Require `completionTransfer: "valid"`. For each completion-listed output,
   require the matching artifact and exact attempt transfer state `"valid"`;
   for each unlisted fixed output, require no artifact and exact state
   `"not-attempted"`. Preserve the fixed segment-then-marker order and reject
   invalid, unknown, early, extra, missing, or reordered transfer state.
3. Cross-bind completion `status`/`issue` to the canonical attempt issue. A
   complete completion requires `issue: null` and no attempt issue. The sole
   transferable failure-candidate completion remains
   `status: "inconclusive"`, `issue: "M2A_REBUILD_FAILED"`, with exactly the
   same attempt issue at `validate-completion`. Every other completion/attempt
   issue or measurement-exit contradiction remains Inconclusive and is not a
   valid combined candidate.
4. Add positives for the marker-absent complete candidate, marker-present
   complete candidate, and fixed rebuild-failure candidate. Add negatives for
   both directions of segment/marker inventory-state drift, extra/missing
   artifacts, every invalid/unknown state, issue/status mismatch, an early or
   reordered state, noncanonical bytes, and the independently reproduced
   completion-without-marker/attempt-marker-valid contradiction.

# Preserved boundaries

- Keep the exact generation/run/result/container/volume/image-tag tuple,
  ordered 31-file aggregate and five anchors, fixed M2-A 1/6/0 event contract,
  private inputs, schemas except for the exact settlement-key correction,
  historical non-reuse, and M2A-TR01/M2A-TR02/M2A-TRI03 closure unchanged.
- Keep the library pure and the backend privately branded fake-only. Do not add
  child-process imports, a production backend, public production entry,
  argument-free execution command, image/context construction, or candidate
  command.
- Static/unit acceptance does not establish Docker behavior, named-volume
  visibility, npm lifecycle behavior, transport validity, runtime isolation,
  result acceptance, M3 ingestion, profile/matrix/presentation evidence, or
  any `Observed` value.

# Prohibited actions

- No image/context construction, Docker/container/runtime-socket command, npm
  install/pack/approve/rebuild, lifecycle/probe execution, transfer, staging,
  result-root or retained-state access, cleanup, retry, repair, signaling, or
  evidence ingestion/promotion.
- No credentials, host-home/environment inspection, external network, Remote
  Git, publication, deployment, third-party communication, or standing-
  authorization use.
- Do not import or execute either fixed container source as a test shortcut.

# Verification

Run only the approved Docker-free boundary:

```sh
npm run m2a:transfer:verify
npm run m2a:verify
npm run typecheck
npm test
npm run check
git diff --check
```

Also run focused Prettier checks over only the changed residual-remediation and
status files. Record an aggregate failure without editing unrelated files, and
do not claim root `check` passed unless every stage actually completed
successfully.

# Completion report

- M2A-TRR01 through M2A-TRR03 remediation evidence and preservation of all
  previously closed findings
- Exact nested-own-data, pre-publication/all-settled ownership, and combined
  candidate traces
- Changed files and commands actually run with observed results
- Intentionally unrun commands, evidence class, remaining runtime/cooperative-
  host limitations, and preserved unrelated work
- One concrete `Next:` task naming the fresh independent Docker-free residual-
  remediation re-review
