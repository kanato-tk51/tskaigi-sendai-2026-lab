# M4 distinct activation-object execution-gate contract

Status: **exact one-occurrence activation exhausted; fresh result review
accepted only an immutable Inconclusive attempt; issue #45 closed at that
bounded classification**

This contract defines the next issue #45 boundary after the independently
approved dormant activation object. It fixes a fresh generation, a path-only
child-process wrapper, the complete source/compiled identity lease, canonical
bounded output, one argument-free command, and no-retry/result-retention rules.
It does not add the wrapper, rebind the active run IDs, import or execute the
activation object, access Docker or retained state, approve the command, or
change any historical evidence or `Observed` value.

## Decision and fresh generation

The activation generation is fixed as follows.

| Role | Exact value |
|---|---|
| Activation Expected revision | `m4-activation-expected-20260720-02` |
| Control profile revision | unchanged `m4-profile-v1` |
| Container input ID | unchanged `m4-profile-control-image-v1` |
| Control image digest | unchanged `sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd` |
| Permissive run ID | `m4-profile-control-p-20260720-02` |
| Constrained run ID | `m4-profile-control-c-20260720-02` |
| Permissive result root | `results/runs/m4-profile-controls/m4-profile-control-p-20260720-02` |
| Constrained result root | `results/runs/m4-profile-controls/m4-profile-control-c-20260720-02` |
| Permissive container | `tskaigi-m4-p-m4-profile-control-p-20260720-02` |
| Constrained container | `tskaigi-m4-c-m4-profile-control-c-20260720-02` |

The activation Expected revision is a new gate-level Expected identity. The
two canonical profile files deliberately retain `m4-profile-v1`, their exact
policy bytes, and the recovered same-image digest because that digest contains
the reviewed v1 control fixture. Changing the profile revision would require a
new offline image build and is not part of issue #45.

The exhausted `20260720-01` pair, roots, containers, result, and all historical
records remain immutable. The later implementation must reject those run IDs
and must not inspect, enumerate, repair, remove, reuse, or derive an acceptance
decision from either old result root or old container. This contract task did
not inspect either old or new result root and did not inspect Docker state.

## Exact run-ID construction delta

The later implementation may replace only the two run-ID literals in
`containers/profile-control/src/constants.ts`. Every other constant, the
canonical profile bytes, the dormant activation source, and the 21-module
executable import graph remain unchanged.

The proposed source and pinned TypeScript `5.9.3` in-memory construction were
reproduced without writing output. The exact accepted delta is:

| Object | Bytes | SHA-256 |
|---|---:|---|
| proposed `src/constants.ts` | 4,635 | `60d0512bd55c87b990f1476fa4634e54661feac81d2abf59dc7975058ac96f65` |
| proposed `dist/constants.js` | 4,298 | `2e6109fcf9f6cb779b7f402ff9e172f18ecfe95771033f21b490a538ddb465cb` |
| proposed `dist/constants.d.ts` | 4,628 | `d4fc330fee498a9b4c3f1c6d2e9be35ef793a3412d43d8059910bbd516319651` |

All other members of the existing 22-source, 22-JavaScript-construction, and
22-declaration-construction activation sets remain byte-for-byte unchanged.
With the proposed constants row, their manifests become:

| Manifest | Bytes | SHA-256 |
|---|---:|---|
| ordered 22-source manifest | 2,582 | `d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158` |
| ordered 44-output manifest | 5,232 | `04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953` |
| concatenated manifest | 7,814 | `7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec` |

The activation object itself remains exactly:

| Role | Bytes | SHA-256 |
|---|---:|---|
| `src/frozen-research-profile-control-entry.ts` | 774 | `580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d` |
| `dist/frozen-research-profile-control-entry.js` | 788 | `34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7` |
| `dist/frozen-research-profile-control-entry.d.ts` | 11 | `8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881` |

The canonical permissive and constrained profiles remain respectively 1,402
bytes / `243915063e04f4009bf2132d74ae6172a763583560ce6534c3520bbda4ddde7c`
and 1,411 bytes /
`a41bc401830f4079607fb3720b1dbdf636b283fadf0db4082d0113bf3238838e`.

The only filesystem-emitting constructor allowed in the later implementation
is still:

```sh
node node_modules/typescript/bin/tsc --project containers/profile-control/tsconfig.build.json
```

It must report no diagnostics. The implementation may accept only the two
changed constants outputs plus the new wrapper JavaScript/declaration described
below; every other pre-existing compiled byte must equal its independently
reviewed value.

## Exact process-wrapper boundary

The later wrapper has these exact logical paths:

| Role | Repository-relative path |
|---|---|
| TypeScript wrapper source | `containers/profile-control/src/frozen-research-profile-control-executor.ts` |
| Compiled wrapper | `containers/profile-control/dist/frozen-research-profile-control-executor.js` |
| Declaration byproduct | `containers/profile-control/dist/frozen-research-profile-control-executor.d.ts` |

The wrapper is a separately reviewed trusted host control. It must use strict
TypeScript, have no exported public/package-root API, accept no argument, and
never import the activation entry. It may name the exact compiled activation
path only as the fixed path-only child target. Adding it changes the complete
`src` / `dist` parent inventories from 31 / 62 to exactly 32 / 64, while the
activation object's own 22-source/22-construction/21-executable sets remain
unchanged except for the constants bytes above.

