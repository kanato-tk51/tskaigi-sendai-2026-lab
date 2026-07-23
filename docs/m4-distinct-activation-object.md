# M4 distinct activation-object contract

Status: **activation object and execution-gate implementation independently
approved; exact occurrence exhausted and accepted only as Inconclusive; issue
#45 closed at that bounded classification**

This document defines the separately named activation-object boundary deferred
by the issue #45 exact filesystem-identity contract. Its contract approval did
not add or compile the object, change an entry or package script, authorize a
runtime command, choose a new runtime tuple, access Docker or retained state,
or establish runtime or `Observed` evidence. The later bounded implementation
recorded below adds only the dormant source, compiler construction, and
static/unit verification approved by that contract.

## Decision and boundary

The object is named the **M4 frozen-research profile-control activation
object**. It is a distinct tracked source and compiled module; it never replaces
the ordinary fail-closed entry.

| Role | Exact repository-relative logical path |
|---|---|
| Activation source | `containers/profile-control/src/frozen-research-profile-control-entry.ts` |
| Executable compiled object | `containers/profile-control/dist/frozen-research-profile-control-entry.js` |
| Declaration byproduct | `containers/profile-control/dist/frozen-research-profile-control-entry.d.ts` |

The source, compiled object, and declaration are absent at this contract
snapshot. A later implementation may create them only after a fresh independent
review approves this contract. Merely creating them does not authorize Node,
Docker, a production runner, or an execution gate to consume them.

The ordinary paths remain byte-for-byte unchanged:

- `containers/profile-control/src/orchestrator-entry.ts`, SHA-256
  `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f`;
- `containers/profile-control/dist/orchestrator-entry.js`, SHA-256
  `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4`;
  and
- `containers/profile-control/src/index.ts`, SHA-256
  `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4`.

The ordinary `m4:doctor`, `m4:build`, `m4:run:controls`, and
`m4:verify:evidence` scripts continue to invoke only the ordinary compiled
entry. No current or future package script in this task names the distinct
object.

## Exact source construction bytes

The complete source is the following 774 UTF-8 bytes, including LF line
endings and the final LF. Its SHA-256 is
`580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d`.

```ts
import process from "node:process";

import { ProfileControlError } from "./errors.js";
import { parseOrchestratorArguments } from "./orchestrator.js";
import {
  runFixedProductionControls,
  serializeCanonicalPairExecutionResult,
} from "./run-controls.js";

try {
  if (parseOrchestratorArguments(process.argv.slice(2)) !== "run-controls") {
    throw new Error("M4_CONTROL_OPERATION");
  }
  const result = await runFixedProductionControls();
  process.stdout.write(serializeCanonicalPairExecutionResult(result));
  process.exitCode = result.validity === "complete" ? 0 : 1;
} catch (error) {
  const code =
    error instanceof ProfileControlError
      ? error.code
      : "M4_CONTROL_EXECUTION_FAILED";
  process.stderr.write(`${code}\n`);
  process.exitCode = 1;
}
```

These are the already reviewed historical temporary-control bytes, moved to a
new logical path instead of replacing the ordinary entry. The source accepts
only the fixed parsed `run-controls` operation, delegates only to the fixed
production-control runner, emits only its canonical pair projection or a
sanitized error code, and contains no arbitrary image, command, argument,
mount, environment, path, network, cleanup target, or result input.

The exact interface is not an execution authorization. A later execution gate
must still choose a fresh Expected revision and runtime identities, prove the
complete gate boundary, and approve one exact command separately.

## Exact compiler and constructed bytes

The only approved constructor is the repository-pinned TypeScript `5.9.3`
compiler with `containers/profile-control/tsconfig.build.json`, invoked offline
and without a package script as:

```sh
node node_modules/typescript/bin/tsc --project containers/profile-control/tsconfig.build.json
```

The later implementation must first add the exact source bytes above, run this
compile-only command, and accept the output only when there are no diagnostics
and every constructed row below matches. It must not invoke `npm run m4:build`,
`npm run m4:run:controls`, the distinct object, Docker, or another production
entry. A build that changes any compiled path outside the exact delta allowlist
below is rejected and restored without treating the attempted output as an
accepted activation object.

The activation JavaScript is exactly 788 UTF-8 bytes with SHA-256
`34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7`.
The declaration is exactly `export {};` plus one LF: 11 bytes with SHA-256
`8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881`.

The syntax-derived TypeScript source closure has exactly 22 modules in the
authoritative table order below, including `types.ts` through type-only source
edges. The compiler constructs JavaScript and declaration outputs for all 22
source rows, so the table and construction manifests retain 22 JavaScript rows
and 22 declaration rows.

The emitted-JavaScript executable runtime import closure is instead exactly
these 21 modules, in table order:

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

