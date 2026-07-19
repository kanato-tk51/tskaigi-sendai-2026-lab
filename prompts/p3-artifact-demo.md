# Goal

P2で閉じたprofile evidence boundaryを変更せず、C-06/C-07に必要な固定source 1件の
build-once、canonical receipt、別directory verify/copy、one-byte tamper rejectionを
Docker-freeで実装する。Exact one-build production commandはreview-readyにするが、このtaskでは
実行せずruntime artifact evidenceを作らない。

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
- このprompt

# Scope

- `packages/lab-cli`内に、import-safeなP3 contract/build/verify/copy/tamper moduleとfixed entriesを追加する。
- 固定sourceはrepository-owned `packages/lab-cli/fixture/artifact-demo/source.txt` 1件、lockfileは
  root `package-lock.json`とする。
- Build ID `artifact-mvp-build-once-20260719-01`、command ID
  `artifact-mvp-build-once`、fixed result root、argument-free root scriptを固定する。
- Parentはfixed childを`process.execPath`、fixed entry、no arguments、empty environment、bounded
  timeout/outputで一度だけ起動する。Caller-selected path/command/argument/environmentを追加しない。
- Build invocation markerをinput readより前にexclusive createし、再build/retryをfail closedにする。
- Canonical receiptへsource dirty-tree digest、lockfile digest、actual Node/builder versions、command ID、
  invocation count 1、artifact SHA-256、fixed limitationsを記録する。
- Verifyは別directoryでreceipt/digestをfail closedに確認し、成功後だけcopy/post-copy digestを行う。
- Disposable tamper copyのexact one byteを変更し、copy/deploy開始前のdigest rejectionを要求する。
- Focused testsはrepository-local disposable rootsとin-process fake build invocationを用い、production
  fixed result rootやone-shot commandを使用しない。
- Exact contract、status、next independent review handoffを文書化する。

# Out of scope

- `npm run p3:execute`、production artifact/result rootの作成、runtime Observed取得
- Docker、container runtime/socket、probe/lifecycle execution、external network、dependency acquisition
- Arbitrary source/path/command/argument/environment、generic provenance/package/archive CLI
- Signatures、SLSA/in-toto、transparency log、semantic harmlessness claim、OS-level egress enforcement claim
- P2 retry/recovery、M4 retained state、experiment-matrix、P4 evidence map、publication、remote deploy
- Existing P0-P2 user changesの整理、commit、remote Git

# Constraints

- Source、lockfile、outputはrepository内のfixed pathだけとし、regular non-symlink、size、opened identityを
  bounded checkする。
- Build childへhost environmentをforwardせず、real credentialやhome/configをread/enumerateしない。
- Build/verify/deployにnetwork API、install、rebuild、shell commandを追加しない。
- Digest/local receiptはbyte identityと記録入力だけを示し、semantic harmlessnessやauthenticityを
  保証しない限界をreceipt/resultに必ず残す。
- Static/unit test buildをpresentation Observedまたはproduction build countに昇格しない。
- Production rootが存在する場合はfail closedとし、このtaskでも後続runtimeでもretry/repairしない。
- Existing dirty working treeを保護し、P3以外の変更をrevertしない。

# Deliverables

- P3 fixed source、strict TypeScript implementation、fixed build/parent entries
- Canonical receipt/result contractとbuild-once/verify/copy/tamper behavior
- Focused positive/negative/static testsとroot scripts
- `docs/p3-artifact-demo.md`、documentation routing、authoritative P3 status/handoff update
- Fresh independent Docker-free execution-gate review用prompt

# Verification

```sh
npm run p3:verify
npm run check
git diff --check
git status --short
```

`npm run p3:execute`、Docker/container command、network/dependency acquisitionは実行しない。

# Completion report

- Changed files
- Commands run、exit status、focused/full test counts
- Static/unit evidenceとruntime未実測の区別
- Intentionally unrun production commandとfixed root state
- Remaining limitationsとfresh independent reviewという一つのnext task
