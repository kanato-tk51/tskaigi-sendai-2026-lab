# M3 production raw-to-derived collector implementation review

## Review target and decision

- Target: frozen-research issue #47's bounded codegen `observe` v3
  raw-to-derived collector static/unit implementation
- Review type: fresh independent Docker-free read-only implementation review
- Decision: **`BLOCKED`**
- Closed at implementation scope: M3-PC02 and M3-PC05
- Open at implementation scope: M3-PC01, M3-PC03, M3-PC04, and M3-PC06
- Implementation changes made by this review: none
- Review-owned changes: the saved review prompt, this record, and four minimal
  status/handoff updates only

The implementation reproduces the approved fixed manifest, held raw-file
content/identity checkpoints, deterministic two-/five-file rendering, private
staging, final-rename terminal, and evidence non-promotion boundaries. The
fresh verification also reproduces every recorded focused/root pass. It does
not yet implement the complete reviewed contract because producer comparison
loses the cross-kind 12-event order, and three post-open branches can encounter
a fallible descriptor `stat()` before the handle enters the settlement set.

No adapter or collector activation, raw/historical result, Docker/runtime
socket, retained state, network, credential, publication, deployment, or
`Observed` evidence was accessed or changed.

## Finding decisions

| ID | Decision | Independent review result |
| --- | --- | --- |
| M3-PC01 | **Open** | The additive v3/v2 schema, exact scenario/profile mapping, fixed manifest, runtime context, identity-bearing per-kind Expected rows, and unavailable source/tool deltas are correct. However, events are filtered into route/attempt/tool arrays before comparison, so their relative cross-kind producer order is discarded. A segment with the final two routes moved before the six attempts can retain exact per-kind arrays and be reported as an Expected match even though M2-E fixes one exact 12-event order. |
| M3-PC02 | **Closed** | Raw inventory, private modes/ownership, no-follow single opens, three distinct file identities, initial positioned capture, and R1/R2 same-held-descriptor byte-count/EOF/SHA-256 checks are implemented. Raw-file descriptor/path status is compared with full BigInt identity, and run/raw/segments ancestor object/path identity is independently rechecked. No reopen or path-derived content read was found. |
| M3-PC03 | **Open** | Normal and all currently injected branches keep staging non-evidence, settle registered handles before rename, preconstruct the result, and make rename the last fallible operation. But raw-directory, raw-file, and staged-file open helpers await `handle.stat()` before adding the opened handle to `handles`. A failed `stat()` therefore reaches the outer rejection with an unregistered open descriptor that `settleHandles()` cannot close or classify. |
| M3-PC04 | **Open** | Existing tests cover content rejection, R1/R2 same-size mutation, path/ancestor/staging replacement, every registered close checkpoint, rename failure, raw inventory/type/mode/link rejection, raw preservation, and private output. They do not cover or statically exclude the post-open/pre-registration descriptor branches above, so the contract's complete descriptor-settlement negative boundary is not established. |
| M3-PC05 | **Closed** | Scenario files remain Expected inputs; the package-root API exposes only pure v3 validation/collection; the filesystem collector and test control are not package-root exports; staging is non-evidence; and no adapter, profile, matrix, presentation, runtime-enforcement, or other `Observed` promotion or historical P2 backfill was added. |
| M3-PC06 | **Open** | All issue #47 production and verification changes are within the approved M3-PC06 allowlist, and no CLI/runner/fixture/package script/export map/codegen/probe/container/runtime/result activation edge changed. The focused/static matrix is nevertheless insufficient until it rejects a cross-kind event permutation and proves every successful open is immediately owned by the close-settlement protocol before another fallible operation. |

## Adapter, schema, and Expected evidence

The two tracked definitions validate only:

| Scenario | Profile | Route / attempt / tool | Hash states |
| --- | --- | --- | --- |
| `codegen-observe-p` | `permissive` | `5 / 6 / 1` | source `unavailable`; tool `unavailable` |
| `codegen-observe-c` | `constrained` | `5 / 6 / 1` | source `unavailable`; tool `unavailable` |

