# Goal

M4 Issue #40 B-18/B-19/B-20 remediationをfresh independent read-onlyでレビューし、
fixed profile/digest/run binding、existing-image/no-rebuild executor、production control
backend、exact temporary activation/restorationがone-time `run:controls` execution gateへ
進めるstatic/unit candidateとして十分か判断する。

# Read first

- root `AGENTS.md`、`containers/AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/m4-restart-issue-board.md`
- `docs/reviews/m4-execution-profiles-run-controls-gate.md`
- `docs/reviews/m4-execution-profiles-offline-build-recovery-gate.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`、`docs/architecture.md`、`docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-run-controls-gate.md`
- `prompts/m4-execution-profiles-run-controls-remediation.md`

# Review scope

- independently hash canonical permissive/constrained profile bytes and reproduce strict
  parsing against the fixed recovered digest
- reproduce exact run roots/container names and pre-execution pair-absence gate
- trace production runner only to `executeFixedExistingImageProfilePair`; reject any path to
  staging, doctor, build, image inspect, retained tag, or retained build root
- review fixed command object identity/order, `/usr/bin/docker`, `shell: false`, empty
  `DOCKER_CONFIG`, no inherited env, process settlement/output limits, exact owned filesystem
  lifecycle, transfer inventory and canonical sanitized records
- confirm ordinary entry and package root do not import/construct/export the production runner
  or backend and remain `M4_EXECUTION_NOT_APPROVED`
- independently extract/hash the exact activation code block and record ordinary restoration
  source/compiled-output hashes
- inspect focused negative tests and static verifier coverage

# Decision rules

- APPROVED only if B-18/B-19/B-20 are closed without unresolved digest/run/profile/command/
  activation choices and the execution gate can name one exact action.
- BLOCKED if arbitrary input is reachable, either run root can be reused, the old build-first
  executor is reachable from production controls, raw payload is retained, cleanup broadens,
  process settlement is unsafe, or activation/restoration bytes are not exact.
- Static/unit success does not approve Docker execution, runtime enforcement, profile-control
  Observed, or experiment-matrix route Observed.

# Out of scope

- source remediation in the review session except minimal review/status records
- temporary activation, Docker/runtime/socket access, any M4 execution command, retained
  state/tag inspection or mutation, retry/rebind, external network/credential/host-home access,
  remote Git, publication, deployment, or external communication

# Deliverables

- `docs/reviews/m4-execution-profiles-run-controls-remediation.md` with APPROVED/BLOCKED,
  independent hashes, findings, command evidence, and exact next handoff
- minimal `docs/milestones.md` / issue-board status update
- if approved, an updated one-time execution-gate candidate that contains exact reviewed
  source/activation/restoration identities; do not execute it in this review

# Verification

```sh
npm run m4:typecheck
npm run m4:static
npm run m4:test
npm run m4:verify
npm run check
git diff --check
git status --short
```

Do not run `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:recovery:offline-build`, `npm run m4:run:controls`,
`npm run m4:verify:evidence`, or any Docker/container command. Do not apply temporary
activation.

# Completion report

- Decision and any blocking/non-blocking findings
- Reproduced fixed bindings, source/profile/activation/restoration hashes
- Commands run and observed counts
- Docker/runtime/activation/retained-state actions not run
- Remaining runtime/Observed limitations and one concrete next task
