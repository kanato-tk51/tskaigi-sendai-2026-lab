# Goal

Remediate only frozen-research issue #43's residual M2A-IBI01 parent-sync and
BigInt-identity finding from the fresh dependency-input implementation-
remediation re-review. Make the represented parent-sync fact exact own data
consumed by the same private attempt-root transition in production and the
separately branded fake, and retain device, inode, size, and mtime in one exact
non-narrowed BigInt-derived identity representation. Preserve closed
M2A-IBI02, M2A-IB01, M2A-IB02, M2A-IB04, M2A-IB05, every contract-scope
M2A-IB01 through M2A-IB06/M2A-IBR01 through M2A-IBR03 decision, and every
still-closed producer-execution, construction, Docker, runtime/result, and
evidence gate.

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
- `prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`
- `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation-review.md`
- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`
- this prompt and its paired fresh residual-remediation re-review prompt

# Scope

Production repair is limited to:

```text
experiments/npm12-install/scripts/m2a-transfer-inputs.mjs
```

Change the declaration only if the existing separately branded fake-only
surface must carry the exact parent-sync record or exact identity data:

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

This prompt and its paired fresh re-review prompt were saved before any
residual source or test repair and must remain unchanged during implementation.
Preserve every unrelated accumulated worktree change.

# Out of scope

- Reopening M2A-IBI02's closed runtime/source/destination/every-package-family
  inverse matrix, redesigning the reviewed synchronous commit/checkpoint,
  acquisition, request, receipt, graph, constructor, construction, transfer,
  runtime, result, or evidence contracts
- Changing either no-argument producer entry, construction source or
  declaration, package script, lockfile, manifest, Containerfile/container
  source, adapter/probe/package source, fixture, scenario, historical/result
  path, Expected, or `Observed`
- Importing or executing either producer; reading a fixed acquisition,
  toolchain, construction, or result root; reading `/usr/bin/node`, a live
  process report, installed package bytes, environment, home/cache,
  credentials, or retained runtime state
- DNS, external/loopback/Unix-socket communication, child processes, npm,
  compiler, lifecycle, constructor execution, image construction/build,
  Docker/runtime socket, transfer, result review, cleanup, repair, resume,
  retry, signaling, evidence ingestion, Remote Git, publication, deployment,
  or third-party communication
- Broad refactoring, new public production authority, caller-selected paths or
  descriptors, production callbacks, or a new execution command

# Constraints

## Preserved held-authority and commit boundary

1. Preserve the one synchronous, non-recursive, exclusive mode-`0700`
   `mkdirSync` commit after the held-parent absence preflight. Preserve the
   original held `WORK_ROOT` descriptor, the exact no-follow child, full
   before/after inventory, and the canonical `attempt.next`/`attempt.json`
   in-progress transaction through final held-child/parent settlement.
2. Preserve the exact post-commit failure boundary. Parent-sync record,
   transition, checkpoint, child-close, or parent-close failure retains the
   durable root, permits no cleanup, repair, resume, or retry, and reaches no
   runtime/process-report/tracked-source/package read or later publication.
3. Do not replace the original held-parent sync with `syncDirectory(WORK_ROOT)`
   or another path-reopened descriptor, and do not replace the held child with
   an independently reopened attempt-root path.

## Exact parent-sync data edge

4. Introduce one private exact parent-sync result decoder/decision used by both
   the direct production `fsyncSync(authority.parentFd)` path and the branded
   fake `attempt-parent-sync` step. A successful direct sync may construct the
   fixed record only after `fsyncSync` returns normally; a thrown or unknown
   sync never constructs a successful record.
5. The parent-sync record must be a plain exact-own-data object with one fixed
   key order and no missing, extra, reordered, inherited, accessor, symbol, or
   proxy property. It must distinguish generic step settlement from the
   represented sync fact and accept only known success with
   `parentSynced: true`. Do not default, coerce, spread over, or synthesize the
   fact after decoding.
6. Pass only the decoded record's `parentSynced` fact into
   `validateAttemptRootCommitTransition()` in both production and fake paths.
   Remove the fake's discarded result plus independent literal
   `parentSynced: true` edge. A source marker, step name, or prior generic
   `validateKnownStep()` call is not equivalent.
7. Add behavioral fake negatives for `parentSynced: false`, missing
   `parentSynced`, an extra property, reordered keys, an inherited or accessor
   fact, a symbol/proxy record, wrong `ok`, and unknown settlement. Each must
   fail at the parent-sync/commit boundary, retain the occurrence, stop before
   `attempt-in-progress-write` and runtime/source reads, publish no candidate,
   and permit no cleanup or retry.

## Exact BigInt-derived attempt identity

8. Keep device, inode, size, and mtime from BigInt stat calls in one canonical
   exact nonnegative decimal-string representation. `statIdentity()` must not
   narrow any of the four fields through `Number`, including directory size.
   The representation must round-trip through `BigInt` without a sign,
   fraction, exponent, whitespace, empty string, or non-canonical leading
   zero.
9. Make `readAttemptIdentity()`, `sameIdentity()`, parent/child inventory rows,
   `defaultAttemptTransition()`, and focused fake data use that same
   representation. Do not retain a mixed number/string compatibility branch
   or accept a JavaScript `bigint` through the fake/public declaration.
10. Add a positive identity whose size is greater than
    `Number.MAX_SAFE_INTEGER`, carried unchanged through path/held child,
    committed inventory, and the shared transition. Add independent
    contradictions for device, inode, size, and mtime, including a
    precision-colliding size, numeric size, malformed decimal, and
    path/descriptor or committed-child mismatch. Each contradiction must stop
    before checkpoint publication and runtime/source reads.
11. Preserve full type, mode/special-bit, effective owner/group, link,
    unchanged-sibling, bytewise-order, unique device/inode, parent metadata,
    descriptor-close, and checkpoint negatives. Updating identity fixtures
    from numeric size to exact decimal data must not weaken those assertions.
12. Update the static verifier to require the production/fake parent-sync data
    edge, absence of the discarded-result/literal-true bypass, absence of
    `Number(stat.size)` in attempt identity, the exact four-field
    representation, behavioral focused-test execution, absent producer
    imports, and unchanged production reachability. Source strings alone do
    not close M2A-IBI01.

## Preserved implementation, safety, and evidence boundary

13. Preserve every M2A-IBI02 behavioral runtime/source/destination/package and
    actual `validateConstructorToolchain()` inverse case. Do not change the
    constructor consumer or canonical receipt to make a test pass.
14. Keep both producer authorities private, fixed, no-argument, and side-
    effect-free on import. The declaration may expose only separately branded
    fake plain data and may not expose a path, descriptor, process object,
    environment, runtime report, package root, production brand, retry policy,
    callback, or production constructor.
15. Tests use only repository-controlled in-memory values and existing
    repository-owned disposable test roots permitted by the contract. They
    must not import either producer entry, inspect fixed ignored roots, read
    live runtime/package bytes, open a socket, spawn a child, run a producer,
    npm, compiler, constructor, lifecycle, Docker, or result operation.
16. Preserve `evidenceReview: "not-performed"`, every reviewed construction
    binding as `null`, every execution approval as `false`, and the distinction
    among contract, implementation, producer occurrence, candidate,
    independently accepted input, construction, runtime result, and
    `Observed`.
17. Passing checks remain Docker-free static/unit cooperative-host evidence.
    They establish no live input, external transport, hostile-kernel or same-
    authority resistance, construction, Docker, runtime result, accepted
    evidence, or machine-crash durability beyond the fixed synchronous
    transitions.

# Deliverables

- The smallest support/declaration repair that carries one exact parent-sync
  record into the same production/fake commit transition
- One canonical non-narrowed decimal representation for BigInt-derived device,
  inode, size, and mtime across production and fake attempt identities
- Behavioral parent-sync exact-own-data and BigInt precision/representation
  contradictions that stop before checkpoint or source reads
- Static verification that rejects the old discarded-result/literal-true and
  `Number(stat.size)` bypasses while preserving producer import/reachability
  and evidence boundaries
- Minimal status updates recording only Docker-free remediation evidence and
  the fresh independent residual-remediation re-review as next

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

- Residual M2A-IBI01 remediation evidence and resulting M2A-IBI01/M2A-IBI02
  and M2A-IB01 through M2A-IB06 implementation-scope status
- Exact production/fake parent-sync own-data flow and false/missing/extra/
  reordered/accessor/inherited/symbol/proxy stop traces
- Exact BigInt-derived device/inode/size/mtime representation and greater-than-
  safe-integer positive/negative traces
- Changed files and commands actually run with observed results
- Intentionally unrun commands, preserved unrelated work, remaining
  cooperative-host/runtime limitations, and evidence class
- Confirmation that no producer, input, external communication, construction,
  Docker, runtime/result, or `Observed` evidence was produced
- One concrete `Next:` task naming the fresh independent Docker-free re-review
  under
  `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md`
