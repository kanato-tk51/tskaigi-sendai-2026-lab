# P2 selected Vite `20260723-01` init/reaping result independent review

## Review target and decision

- Target: the exhausted `20260723-01` one-shot selected-Vite pair, its two
  canonical v4 attempts and receipts, fixed v2 progress records, approved
  ten-file candidate identity, bounded direct stdout, and only the two exact
  active result roots
- Review type: fresh independent Docker-free fixed-root read-only result review
- Decision: **ACCEPTED as selected Vite Observed at the exact one-local-pair
  scope**
- Blocking findings: none
- Non-blocking findings: none
- Retry, repair, or runtime recovery: prohibited and not performed
- Selected Vite Observed: accepted for the exact reviewed pair
- Experiment-matrix Observed: unchanged; the talk-facing selected-profile
  projection is accepted without hand-promoting the separate matrix catalog

Both independently reconstructed receipts are canonical, complete, and
`matches-expected`. They bind the fixed image ID, exact Expected/run/profile
identities, natural container and runner exit, completed cleanup, valid
terminal progress, unchanged source hash, bounded output inventory, and empty
issues. The approved pure pair and entry projectors reproduce the exact
same-image pair and the execution worker's 684-byte stdout handoff.

This result closes the selected-Vite presentation gap at one exact local pair.
It does not change any Expected event value, reinterpret or remove the five
earlier immutable Inconclusive attempts, or promote the broader
`experiment-matrix.md` rows. This is an independent Codex review, not a
separate human review.

## Candidate, command, and staging identity

All ten implementation/execution-gate SHA-256 values reproduced exactly:

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

The package script remains exactly
`npm run p2:build && node containers/presentation-profiles/runner/vite-executor-entry.js`.
The ignored Vite staging root is a non-symlink directory containing exactly
128 regular non-symlink files. Every target equals its declared source and has
its exact numeric `0444` or `0555` mode. The plan-order canonical JSON array of
`{targetPath,mode,sha256}` records has SHA-256
`8803f5b5cec7dedb2168a03087f9e574f1d380e81602ebc2c8d722783859bd20`.
Staged Vite/Rollup/esbuild versions are `6.4.3` / `4.62.2` / `0.25.12`.
The review verified, but did not rebuild or mutate, staging.

## Exact fixed roots and evidence identities

Each exact root is a non-symlink mode-`0700` directory whose bounded inventory
contains only `attempt.json`, `summary.json`, `direct-write`, `docker-config`,
`progress`, `result`, and `tool`. The fixed subdirectories and files have the
contract modes shown below. `progress/runner-progress.next` is absent in both
roots.

### Permissive

| Fixed path | Type / mode | Bytes | SHA-256 or state |
|---|---|---:|---|
| `attempt.json` | regular / `0600` | 1,774 | `90e0b9e13ff0cb64fe944038ad599faf32986e22d3c4cb4ea4457b14026444bc` |
| `summary.json` | regular / `0600` | 1,732 | `4cefb3381d5e583910acbcc978f30aa621b3b5550c352110f2db96caf23f0ef9` |
| `progress/` | directory / `0555` | — | sealed |
| `progress/runner-progress.json` | regular / `0444` | 1,146 | `4406d2ed9571df27747fd6ce8446591645e7603421de4c3c5e40e64d5575ddca` |
| `result/` | directory / `0777` | — | fixed evidence root |
| `result/vite-coordinator.jsonl` | regular / `0444` | 11,068 | `bc78e951066a141338e57a62d552b138768529c1bbbead8c8698166788bc2368` |
| `direct-write/` | directory / `0777` | — | fixed direct-write root |
| `direct-write/direct-write-marker.json` | regular / `0600` | 144 | present; metadata only |
| `tool/` | directory / `0777` | — | fixed tool root |
| `tool/out/` | directory / `0555` | — | exactly one fixed entry |
| `tool/out/entry.js` | regular / `0444` | 81 | `91a72ea736460529a221cf9bc1eecdf78a04d864c41f347fb4b138cf87d0040b` |
| `docker-config/` | directory / `0700` | — | fixed CLI configuration root |
| `docker-config/config.json` | regular / `0600` | 3 | `ca3d163bab055381827226140568f3bef7eaac187cebd76878e0b63e9e442356`; exact credential-empty `{}\n` |

### Constrained

