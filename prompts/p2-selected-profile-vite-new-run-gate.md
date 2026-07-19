# Goal

P2-V04/P2-V05/P2-V06 closure後のreview済みVite snapshotだけを基礎に、exhausted
`20260719-01` attemptを一切再利用せず、新しい固定run IDと旧名を再利用しない固定container nameへ
`vite-observe-p/c`をDocker非実行で再bindする。Exact stagingとstatic/unit evidenceを再構築し、
後続のfresh independent reviewが別の一回限定`npm run p2:execute:vite` gateを承認または
blockできるcandidateを作る。このtask自体ではDockerを実行せず、execution authorityを
成立させない。

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
- このprompt

# Scope

- Vite pairだけを次のexact tupleへ変更する。

  | Scenario | Profile | New run ID | New container name |
  |---|---|---|---|
  | `vite-observe-p` | `permissive` | `p2-vite-observe-p-20260719-02` | `tskaigi-p2-vite-observe-p-20260719-02` |
  | `vite-observe-c` | `constrained` | `p2-vite-observe-c-20260719-02` | `tskaigi-p2-vite-observe-c-20260719-02` |

- `containers/presentation-profiles/src/plan.ts`、Vite executor、Vite runner、
  Vite projection、M2-D selected contextのexact bindingを同じtupleへ更新する。
- 対応するfocused testsを更新し、exhausted `20260719-01` IDsが実行可能なselected tupleとして
  受理されないこと、新container namesがcreate/inspect/start/removeの全commandで一致することを
  behaviorally確認する。
- Codegenのscenario/run IDs、container names、receipts、projection、stagingを変更しない。
- P2-V04/P2-V05/P2-V06で承認されたattempt-before-evidence、partial lifecycle retention、
  serial preflight、`partially-inspected`、settlement/cleanup barrierを維持する。
- `npm run p2:stage:vite`でexact 128-file source-equal fixed-mode stagingを再構築し、
  logical-path/file-hash manifestと固定tool versionsを記録する。
- 新しい2 result rootsが実装前後ともabsentであることをexact path checkだけで確認する。
- Candidate source/test/entry/package hashes、verification結果、次のreview handoffをstatus文書へ記録する。

# Out of scope

- `npm run p2:execute:vite`、その他のDocker/container command、runtime socket access
- exhausted `p2-vite-observe-p-20260719-01`または
  `p2-vite-observe-c-20260719-01`のread、stat、enumeration、chmod、move、delete、recovery、retry
- Docker内に残り得る旧container name/stateのinspect、remove、rename、reuse
- 新しいresult rootの事前作成、receipt/attemptの作成、Observed取得
- Expected、`experiment-matrix.md` Observed、accepted codegen Observedの変更
- caller-selected run ID、container name、image、command、argument、mount、path、environment、
  network/runtime optionの追加
- M4 retained state/recovery、P3 artifact demo、P4 evidence map、external network、credential、
  remote Git、publication、deployment、third-party communication

# Constraints

## Required base snapshot

変更前に、P2 residual re-reviewが承認した次のbytesを再計算する。1つでも不一致なら、
新run-ID candidateを実装せずfresh reviewへ戻す。

