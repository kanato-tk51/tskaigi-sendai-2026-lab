# Goal

Perform a fresh independent Docker-free read-only review of only the issue #45
M4 distinct activation-object implementation. Decide whether the exact dormant
source, compiler construction, static verifier, and focused tests satisfy the
approved M4-AO01 through M4-AO05 contract boundary and whether at most one
separately defined execution-gate contract task may begin next. Do not repair,
import, or execute the object and do not define or cross an execution gate.

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
- `prompts/m4-distinct-activation-object-implementation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Required decisions

1. **Exact construction:** independently reproduce the 774-byte source and
   pinned TypeScript `5.9.3` compile with no diagnostics. Verify the exact
   788-byte JavaScript, 11-byte declaration, 31-source/62-output inventories,
   three construction manifests, and exact four-new/nine-replaced compiled
   delta. Reject every unallowlisted production-source or compiled change.
2. **Three exact sets:** independently derive the ordered 22-module TypeScript
   source closure, 22 JavaScript and 22 declaration construction sets, and
   21-module emitted-JavaScript executable import closure. Confirm all source
   edges to `types.ts` are type-only, `types.js` has no runtime inbound edge,
   and no computed/dynamic import, `require`, package alias, missing edge,
   extra edge, member, or ordering drift is accepted.
3. **Dormant reachability:** verify the package root, root/workspace scripts,
   ordinary entries, recovery entry, and every other production source/output
   do not import, export, invoke, or name the distinct entry. Confirm the
   compiled import-safety assertion does not import the distinct entry and
   observes no compile, child spawn, timer, filesystem mutation, Docker work,
   or activation during ordinary imports.
4. **Identity and settlement:** verify the new objects are one-link regular
   files, pairwise distinct, exact-byte/size bound, and have the exact private
   peer owner/full-mode relations. Reconcile focused symlink, hardlink,
   same-byte replacement, parent replacement, in-place/special-mode drift,
   source/compiled alias, pre/post-`close`, exit-without-close,
   unknown-settlement retention, and early-stability coverage without treating
   it as runtime evidence.
5. **Evidence and next boundary:** confirm no package script/export, ordinary
   entry, profile, input, Expected/Observed value, historical result, runtime
   tuple, process wrapper, or gate was changed. If no finding remains, approve
   at most one later Docker-free execution-gate contract task; otherwise name
   exactly one bounded implementation remediation. Do not choose runtime
   identities or approve an activation command in this review.

# Review method

- Inspect the complete working-tree diff and preserve unrelated prior issue
  #45 work.
- Recompute exact hashes, sizes, inventories, manifests, compiler delta, and
  syntax-derived source/executable graphs. Use the pinned compiler in memory or
  the already approved compile-only command only; never import or execute the
  entry.
- Inspect all allowlisted tests and static assertions finding by finding.
- Rerun the proportional Docker-free implementation checks, including
  `npm run m4:verify`, the compiled import-safety assertion without the entry,
  focused formatting, and `git diff --check`.
- Record expected contract requirements separately from observed command
  results.

# Out of scope

- Editing or repairing the implementation, source, compiled bytes, tests,
  verifier, contract, profile, package script/export, or historical evidence
- Importing or executing the distinct object, `npm run m4:build`,
  `npm run m4:run:controls`, another production executor, Docker/container or
  runtime-socket access, retained-state/result-root inspection, cleanup, retry,
  repair, or probe/lifecycle execution
- Choosing an Expected revision, run ID, result root, image/container identity,
  activation command, output contract, process wrapper, or execution gate
- Issue #46 or a later frozen-research task
- External network, credentials, host home/environment, Remote Git,
  publication, deployment, or third-party communication

# Deliverables

- `docs/reviews/m4-distinct-activation-object-implementation.md` with an
  `APPROVED` or `BLOCKED` decision, construction/three-set evidence,
  finding-by-finding identity/reachability/test analysis, evidence classes,
  limitations, and the one permitted next boundary
- Minimal authoritative status updates in
  `docs/m4-distinct-activation-object.md`,
  `docs/m4-exact-filesystem-identity.md`, `docs/index.md`, and
  `docs/frozen-research-execution-plan.md`

# Verification

Use only Docker-free read-only hashes, syntax/compiler assertions, the existing
focused static/unit commands, a compiled import-safety assertion that does not
import the distinct entry, focused formatting, and `git diff --check`. Do not
run the entry, `npm run m4:build`, `npm run m4:run:controls`, Docker, a
production executor, retained-state access, or a runtime experiment.

# Completion report

- Decision and M4-AO01 through M4-AO05 implementation status
- Exact construction and three-set evidence
- Non-reachability, identity/settlement, and negative-test evidence
- Changed review/status files and commands actually run
- Commands intentionally not run and remaining evidence limitations
- Exact approved gate-contract or blocked remediation boundary
- One concrete `Next:` task
