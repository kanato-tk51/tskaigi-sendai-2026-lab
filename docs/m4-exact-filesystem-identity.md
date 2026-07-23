# M4 exact filesystem-object identity contract

Status: **bounded Docker-free filesystem and activation implementations
independently approved; exact occurrence exhausted and accepted only as
Inconclusive; issue #45 closed at that bounded classification**

This document is the proposed contract for frozen-research issue #45. It does
not change any historical run, authorize an implementation or runtime command,
or establish profile-control or route `Observed` evidence. The completed M4
build, recovery, and control attempts keep their recorded identities and
results unchanged.

## Objective and boundary

The first M4 identity implementation must bind every security-relevant
filesystem object from reviewed repository input through run-owned
materialization and sanitized result publication. Its binding covers these
roles:

1. fixed repository source and exact-input files;
2. run-owned staging copies and their parent directories;
3. permissive and constrained canonical profile files;
4. run-owned Docker configuration and fixed retained recovery state; and
5. run-owned container, transfer, and host-result destinations.

The distinct activation object is deliberately not part of that first
implementation. After the first implementation and its fresh independent
review, one separately named **M4 distinct activation-object contract task**
must choose the source and compiled logical paths, construction bytes,
non-export/non-script reachability assertions, identity checks, and focused
tests. Until that later contract and its own review are complete, the ordinary
fail-closed `orchestrator-entry.ts` and compiled output are the only activation
objects and must remain byte-for-byte unchanged. This contract does not choose
a future activation command, run tuple, or output hash.

The contract detects unsupported identity reporting, aliases, replacement,
in-place byte drift, metadata drift, and unexpected directory entries. It does
not turn configuration intent or static/unit evidence into runtime evidence.
No result becomes complete until the relevant process has settled and every
post-use identity check succeeds.

The supported threat boundary remains the repository's existing cooperative
host boundary. The kernel and filesystem implementation are trusted, and an
untrusted concurrent host process with the same ability to mutate repository or
run-owned paths is out of scope. In particular, a path-only external CLI cannot
be made atomically descriptor-relative by TypeScript code. This contract keeps
descriptors open and detects pre/post drift, but it does not claim to defeat a
same-UID adversary that swaps and restores a path entirely between observations.
If the cooperative-host condition or stable filesystem identity cannot be
established, execution is unsupported and must stop before the first external
command.

## Exact private identity

Every filesystem observation used for acceptance must use Node.js BigInt stats.
Converting a device, inode, link count, mode, size, or nanosecond timestamp to a
JavaScript `number` is forbidden.

The private identity record is:

```text
object identity = device + inode + object type
ownership snapshot = uid + gid
metadata snapshot = full permission/special mode + link count + size
                    + modification time ns + status-change time ns
content identity = byte length + SHA-256, when content reads are allowed
```

- `device`, `inode`, `uid`, `gid`, `mode`, `nlink`, `size`, `mtimeNs`, and
  `ctimeNs` are non-negative `bigint` values obtained from
  `lstat(..., { bigint: true })` or a held handle's
  `stat({ bigint: true })`.
- Object type comes from the same stat record. A regular file, directory,
  symbolic link, socket, FIFO, block device, and character device are never
  interchangeable even if other fields happen to match.
- Full mode comparison includes setuid, setgid, and sticky bits. Permission
  comparison may not mask to only the low nine bits.
- Every accepted regular file has `nlink === 1n`. Directory link counts are
  captured and checked at stable boundaries but may make only the explicitly
  expected transition when an approved child directory is created or removed.
- When content reads are allowed, regular-file `size` must match the bytes
  actually read. Size is converted to an allocation length only after a
  role-specific bound and `Number.MAX_SAFE_INTEGER` have both been checked.
  An explicitly content-non-read configuration role instead compares its
  BigInt size only with the fixed role size below and has no content-identity
  field; its size is never converted for allocation or used to read bytes.
- SHA-256 is necessary for byte lineage but never substitutes for device/inode,
  type, mode, link count, size, or path binding.
- Different logical objects may not share one device/inode pair. Source and
  staging are deliberately distinct objects connected by equal bounded bytes,
  not by inode equality.

Raw device/inode values, ownership values, nanosecond timestamps, host absolute
paths, and hashes derived only from device/inode must stay in private memory.
They must not appear in public results, events, stdout/stderr, Markdown records,
or error messages. A public projection may state only a logical role, approved
byte hash/length, and a boolean relation such as `identityStable: true` after
the private comparison has succeeded. The existing device/inode-derived
`m4-file-*` projection is not an acceptable implementation of this contract.

## Private ownership and full-mode relations

Ownership is security-relevant and is never inferred from permission bits,
`ctimeNs`, container configuration, or a device/inode value. Every accepted
object has an exact private `uid`/`gid` pair and one of these role relations:

- An existing repository source, exact-input, profile, or ancestor keeps the
  exact ownership pair captured at preflight. Different repository objects do
  not have to share one owner, but no object's pair may change through its last
  consumer's settlement.
- Each exclusively created run root establishes that run's private
  `runOwner = (uid, gid)`. Every host-direct child directory, staged file,
  manifest, Docker configuration, transfer destination, and canonical host
  record in that run must have exactly `runOwner` after creation and at every
  later observation.
- Every fixed runtime-CLI-created Docker configuration entry must also have
  exactly `runOwner` at its first observation after the creating child emits
  `close`, even though the host did not create that entry directly. The fixed
  historical recovery root re-establishes the same private relation as
  `recoveryRunOwner` from the pre-existing run-root pair and requires every
  retained descendant to equal it. Neither relation is inferred from the
  runtime process user or published as a numeric value.
- After the fixed container start child has emitted `close`, the first ordered
  container-created result object establishes a private `containerOwner` only
  if every expected container-created result and scratch object has the same
  `uid`/`gid`. Fixed host inspection must still prove container user
  `10001:10001`. The host-visible `containerOwner` may equal or differ from
  `runOwner`; the contract does not infer a host numeric mapping from the
  in-container user. Every container-created object must retain that exact pair
  through all copy commands and post-use checks.
- A fixed Docker `cp` destination is accepted only when the settled CLI creates
  it with `runOwner`, full mode `0600`, and bytes equal to its source. The
  command does not use archive/ownership-preservation options, and host code
  does not `chown`, `chmod`, copy, or otherwise normalize a nonconforming CLI
  result. A different owner or mode is terminal transfer Inconclusive.

