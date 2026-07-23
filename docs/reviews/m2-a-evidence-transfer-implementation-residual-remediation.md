# M0/M2-A issue #43 evidence-transfer residual-remediation re-review

## Review target and decision

- Target: the uncommitted bounded M2A-TRR01 through M2A-TRR03 residual
  remediation
- Review type: fresh independent Docker-free read-only implementation
  re-review
- Review prompt:
  [m2-a-evidence-transfer-implementation-residual-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-implementation-residual-remediation-review.md)
- Decision: **BLOCKED; no construction/execution-gate task is approved**
- Finding status: M2A-TRR01 and M2A-TRR02 close; M2A-TRR03 remains open on the
  exact failure-candidate correlation below
- Implementation or test repair performed in this review: none

M2A-TR01 and M2A-TR02 remain closed. M2A-TR03 through M2A-TR06 remain open
because the combined validator can accept a fabricated rebuild-failure
candidate without a failed rebuild or truthful runner settlement. This review
does not approve image/context construction, an image candidate, Docker,
transfer, result access, evidence acceptance, or standing-authorization use.

## Independently reproduced identities and preserved boundaries

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

The fixed generation, expected revision, scenario, run/result/root identities,
container names, volume, candidate tag, Node/npm versions, port, 1/6/0 event
contract, one producer, `workerId: null`, private inputs, historical non-reuse,
and evidence non-promotion remain unchanged. The root exposes only the three
Docker-free transfer verification scripts. The transfer library remains pure
and exposes no production backend or execution entry.

## M2A-TR decisions

| Item | Implementation-scope decision |
| --- | --- |
| M2A-TR01 — fresh identity and immutable historical boundary | **CLOSED** |
| M2A-TR02 — exact M0-to-M2-A occurrence and input closure | **CLOSED** |
| M2A-TR03 — named-volume, container, and process settlement | **BLOCKED** by the remaining M2A-TRR03 correlation gap |
| M2A-TR04 — completion publication and official-tool transfer | **BLOCKED** by the remaining M2A-TRR03 correlation gap |
| M2A-TR05 — validity, sanitization, and evidence non-promotion | **BLOCKED** by the remaining M2A-TRR03 correlation gap |
| M2A-TR06 — implementation and negative-test allowlist | **BLOCKED** by the remaining M2A-TRR03 correlation gap |

## Finding-by-finding re-review

### M2A-TRR01 — closed

The independent in-memory matrix rejected 15 nested-plan substitutions:
inherited Docker and non-Docker properties, null/custom prototypes, a custom
array prototype, nested record/argv/directory accessors, a symbol key, a sparse
argv, an extra array key, reordered own keys, and environment/argv/layout/
directory value substitutions. No installed getter ran.

`compareExactOwnData()` snapshots prototype, `Reflect.ownKeys()`, and own
property descriptors before recursively comparing descriptor values. Records
require the ordinary object prototype and exact ordered string keys. Arrays
require `Array.prototype`, the dense index sequence followed by `length`, and
no extra or symbol keys. The returned value is a separately constructed,
deeply frozen fixed plan rather than the caller's object. M2A-TRR01 closes.

### M2A-TRR02 — closed

Source inspection did not import or execute either container source. It traced
all three pre-publication open-helper families to immediate tracker ownership
and one awaited close. The two private-input and two output-capture branches
both pass through `Promise.allSettled()` before rejection propagation. The
tracker's `allClosed()` check occurs after the last output-capture branch and
before completion construction.

The persisted key is exactly `prePublicationDescriptorsClosed`; the broader
`descriptorsClosed` key is absent. Publication opens its own `.next` and
run-root descriptors only after serialization, closes `.next` before the sole
rename, syncs the root, and awaits final root close before returning. A close
failure after visible rename propagates to process exit `70`; the fake host
correlation keeps the resulting completion/exit mismatch Inconclusive. Natural
process exit and later host correlation, not the persisted pre-publication
field, remain the proof boundary for publication handles. M2A-TRR02 closes.

### M2A-TRR03 — still open

The combined validator correctly re-runs canonical attempt, completion, and
artifact validation. The independent matrix accepted marker-present and
marker-absent complete candidates plus a nominal rebuild-failure candidate with
rebuild exit `1`. It rejected both directions of the prior marker contradiction,
missing segment/marker artifacts, invalid and unknown completion/segment/marker
states, and reordered inventory.

A new controlled contradiction nevertheless returned a valid combined
candidate:

- the completion had canonical `status: "inconclusive"` and
  `issue: "M2A_REBUILD_FAILED"`;
