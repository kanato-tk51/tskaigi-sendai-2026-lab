# Permissive M4 profile

承認済み policy が expose するのは、disposable environment/file canary、result/evidenceから分離したdedicated scratch、fixed loopback service、fixed Node.js child だけである。外側の non-root、read-only-root、external-network なし、capability-drop、no-new-privileges、host-resource なしの boundary は引き続き必須とする。

`profile.json` は、one-time recovery trailで記録されたbuilt-image digest
`sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`
へcanonical bytesでbindしたB-18 remediation candidateである。Fixed permissive run IDは
`m4-profile-control-p-20260720-02`。このversioned inputとexisting-image executor/
production control backendはDocker非実行のstatic/unit candidateであり、fresh independent
implementation/gate review前のactivation command、runtime enforcement、Observedを承認しない。
