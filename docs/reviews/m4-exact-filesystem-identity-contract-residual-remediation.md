# M4 exact filesystem-object identity residual-remediation re-review

## Review target and decision

- Target: the residual M4-FS01 remediation in
  [`m4-exact-filesystem-identity.md`](../m4-exact-filesystem-identity.md)
- Review type: fresh independent Docker-free read-only contract and exact
  tracked-source re-review
- Decision: **APPROVED for exactly one bounded Docker-free static/unit first
  implementation task**
- M4-FS01 ownership/full-mode/configuration-state closure: **CLOSED at contract
  scope**
- M4-FS02 activation sequencing: **remains CLOSED at contract scope**
- M4-FS03 public projection and implementation scope: **remains CLOSED at
  contract scope**
- M4-FS04 result/scratch roles: **remains CLOSED at contract scope**
- Blocking findings: none
- Non-blocking findings: none
- Docker, retained M4 state, runtime evidence, and `Observed`: not accessed,
  executed, or changed

The residual remediation closes the last contract gap. It binds all 16 fresh
Docker-configuration rows and the 15-row recovery snapshot to exact types,
complete modes, private owner relations, inventories or bounded sizes, creating
child `close` settlement, held identities, and fixed disposition rules. The one
`0644` buildx ref is now an exact exception rather than an implementation
choice. Runtime-created configuration contents remain outside the read boundary.

The contract therefore approves only its already allowlisted first
implementation. This approval is static/unit only. It does not approve a
distinct activation object, compiled output, package script, execution gate,
Docker command, retained-state access, fresh runtime tuple, retry, or any
runtime or `Observed` claim.

## Reviewed snapshot identity

The hashes below identify the review inputs before this review record and its
minimal status updates were added. They establish contract and static-source
identity only; they are not runtime filesystem identities.

| Target | SHA-256 |
|---|---|
| Residually remediated contract | `7570354f7f47ee9971d2586a25697b83e8e4138cd361b9bd190e1d7fff43a781` |
| Initial independent contract review | `5c5a675991123648aa04592cb05772fd9d95d5b588152bfd6a3a34fd3d08a48d` |
| First remediation prompt | `856339a18e9ea6125ec44da679410fbe94ca8ccf3149beb024b1f75a812f27d3` |
| First remediation re-review prompt | `87c2740679b3b6a505b72f94746c1a0c6e2322452b3d62ca832d62fa0481cfda` |
| First remediation re-review | `5d2a35a5621f50a46ec8c9f9fc00284fb42bcc3583a2c0b5e3f49e3c60fb8421` |
| This residual-remediation re-review prompt | `86e6a5f76e7fc8db8be03da315d6e843035d86bc00b17b6fb3544397e095dd40` |
| Sorted SHA-256 manifest of the 14 current tracked source/test/static paths in this review | `88d96e7cf749f0da09d0a96b15882bc091d688d7fda3ed5eed7f0f0f1957eb7a` |
| Ordinary `orchestrator-entry.ts` | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| Ordinary compiled `orchestrator-entry.js` | `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4` |

The 14-file aggregate covers the six existing source paths, seven existing
focused test paths, and `verify-static.mjs`. The proposed
`filesystem-identity.ts` and its focused test do not exist in the current
tracked baseline and were not treated as implemented behavior.

## Independently reproduced current static baseline

### Source, staging, and profile reads

`run-controls.ts` still uses path-based `readFile` for `image-input.json`, the
four fixed staging inputs, and both canonical profiles. The offline-build and
control backends still use numeric device/inode records and short-lived
`O_NOFOLLOW` file handles. Those handles are closed after each bounded read,
before the complete consumer or pair settlement boundary. This is expected
current static behavior; it does not implement the proposed BigInt owner/mode/
ancestor/held-handle guarantee.

### Fresh offline-build configuration and cleanup

The current offline-build backend exclusively creates the run, staging, and
`docker-config` directories and writes credential-empty `config.json`. Its
current private-directory checks accept a range of private modes rather than
the contract's exact full modes, and its identities remain numeric. Each fixed
Docker command is settled on `close` when observed.

Current cleanup accepts only a `docker-config` inventory containing
`config.json`; runtime-created token/buildx entries make that cleanup fail and
retain state. That behavior matches the recorded historical cleanup failure and
explains the exact migration required by the remediated future contract. It is
not a new finding against that future contract.

### Fixed recovery inventory

`offline-build-recovery-host-backend.ts` still declares the exact 15-entry
recovery snapshot: the run root, `docker-config`, and 13 runtime-created rows.
It binds `0700` directories; `0600` token, lock, node-ID, activity, and lock
files; and the sole one-link `0644`, 281-byte buildx ref file. The validator
checks full `0o7777` modes, exact directory inventories, regular-file sizes and
link counts, and numeric device/inode continuity. It imports no content-read or
mutation API, and the current static verifier forbids `readFile`, `open`,
`writeFile`, `unlink`, `rmdir`, `rm`, `rename`, `chmod`, and `mkdir` in that
production recovery backend.

