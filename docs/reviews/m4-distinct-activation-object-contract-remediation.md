# M4 distinct activation-object M4-AO02 remediation re-review

## Review target and decision

- Target: the issue #45 M4-AO02 distinct activation-object contract-only
  remediation
- Review type: fresh independent Docker-free read-only contract re-review
- Decision: **APPROVED; at most the contract's exact bounded
  compile-only/static/unit implementation may proceed**
- M4-AO01 exact construction: **CLOSED at contract scope**
- M4-AO02 source/construction/executable closure separation: **CLOSED at
  contract scope**
- M4-AO03 identity and settlement: **CLOSED at contract scope**
- M4-AO04 implementation and tests: **CLOSED at contract scope**
- M4-AO05 evidence and gate separation: **CLOSED at contract scope**
- Blocking findings: none
- Non-blocking findings: none
- Activation source, compiled output, Docker, retained M4 state, runtime
  evidence, and `Observed`: not created, emitted to disk, executed, accessed,
  or changed

The remediation corrects the sole prior finding without changing the
construction contract. The TypeScript syntax closure has 22 modules, the
compiler constructs 22 JavaScript and 22 declaration files, and the emitted
JavaScript executable import closure has 21 modules. `types.ts` remains a
type-only source dependency; its compiler-produced `types.js` counterpart is a
required construction output with no runtime inbound edge.

The three proposed objects remain absent. This approval permits only the
already fixed Docker-free compile-only/static/unit implementation and focused
verification allowlists. It does not authorize importing or executing the
entry, Docker access, retained-state access, a runtime tuple, or an execution
gate.

## Reviewed snapshot identity

The hashes below identify the review inputs before this review record and its
minimal status updates were added. They are static byte identities, not runtime
filesystem identities.

| Target | SHA-256 |
|---|---|
| Remediated distinct activation-object contract | `25b3101a349c910feb458a9d395d1298ef46199ed647851f545149624985b310` |
| Prior distinct activation-object contract review | `c1091ddaf70e4e26a71137f48ea7b454f14d9ed3b0b23af0ff4288d177e6c674` |
| M4-AO02 contract remediation prompt | `c7ecf5996880e0216815b2bee88988ea6fb321acf2309103ed8fa1422e9d7bd7` |
| This remediation re-review prompt | `ad24a68e3e405de5dcc77823c1dd93a7f3971b9b3afcab28a0afe1e0be478ca9` |
| Exact filesystem-object identity contract | `4f18b5125570dd7c94033a0d5eab8297536ed5110388efb852561f6acf80dccf` |
| First filesystem-identity implementation remediation re-review | `61cf631523a6711999623389a1e833abf17d2b0b564d75de31c6eb7ad0129ffa` |
| Sorted SHA-256 manifest of the approved 16 implementation/test/static paths | `d3c96ae97bc39a2a5001da63c4970a7a4a62358b65f579009c1bf46944c54b79` |
| TypeScript build configuration | `16a86d6c7020b5edcee7fdce1e8a1e5cc7708784b36ca4001aa7c509c8d20d78` |
| Root package manifest | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |
| Ordinary source entry | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| Ordinary compiled entry | `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4` |
| Package-root source | `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4` |
| Package-root JavaScript | `804be6bcee47e64294387c8eeb5be024142ae37cb370b2d0272d32ef24c9a011` |
| Package-root declaration | `ce87797fe4e7fac0b1fcebdbeeb8e2b3f9b7e8c00683e8b0aba35cfd30d8086e` |

The existing issue #45 implementation remains byte-for-byte equal to the
preceding independent implementation re-review's exact 16-path aggregate. The
complete changed/untracked path inventory was inspected and the earlier
filesystem-identity work was preserved.

## M4-AO01 — exact construction remains closed

The proposed source, JavaScript, and declaration paths are absent. The source
block reproduces exactly 774 UTF-8 bytes with one final LF and SHA-256
`580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d`.

Repository-pinned TypeScript `5.9.3` was used with
`containers/profile-control/tsconfig.build.json`, the proposed source held
only in memory, and a write callback that retained every output in memory. The
program reported no diagnostics and did not write a source, temporary entry,
or compiled output to the repository or a temporary directory.

The in-memory constructor reproduced:

- the exact 788-byte JavaScript with SHA-256
  `34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7`;
- the exact 11-byte declaration with SHA-256
  `8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881`;
- every source, JavaScript, and declaration size/hash in the 22-row table;
- the exact 31-source and 62-output inventories; and
- exactly the contract's four new and nine replaced compiled outputs, with no
  other emitted delta.

The full repository-relative manifests reproduced:

| Manifest | Bytes | SHA-256 |
|---|---:|---|
| 22 source rows | 2,582 | `b0bbbf397888a10b7b3309f46ae89211edff42face25286e91fc0400f00d97ae` |
| 44 compiled construction rows | 5,232 | `968d70e317b784fbb2fe60522f3618d5fe807249ac3a1090f8093b462863c390` |
| Concatenation | 7,814 | `b46f91822134d535be09e6e53119720f88633815cb2a909cb7e5bae752f80c43` |

M4-AO01 therefore remains closed at contract scope.

## M4-AO02 — three exact sets are now closed

### TypeScript source closure

Syntax-derived transitive TypeScript reachability reproduces this exact ordered
22-module set:

```text
canonical
completion
constants
control-host-backend
definitions
docker-formats
docker-plan
errors
evidence
execution
filesystem-identity
frozen-research-profile-control-entry
image-input
inspect
offline-build-process
orchestrator
profile-input
run-controls
safe-data
staging
types
validation
```

The proposed entry has exactly three relative static source edges: `errors`,
`orchestrator`, and `run-controls`. Every source-closure edge to `types.ts` is
type-only. No computed or dynamic import, `require`, import-map alias, package
subpath import, or offline-build/recovery-entry dependency is reachable from
the proposed entry.

### JavaScript construction set

The compiler produces one JavaScript and one declaration for every source row.
The ordered 22-JavaScript construction set is the same basename list above,
including `types.js`; the ordered 22-declaration construction set is likewise
complete. All table bytes, both construction manifests, the full inventories,
and the 13-output delta match. Construction membership is not treated as
runtime reachability.

### Executable JavaScript import closure

Syntax-derived transitive reachability over the emitted in-memory JavaScript
reproduces this exact ordered 21-module set:

```text
canonical
completion
constants
control-host-backend
definitions
docker-formats
docker-plan
errors
evidence
execution
filesystem-identity
frozen-research-profile-control-entry
image-input
inspect
offline-build-process
orchestrator
profile-input
run-controls
safe-data
staging
validation
```

The emitted entry retains exactly the same three direct relative edges. No
emitted module has a runtime edge to `types.js`, and no computed/dynamic import,
`require`, unknown relative target, package import, or other loading form is
present in the executable closure. A focused terminology scan found no
remaining statement that calls the 22 construction outputs a 22-module
executable/runtime closure.

The contract and focused acceptance rules now reject a missing, extra, or
reordered member in any of the three sets, a changed runtime edge, and any
attempt to make `types.js` runtime-reachable. M4-AO02 is closed at contract
scope.

## Preserved findings

### M4-AO03 — identity and settlement remain closed

The correction adds no source import, runtime edge, path, alias, or mutation
window. The contract still requires held no-follow descriptors for the complete
source/compiled chain, private BigInt device/inode/owner/full-mode/link/size/time
records, exact bytes, one-link distinct objects, complete pre-spawn and
post-`close` validation, and retention under unknown child settlement. The
same-UID cooperative-host limitation, private-metadata redaction, and
fail-closed unsupported-platform rule are unchanged.

M4-AO03 remains closed at contract scope. These requirements are inputs to a
later implementation and execution gate, not runtime observations.

### M4-AO04 — implementation and tests remain closed at boundary

The exact construction allowlist remains one new source plus the 13 reproduced
compiled deltas. The verification allowlist remains one new focused test, three
existing focused tests, and the static verifier. No existing production
TypeScript source, package manifest/script/export, profile, fixture, ordinary
entry, input, staging/result path, Expected value, or historical record was
added.

Focused acceptance now distinguishes the 22-source,
22-JavaScript-construction, and 21-executable-import sets and rejects member,
order, and edge drift. All prior byte, inventory, non-reachability, identity,
settlement, unknown-settlement, early-stability, and import-safety categories
remain present. M4-AO04 remains closed at contract scope.

