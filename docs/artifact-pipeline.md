# Artifact pipeline

## この文書の責務

この文書は dependency acquisition、credential-free build、artifact identity、local provenance manifest、verify、deploy-without-rebuild の正本である。一般の安全境界は [threat-model.md](threat-model.md)、package/container の配置は [architecture.md](architecture.md) に従う。

## 目的と不変条件

最終 demo は次の不変条件を検証する。

1. Dependency を宣言された入力から取得する。
2. 本番資格情報を持たない isolated build environment で一度だけ build する。
3. Artifact bytes の SHA-256 と生成入力・tool version を記録する。
4. 別の deploy simulator が digest と local provenance manifest を検証する。
5. Deploy 時には dependency install も build も行わず、検証済み artifact を配置する。
6. Artifact bytes を改変すると deploy 前の検証が失敗する。

Digest と provenance は artifact identity と記録された生成過程に関する evidence であり、artifact の意味的な無害性は保証しない。

## Pipeline overview

```text
declared source + lockfile + local dependency input
                    |
                    v
        dependency acquisition stage
                    |
                    v
      credential-free build (exactly once)
                    |
                    +--> build event / tool versions
                    v
       deterministic artifact packaging
                    |
                    +--> SHA-256 digest set
                    +--> local provenance manifest
                    v
        read-only handoff to verifier
                    |
          digest/provenance verify
              | pass        | fail
              v             v
   deploy simulator copy   reject
     (no install/build)
```

各 stage は別の disposable directory/container context を使う。Build workspace を deploy simulator に渡さず、handoff bundle には packaged artifact、digest set、local provenance manifest、必要最小限の verifier input だけを含める。

## Dependency acquisition

- Source revision と lockfile を入力として固定し、lockfile を無視する解決を許可しない。
- 実験は外部 network を使用しない。Dependency bytes は事前に用意された declarative local cache/bundle または digest で固定された container input から取得する。
- Local dependency input が不足している場合は外部 registry へ fallback せず、preflight failure とする。
- Acquisition environment に実 credential、user npm config、home directory、credential helper を渡さない。
- npm lifecycle experiment の instrumented fixture は一般 build dependency と混ぜず、専用 disposable container に隔離する。
- Acquisition の output は build stage 専用であり、deploy stage へ `node_modules` や package manager cache を渡さない。

Local dependency bundle の作成元と配布方法は M-1/M0 で人間がレビューする未解決の運用事項である。外部 network を暗黙に必要とする command はラボの再現 command に含めない。

## Credential-free build

- Build environment へ本番 credential を一切渡さない。
- Environment allowlist は build ID、source revision、reproducibility control、および必要なら使い捨て `PROBE_CANARY_` だけに限定する。
- Source は declared revision/dirty-state policy と一致する read-only input、artifact staging だけを writable とする。
- Build command は manifest で ID と fixed arguments を指定し、arbitrary shell string を受け取らない。
- 一つの pipeline run につき build invocation marker が1回だけであることを event と sentinel で記録する。
- Verify/deploy failure 時に自動 rebuild しない。新しい build は新しい build ID と provenance を必要とする。
- Build 開始前後の source hash と artifact hash を記録する。

「credential-free」は canary の到達実験とは別の production property である。Synthetic canary を渡す scenario は、それが実 credential でないことと logical ID を manifest に明記する。

## Artifact packaging

Artifact set は manifest に列挙した build output だけから作る。Source、lockfile、cache、`node_modules`、raw event、credential file を artifact に混ぜない。

Packaging は以下を固定する。

- relative path の bytewise ordering
- file content digest
- normalized file mode と entry type
- timestamp、owner、group、host absolute path を除去または固定する規則
- symlink の禁止、または明示した安全な link representation

Package file 自体の SHA-256 と、package 内 file ごとの SHA-256 manifest の両方を生成する。Canonicalization rule は schema version を持ち、変更時は過去 digest と互換とみなさない。

## SHA-256 digest

- 表記は `sha256:<lowercase-hex>` に統一する。
- Artifact package、artifact file manifest、provenance manifest 自体を別 entry として扱う。
- Verifier は algorithm 名、hex 長、重複 path、unexpected file、missing file を検査する。
- Digest comparison は timing-safe API が利用可能なら使用するが、local demo の主目的は byte identity である。
- Source/tree hash の規則は [experiment-protocol.md](experiment-protocol.md) と共通化する。

## Source revision と lockfile hash

Local provenance manifest は以下を記録する。

- VCS type と source revision
- clean/dirty state
- dirty build を許す場合の sanitized diff/input tree digest
- repository-relative source tree digest
- 使用した lockfile の relative logical path と SHA-256
- dependency input bundle/container input の digest

Release-like demo は clean revision を既定とし、dirty tree を黙って clean と記録しない。Dirty build を許す開発 scenario は別 ID とし、revision だけで同一 source を表したと主張しない。

## Tool version の記録

推測した version を設計文書に固定しない。Build run では実際に起動した以下を machine-readable に記録する。

- Node.js と npm
- TypeScript と build command provider
- artifact packager、hash/provenance generator、verifier
- build に関与した adapter/tool
- container image/input digest と profile schema revision

Version は command output の unsanitized dump ではなく、tool ごとに定義した structured field へ正規化する。Version を取得できない tool は `unknown` と理由を記録し、推測で補わない。

## Local provenance manifest

