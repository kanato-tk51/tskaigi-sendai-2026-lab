# M4 run-controls remediation independent re-review

## Review target and decision

- Target: current uncommitted Issue #40 B-18/B-19/B-20 remediation
- Base HEAD: `3c54135d3f1e812035d8a506bfaf5fa1dd264c53`
- B-18 canonical profile/digest/run binding: **CLOSED**
- B-19 production control/backend/activation boundary: **CLOSED**
- B-20 existing-image/no-rebuild executor: **CLOSED**
- Static/unit gate: **APPROVED with no blocking or non-blocking finding**
- Exact one-time `npm run --silent m4:run:controls` gate: **APPROVED for a fresh
  execution worker; not executed in this review**
- Profile-control runtime enforcement and Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The remediation binds the recovered non-null image digest to canonical
permissive/constrained profile bytes and exact pair run IDs, routes the
temporary production entry only through the existing-image executor, and
constructs a fixed host backend whose process, filesystem, transfer, and
cleanup surfaces are closed over reviewed values. The ordinary entry and
package root remain fail closed and cannot reach the production runner or
backend.

This was a fresh independent Docker-non-executing review. Standing
authorization was not used because no approval-gated runtime action was
performed. No separate human review is claimed.

## Reviewed snapshot identity

The aggregate below covers the 67 repository-visible files returned by sorted
`rg --files` under `containers/profile-control`, `containers/permissive`,
`containers/constrained`, `profiles/permissive`, and `profiles/constrained`.
Each repository-relative file was hashed with `sha256sum`; the sorted manifest
was then hashed with `sha256sum`.

| Target | SHA-256 |
|---|---|
| Sorted 67-file control/profile manifest | `9e9d79b10e91966f6871da7e335d62703304cf47c1f8b757b53449d942ebba7b` |
| `profiles/permissive/profile.json` (1,402 bytes) | `243915063e04f4009bf2132d74ae6172a763583560ce6534c3520bbda4ddde7c` |
| `profiles/constrained/profile.json` (1,411 bytes) | `a41bc401830f4079607fb3720b1dbdf636b283fadf0db4082d0113bf3238838e` |
| `containers/profile-control/src/constants.ts` | `8441aadf55bcd15b4a207283c9723ae703df4c8aa3234282a12c224c2dd1fb0f` |
| `containers/profile-control/src/profile-input.ts` | `a2d799a8d86bc82d4c64e767ffb289277ed9c391293711f69a0bd5ec53df2844` |
| `containers/profile-control/src/run-controls.ts` | `de0cc1f9c5c414209e918a8f88e5a1144c04f72c57e2f8583095b58a9239084a` |
| `containers/profile-control/src/control-host-backend.ts` | `2258ffd78c3460f2b88375f675e0e119c055eabaa157488583e5501a47345afc` |
| `containers/profile-control/src/execution.ts` | `8843b078c58717371444e2bcce4b3c88e3c2cf6f10c123af6e74785f3142951c` |
| `containers/profile-control/src/definitions.ts` | `e20c0bf8135d0db349a50525154181bc5c4b1cb2282b2f7933cabdb0c779d38e` |
| `containers/profile-control/src/docker-plan.ts` | `5bc051512ba9f0a60f709b4b633a2eb105ec2c1c166cfb73301706158ef314a1` |
| `containers/profile-control/src/inspect.ts` | `9c24c147ba5d2ef03606c9be3af1d9e7cdcd6aa14de6259960e14c6310b5c1d8` |
| `containers/profile-control/test/control-host-backend.test.ts` | `3aa8a39d852d097d167763818c9ed3e00101e65af90eb2511072b82f8b873eca` |
| `containers/profile-control/test/run-controls.test.ts` | `b4283d0752eb359c064cdb79c17696d730bee53b4fb8fbfac6fb13bef065055c` |
| `containers/profile-control/test/execution.test.ts` | `34eb1e62a04972278b183e9bd3ebe492aacaa9e7f26bd6e240edba304cccb3ca` |
| `containers/profile-control/test/import-safety.test.ts` | `791d2cd13bd8c34e080bdb06bd6b3e4ef70216ec052daabcc033adcdec7153a1` |
| `containers/profile-control/scripts/verify-static.mjs` | `86f327f2c1391872a01609e89a25320f4003ea04f00c03b867c7b97ddbc1b9a8` |
| ordinary `containers/profile-control/src/orchestrator.ts` | `fefc2af9c7f69428383eba03d8bb49b0caa51a5332043e8741db39352fb1faf6` |
| ordinary `containers/profile-control/src/orchestrator-entry.ts` | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| ordinary `containers/profile-control/dist/orchestrator-entry.js` | `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4` |
| `containers/profile-control/src/index.ts` | `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4` |
| `package.json` | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `cedf514b15c510847397db874226c599557beafb24960ffdc4ef6fa246952852` |
| `vitest.config.ts` | `b9c153897704dbabe350c9ae2b9dda4e033d0cae85d33a08ba54e24a18c8264c` |
| remediation contract | `782866a7105c48c50d35ca1f3fd8ccd28a2f2fe02750a949be04053bcbf9b2ed` |
| remediation review prompt | `b992667b7ebb1d72fee0b7e2d4aa5f615dacd8a57db8b5f783a149c9db729c59` |
| updated one-time execution-gate candidate | `fb869c6559fe47a073de8966b50f8bc411d48bc07fb75a8ec3fad0504f8468b5` |

