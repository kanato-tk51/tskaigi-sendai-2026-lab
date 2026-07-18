# Goal

M4 post-cleanup-failure recovery reviewのB-16/B-17を、recorded failed-build
identity、fixed run/tag/inventory、single-inspect command、retention-only boundaryを
変更せずにDocker非実行のstatic/unit境界でremediationする。Exact retained modeの
special-bit substitutionを拒否し、close未観測のactive childがpost-attempt state
validationを通過できないようfail closedにする。

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
- `docs/reviews/m4-execution-profiles-offline-build-result-remediation.md`
- `docs/reviews/m4-execution-profiles-offline-build-execution-gate.md`
- `docs/reviews/m4-execution-profiles-offline-build-recovery.md`
- `docs/reviews/m4-execution-profiles-runtime-template-compatibility.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-offline-build-recovery.md`
- `prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md`
- this prompt

# Scope

- `containers/profile-control/src/offline-build-recovery-host-backend.ts`のexact
  mode validationとactive-child/post-validation invariant
- 必要最小限のprivate/pure lifecycle helper
- `containers/profile-control/test/offline-build-recovery-host-backend.test.ts`と
  recovery executor testsのfocused B-16/B-17 regression
- `containers/profile-control/scripts/verify-static.mjs`のexact-mode、settlement、
  no-Docker/no-mutation regression
- recorded build result、fixed command/result、ordinary activation boundaryのregression
- B-16/B-17 remediation implementation済み・fresh independent read-only re-review待ちを
  示すreview/status metadataの最小更新
- fresh independent remediation re-review prompt

# Out of scope

- fixed retained production treeのcontent read/hash/copyまたはwrite/chmod/unlink/rmdir/
  rename/rm/cleanup/quarantine
- Docker/container command、runtime socket access、image inspect/build/pull/login/create/
  start/run/remove、build retry、alternate run ID/tag
- recorded failed-build result、fixed run/tag/inventory sizes/names、accepted base/staging
  input、command argv、recovery result schema/semantic matrixの変更
- arbitrary executable、argv、cwd、path、environment、process factory、runtime optionの追加
- production activation、root execution script、temporary activation、package-root export
- built-image digestの推測、`profile.json`、profile binding、controls、runtime enforcement、
  profile-control Observed、experiment-matrix route Observed
- external network、credential、host home、host environment、host lifecycle、M1/M2/M3、
  M5以降、remote Git、commit、publication、external communication

# Required remediation boundary

## B-16 exact mode bits

- `lstat` modeはfile-type bitsと分離した全permission/special bitsをexact recorded
  `0700` / `0600` / `0644`へ比較する。`0o777` maskだけでsetuid、setgid、stickyを
  無視しない。
- Pre-captureとpost-captureは同じexact validatorを使い、type、size、regular-file link
  count、children、realpath、device/inode identityの既存checkを弱めない。
- Disposable repository-owned test treeだけを使い、representative directory/fileの
  setuid、setgid、sticky substitutionをすべて拒否するfocused tableを追加する。
  Fixed production run rootはread-onlyのままにし、chmodしない。

## B-17 child settlement before post-validation

- Production backendのpost-attempt `validateRetainedState()`は、fixed childの`close`
  eventが観測されていない状態を必ず拒否する。250 ms grace後の
  `closeObserved: false`をfilesystem post-validation成功へ変換しない。
- Timeout、output-limit、process-errorのmonotonic first failure、bounded SIGKILL/grace、
  raw output非保持を維持する。Close deadline後もearlier primary failureを上書きせず、
  digestはnull、owned stateはretainedのままにする。
- Executorがcommand/output/inspection failure後にもpost-validationをattemptする既存契約は
  維持するが、active childの場合はbackendがfail closedに拒否する。Processが後からstateを
  変更し得る状態でidentity validation successを記録しない。
- Private/pure lifecycle regressionまたは既存fixed lifecycle helperを使い、active child、
  observed close、close deadlineのstate transitionをDockerなしで検証する。Productionから
  arbitrary process seamをexportしない。

## Preserved boundary

- Exact recorded `CLEANUP_FAILURE`、fixed run ID/tag、inventory name/type/ordinary mode/size/
  link/identity、single fixed image-ID inspect、no inherited environment、`shell: false`、
  canonical digest/result matrixを変更しない。
- Runtime-created file contentsをread/hash/serializeせず、全outcomeでstateを保持する。
- Ordinary `runApprovedOrchestrator()`はproduction recovery backendをimport/constructする前に
  `M4_EXECUTION_NOT_APPROVED`を返し、package rootはexecutor/backendをexportしない。
- Static/unit passをrecovery execution approval、built-image digest、profile binding、runtime
  enforcement、Observed evidenceとして扱わない。

# Deliverables

- B-16 exact special-mode-bit rejectionとfocused disposable-tree tests
- B-17 active-child/close-settlement post-validation invariantとfocused Docker-free tests
- single-inspect/content-non-read/retention-only/ordinary fail-closed regression
- `prompts/reviews/m4-execution-profiles-offline-build-recovery-remediation-review.md`
- M4/exact-input/architecture/milestone status metadataのimplementation済み・fresh re-review
  待ちへの最小更新

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
`npm run m4:verify:evidence`と、その他のDocker/container commandは実行しない。
Fixed retained production stateを変更・削除せず、profile bindingやcontrol executionも行わない。

# Completion report

- Changed files
- B-16/B-17ごとのimplementationとfocused evidence
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container/destructive commandと理由
- recorded failed-build/run/tag/inventory/single-inspect/resultが不変であること
- built-image digest、profile binding、controls、runtime enforcement、Observedが未確立であること
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Git、
  publicationを使用していないこと
