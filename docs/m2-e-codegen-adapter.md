# M2-E explicit code-generation CLI adapter

## Status and contract role

Status: **M2-E implementation complete; independent review approved with non-blocking follow-ups; blockers: none; experiment-matrix Observed unmeasured**. The decision and remaining boundaries are recorded in the [independent review record](reviews/m2-e-codegen-adapter.md).

This document is the canonical Expected contract for the fixed project-owned code-generation CLI adapter. Local contract runs are not experiment-matrix Observed evidence and do not compare permissive/constrained profiles. Expected is not changed to fit a local result.

## Fixed command and modes

The adapter is the private ESM package `@tskaigi-lab/adapter-codegen` in `packages/codegen-probe`. The CLI launcher uses only:

```text
process.execPath dist/cli.js <fixed-mode>
```

The only modes are `observe`, `api`, and `dry-run`. The CLI accepts exactly one mode argument and rejects every other argument, path, command, or option.

All route events use `triggerType: explicit`, because the CLI is intentionally started by an explicit fixed command. The package root is import-safe; only the dedicated CLI entry creates a probe session.

## Fixed route and event contract

Every mode produces one producer with `workerId: null`, five route events, six capability attempts, one tool API change event, and twelve producer events in this order:

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

The fixed route phases are startup, argument parsing, generation start, file write, and completion. Capability attempts run in the fixed order immediately after generation start. The generator API change is `emitted-asset` on the fixed artifact target.

| Mode | Direct filesystem write | Generator API | Materialized output |
|---|---|---|---|
| `observe` | `success` | `skipped / NOT_APPLICABLE` | direct marker only |
| `api` | `skipped / MANIFEST_DISALLOWED` | `success` | one fixed generated artifact |
| `dry-run` | `skipped / MANIFEST_DISALLOWED` | `skipped / NOT_APPLICABLE` | none |

The documented generator API accepts one fixed input and returns one fixed artifact. Its API result hash/size and the final output hash/size are validated separately. The direct marker is outside the output directory and is never treated as a generator API change.

## Safety and evidence boundary

- Only `PROBE_CANARY_M2E_*` environment variables are read by the CLI.
- The CLI reads one repository-owned fixture input and one run-owned canary/snapshot binding; arbitrary paths are not accepted.
- The parent runner uses `process.execPath`, the fixed repository-owned `dist/cli.js`, fixed cwd/argv, and `shell: false`.
- The only network target is the fixed loopback canary at `127.0.0.1`; no external network is used.
- Raw input, generated content, canary values, paths, errors, stdout/stderr, and diffs are rejected from producer segments and summaries.
- Output containment, source/input immutability, event order, version, materialization, and cleanup are fail-closed.
- The static verifier is scoped inspection and is not a runtime sandbox proof.

## Verification boundary

Fixed local commands are:

```sh
npm run m2e:verify
npm run m2e:run:observe
npm run m2e:run:api
npm run m2e:run:dry-run
```

The local runner stores sanitized producer segments and summaries under ignored `results/runs/m2-e-codegen/<mode>/<run-id>/`. M3 collector/global sequence/reporting and M4 profile enforcement remain out of scope.
