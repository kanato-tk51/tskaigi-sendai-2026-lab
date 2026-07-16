# M2-A npm lifecycle adapter

## Status and contract role

Status: **implementation complete; independent review approved with non-blocking follow-ups; runtime evidence-transfer boundary blocked/Inconclusive; experiment-matrix Observed unmeasured**. See the [independent review record](reviews/m2-a-npm-lifecycle-adapter.md).

This document defines the Expected-only M2-A adapter boundary. The host builds and tests adapter source and static contracts only. The instrumented package is packed, installed, and executed only inside the disposable npm 12 container after the evidence-transfer boundary is approved.

## Fixed route and event contract

The private package is `@tskaigi-lab/adapter-npm-lifecycle` in `packages/npm-lifecycle-probe`. Its container-only lifecycle entry is the fixed repository-owned file:

```text
node /opt/m2a-adapter/dist/lifecycle-entry.js
```

The lifecycle entry reads only these enumerated bindings:

```text
PROBE_CANARY_M2A_RUN_ID
PROBE_CANARY_M2A_RUN_ROOT
PROBE_CANARY_M2A_LOOPBACK_PORT
PROBE_CANARY_M2A_ENVIRONMENT
```

It records one `automatic` `npm-install-lifecycle` route invocation followed by six capability attempts:

```text
0 npm-lifecycle-invocation
1 npm-lifecycle-attempt-environment
2 npm-lifecycle-attempt-file-read
3 npm-lifecycle-attempt-file-hash
4 npm-lifecycle-attempt-file-write
5 npm-lifecycle-attempt-loopback
6 npm-lifecycle-attempt-child
```

There are no official npm tool API changes. The producer segment is owned and serialized by `probe-core`; raw canary values, file content, absolute paths, errors, command output, and diffs are not event data.

## M0 boundary

The adapter carries forward M0's Node.js `v24.18.0`, npm `12.0.1`, `postinstall`, local tarball, and isolated-container assumptions. It does not modify M0's marker evidence or stdout fallback. M0's Docker `29.6.1` tmpfs-to-`docker cp` transfer remains Inconclusive, so M2-A container execution and any Observed matrix update remain blocked until a human-approved result transfer boundary exists.
