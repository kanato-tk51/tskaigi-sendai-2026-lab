# Goal

M4 permissive/constrained execution profilesの実装を始める前に、fixed profile control、host orchestrator、Expected outcome、evidence、gateをExpected-only contractとして定義し、人間が承認可能な状態にする。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/experiment-protocol.md`のscenario、outcome、Expected/Observed境界

# Scope

- `docs/milestones.md`へのM4 Goal、scope、acceptance、verification draft
- M4 profile-control contract、Expected outcome table、Proposed ADR
- `docs/index.md`と`docs/codex-workflow.md`のM4 routing/boundary
- `profiles/README.md`と`containers/README.md`のcontract status
- future implementation/review taskのpath boundary

# Out of scope

- `profiles/permissive/**`、`profiles/constrained/**`、container definition、host orchestrator、control fixtureの実装
- container image build/start、Docker/socket access、external network access
- M2 adapter source、M3 collector schema、M4 implementation promptの作成
- adapter/profile run、experiment-matrix Observed、`results/runs/**`、`results/examples/**`の生成または更新
- M5 artifact pipeline、M6 evidence map、publication、remote Git

# Constraints

- ExpectedとObservedを混ぜず、Observed欄は未実測のままにする
- Permissiveもhost home、credential、external network、Docker socket、privileged modeを許可しない
- Constrainedのdenialは実際のOS/container/Node runtime enforcementとmanifest skipを区別する
- 同一の固定container inputとcontrol codeを両profileで使い、profile差以外の条件を変えない
- Approved host orchestratorだけが固定container-runtime CLIを使用でき、socketをexperiment containerへmount/forwardしない
- 実装開始にはこのcontractのhuman approvalを必要とし、このtaskで自己承認しない

# Deliverables

- `docs/m4-execution-profiles.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md` (`Proposed`)
- `docs/milestones.md`のM4 draft
- `docs/experiment-matrix.md`を変更せずroute Observedを未実測に保つ境界
- M4 implementation/reviewの明示的なscopeとblocking条件

# Verification

```sh
npm run check
git diff --check
git status --short
```

# Completion report

- Changed files
- Contract decisions and Expected-only changes
- Commands run and observed results
- Implementation前に必要なhuman approval
- Remaining design/runtime limitations
- Container、external network、credential、Docker socket、host lifecycle、remote Gitを使用していないこと
