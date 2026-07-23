# Goal

Remediate only the remaining M2A-TRR03 failure-candidate correlation gap from
frozen-research issue #43's fresh Docker-free M0/M2-A evidence-transfer
residual-remediation re-review. Make the pure combined candidate validator
accept `M2A_REBUILD_FAILED` only for valid complete transport containing a
truthful settled rebuild failure. Preserve M2A-TRR01/M2A-TRR02 closure, the
fixed `20260721-01` tuple, historical evidence, and every construction/runtime
gate.

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
- this prompt

# Exact change boundary

Production changes are limited to:

- `experiments/npm12-install/scripts/m2a-transfer-lib.mjs`
- `experiments/npm12-install/scripts/m2a-transfer-lib.d.mts`, only if the
  existing declaration must be tightened to describe the unchanged pure API

Verification changes are limited to:

- `experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs`
- `tests/m2a-evidence-transfer.test.ts`

Update only `docs/m2-a-evidence-transfer-contract.md`,
`docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`, `docs/milestones.md`, and
`docs/frozen-research-execution-plan.md` as minimal remediation-status and
handoff records. This saved remediation/re-review prompt pair may remain as
documentation. Do not change either container source, the initializer,
`package.json`, the transfer manifest, Containerfile, adapter/probe source,
fixtures, result paths, scenario definitions, or any other implementation or
verification path.

# Required remediation

## M2A-TRR03 — truthful transferable rebuild failure

1. Keep `validateCandidateTransfer()` as the sole pure combined boundary with
   the unchanged argument order:

   ```text
   attemptInput, reviewedImageId, completionInput, segmentInput, markerInput
   ```

   It must continue to re-run the canonical attempt, completion, producer-
   segment, and conditional marker validators rather than trusting caller-
   asserted projections. Do not weaken `validateCompletionBytes()` merely to
   make an individually valid bounded Inconclusive completion impossible; the
   combined candidate boundary must perform the additional correlation.

2. For the sole transferable failure spelling, require all of the following
   before returning a candidate:

   - completion `status: "inconclusive"` and
     `issue: "M2A_REBUILD_FAILED"`;
   - exactly one canonical attempt issue
     `M2A_REBUILD_FAILED` at `validate-completion`, with the already required
     natural initializer/measurement exit and exact valid completion-transfer
     state;
   - `npmChildClosed`, `loopbackClosed`, and
     `prePublicationDescriptorsClosed` all exactly `true`;
   - install and approve-scripts each settled as an exact successful command:
     exit `0`, null signal, no timeout, no stdout/stderr truncation, approval
     `absent` then `present`, and the existing exact lock prerequisites;
   - rebuild settled as a real command failure: an integer nonzero exit, null
     signal, no timeout, no stdout/stderr truncation, approval `present`, and
     the existing exact lock prerequisites; and
   - the exact producer segment listed first in the completion inventory,
     supplied, canonically valid, and represented by attempt
     `segmentTransfer: "valid"`. Preserve the existing conditional marker
     rule derived from the validated file-write event: a listed marker must be
     present and valid with `markerTransfer: "valid"`; an unlisted marker must
     be absent with `markerTransfer: "not-attempted"`.

3. Reject a claimed rebuild-failure candidate when rebuild exited `0`, has a
   null/unknown exit, was signaled, timed out, or truncated output; when any
   runner-settlement boolean is false; when install or approval is nonzero,
   signaled, timed out, truncated, has the wrong approval projection, or breaks
   the fixed lock chain; or when the segment/marker inventory, artifact, or
   transfer state is incomplete or contradictory. Preserve the chronological
   write-once attempt issue, exact output order, canonical bytes, and every
   previously closed candidate contradiction.

4. Keep complete candidates unchanged: `status: "complete"`, `issue: null`,
   no attempt issue, exact valid segment transfer, and conditional marker
   consistency. Do not turn an Expected capability mismatch inside a valid
   segment into a transport failure, and do not accept any other Inconclusive
   issue as a transferable candidate.

# Focused verification requirements

- Retain positives for marker-present and marker-absent complete candidates
  and add or tighten the positive rebuild-failure candidate so it has all
  settlement booleans true, successful install/approval prerequisites, a
  settled nonzero rebuild exit, and exact valid segment/conditional-marker
  transport.
- Add inverse negatives for successful rebuild plus claimed failure; each
  false runner-settlement boolean; each unsuccessful install/approval
  prerequisite family; rebuild null/zero exit, signal, timeout, and each
  truncation flag; absent/invalid/not-attempted segment transport; and marker
  contradictions. Use repository-owned in-memory canonical data only.
- Extend the static verifier only as needed to bind the pure correlation
  boundary and focused negative surface. Behavioral tests, not source-string
  presence alone, must establish rejection.
- Do not import or execute either fixed container source, a lifecycle entry,
  adapter, probe, transfer wrapper, or production runtime path.

# Preserved boundaries

- Keep the exact generation/run/result/container/volume/image-tag tuple,
  ordered 31-file aggregate and five anchors, fixed M2-A 1/6/0 event contract,
  exact command/environment/layout plan, private inputs, canonical schemas and
  issue vocabulary, historical non-reuse, and evidence non-promotion.
- Keep M2A-TR01/M2A-TR02, M2A-TRI03, M2A-TRR01, and M2A-TRR02 closed. Do not
  change recursively exact own-plan validation, runner all-settled ownership,
  publication-handle settlement, or complete-candidate rules except where a
  regression test is needed to prove preservation.
- Keep the library pure and the backend privately branded fake-only. Do not add
  a child-process import, production backend or entry, argument-free execution
  command, image/context constructor, local image candidate, or candidate
  runtime command.
- Static/unit acceptance does not establish Docker behavior, named-volume
  visibility, npm lifecycle behavior, transport validity, runtime isolation,
  result acceptance, M3 ingestion, profile/matrix/presentation evidence, or an
  `Observed` value.

# Prohibited actions

- No image/context construction, Docker/container/runtime-socket command, npm
  install/pack/approve/rebuild, lifecycle/probe execution, transfer, staging,
  result-root or retained-state access, cleanup, retry, repair, signaling, or
  evidence ingestion/promotion.
- No credentials, host-home/environment inspection, external network, Remote
  Git, publication, deployment, third-party communication, or standing-
  authorization use.

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

Also run focused Prettier checks over only the changed failure-candidate
correlation and status files. Record an aggregate failure without editing
unrelated files, and do not claim root `check` passed unless every stage
actually completed successfully.

# Completion report

- Exact M2A-TRR03 failure-candidate correlation evidence and preservation of
  every previously closed finding
- Exact settlement, npm prerequisite, real rebuild failure, segment, and
  conditional marker traces
- Changed files and commands actually run with observed results
- Intentionally unrun commands, evidence class, remaining runtime/cooperative-
  host limitations, and preserved unrelated work
- One concrete `Next:` task naming the fresh independent Docker-free
  failure-candidate correlation remediation re-review
