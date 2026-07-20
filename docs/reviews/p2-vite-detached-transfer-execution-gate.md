# P2 selected Vite `20260720-02` detached-transfer execution-gate review

## Review target and decision

- Target: the Docker-free detached lifecycle/durable-transfer implementation
  candidate and its exact 128-file Vite staging tree
- Review type: fresh independent Docker-free static/unit execution-gate review
- Decision: **BLOCKED; do not execute `npm run p2:execute:vite`**
- Blocking findings: P2-DTG01 and P2-DTG02
- Non-blocking findings: none
- Docker execution or execution gate: not approved and not performed
- Selected Vite and experiment-matrix Observed: unchanged and unmeasured

The candidate reproduces most of the approved contract. The plan binds only the
fixed `20260720-02` identities, places one Vite-only progress mount immediately
after the fixed `/tmp` tmpfs, and exposes detached `start`, bounded `wait`, one
final inspect, and fixed removal. The runner arms close/error/output/deadline
observers before awaiting `child-launched` and `child-watch-armed`, publishes
accepted TERM/force dispositions before later lifecycle records, retains both
residual P2-DT03 force branches, and prevents post-close residue from becoming
success. The writer and host reader use the fixed bounded v2 transfer paths and
the v4 attempt/receipt/pair gates retain permissive-first and the exact
`repository-cooperative-fixture` limitation.

Two host-side validation/projection gaps nevertheless leave the exact reviewed
contract unimplemented. The failure-terminal validator accepts terminal codes
that contradict the durable record path on unknown-settlement branches, and a
natural runner exit `70` with a valid durable prefix omits the required
transfer-failure issue from the canonical attempt. Both were independently
reproduced against the compiled candidate. The existing tests pass but do not
cover either negative case. This review records the findings and does not fix
them.

## Blocking findings

### P2-DTG01 — unknown-settlement terminals are not bound to record failures

`validateTerminal` enforces the detected failure mapping only when the terminal
already chooses one of `P2_CHILD_FAILED`, `P2_CHILD_TIMEOUT`, or
`P2_OUTPUT_LIMIT`. On unknown-settlement branches, its remaining checks constrain
the settlement code and absence of later settlement records, but do not require
the terminal failure code fixed by the durable record path.

The focused compiled-code assertion reproduced both of these invalid accepted
snapshots:

1. `child-failure-detected: invalid-process-group` plus terminal
   `P2_RESULT_INVALID / unknown / P2_CHILD_SETTLEMENT_UNKNOWN` was accepted as
   `valid-terminal` with no transfer failure. The contract requires
   `P2_CHILD_FAILED / unknown / P2_CHILD_SETTLEMENT_UNKNOWN`.
2. A natural nonzero close through `child-settled: known-failure`, followed by
   server settlement unknown, plus terminal
   `P2_RESULT_INVALID / unknown / P2_SERVER_SETTLEMENT_UNKNOWN` was also
   accepted. The contract requires preservation of the child failure code,
   `P2_CHILD_FAILED` for that path.

The same validator shape can admit other allowed-but-contradictory failure
codes on unknown child/server fallbacks. A validated terminal feeds the
canonical runner disposition and attempt, so the host validator is not the
closed record/terminal/exit validator required by P2-DT03. These snapshots do
not create a receipt, but retaining contradictory evidence as valid is a gate
blocker.

### P2-DTG02 — natural exit `70` can omit the transfer-failure issue

The contract classifies established natural runner exit `70` as
`progress-transfer / P2_TRANSFER_WRITE_FAILED`, including when the last durable
artifact is a valid prefix from before publication failed. The compiled
candidate reproduced that path: the v2 parser returned `valid-prefix` with a
null transfer failure, lifecycle finalization selected primary
`P2_TRANSFER_WRITE_FAILED`, and the canonical attempt remained Inconclusive.

`buildAttemptRecord` adds `P2_ATTEMPT_TRANSFER_FAILED` only when
`lifecycle.progress.failureCode` is non-null. Consequently the reproduced
attempt contained only:

```text
P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN
P2_ATTEMPT_OUTPUT_NOT_INSPECTED
```

It omitted `P2_ATTEMPT_TRANSFER_FAILED` even though its primary stage/code was
`progress-transfer / P2_TRANSFER_WRITE_FAILED`. Receipt and evidence access
still remained closed, but the v4 canonical issue projection did not represent
the established transfer-write failure. That violates the exact attempt and
canonical issue contract and blocks a one-shot gate.

