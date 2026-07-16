# M2-D Vite plugin adapter Expected contract

## Status and presentation role

Status: **M2-D implementation complete; independent review approved with non-blocking follow-ups; blockers: none; experiment-matrix Observed unmeasured**.

The final docs-gate decision is `APPROVE WITH NON-BLOCKING FOLLOW-UPS`. B-01 is resolved, and the full decision, reviewed snapshot identity, and non-blocking snapshot note are preserved in the [M2-D Expected contract independent review record](reviews/m2-d-vite-contract-docs.md).

The route `6`, capability `6`, tool API change `3`, total `15`, and producer order below remain the approved Expected contract for future experiment-matrix runs. The local adapter implements and verifies that denominator for fixed observe/API production builds, including output materialization and esbuild/process-group settlement. The independent implementation review is approved with non-blocking follow-ups. These local contract runs are not experiment-matrix Observed evidence and do not compare permissive/constrained profiles.

This document remains the canonical **Expected-only** contract for the M2-D Vite plugin adapter. Implementation status and local verification are recorded without changing Expected to fit a result. Experiment-matrix Observed evidence remains unmeasured and unchanged; the implementation review decision and boundaries are recorded in the [independent review record](reviews/m2-d-vite-plugin-adapter.md).

M2-D supports the TSKaigi Sendai 2026 explanation of a configured route: a dependency plugin registered in Vite config executes on Node.js during one fixed production build. Configured plugin loading/factory calls, automatic build hooks, six capability attempts, three official tool API changes, probe direct writes, and tool-owned output materialization remain distinct evidence.

## Fixed versions and command

The Expected version contract is exact:

| Component | Version | Contract role |
|---|---|---|
| Node.js | `v20.18.2` | process runtime recorded in producer events |
| npm | `11.12.1` | launcher policy metadata only; it is not evidence that the plugin process runs npm |
| Vite | `6.4.3` | producer-event tool and fixed CLI/config contract |
| Rollup | `4.62.2` | fixed hook ordering, hook filter, bundle, and output semantics |
| esbuild | `0.25.12` | fixed TypeScript transform/output and tool-owned child-process conditions |

The M2-D workspace must directly pin Vite exact `6.4.3` when implementation begins. Transitive resolution is not an adequate substitute. The implementation must also validate and retain only sanitized Rollup `4.62.2` and esbuild `0.25.12` version metadata.

The only semantic tool command, with the fixed adapter workspace as cwd, is:

```sh
vite build --config vite.scenario.config.ts --configLoader runner --mode production
```

The harness must invoke a fixed Vite CLI path through `process.execPath`, with fixed argv, a fixed adapter cwd, and `shell: false`. It accepts no user argv and exposes no arbitrary config, mode, cwd, executable, script, process ID, or signal input. The only fixed scenario variant is `observe` or `api`. Dev, serve, preview, watch, and HMR paths are unreachable. `configLoader: runner` is valid in Vite `6.4.3` but remains experimental, so its exact version and resolved behavior are part of the contract.

## Route contract

Exactly six dependency route events are Expected. A route event is a hook-entry or checkpoint event, not a summary inferred later from output.

| Order concept | Route ID | Trigger | M1 invocation category | Meaning |
|---:|---|---|---|---|
| 1 | `vite-late-plugin-module-checkpoint` | `configured` | `module-evaluation` | late checkpoint after context validation, preparation, and session creation |
| 2 | `vite-plugin-factory` | `configured` | `plugin-factory` | separate call boundary where the config calls the dependency plugin factory |
| 3 | `vite-build-start` | `automatic` | `build-hook` | `buildStart` for the single non-watch build |
| 4 | `vite-designated-transform` | `automatic` | `module-hook` | transform handler for the one exact designated logical source target |
| 5 | `vite-generate-bundle` | `automatic` | `build-hook` | `generateBundle` for the single output |
| 6 | `vite-write-bundle` | `automatic` | `build-hook` | `writeBundle` after output has been written |

The plugin-module event is not the start of module evaluation. Static imports and bootstrap work occur before the checkpoint. A context, preparation, session, or sink failure before it makes the run invalid; zero events do not prove that the module was never evaluated and are not accepted as a valid zero-route observation. The plugin factory is a separate config-driven call boundary.

A trusted `configResolved` validator belongs to the control plane and is not counted as a dependency route. The transform count is not the number of all plugin transform invocations. An exact hook filter admits only the designated logical target once. Entry transforms, internal modules, and every non-target invocation remain outside the designated count; the implementation and report must not hide those invocations and then describe the count as “all plugin transforms.”

## Capability placement

Exactly six probe capability attempts occur immediately after the `vite-build-start` route event, in this order:

1. environment canary read;
2. canary file read;
3. designated source hash;
4. dedicated direct filesystem write;
5. fixed loopback request;
6. fixed child Node.js process.

