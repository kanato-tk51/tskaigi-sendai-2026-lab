# M4 distinct activation-object implementation/gate review

## Review target and decision

- Target: the issue #45 `20260720-02` distinct activation-object
  wrapper/run-ID/package implementation
- Review type: fresh independent Docker-free read-only implementation/gate
  review
- Decision: **BLOCKED; the candidate command is not approved**
- M4-AG01 fresh immutable generation: **CLOSED at implementation scope**
- M4-AG02 construction and wrapper edge binding: **OPEN on M4-AGI01 and
  M4-AGI02**
- M4-AG03 complete held identity: **OPEN on M4-AGI01 and M4-AGI02**
- M4-AG04 process and settlement: **OPEN on M4-AGI02**
- M4-AG05 output, side effects, and retention: **OPEN on M4-AGI02**
- M4-AG06 implementation/evidence separation: **CLOSED, but it does not
  approve execution while M4-AG02 through M4-AG05 are open**
- Blocking findings: **M4-AGI01 and M4-AGI02**
- Non-blocking findings: none

The tracked construction reproduces the fixed generation, constants,
activation closure, wrapper imports, package-only candidate edge, profile
handoffs, and process/output implementation. The production lease does not,
however, compare the three wrapper objects with the exact bytes approved by
this review. The focused tests also do not exercise the complete negative
matrix required by the contract. Passing static/unit verification therefore
does not make the one-shot command eligible.

This review did not run or approve the candidate command. It did not import or
execute either production frozen-research entry, access Docker or a runtime
socket, probe a result root or retained state, use standing authorization,
change historical evidence, or promote `Observed`.

## Reviewed snapshot identity

The hashes below identify review inputs before this review record, its bounded
remediation prompt, and minimal status updates were added. They are tracked
byte identities, not runtime filesystem identities.

| Target | SHA-256 |
|---|---|
| Execution-gate contract with implementation handoff | `a35e19cad55476e408458dfdfb3df19d254d738d6ac4f378f5a0c100dff8d031` |
| Initial execution-gate contract review | `ce547624f4ec169e0676c008ab8a00b98e5e5a93310639ebee44dff2454904b0` |
| M4-AGR01 through M4-AGR03 remediation prompt | `f2fa5437b1130a1231a652ec294a5dde83c1a35f4c585c61b137c9a1a5eaa488` |
| Remediation re-review | `fae14cc67c52a9a9365cf7984c054214fb1c3030f68d5c5836b8ad2fd521988c` |
| Wrapper implementation prompt | `a122a1bb07e6f05456b9390e039501ce26da2e4d383ff5fc7b130ac50dee01dd` |
| This implementation/gate review prompt | `af6db0f8ad38195ef7b50096c67fe6728086aaa3fef1c1bd218b95db28ad3063` |
| Dormant activation-object implementation review | `a65f69a4b935b3827c8c12432745c7a7597dc70f08467f55793245251d579640` |
| Wrapper focused test before this review | `90505aba8d0a10eeb8d37262139e8137d699a264f3bae37d0f560cd944a042a0` |
| Docker-free static verifier before this review | `7c501d67b073d6d59097c0df272223fc493cd4d80979efa148a48f45ab23565b` |

The complete changed/untracked inventory and diff summary were inspected. The
pre-existing issue #45 work remains uncommitted and was preserved. No unrelated
user change was overwritten.

## Reproduced generation and construction

The fixed generation reproduces without reading either result path:

| Profile | Run ID | Result root | Container |
|---|---|---|---|
| permissive | `m4-profile-control-p-20260720-02` | `results/runs/m4-profile-controls/m4-profile-control-p-20260720-02` | `tskaigi-m4-p-m4-profile-control-p-20260720-02` |
| constrained | `m4-profile-control-c-20260720-02` | `results/runs/m4-profile-controls/m4-profile-control-c-20260720-02` | `tskaigi-m4-c-m4-profile-control-c-20260720-02` |

`m4-activation-expected-20260720-02`, profile revision `m4-profile-v1`, input
ID `m4-profile-control-image-v1`, and image digest
`sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`
remain exact.

Independent byte and AST calculations reproduced:

| Object | Bytes | SHA-256 |
|---|---:|---|
| `src/constants.ts` | 4,635 | `60d0512bd55c87b990f1476fa4634e54661feac81d2abf59dc7975058ac96f65` |
| `dist/constants.js` | 4,298 | `2e6109fcf9f6cb779b7f402ff9e172f18ecfe95771033f21b490a538ddb465cb` |
| `dist/constants.d.ts` | 4,628 | `d4fc330fee498a9b4c3f1c6d2e9be35ef793a3412d43d8059910bbd516319651` |
| activation source | 774 | `580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d` |
| activation JavaScript | 788 | `34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7` |
| activation declaration | 11 | `8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881` |
| wrapper source | 42,865 | `80829982f10266f27382393cb07faa8c41eff1de677788e018f671b7752a3174` |
| wrapper JavaScript | 41,159 | `ab36b509837ea32353df60f5319bbdca865c284ed809b313c0de32692dd7294d` |
| wrapper declaration | 1,244 | `ed1e6145b9f3adc43234bd82720e22041f61a514124b3531cf99560dbd9d92f5` |
| root package manifest | 7,438 | `370ffa822b913a98b56d5ef6f83e92c97cdbcd7f59d94b9a759c0a4ef5c78af1` |
| permissive profile | 1,402 | `243915063e04f4009bf2132d74ae6172a763583560ce6534c3520bbda4ddde7c` |
| constrained profile | 1,411 | `a41bc401830f4079607fb3720b1dbdf636b283fadf0db4082d0113bf3238838e` |

The source and compiled parent inventories contain exactly 32 and 64 sorted
names. Syntax traversal independently derives 22 activation source modules,
22 JavaScript construction modules, 22 declaration construction modules, and
21 executable modules; `types` is the only construction-only/runtime-absent
member. The corrected repository-relative manifest calculation reproduces:

| Manifest | Bytes | SHA-256 |
|---|---:|---|
| ordered 22-source manifest | 2,582 | `d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158` |
| ordered 44-output manifest | 5,232 | `04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953` |
| concatenated manifest | 7,814 | `7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec` |

The pinned compiler emitted all outputs without diagnostics. The wrapper
source and JavaScript each have the exact ordered seven built-in specifiers
`node:child_process`, `node:crypto`, `node:fs`, `node:fs/promises`,
`node:path`, `node:process`, and `node:url`; both repository-local direct-edge
sets are empty. The package script is exactly
`node containers/profile-control/dist/frozen-research-profile-control-executor.js`,
and the two README deltas name only the fresh run IDs.

## M4-AGI01 — reviewed wrapper bytes are not an accepted production input

The production lease correctly holds every activation row with explicit byte
length and SHA-256 expectations. It also holds the package and canonical
profiles with explicit expectations. The three wrapper rows are different:

- `wrapper-source` passes `undefined` for expected bytes and hash and checks
  only the fixed import prefix;
- `wrapper-javascript` passes `undefined` for expected bytes and hash and
  checks only the emitted import prefix; and
- `wrapper-declaration` passes neither expected bytes, expected hash, nor a
  prefix.

`captureFile` therefore computes each current wrapper length/hash and stores it
as the lease baseline without comparing it with the independently reviewed
42,865 / 41,159 / 1,244-byte objects above. Later `validate()` calls prove only
that those newly accepted bytes remain stable after capture.

A same-prefix body change made before capture is a complete counterexample:
it can preserve path, inventory, owner, mode, link count, and import prefix
while changing the wrapper behavior and full hash, yet production capture
accepts the changed file as the new baseline. An appended unleased loading
form is likewise outside the prefix check. The test and static verifier know
the current full hashes, but neither is part of the production lease or the
candidate command.

This leaves the contract's exact independently reviewed wrapper-byte,
edge-manifest, and singleton executable lease unimplemented. M4-AG02 and
M4-AG03 remain open.

## M4-AGI02 — focused negative acceptance is incomplete

The 13 wrapper tests cover current hashes/import specifiers, four source-edge
mutations, five file-identity mutations, canonical complete/Inconclusive
success, a thrown spawn, three first-failure cases, late `close`, one
TERM/KILL-failure path, identity/release suppression, and four framing
mutations. That is useful unit evidence but not the contract's required
exhaustive gate matrix.

In particular, the focused suite does not directly reject all reordered,
extra, absolute, `file:`, subpath, `createRequire`, property-based loader,
ordinary-entry/backend/runner, emitted-binding, and otherwise unleased wrapper
edges. It does not exercise the production wrapper capture against a
same-prefix pre-capture body/hash change. It also lacks the complete required
process/output matrix for third-versus-fourth no-child validation failure,
missing/duplicate/contradictory exit-close tuples, null streams or invalid PID,
both valid complete and valid Inconclusive bytes after every earlier
timeout/output/process/signal failure, exact root-access instrumentation, and
complete outer-key/private-field suppression.

