# Goal

Remediate only M2A-CGI01 through M2A-CGI04 from frozen-research issue #43's
fresh Docker-free construction/execution-gate implementation review. Close the
exact toolchain/context input set, make the fake image-build and runtime
transactions consume the already reviewed canonical validation boundaries, and
add the fixed private production authorities required behind the three existing
fail-closed entry gates. Do not acquire npm or toolchain bytes, execute a
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

Update only these existing status paths as needed to record remediation evidence
and the fresh re-review handoff:

```text
experiments/npm12-install/README.md
docs/m2-a-evidence-transfer-construction-execution-gate.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
```

This prompt and its paired fresh re-review prompt were saved before remediation
source changes and must remain unchanged during implementation. Preserve every
unrelated accumulated worktree change.

## M2A-CGI01 — exact toolchain and constructed-context input closure

1. Make `validateConstructorToolchain()` accept only the exact lexical union
   of `runtime/`, `packages/typescript/`, `packages/@types/node/`, and
   `packages/undici-types/` rows. Every row must belong to exactly one family;
   reject rows outside the union, prefix aliases, empty families, duplicates,
   reordering, special/link/sparse identities, and independently recomputed
   self-described aggregates that contain an extra or missing row. Preserve the
   exact runtime executable row and the three package aggregate correlations.
2. Close construction-manifest validation over independently established data,
   not a caller's self-consistent projection. Pass separately validated npm
   archive inventory, both compiler-produced package inventories, fixed copied
   input rows, deterministic fixture archive, and the held post-construction
   filesystem inventory into one pure correlation boundary. Derive the complete
   expected context inventory a second time and require exact lexical equality
   of paths, kinds, modes, sizes, hashes, mtimes, link counts, and aggregate.
3. Bind each npm context row to the validated archive row, each `dist` row to
   its settled compiler output, and every fixed Containerfile, entry, package,
   consumer, npm CLI, and fixture row to its held source or deterministic
   derivation. Reject extra, missing, renamed, reordered, aliased, recomputed,
   or source-disconnected context rows at the transaction boundary.
4. Keep the reviewed 31-row and 41-row aggregates, fixed future receipt paths,
   canonical schemas, and `evidenceReview: "not-performed"` unchanged. Tests
   use only repository-owned synthetic bytes and disposable roots; they must
   not inspect the fixed acquisition, toolchain, construction, or result roots.

## M2A-CGI02 — complete image observation-to-binding transaction

1. Make the separately branded fake image-build transaction consume the exact
   value for every one of the five fixed command rows. Represent and validate
   child, stdout/stderr capture, descriptor, deadline, truncation, signal, exit,
   and close settlement required by the reviewed terminal contract; a boolean
   `ok` alone is not a successful observation.
2. Assemble the exact version, tag-absence, pinned-base, one-build, candidate-
   inspect, context-revalidation, and all-descriptors-settled projection only
   after all five known-settled rows. Pass that complete projection through
   `validateImageBuildObservation()` and bind it to the exact reviewed
   construction values.
3. Create canonical `m2a-transfer-image-binding/v1` bytes from the validated
   observation, then immediately pass the same bytes, construction binding,
   and exact projected local `sha256:` ID through
   `validateImageBindingBytes()`. Model successful publication only with those
   returned canonical bytes and only after all barriers. Retain every modeled
   outcome; never add retry or cleanup.
4. Add transaction-level inverse coverage for null or partial candidate
   projection, version/base/tag/platform/config/image drift, repeated or
   skipped build, wrong command value, nonzero/signal/timeout/truncation,
   output/descriptor/close uncertainty, context drift, noncanonical binding,
   validation bypass, and publication failure. Isolated validator tests do not
   substitute for transaction coverage.

## M2A-CGI03 — complete runtime terminal and artifact transaction

1. Replace the fake runtime's collapsed `settlement`/`ok` success shortcut
   with exact child, output-capture, and descriptor settlement records for each
   checkpoint, Docker child, copied file, validation, and final publication
   boundary. A row advances only after every owned component is known settled,
   untruncated, and schema-valid; unknown settlement preserves the already
   durable checkpoint and permits no later action.
2. Cross-bind each wait result to the corresponding final inspect. Initializer
   wait/final exits must be equal and zero. Measurement wait/final exits must
   be equal natural exits and must correlate with the canonical completion,
   npm-step terminal chain, runner settlement, and the sole reviewed nonzero
   failure-candidate rule. Reject mismatches even when both scalars are
   integers and both records claim success.
