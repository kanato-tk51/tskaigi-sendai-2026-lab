# Goal

Remediate only residual M2A-CGI02 through M2A-CGI04 from frozen-research
issue #43's fresh Docker-free construction/execution-gate implementation-
remediation re-review. Make every image-build row fail closed before the next
phase, require exact runtime settlement discriminators and branch shapes, and
complete the reviewed fixed private constructor/image/runtime authority
transactions. Do not reopen closed M2A-CGI01, acquire npm or toolchain bytes,
execute a production entry, construct a production context or image, call
Docker, run a lifecycle or transfer, or access runtime/result state.

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
- `prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`
- `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation-review.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`
- this prompt

# Scope

Implementation and verification changes remain limited to the unchanged
M2A-CG06 allowlist:

```text
experiments/npm12-install/scripts/m2a-transfer-construction.mjs
experiments/npm12-install/scripts/m2a-transfer-construction.d.mts
experiments/npm12-install/scripts/m2a-transfer-production.mjs
experiments/npm12-install/scripts/m2a-transfer-production.d.mts
experiments/npm12-install/scripts/construct-m2a-transfer-context.mjs
experiments/npm12-install/scripts/build-m2a-transfer-image.mjs
experiments/npm12-install/scripts/execute-m2a-transfer.mjs
experiments/npm12-install/scripts/m2a-transfer-lib.mjs
experiments/npm12-install/scripts/m2a-transfer-lib.d.mts
experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs
tests/m2a-evidence-transfer.test.ts
```

Update only these existing status paths as needed to record remediation
evidence and the fresh re-review handoff:

```text
experiments/npm12-install/README.md
docs/m2-a-evidence-transfer-construction-execution-gate.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
```

This prompt and its paired fresh re-review prompt were saved before residual
remediation source changes and must remain unchanged during implementation.
Preserve every unrelated accumulated worktree change.

## Closed M2A-CGI01 boundary

Preserve the exact four-family toolchain inventory union and the separately
derived, held complete-context correlation already accepted by the re-review.
The 31-row and 41-row aggregates, exact npm/toolchain/context closure, canonical
schemas, fixed tuple, and M2A-CG06 allowlist do not change. A shared helper
change needed for M2A-CGI02 through M2A-CGI04 must retain the accepted extra,
missing, reordered, aliased, sparse, unsettled, and source-disconnected input
rejections; do not redesign or broaden M2A-CGI01.

## M2A-CGI02 — validate each image-build row before the next phase

1. In both `runM2aImageBuildForTest()` and the fixed production image-build
   authority, consume each fixed command result through one step-specific
   terminal-and-value validator immediately after that child settles and before
   the next command may launch. The exact order remains `docker-version`,
   `candidate-tag-absence`, `pinned-base-inspect`, `offline-build`, then
   `candidate-inspect`; do not collect unvalidated values for a later batch
   decision.
2. `docker-version` must establish the exact settled terminal and exact client/
   server projection before tag absence. Tag absence must establish the exact
   settled absence terminal and unambiguous absent value before base inspect.
   Pinned-base inspect must establish its exact settled terminal and complete
   reviewed base projection before `offline-build`. Any known-invalid or
   settlement-unknown value in those first three rows forbids the build child.
3. `offline-build` must establish the exact settled terminal, one occurrence,
   and successful held-context revalidation before candidate inspect.
   Candidate inspect must establish the exact settled terminal, complete local
   image projection, and all-descriptors-settled barrier before the complete
   observation may be assembled. A known-invalid build row forbids candidate
   inspect; a known-invalid candidate row forbids binding publication.
4. Preserve the complete `validateImageBuildObservation()` and canonical
   `m2a-transfer-image-binding/v1` correlation after the row-local barriers.
   Publish only the same bytes returned by `validateImageBindingBytes()` after
   exact settled publication. Unknown settlement remains Inconclusive; known
   invalid data fails closed. Neither branch may launch a later action, retry,
   cleanup, or alternate command.
5. Add transaction-level inverse coverage, not only isolated validator tests.
   At minimum, the controlled first-row `timedOut: true` case must leave the
   fake action log exactly `docker-version`; invalid tag-absence or base rows
   must not contain `offline-build`; an invalid build row must not contain
   `candidate-inspect`; and invalid candidate/binding/publication rows must not
   publish success. Cover terminal, parsed-value, context, occurrence,
   descriptor, canonical-byte, and settlement uncertainty for every row.

## M2A-CGI03 — exact runtime settlement domains and branch shapes

1. Make checkpoint publication, marker-parent publication, final publication,
   and validation settlement accept only the literal discriminators `settled`
   and `unknown`. Reject every other primitive or object value before it can
   advance, publish, launch a child, create a marker parent, or report final
   success. The controlled literal `forged-success` must reject at each
   affected barrier.