### Exact wrapper executable dependency closure

The wrapper is intentionally self-contained. Its TypeScript source must have
exactly these direct static imports, in this order, with no other imported
binding or module specifier:

```ts
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants, type BigIntStats } from "node:fs";
import {
  lstat,
  open,
  readdir,
  realpath,
  type FileHandle,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
```

The compiler-produced JavaScript must retain the same ordered seven `node:`
module specifiers and the same value bindings after removing only the two
type-only bindings. The exact source-local import set and emitted-JavaScript
repository-local import set are both empty. Therefore the wrapper's complete
ordered repository executable closure is the singleton:

```text
containers/profile-control/dist/frozen-research-profile-control-executor.js
```

Its TypeScript source-construction closure is likewise the singleton
`containers/profile-control/src/frozen-research-profile-control-executor.ts`.
The declaration is a required construction/identity object but is not
executable. The already fixed activation-object 22-source,
22-JavaScript-construction, 22-declaration-construction, and 21-executable sets
remain a separate path-only child closure and are not merged with the wrapper
singleton.

The later implementation must keep all identity, canonicalization, hashing,
pair-result validation, process settlement, and serialization logic inside the
wrapper source. It may not import a repository helper to satisfy that work.
Syntax-derived TypeScript and emitted-JavaScript edge manifests must reject any
relative, absolute, `file:`, package, package-subpath, import-map, or other bare
specifier; any `import()`, computed/dynamic import, `require`,
`module.createRequire`, or evaluation-based loader; any reordered or alternate
built-in edge or binding; and any import of the activation entry, ordinary
entry, production runner/backend, or another compiled object. The fixed
absolute activation path passed to the one child is a process argv value, not
an import edge.

At a later gate, the singleton wrapper source, JavaScript, and declaration
must each be authenticated as the independently reviewed exact full object and
then held through the production lease with private identity. A current-byte
descriptor baseline alone is only a stability observation and is not an
authenticity decision. Because the wrapper cannot non-circularly embed and
authenticate the hash of its own complete source and emitted JavaScript, the
exact trust boundary is split as follows:

1. A fresh worker independently reproduces the reviewed repository and gate
   state, then runs `npm run m4:static` as the final filesystem-reading trust
   preflight. That preflight must accept only wrapper source 42,865 bytes /
   `80829982f10266f27382393cb07faa8c41eff1de677788e018f671b7752a3174`,
   JavaScript 41,159 bytes /
   `ab36b509837ea32353df60f5319bbdca865c284ed809b313c0de32692dd7294d`,
   and declaration 1,244 bytes /
   `ed1e6145b9f3adc43234bd82720e22041f61a514124b3531cf99560dbd9d92f5`.
   The same preflight binds the exact source/emitted edge manifests, singleton
   closures, package-only inbound edge, 32/64 parent inventories, root package,
   profiles, fixed generation, and activation construction.
2. If a later independent review approves the candidate, the argument-free
   command must be the immediately following command occurrence. No compiler,
   formatter, test, filesystem write, repository mutation, or other command may
   occur between the successful static preflight and that one occurrence. A
   failed preflight or any changed input makes the command ineligible.
3. During that occurrence, production capture retains complete descriptors and
   current full-byte hashes for the three wrapper objects and validates the
   whole lease twice before spawn and twice after `close`. Those validations
   prove stability after the external trust input; they do not replace it.

This adjacency is a cooperative-host boundary, not an atomic path-execution
primitive. The existing same-UID swap-and-restore limitation applies between
the external preflight and descriptor capture as well as between later
observations. `package.json` remains a separately held command object. The seven
Node built-ins are trusted only through the already fixed
Linux/`x64`/Node.js `v20.18.2` host boundary; the wrapper must not inspect or
publish the host executable path or bytes. Missing, extra, reordered, or
unleased repository executable code is terminal before child creation.

The only proposed package edge is this exact script:

```json
"m4:execute:frozen-research": "node containers/profile-control/dist/frozen-research-profile-control-executor.js"
```

The only proposed one-shot command is therefore:

```sh
npm run --silent m4:execute:frozen-research
```

The command is a candidate for later review, not approved by this contract.
It performs no compilation. The pre-reviewed compiled wrapper and complete
identity snapshot must already exist before a later execution review can
approve it.

The wrapper must reject any `process.argv` member beyond the Node executable
and wrapper path. It must require Linux, `x64`, and Node.js `v20.18.2` without
serializing the executable path or host environment. It accepts no caller
image, command, argument, path, environment, timeout, output bound, run ID,
result root, container name, signal, or Docker option.

After complete preflight and immediately before child creation, the wrapper may
spawn exactly one child with this fixed process object:

- executable: the wrapper's already-running `process.execPath` after the exact
  Node version/platform/architecture checks;
- argv: the canonical absolute repository path to
  `containers/profile-control/dist/frozen-research-profile-control-entry.js`,
  followed by the single literal `run-controls`;
- cwd: the canonical repository root;
- environment: an exact empty own-key object;
- `shell: false`, `windowsHide: true`, `detached: true`;
- stdin ignored and stdout/stderr piped; and
- no second child spawn under any result or failure branch.

