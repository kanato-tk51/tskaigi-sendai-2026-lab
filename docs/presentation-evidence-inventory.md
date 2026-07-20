# Presentation evidence inventory

Status: **P1 inventory and independent read-only review complete; gate
approved with no findings**.

Inventory date: 2026-07-18

This document classifies the evidence that may support the seven
[presentation claims](presentation-scope.md#presentation-claims). It is an
inventory and a sanitized projection, not a new runtime result. P1 did not run
Docker, execute a probe, create profile evidence, or change an Observed field in
[the experiment matrix](experiment-matrix.md).

## Evidence-class rules

The inventory uses only these evidence classes:

- **Observed**: a completed runtime observation at the scope claimed by its
  scenario. At P1 inventory time no selected presentation profile or artifact
  scenario had this class. The later reviewed `codegen-observe-p/c` pair now has
  selected-profile Observed status; M0 still contains only scenario-level
  Observed marker counts inside an overall Inconclusive run.
- **Inconclusive**: a runtime command produced bounded observations but did not
  satisfy a required completion or evidence-transfer condition.
- **local adapter evidence**: a reviewed fixed M2 runner observed a tool-specific
  local contract. It is neither profile evidence nor experiment-matrix
  Observed.
- **static/unit**: source review, static checks, unit/integration contract tests,
  or synthetic M3 data. It can support implementation confidence but not a
  runtime-enforcement or route claim.
- **Expected-only**: a pre-run hypothesis, design, manifest, or scenario
  contract. It is never reported as an observed outcome.

An **unreviewed runtime candidate** is a workflow state, not an evidence class.
The successful P3 command passed its recorded fresh result review and is now
accepted as Observed only at its exact one-local-run scope.

`Suitable` below means suitable for the stated narrow conference use after the
P1 gate. It does not promote the evidence to another class.

## Candidate inventory

| Candidate | Exact class | Sanitized bytes | Reproducibility | Suitable conference use |
|---|---|---|---|---|
| [M0 sanitized example](../results/examples/m0-npm12/summary.json) and [M0 observation note](spike-npm12.md) | **Inconclusive**, containing scenario-level Observed marker counts | Yes. Host paths and IDs are normalized or removed; the transformation list is tracked in [sanitization metadata](../results/examples/m0-npm12/sanitization.json). | The image digest, Node/npm versions, fixture, commands, and isolation policy are fixed. Timestamps/PIDs are run-varying, and the required transfer path is known to fail on the recorded runtime. | Yes, only for the version-specific automatic lifecycle marker baseline with the transfer limitation displayed. It is not capability or profile evidence. |
| [M2-A npm adapter review](reviews/m2-a-npm-lifecycle-adapter.md) | **static/unit** | Yes for the tracked review projection; no runtime segment was accepted. | Fixed source/fixture contract and host tests are reproducible without running a lifecycle. | No empirical route use. M0 supplies the lifecycle example; M2-A cannot replace it. |
| [M2-B ESLint contract](m2-b-eslint-adapter.md) and [review](reviews/m2-b-eslint-adapter.md) | **local adapter evidence** | The tracked projection below is sanitized. Ignored local segments are not accepted as presentation inputs. | ESLint `9.39.5`, fixture/options, and runner are fixed. Counts change if those inputs change. | Yes for phase/trigger/count and fixer API versus direct-write distinctions, labeled local adapter evidence. Not suitable for profile outcomes. |
| [M2-C Vitest contract](m2-c-vitest-setup-adapter.md) and [review](reviews/m2-c-vitest-setup-adapter.md) | **local adapter evidence** | Yes. The reviewed segment/summary policy excludes canaries, credentials, raw paths/errors/output, source content, and run residue. | Two fresh fixed runs had matching deterministic projections after declared run-varying fields were removed. | Yes for the configured/automatic setup checkpoints and count, labeled local adapter evidence. Not suitable for profile outcomes. |
| [M2-D Vite contract](m2-d-vite-plugin-adapter.md) and [review](reviews/m2-d-vite-plugin-adapter.md) | **local adapter evidence** | Yes. The tracked projection retains logical IDs, normalized outcomes, approved hashes/sizes/counts, and sanitized versions only. | Exact Node/Vite/Rollup/esbuild versions, fixture, command, variants, and counts are fixed; fresh observe/API runs passed the reviewed contract. | Yes for route phases/counts and direct/tool-API separation, labeled local adapter evidence. The local run is not `vite-observe-p/c`. |
| [M2-E codegen contract](m2-e-codegen-adapter.md) and [review](reviews/m2-e-codegen-adapter.md) | **local adapter evidence** | Yes. The tracked projection excludes raw inputs, paths, canaries, output, and errors. | The project-owned CLI, fixed modes/arguments/input, exact Node version, and counts are fixed; fresh observe/API/dry-run runs passed. | Yes for the explicit route and direct/generator-API separation, labeled local adapter evidence. It is not directly reusable as `codegen-observe-p/c`: the local `5 / 6 / 1` denominator differs from the matrix's current Expected `2` route events and no API measurement. |
| [M3 remediation review](reviews/m3-harness-and-reports-remediation.md) | **static/unit** | The synthetic contract uses bounded canonical data, but it is not an adapter or presentation example. | Raw-to-derived exact regeneration is tested for the fixed synthetic fixture. | No empirical claim. It supports the future reporting path only. |
| [M4 Expected contract](m4-execution-profiles.md), static/unit reviews, and doctor inventory | **Expected-only** for profile outcomes; **static/unit** for implementation and fake-backend checks | The recorded review/doctor projections are bounded and sanitized. | Static/unit checks are reproducible for reviewed bytes. They do not reproduce container enforcement. | No route/profile claim. Configuration intent, doctor inventory, and fake-backend behavior are not enforcement evidence. |
| [M4 one-time build follow-up](reviews/m4-execution-profiles-offline-build-execution-gate.md#one-time-execution-follow-up) | **Inconclusive** | Yes; the canonical result omits host paths, raw output, credentials, and runtime-created contents. | Bound to one reviewed run ID/plan; retry is prohibited and retained state is frozen. | No. It ended `CLEANUP_FAILURE`, has `builtImageDigest: null`, ran no controls, and is not the presentation artifact demo. |
| [P3 artifact demo](p3-artifact-demo.md) and [result review](reviews/p3-artifact-demo-result.md) | **Observed** at the exact one-local-run scope | The fixed result/receipt projection is bounded and retains no host path, raw environment value, credential, or external output. | One fixed local command exited 0 without retry; cross-machine reproducibility is not established. | Yes for C-06/C-07 with the unsigned-receipt, identity-not-harmlessness, and no-OS-egress-evidence limitations displayed. |

## Sanitized local adapter projection

The ignored `results/runs/m2-*` directories are not stable presentation inputs.
The table below is the repository-tracked projection of the facts confirmed by
the linked contracts and independent reviews. Run ID, PID/PPID, timestamps,
durations, raw paths, canary values, raw content, stdout/stderr, and
run-ID-bearing marker hashes are intentionally omitted.

| Route and fixed local variant | Reviewed route/checkpoint count | Trigger projection | Capability/tool-change projection | Evidence class and boundary |
| --- | ------------------------------------------------------------------------------: | --- | --- | --- |
| npm `12.0.1` install lifecycle: unapproved / approved rebuild / scripts-disabled / reinstall / `npm ci` | marker `0 / 1 / 0 / 1 / 1` | `automatic`, install lifecycle | Marker only; no environment, file-read, loopback, child, or profile measurement | **Inconclusive** M0 run with scenario-level Observed counts; local tarball and failed required transfer must remain visible |
| ESLint `9.39.5`: lint-only | route hooks `1 module + 1 initialization + 1 rule create + 1 visitor + 1 fixer` | dependency load/callbacks `configured`; official fix option/change `explicit` when used | 6 separate capability attempts; 1 skipped fixer change | **local adapter evidence**; version/fixture/options specific |
| ESLint `9.39.5`: fix | route hooks `1 + 1 + 2 + 2 + 1` | same trigger mapping | 6 separate capability attempts; 1 changed fixer result/materialization; second lint pass retained | **local adapter evidence**; direct marker, fixer return, and source materialization remain distinct |
| Vitest `3.2.7`: one setup, one test, single fork | 2 checkpoints | late setup-module checkpoint `configured`; setup-body checkpoint `automatic` | 6 separate capability attempts; 0 tool API changes; total 8 | **local adapter evidence**; two checkpoints are in one awaited import, not two Vitest callbacks |
| Vite `6.4.3`: observe / API | 6 route events in each variant | module checkpoint/factory `configured`; build hooks `automatic` | 6 separate capability attempts; 3 tool changes skipped/`NOT_APPLICABLE` in observe or 3 successful API changes in API; total 15 | **local adapter evidence**; neither variant is a profile comparison |
| Project codegen CLI: observe / API / dry-run | 5 route events in each mode | all route events `explicit` | 6 separate capability attempts; 1 skipped or successful generator API event as fixed by mode; total 12 | **local adapter evidence**; no automatic-start claim |

## Claim-by-claim gap classification

| Claim | Eligible existing evidence | Current state | Smallest missing runtime run and fixed scenario | Limitations that must appear next to the claim |
|---|---|---|---|---|
| **C-01** — dependency code runs through five routes | M0's scenario-level lifecycle marker counts plus the M2-B/C/D/E sanitized local projection above | Candidate evidence complete after the P1 review; no profile run is required for this route table | None for phase/trigger/count. P4 must generate the compact five-route table from this inventory rather than cite ignored run directories. | M0 is overall Inconclusive and marker-only. M2 facts are local adapter evidence, not matrix/profile Observed. Every count is pinned to its exact tool/fixture/options. |
| **C-02** — trigger label is not process privilege | Reviewed route trigger metadata plus the independently accepted `codegen-observe-p/c` selected-profile Observed pair | Codegen comparison complete; Vite selected-profile observations missing | Implement and run only `vite-observe-p/c` through the same gated fixed-runner process. Preserve the complete reviewed codegen `5 / 6 / 1 / 12` projection and do not hand-promote matrix cells. | `automatic`, `configured`, and `explicit` describe causation only. Do not derive privilege from the label or from container configuration. The codegen evidence is one local pair, not a reproducibility or general-isolation claim. |
| **C-03** — five capabilities are separate | M2 local runs separate all capabilities; the accepted codegen pair retains six ordered attempts, with file hash explicitly treated as integrity rather than a sixth capability. | Codegen bounded outcomes complete; Vite selected-profile outcomes missing | Add the Vite pair while preserving each attempt outcome/reason. Do not collapse absent, skipped, denied, timeout, or success. | No raw canary values, file contents, host paths, commands, or unsanitized errors. A failed exclusive write does not prove rollback of partial output. |
| **C-04** — the same fixture reaches different capabilities under different policies | The accepted codegen pair is same-image and records permissive success versus constrained absence/denial/failure for the fixed attempts. | Codegen comparison complete; Vite same-image pair missing | Implement and run only the fixed Vite pair with identical fixture/image bytes, fixed command/arguments, and separate run/result IDs. | The codegen receipt does not by itself carry the staging manifest or prove no-retry history; use it with the reviewed executor/execution record. A manifest skip is not runtime denial, and profile-control diagnostic is not route evidence. |
| **C-05** — direct writes differ from official tool API changes | Reviewed ESLint fix, Vite observe/API, and codegen observe/API local adapter evidence; events, targets, materialization, and hashes remain distinct. | Candidate evidence complete after the P1 review | None under the presentation scope. P4 must project only the reviewed local facts; P2 observe runs may supplement capability outcomes but do not replace the API variants. | A direct marker is not a tool-owned artifact/source edit. API return, in-memory/bundle change, disk materialization, and ordinary tool output are not interchangeable. |
| **C-06** — build once, verify/copy, reject one-byte tamper | The reviewed exact P3 result records build count 1, separate digest verification, verified copy/post-copy digest with zero deploy builds, and rejection before copy after exactly one changed byte. M3 hash tests remain synthetic static/unit evidence, and the M4 build remains unrelated/Inconclusive. | Exact one-local-run Observed accepted | No additional runtime run. P4 must create the tracked sanitized artifact table from the reviewed projection without citing the ignored root. | The recorded empty child environment and code path are not OS-level egress proof. Verify/copy did not install or rebuild. Report the exact one-local-run scope and all receipt limitations. |
| **C-07** — identity/provenance is not harmlessness | The reviewed P3 receipt/result displays the required identity-not-harmlessness, unsigned-receipt, and no-OS-egress-evidence limitations. | Exact one-local-run Observed accepted with limitations | No additional runtime run. P4 must place the limitations next to C-06/C-07. | SHA-256 and an unsigned local receipt establish byte identity and recorded inputs only. They do not prove semantic harmlessness, truth against a jointly replaced artifact/receipt, or SLSA/in-toto compliance. |

## Rejected presentation inputs

The following inputs were considered and rejected before P2 implementation:

- ignored raw or summary files under `results/runs/m2-*`: useful for local
  verification, but not versioned presentation inputs and not profile/matrix
  Observed;
- direct reuse of ignored M2-E local observe bytes as `codegen-observe-p/c`:
  those bytes remain local adapter evidence. The local `5 / 6 / 1 / 12`
  denominator does not match the current matrix Expected projection, so P2
  needs a reviewed pre-run binding without filtering or relabeling an observed
  segment;
- M2-A host contract tests: they do not run npm lifecycle code;
- M3 synthetic fixture output: it demonstrates collector/reducer behavior, not
  a dependency route or runtime policy;
- experiment-matrix Expected rows and unmeasured Observed cells: hypotheses are
  not evidence;
- M4 Docker plans, doctor inventory, fake-backend tests, and profile-control
  fixture code: none establishes selected route enforcement;
- the M4 `CLEANUP_FAILURE` build result: it has no built image digest, no
  profile binding/control run, and no presentation artifact receipt;
- configuration inspection alone: read-only mounts, environment omission,
  network mode, or child policy are intent until the corresponding attempt
  outcome is observed.

## Fixed handoff

The [fresh independent read-only P1 review](reviews/presentation-evidence-inventory.md)
approved the classifications, projected counts, rejected inputs, and P2/P3 gap
boundaries with no findings. It confirmed that no local/static/Expected input
was promoted and did not run Docker or change matrix Observed.

The Docker-non-executing P2
[contract](p2-selected-profile-contract.md) fixes the exact four-run boundary.
Its codegen implementation, one-shot execution, and
[fresh independent receipt review](reviews/p2-selected-profile-codegen-receipts.md)
are complete; the two codegen receipts are selected-profile Observed without a
matrix promotion. Root verification hardening and the Docker-non-executing M2-D
exact binding/bounded projection, fixed runner, and exact staging assembly are
complete without reading the ignored codegen evidence or creating Vite runtime
evidence. The fresh focused
[Vite runner/staging review](reviews/p2-selected-profile-vite-runner.md)
accepted the fixed inventory and constrained-child limitation but blocked on
P2-V01 because settlement-unknown did not suppress cleanup. The
Docker-non-executing remediation and behavioral process/server tests closed
P2-V01 on fresh re-review, which then found P2-V03 in successful-close residue
classification. The focused remediation now rejects bounded force-settled
residue as a known failure and behaviorally proves output verification is
skipped. A fresh independent Docker-non-executing re-review closed P2-V03 with
no new blocker and approved only minimal Vite executor implementation. That
executor is now implemented, statically verified, and
[independently reviewed](reviews/p2-selected-profile-vite-executor.md) without
Docker; the review found no new blocker and approved only the exact one-shot
Vite execution gate. The gate was used exactly once and exited 1 in the
permissive scenario before a canonical receipt; the constrained root is absent.
The
[fresh Docker-free failed-attempt review](reviews/p2-selected-profile-vite-failure.md)
classifies that pair attempt Inconclusive, leaves Vite selected-profile Observed
unmeasured, and finds P2-V04 in receipt assembly/output availability. The
retained attempt cannot be safely recovered inside the read-only boundary. The
Docker-non-executing P2-V04 remediation now writes a canonical attempt record
before host evidence access, preserves unavailable output as `not-inspected`,
defers runner verification/export until settlement is known, and keeps complete
receipts separate from attempt outcomes. Its focused behavioral and full P2
static checks pass, but the
[fresh independent Docker-non-executing re-review](reviews/p2-selected-profile-vite-failure.md)
keeps P2-V04 open on P2-V05/P2-V06: later failures erase already-inspected
lifecycle fields, and production evidence access can be partially performed
while reported as `not-inspected`; the real fixed-path export/read boundary also
lacks behavioral filesystem coverage. The bounded Docker-non-executing
follow-up now retains validated image/exit fields, completes fixed-path
metadata/mode preflight before event open, distinguishes post-open partial
inspection, and connects the production runner export and executor reader in a
repository-local filesystem regression. A fresh independent Docker-non-executing
re-review closes P2-V06 but keeps P2-V05 open: a valid final exited inspect was
still stored only after the image/start-exit cross-check. The bounded residual
P2-V05 remediation now stores that outcome first and covers both exit-code and
image mismatches while retaining the exact partial fields and avoiding evidence
access. A fresh Docker-non-executing re-review reproduces those exact bytes,
regressions, and staging identity, finds no new blocker, closes P2-V05, and
therefore closes parent P2-V04 after P2-V06. The exhausted gate is not retried.
A Docker-non-executing proposal fixed new `20260719-02` Vite run IDs, distinct
container names, and the later exact one-command/no-retry boundary. Its active
context/plan/runner/projection/executor binding and exact 128-file staging
candidate are now implemented with static/unit evidence; both new result roots
were absent before execution. A fresh independent Docker-non-executing review reproduced the
candidate bytes and staging identity with no blocker and approved only one
argument-free `npm run p2:execute:vite` pair attempt with no retry. A fresh
worker revalidated the exact candidate and used standing authorization for that
command once; it exited 1 with only the permissive scenario represented in the
bounded Inconclusive projection. The permissive root has a canonical
Inconclusive attempt record and no receipt, the constrained root is absent, and
the pair was not retried. Neither Vite scenario is selected-profile Observed.
A fresh Docker-free read-only review reproduced the exact attempt, approved
source identities, bounded projection, and fixed root states and accepted the
attempt only as Inconclusive. The missing constrained outcome and same-image
pair are an explicit presentation limitation, not zero or success, and no Vite
retry/recovery task remains. The Docker-free P3 minimal artifact-demo
implementation and focused tests are complete. A fresh independent Docker-free
review reproduced the fixed candidate and approved only one later argument-free
`npm run p3:execute` invocation with no retry. A fresh worker then revalidated
the snapshot and absent root and used standing authorization for that exact
command once; it exited 0 and was not retried. The resulting fixed receipt/result
passed the
[fresh Docker-free read-only result review](reviews/p3-artifact-demo-result.md),
which reproduced its canonical identities, cross-copy equality, exact one-byte
tamper rejection, build/no-rebuild counts, and limitations without rerun or
repair. C-06/C-07 are accepted at that exact one-local-run scope. The next task
was P4 tracked sanitized examples, three compact talk tables, and the evidence
map. Those implementation outputs are now generated and root-verified without
rerunning P2/P3 or reading ignored roots. The
[fresh focused read-only safety/validity review](reviews/p4-evidence-map.md)
found no finding and approved P4 and the presentation MVP as complete.

The later selected Vite completion addendum exhausted one separately reviewed
`20260719-03` one-shot pair. Its
[fresh Docker-free result review](reviews/p2-vite-diagnostic-result.md)
reproduced the canonical v2 attached-start-timeout attempt and accepted it only
as a third immutable Inconclusive execution attempt. The tracked presentation
projection now lists `20260719-01`, `20260719-02`, and `20260719-03` side by
side; it retains Vite permissive `not-inspected`, constrained `missing`, no
same-image pair, and no selected Vite or experiment-matrix Observed promotion.

The later independent `20260720-01` one-shot outcome also passed a fresh
Docker-free
[result review](reviews/p2-vite-new-measurement-result.md). The review accepted
its exact canonical v3 permissive record only as the fourth immutable
Inconclusive attempt and retained the `child-launched` valid progress prefix as
diagnostic secondary state. The tracked presentation projection now lists all
four attempts through `20260720-01` side by side.

The later `20260720-02` detached-transfer outcome also passed a fresh
Docker-free
[`result review`](reviews/p2-vite-detached-transfer-result.md). The review
accepted its exact canonical v4 permissive record only as the fifth immutable
Inconclusive attempt and retained the invalid eight-record progress prefix as
diagnostic secondary state. The tracked presentation projection now lists all
five attempts side by side; Vite capabilities remain `not-inspected` /
`missing`, and no same-image or Observed promotion exists.

Next: none
