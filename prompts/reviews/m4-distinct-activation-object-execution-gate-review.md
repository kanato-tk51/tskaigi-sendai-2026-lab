# Goal

Perform a fresh independent Docker-free read-only review of only the issue #45
M4 distinct activation-object execution-gate contract. Decide M4-AG01 through
M4-AG06 and whether exactly one bounded Docker-free wrapper/rebind
implementation may begin. Do not implement, import, or execute the activation
object and do not approve or run the proposed command.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `docs/index.md`
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md` deferred high-assurance section
- `docs/milestones.md` M4 and frozen-research sections
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/m4-exact-filesystem-identity.md`
- `docs/m4-distinct-activation-object.md`
- `docs/m4-distinct-activation-object-execution-gate.md`
- `docs/reviews/m4-execution-profiles-offline-build-execution-gate.md`
- `docs/reviews/m4-execution-profiles-offline-build-recovery.md`
- `docs/reviews/m4-execution-profiles-run-controls-remediation.md`
- `docs/reviews/m4-exact-filesystem-identity-implementation-remediation.md`
- `docs/reviews/m4-distinct-activation-object-contract-remediation.md`
- `docs/reviews/m4-distinct-activation-object-implementation.md`
- `prompts/m4-distinct-activation-object-implementation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Required decisions

1. **M4-AG01 — fresh immutable generation:** independently prove that
   `m4-activation-expected-20260720-02`, the two `20260720-02` run IDs, exact
   roots, and exact container names are mutually consistent and distinct from
   the exhausted `20260720-01` generation. Confirm that retaining profile
   revision `m4-profile-v1` and the recovered same-image digest is necessary
   for the existing fixture rather than an Expected/Observed rewrite. Do not
   inspect either old or new root and do not inspect Docker.
2. **M4-AG02 — construction and inventory delta:** independently construct the
   two run-ID literal replacement in memory with pinned TypeScript `5.9.3`.
   Reproduce the proposed constants source/JavaScript/declaration hashes, all
   three updated activation manifests, unchanged activation bytes and
   22-source/22-JavaScript/22-declaration/21-executable sets, unchanged profile
   bytes, and the proposed 32-source/64-output post-wrapper inventory. Reject
   any unlisted production or compiled change.
3. **M4-AG03 — complete held identity:** reconcile the exact directory/file
   lease, no-follow one-link regular-file rules, private BigInt metadata,
   peer-owner/full-mode relations, pairwise non-aliasing, exact byte/hash
   checks, two pre-spawn validations, two post-`close` validations, path-only
   consumption, old-root non-access, and cooperative-host limitation. Confirm
   that no accepted result or cleanup can occur on drift or before `close`.
4. **M4-AG04 — process and settlement:** verify the no-argument package edge,
   fixed single child executable/argv/cwd/empty environment/stdio/process
   group, 90-second and 65,536-byte bounds, TERM/KILL sequence, monotonic first
   failure, no second spawn, and terminal late-close lease ownership. Determine
   whether unknown settlement is fail-closed without creating an unsafe
   automatic retry or handle-release branch.
5. **M4-AG05 — output, side effects, and retention:** validate the strict child
   pair-result framing and exit correlation, exact outer schema/keys/step
   prefixes/classification, public identity projection, suppression on
   identity/settlement failure, fixed backend side-effect ceiling, exact new
   root retention, no old-state/build-tag access, no post-attempt Docker or
   cleanup broadening, and mandatory later result review.
6. **M4-AG06 — implementation and evidence separation:** verify the exact
   implementation/test allowlist and Docker-free verification boundary. A
   positive decision may approve only one bounded implementation plus a later
   implementation/gate review; it must not approve the proposed command,
   choose another generation, access a result root, change Expected/Observed,
   or treat contract/static evidence as runtime evidence.

# Review method

- Inspect the complete working-tree diff and preserve unrelated prior issue
  #45 work.
- Recompute the proposed constants and all changed manifests in memory; do not
  emit compiler output to disk.
- Derive every run root/container name and compare exact strings without
  probing the paths or Docker.
- Trace the wrapper contract against the current identity helper, production
  backend, pair-result types, ordinary fail-closed entry, dormant activation
  bytes, package scripts, and nested safety rules.
- Use deterministic source/AST/schema assertions where useful, but never
  import the activation entry or a future wrapper.
- Record Expected contract requirements separately from observed static
  calculations.
- If a finding exists, record one bounded contract-remediation prompt. Do not
  repair the contract during this review.

# Out of scope

- Adding or editing the wrapper, constants, compiled outputs, tests, verifier,
  profile README/JSON, package script, backend, activation/ordinary entry,
  fixture, input, result, or historical evidence
- Importing or executing the activation object; compiling to disk; running
  `npm run m4:doctor`, `npm run m4:build`,
  `npm run m4:recovery:offline-build`, `npm run m4:run:controls`, the proposed
  `m4:execute:frozen-research` command, another production executor, or a
  probe/lifecycle fixture
- Docker/container/runtime-socket access, retained-state or result-root
  inspection, path-existence probes for old or new roots, cleanup, retry,
  repair, process signaling, or external communication
- Approving the one-shot command, using standing authorization, changing
  Expected/Observed, or starting issue #46 or another backlog item
- External network, credentials, host home/environment, Remote Git,
  publication, deployment, or third-party communication

# Deliverables

- `docs/reviews/m4-distinct-activation-object-execution-gate.md` with an
  `APPROVED` or `BLOCKED` contract decision, M4-AG01 through M4-AG06
  finding-by-finding analysis, independently reproduced construction values,
  process/identity/output/retention analysis, evidence classes, and the exact
  one permitted next boundary
- Minimal status updates in
  `docs/m4-distinct-activation-object-execution-gate.md`,
  `docs/m4-distinct-activation-object.md`,
  `docs/m4-exact-filesystem-identity.md`, `docs/index.md`, and
  `docs/frozen-research-execution-plan.md`
- If blocked, one narrow saved contract-remediation prompt; if approved, name
  only one bounded Docker-free implementation and its later independent review

# Verification

Use only Docker-free read-only source/hash/compiler/AST/schema assertions,
focused formatting, and `git diff --check`. Running the existing `npm run
m4:verify` is optional only if the reviewer needs proportional regression
evidence; it still must not import the distinct entry. Do not compile to disk,
run the wrapper/entry/production executor, access roots or Docker, or execute a
runtime experiment.

# Completion report

- Decision and M4-AG01 through M4-AG06 status
- Independently reproduced generation/construction/manifest values
- Identity/process/output/result-retention assessment
- Changed review/status files and commands actually run
- Commands intentionally not run and remaining limitations
- Exact approved implementation or blocked remediation boundary
- One concrete `Next:` task
