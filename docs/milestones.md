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

Status: **implementation complete; independent review approved with non-blocking follow-ups; runtime evidence-transfer boundary blocked/Inconclusive; experiment-matrix Observed unmeasured**. The fixed source/fixture contract is documented in [M2-A npm lifecycle adapter](m2-a-npm-lifecycle-adapter.md), and the review decision is recorded in [the M2-A independent review](reviews/m2-a-npm-lifecycle-adapter.md). Host pack/install/lifecycle execution is prohibited; M0's Docker `29.6.1` tmpfs-to-`docker cp` limitation remains unresolved, so no container run is treated as success.

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
npm run m2a:verify
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

Status: implementation **complete**; independent review **approved with non-blocking follow-ups**; blockers: none. F-01 through F-06 remain open and are recorded in the [M2-B independent review record](reviews/m2-b-eslint-adapter.md). M2-B experiment-matrix Observed results remain unmeasured. M3 collector/global sequence/reporting is implemented with a synthetic contract fixture, but M2-B local output is not automatically ingested or promoted to matrix Observed evidence.

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

Status: implementation **complete**; independent review **approved with non-blocking follow-ups**; blockers: none. B-01, R-B02-01, and R-B03-01 are resolved. F-01 through F-03 and M1 I-04 remain open and are recorded in the [M2-C independent review record](reviews/m2-c-vitest-setup-adapter.md). M2-C experiment-matrix Observed results remain unmeasured and permissive/constrained profile comparison has not run. M3 collector/global sequence/reporting is implemented with a synthetic contract fixture, but the two clean-boundary M2-C local integration runs remain adapter contract checks and are not automatically ingested or promoted to matrix Observed evidence.

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

Status: **M2-D implementation complete; independent review approved with non-blocking follow-ups; blockers: none; experiment-matrix Observed unmeasured**. The implementation-prerequisite Expected-only docs gate remains approved with its non-blocking snapshot note; see the [M2-D Expected contract independent review record](reviews/m2-d-vite-contract-docs.md). The independent implementation review is recorded in [M2-D Vite plugin adapter independent review](reviews/m2-d-vite-plugin-adapter.md). M3 collector/global sequence/reporting is implemented with a synthetic contract fixture, but local adapter verification is not automatically ingested or promoted to experiment-matrix Observed evidence; permissive/constrained profiles have not run.

### Goal

Vite configへ登録されたdependency pluginがNode.js上で実行されるconfigured routeを、固定production buildで検証可能にする。Late plugin-module checkpoint、plugin factory、`buildStart`、exact designated `transform`、`generateBundle`、`writeBundle`のrouteと、capability attempt、official tool API change、probe direct write、通常artifact materializationを分離する。

### Prerequisites

- M1 independent review gate approved
- root `npm run check` success、`probe-event/v2` contract approved
- no real credentials、no external network、Expected/Observed分離
- Expected contractのindependent design reviewが`APPROVE DOCS RECONCILIATION`
- Node.js `v20.18.2`、npm `11.12.1`、Vite exact `6.4.3`、Rollup exact `4.62.2`、esbuild exact `0.25.12`
- Vite `6.4.3`をM2-D workspaceからdirect pinすること。npmはlauncher policy metadataでありplugin processがnpmを実行した証拠ではない

### Read first

- root `AGENTS.md`、[index.md](index.md)、[threat-model.md](threat-model.md)、[experiment-protocol.md](experiment-protocol.md)、[architecture.md](architecture.md)、[experiment-matrix.md](experiment-matrix.md)
- [M2-D Vite plugin adapter Expected contract](m2-d-vite-plugin-adapter.md)、このM2-D定義、[codex-workflow.md](codex-workflow.md)、M1 independent review結果
- 固定versionのVite/Rollup plugin hook、transform、emitFile documentation

### Fixed command and versions

固定commandは次だけである。

```text
vite build --config vite.scenario.config.ts --configLoader runner --mode production
```

Harnessは`process.execPath`、fixed Vite CLI path/argv/cwd、`shell: false`だけを使い、user argvやarbitrary config/mode/cwdを受け取らない。Variantは固定`observe`または`api`だけで、dev、serve、preview、watch、HMRへ到達不能とする。`configLoader: runner`はVite `6.4.3`で有効だがexperimentalである。Producer eventのtoolはVite `6.4.3`、Rollup `4.62.2`はhook ordering/filter/bundle/output、esbuild `0.25.12`はTS transform/output/tool-owned child processの固定条件とする。

### In scope

- `vite-late-plugin-module-checkpoint`/configured、`vite-plugin-factory`/configuredと、`vite-build-start`、`vite-designated-transform`、`vite-generate-bundle`、`vite-write-bundle`/automaticの6 route
- sequential `buildStart` route直後のenvironment、file read、source hash、direct filesystem write、loopback、fixed childの6 capability attempt
- designated sourceを変更しない`module-transform`、`this.emitFile`によるfixed `emitted-asset`、fixed entry chunkの`bundle-mutation`の3 tool API change
- observe/apiともroute 6、capability 6、tool change 3、total 15、producer sequence `0..14`、producer 1、`workerId: null`
- probe direct marker、3 tool API change、Vite/Rollupの通常output artifact writeの別evidence
- source/config/plugin hash不変とbuild output変更の別evidence

### Out of scope

- dev server、watch、HMR、serve hooks
- arbitrary module全件のcount、他adapter、M3/profile/artifact pipeline
- global sequence、Observed count/result、presentation evidence
- 通常output writeを第4のtool API changeとすること、probe direct markerをtool API changeとすること

### Deliverables

- `packages/vite-plugin-probe`、固定build fixture/config
- hook/target logical manifest、contract/integration tests、static verifier
- transform/emit/bundle eventとmaterialized artifact hashの対応
- Expected contractの正本である[M2-D adapter note](m2-d-vite-plugin-adapter.md)

### Expected event order

両variantのproducer orderは次の15 eventを正本とする。Route eventはhook-entry checkpointであり、module-transform eventはtransform API resultであってfinal chunk hashではない。Global sequenceはM3責務のため追加しない。

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

Observeでも3 tool change definition/eventを持つがchange operationは開始せず、各eventは`skipped/NOT_APPLICABLE`とする。API不存在、policy拒否、API call後のno-opを意味せず、M1に`VARIANT_DISABLED`がないためM2-B precedentに従う。APIは同じ3 eventを`success`とするExpectedである。

### Fixed fixture and build boundary