## Reproduced bindings, command graph, and positive predicates

The independently reproduced identities are:

| Profile | Expected | Run/root | Container |
|---|---|---|---|
| permissive | `p2-vite-expected-20260720-02` | `p2-vite-observe-p-20260720-02` | `tskaigi-p2-vite-observe-p-20260720-02` |
| constrained | `p2-vite-expected-20260720-02` | `p2-vite-observe-c-20260720-02` | `tskaigi-p2-vite-observe-c-20260720-02` |

The fixed Vite mount order is `/tmp` tmpfs, writable fixed progress root,
read-only fixed staging, result, tool, and direct-write. The exact command graph
is create, created-state inspect, detached start, remaining-budget wait, one
final inspect, fixed force-remove, diagnostic transfer, canonical attempt, and
only then regular evidence/receipt access. A known-settled detached-start or
wait failure retains its first failure and reaches the one final inspect.
Unknown settlement of any Docker CLI suppresses every later Docker and
filesystem action and writes no canonical attempt. Transfer requires natural
exit or successful fixed removal; regular evidence additionally requires the
full natural-exit-0 completed terminal and successful cleanup.

Static and unit evidence also reproduced these accepted boundaries:

- fixed progress directory mode `01777`, retained no-follow directory handle,
  exclusive temporary creation, sync/chmod/rename/directory-sync publication,
  `0444` terminal snapshots, and exit `70` after writer failure;
- exact v2 keys, identity, values, canonical JSON/LF, 13-record and 4,096-byte
  limits, stable host read, fixed transfer failure set, and no raw progress in
  the attempt;
- both post-close-residue force dispositions and both post-`SIGTERM` force
  dispositions require final group absence and remain known failure;
- v4 attempt/receipt/pair identities, same-image requirement, canonical issue
  ordering, attempt-before-evidence access, and permissive-first stop; and
- no progress token in fixed child argv/cwd/environment, with writer tokens in
  only staged `presentation-runner.js` and the cooperative trust marker in
  attempt, receipt, and pair projections.

The nine longest record-count families each use 12 of 13 records and at most
1,102 bytes. The completed constrained line uses 10 records and remains the
byte-longest valid line at 1,158 of 4,096 bytes.

## Candidate identity reproduced for the blocked review

These SHA-256 values identify the reviewed source candidate. They are static
source-byte evidence, not approval or runtime evidence.

| Target | SHA-256 |
|---|---|
| `containers/presentation-profiles/src/plan.ts` | `ea65004eb8a4b3dd57933fa3d9961afb72f1c82e9656d976958a4507d6c13e5b` |
| `containers/presentation-profiles/src/vite-projection.ts` | `eab2b376a108d35a90e4a280b6a34ff680c7874734972225f329f217bf1075b8` |
| `containers/presentation-profiles/src/vite-evidence.ts` | `2b61ff3d90a6925e0f8e5648f129a2d2ccd830e3336023a9870e483cbe864025` |
| `containers/presentation-profiles/src/vite-executor.ts` | `b8728d7e924261648788d48f56d4258098878a08675616ecce3d10b76c48d19e` |
| `containers/presentation-profiles/runner/vite-executor-entry.js` | `daeee923a7887fc7747c39058a5d59a4b02bdcca55a3692653b2980d16d02dc9` |
| `containers/presentation-profiles/runner/vite-executor-entry.d.ts` | `1246122cc5cbda3b9a50872e3f25451aecfb0e9df4b2103718564b4d86532e10` |
| `containers/presentation-profiles/runner/vite-runner.js` | `6dcd832eda1acad1ec443ded36b7613eae1c2d98277ef878b3533875c61c53a5` |
| `containers/presentation-profiles/runner/vite-runner.d.ts` | `711c5aca0e59f99c1f73ed57a1afdaddf1ba458fe32baa935d7ada82feb4d2c7` |
| `containers/presentation-profiles/runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `containers/presentation-profiles/runner/vite-staging.d.ts` | `2fa86743232202602ad7d5a60745d1e12b68050c9d8e084b091fbe70ebd316d4` |
| `containers/presentation-profiles/test/plan.test.ts` | `adaf82e361c4bdb0c048a151cdac6f9bad888e8735338f3aa88f616c02f5018e` |
| `containers/presentation-profiles/test/vite-projection.test.ts` | `110877f19eb3357b7868fb83b880122379ac16466c1a5b6ef9ab0cf8c0ddc710` |
| `containers/presentation-profiles/test/vite-runner.test.ts` | `90b0eff76f1df25666a49bc106b723d5154037a53453597ff39671073c458163` |
| `containers/presentation-profiles/test/vite-executor.test.ts` | `bc7d3d20eeb10021597623e2a18df1d162122c92b55e6c91219008b97d75b68b` |
| `containers/presentation-profiles/test/vite-staging.test.ts` | `b7a4a5bde14dfb093da8882f37667f099fe9f0c7b469695f9f5059be9c42d0d0` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `d94b9967c8920cc09a20572e9b590bb03e9e62755976ee56eb555915bc5f3890` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `a6b17bb927a398d24f7651a68e0ae189c7810f64ca3b77b70abbcf236df75cae` |
| Root `package.json` | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |

The package script remains exactly:

```text
npm run p2:build && node containers/presentation-profiles/runner/vite-executor-entry.js
```

It accepts no caller argument. The exact staging directory contains 128 regular
non-symlink files, every target is byte-equal to its fixed source, and every
mode is integer `292` (`0444`) or `365` (`0555`). The independently reproduced
plan-order canonical `{targetPath,mode,sha256}` JSON manifest digest is
`17c0543f5a00c3952c632b5c07ccaffabb00dd8c7c0e46ece1eb798da1f92b9f`.
The reproduced versions are Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`,
and esbuild `0.25.12`.

