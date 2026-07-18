# Presentation evidence inventory independent review record

## Review target

- Target: the current uncommitted P1 presentation evidence inventory and its
  documentation/status updates
- Review type: fresh independent read-only classification review
- Reviewer implementation changes: none
- Review-owned changes: this review record and P1/P2 gate-status metadata only

## Gate decision

- Decision: `APPROVE`
- Blocking findings: none
- Non-blocking findings: none
- Selected profile Observed: unmeasured
- Artifact demo Observed: unmeasured
- Experiment-matrix Observed: unchanged

This decision approves the inventory's evidence classes, sanitized local
projection, rejected inputs, and P2/P3 gap classification. It does not approve
profile enforcement, the unresolved codegen adapter-to-scenario binding, a P2
runner or execution, an artifact build, matrix Observed, conference evidence,
publication, or a commit.

## Evidence-class assessment

| Candidate | Review result | Boundary retained |
|---|---|---|
| M0 sanitized npm 12 example | Accepted as overall **Inconclusive** with scenario-level Observed marker counts | The `docker cp` tmpfs transfer failure, fixed stdout fallback, local-tarball scope, and marker-only limitation remain displayed. |
| M2-A npm lifecycle adapter | Accepted as **static/unit** | Host contract tests did not pack, install, or invoke the lifecycle fixture and do not replace M0. |
| M2-B ESLint adapter | Accepted as **local adapter evidence** | The fixed ESLint `9.39.5` hook counts and direct/fixer distinction are local-contract facts, not profile or matrix Observed. |
| M2-C Vitest setup adapter | Accepted as **local adapter evidence** | The two events are ordered checkpoints in one awaited setup-module import, with the fixed one-worker boundary retained. |
| M2-D Vite adapter | Accepted as **local adapter evidence** | The `6 / 6 / 3 / 15` observe/API contracts are fixed local runs, not `vite-observe-p/c` observations. |
| M2-E codegen adapter | Accepted as **local adapter evidence** | The `5 / 6 / 1 / 12` local contract is not relabeled or filtered into the matrix's current two-route observe scenario. |
| M3 remediation gate | Accepted as **static/unit** | Synthetic raw-to-derived regeneration supports a reporting contract only. |
| M4 contracts, reviews, doctor, and fake backends | Accepted as **Expected-only** for profile outcomes and **static/unit** for implementation checks | Configuration and fake-backend results are not runtime enforcement. |
| M4 one-time offline build | Accepted as **Inconclusive** and unsuitable for the presentation artifact claim | Its canonical result is `CLEANUP_FAILURE`, `builtImageDigest` is `null`, and no profile/control route evidence was produced. |
| Artifact pipeline | Accepted as **Expected-only** | No presentation fixture, receipt, or runtime artifact bytes exist yet. |

No local adapter output, synthetic M3 output, M4 static/unit result, doctor
inventory, manifest value, or Expected matrix cell was promoted to selected
profile or experiment-matrix Observed.

## Sanitized projection and count assessment

The tracked projection matches the linked contracts and independent reviews:

- npm `12.0.1`: marker counts `0 / 1 / 0 / 1 / 1`, with the overall run still
  Inconclusive;
- ESLint `9.39.5`: lint-only route hooks `1 / 1 / 1 / 1 / 1`, fix route hooks
  `1 / 1 / 2 / 2 / 1`, six capability attempts, and one separate tool-change
  event per fixed scenario;
- Vitest `3.2.7`: two route checkpoints, six capability attempts, zero tool API
  changes, and eight total events;
- Vite `6.4.3`: six route events, six capability attempts, three tool-change
  events, and fifteen total events for each fixed observe/API variant;
- project codegen CLI: five route events, six capability attempts, one
  tool-change event, and twelve total events for each fixed mode.

The projection omits the declared run-varying or unsafe fields and retains only
facts already recorded in repository-tracked contracts/reviews. Ignored
`results/runs/m2-*` output is correctly rejected as a presentation input.

## Claim and missing-run assessment

- C-01 and C-05 have the narrow candidate evidence required by the presentation
  scope once their exact evidence classes and limitations stay displayed.
- C-02 through C-04 still require exactly `vite-observe-p`,
  `vite-observe-c`, `codegen-observe-p`, and `codegen-observe-c`.
- The Vite local denominator already matches the selected matrix observe
  contract. The codegen local denominator does not: M2-E records five route and
  one tool-change events, while the matrix currently expects two route events
  and excludes API measurement. The inventory correctly prevents execution
  until a reviewed fixed adapter-to-scenario mapping resolves this mismatch
  without filtering observed events or rewriting Expected after a run.
- C-06 and C-07 require one `artifact-mvp-build-once` boundary: one fixed build
  invocation and receipt, separate-directory verify/copy without rebuild, and a
  declared one-byte mutation rejected before a second copy/deploy. The receipt
  and result must retain the source revision or dirty-tree digest, lockfile
  digest, actual Node/tool versions, fixed command ID, build count, artifact
  digest, and the identity-not-harmlessness limitation required by the scope.

No additional route/profile run is needed for C-01 or C-05, and no second
artifact build is needed for C-07.

## Rejected-input assessment

The rejected-input list is complete for the identified candidates. In
particular, it correctly excludes ignored M2 run files, M2-A host tests, M3
synthetic data, matrix Expected/unmeasured cells, M4 configuration/fake-backend
material, the failed M4 build, and configuration inspection alone. None can
establish selected route enforcement.

## Verification

- `npm run format:check`: passed; all matched files used Prettier style.
- `npm run check`: passed; formatting, lint, root typecheck, 86 test files, and
  542 tests passed.
- `git diff --check`: passed after the review-owned metadata was finalized.
- `git status --short`: captured the existing uncommitted P1 implementation and
  review-owned files; unrelated work was preserved.

No Docker, probe, lifecycle fixture, selected-profile run, artifact build,
external network, credential access, runtime-socket access, retained-state
inspection/mutation, or remote Git operation was used by this review.

## Next task boundary

P1 is complete. The next task is a Docker-non-executing P2 contract task that
fixes the codegen adapter-to-scenario mapping and the exact four-run fixed-runner
boundary. It must keep matrix Observed unmeasured and must not execute a selected
profile pair until the mapping, same-image/fixture inputs, fixed commands,
bounded evidence channel, and safety options have been independently reviewed.
