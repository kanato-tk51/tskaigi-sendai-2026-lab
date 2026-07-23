# M4 public-input hardening contract

Status: **issue #46 Docker-free static/unit implementation approved; issue #47
contract next**

## Decision and boundary

Issue #46 hardens every untrusted JavaScript data value that crosses the active
M4 profile-control validation, construction, process-return, or result-parsing
boundary. The issue #45 filesystem-identity and activation generations are
complete only at their recorded static/unit and reviewed Inconclusive evidence
classes. This contract does not reopen, retry, repair, or reinterpret them.

The current low-level `readPlainRecord()` and `readPlainArray()` helpers already
reject several Proxy, accessor, symbol, and custom-prototype inputs. Individual
byte parsers also reject some `SharedArrayBuffer` views. Those local checks do
not yet form one closed public-input rule: typed wrapper objects are often read
before validation, asynchronous executors can retain caller-owned graphs across
`await`, backend carriers and backend return data are not explicitly separated,
and byte routes do not share an exact prototype/backing-buffer/snapshot policy.

The contract closes that gap with three disjoint input classes:

1. **Untrusted data:** records, arrays, primitive fields, and byte views supplied
   by a caller or returned by an injected backend. These are descriptor-only or
   intrinsic-only snapshotted into private canonical data before use.
2. **Explicit authority:** a doctor, build, recovery, or control backend whose
   callable methods the executor is intentionally authorized to invoke. The
   carrier is inspected without invoking accessors and its method identities are
   captured once. Callback return values are still untrusted data.
3. **Private branded state:** accepted staging snapshots, profile pairs, runtime
   layouts, plans, commands, and recovery inputs owned by an existing private
   `WeakMap` or `WeakSet`. A brand lookup precedes every property read. A forged,
   cloned, or proxied value fails the lookup and is never downgraded to ordinary
   data.

This is a contract-only task. It changes no M4 source, test, compiled output,
package export, profile, runtime input, result, Expected value, or `Observed`
value. It runs no production entry, Docker command, probe, lifecycle fixture,
or retained-state operation.

## Exact ingress inventory

The later implementation applies the policy to exactly the following active
data-ingress groups. A TypeScript annotation is not evidence that an argument
has crossed the boundary.

### Schema and byte roots

- `validateExecutionProfile`, `validateControlManifest`,
  `validateProfileControlPair`, and `crossValidateProfileManifest`;
- `validateApprovedImageInput`, `validateVersionedImageInput`,
  `validateBaseEnvironmentKeys`, `prepareStagingInput`,
  `verifyAcceptedStagingFiles`, `crossValidateApprovedStaging`, and
  `createAcceptedImageStagingSnapshot`;
- `validateControlEvidence`, `validateControlCompletion`,
  `compareControlEvidence`, `createControlCompletion`, and
  `crossValidateCompleteBundle`;
- `serializeCanonicalControlManifest`,
  `serializeCanonicalControlEvidence`,
  `parseCanonicalControlManifestBytes`,
  `parseCanonicalControlEvidenceBytes`, and
  `serializeCanonicalExecutionProfile` and
  `parseCanonicalExecutionProfileBytes`;
- `validateDockerInspectProjection` including its outer wrapper, raw Docker
  projection, profile, manifest, mount-source record, and environment-key
  array; and
- `parseOrchestratorArguments` and `runApprovedOrchestrator`, whose only
  accepted process argument input is a dense intrinsic array of the existing
  exact string operation;
- `serializeCanonicalPairExecutionResult`, which must validate and reconstruct
  the complete pair/per-profile result union before serialization; and
- `validateOfflineBuildResult`, `serializeCanonicalOfflineBuildResult`,
  `parseCanonicalOfflineBuildResultBytes`,
  `validateOfflineBuildRecoveryResult`,
  `serializeCanonicalOfflineBuildRecoveryResult`, and
  `parseCanonicalOfflineBuildRecoveryResultBytes`.

### Typed constructors and cross-bindings

- `createControlManifest`, `createProfileControlPair`,
  `createImageBuildPlan`, `createProfileDockerPlan`, and
  `createProfilePairDockerPlans`;
