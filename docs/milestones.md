## M0: npm 12 install lifecycle minimal spike

実行順序は **M-1 repository scaffold → M0 → M1 probe-core** とする。M0 は M1 や
`probe-core` に依存しない独立した spike であり、M0 の baseline は後続の M2-A が
共通 probe へ移行するための入力とする。

### Goal

npm 12 の対象 exact version を root の Node.js 20 / npm 11 toolchain とは独立した
disposable container 内に固定し、ローカルで作成した無害な dependency fixture に
ついて、install lifecycle script がどの条件で実行または skip されるかを実測する。

M0 が確立するのは npm install lifecycle に関する marker-only baseline だけである。
npm 12 の防御機能全体、すべての依存コードを遮断する能力、または一般的な依存
コード実行能力を証明しない。完了条件は特定の結果になることではなく、結果を安全
かつ再現可能に観測し、Expected と Observed を分けて記録できることである。

### Prerequisites

- M-1 repository scaffold が完了している
- root の `npm run check` が成功している
- [threat-model.md](threat-model.md) の安全条件が human review で承認されている
- M0 用 Node.js/npm exact version を root toolchain とは独立して固定できる
- instrumented npm install lifecycle の package 化、install、実行を disposable
  container 内だけで行える

M1、`probe-core`、共通 event schema、adapter、harness は prerequisite にしない。

### Read first

- root `AGENTS.md`
- root `README.md`、`package.json`、`.npmrc`、`.gitignore`
- [index.md](index.md)
- [product-requirements.md](product-requirements.md)
- [threat-model.md](threat-model.md)
- [experiment-protocol.md](experiment-protocol.md)
- [architecture.md](architecture.md)
- [experiment-matrix.md](experiment-matrix.md)
- この文書と [codex-workflow.md](codex-workflow.md)

### In scope

#### Fixture

- root workspace 外の `experiments/npm12-install/` に、無害な dependency package の
  template と、その dependency を利用する consumer package の template を置く
- root workspace は `packages/*` の allowlist のままにし、`experiments/**` を含めない
- installable package、tarball、`node_modules`、lockfile、npm cache は scenario ごとに
  container 内で materialize し、root package/lockfile と共有しない
- install lifecycle script が行う副作用は、指定された実験専用 output directory への
  固定 marker の作成だけにする。外部入力の列挙、任意 file read、network、child process、
  source tree の変更は行わない
- marker には固定 token と固定された lifecycle phase だけを記録し、invocation ごとの
  record 数から実行回数を判別できるようにする。marker の count 方法と atomicity は
  実装前に human review する
- lifecycle phase は package metadata と script への固定引数から決め、環境変数の
  列挙や推測で補完しない
- fixture を public registry へ publish せず、本物の資格情報、host home、credential
  store を利用しない

#### Execution environment

- M0 専用の disposable container を使い、Node.js と npm 12 の exact version および
  container image digest/input を記録する
- container process は可能な限り non-root user とし、privileged mode を使わない
- host home、SSH agent、credential store、Docker socket、container runtime socket を
  mount/forward しない
- fixture input は必要な directory だけを read-only で mount または専用 build context
  へ copy し、scenario workspace、npm cache、marker output、result は専用 disposable
  directory に分ける。repository 全体を writable mount しない
- experiment run は external network なしで完結させる。local file dependency、container
  内で作る tarball、または isolated local registry のどれを使うかは npm 12 の対象挙動を
  変えうるため、Official の確認後に human review で選ぶ
- package 取得が必要でも実験対象 dependency を public registry へ publish しない。
  container image/npm 12 input の事前取得と、network 無効の experiment run を別工程・
  別記録として扱う
- timeout、stdout/stderr size、marker size、disk/process resource に上限を設ける

#### Baseline scenarios

次を独立した scenario ID として定義する。npm 12 の正式な機能名、承認 command、設定名
は推測で命名せず、実装時に Official を確認して scenario metadata へ記録する。

1. `m0-unapproved-install`: unapproved の初期状態から install する
2. `m0-approved-install`: npm 12 が提供する正式な承認手順を適用した fresh state から
   install する
3. `m0-scripts-explicitly-disabled-install`: scripts explicitly disabled の設定で install する
4. `m0-approved-reinstall`: fresh approved state から scenario 内の初回 install と reinstall
   を別 command step として実行し、各 step 後の marker count を記録する
5. `m0-approved-ci`: npm 12 の Official と lockfile 前提を満たせる場合に、fresh approved
   state で `npm ci` を再現する。適用不能または再現不能なら理由とともに
   **Inconclusive** とし、成功扱いしない

各 scenario は別の一時 consumer directory、output directory、npm user configuration、
cache、lockfile、`node_modules` を持つ。scenario 開始前にそれらの初期状態を検査し、前の
scenario の marker、approval state、lockfile、`node_modules`、npm configuration、cache が
漏れていれば実行せず Inconclusive とする。reinstall scenario 内の2 stepを除き、状態を
scenario 間で再利用しない。

