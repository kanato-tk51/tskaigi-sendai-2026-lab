# M0/M2-A dependency-input boundary contract

Status: **dependency-input contract and Docker-free static/unit implementation
independently approved; M2A-IBI01/M2A-IBI02 and M2A-IB01 through M2A-IB06
are closed at implementation scope; M2A-IBR01 through M2A-IBR03 remain closed
at contract scope; no input-producer execution, npm acquisition,
constructor-toolchain capture, construction, image build, Docker execution,
transfer, result access, or evidence promotion is approved**

Contract date: 2026-07-21

This issue #43 contract follows the reviewed Docker-free construction/
execution-gate implementation. It fixes how two future prerequisite inputs may
be produced for generation `20260721-01`: the npm `12.0.1` archive/receipt pair
and the constructor Node/TypeScript toolchain root/receipt. It does not acquire,
inspect, or infer those future bytes and does not open the already implemented
constructor gate.

## Decision IDs and maximum review decision

The fresh contract review must decide:

- **M2A-IB01 — exact credential-empty npm acquisition authority**
- **M2A-IB02 — atomic npm archive and canonical receipt publication**
- **M2A-IB03 — exact offline constructor-toolchain source closure**
- **M2A-IB04 — atomic toolchain inventory and canonical receipt publication**
- **M2A-IB05 — one-shot failure, review, and evidence separation**
- **M2A-IB06 — later implementation and verification allowlist**

The maximum positive decision approves only one Docker-free static/unit
implementation of the two fixed input producers and their fake-only transports,
filesystem backends, validators, and negative tests under M2A-IB06. It does not
approve either production entry for execution, external communication, a host
runtime/toolchain read, standing-authorization use, npm extraction or script
execution, construction, compilation, image work, Docker, transfer, result
review, evidence acceptance, or an `Observed` value.

## Preserved upstream boundary

The following fixed construction inputs are unchanged:

| Role | Fixed value |
| --- | --- |
| Generation | `20260721-01` |
| npm acquisition root | `experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01` |
| npm archive | `experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01/npm-12.0.1.tgz` |
| npm receipt | `experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01/acquisition.json` |
| Toolchain root | `experiments/npm12-install/.work/m2a-transfer-toolchain-20260721-01` |
| Toolchain receipt | `experiments/npm12-install/.work/m2a-transfer-toolchain-20260721-01/toolchain.json` |
| Construction root | `experiments/npm12-install/.work/m2a-transfer-construction-20260721-01` |
| Result root | `results/runs/m2-a/m2a-npm-lifecycle-20260721000000000000000000000001` |
| Source aggregate | `sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04` |
| Construction baseline aggregate | `sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526` |

M2A-TR01 through M2A-TR06, M2A-CGR01 through M2A-CGR03,
M2A-CGI01 through M2A-CGI04, and M2A-CG01 through M2A-CG06 retain their
recorded Docker-free contract or static/unit cooperative-host closure. The
construction constants for both receipt digests, both input aggregates, and
the constructor source remain `null`; build/runtime approvals remain `false`;
every `evidenceReview` remains `not-performed`. This contract does not change
those values.

Historical M0 images/results, retained Docker state, stdout bundles, caches,
home directories, global installations, and the fixed construction/result
roots are not input sources. Neither producer may repair, reuse, delete, or
inspect them.

## M2A-IB01 — exact credential-empty npm acquisition authority

### Separately authorized future command

The only future npm producer candidate is this argument-free repository entry:

```text
/usr/bin/node experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs
```

Its cwd is the repository root, `shell` is unavailable, and its environment is
exactly empty. It accepts no argument, stdin, caller path, URL, version,
registry, proxy, certificate override, credential, token, cookie, npm config,
home, cache, output root, timeout, retry, or redirect policy. Importing the
entry and all supporting modules is side-effect-free.

This command is not approved by this contract. A later review must bind the
implementation bytes and exact invocation before a person explicitly
authorizes the external dependency-acquisition occurrence. Standing
authorization does not authorize that external communication.

### Exact HTTPS request plan

The producer performs exactly two sequential in-process Node HTTPS GET
requests and spawns no child:

```text
metadata:
https://registry.npmjs.org/npm/12.0.1

tarball:
https://registry.npmjs.org/npm/-/npm-12.0.1.tgz
```

Both use hostname and TLS server name `registry.npmjs.org`, port `443`,
`rejectUnauthorized: true`, minimum TLS `1.2`, no client certificate, no proxy,
no redirect, no connection reuse, and `Accept-Encoding: identity`. The
metadata request headers are exactly `Accept:
application/vnd.npm.install-v1+json`, `Accept-Encoding: identity`, and
`Connection: close`; the tarball request changes only `Accept` to
`application/octet-stream`. Apart from Node's exact required `Host` header, no
authorization, cookie, user agent, referrer, or arbitrary header is sent. Only
normal name resolution needed for that exact hostname and these two HTTPS
responses are inside the future network boundary.

Each request has a 30,000 ms absolute deadline, a 250 ms destroy grace, and a
1,000 ms final request/response close deadline. Metadata is bounded to
1,048,576 bytes and the tarball to 67,108,864 bytes. Status must be exactly
`200`; content encoding must be absent or `identity`; metadata content type is
exactly `application/json` or `application/vnd.npm.install-v1+json`, with an
optional UTF-8 charset; tarball content type is exactly
`application/octet-stream`. When present, a decimal `Content-Length` must equal
the observed byte count and stay within the same bound. Redirects,
authentication challenges, partial content, extra requests, deadline/size
overflow, stream error, early EOF, or unknown close settlement fail closed. No
request is retried.

The metadata bytes are untrusted input. The producer parses one ordinary JSON
object and requires exact selected values `name: "npm"`, `version: "12.0.1"`,
`dist.tarball` equal to the fixed tarball URL above, and a canonical
`sha512-...` `dist.integrity`. It streams the tarball to one held descriptor
while calculating SHA-512 and SHA-256, then requires the computed SHA-512 SRI
to equal that metadata integrity before publication. The actual integrity,
byte length, and SHA-256 are observation fields unknown in this contract and
must later be independently bound; they are never caller-selected.

The producer does not invoke npm, extract the tarball, import package bytes,
run `pack`, `install`, `approve-builds`, `rebuild`, or any lifecycle, and does
not contact a package script, package registry fallback, loopback service, or
Unix socket. Its bounded terminal output is only a fixed success or sanitized
`M2A_INPUT_*` failure code and never includes response bytes, URLs beyond the
fixed public endpoint, headers, paths, hashes, integrity, environment data, or
errors.

## M2A-IB02 — atomic npm archive and canonical receipt publication

Before the first HTTPS request, the final acquisition root and its exact
staging names must be absent. The producer exclusively creates the final root
as an effective-user-owned, one-link, non-symlink mode-`0700` directory. A
present or uncertain root consumes the candidate without read, overwrite,
cleanup, or retry.

The only in-progress children are:

```text
npm-12.0.1.tgz.next
acquisition.next
```

The archive staging file is exclusively created mode `0600`, written only from
the bounded tarball response, synced, reread completely through the same
no-follow descriptor, compared to the streamed byte count/SHA-256/SHA-512,
changed to mode `0444`, revalidated, and closed with known settlement before it
is renamed to `npm-12.0.1.tgz`. No directory entry or archive byte is accepted
as a package script or executable input during this phase.

The receipt is exactly one canonical JSON line with these ordered keys:

```text
schemaVersion, generation, packageName, version, tarballSize,
tarballSha256, integrity, status, scriptsRun, credentialsUsed,
externalNetworkPhase, evidenceReview
```

Its fixed values are:

```text
schemaVersion = "m2a-transfer-acquisition/v1"
generation = "20260721-01"
packageName = "npm"
version = "12.0.1"
status = "complete"
scriptsRun = false
credentialsUsed = false
externalNetworkPhase = "dependency-acquisition-only"
evidenceReview = "not-performed"
```

`tarballSize`, `tarballSha256`, and `integrity` are the same held archive and
metadata observations above. `acquisition.next` follows the same exclusive
mode-`0600` write, sync, same-descriptor reread, byte comparison, mode-`0444`
change, identity revalidation, known close, and exact rename protocol. The
held acquisition directory is synced after each rename. Success leaves exactly
the two final mode-`0444`, one-link regular files and no staging child.

Any filesystem, stream, metadata, digest, sync, rename, identity, or close
failure retains the exact reached state as non-evidence, launches no later
request or producer, and permits no cleanup or retry. Visibility is not review:
the receipt deliberately remains `evidenceReview: "not-performed"`. Only a
later fresh read-only input-result review may bind the canonical receipt digest,
archive SHA-256, registry SRI, exact inventory shape, and root identities for a
future constructor update.

## M2A-IB03 — exact offline constructor-toolchain source closure

### Separately reviewed future command

The only future toolchain producer candidate is:

```text
/usr/bin/node experiments/npm12-install/scripts/capture-m2a-transfer-toolchain.mjs
```

It is argument-free, runs from the repository root with an exactly empty
environment, accepts no stdin or caller authority, and performs no external,
loopback, or Unix-socket communication. It spawns no child and invokes no npm,
compiler, package script, lifecycle, constructor, production entry, or Docker
command. Import remains side-effect-free.

This contract does not authorize the command or reads of the future host
runtime/package inputs. A later implementation review must bind the entry and
supporting bytes, and a separate exact execution gate must authorize only the
fixed `/usr/bin/node` and repository-local package roots below.

### M2A-IBR02 remediation — durable pre-source toolchain occurrence

One separate fixed attempt root is the exclusive durable attempt authority:

```text
experiments/npm12-install/.work/m2a-transfer-toolchain-attempt-20260721-01/
  attempt.next
  attempt.json
```

Before the first fallible `/usr/bin/node`, process-report, tracked-source, or
installed-package read, the producer holds the repository-relative ancestor
chain with no-follow directory descriptors and requires stable directory type,
full mode, effective owner/group, link count, and BigInt device, inode, size,
and mtime identity. It requires both the attempt-root name and fixed toolchain-
root name to be absent without inspecting either root. Only after that held-
parent absence preflight, it issues exactly one synchronous, non-recursive,
exclusive `mkdirSync` for
`experiments/npm12-install/.work/m2a-transfer-toolchain-attempt-20260721-01`
with mode `0700`. This initial primitive has no timeout, cancellation,
callback, promise, child, backend result, or other returned settlement-unknown
outcome.

The atomic directory commit, not call issuance or an in-memory decision, starts
the producer occurrence. Normal synchronous return means the root was created
and the occurrence started. `EEXIST`, or a preflight that cannot prove both
fixed names absent, means an existing durable occurrence wins; the invocation
stops from the held parent without opening or inspecting either root. Any other
synchronous `mkdirSync` error is a known no-create terminal for that invocation
and starts no occurrence. Process loss is not a returned outcome: loss before
the atomic commit leaves the root absent and starts no occurrence, while loss
at or after commit leaves the root present and consumes the generation.

After normal return, the producer opens and holds the root with no-follow
semantics, correlates the new child to the held parent by exact lexical name and
identity, and syncs the held parent. Every open, identity, parent-sync,
checkpoint-write, file-sync, reread, mode, close, rename, or root-sync failure
after the directory commit retains the attempt root as the durable non-evidence
occurrence. No failure after commit permits cleanup, repair, resume, or retry,
even if canonical `attempt.json` was never published.

The producer next publishes canonical `attempt.json` before reading any host
or package source. Its ordered schema is:

```text
schemaVersion, generation, state, issue, toolchainReceiptSha256,
inventoryAggregate, evidenceReview
```

The only valid records are:

| State | `issue` | Receipt SHA-256 | Inventory aggregate |
| --- | --- | --- | --- |
| `in-progress` | `M2A_TOOLCHAIN_IN_PROGRESS` | `null` | `null` |
| `failed` | `M2A_TOOLCHAIN_FAILED` or `M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN` | `null` | `null` |
| `complete` | `null` | exact candidate receipt SHA-256 | exact candidate inventory aggregate |

Every row fixes `schemaVersion` to `m2a-transfer-toolchain-attempt/v1`,
`generation` to `20260721-01`, and `evidenceReview` to `not-performed`.
`M2A_TOOLCHAIN_FAILED` represents only a known fail-closed terminal;
`M2A_TOOLCHAIN_SETTLEMENT_UNKNOWN` represents timeout or unknown settlement.
No arbitrary error, path, host identity, source byte, output, or stack enters
the record.

Initial publication and every later state replacement use only
`attempt.next`: exclusive no-follow mode-`0600` creation beneath the held root,
complete write and file sync, same-descriptor byte reread, mode change to
`0444`, exact identity/byte revalidation, known close, an operation-specific
held-root transition, rename to `attempt.json`, and held-root sync. Initial
publication requires `attempt.json` absent; later publication replaces exactly
that previously correlated control file. Every unchanged sibling must retain
its complete identity. No host/package source read begins until the canonical
`in-progress` record and root sync settle.

Any later invocation that observes the attempt root present, or cannot
establish its absence, stops from the held parent without opening or inspecting
the attempt or toolchain root and without cleanup, repair, resume, or retry. A
failure after attempt-root creation first attempts one terminal checkpoint
replacement; if that replacement is unknown, the already synced `in-progress`
checkpoint remains the durable non-evidence occurrence. Thus a host/source
failure may leave the fixed toolchain root absent while the separate attempt
root durably consumes the generation, and a second invocation still stops. A
visible `attempt.json`, including `complete`, is never reviewed input by itself.
Conversely, a root absent after a known no-create result or process loss before
the atomic commit represents a never-started generation, so a later invocation
may attempt the single atomic commit for the first actual occurrence.

### Runtime closure

The fixed runtime source is `/usr/bin/node`. The producer must establish exact
version `v20.18.2`, platform `linux`, architecture `x64`, one-link regular-file
identity, full mode `0555`, positive bounded size, and stable same-descriptor
SHA-256 before any output. A different version/path/type/mode/link, symlink,
sparse file, replacement, or uncertain descriptor settlement is unsupported
and stops before runtime/package destination creation; no alternate Node
executable is allowed.

The complete toolchain producer has a 120,000 ms absolute deadline and a
1,000 ms final owned-descriptor close bound. The runtime report may contain at
most 256 unique shared-object paths; each runtime or package file is bounded to
67,108,864 bytes, each runtime/package family to 536,870,912 bytes, the whole
copied inventory to 1,073,741,824 bytes and 50,000 rows, each logical path to
1,024 UTF-8 bytes and 64 components, and canonical `toolchain.json` to
4,194,304 bytes. Any overflow becomes an unknown/failed non-candidate and
permits no publication or retry.

Before capturing its own runtime report, the producer imports the same fixed
Node built-ins used by the reviewed construction module: `node:buffer`,
`node:child_process`, `node:crypto`, `node:fs`, `node:fs/promises`, `node:path`,
`node:timers`, `node:url`, `node:util`, and `node:zlib`. It then consumes only
the dense own-string `process.report.getReport().sharedObjects` array from that
same process. It does not inspect `/proc`, enumerate system directories, read
the environment/home, or discover another process.