No accepted operation calls `chown` or `chgrp`, and no ownership transition of
an existing object is permitted. Creation is the only absent-to-owned
transition. Mode transitions are equally closed:

| Role | Exact full mode transition |
|---|---|
| Existing repository source, exact input, profiles, and ancestors | Capture the complete preflight mode, including special bits, and require it unchanged. |
| Run root, private host/config/transfer directories, and staging directories | Absent to host-direct exclusive creation at `0700`; no later mode change. |
| Staged regular files, Docker `config.json`, and canonical host records | Absent to host-direct exclusive creation at `0600`; no later mode change. |
| Fixed runtime-CLI-created Docker configuration directories | Absent during the exact settled CLI creation window, then `0700`; no later mode change. |
| Fixed runtime-CLI-created Docker configuration regular files | Absent during the exact settled CLI creation window, then `0600`, except the one fixed buildx ref file at `0644`; no later mode change. |
| Control input directory | Host-direct `0700` creation, then one same-object `0555` transition only after the `0444` manifest is synced; ownership and identity stay fixed. |
| Control result and scratch directories | Absent to host-direct exclusive creation at `0733`; no later mode change. |
| Container-created and CLI-materialized result/scratch regular files | Absent to creation at `0600`; no later mode or ownership change. |

An unsupported `uid`/`gid` observation, an ownership mismatch, any special-bit
addition, or any mode transition not listed above is identity drift and maps to
the relevant existing Inconclusive phase.

## Path and ancestor binding

All paths are repository constants derived from a canonical repository root or
from a separately reviewed fixed run ID. No caller supplies a root, relative
path, basename, profile path, activation path, or result path.

For every protected object, the implementation must:

1. reject absolute injection, empty components, `.`, `..`, NUL, and platform
   separator aliases;
2. open the repository or run root as a non-symlink directory and retain its
   descriptor;
3. walk and capture every fixed ancestor between that root and the target;
4. reject a symlink in any ancestor or at the final name;
5. require every ancestor to remain the same directory object at the pre-use,
   immediate-use, and post-use boundaries; and
6. compare the exact sorted entry inventory at each stable boundary.

`realpath` is a consistency check only. It is not an identity and does not
replace descriptor/path comparison. Existing objects are opened with
`O_NOFOLLOW`; directories additionally use `O_DIRECTORY`. Failure or absence of
those semantics is `M4_IDENTITY_UNSUPPORTED`, not a reason to fall back to a
path-only check.

An absent destination has no file identity. Its preflight binding is the held
parent-directory identity, exact parent inventory, and fixed absent basename.
It becomes an object only after exclusive creation and successful descriptor
validation. A destination must never be obtained by truncating, appending to,
or replacing a pre-existing file.

## Preflight, use, and post-use protocol

### Preflight

- Complete all path, ancestor, alias, type, mode, size, and inventory checks
  before creating run state or spawning a child.
- Open each readable regular file with `O_RDONLY | O_NOFOLLOW`. Compare handle
  stats with path `lstat`, read through the handle under the role's byte bound,
  hash those bytes, then compare handle stats again.
- Retain the root, parent, and regular-file handles needed to prove the later
  use. Closing and reopening by path creates a new observation and cannot
  inherit the earlier approval.
- Reject two logical roles that resolve to the same device/inode, including
  hard-link aliases. Reject `nlink !== 1n` even when no second path is found.
- Take two consecutive BigInt descriptor/path observations during capability
  preflight. If the filesystem cannot return stable
  type/device/inode/uid/gid/mode/link metadata and nanosecond timestamps, return
  `M4_IDENTITY_UNSUPPORTED` before any mutation or external command.

### Use

- Read consumers use the already held descriptor or a private copy made from
  it. They do not reopen the reviewed path.
- A host direct write uses a fixed absent name, exclusive creation, exact mode,
  bounded write, file sync, same-descriptor read-back, size/SHA-256 comparison,
  and parent-directory sync. The created descriptor remains open through its
  consumer's settlement.
- A path-only official tool operation receives only the already reviewed fixed
  path. Immediately before spawn, the implementation revalidates every held
  descriptor against its exact path and parent chain. No host-side mutation of
  that chain is permitted while the child is active.
- A child is settled only after its required `close` event. Timeout, output
  failure, signal request, or an `exit` event alone does not authorize post-use
  acceptance or evidence reads.

### Post-use

- After child settlement, compare each held handle with a fresh path `lstat`
  and revalidate all ancestors and exact inventories.
- Immutable files must retain object identity, full mode, link count, size,
  timestamps, and SHA-256. Directories must retain identity and the exact
  inventory/metadata transition permitted for that phase.
- A path replacement, rename away/back, unexpected hard link, in-place content
  write, chmod, special-bit change, extra entry, missing entry, or parent swap
  is terminal identity drift. The implementation does not repair it, reinterpret
  it, or retry the operation.
- Held descriptors prevent the original open object from being silently
  replaced or its inode reused while held. Parent `ctimeNs`/`mtimeNs` and exact
  inventories make rename activity visible at stable boundaries. The
  cooperative-host limitation above remains explicit for a complete
  swap-and-restore between observations by an out-of-scope host adversary.

An immutable source/profile/activation parent must keep its entire metadata
snapshot unchanged. A run-owned directory that an approved operation is meant
to populate may change size, link count, `mtimeNs`, and `ctimeNs` only during
that operation. The implementation does not predict those resulting numeric
values; after settlement it captures the new exact snapshot, requires two
consecutive stable observations plus the fixed inventory, and uses that as the
post-operation checkpoint. No other operation may share that mutation window.

An identity failure before a command maps to the existing staging or immutable
input Inconclusive class. A failure after an operation begins maps to the
existing command, transfer, evidence, or cleanup Inconclusive class for that
phase. Internal identity error detail is not serialized. No new identity error
may be reported as `complete` or as an attempted capability outcome.

## Role-specific contract

