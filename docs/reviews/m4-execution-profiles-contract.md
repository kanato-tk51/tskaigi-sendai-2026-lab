# M4 execution profile Expected 契約の独立レビュー

## レビュー対象

- 対象: M4 Expected-only execution-profile contract と ADR-0001
- Branch: `main`
- Base HEAD: `463dc6118ed6`
- レビュー種別: 文書と安全境界の independent review
- 実装状態: 未着手
- Profile-control Observed: 未実測
- Experiment-matrix route Observed: 別途記録済みの M0 evidence を除き、変更なし・未実測

independent review では、レビュー対象の contract source を変更していない。後続の approval-closure task では、human による明示的な判断の記録、ADR の accept、status metadata の更新、implementation prompt の作成を行った。M4 の実装や runtime evidence の生成は行っていない。

## Gate 推奨判断

- 推奨: `APPROVE`
- Blocking finding: なし
- Human 判断: 2026-07-17 に `APPROVED`
- ADR 状態: `Accepted`

independent review の推奨は、human reviewer に代わって承認を行うものではない。この推奨を確認した後、プロジェクトの human reviewer が 2026-07-17 に M4 Expected 契約と ADR-0001 を明示的に承認した。これにより文書上の prerequisite は完了し、implementation prompt の作成が可能になったが、container 実行は承認していない。

## レビュー済み snapshot の同一性

次の hash は、この記録を追加する前にレビューした working-tree 文書を識別する。hash が確立するのは byte identity だけであり、正しさや承認を単独で証明するものではない。

| 文書 | SHA-256 |
|---|---|
| `docs/m4-execution-profiles.md` | `430ba1abc2351dea138c0ae716e30e7f311b33006c8e73cf7ae36215c2b59e32` |
| `docs/decisions/0001-separate-profile-controls-from-route-evidence.md` | `a832dea20694b25f835428ef17402f5a0512591a93656261009adbbce8d0f358` |
| `docs/milestones.md` | `458ec7835f5acb1796f86c58e833c7fc1b7ee452b2618570b16b0e756892566e` |
| `docs/codex-workflow.md` | `000871b81f0166fd32e0f272c4e04d5aafda81813af57f0b415ad998d833cd29` |
| `docs/architecture.md` | `fe709db92d64e7ca0199c15f3a91003435060ef2f3cd84bce094c9bb0b6a623a` |
| `docs/index.md` | `ea49adbbc95d387b7ed953bebb4fc0e13678b3e18863966823928615e7a164e0` |
| `docs/threat-model.md` | `3e73a3d8f2c347b8c938dbcc3d3e5003a1bfe13768f34aabe3c33b71114c9f8d` |
| `docs/experiment-matrix.md` | `80ab99c890bc2eca2b5ade839e0195b032a702cc450ed3f7fecd8a5706e535b0` |
| `containers/README.md` | `d6dce22b6f5a2c8c85a7bc75c0f0c64cc1aa6b7bbcbd2bafba9a2a60b609425a` |
| `profiles/README.md` | `ab456930c030c9b08eaf41c9a96851408d49584fe564e21601a3b33978c92b9c` |
| `prompts/m4-execution-profiles-contract.md` | `3e7f0416ddd6ceb1ec9dbe0ca9f1ef9fe8a0500ca0db3bc0632ec3ba3e7a0fc0` |

`docs/threat-model.md`、`docs/experiment-protocol.md`、`docs/experiment-matrix.md` には working-tree diff がなかった。したがって、M4 contract は既存の route catalog や route Observed field を書き換えていない。

2026-07-17 の承認記録後に行った日本語化では、契約の意味、Expected 値、承認状態を変更していない。このため上記 hash は現在の文書ではなく、承認対象だった snapshot の byte identity を示す履歴値として保持する。

## レビュー評価

### Control と route の分離

