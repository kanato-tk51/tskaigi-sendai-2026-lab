# Experiment protocol

## この文書の責務

この文書は、scenario の記述、probe/adapter の観測責務、event schema、hash、redaction、反復と結果判定の正本である。許可・禁止される能力は [threat-model.md](threat-model.md)、scenario catalog と expected hypothesis は [experiment-matrix.md](experiment-matrix.md) を正本とする。

## 比較原則

- route と実行権限を別の独立変数として扱う。
- module evaluation、tool initialization、file/module hook、official API callback を異なる `phase` として記録する。
- 自動起動、設定読込による起動、利用者が明示した CLI 起動を異なる `triggerType` として記録する。
- direct filesystem write は `capability-attempt`、official tool API change は
  `tool-api-change` として、別の `eventKind` で記録する。
- expected は実行前に version control し、observed は raw event から機械生成する。
- access の拒否も観測結果であり、scenario 全体の失敗とは限らない。

## Probe の責務

`probe-core` は tool 非依存の明示的な関数呼び出しとして、以下を行う。

- manifest と adapter から受け取った run context を検証する。
- invocation marker と個々の capability attempt を、順序を保った event として生成する。
- 列挙済みの `PROBE_CANARY_` key だけについて存在/到達を確認する。
- allowlisted canary file、write target、loopback HTTP、fixed child script だけを対象にする。Unix socketはM1未実装である。
- direct filesystem write capabilityをofficial tool API change eventと混ぜない。
- duration と normalized outcome/error を記録し、raw value と host absolute path を捨てる。
- producer 単位の append-only JSONL segment を出力する。

`probe-core` は import 時に probe を開始しない。module evaluation を測る必要がある adapter は、意図が明記された tool-specific fixture entry から `probe-core` の関数を明示的に呼ぶ。

M1 では `probe-manifest/v2`、`probe-runtime-bindings/v1`、`probe-event/v2` を実装した。Manifest は run/scenario/route/producer/cwd、許可 phase/trigger の一覧、capability attempt、route invocation、tool API change target/definition の logical ID と resource limit を持つ。Host absolute path と port は runtime binding にだけ置く。同期のstructural validationは両方を副作用なしでcross-validationし、unknown field/type、重複 ID、missing/extra binding、型の不一致、lexical file path重複を拒否する。

Structural validationは外部入力を保持せず、検証済みprimitive scalarからmanifest、target、attempt、binding、配列を新規作成したcanonical immutable snapshotを返す。通常のplain object/arrayのown data propertyだけを入力境界として認め、Proxy、accessor、custom prototype、symbol property、疎な配列を拒否する。返却snapshotはnested valueまでfreezeし、実行側は返却objectとは別のprivate immutable snapshotだけを参照する。このため、validation後に元入力または返却objectを変更しても、enabled、attempt/target IDとtype、environment name、path binding、loopback address/port、timeoutは変化しない。

`prepareProbeConfiguration(validated)`は非同期runtime file preflightを行う。既存を前提とするread/hash targetについてcanonical root、canonical target、root containment、regular file、device/inodeを取得し、異なるtarget IDのcanonical pathまたはfile identity共有を拒否する。Outputはcanonical parentとbasenameからplanned canonical pathを作り、既存read/hash targetまたは別outputとのplanned path共有を拒否する。全targetのpreflight完了後だけprivate `WeakMap` snapshotに結び付いたdeeply frozen prepared configurationを返す。失敗時はprepared objectを返さず、session、segment、capability attempt、network、child、marker writeを開始しない。

M1のpublic APIはstructural validation、runtime preparation、stable event validation/serialization、sink所有session、固定capability attempt、route invocation記録、tool API change記録、error normalizationを分離する。Raw binding/path/target IDを受け取るpublic hash helperはexportしない。Source/artifactのSHA-256はprepared configurationに宣言済みの`file-hash` attempt IDを`session.runAttempt()`へ渡す経路だけで取得する。Arbitrary event/detailsを作るfactoryはpublic exportしない。Producer JSONL sinkはsessionが同じprepared configurationから内部生成して所有し、任意callbackや別configurationのsinkを注入するpublic APIは提供しない。`runAttempt(attemptId)`、`recordRouteInvocation(routeInvocationId, result)`、`recordToolApiChange(toolApiChangeId, result)`は同じsession lifecycle、failure state、producer sequence、sinkを共有する。後二者の`result`は固定keyだけのplain objectであり、raw path/content/diff/error、arbitrary details、callbackを受け取らない。

Event validator/sanitizer/serializerは対応するvalidated manifest contextを必須とし、event kind別semantic invariantを同時に検証する。runtime binding に executable、script、argument、URL、HTTP method/body、write content は存在しない。万能 command/request/path/callback API は提供しない。

