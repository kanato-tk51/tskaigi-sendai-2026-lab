# Product requirements

## この文書の責務

この文書は `ts-dependency-execution-lab` のプロダクト範囲と成功条件の正本である。安全境界は [threat-model.md](threat-model.md)、測定手順とイベント定義は [experiment-protocol.md](experiment-protocol.md)、実装配置は [architecture.md](architecture.md) を正本とし、ここでは詳細を重複させない。

## 目的

TypeScript ツールチェーンで依存コードが Node.js 上で実行される複数の経路を、同じ無害な probe と再現可能なローカル条件で比較する。中心となる検証仮説は次のとおりである。

> 依存コードの到達範囲は経路名だけでは決まらず、実行時のプロセスに渡された環境変数、ファイル権限、書き込み先、通信経路、子プロセス実行能力によって決まる。

比較する経路は以下である。

- npm dependency install lifecycle scripts
- ESLint plugins
- Vitest `setupFiles`
- Vite plugins
- 利用者が明示的に起動する code-generation CLI

npm 12 の未承認 install lifecycle script に関する挙動は、一般論として前提にせず、全体実装より先の M0 spike で対象バージョン、設定、承認状態とともに確認する。

## 現在のdelivery優先順位

2026-07-18以降、TSKaigi Sendai 2026の20分発表を完成させる
[presentation MVP](presentation-scope.md)をactive delivery scopeとする。以下に残る
full-labの完成物・成功条件は長期的なresearch trackとして保持するが、すべてを満たすことを
発表完成の前提にしない。

Presentation MVPは7件のclaim、5経路の小さなphase/trigger/count表、Viteとcodegenの
代表profile比較、1件のbuild-once/digest/tamper demo、sanitized evidence mapに限定する。
M4 cleanup recovery、全matrix rowのprofile実測、汎用provenance/collector frameworkは
既知の制限付きappendix/backlogである。

## 想定利用者

- TypeScript プロジェクトの開発者、maintainer、build/release 担当者
- CI/CD と dependency risk を設計・レビューする security engineer
- ツールチェーン上の実行経路と権限境界を説明する技術発表者
- 実測可能な教材を必要とする workshop、研究、教育用途の利用者

## ユースケース

1. 同一 probe が各経路のどの phase で何回起動されるかを比較する。
2. permissive profile と constrained build profile で、同じ経路の到達範囲がどう変わるかを比較する。
3. module evaluation、tool initialization、file/module hook、official tool API、direct filesystem write を別々に記録する。
4. expected result を先に固定し、実行後の observed result と差分を残す。
5. JSONL の生イベントから JSON 集計と Markdown 比較表を再生成する。
6. dependency acquisition、credential-free build、検証、deploy-without-rebuild をローカルで再現する。
7. artifact tampering により digest/provenance 検証が失敗することを示す。
8. 発表上の各 claim を、sanitized event、hash、集計結果へ追跡できるようにする。

## 完成物

- TypeScript strict mode の `probe-core`
- npm lifecycle、ESLint、Vitest、Vite、codegen CLI の adapter
- scenario manifest を検証して実験を起動する CLI/harness
- disposable container と permissive/constrained profile
- JSONL 生イベント、JSON 集計、Markdown 比較表
- source と artifact の before/after hash
- build-once、verify、deploy-without-rebuild、tamper rejection のデモ
- threat model、experiment protocol、再現手順
- 単体テストと統合テスト
- conference claim と実測証拠を対応付ける evidence map

## 成功条件

以下はfull-labの長期成功条件である。発表MVPのdefinition of doneは
[presentation-scope.md](presentation-scope.md)を正本とする。

- 5つの実行経路を、共通の語彙、イベントスキーマ、測定項目で比較できる。
- phase、trigger type、invocation count、PID/PPID/worker context を観測できる。
- canary environment、canary file、allowlisted write、loopback/Unix socket、固定 child Node.js の各 attempt を個別に記録できる。
- direct filesystem write と official tool API による変更を別イベント、別集計列として扱える。
- permissive と constrained の差を、route の性質と混同せず説明できる。
- expected と observed が別フィールド、別更新経路で管理され、未実行時は「未実測」と表示される。
- raw event から summary、comparison、hash evidence を決定的に再生成できる。
- lifecycle fixture が root workspace とホストから隔離される。
- build artifact は一度だけ生成され、別 deploy simulator が digest と local provenance manifest を検証してから、install/build なしで配置する。
- 改変 artifact が deploy 前に拒否される。
- claim ごとに scenario、run、event/result、制約を evidence map から追跡できる。
- 再現コマンドと実際に観測した結果を、第三者が独立レビューできる。

## 非目標

- 悪性コードを安全に実行できる一般-purpose sandbox の提供
- 実在する malware、未知の dependency、実資格情報を用いた検証
- npm、Node.js、container runtime 自体の脆弱性や container escape の評価
- 実行経路だけから安全性または権限を断定すること
- npm 12 の全 configuration、全 package manager、全 OS の網羅
- ESLint、Vitest、Vite の性能 benchmark や機能比較
- artifact の意味的な無害性の証明
- SLSA または in-toto への準拠表明
- cloud、外部 registry、外部 network service を必要とするprobe/build/verify/deploy実験。
  明示的に承認されたdependency acquisitionまたは通常の文書調査は実験実行と分離する
- Web UI の提供

## TSKaigi Sendai 2026 の20分発表との関係

発表では、経路の列挙だけでなく「いつ、何を契機に、どの権限で実行されたか」を短時間で比較できる証拠を提示する。20分に収めるため、最終的な主張は少数の代表 scenario と build-once demo に絞る。

代表scenarioとclaimは[presentation MVP](presentation-scope.md)で固定する。未選択の
matrix row、M4 high-assurance recovery、full provenance framework、M7相当の全体保証を
完了させるまで発表用Observed取得を待たない。

発表資料の主張は将来作成する `docs/evidence-map.md` を介して sanitized result に結び付ける。expected result や設計上の推測を実測として使用しない。発表用 screenshot や表は、raw event の手編集ではなく report generator の出力を基にする。

## 設計時点の仮定

- 実験は repository checkout と disposable local container だけで完結する。
- 対象 tool version は実装時に lockfile で固定し、本文では推測して固定しない。
- permissive profile もホスト全体には permissive ではなく、実験 manifest の allowlist 内でのみ比較的多くの能力を与える。
- constrained profile の具体的な強制機構は M4 で検証する。manifest 上の `skipped` を OS/container による拒否と同一視しない。
- npm 12 の承認設定と実コマンドは M0 の observed evidence を受けて確定する。
