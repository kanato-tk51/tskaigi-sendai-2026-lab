# Goal

Freshly and independently perform a Docker-free read-only result review of the
exact selected Vite `20260720-02` one-shot outcome. Accept or reject only its
canonical Inconclusive classification and any corresponding tracked
presentation projection. Do not rerun, repair, or call Docker.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/presentation-evidence-inventory.md`
- `docs/p2-selected-profile-contract.md`
- `docs/p2-vite-completion.md`
- `docs/p2-vite-detached-transfer-contract.md`
- `docs/reviews/p2-vite-detached-transfer-contract.md`
- `docs/reviews/p2-vite-detached-transfer-execution-gate.md`
- `docs/reviews/p2-selected-profile-vite-failure.md`
- `docs/reviews/p2-selected-profile-vite-observed.md`
- `docs/reviews/p2-vite-diagnostic-result.md`
- `docs/reviews/p2-vite-new-measurement-result.md`
- `docs/milestones.md` selected Vite addenda
- `docs/codex-workflow.md`
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- `prompts/p2-vite-detached-transfer-contract.md`
- `prompts/p2-vite-detached-transfer-contract-remediation.md`
- `prompts/p2-vite-detached-transfer-contract-residual-remediation.md`
- all detached-transfer contract and execution-gate review prompts under
  `prompts/reviews/`
- this prompt

# Scope

The candidate is fixed by all 19 tracked/compiled SHA-256 identities in the
P2-DTG01/P2-DTG02 remediation re-review appended to
`docs/reviews/p2-vite-detached-transfer-execution-gate.md`. Reproduce those
exact identities, not newer or inferred bytes. Also reproduce:

- the exact 128-file, source-equal, regular non-symlink staging closure with
  fixed root `containers/presentation-profiles/staging/vite`, only fixed
  `0444`/`0555` modes, and plan-order manifest SHA-256
  `17c0543f5a00c3952c632b5c07ccaffabb00dd8c7c0e46ece1eb798da1f92b9f`;
- Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`;
- the exact argument-free package script
  `npm run p2:build && node containers/presentation-profiles/runner/vite-executor-entry.js`;
  and
- the fixed Expected revision `p2-vite-expected-20260720-02` and the exact
  permissive/constrained run, root, profile, and container bindings in the
  detached-transfer contract.

The one approved invocation exited 1 and was not retried. The repository
records this exact bounded direct stdout line as the unreviewed handoff:

```json
{"status":"inconclusive","pair":{"schemaVersion":"p2-vite-pair/v4","expectedRevision":"p2-vite-expected-20260720-02","validity":"inconclusive","imageId":null,"progressTrust":"repository-cooperative-fixture","issues":["PAIR_IDENTITY_MISMATCH"]},"scenarios":[{"scenarioId":"vite-observe-p","profileId":"permissive","completion":"inconclusive","attemptRecord":"written","evidence":"not-inspected","receipt":"not-written","validity":"not-inspected","issues":["P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED","P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN","P2_ATTEMPT_TRANSFER_FAILED","P2_ATTEMPT_OUTPUT_NOT_INSPECTED"]}]}
```

With its one trailing LF, that line is exactly 598 bytes with SHA-256
`fbe36d752dca6423a8d9379fa00d99aef220e7347426a2fa72dd74fb04167063`.

Bind the review to only these two active result roots, without enumerating their
parent or any historical result root:

- permissive:
  `results/runs/p2-selected-profiles/p2-vite-observe-p-20260720-02`
- constrained:
  `results/runs/p2-selected-profiles/p2-vite-observe-c-20260720-02`

Within the exact permissive root, inspect only the root's bounded name/mode
inventory and the contract-fixed control paths `attempt.json`, `summary.json`,
`progress/runner-progress.json`, and `progress/runner-progress.next`. Do not
follow a symlink. Do not open any regular event, direct-write, or tool-output
file or subtree: the direct entry reports evidence `not-inspected` and no
receipt, so those bytes are outside this result review.

