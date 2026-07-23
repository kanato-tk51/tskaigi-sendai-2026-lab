# M4 distinct activation-object execution-gate remediation re-review

## Review target and decision

- Target: the issue #45 M4-AGR01 through M4-AGR03 execution-gate contract
  remediation
- Review type: fresh independent Docker-free read-only contract re-review
- Decision: **APPROVED; at most the contract's exact bounded Docker-free
  implementation/static/unit task may proceed**
- M4-AGR01 wrapper executable closure: **CLOSED at contract scope**
- M4-AGR02 no-child and signal settlement: **CLOSED at contract scope**
- M4-AGR03 monotonic output precedence: **CLOSED at contract scope**
- M4-AG01 through M4-AG06: **CLOSED at contract scope**
- Blocking findings: none
- Non-blocking findings: none
- Wrapper/run-ID/package implementation, activation import/execution, Docker,
  retained/result state, runtime evidence, and `Observed`: not added,
  executed, accessed, or changed

The remediation closes the three prior findings without changing the fixed
generation, activation object, profiles, candidate child, backend side-effect
ceiling, retention rule, or implementation allowlist. The wrapper is now a
self-contained singleton executable with exact built-in edges; every no-child,
returned-child, signal, late-`close`, and release branch has one owner and
terminal rule; and a chronological write-once failure permanently disqualifies
later child bytes.

This approval is contract evidence only. It permits only the already bounded
Docker-free implementation and focused static/unit verification. It does not
approve the candidate command, a Docker action, result-root inspection, or use
of `continue-repository-work` standing authorization.

## Reviewed snapshot identity

The hashes below identify the review inputs before this review record and its
minimal status updates were added. They are static byte identities, not runtime
filesystem identities.

| Target | SHA-256 |
|---|---|
| Remediated execution-gate contract | `8c2182db79ef4b6dcfbb9f309a39e710ea91792fb410b0181fd84b28c5983730` |
| Initial execution-gate contract review | `ce547624f4ec169e0676c008ab8a00b98e5e5a93310639ebee44dff2454904b0` |
| M4-AGR01 through M4-AGR03 remediation prompt | `f2fa5437b1130a1231a652ec294a5dde83c1a35f4c585c61b137c9a1a5eaa488` |
| This remediation re-review prompt | `f7d66369f1bc5ebcf5dd2b0296e688e4d115823bb48b1007b1c2a241237b7264` |
| Distinct activation-object contract | `c0782ba411352edd346ce3da4c7cbac328ca45f07e3bc49aa1bb5f22bce65daf` |
| Distinct activation-object implementation review | `a65f69a4b935b3827c8c12432745c7a7597dc70f08467f55793245251d579640` |
| Exact filesystem-object identity contract | `aed71380d2983e557bccec82417289a41ef2ff8ade131506b8565f009656e9a9` |
| Filesystem-identity implementation remediation re-review | `61cf631523a6711999623389a1e833abf17d2b0b564d75de31c6eb7ad0129ffa` |
| Current `src/constants.ts` | `8441aadf55bcd15b4a207283c9723ae703df4c8aa3234282a12c224c2dd1fb0f` |
| Root package manifest | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |
| Ordinary fail-closed source entry | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| Ordinary fail-closed compiled entry | `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4` |

The complete changed/untracked inventory and diff summary were inspected. The
existing issue #45 filesystem-identity and dormant activation-object work was
preserved. The wrapper source/output and candidate package script remain
absent, and the tracked constants still contain only the exhausted
`20260720-01` run pair.

## Reproduced fixed generation and construction

Repository-pinned TypeScript `5.9.3` compiled the proposed two-literal
constants replacement entirely in memory with no diagnostics and no file
write. It reproduced:

| Object | Bytes | SHA-256 |
|---|---:|---|
| proposed `src/constants.ts` | 4,635 | `60d0512bd55c87b990f1476fa4634e54661feac81d2abf59dc7975058ac96f65` |
| proposed `dist/constants.js` | 4,298 | `2e6109fcf9f6cb779b7f402ff9e172f18ecfe95771033f21b490a538ddb465cb` |
| proposed `dist/constants.d.ts` | 4,628 | `d4fc330fee498a9b4c3f1c6d2e9be35ef793a3412d43d8059910bbd516319651` |
| ordered 22-source manifest | 2,582 | `d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158` |
| ordered 44-output manifest | 5,232 | `04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953` |
| concatenated manifest | 7,814 | `7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec` |

Only `dist/constants.js` and `dist/constants.d.ts` differ across the current
62 in-memory outputs before adding the wrapper. The current 31-source/62-output
inventories become exactly 32/64 by adding only the named wrapper source,
JavaScript, and declaration.

The activation source/JavaScript/declaration remain 774 / 788 / 11 bytes with
hashes `580c2926...`, `34ecc462...`, and `8e609bb7...`. Syntax-derived
analysis reproduced the exact 22-source, 22-JavaScript-construction,
22-declaration-construction, and 21-executable-import sets, including the
type-only `types.ts` and construction-only, runtime-unreachable `types.js`
distinction.

The canonical profiles remain 1,402 and 1,411 bytes with hashes
`24391506...` and `a41bc401...`, revision `m4-profile-v1`, input ID
`m4-profile-control-image-v1`, and common recovered image digest
`sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`.

The fresh fixed tuples derive without probing either result path:

| Profile | Run ID | Result root | Container |
|---|---|---|---|
| permissive | `m4-profile-control-p-20260720-02` | `results/runs/m4-profile-controls/m4-profile-control-p-20260720-02` | `tskaigi-m4-p-m4-profile-control-p-20260720-02` |
| constrained | `m4-profile-control-c-20260720-02` | `results/runs/m4-profile-controls/m4-profile-control-c-20260720-02` | `tskaigi-m4-c-m4-profile-control-c-20260720-02` |

M4-AG01 remains closed.

## M4-AGR01 — wrapper executable closure closed

TypeScript AST analysis of the exact proposed import block reproduces the
ordered specifiers `node:child_process`, `node:crypto`, `node:fs`,
`node:fs/promises`, `node:path`, `node:process`, and `node:url`. The source
bindings are exactly `spawn`; `createHash`; `constants` plus type-only
`BigIntStats`; `lstat`, `open`, `readdir`, `realpath` plus type-only
`FileHandle`; default `path`; default `process`; and `fileURLToPath`.

In-memory TypeScript emission preserves those seven ordered specifiers and all
value bindings while removing only `BigIntStats` and `FileHandle`. Both direct
repository-local import sets are empty. The wrapper source-construction and
executable closures are therefore separate singletons, while the activation
object retains its independent 22/22/22/21 sets.

A second virtual-source compilation used the pinned `NodeNext` build options
and the future repository path. It reported no diagnostics, wrote no file, and
emitted the same seven specifiers in the same order.

The contract requires exact held bytes and private identities for the wrapper
source, JavaScript, declaration, edge manifests, parent inventories, and root
`package.json`. It rejects every missing, extra, reordered, alternate built-in,
relative, absolute, `file:`, dynamic/computed, `require`, `createRequire`,
evaluation, package/subpath, activation-entry, ordinary-entry, backend/runner,
or otherwise unleased executable edge. No repository code outside the
singleton can execute through the wrapper.

M4-AGR01 is closed. The construction portion of M4-AG02 and complete held
wrapper identity portion of M4-AG03 are closed at contract scope.

## M4-AGR02 — no-child and signal settlement closed

The synchronous thrown-spawn branch is now distinct from every returned-child
branch. It has no handle or `close`, retains only the private one-step
`identity-preflight` prefix, performs the third and fourth complete lease
validations, releases descriptors once in reverse order, writes exactly
`M4_ACTIVATION_SPAWN_FAILED\n` only after successful validation/release, writes
no stdout, and exits `70`. Validation or release failure suppresses all output.
The two new roots remain untouched but the generation is exhausted and cannot
be repaired, reused, or retried.

