# M0/M2-A fresh evidence-transfer contract

Status: **bounded transfer implementation independently approved; M2A-TRR01
through M2A-TRR03 and M2A-TR01 through M2A-TR06 are closed only at
static/unit scope; M2A-CGR01 through M2A-CGR03 and M2A-CG01 through M2A-CG06
are closed at contract scope; the unchanged-child-identity residual-
remediation re-review closes M2A-CGI01 through M2A-CGI04 and M2A-CG01 through
M2A-CG06 at the Docker-free static/unit cooperative-host implementation
boundary; acquisition, construction, image build, Docker execution, transfer,
result acceptance, and evidence promotion remain unapproved**

Contract date: 2026-07-21

This document defines frozen-research issue #43's first new measurement
generation. It carries the already reviewed M0 npm approval conditions into one
M2-A approved-rebuild occurrence and replaces the failed tmpfs copy requirement
with one fresh retained named-volume transfer. It does not execute Docker,
approve an implementation, accept a result, or change any historical M0 bytes.

## Decision IDs and scope

The fresh contract review must decide:

- **M2A-TR01 — fresh identity and immutable historical boundary**
- **M2A-TR02 — exact M0-to-M2-A occurrence and input closure**
- **M2A-TR03 — named-volume, container, and process settlement**
- **M2A-TR04 — completion publication and official-tool transfer**
- **M2A-TR05 — validity, sanitization, and evidence non-promotion**
- **M2A-TR06 — later implementation and negative-test allowlist**

Only one unprofiled M2-A approved-rebuild occurrence is in scope. The task is
not the `npm12-approved-control-p` or `npm12-approved-control-c` matrix row and
does not establish permissive/constrained enforcement. Unapproved install is a
setup control inside this occurrence; it is not a second measurement.

## M2A-TR01 — fixed fresh generation

| Role | Fixed value |
| --- | --- |
| Generation | `20260721-01` |
| Expected revision | `m2a-transfer-expected-20260721-01` |
| Scenario | `m2a-npm-lifecycle` |
| Run ID | `m2a-npm-lifecycle-20260721000000000000000000000001` |
| Ignored result root | `results/runs/m2-a/m2a-npm-lifecycle-20260721000000000000000000000001` |
| Container run root | `/work/m2a-npm-lifecycle-20260721000000000000000000000001` |
| Initializer container | `tskaigi-m2a-transfer-init-20260721-01` |
| Measurement container | `tskaigi-m2a-transfer-run-20260721-01` |
| Transfer volume | `tskaigi-m2a-evidence-20260721-01` |
| Candidate image tag | `tskaigi-m2a-transfer:20260721-01` |

All earlier M0/M2-A run IDs, result paths, containers, stdout bundles,
sanitized examples, marker bytes, and npm observations are immutable. A later
validator accepts only the tuple above and rejects every historical or
caller-selected substitute. The candidate image ID is intentionally not fixed
by this contract: a Docker-free implementation and fresh implementation/gate
review must first bind its complete construction and record the exact local
`sha256:` image ID before any command can be approved.

The exact result root, both container names, and the volume name must all be
absent before the first mutation. A present, malformed, uncertain, or
unsettled object is terminal Inconclusive. Nothing is deleted, repaired,
renamed, or reused. The generation is attempted at most once and is never
retried on any outcome.

## M2A-TR02 — exact occurrence and input closure

### Preserved M0 facts

The occurrence retains only these M0 inputs:

- Linux, Node.js `v24.18.0`, npm `12.0.1`, and the already recorded
  `node:24.18.0-bookworm-slim` base digest;
- a private image-local tarball, offline npm commands, `postinstall`, and the
  official `npm approve-scripts` command;
- fresh `/work`, npm home, cache, prefix, consumer, lockfile, and
  `node_modules` state;
- non-root measurement execution, read-only root filesystem, no external
  network, no bind mount, and no host/runtime socket in either container; and
- the distinction between Official, Expected, Observed, Unknown, and
  Inconclusive.

No historical marker, summary, raw output, stdout bundle, approval file, or
result root is an input. The historical `file:` approval representation and
marker counts remain M0 Observed facts, not bytes to copy into the fresh run.

### Fixed adapter occurrence

The image contains the existing private dependency
`@tskaigi-lab/m2a-install-probe@1.0.0`, whose only lifecycle command remains:

```text
node /opt/m2a-adapter/dist/lifecycle-entry.js
```

The container runner performs exactly this ordered npm flow with fixed argv,
fixed working directory, `shell: false`, a 120,000 ms bound per npm child, and
a 65,536-byte bound for each stdout and stderr stream:

1. `npm install` from an absent approval and absent lock/node_modules state;
2. `npm approve-scripts @tskaigi-lab/m2a-install-probe`;
3. clear only the fixed probe output/segment names, which must still be absent;
4. `npm rebuild @tskaigi-lab/m2a-install-probe` as the measured command.

Step 1 must exit zero with the approval absent and no producer segment. Step 2
must exit zero and establish exactly the fixed local-tarball approval selected
by npm itself. Step 3 is an absence assertion, not cleanup of a prior
occurrence. Step 4 inherits only the fixed npm environment plus the four
enumerated `PROBE_CANARY_M2A_*` variables. The environment canary remains
private container input and is never serialized or transferred.

Before the measured rebuild, the runner creates the fixed canary file and
source snapshot beneath the run root, verifies their regular-file identity and
bounds, starts only the fixed `127.0.0.1` probe protocol on port `37001`, and
sets the M2-A run ID/root/port bindings. The service is loopback-only despite
container network mode `none`. The lifecycle process and loopback server must
both settle before terminal publication.

The existing M2-A Expected event contract is unchanged:

```text
0 route-invocation:npm-lifecycle-invocation
1 capability-attempt:npm-lifecycle-attempt-environment
2 capability-attempt:npm-lifecycle-attempt-file-read
3 capability-attempt:npm-lifecycle-attempt-file-hash
4 capability-attempt:npm-lifecycle-attempt-file-write
5 capability-attempt:npm-lifecycle-attempt-loopback
6 capability-attempt:npm-lifecycle-attempt-child
```

There is exactly one producer, `workerId` remains `null`, and there are no tool
API targets or changes. The route is Expected to occur once. Capability
outcomes are observations: a failure or Expected mismatch is not rewritten to
success and does not by itself make a structurally complete producer segment
invalid.

### Contract-time source binding

The current adapter/probe input is 31 repository files. Its ordered digest
manifest is constructed by listing, in this order, `package-lock.json`, the two
package manifests, the two M2-A fixture manifests, and then the lexically
sorted files under `packages/npm-lifecycle-probe/src/` and
`packages/probe-core/src/`. Each row is the lowercase `sha256sum` output line,
including its path and LF. SHA-256 of the complete row sequence is:

```text
sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04
```

The individual anchor hashes are:

| Input | SHA-256 |
| --- | --- |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `packages/probe-core/package.json` | `0d71338f1e232269fdfce8f097851b9404b9532c5089df4dffbb3f5aa788b520` |
| `packages/npm-lifecycle-probe/package.json` | `834278a7654bda1acb7ac9f4337b088173d816c86307f312c55d96447a91c59b` |
| consumer fixture manifest | `ab3c01396a1eac8a8a149f15c2ed09d5bb78aec203a7d5a958845d8bb7ceaefb` |
| dependency fixture manifest | `a411bf6c3cdf02f8b02247095740a62181a384a2dfccb04a5643f63d70f20fd1` |

A later Docker-free constructor must revalidate all 31 rows, compile the two
packages with the pinned repository toolchain, and produce a complete ordered
compiled/package/image-context manifest. No tracked source may be changed to
make construction pass. The later implementation review, not this contract,
must bind every constructed byte and the final local image candidate.

## M2A-TR03 — retained named-volume boundary

### Why this is a new transfer method

M0 required `docker cp` from `/m0-output`, but that path was tmpfs. Docker
`29.6.1` reported a fixed control file absent even while its writer observed it
inside the running container. The attached stdout bundle preserved bounded M0
observations but was explicitly Inconclusive and is not an M1/M2 transport.

This generation does not reinterpret that fallback. It proposes one named
Docker volume mounted at the run root and only post-exit `docker cp` of fixed
regular files from the stopped measurement container. Whether Docker
`29.6.1` actually exposes those volume-backed files through its official copy
API remains unobserved until the one-shot attempt. Copy failure, absence, or a
metadata/byte mismatch is terminal transfer Inconclusive. There is no stdout,
logs, archive, bind-mount, `exec`, or second-container fallback.

### Initializer

The exact volume is created once with the local driver and fixed generation
labels. The initializer uses the reviewed image ID, network `none`, read-only
root filesystem, `--cap-drop ALL`, `no-new-privileges`, PID/memory/CPU limits,
no tmpfs, and exactly one writable mount of the named volume at the fixed run
root. It runs as `0:0` only to initialize the root-owned fresh volume; it does
not load npm, the fixture, adapter, or probe.

Its fixed Node entry accepts no argument or environment input. It requires the
mounted root to contain no entry, changes only that root to mode `01777`, and
atomically publishes exactly `.volume-ready.json` as a one-link regular file
with mode `0444`. The canonical record contains only schema, generation,
run ID, and volume logical ID. It syncs the file and directory, closes all
descriptors, and exits. No `chown`, source read, content from the host, or
arbitrary path is permitted.

