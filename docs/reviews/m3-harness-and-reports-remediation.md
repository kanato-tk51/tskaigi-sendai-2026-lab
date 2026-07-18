# M3 harness and reports remediation independent re-review record

## Review target

- Target: current uncommitted M3 remediation for original findings B-01 through B-05
- Review type: independent read-only remediation re-review
- Reviewer implementation changes: none
- Review-owned changes: the remediation review prompt, this review record, and M3 gate status metadata only
- Historical record: the original `NOT APPROVED — BLOCKED` decision remains in [M3 harness and reports independent review](m3-harness-and-reports.md)

## Gate decision

- Decision: `APPROVE WITH NON-BLOCKING FOLLOW-UPS`
- Original blockers: B-01 through B-05 closed
- New blockers: none
- Critical / High / Medium findings: none
- Experiment-matrix Observed: unchanged and unmeasured

This decision approves the M3 synthetic harness/report boundary and its raw-to-derived regeneration gate. It does not approve adapter ingestion, permissive/constrained profile evidence, experiment-matrix Observed results, presentation evidence, a commit, or publication.

## Original blocker closure

| Original finding | Decision | Closure evidence |
|---|---|---|
| B-01 — persisted raw input is insufficient for regeneration | Closed | The versioned inventory now retains canonical manifest and completion snapshots plus copied raw segment bytes ([constants.ts](../../packages/lab-cli/src/constants.ts#L1), [collector.ts](../../packages/lab-cli/src/collector.ts#L45), [persistence.ts](../../packages/lab-cli/src/persistence.ts#L198)). The owned-root reader rejects invalid inventory, non-regular/symlinked or oversized input, noncanonical JSON, and run-ID mismatch before collection. Regeneration writes only derived outputs after revalidation ([persistence.ts](../../packages/lab-cli/src/persistence.ts#L309)). Integration coverage persists a run, removes every derived file, regenerates exact bytes, and confirms raw segment bytes are unchanged; separate cases cover completion schema tampering, an incomplete timeout result, symlinked raw input, and unexpected inventory ([runner.test.ts](../../packages/lab-cli/test/runner.test.ts#L56)). |
| B-02 — reducer does not derive source/artifact hash deltas | Closed | The reducer builds manifest-declared file-hash pairs by producer and target, records before/after positions separately, rejects duplicate declarations or observations, and emits `changed`, `unchanged`, or `unavailable`; tool API change remains a distinct evidence kind ([reducer.ts](../../packages/lab-cli/src/reducer.ts#L296)). Tests cover unchanged, changed, failed/unavailable, missing-after, duplicate-before, and separated tool evidence ([collector.test.ts](../../packages/lab-cli/test/collector.test.ts#L133)). |
| B-03 — Expected/Observed comparison omits outcome and change semantics | Closed | Scenario v2 Expected includes event kind, route phase, attempt type/outcome, tool-change kind/outcome, and hash state/count ([types.ts](../../packages/lab-cli/src/types.ts#L22), [scenario.ts](../../packages/lab-cli/src/scenario.ts#L47)). Comparison uses the union of Expected and Observed outcome/hash dimensions, so unexpected observations are explicit mismatches while the run remains complete ([reducer.ts](../../packages/lab-cli/src/reducer.ts#L163)). Tests cover same-count/different-outcome and hash-state mismatches ([collector.test.ts](../../packages/lab-cli/test/collector.test.ts#L185)). |
| B-04 — structural validation is not exhaustive | Closed | Record and array readers reject proxies, symbols, custom prototypes, every accessor descriptor, holes, and extra enumerable or non-enumerable own properties before copying values ([safe-data.ts](../../packages/lab-cli/src/safe-data.ts#L12)). Segment bytes reject proxies and are copied to a fresh `Uint8Array` before parsing ([collector.ts](../../packages/lab-cli/src/collector.ts#L45)). Negative tests exercise root proxy, typed-array proxy, custom prototype, enumerable/non-enumerable accessors, and hidden unknown fields at snapshot, completion, segment metadata, Expected, and array boundaries ([invalid.test.ts](../../packages/lab-cli/test/invalid.test.ts#L140)). |
| B-05 — run metadata omits required runtime context | Closed | Run metadata v2 records explicit synthetic profile/container values, immutable segment retention, and producer-scoped adapter, Node, and tool identity/version ([types.ts](../../packages/lab-cli/src/types.ts#L107), [reducer.ts](../../packages/lab-cli/src/reducer.ts#L453)). Producer events with inconsistent Node versions make the run inconclusive. Exact metadata and inconsistency behavior are covered in collector tests ([collector.test.ts](../../packages/lab-cli/test/collector.test.ts#L44), [collector.test.ts](../../packages/lab-cli/test/collector.test.ts#L263)). |

## Acceptance summary

| Area | Re-review result |
|---|---|
| Raw byte validation and immutable input inventory | Satisfied for the fixed owned-root contract |
| Exact raw-to-derived regeneration | Satisfied for complete output; incomplete regeneration produces only inconclusive metadata and summary |
| Source/artifact hash delta and tool-change separation | Satisfied |
| Complete Expected/Observed semantic comparison | Satisfied for scenario v2's declared aggregate dimensions |
| Exhaustive structural rejection at M3 boundaries | Satisfied by source inspection and negative tests |
| Versioned runtime context | Satisfied for the synthetic contract |
| Fixed dispatch, import safety, and dependency direction | No regression found |
| Invalid/incomplete fail-closed behavior | No regression found |
| Matrix/profile/presentation evidence separation | Satisfied; Observed remains unmeasured |

## Non-blocking follow-ups

| ID | Severity | Follow-up | Why it does not block this gate |
|---|---|---|---|
| F-01 | Low | Before ingesting adapter scenarios with multiple targets in the same classification, decide whether Expected hash comparison must identify individual targets. Scenario v2 currently compares aggregate evidence-kind/classification/state counts, while `hashes.json` retains producer and target identity. | Aggregate hash state/count is the approved M3 remediation contract, and the fixed synthetic gate does not claim target-specific comparison. |
| F-02 | Low | Make persistence/regeneration transactional or define recovery for a partially written derived inventory. Regeneration currently requires all derived files to be absent, and a later exclusive-write failure can leave earlier files behind. | Exclusive creation prevents overwrite, and this limitation was already accepted for the disposable single-writer M3 boundary. |
| F-03 | Low | If evidence authenticity or hostile concurrent filesystem mutation enters scope, add a stronger storage/trust model. Current canonical path, inventory, `lstat`, identity, and size checks are not cryptographic tamper evidence and do not eliminate every path race. | The approved contract uses a cooperative repository-owned disposable directory and does not claim an OS filesystem sandbox or authenticity proof. |
| F-04 | Follow-up | Keep the scoped static verifier and synthetic fixture described as contract guards, not adapter/profile execution or runtime-isolation proof. | Adapter ingestion, profile enforcement, and matrix Observed evidence are explicitly M4/later work. |

These follow-ups do not block the M3 gate and were not implemented during re-review.

## Verification

- `npm run m3:verify`: passed; typecheck, build, scoped static verifier, 6 test files, 24 tests.
- `npm run verify:static --workspace packages/probe-core`: passed; 19 source files, no reported failures; the verifier states that it is not runtime-isolation proof.
- `npm run check`: passed; formatting, lint, root typecheck, 67 test files, 331 tests.
- `git diff --check`: passed.
- `git status --short`: captured after this review record was finalized; the M3 implementation and review-owned files remain uncommitted.

`npm run m3:run:fixture` was not run because it is outside the re-review verification list and would create ignored disposable output. The runner integration tests exercised persistence and regeneration under disposable `/tmp` roots and cleaned them afterward.

## Remaining limitations

- The approved regenerator is fixed to an owned run root and validated run ID; it is not an arbitrary-directory recovery tool.
- Runtime-context profile and container values are intentionally `not-applicable` for the synthetic fixture. Real profile/container evidence remains unmeasured.
- No adapter output is ingested, and no experiment-matrix Observed result or presentation evidence is produced by this gate.
- Global sequence remains deterministic ingestion order, not causal or real-time order.

## Follow-up boundary

M3 is ready to hand off to the separately scoped M4 profiles milestone. M4 must preserve the distinction between this synthetic contract gate, adapter-local evidence, profile enforcement evidence, and experiment-matrix Observed results. F-01 should be resolved before a multi-target adapter scenario relies on target-specific Expected hash semantics.

## Safety statement

This re-review did not use external network hosts, real credentials, Docker or its socket, host lifecycle execution, remote Git operations, or environment-variable enumeration. Verification used repository-owned tests and disposable local test directories only.
