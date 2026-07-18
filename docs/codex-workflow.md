# Codex workflow

## この文書の責務

この文書は、後続 Codex session の分割、読ませる文書、変更可能範囲、human review、prompt 保存方法の正本である。各 milestone の Goal/acceptance/verification command は [milestones.md](milestones.md) を正本とし、ここでは順序と作業境界だけを定める。

## 基本ルール

- 1つの Codex task は原則1 milestone、M2 は1 adapter に限定する。
- 新しい milestone/adapter は新しい Codex session で開始する。
- 実装 session と独立 review session を分ける。
- 毎回 root `AGENTS.md` を最初に全文読み、その後 [index.md](index.md) の router に従って必要文書だけを読む。
- 変更開始前に `git status --short` と対象 path を確認し、既存の user change を保護する。
- `docs/milestones.md` に該当 milestone の acceptance criteria と verification command がない場合、実装を推測で始めず、先に人間が milestone 定義を承認する。
- Command を実行した事実と output を completion report に残し、未実行 command を passed と表現しない。
- Expected と Observed を同じ file/field/commit step で更新しない。

## Source of truth

| 関心事 | 正本 |
|---|---|
| Product scope、成功条件、非目標 | `docs/product-requirements.md` |
| Active presentation claims、selected scenarios、delivery sequence | `docs/presentation-scope.md` |
| 許可/禁止 access、canary、trust boundary | `docs/threat-model.md` |
| Manifest、event、outcome、hash、redaction | `docs/experiment-protocol.md` |
| Package、dependency direction、data flow、container isolation | `docs/architecture.md` |
| Scenario ID、expected result、observed/evidence 欄 | `docs/experiment-matrix.md` |
| Build-once、digest、provenance、verify/deploy | `docs/artifact-pipeline.md` |
| Milestone scope、acceptance、verification command | `docs/milestones.md` |
| Codex session の進め方 | この文書 |
| 長期的な設計判断 | `docs/decisions/*.md` |
| 発表 claim と sanitized observed evidence | 将来の `docs/evidence-map.md` |
| 実際に使用した task prompt | `prompts/` |

同じ詳細を複数文書へコピーせず、参照 link を置く。矛盾を発見した場合、該当する正本だけを変更する task を分ける。

## 実行順序

現在のactive delivery sequenceは次である。

```text
P0 presentation scope/workflow pivot
  -> P1 existing-evidence inventory and gap classification
  -> P2 selected Vite/codegen permissive/constrained observations
  -> P3 minimal build-once/verify/copy/tamper demo
  -> P4 evidence map, compact talk tables, focused final review
```

以下はfull-lab research trackのhistorical sequenceであり、既存実装と将来再開時の依存関係を
記録する。M4 recovery以降は凍結され、明示的にresearch trackを再開しない限りnext taskに
選ばない。

```text
M-1 repository scaffold
  -> M0 npm 12 install lifecycle minimal spike
  -> M1 probe-core + event schema
  -> M1 independent review gate
  -> one approved M2 adapter task at a time:
       M2-A npm lifecycle adapter
       M2-B ESLint adapter
       M2-C Vitest adapter
       M2-D Vite adapter
       M2-E codegen CLI adapter
  -> M3 harness + reports
  -> M4 permissive/constrained profiles
  -> M5 build-once/verify/deploy simulator
  -> M6 reproducibility/evidence/presentation data
  -> M7 independent safety/validity review
```

M0 は共通 framework の全体実装より先に実施し、npm 12 の version/config/approval state と observed behavior を小さく確定する。M2 の adapter は並行実装せず1つずつreview/mergeする。M2-Aのcontainer producer-segment回収境界が未承認、または`docker cp` tmpfs制約が未解決ならM2-Aをblocked/Inconclusiveとし、M1 gateと各adapter prerequisiteを満たすM2-B〜Eのいずれかを先に選べる。順序変更を理由に複数adapterを同一taskへ含めない。

Presentation MVPでは既存M2 adapterを作り直さず、P1で利用可能なevidence classを先に棚卸しする。P2は選定したVite/codegen pairだけ、P3は最小artifact demoだけを扱う。M4 profile-control/recovery、全matrix row、汎用artifact/provenance frameworkを先に完成させない。

## Milestone ごとの読書範囲と変更境界

以下の「変更可能範囲」は初期 allowlist である。共有 schema 変更が必要になった場合、同じ task に無断で広げず、影響を説明して human review を受ける。

