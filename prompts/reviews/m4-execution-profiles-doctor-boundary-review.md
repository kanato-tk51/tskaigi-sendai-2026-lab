# Goal

M4 fixed doctor boundary implementationを承認済みExpected契約、exact-input task、threat modelに照らして独立にread-only reviewし、Docker未実行のstatic/unit doctor gate decisionを記録する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/reviews/m4-execution-profiles-contract.md`
- `docs/reviews/m4-execution-profiles.md`
- `docs/reviews/m4-execution-profiles-remediation.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-exact-input-contract.md`
- `prompts/m4-execution-profiles-doctor-boundary.md`

# Scope

- fixed doctor command IDs、nominal/runtime brand、exact executable/argv
- Docker client/server version、fixed local base identity、environment key-only projection
- disposable Docker CLI config、fixed repository-owned work root、filesystem ownership/cleanup
- shell/environment/cwd、timeout、combined output limit、stderr/raw error discard、process close behavior
- UTF-8/JSON/exact-key/digest/platform/environment-key validationとnormalized result
- arbitrary command/path/option、raw environment value、unbranded command、mismatch、malformed/oversized/timeout/nonzero/cleanup negative test
- import-time safety、orchestrator fail-closed状態、review対象snapshot identity

# Out of scope

- implementation sourceの修正
- doctor、Docker/container command、runtime socket access、image inspect/build/pull、package installの実行
- host local image/runtime/environmentの列挙
- `profile.json`、accepted image-input、built-image digestの作成
- runtime enforcement、profile-control Observed、adapter/profile route、experiment-matrix Observedの変更
- M5以降、publication、commit、remote Git

# Constraints

- Doctor backendが固定3 command以外を生成・実行できないproduction boundaryを確認し、test conventionだけで承認しない。
- Environment projectionがkey名または固定invalid markerだけを出力し、raw valueをchild stdout、result、test snapshotへ出さないことを確認する。
- Host process environmentを列挙・継承せず、disposable `DOCKER_CONFIG`だけを渡すことを確認する。
- Local image inspectionがpull/build/create/start/runへ到達せず、containerやexternal networkを使用しないことを確認する。
- Backend output、timeout、cleanup、invalid identityをaccepted inventoryへ変換しないことを確認する。
- Static/unit doctor gateとdoctor execution approval、runtime enforcement gateを別々にdecisionする。
- 新しいblocking findingがあればapproveせず、別remediation taskを要求する。
- Review-owned changeはreview record、status metadata、必要なfollow-up promptに限定する。

# Deliverables

- fixed doctor static/unit gate decision
- command/backend/parser/filesystem boundaryのsource/test evidence
- blocking/non-blocking findingsとremaining limitations
- doctor executionが未承認・未実行であることのdecision
- reviewed snapshot identityとverification evidence
- review record/status metadataの最小更新

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Doctor executionはこのread-only review後にhumanが明示的に承認する別stepである。

# Completion report

- Review decision、findings、remaining limitations
- Source/test evidenceとcommands run、exit status、test counts
- Changed files（原則review record/status metadataのみ）
- Doctor/runtime evidenceをreviewしなかった理由
- Expected/Observed分離
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
