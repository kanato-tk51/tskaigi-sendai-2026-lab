# M4 runtime-template compatibility correction independent re-review

## Review target and decision

- Target: the current uncommitted doctor runtime-template compatibility correction
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Runtime-template compatibility static/unit gate: **APPROVED**
- Fixed doctor static/unit gate for the current bytes: **APPROVED**
- Doctor execution gate: **PENDING / BLOCKED; not executed by this review**
- Exact-input and runtime enforcement gates: **PENDING / BLOCKED; not executed**
- New blocking findings: none
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The correction removes the Docker 29.6.1-incompatible Go-template `dict`
helper from all three fixed doctor formats. Each format now writes the fixed
canonical object shape directly and applies Docker's supported `json` helper to
the individual values. The environment format continues to emit only escaped
keys before the first `=` and never emits environment values.

The fixed command IDs, absolute executable, immutable argv, runtime command
branding, no-pull/no-build boundary, canonical original-byte validation, and
step 2/3 image-identity binding remain unchanged. The current source is
therefore approved for the static/unit doctor boundary.

This review was performed by a fresh `continue-repository-work` worker because
the prior review record identified fresh static/unit review as the next task.
It is an independent review decision, not a separate human review. The worker
did not use standing authorization to execute the doctor and did not run a
Docker/container command.

## Reviewed snapshot identity

The hashes below identify the reviewed working-tree bytes before this record
and its status metadata were added. They establish byte identity only, not
runtime approval or correctness by themselves.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `dc22e690239dfc20f5a6d8319a0cf25efa3069d84dc16f44bd40a576daba66fb` |
| `containers/profile-control/src/doctor.ts` | `037190f4f165e1dd647a102fa32c18d72c9564cdd2048b7013c320061e88ef90` |
| `containers/profile-control/test/doctor.test.ts` | `42379ef61682bc35124902920437f1c0128d8180d21a96f1b68ac7213d02925f` |
| `containers/profile-control/scripts/verify-static.mjs` | `654b0471c257662c667063933c88f654ce10c82f7a1b208ec300e4b012871d20` |
| `containers/profile-control/src/doctor-host-backend.ts` | `bea7c8c3316a0f989c884398037587517fecd06b0bc9ec1d8e7566ce05fb6fbd` |
| `containers/profile-control/src/orchestrator.ts` | `fefc2af9c7f69428383eba03d8bb49b0caa51a5332043e8741db39352fb1faf6` |
| `containers/profile-control/src/orchestrator-entry.ts` | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |
| `docs/m4-execution-profiles.md` | `1b2f6606a397fa2fbb3d34da5c171a0fd3db80ca8ca51fd524a3e01bfd6bf10c` |
| `docs/milestones.md` | `bf25910b89b36719484eff98abfc0a62505686b93d2586c531c3e307a13506c3` |
| `docs/architecture.md` | `4fff3d51b5911c3ab0e33de5360eab913b39779180c73ed70bf410532ab61d44` |
| `docs/reviews/m4-execution-profiles-doctor-canonical-bytes-remediation.md` | `7566982d619a8282d9f4eefb4a15a1a3833198f837c36fe81b7ddb15b650fe0f` |

The aggregate manifest was produced by sorting the repository-relative file
list, hashing each file, and hashing that sorted manifest.

## Compatibility and safety assessment

### Fixed compatible canonical formats

`FIXED_RUNTIME_VERSION_FORMAT` writes `client` and `server` in the parser's
canonical key order. `FIXED_BASE_IMAGE_INSPECT_FORMAT` writes architecture,
image ID, OS, and repository digests in the canonical identity order. The third
format writes the same identity plus a structured environment-key array in the
canonical environment snapshot order. All dynamic fields pass through `json`;
none of the formats contains `dict`.

The prior corrected doctor attempt recorded by the canonical-byte review
completed `runtime-version`, which is consistent with the corrected first
format on Docker 29.6.1. This review did not reproduce that runtime observation.
The two image formats remain runtime-unobserved because the exact local tag was
unavailable.

Evidence: `doctor.ts:24-42`, `doctor.test.ts:143-199`,
`verify-static.mjs:292-320`.

### Fixed execution boundary regression

