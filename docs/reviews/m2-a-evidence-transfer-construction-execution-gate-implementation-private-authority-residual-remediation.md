# M0/M2-A private-authority residual-remediation re-review

## Review target and decision

- Target: frozen-research issue #43's bounded M2A-CGI04 private-authority
  residual-remediation candidate
- Review type: fresh independent Docker-free read-only re-review
- Review prompt:
  [m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation-review.md)
- Decision: **BLOCKED on one remaining M2A-CGI04 held-child-identity
  transaction finding; no acquisition, construction, image, Docker, runtime,
  transfer, or result task is approved**
- Closed in this review: first-cause compiler/Docker process settlement and
  implementation-scope M2A-CG02/M2A-CG03
- Preserved closed: M2A-CGI01 through M2A-CGI03 and M2A-CG01
- Still open: M2A-CGI04 and implementation-scope M2A-CG04 through M2A-CG06
- Source or test repair performed in this review: none

The same first-cause state machine is consumed by both fixed child helpers and
its separately branded fake trace. It retains the first failure and first exit
tuple, requires the identical later close and complete descriptor settlement,
and bounds every non-close branch. The held-directory remediation also closes
the original held-inode/path-inode contradiction and rejects the represented
parent identity, metadata, inventory, copy, marker, and post-operation drifts.

One narrower transaction gap remains. A permitted directory transition checks
the parent identity and before/after entry names and types, but it discards the
captured child identity maps before validation and then adopts the complete
post-operation child map. An unrelated existing child can therefore be
replaced during an otherwise permitted transition without rejection. The fake
trace exposes only parent identity plus entry names/types, so it cannot submit
that contradiction. This keeps M2A-CGI04 and the runtime/result/negative-
coverage gates open.

Standing authorization was not needed or used. This review did not execute a
production entry, access a fixed ignored root or runtime/result state, acquire
npm or toolchain bytes, construct a context or image, call Docker, spawn a
compiler, signal a child, execute a lifecycle or transfer, use external
communication, or promote evidence.

## Reproduced identities and allowlist

The review opened the exact repository-controlled input rows read-only with
`O_NOFOLLOW`, required stable BigInt descriptor identity and one-link regular
files before and after each read, settled all 72 descriptor closes, and
reproduced:

```text
31 rows: sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04
41 rows: sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526
```

The current implementation, declaration, verification, test, and saved-prompt
identities reviewed at this decision are:

| Path | SHA-256 |
| --- | --- |
| `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` | `2abc43a27a545bf8af1498eda2d99e2a1e36cdbb66a23dec3c20e02b78c39b06` |
| `experiments/npm12-install/scripts/m2a-transfer-construction.d.mts` | `d23d45937208d967b309b4e460a3f09f107804aa1bb474a7869c55ffb7befea5` |
| `experiments/npm12-install/scripts/m2a-transfer-production.mjs` | `ae449aed61c9160e6a423a5a56efdeef15f74e542092dfc710cdcc1545f4ac92` |
| `experiments/npm12-install/scripts/m2a-transfer-production.d.mts` | `c73d15ab0bf6dc86349dea3fad0e418d0f6f8b2f11faab9666df99b36177cb20` |
| `experiments/npm12-install/scripts/construct-m2a-transfer-context.mjs` | `9844425a5daa7391ecd7cbddd96be11e49ddfe35f4d9b5a7e176f2abd3200e20` |
| `experiments/npm12-install/scripts/build-m2a-transfer-image.mjs` | `b9259c7e5209b2765626d659124d520e0b789e71272e3528936de24ee04d3234` |
| `experiments/npm12-install/scripts/execute-m2a-transfer.mjs` | `512fe46c3708e57243a41526d9f599a6fc9d1bff962fdd4144dc20410fc198cf` |
| `experiments/npm12-install/scripts/m2a-transfer-lib.mjs` | `1940a9b2c6256cd8386fbe3a020bb05357242fb9590c2559e4058f60a8a8388a` |
| `experiments/npm12-install/scripts/m2a-transfer-lib.d.mts` | `770a06a4346880b6ee9b202dadae13a3f5f73ca39f439dfb4415d33d6afca885` |
| `experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs` | `24a44e4b00a5dc9b8702b94fce0eb821843fd8b24d47cc6f4afa38819805a6dc` |
| `tests/m2a-evidence-transfer.test.ts` | `9c429818f0861b2b2668f46f8b446dc3ba5bb18e132cbed6d2e975fbe0b77201` |
| `prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation.md` | `d4281718587b42b1b3a16488dd912e836da74523875182ece2bcc65eb2e6734b` |
| `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation-review.md` | `0fef714937d10294f4d29f4fe8a30c3ae619514cb4e02e8fb5360a1cd722b2c6` |