The initializer is started detached, waited with a 30,000 ms absolute
deadline, and inspected once. A valid natural exit `0` is required. Unknown
CLI/container settlement stops the task. A known failure may be recorded only
after every launched CLI settles; it cannot be repaired. The stopped
initializer is retained and never restarted or removed.

### Measurement container

Only after valid initializer settlement may the measurement container be
created. Its fixed policy is:

- exact reviewed image ID and name, `--pull never`, user `1000:1000`;
- network `none`, read-only root filesystem, unprivileged, all capabilities
  dropped, no-new-privileges, PID limit `64`, memory `512m`, CPU `1`;
- tmpfs only at `/work` and `/tmp`, both `rw,nosuid,nodev,noexec`, with the
  existing M0 sizes and `1000:1000` ownership;
- exactly one nested writable named-volume mount at the fixed run root;
- no bind, anonymous volume, host home, credential, agent, device, runtime
  socket, host network, caller-selected path, command, argument, environment,
  image, or runtime option; and
- one fixed image entry, with no user arguments.

The pre-start inspection projection must bind the container ID, exact image
ID/name, fixed entry/argv, user, environment-name allowlist, network, rootfs,
security, resource, tmpfs, and named-volume destination/name/read-write state.
Raw inspect bytes and Docker-managed host source paths are bounded in memory,
not persisted, and not included in evidence.

### Host lifecycle and settlement

Every Docker CLI invocation is exactly `/usr/bin/docker` with `shell: false`,
the repository-owned empty `HOME`/`DOCKER_CONFIG`, no inherited Docker
variables, a 16,384-byte combined output ceiling, and a fixed child handle.
External network is prohibited; build/input acquisition is not part of the
experiment occurrence.

The later host state machine is exactly:

```text
absence preflight
  -> volume create
  -> initializer create -> inspect -> start -> wait -> final inspect
  -> measurement create -> inspect -> start -> wait -> final inspect
  -> post-exit fixed docker cp transfers
  -> canonical host attempt record
  -> retain every Docker object
```

Detached `start` has a 30,000 ms CLI deadline. Measurement `wait` uses the
remaining time before an absolute 180,000 ms container deadline measured from
start launch. One final inspect follows only a known-settled start/wait path.
No command is retried. There is no stop, kill, remove, volume remove, logs,
attach, exec, pause, restart, commit, export, or unrestricted inspect.

A CLI timeout sends TERM and then KILL only to that held host-side Docker CLI
process. That establishes neither container nor runner settlement. If CLI
settlement is unknown, all later Docker and filesystem actions stop. Transfer
is permitted only when every launched CLI is settled and final inspect proves
the measurement container reached natural `exited` state with an exact exit
code. A forced or inferred stop is never natural settlement.

The first failure is chronological and write-once. Later inspect, transfer,
validation, or recording failures remain secondary and cannot replace it.
Failure to write a host attempt record never authorizes a second attempt.

## M2A-TR04 — durable completion and transfer

### Volume inventory and private data

The initialized run root begins with exactly `.volume-ready.json`. The runner
may add only:

```text
canary/
canary/input.txt
input-snapshot.txt
probe-output/
probe-output/direct-write-marker.json   # conditional on write success
npm-lifecycle-producer.jsonl            # conditional on session creation
transfer-completion.json
transfer-completion.next                # absent after a valid publication
```

The canary directory/file, environment canary, and source snapshot are
container-private inputs. They are never copied, serialized into host records,
read after the attempt by the contract task, or accepted as evidence. The
producer segment and direct marker retain probe-core's original exclusive
creation, bytes, and `0600` mode; the runner must not rewrite, chmod, append,
rename, or repair them.

### Completion publication

After the measured npm child and loopback server have both settled, the runner
captures the fixed output inventory through no-follow regular-file descriptors.
It records only relative logical paths, presence, byte length, and SHA-256; it
does not record canary content/hash, absolute paths, raw npm output, errors,
timestamps, PIDs, device/inode, or Docker data.

It then publishes one canonical JSON line using schema
`m2a-transfer-completion/v1`. The ordered top-level keys are:

```text
schemaVersion, generation, expectedRevision, runId, scenarioId,
toolchain, npmFlow, runnerSettlement, outputInventory, status, issue
```

The fixed meanings are:

- `toolchain`: exact observed Node/npm versions only;
- `npmFlow`: the three fixed step IDs/argv identities, exit/signal/timeout/
  truncation scalars, approval absent/present projection, and lock hash
  before/after; never stdout/stderr or package bytes;
- `runnerSettlement`: exact ordered `npmChildClosed`, `loopbackClosed`, and
  `prePublicationDescriptorsClosed` booleans; the last covers only handles
  opened before `publishCompletion()` and may be true only after every branch
  settles and every such close succeeds. It does not claim settlement of the
  later publication handles;
- `outputInventory`: exactly the segment row when present and the marker row
  when present, in that order, each with relative path, size, SHA-256, and
  mode; and
- `status`/`issue`: `complete/null` only after all prerequisites settle;
  otherwise `inconclusive/<one allowlisted code>`.

The record is at most 16,384 bytes including LF. The runner creates
`transfer-completion.next` exclusively with `0600`, writes and syncs the whole
line, rereads the same descriptor for byte equality, changes it to `0444`,
closes it, atomically renames it over the previously absent canonical name,
syncs the retained run-root directory descriptor, revalidates path and
ancestor identity, and performs no later fallible operation. The canonical
name is the sole publication commit. Any earlier failure leaves it absent and
at most retains `.next`; it is not repaired.

### Official copy sequence

After natural container exit, host transfer uses only the official fixed
`docker cp` commands below, each as a separate bounded child and only to an
absent exact destination beneath the private `transfer/` directory:

1. `transfer-completion.json`;
2. `npm-lifecycle-producer.jsonl` only if the validated completion lists it;
3. `probe-output/direct-write-marker.json` only if the validated completion
   lists it.

The host never copies a directory, wildcard, archive, symlink, private input,
container log, stdout/stderr, npm state, or unspecified path. Each copy source
uses the exact stopped container name plus absolute fixed source path. A
completion that is missing, malformed, over limit, non-canonical, or lists an
unknown/duplicate/reordered output forbids later copies.

After each copy child emits `close`, the host opens the destination with
no-follow semantics and requires an exact private parent identity, host owner,
one-link regular file, no special bits, the source-declared `0600` mode for
segment/marker or `0444` for completion, bounded size, stable same-descriptor
read, and exact SHA-256. Docker-copy metadata is not normalized; any mismatch
is Inconclusive. Source/copy equality is checked only against the published
completion and does not turn the completion into proof of its own truth.

The producer segment is independently revalidated as exactly seven canonical
`probe-event/v2` LF-terminated records against the fixed M2-A manifest, run,
producer, IDs, order, and `producerSequence` `0..6`. The route must be success.
All capability outcomes and normalized codes are retained. If file-write is
success, the marker must be present and match its event hash and exact
`probe-marker/v1` run/scenario/attempt bytes. If file-write is failure, the
marker must be absent from both completion and transferred inventory.

## M2A-TR05 — result classification and evidence boundary

A later host attempt record uses schema `m2a-transfer-attempt/v1`. It contains
only the fixed identities, independently reviewed image ID, sanitized
initializer/measurement settlement projections, natural container exit,
completion/segment/marker transfer states, chronological issue codes, and
`evidenceReview: "not-performed"`. It contains no raw Docker output, inspect
source path, npm log, canary, container environment value, host absolute path,
credential, device/inode, or arbitrary error text.

The one-shot execution may establish only an immutable candidate attempt:

- **complete candidate**: natural measurement exit `0`, valid completion,
  valid exact segment, conditional marker consistency, and every required copy
  settled and validated;
- **failure candidate**: valid complete transport but the fixed measured npm
  command or lifecycle route reported a real operation failure; or
- **Inconclusive candidate**: any identity, isolation, setup, settlement,
  completion, copy, schema, sequence, sanitization, or host-record uncertainty.

An Expected capability mismatch remains a visible complete observation; it is
not an automatic transfer failure. Missing/partial producer bytes, a forced or
unknown settlement, and transfer uncertainty are never zero events or
success. The direct marker cannot prove route or segment completeness.

Even a complete candidate does not establish accepted runtime evidence. A
fresh independent Docker-free result review must inspect only the fixed bounded
candidate files, reproduce their validations, and decide acceptance. Before
that decision there is no M2-A runtime result, matrix `Observed`, profile
result, M3 ingestion, presentation promotion, generalized npm claim, or change
to M0's Inconclusive status. Historical M0 evidence and this fresh occurrence
must remain separate rows and evidence classes.

The retained stopped containers and named volume are not cleanup debt that an
agent may resolve implicitly. No later task may restart, inspect beyond an
exact separately reviewed result/cleanup boundary, copy another path, remove,
or mutate them without new authority. Retention is the cooperative-host limit:
the contract does not defend against another same-authority Docker client
mutating retained objects.

## M2A-TR06 — bounded later implementation

If and only if the fresh contract review closes M2A-TR01 through M2A-TR06, it
may approve one Docker-free static/unit implementation limited to:

```text
package.json
experiments/npm12-install/Containerfile.m2a-transfer
experiments/npm12-install/m2a-transfer-manifest.json
experiments/npm12-install/container/initialize-m2a-volume.mjs
experiments/npm12-install/container/run-m2a-transfer.mjs
experiments/npm12-install/scripts/m2a-transfer-lib.mjs
experiments/npm12-install/scripts/m2a-transfer-lib.d.mts
experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs
tests/m2a-evidence-transfer.test.ts
experiments/npm12-install/README.md
results/runs/README.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
prompts/m2-a-evidence-transfer-implementation.md
prompts/reviews/m2-a-evidence-transfer-implementation-review.md
```

