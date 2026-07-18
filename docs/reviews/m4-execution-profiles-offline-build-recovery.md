# M4 offline-build recovery independent review

## Review target and decision

- Target: the current uncommitted post-cleanup-failure recovery implementation
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Failed-build/run/tag/value and brand binding: **ACCEPTABLE for static/unit**
- Retained-state content non-read and retention-only boundary: **ACCEPTABLE for static/unit**
- Single-inspect command/digest/result boundary: **ACCEPTABLE for static/unit**
- Production recovery backend static/unit gate: **BLOCKED**
- Blocking findings: B-16, B-17
- Recovery execution gate: **PENDING / BLOCKED; not defined or executed**
- Built-image/profile binding and runtime enforcement gates: **PENDING / BLOCKED; not executed**
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The implementation accepts only the recorded four-step
`inconclusive / CLEANUP_FAILURE` build result, fixed run ID and staged tag. It
adds a recovery-only canonical result and a production backend whose only
command is the fixed local image-ID inspect. The retained runtime-created files
are inspected by name/type/mode/size/link metadata and private identity only;
their contents are not read, hashed, copied, or serialized, and every result
retains the owned state.

The static/unit gate is nevertheless blocked. The metadata validator compares
only the low permission bits and therefore accepts setuid, setgid, or sticky
bits despite the exact-mode contract. Separately, after the bounded close grace
expires without a child `close` event, the backend keeps `activeChild` true but
allows the executor's post-attempt retained-state validation to succeed. That
can record the post-attempt state check while the fixed CLI process has not
settled and may still change the state.

This is a fresh independent read-only review. It did not modify the reviewed
implementation, execute Docker, inspect an image, change or delete the retained
production state, bind profiles, run controls, or establish runtime evidence.
The `continue-repository-work` standing authorization was not used to cross an
execution gate because this review expressly prohibits Docker execution. This
review is not a separate human review.

## Reviewed snapshot identity

