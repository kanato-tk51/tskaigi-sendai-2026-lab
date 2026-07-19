# Goal

Freshly and independently review the exact Docker-non-executing P2 Vite
diagnostic remediation and fixed `-03` candidate. Approve or block a later exact
one-shot pair execution. Do not fix findings and do not call Docker.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/p2-vite-completion.md`
- `docs/p2-selected-profile-contract.md`
- `docs/reviews/p2-selected-profile-vite-runner.md`
- `docs/reviews/p2-selected-profile-vite-executor.md`
- `docs/reviews/p2-selected-profile-vite-failure.md`
- `docs/milestones.md` Presentation MVP / P2 sections
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- `prompts/p2-vite-diagnostic-remediation.md`
- this prompt

# Review scope

- Independently reproduce candidate hashes, focused tests, compiled import
  safety, exact staging identity/modes/tool versions, and codegen non-change.
- Confirm the new attempt schema uses closed stage/failure enums and cannot
  serialize raw output, errors, paths, or runtime-selected values.
- Confirm known-settlement attached-start failure performs at most the single
  fixed final inspect, preserves the original failure, remains Inconclusive,
  and cleans up only under the existing settlement rules; unknown settlement
  must suppress inspect and cleanup.
- Confirm the fixed 60-second outer start boundary exceeds the unchanged inner
  controlled failure path and is behaviorally tested.
- Confirm Expected revision, Expected values, image reference/required image ID,
  run IDs, container names, context, runner, projection, plan, executor,
  attempt, receipt, and pair identities are exact and cross-bound.
- Confirm both exact `-03` result roots are absent without enumerating parent or
  historical roots, and that both prior Inconclusive records remain unchanged.
- Confirm no codegen, P3/P4, experiment-matrix Observed, or M4 state changed.

# Decision and gate boundary

Record `APPROVED` or `BLOCKED` with findings in a new review document. Do not
modify implementation during the review.

Only an `APPROVED` decision may authorize a later fresh worker, using standing
authorization, to run exactly once:

```sh
npm run p2:execute:vite
```

That is one ordered permissive/constrained pair. It is never retried, authorizes
no other Docker command, and does not itself promote results to Observed. The
review must record exact approved hashes, staging identity, Expected revision,
image identity, two absent roots, and the no-retry boundary.

# Prohibited

- Docker/container commands, runtime socket access, or execution
- Historical result/container access or mutation
- Candidate fixes, alternate IDs/images/Expected, image pull, external network,
  credentials, retained M4 work, Remote Git, publication, or deploy
- Treating static/unit evidence as runtime evidence

# Verification

Run the focused Docker-free tests and:

```sh
npm run m2d:verify
npm run p2:verify
npm run p2:build
npm run check
git diff --check
git status --short
```

# Completion report

- Decision and findings
- Reviewed hashes, staging/identity/absence evidence, and checks
- Offline/no-Docker boundary
- Historical Inconclusive and evidence-class preservation
- Changed files (review record and minimal status metadata only)
- `Next:` exact one-shot execution if approved, otherwise one bounded
  remediation