Implementation must declare `buildStart` as a sequential hook. A single build calls this fixed hook once, so capability count does not depend on transform graph size or module count. This placement avoids distorting transform duration/semantics and captures the source hash before transform. The six attempts exist because they are six distinct capabilities; the count is not rounded to equal the route count.

The direct-write marker uses a dedicated probe output outside `outDir`. It is not a source edit, an emitted asset, a bundle mutation, or ordinary Vite/Rollup artifact output.

## Official tool API change contract

Both variants contain the same three manifest definitions and exactly three `tool-api-change` events. They must not merge transform, asset emission, and bundle mutation into two events.

| Change ID concept | `changeKind` | Fixed target and evidence | Materialization boundary |
|---|---|---|---|
| `vite-module-transform-change` | `module-transform` | designated source logical target; hash, byte size, and `changed` for the transform hook return result | source file remains unchanged; final entry chunk materialization is separate evidence |
| `vite-emitted-asset-change` | `emitted-asset` | one fixed asset emitted through `this.emitFile`; success requires its materialization in `OutputBundle` | Rollup reference ID and asset content are not persisted; disk write is separate evidence |
| `vite-bundle-mutation-change` | `bundle-mutation` | fixed entry chunk code before/after hash, byte size, and `changed` | distinct from module transform and emitted asset; disk materialization is verified later |

The bundle mutation targets the existing fixed entry chunk and does not add a file. Vite/Rollup's normal writes of output files are tool-owned materialization, not a fourth tool API change. The probe's direct marker is a `capability-attempt`, not a tool API change. Source-file immutability, in-memory/API result changes, and build-output changes are independently verified and must not be inferred from one another.

### Observe and API variants

For `observe`, the three enabled tool change definitions each produce:

```text
outcome: skipped
reason: NOT_APPLICABLE
```

This does not mean the API is absent, policy denied, or called as a no-op. The observe variant does not start any of the three change operations; each event records the applicability result for its manifest definition. M1 has no `VARIANT_DISABLED` reason, so M2-D follows the existing M1 contract and M2-B precedent.

For `api`, the same three definitions and events are Expected to be `success`. An eventual observation must not change the reason code or event count in this Expected contract.

## Canonical producer order

Both variants have one producer, `workerId: null`, and exactly 15 producer events:

```text
0  vite-late-plugin-module-checkpoint
1  vite-plugin-factory
2  vite-build-start
3  vite-attempt-environment
4  vite-attempt-file-read
5  vite-attempt-file-hash
6  vite-attempt-file-write
7  vite-attempt-loopback
8  vite-attempt-child
9  vite-designated-transform
10 vite-module-transform-change
11 vite-generate-bundle
12 vite-emitted-asset-change
13 vite-bundle-mutation-change
14 vite-write-bundle
```

The fixed totals are route `6`, capability attempt `6`, tool API change `3`, total producer events `15`, and producer-local sequence `0..14`. M2-D does not add a global sequence; that remains M3 collector responsibility.

The module-transform event describes the transform API result, not a final chunk hash. At `generateBundle`, the adapter verifies transform adoption, emitted-asset presence in `OutputBundle`, and the fixed entry-chunk bundle mutation. After `writeBundle`, the producer closes the session; only then does the parent harness validate the on-disk artifact inventory and hashes. A late validation, session close, process, artifact, or cleanup failure makes the run invalid and must not be converted into a normal 15-event Observed result.

## Fixed fixture and output shape

The Expected fixture contains exactly:

```text
fixture/entry.ts
fixture/designated.ts
```

Rollup has one input. The entry statically imports the designated module once and uses its value in a side effect so it cannot be tree-shaken. There is exactly one designated transform target. The fixture has no dynamic import, CSS, HTML entry, public asset, framework/plugin addition, or external dependency import.

Source, config, and plugin inputs use fixed LF and fixed literal markers. Their approved hashes remain unchanged in both variants. The observe output is one entry chunk. The API output is one entry chunk plus one fixed emitted asset. Bundle mutation does not increase file count. The direct marker is outside `outDir` in the dedicated probe output. Exact configured output names are mapped to fixed logical IDs; arbitrary bundle keys or filenames are not persisted.

## Build, watch, cache, and output contract

The resolved config must be validated fail closed against all of these Expected values:

- command `build`, mode `production`, plugin `apply: "build"`;
- legacy single-client build with `builder` unspecified;
- `build.watch: null`, no CLI `--watch`, and `build.write: true`;
- fresh owned canonical `outDir` with containment, ownership, identity, and emptiness preflight;
- `emptyOutDir: true` only after that preflight succeeds;
- `copyPublicDir: false` and `publicDir: false`;
- `manifest: false`, `ssrManifest: false`, and `sourcemap: false`;
- `minify: false`, `modulePreload: false`, `assetsInlineLimit: 0`, and `reportCompressedSize: false`;
- Rollup cache `false`;
- `optimizeDeps: { noDiscovery: true, include: [] }`; deprecated `optimizeDeps.disabled` is not used;
- one input, one output object, format `es`, fixed entry/chunk/asset filenames, and no dynamic chunk;
- a fresh Vite `cacheDir`;
- `envDir: false` and one fixed non-empty `envPrefix`.

