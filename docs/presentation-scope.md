# TSKaigi Sendai 2026 presentation MVP

Status: **complete; P4 focused final review approved**

Decision date: 2026-07-18

Related decision: [ADR-0002](decisions/0002-prioritize-presentation-mvp.md)

P0 scope/workflow pivot status: **complete and root-verified**. The P1
[evidence inventory](presentation-evidence-inventory.md) and its
[independent review](reviews/presentation-evidence-inventory.md) are complete;
the gate is approved with no findings. The Docker-non-executing P2
[codegen binding and fixed-runner contract](p2-selected-profile-contract.md) is
complete, and its non-executing Docker create plan has static/unit coverage. The
codegen exact context, separated bindings, sanitized projection, fixed runner,
and exact staging assembly now have static/unit coverage. Its focused
non-executing review resolved one child-denial normalization finding and approved
minimal executor implementation. Its
[fresh independent read-only review](reviews/p2-selected-profile-executor.md)
blocked execution on P2-B01 through P2-B04. A Docker-non-executing remediation
now validates ownership and the created state before start, bounds post-signal
settlement, bounds event reads before allocation, and retains a pair-level
same-image projection. A fresh independent read-only re-review closed all four
findings with no new blocker and approved only the exact one-shot codegen
execution gate. That one-shot codegen pair has now completed with a same-image
projection and two `matches-expected` receipts. A
[fresh independent Docker-free receipt review](reviews/p2-selected-profile-codegen-receipts.md)
reproduced their canonical bytes, raw-event projections, identities, same-image
binding, unchanged source hashes, counts, attempt outcomes, and bounded output
inventory and accepted them as selected codegen profile Observed. The Vite pair
and experiment-matrix Observed remain unmeasured, but the exact Vite selected
context, separated runtime bindings, bounded sanitized projection, explicit
constrained-child limitation, fixed runner, and exact staging assembly now have
static/unit coverage. A fresh focused Docker-non-executing review accepted their
fixed inputs and constrained-child limitation but blocked executor implementation
on P2-V01. Its Docker-non-executing remediation now preserves first failure and
explicit settlement state, suppresses loopback/evidence cleanup while settlement
is unknown, bounds known-safe server close, and behaviorally covers the process
and server lifecycle. A fresh independent re-review closed P2-V01 but blocked
executor implementation on P2-V03: a successful coordinator close followed by
force-settled process residue can still be accepted as runner success. The
focused Docker-non-executing remediation now retains that residue as a known
run-invalidating failure after bounded settlement, and its behavioral regression
proves output verification is skipped. Another fresh independent re-review
closed P2-V03 with no new blocker and approved minimal Vite executor
implementation. That executor is now implemented and statically verified with
fixed ownership/state transitions, bounded Docker CLI settlement, bounded
event reads, same-image pair binding, and preservation of the runner's
settlement-unknown cleanup barrier. Its
[fresh independent Docker-non-executing review](reviews/p2-selected-profile-vite-executor.md)
found no new blocker and approved only the exact one-shot Vite execution gate;
that gate was then used exactly once under the `continue-repository-work`
standing authorization, not a separate human review. The command exited 1 with
only the bounded `P2_EXECUTOR_FAILED` entry result. The permissive result root
contains container-owned event/direct-write files but no host-readable canonical
receipt; the constrained root was not created. No retry or other Docker command
was used, and neither Vite scenario is selected profile Observed. A
[fresh Docker-free failure review](reviews/p2-selected-profile-vite-failure.md)
classified the pair attempt Inconclusive and found P2-V04: receipt assembly can
traverse deliberately unavailable container-owned evidence and discard the
only sanitized lifecycle disposition before writing a canonical attempt record.
The retained attempt cannot be safely recovered inside a Docker-free read-only
boundary. The bounded Docker-non-executing P2-V04 remediation now persists a
separate canonical attempt record before host evidence access, represents
unavailable output as `not-inspected`, defers runner verification/export until
child and server settlement are known, and exposes only the fixed successful
event/entry paths with reviewed modes. Focused behavioral tests and full P2
static verification pass, but a
[fresh independent Docker-non-executing re-review](reviews/p2-selected-profile-vite-failure.md)
keeps P2-V04 open on P2-V05 and P2-V06. Later start/framing failures discard
already-inspected image/exit fields, and concurrent production evidence reads
can be reported as `not-inspected` after partial access; the real fixed-path
export/read boundary also lacks Docker-free behavioral coverage. The bounded
non-executing remediation now retains each established lifecycle field,
preflights all fixed-path metadata/modes before event open, explicitly reports
post-open failure as `partially-inspected`, and connects the real runner export
and executor reader in a Docker-free filesystem regression. Focused and full P2
static verification pass. A fresh independent re-review closes P2-V06, but
keeps P2-V05 open because a valid final exited inspect was stored only after the
image/start-exit cross-check. The bounded residual remediation now snapshots
that exit outcome immediately after exited-state validation and fake-command
regressions preserve the exact created image/final exit fields across both
exit-code and image mismatch. A fresh independent Docker-non-executing
re-review reproduces those transitions and the exact staging identity, finds no
new blocker, closes P2-V05, and therefore closes parent P2-V04 after the prior
P2-V06 closure. The exhausted attempt remains Inconclusive and non-retryable.
The fixed `20260719-02` Vite run IDs and distinct container names are now bound
through the active context, plan, runner, projection, and executor with
Docker-free focused coverage. Exact 128-file staging was rebuilt with candidate
manifest `96e81f81...`. A
[fresh independent Docker-non-executing gate review](reviews/p2-selected-profile-vite-new-run-gate.md)
reproduced the candidate identity and found no blocker, approving only one
argument-free `npm run p2:execute:vite` pair attempt with no retry. A fresh
worker reproduced every approved identity and both absent roots, then used the
`continue-repository-work` standing authorization for that exact command once;
this was not a separate human review. The command exited 1 with a bounded
Inconclusive projection. Only the permissive root was created; it contains a
canonical Inconclusive attempt record, no receipt, and `not-inspected` output.
The constrained root remains absent, the pair was not retried, and neither Vite
scenario is selected-profile Observed. A fresh Docker-free read-only review
reproduced the exact canonical attempt, all approved source identities, the
bounded projection, and fixed root states, and accepted the exhausted attempt
only as Inconclusive. The Vite P2 slice is closed with that explicit gap; no
retry or runtime recovery remains. The Docker-free P3
[minimal artifact demo](p3-artifact-demo.md) is now implemented with a fixed
source/lockfile, empty-environment one-build child, canonical receipt,
separate-directory verify/copy, and one-byte rejection. Focused static/unit
tests pass, and a fresh independent Docker-free gate review reproduced the
fixed candidate with no blocker. A fresh worker revalidated that approved
snapshot and absent exact root, then used standing authorization for the
argument-free `npm run p3:execute` exactly once; this was not a separate human
review. The command exited 0 without retry and produced one canonical
receipt/result root. A
[fresh Docker-free result review](reviews/p3-artifact-demo-result.md)
independently reproduced the fixed identities, copy equality, one-byte
rejection, build/no-rebuild counts, and limitations and accepted them for
C-06/C-07 at the exact one-local-run scope. P4 now has three tracked sanitized
projections, deterministic generation/verification, exactly three talk tables,
and a C-01 through C-07 evidence map. Its
[focused final review](reviews/p4-evidence-map.md) found no blocking or
non-blocking finding and approved the presentation MVP as complete.
Root formatting verification now enumerates only Git-tracked and non-ignored
untracked inputs; its focused unreadable-directory regression and full root
check pass without accessing or mutating either ignored P2 run root.

