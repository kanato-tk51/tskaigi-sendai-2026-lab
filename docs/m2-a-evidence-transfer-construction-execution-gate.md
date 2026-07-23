# M0/M2-A construction and execution-gate contract

Status: **M2A-CGR01 through M2A-CGR03 and M2A-CG01 through M2A-CG06 closed
at contract scope; the unchanged-child-identity residual-remediation re-review
closes M2A-CGI01 through M2A-CGI04 and M2A-CG01 through M2A-CG06 at the
Docker-free static/unit cooperative-host implementation boundary;
construction, dependency acquisition, image build or inspection, Docker
execution, transfer, result access, and evidence promotion remain unapproved**

Contract date: 2026-07-21

This contract is the next issue #43 boundary after M2A-TRR01 through
M2A-TRR03 and M2A-TR01 through M2A-TR06 closed at Docker-free static/unit
scope. It fixes how a later implementation may construct one complete image
context, bind one locally built image by exact `sha256:` ID, and expose one
argument-free execution candidate. This task does not construct that context,
acquire npm, call Docker, create the ignored result root, or approve the
candidate command.

## Decision IDs and maximum review decision

The fresh contract review must decide:

- **M2A-CG01 — immutable source and acquisition closure**
- **M2A-CG02 — complete deterministic construction manifest**
- **M2A-CG03 — offline one-build image identity and retention**
- **M2A-CG04 — exact production entry and one-shot lifecycle**
- **M2A-CG05 — failure, result, and evidence separation**
- **M2A-CG06 — later implementation and verification allowlist**

The maximum positive decision approves only one Docker-free static/unit
implementation of the constructor, build/execution plans, validators,
production entries, and fake backends under M2A-CG06. It does not approve npm
acquisition, production context construction, an image build or inspect,
Docker execution, standing-authorization use, transfer, result review,
evidence acceptance, M3 ingestion, matrix/profile/presentation evidence, or an
`Observed` value.

## M2A-CG01 — immutable source and acquisition closure

### Fixed measurement tuple

The following already reviewed tuple is unchanged:

| Role | Fixed value |
| --- | --- |
| Generation | `20260721-01` |
| Expected revision | `m2a-transfer-expected-20260721-01` |
| Run ID | `m2a-npm-lifecycle-20260721000000000000000000000001` |
| Result root | `results/runs/m2-a/m2a-npm-lifecycle-20260721000000000000000000000001` |
| Initializer container | `tskaigi-m2a-transfer-init-20260721-01` |
| Measurement container | `tskaigi-m2a-transfer-run-20260721-01` |
| Transfer volume | `tskaigi-m2a-evidence-20260721-01` |
| Candidate image tag | `tskaigi-m2a-transfer:20260721-01` |
| Pinned base | `node:24.18.0-bookworm-slim@sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5` |

Historical M0/M2-A results, the old M0 runtime image, retained Docker state,
stdout bundles, markers, approval files, and ignored result roots are not
construction inputs. No later task may extract npm or any other byte from the
historical M0 image or result tree.

### Reviewed tracked-input baseline

The ordered baseline is the existing 31 `sourceInputs` rows followed by these
ten rows in order:

```text
package.json
tsconfig.base.json
packages/probe-core/tsconfig.json
packages/probe-core/tsconfig.build.json
packages/npm-lifecycle-probe/tsconfig.json
packages/npm-lifecycle-probe/tsconfig.build.json
experiments/npm12-install/Containerfile.m2a-transfer
experiments/npm12-install/m2a-transfer-manifest.json
experiments/npm12-install/container/initialize-m2a-volume.mjs
experiments/npm12-install/container/run-m2a-transfer.mjs
```

For each row, calculate lowercase SHA-256 over the exact file bytes and then
SHA-256 over the concatenated
`<hex><two spaces><repository-relative-path><LF>` rows. The current 41-row
baseline is:

```text
sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526
```

The already reviewed first 31 rows retain their separate aggregate
`sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04`.
A later implementation review must record the exact additive constructor,
entry, declaration, static, test, and saved-prompt hashes. The constructor must
recalculate both aggregates before emitting anything. Any change to a baseline
row requires a new reviewed generation; it is not repaired or accepted as an
implementation delta.

### npm 12 acquisition is a separate authority boundary

The repository does not contain the npm `12.0.1` distribution bytes. The
production constructor may read them only from this exact future private path:

```text
experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01/npm-12.0.1.tgz
```

The sibling `acquisition.json` must be a canonical one-line record with exact
schema `m2a-transfer-acquisition/v1`, package name `npm`, version `12.0.1`,
byte length, SHA-256, registry integrity, acquisition status `complete`,
scripts-run `false`, credentials-used `false`, and external-network phase
`dependency-acquisition-only`. Its digest and the tarball SHA-256 remain
unknown until a separately authorized credential-empty acquisition and fresh
review record them. They are not caller-selected runtime input.

This contract does not authorize that external communication. If the exact
tarball and reviewed receipt are absent, malformed, symlinked, aliased,
unsettled, or not independently bound, construction stops before creating its
root. It must not use a global npm cache, home directory, historical image,
registry fallback, alternate version, or network access to fill the gap.

### Constructor toolchain is a separate authority boundary

The constructor also depends on one not-yet-authorized, separately reviewed
toolchain receipt at this fixed future private path:

```text
experiments/npm12-install/.work/m2a-transfer-toolchain-20260721-01/toolchain.json
```

The receipt is one canonical JSON line with schema
`m2a-transfer-toolchain/v1` and these exact ordered top-level keys:

```text
schemaVersion, generation, runtime, packages, inventory,
inventoryAggregate, status, evidenceReview
```

`generation` is `20260721-01`. `runtime` has ordered keys
`logicalId, version, platform, architecture, executableSize,
executableSha256, loadedRuntimeInventoryAggregate`. It binds logical executable
`constructor-node` to fixed `/usr/bin/node`, exact Node version `v20.18.2`,
platform `linux`, architecture `x64`, the executable's regular-file size and
`sha256:` digest, and one aggregate covering every loader and shared-library
byte admitted by the reviewed runtime inventory. The absolute executable path
is a fixed constructor-side binding and is not serialized as an inventory
path.

`packages` is exactly this order, and every row has ordered keys
`name, version, integrity, inventoryAggregate`:

| Name | Version | Exact integrity |
| --- | --- | --- |
| `typescript` | `5.9.3` | `sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==` |
| `@types/node` | `20.19.43` | `sha512-6oYBAi5ikg4Pl+kGsoYtawUMBT2zZMCvPNF7pVLnHZfd1zf38DRiWn/gT01RYCdUqkv7Fhr+C9ot4/tb+2sVvA==` |
| `undici-types` | `6.21.0` | `sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==` |

`undici-types` remains the exact lockfile dependency of `@types/node`.
`inventory` is one lexical array of every admitted regular file from the
runtime closure and the exact repository-local roots for those three package
trees. Every row has ordered keys `logicalPath, mode, size, sha256`.
`inventoryAggregate` is SHA-256 over the canonical JSON bytes of that exact
inventory array. No directory is implied input: directories, symlinks,
hard-link aliases, special or sparse files, extra/missing/reordered rows, host
absolute paths in the receipt, and unbound resolver inputs are rejected.

`status` is exactly `complete`. `evidenceReview` is `not-performed` until a
separate fresh review binds both the receipt SHA-256 and inventory aggregate.
Neither this contract remediation nor the later constructor may create,
inspect, or self-approve the receipt. Absence or any uncertainty stops before
construction-root creation; ordinary root `node_modules`, global cache, home,
caller path, alternate executable, and network are not fallbacks.

## M2A-CG02 — complete deterministic construction manifest

### Fixed roots and non-reuse

Production construction is limited to one fresh ignored root:

```text
experiments/npm12-install/.work/m2a-transfer-construction-20260721-01
```

Its successful Docker-free construction inventory is:

```text
context/
construction-manifest.json
```

Only a later successful gated image build may add the sibling
`image-binding.json`.

Before Docker-free construction, the exact construction root and fixed result
root must be absent. A present or uncertain filesystem object is fail-closed;
nothing is deleted, overwritten, renamed out of the way, repaired, or reused.
Filesystem absence is checked only for those exact repository paths. Candidate
tag absence belongs to the later image plan; container and volume absence
belongs to the still later runtime plan. The Docker-free constructor queries
none of them.

### Exact private compiler workspace and process plan

The constructor is the fixed no-argument `/usr/bin/node` entry. It accepts no
inherited environment or alternate executable or tool root. Before its first
output it holds and revalidates the reviewed tracked source/config/package
descriptors, npm receipt and archive descriptors, and toolchain receipt and
inventory descriptors. It copies the three toolchain package trees as exact
regular files into a private compiler workspace; it never resolves through the
ordinary root `node_modules`, a global cache, home, caller path, or network.

The private workspace mirrors `tsconfig.base.json`, both packages' complete
config/source/package trees, and this exact receipt-bound `node_modules`
layout. The constructor launches exactly two compiler children, in this order,
with the compiler workspace as cwd:

```text
compile-probe-core:
["node_modules/typescript/bin/tsc","--project","packages/probe-core/tsconfig.build.json","--outDir","packages/probe-core/dist","--pretty","false","--incremental","false"]

compile-npm-lifecycle-probe:
["node_modules/typescript/bin/tsc","--project","packages/npm-lifecycle-probe/tsconfig.build.json","--outDir","packages/npm-lifecycle-probe/dist","--pretty","false","--incremental","false"]
```

Both children use `/usr/bin/node` as executable, `shell: false`, an exactly
empty environment, a 30,000 ms absolute deadline, a 65,536-byte combined
output bound, TERM followed by a 250 ms KILL grace, and a 1,000 ms final close
deadline. Success requires integer exit zero, null signal, no timeout, no
stdout or stderr truncation, and all-settled child, descriptor, and output-
capture closure. Unknown settlement is Inconclusive and forbids publication.

Before `compile-npm-lifecycle-probe`, the workspace contains a regular-file
copy of the first package's already validated `package.json` and complete
compiler-produced `dist` at
`node_modules/@tskaigi-lab/probe-core`. The second compiler therefore has no
unbound workspace or resolver input. The private compiler workspace is never
copied into the image context; every compiler descriptor and its complete
deletion/close settlement finishes before the construction manifest is
constructed.

### Exact context inventory

The context root contains only these path families:

```text
Containerfile.m2a-transfer
container/initialize-m2a-volume.mjs
container/run-m2a-transfer.mjs
m2a-context/npm/**
m2a-context/npm-cli.js
m2a-context/probe-core/package.json
m2a-context/probe-core/dist/**
m2a-context/npm-lifecycle-probe/package.json
m2a-context/npm-lifecycle-probe/dist/**
m2a-context/consumer/package.json
m2a-context/m2a-install-probe-1.0.0.tgz
```

The constructor must:

1. hold and revalidate every baseline and acquisition descriptor before its
   first output;
2. compile `probe-core` and `npm-lifecycle-probe` from the fixed source with
   the lockfile-pinned TypeScript `5.9.3`, writing only to private staging;
3. include each package's exact reviewed `package.json` plus only its complete
   compiler-produced `dist` regular-file inventory;
4. safely decompress and parse the reviewed npm tarball in process, reject
   absolute/dot/empty/control paths, duplicates, links, special files, sparse
   records, unsupported extensions, and entries outside one `package/` root;
   only local PAX metadata containing canonical `path` and `size` keys may
   extend the immediately following regular/directory entry; then project the
   complete npm `12.0.1` regular-file tree beneath `m2a-context/npm`;
5. copy npm's validated `bin/npm-cli.js` bytes once more to the fixed
   `m2a-context/npm-cli.js` target;
6. create the dependency fixture tarball in process from the exact fixture
   `package.json`, with one `package/package.json` regular entry, fixed ustar
   metadata, zero timestamp, and deterministic gzip metadata; and
7. copy the unchanged Containerfile, initializer, runner, and consumer bytes
   to the exact targets above.

The constructor invokes no npm command, lifecycle entry, probe, adapter,
Docker command, shell, arbitrary child, network operation, or historical/result
read. It accepts no argument, environment input, alternate path, package,
version, compiler, timestamp, mode, or output root.

Every directory is normalized to mode `0555`; every regular file is `0444`
except `m2a-context/npm-cli.js`, which is `0555`. Every regular file has one
link, every output remains beneath the held private root, and all file and
directory mtimes are normalized to Unix epoch zero. No symlink, hard-link
alias, socket, device, FIFO, sparse file, extra entry, or writable output is
accepted.

### Canonical manifest and commit

`construction-manifest.json` is one canonical JSON line using schema
`m2a-transfer-construction/v1`. It has these exact ordered top-level keys:

```text
schemaVersion, generation, expectedRevision, runId, scenarioId,
trackedInputs, npmAcquisition, constructorToolchain, constructor,
contextInventory, contextAggregate
```

Its nested key order and meaning are fixed:

- `trackedInputs`: `sourceAggregate, constructionBaselineAggregate`, bound to
  the reviewed 31-row and 41-row aggregates above;
- `npmAcquisition`: `receiptSha256, tarballSize, tarballSha256, integrity`,
  bound only to the later independently reviewed npm receipt and archive;
- `constructorToolchain`: `receiptSha256, runtimeSha256,
  inventoryAggregate`, bound only to the later independently reviewed
  toolchain receipt, `/usr/bin/node` bytes, and full runtime/package inventory;
- `constructor`: `sourceSha256, compilerSteps`, where `sourceSha256` is the
  later review-approved exact constructor source digest;
- each `compilerSteps` row: `stepId, executableLogicalId, argvLogicalId,
  cwdLogicalId, environmentKeys, deadlineMs, combinedOutputLimitBytes,
  termToKillGraceMs, closeDeadlineMs`, with exactly the two steps and values
  fixed in the preceding section and `environmentKeys: []`. The first row is
  exactly `compile-probe-core, constructor-node, compile-probe-core-argv,
  private-compiler-workspace, [], 30000, 65536, 250, 1000`; the second is
  exactly `compile-npm-lifecycle-probe, constructor-node,
  compile-npm-lifecycle-probe-argv, private-compiler-workspace, [], 30000,
  65536, 250, 1000`. Each argv logical ID maps only to its preceding exact
  array; and
- each lexical `contextInventory` row: `path, type, mode, size, sha256,
  mtimeNs`.

Directory inventory rows alone have `size: null` and `sha256: null`. Regular
rows require an integer byte size and lowercase `sha256:` digest. Every
`mtimeNs` is the decimal string `0`. `contextAggregate` is SHA-256 over the
canonical JSON bytes of the exact `contextInventory` array. The manifest
contains no host absolute path, device/inode, owner number, npm cache path, raw
command output, registry URL, credential, or error. Unknown keys, key order,
type, descriptor, prototype, canonical byte, receipt/source binding, row, or
aggregate drift are rejected without trusting caller projections.

All source/acquisition reads, compiler processes, staging writes, descriptor
closes, recursive inventory checks, and a second clean in-memory derivation
must settle before the manifest is constructed. A private `.next` tree is
renamed to `context` as the sole publication commit; the manifest is then
written through its own private `.next` file, byte-read back, closed, and
renamed as the last fallible construction operation. Failure retains the
private root as Inconclusive construction state and never publishes a success
manifest.

## M2A-CG03 — offline one-build image identity and retention

Image construction is a later Docker phase, not part of the Docker-free
constructor or contract review. It requires a reviewed successful construction
manifest and a final descriptor-based context revalidation reproducing every
manifest row and aggregate.

### Fixed private build layout

The build root is exactly:

```text
experiments/npm12-install/.work/m2a-transfer-image-build-20260721-01
```

It contains only effective-user-owned, non-symlink, mode-`0700` `home/` and
`docker-config/`, plus mode-`0600`, one-link regular file
`docker-config/config.json` with exact bytes `{"auths":{}}\n`. Every object
is exclusively created, held, and identity-revalidated. The build root and
image are retained on every outcome; no cleanup occurs.

The build entry accepts no argument or environment input. It uses fixed
`/usr/bin/docker`, `shell: false`, repository-root cwd, no inherited
environment, and only these exact bindings:

```text
DOCKER_CONFIG=experiments/npm12-install/.work/m2a-transfer-image-build-20260721-01/docker-config
HOME=experiments/npm12-install/.work/m2a-transfer-image-build-20260721-01/home
PATH=/usr/bin:/bin
```

### Exact offline Docker command packet

The only Docker commands are these exact argv arrays in this exact order; the
format strings below are literal:

```text
["version","--format","{\"client\":{{json .Client.Version}},\"server\":{{json .Server.Version}}}"]
["image","ls","--no-trunc","--quiet","--filter","reference=tskaigi-m2a-transfer:20260721-01"]
["image","inspect","--format","{\"architecture\":{{json .Architecture}},\"id\":{{json .Id}},\"os\":{{json .Os}},\"repoDigests\":{{json .RepoDigests}}}","node:24.18.0-bookworm-slim@sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5"]
["build","--network","none","--pull=false","--no-cache","--platform","linux/amd64","--provenance=false","--sbom=false","--tag","tskaigi-m2a-transfer:20260721-01","--file","experiments/npm12-install/.work/m2a-transfer-construction-20260721-01/context/Containerfile.m2a-transfer","experiments/npm12-install/.work/m2a-transfer-construction-20260721-01/context"]
["image","inspect","--format","{\"architecture\":{{json .Architecture}},\"cmd\":{{json .Config.Cmd}},\"entrypoint\":{{json .Config.Entrypoint}},\"environmentNames\":[{{range $index, $entry := .Config.Env}}{{if $index}},{{end}}{{if lt (len (split $entry \"=\")) 2}}{{json \"M2A_INVALID_ENV_ENTRY\"}}{{else}}{{json (index (split $entry \"=\") 0)}}{{end}}{{end}}],\"id\":{{json .Id}},\"labels\":{{json .Config.Labels}},\"os\":{{json .Os}},\"repoTags\":{{json .RepoTags}},\"user\":{{json .Config.User}},\"workingDir\":{{json .Config.WorkingDir}}}","tskaigi-m2a-transfer:20260721-01"]
```

