# M4 profile control の static/unit 実装

この directory には、M4 の非実行static/unit implementation、B-01〜B-06 remediation、B-07 accepted-input binding remediation、固定doctor境界、version管理されたexact-input proposalを配置する。B-03/B-04/B-07は独立read-only re-reviewでclosureし、既存static/unit implementation gateは承認済みである。Doctor remediationの独立read-only re-reviewはB-08/B-10をclosureし、canonical-byte remediationのfresh独立read-only re-reviewはB-09をclosureした。Runtime-template compatibility correctionもfresh re-review済みで、fixed doctor static/unit gateは承認済みである。Post-bootstrapの一回限定doctorはaccepted candidate inventoryを取得済みで、`image-input.json`とrepository staging bytesへbindしたproposalのbase/staging部分はindependent reviewでacceptされた。B-11/B-12もfresh independent re-reviewでstatic/unit closureし、base/staging/fixed-backend contractは承認済みである。Production offline-build backend reviewがblockしたB-13〜B-15へのnon-executing remediationは実装済み・fresh independent read-only re-review待ちであり、exact-input production activation、build execution、runtime enforcement gateは未承認・未実測のままである。

- `lab-execution-profile/v1`、`lab-profile-control-manifest/v1`、`lab-profile-control-evidence/v1`、host inspection、completion、approved image input の厳密な TypeScript validator
- 副作用のない固定 Docker build/create/inspect/start/remove command plan
- read-only input、host-owned metadata、container result、same-target scratchを分離した固定layout
- exact staged-file digestとsame-image/two-run pair validator
- accepted doctor candidateを固定する`image-input.json`とfixed-value validator
- private staging bytes、exact inventory/digest、base environment keysを持つbranded accepted snapshot
- accepted snapshotにbindしたbuild plan/pair/layout/inspect allowlistと、build前のexact staged-path再検証
- 厳密な pre-start inspection projection と typed canonical evidence/transfer validation
- timeout/output/transfer/cleanupをinconclusiveにするfake-backend実行状態機械
- 共有の offline Containerfile 1 つと repository-owned の無害な control/child fixture
- negative static/unit test と fail-closed orchestrator entry
- fixed absolute Docker CLIでclient/server version、local base identity、environment keyだけを取得する3-command doctor plan
- disposable `DOCKER_CONFIG`、no inherited host environment、timeout/combined-output/cleanupを持つdisabled doctor backend
- accepted snapshot/layout/planだけにbindしたbuild-only executor、canonical sanitized result、private staging/process/cleanup境界を持つdisabled production offline-build backend

orchestrator entry が通常時に受け付けるのは、契約で定めた 5 operation だけであり、doctor/offline-build backendを生成せずDocker を呼び出す前に `M4_EXECUTION_NOT_APPROVED` を返す。これは意図した動作であり、一回限定doctor後にこの状態へ戻している。Version管理されたbase image input proposalのbase/staging/fixed-backend contractはindependent review済みで、build-only production backendのB-13〜B-15 remediationはnon-executing実装済みだがproduction未採用・fresh independent re-review待ちである。Built image digestとversion管理されたpermissive/constrained `profile.json`はまだ存在しない。

静的検証:

```sh
npm run m4:verify
```

Fixed doctor static/unit gateは[runtime-template compatibility independent re-review](../../docs/reviews/m4-execution-profiles-runtime-template-compatibility.md)で承認済みで、standing authorizationによる一回限定doctorは完了した。追加のdoctor実行は新しいrepository-recorded gateなしに行ってはならない。[Exact-input backend remediation re-review](../../docs/reviews/m4-execution-profiles-exact-input-backend-remediation.md)はB-11/B-12をstatic/unit境界でclosureした。[Production offline-build backend review](../../docs/reviews/m4-execution-profiles-offline-build-backend.md)のB-13〜B-15 remediationは実装済みで、次は[独立re-review prompt](../../prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md)に従うfresh read-only re-reviewである。`m4:build`、`m4:run:controls`、`m4:verify:evidence`はreviewと別途recorded execution gateまで引き続き実行してはならない。
