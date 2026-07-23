# Goal

Remediate only M4-PI01 from the fresh independent issue #46 public-input-
hardening implementation review. Add exact runtime rejection to the two
primitive profile selectors, remove the duplicate unused lease from the
existing-image executor ingress while preserving production-backend lease
ownership, and add focused Docker-free negative/static coverage. Do not start
issue #47 or define a runtime gate.

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
- `docs/reviews/m4-distinct-activation-object-result.md`
- `docs/m4-public-input-hardening.md`
- `docs/reviews/m4-public-input-hardening-contract.md`
- `prompts/m4-public-input-hardening-implementation.md`
- `prompts/reviews/m4-public-input-hardening-implementation-review.md`
- `docs/reviews/m4-public-input-hardening-implementation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Required remediation

1. Make `expectedControls` reject every runtime value other than exact
   `"permissive"` and `"constrained"` with `INVALID_PROFILE` before selecting
   an Expected array.
2. Make `fixedContainerArguments` reject every runtime value other than exact
   `"permissive"` and `"constrained"` with `INVALID_DOCKER_PLAN` before
   selecting fixed Node arguments.
3. Remove `immutableInputLease` from `FixedExistingImageExecutionInput`, the
   accepted outer key set, and the executor's private snapshot. Keep the
   production definition's lease only long enough to transfer ownership to
   `createFixedControlHostBackend`; pass the executor an explicit object that
   does not contain the lease.
4. Add focused zero-callback negative tests for invalid selector values and an
   extra `immutableInputLease` executor field. Add a TypeScript-AST static
   assertion that requires each selector's exact two-value rejection guard
   before any output branch.
5. Preserve the exact historical issue #45 source/compiled construction.
   Refresh only the separately identified current issue #46 source/edge
   manifest identities, including the existing allowlisted frozen-construction
   test when mechanically required by the changed current source.

# Exact change boundary

Production changes are limited to:

- `containers/profile-control/src/definitions.ts`
- `containers/profile-control/src/docker-plan.ts`
- `containers/profile-control/src/execution.ts`
- `containers/profile-control/src/run-controls.ts`

Verification changes are limited to:

- `containers/profile-control/test/public-input-hardening.test.ts`
- `containers/profile-control/test/execution.test.ts`
- `containers/profile-control/scripts/verify-static.mjs`
- the already contract-allowlisted
  `containers/profile-control/test/frozen-research-profile-control-entry.test.ts`
  only for mechanical current-source/current-edge manifest identity refresh;
  its historical issue #45 identities and assertions must not change

This implementation/re-review prompt pair and minimal issue #46 status records
may also change. Preserve all unrelated accumulated work.

# Out of scope

- Any other M4 production or verification path, compiled `dist` output,
  package export/script, profile, fixture, image/staging input, Expected
  revision, run ID, result root, container/image identity, or command
- Docker, a runtime socket, production executor, retained/result state,
  cleanup, repair, retry, probe/lifecycle execution, or runtime evidence
- Historical issue #45 result or construction changes, issue #47, external
  network, credentials, host home, Remote Git, publication, deployment, or
  third-party communication

# Constraints

- Keep the ordinary entry fail closed and every exhausted generation
  immutable.
- Do not weaken canonical schemas, private brands, backend authority,
  filesystem identity, settlement, cleanup, retention, or evidence ceilings.
- Invalid executor preflight must call no backend method, including cleanup
  when no backend authority has been accepted.
- This is static/unit evidence only and cannot establish Docker behavior,
  runtime enforcement, adapter-route evidence, or `Observed`.

# Deliverables

- The bounded M4-PI01 source remediation
- Focused Docker-free negative tests and static selector assertions
- Current/historical construction separation with only current identities
  refreshed where required
- Minimal status updates naming only the fresh independent Docker-free
  remediation re-review as next

# Verification

Run `npm run m4:typecheck`, `npm run m4:static`, `npm run m4:test`, and
`npm run m4:verify`, plus focused formatting and `git diff --check`. Do not run
`npm run m4:doctor`, `npm run m4:build`,
`npm run m4:recovery:offline-build`, `npm run m4:run:controls`,
`npm run m4:execute:frozen-research`, Docker, a production executor, retained-
state access, or a runtime experiment.

# Completion report

Report the exact M4-PI01 changes, changed files, commands actually run and
observed results, intentionally unrun runtime commands, evidence class,
remaining limitations, and one concrete `Next:` item naming the fresh
independent Docker-free remediation re-review.