## Purpose

The repository has accumulated a reusable high-assurance lab track, especially
around M3/M4 validation and Docker failure recovery. That work remains useful,
but completing every generic assurance boundary is not required to support a
20-minute conference talk. This document fixes the smaller delivery scope.

The active objective is to produce a small set of observed, sanitized examples
that explain when dependency code runs and how its reachable capabilities change
with the execution environment. Existing implementation outside this critical
path is retained as a research appendix, not deleted or silently presented as
runtime evidence.

## Presentation claims

The talk is limited to the following seven claims. `docs/evidence-map.md` must
eventually link every empirical claim to a sanitized observed run and its known
limitations.

| ID | Claim | Minimum evidence |
|---|---|---|
| C-01 | TypeScript dependency code can run through install lifecycle, configured plugins/setup, automatic hooks, or an explicitly invoked CLI. | One compact five-route phase/trigger/count table derived from reviewed local adapter runs and the M0 lifecycle observation. |
| C-02 | `automatic`, `configured`, and `explicit` describe the trigger, not the privilege of the process that eventually executes the code. | Route metadata plus the selected profile comparisons; do not infer privilege from the route label alone. |
| C-03 | Environment, file read, direct write, loopback, and child execution are separate capabilities and must be observed separately. | Bounded attempt outcomes for all five capabilities; no raw canary values or host paths. |
| C-04 | The same probe/fixture reaches different capabilities under permissive and constrained runtime policies. | Same-image permissive/constrained runs for the selected Vite and codegen scenarios, or a documented limitation if one selected denial cannot be enforced. |
| C-05 | A direct filesystem write differs from a change requested through an official tool API. | Reviewed ESLint fixer, Vite API, and codegen API/direct-write examples with separate event and hash fields. |
| C-06 | A small artifact can be built once, identified by SHA-256, verified in another directory, copied without rebuilding, and rejected after a one-byte change. | One successful fixed build receipt, verify/copy result, and one declared tamper rejection. |
| C-07 | Digest and local provenance establish byte identity and recorded inputs, not semantic harmlessness. | The artifact result and evidence map display this limitation next to C-06. |

