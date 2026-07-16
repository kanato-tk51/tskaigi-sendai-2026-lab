# M2-D Vite plugin adapter independent review record

## Review target

- Branch: `m2-d-vite-adapter`
- HEAD at review start: `b7d79360d16ee067e3bd04e78cd697af365c4d9c`
- Target: the uncommitted M2-D adapter implementation and its fixed local contract runs
- Review type: independent read-only implementation review with a focused documentation-consistency re-review
- Reviewer source changes: none; the review closure updated only status/documentation metadata and this record

## Gate decision

- Decision: `APPROVE WITH NON-BLOCKING FOLLOW-UPS`
- Blockers: none
- Resolved blocker: B-01
- Experiment-matrix Observed: unmeasured

This decision approves the M2-D implementation gate for the fixed local adapter. It does not approve permissive/constrained profile evidence, experiment-matrix Observed results, the M3 collector/global sequence/reporting, a commit, publication, or a pull request.

## Review scope

- `packages/vite-plugin-probe` source, fixed config, fixture, tests, and static verifier;
- the `probe-core` public boundary used by the adapter;
- exact Node.js/Vite/Rollup/esbuild validation and fixed process argv/cwd;
- producer segments and sanitized local summaries from fresh observe/API runs;
- route/capability/tool API event order, materialization, input immutability, temporary boundaries, process settlement, and cleanup;
- consistency across the M2-D note, milestone, architecture, README, index, and experiment matrix.

## Fixed conditions and local results

| Condition | Fixed/observed value |
|---|---|
| Node.js | `v20.18.2` |
| npm launcher metadata | `11.12.1` |
| Vite | `6.4.3` |
| Rollup | `4.62.2` |
| esbuild | `0.25.12` |
| Semantic command | `vite build --config vite.scenario.config.ts --configLoader runner --mode production` |
| Route/capability/tool API/total | `6 / 6 / 3 / 15` |
| Producer sequence | `0..14`, one producer, `workerId: null` |

Fresh local runs for both variants passed. Observe recorded three `skipped/NOT_APPLICABLE` tool API changes and one entry output; API recorded three successful changes and one entry output plus one emitted asset. Both runs confirmed source/config/plugin hashes unchanged, one direct marker outside `outDir`, no config-temp/tool-temp/cache/process/esbuild residue, complete segment close, and owned cleanup.

## Verification

- `npm run m2d:verify`: passed (typecheck, build, scoped static verifier, adapter tests)
- `npm run check`: passed (format, lint, root typecheck, full test suite)
- `npm run m2d:run:observe`: passed with the fixed 15-event contract and one output file
- `npm run m2d:run:api`: passed with the fixed 15-event contract and two output files
- `git diff --check`: passed
- Docker, external network, profile enforcement, and remote Git operations: not used

## Confirmed behavior

- The package root is import-safe; only the dedicated plugin entry creates the coordinator-owned session.
- The launcher accepts only the two fixed variants and invokes `process.execPath` with fixed repository-owned Vite CLI arguments, fixed cwd, and `shell: false`.
- The dependency plugin records the late module checkpoint and factory separately, keeps the trusted `configResolved` validator outside the dependency route, and uses a sequential `buildStart` for the six capability attempts.
- The exact designated transform filter excludes entry/internal/non-target transforms from the designated count.
- Transform return, `emitFile`, bundle mutation, direct filesystem write, and ordinary Vite/Rollup output materialization remain separate evidence.
- Segment validation is fail-closed for count/order/version/producer/variant/hash/materialization drift and rejects raw source, output, path, error, and tool identifier fields.
- Fresh owned temp/cache/output boundaries, nearest `.vite-temp`, process-group settlement, esbuild residue, and cleanup are validated before a run is accepted.

## Resolved blocker

| ID | Finding | Remediation and re-review evidence | Closure |
|---|---|---|---|
| B-01 | `docs/architecture.md` still said M2-D was not implemented, contradicting the implementation, milestone, README, and successful local contract runs. | Synchronized the architecture status and linked this review record; updated status assertions and the M2-D navigation metadata. Re-ran the root and adapter verification after the documentation change. | `RESOLVED` |

## Non-blocking follow-ups

| ID | Limitation and impact | Recommended boundary |
|---|---|---|
| F-01 | The static verifier is scoped inspection, not a runtime filesystem or process sandbox. | Keep the cooperative disposable-directory and fail-closed runtime checks; do not present static verification as sandbox proof. |
| F-02 | Local contract runs are not profile comparisons or experiment-matrix Observed evidence. | Add the M3 collector and approved permissive/constrained execution before updating Observed fields or conference claims. |
| F-03 | PID/PPID and process-group evidence is Linux/direct-spawn specific and does not establish portable ancestry or prevent PID reuse. | Preserve the explicit platform limitation before making cross-platform claims. |
| F-04 | M1 I-04 remains applicable: a failed direct write after exclusive creation does not guarantee rollback of partial output. | Keep failed attempts and cleanup failures explicit; do not describe cleanup as security rollback. |

## Remaining boundaries

- `docs/experiment-matrix.md` remains unchanged with M2-D Observed fields unmeasured.
- Permissive/constrained profiles, M3 collector/global sequence, canonical merge, and report generation remain unimplemented.
- No external network, Docker, credential, home-directory, or remote Git operation was used by this review.
- No commit, push, pull request, or publication was created.