File targetには用途を固定unionで宣言する。`file-read`は`classification: "canary"`、`file-hash`は`"source" | "artifact"`、`file-write`は`"output"`だけを受け入れる。任意labelは認めず、canaryをfile-hashへ割り当てるmanifestをstructural validationで拒否する。異なるread/hash/write targetがlexical path、canonical path、既存file identity、planned output pathのいずれかを共有するbindingは、classificationが同じ場合も異なる場合もpreflightで拒否する。

## Adapter の責務

各 adapter は tool API と共通 protocol の境界である。

- route、phase、trigger type、tool version、worker identifier を run context に写像する。
- tool 固有 callback の起動ごとに invocation marker を記録する。
- 対象 file/module を logical fixture ID に正規化する。
- fixer、transform、`generateBundle`、emit/generate などの official API を通じる変更を tool 固有の方法で返す。
- official API の変更を `probe-core` に直接書き込ませない。
- tool の callback 回数、cache hit、worker context を推測で補完しない。
- tool が提供しない context は `null` とし、PID や filename から worker ID を捏造しない。

Adapter 内の module-evaluation marker は測定対象として意図的に配置できるが、再利用 library 部分の import-time side effect にはしない。

### M2-B ESLint adapter mapping

M2-BはESLint `9.39.5`、ESM、flat config、1 JavaScript fixtureを固定し、`lint-only`と`fix`を別scenarioとして実行する。両scenarioともcache、watch、config discovery、glob input、concurrencyを無効にする。Plugin routeはmodule evaluation、plugin initialization、rule create、Program visitor、fixer callbackをそれぞれ`route-invocation`として記録し、phaseは`module-evaluation`、`plugin-initialization`、`rule-create`、`visitor-callback`、`fixer-callback`、triggerは`configured`とする。Runnerの明示起動をplugin routeのtriggerへ転記しない。

最初のProgram visitorだけがenvironment canary read、canary file read、source snapshot hash、dedicated output marker write、固定loopback HTTP、fixed child Node.jsを各1回queueする。ESLint fix multi-passでrule/visitorが再実行されてもcapability attemptを繰り返さず、route eventは実呼出しをすべて保持する。

Lint-onlyではofficial API changeを`skipped/NOT_APPLICABLE`として記録する。Fixではfixer callbackが固定literal rangeのreplacementをESLintへ返し、harnessが`ESLint.outputFixes()`をawaitした後、`official-api-change`/`explicit`の`source-fix` eventへchanged、before/after SHA-256、before/after byte sizeだけを記録する。Plugin/rule sourceはNode.js filesystem APIをimportせず、fixtureを直接変更しない。Dedicated outputへのdirect writeは別の`capability-attempt`であり、source fixと同一event/hashへ統合しない。

M2-Bが生成するのはschema validation済みproducer-local raw segmentまでである。Event kindをまたぐproducer sequenceは0始まり連番とするが、global sequence、canonical merge、summary/Markdown report、experiment matrixのObserved更新はM3の責務である。実装条件とlocal contract countは[M2-B adapter note](m2-b-eslint-adapter.md)を参照する。

### M2-C Vitest setupFiles adapter mapping

M2-CはVitest `3.2.7`、explicit config、`configLoader: runner`、`forks`/`singleFork`、worker 1、setup/test fileとtest case各1、watch/cache/file parallelism/retry無効を固定する。Installed runnerはsetup fileを`await runner.importFile(setupPath, "setup")`で1回importし、export callbackを別途呼ばない。2 route eventは別callbackではなく、その同じawaited import内の`setup-file-late-module-checkpoint`/`configured`/`module-evaluation`と`setup-file-body-checkpoint`/`automatic`/`setup-execution`である。前者はevaluation開始ではなく、static import、`inject`、context validation、preparation、session作成後に到達する。Pre-checkpoint failureでrouteが0件でも、module未評価またはvalid zero-route observationとは判断しない。Test file自身はrouteへ含めない。

Coordinator global setupはexact runtime versionとresolved config、fixed manifest/runtime bindingを検証し、official `provide`へserialized contextだけを渡す。Fork worker setupはofficial `inject`後にstructural validationとruntime preparationを再実行し、prepared configuration、session、sink、segmentをworker内で作成・closeする。Parentからprepared object、session、sink、file handle、Promise、callback、raw canaryを渡さない。Vitestのpublic worker IDをPID/filename/internal stateから補完せず`null`にする。