`types.js` is the compiler-produced JavaScript construction counterpart of the
type-only `types.ts` source member. It has no runtime inbound edge from the
activation entry and is not a member of the executable runtime import closure.
Declaration rows are also construction byproducts, not runtime imports. The
table order is authoritative for the 22-source, 22-JavaScript-construction, and
22-declaration construction sets; the ordered executable set is the exact
21-row list above.

| Module basename | Source bytes / SHA-256 | JavaScript bytes / SHA-256 | Declaration bytes / SHA-256 |
|---|---|---|---|
| `canonical` | 2,203 / `4f635c6bb7ac6cbc6a9c3488028277e7eddac37061b80c4b848524dad0ba8699` | 2,009 / `bbe3f25a2a11177c393dbcb272258ebdd097fba230850c9a5a8c4679c33b3a62` | 462 / `c05481f834670411ca5bfe04ba1fabc028e4f06f80b23b7f1bd120777b0ccc93` |
| `completion` | 6,655 / `73e94cd1b65ae068ce742219a7e9e903c8a2564ea1193ad265ac90d4a98c6840` | 5,946 / `a8dcd3f5cc088de86e190e9d5ed6062eb8f9c030e3ebafb2a873150d3091d771` | 892 / `a31f726ee15aba4ab13e91641b413d374365c602adf890ae9bb87815beb1c8d0` |
| `constants` | 4,635 / `8441aadf55bcd15b4a207283c9723ae703df4c8aa3234282a12c224c2dd1fb0f` | 4,298 / `15e6447dcbbcecdef235f5004b1de21555eb55297190f6fb9205b0cb38a1c181` | 4,628 / `349bc96184b2bbc099260dbe563dfa13e4c2aa164a654cf49f9af0518c372ed7` |
| `control-host-backend` | 39,867 / `a37baa7dd651a1346c9f38b6116a38a7ddc0c4e33f83f4ceae3d804c6bfd646f` | 37,690 / `e4685e4fda539e35ef3bdfb984191fd6fbefc4ee3bab9fffc41635e610a51125` | 942 / `6c47c9ab43b57ad1ff673f6f4e4dead732408f458fa2afbcf08cb647a0ebef1f` |
| `definitions` | 7,776 / `e20c0bf8135d0db349a50525154181bc5c4b1cb2282b2f7933cabdb0c779d38e` | 7,451 / `00eb73c608968cbcf15c5ae0c9fad62aca44a6390411cadc89f0ae1762029def` | 916 / `461df2c274834f3406868d544069814a65555d55f81a8e1ed8573e9698928c2c` |
| `docker-formats` | 2,519 / `6f24020cdd1a54b9fa8abfbee665babf99fc3a0a0240f7892b5b924f7c945725` | 2,462 / `d4fe03deb175079f4b9b8c115833334e4ce33681cb41d918ec271a4f06f375b6` | 4,559 / `2875745d66b306a09954cd8277f73c5b8ddc6bfe8a13328c5f940e32f6a49d1b` |
| `docker-plan` | 13,008 / `5bc051512ba9f0a60f709b4b633a2eb105ec2c1c166cfb73301706158ef314a1` | 10,813 / `030bc5d603ddebf3320fb3212d45ee1320af1a0c126252566cbea3abb727ab13` | 3,313 / `5f4a2edcc08d2577610dd080ee78b1481760938adf523dffcafb1a330acfc42a` |
| `errors` | 369 / `d4e96236380e93154e8c9e1cb70680bb731fb67e28fbe9c0ba37594ca38de709` | 260 / `d6759eb698e8a06bebbf30ea2ec36fc9881dcd3a23af5bef4ba034e4f82a177a` | 261 / `23adfef21df4ed57fb15ba36f9ed09289cf3c75c00f3b97ab86612f46b574b52` |
| `evidence` | 5,741 / `2d562c1f988b2592d897af5f94d77d417f3c3e3e723ae8257ac9eda7600a7a96` | 5,419 / `be6e8bca77e54691b5619495a6f636634ceed05923f2ce0a72c84dc6ca146586` | 391 / `ece686d251e68a63e740d31b7ed9e20664c1bc63764f7d852c3c2027a30cf4bf` |
| `execution` | 20,725 / `4e893140d85351c45b1ac96afca89d95830fd3862c322a464731b7d087ebabde` | 17,918 / `3e178ab0293e575b0755f70274eba4248109f19a48b6781b1af6a7c4bf8354ac` | 2,364 / `dc85a74e27a8108f0946326bcec4e9a19f46d13e4819159d72e59e0025b167b9` |
| `filesystem-identity` | 25,227 / `1dad4648451daaf3681a1eb07a196f6c361513e75f63a0eff94ebe665a67abf1` | 22,909 / `a6692c54e71a4d3b54ed8f29f66b40cdc2a1eb8fc1d5f1660fe5c439c4453385` | 4,644 / `a987a326d7659aa49dc69b60b4c744912a141e1f6c6892641e2296a9263a6daa` |
| `frozen-research-profile-control-entry` | 774 / `580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d` | 788 / `34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7` | 11 / `8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881` |
| `image-input` | 3,117 / `3d62d6842d7b0aafde8cc42a647c31235860411a9c77acaaae8e60b4de7fe16c` | 2,946 / `280fc04ba2dd7900755b335a2f599791adb52012b65adbc499fbd92caf949380` | 319 / `47eef11d826490aa6fb7d472ab25efc0edaf847346f9a046688ea2c650b28432` |
| `inspect` | 8,888 / `9c24c147ba5d2ef03606c9be3af1d9e7cdcd6aa14de6259960e14c6310b5c1d8` | 8,403 / `a1304f9668c421c55f861f65486cb3a006aac870c0810cb648ed04dc5f15733e` | 466 / `7476ad3237a5e95d816b26ce5a5efed40c08c6c88118c670bba35418911f3f07` |
| `offline-build-process` | 1,780 / `e32177d3c8f1f6be31f37572aeaf8abf12da961527cb1a830dd2121d1c08639c` | 1,345 / `a0cf7c8d936ea96e328c1cd57b9cba315c9c2e9ac00144aeb15202198229d8ba` | 694 / `ff8a0df29777071b3e50750bd1c5383536b9dbc752f49168cb57fa56f9e181d2` |
| `orchestrator` | 755 / `fefc2af9c7f69428383eba03d8bb49b0caa51a5332043e8741db39352fb1faf6` | 547 / `a71204ff47db0c548f107af2714b270249b4109a570333d1a8478bfb421a6c6d` | 379 / `e707246ff2068215121040d0544aef3fa75ff581447fb47e0e4ee31eac43e25c` |
| `profile-input` | 1,873 / `a2d799a8d86bc82d4c64e767ffb289277ed9c391293711f69a0bd5ec53df2844` | 1,714 / `5471dab87a02f809263bc570d8362b52d19c579ef526eec59e5e725b4a7da50b` | 318 / `5429cb52fe983239d214e1d50748622f40748953661f24efed9f7d75775f96ad` |
| `run-controls` | 7,924 / `25a0fd3b204594271970ddbd7d644ee2c12d5dbd31ad9a906150f293e3f4f550` | 7,457 / `e53ec9ecf25c020a138aecd3ca4e5c1b6363e553591f1056c118daf88eeb020d` | 441 / `e027528b9396bcf5cfd790bfee355c67cb35c3292595c512cd0d18efc66d3408` |
| `safe-data` | 4,208 / `9f2816f356907c3280cc7fd3c20f3d4eb3e97f5db1dc1ddca0d10a70daef0c88` | 3,860 / `7ad600291ce3da4b7cc884e48e1c8ac7bb5ee2d13cd738df7ff8d6240271bdd5` | 934 / `1f4a5978637337d07b9ea79da6a9b7c1db69a8b09ba16f68e90c978a5b5cf0bd` |
| `staging` | 7,695 / `795fd1a75981439f3f70956bd383fa8cf85a3703634dc6eef58cfd698343c9e5` | 6,973 / `823efef60cdf17799755c0c589d13cbba1c74f688e368fa865670ae6e85350a0` | 1,028 / `5c218a4ec00455c7a5fa412ca28d5b56f42df642ab78700175b267de0ec33d04` |
| `types` | 9,581 / `9bed7d4a65033d9b120666c6c2848f03e75cf2a7ca9d4f1fb6f9f59050d4d3c3` | 11 / `8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881` | 9,768 / `e5485ee736d5b42ad81258a2f8e7a8dfb75d27d3ae2ec1ee757108142adc13cd` |
| `validation` | 14,486 / `5e8952f317b1a2b9555968df54c02a784ce581c1762b774ec677eb8139eb3404` | 13,563 / `25b24fd56adb78af26dc3ff490d5f6d9e4a4b53b962dc04e0a18ef3b7b3fd52f` | 457 / `1d34988ade527f386a35b854db608959f5dd6de3d6d09ac4d975089c6d035d8a` |

