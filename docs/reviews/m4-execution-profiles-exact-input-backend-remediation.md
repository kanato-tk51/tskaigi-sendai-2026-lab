# M4 exact-input backend remediation independent re-review

## Review target and decision

- Target: the current uncommitted M4 exact-input backend remediation working tree
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- B-11 Docker-format compatibility finding: **CLOSED for static/unit**
- B-12 pre-build runtime-version binding finding: **CLOSED for static/unit**
- Base/staging/fixed-backend contract gate: **APPROVED for static/unit**
- Exact-input adoption and production-backend activation: **PENDING / BLOCKED; not executed**
- Image build and built-image/profile binding gates: **PENDING / BLOCKED; not executed**
- Runtime enforcement gate: **PENDING / BLOCKED; not executed**
- New blocking findings: none
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The remediation preserves the accepted doctor inventory and repository staging
bytes while closing both findings from the original exact-input review. All
fixed Docker formats are centralized and reject the unsupported `dict` helper.
The profile pre-start format directly constructs the complete reviewed
projection with Docker's `json` helper. The build state machine now requires an
exact canonical client/server `29.6.1` payload immediately before build and
does not mark that step complete or invoke build when validation fails.

This is a fresh independent read-only review. It does not modify the reviewed
implementation or input, access Docker, adopt the exact input for production,
enable a production build backend, build an image, create `profile.json`, run
controls, or establish runtime evidence.

## Reviewed snapshot identity

The hashes below identify the reviewed working-tree bytes before this review
record and its status metadata were added. They establish byte identity only;
they do not establish runtime availability or enforcement.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `91a0735f5bc77d0d49c1771c9648de8d863081dcab9ecf9f3774ea480d3831e7` |
| `containers/profile-control/src/docker-formats.ts` | `6f24020cdd1a54b9fa8abfbee665babf99fc3a0a0240f7892b5b924f7c945725` |
| `containers/profile-control/src/docker-plan.ts` | `5bc051512ba9f0a60f709b4b633a2eb105ec2c1c166cfb73301706158ef314a1` |
| `containers/profile-control/src/execution.ts` | `c2d83d1a277db6dcadca6510f26e0ad3695619dc421b45503e98b50c72f41c13` |
| `containers/profile-control/src/inspect.ts` | `9c24c147ba5d2ef03606c9be3af1d9e7cdcd6aa14de6259960e14c6310b5c1d8` |
| `containers/profile-control/scripts/verify-static.mjs` | `189c5782a81cbfca27d0962bd9840fb4b6ca9937b21c9d6174a06dba1fa3ed21` |
| `containers/profile-control/test/docker-plan.test.ts` | `5e9b007ba35208f9743c8dd076cb52e7e9e3955dc79659f9dcb63caa3ce5dd97` |
| `containers/profile-control/test/execution.test.ts` | `1b7c7da70338d69fdcbeb7550e55985ce16b4b325898c1e31ad4140cfd1d0972` |
| `containers/profile-control/image-input.json` | `27700a64c4bf4211f21ea5efa534601232f5fa7aea6ef70f306fbb5ba61da7e9` |
| `docs/m4-execution-profiles-exact-input.md` | `5030fa2c42266cea131ee1c4986b422a0b5dd65fe8bbe1ad8c5c3ed046fa3fc5` |
| `prompts/m4-execution-profiles-exact-input-backend-remediation.md` | `6874cc91b0a994074afdcff15d813c2d392b1176e54ad7d3acaa8df58fb83738` |
| `prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md` | `15bd790fcfb7a949d26de4fd5ca3acfa7b79ffdcd01881adcf90726d8fa7a247` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |

The aggregate manifest was produced by sorting repository-relative file names,
hashing each file, and hashing the sorted manifest.

## Accepted input invariance

The versioned exact input retains the accepted Docker client/server `29.6.1`,
base digest
`sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`,
Node.js `v20.18.2`, `linux` / `amd64`, and ordered key-only environment
inventory `PATH`, `NODE_VERSION`, `YARN_VERSION`. The input contains no
environment values, host environment, credentials, host paths, stderr, raw
runtime errors, or canary values.

The four fixed staging files independently reproduce the accepted inventory:

| Order | Logical path | Bytes | SHA-256 |
|---:|---|---:|---|
| 0 | `Containerfile` | 347 | `sha256:9547126c36478783d0312d007cce35aa2de36b9c0994cfc4d19c0ff9336275fc` |
| 1 | `fixture/canary.txt` | 29 | `sha256:6bbdf1baeca26db45068ed461044e6c0941d3b644c1d5d7444a848eb930a3fc4` |
| 2 | `fixture/control-runner.mjs` | 9,159 | `sha256:f914a28fc827592c370ed855717bb55ba856733e8c423ea39baf4bc2254dcf8e` |
| 3 | `fixture/fixed-child.mjs` | 152 | `sha256:3f2fc1c0fb6cd0166d2afab93c0b8f2e4ab50ed404f385d2317d7b9756960191` |

The 388-byte ordered aggregate input hashes to
`sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03`.
This matches the already accepted review record, versioned input, fixed
constants, static verifier, and focused repository-byte test.

## Finding closure assessment

### B-11 — Docker 29.6.1-compatible full pre-start projection: closed for static/unit

`docker-formats.ts` centralizes all five fixed formats. The profile inspection
format constructs the 36-key object in the exact order required by
`validateDockerInspectProjection()` and applies only the already observed
Docker `json` helper to every dynamic field. It retains image, path, arguments,
user, environment, working directory, root/network/namespace/runtime policy,
capabilities, security options, mounts, devices, ports, logging, resource
limits, restart policy, and pre-start state. It does not use `dict` or replace
the projection with raw full-inspect retention.

