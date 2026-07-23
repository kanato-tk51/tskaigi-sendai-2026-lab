# Goal

Remediate only M2A-TRI01 through M2A-TRI04 from frozen-research issue
#43's fresh Docker-free M0/M2-A evidence-transfer implementation review.
Complete the fixed host command/environment construction, make initializer and
completion-publication descriptor settlement fail closed, reject unsuccessful
npm child terminals from `complete`, and close the canonical attempt state
machine and issue vocabulary. Preserve the fixed `20260721-01` tuple,
M2A-TR01/M2A-TR02 closure, M2A-TR06 allowlist, historical evidence, and every
runtime gate.

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
- this prompt

# Exact remediation boundary

Production changes are limited to these existing M2A-TR06 paths:

- `experiments/npm12-install/container/initialize-m2a-volume.mjs`
- `experiments/npm12-install/container/run-m2a-transfer.mjs`
- `experiments/npm12-install/scripts/m2a-transfer-lib.mjs`
- `experiments/npm12-install/scripts/m2a-transfer-lib.d.mts`

Verification changes are limited to:

- `experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs`
- `tests/m2a-evidence-transfer.test.ts`

Update only `docs/m2-a-evidence-transfer-contract.md`,
`docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
`docs/milestones.md`, and `docs/frozen-research-execution-plan.md` as minimal
remediation-status and handoff records. The saved remediation/re-review prompt
pair may remain as documentation. Do not change `package.json`, the transfer
manifest, Containerfile, adapter/probe source, fixtures, result paths, scenario
definitions, or any other implementation or verification path.

# Required remediation

## M2A-TRI01 — complete fixed host construction

1. Expand `createFixedDockerPlan()` so it contains and strictly validates the
   complete immutable argv plan for the volume and both containers:
   absence inspection, volume create, create, pre-start inspect, start, wait,
   final inspect, completion copy, and the two conditional output copies.
   Use exactly these non-create/non-copy argv families, substituting only the
   already fixed constant shown by each role:

   ```text
   volume absence:       volume inspect <fixed-volume>
   initializer absence:  container inspect <fixed-initializer>
   measurement absence:  container inspect <fixed-measurement>
   initializer inspect:  container inspect <fixed-initializer>
   initializer start:    start <fixed-initializer>
   initializer wait:     wait <fixed-initializer>
   measurement inspect:  container inspect <fixed-measurement>
   measurement start:    start <fixed-measurement>
   measurement wait:     wait <fixed-measurement>
   ```

   Pre-start and final inspection are separate immutable plan fields even
   though their argv bytes are equal. Keep the already implemented full
   volume-create, two create, and three file-copy arrays byte-for-byte unless
   an exact finding requires their validator to become stricter.
   Every argv must use the fixed image ID, generation, container/volume names,
   run-root paths, security/resource/mount policy, and exact file sources and
   destinations already fixed by the contract. No directory, wildcard,
   archive, log, attach, exec, cleanup, retry, restart, caller-selected value,
   or fallback command may appear.
2. Replace the environment-name-only projection with one immutable exact CLI
   environment with exactly these logical values and insertion order:

   ```text
   DOCKER_CONFIG=experiments/npm12-install/.work/m2a-transfer-20260721-01/docker-config
   HOME=experiments/npm12-install/.work/m2a-transfer-20260721-01/home
   PATH=/usr/bin:/bin
   ```

   Bind the pre-first-command state to exclusively created mode-`0700` empty
   home and Docker-config directories below the fixed repository-owned work
   root. Reject every substituted value, extra/inherited key, `DOCKER_*`
   variable, credential file, symlink, non-directory, non-empty inventory,
   owner/mode drift, and unresolved or outside-repository layout. This remains
   a pure construction and validation description; do not create the
   directories or add a host backend.
3. Make tests compare every entire argv/environment record, not selected
   substrings or fake step names. Preserve `/usr/bin/docker`, `shell: false`,
   the 16,384-byte combined output ceiling, fixed deadlines, and
   `executionApproved: false` as non-executable plan data.

## M2A-TRI02 — truthful descriptor settlement

1. Make every successfully opened initializer or runner descriptor enter
   deterministic close settlement, and await every close exactly once. A
   close failure must remain terminal and must never be caught and discarded.
2. Do not construct `runnerSettlement.descriptorsClosed: true` before the
   descriptors needed by completion publication have settled. Preserve the
   canonical-name commit, private `.next` behavior, stable descriptor/path
   identity checks, and no repair/cleanup/retry rule. If a late publication or
   initializer close fails after a visible rename, the process must fail
   closed and the host candidate state must remain Inconclusive; neither a
   zero exit nor a valid-success attempt may be fabricated from the committed
   path.
3. Add source-order/static negatives for initializer and runner close
   failure, ignored-close removal, descriptor ownership before later fallible
   work, canonical commit ordering, and absence of a success return after an
   unsettled close. Do not import or execute either container source.

## M2A-TRI03 — exact complete npm terminal

1. For each install, approve-scripts, and rebuild row, `status: "complete"`
   requires a child `close`, integer exit code `0`, `signal: null`,
   `timedOut: false`, `stdoutTruncated: false`, and
   `stderrTruncated: false`, in addition to the existing approval and lock
   correlations. The fixed runner must classify every deviation through an
   existing sanitized Inconclusive issue rather than continue toward success.
2. Keep unsuccessful scalar terminals representable only in bounded
   Inconclusive completion records. Do not drop the scalars, rewrite an
   operation failure as success, serialize output bytes, or add a retry.
3. Add table-driven negatives covering timeout, signal, stdout truncation,
   stderr truncation, null/nonzero exit, and contradictory approval/lock state
   at all three npm steps.

## M2A-TRI04 — closed canonical attempt state machine

1. Define one closed sanitized attempt-issue vocabulary and exact compatible
   state-step pairs. Reject arbitrary backend `value.code` strings, paths,
   messages, duplicate issue rows, reordered rows, an issue for an unperformed
   or earlier-displaced step, and every code/step mismatch. The chronological
   first failure remains write once and later settlement facts may not replace
   it.
2. Cross-validate initializer settlement, measurement settlement,
   `naturalExit`, completion/segment/marker transfer states, performed-step
   order, output inventory, and issues as one prerequisite chain. Measurement
   work requires initializer natural exit zero; final measurement exit must
   match wait; natural measurement exit is required before any copy; valid
   completion is required before conditional copies; segment is required for
   complete transport; marker transfer must match the segment's write event;
   and no state after an unknown or failed terminal may be represented as
   attempted or valid.
3. Preserve retained objects, candidate-only classification,
   `evidenceReview: "not-performed"`, no execution approval, and the fixed
   natural nonzero measurement failure-candidate distinction. Add the complete
   M2A-TR06 negative matrix for initializer extra entry, every unknown
   settlement family, early/extra/reordered transfer, parent/file identity and
   special-bit/owner drift, first-failure displacement, arbitrary issue data,
   retry/restart/cleanup, stdout/log fallback, result promotion, and broad
   production reachability.

# Preserved boundaries

- Keep the exact generation/run/result/container/volume/image-tag tuple,
  ordered 31-file aggregate and five anchors, fixed M2-A 1/6/0 event contract,
  private input policy, completion/segment/marker schemas, and historical M0
  bytes unchanged.
- Keep the library pure and the backend privately branded fake-only. Do not
  add child-process imports, a production backend, public production entry,
  argument-free execution command, or image/construction candidate.
- Static/unit acceptance does not establish Docker behavior, named-volume
  visibility, npm lifecycle behavior, transport validity, runtime isolation,
  result acceptance, M3 ingestion, profile/matrix evidence, presentation
  evidence, or any `Observed` value.

# Prohibited actions

- No image/context construction, Docker/container/runtime-socket command,
  npm install/pack/approve/rebuild, lifecycle/probe execution, transfer,
  staging, result-root or retained-state access, cleanup, retry, repair,
  signaling, or evidence ingestion/promotion.
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

Also run focused Prettier checks over only the changed remediation/status
files. Record an aggregate failure without editing unrelated files, and do not
claim root `check` passed unless every stage actually completed successfully.

# Completion report

- M2A-TRI01 through M2A-TRI04 remediation evidence and preservation of
  M2A-TR01/M2A-TR02
- Exact command/environment, descriptor settlement, complete-child terminal,
  and canonical attempt-state traces
- Changed files and commands actually run with observed results
- Intentionally unrun commands, evidence class, remaining runtime/cooperative-
  host limitations, and preserved unrelated work
- One concrete `Next:` task naming the fresh independent Docker-free
  remediation re-review
