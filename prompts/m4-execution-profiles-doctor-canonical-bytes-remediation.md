# Goal

M4 fixed doctor boundaryのB-09だけをremediateし、全structured doctor outputについてvalidated canonical JSON textだけでなくoriginal `Uint8Array`とのexact byte identityを要求する。先頭UTF-8 BOMを含む非canonical bytesをfail closedにし、Docker未承認gateを維持する。

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

# Scope

- `containers/profile-control/src/doctor.ts`のcanonical byte validator
- `containers/profile-control/test/doctor.test.ts`のBOM/raw-byte focused negative test
- 必要最小限のdoctor static marker/test
- canonical-byte remediation専用の独立read-only re-review prompt
- M4 status metadataの最小更新

# Out of scope

- B-08 same-image binding、B-10 environment projectionの再設計
- doctor、Docker/container command、runtime socket access、image inspect/build/pull、package installの実行
- production backendの有効化、arbitrary command/path/option、host environmentの列挙
- N-01/N-02のremediation
- `profile.json`、accepted image-input、built-image digest、runtime enforcement、Observed evidenceの作成
- M4 Expected outcome、ADR-0001、experiment-matrix Expected/Observedの変更
- M5以降、publication、commit、remote Git

# Constraints

- UTF-8/JSON/schema validation後に、validated plain snapshotのcanonical JSONとsingle final LFを`TextEncoder`でencodeし、original response `Uint8Array`とbyte-for-byte比較する。Decoded stringだけの比較をexact byte identityと扱わない。
- 先頭UTF-8 BOM `EF BB BF`を付けたruntime version、image identity、environment snapshotの3 outputをすべてrejectするnegative testを追加する。
- Existing whitespace、key-order、duplicate-member、trailing-data、invalid UTF-8、missing LF negative testとcanonical positive testを維持する。
- B-08のstep 2/3 identity全field cross-validationとB-10のstructured key-only array、control-character/delimiter rejectionを変更しない。
- Fixed 3 command ID、absolute executable/argv、no pull/build/create/start/run、host backend、import safety、orchestrator `M4_EXECUTION_NOT_APPROVED`を維持する。
- Static/unit passをdoctor availability、runtime enforcement、profile-control Observed、route Observedとして扱わない。

# Deliverables

- B-09を閉じるoriginal-byte canonical comparator
- 3 structured outputすべてのleading-BOM negative test
- existing doctor positive/negative regression test
- `prompts/reviews/m4-execution-profiles-doctor-canonical-bytes-remediation-review.md`
- 実装済み・独立re-review待ちを示すreview record/status metadataの最小更新

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Doctor executionはfresh independent read-only re-review後にもhumanの明示的承認が必要な別stepである。

# Completion report

- Changed files
- original-byte comparisonと3 BOM negative testのevidence
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container commandsと理由
- B-08/B-10 regression、Expected/Observed分離、remaining doctor/runtime limitations
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