| Target | Required SHA-256 |
|---|---|
| `containers/presentation-profiles/src/vite-executor.ts` | `f8bda03cbb2e6482ee9d119d8e9fd35c7fed7b4dbb3644e7a17117e662385508` |
| `containers/presentation-profiles/test/vite-executor.test.ts` | `51d2210c5b0989ecf4d8c7518a5a45bc0e0f22dc002896595a1f1bddf6238958` |
| `containers/presentation-profiles/runner/vite-executor-entry.js` | `daeee923a7887fc7747c39058a5d59a4b02bdcca55a3692653b2980d16d02dc9` |
| `containers/presentation-profiles/runner/vite-executor-entry.d.ts` | `1246122cc5cbda3b9a50872e3f25451aecfb0e9df4b2103718564b4d86532e10` |
| `containers/presentation-profiles/runner/vite-runner.js` | `9031bcb622e2919b47df939f8a00ba851efdbb952a40334a1a2b0313eaff9bfb` |
| `containers/presentation-profiles/runner/vite-runner.d.ts` | `3c652818985523d940defffe8b6045dc53005ffb0d95df48c9b9941f7c042648` |
| `containers/presentation-profiles/test/vite-runner.test.ts` | `6841a1fa99c0ae56cf092b35227814c30268dc15a24565a55e9e7227e948b630` |
| `containers/presentation-profiles/src/vite-projection.ts` | `473a0d5aae5bc32e16fc99982224f4339f344645b7c40e20db469a0a242f785c` |
| `containers/presentation-profiles/runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `containers/presentation-profiles/test/vite-staging.test.ts` | `b7a4a5bde14dfb093da8882f37667f099fe9f0c7b469695f9f5059be9c42d0d0` |
| `containers/presentation-profiles/src/plan.ts` | `77c91efb1e7af9259aa040f8b3bafc77ca2afb299a61c920b07b69baeaa5dec5` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `fe6aaf00b470387a58b7199f60906345c490cc5ce3702c41d00c00f0f57994f6` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `94c472594298e93f501865d2d504378fe30385dd5996ebe0b2df5ab714809536` |
| `containers/presentation-profiles/test/vite-projection.test.ts` | `ce621ddd550275363f0bed7d3e81c3cd5116b7adfe7656d0935c320e8d2c0c4a` |
| `containers/presentation-profiles/test/plan.test.ts` | `63e5089998f699a565d49e43bc943e8d46e4dc2b20b6bf2625c38f6c993b5bd8` |
| Root `package.json` | `c6b03db42cc15fabc477663eb394a6c221f73a20a88e31293a9e968ad7f9ef82` |

Current authoritative staging identity is exactly 128 regular non-symlink files, every target
source-equal with its declared `0444` or `0555` mode, plan-order manifest
`e1f83e220d80f51168a4e9335001fa08b92b29c2a4530c7e0115857e173c6a27`,
Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.

## New identity and no-retry boundary

- The new IDs and container names above are constants, not caller input. The Vite create plan and
  executor follow-up commands must use exactly the same new container name. Codegen names stay byte-for-byte
  semantically unchanged.
- Both new result roots must be absent before implementation, after staging, at review, and immediately before
  any later execution. Check only the two exact new paths; do not enumerate `results/runs/**`.
- The old IDs remain historical exhausted evidence identifiers and must be rejected by active Vite
  context/runner/projection/executor bindings. Do not rewrite historical documentation or retained paths.
- An existing authoritative `staging/vite` tree may not be deleted or overwritten. Verify its recorded
  identity first, verify
  `containers/presentation-profiles/staging/vite.pre-p2-new-run-e1f83e22` is absent, move it intact to that
  exact ignored repository-local backup, then run the argument-free staging command. Do not touch any
  retained result root.
- This implementation produces a gate candidate only. Standing authorization is not used, and
  `npm run p2:execute:vite` remains prohibited until a fresh independent review records an APPROVED decision,
  candidate hashes, exact staging identity, and both absent new roots.

## Proposed later exact execution gate

If and only if the fresh review approves the candidate, a later fresh worker must reproduce the approved
hashes, exact staging identity, exact two new absent result roots, and argument-free package script. It may
then use `continue-repository-work` standing authorization to invoke exactly once:

```sh
npm run p2:execute:vite
```

That command is one ordered permissive/constrained pair attempt. It is never retried, including on nonzero,
failure, or inconclusive output. It authorizes no other Docker command, old-state inspection/removal, direct
runtime-socket access, codegen rerun, M4 access, external network, publication, or Observed promotion. Any
candidate receipt requires a later fresh Docker-free receipt review before selected Vite Observed acceptance.

# Deliverables

- Exact new Vite tuple/container-name binding and focused regression coverage
- Rebuilt exact Vite staging tree, manifest, tool versions, and candidate hashes
- Evidence that the old run IDs are not active selected bindings and codegen bindings remain unchanged
- Evidence that both new fixed result roots are absent without enumerating retained result directories
- `docs/p2-selected-profile-contract.md` and presentation milestone/scope/inventory status handoff updates
- A review-ready candidate explicitly marked Docker-non-executing and not yet approved for execution

# Verification

Run only Docker-free ordinary-development/static commands:

```sh
npm run m2d:verify
npm run p2:verify
npm run p2:build
npm run p2:stage:vite
npm run check
git diff --check
git status --short
```

Also run the focused Vite scenario-context, plan, runner, projection, executor, and staging tests; a compiled
executor/entry import-safety check; exact source/staging byte/mode/version/manifest assertions; approved-base
and candidate SHA-256 calculations; and exact absence checks for only the two new result roots. Record exact
commands and observed exit/test counts.

Do not run `npm run p2:execute:vite`, any Docker command, or any command that enumerates or accesses the
exhausted result roots.

# Completion report

- Changed files
- Commands run, exit status, test counts, hashes, staging inventory/manifest, and new-root absence results
- Exact old/new run-ID and container-name acceptance/rejection evidence
- Expected/static/unit/Observed classification; no runtime claim from this task
- Commands intentionally not run and the Docker/retained-state boundary
- Remaining limitations and one concrete next task