The version projection must be canonical exact client/server `29.6.1`.
Candidate-tag absence is exit zero, null signal, and empty stdout. The base
projection binds the pinned reference to one local `sha256:` ID, `linux`,
`amd64`, and repo digests exactly
`["node@sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5"]`.
The build occurs exactly once.

Candidate inspect requires one exact local `sha256:` ID, `linux`, `amd64`,
user `1000:1000`, null entrypoint, command
`["node","/opt/m2a-transfer/run-m2a-transfer.mjs"]`, empty working directory,
environment names exactly `["PATH","NODE_VERSION","YARN_VERSION"]`, repo tags
exactly `["tskaigi-m2a-transfer:20260721-01"]`, and `labels: null`. No raw
environment value is persisted.

Version, absence, base inspect, and candidate inspect each have a 5,000 ms
deadline; the sole build has a 300,000 ms deadline. Every command has a
65,536-byte combined output bound, TERM followed by 250 ms KILL grace, and a
1,000 ms final close deadline. Success is exact integer exit zero, null signal,
no timeout, no output truncation, and all-settled process/output/descriptor
closure. Unknown close or ambiguous absence is Inconclusive. Pull, login,
registry fallback, load/import/save/push/tag/remove/prune, container/volume
action, retry, and cleanup are unavailable.

### Canonical local image binding

After every command, output capture, and descriptor settles and the held
context is revalidated, `image-binding.json` is canonically and atomically
published as the last operation. Its schema is
`m2a-transfer-image-binding/v1` with these exact ordered top-level keys:

```text
schemaVersion, generation, expectedRevision, runId, scenarioId, imageTag,
baseImage, construction, build, localImage, retention,
runtimeExecutionApproved, evidenceReview
```

Nested keys and values are fixed:

- `baseImage`: `reference, id, repositoryDigest, os, architecture`, bound to
  the pinned base projection above;
- `construction`: `manifestSha256, contextAggregate,
  npmAcquisitionSha256, constructorToolchainSha256`, bound to the reviewed
  canonical construction manifest and both prerequisite receipts;
- `build`: `dockerClientVersion, dockerServerVersion, platform, network,
  pull, noCache, provenance, sbom, occurrences`, fixed respectively to
  `29.6.1`, `29.6.1`, `linux/amd64`, `none`, `false`, `true`, `false`,
  `false`, and `1`;
- `localImage`: `id, os, architecture, user, entrypoint, cmd, workingDir,
  environmentNames, repoTags, labels`, bound exactly to candidate inspect;
  and
- `retention`: `image, constructionRoot, buildRoot`, all exactly `retained`.

`runtimeExecutionApproved` is `false` and `evidenceReview` is
`not-performed`. The image and both private roots remain retained. A fresh
independent Docker-free result review must reproduce the whole manifest and
binding packet and bind that exact local image ID before any runtime candidate
can be reviewed.

## M2A-CG04 — exact production entry and one-shot lifecycle

The later implementation may add three separate no-argument entries:

```text
node experiments/npm12-install/scripts/construct-m2a-transfer-context.mjs
node experiments/npm12-install/scripts/build-m2a-transfer-image.mjs
node experiments/npm12-install/scripts/execute-m2a-transfer.mjs
```

Importing any entry or supporting module must have no side effect. The context
entry cannot reach Docker. The image entry cannot reach container, volume,
transfer, result, or lifecycle operations. The execution entry cannot build,
pull, acquire, repair, retry, clean, or accept caller input.

Only a later review may approve the exact third command once. Immediately
before that approval it must reproduce the final implementation identities,
construction manifest, acquisition binding, exact local image ID, candidate
tag-to-ID binding, fixed tuple, and exact absence of the result root,
containers, and volume. The execution entry then follows only the already
reviewed `createFixedDockerPlan(imageId)` order:

```text
absence-volume
  -> absence-initializer-container
  -> absence-measurement-container
  -> volume create
  -> initializer create -> inspect -> start -> wait -> final inspect
  -> measurement create -> inspect -> start -> wait -> final inspect
  -> copy and validate completion
  -> copy and validate only completion-listed segment/conditional marker
  -> atomically publish one candidate attempt record
```

### Exact runtime host layout

The runtime CLI work root remains exactly
`experiments/npm12-install/.work/m2a-transfer-20260721-01`, including the
already reviewed `/usr/bin/docker`, `shell: false`, no-inherited-environment
boundary and this exact credential-empty environment:

```text
DOCKER_CONFIG=experiments/npm12-install/.work/m2a-transfer-20260721-01/docker-config
HOME=experiments/npm12-install/.work/m2a-transfer-20260721-01/home
PATH=/usr/bin:/bin
```

Every runtime Docker child uses the fixed result root as cwd:

```text
results/runs/m2-a/m2a-npm-lifecycle-20260721000000000000000000000001
```

The relative destinations `transfer/transfer-completion.json`,
`transfer/npm-lifecycle-producer.jsonl`, and
`transfer/probe-output/direct-write-marker.json` therefore have no alternate
resolution.

### Exact canonical absence-checkpoint identities

The later production execution plan begins with exactly these three canonical
step/argv rows in this exact order:

```text
absence-volume:
["volume","inspect","tskaigi-m2a-evidence-20260721-01"]

absence-initializer-container:
["container","inspect","tskaigi-m2a-transfer-init-20260721-01"]

absence-measurement-container:
["container","inspect","tskaigi-m2a-transfer-run-20260721-01"]
```

These are the only `issue.step` identities admitted for the three absence
children in a later production `m2a-transfer-attempt/v1` candidate. The schema,
ordered keys, and issue shape do not change, and no caller-selected identity or
parallel step projection is added. The executor and validator must derive the
persisted step from the same immutable fixed-plan row that owns its exact argv.
The old generic `absence-preflight` spelling is not a valid production step.
A swapped, duplicate, missing, reordered, generic, unknown, or correct-name/
wrong-argv row is rejected before result-root creation or command launch.

Before each row's child can launch, its fully settled write-ahead checkpoint
has exactly one chronological first issue: that row's canonical step with
`M2A_SETTLEMENT_UNKNOWN`. After a known failed absence check, the final first
issue keeps the same step and changes only the code to
`M2A_ABSENCE_PREFLIGHT_FAILED`, after all child output and descriptors settle.
Those are the only two issue codes compatible with any of the three absence
steps; they are not split or renamed.

Attempt validation binds each identity to its exact prefix boundary. Earlier
absence rows must have completed successfully in fixed order, the named row is
the current known-failed or settlement-unknown child, and no later absence,
mutating, lifecycle, copy, or validation step may be claimed as performed. At
all six known-failure/unknown boundaries, the volume, initializer container,
and measurement container remain not created; initializer and measurement
settlement remain `not-started`, `naturalExit` remains `false`, and completion,
segment, and marker transfer remain `not-attempted`. A later-state claim,
wrong issue code, multiple issue, or performed-step contradiction is rejected.

Before any Docker child and first Docker mutator, the result root must be
absent. It is then exclusively created as an effective-user-owned, one-link,
non-symlink mode-`0700` directory containing only effective-user-owned,
one-link, non-symlink mode-`0700` `transfer/` and canonical mode-`0600`
`attempt.json`. The only temporary publication name is `attempt.next`; all
fixed copy destinations begin absent. If and only if the validated completion
lists the marker, the host exclusively creates and holds effective-user-owned,
one-link, non-symlink mode-`0700` `transfer/probe-output/` after completion
validation and before the marker-copy checkpoint. Otherwise that directory
remains absent. The implementation must hold result and transfer directory
identities, require exact owner/mode/type/link and ancestor identity on every
operation, use no-follow same-descriptor reads, and reject any entry outside
the exact current in-progress inventory. No host absolute path, uid/gid,
device/inode, or Docker-managed source path is persisted.

### Pessimistic write-ahead attempt checkpoints

Before launching every Docker child, atomically replace `attempt.json` with
canonical `m2a-transfer-attempt/v1` bytes that conservatively record
`M2A_SETTLEMENT_UNKNOWN` for that exact next step. The replacement protocol
is fixed:

1. create `attempt.next` exclusively beneath the held result directory as an
   effective-user-owned, one-link, non-symlink mode-`0600` regular file;
2. write and sync the complete canonical bytes;
3. reread and compare every byte through the same no-follow descriptor;
4. close the descriptor and require known settlement;
5. rename `attempt.next` over `attempt.json`; and
6. sync the held result directory.

The child launches only after all six operations settle. A checkpoint or
publication failure launches no next command and is never retried. After a
known child close and all owned output-capture and descriptor settlement, the
host publishes either the next exact prelaunch checkpoint or the final known
outcome through the same transaction.

For the three absence rows, a known successful close also requires all owned
output-capture and descriptor settlement before the next row's distinct
checkpoint may be published. A known absence failure publishes only the same
row's `M2A_ABSENCE_PREFLIGHT_FAILED` first issue. An unknown close leaves that
row's already synced `M2A_SETTLEMENT_UNKNOWN` checkpoint immutable.