ADR-0001 と contract は一貫して、最初の M4 gate を adapter route ではなく専用 profile control としている。固定 control ID、独立した manifest/evidence schema、M1 producer・adapter・matrix-route・presentation evidence への昇格禁止により、profile enforcement result が dependency-route observation と誤って表示されることを防いでいる。

### 制御された profile 差分

両 profile は、同一の immutable image digest、Node.js version、fixture/control bytes、control order、timeout、resource limit を必須とする。許可する差は、レビュー済み environment、canary-file exposure、scratch-write boundary、loopback target exposure、child runtime policy に限定される。両方とも non-root execution、read-only root、capability drop、no-new-privileges、external network なし、host home・credential・agent・device・runtime-socket exposure なしを維持する。

### Enforcement の解釈

Expected 表では、target absence と permission/runtime denial を区別している。

- constrained environment/file outcome は absence を観測し、permission denial を claim しない。
- constrained scratch/child control は manifest-skip ではなく、実行して failure にならなければならない。
- source mutation は両 profile で deny する。
- constrained loopback result が証明するのは、固定 target に到達できないことだけである。
- Node child-denial mechanism が利用できない場合は Expected mismatch のままとし、成功した skip と表示し直せない。

これは threat model、および `failure`、`skipped`、target absence、run validity を分ける protocol と整合する。

### Host と evidence の境界

orchestrator contract は fixed-input かつ fail-closed である。disposable Docker CLI configuration、offline pinned input、完全な create policy の pre-start inspection、上限付き実行、厳密な evidence inventory、固定 resource cleanup を必須とする。runtime socket への到達は承認済み host CLI を介した間接利用だけに限定し、repository code が直接開いたり experiment container 内へ expose したりしない。

host inspection と container 内 canonical evidence の両方が必須である。evidence が欠落、malformed、oversized、noncanonical、mismatched、incomplete、または不適切に transfer された場合、run は inconclusive になる。access failure、Expected mismatch、harness/evidence failure は別々の state として維持する。

## Non-blocking finding

### N-01 — top-level M3 status text が古い

`README.md` は M3 independent re-review gate が pending と記載している一方、正となる M3 milestone status と remediation review record は、non-blocking follow-up 付きで gate 承認済みとしている。正となる prerequisite は満たしているため、M4 contract review の blocker ではない。M4 Expected content を変えない別の文書 follow-up で README を整合させるべきである。

## 未実測の実装 input と制約

- immutable base/image digest と Docker runtime version は選定も観測もしていない。
- 正確な Node.js permission-model flag と filesystem allowlist は未承認である。
- 固定 child denial、scratch denial、source denial、loopback target behavior、result transfer、inspection 済み runtime policy は実行していない。
- loopback control が根拠にできるのは指定した固定 target に関する claim だけで、すべての loopback communication ではない。
- unit/static check では container enforcement を確立できず、後続の approved-host integration run と independent implementation review が引き続き必須である。
- container は runtime/kernel vulnerability や container escape からの保護を確立しない。

これらは明示的に後続へ回した implementation/runtime input であり、Observed result でも、実行後に Expected 表を書き換える理由でもない。

## 検証結果

2026-07-17 の review verification では、次を記録した。

- Node.js `v20.18.2`;
- npm `11.12.1`;
- `npm run check`: 成功。
- format check、lint、typecheck: `npm run check` の一部として成功。
- root test: 67 files、331 tests 成功。
- `git diff --check`: 成功。
- M4 implementation source、profile definition、container definition、runtime evidence、experiment-matrix route Observed の変更: なし。

Docker/container command、runtime socket access、external network、credential access、host lifecycle execution、remote Git operation、commit、publication は行っていない。

## 承認完了と残りの gate

human approval prerequisite は完了し、ADR-0001 は `Accepted`、次の implementation input として `prompts/m4-execution-profiles.md` を作成済みである。M4 実装は別タスクのままとする。固定 orchestrator とローカルで利用可能な digest-pinned input の実装および preflight review が完了し、実行環境で明示的に承認されるまで、Docker/container 実行は blocked のままである。
