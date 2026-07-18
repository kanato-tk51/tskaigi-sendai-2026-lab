# Goal

M4 exact-input proposalを、accepted doctor inventory、repository staging bytes、承認済みstatic/unit境界、安全正本に照らして独立にread-only reviewし、base/staging/backend contract gateのdecisionを記録する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/reviews/m4-execution-profiles-contract.md`
- `docs/reviews/m4-execution-profiles.md`
- `docs/reviews/m4-execution-profiles-remediation.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/reviews/m4-execution-profiles-doctor-boundary.md`
- `docs/reviews/m4-execution-profiles-doctor-boundary-remediation.md`
- `docs/reviews/m4-execution-profiles-doctor-canonical-bytes-remediation.md`
- `docs/reviews/m4-execution-profiles-runtime-template-compatibility.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles.md`
- `prompts/m4-execution-profiles-remediation.md`
- `prompts/m4-execution-profiles-input-binding-remediation.md`
- `prompts/m4-execution-profiles-exact-input-contract.md`

# Scope

- `containers/profile-control/image-input.json`のexact keys、base digest、Node version、ordered key-only environment inventory
- accepted doctor observationからversioned inputへのtraceとidentity consistency
- `Containerfile`と固定fixture 3 filesのrepository bytes、per-file size/SHA-256、ordered aggregate digestの独立再計算
- `validateVersionedImageInput()`、accepted snapshot binding、static verifier、focused positive/negative test
- fixed `/usr/bin/docker`、Docker `29.6.1`、credential-empty `DOCKER_CONFIG`、`shell: false`、fixed argv/layout、timeout/output/transfer/cleanup proposal
- offline build前後、built-image/profile binding、control executionを分離するgate sequence
- Expected/Observed分離、通常orchestratorのfail-closed状態、review対象snapshot identity

# Out of scope

- review中のimplementation/input source修正、M4 Expected契約またはADR-0001の変更
- Docker/container command、runtime socket access、image inspect/build/pull/create/start/run、package install
- production backendの有効化、built-image digestまたは`profile.json`の作成
- runtime enforcement、profile-control Observed、adapter/profile route、experiment-matrix Observedの生成・承認
- M5以降、publication、commit、remote Git

# Constraints

- doctor recordのsanitized observationとrepository bytesを独立に照合し、synthetic/placeholder/M0 Node.js 24 inputを受理しない
- JSONのexact-key validationだけでなく、valid-looking digest、environment inventory、staging inventoryのsubstitutionがfail closedであることを確認する
- Base environmentはkey名だけで、raw value、host environment、credential、host absolute pathがversioned input、public snapshot、test snapshotにないことを確認する
- Host backend proposalがarbitrary executable/argv/path/environment/image/runtime optionを受けず、runtime socketをexperiment containerへmount/forwardしないことを確認する
- Base/staging/backend review、build approval、built-image/profile binding review、control execution approvalを別々にdecisionする
- Static/unit passをruntime enforcement、profile-control Observed、route Observedとして承認しない
- 新しいblocking findingを発見した場合はgateをapproveせず、別remediation promptを作成する
- Review-owned changeは`docs/reviews/m4-execution-profiles-exact-input-contract.md`、status metadata、必要なfollow-up promptに限定する

# Deliverables

- Exact-input contract gate decisionとblocking/non-blocking finding一覧
- doctor-to-input trace、base identity、environment inventory、staging inventory/digestのassessment
- validator/static/test evidenceとhost backend/gate sequencing assessment
- reviewed snapshot identityとremaining limitations
- `docs/reviews/m4-execution-profiles-exact-input-contract.md`およびM4 status metadataの最小更新
- blockerがある場合のみ、狭いfollow-up remediation prompt

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Docker access、build、control executionはこのread-only reviewとは別gateである。

# Completion report

- Review decision、findings、remaining limitations
- Exact base/environment/staging evidenceと独立再計算結果
- Commands run、exit status、observed test counts
- Built image、`profile.json`、runtime evidenceをreviewしなかった理由
- Changed files（原則review record/status metadataのみ）
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
