# Goal

M4 fixed doctor boundary independent reviewのB-08〜B-10だけをremediateし、base environment key inventoryを同一のlocal immutable image identityへbindし、全doctor outputをcanonicalかつunambiguousなsanitized projectionとしてfail closedに検証する。Dockerは実行せず、orchestratorの未承認gateを維持する。

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

# Scope

- `containers/profile-control/src/doctor.ts`と必要最小限のdoctor専用type/constant
- `containers/profile-control/test/doctor.test.ts`とdoctor static/import negative test
- B-08のsame-image identity binding
- B-09のcanonical byte validation
- B-10のstructured key-only environment projectionとunambiguous framing
- doctor remediation専用の独立read-only re-review prompt
- M4 status metadataの最小更新

# Out of scope

- doctor、Docker/container command、runtime socket access、image inspect/build/pull、package installの実行
- production backendの有効化、arbitrary command/path/option、host environmentの列挙
- `profile.json`、accepted image-input、built-image digestの作成
- runtime enforcement、profile-control Observed、adapter/profile route、experiment-matrix Observedの変更
- 既に承認済みのM4 static/unit profile-control sourceの再設計
- N-01/N-02、M5以降、publication、commit、remote Git

# Constraints

- Doctor command IDは`runtime-version`、`base-image-identity`、`base-environment-keys`の3つだけを維持し、pull/build/create/start/runへ到達させない。
- `base-environment-keys` observationはraw environment valueを一切出力せず、同じobservation内にsanitization済みlocal image ID、repository digest、OS、architectureを含める。Step 2でacceptしたidentityと全fieldをcross-validateし、drift時はinventoryを作らない。
- Environment projectionはstructured/escaped key-only arrayとし、1つのraw image environment entryが複数keyへ分裂しないことを検証する。Control character、embedded LF/CR/NUL、missing delimiter、empty/invalid/duplicate/canary keyをrejectする。
- Runtime version、image identity、environment inventoryの各structured outputは、UTF-8 decodeとschema validation後にexact canonical serializationと元byteを比較する。Whitespace、key order、duplicate JSON member、trailing dataをacceptしない。
- Negative test fixtureやsnapshotにもraw environment valueを保存しない。Raw-value leakを検査する場合は固定invalid markerまたは構造的にsanitizedされたsynthetic key representationだけを使う。
- Fixed absolute executable、runtime command brand、`shell: false`、no inherited host environment、disposable `DOCKER_CONFIG`、timeout、combined output limit、stderr/raw error discard、cleanup fail-closedを維持する。
- Orchestrator entryはproduction backendを生成せず、Docker access前に`M4_EXECUTION_NOT_APPROVED`を返し続ける。
- Static/unit passをdoctor availability、runtime enforcement、profile-control Observed、route Observedとして扱わない。

# Deliverables

- B-08を閉じるsame-image identity cross-binding
- B-09を閉じるcanonical byte parserとnoncanonical/duplicate-member negative test
- B-10を閉じるunambiguous structured key-only projectionとdelimiter/control-character negative test
- existing positive、mismatch、timeout、output、cleanup、unbranded-command regression test
- `prompts/reviews/m4-execution-profiles-doctor-boundary-remediation-review.md`
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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Doctor executionはremediationの独立read-only re-review後にもhumanの明示的承認を必要とする別stepである。

# Completion report

- Changed files
- B-08〜B-10ごとのsource/test evidence
- Commands run、exit status、observed test counts
- 実行しなかったDocker/container commandsと理由
- Expected/Observed分離とremaining doctor/runtime limitations
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
