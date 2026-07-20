# P2 selected Vite `20260720-02` result independent review

## Review target and decision

- Target: the exhausted `20260720-02` one-shot selected-Vite outcome, its
  exact canonical permissive v4 attempt, the fixed v2 progress control record,
  the approved nineteen-file candidate identity, the bounded direct stdout,
  and only the two fixed active result roots
- Review type: fresh independent Docker-free read-only result review
- Decision: **ACCEPTED only as the fifth immutable Inconclusive execution
  attempt**
- Blocking findings: none
- Non-blocking findings: none
- Retry, repair, or runtime recovery: prohibited and not performed
- Selected Vite and experiment-matrix Observed: unchanged and unmeasured

The canonical attempt and the approved pure projectors agree exactly with the
recorded 598-byte stdout handoff. The attempt is Inconclusive, only permissive
is represented, regular evidence was not inspected, no receipt exists, and the
constrained root is absent. The durable progress bytes are diagnostic state
only: without an established natural container exit, the terminal cannot be
accepted as runner or child settlement.

This review changed no Vite executor, runner, adapter, probe, staging, result,
Expected, or experiment-matrix byte. Review-owned changes are this record, the
smallest deterministic tracked presentation projection/generator update, and
minimal authoritative status/handoff metadata. This is an independent Codex
review, not a separate human review.

## Exact fixed paths and canonical records

Fixed-path, no-follow checks reproduced the following state without
enumerating the parent result directory or any historical result root:

| Fixed path or inventory | Type / mode | Size / SHA-256 | Reviewed state |
|---|---|---|---|
| permissive root | non-symlink directory / `0700` | size `4096` | exact bounded root inventory contained only `attempt.json`, `direct-write`, `docker-config`, `progress`, `result`, and `tool` |
| `attempt.json` | non-symlink regular file / `0600` | 1,462 bytes / `842b914eeb1a92241787d718523d2d3c76eaeede164531ef20eb8314391cd201` | one canonical UTF-8 JSON line with one trailing LF |
| `summary.json` | absent | not applicable | no receipt |
| `progress/` | non-symlink directory / `0555` | size `4096` | sealed control directory |
| `progress/runner-progress.json` | non-symlink regular file / `0444` | 866 bytes / `77a919700f01ca97859e687d68baffb38e0426df4baa6b4022511ca30e45fc8c` | one canonical UTF-8 JSON line with one trailing LF |
| `progress/runner-progress.next` | absent | not applicable | no stale temporary control record |
| constrained root | absent | not applicable | constrained was not started |

The direct-write, result, and tool directories were identified only through
the permitted root name/mode inventory. No regular event, direct-write,
tool-output, or evidence file or subtree was opened.

The canonical attempt has exactly the reviewed nineteen top-level fields in
their fixed order. It binds schema `p2-vite-attempt/v4`, scenario/profile/run
`vite-observe-p / permissive / p2-vite-observe-p-20260720-02`, Expected
`p2-vite-expected-20260720-02`, and the approved image ID
`sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`.
It records:

- primary `container-wait / P2_EXECUTOR_DOCKER_TIMEOUT`;
- known Docker CLI settlement, null inspected container exit,
  `force-removed` container settlement, `force-stopped` runner-process
  settlement, and completed cleanup;
- null runner, `repository-cooperative-fixture` progress trust, and output
  `not-inspected`; and
- the ordered issues `P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED`,
  `P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN`, `P2_ATTEMPT_TRANSFER_FAILED`, and
  `P2_ATTEMPT_OUTPUT_NOT_INSPECTED`.

No raw stdout, stderr, error, path, command, environment, canary, timestamp,
duration, container name, or result-root field is present.

## Progress validation and unresolved runtime facts

The exact v2 progress control record binds the same Expected/scenario/profile/
run identity and contains the contiguous eight-record prefix:

```text
runner-entered: accepted
inputs-prepared: accepted
service-ready: listening
child-launched: positive-process-group
child-watch-armed: close-error-output-deadline
child-close-observed: exit-0
child-residue-detected: post-close-group-present
child-force-sent: sent
```

Its serialized terminal says `P2_CHILD_FAILED / unknown /
P2_CHILD_SETTLEMENT_UNKNOWN`. Applying the approved pure validator with the
actual null inspected container exit rejects that terminal as
`P2_TRANSFER_SEQUENCE_INVALID` and reproduces the canonical attempt's exact
`runnerProgress`: validity `invalid`, the eight identity-bound records above,
and a null terminal. This is agreement between the fixed control bytes and the
attempt, not repair or a second runtime observation.

The prefix establishes only the durably published transitions. In particular,
the recorded `exit-0` close is followed by process-group residue, and accepted
force delivery is not proof that the group became absent. There is no durable
`child-group-absent`, `child-settled`, `service-settled`, or `output-exported`
record. Force removal is not natural container or runner exit. Child and server
settlement, the final process-group state, runner exit, output export, every
capability outcome, and the lower-level cause of the container-wait timeout
remain unresolved.

## Approved candidate and staging identity