A bounded pure assertion passed the current M2-E
`createFixedManifest("observe", ...)` through the new v3 snapshot validator for
both definitions. It reproduced one producer, the fixed target/phase/version
contract, both profile bindings, two unavailable hash rows, and the M2-E
12-entry `EXPECTED_EVENT_ORDER`. No codegen adapter runtime dependency was
added to `packages/lab-cli`.

The implementation correctly compares ordered identities within each separate
route, attempt, tool-change, and hash array. The loss occurs before those
comparisons: `collectCodegenProductionRun()` filters the accepted producer
events into three independent arrays, and `comparisonRecords()` walks each
array separately. There is no full event identity sequence in the production
source, and the focused test has no cross-kind permutation case. The current
positive order and one same-kind outcome mismatch therefore do not observe
this boundary.

This is a validity gap, not runtime evidence. The remediation must preserve the
v3 scenario and manifest bytes, compare the exact locally frozen 12-event
identity order across kinds, and keep any unexpected but otherwise complete
order visible as a deterministic mismatch or the contract's explicitly chosen
fail-closed result. It must not import the codegen package at runtime or borrow
a P2 receipt.

## Held identity and transaction evidence

The implemented normal state machine is:

| State | Independently traced behavior |
| --- | --- |
| Raw-only | Exact run/raw/segments inventory and output absence are checked; private directories/files are opened no-follow; three raw file identities are distinct. |
| Captured | Each raw file is read by positioned reads from offset zero through recorded size, immediate EOF is proved, bytes are privately copied, and SHA-256 is retained. |
| R1 | After pure validation/reduction/rendering and before staging creation, every held raw descriptor repeats byte-count/EOF/SHA-256 while raw file and ancestor descriptor/path identities are checked separately. |
| Staged/R2 | Exact private files are exclusively created, written, synced, read back, and identity/inventory checked; R2 repeats held raw checks; staged checks and directory sync repeat. |
| Precommit | Immutable success/failure results are available and every **registered** raw/staged/directory handle is offered to the deterministic close loop. Any close/checkpoint failure suppresses rename while all remaining registered handles settle. |
| Commit | The staging-to-derived rename is the final `await`; success returns only the preconstructed result, while failure retains staging and returns the fixed sanitized filesystem rejection. |

The source and 19 focused tests support this trace for registered handles. The
remaining ownership gap is narrower but contract-blocking:

- `openHeldDirectory()` opens a descriptor, then awaits `handle.stat()`, and
  only afterward constructs/pushes its `HeldObject`;
- `openHeldRawFile()` has the same ordering; and
- `createStagedFile()` also awaits the first `handle.stat()` before pushing the
  staged handle.

If that first post-open operation rejects, the handle is neither in the
settlement set nor explicitly closed by that branch. The outer catch can only
settle previously registered handles. This contradicts the approved rule that
every opened raw/staged/directory descriptor reaches complete precommit close
settlement and that uncertainty cannot escape as an untracked resource.

## Rejection, sanitization, and evidence boundary

The review reproduced these closed behaviors:

- public structured inputs reject Proxy/accessor/custom-prototype/symbol/
  hidden/unknown/cyclic graphs, and byte inputs are copied into fresh
  non-shared storage;
- fatal UTF-8, canonical JSON/JSONL, LF, size/count, producer sequence,
  manifest/event context, completion, and hash-finalization errors produce
  only the two sanitized Inconclusive files;
- complete and Expected-mismatch inputs deterministically render five files;
- R1/R2 raw drift, known staging drift, registered close failure, and final
  rename failure preserve raw, publish no `derived/`, retain at most exact
  reached staging, and perform no cleanup or retry; and
- derived bytes exclude raw canary/environment content, host paths, commands,
  container identities, output streams, private filesystem identity,
  rejected-input hashes, and unsanitized errors.

The unregistered post-open descriptor branch does not publish derived bytes,
so sanitization and M3-PC05 remain closed. It blocks M3-PC03/M3-PC04 because
resource settlement is part of the publication/rejection terminal, not because
the existing derived inventories are incorrectly classified.

## Changed-path and static boundary review

The issue #47 implementation changed only these approved paths:

- production: `src/constants.ts`, `src/types.ts`, `src/safe-data.ts`, new
  `src/codegen-production.ts`, and `src/index.ts`;
