# Documentation index

Read only the documents relevant to the current task.

| Task | Required documents |
|---|---|
| B-path completion continuation status | `p2-option-b-completion-status.md` |
| B-path local issue backlog | GitHub issues: [ISSUE-101](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/26), [ISSUE-102](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/27), [ISSUE-103](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/28) |
| Presentation MVP scope, evidence inventory, selected profile runs, or talk data | `presentation-scope.md`, `presentation-evidence-inventory.md` and `reviews/presentation-evidence-inventory.md` when present, `p2-selected-profile-contract.md`, `p2-vite-completion.md` for the active Vite completion addendum, `p2-vite-new-measurement-diagnosis.md`, `reviews/p2-vite-new-measurement-diagnosis.md`, `reviews/p2-vite-new-measurement-execution-gate.md`, and `reviews/p2-vite-new-measurement-result.md` when present for the active `20260720-01` generation, `reviews/p2-selected-profile-executor.md`, `reviews/p2-selected-profile-codegen-receipts.md`, `reviews/p2-selected-profile-vite-runner.md`, `reviews/p2-selected-profile-vite-executor.md`, `reviews/p2-selected-profile-vite-failure.md`, `reviews/p2-selected-profile-vite-new-run-gate.md`, `reviews/p2-vite-diagnostic-remediation.md`, `reviews/p2-selected-profile-vite-observed.md`, and `reviews/p2-vite-diagnostic-result.md` (historical) when present, `product-requirements.md`, `milestones.md`, `codex-workflow.md`; for the active `20260720-01` Vite measurement generation also read `../prompts/p2-vite-new-measurement-diagnosis.md`, `../prompts/reviews/p2-vite-new-measurement-diagnosis-review.md`, `../prompts/reviews/p2-vite-new-measurement-execution-gate-review.md`, and `../prompts/reviews/p2-vite-new-measurement-result-review.md` when present; add `experiment-matrix.md` for route/profile selection, `artifact-pipeline.md` for the artifact demo, and `threat-model.md` for runtime execution |
| Product scope | `product-requirements.md` |
| Probe implementation | `threat-model.md`, `experiment-protocol.md` |
| Package or data-flow changes | `architecture.md` |
| Event contract or dependency direction | `experiment-protocol.md`, `architecture.md` |
| Experiment changes | `experiment-protocol.md`, `experiment-matrix.md` |
| Starting a milestone | `milestones.md` and related documents |
| P3 minimal artifact demo implementation, review, execution, or result review | `presentation-scope.md`, `presentation-evidence-inventory.md`, `product-requirements.md`, `milestones.md`, `codex-workflow.md`, `artifact-pipeline.md`, `threat-model.md`, `architecture.md`, `p3-artifact-demo.md`, `../prompts/p3-artifact-demo.md`, and `../prompts/reviews/p3-artifact-demo-review.md`; add `reviews/p3-artifact-demo.md` when present; for post-execution result review also read `../prompts/reviews/p3-artifact-demo-result-review.md` and `reviews/p3-artifact-demo-result.md` when present |
| M1 closure or independent review decision | `milestones.md`, `reviews/m1-independent-review.md` |
| M2-A npm lifecycle adapter implementation or review | `milestones.md`, `m2-a-npm-lifecycle-adapter.md`, `spike-npm12.md`, `experiment-protocol.md`, `architecture.md`, `experiment-matrix.md`, `threat-model.md` |
| M2-B ESLint adapter implementation or review | `milestones.md`, `m2-b-eslint-adapter.md`, `reviews/m2-b-eslint-adapter.md`, `experiment-protocol.md`, `architecture.md`, `experiment-matrix.md` |
| M2-C Vitest setupFiles adapter implementation or review | `milestones.md`, `m2-c-vitest-setup-adapter.md`, `reviews/m2-c-vitest-setup-adapter.md`, `reviews/m1-independent-review.md`, `experiment-protocol.md`, `architecture.md`, `experiment-matrix.md` |
| M2-D Vite plugin adapter Expected contract, implementation, or independent read-only review | `milestones.md`, `m2-d-vite-plugin-adapter.md`, `reviews/m2-d-vite-contract-docs.md`, `reviews/m2-d-vite-plugin-adapter.md`, `reviews/m1-independent-review.md`, `experiment-protocol.md`, `architecture.md`, `experiment-matrix.md` |
| M2-E explicit code-generation CLI adapter implementation or review | `milestones.md`, `m2-e-codegen-adapter.md`, `reviews/m2-e-codegen-adapter.md`, `reviews/m1-independent-review.md`, `experiment-protocol.md`, `architecture.md`, `experiment-matrix.md` |
| M3 harness, collector, reducer, or report implementation/review | `milestones.md`, `codex-workflow.md`, `experiment-protocol.md`, `architecture.md`, `experiment-matrix.md` |
| M4 execution-profile contract, implementation, remediation, doctor boundary, exact input, run-controls remediation, or review | `milestones.md`, `codex-workflow.md`, `m4-execution-profiles.md`, `m4-execution-profiles-exact-input.md`, `m4-restart-issue-board.md`, `reviews/m4-execution-profiles-contract.md`, `reviews/m4-execution-profiles.md`, `reviews/m4-execution-profiles-remediation.md`, `reviews/m4-execution-profiles-input-binding-remediation.md`, `reviews/m4-execution-profiles-doctor-boundary.md`, `reviews/m4-execution-profiles-doctor-boundary-remediation.md`, `reviews/m4-execution-profiles-doctor-canonical-bytes-remediation.md`, `reviews/m4-execution-profiles-runtime-template-compatibility.md`, `reviews/m4-execution-profiles-exact-input-backend-remediation.md`, `reviews/m4-execution-profiles-run-controls-gate.md`, `reviews/m4-execution-profiles-run-controls-remediation.md`, `../prompts/m4-execution-profiles-remediation.md`, `../prompts/reviews/m4-execution-profiles-remediation-review.md`, `../prompts/m4-execution-profiles-input-binding-remediation.md`, `../prompts/reviews/m4-execution-profiles-input-binding-remediation-review.md`, `../prompts/m4-execution-profiles-exact-input-contract.md`, `../prompts/reviews/m4-execution-profiles-exact-input-contract-review.md`, `../prompts/m4-execution-profiles-doctor-boundary.md`, `../prompts/reviews/m4-execution-profiles-doctor-boundary-review.md`, `../prompts/m4-execution-profiles-doctor-boundary-remediation.md`, `../prompts/reviews/m4-execution-profiles-doctor-boundary-remediation-review.md`, `../prompts/m4-execution-profiles-doctor-canonical-bytes-remediation.md`, `../prompts/reviews/m4-execution-profiles-doctor-canonical-bytes-remediation-review.md`, `../prompts/m4-execution-profiles-run-controls-remediation.md`, `../prompts/reviews/m4-execution-profiles-run-controls-remediation-review.md`, `decisions/0001-separate-profile-controls-from-route-evidence.md`, `threat-model.md`, `architecture.md`, `experiment-matrix.md` |
| M4 exact-input backend remediation or re-review | `milestones.md`, `codex-workflow.md`, `m4-execution-profiles.md`, `m4-execution-profiles-exact-input.md`, `reviews/m4-execution-profiles-exact-input-contract.md`, `reviews/m4-execution-profiles-exact-input-backend-remediation.md`, `reviews/m4-execution-profiles-runtime-template-compatibility.md`, `reviews/m4-execution-profiles-input-binding-remediation.md`, `../prompts/m4-execution-profiles-exact-input-contract.md`, `../prompts/reviews/m4-execution-profiles-exact-input-contract-review.md`, `../prompts/m4-execution-profiles-exact-input-backend-remediation.md`, `../prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md`, `decisions/0001-separate-profile-controls-from-route-evidence.md`, `threat-model.md`, `architecture.md`, `experiment-matrix.md` |
| M4 production offline-build backend implementation, review, result/process remediation, or execution-gate definition | `milestones.md`, `codex-workflow.md`, `m4-execution-profiles.md`, `m4-execution-profiles-exact-input.md`, `reviews/m4-execution-profiles-exact-input-contract.md`, `reviews/m4-execution-profiles-exact-input-backend-remediation.md`, `reviews/m4-execution-profiles-offline-build-backend.md`, `reviews/m4-execution-profiles-offline-build-result-remediation.md`, `reviews/m4-execution-profiles-runtime-template-compatibility.md`, `reviews/m4-execution-profiles-input-binding-remediation.md`, `../prompts/m4-execution-profiles-exact-input-contract.md`, `../prompts/m4-execution-profiles-exact-input-backend-remediation.md`, `../prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md`, `../prompts/m4-execution-profiles-offline-build-backend.md`, `../prompts/reviews/m4-execution-profiles-offline-build-backend-review.md`, `../prompts/m4-execution-profiles-offline-build-result-remediation.md`, `../prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md`, `decisions/0001-separate-profile-controls-from-route-evidence.md`, `threat-model.md`, `architecture.md`, `experiment-matrix.md` |
| M4 one-time offline-build execution-gate review | `milestones.md`, `codex-workflow.md`, `m4-execution-profiles.md`, `m4-execution-profiles-exact-input.md`, `reviews/m4-execution-profiles-exact-input-contract.md`, `reviews/m4-execution-profiles-exact-input-backend-remediation.md`, `reviews/m4-execution-profiles-offline-build-backend.md`, `reviews/m4-execution-profiles-offline-build-result-remediation.md`, `reviews/m4-execution-profiles-runtime-template-compatibility.md`, `reviews/m4-execution-profiles-input-binding-remediation.md`, `reviews/m4-execution-profiles-offline-build-recovery-gate.md`, `../prompts/m4-execution-profiles-exact-input-contract.md`, `../prompts/m4-execution-profiles-exact-input-backend-remediation.md`, `../prompts/m4-execution-profiles-offline-build-backend.md`, `../prompts/m4-execution-profiles-offline-build-result-remediation.md`, `../prompts/m4-execution-profiles-offline-build-execution.md`, `../prompts/reviews/m4-execution-profiles-offline-build-execution-gate-review.md`, `../prompts/m4-execution-profiles-offline-build-recovery-execution.md`, `../prompts/reviews/m4-execution-profiles-offline-build-recovery-gate-review.md`, `decisions/0001-separate-profile-controls-from-route-evidence.md`, `threat-model.md`, `architecture.md`, `experiment-matrix.md` |
| M4 approved one-time offline-build execution | 上記gate-review文書一式、`reviews/m4-execution-profiles-offline-build-execution-gate.md`、`../prompts/m4-execution-profiles-offline-build-execution.md` |
| M4 post-cleanup-failure offline-build recovery implementation, review, or remediation | 上記approved-execution文書一式、`reviews/m4-execution-profiles-offline-build-recovery.md`、`../prompts/m4-execution-profiles-offline-build-recovery.md`、`../prompts/m4-execution-profiles-offline-build-recovery-review.md`、`../prompts/m4-execution-profiles-offline-build-recovery-execution.md`、`../prompts/reviews/m4-execution-profiles-offline-build-recovery-gate-review.md`、`../prompts/m4-execution-profiles-offline-build-recovery-remediation.md` |
| Container profiles | `threat-model.md`, `architecture.md`, `experiment-matrix.md` |
| Artifact build or deploy | `artifact-pipeline.md`, `threat-model.md`; for the presentation subset also read `p3-artifact-demo.md` |
| Conference claims or P4 final review | `evidence-map.md`, sanitized results under `../results/examples/presentation-mvp/`, `reviews/p2-selected-profile-codegen-receipts.md`, `reviews/p2-selected-profile-vite-failure.md`, `reviews/p3-artifact-demo-result.md`, and `../prompts/reviews/p4-evidence-map-review.md` when present |
| Major design decisions | relevant ADRs under `decisions/` |

