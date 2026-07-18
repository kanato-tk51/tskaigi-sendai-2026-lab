# Goal

M4 static/unit remediationを、元のindependent reviewで記録されたB-01〜B-06のclosure evidenceと承認済みExpected契約に基づいて独立に再reviewし、static/unit implementation gateの新しいdecisionを記録する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/reviews/m4-execution-profiles-contract.md`
- `docs/reviews/m4-execution-profiles.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles.md`
- `prompts/m4-execution-profiles-remediation.md`

# Scope

- B-01: read-only immutable manifest input、host-owned inspection/completion、accepted byte/digest/file-identity binding
- B-02: result/sourceから分離したsame-target scratch policyとprofile別mount exposure
- B-03: exact staged-file inventory/digest、same-image profile pair、別run IDと別writable state
- B-04: device request、runtime selectionを含むsecurity-relevant pre-start inspection projection
- B-05: shared-buffer rejection、typed canonical serializer、control/outcome/reason semantics
- B-06: bounded fake-backend executor、transfer/cleanup、first-failure、explicit inconclusive result
- original acceptance criteria、新しいregression、Expected/Observed分離、orchestratorのfail-closed状態
- remediation対象snapshot identityとverification evidence

# Out of scope

- review中のimplementation source修正またはExpected契約変更
- `profile.json`、base/image digest、base environment inventoryの選定
- Docker/container command、runtime socket access、image build/pull、package install
- runtime enforcementまたはprofile-control Observedの生成・承認
- adapter/profile route、experiment-matrix Observed、presentation evidenceの変更
- M5以降、publication、commit、remote Git

# Constraints

- original findingをtest passだけでclosedにせず、production boundary、negative test、data flowを照合する
- static/unit gateとruntime enforcement gateを別々にdecisionする
- runtime evidenceがない状態でscratch/child/network denialをObservedとして承認しない
- Expected mismatchとinconclusiveを保持し、manifest skipや0件へ変換しない
- raw canary/payload、host absolute path、stdout/stderr、error/stack、credential、runtime-socket detailをreview記録へコピーしない
- 新しいblocking findingを発見した場合、gateをapproveせず別remediation taskを要求する
- review-owned changeはreview record、gate status metadata、必要なfollow-up promptに限定する

# Deliverables

- `docs/reviews/m4-execution-profiles-remediation.md`
- B-01〜B-06のclosure tableとsource/test evidence
- 新しいblocking/non-blocking finding一覧
- static/unit implementation gate decision
- runtime enforcement gateが未承認・未実測のままであることのdecision
- M4 milestone/status metadataの最小更新

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Docker runtime inputと実行承認は、static/unit remediation re-review後の別taskである。

# Completion report

- Re-review decision
- B-01〜B-06のclosure evidence
- New findings and remaining limitations
- Commands run、exit status、observed test counts
- Runtime evidenceをreviewしなかった理由
- Expected/Observed mismatchとinconclusive semantics
- Changed files（原則review record/status metadataのみ）
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