The detached group is for bounded settlement of the one activation child and
its fixed descendants. It does not authorize arbitrary signaling or process
enumeration. The wrapper may signal only that exact created process group:
`SIGTERM` after 90,000 ms or the first combined-output overflow, then
`SIGKILL` after one 1,000 ms grace if `close` has not occurred. Failure to
deliver a signal or to observe `close` never authorizes another command.

### Exact child creation and settlement branches

The two complete pre-spawn lease validations finish before the single direct
call to the imported `spawn`. `completedSteps` then has the private exact
prefix `identity-preflight`. The return boundary is exact:

- If `spawn` throws synchronously, no child handle exists and
  `child-spawned` is never appended. The wrapper latches private
  `ACTIVATION_PROCESS_FAILURE`, performs a third complete lease validation
  immediately in the catch branch and a fourth immediately before terminal
  disposition, then closes every descriptor exactly once in reverse capture
  order. If both validations and every close succeed, it writes exactly
  `M4_ACTIVATION_SPAWN_FAILED\n` to stderr, writes no stdout, and exits `70`.
  If either validation or descriptor release fails, it suppresses both stdout
  and stderr and exits `70` after best-effort reverse-order release. It never
  constructs a canonical activation result or pretends that a child emitted
  `close`.
- A synchronous no-child failure leaves the two new result roots untouched;
  their absence was established only at preflight and is not re-probed by the
  wrapper. The fresh generation is nevertheless exhausted. Neither root is
  read, cleaned, repaired, reused, or retried, and its later exact state is a
  result-review input only.
- If `spawn` returns a child handle, the wrapper owns that exact handle and
  immediately appends `child-spawned` before accepting any child event. A
  later asynchronous `error` latches `ACTIVATION_PROCESS_FAILURE` without
  serializing the error. It does not mean that no child existed and does not
  settle the handle.
- For a returned handle, exactly one `exit` tuple and the later `close` tuple
  must agree. Only numeric exit `0` or `1` with a null signal is potentially
  eligible. A signal exit, another code, a missing/duplicate/contradictory
  tuple, or a `close` inconsistent with `exit` latches
  `ACTIVATION_PROCESS_FAILURE`. `exit` never releases the child or lease.
- If a returned child never emits `close`, including after an asynchronous
  `error` or a failed TERM/KILL delivery, the existing terminal
  unknown-settlement owner retains the exact handle, all output buffers, every
  timer/listener needed only for that handle, and the complete identity lease.
  It emits no bytes, exits neither normally nor canonically, touches neither
  result root, and authorizes no retry. An eventual late `close` may enter the
  same post-`close` validation and release path, but it cannot clear or replace
  the already latched failure.

Timeout and output-limit callbacks first latch their initiating public code and
only then request settlement of the exact detached group with
`process.kill(-child.pid, signal)`. The child PID must be a private positive
safe integer from that exact returned handle; otherwise delivery fails closed
without signaling another target. A thrown or non-successful TERM/KILL call is
a private signal-delivery failure. Because a signal request is permitted only
after `ACTIVATION_TIMEOUT` or `ACTIVATION_OUTPUT_LIMIT` has already latched,
the signal failure never replaces that initiating public code. TERM failure
does not skip the single fixed grace boundary; if `close` is still absent, the
wrapper attempts the one fixed KILL request. KILL failure or absence of
`close` after that request enters the same unknown-settlement owner. If
`close` later occurs, the initiating timeout/output code remains primary.

## Complete held-object identity protocol

Before a child exists, the wrapper must:

1. Canonicalize the repository root and require exact path equality.
2. Check only the two exact new result-root paths for `ENOENT`; it must not list
   their parent or access any old run root.
3. Capture and retain the repository root, `containers`, `profile-control`,
   `src`, and `dist` directories with their exact sorted inventories.
4. Capture all 22 activation source files, all 22 JavaScript construction
   files, and all 22 declaration files through `O_NOFOLLOW` held descriptors,
   exact size/hash bytes, private BigInt device/inode/owner/full-mode/link/time
   metadata, and pairwise non-aliasing.
5. Capture the three new wrapper objects and the root `package.json` with the
   same held, exact-byte, one-link regular-file rules. Bind the wrapper source
   and emitted edge manifests to the exact seven-built-in/zero-local sets and
   the singleton executable closure above.
6. Reproduce privately the activation-source / ordinary-source,
   activation-JavaScript / ordinary-JavaScript, and
   activation-declaration / ordinary-declaration owner/full-mode relations.
7. Reproduce the exact 32-source/64-output inventories, the activation
   construction and edge manifests, the wrapper's independently reviewed
   source/output hashes, exact source/JavaScript import bindings and ordering,
   singleton wrapper closures, the exact package script, and the two canonical
   unchanged profile hashes.
8. Validate the complete lease twice before the path-only spawn.

The wrapper must validate the same complete lease immediately after child
`close` and again before it writes any accepted stdout. Reads use the retained
descriptors. A path reopen, `exit` event, signal request, timeout, output limit,
or child result is not a substitute for `close` plus both post-use validations.

Any missing, extra, reordered, symlinked, hardlinked, aliased, replaced,
renamed, in-place-mutated, owner/mode/time-drifted, or post-use-drifted object
is terminal. No compile, repair, restore, retry, replacement object, alternate
run ID, result read, cleanup, or accepted output follows identity failure.

