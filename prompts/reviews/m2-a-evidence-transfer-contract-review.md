# Goal

Perform a fresh independent Docker-free read-only review of frozen-research
issue #43's proposed `20260721-01` M0/M2-A evidence-transfer contract. Decide
M2A-TR01 through M2A-TR06 and whether exactly one bounded Docker-free
static/unit implementation may proceed. Do not implement or execute the
transfer.

# Read first

- root `AGENTS.md`
- `packages/AGENTS.md`
- `experiments/AGENTS.md`
- `containers/AGENTS.md`
- `docs/index.md`
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
- current tracked M0 experiment and M2-A/probe-core source under
  `experiments/npm12-install/**`, `packages/npm-lifecycle-probe/**`, and
  `packages/probe-core/**`
- this prompt

# Scope

- Review the complete working-tree diff while preserving all existing M3, M4,
  presentation, and user changes.
- Reproduce the 31-file input set, its ordered aggregate SHA-256, the fixed
  M2-A route/attempt/producer contract, and the preserved M0 Node/npm/local-
  tarball/approval facts without reading historical result roots.
- Trace the proposed unapproved-install, official-approval, approved-rebuild,
  canary, loopback, session-close, and terminal-publication order. Confirm that
  setup input validity, capability outcomes, transfer validity, and Expected
  comparison remain separate.
- Review the exact fresh run/result/container/volume/image identities and
  verify all earlier generations and caller-selected substitutes remain
  rejected and immutable.
- Review the named-volume initializer, root-only `01777` setup boundary,
  non-root measurement container, nested tmpfs/volume layout, fixed Docker CLI
  environment/argv, offline/no-bind/no-socket isolation, resource limits,
  detached lifecycle, natural-exit predicate, unknown-settlement suppression,
  first-failure rule, no retry, and retain-without-cleanup policy.
- Review `m2a-transfer-completion/v1` publication, exact inventory, private
  canary exclusion, fixed post-exit `docker cp` branches, source/copy metadata
  and byte checks, canonical seven-event validation, and conditional direct-
  marker consistency.
- Confirm stdout/log/archive/bind/tmpfs fallbacks are forbidden and that a
  copy failure remains Inconclusive rather than reinterpreting the M0 stdout
  bundle.
- Confirm a candidate attempt cannot become accepted runtime, matrix/profile,
  M3, presentation, or other `Observed` evidence before a separately reviewed
  one-shot gate and fresh independent result review.
- Decide whether the M2A-TR06 path and negative-test allowlist is both complete
  and no broader than one later Docker-free static/unit implementation.

# Out of scope

- Repairing the contract or changing implementation, tests, package scripts,
  manifests, fixtures, container sources, compiled output, staging, results,
  examples, matrix Expected/Observed, or presentation evidence
- Building or staging the image, adding an execution entry, approving or
  executing Docker, running an npm lifecycle command, probe, fixture, transfer,
  collector, verification fixture, or deploy simulation
- Accessing a Docker/runtime socket, ignored or historical result root,
  retained container/volume/image state, credential, host home/environment,
  external network, Remote Git, publication, deployment, or third party
- Choosing a different generation, image, command, profile, transfer method,
  cleanup, retry, recovery, or evidence-promotion strategy

# Constraints

- Review read-only. Record findings; do not repair them in this session.
- Do not invoke Docker or any wrapper that can reach Docker. Do not execute
  `m0:*`, a lifecycle fixture, an adapter runner, or a filesystem-emitting
  compiler/build.
- Do not enumerate ignored results, experiment work state, container staging,
  credentials, runtime state, or adjacent filesystem paths.
- Use only repository-controlled inputs and bounded no-write assertions.
- Treat contract intent, current static/unit facts, historical M0 Observed
  facts, and unobserved named-volume/runtime behavior as distinct evidence
  classes.
- If blocked, define one bounded contract-only remediation. Do not broaden the
  allowlist or select an alternative transfer in the review.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-contract.md` with `APPROVED` or
  `BLOCKED`, M2A-TR01 through M2A-TR06 decisions, independently reproduced
  identity/input/settlement/transfer/evidence analysis, blocking and
  non-blocking findings, exact next boundary, and remaining limitations
- minimal status updates in `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`
- if approved, at most one later Docker-free static/unit implementation under
  the exact reviewed allowlist; if blocked, one contract-only remediation

# Verification

Use only read-only path/hash/source assertions, bounded no-write in-memory
schema/state-machine assertions when necessary, a focused formatter check over
review/status files, and `git diff --check`. Do not run Docker, build, npm
install/pack/approve/rebuild, a lifecycle fixture, a probe, staging, result
validation, or broad verification merely to repeat prior reports.

# Completion report

- Decision and M2A-TR01 through M2A-TR06 status
- Independently reproduced identities, adapter/M0 input, settlement, transfer,
  sanitization, and evidence-class boundaries
- Exact approved implementation or blocked contract-remediation boundary
- Changed files and commands actually run
- Commands intentionally not run and remaining limitations
- One concrete `Next:` task
