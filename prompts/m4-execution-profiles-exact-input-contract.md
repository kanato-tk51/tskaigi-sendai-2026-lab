# Goal

M4 static/unit implementation gateの承認済み境界を維持したまま、version管理するprofile/image input、locally available immutable base input、base-environment inventory、固定host backend境界、exact container-runtime versionを、Docker実行とは分離したexact-input contractとして提案する。

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
- `prompts/m4-execution-profiles.md`
- `prompts/m4-execution-profiles-remediation.md`
- `prompts/m4-execution-profiles-input-binding-remediation.md`

# Scope

- `profiles/**`と`containers/profile-control/**`に置くversion管理されたexact input proposal
- 承認済みNode.js versionと一致する、既にlocalで利用可能なimmutable base imageのrepository digest
- repository-owned staging bytesから再計算したexact ordered inventoryとaggregate digest
- raw valueを含まないbase-environment key inventory
- exact Docker server version、固定CLI executable/argv/environment、filesystem staging、timeout、output、transfer、cleanupを実装するhost backend境界の提案
- offline image build後に得るbuilt-image digestと`profile.json`を、control execution前の別reviewへbindする二段階gate
- exact input proposal専用の独立read-only review prompt
- M4 status metadataの最小更新

# Out of scope

- Docker/container command、runtime socket access、image inspect/build/pull、package install
- locally available imageやruntimeの列挙、host environmentの列挙
- synthetic、placeholder、別Node versionのdigestを承認対象inputとして流用すること
- host backendの有効化、container execution、runtime enforcement、profile-control Observedの生成
- M4 Expected outcome、ADR-0001、experiment-matrix route Expected/Observedの変更
- adapter/profile route、M5以降、publication、commit、remote Git

# Constraints

- Base/image digest、runtime version、base-environment inventoryはsanitization済みのreview可能な実在evidenceにtraceできなければならない。値がない場合はcontractを完成扱いせず、missing inputを具体的に報告してfail closedに止める。
- M0で観測したNode.js `v24.18.0`用base digestを、M4の固定Node.js `v20.18.2` inputとして流用しない。
- `containers/profile-control/Containerfile`と固定fixture 3 filesのordered inventoryをrepository bytesから再計算し、synthetic digestを使わない。
- Base-environmentはkey名だけをversion管理し、raw value、host environment、credential、host absolute pathを保存しない。
- Built-image digestはoffline build前に捏造できないため、base/staging/backend contract review、明示的なbuild approval、built-image/profile binding review、control execution approvalを別gateにする。
- Host backendは固定Docker CLIだけを`shell: false`で起動し、arbitrary executable、argv、path、environment、mount、image、runtime optionを受け付けない。Experiment containerへruntime socketをmount/forwardしない。
- Docker accessは引き続き`M4_EXECUTION_NOT_APPROVED`より先へ進めない。
- Exact-input proposalやstatic checkをruntime enforcement evidence、profile-control Observed、route Observedとして扱わない。

# Deliverables

- 実在evidenceにtrace可能なbase image inputとstaging inventory/digest
- raw valueを含まないbase-environment key inventory
- exact runtime versionと固定host backend contract
- offline build前後の二段階digest/profile binding gate
- version管理されたinput fileとexact-key validator/negative test（実在inputがそろう場合のみ）
- 後続の独立read-only review prompt（complete proposalが作れる場合のみ）
- input不足時は、作成しなかったfile、欠けた実値、禁止した代替、次のhuman actionを明示するblocked report

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Docker runtime inputの観測、build、control executionには、それぞれ先行contract review後の明示的な承認が必要である。

# Completion report

- Changed files
- 採用したexact valuesとsanitized evidence location、または欠けている実値
- staging inventory/digestの再計算結果
- Commands run、exit status、observed test counts
- 実行しなかったcontainer commandsと理由
- Expected/Observed分離、remaining runtime limitations、次のreviewまたはhuman action
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