| Milestone | Read first（`AGENTS.md`, `index.md`, `milestones.md` に追加） | 主な変更可能範囲 | Human review point |
|---|---|---|---|
| P0-P4 presentation MVP | `presentation-scope.md`, `product-requirements.md`; taskに応じて`experiment-matrix.md`, `artifact-pipeline.md`, `threat-model.md` | evidence inventory、selected fixed runner/scenarios、minimal artifact demo、sanitized examples、`docs/evidence-map.md` | claim数とscenario選定、evidence class、selected runtime safety、artifact limitation、20分の情報量 |
| M-1 | `product-requirements.md`, `architecture.md`, `threat-model.md` | root scaffold、strict TS 設定、workspace allowlist、test/lint/typecheck wiring。`experiments/**` は workspace 外 | root script に lifecycle side effect がないこと、version/lock policy、external network 不要の dependency input 方針 |
| M0 | `threat-model.md`, `experiment-protocol.md`, `experiment-matrix.md`, `architecture.md` | `experiments/npm12-install/**` と専用 disposable container definition、sanitized spike evidence | host/root install が不可能な隔離、npm/Node/config の実測記録、unapproved/approved control の妥当性 |
| M1 | `threat-model.md`, `experiment-protocol.md`, `architecture.md` | `packages/probe-core/**`、event/manifest schema tests。必要最小限の共有 config | import side effect がないこと、path/env/network/child allowlist、redaction、sequence/hash semantics |
| M2-A | `threat-model.md`, `experiment-protocol.md`, `experiment-matrix.md`, `architecture.md` | npm lifecycle adapter とその fixture/test。lifecycle 実行は専用 container 内のみ | M0 evidence と adapter expectation の一致、root workspace 隔離 |
| M2-B | `threat-model.md`, `experiment-protocol.md`, `experiment-matrix.md`, `architecture.md` | `packages/eslint-plugin-probe/**` と ESLint fixture/test | module/init/file/fixer の区別、multi-pass、direct write と fixer return の分離 |
| M2-C | 同上 | `packages/vitest-setup-probe/**` と Vitest fixture/test | module/setup の区別、worker ID の根拠、single-worker baseline |
| M2-D | 同上 | `packages/vite-plugin-probe/**` と Vite fixture/test | module/init/target transform/generateBundle の区別、API return と artifact materialization |
| M2-E | 同上 | `packages/codegen-probe/**` と codegen fixture/test | explicit CLI と自動起動を混同しないこと、fixed arguments、generator API contract |
| M3 | `experiment-protocol.md`, `experiment-matrix.md`, `architecture.md` | `packages/lab-cli/**`, `scenarios/**`, result schema/report tests | raw JSONL 不変性、deterministic aggregation、missing/timeout を0回にしないこと |
| M4 | `m4-execution-profiles.md`, `threat-model.md`, `architecture.md`, `experiment-matrix.md` | `profiles/**`, `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, profile control/integration tests | mount/env/network/child enforcement の実証、manifest skip との区別、host exposure がないこと |
| M5 | `artifact-pipeline.md`, `threat-model.md`, `architecture.md` | artifact pipeline module、deploy simulator、専用 scenario/test | build exactly once、credential-free、unsigned provenance の限界、deploy に build input がないこと |
| M6 | `product-requirements.md`, `experiment-protocol.md`, `experiment-matrix.md`, `artifact-pipeline.md` | reproducibility scripts、sanitized `results/examples/**`、`docs/evidence-map.md`、再現手順 | claim が observed evidence を指すこと、全分母/失敗/制約、redaction、20分発表への絞り込み |
| M7 | 全設計正本、ADR、sanitized result、verification log | 原則 read-only review。修正は finding ごとの follow-up task | safety boundary、validity、再現性、claim の独立評価。実装者と別 session/context |

M2 の各 task で `probe-core` contract の変更が必要なら、adapter 固有 code と混ぜて大きく変更しない。互換性のある最小変更と contract test に限定するか、M1 follow-up を先に作る。

## 各 session の標準手順

1. Root `AGENTS.md` を全文読む。
2. `docs/index.md` と上表の `Read first` だけを読む。
3. `git status --short`、対象 file、前 milestone の acceptance/evidence を確認する。
4. Prompt の Goal、Scope、Out of scope、Constraints を再掲して作業範囲を固定する。
5. Expected result を変更する場合は experiment 前の独立 commit/review step にする。
6. 最小の coherent change と relevant test を実装する。
7. `docs/milestones.md` と `package.json` に記載された command だけを、対象範囲に応じて実行する。
8. Observed result は raw event から生成し、期待との mismatch を保持する。
9. Completion report に changed files、commands、observed results、limitations を記載する。
10. 別 session で diff と evidence を独立 review する。

## Human review の gate

次へ進む前に、少なくとも以下を人間が確認する。

- **M-1 gate**: workspace allowlist が lifecycle experiment を除外し、strict/test commands が明示されている。
- **M0 gate**: instrumented install が container 外で一度も実行されておらず、npm 12 の条件と observed event が保存されている。
- **M1 gate**: schema、redaction、path canonicalization、child target、loopback validation が negative test を含む。
- **各 M2 gate**: phase/trigger/count と direct/API distinction が tool 固有 API に照らして正しい。
- **M3 gate**: raw-to-summary の再生成と、invalid/incomplete run の扱いが決定的である。
- **M4 gate**: profile の claimed denial が実 enforcement evidence を持ち、host resource が mount/forward されていない。
- **M5 gate**: verifier/deploy の trust assumptions と「意味的無害性を保証しない」限界が demo/report に表示される。
- **M6 gate**: 発表 claim が expected ではなく sanitized observed evidence を参照する。
- **M7 gate**: unresolved high-severity finding が claim に反映され、必要なら release/presentation を止める。
- **P1 gate**: 既存evidenceをObservedへ誤昇格せず、claimごとの最小gapが特定されている。
- **P2 gate**: selected pairがsame-image/fixed-commandで実行され、設定意図ではなくattempt outcomeを保持する。
- **P3 gate**: build count、digest、no-rebuild copy、tamper rejectionと意味的無害性を保証しない限界が観測される。
- **P4 gate**: C-01〜C-07がsanitized observed evidenceまたは明示的limitationへ結び付き、20分の表が3枚以内である。

## 新しい Codex session を使うタイミング

- milestone を切り替えるとき
- M2 で adapter を切り替えるとき
- 実装を終え、独立 review を始めるとき
- threat model、event schema、workspace boundary、provenance format の長期的判断を見直すとき
- 既存 task の scope を越える finding を修正するとき

同じ session で複数 adapter を「ついでに」変更しない。Review session には実装時の意図より、approved docs、diff、test output、raw/sanitized evidence を優先して渡す。

## 実装と独立 review の分離

Implementation prompt は deliverable の作成と verification までを担当する。Review prompt は原則 read-only で、次を確認する。

- 設計正本との一致
- safety allowlist の bypass、import-time side effect、arbitrary command/path/network の有無
- Expected/Observed の混同
- event loss、count、worker、timeout、hash の validity
- test が acceptance criteria を直接観測しているか
- report/claim が limitation を落としていないか

Finding の修正は review session 内で黙って行わず、小さな follow-up task として scope、acceptance、verification を定義する。

## Prompt を `prompts/` に保存する運用

- 実際に session へ渡す prompt を、実行前に milestone 名の file へ保存する。
- 共通構造と予定 filename は [../prompts/README.md](../prompts/README.md) に従う。
- Prompt には exact Goal、Read first、path scope、Out of scope、安全制約、deliverable、verification、completion report を含める。
- 実行後に prompt 本文を observed result に合わせて書き換えない。補足が必要なら別 follow-up prompt を作る。
- Review prompt は implementation prompt と別 file、別 session にする。
- Prompt に canary raw value、host absolute path、credential、external URL を記載しない。

## Expected と Observed を混ぜない運用

```text
before run: scenario manifest + matrix expected hypothesis
                       |
                       v
run: immutable manifest snapshot + raw events
                       |
                       v
after run: generated observed summary + expected/observed diff
```

- Expected file は experiment 開始後に自動更新しない。
- Observed の source of truth は `events.jsonl` であり、口頭説明や Markdown 手入力ではない。
- 未実行は「未実測」、event 不完全は `inconclusive`、attempt 拒否は `failure`/`skipped` として区別する。
- Expectation mismatch を理由に fixture、timeout、profile を同じ run ID のまま変更しない。
- Condition を修正した再実行は新しい run ID、必要なら新しい scenario revision を持つ。
- Evidence map は sanitized observed run だけを claim の根拠にし、expected は背景仮説としてだけ link する。

## Completion report の最小項目

- Changed files
- 実装/設計した内容と scope 外に残した内容
- 実行した command と observed output/exit status
- 実行しなかった relevant command と理由
- Acceptance criteria ごとの evidence
- Expected/Observed mismatch
- Safety limitation、未解決事項、次の小さな task

Passed と記載できるのは実行した check だけである。外部 network、実 credential、host home、Docker socket、lifecycle の host 実行がなかったことも明記する。
