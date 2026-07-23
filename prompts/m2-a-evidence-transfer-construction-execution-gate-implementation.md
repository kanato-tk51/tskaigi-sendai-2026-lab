# Goal

Implement only the independently approved frozen-research issue #43 M0/M2-A
construction/execution-gate contract at its Docker-free static/unit boundary.
Realize M2A-CG01 through M2A-CG06 as fixed constructor, image-build plan,
runtime plan, validators, no-argument production entries, and branded fake
backends. Do not acquire npm or constructor-toolchain bytes, construct the
production context or image, call Docker, execute a lifecycle or transfer, or
access runtime/result state.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, and `experiments/AGENTS.md`
- `docs/index.md` and the issue #43 documents routed there
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md`, especially the explicitly resumed/deferred
  high-assurance boundary
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
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-remediation.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation.md`
- the saved contract/remediation prompt chain routed by those review records
- this prompt

# Scope

Production changes are limited to these exact paths from the approved
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
```

Verification changes are limited to:

```text
experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs
tests/m2a-evidence-transfer.test.ts
```

Update only the following contract/status paths as needed to record the
Docker-free implementation evidence and fresh-review handoff:

```text
experiments/npm12-install/README.md
docs/m2-a-evidence-transfer-construction-execution-gate.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
```

The saved implementation/review prompt pair remains unchanged. Preserve all
unrelated accumulated worktree changes.

## Required implementation

### M2A-CG01 — immutable source and acquisition closure

1. Preserve the exact fixed `20260721-01` tuple, ordered 31-row source
   aggregate
   `sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04`,
   and ordered 41-row construction baseline
   `sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526`.
   Recompute both from held no-follow regular-file descriptors before any
   production output. Any row, byte, order, descriptor, path, identity, or
   aggregate drift must fail before construction-root creation.
2. Implement exact canonical validators for the fixed future
   `m2a-transfer-acquisition/v1` npm `12.0.1` receipt/archive pair and the
   fixed future `m2a-transfer-toolchain/v1` receipt/inventory. Require every
   ordered key, scalar, package/version/integrity row, inventory row,
   aggregate, runtime binding, reviewed status, canonical one-line byte, and
   independently bound digest fixed by the contract. Accept no caller path,
   alternate executable/package/version, ordinary `node_modules`, cache,
   home, historical image/result, or network fallback.
3. Keep those future receipts and bytes as prerequisites only. The
   implementation and its tests must not inspect the fixed ignored
   acquisition/toolchain roots. Tests use only repository-owned synthetic
   receipt/archive/toolchain inventories under disposable temporary roots.

### M2A-CG02 — deterministic constructor and construction manifest

1. Implement one fixed construction library and a no-argument production
   constructor entry. Separate pure validation/planning from filesystem and
   process authority. Production authority must be privately branded and
   fixed internally; tests may receive only separately branded fake
   filesystem/process backends and disposable roots. No public API may accept
   arbitrary paths, argv, environment, executable, package, timestamp, mode,
   version, output root, command, or callback.
2. Reproduce the exact private compiler workspace and two ordered compiler
   children from the contract. Bind fixed `/usr/bin/node`, exact argv/cwd,
   empty environment, `shell: false`, 30,000 ms deadline, 65,536-byte combined
   output bound, 250 ms TERM-to-KILL grace, and 1,000 ms final-close deadline.
   Require integer zero exit, null signal, no timeout/truncation, and complete
   all-settled child/output/descriptor ownership before advancing. Unknown
   settlement forbids publication.
3. Build only the exact context inventory. Safely parse the reviewed npm
   archive in process and reject absolute/dot/empty/control paths, duplicate
   rows, links, special/sparse records, unsupported extensions, noncanonical
   or unbound PAX data, truncation, and anything outside the single
   `package/` root. Deterministically create the one-entry fixture tarball in
   process. Admit only the fixed Containerfile/entries, npm tree/CLI,
   package manifests, compiler-produced `dist` trees, consumer manifest, and
   fixture archive named by the contract.
4. Enforce exact `0555` directory modes, `0444` regular modes except the
   exact `0555` npm CLI, one-link regular files, epoch-zero mtimes, lexical
   path order, root containment, and absence of aliases, links, writable
   output, special/sparse files, or extra inventory. The private compiler
   workspace is not a context input and must settle before manifest creation.
5. Generate only canonical `m2a-transfer-construction/v1` bytes with the
   exact ordered schema, compiler-step rows, source/receipt/toolchain
   bindings, lexical inventory, and inventory aggregate. Complete all reads,
   compiler work, validation, second clean derivation, and descriptor closure
   before publication. Publish private `.next` context by the sole directory
   rename, then same-descriptor write/read/sync/close and last-fallible rename
   of the manifest. Never reinterpret retained partial state as success.

### M2A-CG03 — exact offline image-build plan and binding

1. Implement the fixed production build plan with only the contract's exact
   repository-owned `0700` home/config layout, one-link mode-`0600`
   `config.json` bytes, `/usr/bin/docker`, repository cwd, `shell: false`, and
   exact three-key environment. No inherited environment, proxy, registry,
   credential, alternate config/home/path, caller argument, or cleanup path is
   allowed.
2. Bind exactly the five ordered Docker argv arrays and their contract limits:
   version, candidate-tag absence, pinned-base inspect, one offline build, and
   candidate inspect. Preserve the literal format strings, Docker `29.6.1`
   projection, pinned base digest/platform, `--network none`, `--pull=false`,
   no-cache/platform/provenance/SBOM settings, fixed tag/Containerfile/context,
   and complete candidate config projection. The build plan is pure/static in
   this task; no Docker child may be launched.
3. Implement exact canonical `m2a-transfer-image-binding/v1` validation and
   publication only after every known-settled successful step, exact context
   revalidation, one build occurrence, and one exact local `sha256:` candidate
   image ID. The packet must contain only the ordered sanitized bindings fixed
   by the contract. Unknown settlement, output/close drift, tag presence,
   platform/config substitution, or digest drift must remain Inconclusive and
   publish no successful binding. Retain build state on every modeled outcome;
   do not add cleanup or retry.

### M2A-CG04 and M2A-CG05 — exact production occurrence and evidence boundary

1. Implement the fixed no-argument production execution entry around the
   existing transfer validators and exact reviewed image-binding input. Its
   private plan must use the contract's result-root cwd/layout, fixed Docker
   CLI/environment/bounds, exact command order, natural-exit-only rule, and
   immutable one-occurrence/no-retry/no-cleanup policy. No ordinary root
   package script or import path may activate any production entry.
2. Replace the generic future production preflight identity with exactly
   these three ordered rows derived from the same immutable plan row as each
   argv:

   ```text
   absence-volume
   absence-initializer-container
   absence-measurement-container
   ```

   Bind them one-to-one to the fixed volume, initializer-container, and
   measurement-container inspect argv. Reject the old generic spelling,
   swaps, duplicates, omissions, reordering, unknown rows, and correct-name/
   wrong-argv combinations at the production boundary.
3. Before every Docker child, exclusively publish and directory-sync the
   canonical pessimistic `attempt.json` checkpoint for that exact next step.
   The launch is unreachable on checkpoint write/read/sync/close/rename or
   directory-sync failure. After a known child close, settle child, output,
   and every owned descriptor before the next checkpoint. An unknown close
   permits no later Docker, inspect, copy, validation, filesystem publication,
   cleanup, repair, or retry; only the already durable sanitized checkpoint
   remains.
4. Preserve chronological first-issue write-once behavior, exact
   prerequisite states, initializer/measurement natural settlement, and the
   completion-first conditional copy order. Copy only the completion and its
   listed segment/conditional marker to absent fixed destinations, one file
   per known-settled fixed child. Re-run canonical completion, file,
   producer-segment, marker, artifact, attempt, and combined-candidate
   validation before final publication.
5. Keep construction intent, construction manifest, image binding, modeled
   build observation, runtime attempt, reviewed result, and `Observed` as
   distinct evidence classes. Static/unit success must not create an
   acquisition/construction/image/runtime result, accept a candidate, ingest
   M3 evidence, change historical M0/M2-A bytes, or update profile/matrix/
   presentation `Observed`.

### M2A-CG06 — closed test and import boundary

1. Use descriptor-only exact-own-data validation for untrusted records/arrays
   and canonical byte inputs. Reject unknown/missing/reordered keys, accessors,
   symbols, sparse arrays, custom prototypes, Proxy-mediated input, type/range
   drift, noncanonical JSON, extra LF, and mutable caller projections without
   invoking getters, iterators, coercion, or `toJSON`.
2. Keep reusable modules import-safe. The three entry files are the only
   production activators and must statically reject arguments or inherited
   environment outside their exact fixed boundary before side effects. Do not
   import or execute an entry in tests or verification. Static checks must
   prove package scripts/root imports do not reach the entries and that this
   implementation task did not add a runtime command.
3. Add positive fake-only construction, build-plan, execution-plan,
   checkpoint, canonical-byte, and publication models. Add the complete
   inverse matrix required by M2A-CG06: baseline/additive drift; acquisition/
   toolchain/archive/compiler drift; context inventory/publication/late-close
   drift; caller argument/environment; Docker version/base/tag/build/config/
   platform/image substitution; command/deadline/output/settlement drift;
   three absence identity mappings and six failure/unknown outcomes; present
   fixed objects; checkpoint and no-post-unknown reachability; transfer order,
   candidate/result/evidence promotion; retry/cleanup; and import-time effects.
4. Tests may use only repository-owned synthetic archives, in-memory data,
   branded fake backends, and disposable temporary roots that are not the
   fixed acquisition, toolchain, construction, build, or result paths. A
   negative must remain a rejection; do not change implementation inputs to
   force an expected success.

# Out of scope

- Any change to `package.json`, lockfiles, the existing Containerfile,
  transfer manifest, initializer/runner container source, adapter/probe
  source, package manifests, fixture bytes, scenarios, result paths,
  historical evidence, Expected, or `Observed`
- npm or constructor-toolchain acquisition; reading the fixed ignored
  acquisition/toolchain/construction/build/result roots; compiling the
  production context; creating `construction-manifest.json` or
  `image-binding.json`
- Any Docker/container/runtime-socket command, lifecycle/probe/transfer
  execution, production entry import/execution, image build/inspect, retained
  state access, cleanup, repair, retry, signaling, ingestion, result review,
  or evidence promotion
- A package script, arbitrary CLI/API, runtime gate, acquisition gate,
  construction execution gate, candidate local image ID, execution command,
  alternate generation, or later backlog item
- Credentials, host home/environment/cache inspection, external network,
  Remote Git, publication, deployment, or third-party communication

# Constraints

- Preserve the exact reviewed M2A-CG01 through M2A-CG06 contract and the
  M2A-CGR01 through M2A-CGR03 closures. Do not weaken a schema, state,
  settlement, identity, canonical-byte, sanitization, or evidence boundary to
  make tests pass.
- Keep the old M0 result and current transfer implementation facts immutable;
  the approved future production boundary must not claim that the old generic
  absence spelling, current fake state machine, or static plan is already a
  runtime observation.
- Treat every filesystem/process/Docker return as untrusted data and every
  backend method as explicit authority. Snapshot fixed inputs before the first
  callback/await, retain private brands, and preserve first failure and
  all-settled ownership.
- This is cooperative-host static/unit design evidence, not an atomic host/
  daemon transaction, OS sandbox, safe-package proof, or runtime enforcement
  observation.
- Preserve unrelated user and prior-session working-tree changes.

# Deliverables

- The exact M2A-CG01 through M2A-CG06 Docker-free implementation within the
  approved path allowlist
- Focused fake-only/static tests covering every required positive and inverse
  construction, build, execution, checkpoint, transfer, and evidence boundary
- Minimal documentation/status updates that classify the result only as
  Docker-free static/unit evidence
- One handoff to the already saved fresh independent Docker-free review prompt

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

Also run focused Prettier checking over only the implementation allowlist,
this saved prompt pair, and changed status files. Do not run a formatting write
over unrelated dirty files. Record any aggregate failure without editing an
out-of-scope path, and do not claim `npm run check` passed unless every stage
actually completed successfully.

Do not run `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, any production
entry, Docker, npm acquisition/install/pack/approve/rebuild, or any command
that touches fixed ignored runtime state.

# Completion report

- M2A-CG01 through M2A-CG06 implementation status and exact evidence
- Reproduced 31-row/41-row identities, acquisition/toolchain, compiler,
  context/manifest, build/image-binding, runtime/checkpoint, transfer, and
  evidence-class traces
- Changed files and commands actually run with observed results
- Intentionally unrun commands, preserved unrelated work, evidence class, and
  remaining cooperative-host/runtime limitations
- One concrete `Next:` item naming the fresh independent Docker-free review
  under
  `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-review.md`
