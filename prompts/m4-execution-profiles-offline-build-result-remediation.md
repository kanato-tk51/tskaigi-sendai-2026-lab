# Goal

M4 production offline-build backend reviewのB-13/B-14/B-15を、accepted
base/staging snapshot、fixed image build plan、ordinary
`M4_EXECUTION_NOT_APPROVED` boundaryを変更せずにnon-executing static/unit境界で
remediationする。既知synthetic digestをbuilt-image observationとして拒否し、canonical
resultのfailure/step semanticsとproduction processのfirst-failure orderをfail closedに
固定する。このtaskではDockerを実行しない。

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
- `prompts/m4-execution-profiles-offline-build-backend.md`
- `prompts/reviews/m4-execution-profiles-offline-build-backend-review.md`

# Scope

- `containers/profile-control/src/offline-build.ts`のbuilt-image digest parser、canonical
  result validator/serializer、command-result contradiction handling
- `containers/profile-control/src/offline-build-host-backend.ts`のmonotonic
  first-process-failure latch、bounded termination/drain/close/cleanup
- B-13: repositoryで既知のsynthetic profile image digest
  `sha256:1111111111111111111111111111111111111111111111111111111111111111`をinspect
  payloadとcanonical resultの両方で拒否するfocused regression
- B-14: `validity`、`primaryFailure`、ordered completed-step prefix、runtime version、
  built-image digestのexact semantic matrix
- B-15: timeout、output overflow、process error、nonzero/abnormal close、cleanupのevent
  orderとfirst-failure preservationをDocker非実行で検証するfocused tests
- accepted input/fixed plan/ordinary activation boundaryのregression
- implementation完了・fresh independent read-only re-review待ちを示すreview/status
  metadataの最小更新
- 後続のfresh independent read-only re-review prompt

# Out of scope

- `containers/profile-control/image-input.json`、base digest、Node.js version、base
  environment keys、fixed 4 staging files、staging digestの変更
- `ImageBuildPlan`のcommand order/argv、Docker format、M4 Expected contract、ADR-0001、
  experiment-matrix Expected/Observedの変更
- 任意の将来built-image digestを推測またはversion管理すること、known placeholder以外の
  syntactically valid digestを広く拒否すること
- production backendのactivation、ordinary orchestrator/package rootからのbackend export
  またはreachability追加
- Docker/container command、runtime socket access、image inspect/build/pull/create/start/run
- `profile.json`、built-image/profile binding、control backend、runtime enforcement、
  profile-control Observed、experiment-matrix route Observed
- external network、credential、host home、host lifecycle、remote Git、commit、publication

# Required remediation boundary

## B-13 known synthetic digest rejection

- Built-image inspect payloadと`validateOfflineBuildResult()`は、fixed base digest、M0
  Node.js 24 digestに加え、repositoryでprofile/control unit fixtureに使用するexact known
  synthetic image digestを拒否する。
- Rejectionはcanonical JSON string＋single final LFであっても`INSPECTION_FAILURE`または
  `INVALID_OFFLINE_BUILD_RESULT`となり、`complete` resultを生成しない。
- Focused testはinspect parser経由、plain result validator、canonical result bytesの3境界を
  覆う。Positive unit fixture用の別のnonzero lowercase digestは引き続き許可し、実runの
  digestを先取りしない。

## B-14 exact result semantics

- Completed stepsは引き続き固定orderのprefixだけを許可し、failure codeとprefixを次の
  exact matrixへbindする。
  - `complete`: 4 steps、`primaryFailure: null`、exact runtime versions、non-placeholder
    built-image digest
  - `STAGING_FAILURE`: 0 steps、version/digestなし
  - `INSPECTION_FAILURE`: first 3 steps、exact runtime versions、built digestなし
  - `CLEANUP_FAILURE`: 4 steps、exact runtime versions、built digestなし
  - `COMMAND_FAILURE` / `COMMAND_TIMEOUT` / `OUTPUT_LIMIT`: 0〜3 stepsのprefixだけ、doctorが
    completedならexact runtime versions、built digestなし
- Unbranded inputが返す0-step `COMMAND_FAILURE`は維持する。Cleanup secondary failureは先行
  primary failureを上書きしない。
- Impossible failure/prefix/version/digest combinationsをplain validatorとcanonical byte
  parserの両方で拒否するnegative tableを追加する。

## B-15 monotonic process first failure

- Production host backendはtimeout、output overflow、process errorのうち最初に観測した
  failureを一度だけlatchし、後続drain/data/timer/error eventで変更しない。
- Failure後もbounded terminationとclose settlementに必要なcount/drainは続けてよいが、raw
  stdout/stderr/errorは保持しない。Timeout/output/process failure後のclose/cleanup failureは
  secondaryのままにする。
- Executorはuntrusted backend resultで`timedOut`と`outputLimitExceeded`が同時にtrue等の
  contradictory framingを受理してpriorityを推測せず、fail closedにする。
- Focused testsは少なくともtimeout→overflow、overflow→timeout、process-error→late output、
  primary failure＋unclosed/cleanup failureの順序を検証する。
- Docker/runtime socketは使用しない。Pure private lifecycle helperを使うか、host processを
  必要とする場合はroot safety ruleどおり`process.execPath`、fixed repository-owned script、
  `shell: false`だけを使う。Productionからarbitrary executable/argv/process seamをexportしない。

## Preserved boundary

- Accepted snapshot、branded layout、fixed plan/command object identity、repository root、private
  staging、credential-empty config、no inherited environment、fixed `/usr/bin/docker`、
  `shell: false`を変更しない。
- Ordinary `runApprovedOrchestrator()`はproduction backendをimport/constructする前に全operation
  を`M4_EXECUTION_NOT_APPROVED`へ止める。`m4:build`は有効化しない。
- Static/unit passをexact-input production adoption、build approval、built-image digest、profile
  binding、runtime enforcement、Observed evidenceとして扱わない。

# Deliverables

- B-13 known synthetic digest rejectionとfocused parser/validator/canonical-byte tests
- B-14 exact failure/prefix/version/digest semantic validationとnegative table
- B-15 monotonic first-failure process handling、contradictory backend framing rejection、focused
  event-order tests
- accepted input/fixed plan不変性とordinary fail-closed activation regression
- `prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md`
- review/status metadataのremediation実装済み・fresh independent re-review待ちへの最小更新

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
`npm run m4:verify:evidence`は実行しない。Docker access、image build、profile binding、
control executionはfresh independent re-review後も別gateである。

# Completion report

- Changed files
- B-13/B-14/B-15ごとのimplementationとfocused positive/negative evidence
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container commandsと理由
- accepted base/staging/fixed planが不変であること、Expected/Observed分離、remaining runtime
  limitations
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを
  使用していないこと
