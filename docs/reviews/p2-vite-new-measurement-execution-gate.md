# P2 selected Vite `20260720-01` execution-gate independent review

## Review target and decision

- Target: the exact Docker-free `20260720-01` P2-V12/P2-V13 implementation
  candidate, its focused regressions, and its 128-file fixed staging tree
- Review type: fresh independent Docker-free static/unit execution-gate review
- Decision: **APPROVED for exactly one later argument-free
  `npm run p2:execute:vite` invocation**
- Blocking findings: none
- Non-blocking findings: none
- Docker execution: approved only through the exact one-shot boundary below;
  not performed by this review
- Selected Vite and experiment-matrix Observed: unchanged and unmeasured

The candidate restores both P2-V12 fail-closed invariants. Post-close process
group residue remains a known `P2_CHILD_FAILED` after bounded force settlement
and cannot reach output verification. Unknown child settlement returns before
loopback close, partial-event mode change, output verification, or other
evidence cleanup. The surrounding executor continues to suppress final inspect
and cleanup after unknown Docker settlement and suppresses cleanup after
unknown runner settlement.

The runner emits only the exact ordered seven-stage
`p2-vite-progress/v1` prefix. The attached-start collector accepts arbitrary
chunk boundaries within the unchanged 16,384-byte combined Docker output
ceiling, independently limits a progress line to 1,024 bytes and all progress
lines to 4,096 bytes, and retains only canonical identities and the accepted
closed prefix. Malformed, duplicate, reordered, identity-mismatched,
oversized, post-terminal, incomplete-success, and settlement-inconsistent
progress fails closed. The collector serializes no raw chunk, error, path,
command, environment value, canary, timestamp, or duration.

Progress is diagnostic secondary state only. An attached-start command failure
keeps its stage/code primary; progress establishes neither Docker nor runner
settlement, authorizes neither inspect/cleanup nor evidence access, and cannot
create a receipt or complete a pair. Success requires the full seven-stage
prefix plus the exact terminal success frame. Failure still requires the exact
terminal failure frame and settlement-consistent prefix. Attempts, receipts,
and pair projections use v3, permissive remains first, an incomplete outcome
stops constrained execution, and `same-image` still requires two complete
exact-identity receipts with the fixed inspected image ID.

The Expected revision, run roots, scenario/profile tuples, and distinct
container names cross-bind only `20260720-01`. Focused context, plan, runner,
projection, and executor regressions reject the immutable `20260719-01`,
`20260719-02`, and `20260719-03` tuples and the unobserved `20260719-11` static
tuple. The fixed timeouts, output/event bounds, image, tool versions, command,
fixture, and constrained-child limitation are unchanged.

This review changed no executor, runner, adapter, probe, staging, Expected,
Observed, codegen, P3/P4, or M4 byte. Review-owned changes are this record and
minimal authoritative status/handoff metadata. It did not call Docker, access a
runtime socket or historical/retained state, create a result root, use external
network or credentials, perform Remote Git, publish, deploy, or communicate
with a third party. The `continue-repository-work` standing authorization was
not used because this review itself was Docker-free. This is an independent
Codex review, not a separate human review.

## Approved candidate identity

The following SHA-256 values were independently reproduced. They establish
static source-byte identity, not runtime behavior.

| Target | SHA-256 |
|---|---|
| `containers/presentation-profiles/src/plan.ts` | `a51227f045c77f3b3f23fa310413d57078c689a2d53a5f5d3336ff3374ae87aa` |
| `containers/presentation-profiles/src/vite-projection.ts` | `ced7b9572f862d77283a44ac453b570c469b5a085635c7330bd768df9cf26ca2` |
| `containers/presentation-profiles/src/vite-executor.ts` | `18cef6133fdb82f7ab8cb176d435d107a8db2cc6d24a3c449d4e9eb6cba81818` |
| `containers/presentation-profiles/runner/vite-executor-entry.js` | `daeee923a7887fc7747c39058a5d59a4b02bdcca55a3692653b2980d16d02dc9` |
| `containers/presentation-profiles/runner/vite-executor-entry.d.ts` | `1246122cc5cbda3b9a50872e3f25451aecfb0e9df4b2103718564b4d86532e10` |
| `containers/presentation-profiles/runner/vite-runner.js` | `e590a23b1a81da97cccde3017bdf8f707bb00821135d48fae2fdb13f29b2a934` |
| `containers/presentation-profiles/runner/vite-runner.d.ts` | `00680f692ef3f31f1cf1b9e6b57e29c6d6041acfb67188fd2ba232f98fbfbf20` |
| `containers/presentation-profiles/runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `containers/presentation-profiles/runner/vite-staging.d.ts` | `2fa86743232202602ad7d5a60745d1e12b68050c9d8e084b091fbe70ebd316d4` |
| `containers/presentation-profiles/test/plan.test.ts` | `05a1b59477184a1cfbaea1bd5fd68bd57b586231cae3062870b2fe9e1d38ca06` |
| `containers/presentation-profiles/test/vite-projection.test.ts` | `cb9718d99e696cdd42cecbc21889e441d31be030e257e34a3afecff3bb331ccb` |
| `containers/presentation-profiles/test/vite-runner.test.ts` | `98a398dbaff65bbd7e2929b99c4f5b98376e06305ab8c3d56ec3a6426bbb8112` |
| `containers/presentation-profiles/test/vite-executor.test.ts` | `bd331ac0a71e0464805771d0dea472093c62d731139d5096c07440f814917e7e` |
| `containers/presentation-profiles/test/vite-staging.test.ts` | `b7a4a5bde14dfb093da8882f37667f099fe9f0c7b469695f9f5059be9c42d0d0` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `cab4afe7954cb6e10473831b70a0c148ce15be0596157ebf2aa35131f3a6654c` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `272cf2ce33a9ada16ea393a200569cd720055f4b67e9e9f79cd7532602d588b9` |
| Root `package.json` | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |

The fixed package script is exactly:

```text
npm run p2:build && node containers/presentation-profiles/runner/vite-executor-entry.js
```

It accepts no caller argument. The ignored staging tree contains exactly 128
regular non-symlink files. Every target is byte-equal to its fixed source and
has its declared integer mode `292` (`0444`) or `365` (`0555`). The SHA-256 of
the plan-order canonical JSON array of `{targetPath,mode,sha256}` records is
`43d74ca73188ab734ad459766401882193d22228f2d70715b2e86767a1791268`
(`plan-order-json[path,mode,sha256]/v1`). The reproduced versions are Node.js
`v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.

