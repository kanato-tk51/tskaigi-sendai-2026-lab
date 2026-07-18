# Goal

M3 independent reviewのB-01〜B-05を、adapter/profile/M4へscopeを広げずremediateし、永続化されたimmutable inputからderived outputをbyte-for-byte再生成できるversioned harness/report contractを実装する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM3定義
- `docs/codex-workflow.md`
- `docs/experiment-protocol.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/reviews/m3-harness-and-reports.md`
- `prompts/m3-harness-and-reports.md`

# Scope

- `packages/lab-cli/**`
- `scenarios/m3-synthetic-collector.json`
- M3 contractとstatusに必要な最小documentation差分
- B-01: versioned completion snapshot、raw byte segment persistence、fail-closed directory reader/regenerator、exact-byte regeneration test
- B-02: manifest-contextのbefore/after file hash pairing、source/artifact hash delta、tool API hashとの分離
- B-03: attempt outcome、tool-change outcome、hash stateを含むversioned Expected/Observed comparison
- B-04: Proxy、全own key/descriptor、non-enumerable unknown/accessorを拒否するplain-data validation
- B-05: sanitized tool/Node/profile/container/retention contextを持つversioned run metadata

# Approved remediation contract

- Raw run inputは`manifest.snapshot.json`、新規`run-completion.snapshot.json`、`segments/<producer-id>.jsonl`である。Completion snapshotはderived metadataではなくimmutable collector inputとする。
- Segment API/inputはbyte sequenceとしてcopyし、fatal UTF-8 decodeとcanonical byte comparisonを行う。Collector/reducerは入力bytesを変更しない。
- Regeneratorはowned run rootとvalidated run IDだけを扱い、input inventory、regular-file、symlink、size、schemaをfail closedに検証する。CLIへarbitrary path/command/module optionを追加しない。
- Scenario definition/snapshot、run metadata、summary、hash evidenceはbreaking field changeに合わせてversionを上げる。Canonical event envelopeと`probe-event/v2`は変更しない。
- Expectedはevent kind/route phaseに加えattempt type/outcome、tool change kind/outcome、hash delta state/countを宣言する。Expected/Observedのunionを比較し、unexpected observed dimensionもmismatchにする。
- File hash deltaはvalidated manifestのproducer/target/classification/hash positionでpairingし、`changed`、`unchanged`、`unavailable`を区別する。Duplicate/conflicting evidenceはfail closedにする。Tool API changeは別evidence kindのまま保持する。
- Synthetic fixtureではprofile revisionとcontainer inputを明示的`not-applicable`にし、tool/Node versionsはvalidated manifest/eventからprojectしてproducer consistencyを確認する。

# Out of scope

- M2 adapter source、adapter local runner contract、`probe-event/v2`の変更
- adapter output ingestion、permissive/constrained profile execution、M4 enforcement
- experiment-matrix Observed、`results/examples/**`、presentation evidenceの生成または更新
- artifact pipeline、container lifecycle、external network、real credential、Docker socket
- CLIのarbitrary command、argv、cwd、module path、output path escape hatch
- independent review gateの自己承認

# Constraints

- TypeScript strict modeとimport safetyを維持する
- Raw segment、completion input、ExpectedをObservedに合わせて補正しない
- Missing/invalid/incomplete inputを0 invocationまたはcomplete successにしない
- Derived outputへraw path、canary、content、diff、raw error/stack、stdout/stderr、executable、loopback bodyを保存しない
- Existing user changesを保護し、B-01〜B-05に必要な最小coherent changeとtestsに限定する
- Implementation完了後もM3 statusはindependent re-review pendingとし、このsessionでgate approveしない

# Deliverables

- versioned raw input inventoryとcompletion snapshot
- raw-byte collector input、owned-directory loader/regenerator、exact regeneration integration test
- hash delta reducer/evidenceとcomplete Expected comparison
- hardened plain-data validationとnegative tests
- complete runtime-context run metadata
- updated fixed synthetic scenario、schema tests、M3 static verifier、directly relevant documentation/status

# Verification

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

# Completion report

- Changed files
- B-01〜B-05ごとのremediation evidence
- Commands、exit status、observed test count/result
- 実行しなかったrelevant commandと理由
- Remaining limitationsとindependent re-review boundary
- Expected/Observedとexperiment-matrix Observedを変更していないこと
- External network、real credential、Docker socket、host lifecycle executionを使用していないこと
