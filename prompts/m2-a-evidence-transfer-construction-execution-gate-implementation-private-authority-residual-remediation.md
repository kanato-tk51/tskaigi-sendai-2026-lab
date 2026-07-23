# Goal

Remediate only the residual M2A-CGI04 private-authority finding from frozen-
research issue #43's fresh Docker-free construction/execution-gate residual-
remediation re-review. Make the fixed compiler and Docker helpers retain the
first failure and first exit tuple against every later event, and correlate
every runtime inventory, publication, copy, and marker operation to the held
directory identities and exact full-mode/link contract. Do not reopen closed
M2A-CGI01 through M2A-CGI03, acquire npm or toolchain bytes, execute a
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
- `prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`
- `prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md`
- `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation-review.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md`
- this prompt

# Scope

Implementation and verification changes are limited to this strict subset of
the unchanged M2A-CG06 allowlist:

```text
experiments/npm12-install/scripts/m2a-transfer-construction.mjs
experiments/npm12-install/scripts/m2a-transfer-construction.d.mts
experiments/npm12-install/scripts/m2a-transfer-production.mjs
experiments/npm12-install/scripts/m2a-transfer-production.d.mts
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

This prompt and its paired fresh re-review prompt were saved before any
private-authority residual source or test repair and must remain unchanged
during implementation. Preserve every unrelated accumulated worktree change.

# Out of scope

- M2A-CGI01's exact toolchain/context closure, M2A-CGI02's row-local image
  validation, and M2A-CGI03's exact runtime settlement branches are closed and
  immutable for this task.
- Do not redesign public attempt, completion, image-binding, construction-
  manifest, transfer, adapter-event, or evidence schemas.
- Do not change package scripts, lockfiles, Containerfile, transfer manifest,
  initializer/runner sources, adapter/probe sources, package manifests,
  fixtures, scenarios, historical/results, Expected, or `Observed` bytes.
- Do not approve or perform acquisition, production compilation/construction,
  image build/inspect, Docker/runtime, lifecycle, transfer, result review,
  cleanup, retry, ingestion, publication, deployment, or evidence promotion.

# Constraints

## Preserved closed boundaries

1. Preserve the exact `20260721-01` tuple, 31-row and 41-row aggregates,
   M2A-CGR01 through M2A-CGR03 contract closure, M2A-TR01 through M2A-TR06
   earlier Docker-free static/unit closure, and implementation-scope closure
   of M2A-CG01.
2. Preserve every accepted M2A-CGI01 through M2A-CGI03 positive and negative
   transaction. The canonical image binding, row-local stop points, exact
   `settled`/`unknown` shapes, chronological first issue, write-ahead
   checkpoint, conditional-copy order, and combined candidate must not change.
3. Keep all production constructors, authorities, and brands private,
   distinct from fake brands, absent from public declarations and package
   scripts, and reachable only behind the unchanged no-argument fail-closed
   entry gates. Reusable imports remain side-effect-free.

## M2A-CGI04 process first-cause settlement

4. Replace the overwriteable compiler and Docker terminal bookkeeping with
   one shared private settlement state machine used by both
   `runFixedCompiler()` and `runFixedDockerCommand()`. Record the first
   asynchronous failure cause exactly once, record the first `exit`
   code/signal tuple exactly once, and never let a later `exit`, `close`,
   timeout, overflow, signal error, or descriptor event improve or erase an
   earlier state.
5. A successful terminal requires no synchronous spawn failure, asynchronous
   `error`, timeout, output overflow, or signal-delivery failure; one first
   zero/null `exit`; a later `close` with the identical zero/null tuple; and
   known child, stdout, stderr, and aggregate descriptor closure. `close`
   without the required exit, inconsistent exit/close tuples, duplicate
   conflicting events, or uncertain output/descriptor settlement is not
   success. Do not invent a success default for missing data.
6. Preserve the fixed primary deadline, 250 ms TERM-to-KILL grace, 1,000 ms
   final-close bound, combined output limit, executable, argv, cwd,
   environment, `shell: false`, and no-retry/no-cleanup behavior. Normal exit
   without close, asynchronous error without close, signal failure, timeout,
   and overflow must all settle within the final bound as a known failure or
   explicit unknown; no trace may hang. Clear every owned timer exactly once
   and ignore all late callbacks after final settlement.
7. Add a separately branded fake-only event/timer driver that exercises the
   same settlement state machine without accepting an executable, argv, cwd,
   environment, path, process handle, or production authority. Production
   spawn constructors and brands remain private. The declaration may expose
   only the bounded fake trace/result surface required by focused tests.
8. Add behavioral traces for synchronous spawn failure; error then
   `close(0, null)`; nonzero exit then `close(0, null)`; zero exit then
   inconsistent close; timeout or overflow followed by zero exit/close;
   signal-delivery failure; close without exit; exit without close; output or
   descriptor uncertainty; exact zero exit/close success; duplicate/late
   events; and the no-event final bound. Prove the first cause/tuple, timer
   settlement, and absence of later compiler or Docker phase advance. Source
   marker assertions alone do not close this boundary.

## M2A-CGI04 held-directory/path transaction

9. Replace path-independent inventory and mutation checks with one shared
   held-directory correlation boundary. A held directory identity includes
   the descriptor plus exact directory type, full `stat.mode` including the
   absence of special bits, effective owner, contract link count, and stable
   BigInt device/inode/size/mtime identity. Initial hold must reject a wrong
   type, symbolic link, mode, owner, link count, or identity; descriptor
   ownership is registered before the first fallible post-open check.
10. Immediately before and after every unavoidable pathname-based `readdir`,
    child classification, exclusive open, rename, marker-parent creation, and
    Docker copy destination operation, re-resolve the exact no-follow path and
    prove that it names the same device/inode and exact stable metadata as the
    held descriptor. Repository and result ancestors receive the same
    pre/post correlation. The cooperative-host limitation remains explicit;
    do not claim Node path APIs provide an OS filesystem sandbox.
11. Replace the broad `allowInventoryMutation` adoption with an operation-
    specific transition. A permitted mutation may update size/mtime and the
    contract-defined link/inventory state only after the held descriptor and
    pathname still correlate to the same device/inode and the exact expected
    before/after inventory is proven. Any replacement, alias, extra/missing
    entry, special bit, owner/mode/link change, ancestor drift, or unexpected
    metadata transition fails before the next operation.
12. Bracket every result/transfer/probe-output inventory with the held identity
    correlation and classify each exact child no-follow. The result root may
    contain only held `transfer/`, canonical `attempt.json`, and the single
    transient `attempt.next` during its publication transaction. The transfer
    tree may contain only the phase-complete exact copy destinations and,
    conditionally, the held `probe-output/` directory and marker.
13. Publish every checkpoint and final attempt through the correlated held
    result identity: exclusive mode-`0600` `attempt.next`, same-descriptor
    write/sync/reread equality, known descriptor close, pre/post-correlated
    rename over `attempt.json`, and sync through the already held result
    directory descriptor. No newly opened path-only directory handle may
    substitute for the held sync authority.
14. Before each Docker copy, prove the transfer parent correlation, exact
    current inventory, and exact destination absence. After known child close,
    re-prove the same parent correlation, open only that destination no-follow,
    validate bytes and exact file metadata through the same descriptor, close
    it, and re-prove parent correlation before the next checkpoint. Apply the
    same transition discipline to conditional `probe-output/` creation and
    marker validation.
15. Add a separately branded fake-only held-directory trace that uses the same
    identity/inventory/transition verifier without accepting host paths,
    descriptors, or production authority. Cover stable held inode with a
    replaced path inode carrying the exact expected inventory; ancestor,
    owner, full-mode, special-bit, link, size/mtime, and device/inode drift;
    extra/missing/reordered/aliased/symlink/special children; transient
    `attempt.next`; rename/sync mismatch; copy destination substitution;
    marker-parent substitution; and post-operation drift. Every contradiction
    must stop before the next child, copy, publication, marker, or final result.

## Safety and evidence boundary

16. All future acquisition/toolchain/context/image digests and the local image
    ID remain `null`; build/runtime approvals remain `false`; every
    `evidenceReview` remains `not-performed`; and current entry calls still
    fail before authority creation or filesystem/process activity. Do not call
    an entry to prove this.
17. Tests use only in-memory separately branded fake traces and repository-
    owned disposable test roots already permitted by the contract. They must
    not import or execute a production entry or either container source, open
    a fixed acquisition/construction/runtime/result root, spawn a compiler or
    Docker process, signal a real child, or inspect retained state.
18. Passing checks remain Docker-free static/unit and cooperative-host
    evidence. They do not establish npm/toolchain acquisition, filesystem
    publication, Docker behavior, image identity, lifecycle behavior,
    named-volume transfer, result validity, runtime enforcement, or
    `Observed`.

# Deliverables

- The smallest source/declaration repair inside the six-path implementation
  allowlist that closes both residual M2A-CGI04 contradictions.
- Behavioral fake-only process and held-directory transaction tests that use
  the same private decision boundaries as production rather than parallel
  marker-only logic.
- Static reachability/import/allowlist checks preserving closed entry gates and
  preventing production authority exposure.
- Minimal status updates recording observed Docker-free verification and the
  fresh independent re-review handoff without promoting evidence.

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

Also run focused Prettier checking over the exact six-path implementation
allowlist, this saved prompt pair, and changed status files. Do not format or
repair unrelated dirty files. Record an aggregate failure without editing an
out-of-scope path, and do not claim `npm run check` passed unless every stage
completes.

Do not run `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, a production entry,
Docker, npm acquisition/install/pack/approve/rebuild, a compiler, a lifecycle,
or any command that touches fixed ignored runtime state.

# Completion report

- Closure evidence for M2A-CGI04 and resulting M2A-CG02 through M2A-CG06
  implementation status while preserving M2A-CGI01 through M2A-CGI03 and
  M2A-CG01
- Exact first-cause/first-exit/close/timer traces and held-directory/path/
  inventory/publication/copy traces
- Changed files and commands actually run with observed results
- Intentionally unrun commands, preserved unrelated work, remaining
  cooperative-host/runtime limitations, and evidence class
- One concrete `Next:` task naming the fresh independent Docker-free re-review
  under
  `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation-review.md`
