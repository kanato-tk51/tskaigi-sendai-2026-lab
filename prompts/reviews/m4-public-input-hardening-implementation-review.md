# Goal

Perform a fresh independent Docker-free read-only review of only the bounded
issue #46 M4 public-input-hardening static/unit implementation. Decide M4-PI01
through M4-PI05 from the implementation and focused evidence. Do not repair
source or tests, emit compiled output, define a runtime gate, or begin issue
#47 in this review session.

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
- `prompts/reviews/m4-public-input-hardening-contract-review.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- every production and verification path in the approved implementation
  allowlist
- this prompt

# Review target

Review the current issue #46 working-tree implementation only within the exact
19 production and 21 verification paths fixed by
`docs/m4-public-input-hardening.md`. Also inspect the implementation prompt,
this review prompt, and the minimal status records, but do not confuse those
handoff files with implementation evidence. Identify any implementation or
verification change outside the allowlist separately.

The implementation session records a successful `npm run m4:verify` with
typecheck, the Docker-free static verifier, 25 test files, and 298 tests. Treat
that pass and every implementation summary as claims to reproduce, not as an
independent conclusion. Review the complete diff and the actual source and
tests.

# Required finding decisions

1. **M4-PI01 — complete ingress and input-class closure:** independently trace
   every approved package-root and direct-internal ingress, typed constructor,
   cross-binding, orchestrator argument, process-state update, pair serializer,
   async executor, backend return, primitive selector, and private-brand
   consumer. Confirm every untrusted graph is synchronously converted to owned
   canonical data, every callback carrier is treated only as explicit
   authority, and every private object is brand-resolved before property read.
2. **M4-PI02 — descriptor/prototype/cycle closure:** confirm Proxy is rejected
   before reflection, record and dense-array fields are extracted once through
   exact own data descriptors, and symbols, accessors, non-enumerable schema
   fields, holes, extras, custom/cross-realm prototypes, cycles, coercion,
   iterators, inherited pollution, and caller-owned nested graphs cannot cross
   a completed route snapshot. Confirm accepted canonical records/arrays have
   fixed keys/order and immutable owned children.
3. **M4-PI03 — byte/shared-memory closure:** trace every byte ingress and public
   byte return through the central intrinsic-slot snapshot/copy boundary.
   Confirm only exact ordinary local `Uint8Array` and Node `Buffer` prototypes
   are accepted; Proxy, subclass/custom/cross-realm views, expandos,
   accessors/index drift, detached/resizable/shared backing, aliasing,
   iteration/species hooks, wrong ranges, and route-bound violations fail
   closed without consuming attacker hooks. Confirm selected view offsets are
   preserved and private bytes are copied out rather than exposed.
4. **M4-PI04 — temporal/authority/private-state closure:** for doctor,
   execution, offline build, and recovery, verify the complete outer data,
   nested data, byte, private-brand, and required-method snapshot finishes
   before the first callback or `await`. Confirm bounded descriptor-only method
   lookup through at most four non-Proxy custom prototypes, one receiver-bound
   callable capture, zero backend calls on invalid preflight, immediate
   untrusted-return snapshot, and no later reread of the caller graph, byte
   view, or method property. Preserve first-failure, child-`close`, cleanup,
   retention, and Inconclusive semantics after an attempt begins.
5. **M4-PI05 — canonical ownership, coverage, allowlist, and evidence:** map the
   table-driven negative tests and static ingress/bypass inventory to all
   contracted routes and invalid classes. Confirm route error codes/schemas,
   fixed values, serialization order, class/plain fake backends, mutation
   between settlements, private-copy non-aliasing, and package-root exports
   remain compatible. Confirm no source outside the exact allowlist, new
   dependency/error/schema/command, compiled output, runtime identity, result,
   historical evidence, or `Observed` value was adopted.

Also independently reproduce the historical/current construction separation:

- historical issue #45 source manifest
  `2582 / d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158`;
- unchanged compiled manifest
  `5232 / 04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953`;
- historical combined manifest
  `7814 / 7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec`;
- current issue #46 source manifest
  `2585 / 8bf03633689be35d5cf9162ab77835496683618ee96c529fb15cf98532d84e58`;
- current source-edge manifest
  `2027 / 0be386f65a3f16fd93ce11adec2e6a082a96f21d3acad8c4a9bef4d830d8c251`;
  and
- current-source plus unchanged-compiled manifest
  `7817 / d2d56d29b9dd5ca519f9b2411127be84072f39bb412fe9b29a53898c46686501`.

Confirm the old 32-source/64-output construction rows and `dist` bytes remain
immutable, every intentional in-memory compile divergence belongs to the exact
issue #46 source allowlist, and current source plus old compiled output is an
explicit compile-not-performed boundary rather than an activation candidate.

# Review method and safety boundary

- Inspect the complete working-tree diff and exact allowlist. Preserve all
  prior issue #45 and presentation changes.
- Independently derive the ingress/function inventory and trace shared helpers,
  all wrapper constructors/validators, process observers, serializers, and
  async executors. Do not accept a static name inventory without behavioral
  route evidence.
- Recompute construction identities and in-memory TypeScript output only
  through the existing no-emit static/unit paths. Do not write to `dist`.
- Rerun `npm run m4:typecheck`, `npm run m4:static`, `npm run m4:test`, and
  `npm run m4:verify` if useful, plus focused formatting and
  `git diff --check`. These are Docker-free and must not emit compiled output.
- Do not modify implementation or verification paths. If a finding remains,
  record `BLOCKED` with one M4-PI finding ID and the smallest bounded
  remediation; do not repair it in this session.
- Do not run `npm run m4:doctor`, `npm run m4:build`,
  `npm run m4:recovery:offline-build`, `npm run m4:run:controls`,
  `npm run m4:execute:frozen-research`, Docker, a production executor, a
  runtime socket operation, retained/result-state access, cleanup, retry,
  repair, a probe/lifecycle fixture, or a filesystem-emitting build.
- Do not use external network, credentials, host home/environment, Remote Git,
  publication, deployment, or third-party communication.

# Decision boundary

The maximum positive decision is approval of issue #46 only at its Docker-free
static/unit evidence class and closure of that issue's implementation/review
phase. A positive review may name only the separately bounded issue #47
production raw-to-derived collector **contract** as the next task. This review
cannot begin that contract, change a package export/script or compiled object,
define or approve an activation/runtime gate, authorize Docker or retained
state, choose a new measurement identity, or promote any result to `Observed`.

# Deliverables

- `docs/reviews/m4-public-input-hardening-implementation.md` with an `APPROVED`
  or `BLOCKED` decision, M4-PI01 through M4-PI05 finding-by-finding evidence,
  exact changed-path and historical/current construction analysis, commands
  actually run, evidence classification, limitations, and the exact approved
  next boundary or bounded remediation
- minimal status updates in `docs/m4-public-input-hardening.md`,
  `docs/index.md`, `docs/milestones.md`, and
  `docs/frozen-research-execution-plan.md`
- one concrete `Next:` item: the issue #47 contract only if all findings close,
  otherwise the smallest bounded issue #46 remediation

# Completion report

- Decision and M4-PI01 through M4-PI05 status
- Independently reproduced ingress, descriptor/prototype/cycle,
  byte/shared-memory, temporal/authority/private-state, negative/static, and
  historical/current-construction evidence
- Changed files and commands actually run
- Commands intentionally not run, evidence classes, and remaining limitations
- Exact approved next or blocked-remediation boundary
- One concrete `Next:` task