If a Docker CLI child has no known close after the fixed TERM/KILL sequence,
the host performs no later Docker operation, inspect, copy, validation,
cleanup, or filesystem publication. The already synced prelaunch checkpoint
remains the durable sanitized Inconclusive attempt for the exhausted
occurrence. Unknown settlement therefore suppresses every post-unknown action
without suppressing the attempt bytes committed before launch. A known failure
may replace its checkpoint with its exact final first issue only after every
launched child and owned descriptor settles.

### Completion-first conditional transfer and finality

Natural measurement exit is required before transfer. Each `docker cp` writes
only one absent exact relative destination from the stopped measurement
container; its prelaunch checkpoint names that copy step. Completion is copied
and validated first. Only completion-listed segment and conditional marker
paths are then copied in the existing plan order. Validation starts only after
known child close, uses the held transfer parent and the same destination
descriptor, and closes every descriptor before the next checkpoint.

The chronological first issue is write-once. Exact segment and conditional-
marker correlation remains mandatory. After a final known publication,
`attempt.json` and all transfer bytes are immutable. There is no directory
copy, wildcard, stdout/log/archive fallback, `exec`, attach, restart, stop,
kill, removal, repair, retry, cleanup, alternate image/tag/path, or second
occurrence.

This write-ahead protocol is cooperative-host durability, not an atomic
transaction with Docker daemon state. Another same-authority runtime client,
kernel/runtime failure, or storage failure can still leave the occurrence
Inconclusive. No candidate is accepted until the later fresh Docker-free result
review.

## M2A-CG05 — failure, result, and evidence separation

Construction intent, a construction manifest, an image-binding packet, static
tests, a Docker build observation, a candidate execution attempt, and an
accepted runtime result are distinct evidence classes.

- Acquisition or construction failure establishes no image identity and does
  not consume a runtime occurrence, but the construction generation is not
  retried or repaired.
- A successful image build establishes only one retained local candidate. It
  does not approve execution or npm/probe behavior.
- Any one-shot execution outcome exhausts the runtime tuple and is preserved
  without retry or cleanup.
- `complete` or the sole correlated `M2A_REBUILD_FAILED` candidate still
  requires a fresh Docker-free result review before acceptance.
- No candidate changes historical M0 evidence, M3 ingestion, profile or
  experiment-matrix state, presentation evidence, or `Observed`.

The production entries persist no raw Docker output, npm output, environment
value, canary, absolute host path, Docker-managed source path, credential,
device/inode, stack, or arbitrary error. Unknown settlement remains
Inconclusive: it suppresses every post-unknown action while preserving only the
already synced pessimistic prelaunch attempt checkpoint.

## M2A-CG06 — later implementation and verification allowlist

A positive fresh contract review may approve one Docker-free static/unit
implementation limited to:

```text
experiments/npm12-install/scripts/m2a-transfer-construction.mjs
experiments/npm12-install/scripts/m2a-transfer-construction.d.mts
experiments/npm12-install/scripts/m2a-transfer-production.mjs
experiments/npm12-install/scripts/m2a-transfer-production.d.mts
experiments/npm12-install/scripts/construct-m2a-transfer-context.mjs
experiments/npm12-install/scripts/build-m2a-transfer-image.mjs
experiments/npm12-install/scripts/execute-m2a-transfer.mjs
experiments/npm12-install/scripts/m2a-transfer-lib.mjs
experiments/npm12-install/scripts/m2a-transfer-lib.d.mts
experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs
tests/m2a-evidence-transfer.test.ts
experiments/npm12-install/README.md
docs/m2-a-evidence-transfer-construction-execution-gate.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
prompts/m2-a-evidence-transfer-construction-execution-gate-implementation.md
prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-review.md
```

The existing Containerfile, manifest, container sources, package scripts,
adapter/probe source, package manifests, fixture bytes, scenarios, historical
or result paths, and Expected/Observed files remain unchanged. Tests use only
repository-owned synthetic acquisition archives, temporary roots, and branded
fake Docker/process/filesystem backends. They must not import an entry, run a
lifecycle, construct the production context, call Docker, access the fixed
acquisition/construction/result roots, or inspect retained state.

Focused negatives must cover baseline/additive-source drift; acquisition
absence/hash/integrity/version/schema/path/type/link/sparse/duplicate/truncation
drift; compiler/version/output/inventory drift; context path/mode/mtime/size/
hash/order/extra/alias drift; partial publication and late close; caller
arguments/environment; base/tag/image/platform/config substitution; pull or
network fallback; command/deadline/output/settlement drift; phase reachability;
present fixed objects; retry/cleanup; early transfer; candidate/result/evidence
promotion; and import-time effects.

The implementation must save its exact implementation and review prompts
before source changes. The subsequent implementation review remains
Docker-free and may approve only a separately executed acquisition,
construction, and image-build sequence. The exact local image ID can become an
execution-gate input only after the later construction result is independently
reviewed.

## Contract-task evidence and handoff

This task used repository-controlled source and documentation needed to define
the boundary. It reproduced the 31-row aggregate and calculated the 41-row
baseline above. It did not construct a context, acquire or read npm
distribution bytes, compile for production construction, run npm pack/install/
approve/rebuild, import either container source, call Docker, access runtime or
retained Docker state, inspect the fixed issue #43 result root, transfer
evidence, use external network, or use standing authorization.

One overly broad read-only text search accidentally included existing
historical M0 result paths, and one tool-location check printed a host-specific
npm executable path. The historical search printed only bounded matching
metadata lines; neither observation was used in this contract, no file was
changed or copied, and no host-home directory content was inspected. The search
scope was corrected for the remainder of the task.

