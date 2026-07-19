# M4 offline-build recovery independent review

## Review target and decision

- Target: the current uncommitted post-cleanup-failure recovery implementation
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Failed-build/run/tag/value and brand binding: **ACCEPTABLE for static/unit**
- Retained-state content non-read and retention-only boundary: **ACCEPTABLE for static/unit**
- Single-inspect command/digest/result boundary: **ACCEPTABLE for static/unit**
- Production recovery backend static/unit gate: **ACCEPTED**
- Blocking findings: none
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

The static/unit gate is now passable. The metadata validator rejects special-mode
drift and blocks post-inspection retained-state validation while the child has
not emitted `close`, so un-settled abnormal-close outcomes remain fail-closed.

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
| Sorted SHA-256 manifest of repository-visible files under `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `e61747fa694e0bd6bd16df63dfc73c8fdcf4238dd20885ff54795923c8235795` |
| `containers/profile-control/src/offline-build-recovery.ts` | `579febbcdbd6e7b82dae95e0b5acfd5d1b905a0802f7e9e7f5432b4737598614` |
| `containers/profile-control/src/offline-build-recovery-host-backend.ts` | `597464b4aa20772cb1efabc0ece914322dfdce858be359a470b5863c7d5c5c2e` |
| `containers/profile-control/test/offline-build-recovery.test.ts` | `64e75a84df6786486a8ee20e61cb94b32a239598a743db324fda79047932ef0d` |
| `containers/profile-control/test/offline-build-recovery-host-backend.test.ts` | `2dcac1e0a72bf3c660cb01d2a62f79d58a066deaf1674fc17980daf979dda447` |
| `containers/profile-control/scripts/verify-static.mjs` | `378fc3c96ed7f7b812b4a289cbcd037f5e16a95bf4e23950b7edf27cb1a8bb8a` |
| `prompts/m4-execution-profiles-offline-build-recovery.md` | `8ff94e1463657d034666913681c2db3ab38cf65834238e38b707ec59983f277a` |
| `prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md` | `1a9e6e47444f3d956838c42a048f82370728eb44beec4f80ae8dd5c781c5f169` |
| `package.json` | `6a715c3f3559254d7b7611b380c9eae1b6b8354c09c5878ea44fcc3672b5f10f` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `cedf514b15c510847397db874226c599557beafb24960ffdc4ef6fa246952852` |
| `vitest.config.ts` | `b9c153897704dbabe350c9ae2b9dda4e033d0cae85d33a08ba54e24a18c8264c` |

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

## Non-blocking / resolved findings

- `B-16` and `B-17` were implemented and revalidated in this review:
  - `captureExactRetainedState()` now masks `0o7777` during mode comparison.
  - `validateRetainedState()` rejects the post-inspection state check while
    `activeChild` remains true.
  - Host backend regression covers production-like abnormal close with unresolved child.
  - Evidence: `offline-build-recovery-host-backend.ts:189-200`,
    `offline-build-recovery-host-backend.ts:244-254`,
    `offline-build-recovery-host-backend.ts:301-380`,
    and `offline-build-recovery-host-backend.test.ts:83-108`.

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
| Repository-visible sorted manifest and critical `sha256sum` calculation | Exit 0; reproduced reviewed aggregate `e61747fa...595` and all critical hashes above. |
| Read-only fixed retained-tree name/type/mode/size/link metadata projection | Exit 0; reproduced the recorded inventory without reading file contents or recording device/inode/absolute paths. |
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 19 test files, 216 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 19 files / 216 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 101 test files / 704 tests passed. |
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
and ordinary activation boundary are acceptable for static/unit. Production
recovery backend static/unit is accepted.

Issue-34 one-time recovery execution (2026-07-19) was completed once under the
approved gate and produced `validity=complete`, `primaryFailure=null`,
completed steps `validate-retained-state`, `inspect-image`, and
`validate-retained-state-after-inspect`, and `ownedStateDisposition="retained"`.
Built image digest is now `sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`.
State deletion and built-image/profile binding are separate and intentionally
deferred in this track.

Recovery trail handoff was updated to issue `#39` and now points to the scoped
`#40` control-binding/runtime gate. Its later fresh review blocked that gate on
B-18/B-19/B-20; `#41` remains the subsequent profile-control `Observed`
boundary alignment.
