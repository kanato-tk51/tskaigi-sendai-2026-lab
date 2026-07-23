# M4 public-input hardening contract independent review

## Review target and decision

- Target: issue #46 M4 public-input-hardening contract
- Review type: fresh independent Docker-free read-only contract review
- Decision: **APPROVED for exactly one bounded Docker-free static/unit
  implementation**
- M4-PI01 complete ingress and input classes: **CLOSED at contract scope**
- M4-PI02 descriptor and prototype closure: **CLOSED at contract scope**
- M4-PI03 byte and shared-memory closure: **CLOSED at contract scope**
- M4-PI04 temporal and authority closure: **CLOSED at contract scope**
- M4-PI05 implementation, tests, and evidence: **CLOSED at contract scope**
- Blocking findings: none
- Non-blocking findings: none

The contract separates every reviewed JavaScript ingress into untrusted data,
explicit backend authority, or private branded state. The policy is exact
enough to permit only the listed source/test/static implementation: no caller
record, array, byte view, backend return graph, or method-property lookup may
remain live across the first callback or `await`.

This decision does not approve a filesystem-emitting compile, a production
entry, Docker, retained or result state, an execution command, a new activation
construction, or an `Observed` change. It approves only one later Docker-free
static/unit implementation followed by a fresh independent implementation
review.

## Reviewed snapshot identity

The hashes below identify the contract inputs before this review record and
minimal status updates were added. They are static byte identities, not runtime
filesystem identities.

| Target | Bytes or rows | SHA-256 |
|---|---:|---|
| Public-input-hardening contract | 25,195 bytes | `de70ca0a56bef9cba821a270014dfff3e22cd688166ef19b18772bd71ccab3a7` |
| Contract-review prompt | 7,698 bytes | `ecb51528f44a577bb34dd3d749867cf4588d126f423945444dbf9c7a67f99bb7` |
| Package-root source | 75 lines | `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4` |
| Sorted current proposed production-source manifest | 19 rows | `a6a0a2bb2bb083b8676cfe3cd60a2c1787f8c4a8915f61968047569af40ff123` |
| Sorted current existing verification-path manifest | 20 rows | `b53e3a4faf23f14d9fbc1fd0731fe0eeef6ad5abbb57293dc4b31c9e68e814ba` |

The proposed new
`containers/profile-control/test/public-input-hardening.test.ts` is correctly
absent at the review snapshot. Adding it raises the later verification
allowlist to 21 paths. The complete changed/untracked inventory was inspected;
prior issue #45 and presentation work was preserved.

## M4-PI01 — complete ingress and input classes closed

TypeScript syntax and the package-root export surface independently reproduced
the contract's active ingress groups:

1. profile, manifest, pair, image, staging, evidence, completion, canonical
   bytes, inspection, orchestrator arguments, pair result, offline-build
   result, and recovery-result validators/serializers;
2. the typed profile/manifest, Docker-plan, accepted-staging, fixed
   offline-build, and fixed recovery constructors and cross-bindings;
3. `executeFixedDoctor`, both profile-pair executors, the offline-build and
   recovery executors, and every `run`, `readBuildContext`, `transfer`, and
   related backend return family; and
4. the two offline-build process-state update functions.

The remaining parameterized exports are closed by the contract's primitive or
private-brand rules. They include `createExecutionProfile`,
`createFixedRuntimeLayout`, `fixedContainerArguments`, `expectedControls`,
`copyPreparedStagingFile`, `copyAcceptedStagingFiles`, and the fixed command,
plan, snapshot, pair, and recovery brand assertions. A failed brand is never
reinterpreted as public structured data, and the brand lookup precedes reads
from the purported branded object.

`createFixedProductionControlDefinition` and
`runFixedProductionControls` have no caller-supplied graph. Their direct
internal JSON/profile/staging byte roots terminate at the listed validators and
byte parsers. Production host backends remain explicit authority
implementations: their process/filesystem code is not converted into public
data construction, while every value they return crosses one of the listed
untrusted return boundaries.

No active public or direct internal process/result data root was found outside
the 19 production paths. M4-PI01 is closed at contract scope.

## M4-PI02 — descriptor and prototype closure closed

The required structured-data order is closed and non-observing:

- a non-null object check is followed by the captured `isProxy` check before
  array classification, prototype inspection, keys, or descriptors;
