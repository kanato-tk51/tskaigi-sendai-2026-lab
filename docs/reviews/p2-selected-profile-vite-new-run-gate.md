# P2 selected Vite new-run-ID execution-gate independent review

## Review target and decision

- Target: the fixed `20260719-02` Vite context, plan, runner, projection,
  executor, focused tests, and exact 128-file staging candidate
- Review type: fresh independent Docker-non-executing static/unit gate review
- Decision: **APPROVED for the exact one-shot Vite execution gate**
- Blocking findings: none
- Non-blocking findings: none
- Docker execution: approved only through the argument-free
  `npm run p2:execute:vite` command; not performed by this review
- Selected Vite profile Observed: unmeasured
- Experiment-matrix Observed: unchanged

The active M2-D context, selected plan, fixed runner, bounded projection, and
executor all bind the permissive and constrained scenarios to the exact
`p2-vite-observe-p/c-20260719-02` run IDs. The create plan and every executor
inspect, attached-start, and force-remove command use the matching distinct
`tskaigi-p2-vite-observe-p/c-20260719-02` container name. Neither name depends
on inspecting, removing, renaming, or reusing the exhausted runtime state.

Focused regressions accept the two new tuples and reject both exhausted
`20260719-01` tuples. The P2-V04/P2-V05/P2-V06 attempt-before-evidence,
partial-lifecycle, serial preflight, `partially-inspected`, settlement, and
cleanup boundaries remain covered. Current codegen-specific executor,
projection, runner, entry, test, and staging-source hashes still equal their
independently approved values; the plan retains the exact accepted codegen run
IDs and container names. No accepted codegen receipt or projection was read or
changed by this review.

The required pre-change hash table is consistent with the prior approved
residual snapshot and implementation prompt. The preserved pre-change staging
backup independently reproduced the old runner hash `9031bcb6...` and M2-D
scenario-context hash `fe6aaf00...`. The candidate bytes, active tuple
acceptance/rejection, command cross-binding, staging manifest, and new-root
absence were independently reproduced rather than copied from the
implementation result.

This review changed no executor, runner, adapter, probe, staging, Expected, or
Observed bytes. Review-owned changes are this record and authoritative
status/handoff metadata. It did not call Docker, access a runtime socket, read
or mutate an exhausted result root, inspect old container state, create a new
result root, use external network or credentials, access retained M4 state,
perform remote Git, publish, deploy, or communicate with a third party. The
`continue-repository-work` standing authorization was not needed for this
non-executing review. This is an independent Codex review, not a separate human
review.

## Approved candidate identity

The following SHA-256 values identify the exact approved candidate. They
establish static byte identity, not runtime behavior.