#### Observations

各 scenario/command step について、最低限次を machine-readable summary と sanitized raw
command log に保存する。

- scenario ID、run ID、step ID
- 実測した Node.js exact version、npm exact version、container image digest/input
- shell 文字列ではなく argv として表現した実行 command
- relevant npm configuration、その値の取得元、approval state の保存場所
- start/end、exit code、timeout または runner error
- size 制限と path redaction を適用した stdout/stderr。秘密を含みうる未 sanitization の
  fallback は保存しない
- marker の有無、marker record 数、parse error、固定 lifecycle phase
- `package-lock.json` の有無と SHA-256、`node_modules` の実行前初期状態
- consumer、marker、lockfile、`node_modules`、npm configuration、cache の実行前後状態
- 観測手順が有効だったかを表す `success`、`failure`、`inconclusive`。command の exit code、
  marker の有無、Expected との一致とは別 field にする
- **Official**: container 内の `npm help`、npm 12 同梱 documentation、または公式情報で
  確認した機能名、command、設定、version-specific semantics と参照元
- **Expected**: 実行前に固定し human review した仮説
- **Observed**: local run が生成した version、command result、marker、lockfile、状態差分
- **Unknown**: Official でも有効な Observed でも確認できず、推測のまま残る事項
- **Inconclusive**: isolation、input、logging、前提条件の不備により結果を確定できない run

Expected mismatch、unexpected marker、非0 exit、timeout、欠落 output は削除または期待に
合わせて補正しない。Official、Expected、Observed、Unknown を同じ field や更新手順で
上書きしない。

### Out of scope

- `probe-core` の実装
- 共通 event schema または後続の `events.jsonl` への統合
- env canary read
- 任意の file read
- network probe
- child process probe
- ESLint adapter
- Vitest adapter
- Vite adapter
- codegen CLI
- permissive / constrained profile の比較
- report harness
- artifact pipeline
- npm 12 の npm install lifecycle 以外の依存コード実行経路の評価
- host または root workspace 上での instrumented install lifecycle script の package 化、
  install、実行
- public npm registry への publish
- 本物の秘密情報、資格情報、host home、credential store の利用
- external host への通信
- npm、Node.js、OS、container runtime の脆弱性または container escape の検証

M0 は marker-only baseline を維持する。M0 の version、承認条件、marker count、isolation の
baseline を受けて、共通 `probe-core`、npm lifecycle adapter、共通 event schema、capability
attempt へ移行するのは M2-A の責務である。

### Deliverables

以下は M0 実装時に作る planned file/output であり、この milestone 定義時点では存在を
前提にしない。

```text
experiments/npm12-install/
├── README.md                         # 安全条件と再現手順
├── experiment-manifest.json         # version、scenario、許可 path/mount/output
├── dependency/
│   ├── package.json                  # 無害な dependency template
│   └── scripts/install-marker.mjs    # 固定 marker だけを作る lifecycle code
├── consumer/
│   └── package.json                  # dependency を利用する template
├── container/
│   └── Containerfile                 # M0 専用の pinned disposable container
├── scripts/
│   ├── run-scenarios.mjs             # scenario isolation、実行、記録
│   └── verify-static.mjs              # workspace、fixture、mount、script の静的検査
└── .work/runs/<run-id>/               # disposable。version control 対象外
    ├── scenarios/<scenario-id>/       # scenario ごとの consumer/cache/output
    ├── logs/<scenario-id>.txt         # sanitized raw command log
    └── summary.json                   # machine-readable summary

docs/spike-npm12.md                    # Official / Expected / Observed / Unknown と結論
```

- dependency fixture と consumer fixture
- M0 専用 container 定義。exact Node.js/npm version、image digest/input、non-root user、
  mount、network policy を review 可能にする
- scenario runner と、scenario ごとの完全に独立した一時 directory 管理
- sanitized raw command log、machine-readable summary、marker/lockfile/count の自動判定
- M0 用の静的 safety check と scenario result validation
- image/input の準備工程と network 無効の experiment run を区別した再現手順

M0 の `summary.json` は scenario ID、command、exit code、marker count、phase、lockfile hash、
result classification を安定 field として持ち、M2-A で移行可能にする。ただし M1 より前に
共通 schema を先取りせず、M0 output を canonical `events.jsonl` と表現しない。

### Acceptance criteria

- M0 用 Node.js/npm exact version と container image digest/input が manifest、raw log、
  summary、`docs/spike-npm12.md` に記録されている
- npm 12 の対象機能名、command、設定、approval semantics を推測で決めておらず、container
  内の `npm help`、同梱 documentation、または version 対応する公式情報で確認している