The six remediation paths remain inside the unchanged M2A-CG06 allowlist.
The three fixed production authority constructors and brands remain private,
absent from declarations, package scripts, and tests, and reachable only
behind the unchanged fail-closed entry gates. Future digests and the image ID
remain `null`, approvals remain `false`, and every `evidenceReview` remains
`not-performed`.

## Process-settlement decision

Both `runFixedCompiler()` and `runFixedDockerCommand()` call
`createM2aPrivateProcessSettlementState()`. The fake-only process trace calls
the same state machine, is protected by a distinct weak brand, and accepts no
executable, argv, cwd, environment, path, child handle, or production brand.

An independent in-memory matrix reproduced twelve failure branches:

- synchronous spawn failure;
- asynchronous error followed by `close(0, null)`;
- nonzero first exit followed by `close(0, null)`;
- zero exit followed by inconsistent close;
- timeout, output overflow, and signal-delivery failure followed by otherwise
  successful late exit/close;
- close without exit, exit without close, descriptor uncertainty, conflicting
  duplicate exit, and no-event final bound.

Every branch retained its first failure, settled, cleared each owned timer no
more than once, and returned `successful: false`. The exact zero/null exit and
identical close with child/stdout/stderr closure succeeded; a later error was
ignored only after final settlement. The state machine preserves the fixed
primary deadlines, 250 ms TERM-to-KILL grace, 1,000 ms final-close bound,
combined output limits, executable/argv/cwd/environment, `shell: false`, and
no-retry/no-cleanup behavior. Call-site inspection confirmed unsuccessful
compiler settlement precedes compiler inventory/phase advance and
unsuccessful Docker settlement precedes observation, copy validation, or
directory-transition completion.

This closes the process half of M2A-CGI04 and closes M2A-CG02 and M2A-CG03 at
the Docker-free static/unit cooperative-host implementation boundary. No real
child or timer wait was used as evidence.

## Held-directory/path decision

The production backend holds repository/result ancestors, result,
`transfer/`, and conditional marker-parent directories before use. It compares
held-descriptor and no-follow pathname identities by exact type, full mode and
special-bit absence, effective owner, link count, and BigInt device/inode/
size/mtime. Inventory capture correlates before and after `readdir` and child
classification. Attempt writes use one exclusive no-follow descriptor for
write/sync/reread/close, rename is bracketed by held-result transitions, and
the already held result descriptor performs directory sync. Copy and marker
operations similarly use exact parent inventories and held directory sync.

An independent fake matrix accepted one exact publication transition and
rejected fourteen represented contradictions before `after:0`: path inode
replacement, device, owner, group, lower mode, special bit, link count,
missing/extra/reordered/duplicate inventory, symlink/special child, and copy or
marker substitution. Stable-inventory size/mtime drift also rejected. These
results reproduce the original held inode `1` / path inode `2` stop and the
parent-level operation barriers.

### Residual M2A-CGI04 finding: unchanged child identities are broadly adopted

`captureProductionDirectorySnapshot()` returns both the exact entry list and
a `children` map containing each child's type, full mode, owner, link count,
and BigInt identity. `completeHeldProductionDirectoryTransition()` passes that
snapshot to `assertProductionDirectoryTransition()`, but that function reduces
both snapshots to only parent `identity` and entry names/types. It never calls
`sameChildIdentityMap()` across the permitted transition. After those reduced
checks pass, it assigns the entire `after.children` map to `held.children`.

A controlled transition illustrates the gap:

```text
before: parent inode P; completion.json -> child inode 10
operation: add segment.json
after:  parent inode P; completion.json -> child inode 11; segment.json -> inode 12
```

With the expected before/after entry names and types and allowed parent
size/mtime change, the current transition accepts and adopts inode `11` even
though the operation was authorized only to add `segment.json`. The next exact
inventory compares against the already adopted map and cannot recover the
contradiction. The same gap applies to an unrelated prior attempt/copy child
during attempt publication, a later copy, or marker-parent mutation.

The separately branded fake held-directory trace cannot reproduce this
negative: its public snapshot shape contains only parent identity and entry
names/types. Its current duplicate-name case tests lexical aliasing, not a
same-name child device/inode/link replacement. Thus the fake boundary does not
exercise the production `children` map that the finding concerns.

