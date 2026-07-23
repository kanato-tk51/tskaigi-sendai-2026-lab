# M0/M2-A issue #43 evidence-transfer implementation-remediation re-review

## Review target and decision

- Target: the uncommitted `20260721-01` M2A-TRI01 through M2A-TRI04
  Docker-free implementation remediation
- Review type: fresh independent Docker-free read-only remediation re-review
- Review prompt:
  [m2-a-evidence-transfer-implementation-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-implementation-remediation-review.md)
- Decision: **BLOCKED; no construction/execution-gate task is approved**
- Closed finding: M2A-TRI03
- Findings still open: M2A-TRI01, M2A-TRI02, and M2A-TRI04 on the three
  residuals below
- Implementation repair or runtime execution performed in this review: none

M2A-TR01 and M2A-TR02 remain closed. M2A-TR03 through M2A-TR06 remain
blocked at implementation scope. This review does not approve image/context
construction, an image candidate, Docker, lifecycle execution, transfer,
result access, evidence acceptance, or standing-authorization use.

## Independently reproduced identities and boundaries

The review reproduced the exact ordered 31-file M2-A/probe input set and
aggregate:

```text
sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04
```

The five anchors also matched:

| Input | SHA-256 |
| --- | --- |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `packages/probe-core/package.json` | `0d71338f1e232269fdfce8f097851b9404b9532c5089df4dffbb3f5aa788b520` |
| `packages/npm-lifecycle-probe/package.json` | `834278a7654bda1acb7ac9f4337b088173d816c86307f312c55d96447a91c59b` |
| consumer fixture manifest | `ab3c01396a1eac8a8a149f15c2ed09d5bb78aec203a7d5a958845d8bb7ceaefb` |
| dependency fixture manifest | `a411bf6c3cdf02f8b02247095740a62181a384a2dfccb04a5643f63d70f20fd1` |

The generation, expected revision, scenario, run ID, ignored result root,
container run root, container names, named volume, candidate tag, Node/npm
versions, loopback port, 1/6/0 event contract, one producer, and
`workerId: null` remain fixed. No historical M0 byte, marker/stdout fallback, scenario,
Expected value, matrix `Observed` value, or result byte changed or was reused.

The complete plan now contains every required absence, volume-create,
container-create, pre-inspect, start, wait, final-inspect, and fixed-copy argv.
Its internally constructed value fixes `/usr/bin/docker`, `shell: false`, the
16,384-byte output limit, the 30,000/180,000 ms bounds, exact three-key CLI
environment, credential-empty layout policy, fixed image ID, security/resource
policy, and `executionApproved: false`. The library has no child-process import
or production backend, the fake backend remains privately branded, and the
root exposes only the three verification scripts.

## M2A-TR decisions

| Item | Implementation-scope decision |
| --- | --- |
| M2A-TR01 — fresh identity and immutable historical boundary | **CLOSED** |
| M2A-TR02 — exact M0-to-M2-A occurrence and input closure | **CLOSED** |
| M2A-TR03 — named-volume, container, and process settlement | **BLOCKED** by M2A-TRR01 and M2A-TRR02 |
| M2A-TR04 — completion publication and official-tool transfer | **BLOCKED** by M2A-TRR02 and M2A-TRR03 |
| M2A-TR05 — validity, sanitization, and evidence non-promotion | **BLOCKED** by M2A-TRR01 and M2A-TRR03 |
| M2A-TR06 — implementation and negative-test allowlist | **BLOCKED** by all three residuals |

## Finding-by-finding re-review

### M2A-TRI01 — still open on M2A-TRR01

The internally created command plan is complete and exact, but
`validateFixedDockerPlan()` validates only the outer object as a plain record
and then compares nested input through `JSON.stringify()`. A repository-owned
in-memory negative reproduced acceptance when `environment` had the exact
three own keys while inheriting `DOCKER_HOST=unix:///inherited-forbidden` from
its prototype. Inherited properties are omitted by JSON serialization, so the
validator returned the expected plan instead of rejecting the forbidden
inherited Docker environment.

**M2A-TRR01:** snapshot and validate the nested plan as exact own plain data,
including own-key/prototype checks for the environment, argv arrays, layout
records, and directory rows. Reject inherited Docker variables, accessors,
non-plain nested values, holes, and extra data before comparison. The current
own-property mutations do not cover this boundary.

### M2A-TRI02 — still open on M2A-TRR02

The initializer and publisher no longer discard close failures. Every handle
that enters their local `closeHandles()` registry is closed at most once, and
a failure after visible rename propagates to process exit `70`; the fake host
chain correctly refuses to treat that nonzero terminal as success.

The completion nevertheless constructs
`runnerSettlement.descriptorsClosed: true` before calling
`publishCompletion()`. That later function opens the run-root and `.next`
descriptors, writes and renames the canonical completion, syncs the root, and
only then closes the root descriptor. The persisted boolean therefore still
claims publication-descriptor settlement before it is known. The current
static test checks only that the assignment follows the `captureOutput()`
source occurrence; it does not place the claim after publication settlement.

