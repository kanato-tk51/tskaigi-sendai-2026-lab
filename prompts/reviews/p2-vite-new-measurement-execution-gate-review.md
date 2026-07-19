# Goal

Freshly and independently review the Docker-free selected Vite `20260720-01`
implementation candidate. Approve or block only one later exact one-shot
execution gate. Do not fix findings and do not call Docker in this review.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/presentation-evidence-inventory.md`
- `docs/p2-selected-profile-contract.md`
- `docs/p2-vite-completion.md`
- `docs/p2-vite-new-measurement-diagnosis.md`
- `docs/reviews/p2-vite-new-measurement-diagnosis.md`
- all historical review records cited by those documents
- `docs/milestones.md` selected Vite addendum
- `docs/codex-workflow.md`
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- `prompts/p2-vite-new-measurement-diagnosis.md`
- `prompts/reviews/p2-vite-new-measurement-diagnosis-review.md`
- this prompt

# Review scope

- Independently verify closure of P2-V12: force-settled post-close residue is a
  known failure and unknown child settlement reaches no server/evidence cleanup.
- Independently trace the exact seven-stage `p2-vite-progress/v1` emission and
  incremental parsing boundary, including arbitrary chunking, line/count/byte
  limits, canonical identities, valid-prefix-only retention, terminal framing,
  settlement consistency, and raw-field exclusion.
- Confirm malformed, duplicate, reordered, identity-mismatched, oversized, and
  post-terminal progress fails closed; attached-start command failure remains
  primary; and progress cannot establish settlement, authorize cleanup/evidence
  access, create a receipt, or manufacture pair completion.
- Confirm `p2-vite-attempt/execution/pair` v3, permissive-first stop, and
  same-image acceptance require the reviewed complete pair.
- Confirm exact Expected `p2-vite-expected-20260720-01`, run/root
  `p2-vite-observe-p/c-20260720-01`, and container
  `tskaigi-p2-vite-observe-p/c-20260720-01` cross-binding, plus rejection of
  `20260719-01`, `-02`, `-03`, and `-11` Vite tuples.
- Independently reproduce candidate hashes, the exact 128-file source-equal
  fixed-mode staging tree, the documented
  `plan-order-json[path,mode,sha256]/v1` manifest, fixed tool versions, focused
  and full Docker-free checks, and protected codegen/P3/P4/M4 non-change.
- Check absence of only these two exact paths, without parent enumeration:

  - `results/runs/p2-selected-profiles/p2-vite-observe-p-20260720-01`
  - `results/runs/p2-selected-profiles/p2-vite-observe-c-20260720-01`

- Decide `APPROVED` or `BLOCKED` for exactly one later argument-free
  `npm run p2:execute:vite` invocation. Approval permits no retry on any outcome
  and no other Docker action.

# Prohibited

- Candidate fixes or implementation changes
- Docker/container commands, direct runtime-socket access, image operations, or
  `npm run p2:execute:vite`
- Parent/result directory enumeration, historical root/container access,
  retained-state mutation, or new-root creation
- Expected outcome changes, Observed promotion, experiment-matrix changes,
  codegen rerun/evidence mutation, or P3/P4/M4 mutation
- External network, credentials, Remote Git, publication, or deployment

# Deliverables

- `docs/reviews/p2-vite-new-measurement-execution-gate.md` with decision,
  findings, independently reproduced candidate identities, staging identity,
  exact new-root absence evidence, and the reviewed one-shot boundary
- Minimal authoritative status/handoff updates only
- If approved, one fresh execution worker as the next task; if blocked, one
  bounded Docker-free remediation task

# Verification

Run the smallest independent Docker-free checks needed to reproduce every gate
claim. At minimum include focused Vite context/plan/runner/projection/executor/
staging tests, `npm run m2d:verify`, `npm run p2:verify`, `npm run p2:build`,
compiled import safety, exact candidate hashes, exact staging byte/mode/manifest
verification, protected-path non-change, `git diff --check`, and
`git status --short`. Record observed exit status and test counts.

Do not run Docker or the production execution command. Do not check any result
path except the two exact new paths above.

# Completion report

- Gate decision and findings
- Candidate/hash/staging/root-absence evidence
- Exact approved or blocked boundary and remaining limitations
- Changed files and commands run
- Commands intentionally not run
- One concrete `Next:` task
