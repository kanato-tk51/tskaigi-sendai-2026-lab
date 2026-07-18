# Goal

M4 exact-input contract reviewのB-11/B-12を、accepted doctor inventory、version管理されたbase/staging input、承認済みExpected契約を変更せずにremediationし、Docker `29.6.1`互換のfixed pre-start projectionと、offline build前のexact client/server version bindingをstatic/unit境界でfail closedに確立する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/reviews/m4-execution-profiles-exact-input-contract.md`
- `docs/reviews/m4-execution-profiles-runtime-template-compatibility.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-exact-input-contract.md`
- `prompts/reviews/m4-execution-profiles-exact-input-contract-review.md`

# Scope

- `containers/profile-control/**`
- B-11: Docker `29.6.1`で利用できるhelperだけを使うfixed profile pre-start inspection projection
- B-11: reviewed security-field inventory、exact-key validation、canonical/sanitized host-inspection boundaryの維持
- B-11: doctorとprofileの全fixed templateからunsupported `dict`を拒否するstatic/unit regression
- B-12: offline build直前にfixed Docker client/server `29.6.1`を両方検証するcanonical payload contract
- B-12: wrong client、wrong server、malformed/noncanonical/null/substituted payloadをbuild前に拒否するfocused negative test
- fixed `/usr/bin/docker`、credential-empty `DOCKER_CONFIG`、`shell: false`、fixed argv/layout、timeout/output/transfer/cleanup境界の維持
- ordinary orchestratorの`M4_EXECUTION_NOT_APPROVED` fail-closed状態の維持
- review/status metadataのremediation実装済み・fresh independent re-review待ちへの最小更新
- 後続の独立read-only re-review prompt

# Out of scope

- `containers/profile-control/image-input.json`、accepted base digest、Node version、base environment keys、staging files/digestの変更
- M4 Expected outcome、ADR-0001、experiment-matrix route Expected/Observedの変更
- doctorの再実行、Docker/container command、runtime socket access、image inspect/build/pull/create/start/run
- production backendの有効化、built-image digest、`profile.json`の作成
- runtime enforcement、profile-control Observed、adapter/profile route、experiment-matrix Observedの生成または承認
- M1/M2/M3、M5以降、publication、commit、remote Git

# Constraints

- B-11をinspection field削減、full raw inspect採用、host path/raw environmentの保存、runtime version変更で回避しない
- Fixed profile projectionはDocker `29.6.1`互換の`json` helperによるdirect canonical objectまたは同等にreview可能なfixed representationとし、`dict`へ依存しない
- Image、path、args、user、environment、working directory、root/network/namespace/runtime、capability/security、mount/device/port/log/resource/restart/stateの現在のreview済みprojectionをすべて維持する
- Pre-build runtime validationはclientとserverの両方をexact `29.6.1`へbindし、exit 0だけ、serverだけ、過去のdoctor recordだけを十分としない
- Runtime payloadはvalidated plain dataから固定順序のcanonical representationへ正規化し、wrong/missing/extra/duplicate/noncanonical値をbuild前にfail closedにする
- Fake backendのpositive testはexact payloadを返し、nullまたはsynthetic conventionでvalidationを迂回しない
- Arbitrary executable、argv、cwd、path、environment、image、mount、runtime optionを追加しない
- Production backendをimport/construct/enableせず、Docker accessを`M4_EXECUTION_NOT_APPROVED`より先へ進めない
- Static/unit passをexact-input adoption、build approval、runtime enforcement、Observed evidenceとして扱わない

# Deliverables

- B-11 Docker `29.6.1`-compatible fixed inspection format and full-projection regression tests
- B-12 exact client/server runtime payload validation before build and focused substitution tests
- static verifier hardening that rejects unsupported `dict` in every fixed Docker format
- accepted base/staging snapshot binding and ordinary fail-closed orchestrator regression evidence
- `prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md`
- exact-input review record/status metadataのremediation実装済み・fresh re-review待ちへの最小更新

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Docker access、image build、profile binding、control executionはfresh independent re-review後も別gateである。

# Completion report

- Changed files
- B-11/B-12ごとのimplementationとfocused positive/negative evidence
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container commandsと理由
- accepted base/staging inputが不変であること、Expected/Observed分離、remaining runtime limitations
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