The implementation may add only Docker-free construction, pure validators,
the fixed initializer/runner source, a fake backend state machine, static
checks, focused tests, and verification scripts. It must not add an executable
production Docker entry or argument-free execution script, construct or access
the result root, invoke Docker, run npm lifecycle commands, build an image,
stage runtime input, create a volume/container, access retained state, ingest
evidence, or change Expected/Observed values.

Focused negative coverage must include every fixed identity substitution;
historical tuple reuse; input/hash/order drift; arbitrary argv/environment;
image/volume/mount/policy drift; bind/tmpfs fallback; initializer extra entry;
unknown CLI/container/child settlement; early transfer; directory/wildcard or
extra copy; symlink/hardlink/type/mode/owner/size/hash/canonical-byte drift;
torn/extra/reordered completion and segment records; marker/event
inconsistency; stdout/log fallback; first-failure displacement; retry,
restart, cleanup, result promotion, and broad public-entry reachability.

The implementation must save both prompts before changing source. A fresh
independent Docker-free implementation review must bind the complete generated
context and decide a separate construction/execution-gate task. This contract
does not preapprove image construction, Docker, the one-shot command, standing
authorization use, or result review.

## Contract-task evidence and next gate

This contract task read repository-controlled source and documentation only.
It computed the 31-file digest above without filesystem output. It did not run
Docker, a build, npm install/pack/approve/rebuild, the lifecycle entry, a probe,
the M0/M2-A runner, transfer, result validation, or cleanup. It did not access
ignored/historical result roots, Docker/runtime state, credentials, the host
environment, or external network. Standing authorization was not needed.

The approved implementation saved its exact implementation and independent
review prompts before source changes. It now provides the fixed manifest and
non-executed Containerfile, no-argument initializer/runner sources, pure
tuple/plan/inspection/completion/segment/marker/attempt validators, a branded
fake-only state machine, static verification, and focused negative tests. It
adds no production Docker backend or argument-free execution script.

`npm run m2a:transfer:verify` passes its static verifier and 1 file / 16 tests;
the existing `npm run m2a:verify` passes 4 files / 5 tests; and root no-emit
typecheck passes. An initial root test run passed 109 files / 819 tests; the
final rerun was non-green at 108 files / 818 tests on one out-of-scope dirty M4
`M4_CONTROL_PATH` failure. Aggregate `check` also stops on the pre-existing M4
formatting warning before lint/typecheck/test. These are Docker-free static/unit
observations only. No image/context construction, Docker or runtime-socket
operation, npm install/pack/approve/rebuild, lifecycle/probe execution,
transfer, result-root or retained-state access, cleanup, Expected/Observed
change, external network, or standing authorization occurred.

The fresh independent Docker-free implementation review is recorded in
[`reviews/m2-a-evidence-transfer-implementation.md`](reviews/m2-a-evidence-transfer-implementation.md).
It reproduces the fixed tuple and 31-file aggregate and closes M2A-TR01 and
M2A-TR02, but blocks M2A-TR03 through M2A-TR06 on four bounded gaps: incomplete
fixed host command/environment plans, predeclared/ignored terminal descriptor
settlement, complete completion acceptance of timeout/signal/truncation drift,
and incoherent or unsanitized attempt acceptance. The positive Docker-free
verification remains valid but does not close those negative paths.

The exact bounded remediation prompt and fresh independent re-review prompt
are now saved before any remediation source or test change. That prompt-only
task changed no implementation, verification, runtime, result, historical,
Expected, or `Observed` byte and used no standing authorization.

The bounded Docker-free remediation is now complete under the unchanged
M2A-TR06 boundary. `createFixedDockerPlan()` and its strict validator contain
the complete absence/create/pre-inspect/start/wait/final-inspect/copy argv,
the exact three-key credential-empty CLI environment, fixed deadlines/output
bound, and exclusive mode-`0700` empty-directory policy. Initializer and runner
publication handles enter one close-settlement path without ignored close
failures; a late close leaves a nonzero process terminal and the fake host
state machine rejects a committed-completion/nonzero-exit contradiction as
Inconclusive. Complete npm steps now require close, exit zero, null signal, no
timeout, and no stdout/stderr truncation, while unsuccessful scalars remain
available only in Inconclusive completion records. Attempt validation now uses
one closed code/step vocabulary, a write-once first issue, and exact
initializer/measurement/natural-exit/transfer prerequisite states.

`npm run m2a:transfer:verify` passes its static verifier and 1 file / 22 tests;
`npm run m2a:verify` passes 4 files / 5 tests; root no-emit typecheck passes;
and `npm test` passes 109 files / 825 tests. Aggregate `npm run check` remains
non-green only because its formatting stage reproduces the pre-existing
out-of-scope `containers/profile-control/test/control-host-backend.test.ts`
warning, so later check stages did not run in that aggregate command. These
are Docker-free static/unit observations only. No image/context construction,
Docker/runtime-socket operation, npm install/pack/approve/rebuild,
lifecycle/probe execution,
transfer, result-root or retained-state access, cleanup, Expected/Observed
change, external network, Remote Git, publication, or standing authorization
occurred.

The fresh independent Docker-free remediation re-review is recorded in
[`reviews/m2-a-evidence-transfer-implementation-remediation.md`](reviews/m2-a-evidence-transfer-implementation-remediation.md).
It reproduces the fixed 31-file aggregate and all positive verification. It
closes M2A-TRI03, but leaves three residuals: nested JSON comparison accepts an
inherited Docker environment property; the completion claims descriptor
settlement before publication and lacks an all-settled barrier for parallel
owned handle work; and no candidate boundary cross-binds completion-listed
outputs to canonical attempt transfer states. M2A-TR03 through M2A-TR06 remain
blocked and no construction/execution gate is approved.

The exact bounded residual-remediation prompt and fresh independent re-review
prompt are now saved before any residual source or test change. They bind only
M2A-TRR01 through M2A-TRR03 under the unchanged M2A-TR06 paths: recursive exact
own plan data, the exact `prePublicationDescriptorsClosed` representation with
all-settled pre-publication ownership, and one pure
`validateCandidateTransfer()` cross-validator. No implementation,
verification, runtime, result, historical, Expected, or `Observed` byte
changed in this prompt-only task. No image/context construction, Docker,
lifecycle, transfer, result/retained-state access, external communication, or
standing authorization was used.

The bounded Docker-free residual remediation is now complete under that exact
allowlist. `validateFixedDockerPlan()` recursively checks each record and array
prototype, ordered own keys, data descriptors, dense indices, and supported
primitive before comparing values, so inherited, accessor, symbol, sparse,
custom-prototype, reordered, and substituted nested plan data fail closed
without invoking getters. The runner registers every pre-publication handle,
uses full all-settled barriers for both descriptor-owning pairs, and publishes
only the truthful `prePublicationDescriptorsClosed` field; publication handles
remain outside that persisted claim and a late close still exits `70`.
`validateCandidateTransfer()` re-runs the canonical attempt, completion, and
artifact validators and cross-binds fixed output inventory, transfer states,
artifacts, status, and the sole transferable rebuild issue.

`npm run m2a:transfer:verify` passes its static verifier and 1 file / 25 tests;
`npm run m2a:verify` passes 4 files / 5 tests; root no-emit typecheck passes;
and `npm test` passes 109 files / 828 tests. Aggregate `npm run check` remains
non-green only because its formatting stage reproduces the pre-existing
out-of-scope `containers/profile-control/test/control-host-backend.test.ts`
warning, so its later stages did not run. These are Docker-free static/unit
observations only. No container source was imported or executed, and no image,
Docker/runtime-socket operation, lifecycle/probe execution, transfer,
result/retained-state access, cleanup, historical/Expected/`Observed` change,
external communication, or standing authorization was used. Finding closure
and any later construction contract remain subject to the saved fresh review.