2. Keep exact own-key checks and bind the complete branch shape. Validation
   `unknown` is exactly `valueSha256: null`, `bytesClosed: false`, and
   `metadataClosed: false`; validation `settled` requires a syntactically valid
   digest plus boolean close fields and is complete only when the digest equals
   the expected bytes and both closes are true. Publication `unknown` is
   exactly `committed: false`, `bytesMatched: false`,
   `descriptorsClosed: false`, and `directorySynced: false`; publication
   `settled` requires four boolean fields and is complete only when all are
   true. Reject unknown records that claim any completed subfield and reject
   non-boolean, missing, extra, accessor, inherited, or custom-prototype data.
3. Preserve the existing known-settled failure path: an exact `settled` record
   with any false validation/publication condition is a known failure, not
   success and not an invented third settlement. Preserve the write-ahead
   checkpoint, chronological first issue, no-post-unknown, conditional-copy,
   combined-candidate, retention, no-retry, and no-cleanup boundaries.
4. Add transaction-level inverses for forged, null, numeric, missing, extra,
   contradictory unknown, and type-drift settlement records at checkpoint,
   completion/segment/marker validation, marker-parent preparation, and final
   publication. Prove the exact action suffix and that no later child,
   validation, marker preparation, or publication is reachable after rejection
   or unknown settlement.

## M2A-CGI04 — complete fixed private production transactions

### Constructor authority

1. Before the first directory or output is created, open with no-follow
   semantics, register ownership of, read, and identity-revalidate the complete
   reviewed tracked/acquisition/toolchain input set. Every toolchain inventory
   row must be consumed. Bind `runtime/constructor-node` to the fixed
   `/usr/bin/node` executable and bind every other receipt-listed runtime and
   package row to its one fixed toolchain location; verify exact regular-file
   type, one-link identity, mode, size, digest, and the receipt's runtime and
   package aggregates. Do not skip the `runtime/` family or resolve a path from
   ordinary `node_modules`, home, cache, caller input, environment, or network.
2. Register every opened descriptor for close settlement before its first
   fallible post-open operation. Hold and revalidate the complete input
   identities until their last use, and settle the complete descriptor set
   before publication. Construction-root or workspace creation is forbidden
   until the entire source/acquisition/toolchain input closure has been
   established.
3. After `compile-probe-core`, require its exact zero/null/no-timeout/no-
   truncation/child-output-descriptor-close terminal before reading or copying
   its output and before launching `compile-npm-lifecycle-probe`. Require the
   second compiler's same exact terminal before reading its output or entering
   context/manifest publication. A known failure or unknown settlement permits
   no later compiler, output read, context step, or publication.

### Compiler and Docker process settlement

4. Give both fixed compiler children and every fixed Docker CLI child a final
   settlement bound that does not depend on receiving `exit`. Preserve the
   fixed primary deadline, 250 ms TERM-to-KILL grace, and 1,000 ms final-close
   bound. On deadline, attempt TERM; after the fixed grace, attempt KILL; after
   the fixed final-close interval, resolve an explicit unknown settlement even
   if neither `exit` nor `close` arrived. A normal `exit` without `close` is
   also bounded by the same 1,000 ms close interval. Clear all timers exactly
   once on settled close/error/unknown, retain the first terminal cause, and
   never report success without known child/output/descriptor close.
5. Preserve the exact fixed executable, argv, cwd, empty or three-key
   environment, `shell: false`, output limit, signal order, and no-retry/
   no-cleanup plan. Signal-delivery failure, synchronous spawn failure,
   asynchronous error, late exit/close, output overflow, and descriptor-close
   uncertainty remain fail-closed and cannot reach a later phase.

### Image-build and runtime authorities

6. Apply M2A-CGI02's immediate row-local terminal/value validation to the
   production image authority itself. The first three complete validated rows
   are prerequisites for `offline-build`; the validated build row is a
   prerequisite for candidate inspect; the validated candidate row and full
   canonical observation are prerequisites for same-byte binding publication.
7. In the runtime authority, exclusively create and retain no-follow directory
   descriptors for the fixed result root and `transfer/` directory. Bind the
   repository/result ancestors plus both directories by exact type, effective
   owner, full mode, one-link identity, and stable BigInt device/inode/size/
   mtime identity before and after every checkpoint, Docker copy, copied-file
   validation, marker-parent operation, and final publication. Register every
   handle for all-settled release before its first fallible post-open check.
