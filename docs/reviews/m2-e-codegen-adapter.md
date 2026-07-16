# M2-E code-generation CLI adapter independent review record

## Review target

- Target: the uncommitted M2-E adapter implementation and its fixed local contract runs
- Review type: independent read-only implementation review with documentation-consistency closure
- Reviewer source changes: none; the closure updated only documentation/status metadata and this record

## Gate decision

- Decision: `APPROVE WITH NON-BLOCKING FOLLOW-UPS`
- Blockers: none after B-01 closure
- Resolved blocker: B-01
- Experiment-matrix Observed: unmeasured

This decision approves the fixed local M2-E adapter implementation gate. It does not approve permissive/constrained profile evidence, experiment-matrix Observed results, the M3 collector/global sequence/reporting, a commit, publication, or a pull request.

## Review scope

- `packages/codegen-probe` source, fixed CLI, generator fixture, tests, and static verifier;
- the `probe-core` public boundary used by the adapter;
- fixed Node.js/npm metadata, `process.execPath`, argv, cwd, and `shell: false`;
- producer segment validation, event order, trigger type, direct write/API separation, and raw-data policy;
- observe, api, and dry-run materialization, input immutability, loopback-only network, child boundary, and disposable cleanup;
- consistency across the M2-E note, milestone, architecture, README, index, and experiment matrix.

## Fixed conditions and local results

| Condition | Fixed/observed value |
|---|---|
| Node.js | `v20.18.2` |
| npm launcher metadata | `11.12.1` |
| codegen version | `0.0.0` |
| CLI modes | `observe`, `api`, `dry-run` |
| Route/capability/tool API/total | `5 / 6 / 1 / 12` |
| Producer sequence | `0..11`, one producer, `workerId: null` |

Fresh local runs for all three fixed modes passed. Observe created only the direct marker and recorded a skipped generator API change. API recorded one successful generator API change and materialized one fixed artifact without the direct marker. Dry-run recorded no materialized output and no direct marker. All runs validated the closed segment, fixed order, explicit triggers, input/snapshot immutability, loopback request count, output containment, and cleanup.

## Verification

- `npm run m2e:verify`: passed (typecheck, build, scoped static verifier, 9 adapter tests)
- `npm run m2e:run:observe`: passed (`12` events, `5/6/1`, direct marker only)
- `npm run m2e:run:api`: passed (`12` events, `5/6/1`, one generated output)
- `npm run m2e:run:dry-run`: passed (`12` events, `5/6/1`, no output)
- `npm run check`: passed (57 test files, 302 tests)
- `git diff --check`: passed
- Docker, external network, credentials, home-directory access, and remote Git operations: not used

## Confirmed behavior

- The package root is import-safe; only the dedicated CLI entry creates a probe session.
- The launcher accepts only one of the three fixed modes and invokes the repository-owned `dist/cli.js` through `process.execPath` with fixed cwd and `shell: false`.
- Startup, argument parsing, generation start, file write, and completion are separate route events, all with `triggerType: explicit`.
- The six capability attempts are recorded through `probe-core` in fixed order and remain separate from the documented generator API change and tool-owned output materialization.
- Observe, API, and dry-run semantics are fail-closed for event count/order, version, trigger, outcome, raw-data redaction, output inventory, hashes, and input immutability.
- Only loopback `127.0.0.1`, repository-owned fixture input, run-owned canary/snapshot paths, and the fixed child target are used by the local runner.
- Local contract results remain separate from experiment-matrix Observed evidence.

## Resolved blocker

| ID | Finding | Remediation and re-review evidence | Closure |
|---|---|---|---|
| B-01 | README described M2-E as unimplemented even though the package, milestone, architecture, note, and local verification were present. | Updated the README implementation summary and linked the M2-E review record. Re-ran the root and adapter verification before the status closure; documentation consistency is covered by the adapter test. | `RESOLVED` |

## Non-blocking follow-ups

| ID | Limitation and impact | Recommended boundary |
|---|---|---|
| F-01 | The static verifier is scoped source inspection, not a runtime filesystem or process sandbox. | Keep the cooperative disposable-directory and fail-closed runtime checks; never present static verification as sandbox proof. |
| F-02 | Local contract runs do not compare permissive/constrained profiles and are not experiment-matrix Observed evidence. | Add the M3 collector and approved profile execution before updating Observed fields or conference claims. |
| F-03 | Timeout/termination checks cover the fixed CLI child but do not establish a portable process-group sandbox or prevent PID reuse for arbitrary future generator behavior. | Preserve the Linux/direct-spawn and fixed-fixture scope; add explicit process-settlement evidence before expanding the CLI contract. |
| F-04 | M1 I-04 remains applicable: a failed direct write after exclusive creation may leave partial output, and cleanup is not security rollback. | Retry only in a new disposable directory and preserve the original failure if cleanup hardening is added. |

## Remaining boundaries

- `docs/experiment-matrix.md` remains unchanged with M2-E Observed fields unmeasured.
- Permissive/constrained profile enforcement, M3 collector/global sequence, canonical merge, summary/report generation, and artifact publication remain unimplemented.
- The event counts are specific to the fixed Node.js `v20.18.2`, package version `0.0.0`, three CLI modes, and one producer.
- No commit, push, pull request, or publication was created by this review closure.
