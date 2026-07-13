# Experiment protocol

## この文書の責務

この文書は、scenario の記述、probe/adapter の観測責務、event schema、hash、redaction、反復と結果判定の正本である。許可・禁止される能力は [threat-model.md](threat-model.md)、scenario catalog と expected hypothesis は [experiment-matrix.md](experiment-matrix.md) を正本とする。

## 比較原則

- route と実行権限を別の独立変数として扱う。
- module evaluation、tool initialization、file/module hook、official API callback を異なる `phase` として記録する。
- 自動起動、設定読込による起動、利用者が明示した CLI 起動を異なる `triggerType` として記録する。
- direct filesystem write と official tool API change は別の `attemptType` として記録する。
- expected は実行前に version control し、observed は raw event から機械生成する。
- access の拒否も観測結果であり、scenario 全体の失敗とは限らない。

## Probe の責務

`probe-core` は tool 非依存の明示的な関数呼び出しとして、以下を行う。

- manifest と adapter から受け取った run context を検証する。
- invocation marker と個々の capability attempt を、順序を保った event として生成する。
- 列挙済みの `PROBE_CANARY_` key だけについて存在/到達を確認する。
- allowlisted canary file、write target、loopback/Unix socket、fixed child script だけを対象にする。
- direct filesystem write attempt を official tool API attempt と混ぜない。
- duration と normalized outcome/error を記録し、raw value と host absolute path を捨てる。
- producer 単位の append-only JSONL segment を出力する。

`probe-core` は import 時に probe を開始しない。module evaluation を測る必要がある adapter は、意図が明記された tool-specific fixture entry から `probe-core` の関数を明示的に呼ぶ。

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

## Scenario manifest

Scenario manifest は、実行前に固定する入力と期待値を宣言する。raw canary value や host absolute path は含めない。最低限、次の項目を持つ。

| Field | 意味 |
|---|---|
| `schemaVersion` | manifest schema version |
| `scenarioId` | profile と variant を含む安定 ID |
| `route` | 5つの実行経路のいずれか |
| `phases` | 観測対象 phase の列挙 |
| `triggerType` | automatic / config-load / explicit-cli の区別 |
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

## Route、phase、trigger type

Route は起動経路、phase はその経路内の時点、trigger type は利用者操作との関係を表す。

| Dimension | 値の例 |
|---|---|
| `route` | `npm-install-lifecycle`, `eslint-plugin`, `vitest-setup`, `vite-plugin`, `codegen-cli` |
| `phase` | `install-lifecycle`, `module-evaluation`, `tool-initialization`, `file-hook`, `setup-file`, `transform-hook`, `generate-bundle-hook`, `fixer-api`, `explicit-cli-main`, `generation-api`, `harness` |
| `triggerType` | `dependency-acquisition`, `configuration-load`, `tool-command`, `explicit-cli` |

「automatic」は利用者が dependency acquisition/tool command を開始した後の自動 callback を指す。`configuration-load` は設定に dependency を記載した結果の読込、`explicit-cli` は利用者が dependency の CLI を明示的に選んだ起動である。これらを同じ「自動実行」と呼ばない。

## Event schema

Canonical raw event は1行1 JSON object の JSONL とする。全 event に以下の field を持たせ、該当しない値は field を省略せず `null` にする。field name は実装時に schema として固定する。

| Field | Type | 規則 |
|---|---|---|
| `schemaVersion` | string | event schema version |
| `runId` | string | 1回の scenario execution に一意。不透明な値として扱う |
| `scenarioId` | string | manifest の安定 ID |
| `route` | string | manifest の route |
| `phase` | string | 上記 phase を混同せず記録 |
| `triggerType` | string | 起動契機 |
| `timestamp` | string | event 発生時の UTC RFC 3339 timestamp |
| `sequence` | integer | collector が確定する run-global の 0 始まり連番 |
| `producerSequence` | integer | producer 内の 0 始まり連番 |
| `pid` | integer | event producer の container/process namespace 内 PID |
| `parentPid` | integer | 同 namespace 内の PPID |
| `workerId` | string/null | tool が提供した sanitized worker ID。未知なら `null` |
| `nodeVersion` | string | 実際に動いた Node.js version |
| `toolVersion` | string | 実際に動いた npm/ESLint/Vitest/Vite/codegen version |
| `attemptType` | string | 下記 operation の種別 |
| `targetId` | string/null | manifest の logical target。raw path/value ではない |
| `outcome` | string | `success`, `failure`, `skipped` |
| `errorCode` | string/null | allowlist 済み normalized code |
| `durationMs` | number | monotonic clock で測った非負の duration |
| `beforeHash` | string/null | `sha256:<hex>`。対象外なら `null` |
| `afterHash` | string/null | `sha256:<hex>`。対象外なら `null` |
| `details` | object | schema-defined sanitized metadata のみ |