The recovery child also settles on `close`, and validation while its child is
still active is rejected. These are current static/unit boundaries only. This
review did not inspect the fixed historical root or reproduce its owner,
identity, or mode on the host.

### Control transfer and ordinary reachability

`control-host-backend.ts` still hashes numeric manifest device/inode into a
public `m4-file-*` value, and `execution.ts` still requires both identity
strings plus the four type/symlink keys. Existing control source/transfer/host
records use current exact names and modes but short-lived handles. This
reproduces why the first implementation must migrate backend, executor, types,
tests, and static assertions atomically to the six-key private-stability
projection.

The ordinary source and compiled entry retain their reviewed fail-closed bytes.
The package root does not expose the production host backends or fixed
production control runner. The root `m4:run:controls` script still targets the
ordinary entry, so the approved first implementation remains unreachable for
runtime use.

## Residual M4-FS01 closure analysis

### Exact fresh checkpoints are closed

Before `doctor`, the contract requires one exclusively created `runOwner`/
`0700` run root, one `runOwner`/`0700` `docker-config`, and one one-link
`runOwner`/`0600` `config.json` containing exactly 13 credential-empty bytes and
the fixed SHA-256. `docker-config` contains only that file, so every fixed
runtime-created basename is absent.

The accepted command checkpoints are exact:

1. `doctor` `close` adds only `.token_seed` and `.token_seed.lock`, with
   `buildx` still absent;
2. `build` `close` adds the complete fixed buildx tree; and
3. `inspect-image` `close` must leave every accepted identity, metadata value,
   inventory, and `config.json` byte unchanged.

Each checkpoint is evaluated after `close` even for an otherwise unsuccessful
command. Missing, extra, partial, premature, removed, replaced, or drifted
state is terminal Inconclusive and retained. A spawned child without `close`
establishes no later checkpoint and authorizes no cleanup. No compatibility
discovery or normalization branch remains.

### All 16 rows have exact owner, mode, and metadata rules

The table contains exactly 16 logical rows: the run root, `docker-config`,
`config.json`, and 13 fixed runtime-created rows. Fresh rows equal the private
`runOwner`; recovery rows equal the private `recoveryRunOwner` captured from
the fixed existing run root. Numeric ownership is neither inferred from a
runtime user nor published.

Every directory is a held non-symlink directory with exact `0700` full mode and
the listed inventory. Every runtime-created regular file has one link, no
special bits, the exact owner relation, and one fixed BigInt size:

- `.token_seed`: `0600`, 74 bytes;
- `.token_seed.lock`: `0600`, 0 bytes;
- `buildx/.buildNodeID`: `0600`, 16 bytes;
- `buildx/.lock`: `0600`, 0 bytes;
- `buildx/activity/default`: `0600`, 20 bytes; and
- the fixed buildx ref: `0644`, 281 bytes.

The last row is the only accepted `0644` regular-file role. A different owner,
mode, size, type, link count, special bit, or inventory has no corrective path.

### Content non-read and handle lifetime are closed

Runtime-created regular-file content is never read, hashed, copied,
normalized, or serialized. Its size and identity remain private metadata and
have no content-identity field. A new row may be opened only after its creating
child emits `close`, using `O_NOFOLLOW`; directories additionally require
`O_DIRECTORY`. Descriptor/path identity, owner, full mode, link count, size,
ancestors, and exact inventory are compared twice. Those handles remain open
through each later child's settlement, revalidation, and final disposition.

The rule is fail closed when stable BigInt identity, ownership, timestamp, or
descriptor semantics are unavailable. It does not authorize a content read to
diagnose or accommodate an unsupported runtime-created representation.

### Fresh cleanup and fixed recovery are closed

Fresh cleanup is limited to the row set in the last completely validated
checkpoint. It uses the contract's exact deepest-first 15-name unlink/rmdir
order, validates each held identity/owner/full-mode/inventory immediately
before removal, performs no recursive discovery, then runs the separately fixed
staging cleanup and removes the run root only after exact empty-inventory
validation. Unknown settlement, invalid checkpoint, identity drift, removal or
descriptor-close failure stops deletion, preserves the primary failure,
retains remaining state, and remains Inconclusive.

The fixed recovery snapshot requires `config.json` absent and every other table
row present with one `recoveryRunOwner`. Recovery captures all private handles
before the one fixed inspect, validates them before spawn and after inspect
`close`, never enters fresh cleanup, and retains the state on every outcome.
No ownership, mode, checkpoint, content-read, cleanup, or recovery disposition
is left to implementation choice.

