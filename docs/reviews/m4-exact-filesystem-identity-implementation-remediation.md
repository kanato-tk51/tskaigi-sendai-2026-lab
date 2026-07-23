# M4 exact filesystem-object identity implementation remediation re-review

## Review target and decision

- Target: the bounded issue #45 M4-FSI01 through M4-FSI05 implementation
  remediation under the exact 16-path contract allowlist
- Review type: fresh independent Docker-free read-only implementation and
  focused-test re-review
- Decision: **APPROVED for the remediated first filesystem-identity
  implementation; only the separately named M4 distinct activation-object
  contract task may begin next**
- M4-FSI01 complete source ancestors: **CLOSED**
- M4-FSI02 creating descriptor continuity: **CLOSED**
- M4-FSI03 immediate fixed-copy checks: **CLOSED**
- M4-FSI04 unknown settlement: **CLOSED**
- M4-FSI05 focused coverage: **CLOSED**
- Contract findings M4-FS01 through M4-FS04: **remain CLOSED at contract
  scope**
- Blocking findings: none
- Non-blocking findings: none
- Docker, retained M4 state, activation, compiled output, runtime evidence,
  and `Observed`: not accessed, executed, or changed

The remediation implements the five missing acceptance boundaries without
changing the already reviewed public projection or broadening runtime
authority. Both production input paths now retain the missing fixture ancestor;
every host-created regular file keeps its exclusive creating descriptor; every
fixed copy child is bracketed by the complete held source chain; and an
unsettled recovery child leaves the retained-state lease with an explicit
terminal owner until an eventual `close`.

This approval is static/unit only. It does not choose or approve the distinct
activation object, compiled bytes, package reachability, an execution gate,
Docker access, retained-state access, a new runtime tuple, or any runtime or
`Observed` claim.

## Reviewed snapshot identity

The hashes below identify the review inputs before this review record and its
minimal status updates were added. They are static byte identities, not runtime
filesystem identities.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of the exact 16 allowlisted source/test/static paths | `d3c96ae97bc39a2a5001da63c4970a7a4a62358b65f579009c1bf46944c54b79` |
| Exact filesystem-object identity contract | `cfe051f7df9d51a24ebd5dc42cfa12dacf232d95b22134fea478d6783d083f0e` |
| Residual-remediation contract re-review | `c07fa0b5fb5d8ebc95d8cb71a4b50b438fe2ca69b9f3367412fd64cfa429c7ab` |
| Initial implementation review | `c8278555f5d211ee5ccf9ec6f537cad98d7e14986e75f9614e11ee134d6df582` |
| Implementation remediation prompt | `401f499289e16ac4ff178a56d757e476da63f4ece752db2263a063748dad185e` |
| This remediation re-review prompt | `9fe9b80adfd220353b6e5ec5960ad88bc33168a23d77f96d1e9b642cd1f51665` |
| Private identity helper | `1dad4648451daaf3681a1eb07a196f6c361513e75f63a0eff94ebe665a67abf1` |
| Production control loader | `25a0fd3b204594271970ddbd7d644ee2c12d5dbd31ad9a906150f293e3f4f550` |
| Production offline-build host backend | `124315dbe4b0429f03f332e9e874e6f146e1553d3af74cd15bac6c26c497832f` |
| Production recovery host backend | `0e75f3b2928c14ddfd99fa705ce635ef00801ea21bb19497ae48f34949d83177` |
| Production control host backend | `a37baa7dd651a1346c9f38b6116a38a7ddc0c4e33f83f4ceae3d804c6bfd646f` |
| Static verifier | `83d78065ef99c31a274eadb6c546991b8fcbb8459a0239565b656b9106d05431` |
| Ordinary `orchestrator-entry.ts` | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| Ordinary compiled `orchestrator-entry.js` | `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4` |
| Package-root `src/index.ts` | `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4` |

The implementation and verification changes are confined to the exact 16-path
allowlist. Fifteen paths are changed or new; the allowlisted
`test/static-safety.test.ts` remains unchanged and is included in the manifest.
Paths outside that boundary are only the issue #45 contract, prompt, review,
and minimal authoritative status records. No package script, package-root
export, profile, fixture, ordinary entry, activation source, or compiled output
is part of the implementation diff.

## Finding-by-finding closure analysis

### M4-FSI01 — complete source ancestors closed

