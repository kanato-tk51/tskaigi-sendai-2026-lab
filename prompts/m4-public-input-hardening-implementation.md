# Goal

Implement only the independently approved issue #46 M4 public-input hardening
contract at its exact Docker-free static/unit boundary. Close the approved
Proxy, accessor, prototype, byte-view/shared-memory, temporal snapshot,
authority-capture, negative-test, and historical-construction boundaries. Do
not emit compiled output, activate a production entry, or define a runtime
gate.

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
- `prompts/reviews/m4-public-input-hardening-contract-review.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Scope

Production changes are limited to the exact 19 paths listed in
`docs/m4-public-input-hardening.md`, from `src/safe-data.ts` through the
allowlisted schema, construction, process-state, and executor modules.
Verification changes are limited to the contract's exact 21 paths, including
new `test/public-input-hardening.test.ts`, the listed focused route tests,
`test/frozen-research-profile-control-entry.test.ts`, and
`scripts/verify-static.mjs`.

Also save a fresh independent implementation-review prompt and make only the
minimal authoritative status/handoff updates needed to record this static/unit
implementation. Preserve all prior issue #45 and presentation work.

# Required implementation

1. Centralize descriptor-only record and dense-array snapshots. Reject Proxy
   before reflection, accept only captured intrinsic/null record prototypes or
   the captured intrinsic array prototype, require enumerable own data
   descriptors and exact keys/indices, reject symbols/accessors/holes/extras/
   custom or cross-realm prototypes/cycles, and reconstruct fresh fixed-order
   deeply immutable canonical data without property reads, iterators,
   coercion, spread, or JSON cloning.
2. Centralize byte snapshots for exact ordinary `Uint8Array` and Node `Buffer`
   prototypes. Use captured intrinsic slot access, reject Proxy, custom typed
   arrays, expandos/accessors/index drift, detached/resizable/shared backing,
   apply route bounds, synchronously copy only the selected view range into
   private non-shared storage, and copy out every public byte return.
3. Preserve three disjoint classes: untrusted data, explicit backend
   authority, and exact private branded state. Resolve a private brand before
   any property read. Capture required backend methods descriptor-only through
   at most four non-Proxy custom prototypes, reject accessors/proxied or
   non-callable methods, receiver-bind accepted callables once, and continue to
   treat every callback return as untrusted data.
4. Complete every async executor's outer/data/brand/authority snapshot before
   its first callback or `await`; never reread the original caller graph,
   method property, or byte view afterward. Snapshot each backend return
   immediately and preserve existing first-failure, child-`close`, cleanup,
   retention, and Inconclusive behavior after an attempt begins.
5. Apply the shared policy to every exact ingress group in the approved
   contract, including direct internal canonical/profile/offline-build/
   recovery roots, typed constructors/cross-bindings, orchestrator arguments,
   pair serialization, backend return families, and process-state updates.
   Preserve public schemas, canonical bytes, fixed values, key order, error
   codes, and package-root exports.
6. Add the complete table-driven Docker-free negative matrix and static
   ingress/bypass assertions. Cover zero-side-effect invalid preflight,
   mutation after entry and between settlements, private-copy non-aliasing,
   existing plain-object and class fake backends, and invalid return data after
   an attempted callback.
7. Keep every issue #45 source/compiled historical identity and manifest
   constant. Record current allowlisted issue #46 source divergence explicitly
   while every `dist` object remains unchanged; never treat the mismatch as a
   new activation construction.

# Out of scope

- Any host-backend, filesystem-identity, ordinary/frozen-research
  entry/executor production source, package-root export, package script,
  profile, fixture, image input, or compiled `dist` change
- Filesystem-emitting TypeScript compilation, activation construction/import/
  execution, Docker/container/runtime-socket access, retained or result state,
  cleanup, retry, repair, probe/lifecycle execution, or runtime evidence
- A new Expected revision, run ID, result root, container/image identity,
  command, execution gate, schema version, error code, dependency, historical
  evidence change, or `Observed` promotion
- Issue #47 or later frozen-research work
- External network, credentials, host home/environment, Remote Git,
  publication, deployment, or third-party communication

# Constraints

- Preserve the ordinary fail-closed entry and all exhausted issue #45
  constructions/results.
- Keep import-time behavior free of I/O and side effects; capturing untampered
  Node.js intrinsics is allowed.
- Do not weaken exact schemas, canonical serialization, private brands,
  filesystem identity, settlement, cleanup, retention, or evidence ceilings to
  make a test pass.
- Treat explicit backend callbacks as authority, not harmless data. This
  implementation does not claim backend authenticity, compromised-runtime
  protection, or closure of the cooperative-host race.
- Preserve unrelated working-tree changes.

# Deliverables

- The exact bounded 19-production-path public-input hardening
- Focused Docker-free tests and static assertions within the 21 verification
  paths
- `prompts/reviews/m4-public-input-hardening-implementation-review.md` for a
  fresh independent Docker-free read-only review
- Minimal status updates recording static/unit evidence and naming only that
  fresh review as next

# Verification

Run `npm run m4:typecheck`, `npm run m4:static`, `npm run m4:test`, and
`npm run m4:verify`, plus focused formatting and `git diff --check`. These
commands must not emit compiled output. Do not run `npm run m4:doctor`,
`npm run m4:build`, `npm run m4:recovery:offline-build`,
`npm run m4:run:controls`, `npm run m4:execute:frozen-research`, Docker, a
production executor, retained-state access, or a runtime experiment.

# Completion report

- M4-PI01 through M4-PI05 implementation evidence
- Descriptor/prototype, byte/shared-memory, temporal/authority, negative-test,
  and historical/current-construction evidence
- Changed files and commands actually run
- Commands intentionally not run, evidence classes, and remaining limitations
- Exact fresh independent implementation-review boundary
- One concrete `Next:` task