Producer orderはlate-module checkpoint、setup-body checkpoint、environment/file-read/file-hash/direct-write/loopback/fixed-childの6 attemptで、Expectedはsequence `0..7`の8 eventである。Vitest/Viteのtransform/cache/config temporary writeはprobe capabilityと別である。Coordinatorの`TMPDIR`/`TMP`/`TEMP`とproject temp/cacheをrun root内へ固定する。Config tempはrepository root固定ではなく、Vite `6.4.3`が固定configから上方向に選ぶ実際のadapter-local nearest `node_modules/.vite-temp`を対象とする。`lstat`ではENOENTだけをabsentとし、pre-existing file/directory/symlink、permission/unknown error、canonical parent/identity mismatchをfail closedにして既存stateを削除しない。`configLoader: runner`でもpre/post absentを検査し、全filesystem raceを防いだとは扱わない。Linuxのdirect-spawn専用process groupをTERM、bounded grace後にKILLし、coordinator closeの`code: null`/期待signal dispositionとworker/pool消滅を確認するまではloopback/environment/temp/run-root cleanupへ進まない。Signal failure、close deadline、unexpected disposition、process residueでsettlement不明なら競合cleanupを抑止する。Timeout/output-limitをprimaryに保持し、termination/cleanup failureはsecondaryにする。Unexpected route/producer/event/temp/process residueはrun failureにする。Vitest production artifact APIを捏造せず、`toolApiTargets`/`toolApiChanges`とtool eventはいずれも0とする。Direct output markerだけが別の`direct-filesystem-write` capabilityである。詳細は[M2-C adapter note](m2-c-vitest-setup-adapter.md)を参照する。

## Scenario manifest

Scenario manifest は、実行前に固定する入力と期待値を宣言する。raw canary value や host absolute path は含めない。最低限、次の項目を持つ。

| Field | 意味 |
|---|---|
| `schemaVersion` | manifest schema version |
| `scenarioId` | profile と variant を含む安定 ID |
| `route` | 5つの実行経路のいずれか |
| `phases` | producerが使用できるadapter固有phase IDの重複なしallowlist |
| `triggerTypes` | `automatic` / `configured` / `explicit` の重複なしallowlist |
| `profile` | permissive または constrained |
| `fixture` | repository 内 fixture の logical ID と immutable input |
| `tool` | tool ID。version は lockfile/実行環境から実測して event に入れる |
| `capabilities` | environment/file/write/network/child/API attempt ごとの有効化 |
| `allowedPaths` | logical root と、その下で許可する read/write の宣言 |
| `canaryKeys` | `PROBE_CANARY_` prefix の列挙済み key name |
| `networkTargets` | loopback/Unix socket の logical target |
| `childTarget` | `process.execPath` と固定 script/arguments の宣言 |
| `expected` | phase 別 invocation count と capability outcome の hypothesis |
| `repetitions` | 明示した正の整数。暗黙の再試行はしない |
| `timeouts` | scenario、tool、attempt ごとの上限 |
| `outputs` | event segment、hash、artifact staging の logical destination |

Validation は unknown field、重複 ID、prefix 外 environment key、external network、allowlist 外 path、arbitrary child command、非正数 repetition/timeout を拒否する。profile の定義と manifest が矛盾する場合、より厳しい側へ黙って補正せず preflight error とする。

Capability attempt、route invocation、tool API changeの各definitionは、allowlist内のphase/triggerを1つ事前選択する。Phase IDは1–64文字の`[A-Za-z0-9][A-Za-z0-9._-]*`で、重複、separator、control characterを拒否する。Logical unit IDも同じ制約であり、raw absolute/relative pathを入れられない。

## Route、phase、trigger type

Route は起動経路、phase はその経路内の時点、trigger type は利用者操作との関係を表す。

| Dimension | 値の例 |
|---|---|
| `route` | `npm-install-lifecycle`, `eslint-plugin`, `vitest-setup`, `vite-plugin`, `codegen-cli` |
| `phase` | manifestで事前承認するadapter固有ID。例: `module-evaluation`, `tool-initialization`, `file-hook`, `official-api-change` |
| `triggerType` | `automatic`, `configured`, `explicit` |

`automatic`はdependency acquisitionやtool command開始後にtoolが自動的に呼ぶlifecycle/hook、`configured`は設定へdependency/plugin/setupを記載した結果の読込・初期化、`explicit`は利用者がdependencyのCLIやfix/generation stageを明示的に選んだ起動である。同一producerでもphaseにより変化し得るためsession-wide固定値にはせず、manifest allowlistと各definitionで固定する。

## Event schema

M1 producer event は `probe-event/v2` の1行1 JSON object とする。`eventKind`でdiscriminateし、common fieldは全kindで持つ。Kind固有fieldは他kindではabsentとし、意味のある「未存在」だけを`null`にする。Capability detailsを除きarbitrary object fieldを持たない。Top-level と capability `details` はschema-defined key orderへ正規化してUTF-8/LFのJSONLにする。