| Fixed path | Type / mode | Bytes | SHA-256 or state |
|---|---|---:|---|
| `attempt.json` | regular / `0600` | 1,783 | `d55892e290fed1c2acea7ddfc51dd98b11d18e93fef814a1e64048a9538ff2f7` |
| `summary.json` | regular / `0600` | 1,826 | `871bfa09a0a12145edcbf7ffacb975f88a8fcfc5d44177051ae5811dde8358ba` |
| `progress/` | directory / `0555` | — | sealed |
| `progress/runner-progress.json` | regular / `0444` | 1,155 | `8757894cfd411d154e48479b67fa699a120a29065e3d9244b296d047e2c12b9d` |
| `result/` | directory / `0777` | — | fixed evidence root |
| `result/vite-coordinator.jsonl` | regular / `0444` | 11,062 | `c1cf84dcd85f8e9b3e300bd9e5c170a0abe304de8c4b9dfad0771ee01210bc4d` |
| `direct-write/` | directory / `0777` | — | fixed direct-write root |
| `direct-write/direct-write-marker.json` | absent | — | expected constrained outcome |
| `tool/` | directory / `0777` | — | fixed tool root |
| `tool/out/` | directory / `0555` | — | exactly one fixed entry |
| `tool/out/entry.js` | regular / `0444` | 81 | `91a72ea736460529a221cf9bc1eecdf78a04d864c41f347fb4b138cf87d0040b` |
| `docker-config/` | directory / `0700` | — | fixed CLI configuration root |
| `docker-config/config.json` | regular / `0600` | 3 | `ca3d163bab055381827226140568f3bef7eaac187cebd76878e0b63e9e442356`; exact credential-empty `{}\n` |

Both attempts and receipts are exact canonical UTF-8 JSON lines with one
trailing LF. The review initially attempted a no-follow open of the permissive
mode-`0600` direct-write marker; the operating system rejected it with
`EACCES`, no marker bytes were read, and no conclusion depends on its content.
The approved evidence reader requires only its regular-file metadata and size.
The constrained marker is correctly absent.

## Independently reconstructed attempts and receipts

The sealed progress records were passed without printing their raw bytes to the
approved pure v2 validator. Both reconstruct as `valid-terminal` with ten
contiguous records:

1. `runner-entered`
2. `inputs-prepared`
3. `service-ready`
4. `child-launched`
5. `child-watch-armed`
6. `child-close-observed`
7. `child-group-absent`
8. `child-settled`
9. `service-settled`
10. `output-exported`

Both terminals are `completed / known`, retain no failure or settlement code,
record the same unchanged source hash
`sha256:379ba4149c5492855bdbbcd7a9f207c223cc8578dc62e51228e06416354ab770`,
and bind an 81-byte entry output. Permissive records service `listening` then
`closed`; constrained records `not-required` then `not-started`. Both record
natural child exit 0, confirmed process-group absence, successful child
settlement, and validated sealed output.

The approved bounded evidence reader and pure projectors reconstructed each
attempt and receipt exactly:

| Field | Permissive | Constrained |
|---|---|---|
| Attempt schema/status | `p2-vite-attempt/v4` / `receipt-pending` | same |
| Expected revision | `p2-vite-expected-20260723-01` | same |
| Image / exit | fixed image ID / `0` | same |
| Docker/container/runner settlement | `known` / `natural-exited` / `exited` | same |
| Cleanup / output | `completed` / `fixed-paths-exported` | same |
| Attempt issues | none | none |
| Receipt schema/completion | `p2-vite-execution/v4` / `complete` | same |
| Tool versions | Node `v20.18.2`; Vite `6.4.3`; Rollup `4.62.2`; esbuild `0.25.12` | same |
| Event / entry / direct bytes | `11,068 / 81 / 144` | `11,062 / 81 / 0` |
| Projection | `p2-vite-profile-summary/v1` / `matches-expected` | same |
| Counts | route `6`; capability `6`; tool API `3`; total `15` | same |
| Projection issues | none | none |

The sanitized capability projections are:

| Attempt | Permissive | Constrained |
|---|---|---|
| Environment | `success` | `failure / ENVIRONMENT_VARIABLE_ABSENT` |
| File read | `success` | `failure / READ_DENIED` |
| Source hash | `success`, unchanged | `success`, unchanged |
| Direct write | `success` | `failure / WRITE_DENIED` |
| Loopback | `success` | `failure / NETWORK_FAILURE` |
| Fixed child | `success` | `success` |

The constrained projection retains exactly
`CONSTRAINED_CHILD_REQUIRED_BY_TOOL`; this is a capability limitation, not a
denial. The source-hash attempt remains integrity evidence outside the five
talk capability cells.

## Pair, ordering, and stdout

The pure pair projector independently reconstructed:

- schema `p2-vite-pair/v4`;
- Expected revision `p2-vite-expected-20260723-01`;
- validity `same-image`;
- the fixed inspected image ID;
- progress trust `repository-cooperative-fixture`; and
- no pair issue.

The pure entry projector then reconstructed the exact one-line execution
handoff: 684 bytes including LF, SHA-256
`683b78cd5f181e083657c76382eb94612ccdb989cea1bc8efe6075d9b6997aac`.
It is byte-identical to the recorded direct stdout and contains two complete,
written, inspected, `matches-expected` scenarios with no issue.

