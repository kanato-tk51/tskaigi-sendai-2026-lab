# Goal

Perform a fresh independent Docker-free read-only re-review of the issue #45
M4 distinct activation-object execution-gate contract after the bounded
M4-AGR01 through M4-AGR03 remediation. Decide whether all three findings close
and whether M4-AG01 through M4-AG06 are exact enough to approve only the
already bounded later Docker-free implementation. Do not implement the wrapper,
rebind run IDs, import or execute the activation object, or approve/run the
candidate command.

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
- `prompts/m4-distinct-activation-object-execution-gate-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Required independent checks

1. Reproduce the preserved `m4-activation-expected-20260720-02` generation,
   both fixed run/root/container tuples, unchanged profile/input/image bytes,
   constants compiler delta, activation bytes/manifests/sets, and exact
   32-source/64-output parent inventory names without probing any result root
   or Docker state.
2. Decide **M4-AGR01** by deriving both the TypeScript and emitted-JavaScript
   wrapper edge contracts. Confirm the exact ordered seven `node:` specifiers
   and value/type binding delta, empty repository-local direct import sets,
   singleton wrapper source/executable closures, separately preserved
   22/22/22/21 activation construction/executable sets, and complete held-byte,
   identity, ordering, and edge rules. Reject any missing, extra, reordered,
   alternate built-in, relative, absolute, `file:`, dynamic/computed,
   `require`, `createRequire`, evaluation, package/subpath, activation-entry,
   ordinary-entry, backend/runner, or otherwise unleased executable edge.
3. Decide **M4-AGR02** by tracing the exact returned-handle boundary. Confirm
   the synchronous thrown-spawn branch has no child/`close`, the one-step
   prefix, third/fourth complete validations, reverse descriptor release,
   exact sanitized-or-suppressed output, exit `70`, untouched-but-exhausted
   roots, and no retry. Separately trace asynchronous `error` with and without
   later `close`, exact exit/close correlation, TERM and KILL delivery failure,
   the preserved initiating code, eventual late `close`, and the complete
   child/lease unknown-settlement owner.
4. Decide **M4-AGR03** by enumerating the write-once chronological latch for
   timeout, output overflow, process/exit-close failure, and invalid child
   result. Confirm signal failure cannot replace its required initiating
   timeout/output code; every non-empty latch permanently disqualifies even
   byte-valid complete or Inconclusive child output; the exact one/two/four/five
   step prefixes are closed; and no canonical output precedes both post-close
   validations and successful descriptor release.
5. Check focused later acceptance exhaustively covers every wrapper edge and
   unleased-edge rejection; synchronous no-child spawn failure; asynchronous
   error with and without later `close`; TERM/KILL delivery failure;
   exit-without-close; release failure; and valid complete/Inconclusive bytes
   arriving after each earlier wrapper failure.
6. Re-evaluate M4-AG01 through M4-AG06 as a whole. Preserve the fixed command,
   child object, limits, identity protocol, backend side-effect ceiling, root
   retention, no repair/retry, implementation/test allowlist, later
   implementation/gate review, later result review, ADR-0001 separation,
   historical immutability, and every `Observed` boundary.
7. If all findings close, approve at most the exact Docker-free
   implementation/static/unit allowlist already recorded in the contract. Do
   not approve the candidate command or standing-authorization use. If any
   branch is ambiguous or incomplete, record an exact blocking finding and do
   not broaden the remediation or implementation scope.

# Scope

- Read-only repository inspection and in-memory TypeScript/compiler/AST/schema
  assertions over repository-owned inputs
- New
  `docs/reviews/m4-distinct-activation-object-execution-gate-remediation.md`
- Minimal issue #45 status/handoff updates only after the decision

# Out of scope

- Adding or changing the wrapper, constants, compiled output, tests, static
  verifier, profile README/JSON, package manifest/script, activation or
  ordinary entry, backend/executor source, fixture, input, result, Expected
  matrix, historical evidence, or `Observed`
- Importing or executing the activation object; compiling to disk; running a
  production executor, candidate command, another M4 command, probe, or
  lifecycle fixture
- Docker/container/runtime-socket access, retained-state or result-root access,
  path-existence probes for old or new roots, cleanup, retry, repair,
  signaling, or external communication
- Approving one-shot execution, using standing authorization, choosing a new
  generation, starting issue #46, Remote Git, publication, or deployment
- External network, credentials, host home/environment, or non-repository
  executable-byte inspection

# Verification

Use only scoped repository reads, in-memory TypeScript/compiler/AST/schema
assertions, focused formatting, and `git diff --check`. Do not emit compiler
output to disk, import the wrapper/activation/ordinary production entry, run
the candidate command, inspect a result root, or access Docker or retained
state.

# Deliverables

- Fresh review record with explicit M4-AGR01 through M4-AGR03 and M4-AG01
  through M4-AG06 decisions
- Exact reproduced values and commands actually run
- Commands intentionally not run and evidence-class limitations
- If approved, one bounded implementation-only handoff; otherwise one exact
  contract-remediation handoff
- Minimal authoritative status updates naming only that handoff as next
- One concrete `Next:` task