Next: perform the fresh independent Docker-free read-only contract review
under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-review.md`;
do not acquire npm, construct a context or image, call Docker, or access
runtime/result state.

## M2A-CGR01 through M2A-CGR03 remediation handoff

This bounded Docker-free contract remediation closes the specified prose gaps
for fresh review without changing M2A-CG01 through M2A-CG06. It binds the
not-yet-authorized constructor toolchain, complete construction schema, exact
offline build/binding packet, and result-root write-ahead checkpoint protocol.
A repository-controlled in-memory audit reproduced the unchanged 31-row
`sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04`
and 41-row
`sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526`
aggregates. Focused Prettier checking passes for this contract, the saved prompt
pair, and five status records; `git diff --check` exits `0`.

No dependency or toolchain byte was acquired or read. No production
constructor or compiler child, context, image, Docker command, runtime/result
state, transfer, evidence promotion, external communication, or standing
authorization was used.
M2A-CGR01 through M2A-CGR03 and M2A-CG01 through M2A-CG06 remain open pending
fresh independent Docker-free re-review.

Next: perform the fresh independent Docker-free read-only M2A-CGR01 through
M2A-CGR03 contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-remediation-review.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

## M2A-CGR03 absence-checkpoint identity remediation handoff

The bounded Docker-free contract remediation now replaces the later production
boundary's generic absence identity with exactly `absence-volume`,
`absence-initializer-container`, and `absence-measurement-container`, in that
order. Each identity is owned by one unchanged fixed inspect argv, and the
persisted issue step is derived from that same fixed-plan row rather than a
separate caller projection. The current `m2a-transfer-attempt/v1` schema and
the two compatible issue codes remain unchanged.

The contract now binds each prelaunch checkpoint, known failure, unknown
settlement, prerequisite state, no-later-step rule, and all six preflight
failure outcomes to the exact child identity. It preserves the reviewed
write-ahead publication, chronological first issue, command order,
completion-first conditional copy, immutable post-unknown checkpoint, and
cooperative-host limitation. M2A-CGR01 and M2A-CGR02 remain closed;
M2A-CGR03 and M2A-CG04 through M2A-CG06 remain open pending the saved fresh
independent re-review. M2A-CG01 through M2A-CG03 remain closed at contract
scope.

A repository-controlled in-memory inspection confirms three unique ordered
identities map one-to-one to the three unchanged absence argv. Focused
Prettier checking passes for this contract, the saved prompt pair, and the five
status records; `git diff --check` exits `0`. No test was required or run for
this documentation-only remediation.

No implementation, declaration, test, verifier, package script, Containerfile,
manifest, container entry, adapter/probe source, fixture, scenario, result,
Expected, or `Observed` byte changed. No dependency or toolchain byte was
acquired or read; no construction, image, Docker, runtime/result access,
transfer, evidence promotion, external communication, or standing
authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-CGR03
absence-checkpoint identity remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation-review.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

## M2A-CG01 through M2A-CG06 static/unit implementation handoff

The bounded Docker-free implementation candidate now realizes the reviewed
contract inside the exact M2A-CG06 allowlist. The construction library fixes
the 31-row and 41-row identities, canonical npm/toolchain/construction
validators, safe npm archive parser, deterministic fixture archive, exact
compiler and publication plans, a no-argument fail-closed entry, and a
separately branded fake construction transaction. The production library fixes
the five-command credential-empty offline build plan, complete image-build
observation and canonical image-binding validators, three exact child-specific
absence rows, every runtime command/cwd/bound, canonical pessimistic attempt
checkpoints, and a branded write-ahead/no-post-unknown fake transaction. The
three entry files are import-safe, reject caller arguments and inherited
environment before authority, and remain unreachable from package scripts.

The future npm, constructor-toolchain, construction-manifest, context, and
local-image review bindings remain `null`; build and runtime approval remain
`false`. Therefore every production entry fails closed before acquisition,
construction output, Docker, lifecycle, transfer, or result work. Positive
coverage uses only in-memory data and synthetic npm/toolchain/archive inputs;
no fixed ignored root was read or created.

`npm run m2a:transfer:verify` passes the static verifier and 1 file / 36 tests;
`npm run m2a:verify` passes 4 files / 5 tests; root typecheck passes; and root
tests pass 109 files / 839 tests. Aggregate `npm run check` reaches only the
existing out-of-scope
`containers/profile-control/test/control-host-backend.test.ts` formatting
warning, so its later lint/typecheck/test stages are not aggregate evidence.
Focused formatting and final diff checks are recorded in the implementation
worker handoff.

These are Docker-free static/unit observations only. No npm/toolchain
acquisition, production constructor/compiler, context or manifest publication,
image build or inspect, Docker/runtime-socket command, lifecycle/probe,
transfer, result/retained-state access, evidence promotion, external
communication, or standing authorization was used. M2A-CG01 through M2A-CG06
remain pending fresh independent implementation review.

Next: perform the fresh independent Docker-free read-only implementation
review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CG01 through M2A-CG06 implementation-review handoff

The fresh independent Docker-free implementation review is now recorded in
[`reviews/m2-a-evidence-transfer-construction-execution-gate-implementation.md`](reviews/m2-a-evidence-transfer-construction-execution-gate-implementation.md)
and is `BLOCKED` on M2A-CGI01 through M2A-CGI04. The current toolchain and
context validators do not close the exact admitted input/inventory union; the
fake image-build transaction publishes success without consuming the exact
observation or image-binding validators; the fake runtime transaction accepts
mismatched initializer exits and null artifact-validation payloads without the
combined candidate boundary; and all three production entries lack the fixed
private production authority implementations required behind their fail-closed
gates.

The review independently reproduced the exact 31-row
`sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04`
and 41-row
`sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526`
aggregates. Focused transfer verification passes 1 file / 36 tests, existing
M2-A verification passes 4 files / 5 tests, root typecheck passes, and root
tests pass 109 files / 839 tests. Aggregate `check` still stops at the
pre-existing out-of-scope M4 formatting warning. These passes do not close the
independently reproduced contradictions.

No source or test repair, fixed ignored-root access, production entry,
acquisition, construction, image, Docker, lifecycle, transfer, runtime/result,
evidence promotion, external communication, or standing authorization was
used. M2A-CG01 through M2A-CG06 remain closed only at contract scope and open
at implementation scope.

Next: save the exact bounded Docker-free M2A-CGI01 through M2A-CGI04
implementation-remediation prompt and fresh independent re-review prompt; do
not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI01 through M2A-CGI04 remediation prompt handoff

The exact bounded Docker-free implementation-remediation prompt is now saved
at
[`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`](../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md),
with its fresh independent re-review prompt saved before any implementation or
test repair. The pair preserves the unchanged M2A-CG06 allowlist and fixes the
later task to the four review findings: exact toolchain/context input closure,
complete image observation-to-binding correlation, complete runtime terminal/
artifact/candidate correlation, and fixed private production authorities
behind the still-closed entry gates.

No implementation, declaration, verification, package script, Containerfile,
manifest, container source, adapter/probe source, fixture, scenario,
acquisition, construction, image, Docker object, runtime/result, historical,
Expected, or `Observed` byte changed. No fixed ignored root, external
communication, or standing authorization was used. M2A-CGR01 through
M2A-CGR03 remain closed at contract scope; M2A-CGI01 through M2A-CGI04 and
M2A-CG01 through M2A-CG06 remain open at implementation scope.

Next: perform the exact bounded Docker-free M2A-CGI01 through M2A-CGI04
implementation remediation under the saved prompt; do not acquire npm or
toolchain bytes, execute a production entry, construct a context or image,
call Docker, or access runtime/result state.

## M2A-CGI01 through M2A-CGI04 implementation-remediation handoff

The bounded Docker-free remediation candidate is now implemented inside the
unchanged M2A-CG06 allowlist. M2A-CGI01's toolchain validator rejects every
row outside the exact four-family union, and the construction manifest now
consumes a privately branded correlation derived twice from the separately
validated npm archive, both settled compiler inventories, all fixed held
inputs, the deterministic fixture archive, and the complete held context
inventory. Extra, missing, reordered, aliased, sparse, unsettled, or
source-disconnected rows reject even when a caller recomputes its own
aggregate.

M2A-CGI02's fake build transaction now consumes exact terminal and value data
for all five commands, re-runs the complete image observation validator,
creates and revalidates the same canonical image-binding bytes, and records
publication only after a settled same-byte commit. M2A-CGI03's runtime
transaction now cross-binds wait/final exits, consumes copied bytes and fixed
metadata, runs completion/file/segment/marker/artifact/attempt/combined-
candidate validators in order, creates the marker parent only after completion
validation, and permits final candidate publication only after those barriers.
Unknown settlement leaves the durable checkpoint and reaches no later action.

M2A-CGI04 adds distinct private fixed constructor, image-build, and runtime
authorities behind the unchanged closed gates. Their constructors and brands
are absent from declarations and package scripts; reusable imports remain
side-effect-free. All future receipt/context/image digests remain `null`,
both build/runtime approvals remain `false`, and every
`evidenceReview` remains `not-performed`, so current entries fail before
authority creation or filesystem/process activity.

`npm run m2a:transfer:verify` passes its static verifier and 1 file / 37
tests, `npm run m2a:verify` passes 4 files / 5 tests, root typecheck passes,
and root tests pass 109 files / 840 tests. Aggregate `npm run check` exits 1
at the pre-existing
out-of-scope formatting warning in
`containers/profile-control/test/control-host-backend.test.ts` before its
lint/typecheck/test stages. These are Docker-free static/unit and
cooperative-host observations only. No production entry, acquisition,
compiler, construction, image build/inspect, Docker/runtime-socket action,
lifecycle/probe, transfer, fixed ignored-root or runtime/result access,
evidence promotion, external communication, or standing authorization was
used.

M2A-CGI01 through M2A-CGI04 and M2A-CG01 through M2A-CG06 remain open pending
the saved fresh independent Docker-free remediation re-review; no later
acquisition, construction, image, runtime, result, or evidence gate is opened.

Next: perform the fresh independent Docker-free read-only M2A-CGI01 through
M2A-CGI04 remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI01 through M2A-CGI04 implementation-remediation re-review

The fresh independent Docker-free re-review is recorded in
[`reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`](reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md)
and remains `BLOCKED`. M2A-CGI01 closes: the exact four-family toolchain union
and complete separately derived/held context correlation reject the controlled
extra and source-disconnected inputs. M2A-CGI02 through M2A-CGI04 remain open:
a known-invalid early build terminal advances through offline build before the
complete observation validator runs, forged runtime settlement strings can
pass validation and final-publication barriers, and the fixed private
authorities remain incomplete at the reviewed descriptor/process/phase
boundary.

The exact 31-row/41-row identities and current remediation hashes were bound.
Focused transfer verification passes 1 file / 37 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 840 tests. Aggregate `check` stops at the pre-existing
out-of-scope M4 formatting warning. No source/test repair, production entry,
fixed ignored-root access, acquisition, construction, image, Docker,
runtime/result, evidence promotion, external communication, or standing
authorization was used.

M2A-CGR01 through M2A-CGR03 remain closed at contract scope. M2A-CGI02 through
M2A-CGI04 and M2A-CG01 through M2A-CG06 remain open at implementation scope;
no acquisition, construction, image, runtime, result, or evidence gate opens.

Next: save the exact bounded Docker-free M2A-CGI02 through M2A-CGI04 residual-
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, execute a production entry, construct a context or image,
call Docker, or access runtime/result state.

## M2A-CGI02 through M2A-CGI04 residual-remediation prompt handoff

The exact bounded Docker-free residual-remediation prompt is now saved at
[`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md`](../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md),
with its fresh independent re-review prompt saved before any residual source or
test repair. The pair preserves closed M2A-CGI01 and the unchanged M2A-CG06
allowlist. It binds the later repair to immediate terminal/value validation
before every next image-build row, exact `settled`/`unknown` runtime branch
shapes, complete receipt-bound constructor and process settlement, and held
result/transfer identity transactions behind the still-closed entry gates.

No implementation, declaration, verification, package script, Containerfile,
manifest, container source, adapter/probe source, fixture, scenario,
acquisition, construction, image, Docker object, runtime/result, historical,
Expected, or `Observed` byte changed. No fixed ignored root, external
communication, or standing authorization was used. M2A-CGI01 remains closed;
M2A-CGI02 through M2A-CGI04 and M2A-CG01 through M2A-CG06 remain open at
implementation scope.

Next: perform the exact bounded Docker-free M2A-CGI02 through M2A-CGI04
residual remediation under the saved prompt; do not acquire npm or toolchain
bytes, execute a production entry, construct a context or image, call Docker,
or access runtime/result state.

## M2A-CGI02 through M2A-CGI04 residual-remediation handoff

The bounded Docker-free residual-remediation candidate is now complete inside
the unchanged M2A-CG06 allowlist. Both fake and fixed image-build transactions
validate each exact command terminal and parsed value before the next command;
known-invalid version, tag-absence, or pinned-base data cannot reach
`offline-build`, and invalid build data cannot reach candidate inspection or
binding publication. Checkpoint, validation, marker-parent, binding, and final
publication records now admit only the exact `settled` and `unknown` branch
shapes; contradictory or noncanonical records reject before later action.

The private constructor now opens, registers, reads, and holds all tracked,
acquisition, and receipt-listed toolchain files, including the fixed
`/usr/bin/node` row and every runtime closure row, before creating output. It
settles compiler one before reading/copying its output or launching compiler
two, and both compiler and Docker helpers have an exit-independent TERM/KILL/
final-close bound. The private runtime backend holds repository/result/
transfer directory identities, checks exact inventories around every
checkpoint, copy, marker-parent, validation, and final publication, performs
same-descriptor attempt writes, and settles all owned directory handles.

`npm run m2a:transfer:verify` passes its static verifier and 1 file / 42 tests,
`npm run m2a:verify` passes 4 files / 5 tests, root typecheck passes, and root
tests pass 109 files / 845 tests. Aggregate `npm run check` exits 1 at the
pre-existing out-of-scope formatting warning in
`containers/profile-control/test/control-host-backend.test.ts` before later
stages. These are Docker-free static/unit and cooperative-host observations
only. No production entry, acquisition, compiler, construction, image build,
Docker/runtime-socket action, lifecycle, transfer, fixed ignored-root or
runtime/result access, evidence promotion, external communication, or standing
authorization was used.

M2A-CGI01 remains closed. M2A-CGI02 through M2A-CGI04 and M2A-CG01 through
M2A-CG06 remain open pending the saved fresh independent Docker-free residual-
remediation re-review; every later issue #43 gate remains frozen.

Next: perform the fresh independent Docker-free read-only residual-remediation
re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI02 through M2A-CGI04 residual-remediation re-review

The fresh independent Docker-free re-review is recorded in
[`reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md`](reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md)
and remains `BLOCKED` only on M2A-CGI04. M2A-CGI01 remains closed. Independent
matrices close M2A-CGI02 and M2A-CGI03: row-local image validation stopped 23
known-invalid and five unknown rows before later action, while exact settlement
discrimination rejected 27 malformed publication and 30 malformed validation
records at their affected barriers.

M2A-CGI04 remains open because compiler/Docker child helpers do not retain an
earlier asynchronous error or exit cause against a later close, and runtime
inventory/publication/copy operations resolve string paths without correlating
them to the held result/transfer directory inode. The latter also omits the
contract's exact full-mode/link check. Only M2A-CG01 closes at implementation
scope; M2A-CG02 through M2A-CG06 remain open.

Focused transfer verification passes 1 file / 42 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 845 tests. Aggregate `check` stops at the pre-existing
out-of-scope M4 formatting warning. No repair, production entry, fixed ignored-
root access, acquisition, construction, image, Docker, lifecycle, transfer,
runtime/result, evidence promotion, external communication, or standing
authorization was used.

Next: save the exact bounded Docker-free M2A-CGI04 private-authority residual-
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, execute a production entry, construct a context or image,
call Docker, or access runtime/result state.

## M2A-CGI04 private-authority residual-remediation prompt handoff

The exact bounded Docker-free implementation prompt is now saved at
[`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation.md`](../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation.md),
with its fresh independent re-review prompt saved before any source or test
repair. The pair preserves closed M2A-CGI01 through M2A-CGI03,
implementation-scope M2A-CG01, and the unchanged M2A-CG06 boundary. It fixes a
strict six-path implementation subset for one shared first-cause
compiler/Docker settlement state machine, exact held-directory/path
correlation around every inventory and mutation, and behavioral fake-only
traces that exercise those same production decision boundaries.

No implementation, declaration, verification, package script, Containerfile,
manifest, container source, adapter/probe source, fixture, scenario,
acquisition, construction, image, Docker object, runtime/result, historical,
Expected, or `Observed` byte changed. No fixed ignored root, external
communication, or standing authorization was used. M2A-CGI04 and M2A-CG02
through M2A-CG06 remain open at implementation scope; later issue #43 gates
remain frozen.

Next: perform the exact bounded Docker-free M2A-CGI04 private-authority
residual remediation under the saved prompt; do not acquire npm or toolchain
bytes, execute a production entry, construct a context or image, call Docker,
or access runtime/result state.

## M2A-CGI04 private-authority residual-remediation handoff

The bounded Docker-free candidate now shares one first-cause/first-exit state
machine between the compiler and Docker helpers. It retains the first failure
and exit tuple, requires an identical later close and exact descriptor
settlement for success, bounds no-exit traces, clears owned timers once, and
ignores late events. The separately branded fake driver covers spawn, error,
exit/close mismatch, timeout, overflow, signal failure, descriptor uncertainty,
late-event, exact-success, and final-bound traces without spawning a process.

The runtime transaction now correlates held BigInt identity, effective owner,
full mode, link count, stable child identities, and exact inventory before and
after every attempt publication, copy destination, and marker-parent mutation.
It syncs through the held result/transfer descriptors and replaces broad
mutation adoption with operation-specific transitions. Unknown copy settlement
does not advance, validate, or publish and settles only already owned handles.
Fake-only traces reject replacement, metadata, inventory, copy/marker
substitution, and post-operation drift before later action.

`npm run m2a:transfer:verify` passes 1 file / 46 tests,
`npm run m2a:verify` passes 4 files / 5 tests, root typecheck passes, and root
tests pass 109 files / 849 tests. Focused Prettier checking and
`git diff --check` pass. Aggregate `npm run check` exits 1 at the pre-existing
out-of-scope formatting warning in
`containers/profile-control/test/control-host-backend.test.ts`. These are
Docker-free static/unit and cooperative-host observations only.

No production entry, fixed ignored-root access, acquisition, compiler,
construction, image build, Docker/runtime-socket action, lifecycle, transfer,
runtime/result access, evidence promotion, external communication, or standing
authorization was used. M2A-CGI01 through M2A-CGI03 and M2A-CG01 remain
closed. M2A-CGI04 and M2A-CG02 through M2A-CG06 remain open pending fresh
independent re-review; every later issue #43 gate remains frozen.

Next: perform the fresh independent Docker-free read-only M2A-CGI04 private-
authority residual-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI04 private-authority residual-remediation re-review

The fresh independent Docker-free read-only re-review is recorded in
[`reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation.md`](reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation.md)
and remains `BLOCKED` on one smaller M2A-CGI04 finding. The shared process
state machine closes first-cause compiler/Docker settlement. Parent held-inode
and pathname correlation also closes the earlier replacement contradiction.
However, a permitted directory transition validates parent identity plus
entry names/types and then adopts the entire post-operation child identity map
without proving that unchanged children retained their exact identities. The
fake trace cannot express that sibling replacement.

The exact 31-row and 41-row aggregates were reproduced. Focused transfer
verification passes 1 file / 46 tests, existing M2-A verification passes 4
files / 5 tests, and root typecheck passes. Root tests observed one out-of-
scope M4 failure after 108 files / 848 tests passed; aggregate `check` stops at
the out-of-scope M4 formatting warning. No repair, production entry, fixed
root, acquisition, compiler, construction, image, Docker, lifecycle, transfer,
runtime/result access, evidence promotion, external communication, or standing
authorization was used.

M2A-CGI01 through M2A-CGI03 and M2A-CG01 remain closed. M2A-CG02 and M2A-CG03
close at Docker-free static/unit implementation scope. M2A-CGI04 and M2A-CG04
through M2A-CG06 remain open; every later issue #43 gate remains frozen.

Next: save the exact bounded Docker-free M2A-CGI04 unchanged-child-identity
residual-remediation prompt and fresh independent re-review prompt; do not
repair source or tests in that prompt-only task.

## M2A-CGI04 unchanged-child-identity prompt handoff

The exact bounded Docker-free M2A-CGI04 unchanged-child-identity residual-
remediation prompt and fresh independent re-review prompt are now saved before
any source or test repair. The pair preserves M2A-CGI01 through M2A-CGI03 and
M2A-CG01 through M2A-CG03, and limits the later repair to full unchanged-child
identity preservation, fixed operation-specific add/rename/copy/nested-marker
deltas, hardlink-alias rejection, and matching fake-only behavioral traces
inside a strict four-path subset of the unchanged M2A-CG06 allowlist.

This prompt-only task changed no implementation, declaration, verification,
package script, lockfile, Containerfile, manifest, container source, adapter/
probe source, fixture, scenario, acquisition, construction, image, Docker
object, runtime/result, historical, Expected, or `Observed` byte. It did not
access a fixed ignored root, use external communication, or use standing
authorization. M2A-CGI04 and M2A-CG04 through M2A-CG06 remain open pending the
bounded remediation and fresh re-review; M2A-CG02/M2A-CG03 retain Docker-free
static/unit closure.

Next: perform the exact bounded Docker-free M2A-CGI04 unchanged-child-identity
residual remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation.md`;
do not repair any path outside its exact allowlist or perform acquisition,
construction, Docker, transfer, or runtime/result work.