The reviewed fixed executor awaits permissive finalization and requires its
complete receipt before constrained setup. The existence of both exact
canonical receipts under the one reviewed argument-free occurrence therefore
retains the approved permissive-first ordering. This result review did not use
filesystem timestamps as a substitute for that fixed execution contract.

## Evidence classification and limitations

- **Reviewed runtime evidence:** two canonical attempts, two canonical
  receipts, their bounded evidence projections, one same-image pair, and the
  exact entry handoff are accepted at the exact one-local-pair scope.
- **Configuration intent:** the fixed Vite create plan contains one `--init`,
  and the approved lifecycle parser accepts only literal
  `HostConfig.Init=true` at created and final inspection. The complete
  lifecycle records are consistent with that gate, but no raw inspect record is
  promoted into the tracked projection.
- **Observed settlement:** both durable progress records prove natural close,
  process-group absence, child success, service settlement, output export, and
  known runner settlement for this exact pair.
- **Not established:** that Docker init or reaping caused success, which daemon
  init implementation was used, whether any earlier retained residue was live
  or unreaped, repeated-run reproducibility, adversarial same-UID progress
  isolation, arbitrary-package isolation, or general sandbox behavior.
- **Historical boundary:** all five earlier Inconclusive attempts remain
  immutable and visible. Their missing receipts and settlement gaps are not
  repaired or reinterpreted by this successful generation.
- **Matrix boundary:** selected Vite is now Observed only in the tracked
  presentation selected-profile projection. `experiment-matrix.md` remains
  unchanged under its separate generator/no-hand-promotion rule.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Ten approved candidate SHA-256 checks | Exit 0; every hash matched the implementation review. |
| Exact package-script assertion | Exit 0; the argument-free fixed build-and-entry command matched. |
| Fixed staging verification and independent manifest/version assertion | Exit 0; 128 source-equal regular files, exact numeric modes, manifest `8803f5b5...`, and versions `6.4.3` / `4.62.2` / `0.25.12`. |
| Fixed-root no-follow inventory and canonical-record assertion | Exit 0; both `0700` roots, fixed path types/modes/sizes, canonical attempts/receipts, sealed progress, absent temporary files, and credential-empty configs matched. |
| Initial all-evidence hash command | Exit 1 only because the permissive mode-`0600` direct marker rejected open with `EACCES`; no marker byte was read and no state changed. |
| Bounded accessible-evidence hash assertion | Exit 0; canonical record, progress, event, fixed entry, and empty-config hashes reproduced. |
| `npm run p2:build` | Exit 0; probe-core, M2-D, M2-E, and presentation TypeScript outputs compiled. |
| Initial progress-reader reconstruction | Exit 1 because the production transfer reader correctly requires the pre-seal `01777` state while retained progress is already sealed `0555`; no state changed. |
| Pure sealed-progress/evidence/receipt/pair/entry reconstruction | Exit 0; both canonical attempts and receipts matched byte for byte, the pair was `same-image`, and the 684-byte stdout matched. |
| `npm run p2:verify` | Exit 0; 9 files and 122 tests passed. |
| `npm run p4:generate` | Exit 0; the committed presentation evidence was regenerated from the authoritative metadata. |
| `npm run p4:verify` | The first run exposed an exact-string assertion that did not account for generated Markdown wrapping. After correcting only that test, the final run exited 0 with 1 file and 2 tests passed. |
| Focused Prettier check | The first check identified `scripts/presentation-evidence.mjs`; after formatting that file, the final check over every task-owned changed file exited 0. |
| `npm run check` | Exit 1 at the formatting stage on unchanged `containers/profile-control/test/control-host-backend.test.ts`; this was outside the accepted result-review change. |
| `npm run lint` | Exit 1 with 20 errors confined to unchanged profile-control and frozen npm12 experiment scripts; no error named a task-owned file. |
| `npm run typecheck` | Exit 0. |
| `npm test` | Exit 1 with 99 files and 838 tests passed, 10 files and 39 tests failed. The failures were outside this task: fixed-Node assertions running under host Node `v22.23.1`, two related M2-E CLI cases, and one probe-core excessive-header-count case. |
| `git diff --check` | Exit 0. |
| Protected-diff assertion | Exit 0 for `docs/experiment-matrix.md`, `results/examples/presentation-mvp/routes.json`, and `results/examples/presentation-mvp/artifact.json`. |

## Safety boundary

This review did not call Docker, invoke `npm run p2:execute:vite`, retry or
repair the pair, access a runtime socket, inspect any historical result root or
container, enumerate the parent result directory, inspect `tool/canary`, print
raw event bytes, read a raw canary value, change retained permissions, rebuild
or mutate staging, pull an image, use external network or credentials, access
frozen M4 state, perform Remote Git, publish, deploy, or communicate with a
third party.

The prior execution worker used `continue-repository-work` standing
authorization for the exact reviewed one-shot command. This non-executing
review did not need or use standing authorization.

Next: none.
