# Goal

M4 remediation re-reviewのB-07を、承認済みExpected契約とADR-0001を変更せずに是正し、accepted image/staging snapshot、実際のbuild-context bytes、base environment inventoryを単一のfail-closed production boundaryへbindする。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/reviews/m4-execution-profiles-contract.md`
- `docs/reviews/m4-execution-profiles.md`
- `docs/reviews/m4-execution-profiles-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles.md`
- `prompts/m4-execution-profiles-remediation.md`

# Scope

- `containers/profile-control/**`
- accepted image input、immutable staging byte copies、exact inventory/digest、base environment keysを持つ単一のbranded snapshot
- build plan、pair execution、inspect allowlistを同じaccepted snapshotから導出するproduction data flow
- fixed build contextへexact accepted files/bytesだけをstageし、build前にinventory/digestを再検証する境界
- staging path byte/inventory driftとbase environment inventory substitutionのfocused negative test
- fail-closed orchestratorとruntime未承認状態の維持
- review/status metadataのB-07 remediation実装済み・再review待ちへの最小更新
- 後続の独立read-only re-review prompt

# Out of scope

- M4 Expected値、ADR-0001、experiment-matrix route Expected/Observedの変更
- B-01、B-02、B-05、B-06の再設計
- M1/M2/M3 sourceまたはadapter/profile routeの変更
- `profile.json`、base/image digest、Docker runtime versionの選定
- Docker/container command、runtime socket access、image build/pull、package install
- runtime enforcementまたはprofile-control Observedの生成・承認
- M5以降、publication、commit、remote Git

# Constraints

- `PreparedStagingInput`のprivate copied bytesをunused helperにせず、approved snapshotからfixed staging boundaryへ渡す
- buildが参照するdirectoryのexact file inventoryとbyte digestを、build開始前にaccepted snapshotへ照合する
- callerが`stagingDigest`、`baseEnvironmentKeys`、build layoutを並行入力として差し替えられない型・brand・runtime validationにする
- image build plan、profile pair、inspectionは同じaccepted snapshot identityを共有する
- fake backend testはmatching dataだけでなく、staged byte replacement、extra/missing/reordered file、environment-key substitutionを拒否する
- accepted snapshot、host inspection、completionへraw file content、raw environment value、host absolute pathを保存しない
- import時side effectを追加しない
- Docker accessは引き続き`M4_EXECUTION_NOT_APPROVED`より先へ進めない
- Expected mismatch、missing/invalid/timeout/transfer/cleanup failureはcompleteへ変換しない

# Deliverables

- B-07 production remediationとfocused positive/negative tests
- accepted image/staging snapshotからbuild、pair、inspectionへ至る明示的data flow
- exact staged-path inventory/byte verification
- base environment inventory substitution rejection
- fail-closedのままのorchestrator entry
- 後続の独立read-only re-review prompt
- review/status metadataの最小更新

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Docker runtime inputと実行承認はB-07 remediationの独立re-review後の別taskである。

# Completion report

- Changed files
- accepted snapshot、staged bytes、environment inventoryのbinding evidence
- B-07 positive/negative test evidence
- Commands run、exit status、observed test counts
- 実行しなかったcontainer commandsと理由
- remaining runtime limitationsとExpected/Observed分離
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