| Field | Type | 規則 |
|---|---|---|
| `schemaVersion` | string | M1 remediation C は `probe-event/v2` |
| `eventKind` | string | `capability-attempt`, `route-invocation`, `tool-api-change` |
| `runId` | string | 1回の scenario execution の logical ID |
| `scenarioId` | string | manifest の安定 ID |
| `route` | string | 固定 route union |
| `phase` | string | manifest `phases` allowlist内の事前承認ID |
| `triggerType` | string | manifest `triggerTypes` allowlist内の固定union |
| `adapterVersion` | string | adapter contract version。M1 unit testでは test adapter の値 |
| `producerId` | string | process/worker segment producer の logical ID |
| `producerSequence` | integer | producer/session 内の0始まり単調増加連番 |
| `timestamp` | string | event 発生時の UTC RFC 3339 timestamp |
| `durationMs` | number | monotonic clock で測った非負の duration |
| `pid` | integer | event producer の process namespace 内 PID |
| `ppid` | integer | 同 namespace 内の PPID |
| `workerId` | string/null | tool が提供した sanitized worker ID。未知なら `null` |
| `cwdId` | string | host cwd ではない logical ID |
| `nodeVersion` | string | 実際に動いた Node.js version |
| `toolName` | string | logical tool name |
| `toolVersion` | string | 実際に動いた tool version |
| `outcome` | string | `success`, `failure`, `skipped` |
| `normalizedErrorCode` | string/null | allowlist 済み normalized code |

M1 event に run-global `sequence` はない。`timestamp` と `producerSequence` は複数 process 間の因果順序を保証しない。M3 collector が producer segment を再 validation/redactionし、documented deterministic ingestion order にだけ global sequence を付ける。これは実時間順の証明ではない。

Event入力もarbitrary JavaScript objectとして信頼しない。Canonicalizationはplain own data propertyをdescriptorからcopyし、hashはprimitive stringだけを許可する。Capability `details`はattempt type別の既知keyとprimitive scalarだけから内部生成する。Route/tool recording inputも固定keyだけで、unknown key、nested details、Proxy、accessor、custom prototype、`toJSON`を拒否する。Canonical eventとdetailsは新規plain-data objectとしてdeep freezeし、serializationは外部objectを保持または再読込せず、外部提供のcoercion/`toJSON`を実行しない。

PID/PPID は実値を保持するが container/process namespace 内の観測値であり、run 間の同一性に使わない。比較では「同じ/異なる process」「親子関係」「worker label」の構造に変換する。

## Event kind

| `eventKind` | 意味 |
|---|---|
| `capability-attempt` | probe-coreがallowlisted capabilityへ到達を試みた結果 |
| `route-invocation` | dependency codeのmodule/hook/stageが特定phaseで呼ばれた事実 |
| `tool-api-change` | official extension API経由のsource/artifact変更結果 |

`capability-attempt`だけが次の`attemptType`、`attemptId`、capability `targetId`、before/after hash、固定`details`を持つ。

| `attemptType` | 意味 |
|---|---|
| `environment-canary-read` | 列挙済み canary key の到達確認 |
| `canary-file-read` | allowlisted canary file の read attempt |
| `direct-filesystem-write` | probe による明示的な filesystem write |
| `loopback-connect` | manifest 指定 loopback service への通信 |
| `child-node-process` | fixed child Node.js の起動 |
| `file-hash` | binding 済み regular file の before/after SHA-256 snapshot |

`route-invocation`は`routeInvocationId`、固定`invocationKind`、pathではない`logicalUnitId`を持つ。`invocationKind`は`module-evaluation`, `lifecycle-hook`, `tool-initialization`, `plugin-factory`, `rule-create`, `visitor-callback`, `fixer-invocation`, `setup-execution`, `file-hook`, `module-hook`, `build-hook`, `cli-stage`のunionである。Invocation countはこのevent件数からM3で集計し、probe-coreはsummary/global countを保持しない。

`tool-api-change`は`toolApiChangeId`、`changeKind`、`targetId`、`targetClassification`、`changed`、before/after hash、before/after byte sizeを持つ。`changeKind`は`source-fix`, `source-generation`, `module-transform`, `emitted-asset`, `emitted-chunk`, `bundle-mutation`のunionである。前三者は`source`、後三者は`artifact` targetに限定する。Source generation/emitted asset/emitted chunkは生成前hash/sizeを`null`とし、生成時だけafter値を必須にする。その他はsuccess時にbefore/afterを必須とし、`changed: false`ならhash/sizeが一致する。Failure/skippedは`changed: false`かつhash/sizeをすべて`null`にする。Source、artifact内容やdiffは保存しない。

