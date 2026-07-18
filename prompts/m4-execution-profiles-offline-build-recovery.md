# Goal

M4 one-time offline buildが4 build-only step完了後に
`inconclusive / CLEANUP_FAILURE`となった固定runだけを対象に、existing staged
image tagからbuilt-image digestを最大1回のexact local inspectで回収する
recovery-only executorとproduction host backendをnon-executing static/unit境界で
実装する。Retained run-owned stateはidentityを再検証して保持し、削除、build retry、
image removal、profile binding、control executionは行わない。

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
- このprompt

# Scope

- `containers/profile-control/**`のrecovery-only input/executor、production host
  backend、canonical sanitized result、static/unit tests
- fixed run ID `m4-offline-build-20260718-01`、repository-owned retained run root、
  fixed staged tag
  `tskaigi-m4-profile-control:staged-m4-offline-build-20260718-01`だけへのbinding
- recorded canonical build result
  `inconclusive / CLEANUP_FAILURE`、4 completed steps、base/staging digest、Docker
  client/server `29.6.1`、`builtImageDigest: null`のexact validation
- retained run rootのexact name/type/mode/size inventory、private path、symlink/
  hard-link rejection、pre/post identity validation
- fixed `/usr/bin/docker image inspect --format '{{json .Id}}' <fixed-tag>`を
  最大1回だけ発行できるsingle-use backend state machine
- retained `docker-config`だけの`DOCKER_CONFIG`、no inherited environment、
  `shell: false`、bounded timeout/output/process close、monotonic first failure
- canonical image-ID bytesとcanonical
  `lab-profile-offline-build-recovery-result/v1`のvalidation/serialization
- ordinary entry/package rootからproduction recovery backendを到達不能に保つ
  regressionと、fresh independent read-only review待ちを示すstatus metadata

# Out of scope

- Docker/container commandの実行、runtime socket access、image inspect/build/pull/
  login/create/start/run/remove、build retry、alternate run ID/tag
- retained run rootまたはその子のwrite、unlink、rmdir、rename、chmod、recursive
  cleanup、quarantine、内容read/hash、別pathへのcopy
- `docker-config/config.json`の作成、credential/auth/helper設定のread、host
  environmentの列挙または継承、external network
- accepted base/staging input、fixed staging files、Docker build plan、recorded build
  result、Expected contract、ADR-0001、experiment matrixの変更
- ordinary `orchestrator.ts` / `orchestrator-entry.ts`からproduction recovery
  backendをimport/construct/executeすること、package rootからのexport
- built-image digestの推測、`profile.json`、profile binding、control backend、runtime
  enforcement、profile-control Observed、experiment-matrix route Observed
- host home、credential、SSH agent、direct runtime socket、host lifecycle、M1/M2/M3、
  M5以降、remote Git、commit、publication、external communication

# Constraints

## Fixed failed-build identity

Recovery inputは次のrecorded resultのexact semantic identityだけを受理する。

- schema `lab-profile-offline-build-result/v1`
- `validity: "inconclusive"`
- `primaryFailure: "CLEANUP_FAILURE"`
- completed stepsは`stage-build-context`、`doctor`、`build`、`inspect-image`の順で
  全4件
- base digest
  `sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`
- staging digest
  `sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03`
- Docker client/serverはいずれも`29.6.1`
- `builtImageDigest: null`

Unbranded、substituted、complete、別failure/prefix/version/digestのresult、任意の
run ID/tag/pathはDocker access前にfail closedにする。Recoveryはbuild resultの
Observed rewriteではなく、別schemaのsanitized recovery recordを生成する。

## Exact retained-state contract

Production factoryはmodule URLからrealpathしたrepository rootと、そこから導くfixed
run rootだけを使う。Current retained treeは次のexact repository-relative inventoryである。
Directoryはすべてmode `0700`、regular fileはlink count 1でなければならない。

| Relative path under fixed run root | Type | Mode | Bytes |
|---|---|---:|---:|
| `docker-config` | directory | `0700` | - |
| `docker-config/.token_seed` | regular file | `0600` | 74 |
| `docker-config/.token_seed.lock` | regular file | `0600` | 0 |
| `docker-config/buildx` | directory | `0700` | - |
| `docker-config/buildx/.buildNodeID` | regular file | `0600` | 16 |
| `docker-config/buildx/.lock` | regular file | `0600` | 0 |
| `docker-config/buildx/activity` | directory | `0700` | - |
| `docker-config/buildx/activity/default` | regular file | `0600` | 20 |
| `docker-config/buildx/defaults` | empty directory | `0700` | - |
| `docker-config/buildx/instances` | empty directory | `0700` | - |
| `docker-config/buildx/refs` | directory | `0700` | - |
| `docker-config/buildx/refs/default` | directory | `0700` | - |
| `docker-config/buildx/refs/default/default` | directory | `0700` | - |
| `docker-config/buildx/refs/default/default/tdjwufr4i7552r09bibchdkva` | regular file | `0644` | 281 |

Run root自体もprivate exact directoryである。`staging`、`docker-config/config.json`、
credential/auth/helper config、socket、symlink、special file、extra/missing entryは存在しては
ならない。Factoryは`lstat`/`realpath`/`readdir`だけでexact treeを検証し、各entryの
device/inode identityをprivate memoryへcaptureする。Runtime-created fileのcontentsは
credentialでないと推測せず、一切read、hash、serializeしない。Device/inode、host absolute
path、mtime、raw metadataもresultへ保存しない。