Independently determine the exact fixed-path state rather than assuming that a
root, attempt, progress record, summary, or constrained member exists. If a
canonical `p2-vite-attempt/v4` record exists, validate its regular-file mode,
size, SHA-256, exact one-line bytes/key order, fixed identity, lifecycle,
settlement, cleanup, runner/progress, trust, output, and ordered issue fields.
If a v2 progress record exists, validate its fixed identity, mode, canonical
bounds, ordered prefix/terminal consistency, and agreement with the attempt;
never infer an unrecorded transition or lower-level cause.

Reconstruct the exact bounded pair/entry projection through only the approved
pure projectors and compare it byte-for-byte with the stdout handoff above.
Confirm that one permissive Inconclusive attempt cannot establish a receipt,
capability result, constrained outcome, same-image pair, selected-profile
Observed result, or experiment-matrix Observed result.

Decide `ACCEPTED` or `BLOCKED` for only the canonical result classification. If
accepted, add the smallest deterministic tracked presentation projection needed
to retain this fifth immutable Inconclusive attempt, without changing selected
Vite or experiment-matrix Observed and without increasing the three-talk-table
limit. If blocked, record one smallest Docker-free record/projection follow-up;
never authorize a retry or result repair.

# Out of scope

- Docker or container commands, direct runtime-socket access, image operations,
  probe/lifecycle execution, or any execution/retry command
- Result repair, permission change, staging rebuild/mutation, move, deletion,
  cleanup, or receipt manufacture
- Parent or historical result enumeration, historical container access, and
  any regular event/direct-write/tool-output file or subtree
- Changing Expected outcomes, selected Vite or experiment-matrix Observed, or
  accepted codegen/P3/P4/M4 evidence
- External network, credentials, Remote Git, publication, deployment, or
  third-party communication

# Constraints

- Use fixed-path, no-follow, bounded Docker-free reads only. Stop and record a
  finding if a required path is a symlink, has an unsafe type/mode, or cannot be
  reviewed without broadening the path boundary.
- Keep the direct stdout handoff, canonical filesystem record, configuration
  intent, static/unit evidence, and runtime observation as separate evidence
  classes.
- Do not treat force removal as natural exit, a valid progress prefix as child
  or runner settlement, or the cooperative-fixture trust marker as adversarial
  writer isolation.
- Preserve all four earlier selected-Vite Inconclusive attempts as immutable
  history. Do not access their ignored roots.
- Review findings without repairing them. Standing authorization is not needed
  for this non-executing review.

# Deliverables

- `docs/reviews/p2-vite-detached-transfer-result.md` with the decision, exact
  fixed-path/canonical identities, reconstructed stdout projection, evidence
  classification, unresolved runtime facts, and safety boundary
- If accepted, only the minimal deterministic tracked presentation
  projection/generator/evidence-map update needed for the fifth Inconclusive
  generation
- Minimal authoritative status and handoff updates

# Verification

Use only Docker-free ordinary-development and fixed-path checks. At minimum:

- reproduce the 19 approved tracked/compiled hashes, exact package script,
  fixed staging identity/modes/versions/manifest, and side-effect-free compiled
  imports without rebuilding staging;
- assert the exact two active roots and allowed control paths without parent or
  historical enumeration, and reproduce any accepted canonical record's bytes,
  mode, size, and SHA-256;
- run `npm run p2:build` and use only the approved pure projectors to reconstruct
  the exact bounded stdout line;
- run the relevant P2 and P4 verification commands only if needed by changed
  tracked presentation bytes;
- run focused formatting for changed Markdown/data files, `git diff --check`,
  and `git status --short`.

Record exact exits and test counts. Do not inspect ignored paths except the
exact fixed staging root, the two exact active roots, and the fixed control
paths allowed above.

# Completion report

- Decision and findings
- Exact root/control-record/mode/size/hash/progress evidence
- Reconstructed bounded stdout projection and evidence classification
- Changed files and commands run with observed exits/test counts
- Commands intentionally not run and remaining cooperative-fixture/runtime
  limitations
- One concrete `Next:` item
