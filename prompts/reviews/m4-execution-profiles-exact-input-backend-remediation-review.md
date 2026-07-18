# Goal

M4 exact-input backend remediationを、accepted doctor inventory、version管理されたbase/staging input、承認済みExpected契約、安全正本に照らしてfresh independent read-only reviewし、B-11/B-12 closureとfixed host-backend/runtime contract gateを判断する。

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
- `prompts/m4-execution-profiles-exact-input-backend-remediation.md`

# Scope

- B-11: Docker `29.6.1`互換のfixed profile pre-start inspection formatとfull reviewed projection
- B-11: doctor/profileの全fixed Docker formatにunsupported `dict`がないことのstatic/unit regression
- B-12: offline build直前のexact client/server `29.6.1` canonical payload binding
- B-12: wrong client/server、malformed、missing/extra/duplicate/noncanonical/null/substituted payloadがbuild前にfail closedとなるfocused test
- fixed `/usr/bin/docker`、credential-empty `DOCKER_CONFIG`、`shell: false`、fixed argv/layout、timeout/output/transfer/cleanup境界
- accepted base/staging snapshot identity、通常orchestratorの`M4_EXECUTION_NOT_APPROVED`状態、Expected/Observed分離
- reviewed snapshot identity、finding closure、remaining limitation、次gateの記録

# Out of scope

- review中のimplementation、accepted input、Expected contract、ADR-0001の修正
- Docker/container command、runtime socket access、image inspect/build/pull/create/start/run
- production backendの有効化、built-image digest、`profile.json`の作成
- exact-input adoption、runtime enforcement、profile-control Observed、experiment-matrix route Observedの生成または承認
- M1/M2/M3、M5以降、publication、commit、remote Git

# Constraints

- `containers/profile-control/image-input.json`、accepted base digest、Node version、base environment keys、staging files/digestが不変であることを確認する
- Profile projectionがImage、path/args/user/environment/working directory、root/network/namespace/runtime、capability/security、mount/device/port/log/resource/restart/stateの全review済みfieldを維持することを確認する
- Pre-build commandとvalidatorがclient/server両方をexact `29.6.1`へbindし、exit 0、server-only、過去doctor record、parsed object substitutionだけでbuildへ進めないことを確認する
- Canonical payloadはfatal UTF-8、single final LF、exact key、fixed key order、exact byte identityを要求し、duplicate/noncanonical sourceを受理しないことを確認する
- Arbitrary executable、argv、cwd、path、environment、image、mount、runtime optionが追加されていないことを確認する
- Production backendがimport/construct/enableされず、Docker accessが通常の`M4_EXECUTION_NOT_APPROVED`より先へ進まないことを確認する
- Static/unit passをexact-input adoption、build approval、runtime enforcement、Observed evidenceとして承認しない
- Finding修正はこのreviewに混ぜず、blockerがあれば狭いfollow-up promptへ分離する

# Deliverables

- B-11/B-12 closure assessmentとfixed host-backend/runtime contract gate decision
- fixed format/runtime payload、安全境界、accepted input不変性のreview evidence
- reviewed snapshot identity、commands/test counts、remaining limitations
- `docs/reviews/m4-execution-profiles-exact-input-backend-remediation.md`
- M4 status metadataの最小更新
- blockerがある場合のみ狭いfollow-up remediation prompt

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Docker access、image build、profile binding、control executionはこのread-only reviewとは別gateである。

# Completion report

- Review decision、B-11/B-12 finding closure、remaining limitations
- Accepted base/environment/staging inputの不変性とfixed backend/runtime assessment
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container commandsと理由
- Changed files（原則review record/status metadataのみ）
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
