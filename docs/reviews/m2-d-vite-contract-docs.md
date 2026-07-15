# M2-D Vite plugin adapter Expected contract independent review record

## Review target

- Target: M2-D Expected-only documentation contract
- Branch: `m2-d-vite-contract-docs`
- Base HEAD: `39533ea`
- Review target: the uncommitted working-tree snapshot identified below
- Review type: initial independent read-only docs review; B-01 focused remediation; focused read-only independent re-review
- Reviewer source changes: none
- Implementation status: not started
- Experiment-matrix Observed: unmeasured

The review task did not change files. This closure task creates this review record and updates only review metadata, status, and the index link. It does not change the reviewed contract body, implement M2-D, or create Observed evidence.

## Gate decision

- Decision: `APPROVE WITH NON-BLOCKING FOLLOW-UPS`
- Blockers: none
- Resolved finding: B-01
- Non-blocking note: the pre-remediation six-document snapshot limitation recorded below

This decision approves the implementation-prerequisite Expected-only documentation gate. It does not approve M2-D runtime implementation, local integration, a 15-event observation, experiment-matrix Observed evidence, profile enforcement, artifact materialization, process settlement, milestone completion, a commit, publication, or a pull request. M2-D implementation requires a separate implementation review gate.

## Reviewed snapshot identity

The following identity was captured before this closure edited any file.

| Field | Value |
|---|---|
| Branch | `m2-d-vite-contract-docs` |
| HEAD | `39533ea` |
| Tracked diff fingerprint | `66e52f0df37b7ae6e3be06b653c7f2f475f24c246d904baf94be83c16c42c6a0` |
| Untracked content fingerprint | `6d260b2968d8a51668e5159b7e16a6005b04a944d0f2afd8b6e878a17c0a44e3` |

The tracked fingerprint is SHA-256 of `git diff --binary --no-ext-diff`. The untracked fingerprint is SHA-256 of the stream produced, in `git ls-files --others --exclude-standard -z` order, by writing each path followed by NUL and then that file's `sha256sum` output. The raw diff is intentionally not copied into this record.

The changed-file allowlist at that snapshot was exactly:

```text
docs/architecture.md
docs/experiment-matrix.md
docs/experiment-protocol.md
docs/index.md
docs/milestones.md
docs/m2-d-vite-plugin-adapter.md
```

The full SHA-256 values of the six reviewed documents were:

| Document | SHA-256 |
|---|---|
| `docs/architecture.md` | `0e111e70cf0f3ac2f2ce453b04e691df600b8607d2659093a41197eb4aa9fb51` |
| `docs/experiment-matrix.md` | `80ab99c890bc2eca2b5ade839e0195b032a702cc450ed3f7fecd8a5706e535b0` |
| `docs/experiment-protocol.md` | `f597e0e1e10eb202b3878ef13224117c7998fce179caf8932bb23ece8340257d` |
| `docs/index.md` | `a264d68adab6b51de4f56276aaf85c7b0fc8d2b007e5e7990a5299360aede774` |
| `docs/milestones.md` | `d60638e08fa1d598d0caa570985095b45891a1253c21176409b458a9936a2205` |
| `docs/m2-d-vite-plugin-adapter.md` | `a1dec7bd36a75377ec8ef70dec0afe0f2c6762d799452ee60da33e63f2f9b4e4` |

These hashes support document snapshot identity only. They do not, by themselves, prove semantic correctness, harmlessness, provenance, or approval of the content.

## Approved fixed conditions

| Component | Version | Contract role |
|---|---|---|
| Node.js | `v20.18.2` | producer process runtime |
| npm | `11.12.1` | launcher metadata, not evidence of npm execution in the plugin process |
| Vite | `6.4.3` | producer tool and fixed CLI/config contract |
| Rollup | `4.62.2` | fixed hook and output semantics |
| esbuild | `0.25.12` | fixed transform/output and tool-owned child conditions |

Implementation must direct-pin Vite exact `6.4.3` from the M2-D workspace. The only fixed semantic command, executed from the fixed adapter cwd, is:

```text
vite build --config vite.scenario.config.ts --configLoader runner --mode production
```

The launcher uses `process.execPath`, a fixed Vite CLI path and argv, and `shell: false`. It accepts no user argv or arbitrary config, mode, cwd, executable, PID, or signal. The scope is build-only, production-only, one fixed `observe` or `api` variant. Dev, serve, preview, watch, and HMR are out of scope. `configLoader: runner` is experimental in the pinned Vite `6.4.3` and is part of the fixed contract.

## Route contract

Exactly six route events are Expected:

