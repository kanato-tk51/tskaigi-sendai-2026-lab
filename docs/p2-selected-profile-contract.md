# P2 selected profile evidence contract

Status: **Expected and the non-executing four-scenario Docker create plan are
fixed; codegen exact context, separated runtime bindings, sanitized projection,
fixed runner source, exact staging assembly, and focused codegen review are
complete; the minimal codegen executor is implemented but independently
unreviewed; execution and all selected Observed remain unmeasured**.

Contract date: 2026-07-19

This is the presentation-MVP contract for the only four profile runs needed by
C-02 through C-04. It fixes inputs and Expected outcomes before execution. For
P2 it supersedes the stale codegen projection in `experiment-matrix.md`, whose
whole-file M2-D snapshot remains frozen until runner implementation updates its
guard without weakening the Observed boundary. It does not approve a Docker
command or create runtime evidence.

## Four-run boundary

Run exactly these scenarios:

1. `vite-observe-p`
2. `vite-observe-c`
3. `codegen-observe-p`
4. `codegen-observe-c`

Do not add baseline, API, watch, cache, parallel, or M4 control/recovery runs.
The runner exposes no caller-selected image, command, argument, mount, path,
environment key, or runtime option.

## Adapter binding

The matrix scenario ID, profile, and run ID are fixed before the adapter creates
its producer session. Existing local output must not be relabeled as profile
evidence.

| Scenario | Profile | Existing adapter | Route / capability / tool change / total |
|---|---|---|---:|
| `vite-observe-p` | permissive | M2-D `observe` | `6 / 6 / 3 / 15` |
| `vite-observe-c` | constrained | M2-D `observe` | `6 / 6 / 3 / 15` |
| `codegen-observe-p` | permissive | M2-E `observe` | `5 / 6 / 1 / 12` |
| `codegen-observe-c` | constrained | M2-E `observe` | `5 / 6 / 1 / 12` |

The codegen mapping uses the complete reviewed M2-E sequence; it does not
filter the producer down to the two route events previously projected by the
matrix:

```text
0  codegen-cli-startup
1  codegen-argument-parse
2  codegen-generation-start
3  codegen-attempt-environment
4  codegen-attempt-file-read
5  codegen-attempt-file-hash
6  codegen-attempt-file-write
7  codegen-attempt-loopback
8  codegen-attempt-child
9  codegen-generation-api-change
10 codegen-file-write
11 codegen-completion
```

The file-hash event is an integrity measurement, not a sixth capability. The
codegen tool-change event and all three Vite tool-change events remain
`skipped / NOT_APPLICABLE` because this is the observe variant.

## Fixed pair inputs

- Each permissive/constrained pair uses identical immutable image and staged
  fixture/config/adapter bytes. The already-local Linux/amd64 Node base is
  available by repository digest
  `node@sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`;
  P2 requires no registry access and does not require a new image builder.
- Vite uses Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, esbuild
  `0.25.12`, the existing fixed fixture, and
  `vite build --config vite.scenario.config.ts --configLoader runner --mode production`.
- Codegen uses Node.js `v20.18.2`, the existing fixed input/snapshot, and
  `node dist/cli.js observe` with no additional arguments.
- Profile policy may change only the canary exposure and fixed permission
  options required to produce the Expected differences below.

## Expected outcomes

Every capability stays enabled in the manifest and is attempted. A constrained
outcome must not be replaced by `manifest-skip`.

| Scenario | Environment | File read | Source hash | Direct write | Loopback | Fixed child |
|---|---|---|---|---|---|---|
| `vite-observe-p` | success | success | success, unchanged | success | success | success |
| `vite-observe-c` | absent | missing/denied | success, unchanged | denied | failure | success; limitation |
| `codegen-observe-p` | success | success | success, unchanged | success | success | success |
| `codegen-observe-c` | absent | missing/denied | success, unchanged | denied | failure | denied |

The Vite constrained build needs its pinned esbuild child process. Therefore
this pair cannot demonstrate child denial without changing the tool execution;
the successful probe child remains visible as a limitation. Codegen has no such
tool requirement and may omit child permission while still attempting the fixed
probe child.

These are hypotheses. Missing attempts, unexpected reason codes, timeouts, or
incomplete adapter output become mismatches or `inconclusive`; Expected is not
rewritten after observation.

## Minimal runner and evidence boundary

The implementation adds one presentation-only fixed runner, separate from the
frozen M4 recovery path. Before the four runs, perform one focused
Docker-non-executing review of the runner and its exact commands.

