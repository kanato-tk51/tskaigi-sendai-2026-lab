# M4 public-input-hardening implementation review

## Review target and decision

- Target: the bounded issue #46 Docker-free static/unit implementation
- Review type: fresh independent Docker-free read-only implementation review
- Decision: **BLOCKED on M4-PI01**
- M4-PI01: **open**
- M4-PI02: closed at implementation scope
- M4-PI03: closed at implementation scope
- M4-PI04: closed at implementation scope apart from the unclassified ingress
  retained under M4-PI01 below
- M4-PI05: closed for the implemented canonical/error/allowlist/evidence
  boundaries; the missing M4-PI01 negative cases are required remediation
  evidence, not a second finding
- Docker, compiled-output adoption, activation/runtime gate, retained/result
  state, issue #47, and `Observed`: unchanged and unapproved

The implementation reproduces its claimed Docker-free verification result:
`npm run m4:verify` passes typecheck, the static verifier, 25 test files, and
all 298 tests. That passing suite does not close the finding below because the
two invalid primitive-selector cases and the unused executor input class are
not exercised by the current tests or rejected by the current static
inventory.

## M4-PI01 — incomplete primitive and outer-input closure

The contract explicitly lists `expectedControls` and
`fixedContainerArguments` as primitive-only selectors that must perform exact
runtime validation. The current implementations still rely on their
TypeScript `ProfileId` annotation:

- `expectedControls` returns the constrained Expected array for every runtime
  value other than the exact string `"permissive"`;
- `fixedContainerArguments` returns the constrained Node argument array for
  every runtime value other than the exact string `"permissive"`; and
- neither function contains a fail-closed guard for the exact
  `"permissive" | "constrained"` domain.

This is observable at both a package-root data selector and a direct internal
command selector. An invalid value is converted into valid constrained data or
command arguments instead of being rejected with the existing route error.
The TypeScript annotation is not runtime evidence and cannot close this public
input boundary.

The existing-image executor also accepts an optional `immutableInputLease`
field in its outer record, casts the descriptor value to
`FilesystemIdentityLease`, and retains that original caller value in
`fixedInput` across later `await` points. The executor never reads or needs the
field: the production backend already owns and validates the real lease. The
value is therefore neither required private branded state nor captured
authority, but remains an accepted unclassified caller graph. The smallest
closure is to stop passing, accepting, and retaining that duplicate field at
the executor boundary while leaving the backend's independently reviewed lease
ownership unchanged.

The focused public-input test covers the central helpers, doctor authority,
staging copy-out, orchestrator arguments, and pair serialization. The route
suite references the two selectors only with valid profile IDs, and the static
verifier inventories function names without asserting their invalid-value
branches. It therefore cannot detect either selector default.

M4-PI01 remains open. This finding does not establish that an invalid selector
or duplicate lease reached a historical runtime occurrence. It blocks only the
issue #46 static/unit implementation approval and any transition to issue #47.

## M4-PI02 — descriptor, prototype, and cycle closure

The implementation closes the structured-data boundary outside M4-PI01:

- `readPlainRecord` and `readPlainArray` reject Proxy before prototype,
  symbol, or descriptor inspection;
- records accept only the captured intrinsic `Object.prototype` or `null`, and
  dense arrays accept only the captured intrinsic `Array.prototype` plus exact
  enumerable index and non-enumerable length data descriptors;
- accessors, symbols, non-enumerable record fields, holes, extras, custom and
  cross-realm data prototypes fail without consuming a property getter or
  Proxy trap; and
- route validators reconstruct fixed records and arrays, validate nested
  values synchronously, and reject cyclic values when they reach the fixed
  nested schema.

The focused test reproduced zero Proxy trap and accessor counts, dense-shape
rejection, inherited-pollution non-consumption, custom/cross-realm rejection,
and cyclic pair-step rejection. Existing profile, canonical, evidence,
offline-build, and recovery tests retain their route errors and canonical
ordering.

## M4-PI03 — byte and shared-memory closure

