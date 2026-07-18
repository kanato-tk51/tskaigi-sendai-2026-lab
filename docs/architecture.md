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
│   ├── profile-control/
│   ├── permissive/
│   └── constrained/
├── results/
│   ├── runs/
│   └── examples/
├── docs/
└── prompts/
```

たたき台に `scenarios/` と `profiles/` を追加する。tool fixture と実行条件を分離し、同じ fixture を複数 route/profile で再利用しながら、expected result と capability policy を version control するためである。M4はadapter routeより先に`containers/profile-control/`の同一image inputをpermissive/constrainedの固定runtime policyで起動し、profile enforcement自体を検証する。`fixtures/probe-targets/` は固定 child script、canary service protocol など repository-owned の無害な対象だけを置く。

`results/runs/` は原則として disposable かつ version control 対象外、`results/examples/` は redaction 済みの再現可能な小規模 evidence だけを置く。発表用 evidence map は M6 で `docs/evidence-map.md` として作成する。

## npm workspace 構成

将来の root `package.json` の `workspaces` は `packages/*` の明示された package だけを対象にする。`experiments/**`、`fixtures/**`、`containers/**` は wildcard に含めない。

各 workspace package は strict TypeScript 設定を共有しつつ、public API と build/test 境界を独立させる。tool dependency は該当 adapter package に閉じ込め、`probe-core` と `lab-cli` が ESLint/Vitest/Vite を直接 import しない構成にする。

対象 tool と Node.js の version は、各adapterのreview済みExpected contractで事前固定し、実装時にlockfile/container inputへ反映してrun eventに実際のversionを記録する。この文書はadapter noteで固定されていないversionを推測しない。

## Package の責務

### `packages/probe-core`

- manifest/run context の tool 非依存 type と validation
- event schema、normalized error、redaction、path policy
- manifest で許可された capability attempt
- per-producer JSONL segment writer
- prepared `file-hash` attempt内のdeterministic byte hash
- fixed child target の厳密な validation
- unit test 用の pure helper

M1 で `@tskaigi-lab/probe-core` として実装した。Public APIはmanifest/runtime bindingのstructural validation、async runtime preparation、event validation/stable serialization、sink所有probe session、固定capability attempt、route invocation/tool API change recording、normalized errorに分かれる。Raw binding/path/target IDを受け取るhash helper、arbitrary event/details factory、Producer JSONL sinkはpublic差替え点ではない。Schema versionは`probe-manifest/v2`、`probe-runtime-bindings/v1`、`probe-event/v2`である。

Manifestはlogical IDと上限、重複なしphase/trigger allowlist、capability/route/tool-change definition、file/tool targetの固定classificationを持ち、host pathとloopback portは明示的runtime bindingに置く。`file-read`=`canary`、`file-hash`=`source|artifact`、`file-write`=`output`であり、tool API targetは`source|artifact`だけでruntime pathを持たない。Canary hashとtool targetへのcanary/output分類はstructural validationで拒否する。異なるfile targetのlexical path、canonical path、既存device/inode identity、planned output path共有はruntime preflightで拒否する。Runtime bindingはcommand、script、arguments、URL、HTTP method/body、write contentを受け付けない。

Structural validationはexternal objectをcanonical scalarへcopyしてnested valueまでfreezeし、返却configurationとは別のprivate`WeakMap` snapshotを作る。Async file preflightはそのsnapshotだけからcanonical root/target、regular-file status、device/inode、planned output pathを取得し、全file targetが一意な場合だけ別brandのprepared immutable snapshotを生成する。Session/path/sinkはprepared snapshotだけを使用し、preflight failureではsegmentを作らない。Root自体のsymlinkとroot内read/hash/parent symlinkはcanonical root内に解決される場合だけ許可し、direct writeのfinal symlinkはroot内向けでも拒否する。Canonical host path/device/inodeはprivate stateにだけ保持しeventへ渡さない。Preflight後のhostile rename、hard-link作成、bind-mount変更を防ぐfilesystem sandboxではなく、cooperative disposable directoryを前提とする。Direct writeは固定markerの排他的新規作成だけで、既存file/symlinkを変更しない。Childはtrusted configuration initialization時のNode executable snapshot、package同梱script、固定argv、`shell: false`、空environmentだけを使う。

内部event factory/validatorは外部draft/eventを保持せず、plain own data propertyからprimitive/plain-dataだけのcanonical discriminated union eventを新規作成する。Event validation/serializationにはmanifest contextが必須で、factory・validator・sinkが同じkind別semantic ruleを利用する。Public indexはarbitrary event/details factoryをexportしない。将来adapterはvalidated configurationをprepareした後に作成したsessionの`runAttempt`、`recordRouteInvocation`、`recordToolApiChange`だけを使い、eventを組み立ててsinkへ渡さない。将来collectorがproducer eventを再検証する場合も、対応するmanifest snapshotを渡す。

Remediation Bのbreaking changeとして、旧`createJsonlEventSink(configuration)` public exportと`createProbeSession(configuration, sink)`を廃止し、session-owned sinkへ統合した。Remediation Cでは単一phaseの`probe-event/v1`を互換維持せずv2へ更新し、manifest-declared IDを選ぶ専用recording APIを追加した。Remediation Dではraw targetを受け取るpublic hash helperを削除し、`validateProbeConfiguration()`、`await prepareProbeConfiguration()`、`await createProbeSession(prepared)`の三境界へ分けた。将来adapterはprepared configurationからsessionを1回作成して全operationをそのsession経由で実行し、必ず`close()`をawaitする。Collectorはsessionへsinkを注入せず、M3でclosed producer segmentを入力として再validationする。

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

M3では`@tskaigi-lab/lab-cli`として、version controlされた`m3-synthetic-collector`だけをdispatchするimport-safeなprivate ESM packageを実装した。Closed segmentはcopyしたbyte sequenceとして対応する`probe-manifest/v2`で再validationし、fatal UTF-8、size、LF、JSON、canonical byte serialization、`producerSequence`をsegment単位でfail closedにする。Producer ID、stable segment IDの順にmergeし、M1 event自体を変更せず`lab-canonical-event/v1` envelopeへglobal sequenceを付ける。このsequenceは因果順序または実時間順を表さない。Invalid/incomplete runはpartial prefixを採用せずcountsを`null`にし、canonical events/comparison/hash success outputを生成しない。`lab-scenario-definition/v2`と`lab-scenario-snapshot/v2`はattempt/tool outcomeとhash delta Expectedを持ち、run metadata/summary/hash evidenceもv2である。Manifest snapshot、`lab-run-completion/v1` snapshot、raw segmentをimmutable inputとして保持し、fixed owned run regeneratorがderived fileをbyte-for-byte再生成する。Synthetic outputはadapter/profile/matrix Observedへ自動昇格しない。Actual adapter process orchestration、profile enforcement、artifact pipeline orchestrationはM4/M5以降の責務として残る。

### `packages/eslint-plugin-probe`

- plugin module evaluation、initialization、rule/file hook の marker
- ESLint が提供する file/context ID の正規化
- fixer callback が返す official API change と direct write probe の分離
- cache/fix multi-pass の invocation 観測

M2-Bではこのpathをnpm package `@tskaigi-lab/adapter-eslint`として実装した。Package root exportは定数、型、trusted scenario contextのinstall/fixed load/drain/disposeだけを公開し、import時にplugin entry、event、environment、filesystem、network、child、timer、出力を開始しない。`./plugin` exportだけが、install済みcontextから固定URLで明示importされた際にmodule evaluationとplugin initializationをqueueする。

同期ESLint hookと非同期probe sessionの間には、同時に1 contextだけを許すadapter-owned serial queueを置く。Plugin/ruleは固定route/capability taskだけをenqueueし、任意callback、event、details、pathを渡さない。最初のfailureを保持して後続taskを拒否し、scenarioはqueue drain後にsessionとcontextをclose/disposeする。Fresh evaluationはpackage内部の固定`plugin-entry.js` URLに検証済みscenario tokenをqueryとして付け、同一context内ではmemoizeする。

Scenario harnessはESLint `9.39.5`のflat configをAPIへ直接渡し、1 fixture、cache/watch/config discovery無効、single-process条件でlint-only/fixを実行する。Direct writeはfixtureと別の`output` targetへprobe-coreが固定markerを新規作成する。FixはruleがESLint fixer objectへ単一literal range replacementを返し、harnessが`ESLint.outputFixes()`でfixtureへmaterializeした後、content/diff/pathを含まないhash/sizeだけの`source-fix` eventを記録する。Local runnerはproducer segmentを一時`/tmp`でcomplete close/validationした後、ignored `results/runs/m2-b-eslint/`へcopyする。Collector、global sequence、reportはM3まで追加しない。

### `packages/vitest-setup-probe`

- 同じsetup-module import内のlate module-evaluation/setup-body checkpoint
- test file/worker context の、Vitest が提供する範囲での記録
- source/artifact modification API がない場合のtool target/change空集合によるnot applicableの明示

M2-Cではこのpathをprivate ESM package `@tskaigi-lab/adapter-vitest-setup`として実装した。Package rootは定数、error、型だけをexportし、instrumented `./setup` entry、Vitest、scenario harnessへ到達せずimport-time side effectを持たない。Coordinatorのofficial global setupがexact version、resolved config、run固有tool temp、fixed manifest/runtime bindingを検証し、structured-clone-safeな固定contextだけを`provide`する。Fork workerのsetup entryはofficial `inject`後に再validation、preparation、session作成、同じawaited module import内の2 checkpointと6 capability eventの逐次記録、segment closeまでを所有する。最初のcheckpoint以前にstatic import、inject、validation、preparation、session作成があるため、pre-checkpoint failureのroute 0件をmodule未評価またはvalid observationとは扱わない。Prepared object、session、sink、file handle、Promise、callback、raw canaryはprocess境界を越えない。

固定条件はVitest `3.2.7`、`forks`/`singleFork`、worker 1、setup/test fileとtest case各1、watch/cache/parallelism無効、Vite `configLoader: runner`である。Coordinatorへ渡す`TMPDIR`/`TMP`/`TEMP`、Vitest project transform temp、Vite cacheはrun root内に固定する。Vite `6.4.3`が固定configから上方向へ解決する実際のnearest boundary、すなわちadapter-local `node_modules/.vite-temp`を、`lstat`でENOENTだけをabsentとしてcanonical parent/identityとともにpre/post検査する。Pre-existing file/directory/symlinkは削除せずrunを拒否し、tool/cache rootのsymlink・identity replacementも拒否する。このpreflightは全filesystem raceの排除を主張しない。Tool内部temp writeはprobeのdirect-write eventへ数えない。Linuxではdirect spawnの専用process groupへTERM、bounded grace後にKILLを送り、coordinator closeが`code: null`と期待signalの組合せであること、およびworker/pool消滅を確認してからloopback、environment boundary、tool temp、run rootの順でcleanupする。Close deadline、signal failure、unexpected disposition、group residueでsettlementを証明できなければ競合cleanupを抑止し、timeout/output-limitをprimary、termination/cleanup codeをsecondaryに保つ。これはPID reuse防止またはOS process sandboxではない。Test bodyはsetup完了後のprogress witnessでありroute eventではない。Vitest production artifact APIを仮定しないためtool target/changeは空で、direct output markerはprobe-core capabilityとして別eventになる。Local runnerはvalidated producer segmentまでをignored resultへcopyするが、collector/global sequence/reportとprofile enforcementはM3/M4まで追加しない。

### `packages/vite-plugin-probe`

- late plugin-module checkpoint、plugin factory、`buildStart`、対象module transform、`generateBundle`、`writeBundle`のmarker
- transform return、emitted asset、bundle mutation、direct filesystem write、通常output materializationの分離
- dev/watchではなく、single deterministic production build baselineへの限定

M2-Dは`packages/vite-plugin-probe`として実装済みで、独立実装レビューを通過した。実験matrixのObservedは未測定であり、local contract runをprofile比較やObserved evidenceへ昇格させない。Node.js `v20.18.2`、npm `11.12.1`、Vite `6.4.3`、Rollup `4.62.2`、esbuild `0.25.12`と、fixed adapter cwdでの`vite build --config vite.scenario.config.ts --configLoader runner --mode production`を使う。ViteはM2-D workspaceからexact direct pinし、`process.execPath`、fixed CLI/argv/cwd、`shell: false`以外のlauncher pathを持たせない。Npmはlauncher policy metadataであり、plugin process内のnpm実行証拠ではない。詳細な実装レビューと非blocking follow-upは[M2-D Vite plugin adapter independent review record](reviews/m2-d-vite-plugin-adapter.md)に記録する。

両variantのExpectedはroute 6、sequential `buildStart`直後のcapability 6、tool API change 3、total 15、producer 1、`workerId: null`である。Producer-local orderは次の`0..14`で、global sequenceはM3責務とする。

```text
0  vite-late-plugin-module-checkpoint
1  vite-plugin-factory
2  vite-build-start
3  vite-attempt-environment
4  vite-attempt-file-read
5  vite-attempt-file-hash
6  vite-attempt-file-write
7  vite-attempt-loopback
8  vite-attempt-child
9  vite-designated-transform
10 vite-module-transform-change
11 vite-generate-bundle
12 vite-emitted-asset-change
13 vite-bundle-mutation-change
14 vite-write-bundle
```

Late checkpointはevaluation開始ではなく、pre-checkpoint failure/0 eventはinvalidである。Factoryはconfigの別call boundary、trusted `configResolved` validatorはcontrol planeでroute外とする。Exact transform filterは`fixture/designated.ts`のlogical target 1件だけを認め、entry/internal/non-target transformを全transform countへ混ぜない。Fixtureの`entry.ts`はdesignatedを1回static importしてside effectで利用し、single input/output、dynamic import/CSS/HTML/public asset/framework/external importなしとする。

Observeは3 change operationを開始せず、同じ3 definition/eventを`skipped/NOT_APPLICABLE`にする。APIはdesignated `module-transform`、fixed `emitted-asset`、fixed entry `bundle-mutation`各1件を`success`とするExpectedである。Probe direct markerは`outDir`外のcapabilityで、Vite/Rollup通常artifact writeはtool-owned materializationであり、どちらもtool changeへ数えない。Source/config/plugin immutability、API result、variant別output count/hashを別々に検査する。

Resolved configはsingle non-watch production build、fresh cache/outDir、single ES output、fixed filenames、public/manifest/sourcemap/minify/module preloadなし等のreview済み値へfail closedにする。Run固有temp environment、nearest `.vite-temp` absence、cache/outDir canonical inventory、Linux process group、timeout/output limits、TERM/KILL close disposition、group absence、settlement unknown cleanup gateはM2-C patternを再利用する。Plugin producerはVite coordinator 1だがOS process数1を意味しない。Rollupはin-process、esbuildはtool-owned childを起動し得るため、probe-owned fixed childと分けて実装時にresidue/group settlementを測定する。Raw code/content/config/path/error/output/reference/module/bundle identifiersを保存せず、late materialization/process/cleanup failureがあれば15 eventが揃っていてもinvalidとする。

### `packages/codegen-probe`

- 利用者が明示的に起動する CLI entry と main の marker
- documented generator interface を通じた intended output の生成
- module evaluation、CLI main、generation API、direct write attempt の分離
- arbitrary command/argument を受け付けない固定 fixture mode

M2-Eではこのpathをprivate ESM package `@tskaigi-lab/adapter-codegen`として実装した。固定CLIは`process.execPath dist/cli.js <fixed-mode>`のみを受け付け、`observe`、`api`、`dry-run`を固定する。startup、argument parsing、generation start、file write、completionの全routeを`explicit` triggerで記録し、6 capability attemptとdocumented generator API changeを分離する。Observeはdirect filesystem write、APIは固定artifactのgenerator APIとtool-owned materialization、dry-runは両方の変更なしを記録する。Package rootはimport-safeで、CLI entryだけがsessionを作成する。固定input/output、run-local canary、loopback、producer segment、raw-data policy、materialization、cleanupを検証し、local resultはM3 collector/reportやM4 profile evidenceへ昇格させない。

### `packages/npm-lifecycle-probe`

M2-Aではこのpathをprivate ESM package `@tskaigi-lab/adapter-npm-lifecycle`として実装した。Host側はfixed manifest、fixture、static verifier、probe-core configuration preparationだけを検証し、instrumented packageのpack/install/lifecycleはdisposable npm 12 container内の固定entryからのみ実行する。Lifecycle routeは`automatic`の`npm-install-lifecycle` 1件、capability attemptは6件、tool API changeは0件である。M0の未解決なDocker tmpfs evidence-transfer境界が解決するまで、container executionはblocked/Inconclusiveであり、Observed evidenceへ昇格させない。

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

Direct write scenario では `probe-core` が allowlisted scratch/fixture target に filesystem API で書く。Official API scenario では adapter が fixer text、transform result、emitted asset、bundle mutation、generator result を tool に返し、`probe-core` は書き込まない。Toolによる通常output materializationもprobe direct writeやtool change eventとは別である。Harness は最終 hash を取るが、hash delta だけで経路を推定せず event と照合する。

Module evaluation を測る entry point は adapter package 内でも専用 fixture export に隔離する。通常の helper export と `probe-core` の import には side effect を持たせない。

## M1 input/configuration/event boundary

```text
external manifest + runtime bindings
              |
              v  descriptor validation; Proxy/accessor/custom prototype rejected
canonical validated configuration (public, deeply frozen)
              |
              +---- private structural snapshot
                              |
                              v  async file identity preflight
                    prepared immutable snapshot (private WeakMap brand)
                              | canonical root/path + device/inode stay private
                              | executable + fixed script snapshot
                              v
                                      session (open/closing/closed/failed)
                                              | runAttempt / recordRouteInvocation / recordToolApiChange
                                              | owns official sink + shared sequence + in-flight set
                                              v
fixed recording input -- canonical copy --> discriminated canonical event
                                              |
                                              v  manifest-context semantic validation + fixed limits
                                      private producer JSONL event sink
                                              |
                                              v
                              complete LF line / terminal failure + partial marker
```

Public validated configurationはinspectionとruntime preparation入力用であり、session authorityではない。Prepared brandを型assertionで偽装したobjectとunprepared configurationはprivate snapshot lookupに失敗する。Sessionは同じprepared configurationからofficial sinkを作成し、caller callbackや別configurationのsinkを受け取らない。`close()`は開始済みattemptとwrite queueを待ち、sink failureをsession `failed`へ伝播する。Event sinkは入力をそのままserializeせず、canonical copy、manifestとのidentity/attempt整合、producer sequence、event/segment limitを検証した後にだけ完全なJSONL lineをwrite queueへ渡す。Serialization/limit validationに失敗した入力はwrite開始前に拒否する。I/O途中の失敗はpartial-line可能性を保持してterminal failureとなり、完全runとして扱わない。

Loopback attemptは任意local serviceを信用せず、内部固定のmethod/path/status/header/body protocolを完全検証する。Attempt開始時のmonotonic absolute deadlineがconnectionからresponse endまでを覆い、期限時にrequest/response/socketを破棄する。Header/body resource limitとmarker一致結果だけを扱い、raw header/bodyはcanonical eventへ渡さない。

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
 route tool -> adapter -> probe-core -> canonical immutable event -> producer JSONL segments
          |                                                    |
          +-> official API result                              +-> sanitized primitive/plain-data only
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

M1 が実装するのはproducer segmentまでである。同一processのevent writeはsink内部で直列化し、同一file output targetの副作用writeはsession target lockで直列化する。Generic writeは`O_EXCL|O_NOFOLLOW`の新規固定markerだけなので並行2回目や既存fileは決定的なfailureとなる。Process間global order、segment collection、canonical mergeは実装しない。M0のstdout framed bundle fallbackはこのdata flowへ一般化していない。

M3 collectorは、terminal failureが報告されたsegment、LFで完結しない末尾、JSON parse/schema error、producer sequence gapを部分的に採用せず、そのproducer segment/runをinvalidとして扱う。M1 sessionは副作用後のevidence failureを成功扱いしないが、外部副作用をrollbackするtransactionではない。

Event collection の control channel は network canary と分ける。標準は allowlisted result volume 上の segment file とし、Unix socket を採用する場合も experiment-only path として manifest に明記する。

## Results 生成フロー

Run directory の予定構成は以下とする。

```text
results/runs/<run-id>/
├── manifest.snapshot.json
├── run-completion.snapshot.json
├── run-metadata.json
├── events.jsonl
├── summary.json
├── comparison.md
├── hashes.json
└── segments/               # canonicalization 前。保持 policy を metadata に記録
```

- `events.jsonl` が observed evidence の正本である。
- `manifest.snapshot.json`、`run-completion.snapshot.json`、`segments/`がimmutable collector inputである。
- `run-metadata.json` は tool/Node version、profile revision、container input、segment retention、run validity を持つ。
- `events.jsonl`、`run-metadata.json`、`summary.json`、`comparison.md`、`hashes.json`はimmutable inputから再生成する。
- `hashes.json` は allowlisted source/artifact のbefore/afterと`changed` / `unchanged` / `unavailable`を、file hashとtool API changeを分離して持つ。
- `results/examples` に移す場合は redaction と再生成可能性を human review する。

Expected は scenario manifest/matrix、observed は run directory に置き、同じ file を双方から更新しない。

## Container 境界

### Permissive profile

実験 allowlist 内で canary environment/file、scratch write、loopback service、fixed child process を利用可能にする。ただし non-root、no host home、no credential、no Docker socket、no external network という外側の安全境界は維持する。

### Constrained profile

credential-free とし、source を read-only、artifact staging/result sink だけを必要最小限 writable にする。不要な canary mount/environment/network/child capability は与えない。どの制約が manifest-level skip、filesystem permission、network namespace、runtime policy により実現されたかを run metadata に記録する。

具体的な runtime option は M4 で検証する。設定したつもりの制約を observed enforcement として扱わず、probe attempt と control test の evidence を要求する。

M4の最初のgateはadapter eventではなく、versioned profile-control manifestと同一container image digestを使う固定control pairである。Host inspectionとcontainer内control evidenceの両方を要求し、どちらか一方だけでenforcementを主張しない。Control resultはadapter/profile routeのObservedへ昇格しない。詳細は[M4 execution profiles Expected contract](m4-execution-profiles.md)を正本とする。

M4のstatic/unit phaseは`containers/profile-control/`に、versioned schema validator、canonical transfer/completion validator、pure fixed Docker command plan、pre-start inspect projection、shared harmless fixture/Containerfileを実装した。Accepted image/staging inputは、private copied staging bytes、exact inventory/digest、base environment key inventoryを持つ1つのnominal/runtime-branded snapshotへ変換する。Profile pair、image build plan、fixed runtime layout、inspect allowlistは同じsnapshot identityへbindし、executorはbuild開始前にfixed staging pathへ渡したbytesをexact inventory、順序、byte identity、aggregate digestで再検証する。Snapshotのpublic projection、host inspection、completionにはraw staging content、raw environment value、host absolute pathを保存しない。Post-bootstrap doctor candidateはversion管理された`containers/profile-control/image-input.json`とrepository staging aggregateへbindしたproposalになり、fixed-value validatorとrepository-byte再計算testを持つ。Proposalはindependent review待ちであり、通常orchestratorは引き続きfail closedである。

Exact-input review update (2026-07-18): 上記proposalのbase/environment traceとrepository staging bytesはindependent reviewでacceptされた。一方、profile pre-start inspectにDocker `29.6.1`非互換の`dict` helperが残り、pre-build runtime stepがexact client/server payloadを検証しないため、fixed host-backend/runtime contractはB-11/B-12でblockedである。通常orchestratorのfail-closed状態、未作成の`profile.json`、未実行のbuild/control境界は変わらない。

B-11/B-12 remediation update (2026-07-18): profile pre-start inspectはDocker `29.6.1`互換の`json` helperだけでreview済みfull projectionを直接構成する。Pre-build runtime stepはclient/server両方のexact `29.6.1`をfixed canonical bytesとして検証し、wrong/missing/extra/duplicate/noncanonical/null/substituted payloadをbuild前にfail closedにする。Remediationはstatic/unit実装済み・fresh independent read-only re-review待ちで、通常orchestrator、accepted base/staging input、未作成の`profile.json`、未実行のbuild/control境界は変わらない。

Exact inputの前段には、固定absolute Docker CLIからclient/server version、fixed Node base tagのlocal image ID/repository digest/Linux architecture、base environment keyだけを取得するdoctor境界を置く。Doctorのproduction backendはfixed branded command、disposable `DOCKER_CONFIG`、repository-owned work root、no inherited host environment、`shell: false`、bounded output/timeout/cleanupだけを持ち、pull/build/create/start/runを持たない。Environment value、stderr、raw error、host absolute pathはinventoryに保存しない。Doctor backend codeは通常の未承認状態ではorchestratorから到達不能である。B-08〜B-10 remediationでは、environment projectionへ同じsanitized image identityを再掲してstep 2とcross-validateし、escaped one-entry/one-key arrayを要求することでB-08/B-10をclosureした。B-09 original-byte remediationは、validated plain snapshotのcanonical JSONとsingle final LFをencodeし、original responseのlengthと全byteを比較する。3 structured outputのleading-BOM negative testを含むfresh independent reviewがB-09をclosureした。Docker 29.6.1非対応の`dict` helperを除去して`json`-only fixed formatへ変更した後の[fresh compatibility re-review](reviews/m4-execution-profiles-runtime-template-compatibility.md)が現在のfixed doctor static/unit gateを承認した。Project-human-approved one-time registry bootstrap後、fresh workerはreview済みsourceを再検証してfixed doctorをちょうど1回実行し、client/server `29.6.1`、exact tagの同一base/local digest、`linux` / `amd64`、key-only base environment inventoryをaccepted candidateとして取得した。Entry sourceは直後に通常のfail-closed状態へ戻した。このcandidateをversion管理されたexact-input proposalへbind済みで、次のtaskはfresh independent read-only reviewである。`profiles/permissive/profile.json`と`profiles/constrained/profile.json`は、review後の別gateでoffline buildしたbuilt-image digestを観測し、さらにprofile binding reviewへ渡すまで作成しない。Image buildとcontrol executionは別の後続gateである。

Current next task (superseding the final next-task clause above): `prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md`に従うfresh independent read-only re-reviewである。そのreviewが完了するまでimage build、profile binding、control executionへ進まない。

Backend remediation re-review update (2026-07-18; supersedes the current-next-task clause above): [fresh independent review](reviews/m4-execution-profiles-exact-input-backend-remediation.md)はB-11/B-12をstatic/unit境界でclosureし、base/staging/fixed-backend contractを承認した。Production backend、Docker access、build、profile binding、control executionは未承認・未実行である。次のtaskはreview済みsnapshotとfixed planだけにbindするproduction offline-build backendのnon-executing implementation contractと独立review promptを作ることであり、そのtaskではDockerを実行しない。

Offline-build backend contract handoff (2026-07-18): [implementation contract](../prompts/m4-execution-profiles-offline-build-backend.md)はproduction側をbuild-only executorとfixed host backendへ分離し、accepted snapshot、branded runtime layout、既存のversion/build/image-inspect planだけへbindする。Host backendはfixed repository-owned stagingとcredential-empty Docker configを使い、通常entry/package rootから到達不能のままにする。[Independent review prompt](../prompts/reviews/m4-execution-profiles-offline-build-backend-review.md)も固定済みで、次のtaskはDocker非実行のstatic/unit実装である。

Offline-build backend implementation update (2026-07-18): build-only executor、canonical sanitized result、production host filesystem/process/cleanup backendをnon-executing static/unit境界で実装した。Accepted snapshot、branded layout、fixed command object identityをcross-validateし、repository-owned private stagingはexclusive regular files、read-back byte identity、per-file/aggregate digestをbuild前に検証する。Processはfixed `/usr/bin/docker`、fixed argv/cwd、credential-empty `DOCKER_CONFIG`だけのenvironment、`shell: false`、bounded timeout/output/closeを維持し、raw stderr/build outputをresultへ保持しない。通常entry/package rootはbackendへ到達せず、次のtaskはfresh independent read-only reviewである。Docker/build/profile/control/Observedは未実行のままである。

Offline-build backend review update (2026-07-18): build-only filesystem、fixed command identity、ordinary entry/package非到達性はfresh independent reviewでacceptされたが、canonical resultとprocess first-failure boundaryはB-13〜B-15でblockedである。Known synthetic digestの拒否、failure/completed-step semantic matrix、timeout/output/process-errorのmonotonic first-failure latchをDocker非実行でremediateしてfresh re-reviewするまでproduction backendを有効化せず、offline build、profile binding、control execution、Observedへ進まない。

Offline-build result remediation implementation update (2026-07-18): known synthetic digestをbuilt-image inspect/plain/canonical resultの全境界で拒否し、result failureをexact completed-step/version/digest matrixへbindした。Production host process backendはboundedなpure stateでtimeout/output/process errorのfirst failureをmonotonicに保持し、executorはcontradictory untrusted flagsをfail closedにする。Accepted input/fixed planとordinary entry/package非到達性は不変で、次はfresh independent read-only re-reviewである。その後も別途recorded execution gateまでoffline buildを実行せず、profile binding、control execution、Observedへ進まない。

Offline-build result remediation re-review update (2026-07-18): [fresh independent read-only re-review](reviews/m4-execution-profiles-offline-build-result-remediation.md)はB-13/B-14/B-15をstatic/unit境界でclosureし、production offline-build backend static/unit gateを承認した。通常entry/package rootの非到達性は維持され、Docker/build/profile/control/Observedは未実行である。次はreview済みsource snapshot、exact run ID/layout/plan、side-effect/cleanup、sanitized result、restoration/verificationを固定する一回限定offline-build execution gateをDocker非実行で作成する。

Offline-build execution-gate definition update (2026-07-18): fixed run ID `m4-offline-build-20260718-01`からrepository-owned run layoutと一意なstaged tagを導き、accepted snapshot/layout/plan/backendのruntime brandを同じtemporary activationで構成するgate candidateを記録した。Gateはreview済みsource manifest、exact activation/ordinary-entry hashes、fixed one-time command、version/offline-build/image-ID-inspectだけのside effect、canonical result、success/inspect/cleanup failure時の残存state、ordinary source/compiled output restorationを固定する。Activationはcompile-only検証後に通常のfail-closed状態へ戻しており、Dockerは実行していない。次はfresh independent read-only gate reviewであり、approve前にactivation/buildへ進まない。

Offline-build execution-gate independent review update (2026-07-18): [fresh independent read-only review](reviews/m4-execution-profiles-offline-build-execution-gate.md)はsource/staging/activation/restoration bytesと、fixed run/layout/tagからaccepted snapshot、branded plan、production backend、build-only executorへ至るidentity chainを独立照合した。Fixed host CLI、credential-empty config、no inherited environment、ordered version/offline-build/image-inspect、bounded result/cleanup、one-time/no-retry、ordinary restoration boundaryは新しいblocking findingなしで承認された。ReviewはDockerを実行していない。次はfresh workerによるexact one-time buildであり、その後もbuilt-image/profile bindingとcontrol executionは別gateである。

One-time offline-build execution follow-up (2026-07-18): fresh workerはreview済みsnapshotを再検証し、standing authorizationでfixed build commandをちょうど1回実行した。Resultは4 build-only step完了後の`inconclusive / CLEANUP_FAILURE`で、Docker client/serverは`29.6.1`、`builtImageDigest`は`null`である。Fixed planはimage removalを持たないためinspect済みtagは後続recovery gateへ残り、追加Docker commandでは再inspectしていない。Fixed run rootも残り、private stagingとcredential-empty `config.json`は削除済みだが、Dockerが`docker-config`に生成したbuildx/token-seed stateはcleanup contractのexact-name checkにより保持された。Ordinary entry/source outputはreview済みfail-closed bytesへ復元した。次はexisting fixed tagとretained run rootだけを対象に、exact digest inspect最大1回とidentity-checked owned-state treatmentを固定するnon-executing recovery contract/review promptである。Profile binding、controls、runtime enforcement、profile-control/route Observedは未確立である。

Offline-build recovery contract handoff (2026-07-18): [recovery implementation contract](../prompts/m4-execution-profiles-offline-build-recovery.md)はrecovery-only executor/result/backendをrecorded `CLEANUP_FAILURE`、fixed run ID/tag、retained exact treeへbindし、production command setをlocal canonical image-ID inspect最大1回に限定する。Retained runtime-created file contentsはread/hash/serializeせず、path identityはprivate pre/post validationだけに使い、全outcomeでstateを保持する。通常entry/package rootはproduction recovery backendへ到達させず、次はDocker非実行static/unit実装、その後は[独立review prompt](../prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md)に従うfresh reviewである。Recovery execution、state deletion、profile binding、controls、runtime enforcement、profile-control/route Observedは別gateのままである。

Offline-build recovery implementation update (2026-07-18): recovery-only input/executorとcanonical resultはrecorded failed-build identityおよびfixed run/tagへvalue/brandでbindし、production host backendはmodule URLから導くrepository-owned retained treeを`lstat`/`realpath`/`readdir`だけでpre/post検証する。Runtime-created file contents、host absolute path、device/inodeはresultへ流さず、fixed retained `DOCKER_CONFIG`を使うsingle local image-ID inspectだけをinstance最大1回許す。Ordinary orchestrator/package rootからproduction backendへdependency edgeを追加しておらず、実装単独ではDockerへ到達しない。次はfresh independent read-only reviewであり、recovery execution、state deletion、profile binding、controls、runtime enforcement、profile-control/route Observedは別gateのままである。

Offline-build recovery independent review update (2026-07-18): [fresh review](reviews/m4-execution-profiles-offline-build-recovery.md)はvalue/brand、content non-read、single-inspect、canonical result、retention-only、ordinary dependency非到達性をacceptしたが、host backend static/unit gateをB-16/B-17でblockした。`lstat` modeのlow 9 bitsだけを比較してspecial bitsを見落とすことと、bounded close deadline後もactive childを保持したままpost-attempt identity validationを成功扱いできることがfixed metadata/process-settlement contractに反する。次は[non-executing remediation](../prompts/m4-execution-profiles-offline-build-recovery-remediation.md)であり、そのfresh re-reviewとone-time recovery execution gateより前にDockerへ進まない。

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

`probe-core` static verifierはpackage directoryの存在をmilestone guardとして使わない。`probe-core/package.json`のruntime/workspace dependencyと、TypeScript ASTでstatic import/export、type-only import、literal dynamic import、require相当、relative escape、alias解決を検査する。Computed module loadingは依存先を証明できないため拒否する。Adapter packageから`probe-core`への正方向依存はこのverifierの検査対象sourceではなく、失敗理由にしない。

## 設計時点の仮定

- npm workspace と container runtime の具体 syntax は M-1/M0 で最小構成として確定する。
- per-producer segment のschema、stable serialization、producer-local sequenceはM1で確定した。Segment間はM3でproducer ID、stable segment ID、segment line orderの順にdeterministic mergeし、因果順序ではないglobal sequenceを付ける契約を確定した。
- constrained child-process enforcement は portability 上の難所である。M4 で実 enforcement が得られなければ、manifest skip と limitation を明記し、強制できたと主張しない。
