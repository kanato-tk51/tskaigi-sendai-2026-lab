# M2-C Vitest setupFiles adapter independent review record

## Review target

- Target milestone: M2-C
- Branch: `m2-c-vitest-adapter`
- Base/HEAD: `7cb2426`
- Target: the uncommitted M2-C implementation and blocker remediations
- Review type: independent read-only review and focused read-only re-reviews
- Reviewer source changes: none

The review included one state-preparation exception outside tracked source. An ignored, pre-existing empty config-temporary directory was inspected read-only. After the user explicitly authorized cleanup of that exact relative path, its ownership, identity, empty state, parent identity, and lack of active references were revalidated fail closed, and only that empty directory was removed with `rmdir`. No recursive deletion, parent-directory change, cache deletion, or other workspace cleanup was performed.

## Gate decision

- Decision: `APPROVE WITH NON-BLOCKING FOLLOW-UPS`
- Blockers: none
- Resolved blockers: B-01, R-B02-01, R-B03-01
- Open follow-ups: F-01, F-02, F-03
- Continuing accepted limitation: M1 I-04

The decision applies to the reviewed uncommitted working tree on the branch and base above. It does not approve an experiment-matrix Observed result, a commit, publication, or a pull request.

## Review scope

- all M2-C source, config, fixture, test, and static-verifier files;
- the probe-core public boundary used by the adapter;
- installed Vitest `3.2.7` and Vite `6.4.3` runtime semantics relevant to setup import, config loading, transform temp, and process lifecycle;
- generated producer-local JSONL and sanitized local summaries;
- timeout, output-limit, termination, settlement, inventory, and cleanup lifecycles;
- documentation consistency and the M0, M1, M2-B, and probe-core regression boundaries.

## Final fixed conditions

| Condition | Fixed value |
|---|---|
| Node.js | `v20.18.2` |
| npm | `11.12.1` |
| Vitest | `3.2.7` |
| Vite | `6.4.3` |
| Pool | `forks` |
| Fork mode | `singleFork: true` |
| Worker count | 1 |
| Isolation | `isolate: true` |
| Setup file | 1 |
| Test file | 1 |
| Test case | 1 |
| Watch/cache/retry/concurrency | disabled |
| Coverage/typecheck/browser/UI/open | disabled |
| Snapshot update | disabled |

The fixed semantic command, run with the adapter workspace as its current directory, is:

```text
vitest run --config vitest.scenario.config.ts --configLoader runner fixture/designated.test.ts
```

The direct launcher uses `process.execPath`, fixed repository-owned arguments, and `shell: false`. No public interface accepts arbitrary command, config, loader, test path, temporary path, PID, process group, signal, or lifecycle fixture mode.

## Route/checkpoint contract

The two route IDs are:

- `vitest-late-module-evaluation-checkpoint`;
- `vitest-setup-body-checkpoint`.

Installed `@vitest/runner` `3.2.7` awaits one `runner.importFile(setupPath, "setup")` for the configured setup file. The two events are ordered checkpoints in that same awaited top-level setup-module import, not separate Vitest callbacks and not an imported function followed by a Vitest-invoked exported setup callback.

The first checkpoint is not evaluation start. Static imports, official `inject`, context and manifest validation, configuration preparation, and session creation precede it. A failure before the first checkpoint is an invalid run. Zero route events neither prove that the module was unevaluated nor form a valid zero-route observation. The designated test body is a later progress witness and is not a route event.

## Counts and event order

Expected and the two clean-boundary local integration runs agreed on:

| Item | Count/result |
|---|---:|
| Route/checkpoint events | 2 |
| Capability-attempt events | 6 |
| Tool API change events | 0 |
| Total producer events | 8 |
| Producers | 1 |
| Test files/cases | 1 / 1 |
| Direct output markers | 1 |
| Producer sequence | `0..7` |
| Source/setup/test hashes | unchanged |
| Segment close | complete |