- records accept only the captured intrinsic `Object.prototype` or `null`, and
  arrays accept only the captured intrinsic `Array.prototype` plus the
  ordinary dense length/index descriptor shape;
- symbols, accessors, non-enumerable schema fields, holes, extra indices or
  names, unknown fields, invalid lengths, custom/cross-realm prototypes, and
  cycles are rejected from descriptors without property reads;
- fixed schemas rebuild null-prototype records and ordinary dense arrays in
  canonical order, recursively freeze them, and rebuild repeated aliases
  independently; and
- no spread, destructuring, `Object.assign`, iterator, JSON clone,
  `structuredClone`, `toJSON`, coercion hook, or prototype method is an input
  validator.

The sole custom-prototype exception is explicit authority, not data. A carrier
and at most four custom prototype objects are Proxy-checked and inspected by
descriptor until the captured `Object.prototype` is reached. Only a first
matching own data descriptor containing a non-Proxy callable is accepted. The
callable is receiver-bound once into a private frozen authority record; carrier
fields remain authority-private and backend returns remain untrusted data.

A bounded Node assertion confirmed that Proxy rejection called no trap,
descriptor extraction called no accessor, cross-realm record/array/byte
prototypes differ from the captured intrinsics, and existing class fake-backend
methods are ordinary prototype data descriptors. M4-PI02 is closed at contract
scope.

## M4-PI03 — byte and shared-memory closure closed

Every caller/backend byte route converges on one intrinsic-only snapshot before
length, hashing, decoding, canonical comparison, storage, or `await`. The
accepted values are exactly Node-recognized `Uint8Array` objects with immediate
prototype equal to the captured intrinsic `Uint8Array.prototype` or
`Buffer.prototype`.

The contract separately requires Proxy rejection, exact own indexed shape,
intrinsic backing-buffer/offset/length access, route-specific zero/maximum
bounds, rejection of detached/resizable/shared backing storage, and a
synchronous copy of only the selected view range into a fresh fixed non-shared
array. Every public byte return is another copy. It permits no iterator,
species/prototype callback, retry, double-read settlement, `Atomics`, or
caller-owned alias.

Bounded in-memory assertions on Node.js `v20.18.2` reproduced exact ordinary
`Uint8Array` and `Buffer` prototypes, a non-zero-offset range copy,
`SharedArrayBuffer` detection, resizable-buffer detection, and detached-view
copy rejection. No filesystem or runtime result was used. M4-PI03 is closed at
contract scope.

## M4-PI04 — temporal and authority closure closed

The async authority inventory reproduced these exact method families:

- doctor: `run`, `cleanup`;
- offline build: `stageBuildContext`, `readBuildContext`, `run`, `cleanup`;
- recovery: `validateRetainedState`, `run`;
- build-first profile pair: `stageBuildContext`, `readBuildContext`, `run`,
  `transfer`; and
- existing-image pair: `run`, `transfer`, `recordProfileResult`, `cleanup`.

Before the first method call or `await`, each executor must descriptor-snapshot
its outer record, resolve all required private brands, copy every unbranded
data/byte value, and capture all methods. After that point it uses only the
private snapshot and captured callables. Each fulfilled backend value is
snapshotted before comparison, output, or the next callback. Later carrier
method replacement and caller-graph mutation therefore cannot alter selected
commands, bounds, paths, evidence, or failure order.

An invalid outer record, brand, authority carrier, or pre-attempt data graph
invokes zero backend methods, including cleanup when no trusted cleanup
authority exists. After an attempt begins, the existing first-failure,
child-`close`, cleanup, retention, and Inconclusive rules remain authoritative;
invalid return data is not reclassified as a preflight skip. M4-PI04 is closed
at contract scope.

## M4-PI05 — implementation, tests, and evidence closed

The 19 production paths contain every structured/byte validator, constructor,
process-state helper, and executor that must change, without including a host
backend, filesystem-identity helper, entry/executor activation object, package
root, package script, profile, fixture, versioned image input, or compiled
output.

The 21 verification paths can express the complete table-driven matrix:

- the new focused test owns cross-route Proxy/accessor/prototype/cycle/shared-
  memory/mutation/authority cases;
- existing route tests retain exact schema, error, failure-prefix, cleanup,
  canonical-byte, brand, and fake-backend semantics; and