Exact checks of only these two paths, with no parent enumeration, observed both
absent:

- `results/runs/p2-selected-profiles/p2-vite-observe-p-20260720-01`
- `results/runs/p2-selected-profiles/p2-vite-observe-c-20260720-01`

A tracked diff assertion over the accepted codegen implementation, P3/P4
implementation/evidence, presentation examples/generator/evidence map, and M4
profile-control implementation/contracts exited 0. Those protected paths have
no candidate change. That is source non-change evidence, not runtime evidence.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Candidate SHA-256 calculation | Exit 0; all seventeen candidate identities above reproduced exactly. |
| Exact two-path new-root absence check | Exit 0; both exact `20260720-01` roots were absent without parent enumeration. |
| Argument-free package-script assertion | Exit 0; the exact fixed build-and-entry script above reproduced. |
| Focused Vite plan/staging/runner/projection/executor tests | Exit 0; 5 files / 113 tests passed. |
| Initial focused M2-D context command | Exit 1 with no test files because the reviewer invoked a package-relative include from the repository root; no state changed. |
| Corrected focused M2-D context test | Exit 0; 1 file / 15 tests passed from the package root. |
| `npm run m2d:verify` | Exit 0; typecheck/build/static checks and 12 files / 79 tests passed. |
| `npm run p2:verify` | Exit 0; typecheck and 9 files / 152 tests passed, including all codegen tests. |
| `npm run p2:build` | Exit 0; probe-core, M2-D, M2-E, and presentation TypeScript outputs compiled. |
| Compiled executor/entry import check | Exit 0 with no output; both modules imported without Docker execution or result creation. |
| Initial staging-manifest assertion | Exit 1 after all inventory/source/mode checks passed because the reviewer encoded the canonical integer mode as a display string; it was a read-only reviewer assertion and changed no state. |
| Corrected exact staging byte/mode/version/manifest assertion | Exit 0; 128 source-equal fixed-mode regular non-symlink files, fixed tool versions, and plan-order JSON manifest `43d74ca7...` reproduced. |
| Protected-path tracked diff assertion | Exit 0; accepted codegen/P3/P4/M4 implementation and evidence paths have no candidate diff. |
| `npm run check` | Exit 0; formatting, lint, typecheck, and 103 files / 743 tests passed. |
| `git diff --check` | Exit 0 after the review-owned record and handoff updates. |

## Exact one-shot execution gate

A fresh worker must first reproduce all seventeen hashes above, the exact
128-file staging identity and manifest, the argument-free package script, and
absence of both exact new result roots. It may then use the
`continue-repository-work` standing authorization to invoke exactly once:

```text
npm run p2:execute:vite
```

That command is one ordered permissive/constrained pair attempt. It is never
retried on any outcome, including nonzero, failure, Inconclusive, partial
output, or cleanup failure. This approval authorizes no other Docker command,
direct runtime-socket access, alternate/historical run or container identity,
historical or retained-state access, image pull, codegen rerun, external
communication, publication, deployment, or Observed promotion. Using standing
authorization for that fixed later command will not mean that a separate human
review occurred.

The execution worker must retain the exact command exit status, bounded entry
projection, canonical attempt/receipt bytes that are produced, and exact new
root states without repair. Any outcome requires a later fresh Docker-free
result review before selected Vite, presentation, or experiment-matrix
Observed can change.

## Remaining limitations

- Static/unit review does not establish Docker availability, local-image
  resolution, runtime option enforcement, offline/non-root behavior, runner
  progress or completion, cleanup, receipts, a same-image pair, or a capability
  outcome.
- The lower-level cause of the immutable `20260719-03` attached-start timeout
  remains unresolved. Progress narrows a later outcome but does not guarantee a
  successful pair.
- The constrained child remains the declared
  `CONSTRAINED_CHILD_REQUIRED_BY_TOOL` limitation rather than a child denial.
- All three historical attempts remain immutable Inconclusive records, and
  selected Vite and experiment-matrix Observed remain unmeasured.

Next: a fresh worker revalidates the approved candidate hashes, exact staging
identity, argument-free package script, and both absent exact roots, then uses
standing authorization for exactly one `npm run p2:execute:vite` pair attempt
with no retry.