The exact producer-event order was:

```text
vitest-late-module-evaluation-checkpoint
vitest-setup-body-checkpoint
vitest-attempt-environment
vitest-attempt-file-read
vitest-attempt-file-hash
vitest-attempt-file-write
vitest-attempt-loopback
vitest-attempt-child
```

The segment is owned by one fork worker. All events use producer `vitest-fork-worker`, the observed worker PPID matches the coordinator PID under the fixed Linux conditions, and the public Vitest worker ID remains `null`. Tool API targets, changes, and events are not applicable and remain empty/zero. The local integration observations are not the experiment-matrix Observed result.

## Temporary-write boundary

Vitest/Vite tool-internal temporary writes are separate from the six probe capability attempts. The actual nearest Vite config-temporary boundary for the fixed config is the adapter workspace's `node_modules/.vite-temp`, not the repository-root boundary.

The resolver follows the installed Vite `6.4.3` nearest-existing-`node_modules` semantics for the fixed scenario config. It uses `lstat`, treats only `ENOENT` as absent, and rejects pre-existing files, directories, symlinks, dangling symlinks, permission or unknown inspection errors, canonical parent escapes, and identity mismatches. It validates the canonical parent and fixed direct child before and after the process. A pre-existing config-temp entry is not deleted or modified by the production run; a post-run entry is a boundary violation and is not assumed to be owned by the run.

Before clean-boundary verification, the pre-existing ignored entry was a current-user-owned, empty, non-symlink directory at the expected adapter-local boundary with no active reference. Its exact identity, parent, ownership, and empty state were checked read-only. Following explicit user authorization, the same facts were revalidated and only the empty directory was removed with `rmdir`. Raw device/inode values, absolute paths, and raw filesystem errors are intentionally omitted from this record. `rm -rf`, the parent `node_modules`, the `.vite` cache, and other workspace state were not changed.

Both subsequent fresh production runs observed the actual config-temp boundary absent before and after execution, tool-temp/cache pre/post counts of zero, complete cleanup, and no run-root or run-specific temp residue. The coordinator's fixed `TMPDIR`/`TMP`/`TEMP`, Vitest transform temp, and Vite cache remain run-owned boundaries. These tool writes do not count as the dedicated `direct-filesystem-write` capability. The checks are fail closed within the cooperative disposable experiment; they do not claim to prevent every filesystem race or to provide a filesystem sandbox.

## Process lifecycle

The termination contract is limited to Linux and direct spawn. The fixed Vitest coordinator is placed in a dedicated process group inherited by its single fork worker. Graceful termination accepts coordinator close only as `{ code: null, signal: "SIGTERM" }`; force termination accepts only `{ code: null, signal: "SIGKILL" }`.

Timeout or output-limit is fixed as the primary failure. Graceful/force signal failure, close deadline, disposition mismatch, process-group residue, settlement unknown, and later cleanup failure are normalized secondary failures. Process-competing cleanup is allowed only after coordinator close, the expected close disposition, and process-group absence are all verified. If settlement is unknown, loopback, tool-temp/cache inventory or deletion, and run-root deletion are suppressed rather than racing a possibly live coordinator or worker. A cleanup-only failure becomes primary and cannot turn the run into success.

The tests cover timeout and output-limit force termination, graceful close, output-limit plus cleanup failure, signal failure, close deadline, unexpected disposition, process residue, settlement-unknown suppression, cleanup-only failure, first-failure preservation, output draining, and lifecycle ordering through the production scenario boundary. No raw output, OS error, stack, PID, or temporary/absolute path is persisted in the segment or summary. This contract does not claim prevention of PID reuse, a general OS process sandbox, or cross-platform PID/PPID/process-group portability.

## Verification

Closure verification on 2026-07-15 produced the following results:

