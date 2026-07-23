# M4 exact filesystem-object identity contract independent review

## Review target and decision

- Target: the Docker-free issue #45 contract candidate in
  [`m4-exact-filesystem-identity.md`](../m4-exact-filesystem-identity.md)
- Review type: fresh independent read-only contract and tracked-source review
- Decision: **BLOCKED; do not implement this contract yet**
- Blocking findings: M4-FS01 through M4-FS04
- Non-blocking findings: none
- Docker, retained M4 state, runtime evidence, and `Observed`: not accessed,
  executed, or changed

The proposal correctly moves the M4 production boundary away from numeric
device/inode comparisons, path-only `readFile`, short-lived handles, and a
device/inode-derived public token. Its cooperative-host limitation is explicit,
and its descriptor/path, pre/use/post, process-close, no-retry, cleanup, and
evidence-class directions are sound.

One later implementation task is not yet closed, however. The proposed private
metadata record omits ownership while claiming metadata-drift coverage; the
activation object required by that implementation has no fixed identity or
consistent sequencing; the exact public transfer shape and the files allowed to
change cannot remove the current `m4-file-*` contract; and the result role does
not fix the ownership/mode transitions for its three different producers. Those
are contract gaps, not implementation findings, and this review does not repair
them.

## Blocking findings

### M4-FS01 — the private metadata record omits ownership

The proposal's private record contains type, device, inode, full mode, link
count, size, `mtimeNs`, and `ctimeNs`, but not `uid` or `gid`. The same section
nevertheless lists ownership values as private data, and the objective says
metadata drift is detected. A `chown`/`chgrp` transition can preserve every
listed field except `ctimeNs`; observing only the changed timestamp detects that
something changed but cannot bind the new ownership or prove restoration to the
accepted owner. More importantly, ownership participates in the meaning of the
`0555`, `0733`, and `0700` directory modes and the container-created result
files.

The current backend does not supply a safe default for the missing rule. It
uses host-created private directories together with container-created files
owned under the fixed container identity, while the existing review history
expressly avoids treating an assumed host/container numeric ownership mapping
as evidence.

Required remediation: either add BigInt `uid`/`gid` to the private snapshot and
fix a role-specific accepted ownership relation that works for host-created,
container-created, and CLI-materialized objects, or explicitly narrow the
guarantee and prove why ownership is not security-relevant for each protected
role. In either case, ownership must stay private and every permitted ownership
transition must be exact rather than inferred from mode bits or a changed
`ctimeNs`.

### M4-FS02 — the required activation object is unresolved

The proposal says every path is a repository constant and that the next
implementation covers a separate activation candidate. It also says only a
later gate will provide that activation object and compiled output, and it
chooses none of the future identities. No source path, compiled path,
construction boundary, ordinary-reachability assertion, or owner task is fixed
for the implementation that this review is asked to approve.

The current repository cannot fill that gap without making a consequential
choice. The ordinary `orchestrator-entry.ts` remains the reviewed fail-closed
entry, and the historical offline-build/control gates temporarily replaced that
ordinary source before restoring it. The proposal correctly forbids repeating
that pattern, but no distinct replacement object exists in the approved
contract.

Required remediation: choose one sequencing boundary. Either fix the distinct
activation source/compiled logical paths and include their creation,
non-export/non-script reachability, identity checks, and focused tests in the
one implementation task, or defer activation to a separately named contract
task and remove it from the first implementation's acceptance criteria. The
ordinary fail-closed source and compiled output must remain unchanged in both
choices. A future runtime command, run ID, or output hash need not be selected
by this remediation.

### M4-FS03 — public-token removal has no exact replacement schema or change scope

The proposal rejects the current device/inode-derived `m4-file-*` projection
and permits a boolean "such as `identityStable: true`". That example is not an
exact transfer contract. The active executor has an exact key list containing
`manifestIdentityBefore` and `manifestIdentityAfter`, validates both against the
`m4-file-*` pattern, and has focused tests for that shape. Removing the token
therefore requires a coordinated executor/schema/test change, not only an
identity helper, loader, or host backend change.

The proposed implementation allowlist does not name `execution.ts` or the
exact transfer/result contract that must change. Different implementers could
legitimately choose one boolean, two booleans, retain the type/symlink fields,
or remove the entire public identity projection. Those choices produce
incompatible exact-key validators and evidence shapes.