| Order | Route ID | Trigger |
|---:|---|---|
| 1 | `vite-late-plugin-module-checkpoint` | `configured` |
| 2 | `vite-plugin-factory` | `configured` |
| 3 | `vite-build-start` | `automatic` |
| 4 | `vite-designated-transform` | `automatic` |
| 5 | `vite-generate-bundle` | `automatic` |
| 6 | `vite-write-bundle` | `automatic` |

The module checkpoint is not evaluation start. Failure before it is an invalid run, and zero events do not prove that the module was unevaluated. The factory is a separate config-driven call boundary. The trusted `configResolved` validator is control plane, not a dependency route. The designated transform is the one exact logical target admitted by the fixed filter, not the number of all transform hook invocations.

## Capability and tool API change contract

Immediately after `vite-build-start`, exactly six capability attempts occur in fixed order: environment, file read, source hash, direct filesystem write, loopback, and fixed child. Their outcomes depend on profile, but their count does not depend on the module graph. The probe direct marker is not a tool API change, and ordinary Vite output writing is not the probe direct-write capability.

Exactly three distinct official tool API changes are defined:

1. `module-transform` for the designated transform result;
2. `emitted-asset` for the fixed `this.emitFile` result;
3. `bundle-mutation` for the fixed entry chunk mutation.

The transform result, source file, and final chunk are separate evidence. The emit return, `OutputBundle` materialization, and disk write are separate. Bundle mutation is a separate target from the transform and asset and does not add a file. Ordinary output writing is not a fourth tool event, and the probe direct marker is not a tool event.

## Variant semantics

For `vite-observe-p` and `vite-observe-c`, all three tool API change definitions/events have:

```text
outcome: skipped
reason: NOT_APPLICABLE
changed: false
before/after hash: null
before/after size: null
operation: not started
```

This is not API absence, policy rejection, a successful no-op, or a failure after operation start.

For `vite-api-p` and `vite-api-c`, module transform, emitted asset, and bundle mutation are each Expected to execute successfully. The official API operation can be successful in both profiles while API result, `OutputBundle`, disk materialization, source write, and probe direct write remain separate evidence. The documented non-Vite generation API and source-fixer hypotheses remain intact, and no generic hypothesis overrides the Vite route/variant-specific Expected contract.

## Counts and producer order

Both variants have Expected route `6`, capability `6`, tool API change `3`, total `15`, producer `1`, producer-local sequence `0..14`, `workerId: null`, and no global sequence.

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

These are Expected counts and order, not Observed results.

## Fixture and output contract

The fixed fixture contains only `fixture/entry.ts` and `fixture/designated.ts`. It has one input, one static import of the one designated target, and a side-effect use that prevents tree-shaking. It has no dynamic import, CSS, HTML/public asset, framework, added plugin, or external import.

Observe is Expected to produce one entry chunk. API is Expected to produce one entry chunk plus one fixed asset. Bundle mutation does not increase the file count. The probe direct marker is outside `outDir`. Source, config, and plugin hashes remain unchanged, independently of build-output changes.

## Build, watch, cache, and output contract

The fixed boundary is one production client build with `builder` unspecified, no watch, `build.write: true`, and a fresh owned canonical `outDir`. `emptyOutDir` is enabled only after successful containment, ownership, identity, and emptiness preflight. Public copying, publicDir, manifest, SSR manifest, sourcemap, minify, module preload, and compressed-size reporting are disabled. `assetsInlineLimit` is `0`.

Rollup cache is `false`. Optimize-deps is exactly `{ noDiscovery: true, include: [] }`; deprecated `optimizeDeps.disabled` and a nonexistent general Vite `cache: false` option are not used. There is one input and one output object, ES format, fixed filenames, a fresh cacheDir, `envDir: false`, and a fixed non-empty `envPrefix`. Trusted resolved-config validation fails closed on drift.

## Temporary and process boundary

The Expected lifecycle uses run-specific temporary state; pre/post absence of the actual nearest `.vite-temp`; Vite cache and `outDir` inventory; a Linux dedicated process group; fixed timeout and stdout/stderr limits; TERM, bounded grace, then KILL; expected close disposition; group absence; and cleanup suppression when settlement is unknown. Success close and normal nonzero close remain distinct. Output inventory/hash, owned cleanup, and esbuild child residue are later validation gates.

Producer count `1` is not OS process count `1`. Rollup is in-process only under the fixed conditions. Esbuild may start a tool-owned child, while the fixed-child capability is a separate probe-owned child. Process-group handling is not a portable security sandbox. Esbuild/process-group settlement remains unmeasured until implementation.

