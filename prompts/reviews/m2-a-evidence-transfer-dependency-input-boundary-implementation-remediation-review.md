# Goal

Perform a fresh independent Docker-free read-only re-review of only frozen-
research issue #43's M2A-IBI01/M2A-IBI02 dependency-input implementation
remediation. Decide whether production now preserves one exactly correlated
held attempt parent/child authority through the synchronous commit, parent
sync, and initial checkpoint transaction, and whether behavioral tests close
the complete runtime/source/destination/every-package-family inverse boundary.
Preserve every closed contract and implementation decision, and do not repair
source or tests or execute either producer.

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
- every changed implementation, declaration, verification, test, and status
  path in that prompt's exact allowlist
- this prompt

# Scope

Review only the M2A-IBI01/M2A-IBI02 remediation diff and its minimal prompt/
status records. Treat implementation summaries, reported command passes,
source markers, fake step names, test names, and positive fake traces as claims
to reproduce. Preserve unrelated accumulated M3, M4, presentation, result, and
user working-tree changes.

The only permitted repository writes are:

```text
docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md
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

- Editing implementation, declaration, test, static verifier, either saved
  prompt, package script, lockfile, manifest, Containerfile/container source,
  adapter/probe/package source, fixture, scenario, historical/result path,
  Expected, or `Observed`
- Importing or executing either producer; reading fixed input/construction/
  result roots, `/usr/bin/node`, a process report, installed packages,
  environment, home/cache, credentials, or retained runtime state
- DNS, external/loopback/Unix-socket communication, child processes, npm,
  compiler, lifecycle, constructor execution, image build, Docker/runtime
  socket, transfer, result validation, cleanup, repair, retry, signaling,
  evidence ingestion, Remote Git, publication, deployment, or third-party
  communication
- Reopening closed M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 without a newly
  reproduced contradiction, redesigning the reviewed contract, or selecting
  future producer observations or evidence

# Constraints

## M2A-IBI01 decision

1. Trace the exact production path from held-parent preflight through the one
   synchronous exclusive `mkdirSync` commit, no-follow child open, exact
   parent/child correlation, held-parent sync, in-progress checkpoint
   transaction, held-root sync, and every owned descriptor close. Confirm the
   original parent is not closed and path-reopened before its sync and that an
   independently reopened child is not substituted before checkpoint
   settlement.
2. Reproduce exact child type, full mode/special-bit absence, effective
   owner/group, link count, and BigInt device/inode/size/mtime correlation
   between lexical child and held descriptor. Reproduce exact parent
   before/after identity and inventory, allowing only the committed child and
   operation-caused metadata transition while preserving unchanged siblings.
3. Inject or behaviorally reproduce parent replacement, child path/descriptor
   mismatch, symlink/alias, wrong type/mode/owner/link/identity, extra/missing
   sibling, pre/post-inventory drift, sync failure, descriptor-close failure,
   and every initial checkpoint failure. Confirm each post-commit branch
   retains the root and reaches no runtime/process-report/tracked-source/
   package read, later publication, cleanup, repair, resume, or retry.
4. Confirm the production path and separately branded fake consume one shared
   private transition/correlation decision. The fake
   `open-attempt-root`/`correlate-attempt-root`/`attempt-parent-sync` names
   alone are not evidence. Reject a fake-only reducer, source-marker-only
   assertion, or static string check that can accept a stronger transition
   than production.
5. Preserve the synchronous commit classification: an absent pre-commit root
   is never-started, while presence at or after commit is the durable
   non-evidence occurrence that blocks every fresh invocation without
   inspection.

## M2A-IBI02 decision

6. Independently execute the shared pure runtime validator against wrong Node
   version/platform/architecture/executable type/mode/link/size/hash; sparse or
   non-dense reports; non-string, relative, duplicate, reordered, path-drifted,
   identity-aliased, or source-disconnected shared-object/runtime rows. Confirm
   no live runtime byte is read.
7. Independently exercise each fixed package family against version,
   integrity, root/path, tree, type, full mode, owner/group, link,
   sparse/nonempty, logical/physical duplicate, case, order, size, and hash
   drift. Reproduce add/remove/rename/reparent, directory/file replacement,
   hard-link alias, first/second traversal disagreement, held-file mismatch,
   inaccessible/unknown rows, and post-first-traversal mutation through the
   production-consumed graph decision.
8. Reproduce destination extra/missing/staging/reordered/aliased/disconnected/
   replaced/wrong-metadata rows, source-to-copy mismatch, and virtual-Node
   duplication. Confirm each contradiction stops before canonical receipt or
   complete checkpoint publication.
9. Through the actual unchanged `validateConstructorToolchain()` consumer,
   independently reject wrong live-Node mode, wrong copied-runtime mode, wrong
   mode for each of TypeScript, `@types/node`, and `undici-types`, and zero
   size for each package family. Require internally consistent recomputed
   family/whole aggregates, canonical receipt bytes, and reviewed hash so each
   case isolates the selected contradiction.
10. Map each required M2A-IB06 negative family to a behavioral test that calls
    the production-consumed pure boundary or actual constructor consumer.
    Confirm the static verifier enforces shared production/fake reachability,
    focused-test execution, absent producer imports, and closed construction
    reachability rather than treating source strings as behavioral evidence.

## Allowlist, import, and evidence decision

11. Compare every changed path to the remediation allowlist. Confirm neither
    producer entry, construction consumer/declaration, root package scripts,
    lockfiles, manifests, Containerfiles/container sources, adapter/probe/
    package sources, fixtures, scenarios, historical/results, Expected, or
    `Observed` changed.
12. Confirm producer authorities and brands remain private and fixed, imports
    remain side-effect-free, fake inputs cannot supply paths/descriptors/
    process objects/environments/runtime reports/package roots/production
    constructors, and verification never imports or executes either entry.
13. Confirm `evidenceReview: "not-performed"`, null reviewed construction
    bindings, false execution approvals, candidate-only visibility, and exact
    separation among contract, implementation, producer occurrence, accepted
    input, construction, runtime result, and `Observed`.
14. Use only repository-controlled in-memory data, the separately branded fake
    boundary, and repository-owned disposable test roots. Preserve the
    cooperative-host limitation and do not infer hostile-kernel,
    same-authority, machine-crash, external transport, live input,
    construction, Docker, runtime, result, or evidence guarantees.
15. A positive decision may close M2A-IBI01/M2A-IBI02 and M2A-IB01 through
    M2A-IB06 only at the Docker-free static/unit cooperative-host
    implementation scope. It may name only one smallest separately reviewed
    producer-execution contract task; it does not approve either producer,
    external communication, fixed host input access, construction, Docker,
    result access, or evidence promotion. A blocked decision assigns the
    smallest remaining M2A-IBI finding and does not repair it.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`
  with an `APPROVED` or `BLOCKED` decision, M2A-IBI01/M2A-IBI02 and
  M2A-IB01 through M2A-IB06 statuses, held-authority trace, behavioral inverse
  matrix, allowlist/import/evidence analysis, commands, limitations, and one
  permitted next boundary
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

Also run focused Prettier checking over the exact remediation allowlist, the
saved prompt pair, the new review record, and changed status files. Record an
aggregate failure exactly without editing unrelated files. Never claim a check
passed unless it actually exited successfully.

Do not run either producer, `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`,
npm acquisition/install/pack/approve/rebuild, a lifecycle fixture, compiler,
constructor, image build, Docker, transfer, fixed-root inspection, or result
validation.

# Completion report

- Re-review decision and M2A-IBI01/M2A-IBI02/M2A-IB01 through M2A-IB06 status
- Independently reproduced held-parent/child/checkpoint/settlement and shared
  production/fake transition evidence
- Independently reproduced runtime/source/destination/every-package-family
  actual-consumer inverse matrix
- Changed files and commands actually run with observed results
- Intentionally unrun commands, remaining cooperative-host/runtime
  limitations, and preserved unrelated work
- Confirmation that no producer, input, external communication, construction,
  Docker, runtime/result, or `Observed` evidence was produced
- If approved, only the smallest separately reviewed producer-execution
  contract task without claiming execution authority; if blocked, only the
  smallest remaining M2A-IBI remediation