Claims about a general-purpose sandbox, arbitrary hostile packages, complete
process/network isolation, SLSA/in-toto compliance, or artifact harmlessness are
out of scope.

## Selected scenarios

The presentation does not require every matrix row under both profiles.

- Use the existing M0 npm 12 result for the automatic install-lifecycle example,
  preserving its evidence-transfer `Inconclusive` limitation.
- Use reviewed local adapter evidence from ESLint, Vitest, Vite, and codegen for
  phase, trigger, count, and direct/API distinctions. Before use, copy only a
  sanitized, reproducible projection into the presentation evidence inventory;
  local runner output does not become matrix Observed merely by being cited.
- Run permissive/constrained comparison only for `vite-observe-p/c` and
  `codegen-observe-p/c`. These represent configured/automatic and explicit
  routes. Each pair must use identical fixture and immutable image bytes.
- Treat the dedicated M4 profile-control fixture as optional diagnostic or
  appendix material. It is not a prerequisite for the selected route runs and
  is not route Observed.
- Do not add watch mode, warm cache, parallel-worker variants, full baseline
  matrices, or additional routes until the seven claims have complete evidence.

If a selected profile run cannot be implemented safely with a small fixed
runner, record the gap and present the local route evidence plus profile-control
diagnostic separately. Do not disguise a manifest skip as runtime denial.

## Minimum artifact demo

The presentation artifact path is intentionally smaller than the generic design
in `artifact-pipeline.md`.

1. Use one repository-owned source fixture and the existing lockfile/toolchain.
2. Invoke one fixed build command exactly once in a credential-free, offline
   build phase.
3. Write a small canonical receipt containing the source revision or dirty tree
   digest, lockfile digest, Node/tool versions, fixed command ID, invocation
   count, and artifact SHA-256.
4. In a separate disposable directory, verify the receipt and artifact digest,
   then copy the artifact without install or rebuild.
5. Modify one byte in a disposable copy and show verification rejection before
   copy/deploy.

