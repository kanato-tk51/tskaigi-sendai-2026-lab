# Architecture

## この文書の責務

この文書は repository 構成、package 境界、data flow、container と workspace の分離方法の正本である。安全 policy は [threat-model.md](threat-model.md)、event semantics は [experiment-protocol.md](experiment-protocol.md)、実装順序は [milestones.md](milestones.md) に従う。

## 設計原則

- root workspace は通常の TypeScript package だけを含み、install lifecycle experiment を含めない。
- `probe-core` は tool 非依存、strict TypeScript、import-time side effect なしとする。
- tool-specific module evaluation は adapter fixture の狭い entry point に明示する。
- direct filesystem write と official tool API change は異なる component が担当する。
- fixture は再利用可能な入力、experiment はその入力・route・profile・期待値を束ねる実行定義とする。
- raw event は不変の観測入力、summary/report は再生成可能な派生物とする。
- permissive/constrained profile の違いを adapter code に埋め込まず、manifest と execution boundary で与える。

## 想定 repository 構成

```text
.
├── packages/
│   ├── probe-core/
│   ├── lab-cli/
│   ├── eslint-plugin-probe/
│   ├── vitest-setup-probe/
│   ├── vite-plugin-probe/
│   └── codegen-probe/
├── scenarios/
│   ├── baselines/
│   └── routes/
├── profiles/
│   ├── permissive/
│   └── constrained/
├── experiments/
│   └── npm12-install/
├── fixtures/
│   ├── ts-app/
│   └── probe-targets/
├── containers/
│   ├── permissive/
│   └── constrained/
├── results/
│   ├── runs/
│   └── examples/
├── docs/
└── prompts/
```

たたき台に `scenarios/` と `profiles/` を追加する。tool fixture と実行条件を分離し、同じ fixture を複数 route/profile で再利用しながら、expected result と capability policy を version control するためである。`fixtures/probe-targets/` は将来、固定 child script、canary service protocol など repository-owned の無害な対象を置く。今回はこれらの実装 directory/package は作成しない。

`results/runs/` は原則として disposable かつ version control 対象外、`results/examples/` は redaction 済みの再現可能な小規模 evidence だけを置く。発表用 evidence map は M6 で `docs/evidence-map.md` として作成する。

## npm workspace 構成

将来の root `package.json` の `workspaces` は `packages/*` の明示された package だけを対象にする。`experiments/**`、`fixtures/**`、`containers/**` は wildcard に含めない。

各 workspace package は strict TypeScript 設定を共有しつつ、public API と build/test 境界を独立させる。tool dependency は該当 adapter package に閉じ込め、`probe-core` と `lab-cli` が ESLint/Vitest/Vite を直接 import しない構成にする。

対象 tool と Node.js の version は、実装 milestone で lockfile/container input に固定し、run event に実際の version を記録する。この設計文書では推測して version を指定しない。

## Package の責務

### `packages/probe-core`

- manifest/run context の tool 非依存 type と validation
- event schema、normalized error、redaction、path policy
- manifest で許可された capability attempt
- per-producer JSONL segment writer
- deterministic hash helper
- fixed child target の厳密な validation
- unit test 用の pure helper

行わないこと:

- ESLint/Vitest/Vite/npm API の import
- CLI argument parsing や container 起動
- import-time probe 実行
- official tool API を装って source/artifact を直接変更すること

### `packages/lab-cli`

- scenario/profile manifest の load と cross-validation
- preflight、run ID、disposable directory、timeout の管理
- route runner の dispatch と process lifecycle の管理
- producer segment の収集、再 validation、redaction、global sequence 付与
- JSONL から JSON summary/Markdown comparison/hash evidence の生成
- baseline/expected との diff
- artifact pipeline command の orchestration

CLI は policy を迂回する escape hatch や arbitrary command runner を提供しない。

### `packages/eslint-plugin-probe`

- plugin module evaluation、initialization、rule/file hook の marker
- ESLint が提供する file/context ID の正規化
- fixer callback が返す official API change と direct write probe の分離
- cache/fix multi-pass の invocation 観測

### `packages/vitest-setup-probe`

- setup module evaluation と setup-file execution の marker
- test file/worker context の、Vitest が提供する範囲での記録
- source/artifact modification API がない場合の `NOT_APPLICABLE` の明示

### `packages/vite-plugin-probe`

- plugin module evaluation、factory/initialization、対象 module transform、`generateBundle` の marker
- transform return/emit API と direct filesystem write の分離
- dev/watch ではなく、最初は deterministic build baseline に限定

### `packages/codegen-probe`

- 利用者が明示的に起動する CLI entry と main の marker
- documented generator interface を通じた intended output の生成
- module evaluation、CLI main、generation API、direct write attempt の分離
- arbitrary command/argument を受け付けない固定 fixture mode

### `experiments/npm12-install`

- npm 12 の対象挙動だけを確かめる独立 experiment definition
- unapproved dependency と approved control の disposable fixture template
- root workspace と共有しない package metadata/lock input
- container 内限定の run instruction と evidence output

この directory は workspace package ではなく、通常の root install/build/test から参照しない。

## Probe-core と adapter の境界

```text
tool callback
  -> adapter: route/phase/worker/tool context を確定
  -> probe-core: 明示された共通 capability を試行し event 化
  -> adapter: official tool API の戻り値/emit を生成
  -> tool: source/artifact へ API result を適用
  -> harness: before/after hash と event を突合
```