Each reported absolute shared-object path is opened directly with no-follow,
must be a stable regular non-sparse file, and is read once through its held
descriptor. Duplicate paths, duplicate device/inode identities, basenames that
cannot be represented as one safe lexical component, a path outside the report,
or any changed identity rejects. Source absolute paths and device/inode values
are private correlation data and are not serialized.

The receipt's runtime inventory begins with logical row
`runtime/constructor-node`, which binds the live `/usr/bin/node` size, mode,
and SHA-256 and has no duplicate file beneath the toolchain root. Shared
objects are copied as mode-`0444`, one-link regular files under deterministic
logical names `runtime/shared/<three-digit-index>-<basename>`, where the index
is assigned after sorting the private source paths by exact bytewise lexical
order. The future review must reject any missing, extra, duplicate, reordered,
or source-disconnected runtime row.

### TypeScript package closure

The only package sources are these exact repository-local installed roots:

```text
node_modules/typescript
node_modules/@types/node
node_modules/undici-types
```

After durable in-progress checkpoint publication and before any runtime/package
destination creation, the producer reproduces the fixed 41-row tracked
aggregate and the exact lockfile package tuples already fixed by the
construction contract:

| Name | Version | Integrity |
| --- | --- | --- |
| `typescript` | `5.9.3` | `sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==` |
| `@types/node` | `20.19.43` | `sha512-6oYBAi5ikg4Pl+kGsoYtawUMBT2zZMCvPNF7pVLnHZfd1zf38DRiWn/gT01RYCdUqkv7Fhr+C9ot4/tb+2sVvA==` |
| `undici-types` | `6.21.0` | `sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==` |

#### M2A-IBR01 source-completeness remediation

Each root must contain the matching ordinary canonical `package.json` and a
complete lexically traversed tree under the private held-directory transaction
below. Only stable nonempty regular, non-sparse, one-link files are admitted;
symlinks, hard-link aliases, special files, accessor/inherited fake data,
duplicate/case-colliding paths, path escape, unknown settlement, and any file
outside the three roots reject. Directories are traversal structure, not
implicit receipt input, but their complete identities and entry sets are
mandatory private completeness data.

The producer opens each package root and every nested source directory from
its already held lexical parent, never by reopening a pathname. Every held
directory row binds the package family, exact logical relative path, exact
lexical parent row and single-component name, directory type, full mode,
effective owner/group, link count, and BigInt device, inode, size, and mtime.
Every child entry is enumerated in exact bytewise lexical order through that
same authority. Before and after each enumeration and child classification,
the parent descriptor must retain the complete identity; every nested
directory is held by its own no-follow descriptor, and every admitted file is
held by one no-follow descriptor with the same complete regular-file identity.

The first traversal produces one complete ordered private graph of all source
directory and file rows under the three roots. It admits no inaccessible or
uncertain child, duplicate logical or device/inode identity, cross-name alias,
unknown type, or entry outside that graph. After every admitted source file is
held, and before creating any runtime/package destination directory or copied
file, the producer performs a second complete bytewise lexical traversal
through the same held directory descriptors. It compares the complete ordered
directory/file graph, parent/name relation, type, full mode, owner/group, link
count, and BigInt identity to the first graph and separately revalidates every
held file descriptor. Added, removed, renamed, reparented, aliased, reordered,
replaced, inaccessible, or uncertain data rejects before toolchain output
creation; matching held file identities without an identical directory graph
is insufficient. All source-directory closes then settle known before output;
the admitted file descriptors remain held through their copy transactions.

Every admitted file is copied through its held source descriptor to exactly
one mode-`0444`, one-link regular file under the corresponding logical prefix:

```text
packages/typescript/
packages/@types/node/
packages/undici-types/
```

No root `node_modules` path is serialized. No dependency is installed,
repacked, normalized semantically, executed, or resolved through a cache,
global installation, home, alternate workspace, historical image, or network.

## M2A-IB04 — atomic toolchain inventory and canonical receipt publication

### M2A-IBR01 destination-completeness remediation

After the durable checkpoint and complete second source traversal settle, the
producer exclusively creates the still-absent fixed toolchain root as mode
`0700`, opens and holds it with no-follow semantics, correlates its exact
lexical name and complete identity from the held `.work` parent, and syncs that
parent. It then creates and holds exactly these mode-`0700` destination
directories, one child at a time beneath an already held no-follow parent:

```text
runtime/
runtime/shared/
packages/
packages/typescript/
packages/@types/
packages/@types/node/
packages/undici-types/
```

Every directory creation is bracketed by exact held-parent inventories. The
parent retains type, full mode, owner/group, link count, device, and inode;
only its operation-caused size/mtime transition may change. The new child must
have its expected lexical name, directory type, mode `0700`, effective owner/
group, link count, and unique BigInt identity. Every unchanged sibling retains
its complete type, full mode, owner/group, link, device, inode, size, and mtime
identity before the new baseline is adopted. Unknown settlement makes the
affected authority unusable and permits no later publication.

Copied files are first written to their fixed sibling `<final-name>.next`
names mode `0600`, synced, reread through the same descriptor, checked against
their held source bytes/size/SHA-256, changed to final mode `0444`, revalidated,
closed with known settlement, and renamed exactly once without replacement.
The same operation-specific held-parent transition proves only the expected
staging addition and exact-identity staging-to-final rename while preserving
all unchanged siblings. Each containing directory is synced before the next
source transition. Each held source descriptor then closes known. No existing
inventory file is replaced.

After every copied-file rename and source/copy descriptor close settles, the
producer constructs one lexical inventory containing exactly four disjoint
families: `runtime/`, `packages/typescript/`, `packages/@types/node/`, and
`packages/undici-types/`. Every row has ordered keys
`logicalPath, mode, size, sha256`. It is sorted by exact logical path, has no
duplicate or alias, and contains no directory, source absolute path, uid/gid,
device/inode, mtime, environment value, cache path, or error.

Before any `toolchain.next` byte is serialized, the producer performs one
complete traversal through the same held toolchain-root and destination-
directory descriptors; reopening a pathname is not a completeness barrier.
The ordered physical graph must contain exactly the seven directory rows above
and one mode-`0444` copied file for every receipt inventory row except the
virtual live `runtime/constructor-node` row. It contains no control object,
`*.next`, `toolchain.next`, `toolchain.json`, extra, missing, or disconnected
entry. The separate attempt root and its checkpoint are not toolchain inventory
children.

That final traversal repeats every held parent/name, type, full-mode, effective
owner/group, link, and BigInt device/inode/size/mtime comparison. Every copied
file must reproduce the exact unique identity, final mode, one-link state,
size, and SHA-256 retained by its write/copy transaction and map to exactly one
canonical inventory row. The virtual live Node row must map to no root child.
A missing, extra, replaced, renamed, aliased, staging, disconnected,
inaccessible, reordered, or uncertain row stops before receipt construction.
Receipt rows derived from copy operations without this complete held-root
comparison are invalid.

`toolchain.json` is exactly one canonical JSON line with ordered top-level
keys:

```text
schemaVersion, generation, runtime, packages, inventory,
inventoryAggregate, status, evidenceReview
```

It preserves the complete `m2a-transfer-toolchain/v1` nested schema and values
fixed by the construction contract. Runtime key order is
`logicalId, version, platform, architecture, executableSize,
executableSha256, loadedRuntimeInventoryAggregate`; package rows retain
`name, version, integrity, inventoryAggregate` in the table order above.
Every aggregate is SHA-256 over the exact canonical JSON bytes of its complete
ordered row array. `status` is `complete` and `evidenceReview` is
`not-performed`.