- `assertFixedImageBuildPlan`, `assertFixedProfilePairDockerPlans`,
  `createFixedOfflineBuildInput`, and
  `createFixedOfflineBuildRecoveryInput`; and
- the outer records accepted by the completion, inspection, staging, and
  evidence combinators above.

Primitive-only selectors such as `createExecutionProfile`,
`createFixedRuntimeLayout`, `fixedContainerArguments`, and `expectedControls`
must continue exact primitive validation. Private brand consumers such as
`copyPreparedStagingFile` may accept only their exact branded identity plus an
exact primitive selector; they do not reinterpret a failed brand as public
structured input.

### Asynchronous executor and backend-return roots

- `executeFixedDoctor` and every `FixedDoctorBackend.run()` return;
- `executeFixedOfflineBuild` and every fixed offline-build backend return;
- `executeFixedOfflineBuildRecovery` and every fixed recovery backend return;
- `executeFixedProfilePair` and `executeFixedExistingImageProfilePair`,
  including every `readBuildContext()`, `run()`, and `transfer()` return; and
- the state inputs to `observeOfflineBuildProcessFailure` and
  `observeOfflineBuildProcessOutput`.

The ordinary package-root export set remains unchanged. Internal production
host backends, issue #45 activation entry/executor, and filesystem leases do not
become public data constructors. They may supply values to an ingress above,
but their filesystem/process implementation and already reviewed authority
scope are not changed by this issue.

## Historical activation construction separation

Most allowlisted issue #46 modules belonged to the exact issue #45 activation
source/compiled construction snapshot. That exhausted generation binds the old
source and `dist` identities as historical review evidence; it does not forbid
all later source development or authorize rebinding the old generation to new
bytes.

The later implementation must therefore keep all of the following unchanged:

- `src/frozen-research-profile-control-entry.ts` and
  `src/frozen-research-profile-control-executor.ts`;
- their compiled JavaScript/declaration objects and every other current `dist`
  object;
- the issue #45 wrapper's embedded 22-row activation identities, 32/64
  inventories, Expected/run/root/container identities, command, output bounds,
  and historical manifest aggregates; and
- the package script, ordinary fail-closed entry, reviewed result record, and
  no-retry/no-alternate-generation decision.

`verify-static.mjs` and the frozen activation construction test may change only
to separate that named immutable historical snapshot from current issue #46
source. They must retain the exact old constants and compiled-object assertions,
must not replace an old hash with a new current-source hash, and must assert
that every intentional current-source divergence is in the issue #46 source
allowlist while its compiled counterpart remains unchanged. Current source and
old `dist` mismatch is an explicit compile-not-performed boundary, not an
activation candidate. Any later filesystem emit, compiled-output adoption,
activation construction, or runtime generation requires a separately named
contract and fresh review after issue #46; this contract chooses none.

## Descriptor-only record and array policy

Every structured data route must synchronously construct a route-specific
canonical snapshot. A generic `JSON.stringify`/`JSON.parse` clone,
`structuredClone`, spread, destructuring, `Object.assign`, `for...of`, or
property read from the original graph is not an input validator.

For every untrusted record, in this order:

1. Require non-null `object`, then call the captured `node:util.types.isProxy`
   before `Array.isArray`, prototype inspection, key enumeration, or any other
   reflection. A Proxy is rejected without invoking a trap.
2. Reject arrays on record routes. Accept only the captured intrinsic
   `Object.prototype` or `null`; cross-realm, class-instance, date, map, set,
   boxed primitive, typed-array, and every other custom prototype are rejected.
3. Reject every own symbol key. Obtain all own string property descriptors in
   one operation. Every accepted schema field must be an enumerable own data
   descriptor. Accessors, missing descriptors, non-enumerable schema fields,
   and unknown fields fail before a value is used.
4. Copy descriptor values into a fresh null-prototype record. Route validators
   recurse only through their fixed schema and reconstruct a fixed-key-order,
   deeply frozen canonical result. No caller record or nested container remains
   reachable from the result or a private execution snapshot.

For every untrusted array:

