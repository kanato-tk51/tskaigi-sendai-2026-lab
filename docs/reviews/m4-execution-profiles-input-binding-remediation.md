# M4 input-binding remediation independent re-review

## Review target and decision

- Target: the current uncommitted M4 input-binding remediation working tree
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Static/unit implementation gate: **APPROVED**
- Runtime enforcement gate: **PENDING / BLOCKED; not executed**
- Findings closed for the static/unit boundary: B-03, B-04, B-07
- Previously closed findings that remain closed: B-01, B-02, B-05, B-06
- New blocking findings: none
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The accepted image input, private staged bytes, exact staging inventory/digest,
base-environment key inventory, image build plan, profile pair, and fixed runtime
layouts now share one nominally and runtime-branded snapshot identity. The fixed
executor passes copied accepted bytes to the staging boundary, reads the build
context back, and rejects byte or inventory drift before the build step. It also
derives the inspection environment allowlist from the same accepted snapshot.

This decision approves only the reviewed static/unit boundary. It does not
approve Docker access, image build or pull, container execution, runtime
enforcement, or Observed evidence. The orchestrator still returns
`M4_EXECUTION_NOT_APPROVED` before Docker access.

## Reviewed snapshot identity

The hashes below identify the reviewed working-tree bytes before this review
record and status metadata were added. They establish byte identity only, not
runtime approval.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `6129d51a0986e0bc83c0abe29bcf111a8b739cca769e5a1dbede02039473ea7b` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |
| `docs/m4-execution-profiles.md` | `e3539d6f0f1f5eb3c494890433b67e7d0f97eaf714d0c954ad56a70d38a08623` |
| `docs/milestones.md` | `8aba28870583d9190d2b4c3c5221ac7650b71970d1081f39b30dfda5217e7c35` |
| `docs/architecture.md` | `2738687c3dc6e5883ccc542dcd1b97c88dab9038b8809892055b764617f43b1a` |
| `docs/reviews/m4-execution-profiles-remediation.md` | `85ab91b24ade92e29b523cc5be76b4ec32cd41435730f1a3dfb2c6c05f09efc4` |
| `prompts/m4-execution-profiles-input-binding-remediation.md` | `34dbef227561a92c2d1555bcdab89e2cad3b7f088799eff9907b15436f69df1c` |
| `prompts/reviews/m4-execution-profiles-input-binding-remediation-review.md` | `8b0d87cda91f5ef87ffa2bb28a3ef9988ad2fb22e71afc3ab63f05d5a39f7294` |

The aggregate manifest was produced by sorting the repository-relative file
list, hashing each file, and hashing that sorted manifest.

## Finding closure assessment

### B-03 — Same image, staging bytes, and two-run identity: closed for static/unit

`createAcceptedImageStagingSnapshot()` copies the approved bytes into private
storage and retains their exact ordered inventory and aggregate digest. The
profile pair is bound to that snapshot by object identity, uses one built-image
digest, and requires distinct permissive/constrained run IDs. Build and pair
plans retain the same snapshot and layout identities in private bindings.

At execution, the pair, build plan, pair plans, layouts, image digest, staging
digest, and run IDs are cross-validated before any backend call. The executor
then stages private accepted byte copies into the fixed permissive build-context
path, reads the path back, verifies the exact ordered inventory, byte identity,
per-file digest, and aggregate digest, and only then calls the build step.

Evidence: `staging.ts:24-31`, `staging.ts:128-166`,
`staging.ts:178-233`, `definitions.ts:238-293`,
`docker-plan.ts:84-131`, `docker-plan.ts:176-231`,
`docker-plan.ts:365-425`, `execution.ts:395-470`.

### B-04 — Approved base-environment inventory in pre-start inspection: closed for static/unit

The accepted snapshot includes a copied, frozen base-environment key inventory.
The fixed executor no longer accepts a parallel `baseEnvironmentKeys` input; it
passes `acceptedSnapshot.baseEnvironmentKeys` to both profile inspections. The
build plan, profile pair plans, and layouts must all carry the same private
snapshot/layout binding before inspection can run. A second syntactically valid
accepted snapshot with substituted environment keys is rejected before any
backend call.

The inspection validator continues to require the exact ordered base keys plus
only the reviewed permissive canary key, while its public projection stores no
base environment value or host absolute mount source. Its focused drift table
covers every projected security field, including devices, device requests,
runtime, namespaces, mounts, environment, capabilities, security options,
logging, restart policy, and resource limits.