`toolchain.next` is the sole receipt staging name. It follows the exact
mode-`0600` write/sync/same-descriptor reread/mode-`0444`/revalidate/known-close/
rename protocol and the held root is synced afterward. Success leaves only
mode-`0444` `toolchain.json`, the seven fixed directories, and the exact copied
inventory files in the toolchain root; no staging or attempt object remains
there. The live `runtime/constructor-node` row deliberately has no duplicate
root file because the reviewed constructor maps it to `/usr/bin/node`.

After `toolchain.json` and the held-root sync settle, the producer atomically
replaces the separate attempt root's `attempt.json` with the canonical
`complete` state whose two digest fields equal that exact receipt and inventory.
The success checkpoint uses the same held attempt root and `attempt.next`
transaction and is the final producer mutation. If receipt or success-
checkpoint publication fails or is uncertain, both reached roots are retained
as a non-evidence failure/unknown occurrence; a visible complete receipt
without the correlated complete checkpoint is not a candidate.

Any runtime report, source, traversal, copy, identity, aggregate, receipt,
sync, close, or rename failure retains the exact reached root as non-evidence
and permits no cleanup, retry, construction, or other producer. A fresh
read-only input-result review must later correlate the receipt to the same live
Node identity and complete copied files before any reviewed digest may replace
the constructor's current `null` bindings.

## M2A-IB05 — one-shot failure, review, and evidence separation

Contract intent, a producer implementation, external npm transport, offline
toolchain capture, visible input roots, independently accepted input bytes,
construction, image binding, runtime execution, result acceptance, and
`Observed` evidence are distinct classes.

- Each producer has at most one occurrence for generation `20260721-01` and
  never retries, repairs, resumes, cleans, or overwrites. For the toolchain,
  the separate exclusive attempt root plus canonical `attempt.json` transaction
  above is the durable occurrence before any fallible host/package source read.
- A failed or uncertain producer establishes no reviewed input. A visible
  partial root is retained and blocks later use.
- Producer success leaves `evidenceReview: "not-performed"`; it is a candidate,
  not a construction prerequisite, until a fresh independent input-result
  review binds it.
- Reviewing one candidate does not approve, execute, or repair the other.
  Construction remains closed until both exact candidates are independently
  accepted and a later bounded source update records their digests.
- Neither producer consumes the one-shot runtime tuple or changes historical
  M0/M2-A, M3, profile, matrix, presentation, Expected, or `Observed` state.

No persisted record contains response or package contents, raw output,
credentials, environment data, source absolute shared-object paths, home/cache
paths, host identities, stack traces, or unsanitized errors. This boundary is
still cooperative-host: another same-authority process, runtime/library drift,
filesystem failure, DNS/TLS infrastructure failure, or kernel failure can
leave the input generation unsupported or Inconclusive.

## M2A-IB06 — later implementation and verification allowlist

### M2A-IBR03 actual-consumer remediation boundary

A positive fresh contract review may approve one Docker-free static/unit
implementation limited to:

```text
experiments/npm12-install/scripts/m2a-transfer-inputs.mjs
experiments/npm12-install/scripts/m2a-transfer-inputs.d.mts
experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs
experiments/npm12-install/scripts/capture-m2a-transfer-toolchain.mjs
experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs
experiments/npm12-install/scripts/m2a-transfer-construction.mjs
experiments/npm12-install/scripts/m2a-transfer-construction.d.mts
tests/m2a-evidence-transfer.test.ts
experiments/npm12-install/README.md
docs/m2-a-evidence-transfer-dependency-input-boundary.md
docs/m2-a-evidence-transfer-construction-execution-gate.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md
prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md
```

The two existing construction paths may change only at the actual
`validateConstructorToolchain()` consumer boundary and its declaration. That
consumer must require the sole `runtime/constructor-node` row to have mode
exactly `0555`; every other `runtime/` row and every package row to have mode
exactly `0444`; and every package row to have size greater than zero. These
three relations do not change any other constructor schema, aggregate,
reviewed-binding, or execution behavior. Root package scripts, lockfiles,
manifests, Containerfiles, container sources, adapter/probe/package source,
fixtures, scenarios, other existing construction/production entries,
declarations outside the two listed modules, historical or result paths,
Expected, and `Observed` remain unchanged.

Tests must use only in-memory untrusted metadata/tarball chunks, synthetic
archives/package trees/runtime reports, temporary repository-owned roots, and
separately branded fake HTTPS/filesystem/process-clock backends. They must not
import either production entry, access a fixed ignored input/construction/
result root, read `/usr/bin/node` or installed package bytes, resolve DNS, open
a socket, use external network, spawn a child, run npm/compiler/lifecycle/
constructor code, or call Docker.

Focused negative coverage must include arguments/environment; wrong request
order/host/port/TLS/header/redirect/status/encoding/deadline/size/EOF/close;
metadata/version/tarball/integrity drift; archive/receipt byte, mode, path,
identity, ordering, partial-publication, and late-close drift; Node version/
platform/architecture/mode/link/report/runtime-row drift; package version/
integrity/path/tree/type/link/sparse/duplicate/case/order/hash drift; source
entry add/remove/rename/reparent, directory/file replacement or alias, and
first/second traversal disagreement; destination extra/missing/staging/
disconnected rows; checkpoint create/write/sync/reread/mode/close/rename/root-
sync failure; synchronous known no-create and `EEXIST`; process loss immediately
before and immediately after the atomic directory commit; process loss before
initial checkpoint publication; every post-commit open/identity/sync/checkpoint
failure; a fresh invocation after each root-absent and root-present case; and
rejection of any backend or contract projection that returns `unknown` from
initial creation; source-to-copy disconnection; receipt/aggregate/schema drift;
every wrong per-family mode and a zero-length package row through the actual
constructor consumer; present roots; post-failure action; retry/cleanup; import
effects; construction reachability; and any evidence or reviewed-binding
promotion.

The implementation task must save its exact implementation and fresh review
prompts before source changes. Its review remains Docker-free and may approve
only later, separately gated producer executions. Because npm acquisition uses
external communication and toolchain capture reads the fixed host runtime,
neither execution is covered by standing authorization.

## Contract-task evidence and handoff

This task used only tracked repository documentation and source needed to fix
the future boundary. It did not access either fixed input root, root installed
package bytes, `/usr/bin/node` bytes or runtime report, the construction/result
roots, credentials, environment, cache/home paths, historical result contents,
external network, Docker/runtime state, or a runtime socket. It did not acquire,
capture, construct, compile, execute, transfer, publish evidence, or use
standing authorization.

No actual registry integrity, archive byte length/SHA-256, receipt digest,
runtime closure, package inventory, inventory aggregate, or reviewed binding is
claimed by this contract. Those remain future candidate observations behind
their own execution and result-review gates.