Vite has no general `cache: false` option in this contract. The implementation must not invent or document one. Fresh owned cache and inventory checks provide the fixed cold-cache boundary.

The materialization gate separates three layers:

1. probe direct-marker materialization outside `outDir`;
2. three in-memory/official tool API change results;
3. ordinary Vite/Rollup output materialization in `outDir`.

The parent verifies source/config/plugin immutability separately from the variant-specific final output count and final artifact hashes.

## Temporary, process, and cleanup boundary

M2-D reuses the approved M2-C Expected lifecycle pattern, specialized for the Vite build:

- fixed direct spawn through `process.execPath`, fixed Vite CLI, fixed cwd/argv, and `shell: false`;
- run-specific `TMPDIR`, `TMP`, and `TEMP`;
- actual nearest `.vite-temp` pre/post absence with fail-closed inspection;
- fresh Vite cache canonical identity and inventory;
- Linux-only dedicated process group;
- fixed timeout and stdout/stderr output limits;
- on timeout/output-limit, TERM, bounded grace, then KILL;
- expected coordinator close disposition and process-group absence before cleanup;
- cleanup suppression whenever process settlement is unknown;
- fresh `outDir` ownership and canonical containment;
- variant-specific output file-count and final artifact-hash verification;
- esbuild child-process residue inspection;
- cleanup and absence checks for tool temp, Vite cache, `outDir`, and run root.

Successful tool close is exactly `{ code: 0, signal: null }`. A normal tool failure is distinguished as `{ code: nonzero, signal: null }`; it is not a timeout or signal disposition. Timeout/output-limit termination validates the expected TERM or KILL close disposition and proves the process group is absent. Signal failure, close deadline, unexpected disposition, or process residue leaves settlement unknown and suppresses cleanup that could race a live process.

Producer count `1` does not mean OS process count `1`. The plugin-event producer is the one Vite coordinator. Rollup is in-process under these fixed conditions. Esbuild may start a tool-owned child process, whereas the fixed-child capability is a separate probe-owned child attempt. Whether Vite/esbuild children settle inside the dedicated process group must be measured during implementation; Expected documentation does not claim that result in advance.

## Evidence data policy

Producer events, the local segment, and sanitized summaries must not persist:

- raw source, transformed code, bundle code, or emitted asset content;
- raw config;
- raw, absolute, or temporary paths;
- raw errors, stacks, stdout, or stderr;
- executable or script paths;
- loopback body;
- raw canary values or canary digests;
- Rollup reference IDs;
- raw module IDs;
- arbitrary bundle keys or filenames.

They may persist only schema-approved fields, including fixed logical IDs, normalized outcome/reason, approved source/tool/output hash and byte size, `changed`, duration, route/checkpoint, producer-local sequence, Node/Vite version, sanitized Rollup/esbuild version metadata, PID/PPID, and `workerId: null`. Npm `11.12.1` may appear only as launcher policy metadata and never as proof of npm execution in the plugin process.

## Expected acceptance summary

| Variant | Route | Capability | Tool API change | Total | Producer sequence | Producer | Worker ID |
|---|---:|---:|---:|---:|---|---:|---|
| `observe` | 6 | 6 | 3 `skipped / NOT_APPLICABLE` | 15 | `0..14` | 1 | `null` |
| `api` | 6 | 6 | 3 `success` | 15 | `0..14` | 1 | `null` |

Implementation acceptance requires the exact command/config/fixture/version contract, exact event order and counts, source/config/plugin immutability, the three distinct API results, variant-specific output materialization, close/process settlement, and owned-boundary cleanup. Missing or extra events, unexpected transform targets, version/config drift, failed materialization validation, or late process/output/cleanup failure invalidate the run rather than altering Expected.

The implementation is the private ESM workspace `packages/vite-plugin-probe`, with Vite exact `6.4.3` as a direct dependency. Its package root is import-safe; only the dedicated `./plugin` entry creates the coordinator-owned probe session. Fixed local commands are `npm run m2d:verify`, `npm run m2d:run:observe`, and `npm run m2d:run:api`. The static verifier is scoped inspection and is not a runtime sandbox proof. Local summaries retain only fixed logical IDs, normalized results, approved hashes/sizes/counts, sanitized versions, and process context; raw code/config/path/error/output/reference identifiers are not persisted.

Implementation verification fixes the observe output at one entry chunk and API output at one entry chunk plus one emitted asset, confirms source/config/plugin input hashes unchanged, confirms the direct marker remains outside `outDir`, and rejects API-result/disk mismatches. Fresh run-specific tool temp/cache/outDir/run roots and the actual nearest `.vite-temp` boundary are inventoried fail closed. Successful runs require close `{ code: 0, signal: null }`, process-group absence, no esbuild residue, complete segment close, and owned cleanup. Producer 1 remains the Vite coordinator and does not mean OS process 1.