Next: perform the fresh independent Docker-free read-only M2A-TRR01 through
M2A-TRR03 residual-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-implementation-residual-remediation-review.md`;
do not construct an image or execute transfer/runtime commands.

The fresh residual-remediation re-review is now recorded in
[`reviews/m2-a-evidence-transfer-implementation-residual-remediation.md`](reviews/m2-a-evidence-transfer-implementation-residual-remediation.md).
It closes recursive exact-own-data validation and the truthful all-settled
pre-publication/publication-handle boundary. It also reproduces both directions
of the earlier inventory/attempt contradiction as rejected.

The decision remains `BLOCKED` on M2A-TRR03. A canonical completion with all
three npm steps successful and all three runner-settlement booleans false is
still accepted as the sole `M2A_REBUILD_FAILED` combined candidate when the
attempt repeats that issue at `validate-completion`. The combined validator
therefore does not yet prove a real settled rebuild failure or valid complete
transport. Focused/static verification, existing M2-A verification, root
typecheck, and 109 files / 828 tests pass; aggregate `check` stops on the
pre-existing out-of-scope M4 formatting finding. No runtime action or standing
authorization was used.

The exact bounded Docker-free M2A-TRR03 failure-candidate correlation
remediation prompt and fresh independent re-review prompt are now saved at
[`prompts/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation.md`](../prompts/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation.md)
and
[`prompts/reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation-review.md`](../prompts/reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation-review.md)
before source/test changes. The bounded task may change only the pure transfer
library/declaration, focused test, static verifier if needed, and minimal five
status records. It must require truthful runner settlement, successful
install/approval prerequisites, a settled integer nonzero rebuild failure,
and exact valid segment plus conditional-marker transport before accepting the
sole `M2A_REBUILD_FAILED` combined candidate.

No implementation, verification, runtime, result, historical, Expected, or
`Observed` byte changed in this prompt-only task. No image/context
construction, Docker, lifecycle, transfer, result/retained-state access,
external communication, or standing authorization was used.

Next: perform the exact bounded Docker-free M2A-TRR03 failure-candidate
correlation remediation under the saved prompt; do not construct an image or
execute transfer/runtime commands.

The bounded Docker-free M2A-TRR03 failure-candidate correlation remediation is
now complete under the saved exact allowlist. The pure combined validator still
re-runs canonical attempt, completion, producer-segment, and conditional-marker
validation. Its sole Inconclusive candidate now additionally requires all
three runner-settlement booleans, exact successful install and approval
terminals with the fixed approval/lock chain, an integer nonzero rebuild exit
with null signal and no timeout or output truncation, and an exact listed and
valid segment with marker presence derived from the validated write event.
Complete candidates are unchanged.

Focused behavioral negatives cover successful, null-exit, signaled, timed-out,
and truncated rebuilds; every false settlement boolean; failed or malformed
install/approval prerequisites; invalid lock/approval projections; absent,
invalid, unknown, or not-attempted segment transport; and both marker
contradiction directions. `npm run m2a:transfer:verify` passes its static
verifier and 1 file / 26 tests; `npm run m2a:verify` passes 4 files / 5 tests;
root typecheck passes; and `npm test` passes 109 files / 829 tests. Aggregate
`npm run check` exits `1` at the pre-existing out-of-scope
`containers/profile-control/test/control-host-backend.test.ts` formatting
warning, so its later stages do not run.

These are Docker-free static/unit observations only. No container source was
imported or executed; no image/context construction, Docker/runtime-socket
action, npm lifecycle/probe execution, transfer, result/retained-state access,
evidence promotion, external communication, or standing authorization was
used. M2A-TRR03 and M2A-TR03 through M2A-TR06 remain review-blocked.

Next: perform the fresh independent Docker-free read-only M2A-TRR03
failure-candidate correlation remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation-review.md`;
do not construct an image or execute transfer/runtime commands.

The fresh independent Docker-free re-review is now recorded in
[`reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation.md`](reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation.md).
It reproduces the exact 31-file identity, preserved plan/descriptor findings,
four positive combined candidates, and 36 inverse candidate contradictions.
M2A-TRR03 closes with no new finding, so M2A-TR01 through M2A-TR06 are closed
only at the static/unit implementation boundary. No implementation or test was
repaired by the review.

The decision permits at most one later Docker-free construction/execution-gate
contract that binds the complete constructed context and exact local
`sha256:` image ID before any command can be reviewed. It does not approve
construction, Docker, transfer, result access or acceptance, evidence
promotion, standing authorization, or `Observed` change.

Next: define that exact Docker-free issue #43 construction/execution-gate
contract and save its fresh independent review prompt; do not construct an
image or execute transfer/runtime commands.

The proposed construction/execution-gate contract is now saved in
[`m2-a-evidence-transfer-construction-execution-gate.md`](m2-a-evidence-transfer-construction-execution-gate.md),
with its fresh independent Docker-free review prompt saved before any
implementation change. It fixes M2A-CG01 through M2A-CG06: the immutable
41-row tracked baseline, a separate not-yet-authorized npm `12.0.1`
acquisition receipt, a complete deterministic context manifest, one offline
no-retry image build and exact local `sha256:` binding packet, three phase-
separated no-argument entries, evidence-class separation, and one exact later
static/unit implementation allowlist.

This is proposal evidence only. No constructor or production entry was added;
no npm distribution was acquired or read; and no context, image, Docker
object, transfer, or issue #43 result was constructed or executed. Standing
authorization was not used.

Next: perform the fresh independent Docker-free read-only construction/
execution-gate contract review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-review.md`;
do not acquire npm, construct a context or image, call Docker, or access
runtime/result state.

The fresh construction/execution-gate contract review is now recorded in
[`reviews/m2-a-evidence-transfer-construction-execution-gate.md`](reviews/m2-a-evidence-transfer-construction-execution-gate.md).
It reproduces the exact 31-row and 41-row aggregates, tuple, Containerfile copy
closure, and existing pure transfer plan, but blocks M2A-CG01 through M2A-CG06
on M2A-CGR01 through M2A-CGR03. The unresolved boundaries are the actual
compiler/runtime/resolver input and complete construction schema, exact build
argv/bounds/platform/image-binding packet, and exact host copy/result
publication transaction including a consistent unknown-settlement rule.

No contract repair, implementation, acquisition, construction, Docker,
runtime/result access, or evidence promotion occurred in the review. Standing
authorization was not used.

Next: save the exact bounded Docker-free M2A-CGR01 through M2A-CGR03 contract-
remediation prompt and fresh independent re-review prompt; do not acquire npm,
construct a context or image, call Docker, or access runtime/result state.

The exact bounded Docker-free M2A-CGR01 through M2A-CGR03 contract-remediation
prompt and fresh independent re-review prompt are now saved before contract
repair. They require one separate reviewed constructor-toolchain receipt and
complete canonical construction schema, exact offline Docker build commands,
layout, numeric bounds, platform/config projection and image-binding schema,
and one result-root-bound write-ahead attempt checkpoint transaction. The
checkpoint rule durably records the next step as unknown before each Docker
child, so an unknown child close suppresses every later action while preserving
the already committed sanitized Inconclusive attempt.

No construction/execution-gate contract or implementation byte changed in
this prompt-only task. No npm or toolchain byte was acquired or read, and no
construction, image, Docker, runtime/result access, transfer, evidence
promotion, external communication, or standing authorization occurred.
M2A-CGR01 through M2A-CGR03 and M2A-CG01 through M2A-CG06 remain open pending
the saved remediation and fresh re-review.

Next: perform the exact bounded Docker-free M2A-CGR01 through M2A-CGR03
contract remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-remediation.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

M2-A construction/execution-gate contract-remediation update (2026-07-21):
the bounded Docker-free remediation is complete under the exact saved scope.
M2A-CGR01 now binds a separate not-yet-authorized Node/TypeScript toolchain
receipt, two exact private compiler processes, and the complete ordered
construction-manifest schema. M2A-CGR02 fixes the private credential-empty
build layout, five exact offline Docker argv arrays and bounds, complete
inspect projections, and canonical image-binding packet. M2A-CGR03 fixes the
result-root cwd and identity boundary plus a pessimistic write-ahead
`attempt.json` checkpoint before every Docker child; an unknown child close
permits no post-unknown action while preserving the already synced sanitized
Inconclusive checkpoint.

A repository-controlled in-memory audit reproduced the unchanged 31-row
`sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04`
and 41-row
`sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526`
aggregates. Focused Prettier checking passes for the contract, prompt pair, and
five status records; `git diff --check` exits `0`. This is contract-only
evidence. No dependency or toolchain byte was
acquired or read; no production constructor or compiler child, context, image,
Docker command, runtime/result state, transfer, evidence promotion, external
communication, or standing authorization was used. M2A-CGR01 through M2A-CGR03 and M2A-CG01
through M2A-CG06 remain open pending fresh independent re-review.

Next: perform the fresh independent Docker-free read-only M2A-CGR01 through
M2A-CGR03 contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-remediation-review.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

The fresh independent Docker-free contract-remediation re-review is now
recorded in
[`reviews/m2-a-evidence-transfer-construction-execution-gate-remediation.md`](reviews/m2-a-evidence-transfer-construction-execution-gate-remediation.md).
It closes M2A-CGR01 and M2A-CGR02 at contract scope after reproducing the exact
31-row/41-row identities, fixed tuple, compiler/toolchain schema, five-command
offline build packet, and canonical image-binding schema. M2A-CGR03 remains
open on one exact gap: the fixed plan has three distinct absence-preflight
Docker children, while canonical `m2a-transfer-attempt/v1` bytes can identify
all three only as `absence-preflight` and therefore cannot bind which exact
next child became settlement-unknown.

No contract repair, implementation, acquisition, construction, image build,
Docker action, runtime/result access, transfer, evidence promotion, external
communication, or standing authorization was used. M2A-CG01 through M2A-CG03
close at contract scope; M2A-CG04 through M2A-CG06 remain blocked pending the
single checkpoint-identity remediation and fresh re-review.

Next: save the exact bounded Docker-free M2A-CGR03 absence-checkpoint identity
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, construct a context or image, call Docker, or access
runtime/result state.

The exact bounded Docker-free M2A-CGR03 absence-checkpoint identity remediation
and fresh independent re-review prompts are now saved before contract repair.
They bind the later contract change to three ordered canonical identities:
`absence-volume`, `absence-initializer-container`, and
`absence-measurement-container`. Each identity maps only to its unchanged
fixed volume or container inspect argv; the current schema, issue codes,
write-ahead transaction, command order, first-issue rule, and no-post-unknown
boundary remain fixed.

No normative transfer or construction/execution-gate contract byte changed;
only the prompt pair and status records changed. No implementation,
verification, acquisition, construction, image, Docker object, runtime/result,
historical, Expected, or `Observed` byte changed. No external communication or
standing authorization was used. M2A-CGR03 and M2A-CG04 through M2A-CG06
remain open pending the bounded remediation and fresh re-review.

Next: perform the exact bounded Docker-free M2A-CGR03 absence-checkpoint
identity contract remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

The bounded Docker-free M2A-CGR03 absence-checkpoint identity contract
remediation is now complete. The later production boundary has exactly three
ordered identities—`absence-volume`, `absence-initializer-container`, and
`absence-measurement-container`—each derived from and mapped one-to-one to its
unchanged fixed volume or container inspect argv. The existing attempt schema
and issue codes remain unchanged; all three write-ahead checkpoints, known
failures, unknown settlements, prerequisite states, and no-later-step
contradictions are now bound to the exact child identity.

M2A-CGR01/M2A-CGR02 and M2A-CG01 through M2A-CG03 remain closed at contract
scope. M2A-CGR03 and M2A-CG04 through M2A-CG06 remain open pending the saved
fresh independent re-review. A repository-controlled identity inspection
confirms the exact ordered one-to-one mapping; focused Prettier checking and
`git diff --check` pass. No test was required or run. No implementation,
verification, acquisition,
construction, image, Docker, runtime/result, transfer, historical, Expected,
or `Observed` byte changed, and no external communication or standing
authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-CGR03
absence-checkpoint identity remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation-review.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

The fresh independent Docker-free absence-checkpoint identity re-review is now
recorded in
[`reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation.md`](reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation.md).
It closes M2A-CGR03 with no new finding while M2A-CGR01/M2A-CGR02 remain
closed. The review reproduced the exact three ordered identity/argv rows, all
six known-failure/unknown checkpoint outcomes, seven inverse mapping
rejections, 12 code/state contradiction rejections, and three settlement-
barrier negatives. M2A-CG01 through M2A-CG06 are now closed only at contract
scope.

No contract or implementation was repaired. No acquisition, construction,
image, Docker, lifecycle, transfer, runtime/result access, evidence promotion,
external communication, or standing authorization was used. The next
authority remains one bounded Docker-free static/unit implementation under the
unchanged M2A-CG06 allowlist after its prompt pair is saved.

Next: save the exact bounded Docker-free construction/execution-gate
implementation prompt and fresh independent implementation-review prompt
before source changes; do not acquire npm or toolchain bytes, construct a
production context or image, call Docker, or access runtime/result state.

The exact bounded Docker-free construction/execution-gate implementation and
fresh independent implementation-review prompts are now saved before any
implementation or verification source change. They preserve the unchanged
M2A-CG06 allowlist and bind the later task to the exact 31-row/41-row source
identities, separate unperformed npm/toolchain prerequisites, deterministic
constructor and canonical manifest, five-command offline build/image-binding
plan, three child-specific absence checkpoints, write-ahead no-post-unknown
runtime transaction, fake-only negative matrix, and evidence non-promotion.

This prompt-only task changed no transfer/construction implementation,
verification, package script, Containerfile, manifest, container source,
adapter/probe source, fixture, scenario, acquisition, construction, image,
Docker object, runtime/result, historical, Expected, or `Observed` byte. It
did not access a fixed ignored root, external communication, or standing
authorization. M2A-CG01 through M2A-CG06 remain closed only at contract scope
and are pending the bounded static/unit implementation and fresh review.

Next: perform the exact bounded Docker-free construction/execution-gate
static/unit implementation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation.md`;
do not acquire npm or toolchain bytes, construct a production context or
image, call Docker, or access runtime/result state.

