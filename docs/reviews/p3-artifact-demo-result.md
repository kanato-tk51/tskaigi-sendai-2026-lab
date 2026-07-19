# P3 minimal artifact-demo result independent review

## Review target and decision

- Target: the exact fixed root
  `results/runs/p3-artifact-demo/artifact-mvp-build-once-20260719-01`,
  the recorded source/compiled identities, and the one-shot execution record
- Review type: fresh independent Docker-free read-only receipt/result review
- Decision: **ACCEPTED as P3 runtime evidence at the exact one-local-run scope**
- Blocking findings: none
- Non-blocking findings: none
- C-06/C-07: accepted with the limitations below
- Experiment-matrix Observed: unchanged
- Production command: not rerun; its one-shot gate remains consumed

The canonical marker, artifact, receipt, verification copy, deployment copy,
tamper copy, and result reproduce the fixed build, command, source, lockfile,
and artifact identities. The receipt passes the reviewed strict parser and an
independent canonical/key/value check. It records build invocation count `1`,
an empty forwarded environment, Node.js `v20.18.2`, the fixed builder version,
and all three required limitations. The result records successful digest
verification, verified-only copy plus post-copy digest with zero deploy build
invocations, and `P3_ARTIFACT_DIGEST_MISMATCH` before tamper deployment.

This review changed no implementation, fixture, lockfile, package script,
production result, Expected value, or experiment-matrix value. Review-owned
changes are this record and the smallest authoritative P3/evidence handoff
updates. Only the prompt-listed fixed paths were read; the parent result
directory and other ignored/retained results were not enumerated. The review
did not run `npm run p3:execute`, repair or re-permission the fixed root, call
Docker, access a runtime socket, execute a probe/lifecycle fixture, use external
network or credentials, acquire dependencies, publish, deploy externally, use
remote Git, or communicate with a third party. Standing authorization was not
needed for this non-executing review.

## Recomputed source and candidate identity

All eleven gate-approved source/input SHA-256 values reproduced:

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

The five compiled identities also reproduced:

| Derived target | SHA-256 |
|---|---|
| `dist/artifact-demo-contract.js` | `9b5bbe17a9dec117d41c08ec9e29cb396f84b4239997ed98ffb29b66240961be` |
| `dist/artifact-demo.js` | `c63e47231a97788c43116c2c44daefc1a6cdd3c86647550d6b14956568ca8343` |
| `dist/artifact-demo-process.js` | `ca620db6da6d0f4b46f3cf27d51f2cc5b40c7867b01d3ad55d184b992fb212ae` |
| `dist/artifact-demo-build-entry.js` | `ae3eb6aea9355cfd363d2130bbbd6558f35980b01465363266733c1229530bf0` |
| `dist/artifact-demo-entry.js` | `6a081669ea850907bc81f98ca8be58ab998e66e5d2057e8989ccb1c85b580c50` |

The root package still binds `p3:execute` to the exact argument-free build and
fixed entry command. Neither entry was imported or executed during the result
review.

## Canonical receipt and result assessment

Every reviewed output is a regular non-symlink file within its documented
bound. The fixed identities independently recomputed from the bytes are:

| Fixed output | Bytes | SHA-256 |
|---|---:|---|
| `build/invocation-1.json` | 116 | `4ce1dd9520beb70bfa5be3d8bef0f87bfba9cdb01483bf62012f8ce64ba23d24` |
| `handoff/presentation.json` | 199 | `e3a5bc0808db5a4c706c35cc53616350c5ff84b662c071880ccca8b4982525c3` |
| `handoff/receipt.json` | 1,431 | `0cbc174bebb1e1570500cbcfb384ffa1d60e8f02d151e5e1336ab2c8eeddd84a` |
| `result.json` | 1,144 | `011a0ce10d02ff76d0319903a8a03a35abb1ae94de4fa3c1fe804e27e2b4edd3` |
| `tamper/presentation.json` | 199 | `68b5544eba962a4b6b1e0926d638196570de252c5846346b913c7ee06ec6c33e` |

The invocation marker is canonical and binds the fixed build/command IDs to
invocation `1`. The canonical artifact binds the fixed source bytes and source
digest. The receipt's dirty-tree digest independently recomputes as
`sha256:fc30c2b00eac223254c903be73af243247b72fac83c8ee00a70872384b6ef093`;
its source, lockfile, and artifact sizes/digests match the current fixed bytes.
The reviewed parser rejected no field, and a separate strict check found no
missing or unknown key or noncanonical representation.

The handoff, verification, and deployment artifact bytes are identical. The
handoff, verification, and tamper receipt bytes are identical. The tamper
artifact has the same 199-byte length and differs from the verified artifact at
exactly one byte. Exact `lstat` of the fixed `tamper-deployment/` path returned
`ENOENT`. The canonical result cross-binds the artifact and receipt digests and
records:

- `buildInvocationCount: 1`;
- verification `verified` with only `digest`;
- deployment `copied` with `copy`, `post-copy-digest`, and
  `buildInvocations: 0`; and
- tamper `rejected-before-copy`, error
  `P3_ARTIFACT_DIGEST_MISMATCH`, and `deployStarted: false`.

The one-shot execution record names exactly one argument-free command, exit 0,
no retry, bounded output disposition, and the absent-to-present fixed-root
transition. The invocation marker and canonical root state are consistent with
that record. They do not cryptographically prove command history by themselves;
acceptance therefore remains scoped to the candidate bytes together with the
reviewed implementation, gate, and execution record.

## Evidence decision and limitations

The result is accepted for C-06 as one local observation that this fixed source
was built once, verified in a separate directory, copied without rebuilding,
and rejected before copy after an exact one-byte change. It is accepted for
C-07 because both receipt and result retain, next to that identity evidence,
the limitations that:

- digest/local provenance does not prove semantic harmlessness;
- the unsigned local receipt does not establish authenticity if artifact and
  receipt are replaced together; and
- the fixed builder's lack of a network operation is not OS-level egress
  enforcement evidence.

Acceptance does not establish another-machine reproducibility, arbitrary build
isolation, SLSA/in-toto provenance, a transparency/signature chain, receipt
truth against coordinated replacement, or artifact semantics. The disposable
fake builds used by focused tests remain static/unit evidence and are not added
to the production count. The raw ignored root must remain read-only local
review input; P4 must create the tracked sanitized projection used by the talk.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Eleven source/input and five compiled SHA-256 calculations | Exit 0; all gate-reviewed identities reproduced. |
| Exact package-script and known-path state assertions | Exit 0; the argument-free script matched, six known directories and nine known regular files were accepted, and `tamper-deployment/` returned `ENOENT`. |
| Independent canonical receipt/result/copy/tamper assertion | Exit 0; all fixed bindings, canonical bytes, digests, copy equality, one-byte difference, zero deploy builds, empty forwarded environment, and three limitations reproduced. |
| `npm run p3:verify` | Exit 0; typecheck/build passed and 2 focused files / 9 tests passed. |
| `npm run check` | Exit 0; formatting, lint, typecheck, and 100 files / 687 tests passed. |
| Post-verification fixed-output SHA-256 assertion | Exit 0; all five recorded output identities remained unchanged. |
| `git diff --check` | Exit 0 after review-owned records and handoff metadata were finalized. |
| `git status --short` | Captured the existing uncommitted P0-P3 work plus this review record and handoff updates; no unrelated change was reverted. |

The next task is P4 evidence-map/talk-table implementation: create tracked
sanitized examples, one compact five-route trigger table, one selected
profile/capability table with the Vite Inconclusive limitation, one artifact
result table, and `docs/evidence-map.md`. Do not rerun P2 or P3.