| Role | Required identity and transition |
|---|---|
| Repository source | The gate enumerates every source file explicitly; globs and recursive discovery are not inputs. Each file is a unique non-symlink regular file with one link, exact captured full mode and bounded size, and the reviewed SHA-256. Reads use held descriptors. Source files and ancestors remain unchanged through staging and the external consumer's settlement. |
| Staging | The run and staging roots are exclusively created under the fixed repository-owned M4 root. Every staged file is a new one-link regular file created with mode `0600`, never an alias of a source or sibling. The exact ordered names, bytes, sizes, per-file hashes, and aggregate digest are checked after write and immediately before and after the tool consumes the context. Staging directories use mode `0700`. |
| Profiles | The permissive and constrained files are distinct one-link regular files. Each is read once through a held descriptor, parsed as fatal UTF-8 canonical bytes, reserialized byte-for-byte, and bound to the accepted image digest and fresh run ID. Both identities and bytes remain stable until the complete pair has settled. Profile configuration remains Expected evidence. |
| Deferred activation | The first implementation makes no activation source or compiled object. The ordinary fail-closed source and compiled output remain unchanged. Only the later named M4 distinct activation-object contract task may choose distinct paths and construction bytes; it requires a fresh review before implementation and is not an acceptance item for the first implementation. |
| Docker configuration and recovery state | A fresh offline-build run creates only the fixed host rows and accepts runtime-CLI-created rows only at the exact settled checkpoints below. The fixed historical recovery root starts with the exact retained snapshot below, performs metadata/identity validation without reading runtime-created file contents, and retains that snapshot on every outcome. |
| Result destination | Each fresh run root and every input/host/container-result/scratch/transfer child is exclusively created and identity-bound before container creation. Fixed result basenames are absent at preflight. Container writes, official-tool transfers, and host records create distinct one-link objects and never overwrite one another. A result file is read only after its producer and transfer have settled, then must pass exact ownership/type/mode/size/canonical-byte/SHA-256 and descriptor/path/post-use checks. |

### Exhaustive Docker configuration and recovery-state contract

The rules in this section are future acceptance rules for the first Docker-free
implementation. They do not claim that the historical build recorded each
intermediate inventory. The existing fixed `doctor`, `build`, and
`inspect-image` command objects and their order are inputs; this contract does
not select another command, run ID, tag, activation object, or execution gate.

For a fresh offline-build run, the run root, `docker-config`, and
`docker-config/config.json` are host-direct exclusive creations. Immediately
before `doctor`, `docker-config` contains exactly `config.json` and every
runtime-created basename below is absent. Only these complete checkpoints are
accepted:

| Checkpoint | Exact accepted `docker-config` inventory |
|---|---|
| Before `doctor` spawn | `config.json` only. |
| After the exact `doctor` child emits `close` | `config.json`, `.token_seed`, and `.token_seed.lock`; `buildx` is absent. |
| After the exact `build` child emits `close` | `config.json`, `.token_seed`, `.token_seed.lock`, and the complete fixed `buildx` tree in the role table below. |
| After the exact `inspect-image` child emits `close` | Metadata-for-metadata and identity-for-identity the same accepted state as after `build`, with `config.json` bytes unchanged; `inspect-image` creates, removes, or changes no configuration entry, and opaque runtime-created contents remain unread. |

A checkpoint is evaluated after `close` even when the command output or exit
status is otherwise unsuccessful. A missing, extra, partial, prematurely
visible, removed, replaced, or metadata-drifted entry is not discovered as a
new compatible role: it is terminal state/command Inconclusive and the unsafe
state is retained. If a successfully spawned child never emits `close`, no
post-child inventory is accepted and no cleanup is attempted. A synchronous
spawn failure before a child exists may clean only the already validated
host-created pre-`doctor` checkpoint.

Every row uses one-link regular files or held non-symlink directories. All
permission values below are complete permission/special-bit values. `runOwner`
applies to a fresh run; `recoveryRunOwner` applies to the fixed pre-existing
recovery root. Those private pairs must be equal across every row in their
respective run.

| Logical path under the run root | Producer and first accepted boundary | Exact type, full mode, and owner | Content and inventory rule |
|---|---|---|---|
| `<run-root>` | Host-direct exclusive creation before offline build; pre-existing fixed root at recovery preflight | Directory, `0700`, `runOwner` / `recoveryRunOwner` | Fresh build has the exact staging/config children for its phase. Recovery has only `docker-config`. |
| `docker-config` | Host-direct exclusive creation before `doctor`; pre-existing at recovery preflight | Directory, `0700`, same run-owner relation | Fresh pre-`doctor` inventory is `config.json`; recovery inventory is `.token_seed`, `.token_seed.lock`, `buildx`. |
| `docker-config/config.json` | Host-direct exclusive creation and sync before `doctor`; absent throughout recovery | One-link regular file, `0600`, `runOwner` | Exactly `{"auths":{}}\n`, 13 bytes, SHA-256 `81bcbd3f950f2b31b87a64e8eca0de39db52feb0060d2bc631d7d794696604eb`; held and read through its descriptor. |
| `docker-config/.token_seed` | Fixed runtime CLI; first accepted after `doctor` `close` | One-link regular file, `0600`, same run-owner relation | Exactly 74 bytes of opaque configuration state; content read/hash/copy/serialization is forbidden. |
| `docker-config/.token_seed.lock` | Fixed runtime CLI; first accepted after `doctor` `close` | One-link regular file, `0600`, same run-owner relation | Exactly 0 bytes; content read/hash/copy/serialization is forbidden. |
| `docker-config/buildx` | Fixed runtime CLI; first accepted after `build` `close` | Directory, `0700`, same run-owner relation | Exact children `.buildNodeID`, `.lock`, `activity`, `defaults`, `instances`, `refs`. |
| `docker-config/buildx/.buildNodeID` | Fixed runtime CLI; first accepted after `build` `close` | One-link regular file, `0600`, same run-owner relation | Exactly 16 bytes; content read/hash/copy/serialization is forbidden. |
| `docker-config/buildx/.lock` | Fixed runtime CLI; first accepted after `build` `close` | One-link regular file, `0600`, same run-owner relation | Exactly 0 bytes; content read/hash/copy/serialization is forbidden. |
| `docker-config/buildx/activity` | Fixed runtime CLI; first accepted after `build` `close` | Directory, `0700`, same run-owner relation | Exact child `default`. |
| `docker-config/buildx/activity/default` | Fixed runtime CLI; first accepted after `build` `close` | One-link regular file, `0600`, same run-owner relation | Exactly 20 bytes; content read/hash/copy/serialization is forbidden. |
| `docker-config/buildx/defaults` | Fixed runtime CLI; first accepted after `build` `close` | Empty directory, `0700`, same run-owner relation | Exact empty inventory. |
| `docker-config/buildx/instances` | Fixed runtime CLI; first accepted after `build` `close` | Empty directory, `0700`, same run-owner relation | Exact empty inventory. |
| `docker-config/buildx/refs` | Fixed runtime CLI; first accepted after `build` `close` | Directory, `0700`, same run-owner relation | Exact child `default`. |
| `docker-config/buildx/refs/default` | Fixed runtime CLI; first accepted after `build` `close` | Directory, `0700`, same run-owner relation | Exact child `default`. |
| `docker-config/buildx/refs/default/default` | Fixed runtime CLI; first accepted after `build` `close` | Directory, `0700`, same run-owner relation | Exact child `tdjwufr4i7552r09bibchdkva`. |
| `docker-config/buildx/refs/default/default/tdjwufr4i7552r09bibchdkva` | Fixed runtime CLI; first accepted after `build` `close` | One-link regular file, `0644`, same run-owner relation | Exactly 281 bytes; content read/hash/copy/serialization is forbidden. This is the only accepted `0644` regular-file role. |

