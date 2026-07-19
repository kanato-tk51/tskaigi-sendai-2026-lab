# Goal

P3 fixed artifact-demo candidateをfresh independent Docker-free read-only reviewし、build-once、empty
environment、canonical receipt、separate verify/copy、one-byte rejection、no-rebuild、limitationsを独立照合する。
Exact production commandの一回限定execution gateをapproveまたはblockする。このreviewでは
`npm run p3:execute`を実行しない。

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
- `prompts/p3-artifact-demo.md`
- このprompt

# Scope

- P3 source/contract/runner/process/entry/test/fixture/root-script diffのindependent read-only review
- Fixed build/run/command IDs、source、lockfile、artifact logical path、result rootのcross-binding
- No-argument parentとfixed child、`process.execPath`、empty environment、timeout/output bound、no retry
- Invocation markerがinput access前に一度だけ作られ、failureでもretryしないstate machine
- Regular non-symlink/size/identity input checks、repository-owned output containment
- Receipt canonicalization、unknown/mismatch rejection、source/lock/artifact digests、actual tool versions、count 1
- Separate-directory verification、verified-only copy、post-copy digest、verify/deploy build count 0
- Exact one-byte mutation、digest mismatch、tamper deployment non-start
- Network/credential/install/build API absenceと、OS-level enforcementをclaimしないlimitation
- Production fixed result rootのexact absenceを親directory enumerationなしで確認
- Candidate hashes、verification、gate decision、findings、next taskのreview record

# Out of scope

- Candidate implementation/finding修正
- `npm run p3:execute`、production root作成、runtime evidence、Observed promotion
- Docker/container/runtime socket、probe/lifecycle、external network、dependency acquisition
- P2/M4、generic M5 provenance、P4 evidence map、publication、deployment、remote Git、third-party communication

# Constraints

- Implementation resultからhash/test outcomeをcopyするだけでapproveせず、candidate bytesとtestsを再実行する。
- Focused testのtemporary buildをproduction build count/Observedとして扱わない。
- Exact fixed result rootだけをabsence-checkし、ignored/retained resultsをenumerateしない。
- Static code absenceをOS-level offline enforcementへ過剰昇格しない。Receipt/resultのnetwork/authenticity/
  harmlessness limitationが保持されることを要求する。
- Findingはreview内で修正せず、blockingなら一つのbounded remediationへhandoffする。
- Approveする場合、standing authorizationのexact actionはargument-free `npm run p3:execute`一回だけとし、
  nonzero/partial/inconclusiveでもretryしないことを記録する。
- Successful candidateでもfresh Docker-free receipt/result review前にC-06/C-07 evidenceへ昇格しない。

# Deliverables

- APPROVEDまたはBLOCKED decision、findings、candidate hashes、fixed-root absence evidence
- Build-once/empty-env/receipt/verify-copy/tamper/no-rebuild/limitation assessment
- `docs/reviews/p3-artifact-demo.md`
- Authoritative P3 status/handoffのreview-owned最小更新
- Approve時はfresh workerのexact one-time execution、block時は一つのbounded remediationをnextに指定

# Verification

```sh
npm run p3:verify
npm run check
git diff --check
git status --short
```

Candidate SHA-256、fixed source/lockfile identity、compiled non-entry module import-safetyとentryの
static byte check、exact production root absenceも独立確認する。Entrypoint自体はimport/executeしない。
`npm run p3:execute`、Docker/network/dependency acquisitionは実行しない。

# Completion report

- Gate decision、findings、reviewed identity、remaining limitations
- Commands run、exit status、test counts、hash/root-absence observations
- Production build/Docker/network/credentialsを使用していないこと
- Changed files
- Approve/blockに対応する一つのconcrete next task
