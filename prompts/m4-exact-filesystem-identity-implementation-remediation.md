# Goal

Remediate only M4-FSI01 through M4-FSI05 from the fresh independent issue #45
filesystem-identity implementation review. Complete the already approved
Docker-free first implementation without choosing or implementing the distinct
activation object. Do not access Docker or retained runtime state.

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

1. **M4-FSI01 complete source ancestors:** capture and retain the exact
   `containers/profile-control/fixture` directory identity and inventory in
   both production repository-input loaders. Prove that every fixed source,
   exact input, and profile has its complete root-to-target held ancestor chain
   through its final consumer settlement. Reject nested ancestor replacement.
2. **M4-FSI02 creating descriptor continuity:** keep the original
   `O_CREAT | O_EXCL | O_NOFOLLOW` descriptor for every host-created regular
   file. Perform bounded write, file sync, same-descriptor read-back, exact
   bytes/size/hash, descriptor/path comparison, identity-bound parent sync, and
   retain that same descriptor through the consumer's settlement. Route staged
   files, credential-empty `config.json`, control manifests, and canonical host
   records through this primitive. Remove path-based `writeFile` plus recapture
   from those production roles.
3. **M4-FSI03 immediate copy checks:** bind every fixed Docker `cp` call to its
   exact held source object and result/scratch parent. Immediately before spawn
   and after that child's observed `close`, validate the selected source,
   complete source ancestry, immutable repository/profile lease, run ancestry,
   Docker configuration, and destination parent/absence or new destination.
   Do not substitute later aggregate byte equality for these checks.
4. **M4-FSI04 unknown settlement:** never close the retained recovery lease
   while a successfully spawned child remains active without `close`. Unknown
   settlement authorizes no post-use acceptance or cleanup. Define exact lease
   ownership for eventual `close`, synchronous spawn failure, result
   consumption, and retention-only terminal handling without retrying or
   reading retained contents.
5. **M4-FSI05 focused regressions:** add deterministic Docker-free tests for
   nested source-ancestor replacement, original-creation-descriptor continuity
   and sync/close failure, copy-source/parent drift between children and after
   close, no-`close` recovery lease retention, fixed CLI owner drift,
   container-owner divergence, extra/premature configuration state,
   unsupported no-follow/directory capability, and rejection of an early
   stable projection from the actual backend path. Preserve existing negative
   coverage.

# Exact implementation scope

Only these seven source paths may change:

- `containers/profile-control/src/filesystem-identity.ts`
- `containers/profile-control/src/run-controls.ts`
- `containers/profile-control/src/offline-build-host-backend.ts`
- `containers/profile-control/src/offline-build-recovery-host-backend.ts`
- `containers/profile-control/src/control-host-backend.ts`
- `containers/profile-control/src/execution.ts`
- `containers/profile-control/src/types.ts`

Only these nine verification paths may change:

- `containers/profile-control/test/filesystem-identity.test.ts`
- `containers/profile-control/test/run-controls.test.ts`
- `containers/profile-control/test/offline-build-host-backend.test.ts`
- `containers/profile-control/test/offline-build-recovery-host-backend.test.ts`
- `containers/profile-control/test/control-host-backend.test.ts`
- `containers/profile-control/test/execution.test.ts`
- `containers/profile-control/test/import-safety.test.ts`
- `containers/profile-control/test/static-safety.test.ts`
- `containers/profile-control/scripts/verify-static.mjs`

Minimal status updates and one new fresh remediation re-review prompt/record
may also be added. Do not change any other implementation or verification path.

# Out of scope

- activation source or compiled path selection, construction, implementation,
  reachability, command, or test
- ordinary `orchestrator-entry.ts`, compiled output, package script,
  package-root export, profile, fixture, staging artifact, result, Expected
  revision, run ID, result root, container identity, or execution gate changes
- Docker/container/runtime-socket access, retained M4 state, profile execution,
  probe/lifecycle execution, cleanup of historical state, retry, result repair,
  or `Observed` promotion
- issue #46 or any later frozen-research issue
- external network, credentials, host home, Remote Git, publication,
  deployment, or third-party communication

# Constraints

- Preserve private BigInt device/inode/owner/mode/time values and the exact
  six-key public projection. Do not serialize raw filesystem identity.
- Preserve metadata-only non-read behavior for runtime-created Docker
  configuration files and retention-only recovery.
- Require child `close` before post-use acceptance. Do not treat timeout,
  output failure, signal request, or `exit` as settlement.
- Preserve the cooperative-host limitation. Do not claim atomic protection
  against a same-UID swap-and-restore adversary around a path-only CLI.
- Keep host-direct, container-direct, fixed official-tool materialization, and
  route-specific official API evidence separate.
- Preserve primary failure when cleanup or descriptor close also fails. Do not
  repair, normalize, retry, or reinterpret drift.

# Deliverables

- the bounded remediation in the exact 16-path allowlist
- focused deterministic negative tests and static assertions for every finding
- minimal status updates in `docs/m4-exact-filesystem-identity.md`,
  `docs/index.md`, and `docs/frozen-research-execution-plan.md`
- a fresh independent Docker-free read-only remediation re-review prompt; do
  not perform that review in the implementation session

# Verification

Run:

```bash
npm run m4:verify
git diff --check
```

Run a focused formatter check over changed review/status/prompt Markdown. Do
not run `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:recovery:offline-build`, `npm run m4:run:controls`, Docker, a
runtime socket operation, a lifecycle fixture, or a production executor.

# Completion report

- M4-FSI01 through M4-FSI05 remediation summary
- exact changed files
- commands run and observed results
- commands intentionally not run and remaining static/runtime limitations
- confirmation that ordinary activation, compiled output, historical evidence,
  and `Observed` remain unchanged
- one concrete `Next:` task: the fresh independent Docker-free read-only
  remediation re-review
