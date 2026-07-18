# Goal

M4 one-time offline-build execution gateをfresh independent read-only reviewし、review済み
source snapshot、temporary activation bytes、exact run/layout/plan、side-effect/cleanup、sanitized
result、post-run restorationが、ちょうど1回のoffline buildへ進める安全な固定境界かを判断する。
このreviewではDockerを実行しない。

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
- `docs/reviews/m4-execution-profiles-runtime-template-compatibility.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-exact-input-contract.md`
- `prompts/m4-execution-profiles-exact-input-backend-remediation.md`
- `prompts/m4-execution-profiles-offline-build-backend.md`
- `prompts/m4-execution-profiles-offline-build-result-remediation.md`
- `prompts/m4-execution-profiles-offline-build-execution.md`

# Scope

- execution promptのreviewed aggregate/per-file SHA-256と現repository bytesの独立照合
- ordinary fail-closed entry bytesとtemporary activation source全体、activation source hash、
  compile/type boundary
- fixed run ID `m4-offline-build-20260718-01`から導くrepository-owned layoutとfixed staged tag
- accepted image/staging snapshot、branded `ImageBuildPlan`、production backend、build-only executorの
  identity binding
- exact one-command activationとordered version/build/image-inspect plan
- fixed `/usr/bin/docker`、credential-empty config、no inherited environment、`shell: false`、
  timeout/output/first-failure、canonical sanitized result
- success/inspect failure/cleanup failure時のtagとowned filesystem side effect
- ordinary entry source/compiled output restoration、post-run verification、one-time/non-retry semantics
- gate decision、blocking/non-blocking finding、reviewed gate snapshot identity、次taskの記録

# Out of scope

- review中のimplementation、accepted input、fixed plan、Expected contract、ADR-0001の修正
- temporary activationの適用、`npm run m4:build`、Docker/container command、runtime socket access
- image inspect/build/pull/create/start/run、production backend activation、built-image digestの生成
- `profile.json`、built-image/profile binding、control backend、runtime enforcement、
  profile-control Observed、experiment-matrix route Observed
- external network、credential、host home、host lifecycle、M1/M2/M3、M5以降、remote Git、
  commit、publication

# Constraints

- Source manifest、critical source/package/toolchain hash、4 staging byte/hash/aggregateを独立に
  再計算し、review recordからのcopyだけでapproveしない。
- Temporary activationが固定versioned inputとrepository bytesからaccepted snapshotを作り、
  exact run IDのpermissive build layout、同じsnapshot/layoutから作るbranded plan/backend/inputだけを
  実行することを確認する。
- Activationが`build`以外を拒否し、exception/raw error/stderr/host pathをresultへ出さず、canonical
  inconclusive fallbackを返すことを確認する。
- Exact commandがpackage scriptのcompile後にfixed activationだけを実行し、Docker operationが
  version、offline build、built-image ID inspectの3つを越えないことを確認する。
- Buildが`--network none`、`--pull=false`、digest-pinned local baseだけを使い、credential、host
  environment、arbitrary input、runtime socket forwardingを追加しないことを確認する。
- Fixed run root/tagが一回限定で、resultがinconclusiveでもretryしないこと、成功/inspect failure時の
  image tag残存とcleanup failure時のowned state残存を隠さないことを確認する。
- Ordinary sourceとcompiled outputのexact復元hash、post-restoration checksがmandatoryであることを
  確認する。復元不能時の追加Docker実行を許可しない。
- Static/unit evidenceをbuild success、built-image identity、profile binding、runtime enforcement、
  profile-control/route Observedとして扱わない。
- 新しいblocking findingがあればgateをapproveせず、別の狭いremediation promptを作る。
- Review-owned changeはreview record、status metadata、blocker時のfollow-up promptに限定する。

# Deliverables

- One-time offline-build execution gate decisionとblocking/non-blocking findings
- Source/staging/activation hashes、run/layout/tag/command/side-effect/cleanup/restoration assessment
- Standing authorizationで後続exact actionへ進めるかのdecision（別human reviewを主張しない）
- reviewed gate snapshot identityとremaining limitations
- `docs/reviews/m4-execution-profiles-offline-build-execution-gate.md`
- M4/exact-input/milestone/architecture status metadataの最小更新
- approve時は次taskを`prompts/m4-execution-profiles-offline-build-execution.md`によるexact one-time
  execution、blocker時は狭いremediationとして記録

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
`npm run m4:verify:evidence`は実行しない。Temporary activationを適用せず、Docker/runtime access、
image build、profile binding、control executionを行わない。

# Completion report

- Review decision、findings、remaining limitations
- Source/staging/activation hashesとexact gate boundary
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container commandsと理由
- Changed files（原則review record/status metadataのみ）
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを
  使用していないこと