The CLI-created rows have no content-identity field because their contents are
outside the approved read boundary and are not evidence. Their bounded BigInt
size remains private metadata. After each creating child emits `close`, the
implementation opens every new regular file with `O_RDONLY | O_NOFOLLOW`
without reading it and every directory with `O_RDONLY | O_DIRECTORY |
O_NOFOLLOW`; it compares descriptor/path BigInt identity, full mode, owner,
link count, size, ancestor identity, and exact inventory twice, then keeps the
handles through every later CLI child's `close` and final disposition. Existing
rows are revalidated immediately before each later spawn and again after its
`close`. No host `chmod`, `chown`, content rewrite, normalization, or inferred
compatibility is permitted.

For a fresh run, cleanup may act only on the exact row set belonging to the
last completely validated checkpoint. It revalidates each held identity and
removes it in this exact deepest-first order when present:

```text
docker-config/buildx/refs/default/default/tdjwufr4i7552r09bibchdkva
docker-config/buildx/refs/default/default
docker-config/buildx/refs/default
docker-config/buildx/refs
docker-config/buildx/instances
docker-config/buildx/defaults
docker-config/buildx/activity/default
docker-config/buildx/activity
docker-config/buildx/.lock
docker-config/buildx/.buildNodeID
docker-config/buildx
docker-config/.token_seed.lock
docker-config/.token_seed
docker-config/config.json
docker-config
```

Each file unlink and empty-directory removal is preceded by the exact
handle/path/owner/full-mode/inventory match; recursive deletion and discovery
of additional names are forbidden. The separately specified staging cleanup
then runs, and the run root is removed only when its held identity and exact
empty inventory still match. A mismatch, removal failure, descriptor-close
failure, or unsettled child preserves the primary failure, stops deletion,
retains the remaining state, and is Inconclusive.

The fixed historical recovery snapshot has `config.json` absent and every
other table row present. Recovery captures all private handles before its one
fixed inspect child, revalidates them immediately before spawn and after that
child's `close`, and keeps `ownedStateDisposition: "retained"` on every
outcome. It never invokes the fresh-build cleanup sequence. Thus the historical
retained state and recovery result remain unchanged while the same exact
owner/mode/settlement rules cover both production paths.

### Exhaustive result and scratch object table

Every parent named below is already held and identity-bound. At run preflight,
`container-result`, `scratch`, `transfer`, and `host` are empty; immediately
before each creation the exact basename is absent and the parent inventory is
the exact prefix produced by earlier rows. No two rows share an inode. The
`containerOwner` and `runOwner` relations are the private relations defined
above, not public numeric values.

| Logical path | Producer and origin | Exact mode and owner | Bytes and hash | Descriptor lifetime and settlement | Post-use disposition |
|---|---|---|---|---|---|
| `container-result/control-evidence.json` | Fixed in-container control, `container-direct-filesystem` | One-link regular file, `0600`, `containerOwner` | Fatal UTF-8 canonical `lab-profile-control-evidence/v1`, one final LF, at most 65,536 bytes; exact length/SHA-256 must equal the settled CLI copy and the completion input. | Open only after the fixed start child emits `close`; retain the descriptor through all result-copy children, source/copy byte comparison, and final source/path/ancestor validation. | Close after post-use validation; retain the immutable source file in the run root. |
| `container-result/result-marker.txt` | Fixed in-container control, `container-direct-filesystem` | One-link regular file, `0600`, `containerOwner` | Exactly `m4-result-channel-v1\n` (21 bytes) and its SHA-256. | Same start-child `close` prerequisite and held-source lifetime as control evidence. | Close after post-use validation; retain the immutable source file. |
| `scratch/scratch-marker.txt` | Permissive fixed in-container control only, `container-direct-filesystem`; constrained keeps the basename absent and the directory empty. | One-link regular file, `0600`, `containerOwner` | Exactly `m4-fixed-marker-v1\n` (19 bytes) and its SHA-256. | Same start-child `close` prerequisite and held-source lifetime as control evidence. | Close after post-use validation; retain only for permissive. |
| `transfer/control-evidence.json` | Settled fixed Docker `cp`, `official-tool-api-materialization` | One-link regular file, `0600`, `runOwner`; no host normalization | Exact byte length/SHA-256 equality with `container-result/control-evidence.json`; the same canonical and 65,536-byte bounds apply. | Open after that exact copy child emits `close`; retain through bounded read, source/copy equality, transfer path/ancestor validation, and identity-checked cleanup. | Unlink only by the held expected identity after validation; never retain as evidence. |
| `transfer/result-marker.txt` | Settled fixed Docker `cp`, `official-tool-api-materialization` | One-link regular file, `0600`, `runOwner`; no host normalization | Exact 21-byte/source-SHA equality. | Same copy-child `close` and held-copy lifetime as the evidence transfer. | Identity-checked unlink after validation. |
| `transfer/scratch-marker.txt` | Permissive settled fixed Docker `cp` only, `official-tool-api-materialization`; constrained keeps it absent. | One-link regular file, `0600`, `runOwner`; no host normalization | Exact 19-byte/source-SHA equality. | Same copy-child `close` and held-copy lifetime as the evidence transfer. | Identity-checked unlink after validation. |
| `host/host-inspection.json` | Host canonical encoder after successful inspection and transfer, `host-direct-filesystem` | Exclusive one-link regular file, `0600`, `runOwner` | Exact validated `lab-profile-host-inspection/v1` canonical JSON plus one LF, at most 65,536 bytes; same-descriptor read-back and SHA-256. | Exclusive descriptor remains open through write, file sync, read-back, parent sync, and post-write path/ancestor validation; no child settlement is substituted for these host checks. | Close after validation; retain immutable through pair settlement. |
| `host/completion.json` | Host canonical encoder after successful inspection, evidence parsing, and comparison, `host-direct-filesystem` | Exclusive one-link regular file, `0600`, `runOwner` | Exact validated `lab-profile-control-completion/v1` canonical JSON plus one LF, at most 65,536 bytes; same-descriptor read-back and SHA-256. | Same host-direct descriptor/write/sync/read-back boundary. It is not created before every required producer and copy child has emitted `close`. | Close after validation; retain immutable through pair settlement. |
| `host/comparison.json` | Host canonical encoder after successful comparison, `host-direct-filesystem` | Exclusive one-link regular file, `0600`, `runOwner` | Exact validated comparison keys and values as canonical JSON plus one LF, at most 65,536 bytes; same-descriptor read-back and SHA-256. | Same host-direct descriptor/write/sync/read-back boundary; created only after the complete transfer input has passed. | Close after validation; retain immutable through pair settlement. |

