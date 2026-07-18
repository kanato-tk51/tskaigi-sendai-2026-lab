# Goal

M4 input-binding remediationを、B-07のrequired remediationと承認済みExpected契約に基づいて独立にread-only re-reviewし、B-03/B-04およびstatic/unit implementation gateの新しいdecisionを記録する。

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
- `prompts/m4-execution-profiles-input-binding-remediation.md`

# Scope

- one branded accepted image/staging snapshotのimmutable copied bytes、exact inventory/digest、base environment key inventory
- accepted snapshotからimage build plan、profile pair、pre-start inspection allowlistへ至るproduction data flow
- fixed build-context pathへのstageとbuild前のexact inventory/byte/digest再検証
- staged byte replacement、extra/missing/reordered inventory、base-environment substitution、build-layout substitutionのnegative test
- B-03/B-04/B-07のclosure evidence、original acceptance criteria、新しいregression
- Expected/Observed分離、orchestratorのfail-closed状態、review対象snapshot identity

# Out of scope

- review中のimplementation source修正、M4 Expected契約またはADR-0001の変更
- `profile.json`、base/image digest、Docker runtime versionの選定
- Docker/container command、runtime socket access、image build/pull、package install
- runtime enforcementまたはprofile-control Observedの生成・承認
- adapter/profile route、experiment-matrix Observed、presentation evidenceの変更
- M5以降、publication、commit、remote Git

# Constraints

- matching metadataだけでclosureせず、accepted private bytesがbuild-context staging boundaryへ実際に渡され、read-back bytesとinventoryがbuild前に照合されるproduction pathを確認する
- callerがstaging digest、base environment keys、build layoutを独立入力として差し替えられないtype、brand、runtime validationを確認する
- accepted snapshot、host inspection、completionにraw staged content、raw environment value、host absolute pathが保存されないことを確認する
- static/unit gateとruntime enforcement gateを別々にdecisionし、runtime evidenceなしでenforcementをObservedとして承認しない
- Expected mismatchとinconclusiveを保持し、missing/invalid/timeout/transfer/cleanup failureをcompleteへ変換しない
- 新しいblocking findingを発見した場合はgateをapproveせず、別remediation taskを要求する
- review-owned changeはreview record、gate status metadata、必要なfollow-up promptに限定する

# Deliverables

- B-03/B-04/B-07のclosure decisionとsource/test evidence
- static/unit implementation gate decision
- runtime enforcement gateが未承認・未実測のままであることのdecision
- blocking/non-blocking finding一覧とremaining limitations
- reviewed snapshot identityとverification evidence
- M4 review record/status metadataの最小更新

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Docker runtime inputと実行承認は、input-binding remediationの独立re-review後の別taskである。

# Completion report

- Re-review decision
- B-03/B-04/B-07のclosure evidence
- Commands run、exit status、observed test counts
- Runtime evidenceをreviewしなかった理由
- Expected/Observed mismatch、inconclusive semantics、remaining limitations
- Changed files（原則review record/status metadataのみ）
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
