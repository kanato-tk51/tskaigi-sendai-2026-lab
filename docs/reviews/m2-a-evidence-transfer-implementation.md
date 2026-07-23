# M0/M2-A issue #43 evidence-transfer implementation review

## Review target and decision

- Target: the uncommitted `20260721-01` M0/M2-A evidence-transfer
  static/unit implementation
- Review type: fresh independent Docker-free read-only implementation review
- Review prompt:
  [m2-a-evidence-transfer-implementation-review](../../prompts/reviews/m2-a-evidence-transfer-implementation-review.md)
- Decision: **BLOCKED; no construction/execution-gate task is approved**
- Blocking findings: M2A-TRI01 through M2A-TRI04 below
- Non-blocking findings: none
- Implementation repair or runtime execution performed in this review: none

M2A-TR01 and M2A-TR02 close at implementation scope. M2A-TR03 through
M2A-TR06 remain open on one bounded Docker-free remediation. This review does
not approve image/context construction, an image candidate, Docker, transfer,
result access, evidence acceptance, or standing-authorization use.

## Independently reproduced identities and boundaries

The review reproduced the exact current ordered 31-file M2-A/probe input set
and aggregate:

```text
sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04
```

The five anchor hashes matched the contract:

| Input | SHA-256 |
| --- | --- |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `packages/probe-core/package.json` | `0d71338f1e232269fdfce8f097851b9404b9532c5089df4dffbb3f5aa788b520` |
| `packages/npm-lifecycle-probe/package.json` | `834278a7654bda1acb7ac9f4337b088173d816c86307f312c55d96447a91c59b` |
| consumer fixture manifest | `ab3c01396a1eac8a8a149f15c2ed09d5bb78aec203a7d5a958845d8bb7ceaefb` |
| dependency fixture manifest | `a411bf6c3cdf02f8b02247095740a62181a384a2dfccb04a5643f63d70f20fd1` |

The manifest, library, runner, and documentation retain the fixed generation,
expected revision, scenario, run ID, result root, container run root, two
container names, named volume, candidate tag, Node/npm versions, and port. The
existing M2-A event contract remains one successful automatic route followed
by six ordered capability attempts, one producer, `workerId: null`, and no
tool API events. No M0 marker, stdout-bundle, result, or `Observed` bytes were
changed or reused.

Source inspection, without importing either container source, confirmed the
fixed unapproved install, official approval, absence assertion, private canary
and snapshot creation, loopback start, approved rebuild, child/loopback close,
output capture, and completion-publication order. The root package exposes only
the three Docker-free transfer verification scripts; the transfer library has
no child-process or production backend import.

## M2A-TR decisions

| Item | Implementation-scope decision |
| --- | --- |
| M2A-TR01 — fixed fresh generation and immutable historical boundary | **CLOSED** |
| M2A-TR02 — exact M0-to-M2-A occurrence and input closure | **CLOSED** |
| M2A-TR03 — named-volume, container, and process settlement | **BLOCKED** by M2A-TRI01 and M2A-TRI02 |
| M2A-TR04 — completion publication and official-tool transfer | **BLOCKED** by M2A-TRI02 and M2A-TRI03 |
| M2A-TR05 — validity, sanitization, and evidence non-promotion | **BLOCKED** by M2A-TRI04 |
| M2A-TR06 — implementation and negative-test allowlist | **BLOCKED** by all four findings |

## Blocking findings

### M2A-TRI01 — the fixed host command/environment plan is incomplete

`createFixedDockerPlan()` returns only volume create, two container create, and
three copy argv arrays. It has no exact absence-preflight, inspect, start,
wait, or final-inspect argv for either container. Its environment projection is
only the names `DOCKER_CONFIG`, `HOME`, and `PATH`; it does not fix or validate
their values, empty-directory boundary, or inherited-Docker-variable rejection.
Consequently the implementation cannot yet trace every contract command or
prove that a later backend is bound to only the reviewed CLI environment and
lifecycle. The fake step names do not replace the missing immutable argv and
environment records.

### M2A-TRI02 — terminal descriptor settlement is asserted before it is known

