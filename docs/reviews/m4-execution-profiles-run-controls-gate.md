# M4 one-time run-controls execution gate independent review

## Review target and decision

- Target: the current uncommitted Issue #40 one-time `run-controls` gate
- Base HEAD: `3c54135d3f1e812035d8a506bfaf5fa1dd264c53`
- Recovered built-image digest record: **REPRODUCED from the canonical recovery
  review trail**
- Profile/digest/pair/run binding: **BLOCKED**
- Production control backend and temporary activation boundary: **BLOCKED**
- Existing-image/no-rebuild execution boundary: **BLOCKED**
- Exact one-time `npm run --silent m4:run:controls` gate: **BLOCKED; not
  executed**
- Blocking findings: B-18, B-19, B-20
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The gate candidate correctly states that a control result must not become
adapter/profile route Observed automatically and that a one-shot command must
be reviewed before execution. It does not, however, contain the executable
fixed input and activation boundary required to cross that gate. The ordinary
entry remains fail closed, the production control backend is not implemented,
and the existing pair executor would build a new image rather than consume the
recovered image digest. The review therefore does not approve temporary
activation or runtime execution.

This was a fresh independent Docker-non-executing review. Standing
authorization was not used because the reviewed action is not yet exact. No
separate human review is claimed.

## Reviewed snapshot identity

The hashes below identify the reviewed working-tree bytes before this review
record and its status metadata were added. They establish byte identity only;
they do not establish runtime enforcement or execution approval.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of repository-visible files under `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` (60 files) | `8e49d3f37f8c9e004d5b9835890a16c28b968adaac9c9aa59581a2b6d6ef8f78` |
| `containers/profile-control/image-input.json` | `27700a64c4bf4211f21ea5efa534601232f5fa7aea6ef70f306fbb5ba61da7e9` |
| `containers/profile-control/src/constants.ts` | `293cf24b588a17eab3eaf90088e0d421d7a741bd9abf2fddd9044cefb4c55019` |
| `containers/profile-control/src/image-input.ts` | `3d62d6842d7b0aafde8cc42a647c31235860411a9c77acaaae8e60b4de7fe16c` |
| `containers/profile-control/src/staging.ts` | `795fd1a75981439f3f70956bd383fa8cf85a3703634dc6eef58cfd698343c9e5` |
| `containers/profile-control/src/definitions.ts` | `e20c0bf8135d0db349a50525154181bc5c4b1cb2282b2f7933cabdb0c779d38e` |
| `containers/profile-control/src/docker-plan.ts` | `5bc051512ba9f0a60f709b4b633a2eb105ec2c1c166cfb73301706158ef314a1` |
| `containers/profile-control/src/execution.ts` | `c2d83d1a277db6dcadca6510f26e0ad3695619dc421b45503e98b50c72f41c13` |
| ordinary `containers/profile-control/src/orchestrator.ts` | `fefc2af9c7f69428383eba03d8bb49b0caa51a5332043e8741db39352fb1faf6` |
| ordinary `containers/profile-control/src/orchestrator-entry.ts` | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| `containers/profile-control/src/index.ts` | `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4` |
| `package.json` | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `cedf514b15c510847397db874226c599557beafb24960ffdc4ef6fa246952852` |
| `vitest.config.ts` | `b9c153897704dbabe350c9ae2b9dda4e033d0cae85d33a08ba54e24a18c8264c` |
| `prompts/m4-execution-profiles-run-controls-gate.md` | `eec65dec5b6d54553bd7f0c9cda9c140958d53bc3221e9b5c75cfa720dfa36d3` |
| `prompts/reviews/m4-execution-profiles-run-controls-gate-review.md` | `b0cbb977446eed96ef05d1d277be88c0a5db162b36be83098fdc913870e773c0` |
| `docs/reviews/m4-execution-profiles-offline-build-recovery-gate.md` | `0cfb5fe251bad0a0ecd9acc4c2a0f6bdbf552a28e15ae7b6a5fd45b1f6f2fcdf` |

The aggregate manifest was produced by sorting repository-relative file names,
hashing each file, and hashing that sorted manifest. The four accepted staging
files still have the reviewed sizes 347, 29, 9,159, and 152 bytes. This review
did not read or enumerate the retained run root or inspect the local image tag.

## Reproduced fixed history

The canonical recovery gate record and milestone trail agree on a complete
single recovery result with all three recovery steps, retained owned state, and
built-image digest
`sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`.
This is documentation evidence of the prior bounded recovery attempt; this
review did not reproduce the digest through Docker.

The repository contains neither `profiles/permissive/profile.json` nor
`profiles/constrained/profile.json`. The ordinary orchestrator source and entry
match their fail-closed hashes. No production source implements
`FixedExecutionBackend`; only the unit-test fake supplies its required
`transfer()` seam.

## Blocking findings

### B-18 — The reviewed digest is not bound to exact profiles or runs

