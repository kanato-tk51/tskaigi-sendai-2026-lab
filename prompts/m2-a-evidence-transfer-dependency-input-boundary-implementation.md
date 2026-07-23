# Goal

Implement exactly one bounded Docker-free frozen-research issue #43 M0/M2-A
dependency-input static/unit task after the positive M2A-IB01 through M2A-IB06
contract review chain. Add only the two fixed input producers, their
side-effect-free support library and declarations, separately branded fake
backends, strict validators, the actual constructor-consumer correction,
static checks, focused tests, and minimal handoff records allowed by
M2A-IB06. Do not execute either producer, access future input bytes, use
external communication, read the host runtime or installed package trees,
construct a context or image, call Docker, transfer evidence, or access
runtime/result state.

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
- this prompt

# Scope

Change only the exact M2A-IB06 implementation allowlist:

```text
experiments/npm12-install/scripts/m2a-transfer-inputs.mjs
experiments/npm12-install/scripts/m2a-transfer-inputs.d.mts
experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs
experiments/npm12-install/scripts/capture-m2a-transfer-toolchain.mjs
experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs
experiments/npm12-install/scripts/m2a-transfer-construction.mjs
experiments/npm12-install/scripts/m2a-transfer-construction.d.mts
tests/m2a-evidence-transfer.test.ts
experiments/npm12-install/README.md
docs/m2-a-evidence-transfer-dependency-input-boundary.md
docs/m2-a-evidence-transfer-construction-execution-gate.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md
prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md
```

## M2A-IB01 — fixed npm acquisition authority

1. Preserve generation `20260721-01`, npm `12.0.1`, the fixed acquisition
   root/archive/receipt names, and the exact contract-owned two-request HTTPS
   plan. Expose no caller-selected argument, stdin, URL, hostname, registry,
   proxy, certificate, credential, header, version, path, timeout, retry,
   redirect, output, environment, or callback authority.
2. Keep pure request planning, untrusted response validation, canonical
   receipt construction, filesystem transitions, and production authority
   separate. Production authority must be private and fixed internally.
   Tests may use only separately branded fake HTTPS, filesystem, and clock
   backends with in-memory metadata/tarball chunks and disposable
   repository-owned roots.
3. Implement exactly the sequential metadata-then-tarball order, TLS/header/
   content-type/status/content-encoding/content-length policy, request and
   close deadlines, byte bounds, no redirect/retry/connection reuse, strict
   ordinary metadata JSON selection, and metadata-SRI/tarball
   SHA-512/SHA-256 correlation fixed by the contract. Unknown stream/request/
   response close settlement must stop before publication.
4. Keep the no-argument acquisition entry import-safe. Static/unit
   verification must inspect it as source and must never import or execute it,
   resolve DNS, open a socket, or communicate externally.

## M2A-IB02 — atomic acquisition publication

1. Implement exact absence preflight, exclusive mode-`0700` root creation,
   held no-follow descriptor authority, and the sole
   `npm-12.0.1.tgz.next`/`acquisition.next` staging transactions. A present or
   uncertain root is terminal without inspection, overwrite, cleanup, repair,
   or retry.
2. Bind every staged file to exclusive mode-`0600` create, bounded complete
   write and sync, same-descriptor reread and byte/digest comparison,
   mode-`0444` transition, identity revalidation, known close, exact
   non-replacing rename, and held-directory sync. Success leaves exactly the
   archive and canonical one-line `m2a-transfer-acquisition/v1` receipt.
3. Preserve exact ordered receipt keys and fixed fields, with only the
   observed archive size, SHA-256, and metadata SRI filling their reviewed
   observation positions. Persist no response content, raw output, credential,
   environment, host path/identity, or unsanitized error.

## M2A-IB03 — fixed constructor-toolchain source closure

1. Implement the fixed no-argument toolchain entry with a privately branded
   production filesystem/process-report/clock authority. It must be
   side-effect-free on import and accept no caller authority. Tests use only
   separately branded fake backends and synthetic runtime reports/package
   graphs; they must not import or execute the entry, read `/usr/bin/node`, or
   read installed package bytes.