- M2-C: 10 test files, 36 tests passed;
- M2-B: 7 test files, 17 tests passed;
- probe-core: 21 test files, 165 tests passed;
- M0 focused: 10 tests passed;
- root: 40 test files, 230 tests passed;
- M2-C typecheck, build, and static verification: passed;
- probe-core static verification: passed;
- npm 12 static verification: passed;
- `m2c:verify`: passed;
- two fresh `m2c:run` executions: passed;
- format, lint, and root typecheck: passed;
- root `npm run check`: passed;
- `git diff --check`: passed;
- Docker and external network: not used.

The two fresh segments each contained the same eight-event order and sequence `0..7`, one producer, worker ID `null`, one direct marker, unchanged source/setup/test hashes, and complete segment close. Their deterministic projections matched after excluding the declared run-varying fields. Both runs completed the temporary-boundary and process-residue checks without residue. Local integration output remains separate from the unchanged experiment-matrix Observed columns.

## Resolved blockers

| ID | Original problem | Remediation and re-review evidence | Closure |
|---|---|---|---|
| B-01 | Two route events overstated separate Vitest execution boundaries. | Names, mappings, tests, and documentation now define two ordered checkpoints in one awaited setup-module import; pre-checkpoint failures are invalid rather than valid zero-route observations. | `RESOLVED` |
| R-B02-01 | Config-temp inventory monitored the wrong boundary and could treat filesystem errors as absence. | The fixed resolver matches the installed Vite nearest-boundary semantics, uses ENOENT-only `lstat`, validates canonical identity/containment, and passed real-filesystem plus two clean production runs. | `RESOLVED` |
| R-B03-01 | Failure close disposition, secondary failures, and unsafe-settlement cleanup suppression were not fixed. | The implementation validates expected TERM/KILL close shapes and group absence, preserves primary/secondary failures, suppresses competing cleanup when settlement is unknown, and passed focused production-lifecycle tests. | `RESOLVED` |

## Open non-blocking follow-ups

| ID | Classification | Limitation and impact | Why it does not block | Recommended future work and presentation note |
|---|---|---|---|---|
| F-01 | Follow-up | The static verifier's comprehensive fail-closed coverage remains narrower than a runtime sandbox proof. | Fixed entry points, runtime fail-closed checks, tests, and independent source review cover the approved adapter contract. | Harden the full static/module-graph policy separately. Present the verifier as a scoped guard, never as sandbox proof. |
| F-02 | Follow-up | npm runtime/version evidence semantics are adapter metadata and launcher validation, not independent worker-produced npm evidence. | npm does not execute the fixed Vitest worker route, and the Node/Vitest execution contract is separately fixed and validated. | Define cross-adapter runtime/version evidence semantics before aggregated reporting. Do not imply that a worker observed npm execution. |
| F-03 | Follow-up | PID/PPID and process-group observations are Linux/direct-spawn specific and do not prove portable ancestry or prevent PID reuse. | The approved local contract fails closed outside Linux and does not generalize the claim. | Add an explicit platform model or portable alternative before cross-platform claims. State the Linux/direct-spawn scope in the presentation. |

These follow-ups do not block the M2-C gate. They remain outside this closure and must not be represented as resolved.

## Continuing limitation

M1 I-04 remains accepted and non-blocking. A direct-write failure after exclusive creation may leave partial output; automatic rollback is not guaranteed. Such an attempt remains a failure, a retry must use a new clean directory, and cleanup must not be described as a security rollback. Future hardening would have to revalidate ownership/inode identity and preserve the original failure if cleanup also failed.

## Remaining boundaries

- M2-C experiment-matrix Observed results remain unmeasured and unchanged.
- Permissive/constrained profile comparison has not run.
- M3 collector, global sequence, canonical merge, summary, and report generation are not implemented.
- The event counts are specific to Vitest `3.2.7`, Vite `6.4.3`, Linux direct spawn, `forks`/`singleFork`, one worker, one setup file, one test file, and one test case.
- No commit, push, or pull request was created by this closure task.
