# Goal

Perform a fresh independent Docker-free read-only re-review of only frozen-
research issue #43's M2A-CGR01 through M2A-CGR03 construction/execution-gate
contract remediation. Decide whether the remediated contract now fixes every
constructor/runtime/resolver input, canonical schema, image-build command and
binding value, and host copy/result transaction before implementation. Do not
repair the contract, implement source, acquire a dependency, construct a
context or image, call Docker, or access runtime/result state.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, and `experiments/AGENTS.md`
- `docs/index.md` and the issue #43 documents routed there
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md` deferred high-assurance section
- `docs/milestones.md` M0, M2-A, and frozen-research sections
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `docs/experiment-protocol.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/spike-npm12.md`
- `docs/m2-a-npm-lifecycle-adapter.md`
- `docs/reviews/m2-a-npm-lifecycle-adapter.md`
- `docs/m2-a-evidence-transfer-contract.md`
- every issue #43 implementation/remediation review routed by `docs/index.md`
- `docs/m2-a-evidence-transfer-construction-execution-gate.md`
- `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-review.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate.md`
- `prompts/m2-a-evidence-transfer-construction-execution-gate-remediation.md`
- this prompt

# Scope

Review only the remediated construction/execution-gate contract, the saved
remediation/re-review prompt pair, their minimal five status records, and
repository-controlled tracked source needed to reproduce the fixed identities.
Treat every schema, argv, format string, numeric bound, path, absence,
publication, and future-approval statement as a claim to verify. Preserve
unrelated M3, M4, presentation, result, and user working-tree changes.

## M2A-CGR01 decision

1. Reproduce the fixed tuple and exact 31-row/41-row aggregates. Confirm the
   separate npm receipt remains unperformed and the new fixed toolchain receipt
   is also an explicit not-yet-authorized prerequisite, not a self-approving
   record or hidden root `node_modules`/global-cache/home fallback.
2. Verify the complete `m2a-transfer-toolchain/v1` ordered schema binds the
   fixed Node executable/runtime closure and exact TypeScript `5.9.3`,
   `@types/node` `20.19.43`, and `undici-types` `6.21.0` regular-file
   inventories, lockfile integrities, modes/sizes/hashes, aggregate, and later
   independent receipt review. Reject any omitted executable, loader/library,
   compiler library, Node type, or resolver input.
3. Trace the constructor and the two fixed compiler steps through the private
   workspace. Confirm exact executable/argv/order/cwd/environment/deadline/
   output/signal/close settlement, no ordinary resolver fallback, the second
   compile's regular copied probe-core package, private-workspace non-promotion,
   and pre-manifest cleanup/descriptor settlement.
4. Validate the complete ordered `m2a-transfer-construction/v1` top-level and
   nested schemas, nullability, canonical bytes, receipt/source/hash bindings,
   lexical context inventory, and aggregate inputs. No implementer-selected
   key, tool path, compiler bound, or projection may remain.

## M2A-CGR02 decision

1. Reproduce the private build layout, exact credential-empty config bytes,
   modes/owner/non-symlink/identity policy, Docker executable/cwd/environment,
   five argv arrays, literal Go format strings, command order, and numeric
   bounds.
2. Confirm the plan validates Docker client/server `29.6.1`, exact tag absence,
   pinned local base identity, one offline `linux/amd64` build with no pull,
   cache, provenance, SBOM, retry, or cleanup, and one exact candidate inspect.
   Confirm no build command can reach registry, runtime container/volume,
   transfer, result, or evidence operations.
3. Validate every ordered field and exact value in
   `m2a-transfer-image-binding/v1`: base, construction and receipt identities,
   build policy/occurrence, exact local `sha256:` ID, platform/config
   projection, retention, `runtimeExecutionApproved: false`, and
   `evidenceReview: "not-performed"`. Confirm canonical publication occurs
   only after all command/output/descriptor/context checks settle.

## M2A-CGR03 decision

1. Reproduce the existing fixed runtime plan and exact host layout. Confirm
   every relative `docker cp` destination is bound by the child cwd to the
   exact mode-`0700` result root and held mode-`0700` transfer directory, with
   exact owner/type/link/ancestor/no-follow checks and no extra path.
2. Model the full write-ahead transaction. Before each Docker child, require a
   fully synced canonical `attempt.json` checkpoint that pessimistically marks
   that exact next step unknown. Confirm exclusive `.next`, same-byte reread,
   close, rename-over, directory sync, and no command launch on checkpoint
   failure. After known settlement, confirm all child/output/descriptors close
   before the next checkpoint or final outcome.
3. Force an unknown Docker CLI close in the model and confirm no post-unknown
   Docker, inspect, copy, validation, cleanup, or filesystem publication is
   permitted while the already committed prelaunch checkpoint remains the
   durable sanitized Inconclusive record. Confirm this resolves, rather than
   restates, the prior preservation/publication contradiction.
4. Reproduce known failure, successful completion-first conditional copy,
   segment/marker correlation, final publication, and publication-failure
   paths. Confirm chronological first issue, exact copy destination, natural
   exit, immutable final bytes, no fallback/retry/repair/cleanup, and the stated
   cooperative-host limitation.

# Out of scope

- Contract repair, implementation/test/declaration/package-script edits, npm
  or toolchain acquisition, production construction, image build/inspect,
  Docker/container/runtime-socket action, lifecycle/probe/transfer execution,
  result or retained-state access, cleanup, or evidence promotion
- Inspecting the fixed ignored acquisition/construction/build/result roots,
  host home/environment/cache, credentials, Docker state, or historical result
  contents
- Changing the fixed tuple, baseline, existing transfer implementation,
  historical M0/M2-A evidence, Expected, or `Observed`

# Constraints

- Use read-only repository-controlled source inspection and in-memory hash/
  model calculations only.
- Do not infer closure from prose headings. Verify every exact key sequence,
  enum, nullability rule, byte format, argv value, deadline, output limit,
  process terminal, path identity, and checkpoint transition.
- A blocked decision must name only the smallest remaining contract gap. Do
  not repair it in this session or defer it to runtime observation.
- No standing authorization, credentials, external network, Remote Git,
  publication, deployment, or third-party communication.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-remediation.md`
  with an `APPROVED` or `BLOCKED` decision, M2A-CGR01 through M2A-CGR03 and
  M2A-CG01 through M2A-CG06 statuses, reproduced identities, exact schema/
  command/transaction evidence, commands run, limitations, and one permitted
  next boundary
- minimal status updates in `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`
- one concrete `Next:` item

# Verification

- Recompute the exact ordered 31-row and 41-row aggregates in memory.
- Run focused Prettier checking over the remediated contract, this prompt pair,
  new review record, and five status records.
- Run `git diff --check`.
- No test is required for this documentation-only re-review. If a static/unit
  command is run, report it exactly and do not treat it as construction,
  image, runtime, transfer, or evidence proof.

# Completion report

- Decision and M2A-CGR01 through M2A-CGR03 / M2A-CG01 through M2A-CG06 status
- Reproduced toolchain/schema, build/binding, and host checkpoint transaction
- Changed files and commands actually run
- Intentionally unrun commands, remaining limitations, and exact next boundary