Required remediation: fix the exact public transfer keys and semantics after
private comparison, including whether type/symlink fields remain, and expand
the implementation path allowlist to the exact executor/type/test/static files
needed for that migration. The public shape must contain no value or hash
derived only from device/inode and must not claim stability before post-use
validation succeeds.

### M4-FS04 — result-object ownership and mode transitions are not closed

The result role combines three different materialization origins:
container-direct writes, fixed runtime-CLI copies into transfer, and host-direct
canonical records. It fixes mode `0600` only for accepted host records and fixes
directory modes, while requiring every result file to pass an exact mode check.
It does not state the accepted file mode/ownership relation after container
creation or CLI copy, nor whether the transfer copy must preserve or normalize
the container file's mode.

Current tracked behavior happens to create the control evidence, result marker,
and permissive scratch marker with mode `0600`, checks transfer files with the
backend's default `0600`, and creates host records with `0600`. That current
implementation is static evidence, not a substitute for the proposed future
guarantee, especially once M4-FS01 makes ownership explicit.

Required remediation: provide a role/phase table for every fixed result and
scratch basename. It must state the producer, absent-parent precondition,
expected file mode including special bits, accepted private ownership relation,
size/canonical-byte/hash bound, descriptor lifetime, settlement event, and
post-use/cleanup disposition. If the fixed CLI preserves metadata, that
preservation must be validated; if host code normalizes a copy, the
normalization must remain a separately recorded host-direct mutation.

## Independently traced current-state evidence

### Repository source, staging, and profile loaders

`run-controls.ts` canonicalizes only the repository root, then reads
`image-input.json`, all four staging sources, and both profile files with
path-based `readFile`. It does not retain source/profile descriptors or bind
their ancestors through pair settlement.

The offline-build backend improves on that baseline by checking regular-file
type, one link, and numeric device/inode, then opening a source with
`O_NOFOLLOW` and comparing handle stats before and after the read. The handle is
closed before the external consumer runs. Source ancestors, full mode, size,
timestamps, and post-consumer source identity are not retained. Staged files
are created with `writeFile(..., { flag: "wx", mode: 0o600 })`, reopened, and
tracked only by numeric device/inode; their creation descriptor is not retained
through the build.

The pure staging module binds copied bytes, per-file SHA-256, ordered names, and
the aggregate digest. That remains valuable byte-lineage/static evidence but is
not filesystem-object identity.

### Activation, recovery, and ordinary reachability

The current ordinary entry hash remains
`73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f`
and dispatches only through the fail-closed ordinary orchestrator. The package
root does not export the production control runner/backend. Historical records
show that one-shot gates temporarily replaced the ordinary entry and restored
it; the candidate intentionally supersedes that activation pattern but has not
fixed the distinct object that replaces it.

The retained-state recovery backend uses exact names, type, full `0o7777` mode,
link count, size, numeric device/inode, pre/post validation, and child `close`
settlement. It deliberately does not read retained file content. Those are the
current static/unit guarantees; they are not BigInt/full-metadata/ancestor
identity and this review did not inspect retained state.

### Control, transfer, host result, and cleanup

The production control backend uses numeric `number` device/inode identities.
It checks full special-bit modes, one-link regular files, exact inventories, and
bounded descriptor reads, but closes each read handle immediately. Container
and transfer result paths are read only after the corresponding fixed child
command emits `close`, and host records use exclusive `0600` path writes.

The manifest's numeric device/inode is currently hashed into a public
`m4-file-*` value. The executor requires that value in both before/after fields.
Transfer cleanup unlinks fixed names after content reads, config cleanup checks
the fixed identity/inventory, and host result files are retained. The current
checks do not provide the proposal's BigInt, full metadata/content, ancestor,
held-handle, sync, or post-use contract.

### Focused tests and static verifier

Tracked tests cover the current numeric identity equality, exact `m4-file-*`
transfer shape, special-bit mode remediation, abnormal-close recovery, fixed
command order, overwrite rejection at selected paths, and ordinary import/
reachability boundaries. The static verifier pins current backend imports and
source fragments. No existing test or verifier establishes the candidate's
full pre/use/post chain; that is a proposed future static/unit guarantee.

