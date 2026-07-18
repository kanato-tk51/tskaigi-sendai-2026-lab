# Goal

M4 production offline-build backendのnon-executing implementationを、accepted
base/staging snapshot、承認済みfixed image build plan、安全正本に照らしてfresh
independent read-only reviewし、production offline-build backendのstatic/unit gateと、
後続の一回限定offline-build execution gateへ進めるかを判断する。

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
- `prompts/m4-execution-profiles-offline-build-backend.md`

# Scope

- build-only executor/input/resultとproduction host backendのsource、tests、static verifier
- accepted `image-input.json`、fixed 4 staging files、per-file/aggregate digest、branded
  snapshot/layout/planの不変性とidentity binding
- `stage-build-context`、exact canonical client/server version、offline build、built-image ID
  inspectだけのordered state machine
- exact fixed command identity、`/usr/bin/docker`、`shell: false`、credential-empty
  `DOCKER_CONFIG`、no inherited environment、repository-owned paths、bounded process/output/
  cleanup
- stagingのexclusive private copy、file/path/symlink/identity/inventory/read-back byte検証
- exact canonical built-image digest、sanitized result、complete/inconclusive、first-failure
  semantics
- import safety、ordinary orchestratorの`M4_EXECUTION_NOT_APPROVED`、package rootからの
  production backend非公開、Docker非到達性
- reviewed snapshot identity、blocking/non-blocking findings、remaining limitations、次gateの
  記録

# Out of scope

- review中のimplementation、accepted input、fixed plan、Expected契約、ADR-0001の修正
- Docker/container command、runtime socket access、image inspect/build/pull/create/start/run
- production backendのactivation、一回限定build execution recordまたはbuilt imageの生成
- `profile.json`、built-image/profile binding、control backend、runtime enforcement、
  profile-control Observed、experiment-matrix route Observed
- external network、credential、host home、host lifecycle、M1/M2/M3、M5以降、remote Git、
  commit、publication

# Constraints

- Reviewはbase digest、Node version、ordered base environment keys、4 staging file bytes/
  hashes、aggregate digestを独立に照合し、accepted inputの変更を見逃さない。
- Build-only executorがprofile pairやcontrol executorを要求せず、inspect後にcreate/start/
  transfer/removeへ進めないことを確認する。
- Backendがbranded accepted snapshot/layout/planとexact step/command identityだけを受け、
  arbitrary executable、argv、cwd、path、environment、image、runtime optionへ拡張されて
  いないことを確認する。
- Staging/Docker config/cleanup pathがrepository-owned fixed rootの下だけであり、symlink、
  pre-existing replacement、extra/missing/reordered/hard-linked file、byte driftをbuild前に
  fail closedにすることを確認する。
- Runtime versionとbuilt-image IDがfatal UTF-8、single final LF、canonical original bytes、
  exact value/shapeへbindされ、exit 0、parsed object、base/synthetic digestだけでcompleteに
  ならないことを確認する。
- Process timeout/output limit/abnormal close/cleanup failureがinconclusiveとなり、stderr、raw
  error、raw build output、host path、environment value、credentialがresultへ残らないことを
  確認する。
- Ordinary entry/package rootがproduction backendをimport/construct/exportせず、reviewed
  implementationだけでは`npm run m4:build`がDockerへ到達しないことを確認する。
- Tests/static verificationがDocker/runtime socketを使わず、host process testは許可された
  `process.execPath` fixed script boundaryだけを使うことを確認する。
- Static/unit passをexact-input production activation、build approval、built-image digest、
  profile binding、runtime enforcement、Observed evidenceとして承認しない。
- Inspect failure後にstaged image tagが残り得ることを含むcleanup limitationを評価し、
  一回限定execution gateの安全境界として受容できない場合はblocking findingにする。
- Finding修正はreviewに混ぜず、blockerごとの狭いremediation promptへ分離する。

# Deliverables

- Production offline-build backend static/unit gate decision
- Accepted input/fixed plan不変性、build-only state machine、filesystem/process/cleanup、
  canonical result、activation boundaryのassessment
- Blocking/non-blocking finding一覧、reviewed snapshot identity、remaining limitations
- `docs/reviews/m4-execution-profiles-offline-build-backend.md`
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

- Review decision、findings、remaining limitations
- Accepted base/staging/fixed planの不変性とproduction backend assessment
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container commandsと理由
- Changed files（原則review record/status metadata、blocker時のfollow-up promptのみ）
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote
  Gitを使用していないこと
