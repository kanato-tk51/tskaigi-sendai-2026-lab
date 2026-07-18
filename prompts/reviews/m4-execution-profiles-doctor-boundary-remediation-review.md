# Goal

M4 fixed doctor boundary B-08〜B-10 remediationを独立にread-only re-reviewし、same-image identity binding、canonical doctor output、unambiguous key-only environment projectionがstatic/unit境界でclosureしたかを判断する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/reviews/m4-execution-profiles-doctor-boundary.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-exact-input-contract.md`
- `prompts/m4-execution-profiles-doctor-boundary.md`
- `prompts/reviews/m4-execution-profiles-doctor-boundary-review.md`
- `prompts/m4-execution-profiles-doctor-boundary-remediation.md`

# Scope

- B-08: environment inventoryとstep 2のlocal image ID/repository digest/OS/architecture binding
- B-09: runtime/image/environment structured outputのexact canonical byte validation
- B-10: structured/escaped key-only projection、one-entry/one-key framing、control-character/delimiter rejection
- fixed 3 command ID、runtime brand、absolute executable/argv、no pull/build/create/start/run regression
- host backend、import safety、orchestrator `M4_EXECUTION_NOT_APPROVED` regression
- reviewed snapshot identity、source/test evidence、gate decision、remaining limitations

# Out of scope

- implementation sourceの修正
- doctor、Docker/container command、runtime socket access、image inspect/build/pull、package installの実行
- local image/runtime/host environmentの列挙
- N-01/N-02のremediation
- `profile.json`、accepted image-input、built-image digest、runtime enforcement、Observed evidenceの作成
- M4 Expected outcome、ADR-0001、experiment-matrix Expected/Observedの変更
- M5以降、publication、commit、remote Git

# Constraints

- Test fixtureがmatching identityを渡す慣例だけでなく、production parserがstep 2/3の全identity fieldをcross-validateすることを確認する。
- Canonical validationがUTF-8/JSON parseとexact-key checkだけでなく、validated plain snapshotの再serializationとraw byte identityを要求することを確認する。
- Environment formatがraw `Config.Env` entry/valueをJSON化せず、delimiter前のkeyだけをescaped array elementとして出力し、missing delimiterを固定invalid markerへ変換することを確認する。
- Embedded LF/CR/NUL、delimiter-bearing/empty/duplicate/canary key、noncanonical/duplicate-member JSONがaccepted inventoryにならないことを確認する。
- Existing positive、mismatch、timeout、output、cleanup、unbranded command、import/orchestrator regressionを確認する。
- Static/unit gateとdoctor execution approval、runtime enforcement gateを別々に判断する。
- Findingの修正はreview session内で行わず、新しいblocking findingがあれば別promptへhandoffする。

# Deliverables

- B-08〜B-10 closure decision
- command/parser/key-projection source evidenceとnegative test evidence
- fixed doctor static/unit gate decision
- blocking/non-blocking findings、remaining limitations、reviewed snapshot identity
- doctor execution/runtime gateが未承認・未実行であることの明記
- review record/status metadataの最小更新

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Doctor executionはre-review後にもhumanの明示的承認が必要な別stepである。

# Completion report

- Review decision、B-08〜B-10、remaining limitations
- Source/test evidence、commands、exit status、test counts
- Changed files（原則review record/status metadataのみ）
- Doctor/runtime evidenceをreviewしなかった理由
- Expected/Observed分離
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