The bounded construction/execution-gate static/unit implementation candidate
is now complete under the unchanged M2A-CG06 allowlist. It adds canonical
construction/acquisition/toolchain/image-binding validators, exact pure
construction/build/runtime plans, three import-safe no-argument fail-closed
entries, separately branded fake construction/build/runtime backends, and
write-ahead child-specific attempt checkpoints. The old generic
`absence-preflight` production identity is rejected in favor of the exact
three reviewed rows.

Focused transfer verification passes 1 file / 36 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 839 tests. Aggregate `check` does not advance beyond the
pre-existing out-of-scope M4 formatting warning. No production entry,
acquisition, compiler, construction, image, Docker, lifecycle, transfer,
result, evidence promotion, external communication, or standing authorization
was used. This is a candidate pending fresh review, not runtime or result
evidence.

Next: perform the fresh independent Docker-free read-only construction/
execution-gate implementation review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

That fresh independent Docker-free implementation review is now recorded in
`reviews/m2-a-evidence-transfer-construction-execution-gate-implementation.md`
and is `BLOCKED` on M2A-CGI01 through M2A-CGI04. Exact admitted toolchain and
constructed-context input closure is incomplete; the fake build model does not
correlate command observations to canonical image-binding publication; the
fake runtime model bypasses exact terminal, copied-artifact, and combined-
candidate validation; and the fail-closed entries have no fixed private
production authority behind their gates.

The review reproduced the unchanged 31-row/41-row identities. Focused
verification passes 1 file / 36 tests, existing M2-A verification passes 4
files / 5 tests, root typecheck passes, and root tests pass 109 files / 839
tests. Aggregate `check` stops at the pre-existing out-of-scope M4 formatting
warning. No implementation/test repair or runtime action was performed, and
standing authorization was not used. M2A-TR01 through M2A-TR06 remain closed
at their prior static/unit scope; M2A-CG01 through M2A-CG06 remain open at the
new implementation scope.

Next: save the exact bounded Docker-free M2A-CGI01 through M2A-CGI04
implementation-remediation prompt and fresh independent re-review prompt; do
not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

The exact bounded M2A-CGI01 through M2A-CGI04 implementation-remediation and
fresh independent re-review prompts are now saved before source/test repair.
They preserve the unchanged M2A-CG06 allowlist, the prior transfer closures,
and every runtime/evidence separation while requiring exact input closure,
transaction-level image/runtime correlations, and privately branded fixed
production authorities behind the still-failing entry gates.

No transfer/construction implementation, verification, acquisition,
construction, image, Docker, lifecycle, transfer, runtime/result, historical,
Expected, or `Observed` byte changed or executed. No fixed ignored root,
external communication, or standing authorization was used. M2A-TR01 through
M2A-TR06 retain their prior static/unit closure; M2A-CGI01 through M2A-CGI04
and M2A-CG01 through M2A-CG06 remain open at implementation scope.

Next: perform the exact bounded Docker-free M2A-CGI01 through M2A-CGI04
implementation remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

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

The fresh independent Docker-free construction/execution-gate remediation
re-review is now recorded in
`reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`.
It closes M2A-CGI01, but keeps M2A-CGI02 through M2A-CGI04 open because
known-invalid early build data reaches offline build, noncanonical runtime
settlement tokens can publish final success, and the private authorities do
not yet enforce the complete reviewed descriptor/process/phase transaction.

The prior M2A-TR01 through M2A-TR06 transfer closure remains unchanged at its
Docker-free static/unit boundary. The re-review performed no transfer repair,
production entry, acquisition, construction, image, Docker, lifecycle,
runtime/result access, evidence promotion, external communication, or standing
authorization. M2A-CG01 through M2A-CG06 remain open at implementation scope.

Next: save the exact bounded Docker-free M2A-CGI02 through M2A-CGI04 residual-
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, execute a production entry, construct a context or image,
call Docker, or access runtime/result state.

The exact bounded M2A-CGI02 through M2A-CGI04 Docker-free residual-remediation
and fresh independent re-review prompts are now saved before source/test
repair. They preserve closed M2A-CGI01 and bind only the reviewed early-build,
settlement-discriminator, and complete private-authority transaction gaps
inside the unchanged M2A-CG06 allowlist.

No transfer/construction implementation, declaration, verification, package
script, fixture, acquisition, construction, image, Docker, runtime/result,
historical, Expected, or `Observed` byte changed. No fixed ignored root,
external communication, or standing authorization was used. M2A-CGI02 through
M2A-CGI04 and M2A-CG01 through M2A-CG06 remain open at implementation scope.

Next: perform the exact bounded Docker-free M2A-CGI02 through M2A-CGI04
residual remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

The bounded Docker-free M2A-CGI02 through M2A-CGI04 residual-remediation
candidate is complete inside the unchanged M2A-CG06 allowlist. Image-build
rows now validate immediately, runtime settlement records require exact
`settled`/`unknown` shapes, complete receipt-listed constructor inputs are held
before output, compiler/Docker settlement is absolutely bounded, and the fixed
runtime backend holds and checks result/transfer identities and inventories.

Focused transfer verification passes 1 file / 42 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 845 tests. Aggregate `check` stops at the pre-existing
out-of-scope M4 formatting warning. No production entry, acquisition,
construction, image, Docker, lifecycle, transfer, runtime/result access,
evidence promotion, external communication, or standing authorization was
used. M2A-CGI01 remains closed; M2A-CGI02 through M2A-CGI04 and M2A-CG01
through M2A-CG06 remain open pending fresh independent re-review.

Next: perform the fresh independent Docker-free read-only residual-remediation
re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

The fresh residual-remediation re-review is now recorded in
`reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md`.
It preserves closed M2A-CGI01 and closes M2A-CGI02/M2A-CGI03 after reproducing
row-local image stops, exact settlement rejection, canonical image binding,
and the positive combined candidate.

M2A-CGI04 remains open. The private compiler/Docker helpers can overwrite an
earlier error/exit with later close data, and runtime path-based inventory,
publication, and copy validation are not correlated to the held directory
inode or exact full-mode/link identity. No production entry, acquisition,
construction, image, Docker, lifecycle, transfer, runtime/result access,
evidence promotion, external communication, or standing authorization was
used. Only M2A-CG01 closes at implementation scope.

