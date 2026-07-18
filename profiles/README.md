# Profile

M4 では、承認済み implementation prompt に従い、version 管理された permissive/constrained execution-profile 定義をここに配置する。

現在の状態: Expected契約とADR-0001は承認済みで、static policy builder/validator、fixed doctor、exact base/staging input、offline-build backendは実装・review済みである。一回限定buildは`CLEANUP_FAILURE`となり、built-image digestをcanonical resultへ確立できなかった。Recovery backendはB-16/B-17でstatic/unit gateがblockedである。Built-image digestが存在しないためversion管理する`profile.json`は意図的に未作成で、Observed enforcement resultも存在しない。詳細は[M4 execution profiles](../docs/m4-execution-profiles.md)を参照する。
