# Codex prompts

## 目的

後続 milestone で実際に Codex へ渡す prompt を、実行前の入力として version control する。この directory は実験結果や作業日誌ではなく、task scope と completion contract を保存する場所である。

今回は prompt 本文をまだ作成しない。以下は予定 filename と目的だけを定義する。

## 共通構成

各 prompt は必ず次の見出しをこの順で持つ。

1. `Goal`
2. `Read first`
3. `Scope`
4. `Out of scope`
5. `Constraints`
6. `Deliverables`
7. `Verification`
8. `Completion report`

`Read first` は root `AGENTS.md` と `docs/index.md` を先頭にし、[../docs/codex-workflow.md](../docs/codex-workflow.md) の milestone 表にある関連文書だけを列挙する。`Scope` は変更可能 path、`Out of scope` は隣接 adapter/milestone を明示する。

`Verification` は `docs/milestones.md` と将来の `package.json` に存在する command を正確に引用する。存在しない command を推測しない。`Completion report` は changed files、commands run、observed results、remaining limitations、意図的に未実行の command を要求する。

## Implementation prompt の予定

| Filename | 目的 |
|---|---|
| `m-1-repository-scaffold.md` | Root workspace、strict TypeScript、検証 command の最小 scaffold。Lifecycle experiment は含めない |
| `m0-npm12-install-spike.md` | Disposable container 内だけで npm 12 の unapproved/approved lifecycle control を最小検証する |
| `m1-probe-core.md` | Side-effect-free な probe-core、manifest/event schema、redaction/hash の unit test を実装する |
| `m2-a-npm-lifecycle-adapter.md` | M0 evidence を前提に npm lifecycle adapter を1つだけ実装する |
| `m2-b-eslint-adapter.md` | ESLint の module/init/file/fixer phase と direct/API change を実装する |
| `m2-c-vitest-adapter.md` | Vitest setupFiles の module/setup/worker context を実装する |
| `m2-d-vite-adapter.md` | Vite の module/init/target transform/generateBundle phase を実装する |
| `m2-e-codegen-adapter.md` | 利用者が明示する codegen CLI と generation API を実装する |
| `m3-harness-and-reports.md` | Scenario runner、JSONL canonicalization、JSON/Markdown report を実装する |
| `m4-execution-profiles.md` | Permissive/constrained container profile と enforcement test を実装する |
| `m5-artifact-pipeline.md` | Build-once、local provenance、verify、tamper rejection、deploy simulator を実装する |
| `m6-reproducibility-and-evidence.md` | 反復、sanitized example、evidence map、発表用 data を整備する |
| `m7-independent-review.md` | 実装から独立した read-only safety/validity/reproducibility review を行う |

## Review prompt の予定

Implementation と review は別 session にする。各 implementation prompt に対して、次の file を必要になった時点で作る。

| Filename | 目的 |
|---|---|
| `reviews/m-1-repository-scaffold-review.md` | Workspace isolation、script、strict/test wiring の独立 review |
| `reviews/m0-npm12-install-spike-review.md` | Container 限定実行、条件記録、expected/observed separation の review |
| `reviews/m1-probe-core-review.md` | Import side effect、allowlist、redaction、schema/hash validity の review |
| `reviews/m2-a-npm-lifecycle-adapter-review.md` | M0 evidence と lifecycle adapter boundary の review |
| `reviews/m2-b-eslint-adapter-review.md` | ESLint phase、multi-pass、fixer/direct write distinction の review |
| `reviews/m2-c-vitest-adapter-review.md` | Setup phase、worker evidence、baseline condition の review |
| `reviews/m2-d-vite-adapter-review.md` | Transform/generateBundle と materialization evidence の review |
| `reviews/m2-e-codegen-adapter-review.md` | Explicit trigger、fixed arguments、generator contract の review |
| `reviews/m3-harness-and-reports-review.md` | Event loss、deterministic reduction、incomplete run handling の review |
| `reviews/m4-execution-profiles-review.md` | Host protection と実 enforcement/manifest skip distinction の review |
| `reviews/m5-artifact-pipeline-review.md` | Build-once、trust assumptions、no-rebuild deploy claim の review |
| `reviews/m6-reproducibility-and-evidence-review.md` | Repetition、redaction、claim-to-evidence link の review |

M7 は全体の独立 review 自体であるため、必要な follow-up は finding ごとの新規 prompt に分ける。

## 保存ルール

- Prompt は session 開始前に保存し、実行後の observed result に合わせて本文を変更しない。
- Scope 変更や再実行は suffix を持つ別 file にする。例: `m2-b-eslint-adapter-followup-01.md`。
- Prompt に canary raw value、host absolute path、credential、external URL、arbitrary shell command を含めない。
- Expected result は relevant manifest/matrix を参照し、prompt 内で observed として記載しない。
- Completion output は prompt file に追記せず、commit/diff、verification log、result run ID から追跡する。