Next: save the exact bounded Docker-free M2A-CGI04 private-authority residual-
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, execute a production entry, construct a context or image,
call Docker, or access runtime/result state.

The exact bounded Docker-free M2A-CGI04 private-authority residual-remediation
and fresh independent re-review prompts are now saved before source/test
repair. They preserve closed M2A-CGI01 through M2A-CGI03, implementation-scope
M2A-CG01, the fixed transfer contract, and the unchanged M2A-CG06 boundary.
Only first-cause process settlement and held-directory/path transaction
correlation may change in the later implementation.

No transfer/construction implementation, declaration, verification, package
script, fixture, acquisition, construction, image, Docker, runtime/result,
historical, Expected, or `Observed` byte changed. No fixed ignored root,
external communication, or standing authorization was used. M2A-CGI04 and
M2A-CG02 through M2A-CG06 remain open at implementation scope.

Next: perform the exact bounded Docker-free M2A-CGI04 private-authority
residual remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI04 private-authority residual-remediation handoff

The bounded Docker-free candidate now shares one first-cause/first-exit state
machine between the compiler and Docker helpers and replaces path-independent
runtime checks with held BigInt directory/path correlation. Exact full mode,
owner, link, child identity, and operation-specific inventory transitions
bracket attempt publication, held-directory sync, copies, and marker creation.
Unknown copy settlement cannot advance or publish and settles only owned local
handles. Separately branded fake-only process and directory traces exercise
the production decision boundaries without a real child, host path, or fixed
runtime root.

Focused transfer verification passes 1 file / 46 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 849 tests. Focused formatting and `git diff --check` pass;
aggregate `check` stops only at the pre-existing out-of-scope M4 formatting
warning. This is Docker-free static/unit and cooperative-host evidence only.

No production entry, acquisition, compiler, construction, image, Docker,
lifecycle, transfer, runtime/result access, evidence promotion, external
communication, or standing authorization was used. Closed M2A-CGI01 through
M2A-CGI03 and M2A-CG01 are preserved. M2A-CGI04 and M2A-CG02 through M2A-CG06
remain open pending fresh independent re-review.

Next: perform the fresh independent Docker-free read-only M2A-CGI04 private-
authority residual-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI04 private-authority residual-remediation re-review

The fresh independent Docker-free re-review closes first-cause compiler/Docker
settlement and the original held-directory/path replacement contradiction. It
remains `BLOCKED` because operation-specific transitions adopt the complete
post-operation child identity map without comparing unchanged child identities,
and the fake trace cannot submit that sibling-replacement contradiction.

The exact 31-row/41-row aggregates and current allowlist identities were
reproduced. Focused transfer verification passes 1 file / 46 tests, existing
M2-A verification passes 4 files / 5 tests, and root typecheck passes. Root
tests observed one out-of-scope M4 failure after 108 files / 848 tests passed;
aggregate `check` stops at the out-of-scope M4 formatting warning. No source or
test repair, production entry, acquisition, construction, image, Docker,
lifecycle, transfer, runtime/result access, or evidence promotion occurred.

M2A-CGI01 through M2A-CGI03 and M2A-CG01 remain closed. M2A-CG02/M2A-CG03
close at Docker-free static/unit implementation scope. M2A-CGI04 and M2A-CG04
through M2A-CG06 remain open.

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
closes the remaining unchanged-child-identity finding. The same complete child-
identity transition decision now protects every fixed production mutation and
its separately branded fake trace. M2A-CGI01 through M2A-CGI04 and M2A-CG01
through M2A-CG06 are closed at their recorded contract or Docker-free static/
unit cooperative-host scopes.

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

## Dependency-input boundary contract handoff

The proposed M2A-IB01 through M2A-IB06 contract is saved at
`m2-a-evidence-transfer-dependency-input-boundary.md`. It fixes separate future
npm archive and constructor-toolchain candidates, exact atomic canonical
receipt transactions, one-shot retention and evidence-class boundaries, and
only one later Docker-free static/unit implementation allowlist. The existing
transfer tuple, schemas, implementation closure, and null reviewed input
bindings remain unchanged. Its fresh independent review prompt is saved at
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-review.md`.

No future npm/toolchain byte, fixed input root, host runtime byte, integrity,
digest, runtime closure, package inventory, receipt, or reviewed binding was
accessed, inferred, created, or changed. No external communication, producer,
construction, image, Docker/runtime, lifecycle, transfer, result access,
standing authorization, or evidence promotion occurred. M2A-IB01 through
M2A-IB06 remain open pending fresh Docker-free contract review.

Next: perform the fresh independent Docker-free read-only dependency-input
boundary contract review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-review.md`;
do not acquire or inspect npm/toolchain bytes, use external communication,
execute either producer, construct a context or image, call Docker, or access
runtime/result state.

## Dependency-input boundary contract review

The fresh independent Docker-free review in
`reviews/m2-a-evidence-transfer-dependency-input-boundary.md` closes
M2A-IB01/M2A-IB02 at contract scope and blocks M2A-IB03 through M2A-IB06 on
M2A-IBR01 through M2A-IBR03. It reproduced the exact two npm requests,
archive/receipt transaction, 31-row/41-row aggregates, package tuples,
toolchain receipt schemas, and evidence separation.

The remaining contract gaps are exact package-source/final-tree directory
identity and second-traversal correlation, durable one-shot state before
fallible toolchain source validation, and the mismatch between required
inventory mode/size relations and the existing construction consumer outside
the proposed implementation allowlist. No producer implementation or
execution is approved.

No fixed ignored root, npm/toolchain byte, host runtime/package byte,
credential, environment, external communication, producer, construction,
image, Docker/runtime, transfer, result state, evidence promotion, or standing
authorization was accessed or used.

Next: save the exact bounded Docker-free M2A-IBR01 through M2A-IBR03 contract-
remediation prompt and fresh independent re-review prompt; do not acquire or
inspect npm/toolchain bytes, execute either producer, construct a context or
image, call Docker, or access runtime/result state.

## Dependency-input contract-remediation prompt handoff

The exact bounded Docker-free M2A-IBR01 through M2A-IBR03 contract-remediation
and fresh independent re-review prompts are saved before contract repair. They
preserve M2A-IB01/M2A-IB02 and every closed transfer/construction decision,
while limiting the later contract change to complete identity-bound source/
destination traversal, a durable pre-source toolchain checkpoint, and the
exact two construction consumer paths required for strict inventory mode/size
validation.

No implementation, declaration, test, static verifier, package script,
lockfile, manifest, Containerfile/container, adapter/probe/package, fixture,
scenario, input, construction, image, Docker, transfer, runtime/result,
historical, Expected, or `Observed` byte changed. No fixed ignored root,
future input, host runtime/package byte, external communication, or standing
authorization was used. M2A-IB03 through M2A-IB06 remain open pending the
bounded remediation and fresh re-review.

Next: perform the exact bounded Docker-free M2A-IBR01 through M2A-IBR03
contract remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-remediation.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## Dependency-input M2A-IBR01 through M2A-IBR03 contract remediation

The bounded Docker-free contract remediation now identity-binds both complete
package-source traversals and the complete pre-receipt destination traversal
through the same held directory authorities. A separate fixed attempt root and
canonical `attempt.json` now durably record the occurrence before fallible
host/package reads and block every later invocation without inspection. The
later allowlist adds only the construction consumer source/declaration so its
actual validator can enforce the selected live/copy mode and package-size
relations. M2A-IB01/M2A-IB02 remain closed; M2A-IB03 through M2A-IB06 remain
open pending fresh independent re-review.

No implementation, producer, fixed-root or future-input access, host runtime/
package read, external communication, construction, image, Docker, transfer,
runtime/result access, evidence promotion, Expected, or `Observed` change
occurred. Standing authorization was not used.

Next: perform the fresh independent Docker-free read-only M2A-IBR01 through
M2A-IBR03 contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation-review.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## Dependency-input contract-remediation re-review

The fresh independent Docker-free re-review closes M2A-IBR01 and M2A-IBR03 at
contract scope. Complete source/destination held-authority traversals and the
exact two-path actual-consumer allowlist now satisfy those findings without
changing this transfer contract or any reviewed binding.

M2A-IBR02 remains open because an unknown attempt-root creation may leave no
root, while a fresh invocation stops only on a present or not-provably-absent
root. The prior uncertainty is then indistinguishable from a known
pre-occurrence denial despite being declared generation-consuming. M2A-IB03
through M2A-IB06 remain open; no implementation or producer execution is
approved.

No fixed ignored root, input byte, host runtime/package byte, external
communication, producer, construction, image, Docker/runtime, transfer,
result, evidence, or standing authorization was accessed or used.

Next: save the exact bounded Docker-free M2A-IBR02 unknown-attempt-root-
creation durability remediation prompt and fresh independent re-review prompt;
do not repair the contract in that prompt-only task or access input,
construction, Docker, transfer, or runtime/result state.

## Dependency-input M2A-IBR02 unknown-attempt-root-creation durability prompt handoff

The exact bounded Docker-free residual M2A-IBR02 contract-remediation and
fresh independent re-review prompts are saved before contract repair. They
preserve this transfer contract and every closed transfer/construction
decision while fixing the later dependency-input task to a synchronous
exclusive attempt-root `mkdirSync` commit with no returned unknown-create
outcome. Root absence before commit is never-started; root presence at or
after commit is the durable occurrence that blocks every fresh invocation.