The construction manifest encoding is:

```text
logicalPath NUL decimalByteLength NUL lowercaseSha256 LF
```

It contains all 22 source rows in table order, followed by, for each module in
the same order, its JavaScript row and declaration row. The source manifest is
2,582 bytes with SHA-256
`b0bbbf397888a10b7b3309f46ae89211edff42face25286e91fc0400f00d97ae`.
The compiled manifest is 5,232 bytes with SHA-256
`968d70e317b784fbb2fe60522f3618d5fe807249ac3a1090f8093b462863c390`.
Their concatenation is 7,814 bytes with SHA-256
`b46f91822134d535be09e6e53119720f88633815cb2a909cb7e5bae752f80c43`.

Syntax analysis must find exactly the 22-module TypeScript source closure and
the 21-module emitted-JavaScript executable runtime import closure above.
Computed imports, dynamic imports, `require`, import-map aliases, package
subpath imports, a dependency on the offline-build/recovery entry, or another
compiled module are forbidden. All 22 JavaScript table rows remain required
construction outputs; construction membership does not imply runtime
reachability.

After construction, `src` contains exactly these 31 entries and no directory,
symlink, or other basename:

```text
canonical.ts
completion.ts
constants.ts
control-host-backend.ts
definitions.ts
docker-formats.ts
docker-plan.ts
doctor-host-backend.ts
doctor.ts
errors.ts
evidence.ts
execution.ts
filesystem-identity.ts
frozen-research-profile-control-entry.ts
image-input.ts
index.ts
inspect.ts
offline-build-host-backend.ts
offline-build-process.ts
offline-build-recovery-entry.ts
offline-build-recovery-host-backend.ts
offline-build-recovery.ts
offline-build.ts
orchestrator-entry.ts
orchestrator.ts
profile-input.ts
run-controls.ts
safe-data.ts
staging.ts
types.ts
validation.ts
```