1. Reject a Proxy before array or prototype inspection. Require an actual array
   with exactly the captured intrinsic `Array.prototype`, no own symbol keys,
   and the ordinary non-enumerable data `length` descriptor.
2. Require a safe non-negative length, own enumerable data descriptors for
   every index `0..length-1`, and no hole, accessor, non-index string key, or
   extra index. Never use the caller's iterator.
3. Copy index descriptor values in numeric order into a fresh ordinary array,
   validate each fixed-schema element, and freeze the canonical array.

Cycles are rejected. Repeated aliases at two valid schema positions do not
preserve caller aliasing: each position is reconstructed from descriptor
values into canonical immutable data. Record key order in untrusted input does
not change canonical output order. Canonical byte parsers still reject an input
whose original bytes differ from the fixed canonical key order and final LF.

No accessor, Proxy trap, `toJSON`, `valueOf`, iterator, coercion hook, or custom
prototype method may run during rejection or snapshot creation. An unexpected
reflection error maps to the route's existing sanitized error code; its raw
message or offending value is not retained.

## Exact byte-view and shared-memory policy

Every byte-bearing ingress uses one shared intrinsic-only snapshot helper before
checking content, hashing, decoding, storing, or crossing an `await`.

Accepted byte input is exactly a genuine Node-recognized `Uint8Array` whose
immediate prototype is either the captured intrinsic `Uint8Array.prototype` or
the captured intrinsic `Buffer.prototype`. The `Buffer` case is required for
fixed host filesystem/process adapters. All other typed arrays, `DataView`,
direct `ArrayBuffer`, typed-array subclass/custom-prototype instances, boxed or
array inputs, and Proxy-wrapped views are rejected.

For an otherwise accepted view, the helper must:

- reject own symbol keys, own non-index string keys, a missing index, or an own
  accessor rather than consulting an iterator or prototype method;
- obtain backing buffer, byte offset, and byte length only through captured
  typed-array intrinsic accessors;
- reject a detached buffer, every `SharedArrayBuffer`-backed view, and every
  resizable `ArrayBuffer`; double-reading, retrying, `Atomics`, or copying a
  shared view and hoping it was stable is not an accepted settlement rule;
- apply the route's existing zero-length and maximum-length rules to the
  intrinsic byte length; and
- synchronously copy exactly the view range through a captured intrinsic into a
  new fixed-length, non-shared `Uint8Array`, then perform every later length,
  digest, equality, decode, canonical-byte, and output operation on that copy.

A fixed non-shared `ArrayBuffer` cannot be concurrently mutated by another
agent. Caller mutation, buffer detachment, or replacement after the synchronous
copy therefore cannot change the private snapshot. If an accepted byte value is
later returned to a caller, the caller receives a new copy, not the private
snapshot. Non-empty typed arrays are never treated as deeply frozen objects;
their isolation comes from private copying and non-exposure.

The implementation captures the required untampered Node.js intrinsics once at
module initialization without performing I/O or another import-time side
effect. Same-realm intrinsic compromise before module initialization, Node.js
runtime compromise, and native memory corruption remain outside this threat
model and are not claimed as closed by issue #46.

## Complete synchronous snapshot and authority settlement

Every synchronous constructor completes its entire data snapshot before it
returns. Every asynchronous executor must, before its first `await`, callback,
filesystem mutation, or child/runtime command:

1. descriptor-snapshot its outer input record;
2. resolve every required private brand by exact `WeakMap`/`WeakSet` identity;
3. canonicalize every unbranded data object, array, and byte view reachable by
   the fixed input schema; and
4. capture its exact backend method authorities as described below.

After that preflight, executor code must not read the original wrapper, caller
data graph, backend method property, or caller byte view again. Each backend
return is independently snapshotted immediately after its promise settles and
before another callback, result comparison, or output write. Mutation of an
input after function entry, between promise settlements, or after return cannot
change command identity, limits, paths, expected values, canonical evidence,
failure ordering, or public output.