A returned handle appends `child-spawned` before accepting events. An
asynchronous `error` latches `ACTIVATION_PROCESS_FAILURE` but never settles the
handle. Without `close`, the exact child, buffers, timers/listeners, and full
identity lease remain owned by the terminal unknown-settlement branch with no
output, cleanup, normal exit, or retry. A later `close` enters the same two
post-use validations and reverse release while preserving the earlier failure.

Timeout or output overflow latches its initiating public code before any
signal request. TERM failure keeps the fixed grace; absent `close`, the one
KILL request still occurs. TERM/KILL delivery failure never replaces
`ACTIVATION_TIMEOUT` or `ACTIVATION_OUTPUT_LIMIT`. A missing late `close`
retains the unknown-settlement owner; an eventual late `close` preserves the
initiating code and enters the normal post-`close` terminal path.

M4-AGR02 is closed. M4-AG04 is closed at contract scope.

## M4-AGR03 — monotonic output precedence closed

The wrapper failure latch begins empty and is chronological and write-once.
The first timeout, combined-output overflow, asynchronous/process/exit-close
failure, or post-close invalid control result maps respectively to
`ACTIVATION_TIMEOUT`, `ACTIVATION_OUTPUT_LIMIT`,
`ACTIVATION_PROCESS_FAILURE`, or `CONTROL_RESULT_INVALID`. Signal-delivery
failure has no independent public code and cannot replace its initiating
timeout/output code.

Child-result eligibility now explicitly requires an empty latch. Every later
stdout/stderr chunk, error, exit, signal outcome, timer, or `close` is unable to
clear or replace it. Thus even byte-valid complete or child-Inconclusive output
is permanently disqualified after any earlier wrapper failure.

The branch prefixes are exact: one private step for synchronous no-child,
two private steps for returned-but-unclosed, four public steps with null
control result for stable-close wrapper/control failure, and five steps only
for eligible complete or child-Inconclusive output. The wrapper performs both
post-`close` identity validations, appends `identity-postflight`, and releases
every descriptor successfully before writing canonical output. Release failure
suppresses output and exits `70`.

Focused later acceptance names every fixed/rejected wrapper edge, synchronous
no-child failure, asynchronous error with and without later `close`,
exit-without-close, TERM/KILL delivery failure, release failure, and valid
complete/Inconclusive bytes after each prior timeout/output/process/signal
failure.

M4-AGR03 is closed. M4-AG05 is closed at contract scope.

## M4-AG01 through M4-AG06 decision

- M4-AG01 is closed by the fresh immutable generation and distinct pair.
- M4-AG02 is closed by the exact constants/compiler/inventory delta and exact
  wrapper source/emitted edge contract.
- M4-AG03 is closed by the complete held activation and wrapper objects,
  manifests, parent inventories, identities, validations, and settlement
  ownership.
- M4-AG04 is closed by the fixed child process object and complete no-child,
  returned-child, signal, `close`, and unknown-settlement branches.
- M4-AG05 is closed by strict bounded framing, the chronological latch,
  canonical prefix/result matrix, backend side-effect ceiling, root retention,
  and no repair/retry rules.
- M4-AG06 remains closed by the exact implementation/test allowlist, later
  implementation/gate review, later result review, ADR-0001 evidence
  separation, historical immutability, and unchanged `Observed` boundary.

