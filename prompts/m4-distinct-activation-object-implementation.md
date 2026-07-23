# Goal

Implement only the independently approved issue #45 M4 frozen-research
profile-control activation object at the contract's exact Docker-free
compile-only/static/unit boundary. Add the exact dormant source, construct the
reviewed compiled bytes, add focused negative coverage, and prepare a fresh
independent implementation-review prompt. Do not import or execute the object
and do not define an execution gate.

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
- `docs/reviews/m4-exact-filesystem-identity-implementation-remediation.md`
- `docs/reviews/m4-distinct-activation-object-contract.md`
- `prompts/m4-distinct-activation-object-contract-remediation.md`
- `docs/reviews/m4-distinct-activation-object-contract-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Scope

Construction may change only the exact paths allowlisted by
`docs/m4-distinct-activation-object.md`:

- new
  `containers/profile-control/src/frozen-research-profile-control-entry.ts`;
- the contract's four new and nine replaced compiled outputs under
  `containers/profile-control/dist/`, produced only by the pinned compile-only
  command; and
- no other production TypeScript source.

Verification may change only:

- new
  `containers/profile-control/test/frozen-research-profile-control-entry.test.ts`;
- `containers/profile-control/test/filesystem-identity.test.ts`;
- `containers/profile-control/test/import-safety.test.ts`;
- `containers/profile-control/test/static-safety.test.ts`; and
- `containers/profile-control/scripts/verify-static.mjs`.

Also save the fresh independent review prompt and make minimal authoritative
status/handoff updates in the issue #45 contract/plan/index records.

# Required implementation

1. Add the contract's exact 774-byte activation source with SHA-256
   `580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d`.
2. Run only
   `node node_modules/typescript/bin/tsc --project containers/profile-control/tsconfig.build.json`
   as the filesystem-emitting constructor. Require no diagnostics and accept
   only the exact four-new/nine-replaced compiled delta fixed by the contract.
3. Reproduce the exact 788-byte JavaScript, 11-byte declaration, 22-source,
   22-JavaScript-construction, 22-declaration-construction, and 21-executable
   import sets, 31-source/62-output inventories, and three manifest aggregates.
4. Keep `types.ts` reachable only through type-only source edges and `types.js`
   construction-only with no runtime inbound edge.
5. Prove package-root, package/workspace scripts, ordinary entries, and all
   other production sources do not import, export, invoke, or otherwise make
   the distinct basename reachable. Ordinary imports must perform no compile,
   child spawn, timer, filesystem mutation, Docker access, or activation.
6. Add deterministic Docker-free focused coverage for contracted byte/set/edge
   drift and the bounded identity/settlement negative categories using only
   repository-owned static inputs, disposable unit fixtures, and fake process
   boundaries. Never invoke the distinct entry or production runner.

# Out of scope

- Importing or executing the distinct source or compiled entry
- Changing any existing production TypeScript source, package manifest,
  package script/export, profile, fixture, ordinary entry, image input,
  staging/result path, Expected value, historical result, or `Observed` value
- `npm run m4:build`, `npm run m4:run:controls`, another production executor,
  Docker/container/runtime-socket access, retained-state or result-root access,
  cleanup, retry, repair, or probe/lifecycle execution
- Choosing an Expected revision, run ID, result root, image/container identity,
  activation command, process wrapper, output contract, or execution gate
- Issue #46 or any later frozen-research task
- External network, credentials, host home/environment, Remote Git,
  publication, deployment, or third-party communication

# Constraints

- Preserve the ordinary fail-closed entry and existing M4 scripts byte for
  byte.
- Treat the compile result, static verifier, and tests as static/unit evidence
  only; they do not establish that Node loaded the object or that any runtime
  identity/enforcement boundary held.
- Keep private filesystem metadata out of public values and preserve held
  no-follow descriptors, complete pre/post-`close` validation,
  unknown-settlement retention, fail-closed drift, cooperative-host limits,
  and no-repair/no-retry rules.
- Do not resolve a test by weakening the exact contract or making `types.js`
  runtime-reachable.
- Preserve all unrelated working-tree changes.

# Deliverables

- Exact dormant activation source and compiler-produced output bytes
- Focused Docker-free tests and static verification for the complete approved
  implementation boundary
- `prompts/reviews/m4-distinct-activation-object-implementation-review.md` for
  a fresh independent Docker-free read-only review
- Minimal status updates recording static/unit implementation evidence and
  naming only that fresh review as next

# Verification

Run exactly the approved compile-only command, `npm run m4:typecheck`,
`npm run m4:static`, `npm run m4:test`, `npm run m4:verify`, a compiled
import-safety assertion that does not import the distinct entry, focused
formatting, and `git diff --check`. Do not run `npm run m4:build`,
`npm run m4:run:controls`, Docker, a production executor, retained-state
access, or a runtime experiment.

# Completion report

- Exact construction and three-set evidence
- Non-reachability, identity/settlement, and focused negative-test evidence
- Changed files and commands actually run
- Commands intentionally not run and remaining evidence limitations
- Exact fresh independent implementation-review boundary
- One concrete `Next:` task