## B-18 closure: canonical fixed binding

Independent parsing reproduced both files as exact single-line canonical JSON
plus one final LF. Strict schema validation fixes the key order, profile ID,
revision, policy, limits, logical evidence locations, and the recovered digest
`sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`.
Whitespace, key-order, profile-ID, digest, or byte substitutions fail the final
canonical byte comparison or fixed-value validation.

The production definition reconstructs the pair with immutable run IDs:

| Profile | Run ID | Run root | Container name |
|---|---|---|---|
| permissive | `m4-profile-control-p-20260720-01` | `results/runs/m4-profile-controls/m4-profile-control-p-20260720-01` | `tskaigi-m4-p-m4-profile-control-p-20260720-01` |
| constrained | `m4-profile-control-c-20260720-01` | `results/runs/m4-profile-controls/m4-profile-control-c-20260720-01` | `tskaigi-m4-c-m4-profile-control-c-20260720-01` |

Both exact roots were absent during this review. Production backend creation
validates both roots as absent before creating either and then uses exclusive
directory/file creation. The review did not read, enumerate, inspect, or mutate
the retained offline-build run root or staged tag.

## B-19 closure: production control boundary

The exact activation reaches `runFixedProductionControls()`, which reads only
the repository-owned versioned image/staging/profile bytes, constructs the
fixed pair and plans, creates `FixedControlHostBackend`, and calls the
existing-image executor. There is no caller-supplied image, run ID, profile,
path, command, argument, mount, environment, network option, or cleanup target.

The backend enforces the following reviewed boundary:

- fixed `/usr/bin/docker`, `shell: false`, and an environment containing only
  the exact run-owned credential-empty `DOCKER_CONFIG`;
- reference identity for every executor-supplied command object and exact
  `permissive` then `constrained` phase order;
- fixed `create -> inspect -> start --attach -> transfer -> remove` lifecycle,
  with transfer limited to three permissive and two constrained `docker cp`
  commands from stopped fixed containers;
- private `0700` run roots; canonical `0444` manifest under `0555` input;
  `0733` result/scratch directories for fixed UID/GID `10001:10001`; and
  exclusive `0600` canonical host records and temporary copies;
- exact regular-file, mode, hard-link, identity, inventory, byte, timeout,
  output, and evidence-size validation;
- monotonic timeout/output/process first failure, bounded force settlement,
  no further spawn while a child remains active, and cleanup failure retained
  without replacing an earlier primary failure;