The gate says it binds the recovered digest, fixed permissive/constrained run
IDs, and a fixed pair, but it states neither run ID and contains no canonical
profile bytes or hashes. The two profile JSON files required by the exact-input
sequence are absent. Consequently the review cannot reproduce a pair, run
roots, container names, or proof that both controls use the recovered digest.

Evidence: `prompts/m4-execution-profiles-run-controls-gate.md:29-46`,
`docs/m4-execution-profiles-exact-input.md:256-272`, and the absent
`profiles/permissive/profile.json` / `profiles/constrained/profile.json`.

Impact: a later worker would have to choose consequential run IDs and construct
the profile/digest binding while crossing the execution gate. The standing
authorization expressly does not supply those unresolved choices.

Required remediation: record and independently review exact canonical profile
bytes bound to the recovered digest, exact distinct run IDs and derived run
roots/container names, and pre-execution absence checks. Do not inspect or
change the retained build run root while defining this boundary.

### B-19 — No reviewed production control backend or activation bytes exist

The ordinary `runApprovedOrchestrator()` always raises
`M4_EXECUTION_NOT_APPROVED`, and the ordinary entry only reports that code. The
gate requests replacement of `orchestrator.ts` and `orchestrator-entry.ts` but
provides no replacement bytes, source hashes, compiled-output restoration hash,
or implementation that constructs a production `FixedExecutionBackend`.
`FixedOfflineBuildHostBackend` is build-only and has no control evidence
`transfer()` implementation.

Evidence: `orchestrator.ts:25-30`, `orchestrator-entry.ts:1-15`,
`execution.ts:76-92`, `offline-build-host-backend.ts:285-430`, and
`prompts/m4-execution-profiles-run-controls-gate.md:69-77,98-101`.

Impact: the exact package command currently compiles the ordinary fail-closed
entry and cannot reach the reviewed create/inspect/start/transfer/remove plan.
Inventing activation and host-filesystem/process/evidence-transfer behavior in
the execution worker would bypass independent static/unit review.

Required remediation: implement and behaviorally test a fixed production
control backend at a Docker-non-executing boundary, keep it unreachable from
the ordinary entry/package root, and later record exact activation and
restoration bytes/hashes in a new execution-gate candidate.

### B-20 — The proposed path rebuilds instead of consuming the recovered image

The gate simultaneously says it uses the recovered `builtImageDigest`, forbids
built-image reacquisition/rebinding, and fixes a step sequence containing
`stage-build-context`, `doctor`, `build`, and `inspect-image`. The only current
pair executor implements exactly that build-first sequence. Its image build plan
derives a new staged tag from the permissive run ID; it does not bind the
existing recovered staged tag as an immutable run-controls input.

Evidence: `prompts/m4-execution-profiles-run-controls-gate.md:3-7,35-46`,
`execution.ts:499-540`, and `docker-plan.ts:176-231`.

Impact: approving this candidate would authorize an additional offline build
inside the runtime-control attempt, contrary to the recorded build-once,
recovery, and no-rebind boundaries. It also broadens the side effects beyond
the candidate's create/inspect/start/remove list.

Required remediation: separate an existing-image profile-pair executor from
the build-only executor. The control path must accept only the reviewed
recovered digest/tag binding and must not stage/build/reinspect the build input
as a substitute for that binding. Any necessary local container-image identity
check must be fixed, bounded, and explicitly included in the later reviewed
command plan.

## Verification observed

| Command | Observed result |
|---|---|
| Independent sorted manifest, critical `sha256sum`, profile-file absence, source/backend reachability inspection, and staging `wc -c` | Exit 0; reproduced the identities and missing boundaries above. |
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 19 test files, 216 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 19 files / 216 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 101 test files / 704 tests passed. |
| `git diff --check` | The first invocation found one pre-existing trailing space on the M4 status line being updated by this review; it was removed, and the final invocation exited 0. |
| `git status --short` | Confirmed the existing uncommitted presentation/M4 working tree was preserved and only this review's documentation/status paths were added to the task changes. |

The review did not run `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:recovery:offline-build`, `npm run m4:run:controls`, or
`npm run m4:verify:evidence`. It did not apply temporary activation, access
Docker or a runtime socket, inspect/pull/build an image, create/start/run/remove
a container, access external network or credentials, inspect host-home data,
read or mutate retained production state, use remote Git, commit, publish, or
communicate externally.

## Gate conclusion and required handoff

Issue #40 remains blocked. The current gate candidate is not an exact reviewed
action, so standing authorization cannot be used to execute it. Before a
Docker-non-executing remediation task can be made exact, the project human must
record the two distinct fixed run IDs. The remediation then needs to close
B-18 through B-20 with canonical profile binding, an existing-image executor,
a production control backend, focused lifecycle/filesystem/transfer tests, and
exact activation/restoration bytes. A fresh independent read-only review is
required after that remediation and before any Docker or `run:controls`
execution.

Profile-control Observed and experiment-matrix route Observed remain unchanged.