`createFixedDoctorPlan()` still constructs only `runtime-version`,
`base-image-identity`, and `base-environment-keys`, using `/usr/bin/docker`,
fixed argv, `shell: false`, and the private runtime command brand. The formats
do not introduce pull, build, create, start, run, arbitrary image, arbitrary
command, or arbitrary option inputs.

The production host backend remains limited to the disposable credential-empty
Docker configuration, no inherited environment, fixed cwd, bounded output and
timeout, and bounded cleanup target. The ordinary orchestrator source still
returns `M4_EXECUTION_NOT_APPROVED` before importing or constructing that
backend.

Evidence: `doctor.ts:170-214`, `doctor-host-backend.ts:55-199`,
`orchestrator.ts:3-30`, `orchestrator-entry.ts:1-15`;
`doctor.test.ts:143-209`, `orchestrator.test.ts`,
`import-safety.test.ts`.

### Parser and identity regression

The change does not alter the parser. All three outputs still require fatal
UTF-8 decoding, exact keys, canonical JSON plus one LF matching the original
bytes, and output-specific type validation. The image and environment
observations still validate and cross-compare image ID, one `node@sha256:...`
repository digest, OS, and architecture before environment keys can enter an
inventory. Invalid markers, control characters, delimiter-bearing keys,
duplicates, canary keys, and missing required keys remain unaccepted.

Evidence: `doctor.ts:220-493`; `doctor.test.ts:212-470`.

## Verification observed

| Command | Observed result |
|---|---|
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 13 test files, 115 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 13 files / 115 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 80 test files / 446 tests passed. |
| `git diff --check` | Exit 0 before this review record and its status metadata were added. |

The review did not run `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:run:controls`, or `npm run m4:verify:evidence`. It did not access
Docker or a runtime socket, inspect/pull/build an image, use external network or
credentials, enumerate a host environment, run a lifecycle experiment, use
remote Git, commit, or publish.

## Post-review bootstrap and fixed doctor follow-up

After this review, the project human approved and completed the separately
recorded one-time exact-tag registry bootstrap. A fresh
`continue-repository-work` worker then verified the reviewed aggregate manifest
and every critical source/package/toolchain SHA-256 above. `npm run m4:verify`
exited 0 with 13 files and 115 tests before execution.

The worker used the skill's standing authorization for exactly one new
`npm run m4:doctor` attempt. This was not a separate human review. The attempt
exited 0 with `validity: accepted`, no primary failure or rejection, and all
three fixed steps completed. Its sanitized candidate inventory was:

| Field | Observed candidate |
|---|---|
| Docker client/server | `29.6.1` / `29.6.1` |
| Exact base tag | `node:20.18.2-bookworm-slim` |
| Repository digest | `node@sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0` |
| Local image ID | `sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0` |
| OS / architecture | `linux` / `amd64` |
| Node.js | `v20.18.2` |
| Base environment keys | `PATH`, `NODE_VERSION`, `YARN_VERSION` |

The fixed CLI performed only runtime version and two local image-inspect
operations. It did not pull, build, create, start, or run a container; use
external network or credentials; retain environment values, stderr, raw errors,
host paths, or runtime-socket details; or create profile-control/route Observed
evidence. The temporary doctor reachability was removed immediately after the
single attempt, and both source and compiled entry output were restored to the
ordinary `M4_EXECUTION_NOT_APPROVED` path. A post-restoration `npm run m4:verify`
again exited 0 with 13 files / 115 tests, and `npm run check` exited 0 with 80
files / 446 tests.

## Remaining limitations and next gate

The existing N-02 cleanup limitation remains: cleanup failure is fail-closed,
but it is not retryable and can be hidden as a secondary failure. It does not
permit an accepted inventory.

At review time the exact local tag was unavailable; the post-review bootstrap
and accepted doctor attempt above supersede that external-readiness blocker.
The inventory is still only a candidate. No version-controlled accepted image
input, `profile.json`, built-image digest, runtime inspection, controls, or
profile Observed evidence exists. Expected values and experiment-matrix route
Observed remain unchanged.

The next task is the exact-input contract task in
`prompts/m4-execution-profiles-exact-input-contract.md`: bind the accepted
candidate inventory to repository-owned staging bytes and prepare it for a
fresh independent read-only review. It must not build an image or run controls.
Build and control execution remain separate later approval gates.