Exact checks of only the two fixed active paths, without parent enumeration,
observed both absent:

- `results/runs/p2-selected-profiles/p2-vite-observe-p-20260720-02`
- `results/runs/p2-selected-profiles/p2-vite-observe-c-20260720-02`

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Candidate SHA-256, exact package-script, exact-root absence, and staging source/byte/mode/version/manifest assertion | Exit 0; all 18 hashes, both absent exact roots, 128 fixed files, fixed versions, and manifest `17c0543f...` were reproduced. |
| Initial focused P2 command from the package directory | Exit 127 because that directory has no local `./node_modules/.bin/vitest`; no test ran and no state changed. |
| Corrected focused Vite tests | Exit 0; 5 files / 73 tests passed. |
| Focused M2-D context test | Exit 0; 1 file / 15 tests passed. |
| `npm run m2d:verify` | Exit 0; typecheck/build/static checks and 12 files / 79 tests passed. |
| `npm run p2:verify` | Exit 0; typecheck and 9 files / 112 tests passed. |
| `npm run p2:build` | Exit 0; probe-core, M2-D, M2-E, and presentation TypeScript outputs compiled. |
| Compiled executor/runner/entry import-safety assertion | Exit 0 with no output and no runtime action. |
| Writer-token, child-input, mount-order, identity, and canonical-bound assertion | Exit 0; only `presentation-runner.js` contained writer tokens, child inputs contained none, and the 12/1,102 and 10/1,158 bounds reproduced. |
| Unknown-terminal and exit-70 v4 issue reproduction | Exit 0; both contradictory terminals were accepted as valid and the exit-70 attempt omitted `P2_ATTEMPT_TRANSFER_FAILED`, reproducing P2-DTG01/P2-DTG02. |

## Evidence classification and exact blocked boundary

- **Configuration/static evidence:** fixed identities, command arrays, schema
  values, source/staging hashes, fixed modes, trust marker, and validation/gate
  predicates.
- **Unit evidence:** focused/full tests establish the covered writer, lifecycle,
  transfer, projection, adapter, and fail-closed branches. Passing tests do not
  negate the separately reproduced uncovered findings.
- **No runtime evidence:** Docker availability, image resolution, container or
  runner behavior, progress publication, cleanup, receipts, capabilities, the
  constrained member, and same-image pairing remain unobserved.
- **Trust limitation:** the same-UID writable progress mount remains a
  repository-cooperative-fixture assumption, not adversarial writer isolation.

No execution gate is open. Do not invoke Docker or
`npm run p2:execute:vite`, create either active result root, accept a receipt,
or change selected-Vite/presentation/experiment-matrix Observed. The smallest
next task is one Docker-free host-side remediation limited to:

1. binding every unknown child/server settlement terminal failure code to its
   exact accepted durable record path;
2. adding `P2_ATTEMPT_TRANSFER_FAILED` whenever established natural exit `70`
   selects primary `P2_TRANSFER_WRITE_FAILED`, including a valid-prefix
   artifact; and
3. adding focused negative regressions for both findings without changing the
   approved runner/staging bytes, identities, bounds, trust marker, or runtime
   command.

A fresh independent Docker-free execution-gate re-review is required after
that remediation. This review did not use the `continue-repository-work`
standing authorization because it performed no repository-recorded approval
gate action. It is an independent Codex review, not a separate human review.

No Docker/container command, runtime socket, production executor, staging
rebuild, result-root or evidence-subtree read, external network, credential,
Remote Git, publication, deployment, third-party communication, or frozen M4
operation was used.

Next: remediate only P2-DTG01 and P2-DTG02 in the host Vite validator/attempt
projection with focused Docker-free regressions, then request a fresh
execution-gate re-review before any runtime action.

## P2-DTG01/P2-DTG02 remediation re-review (2026-07-20)

### Decision

- Review type: fresh independent Docker-free static/unit execution-gate
  remediation re-review
- Decision: **APPROVED for at most one later argument-free
  `npm run p2:execute:vite` pair execution; not executed by this review**
- Closed findings: P2-DTG01 and P2-DTG02
- Remaining blocking findings: none
- New non-blocking findings: none
- Docker execution or result access: not performed
- Selected Vite and experiment-matrix Observed: unchanged and unmeasured

The remediated host validator now accepts an unknown-settlement failure
terminal only when its failure code is the unique code implied by the durable
record path and applicable child/server settlement code. The canonical attempt
projection now includes `P2_ATTEMPT_TRANSFER_FAILED` whenever an established
natural runner exit `70` selects `P2_TRANSFER_WRITE_FAILED`, including when the
last durable snapshot is a valid prefix and the parser itself reports no
transfer failure. The exact staged candidate and every other reviewed contract
boundary remain unchanged.

This is an independent Codex review, not a separate human review. It approves
only the later one-shot command boundary below; it creates no runtime evidence
and does not itself use the `continue-repository-work` standing authorization.

### P2-DTG01 closure: exact unknown-terminal matrix

The compiled validator was exercised across every allowed terminal failure
code for representative paths in each contract family. Each accepted path had
exactly one valid failure code; all other allowed failure codes were rejected
as `P2_TRANSFER_SEQUENCE_INVALID`.

| Unknown settlement | Durable path | Only accepted failure code |
|---|---|---|
| child | invalid process-group identity | `P2_CHILD_FAILED` |
| child | `deadline` detected | `P2_CHILD_TIMEOUT` |
| child | `output-limit` detected | `P2_OUTPUT_LIMIT` |
| child | `process-error` detected | `P2_CHILD_FAILED` |
| child | close-first residue, before or after an accepted force disposition | `P2_CHILD_FAILED` |
| child | otherwise clean prefix after child acquisition | `P2_RUNNER_FAILED` |
| server | pre-service close failure | `P2_SERVER_CLOSE_FAILED` |
| server | otherwise clean prefix after service acquisition | `P2_RUNNER_FAILED` |
| server | spawn failure, with no child to settle | `P2_CHILD_FAILED` |
| server | known natural or residue child failure | `P2_CHILD_FAILED` |
| server | known timeout child failure | `P2_CHILD_TIMEOUT` |
| server | known child success | `P2_SERVER_CLOSE_FAILED` |

The same reproduction rejected a spawn-error terminal labeled with unknown
child settlement, every server-settlement substitution on an unknown-child
path, every child-settlement substitution on an unknown-server path, unknown
server settlement for the constrained no-service profile, and unknown server
settlement while child settlement was still unknown. The implementation
therefore closes both the record-to-failure mapping and the child/server
settlement-code substitution identified by P2-DTG01.

The known-settlement paths remain under the unchanged validator and focused
suite. Source hashes for the runner, plan, projection, evidence reader, adapter
binding, entry, staging definition, and their non-remediation tests are
identical to the blocked review. The residual P2-DT03 `sent` and
`group-already-absent` force paths, terminal/container exit cross-consistency,
canonical bounds/order, and no-success residue rule are consequently unchanged
and remain covered by the passing P2 suite.

