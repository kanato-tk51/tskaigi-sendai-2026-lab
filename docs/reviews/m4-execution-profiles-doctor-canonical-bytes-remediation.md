# M4 doctor canonical-byte remediation independent re-review

## Review target and decision

- Target: the current uncommitted B-09 canonical-byte remediation working tree
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Fixed doctor static/unit gate: **APPROVED**
- Existing M4 profile-control static/unit gate: **APPROVED; unchanged**
- Doctor execution gate: **PENDING / BLOCKED; not executed**
- Runtime enforcement gate: **PENDING / BLOCKED; not executed**
- Finding closed: B-09
- Previously closed findings that remain closed: B-08, B-10
- New blocking findings: none
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The remediation now derives the exact accepted representation from each
validated plain snapshot, serializes it with `JSON.stringify()`, appends one LF,
encodes it with `TextEncoder`, and compares the resulting length and every byte
with the original response `Uint8Array`. A leading UTF-8 BOM can still disappear
from the decoded string, but it cannot disappear from the original byte array;
the length or byte comparison therefore rejects it. Focused negative tests cover
all three structured doctor outputs.

B-09 is closed for the reviewed static/unit boundary. Together with the prior
B-08 and B-10 closures, this approves the fixed doctor static/unit gate. This
decision does not approve Docker access, run the doctor, establish local runtime
or image availability, accept exact image input, approve an image build, execute
profile controls, or create Observed evidence.

Documentation follow-up update (2026-07-18): the separate N-01 task corrected
the top-level `README.md` to record the approved M3 gate with non-blocking
follow-ups. This post-review status update does not change the reviewed snapshot
identity, the doctor decision, or any Expected/Observed evidence.

Doctor execution follow-up (2026-07-18): a fresh worker used the
`continue-repository-work` standing authorization for the repository-recorded,
exactly-once `npm run m4:doctor` approval gate. No separate human review was
claimed. The reviewed fixed backend was reachable only for that invocation;
afterward, `orchestrator-entry.ts` was restored to its ordinary fail-closed
source. The command exited 1 with the sanitized result
`validity: inconclusive`, `primaryFailure: COMMAND_FAILURE`, no completed steps,
and a null inventory. No raw stderr, child error, host path, environment value,
or runtime-socket detail was retained. The attempt therefore did not establish
the Docker client/server version, local base identity, or base-environment key
inventory, and it did not create profile-control or route Observed evidence.

Doctor retry follow-up (2026-07-18): a new worker used the subsequent
`continue-repository-work` standing authorization for exactly one new
`npm run m4:doctor` attempt. This did not represent a separate human review.
The critical doctor source and package/toolchain files matched the SHA-256
values recorded by this review, and `npm run m4:verify` passed before the
attempt. The retry again exited 1 with `validity: inconclusive`,
`primaryFailure: COMMAND_FAILURE`, no completed steps, and a null inventory.
The worker retained no raw stderr, child error, host path, environment value,
or runtime-socket detail, did not run build or controls, and restored
`orchestrator-entry.ts` to its ordinary fail-closed source immediately after
the one attempt. Candidate inventory and all profile-control/route Observed
evidence therefore remain unmeasured.

Runtime-template compatibility correction (2026-07-18): a focused diagnosis
showed that the two first-step failures above did not establish an unavailable
Docker runtime. The credential-empty fixed CLI reached Docker client and server
`29.6.1`, while the reviewed runtime format exited 64 because Docker 29.6.1 does
not provide the Go-template `dict` helper. The doctor now constructs the same
canonical runtime and image-identity JSON directly with the supported `json`
helper, and unit/static checks reject reintroduction of `dict`. After the change,
`npm run m4:doctor` completed `runtime-version` and then returned Inconclusive
with `COMMAND_FAILURE` at `base-image-identity`; the exact local no-pull tag
`node:20.18.2-bookworm-slim` was unavailable. No raw stderr, environment value,
runtime-socket detail, credential, external network, pull, build, or control run
was used. The original snapshot hashes remain historical; the template change
requires a fresh review before it can inherit this record's static/unit approval.

