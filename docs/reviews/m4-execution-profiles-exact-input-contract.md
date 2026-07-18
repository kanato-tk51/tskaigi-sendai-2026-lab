# M4 exact-input contract independent review

## Review target and decision

- Target: the current uncommitted M4 exact-input proposal working tree
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Doctor-to-versioned-input trace: **ACCEPTABLE**
- Repository staging bytes/inventory gate: **APPROVED**
- Fixed host-backend/runtime contract gate: **BLOCKED**
- Overall base/staging/backend exact-input gate: **BLOCKED**
- New blocking findings: B-11, B-12
- Image build and built-image/profile binding gates: **PENDING / BLOCKED; not executed**
- Runtime enforcement gate: **PENDING / BLOCKED; not executed**
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The versioned input correctly binds the accepted doctor candidate's base digest,
Node.js version, and ordered key-only environment inventory to an exact-key
object. The four repository staging files independently reproduce every recorded
size and SHA-256 and the ordered aggregate
`sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03`.
The fixed-value validator, branded accepted snapshot, static verifier, and
focused substitution tests preserve that base/staging boundary.

The overall gate cannot be approved. The proposed exact runtime is Docker
client/server `29.6.1`, but the later profile pre-start inspection still uses
the same unsupported Go-template `dict` helper that previously made the fixed
doctor fail on that runtime. In addition, the build state machine runs a
server-only version command and accepts any successful result without checking
its payload. The exact runtime is therefore neither compatible with the fixed
inspection command nor bound to the later build invocation.

This is a fresh independent read-only review. It does not change the proposal
implementation or input values, run Docker, adopt the exact input, approve an
image build, create `profile.json`, run controls, or establish runtime evidence.

## Reviewed snapshot identity

The hashes below identify the reviewed working-tree bytes before this record,
its remediation prompt, and status metadata were added. They establish byte
identity only, not runtime approval or correctness by themselves.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `790a76956c05b113f933ef72a2830f4399bd1e5743a62d31ba6b1564a8552952` |
| `containers/profile-control/image-input.json` | `27700a64c4bf4211f21ea5efa534601232f5fa7aea6ef70f306fbb5ba61da7e9` |
| `containers/profile-control/src/constants.ts` | `10618b738f95cdcc8523554c27b43253c676d4fd229a6b641262973529d273f8` |
| `containers/profile-control/src/image-input.ts` | `3d62d6842d7b0aafde8cc42a647c31235860411a9c77acaaae8e60b4de7fe16c` |
| `containers/profile-control/src/staging.ts` | `795fd1a75981439f3f70956bd383fa8cf85a3703634dc6eef58cfd698343c9e5` |
| `containers/profile-control/src/docker-plan.ts` | `2b057ce4c374568b9afc632053514e051aa8a18c9c714d0c921823bd6e39d99a` |
| `containers/profile-control/src/execution.ts` | `0df055997f1d9114b41f5740cb01bbc230923c6f83e27be391de6b323f727d5a` |
| `containers/profile-control/test/exact-input.test.ts` | `8c23725e8436a035e92eb0052f56a32c2f283a779e2f00152a7827cca039ce52` |
| `containers/profile-control/scripts/verify-static.mjs` | `da644d82ac588addef637b5e7dc1eefa7a1514a955d4e4ceedddd2f0b71f47ec` |
| `docs/m4-execution-profiles-exact-input.md` | `7cf2d98c0c289333ffadd756dbc722752a56e58bd05e0a2f3539abc4759a9fff` |
| `docs/reviews/m4-execution-profiles-runtime-template-compatibility.md` | `bc12cd5847ec27040250dde1da62d09503c0a050990d0860ab0a96480170f8ce` |
| `prompts/m4-execution-profiles-exact-input-contract.md` | `fcd9891f0305601a9632ac5ae4396739f378596e428cc78397720f38373cf930` |
| `prompts/reviews/m4-execution-profiles-exact-input-contract-review.md` | `b50869f4189c94319d344715e8258cc1166d741de99625cd86226b84baa5e26e` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |

The aggregate manifest was produced by sorting repository-relative file names,
hashing each file, and hashing the sorted manifest.

## Doctor-to-input and base-identity assessment

