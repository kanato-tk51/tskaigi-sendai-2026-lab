# Goal

Remediate only M2A-IBI01 and M2A-IBI02 from frozen-research issue #43's
fresh Docker-free dependency-input implementation review. Preserve one held
attempt parent and its exactly correlated committed child through parent sync
and initial checkpoint publication, and complete the missing behavioral
runtime/source/package/constructor inverse matrix. Preserve closed M2A-IB01,
M2A-IB02, M2A-IB04, M2A-IB05, every contract-scope M2A-IB01 through
M2A-IB06/M2A-IBR01 through M2A-IBR03 decision, and every still-closed producer
execution, construction, Docker, runtime/result, and evidence gate.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, and `experiments/AGENTS.md`
- `docs/index.md` and every issue #43 document routed there
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
- the complete dependency-input contract/remediation prompt and review chain
  routed by `docs/index.md`
- `prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`
- `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md`
- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`
- every changed implementation, declaration, verification, test, and status
  path in the original implementation allowlist
- this prompt

# Scope

Production repair is limited to:

```text
experiments/npm12-install/scripts/m2a-transfer-inputs.mjs
```

Change the declaration only if a strictly fake-only shared transition surface
is required:

```text
experiments/npm12-install/scripts/m2a-transfer-inputs.d.mts
```

Verification repair is limited to:

```text
experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs
tests/m2a-evidence-transfer.test.ts
```

Update only these paths as minimal remediation-status and fresh re-review
handoff records:

```text
experiments/npm12-install/README.md
docs/m2-a-evidence-transfer-dependency-input-boundary.md
docs/m2-a-evidence-transfer-construction-execution-gate.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
```

The saved remediation/re-review prompt pair may remain as immutable task
documentation. Do not change either no-argument producer entry,
`m2a-transfer-construction.mjs` or its declaration, any package script,
lockfile, manifest, Containerfile/container source, adapter/probe/package
source, fixture, scenario, historical/result path, Expected, or `Observed`.

# Out of scope

- Importing or executing either producer; acquiring npm bytes; reading a fixed
  acquisition/toolchain/construction/result root, `/usr/bin/node`, a live
  process report, installed package bytes, environment, home/cache, credential,
  historical result, or retained runtime state
- DNS, external/loopback/Unix-socket communication, child processes, npm,
  compiler, lifecycle, constructor execution, image construction/build,
  Docker/runtime socket, transfer, result review, cleanup, repair of retained
  state, retry, signaling, evidence ingestion, or evidence promotion
- Redesigning the synchronous initial commit classification, fixed generation,
  request plans, schemas, source/package identities, canonical aggregates,
  construction bindings, execution approvals, or evidence classes
- Changing the already-correct actual constructor consumer instead of testing
  every required family mutation through it
- Broad refactoring, new public production authority, new execution command,
  arbitrary paths or callbacks, Remote Git, publication, deployment, or
  third-party communication

# Constraints

## M2A-IBI01 — held attempt-root commit correlation

1. Keep exactly one synchronous, non-recursive, exclusive mode-`0700`
   `mkdirSync` commit for the fixed attempt root after the existing held-parent
   absence preflight. It still has no returned settlement-unknown branch.
   Known no-create or process loss before commit leaves no occurrence; normal
   return or process loss at/after commit leaves the durable root and consumes
   the generation.
2. Do not close or replace the original held `WORK_ROOT` descriptor after the
   commit and then reopen the parent by path for the initial transition. Open
   the exact new lexical child with no-follow directory semantics while that
   parent remains held. Correlate the child's pathname and held descriptor to
   one exact directory identity, including type, full mode with no special
   bits, effective owner/group, contract link count, and BigInt device, inode,
   size, and mtime fields.
3. Revalidate the original held parent and its exact before/after inventory.
   Permit only the committed attempt child and operation-caused parent
   metadata transition; reject a substituted, aliased, symlinked, extra,
   missing, reordered, wrong-mode, wrong-owner, wrong-link, or identity-drifted
   child or sibling. Sync through the original held parent descriptor before
   it settles; `syncDirectory(WORK_ROOT)` or another path-reopened descriptor
   is not equivalent.
4. Carry the correlated held attempt-root authority through the canonical
   `attempt.next` to `attempt.json` in-progress transaction. Bind exact
   inventory, mode-`0600` exclusive staging, complete write/sync/same-descriptor
   reread, mode-`0444`, identity revalidation, known file close,
   non-replacing rename, and root sync to that authority. No independently
   reopened attempt-root path may replace the held authority before the
   initial checkpoint settles.
5. Register ownership before the first fallible post-open check and settle
   each held parent, child, and staging descriptor exactly once. Open,
   correlation, parent-sync, checkpoint, child-close, or parent-close failure
   after commit retains the root, reaches no runtime/process-report/tracked-
   source/package read, publishes no candidate, and permits no cleanup,
   repair, resume, or retry.
6. Use one private transition/correlation decision boundary for production and
   the separately branded fake trace. The fake's `open-attempt-root`,
   `correlate-attempt-root`, and `attempt-parent-sync` outcomes must be data for
   the same validator/state transition production consumes, not marker-only
   steps that can claim a stronger identity edge than production.
7. Add behavioral contradictions for parent replacement after commit, child
   path/descriptor mismatch, symlink/alias, type, full-mode/special-bit,
   owner/group, link, device/inode, size/mtime, extra/missing sibling,
   pre/post-inventory, sync, descriptor-close, and checkpoint failure. Each
   trace must prove the exact last action and absence of later source or
   publication action.

## M2A-IBI02 — complete shared fake/unit inverse matrix

8. Exercise the actual runtime projection boundary with wrong Node version,
   platform, architecture, executable type/mode/link/size/hash, a sparse or
   non-dense `sharedObjects` array, non-string/relative/path-drift rows,
   duplicate paths or physical identities, basename/ordering drift, and
   missing, extra, duplicate, reordered, or source-disconnected runtime
   inventory. Do not read live runtime bytes.
9. Exercise each fixed package tuple independently for version, integrity,
   root/path, tree, type, full mode, owner/group, link, sparse/nonempty,
   duplicate physical or logical identity, case alias, bytewise order, size,
   and hash drift. Exercise source entry add, remove, rename, reparent,
   directory replacement, file replacement, hard-link alias, first/second
   traversal disagreement, held-file mismatch, inaccessible/unknown row, and
   post-first-traversal mutation for all applicable directory/file families.
10. Exercise destination graph extra, missing, staging, reordered, aliased,
    disconnected, replaced, wrong-metadata, source-to-copy mismatch, and
    virtual-Node duplication. Every behavioral case must call the same pure
    graph/receipt decision boundary used by production and must stop before
    receipt/checkpoint success.
11. Through the actual existing `validateConstructorToolchain()` consumer,
    retain positive coverage and independently reject:

    ```text
    runtime/constructor-node wrong mode
    copied runtime row wrong mode
    packages/typescript wrong mode
    packages/@types/node wrong mode
    packages/undici-types wrong mode
    packages/typescript zero size
    packages/@types/node zero size
    packages/undici-types zero size
    ```

    Rebuild every affected canonical family aggregate, whole inventory
    aggregate, receipt bytes, and reviewed hash consistently so each test
    isolates only the selected mode/size contradiction. Do not change the
    constructor validator to make a test pass.
12. Preserve the already-covered acquisition, request, publication,
    occurrence, checkpoint, receipt/schema, exact-own-data, import-safety,
    construction-reachability, retry/cleanup, and evidence non-promotion
    negatives. Add a regression assertion if any refactor could bypass one of
    those closed families.
13. Source strings, test names, fake step names, and positive fake traces are
    not behavioral closure. Focused tests must invoke the production-consumed
    pure validator or actual constructor consumer for each contradiction.
    Update the static verifier to require the shared production/fake decision
    edge, complete focused-test execution boundary, absent producer imports,
    and unchanged production reachability rather than accepting the old
    `mkdirSync`/`O_NOFOLLOW` marker pair alone.

## Preserved safety and evidence boundary

14. Keep both producer authorities private, fixed, no-argument, and
    side-effect-free on import. The declaration may expose only a separately
    branded fake-only data surface and may not expose a path, descriptor,
    process object, environment, runtime report, package root, production
    brand, retry policy, callback, or production constructor.
15. Tests use only repository-controlled in-memory values and disposable
    repository-owned test roots already permitted by the contract. They must
    not import either producer entry, inspect fixed ignored roots, read the
    host runtime/package tree, open a socket, spawn a child, run a producer,
    npm, compiler, constructor, lifecycle, Docker, or result operation.
16. Preserve `evidenceReview: "not-performed"`, every reviewed construction
    binding as `null`, every execution approval as `false`, and the distinction
    among contract, implementation, producer occurrence, candidate,
    independently accepted input, construction, runtime result, and
    `Observed`.
17. Passing checks remain Docker-free static/unit cooperative-host evidence.
    They establish no live input, external transport, hostile-kernel or
    same-authority resistance, machine-crash durability beyond the exact
    transitions, construction, Docker, runtime result, or accepted evidence.

# Deliverables

- The smallest `m2a-transfer-inputs.mjs` production repair that preserves and
  correlates one held parent/child authority from the synchronous attempt-root
  commit through initial checkpoint settlement
- A shared private production/fake transition boundary and behavioral
  M2A-IBI01 contradictions, with declaration changes only if a fake-only data
  surface is unavoidable
- Complete behavioral runtime/source/destination and every-package-family
  constructor inverse coverage for M2A-IBI02
- Static verification that rejects marker-only production/fake divergence and
  preserves producer import/reachability and evidence boundaries
- Minimal status updates recording only the Docker-free remediation evidence
  and the fresh independent re-review as next

# Verification

Run only:

```sh
npm run m2a:transfer:verify
npm run m2a:verify
npm run typecheck
npm test
npm run check
git diff --check
```

Also run focused Prettier checking over the exact remediation allowlist, this
saved prompt pair, and changed status files. Record an aggregate failure
exactly without formatting or repairing unrelated files. Do not claim
`npm run check` passed unless all of its stages completed successfully.

Do not run either producer, `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`,
npm acquisition/install/pack/approve/rebuild, a lifecycle fixture, compiler,
constructor, image build, Docker, transfer, fixed-root inspection, or result
validation.

# Completion report

- M2A-IBI01/M2A-IBI02 remediation evidence and resulting M2A-IB01 through
  M2A-IB06 implementation-scope status
- Exact held-parent/child/checkpoint/settlement traces and shared
  production/fake decision boundary
- Complete runtime/source/destination and actual-constructor inverse matrix
- Changed files and commands actually run with observed results
- Intentionally unrun commands, preserved unrelated work, remaining
  cooperative-host/runtime limitations, and evidence class
- Confirmation that no producer, input, external communication, construction,
  Docker, runtime/result, or `Observed` evidence was produced
- One concrete `Next:` task naming the fresh independent Docker-free
  remediation re-review
