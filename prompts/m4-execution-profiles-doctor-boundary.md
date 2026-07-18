# Goal

M4 exact-input contractの前提となる固定doctor境界を、Dockerを実行せずに実装する。Doctorはexact Docker client/server version、固定Node.js base tagのlocal immutable identity、sanitization済みbase-environment key inventoryだけを取得でき、pull、build、create、start、run、任意inputへ到達できないようfail closedにする。

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

# Scope

- `containers/profile-control/**`
- exact fixed doctor command IDsと、固定Docker executable/argvのnominal/runtime brand
- Docker client/server version、fixed local base image identity、base-environment keyだけを返すread-only command plan
- timeout、combined output limit、stderr discard、UTF-8/JSON/exact-key validation、normalized failureを持つhost backend
- disposable `DOCKER_CONFIG`とrepository-owned doctor work rootのfixed filesystem boundary
- fake backendによるpositive/negative testと、production backendを呼ばないstatic/import test
- orchestratorがDocker access前に`M4_EXECUTION_NOT_APPROVED`を返す状態の維持
- 独立read-only review promptとstatus metadataの最小更新

# Out of scope

- doctor、Docker/container command、runtime socket access、image inspect/build/pull、package installの実行
- `profile.json`、accepted image-input file、built-image digestの作成
- arbitrary executable、argv、path、environment、image、Docker option
- host environment、local image、credential、Docker contextの列挙
- container build/start、runtime enforcement、profile-control Observedの生成
- M4 Expected outcome、ADR-0001、experiment-matrix route Expected/Observedの変更
- adapter/profile route、M5以降、publication、commit、remote Git

# Constraints

- Doctor commandは`runtime-version`、`base-image-identity`、`base-environment-keys`の3 IDだけとし、callerからcommand objectを受け取らない。
- Docker executable、base tag、format、timeout、output上限、working directory、`DOCKER_CONFIG` ownershipを固定する。
- Base image operationはlocal `image inspect`だけとし、pull/build/create/start/runに到達しない。
- Environment projectionはkey名または固定invalid markerだけを出力し、raw valueをstdout/result/test snapshotへ出さない。Host process environmentを列挙・継承しない。
- Production backendは固定command brandだけを`shell: false`で実行し、stderr content、raw error/stack、host absolute path、Docker socket detailを結果へ保存しない。
- Missing image、runtime mismatch、malformed/noncanonical/oversized output、timeout、non-zero exit、cleanup failureをaccepted inventoryへ変換しない。
- Doctor inventoryはexact-input candidateであり、runtime enforcement、profile-control Observed、route Observedではない。
- Import時にfilesystem、process、timer、Docker workを開始しない。
- Orchestrator entryは独立reviewとhuman approvalまでproduction backendを生成せず、Docker前でfail closedにする。

# Deliverables

- fixed doctor plan、sanitized parser、bounded result type
- disposable-config production backend（disabled）とfake-backend tests
- arbitrary command/option、raw environment、malformed output、version/digest mismatch、timeout/output/cleanup failureのnegative tests
- Docker未実行のstatic/import safety evidence
- `prompts/reviews/m4-execution-profiles-doctor-boundary-review.md`
- M4 status metadataの実装済み・独立review待ちへの最小更新

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Doctor実行は独立read-only review後にhumanが明示的に承認する別stepである。

# Completion report

- Changed files
- fixed command/backend/parser boundaryとnegative test evidence
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container commandsと理由
- remaining exact-input/runtime limitationsとExpected/Observed分離
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
