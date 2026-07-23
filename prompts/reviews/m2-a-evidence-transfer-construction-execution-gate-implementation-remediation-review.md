# Goal

Perform a fresh independent Docker-free read-only re-review of only frozen-
research issue #43's M2A-CGI01 through M2A-CGI04 implementation remediation.
Decide whether the exact toolchain/context input set, image observation-to-
binding transaction, runtime terminal/artifact transaction, and fixed private
production authorities close M2A-CG01 through M2A-CG06 at implementation scope.
Do not repair source or tests, acquire npm or toolchain bytes, execute a
production entry, construct a production context or image, call Docker, run a
lifecycle or transfer, or access runtime/result state.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, and `experiments/AGENTS.md`
- `docs/index.md` and the issue #43 documents routed there
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
- every issue #43 transfer implementation/remediation review routed by
  `docs/index.md`
- `docs/m2-a-evidence-transfer-construction-execution-gate.md`
- all construction/execution-gate contract review and remediation records
- `prompts/m2-a-evidence-transfer-construction-execution-gate-implementation.md`
- `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-review.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation.md`
- `prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`
- every changed implementation, declaration, verification, and status path in
  the remediation prompt's exact allowlist
- this prompt

# Review target

Review only the M2A-CGI01 through M2A-CGI04 remediation diff and its minimal
status records. Treat implementation summaries, reported command passes,
source marker names, and positive fake results as claims to reproduce. Do not
edit implementation, declaration, verification, prompt, package, fixture,
scenario, result, Expected, or `Observed` paths. Preserve every unrelated
accumulated worktree change and immutable earlier review record.

The only permitted repository writes are:

- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`
  for the fresh re-review decision; and
- minimal status/handoff updates in
  `docs/m2-a-evidence-transfer-construction-execution-gate.md`,
  `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`.

## Required finding decisions

### M2A-CGI01 — exact input closure

1. Reproduce the fixed 31-row and 41-row aggregates. Submit the original
   controlled toolchain receipt with one `unbound/extra-input.bin` row and
   recomputed self-described aggregates; it must now reject. Exercise extra,
   missing, duplicate, reordered, prefix-alias, empty-family, special/link/
   sparse, runtime-executable, and package-aggregate contradictions.
2. Trace the complete expected context inventory back to separately validated
   npm archive rows, both compiler-produced inventories, every fixed copied
   input, the deterministic fixture archive, and held post-construction
   filesystem rows. Confirm a second derivation compares the entire lexical
   identity set and is not supplied by the same caller projection it validates.
3. Recompute a manifest aggregate after changing, adding, removing, aliasing,
   or reordering an otherwise permitted context row. Confirm every case rejects
   at the combined correlation boundary even when canonical bytes and all
   self-described aggregates agree.

### M2A-CGI02 — image observation and canonical binding

1. Trace each of the five fake build command results through exact child,
   output, descriptor, deadline, truncation, exit/signal, and close settlement
   into the complete build observation. Confirm boolean success or known
   settlement without the required value cannot advance.
2. Reproduce the original null candidate-inspect contradiction and inverse
   version/base/tag/platform/config/image/context/occurrence cases through the
   transaction. Confirm `imageBindingPublished` cannot become true and no
   successful binding bytes are returned on any invalid or unknown family.
3. For the positive fake transaction, independently pass the assembled
   observation through `validateImageBuildObservation()`, reproduce the exact
   canonical `m2a-transfer-image-binding/v1` bytes, and pass those same bytes,
   construction binding, and projected local image ID through
   `validateImageBindingBytes()`. Confirm publication occurs only after every
   settled barrier and preserves retention/no-retry/no-cleanup.

### M2A-CGI03 — runtime terminal, copied artifacts, and final candidate

1. Reproduce the original mismatched initializer wait `9`/final `8` and null
   segment/marker validation-payload contradiction through the full fake
   transaction. It must reject before final publication. Exercise initializer
   nonzero, measurement wait/final mismatch, signal, timeout, truncation,
   child/output/descriptor close uncertainty, and post-unknown reachability.
2. Trace exact completion-copy bytes and metadata through completion and
   transferred-file validation, then exact segment/optional-marker bytes and
   metadata through transferred-file, producer-segment, marker, and artifact
   validation. Reject a path list, null payload, boolean validation claim,
   missing artifact, metadata drift, event/hash mismatch, or conditional-copy
   contradiction at transaction scope.
3. Confirm initializer wait/final equality and zero, measurement natural-exit
   equality and completion correlation, chronological first issue, durable
   prechild checkpoint, and completion-first conditional copy order. No child,
   filesystem validation, publication, retry, or cleanup may occur after an
   unknown or first terminal failure beyond the exact reviewed failure path.
4. Independently reproduce the canonical attempt and combined candidate from
   the positive transaction's exact bytes. Confirm `finalPublished` is reachable
   only from that validated combined candidate and not from separately valid or
   self-asserted attempt/completion/artifact fragments.

### M2A-CGI04 — fixed private production authority

1. Statically trace each no-argument entry after its immutable digest/approval
   guards into a complete constructor, build, or runtime authority. Confirm the
   authority fixes every path, argv, cwd, environment, executable, process
   bound, filesystem mode, identity, sync/close rule, validation sequence,
   retention, and no-retry/no-cleanup rule required by the reviewed contract.
2. Confirm production authority brands and constructors are private, distinct
   from fake brands, absent from declarations/public exports/package scripts,
   and unreachable from tests or ordinary imports. Reusable imports must remain
   side-effect-free; no test or static verifier may import or execute an entry.
3. Confirm all future digests and image IDs remain `null`, approvals remain
   `false`, and evidence review remains `not-performed`. Use static control-flow
   and import-reachability evidence to prove current entry calls fail before
   authority creation or filesystem/process activity. Do not call an entry to
   prove this.
4. Reject fake/production brand substitution, caller argument/environment/
   backend injection, missing gate values, phase-order bypass, and public
   production reachability. Confirm the remediation added implementation only,
   not acquisition bytes, a context/image/result, runtime command, or execution
   authority approval.

### Preserved M2A-CG05/M2A-CG06 and repository boundaries

1. Compare every changed path to the unchanged M2A-CG06 implementation and
   verification allowlist. Confirm package scripts, lockfiles, Containerfile,
   manifest, container sources, adapter/probe sources, package manifests,
   fixtures, scenarios, fixed ignored roots, historical evidence, Expected,
   and `Observed` did not change in the remediation.
2. Reproduce descriptor-only exact-own-data rejection, canonical-byte handling,
   private snapshots/brands, import safety, evidence non-promotion, and the
   complete new transaction-level inverse matrix. Do not accept marker-only
   static assertions as behavioral closure of a transaction finding.
3. Confirm M2A-CGR01 through M2A-CGR03 remain closed at contract scope and
   M2A-TR01 through M2A-TR06 remain closed only at their earlier static/unit
   scope. Construction intent, fake observations, candidate bytes, reviewed
   result, M3 ingestion, matrix/profile/presentation evidence, and `Observed`
   remain distinct.

# Review method and safety boundary

- Inspect the complete remediation diff, actual state/data correlations,
  declaration surface, static verifier, and focused tests. Independently run
  controlled in-memory contradictions for all four findings; do not infer
  closure from names, prose, or isolated validator tests.
- Use only repository source, in-memory calculations, separately branded fake
  backends, and repository-owned disposable test roots. Never use a fixed
  acquisition, toolchain, construction, build, runtime, or result root.
- Do not import or execute a production entry or either container source. Do
  not acquire npm/toolchain bytes, compile/construct for production, call
  Docker/runtime sockets, run a lifecycle/probe/transfer, inspect retained or
  result state, clean up, retry, repair, signal, ingest, or promote evidence.
- Do not access credentials, host home/environment/cache, external network,
  Remote Git, publication, deployment, or third-party communication. Standing
  authorization is not needed or used for this Docker-free read-only review.

# Decision boundary

The maximum positive decision closes M2A-CGI01 through M2A-CGI04 and M2A-CG01
through M2A-CG06 only at the Docker-free static/unit implementation boundary.
It may permit only a later separately reviewed acquisition, construction, and
image-build sequence under the existing contract. It does not acquire bytes,
approve external communication, execute a production entry, construct a
context or image, choose a local image ID, call Docker, approve a runtime
occurrence, access a result, accept evidence, ingest M3, or promote any
`Observed` value. A blocked decision must assign only the smallest remaining
M2A-CGI remediation and keep every later issue #43 gate frozen.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`
  with an `APPROVED` or `BLOCKED` decision, M2A-CGI01 through M2A-CGI04 and
  M2A-CG01 through M2A-CG06 status, exact contradiction/positive traces,
  changed-path identities, commands run, evidence class, limitations, and one
  permitted next boundary
- Minimal authoritative status updates only after the decision
- One concrete `Next:` item

# Verification

Run only the Docker-free checks needed to reproduce the remediation claims:

```sh
npm run m2a:transfer:verify
npm run m2a:verify
npm run typecheck
npm test
npm run check
git diff --check
```

Also run focused Prettier checking over the exact remediation allowlist, the
saved remediation prompt pair, the new review record, and changed status
files. Record an aggregate failure without editing unrelated files. Never claim
a check passed unless it actually exited successfully.

Do not run `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, a production entry,
Docker, npm acquisition/install/pack/approve/rebuild, or any command that
touches fixed ignored runtime state.

# Completion report

- Re-review decision and M2A-CGI01 through M2A-CGI04/M2A-CG01 through
  M2A-CG06 status
- Independently reproduced toolchain/context, build observation/binding,
  runtime terminal/artifact/candidate, private production authority,
  allowlist/import, and evidence-class boundaries
- Changed files and commands actually run with observed results
- Intentionally unrun commands, remaining cooperative-host/runtime
  limitations, and preserved unrelated work
- If approved, the smallest separately reviewed acquisition/construction/image
  gate without claiming external-network, Docker, runtime, or result authority;
  if blocked, the exact smallest M2A-CGI remediation
- One concrete `Next:` task
