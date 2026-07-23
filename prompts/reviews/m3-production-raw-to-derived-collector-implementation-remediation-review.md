# Goal

Perform a fresh independent Docker-free read-only re-review of only frozen-
research issue #47's bounded implementation remediation. Decide whether the
exact 12-event cross-kind comparison and immediate post-open descriptor
settlement gaps are closed while every previously accepted M3-PC01 through
M3-PC06 boundary remains intact. Do not repair implementation or tests,
activate or ingest the collector, or define a runtime gate.

# Read first

- root `AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md` deferred high-assurance section
- `docs/milestones.md` M3 and frozen-research sections
- `docs/codex-workflow.md`
- `docs/experiment-protocol.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- `docs/m3-production-raw-to-derived-collector.md`
- `docs/reviews/m3-production-raw-to-derived-collector-contract.md`
- `docs/reviews/m3-production-raw-to-derived-collector-contract-remediation.md`
- `prompts/m3-production-raw-to-derived-collector-implementation.md`
- `prompts/reviews/m3-production-raw-to-derived-collector-implementation-review.md`
- `docs/reviews/m3-production-raw-to-derived-collector-implementation.md`
- `prompts/m3-production-raw-to-derived-collector-implementation-remediation.md`
- every changed production and verification path in the exact M3-PC06
  allowlist
- this prompt

# Review target

Review only the issue #47 remediation diff and its minimal status/prompt
records. Treat all reported passes and finding closure as claims to reproduce.
Do not edit implementation or verification paths. Preserve unrelated M4,
presentation, and user changes.

# Required decisions

1. **M3-PC01:** prove the comparator uses the exact locally frozen 12 event
   identities across route, attempt, and tool kinds, while preserving all
   per-kind semantic/hash records and v2/v3 boundaries. Reproduce a canonical
   producer-sequence-valid cross-kind permutation that stays complete but
   cannot remain an Expected match.
2. **M3-PC02:** confirm original held-descriptor initial/R1/R2 content and
   filesystem identity behavior is unchanged.
3. **M3-PC03:** trace every successful open in the directory, raw-file, and
   staged-file helpers. Confirm it enters the close-settlement set before the
   first descriptor `stat()` or any other later fallible operation, every
   injected pre-stat failure settles all owned handles, and final rename
   remains the last fallible operation.
4. **M3-PC04:** reproduce focused behavioral/static coverage for all three
   open-helper families, raw preservation, published absence, bounded staging,
   and no cleanup/retry, in addition to the existing negative matrix.
5. **M3-PC05:** confirm no activation, historical input, runtime evidence,
   matrix/presentation, or `Observed` promotion was introduced.
6. **M3-PC06:** compare every changed path with the unchanged allowlist and
   confirm the new tests/static assertions directly observe both findings
   without adding a CLI/runner/package/adapter/probe/container/runtime edge.

# Review method and safety boundary

- Inspect the complete remediation diff and source/test/static-verifier
  ordering; do not accept marker names without matching behavioral evidence.
- Rerun `npm run m3:verify` and
  `npm run verify:static --workspace packages/probe-core`; reproduce broader
  root claims only as useful, and record any aggregate `npm run check` failure
  without editing unrelated files.
- Use only repository-owned in-memory values and disposable test roots.
- Do not run `npm run m3:run:fixture`, adapters, probes, lifecycle fixtures,
  production collection, Docker/runtime sockets, retained/historical/result
  state access, cleanup, retry, publication, deployment, Remote Git, external
  network, credentials, or third-party communication.

# Decision boundary

The maximum positive decision closes M3-PC01 through M3-PC06 only at the
Docker-free static/unit implementation boundary. It does not approve ingestion,
activation, runtime identity/command, a result review, or `Observed`
promotion. A blocked decision must name only the smallest remaining issue #47
remediation.

# Deliverables

- `docs/reviews/m3-production-raw-to-derived-collector-implementation-remediation.md`
  with an `APPROVED` or `BLOCKED` decision, finding-by-finding evidence,
  exact changed-path and transaction analysis, commands actually run,
  limitations, and one permitted next boundary
- minimal status updates in `docs/m3-production-raw-to-derived-collector.md`,
  `docs/index.md`, `docs/milestones.md`, and
  `docs/frozen-research-execution-plan.md`
- one concrete `Next:` item

# Completion report

- Decision and M3-PC01 through M3-PC06 status
- Independently reproduced event-order, descriptor ownership/settlement,
  sole-rename, rejection, evidence, allowlist, and verification evidence
- Changed files and commands actually run
- Unrun commands, evidence classes, remaining limitations, and the exact next
  boundary
