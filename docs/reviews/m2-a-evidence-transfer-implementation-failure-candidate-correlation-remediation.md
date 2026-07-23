# M0/M2-A issue #43 failure-candidate correlation remediation re-review

## Review target and decision

- Target: the uncommitted bounded M2A-TRR03 failure-candidate correlation
  remediation
- Review type: fresh independent Docker-free read-only implementation
  re-review
- Review prompt:
  [m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation-review.md)
- Decision: **APPROVED at the Docker-free static/unit implementation boundary**
- Finding status: M2A-TRR03 closes; M2A-TRR01/M2A-TRR02 remain closed
- Implementation or test repair performed in this review: none

M2A-TR01 through M2A-TR06 are closed only at the reviewed Docker-free
static/unit implementation boundary. This decision permits at most one later,
separately defined Docker-free construction/execution-gate contract that must
bind the complete constructed context and exact local `sha256:` image ID before
any candidate command can be reviewed. It does not approve construction,
Docker, standing-authorization use, transfer, result access or acceptance,
evidence promotion, M3 ingestion, profile/matrix/presentation evidence, or an
`Observed` value.

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
and evidence non-promotion remain unchanged. The root still exposes only the
three Docker-free transfer verification scripts. Read-only source inspection
found no child-process import, process input, production backend, or execution
entry in the pure transfer library. Neither container source was imported or
executed.

## M2A-TR decisions

| Item | Implementation-scope decision |
| --- | --- |
| M2A-TR01 — fresh identity and immutable historical boundary | **CLOSED** |
| M2A-TR02 — exact M0-to-M2-A occurrence and input closure | **CLOSED** |
| M2A-TR03 — named-volume, container, and process settlement | **CLOSED at static/unit scope** |
| M2A-TR04 — completion publication and official-tool transfer | **CLOSED at static/unit scope** |
| M2A-TR05 — validity, sanitization, and evidence non-promotion | **CLOSED at static/unit scope** |
| M2A-TR06 — implementation and negative-test allowlist | **CLOSED at static/unit scope** |

## M2A-TRR03 finding decision

### Canonical revalidation and positive candidates

`validateCandidateTransfer()` independently invokes the canonical attempt,
completion, producer-segment, and conditional-marker validators. A controlled
in-memory matrix reproduced both marker-present and marker-absent complete
candidates and both corresponding `M2A_REBUILD_FAILED` candidates. The failure
candidates retained natural initializer/measurement settlement, valid
completion transfer, exactly one `M2A_REBUILD_FAILED` issue at
`validate-completion`, all three true runner-settlement booleans, successful
install and approve-scripts terminals, the absent/present approval transition,
one continuous lock chain, an integer nonzero rebuild exit with null signal and
no timeout or truncation, an exact valid listed segment, and marker presence
derived from the validated file-write event.

Complete candidates remain `complete/null` with no attempt issue. The
marker-present and marker-absent observations retain their original producer
events and capability outcomes; an Expected capability mismatch is not
reclassified as transport failure.

### Inverse rejection matrix

The same independent matrix reproduced 36 rejected candidate families:

- each false `npmChildClosed`, `loopbackClosed`, and
  `prePublicationDescriptorsClosed` value;
- null or nonzero install/approve exit, signal, timeout, stdout truncation, and
  stderr truncation at both prerequisite steps;
- wrong install, approve-scripts, or rebuild approval projections and a
  non-absent install lock prerequisite;
- rebuild null/zero exit, signal, timeout, stdout truncation, and stderr
  truncation;
- absent, not-attempted, invalid, or unknown segment transport and invalid
  segment bytes;
- listed-marker/not-attempted-transfer and unlisted-marker/valid-transfer
  contradictions;
- incoherent initializer, measurement, or natural-exit attempt settlement; and
- an individually canonical but non-transferable Inconclusive completion with
  another allowlisted issue.

The earlier focused suite additionally retains missing artifact, canonical
byte, inventory-order, transfer-state, issue, and reordered-key contradictions.
An individually valid bounded Inconclusive completion is therefore not
automatically a transferable candidate, and no input is repaired or
reinterpreted. M2A-TRR03 closes.

## Preserved M2A-TRR01/M2A-TRR02 evidence

A separate read-only preservation matrix accepted the exact fixed plan and
rejected 15 inherited/prototype/accessor/symbol/sparse/extra/reordered/value
substitutions with zero getter invocation. Source-order inspection found the
two expected all-settled ownership groups, placed
`prePublicationDescriptorsClosed` after the last output capture, retained no
broader `descriptorsClosed` claim, and kept publication before the terminal
return without ignored close handling. Publication handles remain correlated
through natural process exit rather than the pre-publication field.

The repository is an uncommitted multi-session aggregate, so Git cannot
attribute every earlier untracked issue #43 path to one worker. This review
does not claim session-local provenance from `git diff`. It instead reproduced
the fixed aggregate, anchors, current pure-library/reachability boundary,
repository-recorded prompt/status sequence, focused negative matrices, and
unchanged initializer/runner structural boundary. Unrelated M3, M4,
presentation, and user changes were preserved.

## Verification observed

| Command | Observed result |
| --- | --- |
| `git status --short --branch` and scoped source inspection | Existing multi-session dirty worktree preserved; no cleanup or reset. The transfer library has no forbidden process reachability, and only verification scripts are exposed. |
| Repository-controlled 31-file identity calculation | 31 inputs; aggregate and five anchors matched. An initial reviewer-only query mistakenly filtered out the tracked JavaScript source and reported 30/mismatch; the corrected contract-defined all-file inventory produced the exact result above. |
| Repository-controlled plan/descriptor preservation matrix | Exact plan accepted; 15 substitutions rejected; zero getter calls; two all-settled ownership groups and the reviewed publication ordering reproduced without importing container sources. |
| Repository-controlled combined-candidate matrix | 4 positives and 36 inverse negatives reproduced; no container source imported and no input repair observed. |
| `npm run m2a:transfer:verify` | Exit `0`; static verifier passed; 1 file / 26 tests passed. |
| `npm run m2a:verify` | Exit `0`; typecheck/build/static passed; 4 files / 5 tests passed. |
| `npm run typecheck` | Exit `0`; root no-emit typecheck passed. |
| `npm test` | Exit `0`; 109 files / 829 tests passed. |
| `npm run check` | Exit `1`; it stopped at the pre-existing out-of-scope `containers/profile-control/test/control-host-backend.test.ts` formatting warning before lint/typecheck/test. |
| Focused Prettier check over the remediation source/test/prompt pair, this review, and five status records | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`. |

Passing static/unit checks do not establish runtime isolation, named-volume
visibility, npm lifecycle behavior, Docker-copy validity, transfer acceptance,
or evidence authenticity.

No image/context build, Docker/container/runtime-socket command, npm install,
pack, approve, rebuild, lifecycle entry, probe, transfer, result-root or
retained-state access, cleanup, retry, external network, Remote Git,
publication, evidence promotion, or standing authorization was used.

Next: define the exact Docker-free issue #43 construction/execution-gate
contract and save its fresh independent review prompt, binding the complete
constructed context and exact local `sha256:` image ID without constructing an
image or executing transfer/runtime commands.
