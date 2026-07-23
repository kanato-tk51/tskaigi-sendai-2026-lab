# M3 first production raw-to-derived collector contract review

## Review target

- Target: frozen-research issue #47's first production codegen `observe`
  raw-to-derived collector contract
- Review type: fresh independent Docker-free read-only contract review
- Reviewer implementation changes: none
- Review-owned changes: this record and minimal contract/status metadata only
- Runtime and evidence boundary: no adapter run, production collector, Docker,
  retained state, historical result root, or `Observed` value was accessed or
  changed

## Gate decision

- Decision: **`BLOCKED`**
- Closed at contract scope: M3-PC01 and M3-PC06
- Open: M3-PC02, M3-PC03, M3-PC04, and M3-PC05
- Blocking finding: the post-publication validation branch has no durable
  non-evidence terminal, and the content identity checkpoints do not explicitly
  require same-descriptor digest revalidation
- Implementation approval: none

The adapter/schema projection, evidence non-promotion policy, and exact later
path allowlist are bounded correctly. The filesystem publication contract is
not yet implementable as written. It requires `derived.staging/` to be renamed
to visible `derived/` before another raw/derived revalidation and descriptor
settlement, while also requiring every filesystem rejection to leave no
published `derived/`. A failure in that interval cannot satisfy both rules.

## Finding decisions

| ID | Decision | Review result |
|---|---|---|
| M3-PC01 | **Closed** | The additive v3 boundary is limited to the two codegen `observe` scenarios, preserves every v2 synthetic schema, binds one producer and the fixed manifest/event identities, and uses identity-bearing Expected rows without borrowing P2 receipt conclusions. |
| M3-PC02 | **Open** | The object/owner/mode/link/no-follow/BigInt/path rules are bounded, but the contract records SHA-256 only “before use” and later says to repeat “identity checks.” It does not explicitly require re-reading and re-hashing the held descriptor at each precommit checkpoint needed to reject same-size in-place content changes. |
| M3-PC03 | **Open** | `derived/` becomes visible at rename step 5 before the fallible post-publication checks and descriptor settlement in steps 6–7. A later failure is called Inconclusive but has no exact durable terminal inventory or consumer rule. |
| M3-PC04 | **Open** | The negative suite must prove no published derived inventory for every filesystem rejection, including post-use/post-publication mutation. That is impossible after the required rename, and deleting or rewriting the visible directory is also forbidden. |
| M3-PC05 | **Open** | The policy text correctly forbids automatic promotion, but a visible five-file `derived/` rendered as complete can survive a post-publication failure. The contract does not give consumers a durable way to distinguish that uncertain directory from settled derived evidence. |
| M3-PC06 | **Closed** | The 11 production paths and 11 scenario/verification paths are sufficient and no broader than the first Docker-free implementation. The excluded CLI, runner/fixture source, package surface, adapter/probe/container/runtime/result/evidence paths prevent activation or ingestion. The allowlist is not activated while the gate is blocked. |

## Independently reproduced adapter and schema boundary

The current tracked `packages/lab-cli` and `packages/codegen-probe` trees have
no working-tree diff. Source inspection and a bounded no-write in-memory
assertion reproduced the existing v2 schemas, the current codegen manifest,
and current reducer semantics.

The codegen `observe` manifest is exactly one `probe-manifest/v2` producer:

- route `codegen-cli`, adapter/tool version `0.0.0`, tool `codegen`, producer
  `codegen-cli-producer`, worker `null`, cwd ID `codegen-adapter-workspace`, and
  event sink `codegen-event-segment`;
- five route invocations in order: `codegen-cli-startup`,
  `codegen-argument-parse`, `codegen-generation-start`, `codegen-file-write`,
  and `codegen-completion`;
- six generation-start attempts in order: environment, canary file read,
  before-only source hash, direct write, loopback, and fixed child;
- one enabled `emitted-asset` definition,
  `codegen-generation-api-change`, targeting
  `codegen-generated-artifact`; and
- target ceilings of 4,096 bytes for file read/hash/write, 2,000 ms for
  loopback and child, and 1,024 bytes for child output.

The fixed producer event order is the three opening routes, six attempts, the
tool event, then file-write and completion routes: 12 events total with counts
`5 / 6 / 1`. Both profiles retain all five route successes with null errors and
the same skipped `emitted-asset / NOT_APPLICABLE` tool event.

| Attempt | Permissive Expected | Constrained Expected |
|---|---|---|
| `codegen-attempt-environment` | `success / null` | `failure / ENVIRONMENT_VARIABLE_ABSENT` |
| `codegen-attempt-file-read` | `success / null` | `failure / FILE_NOT_FOUND` or `READ_DENIED` |
| `codegen-attempt-file-hash` | `success / null` | `success / null` |
| `codegen-attempt-file-write` | `success / null` | `failure / WRITE_DENIED` |
| `codegen-attempt-loopback` | `success / null` | `failure / NETWORK_FAILURE` or `NETWORK_TIMEOUT` |
| `codegen-attempt-child` | `success / null` | `failure / CHILD_PROCESS_FAILURE` |

The in-memory reducer assertion reproduced two distinct unavailable records:

- `file-hash / codegen-input-snapshot / source` retains the accepted before
  hash, has no after hash, and remains `unavailable`; and
