# Goal

Perform a fresh independent Docker-free read-only re-review of the residual
M4-FS01 remediation in the issue #45 exact filesystem-object identity contract.
Decide whether every fixed runtime-CLI-created Docker configuration and
recovery-state role is now closed and whether exactly one bounded static/unit
first implementation task is approved. Do not repair or implement the contract
in this review.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `docs/index.md`
- `docs/frozen-research-execution-plan.md`
- `docs/m4-exact-filesystem-identity.md`
- `docs/reviews/m4-exact-filesystem-identity-contract.md`
- `docs/reviews/m4-exact-filesystem-identity-contract-remediation.md`
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
- `prompts/m4-exact-filesystem-identity-contract-remediation.md`
- `prompts/reviews/m4-exact-filesystem-identity-contract-remediation-review.md`
- this prompt

# Review questions

1. Verify that the fresh offline-build boundary starts with an exclusive
   `runOwner`/`0700` run root and `docker-config`, exact `runOwner`/`0600`
   13-byte credential-empty `config.json`, and every runtime-created basename
   absent before `doctor`.
2. Trace the exact accepted checkpoints: token-seed files only after `doctor`
   `close`, the complete fixed buildx tree only after `build` `close`, and no
   identity or inventory change after `inspect-image` `close`. Confirm that a
   missing, extra, partial, premature, removed, or drifted row is fail-closed
   Inconclusive rather than a discoverable compatibility form.
3. Trace all 16 configuration/recovery rows. Confirm exact type, full mode,
   private `runOwner` or `recoveryRunOwner`, directory inventory, and regular
   file size, including the sole `0644`/281-byte buildx ref exception. Confirm
   every runtime-created regular file has one link and no special bits.
4. Verify that runtime-created file contents are never read, hashed, copied,
   normalized, or serialized; size and identity remain private metadata. New
   rows may be opened only after the creating child emits `close`, and their
   held handles must survive every later child settlement and disposition.
5. Verify fresh-run cleanup is limited to the last completely validated fixed
   checkpoint and uses the exact deepest-first identity-checked unlink/rmdir
   order without recursive discovery. Unsettled, mismatched, or cleanup-failed
   state must be retained and remain Inconclusive.
6. Verify the fixed historical recovery snapshot has `config.json` absent,
   every other fixed row present with one private `recoveryRunOwner`, is checked
   before and after the settled one-command inspect, and remains retained on
   every outcome without entering fresh-build cleanup.
7. Reconcile these rules with the exact first-implementation source/test/static
   allowlist and focused negative-test acceptance. Block any ownership, mode,
   checkpoint, content-read, handle-lifetime, cleanup, or recovery choice left
   to the implementer.
8. Confirm M4-FS02 through M4-FS04 remain closed, the activation object remains
   deferred, the cooperative-host limitation remains explicit, and no command,
   Expected revision, run ID, result root, container identity, execution gate,
   runtime claim, or `Observed` value was selected or changed.

# Tracked-source assertions

Inspect only exact tracked M4 paths needed to reproduce the baseline:

- `containers/profile-control/src/offline-build-host-backend.ts`
- `containers/profile-control/src/offline-build-recovery-host-backend.ts`
- `containers/profile-control/src/run-controls.ts`
- `containers/profile-control/src/control-host-backend.ts`
- `containers/profile-control/src/execution.ts`
- `containers/profile-control/src/types.ts`
- the corresponding exact focused tests named by the contract
- `containers/profile-control/scripts/verify-static.mjs`

Use tracked-file assertions such as `git grep -- <exact paths>`. Do not traverse
ignored staging, result roots, retained M4 state, or runtime-owned directories.
The current numeric identities, short-lived handles, cleanup failure behavior,
and fixed retained inventory are expected baseline static evidence, not new
findings by themselves. The review question is whether the contract fixes one
exact later migration.

# Scope

- read-only review of the remediated contract, review history, and exact
  tracked source
- `docs/reviews/m4-exact-filesystem-identity-contract-residual-remediation.md`
- minimal handoff updates in `docs/index.md` and
  `docs/frozen-research-execution-plan.md`
- one bounded next task: the exact first implementation if approved, or one
  contract-only remediation if blocked

# Out of scope

- repairing the contract or changing M4 source, type, test, static-verifier,
  profile, compiled-output, package-script, fixture, staging, or result bytes
- choosing activation paths/bytes, a new Expected revision, run ID, result
  root, container identity, activation command, or execution gate
- Docker/container/runtime-socket access, retained-state inspection or
  mutation, staging rebuild, profile execution, probe/lifecycle execution,
  cleanup, retry, result repair, or `Observed` promotion
- issue #46 or later frozen-research work
- external network, credentials, host home, Remote Git, publication,
  deployment, or third-party communication

# Deliverables

- `docs/reviews/m4-exact-filesystem-identity-contract-residual-remediation.md`
  with the decision, residual M4-FS01 closure analysis, independent
  tracked-source trace, exact approved/blocked boundary, evidence
  classification, and limitations
- minimal `docs/index.md` and `docs/frozen-research-execution-plan.md` updates
- if approved, at most the exact Docker-free first implementation already
  allowlisted by the contract; the activation-object contract remains later
- if blocked, one bounded contract-only remediation; do not repair it in this
  review

# Verification

Use read-only tracked-source/contract assertions only. `git diff --check` and a
focused formatter check over the review/status files may be run. Do not run
tests, typecheck, build, staging, Docker, a lifecycle fixture, a production
executor, or broad verification merely to repeat historical evidence.

# Completion report

- Decision and residual M4-FS01 status; confirmation that M4-FS02 through
  M4-FS04 remain closed
- Independently reproduced current static baseline versus proposed guarantee
- Exact first-implementation approval or blocked boundary
- Evidence classification and cooperative-host limitation
- Changed files and commands run
- Commands intentionally not run and remaining limitations
- One concrete `Next:` task
