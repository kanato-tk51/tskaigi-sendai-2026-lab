# Experiment matrix

## この文書の責務

この文書は scenario catalog、expected invocation/outcome、observed result の参照欄の正本である。操作の意味と判定規則は [experiment-protocol.md](experiment-protocol.md)、profile の安全境界は [threat-model.md](threat-model.md) に従う。

M0 の npm lifecycle marker-only spike は Docker `29.6.1`、Node.js `24.18.0`、npm `12.0.1` で全5条件を実測した。scenario-level の lifecycle count は Observed として記録できたが、必須の tmpfs からの `docker cp` が成立せず、固定 framing・path allowlist・SHA-256 検証を行う stdout bundle で証跡を回収したため M0 全体は **Inconclusive** である。これ以外の route/profile は実験を行っておらず、observed invocation count と observed result は **未実測** のままである。

## Profile の読み方

- `p` / **permissive**: 実験 allowlist 内で canary environment/file、direct write target、loopback service、fixed child Node.js を利用可能にする。ホスト home、実 credential、外部 network、Docker socket は引き続き利用不可。
- `c` / **constrained**: credential-free。canary environment/file を原則渡さず、source は read-only、artifact/result staging だけを必要最小限 writable にし、loopback service と child execution は拒否する設計。

Constrained の具体 enforcement は M4 の検証対象である。Manifest による `skipped` と OS/container による `failure` を同じ「拒否」に集約しない。強制できなかった項目は expected に合わせず limitation として残す。

表中の `name-p / name-c` は wildcard ではなく、同じ fixture を異なる profile で実行する2つの独立 scenario ID を表す。Observed evidence も別 run ID、別 result directory に保存する。

## 測定項目の略号

| 略号 | 測定内容 |
|---|---|
| `TIME` | phase、timestamp、duration、trigger type |
| `COUNT` | phase 別 invocation count |
| `CTX` | PID、PPID、worker identifier、Node/tool version |
| `ENV` | 列挙済み `PROBE_CANARY_` key への到達 |
| `FILE` | allowlisted canary file への到達 |
| `WRITE` | direct filesystem write と source/artifact hash |
| `API` | official tool API change と materialized hash の区別 |
| `NET` | loopback/experiment-only Unix socket への通信 |
| `CHILD` | fixed child Node.js process の起動 |

## Baseline scenario

Baseline は同じ tool、fixture、profile、cache/worker 条件から probe dependency/config だけを除く。`scenario-start`/`scenario-end` と hash は記録するが、probe の `route-invocation` は0件を期待する。

| Scenario IDs | Route | Phase | Trigger type | Profile | Fixture 条件 | Expected invocation count | Observed invocation count | Expected result | Observed result | Evidence location | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `baseline-npm12-p` / `baseline-npm12-c` | npm install lifecycle | harness | automatic | p / c | disposable container、instrumented dependency を含めない control | `route-invocation: 0` | 未実測 | lifecycle probe event なし、fixture hash 不変 | 未実測 | 未生成: `results/runs/<run-id>/` | npm policy 自体の control ではなく collector/tool baseline |
| `baseline-eslint-p` / `baseline-eslint-c` | ESLint plugin | harness | explicit | p / c | probe plugin を config に含めない、TS file 1件、cache off | `route-invocation: 0` | 未実測 | source hash 不変 | 未実測 | 未生成: `results/runs/<run-id>/` | ESLint 自身の通常 read は probe access と別 |
| `baseline-vitest-p` / `baseline-vitest-c` | Vitest setupFiles | harness | explicit | p / c | probe setup を含めない、test file 1件、single worker | `route-invocation: 0` | 未実測 | source/artifact hash 不変 | 未実測 | 未生成: `results/runs/<run-id>/` | test runner 固有の worker process は存在しうる |
| `baseline-vite-p` / `baseline-vite-c` | Vite plugin | harness | explicit | p / c | probe plugin なし、entry/designated module 各1件、build mode | `route-invocation: 0` | 未実測 | fixture source hash 不変 | 未実測 | 未生成: `results/runs/<run-id>/` | 通常 build artifact は生成されるため pristine expected artifact と比較 |
| `baseline-codegen-p` / `baseline-codegen-c` | explicit codegen CLI | harness | explicit | p / c | probe CLI を起動せず control command のみ | `route-invocation: 0` | 未実測 | source/artifact hash 不変 | 未実測 | 未生成: `results/runs/<run-id>/` | explicit CLI の「未起動」control |

## Route/phase scenario catalog

Expected invocation count は実行前の hypothesis である。`M2で固定` とした multi-pass/worker 依存の式は、該当 adapter の fixture と tool version を lock した後、最初の測定前に具体化する。Observed count を見て expected を変更してはならない。

