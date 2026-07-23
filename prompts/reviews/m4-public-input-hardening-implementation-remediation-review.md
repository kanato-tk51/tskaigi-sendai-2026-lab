# Goal

Perform a fresh independent Docker-free read-only re-review of only the bounded
M4-PI01 public-input-hardening implementation remediation for issue #46.
Decide whether exact selector rejection, executor outer-input closure, focused
negative/static coverage, and historical/current construction separation close
the finding. Do not repair implementation in this review session or start
issue #47.

# Read first

- root `AGENTS.md` and `containers/AGENTS.md`
- `docs/index.md` and `docs/frozen-research-execution-plan.md`
- the active issue #46 documents selected by `docs/index.md`
- `docs/m4-public-input-hardening.md`
- `docs/reviews/m4-public-input-hardening-contract.md`
- `prompts/m4-public-input-hardening-implementation.md`
- `prompts/reviews/m4-public-input-hardening-implementation-review.md`
- `docs/reviews/m4-public-input-hardening-implementation.md`
- `prompts/m4-public-input-hardening-implementation-remediation.md`
- this prompt

# Review target

Review only the current M4-PI01 remediation in these production paths:

- `containers/profile-control/src/definitions.ts`
- `containers/profile-control/src/docker-plan.ts`
- `containers/profile-control/src/execution.ts`
- `containers/profile-control/src/run-controls.ts`

Review its verification changes only in:

- `containers/profile-control/test/public-input-hardening.test.ts`
- `containers/profile-control/test/execution.test.ts`
- `containers/profile-control/scripts/verify-static.mjs`
- `containers/profile-control/test/frozen-research-profile-control-entry.test.ts`
  only for the mechanical current-source/current-edge manifest refresh

Treat the implementation session's recorded checks as claims to reproduce,
not conclusions.

# Required finding decisions

1. Confirm `expectedControls` rejects every value outside exact
   `"permissive" | "constrained"` with `INVALID_PROFILE` before returning an
   Expected array, without changing either valid fixed array.
2. Confirm `fixedContainerArguments` rejects the same invalid domain with
   `INVALID_DOCKER_PLAN` before returning arguments, without changing either
   valid fixed command suffix.
3. Confirm `FixedExistingImageExecutionInput`, its exact outer schema, and its
   private snapshot no longer accept or retain `immutableInputLease`.
   Independently trace `runFixedProductionControls`: the production definition
   keeps the real lease for backend construction, the backend retains its
   reviewed ownership, and the executor receives an explicit lease-free outer
   object.
4. Reproduce focused invalid-selector and rejected-extra-field cases. Confirm
   the extra executor field invokes zero backend methods and no Proxy hook.
   Inspect the AST static assertion and prove both exact guards precede every
   output branch, preventing a default-to-constrained regression.
5. Reproduce the historical/current construction split. All historical issue
   #45 source/compiled identities must remain exact; only current issue #46
   source and source-edge identities may change, and compiled output must stay
   unchanged as an explicit compile-not-performed boundary.

Also confirm M4-PI02 through M4-PI05 remain closed at implementation scope and
that no schema, error-code vocabulary, package surface, runtime gate, evidence
class, or `Observed` value changed.

# Review method and safety boundary

- Inspect the complete diff and exact remediation allowlist. Identify any
  implementation or verification path outside it separately from minimal
  prompt/status/review records.
- Do not edit implementation or tests. If M4-PI01 remains open, record one
  smallest exact remediation instead of repairing it.
- You may run only the approved Docker-free typecheck/static/test/verify,
  focused formatting, construction/AST assertions, and `git diff --check`.
- Do not run Docker, a runtime socket operation, production executor,
  lifecycle fixture, profile controls, build, recovery, activation entry,
  retained/result-state inspection, cleanup, retry, or repair.
- Do not use external network, credentials, host home, Remote Git,
  publication, deployment, or third-party communication.

# Decision boundary

The maximum positive decision is approval of issue #46 at the Docker-free
static/unit implementation boundary and permission to begin only the separately
recorded issue #47 contract task. This review cannot implement issue #47,
approve a runtime gate, authorize Docker or retained/result-state access,
change historical evidence, or promote `Observed`.

# Deliverables

- `docs/reviews/m4-public-input-hardening-implementation-remediation.md` with
  finding evidence, exact path/snapshot analysis, commands actually run,
  evidence classification, limitations, and `APPROVED` or `BLOCKED`
- minimal issue #46 status/handoff updates
- one concrete `Next:` item: issue #47's first contract task only if M4-PI01
  closes, otherwise one smallest bounded remediation
