# Goal

M4 production offline-build backendのB-13/B-14/B-15 remediationを、accepted
base/staging snapshot、fixed image build plan、承認済みExpected契約、安全正本に照らして
fresh independent read-only re-reviewし、production offline-build backendのstatic/unit gateと
後続の一回限定offline-build execution gateへ進めるかを判断する。このreviewではDockerを
実行しない。

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
- `docs/reviews/m4-execution-profiles-runtime-template-compatibility.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-exact-input-contract.md`
- `prompts/m4-execution-profiles-exact-input-backend-remediation.md`
- `prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md`
- `prompts/m4-execution-profiles-offline-build-backend.md`
- `prompts/reviews/m4-execution-profiles-offline-build-backend-review.md`
- `prompts/m4-execution-profiles-offline-build-result-remediation.md`

# Scope

- B-13: known synthetic profile digestのinspect parser、plain result validator、canonical
  result byte parserでのexact rejectionと、別のvalid lowercase digestを許可する境界
- B-14: `validity`、`primaryFailure`、ordered completed-step prefix、runtime version、
  built-image digestのexact semantic matrix
- B-15: timeout、output overflow、process errorのmonotonic first-failure stateとproduction host
  backendへの適用、bounded drain/termination/close/cleanup
- contradictory untrusted backend result framing、nonzero/abnormal close、primary failureと
  cleanup secondary failureのfail-closed handling
- accepted input/fixed plan、ordinary `M4_EXECUTION_NOT_APPROVED`、package-root非公開、
  Docker非到達性のregression
- reviewed snapshot identity、finding closure、remaining limitations、次gateの記録

# Out of scope

- review中のimplementation、accepted input、fixed plan、Expected契約、ADR-0001の修正
- Docker/container command、runtime socket access、image inspect/build/pull/create/start/run
- production backendのactivation、一回限定build execution record、built-image digestの生成
- `profile.json`、built-image/profile binding、control backend、runtime enforcement、
  profile-control Observed、experiment-matrix route Observed
- external network、credential、host home、host lifecycle、remote Git、commit、publication

# Constraints

- `image-input.json`、base digest、Node.js version、base environment keys、fixed 4 staging
  files/per-file SHA-256/aggregate digestとfixed command planが不変であることを独立に確認する。
- Known synthetic digestだけをbase/M0 digestとともに拒否し、任意の将来valid image IDを
  推測で拒否していないことを確認する。
- `STAGING_FAILURE: 0`、`INSPECTION_FAILURE: 3`、`CLEANUP_FAILURE: 4`、command系
  failure: `0..3`、complete: `4`というexact prefix matrixをplain/canonical両境界で確認する。
- Doctor完了後だけexact client/server versionを要求し、inconclusive resultにbuilt digestを
  許さず、completeだけがnon-placeholder digestを持つことを確認する。
- Production process codeがfirst failureを一度だけlatchし、後続data/timer/error/closeで
  書き換えず、raw output/errorを保持せず、countとsettlementをboundedにすることを確認する。
- Pure lifecycle helperはproduction host backendで実際に使用され、arbitrary executable、argv、
  process factory、path、environment、runtime optionのproduction seamを追加していないことを
  確認する。
- Contradictory timeout/output flagsをpriority推測で受理せず、timeout-first late overflow、
  overflow-first late timeout、process-error-first late output、cleanup secondaryをfocused testが
  観測することを確認する。
- Ordinary entry/package rootがproduction backendをimport/construct/exportせず、reviewed
  remediationだけでは`npm run m4:build`がDockerへ到達しないことを確認する。
- Static/unit passをproduction adoption、build approval、built-image digest、profile binding、
  runtime enforcement、Observed evidenceとして承認しない。
- Finding修正はreviewに混ぜず、blockerがあれば狭いfollow-up promptへ分離する。

# Deliverables

- B-13/B-14/B-15 closure assessmentとproduction offline-build backend static/unit gate decision
- accepted input/fixed plan不変性、canonical result、process order、activation boundaryのreview evidence
- reviewed snapshot identity、commands/test counts、remaining runtime/cleanup limitations
- `docs/reviews/m4-execution-profiles-offline-build-result-remediation.md`
- M4/exact-input status metadataの最小更新
- Gateがapproveされた場合、次taskを一回限定offline-build execution gateの作成として記録
- Blockerがある場合のみ狭いfollow-up remediation prompt

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
`npm run m4:verify:evidence`は実行しない。このreviewはDocker access、image build、profile
binding、control executionのapprovalまたはObserved evidenceではない。

# Completion report

- Review decision、B-13/B-14/B-15 closure、remaining limitations
- Accepted base/staging/fixed plan不変性とproduction backend assessment
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container commandsと理由
- Changed files（原則review record/status metadataのみ）
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを
  使用していないこと
