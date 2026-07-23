# M3 production raw-to-derived collector implementation-remediation re-review

## Review target and decision

- Target: frozen-research issue #47's bounded implementation remediation for
  the codegen `observe` v3 raw-to-derived collector
- Review type: fresh independent Docker-free read-only remediation re-review
- Decision: **`APPROVED`**
- Closed at Docker-free static/unit implementation scope: M3-PC01 through
  M3-PC06
- New findings: none
- Implementation or verification changes made by this review: none
- Review-owned changes: this record and four minimal status/handoff updates

The remediation closes both findings from the first implementation review. The
pure collector now compares the exact locally frozen 12-event identity sequence
before its existing per-kind semantic and hash comparisons. Every successful
directory, raw-file, and staged-file open is also registered in the owned
close-settlement set before its first injected post-open checkpoint or
descriptor `stat()`.

This approval is limited to Docker-free static/unit implementation evidence. It
does not approve or perform collector activation, adapter ingestion, a runtime
identity or command, a result review, Docker access, or any `Observed`
promotion.

## Finding decisions

| ID | Decision | Independent re-review result |
| --- | --- | --- |
| M3-PC01 | **Closed** | `CODEGEN_EXPECTED_EVENT_ORDER` fixes all 12 cross-kind route, capability-attempt, and tool-change identities in M2-E order. `comparisonRecords()` compares the accepted segment at each producer-sequence position before retaining the existing ordered route, attempt, tool, and hash comparisons. The focused permutation renumbers a producer-sequence-valid 12-event segment, remains complete, keeps every per-kind record matching, and is nevertheless an explicit Expected mismatch. The additive v3/v2, fixed manifest, profile outcome, before-only source, and skipped-tool boundaries are unchanged. |
| M3-PC02 | **Closed** | Initial capture and R1/R2 still use the originally held raw descriptors for positioned exact-byte reads, immediate EOF, and SHA-256, separately from descriptor/path/ancestor BigInt identity checks. No raw reopen, path-derived content read, or checkpoint weakening was introduced. |
| M3-PC03 | **Closed** | `openHeldDirectory()`, `openHeldRawFile()`, and `createStagedFile()` construct and push the new owned record immediately after `open()` and before the new post-open checkpoint and first `handle.stat()`. Injected failure at that boundary reaches the deterministic close loop. Existing private staging, R2, result preconstruction, all-handle settlement, and final rename ordering remain intact; successful rename is still the final awaited/fallible operation before returning the preconstructed result. |
| M3-PC04 | **Closed** | Focused behavior injects the first post-open failure for one instance of each helper family and proves the just-opened label reaches `before-close`, raw bytes remain unchanged, `derived/` is absent, and staging is absent or retains only the exact reached partial inventory. The existing R1/R2 mutation, path/ancestor/staging drift, every close label, rename failure, inventory/type/mode/link, sanitization, raw-preservation, no-cleanup, and no-retry matrix remains green. |
| M3-PC05 | **Closed** | No adapter, historical input, runtime result, profile/matrix/presentation record, or other `Observed` value was added or accessed. `derived.staging/` remains non-evidence, the filesystem entry remains absent from the package root, and the public root exports only the pure byte-taking v3 validation/collection boundary. |
| M3-PC06 | **Closed** | The remediation changes only `codegen-production.ts`, its focused test, and the M3 static verifier within the unchanged allowlist, plus saved prompts and status records. Static verification binds the literal 12-entry order and all three open/register/checkpoint/stat topologies. No CLI, runner, fixture, package manifest/script/export-map, adapter, probe, container, compiled-output, production-result, or runtime edge changed. |

## Event-order evidence

The frozen cross-kind order is the three opening routes, six capability
attempts in the fixed environment/file-read/file-hash/direct-write/loopback/
child order, the tool change, and the file-write/completion routes.

The remediation comparison projects each accepted `ProbeEvent` to its
kind-qualified identity and emits 12 `event-order:<index>` records. The focused
case moves the final two route events ahead of the six attempts and tool event,
then restores canonical producer sequence `0..11`. Probe-event validation and
all 5/6/1 per-kind semantic/hash comparisons remain valid, while the new order
records make the overall complete result mismatch. This directly observes the
former M3-PC01 gap without importing the codegen package or a P2 receipt.

