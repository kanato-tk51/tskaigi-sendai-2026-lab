# M4 exact filesystem-object identity implementation review

## Review target and decision

- Target: the completed issue #45 Docker-free first implementation under the
  exact 16-path contract allowlist
- Review type: fresh independent Docker-free read-only implementation and
  focused-test review
- Decision: **BLOCKED; do not start the distinct activation-object contract
  task**
- Contract findings M4-FS01 through M4-FS04: **remain CLOSED at contract
  scope**
- Implementation findings: **M4-FSI01 through M4-FSI05 OPEN**
- Blocking findings: five
- Non-blocking findings: none
- Docker, retained M4 state, activation, compiled output, runtime evidence, and
  `Observed`: not accessed, executed, or changed

The implementation establishes the intended private BigInt metadata direction,
the exact six-key public transfer projection, fixed configuration inventories,
and Docker-free negative-test scaffolding. It does not yet implement the whole
reviewed filesystem-object protocol. Fixed source ancestry is incomplete;
host-created regular files are reopened after their creating descriptor is
closed; fixed Docker copy operations do not revalidate the complete source and
ancestor chain immediately around every child; recovery releases retained-state
handles while an unresolved child is still active; and the focused tests do not
directly observe those acceptance boundaries.

These are implementation gaps against the already closed contract, not reasons
to revise M4-FS01 through M4-FS04. This review does not repair them and does not
approve the later activation-object contract task or any execution gate.

## Reviewed snapshot identity

The hashes below identify the implementation review input before this review,
its remediation prompt, and its minimal status updates were added. They are
static byte identities, not runtime filesystem identities.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of the exact 16 contract-allowlisted source/test/static paths | `ce372e269cda38b4423095e6b423bca57ce586a72906476854b314d2048069d5` |
| Exact filesystem-object identity contract | `76b7af58fa43279ada8d279681eaf69e3e534befd357545b31774289e588d7ae` |
| Residual-remediation contract re-review | `c07fa0b5fb5d8ebc95d8cb71a4b50b438fe2ca69b9f3367412fd64cfa429c7ab` |
| New private identity helper | `c3cc6664521df6349c98f997cd38b3b65162498f09869980e1cdeec52c1034d8` |
| Production control loader | `cee80951cea30beeedbe22fa0e619f5a04e3ab210d552f759a85a036ffeeeb1c` |
| Production offline-build host backend | `e84fa8b12b0153596ac347de1de907c213b025248e611d4d5a1e0628423931cb` |
| Production recovery host backend | `f61b1ae8cef39713df59820fc8b4718beca0321a7e12a934440dba16078e16af` |
| Production control host backend | `2eaf5f1927b537c6634e0f8f73e686784f8aed684d1501210e11ffa3dff2d897` |
| Executor | `4e893140d85351c45b1ac96afca89d95830fd3862c322a464731b7d087ebabde` |
| Types | `9bed7d4a65033d9b120666c6c2848f03e75cf2a7ca9d4f1fb6f9f59050d4d3c3` |
| Static verifier | `9a6dd4f34fb5a66fc2b8d273354a7f4e884f22c6abff237066af94382eb33eb1` |
| Ordinary `orchestrator-entry.ts` | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| Ordinary compiled `orchestrator-entry.js` | `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4` |

The implementation changes only paths allowed by the contract. Fifteen of the
16 paths differ from the tracked baseline or are new; the allowlisted
`test/static-safety.test.ts` remains unchanged and was included in the reviewed
manifest. No package script, package-root export, profile, fixture, ordinary
entry, activation object, or compiled output changed.

## Independently reproduced positive static boundary

### Private metadata and public projection

`filesystem-identity.ts` obtains BigInt `lstat` and descriptor stats, retains
device, inode, object kind, `uid`, `gid`, full mode, link count, BigInt size,
`mtimeNs`, and `ctimeNs`, rejects non-BigInt fields, and does not serialize that
record. Metadata-only files cannot be read through the helper. Regular files
require one link, exact special-bit-aware modes, bounded allocation before byte
reads, and descriptor/path snapshot equality.

The control backend, executor, and types now use exactly
`manifestBefore`, `manifestAfter`, `manifestIdentityStable`,
`controlEvidence`, `resultFiles`, and `scratchFiles`. The active production
backend/executor/type sources contain none of the retired six public
identity/type/symlink keys or an `m4-file-*` value. The old-key string remains
only in a rejection test and the static verifier's forbidden-marker list.