- scenario/verification: two new codegen scenario JSON files,
  `results/runs/README.md`, `scripts/verify-static.mjs`, and new
  `test/codegen-production.test.ts`; and
- the saved implementation prompt plus the four allowed status records.

No issue #47 change was found in the other allowlisted M3 production/tests or
outside the allowlist. Existing container/profile, package manifest, and other
working-tree changes predate and remain outside this review target.

The static verifier confirms fixed scenario cardinality, package-root
non-activation, required filesystem markers, and no `await` between final
rename and return. Its string-marker boundary and the focused behavioral suite
do not detect either open finding above.

## Verification observed

| Command | Observed result |
| --- | --- |
| Initial `find .. -name AGENTS.md -print` instruction discovery | This was an out-of-scope path-discovery mistake: it enumerated path names under the repository parent and encountered permission-denied result subtrees before the chained repository-document reads ran. It read no protected file content, changed nothing, was not used as review evidence, and was not repeated; every later discovery/read was repository-scoped. |
| `npm run m3:verify` | Exit 0; typecheck, build, scoped static verification, 9 test files, and all 52 tests passed. |
| `npm run verify:static --workspace packages/probe-core` | Exit 0; 19 source files checked with no failure; the command states that static inspection is not runtime-isolation proof. |
| `npm run typecheck` | Exit 0. |
| `npm test` | Exit 0; 108 test files and all 801 tests passed. |
| Pure fixed-manifest/v3-snapshot assertion | Exit 0; both profile definitions, 5/6/1 manifest cardinality, 12-entry M2-E order, and two unavailable hashes reproduced. |
| Focused source-topology assertion | Exit 0; comparison is grouped by event kind with no full-order guard/test; all three open helpers place first `stat()` before settlement registration; no `await` follows final rename before return. |
| `npm run check` | Exit 1 at `format:check`; only the pre-existing out-of-scope `containers/profile-control/test/control-host-backend.test.ts` was reported. Later check stages did not run. |
| `npm run lint` | Exit 1 with 11 errors, all in pre-existing out-of-scope `containers/profile-control/scripts/verify-static.mjs`. |

The root check is not recorded as passing. Its failure is independent from the
two issue #47 review findings; passing focused/root tests also do not close
those untested source branches.

## Exact bounded remediation

Perform one Docker-free issue #47 implementation remediation under the
unchanged M3-PC06 allowlist:

1. compare the exact 12 producer event identities across route, attempt, and
   tool kinds, and add a focused cross-kind reorder case that cannot remain an
   Expected match;
2. make every successfully opened directory/raw/staged descriptor enter an
   owned settlement record before any later fallible operation, or explicitly
   close and settle it on every pre-registration failure path;
3. add focused behavioral/static coverage proving no open-to-first-stat edge
   can bypass settlement while preserving all current R1/R2, staging,
   registered-close, final-rename, v2, and package-root boundaries; and
4. rerun the exact Docker-free implementation verification, then obtain a
   fresh independent remediation re-review before ingestion or activation.

Save the bounded remediation prompt and its fresh re-review prompt before the
first implementation change. Do not broaden the scenario schema, package
surface, implementation allowlist, runtime identity, command, result, or
evidence class.

## Remaining limitations and safety statement

- This review is Docker-free static/unit evidence. It does not establish an
  adapter occurrence, collector activation, profile enforcement, matrix or
  presentation evidence, or any `Observed` result.
- SHA-256 proves byte identity, not authenticity or semantic harmlessness.
- The cooperative repository-owned Linux filesystem assumption, same-UID race
  limitation, and no power-loss durability claim remain unchanged.
- `npm run m3:run:fixture`, adapters, probes, lifecycle fixtures, production
  collection, Docker, retained/result/historical state, external network,
  credentials, Remote Git, cleanup, retry, publication, and deployment were
  not used.
- Apart from the recorded initial parent-path discovery mistake, review work
  stayed inside the repository boundary.
- Standing authorization was not needed or used because this review crossed
  no execution approval gate.

Next: remediate only the cross-kind 12-event order and post-open descriptor-
settlement gaps above under the unchanged M3-PC06 allowlist, saving the
remediation and fresh re-review prompts before the first source change.
