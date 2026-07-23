# Goal

Remediate only M4-AGR01 through M4-AGR03 in the issue #45 M4 distinct
activation-object execution-gate contract. Produce one internally exact
Docker-free contract ready for a fresh independent re-review. Do not implement
the wrapper, rebind run IDs, import or execute the activation object, or
approve/run the candidate command.

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
- `docs/m4-distinct-activation-object-execution-gate.md`
- `docs/reviews/m4-exact-filesystem-identity-implementation-remediation.md`
- `docs/reviews/m4-distinct-activation-object-contract-remediation.md`
- `docs/reviews/m4-distinct-activation-object-implementation.md`
- `docs/reviews/m4-distinct-activation-object-execution-gate.md`
- `prompts/m4-distinct-activation-object-implementation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Required remediation

1. **M4-AGR01 — wrapper executable closure:** fix the wrapper's exact direct
   built-in and repository-local static imports and its complete transitive
   executable dependency set. Every repository-local executable dependency
   must be an exact held member with fixed bytes, identity, ordering, and edge
   rules. Reject dynamic/computed import, `require`, package/subpath import,
   another production entry, and any missing, extra, reordered, or unleased
   local edge. Preserve the activation object's existing
   22-source/22-JavaScript/22-declaration construction sets and 21-module
   executable closure as a distinct contract.
2. **M4-AGR02 — no-child and signal settlement:** define the exact synchronous
   spawn-failure branch where no child handle exists and no `close` can occur.
   Fix its step prefix, required complete-lease revalidations, sanitized
   output or deliberate output suppression, exit code, descriptor release,
   root disposition, and no-retry consequence without pretending that a child
   settled. Separately bind asynchronous child `error` and signal-delivery
   failure. If a created child lacks `close`, retain the existing child/lease
   unknown-settlement owner; if `close` occurs, preserve the already latched
   signal/process failure.
3. **M4-AGR03 — monotonic output precedence:** make a child control result
   eligible only when no timeout, output-limit, process, or signal failure has
   latched. Define one chronological first-failure mapping to the exact public
   codes and prove later stdout/stderr, error, exit, signal result, or `close`
   cannot replace the first failure. Preserve strict framing, exit
   correlation, step prefixes, private-field suppression, and no canonical
   output before the required post-`close` validations.
4. Extend focused Docker-free acceptance to cover every fixed wrapper import
   edge and unleased-edge rejection; synchronous no-child spawn failure;
   asynchronous error with and without later `close`; TERM/KILL delivery
   failure; and valid complete/inconclusive child output arriving after each
   earlier wrapper failure.
5. Save a fresh independent Docker-free remediation re-review prompt that
   decides M4-AGR01 through M4-AGR03 and M4-AG01 through M4-AG06. Do not approve
   implementation in the remediation task itself.

# Preserve exactly

- `m4-activation-expected-20260720-02`, both `20260720-02` run IDs, result
  roots, and container names
- unchanged `m4-profile-v1`, container input ID, recovered image digest, and
  canonical profile bytes
- the proposed constants source/JavaScript/declaration sizes and hashes, all
  three updated activation manifests, unchanged activation bytes, and
  32-source/64-output parent inventory names
- the fixed argument-free package command candidate, single child executable,
  argv/cwd/empty environment/stdio/group bounds, 90-second timeout,
  65,536-byte output ceiling, and no-second-spawn rule
- private BigInt held-object identity, pairwise non-aliasing, exact bytes,
  owner/full-mode relations, two pre-spawn and two post-`close` validations,
  cooperative-host limitation, identity-output suppression, and terminal
  unknown-settlement retention
- existing backend command/side-effect ceiling, exact new-root retention,
  no old-state/build-tag access, no post-attempt Docker cleanup, no repair, and
  no retry
- the current implementation/test path allowlist, later implementation/gate
  review, later result review, ADR-0001 separation, historical immutability,
  and all `Observed` boundaries

# Scope

- `docs/m4-distinct-activation-object-execution-gate.md`
- minimal status/handoff updates in
  `docs/m4-distinct-activation-object.md`,
  `docs/m4-exact-filesystem-identity.md`, `docs/index.md`, and
  `docs/frozen-research-execution-plan.md`
- new
  `prompts/reviews/m4-distinct-activation-object-execution-gate-remediation-review.md`
- this prompt only if a pre-work ambiguity must be clarified without rewriting
  review history

# Out of scope

- Adding or changing the wrapper, constants, compiled outputs, tests, static
  verifier, profile README/JSON, package script, activation/ordinary entry,
  backend/executor source, fixture, input, result, Expected matrix, historical
  evidence, or `Observed`
- Importing or executing the activation object; compiling to disk; running a
  production executor, the candidate command, another M4 command, a probe, or
  a lifecycle fixture
- Docker/container/runtime-socket access, retained-state or result-root
  inspection, path-existence probes for old or new roots, cleanup, retry,
  repair, signaling, or external communication
- Approving one-shot execution, using standing authorization, selecting a new
  generation, or starting issue #46
- External network, credentials, host home/environment, Remote Git,
  publication, deployment, or third-party communication

# Verification

Use only scoped repository reads, in-memory TypeScript/compiler/AST/schema
assertions, focused formatting, and `git diff --check`. Do not emit compiler
output to disk, run the wrapper/entry/production executor, probe a result root,
or access Docker or retained state.

# Deliverables

- Remediated execution-gate contract closing only M4-AGR01 through M4-AGR03
- Fresh independent remediation re-review prompt
- Minimal authoritative status updates naming only that re-review as next
- Commands actually run, commands intentionally not run, evidence classes,
  remaining limitations, and one concrete `Next:` task
