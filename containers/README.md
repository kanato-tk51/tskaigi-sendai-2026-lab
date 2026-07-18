# Container

M4 では、承認済み implementation prompt に従い、固定の共有 profile-control image input と、分離した permissive/constrained runtime policy を配置する。

現在の状態: Expected契約、fixed doctor、exact base/staging input、production offline-build backendのstatic/unit境界は独立review済みである。一回限定offline buildは4 step完了後の`CLEANUP_FAILURE`となり、built-image digestはcanonical resultへ確立されなかった。Post-failure recovery implementationの[fresh review](../docs/reviews/m4-execution-profiles-offline-build-recovery.md)はfixed run/tag、content non-read、single inspect、retention-only境界をacceptしたが、exact mode special bitsとactive-child settlementのB-16/B-17でstatic/unit gateをblockしている。通常orchestrator entryはDocker access前にfail closedで、profile binding、container control、runtime enforcement、Observedは未確立である。詳細は[M4 execution profiles](../docs/m4-execution-profiles.md)と[M4 exact-input proposal](../docs/m4-execution-profiles-exact-input.md)を参照する。
