# P3 minimal artifact demo contract

Status: **Docker-free implementation, one-shot execution, and fresh independent
receipt/result review complete; the exact local result is accepted for C-06/C-07
with the recorded limitations; the production command remains non-retryable**.

This is the active five-step presentation subset of
[the artifact pipeline](artifact-pipeline.md), not the deferred full-lab M5
framework. It fixes one repository-owned build input and one one-shot execution
boundary for C-06/C-07. The implementation task and independent gate review did
not invoke the production command. A later fresh worker used the approved gate
exactly once and created the fixed result root; those bytes remain candidate
runtime evidence until a separate fresh read-only review accepts or rejects
them.

## Fixed identity

| Item | Exact value |
|---|---|
| Build ID / fixed result leaf | `artifact-mvp-build-once-20260719-01` |
| Build command ID | `artifact-mvp-build-once` |
| Source input | `packages/lab-cli/fixture/artifact-demo/source.txt` |
| Lockfile input | `package-lock.json` |
| Artifact logical path | `artifact/presentation.json` |
| Fixed result root | `results/runs/p3-artifact-demo/artifact-mvp-build-once-20260719-01` |
| Approved one-shot production command | argument-free `npm run p3:execute` |

The implementation candidate presented to the independent review has these
SHA-256 identities. They establish source-byte identity only, not runtime
behavior.