The post-construction `dist` inventory is exactly the 62 one-link regular
files obtained by replacing `.ts` in each ordered source basename above with
`.js` and `.d.ts`; no map, cache, build-info, directory, symlink, or extra
output is accepted. The executable runtime import closure is exactly the
21-row set listed above. All 22 JavaScript rows, including construction-only
`types.js`, and all 22 declaration rows remain required constructed files, and
the complete `src` and `dist` inventories remain protected parent state.

Relative to the current tracked `dist` snapshot, the exact accepted compiler
delta is closed by this table. No other emitted byte may differ.

| Compiled logical path | State | Exact bytes | Exact SHA-256 |
|---|---|---:|---|
| `dist/types.d.ts` | replace | 9,768 | `e5485ee736d5b42ad81258a2f8e7a8dfb75d27d3ae2ec1ee757108142adc13cd` |
| `dist/filesystem-identity.js` | new | 22,909 | `a6692c54e71a4d3b54ed8f29f66b40cdc2a1eb8fc1d5f1660fe5c439c4453385` |
| `dist/filesystem-identity.d.ts` | new | 4,644 | `a987a326d7659aa49dc69b60b4c744912a141e1f6c6892641e2296a9263a6daa` |
| `dist/execution.js` | replace | 17,918 | `3e178ab0293e575b0755f70274eba4248109f19a48b6781b1af6a7c4bf8354ac` |
| `dist/execution.d.ts` | replace | 2,364 | `dc85a74e27a8108f0946326bcec4e9a19f46d13e4819159d72e59e0025b167b9` |
| `dist/control-host-backend.js` | replace | 37,690 | `e4685e4fda539e35ef3bdfb984191fd6fbefc4ee3bab9fffc41635e610a51125` |
| `dist/control-host-backend.d.ts` | replace | 942 | `6c47c9ab43b57ad1ff673f6f4e4dead732408f458fa2afbcf08cb647a0ebef1f` |
| `dist/offline-build-host-backend.js` | replace | 37,593 | `13d617a5ae1637e1a48723ffda962ab831e5737cb52bf6fb7ad84fe73b36d6c0` |
| `dist/offline-build-recovery-host-backend.js` | replace | 16,102 | `6abcb89d9bcfa24fa21d8ced0919e2c8f7cc058fe89475bd441b6fd910147cd3` |
| `dist/offline-build-recovery-host-backend.d.ts` | replace | 2,938 | `194b13f397c87d6add1399e1137fe9809b83eb9f757ca691576ef5277b735c49` |
| `dist/run-controls.js` | replace | 7,457 | `e53ec9ecf25c020a138aecd3ca4e5c1b6363e553591f1056c118daf88eeb020d` |
| `dist/frozen-research-profile-control-entry.js` | new | 788 | `34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7` |
| `dist/frozen-research-profile-control-entry.d.ts` | new | 11 | `8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881` |

## Non-export and non-script reachability

The distinct object is dormant repository data. The later implementation must
prove all of the following:

1. `src/index.ts`, `dist/index.js`, and `dist/index.d.ts` neither import nor
   export the distinct entry, `runFixedProductionControls`, or the production
   control host backend.
2. Ordinary `orchestrator.ts`, `orchestrator-entry.ts`, their compiled outputs,
   and `offline-build-recovery-entry.ts` neither import nor invoke the distinct
   entry.
3. Root `package.json`, every workspace package manifest, and every repository
   script contains no command or reference to the distinct source or compiled
   basename. Existing M4 scripts remain byte-for-byte unchanged.
4. No source file imports the distinct entry. Its only permitted inbound
   references are the exact focused tests and static verifier; documentation
   references are not runtime edges.