### P2-DTG02 closure: natural exit `70`

The compiled lifecycle reproduction established final inspected natural exit
`70` with a valid five-record prefix and a null parser-level transfer failure.
The canonical attempt retained:

```text
primary: progress-transfer / P2_TRANSFER_WRITE_FAILED
issues:
  P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN
  P2_ATTEMPT_TRANSFER_FAILED
  P2_ATTEMPT_OUTPUT_NOT_INSPECTED
```

The issue order is the fixed v4 canonical order. Regular evidence was not
accessed and no receipt was written. A separate parser-level
`P2_TRANSFER_SCHEMA_INVALID` reproduction still included
`P2_ATTEMPT_TRANSFER_FAILED`. A known-settled start failure followed by a
non-exited final inspect and successful force removal retained a null inspected
exit and did not manufacture the transfer issue. P2-DTG02 is therefore closed
without weakening force-removed or non-natural outcomes into runner exit `70`.

The first compiled reproduction command used an overly narrow review assertion
that expected only the transfer and output issues, so it exited 1 after showing
the already-established canonical runner-settlement issue before them. The
corrected assertion retained that existing issue, required the newly restored
transfer issue in canonical order, and passed. This was a review-script
expectation correction, not a candidate change or finding.

### Candidate and staging identity

The following current hashes identify the approved gate candidate. Compared
with the blocked review, only the remediated executor source/test and compiled
executor changed; the other listed tracked identities remain exact.

| Target | SHA-256 |
|---|---|
| `containers/presentation-profiles/src/plan.ts` | `ea65004eb8a4b3dd57933fa3d9961afb72f1c82e9656d976958a4507d6c13e5b` |
| `containers/presentation-profiles/src/vite-projection.ts` | `eab2b376a108d35a90e4a280b6a34ff680c7874734972225f329f217bf1075b8` |
| `containers/presentation-profiles/src/vite-evidence.ts` | `2b61ff3d90a6925e0f8e5648f129a2d2ccd830e3336023a9870e483cbe864025` |
| `containers/presentation-profiles/src/vite-executor.ts` | `2a602b54f9c3f1c83ed43a8da18273a4b69b17f83eb6b020d87ef381deb0ce2f` |
| `containers/presentation-profiles/runner/vite-executor-entry.js` | `daeee923a7887fc7747c39058a5d59a4b02bdcca55a3692653b2980d16d02dc9` |
| `containers/presentation-profiles/runner/vite-executor-entry.d.ts` | `1246122cc5cbda3b9a50872e3f25451aecfb0e9df4b2103718564b4d86532e10` |
| `containers/presentation-profiles/runner/vite-runner.js` | `6dcd832eda1acad1ec443ded36b7613eae1c2d98277ef878b3533875c61c53a5` |
| `containers/presentation-profiles/runner/vite-runner.d.ts` | `711c5aca0e59f99c1f73ed57a1afdaddf1ba458fe32baa935d7ada82feb4d2c7` |
| `containers/presentation-profiles/runner/vite-staging.js` | `d23c64bf12b6df49dd7a1666acf410d4777b9c758f8f0b0550413808bdda7cd5` |
| `containers/presentation-profiles/runner/vite-staging.d.ts` | `2fa86743232202602ad7d5a60745d1e12b68050c9d8e084b091fbe70ebd316d4` |
| `containers/presentation-profiles/test/plan.test.ts` | `adaf82e361c4bdb0c048a151cdac6f9bad888e8735338f3aa88f616c02f5018e` |
| `containers/presentation-profiles/test/vite-projection.test.ts` | `110877f19eb3357b7868fb83b880122379ac16466c1a5b6ef9ab0cf8c0ddc710` |
| `containers/presentation-profiles/test/vite-runner.test.ts` | `90b0eff76f1df25666a49bc106b723d5154037a53453597ff39671073c458163` |
| `containers/presentation-profiles/test/vite-executor.test.ts` | `b0550fb2cbf1fc70ad3797d402b34067814aa9872f3e64ea391721699a84dbf0` |
| `containers/presentation-profiles/test/vite-staging.test.ts` | `b7a4a5bde14dfb093da8882f37667f099fe9f0c7b469695f9f5059be9c42d0d0` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `d94b9967c8920cc09a20572e9b590bb03e9e62755976ee56eb555915bc5f3890` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `a6b17bb927a398d24f7651a68e0ae189c7810f64ca3b77b70abbcf236df75cae` |
| Root `package.json` | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |
| Compiled `containers/presentation-profiles/dist/vite-executor.js` | `2a5d731cba97fe3cb34ea2c702af729763fdeec7ceaa0ebb903307086173418c` |

