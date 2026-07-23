# Frozen research track execution plan

Status: **active; user explicitly resumed the frozen high-assurance track on
2026-07-20**

This plan is separate from the completed Presentation MVP. Existing raw and
sanitized evidence, run IDs, result roots, container identities, attempt bytes,
Expected values, and accepted evidence classes remain immutable. Completing a
research task must not retroactively promote an earlier Inconclusive result.

## Execution rules

- Work on exactly one issue at a time.
- Keep later issues frozen until the active issue is complete and independently
  reviewed.
- Perform contract and Docker-free implementation/review work before any
  runtime gate.
- Use a fresh Expected revision, run ID, result root, and container identity for
  every new runtime generation; reject all exhausted tuples.
- Execute an independently approved exact one-shot command at most once and do
  not retry it on any outcome.
- Record Failure or Inconclusive without repair, reinterpretation, or evidence
  fabrication.
- Keep experiment execution offline and credential-free under the applicable
  nested `AGENTS.md` and manifest.

## Ordered backlog

| Order | Issue or task                                                                                                | State                                                          | Completion boundary                                                                                                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | [#45 M4 exact device/inode identity chain](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/45) | **closed at reviewed Inconclusive/cooperative-host boundary**  | The exact `20260720-02` occurrence exited 70 with zero-byte stdout/stderr and no retry. The fresh Docker-free result review found both exact new roots absent and accepted only one immutable exhausted Inconclusive attempt. It established no canonical activation result, failure code, runtime enforcement, or `Observed` evidence. |
| 2     | [#46 M4 public-input hardening](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/46)            | **closed at reviewed Docker-free static/unit boundary**        | The fresh remediation re-review closes M4-PI01 with no finding; M4-PI02 through M4-PI05 remain closed. No runtime gate, enforcement evidence, or `Observed` result was established.                                                                                                                                                     |
| 3     | [#47 production raw-to-derived collector](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/47)  | **closed at reviewed Docker-free static/unit boundary**        | The fresh remediation re-review closes M3-PC01 through M3-PC06 with no finding after reproducing exact cross-kind order comparison, immediate post-open descriptor ownership, and 9 files / 54 tests. No ingestion, activation, runtime result, or `Observed` evidence was established.                                                   |
| 4     | [#43 M0/M2-A evidence transfer](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/43)            | **closed at reviewed Inconclusive npm-acquisition boundary**   | The exact `20260721-01` occurrence exited 1 with the fixed failure line and no retry. The fresh fixed-root review found a stable empty retained root and accepted no archive, receipt, construction input, runtime result, or `Observed` evidence.                                                                                         |
| 5     | [#54 P2 selected Vite](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/54)                     | **active; implementation candidate awaits independent review** | New generation only; full permissive/constrained receipts, same-image pair, and accepted evidence chain are required for Observed.                                                                                                                                                                                                      |
| 6     | M4 profile-control new measurement generation                                                                | not yet filed                                                  | Create a dedicated issue with new identities, exact runtime-enforcement gate, one-shot pair, and fresh result review.                                                                                                                                                                                                                   |
| 7     | [#48 generic artifact/provenance pipeline](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/48) | frozen                                                         | Versioned schema, offline build/verify/deploy separation, normalization, negative tests, sanitized example, and fresh independent review.                                                                                                                                                                                               |
| 8     | [#49 all experiment-matrix rows](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/49)           | frozen                                                         | One adapter/profile pair per gate; every row ends as accepted Observed or a reviewed reproducibility limit.                                                                                                                                                                                                                             |
| 9     | [#50 full research assurance review](https://github.com/kanato-tk51/tskaigi-sendai-2026-lab/issues/50)       | frozen                                                         | Bidirectional raw-to-claim trace, clean regeneration, blocker-zero final independent review, and explicit residual guarantees.                                                                                                                                                                                                          |

## Completed issue: #45

The first task is Docker-free and must not access retained runtime state. Define
the exact filesystem-object identity contract for source, staging, profile,
activation entry, and result destination. The contract must decide how
device/inode, mode, size, SHA-256, symlink/hardlink, rename/replacement, and
TOCTOU are handled at preflight, use, and post-use boundaries. It must distinguish
official tool API changes from direct filesystem mutations and fail closed as
unsupported where the platform cannot provide the required identity.

The exact first implementation is authorized only at the bounded Docker-free
static/unit boundary approved by the residual-remediation re-review below.

Contract handoff update (2026-07-20): the Docker-free proposal in
[`m4-exact-filesystem-identity.md`](m4-exact-filesystem-identity.md) now fixes
private BigInt object identity, full metadata/content checks, ancestor and
pre/use/post binding, role-specific source/staging/profile/activation/result
rules, mutation provenance, fail-closed platform support, and the cooperative
host limitation. The fresh independent read-only review input is recorded in
[`prompts/reviews/m4-exact-filesystem-identity-contract-review.md`](../prompts/reviews/m4-exact-filesystem-identity-contract-review.md).
No M4 implementation or test was changed or run, Docker and retained runtime
state were not accessed, and no runtime or `Observed` evidence changed.

Fresh contract review update (2026-07-20): the independent read-only review in
[`reviews/m4-exact-filesystem-identity-contract.md`](reviews/m4-exact-filesystem-identity-contract.md)
records `BLOCKED` on M4-FS01 through M4-FS04. The proposal does not bind private
ownership, does not resolve whether the distinct activation object belongs to
the first implementation, does not fix the exact public replacement/schema and
path scope needed to remove `m4-file-*`, and does not close the
ownership/full-mode transitions for container-, CLI-, and host-created result
objects. The review accepted the cooperative-host limitation, BigInt direction,
pre/use/post descriptor model, process-close settlement, fail-closed cleanup,
and evidence-class separation only as contract direction. No implementation or
test was changed or run; Docker, retained M4 state, runtime identities/evidence,
and `Observed` were not accessed or changed.

Contract remediation update (2026-07-20): the proposal now adds private BigInt
`uid`/`gid` and exact repository/run/container/CLI ownership relations, defers
activation to the separately named M4 distinct activation-object contract task
after the first implementation review, fixes the six-key public transfer
replacement and exact implementation path allowlist, and closes all nine
container/transfer/host result rows with mode, owner, byte, settlement,
descriptor, and disposition rules. The re-review input is recorded in
[`prompts/reviews/m4-exact-filesystem-identity-contract-remediation-review.md`](../prompts/reviews/m4-exact-filesystem-identity-contract-remediation-review.md).
This update is contract evidence only. No M4 source, type, test, static verifier,
profile, compiled output, Docker command, retained state, runtime identity, or
`Observed` evidence was changed or executed.

Contract remediation re-review update (2026-07-20): the fresh independent
Docker-free re-review in
[`reviews/m4-exact-filesystem-identity-contract-remediation.md`](reviews/m4-exact-filesystem-identity-contract-remediation.md)
closes M4-FS02 through M4-FS04 but keeps M4-FS01 open on one residual boundary.
The first implementation explicitly covers the offline-build/recovery backends,
while the fixed tracked recovery inventory includes runtime-CLI-created Docker
configuration state, including a `0644` regular file, that has no listed exact
full-mode/owner/settlement transition. No implementation, test, Docker command,
retained-state access, runtime identity, or `Observed` change occurred.

Residual M4-FS01 remediation update (2026-07-20): the contract now fixes the
host-created preflight state and the exact post-`close` `doctor`, `build`, and
`inspect-image` inventories; exhaustively binds all fixed runtime-CLI-created
Docker configuration rows to the private run-owner relation, exact `0700`,
`0600`, or single `0644` full mode and bounded size; forbids content reads and
host normalization; retains unsettled/invalid state; and distinguishes exact
identity-checked fresh-run cleanup from retention-only historical recovery.
The fresh independent re-review input is recorded in
[`prompts/reviews/m4-exact-filesystem-identity-contract-residual-remediation-review.md`](../prompts/reviews/m4-exact-filesystem-identity-contract-residual-remediation-review.md).
No implementation, test, static verifier, Docker command, retained-state
access, runtime identity, or `Observed` change occurred.

Residual M4-FS01 remediation re-review update (2026-07-20): the fresh
independent Docker-free review in
[`reviews/m4-exact-filesystem-identity-contract-residual-remediation.md`](reviews/m4-exact-filesystem-identity-contract-residual-remediation.md)
reproduces the 16-row fresh configuration contract, 15-row recovery snapshot,
all fixed modes/sizes/inventories, private run-owner relations, post-`close`
checkpoints, content non-read and held-handle rules, exact fresh cleanup, and
retention-only recovery. It closes M4-FS01 with no new finding, keeps M4-FS02
through M4-FS04 closed, and approves only the exact 16-path Docker-free
static/unit first implementation and focused negative tests. The review did not
run tests, Docker, or a production executor; access retained state; select an
activation/runtime tuple or execution gate; or change runtime evidence or
`Observed`.

First implementation update (2026-07-20): the approved exact 16-path
Docker-free task is complete. It adds the private shared BigInt identity helper,
migrates the loader/offline-build/recovery/control/executor/type boundary,
replaces the public transfer record atomically, and adds the focused negative
tests and static assertions required by the contract. `npm run m4:verify`
passed its typecheck, static verifier, and all 236 tests. Docker, a runtime
socket, retained-state access, activation, compiled output, a production
executor, runtime identities/evidence, and `Observed` were not accessed or
changed.

Fresh implementation review update (2026-07-20): the independent Docker-free
read-only review in
[`reviews/m4-exact-filesystem-identity-implementation.md`](reviews/m4-exact-filesystem-identity-implementation.md)
records `BLOCKED` on M4-FSI01 through M4-FSI05. The two repository-input
loaders omit the nested fixed fixture ancestor; host-created files close and
reopen instead of retaining their creating descriptor, and staged/config files
bypass the sync/read-back helper; fixed Docker copy children lack immediate
source/ancestor pre/post checks; recovery closes its retained-state lease while
an unknown-settlement child remains active; and the focused tests do not cover
those boundaries or the complete negative-test list. M4-FS01 through M4-FS04
remain closed at contract scope. No implementation was repaired, and Docker,
retained state, activation, compiled output, runtime evidence, and `Observed`
were not accessed or changed.

Implementation remediation update (2026-07-20): the exact bounded Docker-free
remediation is complete within the existing 16 implementation/test/static
paths. It adds the missing fixed fixture ancestor to both repository leases,
retains every host-created file's original exclusive descriptor through
same-descriptor read-back and consumer settlement, performs complete immediate
pre/post checks for each fixed copy child and destination, and assigns unknown
recovery settlement to a retention-only terminal owner without early lease
release. The focused suite now exercises the missing ancestor, descriptor,
copy, settlement, owner, configuration-checkpoint, capability, and early-stable
boundaries. `npm run m4:verify` passed typecheck, the Docker-free static
verifier, 22 test files, and all 247 tests. This is static/unit evidence only;
M4-FSI01 through M4-FSI05 remain pending independent re-review. Docker, retained
state, activation, compiled output, runtime identities/evidence, and `Observed`
were not accessed or changed.

Implementation remediation re-review update (2026-07-20): the fresh
independent Docker-free read-only review in
[`reviews/m4-exact-filesystem-identity-implementation-remediation.md`](reviews/m4-exact-filesystem-identity-implementation-remediation.md)
closes M4-FSI01 through M4-FSI05 with no new finding and keeps M4-FS01
through M4-FS04 closed at contract scope. It independently reproduced the
exact 16-path implementation/verification boundary and reran
`npm run m4:verify`; typecheck, the static verifier, 22 test files, and all 247
tests passed. The approval is static/unit only and permits only the separately
named distinct activation-object contract task next. It does not choose that
object or authorize implementation, compiled output, Docker, retained state,
runtime evidence, an execution gate, or `Observed`.

Distinct activation-object contract update (2026-07-20): the Docker-free
contract in
[`m4-distinct-activation-object.md`](m4-distinct-activation-object.md) fixes the
separate frozen-research source/compiled/declaration paths, exact 774-byte
source, compiler-produced bytes, 22-module TypeScript source and JavaScript
construction sets, 21-module executable import closure,
package/export/script non-reachability, complete private identity/settlement
protocol, exact later implementation allowlist, and focused negative coverage.
The fresh independent review input is recorded in
[`prompts/reviews/m4-distinct-activation-object-contract-review.md`](../prompts/reviews/m4-distinct-activation-object-contract-review.md).
No activation source, compiled output, package script/export, test, static
verifier, Docker command, retained-state access, runtime identity/evidence, or
`Observed` value was changed or executed.

Distinct activation-object contract review update (2026-07-20): the fresh
independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-contract.md`](reviews/m4-distinct-activation-object-contract.md)
reproduces the exact proposed paths, bytes, compiler delta, source/output
inventories, construction manifests, and non-reachability. It closes M4-AO01,
M4-AO03, M4-AO04, and M4-AO05 at contract scope but keeps M4-AO02 open because
the contract states a 22-module executable closure while syntax-derived emitted
JavaScript reaches only 21 modules; type-only `types.ts` emits a construction
byproduct but no runtime import. The object remains absent, implementation is
not approved, and every runtime gate remains frozen.

Distinct activation-object M4-AO02 contract remediation update (2026-07-20):
the contract preserves all proposed paths, construction bytes, 22 source rows,
22 JavaScript rows, 22 declaration rows, manifests, inventories, and compiler
delta. It now separately fixes the exact 21-module executable import set,
excludes construction-only `types.js` from runtime reachability, and requires
focused assertions to reject set, ordering, and runtime-edge drift. No object
was added or compiled, no implementation path changed, and every runtime gate,
historical result, and `Observed` value remains frozen.

Distinct activation-object M4-AO02 remediation re-review update (2026-07-20):
the fresh independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-contract-remediation.md`](reviews/m4-distinct-activation-object-contract-remediation.md)
reproduces the exact 22-source, 22-JavaScript-construction,
22-declaration-construction, and 21-executable-import sets; confirms type-only
source reachability and no runtime inbound edge for construction-only
`types.js`; and preserves every byte, manifest, inventory, compiler delta,
identity/settlement rule, allowlist, and gate limitation. M4-AO02 closes with
no new finding, and M4-AO01 through M4-AO05 are closed at contract scope. Only
the exact bounded Docker-free compile-only/static/unit implementation is
approved next.

Distinct activation-object implementation update (2026-07-20): the saved
implementation prompt was fixed before source changes. The exact 774-byte
dormant source is now present, and the pinned compile-only constructor produced
the exact 788-byte JavaScript and 11-byte declaration without diagnostics. The
Docker-free verifier and focused suites bind the exact 22-source,
22-JavaScript-construction, 22-declaration-construction, and
21-executable-import sets, all inventories/manifests/compiler deltas,
non-reachability, private peer identities, and replacement/settlement negative
boundaries. `npm run m4:verify` passed 23 test files and all 252 tests, and the
focused compiled import-safety assertion passed without importing the entry.
No object import or execution, Docker/runtime-socket access, retained-state
access, runtime evidence, historical-result change, execution gate, or
`Observed` promotion occurred.

Distinct activation-object implementation review update (2026-07-20): the
fresh independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-implementation.md`](reviews/m4-distinct-activation-object-implementation.md)
reproduces the exact construction bytes, full inventories and manifests, all
three contracted module sets, syntax edges, non-reachability, private peer
identity, and replacement/settlement negative boundary. `npm run m4:verify`
passed 23 test files and all 252 tests. M4-AO01 through M4-AO05 close at
implementation scope with no finding. No object import/execution, Docker,
retained-state access, runtime evidence, historical-result change, gate, or
`Observed` promotion occurred.

Distinct activation-object execution-gate contract update (2026-07-20):
[`m4-distinct-activation-object-execution-gate.md`](m4-distinct-activation-object-execution-gate.md)
now fixes the fresh gate Expected revision, exact `20260720-02` pair roots and
container names, the two-literal run-ID construction delta, unchanged profile
and activation bytes, a separate path-only TypeScript wrapper, complete held
source/compiled identity, close-only settlement, bounded canonical output,
one argument-free candidate command, no-retry retention, and an exact later
implementation allowlist. The fresh independent review input is recorded in
[`prompts/reviews/m4-distinct-activation-object-execution-gate-review.md`](../prompts/reviews/m4-distinct-activation-object-execution-gate-review.md).
This definition did not implement or execute the wrapper, import or execute the
activation object, compile to disk, access Docker or retained/result state,
approve the command, change historical evidence, or promote `Observed`.

Fresh execution-gate contract-review update (2026-07-20): the independent
Docker-free read-only review in
[`reviews/m4-distinct-activation-object-execution-gate.md`](reviews/m4-distinct-activation-object-execution-gate.md)
reproduces the fresh generation, constants/compiler/manifests, activation and
profile bytes, 32/64 parent inventory names, fixed child, listed held identity,
backend side effects, retention, and evidence separation. It closes M4-AG01
and M4-AG06. M4-AG02 through M4-AG05 remain open on M4-AGR01 through M4-AGR03:
the wrapper's repository executable closure is not exact or completely held,
the synchronous no-child spawn and signal-failure branches are not settled,
and late valid child output can displace an earlier wrapper failure. The
bounded remediation prompt is saved at
[`prompts/m4-distinct-activation-object-execution-gate-remediation.md`](../prompts/m4-distinct-activation-object-execution-gate-remediation.md).

No wrapper/run-ID/package implementation, filesystem-emitting compile, object
import/execution, Docker action, result/retained-state access, command
approval, historical-evidence change, or `Observed` promotion occurred.

Execution-gate contract-remediation update (2026-07-20): the bounded
Docker-free task fixes M4-AGR01 through M4-AGR03 without changing the fresh
generation or later implementation allowlist. The wrapper now has exact
ordered seven-built-in/zero-local import sets and a singleton executable lease;
synchronous no-child, asynchronous-error, TERM/KILL, late-`close`, release,
and root-retention branches are closed; and one chronological write-once
failure latch disqualifies every later child result. The fresh independent
remediation re-review prompt is saved at
[`prompts/reviews/m4-distinct-activation-object-execution-gate-remediation-review.md`](../prompts/reviews/m4-distinct-activation-object-execution-gate-remediation-review.md).

No wrapper/run-ID/package implementation, filesystem-emitting compilation,
object import/execution, Docker or retained/result-state access, command
approval/execution, historical-evidence change, standing-authorization use, or
`Observed` promotion occurred.

Next: perform the fresh independent Docker-free read-only execution-gate
remediation re-review under the saved prompt above.

Execution-gate remediation re-review update (2026-07-20): the fresh
independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-execution-gate-remediation.md`](reviews/m4-distinct-activation-object-execution-gate-remediation.md)
reproduces the fixed generation and construction values, exact
seven-built-in/zero-local wrapper closure, no-child/returned-child/signal
settlement, chronological write-once failure latch, and complete focused later
acceptance. M4-AGR01 through M4-AGR03 close with no new finding, and M4-AG01
through M4-AG06 are closed at contract scope.

The approval reaches only the contract's exact bounded Docker-free
implementation/static/unit allowlist. No wrapper/run-ID/package
implementation, activation import/execution, Docker or retained/result-state
access, command approval/execution, standing-authorization use, historical
evidence change, or `Observed` promotion occurred.

Next: perform the exact bounded Docker-free wrapper/run-ID/package
implementation and focused static/unit verification, then obtain a fresh
independent implementation/gate review before any command approval.

Bounded execution-gate implementation update (2026-07-20): both required
implementation/review prompts were saved first, then the exact `20260720-02`
constants, self-contained wrapper, compiler outputs, one package edge, two
profile handoffs, static verifier, and focused tests were constructed within
the reviewed allowlist. The wrapper source/JavaScript/declaration identities
are 42,865 bytes / `80829982...`, 41,159 bytes / `ab36b509...`, and 1,244 bytes
/ `ed1e6145...`. The pinned compile-only command emitted without diagnostics,
and `npm run m4:verify` passed 24 test files and all 265 tests. A separate
permission-bounded assertion imported ten ordinary compiled modules without
either frozen-research entry.

This is static/unit evidence only. No production wrapper/activation command,
Docker/runtime-socket operation, retained/result-state access, historical
evidence change, command approval, standing-authorization use, or `Observed`
promotion occurred.

One initial read-only `find ..` instruction-discovery command listed adjacent
path names and encountered permission-denied result subtrees. It read no
adjacent file or credential and changed nothing, but exceeded the repository-
only enumeration boundary. It is not evidence and was not repeated.

Next: perform the fresh independent Docker-free implementation/gate review
under
[`prompts/reviews/m4-distinct-activation-object-execution-gate-implementation-review.md`](../prompts/reviews/m4-distinct-activation-object-execution-gate-implementation-review.md)
before any candidate command approval.

Fresh execution-gate implementation/gate review update (2026-07-20): the
independent Docker-free review in
[`reviews/m4-distinct-activation-object-execution-gate-implementation.md`](reviews/m4-distinct-activation-object-execution-gate-implementation.md)
reproduces the exact generation, construction, inventories, activation sets,
wrapper edges, package/profile handoffs, and process/output source direction.
The pinned compiler completed without diagnostics and `npm run m4:verify`
passed 24 test files and all 265 tests. The candidate command remains blocked
on M4-AGI01 and M4-AGI02: the production lease captures current wrapper bytes
as a new baseline instead of authenticating the independently reviewed full
objects, and the focused negative matrix is incomplete. The bounded remediation
prompt is saved at
[`prompts/m4-distinct-activation-object-execution-gate-implementation-remediation.md`](../prompts/m4-distinct-activation-object-execution-gate-implementation-remediation.md).

No candidate command, wrapper/activation production entry, Docker or runtime
socket, result/retained state, historical evidence, standing authorization, or
`Observed` value was executed, accessed, or changed.

Next: remediate only M4-AGI01 and M4-AGI02 under the saved bounded Docker-free
remediation prompt above.

Bounded M4-AGI01/M4-AGI02 remediation update (2026-07-20): the wrapper and its
compiler outputs remain unchanged at the reviewed 42,865 / 41,159 / 1,244-byte
identities. Full-object authenticity is now explicitly external and
non-circular: a fresh worker must run `npm run m4:static` as the final
filesystem-reading trust preflight immediately before the one candidate
command, if and only if a later fresh review approves that gate. Production
descriptor capture remains the complete twice-pre/twice-post stability lease
after that trust input and is not treated as self-authentication. The same-UID
cooperative-host race limitation remains.

Focused Docker-free coverage now rejects same-prefix or appended-loader drift,
the complete source/emitted edge and binding matrix, all unleased loader/entry
classes, separate no-child validation/release failures, exact two-root source
access, null streams, invalid PID and exit-close tuples, asynchronous error and
TERM/KILL branches, later valid complete/Inconclusive bytes after every earlier
failure class, exact prefixes/key order/private suppression, both post-use
checks, and release-before-output. The saved fresh re-review prompt is
[`prompts/reviews/m4-distinct-activation-object-execution-gate-implementation-remediation-review.md`](../prompts/reviews/m4-distinct-activation-object-execution-gate-implementation-remediation-review.md).

`npm run m4:verify` passed typecheck, the Docker-free static verifier, 24 test
files, and all 292 tests, including all 40 generated focused wrapper cases. The
separate repository-read-only permission-bounded assertion imported ten
ordinary compiled modules without either frozen-research entry; scoped
formatting and `git diff --check` passed. The root format check remains blocked
only by a pre-existing unformatted change in
`containers/profile-control/test/control-host-backend.test.ts`, outside this
remediation's edit boundary. No production entry or candidate command,
Docker/runtime socket, result/retained state, cleanup, retry, signaling,
standing authorization, historical evidence, or `Observed` value was executed,
accessed, or changed.

Next: perform the fresh independent Docker-free read-only M4-AGI01/M4-AGI02
remediation re-review under the saved prompt above.

M4-AGI01/M4-AGI02 remediation re-review update (2026-07-20): the fresh
independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-execution-gate-implementation-remediation.md`](reviews/m4-distinct-activation-object-execution-gate-implementation-remediation.md)
reproduces the three full wrapper identities, non-circular final-static trust
anchor, seven-built-in/zero-local singleton closures, 32/64 inventories,
22/22/22/21 activation sets, complete edge/process/output negative matrix, and
exact two-root source instrumentation. `npm run m4:verify` passed 24 test files
and all 292 tests. M4-AGI01/M4-AGI02 and M4-AG01 through M4-AG06 close at
implementation scope with no finding.

The review approves at most one later argument-free command occurrence. A fresh
worker must first reproduce every reviewed identity and only the two exact new-
root absence facts, run `npm run m4:static` as the final filesystem-reading
trust preflight, and—if it succeeds—use standing authorization for exactly one
immediately following `npm run --silent m4:execute:frozen-research` occurrence.
No intervening command/write, retry, repair, cleanup, alternate generation, or
result classification is authorized. The review itself did not use standing
authorization or run either production entry, Docker, or the candidate command.

Next: execute the exact approved one-occurrence activation gate in a fresh
worker, then stop without retry for a separate result review.

Exact one-occurrence activation update (2026-07-20): a fresh worker reproduced
the reviewed wrapper, constants, activation, package, canonical-profile,
inventory, manifest, edge, generation, and command identities. It checked only
the two exact `20260720-02` result roots and established that both were absent.
The final immediately adjacent `npm run m4:static` trust preflight exited 0.
The worker then used the `continue-repository-work` standing authorization for
exactly one argument-free
`npm run --silent m4:execute:frozen-research` occurrence. This was not a
separate human review. The candidate exited 70 and emitted no stdout or stderr.

The generation is exhausted. It was not retried, repaired, cleaned up, or
replaced, and no post-attempt Docker command, result-root inspection,
retained-state access, result classification, historical-evidence change, or
`Observed` promotion occurred. Exit 70 and the empty candidate output are
execution observations only until a separate fresh Docker-free result review
reconciles them with the exact two new roots.

Next: define the exact fresh Docker-free result-review prompt for the exhausted
`20260720-02` activation generation without accessing either result root.

Exhausted activation result-review contract update (2026-07-20): the exact
fresh Docker-free prompt is saved at
[`prompts/reviews/m4-distinct-activation-object-result-review.md`](../prompts/reviews/m4-distinct-activation-object-result-review.md).
It binds exit `70`, the zero-byte stdout and stderr identities, all approved
repository objects and construction sets, only the two exact `20260720-02`
roots and named control-record paths, no-follow canonical/cross-binding checks,
and the rule that missing canonical activation output cannot establish
`identityStable`, a child control result, profile-control Observed, route
evidence, or experiment-matrix Observed. It allows no retry, repair, cleanup,
Docker recovery, alternate generation, or result promotion.

This contract-definition task did not inspect either result root, access
Docker or retained state, rerun a production entry, modify historical evidence,
or use standing authorization.

Next: perform the fresh independent Docker-free read-only result review under
the saved prompt above.

Exhausted activation result-review decision (2026-07-20): the fresh independent
Docker-free review in
[`reviews/m4-distinct-activation-object-result.md`](reviews/m4-distinct-activation-object-result.md)
reproduced all approved repository identities, inventories, manifests, edge
sets, the fixed generation, and the zero-byte stream identities. `npm run
m4:static` exited 0, and `npm run m4:verify` passed 24 test files and all 292
tests. Its bounded no-follow inspector checked only the two exact new result
paths and found both absent; it did not list their parent or access an old root,
Docker, retained state, or another evidence root.

The exit-70/empty-output handoff and absent roots contain no canonical
activation result, failure code, completed-step prefix, identity-stability
proof, child settlement, Docker behavior, control record, receipt, or profile
pair. The review therefore accepted only one immutable exhausted Inconclusive
attempt. It authorized no retry, repair, cleanup, alternate generation,
retained-state mutation, Docker recovery, or `Observed` promotion. Issue #45
is complete only at that reviewed Inconclusive and cooperative-host boundary.

Next: begin issue #46 with one Docker-free public-input-hardening contract and
fresh independent contract-review prompt; do not implement the hardening in
that contract task.

## Completed issue: #46

Public-input hardening contract update (2026-07-20): the Docker-free contract
in
[`m4-public-input-hardening.md`](m4-public-input-hardening.md)
now fixes the complete active ingress inventory and separates untrusted data,
explicit backend authority, and private branded state. It requires
descriptor-only plain records and dense arrays, intrinsic-only ordinary
`Uint8Array`/Node `Buffer` snapshots, rejection of Proxy, accessor, symbol,
custom data prototype, detached/resizable/shared storage, complete synchronous
pre-`await` ownership, captured backend methods, route-preserving errors, a
table-driven negative matrix, and one exact later implementation allowlist.
The old issue #45 activation source/compiled identities remain immutable
historical constants; later hardened source must stay explicitly distinct from
unchanged compiled objects and cannot become an activation candidate.

The fresh independent Docker-free review input is saved at
[`prompts/reviews/m4-public-input-hardening-contract-review.md`](../prompts/reviews/m4-public-input-hardening-contract-review.md).
This contract task changed no M4 implementation, test, static verifier,
compiled output, package export/script, profile, fixture, input, result,
historical evidence, runtime state, or `Observed` value. It ran no Docker,
production executor, retained-state access, cleanup, retry, network operation,
or Remote Git action, and standing authorization was not needed.

Next: perform the fresh independent Docker-free read-only issue #46 contract
review under the saved prompt above; do not implement before that decision.

Fresh contract-review update (2026-07-20): the independent Docker-free
read-only review in
[`reviews/m4-public-input-hardening-contract.md`](reviews/m4-public-input-hardening-contract.md)
reproduces every package-root and direct internal ingress, private-brand
consumer, backend authority/return family, descriptor/prototype rule,
intrinsic byte/shared-memory rule, pre-`await` snapshot, negative-test/static
boundary, and the immutable 32-source/64-output issue #45 construction. It
closes M4-PI01 through M4-PI05 at contract scope with no finding and approves
only one bounded Docker-free static/unit implementation under the exact
19-production/21-verification-path allowlist.

No implementation, test, static verifier, compiled output, production entry,
Docker or retained/result-state access, runtime gate, historical evidence, or
`Observed` value changed. M4 tests/typecheck were intentionally not rerun for
this contract-only review.

Next: perform the exact bounded Docker-free public-input-hardening static/unit
implementation, saving its implementation prompt before the first source
change; do not emit compiled output or define a runtime gate.

Bounded implementation update (2026-07-20): the issue #46 implementation saved
[`prompts/m4-public-input-hardening-implementation.md`](../prompts/m4-public-input-hardening-implementation.md)
before its first source change and applied the approved descriptor-only,
intrinsic-byte, private-brand, explicit-authority, pre-`await`, negative-test,
and static boundaries under the exact allowlist. The Docker-free
`npm run m4:verify` passes typecheck, static verification, 25 test files, and
298 tests.

The exact issue #45 source/compiled construction remains historical and
immutable. The static verifier and frozen construction test bind current issue
#46 allowlisted source separately from unchanged old compiled objects; no
filesystem emit or activation candidate was created. No Docker, production
executor, retained/result-state access, runtime gate, cleanup, retry,
historical evidence change, or `Observed` promotion occurred. Standing
authorization was not needed.

The fresh independent Docker-free read-only review input is saved at
[`prompts/reviews/m4-public-input-hardening-implementation-review.md`](../prompts/reviews/m4-public-input-hardening-implementation-review.md).

Fresh implementation-review update (2026-07-20): the independent Docker-free
read-only review in
[`reviews/m4-public-input-hardening-implementation.md`](reviews/m4-public-input-hardening-implementation.md)
reran `npm run m4:verify`; no-emit typecheck and static verification passed,
then 25 test files and all 298 tests passed. It also reproduced the immutable
historical 2,582/5,232/7,814-byte construction and the separate current
2,585/2,027/7,817-byte source/edge/old-output manifests.

The review records `BLOCKED` on M4-PI01. `expectedControls` and
`fixedContainerArguments` accept every non-`permissive` runtime value as
constrained rather than performing exact primitive validation. The
existing-image executor also accepts and retains the duplicate unused
`immutableInputLease` outer value across `await` even though the production
backend already owns the real lease. Current negative/static coverage does not
reject those cases. M4-PI02 through M4-PI05 otherwise close at implementation
scope; compiled output, package scripts/exports, Docker, retained/result state,
runtime gates, historical evidence, issue #47, and `Observed` remain unchanged
and unapproved.

Next: perform only the review's bounded Docker-free M4-PI01 remediation,
saving its implementation and fresh re-review prompts before the first source
change.

Bounded remediation update (2026-07-20): the remediation and fresh re-review
prompts were saved before the first source change. Both primitive selectors now
reject values outside exact `"permissive" | "constrained"` with their existing
route errors. The existing-image executor no longer types, accepts, snapshots,
or retains the duplicate `immutableInputLease`; `runFixedProductionControls`
transfers the real lease only to the production backend and passes an explicit
lease-free executor input.

Focused invalid-selector and extra-field tests prove zero Proxy hooks and zero
backend calls, while a TypeScript-AST static assertion prevents either
selector from regaining a default-to-constrained branch. The current issue #46
source/source-edge/current-plus-old-output identities are now
2,585/2,002/7,817 bytes. The historical issue #45
2,582/5,232/7,814-byte construction and compiled objects remain unchanged.
`npm run m4:verify` passed no-emit typecheck, static verification, 25 test
files, and all 300 tests.

No compiled output, package surface, Docker, production executor,
retained/result-state access, runtime gate, historical evidence, issue #47, or
`Observed` value changed. Standing authorization was not needed. The fresh
independent Docker-free read-only re-review prompt is saved at
[`prompts/reviews/m4-public-input-hardening-implementation-remediation-review.md`](../prompts/reviews/m4-public-input-hardening-implementation-remediation-review.md).

Next: perform the fresh independent Docker-free read-only M4-PI01 remediation
re-review under the saved prompt; keep issue #47 frozen until that decision.

Fresh M4-PI01 remediation re-review update (2026-07-20): the independent
Docker-free read-only review in
[`reviews/m4-public-input-hardening-implementation-remediation.md`](reviews/m4-public-input-hardening-implementation-remediation.md)
reproduces both exact selector guards, the lease-free executor outer input and
private snapshot, the production backend's retained real lease, focused
zero-hook/zero-backend rejection, AST regression guards, and the immutable
historical/current construction split. It closes M4-PI01 at implementation
scope with no new finding; M4-PI02 through M4-PI05 remain closed.

The focused 2-file suite passed 36 tests and `npm run m4:verify` passed no-emit
typecheck, Docker-free static verification, 25 test files, and all 300 tests.
No implementation/test repair, compiled-output adoption, production entry,
Docker or retained/result-state access, runtime gate, historical-evidence
change, or `Observed` promotion occurred. Issue #46 is closed only at the
Docker-free static/unit boundary.

Next: define issue #47's first Docker-free production raw-to-derived collector
contract and save its fresh independent contract-review prompt; do not
implement the collector in that contract task.

## Completed issue: #47

The first task is Docker-free and contract-only. Define exactly one production
adapter's raw-to-derived collector boundary. The contract must bind immutable
raw inputs, deterministic clean regeneration of every declared derived file,
fail-closed preservation of rejected/partial/corrupt input, sanitization and
negative-test requirements, evidence-class non-promotion, and one exact later
implementation allowlist. Save a fresh independent Docker-free contract-review
prompt in the same task.

Do not implement the collector, ingest an adapter run, rewrite raw evidence,
change Expected or `Observed`, select a runtime identity, access Docker or
retained/result state, or start issue #43 or any later backlog item.

Next: define issue #47's first Docker-free production raw-to-derived collector
contract and save its fresh independent contract-review prompt.

First production collector contract update (2026-07-20): the Docker-free
contract in
[`m3-production-raw-to-derived-collector.md`](m3-production-raw-to-derived-collector.md)
selects only the codegen `observe` adapter family. It adds an additive v3
adapter-run schema proposal while preserving the approved v2 synthetic bytes;
fixes the one-producer manifest and identity-bearing Expected rows; keeps the
before-only source hash and skipped tool change unavailable; and binds a
private held-descriptor raw inventory to transactional two- or five-file
derived publication.

The proposal preserves rejected/partial/corrupt raw bytes, distinguishes
filesystem rejection from sanitized Inconclusive content output, forbids
historical P2 backfill and evidence promotion, and lists one exact later
Docker-free static/unit implementation and negative-test allowlist. The fresh
independent review input is saved at
[`prompts/reviews/m3-production-raw-to-derived-collector-contract-review.md`](../prompts/reviews/m3-production-raw-to-derived-collector-contract-review.md).

No collector source, test, scenario JSON, package surface, raw adapter run,
historical result, Expected/Observed value, Docker state, retained state,
runtime identity, or command changed or was executed. Standing authorization
was not needed.

Next: perform the fresh independent Docker-free read-only issue #47 contract
review under the saved prompt; keep implementation, ingestion, runtime
activation, and issue #43 frozen until that decision.

Fresh production collector contract-review update (2026-07-20): the
independent Docker-free read-only review in
[`reviews/m3-production-raw-to-derived-collector-contract.md`](reviews/m3-production-raw-to-derived-collector-contract.md)
reproduces the additive v3/v2 separation, exact codegen 5/6/1 manifest and
12-event order, permissive/constrained outcome sets, and the before-only source
plus skipped-tool unavailable deltas. It closes M3-PC01 and the exact bounded
M3-PC06 allowlist at contract scope.

The review keeps M3-PC02 through M3-PC05 open. The contract records raw
SHA-256 before use without explicitly requiring same-descriptor digest
revalidation at every named content checkpoint. More importantly, it renames
`derived.staging/` to visible `derived/` before fallible raw/derived
post-publication checks and descriptor settlement, while requiring every
filesystem rejection to leave no published derived inventory and forbidding
repair/cleanup. A visible five-file complete projection could therefore remain
after an Inconclusive failure with no durable consumer distinction.

No implementation, test, scenario, static verifier, package surface, adapter
run, production collector, historical result, Docker or retained state,
runtime identity, Expected/Observed value, publication, or standing
authorization was used or changed.

Next: perform the review's bounded contract-only M3-PC02 through M3-PC05
remediation, making the final rename the sole publication commit after exact
same-descriptor content revalidation and all descriptor settlement, then save
a fresh independent Docker-free re-review prompt; keep implementation,
ingestion, runtime activation, and issue #43 frozen.

Production collector contract-remediation update (2026-07-20): the bounded
Docker-free contract-only remediation is complete. It preserves the additive
v3/v2 boundary, exact codegen `observe` manifest and identity-bearing Expected
rows, historical P2 exclusion, unavailable source/tool deltas, and the exact
later M3-PC06 implementation allowlist.

The remediated transaction names R1 post-render and R2 precommit. Each repeats
the exact accepted byte count, EOF, and SHA-256 from every originally held
no-follow descriptor while checking filesystem object, logical path, and
ancestor identity separately. Every raw/staged validation, read-back, sync,
serialization, evidence classification, result construction, and descriptor
close now settles while only non-evidence `derived.staging/` exists. The final
atomic rename to previously absent `derived/` is the sole publication commit
and last fallible operation; every failed branch leaves `derived/` absent and
retains at most exact staging without cleanup or retry.

The remediation and fresh re-review prompts are saved under `../prompts/` and
`../prompts/reviews/`. No source, test, scenario, static verifier, package
surface, raw adapter data, historical result, Expected/Observed value, Docker
or retained state, runtime identity, command, publication, or standing
authorization was used or changed.

Next: perform the fresh independent Docker-free read-only M3-PC02 through
M3-PC05 remediation re-review under the saved prompt; keep implementation,
ingestion, runtime activation, and issue #43 frozen until that decision.

Production collector contract-remediation re-review update (2026-07-20): the
fresh independent Docker-free read-only review in
[`reviews/m3-production-raw-to-derived-collector-contract-remediation.md`](reviews/m3-production-raw-to-derived-collector-contract-remediation.md)
reproduces the initial capture plus R1/R2 same-descriptor byte-count, EOF, and
SHA-256 checks separately from descriptor/path/ancestor identity. It traces all
raw/staged checks, syncs, serialization, classification, result construction,
and descriptor closes to settlement under only the non-evidence staging name,
with final rename as the sole publication commit and last fallible operation.

M3-PC02 through M3-PC05 close with no new finding; M3-PC01/M3-PC06 remain
closed. The unchanged exact M3-PC06 allowlist now permits at most one bounded
Docker-free static/unit implementation. No implementation, test, scenario,
adapter, collector, historical/result root, Docker or retained state, runtime
identity, Expected/Observed value, publication, or standing authorization was
used or changed.

Production collector bounded implementation update (2026-07-20): the saved
implementation prompt preceded every source change. The two fixed v3 scenario
definitions, exact frozen codegen manifest and identity-bearing Expected
validators, deterministic complete/mismatch and sanitized Inconclusive
derivation, and internal non-exported filesystem transaction are implemented
within M3-PC06. Focused tests cover initial/R1/R2 content and identity,
exclusive private staging, exact read-back, every close gate, sole-rename
commit, rejection preservation, deterministic clean roots, and package-root
non-activation.

`npm run m3:verify` passes 9 files / 52 tests, probe-core static verification
reports 19 source files and no failure, root typecheck plus 108 files / 801
tests pass, and `git diff --check` exits 0. Aggregate root `npm run check` is
not recorded as passing: it stops on pre-existing M4 formatting/lint findings
outside the M3-PC06 allowlist, which this task did not change. No adapter,
production collector, Docker, retained/historical result, runtime identity,
Expected/Observed value, external network, publication, or standing
authorization was used or changed.

Next: save the fresh independent Docker-free implementation-review prompt and
perform the read-only M3-PC01 through M3-PC06 implementation review; keep
ingestion, activation, runtime evidence, issue #43, and every later backlog
item frozen.

Production collector implementation-review update (2026-07-20): the fresh
independent Docker-free read-only review in
[`reviews/m3-production-raw-to-derived-collector-implementation.md`](reviews/m3-production-raw-to-derived-collector-implementation.md)
reproduces both exact v3 definitions, the current M2-E manifest binding,
R1/R2 same-held-descriptor content and identity checks, private staging,
registered-handle close settlement, final-rename terminal, and evidence
non-promotion. `npm run m3:verify` passes 9 files / 52 tests, probe-core static
verification passes 19 files, and root typecheck plus 108 files / 801 tests
pass. The aggregate root check remains non-green only on pre-existing
out-of-scope M4 formatting/lint findings.

The review records `BLOCKED` on two exact implementation gaps. Producer events
are separated into route/attempt/tool arrays before comparison, so the fixed
12-event cross-kind order can be lost without an Expected mismatch. Also,
raw-directory, raw-file, and staged-file helpers await their first descriptor
`stat()` before registering the open handle for close settlement. M3-PC02 and
M3-PC05 close at implementation scope; M3-PC01, M3-PC03, M3-PC04, and M3-PC06
remain open only on those gaps. No implementation repair, adapter or collector
activation, raw/historical result, Docker or retained state, runtime identity,
Expected/Observed change, publication, or standing authorization was used.

Next: remediate only the cross-kind 12-event order and post-open descriptor-
settlement gaps under the unchanged M3-PC06 allowlist, saving the bounded
remediation and fresh independent re-review prompts before the first source
change; keep ingestion, activation, issue #43, and later backlog items frozen.

Production collector implementation-remediation update (2026-07-20): both
bounded prompts were saved before the first remediation source change. The
pure collector now compares one locally frozen 12-entry identity sequence
across route, capability-attempt, and tool-change kinds before retaining the
existing per-kind and hash comparisons. A producer-sequence-valid cross-kind
permutation remains complete but is now an explicit Expected mismatch.

Each directory, raw-file, and staged-file helper now adds every successful
open to the owned settlement set before an injected post-open boundary or the
first descriptor `stat()`. Focused fault injection proves all three helper
families reach close settlement, preserve raw input, publish no `derived/`,
and retain only the exact staging state reached. Static verification checks
both the exact event order and open/register/checkpoint/stat source topology.

`npm run m3:verify` passes 9 files / 54 tests, probe-core static verification
passes 19 files, and root typecheck plus 108 files / 803 tests pass. Aggregate
root `npm run check` remains non-green only because the pre-existing
out-of-scope M4 formatting finding stops the aggregate command; separate lint
still reports only the existing 11 M4 errors. No production adapter occurrence
or production collector, Docker, retained/historical result, runtime identity,
Expected/Observed value, external network, publication, or standing
authorization was used or changed.

Next: perform the fresh independent Docker-free read-only M3-PC01 through
M3-PC06 remediation re-review under the saved prompt; keep ingestion,
activation, issue #43, and later backlog items frozen until that decision.

Fresh production collector implementation-remediation re-review update
(2026-07-21): the independent Docker-free read-only review in
[`reviews/m3-production-raw-to-derived-collector-implementation-remediation.md`](reviews/m3-production-raw-to-derived-collector-implementation-remediation.md)
closes M3-PC01 through M3-PC06 at implementation scope with no new finding. It
reproduces the exact 12-event cross-kind mismatch, immediate ownership and
close settlement for directory/raw/staged open helpers, the unchanged R1/R2
and sole-rename transaction, the complete negative/evidence/allowlist boundary,
and the 9-file / 54-test M3 pass. Probe-core static verification, root
typecheck, and 108 files / 803 tests also pass. Aggregate `check` remains
non-green only on the reproduced pre-existing out-of-scope M4 formatting/lint
findings.

No production collector or adapter ran, and no Docker, retained/historical
result, runtime identity, Expected/Observed value, external network,
publication, or standing authorization was used or changed. Issue #47 is
complete only at the reviewed Docker-free static/unit boundary.

## Active issue: #43

The first task is Docker-free and contract-only. Define the fixed transfer
contract for a fresh M0/M2-A measurement generation and save its fresh
independent contract-review prompt. Keep the one-shot execution, result review,
evidence promotion, Docker, and historical/exhausted generation state frozen.

Next: define issue #43's first Docker-free new-generation M0/M2-A evidence-
transfer contract and save a fresh independent contract-review prompt; do not
execute a transfer in that task.

First M0/M2-A evidence-transfer contract update (2026-07-21): the Docker-free
proposal in
[`m2-a-evidence-transfer-contract.md`](m2-a-evidence-transfer-contract.md)
fixes the fresh `20260721-01` run/result/container/volume tuple, one unprofiled
approved-rebuild occurrence, the current 31-file M2-A/probe input aggregate,
and a retained named-volume path that never reuses M0's stdout fallback. It
separates initializer, Docker CLI, measurement container, npm child, loopback,
producer-session, completion, and official-copy settlement; permits transfer
only after natural container exit; binds canonical completion plus conditional
segment/marker copy and validation; and keeps every result candidate below a
fresh independent result-review gate.

The exact later implementation/negative-test allowlist is fixed, and the
contract review has now completed with no blocking finding. No Docker command,
lifecycle fixture, probe, build, staging, result-root or retained-state access,
historical evidence change, Expected/Observed promotion, external network, or
standing authorization was used. The fresh independent Docker-free read-only
review prompt is saved at
[`prompts/reviews/m2-a-evidence-transfer-contract-review.md`](../prompts/reviews/m2-a-evidence-transfer-contract-review.md).

The exact implementation and fresh review prompts were saved before source
changes. The bounded Docker-free implementation now adds the fixed manifest,
non-executed Containerfile, no-argument initializer/runner sources, pure fixed
plan and canonical transfer validators, a branded fake-only state machine,
static verification, and focused negative tests. It adds no production Docker
backend or argument-free execution command. `npm run m2a:transfer:verify`
passes 1 file / 16 tests; existing `npm run m2a:verify` passes 4 files / 5
tests; and root no-emit typecheck passes. An initial root run passed 109 files /
819 tests; the final rerun retained 108 files / 818 tests with one out-of-scope
dirty M4 `M4_CONTROL_PATH` failure. Aggregate `check` stops earlier on the
existing out-of-scope M4 formatting warning.

No image/context construction, Docker/runtime-socket action, npm lifecycle or
probe execution, result-root or retained-state access, transfer, cleanup,
Expected/Observed change, external network, or standing authorization occurred.

The fresh independent Docker-free implementation review is recorded in
`reviews/m2-a-evidence-transfer-implementation.md`. It reproduces the fixed
tuple and 31-file aggregate and closes M2A-TR01/M2A-TR02. It blocks M2A-TR03
through M2A-TR06 on M2A-TRI01 through M2A-TRI04: the fixed host command and
CLI-environment plan is incomplete; terminal descriptor settlement is claimed
before an ignored later close; complete npm-flow validation admits timeout,
signal, and truncation drift; and attempt validation admits incoherent or
unsanitized states. No construction/execution-gate task is approved.

Next: save the exact bounded Docker-free M2A-TRI01 through M2A-TRI04
remediation and fresh re-review prompts, then remediate only those findings
under the unchanged M2A-TR06 boundary; do not construct an image or execute
transfer/runtime commands.

M2-A evidence-transfer implementation-remediation prompt update (2026-07-21):
the exact bounded remediation prompt and its fresh independent Docker-free
re-review prompt are saved under `../prompts/` and `../prompts/reviews/` before
any remediation source or test change. They bind only M2A-TRI01 through
M2A-TRI04 and the unchanged M2A-TR06 implementation paths. No implementation,
verification, container source, runtime, result, historical, Expected, or
`Observed` byte changed; no image/context construction, Docker, lifecycle,
transfer, result/retained-state access, external communication, or standing
authorization was used.

M2-A evidence-transfer implementation-remediation update (2026-07-21): the
bounded Docker-free remediation is complete under the unchanged M2A-TR06
allowlist. The pure fixed plan and strict validator now bind all absence,
create, pre-inspect, start, wait, final-inspect, and fixed-copy argv plus the
exact three-key credential-empty CLI environment, deadline/output bounds, and
exclusive mode-`0700` empty home/config policy. Every successfully opened
initializer or runner-owned handle enters one awaited close path without
ignored close failure; a late visible-commit close failure leaves a nonzero
container terminal, and the fake host chain classifies a committed-completion/
nonzero-exit contradiction as Inconclusive. Complete npm steps require child
close, exit zero, null signal, no timeout, and no stdout/stderr truncation. The
fake and canonical attempt validators now share one closed step-compatible
issue vocabulary, write-once first issue, natural-exit prerequisite chain, and
ordered conditional transfer states.

`npm run m2a:transfer:verify` passes the static verifier and 1 file / 22 tests;
`npm run m2a:verify` passes 4 files / 5 tests; root no-emit typecheck passes;
and `npm test` passes 109 files / 825 tests. Aggregate `npm run check` remains
non-green only because its formatting stage reproduces the pre-existing
out-of-scope M4 warning. No image/context construction, Docker/runtime-socket
action, npm install/pack/approve/rebuild, lifecycle or probe execution,
transfer, result-root or retained-state access, cleanup, Expected/Observed
change, external communication, publication, or standing authorization was
used. The prior implementation-review decision remains `BLOCKED` until a
fresh independent re-review reproduces the remediation.

M2-A evidence-transfer remediation re-review decision (2026-07-21): the fresh
independent Docker-free review in
[`reviews/m2-a-evidence-transfer-implementation-remediation.md`](reviews/m2-a-evidence-transfer-implementation-remediation.md)
reproduces the fixed 31-file aggregate, exact command plan, complete npm
terminal checks, focused 1-file / 22-test pass, existing 4-file / 5-test pass,
root typecheck, and 109-file / 825-test pass. M2A-TRI03 closes with no residual.

The decision remains `BLOCKED` on M2A-TRR01 through M2A-TRR03. A pure
read-only negative shows the nested JSON plan comparison accepts an inherited
`DOCKER_HOST`. The completion still claims descriptors closed before
publication opens and closes its handles, while rejecting parallel owned-
handle work lacks an all-settled barrier. A second pure negative shows a
completion listing only the segment and an attempt claiming a valid marker
transfer are both accepted because no candidate boundary cross-binds them.
M2A-TRI01, M2A-TRI02, and M2A-TRI04 therefore remain open, as do M2A-TR03
through M2A-TR06. No implementation/test repair, image/context construction,
Docker, lifecycle, transfer, result/retained-state access, evidence promotion,
external communication, or standing authorization was used.

M2-A evidence-transfer residual-remediation prompt update (2026-07-21): the
exact bounded Docker-free M2A-TRR01 through M2A-TRR03 remediation prompt and
its fresh independent re-review prompt are saved under `../prompts/` and
`../prompts/reviews/` before any residual source or test change. They fix the
recursive own-data plan boundary, exact
`prePublicationDescriptorsClosed`/all-settled ownership representation, and
pure `validateCandidateTransfer()` cross-record boundary under only the
unchanged M2A-TR06 implementation paths. No implementation, verification,
runtime, result, historical, Expected, or `Observed` byte changed; no
image/context construction, Docker, lifecycle, transfer, result/retained-state
access, external communication, or standing authorization was used.

That bounded residual remediation is now complete. The plan validator checks
the exact ordinary-object/array prototype, ordered own data descriptors, dense
array shape, and supported primitive at every nested node before comparison and
does not invoke getters. The runner registers each successful pre-publication
open, awaits all outcomes in both parallel descriptor-owning groups, and
constructs only `prePublicationDescriptorsClosed`; the later publication
handles remain proven only by natural process exit plus host correlation. The
pure `validateCandidateTransfer()` re-runs canonical attempt, completion, and
artifact validation before binding segment/marker inventory, artifacts,
transfer states, status, and exact rebuild issue.

Focused transfer verification passes 1 file / 25 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 828 tests. Aggregate `check` still stops at the pre-existing
out-of-scope M4 formatting warning. These are Docker-free static/unit
observations only. No container source was imported or executed; no image,
Docker, lifecycle, transfer, result/retained-state access, evidence promotion,
external communication, or standing authorization was used. M2A-TR03 through
M2A-TR06 remain review-blocked.

Next: perform the fresh independent Docker-free read-only M2A-TRR01 through
M2A-TRR03 residual-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-implementation-residual-remediation-review.md`;
do not construct an image or execute transfer/runtime commands.

M2-A evidence-transfer residual-remediation re-review decision (2026-07-21):
the fresh Docker-free read-only review in
[`reviews/m2-a-evidence-transfer-implementation-residual-remediation.md`](reviews/m2-a-evidence-transfer-implementation-residual-remediation.md)
closes M2A-TRR01/M2A-TRR02. Recursive exact-own-data negatives invoke no
getter, and all pre-publication descriptor-owning branches settle before the
truthful persisted key while publication handles remain bound to natural exit.

The decision remains `BLOCKED` on M2A-TRR03. A controlled canonical candidate
with successful install/approval/rebuild terminals, false runner-settlement
booleans, no output artifacts, and matching `M2A_REBUILD_FAILED` completion/
attempt issues is accepted. It therefore proves neither a real rebuild failure
nor valid complete transport. M2A-TR03 through M2A-TR06 remain blocked, and no
construction/execution gate is approved. No implementation repair, Docker,
lifecycle, transfer, result access, evidence promotion, external communication,
or standing authorization was used.

The exact bounded Docker-free M2A-TRR03 failure-candidate correlation
remediation and fresh independent re-review prompts are now saved before
source/test changes. They permit only the pure transfer library/declaration,
focused test, static verifier if needed, prompt pair, and minimal five status
records. The sole `M2A_REBUILD_FAILED` combined candidate must now prove all
runner-settlement booleans, successful install/approval prerequisites, a
settled integer nonzero rebuild failure, and exact valid segment plus
conditional-marker transport. No implementation, verification, runtime,
result, historical, Expected, or `Observed` byte changed in this prompt-only
task, and standing authorization was not used.

Next: perform the exact bounded Docker-free M2A-TRR03 failure-candidate
correlation remediation under
`../prompts/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation.md`;
do not construct an image or execute transfer/runtime commands.

M2-A failure-candidate correlation remediation update (2026-07-21): the
bounded Docker-free remediation is complete under the exact saved allowlist.
The pure combined validator now requires truthful runner settlement, exact
successful install/approval terminal and approval/lock prerequisites, a
settled integer nonzero rebuild failure, and exact valid segment plus
conditional-marker transport for `M2A_REBUILD_FAILED`, while retaining
complete candidates and the closed plan/descriptor findings.

`npm run m2a:transfer:verify` passes 1 file / 26 tests, existing
`npm run m2a:verify` passes 4 files / 5 tests, root typecheck passes, and root
tests pass 109 files / 829 tests. Aggregate `npm run check` exits `1` at the
pre-existing out-of-scope M4 formatting warning before later stages. No
container source was imported or executed; no image/context construction,
Docker, lifecycle, transfer, result/retained-state access, evidence promotion,
external communication, or standing authorization was used. M2A-TRR03 and
M2A-TR03 through M2A-TR06 remain review-blocked.

Next: perform the fresh independent Docker-free read-only M2A-TRR03
failure-candidate correlation remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation-review.md`;
do not construct an image or execute transfer/runtime commands.

M2-A failure-candidate correlation remediation re-review decision
(2026-07-21): the fresh independent Docker-free read-only review in
[`reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation.md`](reviews/m2-a-evidence-transfer-implementation-failure-candidate-correlation-remediation.md)
closes M2A-TRR03 with no new finding. Four intended complete/failure candidates
and 36 inverse correlation contradictions were reproduced, while the exact
31-file identity and closed recursive-plan/descriptor-settlement boundaries
remain intact. M2A-TR01 through M2A-TR06 are closed only at static/unit scope.

The review changed no implementation or test and used no image construction,
Docker, lifecycle, transfer, result access, evidence promotion, external
communication, or standing authorization. At most one later Docker-free
construction/execution-gate contract may bind the complete constructed context
and exact local `sha256:` image ID before any command is reviewed.

Next: define that exact Docker-free issue #43 construction/execution-gate
contract and save its fresh independent review prompt; do not construct an
image or execute transfer/runtime commands.

M2-A construction/execution-gate proposal update (2026-07-21): the exact
proposal in
[`m2-a-evidence-transfer-construction-execution-gate.md`](m2-a-evidence-transfer-construction-execution-gate.md)
and its fresh independent Docker-free review prompt are saved before any
implementation change. M2A-CG01 through M2A-CG06 bind the fixed tuple, exact
41-row tracked baseline, separate not-yet-authorized npm acquisition receipt,
complete normalized context inventory and manifest, one offline no-retry image
build with an exact local-image binding packet, phase-separated no-argument
entries, one-shot runtime order, evidence classes, and the only permitted later
static/unit implementation paths.

No constructor/production entry, dependency byte, context, image, Docker
object, transfer, or issue #43 result was created or executed. No runtime,
historical, Expected, or `Observed` byte changed, and standing authorization
was not used. The proposal approves no acquisition, construction, image build,
Docker action, result access, or evidence promotion.

Next: perform the fresh independent Docker-free read-only construction/
execution-gate contract review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-review.md`;
do not acquire npm, construct a context or image, call Docker, or access
runtime/result state.

That fresh independent Docker-free contract review is now complete and
recorded in
`reviews/m2-a-evidence-transfer-construction-execution-gate.md`. The exact
31-row and 41-row aggregates, fixed tuple, eight Containerfile copy sources,
and existing pure transfer plan reproduce, but M2A-CG01 through M2A-CG06 remain
open on M2A-CGR01 through M2A-CGR03. The proposal leaves the actual compiler/
runtime/resolver input and construction schema unbound, leaves build argv/
bounds/platform/config/image-binding choices descriptive, and does not define
the host copy/result transaction while contradicting whether unknown
settlement permits the sanitized attempt publication required to preserve the
one-shot outcome.

No repair, implementation, dependency acquisition, construction, image build,
Docker action, transfer, runtime/result access, evidence promotion, external
communication, or standing authorization was used. Issue #43 remains the
active ordered item at contract-remediation scope.

Next: save the exact bounded Docker-free M2A-CGR01 through M2A-CGR03 contract-
remediation prompt and fresh independent re-review prompt; do not acquire npm,
construct a context or image, call Docker, or access runtime/result state.

M2-A construction/execution-gate contract-remediation prompt update
(2026-07-21): the exact bounded Docker-free M2A-CGR01 through M2A-CGR03
remediation prompt and fresh independent re-review prompt are saved before any
contract repair. They require one separately reviewed constructor-toolchain
receipt and complete canonical construction schema, exact offline Docker build
argv/layout/bounds and canonical image-binding packet, and one result-root-
bound write-ahead attempt checkpoint transaction. The checkpoint rule records
the next step as unknown before each Docker child and therefore preserves the
sanitized Inconclusive state without authorizing any post-unknown action.

No construction/execution-gate contract, implementation, verification,
acquisition, construction, image, Docker object, transfer, runtime/result,
historical, Expected, or `Observed` byte changed. No external communication or
standing authorization was used. Issue #43 remains the active ordered item at
contract-remediation scope.

Next: perform the exact bounded Docker-free M2A-CGR01 through M2A-CGR03
contract remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-remediation.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

M2-A construction/execution-gate contract-remediation update (2026-07-21):
the bounded Docker-free remediation is complete under the exact saved scope.
M2A-CGR01 now binds a separate not-yet-authorized Node/TypeScript toolchain
receipt, two exact private compiler processes, and the complete ordered
construction-manifest schema. M2A-CGR02 fixes the private credential-empty
build layout, five exact offline Docker argv arrays and bounds, complete
inspect projections, and canonical image-binding packet. M2A-CGR03 fixes the
result-root cwd and identity boundary plus a pessimistic write-ahead
`attempt.json` checkpoint before every Docker child; an unknown child close
permits no post-unknown action while preserving the already synced sanitized
Inconclusive checkpoint.

A repository-controlled in-memory audit reproduced the unchanged 31-row
`sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04`
and 41-row
`sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526`
aggregates. Focused Prettier checking passes for the contract, prompt pair, and
five status records; `git diff --check` exits `0`. This is contract-only
evidence. No dependency or toolchain byte was
acquired or read; no production constructor or compiler child, context, image,
Docker command, runtime/result state, transfer, evidence promotion, external
communication, or standing authorization was used. M2A-CGR01 through M2A-CGR03 and M2A-CG01
through M2A-CG06 remain open pending fresh independent re-review.

Next: perform the fresh independent Docker-free read-only M2A-CGR01 through
M2A-CGR03 contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-remediation-review.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

M2-A construction/execution-gate contract-remediation re-review update
(2026-07-21): the fresh independent Docker-free review closes M2A-CGR01 and
M2A-CGR02 at contract scope after reproducing the unchanged source identities,
fixed tuple, constructor/toolchain/construction schemas, and exact offline
build/image-binding packet. It performs no contract repair.

M2A-CGR03 remains open because the fixed plan's three distinct absence Docker
children share one canonical `absence-preflight` checkpoint step. The durable
prelaunch record therefore cannot identify whether the volume, initializer-
container, or measurement-container absence child became settlement-unknown.
M2A-CG01 through M2A-CG03 close at contract scope; M2A-CG04 through M2A-CG06
and all construction/runtime authority remain blocked. No acquisition,
construction, image, Docker action, runtime/result access, transfer, evidence
promotion, external communication, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-CGR03 absence-checkpoint identity
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, construct a context or image, call Docker, or access
runtime/result state.

M2-A absence-checkpoint identity remediation prompt update (2026-07-21): the
exact bounded Docker-free M2A-CGR03 remediation and fresh independent re-review
prompts are saved before contract repair. The next contract-only task must use
exact ordered identities `absence-volume`, `absence-initializer-container`,
and `absence-measurement-container`, each mapped one-to-one to its unchanged
fixed inspect argv. It must retain the current attempt schema, two compatible
issue codes, write-ahead publication, chronological first issue, and immutable
unknown-settlement checkpoint.

No contract, implementation, verification, acquisition, construction, image,
Docker object, runtime/result, historical, Expected, or `Observed` byte
changed. No external communication or standing authorization was used. Issue
#43 remains the active ordered item at the single M2A-CGR03 contract-
remediation scope.

Next: perform the exact bounded Docker-free M2A-CGR03 absence-checkpoint
identity contract remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

M2-A absence-checkpoint identity contract-remediation update (2026-07-21):
the bounded Docker-free M2A-CGR03 remediation is complete. The later production
plan now uses exact ordered identities `absence-volume`,
`absence-initializer-container`, and `absence-measurement-container`, each
derived from and bound one-to-one to its unchanged fixed inspect argv. The
generic production identity is rejected, and all three write-ahead
checkpoints, known failures, unknown settlements, prerequisite states, and
no-later-step contradictions are child-specific while the schema and two
issue codes remain unchanged.

M2A-CGR01/M2A-CGR02 and M2A-CG01 through M2A-CG03 remain closed at contract
scope. M2A-CGR03 and M2A-CG04 through M2A-CG06 remain open pending the saved
fresh independent re-review. A repository-controlled identity inspection
confirms the exact ordered one-to-one mapping; focused Prettier checking and
`git diff --check` pass. No test was required or run. This contract-only task
changed no
implementation, verification, acquisition, construction, image, Docker
object, runtime/result, historical, Expected, or `Observed` byte. No external
communication or standing authorization was used. Issue #43 remains the
active ordered item at M2A-CGR03 re-review scope.

Next: perform the fresh independent Docker-free read-only M2A-CGR03
absence-checkpoint identity remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation-review.md`;
do not acquire npm or toolchain bytes, construct a context or image, call
Docker, or access runtime/result state.

M2-A absence-checkpoint identity remediation re-review update (2026-07-21):
the fresh independent Docker-free review in
[`reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation.md`](reviews/m2-a-evidence-transfer-construction-execution-gate-absence-checkpoint-identity-remediation.md)
closes M2A-CGR03 with no new finding and preserves M2A-CGR01/M2A-CGR02.
Three exact ordered identities map one-to-one to the unchanged fixed absence
argv, the six known-failure/unknown checkpoints remain child-specific, and the
inverse identity, issue, prefix, state, later-action, and settlement
contradictions reject.

M2A-CG01 through M2A-CG06 are now closed only at contract scope. No contract or
implementation repair, acquisition, construction, image, Docker action,
runtime/result access, transfer, evidence promotion, external communication,
or standing authorization was used. Issue #43 remains the active ordered item
at prompt-first Docker-free static/unit implementation scope.

Next: save the exact bounded Docker-free construction/execution-gate
implementation prompt and fresh independent implementation-review prompt
before source changes; do not acquire npm or toolchain bytes, construct a
production context or image, call Docker, or access runtime/result state.

M2-A construction/execution-gate implementation prompt update (2026-07-21):
the exact bounded Docker-free implementation prompt and fresh independent
implementation-review prompt are now saved before any source change. They
preserve the unchanged M2A-CG06 allowlist and bind the later implementation to
both reviewed source aggregates, separate unperformed npm/toolchain inputs,
the deterministic constructor/manifest transaction, exact five-command
offline build and image binding, three child-specific absence checkpoints,
write-ahead no-post-unknown execution, fake-only inverse coverage, import
safety, and evidence-class non-promotion.

No implementation, verification, package script, Containerfile, manifest,
container source, adapter/probe source, fixture, scenario, acquisition,
construction, image, Docker object, runtime/result, historical, Expected, or
`Observed` byte changed. No fixed ignored root, external communication, or
standing authorization was used. M2A-CG01 through M2A-CG06 remain closed only
at contract scope, and issue #43 remains the active ordered item at bounded
Docker-free static/unit implementation scope.

Next: perform the exact bounded Docker-free construction/execution-gate
static/unit implementation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation.md`;
do not acquire npm or toolchain bytes, construct a production context or
image, call Docker, or access runtime/result state.

M2-A construction/execution-gate static/unit implementation update
(2026-07-21): the exact bounded Docker-free candidate is implemented within
the unchanged M2A-CG06 allowlist. Descriptor-only validators bind the reviewed
31-row source and 41-row construction aggregates, keep npm and toolchain
prerequisites separate and unperformed, and validate deterministic
construction, manifest, offline image, canonical binding, child-specific
write-ahead execution, and completion-first conditional transfer plans.
Fake-only inverse tests cover malformed structure, aggregate drift,
archive/toolchain/manifest contradictions, image binding changes, checkpoint
identity and settlement errors, and transfer-order violations.

`npm run m2a:transfer:verify` passes 1 file / 36 tests,
`npm run m2a:verify` passes 4 files / 5 tests, `npm run typecheck` passes, and
`npm test` passes 109 files / 839 tests. The aggregate `npm run check` stopped
at the pre-existing out-of-scope Prettier warning in
`containers/profile-control/test/control-host-backend.test.ts`; later stages
were not observed. Production entries fail closed before acquisition,
construction, image, Docker, runtime/result, or transfer activity. No evidence
was promoted, and no external communication or standing authorization was
used. M2A-CG01 through M2A-CG06 remain closed only at contract scope; the
implementation candidate awaits fresh independent review.

Next: perform the fresh independent Docker-free read-only implementation
review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-review.md`;
do not acquire npm or toolchain bytes, construct a production context or image,
call Docker, or access runtime/result state.

M2-A construction/execution-gate implementation review update (2026-07-21):
the fresh independent Docker-free review is `BLOCKED` on M2A-CGI01 through
M2A-CGI04. It independently reproduced the exact 31-row/41-row identities,
then reproduced acceptance of an unbound toolchain row, fake image-binding
publication without an exact candidate projection, and final fake runtime
publication with mismatched initializer exits and null segment/marker
validation payloads. The three fail-closed entries also lack fixed private
production authority implementations.

Focused transfer verification passes 1 file / 36 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 839 tests. Aggregate `check` stops at the pre-existing
out-of-scope M4 formatting warning. No source/test repair, production entry,
fixed ignored-root access, acquisition, construction, image, Docker,
runtime/result, evidence promotion, external communication, or standing
authorization was used. M2A-CG01 through M2A-CG06 remain open at implementation
scope, and later issue #43 gates remain frozen.

Next: save the exact bounded Docker-free M2A-CGI01 through M2A-CGI04
implementation-remediation prompt and fresh independent re-review prompt; do
not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

M2-A construction/execution-gate implementation-remediation prompt update
(2026-07-21): the exact bounded Docker-free M2A-CGI01 through M2A-CGI04
implementation-remediation prompt and fresh independent re-review prompt are
now saved before any remediation source or test change. The pair preserves the
unchanged M2A-CG06 allowlist and fixes the later remediation to exact
toolchain/context input closure, complete image observation-to-binding and
runtime terminal/artifact/candidate transactions, and fixed private production
authorities behind the still-closed entry gates.

No implementation, declaration, verification, package script, Containerfile,
manifest, container source, adapter/probe source, fixture, scenario,
acquisition, construction, image, Docker object, runtime/result, historical,
Expected, or `Observed` byte changed. No fixed ignored root, external
communication, or standing authorization was used. M2A-CGI01 through
M2A-CGI04 and M2A-CG01 through M2A-CG06 remain open at implementation scope,
and every later issue #43 gate remains frozen.

Next: perform the exact bounded Docker-free M2A-CGI01 through M2A-CGI04
implementation remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI01 through M2A-CGI04 implementation-remediation handoff

The bounded Docker-free remediation candidate is now implemented inside the
unchanged M2A-CG06 allowlist. M2A-CGI01's toolchain validator rejects every
row outside the exact four-family union, and the construction manifest now
consumes a privately branded correlation derived twice from the separately
validated npm archive, both settled compiler inventories, all fixed held
inputs, the deterministic fixture archive, and the complete held context
inventory. Extra, missing, reordered, aliased, sparse, unsettled, or
source-disconnected rows reject even when a caller recomputes its own
aggregate.

M2A-CGI02's fake build transaction now consumes exact terminal and value data
for all five commands, re-runs the complete image observation validator,
creates and revalidates the same canonical image-binding bytes, and records
publication only after a settled same-byte commit. M2A-CGI03's runtime
transaction now cross-binds wait/final exits, consumes copied bytes and fixed
metadata, runs completion/file/segment/marker/artifact/attempt/combined-
candidate validators in order, creates the marker parent only after completion
validation, and permits final candidate publication only after those barriers.
Unknown settlement leaves the durable checkpoint and reaches no later action.

M2A-CGI04 adds distinct private fixed constructor, image-build, and runtime
authorities behind the unchanged closed gates. Their constructors and brands
are absent from declarations and package scripts; reusable imports remain
side-effect-free. All future receipt/context/image digests remain `null`,
both build/runtime approvals remain `false`, and every
`evidenceReview` remains `not-performed`, so current entries fail before
authority creation or filesystem/process activity.

`npm run m2a:transfer:verify` passes its static verifier and 1 file / 37
tests, `npm run m2a:verify` passes 4 files / 5 tests, root typecheck passes,
and root tests pass 109 files / 840 tests. Aggregate `npm run check` exits 1
at the pre-existing
out-of-scope formatting warning in
`containers/profile-control/test/control-host-backend.test.ts` before its
lint/typecheck/test stages. These are Docker-free static/unit and
cooperative-host observations only. No production entry, acquisition,
compiler, construction, image build/inspect, Docker/runtime-socket action,
lifecycle/probe, transfer, fixed ignored-root or runtime/result access,
evidence promotion, external communication, or standing authorization was
used.

M2A-CGI01 through M2A-CGI04 and M2A-CG01 through M2A-CG06 remain open pending
the saved fresh independent Docker-free remediation re-review; no later
acquisition, construction, image, runtime, result, or evidence gate is opened.

Next: perform the fresh independent Docker-free read-only M2A-CGI01 through
M2A-CGI04 remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

M2-A construction/execution-gate implementation-remediation re-review update
(2026-07-21): the fresh independent Docker-free re-review in
`reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-remediation.md`
closes M2A-CGI01 but keeps M2A-CGI02 through M2A-CGI04 open. A known-invalid
first build terminal still reaches the later offline-build row; noncanonical
runtime validation/publication settlement tokens can publish final success;
and the private authorities do not yet enforce the complete receipt-bound
runtime inventory, per-phase compiler/build settlement, absolute final-close
bound, or held result/transfer identity transaction.

The review reproduced the exact 31-row/41-row identities, rejected the old
extra toolchain row, rejected the original null candidate, mismatched exits,
and null artifact payloads, and passed the positive combined candidate.
Focused verification passes 1 file / 37 tests, existing M2-A verification
passes 4 files / 5 tests, root typecheck passes, and root tests pass 109 files /
840 tests. Aggregate `check` stops at the pre-existing out-of-scope M4
formatting warning. No repair, production entry, fixed ignored-root access,
acquisition, construction, image, Docker, runtime/result, evidence promotion,
external communication, or standing authorization was used.

M2A-CGI02 through M2A-CGI04 and M2A-CG01 through M2A-CG06 remain open at
implementation scope; every later issue #43 gate remains frozen.

Next: save the exact bounded Docker-free M2A-CGI02 through M2A-CGI04 residual-
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, execute a production entry, construct a context or image,
call Docker, or access runtime/result state.

M2-A construction/execution-gate residual-remediation prompt update
(2026-07-21): the exact bounded M2A-CGI02 through M2A-CGI04 Docker-free
residual-remediation and fresh independent re-review prompts are saved before
source/test repair. The pair preserves closed M2A-CGI01 and the unchanged
M2A-CG06 allowlist while binding only immediate image-row validation, exact
runtime settlement branch shapes, complete constructor/process settlement,
and held result/transfer identity transactions.

No implementation, declaration, verification, acquisition, production entry,
construction, image, Docker, runtime/result, historical evidence, Expected,
or `Observed` byte changed. No fixed ignored root, external communication, or
standing authorization was used. M2A-CGI02 through M2A-CGI04 and M2A-CG01
through M2A-CG06 remain open at implementation scope; later issue #43 gates
remain frozen.

Next: perform the exact bounded Docker-free M2A-CGI02 through M2A-CGI04
residual remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

M2-A construction/execution-gate residual-remediation update (2026-07-21):
the bounded Docker-free M2A-CGI02 through M2A-CGI04 candidate is complete
inside the unchanged M2A-CG06 allowlist. Every image row validates before the
next action; publication and validation settlement records admit only exact
`settled`/`unknown` shapes; all fixed constructor/toolchain inputs are held
before output; compiler and Docker settlement has an exit-independent final
bound; and the runtime authority holds/checks result and transfer identities,
inventories, copied files, and attempt publication.

Focused verification passes 1 file / 42 tests, existing M2-A verification
passes 4 files / 5 tests, root typecheck passes, and root tests pass 109 files /
845 tests. Aggregate `check` exits at the pre-existing out-of-scope M4
formatting warning. No production entry, fixed ignored-root access,
acquisition, construction, image, Docker, lifecycle, transfer, runtime/result,
historical evidence, Expected, `Observed`, external communication, or standing
authorization was used. M2A-CGI01 remains closed; M2A-CGI02 through M2A-CGI04
and M2A-CG01 through M2A-CG06 remain open pending fresh re-review, and every
later issue #43 gate remains frozen.

Next: perform the fresh independent Docker-free read-only residual-remediation
re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

M2-A construction/execution-gate residual-remediation re-review update
(2026-07-21): the fresh independent Docker-free re-review in
`reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-residual-remediation.md`
preserves closed M2A-CGI01 and closes M2A-CGI02/M2A-CGI03. Independent
in-memory matrices reject every submitted row-local image and exact-settlement
contradiction before later action while retaining the canonical binding and
positive combined candidate.

M2A-CGI04 remains open on the smallest private-authority residual. The compiler
and Docker process helpers can overwrite an earlier error/exit cause with later
close data, and runtime inventory/publication/copy operations resolve paths
without correlating them to the held directory inode or exact full-mode/link
identity. Only M2A-CG01 closes at implementation scope; M2A-CG02 through
M2A-CG06 and every later issue #43 gate remain frozen.

Focused verification passes 1 file / 42 tests, existing M2-A verification
passes 4 files / 5 tests, root typecheck passes, and root tests pass 109 files /
845 tests. Aggregate `check` stops at the pre-existing out-of-scope M4
formatting warning. No source/test repair, production entry, fixed ignored-root
access, acquisition, construction, image, Docker, lifecycle, transfer,
runtime/result, evidence promotion, external communication, or standing
authorization was used.

Next: save the exact bounded Docker-free M2A-CGI04 private-authority residual-
remediation prompt and fresh independent re-review prompt; do not acquire npm
or toolchain bytes, execute a production entry, construct a context or image,
call Docker, or access runtime/result state.

M2-A construction/execution-gate M2A-CGI04 private-authority residual-
remediation prompt update (2026-07-21): the exact bounded Docker-free
implementation prompt and fresh independent re-review prompt are saved before
source/test repair. The pair preserves closed M2A-CGI01 through M2A-CGI03 and
M2A-CG01 while binding only first-cause compiler/Docker settlement and exact
held-directory/path transaction correlation inside a strict subset of the
unchanged M2A-CG06 allowlist.

No implementation, declaration, verification, acquisition, production entry,
construction, image, Docker, runtime/result, historical evidence, Expected, or
`Observed` byte changed. No fixed ignored root, external communication, or
standing authorization was used. M2A-CGI04 and M2A-CG02 through M2A-CG06
remain open at implementation scope; every later issue #43 gate remains
frozen.

Next: perform the exact bounded Docker-free M2A-CGI04 private-authority
residual remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

M2-A M2A-CGI04 private-authority residual-remediation update (2026-07-21):
the bounded Docker-free candidate now retains first process cause/exit/close
and correlates every runtime pathname operation to held BigInt directory and
child identity through exact operation-specific transitions. Fake-only process
and directory traces exercise both production decision boundaries without
production authority.

Focused transfer verification passes 1 file / 46 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 849 tests. Focused formatting and `git diff --check` pass;
aggregate `check` stops at the pre-existing out-of-scope M4 formatting warning.
No production entry, acquisition, compiler, construction, image, Docker,
lifecycle, transfer, runtime/result, evidence promotion, external
communication, or standing authorization was used.

Closed M2A-CGI01 through M2A-CGI03 and M2A-CG01 are preserved. M2A-CGI04 and
M2A-CG02 through M2A-CG06 remain open pending fresh independent re-review;
every later issue #43 gate remains frozen.

Next: perform the fresh independent Docker-free read-only M2A-CGI04 private-
authority residual-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-private-authority-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

M2-A M2A-CGI04 private-authority residual-remediation re-review update
(2026-07-21): the fresh Docker-free review closes the first-cause process and
held-parent/path replacement findings but remains `BLOCKED` on operation-
specific unchanged-child identity. Production transitions adopt the entire
post-operation child map without comparing stable siblings, and the fake trace
cannot submit that contradiction.

Focused transfer verification passes 1 file / 46 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Root tests
observed one out-of-scope M4 failure after 108 files / 848 tests passed;
aggregate `check` stops at the out-of-scope M4 formatting warning. No repair,
production entry, acquisition, compiler, construction, image, Docker,
lifecycle, transfer, runtime/result access, evidence promotion, external
communication, or standing authorization was used.

M2A-CGI01 through M2A-CGI03 and M2A-CG01 remain closed. M2A-CG02/M2A-CG03
close at Docker-free static/unit implementation scope; M2A-CGI04 and M2A-CG04
through M2A-CG06 remain open. Every later issue #43 gate remains frozen.

Next: save the exact bounded Docker-free M2A-CGI04 unchanged-child-identity
residual-remediation prompt and fresh independent re-review prompt; do not
repair source or tests in that prompt-only task.

## M2A-CGI04 unchanged-child-identity prompt handoff

The exact bounded Docker-free M2A-CGI04 unchanged-child-identity residual-
remediation prompt and fresh independent re-review prompt are now saved before
any source or test repair. The pair preserves M2A-CGI01 through M2A-CGI03 and
M2A-CG01 through M2A-CG03, and limits the later repair to full unchanged-child
identity preservation, fixed operation-specific add/rename/copy/nested-marker
deltas, hardlink-alias rejection, and matching fake-only behavioral traces
inside a strict four-path subset of the unchanged M2A-CG06 allowlist.

This prompt-only task changed no implementation, declaration, verification,
package script, lockfile, Containerfile, manifest, container source, adapter/
probe source, fixture, scenario, acquisition, construction, image, Docker
object, runtime/result, historical, Expected, or `Observed` byte. It did not
access a fixed ignored root, use external communication, or use standing
authorization. M2A-CGI04 and M2A-CG04 through M2A-CG06 remain open pending the
bounded remediation and fresh re-review; M2A-CG02/M2A-CG03 retain Docker-free
static/unit closure.

Next: perform the exact bounded Docker-free M2A-CGI04 unchanged-child-identity
residual remediation under
`../prompts/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation.md`;
do not repair any path outside its exact allowlist or perform acquisition,
construction, Docker, transfer, or runtime/result work.

## M2A-CGI04 unchanged-child-identity residual-remediation handoff

The bounded Docker-free candidate now validates every lexical directory entry
against one full child-identity record before any transition is accepted. The
same decision boundary is used by production and the separately branded fake
trace, and binds type, full mode, effective owner/group, link count, and BigInt
device, inode, size, and mtime while rejecting disconnected, reordered,
sparse, accessor, inherited, special, and cross-name alias data.

Six fixed operation kinds cover only `attempt.next` creation, exact-identity
rename/replacement into `attempt.json`, the fixed completion and segment copy
destinations, `probe-output/` creation, and the nested fixed marker. Every
unchanged sibling must remain fully identical. The nested marker transaction
validates both marker-parent addition and the transfer parent's inode-stable
`probe-output` size/mtime update before committing either held baseline.
Unknown nested-copy settlement marks both affected parents uncertain.

Focused transfer verification passes 1 file / 48 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 851 tests. Focused formatting and `git diff --check` pass.
The aggregate `npm run check` exits 1 at the pre-existing out-of-scope
formatting warning in
`containers/profile-control/test/control-host-backend.test.ts` before lint,
typecheck, or test stages. These observations remain Docker-free static/unit
and cooperative-host evidence only.

No production entry, fixed ignored-root access, acquisition, production
construction, image, Docker, lifecycle, transfer, runtime/result access,
evidence promotion, external communication, or standing authorization was
used. M2A-CGI01 through M2A-CGI03 and M2A-CG01 through M2A-CG03 remain closed
at their recorded scopes. M2A-CGI04 and M2A-CG04 through M2A-CG06 remain open
pending the saved fresh independent re-review; every later issue #43 gate
remains frozen.

Next: perform the fresh independent Docker-free read-only M2A-CGI04 unchanged-
child-identity residual-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-implementation-unchanged-child-identity-residual-remediation-review.md`;
do not acquire npm or toolchain bytes, execute a production entry, construct a
context or image, call Docker, or access runtime/result state.

## M2A-CGI04 unchanged-child-identity residual-remediation re-review

The fresh independent Docker-free re-review closes M2A-CGI04 and M2A-CG04
through M2A-CG06 at the static/unit cooperative-host implementation boundary.
M2A-CGI01 through M2A-CGI03 and M2A-CG01 through M2A-CG03 remain closed at
their recorded scopes. Exact fixed-operation, full child identity, hardlink-
alias, nested marker, pre-adoption, process-settlement, private-authority, and
evidence non-promotion boundaries were independently reproduced without
implementation or test repair.

Focused transfer verification passes 1 file / 48 tests, existing M2-A
verification passes 4 files / 5 tests, root typecheck passes, and root tests
pass 109 files / 851 tests. Aggregate `check` still stops at the pre-existing
out-of-scope M4 formatting warning. No production entry, fixed ignored-root
access, acquisition, construction, image, Docker, lifecycle, transfer,
runtime/result access, external communication, standing authorization, or
evidence promotion occurred.

Next: save the exact Docker-free issue #43 npm-acquisition/constructor-
toolchain input-boundary contract and fresh independent review prompt; do not
acquire or inspect those future bytes or perform construction, Docker,
transfer, or runtime/result work.

## M2-A dependency-input boundary contract handoff

The Docker-free proposal in
[`m2-a-evidence-transfer-dependency-input-boundary.md`](m2-a-evidence-transfer-dependency-input-boundary.md)
fixes M2A-IB01 through M2A-IB06: one separately authorized credential-empty
two-request npm transport, atomic canonical archive/receipt publication, one
separately gated offline Node/TypeScript toolchain capture, complete runtime/
package inventory publication, one-shot failure and evidence separation, and
only one later Docker-free static/unit implementation allowlist. The fresh
independent review prompt is saved at
[`prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-review.md`](../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-review.md).

No npm integrity, archive bytes or digest, runtime closure, installed package
bytes, inventory, receipt digest, or reviewed binding was observed or inferred.
No fixed ignored root, `/usr/bin/node` byte, environment, credential, home/
cache path, external communication, producer, construction, image, Docker,
runtime/result state, transfer, standing authorization, or evidence promotion
was accessed, executed, or changed. M2A-IB01 through M2A-IB06 remain open
pending fresh independent Docker-free contract review.

Next: perform the fresh independent Docker-free read-only dependency-input
boundary contract review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-review.md`;
do not acquire or inspect npm/toolchain bytes, use external communication,
execute either producer, construct a context or image, call Docker, or access
runtime/result state.

## M2-A dependency-input boundary contract review decision

The fresh independent Docker-free review in
[`reviews/m2-a-evidence-transfer-dependency-input-boundary.md`](reviews/m2-a-evidence-transfer-dependency-input-boundary.md)
reproduces the exact 31-row/41-row aggregates, fixed npm two-request boundary,
atomic acquisition transaction, four toolchain families, receipt schemas, and
null reviewed bindings. M2A-IB01/M2A-IB02 close at contract scope.

M2A-IB03 through M2A-IB06 remain blocked on M2A-IBR01 through M2A-IBR03. The
contract does not identity-bind complete package-directory and final copied-
tree traversals, records no durable occurrence before fallible toolchain
source checks, and cannot repair the existing construction validator that
accepts wrong row modes and an empty package row. No producer implementation
or execution gate is approved.

No fixed input root or future npm/toolchain byte was read; no external
communication, producer, construction, image, Docker, transfer, runtime/result
access, evidence promotion, or standing authorization was used.

Next: save the exact bounded Docker-free M2A-IBR01 through M2A-IBR03 contract-
remediation prompt and fresh independent re-review prompt; do not acquire or
inspect npm/toolchain bytes, execute either producer, construct a context or
image, call Docker, or access runtime/result state.

## M2-A dependency-input contract-remediation prompt handoff

The exact bounded Docker-free M2A-IBR01 through M2A-IBR03 contract-remediation
prompt and fresh independent re-review prompt are saved before contract repair.
They preserve M2A-IB01/M2A-IB02, the fixed generation and aggregates, null
reviewed bindings, external-acquisition gate, and evidence separation. Only
identity-bound complete source/destination traversal, a durable pre-source
toolchain checkpoint, and the exact two-path actual-consumer mode/size repair
may enter the later contract.

No implementation, producer, input, host runtime/package, construction,
image, Docker, transfer, runtime/result, evidence, Expected, or `Observed`
byte was accessed or changed. No fixed ignored root, external communication,
or standing authorization was used. Issue #43 remains the active ordered item;
M2A-IB03 through M2A-IB06 remain open pending the bounded remediation and
fresh re-review.

Next: perform the exact bounded Docker-free M2A-IBR01 through M2A-IBR03
contract remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-remediation.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## M2-A dependency-input contract remediation

The bounded Docker-free M2A-IBR01 through M2A-IBR03 remediation is complete.
The contract now fixes complete held-authority source/destination traversals,
the separate canonical toolchain-attempt-root `attempt.json` occurrence before
fallible source reads, and the exact two-path actual-constructor consumer
boundary for the selected mode/size rules. M2A-IB01/M2A-IB02 remain closed;
M2A-IB03 through M2A-IB06 remain open pending fresh independent re-review, and
every later issue remains frozen.

No implementation, producer, fixed input, host runtime/package, external
communication, construction, image, Docker, transfer, runtime/result,
evidence, Expected, or `Observed` byte was accessed or changed. Standing
authorization was not used.

Next: perform the fresh independent Docker-free read-only M2A-IBR01 through
M2A-IBR03 contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation-review.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## M2-A dependency-input contract-remediation re-review

The fresh independent Docker-free re-review in
[`reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation.md`](reviews/m2-a-evidence-transfer-dependency-input-boundary-remediation.md)
closes M2A-IBR01 and M2A-IBR03 at contract scope. The remediated source and
destination completeness transactions retain the same held authority, and the
later implementation allowlist now reaches only the actual constructor
validator/declaration required for the selected mode/size rules.

M2A-IBR02 remains open only on unknown initial attempt-root creation. If the
operation settles unknown while leaving the root absent, the contract's
generation-consuming decision is not durable and a fresh invocation can
establish both roots absent and start again. M2A-IB01/M2A-IB02 remain closed;
M2A-IB03 through M2A-IB06 remain open, and every later issue remains frozen.

No fixed input/root access, future npm/toolchain byte, host runtime/package
read, external communication, producer, construction, image, Docker/runtime,
transfer, result, evidence, Expected, `Observed`, or standing authorization
was used.

Next: save the exact bounded Docker-free M2A-IBR02 unknown-attempt-root-
creation durability remediation prompt and fresh independent re-review prompt;
do not repair the contract in that prompt-only task or access input,
construction, Docker, transfer, or runtime/result state.

## M2-A M2A-IBR02 unknown-attempt-root-creation durability prompt handoff

The exact bounded Docker-free residual M2A-IBR02 contract-remediation prompt
and fresh independent re-review prompt are saved before contract repair. The
later task is fixed to one synchronous exclusive attempt-root `mkdirSync`
commit boundary that cannot return settlement-unknown: absence before atomic
commit is never-started, while presence at or after commit is the durable
non-evidence occurrence that blocks every fresh invocation without opening
either fixed root.

No contract repair was performed, and no implementation, producer, input,
host runtime/package, construction, image, Docker, transfer, runtime/result,
evidence, Expected, or `Observed` byte was accessed or changed. No fixed
ignored root, external communication, or standing authorization was used.
M2A-IBR01/M2A-IBR03 remain closed; M2A-IBR02 and M2A-IB03 through M2A-IB06
remain open pending the bounded remediation and fresh re-review. Issue #43
remains the sole active ordered item and every later issue remains frozen.

Next: perform the exact bounded Docker-free residual M2A-IBR02 contract
remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md`;
do not acquire or inspect npm/toolchain bytes, execute either producer,
construct a context or image, call Docker, or access runtime/result state.

## M2-A M2A-IBR02 durability contract remediation

The bounded Docker-free dependency-input contract now fixes one synchronous,
non-recursive, exclusive mode-`0700` `mkdirSync` commit as the initial attempt-
root occurrence boundary and exposes no returned unknown-create outcome. A
known no-create error or before-commit process loss leaves a never-started
absent root; normal return or process loss at or after commit leaves the
durable non-evidence occurrence that blocks every fresh invocation without
inspection.

The existing post-commit checkpoint transaction and closed M2A-IBR01/
M2A-IBR03 boundaries remain unchanged. No implementation, producer, input,
host runtime/package, external communication, construction, image, Docker,
transfer, runtime/result, evidence, Expected, or `Observed` byte was accessed
or changed. No fixed ignored root or standing authorization was used.
M2A-IBR02 and M2A-IB03 through M2A-IB06 remain open pending fresh independent
re-review. Issue #43 remains the sole active ordered item and every later issue
remains frozen.

Next: perform the fresh independent Docker-free read-only residual M2A-IBR02
contract-remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation-review.md`;
do not repair the contract, acquire or inspect npm/toolchain bytes, execute
either producer, construct a context or image, call Docker, or access
runtime/result state.

## M2-A M2A-IBR02 durability contract-remediation re-review decision

The fresh independent Docker-free review in
[`reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md`](reviews/m2-a-evidence-transfer-dependency-input-boundary-unknown-attempt-root-creation-durability-remediation.md)
closes M2A-IBR02 with no new finding. The synchronous exclusive mode-`0700`
attempt-root `mkdirSync` commit exposes no returned unknown-create outcome:
absence before commit is never-started, while root presence at or after commit
is the durable non-evidence occurrence that blocks every fresh invocation
without inspection.

M2A-IB01 through M2A-IB06 and M2A-IBR01 through M2A-IBR03 are closed at
contract scope. The decision permits only the already fixed M2A-IB06
Docker-free static/unit implementation boundary after its exact prompt pair is
saved. It does not approve producer execution, input access, external
communication, construction, image build, Docker, transfer, result access, or
evidence promotion. Standing authorization was not used.

Next: save the exact bounded Docker-free dependency-input implementation prompt
and fresh independent review prompt under the existing M2A-IB06 allowlist; do
not change implementation or access input, external communication,
construction, Docker, transfer, or runtime/result state in that prompt-only
task.

## M2-A dependency-input implementation prompt handoff

The exact bounded Docker-free dependency-input implementation prompt is saved
at
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`,
and the fresh independent implementation-review prompt is saved at
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md`
before source changes. They preserve the closed contract/remediation chain and
limit the later task to the exact M2A-IB06 producer, validator, consumer,
fake-test, static-verification, prompt, and status allowlist.

No implementation, producer, fixed input, host runtime/package, external
communication, construction, image, Docker, transfer, runtime/result,
evidence, Expected, or `Observed` byte changed or was accessed. Standing
authorization was not used. Issue #43 remains the sole active ordered item,
with M2A-IB01 through M2A-IB06 closed only at contract scope; every later issue
remains frozen.

Next: perform the exact bounded Docker-free dependency-input static/unit
implementation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation.md`;
do not execute either producer or access input, external communication,
construction, Docker, transfer, or runtime/result state.

## M2-A dependency-input static/unit implementation handoff

The bounded Docker-free dependency-input implementation is complete under
M2A-IB06. Fixed producer authority, atomic acquisition publication, durable
pre-source attempt commit, held source/copy and destination completeness,
canonical receipts/checkpoints, actual constructor mode/size enforcement, and
fake-only inverse coverage are implemented without activating either
producer. Focused transfer verification passes 1 file / 56 tests, existing
M2-A verification passes 4 files / 5 tests, and root typecheck passes.
Aggregate root tests retain 40 out-of-scope failures; aggregate `check` stops
at eight pre-existing formatting warnings.

Issue #43 remains the sole active ordered item, now at fresh independent
Docker-free implementation review. No input, external communication,
construction, image, Docker, transfer, runtime/result, evidence, `Observed`,
or standing authorization was used; later issues remain frozen.

Next: perform the fresh independent Docker-free read-only dependency-input
implementation review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-review.md`;
do not repair implementation or execute either producer in that review.

## M2-A dependency-input implementation review decision

The fresh independent Docker-free review records `BLOCKED`. M2A-IB01,
M2A-IB02, M2A-IB04, and M2A-IB05 close at static/unit implementation scope.
M2A-IB03 and M2A-IB06 remain open on M2A-IBI01/M2A-IBI02. Production does not
correlate the synchronously committed attempt-root child through the same held
parent before later parent/root path reopens, while the fake claims explicit
open/correlate/sync steps. The focused suite also omits required runtime,
source-graph, and every-package-family mode/size inverse cases.

Issue #43 remains the sole active ordered item. No implementation/test repair,
producer import/execution, fixed input, external communication, construction,
image, Docker, transfer, runtime/result, evidence, `Observed`, or standing
authorization was used; later issues remain frozen.

Next: save the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation-remediation prompt and fresh independent re-review prompt; do
not repair implementation or tests in that prompt-only task.

## M2-A M2A-IBI remediation prompt handoff

The exact bounded Docker-free M2A-IBI01/M2A-IBI02 implementation-remediation
prompt is saved at
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`,
and its fresh independent re-review prompt is saved before source or test
repair. The pair preserves every closed contract and implementation decision
and fixes the later task to held attempt-parent/child correlation through
initial checkpoint settlement plus the missing behavioral runtime/source/
destination/every-package-family inverse matrix.

Issue #43 remains the sole active ordered item. No implementation,
declaration, test, verifier, producer import/execution, fixed input, host
runtime/package, external communication, construction, image, Docker,
transfer, runtime/result, evidence, Expected, or `Observed` byte changed or
was accessed. Standing authorization was not used; every later issue remains
frozen.

Next: perform the exact bounded Docker-free M2A-IBI01/M2A-IBI02
implementation remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`;
do not import or execute either producer, access input, use external
communication, construct an image, call Docker, or access runtime/result
state.

## M2-A M2A-IBI implementation-remediation re-review decision

The fresh independent Docker-free re-review in
`reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-remediation.md`
closes M2A-IBI02 but remains `BLOCKED` on residual M2A-IBI01. The branded fake
discards its parent-sync result before the shared transition receives literal
`parentSynced: true`, and attempt identity narrows BigInt size through
`Number`. M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain static/unit closure;
M2A-IB03/M2A-IB06 remain open.

Issue #43 remains the sole active ordered item. No implementation/test repair,
producer import/execution, fixed input, host runtime/package, external
communication, construction, image, Docker, transfer, runtime/result,
evidence, Expected, `Observed`, or standing authorization was used; every
later issue remains frozen.

Next: save the exact bounded Docker-free residual M2A-IBI01 parent-sync and
BigInt-identity remediation prompt plus fresh independent re-review prompt; do
not repair implementation or tests in that prompt-only task.

## M2-A residual M2A-IBI01 remediation prompt handoff

The exact bounded Docker-free residual-remediation and fresh independent
re-review prompt pair is saved before source or test repair. It limits the
later task to the dependency-input support/declaration, static verifier,
focused test, and minimal status allowlists and binds exact parent-sync data
plus non-narrowed BigInt-derived attempt identity.

Issue #43 remains the sole active ordered item. No implementation/test byte,
producer, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, evidence, Expected, or
`Observed` byte changed. Standing authorization was not used; every later issue
remains frozen. M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

Next: perform the exact bounded Docker-free residual M2A-IBI01 remediation
under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation.md`;
do not import or execute either producer, access input, use external
communication, construct an image, call Docker, or access runtime/result
state.

## M2-A residual M2A-IBI01 remediation handoff

The bounded Docker-free candidate now carries one exact-own-data parent-sync
fact and canonical BigInt-derived device/inode/size/mtime identity through the
shared production/fake transition. Focused transfer verification passes 1 file
/ 61 tests, existing M2-A verification passes 4 files / 5 tests, and root
typecheck passes. M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain
reviewed static/unit closure; M2A-IBI01/M2A-IB03/M2A-IB06 remain open pending
fresh independent re-review.

Issue #43 remains the sole active ordered item. No producer import/execution,
fixed input, host runtime/package, external communication, construction,
image, Docker, transfer, runtime/result, evidence, Expected, `Observed`, or
standing authorization was used; every later issue remains frozen.

Next: perform the fresh independent Docker-free read-only residual M2A-IBI01
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-residual-remediation-review.md`;
do not repair implementation or tests or execute either producer in that
review.

## M2-A residual M2A-IBI01 remediation re-review

The fresh independent Docker-free re-review is `BLOCKED` only on the remaining
identity verification boundary. Current production/fake parent-sync flow and
canonical BigInt-derived device/inode/size/mtime source close the original
semantic defects, but focused behavior does not submit exact-key-shape attempt
identities and static verification protects only size rather than all four
production encodings. M2A-IBI02 and M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05
retain static/unit closure; M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

Issue #43 remains the sole active ordered item. No source/test repair, producer
import/execution, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, evidence, Expected,
`Observed`, or standing authorization was used; every later issue remains
frozen.

Next: save the exact bounded Docker-free M2A-IBI01 identity-shape/static-
verifier remediation prompt and fresh independent re-review prompt; do not
repair source or tests in that prompt-only task.

## M2-A M2A-IBI01 identity-verification prompt handoff

The exact bounded Docker-free M2A-IBI01 identity-verification remediation and
fresh independent re-review prompt pair is saved before verifier or focused-
test repair. The later task may change only the static verifier, focused test,
and minimal status allowlist. It must close only the missing attempt-identity
exact-key-shape behavior and incomplete four-field production encoding guard.

Issue #43 remains the sole active ordered item. No implementation,
declaration, verifier, test, producer, fixed input, host runtime/package,
external communication, construction, image, Docker, transfer, runtime/result,
evidence, Expected, or `Observed` byte changed. Standing authorization was not
used; every later issue remains frozen. M2A-IBI02 and
M2A-IB01/M2A-IB02/M2A-IB04/M2A-IB05 retain reviewed static/unit closure;
M2A-IBI01/M2A-IB03/M2A-IB06 remain open.

Next: perform the exact bounded Docker-free M2A-IBI01 identity-verification
remediation under
`../prompts/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md`;
do not edit the support source/declaration, import or execute either producer,
access input, use external communication, construct an image, call Docker, or
access runtime/result state.

## M2-A M2A-IBI01 identity-verification remediation handoff

The bounded Docker-free candidate now covers all seven missing exact-key-shape
attempt identities and all four BigInt-derived production encoding guards.
Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests retain 39 out-of-scope failures, and aggregate `check` stops at
eight pre-existing formatting warnings.

Issue #43 remains the sole active ordered item. The reviewed support/
declaration, parent-sync edge, M2A-IBI02 matrix, null reviewed construction
bindings, false execution approvals, and candidate/evidence separation remain
unchanged. M2A-IBI01/M2A-IB03/M2A-IB06 remain open pending fresh independent
re-review. No producer, fixed input, host runtime/package, external
communication, construction, image, Docker, transfer, runtime/result,
evidence, Expected, `Observed`, or standing authorization was used; every
later issue remains frozen.

Next: perform the fresh independent Docker-free read-only M2A-IBI01 identity-
verification remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation-review.md`;
do not repair source/tests or execute either producer in that review.

## M2-A M2A-IBI01 identity-verification remediation re-review

The fresh independent Docker-free read-only re-review is `APPROVED` at
static/unit cooperative-host implementation scope. It reproduces all seven
malformed attempt-identity exact-key-shape terminals with no accessor/Proxy
attacker-hook invocation and the exact retained pre-checkpoint/pre-runtime
trace. Static verification binds device/inode/size/mtime production encodings
against direct `Number` narrowing while preserving focused behavior,
parent-sync reachability, producer import exclusion, and closed construction
reachability.

Issue #43 remains the sole active ordered item. M2A-IBI01/M2A-IBI02 and
M2A-IB01 through M2A-IB06 are closed at Docker-free static/unit implementation
scope. The reviewed support/declaration, parent-sync edge, null construction
bindings, false execution approvals, and candidate/evidence separation remain
unchanged.

No producer, fixed input, host runtime/package, external communication,
construction, image, Docker, transfer, runtime/result, evidence, Expected,
`Observed`, or standing authorization was used; every later issue remains
frozen.

Next: save the exact bounded npm-acquisition producer-execution contract and
fresh independent review prompt; do not execute the producer, access fixed
input, or use external communication in that prompt-only task.

## M2-A npm-acquisition producer execution-gate contract handoff

The Docker-free proposal in
[`m2-a-evidence-transfer-npm-acquisition-execution-gate.md`](m2-a-evidence-transfer-npm-acquisition-execution-gate.md)
fixes M2A-NG01 through M2A-NG06: exact current three-file executable identity,
credential-empty two-request HTTPS, root-first durable one-shot publication,
bounded process settlement, a separate read-only candidate review, and an
explicit-human external-communication boundary. Its fresh review prompt is
saved before any occurrence.

Issue #43 remains the sole active ordered item. M2A-NG01 through M2A-NG06
remain open pending fresh independent Docker-free review. No producer, fixed
root, host environment/runtime, external communication, npm candidate,
construction, image, Docker, transfer, runtime/result, evidence, Expected,
`Observed`, or standing authorization was used; every later issue remains
frozen.

Next: perform the fresh independent Docker-free read-only M2A-NG01 through
M2A-NG06 contract review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-review.md`;
do not execute or import the producer, access the fixed acquisition root or
host environment/runtime, or use external communication.

## M2-A npm-acquisition producer execution-gate contract review

The fresh independent Docker-free read-only review is `BLOCKED` on
M2A-NGR01/M2A-NGR02. The producer entry does not bind the contract's exact
executable/script argv pair, and the acquisition-root one-link directory claim
does not match production's positive-link-count check.
M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 close at contract scope;
M2A-NG01/M2A-NG03 remain open.

Issue #43 remains the sole active ordered item. The exact source aggregate,
two-request direction, retained root-first transaction, process/result
separation, and explicit-human authority were reproduced. Focused transfer
verification passes 1 file / 62 tests. No producer, fixed root, host
environment/runtime, external communication, npm candidate, construction,
Docker, runtime/result, evidence, Expected, `Observed`, or standing
authorization was used; every later issue remains frozen.

Next: save the exact bounded Docker-free M2A-NGR01/M2A-NGR02
contract-remediation prompt and fresh independent re-review prompt; do not
repair contract/source/tests or execute the producer in that prompt-only task.

## M2-A M2A-NGR01/M2A-NGR02 remediation prompt handoff

The exact bounded Docker-free remediation and fresh independent re-review
prompt pair is saved before contract, acquisition-entry, verifier, or focused-
test repair. The later task binds the exact lexical host command separately
from Node's canonical process-observable executable/argv/cwd/empty-environment
guard and aligns the acquisition-root directory with production's positive-
link-count predicate while retaining exact-one archive/receipt files.

Issue #43 remains the sole active ordered item. Only the saved prompt pair and
minimal status records changed. No execution-gate requirement, implementation,
verifier, test, producer, fixed root, host environment/runtime, external
communication, npm candidate, construction, Docker, runtime/result, evidence,
Expected, `Observed`, or standing authorization changed or was used; every
later issue remains frozen. M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 retain
contract-scope closure; M2A-NG01/M2A-NG03 remain open.

Next: perform the exact bounded Docker-free M2A-NGR01/M2A-NGR02 remediation
under
`../prompts/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation.md`;
do not import or execute the producer, access fixed or host runtime state, or
use external communication.

## M2-A M2A-NGR01/M2A-NGR02 remediation handoff

The bounded Docker-free candidate now separates the reviewed lexical host
command from exact canonical Node executable/argv/cwd/empty-environment state
checked before producer reachability and aligns the acquisition-root directory
with production's positive-link-count predicate while preserving exact-one
publication files. Function-scoped static weakening cases cover both repairs.
The fresh three-file aggregate is
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.

Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests retain 99 passing / 10 failing files and 826 passing / 39 failing
tests; aggregate `check` stops at eight pre-existing formatting warnings.
M2A-NG01/M2A-NG03 remain open pending fresh independent re-review;
M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 retain contract-scope closure.

No producer, fixed root, host runtime, external communication, npm candidate,
construction, Docker, runtime/result, evidence, Expected, or `Observed`
boundary was used. Standing authorization was not used. Issue #43 remains the
sole active ordered item; every later issue remains frozen.

Next: perform the fresh independent Docker-free read-only M2A-NGR01/M2A-NGR02
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation-review.md`;
do not repair source/tests, execute the producer, access fixed or host runtime
state, or use external communication.

## M2-A M2A-NGR01/M2A-NGR02 remediation re-review

The fresh independent Docker-free read-only re-review is `APPROVED` at
contract/static entry-guard scope. Complementary exact lexical-host/
canonical-Node authority closes M2A-NGR01/M2A-NG01, while positive
acquisition-root directory links and exact-one publication files close
M2A-NGR02/M2A-NG03. M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 retain closure, so
all six M2A-NG items are complete only at contract scope.

Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests retain 99 passing / 10 failing files and 826 passing / 39 failing
tests. Issue #43 remains the sole active ordered item. No producer, fixed
root, host runtime, external communication, npm candidate, construction,
Docker, runtime/result, evidence, Expected, or `Observed` boundary was used.
Standing authorization was not used and cannot authorize the external
occurrence; every later issue remains frozen.

Next: save the exact adjacent-preflight/one-occurrence execution prompt and
separate Docker-free fixed-root result-review prompt; do not execute the
producer, access fixed or host runtime state, or use external communication in
that prompt-only task.

## M2-A npm-acquisition one-occurrence/result-review prompt handoff

The immutable pre-authority prompt pair is now saved:

- `../prompts/m2-a-evidence-transfer-npm-acquisition-execution.md` — 12,829
  bytes, SHA-256
  `cab8482f8ace0b3ad1460e95b1419965a92bd3e00e2ebd501b5e8f82757b0d8f`
- `../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md`
  — 13,241 bytes, SHA-256
  `a62a49b16a94bcd75a289e8b6da97eba6cb2e1973f893fa60c013fb5a856aa8b`

The execution prompt requires explicit human authority for all four M2A-NG06
effects before its final adjacent full-byte/hash preflight and at-most-one
direct `shell: false` occurrence. It forbids fixed-root inspection and every
retry. The separate result-review prompt requires the exact bounded occurrence
handoff and restricts later Docker-free inspection to the fixed root and
recognized children with no-follow bounded reads.

No producer, fixed root, host runtime, external communication, npm candidate,
construction, Docker, runtime/result, evidence, Expected, or `Observed`
boundary was used. Standing authorization was not used and cannot authorize
this external occurrence. Issue #43 remains the sole active ordered item and
every later issue remains frozen.

Next: a person must freshly review the exact prompt pair and explicitly
authorize normal DNS plus the two fixed HTTPS requests, exclusive retained
fixed-root side effects, one generation-consuming no-retry occurrence, and the
later separate fixed-root review before execution can begin.

## M2-A npm-acquisition explicit authorization handoff

The current repository user explicitly replied `承認します。` after being
shown both exact prompt identities and all four M2A-NG06 effects. The bounded
authorization record is
[`reviews/m2-a-evidence-transfer-npm-acquisition-execution-authorization.md`](reviews/m2-a-evidence-transfer-npm-acquisition-execution-authorization.md).
It authorizes at most one eligible occurrence under execution-prompt SHA-256
`cab8482f8ace0b3ad1460e95b1419965a92bd3e00e2ebd501b5e8f82757b0d8f`,
including exactly two reviewed HTTPS GET requests, the sole fixed-root retained
side effect, generation consumption with no retry, and the later separately
saved read-only result review.

This is direct human authorization, not continuing-work standing
authorization, a result, or evidence. No producer, fixed root, host runtime,
DNS, HTTPS, npm candidate, construction, Docker, runtime/result, Expected, or
`Observed` boundary was accessed while recording it.

Next: execute the exact authorized adjacent-preflight/one-occurrence task under
`../prompts/m2-a-evidence-transfer-npm-acquisition-execution.md`; do not inspect
the fixed root in the execution session or retry.

## M2-A npm-acquisition one-occurrence handoff

The fresh worker reproduced the authorized execution/result-review prompt
hashes, exact three-file producer identities and aggregate, static
import/call/request/publication/process boundaries, unchanged construction and
evidence sentinels, and `npm run m2a:transfer:verify` with 1 file / 62 tests.
The uninterrupted final full-byte/hash preflight then passed immediately
before one direct empty-environment `shell: false` occurrence.

The process settled naturally with exit `1`, no signal, empty stdout, and the
exact fixed 29-byte `M2A_INPUT_ACQUISITION_FAILED\n` stderr line. The
authoritative handoff is
[`reviews/m2-a-evidence-transfer-npm-acquisition-execution.md`](reviews/m2-a-evidence-transfer-npm-acquisition-execution.md).
Generation `20260721-01` is exhausted without retry. The worker did not inspect
or classify the fixed root, so retained state and candidate disposition remain
unknown. Direct human authorization, not continuing-work standing
authorization, authorized the external occurrence. Construction bindings,
runtime approval, evidence review, Expected, and `Observed` remain unchanged.

Next: perform the fresh independent Docker-free fixed-root result review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md`;
do not run either producer, communicate externally, repair or retry the
occurrence, or update construction bindings.

## M2-A npm-acquisition exhausted-generation result review

The fresh independent Docker-free review in
[`reviews/m2-a-evidence-transfer-npm-acquisition-result.md`](reviews/m2-a-evidence-transfer-npm-acquisition-result.md)
reproduces the exact prompt pair, three-file producer aggregate, authoritative
one-occurrence failure projection, unchanged construction/evidence sentinels,
and focused static/unit boundary. Its fixed-path no-follow inspector found the
acquisition root as a stable effective-user-owned mode-`0700` directory with
positive stable links, known close, and an empty inventory.

The empty root is retained partial state after issuance. The candidate
decision is therefore `INCONCLUSIVE`; no archive, canonical receipt, registry
SRI, accepted input identity, construction binding, runtime result, or
`Observed` evidence exists. Generation `20260721-01` is exhausted and was not
retried, repaired, cleaned up, or reinterpreted.

Issue #43 closes only at this reviewed Inconclusive npm-acquisition boundary.
Issue #54 becomes the sole active ordered item. Standing authorization was not
used for this review; the earlier external occurrence remains attributed only
to its recorded direct human authorization.

Next: begin issue #54 with one Docker-free fresh-generation selected-Vite
contract and fresh independent contract-review prompt; do not implement or
execute that generation in the contract task.

## Issue #54 `20260723-01` init/reaping contract handoff

The Docker-free contract in
[`p2-vite-init-reaper-contract.md`](p2-vite-init-reaper-contract.md) reserves
one sixth selected-Vite generation. It proposes one literal Vite-only Docker
`--init` create option and requires both applicable owned-container inspections
to bind literal `HostConfig.Init=true`. No custom init path, image, command,
mount, network, timeout, progress transition, or capability expectation is
added or changed.

The fifth attempt's durable `exit-0`, post-close residue, accepted force
delivery, and unresolved group/container/runner settlement remain immutable
Inconclusive evidence. The contract classifies possible orphan reaping only as
a design hypothesis and keeps detected residue on the existing child-failure
path even if bounded force and later reaping establish absence.

The exact current-task and fresh independent review prompts are
[`../prompts/p2-vite-init-reaper-contract.md`](../prompts/p2-vite-init-reaper-contract.md)
and
[`../prompts/reviews/p2-vite-init-reaper-contract-review.md`](../prompts/reviews/p2-vite-init-reaper-contract-review.md).
No implementation, staging, Docker, result-root access, Expected/Observed
change, or historical evidence mutation occurred. Standing authorization was
not used because no execution or approval gate was reached.

Next: perform the fresh independent Docker-free contract review under
`../prompts/reviews/p2-vite-init-reaper-contract-review.md`; do not implement,
stage, execute, or access result roots in that review.

## Issue #54 `20260723-01` init/reaping contract review

The fresh independent Docker-free review in
[`reviews/p2-vite-init-reaper-contract.md`](reviews/p2-vite-init-reaper-contract.md)
is `APPROVED` for one bounded implementation/static-unit task with no blocking
or non-blocking finding. It independently reproduces the tracked five-attempt
projection, current no-init/five-field source boundary, exact new identity
tuple, Vite-only create flag, literal-true created/final inspect requirement,
and unchanged process-group, transfer, evidence, receipt, permissive-first,
same-image, trust-marker, and no-retry gates.

The fifth attempt remains immutable Inconclusive evidence and proves neither a
zombie nor a reaping cause. Configured init remains static intent; daemon
support, subreaping, future group absence, implementation correctness, and
capability outcomes remain unobserved. No implementation, staging, Docker,
result-root access, Expected/Observed change, historical evidence mutation,
presentation projection, or standing authorization was used.

Next: implement the approved `20260723-01` Vite-only `--init` and six-field
inspect binding with focused Docker-free regressions, then rebuild only the
fixed Vite staging candidate; do not call Docker or access result roots.

## Issue #54 `20260723-01` init/reaping implementation handoff

The exact bounded Docker-free candidate is implemented. Selected Vite alone
uses one literal `--init` before `--name`; the six-field owned-container
inspect binds only literal `HostConfig.Init=true` at created and final state.
The plan, M2-D context, runner, projection, executor, and tests accept only the
new Expected/run/container tuple. All historical generations remain rejected,
both codegen create arrays remain unchanged, and post-close residue still
cannot become child success after later group absence.

Focused P2 verification passed 4 files / 77 tests, focused M2-D context
verification passed 1 file / 19 tests, P2 verification passed 9 files / 122
tests, and P2 build/import checks passed. M2-D typecheck/build/static passed;
the full test phase then observed 23 `M2D_VERSION_MISMATCH` failures because
host Node `v22.23.1` differs from fixed Node `v20.18.2`, with 9 files / 60
tests passing. No fixed version was weakened.

The already reviewed exact staging action used
`continue-repository-work` standing authorization, not a separate human
review. It preserved the prior ignored tree and rebuilt exactly 128
source-equal fixed-mode Vite files with plan-order manifest
`8803f5b5cec7dedb2168a03087f9e574f1d380e81602ebc2c8d722783859bd20`.
No Docker, runtime/result access, Expected event-value change, `Observed`
promotion, historical evidence mutation, or external communication occurred.

Next: perform the fresh independent Docker-free read-only implementation and
execution-gate review under
`../prompts/reviews/p2-vite-init-reaper-implementation-review.md`; do not
repair source/tests, call Docker, execute the pair, or access historical
result roots.

## Issue #54 `20260723-01` init/reaping implementation/execution-gate review

The fresh independent Docker-free review in
[`reviews/p2-vite-init-reaper-implementation.md`](reviews/p2-vite-init-reaper-implementation.md)
is `APPROVED` with no blocking or non-blocking finding. It reproduced the ten
fixed candidate identities, two unchanged codegen arrays, exact 128-file
source-equal fixed-mode Vite staging manifest `8803f5b5...`, fixed tool
versions, compiled import safety, and absence of only the two exact new roots.
Focused P2 and M2-D context tests, full P2 verification, and P2 build passed.

The optional full M2-D command again passed typecheck/build/static before
exiting 1 on the unchanged fixed-version boundary: host Node `v22.23.1` versus
contract Node `v20.18.2`, 23 `M2D_VERSION_MISMATCH` failures, and 9 files / 60
tests passed. No contract value was changed.

The review preserves configured init as intent, post-close residue as child
failure, every settlement/transfer/evidence/receipt predicate,
permissive-first order, same-image pairing, cooperative trust, and no retry.
It ran no Docker, accessed no result root or retained history, and created no
runtime evidence. Standing authorization was not used in the review.

Next: in a fresh worker, revalidate the approved hashes, exact staging, fixed
argument-free script, and only the two exact new-root absences, then invoke
`npm run p2:execute:vite` at most once under standing authorization; do not
retry.

## Issue #54 `20260723-01` init/reaping exact one-shot execution

The fresh worker reproduced all ten approved hashes, the exact 128-file
source-equal regular non-symlink staging tree and
`8803f5b5cec7dedb2168a03087f9e574f1d380e81602ebc2c8d722783859bd20`
manifest, fixed Vite/Rollup/esbuild versions, the fixed argument-free script,
and absence of only the two exact new roots. It then used
`continue-repository-work` standing authorization for exactly one
`npm run p2:execute:vite` invocation. This was not a separate human review.

The command exited 0 and was not retried. Its 684-byte bounded direct stdout,
SHA-256
`683b78cd5f181e083657c76382eb94612ccdb989cea1bc8efe6075d9b6997aac`,
reports `p2-vite-pair/v4`, exact revision `20260723-01`, `same-image`, the
fixed image ID, cooperative progress trust, and no pair issue. Both exact
members report complete attempts, inspected evidence, written receipts,
`matches-expected`, and no issue.

This direct projection is an unreviewed candidate result. The worker did not
access or classify either new result root after execution, inspect historical
retained state, accept a receipt, update selected-Vite or experiment-matrix
`Observed`, change Expected values, or update the presentation projection. The
occurrence is exhausted with no retry.

Next: perform the fresh independent Docker-free fixed-root result review under
`../prompts/reviews/p2-vite-init-reaper-result-review.md`; do not rerun,
repair, call Docker, or access historical result roots.

## Issue #54 `20260723-01` init/reaping fixed-root result review

The fresh independent Docker-free review in
[`reviews/p2-vite-init-reaper-result.md`](reviews/p2-vite-init-reaper-result.md)
is `ACCEPTED` with no finding. It reproduced the approved candidate, exact
staging, fixed roots, both canonical attempts and receipts, the valid-terminal
progress projections, same-image pair, and exact 684-byte stdout without
Docker, retry, repair, or historical-root access.

Selected Vite is accepted only at the exact one-local-pair scope. The five
earlier Inconclusive attempts remain immutable, configured init is not a
demonstrated cause, the cooperative progress and constrained-child limitations
remain explicit, and neither Expected values nor `experiment-matrix.md`
changed. Issue #54 is complete in the local repository ledger.

Next: none.
