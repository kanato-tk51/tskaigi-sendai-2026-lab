# Goal

Remediate only the Docker-free M3-PC02 through M3-PC05 findings in frozen-
research issue #47's first production raw-to-derived collector contract.
Produce one internally exact contract ready for a fresh independent re-review.
Do not implement or activate the collector and do not ingest an adapter run.

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
- `docs/reviews/m3-harness-and-reports.md`
- `docs/reviews/m3-harness-and-reports-remediation.md`
- `docs/m2-e-codegen-adapter.md`
- `docs/reviews/m2-e-codegen-adapter.md`
- `docs/reviews/p2-selected-profile-codegen-receipts.md`
- `docs/m3-production-raw-to-derived-collector.md`
- `docs/reviews/m3-production-raw-to-derived-collector-contract.md`
- `prompts/reviews/m3-production-raw-to-derived-collector-contract-review.md`
- this prompt

# Required remediation

1. Preserve M3-PC01 and M3-PC06 exactly: codegen `observe` remains the only
   adapter family, v3 remains additive to immutable v2, all manifest/Expected
   identities and unavailable deltas remain fixed, and the implementation
   allowlist does not broaden.
2. Name every raw-content checkpoint. At each checkpoint, require a full read
   of every originally held no-follow descriptor, exact byte-count comparison,
   SHA-256 comparison with the initial accepted digest, and separate descriptor
   object plus logical-path identity checks. Reopening an input is forbidden.
3. Keep the output under only the non-evidence `derived.staging/` name while
   all raw checks, derived write/sync/read-back/identity checks, serialization,
   result construction, and every descriptor close result settle.
4. Make the final atomic rename from exact `derived.staging/` to previously
   absent `derived/` the sole publication commit. Permit no fallible check,
   close, serialization, cleanup, classification, or result construction after
   a successful rename.
5. Define every precommit failure terminal exactly: raw bytes remain unchanged,
   `derived/` remains absent, at most exact run-owned staging is retained for
   diagnosis, only a sanitized internal failure is returned, and the same run
   is neither cleaned up nor retried. A successful rename alone creates the
   exact two- or five-file consumer-visible derived inventory.
6. Expand the future negative matrix to cover same-size in-place mutation at
   every digest checkpoint, descriptor and path drift before commit, close
   failure before commit, rename failure, exact staging retention, published
   absence on every failed branch, and the absence of a postcommit failure
   branch.

# Scope

- `docs/m3-production-raw-to-derived-collector.md`
- new
  `prompts/reviews/m3-production-raw-to-derived-collector-contract-remediation-review.md`
  for a fresh independent Docker-free re-review
- minimal status/handoff updates in `docs/index.md`, `docs/milestones.md`, and
  `docs/frozen-research-execution-plan.md`
- this prompt only if a pre-work ambiguity must be clarified without rewriting
  review history

# Out of scope

- Changing production source, tests, scenarios, static verification, package
  surface, compiled output, raw adapter data, results, examples, matrix, or
  evidence map
- Choosing a runtime identity, profile revision, image digest, run ID, result
  root, command, activation, or measurement generation
- Running an adapter, probe, lifecycle fixture, production collector,
  filesystem-writing build, Docker/container/runtime-socket operation, or
  retained/result-state inspection
- Cleanup, retry, repair, publication, historical P2 backfill, Expected change,
  `Observed` promotion, issue #43, or any later frozen-research item
- External network, credentials, host home/environment, Remote Git,
  deployment, or third-party communication

# Constraints

- Treat raw file content identity and filesystem object/path identity as
  separate checks; a matching device/inode/size does not replace a digest.
- Every repeated digest must come from the originally held descriptor and cover
  exactly its accepted byte count; do not reopen or trust a path read.
- A safely captured content rejection may publish only the already contracted
  sanitized two-file Inconclusive inventory through the same final commit.
- A filesystem rejection or precommit uncertainty never publishes `derived/`.
- Do not solve a precommit failure by deleting or rewriting raw or staging
  objects, by adding a commit marker after rename, or by classifying visible
  complete-looking bytes after rename.
- Preserve the cooperative repository-owned Linux filesystem limitation and do
  not claim authenticity, hostile-kernel resistance, or crash-atomic durability.
- Preserve evidence-class separation: contract/static evidence is not adapter,
  profile, matrix, presentation, runtime-enforcement, or other `Observed`
  evidence.

# Deliverables

- Remediated `docs/m3-production-raw-to-derived-collector.md` resolving the
  stated M3-PC02 through M3-PC05 contradictions at contract scope
- Fresh independent re-review prompt at
  `prompts/reviews/m3-production-raw-to-derived-collector-contract-remediation-review.md`
- Minimal authoritative status updates naming only that re-review as next

# Verification

Use focused read-only contract/reference assertions, a focused formatter check
over changed contract/prompt/status files, and `git diff --check`. Do not run
M3 tests, typecheck, a filesystem-writing build or fixture, an adapter, Docker,
a production collector, result-root inspection, or a broad verification command.

# Completion report

- Exact named digest checkpoints and final publication state machine
- Preserved M3-PC01/M3-PC06, rejection, sanitization, and evidence boundaries
- Changed files and commands actually run
- Commands intentionally not run and remaining evidence limitations
- Exact fresh remediation re-review boundary
- One concrete `Next:` task