An authority carrier is the sole custom-prototype exception. It must be a
non-null, non-Proxy object. For each fixed required method name, a
descriptor-only walk may inspect the carrier and at most four non-Proxy custom
prototype objects, and must then reach the captured `Object.prototype`. The
first matching descriptor before `Object.prototype` must be a data descriptor
containing a non-Proxy callable. An accessor method, missing or non-callable
method, proxied prototype, over-depth chain, or method supplied only by
`Object.prototype` fails without invoking it. The implementation captures and
receiver-binds each callable exactly once into a private frozen null-prototype
authority record. Later replacement of a carrier method cannot change the
captured authority. Other carrier fields are authority-private state and are
never interpreted or serialized as public data.

Callback code is authority and is intentionally invoked; this contract does
not make arbitrary callback code harmless. Its arguments are fixed canonical
copies, and all of its returns are untrusted data. A Proxy/accessor-invalid
outer executor input provides no trusted cleanup authority, so no backend method
is called. A valid authority plus an invalid pre-attempt data graph also causes
zero callback calls because no external state has been created. Once a callback
attempt has begun, existing first-failure, `close`, cleanup, retention, and
Inconclusive rules remain in force.

## Canonical ownership and error behavior

- Validators and constructors return fresh, deeply frozen canonical records and
  arrays with no reference to untrusted containers. Fixed repository constants
  may be reused only when already deeply immutable and semantically exact.
- Private brand maps retain the canonical object and any private byte snapshot.
  Publicly visible properties are never used to authenticate a brand.
- Cross-validation functions revalidate unbranded typed inputs at entry. They do
  not rely on an earlier TypeScript type assertion or on `Object.freeze` alone.
- Existing public schemas, fixed values, key order, error-code vocabulary, and
  canonical serialization bytes remain unchanged. This task does not add a raw
  error, input value, prototype detail, buffer type, host path, or private
  identity to a result.
- A synchronous schema API continues to throw its existing route-specific
  `ProfileControlError`. An executor maps invalid caller/backend data to its
  existing sanitized Inconclusive failure class with an empty pre-attempt step
  prefix. No invalid preflight is reported as a capability observation.
- Backend return rejection after a command has begun retains that attempt and
  its existing first-failure/cleanup semantics. Expected values are never
  changed to fit a rejected or mutable input.

## Exact negative-test boundary

The later implementation must add a table-driven Docker-free matrix that binds
every ingress group above to its existing error/failure class and a zero-side-
effect counter. The matrix must include all of the following classes.

### Structured graph rejection

- top-level and every distinct nested schema record as a Proxy whose traps
  throw or increment counters; the counters remain zero;
- an accessor for each top-level wrapper class, each distinct nested record
  class, and a dense-array element; getter/setter counters remain zero;
- null, scalar, array-as-record, record-as-array, class/cross-realm/custom
  prototype, own symbol, non-enumerable expected field, unknown field, sparse
  array, extra index/string key, invalid length, cycle, and wrong primitive;
- `Object.prototype` pollution before validation, proving the null-prototype
  snapshot and exact own-key checks do not consume inherited values; and
- caller mutation after a synchronous return and, using deferred fake backend
  promises, mutation after asynchronous entry and between settlements. The
  canonical input, selected command, limits, evidence, and result stay bound to
  the initial private snapshot.

### Byte rejection and isolation

- Proxy view, typed-array subclass/custom prototype, other typed arrays,
  `DataView`, direct buffer, own symbol/expando/accessor, missing or extra
  indexed shape, detached buffer, resizable buffer, and a view over
  `SharedArrayBuffer` for every distinct canonical/staging/process/transfer byte
  route;
- ordinary `Uint8Array`, exact `Buffer`, and non-zero-offset fixed-buffer view
  acceptance, proving only the selected view range is copied;
- zero-length and over-limit values according to each existing route, invalid
  UTF-8, noncanonical LF/key order, and mutation of the original bytes after
  entry; and
- private-copy non-aliasing on staging copy-out and every public byte return.

### Authority and settlement

- Proxy carrier, accessor method, proxied callable, missing/non-callable method,
  proxied or over-depth prototype chain, `Object.prototype`-only method, and
  method replacement after entry;
- acceptance of the existing plain-object and class-instance fake backends with
  method identities captured once;
