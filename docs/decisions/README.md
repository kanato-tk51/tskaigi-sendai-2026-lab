# Architecture Decision Records

## 目的

ADR は、後続の実装や複数 package/milestone に長期間影響し、後から理由を再確認する必要がある設計判断を記録する。例として、event canonicalization、workspace isolation、artifact package format、local provenance trust model がある。

ADR は以下には使わない。

- 単なる作業日誌、TODO、進捗報告
- experiment の expected/observed result
- run log、benchmark 値、temporary debugging note
- 1つの小さな implementation detail で容易に変更できるもの
- 発表 claim と evidence の対応表

実測結果は `results/runs` と集計 report、claim 対応は将来の `docs/evidence-map.md` を正本とする。

## ファイル名規則

```text
NNNN-short-kebab-case-title.md
```

- `NNNN` は `0001` から始まる4桁の連番とする。
- 番号は再利用しない。Rejected/Superseded でも file を削除しない。
- Title は判断内容を表す短い英小文字 kebab-case とする。
- 1 file は1つの判断だけを扱う。
- ADR への link は repository-relative path を使う。

例: `0001-isolate-install-lifecycle-workspace.md`

## Status

Status は次のいずれかとする。

- `Proposed`
- `Accepted`
- `Rejected`
- `Deprecated`
- `Superseded by ADR-NNNN`

Proposed ADR は実装前に review する。Supersede する場合は新旧双方から link し、過去の文脈を失わない。

## Template

```markdown
# ADR-NNNN: Title

- Status: Proposed
- Date: YYYY-MM-DD
- Deciders: names or roles
- Related: links to requirements, issues, or prior ADRs

## Context

What durable problem or constraint requires a decision? Separate known facts,
expected hypotheses, and observed evidence.

## Decision

State the chosen design precisely, including its boundary and when it applies.

## Consequences

List positive, negative, operational, safety, and migration consequences.

## Alternatives considered

Describe credible alternatives and why they were not selected.

## Validation

Describe how the decision will be checked. Link observed evidence only after it
exists; do not turn expected behavior into a result.

## Follow-up

List separately scoped work or a review date, if any.
```

## 運用

1. 長期的判断かを確認し、作業記録なら ADR を作らない。
2. 次の未使用番号で `Proposed` を作る。
3. Relevant source-of-truth document と影響 package を link する。
4. Safety/operational consequence と alternatives を human review する。
5. 承認後に `Accepted` とし、その判断を使う実装 task を開始する。
6. 後続 experiment の observed result は ADR 本文へ転記せず evidence へ link する。

Expected hypothesis に反する observed evidence が出ても、過去 ADR を書き換えて整合させない。判断を変更するなら新しい ADR で supersede する。