A general artifact packager, multiple subcommands, a provenance framework,
cross-machine reproducibility, signatures, transparency logs, and exhaustive
archive metadata normalization are deferred.

## Safety that remains non-negotiable

- No real credentials or arbitrary third-party packages.
- Instrumented lifecycle execution only in its disposable container.
- Same fixture/image bytes within each profile pair.
- Source read-only during profile and artifact runs; dedicated writable result
  and artifact directories.
- Fixed command/arguments, non-root container process, bounded time/output, no
  runtime-socket forwarding, and no external network during probe/build/verify.
- Separate outcomes for environment, file, write, loopback, and child attempts.
- Separate direct writes from official tool API changes.
- Expected and Observed remain separate; missing evidence stays unmeasured or
  inconclusive.
- Evidence is sanitized and does not contain canary values, credential data, or
  host-specific absolute paths.

## Deferred high-assurance track

The following work is frozen rather than removed:

- M4 offline-build cleanup-recovery backend and B-16/B-17 remediation
- exact device/inode identity chains beyond what the fixed cooperative MVP
  runner needs
- Proxy/accessor/custom-prototype/SharedArrayBuffer hardening beyond existing
  public input boundaries
- remediation-specific review prompts for the frozen track
- a generic raw-to-all-derived-files collector for every production scenario
- the full M5/M7 research assurance and independent-review program

The retained M4 tag and run-owned state are not inspected, retried, repaired, or
deleted by this pivot. The ordinary M4 entry remains fail closed.

## Phase-specific network policy

| Phase | Policy |
|---|---|
| Ordinary documentation/development | Offline by default; exact external research may be explicitly authorized by the user. |
| Dependency acquisition | Registry access may be explicitly authorized with a credential-empty disposable configuration and a fixed dependency/lockfile scope. |
| Probe and lifecycle execution | No external network; loopback or experiment-owned Unix socket only. |
| Credential-free build | No external network and no registry fallback. |
| Verify and deploy simulation | No external network, install, or rebuild. |

Online acquisition does not make later stages online. Acquired bytes and their
lockfile/digest identity become declared inputs to the offline stages.

## Delivery sequence

1. **P0 — scope pivot:** freeze this document, ADR-0002, scoped agent rules, and
   the authoritative milestone/workflow updates.
2. **P1 — evidence inventory:** map C-01 through C-07 to existing reviewed
   evidence, identify the exact missing runs, and reject unsuitable local output
   before implementing a new runner.
3. **P2 — selected profile evidence:** implement and run only the fixed Vite and
   codegen permissive/constrained pairs needed by C-02 through C-04.
4. **P3 — artifact demo:** implement and run the five-step minimal artifact path
   for C-06/C-07.
5. **P4 — evidence map and talk table:** generate sanitized examples, the compact
   route/profile table, `docs/evidence-map.md`, and one focused final review.