If the child has not emitted `close`, the wrapper must keep the child handle and
complete identity lease owned by the terminal settlement branch above. It must
not close the lease, emit an accepted result, clean either new root, or exit
normally. A later `close` may release that owner only after both post-use
validations. External interruption of such an unknown-settlement wrapper leaves
the generation exhausted and requires a separate human/runtime-state handoff;
it never permits automatic retry. The synchronous no-child branch is not an
unknown child settlement and uses only its separately fixed four-validation
and reverse-release protocol.

This remains a cooperative-host stable-boundary check. It does not prevent an
out-of-scope same-UID swap-and-restore entirely between observations, defend
against kernel/runtime compromise, or turn descriptors into an atomic path
execution primitive.

## Exact output and classification contract

The wrapper's combined child stdout/stderr limit is 65,536 bytes with a
monotonic first-failure latch. Raw stdout, stderr, error text, executable path,
host path, environment, private filesystem identity, signal target, PID, or
Docker payload must never be copied to the public result.

The latch begins empty and is write-once. Event-loop callback order is the
chronology; within one callback the action below that names a latch happens
before any signal request, parse, or other state transition. Only the first
call may set the public code, and no later stdout/stderr chunk, `error`, `exit`,
signal return/throw, timer, or `close` may change it:

| First chronological wrapper failure | Exact public code |
|---|---|
| The 90,000 ms timer callback begins before `close` | `ACTIVATION_TIMEOUT` |
| A stdout/stderr chunk makes the combined observed byte count exceed 65,536, before retaining any over-limit bytes | `ACTIVATION_OUTPUT_LIMIT` |
| Asynchronous child `error`, invalid/duplicate/contradictory exit-close tuple, or another process-settlement failure before an earlier latch | `ACTIVATION_PROCESS_FAILURE` |
| After stable `close`, strict framing/schema/canonical-byte/exit-correlation validation fails while the latch is still empty | `CONTROL_RESULT_INVALID` |

TERM or KILL delivery is never initiated with an empty latch, so delivery
failure preserves the timeout/output code that caused it. An implementation
or test seam that attempts a signal without such a latch is contract-invalid
and must fail before signaling. The exact public signal-failure mapping is
closed: delivery failure in a timeout branch remains `ACTIVATION_TIMEOUT`, and
delivery failure in an overflow branch remains `ACTIVATION_OUTPUT_LIMIT`;
there is no third signal code and neither branch can become process success.
Output chunks remain byte-counted after a failure but cannot restore
eligibility; storage remains capped and bytes past the ceiling are discarded.
A valid child object that was fully buffered before a later timeout, process
error, or signal failure is still disqualified if the child had not yet
closed.

A child control result is eligible only when:

- the wrapper failure latch is still empty;
- `close` was observed;
- exactly one `exit` tuple was observed and equals the `close` tuple;
- stderr is empty;
- stdout is one fatal-UTF-8 JSON object, one final LF, no other LF, CR, NUL, or
  BOM, and byte-for-byte canonical under the strict pair-result validator;
- the top-level and nested result keys, failure codes, exact completed-step
  prefixes, profile order, comparison/completion nullability, and pair validity
  satisfy the existing `PairExecutionResult` contract; and
- child exit `0` corresponds only to a complete pair, while exit `1`
  corresponds only to an inconclusive pair.

The wrapper must construct, validate, and emit exactly one canonical
`lab-m4-activation-result/v1` object with these ordered keys:

```text
schemaVersion
expectedRevision
validity
primaryFailure
completedSteps
activation
controlResult
```

`activation` has exactly these ordered keys:

```text
logicalRole
sourceBytes
sourceSha256
executableBytes
executableSha256
identityStable
```

The fixed public values are:

- `schemaVersion: "lab-m4-activation-result/v1"`;
- `expectedRevision: "m4-activation-expected-20260720-02"`;
- `logicalRole: "m4-frozen-research-profile-control-activation"`;
- the 774-byte source and 788-byte executable SHA-256 values above; and
- `identityStable: true`, which may appear only after child `close` and every
  post-use identity check.

The exact wrapper step order is:

```text
identity-preflight
child-spawned
child-closed
identity-postflight
control-result-validated
```

`completedSteps` is an exact prefix. `validity: complete`,
`primaryFailure: null`, exit `0`, and a non-null complete `controlResult` are
accepted only with all five steps. An accepted child Inconclusive becomes
`validity: inconclusive`, `primaryFailure: CONTROL_INCONCLUSIVE`, exit `1`, and
retains the exact non-null child result. `CONTROL_INCONCLUSIVE` is a validated
child classification, not a wrapper-failure latch value, and is available only
when the latch remained empty through `close` and strict validation.

For every returned child, `child-closed` is appended only on `close`. The
wrapper then performs the first complete post-use validation, privately parses
and classifies the bounded streams without writing output, performs the second
complete validation immediately before disposition, and appends
`identity-postflight` only after both validations succeed. It then closes every
held descriptor exactly once in reverse capture order. No canonical or
sanitized byte is written before successful release. A descriptor-release
failure suppresses canonical output, exits `70`, retains every result/root
state, and does not authorize retry.

