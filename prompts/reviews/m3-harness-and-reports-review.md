# Goal

M3 harness/report implementationを、実装意図ではなくapproved milestone、architecture、experiment protocol、diff、verification evidenceに基づいて独立にreviewし、blocker、non-blocking finding、limitations、gate decisionを記録する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM3定義
- `docs/codex-workflow.md`
- `docs/experiment-protocol.md`
- `docs/experiment-matrix.md`
- `docs/architecture.md`
- `prompts/m3-harness-and-reports.md`

# Scope

- `packages/lab-cli/**`
- `scenarios/m3-synthetic-collector.json`
- M3に関係するroot scripts、workspace metadata、documentation差分
- raw segment不変性、manifest-context再validation、deterministic merge、global sequence、summary/comparison/hash evidence
- missing/timeout/partial/corrupt runのfail-closed semantics
- fixed scenario/output boundary、import safety、dependency direction、raw-data policy
- raw inputからderived outputを第三者が再生成できるか

# Out of scope

- Findingの修正
- M2 adapter、M2-A container evidence transfer、M4 profile、M5 artifact pipelineの実装
- adapter local outputまたはexperiment-matrix Observedの生成・昇格
- external network、real credential、Docker socket、host lifecycle execution

# Constraints

- Reviewは実装sourceを変更しない
- ExpectedとObservedを補正しない
- Test passだけでruntime isolation、reproducibility、schema completenessを推定しない
- Severity、acceptance impact、reproduction/evidence、required follow-upをfindingごとに明記する
- Blockerがあればgateをapproveしない

# Deliverables

- `docs/reviews/m3-harness-and-reports.md`
- blocker/non-blocking finding一覧
- acceptance criteriaに対するevidenceとgap
- independent review gate decision

# Verification

```sh
npm run m3:verify
npm run verify:static --workspace packages/probe-core
npm run check
git diff --check
git status --short
```

# Completion report

- Review decision
- Findings with severity and evidence
- Commands run and observed results
- Remaining limitations
- Follow-up task boundary
- External network、real credential、Docker socket、host lifecycle executionを使用していないこと
