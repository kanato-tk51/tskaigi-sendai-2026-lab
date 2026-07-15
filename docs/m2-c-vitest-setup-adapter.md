# M2-C Vitest setupFiles adapter

## Status and presentation role

Status: implementation **complete**; independent review **approved with non-blocking follow-ups**; blockers: none. B-01, R-B02-01, and R-B03-01 are resolved. F-01 through F-03 and M1 I-04 remain open. The experiment-matrix Observed columns are unchanged, permissive/constrained profiles have not run, and M3 aggregation, commit, and publication remain outside this status. The final decision and evidence are recorded in the [M2-C independent review record](reviews/m2-c-vitest-setup-adapter.md).

Historical status before the clean-boundary focused re-review, now superseded: **implementation complete; second blocker remediation implemented; clean-boundary verification blocked; independent re-review pending**. The blocker was a pre-existing empty adapter-local config-temp directory, not an accepted tool residue or a failed remediation.

M2-C is the configured-route local contract for the TSKaigi Sendai 2026 claim that dependency code can execute in a Node.js fork worker through Vitest `setupFiles`, independently of npm install scripts. Its two route events are checkpoints inside one setup-module import, not two callbacks exposed by Vitest. Route arrival is also distinct from the outcome of each environment, file, loopback, child, or direct-write capability.

## Package, versions, and fixed command

The package is the private strict-TypeScript ESM workspace `packages/vitest-setup-probe`, named `@tskaigi-lab/adapter-vitest-setup` at version `0.0.0`. Its runtime dependencies remain `@tskaigi-lab/probe-core` `0.0.0` and Vitest exact `3.2.7`; dependency versions and lockfile dependency metadata are unchanged by blocker remediation. Node.js is exact `v20.18.2` and npm is exact `11.12.1` for this adapter contract.

The only semantic tool command, with the adapter workspace as cwd, is:

```sh
vitest run --config vitest.scenario.config.ts --configLoader runner fixture/designated.test.ts
```

The harness invokes the fixed Vitest CLI through `process.execPath`, fixed argv, `shell: false`, bounded output, and a 30,000 ms outer timeout. The root `m2c:run`/`m2c:verify` scripts do not expose a config, loader, test pattern, temp path, process ID, signal, mode, or other user argument. The local runner rejects every argv extension.

## Config, fixture, and tool-owned temporary boundary

The explicit config fixes `watch: false`, `cache: false`, `pool: "forks"`, `singleFork: true`, one worker/fork, `fileParallelism: false`, `isolate: true`, retry/bail zero, list-ordered setup, snapshot update off, and coverage/typecheck/browser/UI/open off. It fixes one setup file, one test file, and one test case. The test body is only a progress witness after setup and is not a route event.

Vitest/Vite performs tool-internal writes independently of the six probe capabilities. In installed Vitest `3.2.7`, each project assigns its transform cache under `join(os.tmpdir(), nanoid())`. Vite `6.4.3`'s bundle config loader searches upward from the fixed config file directory and uses the first candidate for which `node_modules` is an existing directory, then places config output in its direct `.vite-temp` child. In this repository topology that is `packages/vitest-setup-probe/node_modules/.vite-temp`, not the repository-root `node_modules/.vite-temp`. M2-C therefore does all of the following:

- creates a fresh `tool-temp` directory and Vite cache boundary inside each run root;
- passes that exact `tool-temp` as `TMPDIR`, `TMP`, and `TEMP` to the fixed coordinator environment, which its fork worker inherits;
- validates in official global setup that Node `os.tmpdir()` equals the fixed tool-temp root and Vitest's project transform directory is its single 21-character child;
- uses the verified `--configLoader runner` option, which loads the TypeScript config on the fly rather than using Vite's config bundle temporary file;
- resolves only the fixed scenario config's actual adapter-local nearest `node_modules`, verifies the canonical config/workspace/parent identity and direct `.vite-temp` child, and rejects a repository-root fallback or a canonical parent escape;
- uses `lstat` existence checks where only `ENOENT` means absent; a pre-existing file, directory, symlink, or dangling symlink, and any permission/I/O/unknown inspection error, fail closed;
- rejects a pre-existing config temp without deleting or modifying it, including when `configLoader: runner` is selected;
- rejects a run whose tool-temp/cache roots are pre-existing, symlinked, non-directories, non-empty, outside the canonical run root, or replaced after initialization;
- inventories tool-temp, transform/cache entries, and the actual config-temp boundary after coordinator/worker settlement, then removes only owned tool-temp/cache and verifies their absence before removing the run root;
- requires a successful run to have no transform-temp residue and no config-temp directory.

