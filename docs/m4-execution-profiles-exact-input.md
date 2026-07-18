# M4 exact-input proposal

## State and boundary

State: **doctor-to-input trace and repository staging bytes accepted; B-11/B-12
closed for static/unit; base/staging/fixed-backend contract approved**.
This document and
[`image-input.json`](../containers/profile-control/image-input.json) bind the
accepted fixed-doctor candidate to the current repository staging bytes. The
[independent review](reviews/m4-execution-profiles-exact-input-contract.md)
confirmed those values but blocked the combined exact input on B-11/B-12. The
non-executing remediation now uses only Docker `29.6.1`-compatible helpers for
the full profile inspection projection and validates canonical exact
client/server `29.6.1` bytes immediately before build. The
[fresh independent re-review](reviews/m4-execution-profiles-exact-input-backend-remediation.md)
closed B-11/B-12 and approved that static/unit contract. Docker access,
exact-input production adoption, image build, `profile.json`, production-backend enablement,
container execution, runtime enforcement, and Observed evidence remain
unapproved and absent.

Historical pre-review state: **proposal implemented; independent read-only review pending**
(superseded).

The candidate inventory was obtained by the one-time post-bootstrap doctor
recorded in the
[runtime-template compatibility review](reviews/m4-execution-profiles-runtime-template-compatibility.md#post-review-bootstrap-and-fixed-doctor-follow-up).
That doctor execution used `continue-repository-work` standing authorization;
it was not a separate human review. The narrow remediation defined by
[`prompts/m4-execution-profiles-exact-input-backend-remediation.md`](../prompts/m4-execution-profiles-exact-input-backend-remediation.md)
is implemented and independently accepted for static/unit. The
[production offline-build backend implementation contract](../prompts/m4-execution-profiles-offline-build-backend.md)
and its
[independent review prompt](../prompts/reviews/m4-execution-profiles-offline-build-backend-review.md)
now fix the next implementation/review boundary. The next task is the
non-executing static/unit implementation. It must not access Docker; a fresh
review and separately recorded execution gate still precede any offline build.

Implementation update (2026-07-18; supersedes the next-task clause above): the
production offline-build backend, build-only executor, and canonical sanitized
result are implemented at the non-executing static/unit boundary. The ordinary
entry and package root do not import, construct, or export that backend. The
next task is the fresh independent read-only review fixed by
[`prompts/reviews/m4-execution-profiles-offline-build-backend-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-backend-review.md).
Docker access, build execution, built-image identity, profile binding, controls,
runtime enforcement, and Observed evidence remain unapproved and absent.

Independent review update (2026-07-18; supersedes the next-task clause above):
the [fresh production offline-build backend review](reviews/m4-execution-profiles-offline-build-backend.md)
reproduced the accepted base/staging/fixed plan and accepted the build-only
filesystem/activation boundary, but blocked the backend static/unit gate on
B-13 through B-15. The current result boundary can accept the known synthetic
profile image digest, accepts impossible failure/completed-step combinations,
and does not preserve timeout-first ordering when later output crosses the
limit. The next task is the non-executing remediation in
[`prompts/m4-execution-profiles-offline-build-result-remediation.md`](../prompts/m4-execution-profiles-offline-build-result-remediation.md).
No production input was adopted and no Docker/build/control command was run.

Result remediation implementation update (2026-07-18; supersedes the next-task
clause above): the non-executing implementation rejects the exact known
synthetic profile digest at inspect/plain/canonical boundaries, binds every
failure code to its exact completed-step/version/digest state, and uses a
bounded monotonic first-process-failure state in the production host backend.
Contradictory untrusted timeout/output flags fail closed. The next task is the
fresh independent read-only re-review in
[`prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md).
No production input was adopted and no Docker/build/control command was run.

Result remediation re-review update (2026-07-18; supersedes the next-task
clause above): the [fresh independent read-only re-review](reviews/m4-execution-profiles-offline-build-result-remediation.md)
closed B-13/B-14/B-15 for static/unit and approved the production offline-build
backend static/unit gate with no new blocking finding. It did not adopt the
input for production, activate the backend, run Docker, build an image, bind
profiles, run controls, or establish Observed evidence. The next task is to
create a repository-recorded one-time offline-build execution gate bound to the
reviewed source snapshot and exact run/layout/plan; that gate-definition task
must not run Docker.

Execution-gate definition update (2026-07-18; supersedes the next-task clause
above): the [one-time execution prompt](../prompts/m4-execution-profiles-offline-build-execution.md)
pins the reviewed source aggregate and critical hashes, run ID
`m4-offline-build-20260718-01`, repository-owned layout, fixed staged tag,
temporary activation bytes, exact one-time command, three-command side-effect
boundary, canonical sanitized result, and ordinary source/compiled-output
restoration. The activation bytes were typechecked and compiled only; the
ordinary entry was restored immediately and Docker was not accessed. This is a
gate candidate, not build approval. The next task is the [fresh independent
read-only gate review](../prompts/reviews/m4-execution-profiles-offline-build-execution-gate-review.md).
Only after approval may a fresh `continue-repository-work` invocation use its
standing authorization for the exact one-time build; that is not a separate
human review. Profile binding and controls remain later gates.

Execution-gate independent review update (2026-07-18; supersedes the next-task
clause above): the [fresh independent read-only review](reviews/m4-execution-profiles-offline-build-execution-gate.md)
independently reproduced the source/staging/activation/restoration hashes and
accepted the fixed run/layout/tag, branded snapshot/plan/backend identities,
three-command side-effect and cleanup boundary, canonical result, and
one-time/no-retry semantics with no new blocking finding. It did not apply the
activation or run Docker. The next task is the exact one-time execution under
[`prompts/m4-execution-profiles-offline-build-execution.md`](../prompts/m4-execution-profiles-offline-build-execution.md)
by a fresh worker using standing authorization; this is not a separate human
review. Profile binding and controls remain later gates.

One-time execution follow-up (2026-07-18; supersedes the next-task clause
above): a fresh worker revalidated the approved snapshot and absent run root,
then used standing authorization for exactly one
`npm run --silent m4:build` invocation. This was not a separate human review.
The command exited 1 with canonical `inconclusive / CLEANUP_FAILURE` after all
four build-only steps completed on Docker client/server `29.6.1`; the result
therefore has `builtImageDigest: null`. The reviewed plan has no image-removal
step, so the inspected fixed staged tag remains for a later recovery gate and
was not re-inspected by another Docker command. The fixed run root remains with
runtime-created buildx/token-seed state under `docker-config`; `staging` and
`docker-config/config.json` are absent. No retry or forced cleanup occurred.
Ordinary source/compiled output were restored to the reviewed hashes, and
post-restoration `m4:verify` (17 files / 176 tests) and root `check` (84 files /
507 tests) passed. The next task is a non-executing post-cleanup-failure
recovery contract and independent review prompt bound only to that existing tag
and retained run root; it must define at most one exact digest inspect and
identity-checked owned-state treatment without executing Docker or deleting
state in the contract task. Profile binding, controls, runtime enforcement,
profile-control Observed, and route Observed remain pending.

Recovery contract handoff (2026-07-18; supersedes the next-task clause above):
the [non-executing recovery implementation contract](../prompts/m4-execution-profiles-offline-build-recovery.md)
and its [independent review prompt](../prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md)
bind recovery to the exact recorded `CLEANUP_FAILURE`, fixed run ID/tag, and
retained exact tree. The proposed production path can issue at most one local
canonical image-ID inspect. It reads no retained runtime-created file content,
captures path identities privately, revalidates the exact tree after the
attempt, and retains all owned state on every outcome. The next task is the
non-executing static/unit implementation. Docker access, state deletion,
recovery execution, built-image identity, profile binding, controls, runtime
enforcement, and all Observed evidence remain pending.

Recovery implementation update (2026-07-18; supersedes the next-task clause
above): the recovery-only executor, canonical
`lab-profile-offline-build-recovery-result/v1`, retained-state pre/post identity
validator, and single-inspect production host backend are implemented at the
non-executing static/unit boundary. They accept only the recorded cleanup
failure and fixed run/tag/inventory, never read or serialize retained file
contents, discard the digest on every inconclusive outcome, and retain owned
state. The ordinary entry and package root do not import, construct, or export
the recovery backend. The next task is the fresh independent read-only review
in
[`prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md).
Docker access, recovery execution, state deletion, built-image identity,
profile binding, controls, runtime enforcement, and all Observed evidence
remain pending.

Recovery independent review update (2026-07-18; supersedes the next-task clause
above): the [fresh independent read-only review](reviews/m4-execution-profiles-offline-build-recovery.md)
accepted the fixed failure/run/tag, content non-read/retention-only,
single-inspect/digest/result, and ordinary activation boundaries, but blocked
the production recovery backend static/unit gate on B-16/B-17. The exact-mode
check ignores special permission bits, and an abnormal-close path can accept
post-attempt state validation while the fixed child remains active. The next
task is the non-executing remediation in
[`prompts/m4-execution-profiles-offline-build-recovery-remediation.md`](../prompts/m4-execution-profiles-offline-build-recovery-remediation.md),
followed by a fresh read-only re-review. Docker access, recovery execution,
state deletion, built-image identity, profile binding, controls, runtime
enforcement, and all Observed evidence remain pending.

## Version-controlled base input

The exact-key `lab-profile-image-input/v1` proposal contains only sanitized,
build-relevant values:

| Field | Proposed exact value |
|---|---|
| Base image name | `node` |
| Fixed local tag observed by the doctor | `node:20.18.2-bookworm-slim` |
| Repository digest used by the offline build | `node@sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0` |
| Sanitized local image ID | `sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0` |
| OS / architecture | `linux` / `amd64` |
| Node.js | `v20.18.2` |
| Base environment key inventory | `PATH`, `NODE_VERSION`, `YARN_VERSION`, in that order |

The versioned file stores the digest without the repository-name prefix so the
fixed build plan can construct exactly
`node@sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`.
It stores environment key names only. Environment values, host environment,
credentials, host paths, stderr, and raw runtime errors are not inputs.

`validateVersionedImageInput()` first applies the existing exact-key
`lab-profile-image-input/v1` validator, then rejects substitution of the base
digest, ordered environment-key inventory, or staging aggregate. Creating the
accepted branded snapshot additionally requires the exact repository bytes to
recompute the proposed aggregate.

## Ordered repository staging inventory

The inventory algorithm is the existing `staging.ts` contract: for each file
in the fixed order, hash its bytes with SHA-256; encode
`logicalPath NUL byteLength NUL sha256` rows separated by LF with one final LF;
then SHA-256 that aggregate byte sequence.

| Order | Logical path | Bytes | SHA-256 |
|---:|---|---:|---|
| 0 | `Containerfile` | 347 | `sha256:9547126c36478783d0312d007cce35aa2de36b9c0994cfc4d19c0ff9336275fc` |
| 1 | `fixture/canary.txt` | 29 | `sha256:6bbdf1baeca26db45068ed461044e6c0941d3b644c1d5d7444a848eb930a3fc4` |
| 2 | `fixture/control-runner.mjs` | 9,159 | `sha256:f914a28fc827592c370ed855717bb55ba856733e8c423ea39baf4bc2254dcf8e` |
| 3 | `fixture/fixed-child.mjs` | 152 | `sha256:3f2fc1c0fb6cd0166d2afab93c0b8f2e4ab50ed404f385d2317d7b9756960191` |

Proposed aggregate: `sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03`.

The static verifier and focused unit test recalculate this inventory from the
repository files. Replacement, extra, missing, reordered, empty, shared-buffer,
or aggregate-mismatched input is rejected. A later approved production backend
must still stage private copies into the fixed build context and read them back
for the same byte/inventory verification before invoking the build command.

## Exact host-backend proposal

The approved static/unit state machine remains the authority for command order,
limits, transfer validation, first-failure handling, and inconclusive results.
A production backend may be enabled only after this proposal passes independent
review and a separate build execution gate is recorded. Its boundary is:

- executable fixed to `/usr/bin/docker`, `shell: false`, with no arbitrary
  executable, argv, cwd, image, mount, environment, path, or runtime option;
- exact Docker client/server version `29.6.1` and fixed runtime `runc`;
- a fixed client/server version format and fatal UTF-8, single-final-LF,
  exact-key, fixed-order canonical-byte validation before the build command;
- environment limited to a run-owned disposable `DOCKER_CONFIG` whose config is
  credential-empty; no inherited host environment or registry credential;
- repository-owned run and staging layout derived from fixed run IDs, with no
  user-selected path; exact regular-file inventory, private byte copies, and
  aggregate revalidation before build;
- offline build from the proposed repository digest with `--network none` and
  `--pull=false`, followed only by fixed image-ID inspection in the build step;
- fixed create policy with `--pull never`, external network disabled,
  non-root, read-only root, capability drop, no-new-privileges, no device or
  runtime-socket exposure, and exact pre-start inspection;
- per-command timeout `5,000 ms` and combined output limit `65,536 bytes`;
  evidence limit `65,536 bytes` and exact transfer inventory;
- cleanup limited to fixed M4 container/image names and disposable run state;
  cleanup failure stays inconclusive and never replaces an earlier primary
  failure.

The experiment container must never receive the runtime socket. The approved
host orchestrator may use the fixed CLI indirectly, but the ordinary entry
continues to return `M4_EXECUTION_NOT_APPROVED` before constructing a production
backend. Static/unit tests use only the fake backend and do not establish host
filesystem behavior or runtime enforcement.

## Build and profile binding gates

The remaining sequence is deliberately split:

1. The fresh read-only review accepted this base/staging/fixed-backend contract
   for static/unit. It did not run Docker or enable a production backend.
2. Only after that decision and a separately recorded execution gate may one
   offline build use these reviewed inputs. That step records a sanitized built
   image digest and does not run controls.
3. A separate task creates
   `profiles/permissive/profile.json` and
   `profiles/constrained/profile.json` with the same observed built-image
   digest, the already approved policy values, and no placeholder. A fresh
   read-only review binds both profiles to the build result.
4. Control execution requires another gate. Only complete host inspection plus
   canonical in-container evidence may become profile-control Observed; it is
   not adapter route or experiment-matrix route Observed.

The two `profile.json` files and built-image digest are intentionally absent
now because no offline build has occurred. A synthetic digest, the base-image
digest, the M0 Node.js 24 digest, or a guessed future image digest must not be
used in their place.

## Remaining limitations

- B-11/B-12 are closed and the base/staging/fixed-backend contract is approved
  for static/unit. Static/unit evidence is not exact-input production adoption,
  build approval, or runtime evidence.
- Local availability was observed only by the recorded doctor attempt; this
  proposal does not re-inspect or enumerate runtime state.
- The production offline-build backend and its B-13 through B-15 remediation are
  independently approved for static/unit. It is not enabled or runtime-reviewed;
  a separately recorded one-time execution gate must be defined before any
  offline build. The control backend remains unimplemented.
- Built-image identity, Node permission-model child denial, scratch/source
  enforcement, loopback behavior, inspection representation, evidence
  transfer, and cleanup are unmeasured.
- Expected outcomes and ADR-0001 are unchanged. Profile-control Observed remains
  unmeasured, and experiment-matrix route Observed remains unchanged.
