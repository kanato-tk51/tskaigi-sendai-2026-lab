# Goal

Perform a fresh independent Docker-free read-only review of the separately
named issue #45 M4 distinct activation-object contract. Decide M4-AO01 through
M4-AO05 and whether exactly one bounded compile-only/static/unit implementation
may proceed. Do not repair or implement the object, emit compiled output, or
define an execution gate.

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
- `docs/reviews/m4-exact-filesystem-identity-contract-residual-remediation.md`
- `docs/reviews/m4-exact-filesystem-identity-implementation.md`
- `docs/reviews/m4-exact-filesystem-identity-implementation-remediation.md`
- `docs/reviews/m4-execution-profiles-offline-build-backend.md`
- `docs/reviews/m4-execution-profiles-offline-build-execution-gate.md`
- `docs/reviews/m4-execution-profiles-offline-build-recovery.md`
- `docs/reviews/m4-execution-profiles-run-controls-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Required decisions

1. **M4-AO01 — exact construction:** independently reproduce the absent three
   proposed paths, the exact 774-byte source, 788-byte JavaScript, 11-byte
   declaration, pinned TypeScript configuration, 22-source/44-output table,
   exact 31-entry source and 62-entry compiled inventories, three encoded
   manifest aggregates, and exact compile delta. Block any path, byte, output,
   inventory, ordering, compiler, or changed-file choice left open.
2. **M4-AO02 — closed dependency reachability:** independently derive the
   static source and executable closure. Confirm no computed/dynamic/package
   import and no offline-build/recovery entry reaches the control activation.
   Confirm package root, ordinary entries/orchestrator, every package/workspace
   script, and other source files cannot import, export, or invoke the distinct
   entry. Treat a direct future Node path as an unapproved later action.
3. **M4-AO03 — identity and settlement:** reconcile the complete source,
   JavaScript, declaration, ancestor, inventory, owner/full-mode, unique-inode,
   held-descriptor, exact-byte, pre/immediate/post-use, child-`close`, unknown
   settlement, redaction, and fail-closed drift rules with the approved shared
   BigInt implementation. Block any pre-load/path-only atomicity claim beyond
   the explicit cooperative-host limitation.
4. **M4-AO04 — implementation and tests:** verify the exact construction and
   verification allowlists cover every actually changed compiler output and no
   existing production TypeScript, package script/export, profile, fixture,
   ordinary entry, input, result, or historical record. Trace focused tests to
   bytes/closure/reachability, aliases/replacement/metadata drift,
   source/compiled distinction, process settlement, early stability, and import
   safety.
5. **M4-AO05 — evidence and gate separation:** confirm the contract does not
   implement or execute the object, choose a fresh Expected revision, run ID,
   result root, container/image identity, activation command, or output, define
   an execution gate, access retained state, run Docker, change historical
   evidence, or promote `Observed`.

# Review method

- Read the complete working-tree diff and preserve unrelated prior issue #45
  implementation changes.
- Recompute the proposed source hash and use the TypeScript compiler API with
  an in-memory virtual source and write callback. Do not write the proposed
  source or compiled output to the repository or a temporary activation path.
- Derive relative static import/export edges from TypeScript syntax and compare
  the exact transitive closure. Do not execute or import the proposed entry.
- Compare the in-memory emit with current tracked `dist` bytes and reproduce the
  exact changed/new output allowlist.
- Inspect exact package/source references and current ordinary entry/output
  hashes. Do not call a production entry merely to prove it fails closed.
- Treat recorded first-implementation verification as a claim, not new runtime
  proof. Rerunning `npm run m4:verify` is unnecessary for a contract-only
  review; use read-only assertions.
- If blocked, record one bounded contract-only remediation. Do not fix it in
  this session.

# Out of scope

- Adding the activation source, compiled JavaScript/declaration, tests, static
  verifier changes, or any other implementation
- Running TypeScript with filesystem emit, `npm run m4:build`,
  `npm run m4:run:controls`, another M4 production script, Docker, a container,
  a runtime socket, a probe/lifecycle fixture, staging, retained-state access,
  cleanup, retry, or result repair
- Choosing or reserving an Expected revision, run ID, result root, container
  name, image identity, command, output hash, or execution gate
- Issue #46 or later frozen-research tasks
- External network, credentials, host home/environment, Remote Git,
  publication, deployment, or third-party communication

# Deliverables

- `docs/reviews/m4-distinct-activation-object-contract.md` with an `APPROVED` or
  `BLOCKED` decision, M4-AO01 through M4-AO05 finding-by-finding analysis,
  independent construction/closure/reachability evidence, exact approved or
  blocked boundary, evidence classification, and limitations
- minimal status updates in `docs/m4-distinct-activation-object.md`,
  `docs/m4-exact-filesystem-identity.md`, `docs/index.md`, and
  `docs/frozen-research-execution-plan.md`
- if approved, at most one exact Docker-free compile-only/static/unit
  implementation under the contract allowlist; if blocked, one contract-only
  remediation

# Verification

Use read-only hashes, in-memory compiler output, dependency/reachability
assertions, a focused formatter check over review/status files, and
`git diff --check`. Do not run tests, typecheck, a filesystem-emitting build,
Docker, a production executor, or a broad verification command merely to repeat
historical evidence.

# Completion report

- Decision and M4-AO01 through M4-AO05 status
- Independently reproduced construction, closure, reachability, identity, and
  cooperative-host boundary
- Exact approved implementation or blocked remediation
- Changed files and commands actually run
- Commands intentionally not run, evidence classes, and remaining limitations
- One concrete `Next:` task