| Scenario IDs | Route | Phase | Trigger type | Profile | Fixture 条件 | Expected invocation count |
|---|---|---|---|---|---|---|
| `npm12-unapproved-p` / `npm12-unapproved-c` | npm install lifecycle | install-lifecycle | automatic | p / c | disposable container、未承認の local instrumented dependency、clean cache | `install-lifecycle: 0`（M0で検証する hypothesis） |
| `npm12-approved-control-p` / `npm12-approved-control-c` | npm install lifecycle | install-lifecycle | automatic | p / c | 上と同じ dependency、M0で確定する承認設定だけを変更 | `install-lifecycle: 1`（M0で検証する control hypothesis） |
| `eslint-observe-p` / `eslint-observe-c` | ESLint plugin | module-evaluation; tool-initialization; file-hook | configured; automatic | p / c | TS file 1件、cache off、fix off、single process 条件 | `module-evaluation: 1; tool-initialization: 1; target-file-hook: 1` |
| `eslint-fix-p` / `eslint-fix-c` | ESLint plugin | module-evaluation; tool-initialization; file-hook; fixer-api | configured; automatic; explicit | p / c | 修正可能 marker 1件、cache off、fresh process | `module/init: 1; file-hook/fixer: M2-Bでmulti-pass式を固定; intended edit: 1` |
| `vitest-setup-p` / `vitest-setup-c` | Vitest setupFiles | module-evaluation; setup-file | configured; automatic | p / c | test file 1件、setup file 1件、single worker、cache/watch off | `module-evaluation: 1; setup-file: 1` |
| `vite-observe-p` / `vite-observe-c` | Vite plugin | late-plugin-module-checkpoint; plugin-factory; build-start; designated-transform; generate-bundle; write-bundle | configured; automatic | p / c | `fixture/entry.ts`が`fixture/designated.ts`を1回static import、single build/input/output、fresh cache/outDir、watch off、exact designated targetだけを計数 | `route: 6; capability-attempt: 6; tool-api-change: 3 skipped/NOT_APPLICABLE; total: 15; producer sequence: 0..14` |
| `vite-api-p` / `vite-api-c` | Vite plugin | late-plugin-module-checkpoint; plugin-factory; build-start; designated-transform; generate-bundle; write-bundle | configured; automatic | p / c | observeと同じfixture/build条件、module transform 1件、fixed emitted asset 1件、fixed entry chunk mutation 1件 | `route: 6; capability-attempt: 6; tool-api-change: 3 success; total: 15; producer sequence: 0..14` |
| `codegen-observe-p` / `codegen-observe-c` | explicit codegen CLI | module-evaluation; explicit-cli-main | explicit | p / c | fixed repository input 1件、固定 argument、fresh output | `module-evaluation: 1; CLI main: 1` |
| `codegen-api-p` / `codegen-api-c` | explicit codegen CLI | module-evaluation; explicit-cli-main; generation-api | explicit | p / c | documented generator mode、intended output 1件 | `module-evaluation: 1; CLI main: 1; generation API: 1` |

`eslint` / `vite` のconfigured loadとautomatic callbackは、一つのuser command内で連続していても別triggerとしてeventに残す。Viteはlate plugin-module checkpointとplugin factoryを`configured`、`buildStart`、exact designated `transform`、`generateBundle`、`writeBundle`を`automatic`とする。Capability 6件はsequentialな`buildStart` route直後に1回だけ置き、transform graph/module数へ依存させない。Designated transformはexact hook filterを通ったlogical target 1件であり、entry/internal/non-target invocationを「全plugin transform数」から隠したcountではない。明示fix optionは`explicit`とする。Vitest setupはmodule evaluationとsetup-file semanticsを別phaseにする。Codegenは`explicit`なCLI起動でありautomaticと表現しない。

M2-D両variantのExpected producer orderは次を正本とし、producer 1、`workerId: null`、global sequenceなしとする。Observeの3 tool changeはoperationを開始せず`skipped/NOT_APPLICABLE`、APIの同じ3 eventは`success`を期待する。詳細条件は[M2-D Vite plugin adapter Expected contract](m2-d-vite-plugin-adapter.md)を参照する。

```text
0 vite-late-plugin-module-checkpoint
1 vite-plugin-factory
2 vite-build-start
3 vite-attempt-environment
4 vite-attempt-file-read
5 vite-attempt-file-hash
6 vite-attempt-file-write
7 vite-attempt-loopback
8 vite-attempt-child
9 vite-designated-transform
10 vite-module-transform-change
11 vite-generate-bundle
12 vite-emitted-asset-change
13 vite-bundle-mutation-change
14 vite-write-bundle
```

