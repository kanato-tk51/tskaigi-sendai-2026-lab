# Goal

Perform a fresh independent Docker-free read-only review of only frozen-
research issue #43's bounded M0/M2-A construction/execution-gate static/unit
implementation. Decide M2A-CG01 through M2A-CG06 from the implementation,
focused fake/static evidence, and exact allowlist. Do not repair source or
tests, acquire npm or toolchain bytes, construct a production context or image,
call Docker, execute a lifecycle or transfer, or access runtime/result state.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, and `experiments/AGENTS.md`
- `docs/index.md` and the issue #43 documents routed there
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md`, especially the resumed/deferred high-assurance
  boundary
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
- every issue #43 transfer implementation/remediation review routed by
  `docs/index.md`
- `docs/m2-a-evidence-transfer-construction-execution-gate.md`
- all three construction/execution-gate contract review records
- the saved construction/execution-gate contract/remediation prompt chain
- `prompts/m2-a-evidence-transfer-construction-execution-gate-implementation.md`
- every changed production, verification, and status path in that prompt's
  exact allowlist
- this prompt

# Scope

Review the complete bounded implementation diff within the exact M2A-CG06
allowlist. Treat implementation summaries, reported command passes, static
source strings, and contract headings as claims to reproduce independently.
Do not edit any implementation, declaration, verification, prompt, package,
fixture, scenario, result, Expected, or `Observed` path.

The only permitted repository writes are:

- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation.md`
  for the fresh review decision; and
- minimal status/handoff updates in
  `docs/m2-a-evidence-transfer-construction-execution-gate.md`,
  `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`.

Preserve unrelated accumulated worktree changes and every earlier immutable
review record.

## Required finding decisions

### M2A-CG01 — immutable source and acquisition closure

1. Independently recompute the exact ordered 31-row and 41-row aggregates and
   verify the production constructor derives them from held no-follow regular-
   file descriptors before its first output. Confirm baseline drift cannot be
   repaired, caller-overridden, or discovered after construction publication.
2. Trace the canonical npm acquisition and constructor-toolchain receipt/
   inventory validators field by field. Confirm exact package/version/
   integrity/runtime/inventory/digest/review bindings, complete input closure,
   and rejection of path/type/link/sparse/alias/canonical-byte drift without
   consulting ordinary modules, cache, home, historical state, or network.
3. Confirm the implementation/review used only synthetic disposable inputs
   and never inspected the fixed future acquisition or toolchain roots.

### M2A-CG02 — deterministic construction and publication

1. Trace the fixed production constructor from immutable prerequisites through
   the private compiler workspace, exact two-child order, executable/argv/cwd/
   empty-environment/process bounds, all-settled close rules, npm archive
   parser, deterministic fixture archive, and exact context inventory.
2. Reproduce positive construction entirely through branded fake backends and
   disposable roots. Independently reject compiler, archive/PAX, path, mode,
   mtime, size/hash/order, alias, descriptor, timeout/output, close, extra/
   missing inventory, second-derivation, and partial-publication mutations.
3. Confirm the canonical `m2a-transfer-construction/v1` schema, source/
   acquisition/toolchain/compiler bindings, lexical inventory aggregate, sole
   context rename, and final manifest rename. No unclosed descriptor or
   unknown child may precede a visible success manifest.

### M2A-CG03 — offline build plan and image binding

1. Reproduce the exact private build layout, credential-empty config bytes,
   fixed Docker CLI/cwd/three-key environment, five ordered literal argv
   arrays, Docker version, base/tag/build/platform/config projections, numeric
   bounds, and one-build/no-cleanup behavior from implementation data rather
   than prose.
2. Exercise the pure/fake plan and image-binding boundary against inherited
   environment, wrong CLI/argv/order/format/deadline/output, tag presence,
   registry/pull/network fallback, base/platform/config/image-ID substitution,
   unknown settlement, repeated build, and premature binding. Confirm only
   exact known-settled data can form canonical
   `m2a-transfer-image-binding/v1` bytes.
3. Confirm no Docker child, production build entry, fixed build root, image,
   or local image ID was used or created by implementation or review.

### M2A-CG04 — production plan, checkpoint identity, and settlement

1. Trace the fixed production execution plan and prove it has no caller-
   selected argument, environment, path, command, image, runtime option,
   callback, retry, cleanup, or repair surface. Confirm the three entry files
   are the only production activators and remain unreachable from package
   scripts, ordinary imports, and tests.
2. Reproduce the exact ordered `absence-volume`,
   `absence-initializer-container`, and `absence-measurement-container`
   identities and their one-to-one immutable inspect argv. Reject the old
   generic spelling, swaps, duplicates, omissions, reorderings, unknown rows,
   and correct-name/wrong-argv pairs.
3. Model all six known-failure/unknown absence outcomes and representative
   later lifecycle/copy outcomes. Confirm a fully reread/synced/closed/
   renamed/directory-synced pessimistic checkpoint exists before every child
   launch, every known child/output/descriptor settlement completes before
   advancing, and an unknown close makes every later Docker/filesystem action
   unreachable while preserving only the already committed checkpoint.