`timestamp` は表示用であり、process 間の因果順序を保証しない。producer が local segment に `producerSequence` を付け、collector が schema validation/redaction 後に deterministic merge rule を適用して `sequence` を振る。merge rule と clock precision は run metadata に記録する。

PID/PPID は実値を保持するが container/process namespace 内の観測値であり、run 間の同一性に使わない。比較では「同じ/異なる process」「親子関係」「worker label」の構造に変換する。

## Access attempt type

| `attemptType` | 意味 |
|---|---|
| `scenario-start`, `scenario-end` | harness が run の完全性を示す control event |
| `route-invocation` | adapter/probe が特定 phase で起動された marker |
| `environment-canary-read` | 列挙済み canary key の到達確認 |
| `canary-file-read` | allowlisted canary file の read attempt |
| `direct-filesystem-write` | probe による明示的な filesystem write |
| `official-tool-api-change` | fixer/transform/emit/generate 等を通じた変更 |
| `loopback-connect` | manifest 指定 loopback service への通信 |
| `unix-socket-connect` | experiment-only Unix socket への通信 |
| `child-node-process` | fixed child Node.js の起動 |
| `source-snapshot` | source の before/after hash |
| `artifact-snapshot` | artifact の before/after hash |

Control event と access event を `attemptType` で明示し、route が一度も起動されなかった場合は、完結した `scenario-start`/`scenario-end` と invocation event が0件であることから判定する。`scenario-end` がない場合は「0回」と確定せず incomplete とする。

## Outcome の定義

- `success`: 宣言された attempt を実行し、対象 operation が成功した。canary 値そのものは保存しない。
- `failure`: attempt を実行したが、対象への到達または operation が失敗した。profile による OS/container の拒否も、実際に attempt したなら `failure` である。
- `skipped`: manifest/profile が attempt を許可していない、route/phase が適用不能、または明示された前提が満たされず、operation を開始していない。理由 code を必須にする。

`failure` は scenario runner の故障を意味しない。逆に、期待どおり拒否された attempt を `success` に書き換えない。schema error、collector loss、unexpected timeout は access outcome と別の run validity として `invalid` または `inconclusive` に集計する。

Normalized error code は、`ACCESS_DENIED`、`NOT_FOUND`、`CANARY_NOT_PRESENT`、`CONNECTION_REFUSED`、`TIMEOUT`、`MANIFEST_DISALLOWED`、`NOT_APPLICABLE`、`SCHEMA_INVALID` などの project-defined allowlist に写像する。raw message、stack、absolute path は canonical event に入れない。unknown error は sanitized `UNKNOWN` とし、秘密を含みうる文字列を fallback 保存しない。

## Before/after hash

- 対象は manifest が列挙した source file、source tree、artifact file/tree だけに限定する。
- file は byte sequence の SHA-256、tree は normalized relative path、entry type、file digest を bytewise sort した manifest の SHA-256 とする。
- symlink は follow せず、許可する場合だけ link target の normalized representation を hash 対象とする。allowlist 外へ解決する symlink は拒否する。
- metadata timestamp、owner、host absolute path は hash 入力にしない。
- missing は digest と混同しない schema-defined state として表す。
- official API change の hash は、API が返した内容と tool が materialize した結果を区別して記録する。
- hash 変化だけから変更経路を推定せず、`attemptType` と tool event を併用する。

## Canary redaction

- environment は key の logical ID と present/reachable boolean だけを残す。raw value、length、prefix/suffix、value hash を残さない。
- file は logical target ID、read 成否、byte count の粗い schema-defined categoryだけを残し、content と host path を残さない。
- service response は固定 protocol の success marker に変換し、payload を保存しない。
- child output は固定 exit status/sanitized marker だけを残す。
- producer と collector の両方で redaction し、collector validation を通らない event は canonical raw JSONL に混ぜず run を invalid とする。

## Path normalization

Manifest は `repo`, `fixture`, `scratch`, `artifact`, `results` などの logical root を宣言する。event/report は `<repo>/...`, `<fixture>/...`, `<scratch>/...` のような placeholder と POSIX separator を使う。

操作前には platform API で canonical path を求め、宣言 root 内にあることを component boundary で検証する。文字列 prefix 一致だけを使わない。`..`、unexpected absolute path、NUL、special file、root 外 symlink は拒否する。error の path も collector が同じ規則で置換し、置換できない absolute path は削除する。

## Timeout と resource limit

- scenario、tool process、個別 network/child attempt の timeout を manifest に必須化する。
- timeout は monotonic clock で測り、どの layer が発火したかを normalized code に記録する。
- harness は保持している process handle へ直接 termination signal を送り、shell command を組み立てない。
- timeout 後の欠落 event を成功/0回として扱わず、run を incomplete または inconclusive にする。
- event size、event count、stdout/stderr、file output、process count に上限を設ける。具体値は実装 milestone で fixture 実績から決め、version control する。

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
