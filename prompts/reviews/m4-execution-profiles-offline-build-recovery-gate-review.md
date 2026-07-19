# Goal

M4 post-cleanup-failure recovery one-time execution-gateをfreshな
Docker非実行read-only reviewで検証し、fixed tag / run-root / single inspect
1回 / failure-digest行列 / owned state境界を満たしているかを判断する。

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
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `prompts/m4-execution-profiles-offline-build-recovery.md`
- `prompts/m4-execution-profiles-offline-build-recovery-execution.md`

# Scope

- recovery実装レビュー記録のcritical hash（snapshot/staging/integrity hash）再計算
- fixed run ID/tag/run-rootの再確認
- one-shot/no-retry境界、single local image inspect 1回上限の確認
- fixed failure matrixとbuiltImageDigest保持条件の再確認
- retention-only/owned-state継続条件、実行外効果（再起動/再inspect/cleanup）未追加条件
- review recordおよびmilestone台帳へのhandoff更新

# Out of scope

- recovery実装の修正（blockingがあれば別follw-up promptへ分離）。
- `npm run --silent m4:recovery:offline-build`等実行コマンドの実行。
- `external` network、credential、host home、runtime socket、remote Git。
- state cleanup、state removal、Docker pull/login/create/start/run/remove。
- profile binding、controls、runtime enforcement、Observed承認。

# Constraints

- 対象は既知契約`prompts/m4-execution-profiles-offline-build-recovery-execution.md`
  と`prompts/m4-execution-profiles-offline-build-recovery.md`のみ。
- fixed run ID/tag/run-rootの変更や、別run ID別tag書換えは拒否。
- fixed commandを1回を超えて再実行しない。
- `builtImageDigest`はcomplete時のみ非null。
- `STATE_VALIDATION_FAILURE`で0-step、command/output/inspection失敗で1-step、
  post-attempt owned-state失敗で2-step、successで3-step。
- failure/inconclusiveでも`ownedStateDisposition`は`retained`。
- Docker version command追加など、追加runtime observationは本門内で禁止。

# Deliverables

- 再レビュー決定（APPROVED/BLOCKED）
- fixed failure matrix / built-image有無 / no-retry境界の評価
- 実行しない前提での再現観測（hash・`m4:verify`/`check`）の記録
- `docs/milestones.md`等台帳更新先の決定
- 承認時は`docs/reviews/m4-execution-profiles-offline-build-recovery-gate.md`（別途作成）へ進める

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

加えて、critical hash再計算（sorted manifest / reviewed contract hash）は
review記録内で独立再計算する。

`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`、
Docker/container commandは実行しない。

# Completion report

- Review decision / findings / remaining limitation
- failure/digest matrixとone-shot boundaryの適合性
- commands run（non-executing）、hash再計算結果、`m4:verify`/`check`再確認結果
- 実行しなかったDocker/container/状態変更の明示
- 次の作業（承認時: 実行Issue、未承認時: 狭いremediation）
