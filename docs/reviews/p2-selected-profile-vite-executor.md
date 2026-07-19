# P2 selected Vite executor independent review

## Review target and decision

- Target: the uncommitted minimal `vite-observe-p/c` executor, entry, tests,
  receipt/pair projection, and exact 128-file staging revalidation on review
  base `47bac2ec9373`
- Review type: fresh independent Docker-non-executing static/unit review
- Decision: **APPROVED for the exact one-shot Vite execution gate**
- New blocking findings: none
- Docker execution: approved only through the recorded argument-free
  `npm run p2:execute:vite` command; not performed by this review
- Selected Vite profile Observed: unmeasured
- Experiment-matrix Observed: unchanged

The executor keeps the two selected Vite identities, local image reference,
container names, result roots, Docker CLI, command sequence, mounts, and
environment closed to caller input. It validates create ownership and the first
inspected `created` state before attached start, then binds the final `exited`
state, exit code, and inspected image ID before accepting the runner framing.
The two receipts must retain the exact ordered identities, complete runtime
boundaries, and one inspected image ID before the pair is `same-image`.

Docker CLI output, deadlines, and post-signal settlement are bounded. Unknown
Docker settlement suppresses later cleanup. Exact runner failure framing keeps
the reviewed `P2_CHILD_SETTLEMENT_UNKNOWN` and
`P2_SERVER_SETTLEMENT_UNKNOWN` barrier, and malformed framing is treated as
unknown rather than authorizing container removal. Known runner settlement may
proceed to the fixed force-removal command; cleanup failure cannot replace an
earlier primary failure.

The host opens the event segment with `O_NOFOLLOW`, rejects its descriptor size
before allocation, reads through a 65,537-byte ceiling, and requires stable
pre/post sizes. The receipt retains only fixed identities, versions, inspected
image ID, bounded sizes/presence, source hashes, sanitized runner disposition,
and the allowlisted projection. It excludes container IDs/names, commands, raw
output/errors, canary values, contents, environment values, credentials, and
absolute host paths. Static inspection and import checks found no import-time
Docker action or other side effect.

This review changed no executor, runner, adapter, probe, staging, Expected, or
Observed bytes. It did not call Docker, access a runtime socket or retained M4
state, inspect either ignored codegen run root, use external network or
credentials, or perform remote Git. The `continue-repository-work` standing
authorization was not needed because this task was non-executing. This is an
independent Codex review, not a separate human review.

## Approved snapshot identity

The following SHA-256 values identify the implementation bytes before this
review record and its status metadata were added. They establish static byte
identity, not runtime enforcement.

| Target | SHA-256 |
|---|---|
| `src/vite-executor.ts` | `c3d84e46f0611883c1b79f9aebfad4169216299b43fbde62785ff8b5ba9107f4` |
| `test/vite-executor.test.ts` | `dc773814db75cd4181707a4dd5c85f3cc8c2c572880581cbf09b145772cddeee` |
| `runner/vite-executor-entry.js` | `87ab4b459e5ae685d5e49b334af0720ad0aa5a2054865e267cc028c96d579257` |
| `runner/vite-executor-entry.d.ts` | `dc1924df078fd1ee3921ee75dc7bcbadf41b34cafc5a14a176552c0f102a7597` |
| `src/vite-projection.ts` | `473a0d5aae5bc32e16fc99982224f4339f344645b7c40e20db469a0a242f785c` |
| `runner/vite-runner.js` | `480b5fd3b2fa49b2853d82d3db5f5fd46f52911397860f2e0c8f1b4a79dbd284` |
| `runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `src/plan.ts` | `77c91efb1e7af9259aa040f8b3bafc77ca2afb299a61c920b07b69baeaa5dec5` |
| Root `package.json` | `c6b03db42cc15fabc477663eb394a6c221f73a20a88e31293a9e968ad7f9ef82` |

The ignored Vite staging tree contains exactly 128 regular non-symlink files.
Every target equals its fixed source byte-for-byte and has its declared `0444`
or `0555` mode. The fixed plan-order manifest reproduces
`13f019cb9d9636023d43350ed13932e5fbc2d1f8ae2a01abe85458ffcd89ae22`,
with Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild
`0.25.12`.

## Exact one-shot execution gate

A fresh worker may use the `continue-repository-work` standing authorization
only after reproducing the hashes above, the exact staging inventory and
manifest, and absence of both fixed Vite result roots:

- `p2-vite-observe-p-20260719-01`
- `p2-vite-observe-c-20260719-01`

The worker may then run exactly one argument-free command:

```text
npm run p2:execute:vite
```

That command is one pair attempt and must not be retried. It does not authorize
another Docker command, direct runtime-socket access, codegen rerun, retained M4
access, external network, publication, or Observed promotion. On every outcome,
retain the exact exit status, bounded entry projection, result-root state, and
any canonical receipts that were written. A command exit of zero or a
`same-image` pair does not by itself promote either projection: a later fresh
Docker-free receipt review must reconstruct and validate the exact candidate
bytes before selected Vite Observed can be accepted.

## Verification observed

| Command | Observed result |
|---|---|
| Focused `vite-executor.test.ts` | Exit 0; 1 file / 21 tests passed. |
| `npm run p2:verify` | Exit 0; P2 typecheck and 9 test files / 98 tests passed. |
| `npm run p2:build` | Exit 0; probe-core, M2-D, M2-E, and the presentation executor compiled. |
| Compiled executor/entry import check | Exit 0; both modules imported without executing Docker or producing a receipt. |
| Docker-free staging byte/mode/version/manifest assertion | Exit 0; exactly 128 source-equal regular non-symlink files, fixed modes and tool versions, and plan-order `13f019cb...` reproduced. |
| Key-file SHA-256 calculation | Exit 0; reproduced all nine candidate identities above. |
| `npm run check` | Exit 0; formatting, lint, root typecheck, and 98 test files / 659 tests passed. |
| `git diff --check` | Exit 0 after the review record and status/handoff updates. |

## Remaining boundaries

- Static/unit checks do not establish Docker availability, local-image
  resolution, option enforcement, non-root execution, offline behavior, Node
  permission enforcement, runner completion, or any probe attempt outcome.
- The constrained child success remains the declared
  `CONSTRAINED_CHILD_REQUIRED_BY_TOOL` limitation; it is not child denial.
- Both selected Vite scenarios and all corresponding matrix Observed fields
  remain unmeasured. A later receipt review must keep Expected, configuration
  intent, runtime observation, and matrix promotion separate.
- The generated staging tree remains ignored local state. The execution worker
  must reproduce its identity and both absent result roots before the one-shot
  command.

The next task is a fresh worker revalidating the approved snapshot, exact
128-file staging tree, and both absent fixed Vite result roots, then using the
standing authorization to run `npm run p2:execute:vite` exactly once. This is
not a separate human review. Do not call any other Docker command or retry the
pair.
