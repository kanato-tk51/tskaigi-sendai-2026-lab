# M3 harness and reports independent review record

## Review target

- Target: current uncommitted M3 harness/report implementation and its synthetic contract fixture
- Review type: independent read-only implementation review
- Reviewer implementation changes: none
- Review-owned changes: the review prompt, M3 milestone status metadata, and this review record only

## Gate decision

- Decision: `NOT APPROVED — BLOCKED`
- Blockers: B-01 through B-05
- Verification suite: passed, but does not exercise or close the blockers below
- Experiment-matrix Observed: unchanged and unmeasured

This decision does not approve M3 as a raw-to-derived regeneration gate. It also does not approve adapter ingestion, permissive/constrained profile evidence, experiment-matrix Observed results, presentation evidence, a commit, or publication.

## Findings

### B-01 — persisted raw input is insufficient for regeneration (`High`)

`collectRun` requires three inputs: snapshot, run completion, and segment bytes ([types.ts](../../packages/lab-cli/src/types.ts#L252), [collector.ts](../../packages/lab-cli/src/collector.ts#L67)). Run validity depends on completion facts such as scenario start/end, tool termination, timeout, hash finalization, and every segment close ([completion.ts](../../packages/lab-cli/src/completion.ts#L85)).

The persisted run writes the manifest snapshot, raw segments, and derived outputs, but does not persist the immutable `RunCompletion` input ([persistence.ts](../../packages/lab-cli/src/persistence.ts#L62)). The runner integration test fixes that incomplete file inventory as expected behavior ([runner.test.ts](../../packages/lab-cli/test/runner.test.ts#L62)). The determinism test invokes the collector twice with an in-memory completion object; it does not rebuild from a persisted run directory ([determinism.test.ts](../../packages/lab-cli/test/determinism.test.ts#L6)). There is also no reader/regeneration command for an existing run directory.

Acceptance impact: the M3 goal, M3 human-review gate, and raw-to-derived acceptance at [milestones.md](../milestones.md#L918) and [milestones.md](../milestones.md#L1005) are not met. After deleting derived files, a third party cannot determine whether the run was complete or reproduce `run-metadata.json` and the other derived bytes from the retained input.

Required follow-up: version and persist the complete immutable collector input, either inside an approved snapshot contract or in a separately approved completion snapshot; add a fail-closed directory reader/regenerator; preserve raw segment bytes rather than relying only on caller-provided strings; and test persist → remove derived files → regenerate → exact byte comparison, including completion tampering and incomplete runs.

### B-02 — reducer does not derive source/artifact hash deltas (`High`)

For M1 `file-hash` events, the reducer emits one record per event and always sets `changed: null` ([reducer.ts](../../packages/lab-cli/src/reducer.ts#L186)). The summary records only the number of hash records ([reducer.ts](../../packages/lab-cli/src/reducer.ts#L275)). The focused test contains only a `before` hash and explicitly expects `changed: null` ([collector.test.ts](../../packages/lab-cli/test/collector.test.ts#L100)). It does not pair manifest-declared before/after observations or report changed, unchanged, missing, or unavailable source/artifact state.

Acceptance impact: the reducer requirements in the protocol and M3 acceptance at [experiment-protocol.md](../experiment-protocol.md#L356) and [milestones.md](../milestones.md#L1006) are not met.

Required follow-up: define deterministic before/after pairing by validated producer, target, classification, and manifest hash position; fail closed or report unavailable for missing/duplicate/conflicting finalization evidence; keep tool API hashes separate; and add changed, unchanged, missing, failure, and permutation tests.

### B-03 — Expected/Observed comparison omits outcome and change semantics (`High`)

The versioned Expected schema can express only total events, event-kind counts, and route-phase counts ([types.ts](../../packages/lab-cli/src/types.ts#L27)). `metricComparisons` evaluates only those fields ([reducer.ts](../../packages/lab-cli/src/reducer.ts#L137)). Attempt outcome and tool-change outcome are present in the observed summary but cannot be declared as Expected or included in `comparison.matches`. The hash/tool-change test therefore reports an overall match without comparing either outcome ([collector.test.ts](../../packages/lab-cli/test/collector.test.ts#L100)).

Acceptance impact: an adapter run with the expected number of events but an unexpected `failure`, `skipped`, tool-change result, or hash state could still render `Expected/Observed match: yes`. This conflicts with the falsifiable Expected/Observed and mismatch-preservation contract in [experiment-protocol.md](../experiment-protocol.md#L346), and leaves the M3 report/reducer acceptance incomplete.

Required follow-up: version the scenario Expected contract to cover attempt type/outcome, tool-change kind/outcome, and approved hash expectations; report unexpected observed dimensions as mismatches; and test same-count/different-outcome cases while keeping valid mismatches `complete`.

### B-04 — structural validation is not exhaustive (`Medium`)

The plain-data boundary enumerates records and arrays with `Object.keys` ([safe-data.ts](../../packages/lab-cli/src/safe-data.ts#L10)). Extra non-enumerable own data properties or accessors are therefore ignored instead of rejected. A transparent `Proxy` can also pass the prototype/key/descriptor checks while its traps execute during validation; there is no proxy rejection. Current negative tests cover a custom prototype and one enumerable accessor only ([invalid.test.ts](../../packages/lab-cli/test/invalid.test.ts#L120)).

Acceptance impact: the explicit unknown-key/accessor structural-validation criterion at [milestones.md](../milestones.md#L999) is not fully met. Proxy trap execution also weakens the claim that untrusted structural input is copied without invoking caller behavior.

Required follow-up: reject proxies before reflection, inspect all own string and symbol keys and descriptors, reject every accessor and unexpected non-enumerable property, apply the same policy to arrays, and add negative tests at collection, snapshot, completion, segment metadata, and Expected boundaries.

### B-05 — run metadata omits required runtime context (`Medium`)

`CompleteRunMetadata` contains identity, validity, ordering, segment counts, and evidence locations, but no tool version, Node.js version, profile revision, container input, or segment-retention policy ([types.ts](../../packages/lab-cli/src/types.ts#L87)). The architecture requires these fields in `run-metadata.json` ([architecture.md](../architecture.md#L284)). The validated manifests/events already contain some tool and Node data, but the reducer does not project or cross-check it into metadata.

Acceptance impact: the versioned run-metadata deliverable is not complete against the architecture source of truth, and future profile or adapter runs would lack the context needed to interpret and reproduce the observation.

Required follow-up: define sanitized versioned runtime-context fields, use explicit not-applicable values for the synthetic fixture, cross-check producer consistency, and add schema/rendering tests before adapter/profile ingestion.

## Confirmed behavior

- The package has a fixed scenario-only CLI boundary and no arbitrary command, argv, cwd, module, or output-path option.
- The package root is import-safe in the reviewed source, and the package has no runtime tool dependency beyond `probe-core`.
- Producer segments are revalidated against their manifest context with LF, line, event, segment, canonical serialization, producer identity, and sequence checks.
- Deterministic producer ordering and `lab-canonical-event/v1` global sequence do not depend on timestamp or input record order, and the report states that the order is not causal or real-time.
- Missing, timeout, partial, corrupt, noncanonical, sequence-gap, and incomplete-close cases become `inconclusive` with unavailable counts and no canonical event/comparison/hash success output.
- Expected mismatch remains a complete run for the dimensions the current schema can express.
- The implementation does not update Expected files or `docs/experiment-matrix.md`, and synthetic results are explicitly separated from adapter/profile/presentation evidence.

## Acceptance summary

| Area | Review result |
|---|---|
| Fixed dispatch, dependency direction, import boundary | Satisfied by source inspection and focused tests |
| Segment validation, limits, context, sequence, partial rejection | Satisfied by source inspection and focused tests |
| Deterministic merge and non-causal global sequence | Satisfied for the synthetic input contract |
| Inconclusive semantics and no zero-count substitution | Satisfied for tested failures |
| Raw-to-derived regeneration from persisted input | Not satisfied — B-01 |
| Source/artifact hash delta | Not satisfied — B-02 |
| Complete Expected/Observed comparison | Not satisfied — B-03 |
| Exhaustive structural rejection | Not satisfied — B-04 |
| Versioned run-metadata runtime context | Not satisfied — B-05 |
| Matrix/profile/presentation evidence separation | Satisfied; Observed remains unmeasured |

## Verification

- `npm run m3:verify`: passed; typecheck, build, scoped static verifier, 6 test files, 17 tests.
- `npm run verify:static --workspace packages/probe-core`: passed; 19 source files, no reported failures; the verifier itself reports that it is not runtime-isolation proof.
- `npm run check`: passed; formatting, lint, root typecheck, 67 test files, 324 tests.
- `git diff --check`: passed after adding this review record.
- `git status --short`: recorded after adding this review record; the M3 implementation remains uncommitted.

`npm run m3:run:fixture` was not run because it is not in the independent-review verification list and would create ignored disposable output. The runner integration test exercised the same persistence path under a disposable `/tmp` root and cleaned it afterward.

## Remaining limitations

- Multi-file persistence is exclusive but not transactional. A later write failure can leave a partial run directory that cannot be retried under the same run ID.
- Limits are enforced per segment, but the public collector has no explicit run-global producer, event, or byte cap. The fixed scenario currently bounds this operationally to two producers.
- The M3 static verifier is scoped string/source inspection and the import test observes a narrow filesystem condition; neither is a runtime sandbox proof.
- The synthetic fixture does not execute an adapter, compare profiles, or produce experiment-matrix Observed evidence.

## Follow-up boundary

Use a dedicated M3 remediation task limited to the persisted input/regenerator, reducer/report schemas, plain-data validation, run metadata, and their tests. Do not add adapter integration, profile execution, matrix Observed updates, artifact pipeline work, or publication in that task. After remediation, rerun this independent review before starting M4.

## Safety statement

This review did not use external network hosts, real credentials, Docker or its socket, host lifecycle execution, remote Git operations, or environment-variable enumeration. Verification used repository-owned tests and loopback/disposable test resources only.