Fixtureは`fixture/entry.ts`と`fixture/designated.ts`だけで、single Rollup inputのentryがdesignatedを1回static importし、valueをside effectで使ってtree-shakeを防ぐ。Dynamic import、CSS、HTML entry、public asset、framework/plugin追加、external dependency importは置かない。LF/literal markerを固定し、source/config/plugin hashは両variantで不変とする。Observe outputはentry chunk 1件、API outputはentry chunkとfixed emitted asset各1件で、bundle mutationはfile数を増やさない。Direct markerは`outDir`外の専用probe outputとする。

Resolved configをtrusted `configResolved` control-plane validatorでfail closedにし、validator自体はdependency routeへ数えない。固定値はcommand `build`、mode `production`、`apply: "build"`、legacy single-client、`builder`未指定、`build.watch: null`、CLI `--watch`なし、`build.write: true`、fresh owned canonical `outDir`、ownership/empty/containment preflight後だけ`emptyOutDir: true`、`copyPublicDir: false`、`publicDir: false`、manifest/ssrManifest/sourcemap/minify false、`modulePreload: false`、`assetsInlineLimit: 0`、`reportCompressedSize: false`、Rollup cache false、`optimizeDeps: { noDiscovery: true, include: [] }`、single input/output object、format `es`、fixed entry/chunk/asset filenames、dynamic chunkなし、fresh Vite `cacheDir`、`envDir: false`、fixed non-empty `envPrefix`である。Deprecated `optimizeDeps.disabled`と、存在しない一般的Vite `cache: false` optionは使用しない。

Materialization gateは、probe direct marker、module transform/emitted asset/bundle mutationのAPI result、Vite/Rollup通常artifact writeを分ける。`generateBundle`でtransform adoption、OutputBundle内のemitted asset、bundle mutationを検証し、`writeBundle`後にsessionをcloseしてからparent harnessがdisk inventory/hashを検証する。Reference ID、raw code/content/path/key/filenameは保存しない。後段validation failureを正常な15-event Observedへ変換しない。

### Temporary, process, and output acceptance

M2-Cのfixed direct spawn、run-specific `TMPDIR`/`TMP`/`TEMP`、actual nearest `.vite-temp` pre/post absence、canonical Vite cache inventory、Linux専用process group、timeout/output limit、TERM→bounded grace→KILL、expected close disposition、process-group absence、settlement unknown時のcleanup抑止を再利用する。Vite固有にfresh `outDir` ownership/canonical containment、observe/api別output file count、final artifact hash、esbuild child residueを検証し、tool temp/cache/outDir/run rootをowned boundary内だけcleanupする。

Success closeは`{ code: 0, signal: null }`、normal nonzero closeは`{ code: nonzero, signal: null }`としてsignal terminationと区別する。Producer 1はOS process 1を意味せず、plugin producerはVite coordinator 1である。Rollupは固定条件でin-process、esbuildはtool-owned childを起動し得る。Fixed-child capabilityは別のprobe-owned child attemptである。Vite/esbuild childがprocess group内でsettleするかは実装時に実測し、ExpectedからObservedを捏造しない。

### Acceptance criteria

- exact version/command/config/fixtureを実行前に検証し、Vite `6.4.3`をworkspaceからdirect pinする
- route 6、capability 6、tool change 3、total 15、producer sequence `0..14`を上記orderで記録する
- plugin-module checkpointをevaluation開始とせず、checkpoint前failure/0 eventをvalid runへしない
- plugin factoryを別call boundaryとし、trusted `configResolved` validatorはrouteへ数えない
- exact hook filterを通るdesignated logical targetだけを1件数え、entry/internal/non-target invocationを全transform countと表現しない
- `buildStart`をsequential hookとしてcapabilityを直後に1回実行する
- transform=`module-transform`、emitFile=`emitted-asset`、bundle編集=`bundle-mutation`の3 eventを統合しない
- direct write、tool API result、通常artifact writeを分離し、source不変とoutput変更を別検査する
- observeの3 eventはoperation未開始の`skipped/NOT_APPLICABLE`、APIの3 eventは`success` Expectedとする
- data policyに従いraw source/transformed/bundle/asset/config/path/error/output/reference ID/module ID/bundle key/filenameを保存しない
- expected process close/settlement、artifact inventory/hash、owned cleanupまで成功したrunだけをvalidとする