The presentation-MVP row is the active delivery route. Historical M4 recovery
rows remain available only for an explicitly resumed high-assurance research
task; they are not the default next action.

# Active P2 selected-Vite continuation

For the explicitly resumed `20260720-02` measurement generation, read
`p2-vite-detached-transfer-contract.md`,
`../prompts/p2-vite-detached-transfer-contract.md`, and, for the active fresh
review record, `reviews/p2-vite-detached-transfer-contract.md` and
`../prompts/reviews/p2-vite-detached-transfer-contract-review.md`. The first
fresh review blocked implementation on P2-DT01 through P2-DT05. The Docker-free
contract remediation and its fresh re-review are complete. That re-review
closes P2-DT01, P2-DT02, P2-DT04, and P2-DT05 and identifies two residual
P2-DT03 force-settlement branches. The residual Docker-free contract
remediation under
`../prompts/p2-vite-detached-transfer-contract-residual-remediation.md` is now
complete. Its fresh independent Docker-free re-review under
`../prompts/reviews/p2-vite-detached-transfer-contract-residual-remediation-review.md`
closes residual P2-DT03 with no remaining finding and approves only one bounded
Docker-free implementation task. That exact implementation and its 128-file
staging rebuild are now complete with Docker-free static/unit evidence. The
fresh read-only execution-gate review under
`../prompts/reviews/p2-vite-detached-transfer-execution-gate-review.md`, recorded
in `reviews/p2-vite-detached-transfer-execution-gate.md`, is now complete and
records `BLOCKED` on P2-DTG01 and P2-DTG02: unknown-settlement terminal codes
are not fully bound to their durable record paths, and natural exit `70` with a
valid prefix omits the canonical transfer-failure issue. The bounded Docker-free
host-side remediation is now complete with focused regressions: every unknown
child/server settlement terminal is bound to its exact durable failure path,
and established natural exit `70` always projects the canonical transfer issue.
The fresh independent Docker-free re-review under
`../prompts/reviews/p2-vite-detached-transfer-execution-gate-remediation-review.md`
is now complete, closes P2-DTG01/P2-DTG02 with no new finding, and approved at
most one later argument-free `npm run p2:execute:vite` pair attempt after exact
candidate/staging/script/root-absence revalidation. A fresh worker reproduced
that exact preflight and used standing authorization for the command once; this
was not a separate human review. The command exited 1 and was not retried. Its
bounded stdout is a v4 `Inconclusive` pair projection with only permissive
represented, an attempt written, evidence not inspected, no receipt, and no
constrained member. The worker did not access either result root or classify
the candidate result. The exact Docker-free result-review prompt is now saved
at `../prompts/reviews/p2-vite-detached-transfer-result-review.md`, binding the
approved candidate, direct bounded stdout, and only the two fixed active result
roots. At execution handoff, the immediate next task was that fresh independent
review; Docker rerun, result repair, receipt acceptance before review,
presentation promotion before acceptance, and `Observed` change remained
unauthorized.

That fresh Docker-free result review is now complete and recorded in
`reviews/p2-vite-detached-transfer-result.md`. It reproduced the exact v4
attempt, v2 progress control bytes, fixed root/control-path states, all 19
approved candidate hashes, the 128-file staging identity, and the pure 598-byte
stdout projection. It accepts the generation only as the fifth immutable
Inconclusive attempt. The progress terminal is invalid without an established
natural container exit, so the attempt retains only its eight identity-bound
record prefix and establishes no runner, child, service, output, receipt,
capability, constrained, same-image, selected-Vite Observed, or
experiment-matrix Observed result. The tracked three-table presentation
projection now retains all five attempts. No retry or runtime recovery is
authorized. Next: none.
