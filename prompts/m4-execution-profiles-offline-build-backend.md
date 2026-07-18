# Goal

M4のproduction offline-build backendを、independent review済みのaccepted
base/staging snapshotとfixed image build planだけにbindし、通常のorchestrator
entryを`M4_EXECUTION_NOT_APPROVED`のまま維持したnon-executing
static/unit implementationとして追加する。このtaskではDockerを実行せず、image
build、profile binding、container control executionを承認または実行しない。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/reviews/m4-execution-profiles-exact-input-contract.md`
- `docs/reviews/m4-execution-profiles-exact-input-backend-remediation.md`
- `docs/reviews/m4-execution-profiles-runtime-template-compatibility.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-exact-input-contract.md`
- `prompts/m4-execution-profiles-exact-input-backend-remediation.md`
- `prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md`

# Scope

- `containers/profile-control/**`のbuild-only executor、production host backend、
  canonical sanitized build result、static/unit tests
- accepted `lab-profile-image-input/v1`、repositoryの固定4 staging files、branded
  accepted snapshot、branded `ImageBuildPlan`、branded `FixedRuntimeLayout`のidentity
  binding
- `stage-build-context`、canonical exact client/server version check、offline
  `build`、built-image ID inspectだけを持つbuild-only state machine
- fixed `/usr/bin/docker`、`shell: false`、fixed argv、credential-empty
  `DOCKER_CONFIG`、repository-owned layout、bounded timeout/output/process close、
  first-failure semantics
- fixed staging directoryへのprivate exclusive copy、exact regular-file inventory、
  read-back byte identity、per-file SHA-256、ordered aggregate digestのbuild前再検証
- built image IDをexact canonical `sha256:<64 lowercase hex>`として検証し、raw
  stdout/stderr、host path、environment value、credentialを含めないsanitized resultを返す
- production backendが通常entry/package rootから到達不能であることと、import-time
  side effectがないことのregression
- implementation完了・fresh independent read-only review待ちを示すstatus metadataの
  最小更新

# Out of scope

- `containers/profile-control/image-input.json`、accepted base digest、Node.js
  version、base environment keys、4 staging filesまたはstaging digestの変更
- approved Docker format、`ImageBuildPlan`のcommand order/argv、M4 Expected outcome、
  ADR-0001、experiment-matrix Expected/Observedの変更
- `executeFixedProfilePair()`をproduction build entryとして使うこと、profile pair、
  `profile.json`、create/inspect/start/transfer/remove control backendの実装または有効化
- `orchestrator.ts`または`orchestrator-entry.ts`からproduction backendをimport、
  construct、executeすること、package rootからproduction backendをexportすること
- `npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、
  `npm run m4:verify:evidence`、その他のDocker/container command
- built-image digestの捏造、version管理された`profile.json`の作成、runtime
  enforcement、profile-control Observed、experiment-matrix route Observedの生成または承認
- external network、credential、host home、runtime socket直接access、experiment
  containerへのruntime socket mount/forward、remote Git、commit、publication

# Required implementation boundary

## Build-only state machine

- Existing pair executorからbuild phaseを暗黙に再利用してcontrolsまで進めず、build専用の
  input/result型とexecutorを作る。
- Inputは同一のbranded accepted snapshot、そこから作成されたbranded image build
  plan、そのplanと同じrepository root/run layout、build-only backendだけを受理する。
- Backend factoryはarbitrary executable、argv、cwd、path、environment、image、run
  optionを受けない。Later execution gateがrecordするexact run ID/layoutはfactory外で
  branded planへ固定し、implementation taskで新しい実行targetを選ばない。
- State orderは`stage-build-context`、`doctor`、`build`、`inspect-image`だけとする。
  Canonical runtime payloadがexact client/server `29.6.1`でなければbuildを呼ばない。
- Built-image inspectはsingle-final-LF、fatal UTF-8、no CR/NUL、canonical original
  bytes、nonzero lowercase SHA-256 image IDを要求する。Parsed object、base digest、
  synthetic digest、M0 Node.js 24 digestによる代用を拒否する。
- Resultは`complete`または`inconclusive`を明示し、completed steps、primary failure、
  accepted base digest、staging digest、Docker client/server version、observed built-image
  digestだけをsanitized canonical dataとして保持する。これはprofile-controlまたはroute
  Observedではない。

## Production host backend

- Module import時にfilesystem、child process、timer、Docker accessを開始しない。
- Factoryはrepository module URLからresolve/realpathしたexact repository rootと、
  branded accepted snapshot/layout/planを再照合する。User input、CLI argument、環境変数、
  current working directoryからroot/layout/commandを決めない。
- Stagingはfixed 4 logical pathsだけをprivate directoryへexclusive-createし、parent、
  directory、fileのsymlink/identity/typeを検証する。Extra、missing、reordered、empty、
  shared-buffer、hard-linkまたはbyte driftをbuild前にfail closedにする。
- Docker configはrun-owned disposable directory内のexact
  `{"auths":{}}\n`だけとし、host environmentをinheritせず、login/auth helper/registry
  credentialを読まない。
- Process boundaryはexact plan command objectとstep ID/orderを再照合してから
  `/usr/bin/docker`を`cwd` fixed repository root、fixed `DOCKER_CONFIG`だけの`env`、
  `shell: false`、stdin ignoredでspawnする。Production codeにarbitrary process seamを
  exportしない。
- Timeout/output overflowではbounded terminationとclose settlementを待つ。Raw stderrは
  countだけを保持し、返却・保存しない。Version/image-ID stdout以外のraw build outputを
  resultへ保持しない。
- Cleanupはactive childがないこととowned path identityを再検証し、disposable Docker
  config/staging stateだけに限定する。Built imageは後続profile-binding gateのinputなので
  success時に削除しない。Cleanup failureはinconclusiveにし、先行primary failureを上書き
  しない。
- 実行途中のimage cleanup commandはapproved `ImageBuildPlan`に存在しないため追加しない。
  Inspect前後のfailureでfixed staged tagが残り得る点はremaining limitationとしてreviewへ
  渡す。

## Activation boundary and tests

- Ordinary `runApprovedOrchestrator()`はすべてのoperationでproduction backendをimport/
  constructする前に`M4_EXECUTION_NOT_APPROVED`を返し続ける。`m4:build` scriptは変更せず、
  implementation/reviewだけで実行可能にしない。
- Package rootはproduction host backend/factoryをexportしない。Later one-time executionは
  fresh review後の別taskで、reviewed source hash、exact run ID/layout/plan、fixed command、
  side-effect/cleanup boundaryをrepository recordへ固定してから行う。
- Unit testsはfake build-only backendとprivate injected test adapterだけを使い、
  `/usr/bin/docker`、runtime socket、container runtimeへ接続しない。Child-process testが必要
  ならroot safety ruleどおり`process.execPath`、fixed repository-owned script、
  `shell: false`だけを使う。
- Focused negative testsはunbranded/substituted snapshot、plan、layout、step/command、staging
  path/file/inventory/bytes、runtime payload、image-ID payload、timeout、output overflow、
  nonzero/abnormal close、cleanup failureをbuild前またはinconclusiveへfail closedにする。
- Static verificationはordinary entry/package exportの非到達性、fixed spawn options、
  credential-empty config、no inherited environment、no arbitrary path/command、no runtime
  socket forwardingを確認する。

# Deliverables

- productionから到達不能なbuild-only executorとfixed offline-build host backend
- sanitized canonical offline-build result validator/serializerとfocused tests
- filesystem/process/cleanup boundaryおよびordinary fail-closed entryのstatic regression
- `prompts/reviews/m4-execution-profiles-offline-build-backend-review.md`
- exact-input/M4 status metadataのimplementation済み・fresh independent review待ちへの
  最小更新

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
`npm run m4:verify:evidence`は実行しない。Docker/runtime access、image build、profile
binding、control executionはfresh independent read-only reviewと別途repositoryに記録する
execution gateより後のtaskである。

# Completion report

- Changed files
- Build-only executor、host filesystem/process/cleanup boundary、canonical resultの実装
- Focused positive/negative test evidenceとordinary fail-closed activation boundary
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container commandsと理由
- Accepted base/staging/fixed planが不変であること、Expected/Observed分離、remaining
  build/runtime limitations
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote
  Gitを使用していないこと