No transfer or dependency-input contract repair was performed, and no
implementation, declaration, test, verifier, producer, fixed input, host
runtime/package, external communication, construction, image, Docker,
transfer, runtime/result, evidence, Expected, or `Observed` byte was accessed
or changed. Standing authorization was not used. M2A-IBR01/M2A-IBR03 remain
closed; M2A-IBR02 and M2A-IB03 through M2A-IB06 remain open pending the
bounded remediation and fresh re-review.

Next: perform the exact bounded Docker-free residual M2A-IBR02 contract
remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## Dependency-input M2A-IBR02 durability contract remediation

The bounded Docker-free dependency-input contract now uses exactly one
synchronous, non-recursive, exclusive mode-`0700` `mkdirSync` commit for the
fixed toolchain attempt root. It exposes no returned unknown-create outcome:
root absence after a known no-create error or before-commit process loss is
never-started, while root presence at or after atomic commit is the durable
non-evidence occurrence that blocks every fresh invocation without inspection.
This transfer contract and every closed transfer/construction decision remain
unchanged.

No implementation, producer, fixed input, host runtime/package, external
communication, construction, image, Docker, transfer, runtime/result,
evidence, Expected, or `Observed` byte was accessed or changed. Standing
authorization was not used. M2A-IBR01/M2A-IBR03 remain closed; M2A-IBR02 and
M2A-IB03 through M2A-IB06 remain open pending fresh independent re-review.

Next: perform the fresh independent Docker-free read-only residual M2A-IBR02
contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation-review.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## Dependency-input M2A-IBR02 durability contract-remediation re-review

The fresh independent Docker-free review closes M2A-IBR02 and therefore
M2A-IB03 through M2A-IB06 at contract scope. The exact synchronous exclusive
attempt-root commit distinguishes every never-started absent state from every
durably started present occurrence, including process loss before initial
checkpoint publication. Closed M2A-IB01/M2A-IB02 and M2A-IBR01/M2A-IBR03
remain unchanged.

No transfer implementation or reviewed binding changed. No producer, fixed
input, host runtime/package, external communication, construction, image,
Docker, transfer, runtime/result, evidence, Expected, or `Observed` state was
accessed or changed. Standing authorization was not used. At most one later
Docker-free static/unit dependency-input implementation may proceed after its
exact prompt pair is saved.

Next: save the exact bounded Docker-free dependency-input implementation prompt
and fresh independent review prompt under the existing M2A-IB06 allowlist; do
not change implementation or access input, external communication,
construction, Docker, transfer, or runtime/result state in that prompt-only
task.

## Dependency-input implementation prompt handoff

The exact bounded Docker-free dependency-input implementation and fresh
independent implementation-review prompts are now saved before any
implementation or verification source change. They preserve every closed
transfer/construction decision and confine the later task to the exact
M2A-IB06 allowlist: fixed credential-empty npm transport and atomic receipt,
durable pre-source toolchain occurrence, complete held source/copy authority,
canonical toolchain receipt/checkpoint, strict actual-constructor mode/size
validation, fake-only negative coverage, import safety, and evidence
non-promotion.

This prompt-only task changed no transfer/construction or dependency-input
implementation, declaration, test, verification, package script, fixture,
input, construction, image, Docker object, runtime/result, historical,
Expected, or `Observed` byte. It used no fixed ignored root, host
runtime/package input, external communication, or standing authorization.
M2A-IB01 through M2A-IB06 remain closed only at contract scope.

Next: perform the exact bounded Docker-free dependency-input static/unit
implementation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`;
do not execute either producer or access input, external communication,
construction, Docker, transfer, or runtime/result state.

## Dependency-input static/unit implementation handoff

The bounded Docker-free dependency-input implementation is complete under the
reviewed M2A-IB06 allowlist. It adds no package execution command and does not
change any closed transfer/construction decision, reviewed binding, or runtime
approval. Focused transfer verification passes 1 file / 56 tests, existing
M2-A verification passes 4 files / 5 tests, and root typecheck passes.
Aggregate root tests report 40 out-of-scope failures; aggregate `check` stops
at eight pre-existing formatting warnings.

Neither producer was imported or executed. No fixed input, construction,
image, Docker, transfer, runtime/result, evidence, external communication, or
standing authorization was used.

Next: perform the fresh independent Docker-free read-only dependency-input
implementation review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md`;
do not repair implementation or execute either producer in that review.

## Dependency-input implementation review decision

The fresh independent Docker-free review records `BLOCKED` on M2A-IBI01 and
M2A-IBI02. M2A-IB01, M2A-IB02, M2A-IB04, and M2A-IB05 close at static/unit
implementation scope; M2A-IB03 and M2A-IB06 remain open. Production does not
correlate the committed attempt-root child through the same held parent before
reopening paths for sync/checkpoint work, and the focused test/static boundary
does not exercise the complete required runtime, source-graph, and every-
package-family mode/size inverse matrix.

All prior transfer/construction decisions and contract-scope dependency-input
closures remain unchanged. Neither producer was imported or executed, and no
input, external communication, construction, Docker, transfer, runtime/result,
evidence, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation-remediation prompt and fresh independent re-review prompt; do
not repair implementation or tests in that prompt-only task.

## Dependency-input M2A-IBI remediation prompt handoff

The exact bounded Docker-free M2A-IBI01/M2A-IBI02 implementation-remediation
prompt and its fresh independent re-review prompt are saved before source or
test repair. The pair preserves every prior transfer/construction decision and
contract-scope dependency-input closure. It permits only the held attempt-
parent/child implementation repair, complete behavioral inverse coverage,
static verification, focused tests, and minimal status updates.

No transfer/construction or dependency-input implementation, declaration,
test, verifier, producer, fixed input, external communication, construction,
image, Docker, transfer, runtime/result, evidence, Expected, or `Observed`
byte changed or was accessed. Standing authorization was not used.

Next: perform the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`;
do not execute either producer, access input, use external communication,
construct an image, call Docker, or access runtime/result state.

## Dependency-input M2A-IBI01/M2A-IBI02 remediation handoff

The bounded Docker-free candidate now implements the contracted held
attempt-parent/child correlation through initial checkpoint settlement and the
complete behavioral runtime/source/destination/every-package-family inverse
boundary. Focused transfer verification passes 1 file / 60 tests, existing
M2-A verification passes 4 files / 5 tests, and root typecheck passes. All
prior transfer/construction and dependency-input contract decisions remain
unchanged.

Neither producer was imported or executed. No fixed input, external
communication, construction, image, Docker, transfer, runtime/result,
evidence, `Observed`, or standing authorization was used.
M2A-IBI01/M2A-IBI02 remain open pending fresh independent re-review.

Next: perform the fresh independent Docker-free read-only M2A-IBI01/M2A-IBI02
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation-review.md`;
do not repair implementation or execute either producer in that review.

## Dependency-input M2A-IBI remediation re-review decision

The fresh independent Docker-free re-review closes M2A-IBI02 at static/unit
scope but remains `BLOCKED` on M2A-IBI01. The fake parent-sync result is not
carried into the shared production/fake transition decision, which instead
receives literal `parentSynced: true`, and attempt identity narrows BigInt size
through `Number`.

All prior transfer/construction and dependency-input contract decisions remain
unchanged. M2A-IB03/M2A-IB06 remain open only on residual M2A-IBI01. Neither
producer was imported or executed, and no fixed input, external communication,
construction, image, Docker, transfer, runtime/result, evidence, `Observed`,
or standing authorization was used.

Next: save the exact bounded Docker-free residual M2A-IBI01 parent-sync and
BigInt-identity remediation prompt plus fresh independent re-review prompt; do
not repair implementation or execute either producer in that prompt-only task.

## Dependency-input residual M2A-IBI01 prompt handoff

The exact bounded Docker-free residual-remediation and fresh independent
re-review prompt pair is saved before source or test repair. It preserves every
closed transfer, construction, and dependency-input contract decision and
limits the later repair to the exact parent-sync production/fake data edge and
non-narrowed BigInt-derived device/inode/size/mtime identity.

No implementation, declaration, test, verifier, producer, fixed input,
external communication, construction, image, Docker, transfer, runtime/result,
evidence, Expected, or `Observed` byte changed in this prompt-only task.
Standing authorization was not used. M2A-IBI02 remains closed;
M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

Next: perform the exact bounded Docker-free residual M2A-IBI01 remediation
under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md`;
do not import or execute either producer, access input, construct an image,
call Docker, or access runtime/result state.

## Dependency-input residual M2A-IBI01 remediation handoff

The bounded Docker-free candidate now makes the parent-sync fact exact
own-data consumed by the shared production/fake transition and retains
BigInt-derived device, inode, size, and mtime as canonical nonnegative decimal
strings. Focused transfer verification passes 1 file / 61 tests, existing
M2-A verification passes 4 files / 5 tests, and root typecheck passes. All
prior transfer, construction, and dependency-input contract decisions remain
unchanged; M2A-IBI01/M2A-IB03/M2A-IB06 remain open pending fresh independent
re-review.

Neither producer was imported or executed. No fixed input, external
communication, construction, image, Docker, transfer, runtime/result,
evidence, `Observed`, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only residual M2A-IBI01
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md`;
do not repair implementation or execute either producer in that review.

## Dependency-input residual M2A-IBI01 re-review decision