The same actual config-temp target must be absent before the process, after verified process settlement, and after owned-root cleanup. If it appears post-run, M2-C reports a boundary violation and does not assume ownership or delete it. The inventory stores counts and logical boundary results only; it does not place absolute paths into producer events or the local segment. Tool temp/cache writes are not `direct-filesystem-write` capability events. The only such capability remains the dedicated probe output marker. `cacheDir` and static verification are useful checks but do not independently prove temporary-write containment; the fixed loader, spawned environment, resolved `os.tmpdir()`/project temp validation, runtime inventory, process settlement, and cleanup are all part of the contract. An unexpected config/system temp path, unexpected residue, or cleanup failure makes the run invalid. Canonical pre/post identity checks fail closed within the cooperative disposable experiment, but do not claim to eliminate every filesystem race or root-swap attack.

Before final clean-boundary verification, the actual adapter-local config-temp target existed as an ignored empty directory. The review first confirmed read-only that it was a current-user-owned, non-symlink empty directory at the expected canonical parent with no active reference. After the user explicitly authorized cleanup of that exact relative path, the same ownership, identity, parent, empty state, and no-reference conditions were revalidated fail closed, and only the empty directory was removed with `rmdir`. No recursive removal was used; the parent `node_modules`, `.vite` cache, and other workspace state were not changed. The subsequent two fresh production runs observed the config-temp target absent before and after execution, tool-temp/cache pre/post counts of zero, complete cleanup, and no run-root or run-specific temporary residue.

## Route/checkpoint mapping

Installed `@vitest/runner` `3.2.7` executes each configured setup file once in this fixture with `await runner.importFile(setupPath, "setup")`. It does not import the module and then invoke an exported setup callback. Both M2-C route events are therefore ordered checkpoints in that same awaited top-level module import.

| Route ID | Phase | Trigger | M1 invocation category | Logical unit | Exact meaning | Expected |
|---|---|---|---|---|---|---:|
| `vitest-late-module-evaluation-checkpoint` | `setup-file-late-module-checkpoint` | `configured` | `module-evaluation` | `vitest-setup-entry` | late checkpoint after static imports, `inject`, context/manifest validation, configuration preparation, and session creation | 1 |
| `vitest-setup-body-checkpoint` | `setup-file-body-checkpoint` | `automatic` | `setup-execution` | `vitest-setup-entry` | checkpoint in the same top-level import immediately before the capability sequence | 1 |

The M1 invocation categories are schema categories; they do not assert separate Vitest callbacks. In particular, checkpoint 1 is not module-evaluation start. Static imports and bootstrap work have already executed before it. A context, preparation, session, or sink failure before checkpoint 1 may leave no route segment, but zero events cannot prove that the module was never evaluated and is never accepted as a valid zero-route observation. Test-file collection/execution happens later and remains outside route events. These meanings and the count are specific to Vitest `3.2.7` and the fixed setup/file/worker conditions.

## Worker ownership and event contract

Coordinator global setup validates versions, resolved config, the temp root, fixed manifest/runtime bindings, and exact run-root paths. It passes only a structured-clone-safe fixed context through official `project.provide`. The worker setup entry uses official `inject`, repeats validation, prepares the runtime, creates and owns the probe session/segment, records the two checkpoints and six attempts, and closes the session before Vitest imports the test file.

The fixed successful order is:

1. late module-evaluation checkpoint;
2. setup-body checkpoint in the same import;
3. environment canary read;
4. canary file read;
5. source file hash;
6. dedicated direct output write;
7. fixed loopback request;
8. fixed child Node.js process;
9. session close;
10. designated test collection/execution by Vitest.

Expected is eight producer events with producer sequence `0..7`: two checkpoint route events and six capability attempts. Tool API targets, changes, and events remain zero. All producer events must have one fork-worker PID, a PPID equal to the coordinator PID, and producer count one. Vitest exposes no stable public worker identifier for this contract, so `workerId` is therefore `null`; no worker ID is invented from PID, filename, or internals. Capability `success`, `failure`, and `skipped` remain valid observations after a checkpoint. Bootstrap/config/version/temp/process/session/sink/segment/count/tool/test/timeout/output/cleanup failures make the run invalid.

## Termination and cleanup state machine