All nineteen execution-gate identities reproduced exactly. They establish
source/compiled byte identity, not runtime enforcement.

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
| root `package.json` | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |
| compiled `containers/presentation-profiles/dist/vite-executor.js` | `2a5d731cba97fe3cb34ea2c702af729763fdeec7ceaa0ebb903307086173418c` |

The package script remains exactly
`npm run p2:build && node containers/presentation-profiles/runner/vite-executor-entry.js`.
The fixed staging root contains exactly 128 regular non-symlink files; every
file equals its declared source and has mode `0444` or `0555`. The plan-order
canonical `{targetPath,mode,sha256}` JSON digest is
`17c0543f5a00c3952c632b5c07ccaffabb00dd8c7c0e46ece1eb798da1f92b9f`.
Versions are Node.js `v20.18.2`, Vite `6.4.3`, Rollup `4.62.2`, and esbuild
`0.25.12`. Staging was read-only verified, not rebuilt or mutated.

## Pure bounded stdout reconstruction

After the Docker-free build, the approved pure pair and entry projectors
reconstructed exactly one line with one trailing LF: 598 bytes, SHA-256
`fbe36d752dca6423a8d9379fa00d99aef220e7347426a2fa72dd74fb04167063`.
It matches the execution handoff byte for byte:

```text
{"status":"inconclusive","pair":{"schemaVersion":"p2-vite-pair/v4","expectedRevision":"p2-vite-expected-20260720-02","validity":"inconclusive","imageId":null,"progressTrust":"repository-cooperative-fixture","issues":["PAIR_IDENTITY_MISMATCH"]},"scenarios":[{"scenarioId":"vite-observe-p","profileId":"permissive","completion":"inconclusive","attemptRecord":"written","evidence":"not-inspected","receipt":"not-written","validity":"not-inspected","issues":["P2_ATTEMPT_DOCKER_LIFECYCLE_FAILED","P2_ATTEMPT_RUNNER_SETTLEMENT_UNKNOWN","P2_ATTEMPT_TRANSFER_FAILED","P2_ATTEMPT_OUTPUT_NOT_INSPECTED"]}]}
```

The projectors received no receipt. One permissive Inconclusive attempt cannot
establish a capability result, constrained outcome, same-image pair,
selected-profile Observed result, or experiment-matrix Observed result.

## Tracked presentation projection

The deterministic tracked `profiles.json` projection now retains all five
immutable Inconclusive attempts side by side. The fifth entry records the exact
v4 attempt hash, `container-wait` timeout, and invalid eight-record retained
progress prefix. Every Vite permissive capability remains `not-inspected` and
every constrained capability remains `missing`. The evidence map still has
exactly three talk tables. Accepted codegen, P3, and P4 evidence classes are
unchanged; no Expected value, selected-Vite Observed status, or
experiment-matrix cell was changed.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Approved candidate SHA-256 assertion | Exit 0; all nineteen tracked/compiled identities reproduced. |
| Fixed staging assertion | Exit 0; 128 source-equal regular non-symlink files, fixed `0444`/`0555` modes, manifest `17c0543f...`, and fixed Node/Vite/Rollup/esbuild versions reproduced. |
| Fixed-path root/control inventory and no-follow reads | Exit 0; exact modes, sizes, hashes, absent summary/temporary/constrained paths, and the bounded root inventory above reproduced. |
| `npm run p2:build` | Exit 0; probe-core, M2-D, M2-E, and presentation TypeScript outputs compiled without Docker execution. |
| First compiled import/projector assertion | Exit 1 because the reviewer named a nonexistent runner export; all three modules had already imported without side effects, and no state changed. |
| Corrected compiled import/progress/projector assertion | Exit 0; actual-exit progress validation reproduced `invalid / P2_TRANSFER_SEQUENCE_INVALID`, and the exact 598-byte stdout was reconstructed. |
| `npm run p2:verify` | Exit 0; P2 typecheck and 9 files / 114 tests passed. |
| `npm run p4:generate` | Exit 0; the tracked evidence map was regenerated from the intentional five-attempt projection. |
| `npm run p4:verify` | Exit 0; exact regeneration and 1 file / 2 focused tests passed with five Vite attempts in exactly three talk tables. |
| `npm run check` | Exit 0; formatting, lint, root typecheck, and 103 files / 705 tests passed. |
| `git diff --check` | Exit 0 after the review, presentation projection, and handoff updates. |
| `git status --short` | Captured the existing uncommitted detached-transfer candidate/history plus this result review and projection update; no unrelated change was reverted. |

## Safety boundary and remaining limitations

This review did not call Docker, invoke `npm run p2:execute:vite`, retry or
repair the pair, access a runtime socket, inspect a historical root or
container, enumerate a parent result directory, read regular event,
direct-write, or tool-output evidence, change a retained permission, rebuild or
mutate staging, pull an image, use external network or credentials, access
frozen M4 state, perform Remote Git, publish, deploy, or communicate with a
third party. The `continue-repository-work` standing authorization was not
needed by this Docker-free review.

The progress mount remains a `repository-cooperative-fixture` assumption, not
adversarial same-UID writer isolation. No Vite receipt, constrained attempt,
same-image pair, capability outcome, or selected-profile Observed evidence
exists. The one-shot gate is exhausted and no retry or runtime recovery is
authorized.

Next: none.
