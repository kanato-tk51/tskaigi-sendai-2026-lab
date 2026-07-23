# Goal

Perform a fresh independent Docker-free read-only re-review of the remediated
issue #45 exact filesystem-object identity contract. Decide whether M4-FS01
through M4-FS04 are closed at contract scope and whether exactly one bounded
static/unit first implementation task is approved. Do not repair or implement
the contract in this review.

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
- `prompts/m4-exact-filesystem-identity-contract-remediation.md`
- this prompt

# Review questions

1. **M4-FS01 ownership:** verify that BigInt `uid`/`gid` are part of every
   private identity observation; repository-object ownership is immutable;
   every per-run host-created object is bound to `runOwner`; every fixed
   container-created result/scratch object is bound to one exact private
   `containerOwner` relation without inferring the host mapping of
   `10001:10001`; fixed CLI destinations are exactly `runOwner`/`0600`; and no
   unlisted ownership or full-mode transition remains.
2. **M4-FS02 activation sequencing:** verify that the first implementation has
   no activation source, compiled output, path, test, or acceptance item; the
   ordinary fail-closed source/output remain unchanged; and the separately
   named M4 distinct activation-object contract task is sequenced only after
   the first implementation and fresh review. Confirm that no runtime command
   or future run tuple was selected.
3. **M4-FS03 public projection and scope:** verify that the replacement transfer
   record has exactly the ordered keys `manifestBefore`, `manifestAfter`,
   `manifestIdentityStable`, `controlEvidence`, `resultFiles`, and
   `scratchFiles`; the stable field can be literal `true` only after private
   post-use validation; all six old public identity/type/symlink keys and every
   `m4-file-*` value are removed atomically; and the exact source/test/static
   implementation allowlist names every path required for that migration with
   no optional compatibility form.
4. **M4-FS04 result/scratch objects:** trace all nine container, CLI-transfer,
   and host-record rows. For every fixed basename, confirm the empty/absent
   parent condition, producer and evidence origin, exact full mode, private
   ownership relation, canonical or literal byte/size/SHA bound, held
   descriptor lifetime, required child `close` or host sync boundary, post-use
   validation, and cleanup/retention disposition. Confirm that Docker `cp`
   metadata failure is Inconclusive and cannot be repaired by host
   normalization.
5. Reconcile the first implementation allowlist and negative-test acceptance
   list with all four decisions. Block any source/type/test/static path or
   consequential implementation choice that remains implicit.
6. Preserve the cooperative-host limitation. Do not accept a claim of atomic
   race resistance for a path-only external tool, a host mapping proof from the
   in-container user, or a runtime guarantee from this contract/static review.
7. Confirm that process `close` settlement, fail-closed unsupported behavior,
   identity-checked cleanup, no repair/retry, Inconclusive mapping, mutation
   provenance, and configuration/static/runtime/route evidence separation are
   unchanged.

# Tracked-source assertions

Inspect only exact tracked M4 paths needed to reproduce the current baseline:

- `containers/profile-control/src/run-controls.ts`
- `containers/profile-control/src/offline-build-host-backend.ts`
- `containers/profile-control/src/offline-build-recovery-host-backend.ts`
- `containers/profile-control/src/control-host-backend.ts`
- `containers/profile-control/src/execution.ts`
- `containers/profile-control/src/types.ts`
- the corresponding exact focused tests named by the contract
- `containers/profile-control/scripts/verify-static.mjs`

Use tracked-file assertions such as `git grep -- <exact paths>`; do not traverse
ignored staging, result roots, retained M4 state, or runtime-owned directories.
The current numeric identity and `m4-file-*` implementation are expected
baseline static evidence, not a finding by themselves. The question is whether
the remediated contract fixes one exact later migration.

# Scope

- read-only review of the contract, review history, and exact tracked source
- `docs/reviews/m4-exact-filesystem-identity-contract-remediation.md`
- minimal handoff updates in `docs/index.md` and
  `docs/frozen-research-execution-plan.md`
- one bounded next task: the exact first implementation if approved, or one
  contract-only remediation if blocked

# Out of scope

- M4 source, type, test, static-verifier, profile, compiled-output, package
  script, fixture, staging, or result implementation changes
- Choosing activation paths/bytes, a new Expected revision, run ID, result root,
  container identity, activation command, or execution gate
- Docker/container/runtime-socket access, retained M4 state, staging rebuild,
  profile execution, probe/lifecycle execution, cleanup, retry, or result repair
- Issue #46 or later frozen-research work
- External network, credentials, host home, Remote Git, publication, deployment,
  or third-party communication

# Deliverables

- `docs/reviews/m4-exact-filesystem-identity-contract-remediation.md` with the
  decision, blocking/non-blocking findings, independent tracked-source trace,
  finding-by-finding closure analysis, exact approved/blocked boundary, evidence
  classification, and limitations
- minimal `docs/index.md` and `docs/frozen-research-execution-plan.md` updates
- if approved, at most the one exact Docker-free first implementation task
  already allowlisted by the contract; the activation-object contract remains a
  later task after implementation review
- if blocked, one bounded contract-only remediation task; do not repair it in
  this review

# Verification

Use read-only tracked-source/contract assertions only. `git diff --check` and a
focused formatter check over the review/status files may be run. Do not run
tests, typecheck, build, staging, Docker, a lifecycle fixture, a production
executor, or broad verification merely to repeat historical evidence.

# Completion report

- Decision and M4-FS01 through M4-FS04 finding status
- Independently reproduced current static baseline versus proposed guarantee
- Exact first-implementation approval or blocked boundary
- Evidence classification and cooperative-host limitation
- Changed files and commands run
- Commands intentionally not run and remaining limitations
- One concrete `Next:` task
