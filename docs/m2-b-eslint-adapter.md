# M2-B ESLint adapter

## Status and boundary

M2-B implementation is **complete**, and its independent review decision is **APPROVE WITH NON-BLOCKING FOLLOW-UPS** with no blockers. F-01 through F-06 remain open in the [independent review record](reviews/m2-b-eslint-adapter.md). It depends on the M1 gate `APPROVE WITH NON-BLOCKING FOLLOW-UPS` and is independently executable while M2-A waits for the M0 transport decision. It does not implement M2-A/C/D/E, profiles, M3 collection/global sequence/reporting, artifact work, or experiment-matrix Observed results.

The package path is `packages/eslint-plugin-probe`, npm name is `@tskaigi-lab/adapter-eslint`, and version is `0.0.0`. It is private, ESM, strict TypeScript, and depends only on `@tskaigi-lab/probe-core` `0.0.0` and ESLint exact `9.39.5`. Node.js is fixed to `v20.18.2` and npm to `11.12.1` by the root toolchain.

## Fixed scenarios

Both `lint-only` and `fix` use one disposable JavaScript fixture, ESLint flat config supplied through the API, `cache: false`, `overrideConfigFile: true`, `globInputPaths: false`, concurrency off, watch disabled, and no external network. A scenario-owned numeric-loopback server implements the M1 fixed HTTP protocol. Every run gets a new `/tmp` directory, result segment, fixture, canary, source snapshot, output target, loopback server, and module-evaluation token.

The package root does not import the instrumented plugin entry and performs no event recording, environment read, filesystem/network/child operation, timer start, or output. The `./plugin` export is the only intentional evaluation marker. A trusted harness installs a single context first; importing the entry without it fails with fixed code `ESLINT_CONTEXT_NOT_INSTALLED`.

## Routes, phase, and trigger

| Route ID | Phase | Trigger | Invocation kind | Logical unit |
|---|---|---|---|---|
| `eslint-module-evaluation` | `module-evaluation` | `configured` | `module-evaluation` | `eslint-plugin-entry` |
| `eslint-plugin-initialization` | `plugin-initialization` | `configured` | `tool-initialization` | `eslint-plugin` |
| `eslint-rule-create` | `rule-create` | `configured` | `rule-create` | `fixed-answer-rule` |
| `eslint-program-visitor` | `visitor-callback` | `configured` | `visitor-callback` | `fixture-main` |
| `eslint-fixer-callback` | `fixer-callback` | `configured` | `fixer-invocation` | `fixture-main` |

The official change ID is `eslint-source-fix`, with phase `official-api-change`, trigger `explicit`, change kind `source-fix`, and source target `eslint-source-target`.

## Queue and evaluation isolation

ESLint hooks are synchronous while probe-core recording is asynchronous. The adapter therefore exposes install, fixed plugin load, drain, and dispose operations backed by one serial queue. Plugin code can enqueue only fixed route IDs and the six fixed attempt IDs. It cannot pass a callback, arbitrary session method, event, details, path, content, diff, command, or request. Queue order is producer sequence order. The first failure is retained, rejection is observed internally, later scheduling is rejected, and a disposed handle cannot be reused.

The fixed `plugin-entry.js` URL is cache-busted with a validated scenario token held by the installed context. The module-evaluation task is queued at entry evaluation and plugin initialization is queued after the fixed plugin object is constructed. Load is memoized within one context, so duplicate loads do not duplicate module evaluation. Independent scenarios use different tokens and fresh disposable state.

## Rule and changes

The rule accepts only a Program containing the single fixed declaration `const answer = 41;`. It reports the literal node and its fixer uses only ESLint's fixer object to replace that exact literal range with the intended value. After the fix, the target no longer matches. Plugin/rule source does not call Node.js filesystem, network, or child APIs.

The first Program visitor schedules these once per scenario:

- `PROBE_CANARY_ESLINT_M2B` presence/byte-length read
- dedicated canary file read without content hash
- separate source snapshot `file-hash`
- separate output marker `direct-filesystem-write`
- fixed `GET /probe-canary` loopback protocol
- probe-core fixed child Node.js attempt

The direct-write marker is not the lint fixture. In fix mode, ESLint builds the fixed output and `ESLint.outputFixes()` performs official materialization. The resulting `tool-api-change` stores only outcome, changed, hashes, and byte sizes. Lint-only records one skipped/non-change tool event. Source, diff, raw path, ESLint message/result, stack, canary data, environment list, and loopback body are absent from JSONL.

## Local contract observation

The first local run with pinned ESLint `9.39.5` established these integration-test expectations. They are adapter-level contract observations, not experiment-matrix Observed results and not M3 aggregated evidence.

| Scenario | Module | Initialization | Rule create | Program visitor | Fixer | Capabilities | Tool change |
|---|---:|---:|---:|---:|---:|---:|---:|
| lint-only | 1 | 1 | 1 | 1 | 1 | 6 | 1 skipped |
| fix | 1 | 1 | 2 | 2 | 1 | 6 | 1 changed |

In fix mode ESLint runs a second lint pass after applying the first-pass fix. The second pass repeats rule creation and Program visitation, but the literal is already fixed, so the fixer callback does not repeat. These counts are version/fixture/option-specific and must be remeasured if any pinned condition changes.

## Local commands and output

```sh
npm run m2b:verify
npm run m2b:run:lint
npm run m2b:run:fix
```

The runners accept only `lint-only` or `fix`. They preserve the validated raw producer segment under ignored `results/runs/m2-b-eslint/<run-id>/` and print a sanitized one-line JSON summary. Static verification supports human review but does not prove runtime isolation.