- Proxy/accessor/custom-prototype/shared-memory values returned from each
  distinct backend return family; and
- proof that invalid preflight invokes zero backend methods, while invalid data
  after an attempted callback remains Inconclusive and cannot be repaired,
  retried, or promoted to `Observed`.

The focused matrix must cover package-root functions and the internal
offline-build/recovery/profile-byte roots explicitly; testing only
`readPlainRecord()` or one canonical parser is insufficient. Static assertions
must enumerate the contracted ingress functions and reject a new structured or
byte ingestion edge that bypasses the shared helpers or retains the original
input across an `await`.

Tests may use only in-memory objects, buffers, fake backends, and bounded
repository-owned disposable fixtures already permitted by the M4 suite. They
must not call Docker, a runtime socket, a production entry, a probe/lifecycle
fixture, retained state, a historical result root, or external network.

## Exact later implementation allowlist

After a positive fresh contract review, exactly one Docker-free static/unit
implementation may change only these production source paths:

- `containers/profile-control/src/safe-data.ts`;
- `containers/profile-control/src/canonical.ts`;
- `containers/profile-control/src/completion.ts`;
- `containers/profile-control/src/definitions.ts`;
- `containers/profile-control/src/docker-plan.ts`;
- `containers/profile-control/src/doctor.ts`;
- `containers/profile-control/src/evidence.ts`;
- `containers/profile-control/src/execution.ts`;
- `containers/profile-control/src/image-input.ts`;
- `containers/profile-control/src/inspect.ts`;
- `containers/profile-control/src/offline-build-process.ts`;
- `containers/profile-control/src/offline-build.ts`;
- `containers/profile-control/src/offline-build-recovery.ts`;
- `containers/profile-control/src/orchestrator.ts`;
- `containers/profile-control/src/profile-input.ts`;
- `containers/profile-control/src/run-controls.ts`;
- `containers/profile-control/src/staging.ts`;
- `containers/profile-control/src/types.ts`; and
- `containers/profile-control/src/validation.ts`.

Only these verification paths may also change:

- new `containers/profile-control/test/public-input-hardening.test.ts`;
- `containers/profile-control/test/canonical.test.ts`;
- `containers/profile-control/test/completion.test.ts`;
- `containers/profile-control/test/docker-plan.test.ts`;
- `containers/profile-control/test/doctor.test.ts`;
- `containers/profile-control/test/evidence.test.ts`;
- `containers/profile-control/test/exact-input.test.ts`;
- `containers/profile-control/test/execution.test.ts`;
- `containers/profile-control/test/frozen-research-profile-control-entry.test.ts`;
- `containers/profile-control/test/helpers.ts`;
- `containers/profile-control/test/image-input.test.ts`;
- `containers/profile-control/test/inspect.test.ts`;
- `containers/profile-control/test/offline-build-process.test.ts`;
- `containers/profile-control/test/offline-build.test.ts`;
- `containers/profile-control/test/offline-build-recovery.test.ts`;
- `containers/profile-control/test/orchestrator.test.ts`;
- `containers/profile-control/test/profile.test.ts`;
- `containers/profile-control/test/run-controls.test.ts`;
- `containers/profile-control/test/staging.test.ts`;
- `containers/profile-control/test/static-safety.test.ts`; and
- `containers/profile-control/scripts/verify-static.mjs`.

No host-backend, filesystem-identity, ordinary or frozen-research
entry/executor production source, package-root export, package script, profile,
fixture, image input, compiled `dist` output, result, evidence, prompt history,
or other M4 path belongs to that implementation. The one allowlisted frozen
entry test may change only for the historical/current construction separation
above. The implementation may not add a dependency, schema version, error
code, execution command, or runtime gate.

The exact verification boundary is `npm run m4:typecheck`, `npm run m4:static`,
`npm run m4:test`, `npm run m4:verify`, focused formatting, and
`git diff --check`. The implementation must remain Docker-free and must not run
`npm run m4:doctor`, `npm run m4:build`,
`npm run m4:recovery:offline-build`, `npm run m4:run:controls`, or
`npm run m4:execute:frozen-research`.