If the monotonic wrapper latch is non-empty after stable `close`, the wrapper
emits an Inconclusive canonical result with exactly the first latched code,
`controlResult: null`, and the exact four-step prefix through
`identity-postflight`. It does so even if later buffered bytes form a valid
complete or Inconclusive child object. If the latch is empty but child
framing/schema/canonical bytes or exit correlation is invalid, it first
latches `CONTROL_RESULT_INVALID` and emits the same four-step/null-control
shape. Only an eligible complete or child-Inconclusive object appends
`control-result-validated` and uses all five steps.

The branch prefixes are therefore closed: synchronous no-child failure has the
private one-step prefix `identity-preflight` and no canonical result; a
returned but unclosed child has the private two-step prefix through
`child-spawned` and no output; a stably closed wrapper/control failure has
exactly four public steps; and an accepted complete or child-Inconclusive
result has exactly five. No other prefix/result combination is valid.

Identity failure or unknown settlement emits no activation result and cannot
claim `identityStable: true`. After an observed `close`, an identity-failure
branch may emit only the fixed sanitized code
`M4_ACTIVATION_IDENTITY_CHANGED` and exit `70`; that is not a canonical result
or runtime evidence, and it may do so only after best-effort reverse descriptor
release succeeds; otherwise output is suppressed. An unknown-settlement branch
cannot emit a terminal code or exit under wrapper control because doing so
would release the child handle and identity lease before `close`. External
termination of that retained branch is a human/runtime-state handoff, not
wrapper settlement. The synchronous no-child branch uses the distinct fixed
`M4_ACTIVATION_SPAWN_FAILED` terminal above and is likewise not runtime
evidence.

Every canonical output is only a candidate immutable attempt record. A fresh
Docker-free result review must reconcile it with the exact new root states
before any complete result can be accepted as profile-control Observed.
Inconclusive, missing-output, invalid-output, identity-failure, and
unknown-settlement outcomes remain Inconclusive and are never repaired or
retried.

## Runtime side effects, retention, and restoration

The wrapper adds only the one fixed Node child. Inside that child, the already
reviewed existing-image backend remains limited to the fixed same-image pair
and at most 13 fixed `/usr/bin/docker` create/inspect/start/copy/remove process
operations. It may not build, pull, log in, run doctor, inspect the retained
build tag/root, accept arbitrary input, use external network, inherit a Docker
environment, or access a runtime socket directly. The existing backend's
credential-empty per-run Docker configuration and fixed offline/container
safety boundary remain mandatory.

The new pair roots are the only new durable result roots. The wrapper neither
creates another evidence root nor reads or modifies the pair roots. The child
backend may remove only its already reviewed transient transfer/config state;
canonical input/host/container-result/scratch state is retained as defined by
the backend. On timeout, output failure, identity failure, unknown settlement,
or cleanup failure, every remaining new root/container/state is retained and
reported only by exact state in the later result review. No post-attempt Docker
command, forced cleanup, deletion, repair, result reinterpretation, or retry is
authorized.

The implementation is tracked before execution, so the one-shot command makes
no temporary repository edit and has no restoration write. The ordinary
`orchestrator-entry` source/output and ordinary M4 scripts remain unchanged and
fail closed. After any command occurrence, the fresh identities are exhausted;
the tracked wrapper may remain present, but root absence prevents reuse and no
new generation may be chosen without another contract.

## Exact later implementation and verification boundary

A positive contract review may approve at most one Docker-free implementation
that changes only:

- `containers/profile-control/src/constants.ts`;
- new
  `containers/profile-control/src/frozen-research-profile-control-executor.ts`;
- compiler-produced `containers/profile-control/dist/constants.js`,
  `containers/profile-control/dist/constants.d.ts`, and the new wrapper
  JavaScript/declaration;
- `containers/profile-control/scripts/verify-static.mjs`;
- `containers/profile-control/test/frozen-research-profile-control-entry.test.ts`;
- new
  `containers/profile-control/test/frozen-research-profile-control-executor.test.ts`;
- `containers/profile-control/test/import-safety.test.ts` and
  `containers/profile-control/test/static-safety.test.ts` only as needed to
  replace dormant non-reachability with the exact explicit-wrapper edge;
- `profiles/permissive/README.md` and `profiles/constrained/README.md` for the
  new run-ID handoff;
- root `package.json` for exactly the one script above; and
- the saved implementation/review prompts plus minimal issue #45 status
  records.

No canonical profile JSON, image/staging input, activation-entry source,
ordinary entry, backend/executor source, fixture, result, Expected matrix,
historical evidence, adapter, or `Observed` value belongs to that
implementation.

Focused Docker-free tests must cover at least:

- old-ID rejection and exact new run/root/container derivation;
- the proposed constants hashes and updated activation manifests;
- exact 32-source/64-output inventories and unchanged
  22/22/22-construction plus 21-executable sets;
- the exact ordered seven built-in source/JavaScript import specifiers and
  bindings, empty repository-local direct-edge sets, singleton wrapper source
  and executable closures, every rejected missing/extra/reordered/alternate
  built-in binding, and every relative/dynamic/computed/`require`/package/
  subpath/other-production-entry or otherwise unleased edge;
- wrapper non-import of the activation object, path-only child separation, and
  exact package-only production inbound edge;
- no-argument, fixed child process object, empty child environment, and no
  second spawn;