- install, approve-scripts, and rebuild all had exact successful terminal
  scalars, including rebuild exit `0`;
- `npmChildClosed`, `loopbackClosed`, and
  `prePublicationDescriptorsClosed` were all `false`;
- the completion listed no outputs, and the attempt used valid completion plus
  `not-attempted` segment/marker states; and
- the attempt carried the matching `M2A_REBUILD_FAILED` issue at
  `validate-completion`.

`validateCompletionBytes()` intentionally permits unsuccessful scalars in
bounded Inconclusive records, but `validateCandidateTransfer()` checks only the
completion status/issue spelling and matching attempt issue. It does not prove
that this sole failure candidate has truthful runner settlement, successful
install/approval prerequisites, and a real settled rebuild failure. The
current positive test changes rebuild exit to `1`, but there is no inverse
negative for a fabricated rebuild issue with successful npm flow or unsettled
runner booleans.

This violates the contract's failure-candidate requirement: valid complete
transport plus a real operation failure. M2A-TRR03 therefore remains open.

## Exact smallest remediation

One further bounded Docker-free remediation may change only the transfer
library/declaration, focused transfer test, static verifier if needed, saved
follow-up prompt pair, and the minimal five status records. It must make
`validateCandidateTransfer()` accept `M2A_REBUILD_FAILED` only when:

1. every runner-settlement boolean is true;
2. install and approve-scripts retain their exact successful terminal,
   approval, and lock prerequisites;
3. rebuild records a settled real command failure rather than exit `0`,
   timeout, signal, truncation, or unknown settlement; and
4. the exact producer segment is listed, present, and valid, with conditional
   marker consistency; and
5. the existing canonical attempt issue, output inventory, artifact, and exact
   transfer-state cross-bindings all remain satisfied.

Add the inverse negatives for successful rebuild plus claimed failure,
unsettled runner booleans, unsuccessful install/approval prerequisites, and
timeout/signal/truncation masquerading as the transferable failure candidate.
Do not broaden any production path, add a backend or entry, construct an image,
or execute transfer/runtime work.

## Allowlist and working-tree attribution

The saved residual prompt limits source changes to the runner, transfer
library/declaration, static verifier, focused transfer test, its prompt pair,
and five status records. Current source reproduces the requested runner and
library changes while the initializer, manifest, Containerfile, package
verification surface, adapter/probe inputs, fixtures, scenarios, and results
retain the previously reviewed contract boundary.

The repository remains one uncommitted multi-session aggregate. Git cannot
attribute earlier untracked issue #43 files to a particular worker, so this
review does not claim session-local provenance from `git diff`. It instead
reproduced the fixed aggregate, anchors, public reachability, current source
boundary, and repository-recorded prompt/status sequence. Unrelated M3, M4,
presentation, and user changes were preserved.

## Verification observed

| Command | Observed result |
| --- | --- |
| `git status --short --branch` and scoped inventories | Existing multi-session dirty worktree preserved; no cleanup/reset. |
| Repository-controlled read-only identity/negative/source-order script | 31 inputs and five anchors matched; 15 recursive-plan negatives rejected with zero getter calls; descriptor ordering matched; 11 candidate contradictions rejected; the fabricated rebuild-failure candidate was accepted. |
| `npm run m2a:transfer:verify` | Exit `0`; static verifier passed; 1 file / 25 tests passed. |
| `npm run m2a:verify` | Exit `0`; typecheck/build/static passed; 4 files / 5 tests passed. |
| `npm run typecheck` | Exit `0`; root no-emit typecheck passed. |
| `npm test` | Exit `0`; 109 files / 828 tests passed. |
| `npm run check` | Exit `1`; it stopped at the pre-existing out-of-scope `containers/profile-control/test/control-host-backend.test.ts` formatting warning before lint/typecheck/test. |
| `npm run lint` | Exit `1`; 11 pre-existing out-of-scope errors in `containers/profile-control/scripts/verify-static.mjs`. |
| Focused Prettier check over this review and the five status records | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`. |

Passing positive checks do not close the independently reproduced candidate
correlation gap or establish runtime isolation, named-volume behavior, npm
lifecycle behavior, Docker-copy behavior, transfer validity, or evidence
acceptance.

No image/context build, Docker/container/runtime-socket command, npm install,
pack, approve, rebuild, lifecycle entry, probe, transfer, result-root or
retained-state access, cleanup, retry, external network, Remote Git,
publication, evidence promotion, or standing authorization was used.

Next: save an exact bounded Docker-free M2A-TRR03 failure-candidate correlation
remediation prompt and fresh independent re-review prompt before source/test
changes; do not construct an image or execute transfer/runtime commands.
