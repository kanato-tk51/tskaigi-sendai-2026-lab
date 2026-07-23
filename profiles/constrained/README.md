# Constrained M4 profile

承認済み policy は disposable environment/file target を省き、permissiveと同じdedicated scratch targetおよびsource targetをread-onlyとし、fixed loopback service を省き、Node permission model で fixed Node.js child を deny し、result channel だけを writable に保つ。

`profile.json` は、one-time recovery trailで記録されたbuilt-image digest
`sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`
へcanonical bytesでbindしたB-18 remediation candidateである。Fixed constrained run IDは
`m4-profile-control-c-20260720-02`。このversioned inputとexisting-image executor/
production control backendはDocker非実行のstatic/unit candidateであり、fresh independent
implementation/gate review前のactivation command、runtime enforcement、Observedを承認しない。