Docker `cp` is the only CLI materializer in this table. The first
implementation accepts neither metadata-preserving archive mode nor a host
copy/chmod/chown normalization branch. If the fixed CLI cannot produce the
listed destination owner, full mode, and exact bytes, the platform/run is
Inconclusive. The container source objects, retained host records, and exact
inventories are revalidated once more after the pair and cleanup processes have
settled.

The existing `0555` input, `0733` container-result/scratch, and `0700` private
host/config/transfer directory modes are retained only at their exact reviewed
roles and ownership relations. The enclosing run root remains `0700`, so the
writable container destinations do not broaden access to sibling or repository
paths. All modes include special-bit comparison.

## Mutation provenance and evidence classes

Identity continuity does not determine who caused a change. The implementation
must preserve these separate mutation origins:

- `host-direct-filesystem`: repository orchestrator exclusive create, write,
  chmod, sync, or unlink of a run-owned object;
- `container-direct-filesystem`: fixed container code writes a mounted
  result/scratch object;
- `official-tool-api-materialization`: the fixed runtime CLI creates a build
  output, container, inspection projection, or copied transfer object; and
- route-specific official tool APIs, such as a Vite transform or emitted asset,
  which remain adapter evidence and are not inferred from host files.

Copying or sealing tool-produced bytes is a later host direct mutation and does
not retroactively turn it into the tool operation. Equal hashes across two
origins prove byte equality only. They do not prove API invocation, intended
semantics, or common filesystem identity.

Public M4 evidence may include fixed logical object roles, mutation origin,
approved size/hash, exact expected inventory, and stable-identity booleans. It
must not expose private filesystem metadata. Configuration/static/unit evidence,
host inspection, container evidence, and adapter-route evidence retain their
existing independent acceptance boundaries.

### Exact public control-transfer projection

The first implementation replaces the current device/inode-derived token shape
with exactly this ordered transfer record and no other keys:

```text
manifestBefore
manifestAfter
manifestIdentityStable
controlEvidence
resultFiles
scratchFiles
```

- `manifestBefore` and `manifestAfter` are immutable byte copies of the same
  exact canonical control manifest and must equal each other and the reviewed
  manifest bytes.
- `manifestIdentityStable` is the literal boolean `true`. The backend may set it
  only after the private handle/path/ancestor/ownership/full-mode/content checks
  have succeeded after every relevant start/copy child emitted `close` and the
  transfer cleanup reached its validated checkpoint. `false` or unknown is not
  a serializable partial result; it is `IMMUTABLE_INPUT_CHANGED` or the relevant
  transfer/cleanup Inconclusive result.
- `controlEvidence` is the immutable canonical byte copy validated against the
  table above.
- `resultFiles` is exactly
  `["control-evidence.json", "result-marker.txt"]`.
- `scratchFiles` is exactly `["scratch-marker.txt"]` for permissive and `[]`
  for constrained.

The old `manifestIdentityBefore`, `manifestIdentityAfter`,
`manifestTypeBefore`, `manifestTypeAfter`, `manifestSymlinkBefore`, and
`manifestSymlinkAfter` keys are removed together. Type, symlink, device, inode,
ownership, timestamps, and their hashes remain private. The executor requires
the exact six-key shape and literal stable boolean before parsing manifest or
evidence bytes; no compatibility form or optional identity field is accepted.

## Rename, cleanup, and failure policy

- Protected repository source, profiles, and activation objects are never
  renamed during a run.
- Staging and accepted result files use create-only names. Ordinary `rename`
  that can replace an existing destination is forbidden. A future atomic
  publication design may use descriptor-relative no-replace semantics only
  after separate review and must fail unsupported when the platform lacks it.
- Cleanup may unlink or remove only an exact run-owned object whose current
  private identity, ownership, full mode, and expected empty inventory match the
  object created by this process. It never follows symlinks, recursively removes
  state, or deletes a replacement.
- Primary operation failure is retained when cleanup also fails. Unsafe cleanup
  leaves the exact state in place and reports Inconclusive.
- A failed or unsupported identity chain is not repaired with a new path, copied
  bytes, a replacement run ID, relaxed mode, or retry.

The implementation must close retained descriptors on every outcome, after
required post-use validation. Descriptor-close failure is an Inconclusive
cleanup failure; it does not authorize another external command.

## Platform support and explicit limitations

The first implementation is Linux-only and Node.js `>=20.18.2 <21`, matching
the repository contract. It must fail closed before external execution when a
required capability or preflight condition is unavailable, including when:

- BigInt `lstat`/`fstat` fields including `uid`/`gid`, or nanosecond timestamps,
  are unavailable;
- `O_NOFOLLOW` or `O_DIRECTORY` cannot be applied as required;
- a filesystem returns inconsistent descriptor/path device/inode or type;
- an exact mode, one-link regular-file rule, size bound, or stable ancestor
  inventory cannot be met;
- the execution environment cannot maintain the cooperative, repository-owned
  host boundary required by a path-only tool consumer.

If a spawned process later fails to establish `close`, the operation is already
an attempt; it must remain Inconclusive, skip evidence reads and acceptance, and
retain unsafe state rather than pretending that the preflight failed.

This contract does not claim protection against kernel or runtime compromise,
bind-mount changes by a privileged host adversary, malicious same-UID races,
filesystem firmware faults, or authenticity against coordinated replacement of
both bytes and unsigned records. Those limitations remain explicit even after
the static/unit implementation passes.

## Smallest later implementation and acceptance