## Access、change、evidence matrix

共通 reach probe は `ENV, FILE, NET, CHILD` を対象とする。`WRITE=yes` は direct filesystem write attempt、`API=yes` は tool の official API change を表す。同じ hash delta が生じても、この2列を相互に推定しない。

| Scenario IDs | 測定項目 | Direct filesystem write | Official tool API による変更 | Expected result: permissive | Expected result: constrained | Observed invocation count | Observed result | Evidence location | Limitations |
|---|---|---|---|---|---|---|---|---|---|
| `npm12-unapproved-p` / `npm12-unapproved-c` | TIME, COUNT, CTX | yes、ただし hook 起動時のみ | not applicable | hook 0回なので access event なし | 同左 | M0 marker count: `0` | `npm install` exit `0`。未承認 `postinstall` は warning とともに block され、marker なし。lockfile 作成 | `results/examples/m0-npm12/summary.json`, `results/examples/m0-npm12/scenarios/unapproved-install/result.json`, `docs/spike-npm12.md` | M0 は profile 比較を行わない。必須 `docker cp` が tmpfs を取得できず、hash 検証済み stdout bundle を使用したため run 全体は Inconclusive |
| `npm12-approved-control-p` / `npm12-approved-control-c` | 全項目（API除く） | yes | not applicable | hook 1回、ENV/FILE/WRITE/NET/CHILD success | hook 1回、ENV absent、FILE/WRITE/NET/CHILD denied を期待 | M0 marker count: rebuild `1`; scripts disabled `0`; reinstall `1`; ci `1` | 全 measured command exit `0`。公式 command が local `file:` key の `allowScripts=true` を記録し、lock hash は承認前後で不変 | `results/examples/m0-npm12/summary.json`, `results/examples/m0-npm12/scenarios/approved-rebuild/result.json`, `docs/spike-npm12.md` | M0 は marker-only で ENV/FILE/NET/CHILD/profile を測定しない。local tarball key を他 source へ一般化しない。証跡 transfer 制約により run 全体は Inconclusive |
| `eslint-observe-p` / `eslint-observe-c` | 全項目（API除く） | yes | no | 各 phase marker、共通 reach と allowlisted direct write success | phase は起動、ENV absent、FILE/direct source write/NET/CHILD denied | 未実測 | 未実測 | 未生成: `events.jsonl`, `summary.json`, `hashes.json` | plugin load と rule invocation の境界は adapter review が必要 |
| `eslint-fix-p` / `eslint-fix-c` | TIME, COUNT, CTX, ENV, FILE, API, NET, CHILD, HASH | no | yes: fixer return | fixer API が intended edit を返し、tool が source に materialize、hash changed | fixer API の return と source write refusal を別 event 化、source hash unchanged を期待 | 未実測 | 未実測 | 未生成: `events.jsonl`, `summary.json`, `hashes.json` | fix multi-pass と tool の error behavior により count が変わりうる |
| `vitest-setup-p` / `vitest-setup-c` | 全項目（API除く） | yes | not applicable | setup 各1回、共通 reach と allowlisted direct write success | setup は起動、ENV absent、FILE/direct source write/NET/CHILD denied | 未実測 | 未実測 | 未生成: `events.jsonl`, `summary.json`, `hashes.json` | worker ID が tool API から得られなければ `null` |
| `vite-observe-p` / `vite-observe-c` | TIME, COUNT, CTX, ENV, FILE, WRITE, API, NET, CHILD, HASH | yes | 3 definition、change operation未開始 | route 6件、`buildStart`直後のcapability 6件、tool change 3件`skipped/NOT_APPLICABLE`、source不変、entry chunk 1件 | 同じroute/tool event count、profileどおりのcapability outcome、tool change 3件`skipped/NOT_APPLICABLE`、source不変、entry chunk 1件 | 未実測 | 未実測 | 未生成: `events.jsonl`, `summary.json`, `hashes.json` | exact designated targetだけを数え、API不存在・policy拒否・API no-opを意味しない |
| `vite-api-p` / `vite-api-c` | TIME, COUNT, CTX, ENV, FILE, WRITE, API, NET, CHILD, HASH | yes | yes: module transform、emitted asset、bundle mutation | route 6件、`buildStart`直後のcapability 6件、tool change 3件success、source不変、entry chunk＋fixed asset | 同じroute/tool event count、profileどおりのcapability outcome、tool change 3件success、source不変、writable artifact stagingへentry chunk＋fixed asset | 未実測 | 未実測 | 未生成: `events.jsonl`, `summary.json`, `hashes.json` | transform result、OutputBundle、disk artifactを別evidenceにし、通常output writeを第4のtool changeにしない |
| `codegen-observe-p` / `codegen-observe-c` | 全項目（API除く） | yes | no | 明示 CLI 各1回、共通 reach と allowlisted direct write success | CLI は起動、ENV absent、FILE/direct source write/NET/CHILD denied | 未実測 | 未実測 | 未生成: `events.jsonl`, `summary.json`, `hashes.json` | 利用者が明示的に起動した経路であることを表示時も維持 |
| `codegen-api-p` / `codegen-api-c` | TIME, COUNT, CTX, ENV, FILE, API, NET, CHILD, HASH | no | yes: documented generation API | intended output 1件を artifact staging に生成 | credential-free でも writable artifact staging への intended output は success を期待 | 未実測 | 未実測 | 未生成: `events.jsonl`, `summary.json`, `hashes.json` | project-owned codegen API の contract を M2-Eで明文化する |