5. Importing the package root, ordinary entry dependencies, production runner,
   host backend, or identity helper performs no activation-object construction,
   compile, child spawn, filesystem mutation, timer, or Docker work.

Directly naming the compiled path with Node would be a later activation action,
not ordinary reachability. This contract does not authorize or record such a
command.

## Exact filesystem-identity protocol

The later implementation establishes construction/static evidence. A still
later execution gate must adopt the following exact identity protocol without
weakening the already reviewed issue #45 private record:

- Capture and retain the canonical repository root, `containers`,
  `profile-control`, `src`, and `dist` directories plus their exact sorted
  inventories before any activation child exists.
- Capture every one of the 22 source files, 22 JavaScript files, and 22
  declaration files in the table through `O_NOFOLLOW` held descriptors and
  BigInt stats. Every object is a distinct one-link regular file; source,
  JavaScript, and declaration for one module must not share an inode.
- Require each row's exact bounded bytes and SHA-256. Capture and retain its
  private device, inode, type, `uid`, `gid`, complete mode including special
  bits, link count, size, `mtimeNs`, and `ctimeNs`. The three newly constructed
  objects use exact peer relations: the activation source's private `uid`,
  `gid`, and complete mode equal `src/orchestrator-entry.ts`; the JavaScript
  values equal `dist/orchestrator-entry.js`; and the declaration values equal
  `dist/orchestrator-entry.d.ts`. No `chown`, `chmod`, hardlink, symlink,
  rename, or normalization is allowed.
- Validate the complete held source and compiled chains twice during capability
  preflight, immediately before the future path-only Node spawn, after that
  child emits `close`, and before any result acceptance or cleanup. Reads use
  held descriptors. Reopening by path does not inherit acceptance.
- The child is unsettled until `close`. Timeout, output limit, requested signal,
  process error, or `exit` alone cannot release a handle, read evidence,
  serialize a stable result, clean state, or authorize another command.
- A missing, extra, reordered, aliased, replaced, renamed, in-place mutated,
  ownership/mode/time-drifted, or post-use-drifted row is terminal
  Inconclusive. The gate must not compile, repair, restore, retry, or select a
  replacement object after drift.
- Raw path, owner, device/inode, timestamp, and private manifest detail stays
  private. A public result may report only the fixed logical activation role,
  reviewed byte hash/length, and `identityStable: true` after child settlement
  and every post-use check.

The activation child remains a path-only external consumer. Held descriptors
and pre/use/post comparisons detect stable-boundary drift but do not provide
atomic race resistance against a same-UID host process that swaps and restores
paths entirely between observations. If the existing cooperative-host boundary
or stable Linux BigInt identity semantics cannot be established, activation is
unsupported before the first external command.

This protocol defines a required input for a future gate. It does not define
that gate, choose its process wrapper, or authorize the object to execute.

## Exact later implementation allowlist

If the fresh independent contract review is positive, exactly one Docker-free
static/unit implementation may change only these construction paths:

- new `containers/profile-control/src/frozen-research-profile-control-entry.ts`;
- new `containers/profile-control/dist/frozen-research-profile-control-entry.js`;
- new `containers/profile-control/dist/frozen-research-profile-control-entry.d.ts`;
- new `containers/profile-control/dist/filesystem-identity.js`;
- new `containers/profile-control/dist/filesystem-identity.d.ts`;
- `containers/profile-control/dist/types.d.ts`;
- `containers/profile-control/dist/execution.js`;
- `containers/profile-control/dist/execution.d.ts`;
- `containers/profile-control/dist/control-host-backend.js`;
- `containers/profile-control/dist/control-host-backend.d.ts`;
- `containers/profile-control/dist/offline-build-host-backend.js`;
- `containers/profile-control/dist/offline-build-recovery-host-backend.js`;
- `containers/profile-control/dist/offline-build-recovery-host-backend.d.ts`;
  and
- `containers/profile-control/dist/run-controls.js`.

The three offline-build/recovery compiled rows are compile-conformance
byproducts of the already approved issue #45 source and are not part of the
21-module executable control-activation runtime import closure. Every other
emitted file must already equal the table or its current independently reviewed
output and must remain unchanged.

Only these verification paths may also change:

- new
  `containers/profile-control/test/frozen-research-profile-control-entry.test.ts`;
- `containers/profile-control/test/filesystem-identity.test.ts`;
- `containers/profile-control/test/import-safety.test.ts`;
- `containers/profile-control/test/static-safety.test.ts`; and
- `containers/profile-control/scripts/verify-static.mjs`.

No existing TypeScript production source, package/root manifest, package
script, profile, fixture, ordinary entry, orchestrator, image input, result,
staging, Expected value, or historical record belongs to that implementation.

## Focused static/unit acceptance

The later implementation must add deterministic Docker-free coverage for:

- exact source/JavaScript/declaration bytes, all three manifest aggregates,
  the exact compiler delta, and distinct equality with the ordered 22-source,
  22-JavaScript-construction, and 21-executable-import sets;
