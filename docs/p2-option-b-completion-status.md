# B方針 再継続・完遂ステータス（2026-07-19）

本書は、`B`方針（presentation MVPを完遂しつつ、Vite実行失敗履歴を固定化して先に進む）でのリポジトリ内作業を再開するための判断台帳です。`Next: none` 系列が示す未実行項目を、

- 完了
- 条件付き完了（境界明示）
- 条件付き保留（再開予定）

として分離して運用します。

## 対象外・対象内の定義

- 対象内: Presentation MVPの完了条件（P1/P2/P3/P4）を満たす範囲。
- 対象外（完了履歴）: M4高保証研究トラック。再開済みbounded continuationは
  Inconclusive/non-Observed境界を固定して完了した。

## 状態一覧

| 範囲 | 項目 | 状態 | 根拠ドキュメント | 補足/制約 |
|---|---|---|---|---|
| P1 | ルートルート/ネットワーク/安全境界の転換 | 完了 | `presentation-scope.md`, `presentation-evidence-inventory.md`, `milestones.md` | P1はruntime実行候補の分類、Evidence-class、未測定・Inconclusive境界の明示を完了。 |
| P2 | Codegen観測 (`codegen-observe-p/c`) | 完了（selected-profile Observed） | `docs/p2-selected-profile-codegen-receipts.md`, `reviews/p2-selected-profile-codegen-receipts.md` | 1-shotで同一fixture同一画像、same-imageペアを受理。 |
| P2 | Vite観測（`vite-observe-p/c`） | 条件付き完了（不可逆Inconclusive履歴） | `docs/p2-vite-completion.md`, `docs/presentation-scope.md`, `reviews/p2-vite-diagnostic-result.md` | `20260719-01`〜`20260719-03`を全て固定。`20260719-03`は`attached-start`タイムアウト由来の境界付与で、`selected Vite Observed`不成立。既存3件は更新対象外・再試行不可。 |
| P2 | Vite追加再試行（新runID） | 完了（再試行境界明示付き） | `docs/p2-vite-completion.md`, `docs/p2-selected-profile-vite-observed.md`, `milestones.md` | `P2-V08`〜`P2-V11`の再検証は完了。再試行はADR-0002/`continue-repository-work`下で新runIDのみ許可し、`run-id`切替えと`1回のみ`実行境界は既に明示済み。 |
| P2 | Vite executionにおける残留不整合 | 完了（受容） | `reviews/p2-vite-diagnostic-remediation.md`, `reviews/p2-selected-profile-vite-observed.md` | 既知制約（`inconclusive`の明示）を残したまま、再編集・再試行を停止。 |
| P3 | artifact demo（1回ビルド/検証/コピー/1byte改ざん拒否） | 完了 | `p3-artifact-demo.md`, `reviews/p3-artifact-demo-result.md` | `C-06/C-07`として受容済み。署名・OSegress証明の一般化はしない。 |
| P4 | evidence-map生成と最終レビュー | 完了 | `docs/evidence-map.md`, `reviews/p4-evidence-map.md` | 3つの表、証拠境界、制限事項を固定。 |
| M2 | npm lifecycle (`m2-a`) | 条件付き完了 | `m2-a-npm-lifecycle-adapter.md`, `reviews/m2-a-npm-lifecycle-adapter.md` | 実装/レビューは完了。`docker cp` transfer境界は既知の制約で`M0`は`Inconclusive`。 |
| M2 | ESLint/Vitest/Vite Plugin/codegen adapter | 完了 | `m2-b-eslint-adapter.md`, `m2-c-vitest-setup-adapter.md`, `m2-d-vite-plugin-adapter.md`, `m2-e-codegen-adapter.md` | local adapter evidenceとして確定。presentation route Observedへの直接昇格なし。 |
| M4 | profile-control/doctor/exact-input導入 | 条件付き完了（one-shot Inconclusive固定） | `m4-execution-profiles.md`, `m4-restart-issue-board.md`, `milestones.md`, `decisions/0001-separate-profile-controls-from-route-evidence.md` | `#39`のrecovery handoff、`#40`のreview済みone-shot、`#41`のObserved境界整合まで完了。固定pairは`inconclusive / COMMAND_FAILURE`、completed step/evidence/completion/comparisonなしのためruntime enforcementとprofile-control Observedは不成立。再実行・別run ID・route昇格なし。 |

## 次アクション（B方針）

1. ここでの状態を保守し、実行再開時は本台帳と`milestones.md`の「Frozen research track」を照合して判断する。
2. 新規タスク開始前に、上表の状態が更新されているか確認し、
   - `完了`が`条件付き完了`へ降格されないこと
   - `条件付き保留`の項目は、再開条件と境界が台帳に記載されていること
   を明記する。
3. 発表資料更新時は、Viteが`selected profile Observed`ではない点（3回Inconclusive）を削除せず維持する。
4. 条件付き/保留項目は、GitHub Issueへ分解して
   個別完了条件を持たせる。

## Issue追跡（GitHub）

- [ISSUE-104: M4 B-16/B-17 実行証跡ハッシュ更新とfresh再レビュー記録](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/29)（完了）
- [ISSUE-105: B-17 close未観測経路のexecutor側回帰を明示](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/30)（完了）
- [ISSUE-106: 凍結M4項目の再開方針とstatus台帳更新](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/31)（status台帳上完了）
- [ISSUE-107/32: B-16/B-17 Docker非実行fresh再レビューとハッシュ更新](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/32)（完了）
- [ISSUE-34: M4 recovery one-time execution gate を非実行定義・再レビューへ進める](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/34)（完了）
- [ISSUE-37: M4 凍結トラックをcompletionまで進める（run:controls/runtime enforcement/profile-control）](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/37)（ローカル台帳上完了、参照先: [m4-restart-issue-board.md](m4-restart-issue-board.md)）
- [ISSUE-39: M4: offline-build recovery trail更新と control-binding/runtime handoff](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/39)（ローカル台帳上完了）
- [ISSUE-40: M4: profile-control run:controls runtime enforcement gate を一回限定で定義](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/40)（one-shot実行完了。exact pairは`inconclusive / COMMAND_FAILURE`で再実行不可）
- [ISSUE-41: M4: profile-control 証拠境界の最終整合（Observed化条件を明記）](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/41)（ローカル台帳上完了。profile-control非Observed、experiment-matrix route非昇格を固定）

## 免責

- 本台帳は実行の再開指示ではなく、B方針の境界を固定するための現時点記録です。
- M4 bounded continuationはreview済みone-shotまで実行済みで、結果は
  Inconclusive/non-Observedとして固定した。再実行、別run ID、retained stateの
  再検査・削除、route昇格はこの完了記録では承認しない。

M4のbounded continuationはInconclusive結果と非昇格境界を受容して完了した。Presentation MVPの
完了状態およびViteの3回Inconclusive limitationは変更していない。

Next: none.