Next: perform the fresh independent Docker-free read-only dependency-input
boundary contract review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-review.md`;
do not acquire or inspect npm/toolchain bytes, use external communication,
execute either producer, construct a context or image, call Docker, or access
runtime/result state.

## Fresh contract review decision

The independent Docker-free review in
[`reviews/m2-a-evidence-transfer-dependency-input-boundary.md`](reviews/m2-a-evidence-transfer-dependency-input-boundary.md)
closes M2A-IB01/M2A-IB02 at contract scope and records `BLOCKED` on M2A-IB03
through M2A-IB06. The npm command/transport and acquisition archive/receipt
transaction are exact without authorizing external communication. Three
toolchain residuals remain:

1. source-package directory completeness and the final copied tree are not
   bound through exact held-directory identities and a second traversal;
2. fallible toolchain validation occurs before any durable one-shot attempt
   object exists; and
3. the existing construction consumer accepts wrong inventory modes and an
   empty package row, while the proposed implementation allowlist cannot
   remediate that consumer.

The review reproduced the exact 31-row and 41-row aggregates and current pure
receipt schemas without accessing either fixed input root or future input
bytes. It did not use external communication, execute either producer, access
host runtime/package bytes, construct an image, call Docker, access runtime/
result state, promote evidence, or use standing authorization.

Next: save the exact bounded Docker-free M2A-IBR01 through M2A-IBR03 contract-
remediation prompt and fresh independent re-review prompt; do not acquire or
inspect npm/toolchain bytes, execute either producer, construct a context or
image, call Docker, or access runtime/result state.

## M2A-IBR01 through M2A-IBR03 contract-remediation prompt handoff

The exact bounded Docker-free contract-remediation prompt is saved at
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-remediation.md`,
and its fresh independent re-review prompt is saved at
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation-review.md`
before any contract repair. The pair preserves closed M2A-IB01/M2A-IB02 and
fixes the later task to only complete held-directory/second-traversal source
and destination correlation, one durable pre-source toolchain occurrence, and
the exact two construction consumer paths needed to reject the three selected
wrong-mode/empty-row classes.

This prompt-only task changed no contract implementation, declaration, test,
static verifier, package script, lockfile, manifest, Containerfile/container,
adapter/probe/package, fixture, scenario, input, construction, image, Docker,
transfer, runtime/result, historical, Expected, or `Observed` byte. No fixed
ignored root, future input, host runtime/package byte, credential, environment,
or network was accessed, and standing authorization was not used. M2A-IB03
through M2A-IB06 remain open pending the exact remediation and fresh re-review.

Next: perform the exact bounded Docker-free M2A-IBR01 through M2A-IBR03
contract remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-remediation.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## M2A-IBR01 through M2A-IBR03 contract remediation

The bounded Docker-free remediation now fixes one complete private held-
directory graph and same-authority second traversal for all three package
roots, plus one complete held-destination traversal before receipt
serialization. It also fixes a separate attempt root and canonical
`attempt.json` as the durable occurrence before fallible host/package reads,
with exact in-progress/failure/unknown/complete transitions and a no-inspection
second-invocation terminal. M2A-IB01/M2A-IB02 and all fixed values remain
unchanged.

The later M2A-IB06 implementation allowlist adds only
`m2a-transfer-construction.mjs` and its declaration so the actual
`validateConstructorToolchain()` consumer can enforce live Node mode `0555`,
copied runtime/package mode `0444`, and positive package size. No implementation
or producer execution is approved by these contract bytes. M2A-IB03 through
M2A-IB06 remain open pending fresh independent re-review of M2A-IBR01 through
M2A-IBR03.

This remediation used only repository-controlled documentation and tracked
source inspection. It did not access either fixed input root, future npm or
toolchain bytes, `/usr/bin/node` bytes or a process report, installed package
bytes, credentials, environment, home/cache, external communication,
construction, image, Docker/runtime state, transfer, result state, evidence,
Expected, or `Observed`. No standing authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-IBR01 through
M2A-IBR03 contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation-review.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## M2A-IBR01 through M2A-IBR03 contract-remediation re-review

The fresh independent Docker-free review in
[`reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation.md`](reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation.md)
closes M2A-IBR01 and M2A-IBR03 at contract scope. Both complete package-source
traversals and the complete pre-receipt destination traversal now use the same
held directory authority, and the later allowlist reaches only the actual
constructor validator/declaration needed for the selected mode/size rules.

M2A-IBR02 remains open on one narrower durability contradiction. An unknown
attempt-root creation is declared generation-consuming, but if it leaves the
root absent, a fresh invocation can establish both fixed roots absent and
start again because no durable object represents the prior uncertainty.
M2A-IB01/M2A-IB02 remain closed; M2A-IB03 through M2A-IB06 remain open, and no
producer implementation or execution is approved.

The review reproduced the exact 31-row/41-row aggregates, package tuples,
receipt schemas, current consumer acceptance of the three selected negative
classes, and the root-absent unknown-create contradiction without accessing
future input or fixed ignored roots. No external communication, producer,
construction, image, Docker/runtime, transfer, result, evidence, or standing
authorization was used.

Next: save the exact bounded Docker-free M2A-IBR02 unknown-attempt-root-
creation durability remediation prompt and fresh independent re-review prompt;
do not repair the contract in that prompt-only task or access input,
construction, Docker, transfer, or runtime/result state.

## M2A-IBR02 unknown-attempt-root-creation durability prompt handoff

The exact bounded Docker-free residual M2A-IBR02 remediation prompt is saved
at
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md`,
and its fresh independent re-review prompt is saved at
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation-review.md`
before contract repair. The pair preserves M2A-IB01/M2A-IB02 and closed
M2A-IBR01/M2A-IBR03 while fixing the later task to one synchronous exclusive
attempt-root `mkdirSync` commit boundary with no returned settlement-unknown
outcome. Only absence before atomic commit remains never-started; root presence
at or after commit is the durable occurrence.

This prompt-only task changed no contract text above, implementation,
declaration, test, verifier, package script, lockfile, manifest,
Containerfile/container, adapter/probe/package, fixture, scenario, input,
construction, image, Docker, transfer, runtime/result, historical, Expected,
or `Observed` byte. It did not access a fixed ignored root, future input, host
runtime/package byte, credential, environment, external communication, or use
standing authorization. M2A-IBR02 and M2A-IB03 through M2A-IB06 remain open
pending the bounded remediation and fresh re-review.

Next: perform the exact bounded Docker-free residual M2A-IBR02 contract
remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## M2A-IBR02 unknown-attempt-root-creation durability contract remediation

The bounded Docker-free contract now replaces the contradictory root-absent
unknown-create-consumed branch with one synchronous, non-recursive, exclusive
mode-`0700` `mkdirSync` commit for the fixed attempt root after the held-parent
absence preflight. The primitive returns no settlement-unknown result. A known
no-create error or process loss before atomic commit leaves the root absent and
starts no occurrence; normal return or process loss at or after commit leaves
the root present as the durable non-evidence occurrence that blocks every
fresh invocation without inspection.

After commit, the existing held-root identity, parent sync, canonical
`attempt.next`/`attempt.json` in-progress transaction, and later
failed/unknown/complete replacements remain unchanged. Every post-commit
open/identity/sync/checkpoint failure retains the root before any host runtime,
process-report, tracked-source, or installed-package read. M2A-IB01/M2A-IB02
and closed M2A-IBR01/M2A-IBR03 are preserved; M2A-IBR02 and M2A-IB03 through
M2A-IB06 remain open pending fresh independent re-review.

No implementation, declaration, test, static verifier, producer, fixed input,
host runtime/package, external communication, construction, image, Docker,
transfer, runtime/result, evidence, Expected, or `Observed` byte was accessed
or changed. Standing authorization was not used.

Next: perform the fresh independent Docker-free read-only residual M2A-IBR02
contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation-review.md`;
do not repair the contract, acquire or inspect npm/toolchain bytes, execute
either producer, construct a context or image, call Docker, or access
runtime/result state.

## M2A-IBR02 durability contract-remediation re-review

The fresh independent Docker-free review in
[`reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md`](reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md)
closes M2A-IBR02 with no blocking or non-blocking finding. The synchronous
exclusive `mkdirSync` primitive exposes no returned unknown-create result:
absence before atomic commit is never-started, while root presence at or after
commit is the durable non-evidence occurrence that blocks every fresh
invocation without inspection.

M2A-IB01/M2A-IB02 and closed M2A-IBR01/M2A-IBR03 remain preserved. M2A-IB03
through M2A-IB06 now close at contract scope. The decision permits at most the
already fixed Docker-free static/unit implementation boundary after its exact
prompt pair is saved; neither producer execution nor input access is approved.