## Evidence classification and limitations

- This document and its review are contract evidence only.
- A later passing implementation provides static/unit evidence that JavaScript
  data inputs are snapshotted under the fixed Node.js boundary. It is not
  filesystem identity, backend authenticity, Docker behavior, profile runtime
  enforcement, adapter-route evidence, or `Observed` evidence.
- Explicit backend callbacks remain authority. Their code can act according to
  the separately reviewed fake or production backend boundary; this contract
  only prevents implicit property hooks and mutable return graphs from becoming
  data authority.
- The contract does not protect against a compromised Node.js runtime,
  pre-initialization intrinsic tampering, native memory corruption, kernel or
  runtime compromise, the issue #45 cooperative-host race limitation, or a
  malicious production backend outside its reviewed command/filesystem scope.
- Historical profile-control, activation, selected-profile, and presentation
  attempts remain immutable at their recorded evidence classes. No new
  Expected revision, run ID, result root, container/image identity, command,
  retry, cleanup, retained-state action, or `Observed` promotion is selected.

## Current decision and next task

M4-PI01 fixes the exact ingress inventory and three input classes. M4-PI02 fixes
descriptor-only records/arrays and exact prototype/symbol/accessor behavior.
M4-PI03 fixes intrinsic-only byte views and rejects shared, resizable, detached,
proxied, and custom-prototype storage. M4-PI04 fixes complete pre-`await`
snapshots, private-brand lookup, and explicit authority capture. M4-PI05 fixes
canonical ownership, errors, the negative matrix, implementation allowlist,
and evidence ceiling.

The fresh independent Docker-free read-only review in
[`reviews/m4-public-input-hardening-contract.md`](reviews/m4-public-input-hardening-contract.md)
reproduces the complete ingress, descriptor/prototype, byte/shared-memory,
temporal/authority, test/static, historical-construction, and evidence
boundaries. It closes M4-PI01 through M4-PI05 at contract scope with no
blocking or non-blocking finding and approves exactly one later Docker-free
static/unit implementation under the 19-production/21-verification-path
allowlist.

The bounded implementation saved
[`prompts/m4-public-input-hardening-implementation.md`](../prompts/m4-public-input-hardening-implementation.md)
before the first source change. It centralizes descriptor-only record/array,
intrinsic byte, private-brand, and explicit-authority snapshots; applies them
to the contracted constructors, validators, process returns, serializers, and
async executors; and adds the negative/static regression boundary. The exact
Docker-free `npm run m4:verify` passes typecheck, static verification, 25 test
files, and 298 tests.

The static verifier and frozen activation construction test retain the exact
historical issue #45 source/compiled constants while separately binding the
current allowlisted source manifest and edge graph. No compiled output,
production activation/runtime gate, Docker or retained/result-state access,
historical runtime evidence change, or `Observed` promotion occurred. This is
static/unit evidence only; the independent decision below does not promote its
evidence class.

The fresh independent Docker-free read-only implementation review is now
recorded in
[`reviews/m4-public-input-hardening-implementation.md`](reviews/m4-public-input-hardening-implementation.md).
It reproduces the passing 25-file/298-test static/unit boundary and closes
M4-PI02 through M4-PI05 apart from dependent M4-PI01 coverage, but records a
blocking M4-PI01 finding. `expectedControls` and `fixedContainerArguments`
default every non-`permissive` runtime value to constrained behavior instead of
performing the contract's exact primitive validation. The existing-image
executor also accepts and retains the duplicate unused `immutableInputLease`
caller value across `await` without classifying it as data, authority, or
required private branded state. Current tests/static inventory do not reject
those cases.

The exact bounded remediation may change only `src/definitions.ts`,
`src/docker-plan.ts`, `src/execution.ts`, `src/run-controls.ts`,
`test/public-input-hardening.test.ts`, `test/execution.test.ts`, and
`scripts/verify-static.mjs`, plus saved remediation/re-review prompts and these
minimal status records. It must add exact selector rejection, remove the unused
duplicate lease from the executor boundary while preserving backend lease
ownership, and add focused negative/static regressions. Compiled output,
package exports/scripts, Docker, retained/result state, runtime gates,
historical evidence, issue #47, and `Observed` remain unchanged and
unapproved.