- root toolchain の Node.js 20/npm 11 policy、`packageManager`、engines、root lockfile を
  変更していない
- root workspace は `packages/*` の allowlist のままで、M0 fixture を含まない
- root package/script/lockfile から M0 fixture への依存または実行経路がなく、root の通常
  install で M0 install lifecycle script が実行されない
- instrumented package の materialize、install lifecycle script の実行を host/root
  workspace 上で行っていない
- dependency fixture の副作用が実験専用 output directory の固定 marker だけであり、
  marker target が許可 path 内に canonicalize される
- lifecycle script は環境変数を列挙せず、任意 path、外部 URL、network、child process、
  shell command の文字列連結を使わない
- scenario ごとに consumer、marker、approval state、lockfile、`node_modules`、npm config、
  cache が分離され、初期状態と実行前後状態が記録される
- unapproved、approved、scripts explicitly disabled が独立して実行され、approved reinstall
  が fresh state から開始する
- marker の有無、record 数、lifecycle phase が自動判定される。count を信頼できない場合は
  Inconclusive になる
- 各 command step の sanitized argv、exit code、stdout/stderr、timeout が記録される
- `package-lock.json` の有無と hash、および install/`npm ci` による影響が記録される
- Official、Expected、Observed、Unknown が別 field/section/更新手順で区別される
- 予想に合わない結果、追加 marker、非0 exit、timeout もそのまま保存される
- 再現できない scenario、前提違反、欠落記録を success とせず Inconclusive にする
- unapproved が必ず skip される、approved が必ず実行される、または marker count が必ず
  特定値になることを完了条件にしていない
- experiment run に external network、実 credential、host home、SSH agent、Docker socket
  mount がない
- root の `npm run check` が引き続き成功する
- M1 以降の実装、共通 event schema、adapter、profile、report harness を追加していない

### Verification commands

以下は **M0 実装時に container 境界と human review 後に実行する予定**の command 群で
ある。この設計 task で実行する command ではない。`<container-runtime>`、image reference、
npm 12 の approval command/configuration は Official の確認後に確定し、推測で置換しない。

#### Root regression

```sh
node --version
npm --version
npm run check
git diff --check
git status --short
```

root では `npm install`、`npm ci`、M0 lifecycle script を実行しない。

#### Container version verification

M0 image を network 無効、non-root、review 済み mount で起動し、その container 内で次を
実行する。

```sh
node --version
npm --version
npm help <confirmed-approval-command-or-topic>
npm config get <confirmed-relevant-key>
```

対象機能が config key ではない場合は最後の command を実行せず、同梱 documentation または
該当 help command を記録する。期待した version と一致しなければ scenario を開始しない。

#### M0 scenarios

Runner の最終 interface と container invocation は実装時に固定する。予定する論理 command
は次のとおりで、すべて disposable container 内で実行する。

```sh
<container-runtime> run <reviewed-isolation-options> <m0-image> node ./scripts/run-scenarios.mjs --scenario m0-unapproved-install
<container-runtime> run <reviewed-isolation-options> <m0-image> node ./scripts/run-scenarios.mjs --scenario m0-approved-install
<container-runtime> run <reviewed-isolation-options> <m0-image> node ./scripts/run-scenarios.mjs --scenario m0-scripts-explicitly-disabled-install
<container-runtime> run <reviewed-isolation-options> <m0-image> node ./scripts/run-scenarios.mjs --scenario m0-approved-reinstall
<container-runtime> run <reviewed-isolation-options> <m0-image> node ./scripts/run-scenarios.mjs --scenario m0-approved-ci
```

Runner が内部で使う install、approval、scripts disabled、reinstall、`npm ci` の exact argv は
確認済み Official とともに manifest/raw log へ保存する。`npm ci` の前提を満たせない場合も
command を別のものへ黙って置換しない。

#### Static safety checks

```sh
node experiments/npm12-install/scripts/verify-static.mjs
git diff -- package.json package-lock.json .npmrc
git diff --check
git status --short
```

自動検証と human review は次を確認する。

- fixture が root workspace 外にあり、root `package.json` の workspace、dependency、script、
  lifecycle script から参照されていない
- fixture metadata/script/container input に external URL がなく、対象 dependency を public
  registry へ publish する処理がない
- container 定義/runner に host home、SSH agent、credential store、Docker socket の mount、
  privileged mode、experiment run の external network がない
- lifecycle script の全 code が固定 marker 以外を処理せず、任意 path/read/network/child
  process、shell command の文字列連結を持たない
- M0 の変更差分に M1 以降の implementation がない
- `package.json` と `package-lock.json` が M0 の基準 revision から変更されていない

### Risks