## Evidence data policy

The producer segment and sanitized summaries must not retain raw source, transformed/bundle/asset content, raw config, raw/absolute/temporary paths, raw errors/stacks/stdout/stderr, executable paths, loopback body, raw canary values or digests, Rollup reference ID, raw module ID, or arbitrary bundle key/filename.

They may retain schema-approved fixed logical IDs, normalized outcome/reason, approved hash/size, `changed`, duration, route/checkpoint, producer-local sequence, sanitized versions, PID/PPID, and `workerId: null`.

## Findings history

### B-01 — Expected-contract ambiguity

- Classification: blocking documentation ambiguity
- Original issue: Vite observe/API variant semantics conflicted with a generic tool API hypothesis, leaving it ambiguous whether observe operations ran, were unavailable, were policy denied, were successful no-ops, or failed after start.
- Additional risk: narrowing the generic rows could also erase or incorrectly override the documented non-Vite generation API and source-fixer hypotheses.
- Remediation: `vite-observe-p` / `vite-observe-c` now have variant-specific, operation-not-started `skipped/NOT_APPLICABLE`, `changed: false`, null hash/size semantics. `vite-api-p` / `vite-api-c` retain three successful official operations. Non-Vite generation and source-fixer hypotheses remain, and generic hypotheses explicitly do not override route/variant-specific Expected values.
- Focused re-review evidence: the current Git diff, relevant content, mtimes, and targeted section comparisons were checked; the Vite variant rows, generic Vite rows, non-Vite generation/fixer rows, protocol semantics, and cross-document 6/6/3/15 order agree.
- Closure: `RESOLVED`

## Non-blocking snapshot note

Immediately before focused remediation, full hashes of all six documents had not been saved. Consequently, byte identity of the other five documents against that exact pre-remediation snapshot cannot be proven by a direct cryptographic comparison. The focused re-review used the current Git diff, content, mtimes, and targeted section comparison and found no unexpected change. This closure preserves full hashes for the current approved six-document snapshot.

This limitation does not block current contract approval and is not a code or runtime defect. Hashes assist identity checks only; they do not independently establish semantic correctness or harmlessness.

## Verification

The focused read-only re-review recorded:

- format check: passed;
- lint: passed;
- typecheck: passed;
- root tests: 40 files, 230 tests passed;
- root `npm run check`: passed;
- `git diff --check`: passed;
- runtime/package/dependency/lockfile differences: none;
- experiment-matrix Observed and evidence location: unchanged;
- M0/M1/M2-B/M2-C status: unchanged.

Closure verification on 2026-07-16 recorded:

- `npm run format:check`: passed;
- `npm run lint`: passed;
- `npm run typecheck`: passed;
- `npm test`: 40 files, 230 tests passed;
- `npm run check`: passed, including 40 files and 230 tests;
- `git diff --check`: passed;
- final changed-file allowlist: the three protected reviewed documents, the three closure-updated status/link documents, and this new review record only;
- all six recorded full hashes and both fingerprints: present once in this record and equal to the captured pre-closure values;
- `docs/architecture.md`, `docs/experiment-matrix.md`, and `docs/experiment-protocol.md`: unchanged from their pre-closure SHA-256 values;
- removal of only the closure status/link additions from index, milestone, and design note reproduces their recorded pre-closure SHA-256 values;
- normalized event-order hash across architecture, matrix, protocol, milestone, design note, and this record: one identical value, `b887e4080223781dc72e72c16b61147d2844411eab8647d7a9187393f405d45e`;
- route/capability/tool/total counts, observe/API semantics, Expected/Observed separation, and implementation-not-started status: cross-document consistent;
- experiment-matrix Observed and evidence location, npm/ESLint/Vitest/codegen rows, M0 Inconclusive, and M0/M1/M2-B/M2-C status: unchanged by closure;
- runtime, package, tests, fixtures, static verifiers, dependencies, lockfile, README, spike note, and existing review records: unchanged;
- external network, Docker, instrumented lifecycle execution, Vite build, commit, push, and PR operations: not used.

## Remaining boundaries

- M2-D runtime implementation and local integration have not started.
- The 15 events, artifact materialization, and esbuild/process-group settlement have not been measured.
- Experiment-matrix Observed and evidence locations remain unmeasured and unchanged.
- Permissive/constrained enforcement has not run.
- M3 collector, global sequence, canonical merge, summary, and reporting are not implemented.
- No external network, Docker, instrumented install lifecycle experiment, or Vite build is authorized or required for this closure.
- No commit, push, branch publication, pull request, or merge is part of this closure.