Fresh compatibility re-review update (2026-07-18): the separate
[runtime-template compatibility independent re-review](m4-execution-profiles-runtime-template-compatibility.md)
approved the corrected `json`-only formats and the fixed doctor static/unit gate
for the current bytes. It did not rerun the doctor or approve exact input,
build, controls, runtime enforcement, or Observed evidence. The exact local base
tag remains unavailable, so the next gate requires an external offline input
readiness change by a project human.

## Reviewed snapshot identity

The hashes below identify the reviewed working-tree bytes before this review
record and its status metadata were added. They establish byte identity only,
not runtime approval or correctness by themselves.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `b866d552e2dde18f5805a0bacb464b3e158f92b61e7ca40b9b6d6d61aa5c16e0` |
| `containers/profile-control/src/doctor.ts` | `fe5a5b22ff7ad619c99dde02ef2794f488936af262049b150c23aa6a09b68677` |
| `containers/profile-control/test/doctor.test.ts` | `d03b15666d769174d8878a593002c00a5708b621d35a04bc360bbb0aa848e706` |
| `containers/profile-control/scripts/verify-static.mjs` | `545bef895886b1febab21bf7fdd1380cfb92bca2af6337b3f27ec1b34291a151` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |
| `docs/m4-execution-profiles.md` | `d54087aaeb03f2f114ebd45220fba3872e7b0970570941252631e3e0bae7f187` |
| `docs/milestones.md` | `5127111751e623323b8ec03f6e467c4be3ea1e6a6cfb449b9cd1abe0ccd6628f` |
| `docs/architecture.md` | `394e9d3e4dc845dd655a5f6b6ac7696af41b9857e5e774db1fd7c28ce233785e` |
| `docs/reviews/m4-execution-profiles-doctor-boundary-remediation.md` | `7adc678e61455fac27b9b8618929696fa402102764606c25789eaeeaf69804f7` |
| `prompts/m4-execution-profiles-doctor-canonical-bytes-remediation.md` | `75d6b862c291fca749cdaf8dcb92b5918800b1830ad793cf378e5e268293c395` |
| `prompts/reviews/m4-execution-profiles-doctor-canonical-bytes-remediation-review.md` | `e30be5c77046915cc900983ef54a64228754a3a55d9a67d86b5e9e58ce1e7757` |

The aggregate manifest was produced by sorting the repository-relative file
list, hashing each file, and hashing that sorted manifest.

## Finding closure assessment

### B-09 — Exact original-byte canonical validation: closed for static/unit

`parseJsonRecord()` performs fatal UTF-8 decode, requires one final LF, parses
JSON, and converts it to a plain record. Each of the three output-specific
parsers then validates exact keys and scalar/array types and constructs a new
normalized plain snapshot in the fixed field order. `assertCanonicalJsonBytes()`
encodes that snapshot's canonical JSON plus one final LF and compares both byte
length and every indexed byte with the original copied response.

This ordering ensures that the comparator does not trust the parsed object,
decoded string, input key order, duplicate-member behavior, or a caller-provided
serializer. A leading BOM, whitespace variation, alternate key order, duplicate
member, trailing data, invalid UTF-8, or missing LF cannot produce an accepted
inventory in the reviewed implementation and tests.

Evidence: `doctor.ts:220-229`, `doctor.ts:284-332`,
`doctor.ts:352-369`, `doctor.ts:386-443`, `doctor.ts:457-493`;
`doctor.test.ts:26-36`, `doctor.test.ts:201-233`,
`doctor.test.ts:271-302`, `doctor.test.ts:341-440`.

## Regression assessment

