# M4 distinct activation-object execution-gate contract review

## Review target and decision

- Target: the issue #45 M4 distinct activation-object execution-gate contract
- Review type: fresh independent Docker-free read-only contract review
- Decision: **BLOCKED; do not implement the wrapper or rebind the run IDs**
- M4-AG01 fresh immutable generation: **CLOSED at contract scope**
- M4-AG02 construction and inventory delta: **OPEN for the wrapper runtime
  dependency closure; constants and activation construction values reproduced**
- M4-AG03 complete held identity: **OPEN for repository dependencies reachable
  from the wrapper; the listed activation lease is otherwise coherent**
- M4-AG04 process and settlement: **OPEN for the synchronous no-child spawn
  branch and signal-failure classification**
- M4-AG05 output, side effects, and retention: **OPEN for monotonic wrapper
  failure precedence over a late valid child result**
- M4-AG06 implementation and evidence separation: **CLOSED at contract scope,
  but implementation may not begin while M4-AG02 through M4-AG05 are open**
- Blocking findings: three
- Non-blocking findings: none
- Wrapper, run-ID rebind, object import/execution, Docker, result roots,
  retained state, runtime evidence, and `Observed`: not implemented, executed,
  accessed, or changed

The fresh generation and proposed constants/compiler delta independently
reproduce. The existing activation bytes, canonical profiles, three
construction sets, fresh run/root/container derivation, bounded child shape,
unknown-settlement retention direction, backend side-effect ceiling, and
evidence separation are coherent.

The contract is not yet exact enough to approve implementation. It does not
close the wrapper's own repository runtime dependency graph, has no terminal
rule for a synchronous spawn failure that creates no child handle, and permits
a late canonical child result to satisfy the stated eligibility list even
after timeout, output, process, or signal failure has latched. One bounded
Docker-free contract-only remediation must close those branches before a fresh
re-review.

## Reviewed snapshot identity

The hashes below identify the review inputs before this review record,
remediation prompt, and minimal status updates were added. They are static byte
identities, not runtime filesystem identities.

| Target | SHA-256 |
|---|---|
| Execution-gate contract | `5c5f3896e7b8ee621f0fbeb5dda6c714d64127a1e71ffdf9fcfd41a5dd36dd7e` |
| This contract-review prompt | `48b601107fa0e3961304b8b600f048cf4da7afbecd526d550362ba8443d38ff1` |
| Distinct activation-object contract | `fe06f066952b233590c23d4b66d70d1053bb77250a42b71a721c0db783fc7610` |
| Distinct activation-object implementation review | `a65f69a4b935b3827c8c12432745c7a7597dc70f08467f55793245251d579640` |
| Exact filesystem-object identity contract | `72f00d5661ca419d585d616f230f093c5ca27a86711e7393c3e6eafbfc1a1abe` |
| Filesystem-identity implementation remediation re-review | `61cf631523a6711999623389a1e833abf17d2b0b564d75de31c6eb7ad0129ffa` |
| Current `src/constants.ts` | `8441aadf55bcd15b4a207283c9723ae703df4c8aa3234282a12c224c2dd1fb0f` |
| Root package manifest | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |
| Ordinary fail-closed source entry | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| Ordinary fail-closed compiled entry | `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4` |

The complete changed/untracked inventory and diff summary were inspected. The
existing issue #45 filesystem-identity and activation-object work was
preserved. The wrapper source/output and candidate package script remain
absent, and the current constants retain only the exhausted `20260720-01`
pair as required before any approved implementation.

## M4-AG01 — fresh immutable generation closed

The proposed values derive to two distinct fixed tuples:

| Profile | Run ID | Result root | Container |
|---|---|---|---|
| permissive | `m4-profile-control-p-20260720-02` | `results/runs/m4-profile-controls/m4-profile-control-p-20260720-02` | `tskaigi-m4-p-m4-profile-control-p-20260720-02` |
| constrained | `m4-profile-control-c-20260720-02` | `results/runs/m4-profile-controls/m4-profile-control-c-20260720-02` | `tskaigi-m4-c-m4-profile-control-c-20260720-02` |

Both differ from the exhausted `20260720-01` run IDs, roots, and container
names and from each other. The derivation matches `createFixedRuntimeLayout()`
and `createProfileDockerPlan()` without probing any path or Docker state.

Retaining `m4-profile-v1`, `m4-profile-control-image-v1`, the canonical profile
bytes, and recovered image digest
`sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`
is consistent with the existing fixture. Those values bind the already built
v1 control bytes; changing them would be a new image/Expected contract rather
than an issue #45 activation generation. The separate gate Expected revision
`m4-activation-expected-20260720-02` distinguishes this candidate without
rewriting profile or route Observed values.

No old or new result root and no Docker state was inspected. M4-AG01 is closed
at contract scope.

## M4-AG02 — constants exact; wrapper dependency closure open

Repository-pinned TypeScript `5.9.3` compiled the proposed two-literal
constants replacement entirely in memory with no diagnostics and no file
write. It reproduced:

| Object | Bytes | SHA-256 |
|---|---:|---|
| proposed `src/constants.ts` | 4,635 | `60d0512bd55c87b990f1476fa4634e54661feac81d2abf59dc7975058ac96f65` |
| proposed `dist/constants.js` | 4,298 | `2e6109fcf9f6cb779b7f402ff9e172f18ecfe95771033f21b490a538ddb465cb` |
| proposed `dist/constants.d.ts` | 4,628 | `d4fc330fee498a9b4c3f1c6d2e9be35ef793a3412d43d8059910bbd516319651` |
| ordered 22-source manifest | 2,582 | `d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158` |
| ordered 44-output manifest | 5,232 | `04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953` |
| concatenated manifest | 7,814 | `7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec` |

Only `dist/constants.js` and `dist/constants.d.ts` differ from the current 62
compiled files under that in-memory replacement. The activation source,
JavaScript, and declaration remain respectively 774 / 788 / 11 bytes with the
contracted hashes. The permissive and constrained profiles remain 1,402 and
1,411 bytes with hashes
`243915063e04f4009bf2132d74ae6172a763583560ce6534c3520bbda4ddde7c`
and
`a41bc401830f4079607fb3720b1dbdf636b283fadf0db4082d0113bf3238838e`.

Syntax analysis reproduced the exact 22-module TypeScript closure, 22
JavaScript/declaration construction sets, and 21-module executable JavaScript
closure. The current 31-source/62-output inventories become 32/64 by adding
only the three named wrapper objects.

Blocking finding M4-AGR01: inventory membership does not bind the wrapper's
own runtime import graph. The contract forbids only an import of the activation
entry and states no exact built-in or repository-local import set, no exact
transitive wrapper closure, and no rejection rule for a local dependency
outside the 22 held activation modules. A wrapper could therefore import an
unchanged but unleased repository module while still satisfying the named
32/64 parent inventories and implementation path allowlist. Its path-only
execution would then consume code not covered by the complete lease.

M4-AG02 remains open only for that wrapper construction/edge boundary. The
constants, activation construction, profiles, and inventory names are closed.

## M4-AG03 — listed identity chain coherent; reachable wrapper code open

The contract correctly requires no-follow held descriptors, one-link regular
files, private BigInt device/inode/owner/full-mode/link/time metadata,
pairwise non-aliasing, exact bytes/hashes, exact directory inventories, two
pre-spawn validations, and two validations after child `close`. It preserves
the activation-to-ordinary peer owner/full-mode relations, public
non-projection, fail-closed drift, handle ownership until settlement, and the
cooperative-host limitation. The child production path retains its separately
reviewed immutable profile/source and result-state identity controls.

M4-AGR01 also keeps M4-AG03 open: the lease cannot be called complete until
every repository module executable through the wrapper has exact membership,
bytes, identity, and edge binding. The remediation must either restrict every
repository-local wrapper dependency to a fixed subset of the already held
table or add an exact held closure; dynamic/computed/package loading and every
unlisted local edge must fail static/unit acceptance.

No separate weakness was found in the listed activation-object identity or
late-`close` lease ownership direction.

## M4-AG04 — unknown settlement safe; no-child branch open

The fixed argument-free package edge, single `process.execPath` child,
absolute activation argv, repository cwd, empty child environment, detached
group, piped output, 90-second timeout, 65,536-byte combined bound, TERM/KILL
sequence, no-second-spawn rule, and late-`close` terminal ownership are
internally consistent. If a created child never emits `close`, retaining the
child handle and entire identity lease without output, cleanup, normal exit,
or retry is fail closed.

Blocking finding M4-AGR02: the contract does not define a synchronous spawn
failure that returns no child handle. Its unknown-settlement rule requires a
created handle and eventual `close`, while its canonical failure table covers
only a closed child. The step prefix also has no representation for a spawn
attempt that never reaches `child-spawned`. Focused tests name
`process-error`, but the contract does not distinguish synchronous no-child
failure from an asynchronous child `error` followed by `close`, or state the
exact post-preflight validations, output/no-output rule, exit code, and lease
release for the no-child case.

The same remediation must bind signal-delivery failure to an exact monotonic
failure code and settlement rule. If no `close` follows, the existing retained
unknown-settlement branch remains mandatory; if `close` follows, signal
failure must not disappear behind the child's later output.

M4-AG04 remains open on M4-AGR02.

## M4-AG05 — child/result framing exact; failure precedence open

The strict one-object/final-LF/fatal-UTF-8 child framing, complete nested
pair-result validation, 0/1 child-exit correlation, exact outer keys,
activation projection, completed-step prefix, private-field suppression,
fixed backend command ceiling, exact new-root retention, no old retained-tag
access, no post-attempt Docker cleanup, no retry, and mandatory later result
review are suitable contract directions. The outer result remains only a
candidate attempt and does not establish Observed evidence.