The runner must use a credential-empty disposable Docker config and fixed CLI,
run non-root with source read-only, keep tool/result/direct-write paths
separate, bound time and output, disable external network, and never mount or
forward the Docker socket. Permissive loopback is an experiment-owned service;
neither profile contacts an external host. Only repository-owned staged inputs
and run-owned writable directories may be mounted.

For each scenario retain the scenario/profile/run IDs, image ID, tool versions,
closed adapter events, source before/after hash, and bounded output inventory.
Sanitized results exclude canary values, file contents, absolute host paths,
environment values, raw errors, commands, and credentials.

One complete run per scenario is sufficient for the narrow presentation
comparison. It is not a reproducibility claim or evidence for unselected matrix
rows. P4 will create the talk-facing projection and show the Vite child
limitation beside it.

Next implementation scope is limited to the fixed scenario binding, runner,
small result projection, and relevant tests. Generic collectors, offline image
builders, cleanup-recovery state machines, retained M4 state, P3 artifacts, and
P4 evidence-map work are out of scope.

## Implementation status

`containers/presentation-profiles/src/plan.ts` now provides an argument-free,
immutable four-scenario plan. Static/unit verification fixes the local image
reference, pair-identical staging roots and semantic commands, separate run
roots, and Docker `create` arguments for offline, non-root, read-only execution
without a runtime-socket mount.

This is configuration intent, not runtime evidence. The codegen runner source
fixes its two selected identities, child environment, loopback service,
permission arguments, timeout, and output limits. Its argument-free assembly
copies exactly 30 regular files: the runner/snapshot/package bytes, nine codegen
CLI modules, and the probe-core package plus 17 runtime modules. It rejects an
existing staging root, symlink/non-file sources, duplicate copies, and escaping
targets. A local offline assembly verified the 30-file inventory and module
resolution; generated staging remains ignored. No Docker command is exposed or
executed, and `experiment-matrix.md` remains unchanged. The next slice is the
focused Docker-non-executing review of this codegen plan, runner, and staged
inventory required before an executor may be added.

Codegen binding update (2026-07-19): M2-E accepts only the exact
`codegen-observe-p/c` scenario, run, and profile tuples recorded by this
contract. It binds the scenario ID before manifest/session creation and keeps
the existing local M2-E context unchanged. Its selected runtime binding now
separates the event, tool/canary, read-only source snapshot, and direct-write
roots; the constrained Docker plan mounts the direct-write root read-only. A
small projection retains exact identity/order/counts and separates expected
matches, mismatches, and inconclusive streams without raw fields. The fixed
runner source and exact closure can now be assembled offline; the executor
remains absent, so this update creates no profile observation.

## Focused codegen non-executing review

Review date: 2026-07-19. Result: **approved for minimal executor implementation,
not approved as runtime evidence**.

The review checked the fixed image/CLI/create arguments, pair-shared 30-file
staging bytes, read-only and separated mounts, non-root user, network-none plus
loopback-only service, fixed child command, bounded output/time, and sanitized
projection. Local Node.js `v20.18.2` help confirms the repeated
`--allow-fs-read`, `--allow-fs-write`, and omitted `--allow-child-process`
options used by the constrained runner. No Docker command was called.

One finding was fixed before approval: Node.js denies an unpermitted spawn by
synchronously throwing `ERR_ACCESS_DENIED`. `probe-core` previously normalized
that path to `INTERNAL_ERROR`; it now emits the intended sanitized
`CHILD_PROCESS_FAILURE`, with a unit test that excludes the raw error. The
rebuilt local staging again matches all 30 fixed sources byte-for-byte.

## Minimal codegen executor implementation

The argument-free executor now selects only `codegen-observe-p/c`. It verifies
the 30 staged bytes, creates an empty disposable Docker config and fresh
UID-writable run directories, then fixes the `/usr/bin/docker` sequence to
`create`, identity/state `inspect`, attached `start`, a second `inspect`, and
force-removal of the named disposable container. Each CLI call is bounded to 20
seconds and 16 KiB combined output; commands inherit only `DOCKER_CONFIG`.

The runner makes its exact event segment host-readable, records source
before/after hashes, and also makes a partial segment readable on failure. The
executor discards raw CLI stderr, parses bounded JSONL into the existing
allowlisted projection, preserves nonzero/partial runs as `inconclusive`, and
writes a small receipt containing fixed identities, image ID, tool versions,
output presence/sizes, hashes, and the projection. It never copies commands,
canary values, raw errors, contents, environment values, or absolute host paths
into the receipt.

This implementation has static/unit coverage and a successful compiled import,
but no Docker command has been executed. A fresh independent read-only review of
the executor and exact command sequence is required before the recorded
`npm run p2:execute:codegen` command may be used. This is configuration intent,
not Observed evidence.
