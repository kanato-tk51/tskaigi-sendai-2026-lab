# Goal

Perform a fresh independent Docker-free read-only re-review of only frozen-
research issue #43's M2A-IBI01R01/R02 identity-verification remediation.
Decide whether the focused suite now behaviorally submits every required
exact-key-shape attempt identity and whether static verification binds all
four BigInt-derived production identity encodings against `Number` narrowing.
Preserve the reviewed production/fake source, closed M2A-IBI02 and
M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 decisions, and every closed
producer-execution, construction, Docker, runtime/result, and evidence gate.
Do not repair source, tests, or the verifier and do not execute either
producer.

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
- `prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md`
- every changed verifier, focused-test, and status path in that prompt's exact
  allowlists
- this prompt

# Scope

Review only the identity-verification remediation diff and its minimal prompt
and status records. Treat implementation summaries, reported command passes,
source marker names, test names, and positive fake traces as claims to
reproduce. Preserve every unrelated accumulated worktree change and every
immutable earlier review record.

The only permitted repository writes are:

```text
docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md
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

- Editing the implementation source/declaration, static verifier, focused
  test, either saved identity-verification prompt, package script, lockfile,
  manifest, Containerfile/container source, adapter/probe/package source,
  fixture, scenario, historical/result path, Expected, or `Observed`
- Importing or executing either producer; reading fixed input/construction/
  result roots, `/usr/bin/node`, a process report, installed packages,
  environment, home/cache, credentials, or retained runtime state
- DNS, external/loopback/Unix-socket communication, child processes, npm,
  compiler, lifecycle, constructor execution, image build, Docker/runtime
  socket, transfer, result validation, cleanup, repair, retry, signaling,
  evidence ingestion, Remote Git, publication, deployment, or third-party
  communication
- Reopening closed M2A-IBI02, M2A-IB01, M2A-IB02, M2A-IB04, or M2A-IB05
  without a newly reproduced contradiction, redesigning the reviewed
  implementation, or selecting future producer observations or evidence

# Constraints

## M2A-IBI01R01 decision

1. Trace the branded fake attempt transition into the same private
   `readAttemptIdentity()` decoder used for parent path/descriptor, committed
   child path/descriptor, and inventory identities. Confirm the test cases
   exercise attempt identities and not only the separate parent-sync record.
2. Independently reproduce missing, extra, reordered, inherited, accessor,
   symbol, and Proxy attempt identities over the exact ordered nine-key
   identity shape. Confirm no accessor getter or Proxy trap is invoked.
3. For every malformed identity, reproduce
   `M2A_TOOLCHAIN_ATTEMPT_CORRELATION_INVALID`, retained committed occurrence,
   no published candidate, no cleanup/retry, and a stop before
   `attempt-in-progress-write` and runtime/source/package reads.
4. Confirm the cases would fail if removed or bypassed rather than passing
   solely because the test title or a static source marker exists.

## M2A-IBI01R02 decision

5. Confirm the static verifier requires the exact current production
   `stat.dev.toString()`, `stat.ino.toString()`, `stat.size.toString()`, and
   `stat.mtimeNs.toString()` encodings.
6. Confirm it rejects `Number` narrowing of device, inode, size, and mtime,
   and that a future narrowing of any one field cannot pass merely because
   fake inputs already contain projected decimal strings.
7. Confirm the verifier retains the canonical nonnegative-decimal decoder,
   shared production/fake parent-sync edge, absence of the discarded-result/
   literal-true bypass, focused behavioral test boundary, absent producer
   imports, and closed construction reachability.
8. Confirm the greater-than-`Number.MAX_SAFE_INTEGER` positive transition and
   existing device/inode/size/mtime value contradictions still execute and
   remain exact.

## Preserved implementation and evidence decision

9. Compare every changed path with the remediation allowlists. Confirm
   `m2a-transfer-inputs.mjs`, its declaration, both producer entries,
   construction consumer/declaration, package scripts, lockfiles, manifests,
   Containerfiles/container sources, adapter/probe/package sources, fixtures,
   scenarios, historical/results, Expected, and `Observed` did not change in
   this remediation.
10. Reproduce enough of the closed parent-sync and M2A-IBI02 focused matrix to
    prove the verification additions did not bypass the exact-own-data sync
    edge or the production-consumed runtime/source/destination/every-package-
    family and actual `validateConstructorToolchain()` boundaries.
11. Confirm producer authorities and brands remain private and fixed, imports
    remain side-effect-free, fake inputs cannot supply production authority,
    and verification never imports or executes either producer entry.
12. Confirm `evidenceReview: "not-performed"`, null reviewed construction
    bindings, false execution approvals, candidate-only visibility, and exact
    separation among contract, implementation, producer occurrence, accepted
    input, construction, runtime result, and `Observed`.
13. Use only repository-controlled in-memory data, the separately branded fake
    boundary, and existing repository-owned disposable test roots. Preserve
    the cooperative-host limitation and do not infer hostile-kernel,
    same-authority, machine-crash, external transport, live input,
    construction, Docker, runtime, result, or evidence guarantees.
14. A positive decision may close M2A-IBI01 and therefore M2A-IB03/M2A-IB06
    only at Docker-free static/unit cooperative-host implementation scope. It
    may name only the smallest separately reviewed producer-execution contract
    task; it does not approve either producer, fixed input access, external
    communication, construction, Docker, result access, or evidence
    promotion. A blocked decision assigns the smallest remaining M2A-IBI01
    contradiction and does not repair it.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md`
  with an `APPROVED` or `BLOCKED` decision; M2A-IBI01/M2A-IBI02 and
  M2A-IB01 through M2A-IB06 statuses; exact-key behavior and four-field static
  traces; preserved parent-sync/M2A-IBI02, allowlist/import/evidence analysis;
  commands; limitations; and one permitted next boundary
- Minimal authoritative status updates only after the decision
- One concrete `Next:` item

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

Also run focused Prettier checking over the exact identity-verification
allowlist, the saved prompt pair, the new review record, and changed status
files. Record any aggregate failure exactly without editing unrelated files.
Never claim a check passed unless it actually exited successfully.

Do not run either producer, `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`,
npm acquisition/install/pack/approve/rebuild, a lifecycle fixture, compiler,
constructor, image build, Docker, transfer, fixed-root inspection, or result
validation.

# Completion report

- Re-review decision and M2A-IBI01/M2A-IBI02/M2A-IB01 through M2A-IB06 status
- Independently reproduced missing/extra/reordered/inherited/accessor/symbol/
  Proxy attempt-identity traces, including getter/trap non-invocation
- Independently reproduced four-field `.toString()` production guards and
  rejected device/inode/size/mtime `Number` narrowing
- Preserved parent-sync, M2A-IBI02, support/declaration, allowlist/import, and
  evidence-class boundaries
- Changed files and commands actually run with observed results
- Intentionally unrun commands, remaining cooperative-host/runtime
  limitations, and preserved unrelated work
- Confirmation that no producer, input, external communication, construction,
  Docker, runtime/result, or `Observed` evidence was produced
- If approved, only the smallest separately reviewed producer-execution
  contract task without claiming execution authority; if blocked, only the
  smallest remaining M2A-IBI01 remediation