- npm 12 を利用できる Node.js version range と、採用候補 image が実際に満たす version の制約
- host/root が Node.js 20 と npm 11.12.1 であり、npm 12 を直接実行できないこと
- root npm 11 の `.npmrc` と M0 npm 12 の user/project configuration が mount、cwd、環境を
  通じて干渉する可能性
- root の `ignore-scripts=true` が M0 scenario へ意図せず継承され、unapproved policy の効果と
  混同される可能性
- local file dependency、container 内 tarball、isolated local registry で npm 12 の対象挙動が
  異なる可能性
- local dependency bundle と npm 12 自体を、実験実行時の external network なしで供給する
  具体的方法が未決定であること
- approval 情報が package metadata、lockfile、npm configuration、cache、その他のどこへ保存
  されるかが version 固有であること
- consumer directory、npm config、home、cache、layer の再利用により approval state が
  scenario 間で漏れる可能性
- npm cache または container layer による scenario 間汚染
- `npm install` と `npm ci` で lockfile や事前状態の要件が異なること
- marker append/record だけで複数 invocation、partial write、retry を正しく数えられるか
- container image/input の事前取得に必要な network と、network 無効の experiment run を
  混同する危険
- npm 12 の patch/minor、stable/pre-release、同梱 Node.js の違いで仕様・help・挙動が変わる
  可能性
- npm install lifecycle の限定的な結果を、npm 12 の防御全体または一般的な Node.js 依存
  コード実行能力へ過剰に一般化する危険
- container は完全な security boundary の証明ではなく、container escape は対象外であること

### Human review points

- 採用する Node.js/npm exact version、stable/pre-release の別、container image digest/input
- その npm 12 version が示す正式な承認手順、対象機能名、command、configuration
- local dependency の供給方式と、それが対象挙動へ与える差
- container の read-only input、writable output、cache を含む全 mount/copy 設計
- experiment run の network 無効設定と、image/input 事前取得工程との分離
- lifecycle script の全 code と固定引数
- lifecycle script が実験専用 output directory の固定 marker 以外を処理しないこと
- unapproved/approved scenario の初期状態と、その状態を証明する記録
- approval state の保存場所と sanitization
- consumer、lockfile、`node_modules`、config、cache、container layer を含む scenario 間の分離方法
- marker record の atomicity、parse 方法、実行回数判定の妥当性
- raw stdout/stderr、argv、path、npm config の sanitization 方法と size 上限
- npm 12 の Official とローカル Observed を照合した実測結果の解釈
- `docs/spike-npm12.md` で Official / Expected / Observed / Unknown / Inconclusive が
  分離されていること
- M2-A に進む前に、marker-only baseline、version、approval 条件、制約、再現手順が残って
  いること

## M1: probe-core

Status: remediation A (C-01/C-02/H-01/M-03) complete。Remediation B (M-04/M-05/M-06/M-07/L-01) complete、M-01のcanonical alias follow-upはremediation Dで実施済み。Remediation C (M-02/L-03/L-04、implementation/docs/error/symlink整合、M2定義) complete。Remediation D (M-08 canonical file alias/canary hash policy) complete。M1 independent review gate: **approved with non-blocking follow-ups**。判定対象は現在の未commit working treeであり、詳細は[独立レビュー記録](reviews/m1-independent-review.md)を参照する。過去のtest数/結果はverification logとして扱い、このstatus文へ固定しない。

### Closure follow-ups

