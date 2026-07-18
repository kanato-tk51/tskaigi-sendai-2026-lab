# ADR-0001: profile control と route evidence を分離する

- Status: Accepted
- 日付: 2026-07-17
- 決定者: プロジェクトの human reviewer
- 関連文書: [M4 execution profiles](../m4-execution-profiles.md)、[Threat model](../threat-model.md)、[Experiment matrix](../experiment-matrix.md)

## 背景

M4 では、permissive と constrained の execution boundary が、宣言した canary capability を実際に expose または deny することを示す必要がある。既存の M2 adapter run が検証するのは local host 上の adapter contract であり、profile enforcement evidence や experiment-matrix の Observed result ではない。M4 を adapter run から始めると、adapter、container、profile、collector、route evidence boundary が同時に変わるため、denial の原因を特定しにくくなる。

container configuration だけでも不十分である。宣言された read-only mount、environment variable の欠落、network mode、child restriction は、host 側 inspection と container 内 control の両方で観測するまでは Expected policy にとどまる。manifest で無効にした operation は `skipped` であり、試行した operation を runtime が deny した evidence ではない。

## 決定

M4 では最初に、repository-owned で無害な専用 profile-control fixture を `m4-profile-control-p` と `m4-profile-control-c` の 2 ID で使用する。この fixture は dependency-route measurement ではなく、M1 route invocation claim を出力しない。独立して version 管理する manifest/evidence contract を持ち、execution boundary だけをテストする。

両 control は、同一の immutable container image digest、Node.js version、fixture bytes、control code、timeout、resource limit を使用する。profile 定義で差を許すのは、レビュー済みの environment、mount/write、loopback-service、child-execution policy だけである。両方とも、non-root、read-only root filesystem、capability drop、no-new-privileges、external network なし、host home/credential mount なし、container 内 runtime socket なし、という外側の安全境界を維持する。

承認済み host orchestrator が呼び出せるのは、固定 Docker CLI operation set だけである。起動前に厳密な create configuration を検証し、任意の image、command、argument、mount、environment、path input を受け付けない。runtime evidence は、上限付き canonical control output と host 側 inspection の組み合わせで構成する。片方だけでは不十分である。

profile-control gate が independent review で承認された後も、adapter/profile run は別タスクとして扱う。control result を adapter Observed result や presentation claim に昇格させない。

## 結果

- adapter behavior を導入する前に runtime enforcement failure の原因を特定できる。
- profile control 専用の schema、validator、fixture、container input、evidence record が必要になる。
- M4 は route 固有の Observed measurement をすぐには生成しない。
- same-image 要件により、image drift が profile 差に見えることを防げる。
- 承認済み host orchestrator とローカルで利用可能な pinned image input がそろわない限り、実際の container 実行は blocked のままとなる。
- child denial では具体的な runtime mechanism を特定して検証する必要があり、manifest skip では claim を満たせない。

## 検討した代替案

- **最初の adapter run を profile test にする。** adapter と profile の failure が結合し、既存 M2 local result は container evidence ではないため不採用とした。
- **permissive と constrained で別 image を使う。** image-content drift が uncontrolled variable になるため不採用とした。
- **profile manifest または container inspection を enforcement evidence とみなす。** configuration intent だけでは試行 outcome を証明できないため不採用とした。
- **constrained attempt を manifest で無効にする。** 明示的に表示する fallback limitation としてだけ残した。runtime-denial claim の根拠にはできない。

## 検証

M4 実装は schema/static/unit test と approved-host integration run に合格しなければならない。integration gate は、Expected value を編集せず、canonical host inspection と container 内 control evidence を事前レビュー済み Expected 表と比較する。control の欠落、schema error、不完全な transfer、profile mismatch、unexpected success、enforcement unavailable が 1 つでもあれば、run は承認せず inconclusive または mismatched とする。

## フォローアップ

- independent review は blocking finding なしで完了し、プロジェクトの human reviewer が 2026-07-17 にこの ADR と M4 Expected 契約を明示的に承認した。
- M4 は承認済み `prompts/m4-execution-profiles.md` の scope 内だけで実装し、container 実行は明示的な承認が必要な別 step とする。
- profile-control 実装が independent review に合格した後にのみ adapter/profile measurement task を選定する。