現段階では SLSA や in-toto への準拠を仮定しない。完全準拠を確認していないため、成果物は一貫して **local provenance manifest** と呼ぶ。

予定する field は以下である。

- provenance schema version
- build ID、run ID、scenario/profile ID
- source revision、clean/dirty state、source tree digest
- lockfile digest、local dependency input digest
- build command ID と fixed argument set
- Node/tool/container input version/digest
- credential-free environment policy ID
- build start/end timestamp と outcome
- build invocation count
- artifact package digest と file manifest digest
- source/artifact before/after digest
- generator version
- known limitations

Environment の raw value、canary value、host absolute path、user name は含めない。Manifest は canonical JSON rule を持ち、verifier が unknown/duplicate/missing field を扱う policy を version ごとに固定する。

Local provenance manifest はそれ単独では署名済み attestation ではない。Artifact と provenance の両方を攻撃者が差し替えられる channel に対する真正性は保証しない。Demo は build stage から verifier への read-only handoff と、別に保持した expected digest を trust assumption として明記する。

## Verification

Verifier は build workspace と別の clean directory/process で、以下を順に検査する。

1. Provenance schema と expected build ID/source revision を検証する。
2. Lockfile/source/dependency input/tool metadata の必須 field を検証する。
3. Handoff bundle に unexpected file、symlink、path traversal がないことを検証する。
4. Artifact package の SHA-256 を再計算して expected digest と比較する。
5. Artifact を disposable directory へ安全に展開し、file manifest を再計算する。
6. Package digest、file digest、provenance の subject が同じ artifact を指すことを確認する。
7. Build invocation count が1、build outcome が success、credential-free profile であることを確認する。
8. 全検査が成功した場合だけ immutable verification result を生成する。

Schema error、missing evidence、unknown digest algorithm、mismatch は fail closed とする。Verify failure を rebuild で自動回復しない。

## Tamper rejection

Tamper demo は正常な verified bundle の disposable copy だけを対象にし、artifact の1 byte または列挙済み file を意図的に変更する。Verifier が digest mismatch を返し、deploy simulator が開始されないことを確認する。

追加 control として、file の追加、削除、path rename、provenance subject の不一致も個別 scenario にできる。どの tamper を行ったかを expected として事前に宣言し、失敗 message に artifact content や host path を含めない。

Artifact と digest/provenance を同時に一貫して差し替える攻撃は、この unsigned local design の tamper demo 対象外である。

## Deploy simulator

Deploy simulator の input は verified artifact bundle と verification result だけとする。Source、lockfile、package manager cache、build dependency、build command は渡さない。

Deploy operation は、検証済み digest を再確認し、artifact を新しい deployment directory へ copy/extract し、配置後 digest を再計算する。配置物の digest が verified subject と一致した場合だけ success marker を出す。

Simulator は実 service、cloud、external network、credential を利用しない。配置後の application 起動は artifact identity demo と分離し、必要なら別 scenario とする。

## Deploy 時に install/build を行わないことの検査

以下の複数の evidence を組み合わせる。

- deploy input/container に source、lockfile、`node_modules`、package manager、compiler、build script を含めない構成検査
- deploy manifest の operation allowlist を `verify`, `copy/extract`, `post-copy-digest` に限定
- build invocation sentinel が build stage で1から増えないこと
- deploy process event に child install/build invocation がないこと
- artifact digest が build handoff、verify、post-deploy の3地点で一致すること
- deploy directory の file set が artifact manifest と一致すること

「log に build と書かれていない」だけでは negative claim の証拠にしない。実行可能 component の不在、operation allowlist、event/sentinel、digest consistency を併用する。

## 保証するもの

Trust assumption が満たされ verifier が成功した場合、次を確認できる。

- Deploy 対象 bytes が検証した artifact bytes と一致する。
- Manifest に記録された source revision、lockfile、dependency input、tool version、build profile と artifact digest の対応。
- 一つの pipeline run で build marker が一度だけ記録された。
- Deploy simulator が install/build 用 input を受け取らず、検証済み artifact を再利用した。
- 宣言した単純 tampering が digest verification で拒否された。

## 保証しないものと限界

- Artifact の code/content が意味的に無害であること
- Dependency、compiler、build tool、probe、verifier が善性であること
- Provenance field の真実性を第三者署名で証明すること
- Artifact と provenance の同時差し替えに対する真正性
- SLSA/in-toto の level、predicate、attestation format への準拠
- Container escape、OS/runtime vulnerability への耐性
- Source revision に含まれない外部入力が完全に存在しないことの形式証明
- 異なる machine で byte-for-byte reproducible build になること。これは M6 の独立した再現性測定対象である。

## Planned CLI surface

M5 では `lab artifact acquire`, `lab artifact build`, `lab artifact package`, `lab artifact verify`, `lab artifact deploy`, `lab artifact tamper-check` に相当する明示的 subcommand を設計する。正確な executable 名と argument は M-1/M5 で決める。

各 subcommand は前 stage の immutable manifest を input にし、arbitrary shell command や暗黙の install/build fallback を受け付けない。

## 設計時点の仮定と未決事項

- External network を使わず tool dependency を供給する local bundle/container input の作成・更新手順は未決であり、M-1/M0 の human review point とする。
- Provenance の署名、key management、transparency log は今回の local demo の範囲外である。
- Deterministic package format と canonical JSON の詳細は M5 で ADR が必要になりうる。
