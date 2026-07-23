# 生成した run output

この directory は、version control 対象外の disposable run output を置く固定 parent である。この README だけを version control する。

M3 synthetic contract run は `results/runs/m3-harness/<run-id>/` を使う。これは collector/reducer verification data であり、adapter measurement、experiment-matrix Observed evidence、profile evidence、presentation evidence ではない。

M3 では `manifest.snapshot.json`、`run-completion.snapshot.json`、`segments/` を immutable regeneration input とする。その他の run file は deterministic derived output である。retry や条件変更には新しい run ID を使い、regeneration で immutable input を書き換えない。

Frozen-research issue #47 の codegen `observe` v3 collector は、後続の別途 review 済み activation だけが `results/runs/m3-codegen/<run-id>/raw/` を作成できる。現在の実装は internal/disposable-test 境界だけであり、実 adapter run を作成または取り込まない。`derived.staging/` は常に non-evidence、成功した final rename 後の exact `derived/` だけが `adapter-run` derived evidence になり得るが、profile、matrix、presentation、runtime enforcement、その他の `Observed` へ自動昇格しない。

M4 では、version control 対象外の profile-control input、host inspection、container 内 evidence、completion、comparison data の保存先として `results/runs/m4-profile-controls/<run-id>/` を予約する。static/unit 実装では Docker を実行しておらず、M4 runtime result も生成していない。

Frozen-research issue #43 は、将来の独立 review 済み一回限りの実行だけに
`results/runs/m2-a/m2a-npm-lifecycle-20260721000000000000000000000001/`
を予約する。現在の M2-A transfer 実装は static/unit 境界だけであり、この
root を作成、列挙、検査せず、runtime candidate や `Observed` evidence を生成
しない。将来の completion/segment/marker copy も fresh result review 前は
candidate に留まり、M0、matrix、profile、presentation evidence へ自動昇格
しない。