## Descriptor ownership and transaction evidence

For each of the three helper families, source and static inspection reproduce
this exact topology:

```text
await open(...)
  -> construct HeldObject with status null
  -> handles.push(held)
  -> await after-open checkpoint
  -> await held.handle.stat(...)
```

The outer collector catch always calls `settleHandles(handles, control)`, so a
failure at the checkpoint settles the newly owned descriptor together with all
earlier owned handles. The focused cases cover `raw-directory`, `raw-manifest`,
and `staged-run-metadata.json`; the staged case retains only the four names
reached at that boundary, including the exclusively created staged file, and
performs no cleanup or retry.

The accepted transaction remains: raw-only capture, pure render, R1, exclusive
private staging, exact writes/sync/read-back/identity, R2, staged revalidation,
directory sync, immutable result preconstruction, deterministic settlement of
all 12 handles, and one staging-to-derived rename. No `await`, validation,
close, cleanup, serialization, classification, or callback follows successful
rename.

## Changed-path and activation boundary review

The complete issue #47 implementation remains within the approved M3-PC06
paths: `constants.ts`, `types.ts`, `safe-data.ts`, `index.ts`, the new internal
`codegen-production.ts`, two new scenario definitions, `results/runs/README.md`,
the M3 static verifier, and the new focused test. The current remediation itself
touches only the internal production module, focused test, and static verifier.
The remaining allowlisted M3 files have no issue #47 working-tree change.

The package manifest, CLI/runner/fixture, codegen adapter, probe-core source,
container/profile source, compiled output, runtime roots, matrix, evidence map,
and presentation records are outside this change. Existing unrelated M4 and
presentation working-tree changes were preserved and were not used as issue
#47 evidence.

## Verification observed

| Command | Observed result |
| --- | --- |
| `npm run m3:verify` | Exit 0; M3 typecheck and build passed, scoped static verification passed, and 9 test files / 54 tests passed. |
| `npm run verify:static --workspace packages/probe-core` | Exit 0; 19 source files checked with no failure. The command explicitly states that static inspection is not runtime-isolation proof. |
| `npm run typecheck` | Exit 0. |
| `npm test` | Exit 0; 108 test files / 803 tests passed. |
| `npm run check` | Exit 1 at `format:check`; only pre-existing out-of-scope `containers/profile-control/test/control-host-backend.test.ts` was reported. Later aggregate stages did not run. |
| `npm run lint` | Exit 1 with 11 errors, all in pre-existing out-of-scope `containers/profile-control/scripts/verify-static.mjs`. |
| `git diff --check` | Exit 0 after this review and its status updates. |

The aggregate root check is not recorded as passing. Its two independently
reproduced failure sets are outside the M3-PC06 allowlist and were not edited by
this review.

## Remaining limitations and safety statement

- This is Docker-free static/unit evidence, not an adapter occurrence,
  production collector activation, profile enforcement result, runtime result,
  or `Observed` evidence.
- SHA-256 establishes byte identity, not authenticity or semantic harmlessness.
- The cooperative repository-owned Linux filesystem, hostile same-UID race,
  and no power-loss durability limitations remain unchanged.
- `npm run m3:run:fixture`, adapters, probes, lifecycle fixtures, production
  collection, Docker/runtime sockets, retained/historical/result roots,
  cleanup, retry, publication, deployment, Remote Git, external network,
  credentials, and third-party communication were not used.
- Standing authorization was not needed or used because this review crossed no
  execution approval gate.

Issue #47 is complete only at the reviewed Docker-free static/unit boundary.
The next ordered backlog item is issue #43, beginning with a new-generation
Docker-free evidence-transfer contract; execution remains a later gate.

Next: define issue #43's first Docker-free new-generation M0/M2-A evidence-
transfer contract and save a fresh independent contract-review prompt; do not
execute a transfer in that task.