## Outcome の定義

- `success`: 宣言されたoperationを実行し、対象operationが成功した。canary値そのものは保存しない。
- `failure`: operationを実行したが、対象への到達または処理が失敗した。profileによるOS/containerの拒否も、実際にattemptしたなら`failure`である。
- `skipped`: manifest/profileがoperationを許可していない、route/phaseが適用不能、または明示された前提が満たされず、operationを開始していない。理由codeを必須にする。

`failure` は scenario runner の故障を意味しない。逆に、期待どおり拒否された attempt を `success` に書き換えない。schema error、collector loss、unexpected timeout は access outcome と別の run validity として `invalid` または `inconclusive` に集計する。

### M1 event semantic invariant

内部factory、validator、sinkは同じevent kind別semantic ruleを利用する。Capabilityでは`success`はerror codeなし、`failure`はattempt別allowlistのerror code必須、manifest disabledは`skipped/MANIFEST_DISALLOWED`と`{ kind: "skipped" }`だけを許可する。Route/tool definitionがenabledなら`success`、固定failure code、または`skipped/NOT_APPLICABLE`を許可し、disabledなら`skipped/MANIFEST_DISALLOWED`だけを許可する。

| Attempt | `success` | `failure` | Hash / details の追加規則 |
|---|---|---|---|
| environment | `present: true`かつbyte length必須 | absentは`ENVIRONMENT_VARIABLE_ABSENT`、`present: false` | before/after hash禁止 |
| file read | `present`、`regularFile`、`readSucceeded`がtrueでsize必須 | operation別code、`readSucceeded: false` | before/after hashを常に禁止。missing/non-regularとdetailsを一致させる |
| file write | `beforeHash: null`、after hash必須 | before/after hashともnull | 固定markerの排他的新規作成だけ。marker schemaは固定値 |
| loopback | fixed status/header/body完全一致、`protocolVerified: true`、`timedOut: false` | network code、`protocolVerified: false` | hash禁止。`NETWORK_TIMEOUT`とabsolute deadline超過/`timedOut: true`は同値 |
| fixed child | exit 0、固定response確認済み、timeoutなし、stderr 0 | child codeだけ、固定response未確認 | hash禁止。timeout codeには`timedOut: true`と非成功exitを要求 |
| file hash | `state: present`、size必須、manifest指定positionのhashだけ | 両hashとsizeはnull | `FILE_NOT_FOUND`と`state: missing`は同値。それ以外のfailureは`unavailable` |

Type別allowlistには当該operationが生成しうるpath/size/type/permission/network/child/internal codeだけを含め、別typeのcodeを拒否する。

実装の normalized code union は次のとおりである。

```text
INVALID_MANIFEST INVALID_TARGET PATH_OUTSIDE_ALLOWED_ROOT PATH_TRAVERSAL
SYMLINK_ESCAPE ENVIRONMENT_VARIABLE_NOT_ALLOWED ENVIRONMENT_VARIABLE_ABSENT
FILE_NOT_FOUND FILE_ALREADY_EXISTS FILE_TOO_LARGE FILE_NOT_REGULAR
FILE_TARGET_LEXICAL_ALIAS FILE_TARGET_CANONICAL_ALIAS
FILE_TARGET_IDENTITY_ALIAS FILE_TARGET_OUTPUT_ALIAS
READ_DENIED HASH_DENIED WRITE_DENIED NON_LOOPBACK_TARGET NETWORK_TIMEOUT
NETWORK_FAILURE NETWORK_PROTOCOL_ERROR NETWORK_RESPONSE_TOO_LARGE
CHILD_PROCESS_TIMEOUT CHILD_PROCESS_FAILURE CHILD_OUTPUT_TOO_LARGE
SERIALIZATION_FAILURE EVIDENCE_WRITE_FAILURE SEGMENT_LIMIT_EXCEEDED
SESSION_NOT_OPEN MANIFEST_DISALLOWED NOT_APPLICABLE
ROUTE_INVOCATION_FAILED TOOL_API_CHANGE_FAILED INTERNAL_ERROR
```

Exceptionの`code`はProxy/accessorを拒否したown data propertyからだけ読み、throwing getter、Proxy、non-object、unknown codeは`INTERNAL_ERROR`とする。raw message、stack、absolute pathはproducer eventに入れない。

## Before/after hash