`createFixedProductionControlDefinition()` now captures and retains the exact
repository root, `containers`, `containers/profile-control`, and
`containers/profile-control/fixture` directories before it captures the exact
image input and four staging sources. It separately retains `profiles`, each
profile directory, and both canonical profile files. All objects enter one
`FilesystemIdentityLease`, which is passed to the production backend and is
not closed until pair cleanup.

`readRepositoryStagingFiles()` establishes the same repository-to-fixture
chain for offline build and retains it through staging, all fixed command
settlements, and cleanup. The source file capture itself does not stand in for
the missing ancestor; both callers explicitly add the fixture directory and
its exact inventory.

The focused suite combines production-source assertions for both loaders with
a behavioral replacement test over a complete held nested chain. Renaming and
recreating the nested ancestor makes lease validation fail rather than
accepting equal replacement bytes.

### M4-FSI02 — creating descriptor continuity closed

`createExclusiveFileIdentity()` validates the held parent and absent basename,
opens once with `O_CREAT | O_EXCL | O_RDWR | O_NOFOLLOW`, performs the bounded
write and file sync, and passes that same handle to
`HeldFilesystemObject.adoptCreatedFile()`. The adopted object performs
same-descriptor read-back, exact size/bytes/SHA-256 and descriptor/path checks,
then syncs the already held parent directory. The original handle remains the
object's retained handle until the consumer settlement or identity-checked
cleanup closes it.

All four required production roles use this primitive: offline-build staged
files and credential-empty `config.json`, control manifests and control
`config.json`, and the three canonical host records. The reviewed production
paths contain no path-based `writeFile` fallback or close/reopen recapture.

Focused tests prove the creating-descriptor brand and held-object behavior
across path replacement, propagate file-sync failure while retaining the
created path, and report descriptor-close failure. The implementation preserves
the primary write/sync failure when best-effort descriptor close also fails.

### M4-FSI03 — immediate fixed-copy checks closed

Every copy call passes its exact held source object, result/scratch parent,
fixed parent inventory, container owner, expected bytes, destination, and
transfer-prefix inventory into `copyFixedContainerFile()`.
`validateSourceBoundary()` immediately checks the immutable repository/profile
lease, results/runs ancestry, fixed M4 root, run root, sealed input/manifest,
credential-empty Docker configuration, selected source parent, and selected
source object. It runs once directly before the fixed `docker cp` spawn and
again only after that child reports `close`.

The destination is required absent before spawn. After `close`, the successful
path captures the new destination with exact `runOwner`/`0600`/bytes and then
refreshes the transfer-parent checkpoint. The unsuccessful path proves exact
absence or captures and retains a conforming produced destination before
failing closed. Each later copy repeats the whole boundary; aggregate byte
equality is additional evidence, not a substitute.

The production-backend regression replaces the first copy's held source parent
after that child's `close`. The pair becomes `TRANSFER_FAILURE` with no
completion, covering post-close drift and the boundary before the next copy can
project stability.

### M4-FSI04 — unknown settlement closed

A successfully spawned recovery child sets `activeChild` before any process
event. When bounded force settlement expires without `close`, the returned
result records `closeObserved: false`, `unknownSettlement` remains set, and the
retained lease is neither validated as post-use nor closed. Subsequent
`validateRetainedState()` calls are rejected, so the path cannot authorize
evidence acceptance, content reads, cleanup, or retry.

An eventual late `close` transfers ownership to the stored
`terminalLeaseSettlement` promise, which validates and then closes the retained
lease. The already returned command failure remains primary regardless of
terminal validation/close outcome. A synchronous spawn throw never establishes
an active child; normal result consumption then performs the second retained
validation and closes the lease. Ordinary settled success/failure follows the
same second-validation boundary, while validation or descriptor-close failure
cannot create a complete result.

The focused fake-child test proves that unknown settlement performs no early
close, rejects post-validation, and closes exactly once after late `close`.
The synchronous-spawn regression proves the distinct normal-consumption path.

### M4-FSI05 — focused coverage closed

The deterministic Docker-free suite and static verifier cover the complete
remediation boundary:

- nested held-ancestor replacement plus explicit fixture capture in both
  production loaders;
- original creating-descriptor continuity, same-descriptor replacement
  detection, sync failure, and close failure;
- per-copy source/parent drift after child `close` and before a later stable
  projection;
- no-`close` recovery lease retention, eventual late `close`, and synchronous
  spawn failure;
