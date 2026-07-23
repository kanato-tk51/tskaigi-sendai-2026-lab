# M0/M2-A npm-acquisition one-occurrence process handoff

Execution date: 2026-07-23

Status: **ONE OCCURRENCE ISSUED; NATURAL FAILURE PROJECTION; GENERATION
EXHAUSTED; FIXED ROOT NOT INSPECTED**

## Authority and immutable inputs

The occurrence used the direct human authorization recorded in
[`m2-a-evidence-transfer-npm-acquisition-execution-authorization.md`](m2-a-evidence-transfer-npm-acquisition-execution-authorization.md).
That record carries the current repository user's explicit `承認します。` for
all four fixed M2A-NG06 effects. Continuing-work standing authorization was
not substituted for the external occurrence.

The preflight reproduced both authorized prompt identities:

| Prompt | Bytes | SHA-256 |
| --- | ---: | --- |
| `prompts/m2-a-evidence-transfer-npm-acquisition-execution.md` | 12,829 | `cab8482f8ace0b3ad1460e95b1419965a92bd3e00e2ebd501b5e8f82757b0d8f` |
| `prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md` | 13,241 | `a62a49b16a94bcd75a289e8b6da97eba6cb2e1973f893fa60c013fb5a856aa8b` |

It also reproduced the exact regular, non-symlink producer closure:

| Order | Path | Bytes | SHA-256 |
| ---: | --- | ---: | --- |
| 1 | `experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs` | 1,166 | `bd4066ad6788aca2847c257907f91a29aec7f85d7a249d2789edbce4c9f5f7df` |
| 2 | `experiments/npm12-install/scripts/m2a-transfer-inputs.mjs` | 112,299 | `edac896625a2b534438d4ff9cfd4f92d06a69ee902dbfb892876a72f6fd250b7` |
| 3 | `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` | 81,269 | `578235922220093be45eee6a2d18c6f21d624f2dab4e6109562890f7693d4755` |

The ordered aggregate was
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.
Static inspection reproduced exactly the entry-to-input and
input-to-construction local edges, no construction-local or dynamic/package
edge, the pre-producer executable/argv/cwd/empty-environment guard, the two
fixed request plans, archive-before-receipt publication, fixed terminal lines,
null acquisition construction bindings, false runtime approval, and
`not-performed` evidence sentinels.

`npm run m2a:transfer:verify` exited `0`: the static verifier passed and the
focused suite passed 1 file / 62 tests without importing or executing either
producer.

## Adjacent preflight and issued command

One in-memory host orchestrator repeated the complete tracked-source,
prompt-authority, import-edge, guard, request/publication/output, package
non-reachability, and sentinel checks. Its final operation re-read and matched
all three complete producer objects and their ordered aggregate. With no
intervening command, write, tool call, or user interaction, it issued exactly:

```text
executable: /usr/bin/env
argv: [-i, --, /usr/bin/node, experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs]
cwd: /home/kanato/tskaigi-sendai-2026-lab
environment own keys: []
shell: false
```

`occurrenceIssued` is `true` exactly once. No wrapper was saved, no package
script was added, and no retry, signal, cleanup, repair, alternate command, or
second occurrence was used.

## Bounded process observation

| Field | Observed value |
| --- | --- |
| Natural exit | `1` |
| Signal | `null` |
| Spawn error | `false` |
| Stdout captured bytes | `0` |
| Stdout SHA-256 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| Stdout truncated | `false` |
| Stdout exact allowed value | empty |
| Stderr captured bytes | `29` |
| Stderr SHA-256 | `b550cee014cd3178582b70388e155908256a87f23536d53f3f7aeb15fffe334b` |
| Stderr truncated | `false` |
| Stderr exact allowed value | `M2A_INPUT_ACQUISITION_FAILED\n` |
| Bounded process projection | `candidate-failed` |

This is the contract's exact natural failure process projection. It is not a
candidate-root decision and does not identify whether DNS, either HTTPS
request, response validation, publication, or a filesystem transition caused
the failure.

## Retention, evidence, and next gate

The execution worker did not read, list, stat, repair, remove, or classify
`experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01`
before or after issuance. The producer may have exclusively created and
retained state there; its presence, inventory, bytes, identities, and
candidate classification remain unknown.

Generation `20260721-01` is consumed and must never be retried. External npm
bytes, if any, remain untrusted. Candidate review was not performed;
`reviewedAcquisitionReceiptSha256` and
`reviewedAcquisitionTarballSha256` remain `null`,
`runtimeExecutionApproved` remains `false`, construction/runtime stay
inactive, and relevant `evidenceReview` values remain `not-performed`. No
Expected or `Observed` value was changed.

Next: perform the fresh independent Docker-free fixed-root result review under
`../../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md`;
do not run either producer, communicate externally, repair or retry the
occurrence, or update construction bindings.