The review reproduced 31/41 rows and both aggregates, all three package tuples
and schemas, five initial commit/process-loss boundaries, ten post-commit
checkpoint failures, both fresh-invocation durable-state classes, and the
inverse unknown-return/present-retry/absent-consumed contradictions. It used no
fixed ignored root, future input, external communication, producer,
construction, Docker/runtime, transfer, result, evidence promotion, or
standing authorization.

Next: save the exact bounded Docker-free dependency-input implementation prompt
and fresh independent review prompt under the existing M2A-IB06 allowlist; do
not change implementation or access input, external communication,
construction, Docker, transfer, or runtime/result state in that prompt-only
task.

## Dependency-input implementation prompt handoff

The exact bounded Docker-free dependency-input implementation prompt is saved
at
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`,
and its fresh independent implementation-review prompt is saved at
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md`
before any implementation or verification source change. The pair confines
the later task to the unchanged M2A-IB06 allowlist and binds the fixed
credential-empty two-request npm plan, atomic acquisition publication,
synchronous durable toolchain-attempt commit, complete held-authority source
and destination traversals, canonical receipt/checkpoint transactions, exact
constructor-consumer mode/size correction, fake-only inverse matrix, import
safety, and evidence non-promotion.

This prompt-only task changed no implementation, declaration, test, static
verifier, package script, lockfile, manifest, Containerfile/container,
adapter/probe/package, fixture, scenario, input, construction, image, Docker,
transfer, runtime/result, historical, Expected, or `Observed` byte. It did not
access a fixed ignored root, future input, host runtime/package byte,
credential, environment, external communication, or standing authorization.
M2A-IB01 through M2A-IB06 remain closed only at contract scope pending the
bounded Docker-free implementation and fresh review.

Next: perform the exact bounded Docker-free dependency-input static/unit
implementation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`;
do not execute either producer or access input, external communication,
construction, Docker, transfer, or runtime/result state.

## Dependency-input static/unit implementation handoff

The bounded Docker-free M2A-IB01 through M2A-IB06 implementation is complete
under the unchanged allowlist. The side-effect-free input library fixes the
two-request npm plan, canonical acquisition and toolchain records, exact-own-
data validators, separately branded fake backends, one-shot attempt
classification, held source/destination graph comparisons, and private fixed
production operations. The two no-argument producer entries are absent from
package scripts and were inspected only as source. The actual constructor
consumer now requires mode `0555` only for
`runtime/constructor-node`, mode `0444` for every copied runtime/package row,
and positive package sizes.

Focused `npm run m2a:transfer:verify` passes its static verifier and 1 file /
56 tests. Existing `npm run m2a:verify` passes 4 files / 5 tests, and root
typecheck passes. Aggregate `npm test` ran 109 files / 859 tests: the focused
M2-A file passed, while 40 out-of-scope tests failed on existing version-drift,
M2-E CLI, probe-core network-expectation, and M4 control-host cases.
Aggregate `npm run check` stopped at eight pre-existing out-of-scope formatting
warnings under `.serena/` and
`containers/profile-control/test/control-host-backend.test.ts`.

These are Docker-free static/unit observations, not producer, input,
construction, image, runtime, result, or `Observed` evidence. Neither producer
was imported or executed; no fixed input/construction/result root, live
`/usr/bin/node` or installed-package byte, external communication, Docker,
transfer, reviewed binding, evidence promotion, or standing authorization was
used. Producer execution remains separately gated.

Next: perform the fresh independent Docker-free read-only dependency-input
implementation review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md`;
do not repair source or tests in that review or execute either producer,
access input, use external communication, construct an image, call Docker, or
access runtime/result state.

## Dependency-input implementation review decision

The fresh independent Docker-free review in
[`reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`](reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation.md)
records `BLOCKED`. M2A-IB01, M2A-IB02, M2A-IB04, and M2A-IB05 close at
Docker-free static/unit implementation scope. M2A-IB03 and M2A-IB06 remain
open on M2A-IBI01/M2A-IBI02.

M2A-IBI01 records that production closes the held `WORK_ROOT` descriptor after
the synchronous attempt-root commit without correlating the committed child
identity, then reopens parent/root paths for sync and checkpoint publication.
The fake's explicit open/correlate/sync steps therefore have no matching
production decision. M2A-IBI02 records missing required inverse coverage,
including every package-family wrong-mode/zero-size case and the fixed
runtime/report/package-graph negative matrix.

Focused transfer verification passes 1 file / 56 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests observed 99 passing / 10 failing files and 820 passing / 39 failing
tests; the focused M2-A file passed, while out-of-scope failures remained.
Aggregate `check` stops at eight existing formatting warnings. No
implementation repair, producer import/execution, input/fixed-root access,
external communication, construction, Docker, transfer, runtime/result,
evidence promotion, or standing authorization occurred in the review.

Next: save the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation-remediation prompt and fresh independent re-review prompt; do
not repair implementation or tests or execute either producer in that
prompt-only task.

## M2A-IBI01/M2A-IBI02 remediation prompt handoff

The exact bounded Docker-free implementation-remediation prompt is saved at
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`,
and its fresh independent re-review prompt is saved at
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation-review.md`
before source or test repair. The pair preserves closed M2A-IB01, M2A-IB02,
M2A-IB04, and M2A-IB05 and limits the later task to M2A-IBI01's held attempt-
parent/child correlation through initial checkpoint settlement and
M2A-IBI02's missing behavioral runtime/source/destination/every-package-family
inverse matrix.

This prompt-only task changed no implementation, declaration, test, static
verifier, producer, fixed input, host runtime/package, package script,
lockfile, manifest, Containerfile/container, adapter/probe/package, fixture,
scenario, construction, image, Docker, transfer, runtime/result, historical,
evidence, Expected, or `Observed` byte. It used no external communication,
fixed ignored root, credential, environment, or standing authorization.
M2A-IB03/M2A-IB06 remain open at implementation scope pending remediation and
fresh re-review.

Next: perform the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`;
do not import or execute either producer, access input, use external
communication, construct an image, call Docker, or access runtime/result
state.

## M2A-IBI01/M2A-IBI02 implementation remediation handoff

The bounded Docker-free remediation candidate preserves one original held
`WORK_ROOT` descriptor across the synchronous exclusive attempt-root commit,
opens and correlates the exact lexical child with no-follow semantics, validates
the complete parent path/descriptor and before/after child inventories through
one production/fake decision boundary, and syncs the original parent before
settlement. The same held child remains authoritative for exclusive
mode-`0600` `attempt.next`, complete write/sync/same-descriptor reread,
mode-`0444`, exact identity revalidation, known close, non-replacing rename,
held-root sync, and final child/parent close.

The shared runtime boundary now cross-binds executable/report rows to the exact
copied runtime inventory. Source and destination graph validators reject full
type/mode/owner/link/sparse/order/path/identity/copy contradictions. Focused
tests exercise every fixed package tuple and traversal family, final
destination contradictions, and all eight independently rebuilt
`validateConstructorToolchain()` mode/size cases.

Focused transfer verification passes 1 file / 60 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests observed 99 passing / 10 failing files and 824 passing / 39 failing
tests, with all 60 focused M2-A tests passing. These are Docker-free
static/unit cooperative-host observations only. Aggregate `npm run check`
exits during formatting on eight pre-existing out-of-scope warnings before
lint, typecheck, or tests.

No producer was imported or executed. No fixed input or ignored root, live
host runtime/package byte, environment, external communication, construction,
image, Docker, transfer, runtime/result, reviewed input, evidence promotion,
`Observed`, or standing authorization was used. M2A-IBI01/M2A-IBI02 and
M2A-IB03/M2A-IB06 remain open pending fresh independent re-review;
M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain reviewed implementation-scope
closure.

Next: perform the fresh independent Docker-free read-only
M2A-IBI01/M2A-IBI02 remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation-review.md`;
do not repair source or tests, import or execute either producer, access
input, use external communication, construct an image, call Docker, or access
runtime/result state.