3. After completion copy, validate exact copied bytes and fixed metadata with
   the canonical completion and transferred-file validators before deriving
   the conditional output list. After segment and optional marker copy, pass
   their exact bytes and metadata through the transferred-file, producer-
   segment, marker, and complete-artifact validators in reviewed order. Null,
   path-only, or boolean payloads are never validation evidence.
4. Construct a canonical attempt only from the established lifecycle and
   transfer state; validate it, then call the combined candidate boundary with
   the exact completion, segment, and optional marker bytes. Permit final
   attempt publication only from that successfully validated combined
   candidate. Preserve chronological first issue, write-ahead checkpoints,
   conditional copy order, no post-unknown action, retention, and no retry or
   cleanup.
5. Add transaction-level inverse coverage for initializer nonzero and wait/
   final mismatch, measurement mismatch, signal/timeout/truncation/close drift,
   missing or malformed copied metadata/bytes, output-list substitution,
   segment/marker hash or event mismatch, null validation payloads, validator
   bypass, premature final publication, publication settlement uncertainty,
   and later action after first failure or unknown settlement.

## M2A-CGI04 — fixed private production authorities behind closed gates

1. Implement the complete fixed production filesystem/process authorities
   required by the reviewed constructor, offline image-build, and runtime
   transactions. They may expose no caller-selected path, argv, environment,
   executable, callback, backend, root, package, image, timestamp, mode,
   command, retry, or cleanup input. Keep their brands private and distinct
   from every test-fake brand.
2. The constructor authority must use only the fixed acquisition/toolchain/
   source/construction paths and the reviewed descriptor, compiler-child,
   archive, inventory, second-derivation, sync, close, and sole-publication
   transaction. The build authority must use only the exact private `0700`/
   `0600` layout, credential-empty config, fixed `/usr/bin/docker`, three-key
   environment, five command rows, and binding transaction. The runtime
   authority must use only the fixed result-root layout, exact command rows,
   write-ahead checkpoints, settled conditional copies, canonical validators,
   and final candidate transaction.
3. Connect each existing no-argument entry to its corresponding production
   authority only after all immutable review digests and approval booleans for
   that phase have passed. Keep all currently unknown digests `null`, both
   execution approvals `false`, and all `evidenceReview` values
   `not-performed`; current entry calls must still fail before authority
   creation or any filesystem/process action.
4. Production authority constructors and brands must not be exported through
   reusable libraries, declarations, package scripts, or tests. Reusable module
   import remains side-effect-free. Tests must not import or execute an entry;
   use separately branded fakes plus static source/reachability assertions to
   prove the fixed production implementation exists behind the gates.
5. Add static and behavioral negatives for fake/production brand confusion,
   entry argument or inherited-environment drift, missing review bindings,
   phase-order bypass, public production reachability, import-time activation,
   and any attempt to make a production authority reachable while current
   review constants remain closed.

# Preserved boundaries

- Preserve M2A-CGR01 through M2A-CGR03 at contract scope, the exact
  `20260721-01` tuple, both reviewed source aggregates, all canonical schemas,
  three child-specific absence identities, first-issue/no-post-unknown rules,
  and M2A-TR01 through M2A-TR06 at their prior static/unit scope.
- Do not change `package.json`, lockfiles, Containerfile, transfer manifest,
  initializer/runner sources, adapter/probe source, package manifests,
  fixtures, scenarios, historical/results, Expected, or `Observed` bytes.
- Do not fill an unknown acquisition/toolchain digest, local image ID, or
  approval boolean. Do not add an acquisition, construction, build, or runtime
  package script or command.
- Passing remediation tests remain Docker-free static/unit and cooperative-
  host evidence. They do not establish npm acquisition, compiler/filesystem
  publication, Docker behavior, image identity, lifecycle behavior, named-
  volume transfer, result validity, runtime enforcement, or `Observed`.

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

Also run focused Prettier checking over the exact remediation allowlist, this
saved prompt pair, and changed status files. Do not format or repair unrelated
dirty files. Record an aggregate failure without editing an out-of-scope path,
and do not claim `npm run check` passed unless every stage completes.

Do not run `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, a production entry,
Docker, npm acquisition/install/pack/approve/rebuild, or any command that
touches fixed ignored runtime state.

# Completion report

- Closure evidence for M2A-CGI01 through M2A-CGI04 and resulting M2A-CG01
  through M2A-CG06 implementation status
- Exact toolchain/context, image observation/binding, runtime terminal/
  artifact/candidate, private-authority, allowlist/import, and evidence-class
  traces
- Changed files and commands actually run with observed results
- Intentionally unrun commands, preserved unrelated work, remaining
  cooperative-host/runtime limitations, and evidence class
- One concrete `Next:` task naming the fresh independent Docker-free re-review
  under
  `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation-review.md`
