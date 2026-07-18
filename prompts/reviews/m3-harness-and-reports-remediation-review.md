# Goal

M3 remediationを、元のindependent reviewで記録されたB-01からB-05のclosure evidenceとapproved remediation scopeに基づいて独立に再reviewし、新しいregressionの有無とM3 gate decisionを記録する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM3定義
- `docs/codex-workflow.md`
- `docs/experiment-protocol.md`
- `docs/experiment-matrix.md`
- `docs/architecture.md`
- `docs/reviews/m3-harness-and-reports.md`
- `prompts/m3-harness-and-reports-remediation.md`

# Scope

- B-01: immutable raw segment、manifest snapshot、completion snapshotからderived evidenceをexactに再生成できること
- B-02: before/after hashがtarget単位で対応し、changed、unchanged、unavailableをfail-closedに分類すること
- B-03: Expected/Observed comparisonがcount以外のsemantic outcomeを検査すること
- B-04: Proxy、accessor、non-enumerable property、custom prototypeを含むunsafe inputをsnapshot前に拒否すること
- B-05: metadataがNode、adapter、toolのruntime identityとversion contextをproducer単位で保持すること
- remediation後のsource、tests、documentation差分に新しいblocking regressionがないこと
- M3 acceptance criteriaとoriginal finding closureのtraceability

# Out of scope

- Review中のimplementation source修正
- M4 profile、M5 artifact pipeline、adapter-specific scenarioの実装
- experiment-matrix Observedの生成または昇格
- external network、real credential、Docker socket、host lifecycle execution

# Constraints

- Reviewはimplementation sourceを変更しない
- Original findingをtest passだけでclosedにしない。source、negative tests、documentation contractを照合する
- ExpectedとObservedを補正しない
- 新しいblocking findingを発見した場合はgateをapproveせず、将来のfollow-upとして記録する
- Severity、acceptance impact、evidence、required follow-upをfindingごとに明記する
- Review-owned changesはreview prompt、review record、gate status metadataに限定する

# Deliverables

- `docs/reviews/m3-harness-and-reports-remediation.md`
- B-01からB-05のclosure table
- 新しいblocker/non-blocking finding一覧
- independent remediation re-review gate decision
- M3 milestone status metadataの更新

# Verification

```sh
npm run m3:verify
npm run verify:static --workspace packages/probe-core
npm run check
git diff --check
git status --short
```

# Completion report

- Re-review decision
- B-01からB-05のclosure evidence
- New findings and remaining limitations
- Commands run and observed results
- Follow-up task boundary
- External network、real credential、Docker socket、host lifecycle executionを使用していないこと