## M2A-CGI04 unchanged-child-identity residual-remediation handoff

The bounded Docker-free candidate now validates every lexical directory entry
against one full child-identity record before any transition is accepted. The
same decision boundary is used by production and the separately branded fake
trace, and binds type, full mode, effective owner/group, link count, and BigInt
device, inode, size, and mtime while rejecting disconnected, reordered,
sparse, accessor, inherited, special, and cross-name alias data.

Six fixed operation kinds cover only `attempt.next` creation, exact-identity
rename/replacement into `attempt.json`, the fixed completion and segment copy
destinations, `probe-output/` creation, and the nested fixed marker. Every
unchanged sibling must remain fully identical. The nested marker transaction
validates both marker-parent addition and the transfer parent's inode-stable
`probe-output` size/mtime update before committing either held baseline.
Unknown nested-copy settlement marks both affected parents uncertain.

Focused transfer verification passes 1 file / 48 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 851 tests. Focused formatting and `git diff --check` pass.
The aggregate `npm run check` exits 1 at the pre-existing out-of-scope
formatting warning in
`containers/profile-control/test/control-host-backend.test.ts` before lint,
typecheck, or test stages. These observations remain Docker-free static/unit
and cooperative-host evidence only.

No production entry, fixed ignored-root access, acquisition, production
construction, image, Docker, lifecycle, transfer, runtime/result access,
evidence promotion, external communication, or standing authorization was
used. M2A-CGI01 through M2A-CGI03 and M2A-CG01 through M2A-CG03 remain closed
at their recorded scopes. M2A-CGI04 and M2A-CG04 through M2A-CG06 remain open
pending the saved fresh independent re-review; every later issue #43 gate
remains frozen.

