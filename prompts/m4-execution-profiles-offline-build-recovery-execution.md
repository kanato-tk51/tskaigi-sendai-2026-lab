# Goal

M4のrecorded `inconclusive / CLEANUP_FAILURE`後の既存`run-root`と`staged tag`
から、`offline-build`回復処理を1回だけ実行するための
**Docker非実行**のone-time recovery実行ゲートを定義する。これは
後続の別Issueで実際のコマンド実行を許可するための前提作業であり、再試行やstate mutationはしない。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/reviews/m4-execution-profiles-exact-input-contract.md`
- `docs/reviews/m4-execution-profiles-exact-input-backend-remediation.md`
- `docs/reviews/m4-execution-profiles-offline-build-backend.md`
- `docs/reviews/m4-execution-profiles-offline-build-result-remediation.md`
- `docs/reviews/m4-execution-profiles-offline-build-recovery.md`
- `docs/reviews/m4-execution-profiles-runtime-template-compatibility.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- `prompts/m4-execution-profiles-offline-build-recovery.md`
- `prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md`

# Scope

- 実行前提として、offline-build recovery実装契約が受理済みであることを
  review recordで確認する。
- fixed run ID
  `m4-offline-build-20260718-01`とfixed staged tag
  `tskaigi-m4-profile-control:staged-m4-offline-build-20260718-01`、
  fixed retained run-root
  `results/runs/m4-profile-controls/m4-offline-build-20260718-01`
  のみに依拠する。
- recover対象は既存の recorded failed build result
  (`validity: inconclusive / primaryFailure: CLEANUP_FAILURE / 4 step / builtImageDigest: null`)。
- 実行コマンドはこのissue内では実行せず、同一コマンドを
  後続の一回限定 execution issue で`exactly once`実行する。
- builtImageDigestは`inspect`成功時のみ保持し、他状態では`null`。
- failure matrix、owned state、ownedStateDisposition、single inspect 1回上限を
  ゲート境界として固定し、再実行は許可しない。
- profile binding、control backend、runtime enforcement、experiment-matrix route
  Observedは次のgate以降に分離。

# Out of scope

- recovery実装コードの変更、`offline-build` backend再編集、`profile.json`生成。
- 実行コマンドそのものの追加（`npm` script の追加や新規runner追加は別Issue）。
- 追加Docker command（pull/login/create/start/run/remove等）。
- external network、credential、host home、runtime socket依存追加。
- `docs/index.md`以外のM4以外のトラック。

# Constraints

## Exact one-shot boundary

- このゲートは、**`fixed failed build result + fixed run-root + fixed staged tag`**を
  唯一の実行束縛にする。
- `recovery execution`は固定コマンド1回のみ。
- fixed recovery backendは`owned-state`を削除しない。
- 実行失敗時もrun-rootは原則保持し、`inconclusive`として記録。
- `state mutation`は不要な例外経路の保全外で実施しない。

## Canonical failure/digest matrix

- `validity=complete`は`OWNED_STATE`保持と`builtImageDigest != null`を伴う3-step完了。
- `validity=inconclusive`は`STATE_VALIDATION_FAILURE`/`COMMAND_FAILURE`/
  `COMMAND_TIMEOUT`/`OUTPUT_LIMIT`/`INSPECTION_FAILURE`/`OWNED_STATE_FAILURE`。
- complete以外では`builtImageDigest`は必ず`null`。
- `ownedStateDisposition`は`retained`を固定。

## Required re-check and reproducibility records

- このゲート定義では以下の再現観測を記録対象とする。
  - recovery contractのcritical hash（`docs/reviews/m4-execution-profiles-offline-build-recovery.md`
    既存レビュー記録の表）
  - recovery実装対象の`sorted manifest`再計算
  - `npm run m4:verify`
  - `npm run check`
- 実行ではなく、観測手順の固定（command、timeout/出力分類、境界）を非実行で記録する。

## Mandatory next-step coupling

- このゲート定義後、次taskは
  `prompts/reviews/m4-execution-profiles-offline-build-recovery-gate-review.md`
  によるfresh独立Docker-free再レビュー。
- 実行Issueは別Issueで行い、実行時は本Gateで定義したcommand/no-retryを厳密適用する。

# Deliverables

- one-time recovery実行境界（fixed tag/run-root/1回inspect/結果行列/owned state保持）
  の文書定義
- 再実行不許可（no retry）/ no state mutation / no command追加の明文化
- `docs/milestones.md`と該当レビュー台帳の次タスク接続
- `prompts/reviews/m4-execution-profiles-offline-build-recovery-gate-review.md`

# Verification

このタスクではDockerや実行は行わない。以下は固定観測コマンドとして記録する。

```sh
npm run m4:verify
npm run check
git diff --check
git status --short
```

加えて、`docs/reviews/m4-execution-profiles-offline-build-recovery.md`
のcritical hash（sorted manifest + contract hash）を再確認する。

`npm run m4:build`、`npm run m4:doctor`、`npm run m4:run:controls`、
`npm run m4:verify:evidence`、任意のDocker/container commandを実行しない。

# Completion report

- fixed boundary定義、no-execution状態、failure/digest matrix、owned-state retentionの完了宣言
- 実行しなかったDocker/containerコマンドの明記
- 再試行不許可（one-shot）の明示
- profile binding/runtime enforcement/Observed未確立であること
- `docs/milestones.md`とレビュー台帳更新が完了していること