The runner builds `runnerSettlement.descriptorsClosed: true` before
`publishCompletion()` opens its publication descriptors. After the canonical
rename and directory sync, `publishCompletion()` catches and discards a
failure from the retained run-root descriptor close. The initializer likewise
discards its final root-descriptor close failure. A completion may therefore
claim all runner-owned descriptors settled, or an initializer may exit zero,
when the final close is unknown. This conflicts with the contract's complete
descriptor-settlement and no-late-fallible-operation boundary.

### M2A-TRI03 — complete completion records admit unsuccessful child states

Both the runner and `validateCompletionBytes()` accept `status: "complete"`
when a fixed npm child has `timedOut: true`, a non-null signal, or a truncated
stdout/stderr stream, provided its recorded exit code is zero and the other
scalar checks match. A read-only negative assertion reproduced acceptance of a
completion containing timeout, truncation, and signal drift. Complete transport
must require the exact natural, untruncated, non-timeout child state; all other
states must remain sanitized Inconclusive without fabricating success.

### M2A-TRI04 — attempt validation admits incoherent and unsanitized evidence

`validateAttemptBytes()` validates settlement and transfer fields separately
but does not cross-check them. It accepts, for example, initializer
`not-started`, measurement `natural-exited`, `naturalExit: false`, every
transfer `valid`, and no coherent prerequisite chain. It also accepts arbitrary
issue-code strings, duplicate or reordered issue steps, and states that can
displace the chronological first failure. A read-only negative assertion
reproduced acceptance of that incoherent tuple with a path-like arbitrary
issue string. This violates the candidate-only canonical record, sanitization,
natural-exit-before-transfer, and first-failure rules.

The 16 focused tests and source-string verifier do not cover these cases or the
contract's complete identity/command/environment, initializer-extra-entry,
unknown-settlement family, early-transfer, copy-parent/descriptor identity,
special-bit/owner, retry/cleanup, and first-failure-displacement matrix.

## Approved bounded remediation

One Docker-free static/unit remediation may change only the existing M2A-TR06
implementation paths needed to:

1. complete and strictly validate every fixed absence/inspect/start/wait/final-
   inspect/create/copy command plus the exact credential-empty CLI environment;
2. make initializer and completion publication descriptor settlement
   fail-closed without a post-commit success claim based on an ignored close;
3. reject timeout, signal, and output-truncation drift for a complete npm flow;
4. make attempt records a closed sanitized state machine with chronological,
   allowlisted, write-once issues and natural-exit/transfer correlations; and
5. add table-driven behavioral/static negatives for the complete M2A-TR06
   matrix.

The remediation may update only the runner, transfer library/declarations,
static verifier, focused transfer test, saved remediation/re-review prompts,
this review/status documentation, and no broader implementation. It must not
add a production backend or entry, construct an image/context, bind an image
ID, run Docker or lifecycle code, access a result root/retained state, or
change historical, Expected, or `Observed` evidence.

## Verification observed

| Command | Observed result |
| --- | --- |
| `git status --short --branch` | Existing multi-session dirty worktree preserved; no cleanup/reset. |
| Read-only Node 31-file identity script | `31` rows; aggregate and all five anchors matched the contract. |
| Read-only Node plan/completion/attempt negative assertions | Plan keys omitted the fixed absence/inspect/start/wait lifecycle; invalid complete completion and incoherent/path-like attempt both reproduced as accepted. |
| `npm run m2a:transfer:verify` | Exit `0`; static verifier passed; 1 test file / 16 tests passed. |
| `npm run m2a:verify` | Exit `0`; typecheck/build/static passed; 4 test files / 5 tests passed, including import safety. |
| `npm run typecheck` | Exit `0`; root no-emit typecheck passed. |
| Focused `prettier --check` over the six review/status files | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`. |

These are static/unit observations only. Passing positive checks does not close
the reproduced negative-path findings or establish runtime isolation,
transport, npm lifecycle behavior, Docker behavior, or result validity.

No image/context build, Docker/container/runtime-socket command, npm install,
pack, approve, rebuild, lifecycle entry, probe, transfer, result-root or
retained-state access, cleanup, retry, external network, Remote Git,
publication, evidence promotion, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-TRI01 through M2A-TRI04
remediation and fresh re-review prompts, then remediate only those findings
under the unchanged M2A-TR06 boundary.