Next: perform the fresh independent Docker-free read-only M2A-CGI04 unchanged-
child-identity residual-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI04 unchanged-child-identity residual-remediation re-review

The fresh independent Docker-free re-review in
`reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation.md`
closes the remaining unchanged-child-identity finding. Production and the
separately branded fake trace use the same complete child-identity transition
decision for all six fixed operation kinds; exact siblings, rename/
replacement, top-level copies, the correlated nested marker, hardlink aliases,
and pre-adoption stops were independently reproduced. M2A-CGI01 through
M2A-CGI04 and M2A-CG01 through M2A-CG06 are closed at their recorded contract
or Docker-free static/unit cooperative-host scopes.

Focused transfer verification passes 1 file / 48 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 851 tests. Aggregate `check` still stops at the pre-existing
out-of-scope M4 formatting warning. No implementation repair, production
entry, fixed ignored-root access, acquisition, construction, image, Docker,
lifecycle, transfer, runtime/result access, external communication, standing
authorization, or evidence promotion occurred in the review.

Next: save the exact Docker-free issue #43 npm-acquisition/constructor-
toolchain input-boundary contract and fresh independent review prompt; do not
acquire or inspect those future bytes or perform construction, Docker,
transfer, or runtime/result work.

## Dependency-input static/unit implementation handoff

The bounded Docker-free dependency-input implementation is complete without
opening this construction/execution gate. Its actual
`validateConstructorToolchain()` consumer now rejects every wrong family mode
and zero-size package row selected by M2A-IBR03; every other construction
schema, aggregate, reviewed `null` binding, execution approval, and production
path remains unchanged. Focused transfer verification passes 1 file / 56
tests, existing M2-A verification passes 4 files / 5 tests, and root typecheck
passes. Aggregate root tests retain 40 out-of-scope failures, and aggregate
`check` stops at eight pre-existing formatting warnings.

No producer, fixed input, production construction, image, Docker, lifecycle,
transfer, runtime/result, reviewed binding, `Observed` evidence, external
communication, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only dependency-input
implementation review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md`;
do not repair or execute producer/construction code in that review.

## Dependency-input implementation review decision

The fresh independent Docker-free dependency-input review is `BLOCKED`.
The actual constructor consumer's selected mode/size rules are implemented,
and M2A-IB01, M2A-IB02, M2A-IB04, and M2A-IB05 close at static/unit scope.
M2A-IB03/M2A-IB06 remain open because production does not preserve and
correlate one held attempt-root parent/child identity across the synchronous
commit, while the fake/static boundary claims that transition, and because the
required per-family/runtime/source-graph inverse matrix is incomplete.

This construction/execution gate, every reviewed `null` input binding, and
every runtime/build approval remain closed. No producer, fixed input,
construction, image, Docker, transfer, runtime/result, evidence, external
communication, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation-remediation prompt and fresh independent re-review prompt; do
not repair construction or producer code in that prompt-only task.

## Dependency-input M2A-IBI remediation prompt handoff

The exact bounded Docker-free M2A-IBI01/M2A-IBI02 implementation-remediation
prompt and fresh independent re-review prompt are saved before source or test
repair. The later repair may change only the dependency-input support/
declaration, static verifier, focused test, and minimal status allowlist. This
construction/execution gate, its reviewed `null` input bindings, and every
runtime/build approval remain closed and unchanged.

No construction or producer implementation, declaration, test, verifier,
fixed input, external communication, image, Docker, transfer, runtime/result,
evidence, Expected, or `Observed` byte changed or was accessed. Standing
authorization was not used.

Next: perform the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`;
do not activate construction or either producer, access input, call Docker, or
access runtime/result state.

## Dependency-input M2A-IBI01/M2A-IBI02 remediation handoff

The bounded Docker-free dependency-input candidate now preserves the exact held
attempt parent/child authority through initial checkpoint settlement and
behaviorally covers the runtime/source/destination/every-package-family
inverse matrix. The unchanged actual constructor consumer rejects all eight
independently rebuilt package/runtime mode and package-size contradictions.
Focused transfer verification passes 1 file / 60 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes.

This construction/execution gate, reviewed `null` input bindings, and all
execution approvals remain closed. No producer, fixed input, construction,
image, Docker, transfer, runtime/result, evidence, external communication, or
standing authorization was used. M2A-IBI01/M2A-IBI02 remain pending fresh
independent re-review.

Next: perform the fresh independent Docker-free read-only M2A-IBI01/M2A-IBI02
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation-review.md`;
do not activate construction or either producer in that review.

## Dependency-input M2A-IBI remediation re-review decision

The fresh independent Docker-free re-review closes M2A-IBI02 but remains
`BLOCKED` on M2A-IBI01. The branded fake discards its parent-sync result before
supplying literal `parentSynced: true` to the shared transition validator, and
the attempt identity narrows BigInt size through `Number`.

This construction/execution gate, reviewed `null` input bindings, and all
execution approvals remain closed. No producer, fixed input, construction,
image, Docker, transfer, runtime/result, evidence, external communication, or
standing authorization was used. M2A-IB03/M2A-IB06 remain open only on
residual M2A-IBI01.

Next: save the exact bounded Docker-free residual M2A-IBI01 parent-sync and
BigInt-identity remediation prompt plus fresh independent re-review prompt; do
not activate construction or either producer in that prompt-only task.

## Dependency-input residual M2A-IBI01 prompt handoff

The exact bounded Docker-free residual-remediation and fresh independent
re-review prompt pair is saved before source or test repair. The later task may
change only the dependency-input support/declaration, static verifier, focused
test, and minimal status allowlists to bind the exact parent-sync fact and
non-narrowed BigInt-derived attempt identity.

This construction/execution gate, reviewed `null` input bindings, and all
execution approvals remain closed. No implementation/test byte changed, and no
producer, fixed input, construction, image, Docker, transfer, runtime/result,
evidence, external communication, or standing authorization was used.
M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

Next: perform the exact bounded Docker-free residual M2A-IBI01 remediation
under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md`;
do not activate construction or either producer, access input, call Docker, or
access runtime/result state.

## Dependency-input residual M2A-IBI01 remediation handoff

The bounded Docker-free candidate now binds the exact parent-sync own-data fact
and canonical BigInt-derived attempt identity across the shared production/
fake transition. Focused transfer verification passes 1 file / 61 tests,
existing M2-A verification passes 4 files / 5 tests, and root typecheck
passes. M2A-IBI02 retains reviewed closure; M2A-IBI01/M2A-IB03/M2A-IB06 remain
open pending fresh independent re-review.

This construction/execution gate, reviewed `null` input bindings, and all
execution approvals remain closed. No producer, fixed input, construction,
image, Docker, transfer, runtime/result, evidence, external communication, or
standing authorization was used.

