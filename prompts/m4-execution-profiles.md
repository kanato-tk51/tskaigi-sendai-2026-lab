# Goal

承認済みM4 Expected contractとADR-0001に従い、同一immutable image inputを使うpermissive/constrained profile control、fixed host orchestrator、schema/evidence validation、static/unit/integration testを実装し、manifest intentと実runtime enforcementを区別して検証可能にする。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/reviews/m4-execution-profiles-contract.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`

# Scope

- `profiles/**`の`lab-execution-profile/v1` permissive/constrained definitionとexact-key validator
- `containers/profile-control/**`のsame-image control fixture、fixed child script、schema、evidence/completion/transfer validator、host orchestrator
- `containers/permissive/**`と`containers/constrained/**`のreview可能な固定runtime-policy input
- ignored `results/runs/m4-profile-controls/**`のrun contractと必要最小限のdocumentation
- root `package.json`、lockfile、TypeScript/test configへの必要最小限のM4 wiring
- fixed Docker create/inspect/start/result-transfer/cleanup argv constructionと完全なpre-start inspection projection
- profile/control/evidence schema、negative static/unit test、Docker CLIを実行しないorchestrator command-construction test
- implementation完了後に使用する`prompts/reviews/m4-execution-profiles-review.md`

# Out of scope

- M1/M2 adapter source、M3 event/schema/collectorの変更
- npm lifecycle fixtureのpack/install/runまたはM2-A evidence-transfer boundaryの回避
- adapter/profile route run、baseline、experiment-matrix route Observed更新
- `results/examples/**`、M5 artifact pipeline、M6 evidence map/presentation data
- arbitrary image、command、argv、cwd、mount、environment、path、Docker option
- external network、image pull、package install、real credential、host home、SSH agent、runtime socketのcontainerへの公開
- commit、remote Git、publication

# Constraints

- TypeScript strict modeを維持し、import時にfilesystem、process、network、timer、Docker commandを開始しない
- Orchestrator operationは`doctor`、`build`、`run-controls`、`verify`、`clean`だけに固定し、user指定のruntime inputを受け付けない
- Docker CLI configはrunごとのdisposable stateとし、host registry credentialを読まない
- 同一image digest、Node.js version、fixture/control bytes、timeout、resource limit、control orderを両profileで共有する
- Profile差分はenvironment、canary file exposure、scratch write、fixed loopback target、child runtime policyだけに限定する
- 両profileでnon-root、read-only root、capability drop all、no-new-privileges、external networkなし、host home/credential/agent/device/runtime socketなしを維持する
- Constrained scratch/child controlは実operationの`failure`を要求し、manifest skipや未実行をdenial evidenceにしない
- Host inspectionとin-container canonical evidenceの両方が揃わなければcompleteにしない
- Raw canary/file/child/loopback payload、host absolute path、raw environment、stdout/stderr、stack/error、credential、runtime-socket detailをevidenceへ保存しない
- Expected mismatch、missing/invalid/timeout/transfer failureを保持し、profileまたはExpectedを自動補正しない
- Control evidenceをM1 producer、adapter、experiment-matrix route Observed、presentation evidenceへ昇格しない
- ContractのExpected変更が必要になった場合は実装を止め、別のExpected-contract reviewへ戻す
- `m4:doctor`、`m4:build`、`m4:run:controls`は、fixed orchestratorのstatic/unit review、locally available digest-pinned input、実行環境の明示承認が揃うまで実行しない

# Deliverables

- contract-conformant `lab-execution-profile/v1` permissive/constrained definitions and validators
- `lab-profile-control-manifest/v1` and `lab-profile-control-evidence/v1` schemas and exact validators
- same-image repository-owned harmless control fixture and fixed child target
- fixed-input host orchestrator with disposable Docker CLI config and pre-start full inspection
- bounded canonical evidence, completion, transfer validation, Expected/Observed comparison, and run validity
- static policy tests、schema/unit negative tests、command-construction tests、approved-host integration test interface
- root exact scripts: `m4:typecheck`, `m4:static`, `m4:test`, `m4:verify`, `m4:doctor`, `m4:build`, `m4:run:controls`, `m4:verify:evidence`
- `prompts/reviews/m4-execution-profiles-review.md`
- documentation/status update。Matrix route Observedとpresentation evidenceは変更しない

# Verification

Static/unit implementation verification:

```sh
npm run m4:typecheck
npm run m4:static
npm run m4:test
npm run m4:verify
npm run check
git diff --check
git status --short
```

次はfixed orchestratorのreview、locally available digest-pinned input、実行環境の明示承認がすべて揃った場合だけ、別の明示的なcontainer execution stepとして実行する。条件が欠ける場合は未実行理由を報告し、成功扱いしない。

```sh
npm run m4:doctor
npm run m4:build
npm run m4:run:controls
npm run m4:verify:evidence
```

# Completion report

- Changed files
- 実装したprofile/control/orchestrator/evidence boundary
- Commands run、exit status、observed test counts/results
- 実行しなかったcontainer commandと理由
- Acceptance criteriaごとのevidence
- Expected/Observed mismatch、inconclusive run、remaining limitations
- Human approvalまたは追加reviewが必要な事項
- External network、credential、host home、runtime socket exposure、host lifecycle、remote Gitを使用していないこと
