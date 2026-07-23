# Goal

Perform a fresh independent Docker-free read-only review of only frozen-
research issue #43's bounded M0/M2-A dependency-input static/unit
implementation. Decide M2A-IB01 through M2A-IB06 at implementation scope from
the exact diff, focused fake/static evidence, and contract allowlist. Do not
repair implementation or tests, import or execute either producer, access
future input bytes, use external communication, read the host runtime or
installed package trees, construct a context or image, call Docker, transfer
evidence, or access runtime/result state.

# Read first

- root `AGENTS.md`
- `packages/AGENTS.md`
- `experiments/AGENTS.md`
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
- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md`
- `prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`
- every changed implementation, declaration, verification, test, and status
  path in that prompt's exact allowlist
- this prompt

# Scope

Review the complete bounded dependency-input implementation diff against the
exact M2A-IB06 allowlist. Treat implementation summaries, test names, static
source assertions, and previously reported command passes as claims to
reproduce independently. Do not edit implementation, declarations, tests,
verification, either saved prompt, package/fixture/scenario/result bytes,
Expected, or `Observed`.

The only permitted repository writes are:

- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`
  for the fresh review decision; and
- minimal status/handoff updates in
  `docs/m2-a-evidence-transfer-dependency-input-boundary.md`,
  `docs/m2-a-evidence-transfer-construction-execution-gate.md`,
  `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`.

## M2A-IB01 — acquisition authority and transport

1. Reproduce generation `20260721-01`, npm `12.0.1`, fixed roots/names, and
   the exact sequential metadata/tarball request plans from implementation
   data. Confirm production exposes no argument, stdin, caller path, URL,
   registry, proxy, certificate, credential, header, environment, timeout,
   retry, redirect, backend, or callback authority.
2. Trace exact hostname/port/TLS/server-name/header/content-type/status/
   encoding/content-length/deadline/size/EOF/close rules, metadata selected
   fields, and SRI/SHA-512/SHA-256 correlation. Exercise wrong order, extra
   request, redirect/auth/partial response, arbitrary header, truncation,
   overflow, early EOF, and unknown settlement through separately branded
   fakes only.
3. Confirm the production entry is side-effect-free on import, is unreachable
   from package scripts/ordinary imports/tests/verification/construction, and
   was inspected only as source. No test or static command may import it,
   resolve DNS, open a socket, or communicate externally.

## M2A-IB02 — acquisition filesystem transaction

1. Trace fixed-root absence and exclusive creation through held no-follow
   authority. Confirm a present/uncertain root stops without read, overwrite,
   cleanup, repair, or retry.
2. Reproduce both exact staging-to-final transactions, modes, complete
   same-descriptor rereads, digest/identity checks, known closes,
   non-replacing renames, directory syncs, and final two-file inventory.
   Inject every write/sync/reread/mode/close/rename/root-sync and
   partial-publication fault.
3. Reconstruct canonical `m2a-transfer-acquisition/v1` bytes and reject
   unknown/reordered/extra keys, noncanonical JSON/LF, mismatched archive
   observations, mutable/fake inputs, or any persisted response, credential,
   environment, host identity/path, raw output, or unsanitized error.

## M2A-IB03 — toolchain occurrence and source closure

1. Confirm the no-argument toolchain entry and reusable modules are
   side-effect-free and production authority is fixed/private. Verify tests
   use only separately branded fake filesystem/process-report/clock data and
   never import/execute the entry, read `/usr/bin/node`, consume a live process
   report, or inspect installed package trees/fixed ignored roots.
2. Reproduce the held-parent two-root absence preflight and sole synchronous
   exclusive mode-`0700` `mkdirSync` commit. Model known no-create, `EEXIST`,
   process loss immediately before/after commit, process loss before initial
   checkpoint publication, every post-commit checkpoint fault, and a fresh
   invocation after each durable-state class. Reject any returned initial
   settlement-unknown result, absent consumed state, or present retry.
3. Trace exact attempt-root held identity, parent sync, canonical
   `m2a-transfer-toolchain-attempt/v1` in-progress/failed/unknown/complete
   transactions, one-shot retention, and the barrier forbidding runtime/
   report/tracked/package reads before the fully settled in-progress
   checkpoint.
4. Trace fixed Node version/platform/architecture/type/mode/link/size/hash,
   imported built-ins, bounded dense runtime report, stable no-follow shared-
   object reads, private deterministic ordering, unique identities, and the
   virtual `runtime/constructor-node` row. Exercise every source and report
   inverse without reading live host bytes.
5. Reproduce all three package tuples and the complete first/second source
   tree traversals through the same held directory descriptors. Independently
   reject add/remove/rename/reparent/reorder, directory/file replacement,
   hardlink/case alias, sparse/special/empty files, identity/mode/owner/link
   drift, inaccessible rows, path escape, and traversal disagreement.

## M2A-IB04 — destination completeness and toolchain publication

1. Trace the fixed toolchain root and seven-directory construction as
   operation-specific held-parent transitions. Confirm every unchanged
   sibling retains complete identity before baseline adoption and unknown
   settlement makes the authority unusable.
2. Trace every held-source-to-`*.next` copy, mode/size/SHA-256 relation,
   same-descriptor reread, known source/copy close, exact rename, and parent
   sync. Reject source/copy disconnection, extra/missing/staging/aliased/
   replaced/disconnected destination entries, and premature receipt bytes.
3. Reproduce the complete final physical traversal through the same held
   destination descriptors and its exact cross-binding to the four canonical
   inventory families, seven directories, copied files, and virtual Node row.