Direct write scenario では `probe-core` が allowlisted scratch/fixture target に filesystem API で書く。Official API scenario では adapter が fixer text、transform result、emitted asset、generator result を tool に返し、`probe-core` は書き込まない。Harness は最終 hash を取るが、hash delta だけで経路を推定せず event と照合する。

Module evaluation を測る entry point は adapter package 内でも専用 fixture export に隔離する。通常の helper export と `probe-core` の import には side effect を持たせない。

## Harness の責務

1. manifest/schema revision と pristine fixture hash を確認する。
2. profile と scenario の capability/path/network/child policy を cross-check する。
3. host 固有 path や実 credential が mount/environment に含まれないことを preflight する。
4. run ごとの workspace、canary、event segment、artifact staging を作る。
5. baseline または route-specific command を timeout/resource limit 下で起動する。
6. process exit 後に全 segment、hash、tool version、run completion を収集する。
7. canonical `events.jsonl` を確定し、summary と比較表を生成する。
8. mismatch、timeout、missing event を成功として補完しない。

Harness は tool dependency code より信頼する control plane だが、adapter/probe output は未検証 input として扱う。

## Fixture と experiment の違い

**Fixture** は、1つの TypeScript source、test、lint target、Vite entry、codegen input などの静的で無害な repository-owned input である。Pristine digest を持ち、実行時には disposable copy を使う。

**Experiment/scenario** は、fixture に route、phase、trigger、profile、capability、expected result、timeout、repetition を関連付ける実行定義である。同じ fixture を異なる scenario で共有できるが、run directory、canary、cache、result は共有しない。

npm lifecycle の dependency fixture は危険な実行面を持つため、通常 fixture と異なり `experiments/npm12-install` の隔離領域と disposable container の中だけで materialize する。

## Event data flow

```text
versioned scenario + profile
          |
          v
      lab-cli preflight ----> pristine before hash
          |
          v
 route tool -> adapter -> probe-core -> producer JSONL segments
          |                         |
          +-> official API result   +-> sanitized events only
          |
          v
     source/artifact after hash
          |
          v
 collector: validate + redact + deterministic merge + sequence
          |
          +-> events.jsonl (canonical evidence)
          +-> run-metadata.json
          v
 reducer -> summary.json -> comparison.md -> evidence map references
```

Process/worker ごとに segment を分け、複数 process から同一 file への append を前提にしない。Segment は producer-local sequence を持つ。Collector は segment を schema validation し、documented merge key で canonical JSONL に run-global sequence を付ける。Merge order は causal order の証明には使わない。

Event collection の control channel は network canary と分ける。標準は allowlisted result volume 上の segment file とし、Unix socket を採用する場合も experiment-only path として manifest に明記する。

## Results 生成フロー

Run directory の予定構成は以下とする。

```text
results/runs/<run-id>/
├── manifest.snapshot.json
├── run-metadata.json
├── events.jsonl
├── summary.json
├── comparison.md
├── hashes.json
└── segments/               # canonicalization 前。保持 policy を metadata に記録
```

- `events.jsonl` が observed evidence の正本である。
- `run-metadata.json` は tool/Node version、profile revision、container input、run validity を持つ。
- `summary.json` と `comparison.md` は events と manifest snapshot から再生成する。
- `hashes.json` は allowlisted source/artifact の before/after を持つ。
- `results/examples` に移す場合は redaction と再生成可能性を human review する。

Expected は scenario manifest/matrix、observed は run directory に置き、同じ file を双方から更新しない。

## Container 境界

### Permissive profile

実験 allowlist 内で canary environment/file、scratch write、loopback service、fixed child process を利用可能にする。ただし non-root、no host home、no credential、no Docker socket、no external network という外側の安全境界は維持する。

### Constrained profile

credential-free とし、source を read-only、artifact staging/result sink だけを必要最小限 writable にする。不要な canary mount/environment/network/child capability は与えない。どの制約が manifest-level skip、filesystem permission、network namespace、runtime policy により実現されたかを run metadata に記録する。

具体的な runtime option は M4 で検証する。設定したつもりの制約を observed enforcement として扱わず、probe attempt と control test の evidence を要求する。

## Install lifecycle fixture の root workspace からの隔離

- root workspace pattern は `packages/*` の allowlist とし、`experiments/npm12-install` を含めない。
- root lockfile と lifecycle experiment の package/lock input を共有しない。
- root script から lifecycle fixture の install を呼び出さない。
- fixture は container build context の専用 staging に必要 file だけ copy し、repository root を writable mount しない。
- instrumented lifecycle file/package の作成、pack、install、実行は disposable container 内だけで行う。
- container の result volume だけを host へ戻し、`node_modules`、cache、temporary package を破棄する。
- preflight は container marker、working directory、mount table の期待条件を確認し、条件外なら experiment を開始しない。
- M0 はこの隔離を先に検証し、成功するまで lifecycle adapter や他 adapter と統合しない。

## 依存方向

```text
adapter packages ---> probe-core
lab-cli -----------> probe-core schemas/types
lab-cli -----------> adapter runner contracts
probe-core -X------> tool packages
root workspace -X-> experiments/npm12-install
deploy simulator -X-> build dependencies
```

循環依存を作らず、report generation は raw event schema に依存し、個別 tool implementation の内部には依存しない。

## 設計時点の仮定

- npm workspace と container runtime の具体 syntax は M-1/M0 で最小構成として確定する。
- per-producer segment の deterministic merge rule は M1 で schema test とともに確定する。
- constrained child-process enforcement は portability 上の難所である。M4 で実 enforcement が得られなければ、manifest skip と limitation を明記し、強制できたと主張しない。