## M4-FS02 through M4-FS04 remain closed

- **M4-FS02:** the first implementation has no activation source, compiled
  output, path, test, or acceptance item. The ordinary source/output remain
  unchanged. Only the separately named M4 distinct activation-object contract
  task may later choose those identities after implementation and fresh review.
- **M4-FS03:** the replacement transfer record has exactly
  `manifestBefore`, `manifestAfter`, `manifestIdentityStable`,
  `controlEvidence`, `resultFiles`, and `scratchFiles`. The literal stable
  boolean is available only after private post-use and cleanup validation. All
  six old identity/type/symlink keys and every `m4-file-*` value are removed
  atomically, with no compatibility form.
- **M4-FS04:** the nine container-direct, official-tool-transfer, and
  host-direct rows retain exact absent-name/inventory prerequisites, full modes,
  private owner relations, canonical/literal byte and hash bounds, producer
  settlement or host sync, held-handle lifetimes, and retention or cleanup.
  Docker `cp` owner/mode mismatch remains transfer Inconclusive without host
  normalization.

The cooperative-host limitation also remains explicit. Descriptor/path and
pre/use/post checks detect drift at the stable boundaries but do not claim
atomic race resistance against a same-UID swap-and-restore adversary around a
path-only external CLI.

## Exact approved first-implementation boundary

One later Docker-free static/unit task may change exactly the seven source paths
and nine verification paths listed in the contract: the new private identity
helper, loader, offline-build/recovery/control host backends, executor and
types; the new helper test, seven existing focused tests, and
`verify-static.mjs`. No other source, test, package script, package-root export,
profile, fixture, ordinary entry, activation object, compiled output, staging,
or result path is approved.

That task must implement the complete BigInt owner/mode/ancestor/handle chain,
all Docker-configuration and result rows, the exact six-key projection, and the
contract's focused negative-test list atomically. Tests must use only bounded
repository-owned fixtures and fake process/tool backends. The first
implementation still requires a fresh independent read-only implementation
review; that later review may approve at most the distinct activation-object
contract task, not an execution gate.

## Evidence classification and limitations

- This contract and re-review are configuration/contract evidence.
- Current source and historical test reports are static/unit evidence only.
- Historical runtime attempts, identities, results, and limitations remain
  immutable and are not reinterpreted by this approval.
- No Docker behavior, stable host filesystem identity, retained-state owner,
  runtime enforcement, profile-control Observed, adapter-route Observed,
  experiment-matrix Observed, or presentation claim is established.
- The kernel/filesystem and cooperative repository-owned host remain trusted;
  same-UID hostile races, privileged mount changes, runtime/kernel compromise,
  and authenticity remain outside the guarantee.

No Expected revision, run ID, result root, container identity, activation path
or bytes, command, execution gate, retry, or `Observed` value was selected or
changed.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, routed M4/frozen-research documents, review history, remediation inputs, and this re-review prompt | Read without Docker, retained-state access, or external communication. |
| Exact contract marker assertions and row count | Exit 0; reproduced every checkpoint/owner/content/cleanup/activation marker and exactly 16 Docker-configuration table rows. |
| Exact `git grep` over the six tracked source paths, seven focused tests, and `verify-static.mjs` | Exit 0; reproduced numeric device/inode and short-lived handles, path-based loader reads, process `close`, current config-only cleanup, all retained names/modes/sizes, content-non-read recovery, and the old public `m4-file-*` projection. |
| Exact `git ls-files`, critical `sha256sum`, and sorted 14-file manifest | Exit 0; reproduced the tracked path set, aggregate `88d96e7c...`, ordinary source/output identities, and absence of the proposed helper/test from the tracked baseline. |
| Exact ordinary entry/package reachability scan | Exit 0; reproduced the fail-closed entry and no package-root production backend/runner exposure. |
| `git diff --check` before review edits | Exit 0. |
| Focused Prettier check over this review and the two status records | Exit 0; all three files matched repository formatting. |
| `git diff --check` after review/status edits | Exit 0. |

No test, typecheck, build, broad verification, staging rebuild, Docker/container
command, runtime-socket operation, result-root or retained-state read, external
network, credential, host-home access, Remote Git, publication, deployment, or
third-party communication was used. Standing authorization was not needed
because this task performed no approval-gated runtime action.

## Decision and next task

Residual M4-FS01 is closed at contract scope with no new finding, and M4-FS02
through M4-FS04 remain closed. The exact Docker-free first implementation is
approved only at the static/unit boundary above.

Next: implement the exact first M4 filesystem-identity task and focused negative
tests under the contract's 16-path allowlist, without Docker, retained-state
access, activation, compiled-output changes, or `Observed` promotion.