A later Docker-free first implementation task may change only these exact
source paths:

- new private `containers/profile-control/src/filesystem-identity.ts`;
- `containers/profile-control/src/run-controls.ts`;
- `containers/profile-control/src/offline-build-host-backend.ts`;
- `containers/profile-control/src/offline-build-recovery-host-backend.ts`;
- `containers/profile-control/src/control-host-backend.ts`;
- `containers/profile-control/src/execution.ts`; and
- `containers/profile-control/src/types.ts`.

It may change only these exact verification paths:

- new `containers/profile-control/test/filesystem-identity.test.ts`;
- `containers/profile-control/test/run-controls.test.ts`;
- `containers/profile-control/test/offline-build-host-backend.test.ts`;
- `containers/profile-control/test/offline-build-recovery-host-backend.test.ts`;
- `containers/profile-control/test/control-host-backend.test.ts`;
- `containers/profile-control/test/execution.test.ts`;
- `containers/profile-control/test/import-safety.test.ts`;
- `containers/profile-control/test/static-safety.test.ts`; and
- `containers/profile-control/scripts/verify-static.mjs`.

No package script, package-root export, profile, fixture, compiled output,
ordinary entry, activation source, or other M4 path is part of that task. The
implementation must:

- replace every security-relevant numeric device/inode comparison in the active
  M4 production paths above with the one private shared BigInt identity record,
  including `uid`/`gid`, held handles, ancestors, inventories, ownership
  classes, and role-specific full-mode transitions;
- migrate the executor/backend/type contract atomically to the exact six-key
  transfer projection above and remove every `m4-file-*` value plus all six old
  public identity/type/symlink keys;
- cover exact-input and four-source-to-staging lineage, both canonical profile
  files through pair settlement, every checkpoint and row of the exhaustive
  Docker configuration/recovery-state contract, and all nine result/scratch
  rows above; the deferred activation object is not covered;
- add focused negative tests for unsafe numeric identities, unavailable BigInt
  ownership, ownership substitution, symlink and hardlink aliases,
  mode/special-bit drift, same-size replacement, in-place mutation, parent
  rename/replacement, post-use drift, close-before-settlement, unsupported
  capability, result overwrite attempts, CLI owner/mode drift, container-owner
  divergence, a partial/extra/reordered Docker configuration checkpoint, the
  `0644` ref substituted to `0600` or another mode, configuration size drift,
  runtime-state content-read/normalization attempts, unsafe config cleanup,
  old/extra transfer keys, and a stable boolean emitted before post-use
  validation; and
- leave ordinary M4 entry fail closed and every historical run/result unchanged.

Implementation tests use only bounded repository-owned fixtures and fake
process/tool backends. They must not call Docker, access a runtime socket, read
retained M4 state, run a probe/lifecycle fixture, rebuild staging for a runtime
generation, use external network or credentials, or establish `Observed`.

After that first implementation, a fresh independent read-only implementation
review is still required. Its maximum approval is the separately named M4
distinct activation-object contract task; it cannot approve an execution gate.
That activation contract, its implementation, and their fresh reviews must
finish before any separately recorded future execution-gate definition may
choose new Expected revision, run IDs, result roots, container identities, or
an exact activation command. This contract chooses none of those future
identities.

## Current decision and next task

The current M4 code and historical gates predate this exact contract. Their
static/unit and runtime records remain valid only at their documented evidence
classes and limitations; they are not retroactively promoted or rejected by
this proposal.

Residual M4-FS01 is closed at contract scope by the exhaustive fixed Docker
configuration/recovery-state ownership, full-mode, settlement,
content-non-read, validation, and disposition rules above. M4-FS02 through
M4-FS04 remain closed at contract scope.

First implementation update (2026-07-20): the approved 16-path Docker-free
task is complete. The seven allowlisted production paths now share private
BigInt identity/owner/mode/time records and held handles, bind fixed source,
staging, profile, Docker-configuration/recovery, result, transfer, and host
roles, require child `close`, perform exact identity-checked cleanup, and use
the exact six-key public transfer projection without `m4-file-*` values. The
nine allowlisted verification paths cover numeric/ownership rejection,
symlink/hardlink and replacement drift, special modes, metadata-only runtime
state, fixed configuration checkpoints and the sole `0644` row, unsafe cleanup,
result/transfer mode drift, old/extra projection keys, and early stability.
`npm run m4:verify` passed its typecheck, static verifier, and all 236 tests. No
Docker, runtime socket, retained-state read, profile execution, compiled-output
change, runtime evidence, or `Observed` promotion occurred.

Fresh implementation review update (2026-07-20): the independent Docker-free
review in
[`reviews/m4-exact-filesystem-identity-implementation.md`](reviews/m4-exact-filesystem-identity-implementation.md)
keeps M4-FS01 through M4-FS04 closed at contract scope but blocks the first
implementation on M4-FSI01 through M4-FSI05. Complete nested source ancestry,
same-creating-descriptor host writes, immediate source/ancestor checks around
every fixed Docker copy, unknown-settlement retained-handle lifetime, and the
corresponding focused negative tests remain incomplete. The review changed no
implementation and approved no activation or execution gate.

Implementation remediation update (2026-07-20): the bounded 16-path
Docker-free remediation is complete. Both production repository-input leases
now retain the fixed `fixture` ancestor. Every host-created staging,
credential-empty configuration, control-manifest, and canonical host record
uses one exclusive creating descriptor for write, sync, same-descriptor
read-back, parent sync, validation, and later settlement. Each fixed Docker
copy validates its selected source, source parent, immutable input, run
ancestry, configuration, and transfer destination immediately before spawn and
after `close`. Recovery no longer releases the retained lease on unknown
settlement; the backend owns it until an eventual `close` terminal validates
and closes it, while synchronous spawn failure is closed only through normal
result consumption. Focused regressions cover nested-ancestor replacement,
creator continuity and sync/close failure, copy-parent drift, unknown
settlement, owner divergence, extra/premature configuration, unsupported open
capabilities, and rejection before a stable projection. `npm run m4:verify`
passed its typecheck, static verifier, 22 test files, and all 247 tests. These
are static/unit results only; M4-FSI01 through M4-FSI05 remain pending fresh
independent closure review. Docker, runtime sockets, retained state, activation,
compiled output, production execution, historical evidence, and `Observed`
were not accessed or changed.