The accepted doctor record fixes Docker client/server `29.6.1`, local tag
`node:20.18.2-bookworm-slim`, repository digest and local image ID
`sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`,
Node.js `v20.18.2`, `linux` / `amd64`, and ordered environment keys `PATH`,
`NODE_VERSION`, `YARN_VERSION`. The record also states that only key names were
retained and that the ordinary orchestrator was restored to its fail-closed
state.

`image-input.json` uses the corresponding base digest, Node.js version, and
ordered environment inventory. Its exact keys are schema version, base image
name/digest, Node.js version, base environment keys, staging files, and staging
digest. `validateVersionedImageInput()` first applies the structural validator
and then rejects any substitution of the recorded base digest, environment-key
order/content, or staging aggregate. The base name and Node.js version are also
fixed by the structural validator.

Environment values, host environment, credentials, host absolute paths,
stderr, raw runtime errors, and canary values are absent from the versioned
input and the public accepted snapshot. The proposal uses the repository digest
for the offline build rather than the local tag or a synthetic/M0 Node.js 24
input.

## Independent staging-byte assessment

The review independently read and hashed the four fixed repository files using
the documented `logicalPath NUL byteLength NUL sha256`, LF-separated, final-LF
algorithm.

| Order | Logical path | Bytes | SHA-256 |
|---:|---|---:|---|
| 0 | `Containerfile` | 347 | `sha256:9547126c36478783d0312d007cce35aa2de36b9c0994cfc4d19c0ff9336275fc` |
| 1 | `fixture/canary.txt` | 29 | `sha256:6bbdf1baeca26db45068ed461044e6c0941d3b644c1d5d7444a848eb930a3fc4` |
| 2 | `fixture/control-runner.mjs` | 9,159 | `sha256:f914a28fc827592c370ed855717bb55ba856733e8c423ea39baf4bc2254dcf8e` |
| 3 | `fixture/fixed-child.mjs` | 152 | `sha256:3f2fc1c0fb6cd0166d2afab93c0b8f2e4ab50ed404f385d2317d7b9756960191` |

The aggregate input is 388 bytes and hashes to
`sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03`,
matching `image-input.json`, constants, documentation, static verification, and
the focused repository-byte test.

`prepareStagingInput()` copies non-empty non-shared bytes, enforces the exact
ordered inventory and bounds, and derives per-file and aggregate evidence.
`createAcceptedImageStagingSnapshot()` requires a branded prepared input whose
aggregate matches the validated image input and privately retains copied bytes.
The execution state machine later stages private copies, reads them back, and
rejects replacement, extra, missing, or reordered files before the build step.

## Blocking findings

### B-11 — Fixed profile inspection uses a Docker 29.6.1-incompatible template helper

`FIXED_INSPECT_FORMAT` constructs the full pre-start projection with
`{{json (dict ...)}}`. The repository's fresh runtime-template compatibility
review records that Docker `29.6.1` does not provide the `dict` helper and that
the same helper caused the fixed doctor command to exit before producing its
first observation. The doctor formats were corrected to direct `json`-only
objects, but the profile inspection format was not.

Evidence: `docker-plan.ts:34-36`, `docker-plan.ts:353-357`,
`runtime-template-compatibility.md:15-18`. The static verifier rejects `dict`
only in `doctor.ts` and requires the incompatible profile format without a
compatibility regression; the command-plan test checks only that the same
constant is present.

Impact: the exact reviewed runtime cannot produce the required pre-start host
inspection. A later control attempt would fail closed and remain inconclusive,
but the fixed host-backend/runtime contract is not executable as proposed.

Required remediation: replace the profile projection with a fixed canonical
format using only helpers supported by Docker `29.6.1`, retain every reviewed
security field and exact-key validation, reject `dict` across both doctor and
profile formats, and add focused compatibility/static regression tests. Do not
run Docker or weaken the host-inspection requirements.

### B-12 — The build invocation does not bind or validate the exact runtime version

`createImageBuildPlan()` creates a server-only `docker version` command, while
the proposal requires exact client/server `29.6.1`. `executeFixedProfilePair()`
runs that command as the `doctor` step but discards its payload and proceeds to
build after any exit-0 result. The positive fake backend returns `null` for that
step and the pair still completes; no negative test substitutes a valid-looking
wrong client/server version or malformed version output.

