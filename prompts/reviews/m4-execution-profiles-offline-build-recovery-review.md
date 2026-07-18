# Goal

M4 post-cleanup-failure recovery implementationを、recorded failed-build identity、existing
fixed staged tag、retained run-owned state、安全正本に照らしてfresh independent read-only
reviewし、single-inspect recovery static/unit gateと後続のone-time recovery execution-gate
definitionへ進めるかを判断する。このreviewではDockerを実行せず、retained stateを変更・
削除しない。

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
- `docs/reviews/m4-execution-profiles-runtime-template-compatibility.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-offline-build-backend.md`
- `prompts/m4-execution-profiles-offline-build-result-remediation.md`
- `prompts/m4-execution-profiles-offline-build-execution.md`
- `prompts/m4-execution-profiles-offline-build-recovery.md`

# Scope

- recovery-only input/executor/result、production host backend、tests、static verifier
- exact recorded `CLEANUP_FAILURE` result、fixed run ID/tag、retained tree inventoryへの
  value/brand/identity binding
- read-only retained-state pre/post validation、private identity capture、runtime-created file
  contentsの非read/nonserialization
- fixed `/usr/bin/docker image inspect --format '{{json .Id}}' <fixed-tag>`最大1回、
  no inherited environment、fixed retained `DOCKER_CONFIG`、bounded process/output
- canonical digest parser、failure/completed-step/digest/disposition matrix、complete以外での
  digest discard
- retention-only state treatment、ordinary `M4_EXECUTION_NOT_APPROVED`、package-root非公開、
  Docker非到達性
- reviewed snapshot identity、blocking/non-blocking findings、remaining limitations、次gate

# Out of scope

- review中のimplementationまたはcontract修正
- Docker/container command、runtime socket access、image inspect/build/pull/login/create/start/
  run/remove、build retry
- retained production stateのwrite/content read/hash/unlink/rmdir/rename/recursive cleanup
- production activation、一回限定recovery execution record、built-image digestの生成
- `profile.json`、profile binding、control backend、runtime enforcement、profile-control
  Observed、experiment-matrix route Observed
- external network、credential、host home、host environment列挙、host lifecycle、M1/M2/M3、
  M5以降、remote Git、commit、publication

# Constraints

- Reviewはexecution follow-upのcanonical failed resultを独立に照合し、recoveryがexact
  `CLEANUP_FAILURE` / four-step / null-digest identity以外を受けないことを確認する。
- Fixed run ID/tagとretained treeのname/type/mode/size/link boundaryを独立に照合する。
  File contents、device/inode、host absolute pathをreview recordへ保存しない。
- Production validatorがexact repository root/run root以外のpath、symlink、hard link、special
  file、extra/missing entry、mode/size drift、pre/post identity replacementをfail closedにする
  ことを確認する。
- Repository codeがruntime-created `.token_seed` / buildx ref等のcontentsをcredentialでないと
  推測してread/hashせず、identity metadataをprivate memoryだけに保持することを確認する。
- Backendがfixed command objectを最大1回しか受けず、別run/tag、second call、retry、build、
  image removal、container operation、arbitrary executable/argv/cwd/path/environment/runtime
  optionへ拡張されていないことを確認する。
- Spawnがfixed repository cwd、retained `DOCKER_CONFIG` 1 keyだけのenv、`shell: false`、bounded
  timeout/output/closeを使い、host environment、credential config、networkを要求しないことを
  確認する。
- Image-ID parserがfatal UTF-8、single final LF、original canonical bytes、non-placeholder
  lowercase SHA-256へbindされ、exit 0やparsed stringだけでcompleteにならないことを確認する。
- Single-command recoveryがDocker versionを再観測せず、recorded build-time `29.6.1`とrecovered
  image digestを同じnew observationとして混ぜないことを確認する。
- State machineが0/1/2/3 step prefixとfailureをexactにbindし、post-inspect state failure時は
  digestを捨てることを確認する。Post-attempt identity validationがcommand/output/inspection
  failureを含む全attempt outcomeでprocess settlement後に実行され、secondary state failureが
  earlier primaryを上書きせず、すべてのoutcomeでowned stateを保持することも確認する。
- Production codeにunlink/rmdir/rm/rename/chmod/write/config creation/content-read seamがなく、
  unsafe stateも修復・削除せずinconclusiveで保持することを確認する。
- Ordinary entry/package rootがproduction recovery backendをimport/construct/exportせず、
  reviewed implementationだけではDockerへ到達しないことを確認する。
- Tests/static verificationがDocker/runtime socketやfixed retained production stateのmutationを
  使わないことを確認する。Read-only production preflightを行うtestはcontentsを読まない。
- Static/unit passをrecovery execution approval、built-image digest、profile binding、runtime
  enforcement、Observed evidenceとして承認しない。
- Finding修正はreviewへ混ぜず、blockerごとの狭いfollow-up promptへ分離する。

# Deliverables

- Single-inspect recovery static/unit gate decision
- Failed-build/run/tag/inventory binding、state identity/content boundary、process/digest/result、
  retention-only treatment、activation boundaryのassessment
- Blocking/non-blocking findings、reviewed snapshot identity、remaining limitations
- `docs/reviews/m4-execution-profiles-offline-build-recovery.md`
- M4/exact-input/architecture/milestone status metadataの最小更新
- Gateがapproveされた場合、次taskをreview済みsource/activation/one-command/restorationだけへ
  bindするone-time recovery execution-gate definitionとして記録
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
`npm run m4:verify:evidence`と、その他のDocker/container/destructive commandは実行しない。
このreviewはrecovery execution、built-image digest、profile binding、control executionのapproval
またはObserved evidenceではない。

# Completion report

- Review decision、findings、remaining limitations
- Failed-build/run/tag/state bindingとsingle-inspect/retention-only boundary assessment
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container/destructive commandsと理由
- Changed files（原則review record/status metadata、blocker時のfollow-up promptのみ）
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Git、
  publicationを使用していないこと