M1の`file-hash`は`source`または`artifact`に分類し、preflight時に存在とidentityを確認した最大1 MiBのregular fileをstreaming SHA-256し、`sha256:<hex>`で表す。Preflight時のmissingはeventではなくconfiguration failureであり、preflight後のcooperative filesystem上の消失だけをdigestなしの`{ state: "missing", hash: null }`として扱う。`file-read`はcanary reachability確認であり、内容を読み捨ててsizeだけを残し、低entropy canaryのcontent hashを生成・保存しない。Tree hashとofficial API materialization hashは後続milestoneの責務である。

- M1 capability `file-hash`の対象はmanifestが列挙したsource/artifact regular fileだけに限定する。Tree hashは未実装である。
- Fileはbyte sequenceのSHA-256とする。将来tree hashを追加する場合はnormalized relative path、entry type、file digestのdeterministic manifestを別contractで定義する。
- M1 file hashはroot内へ解決されるsymlinkをfollowして解決先regular fileをhashし、root外escapeを拒否する。将来tree hashでlink自体を表現する場合は別schema/policyを事前承認する。
- metadata timestamp、owner、host absolute path は hash 入力にしない。
- missing は digest と混同しない schema-defined state として表す。
- `tool-api-change`のhash/sizeはadapterがofficial API resultについて計算したcanonical scalarである。Toolがmaterializeしたfileは別の`file-hash`/harness evidenceで検査し、一つのhash fieldへ混ぜない。
- hash 変化だけから変更経路を推定せず、`eventKind`、capability `attemptType`、tool change eventを併用する。

## Canary redaction

- environment は target の logical ID、present boolean、UTF-8 byte lengthだけを残す。raw key/value、prefix/suffix、value hash を残さない。
- canary fileはlogical target ID、存在/regular/read成否、sizeだけを残し、content、content hash、prefix、encoding/entropy情報、host pathを残さない。Source/artifactの明示的`file-hash`とは別capabilityとして扱う。
- service response は固定 protocol の success marker に変換し、payload を保存しない。
- child output は固定 exit status/sanitized marker だけを残す。
- producer と collector の両方で redaction し、collector validation を通らない event は canonical raw JSONL に混ぜず run を invalid とする。

## Path normalization

Manifest は `repo`, `fixture`, `scratch`, `artifact`, `results` などの logical root を宣言する。event/report は `<repo>/...`, `<fixture>/...`, `<scratch>/...` のような placeholder と POSIX separator を使う。

操作前には platform API で canonical path を求め、宣言 root 内にあることを component boundary で検証する。文字列 prefix 一致だけを使わない。`..`、unexpected absolute path、NUL、special file、root 外 symlink は拒否する。error の path も collector が同じ規則で置換し、置換できない absolute path は削除する。

Structural validationとruntime file preflightのerrorは区別する。完全に同じresolved lexical pathは`FILE_TARGET_LEXICAL_ALIAS`、異なる文字列から同じrealpathへ解決される場合は`FILE_TARGET_CANONICAL_ALIAS`、canonical pathが異なってもdevice/inodeが同じ既存fileは`FILE_TARGET_IDENTITY_ALIAS`、存在しないoutputのplanned canonical path共有は`FILE_TARGET_OUTPUT_ALIAS`である。これらのerrorはcodeだけを公開し、canonical host path、device、inodeをmessage、event、JSONLへ入れない。

実装上のsymlink policyは次の範囲である。

- `rootPath`自身がsymlinkなら`realpath`で解決し、解決先directoryをcanonical rootとする。
- read/hashはroot内symlink（final targetまたはparent）を解決してよいが、最終`realpath`がcanonical root外なら`SYMLINK_ESCAPE`にする。Dangling final symlinkは`FILE_NOT_FOUND`になる。
- direct writeは既存final targetを変更しないため、root内向けを含むfinal symlinkとdangling symlinkを`SYMLINK_ESCAPE`にする。Parent symlinkは`realpath`し、root内なら許可、root外なら拒否、dangling parentは`FILE_NOT_FOUND`にする。
- read/hashの異なるtargetは、解決後canonical pathまたはdevice/inodeが一致するsymlink alias/hard-link aliasをsession開始前に拒否する。Outputはcanonical parentとbasenameからplanned pathを作り、既存read/hashと別outputとの重複を拒否する。存在しないoutputにはpreflight時点のdevice/inodeはない。
- `O_NOFOLLOW`はread/hashのcanonical final file descriptorとwriteの新規final target openに適用する。Root/parent component全体をdescriptor-relativeに固定するものではない。
- Hard linkはpreflight時に存在するaliasを検出するが、preflight後のparent swap/rename、bind mount変更、新規hard link、filesystem identityの悪意ある再利用、敵対的な同一UID filesystem操作は防がない。Disposableでcooperativeな実験directoryを前提とし、OS-level filesystem sandboxとは主張しない。

