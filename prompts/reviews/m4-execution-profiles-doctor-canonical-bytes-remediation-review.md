# Goal

M4 fixed doctor boundaryのB-09 canonical-byte remediationを独立にread-only re-reviewし、validated canonical JSONとsingle final LFのencoded bytesがoriginal response `Uint8Array`とexactに一致する場合だけ、3 structured doctor outputをacceptすることをstatic/unit境界で確認する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/reviews/m4-execution-profiles-input-binding-remediation.md`
- `docs/reviews/m4-execution-profiles-doctor-boundary.md`
- `docs/reviews/m4-execution-profiles-doctor-boundary-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-exact-input-contract.md`
- `prompts/m4-execution-profiles-doctor-boundary.md`
- `prompts/reviews/m4-execution-profiles-doctor-boundary-review.md`
- `prompts/m4-execution-profiles-doctor-boundary-remediation.md`
- `prompts/reviews/m4-execution-profiles-doctor-boundary-remediation-review.md`
- `prompts/m4-execution-profiles-doctor-canonical-bytes-remediation.md`

# Scope

- B-09: runtime version、image identity、environment snapshotのoriginal response bytesとcanonical encoded bytesのexact identity
- 3 structured outputすべてのleading UTF-8 BOM rejection
- whitespace、key-order、duplicate-member、trailing-data、invalid UTF-8、missing LF rejectionとcanonical positive regression
- B-08のstep 2/3 same-image identity cross-bindingとB-10のstructured key-only projection regression
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

- TextDecoder後のstring一致だけでなく、validated plain snapshotを`JSON.stringify()`しsingle final LFを加えた`TextEncoder` bytesとoriginal `Uint8Array`のlengthおよび全byteを比較することを確認する。
- Leading bytes `EF BB BF`を付けたruntime version、image identity、environment snapshotがすべて`INVALID_OUTPUT`となり、accepted inventoryを作らないことを確認する。
- B-08のidentity全field cross-validationとB-10のraw-value-free structured key-only array、control-character/delimiter rejectionが変更されていないことを確認する。
- Existing positive、mismatch、timeout、output、cleanup、unbranded command、import/orchestrator regressionを確認する。
- Static/unit doctor gateとdoctor execution approval、runtime enforcement gateを別々に判断する。
- Findingの修正はreview session内で行わず、新しいblocking findingがあれば別promptへhandoffする。
- Review-owned changeは`docs/reviews/m4-execution-profiles-doctor-canonical-bytes-remediation.md`、status metadata、必要なfollow-up promptに限定する。

# Deliverables

- B-09 closure decisionとfixed doctor static/unit gate decision
- original-byte comparatorと3 leading-BOM negative testのsource/test evidence
- B-08/B-10およびfixed doctor safety boundaryのregression assessment
- blocking/non-blocking findings、remaining limitations、reviewed snapshot identity
- doctor execution/runtime gateが未承認・未実行であることの明記
- `docs/reviews/m4-execution-profiles-doctor-canonical-bytes-remediation.md`とstatus metadataの最小更新

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

- Review decision、B-09、B-08/B-10 regression、remaining limitations
- Source/test evidence、commands、exit status、test counts
- Changed files（原則review record/status metadataのみ）
- Doctor/runtime evidenceをreviewしなかった理由
- Expected/Observed分離
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