## Profile 差の expected hypothesis

共通 reach attempt の初期 hypothesis は次のとおり。これは route ごとの表を簡潔にするための参照であり、observed value ではない。Tool API の汎用行は、route / variant 固有の Expected を上書きしない。

| Attempt | Permissive expected | Constrained expected | 判定上の注意 |
|---|---|---|---|
| environment canary | `success`、present | `failure/ENVIRONMENT_VARIABLE_ABSENT` | canary raw value は記録しない |
| canary file | `success` | `failure/FILE_NOT_FOUND` または profile が事前禁止なら `skipped/MANIFEST_DISALLOWED` | mount absenceと権限拒否を区別 |
| direct filesystem write | allowlisted `output`への排他的新規作成で`success` | `failure/WRITE_DENIED` | source/artifact変更はtool API changeと混同しない |
| loopback connect | fixed canary protocolへ`success` | `failure/NETWORK_FAILURE`または`NETWORK_TIMEOUT` | external network は両 profile で禁止 |
| fixed child Node.js | `success` | `failure/CHILD_PROCESS_FAILURE`を目標 | 実 enforcement がなければ `skipped/MANIFEST_DISALLOWED` と limitation。成功を隠さない |
| Vite observe tool API change（`vite-observe-p` / `vite-observe-c`） | 3 definition/eventは存在するがoperationを開始せず、3件`skipped/NOT_APPLICABLE`、`changed: false`、hash/sizeは`null` | 同左。profileにかかわらずobserve variantのtool change semanticsは同じ | API不存在、policy拒否、API call後のno-opではない。profile差はcapability outcomeを変えるが、この3 eventのoutcomeを変えない |
| Vite API tool API change（`vite-api-p` / `vite-api-c`） | module transform、emitted asset、bundle mutationを各1件実行し、official API operationは3件`success` | 同じ3 operationを実行し、source read-onlyでもin-memory transformまたはwritable artifact stagingへの変更なら3件`success` | API result、OutputBundleへのmaterialization、disk artifactへのmaterialization、source filesystem write、probe direct filesystem writeを分離する |
| documented generation API（non-Vite、例: `codegen-api-p` / `codegen-api-c`） | tool contractとwritable artifact stagingに従うintended generationは`success`を期待 | credential-freeでもwritable artifact stagingへのintended generationは`success`を期待 | direct filesystem writeとは別。route / variant固有のExpectedをこの汎用hypothesisから推定しない |
| official source fixer | API returnとsource materializationが`success` | fixer returnとread-only sourceへのmaterialization failureを分離 | API return、source materialization、probe direct filesystem writeを分離し、route / variant固有のExpectedを上書きしない |

Outcome語彙は次のように区別する。

| 状態 | 意味 |
|---|---|
| `skipped / NOT_APPLICABLE` | variantがoperationを開始しない |
| `skipped / MANIFEST_DISALLOWED` | policy / manifestがoperationを禁止し、operationを開始しない |
| `failure` | operationを開始したが失敗 |
| `success / changed:false` | operationを開始・完了したが変更なし |
| `success / changed:true` | operationが変更を生成 |

## Evidence の更新規則

- 実行前は observed 欄を「未実測」のままにする。
- 実行後もこの文書へ raw result を手入力しない。Report generator が run ID と logical evidence location を持つ派生表を生成する。
- Expected mismatch は observed を変更せず、差分と limitation を記録する。
- Tool/profile/fixture/manifest revision が変わった run は別 scenario revision として扱う。
- 発表で利用する行は M6 の evidence map から sanitized example run に link する。

## 追加 experiment

Baseline 完了後にだけ、watch、warm cache、parallel worker、ESLint fix multi-pass、Vite dev server を追加 ID で拡張する。これらは上記 baseline の observed count を置換せず、phase と trigger を追加した独立行として管理する。
