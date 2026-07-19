# Goal

P3のexact one-shot commandが作成したfixed rootをfresh independent
Docker-free read-only reviewし、build-once、empty environment、canonical
receipt、separate verify/copy、one-byte tamper rejection、no-rebuild、required
limitationsを独立照合する。Candidate resultをC-06/C-07のexact local scopeで
acceptまたはrejectする。このreviewではproduction commandを再実行しない。

# Read first

- root `AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/presentation-evidence-inventory.md`
- `docs/product-requirements.md`
- `docs/milestones.md`のPresentation MVP / P3 section
- `docs/codex-workflow.md`
- `docs/artifact-pipeline.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/p3-artifact-demo.md`
- `docs/reviews/p3-artifact-demo.md`
- `prompts/p3-artifact-demo.md`
- `prompts/reviews/p3-artifact-demo-review.md`
- このprompt

# Scope

- Exact fixed root
  `results/runs/p3-artifact-demo/artifact-mvp-build-once-20260719-01`内の
  known fixed pathsだけをread-only reviewする。Parentや他のignored/retained
  resultをenumerateしない。
- Recorded eleven source/input hashes、five compiled hashes、argument-free
  package script、fixed build/run/command/source/lockfile/artifact identityを再照合する。
- `build/invocation-1.json`、handoff artifact/receipt、verification copy、
  deployment copy、tamper copy、`result.json`のregular non-symlink、size、canonical
  bytes、SHA-256、cross-bindingを独立確認する。
- Candidate identities `e3a5bc08...` artifact、`0cbc174b...` receipt、
  `011a0ce1...` result、`4ce1dd95...` invocation marker、`68b5544e...`
  tamper copyを実bytesから完全長で再計算する。
- Handoff/verification/deployment artifact equality、handoff/verification receipt
  equality、tamper copyのexact one-byte difference、`tamper-deployment/` absenceを
  確認する。
- Canonical receiptをreviewed parserでparseし、source dirty-tree/source/lockfile/
  artifact digest、actual Node/builder versions、command ID、invocation count `1`、
  forwarded environment count `0`、network policy、三つのlimitationを照合する。
- Canonical resultをstrictに照合し、verify `digest`、deploy
  `copy`/`post-copy-digest`、deploy build count `0`、tamper
  `P3_ARTIFACT_DIGEST_MISMATCH` / `rejected-before-copy`を確認する。
- Execution recordのexact command 1回、exit 0、no retry、bounded output dispositionと
  fixed-root transitionがcandidate bytesと矛盾しないかreviewする。
- ACCEPTEDまたはREJECTED decision、finding、exact evidence scope、remaining
  limitations、next taskを記録する。

# Out of scope

- `npm run p3:execute`、production rootへのwrite/repair/permission変更、retry、別build ID
- Candidate implementationやresult bytesの修正、finding remediation
- Docker/container/runtime socket、probe/lifecycle、external network、dependency acquisition
- P2/M4、generic M5 provenance、experiment-matrix、publication、external deploy、remote Git
- P4 evidence map/talk table自体の実装

# Constraints

- Resultやexecution recordから値をcopyするだけでacceptせず、fixed bytes、canonical
  parsing、digest/copy/tamper relationsを独立再計算する。
- Exact known pathsだけをreadし、raw host path、credential、environment valueをreportへ
  保存しない。Production rootはread-onlyのまま保持する。
- `npm run p3:verify`のrepository-local disposable fake buildをproduction build countや
  presentation Observedへ加算しない。
- Empty child environmentとnetwork API absenceをOS-level egress enforcementへ昇格しない。
- Unsigned local receiptはartifact/receipt同時差替えへのauthenticityやsemantic
  harmlessnessを保証しないlimitationを維持する。
- One-shot gateは既に消費済みである。Nonconforming resultでもretry/repairせず、
  REJECTEDとbounded follow-upを記録する。
- ACCEPTEDの場合もexact one-local-run scopeだけとし、cross-machine reproducibility、
  SLSA/in-toto、general sandbox claimへ拡張しない。

# Deliverables

- `docs/reviews/p3-artifact-demo-result.md`にdecision、findings、recomputed identities、
  canonical/cross-copy/tamper assessment、execution-record assessment、limitationsを記録する。
- Authoritative P3 status/handoffをreview-owned最小更新する。
- ACCEPTED時はP4 evidence map/talk-table implementationを一つのnext taskにする。
- REJECTED時はresultを変更/再実行しない一つのbounded follow-upをnextにする。

# Verification

```sh
npm run p3:verify
npm run check
git diff --check
git status --short
```

加えてcandidate/source/compiled/result SHA-256、known exact-path state、canonical
receipt/result、copy equality、exact one-byte difference、tamper deployment absenceを
read-onlyで独立確認する。`npm run p3:execute`、Docker、network、dependency acquisitionは
実行しない。

# Completion report

- ACCEPTED/REJECTED decision、findings、accepted scope、remaining limitations
- Commands run、exit status、focused/full test counts、recomputed hashes/path observations
- Production commandを再実行せず、result rootを変更していないこと
- Docker/network/credentials/dependency acquisitionを使用していないこと
- Changed files
- Decisionに対応する一つのconcrete next task
