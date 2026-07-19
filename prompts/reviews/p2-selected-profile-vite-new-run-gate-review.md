# Goal

新しい固定`20260719-02` Vite tuple/container-name bindingと、P2-V04/P2-V05/P2-V06 closureを
保持したcandidateをfresh independent Docker-non-executing reviewする。Exact staging、absent new
result roots、one-command/no-retry boundaryを独立照合し、別の一回限定
`npm run p2:execute:vite` gateを承認またはblockする。このreviewではDockerを実行しない。

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/presentation-evidence-inventory.md`
- `docs/p2-selected-profile-contract.md`
- `docs/reviews/p2-selected-profile-vite-runner.md`
- `docs/reviews/p2-selected-profile-vite-executor.md`
- `docs/reviews/p2-selected-profile-vite-failure.md`
- `docs/product-requirements.md`
- `docs/milestones.md`のPresentation MVP / P2 section
- `docs/codex-workflow.md`
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- `prompts/p2-selected-profile-vite-new-run-gate.md`
- このprompt

# Scope

- Implementation promptのrequired base hashesとcandidate diffの独立照合
- Exact `p2-vite-observe-p/c-20260719-02` tupleと、permissive/constrained profileの対応
- Exact `tskaigi-p2-vite-observe-p/c-20260719-02` nameがcreate/inspect/start/removeでcross-bound
  され、旧container name/stateのinspect/remove/reuseを必要としないこと
- M2-D context、runner、projection、plan、executor、attempt/receipt/pair identityの同一tuple binding
- Exhausted `20260719-01` IDsのactive binding rejectionとhistorical recordの不変性
- Codegen plan/binding/receipts/projectionが変更されていないこと
- P2-V04/P2-V05/P2-V06 closure boundaryとfocused behavioral regressionの維持
- Exact 128-file source-equal fixed-mode staging、logical manifest、fixed tool versions、candidate hashes
- Exact two new result rootsのabsenceを、親directory enumerationなしで独立確認
- Argument-free package command、one-pair/one-time/no-retry/receipt-review semantics
- Gate decision、findings、reviewed snapshot identity、next taskの記録

# Out of scope

- Candidate implementationの修正。Blocking findingは別のbounded remediationへhandoffする
- `npm run p2:execute:vite`またはその他のDocker/container command、runtime socket access
- Exhausted result rootsまたは旧Docker container stateのread/stat/enumeration/mutation/recovery/retry
- New result rootsの作成、runtime evidence、receipt/attempt、Observed/matrix promotion
- Expected contract、accepted codegen Observed、M4/P3/P4、external network、credential、remote Git、
  publication、deployment、third-party communication

# Constraints

- Promptやimplementation recordからhash/test結果をcopyするだけでapproveせず、candidate bytes、
  active tuple rejection/acceptance、staging manifestをindependently reproduceする。
- New rootsは次のexact pathsだけをabsence-checkし、`results/runs/**`やignored statusを列挙しない。

  - `results/runs/p2-selected-profiles/p2-vite-observe-p-20260719-02`
  - `results/runs/p2-selected-profiles/p2-vite-observe-c-20260719-02`

- Static/unit evidenceをDocker availability、container cleanup、offline/non-root enforcement、probe outcome、
  receipt、same-image pair、selected profile/matrix Observedとして扱わない。
- Approveする場合、standing authorizationが適用できるexact actionはargument-free
  `npm run p2:execute:vite`の一回だけであると記録する。これは別human reviewを意味しない。
- Nonzero、failure、inconclusive、partial resultでも同じgateをretryしない。Old run IDs、alternate
  run ID/name、別Docker commandへ読み替えない。
- Runtime結果は後続workerがcanonical attempt/receipt、bounded entry projection、exit status、root stateを
  outcomeどおり保持する。Receiptがあってもfresh Docker-free review前にObservedへ昇格しない。
- Review-owned changeは`docs/reviews/p2-selected-profile-vite-new-run-gate.md`とauthoritative
  status/handoff metadataだけに限定する。Findingをreview中に修正しない。

# Deliverables

- APPROVEDまたはBLOCKEDのindependent gate decisionとfindings
- Candidate source/test/entry/package hashes、exact staging identity、tool versions、new-root absence evidence
- Old/new tupleとcontainer-name cross-binding、codegen non-change、P2-V04/V05/V06 closure assessment
- Approve時はstanding authorizationで実行できるexact one-command/one-attempt boundary
- `docs/reviews/p2-selected-profile-vite-new-run-gate.md`
- P2/presentation milestone/scope/inventory status metadataの最小更新
- Approve時はfresh workerのexact one-time execution、block時は一つのbounded remediationをnextに指定

# Verification

```sh
npm run m2d:verify
npm run p2:verify
npm run p2:build
npm run check
git diff --check
git status --short
```

Focused Vite context/plan/runner/projection/executor/staging tests、compiled import-safety、candidate
SHA-256、Docker-free staging byte/mode/version/manifest assertion、exact new-root absence checkも実行し、
commandとobserved resultを記録する。

`npm run p2:execute:vite`、Docker/container command、runtime socket、retained-root accessは実行しない。

# Completion report

- Gate decision、findings、reviewed snapshot identity、remaining limitations
- Commands run、exit status、test counts、hash/staging/root-absence observations
- Docker、retained state、network、credentials、remote Gitを使用していないこと
- Changed files
- Approve/blockに対応する一つのconcrete next task
