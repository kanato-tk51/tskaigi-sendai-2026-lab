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
  scenario. No selected presentation profile or artifact scenario currently has
  this class. M0 contains scenario-level Observed marker counts, but the run as
  a whole is classified Inconclusive.
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
| [Artifact pipeline design](artifact-pipeline.md) | **Expected-only** | No runtime bytes exist. | The MVP semantic boundary is fixed, but its fixture, command bytes, receipt, and result have not been implemented. | No empirical use until P3 runs the fixed presentation artifact scenario. |

## Sanitized local adapter projection

The ignored `results/runs/m2-*` directories are not stable presentation inputs.
The table below is the repository-tracked projection of the facts confirmed by
the linked contracts and independent reviews. Run ID, PID/PPID, timestamps,
durations, raw paths, canary values, raw content, stdout/stderr, and
run-ID-bearing marker hashes are intentionally omitted.

| Route and fixed local variant | Reviewed route/checkpoint count | Trigger projection | Capability/tool-change projection | Evidence class and boundary |
|---|---:|---|---|---|
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
| **C-02** — trigger label is not process privilege | Reviewed route trigger metadata exists. M4 policy/outcomes are only Expected-only/static-unit. | Missing selected route/profile observations; the codegen adapter-to-scenario binding is unresolved | After a Docker-non-executing P2 contract and implementation review, run exactly `vite-observe-p`, `vite-observe-c`, `codegen-observe-p`, and `codegen-observe-c` under the fixed runner. Resolve M2-E's complete `5 / 6 / 1 / 12` producer against the pre-run matrix before execution. | `automatic`, `configured`, and `explicit` describe causation only. Do not derive privilege from the label or from container configuration. Do not hide extra local events or rewrite Expected after observing a run. |
| **C-03** — five capabilities are separate | M2 local runs record environment, file, direct write, loopback, and child attempts separately; file hash is an additional event, not a sixth privilege claim. | Existing separation is local adapter evidence; bounded selected-profile outcomes are missing | Use the same four P2 runs and preserve each attempt outcome/reason separately under the reviewed binding. Do not collapse absent, skipped, denied, timeout, or success. | No raw canary values, file contents, host paths, commands, or unsanitized errors. A failed exclusive write does not prove rollback of partial output. |
| **C-04** — the same fixture reaches different capabilities under different policies | M4 contains only Expected/static-unit control material; no selected route/profile Observed exists. | Missing selected observations; same-image/profile mechanics remain Expected-only | The same four P2 runs. Each Vite pair and codegen pair must use identical fixture and immutable image bytes, fixed command/arguments, and separate run/result IDs. | A manifest skip is not runtime denial. If a fixed tool requirement prevents isolating a capability, display the successful attempt as a limitation. Profile-control diagnostic is not route evidence. |
| **C-05** — direct writes differ from official tool API changes | Reviewed ESLint fix, Vite observe/API, and codegen observe/API local adapter evidence; events, targets, materialization, and hashes remain distinct. | Candidate evidence complete after the P1 review | None under the presentation scope. P4 must project only the reviewed local facts; P2 observe runs may supplement capability outcomes but do not replace the API variants. | A direct marker is not a tool-owned artifact/source edit. API return, in-memory/bundle change, disk materialization, and ordinary tool output are not interchangeable. |
| **C-06** — build once, verify/copy, reject one-byte tamper | Artifact design is Expected-only. M3 hash tests are synthetic static/unit evidence. The M4 build is unrelated and Inconclusive with no built-image digest. | Missing | P3 scenario `artifact-mvp-build-once`: one repository-owned fixture, fixed command ID and arguments, one build invocation, canonical receipt, separate-directory verify/copy, plus declared `one-byte-tamper` on a disposable copy before a second copy attempt. | The build must be credential-free/offline with read-only source and a dedicated artifact directory. Verify/copy must not install or rebuild. Report invocation count and all digests from the run. |
| **C-07** — identity/provenance is not harmlessness | The limitation is stated in the presentation scope and artifact design, but there is no result beside which to display it. | Missing the same P3 result as C-06 | No additional run beyond `artifact-mvp-build-once`; include the limitation in its receipt/result and later evidence-map row. | SHA-256 and an unsigned local receipt establish byte identity and recorded inputs only. They do not prove semantic harmlessness, truth against a jointly replaced artifact/receipt, or SLSA/in-toto compliance. |

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

The next repository task is a Docker-non-executing P2 contract that fixes the
codegen adapter-to-scenario mapping and exact four-run boundary. P3 remains
separate, and P4 remains responsible for the final sanitized examples, three
compact talk tables, and evidence map.