- missing/extra/reordered/aliased/replaced/in-place-mutated source, compiled,
  wrapper, package, directory, and peer-identity cases;
- pre-spawn/two-post-`close` validation, synchronous thrown spawn with no child,
  its exact four-validation/reverse-release/sanitized-terminal boundary,
  asynchronous `error` both without and with later `close`, exit-without-close,
  timeout, output-first, TERM/KILL delivery failure, and late-close ownership;
- strict canonical child-result and outer-result validation, exact exit/close
  correlation, step-prefix/chronological first-failure rules, valid complete
  and Inconclusive child bytes arriving after each timeout/output/process/
  signal branch, permanent child-result disqualification, private-field
  non-projection, and suppression on identity/settlement/release failure; and
- root absence checks that touch only the two exact new paths and never old
  roots or Docker.

The later Docker-free implementation/review commands may include the pinned
compile-only constructor, `npm run m4:typecheck`, `npm run m4:static`,
`npm run m4:test`, `npm run m4:verify`, focused formatting, and
`git diff --check`. They must not invoke the wrapper, activation entry,
`npm run m4:doctor`, `npm run m4:build`,
`npm run m4:recovery:offline-build`, `npm run m4:run:controls`, the proposed
one-shot command, Docker, a production executor, retained-state access, or a
runtime experiment.

## Evidence classification and next gate

- This document and its fresh review are contract evidence only.
- In-memory compilation, hashes, static analysis, and future focused tests are
  construction/static/unit evidence only.
- Defining the command does not approve it. A positive review of this contract
  may approve only the bounded Docker-free implementation above.
- After implementation, a separate fresh Docker-free implementation/gate
  review must reproduce exact wrapper bytes, compiled outputs, source/result
  identities, package command, new-root absence, process/output behavior, and
  static/unit evidence before it may approve one command occurrence.
- Only such a later approved exact gate could allow a fresh worker to use
  `continue-repository-work` standing authorization for the command once. That
  would not be a separate human review.
- A still-later Docker-free result review is mandatory before classification
  or any profile-control Observed decision. Adapter/matrix/presentation
  `Observed` remains a separate, unavailable boundary under ADR-0001.

No activation object import/execution, Docker/container/runtime-socket action,
retained-state/result-root access, compilation to disk, profile/input change,
historical-result change, standing-authorization use, external network,
credential, Remote Git, publication, deployment, or external communication
occurred while defining this contract.

One unnecessary read-only diagnostic printed the current Node executable path
and read `/usr/bin/node` metadata and bytes. It did not traverse or read any
user-home file, credential, runtime socket, or retained repository state and
made no change, but it exceeded the repository-only ordinary-development read
boundary. It is not contract evidence. The fresh review and every later task
must use only repository-owned Node/toolchain inputs and must not repeat that
diagnostic.

Fresh independent contract-review update (2026-07-20): the Docker-free
read-only review in
[`reviews/m4-distinct-activation-object-execution-gate.md`](reviews/m4-distinct-activation-object-execution-gate.md)
reproduces the fresh generation, constants/compiler/manifests, activation and
profile bytes, parent inventories, fixed child shape, listed held-object
protocol, existing-backend side-effect ceiling, retention, and evidence
separation. It closes M4-AG01 and M4-AG06 but blocks implementation on three
contract findings: M4-AGR01 leaves the wrapper's own repository runtime import
closure unbound to the held lease; M4-AGR02 omits an exact synchronous
no-child spawn-failure branch and signal-failure classification; and M4-AGR03
allows a late valid child result to remain eligible after a wrapper failure
has latched. M4-AG02 through M4-AG05 remain open only on those findings.

No wrapper/run-ID/package implementation, filesystem-emitting compile, object
import/execution, Docker action, result/retained-state access, command
approval, historical evidence change, or `Observed` promotion occurred.

M4-AGR01 through M4-AGR03 contract-remediation update (2026-07-20): the
Docker-free contract now fixes the wrapper's ordered seven-built-in and empty
repository-local import sets, singleton executable closure and complete held
edge rejection; the synchronous no-child, asynchronous error, signal-delivery,
late-`close`, descriptor-release, and root-retention branches; and one
chronological write-once failure latch that permanently disqualifies every late
child result. Focused later acceptance covers every fixed edge and settlement
branch. The fresh independent remediation re-review prompt is saved under
[`prompts/reviews/`](../prompts/reviews/m4-distinct-activation-object-execution-gate-remediation-review.md).

This remediation changed contract/status records only. It did not add the
wrapper or package edge, rebind run IDs, compile to disk, import or execute the
activation object, access Docker or retained/result state, approve or run the
candidate command, use standing authorization, change historical evidence, or
promote `Observed`.

Next: perform the fresh independent Docker-free read-only remediation
re-review under
[`prompts/reviews/m4-distinct-activation-object-execution-gate-remediation-review.md`](../prompts/reviews/m4-distinct-activation-object-execution-gate-remediation-review.md).