Every changed caller/backend byte ingress converges on `snapshotBytes`. It
accepts only Node-recognized `Uint8Array` objects whose immediate prototype is
the captured local ordinary `Uint8Array.prototype` or `Buffer.prototype`, then
uses captured intrinsic slot getters and the captured typed-array setter.

The implementation rejects Proxy, subclass/custom/cross-realm views, other
typed arrays, `DataView`, direct buffers, symbol/expando/accessor shape drift,
detached, resizable, and shared backing storage. It checks the selected
offset/length and route maximum before copying into a fresh non-shared array.
The staging brand maps keep private copies and public staging byte returns make
another copy. The focused tests reproduced a non-zero-offset selected range,
post-entry mutation isolation, Buffer acceptance, unsafe-view rejection, and
private-copy non-aliasing.

## M4-PI04 — temporal, authority, and private-state closure

The required backend methods are descriptor-captured before the first callback
or `await` for doctor, build-first profile execution, existing-image profile
execution, offline build, and recovery. `captureAuthority` rejects a Proxy
carrier or prototype, walks no more than four custom prototypes, accepts only
the first own data descriptor containing a non-Proxy callable, and creates a
receiver-bound frozen null-prototype authority record. The current class and
plain fake backends remain accepted.

Outer data, fixed plan/snapshot/pair brands, and backend authority are resolved
before executor callbacks. Each `run`, `readBuildContext`, and `transfer`
return is descriptor/byte-snapshotted immediately after settlement. The source
trace and focused doctor mutation test reproduce method replacement isolation
and return mutation isolation. Existing first-failure, child-`close`, cleanup,
retention, and Inconclusive mappings remain covered by the route suites.

The duplicate unused `immutableInputLease` value is classified under M4-PI01
because it is an accepted but unclassified outer ingress. No property or method
is read from it, so it does not create a separate authority-timing finding.

## M4-PI05 — canonical ownership, allowlist, and evidence

The current implementation preserves existing schemas, error-code vocabulary,
fixed values, canonical key order, package-root exports, and result evidence
ceilings. The issue #46 source/static assertions do not adopt a package script,
dependency, runtime command, result identity, Expected value, or `Observed`
value. The aggregate working tree contains earlier issue #45 host-backend,
filesystem, activation, package, profile, test, documentation, and prompt
changes outside the issue #46 allowlist; this review preserved them and did
not classify the aggregate `HEAD` diff as a new issue #46 implementation.

The static verifier instead binds the exact 19-source issue #46 allowlist,
rejects an unclassified activation-closure source divergence, and keeps the old
compiled inventory byte-for-byte separate. The current negative/static suite
is sufficient for the implemented helper, byte, authority, brand, canonical,
and route-error boundaries, but it lacks the exact invalid-selector and
duplicate-lease cases required to close M4-PI01.

## Historical/current construction separation

`npm run m4:static` and the frozen activation construction test independently
reproduced the required separation:

| Construction | Bytes | SHA-256 |
|---|---:|---|
| Historical issue #45 source manifest | 2,582 | `d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158` |
| Unchanged compiled manifest | 5,232 | `04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953` |
| Historical combined manifest | 7,814 | `7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec` |
| Current issue #46 source manifest | 2,585 | `8bf03633689be35d5cf9162ab77835496683618ee96c529fb15cf98532d84e58` |
| Current source-edge manifest | 2,027 | `0be386f65a3f16fd93ce11adec2e6a082a96f21d3acad8c4a9bef4d830d8c251` |
| Current source plus unchanged compiled manifest | 7,817 | `d2d56d29b9dd5ca519f9b2411127be84072f39bb412fe9b29a53898c46686501` |