## Timeout と resource limit

- scenario、tool process、個別 network/child attempt の timeout を manifest に必須化する。
- timeout は monotonic clock で測り、どの layer が発火したかを normalized code に記録する。
- harness は保持している process handle へ直接 termination signal を送り、shell command を組み立てない。
- timeout 後の欠落 event を成功/0回として扱わず、run を incomplete または inconclusive にする。
- event size、event count、stdout/stderr、file output、process count に上限を設ける。具体値は実装 milestone で fixture 実績から決め、version control する。

M1 ではattempt timeoutを1–10,000 ms、fileを最大1 MiB、child stdout+stderrを最大4,096 bytes、network response/headerを各最大4,096 bytes、serialized JSONL event 1行（LF込み）を最大16,384 bytesとした。Producer segmentは最大1,024 event、合計4 MiBである。1,024 eventは将来adapterの単一run内の想定呼出回数へ余裕を持たせ、4 MiBは無制限なdisk消費を避けながら最大eventを多数収容する固定policyであり、callerは拡張できない。

HTTP canaryは数値`127.0.0.1`/`::1`だけへ、固定`GET /probe-canary`、status`200`、header`x-tskaigi-probe-canary: probe-network-v1`、body`probe-network-v1\n`を要求する。固定値はprobe-core内部にありmanifest/bindingから変更できない。DNS、hostname、URL credential、proxy environment、redirect followを使わない。Status/header/body/正常endの完全一致だけを`protocolVerified: true`とし、eventにはheader値やbodyを保存せずstatus、body byte数、一致booleanだけを残す。

Network timeoutはattempt開始時の`performance.now()`から計算したabsolute monotonic deadlineであり、connection、header、body、end待機を一括して制限する。Deadline timerはsocket inactivityとは独立し、到達時にrequest/response/socketをdestroyしてtimerをcleanupする。このためtimeout未満の間隔でbodyをslow-dripしても期限を延長できない。Response header countは32、header byteは4,096、body byteは4,096を上限とし、固定body長を超えた時点でも拒否する。

Fixed childのNode executableとpackage-owned script pathは、validated configurationをtrusted initializationする時点で1回だけ取得し、callerから参照できないprivate snapshotに保持する。実行時に現在のmutableな`process.execPath`を再読込せず、snapshotをauthoritativeとして固定argv、`shell: false`、空environmentでspawnする。Executable、script、argumentをmanifest/runtime binding/eventに受け取らず、raw pathもeventへ保存しない。

## M1 producer segment と後続境界

M1 sessionはprivate brandで認証されたprepared configurationだけを受け取り、`open`、`closing`、`closed`、`failed`を持つ。Unprepared/forged configurationはsink作成前に拒否する。`open`だけがoperationを開始でき、`close()`はstateを同期的に`closing`へ移し、開始済みcapability/route/tool-change operation、そのevent write、sink closeを待つ。同じ`close()`の反復は同じpromise/resultになり、sink failure後は`failed`として新しいoperationを拒否する。Operation outcomeがsuccessでもevidence persistenceがfailureならrecording APIは通常successを返さず、session/runをinvalidと判断できる`EVIDENCE_WRITE_FAILURE`またはsegment limit failureを返す。これは外部副作用とevidenceの完全transactionではなく、副作用をrollbackする保証はない。

M1 sinkはmanifest/bindingで許可された`/tmp`配下の既存temporary directoryに、`<producerId>.jsonl`を排他的に新規作成する。親directoryは作らず、同一process内のwriteをpromise queueで直列化する。Eventをcanonical immutable snapshotへ変換し、serializationと全size checkを完了してからwriteを始め、短いwriteはLFを含むline全体が完了するまで反復する。0 byte/途中/close failureでは最初のnormalized failureを保持したterminal `failed`へ移行し、後続writeを実行しない。途中まで書かれた末尾line、producer sequence gap、limit超過segmentはcomplete evidenceではなく、M3 collectorがsegment全体をinvalidとする。Invalid eventや上限超過を検出したwrite開始前にはpartial lineを作らない。複数processから同じfileへappendせず、1 producerにつき1 segmentを前提とする。

Generic `file-write`は既存canary/source/artifactを変更せず、preflight時に存在せずplanned canonical pathが一意な`output`へ固定markerを`O_CREAT | O_EXCL | O_WRONLY | O_NOFOLLOW`で新規作成する。既存regular file、symlink、dangling symlinkを拒否し、truncate/replace/appendしない。Parent realpathとroot containmentを確認し、作成後は同じopen file descriptorを`fstat`してregular file/sizeを検証する。Eventの`beforeHash`は不在を表す`null`、`afterHash`は完全に書いた固定marker bytesのSHA-256である。同一file targetの複数write定義はmanifestで拒否し、同じattemptの並行呼出しはsession内target lockで直列化する。別targetは並行実行できる。既存fileを変更するofficial tool API scenarioはM2 adapterの責務である。

