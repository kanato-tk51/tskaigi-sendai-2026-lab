# Threat model

## この文書の責務

この文書はラボ全体の安全境界、禁止事項、信頼境界、残存リスクの正本である。個々の scenario の期待値は [experiment-matrix.md](experiment-matrix.md)、観測方法は [experiment-protocol.md](experiment-protocol.md) に分離する。

## 保護対象と基本シナリオ

保護対象は、実験を実行するホスト、利用者のデータと資格情報、repository 外の filesystem、外部 network、および実験結果の完全性である。

基本シナリオは、プロジェクトがすでに利用している直接依存または推移依存が侵害されるか、悪性更新を受け、そのコードが通常の TypeScript toolchain の経路で Node.js 上に読み込まれるケースである。本物の悪性 package は使用せず、能力ごとに明示された無害な canary attempt だけで再現する。

## 想定する脅威

- dependency install 中の lifecycle script が process の権限で動作する。
- 設定から読み込まれた ESLint/Vitest/Vite dependency が module evaluation または tool hook で動作する。
- 利用者が明示的に起動した codegen dependency が CLI main または生成処理で動作する。
- 実行された dependency code が、渡された environment、可読 file、書込可能 path、loopback service、child process capability に到達する。
- direct filesystem write と official tool API が source/artifact を異なる方法で変更する。
- cache、watch、parallel worker、再試行によって起動回数や実行 context の解釈を誤る。
- expected result を observed result として扱う、失敗を除外する、または結果を期待に合わせて変更することで evidence が歪む。
- build 後に artifact が差し替えられる、または deploy 時に再 install/rebuild され、検証済み artifact と配置物が一致しなくなる。

## 想定する侵害経路

| Route | 起動契機の例 | 観測対象となる phase |
|---|---|---|
| npm lifecycle | dependency acquisition と lifecycle policy | install lifecycle |
| ESLint plugin | config load、lint、fix | module evaluation、initialization、file hook、fixer API |
| Vitest setup | test config load と test run | module evaluation、setup file execution |
| Vite plugin | config load、dev/build | module evaluation、initialization、transform、generateBundle |
| codegen CLI | 利用者の明示的 CLI invocation | module evaluation、CLI main、generation API |

この分類は実行時期と契機を表すものであり、権限を表さない。同じ route でも profile と起動 process の能力が異なれば、到達範囲は異なりうる。

## 想定しない脅威

- npm、Node.js、OS kernel、container runtime 自体の脆弱性
- container escape、kernel exploit、side-channel attack
- Docker daemon または Docker socket の侵害
- cloud metadata、cloud control plane、外部 registry、外部 network host に対する攻撃
- native addon、setuid binary、privileged container、device access を使う攻撃
- shell injection や任意 command execution の実演
- 本物の credential の discovery、exfiltration、validation
- ラボ外の arbitrary third-party package の安全な解析

これらを防げると主張しない。対象外の能力を必要とする experiment は追加しない。

## 信頼境界

1. **Host boundary**: repository と明示された disposable result path の外側は信頼境界外であり、probe から触れない。
2. **Container boundary**: instrumented lifecycle experiment と route experiment をホストから隔離する境界。container 内に host credential、home、agent socket、daemon socket を mount しない。
3. **Harness boundary**: manifest validation、profile selection、timeout、event collection を行う trusted control plane。adapter/probe の event を未検証 input として扱う。
4. **Probe boundary**: `probe-core` は manifest が許可した固定操作だけを実行する。adapter は tool-specific phase と official API を仲介する。
5. **Fixture boundary**: test source と dependency fixture は無害な repository-owned data に限定する。instrumented dependency は本番 project に導入しない。
6. **Artifact boundary**: build workspace、package output、verification workspace、deploy simulator を分ける。deploy 側は build toolchain を必要としない。
7. **Evidence boundary**: raw JSONL は append-only の観測入力、summary/Markdown は派生物とする。派生物から raw event を逆生成しない。

## Canary の定義

Canary は到達可能性だけを測る、使い捨ての無価値な合成データである。

- environment canary の名前は必ず `PROBE_CANARY_` で始める。
- file canary は scenario manifest が論理名と許可 path を宣言し、実験専用 directory に作る。
- network canary は loopback address または実験専用 Unix domain socket の disposable service とする。
- child-process canary は `process.execPath` で固定された repository-owned script を `shell: false` で起動する場合だけ許可する。
- canary の raw value、file content、host 固有 absolute path は event、error、report に記録しない。
- 低 entropy の raw value を hash 化して記録することも、辞書攻撃で復元可能なため禁止する。代わりに logical ID と到達成否だけを記録する。

## 許可するアクセス

すべての access は、schema validation 済み manifest に列挙されていることを前提とする。