Implementation remediation re-review update (2026-07-20): the fresh
independent Docker-free read-only review in
[`reviews/m4-exact-filesystem-identity-implementation-remediation.md`](reviews/m4-exact-filesystem-identity-implementation-remediation.md)
closes M4-FSI01 through M4-FSI05 with no new finding and keeps M4-FS01
through M4-FS04 closed at contract scope. It independently reproduced the
exact 16-path boundary and reran `npm run m4:verify`; typecheck, the static
verifier, 22 test files, and all 247 tests passed. This approves the first
filesystem-identity implementation only at its Docker-free static/unit
boundary. Activation, compiled output, Docker, retained-state access, runtime
identities/evidence, execution-gate selection, and `Observed` remain unchanged
and unapproved.

Distinct activation-object contract update (2026-07-20): the separate
Docker-free contract in
[`m4-distinct-activation-object.md`](m4-distinct-activation-object.md) fixes the
new frozen-research source, executable JavaScript, and declaration paths; exact
source/compiler bytes; 22-module TypeScript source and JavaScript construction
sets; a 21-module executable import closure; ordinary-entry/package/script
non-reachability; the complete source/compiled private identity and
child-settlement protocol; and one bounded later implementation/test/static
allowlist. Its fresh
independent review prompt is
[`prompts/reviews/m4-distinct-activation-object-contract-review.md`](../prompts/reviews/m4-distinct-activation-object-contract-review.md).
No object was added or compiled, no existing implementation/test/static path
changed, and no execution gate, Docker access, retained-state access, runtime
identity/evidence, or `Observed` change occurred.

Distinct activation-object contract review update (2026-07-20): the fresh
independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-contract.md`](reviews/m4-distinct-activation-object-contract.md)
closes M4-AO01, M4-AO03, M4-AO04, and M4-AO05 at contract scope but keeps
M4-AO02 open. The exact construction remains reproducible, while the contract
incorrectly conflates the 22-module TypeScript source closure and 22-file
JavaScript construction set with the actual 21-module executable import
closure, which excludes the type-only `types` row. No activation source or
compiled output was added, and no implementation or execution gate is
approved.

Distinct activation-object M4-AO02 contract remediation update (2026-07-20):
the contract preserves the exact 22-source/22-JavaScript-construction rows,
bytes, manifests, inventories, and compiler delta while separately binding the
exact 21-module emitted-JavaScript executable runtime import closure.
`types.ts` remains source-reachable through type-only edges and `types.js`
remains a required construction output with no runtime inbound edge. Focused
acceptance now distinguishes all three sets and rejects membership, ordering,
or runtime-edge drift. The object remains absent and no implementation,
compiled output, execution gate, Docker access, retained-state access, runtime
evidence, historical result, or `Observed` value changed.

Distinct activation-object M4-AO02 remediation re-review update (2026-07-20):
the fresh independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-contract-remediation.md`](reviews/m4-distinct-activation-object-contract-remediation.md)
reproduces the exact 22-source, 22-JavaScript-construction,
22-declaration-construction, and 21-executable-import sets. It confirms that
all `types.ts` source edges are type-only and that construction-only `types.js`
has no runtime inbound edge. M4-AO02 closes with no new finding; M4-AO01 and
M4-AO03 through M4-AO05 remain closed. The approval reaches only the contract's
fixed Docker-free compile-only/static/unit implementation allowlists.

Distinct activation-object implementation update (2026-07-20): the contract's
exact dormant 774-byte source and compiler-produced 788-byte JavaScript and
11-byte declaration are now constructed. Docker-free static/unit assertions
bind the exact 22-source, 22-JavaScript-construction,
22-declaration-construction, and 21-executable-import sets, complete
inventories/manifests/delta, package/ordinary-entry non-reachability, new-object
peer identity, and the existing replacement/settlement negative boundary.
`npm run m4:verify` passed typecheck, the static verifier, 23 test files, and all
252 tests; the focused compiled import-safety assertion also passed without
importing the distinct entry. The object was not imported or executed. Docker,
retained state, runtime identity/evidence, historical results, every execution
gate, and `Observed` remain unchanged and frozen.