The hashes below identify the reviewed bytes before this review record,
remediation prompt, and status metadata were added. They establish byte identity
only; they do not establish runtime behavior or recovery approval.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of repository-visible files under `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `77b08acd6c7f15b13e658ab34c7be1a858a43c3238974f04cff95da45e204786` |
| `containers/profile-control/src/offline-build-recovery.ts` | `579febbcdbd6e7b82dae95e0b5acfd5d1b905a0802f7e9e7f5432b4737598614` |
| `containers/profile-control/src/offline-build-recovery-host-backend.ts` | `92838006ce40b10cb40db1fc39870f860449e19a483bcf75bd7040a9bf1ac42d` |
| `containers/profile-control/test/offline-build-recovery.test.ts` | `3c1347afb87f940fd74e535d053daf4d22ad2a4e3c3f0fdeb7e5049e364eeeb2` |
| `containers/profile-control/test/offline-build-recovery-host-backend.test.ts` | `fa992df1bb3d1de0070ba01371856ba7ae3ed81efe03a81a9cd06daa046fab0a` |
| `containers/profile-control/scripts/verify-static.mjs` | `378fc3c96ed7f7b812b4a289cbcd037f5e16a95bf4e23950b7edf27cb1a8bb8a` |
| `prompts/m4-execution-profiles-offline-build-recovery.md` | `8ff94e1463657d034666913681c2db3ab38cf65834238e38b707ec59983f277a` |
| `prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md` | `1a9e6e47444f3d956838c42a048f82370728eb44beec4f80ae8dd5c781c5f169` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |

The aggregate manifest was produced by sorting the repository-visible file
names, hashing each file, and hashing the sorted manifest.

## Positive boundary assessment

### Recorded failure and fixed recovery identity

`createFixedOfflineBuildRecoveryInput()` first applies the existing canonical
offline-build result validator, then requires the exact recorded schema,
`CLEANUP_FAILURE`, all four completed steps, accepted base/staging digests,
client/server `29.6.1`, and null built-image digest. A private binding joins that
result to the newly created branded command and backend; cloned input and command
objects fail before state or command access.

The command is fixed to `/usr/bin/docker image inspect --format
'{{json .Id}}'` and the exact retained staged tag. The production factory derives
the repository and run roots from its module URL, accepts no path/run/tag/command
input, and can be created only once per module instance. The backend permits only
one command attempt after the first retained-state validation.

Evidence: `offline-build-recovery.ts:161-223`,
`offline-build-recovery.ts:367-434`, and
`offline-build-recovery-host-backend.ts:232-280`.

### Content, command, digest, and canonical-result boundary

The retained tree validator uses only `lstat`, `realpath`, and `readdir`. It
does not import a content-read or mutation API. Regular-file size and link count,
directory children, and device/inode identity are held privately. The read-only
metadata observation reproduced the recorded exact names, file types, ordinary
permission bits, sizes, and link counts; no retained file content was read.

Spawn is limited to the branded command, fixed repository cwd, retained
`DOCKER_CONFIG` as the sole environment key, `shell: false`, ignored stdin, and
bounded timeout/output handling. The parser requires fatal UTF-8, one final LF,
canonical original JSON-string bytes, lowercase SHA-256, and rejection of the
base, M0, and known synthetic digests. Complete and inconclusive canonical
results enforce the fixed 0/1/2/3-step semantic matrix, discard all digest data
on inconclusive paths, and always record `ownedStateDisposition: "retained"`.

The ordinary orchestrator remains `M4_EXECUTION_NOT_APPROVED`, and the package
root exports neither recovery executor nor host backend. Imports do not start
filesystem, child, timer, or Docker work.

Evidence: `offline-build-recovery-host-backend.ts:180-230`,
`offline-build-recovery-host-backend.ts:283-380`,
`offline-build-recovery.ts:244-341`, `offline-build-recovery.ts:436-572`,
`import-safety.test.ts:5-39`, and `verify-static.mjs:398-581`.

## Blocking findings

### B-16 — Exact retained modes accept unreviewed special permission bits

`captureExactRetainedState()` compares `(entry.mode & 0o777)` with the recorded
mode. This accepts entries whose ordinary bits are `0700`, `0600`, or `0644` but
whose setuid, setgid, or sticky bits are also set. The recovery contract requires
the exact recorded modes and focused mode-drift rejection, not just the low nine
permission bits. The current host-backend test changes `0600` to `0644` and does
not exercise any special bit.

Evidence: `offline-build-recovery-host-backend.ts:189-200` and
`offline-build-recovery-host-backend.test.ts:83-103`.

Impact: the validator can brand a retained tree that is outside the exact
reviewed metadata inventory. This is fail-open relative to the fixed pre/post
state contract even though the current retained tree's observed modes match.

Required remediation: compare all permission and special-mode bits against the
exact recorded value at both capture and post-validation, and add disposable
tests for setuid, setgid, and sticky substitutions on representative file and
directory entries. Do not chmod or otherwise mutate the fixed production tree.

### B-17 — Post-attempt state validation can run before child settlement

When timeout, output overflow, or process error triggers `stop()`, the backend
sends `SIGKILL` and waits 250 ms for `close`. If that grace expires,
`settle(null, false)` resolves the command while `activeChild` deliberately
remains true. `validateRetainedState()` checks only validation/attempt order and
does not reject the active child, so the executor's `finally` block can accept a
filesystem identity snapshot before process settlement. Existing tests inject a
fake `closeObserved: false` result and verify only that post-validation was
called; they do not cover the production active-child invariant.

Evidence: `offline-build-recovery-host-backend.ts:244-254`,
`offline-build-recovery-host-backend.ts:301-378`,
`offline-build-recovery.ts:407-427`, and
`offline-build-recovery.test.ts:233-295`.

Impact: an abnormal-close recovery result can claim the post-attempt
identity-check boundary while the fixed CLI process has not closed and may still
change the retained state. The operation remains inconclusive and exposes no
digest, but it does not satisfy the required process-settlement-before-state-
validation gate.

Required remediation: make post-attempt validation fail closed whenever a child
has not emitted `close`, preserve the earlier command/output/timeout primary
failure and null digest, and add a pure/private lifecycle regression proving that
close-deadline/active-child state cannot pass the post-validation boundary. Keep
the one-command, no-retry, retention-only behavior and do not add an arbitrary
process seam or Docker test.

## Remaining limitations

Even after remediation, static/unit evidence cannot establish that the fixed
staged tag still exists, a local inspect succeeds, or a built-image digest is
available. The exact one-command runtime boundary has not been activated or
reviewed as an execution gate. Recovery intentionally does not re-observe the
Docker version and does not delete the retained run state or image tag.

No `profile.json`, profile binding, control backend, runtime inspection/evidence,
Node permission-model denial, scratch/source enforcement, loopback result,
profile-control Observed, or route Observed was reviewed or created. Expected
values and ADR-0001 are unchanged.

## Verification observed

| Command | Observed result |
|---|---|
| Repository-visible sorted manifest and critical `sha256sum` calculation | Exit 0; reproduced reviewed aggregate `77b08acd...786` and all critical hashes above. |
| Read-only fixed retained-tree name/type/mode/size/link metadata projection | Exit 0; reproduced the recorded inventory without reading file contents or recording device/inode/absolute paths. |
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 19 test files, 211 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 19 files / 211 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 86 test files / 542 tests passed. |
| `git diff --check` | Exit 0 before this review record, remediation prompt, and status metadata were added. |
| `git status --short` | Confirmed the target is the existing uncommitted M3/M4 working tree; unrelated changes were preserved. |

The review did not run `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:run:controls`, `npm run m4:verify:evidence`, or another
Docker/container command. It did not access a runtime socket, inspect/pull/build
an image, create/start/run/remove a container, use external network or
credentials, enumerate a host environment, read host-home contents, run a
lifecycle experiment, modify/delete the retained production state, use remote
Git, commit, publish, or communicate externally. The only non-repository read
was the environment-provided skill instruction required by this invocation.

## Gate conclusion and next task

The failed-build/run/tag binding, retained-content non-read boundary,
single-inspect command, digest parser, canonical result, retention-only behavior,
and ordinary activation boundary are acceptable for static/unit. B-16 and B-17
block the production recovery backend static/unit gate and therefore block a
one-time recovery execution-gate definition.

The next task is the narrow non-executing remediation in
[`prompts/m4-execution-profiles-offline-build-recovery-remediation.md`](../../prompts/m4-execution-profiles-offline-build-recovery-remediation.md),
followed by a fresh independent read-only re-review. Docker access, recovery
execution, state deletion, built-image/profile binding, controls, runtime
enforcement, and Observed evidence remain separate later gates.
