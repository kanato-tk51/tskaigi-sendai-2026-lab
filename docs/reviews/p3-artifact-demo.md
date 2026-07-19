# P3 minimal artifact demo execution-gate independent review

## Review target and decision

- Target: the fixed `artifact-mvp-build-once-20260719-01` contract, builder,
  process boundary, entries, focused tests, source fixture, package script, and
  root lockfile
- Review type: fresh independent Docker-free static/unit execution-gate review
- Decision: **APPROVED for the exact one-shot P3 execution gate**
- Blocking findings: none
- Non-blocking findings: none
- Production artifact command: approved only through the argument-free
  `npm run p3:execute` command; not performed by this review
- Runtime artifact evidence: unmeasured
- C-06/C-07 evidence acceptance: pending a later fresh Docker-free result review

The candidate binds one repository-owned source, the root lockfile, build ID,
command ID, artifact logical path, and fixed result root through the contract,
builder, parent, and child entries. The parent accepts no arguments and invokes
one fixed child with `process.execPath`, no child arguments, an empty
environment, a 10-second timeout, and a 4-KiB per-stream output limit. The
child rejects arguments or environment keys and exclusively creates the first
invocation marker before opening either input. An existing root or consumed
marker fails closed, and neither the parent nor child contains a retry path.

The builder accepts only bounded regular non-symlink source and lockfile inputs,
checks opened-file identity around each read, and writes only the fixed artifact
and canonical receipt beneath its owned root. The receipt parser rejects
unknown, missing, noncanonical, or mismatched fields and binds the source-tree,
source, lockfile, and artifact SHA-256 values, actual Node version, fixed builder
version, command ID, invocation count `1`, empty forwarded environment, and all
three required limitations.

Verification copies the receipt and artifact into a separate directory before
parsing and digest comparison. Deployment starts only after that verification,
copies only the verified artifact, and checks the post-copy digest without a
build/install entry point. The tamper path copies the verified pair into a
separate disposable directory, changes exactly one byte, requires
`P3_ARTIFACT_DIGEST_MISMATCH`, and has no code path that creates the fixed
`tamper-deployment/` directory. Focused tests independently exercise the
positive flow, the single-byte difference, no-rebuild result, retry rejection,
symlinked input/result-ancestor rejection, canonical receipt rejection, fixed
process specification, and non-entry import safety.

This review changed no implementation, fixture, package script, lockfile,
Expected value, Observed value, or runtime result. Review-owned changes are this
record and authoritative P3 status/handoff metadata. It did not run
`npm run p3:execute`, create the production result root, call Docker, access a
runtime socket, run a probe or lifecycle fixture, use external network or
credentials, acquire dependencies, publish, deploy externally, use remote Git,
or communicate with a third party. The `continue-repository-work` standing
authorization was not needed for this non-executing review. This is an
independent Codex review, not a separate human review.

## Approved candidate identity

The following SHA-256 values identify the exact approved source candidate.
They establish static byte identity, not runtime behavior.

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

The TypeScript build reproduced these derived JavaScript identities before the
compiled-entry inspection. They are review evidence for the pinned toolchain,
not substitutes for the approved source identities above.

| Derived target | SHA-256 |
|---|---|
| `dist/artifact-demo-contract.js` | `9b5bbe17a9dec117d41c08ec9e29cb396f84b4239997ed98ffb29b66240961be` |
| `dist/artifact-demo.js` | `c63e47231a97788c43116c2c44daefc1a6cdd3c86647550d6b14956568ca8343` |
| `dist/artifact-demo-process.js` | `ca620db6da6d0f4b46f3cf27d51f2cc5b40c7867b01d3ad55d184b992fb212ae` |
| `dist/artifact-demo-build-entry.js` | `ae3eb6aea9355cfd363d2130bbbd6558f35980b01465363266733c1229530bf0` |
| `dist/artifact-demo-entry.js` | `6a081669ea850907bc81f98ca8be58ab998e66e5d2057e8989ccb1c85b580c50` |

The exact production root
`results/runs/p3-artifact-demo/artifact-mvp-build-once-20260719-01` returned
`ENOENT` from an exact `lstat` check without enumerating its parent. It remained
absent before and after importing only the three compiled non-entry modules.
Neither compiled entry was imported or executed by this review.

## Exact one-shot execution gate

A fresh worker may use the `continue-repository-work` standing authorization
only after reproducing the eleven approved source/input hashes above, the fixed
argument-free package script, the compiled non-entry import-safety/static-entry
boundary, and exact `ENOENT` absence of the fixed result root. It may then invoke
exactly once:

```text
npm run p3:execute
```

That action consumes the gate on every outcome, including nonzero, partial, or
inconclusive output. It is never retried and does not authorize another build
ID, path, input, command, argument, environment, dependency acquisition,
network access, Docker operation, result repair, publication, external deploy,
Observed promotion, or third-party communication. The later worker must record
the exact command exit, root state, bounded stdout/stderr disposition, and must
not alter a failure to force the expected result. Using standing authorization
for that one command does not mean a separate human review occurred.

Even a successful command remains candidate runtime evidence until a later
fresh Docker-free read-only review independently checks the canonical receipt,
result, invocation marker, artifact/deployment/tamper identities, fixed inputs,
and limitations. C-06/C-07 and the evidence map must not be updated before that
review.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Candidate SHA-256 calculation | Exit 0; all eleven documented source/input identities reproduced. |
| Exact fixed-root absence check | Exit 0; exact `lstat` returned `ENOENT` without parent enumeration. |
| `npm run p3:verify` | Exit 0; typecheck/build passed and 2 focused files / 9 tests passed. |
| Compiled non-entry import/root-absence assertion | Exit 0; the three non-entry modules imported without creating the fixed root. |
| Compiled entry static-byte inspection and derived SHA-256 calculation | Exit 0; both entries retain the no-argument/fixed-path boundary and were not imported or executed. |
| `npm run check` | Exit 0; formatting, lint, typecheck, and 100 files / 687 tests passed. |
| `git diff --check` | Exit 0 after review-owned records and handoff metadata were finalized. |
| `git status --short` | Captured the existing uncommitted P0-P3 work plus this review-owned record and metadata; no unrelated change was reverted. |

## Remaining boundaries and next task

The review establishes only fixed source identity and Docker-free static/unit
behavior. It does not establish a production build count, runtime receipt or
artifact digest, OS-level egress prevention, semantic harmlessness, receipt
authenticity, reproducibility on another machine, or C-06/C-07 Observed
evidence. The local receipt remains unsigned and cannot detect coordinated
replacement of both artifact and receipt.

The next task is a fresh worker revalidating this approved snapshot, the exact
package script, compiled import/static-entry boundary, and absent fixed root,
then using standing authorization to run `npm run p3:execute` exactly once. Do
not retry it. Any resulting bytes require a separate fresh Docker-free review.
