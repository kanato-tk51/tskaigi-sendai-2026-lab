# M4 one-time offline-build recovery execution gate independent review

## Review target and decision

- Target: the current uncommitted `recovery one-time execution gate` definition.
- Base HEAD: `3c54135d3f1e812035d8a506bfaf5fa1dd264c53`
- Reviewed source/staging snapshot identity: **REPRODUCED**
- Fixed execution boundary (`run id`, `staged tag`, `run root`, `single inspect`, `failure/digest matrix`) : **ACCEPTED**
- One-time/no-retry rule: **ACCEPTED**
- Exact command execution: **NOT EXECUTED IN THIS REVIEW**
- `ownedStateDisposition: retained` and no state deletion: **ACCEPTED**
- profile-binding/runtime enforcement/Observed: **PENDING / BLOCKED**

The gate is approved for a subsequent execution issue to perform exactly one
recovery invocation under this fixed boundary.

## Reviewed identity and hashes

The aggregate identity used for review is:

| Target | SHA-256 |
|---|---|
| `containers/profile-control/src/offline-build-recovery.ts` | `579febbcdbd6e7b82dae95e0b5acfd5d1b905a0802f7e9e7f5432b4737598614` |
| `containers/profile-control/src/offline-build-recovery-host-backend.ts` | `597464b4aa20772cb1efabc0ece914322dfdce858be359a470b5863c7d5c5c2e` |
| `containers/profile-control/test/offline-build-recovery.test.ts` | `64e75a84df6786486a8ee20e61cb94b32a239598a743db324fda79047932ef0d` |
| `containers/profile-control/test/offline-build-recovery-host-backend.test.ts` | `2dcac1e0a72bf3c660cb01d2a62f79d58a066deaf1674fc17980daf979dda447` |
| `containers/profile-control/scripts/verify-static.mjs` | `378fc3c96ed7f7b812b4a289cbcd037f5e16a95bf4e23950b7edf27cb1a8bb8a` |
| `docs/reviews/m4-execution-profiles-offline-build-recovery.md` | `b9cf3d3d6cf4466c08a57a6a94d7676c2d8779f81bb2899e3dd893bdb252b9ee` |
| `prompts/m4-execution-profiles-offline-build-recovery-execution.md` | `ac2587ac98bba0efbdad6b1304ad545cc1232388fd03e8f1e5e9190283a3e90e` |
| `prompts/reviews/m4-execution-profiles-offline-build-recovery-gate-review.md` | `b517e621680b89991372880a103d9bf2374b449d52d9dc6b7290c6bfa0bf3e53` |
| `package.json` | `6a715c3f3559254d7b7611b380c9eae1b6b8354c09c5878ea44fcc3672b5f10f` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `cedf514b15c510847397db874226c599557beafb24960ffdc4ef6fa246952852` |
| `vitest.config.ts` | `b9c153897704dbabe350c9ae2b9dda4e033d0cae85d33a08ba54e24a18c8264c` |

Sorted aggregate manifest SHA-256: `0af173499e3f8749fbce9a76e3340646a4b6cdfeb9ca5f9ecfd1a66033edea7a`.

## Boundary checks

- fixed recorded result: `validity=inconclusive` / `primaryFailure=CLEANUP_FAILURE` with
  four completed steps and `builtImageDigest: null` is fixed as the only recoverable
  source.
- `run root`: `results/runs/m4-profile-controls/m4-offline-build-20260718-01` exists and is preserved.
- fixed staged tag: `tskaigi-m4-profile-control:staged-m4-offline-build-20260718-01` is the only bound tag.
- one-shot `recovery execution`: exactly one attempt max.
- `STATE_VALIDATION_FAILURE` and `COMMAND_FAILURE`/`COMMAND_TIMEOUT`/`OUTPUT_LIMIT`/`INSPECTION_FAILURE`/`OWNED_STATE_FAILURE` are the valid failure map buckets.
- `builtImageDigest` non-null allowed only on `complete`.
- `ownedStateDisposition` fixed to `retained` (no deletion).

The fixed command is defined in the paired execution-gate definition prompt; this
review does not execute it.

## Verification observed

| Command | Observed result |
|---|---|
| `npm run m4:typecheck` | Exit 0 |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim |
| `npm run m4:test` | Exit 0; 19 files / 216 tests passed |
| `npm run m4:verify` | Exit 0; repeats 19 files / 216 tests |
| `npm run check` | Exit 0; 101 files / 704 tests passed plus lint/format/typecheck |
| `git diff --check` | Exit 0 |
| `git status --short` | Multiple unrelated modified files present; this task did not alter the unrelated working tree |

## Non-executing constraints honored

- No Docker execution, no credential/login/config mutation.
- No host-home or runtime-socket dependency.
- No `npm run m4:build`, `npm run m4:run:controls`, `npm run m4:verify:evidence`,
  lifecycle experiment, or recovery command execution.
- No state deletion or alternate tag/re-run attempt.

## Gate conclusion and next task

The one-time recovery execution gate is approved for next-step execution with the
existing boundary constraints.

Issue-34 execution status (`npm run --silent m4:recovery:offline-build`) has been completed once under this gate: canonical result is `validity=complete`, `primaryFailure=null`, completed steps are `validate-retained-state`, `inspect-image`, and `validate-retained-state-after-inspect`, `ownedStateDisposition` is `retained`, and built image digest is `sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`. Source/compiled output was restored and no profile-binding/runtime-control step was executed in this issue.

The recovery trail update is complete and was recorded as the handoff target in
issue `#39`; the execution history now points to the control-binding/runtime
enforcement follow-on.

Profile-control promotion proceeds only after explicit approval of `#40`
(`run:controls` runtime enforcement gate), followed by `#41`
profile-control `Observed` boundary alignment.
