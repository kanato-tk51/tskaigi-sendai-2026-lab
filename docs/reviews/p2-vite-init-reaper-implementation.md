# P2 selected Vite `20260723-01` init/reaping implementation and execution-gate review

## Review target and decision

- Target: the fixed Docker-free implementation and ignored Vite staging
  candidate described by
  [`p2-vite-init-reaper-contract.md`](../p2-vite-init-reaper-contract.md)
- Review type: fresh independent Docker-free read-only implementation and
  execution-gate review
- Decision: **APPROVED for at most one later exact argument-free
  `npm run p2:execute:vite` pair invocation**
- Blocking findings: none
- Non-blocking findings: none
- Docker execution or result creation in this review: not performed
- Selected Vite and experiment-matrix `Observed`: unchanged and unmeasured

This is an independent Codex review, not a separate human review. The gate
requires a fresh worker to reproduce the candidate hashes, exact staging
identity, fixed argument-free script, and absence of only the two exact new
roots immediately before the invocation. The permissive member must complete
before constrained setup, and no outcome may be retried.

## Reproduced candidate identity

All ten fixed candidate SHA-256 values matched the saved review prompt:

| Path | SHA-256 |
|---|---|
| `containers/presentation-profiles/src/plan.ts` | `d9bea3ae3cf423fed30b78d991e6cfe265bea8890008569b2f35528ab1c1cd67` |
| `containers/presentation-profiles/src/vite-executor.ts` | `a22a5f4495ed0ab214bb7a042f0a6edeb7cd06aad496b883f4968b4c531591dc` |
| `containers/presentation-profiles/src/vite-projection.ts` | `6867db19debc466506297e54755f38542df54cfd49b4bf3281b7e727339d6f63` |
| `containers/presentation-profiles/runner/vite-runner.js` | `4c5f2c49e6b9837ae33f9cb31237a6ce980e7d720753b7c2ad1b706b5edac291` |
| `containers/presentation-profiles/test/plan.test.ts` | `1dc30f12fc4877bcebc2d68afe730ed5b22a7628e874d0175dce65087fe20b91` |
| `containers/presentation-profiles/test/vite-executor.test.ts` | `056e4a06e645a0c962419e4da4ff7276b65838fe67e085d459e395055bb698ad` |
| `containers/presentation-profiles/test/vite-projection.test.ts` | `0e604555adc7d3bd071870a6f1ce67941e29e682e8901bc677c753720cf99197` |
| `containers/presentation-profiles/test/vite-runner.test.ts` | `0ee0057bfaad30d3cd3f704f8a6d76f0fbbbc300dc0bf536dfb4f4bb15efa28b` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `0df6d8c1d6a497b39c59c45575530d56bd3a578b48720276c943b18e80859f6e` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `dae8ec15118adb8257c8c8e3964d493ada08dcf51df83de331bf84b10679292b` |

The review prompt is 6,574 bytes with SHA-256
`6dd17fe63d0f24b8d3997fd67da400a42bb6fcd20e42e87f446b97f205dce835`.

An independent plan-order assertion reproduced both unchanged codegen create
arrays. They contain no `--init` and retain repository-path-bound JSON-array
SHA-256 values
`ab856cdef8ad5517ca841a82d453d385082167173eb15050f98ad12f6212089b`
for permissive and
`b6cec25b06911189cb981870cfc92981046b70a27665ae0b98bf8987cab6bd04`
for constrained.

The ignored Vite staging root is a non-symlink directory containing exactly
128 regular non-symlink files and no extra file. Every file is byte-equal to
its declared source and has its exact `0444` or `0555` mode. The canonical
plan-order JSON array of `{targetPath,mode,sha256}` records has SHA-256
`8803f5b5cec7dedb2168a03087f9e574f1d380e81602ebc2c8d722783859bd20`.
The staged Vite/Rollup/esbuild versions are `6.4.3` / `4.62.2` / `0.25.12`.

Fixed-path checks found only these two proposed roots absent, both before and
after compiled imports:

- `results/runs/p2-selected-profiles/p2-vite-observe-p-20260723-01`
- `results/runs/p2-selected-profiles/p2-vite-observe-c-20260723-01`

Their parent was not enumerated.

## Implementation closure

### Init and inspect binding

Only the selected Vite create arrays contain `--init`. The exact prefix is
`create`, `--init`, `--name`, the fixed container name, `--pull`, `never`;
the flag is literal, value-free, occurs once at index 1, and is revalidated by
the executor before any lifecycle command. Focused regressions reject a
missing, duplicated, or repositioned flag.

The inspect format is exactly:

```text
{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.HostConfig.Init}}|{{.State.Status}}|{{.State.ExitCode}}
```

The parser requires exactly six fields and accepts the fourth only as literal
`true`. Both the created-state and final owned-container inspections pass
through the same parser and ownership check, which retains
`initConfigured: true` with the exact container ID, configured image, image
ID, state, and safe integer exit. Missing, false, differently cased, empty,
extra, duplicated, malformed, and changed final values fail with the sanitized
inspect-invalid boundary. The changed-final regression writes only the
canonical Inconclusive attempt and reaches neither evidence nor receipt.

### Identity, settlement, and evidence gates

The plan, M2-D scenario context, runner, Vite projection, executor, progress,
attempt, receipt, and pair paths bind only the exact
`p2-vite-expected-20260723-01` revision and the fixed permissive/constrained
run and container tuple. Focused negatives reject all accepted historical
generations and the obsolete static tuples.

The init change does not alter child or server settlement. In particular, a
natural close followed by detected post-close process-group residue publishes
the residue, may publish later proved group absence, then remains
`child-settled: known-failure`; it cannot export output or become a receipt.
The existing unknown-Docker-settlement suppression, writer-stop progress
barrier, regular-evidence validation, receipt predicates, permissive-first
sequence, same-image pair rule, `repository-cooperative-fixture` limitation,
and no-retry rule remain covered by the passing P2 suite.

Configured init is therefore configuration intent only. It is not evidence of
daemon init support, reaping, process-group absence, container or runner
settlement, capability behavior, or `Observed`.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Fixed-path `sha256sum` over the ten candidate files | Exit 0; all hashes matched the saved prompt. |
| Independent codegen create-array assertion | Exit 0; both 36-argument arrays contain zero `--init` values and reproduce the two fixed hashes. |
| Independent production-source and compiled-plan assertion | Exit 0; obsolete Vite tuples are absent, pair order is permissive then constrained, the exact init/inspect binding is retained, and six invalid init projections are rejected. |
| Independent staging byte/mode/inventory/manifest/version assertion | Exit 0; 128 source-equal regular files, exact modes, manifest `8803f5b5...`, and versions `6.4.3` / `4.62.2` / `0.25.12`. |
| Focused P2 plan/executor/projection/runner tests | Exit 0; 4 files / 77 tests passed. |
| Focused M2-D scenario-context tests | Exit 0; 1 file / 19 tests passed. |
| `npm run p2:verify` | Exit 0; typecheck passed and 9 files / 122 tests passed. |
| `npm run p2:build` | Exit 0; probe-core, M2-D, M2-E, and presentation-profile compilation passed. |
| Compiled executor/argument-free entry import and exact-root assertion | Exit 0; both modules imported without execution or root creation, and the two compiled plans retain the exact new tuple and `--init`. |
| `npm run m2d:verify` | Exit 1 after typecheck, build, and static verification passed; 9 files / 60 tests passed and 23 integration tests failed only with `M2D_VERSION_MISMATCH` on host Node `v22.23.1` versus fixed Node `v20.18.2`. |
| Focused Prettier check over review-owned Markdown | Exit 0; all named files matched repository formatting. |
| `git diff --check` after review edits | Exit 0. |

The M2-D full-suite exit is the unchanged fixed-toolchain limitation recorded
by the implementation handoff. It does not justify weakening the Node contract
and does not contradict the separately passing focused scenario-context,
static, typecheck, build, or P2 checks.

## Gate boundary and limitations

The approved later worker may invoke only the repository-recorded
argument-free `npm run p2:execute:vite` pair command, at most once, after
reproducing all reviewed identities and the two exact root absences. It may use
the continuing-work standing authorization for that already reviewed fixed
action; this review is not a separate human approval. The command must not be
retried, and constrained setup remains impossible unless permissive produces a
complete receipt.

This review did not call Docker, access a runtime socket, execute the pair,
probe, or lifecycle fixture, inspect or enumerate a historical result root,
create or mutate result state, rebuild or repair staging, pull an image, use
external network or credentials, access frozen M4 retained state, perform
Remote Git, publish, deploy, or communicate with a third party. Standing
authorization was not used in this review.

Docker `--init` availability, the daemon-selected init implementation, actual
subreaping behavior, whether the fifth residue was live or unreaped, future
process-group absence, and every selected-Vite capability outcome remain
unresolved runtime facts.

Next: in a fresh worker, revalidate the approved hashes, exact 128-file staging
identity, fixed argument-free script, and only the two exact new-root absences,
then invoke `npm run p2:execute:vite` at most once under standing authorization;
do not retry.
