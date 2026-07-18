# Goal

M4 static/unit implementation reviewのB-01〜B-06を、承認済みExpected契約とADR-0001を変更せずにremediationし、immutable input、same-target scratch、same-image/pair identity、full inspection、canonical evidence semantics、inconclusive run validityをruntime実行前にfail closedで確立する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/reviews/m4-execution-profiles-contract.md`
- `docs/reviews/m4-execution-profiles.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles.md`

# Scope

- `containers/profile-control/**`
- 必要なruntime-policy説明に限る`containers/permissive/**`、`containers/constrained/**`、`profiles/**`
- B-01: read-only immutable control input、container非書込のhost inspection/completion、byte/digest/identity binding
- B-02: result/sourceと分離した同一logical scratch targetと、profileごとのruntime exposure
- B-03: staging inventory/digest、単一approved image inputからのprofile pair、別run ID/別writable state
- B-04: security-relevant Docker create stateの完全なpre-start projectionとnegative test
- B-05: shared-buffer/canonical serialization境界とcontrol/outcome/reason semantic validation
- B-06: Dockerを呼ばずに検証できるbounded executor state machine、transfer/cleanup、first-failure、inconclusive result
- 必要最小限のroot script/config/documentation wiring
- remediation完了後の`prompts/reviews/m4-execution-profiles-remediation-review.md`

# Out of scope

- M4 Expected値、ADR-0001、experiment-matrix route Expected/Observedの変更
- M1/M2/M3 sourceまたはadapter/profile routeの変更
- `profile.json`または実base/image digestの選定
- Docker/container command、runtime socket access、image build/pull、package install
- external network、real credential、host home、SSH agent、runtime socketのcontainerへの公開
- M5以降、publication、commit、remote Git

# Constraints

- FindingをExpected変更、manifest skip、別target、result channel reuseで回避しない
- Control manifestはcontainer write authority外のimmutable inputとし、accepted bytes/identityをcompletionへbindする
- Host inspection/completionはcontainer内evidenceと独立したhost-owned channelに置く
- Scratchは両profileで同じlogical targetを実際にattemptし、result/evidenceとsource mutationから分離する
- Pair validatorは同じimage、Node、fixture/control bytes、order、timeout、resource limitを要求し、run IDとwritable stateは別にする
- Staging digestを未使用metadataにせず、exact file inventoryとcanonical byte digestを検証する
- Full inspectはdevice request、runtime selectionを含むsecurity-relevant stateの未検査fieldを残さない
- Canonical parserはshared backing storageを拒否またはimmutable copyし、public serializerはvalidated snapshot以外をserializeしない
- Evidence schemaはExpected mismatchを許しつつ、control/outcome/reasonとして不可能な組合せをmalformedとして拒否する
- Missing、invalid、timeout、output limit、transfer、cleanup failureを0件またはcompleteへ変換せずinconclusiveにする
- Executorのcommand construction/state machineはfake executorでtestし、実Docker accessは引き続き`M4_EXECUTION_NOT_APPROVED`より先へ進めない
- Raw canary/payload、host absolute path、stdout/stderr、error/stack、credential、runtime-socket detailをresultやtest snapshotへ保存しない

# Deliverables

- B-01〜B-06それぞれのproduction remediationとfocused positive/negative test
- immutable input、host-owned inspection/completion、container-owned evidenceの明示的data flow
- same-target scratch policyと完全なinspect projection
- pair-level image/staging/run identity validator
- canonical/semantic evidence hardening
- bounded fake-executor integration testsとexplicit inconclusive result
- fail-closedのままのorchestrator entry
- `prompts/reviews/m4-execution-profiles-remediation-review.md`
- review record/statusのremediation実装済み・再review待ちへの最小更新

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

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:run:controls`、`npm run m4:verify:evidence`は実行しない。Docker runtime inputと実行承認はremediation re-review後の別taskである。

# Completion report

- Changed files
- B-01〜B-06ごとの修正とtest evidence
- Commands run、exit status、observed test counts
- 実行しなかったcontainer commandsと理由
- Static/unit acceptance criteria、remaining runtime limitations
- Expected/Observed mismatchとinconclusive semantics
- Docker、external network、credential、host home、runtime socket、host lifecycle、remote Gitを使用していないこと
