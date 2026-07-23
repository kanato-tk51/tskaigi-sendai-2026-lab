# M4 distinct activation-object implementation review

## Review target and decision

- Target: the issue #45 M4 frozen-research distinct activation-object
  compile-only/static/unit implementation
- Review type: fresh independent Docker-free read-only implementation review
- Decision: **APPROVED; at most one later Docker-free execution-gate contract
  task may begin**
- M4-AO01 exact construction: **CLOSED at implementation scope**
- M4-AO02 source/construction/executable set separation: **CLOSED at
  implementation scope**
- M4-AO03 identity and settlement: **CLOSED at implementation scope**
- M4-AO04 implementation, reachability, and focused tests: **CLOSED**
- M4-AO05 evidence and gate separation: **CLOSED**
- Blocking findings: none
- Non-blocking findings: none
- Object import or execution, Docker, retained M4 state, runtime evidence,
  historical results, and `Observed`: not accessed, executed, or changed

The implementation reproduces the reviewed dormant object without making it
an ordinary package or script entry. The compiler construction, three exact
module sets, complete inventories and manifests, private peer identities,
negative settlement boundary, and non-reachability all reproduce. Static/unit
evidence therefore closes M4-AO01 through M4-AO05 at implementation scope.

This approval does not select an Expected revision, run ID, result root,
container or image identity, process wrapper, output contract, activation
command, or one-shot execution. One separately recorded Docker-free
execution-gate contract is the maximum next boundary.

## Reviewed snapshot identity

The hashes below identify inputs before this review record and its minimal
status updates were added. They are static byte identities, not runtime
filesystem identities.

| Target | SHA-256 |
|---|---|
| Distinct activation-object contract | `e9840d711df03d513d747b798082415696e58aadff1765ac14de12c658ed6054` |
| M4-AO02 remediation re-review | `d49ba25313186ef7ce3a6b46659a1ce7a7c497906c42a524ec13f57113dd2e32` |
| Activation-object implementation prompt | `719fa8b21c6cb04af37d98fc72e9b952b38b5179cd8334d784147663c0f6927c` |
| This implementation-review prompt | `69ab7818adae74e9274bfc0cee802ea592ae92a1bae3920049af7140a108cab7` |
| First filesystem-identity implementation remediation re-review | `61cf631523a6711999623389a1e833abf17d2b0b564d75de31c6eb7ad0129ffa` |
| Root package manifest | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |
| Package-root source | `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4` |
| Package-root JavaScript | `804be6bcee47e64294387c8eeb5be024142ae37cb370b2d0272d32ef24c9a011` |
| Package-root declaration | `ce87797fe4e7fac0b1fcebdbeeb8e2b3f9b7e8c00683e8b0aba35cfd30d8086e` |
| Ordinary fail-closed source entry | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| Ordinary fail-closed compiled entry | `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4` |

The complete 19-path construction and verification snapshot uses sorted rows
encoded as `logicalPath NUL decimalByteLength NUL lowercaseSha256 LF`. It is
2,466 bytes with SHA-256
`fe0970cafbe62dddd5dba9d73a0fd4d53263cacd543795fc7c9716c8b4ae4c1c`.
Those 19 paths are the one source plus 13 compiled construction paths and the
five exact verification paths allowed by the contract. No package manifest,
profile, fixture, input, ordinary entry, historical result, or other
production TypeScript source is in that implementation boundary.

## M4-AO01 — exact construction closed

Independent read-only recomputation reproduced:

- the exact 774-byte source with SHA-256
  `580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d`;
- the exact 788-byte compiler-produced JavaScript with SHA-256
  `34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7`;
- the exact 11-byte declaration with SHA-256
  `8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881`;
- the exact 31-source and 62-output inventories;
- all 22 source, JavaScript, and declaration size/hash rows;
- all 13 rows of the four-new/nine-replaced compiled delta; and
- repository-pinned TypeScript `5.9.3` in-memory compilation with no
  diagnostics and byte equality for all 62 outputs.

The three construction manifests reproduced exactly:

| Manifest | Bytes | SHA-256 |
|---|---:|---|
| 22 source rows | 2,582 | `b0bbbf397888a10b7b3309f46ae89211edff42face25286e91fc0400f00d97ae` |
| 44 compiled construction rows | 5,232 | `968d70e317b784fbb2fe60522f3618d5fe807249ac3a1090f8093b462863c390` |
| Concatenation | 7,814 | `b46f91822134d535be09e6e53119720f88633815cb2a909cb7e5bae752f80c43` |

No filesystem-emitting compiler command was needed in this review. The
in-memory constructor and the already constructed disk bytes were compared
without importing the entry.

## M4-AO02 — three exact sets closed

Syntax-derived TypeScript reachability reproduced the ordered 22-module source
set, including `types.ts` only through type-only edges. Compiler construction
reproduced the same 22 basenames for JavaScript and declaration output.

Syntax-derived emitted-JavaScript reachability reproduced the ordered
21-module executable set. Construction-only `types.js` contains exactly
`export {};` plus LF, has no runtime inbound edge, and is excluded from that
executable set. The entry has exactly three relative edges: `errors`,
`orchestrator`, and `run-controls`.

The complete source-edge manifest is 1,789 bytes with SHA-256
`d83d8d353fcdddfc95eca1d4cb044627172fafe52d3bc71677d094f9bd690495`.
The executable-edge manifest is 1,528 bytes with SHA-256
`c0c33de9b2b1625625c31d598fd0bf1a904f1207075c4c24c6591b1573042ff3`.
Focused assertions reject missing, extra, or reordered membership, computed or
dynamic import, `require`, package import, source/output byte drift, and any
attempt to make `types.js` runtime-reachable.

## Dormant reachability

The complete source/compiled inventory and repository-reference scan found no
inbound production reference to the distinct basename. The package root,
workspace manifests, root scripts, package-root source/output, ordinary
orchestrator source/output, and recovery entry remain independent of the
distinct object. Existing M4 script bytes still name only the ordinary
fail-closed entry.

The focused compiled import-safety assertion imported ten ordinary compiled
modules under filesystem-read-only, child-disabled permission settings while
temporarily rejecting timer creation. It did not import the distinct entry,
left no active-resource drift, and completed without compile, child spawn,
timer, filesystem mutation, Docker action, or activation.

## M4-AO03 — identity and settlement closed

The three new objects independently reproduced as pairwise-distinct one-link
regular files with exact bytes and sizes. Without publishing private numeric
metadata, the review confirmed that each object's private owner and complete
mode equal its exact ordinary peer: source to source entry, JavaScript to
compiled entry, and declaration to compiled declaration.

The focused identity lease captures the two parent inventories, all three
ordinary peers, and all three new objects, rejects any device/inode alias, and
performs two complete stable validations before closing the retained handles.
The existing deterministic negative suites continue to cover symlink and
hardlink aliasing, same-byte replacement, parent replacement, in-place write,
special-mode and owner drift, original creating-descriptor continuity, and
use after close.

The reviewed fake-process boundary rejects unsettled `exit`/no-`close`, retains
the recovery identity lease through unknown settlement until a later `close`,
revalidates fixed copy sources after child `close`, and rejects false early
`manifestIdentityStable`. These are static/unit tests of the future protocol;
they are not observations that an activation child ran or that a production
filesystem chain held.

## M4-AO04 — bounded implementation and tests closed

The implementation adds only the dormant source and compiler outputs plus the
five exact verification paths. Complete worktree inspection preserved the
earlier issue #45 filesystem-identity implementation and found no activation
change to another production TypeScript source, package manifest/script/export,
profile, fixture, input, staging/result path, ordinary entry, Expected value,
or historical result.

`npm run m4:verify` exercised the exact-byte constructor, three sets and edge
manifests, source/compiled inventories, non-reachability, new-object identity,
replacement and settlement negatives, and ordinary import safety. Typecheck,
the Docker-free static verifier, 23 test files, and all 252 tests passed.

## M4-AO05 — evidence and gate separation closed

