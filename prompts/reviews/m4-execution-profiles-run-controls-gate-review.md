# Goal

M4 runtime enforcement one-time `run:controls` execution gate を fresh independent
read-only でレビューし、`builtImageDigest`/`profile pair`/`run-id`/Docker path の固定と
one-shot/no-retry 境界が、次の `npm run --silent m4:run:controls` 実行へ進めるかを判断する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md` の M4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/m4-execution-profiles-offline-build-execution.md`
- `docs/m4-execution-profiles-offline-build-execution-gate.md`
- `docs/m4-execution-profiles-runtime-template-compatibility.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-offline-build-execution.md`
- `prompts/m4-execution-profiles-run-controls-gate.md`

# Scope

- `run-controls` gate prompt と reviewed source の SHA-256 / aggregate identity の独立再計算
- 一回限定実行に必要な artifacts（offline-build result、固定 profile pair、run-id、run-root）
  の整合確認
- `m4 run-controls` 実行前提の `orchestrator.ts` / `orchestrator-entry.ts` 一時 activation
  バイト列、`npm run m4:typecheck` 復元境界
- execution step/order（`stage-build-context`、`doctor`、`build`、`inspect-image`、
  `permissive:*`、`constrained:*`）と fail-closed restore
- expected failure-classification（`COMMAND_TIMEOUT`/`OUTPUT_LIMIT`/`INSPECTION_FAILURE` 等）と
  `CLEANUP_FAILURE` の取り扱い
- control evidence / host inspection の保存範囲と raw payload 不保存境界

# Out of scope

- `npm run --silent m4:run:controls` の実行（レビュー判断のみ）
- run-controls の implementation 改変、`profile.json`/`builtImageDigest` の再決定
- Docker/network/credential 接続、外部依存、publication、commit、remote Git
- adapter/profile route の変更、観測結果の Observed 昇格（別 task）

# Constraints

- 対象は `prompts/m4-execution-profiles-run-controls-gate.md` のみ。別行動は許容しない。
- builtImageDigest が non-null complete offline-build result であること（recovery/失敗結果の
  `builtImageDigest=null` は受理しない）。
- fixed pair と fixed run-id を変更した再作成は拒否。
- one-shot 境界は `npm run --silent m4:run:controls` の command occurrence を実行記録上
  1回までに限定し、retry/rebind を blocking とする。
- 6 step 以降の `permissive/remove` / `constrained/remove` が実装上失敗しても再試行を
  追加で許可しない。
- static/unit evidence で control/evidence の成功を確認しても、Observed 承認や runtime
  enforcement 承認とは別 decision。
- review-owned change は milestone/board と prompt の最小更新、または blocking follow-up
  prompt のみ。

# Deliverables

- `run-controls` one-shot gate の decision（APPROVED / BLOCKED）
- builtImageDigest/pair/run-id/コマンド境界の合意と remaining limitation
- 再実行禁止、再bind禁止、restore requirement の適合性
- 付随する status metadata 更新先の宣言
- `prompts/m4-execution-profiles-run-controls-gate.md` の実行 follow-up 仕様

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、
`npm run m4:verify:evidence` は実行しない。temporary activation は apply しない。

# Completion report

- Review decision / blocking findings / remaining limitations
- 再計算 hash と one-shot 境界の整合
- `commands run`（非実行）とテスト実行結果
- 実行しなかった Docker/runtime command の明示
- `docs/milestones.md` / issue board の最小更新
- 実行で external network / credential / host home / runtime socket / remote Git を
  使用していないこと
