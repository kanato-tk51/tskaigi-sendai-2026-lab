# Goal

Remediate only the two findings from frozen-research issue #47's fresh
Docker-free implementation review: preserve the exact codegen `observe`
12-event cross-kind producer order in Expected comparison, and make every
successfully opened raw-directory, raw-file, and staged-file descriptor enter
close settlement before its first later fallible operation. Keep the approved
v3/v2, R1/R2, private-staging, sole-rename, sanitization, and evidence
non-promotion boundaries unchanged.

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
- `prompts/m3-production-raw-to-derived-collector-implementation.md`
- `prompts/reviews/m3-production-raw-to-derived-collector-implementation-review.md`
- `docs/reviews/m3-production-raw-to-derived-collector-implementation.md`
- this prompt

# Scope

Implementation and verification changes are limited to the unchanged M3-PC06
allowlist, and should normally touch only:

- `packages/lab-cli/src/codegen-production.ts`
- `packages/lab-cli/test/codegen-production.test.ts`
- `packages/lab-cli/scripts/verify-static.mjs`

Update only `docs/m3-production-raw-to-derived-collector.md`, `docs/index.md`,
`docs/milestones.md`, and `docs/frozen-research-execution-plan.md` as minimal
remediation-status and handoff records. Preserve all unrelated working-tree
changes.

# Out of scope

- Schema/scenario-byte changes, new Expected outcomes, package-root filesystem
  exports, CLI/runner/fixture/package script/export-map changes, or activation
- Adapter/probe/container/profile source, compiled output, dependencies,
  historical/raw/result roots, matrix/evidence-map/presentation records, or any
  `Observed` value
- Adapter/probe/lifecycle execution, production collection, Docker/runtime
  socket access, retained-state inspection, cleanup, retry, publication,
  deployment, Remote Git, external network, credentials, or host state

# Constraints

- Freeze the exact local 12-entry identity order across event kinds: three
  opening routes, six capability attempts, one skipped tool change, then the
  file-write and completion routes. Preserve producer sequence and retain an
  otherwise complete cross-kind permutation as an explicit deterministic
  Expected mismatch.
- Keep the existing identity-bearing per-kind records, hash comparison, v3
  scenario definitions, and every v2 byte/behavior unchanged.
- Immediately register each successfully opened descriptor in an owned
  close-settlement record before descriptor `stat()` or any other later
  fallible callback/check. A failure at that boundary must still attempt and
  await close settlement, suppress rename, preserve raw, and publish no
  `derived/`.
- Add focused behavioral and static checks for the cross-kind permutation and
  for the open-to-first-stat ownership order in all three helper families.
  Preserve every existing R1/R2, staging/read-back, close, rename, rejection,
  determinism, package-root, and non-promotion check.
- Final rename remains the sole publication commit and last fallible
  operation. No postcommit operation or evidence promotion may be added.

# Deliverables

- Exact cross-kind event-order comparison and one focused reordered-segment
  mismatch test
- Immediate descriptor ownership/settlement before first post-open fallible
  work, with focused fault-injection and static source-order coverage
- Exact Docker-free verification results and minimal status records naming
  only a fresh independent remediation re-review as next

# Verification

Run the approved Docker-free boundary:

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
collector against a real result, Docker/container commands, or any retained,
historical, or production result-root operation.

# Completion report

- Closure evidence for M3-PC01, M3-PC03, M3-PC04, and M3-PC06, with
  M3-PC02/M3-PC05 preservation evidence
- Exact event-order and descriptor-settlement trace
- Changed files and commands actually run with observed results
- Unrun commands, remaining static/unit and cooperative-filesystem limitations,
  and preserved unrelated changes
- One concrete `Next:` task for the fresh independent Docker-free remediation
  re-review
