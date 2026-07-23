# Goal

Implement only the independently approved frozen-research issue #47 first
production codegen `observe` raw-to-derived collector at its exact Docker-free
static/unit boundary. Preserve the additive v3/v2 separation, immutable raw
input, deterministic two- or five-file derivation, sole-rename publication,
sanitized rejection, and evidence non-promotion contracts. Do not activate or
ingest the collector.

# Read first

- root `AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md` deferred high-assurance section
- `docs/milestones.md` M3 and frozen-research sections
- `docs/codex-workflow.md`
- `docs/experiment-protocol.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- `docs/reviews/m3-harness-and-reports.md`
- `docs/reviews/m3-harness-and-reports-remediation.md`
- `docs/m2-e-codegen-adapter.md`
- `docs/reviews/m2-e-codegen-adapter.md`
- `docs/reviews/p2-selected-profile-codegen-receipts.md`
- `docs/m3-production-raw-to-derived-collector.md`
- `docs/reviews/m3-production-raw-to-derived-collector-contract.md`
- `docs/reviews/m3-production-raw-to-derived-collector-contract-remediation.md`
- `prompts/reviews/m3-production-raw-to-derived-collector-contract-review.md`
- `prompts/m3-production-raw-to-derived-collector-contract-remediation.md`
- `prompts/reviews/m3-production-raw-to-derived-collector-contract-remediation-review.md`
- this prompt

# Scope

Production changes are limited to the exact M3-PC06 paths:

- `packages/lab-cli/src/constants.ts`
- `packages/lab-cli/src/types.ts`
- `packages/lab-cli/src/errors.ts`
- `packages/lab-cli/src/safe-data.ts`
- `packages/lab-cli/src/scenario.ts`
- `packages/lab-cli/src/collector.ts`
- `packages/lab-cli/src/reducer.ts`
- `packages/lab-cli/src/renderer.ts`
- `packages/lab-cli/src/persistence.ts`
- new `packages/lab-cli/src/codegen-production.ts`
- `packages/lab-cli/src/index.ts` only for pure v3 types and functions, never a
  filesystem-taking collector or activation entry

Scenario and verification changes are limited to:

- new `scenarios/codegen-observe-p.json`
- new `scenarios/codegen-observe-c.json`
- `results/runs/README.md`
- `packages/lab-cli/scripts/verify-static.mjs`
- new `packages/lab-cli/test/codegen-production.test.ts`
- `packages/lab-cli/test/collector.test.ts`
- `packages/lab-cli/test/determinism.test.ts`
- `packages/lab-cli/test/invalid.test.ts`
- `packages/lab-cli/test/runner.test.ts`
- `packages/lab-cli/test/helpers.ts`
- `packages/lab-cli/test/static-safety.test.ts`

Also update only `docs/m3-production-raw-to-derived-collector.md`,
`docs/index.md`, `docs/milestones.md`, and
`docs/frozen-research-execution-plan.md` as minimal implementation-status and
handoff records. Preserve all unrelated working-tree changes.

# Out of scope

- A CLI, runner, fixture, package script/export-map change, filesystem-taking
  package-root export, or actual production activation
- Creating or ingesting a real adapter raw bundle, opening historical P2/M4
  results, or changing any historical result, receipt, tracked example, matrix,
  evidence map, Expected outside the two new v3 scenario files, or `Observed`
- Codegen adapter, probe-core, container/profile, runtime, compiled `dist`,
  package manifest, dependency, or later-backlog changes
- Running an adapter, probe, lifecycle fixture, production activation, Docker,
  a container/runtime socket operation, retained/result-state inspection,
  cleanup, retry, repair, publication, deployment, or Remote Git
- External network, credentials, host home/environment, arbitrary path,
  arbitrary command, or third-party communication

# Constraints

- Keep every v2 scenario/schema/collector output byte-compatible and additive;
  v3 accepts only the two fixed codegen `observe` scenario/profile contracts.
- Use descriptor-only canonical input snapshots and fresh non-shared byte
  copies. Reject Proxy, accessor, custom prototype, symbols, hidden/excess
  keys, cycles, shared/mutable aliases, noncanonical UTF-8 JSON/JSONL, invalid
  context/order/completion, and every unsupported filesystem state.
- Open each exact raw file once with no-follow semantics. Initial capture, R1
  post-render, and R2 precommit must use the same held descriptor; each proves
  exact byte count, EOF, SHA-256, full BigInt identity, logical-path identity,
  and ancestor identity independently.
- Fully render the exact sanitized two- or complete/mismatch five-file
  inventory before output creation. Create only private exclusive staging,
  write/sync/read-back/identity-check it, complete R2, preconstruct immutable
  success/failure results, and settle every descriptor close before commit.
- Make the final atomic rename from exact `derived.staging/` to previously
  absent `derived/` the sole commit and final fallible operation. After success,
  return only the preconstructed value; no callback, hook, accessor, check,
  close, cleanup, serialization, or classification may run.
- Preserve raw bytes/names/modes on every branch. Filesystem rejection publishes
  nothing and retains at most exact reached staging; safely captured content
  rejection alone may commit the sanitized two-file Inconclusive inventory.
  Never clean or retry the same run.
- Derived bytes must exclude raw canary/environment/file content, host paths,
  commands/arguments, container identities, stdout/stderr, unsanitized errors,
  private filesystem identities, and rejected-input digests.
- Treat this implementation and its tests as Docker-free static/unit evidence
  only. Do not promote adapter, profile, matrix, presentation,
  runtime-enforcement, or other `Observed` evidence.

# Deliverables

- Additive pure v3 codegen `observe` scenario/raw validation, deterministic
  reduction/rendering, and exact Expected comparison
- Internal, non-exported filesystem-taking disposable-root collector with the
  contracted identity/checkpoint/staging/sole-rename transaction
- The two exact codegen `observe` scenario definitions
- Focused positive, determinism, rejection, mutation/checkpoint, close/rename,
  staging, sanitization, import-safety, and static non-activation coverage
- Minimal status updates recording implementation evidence and naming only a
  fresh independent Docker-free read-only implementation review as next

# Verification

Run exactly the approved Docker-free implementation boundary:

```sh
npm run m3:typecheck
npm run m3:build
npm run m3:static
npm run m3:test
npm run m3:verify
npm run verify:static --workspace packages/probe-core
npm run check
git diff --check
```

Tests may use only in-memory values and repository-owned disposable test roots.
Do not run `npm run m3:run:fixture`, an adapter/probe/lifecycle scenario, the
production collector against a real result, Docker/container commands, or any
runtime/result-root operation.

# Completion report

- M3-PC01 through M3-PC06 implementation evidence
- Exact v3 schema/Expected boundary, initial/R1/R2 identity trace, transaction
  state machine, rejection/sanitization, and non-promotion evidence
- Changed files and commands actually run with observed results
- Commands intentionally not run, remaining cooperative-filesystem/static-unit
  limitations, and preserved unrelated changes
- One concrete `Next:` task for the fresh independent implementation review