## Contract analysis accepted at this review boundary

- BigInt stat use, full special-bit comparison, one-link regular-file policy,
  bounded descriptor reads, byte length/SHA-256 lineage, unique logical object
  identity, and no public raw filesystem metadata are coherent on the fixed
  Linux/Node boundary once M4-FS01 is resolved.
- Root/ancestor/final-name binding, held descriptors, exact inventories,
  absent-destination parent binding, and pre/immediate/post observations are
  appropriate detection controls under the expressly cooperative host model.
  They are not atomic `openat`/filesystem-sandbox guarantees, and the contract
  does not claim that they are.
- Requiring child `close` before post-use acceptance and evidence reads
  preserves the previously reviewed settlement boundary. Timeout, output,
  signal, or `exit` alone remains insufficient.
- Fail-closed unsupported behavior, no repair/retry, identity-checked cleanup,
  primary-failure preservation, and explicit Inconclusive mapping preserve the
  evidence-validity boundary.
- Host-direct, container-direct, fixed runtime-CLI materialization, and
  route-specific official tool API changes remain separate evidence classes.
  Equal hashes do not collapse those origins.

These positive points do not approve implementation while M4-FS01 through
M4-FS04 remain open.

## Evidence classification and limitations

- Historical Docker/runtime attempts and their immutable outcomes are unchanged.
- Current source and prior test reports are static/unit evidence only.
- This proposal and review are configuration/contract evidence only.
- No profile-control, adapter-route, experiment-matrix, or presentation
  `Observed` result is established or promoted.
- A same-UID adversarial swap-and-restore race, kernel/runtime compromise,
  privileged bind-mount change, and signed authenticity remain outside the
  proposed cooperative-host boundary.

An initial broad repository-local `rg` was incorrectly scoped across
`containers/` and traversed ignored presentation staging paths, returning
staged source names/snippets. It did not run or mutate staging, access a result
root or retained M4 state, or contribute evidence to this decision. Subsequent
assertions used exact tracked `containers/profile-control` paths. This review
therefore does not claim that no ignored staging read was attempted.

## Verification observed and safety boundary

| Command or assertion | Observed result |
|---|---|
| Applicable instructions, contract/docs, historical M4 reviews, and exact tracked M4 source/test/static-verifier inspection | Completed without Docker, retained-state access, a lifecycle fixture, build, or test execution. |
| `git grep` over exact tracked `containers/profile-control` paths for `dev`/`ino` and `m4-file-*` | Exit 0; reproduced numeric identity in the offline-build, recovery, and control backends plus the public executor/test token contract. |
| Exact loader/process/filesystem assertions over `run-controls.ts` and the three host backends | Exit 0; reproduced path-based source/profile reads, short-lived `O_NOFOLLOW` handles, exclusive writes, fixed close listeners, inventories, and identity-checked cleanup. |
| Ordinary entry/package reachability scan and `sha256sum` | Exit 0; reproduced the fail-closed entry hash and no package-root production export. |
| `git diff --check` before review edits | Exit 0. |
| Focused Prettier check over the review/remediation/status files | Exit 0; all four named files matched repository formatting. |
| `git diff --check` after review edits | Exit 0 for tracked changes. |

No test, typecheck, build, broad verification, staging rebuild, Docker/container
command, runtime-socket operation, result-root or retained-state read, external
network, credential, Remote Git, publication, deployment, or third-party
communication was used. Standing authorization was not needed because the
review did not reach an approved execution action.

## Exact blocked boundary and next task

No M4 identity helper, loader, backend, executor, public transfer shape, test,
activation object, runtime identity, or execution gate may be implemented from
this snapshot. The next task is limited to a Docker-free contract remediation
that closes M4-FS01 through M4-FS04, updates only the contract/prompt/status
records, and writes a separate fresh re-review prompt. A later fresh independent
review must decide whether exactly one static/unit implementation task is
approved.

Next: remediate M4-FS01 through M4-FS04 under
[`prompts/m4-exact-filesystem-identity-contract-remediation.md`](../../prompts/m4-exact-filesystem-identity-contract-remediation.md),
then request a fresh independent Docker-free contract re-review before any
implementation or test execution.