M0 の stdout framed bundle fallback はM1 event transportとして採用していない。M1 はcollector、canonical merge、global sequence、summary/reportを実装しない。これらはM3の責務である。

M1 の既知の限界は、Unix domain socket targetを未実装であること、event segment temporary rootを現在のLinux実行条件の `/tmp` に限定していること、file identity preflightがdisposableで協調的な実験directoryを前提としておりpreflight後のrename/hard-link/bind-mount raceをsandboxとして解決しないこと、static inspectionがruntime isolationの証明ではないことである。Trusted initializationより前に同一processのglobal、Node built-in、module loader自体を改変できるcodeに対するsecurity sandboxではなく、そのような改変を完全には防止しない。Untrusted dependency codeより先にconfigurationをvalidation/preparation/session初期化することを前提とする。

## Baseline 条件

各 route/profile の baseline は、同じ tool command、fixture、input、cache 設定、worker 設定を用い、probe dependency/configuration だけを読み込まない。baseline でも harness の start/end、tool version、source/artifact hash を記録する。

別途、probe を読み込むが capability attempt をすべて `skipped` にする negative control を必要に応じて設ける。この control と「probe を全く読み込まない baseline」を同一視しない。

Baseline の標準条件は次のとおりである。

- watch 無効
- cache 無効または空の disposable cache
- parallelism/worker 数を manifest で固定した最小構成
- fixture input を run ごとに pristine copy から開始
- canary service と file を run ごとに作り直す
- source/artifact hash が開始時の fixture digest と一致することを preflight で確認

## 反復実行

`repetitions` は scenario ごとに明示し、各 repetition に新しい `runId`、scratch、cache、canary、result segment を割り当てる。自動 retry は別 run として記録し、失敗 run を上書きしない。

単一 run は機能確認には使えるが、再現性の主張には使わない。M6 で発表 claim ごとの必要反復数と許容する変動を事前に決め、全 run と分母を evidence map に残す。PID、timestamp、duration の完全一致は要求せず、invocation count、phase、outcome、hash の安定性を主に評価する。

## Watch、cache、parallelism

Baseline adapter が完了するまでは watch、warm cache、並列 worker を有効にしない。以下は独立した追加 scenario とし、baseline observed result を置換しない。

- watch 開始、初回処理、file change、再処理、shutdown
- cold cache、warm cache、cache invalidation
- single worker と複数 worker
- tool が行う retry または multi-pass fix/transform

追加 scenario は専用 ID、fixture、expected invocation formula、run ID を持つ。worker 数や cache directory が実際に適用された証拠も event/run metadata に残す。

## Expected result と Observed result

- expected は scenario manifest と [experiment-matrix.md](experiment-matrix.md) に、人間がレビューする falsifiable hypothesis として保存する。
- observed は `results/runs/<run-id>/events.jsonl` から reducer が生成する `summary.json` と `comparison.md` にだけ書く。
- manifest/matrix の expected 欄を report generator が変更してはならない。
- 実行前、欠落、invalid run は「未実測」「inconclusive」などを区別し、expected をコピーしない。
- mismatch、unexpected invocation、追加 event、failure、timeout を削除せず、そのまま limitations と evidence location に結び付ける。
- 実行条件を変更した場合は同じ observed result を上書きせず、新しい scenario ID または manifest revision と run ID を使う。
- presentation claim は expected ではなく sanitized observed evidence だけを参照する。

## Run completion と集計

Run は、manifest validation、preflight、`scenario-start`、tool termination、全 producer segment の close、`scenario-end`、schema validation、hash finalization が完了した場合だけ complete とする。Reducer は raw event を変更せず、以下を生成する。

- phase 別 invocation count
- PID/PPID/worker の構造的 summary
- attempt type ごとの success/failure/skipped count
- source/artifact hash delta
- expected/observed diff
- run validity、timeout、collector/schema error
- logical evidence location

Raw JSONL は source of evidence、JSON summary と Markdown table は再生成可能な派生物である。

## 設計時点の仮定

- tool が worker ID を公開しない場合がある。その場合は `null` を正しい observed value とする。
- process 間 event を完全な因果順に並べられないため、global `sequence` は collector の deterministic ingestion order であり、実時間順の証明には使わない。
- tool-specific multi-pass behavior の expected count は adapter milestone で fixture と対象 version を固定した後に具体化する。