The source and compiled inventories remain 32 and 64 files. Every permitted
in-memory compiler divergence belongs to the 19-source issue #46 allowlist;
the old `dist` objects are unchanged. Current source plus old compiled output
is a compile-not-performed boundary, not an activation candidate.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, documentation router, active plan, issue #45 contracts/result review, issue #46 contract/review/implementation prompts, and architecture/threat/matrix/workflow documents | Read within the repository without Docker, retained/result-state, network, credential, Remote Git, publication, deployment, or external-communication access. |
| `git status --short --branch`, changed/untracked inventory, `git diff --stat`, `git diff --name-status`, issue #46 allowlist diff/source inspection, and pre-review `git diff --check` | Existing issue #45/presentation work was identified and preserved; the pre-review diff check exited 0. |
| TypeScript source/export/ingress trace over the 19 production paths and 21 verification paths | Reproduced the shared descriptor/byte helpers, package and internal ingresses, private brands, authority families, backend returns, process-state helpers, serializers, and async preflight order. |
| Corrected bounded TypeScript AST selector assertion | Exit 0; `expectedControls` has only a conditional return, `fixedContainerArguments` has a permissive-only `if` plus terminal return, and neither function contains a fail-closed guard. |
| Focused negative/static test search | The selectors appear only on valid typed helper paths; no invalid selector or duplicate executor-lease rejection is asserted. |
| `npm run m4:verify` | Exit 0; no-emit typecheck and Docker-free static verification passed, then 25 test files and all 298 tests passed. |
| Historical/current construction assertions inside `m4:static` and the focused activation test | Reproduced all six manifest byte counts/hashes, the 32/64 inventories, unchanged old compiled objects, and allowlisted current-source divergence. |
| Post-record `npm run m4:static` | Exit 0; the updated status records preserved the Docker-free static contract and did not invoke the activation wrapper. |
| Focused Prettier check over this review and four status records; `git diff --check` | Exit 0; all five Markdown files matched Prettier and the tracked diff had no whitespace error. |

An initial bounded selector-shape script correctly found that neither selector
had a fail-closed guard but used a string marker that did not classify the
terminal constrained argument-array return. Its output is not used as the
fixed-container branch proof; the corrected TypeScript AST assertion above is.

## Evidence class and limitations

This review and its source/AST/hash analysis are independent static review
evidence. The passing no-emit typecheck, static verifier, and 298 tests are
static/unit evidence. They do not establish backend authenticity, Docker
behavior, filesystem runtime identity, profile enforcement, adapter-route
evidence, or `Observed`.

No production entry, Docker command, runtime socket, probe/lifecycle fixture,
filesystem-emitting build, retained/result-state access, cleanup, retry,
repair, external network, credential, host-home access, Remote Git,
publication, deployment, or third-party communication was used. Standing
authorization was not needed or used because this review crossed no runtime
approval gate.

## Exact bounded remediation

The next task may remediate only M4-PI01 at the existing Docker-free
static/unit evidence class:

1. make `expectedControls` and `fixedContainerArguments` reject every runtime
   value other than the exact strings `"permissive"` and `"constrained"` with
   their existing route error codes before selecting output;
2. stop `runFixedProductionControls` from passing the duplicate
   `immutableInputLease` to `executeFixedExistingImageProfilePair`, and remove
   that unused field from the executor's accepted outer schema/fixed snapshot
   while preserving the production backend's lease ownership and validation;
3. add focused zero-side-effect negative regressions for both invalid
   selectors and the rejected extra executor field, plus a static assertion
   that prevents either selector from regaining a default-to-constrained
   branch; and
4. rerun only the approved Docker-free typecheck/static/test/verify, focused
   formatting, and `git diff --check` boundary.

The remediation production allowlist is limited to
`src/definitions.ts`, `src/docker-plan.ts`, `src/execution.ts`, and
`src/run-controls.ts`. Verification changes are limited to
`test/public-input-hardening.test.ts`, `test/execution.test.ts`, and
`scripts/verify-static.mjs`, plus a saved remediation and fresh re-review
prompt and minimal status records. It must not emit compiled output, change a
package export/script, start issue #47, define a runtime gate, run Docker, use
retained/result state, change historical evidence, or promote `Observed`.

Next: perform only the bounded M4-PI01 Docker-free remediation above, saving
its implementation and fresh re-review prompts before the first source change.
