# Goal

Remediate only frozen-research issue #43's two remaining M2A-IBI01
verification findings, M2A-IBI01R01 and M2A-IBI01R02. Add the missing
exact-key-shape attempt-identity behavior and bind all four BigInt-derived
device, inode, size, and mtime production encodings in the static verifier.
Preserve the reviewed production and separately branded fake implementation,
closed M2A-IBI02, M2A-IB01, M2A-IB02, M2A-IB04, and M2A-IB05 implementation
decisions, every contract-scope decision, and every still-closed
producer-execution, construction, Docker, runtime/result, and evidence gate.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, and `experiments/AGENTS.md`
- `docs/index.md` and the complete issue #43 chain routed there
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
- `prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md`
- `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md`
- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md`
- this prompt and its paired fresh identity-verification re-review prompt

# Scope

Implementation repair is limited to:

```text
experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs
tests/m2a-evidence-transfer.test.ts
```

Minimal status updates are limited to:

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

# Out of scope

- Editing `experiments/npm12-install/scripts/m2a-transfer-inputs.mjs`, its
  declaration, either producer entry, construction source/declaration, root
  package scripts, lockfiles, manifests, Containerfiles/container sources,
  adapter/probe/package sources, fixtures, scenarios, historical/results,
  Expected, or `Observed`
- Changing the reviewed parent-sync decoder/edge, attempt-root transaction,
  attempt-identity representation, constructor consumer, canonical receipt,
  runtime/source/destination/package graph, or evidence decision
- Importing or executing either producer; reading a fixed input,
  construction, or result root; reading `/usr/bin/node`, a process report,
  installed packages, environment, home/cache, credentials, or retained
  runtime state
- DNS, external/loopback/Unix-socket communication, child processes, npm
  acquisition/install/pack/approve/rebuild, compiler, lifecycle, constructor,
  image build, Docker/runtime socket, transfer, result validation, cleanup,
  retry, signaling, evidence ingestion, Remote Git, publication, deployment,
  or third-party communication
- Reopening M2A-IBI02, M2A-IB01, M2A-IB02, M2A-IB04, or M2A-IB05 without a
  newly reproduced contradiction, selecting future producer inputs or
  observations, or approving later execution

# Constraints

## M2A-IBI01R01 exact-key-shape behavior

1. Through the existing separately branded fake and shared
   `readAttemptIdentity()` boundary, independently submit attempt identities
   with a missing key, an extra key, reordered keys, an inherited property,
   an accessor property, a symbol key, and a Proxy. Exercise the attempt
   identity itself rather than the separate parent-sync decoder.
2. Cover the exact ordered identity key set: `type`, `mode`, `uid`, `gid`,
   `links`, `device`, `inode`, `size`, and `mtimeNs`. Do not weaken
   `readRecord()`, `assertKeys()`, the plain exact-own-data requirement, or
   canonical decimal validation to make a case pass.
3. For every malformed identity, prove the same
   `M2A_TOOLCHAIN_ATTEMPT_CORRELATION_INVALID` terminal: the durable
   occurrence remains committed, the checkpoint is retained, no toolchain
   candidate is published, no cleanup or retry is enabled, and the trace
   stops before `attempt-in-progress-write` and runtime/source/package reads.
4. Prove accessor and Proxy cases are rejected without invoking an accessor
   getter or Proxy trap. Use only repository-controlled in-memory fake data;
   do not expose production authority through the declaration.
5. Preserve the greater-than-`Number.MAX_SAFE_INTEGER` positive transition
   and every existing device/inode/size/mtime, mode, owner/group, link,
   unchanged-sibling, order, physical-alias, sync, checkpoint, and
   descriptor-close contradiction.

## M2A-IBI01R02 four-field static binding

6. Make the static verifier require all four current production encodings:
   `device: stat.dev.toString()`, `inode: stat.ino.toString()`,
   `size: stat.size.toString()`, and `mtimeNs: stat.mtimeNs.toString()`.
7. Make the static verifier reject `Number` narrowing of each corresponding
   BigInt stat field, not only size. Do not replace the four exact checks with
   a source occurrence count or a check against fake-projected data.
8. Keep the static requirement for
   `isCanonicalNonnegativeDecimal()`, the shared production/fake parent-sync
   edge, the absence of the discarded-result/literal-true bypass, focused
   behavioral test reachability, absent producer imports, and closed
   construction reachability.
9. Bind the focused exact-key-shape behavior in the static verifier strongly
   enough that removing that focused boundary cannot leave
   `npm run m2a:transfer:verify` green solely on production source markers.
   Static source markers do not replace the behavioral test.

## Preserved implementation, safety, and evidence boundary

10. Do not modify the reviewed support source or declaration. The current
    private parent-sync own-data flow and canonical four-field identity are
    preserved implementation input to this verification-only remediation,
    not a new semantic redesign.
11. Preserve every M2A-IBI02 behavioral runtime/source/destination/package and
    actual `validateConstructorToolchain()` inverse case. Do not change the
    constructor consumer or canonical receipt to make a test pass.
12. Tests must not import either producer entry, inspect fixed ignored roots,
    read live runtime/package bytes, open a socket, spawn a child, run a
    producer, npm, compiler, constructor, lifecycle, Docker, or result
    operation.
13. Preserve `evidenceReview: "not-performed"`, every reviewed construction
    binding as `null`, every execution approval as `false`, and the
    distinction among contract, implementation, producer occurrence,
    candidate, independently accepted input, construction, runtime result,
    and `Observed`.
14. Passing checks remain Docker-free static/unit cooperative-host evidence.
    They establish no live input, external transport, hostile-kernel or
    same-authority resistance, construction, Docker, runtime result, accepted
    evidence, or machine-crash durability beyond the reviewed synchronous
    transitions.

# Deliverables

- Focused exact-key-shape attempt-identity cases for missing, extra,
  reordered, inherited, accessor, symbol, and Proxy representations with the
  retained pre-checkpoint/pre-runtime failure trace
- Static verification requiring canonical decimal `.toString()` production
  encodings and rejecting `Number` narrowing for device, inode, size, and
  mtime
- Preservation of the current support/declaration bytes, parent-sync edge,
  complete M2A-IBI02 matrix, producer import/reachability boundary, and
  evidence non-promotion
- Minimal status updates recording Docker-free verification-remediation
  evidence and the fresh independent re-review as next

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

Also run focused Prettier checking over the exact verifier/test remediation
allowlist, this saved prompt pair, and changed status files. Record any
aggregate failure exactly without formatting or repairing unrelated files.
Do not claim `npm run check` passed unless all stages completed successfully.

Do not run either producer, `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`,
npm acquisition/install/pack/approve/rebuild, a lifecycle fixture, compiler,
constructor, image build, Docker, transfer, fixed-root inspection, or result
validation.

# Completion report

- M2A-IBI01R01/R02 remediation evidence and resulting
  M2A-IBI01/M2A-IBI02/M2A-IB01 through M2A-IB06 implementation-scope status
- Exact missing/extra/reordered/inherited/accessor/symbol/Proxy
  attempt-identity stop traces, including getter/trap non-invocation
- Exact four-field production encoding requirements and rejected
  device/inode/size/mtime `Number` narrowing
- Preserved parent-sync, M2A-IBI02, support/declaration, allowlist/import, and
  evidence-class boundaries
- Changed files and commands actually run with observed results
- Intentionally unrun commands, preserved unrelated work, remaining
  cooperative-host/runtime limitations, and evidence class
- Confirmation that no producer, input, external communication, construction,
  Docker, runtime/result, or `Observed` evidence was produced
- One concrete `Next:` task naming the fresh independent Docker-free re-review
  under
  `prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation-review.md`