Static substring checks and a passing happy-path hash assertion do not replace
those negative cases. M4-AG02 through M4-AG05 remain open at implementation
scope pending bounded remediation and fresh re-review.

## Process/output trace and closed boundaries

Manual source trace found no separate process/output implementation defect:

- the production path performs two lease validations before the one fixed
  spawn, and the synchronous thrown-spawn branch performs the third and fourth
  validations before reverse release and sanitized-or-suppressed exit `70`;
- a returned child owns the lease until `close`; `exit` alone cannot settle the
  promise or release descriptors;
- timeout/output failures latch before TERM, one grace precedes KILL, and
  signal-delivery failure cannot replace the initiating public code;
- the first timeout/output/process/invalid-result failure is write-once, so a
  later valid child object cannot restore eligibility;
- stable-close failure uses four steps and null control output, while accepted
  complete or child-Inconclusive output uses all five steps only after both
  post-use validations and successful reverse release; and
- the child process object, empty environment, output/timeout bounds, strict
  pair parser, public activation projection, root retention, and no-retry
  direction match the contract source.

These are code-trace and existing unit observations, not runtime evidence.
M4-AG04 and M4-AG05 remain open because M4-AGI02 leaves their required
acceptance incomplete.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, active plan, issue #45 contract/review/remediation/implementation packet, safety/evidence documents, and saved review prompt | Read within the repository without Docker, runtime-socket, result/retained-state, network, credential, Remote Git, publication, or external communication access. |
| `git status --short --branch`, `git diff --name-status`, `git diff --numstat`, scoped references, critical `sha256sum`, and source/test/static-verifier trace | Preserved prior work and reproduced the exact wrapper/constants/activation/package/profile identities and the two findings above. |
| `node node_modules/typescript/bin/tsc --project containers/profile-control/tsconfig.build.json` | Exit 0 with no diagnostics; compiler-produced bytes were refreshed without tracked content drift. |
| `npm run m4:verify` | Exit 0; typecheck and Docker-free static verification passed, then 24 test files and all 265 tests passed. |
| Repository-owned Node/TypeScript AST, closure, inventory, hash, manifest, and production-capture assertion | Corrected assertion exit 0; reproduced 32/64, 22/22/22/21, exact manifests, seven/zero edges, current object hashes, and the three absent production wrapper byte/hash expectations. |
| Permission-bounded ordinary compiled import assertion | Exit 0; ten ordinary compiled modules imported with filesystem read only and timer interception; neither frozen-research entry was imported. |
| `git diff --check` before review edits | Exit 0. |

The first independent manifest helper used paths relative to
`containers/profile-control`, so its row lengths and hashes did not match the
repository-relative contract. The corrected helper used full
`containers/profile-control/...` logical paths and reproduced all three
contract manifests. This helper-format correction is not a repository or
implementation finding.

No candidate command, wrapper/activation production entry, `npm run
m4:doctor`, `npm run m4:build`, `npm run m4:recovery:offline-build`, `npm run
m4:run:controls`, Docker/container/runtime-socket action, result-root or
retained-state probe, cleanup, repair, retry, signal, external network,
credential, host-home access, Remote Git, publication, deployment, or
third-party communication was used. Standing authorization was not used
because the implementation/gate review did not approve a runtime action.

## Evidence classification and remaining limitations

- The execution-gate documents remain contract evidence.
- Hashes, compiler output, inventories, AST graphs, static verification, and
  focused tests are construction/static/unit evidence.
- The wrapper and activation entry were not run through the production command;
  no held runtime identity, child settlement, Docker behavior, result-root
  state, or profile enforcement was observed.
- The cooperative-host limitation remains: even a remediated stable-boundary
  protocol cannot prevent an out-of-scope same-UID swap-and-restore race wholly
  between observations.
- Historical results and evidence classes remain immutable. Profile-control,
  adapter-route, experiment-matrix, and presentation `Observed` remain
  unestablished.

## Decision and next task

M4-AGI01 and M4-AGI02 block M4-AG02 through M4-AG05 at implementation scope.
The exact command `npm run --silent m4:execute:frozen-research` is not approved,
and standing authorization cannot be used for it. The bounded remediation must
make the reviewed full wrapper bytes and edge contract an exact gate input,
complete the focused negative matrix, preserve the fixed generation and
process/output semantics, and receive another fresh Docker-free review before
any command occurrence.

Next: remediate only M4-AGI01 and M4-AGI02 under
[`prompts/m4-distinct-activation-object-execution-gate-implementation-remediation.md`](../../prompts/m4-distinct-activation-object-execution-gate-implementation-remediation.md).
