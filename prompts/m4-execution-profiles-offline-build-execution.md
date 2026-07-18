# Goal

Fresh independent reviewで承認されたM4 one-time offline-build execution gateだけを使い、
review済みaccepted base/staging snapshotとproduction offline-build backendで固定imageを
ちょうど1回buildする。Canonical sanitized build resultだけを記録し、直後に通常の
`M4_EXECUTION_NOT_APPROVED` entry/source/compiled outputへ戻す。Controlは実行せず、
observed built-image digestのprofile bindingは後続taskへ分離する。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/reviews/m4-execution-profiles-exact-input-contract.md`
- `docs/reviews/m4-execution-profiles-exact-input-backend-remediation.md`
- `docs/reviews/m4-execution-profiles-offline-build-backend.md`
- `docs/reviews/m4-execution-profiles-offline-build-result-remediation.md`
- `docs/reviews/m4-execution-profiles-offline-build-execution-gate.md`
- `docs/reviews/m4-execution-profiles-runtime-template-compatibility.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-exact-input-contract.md`
- `prompts/m4-execution-profiles-offline-build-backend.md`
- `prompts/m4-execution-profiles-offline-build-result-remediation.md`
- このprompt

# Scope

- reviewed source snapshotとcritical file SHA-256の実行前再検証
- fixed run ID `m4-offline-build-20260718-01`と、そのrepository-owned logical layout
  `results/runs/m4-profile-controls/m4-offline-build-20260718-01/`
- fixed staged image tag
  `tskaigi-m4-profile-control:staged-m4-offline-build-20260718-01`
- ordinary `orchestrator-entry.ts`を下記のreview済みtemporary activation bytesへ一時的に
  exact replacementし、activation hashとtypecheckを再検証すること
- standing authorizationを使ったexact command `npm run --silent m4:build`のちょうど1回の実行
- fixed `/usr/bin/docker`、credential-empty disposable `DOCKER_CONFIG`、no inherited
  environment、`shell: false`によるruntime version、offline build、built-image ID inspect
- canonical `lab-profile-offline-build-result/v1`だけの記録
- success/failureにかかわらないordinary entry source/compiled outputの即時復元とpost-run検証
- execution resultとremaining limitationをM4 status/review handoffへ最小限記録すること

# Out of scope

- gate reviewが未作成、blocked、またはsnapshot hash不一致の状態でのDocker access
- doctor、pull、login、create、start、run、control、evidence verification、image removal
- external network、registry、credential、host environment列挙、runtime socket直接access、
  experiment containerへのsocket mount/forward
- arbitrary executable、argv、cwd、path、environment、image、run ID、Docker option
- accepted input、fixed staging bytes、command plan、Expected contract、ADR-0001の変更
- built-image digestの推測、`profile.json`作成、profile binding、runtime enforcement、
  profile-control Observed、experiment-matrix route Observed
- host lifecycle、M1/M2/M3、M5以降、remote Git、commit、publication、external communication

# Constraints

## Required approved snapshot

実行前に、gate reviewが**APPROVED**であることと、次のhashが完全一致することを確認する。
1つでも不一致ならtemporary activationを行わず、fresh review/remediationへ戻す。

| Target | Required SHA-256 |
|---|---|
| Sorted manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, `profiles/constrained/**` | `231cda862163c050b31f4b15b962c24555d0e67fb5c0b30b40e0a60f43ac399a` |
| `containers/profile-control/image-input.json` | `27700a64c4bf4211f21ea5efa534601232f5fa7aea6ef70f306fbb5ba61da7e9` |
| `containers/profile-control/src/constants.ts` | `6c4f2e6177cc44fa6e0f9dd47f11709537d85adc88f87b2c0e40abac949fb93e` |
| `containers/profile-control/src/image-input.ts` | `3d62d6842d7b0aafde8cc42a647c31235860411a9c77acaaae8e60b4de7fe16c` |
| `containers/profile-control/src/staging.ts` | `795fd1a75981439f3f70956bd383fa8cf85a3703634dc6eef58cfd698343c9e5` |
| `containers/profile-control/src/docker-plan.ts` | `5bc051512ba9f0a60f709b4b633a2eb105ec2c1c166cfb73301706158ef314a1` |
| `containers/profile-control/src/offline-build.ts` | `490ba07e2f10e40d6fbf731e538948e2d21482df6853065536c1a2680428096f` |
| `containers/profile-control/src/offline-build-process.ts` | `e32177d3c8f1f6be31f37572aeaf8abf12da961527cb1a830dd2121d1c08639c` |
| `containers/profile-control/src/offline-build-host-backend.ts` | `e4aee00302148ccc75b7b7a2b642bb90f1a1dc01db9f6a3628f7c57281ccf7a2` |
| ordinary `containers/profile-control/src/orchestrator.ts` | `fefc2af9c7f69428383eba03d8bb49b0caa51a5332043e8741db39352fb1faf6` |
| ordinary `containers/profile-control/src/orchestrator-entry.ts` | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| `containers/profile-control/src/index.ts` | `00533c9b50f26bb7a33d7771af82ea9c2adf3c182ababacb1eb360d240dda5d4` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |

固定4 staging filesは347 / 29 / 9,159 / 152 bytes、ordered aggregate inputは388 bytes、
aggregateは`sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03`
でなければならない。`npm run m4:verify`もtemporary activation前に成功しなければならない。

Run rootは実行前に存在してはならない。Fixed run ID/tagはこのgateだけに一回使用し、
再実行、別run ID、別tagへの読み替えをしない。

## Exact temporary activation bytes

Ordinary entryを次のsource全体へexact replacementする。このsourceのSHA-256は
`34ad3097655ab71ed3673ba1a18e568978a393cc35f8bba3d544ae6965b62622`である。
Replacement後にhashを再計算し、`npm run m4:typecheck`を実行する。どちらかが不一致または
failureならbuild commandへ進まない。

```ts
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  FIXED_BASE_IMAGE_DIGEST,
  FIXED_STAGING_DIGEST,
  FIXED_STAGING_FILES,
  OFFLINE_BUILD_RESULT_SCHEMA_VERSION,
} from "./constants.js";
import {
  createFixedRuntimeLayout,
  createImageBuildPlan,
} from "./docker-plan.js";
import { validateVersionedImageInput } from "./image-input.js";
import { createFixedOfflineBuildHostBackend } from "./offline-build-host-backend.js";
import {
  createFixedOfflineBuildInput,
  executeFixedOfflineBuild,
  serializeCanonicalOfflineBuildResult,
  validateOfflineBuildResult,
  type OfflineBuildResult,
} from "./offline-build.js";
import { parseOrchestratorArguments } from "./orchestrator.js";
import {
  createAcceptedImageStagingSnapshot,
  prepareStagingInput,
} from "./staging.js";

const FIXED_OFFLINE_BUILD_RUN_ID = "m4-offline-build-20260718-01";

async function runOneFixedOfflineBuild(): Promise<OfflineBuildResult> {
  if (parseOrchestratorArguments(process.argv.slice(2)) !== "build") {
    throw new Error("M4_OFFLINE_BUILD_OPERATION");
  }
  const repositoryRoot = await realpath(
    fileURLToPath(new URL("../../../", import.meta.url)),
  );
  const controlRoot = path.join(
    repositoryRoot,
    "containers",
    "profile-control",
  );
  const imageInput = validateVersionedImageInput(
    JSON.parse(
      await readFile(path.join(controlRoot, "image-input.json"), "utf8"),
    ),
  );
  const preparedStaging = prepareStagingInput(
    await Promise.all(
      FIXED_STAGING_FILES.map(async (logicalPath) => ({
        logicalPath,
        bytes: Uint8Array.from(
          await readFile(path.join(controlRoot, logicalPath)),
        ),
      })),
    ),
  );
  const acceptedSnapshot = createAcceptedImageStagingSnapshot({
    imageInput,
    preparedStaging,
  });
  const layout = createFixedRuntimeLayout(
    repositoryRoot,
    FIXED_OFFLINE_BUILD_RUN_ID,
    "permissive",
  );
  const imageBuildPlan = createImageBuildPlan({
    acceptedSnapshot,
    layout,
  });
  const backend = await createFixedOfflineBuildHostBackend({
    acceptedSnapshot,
    imageBuildPlan,
    layout,
  });
  return await executeFixedOfflineBuild(
    createFixedOfflineBuildInput({
      acceptedSnapshot,
      imageBuildPlan,
      layout,
      backend,
    }),
  );
}

let result: OfflineBuildResult;
try {
  result = await runOneFixedOfflineBuild();
} catch {
  result = validateOfflineBuildResult({
    schemaVersion: OFFLINE_BUILD_RESULT_SCHEMA_VERSION,
    validity: "inconclusive",
    primaryFailure: "STAGING_FAILURE",
    completedSteps: [],
    baseImageDigest: FIXED_BASE_IMAGE_DIGEST,
    stagingDigest: FIXED_STAGING_DIGEST,
    dockerClientVersion: null,
    dockerServerVersion: null,
    builtImageDigest: null,
  });
}
process.stdout.write(serializeCanonicalOfflineBuildResult(result));
process.exitCode = result.validity === "complete" ? 0 : 1;
```

## Exact execution and side-effect boundary

`continue-repository-work` standing authorizationを、このreview済みgateのexact actionに使用する。
これは別のhuman reviewが行われたことを意味しない。Activation/typecheck後、次をちょうど1回だけ
実行する。

```sh
npm run --silent m4:build
```

このcommandが許可するhost runtime side effectは、固定CLIによる次のordered 3 commandだけである。

1. exact canonical client/server `29.6.1`の`version`
2. local `node@sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`
   からの`--network none --pull=false` buildとfixed staged tagの作成
3. そのfixed staged tagのcanonical image ID inspect

Runtime socketは固定CLIがhost上で間接利用できるが、repository codeが直接openせず、containerへ
mount/forwardしない。Build stdout/stderr/raw errorは保持せず、stdoutとして受理するのはcanonical
sanitized result 1 object + final LFだけである。Resultが`inconclusive`でも同じgateで再実行しない。

Success時のfixed staged image tagは後続profile-binding gateのinputとしてlocal runtimeに残す。
Inspect failure時にもtagが残り得る。Gateはimage cleanup commandを追加・実行しない。Run-owned
staging/config directoryはreview済みbackend cleanupだけが削除し、cleanup failure時は置換や強制削除を
せずinconclusiveとして記録する。

## Mandatory restoration

Commandのexit statusやresultにかかわらず、次のordinary entry source全体へ即時復元する。

```ts
import process from "node:process";

import { ProfileControlError } from "./errors.js";
import { runApprovedOrchestrator } from "./orchestrator.js";

try {
  await runApprovedOrchestrator(process.argv.slice(2));
} catch (error) {
  const code =
    error instanceof ProfileControlError
      ? error.code
      : "M4_EXECUTION_NOT_APPROVED";
  process.stderr.write(`${code}\n`);
  process.exitCode = 1;
}
```

復元source hashは
`73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f`である。
その後`./node_modules/.bin/tsc --project containers/profile-control/tsconfig.build.json`を実行して
ordinary compiled outputへ戻し、`dist/orchestrator-entry.js` hash
`02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4`も確認する。
Source/compiled outputの復元確認前にstatus更新以外の後続taskへ進まない。

# Deliverables

- 事前hash、run-root absence、pre-activation verificationの結果
- standing authorizationを使用したexact command 1回のexit statusとcanonical sanitized result
- ordinary source/compiled outputの復元hashとpost-restoration verification
- `docs/reviews/m4-execution-profiles-offline-build-execution-gate.md`へのexecution follow-up
- M4/exact-input/milestone/architecture status metadataの最小更新
- completeならobserved built-image digestとfixed tagを次のprofile-binding contract taskへ渡すhandoff
- inconclusiveならcompleted steps、primary failure、残存tag/run-owned stateの有無を推測せず記録するhandoff

# Verification

Temporary activation前:

```sh
npm run m4:verify
git diff --check
git status --short
```

Temporary activation中は`npm run m4:typecheck`とactivation source hashだけを確認し、
`npm run --silent m4:build`をちょうど1回実行する。`m4:static`はordinary fail-closed sourceを
要求するためactivation中には実行しない。

Ordinary source/compiled output復元後:

```sh
npm run m4:verify
npm run check
git diff --check
git status --short
```

`npm run m4:doctor`、`npm run m4:run:controls`、`npm run m4:verify:evidence`、
他のDocker/container commandは実行しない。

# Completion report

- Changed files
- Gate review decision、preflight hashes、exact run ID/tag/plan
- Exact build commandの実行回数、exit status、canonical sanitized result
- Source/compiled output restoration hashes、commands/test counts
- 残ったfixed image tagまたはowned run stateとcleanup limitation
- built image/profile binding、controls、runtime enforcement、Observedを実施しなかったこと
- Dockerは固定host CLI経由だけで、external network、credential、host home、direct runtime socket、
  containerへのsocket forwarding、host lifecycle、remote Git、publicationを使用していないこと