2. Before any host runtime, process-report, tracked-source, or installed-
   package read, reproduce the held-parent two-root absence preflight and
   exactly one synchronous, non-recursive, exclusive mode-`0700`
   `mkdirSync` commit for the fixed attempt root. The initial primitive has no
   returned settlement-unknown result. Known no-create and pre-commit process
   loss leave no occurrence; normal return or process loss at/after commit
   leaves the durable root and consumes the generation.
3. Implement the held-root correlation, parent sync, and canonical
   `attempt.next`/`attempt.json` in-progress transaction before source reads,
   plus the exact sanitized failed/settlement-unknown/complete replacement
   states. Every post-commit failure retains the root and forbids a later
   invocation from opening either fixed root, cleaning, repairing, resuming,
   or retrying.
4. Enforce the exact `/usr/bin/node` version/platform/architecture/type/mode/
   link/size/hash closure, dense bounded process-report shared-object array,
   imported-built-in boundary, stable no-follow file reads, unique physical
   identities, deterministic private ordering, and the virtual
   `runtime/constructor-node` row.
5. Reproduce the three fixed package tuples and complete first/second
   bytewise lexical source-tree traversals through the same held directory
   descriptors. Bind every parent/name/type/full-mode/owner/group/link and
   BigInt identity, reject all added/removed/renamed/reparented/aliased/
   replaced/inaccessible/uncertain rows, and keep admitted file descriptors
   held through their copy transactions.

## M2A-IB04 — atomic toolchain publication

1. Create only the fixed mode-`0700` toolchain root and seven destination
   directories under held no-follow parent authority. Every operation-specific
   transition must prove the intended child change while preserving the
   complete identities of unchanged siblings.
2. Copy each admitted source to its exact logical destination through the
   held source descriptor and one `<final-name>.next` transaction. Require
   mode `0444`, one link, stable source/copy size and SHA-256, known
   descriptor settlement, exact non-replacing rename, and containing-directory
   sync before advancing.
3. Before receipt bytes exist, perform the complete final physical traversal
   through the same held destination descriptors. Cross-bind exactly the
   seven directory rows, every copied file, and the absence of staging,
   control, extra, missing, disconnected, aliased, or virtual-Node duplicate
   rows to the canonical inventory.
4. Publish only canonical one-line `m2a-transfer-toolchain/v1`
   `toolchain.json` bytes through the exact `toolchain.next` transaction.
   After the receipt and root sync settle, perform only the separate
   attempt-root complete-checkpoint replacement binding the exact receipt
   SHA-256 and inventory aggregate. This is the final producer mutation.

## M2A-IB05 and M2A-IB06 — one-shot, consumer, and test boundary

1. Preserve one-shot failure/unknown retention, no cleanup/repair/resume/
   retry, candidate-only visibility, `evidenceReview: "not-performed"`, null
   construction reviewed bindings, and separation among implementation,
   producer occurrence, accepted input, construction, runtime result, and
   `Observed`.
2. Change `validateConstructorToolchain()` and its declaration only as allowed:
   the sole `runtime/constructor-node` inventory row must have mode `0555`;
   every other runtime row and every package row must have mode `0444`; and
   every package row must have positive size. Do not change any other
   constructor schema, aggregate, reviewed-binding, execution, or public
   behavior.
3. Make reusable code exact-own-data and canonical-byte safe for untrusted
   records and arrays. Reject missing/extra/reordered keys, accessors, symbols,
   sparse arrays, custom prototypes, Proxy-mediated values, duplicate/case
   aliases, type/range/path drift, noncanonical JSON, extra LF, mutation, and
   attacker hooks without invoking getters, iterators, coercion, or `toJSON`.
