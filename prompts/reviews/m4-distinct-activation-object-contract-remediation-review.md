# Goal

Perform a fresh independent Docker-free read-only re-review of only the issue
#45 M4-AO02 distinct activation-object contract remediation. Decide whether the
contract now closes M4-AO02 without changing its construction contract, whether
M4-AO01 and M4-AO03 through M4-AO05 remain closed, and whether at most one
bounded compile-only/static/unit implementation may proceed. Do not repair,
implement, emit the object to the filesystem, execute it, or define an
execution gate.

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
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Required decisions

1. **M4-AO02 source closure:** independently derive the exact ordered
   22-module TypeScript source closure from syntax, including `types.ts` only
   through its type-only source edges. Reject a missing, extra, reordered, or
   unexpected source member or edge.
2. **M4-AO02 construction set:** reproduce in memory the exact 22 JavaScript
   and 22 declaration compiler outputs, including construction-only
   `types.js`; preserve all paths, bytes/hashes, table rows, 31-source/62-output
   inventories, three manifest aggregates, and the exact 13-output delta.
3. **M4-AO02 executable closure:** derive from emitted-JavaScript syntax the
   exact ordered 21-module runtime import closure fixed by the contract.
   Confirm `types.js` has no runtime inbound edge and reject any missing,
   extra, reordered, computed/dynamic, or otherwise unexpected runtime edge.
4. **Preserved findings:** confirm the correction adds no runtime import,
   loading form, path, output, implementation/test/static-verifier path,
   package export/script, ordinary-entry reachability, or weakened identity,
   settlement, redaction, cooperative-host, or evidence/gate rule. Keep
   M4-AO01 and M4-AO03 through M4-AO05 closed only if their earlier exact
   boundaries remain unchanged.
5. **Next boundary:** if M4-AO02 closes with no new finding, approve at most the
   contract's already fixed Docker-free compile-only/static/unit implementation
   allowlist. If blocked, name exactly one bounded contract-only remediation.
   Do not choose an Expected revision, run ID, result root, container/image
   identity, activation command, output, process wrapper, or execution gate.

# Review method

- Inspect the complete working-tree diff and preserve unrelated prior issue
  #45 implementation changes.
- Recompute the proposed source hash and use repository-pinned TypeScript
  `5.9.3` only through an in-memory virtual source and write callback. Do not
  write the proposed source, compiled output, or a temporary activation path.
- Derive both source and emitted-JavaScript relative import graphs from syntax;
  do not import or execute the proposed entry.
- Compare the exact 22-source, 22-JavaScript-construction, and 21-executable
  ordered sets and scan the remediated contract for contradictory closure
  terminology.
- Reproduce construction manifests, inventories, compiler delta, ordinary
  entry/package-root identities, and non-reachability with read-only checks.
- Treat prior implementation verification as recorded static/unit evidence;
  do not rerun broad checks merely to repeat it.

# Out of scope

- Editing the remediated contract or adding the activation source, compiled
  JavaScript/declaration, tests, static-verifier changes, or any implementation
- TypeScript filesystem emit, `npm run m4:build`, `npm run m4:run:controls`,
  another production command, Docker/container/runtime-socket access,
  retained-state/result inspection, cleanup, retry, repair, or probe/lifecycle
  execution
- Choosing a runtime tuple, command, output contract, or execution gate
- Issue #46 or any later frozen-research task
- External network, credentials, host home/environment, Remote Git,
  publication, deployment, or third-party communication

# Deliverables

- `docs/reviews/m4-distinct-activation-object-contract-remediation.md` with an
  `APPROVED` or `BLOCKED` decision, exact three-set evidence, finding-by-finding
  preservation analysis, evidence classes, limitations, and the one permitted
  next boundary
- minimal status updates in `docs/m4-distinct-activation-object.md`,
  `docs/m4-exact-filesystem-identity.md`, `docs/index.md`, and
  `docs/frozen-research-execution-plan.md`

# Verification

Use read-only hashes, in-memory compiler output, syntax-derived source/runtime
closures, focused reference assertions, a focused formatter check over changed
review/status files, and `git diff --check`. Do not run tests, typecheck, a
filesystem-emitting build, Docker, a production executor, retained-state
access, or a broad verification command.

# Completion report

- Decision and M4-AO01 through M4-AO05 status
- Exact 22-source, 22-JavaScript-construction, and 21-executable-import sets
- Preserved paths, bytes, manifests, inventories, delta, identity, allowlist,
  and evidence/gate separation
- Changed files and commands actually run
- Commands intentionally not run and remaining evidence limitations
- Exact approved implementation or blocked remediation boundary
- One concrete `Next:` task
