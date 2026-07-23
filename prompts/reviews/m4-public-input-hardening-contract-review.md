# Goal

Perform a fresh independent Docker-free read-only review of the issue #46 M4
public-input hardening contract. Decide M4-PI01 through M4-PI05 and whether
exactly one bounded static/unit implementation may proceed. Do not implement or
remediate the hardening and do not define or execute a runtime gate.

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
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `containers/profile-control/src/index.ts`
- every source and verification path in the proposed implementation allowlist
- this prompt

# Required decisions

1. **M4-PI01 — complete ingress and input classes:** independently enumerate
   package-root exports, ordinary orchestrator argument parsing, internal
   canonical profile/offline-build/recovery byte roots, typed
   constructors/cross-bindings, asynchronous executors, backend return
   families, primitive selectors, and private brand consumers. Confirm every
   active untrusted graph is listed exactly once as data, explicit authority,
   or private branded state. Block any public or process-return input that
   remains implicit or any host/runtime authority incorrectly treated as
   ordinary data.
2. **M4-PI02 — descriptor and prototype closure:** verify the record/array order
   rejects Proxy before reflection, never invokes accessors or coercion hooks,
   accepts only intrinsic/null record prototypes and the intrinsic array
   prototype, rejects symbols/non-enumerable schema fields/holes/extras/cycles,
   and reconstructs fixed-order deeply immutable canonical data. Reconcile the
   custom-prototype authority-carrier exception without broadening the data
   rule.
3. **M4-PI03 — byte and shared-memory closure:** verify the exact ordinary
   `Uint8Array`/Node `Buffer` prototype set, intrinsic slot access, fixed view
   range, detached/resizable/shared rejection, route size bounds, synchronous
   private copy, copy-out non-aliasing, and no iterator/prototype callback.
   Block any double-read, retry, `Atomics`, mutable alias, or unbounded byte
   route.
4. **M4-PI04 — temporal and authority closure:** trace every async executor from
   outer wrapper through brand resolution, canonical data copy, bounded
   descriptor-only backend method capture, first `await`, backend return
   snapshot, later settlement, and cleanup. Confirm no original caller graph,
   byte view, or method property is read after preflight and no invalid
   preflight calls a backend method. Preserve existing first-failure,
   child-`close`, retention, and Inconclusive semantics after an attempt begins.
5. **M4-PI05 — implementation, tests, and evidence:** map the complete required
   behavior to the exact production/test/static allowlists and table-driven
   negative matrix. Confirm the historical activation rows/hashes and old
   compiled objects remain immutable while current issue #46 source divergence
   is explicit and cannot become a new activation construction. Confirm no host
   backend, entry/executor activation production path, package export/script,
   profile, fixture, image input, compiled output, historical result, runtime
   identity, command, or `Observed` change is included. Decide whether the
   allowlist is both sufficient and no broader than required.

# Review method

- Read the complete working-tree diff and preserve all prior issue #45 and
  presentation changes.
- Derive the actual export/function/parameter inventory from TypeScript syntax
  and compare it with the contract's exact ingress groups and source allowlist.
  Include direct internal process/result parsing roots; do not equate
  package-root non-export with absence of an input boundary.
- Trace current `readPlainRecord`, `readPlainArray`, every byte-copy helper,
  high-level typed wrapper, private brand map/set, executor preflight, and fake
  backend return path. Treat current partial checks as baseline behavior, not
  proof that the proposed contract is complete.
- Reproduce the issue #45 activation source/compiled manifest relationship and
  decide whether the proposed static/test separation preserves the exact old
  identities without requiring modified current source to masquerade as that
  exhausted construction. Do not update or emit a compiled object.
- Use only bounded in-memory, no-write Node assertions if needed to reproduce
  intrinsic `Uint8Array`, `Buffer`, detached/resizable buffer, Proxy, descriptor,
  or `SharedArrayBuffer` semantics. Do not run a production entry or access a
  filesystem/runtime result.
- Verify that class-instance fake backends remain representable only through
  the explicit authority-carrier rule and that their return values remain
  untrusted data.
- Reconcile every proposed negative class with at least one exact test/static
  path and every production path with a necessary contracted ingress. If
  blocked, record one bounded contract-only remediation; do not fix it in this
  session.

# Out of scope

- Changing M4 production source, tests, static verifier, types, compiled output,
  package exports/scripts, profiles, fixtures, inputs, results, or historical
  evidence
- Running TypeScript with filesystem emit, any M4 production script, Docker, a
  container, a runtime socket, retained-state/result-root inspection, cleanup,
  retry, repair, probe/lifecycle execution, or staging rebuild
- Choosing an Expected revision, run ID, result root, container/image identity,
  activation command, output, execution gate, or another measurement generation
- Issue #47 or later frozen-research backlog work
- External network, credentials, host home/environment, Remote Git,
  publication, deployment, or third-party communication

# Deliverables

- `docs/reviews/m4-public-input-hardening-contract.md` with an `APPROVED` or
  `BLOCKED` decision, M4-PI01 through M4-PI05 finding-by-finding analysis,
  independently reproduced ingress/descriptor/byte/temporal/authority evidence,
  exact approved implementation or remediation boundary, evidence
  classification, and limitations
- minimal status updates in `docs/m4-public-input-hardening.md`,
  `docs/index.md`, `docs/milestones.md`, and
  `docs/frozen-research-execution-plan.md`
- if approved, at most one later Docker-free static/unit implementation under
  the exact allowlist; if blocked, one contract-only remediation

# Verification

Use TypeScript/static source inventory assertions, bounded no-write in-memory
Node assertions when necessary, a focused formatter check over review/status
files, and `git diff --check`. Do not run M4 tests, typecheck, a filesystem-
emitting build, Docker, a production executor, retained-state access, or a broad
verification command merely to repeat historical static/unit evidence.

# Completion report

- Decision and M4-PI01 through M4-PI05 status
- Independently reproduced ingress, descriptor/prototype, byte/shared-memory,
  temporal snapshot, authority, and error boundaries
- Exact approved implementation or blocked remediation
- Changed files and commands actually run
- Commands intentionally not run, evidence classes, and remaining limitations
- One concrete `Next:` task