The P1 implementation is recorded in
`docs/presentation-evidence-inventory.md`; its independent review approved the
classification and gap inventory with no findings. P2's Docker-non-executing
contract resolves the codegen mapping and fixes the four selected run
boundaries. Codegen staging, adapter profile binding, fixed execution, and
result projection are implemented. The gated codegen pair produced two
sanitized receipts that passed fresh independent read-only review and are
accepted as selected codegen profile Observed at their narrow one-run scope.
The Vite binding/projection, fixed runner, and exact staging assembly are
implemented without Docker. Their focused review blocked on P2-V01; settlement
remediation and behavioral lifecycle tests closed P2-V01 on fresh re-review, but
the re-review found P2-V03 in successful-close residue classification. A focused
remediation and behavioral regression are now implemented and statically
verified, and another fresh re-review closed P2-V03 with no new blocker. The
minimal Vite executor is implemented without Docker, and its fresh independent
review approved the exact one-shot gate with no new blocker. That gate was used
exactly once, but the pair stopped during the permissive scenario with exit 1,
no canonical receipt, and no constrained result root. Retained inaccessible
runtime files were not re-permissioned or promoted. The fresh Docker-free
failure review classified the attempt Inconclusive, found P2-V04 in the
attempt-record/output-availability boundary, and concluded that the retained
attempt cannot be safely recovered without prohibited runtime or filesystem
access. It defined a Docker-non-executing remediation contract for a canonical
pre-evidence attempt record and settlement-aware output availability. That
remediation is now implemented, and its fresh independent re-review keeps
P2-V04 open on P2-V05/P2-V06. Their follow-up remediation now retains partial
lifecycle identity, serializes fixed-path availability before content access,
records post-open failure explicitly, and behaviorally covers the production
export/read filesystem seam without Docker. A fresh independent re-review is
complete: it closes P2-V06 but keeps P2-V05 open because the final inspected exit
code was assigned only after image/start-exit cross-checking. The bounded
residual remediation now stores that established outcome before the cross-check
and behaviorally covers exit-code and image mismatch without evidence access. A
fresh independent Docker-non-executing re-review reproduces the residual bytes,
regressions, and staging identity with no new blocker, closes P2-V05, and closes
parent P2-V04 after P2-V06. The exhausted one-shot gate does not permit a retry.
A Docker-non-executing proposal fixed new `20260719-02` run IDs and distinct
container names, a bounded implementation prompt, and a separate gate-review
prompt. Its implementation has now rebound the active context, plan, runner,
projection, and executor, rebuilt exact 128-file fixed-mode staging, preserved
codegen identities and the P2-V04/P2-V05/P2-V06 closure regressions, and kept
both new result roots absent before execution. An earlier over-broad AGENTS
discovery attempted retained-directory traversal and received permission-denied
warnings without reading contents or changing state; this is not evidence. No
new-run review finding blocked the one-shot gate. A later fresh worker
revalidated the approved snapshot and used standing authorization for exactly
one `npm run p2:execute:vite` attempt. It exited 1 after the permissive scenario
wrote a canonical Inconclusive attempt record with known Docker settlement,
completed cleanup, no established runner settlement, and output
`not-inspected`; no receipt exists and the constrained root remains absent. The
pair was not retried. A fresh Docker-free read-only review reproduced the exact
attempt, approved source identities, bounded entry projection, and fixed root
states and accepted it only as Inconclusive. Neither Vite scenario is selected-
profile Observed; the missing constrained outcome and same-image pair remain an
explicit P2 limitation, and no Vite retry/recovery task remains. P3 minimal
artifact-demo implementation, focused tests, and independent gate review are
complete. A fresh worker revalidated the approved snapshot and used standing
authorization for exactly one argument-free `npm run p3:execute` invocation;
the command exited 0 without retry and produced one fixed canonical
receipt/result root. The
[fresh Docker-free result review](reviews/p3-artifact-demo-result.md)
accepted its exact local C-06/C-07 evidence with the unsigned-receipt,
identity-not-harmlessness, and no-OS-egress-evidence limitations. P4 tracked
sanitized examples, deterministic generator/check, three compact talk tables,
and [`docs/evidence-map.md`](evidence-map.md) are now implemented and
root-verified without rerunning P2/P3 or reading ignored roots. The
[fresh focused final safety/validity review](reviews/p4-evidence-map.md)
reproduced the generated bytes, three-table boundary, claim links, reviewed
counts/outcomes, and sanitization with no finding. The presentation MVP is
complete.
`experiment-matrix.md` has not been hand-edited or promoted.

## Definition of done

- C-01 through C-07 each have a linked observed result or an explicit limitation.
- The talk uses no more than one route/trigger table, one capability/profile
  table, and one artifact flow/result table.
- Only the selected profile scenarios are required; unselected matrix rows stay
  unmeasured without blocking the presentation.
- Every runtime claim distinguishes configuration intent, static/unit evidence,
  and observed attempt outcome.
- Reproduction commands use fixed repository-owned inputs and preserve the
  safety rules above.

Next: none
