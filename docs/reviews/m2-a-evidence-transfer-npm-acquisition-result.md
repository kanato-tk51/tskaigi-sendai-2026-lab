# M0/M2-A npm-acquisition exhausted-generation result review

## Review target and decision

- Target: frozen-research issue #43 generation `20260721-01`
  npm-acquisition occurrence
- Review type: fresh independent Docker-free fixed-root result review
- Decision: **INCONCLUSIVE; GENERATION EXHAUSTED; NO CANDIDATE ACCEPTED**
- Process projection: exact natural failure
- Fixed-root projection: stable empty retained occurrence root
- Retry, repair, cleanup, alternate occurrence, construction binding, and
  evidence promotion: not authorized

The authoritative handoff records exactly one direct occurrence under the
saved execution prompt. It settled naturally with exit `1`, no signal, empty
stdout, and the exact 29-byte `M2A_INPUT_ACQUISITION_FAILED\n` stderr line.
This review found the fixed acquisition root as a stable empty directory. The
empty retained root is partial state after issuance, so the saved review rule
requires an `INCONCLUSIVE` candidate decision even though the process
projection is the exact bounded failure terminal.

No archive, receipt, registry SRI, accepted candidate identity, construction
input, runtime result, or `Observed` evidence exists. Generation
`20260721-01` remains exhausted and was not retried.

## Authoritative one-occurrence handoff

The immutable handoff is
[`m2-a-evidence-transfer-npm-acquisition-execution.md`](m2-a-evidence-transfer-npm-acquisition-execution.md).
It records:

```text
executable: /usr/bin/env
argv: [-i, --, /usr/bin/node, experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs]
cwd: /home/kanato/tskaigi-sendai-2026-lab
environment own keys: []
shell: false
occurrenceIssued: true exactly once
```

The final adjacent preflight succeeded before that occurrence. Direct human
authorization for all four fixed M2A-NG06 effects is recorded separately in
[`m2-a-evidence-transfer-npm-acquisition-execution-authorization.md`](m2-a-evidence-transfer-npm-acquisition-execution-authorization.md).
Continuing-work standing authorization was not substituted for the external
occurrence and was not needed or used for this read-only review.

The bounded process observation reproduced from the handoff is:

| Field | Observed value |
| --- | --- |
| Natural exit | `1` |
| Signal | `null` |
| Spawn error | `false` |
| Stdout | 0 bytes; SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`; not truncated; exact empty value |
| Stderr | 29 bytes; SHA-256 `b550cee014cd3178582b70388e155908256a87f23536d53f3f7aeb15fffe334b`; not truncated; exact `M2A_INPUT_ACQUISITION_FAILED\n` value |
| Process projection | `candidate-failed` |
| Retry disposition | generation exhausted; no retry |

The terminal does not identify whether a request, response validation,
publication step, filesystem transition, or another producer operation caused
the failure.

## Reproduced prompt and producer identities

Both saved prompt identities reproduced before fixed-root access:

| Prompt | Bytes | SHA-256 |
| --- | ---: | --- |
| `prompts/m2-a-evidence-transfer-npm-acquisition-execution.md` | 12,829 | `cab8482f8ace0b3ad1460e95b1419965a92bd3e00e2ebd501b5e8f82757b0d8f` |
| `prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md` | 13,241 | `a62a49b16a94bcd75a289e8b6da97eba6cb2e1973f893fa60c013fb5a856aa8b` |

The exact regular, non-symlink producer closure also reproduced:

| Order | Repository-relative path | Bytes | SHA-256 |
| ---: | --- | ---: | --- |
| 1 | `experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs` | 1,166 | `bd4066ad6788aca2847c257907f91a29aec7f85d7a249d2789edbce4c9f5f7df` |
| 2 | `experiments/npm12-install/scripts/m2a-transfer-inputs.mjs` | 112,299 | `edac896625a2b534438d4ff9cfd4f92d06a69ee902dbfb892876a72f6fd250b7` |
| 3 | `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` | 81,269 | `578235922220093be45eee6a2d18c6f21d624f2dab4e6109562890f7693d4755` |

The ordered aggregate reproduced as
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.
Static verification retained the reviewed entry/input/construction closure,
request/publication/terminal boundaries, and no producer import or execution.

## Fixed-root observations

The bounded inspector opened only
`experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01`
with directory and no-follow flags. It did not enumerate the parent or open
another ignored, toolchain, construction, result, runtime, home, or cache path.

| Property | Observed value |
| --- | --- |
| Root type | non-symlink directory |
| Root ownership | effective user and effective group |
| Root mode | `0700`, with no special bits |
| Root link predicate | positive and unchanged through review |
| Root identity | stable from final-component `lstat` through held open, inventory, post-inventory, and post-read checks |
| Root close | known |
| Recognized inventory | empty |
| Unexpected child count | `0` |
| Complete final inventory | no |

Because the inventory was empty, none of
`npm-12.0.1.tgz`, `acquisition.json`, `npm-12.0.1.tgz.next`, or
`acquisition.next` was opened. There is no archive size, SHA-256, SHA-512,
registry SRI, receipt byte count, receipt SHA-256, canonical receipt, or
receipt/archive cross-binding to report.

The stable empty directory is retained partial diagnostic state. It cannot
establish whether either HTTPS request began or settled, whether npm bytes
were received, or which producer step failed.

## Reconciliation and evidence classification

The direct process observation and durable filesystem observation reconcile
only to this bounded conclusion:

1. The process produced the exact natural failure terminal.
2. The occurrence root exists and is safely readable, but its inventory is
   incomplete and contains no candidate file.
3. Partial retained state after issuance requires `INCONCLUSIVE`; root
   visibility cannot refine the sanitized process failure into a cause.
4. The occurrence is exhausted without retry, repair, cleanup, resume, or
   reinterpretation.

The evidence classes remain separate:

- M2A-NG contract closure and the reproduced hashes/static checks are
  contract/static evidence.
- The natural exit and bounded streams are direct process observations from
  the authoritative execution handoff.
- The stable empty directory is a durable fixed-root observation from this
  review.
- `INCONCLUSIVE` is the candidate review decision, not an accepted npm input.
- Construction binding, construction, lifecycle/runtime execution,
  experiment-matrix `Observed`, and presentation evidence remain absent.

Both `reviewedAcquisitionReceiptSha256` and
`reviewedAcquisitionTarballSha256` remain `null`.
`runtimeExecutionApproved` remains `false`, and relevant `evidenceReview`
values remain `not-performed`. The review changed no Expected or `Observed`
value.

## Verification and safety boundary

| Command or inspection | Observed result |
| --- | --- |
| Applicable instructions, active issue #43 chain, saved prompts, authorization, and authoritative occurrence handoff | Read within the repository before fixed-root interpretation. |
| `wc -c`, `sha256sum`, regular-file, and non-symlink checks over the prompt pair and ordered three-file producer closure | Exit `0`; all five byte counts, hashes, and the ordered producer aggregate reproduced. |
| Construction/evidence sentinel inspection | Both acquisition bindings remained `null`; runtime approval remained `false`; evidence review remained `not-performed`. |
| `npm run m2a:transfer:verify` | Exit `0`; the static verifier passed and 1 focused file / 62 tests passed without importing or executing either producer. |
| Fixed-root held no-follow bounded inspector | Exit `0`; the root was a stable effective-user/effective-group mode-`0700` directory with positive stable links, known close, no recognized children, and no unexpected children. |
| `npm run m2a:verify` | Exit `0`; 4 files / 5 tests passed after adapter typecheck, build, and static verification. |
| `npm run typecheck` | Exit `0`. |
| Focused Prettier check over this review and the three changed status records | Exit `0`; all four Markdown files matched Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error was reported in the accumulated tracked diff. |
| `git status --short` | Preserved the accumulated dirty worktree; this review added only its review record and minimal status updates. |

No producer, npm acquisition/install/pack/approve/rebuild, lifecycle fixture,
compiler, constructor, construction, image build, Docker/runtime socket,
transfer, runtime-result validation, repair, cleanup, retry, alternate
occurrence, external/loopback/Unix-socket communication, Remote Git,
publication, deployment, construction binding, or evidence promotion was
used. The review did not inspect the root parent, another ignored path, host
environment, `/usr/bin/node` bytes, credentials, home/cache state, historical
results, retained runtime state, or an unexpected child.

The fixed-path checks retain the cooperative-host limitation and do not prove
external npm provenance, DNS/certificate/CDN identity, registry freshness, or
resistance to a hostile same-authority process or kernel.

## Decision and next task

Issue #43 closes only at this reviewed Inconclusive npm-acquisition boundary.
It establishes no transferable input, construction, runtime result, or
`Observed` evidence.

Next: begin issue #54 with one Docker-free fresh-generation selected-Vite
contract and fresh independent contract-review prompt; do not implement or
execute that generation in the contract task.
