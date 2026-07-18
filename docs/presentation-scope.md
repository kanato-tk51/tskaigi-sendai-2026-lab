# TSKaigi Sendai 2026 presentation MVP

Status: **active delivery scope**

Decision date: 2026-07-18

Related decision: [ADR-0002](decisions/0002-prioritize-presentation-mvp.md)

P0 scope/workflow pivot status: **complete and root-verified**. The P1
[evidence inventory](presentation-evidence-inventory.md) and its
[independent review](reviews/presentation-evidence-inventory.md) are complete;
the gate is approved with no findings. The Docker-non-executing P2
[codegen binding and fixed-runner contract](p2-selected-profile-contract.md) is
complete, and its non-executing Docker create plan has static/unit coverage. The
current next task is the fixed staging runner and adapter profile binding; no
selected profile run or matrix Observed exists yet.

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
boundaries. The non-executing create plan is implemented; staging, adapter
profile binding, execution, and result projection have not started.

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