No blocking or non-blocking finding remains at contract scope.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, active frozen-research plan, routed M4 safety/evidence documents, exact contract/remediation/review packet, and prior filesystem/activation reviews | Read without Docker, runtime-socket access, retained/result-state access, external network, credentials, Remote Git, or external communication. |
| `git status --short --branch --untracked-files=all`, `git diff --name-status`, `git diff --numstat`, `git diff --check`, scoped reference scan, wrapper-path absence checks, and critical `sha256sum` calculation | Preserved the existing issue #45 work; wrapper objects/script remain absent, constants remain on `20260720-01`, and every reviewed input hash above reproduced. |
| Repository-only TypeScript `5.9.3` two-literal in-memory compile, inventory/manifest calculation, activation syntax graph, and wrapper source/emitted import AST assertion | Corrected assertion exit 0; no diagnostics or writes; reproduced all constants/manifest values, 31/62 to 32/64 inventories, 22/22/22/21 sets, exact seven built-ins and binding delta, zero local edges, and singleton wrapper closures. |
| Pinned `NodeNext` virtual wrapper-source compilation at the future repository path | Exit 0; no diagnostics or filesystem writes and the emitted JavaScript retained the exact ordered seven built-in specifiers. |
| Normalized contract-branch/profile/package assertion | Corrected assertion exit 0; reproduced all fixed branch clauses, unchanged profile/input/image values, absent candidate script, and inactive fresh constants. |
| Manual branch trace against the exact contract | Reproduced synchronous no-child, asynchronous error with/without later `close`, timeout/output TERM/KILL failure, exit/close correlation, release failure, write-once precedence, one/two/four/five prefixes, root retention, and no-retry consequences. |
| Focused Prettier check and `git diff --check` after review/status edits | Exit 0. |

The first wrapper-import helper used an import-only fragment, so TypeScript
elided the otherwise-unused value imports and that helper exited 1. The
corrected in-memory helper added no-op references solely to expose the emitted
binding delta and passed without writing a file. Two preliminary
contract-assertion invocations also exited 1: the first matched Markdown across
line breaks literally, and the second reached its reporting tail with the
wrong assumed profile-field nesting. Whitespace normalization and the actual
top-level canonical profile schema corrected the helper. These were review
helper errors, not repository drift or contract findings.

No filesystem-emitting compile, test suite, wrapper/activation/ordinary-entry
import or execution, `npm run m4:doctor`, `npm run m4:build`, `npm run
m4:recovery:offline-build`, `npm run m4:run:controls`, proposed one-shot
command, production executor, Docker/container/runtime-socket action,
result-root or retained-state probe, cleanup, retry, process signal, external
network, credential, host-home access, Remote Git, publication, deployment, or
third-party communication was used. Standing authorization was not needed and
was not used because this review crossed no runtime approval gate.

## Evidence classification and remaining limitations

- This remediation and review are contract evidence.
- In-memory compiler, hashes, inventories, and AST assertions are
  construction/static review evidence only.
- The wrapper, fresh constants, compiled delta, tests, static-verifier changes,
  and package script remain unimplemented.
- No process consumed the activation path, so process settlement, held runtime
  identities, output framing, root state, and backend behavior remain
  unobserved at runtime.
- The cooperative-host limitation remains: stable-boundary checks do not
  prevent an out-of-scope same-UID swap-and-restore race between observations.
- Docker behavior, retained-state identity, runtime enforcement,
  profile-control `Observed`, adapter-route `Observed`, experiment-matrix
  `Observed`, and presentation evidence remain unestablished.
- Historical attempts, results, identities, evidence classes, and limitations
  remain immutable.

## Decision and next task

M4-AGR01 through M4-AGR03 close with no new finding. M4-AG01 through M4-AG06
are exact at contract scope. At most one bounded Docker-free implementation may
now use the contract's exact construction and verification allowlists. Before
changing source, that task must save its exact implementation and later fresh
implementation/gate-review prompts. It must not import or execute the dormant
activation entry, run the candidate command, access Docker or retained/result
state, or change historical evidence or `Observed`.

Next: perform the exact bounded Docker-free execution-gate wrapper/run-ID/package
implementation and focused static/unit verification, then obtain a fresh
independent implementation/gate review before any command approval.
