# Goal

Perform a fresh independent Docker-free read-only review of frozen-research
issue #43's proposed npm-acquisition/constructor-toolchain dependency-input
boundary. Decide M2A-IB01 through M2A-IB06 at contract scope. Do not repair the
contract, implement either producer, acquire or inspect future input bytes, use
external communication, read the host runtime/toolchain, construct a context
or image, call Docker, or access runtime/result state.

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
- all construction/execution-gate contract and implementation review records
  routed by `docs/index.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation.md`
- `docs/m2-a-evidence-transfer-dependency-input-boundary.md`
- this prompt

# Scope

Review only the proposed dependency-input contract, this saved review prompt,
their minimal five status records, and repository-controlled tracked source
needed to reproduce fixed schemas, constants, validators, allowlists, package
tuples, and aggregates. Treat every path, mode, key order, URL, request policy,
numeric bound, transition, source family, receipt field, non-authority claim,
and later-approval statement as a claim to verify.

Preserve all unrelated M3, M4, presentation, result, and user working-tree
changes. Do not inspect ignored `.work` roots, installed package trees,
`/usr/bin/node`, the host environment/home/cache, credentials, runtime state,
or historical result contents.

# Required decisions

## M2A-IB01 — npm acquisition authority

1. Confirm the only future candidate is the no-argument, empty-environment
   `/usr/bin/node` acquisition entry and that contract approval cannot execute
   it or substitute standing authorization for the required future external-
   communication authority.
2. Reproduce the exact two-request HTTPS order, host/port/server-name, fixed
   metadata/tarball URLs, TLS/credential/proxy/redirect/compression/connection
   policy, deadlines, response bounds, and zero-retry/no-child boundary.
3. Trace untrusted metadata and tarball handling. Confirm exact package/version/
   tarball URL, registry SHA-512 SRI, streamed SHA-512/SHA-256/byte-count
   correlation, status/EOF/close settlement, and no npm/extraction/script/
   lifecycle behavior before publication.
4. Confirm actual integrity, size, and SHA-256 are explicitly unknown future
   observations rather than omitted implementer choices or fabricated contract
   evidence.

## M2A-IB02 — npm publication

1. Model the exclusive mode-`0700` root and exact two `.next` names through
   same-descriptor archive/receipt write, sync, reread, hash/byte comparison,
   mode-`0444` transition, close, rename, and directory sync.
2. Reproduce the exact ordered `m2a-transfer-acquisition/v1` schema and fixed
   values. Confirm the canonical receipt binds only the held metadata/archive
   observations and remains `evidenceReview: "not-performed"`.
3. Inject response, filesystem, identity, sync, close, and rename failures at
   every boundary. Confirm no later request/publication/producer/construction,
   cleanup, overwrite, resume, or retry is contractually permitted and that a
   partial visible root cannot become evidence.

## M2A-IB03 — toolchain source closure

1. Confirm the toolchain producer is separately gated, argument-free,
   empty-environment, offline, child-free, and limited to `/usr/bin/node`, its
   own process report's exact shared-object paths, and the three fixed
   repository-local package roots.
2. Verify the fixed Node `v20.18.2`/Linux/x64, full mode/link/type/sparse/
   descriptor policy and the exact pre-report built-in import set. Confirm the
   producer cannot use `/proc`, directory discovery, another process, alternate
   executable, home/cache/global inputs, or persist private absolute paths.
3. Reproduce the runtime logical naming and source-to-copy correlation,
   including the live `runtime/constructor-node` exception, deterministic
   shared-object ordering, copied mode, and rejection of missing/extra/
   duplicate/aliased/disconnected rows.
4. Reproduce the 41-row aggregate and exact TypeScript `5.9.3`, `@types/node`
   `20.19.43`, and `undici-types` `6.21.0` lockfile integrities. Verify complete
   lexical regular-file traversal/copy under only the three fixed logical
   package prefixes with no install, execution, resolver, or network fallback.

## M2A-IB04 — toolchain publication

1. Model every held source, exclusive copied-file `.next` transaction,
   normalization to mode `0444`, same-byte/hash correlation, close, rename,
   containing-directory sync, and no-replacement rule before receipt creation.
2. Reproduce the exact ordered `m2a-transfer-toolchain/v1` top-level, runtime,
   package, and inventory schemas. Confirm the four-family lexical inventory,
   package/runtime/whole aggregates, live executable row, and complete copied
   file set are one connected candidate.