- deletion limited to exact temporary transfer copies/directories and the two
  fixed credential-empty config files/directories. Container result evidence
  and run records remain in their fixed roots.

Raw stdout, stderr, Docker inspect bytes, errors, host absolute paths, canary
values, and temporary copied evidence are not persisted. Only canonical
manifest, sanitized host inspection, completion, comparison, and canonical
container evidence remain. Focused behavioral coverage observed the exact 13
successful fake spawns, rejected a substituted command before spawn, proved
the pair-absence gate, and checked canonical result/config cleanup.

The ordinary `orchestrator-entry.ts` still calls only
`runApprovedOrchestrator()`, which fails with `M4_EXECUTION_NOT_APPROVED` before
constructing a production backend. Ordinary `orchestrator.ts` and `src/index.ts`
do not import, construct, or export the production control backend or runner.

## B-20 closure: existing-image/no-rebuild executor

`run-controls.ts` imports and calls only
`executeFixedExistingImageProfilePair()`. It has no dependency on
`executeFixedProfilePair()`, `createImageBuildPlan()`, staging, doctor, build,
image inspect, the retained tag, or the retained build run root. Both create
plans consume the fixed recovered digest directly with `--pull never`.

The existing-image executor revalidates the branded pair/plan/layout identity,
preserves inspection/evidence/manifest/completion validation, persists the
canonical sanitized profile records, and always attempts the fixed remove and
backend cleanup paths. Its focused regression observed a complete pair without
the historical staging/read/doctor/build/image-inspect calls. The historical
build-first executor remains exported only for its earlier static/unit
contract and is not reachable from production controls.

## Exact activation and restoration

The complete TypeScript block in the remediation contract independently hashes
to
`580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d`.
It replaces only `orchestrator-entry.ts`, accepts only the already parsed exact
`run-controls` operation, invokes the fixed runner, emits only the canonical
pair result or a sanitized error code, and has no arbitrary input seam.

Mandatory restoration is fixed to the ordinary source hash
`73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f`
and ordinary compiled-output hash
`02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4`.
The [updated one-time execution gate](../../prompts/m4-execution-profiles-run-controls-gate.md)
records these complete activation/restoration identities, the reviewed source
aggregate, exact pair, one-shot command, maximum fixed command set, and
mandatory restoration on every outcome.

## Verification observed

| Command | Observed result |
|---|---|
| Independent sorted manifest, critical `sha256sum`, exact activation-block hash, pair-root absence, and import/reachability inspection | Exit 0; reproduced the identities and fixed bindings above. |
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 21 test files / 223 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 21 files / 223 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 103 test files / 711 tests passed. |
| `git diff --check` | Exit 0 before review/status records. |
| `git status --short` | Confirmed the existing uncommitted presentation/M4 working tree was preserved; review/status paths are the only additions from this review task. |

## Non-executing constraints honored

This review did not apply the temporary activation and did not run
`npm run m4:doctor`, `npm run m4:build`,
`npm run m4:recovery:offline-build`, `npm run m4:run:controls`, or
`npm run m4:verify:evidence`. It did not execute Docker, access a runtime
socket, inspect/pull/build an image, inspect or mutate the retained tag/run
root, create/start/copy/remove a container, retry/rebind, or establish runtime
enforcement or Observed evidence.

No external network, credential, host home, Remote Git, publication,
deployment, or external communication was used.

## Gate conclusion and next task

Issue #40 B-18/B-19/B-20 are closed at the static/unit boundary. The updated
candidate is an exact reviewed one-time action, so a fresh
`continue-repository-work` worker may use the standing authorization to follow
the updated gate and invoke `npm run --silent m4:run:controls` exactly once.
That use will not constitute a separate human review. The worker must restore
ordinary source and compiled output on every outcome and must not retry.

Static/unit approval does not establish Docker behavior, runtime enforcement,
profile-control Observed, adapter/profile route Observed, or experiment-matrix
route Observed. Issue #41 remains sequenced after the one-time result.
