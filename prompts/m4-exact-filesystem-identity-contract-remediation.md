# Goal

Remediate only the four Docker-free issue #45 exact filesystem-object identity
contract findings M4-FS01 through M4-FS04. Produce one internally closed
contract ready for a later fresh independent re-review. Do not implement or
execute the contract.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `docs/index.md`
- `docs/frozen-research-execution-plan.md`
- `docs/m4-exact-filesystem-identity.md`
- `docs/reviews/m4-exact-filesystem-identity-contract.md`
- `docs/milestones.md` M4 and frozen-research sections
- `docs/codex-workflow.md`
- `docs/presentation-scope.md` deferred high-assurance section
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/reviews/m4-execution-profiles-offline-build-backend.md`
- `docs/reviews/m4-execution-profiles-offline-build-execution-gate.md`
- `docs/reviews/m4-execution-profiles-offline-build-recovery.md`
- `docs/reviews/m4-execution-profiles-run-controls-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Required remediation

1. **M4-FS01:** add an exact private ownership rule. Bind BigInt `uid`/`gid` or
   explicitly and rigorously narrow ownership out of each role's accepted
   identity. Fix every permitted host-created, container-created, and
   CLI-materialized ownership transition without exposing raw ownership.
2. **M4-FS02:** close activation sequencing. Either fix distinct activation
   source/compiled logical paths and include their non-export/non-script
   boundary in the first implementation, or defer activation to one separately
   named task and remove it from that implementation's acceptance. Keep the
   ordinary fail-closed source/output unchanged; do not choose a runtime command
   or future run tuple.
3. **M4-FS03:** replace the `m4-file-*` projection with one exact public
   transfer shape and exact-key semantics. Name every executor/type/backend/test/
   static path class the implementation may change and ensure no public value is
   derived only from private device/inode data.
4. **M4-FS04:** add an exhaustive result/scratch role table covering every fixed
   basename and producer. Fix absent-parent conditions, full file mode, private
   ownership relation, size/canonical/hash bound, descriptor lifetime,
   settlement event, CLI metadata preservation or host normalization, post-use
   validation, and cleanup/retention.
5. Reconcile the final "smallest later implementation" allowlist and acceptance
   bullets with all four decisions. Do not leave a role or schema change to
   implementer choice.

# Scope

- `docs/m4-exact-filesystem-identity.md`
- minimal status/handoff updates in `docs/index.md` and
  `docs/frozen-research-execution-plan.md`
- `prompts/reviews/m4-exact-filesystem-identity-contract-remediation-review.md`
  for a fresh independent Docker-free re-review
- this prompt only if a pre-work ambiguity must be clarified without rewriting
  its review history

# Out of scope

- M4 source, type, test, static-verifier, profile, compiled-output, package
  script, fixture, staging, or result implementation changes
- Choosing a new Expected revision, run ID, result root, container identity,
  activation command, or execution gate
- Docker/container/runtime-socket access, retained M4 state, staging rebuild,
  profile execution, probe/lifecycle execution, cleanup, retry, or result repair
- Issue #46 or later frozen-research backlog work
- External network, credentials, host home, Remote Git, publication, deployment,
  or third-party communication

# Constraints

- Preserve the cooperative-host limitation; do not claim atomic race resistance
  for path-only external tools.
- Keep private filesystem metadata out of public results, stdout/stderr, errors,
  and Markdown evidence values.
- Preserve process `close` settlement, fail-closed unsupported behavior,
  no-repair/no-retry semantics, identity-checked cleanup, and Inconclusive
  mapping.
- Keep host-direct, container-direct, fixed runtime-CLI materialization, and
  route-specific official tool API evidence classes distinct.
- Do not alter or reinterpret any historical run/result or promote any
  `Observed` evidence.

# Deliverables

- Remediated `docs/m4-exact-filesystem-identity.md` closing M4-FS01 through
  M4-FS04 at contract scope
- `prompts/reviews/m4-exact-filesystem-identity-contract-remediation-review.md`
  for a fresh independent read-only re-review
- Minimal authoritative handoff updates naming only that re-review as next

# Verification

Use only focused read-only tracked-source/contract assertions. `git diff
--check` and a focused formatter check over changed contract/prompt/status files
may be run. Do not run tests, typecheck, build, staging, Docker, a lifecycle
fixture, a production executor, or broad verification.

# Completion report

- Exact ownership, activation, public projection, and result-role decisions
- Reconciled implementation path/acceptance boundary
- Evidence classification and cooperative-host limitation
- Changed files and commands run
- Commands intentionally not run
- Exact fresh re-review boundary
- One concrete `Next:` task
