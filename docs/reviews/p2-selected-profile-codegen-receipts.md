# P2 selected codegen receipt independent review

## Review target and decision

- Target: the exact ignored `codegen-observe-p/c` summary receipts and the
  one-shot execution record in
  [`p2-selected-profile-contract.md`](../p2-selected-profile-contract.md)
- Review type: fresh independent Docker-free read-only receipt review
- Decision: **APPROVED as selected codegen profile Observed at the exact
  scenario/run scope**
- Blocking findings: none
- Selected profile Observed: `codegen-observe-p` and `codegen-observe-c`
  accepted; `vite-observe-p/c` unmeasured
- Experiment-matrix Observed: unchanged
- Docker execution: not performed or approved by this review

The two canonical summaries reproduce the fixed identities, one inspected image
ID, successful container completion, unchanged source hashes, complete event
counts, expected attempt outcomes, and bounded output inventory. Reprojecting
the local raw segments through the reviewed parser reproduces each summary
projection exactly, and independently combining the two receipts produces
`same-image` with no issue.

This review changed no executor, runner, adapter, probe, Expected value, raw
segment, receipt, or experiment-matrix value. It did not call Docker, access a
runtime socket or retained M4 state, use external network or credentials, or
perform remote Git. Raw segments were read only by the bounded local projection
check and were neither printed nor copied. The `continue-repository-work`
standing authorization was not needed because this task was non-executing.

## Canonical receipt identity

| Scenario | Run ID | Summary SHA-256 | Summary bytes | Event bytes | Direct write |
|---|---|---|---:|---:|---|
| `codegen-observe-p` | `p2-codegen-observe-p-20260719-01` | `6b24148d57dc37d4cae67b12b19da3b75f64da4724cd1f8ab3462c5ae27a6e24` | 1,400 | 8,977 | present, 153 bytes |
| `codegen-observe-c` | `p2-codegen-observe-c-20260719-01` | `7c83e41a20577e1e4be09a92fa8d7d39225489d92d36a33ba741f54a15739423` | 1,477 | 8,999 | absent, 0 bytes |

Both receipts are canonical one-line JSON plus a final newline and expose only
the reviewed top-level identity, version, completion, source-hash, output, and
projection fields. They record Node.js `v20.18.2`, codegen `0.0.0`, container
exit 0, and inspected image ID
`sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`.
Both source hashes before and after are
`c1a8a06e0cbd8225ab82c0422f50b9631f5dbe9a51b14f5e4a3ea485e5eee253`.

The summary shape contains no command, container ID/name, environment value,
canary value, file contents, raw error/output, absolute host path, credential,
timestamp, PID, or duration. The image and source digests are declared evidence
identities rather than secret values.

## Projection reconstruction

Each raw event segment is a regular non-symlink file below the fixed 65,536-byte
limit. A read-only assertion passed each segment to
`projectCodegenProfileSegment()` with its fixed scenario/profile/run tuple and
deep-compared the regenerated projection with the canonical receipt.

Both regenerated projections have `matches-expected`, empty issues, and exact
counts `5 / 6 / 1 / 12`. Their six ordered capability projections are:

| Attempt | Permissive | Constrained |
|---|---|---|
| Environment | `success / null` | `failure / ENVIRONMENT_VARIABLE_ABSENT` |
| File read | `success / null` | `failure / READ_DENIED` |
| Source hash | `success / null` | `success / null` |
| Direct write | `success / null` | `failure / WRITE_DENIED` |
| Loopback | `success / null` | `failure / NETWORK_FAILURE` |
| Fixed child | `success / null` | `failure / CHILD_PROCESS_FAILURE` |

The receipt output inventory matches the filesystem without reading the direct
write contents: the two event byte counts match their regular files, the
permissive direct-write marker is a 153-byte regular non-symlink file, and the
constrained marker is absent. `projectFixedCodegenExecutionPair()` over the two
receipts independently returns `p2-codegen-pair/v1`, `same-image`, the fixed
image ID, and no issues.

## Evidence decision and limitations

The pair is suitable as selected codegen profile Observed for the narrow C-02
through C-04 comparison. It observes that the fixed explicit codegen route
attempted all capabilities and reached different outcomes under the two reviewed
profiles. A denied attempt remains a valid observation; container exit 0 does
not relabel every capability as successful.

Acceptance is limited to these two exact scenario/run receipts together with the
reviewed executor and one-shot execution record:

- this is one local pair, not a repeated-run reproducibility result;
- the summaries do not embed the 30-file staging manifest and cannot alone
  prove the recorded exactly-once/no-retry history;
- same-image binds the inspected base image ID, while pair-identical mounted
  staging relies on the separately reviewed plan and pre-execution inventory;
- the observed attempt outcomes do not prove a general-purpose sandbox,
  container-escape resistance, or arbitrary external-egress isolation;
- the result supplies no Vite, unselected-row, M4 control, artifact, or
  experiment-matrix Observed evidence; and
- the ignored run roots remain local review inputs. P4 must create the tracked
  talk-facing sanitized projection rather than cite raw paths.

## Verification observed

| Command | Observed result |
|---|---|
| Summary `sha256sum`, `stat`, and JSON inspection | Exit 0; both recorded hashes, summary sizes, fixed identities, versions, completion, hashes, counts, attempts, issues, and output inventory reproduced. |
| Explicit event/direct-write `stat` checks | Exit 0; event files were regular at 8,977/8,999 bytes, the permissive marker was regular at 153 bytes, and the constrained marker was absent. |
| Read-only Node receipt-contract assertion using the compiled projectors | Exit 0; two canonical receipts, raw projections, bounded inventories, unchanged source hashes, and same-image binding reproduced. |
| `npm run p2:verify` | Exit 0; P2 typecheck and 5 test files / 44 tests passed. |
| `npm run p2:build` | Exit 0; probe-core, M2-E, and the presentation executor compiled. |
| Targeted Prettier check of all changed source/docs and targeted ESLint of changed source | Exit 0. |
| `npm run typecheck` | Exit 0; root TypeScript checking passed. |
| `npm test` | Exit 0; 92 test files / 595 tests passed. |
| `npm run format:check` | Exit 2; Prettier reported the matched files formatted but could not expand the ignored constrained run's intentionally unreadable `tool/canary` directory. No runtime evidence permissions or contents were changed. |

The next task is ordinary-development verification hardening: make the root
`format:check`/`check` path enumerate repository-owned non-ignored inputs without
reading, changing permissions on, moving, or deleting either P2 run root. Add a
focused regression for the unreadable ignored-directory case. The following P2
task is the Docker-non-executing M2-D `vite-observe-p/c` binding/projection slice.
