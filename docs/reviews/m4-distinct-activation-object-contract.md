# M4 distinct activation-object contract independent review

## Review target and decision

- Target: the separately named issue #45 M4 distinct activation-object
  contract
- Review type: fresh independent Docker-free read-only contract review
- Decision: **BLOCKED; do not implement or compile the activation object**
- M4-AO01 exact construction: **CLOSED at contract scope**
- M4-AO02 closed dependency reachability: **OPEN**
- M4-AO03 identity and settlement: **CLOSED at contract scope**
- M4-AO04 implementation and tests: **CLOSED at contract scope, but may not
  proceed while M4-AO02 is open**
- M4-AO05 evidence and gate separation: **CLOSED at contract scope**
- Blocking findings: one
- Non-blocking findings: none
- Activation source, compiled output, Docker, retained M4 state, runtime
  evidence, and `Observed`: not created, executed, accessed, or changed

The contract reproduces its three proposed absent paths, exact source and
compiler-produced bytes, complete construction inventories and manifests,
compiler delta, ordinary-entry non-reachability, private identity protocol,
bounded implementation allowlist, and evidence-class separation. It is blocked
on one exact dependency statement: the TypeScript source closure contains 22
modules, but the emitted JavaScript runtime import closure contains 21. The
type-only `types.ts` dependency emits a construction byproduct but is erased
from executable imports. The contract currently calls both closures 22 and
later calls the 22-row construction table the runtime import closure.

This is a contract correction, not an implementation defect. The proposed
source, its 22 JavaScript construction outputs, 22 declaration outputs, all
three manifest aggregates, and the exact compiler delta remain correct. One
bounded Docker-free contract-only remediation must distinguish those sets and
then receive a fresh independent re-review before implementation.

## Reviewed snapshot identity

The hashes below identify the review inputs before this review record,
remediation prompt, and minimal status updates were added. They are static byte
identities, not runtime filesystem identities.

| Target | SHA-256 |
|---|---|
| Distinct activation-object contract | `699222a5f8b5564fecb6d7868487038505e394dafd1c54764df79f51512ce2d0` |
| This contract-review prompt | `e09eb1f9752a1ed3f5c523803a7535a283992b3e0220c281ebe97b1895eef1c2` |
| Exact filesystem-object identity contract | `718c1c3a38983207c30957d947b98e23ec8799d006ee1df10cbca4c6ba6426a8` |
| First-implementation remediation re-review | `61cf631523a6711999623389a1e833abf17d2b0b564d75de31c6eb7ad0129ffa` |
| Sorted SHA-256 manifest of the approved 16 implementation/test/static paths | `d3c96ae97bc39a2a5001da63c4970a7a4a62358b65f579009c1bf46944c54b79` |
| TypeScript build configuration | `16a86d6c7020b5edcee7fdce1e8a1e5cc7708784b36ca4001aa7c509c8d20d78` |
| Root package manifest | `aa01a921db70b7333cf45d24fd44c43ca1e187501b75af416b13b29f77c17f98` |
| Ordinary source entry | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| Ordinary compiled entry | `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4` |
| Package-root source | `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4` |
| Package-root JavaScript | `804be6bcee47e64294387c8eeb5be024142ae37cb370b2d0272d32ef24c9a011` |
| Package-root declaration | `ce87797fe4e7fac0b1fcebdbeeb8e2b3f9b7e8c00683e8b0aba35cfd30d8086e` |

The exact 16-path manifest matches the preceding independent implementation
re-review, so this review did not reinterpret or modify the approved
filesystem-identity implementation. The complete current changed/untracked
path inventory was inspected and unrelated issue #45 history was preserved.

## M4-AO01 — exact construction closed

All three proposed paths were absent. The source block reproduced exactly 774
UTF-8 bytes, LF-only with a final LF, and SHA-256
`580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d`.

An in-memory virtual compiler host used repository-pinned TypeScript `5.9.3`
and `tsconfig.build.json`: `NodeNext` module and resolution, `ES2022`, strict
mode, declarations enabled, `src` root, and `dist` output. The virtual program
reported no diagnostics and captured all writes in memory. It did not create a
source file, temporary activation path, or repository output.

The emitted activation JavaScript reproduced 788 bytes and SHA-256
`34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7`.
The declaration reproduced 11 bytes and SHA-256
`8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881`.
Every source, JavaScript, and declaration byte/hash in the 22-row table matched.

The full repository-relative manifest encoding reproduced:

| Manifest | Bytes | SHA-256 |
|---|---:|---|
| 22 source rows | 2,582 | `b0bbbf397888a10b7b3309f46ae89211edff42face25286e91fc0400f00d97ae` |
| 44 compiled rows | 5,232 | `968d70e317b784fbb2fe60522f3618d5fe807249ac3a1090f8093b462863c390` |
| Concatenation | 7,814 | `b46f91822134d535be09e6e53119720f88633815cb2a909cb7e5bae752f80c43` |

The current inventories are exactly 30 source entries and 58 compiled entries,
with no current missing or extra compiled basename. Adding the virtual source
would produce the contract's exact 31-source and 62-output inventories. The
in-memory compiler comparison reproduced exactly the 13 output changes listed
by the contract: four new outputs and nine replacements. No other emitted byte
differed from current `dist`.

M4-AO01 is closed because the paths, constructor, table, inventories,
manifests, output bytes, and compiler delta are exact. The closure terminology
finding below does not change these construction values.

## M4-AO02 — executable closure count open

The proposed source has exactly three relative static edges:
`errors`, `orchestrator`, and `run-controls`. It has no computed import,
dynamic import, `require`, package import, import alias, or offline-build/
recovery-entry edge. Syntax-derived transitive TypeScript reachability is the
contract's exact sorted 22-module table, including `types.ts` through type-only
imports.

The emitted entry has the same three direct JavaScript edges and no forbidden
loading form. Its transitive executable import closure is instead these 21
modules:

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

`types.ts` is the sole source-closure member absent from the executable graph.
Its imports and exports are type-only, and TypeScript emits an 11-byte
`types.js` construction byproduct without a runtime inbound edge. Therefore the
contract statements that there are 22 executable modules and that the runtime
import closure is the 22-row table are false.

Current source, compiled code, package manifests, repository scripts, ordinary
entries, package root, production runner, host backend, and identity helper
contain no reference to the proposed distinct basename. The ordinary source
and compiled entry retain their reviewed hashes and still fail closed. Directly
naming the future compiled path with Node remains an unapproved later action.

M4-AO02 remains open until the contract distinguishes the 22-module source
closure, 21-module executable runtime import closure, and 22-JavaScript-file
construction set. No implementation may begin from the current wording.

## M4-AO03 — identity and settlement closed

The contract reconciles the future activation chain with the approved shared
BigInt implementation:

- repository, `containers`, profile-control, `src`, and `dist` ancestors retain
  exact inventories through held no-follow directory descriptors;
- all 22 source, 22 JavaScript, and 22 declaration construction rows require
  exact bytes, one-link regular-file type, pairwise distinct identities,
  private device/inode/owner/full-mode/size/time metadata, and held descriptors;
- the three new objects use exact owner/full-mode peer relations and permit no
  normalization, alias, rename, replacement, or in-place mutation;
- complete-chain validation occurs during preflight, immediately before a
  future child, only after child `close`, and before acceptance or cleanup;
- timeout, output limit, signal request, process error, and `exit` without
  `close` retain handles and cannot establish stability or authorize another
  command; and
- public projection retains only the logical role, approved bytes/hash, and a
  post-settlement stable boolean, without raw paths or private metadata.

`FilesystemIdentityLease` already rejects pairwise aliases, validates every
held descriptor/path snapshot with BigInt owner/mode/time fields, and closes in
reverse order. The contract correctly treats this as an input to a later gate,
not proof that a child used the object.

The activation remains a path-only external consumer. The explicit
cooperative-host limitation correctly declines atomic protection against a
same-UID swap-and-restore race between observations, privileged mount changes,
or runtime/kernel compromise. M4-AO03 is closed at contract scope.

## M4-AO04 — implementation and tests closed at boundary

The exact construction allowlist is the one new source plus the 13 reproduced
compiled-output deltas. The verification allowlist is one new focused test,
three existing focused tests, and the static verifier. It contains every output
that the in-memory compiler would change and no existing production TypeScript,
package manifest/script/export, profile, fixture, ordinary entry, input,
staging/result path, Expected value, or historical record.

The focused acceptance categories cover exact bytes and manifests, construction
inventory and delta, source/compiled mismatches, loading-form and closure drift,
all inbound reachability barriers, alias/replacement/metadata drift, complete
pre/post chain validation, child settlement, unknown settlement, early
stability, and import safety. Bounded disposable fixtures and fake process
boundaries remain the only permitted behavioral inputs.