3. Confirm `toolchain.json` uses only `toolchain.next`, publishes only after all
   source/copy settlements, remains `evidenceReview: "not-performed"`, and
   cannot self-bind the constructor's currently null reviewed constants.
4. Force report/source/traversal/copy/receipt/sync/close/rename uncertainty and
   confirm retention-only, no cleanup/retry, no later producer/construction,
   and no candidate approval.

## M2A-IB05 — failure, review, and evidence classes

1. Confirm each input producer is one-shot for generation `20260721-01`, the
   two outcomes are reviewed independently, and neither consumes or modifies
   the runtime tuple, historical evidence, Expected, or `Observed`.
2. Confirm contract, implementation, producer execution, visible candidate,
   accepted input, construction, image, runtime, result, and evidence classes
   remain distinct. A successful producer is not an accepted construction
   input before fresh result review and a later bounded binding update.
3. Verify persisted and terminal data exclude response/package contents,
   credentials, environment, source absolute runtime paths, home/cache paths,
   host identities, raw output, and unsanitized errors, while the cooperative-
   host/DNS/TLS/filesystem limitations remain explicit.

## M2A-IB06 — implementation boundary

1. Reproduce the exact later implementation/status/prompt allowlist and prove
   package scripts, lockfile, manifests, Containerfile/container sources,
   adapter/probe/packages, fixtures, scenarios, existing construction/runtime
   entries, results, Expected, and `Observed` are outside it.
2. Map the complete fake-only negative matrix to request, stream, metadata,
   archive, Node/runtime, package, filesystem, receipt, aggregate, import,
   reachability, present-root, failure, retry/cleanup, and evidence-promotion
   contradictions.
3. Confirm tests cannot import an entry, access fixed ignored roots, installed
   package or host runtime bytes, DNS/network/socket state, a real child, npm,
   compiler, lifecycle, constructor, or Docker.
4. Confirm the maximum positive decision approves only one Docker-free static/
   unit implementation and does not approve either later producer execution.

# Out of scope

- Contract repair, implementation/declaration/test/static-verifier/package-
  script changes, acquisition, host runtime/package reads, production entry,
  compiler, constructor, context/image construction, Docker/runtime-socket
  action, lifecycle, transfer, result access, cleanup, or evidence promotion
- Inspecting or creating either fixed input root, the fixed construction/
  result roots, root installed package bytes, `/usr/bin/node`, process reports,
  host environment/home/cache/credentials, Docker state, or historical results
- External network, loopback/Unix-socket communication, Remote Git,
  publication, deployment, or third-party communication
- Changing the fixed tuple, receipt schemas, prior closed findings, existing
  transfer/construction implementation, historical evidence, Expected, or
  `Observed`

# Constraints

- Use only read-only repository-controlled tracked source inspection and
  in-memory schema/hash/model calculations.
- Distinguish fixed contract intent from observed future input values. Do not
  invent npm integrity, archive size/hash, runtime closure, inventory, receipt
  digest, or reviewed binding.
- Verify exact key sequences, modes, path families, bounds, transitions, and
  failure branches; do not infer closure from headings or positive examples.
- A blocked decision must name only the smallest remaining contract gap. Do
  not repair it or defer a contract choice to implementation/runtime evidence.
- No standing authorization is used in this documentation-only review.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary.md` with an
  `APPROVED` or `BLOCKED` decision, M2A-IB01 through M2A-IB06 statuses,
  reproduced fixed identities/schemas/transitions, commands run, limitations,
  and one permitted next boundary
- minimal status updates in `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`
- one concrete `Next:` item

# Verification

- Recompute the exact tracked 31-row and 41-row aggregates in memory from only
  the listed repository-controlled tracked files.
- Reproduce the current pure acquisition/toolchain receipt validator schemas
  and the proposed request/publication/toolchain state machines without
  importing either future entry or accessing fixed roots.
- Run focused Prettier checking over the contract, this prompt, the new review
  record, and the five changed status records.
- Run `git diff --check`.
- No test is required for this documentation-only review. If a static/unit
  command is run, report it exactly and do not treat it as input, construction,
  runtime, transfer, or evidence proof.

# Completion report

- Decision and M2A-IB01 through M2A-IB06 status
- Reproduced npm request/archive/receipt and toolchain source/copy/receipt
  boundaries
- Changed files and commands actually run
- Intentionally unrun commands, remaining limitations, evidence class, and
  exact next boundary
- One concrete `Next:` task