The fresh independent Docker-free re-review is `BLOCKED` only on two
verification residuals. Current production/fake parent-sync data flow and
canonical BigInt-derived device/inode/size/mtime source close the original
semantic findings, but the focused suite lacks exact-key-shape attempt-
identity submissions and the static verifier does not bind all four production
encodings. M2A-IBI01/M2A-IB03/M2A-IB06 therefore remain open;
M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain static/unit closure.

All prior transfer/construction and dependency-input contract decisions remain
unchanged. Neither producer was imported or executed, and no fixed input,
external communication, construction, image, Docker, transfer, runtime/result,
evidence, Expected, `Observed`, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-IBI01 identity-shape/static-
verifier remediation prompt and fresh independent re-review prompt; do not
repair source or tests in that prompt-only task.

## Dependency-input M2A-IBI01 identity-verification prompt handoff

The exact bounded Docker-free M2A-IBI01 identity-verification remediation and
fresh independent re-review prompt pair is saved before verifier or focused-
test repair. The later task is restricted to the static verifier, focused
test, and minimal status allowlist. The transfer contract, current
production/fake support source, declaration, and all producer-execution
decisions remain unchanged.

No implementation, declaration, verifier, test, producer, fixed input,
external communication, construction, image, Docker, transfer, runtime/result,
evidence, Expected, or `Observed` byte changed. Standing authorization was not
used. M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain reviewed
static/unit closure; M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

Next: perform the exact bounded Docker-free M2A-IBI01 identity-verification
remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md`;
do not edit the support source/declaration, import or execute either producer,
access input, use external communication, construct an image, call Docker, or
access runtime/result state.

## Dependency-input M2A-IBI01 identity-verification remediation handoff

The bounded Docker-free candidate now behaviorally rejects all seven missing
attempt-identity exact-key-shape representations before checkpoint
publication or runtime/source/package reads and statically guards device,
inode, size, and mtime production encodings against `Number` narrowing.
Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests retain 39 out-of-scope failures, and aggregate `check` stops at
eight pre-existing formatting warnings.

Every contract-scope decision, the reviewed support/declaration and
parent-sync edge, M2A-IBI02, null reviewed construction bindings, false
execution approvals, and evidence separation remain unchanged.
M2A-IBI01/M2A-IB03/M2A-IB06 remain open pending fresh independent re-review.
No producer, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, evidence, Expected,
`Observed`, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-IBI01 identity-
verification remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation-review.md`;
do not repair source/tests or execute either producer in that review.

## Dependency-input M2A-IBI01 identity-verification re-review decision

The fresh independent Docker-free read-only re-review is `APPROVED` at
static/unit cooperative-host implementation scope. It reproduces all seven
malformed attempt-identity exact-key-shape terminals, zero accessor/Proxy
invocation, the retained pre-checkpoint/pre-runtime failure boundary, and the
four exact BigInt-derived production encoding guards against direct `Number`
narrowing.

M2A-IBI01/M2A-IBI02 and M2A-IB01 through M2A-IB06 are closed at implementation
scope. Every transfer/construction contract decision, reviewed
support/declaration byte, parent-sync edge, null construction input binding,
false execution approval, and evidence-class boundary remains unchanged.

No producer, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, evidence, Expected,
`Observed`, or standing authorization was used.

Next: save the exact bounded npm-acquisition producer-execution contract and
fresh independent review prompt; do not execute the producer, access fixed
input, or use external communication in that prompt-only task.

## npm-acquisition producer execution-gate contract handoff

The separate Docker-free execution-gate proposal now fixes M2A-NG01 through
M2A-NG06 without changing any transfer byte or decision. It binds the current
three-file producer closure, exact credential-empty transport, durable
root-first occurrence, process/result separation, and explicit-human external
authority. The fresh review prompt is saved before any occurrence.

M2A-NG01 through M2A-NG06 remain open. Every transfer decision, null reviewed
construction binding, false execution approval, and evidence-class boundary
remains unchanged. No producer, fixed root, host environment/runtime, external
communication, npm candidate, construction, Docker, transfer, runtime/result,
evidence, Expected, `Observed`, or standing authorization was used.

Next: perform the fresh independent Docker-free read-only M2A-NG01 through
M2A-NG06 contract review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-review.md`;
do not execute or import the producer, access the fixed acquisition root or
host environment/runtime, or use external communication.

## npm-acquisition producer execution-gate contract-review decision

The fresh independent Docker-free read-only review is `BLOCKED` on
M2A-NGR01/M2A-NGR02. Exact entry executable/script argv identity and
acquisition-root directory-link semantics remain unresolved.
M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 close at contract scope;
M2A-NG01/M2A-NG03 remain open.

Every transfer/construction decision, null reviewed acquisition binding, false
runtime approval, and evidence-class boundary remains unchanged. Focused
transfer verification passes 1 file / 62 tests. No producer, fixed root, host
environment/runtime, external communication, npm candidate, construction,
Docker, runtime/result, evidence, Expected, `Observed`, or standing
authorization was used.

Next: save the exact bounded Docker-free M2A-NGR01/M2A-NGR02
contract-remediation prompt and fresh independent re-review prompt; do not
repair contract/source/tests or execute the producer in that prompt-only task.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation prompt handoff

The exact bounded Docker-free remediation and fresh independent re-review
prompt pair is saved before changing the acquisition gate, entry, static
verifier, or focused test. The later task must bind the sole lexical host
command separately from Node's exact process-observable executable,
canonical-argv, repository-cwd, and empty-environment authority, and replace
the false one-link acquisition-root claim with production's positive-link-
count predicate without weakening one-link archive/receipt publication.

Every transfer/construction decision, null reviewed acquisition binding, false
runtime approval, and evidence-class boundary remains unchanged. Only the
saved prompt pair and minimal status records changed. No execution-gate
requirement, implementation, verifier, test, producer, fixed root, host
environment/runtime, external communication, npm candidate, construction,
Docker, runtime/result, evidence, Expected, `Observed`, or standing
authorization changed or was used. M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06
retain contract-scope closure; M2A-NG01/M2A-NG03 remain open.

Next: perform the exact bounded Docker-free M2A-NGR01/M2A-NGR02 remediation
under
`../prompts/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation.md`;
do not import or execute the producer, access fixed or host runtime state, or
use external communication.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation handoff

The bounded Docker-free candidate now distinguishes the exact reviewed lexical
host command from canonical Node process state checked before producer
reachability and aligns the acquisition-root directory with production's
positive-link-count predicate without weakening exact-one publication files.
Function-scoped static weakening cases cover both repairs. The fresh
three-file aggregate is
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.

Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests retain 99 passing / 10 failing files and 826 passing / 39 failing
tests; aggregate `check` stops at eight pre-existing formatting warnings.
Every prior transfer/construction decision remains unchanged. M2A-NG01/
M2A-NG03 remain open pending fresh re-review; the other M2A-NG items retain
contract-scope closure.

No producer, fixed root, host runtime, external communication, npm candidate,
construction, Docker, runtime/result, evidence, Expected, or `Observed`
boundary was used. Standing authorization was not used.

Next: perform the fresh independent Docker-free read-only M2A-NGR01/M2A-NGR02
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation-review.md`;
do not repair source/tests, execute the producer, access fixed or host runtime
state, or use external communication.

## npm-acquisition M2A-NGR01/M2A-NGR02 remediation re-review

The fresh independent Docker-free read-only re-review is `APPROVED` at
contract/static entry-guard scope. Exact complementary host/process authority
and distinct positive-directory/exact-one-file predicates close
M2A-NGR01/M2A-NGR02 and M2A-NG01/M2A-NG03. Together with the preserved
M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 decisions, the npm-acquisition gate is
complete only at contract scope.

The Docker-free transfer implementation, construction boundary, null reviewed
acquisition bindings, false runtime approval, and evidence separation remain
unchanged. Focused transfer verification passes 1 file / 62 tests, existing
M2-A verification passes 4 files / 5 tests, and root typecheck passes. No
producer, fixed root, host runtime, external communication, npm candidate,
construction, Docker, transfer, runtime/result, evidence, Expected, or
`Observed` boundary was used. Standing authorization was not used and cannot
authorize the external occurrence.

Next: save the exact adjacent-preflight/one-occurrence execution prompt and
separate Docker-free fixed-root result-review prompt; do not execute the
producer, access fixed or host runtime state, or use external communication in
that prompt-only task.

## npm-acquisition one-occurrence/result-review prompt handoff

The pre-authority execution prompt is saved at
`../prompts/m2-a-evidence-transfer-npm-acquisition-execution.md` (12,829 bytes,
SHA-256
`cab8482f8ace0b3ad1460e95b1419965a92bd3e00e2ebd501b5e8f82757b0d8f`).
Its separate fixed-root review is saved at
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md`
(13,241 bytes, SHA-256
`a62a49b16a94bcd75a289e8b6da97eba6cb2e1973f893fa60c013fb5a856aa8b`).
The pair preserves exact adjacency, at-most-one direct occurrence, bounded
process/result separation, no retry, fixed-root no-follow review, null
construction bindings, false runtime approval, and `not-performed` evidence.

No producer, fixed root, host runtime, external communication, npm candidate,
construction, Docker, transfer, runtime/result, evidence, Expected, or
`Observed` boundary was used. Standing authorization was not used and cannot
authorize the external occurrence.

Next: a person must freshly review both saved prompts and explicitly authorize
the exact M2A-NG06 DNS/HTTPS, retained fixed-root, generation-consuming
no-retry, and later review effects before execution may proceed.