Inspect後は同じexact tree、type、mode、size、link count、captured identitiesを再検証する。
このpost-attempt検証はcommand failure、timeout、overflow、abnormal close、invalid outputを
含むinspect attemptの全outcomeでprocess settlement後に実行する。検証に失敗しても削除や
修復を試みず、owned stateをその場に保持してrecovery resultをinconclusiveにする。検証成功時も
dispositionは`retained`であり、run rootを削除しない。

## Single-inspect process boundary

- Production backendはimport時にfilesystem、child、timer、Docker accessを開始しない。
- Exact commandは`/usr/bin/docker`、arguments
  `image inspect --format {{json .Id}}`
  とfixed staged tagだけである。Command object identityとstep orderを再照合し、任意の
  executable、argv、cwd、path、environment、image、runtime optionを受けない。
- `cwd`はfixed repository root、`env`はfixed retained `DOCKER_CONFIG` 1 keyだけ、
  `shell: false`、stdin ignored、timeout `5,000 ms`、combined output limit
  `65,536 bytes`とする。Host environmentをinheritしない。
- `docker-config/config.json`がないexact credential-empty retained treeを使う。Inspectはlocal
  tagだけを対象とし、network、pull、login、registry、build、container operationを持たない。
- Backend instanceはinspect attemptを0回から最大1回へmonotonicに進め、failure、timeout、
  overflow、abnormal close、invalid output後もretryできない。別factoryで同じfixed runへ
  再試行可能にするproduction seamも作らない。
- Stdoutはfatal UTF-8、no BOM/CR/NUL、single final LF、original-byte canonical
  `"sha256:<64 lowercase hex>"\n`だけを受理する。Base、M0、known synthetic digestを拒否し、
  stderr、raw output/error、host path、environment valueを保持しない。
- One-command境界のためDocker version commandは追加せず、recovery resultはruntime versionを
  新たに観測・主張しない。Recorded build resultのclient/server `29.6.1`と、recoveryで得る
  image digestは別のsanitized recordとして扱う。
- Static/unit implementationはDockerを実行可能にしない。Future activationはfresh reviewと
  separately recorded one-time recovery execution gateを必要とする。

## Recovery state machine and canonical result

Completed stepは`validate-retained-state`、`inspect-image`、
`validate-retained-state-after-inspect`のfixed prefixだけである。

- complete: 3 steps、failureなし、non-placeholder built-image digestあり、
  `ownedStateDisposition: "retained"`
- `STATE_VALIDATION_FAILURE`: 0 steps、Docker未実行、digestなし
- `COMMAND_FAILURE` / `COMMAND_TIMEOUT` / `OUTPUT_LIMIT` /
  `INSPECTION_FAILURE`: 1 step、inspect attemptは消費済み、digestなし
- `OWNED_STATE_FAILURE`: 2 steps、post-inspect identity validation failure、digestなし

Canonical resultはschema/version、validity、primary failure、ordered completed steps、fixed
run ID/tag、base/staging digest、built-image digestまたはnull、constant retained disposition
だけを持つ。Complete以外ではparsed digestを捨て、profile bindingへ渡さない。Plain objectと
canonical bytesの両境界でexact-key/semantic matrixを検証する。Post-attempt state validationは
全attempt outcomeで実行するが、fixed prefixを壊さないよう、`inspect-image`が成功した場合だけ
3番目のcompleted stepを追加できる。Earlier command/output/inspection failureがある場合のstate
validation failureはsecondaryとして保持し、earlier primaryを上書きしない。

## Activation and test boundary

- Ordinary `runApprovedOrchestrator()`は全operationでproduction build/recovery backendを
  import/constructする前に`M4_EXECUTION_NOT_APPROVED`を返し続ける。
- Package rootはproduction recovery host backend/factoryをexportしない。Implementation taskで
  root execution script、temporary activation、Docker commandを追加・実行しない。
- Unit testsはfake recovery backendとrepository-owned disposable test rootsだけを使い、fixed
  retained production run rootを変更しない。Production factory testはread-only preflightを
  行う場合もcontentsを読まず、Dockerへ到達しない。
- Focused negative testsはfailed-build identity、run/tag/path、inventory/type/mode/size/link/
  symlink/identity、command substitution、second attempt、timeout/output/process close、
  noncanonical/placeholder digest、post-inspect drift、result semantic mismatchをfail closedにする。
- Static verificationはordinary/package非到達性、single exact inspect、no inherited
  environment、retention-only/no unlink-rmdir-rm-rename-write、no config/content read、no runtime
  socket forwardingを確認する。

# Deliverables

- recovery-only input/executorとcanonical
  `lab-profile-offline-build-recovery-result/v1`
- fixed retained-state read-only pre/post identity validatorとsingle-inspect production host backend
- focused positive/negative testsとordinary fail-closed/static regression
- `prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md`
- M4/exact-input/architecture/milestone status metadataのimplementation済み・fresh
  independent read-only review待ちへの最小更新

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
`npm run m4:verify:evidence`と、その他のDocker/container commandは実行しない。Retained
production stateのdelete/write、profile binding、control executionも行わない。

# Completion report

- Changed files
- Fixed failed-build/run/tag/inventory binding、single-inspect、retention-only state treatment
- Canonical recovery resultとfocused positive/negative evidence
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container/destructive commandと理由
- Built-image digest、profile binding、controls、runtime enforcement、Observedが未確立であること
- RecoveryはDocker versionを再観測しないone-command boundaryであること
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Git、
  publicationを使用していないこと
