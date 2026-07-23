# Goal

Perform a fresh independent Docker-free read-only re-review of only the bounded
M4-FSI01 through M4-FSI05 implementation remediation for frozen-research issue
#45. Decide each finding from the implementation and focused tests. Do not
repair source or tests in this review session, choose the distinct activation
object, or define an execution gate.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `docs/index.md`
- `docs/frozen-research-execution-plan.md`
- `docs/m4-exact-filesystem-identity.md`
- `docs/reviews/m4-exact-filesystem-identity-contract.md`
- `docs/reviews/m4-exact-filesystem-identity-contract-remediation.md`
- `docs/reviews/m4-exact-filesystem-identity-contract-residual-remediation.md`
- `docs/reviews/m4-exact-filesystem-identity-implementation.md`
- `prompts/m4-exact-filesystem-identity-implementation-remediation.md`
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

# Review target

Review the current working-tree remediation only within the already approved
exact 16 implementation and verification paths.

Source:

- `containers/profile-control/src/filesystem-identity.ts`
- `containers/profile-control/src/run-controls.ts`
- `containers/profile-control/src/offline-build-host-backend.ts`
- `containers/profile-control/src/offline-build-recovery-host-backend.ts`
- `containers/profile-control/src/control-host-backend.ts`
- `containers/profile-control/src/execution.ts`
- `containers/profile-control/src/types.ts`

Verification:

- `containers/profile-control/test/filesystem-identity.test.ts`
- `containers/profile-control/test/run-controls.test.ts`
- `containers/profile-control/test/offline-build-host-backend.test.ts`
- `containers/profile-control/test/offline-build-recovery-host-backend.test.ts`
- `containers/profile-control/test/control-host-backend.test.ts`
- `containers/profile-control/test/execution.test.ts`
- `containers/profile-control/test/import-safety.test.ts`
- `containers/profile-control/test/static-safety.test.ts`
- `containers/profile-control/scripts/verify-static.mjs`

The remediation session recorded a successful `npm run m4:verify`: typecheck,
the Docker-free static verifier, 22 test files, and 247 tests. Independently
inspect the source and tests; do not treat that recorded pass as proof of the
semantics under review. You may rerun the exact Docker-free command if useful.

# Required finding decisions

1. **M4-FSI01 — complete source ancestors:** verify both production
   repository-input leases capture and retain the fixed
   `containers/profile-control/fixture` directory with its exact identity and
   inventory, so every fixed source, exact input, and canonical profile has a
   complete root-to-target chain through its final consumer settlement. Confirm
   a nested replacement is rejected behaviorally.
2. **M4-FSI02 — creating descriptor continuity:** trace every host-created
   staged file, credential-empty `config.json`, control manifest, and canonical
   host record. Confirm one `O_CREAT | O_EXCL | O_NOFOLLOW` descriptor performs
   bounded write, file sync, same-descriptor read-back and exact byte/hash/size
   checks, descriptor/path comparison, held-parent sync, and remains retained
   through the consumer settlement. Reject any close/reopen or path-based
   `writeFile` plus recapture gap. Inspect sync/close failure preservation.
3. **M4-FSI03 — immediate fixed-copy checks:** for every fixed Docker `cp`,
   trace the selected held source, source parent, immutable repository/profile
   lease, run ancestry, Docker configuration, transfer parent, destination
   absence/new object, and child settlement. Confirm the complete chain is
   checked immediately before spawn and after that child's observed `close`,
   including successive-copy and post-close drift; later aggregate equality is
   not sufficient.
4. **M4-FSI04 — unknown settlement:** confirm a successfully spawned recovery
   child without `close` cannot release the retained lease, authorize
   post-validation, cleanup, retry, content reads, or evidence acceptance.
   Trace eventual late `close`, synchronous spawn failure, normal result
   consumption, validation failure, descriptor-close failure, and the explicit
   retention-only terminal owner without losing the primary failure.
5. **M4-FSI05 — focused coverage:** independently map deterministic tests and
   static assertions to nested-ancestor replacement, original creator
   continuity and sync/close failure, per-copy source/parent drift, no-`close`
   lease retention, fixed CLI owner drift, container-owner divergence,
   extra/premature configuration rows, unavailable no-follow/directory
   capabilities, and rejection of an early stable projection through the
   actual backend path. Preserve and account for the earlier negative cases.

Also confirm M4-FS01 through M4-FS04 remain closed at contract scope, the exact
six-key public projection and private BigInt metadata boundary remain intact,
and the cooperative-host limitation is not overstated.

# Review method and safety boundary

- Inspect the complete diff and exact allowlist. Identify any implementation or
  verification path outside the 16-path boundary separately from minimal
  status/prompt/review records.
- Treat the existing implementation summary and test pass as claims to
  reproduce, not conclusions.
- Do not modify implementation or verification paths. If any finding remains,
  record `BLOCKED` with a new or existing finding ID and the smallest exact
  remediation; do not repair it in this session.
- Do not run Docker, a runtime socket operation, a production executor, a
  lifecycle fixture, profile controls, a build, recovery, retained-state
  inspection, or cleanup. Do not access ignored staging/result roots beyond
  bounded repository-owned disposable unit-test paths created by the exact
  verification command.
- Do not use external network, credentials, host home, Remote Git,
  publication, deployment, or third-party communication.
- Do not change activation source or compiled output, package scripts,
  package-root exports, profiles, fixtures, Expected revision, run ID, result
  root, container identity, runtime evidence, or `Observed`.

# Decision boundary

The maximum positive decision is approval of the remediated first
filesystem-identity implementation and permission to begin only the separately
named **M4 distinct activation-object contract task**. This review cannot choose
that activation object, approve its implementation, define an execution gate,
authorize Docker or retained-state access, or promote any evidence to
`Observed`.

# Deliverables

- `docs/reviews/m4-exact-filesystem-identity-implementation-remediation.md`
  with finding-by-finding evidence, exact changed-path/snapshot analysis,
  commands actually run, evidence classification, remaining limitations, and a
  clear `APPROVED` or `BLOCKED` decision
- minimal status updates in `docs/m4-exact-filesystem-identity.md`,
  `docs/index.md`, and `docs/frozen-research-execution-plan.md`
- one concrete `Next:` item: the distinct activation-object contract task only
  if all findings close, otherwise the smallest bounded remediation
