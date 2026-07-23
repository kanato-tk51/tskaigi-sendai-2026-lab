# Goal

Remediate only the Docker-free M4-AO02 executable-closure finding in the issue
#45 distinct activation-object contract. Produce one internally exact contract
ready for a later fresh independent re-review. Do not implement, compile, or
execute the object and do not define an execution gate.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `docs/index.md`
- `docs/frozen-research-execution-plan.md`
- `docs/m4-distinct-activation-object.md`
- `docs/reviews/m4-distinct-activation-object-contract.md`
- `docs/m4-exact-filesystem-identity.md`
- `docs/reviews/m4-exact-filesystem-identity-implementation-remediation.md`
- `docs/milestones.md` M4 and frozen-research sections
- `docs/codex-workflow.md`
- `docs/presentation-scope.md` deferred high-assurance section
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Required remediation

1. Preserve the exact three proposed paths, 774-byte source, 788-byte
   JavaScript, 11-byte declaration, TypeScript `5.9.3` configuration, all 22
   table rows, 31-source/62-output inventories, three manifest aggregates, and
   13-output compiler delta.
2. Define the syntax-derived TypeScript source closure as exactly 22 modules,
   including `types.ts` through type-only source edges.
3. Define the emitted JavaScript executable runtime import closure as exactly
   21 modules, excluding `types.js`. List or otherwise bind the exact set so no
   runtime member or edge remains implicit.
4. Keep all 22 JavaScript rows in the construction table and manifest. State
   explicitly that `types.js` is the compiler-produced construction counterpart
   of the type-only source member and is not runtime-reachable from the
   activation entry.
5. Correct every contradictory source/executable/runtime-closure statement and
   focused acceptance assertion. Require future tests to distinguish the
   22-source, 22-JavaScript-construction, and 21-executable-import sets and to
   reject a missing, extra, reordered, or unexpected runtime edge.
6. Preserve M4-AO01, M4-AO03, M4-AO04, and M4-AO05 without broadening the
   implementation allowlist, introducing a new import, or weakening
   non-reachability, identity, settlement, redaction, cooperative-host, or
   evidence/gate separation rules.

# Scope

- `docs/m4-distinct-activation-object.md`
- minimal status/handoff updates in `docs/m4-exact-filesystem-identity.md`,
  `docs/index.md`, and `docs/frozen-research-execution-plan.md`
- `prompts/reviews/m4-distinct-activation-object-contract-remediation-review.md`
  for a fresh independent Docker-free re-review
- this prompt only if a pre-work ambiguity must be clarified without rewriting
  review history

# Out of scope

- Adding or changing M4 production source, test, static-verifier, compiled
  output, package script/export, profile, fixture, input, staging, result, or
  historical evidence
- Choosing an Expected revision, run ID, result root, container/image identity,
  activation command, output, process wrapper, or execution gate
- TypeScript filesystem emit, `npm run m4:build`, another production command,
  Docker/container/runtime-socket access, retained-state/result inspection,
  cleanup, retry, repair, or probe/lifecycle execution
- Issue #46 or any later frozen-research task
- External network, credentials, host home/environment, Remote Git,
  publication, deployment, or third-party communication

# Constraints

- Use the TypeScript compiler API only with the proposed source held in memory
  and a write callback that emits no repository or temporary file.
- Derive source and JavaScript import graphs from syntax. Do not execute or
  import the proposed entry.
- Do not resolve M4-AO02 by adding a runtime import of `types.js`, deleting the
  type-only source row, changing construction bytes, or redefining
  "executable closure" to mean every emitted JavaScript file.
- Preserve the ordinary fail-closed entry and direct future Node-path action as
  unapproved.
- Keep private filesystem metadata out of public values and preserve the
  cooperative-host limitation, child-`close` settlement, unknown-settlement
  retention, fail-closed drift, and no-repair/no-retry rules.
- Do not alter or reinterpret a historical run/result or promote `Observed`.

# Deliverables

- Remediated `docs/m4-distinct-activation-object.md` closing M4-AO02 at
  contract scope without changing the construction contract
- `prompts/reviews/m4-distinct-activation-object-contract-remediation-review.md`
  for a fresh independent read-only re-review
- Minimal authoritative status updates naming only that re-review as next

# Verification

Use read-only hashes, in-memory compiler output, syntax-derived source/runtime
closures, a focused formatter check over changed contract/prompt/status files,
and `git diff --check`. Do not run tests, typecheck, filesystem-emitting build,
Docker, a production executor, retained-state access, or a broad verification
command.

# Completion report

- Exact 22-source, 22-JavaScript-construction, and 21-executable-import sets
- Preserved bytes, manifests, delta, identity, allowlist, and gate separation
- Changed files and commands actually run
- Commands intentionally not run and remaining evidence limitations
- Exact fresh remediation re-review boundary
- One concrete `Next:` task