Next: perform only the bounded M4-PI01 Docker-free remediation above, saving
its implementation and fresh re-review prompts before the first source change.

Bounded M4-PI01 remediation update (2026-07-20): the implementation and fresh
re-review prompts were saved before the first source change.
`expectedControls` and `fixedContainerArguments` now reject every runtime value
outside exact `"permissive" | "constrained"` with their existing
`INVALID_PROFILE` and `INVALID_DOCKER_PLAN` errors before selecting output.
The existing-image executor's type, exact outer key set, and private snapshot
no longer accept or retain `immutableInputLease`. The production definition
keeps the actual lease only for `createFixedControlHostBackend`, and passes an
explicit lease-free outer record to the executor.

Focused tests reject invalid primitive selectors without invoking Proxy hooks
and reject the removed duplicate lease field before any backend method or
cleanup call. The static verifier now requires a TypeScript-AST exact two-value
guard as the first statement of both selectors. The mechanical current-source
identity refresh uses the original issue #46 verification allowlist: the
current source manifest is 2,585 bytes with SHA-256
`65bd9c122281c8934d603afbd1aca07ca8d56c8a39b4cec12e1511528d76a445`,
the source-edge manifest is 2,002 bytes with SHA-256
`b6da821f37515e16405de29b29486b2f9081b6d3d238b2d46207563396852434`,
and current source plus unchanged compiled output is 7,817 bytes with SHA-256
`29b8d0710f4dc2d7291e108df0ab0e718c9f7c80655000a0b0b743d0aa5e57cc`.
The historical issue #45 2,582/5,232/7,814-byte identities and every compiled
object remain unchanged.

The Docker-free `npm run m4:verify` passes no-emit typecheck, static
verification, 25 test files, and all 300 tests. No compiled output, package
surface, Docker action, production executor, retained/result-state access,
runtime gate, historical evidence, issue #47 work, or `Observed` change
occurred. Standing authorization was not needed. The fresh re-review input is
saved at
[`prompts/reviews/m4-public-input-hardening-implementation-remediation-review.md`](../prompts/reviews/m4-public-input-hardening-implementation-remediation-review.md).

Next: perform the fresh independent Docker-free read-only M4-PI01 remediation
re-review under the saved prompt above; do not begin issue #47 before that
decision.

Fresh M4-PI01 remediation re-review update (2026-07-20): the independent
Docker-free read-only review in
[`reviews/m4-public-input-hardening-implementation-remediation.md`](reviews/m4-public-input-hardening-implementation-remediation.md)
closes M4-PI01 at implementation scope with no blocking or non-blocking
finding. M4-PI02 through M4-PI05 remain closed. The review reproduced exact
selector rejection, the lease-free executor type/schema/snapshot, real lease
ownership in the production backend, zero-hook/zero-backend negative cases,
the AST first-guard assertions, and the immutable historical/current
construction split.

The focused 2-file suite passed all 36 tests. `npm run m4:verify` passed
no-emit typecheck, Docker-free static verification, 25 test files, and all 300
tests. The review changed no implementation or test and used no Docker,
production executor, retained/result state, runtime gate, historical evidence,
or `Observed`. Issue #46 is complete only at the Docker-free static/unit
boundary; it establishes no runtime enforcement.

Next: define issue #47's first Docker-free production raw-to-derived collector
contract and save its fresh independent contract-review prompt; do not
implement the collector in that contract task.

Issue #47 contract handoff update (2026-07-20): the first Docker-free
production raw-to-derived collector contract is now saved at
[`m3-production-raw-to-derived-collector.md`](m3-production-raw-to-derived-collector.md),
with its fresh independent review prompt under `../prompts/reviews/`. It binds
only the codegen `observe` adapter family and does not ingest or alter an
historical result. Issue #46 remains closed only at its reviewed Docker-free
static/unit boundary.

Next: perform the fresh independent Docker-free read-only issue #47 contract
review; do not implement or activate the collector before that decision.
