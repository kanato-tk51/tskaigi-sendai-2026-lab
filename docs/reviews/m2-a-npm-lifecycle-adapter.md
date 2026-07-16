# M2-A npm lifecycle adapter independent review record

## Review target

- Target: the uncommitted M2-A adapter implementation and fixed source/fixture contract
- Review type: independent read-only implementation review
- Reviewer source changes: none; review closure updates only documentation/status metadata and this record

## Gate decision

- Decision: `APPROVE IMPLEMENTATION WITH NON-BLOCKING FOLLOW-UPS`
- Source/contract blockers: none
- Runtime evidence-transfer gate: `BLOCKED / INCONCLUSIVE`
- Experiment-matrix Observed: unmeasured

This decision approves the host-side M2-A adapter implementation boundary. It does not approve instrumented package pack/install/lifecycle execution, the M0 Docker tmpfs fallback as success, experiment-matrix Observed evidence, profile enforcement, M3 collection/reporting, a commit, or publication.

## Review scope

- `packages/npm-lifecycle-probe` source, fixed fixture, tests, and static verifier;
- the `probe-core` manifest, preparation, session, and producer-segment boundary used by the adapter;
- fixed npm `12.0.1` / Node.js `v24.18.0` metadata and automatic lifecycle mapping;
- host/root workspace isolation, allowed `PROBE_CANARY_M2A_*` inputs, fixed path prefixes, and output policy;
- event count/order, capability/API separation, import safety, and documentation consistency.

## Fixed contract and local results

| Condition | Fixed value |
|---|---|
| Node.js / npm | `v24.18.0` / `12.0.1` |
| Route | `npm-install-lifecycle`, `automatic`, `lifecycle-hook` |
| Route/capability/tool API/total | `1 / 6 / 0 / 7` |
| Producer | `npm-lifecycle-producer`, one producer, `workerId: null` |
| Lifecycle entry | `node /opt/m2a-adapter/dist/lifecycle-entry.js` |

The host contract tests validate the fixed manifest and probe-core preparation boundary without invoking an install lifecycle. No instrumented package was packed, installed, or run on the host.

## Verification

- `npm run m2a:verify`: passed (typecheck, build, scoped static verifier, 5 tests)
- `node experiments/npm12-install/scripts/verify-static.mjs`: passed
- `npm run check`: passed (61 test files, 307 tests)
- `git diff --check`: passed
- Docker runtime, external network, credentials, home-directory access, and remote Git operations: not used during the review

## Confirmed behavior

- The package root is import-safe; only the dedicated lifecycle entry can start a session.
- The adapter reads only the four enumerated `PROBE_CANARY_M2A_*` bindings and rejects non-fixed run IDs, roots, and ports.
- `route-invocation` records the npm lifecycle hook as `automatic`; the six environment/file/hash/write/loopback/child operations are separate `capability-attempt` events.
- No npm official tool API change is fabricated; `toolApiTargets` and `toolApiChanges` remain empty.
- The producer segment is owned by `probe-core`, with runtime path preflight and no raw canary, content, absolute path, command, error, or output data in events.
- The root workspace remains `packages/*`; the instrumented fixture is outside root scripts and is declared for the container-only fixed entry.

## Runtime boundary

M0's Docker `29.6.1` run could not recover the required `/m0-output` tmpfs through `docker cp`; the validated stdout bundle fallback is explicitly Inconclusive. M2-A therefore remains blocked for container execution and cannot update the experiment matrix until a human-approved evidence-transfer boundary is available. The adapter implementation does not silently reuse or generalize that fallback.

## Non-blocking follow-ups

| ID | Limitation and impact | Recommended boundary |
|---|---|---|
| F-01 | The static verifier is scoped inspection, not a runtime container or filesystem sandbox proof. | Preserve the disposable-container and fail-closed runtime review; do not present static checks as isolation evidence. |
| F-02 | Host contract tests do not establish npm's actual lifecycle invocation count or profile capability outcomes. | Run the fixed container scenarios only after the transfer boundary is approved; keep Expected and Observed separate. |
| F-03 | The fixed lifecycle entry relies on the container image supplying `/opt/m2a-adapter/dist/lifecycle-entry.js`; image wiring and transfer orchestration remain outside this source-only closure. | Add and review the dedicated image/host-orchestrator wiring together with the approved result-transfer method. |
| F-04 | M1 I-04 remains applicable: a direct-write failure after exclusive creation may leave partial output. | Use disposable run roots and preserve the original failure; do not describe cleanup as rollback. |

## Remaining boundaries

- M0 evidence, marker-only results, and stdout fallback remain unchanged.
- `docs/experiment-matrix.md` remains unchanged with all M2-A Observed fields unmeasured.
- Profile enforcement, M3 collector/global sequence/reporting, and artifact pipeline remain unimplemented.
- No commit, push, PR, or main-branch update was created by this review step.