The runner also uses rejecting `Promise.all()` groups for the two private-input
writes and two output captures. If one owned branch rejects during its close,
the outer await may continue toward completion while the sibling branch is
still executing and owns a descriptor. Local `finally` blocks eventually
attempt each close, but the runner does not await the full settlement set before
constructing or publishing the completion record.

**M2A-TRR02:** use an explicit all-settled ownership barrier for every
successfully opened runner handle, including parallel branches, and replace the
pre-publication descriptor claim with a contract-consistent representation
that cannot assert publication settlement before the final owned close. Keep a
late visible-commit failure nonzero and host-Inconclusive, with no repair or
retry.

### M2A-TRI03 — closed

Both the runner and `validateCompletionBytes()` require every complete npm
step to have exit `0`, null signal, no timeout, and no stdout/stderr truncation;
the runner additionally requires its child `close`. Table-driven tests cover
null/nonzero exit, signal, timeout, and both truncation flags at install,
approve-scripts, and rebuild. The same terminal scalars remain representable
only in bounded Inconclusive completion rows. Exact absent/present approval and
lock correlations are unchanged. No M2A-TRI03 residual was reproduced.

### M2A-TRI04 — still open on M2A-TRR03

The fake state machine and canonical attempt validator now reject arbitrary or
path-like issue codes, code/step mismatch, more than one issue, invalid
initializer/measurement prerequisites, early transfer after unknown
settlement, and retry/cleanup keys. They preserve one chronological issue and
natural-exit-only copying.

The candidate validators do not cross-bind the canonical attempt transfer
states to the validated completion output inventory. A repository-owned
in-memory negative independently validated both of these contradictory records:

- a complete completion whose inventory lists only the producer segment; and
- a no-issue attempt that claims `markerTransfer: "valid"`.

This admits an extra marker copy that the completion did not authorize. The
inverse missing-copy contradiction is likewise not decided by a combined
candidate validator. `validateCompletionArtifacts()` binds completion to
segment/marker bytes, while `validateAttemptBytes()` separately binds attempt
states; no boundary consumes both accepted projections.

**M2A-TRR03:** add one pure candidate cross-validator that binds attempt
completion/segment/marker states and issue to the already validated completion
inventory and artifact set. Reject extra, missing, early, reordered, invalid,
or unknown transfer states that contradict the completion-listed outputs.

## Negative matrix and allowlist decision

The focused suite behaviorally covers fixed argv and own environment
substitution, inspection policy, transferred-file metadata, canonical
completion/event/marker bytes, complete npm terminals, fake settlement and
first issue, retry rejection, and several attempt prerequisites. Static checks
also preserve container-source import avoidance, verification-only root
reachability, and the absence of a production backend.

It does not cover inherited nested plan data, full parallel descriptor
settlement before completion construction, truthful publication-descriptor
state in the persisted completion, or cross-record completion/attempt output
binding. The complete M2A-TR06 negative matrix is therefore not closed.

The repository already contained extensive unrelated M3, M4, presentation,
and issue #43 working-tree changes when this review started. They were
preserved. Because the implementation is an uncommitted aggregate rather than
a session-local checkpoint, this review cannot attribute every pre-existing
path to the remediation session; it inspected only the fixed M2-A inputs and
allowlisted transfer paths needed for this decision. No implementation or test
path was edited by this review.

## Verification observed

| Command | Observed result |
| --- | --- |
| `git status --short --branch` | Existing multi-session dirty worktree preserved; no cleanup/reset. |
| Repository-owned read-only identity/negative script | 31 inputs; aggregate and five anchors matched. Inherited `DOCKER_HOST` and the completion/attempt marker contradiction were both accepted. |
| `npm run m2a:transfer:verify` | Exit `0`; static verifier passed; 1 file / 22 tests passed. |
| `npm run m2a:verify` | Exit `0`; typecheck/build/static passed; 4 files / 5 tests passed. |
| `npm run typecheck` | Exit `0`; root no-emit typecheck passed. |
| `npm test` | Exit `0`; 109 files / 825 tests passed. |
| `npm run check` | Exit `1`; it stopped after the pre-existing `containers/profile-control/test/control-host-backend.test.ts` formatting warning, before lint/typecheck/test. |
| Focused Prettier check over the six review/status files | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`. |

Passing positive checks do not close the three independently reproduced
negative paths or establish runtime isolation, named-volume behavior, npm
lifecycle behavior, Docker-copy behavior, transfer validity, or evidence
acceptance.

No image/context build, Docker/container/runtime-socket command, npm install,
pack, approve, rebuild, lifecycle entry, probe, transfer, result-root or
retained-state access, cleanup, retry, external network, Remote Git,
publication, evidence promotion, or standing authorization was used.

Next: save an exact bounded Docker-free M2A-TRR01 through M2A-TRR03 residual-
remediation prompt and fresh independent re-review prompt, then remediate only
strict nested-plan ownership, complete descriptor/publication settlement, and
completion-to-attempt transfer cross-binding under the unchanged M2A-TR06
runtime prohibition; do not construct an image or execute transfer/runtime
commands.