### Configuration, result roles, and ordinary reachability

The offline-build backend projects the fixed post-`doctor`, post-`build`, and
post-`inspect-image` inventories from the 15-row retained inventory plus the
fresh `config.json` row. Runtime-created files are captured as metadata-only,
use the fixed full modes and sizes including the sole `0644`/281-byte ref, and
are removed in the contract's deepest-first order only from a completely
validated checkpoint. Recovery captures the fixed snapshot and owner relation
without a content-read API in that backend.

The control backend requires one private container-owner relation for the three
container-created rows, `runOwner`/`0600` for fixed CLI copies, and
`runOwner`/`0600` for host records. It returns the stable boolean only after its
current source/copy checks and transfer cleanup. The ordinary source and
compiled entry retain the reviewed fail-closed bytes, and the package script
and package root were not changed.

These positive static facts do not close the findings below.

## Blocking findings

### M4-FSI01 — fixed source ancestry is not complete

Both `run-controls.ts` and `offline-build-host-backend.ts` capture the
repository root, `containers`, and `containers/profile-control`, then capture
the four staging source files directly. Three of those files are below
`containers/profile-control/fixture`, but that fixed intermediate directory is
never captured or retained. `HeldFilesystemObject.captureFile()` binds only the
final object; it does not walk or bind missing ancestors on behalf of callers.
The helper's lexical `assertFixedDescendant()` is unused and would not provide
the missing descriptor identity in any case.

Impact: replacing or renaming the fixed `fixture` ancestor is not covered by
the exact root-to-target held chain required through staging/build or pair
settlement. The generic parent-replacement helper test does not prove that the
two production source loaders retain this ancestor.

Required remediation: capture `containers/profile-control/fixture` with its
exact private snapshot and inventory in both production repository-input
leases, prove every fixed source has the complete root-to-target chain, and add
a production-loader-focused nested-ancestor replacement regression.

### M4-FSI02 — host-created files lose the creating descriptor

`createExclusiveFileIdentity()` opens with `O_CREAT | O_EXCL | O_NOFOLLOW`,
writes and syncs, but then closes that creating descriptor before calling
`captureFileIdentity()` to reopen the path. The contract instead requires
same-descriptor read-back and retention of the created descriptor through its
consumer's settlement. The offline-build backend bypasses even that helper for
every staged file and `docker-config/config.json`: it uses path-based
`writeFile(..., { flag: "wx" })` followed by a fresh capture. Those writes do
not perform the contract's same-creation-descriptor read-back, file sync, and
identity-bound parent sync.

Impact: staged bytes, credential-empty configuration, control manifests, and
canonical host records can be accepted from a reopened object rather than the
exclusively created object. This leaves the exact host-direct absent-to-owned
transition and descriptor lifetime unimplemented.

Required remediation: make the create-only helper retain and return the
original creating descriptor after exact write, sync, same-descriptor
read-back, descriptor/path comparison, and held-parent sync. Route every fresh
staging, config, manifest, and host-record write through that primitive without
a close/reopen gap, and cover replacement and sync/close failure behavior.

### M4-FSI03 — Docker copy operations lack immediate source-chain validation

The control transfer captures result/scratch sources and refreshes their
directories before the first copy. It then performs up to three distinct
`docker cp` children through `copyFixedContainerFile()`. That helper receives
only a state, source string, destination path, and expected bytes. Immediately
before each spawn it checks only that the destination is absent; it does not
revalidate the selected held source, its result/scratch parent, the complete
run ancestry, or the immutable repository/profile lease. Immediately after
each settled child it captures the destination, but does not revalidate that
copy's source and source ancestry. Later aggregate validation cannot establish
the contract's immediate-use boundary for the marker and scratch sources after
earlier copy children have run.

Impact: `manifestIdentityStable: true` can be reached without the required
pre/post identity observation around each path-only official-tool operation.
Byte equality after the fact is not a substitute for source object and ancestor
continuity.

Required remediation: bind each copy call to the exact held source and fixed
parent/ancestor expectations, validate the complete source/config/immutable
chain immediately before spawn and after that child's `close`, then capture the
destination and refresh its parent. Add drift between successive copy children
and post-close source/parent replacement regressions.

### M4-FSI04 — unknown recovery settlement releases retained handles early

When the recovery child does not emit `close` within the bounded grace period,
`activeChild` remains true but `run()` explicitly closes
`retainedState.lease` before returning `closeObserved: false`. The next
post-validation is correctly rejected while the child is active, but the
original retained identities are no longer held through that child's eventual
settlement or final disposition.

