# M4 public-input-hardening implementation remediation re-review

## Review target and decision

- Target: the bounded issue #46 M4-PI01 Docker-free remediation
- Review type: fresh independent Docker-free read-only re-review
- Decision: **APPROVED at the Docker-free static/unit boundary**
- M4-PI01: closed at implementation scope
- M4-PI02 through M4-PI05: remain closed at implementation scope
- Issue #46 implementation/review phase: closed
- Compiled-output adoption, activation/runtime gates, Docker, retained/result
  state, runtime enforcement, historical evidence, and `Observed`: unchanged
  and unapproved

The review found no blocking or non-blocking finding. The remediation closes
the two invalid primitive-selector defaults and the duplicate unused executor
lease ingress without changing the fixed valid outputs or the production
backend's real lease ownership.

## M4-PI01 closure

### Exact primitive selector rejection

`expectedControls` and `fixedContainerArguments` now begin with the same exact
two-value guard. Every runtime value other than the primitive strings
`"permissive"` and `"constrained"` fails before an output branch:

- `expectedControls` throws the existing `INVALID_PROFILE` route error;
- `fixedContainerArguments` throws the existing `INVALID_DOCKER_PLAN` route
  error; and
- strict primitive comparisons consume no Proxy property, descriptor, or
  prototype hook.

The guard is additive. The valid selector branches still return the original
fixed permissive/constrained Expected arrays and Docker command suffixes.
Existing plan/definition coverage remains unchanged, while the focused test
adds invalid string, empty string, nullish, numeric, boolean, and Proxy values.

The static verifier parses both functions with the TypeScript AST and requires
the exact conjunction of the two strict-inequality comparisons as the first
statement, with the route-specific `failProfile` call in that branch. A later
default-to-constrained regression therefore fails before the broader tests.

### Lease-free executor outer input

`immutableInputLease` is absent from all three executor ingress layers:

1. `FixedExistingImageExecutionInput` has no such field;
2. `snapshotExistingImageExecutionInput` accepts only the six fixed data keys
   plus `backend`; and
3. the private frozen executor snapshot retains only those accepted values and
   the captured backend authority.

The rejected-extra-field test supplies a Proxy as the duplicate value. Exact
outer-key validation rejects it as `COMMAND_FAILURE` before backend authority
capture, so the result has an empty completed-step prefix, null profile
results, zero backend method calls including cleanup, and zero Proxy hooks.

`runFixedProductionControls` was traced separately. Its production definition
still constructs and validates the real `FilesystemIdentityLease`.
`createFixedControlHostBackend` receives that lease, validates it, stores it in
the backend, and owns its later validation/close settlement. The executor is
called with a newly written explicit outer object containing only the six data
fields and that backend. The remediation therefore removes only the duplicate
unclassified ingress and does not drop the reviewed backend lease.

## Preserved M4-PI02 through M4-PI05 boundaries

The remediation changes no shared descriptor/prototype/cycle or byte-view
helper and does not add a structured or byte ingestion edge. M4-PI02 and
M4-PI03 remain closed by the previously reviewed helper, route, negative, and
static evidence.

M4-PI04 remains closed: the existing-image executor still snapshots its exact
outer data and captures the four backend methods before its first callback or
`await`; invalid preflight invokes no method; backend returns remain untrusted;
and first-failure, cleanup, retention, and Inconclusive semantics are
unchanged. The real filesystem lease remains private backend state rather than
caller data.

M4-PI05 remains closed. The remediation adds no public schema or error code,
package export/script, dependency, runtime command or identity, Expected edit,
result, evidence-class change, or `Observed` promotion. The aggregate working
tree contains the earlier issue #45 and presentation work outside this
remediation allowlist; it was identified and preserved rather than treated as
new issue #46 implementation.

## Exact reviewed paths and snapshot

Production remediation was limited to the four approved paths. Verification
was limited to the three behavioral/static paths plus the already approved
mechanical current-construction refresh:

| Path | Bytes | SHA-256 |
|---|---:|---|
| `src/definitions.ts` | 8,520 | `6c57cb68a5f132c0d8d02d0872eee7029eccf41cf57f8e4946b812a5cd2c6638` |
| `src/docker-plan.ts` | 14,108 | `21c6d6c361c153eb525f1876bd8574ea3e40e401a57c38f039991cfcb5c03967` |
| `src/execution.ts` | 23,158 | `90df197e6cd712f3872c754d47a054adcd3b09e4cf145a4940b0239a154ac4dc` |
| `src/run-controls.ts` | 14,010 | `e9e4c14060e9caec6944767be3fca182cacc0f871dfa3ffd0f7fcc4ee4b1833d` |
| `test/public-input-hardening.test.ts` | 13,694 | `1c748bf1168fe10735e3ded9ec13b0edd318c27f8afaa66baab3bf13f0517a6d` |
| `test/execution.test.ts` | 18,036 | `917023e7d4adb91751952d914999e1e147800245934b6670fccec3133423ff22` |
| `scripts/verify-static.mjs` | 64,486 | `215a12ab565d9425f792fc5f25d2c726b94879d23b5c488478a8415ff8104c9c` |
| `test/frozen-research-profile-control-entry.test.ts` | 25,513 | `380fdba8779f175cfbd98e21c61195d4d59b06cb4d580e2d09c4ad169757aec8` |