Fresh M4-AGR01 through M4-AGR03 remediation re-review update (2026-07-20):
the independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-execution-gate-remediation.md`](reviews/m4-distinct-activation-object-execution-gate-remediation.md)
reproduces the fresh tuples, constants/compiler/manifests, unchanged
activation/profile bytes, 32/64 parent inventories, exact seven-built-in and
zero-local wrapper edges, singleton wrapper closures, complete no-child and
returned-child settlement, and chronological write-once output precedence.
M4-AGR01 through M4-AGR03 close with no new finding, so M4-AG01 through
M4-AG06 are closed at contract scope.

The review approves only the exact bounded Docker-free implementation and
focused static/unit verification already listed above. It does not approve or
execute the candidate command, import or execute the activation object, access
Docker or retained/result state, use standing authorization, change historical
evidence, or promote `Observed`.

Next: perform the exact bounded Docker-free wrapper/run-ID/package
implementation and focused static/unit verification, then obtain a fresh
independent implementation/gate review before any command approval.

Bounded implementation update (2026-07-20): the implementation and later
review prompts were saved before production-source edits. The two constants
now bind the exact `20260720-02` pair; the built-in-only wrapper source and
compiler-produced JavaScript/declaration are respectively 42,865 bytes /
`80829982...`, 41,159 bytes / `ab36b509...`, and 1,244 bytes / `ed1e6145...`.
The wrapper holds the exact 32-source/64-output parents, complete activation
construction, package/profile inputs, fixed child boundary, close-only
settlement, write-once failure precedence, bounded canonical output, and
retention/no-retry rules. The one package script and two profile README
handoffs now name only the fixed candidate generation.

The pinned compile-only constructor completed without diagnostics. `npm run
m4:verify` passed typecheck, the Docker-free static verifier, 24 test files,
and all 265 tests; the separate permission-bounded compiled import-safety
assertion imported ten ordinary modules without either frozen-research entry.
This is construction/static/unit evidence only. The wrapper and activation
entry were not invoked by the production command, and Docker, runtime sockets,
retained/result state, historical evidence, command approval/execution,
standing authorization, and `Observed` were not accessed or changed.

One initial read-only instruction-discovery command used `find ..` instead of
the repository-scoped search and listed adjacent path names before encountering
permission-denied result subtrees. It did not read an adjacent file, credential,
runtime socket, or retained-state content and made no change, but it exceeded
the repository-only ordinary-development enumeration boundary. It is not
implementation or verification evidence and was not repeated.

Next: perform the fresh independent Docker-free implementation/gate review
under
[`prompts/reviews/m4-distinct-activation-object-execution-gate-implementation-review.md`](../prompts/reviews/m4-distinct-activation-object-execution-gate-implementation-review.md)
before any candidate command approval.

Fresh implementation/gate review update (2026-07-20): the independent
Docker-free review in
[`reviews/m4-distinct-activation-object-execution-gate-implementation.md`](reviews/m4-distinct-activation-object-execution-gate-implementation.md)
reproduces the fixed generation, constants/compiler outputs, 32/64 parent
inventories, activation 22/22/22/21 sets and manifests, current wrapper hashes,
seven-built-in/zero-local edges, package/profile handoffs, and the process and
output source trace. The pinned compiler completed without diagnostics and
`npm run m4:verify` passed 24 test files and all 265 tests.

Command approval is blocked on M4-AGI01 and M4-AGI02. The production capture
passes no expected byte length or SHA-256 for the wrapper source and
JavaScript, passes neither for the declaration, and uses only the two import
prefixes; current bytes therefore become a new stable baseline without being
authenticated as the reviewed objects. The focused tests also omit required
edge, production-capture, exit/close, signal, root-access, late-valid-output,
and outer-projection negative combinations. M4-AG02 through M4-AG05 remain
open at implementation scope. M4-AG01 and the evidence-separation part of
M4-AG06 remain closed.

No candidate command, wrapper/activation production entry, Docker or runtime
socket, result/retained-state access, historical evidence, standing
authorization, or `Observed` value was executed, accessed, or changed.

Next: remediate only M4-AGI01 and M4-AGI02 under
[`prompts/m4-distinct-activation-object-execution-gate-implementation-remediation.md`](../prompts/m4-distinct-activation-object-execution-gate-implementation-remediation.md).

Bounded M4-AGI01/M4-AGI02 remediation update (2026-07-20): the complete
wrapper source, JavaScript, and declaration remain byte-for-byte unchanged at
the three independently reviewed identities. The contract now makes their
full-object authenticity an explicit non-circular fresh-worker trust input:
`npm run m4:static` must be the final filesystem-reading preflight and the
candidate command, if a later independent review approves it, must be the
immediately following command with no intervening command or write. Production
descriptor capture and twice-pre/twice-post validation remain stability checks
after that external input; they are not described as self-authentication. The
cooperative-host race limitation remains explicit.

The focused wrapper suite now rejects a same-prefix body change, appended
loading form, every missing/extra/reordered/alternate source or emitted
built-in binding, and absolute/relative/`file:`/package/subpath/import-map,
dynamic/computed, `require`, `createRequire`, property/evaluation,
activation/ordinary/backend/runner, export, and otherwise unleased edges. It
also covers separate third/fourth no-child validation failures, reverse-release
suppression, exact two-root absence instrumentation, null streams, invalid PID,
missing/duplicate/contradictory exit-close tuples, asynchronous error with and
without later `close`, TERM/KILL delivery failure, both valid complete and
Inconclusive bytes after each earlier failure class, exact prefix/key order,
private-field suppression, both post-use validations, and release-before-output.

`npm run m4:verify` passed typecheck, the Docker-free static verifier, 24 test
files, and all 292 tests, including all 40 generated focused wrapper cases. The
separate repository-read-only permission-bounded assertion imported ten
ordinary compiled modules with timer interception and without either
frozen-research entry. Scoped formatting and `git diff --check` passed. The
root format check remains blocked only by a pre-existing unformatted change in
`containers/profile-control/test/control-host-backend.test.ts`, which this
bounded remediation did not modify. No wrapper/activation production entry,
candidate or other M4 production command, Docker/container/runtime socket,
result or retained state, cleanup, retry, signal, historical evidence,
standing authorization, or `Observed` value was executed, accessed, or
changed.

Next: perform the fresh independent Docker-free read-only remediation re-review
under
[`prompts/reviews/m4-distinct-activation-object-execution-gate-implementation-remediation-review.md`](../prompts/reviews/m4-distinct-activation-object-execution-gate-implementation-remediation-review.md).

Fresh M4-AGI01/M4-AGI02 remediation re-review update (2026-07-20): the
independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-execution-gate-implementation-remediation.md`](reviews/m4-distinct-activation-object-execution-gate-implementation-remediation.md)
closes both findings and M4-AG01 through M4-AG06 at implementation scope. It
reproduces the exact three full wrapper objects, final-static non-circular trust
split, seven-built-in/zero-local singleton edges, complete focused negative
matrix, and two-root source access ceiling. `npm run m4:verify` passed 24 test
files and all 292 tests.