Impact: an unresolved fixed CLI can continue to mutate retained paths after the
backend releases the descriptors that the contract requires to remain held.
Rejecting the later validation does not restore the lost identity lifetime.

Required remediation: keep the retained-state lease alive for every
unknown-settlement outcome, prohibit post-use acceptance and cleanup, and close
only after an actually observed child `close` and required validation or an
explicit retention-only terminal owner that preserves the handles. Cover
synchronous spawn failure and no-`close` settlement without early lease
release.

### M4-FSI05 — focused acceptance coverage is incomplete

The new tests cover numeric-field rejection, one owner mismatch, symlink and
hard-link rejection, special-mode and replacement drift, one parent
replacement, metadata-only read rejection, result overwrite, partial/ref-mode/
size configuration drift, container/transfer mode drift, an old public key,
and a false stable boolean. They do not directly cover the production gaps
above. They also do not cover fixed CLI owner drift, container-owner
divergence, extra/premature configuration rows, unavailable no-follow/directory
capabilities, or an actual backend attempt to emit the stable boolean before
all post-use validation. The static verifier checks source substrings and
cannot replace those behavioral observations.

Impact: the contract's required focused negative-test list is not satisfied,
and the reported 236-test pass cannot establish untested semantics.

Required remediation: add the smallest deterministic repository-owned fake-
backend regressions for M4-FSI01 through M4-FSI04 and the remaining exact
owner/checkpoint/capability/early-stability cases. Do not weaken the contract to
fit current tests.

## Evidence classification and limitations

- The contract and contract reviews remain configuration/contract evidence.
- The reviewed source, verifier, and prior recorded `npm run m4:verify` result
  are static/unit evidence only. This session did not rerun that command.
- No Docker behavior, stable production-host identity, retained-state owner,
  runtime enforcement, profile-control `Observed`, adapter-route `Observed`,
  experiment-matrix `Observed`, or presentation claim is established.
- Historical runtime attempts, results, identities, and limitations remain
  immutable and are not reinterpreted by these implementation findings.
- The cooperative-host limitation remains explicit. Even after remediation,
  descriptor/path observations around a path-only CLI do not prove atomic race
  resistance against a same-UID swap-and-restore adversary, privileged mount
  changes, kernel/runtime compromise, or authenticity.

No activation path or bytes, Expected revision, run ID, result root, container
identity, command, execution gate, retry, or `Observed` value was selected or
changed.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, routed issue #45 contract/review history, M4 safety/evidence documents, and exact implementation paths | Read without Docker, retained-state access, ignored staging/result traversal, or external communication. |
| Exact 16-path diff/allowlist and per-file SHA-256 inspection | Reproduced the reviewed `ce372e26...` aggregate; 15 changed/new paths are within the allowlist and `static-safety.test.ts` is unchanged. |
| Exact source assertions for BigInt identity, owner/mode/time fields, metadata-only reads, configuration checkpoints, cleanup order, transfer keys, child `close`, and ordinary reachability | Reproduced the positive static boundary and M4-FSI01 through M4-FSI04 above. |
| Exact focused-test and static-verifier inspection | Reproduced current negative coverage and the missing M4-FSI05 cases. |
| Retired public-key scan over active backend/executor/type sources | No retired value remains in those active sources; occurrences are limited to rejection/static-forbidden assertions. |
| `git diff --check` before review edits | Exit 0. |

No test, typecheck, build, broad verification, staging rebuild, Docker/container
command, runtime-socket operation, result-root or retained-state read, external
network, credential, host-home access, Remote Git, publication, deployment, or
third-party communication was used. Standing authorization was not needed
because this review performed no approval-gated action.

## Exact blocked boundary and next task

The first implementation is not approved, so the distinct activation-object
contract task remains frozen. The only next task is the bounded Docker-free
implementation remediation in
[`prompts/m4-exact-filesystem-identity-implementation-remediation.md`](../../prompts/m4-exact-filesystem-identity-implementation-remediation.md).
It may change only the already approved 16 source/test/static paths plus minimal
status and fresh re-review records. It may not access Docker or retained state,
change activation or compiled output, choose a future runtime tuple or command,
or promote any evidence to `Observed`.

Next: remediate M4-FSI01 through M4-FSI05 under the exact existing 16-path
Docker-free allowlist, run `npm run m4:verify`, and prepare a fresh independent
read-only remediation re-review.