The exact argument-free package script remains:

```text
npm run p2:build && node containers/presentation-profiles/runner/vite-executor-entry.js
```

The existing staging tree was not rebuilt or mutated. It contains exactly 128
regular non-symlink source-equal files with only the fixed `0444`/`0555` modes.
The plan-order canonical `{targetPath,mode,sha256}` JSON digest remains
`17c0543f5a00c3952c632b5c07ccaffabb00dd8c7c0e46ece1eb798da1f92b9f`.
Only `presentation-runner.js` contains a progress writer token. Versions remain
Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild `0.25.12`.
Exact non-enumerating checks found both fixed active result roots absent.

### Verification observed

| Command or assertion | Observed result |
|---|---|
| Focused Vite executor/validator tests | Exit 0; 1 file / 24 tests passed. |
| `npm run p2:verify` | Exit 0; typecheck and 9 files / 114 tests passed. |
| `npm run p2:build` | Exit 0; probe-core, M2-D, M2-E, and presentation TypeScript outputs compiled. |
| Compiled executor/runner/entry import-safety assertion | Exit 0 with no output and no runtime action. |
| First compiled path-matrix/exit-70 assertion | Exit 1 because the review assertion omitted the existing canonical runner-settlement issue; it made no candidate change. |
| Corrected compiled path-matrix/exit-70 assertion | Exit 0; seven child and seven server path families each accepted only the contract code, substitutions were rejected, exit `70` included the transfer issue, parser transfer failure retained it, and force removal did not manufacture it. |
| Exact staging/package/root assertion | Exit 0; 128 source-equal fixed-mode files, manifest `17c0543f...`, fixed versions, runner-only writer tokens, exact package script, and both absent active roots reproduced. |
| Candidate SHA-256 assertion | Exit 0; all tracked candidate identities and the compiled executor hash above were reproduced. |
| Focused Prettier check over the review prompt and active review/handoff documents | Exit 0; all named files matched repository formatting. |
| `git diff --check` after review/handoff edits | Exit 0. |

No staging command was run.

### Evidence classification and exact approved boundary

- **Configuration/static evidence:** fixed `20260720-02` identities, detached
  command graph, v2/v4 schemas, source/staging hashes, fixed bounds, command
  script, trust marker, and validator/gate predicates.
- **Unit/compiled evidence:** the focused and full suites plus independent
  compiled reproductions establish the remediated terminal matrix and attempt
  issue projection on the covered Docker-free backends.
- **No runtime evidence:** Docker availability, image resolution, container,
  runner, child, progress publication, cleanup, receipt, capability,
  constrained-member, and same-image behavior remain unobserved.
- **Trust limitation:** `repository-cooperative-fixture` remains the exact
  same-UID writable-progress limitation. This gate is not evidence of
  adversarial writer isolation.

The gate approves at most one later invocation of the exact argument-free
`npm run p2:execute:vite` command. A fresh worker must first reproduce the
approved hashes, exact staging identity and tool versions, exact package
script, and absence of both fixed active result roots. It may then use the
`continue-repository-work` standing authorization for that command exactly
once. This is not a separate human review. The command is never retried on any
outcome, constrained setup remains reachable only after a complete permissive
receipt, and no other Docker command is authorized.

This approval does not authorize direct runtime-socket access, staging rebuild
or mutation, result inspection before execution, old-result access, receipt
acceptance, presentation promotion, Expected/Observed change, external
communication, publication, deployment, or frozen M4 work. A fresh Docker-free
result review remains required before any candidate result may be classified
or promoted.

No Docker/container command, runtime socket, probe/lifecycle fixture,
production executor, staging rebuild, result-root or evidence-subtree access,
external network, credential, Remote Git, publication, deployment, third-party
communication, or frozen M4 operation was used by this re-review.

Next: in a fresh worker, revalidate the approved candidate/staging/script and
both absent exact `20260720-02` roots, then use standing authorization for
exactly one argument-free `npm run p2:execute:vite` pair attempt with no retry.