The review approves only the exact at-most-one later gate: a fresh worker must
reproduce all reviewed identities and both exact new-root absence facts, run
`npm run m4:static` as the final filesystem-reading trust preflight, and, with
no intervening command or write, use standing authorization for exactly one
`npm run --silent m4:execute:frozen-research` occurrence. Any failed preflight
or command occurrence exhausts the generation; no retry, repair, cleanup,
alternate tuple, or result classification is authorized in that worker. The
review did not run the wrapper/activation production entry, Docker, or the
candidate command and did not use standing authorization.

Next: execute that exact approved one-occurrence gate in a fresh worker, then
stop without retry for a separate Docker-free result review.

## Exact one-occurrence execution handoff

On 2026-07-20, a fresh worker reproduced every reviewed wrapper, constants,
activation, package, canonical-profile, inventory, manifest, edge, generation,
and command identity. It checked only the exact permissive and constrained
`20260720-02` result roots and established that both were absent. The final
immediately adjacent `npm run m4:static` trust preflight exited 0.

The worker then used the `continue-repository-work` standing authorization for
exactly one argument-free
`npm run --silent m4:execute:frozen-research` occurrence. This standing
authorization use was not a separate human review. The candidate exited 70
and emitted no stdout or stderr. The generation is exhausted and was not
retried, repaired, cleaned up, or replaced. No post-attempt Docker command,
result-root or retained-state inspection, result classification,
historical-evidence change, or `Observed` promotion occurred in this worker.

Exit 70 and the empty candidate output are execution observations only. A
separate fresh Docker-free review must first fix its exact result-root access,
canonical-byte, reconciliation, classification, retention, and evidence
boundaries before inspecting either new root.

Next: define the exact fresh Docker-free result-review prompt for the exhausted
`20260720-02` activation generation without accessing either result root.

## Exhausted-generation result-review handoff

The exact fresh Docker-free review prompt is now saved at
[`prompts/reviews/m4-distinct-activation-object-result-review.md`](../prompts/reviews/m4-distinct-activation-object-result-review.md).
It fixes the exit-70/zero-byte stdout and stderr observation, approved
repository identity packet, only the two exact new result roots and named
control-record paths, no-follow canonical/cross-binding review, retained-state
non-access, and an Inconclusive ceiling when the canonical activation result is
missing. It prohibits retry, repair, cleanup, alternate identities, Docker
recovery, and any profile-control or matrix `Observed` promotion.

This prompt-definition task did not inspect either new root, access Docker or
retained state, run a production command, change candidate/result bytes, or use
standing authorization.

Next: perform the fresh independent Docker-free read-only result review under
the saved prompt above.

## Exhausted-generation result-review decision

The fresh independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-result.md`](reviews/m4-distinct-activation-object-result.md)
reproduced every approved repository object, the 32/64 parent inventories,
22/22/22/21 activation sets, seven-built-in/zero-local wrapper closure, and all
three construction manifests. `npm run m4:static` exited 0, and `npm run
m4:verify` passed 24 test files and all 292 tests.

The bounded no-follow result inspection checked only the exact permissive and
constrained `20260720-02` paths; both are absent. There is no manifest, host,
container, transfer, marker, or Docker-configuration record to validate. The
exit-70/zero-byte output therefore establishes no canonical activation result,
failure code, completed-step prefix, identity stability, child settlement,
Docker behavior, profile result, or `Observed` value. It is accepted only as
one immutable exhausted Inconclusive attempt, with no retry, repair, cleanup,
alternate generation, or promotion.

Issue #45 closes at this reviewed Inconclusive and cooperative-host boundary.

Next: begin issue #46 with one Docker-free public-input-hardening contract and
fresh independent contract-review prompt; do not implement the hardening in
that contract task.