Evidence: `staging.ts:156-165`, `execution.ts:395-426`,
`execution.ts:481-495`, `inspect.ts:95-127`, `inspect.ts:228-299`,
`inspect.test.ts:13-150`, `execution.test.ts:382-396`.

### B-07 — Accepted image input binding: closed for static/unit

The remediation removes the previous caller-convention boundary. Private staged
bytes, staging inventory/digest, approved base image identity, Node version, and
base-environment keys are accepted together in one snapshot. WeakMap/WeakSet
bindings prevent callers from reconstructing or substituting the pair, build
plan, pair plan, or runtime layout with matching public metadata. The same
snapshot supplies the staged bytes and the inspection allowlist.

Focused negative tests reject replaced staged bytes, extra files, missing files,
reordered inventory, base-environment snapshot substitution, and build-layout
substitution. All staging drift cases stop before `build`; snapshot/layout
substitutions stop before any backend call. The accepted snapshot's public
projection contains digests, sizes, logical paths, and key names only; host
inspection and completion do not retain raw staged content, raw environment
values, or host absolute paths.

Evidence: `staging.test.ts:25-89`, `image-input.test.ts:41-94`,
`execution.test.ts:296-312`, `execution.test.ts:371-396`.

## Acceptance and regression assessment

| Area | Re-review result |
|---|---|
| One accepted image/staging snapshot | Passes static/unit review; private copied bytes, exact inventory/digest, image identity, Node version, and base environment keys share one runtime identity. |
| Build-context byte binding | Passes the reviewed fake-backend boundary; staging and read-back verification precede build, and drift is fail-closed. |
| Profile pair and layout binding | Passes; pair/build/plan/layout substitutions fail before backend access, and run roots/writable state are distinct. |
| Pre-start environment inventory | Passes; both inspections derive their base allowlist from the accepted snapshot. |
| Raw-data policy | Passes reviewed schema/unit checks; public accepted/inspection/completion objects omit raw bytes, environment values, and host absolute paths. |
| Expected mismatch and incomplete paths | Passes; a complete synthetic observation retains the constrained-child mismatch, while staging/timeout/output/transfer/cleanup failure remains inconclusive without completion. |
| Runtime enforcement | Not assessed and not approved; no runtime input or Observed evidence exists. |

## Verification observed

| Command | Observed result |
|---|---|
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 12 test files, 78 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 12 files, 78 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 79 test files / 409 tests passed. |
| `git diff --check` | Exit 0 after the review record and status metadata were added. |
| `git status --short` | Confirmed the target remains an uncommitted working tree containing existing M3/M4 changes plus this review-owned record/status update. |

After adding this review record and status metadata, `npm run m4:verify` and
`npm run check` were repeated with the same passing file/test counts.

The following commands were not run: `npm run m4:doctor`,
`npm run m4:build`, `npm run m4:run:controls`, and
`npm run m4:verify:evidence`. Exact runtime inputs and explicit execution
approval are absent. No Docker/container command, runtime-socket access,
external network access, image pull, package install, credential access, host
lifecycle experiment, remote Git operation, commit, or publication was
performed.

## Non-blocking finding and remaining limitations

### N-01 — Top-level M3 status remains stale

`README.md` still says the M3 independent re-review gate is pending, while the
M3 milestone and remediation review record say it is approved with non-blocking
follow-ups. This pre-existing documentation issue does not change the M4
input-binding decision and remains a separate documentation-only task.

No version-controlled `profile.json`, accepted image-input file, exact local
base/image digest, base-environment inventory, Docker runtime version, or
approved production backend exists yet. The reviewed staging backend is an
interface exercised with a fake backend; an exact host implementation and its
filesystem/runtime behavior require a separate review before activation.

Node permission-model child denial, scratch/source enforcement, fixed loopback
behavior, inspection representation, evidence transfer, and cleanup remain
unmeasured. Expected values were not changed, profile-control Observed was not
generated, and experiment-matrix route Observed remains unchanged.

## Gate conclusion and next task

The M4 static/unit implementation gate is approved with no blocking findings.
The runtime enforcement gate remains pending/blocked and unexecuted. The next
task is a separate exact-input contract task: propose the version-controlled
profile/image input, locally available immutable base input, base-environment
inventory, fixed host backend boundary, and exact runtime version for independent
review. Docker execution still requires a later explicit approval and must not
be combined with that proposal.
