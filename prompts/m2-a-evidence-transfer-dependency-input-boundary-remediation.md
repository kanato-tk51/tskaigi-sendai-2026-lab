# Goal

Remediate only M2A-IBR01 through M2A-IBR03 in frozen-research issue #43's
Docker-free npm-acquisition/constructor-toolchain dependency-input contract.
Produce one internally exact contract ready for a fresh independent read-only
re-review. Do not implement or execute either input producer, acquire or
inspect future input bytes, construct a context or image, call Docker, or
access runtime/result state.

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
prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation-review.md
```

Resolve the three findings as one contract-only state-machine repair:

1. Preserve M2A-IB01/M2A-IB02 exactly at their closed contract scope. Preserve
   generation `20260721-01`, every fixed input/construction/result path, both
   tracked aggregates, all null reviewed bindings, both receipt schemas, the
   credential-empty two-request npm boundary, external-communication gate,
   and evidence non-promotion.
2. For M2A-IBR01, fix one private, held, no-follow descriptor inventory for
   every package-source root and nested source directory. Bind each directory
   to exact lexical parent/name and complete type, full-mode, owner, link, and
   BigInt filesystem identity. After the original complete traversal has held
   every admitted source file, require a second traversal through the same
   held directory authority and compare the complete ordered directory/file
   graph to the originally admitted set before output creation. An added,
   removed, renamed, reparented, aliased, reordered, inaccessible, or
   uncertain entry must stop before publication; matching held file identities
   alone are insufficient.
3. Also for M2A-IBR01, bind the toolchain destination root and every created
   directory to held no-follow descriptor identities and exact operation
   transitions. After all copied-file renames and source/copy settlements, but
   before constructing `toolchain.next`, perform one complete traversal
   through that same held destination authority. Require it to match exactly
   the canonical four-family inventory plus only the contract's named control
   objects, with every file identity, mode, link, size, and SHA-256 correlated
   to its copy transaction. No receipt serialization may begin after a
   missing, extra, replaced, aliased, staging, disconnected, or uncertain row.
4. For M2A-IBR02, define one exact exclusive durable toolchain-attempt
   checkpoint before the first fallible host runtime, process-report, tracked-
   source, or installed-package read. Fix its path, parent/root identity,
   staging/final names, canonical schema and key order, modes, sync/reread/
   close/rename transitions, and sanitized in-progress/failure/success states.
   A present or uncertain checkpoint must consume the generation and make
   every later invocation stop without inspection, cleanup, repair, resume, or
   retry. Every failure, including one before toolchain-root publication, must
   leave a durable non-evidence occurrence. Reconcile the checkpoint with the
   exact successful root inventory without treating `toolchain.json` as
   reviewed evidence or adding a post-success retry path.
5. For M2A-IBR03, extend the later M2A-IB06 implementation allowlist by exactly
   these existing consumer paths and no broader construction/runtime surface:

   ```text
   experiments/npm12-install/scripts/m2a-transfer-construction.mjs
   experiments/npm12-install/scripts/m2a-transfer-construction.d.mts
   ```

   Require the existing `validateConstructorToolchain()` boundary, not only a
   disconnected producer validator, to reject a `runtime/constructor-node`
   row unless its mode is exactly `0555`, reject every copied runtime/package
   row unless its mode is exactly `0444`, and reject every package row whose
   size is zero. Preserve all other constructor behavior and reviewed null
   bindings.
6. Expand the later fake-only negative matrix to exercise source entry add/
   remove/rename/reparent, directory/file replacement and alias, first/second
   traversal disagreement, destination extra/missing/staging/disconnected
   rows, checkpoint creation/transition/settlement failures, a root-absent
   pre-source failure followed by a second invocation, every wrong per-family
   mode, and a zero-length package row through the actual constructor consumer.
   Each negative must stop before later producer/construction reachability and
   preserve the one-shot/evidence boundary.

# Out of scope

- Editing implementation, declaration, test, static-verifier, package-script,
  lockfile, manifest, Containerfile/container, adapter/probe/package, fixture,
  scenario, result, Expected, or `Observed` bytes
- Acquiring, inspecting, hashing, copying, or executing npm, `/usr/bin/node`,
  installed package, shared-object, toolchain, construction, image, transfer,
  runtime, or result bytes
- Importing or executing either future producer entry, a compiler,
  constructor, lifecycle, Docker command, or runtime-socket operation
- Choosing an observed npm integrity, archive size/hash, runtime closure,
  package inventory, receipt digest, or reviewed input binding
- External network, loopback/Unix-socket communication, credentials,
  environment/home/cache access, Remote Git, publication, deployment,
  cleanup, retry, or third-party communication
- Reopening M2A-IB01/M2A-IB02 or any prior M2A-TR, M2A-CGR, M2A-CGI, or
  M2A-CG decision already closed at its recorded scope

# Constraints

- Fix every path, identity field, state, ordering edge, failure terminal, and
  later allowlisted path in the contract. Do not defer a contract choice to
  implementation, host behavior, or future result review.
- Keep source-content identity, source-directory completeness, destination-
  tree completeness, and canonical receipt identity as separate comparisons.
- A second traversal must use the already held directory authority; reopening
  a source or destination path is not an identity barrier.
- The durable checkpoint must exist before a failure can consume the one-shot
  toolchain occurrence. A terminal message, absent root, in-memory flag, or
  future review cannot substitute for it.
- Consumer hardening is limited to the three already selected mode/size
  relations and the two exact construction source/declaration paths. Do not
  broaden this task into construction execution-gate repair.
- Preserve the cooperative repository-owned Linux filesystem limitation and
  do not claim hostile-kernel resistance, authenticity, or crash-atomic
  durability beyond the exact synced transitions.
- Preserve evidence-class separation: remediated contract bytes are not input,
  producer, construction, runtime, result, or `Observed` evidence.
- No standing authorization is used in this documentation-only remediation.

# Deliverables

- remediated
  `docs/m2-a-evidence-transfer-dependency-input-boundary.md` resolving only
  M2A-IBR01 through M2A-IBR03 at contract scope
- fresh independent re-review prompt at
  `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation-review.md`
- minimal authoritative status updates naming only that fresh re-review as
  next

# Verification

- Use focused read-only contract/reference assertions to prove all three
  finding IDs, the exact preserved values, the complete source/destination
  traversal state machines, the pre-source durable checkpoint, and the two-
  path consumer allowlist are present without contradiction.
- Run a focused Prettier check over the remediated contract, saved prompt pair,
  and changed status records.
- Run `git diff --check`.
- Do not run tests, typecheck, a build, either producer, a lifecycle fixture,
  construction, Docker, transfer, result-root inspection, or a broad check;
  those commands cannot establish this contract-only remediation.

# Completion report

- Exact M2A-IBR01 source/destination completeness barriers
- Exact M2A-IBR02 checkpoint and one-shot terminal
- Exact M2A-IBR03 consumer allowlist and mode/size relations
- Preserved closed decisions and evidence/authority boundaries
- Changed files and commands actually run
- Commands intentionally not run and remaining limitations
- Exact fresh independent re-review boundary
- One concrete `Next:` task
