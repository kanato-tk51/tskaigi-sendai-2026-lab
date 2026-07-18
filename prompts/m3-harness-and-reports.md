# Goal

M3として、versioned scenario inputとclosed producer segmentをtool非依存に検証・集約し、immutableなraw segmentからdeterministicなcanonical JSONL、run metadata、JSON summary、Markdown comparison、hash evidenceを再生成できるfixed harness/report packageを実装する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM3定義
- `docs/codex-workflow.md`
- `docs/experiment-protocol.md`
- `docs/experiment-matrix.md`
- `docs/architecture.md`

# Scope

- `packages/lab-cli/**`
- `scenarios/**`
- M3 result schema/report tests
- M3用の必要最小限のroot `package.json` scriptとlockfile workspace metadata
- M3実装と直接整合させるために必要な最小documentation link

`docs/milestones.md`で承認されたfixed input/output contract、deterministic ingestion order、`lab-canonical-event/v1` envelope、run validity/report semanticsを実装する。Repository-owned synthetic producer segmentsだけでcollector/reducerを検証し、adapter integration runやexperiment-matrix Observedを生成しない。

# Out of scope

- `probe-event/v2`またはM2 adapter contractの変更
- M2-A lifecycleのpack/install/run、container evidence-transfer workaround
- permissive/constrained profile enforcementまたはObserved生成
- experiment-matrix Observed欄、`results/examples/**`、evidence mapの更新
- artifact pipeline
- external network、real credential、host home、Docker socket
- arbitrary command、argv、cwd、module path、output pathを受けるrunner
- invalid segmentのpartial recovery

# Constraints

- TypeScript strict modeを維持する
- `lab-cli`はimport時にside effectを開始しない
- Tool packageをruntime importせず、fixed adapter runner contractだけへ依存する
- Scenario IDからversion controlされたdefinitionを選び、user提供command/path/moduleを実行しない
- Producer segmentは対応manifest snapshotで`probe-event/v2`を再validationし、unknown fieldを削除して採用しない
- Raw segmentをbyte-for-byte変更しない
- Missing、timeout、partial、invalid segmentを0 invocationにしない
- ExpectedとObservedを同じfileまたは更新経路で変更しない
- Global sequenceをcausal/real-time orderとして表現しない
- Raw canary、absolute path、content、diff、raw error/stack、stdout/stderr、executable path、loopback bodyをderived outputへ保存しない
- Existing user changesを保護し、最小のcoherent changeとrelevant testに限定する

# Deliverables

- private ESM package `packages/lab-cli`
- versioned scenario definition、canonical event、run metadata、summary、hash evidence schema
- fixed scenario dispatch、collector、reducer、JSON/Markdown renderer
- deterministic synthetic fixtures
- raw-to-derived regeneration、input permutation、partial/corrupt/missing/timeout、raw-data rejection tests
- static verifierとroot M3 scripts

# Verification

`docs/milestones.md`のM3 acceptance criteriaを満たし、実装でroot `package.json`へ同名scriptを追加してから次を実行する。

```sh
npm run typecheck --workspace packages/lab-cli
npm run build --workspace packages/lab-cli
npm run verify:static --workspace packages/lab-cli
npm run test --workspace packages/lab-cli
npm run m3:verify
npm run verify:static --workspace packages/probe-core
npm run check
git diff --check
git status --short
```

# Completion report

- Changed files
- 実装したcollector/reducer/report boundaryとscope外に残した内容
- 実行したcommand、exit status、observed result
- 実行しなかったrelevant commandと理由
- Acceptance criteriaごとのevidence
- Expected/Observed mismatch
- Safety limitationと次の小さなtask
- External network、real credential、host home、Docker socket、host lifecycle executionを使用していないこと
