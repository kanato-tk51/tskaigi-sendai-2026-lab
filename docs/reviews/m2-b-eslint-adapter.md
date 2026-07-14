# M2-B ESLint adapter independent review record

## Review target

- Branch: `m2-b-eslint-adapter`
- Base HEAD: `51154bb`
- Target: the uncommitted M2-B ESLint adapter implementation

## Gate decision

- Decision: `APPROVE WITH NON-BLOCKING FOLLOW-UPS`
- Blockers: none
- Critical / High findings: none

## Verification

- Adapter: 7 test files, 17 tests passed
- Probe-core: 21 test files, 165 tests passed
- Root: 30 test files, 194 tests passed
- Root `npm run check`: passed
- M1 regression: none
- M0 regression: none

## Confirmed behavior

- The package root imports without probe activity or other observable side effects.
- The instrumented plugin entry requires an installed scenario context.
- `lint-only` and `fix` use fixed ESLint `9.39.5` scenarios.
- Route counts retain the actual ESLint hook invocations, including fix multi-pass behavior.
- The six capability attempts are scheduled once per scenario.
- Direct filesystem writes and ESLint official fixer API changes use separate events and targets.
- Producer sequence is shared across event kinds and remains contiguous.
- Producer JSONL complies with the reviewed raw-data policy.

## Non-blocking follow-ups

| ID | Follow-up |
|---|---|
| F-01 | Make runtime Node.js/npm version validation fail closed. |
| F-02 | Preserve the first failure when final temporary cleanup also fails. |
| F-03 | Replace adapter lexical static checks with AST/module-graph checks. |
| F-04 | Validate the complete fixed manifest mapping contract. |
| F-05 | Add materialization and failure-path integration coverage. |
| F-06 | Clarify the relationship with future experiment-matrix scenarios. |

These follow-ups do not block the M2-B gate and were not implemented during review closure.

## Notes and boundaries

- Invocation counts are specific to ESLint `9.39.5` and the fixed fixture/options.
- Fresh module evaluation uses scenario-specific module URLs, so module instances remain subject to the Node.js ESM module-cache lifetime.
- M1 I-04 remains an accepted non-blocking limitation: a failed direct write does not guarantee rollback of partial output.
- M3 collector, global sequence, summary, and report generation are not implemented.
- M2-B experiment-matrix Observed results remain unmeasured and unchanged.