- `tool-api-change / codegen-generated-artifact / artifact` has neither hash
  because the operation is skipped and remains `unavailable`.

No after hash or unchanged-source conclusion was inferred from the selected
profile receipt review. The historical P2 roots were not opened.

## Raw identity and transaction review

The proposed raw-only inventory, private `0700` directories, private `0600`
regular files, current owner/group relation, single links, distinct BigInt
device/inode identities, no-follow held descriptors, fixed logical run ID, and
raw non-mutation rule are suitable contract direction. Private filesystem
identity remains absent from serialized output, and rejected inputs do not
publish their digests.

The unresolved transaction is:

| State | Contracted action | Durable interpretation |
|---|---|---|
| raw-only | Validate/copy/render without output | No derived evidence |
| staged | Exclusively write, sync, read back, and validate `derived.staging/` | Retained diagnostic state only; not evidence |
| renamed | Rename staging to visible `derived/` | Looks like the exact two- or five-file published inventory |
| post-publication check | Revalidate raw paths/descriptors and published files | Can still fail after visibility |
| descriptor settlement | Close all descriptors | Can still fail after visibility |

For a complete candidate, the visible five files already encode `complete`
before the last two states settle. The contract says such a later failure is
Inconclusive, but it supplies no separate commit record, accepted-result
object identity, or non-evidence name and forbids repair, cleanup, and retry.
This is not merely a crash-atomicity limitation; it is a deterministic branch
in the specified state machine.

## Rejection, sanitization, and evidence separation

Outside the terminal-state gap, the rejection mapping is complete:

- structured Proxy/accessor/prototype/symbol/hidden/cyclic and shared-byte
  inputs fail closed;
- canonical JSON/JSONL, UTF-8, LF, size/count, sequence, manifest/context,
  completion, timeout, and outcome/error failures preserve the whole raw
  bundle and do not salvage a prefix;
- safely captured content rejection yields only sanitized null/unavailable
  metadata and summary;
- pre-publication filesystem rejection yields no `derived/`; and
- raw canary/environment values, content, host paths, commands, container
  identities, output streams, private filesystem identities, rejected-input
  digests, and unsanitized errors cannot enter derived bytes.

The contract also correctly keeps `adapter-run`, completeness, Expected match,
and deterministic regeneration separate from matrix, selected-profile,
presentation, M4, and general sandbox `Observed`. That policy cannot close
M3-PC05 until filesystem visibility has one unambiguous settled terminal.

## Required contract-only remediation

Perform one bounded Docker-free contract remediation before implementation:

1. Require full same-descriptor byte-count and SHA-256 revalidation of every
   raw input at each named content checkpoint, with the original held object
   identity and logical path checked separately.
2. Make all raw checks, derived read-back checks, and descriptor close results
   settle while the output still has only the non-evidence
   `derived.staging/` name.
3. Define the final atomic rename to previously absent `derived/` as the sole
   publication commit. Preconstruct the success result before the rename and
   permit no fallible validation, close, serialization, cleanup, or evidence
   classification step after it.
4. State that every failure before that commit retains at most exact staging,
   never publishes `derived/`, and returns only the already specified
   sanitized internal classification. A successful rename creates exactly the
   decided two- or five-file inventory and is the only state consumers may
   treat as derived evidence.
5. Update the negative matrix to cover same-size in-place mutation at every
   digest checkpoint, descriptor/path drift before commit, close failure before
   commit, rename failure, and the absence of any post-commit failure branch.

The remediation may change only
`docs/m3-production-raw-to-derived-collector.md`, new
`prompts/m3-production-raw-to-derived-collector-contract-remediation.md`, new
`prompts/reviews/m3-production-raw-to-derived-collector-contract-remediation-review.md`,
`docs/index.md`, `docs/milestones.md`, and
`docs/frozen-research-execution-plan.md`. It must not change source, tests,
scenarios, static verification, package surface, raw/results/evidence,
Expected/Observed, or runtime state.

## Verification

- Read the complete applicable instruction/document boundary and the current
  M3/codegen source, static verifier, and focused tests.
- Inspected the full working-tree name/size summary and confirmed the current
  M3/codegen source trees have no tracked diff.
- Ran one bounded no-write in-memory manifest/reducer assertion; it reproduced
  the exact 5/6/1 definitions, target ceilings, and both unavailable hash
  records.
- Ran a focused formatter check over this review and the four status files.
- Ran `git diff --check`.

M3 tests, typecheck, build, filesystem-writing fixtures, adapters, probes,
Docker, production collection, and broad verification were intentionally not
run because this is a contract-only read-only review and those commands cannot
resolve the contract contradiction.

## Remaining limitations

- This review is contract/static evidence, not proof that the future
  filesystem implementation works.
- The cooperative same-UID filesystem and non-authenticating SHA-256
  limitations remain explicit.
- No runtime identity, adapter raw bundle, result review, or evidence promotion
  is approved.

## Safety statement

This review used no external network, credentials, environment enumeration,
home-directory access, Docker/runtime socket, retained state, historical
result-root access, remote Git, publication, cleanup, or standing
authorization. Existing M4, presentation, and user changes were preserved.

Next: perform the bounded contract-only M3-PC02 through M3-PC05 remediation
above and save its fresh independent Docker-free re-review prompt; do not start
implementation or issue #43.
