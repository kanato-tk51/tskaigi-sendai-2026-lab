# M0/M2-A issue #43 evidence-transfer contract review

## Review target and decision

- Target: issue #43 M2-A fresh evidence-transfer contract review
- Review type: fresh independent Docker-free read-only contract review
- Review prompt: [m2-a-evidence-transfer-contract-review](../../prompts/reviews/m2-a-evidence-transfer-contract-review.md)
- Decision: **APPROVED for exactly one bounded Docker-free static/unit implementation**
- M2A-TR01 through M2A-TR06: **all closed at contract scope**
- Blocking findings: none
- Non-blocking findings: none
- Implementation or execution performed in this review: none

This review does not approve Docker runtime execution, image construction,
transfer, result acceptance, profile/matrix `Observed`, M3 ingestion, or any
runtime claim. It approves only one later Docker-free static/unit
implementation under the same allowlist recorded in the contract's
`M2A-TR06` section.

## Reviewed evidence and identity reproduction

I reproduced and recorded the contract-owned identities and bounds without
filesystem writes:

- 31-file current fixed input set, in contract order:
  - `package-lock.json`
  - `packages/probe-core/package.json`
  - `packages/npm-lifecycle-probe/package.json`
  - `packages/npm-lifecycle-probe/fixture/consumer/package.json`
  - `packages/npm-lifecycle-probe/fixture/dependency/package.json`
  - all `packages/npm-lifecycle-probe/src/**/*.ts` and
    `packages/probe-core/src/**/*.ts` paths, lexically sorted
- Aggregate SHA-256 of the 31 rows (including path and LF):
  `4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04`
- Fixed run generation: `20260721-01`
- Fixed run ID: `m2a-npm-lifecycle-20260721000000000000000000000001`
- Fixed run-result root/container names/volume names from contract table
- M2-A manifest/runtime constants in source:
  - `scenarioId`: `m2a-npm-lifecycle`
  - `route`: `npm-install-lifecycle`
  - `phases`: exact single phase `install-lifecycle`
  - `triggerTypes`: `["automatic"]`
  - route-count: 1
  - attempt-count: 6
  - tool-api-count: 0
  - `runId` regex: `m2a-npm-lifecycle-[0-9a-f]{32}`
  - fixed env bindings: run ID, run root, loopback port, environment key

## M2A-TR decision summary

| Item | Decision at reviewed scope |
|---|---|
| M2A-TR01 — fixed fresh generation and immutable historical boundary | **CLOSED** |
| M2A-TR02 — exact M0-to-M2-A occurrence and input closure | **CLOSED** |
| M2A-TR03 — named-volume, container, and process settlement | **CLOSED** |
| M2A-TR04 — completion publication and official-tool transfer | **CLOSED** |
| M2A-TR05 — result classification and evidence class separation | **CLOSED** |
| M2A-TR06 — bounded later implementation and negative tests | **CLOSED** |

### M2A-TR01 — fixed fresh generation and immutable historical boundary

The fixed tuple, ignored root, fixed container names, and named volume are
consistently stated in the contract and do not conflict with earlier M0/M2-A
recorded identifiers. The read-only review observed no source evidence that would
broaden, reuse, or mutate historical run IDs, container names, volume IDs, or
generation IDs. The proposal remains single-attempt and retry-free.

### M2A-TR02 — exact M0-to-M2-A occurrence and input closure

The reviewed adapter source preserves the fixed M0 facts (Node.js `v24.18.0`,
npm `12.0.1`, local tarball install model, and approved-rebuild flow) and keeps
them separated from this fresh occurrence. `packages/npm-lifecycle-probe` remains
an import-safe, fixed command entry path with fixed `PROBE_CANARY_M2A_*` inputs.
The contract’s fixed attempt contract remains separate from adapter output/result
reuse.

### M2A-TR03 — named-volume and process settlement

The contract and supporting architecture documents uniformly require a dedicated
named volume and fixed lifecycle split (initializer then measurement), no bind
mounts, and natural-exit-only transfer predicate. No implementation step in this
review changes those values. A fixed read-only transfer plan is not accepted as a
replacement for the failed M0 tmpfs copy model.

### M2A-TR04 — completion publication and transfer

The published completion contract, one-file-at-time `docker cp` list, descriptor
re-open policy, and marker/segment consistency checks are internally consistent
as a transport boundary and are not internally contradicted by adapter source.
No raw canary content, container output, or host absolute path is recorded in
transport artifacts under review scope.

### M2A-TR05 — result classification and evidence boundaries

The distinction between contract intent, static/unit facts, and runtime outcome
remains enforced:
- Historical M0 evidence remains unchanged and not promoted.
- Completion/attempt schemas remain distinct and bounded.
- `evidenceReview: "not-performed"` remains a contract placeholder.
- `Observed` promotion and presentation claims remain outside this task.

### M2A-TR06 — bounded later implementation

The allowlist in `docs/m2-a-evidence-transfer-contract.md` is internally
closed, and this review did not detect a scope extension in the already listed
paths. Because all TR items are closed at contract scope, one bounded
Docker-free static/unit implementation is the next controlled step.

## Evidence classes and remaining limitations

- This review is contract evidence only.
- No Docker, no lifecycle execution, no transfer copy/run, no result root read,
  no retained state mutation, no Remote Git, and no external network was used.
- SHA-256 identity establishes the reviewed byte identities only; it does not
  establish runtime enforcement authenticity.
- Existing M0 `docker cp` tmpfs gap and all later runtime claims remain immutable.
- Result transfer still awaits its separate implementation/gate/review cycle.

## Verification observed

| Command | Observed result |
|---|---|
| `git status --short` | Read-only worktree inventory; unrelated user/session changes detected; no review-time source mutation. |
| 31-file identity reproduction command (ordered `sha256sum` rows + aggregate hash) | Counted `31` rows, aggregate hash matched contract: `4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04`. |
| `sha256sum` on `docs/m2-a-evidence-transfer-contract.md`, `prompts/reviews/m2-a-evidence-transfer-contract-review.md`, and `docs/m2-a-npm-lifecycle-adapter.md` | Recomputed identities matched review-local inspection; these were used for bounded status evidence only. |

No runtime execution commands were run in this review. Standing authorization was
not needed because no execution gate was under review.

## Decision and next task

Issue #43 contract review is complete and closed at contract scope. A single
bounded Docker-free static/unit implementation may proceed under the exact
`M2A-TR06` allowlist, followed by the exact implementation-review prompt and
review cycle.

Next: save the exact bounded Docker-free M2-A issue #43
implementation prompt and perform its implementation under that allowlist.