- rejection of a missing, extra, or reordered member in any contracted set, a
  source/compiled hash mismatch, line-ending or final-LF drift, stale compiled
  first-identity output, computed/dynamic import, or unexpected runtime edge;
- `types.ts` present through type-only source reachability, `types.js` present
  as a construction-only output, and rejection if `types.js` becomes
  runtime-reachable or any expected executable edge disappears;
- package-root export, package/workspace script, ordinary-entry import, or any
  other inbound reference to the distinct basename;
- one-link/type/owner/full-mode relations and rejection of a symlink, hardlink,
  same-byte replacement, parent replacement, in-place write, special-mode
  drift, and source/compiled inode alias in bounded disposable fixtures;
- pre-spawn and post-`close` complete-chain validation, no acceptance on
  `exit` without `close`, handle retention under unknown settlement, and no
  early `identityStable: true`; and
- import safety proving no compile, child spawn, timer, filesystem mutation,
  Docker access, or activation during ordinary module imports.

Tests may use only repository-owned static inputs and bounded disposable unit
fixtures with fake process boundaries. They must not invoke the distinct entry,
production runner, Docker, a runtime socket, a probe/lifecycle fixture, retained
state, a result root, or a production cleanup.

The exact later verification commands are the compile-only command above,
`npm run m4:typecheck`, `npm run m4:static`, `npm run m4:test`,
`npm run m4:verify`, a compiled import-safety assertion that does not import the
entry, focused formatting, and `git diff --check`. `npm run m4:build` and
`npm run m4:run:controls` remain prohibited.

## Evidence classification and remaining gates

- This document and its review are contract evidence.
- In-memory compiler reproduction, source assertions, and later tests are
  static/unit evidence only.
- Constructed source and compiled bytes do not establish that Node loaded
  them, the identity protocol held around a child, Docker ran, a control
  capability was enforced, or a result was produced.
- Historical build, recovery, control, selected-profile, and presentation
  results remain immutable and are not reclassified.
- No fresh Expected revision, run ID, result root, container name, image
  identity, activation command, output hash, or one-shot execution gate is
  selected by this contract.

After the implementation and a fresh independent implementation review, a
separately recorded future execution-gate contract would still be required.
That later task must choose fresh identities and an exact one-shot command and
must independently bind this activation-object identity protocol before any
standing authorization could apply.

## Current decision and next task

M4-AO02 contract remediation update (2026-07-20): the construction contract is
unchanged at 22 TypeScript source rows, 22 JavaScript outputs, 22 declaration
outputs, the exact 31-source/62-output inventories, three manifest aggregates,
and 13-output compiler delta. The contract now separately binds the exact
21-module emitted-JavaScript executable runtime import closure and identifies
`types.js` as the construction-only counterpart of the type-only `types.ts`
source member. Focused acceptance now rejects drift in any of the three sets or
their runtime edges. M4-AO01, M4-AO03, M4-AO04, and M4-AO05 remain closed at
contract scope; M4-AO02 is remediated in the contract and awaits fresh
independent closure review.

Fresh M4-AO02 remediation re-review update (2026-07-20): the independent
Docker-free read-only review in
[`reviews/m4-distinct-activation-object-contract-remediation.md`](reviews/m4-distinct-activation-object-contract-remediation.md)
reproduces the exact 22-module TypeScript source closure, 22-JavaScript and
22-declaration construction sets, and 21-module emitted-JavaScript executable
import closure. `types.ts` is reachable only through type-only source edges;
construction-only `types.js` has no runtime inbound edge. All construction
bytes, manifests, inventories, the 13-output delta, identity/settlement rules,
allowlists, and evidence/gate separation remain exact. The review closes
M4-AO02 with no new finding, so M4-AO01 through M4-AO05 are now closed at
contract scope.

At that review snapshot, the activation object remained absent. No source,
test, static verifier, compiled output, package script/export, Docker action,
retained state, runtime identity/evidence, execution gate, result, or
`Observed` value had been added, executed, accessed, or changed.

Bounded implementation update (2026-07-20): the exact 774-byte dormant source
is now present, and the pinned TypeScript `5.9.3` compile-only command
constructed the exact 788-byte JavaScript and 11-byte declaration with no
diagnostics. Static/unit assertions reproduce all 22 source, 22 JavaScript
construction, 22 declaration construction, and 21 executable-import members;
the 31-source/62-output inventories; the three manifests; every syntax edge;
and the four-new/nine-replaced compiler delta. Focused identity coverage binds
the three new objects to distinct one-link regular-file peer identities, and
the existing negative suites preserve replacement, mode, owner, descriptor,
copy, child-`close`, and unknown-settlement boundaries. Ordinary source and
compiled imports exclude the distinct entry, and root/workspace scripts,
exports, profiles, ordinary entries, and production TypeScript sources remain
unchanged.