4. Confirm chronological first issue, prerequisite state, natural exit,
   completion-first conditional copy, destination validation, exact segment/
   marker correlation, final publication immutability, and no retry/cleanup.

### M2A-CG05 — result and evidence separation

1. Trace the exact canonical attempt, completion, transferred-file, segment,
   marker, artifact, and combined-candidate validators. Confirm unknown,
   partial, malformed, noncanonical, unsanitized, wrong-order, or
   contradictory input stays Inconclusive and cannot be converted to missing
   zero events or success.
2. Confirm static intent, construction manifest, image binding, fake build/
   execution model, runtime candidate, reviewed result, M3 ingestion, and
   profile/matrix/presentation `Observed` remain distinct. No implementation
   or status text may claim acquisition, construction, Docker, lifecycle,
   transfer, result, or enforcement behavior was observed.

### M2A-CG06 — allowlist, negative coverage, and import safety

1. Compare every changed path to the exact M2A-CG06 allowlist. Confirm
   `package.json`, lockfiles, Containerfile, manifest, container entries,
   adapter/probe source, package manifests, fixtures, scenarios, results,
   Expected, and `Observed` are unchanged by this implementation.
2. Inspect descriptor-only untrusted-data handling, private brands, backend
   authority, synchronous pre-callback snapshots, canonical bytes, and public
   copies. Exercise Proxy/accessor/symbol/custom-prototype/sparse/reordered/
   extra/type/range/mutation inputs and prove rejection without attacker hook,
   iterator, coercion, or `toJSON` execution.
3. Map the focused test/static inventory to every contract negative family.
   Do not infer coverage from source-string assertions or positive fakes alone.
   Confirm disposable tests never use any fixed ignored production root,
   import an entry, run a lifecycle, construct the production context, call
   Docker, inspect retained state, or create a runtime result.
4. Reproduce import safety and production non-reachability without importing
   or executing the entries. Confirm the static verifier itself has no broad
   filesystem, arbitrary command, network, Docker, or evidence-promotion path.

# Out of scope

- Any repair, refactor, formatting write, dependency/package-script change,
  prompt rewrite, or scope expansion
- npm/toolchain acquisition, fixed-root inspection, production compiler/
  constructor/build/execution entry, context/image construction, Docker/
  runtime-socket action, lifecycle/probe/transfer, result/retained-state
  access, cleanup, repair, retry, signaling, ingestion, or evidence promotion
- Selecting an unknown receipt digest, local image ID, execution command,
  result, Expected value, `Observed` value, alternate generation, or later
  backlog item
- Credentials, host home/environment/cache inspection, external network,
  Remote Git, publication, deployment, or third-party communication

# Constraints

- Use only Docker-free repository source inspection, in-memory calculations,
  existing fake backends, and disposable test roots. Never import or execute
  the three production entries or either container source.
- Do not treat a passing test, current source name, static string, or canonical
  intent as runtime evidence. Reproduce inverse transitions and exact byte/
  identity/settlement relationships independently.
- If a finding remains, record `BLOCKED`, assign the smallest M2A-CGI finding
  ID, and name one bounded Docker-free remediation. Do not fix it in this
  review session or defer a statically decidable gap to runtime observation.
- No standing authorization is needed or used for this read-only review.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation.md`
  with an `APPROVED` or `BLOCKED` decision, M2A-CG01 through M2A-CG06 status,
  finding-by-finding evidence, exact allowlist, identities, schema/process/
  filesystem/checkpoint traces, commands run, evidence class, limitations,
  and one permitted next boundary
- Minimal authoritative status updates only after the decision
- One concrete `Next:` item

# Verification

Run only the Docker-free checks needed to reproduce the implementation claims:

```sh
npm run m2a:transfer:verify
npm run m2a:verify
npm run typecheck
npm test
npm run check
git diff --check
```

Also run focused Prettier checking over the exact implementation allowlist,
this prompt pair, the new review record, and changed status files. Record an
aggregate failure without changing unrelated files. Do not claim any command
passed unless it actually exited successfully.

Do not run `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, a production entry,
Docker, npm acquisition/install/pack/approve/rebuild, or any command that
touches fixed ignored runtime state.

# Completion report

- Review decision and M2A-CG01 through M2A-CG06 status
- Independently reproduced source/acquisition/toolchain, compiler/context,
  build/image-binding, runtime/checkpoint/transfer, allowlist/import, and
  evidence-class boundaries
- Changed files and commands actually run with observed results
- Intentionally unrun commands, remaining cooperative-host/runtime
  limitations, and preserved unrelated work
- If approved, the smallest separately reviewed next gate without claiming
  acquisition, construction, image, Docker, runtime, or result authority; if
  blocked, the exact bounded M2A-CGI remediation
- One concrete `Next:` task