| Target | SHA-256 |
|---|---|
| `packages/lab-cli/src/artifact-demo-contract.ts` | `88baf382191a5f7a0e595c13be9e3635f4a587e8fda0b3a5ac09cd45f4637a87` |
| `packages/lab-cli/src/artifact-demo.ts` | `531926ba92cc246a698aac3fe3fb5f13ae361e54ec93f8906f541dc8844a19be` |
| `packages/lab-cli/src/artifact-demo-process.ts` | `a4abadc0d181369837646a95eb0964f405db0c988828c4587c1d1f6456ceff58` |
| `packages/lab-cli/src/artifact-demo-build-entry.ts` | `1c8cfd693470183a4755772e0b4ade389985f0638712e5e918e6a205fafed56e` |
| `packages/lab-cli/src/artifact-demo-entry.ts` | `cd8a0b68b2ba90237358d067cdd256d4e19a0d53be68e90dd5e0c48f31993bbd` |
| `packages/lab-cli/scripts/verify-static.mjs` | `57de868844ce0e3e900d2e31d95f249fc11cf0aab803fcf57d27d9a3ea818b1d` |
| `packages/lab-cli/test/artifact-demo.test.ts` | `ceb3af1374dbdbff2c4b7837859826c041fe6462cbe187b30cf8b1263749c439` |
| `packages/lab-cli/test/artifact-demo-static.test.ts` | `a4b4dc6a1a5937f6455fa7d32954eea70986b43fed8c5b65e303e60902078f45` |
| Fixed source fixture | `5e730ea95d6b7530d3e4a60bf41c3223c2299646831c123078fc32314ffa313b` |
| Root `package.json` | `fd7069fac18a6d6933cd088938a34951446906d9749bc6d284dc898df92ec3f3` |
| Root `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |

The builder reads only the two fixed regular, non-symlink inputs within the
repository. It bounds the source at 4 KiB and the lockfile at 2 MiB, compares
the opened file identity and size around each read, and accepts no caller path,
command, argument, environment, dependency, registry, or network target.

The artifact is canonical JSON derived from the fixed UTF-8 source. Its
`sourceSha256` binds the source bytes; the receipt separately records a
canonical single-file dirty-tree digest so the current dirty checkout is not
represented by a Git revision alone. The lockfile SHA-256 is recorded even
though verify/copy does not receive or use the lockfile.

## One-build process boundary

The fixed parent entry accepts no arguments. It exclusively creates the fixed
run root and invokes exactly one child using `process.execPath`, the compiled
fixed `artifact-demo-build-entry.js`, no arguments, `shell: false` semantics
through `execFile`, an empty environment, a 10-second timeout, and a 4-KiB
per-stream output bound. The child rejects any argument or environment key.

Before reading either input, the child exclusively creates
`build/invocation-1.json`. A later build invocation or an existing run root
fails closed; the implementation has no retry or rebuild path. The marker is
static/unit evidence for the state machine until the production command runs,
not an observed build count.

The child writes only the fixed handoff artifact and canonical receipt. The
receipt contains:

- schema/build/command IDs and invocation count `1`;
- the fixed source logical path, byte count, SHA-256, and dirty-tree digest;
- `package-lock.json` SHA-256;
- actual child `process.version` and builder version
  `artifact-mvp-builder/v1`;
- forwarded environment variable count `0` and external-network policy
  `prohibited`;
- artifact logical path, byte count, and SHA-256;
- the byte-identity-not-harmlessness, unsigned-local-receipt, and lack of
  OS-level egress-enforcement limitations.

The fixed implementation imports no network API. Empty child environment and
the fixed code path prevent credential forwarding or an application network
operation, but they are not evidence of OS-level network isolation. The later
receipt must retain that distinction.

## Verify, copy, and tamper boundary

After the build child settles successfully, the parent performs only fixed
filesystem operations:

1. copy the handoff artifact and receipt to a separate `verification/`
   directory;
2. reject noncanonical/unknown receipt fields, recompute the artifact SHA-256,
   and require the recorded byte count and digest;
3. create `deployment/` only after successful verification, copy the artifact,
   and recompute its post-copy digest without install, build, source, lockfile,
   cache, or dependency input;
4. make a separate `tamper/` copy, mutate exactly one byte, and require
   `P3_ARTIFACT_DIGEST_MISMATCH` before any `tamper-deployment/` directory is
   created;
5. write a small canonical `result.json` only after all four conditions hold.

The result records build count `1`, verification operations, deployment
operations with zero build invocations, the one-byte rejection disposition,
artifact/receipt digests, and the receipt limitations. It is not Observed until
the fixed production command completes and a fresh read-only review accepts the
result bytes.

## Exact one-shot execution gate

The [fresh independent Docker-free review](reviews/p3-artifact-demo.md)
reproduced the candidate source/test/entry/package and fixed-input identities,
argument-free script, empty child environment, one-invocation/no-retry state
machine, receipt validation, compiled import/static-entry boundary, and exact
fixed-root absence. It found no blocking or non-blocking finding and approved
only a later fresh worker using the `continue-repository-work` standing
authorization to invoke exactly once:

```text
npm run p3:execute
```

That later authorization covers no retry, alternate ID/path/input, other build
command, dependency acquisition, network access, Docker operation, result
repair, publication, deployment outside the repository-local simulator,
Observed promotion, or third-party communication. A nonzero, partial, or
inconclusive result consumes the one-shot gate. Successful candidate bytes
still require a fresh read-only receipt/result review before C-06/C-07 evidence
acceptance.

## One-shot execution record

Execution date: 2026-07-19. State: **the fixed command exited 0 and produced a
canonical receipt/result accepted by the fresh independent Docker-free result
review at the exact one-local-run scope**.

A fresh worker reproduced all eleven approved source/input hashes, all five
derived JavaScript hashes, the exact argument-free package script, the compiled
non-entry import/static-entry boundary, and exact `ENOENT` absence of the fixed
result root. It then used the `continue-repository-work` standing authorization
to invoke exactly once:

```text
npm run p3:execute
```

This standing authorization use was not a separate human review. The command
exited 0 and was not retried. Captured command output contained only the npm
build log and the canonical result JSON; no stderr text was observed. The fixed
build child can settle successfully only with empty child stdout and stderr.
No alternate build ID/path/input/command, dependency acquisition, Docker,
external network, runtime socket, credential access, publication, external
deployment, remote Git, or third-party communication was used.

The exact fixed root now exists. Exact-path checks, without enumerating its
parent, observed the expected `build/`, `handoff/`, `verification/`,
`deployment/`, and `tamper/` directories, plus `result.json`.
`tamper-deployment/` returned `ENOENT`. Candidate byte identities are:

| Fixed output | Bytes | SHA-256 |
|---|---:|---|
| `build/invocation-1.json` | 116 | `4ce1dd9520beb70bfa5be3d8bef0f87bfba9cdb01483bf62012f8ce64ba23d24` |
| `handoff/presentation.json` | 199 | `e3a5bc0808db5a4c706c35cc53616350c5ff84b662c071880ccca8b4982525c3` |
| `handoff/receipt.json` | 1,431 | `0cbc174bebb1e1570500cbcfb384ffa1d60e8f02d151e5e1336ab2c8eeddd84a` |
| `result.json` | 1,144 | `011a0ce10d02ff76d0319903a8a03a35abb1ae94de4fa3c1fe804e27e2b4edd3` |
| `tamper/presentation.json` | 199 | `68b5544eba962a4b6b1e0926d638196570de252c5846346b913c7ee06ec6c33e` |

The handoff, verification, and deployment artifact hashes are identical; the
handoff and verification receipt hashes are identical. The candidate result
records build invocation count `1`, verification `verified`, deployment
`copied` with zero build invocations, and one-byte tamper
`rejected-before-copy`, while retaining all three required limitations. These
hashes remained unchanged after `npm run p3:verify` passed 2 files / 9 tests and
the root `npm run check` passed 100 files / 687 tests; `git diff --check` also
exited 0. The eleven approved source/input hashes and five derived JavaScript
hashes still match the gate-reviewed values after those checks. These were the
execution worker's candidate observations. The later
[fresh Docker-free result review](reviews/p3-artifact-demo-result.md)
independently reproduced and accepted them without rerunning the production
command or changing the fixed root.

## Result-review acceptance

The fresh independent review reproduced all eleven source/input hashes, all
five compiled hashes, the exact package script, and only the known fixed result
paths. It parsed the canonical receipt through the reviewed parser and an
independent strict check, recomputed the source-tree/source/lockfile/artifact/
receipt/result identities, proved equality of the handoff/verification/
deployment artifact copies, proved equality of the receipt copies, counted
exactly one changed tamper byte, and observed `tamper-deployment/` as `ENOENT`.

The result is accepted for C-06/C-07 only at this one-local-run scope. Empty
child environment and application code without a network operation are not
OS-level egress evidence. The unsigned receipt does not prove authenticity
against coordinated artifact/receipt replacement, and byte identity does not
prove semantic harmlessness or another-machine reproducibility. The production
command must not be rerun or repaired. The next task is P4 tracked sanitized
examples, three compact talk tables, and `docs/evidence-map.md`.

## Focused verification boundary

The implementation task runs only Docker-free development checks:

```sh
npm run p3:verify
npm run check
git diff --check
git status --short
```

`npm run p3:execute` was intentionally excluded from both implementation and
gate-review verification. The later execution record above consumed that
one-shot gate; it must not be run again.

Implementation-session observations:

| Command or assertion | Observed result |
|---|---|
| `npm run p3:verify` | Exit 0; typecheck/build passed and 2 focused files / 9 tests passed. |
| `npm run check` | Exit 0; formatting, lint, root typecheck, and 100 files / 687 tests passed. |
| `npm run m3:static` | Exit 0; the M3-only static contract still passed after explicitly routing the separate P3 entry boundary to P3 static coverage. |
| Compiled non-entry imports plus exact fixed-root absence | Exit 0 before and after imports; no production root was created. Entrypoints were not imported or executed. |
| Candidate SHA-256 calculation | Exit 0; all identities in the fixed table above were calculated after final source formatting. |
| `git diff --check` | Exit 0 before final handoff metadata. |

No Docker, probe, lifecycle fixture, external network, dependency acquisition,
credential access, production artifact build, remote Git, publication, or
external deployment was used. `npm run p3:execute` remains intentionally unrun.

The independent gate review separately reproduced all eleven source/input
hashes, exact `ENOENT` fixed-root absence, the compiled non-entry import-safe
boundary, and static entry bytes. Its `npm run p3:verify` passed 2 files / 9
tests, and its root `npm run check` passed 100 files / 687 tests. These remain
static/unit observations, not runtime artifact evidence.
