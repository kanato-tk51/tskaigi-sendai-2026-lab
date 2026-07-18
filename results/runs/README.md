# 生成した run output

この directory は、version control 対象外の disposable run output を置く固定 parent である。この README だけを version control する。

M3 synthetic contract run は `results/runs/m3-harness/<run-id>/` を使う。これは collector/reducer verification data であり、adapter measurement、experiment-matrix Observed evidence、profile evidence、presentation evidence ではない。

M3 では `manifest.snapshot.json`、`run-completion.snapshot.json`、`segments/` を immutable regeneration input とする。その他の run file は deterministic derived output である。retry や条件変更には新しい run ID を使い、regeneration で immutable input を書き換えない。

M4 では、version control 対象外の profile-control input、host inspection、container 内 evidence、completion、comparison data の保存先として `results/runs/m4-profile-controls/<run-id>/` を予約する。static/unit 実装では Docker を実行しておらず、M4 runtime result も生成していない。