4. Add the complete M2A-IB06 positive and negative matrix: arguments/
   environment; request/TLS/header/status/encoding/deadline/size/EOF/close;
   metadata/version/tarball/SRI; archive/receipt path/byte/mode/identity/order/
   partial publication; runtime/report/shared-object; package tuple/tree/type/
   link/sparse/case/order/hash and both traversal disagreements; destination
   graph/staging/disconnection; source-copy correlation; attempt commit/
   checkpoint/process-loss/fresh-invocation transitions; rejection of an
   initial returned `unknown`; receipt/schema/aggregate; every wrong family
   mode and zero-size package row through the actual consumer; present roots;
   post-failure action; retry/cleanup; import effects; construction
   reachability; and evidence/reviewed-binding promotion.
5. Extend static verification to prove both entries remain outside package
   scripts, ordinary imports, tests, construction/runtime activation, and
   verification execution. Do not add an execution command or import either
   entry as a shortcut.

# Out of scope

- Executing or importing either production entry; acquiring, inspecting,
  hashing, copying, or publishing future npm/toolchain input bytes
- Reading the real `/usr/bin/node`, process report, installed package trees,
  fixed ignored acquisition/toolchain/construction/result roots, environment,
  home/cache, credentials, historical results, or retained runtime state
- DNS, external/loopback/Unix-socket communication, a child process, npm,
  compiler, lifecycle, constructor, image build, Docker/runtime socket,
  transfer, result review, cleanup, retry, repair, or signaling
- Changing root package scripts, lockfiles, manifests, Containerfiles,
  container sources, adapter/probe/package source, fixtures, scenarios,
  production modules or declarations outside the allowlist, historical/result
  paths, Expected, or `Observed`
- Selecting or accepting future receipt digests, archive SRI, runtime/package
  observations, image IDs, execution commands, results, or evidence
- External network, Remote Git, publication, deployment, or third-party
  communication

# Constraints

- Keep all production authority private and fixed; no public API may accept a
  path, URL, environment, executable, source tree, command, clock, backend,
  callback, or retry policy.
- Use only in-memory synthetic data and disposable repository-owned temporary
  roots in tests. A fake backend must be separately branded and cannot add a
  production outcome such as an initial settlement-unknown create result.
- Await every owned stream, descriptor, timer, and fake operation fail closed.
  Unknown settlement forbids all later source, network, filesystem,
  publication, construction, or evidence action.
- Do not weaken the cooperative repository-owned Linux-host limitation or
  claim hostile-kernel, machine-crash, transport, runtime, or evidence proof.
- Preserve unrelated accumulated M3, M4, presentation, result, and user
  working-tree changes.
- Neither input-producer execution is covered by standing authorization.
  Standing authorization is not needed or used for this Docker-free
  implementation.

# Deliverables

- the complete bounded M2A-IB01 through M2A-IB06 Docker-free static/unit
  implementation under the exact allowlist
- side-effect-free support/declaration modules and two no-argument production
  entry sources that are never imported or executed by verification
- separately branded fake-only HTTPS/filesystem/process-report/clock coverage
  and the complete focused inverse matrix
- strict actual-constructor consumer mode/size enforcement
- minimal authoritative status updates naming only the fresh independent
  Docker-free implementation review as next

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

Also run a focused Prettier check over the exact implementation allowlist and
saved prompt pair. Record any aggregate failure exactly and keep a
pre-existing out-of-scope failure distinct from focused task results. Do not
run either producer entry, npm acquisition/install/pack/approve/rebuild, a
lifecycle fixture, compiler/constructor, image build, Docker, transfer,
fixed-root inspection, or result validation.

# Completion report

- M2A-IB01 through M2A-IB06 implementation status
- Exact npm request/publication, toolchain occurrence/source/copy/publication,
  constructor-consumer, import-safety, and one-shot boundaries implemented
- Changed files and commands actually run with observed results
- Commands intentionally not run and remaining cooperative-host/runtime
  limitations
- Evidence class and confirmation that no input, external communication,
  construction, Docker, runtime/result, or `Observed` evidence was produced
- Exactly one concrete `Next:` task naming the fresh independent Docker-free
  implementation review