Blocking finding M4-AGR03: the child-result eligibility list does not require
the wrapper failure latch to be empty. A child can emit a byte-valid complete
or inconclusive result and close with correlated exit after timeout, output
overflow, asynchronous process error, or signal-delivery failure has already
latched. Under the current words it still satisfies every eligibility bullet
and can be projected as `complete` or `CONTROL_INCONCLUSIVE`, contradicting
the monotonic first-failure and timeout/output/process classifications. “First
applicable” also does not fix whether precedence is chronological across those
events.

The remediation must make every latched wrapper failure permanently disqualify
child-result acceptance, fix one chronological first-failure mapping including
signal failure, and prove that later output, exit, signal, or `close` cannot
replace it. M4-AG05 remains open.

## M4-AG06 — bounded implementation and evidence separation closed

The implementation and verification allowlists are exact path boundaries. They
exclude canonical profiles, image/staging input, activation-entry source,
ordinary entry, production backends/executors, fixtures, results, Expected
matrix values, historical evidence, and `Observed`. The permitted commands are
Docker-free construction/static/unit commands only. A later independent
implementation/gate review and still-later result review remain mandatory.

M4-AG06 is closed at contract scope, but the allowlist cannot be used while
M4-AGR01 through M4-AGR03 remain open. This review does not approve the package
command or standing-authorization use.

## Exact blocked remediation

Exactly one Docker-free contract-only task may proceed under
[`prompts/m4-distinct-activation-object-execution-gate-remediation.md`](../../prompts/m4-distinct-activation-object-execution-gate-remediation.md).
It must close only M4-AGR01 through M4-AGR03 while preserving every reproduced
generation, constants, activation, profile, backend, identity, retention,
allowlist, and evidence boundary.

No wrapper/run-ID/package implementation, filesystem-emitting compile, object
import/execution, production executor, Docker action, result/retained-state
access, cleanup, retry, command approval, issue #46 work, historical evidence
change, or `Observed` promotion belongs to that remediation.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, routed frozen-research/M4 documents, prior filesystem/activation reviews, execution-gate contract, and review prompt | Read without Docker, runtime-socket access, retained-state access, result-root inspection, external network, credentials, Remote Git, or external communication. |
| `git status --short --branch`, complete untracked status, diff name/number summaries, and scoped source/document inspection | Preserved the existing issue #45 working tree; confirmed the wrapper/script remain absent and current constants remain on `20260720-01`. |
| In-memory TypeScript `5.9.3` two-literal construction and syntax-graph assertion | Exit 0; no diagnostics or file writes; reproduced the three constants objects, all three updated manifests, 22 source / 22 JavaScript / 22 declaration construction members, 21 executable members, activation/profile hashes, and 31/62 to 32/64 inventory-name delta. |
| In-memory emitted-output comparison | Exit 0; only `dist/constants.js` and `dist/constants.d.ts` differ before the unimplemented wrapper is added. |
| Static run/root/container derivation and critical `sha256sum` calculation | Exit 0; reproduced both fresh tuples and every review-input hash above without probing a result path or Docker. |
| Focused contract/source trace for wrapper dependencies, process settlement, pair-result schema, existing-image backend, package scripts, and ordinary entry | Reproduced M4-AGR01 through M4-AGR03 and the closed boundaries above. |
| `npm run m4:verify` | Exit 0; typecheck and the Docker-free static verifier passed, and 23 test files / all 252 tests passed without importing or executing the dormant activation object. |
| Focused Prettier check and `git diff --check` | Exit 0 for the review, remediation prompt, and five status records. |

No filesystem-emitting compile, wrapper/activation import or execution,
`npm run m4:doctor`, `npm run m4:build`,
`npm run m4:recovery:offline-build`, `npm run m4:run:controls`, proposed
one-shot command, production executor, Docker/container/runtime-socket action,
result-root or retained-state probe, cleanup, retry, process signal, external
network, credential, host-home content read, Remote Git, publication,
deployment, or third-party communication was used. Standing authorization was
not needed because this review crossed no runtime approval gate.

One initial instruction-discovery command was broader than required: it
enumerated `AGENTS.md` pathnames below the repository parent and encountered
permission-denied entries inside repository result trees. It did not read an
outside `AGENTS.md`, a result file, credential, home data, runtime socket, or
other outside file. The command is a process deviation and is not review
evidence; all evidence commands above were subsequently scoped to this
repository and excluded result paths.

## Decision and next task

M4-AG01 and M4-AG06 are closed. The constants/activation/profile portion of
M4-AG02 and the listed identity/unknown-settlement portion of M4-AG03/M4-AG04
also reproduce. M4-AG02 through M4-AG05 remain open on the three exact findings
above, so wrapper implementation and command approval are blocked.

Next: perform the bounded Docker-free execution-gate contract remediation
under
[`prompts/m4-distinct-activation-object-execution-gate-remediation.md`](../../prompts/m4-distinct-activation-object-execution-gate-remediation.md);
do not implement or execute the wrapper.