## M2A-IBI implementation-remediation re-review decision

The fresh independent Docker-free re-review in
[`reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`](reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md)
is `BLOCKED` only on residual M2A-IBI01. M2A-IBI02 closes after reproducing the
production-consumed runtime, source, destination, every-package-family, and
actual-constructor inverse matrix. M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain
their Docker-free static/unit implementation-scope closure.

The fake `attempt-parent-sync` value is checked only as a generic marker and
discarded before `validateAttemptRootCommitTransition()` receives hard-coded
`parentSynced: true`. The shared attempt identity also narrows BigInt size
through `Number`. M2A-IBI01 and M2A-IB03/M2A-IB06 therefore remain open. No
producer, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, reviewed input,
evidence promotion, `Observed`, or standing authorization was used.

Next: save the exact bounded Docker-free residual M2A-IBI01 parent-sync and
BigInt-identity remediation prompt plus fresh independent re-review prompt; do
not repair implementation or tests in that prompt-only task.

## Residual M2A-IBI01 remediation prompt handoff

The exact bounded Docker-free residual-remediation prompt is saved at
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md`,
and its fresh independent re-review prompt is saved at
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md`
before source or test repair. The pair limits the later task to the existing
dependency-input support/declaration, static verifier, focused test, and
minimal status allowlists. It requires one exact-own-data parent-sync fact to
reach the same production/fake transition and one exact non-narrowed
BigInt-derived representation for device, inode, size, and mtime.

This prompt-only task changed no implementation, declaration, test, static
verifier, producer, fixed input, host runtime/package, construction, image,
Docker, transfer, runtime/result, evidence, Expected, or `Observed` byte. It
used no external communication or standing authorization. M2A-IBI02 and
M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 remain closed at their recorded scopes;
M2A-IBI01/M2A-IB03/M2A-IB06 remain open pending residual remediation and fresh
independent re-review.

Next: perform the exact bounded Docker-free residual M2A-IBI01 parent-sync and
BigInt-identity remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md`;
do not import or execute either producer, access input, use external
communication, construct an image, call Docker, or access runtime/result
state.

## Residual M2A-IBI01 remediation handoff

The bounded Docker-free candidate now carries one exact-own-data parent-sync
record through the same private production/fake decoder into
`validateAttemptRootCommitTransition()`. BigInt-derived device, inode, size,
and mtime use one canonical nonnegative decimal-string representation without
`Number(stat.size)`. Focused behavior accepts a size above
`Number.MAX_SAFE_INTEGER` unchanged and rejects false/missing/extra/reordered/
inherited/accessor/symbol/proxy sync facts plus precision-colliding, numeric,
BigInt, signed, fractional, exponent, whitespace, empty, leading-zero, and
path/descriptor/committed-child identity contradictions before checkpoint or
source reads.

Focused transfer verification passes 1 file / 61 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests observed 99 passing / 10 failing files and 825 passing / 39 failing
tests; aggregate `check` stops on eight out-of-scope formatting warnings.
M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain reviewed static/unit
closure. M2A-IBI01 and M2A-IB03/M2A-IB06 remain open pending fresh independent
re-review.

No producer entry, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, reviewed input,
evidence promotion, `Observed`, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only residual M2A-IBI01
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md`;
do not repair implementation or tests or execute either producer in that
review.

## Residual M2A-IBI01 remediation re-review decision

The fresh independent Docker-free re-review in
[`reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md`](reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md)
is `BLOCKED` only on M2A-IBI01R01/M2A-IBI01R02. The current production and
branded-fake paths consume one exact-own parent-sync fact, and current
production identity retains device, inode, size, and mtime as canonical
BigInt-derived decimal strings. The focused suite, however, does not submit
exact-key-shape attempt identities, while the static verifier requires and
protects only the size encoding rather than all four encodings.

M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain Docker-free
static/unit implementation closure. M2A-IBI01/M2A-IB03/M2A-IB06 remain open
only on those two verification findings. All contract decisions, null reviewed
construction bindings, false execution approvals, and candidate/evidence
separation remain unchanged.

No producer, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, evidence, Expected,
`Observed`, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-IBI01 identity-shape/static-
verifier remediation prompt and fresh independent re-review prompt; do not
repair source or tests in that prompt-only task.

## M2A-IBI01 identity-verification prompt handoff

The exact bounded Docker-free M2A-IBI01 identity-verification remediation and
fresh independent re-review prompt pair is saved before verifier or focused-
test repair. The later task may change only the static verifier, focused test,
and minimal status allowlist. It must submit missing, extra, reordered,
inherited, accessor, symbol, and Proxy attempt identities through the branded
fake and statically bind device, inode, size, and mtime production encodings
against `Number` narrowing.

The reviewed dependency-input support source and declaration remain outside
the repair. No implementation, declaration, verifier, test, producer, fixed
input, host runtime/package, external communication, construction, image,
Docker, transfer, runtime/result, evidence, Expected, or `Observed` byte
changed. Standing authorization was not used. M2A-IBI02 and
M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain reviewed static/unit closure;
M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

Next: perform the exact bounded Docker-free M2A-IBI01 identity-verification
remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md`;
do not edit the support source/declaration, import or execute either producer,
access input, use external communication, construct an image, call Docker, or
access runtime/result state.

## M2A-IBI01 identity-verification remediation handoff

The bounded Docker-free candidate now submits all seven missing exact-key-
shape attempt identities through the separately branded fake and shared
`readAttemptIdentity()` boundary. Missing, extra, reordered, inherited,
accessor, symbol, and Proxy identities each retain the committed occurrence
and failed checkpoint, publish no toolchain candidate, enable no cleanup or
retry, and stop before `attempt-in-progress-write` or runtime/source/package
reads. Accessor getter and Proxy trap counters remain zero.

Static verification now requires `stat.dev.toString()`,
`stat.ino.toString()`, `stat.size.toString()`, and
`stat.mtimeNs.toString()` and rejects `Number` narrowing of each corresponding
BigInt field. The canonical decimal decoder, parent-sync production/fake edge,
greater-than-safe-integer positive transition, complete M2A-IBI02 inverse
matrix, absent producer imports, and closed construction reachability remain
bound.

Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests observed 99 passing / 10 failing files and 826 passing / 39 failing
tests. Aggregate `check` stops at eight pre-existing out-of-scope formatting
warnings. M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain reviewed
Docker-free static/unit closure; M2A-IBI01/M2A-IB03/M2A-IB06 remain open
pending fresh independent re-review.

The reviewed support source and declaration did not change. No producer,
fixed input, host runtime/package, external communication, construction,
image, Docker, transfer, runtime/result, evidence, Expected, `Observed`, or
standing authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-IBI01 identity-
verification remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation-review.md`;
do not repair source/tests or execute either producer in that review.

## M2A-IBI01 identity-verification remediation re-review decision

The fresh independent Docker-free read-only re-review is `APPROVED` at
static/unit cooperative-host implementation scope. The focused suite submits
missing, extra, reordered, inherited, accessor, symbol, and Proxy attempt
identities through the branded fake and shared decoder; every case retains the
committed occurrence and failed checkpoint, publishes no candidate, enables no
cleanup/retry, and stops before checkpoint publication or
runtime/source/package reads. Accessor and Proxy counters remain zero.

