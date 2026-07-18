# Goal

M4の実装開始前gateとして、Expected-only execution-profile contractとADR-0001を設計正本、安全境界、Expected/Observed分離に照らして独立reviewし、人間が承認判断できるfindingとdecision recommendationを残す。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/experiment-protocol.md`のoutcome、Expected/Observed、run validity boundary

# Scope

- M4 contractとADRのsame-image control、profile差分、host orchestrator、evidence、inconclusive semanticsのread-only review
- M3 gateがM4 prerequisiteを満たす状態か、およびmatrix route Observedが未実測のままかの確認
- blocking finding、non-blocking follow-up、human approval pointを含む独立review記録の作成
- review対象snapshotのbranch、HEAD、target file hashを記録し、review記録追加後の差分と区別する

# Out of scope

- M4 contract本文、ADR decision/status、Expected tableの修正または自己承認
- `prompts/m4-execution-profiles.md`の作成
- `profiles/**`または`containers/**`のM4実装、host orchestrator、fixture、schema、testの追加
- Docker CLI、runtime socket、container build/start/inspect、external networkの利用
- adapter/profile run、experiment-matrix Observed、results、presentation evidenceの生成または更新
- M2 adapter、M3 implementation、M5以降、commit、remote Git、publication

# Constraints

- Expected、Observed、review recommendation、human approvalを明確に区別する
- AIによる独立review recommendationをhuman approvalとして扱わず、ADRは`Proposed`のままにする
- Manifest skip、target absence、filesystem/container denial、Node runtime denialを同一のenforcement claimに集約しない
- Permissiveでもhost home、credential、external network、runtime socket、privileged exposureを許可しない
- Review中にcontract findingを黙って修正せず、blockingなら別remediation taskを要求する
- Canary raw value、host absolute path、credential、runtime-socket detail、raw command outputをreview記録へ保存しない

# Deliverables

- `docs/reviews/m4-execution-profiles-contract.md`
- Gate recommendation、findings、reviewed snapshot identity、verification result、remaining limitations
- Human approval待ち、implementation未開始、profile-control Observed未実測、matrix route Observed未変更の明示

# Verification

```sh
npm run check
git diff --check
git status --short
```

Container/Docker commandは実行しない。

# Completion report

- Changed files
- Review target and gate recommendation
- Blocking/non-blocking findings
- Commands run and observed results
- Human approval前に残るgate
- Implementation、container、external network、credential、Docker socket、host lifecycle、remote Gitを使用していないこと