The implementation and this review establish only contract, construction,
static, and unit evidence. The distinct object was not imported or executed.
No profile, Expected/Observed value, runtime tuple, process wrapper, activation
command, output contract, one-shot gate, or historical evidence was selected
or changed.

Docker, a runtime socket, retained state, result roots, runtime identities,
profile-control enforcement, adapter-route evidence, experiment-matrix
`Observed`, and presentation claims were not accessed or established. The
ordinary entry remains fail closed, and historical attempts remain immutable.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, routed frozen-research/M4 documents, contract/review/remediation packet, implementation prompt, and this review prompt | Read without Docker, retained-state access, result-root traversal, external network, credentials, Remote Git, or external communication. |
| `git status --short --branch`, `git status --short --untracked-files=all`, `git diff --name-status`, `git diff --numstat`, complete path/reference scans, and critical size/SHA-256 checks | Preserved all prior issue #45 work; reproduced the exact source/output objects and found the distinct basename reachable only from its source filename, exact focused verifier/tests, and documentation. |
| Independent TypeScript/compiler, inventory, manifest, and syntax-graph assertion | Exit 0; TypeScript `5.9.3`, no diagnostics, 31 sources, 62 outputs, exact 22 source/22 JavaScript/22 declaration construction sets, exact 21 executable set, all three construction manifests, both edge manifests, and all activation bytes reproduced. |
| Independent 19-path snapshot and private peer-relation assertion | Exit 0; reproduced the 2,466-byte `fe0970ca...` manifest and confirmed three pairwise-distinct one-link regular objects with exact private peer owner/full-mode relations without printing numeric metadata. |
| `npm run m4:verify` | Exit 0; typecheck passed, the static verifier explicitly reported no import/execution/runtime-enforcement claim, and 23 test files / all 252 tests passed. |
| Compiled ordinary-module import-safety assertion without the distinct entry | Corrected assertion exit 0; ten modules imported with activation false, no active-resource drift, and child/filesystem-write permissions disabled. |
| `git diff --check` before review edits | Exit 0. |

The first import-safety helper compared active resources before a transient
`CloseReq` from module loading had drained and exited 1. The corrected helper
waited one event-loop turn, excluded only that transient close request, retained
timer interception and restrictive permissions, and passed. This was a review
helper timing error, not repository drift or an implementation failure.

No filesystem-emitting compile, `npm run m4:build`, `npm run
m4:run:controls`, other production executor, object import/execution,
Docker/container/runtime-socket operation, retained-state or result-root
inspection, cleanup, retry, external network, credential, host-home access,
Remote Git, publication, deployment, or third-party communication was used.
Standing authorization was not needed because this review crossed no
approval-gated runtime boundary.

## Evidence classification and remaining limitations

- The activation contract and reviews remain contract evidence.
- Source/output bytes, compiler output, hashes, manifests, syntax graphs,
  static verification, and focused tests are construction/static/unit evidence.
- No production child consumed the path, so pre-spawn/post-`close` identity,
  path-only consumption, output framing, and process settlement remain
  unobserved at runtime.
- The cooperative-host limitation remains: stable-boundary checks do not
  prevent an out-of-scope same-UID swap-and-restore race between observations.
- No Docker behavior, retained-state identity, runtime enforcement,
  profile-control `Observed`, adapter-route `Observed`, experiment-matrix
  `Observed`, or presentation evidence is established.
- Historical attempts, results, identities, evidence classes, and limitations
  remain immutable.

## Decision and next task

M4-AO01 through M4-AO05 are closed at the exact Docker-free implementation
boundary with no finding. At most one later Docker-free execution-gate contract
task may now define fresh identities, the complete held-object protocol, an
exact bounded process wrapper and output contract, one argument-free one-shot
command, result classification, restoration/retention rules, and a fresh
independent gate-review prompt. That task must not import or execute the object,
access Docker or retained state, or approve the command it defines.

Next: define the exact Docker-free M4 distinct activation-object execution-gate
contract and fresh independent gate-review prompt without importing or
executing the object.