Static verification requires the exact BigInt-derived device/inode/size/mtime
`.toString()` production encodings and rejects direct `Number` narrowing of
each field. The reviewed support/declaration hashes remain unchanged, the
closed parent-sync edge and M2A-IBI02 matrix are preserved, and focused
verification passes 1 file / 62 tests. M2A-IBI01 and therefore
M2A-IB03/M2A-IB06 now close at Docker-free static/unit cooperative-host scope;
all M2A-IB01 through M2A-IB06 implementation decisions are closed.

No producer, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, evidence, Expected, or
`Observed` boundary was used. Standing authorization was not used; producer
execution remains separately unauthorized.

Next: save the exact bounded npm-acquisition producer-execution contract and
fresh independent review prompt; do not execute the producer, access fixed
input, or use external communication in that prompt-only task.

## npm-acquisition producer execution-gate contract handoff

The Docker-free proposal in
`m2-a-evidence-transfer-npm-acquisition-execution-gate.md` fixes M2A-NG01
through M2A-NG06 around the independently approved producer implementation:
exact three-file executable identity, credential-empty two-request HTTPS,
root-first one-shot publication, bounded process disposition, separate
candidate review, and explicit-human external authority. Its fresh review
prompt is saved before any occurrence.

M2A-NG01 through M2A-NG06 remain open pending that review. M2A-IBI01/
M2A-IBI02 and M2A-IB01 through M2A-IB06 retain static/unit closure. No
producer, fixed root, host environment/runtime, external communication, npm
candidate, construction, Docker, runtime/result, evidence, Expected,
`Observed`, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-NG01 through
M2A-NG06 contract review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-review.md`;
do not execute or import the producer, access the fixed acquisition root or
host environment/runtime, or use external communication.

## npm-acquisition producer execution-gate contract-review decision

The fresh independent Docker-free read-only review is `BLOCKED` on
M2A-NGR01/M2A-NGR02. The entry does not enforce the contract's exact
`/usr/bin/node` and lexical script argv pair, and the one-link acquisition-root
directory claim does not match production's positive-link-count rule.
M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 close at contract scope;
M2A-NG01/M2A-NG03 remain open.

M2A-IBI01/M2A-IBI02 and M2A-IB01 through M2A-IB06 retain Docker-free
static/unit closure. Focused transfer verification passes 1 file / 62 tests.
No producer, fixed root, host environment/runtime, external communication,
npm candidate, construction, Docker, runtime/result, evidence, Expected,
`Observed`, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-NGR01/M2A-NGR02
contract-remediation prompt and fresh independent re-review prompt; do not
repair contract/source/tests or execute the producer in that prompt-only task.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation prompt handoff

The exact bounded Docker-free remediation and fresh independent re-review
prompt pair is saved before acquisition contract/source/test repair. The later
task fixes the exact lexical-host versus canonical-Node invocation boundary
and the positive-link-count acquisition-root directory rule while preserving
the reviewed dependency-input implementation and exact-one publication files.

M2A-IBI01/M2A-IBI02 and M2A-IB01 through M2A-IB06 retain Docker-free
static/unit closure. Only the saved prompt pair and minimal status records
changed. No execution-gate requirement, implementation, verifier, test,
producer, fixed root, host environment/runtime, external communication, npm
candidate, construction, Docker, runtime/result, evidence, Expected,
`Observed`, or standing authorization changed or was used.
M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 retain contract-scope closure;
M2A-NG01/M2A-NG03 remain open.

Next: perform the exact bounded Docker-free M2A-NGR01/M2A-NGR02 remediation
under
`../prompts/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation.md`;
do not import or execute either producer, access fixed or host runtime state,
or use external communication.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation handoff

The bounded Docker-free candidate now separates the reviewed lexical host
command from the exact canonical Node executable/argv/cwd/empty-environment
entry guard and aligns the acquisition-root directory with production's
positive-link-count predicate without weakening exact-one archive/receipt
files. Function-scoped static weakening cases cover both repairs. The fresh
three-file aggregate is
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.

Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests retain 99 passing / 10 failing files and 826 passing / 39 failing
tests; aggregate `check` stops at eight pre-existing formatting warnings.
M2A-IB01 through M2A-IB06 and M2A-IBI01/M2A-IBI02 retain static/unit closure.
M2A-NG01/M2A-NG03 remain open pending fresh re-review; the other M2A-NG items
retain contract-scope closure.

No producer, fixed root, host runtime, external communication, npm candidate,
construction, Docker, runtime/result, evidence, Expected, or `Observed`
boundary was used. Standing authorization was not used.

Next: perform the fresh independent Docker-free read-only M2A-NGR01/M2A-NGR02
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation-review.md`;
do not repair source/tests, execute either producer, access fixed or host
runtime state, or use external communication.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation re-review

The fresh independent Docker-free read-only re-review is `APPROVED` at
contract/static entry-guard scope. It closes M2A-NGR01/M2A-NGR02 and
M2A-NG01/M2A-NG03 by reproducing complementary lexical-host/canonical-Node
authority and positive directory-link/exact-one file boundaries. All six
M2A-NG items are now closed only at contract scope.

M2A-IB01 through M2A-IB06 and M2A-IBI01/M2A-IBI02 retain static/unit closure.
Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. No producer,
fixed root, host runtime, external communication, npm candidate, construction,
Docker, runtime/result, evidence, Expected, or `Observed` boundary was used.
Standing authorization was not used and cannot authorize the external
occurrence.

Next: save the exact adjacent-preflight/one-occurrence execution prompt and
separate Docker-free fixed-root result-review prompt; do not execute either
producer, access fixed or host runtime state, or use external communication in
that prompt-only task.

## npm-acquisition one-occurrence/result-review prompt handoff

The exact execution and fixed-root result-review prompts are saved at 12,829
and 13,241 bytes with SHA-256 identities `cab8482f...57b0d8f` and
`a62a49b1...856aa8b`. The execution prompt preserves the approved producer
closure, adjacent full-byte/hash gate, direct empty-environment launch, and
one-occurrence/no-retry boundary. The result prompt preserves independent
candidate review and cannot update the dependency-input construction
bindings.

M2A-IB01 through M2A-IB06 and M2A-IBI01/M2A-IBI02 retain static/unit closure.
No producer, fixed root, host runtime, external communication, npm candidate,
construction, Docker, runtime/result, evidence, Expected, or `Observed`
boundary was used. Standing authorization was not used and cannot authorize
the external occurrence.

Next: a person must freshly review the saved prompt pair and explicitly
authorize all four fixed M2A-NG06 effects before the one-occurrence execution
prompt may run.

## npm-acquisition authorized one-occurrence handoff

The exact direct human authorization was recorded and used for one eligible
occurrence after the prompt, producer, static-boundary, sentinel, and focused
verification preconditions passed. The process settled naturally with exit
`1`, empty stdout, and the fixed 29-byte
`M2A_INPUT_ACQUISITION_FAILED\n` stderr line. Generation `20260721-01` is
exhausted without retry.

The execution worker did not inspect or classify the fixed root. The bounded
process record is
`reviews/m2-a-evidence-transfer-npm-acquisition-execution.md`; retained state
and candidate disposition remain unknown pending the separately saved
Docker-free review. M2A-IB01 through M2A-IB06 and M2A-IBI01/M2A-IBI02 retain
static/unit closure. Construction bindings remain `null`, runtime approval
remains false, and evidence review remains `not-performed`. Continuing-work
standing authorization was not used for the external occurrence.

Next: perform the fresh independent Docker-free fixed-root result review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md`;
do not run either producer, communicate externally, repair or retry the
occurrence, or update construction bindings.