M4-AO04 is closed as an implementation path/test boundary. It does not approve
implementation while M4-AO02 is open. The remediation must correct the expected
runtime-closure assertion within this existing allowlist and must not add a path
or weaken a negative test.

## M4-AO05 — evidence and gate separation closed

The contract and in-memory reproduction are contract/static evidence only. The
object remains absent and was neither imported nor executed. The review chose
no Expected revision, run ID, result root, container/image identity, activation
command, output, process wrapper, or one-shot gate. It did not access Docker or
retained M4 state, mutate any result, reinterpret historical evidence, or
promote profile-control, route, matrix, or presentation `Observed` values.

Construction and later tests cannot prove Node loaded the bytes, the identity
chain held around a real child, Docker ran, a capability was enforced, or a
result was produced. A later implementation review and a separately recorded
future execution-gate contract remain mandatory. M4-AO05 is closed.

## Exact blocked remediation

Exactly one Docker-free contract-only task may proceed under
[`prompts/m4-distinct-activation-object-contract-remediation.md`](../../prompts/m4-distinct-activation-object-contract-remediation.md).
It must:

1. preserve every proposed path, byte/hash, table row, manifest aggregate,
   inventory, compiler delta, identity rule, allowlist, and gate limitation;
2. define the source closure as 22 modules including `types.ts`;
3. define the executable JavaScript runtime import closure as the exact 21
   modules above, explicitly excluding the type-only `types` row;
4. retain all 22 JavaScript rows as compiler construction outputs and name
   `types.js` as construction-only rather than runtime-reachable; and
5. update focused closure assertions and create one fresh independent
   remediation re-review prompt without implementing or compiling the object.

No M4 source, test, static verifier, compiled output, package script/export,
Docker action, retained-state access, runtime identity, execution gate, result,
or `Observed` change belongs to that remediation.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, routed M4/frozen-research documents, prior contract/implementation reviews, and this review prompt | Read without Docker, retained M4 state, external network, credentials, Remote Git, or external communication. |
| Exact current status, changed/untracked path inventory, prior issue #45 diff/allowlist inspection, critical SHA-256 values, and sorted 16-path manifest | Reproduced the prior approved `d3c96ae9...` implementation aggregate and preserved all unrelated working-tree changes. |
| In-memory TypeScript `5.9.3` virtual-source compile and write callback | No compiler diagnostics; wrote nothing to disk; reproduced all 22 table rows, the exact activation bytes, 62 outputs, and 13-output delta. |
| Full repository-relative source/compiled/combined manifest calculation | Reproduced 2,582 / 5,232 / 7,814 bytes and all three contract hashes. |
| TypeScript and emitted-JavaScript syntax graphs | Reproduced the 22-module source closure, 21-module executable closure, three direct edges, absence of forbidden loading forms, and no current inbound distinct-entry edge. |
| Exact ordinary-entry/package-root hashes and repository source/script/manifest reference scan | Reproduced all five recorded ordinary hashes and no reference to the distinct basename outside documentation/prompts. |

An initial version of the in-memory review helper exited 1 because its Markdown
table parser was incorrect; the corrected read-only helper exited 0 and produced
the evidence above. This was a review-script error, not a repository compiler or
contract check failure.

One package-manifest enumeration command was accidentally broader than needed
and attempted to traverse repository result directories. It encountered
permission-denied entries and read no result-file content; it did not access the
fixed retained M4 state. That command is a process deviation and is not used as
review evidence. The later scoped `rg --files`/reference assertions excluded
results, staging snapshots, and dependencies.

Tests, typecheck, filesystem-emitting build, broad verification, formatting
write, staging, a production executor, Docker/container/runtime-socket command,
retained-state/result-content inspection, cleanup, retry, external network,
credential, host-home access, Remote Git, publication, deployment, and
third-party communication were not run. Standing authorization was not needed
because this review crossed no approval-gated runtime boundary.

## Decision and next task

M4-AO01, M4-AO03, M4-AO04, and M4-AO05 are closed at contract scope. M4-AO02
remains open because the contract conflates the exact 22-module TypeScript
source closure and 22-file JavaScript construction set with the independently
derived 21-module executable import closure. Implementation is not approved.

Next: perform the bounded Docker-free M4-AO02 contract-only remediation under
[`prompts/m4-distinct-activation-object-contract-remediation.md`](../../prompts/m4-distinct-activation-object-contract-remediation.md);
do not add or compile the object and do not define an execution gate.