Evidence: `docker-plan.ts:198-203`, `execution.ts:451-456`,
`execution.test.ts:115-128`, `execution.test.ts:296-312`.

Impact: the accepted one-time doctor observation is not bound to the later
offline build. A changed runtime can reach the build and inspection state
machine despite the exact-input contract's fixed-version claim.

Required remediation: make the pre-build runtime command report both client and
server in a fixed canonical representation, validate both as exactly `29.6.1`
before build, reject malformed/noncanonical/mismatched/null payloads in focused
tests, and keep the production backend and Docker access disabled.

## Non-blocking findings and remaining limitations

The original doctor cleanup limitation remains: cleanup failure is fail-closed
but non-retryable and can be hidden behind an earlier primary failure. It does
not allow an accepted input or affect the independently reproduced staging
bytes.

The exact base tag's local availability was observed only in the recorded
doctor attempt and was not re-inspected by this review. No built-image digest,
`profile.json`, production build/control backend, runtime inspection, evidence
transfer, cleanup observation, Node permission-model denial, scratch/source
enforcement, loopback result, profile-control Observed, or route Observed was
reviewed or created. Static/unit success does not establish those outcomes.

## Verification observed

| Command | Observed result |
|---|---|
| Independent `sha256sum` / `wc -c` and Node aggregate calculation over the four fixed staging files | Exit 0; reproduced 347 / 29 / 9,159 / 152 bytes, all four per-file SHA-256 values, a 388-byte aggregate input, and aggregate `sha256:81d6cfee...146a03`. |
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 14 test files, 117 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 14 files / 117 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 81 test files / 448 tests passed. |
| `git diff --check` | Exit 0 before review-owned files and status metadata were added. |
| `git status --short` | Confirmed that the target is an uncommitted working tree containing existing M3/M4 changes. |

The first post-record `npm run m4:verify` reached the static verifier and stopped
because a historical documentation marker had been wrapped across two lines;
the verifier intentionally checks that literal pre-review marker. The metadata
was corrected without changing implementation or input bytes. The final
post-record `npm run m4:verify` exited 0 with 14 files / 117 tests,
`npm run check` exited 0 with 81 files / 448 tests, and `git diff --check`
remained successful.

The review did not run `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:run:controls`, or `npm run m4:verify:evidence`. It did not access
Docker or a runtime socket, inspect/pull/build an image, run a container or
lifecycle experiment, use external network or credentials, access host home,
use remote Git, commit, or publish.

## Gate conclusion and next task

The doctor-to-input trace and exact repository staging bytes are acceptable,
but B-11 and B-12 block the combined base/staging/backend gate and exact-input
adoption. The next task is the narrow non-executing backend compatibility and
runtime-version binding remediation in
[`prompts/m4-execution-profiles-exact-input-backend-remediation.md`](../../prompts/m4-execution-profiles-exact-input-backend-remediation.md),
followed by a fresh independent read-only re-review. Image build,
built-image/profile binding, and control execution remain separate later gates.

## Post-review remediation handoff

The narrow non-executing B-11/B-12 remediation is now implemented. This update
records implementation state only; it does not revise this review's blocked
decision or claim that either finding is independently closed.

- B-11: all fixed Docker formats are centralized, the profile pre-start format
  directly constructs the complete reviewed object using Docker `29.6.1`'s
  `json` helper, and unit/static regressions reject `dict` across doctor and
  profile formats while checking the full profile projection.
- B-12: the pre-build version command emits fixed-order client/server JSON, and
  execution requires fatal UTF-8, one final LF, exact keys, canonical original
  bytes, and exact client/server `29.6.1` before adding the version step to the
  completed set or invoking build. Focused tests reject wrong client, wrong
  server, malformed, noncanonical, null, missing, extra, duplicate, and parsed
  object substitution payloads before build.
- The accepted base/environment/staging input is unchanged. The production
  backend remains disabled, the ordinary orchestrator remains fail closed at
  `M4_EXECUTION_NOT_APPROVED`, and no Docker/container command was run for the
  remediation.

The next task is the fresh independent read-only re-review in
[`prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md`](../../prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md).
Exact-input adoption, image build, built-image/profile binding, control
execution, runtime enforcement, and all Observed evidence remain separate later
gates.