Distinct activation-object implementation review update (2026-07-20): the
fresh independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-implementation.md`](reviews/m4-distinct-activation-object-implementation.md)
reproduces every source/output byte, inventory, construction and syntax-edge
manifest, the exact 22-source/22-JavaScript/22-declaration construction sets,
the 21-module executable closure, package/ordinary-entry non-reachability,
private peer identity, and focused replacement/settlement boundary. `npm run
m4:verify` passed 23 test files and all 252 tests. M4-AO01 through M4-AO05 are
closed at the Docker-free implementation boundary with no finding.

No activation import/execution, Docker action, retained-state access, runtime
identity/evidence, historical-result change, execution gate, or `Observed`
promotion occurred. Only one separately recorded Docker-free execution-gate
contract may begin next; its definition task cannot execute or approve the
command it defines.

Distinct activation-object execution-gate contract update (2026-07-20):
[`m4-distinct-activation-object-execution-gate.md`](m4-distinct-activation-object-execution-gate.md)
now fixes the fresh gate/run/root/container identities, exact run-ID
construction delta, separately compiled path-only wrapper, full held-object
pre/close/post protocol, bounded canonical result, one candidate command, and
retention-only no-retry boundary. The definition preserves the independently
approved filesystem-identity and activation-object implementations as
static/unit evidence and saves a fresh independent contract-review prompt. No
wrapper implementation, object import/execution, Docker action,
retained/result-state access, runtime identity/evidence, gate approval,
historical-result change, or `Observed` promotion occurred.

Distinct activation-object execution-gate contract-review update (2026-07-20):
the fresh Docker-free read-only review in
[`reviews/m4-distinct-activation-object-execution-gate.md`](reviews/m4-distinct-activation-object-execution-gate.md)
reproduces the fresh tuple, construction values, listed held-object protocol,
and unknown-settlement retention direction. It closes M4-AG01 and M4-AG06 but
blocks the wrapper implementation on M4-AGR01 through M4-AGR03: the wrapper's
repository executable closure is not fully leased, synchronous no-child spawn
and signal failure are not exactly settled, and a late valid child result can
override an earlier wrapper failure under the current eligibility wording.
M4-FS01 through M4-FS04, M4-FSI01 through M4-FSI05, and M4-AO01 through
M4-AO05 remain closed at their existing contract/static/unit boundaries.

No wrapper/run-ID implementation, object import/execution, Docker action,
result/retained-state access, runtime identity/evidence, command approval, or
`Observed` promotion occurred.

Distinct activation-object execution-gate M4-AGR01 through M4-AGR03
contract-remediation update (2026-07-20): the gate contract now binds the
wrapper's exact seven-built-in/zero-local edge sets and singleton executable
lease; the no-child, asynchronous-error, signal-delivery, late-`close`, and
descriptor-release branches; and one chronological write-once wrapper failure
that permanently disqualifies late valid child output. The activation object's
existing 22/22/22 construction and 21-executable sets remain separate and
unchanged. A fresh independent Docker-free remediation re-review prompt is
saved under `prompts/reviews/`.

No wrapper/run-ID/package implementation, filesystem-emitting compile,
activation import/execution, Docker action, result/retained-state access,
runtime identity/evidence, command approval/execution, historical-evidence
change, standing-authorization use, or `Observed` promotion occurred.

Next: perform the fresh independent Docker-free read-only re-review under
[`prompts/reviews/m4-distinct-activation-object-execution-gate-remediation-review.md`](../prompts/reviews/m4-distinct-activation-object-execution-gate-remediation-review.md).

Distinct activation-object execution-gate remediation re-review update
(2026-07-20): the fresh independent Docker-free review in
[`reviews/m4-distinct-activation-object-execution-gate-remediation.md`](reviews/m4-distinct-activation-object-execution-gate-remediation.md)
closes M4-AGR01 through M4-AGR03 with no new finding and closes M4-AG01
through M4-AG06 at contract scope. The wrapper's exact built-in-only singleton
closure, complete held identity, no-child/returned-child/signal settlement,
and monotonic failure precedence reproduce. M4-FS01 through M4-FS04,
M4-FSI01 through M4-FSI05, and M4-AO01 through M4-AO05 remain closed at their
existing contract/static/unit boundaries.

No wrapper/run-ID/package implementation, activation import/execution, Docker
action, retained/result-state access, runtime identity/evidence, command
approval/execution, historical-evidence change, standing-authorization use,
or `Observed` promotion occurred.

Next: perform the exact bounded Docker-free wrapper/run-ID/package
implementation and focused static/unit verification, then obtain a fresh
independent implementation/gate review before any command approval.

Distinct activation-object execution-gate implementation update (2026-07-20):
the approved bounded wrapper/run-ID/package task is complete. The wrapper uses
its own held BigInt descriptor chain over the exact source/compiled/package and
profile inputs, validates twice before spawn and twice after child `close`,
retains unknown settlement, and suppresses accepted identity output until
reverse release succeeds. Focused disposable tests cover replacement,
in-place mutation, mode, hardlink, symlink, no-child, late-`close`, signal,
first-failure, and release boundaries. `npm run m4:verify` passed 24 test files
and all 265 tests. This does not add runtime identity evidence or alter the
approved first filesystem-identity implementation.

Next: perform the fresh independent Docker-free implementation/gate review;
the candidate command, Docker, retained/result state, and `Observed` remain
unapproved and frozen.

Distinct activation-object implementation/gate review update (2026-07-20):
the fresh Docker-free review in
[`reviews/m4-distinct-activation-object-execution-gate-implementation.md`](reviews/m4-distinct-activation-object-execution-gate-implementation.md)
preserves M4-FS01 through M4-FS04 and M4-FSI01 through M4-FSI05 at their
existing contract/static/unit boundaries. The later wrapper gate remains
blocked on M4-AGI01/M4-AGI02: production capture does not authenticate the
three full reviewed wrapper objects, and the required focused negative matrix
is incomplete.

No candidate command, activation/wrapper production entry, Docker,
retained/result state, standing authorization, historical evidence, or
`Observed` value was executed, accessed, or changed.

Next: remediate only M4-AGI01 and M4-AGI02 under
[`prompts/m4-distinct-activation-object-execution-gate-implementation-remediation.md`](../prompts/m4-distinct-activation-object-execution-gate-implementation-remediation.md).

Distinct activation-object M4-AGI01/M4-AGI02 remediation and re-review update
(2026-07-20): the full-object trust input is now an explicit non-circular final
`npm run m4:static` preflight adjacent to any candidate occurrence, while the
production descriptor chain remains a twice-pre/twice-post stability lease.
The expanded focused suite closes the complete edge, identity, process, output,
and projection negative matrix. The fresh independent review in
[`reviews/m4-distinct-activation-object-execution-gate-implementation-remediation.md`](reviews/m4-distinct-activation-object-execution-gate-implementation-remediation.md)
closes M4-AGI01/M4-AGI02 and M4-AG01 through M4-AG06 at implementation scope;
`npm run m4:verify` passed 24 test files and all 292 tests.

The approval reaches only one exact later occurrence after fresh identity/root-
absence reproduction and an immediately adjacent successful final static
preflight. Any failure exhausts the generation. The review did not run either
production entry, Docker, or the candidate command and did not create runtime
identity or `Observed` evidence.

Next: execute the exact approved one-occurrence activation gate in a fresh
worker, then stop without retry for a separate result review.

Exact one-occurrence activation update (2026-07-20): the reviewed identities
and only the two exact new-root absence facts reproduced, and the final
immediately adjacent `npm run m4:static` trust preflight exited 0. The worker
then used the `continue-repository-work` standing authorization, not a separate
human review, for exactly one argument-free
`npm run --silent m4:execute:frozen-research` occurrence. It exited 70 with no
candidate stdout or stderr and was not retried. No cleanup, repair, alternate
tuple, post-attempt Docker command, result/retained-state access,
classification, historical-evidence change, or `Observed` promotion occurred.

Next: define the exact fresh Docker-free result-review prompt for the exhausted
`20260720-02` activation generation without accessing either result root.

Exhausted-generation result-review update (2026-07-20): the fresh independent
Docker-free review in
[`reviews/m4-distinct-activation-object-result.md`](reviews/m4-distinct-activation-object-result.md)
reproduces the complete approved construction and records both exact new result
roots as absent. No result object exists from which to establish a public
six-key identity projection, private held identity, transfer relation,
completion, or settlement. The exit-70/zero-byte handoff is therefore accepted
only as one immutable exhausted Inconclusive attempt and does not change any
historical identity or evidence class. Issue #45 closes only at this reviewed
cooperative-host limitation; no retry, repair, cleanup, alternate generation,
or `Observed` promotion is authorized.

Next: begin issue #46 with one Docker-free public-input-hardening contract and
fresh independent contract-review prompt; do not implement the hardening in
that contract task.