`npm run m4:verify` passed typecheck, the Docker-free static verifier, 23 test
files, and all 252 tests. A separate compiled import-safety run passed without
importing the distinct entry. This is static/unit construction evidence only:
the object was not imported or executed, and Docker, runtime sockets, retained
state, runtime identities/evidence, every historical result, every execution
gate, and `Observed` remain unchanged and frozen. The exact implementation and
review prompts are saved under `prompts/`.

Fresh implementation review update (2026-07-20): the independent Docker-free
read-only review in
[`reviews/m4-distinct-activation-object-implementation.md`](reviews/m4-distinct-activation-object-implementation.md)
reproduces the exact construction, 31-source/62-output inventories, three
construction manifests, 22-source/22-JavaScript/22-declaration construction
sets, 21-module executable closure, both syntax-edge manifests, dormant
reachability, private peer identities, and replacement/settlement negative
boundary. `npm run m4:verify` again passed 23 test files and all 252 tests, and
the corrected compiled import-safety assertion passed without importing the
distinct entry. M4-AO01 through M4-AO05 are closed at implementation scope with
no finding.

This approval is static/unit only. The object was not imported or executed,
and Docker, retained state, runtime evidence, every historical result, and
`Observed` remain unchanged. It permits only one later Docker-free
execution-gate contract task; that task may define fresh identities, the exact
process/output/identity boundary, and a fresh gate-review prompt but may not
execute or approve an activation command.

Execution-gate contract update (2026-07-20): the Docker-free contract in
[`m4-distinct-activation-object-execution-gate.md`](m4-distinct-activation-object-execution-gate.md)
fixes a fresh gate Expected revision, exact `20260720-02` run/root/container
identities, the two-literal constants/compiler delta, unchanged canonical
profile and activation bytes, an exact separate path-only wrapper boundary,
complete pre/close/post identity ownership, canonical bounded result
classification, one candidate argument-free command, no-retry retention, and a
bounded later implementation allowlist. The fresh independent review prompt is
saved at
[`prompts/reviews/m4-distinct-activation-object-execution-gate-review.md`](../prompts/reviews/m4-distinct-activation-object-execution-gate-review.md).

This is contract evidence only. No wrapper/run-ID/package implementation,
filesystem-emitting compile, activation import/execution, Docker access,
retained/result-state access, command approval, runtime evidence,
historical-result change, or `Observed` promotion occurred.

Fresh execution-gate contract-review update (2026-07-20): the independent
Docker-free review in
[`reviews/m4-distinct-activation-object-execution-gate.md`](reviews/m4-distinct-activation-object-execution-gate.md)
reproduces the fresh generation and all activation/constants/profile
construction values. It closes M4-AG01 and M4-AG06 but keeps M4-AG02 through
M4-AG05 open on the wrapper executable-closure, synchronous no-child
spawn/signal settlement, and monotonic failure-precedence findings M4-AGR01
through M4-AGR03. The independently approved dormant activation object and
M4-AO01 through M4-AO05 remain unchanged.

No wrapper, run-ID rebind, package script, object import/execution, Docker
action, result/retained-state access, command approval, runtime evidence, or
`Observed` promotion occurred.

Execution-gate M4-AGR01 through M4-AGR03 contract-remediation update
(2026-07-20): the remediated gate now fixes the wrapper's exact ordered seven
built-in imports, empty repository-local direct edges, singleton executable
closure, and complete held edge rejection. It separately closes synchronous
no-child spawn, asynchronous error, TERM/KILL delivery, late-`close`,
descriptor-release, and untouched-root disposition, and makes the first
chronological wrapper failure permanently disqualify later valid child output.
The fresh independent Docker-free remediation re-review prompt is saved at
[`prompts/reviews/m4-distinct-activation-object-execution-gate-remediation-review.md`](../prompts/reviews/m4-distinct-activation-object-execution-gate-remediation-review.md).

This remains contract evidence only. No wrapper/run-ID/package implementation,
filesystem-emitting compile, activation import/execution, Docker or
retained/result-state access, command approval/execution, historical evidence
change, standing-authorization use, or `Observed` promotion occurred.

Next: perform the fresh independent Docker-free read-only execution-gate
remediation re-review under the saved prompt above.

Fresh execution-gate remediation re-review update (2026-07-20): the
independent Docker-free read-only review in
[`reviews/m4-distinct-activation-object-execution-gate-remediation.md`](reviews/m4-distinct-activation-object-execution-gate-remediation.md)
closes M4-AGR01 through M4-AGR03 with no new finding. It reproduces the exact
seven-built-in/zero-local wrapper edge sets and singleton closures, complete
synchronous no-child/asynchronous error/signal/late-`close` settlement, and
write-once failure precedence that disqualifies every later valid child
result. M4-AG01 through M4-AG06 are closed at contract scope.