| Target | SHA-256 |
|---|---|
| `src/vite-executor.ts` | `644425cb93da6e4b3f0a107eae16868126f807a3021b05369882ba4be7d70b3d` |
| `test/vite-executor.test.ts` | `0319f3f8a0fdfb9c14e40f8528d330b4b131dad55e57268292315be9834253c4` |
| `runner/vite-executor-entry.js` | `daeee923a7887fc7747c39058a5d59a4b02bdcca55a3692653b2980d16d02dc9` |
| `runner/vite-executor-entry.d.ts` | `1246122cc5cbda3b9a50872e3f25451aecfb0e9df4b2103718564b4d86532e10` |
| `runner/vite-runner.js` | `c43a1bca2867dfb0724aa214f7eaaf20f5464f3c1a5dee9f69ed5c77743e1243` |
| `runner/vite-runner.d.ts` | `3c652818985523d940defffe8b6045dc53005ffb0d95df48c9b9941f7c042648` |
| `test/vite-runner.test.ts` | `3018a2811837909ccb0aee1baf5e7063261e1e6d75129a7dc85fdad6c15e5809` |
| `src/vite-projection.ts` | `4eadac906b28102c48899e43b5494e76d40e55271d54cbc1ec546d7620a631f4` |
| `runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `test/vite-staging.test.ts` | `b7a4a5bde14dfb093da8882f37667f099fe9f0c7b469695f9f5059be9c42d0d0` |
| `src/plan.ts` | `19396dbdeee7c9b510a883261f0074d3b0bb0568a9c54da3afc2e624aacd11d8` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `5337b98554963f46e42b2e0a22110202da0a4bf64e8ede282793e8b68d7df245` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `237c3e26306ae96d1f788410a6f5a5122a940dacc02fb67b0f49a3fd36538b13` |
| `test/vite-projection.test.ts` | `92522da1406eabd504610140d80da8231d11f05832b3e2fcf4537a07600acb18` |
| `test/plan.test.ts` | `3e5b2cf34a117f30080f44f4f16893dbba3fee98f9d4702b26b3319f6629d8c2` |
| Root `package.json` | `c6b03db42cc15fabc477663eb394a6c221f73a20a88e31293a9e968ad7f9ef82` |

The ignored Vite staging tree contains exactly 128 regular non-symlink files.
Every target is byte-equal to its declared source and has its fixed `0444` or
`0555` mode. The fixed plan-order logical-path/file-hash manifest is
`96e81f8118c787d2d862182a1f5076c98015c574b6a9db3d0111a1c5716d8bed`,
with Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.
Exact checks of only these two paths observed both absent:

- `results/runs/p2-selected-profiles/p2-vite-observe-p-20260719-02`
- `results/runs/p2-selected-profiles/p2-vite-observe-c-20260719-02`

## Exact one-shot execution gate

A fresh worker may use the `continue-repository-work` standing authorization
only after reproducing all approved hashes above, the exact staging identity,
the argument-free package script, and absence of the two exact new result roots.
It may then invoke exactly once:

```text
npm run p2:execute:vite
```

That command is one ordered permissive/constrained pair attempt. It is never
retried, including after nonzero, failure, inconclusive, or partial output. It
does not authorize another Docker command, an alternate or exhausted run ID or
container name, old-state inspection/removal, direct runtime-socket access,
codegen rerun, retained M4 access, external network, publication, deployment,
or Observed promotion. On every outcome, retain the canonical attempt/receipt
state, bounded entry projection, exact command exit, and exact new-root state.
Any candidate receipts require a later fresh Docker-free review before selected
Vite Observed acceptance. Using standing authorization for that later command
does not mean a separate human review occurred.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Candidate SHA-256 calculation | Exit 0; all sixteen approved candidate identities reproduced. |
| Preserved pre-change staging checks | Exit 0; old runner `9031bcb6...` and scenario-context `fe6aaf00...` reproduced; current candidate sources differ as expected. |
| Docker-free staging byte/mode/version/manifest assertion | Exit 0; 128 files, all source-equal, all fixed-mode, no symlinks, fixed tool versions, and plan-order `96e81f81...` reproduced. |
| Exact two-path new-root absence check | Exit 0; both fixed `20260719-02` result roots were absent without parent enumeration. |
| Package-script assertion | Exit 0; `p2:execute:vite` remains the argument-free fixed build-and-entry script. |
| Focused M2-D context test | Exit 0; 1 file / 9 tests passed. |
| Focused Vite plan/runner/projection/executor/staging tests | Exit 0; 5 files / 77 tests passed. |
| `npm run m2d:verify` | Exit 0; typecheck/build/static checks and 12 files / 73 tests passed. |
| `npm run p2:verify` | Exit 0; typecheck and 9 files / 116 tests passed. |
| `npm run p2:build` and compiled executor/entry import check | Exit 0; all fixed inputs compiled and both modules imported without Docker execution or a result write. |
| `npm run check` | Exit 0; formatting, lint, typecheck, and 98 files / 678 tests passed. |
| `git diff --check` | Exit 0 after review-owned records and handoff metadata were finalized. |

## Remaining boundaries and next task

Static/unit checks do not establish Docker availability, local-image
resolution, option enforcement, non-root/offline behavior, runner completion,
container cleanup, same-image receipts, or any probe attempt outcome. The
constrained child remains the declared
`CONSTRAINED_CHILD_REQUIRED_BY_TOOL` limitation rather than a denial. Selected
Vite profile and experiment-matrix Observed remain unmeasured.

The next task is a fresh worker revalidating this approved snapshot, exact
staging identity, fixed package script, and both absent new roots, then using
standing authorization to run `npm run p2:execute:vite` exactly once. Do not
run another Docker command or retry the pair.