| Area | Re-review result |
|---|---|
| B-08 step 2/3 image identity binding | Remains closed for static/unit. Both observations validate image ID, repository digest, OS, and architecture; all accepted fields are cross-compared before environment keys enter an inventory. |
| B-10 structured key-only projection | Remains closed for static/unit. The fixed projection emits escaped key array elements rather than raw values; invalid framing, control characters, delimiters, duplicates, canary keys, and missing required keys remain rejected. |
| Three fixed command IDs and no arbitrary command/path/option | Passes source/test review. Runtime-branded commands remain limited to version and two local image-inspect operations. |
| Absolute executable/argv and no pull/build/create/start/run | Passes source/test review; production execution was not performed. |
| Timeout/output/nonzero/malformed/cleanup failure | Remains fail-closed in the reviewed tests and does not create an accepted inventory. |
| Host backend and import safety | Remains bounded to the disposable config, no inherited environment, `shell: false`, output/timeout limits, and import-safe construction. |
| Orchestrator approval boundary | Remains fail-closed with `M4_EXECUTION_NOT_APPROVED` before production backend construction or Docker access. |
| Runtime availability and enforcement | Not assessed, not executed, and not approved. |

Evidence: `doctor.ts:24-38`, `doctor.ts:166-211`,
`doctor.ts:397-493`, `doctor-host-backend.ts:55-199`,
`orchestrator.ts:3-30`; `doctor.test.ts:141-199`,
`doctor.test.ts:304-470`, `import-safety.test.ts`,
`orchestrator.test.ts`.

## Verification observed

| Command | Observed result |
|---|---|
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 13 test files, 114 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 13 files / 114 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 80 test files / 445 tests passed. |
| `git diff --check` | Exit 0 after the review record and status metadata were added. |
| `git status --short` | Confirmed that the target remains an uncommitted working tree containing existing M3/M4 changes plus this review-owned record/status update. |

After adding this review record and status metadata, `npm run m4:verify` and
`npm run check` were repeated with the same passing file/test counts.

The following commands were not run: `npm run m4:doctor`,
`npm run m4:build`, `npm run m4:run:controls`, and
`npm run m4:verify:evidence`. Doctor execution has no explicit human approval,
and later build/control steps have neither approved exact inputs nor execution
approval. No Docker/container command, runtime-socket access, local image/runtime
or host-environment enumeration, external network access, credential access,
host-home access, package install, host lifecycle experiment, remote Git
operation, commit, or publication was performed.

## Non-blocking findings and remaining limitations

### N-01 — Top-level M3 status was stale (resolved after review)

At review time, `README.md` still said the M3 independent re-review gate was
pending, while the M3 milestone and remediation review record said it was
approved with non-blocking follow-ups. The post-review documentation task has
corrected that status. This documentation-only closure does not change the
doctor decision.

### N-02 — Cleanup failure remains non-retryable and secondary-hidden

The original doctor review's N-02 remains unchanged. Cleanup failure is
fail-closed, but cleanup becomes non-retryable once marked closed and a prior
primary failure hides a secondary cleanup failure. This does not permit an
accepted inventory and is outside the B-09 remediation scope.

The fixed Docker client/server `29.6.1`, local Node base identity, and base
environment inventory remain unobserved candidates. No version-controlled
`profile.json`, accepted image-input file, built-image digest, runtime
inspection, control evidence, or profile Observed result exists. Node permission
model child denial, scratch/source enforcement, fixed loopback behavior,
inspection, evidence transfer, and cleanup remain unmeasured. Expected values
and experiment-matrix route Observed were not changed.

## Gate conclusion and next task

B-09 remains closed, and the fresh compatibility re-review approves the current
corrected doctor bytes for the static/unit gate. The corrected doctor has
established Docker client/server `29.6.1` and now stops at the unavailable exact
local base tag, so exact-input work remains blocked without an offline local
image carrying one `node@sha256:...` repository digest. A future worker must not
use external network, pull, credentials, image substitution, fabricated digest
metadata, build/control execution, or Observed claims to bypass that missing
input.