- the static verifier and frozen construction test separate intentional
  issue #46 source divergence from the immutable issue #45 construction and
  reject a new structured/byte edge outside the shared helpers.

The exact issue #45 construction independently reproduced unchanged:

| Historical construction | Rows / bytes | SHA-256 |
|---|---:|---|
| Source inventory / manifest | 32 files / 2,582 bytes | `d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158` |
| Compiled inventory / manifest | 64 files / 5,232 bytes | `04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953` |
| Combined activation construction | 7,814 bytes | `7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec` |

The activation source, JavaScript, and declaration remain 774/788/11 bytes
with their reviewed hashes; the wrapper source, JavaScript, and declaration
remain 42,865/41,159/1,244 bytes with their reviewed hashes. A later hardened
source file may diverge only within the 19-row allowlist while every current
`dist` object and all old manifest constants remain unchanged. The mismatch is
an explicit compile-not-performed boundary, never a replacement activation
construction.

M4-PI05 is closed at contract scope. The exact later verification boundary is
Docker-free typecheck/static/test/verify plus focused formatting and
`git diff --check`; it is static/unit evidence only.

## Evidence classes and limitations

- This contract and review are contract evidence.
- The syntax, hash, manifest, and bounded intrinsic assertions are static
  review evidence. No implementation test or typecheck was run in this review.
- A later passing implementation can establish only JavaScript
  snapshot/validation behavior at the fixed Node.js boundary. It cannot
  establish filesystem identity, backend authenticity, Docker behavior,
  runtime profile enforcement, adapter-route evidence, or `Observed`.
- Explicit backend callbacks remain authority. Compromised Node.js or native
  runtime behavior, pre-initialization intrinsic compromise, kernel/runtime
  compromise, malicious backend behavior outside its reviewed scope, and the
  issue #45 cooperative-host race remain outside the claim.
- Every historical build, recovery, control, activation, selected-profile,
  presentation, Expected, result, and Inconclusive classification remains
  immutable.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, documentation router, active plan, issue #45 contracts/result review, issue #46 contract, review prompt, architecture/threat/matrix/workflow documents | Read inside the repository without Docker, retained/result-state access, network, credentials, Remote Git, or external communication. |
| `git status --short --branch`, changed/untracked inventory, `git diff --stat`, `git diff --name-status`, and `git diff --check` | Existing issue #45/presentation work was identified and preserved; the pre-review diff check exited 0. |
| TypeScript AST export/function/parameter inventory over `containers/profile-control/src/*.ts` plus the complete proposed source/verification allowlists | Reproduced all listed ingress, brand, executor, backend-return, and process-state families; found no unlisted active untrusted data graph. |
| Bounded no-write Node intrinsic assertions | Exit 0; zero Proxy traps/accessor calls, exact Buffer/Uint8Array prototypes, foreign-realm distinction, shared/resizable detection, detached rejection, and class method data descriptors reproduced. |
| Exact issue #45 source/compiled construction manifest calculation | Exit 0; reproduced 32/64 inventories and all 2,582/5,232/7,814-byte manifest hashes above. |
| `sha256sum`, `wc -c`, and sorted allowlist manifest assertions | Exit 0; reproduced the contract/prompt, activation/wrapper, package-root, 19-source, and 20-existing-verification review identities above. |

One exploratory typed-array assertion exited 1 when strict-mode deletion of an
indexed element threw `TypeError`; no repository check failed, and no result
from that command is used as passing evidence. A corrected bounded intrinsic
assertion exited 0.

M4 tests, typecheck, `npm run m4:static`, `npm run m4:verify`, a
filesystem-emitting compile/build, production entry/executor, Docker,
container/runtime socket, retained/result state, cleanup, retry, network,
credential, host-home access, Remote Git, publication, deployment, and
third-party communication were intentionally not run. Standing authorization
was not needed or used because this review crossed no runtime approval gate.

## Decision and next task

M4-PI01 through M4-PI05 are closed at contract scope with no finding. Exactly
one Docker-free static/unit implementation may proceed under the contract's
19-production/21-verification-path allowlist. A fresh independent
implementation review is still mandatory before any compiled-output adoption,
activation construction, execution-gate definition, or runtime action.

Next: perform the exact bounded Docker-free public-input-hardening static/unit
implementation, saving its implementation prompt before the first source
change; do not emit compiled output or define a runtime gate.