4. Reconstruct canonical `m2a-transfer-toolchain/v1` bytes, nested key order,
   package/inventory aggregates, sole `toolchain.next` transaction, final
   root sync, and the receipt-bound complete attempt checkpoint as the last
   mutation. Confirm a visible receipt without that checkpoint is not a
   candidate.

## M2A-IB05 — one-shot and evidence separation

1. Confirm every known failure/unknown branch retains exact reached state and
   permits no later request, source read, copy, publication, cleanup, repair,
   resume, retry, construction, or other producer action.
2. Confirm persisted/terminal data excludes response/package contents, source
   absolute paths, host identities, credentials, environment/home/cache,
   process output, stacks, and unsanitized errors.
3. Trace distinct classes for contract intent, static/unit implementation,
   producer occurrence, visible candidate, independently accepted input,
   construction prerequisite, image/runtime result, and `Observed`. No status,
   test, or verifier may promote one into another.

## M2A-IB06 — allowlist, consumer, untrusted data, and coverage

1. Compare every changed path to the exact M2A-IB06 allowlist. Confirm root
   package scripts, lockfiles, manifests, Containerfiles/container sources,
   adapter/probe/package source, fixtures, scenarios, unrelated production
   entries/declarations, historical/results, Expected, and `Observed` are
   unchanged by the implementation.
2. Inspect the actual `validateConstructorToolchain()` consumer and its
   declaration. Exercise the sole live Node mode `0555`, all copied runtime
   and package modes `0444`, and positive package sizes; reject every
   per-family wrong mode and zero-size package row without changing any other
   constructor schema, aggregate, binding, or execution behavior.
3. Exercise exact-own-data and canonical-byte handling against accessors,
   getters, Proxy traps, symbols, sparse arrays, custom prototypes, inherited
   data, reordered/extra/missing keys, duplicate/case aliases, coercion,
   `toJSON`, mutable projections, noncanonical JSON, and extra LF. Confirm
   rejection does not invoke attacker-controlled hooks.
4. Map focused tests and static checks to every negative family in the
   contract. Do not infer coverage from source strings or positive fakes
   alone. Confirm no test/static command imports either entry, accesses a
   fixed ignored root, reads live runtime/package bytes, opens a socket,
   spawns a child, runs npm/compiler/lifecycle/constructor code, calls Docker,
   or creates input/construction/runtime/result evidence.
5. If a finding remains, record `BLOCKED`, assign the smallest M2A-IBI finding
   ID, and name one bounded Docker-free remediation. Do not repair it in this
   review. If all findings close, approve only later separately reviewed
   producer-execution gates and name one smallest execution-gate contract task;
   do not execute either producer or select future observation values.

# Out of scope

- Any implementation/test/verifier/prompt repair, refactor, formatting write,
  package-script change, scope expansion, or evidence update
- Importing or executing either producer; accessing fixed acquisition/
  toolchain/construction/result roots, `/usr/bin/node` bytes, live process
  reports, installed packages, environment, home/cache, credentials,
  historical result contents, or retained runtime state
- DNS, external/loopback/Unix-socket communication, child processes, npm,
  compiler, lifecycle, constructor, image construction/build, Docker/runtime
  socket, transfer, result review, cleanup, repair, retry, signaling,
  evidence ingestion, or Expected/Observed change
- Selecting an unknown receipt hash, archive SRI, runtime/package
  observation, image ID, execution command, result, alternate generation, or
  later backlog item
- Remote Git, publication, deployment, or third-party communication

# Constraints

- Use only Docker-free repository source inspection, repository-controlled
  in-memory calculations, existing fake backends, and disposable test roots.
- Never import or execute either producer entry. Reproduce entry import safety
  and non-reachability statically.
- Treat a passing test, source name, static string, fake trace, and contract
  heading as claims, not runtime evidence. Reproduce inverse transitions and
  exact byte/identity/settlement relations independently.
- A fake backend cannot broaden production authority or add outcomes that the
  fixed synchronous production primitive lacks.
- Preserve the cooperative repository-owned Linux-host limitation. Do not
  infer hostile-kernel, machine-crash, external transport, live input,
  construction, runtime, or evidence guarantees.
- Preserve unrelated accumulated M3, M4, presentation, result, and user
  working-tree changes.
- No standing authorization is needed or used for this read-only review.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`
  with an `APPROVED` or `BLOCKED` decision, M2A-IB01 through M2A-IB06 status,
  finding-by-finding authority/request/filesystem/attempt/source/copy/
  publication/consumer/import/evidence analysis, exact allowlist, commands,
  limitations, and one permitted next boundary
- minimal authoritative status updates only after the decision
- if approved, at most one smallest separately reviewed producer-execution
  contract task; if blocked, one bounded Docker-free M2A-IBI remediation

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

Also run focused Prettier checking over the exact implementation allowlist,
this prompt pair, the new review record, and changed status files. Record an
aggregate failure exactly without changing unrelated files. Do not run either
producer entry, npm acquisition/install/pack/approve/rebuild, a lifecycle
fixture, compiler/constructor, image build, Docker, transfer, fixed-root
inspection, or result validation.

# Completion report

- Review decision and M2A-IB01 through M2A-IB06 status
- Independently reproduced request/publication, attempt/source/copy/
  publication, constructor-consumer, import-safety, and allowlist boundaries
- Changed files and commands actually run with observed results
- Commands intentionally not run, remaining cooperative-host/runtime
  limitations, and preserved unrelated work
- Confirmation that no input, external communication, construction, Docker,
  runtime/result, or `Observed` evidence was produced
- If approved, the smallest separately reviewed producer-execution contract
  without execution authority; if blocked, the exact bounded M2A-IBI
  remediation
- One concrete `Next:` task