8. At every phase, enumerate only through the held directories and require the
   exact current in-progress inventory. The result root may contain only held
   `transfer/`, canonical `attempt.json`, and the single transient
   `attempt.next` during its write transaction. The transfer tree may contain
   only the already completed exact copy destinations and, iff completion
   requires it, the held `probe-output/` parent at the reviewed phase. Reject
   extra, missing, reordered, replaced, aliased, symlink, special, owner, mode,
   link, ancestor, or identity drift before the next operation.
9. Implement every checkpoint and final write through the held result identity:
   exclusive mode-`0600` `attempt.next`, same-descriptor write/sync/reread byte
   equality, known close settlement, rename over `attempt.json`, and held
   result-directory sync. After each known `docker cp` close, open the one exact
   absent destination no-follow beneath the held transfer identity, validate
   bytes and metadata through that same descriptor, and settle it before the
   next checkpoint. Create and hold `transfer/probe-output/` only after a
   validated completion requires the marker.
10. If a Docker child settlement is unknown, perform no later Docker action,
    copy, validation, path publication, retry, cleanup, or repair. Settle only
    already owned local handles through their registered release barrier and
    retain the already synced pessimistic checkpoint. Known failures may
    publish only their exact reviewed first issue after every owned child,
    output, file, and directory handle is known settled.

### Private reachability and focused evidence

11. Keep all three production constructors and brands private, distinct from
    fake brands, absent from declarations/exports/package scripts/tests, and
    reachable only behind the unchanged no-argument entry gates. All future
    digests and local image ID remain `null`, build/runtime approvals remain
    `false`, and every `evidenceReview` remains `not-performed`; current entry
    calls must still fail before authority creation or filesystem/process
    activity. Do not import or execute an entry to test this.
12. Extend separately branded fake behavioral coverage and static source/
    reachability checks for the complete constructor input hold, compiler phase
    barrier, absolute no-exit settlement bound, immediate production build-row
    barriers, held result/transfer identities, exact phase inventories,
    same-descriptor publication/copy validation, and post-unknown suppression.
    Marker-only assertions and positive fake results do not close the finding.

# Preserved boundaries

- Preserve M2A-CGI01 closed, M2A-CGR01 through M2A-CGR03 closed at contract
  scope, the exact `20260721-01` tuple, both reviewed source aggregates, all
  canonical schemas, three child-specific absence identities, first-issue/no-
  post-unknown rules, and M2A-TR01 through M2A-TR06 at their prior static/unit
  scope.
- Do not change `package.json`, lockfiles, Containerfile, transfer manifest,
  initializer/runner sources, adapter/probe source, package manifests,
  fixtures, scenarios, historical/results, Expected, or `Observed` bytes.
- Do not fill an unknown acquisition/toolchain/context/image digest, local
  image ID, or approval boolean. Do not add an acquisition, construction,
  build, or runtime package script or command.
- Passing residual-remediation tests remain Docker-free static/unit and
  cooperative-host evidence. They do not establish npm/toolchain acquisition,
  compiler/filesystem publication, Docker behavior, image identity, lifecycle
  behavior, named-volume transfer, result validity, runtime enforcement, or
  `Observed`.

# Prohibited actions

- No npm/toolchain acquisition or fixed ignored-root read; no production entry,
  compiler, constructor, context/manifest publication, image build/inspect,
  Docker/runtime-socket action, lifecycle/probe/transfer, result validation,
  retained-state access, cleanup, retry, repair, signaling, ingestion, or
  evidence promotion.
- No credentials, host-home/environment/cache inspection, external network,
  Remote Git, publication, deployment, third-party communication, or standing-
  authorization use.
- Do not import or execute either container source or any production entry as a
  test shortcut.

# Verification

Run only the approved Docker-free checks:

```sh
npm run m2a:transfer:verify
npm run m2a:verify
npm run typecheck
npm test
npm run check
git diff --check
```

Also run focused Prettier checking over the exact residual-remediation
allowlist, this saved prompt pair, and changed status files. Do not format or
repair unrelated dirty files. Record an aggregate failure without editing an
out-of-scope path, and do not claim `npm run check` passed unless every stage
completes.

Do not run `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, a production entry,
Docker, npm acquisition/install/pack/approve/rebuild, or any command that
touches fixed ignored runtime state.

# Completion report

- Closure evidence for residual M2A-CGI02 through M2A-CGI04, preservation of
  M2A-CGI01, and resulting M2A-CG01 through M2A-CG06 implementation status
- Exact row-local image-build, settlement-domain, constructor/process, held
  result/transfer, allowlist/import, and evidence-class traces
- Changed files and commands actually run with observed results
- Intentionally unrun commands, preserved unrelated work, remaining
  cooperative-host/runtime limitations, and evidence class
- One concrete `Next:` task naming the fresh independent Docker-free re-review
  under
  `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation-review.md`
