# Goal

M4 profile-control implementationを承認済みExpected contractとADR-0001に照らして独立reviewし、fixed Docker boundary、same-image invariant、実enforcement evidence、transfer/run validity、安全制約のgate decisionを記録する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/reviews/m4-execution-profiles-contract.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles.md`

# Scope

- `profiles/**`、`containers/profile-control/**`、`containers/permissive/**`、`containers/constrained/**`のread-only implementation review
- Profile/control/evidence schema、unknown data rejection、Expected/profile cross-validation
- Fixed Docker create/inspect/start/result/cleanup argvとdisposable CLI config
- Image staging inventory、same-image digest、base environment inventory、pre-start full inspection
- Harmless control fixture、fixed child、loopback protocol、write target、raw-data boundary
- Missing/invalid/timeout/transfer failure、Expected mismatch、run validityのnegative evidence
- Static/unit result、および明示承認済みの場合だけcomplete runtime evidenceのreview

# Out of scope

- Findingの黙った修正
- M1/M2/M3 source、adapter/profile route、experiment-matrix Observedの変更
- 未承認のDocker/container command、external network、image pull、package install
- M5以降、publication、commit、remote Git

# Constraints

- Static/unit passだけでruntime enforcementをapproveしない
- Manifest skip、target absence、filesystem/container denial、Node runtime denialを区別する
- Host inspectionとin-container evidenceの片方だけをcompleteにしない
- Expected mismatchとinconclusive evidenceを保持する
- Raw canary/payload、host absolute path、stdout/stderr、error/stack、credential、runtime-socket detailをreview recordへコピーしない
- Docker executionが未承認またはinput未設定なら、runtime gateをpending/blockedとして記録する

# Deliverables

- Blocking/non-blocking findingsとacceptance criteriaごとのevidence
- Static/unit implementation gate decision
- Runtime enforcement gate decision、または未実行理由
- Reviewed snapshot identityとremaining limitations
- 別remediation promptが必要なfindingのscope

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

Runtime commandは既存の明示承認と固定inputが確認できる場合だけreviewする。新規に実行しない。

# Completion report

- Review target and decision
- Blocking/non-blocking findings
- Commands run and observed results
- Runtime evidence reviewed or reason unavailable
- Expected/Observed mismatch and limitations
- Changed files（原則review record/promptのみ）
- Docker、external network、credential、host lifecycle、remote Gitの使用有無