- fixed runtime-CLI owner drift and container-owner divergence;
- partial, extra, premature, wrong-mode, and wrong-size Docker-configuration
  checkpoints, including the sole `0644` row;
- unavailable no-follow and directory-open capabilities;
- actual control-backend rejection before completion/stability after post-copy
  drift, plus executor rejection of false stability and old/extra keys; and
- the earlier numeric identity, ownership, symlink, hardlink, special-bit,
  same-size replacement, in-place mutation, metadata-only non-read,
  overwrite, transfer-mode, container-mode, cleanup-primary, and import-safety
  cases.

The static verifier additionally pins the two production fixture-ancestor
markers, the exclusive-create/write/sync/adopt/parent-sync sequence, two
immediate copy-boundary calls, unknown-settlement terminal ownership, exact
configuration checkpoints, absence of the offline-build path-write fallback,
and removal of the retired public keys.

## Contract and public-boundary preservation

M4-FS01 through M4-FS04 remain closed. The shared helper keeps device, inode,
owner, full mode, link count, BigInt size and nanosecond times private; active
production code does not serialize those values. Runtime-created Docker
configuration remains metadata-only and exposes no content-read API in the
recovery backend.

The public transfer record still has exactly the ordered keys
`manifestBefore`, `manifestAfter`, `manifestIdentityStable`, `controlEvidence`,
`resultFiles`, and `scratchFiles`. The stable field is literal `true` only after
the private post-copy and cleanup boundary. No retired identity/type/symlink
key or `m4-file-*` value remains in the active backend, executor, or type
contract.

The implementation does not overstate the cooperative-host guarantee. Held
descriptors and pre/immediate/post checks detect stable-boundary drift; they do
not make a path-only external CLI descriptor-relative or defeat an out-of-scope
same-UID swap-and-restore race, privileged mount change, kernel/runtime
compromise, or authenticity attack.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, active frozen-research plan, exact contract/review/remediation packet, and routed M4 safety/evidence documents | Read without Docker, retained-state access, ignored result-root traversal, or external communication. |
| Exact `git status`, `git diff --name-status`, `git diff --numstat`, allowlist, per-file SHA-256, and sorted 16-path manifest | Reproduced the `d3c96ae9...` aggregate; all implementation/verification changes are inside the allowlist and `static-safety.test.ts` is unchanged. |
| Exact source/test/static inspection for ancestors, creating descriptors, copy boundaries, settlement, ownership, checkpoints, capabilities, projection keys, and ordinary reachability | Reproduced M4-FSI01 through M4-FSI05 closure and the preserved contract/public boundaries above. |
| `npm run m4:verify` | Exit 0; typecheck passed, the Docker-free static verifier reported no runtime-enforcement claim, and 22 test files / all 247 tests passed. |
| `git diff --check` before review edits | Exit 0. |
| Focused Prettier check over this review and the three status records | Exit 0; all four files matched repository formatting. |
| `git diff --check` after review/status edits | Exit 0. |

No `m4:doctor`, `m4:build`, `m4:recovery:offline-build`,
`m4:run:controls`, production executor, Docker/container command,
runtime-socket operation, retained-state/result-root inspection, lifecycle
fixture, staging rebuild, external network, credential, host-home access,
Remote Git, publication, deployment, or third-party communication was used.
Standing authorization was not needed because this review performed no
approval-gated runtime action.

## Evidence classification and remaining limitations

- The contract and contract reviews remain configuration/contract evidence.
- The reviewed implementation, static verifier, and passing tests are
  static/unit evidence only.
- No production-host filesystem identity, Docker behavior, retained-state
  owner, runtime enforcement, profile-control `Observed`, adapter-route
  `Observed`, experiment-matrix `Observed`, or presentation claim is
  established.
- Historical attempts, results, identities, evidence classes, and limitations
  remain immutable and are not reinterpreted by this approval.
- The distinct activation source/compiled logical paths, construction bytes,
  reachability, and tests are intentionally undecided. No Expected revision,
  run ID, result root, container identity, command, execution gate, retry, or
  `Observed` value was selected.

## Decision and next task

M4-FSI01 through M4-FSI05 are closed with no new finding. The first
filesystem-identity implementation is approved at the bounded Docker-free
static/unit boundary only.

Next: define the separately named M4 distinct activation-object contract,
including exact source/compiled logical paths, construction bytes,
non-export/non-script reachability assertions, identity checks, focused tests,
and a fresh independent contract-review prompt; do not implement it or define
an execution gate in that task.