### M4-AO05 — evidence and gate separation remain closed

The proposed object was not created, compiled to disk, imported, or executed.
No Expected revision, run ID, result root, container/image identity, activation
command, output, process wrapper, or one-shot gate was selected. Docker and
retained M4 state were not accessed, and no historical result or `Observed`
value was changed or reclassified.

Contract and in-memory compiler evidence cannot prove that Node loaded the
object, the identity chain held around a child, Docker ran, a capability was
enforced, or a result was produced. A fresh implementation review and a later
separately recorded execution-gate contract remain mandatory. M4-AO05 remains
closed.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, routed frozen-research/M4 documents, prior implementation/contract reviews, remediation prompt, and this review prompt | Read without Docker, retained-state access, result-root traversal, external network, credentials, Remote Git, or external communication. |
| `git status --short --branch`, `git diff --name-status`, `git diff --numstat`, complete issue #45 path inventory, critical SHA-256 values, and sorted 16-path manifest | Preserved all prior work and reproduced the approved `d3c96ae9...` implementation aggregate plus the ordinary entry/package-root identities. |
| Proposed-path absence and scoped source/compiled/test/script/package reference scan | All three proposed objects are absent; no non-documentation reference to the distinct basename exists. |
| In-memory TypeScript `5.9.3` virtual-source compile and write callback | Exit 0; no diagnostics, no filesystem emit, 62 captured outputs, exact proposed bytes, every 22-row table value, 31-source/62-output inventories, and exact 13-output delta reproduced. |
| Repository-relative source/compiled/combined manifest calculation | Exit 0; reproduced 2,582 / 5,232 / 7,814 bytes and all three contract hashes. |
| TypeScript and emitted-JavaScript syntax graphs plus type-only-edge assertions | Exit 0; reproduced the exact 22-source, 22-JavaScript-construction, and 21-executable sets, three direct entry edges, type-only `types.ts` reachability, no runtime inbound edge to `types.js`, and no forbidden loading form. |
| Focused contradictory-closure terminology assertion | Exit 0; no remaining 22-module executable/runtime-closure statement was found. |
| `git diff --check` before review edits | Exit 0. |
| Focused Prettier check over this review and the four status records | Exit 0; all five files matched repository formatting. |
| `git diff --check` after review/status edits | Exit 0. |

An initial shell helper sorted completed `sha256sum` rows by hash and therefore
produced a different `3a3d5c94...` aggregate. The corrected helper sorted the
16 path inputs before hashing their rows and reproduced the contract's
`d3c96ae9...` aggregate. This was a review-command encoding error, not
repository drift, and the incorrect aggregate is not used as evidence.

Tests, typecheck, a filesystem-emitting compile or build, `npm run m4:build`,
`npm run m4:run:controls`, a production executor, Docker/container/runtime
socket operations, retained-state or result-root inspection, cleanup, retry,
external network, credentials, host-home access, Remote Git, publication,
deployment, and third-party communication were not used. Standing authorization
was not needed because this review crossed no approval-gated runtime boundary.

## Evidence classification and remaining limitations

- This remediation and review are contract evidence.
- The in-memory compiler, hashes, inventories, and syntax graphs are
  static/review evidence only.
- The source and outputs are still absent, so no implementation test or
  compiled import-safety result exists for the distinct object.
- No production filesystem identity, path-only child consumption, Docker
  behavior, retained-state identity, runtime enforcement, profile-control
  `Observed`, adapter-route `Observed`, experiment-matrix `Observed`, or
  presentation claim is established.
- Historical attempts, results, identities, evidence classes, and limitations
  remain immutable.

## Decision and next task

M4-AO01 through M4-AO05 are closed at contract scope with no new finding. At
most one bounded Docker-free compile-only/static/unit implementation may now
use the contract's exact construction and verification allowlists. Before
changing source, that task must save its exact implementation prompt. It must
not import or execute the distinct entry, invoke `npm run m4:build` or
`npm run m4:run:controls`, access Docker or retained state, choose a runtime
tuple, define an execution gate, or change historical evidence or `Observed`.

Next: perform the exact bounded Docker-free compile-only/static/unit distinct
activation-object implementation, then obtain a fresh independent
implementation review before defining any execution gate.