- `PROBE_CANARY_` prefix の、manifest に列挙した environment key の存在確認
- manifest が許可した disposable canary file の read attempt
- repository 内 fixture のうち、manifest が input として許可した path の read
- manifest が許可した scratch、artifact staging、result sink への write
- manifest が指定した loopback address/port または experiment-only Unix socket への通信
- `process.execPath` と完全一致する executable、固定 repository-owned script、固定 argument list、`shell: false` による child process
- tool が公式に提供する fixer、transform、emit/generate 相当 API を通じた、fixture または artifact staging 内の変更
- allowlisted source/artifact の before/after SHA-256 計算

「permissive」はこの allowlist 内で capability を多く与える profile であり、host 全体へのアクセスを許す意味ではない。

## 禁止するアクセス

- 実在する credential の投入、探索、列挙、read、検証、送信
- `PROBE_CANARY_` 以外の environment variable の列挙または値の read
- 利用者の home directory、SSH agent、credential store、browser data、keychain へのアクセス
- Docker socket、container runtime socket の直接利用または experiment container への公開、
  host PID namespace、device の利用。承認された host orchestrator が固定された container
  runtime CLI を操作することは許可するが、runtime socket を container へ mount/forward しない
- cloud metadata endpoint と外部 network host へのアクセス
- loopback/専用 Unix socket 以外への network probe
- arbitrary executable、arbitrary argument、shell command、`shell: true`、command substitution の実行
- manifest 外 path、symlink で allowlist 外へ解決される path、特殊 file の read/write
- host 固有 absolute path、canary raw value、unsanitized stack/error の result への保存
- lifecycle fixture のホストまたは root workspace での install/実行
- observed result の手編集、期待に合わない event の破棄、実験条件の事後変更

## ホストを保護するための条件

- すべての path は操作前に canonicalize し、許可 root 内であることを確認する。symlink escape、`..`、absolute path injection を拒否する。
- mount は必要最小限とし、repository source は原則 read-only、書込先は disposable directory または明示した staging に分離する。
- host home、SSH agent、credential store、Docker socket、cloud credential file を mount/forward しない。
- container process は non-root、no-new-privileges、capability drop、resource limit を原則とする。具体的 option は M4 で検証し、使用可能だった設定だけを observed として記録する。
- external egress を構成上禁止する。network probe service が必要な場合は experiment 専用 namespace 内の loopback/Unix socket に限定する。
- event collector の channel は測定対象の network canary と分離する。専用 result path または専用 Unix socket とし、manifest に control-plane access として明記する。
- timeout と output size 上限を設け、hang、fork storm、disk exhaustion を防ぐ。
- adapter/probe の output、error、path は collector 側で再度 schema validation と redaction を行う。
- 実験開始前に fixture、mount、environment key、network target、child command が manifest と一致することを preflight で検査する。

## Container 境界

- npm install lifecycle の instrumented fixture は disposable experiment container 内でのみ package 化・install・実行する。
- `experiments/npm12-install` は root npm workspace の member にせず、root install から到達できない独立 fixture とする。
- lifecycle container には repository 全体を writable mount しない。必要な fixture input は read-only、output/result は専用 mount とする。
- container image build と experiment run は別工程として扱い、どちらにも実 credential を渡さない。
- permissive/constrained の両方を安全境界内で実行する。permissive profile に host network、privileged mode、host home mount を与えない。
- constrained profile の「拒否」は container/OS の enforcement と probe manifest の事前 skip を区別する。実装可能性を M4 で検証し、強制できなかった capability は limitation として残す。
- container の存在は完全な security boundary を保証しない。対象外である container escape への防御を実証したとは表現しない。

## 結果の完全性

- expected result は experiment 実行前に version control される manifest/matrix に置く。
- observed result は raw event と hash から機械生成し、未実行時は「未実測」とする。
- access failure は probe failure と同義ではない。拒否を正しく観測できた場合も有効な observation である。
- 欠落 event、timeout、schema error、collector error は成功として補完せず、inconclusive または failure として保持する。
- sanitized example を作る場合も元 run ID と変換手順を記録し、raw value をコピーしない。

## 残存リスク

- dependency/tool の version 差、OS、container runtime、scheduler により invocation count と worker behavior が変わりうる。
- PID、timestamp、duration は非決定的であり、完全再現ではなく構造的比較に使う。
- loopback isolation や child execution 制限が runtime ごとに異なり、M4 で一部 capability を完全に強制できない可能性がある。
- probe 自体、adapter、collector、hash/report 実装に bug があり、false positive/negative を生む可能性がある。
- official tool API と direct write の境界は tool の API contract に依存する。adapter ごとに human review が必要である。
- local provenance manifest は署名済み third-party attestation ではない。生成環境または verifier が侵害されていれば信頼できない。
- digest/provenance は artifact identity と記録された生成過程を検査するが、artifact の意味的な無害性を保証しない。

## 設計時点の仮定

- 実験用 container runtime は後続 milestone で選定・検証し、ここでは特定実装や version を固定しない。
- M0 以前は npm 12 の未承認 script の具体的挙動を expected hypothesis としてのみ扱う。
- constrained profile は credential-free であり、必要な `PROBE_CANARY_` canary を渡す場合も実 credential の代替ではなく、到達性測定専用である。