This is narrower than the original parent-path finding, which is closed. It is
nevertheless broad post-operation identity adoption rather than an operation-
specific transition, so M2A-CGI04 remains open. The smallest repair must retain
the exact identities of every unchanged child, authorize identity change only
for the one operation-specific destination, and expose the same child-identity
comparison through the fake trace with sibling replacement/hardlink-alias
negatives.

## Decision status

| Item | Re-review decision |
| --- | --- |
| M2A-CGI01 — exact input closure | **CLOSED; preserved** |
| M2A-CGI02 — row-local image observation/binding | **CLOSED; preserved** |
| M2A-CGI03 — exact runtime settlement branches | **CLOSED; preserved** |
| M2A-CGI04 — complete fixed private authority | **OPEN only on unchanged-child identity adoption and matching fake coverage** |

| Item | Implementation-scope decision |
| --- | --- |
| M2A-CG01 — immutable source/acquisition closure | **CLOSED; preserved** |
| M2A-CG02 — deterministic construction manifest | **CLOSED at Docker-free static/unit scope** |
| M2A-CG03 — offline one-build image identity | **CLOSED at Docker-free static/unit scope** |
| M2A-CG04 — production entry/one-shot lifecycle | **BLOCKED by residual M2A-CGI04 runtime transaction** |
| M2A-CG05 — failure/result/evidence separation | **BLOCKED by residual M2A-CGI04 result identity** |
| M2A-CG06 — allowlist/negative coverage/import safety | **BLOCKED by missing unchanged-child fake/production negative** |

M2A-CGR01 through M2A-CGR03 remain closed at contract scope. M2A-TR01 through
M2A-TR06 remain closed only at their earlier Docker-free static/unit transfer
scope. No later issue #43 execution or evidence gate opens.

## Verification observed

| Command | Observed result |
| --- | --- |
| `git status --short --branch` and scoped source inspection | Existing accumulated dirty worktree inventoried and preserved; no cleanup or reset. |
| Independent fake-only process/held-directory matrix | 12 process failures, one process success, 14 represented directory contradictions, one directory success, and both fake-brand rejections behaved as described. |
| Descriptor-controlled aggregate script | The first diagnostic invocation incorrectly concatenated the 31-row source list with the already complete 41-row construction list and rejected its own 72-row aggregate; the corrected invocation reproduced exact 31/41 aggregates and closed all 72 descriptors. |
| `sha256sum` over eleven implementation/verification paths and the saved prompt pair | Recorded the thirteen current identities above. |
| `npm run m2a:transfer:verify` | Exit `0`; static verifier passed and 1 file / 46 tests passed. |
| `npm run m2a:verify` | Exit `0`; adapter typecheck/build/static passed and 4 files / 5 tests passed. |
| `npm run typecheck` | Exit `0`; root no-emit typecheck passed. |
| `npm test` | Exit `1`; 108 files / 848 tests passed and one out-of-scope M4 test failed at `containers/profile-control/test/control-host-backend.test.ts` with `M4_CONTROL_PATH`. The failure was recorded without repair or retry. |
| `npm run check` | Exit `1`; aggregate checking stopped at the out-of-scope formatting warning for `containers/profile-control/test/control-host-backend.test.ts` before lint/typecheck/test. |
| Focused Prettier check over the exact remediation allowlist, prompt pair, this review, and changed status paths | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error reported in the accumulated tracked diff. |

The review intentionally did not run `m0:doctor`, `m0:build`, `m0:run`,
`m0:verify`, a production entry, Docker, npm acquisition/install/pack/approve/
rebuild, a compiler, a lifecycle, a transfer, a result validation, cleanup,
retry, or evidence promotion. Passing checks remain Docker-free static/unit
and cooperative-host evidence. Pre/post correlation reduces but does not
eliminate same-authority path-swap or mount races and is not an OS filesystem
sandbox.

## Next boundary

Save one prompt-first bounded Docker-free residual-remediation and fresh
independent re-review pair. The repair may address only operation-specific
unchanged-child identity preservation and corresponding fake trace coverage
inside the existing six-path subset. It must not acquire bytes, execute a
production entry, construct a context/image, call Docker, or access runtime or
result state.

Next: save the exact bounded Docker-free M2A-CGI04 unchanged-child-identity
residual-remediation prompt and fresh independent re-review prompt; do not
repair source or tests in that prompt-only task.