The profile plan passes that one constant to the fixed pre-start `inspect`
command. The unit test independently reconstructs the complete ordered format,
and both unit and static checks reject `dict` across the centralized doctor and
profile format set.

Evidence: `docker-formats.ts:1-21`, `docker-plan.ts:345-364`,
`inspect.ts:21-57`, `docker-plan.test.ts:105-151`, and
`verify-static.mjs:403-425`.

This closure is static/unit only. The full profile format has not been invoked
against a created container, and no runtime inspection evidence is approved.

### B-12 — Exact pre-build client/server version binding: closed for static/unit

`createImageBuildPlan()` now fixes the pre-build command to
`docker version --format FIXED_RUNTIME_VERSION_FORMAT`, whose direct JSON shape
contains client then server. `runCommand()` invokes the payload validator after
exit, timeout, and output-limit checks but before adding the step to the
completed set. `executeFixedProfilePair()` runs build only after that validated
step returns.

`validatePreBuildRuntimeVersion()` requires an unshared nonempty `Uint8Array`
whose byte length equals reported stdout, fatal UTF-8, exactly one final LF,
no CR/NUL, exact keys, string values, fixed key order and byte-for-byte
canonical identity, and exact client/server `29.6.1`. It therefore cannot use
only exit 0, the prior doctor record, a server-only result, or a substituted
parsed object as build authority.

Focused negative tests reject wrong client, wrong server, invalid UTF-8,
noncanonical order, null, missing/extra/duplicate keys, and parsed-object
substitution before build. Existing command-result checks also reject timeout,
output overflow, nonzero exit, malformed result framing, and payload/stdout
length mismatch.

Evidence: `docker-formats.ts:1-2`, `docker-plan.ts:201-219`,
`execution.ts:129-170`, `execution.ts:200-255`, `execution.ts:505-531`, and
`execution.test.ts:405-440`.

## Safety and activation boundary

The accepted snapshot identity, private staging bytes, fixed repository-owned
layout, `/usr/bin/docker`, `shell: false`, credential-empty `DOCKER_CONFIG`
proposal, offline `--network none` / `--pull=false` build plan, fixed runtime
policy, timeout/output/transfer limits, and first-failure behavior remain
unchanged. No arbitrary executable, argv, cwd, path, environment, image, mount,
or runtime option was added by the remediation.

The ordinary orchestrator still accepts only five fixed operation names and
returns `M4_EXECUTION_NOT_APPROVED` before importing or constructing a
production backend. The package root does not export a production backend.
The reviewed executor remains exercised with a fake backend, so production
filesystem ownership, CLI process handling, local input availability, build
cleanup, and built-image inspection are not approved by this decision.

Evidence: `docker-plan.ts:37-64`, `docker-plan.ts:174-235`,
`orchestrator.ts:3-29`, `orchestrator.test.ts:8-31`, and
`verify-static.mjs:509-543`.

## Verification observed

| Command | Observed result |
|---|---|
| Sorted manifest SHA-256 plus independent `sha256sum` / `wc` / Node aggregate calculation | Exit 0; reviewed aggregate `91a0735f...831e7`; reproduced 347 / 29 / 9,159 / 152 bytes, all four per-file hashes, 388 aggregate bytes, and staging aggregate `sha256:81d6cfee...146a03`. |
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 14 test files, 127 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 14 files / 127 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 81 test files / 458 tests passed. |
| `git diff --check` | Exit 0 before this review record and status metadata were added. |
| `git status --short` | Confirmed the target is the existing uncommitted M3/M4 working tree; unrelated work was preserved. |

After adding this review record and status metadata, `npm run m4:verify` was
repeated and exited 0 with 14 files / 127 tests. `npm run check` was repeated
and exited 0 with 81 files / 458 tests.

The review did not run `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:run:controls`, or `npm run m4:verify:evidence`. It did not access
Docker or a runtime socket, inspect/pull/build an image, create/start/run a
container, use external network or credentials, read host-home file contents,
enumerate a host environment, run a lifecycle experiment, use remote Git,
commit, publish, or communicate externally. During initial instruction
discovery, the worker inadvertently ran `find .. -name AGENTS.md -print`, which
enumerated sibling
`AGENTS.md` path names outside the repository. It did not read those sibling
files or credential contents, but the path enumeration exceeded the intended
repository-only discovery boundary and is recorded here as a process deviation.

## Gate conclusion and next task

B-11 and B-12 are closed for the static/unit boundary, and the reviewed
base/staging/fixed-backend contract is approved with no new blocking finding.
This does not adopt the exact input for production, enable a production
backend, approve or execute an image build, bind a built image to profiles, or
approve runtime enforcement.

The next task is to define the narrow, non-executing production offline-build
backend implementation contract and its independent review prompt. It must bind
only this reviewed snapshot and fixed command plan, retain the ordinary
`M4_EXECUTION_NOT_APPROVED` path, and must not access Docker. A later fresh
implementation/review and separately recorded execution gate are required
before one offline build; profile binding and control execution remain later
gates.

## Offline-build backend contract handoff

The subsequent
[non-executing implementation contract](../../prompts/m4-execution-profiles-offline-build-backend.md)
and
[independent review prompt](../../prompts/reviews/m4-execution-profiles-offline-build-backend-review.md)
now fix that boundary. The implementation must add a build-only executor and a
production host backend bound to this accepted snapshot, a branded fixed layout,
and the existing runtime-version/build/image-inspect plan while leaving the
ordinary entry and package root unable to reach the production backend.

This handoff records documentation state only. It does not implement or review
the backend, access Docker, approve an image build, produce a built-image digest,
bind profiles, run controls, or establish Observed evidence. The next task is the
non-executing static/unit implementation under that contract.