| ID | Status | Closure / limitation |
|---|---|---|
| L-05 | complete | `probe-core` static verifierをfail closedにし、Node.js builtin、`src/`内relative import、`src/`内へ解決されるTypeScript `paths`だけを許可する。External bare import、self-reference、package `imports` alias、computed loading、source root escapeを拒否する。 |
| L-06 | complete | M0 static verifierの現在のfile/commandを実在する`experiments/npm12-install/scripts/verify-static.mjs`へ統一し、既知verification sectionのcommand pathをtestする。 |
| I-04 | accepted non-blocking limitation | Exclusive create後のdirect file-write失敗ではpartial outputが残り得る。Failureをsuccess扱いせずcapability failureとして記録するが、automatic rollbackは保証しない。Disposable run directoryを前提とし、retryは新しいclean directoryを使う。詳細と将来cleanup条件は[独立レビュー記録](reviews/m1-independent-review.md#i-04-accepted-limitation)を参照する。 |

M2-AはM1 boundaryの観点ではreadyだが、M0 evidence transport decision待ちである。M2-B〜M2-EはM1 boundaryの観点ではreadyである。これは各adapterが実装済みまたは各adapter固有gateを通過済みという意味ではない。

### Goal

共通probeと `probe-event/v2` producer event schemaを実装する。

### Prerequisites

- M0完了
- threat model承認済み

### In scope

- probe-core
- manifest validation
- JSONL events
- unit tests
- producer-local sequenceと1 producer/1 segment sink
- allowlisted env/file/write、loopback HTTP、fixed child、bound-file SHA-256
- manifest allowlist内のmultiple phase/trigger
- capability attemptと分離したroute invocation/tool API change event
- 実dependency/importに基づくprobe-core dependency direction verifier

### Out of scope

- ESLint adapter
- Vitest adapter
- Vite adapter
- container profiles
- adapter、harness、collector、global sequence、report/artifact pipeline

### Acceptance criteria

- import時に副作用がない
- 非loopback URLが拒否される
- 任意コマンドが実行できない
- canary値がログに残らない
- unit testsが成功する
- logical targetとhost runtime bindingが分離され、missing bindingを拒否する
- traversal/root外symlink、hostname/external IP、arbitrary child inputを拒否する
- producer-local sequenceが単調増加し、同一process内の並行JSONL writeが破損しない
- producer-local sequenceがphase/event kindをまたいで共有される
- route invocationとtool API changeがcapability attemptと別event kindである
- adapter recording APIがarbitrary event/details/path/content/diff/callbackを受けない
- static verifierがadapter directoryの存在だけでは失敗せず、probe-coreからadapter/toolへの依存は拒否する
- M0 testがM1 packageの存在に依存せず、M1 package metadataはroot integration testで検査する
- raw canary/path/error/stack/response bodyをeventへ保存しない
- M0 stdout fallbackをevent transportへ一般化しない
- canary file readはcontent hashを保存せず、source/artifact file-hashとclassificationで分離する
- structural validation後、session/sink作成前にasync file identity preflightを完了する
- 異なるfile targetのcanonical path、既存device/inode、planned output path共有を拒否する
- raw binding/path/target IDを受け取るpublic hash helperを提供せず、prepared sessionのfile-hash attemptだけを使う
- loopback successは固定canary protocolの完全一致とabsolute deadlineを要求する
- sessionがofficial sinkを所有し、closeがin-flight attempt/event writeを待つ
- sink failure/limit/partial lineをterminal run failureとして伝播する
- generic file-writeはoutputの排他的新規作成だけで、同一target writeを直列化する
- read/hash/write permission failureをoperation別codeへ正規化する

### Verification

- `npm run test --workspace packages/probe-core`
- `npm run typecheck --workspace packages/probe-core`
- `npm run build --workspace packages/probe-core`
- `npm run verify:static --workspace packages/probe-core`
- `node packages/probe-core/scripts/verify-static.mjs`
- `npm run typecheck`
- `npm run lint`
- `npm run check`

## M2-A: npm lifecycle adapter

### Goal

M0のversion-specific marker-only baselineを変更せず、承認済みcontainer evidence回収境界の中でnpm lifecycle invocationとprobe-core capability eventを統合する。M2-Aを他adapterより先に実施する必然性はない。

### Prerequisites

- M1 independent review gate approved
- root `npm run check` success
- `probe-event/v2` adapter event contract approved
- no real credentials、no external network
- ExpectedとObservedの分離
- container内producer segmentの回収境界がhuman reviewで承認済み
- Docker `29.6.1`の`docker cp` tmpfs制約が未解決なら、このmilestoneはblockedまたはrunをInconclusiveとする

### Read first

- root `AGENTS.md`、`README.md`、`package.json`
- [index.md](index.md)、[threat-model.md](threat-model.md)、[experiment-protocol.md](experiment-protocol.md)、[architecture.md](architecture.md)、[experiment-matrix.md](experiment-matrix.md)
- このM2-A定義、[codex-workflow.md](codex-workflow.md)、[spike-npm12.md](spike-npm12.md)
- M1 independent review結果と承認済みevidence-transfer decision

### In scope

- npm lifecycle専用adapter/fixture/contract test
- `install-lifecycle` route invocation eventとcapability attemptの分離
- M0で固定したnpm/Node/version/approval条件の引継ぎ
- instrumented lifecycleをdisposable experiment container内だけで実行
- producer segmentのcomplete close、境界外へ回収したbyte列のvalidation

### Out of scope

- M0 evidence、Observed、marker-only resultの変更
- M0 stdout framed fallbackの汎用event transport化
- host/root workspace上のinstrumented lifecycle実行
- 他M2 adapter、generic scenario runner、M3 collector/global sequence/report
- permissive/constrained profile、artifact pipeline

### Deliverables

- npm lifecycle adapter packageまたは専用container entry
- fixed manifest/fixtureとprobe-core integration tests
- 承認済みproducer segment transfer boundaryの設計記録
- M0 baselineとM2 eventの対応表（Expectedのみ。Observedはrun output）
- package build/typecheck/test/static scripts

### Acceptance criteria

- lifecycle起動は`route-invocation`、env/file/write/network/childは`capability-attempt`であり相互に偽装しない
- M0 marker-only evidence、stdout fallback、Observed/Inconclusiveを変更しない
- instrumented packageのpack/install/runがhostで一度も行われない
- external network、credential/home/agent/runtime socket mountを使用しない
- producer segment recoveryが未承認またはtmpfs制約未解決ならsuccessにせずblocked/Inconclusiveにする
- segment close/failure/sequence/schemaを回収後に再検査する

### Verification commands

```sh
npm run test --workspace packages/npm-lifecycle-probe
npm run typecheck --workspace packages/npm-lifecycle-probe
npm run build --workspace packages/npm-lifecycle-probe
npm run verify:static --workspace packages/npm-lifecycle-probe
node experiments/npm12-install/scripts/verify-static.mjs
npm run check
git diff --check
git status --short
```

承認済み回収境界とroot scriptが追加された後だけ、review済みhost orchestratorの固定commandを実行する。承認前はDocker実行commandを推測で追加・実行しない。

### Risks

- tmpfs producer segmentを承認済みcopy APIで回収できない
- stdout fallbackを一般化してevidence/control channelを混同する
- npm approval state、cache、lockfileがscenario間で漏れる
- M0の限定的Observedを一般化する

### Human review points

- producer segment回収境界とtmpfs制約の解決根拠
- lifecycle code、container entry、mount/network/runtime argumentsの全体
- M0 evidence非変更とExpected/Observed分離
- hostでinstrumented lifecycleを実行する経路がないこと

## M2-B: ESLint adapter

Status: implementation **complete**; independent review **approved with non-blocking follow-ups**; blockers: none. F-01 through F-06 remain open and are recorded in the [M2-B independent review record](reviews/m2-b-eslint-adapter.md). M2-B experiment-matrix Observed results remain unmeasured, and the M3 collector, global sequence, and reporting remain unimplemented.

Historical status before review closure, superseded by the current status above:

Status: **implementation complete; independent review pending** (superseded).

### Goal

固定1-file fixtureでESLint pluginのmodule evaluation、初期化、rule/visitor/fixer経路と、direct write/fixer API changeを別eventとして測定可能にする。

### Prerequisites

- M1 independent review gate approved
- root `npm run check` success、`probe-event/v2` contract approved
- no real credentials、no external network、Expected/Observed分離
- 対象ESLint versionとfixture、file count、cache/watch条件を事前固定

### Read first

- root `AGENTS.md`、[index.md](index.md)、[threat-model.md](threat-model.md)、[experiment-protocol.md](experiment-protocol.md)、[architecture.md](architecture.md)、[experiment-matrix.md](experiment-matrix.md)
- このM2-B定義、[codex-workflow.md](codex-workflow.md)、M1 independent review結果
- 固定versionのESLint official plugin/rule/fixer API documentation

### In scope

- module evaluation、plugin/rule initialization、rule `create`
- designated fileのvisitor callback、fixer invocation
- lint onlyとlint `--fix`、cache disabled、file count固定
- route invocation event、direct filesystem write capability event、ESLint fixer APIのtool API change event
- fix multi-passの実測countを削除せず記録

### Out of scope

- watch/cache/複数file/並列baseline、他adapter
- arbitrary rule execution、production projectへの導入
- M3集計/report、profile比較、artifact pipeline

### Deliverables

- `packages/eslint-plugin-probe`、固定fixture/config
- module/init/create/visitor/fixerのlogical ID/phase manifest
- lint-only/fix contract/integration testsとstatic verifier
- direct writeと`source-fix` eventの対応を説明するadapter note

### Acceptance criteria

- module evaluationは専用entryから明示recordし、probe-core/helper importにside effectを加えない
- route event数からphase別invocation countを算出できる
- lint-onlyと`--fix`を別scenarioにし、cache disabled/file count 1を検証する
- visitor/fixer multi-passを推測で1回に補正しない
- direct filesystem writeとESLint fixer return/materializationを別event/evidenceにする
- raw filename/path/source/diff/errorをeventへ保存しない

### Verification commands

```sh
npm run test --workspace packages/eslint-plugin-probe
npm run typecheck --workspace packages/eslint-plugin-probe
npm run build --workspace packages/eslint-plugin-probe
npm run verify:static --workspace packages/eslint-plugin-probe
npm run verify:static --workspace packages/probe-core
npm run check
git diff --check
git status --short
```

### Risks

- fix multi-passでvisitor/fixer countが増える
- config loadとrule initializationを混同する
- fixer returnとESLintのfilesystem materializationを同一eventにする

### Human review points

- phase/trigger/invocation kindのESLint APIへの対応
- logical file IDのsanitization、cache/file-count固定の根拠
- direct write、fixer API change、最終source hashの境界

## M2-C: Vitest setupFiles adapter

Status: implementation **complete**; independent review **approved with non-blocking follow-ups**; blockers: none. B-01, R-B02-01, and R-B03-01 are resolved. F-01 through F-03 and M1 I-04 remain open and are recorded in the [M2-C independent review record](reviews/m2-c-vitest-setup-adapter.md). M2-C experiment-matrix Observed results remain unmeasured, permissive/constrained profile comparison has not run, and the M3 collector, global sequence, and reporting remain unimplemented. The two clean-boundary local integration runs are adapter contract checks, not matrix Observed evidence.

Historical status before exact-path empty-directory cleanup and the clean-boundary focused re-review, superseded by the current status above:

Status: **implementation complete; second blocker remediation implemented; clean-boundary verification blocked; independent re-review pending** (superseded). The actual adapter-local config-temp entry was a pre-existing empty directory, so the intended fail-closed preflight blocked production verification until its ownership and identity were investigated and the user explicitly authorized exact-path `rmdir` after revalidation.

### Goal

固定test file/worker条件で、同じawaited `setupFiles` module import内のlate module-evaluation/setup-body checkpointを記録し、PID/worker/setup logical IDとcapability attemptを比較可能にする。

### Prerequisites

- M1 independent review gate approved
- root `npm run check` success、`probe-event/v2` contract approved
- no real credentials、no external network、Expected/Observed分離
- 対象Vitest version、test file count、worker条件、watch disabledを事前固定

### Read first

- root `AGENTS.md`、[index.md](index.md)、[threat-model.md](threat-model.md)、[experiment-protocol.md](experiment-protocol.md)、[architecture.md](architecture.md)、[experiment-matrix.md](experiment-matrix.md)
- このM2-C定義、[codex-workflow.md](codex-workflow.md)、M1 independent review結果
- 固定versionのVitest setupFiles/worker official documentation

### In scope

- same setup-module import内のlate module-evaluation/setup-body checkpoint
- PID、tool提供のworker ID、setup/test file logical ID
- test file count固定、worker条件固定、watch disabled
- route invocation eventとcapability attempt
- route event件数からのinvocation count

### Out of scope

- Vitestに一般的production artifact変更APIがあるとの仮定
- watch mode、複数worker比較、cache variant
- tool API change eventの捏造、他adapter、M3/profile/artifact pipeline

### Deliverables

- `packages/vitest-setup-probe`、固定setup/test fixture/config
- checkpoint/temp/process-lifecycle contractとtests/static verifier
- worker IDが取得不能な場合`null`とする根拠記録

### Acceptance criteria

- module evaluation開始や別callbackを主張せず、同一setup-module import内の2 checkpointを別route eventにする
- checkpoint以前のbootstrap failureをroute 0件のvalid observationへ変換しない
- Viteが固定configから実際に選ぶadapter-local nearest config-tempをENOENT-onlyの`lstat`、canonical parent/identity、pre/post absenceで検査し、pre-existing stateを削除しない
- tool-owned transform/cache tempをrun固有boundaryへ固定し、symlink/identity replacementを拒否してpre/post inventory後にowned rootだけcleanupする
- timeout/output-limitではcoordinatorの期待close dispositionとworker process group消滅を確認後にcleanupし、settlement不明なら競合cleanupを抑止する
- worker IDをPID/filenameから捏造せず、tool APIにない場合`null`にする
- test file countとworker条件がpreflight/testで固定される
- watchが無効である
- capability拒否をroute未起動と混同しない
- production artifact API change eventを架空に生成しない

### Verification commands

```sh
npm run test --workspace packages/vitest-setup-probe
npm run typecheck --workspace packages/vitest-setup-probe
npm run build --workspace packages/vitest-setup-probe
npm run verify:static --workspace packages/vitest-setup-probe
npm run verify:static --workspace packages/probe-core
npm run check
git diff --check
git status --short
```

### Risks

- process pool/version差でsetup countやworker contextが変化する
- setup module evaluationとper-test executionを混同する
- toolがworker/test file contextを公開しない

### Human review points

- worker条件とlogical setup/test file IDの根拠
- 同一module import内checkpointのphase/trigger mappingとpre-checkpoint観測限界
- actual nearest config-temp boundary、fail-closed existence/canonical identity、Linux process-group close disposition/unsafe-cleanup順序
- tool API changeをnot applicableとする判断

## M2-D: Vite plugin adapter

### Goal

`vite build`の固定fixtureでconfig/module evaluation、plugin factory、build hooksとofficial transform/emit/bundle mutationを記録する。

### Prerequisites

- M1 independent review gate approved
- root `npm run check` success、`probe-event/v2` contract approved
- no real credentials、no external network、Expected/Observed分離
- 対象Vite version、build input/module count、watch/cache条件を事前固定

### Read first

- root `AGENTS.md`、[index.md](index.md)、[threat-model.md](threat-model.md)、[experiment-protocol.md](experiment-protocol.md)、[architecture.md](architecture.md)、[experiment-matrix.md](experiment-matrix.md)
- このM2-D定義、[codex-workflow.md](codex-workflow.md)、M1 independent review結果
- 固定versionのVite/Rollup plugin hook、transform、emitFile documentation

### In scope

- config/module evaluation、plugin factory、`buildStart`、designated `transform`、`generateBundle`、`writeBundle`
- `vite build`のみ、watch/cache disabledの固定baseline
- route invocation event、direct filesystem write
- module transform result、`emitFile` emitted asset/chunk、bundle mutationのtool API change event

### Out of scope

- dev server、watch、HMR、serve hooks
- arbitrary module全件のcount、他adapter、M3/profile/artifact pipeline

### Deliverables

- `packages/vite-plugin-probe`、固定build fixture/config
- hook/target logical manifest、contract/integration tests、static verifier
- transform/emit/bundle eventとmaterialized artifact hashの対応note

### Acceptance criteria

- module evaluation、factory、buildStart、transform、generateBundle、writeBundleを別phase/logical invocationとして記録する
- designated moduleだけを固定logical IDで数え、raw pathをeventへ入れない
- direct filesystem writeをtransform/emit/bundle mutationと分離する
- transform=`module-transform`、emitFile=`emitted-asset|emitted-chunk`、bundle編集=`bundle-mutation`の固定unionを使う
- `vite build`以外を起動せず、dev/watch/HMRを対象外に保つ

### Verification commands

```sh
npm run test --workspace packages/vite-plugin-probe
npm run typecheck --workspace packages/vite-plugin-probe
npm run build --workspace packages/vite-plugin-probe
npm run verify:static --workspace packages/vite-plugin-probe
npm run verify:static --workspace packages/probe-core
npm run check
git diff --check
git status --short
```

### Risks

- internal module transformをdesignated target countへ混入する
- generateBundle mutationとwriteBundle時のfilesystem materializationを混同する
- Rollup/Vite version差でhook ordering/countが変わる

### Human review points

- 各hookのofficial semanticsとphase/trigger mapping
- transform result、emitFile、bundle mutation、direct writeの境界
- output logical ID、artifact hash、module count固定

## M2-E: explicit code-generation CLI adapter

### Goal

利用者が明示起動する固定code-generation CLIでstartupからcompletionまでを記録し、direct writeとdocumented generator API changeを分離する。

### Prerequisites

- M1 independent review gate approved
- root `npm run check` success、`probe-event/v2` contract approved
- no real credentials、no external network、Expected/Observed分離
- 固定CLI mode/arguments/input/output directory contractを事前承認

### Read first

- root `AGENTS.md`、[index.md](index.md)、[threat-model.md](threat-model.md)、[experiment-protocol.md](experiment-protocol.md)、[architecture.md](architecture.md)、[experiment-matrix.md](experiment-matrix.md)
- このM2-E定義、[codex-workflow.md](codex-workflow.md)、M1 independent review結果
- project-owned generator API/CLI contract

### In scope

- CLI startup、argument parsing、generation start、file write、completion
- 全phaseの`explicit` trigger
- allowlisted output directory制限、fixed arguments、dry-run
- route invocation event、direct write capability event、source generation/emitted artifact相当のtool API change event

### Out of scope

- arbitrary command runner、任意argument/path、shell execution
- automatic lifecycle/config-load routeとしての表現
- production project input、他adapter、M3/profile/artifact pipeline

### Deliverables

- `packages/codegen-probe`、固定CLI/generator fixture
- startup/parse/start/write/completion manifestとtests/static verifier
- dry-run/no-change contract、output containment test
- direct writeとgenerator API changeの設計note

### Acceptance criteria

- startup、argument parsing、generation start、file write、completionを別route invocationとして記録する
- trigger typeが全件`explicit`である
- argument/output targetは固定manifest allowlist外を拒否し、arbitrary command/pathを受けない
- dry-runはoutputを変更せず、change eventの`changed: false` semanticsと整合する
- direct filesystem writeとdocumented generator API changeを別eventにする
- raw input/output content、diff、pathをeventへ保存しない

### Verification commands

```sh
npm run test --workspace packages/codegen-probe
npm run typecheck --workspace packages/codegen-probe
npm run build --workspace packages/codegen-probe
npm run verify:static --workspace packages/codegen-probe
npm run verify:static --workspace packages/probe-core
npm run check
git diff --check
git status --short
```

### Risks

- fixed CLIをarbitrary command/argument escape hatchへ拡張する
- generator API resultとfilesystem materializationを混同する
- dry-runがhidden cache/outputを変更する

### Human review points

- CLI arguments/output containment/dry-runの全code path
- explicit triggerとphase mapping
- direct write、generator API change、final output hashの境界