Paths are relative to `containers/profile-control/`.

## Historical/current construction separation

The Docker-free static verifier and frozen construction test reproduced the
required immutable historical/current split:

| Construction | Bytes | SHA-256 |
|---|---:|---|
| Historical issue #45 source manifest | 2,582 | `d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158` |
| Historical source-edge manifest | 1,789 | `d83d8d353fcdddfc95eca1d4cb044627172fafe52d3bc71677d094f9bd690495` |
| Unchanged compiled manifest | 5,232 | `04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953` |
| Historical combined manifest | 7,814 | `7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec` |
| Current issue #46 source manifest | 2,585 | `65bd9c122281c8934d603afbd1aca07ca8d56c8a39b4cec12e1511528d76a445` |
| Current source-edge manifest | 2,002 | `b6da821f37515e16405de29b29486b2f9081b6d3d238b2d46207563396852434` |
| Current source plus unchanged compiled manifest | 7,817 | `29b8d0710f4dc2d7291e108df0ab0e718c9f7c80655000a0b0b743d0aa5e57cc` |

All 32 source and 64 compiled inventory names remain fixed. Every current
in-memory output divergence belongs to the exact issue #46 source allowlist,
while every old `dist` object remains byte-identical. Current source plus old
compiled output remains an explicit compile-not-performed boundary, not an
activation candidate.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, documentation router, active plan, issue #45 boundaries/result, issue #46 contract/reviews/prompts, and architecture/threat/matrix/workflow records | Read inside the repository at the Docker-free review boundary. |
| Initial instruction discovery using `find .. -name AGENTS.md -print` | This was an out-of-scope path-discovery mistake: it enumerated path names under the repository parent and met permission-denied result directories before the chained documentation reads ran. No protected file contents were read, and no output from this command was used as review evidence. Every later discovery/read command was repository-scoped. |
| `git status --short --branch`, aggregate changed/untracked inventory, `git diff --stat`, `git diff --name-status`, complete target diff/source inspection, and pre-record `git diff --check` | Existing accumulated work was identified and preserved; the pre-record whitespace check exited 0. |
| Focused selector, executor-schema/snapshot, production lease-transfer, backend-ownership, negative-test, AST, and construction-manifest trace | Reproduced the M4-PI01 closure and the unchanged dependent boundaries described above. |
| `./node_modules/.bin/vitest run --config containers/profile-control/vitest.config.ts --configLoader runner containers/profile-control/test/public-input-hardening.test.ts containers/profile-control/test/execution.test.ts` | Exit 0; 2 test files and all 36 tests passed. |
| `npm run m4:verify` | Exit 0; no-emit typecheck and Docker-free static verification passed, then 25 test files and all 300 tests passed. The static verifier reported that the activation wrapper was constructed but not invoked. |
| `wc -c` and `sha256sum` over the exact eight reviewed implementation/verification paths | Reproduced every path identity in the snapshot table. |
| Focused Prettier check over this review and the four status/handoff records; post-record `git diff --check` | Exit 0; all five Markdown files matched Prettier and the tracked diff had no whitespace error. |

## Evidence class, limitations, and next boundary

This review, source/AST trace, and manifest analysis are independent static
review evidence. The no-emit typecheck, static verifier, and tests are
static/unit evidence. They do not establish backend authenticity, Docker or
filesystem runtime behavior, profile enforcement, adapter-route evidence, or
`Observed`.

No implementation or test was repaired in this review. No production entry,
Docker command, runtime socket, probe/lifecycle fixture, filesystem-emitting
build, retained/result-state inspection, cleanup, retry, external network,
credential access, Remote Git, publication, deployment, or third-party
communication was used. The initial parent-scoped path enumeration disclosed
above was a process-boundary deviation, was not evidence, and did not read file
contents; it does not change the repository finding decision. Standing
authorization was not needed or used because no runtime approval gate was
crossed.

Issue #46 is approved only at its Docker-free static/unit implementation
boundary. The next task may begin only issue #47's first Docker-free
production raw-to-derived collector contract. It must define one adapter
boundary, deterministic clean regeneration, rejection preservation,
sanitization tests, an exact later implementation allowlist, and a saved fresh
independent contract-review prompt. It may not implement that collector or
open a runtime gate in the contract task.

Next: define issue #47's first Docker-free production raw-to-derived collector
contract and save its fresh independent contract-review prompt.