### Verification commands

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run check
git diff --check
git status --short
```

実装taskでは上記root regressionに加え、実装後に追加されるworkspace contractを次で検証する。Vite scenario buildを含むcommandは実装taskまで実行しない。

```sh
npm run test --workspace packages/vite-plugin-probe
npm run typecheck --workspace packages/vite-plugin-probe
npm run build --workspace packages/vite-plugin-probe
npm run verify:static --workspace packages/vite-plugin-probe
npm run verify:static --workspace packages/probe-core
npm run m2d:verify
npm run m2d:run:observe
npm run m2d:run:api
npm run check
git diff --check
git status --short
```

### Risks

- internal module transformをdesignated target countへ混入する
- generateBundle mutationとwriteBundle時のfilesystem materializationを混同する
- Rollup/Vite version差でhook ordering/countが変わる
- experimental config runner、esbuild child、process-group settlement、tool temp/cache/output residueの実挙動がExpectedと異なる
- late validation failure後に15 eventが揃っていることだけをvalid successと誤認する

### Human review points

- 各hookのofficial semanticsとphase/trigger mapping
- transform result、emitFile、bundle mutation、direct write、通常artifact materializationの境界
- source/config/plugin immutability、output logical ID/count/hash、module count固定
- temp/cache/outDir canonical ownership、close disposition、esbuild/process-group residue、unsafe-cleanup gate
- raw data禁止とfixed logical ID/sanitized version metadataだけを残すevidence boundary

## M2-E: explicit code-generation CLI adapter

Status: **M2-E implementation complete; independent review approved with non-blocking follow-ups; blockers: none; experiment-matrix Observed unmeasured**. The Expected contract is [M2-E explicit code-generation CLI adapter](m2-e-codegen-adapter.md), and the decision is recorded in the [M2-E independent review record](reviews/m2-e-codegen-adapter.md). M3 collector/reporting is implemented with a synthetic contract fixture, but local verification is not automatically ingested or promoted to experiment-matrix Observed evidence; profile enforcement remains unimplemented.

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
npm run m2e:verify
npm run m2e:run:observe
npm run m2e:run:api
npm run m2e:run:dry-run
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

## M3: harness and reports

Status: **implementation and B-01 through B-05 remediation independently re-reviewed; M3 gate approved with non-blocking follow-ups; experiment-matrix Observed unchanged**. The first independent review and its blocked decision remain recorded in [M3 harness and reports independent review](reviews/m3-harness-and-reports.md); closure evidence and the current gate decision are recorded in [M3 harness and reports remediation re-review](reviews/m3-harness-and-reports-remediation.md). `packages/lab-cli`はrepository-owned synthetic contract fixtureでcollector/reducer/report境界を検証する。M2-B〜M2-Eのlocal runner outputはadapter contract evidenceであり、M3のcanonical runまたはexperiment-matrix Observedへ自動昇格しない。M2-Aのcontainer evidence-transfer boundaryは引き続きBlocked/Inconclusiveであり、M3実装を理由に成功扱いしない。

### Goal

Versioned scenario input、run completion、closed producer segmentをtool非依存に検証・集約し、immutableなraw inputからdeterministicな`events.jsonl`、`run-metadata.json`、`summary.json`、`comparison.md`、`hashes.json`を再生成できる固定harness/report境界を実装する。

### Prerequisites

- M1 independent review gate approved、`probe-manifest/v2`と`probe-event/v2` contract approved
- 対象adapterのindependent review approved。M2-Aはblocked/inconclusiveのまま入力対象外にできる
- root `npm run check` success
- scenario expected、producer segment、observed resultを別file・別更新経路に置くcontractをhuman reviewする
- deterministic merge key、canonical event envelope、invalid/incomplete run semanticsを実装前に承認する

### Read first

- root `AGENTS.md`、[index.md](index.md)、このM3定義、[codex-workflow.md](codex-workflow.md)
- [experiment-protocol.md](experiment-protocol.md)、[experiment-matrix.md](experiment-matrix.md)、[architecture.md](architecture.md)

### Fixed input and output contract

M3 inputは固定scenario definitionとdisposable run directoryだけである。CLIは任意command、任意module、任意pathを受けず、version controlされたscenario IDからfixed adapter runner contractを選ぶ。M3実装時のfixtureはrepository-owned synthetic producer segmentを使用し、adapter integration runやmatrix Observedを生成しない。

```text
results/runs/<run-id>/
├── manifest.snapshot.json
├── run-completion.snapshot.json
├── run-metadata.json
├── hashes.json
├── segments/
│   └── <producer-id>.jsonl
├── events.jsonl
├── summary.json
└── comparison.md
```

`manifest.snapshot.json`、`run-completion.snapshot.json`、`segments/`はimmutable inputであり、collector/reducerはraw segmentのbyte列を変更しない。Segmentはcopy後にfatal UTF-8 decodeし、canonical serialized bytesと一致する場合だけ採用する。`events.jsonl`の各行はM1 event自体へfieldを追加せず、`lab-canonical-event/v1` envelopeとして`globalSequence`とvalidation済み`probe-event/v2`を保持する。Global sequenceはproducer間の因果順序や実時間順を表さない。

M3 remediation後のschemaは`lab-scenario-definition/v2`、`lab-scenario-snapshot/v2`、`lab-run-metadata/v2`、`lab-summary/v2`、`lab-hash-evidence/v2`である。`probe-event/v2`、`lab-canonical-event/v1`、`lab-run-completion/v1`は変更しない。

Segment ingestion orderは、validation済み`producerId`のUnicode code point順、次にmanifest snapshotが列挙するstable segment ID順とし、segment内ではline orderを保持する。1 producer 1 segmentを要求し、各segmentの`producerSequence`は`0..n-1`のgapなし連番にする。Run/scenario/producer/manifest contextの不一致、重複producer、未宣言segmentを拒否する。

### In scope

- `packages/lab-cli/**`、`scenarios/**`、result schema/report tests、必要最小限のroot package script
- scenario/profile manifest loadとcross-validation、run IDとdisposable output ownership
- fixed adapter runner contractのdispatch。User指定command/argv/cwd/module pathは受けない
- closed producer segmentのsize/LF/JSON/schema/semantic/sequence/context再validation
- unknown fieldを削除して採用せず、segment単位でfail closedにするredaction boundary
- deterministic mergeと`lab-canonical-event/v1` global sequence付与
- phase/event kind/attempt type/outcome、PID/PPID/worker構造、tool API change、hash deltaのreducer
- expected/observed diff、run validity、timeout、collector/schema error、logical evidence locationを持つJSON/Markdown report
- raw segment、manifest snapshot、run completion snapshotから同一byteのderived outputを再生成するtest
- missing、timeout、partial、invalid segmentを0 invocationへ変換しないnegative test

### Out of scope

- `probe-event/v2`、adapter contract、adapter local runner outputの変更
- M2-A lifecycleのhost pack/install/run、未解決container evidence-transfer境界の回避
- permissive/constrained container enforcement、profile Observedの生成（M4）
- experiment-matrixのObserved欄、`results/examples/**`、evidence mapの更新（M6）
- artifact build/verify/deploy orchestration（M5）
- arbitrary command/module/path runner、shell実行、external network、real credential
- invalid segmentからvalid prefixだけを採用するbest-effort recovery

### Deliverables

- private ESM package `packages/lab-cli`とstrict TypeScript build/test/static verifier
- versioned scenario definition schemaとrepository-owned deterministic collector fixtures
- `lab-canonical-event/v1`、run metadata、summary、hash evidenceのversioned schemas
- fixed scenario dispatch、collector、reducer、JSON/Markdown renderer
- `prompts/m3-harness-and-reports.md`
- `prompts/m3-harness-and-reports-remediation.md`
- raw-to-derived regeneration、permutation、partial/corrupt/missing/timeout、raw-data rejection tests

### Run validity and report semantics

- Attemptの`failure`/`skipped`やExpected mismatchは、evidenceがcompleteならrun自体をinvalidにしない。Observed outcomeとmismatchをそのまま集計する
- Missing segment、terminal sink/close failure、LFなし末尾、blank/oversize line、JSON/schema/semantic error、producer sequence gap/duplicate、manifest context mismatch、unexpected timeout、hash finalization failureはrunを`inconclusive`にする
- `inconclusive` runではinvocation/capability/tool-change countを`0`と表示せず`null`/unavailableにし、canonical `events.jsonl`とcomparison success rowを生成しない
- Valid runのExpected mismatchは`complete`のままcomparisonへ保持し、ExpectedまたはObservedを補正しない
- Summary/Markdownはabsolute path、raw canary、file content、diff、raw error/stack、stdout/stderr、executable path、loopback bodyを保持しない
- PID/PPID/workerはeventには実値を保持するが、run間比較では構造的relationshipへprojectし、PID値の一致をidentityとして扱わない

### Acceptance criteria

- `packages/lab-cli`はtool packageをruntime importせず、fixed adapter runner contractだけへ依存する
- CLI import時にfilesystem、process、network、timer、report生成を開始しない
- Scenario ID以外のuser指定command、argv、cwd、module path、output pathを受け付けない
- Manifest snapshotとsegment metadataをstructural validationし、unknown key、accessor、custom prototype、symlink/path escapeを拒否する
- 各producer segmentを対応manifest contextで`probe-event/v2`として再validationし、raw event objectを信頼しない
- Segment size 4 MiB、event 1,024件、line 16,384 bytesのM1上限をcollectorでもfail closedにする
- SegmentはLF終端、1行1 object、producer sequence `0..n-1`、1 producer 1 segmentでなければならない
- Deterministic ingestion orderと`globalSequence: 0..n-1`がinput file enumeration order、filesystem order、timestampに依存しない
- Canonical envelopeはM1 eventを変更せず、global sequenceが因果順序ではないことをmetadata/reportに明記する
- Raw segmentをbyte-for-byte変更せず、同じmanifest/completion snapshotとsegmentからderived outputを再生成すると同一byteになる
- Reducerがphase別route count、event kind、attempt type/outcome、tool API change、PID/PPID/worker構造、hash delta、Expected mismatchをeventから生成する
- Run metadataがsanitized tool/Node version、profile revision、container input、segment retentionを持つ
- Missing/timeout/invalid/incomplete runを0 invocationまたはvalid successに変換せず、partial event/countを採用しない
- Expected fileとexperiment matrixをcollector/reducerが変更しない
- Report outputに禁止raw dataまたはabsolute pathがなく、evidence locationはrun root相対のlogical pathだけである
- M2 local runner resultをmatrix Observed、profile evidence、presentation evidenceとして自動登録しない
- Unit/integration/static testsとroot regressionが成功する

### Verification commands

M3実装ではroot `package.json`の同名scriptを使用して次を実行する。

```sh
npm run typecheck --workspace packages/lab-cli
npm run build --workspace packages/lab-cli
npm run verify:static --workspace packages/lab-cli
npm run test --workspace packages/lab-cli
npm run m3:verify
npm run verify:static --workspace packages/probe-core
npm run check
git diff --check
git status --short
```

### Risks

- Timestampやfilesystem enumeration orderを因果順序として誤解する
- Invalid segmentのvalid-looking prefixを採用し、event lossを隠す
- Missing/timeoutを0 invocationへ変換し、未実測とroute未起動を混同する
- Local adapter verificationをmatrix/profile Observedへ昇格させる
- Reporterがraw path、error、content、canary、stdout/stderrを再導入する
- Harnessをarbitrary command/path escape hatchへ拡張する

### Human review points

- `lab-canonical-event/v1` envelopeとM1 `probe-event/v2`非変更境界
- deterministic merge key、duplicate/gap/partial/terminal failureのfail-closed判定
- complete/inconclusive、attempt outcome、Expected mismatchの分離
- raw segment不変性、completion snapshot、raw-to-summary/report再生成可能性
- fixed scenario dispatchとarbitrary command/path/module拒否
- M2 local evidence、M3 canonical run、M4 profile evidence、M6 presentation evidenceの分離

## M4: permissive / constrained execution profile

Standing-authorization clarification (2026-07-18): 次のgateで人に必要なのはreview済みoffline sourceからexact fixed tagをlocal runtimeへ供給または復元する外部状態変更である。その後の`continue-repository-work` invocationが新しい一回限定doctor再実行のstanding authorizationを与えるため、承認文言だけを別途要求しない。

One-time registry bootstrap update (2026-07-18): project humanはM4 bootstrapに限定し、credential-empty disposable Docker configと固定`/usr/bin/docker` CLIでexact `node:20.18.2-bookworm-slim` / `linux/amd64`を1回だけpullする外部network例外を明示的に承認した。固定pullはexit 0で完了し、直後のsanitized exact-tag inspectは`linux` / `amd64`、local image ID `sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`、唯一のrepository digest `node@sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`を観測した。Disposable configは削除済みで、再pull、login、credential、別image、build、control実行は行っていない。このbootstrap observationはmissing local-tag blockerだけを解消し、doctor inventory、exact-input採用、runtime enforcement、profile-control Observedを確立しない。次のfresh `continue-repository-work` invocationは承認済みsource snapshotを再検証してfixed doctorをちょうど1回実行する。

Runtime-template compatibility correction (2026-07-18): 2回の最初のstep failureは外部runtime停止ではなく、固定doctor formatがDocker 29.6.1非対応のGo-template `dict` helperを使用したことが原因だった。Credential-emptyの固定CLI診断ではclient/server `29.6.1`へ到達できた。Doctorを`json`-only canonical formatへremediateし、unit/static regressionを追加した後の一回限定実行は`runtime-version`を完了した。現在のfailureは2番目のexact local image inspectであり、`node:20.18.2-bookworm-slim`のlocal no-pull inputが利用できない。Candidate inventoryとprofile-control/matrix Observedは未取得のままである。

Fresh compatibility re-review update (2026-07-18): [runtime-template compatibility independent re-review](reviews/m4-execution-profiles-runtime-template-compatibility.md)は現在の`json`-only doctor bytesをstatic/unit gateで承認した。Doctorは再実行せず、exact input、build、controls、runtime enforcement、Observedを承認していない。次のgateにはproject humanによるreview済みoffline exact local base inputの供給または復元が必要である。

Post-bootstrap fixed doctor update (2026-07-18): fresh workerはreview済みaggregate/source/package/toolchain SHA-256を再検証し、`npm run m4:verify`（13 files / 115 tests）後に`continue-repository-work` standing authorizationを使用して`npm run m4:doctor`をちょうど1回実行した。これは別のhuman reviewではない。Doctorは3 stepすべてを完了して`accepted`となり、client/server `29.6.1`、exact tag `node:20.18.2-bookworm-slim`、base/local digest `sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`、`linux` / `amd64`、base environment keys `PATH`、`NODE_VERSION`、`YARN_VERSION`をsanitized candidate inventoryとして観測した。Environment value、stderr、raw error、host path、credentialは保存していない。Pull/build/create/start/run/controlは実行せず、entry sourceは直後に通常のfail-closed状態へ戻した。

Exact-input proposal update (2026-07-18): accepted doctor candidateをversion管理された`containers/profile-control/image-input.json`へbindし、固定4 staging filesのrepository bytesからper-file SHA-256とordered aggregate `sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03`を再計算した。Exact-key/fixed-value validator、substitution negative test、fixed host-backendとoffline build後のprofile binding gate proposalを追加済みで、fresh independent read-only review待ちである。これはexact-input adoption、build approval、built-image digest、`profile.json`、runtime enforcement、Observedを確立しない。

Exact-input independent review update (2026-07-18): [fresh independent review](reviews/m4-execution-profiles-exact-input-contract.md)はaccepted doctor candidateからversioned base/environment inputへのtraceと、固定4 staging filesのsize/per-file SHA-256/ordered aggregateを独立再計算してacceptした。一方、fixed host-backend/runtime contractはB-11/B-12でblockedとした。Profile pre-start inspectがDocker `29.6.1`で利用できない`dict` helperを残し、pre-build version stepがserver-only outputのpayloadを検証せずexit 0だけでbuildへ進めるためである。Exact-input adoption、image build、`profile.json`、controls、runtime enforcement、Observedは引き続き未承認・未実行である。

状態: **Expected-only contract と ADR-0001 承認済み。B-03/B-04/B-07は独立read-only re-reviewでclosureし、static/unit implementation gateは承認済み。固定doctor remediationの独立re-reviewはB-08/B-10をclosureし、canonical-byte remediationのfresh独立read-only re-reviewはB-09をclosureした。Runtime-template compatibility correctionもfresh独立read-only re-reviewで承認され、現在のfixed doctor static/unit gateは承認済み。Post-bootstrap fixed doctorはreview済みbytesでaccepted candidate inventoryを取得済み。Exact-input proposalは実装済み・fresh independent read-only review待ちで、adoption、image build、controls、runtime enforcementは未承認・未実行、profile-control Observedは未実測、experiment-matrix route Observedは変更なし**。プロジェクトの human reviewer が 2026-07-17 に contract を明示的に承認した。contract は [M4 execution profiles](m4-execution-profiles.md)、exact-input proposalは[M4 exact-input proposal](m4-execution-profiles-exact-input.md)、承認判断は [M4 contract independent review](reviews/m4-execution-profiles-contract.md)、元の実装review判断は [M4 implementation independent review](reviews/m4-execution-profiles.md)、B-01〜B-06 remediation判断は[M4 remediation independent re-review](reviews/m4-execution-profiles-remediation.md)、現在のstatic/unit gate判断は[M4 input-binding remediation independent re-review](reviews/m4-execution-profiles-input-binding-remediation.md)、元のdoctor gate判断とremediation handoffは[fixed doctor boundary independent review](reviews/m4-execution-profiles-doctor-boundary.md)、B-08/B-10判断は[doctor remediation independent re-review](reviews/m4-execution-profiles-doctor-boundary-remediation.md)、B-09判断とdoctor実行履歴は[canonical-byte remediation independent re-review](reviews/m4-execution-profiles-doctor-canonical-bytes-remediation.md)、現在のdoctor bytesとpost-review execution handoffは[runtime-template compatibility independent re-review](reviews/m4-execution-profiles-runtime-template-compatibility.md)、control/route を恒久的に分離する判断は [ADR-0001](decisions/0001-separate-profile-controls-from-route-evidence.md)に記録している。Doctorはfixed 3 command、pull/build/create/start/runなし、通常時のDocker access前`M4_EXECUTION_NOT_APPROVED`、step 2/3 identity cross-binding、structured key-only framing、original-byte canonical comparisonを維持する。`continue-repository-work`のstanding authorizationを一回限定実行の承認に使用したが、これは別のhuman reviewが行われたことを意味しない。次のtaskは`prompts/reviews/m4-execution-profiles-exact-input-contract-review.md`に従うfresh independent read-only reviewである。Image buildとcontainer control実行はそれぞれさらに後続の明示的承認を必要とする。

Current exact-input status (supersedes the exact-input pending/next-task clauses in the preceding status paragraph): **base/environment trace and repository staging bytes independently accepted; B-11/B-12 closed for static/unit; base/staging/fixed-backend contract approved; exact-input production adoption, production backend, image build, controls, runtime enforcement, and all profile-control/route Observed remain unapproved or unmeasured**. [Fresh independent read-only re-review](reviews/m4-execution-profiles-exact-input-backend-remediation.md)はDockerを実行せず、新しいblocking findingなしでこの判断を記録した。次のtaskはreview済みsnapshotとfixed command planだけへbindするproduction offline-build backendのnon-executing implementation contractと独立review promptを作ることである。Production backend実装・review・別途記録するexecution gateより前にimage buildを実行せず、profile bindingとcontainer control実行も後続gateのままとする。

Offline-build backend contract handoff (2026-07-18; supersedes the current-next-task clause above): [`prompts/m4-execution-profiles-offline-build-backend.md`](../prompts/m4-execution-profiles-offline-build-backend.md)は、accepted snapshot、branded layout、fixed 3-command image build planだけを受けるbuild-only executorとproduction host backendのnon-executing implementation boundaryを固定した。通常entryは`M4_EXECUTION_NOT_APPROVED`を維持し、production backendをimport/construct/exportしない。独立review scopeは[`prompts/reviews/m4-execution-profiles-offline-build-backend-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-backend-review.md)に固定済みである。次のtaskはimplementation promptに従うstatic/unit実装であり、Docker、image build、profile binding、control executionは実行しない。

Offline-build backend implementation update (2026-07-18; supersedes the current-next-task clause above): accepted snapshot、branded fixed layout、review済み3-command planだけへbindしたbuild-only executor、canonical sanitized build result、production host filesystem/process/cleanup backendをnon-executing static/unit境界で実装した。通常entry/package rootはbackendをimport/construct/exportせず、`M4_EXECUTION_NOT_APPROVED`を維持する。Docker、image build、profile binding、control executionは実行していない。次のtaskは[`prompts/reviews/m4-execution-profiles-offline-build-backend-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-backend-review.md)に従うfresh independent read-only reviewである。Offline build execution、built-image digest、`profile.json`、controls、runtime enforcement、Observedは別gateのままである。

Offline-build backend independent review update (2026-07-18; supersedes the current-next-task clause above): [fresh independent read-only review](reviews/m4-execution-profiles-offline-build-backend.md)はaccepted input/fixed plan不変性とbuild-only filesystem/activation boundaryをacceptしたが、production backend static/unit gateをB-13〜B-15でblockした。Known synthetic built-image placeholderの受理、canonical resultのfailure/step不整合受理、production process failure flagsの非monotonicなevent-orderがblockerである。次のtaskは[`prompts/m4-execution-profiles-offline-build-result-remediation.md`](../prompts/m4-execution-profiles-offline-build-result-remediation.md)に従うDocker非実行のresult/process-order remediationである。そのfresh independent re-reviewと別途記録するexecution gateより前にoffline buildを実行せず、built-image/profile bindingとcontrol executionも後続gateのままとする。

Offline-build result remediation implementation update (2026-07-18; supersedes the current-next-task clause above): B-13のknown synthetic digest rejection、B-14のfailure/completed-step/version/digest exact matrix、B-15のmonotonic process first-failure latchとcontradictory backend framing rejectionをDocker非実行のstatic/unit境界で実装した。Accepted base/staging input、fixed plan、通常の`M4_EXECUTION_NOT_APPROVED`境界は変更していない。次のtaskは[`prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md)に従うfresh independent read-only re-reviewである。そのreviewと別途記録するexecution gateより前にoffline buildを実行せず、built-image/profile bindingとcontrol executionも後続gateのままとする。

Offline-build result remediation re-review update (2026-07-18; supersedes the current-next-task clause above): [fresh independent read-only re-review](reviews/m4-execution-profiles-offline-build-result-remediation.md)はB-13/B-14/B-15をstatic/unit境界でclosureし、production offline-build backend static/unit gateを新しいblocking findingなしで承認した。Docker、offline build、built-image digest、profile binding、controls、runtime enforcement、Observedは実行・承認していない。次のtaskはreview済みsource snapshot、exact run ID/layout/plan、side-effect/cleanup境界、sanitized result、post-run restoration/verificationを固定する一回限定offline-build execution gateの作成であり、そのtask自体ではDockerを実行しない。

Offline-build execution-gate definition update (2026-07-18; supersedes the current-next-task clause above): [`prompts/m4-execution-profiles-offline-build-execution.md`](../prompts/m4-execution-profiles-offline-build-execution.md)はreview済みsource manifest、fixed run ID `m4-offline-build-20260718-01`、exact repository-owned layout/tag/plan、review対象temporary activation source、standing authorizationで実行するexact command 1回、sanitized result、tag/owned-state limitation、ordinary source/compiled output restorationを固定した。Activation sourceはDocker非実行でtypecheck/compileされ、hash確認後にordinary fail-closed entryへ戻した。Gate candidateは未承認・未実行である。次のtaskは[`prompts/reviews/m4-execution-profiles-offline-build-execution-gate-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-execution-gate-review.md)に従うfresh independent read-only reviewである。そのreviewより前にtemporary activation、Docker、offline buildへ進まず、profile bindingとcontrolsも後続gateのままとする。

Offline-build execution-gate independent review update (2026-07-18; supersedes the current-next-task clause above): [fresh independent read-only review](reviews/m4-execution-profiles-offline-build-execution-gate.md)はreview済みsource/staging/activation/restoration hashes、fixed run/layout/tag、accepted snapshot/plan/backend identity、3-command side-effect/cleanup、canonical result、one-time/no-retry semanticsを独立照合し、新しいblocking findingなしでexact one-time execution gateを承認した。Reviewはtemporary activation、Docker、offline buildを実行していない。次のtaskはfresh workerが[`prompts/m4-execution-profiles-offline-build-execution.md`](../prompts/m4-execution-profiles-offline-build-execution.md)に従い、snapshotとfixed run-root absenceを再検証してstanding authorizationで`npm run --silent m4:build`をちょうど1回実行し、ordinary source/compiled outputを即時復元してcanonical sanitized resultを記録することである。これは別human reviewを意味しない。Profile binding、controls、runtime enforcement、Observedは後続gateのままである。

One-time offline-build execution follow-up (2026-07-18; supersedes the current-next-task clause above): fresh workerはreview済みsnapshotとrun-root absenceを再検証し、`continue-repository-work` standing authorizationを使用して`npm run --silent m4:build`をちょうど1回実行した。これは別human reviewを意味しない。Commandはexit 1、canonical resultは`inconclusive / CLEANUP_FAILURE`で、`stage-build-context`、`doctor`、`build`、`inspect-image`の4 step、client/server `29.6.1`を記録したが、`builtImageDigest`は`null`である。Fixed planにimage removalはなく、inspect済みfixed tagは後続recovery gateへ残した。Post-run Docker commandやretryは実行していない。Fixed run rootは残り、`staging`と`docker-config/config.json`はなく、`docker-config`にruntime-created buildx/token-seed stateが残った。Ordinary source/compiled outputはreview済みhashへ即時復元し、post-restoration `m4:verify`（17 files / 176 tests）とroot `check`（84 files / 507 tests）は成功した。次のtaskはexisting fixed tagとretained run rootだけへbindし、exact digest inspect最大1回とidentity-checked owned-state treatmentを固定するDocker非実行のpost-cleanup-failure recovery contractと独立review promptを作ることである。Profile binding、controls、runtime enforcement、Observedは引き続き未確立である。

Offline-build recovery contract handoff (2026-07-18; supersedes the current-next-task clause above): [`prompts/m4-execution-profiles-offline-build-recovery.md`](../prompts/m4-execution-profiles-offline-build-recovery.md)と[`prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md)を作成した。Recoveryはrecorded `CLEANUP_FAILURE`、fixed run ID/tag、retained exact treeに限定し、exact local image-ID inspectを最大1回だけ許す。Runtime-created stateのcontentsはread/hashせず、pre/post identityをprivateに検証して全outcomeで保持する。次のtaskはrecovery-only executor/result/production host backendのDocker非実行static/unit実装である。そのfresh independent reviewと別途記録するone-time recovery execution gateより前にDockerへ進まず、state deletion、profile binding、controls、runtime enforcement、Observedも行わない。

Offline-build recovery implementation update (2026-07-18; supersedes the current-next-task clause above): exact recorded `CLEANUP_FAILURE`、fixed run ID/tag、retained tree inventoryへbindしたrecovery-only executor、canonical `lab-profile-offline-build-recovery-result/v1`、read-only pre/post identity validator、single-inspect production host backendをDocker非実行のstatic/unit境界で実装した。Runtime-created file contentsはread/hash/serializeせず、stateは全outcomeで`retained`のままにする。通常entry/package rootはproduction recovery backendをimport/construct/exportせず、Docker、state deletion、profile binding、controls、runtime enforcement、Observedは実行・確立していない。次のtaskは[`prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md)に従うfresh independent read-only reviewである。そのreviewと別途記録するone-time recovery execution gateより前にDockerへ進まない。

Offline-build recovery independent review update (2026-07-18; supersedes the current-next-task clause above): [fresh independent read-only review](reviews/m4-execution-profiles-offline-build-recovery.md)はrecorded failed-build/run/tag binding、retained content non-read/retention-only treatment、single-inspect/digest/result、ordinary activation boundaryをacceptしたが、production recovery backend static/unit gateをB-16/B-17でblockした。Exact mode checkがsetuid/setgid/sticky bitsを無視することと、close未観測のactive childが残るabnormal-close pathでpost-attempt identity validationを成功扱いできることがblockerである。次のtaskは[`prompts/m4-execution-profiles-offline-build-recovery-remediation.md`](../prompts/m4-execution-profiles-offline-build-recovery-remediation.md)に従うDocker非実行のexact-mode/process-settlement remediationである。そのfresh independent re-reviewと別途記録するone-time recovery execution gateより前にDockerへ進まず、retained state deletion、built-image/profile binding、controls、runtime enforcement、Observedも後続gateのままとする。

### Goal

同一のimmutable container inputとharmless control fixtureをpermissive/constrainedの固定runtime policyで実行し、environment、file、write、fixed loopback、fixed child、result channelのexposure/denialをhost inspectionとcontainer内evidenceの両方で検証する。Profile controlをadapter route、experiment-matrix route Observed、presentation evidenceへ昇格しない。

### Prerequisites

- M1、対象となるM1 schema、M3 collector/report gateがindependent review approved
- [M4 execution profiles](m4-execution-profiles.md)と[ADR-0001](decisions/0001-separate-profile-controls-from-route-evidence.md)がhuman review approved
- root `npm run check` success
- approved host orchestrator、固定Docker CLI boundary、locally available digest-pinned base inputが明示される
- Expected profile/control manifestsを実験前にversion controlし、Observed欄を未実測のままにする

### Read first

- root `AGENTS.md`、[index.md](index.md)、このM4定義、[codex-workflow.md](codex-workflow.md)
- [M4 execution profiles](m4-execution-profiles.md)、[threat-model.md](threat-model.md)、[architecture.md](architecture.md)、[experiment-matrix.md](experiment-matrix.md)

### Fixed control and output contract

- Control IDsは`m4-profile-control-p`と`m4-profile-control-c`だけで、versioned `lab-profile-control-manifest/v1`を使う
- Profile schemaは`lab-execution-profile/v1`、control evidenceは`lab-profile-control-evidence/v1`
- 両profileは同じimage digest、Node.js version、fixture/control bytes、timeout、resource limit、control orderを使う
- 差分はreview済みenvironment、canary file exposure、scratch write、loopback service、child runtime policyだけに限定する
- 両profileともnon-root、read-only root、capability drop all、no-new-privileges、external networkなし、host home/credential/agent/runtime socket mountなしを維持する
- Host inspection、immutable control input、canonical control evidence、completion、Expected/Observed comparisonをrunごとの別directoryに保存する

### In scope

- `profiles/**`
- `containers/profile-control/**`、`containers/permissive/**`、`containers/constrained/**`
- fixed host orchestrator、profile/control schema validator、static/unit/integration tests
- profile control専用のignored `results/runs/m4-profile-controls/**` contractと必要最小限のroot script/config
- fixed Docker create/inspect/start/copy-or-result/cleanup command construction
- exact mount/environment/user/network/capability/security/resource/command inspection
- canonical bounded control evidence、completion、Expected/Observed comparison

### Out of scope

- M2 adapter sourceまたはM1/M3 event/schemaの変更
- npm lifecycle fixtureの実行、M2-A evidence-transfer boundaryの回避
- adapter/profile route run、baseline、experiment-matrix route Observed更新
- external network/image pull/package install、real credential、host home、SSH agent、runtime socket exposure
- arbitrary image/command/argv/mount/environment/path/runtime option
- M5 artifact pipeline、M6 sanitized examples/evidence map、publication

### Expected outcome contract

- Permissive: environment canary、canary file、disposable scratch write、fixed loopback protocol、fixed child Node.jsがsuccess
- Constrained: environmentはabsent、canary fileはabsent、scratch writeはpermission/runtime boundaryでfailure、fixed loopback targetはunreachable、fixed childはNode/runtime policyでfailure
- Source mutation controlは両profileでdenied、result/evidence writeは両profileでsuccess
- Constrained childが実enforcementできなければExpected mismatchのまま残し、`manifest-skip`へ事後変更しない
- Access failureはvalid observationになり得るが、missing inspection/evidence、schema/transfer/completion errorはinconclusive

### Deliverables

- approved `prompts/m4-execution-profiles.md`と後続独立review prompt
- versioned permissive/constrained profile definitionsとexact-key validators
- same-image profile-control fixture/container inputとfixed host orchestrator
- static policy tests、schema/unit negative tests、approved-host integration tests
- bounded canonical control evidence、host inspection projection、comparison、run validity
- documentation/status update。Matrix route Observedとpresentation evidenceは変更しない

### Acceptance criteria

- Profile/control/evidence inputはunknown key、Proxy、accessor、custom prototype、duplicate、invalid limit、raw path/valueをfail closedに拒否する
- Fixed orchestratorはuser指定image、command、argv、cwd、mount、environment、path、Docker optionを受け付けない
- Docker CLI configはdisposableでhost registry credentialを読まず、build/runはexternal networkなし、runtimeは`--pull never`相当である
- Start前のfull inspectがexact image digest、command、non-root user、read-only root、network、mount、environment、capability、security option、resource limitを検証する
- Host home、repository、SSH agent、credential store、Docker/runtime socket、device、host PID/network namespaceをmount/forwardしない
- 両profileがsame image/control digestを使い、別run IDと別writable stateを持つ
- Expected tableの全controlが順番どおり1回観測され、raw canary/file/child/loopback payloadを保存しない
- Constrainedのscratch/child denialはoperationを実行したfailureとして観測し、manifest skipまたは未実行をruntime denialに数えない
- Permissiveもsource writeとexternal networkを許可せず、profile名をhost-wide accessと表現しない
- Host inspectionとcontainer controlの片方だけではcompleteにせず、missing/invalid/timeout/transfer failureをinconclusiveにする
- Expected mismatchを保持し、profile、control fixture、Expected、Observedを自動補正しない
- Control evidenceをadapter route Observed、matrix route Observed、M6 presentation evidenceへ登録しない
- Static/unit/integration testsとroot regressionが成功し、independent reviewがcomplete runtime evidenceを確認する

### Planned implementation verification commands

M4 implementationはroot `package.json`に次のexact scriptを追加してから実行する。`doctor`、`build`、`run:controls`はapproved host orchestratorとlocally available pinned inputがない環境では実行せず、M4 gateをpending/blockedのままにする。

```sh
npm run m4:typecheck
npm run m4:static
npm run m4:test
npm run m4:verify
npm run m4:doctor
npm run m4:build
npm run m4:run:controls
npm run m4:verify:evidence
npm run check
git diff --check
git status --short
```

### Risks

- Separate image/input driftをprofile differenceと誤認する
- Container option、manifest skip、target absenceをruntime enforcementと誤認する
- Result mount、Docker socket、host credential/configをcontainerへ過剰公開する
- Permissiveをhost-wide privilege、constrainedをcomplete sandboxと表現する
- Child/loopbackの単一controlを一般的なprocess/network isolationへ過剰一般化する
- Unit/static test passだけでruntime enforcementをapproveする

### Human review points

- Proposed ADR、same-image requirement、profile/control schemaとExpected table
- Fixed Docker argument constructionとdisposable CLI config
- Image staging、base digest、offline build、mount/environment inventory
- Start前inspectとcontainer内control evidenceの独立性
- Node/runtime child denial、read-only write denial、loopback target absenceの正確な表現
- Raw-data policy、transfer/completion、inconclusive semantics、control/route evidence分離

## Presentation MVP critical path

Status: **active; P1 complete; P2 Expected contract and non-executing create
plan complete; codegen binding/projection/fixed runner source complete and its
exact staging assembly next**.

This section supersedes every earlier `next task` or `current-next-task` clause
for scheduling. The preceding M4 history remains an accurate record of work and
findings, but it is no longer the default continuation path. The active scope is
[TSKaigi Sendai 2026 presentation MVP](presentation-scope.md), accepted by
[ADR-0002](decisions/0002-prioritize-presentation-mvp.md).

### Frozen research track

- The production offline-build recovery backend remains blocked on B-16/B-17.
  Do not implement its remediation, define/execute another recovery gate,
  inspect/retry the retained tag, or mutate/delete the retained run state as part
  of the presentation MVP.
- Keep the ordinary M4 entry fail closed. Static/unit results, doctor records,
  and the failed build are not profile runtime Observed.
- M4 profile-control remains optional diagnostic/appendix evidence. ADR-0001's
  control/route evidence distinction remains in force, but generic recovery is
  no longer a prerequisite for selected presentation route runs.
- Full generic collector/provenance hardening and remediation-specific review
  loops are deferred until a project human explicitly resumes the research
  track.

### P0 — Scope and workflow pivot

Deliverables:

- `docs/presentation-scope.md` with C-01 through C-07, selected scenarios,
  minimal artifact demo, safety boundary, and phase-specific network policy
- ADR-0002, scoped agent instructions, documentation routing, and this
  authoritative milestone update
- M4/exact-input status updated to frozen rather than remediation-next

Acceptance criteria:

- no code, Expected value, Observed value, retained runtime state, or Docker
  state is changed by the pivot
- root agent rules distinguish ordinary development from probe/container
  execution while nested rules preserve canary/path/network/child restrictions
- all documentation routes identify the presentation MVP as the active track
- root regression and formatting checks pass

Verification commands:

```sh
npm run format:check
npm run check
git diff --check
git status --short
```

### P1 — Presentation evidence inventory

The implementation is recorded in
[`docs/presentation-evidence-inventory.md`](presentation-evidence-inventory.md)
without executing Docker or changing matrix Observed. Its
[fresh independent read-only review](reviews/presentation-evidence-inventory.md)
approved the classifications, sanitized projections, rejected inputs, and exact
P2/P3 gaps with no findings.

For every C-01 through C-07 claim, list:

- the candidate existing M0/M2/M3/M4 evidence and its exact evidence class
  (`Observed`, `Inconclusive`, `local adapter evidence`, `static/unit`, or
  `Expected-only`)
- whether the bytes are sanitized, reproducible, and suitable for a conference
  claim
- the smallest missing runtime run and fixed scenario needed to close the gap
- limitations that must appear next to the claim

The inventory must not promote local adapter output, synthetic M3 output, or M4
static/unit results to matrix/profile Observed.

### P2 — Selected profile evidence

The Docker-non-executing
[`P2 selected profile evidence Expected contract`](p2-selected-profile-contract.md)
resolves the codegen adapter-to-scenario mismatch by binding the complete
reviewed `5 / 6 / 1 / 12` producer before execution. Implement the smallest
fixed runner, perform one focused non-executing review of its exact command,
then run only `vite-observe-p/c` and `codegen-observe-p/c`. Each pair uses
identical image and fixture bytes, fixed commands/arguments, non-root execution,
read-only source, dedicated writable result paths, bounded time/output, offline
runtime, and no runtime-socket forwarding. Record environment/file/write/
loopback/child attempts separately and preserve mismatches.

Do not add other matrix rows, watch/cache/parallel variants, or a generic M4
recovery dependency to this task.

Implementation update (2026-07-19):
`containers/presentation-profiles/src/plan.ts` fixes an argument-free ordered
four-scenario plan, the pinned local image reference, pair-identical staging and
semantic commands, separate run roots, and offline/non-root/read-only Docker
`create` arguments. The plan does not expose an executor, and no staging
assembly, Docker operation, profile Observed, or matrix update exists yet.

Codegen binding update (2026-07-19): M2-E validates the two exact selected
scenario/run/profile tuples and binds the selected scenario ID before manifest
or session creation while preserving the local M2-E path. Its selected bindings
separate event, tool/canary, read-only source snapshot, and direct-write roots;
the constrained plan makes the last root read-only. The small sanitized
projection validates the exact tuple/order/counts and preserves mismatch or
inconclusive state. The import-safe codegen runner source fixes its two scenario
identities, canary exposure, loopback service, repeated Node permission
arguments, timeout, and output limits. P2 typecheck and 15 static/unit tests
pass. It remains unassembled, and no Docker command, profile run, matrix update,
or Observed value was produced. The next task is the exact codegen staging
assembly; Vite remains unchanged.

### P3 — Minimal artifact demo

Implement one repository-owned fixed artifact build, canonical build receipt,
separate-directory digest verification/copy, and one-byte tamper rejection.
Build exactly once; verify/deploy must not install or rebuild. Keep the receipt
small and state explicitly that identity/provenance does not prove harmlessness.
The full artifact framework in `artifact-pipeline.md` remains deferred.

### P4 — Evidence map and final presentation review

Generate sanitized examples, one compact five-route trigger table, one selected
profile/capability table, one artifact result table, and `docs/evidence-map.md`.
Every empirical claim must link to observed evidence and display its limitation.
Perform one focused final safety/validity review of the claim/evidence map;
do not create remediation-specific review loops for non-critical appendix code.

### Presentation MVP completion criteria

- C-01 through C-07 have observed evidence or an explicit displayed limitation.
- Five routes appear in the trigger/phase/count comparison, but only the selected
  Vite/codegen routes require permissive/constrained runtime evidence.
- Missing and inconclusive evidence remain visible and are not converted to
  zero/success.
- The artifact is built once, verified/copied without rebuild, and a one-byte
  mutation is rejected.
- No claim relies on AGENTS instructions or container configuration alone as
  runtime enforcement evidence.