No wrapper/run-ID/package implementation, filesystem-emitting compile,
activation import/execution, Docker or retained/result-state access, command
approval/execution, historical-evidence change, standing-authorization use,
or `Observed` promotion occurred.

Next: perform the exact bounded Docker-free wrapper/run-ID/package
implementation and focused static/unit verification, then obtain a fresh
independent implementation/gate review before any command approval.

Execution-gate bounded implementation update (2026-07-20): the exact
`20260720-02` run-ID delta, self-contained seven-built-in/zero-local wrapper,
compiler outputs, 32/64 inventories, package-only candidate edge, profile
README handoffs, and focused process/output/identity tests are now constructed.
`npm run m4:verify` passed 24 test files and all 265 tests. The activation
object's exact 22/22/22 construction and 21-module executable closure remain
unchanged and path-only; neither the wrapper nor activation entry was invoked
by the production command. Docker, retained/result state, runtime evidence,
command approval/execution, historical evidence, and `Observed` remain frozen.

Next: perform the fresh independent Docker-free implementation/gate review
under the saved review prompt before any candidate command approval.

Fresh execution-gate implementation/gate review update (2026-07-20): the
independent Docker-free review in
[`reviews/m4-distinct-activation-object-execution-gate-implementation.md`](reviews/m4-distinct-activation-object-execution-gate-implementation.md)
keeps M4-AO01 through M4-AO05 closed at the dormant activation-object
implementation boundary and reproduces the unchanged 22/22/22 construction
and 21-module executable closure. The later wrapper gate is blocked on
M4-AGI01/M4-AGI02 because its production lease does not authenticate the full
reviewed wrapper objects and its focused negative matrix is incomplete.

No activation or wrapper production entry, candidate command, Docker,
retained/result state, standing authorization, historical evidence, or
`Observed` value was executed, accessed, or changed.

Next: remediate only M4-AGI01 and M4-AGI02 under
[`prompts/m4-distinct-activation-object-execution-gate-implementation-remediation.md`](../prompts/m4-distinct-activation-object-execution-gate-implementation-remediation.md).

Execution-gate M4-AGI01/M4-AGI02 remediation and re-review update
(2026-07-20): the complete wrapper-object trust input is now an external,
non-circular final `npm run m4:static` occurrence immediately adjacent to any
candidate execution; production descriptor capture proves only later
stability. Focused coverage closes the full source/emitted edge, no-child,
returned-child, signal, late-result, exact-prefix/key, private-suppression,
post-use, release, and exact-root-source matrix. The fresh independent review
in
[`reviews/m4-distinct-activation-object-execution-gate-implementation-remediation.md`](reviews/m4-distinct-activation-object-execution-gate-implementation-remediation.md)
closes M4-AGI01/M4-AGI02 and M4-AG01 through M4-AG06 at implementation scope;
`npm run m4:verify` passed 24 test files and all 292 tests.

Only one later argument-free candidate occurrence is approved after a fresh
worker reproduces every reviewed identity and both exact new-root absence facts,
then runs the final static preflight with no intervening command or write. Any
failure exhausts the generation and permits no retry. The review did not run
either production entry, Docker, or the command and did not use standing
authorization or promote `Observed`.

Next: execute the exact approved one-occurrence activation gate in a fresh
worker, then stop without retry for a separate result review.

Exact one-occurrence activation update (2026-07-20): the reviewed identities
and only the two exact new-root absence facts reproduced, and the final
immediately adjacent `npm run m4:static` trust preflight exited 0. The worker
then used the `continue-repository-work` standing authorization, not a separate
human review, for exactly one argument-free
`npm run --silent m4:execute:frozen-research` occurrence. It exited 70 with no
candidate stdout or stderr and was not retried. No cleanup, repair, alternate
tuple, post-attempt Docker command, result/retained-state access,
classification, historical-evidence change, or `Observed` promotion occurred.

Next: define the exact fresh Docker-free result-review prompt for the exhausted
`20260720-02` activation generation without accessing either result root.

Exhausted-generation result-review update (2026-07-20): the fresh independent
Docker-free review in
[`reviews/m4-distinct-activation-object-result.md`](reviews/m4-distinct-activation-object-result.md)
reproduces the approved repository construction and records both exact
`20260720-02` result roots as absent. Exit `70`, zero-byte stdout/stderr, and
two absent roots contain no canonical activation result or failure code and do
not establish child settlement, Docker behavior, profile-control evidence, or
`Observed`. The outcome is accepted only as one immutable exhausted
Inconclusive attempt. Issue #45 closes at that reviewed cooperative-host
boundary; no retry, repair, cleanup, alternate generation, or promotion is
authorized.

Next: begin issue #46 with one Docker-free public-input-hardening contract and
fresh independent contract-review prompt; do not implement the hardening in
that contract task.