Next: perform the fresh independent Docker-free read-only residual M2A-IBI01
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md`;
do not activate construction or either producer in that review.

## Dependency-input residual M2A-IBI01 re-review decision

The fresh independent Docker-free re-review is `BLOCKED` only on the missing
behavioral exact-key-shape attempt-identity cases and incomplete four-field
static identity guard. The current source closes the original parent-sync and
BigInt-size defects, but M2A-IBI01/M2A-IB03/M2A-IB06 remain open until those
verification boundaries are remediated and freshly re-reviewed. M2A-IBI02 and
M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain static/unit closure.

This construction/execution gate, reviewed `null` input bindings, and every
execution approval remain closed. No producer, fixed input, external
communication, construction, image, Docker, transfer, runtime/result,
evidence, `Observed`, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-IBI01 identity-shape/static-
verifier remediation prompt and fresh independent re-review prompt; do not
activate construction or repair source/tests in that prompt-only task.

## Dependency-input M2A-IBI01 identity-verification prompt handoff

The exact bounded Docker-free M2A-IBI01 identity-verification remediation and
fresh independent re-review prompt pair is saved before verifier or focused-
test repair. The later task is limited to the dependency-input static verifier,
focused test, and minimal status allowlist; this construction/execution gate
and the reviewed `null` bindings remain outside the repair.

No implementation, declaration, verifier, test, producer, fixed input,
construction, image, Docker, transfer, runtime/result, evidence, Expected, or
`Observed` byte changed. No external communication or standing authorization
was used. M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain reviewed
static/unit closure; M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

Next: perform the exact bounded Docker-free M2A-IBI01 identity-verification
remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md`;
do not activate construction, edit the support source/declaration, import or
execute either producer, access input, call Docker, or access runtime/result
state.

## Dependency-input M2A-IBI01 identity-verification remediation handoff

The bounded Docker-free candidate adds all seven exact-key-shape
attempt-identity failures and exact four-field BigInt encoding guards to the
focused verification boundary. Focused transfer verification passes 1 file /
62 tests, existing M2-A verification passes 4 files / 5 tests, and root
typecheck passes. Aggregate root tests retain 39 out-of-scope failures, and
aggregate `check` stops at eight pre-existing formatting warnings.

The reviewed dependency-input support/declaration, parent-sync edge,
construction source/declaration, null reviewed construction bindings, false
execution approvals, and candidate/evidence separation remain unchanged.
M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain reviewed static/unit
closure; M2A-IBI01/M2A-IB03/M2A-IB06 remain open pending fresh independent
re-review.

No producer, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, evidence, Expected,
`Observed`, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-IBI01 identity-
verification remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation-review.md`;
do not repair source/tests or execute either producer in that review.

## Dependency-input M2A-IBI01 identity-verification re-review decision

The fresh independent Docker-free read-only re-review is `APPROVED` at
static/unit cooperative-host implementation scope. All seven attempt-identity
exact-key-shape cases reach the shared correlation decoder and retained
pre-checkpoint/pre-runtime failure boundary without invoking the accessor
getter or Proxy traps. Static verification binds all four BigInt-derived
device/inode/size/mtime production encodings and rejects direct `Number`
narrowing of each.

M2A-IBI01/M2A-IBI02 and M2A-IB01 through M2A-IB06 are now closed at
implementation scope. The construction source/declaration, null reviewed input
bindings, false execution approvals, and candidate/evidence separation remain
unchanged; no construction or execution gate is opened.

No producer, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, evidence, Expected,
`Observed`, or standing authorization was used.

Next: save the exact bounded npm-acquisition producer-execution contract and
fresh independent review prompt; do not execute the producer, access fixed
input, or use external communication in that prompt-only task.

## npm-acquisition producer execution-gate contract handoff

The separate Docker-free M2A-NG01 through M2A-NG06 contract and fresh review
prompt are saved. They preserve the approved construction/execution-gate
implementation while keeping both reviewed acquisition bindings `null`,
runtime execution approval `false`, and construction unreachable.

No producer, fixed root, host environment/runtime, external communication,
npm candidate byte, construction, image, Docker, transfer, runtime/result,
evidence, Expected, `Observed`, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-NG01 through
M2A-NG06 contract review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-review.md`;
do not execute or import the producer, access the fixed acquisition root or
host environment/runtime, or use external communication.

## npm-acquisition producer execution-gate contract-review decision

The fresh independent Docker-free read-only review is `BLOCKED` on
M2A-NGR01/M2A-NGR02: the entry does not bind the exact executable/script argv
pair, and the acquisition-root directory link rule contradicts production.
M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 close at contract scope while
M2A-NG01/M2A-NG03 remain open.

The construction source/declaration, null reviewed acquisition bindings, false
runtime approval, and evidence separation remain unchanged. Focused transfer
verification passes 1 file / 62 tests. No producer, fixed root, host
environment/runtime, external communication, npm candidate, construction,
Docker, runtime/result, evidence, Expected, `Observed`, or standing
authorization was used.

Next: save the exact bounded Docker-free M2A-NGR01/M2A-NGR02
contract-remediation prompt and fresh independent re-review prompt; do not
repair contract/source/tests or execute the producer in that prompt-only task.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation prompt handoff

The exact bounded Docker-free remediation and fresh independent re-review
prompt pair is saved before acquisition contract/source/test repair. It is
restricted to the acquisition entry, transfer static verifier, focused test,
the npm-acquisition gate contract, and minimal status records. The task fixes
only host/process invocation authority and acquisition-root directory-link
semantics.

The construction source/declaration, null reviewed acquisition bindings, false
runtime approval, and evidence separation remain unchanged and unreachable.
Only the saved prompt pair and minimal status records changed. No execution-
gate requirement, implementation, verifier, test, producer, fixed root, host
environment/runtime, external communication, npm candidate, construction,
Docker, runtime/result, evidence, Expected, `Observed`, or standing
authorization changed or was used. M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06
retain contract-scope closure; M2A-NG01/M2A-NG03 remain open.

Next: perform the exact bounded Docker-free M2A-NGR01/M2A-NGR02 remediation
under
`../prompts/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation.md`;
do not import or execute the producer, activate construction, access fixed or
host runtime state, or use external communication.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation handoff

The bounded Docker-free candidate now binds the reviewed lexical host command
separately from exact canonical Node process state before producer
reachability and aligns the acquisition-root directory with production's
positive-link-count predicate while preserving exact-one publication files.
Function-scoped static weakening cases cover both repairs. The fresh
three-file aggregate is
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.

Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests retain 99 passing / 10 failing files and 826 passing / 39 failing
tests; aggregate `check` stops at eight pre-existing formatting warnings.
M2A-NG01/M2A-NG03 remain open pending fresh re-review; the other M2A-NG items
retain contract-scope closure. Construction remains inactive with null
reviewed acquisition bindings and false runtime approval.

No producer, fixed root, host runtime, external communication, npm candidate,
construction, Docker, runtime/result, evidence, Expected, or `Observed`
boundary was used. Standing authorization was not used.

Next: perform the fresh independent Docker-free read-only M2A-NGR01/M2A-NGR02
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation-review.md`;
do not repair source/tests, execute the producer, activate construction, access
fixed or host runtime state, or use external communication.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation re-review

The fresh independent Docker-free read-only re-review is `APPROVED` at
contract/static entry-guard scope. Complementary lexical-host/canonical-Node
authority closes M2A-NGR01/M2A-NG01, and positive directory-link versus
exact-one file predicates close M2A-NGR02/M2A-NG03. All M2A-NG items are
closed only at contract scope.

The construction source/declaration, null reviewed acquisition bindings, false
runtime approval, and evidence separation remain unchanged and unreachable.
Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. No producer,
fixed root, host runtime, external communication, npm candidate, construction,
Docker, runtime/result, evidence, Expected, or `Observed` boundary was used.
Standing authorization was not used and cannot authorize the external
occurrence.

Next: save the exact adjacent-preflight/one-occurrence execution prompt and
separate Docker-free fixed-root result-review prompt; do not execute the
producer, activate construction, access fixed or host runtime state, or use
external communication in that prompt-only task.

## npm-acquisition one-occurrence/result-review prompt handoff

The exact execution/result-review pair is now saved with SHA-256 identities
`cab8482f...57b0d8f` and `a62a49b1...856aa8b`. The execution prompt permits no
construction and requires explicit human external authority before one
adjacent direct producer occurrence. The result-review prompt can record an
accepted candidate identity only as a later handoff; it cannot replace either
null reviewed acquisition binding, approve runtime, construct a context or
image, call Docker, transfer, or promote evidence.

No producer, fixed root, host runtime, external communication, npm candidate,
construction, Docker, runtime/result, evidence, Expected, or `Observed`
boundary was used. Standing authorization was not used and cannot authorize
the external occurrence; construction remains inactive.

Next: a person must freshly review the saved prompt pair and explicitly
authorize the four exact M2A-NG06 external/fixed-side-effect conditions before
the one-occurrence execution prompt may run.