The execution contract is Linux-specific. The harness directly spawns the fixed Node/Vitest coordinator with `detached: true`, which creates a dedicated process group; it never uses a shell. The single Vitest fork worker inherits that group. No public API accepts an arbitrary PID, process group, or signal.

On timeout or output-limit, the runner fixes that code as primary, stops counting new output while draining/discarding it, sends `SIGTERM` to the fixed coordinator group, waits 500 ms for coordinator `close`, sends `SIGKILL` if needed, then waits a further bounded 2,000 ms. A graceful failure lifecycle accepts only coordinator close `{ code: null, signal: "SIGTERM" }`; after force termination it accepts only `{ code: null, signal: "SIGKILL" }`. It then polls the same fixed process group for up to 2,000 ms to prove that the worker/pool is gone. Cleanup starts only after the expected close disposition and group absence are both proved.

Signal delivery failure, a missing close deadline, an unexpected close disposition, or process-group residue is a normalized secondary failure. When expected coordinator close, its disposition, or group absence cannot be proved, `M2C_SETTLEMENT_UNKNOWN` is also recorded and the production lifecycle suppresses loopback close, config/tool/cache inventory or deletion, and run-root deletion that could race the process. The invalid run may deliberately retain disposable local residue for diagnosis; no residue path, PID, raw OS error, or stack enters evidence. Fixed internal fault adapters dispose their already-terminated fixture resources only after asserting this production cleanup gate, and are unreachable from the package export graph.

The settled ordering is:

```text
primary timeout/output-limit
→ group termination requested
→ coordinator close
→ close disposition validated
→ worker/pool gone
→ cleanup allowed
→ loopback close
→ parent PROBE_CANARY_ environment verified unchanged
→ tool-temp/config/cache post-inventory
→ tool-temp/cache cleanup and absence check
→ run-root cleanup and absence check
→ final rejection
```

Timeout/output-limit remains primary. Graceful/forced signal failure, close deadline, close disposition mismatch, process residue, settlement unknown, loopback failure, environment-boundary failure, temp violation, and cleanup failure are normalized secondary codes and never turn the run into success. A cleanup-only failure is primary. Raw stdout/stderr, OS errors, stacks, PIDs, and temporary/absolute paths are not persisted in the segment or summary. The Linux direct-spawn/process-group contract does not claim a general OS process sandbox, prevention of PID reuse, or portability of PID/PPID semantics.

## Evidence, determinism, and limitations

JSONL and local summaries exclude raw canaries, credentials, absolute/temporary paths, setup/test/source content, diffs, full test names, stacks, executable/script paths, loopback bodies, and unsanitized output. The fixed local runner copies the already validated closed producer segment and a sanitized summary to ignored `results/runs/m2-c-vitest/<run-id>/`. Local runs are adapter integration observations, not the `vitest-setup-p`/`vitest-setup-c` experiment-matrix Observed result and not presentation evidence.

Two fresh runs must have the same deterministic projection after excluding run ID, PID/PPID, timestamps, durations, and the run-ID-bearing direct-write marker hash. Expected/Observed is not changed to fit a run. The count must not be generalized beyond Vitest `3.2.7`, `forks`/single fork, one worker, one setup, one test file, and one case.

The final clean-boundary production verification ran twice. Each run produced one closed worker-owned segment with route/checkpoint 2, capability attempt 6, tool API change 0, total events 8, sequence `0..7`, one producer, worker ID `null`, one direct marker, and unchanged source/setup/test hashes. The deterministic projections matched after excluding the declared run-varying fields. These are local adapter integration results, not matrix Observed evidence.

The static verifier checks the fixed loader/argv, checkpoint constants and placement, fixed nearest config-temp resolver, `lstat`/canonical identity markers, fixed temp environment/inventory boundary, exact close signals, normalized settlement codes, unsafe-cleanup gate, literal TERM/KILL process-group operations, shell-free fixed fixture/coordinator paths, timeouts/grace periods, and absence of arbitrary user argv/temp/config/PID/signal input. It remains static inspection, not a runtime sandbox proof.

Open non-blocking follow-ups are F-01 for the static verifier's broader fail-closed scope, F-02 for npm runtime/version evidence semantics, and F-03 for the Linux-specific PID/PPID and process-group limitation. M1 I-04 also continues: a failed direct write may leave partial output after exclusive creation, so retry uses a new clean directory and cleanup is not presented as security rollback. None of these limitations changes the approved fixed M2-C local contract.
