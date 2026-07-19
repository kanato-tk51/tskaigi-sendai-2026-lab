# Goal

M4 の `offline-build` で承認済み `builtImageDigest` と固定 `profile pair` を使って
`npm run --silent m4:run:controls` を一回限定で実行し、host inspection と
control evidence の境界を固定したまま runtime enforcement を取得する。
`run:controls` の結果は adapter/profile ルートの Observed に自動昇格せず、runtime
enforcement の検証だけに使う。

# Read first

- root `AGENTS.md`
- `docs/index.md`
- `docs/milestones.md` の M4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/m4-restart-issue-board.md`
- `docs/reviews/m4-execution-profiles-offline-build-recovery-gate.md`
- `docs/reviews/m4-execution-profiles-run-controls-gate.md`
- `docs/reviews/m4-execution-profiles-run-controls-remediation.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-run-controls-remediation.md`

# Scope

- approved recovery resultのbuilt-image digest
  `sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`
  とcanonical profile bytesを固定 sourceとして再検証
- permissive run IDを`m4-profile-control-p-20260720-01`、constrained run IDを
  `m4-profile-control-c-20260720-01`へ固定し、derived run roots/container namesを変更しない
- existing-image/no-rebuild executorだけを使い、step順序を
  `permissive:create/inspect/start/transfer/remove` →
  `constrained:create/inspect/start/transfer/remove`へ固定
- fixed container plan/invocation と backend call seam を固定: `/usr/bin/docker`、
  `shell: false`、`DOCKER_CONFIG` のみ、`host env inherit` なし
- `FIXED_CONTAINER_RUNTIME`/`FIXED_CONTAINER_USER`、`network none`、`read-only` root、
  capability drop all、`no-new-privileges`、`--memory`/`--cpus`/`--pids-limit`
  など観測境界を固定
- completion/inconclusive の比較と、host/container evidence の raw payload を保存しない
  sanitized 結果だけを受理
- `npm run --silent m4:run:controls` は one-shot/no-retry、built-image再取得/rebind、
  staging、doctor、build、image inspect、run-root再利用なしで1回だけ実行

# Out of scope

- run-controls の implementation 変更（blockingがあれば別 follow-up prompt）
- `stage-build-context`、doctor、build、image/tag inspect、retained build run-root/tagの
  read/mutation/delete、別run ID、retry、追加Docker command
- M1/M2/M3、publication、commit、remote Git、external network、credential、
  host home/agent/runtime socket、arbitrary image/command/argv/mount/path/option の変更
- adapter/profile route 変更、experiment-matrix route Observed、presentation evidence
  の更新

# Constraints

- execution前に、review済みrepository-visible control/profile snapshot（67 files）の
  sorted-manifest SHA-256
  `9e9d79b10e91966f6871da7e335d62703304cf47c1f8b757b53449d942ebba7b`
  と[remediation review](../docs/reviews/m4-execution-profiles-run-controls-remediation.md)
  のcritical hashesを再現する。
- 両exact run rootがabsentでなければactivationも実行も行わない。
- builtImageDigest、profile pair run ID、control ID、manifest schema、container name、
  command object/orderを変更しない。
- `run:controls` 実行は固定 command 1回のみ。中間での `retry`、run-id 書換え、
  `stage-build-context` 再実行、残存 state の再inspect/cleanup を許可しない。
- `COMMAND_FAILURE` / `COMMAND_TIMEOUT` / `OUTPUT_LIMIT` / `INSPECTION_FAILURE` /
  `IMMUTABLE_INPUT_CHANGED` / `TRANSFER_FAILURE` / `EVIDENCE_INVALID` /
  `CLEANUP_FAILURE` は`inconclusive`のまま保持する。
- `m4:run:controls` 実行後は全outcomeで`orchestrator-entry.ts`とcompiled outputを
  fail-closed bytesへ即時復元し、restore不能時に再実行しない。

# Required temporary activation

`containers/profile-control/src/orchestrator-entry.ts`だけを次のcomplete bytesへ一時置換する。
`orchestrator.ts`は変更しない。

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

- activation source SHA-256:
  `580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d`
- ordinary source SHA-256:
  `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f`
- ordinary compiled `dist/orchestrator-entry.js` SHA-256:
  `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4`

Activation hashを確認して`npm run m4:typecheck`を通した後にだけexact commandへ進む。

# Exact execution and side-effect boundary

`continue-repository-work` の standing authorization を使って、次の command を
**ちょうど 1 回**実行する。

```sh
npm run --silent m4:run:controls
```

許容 side-effect は次に固定される。

1. fixed `/usr/bin/docker` のcreate/inspect/start/cp/remove直列実行（固定argv、最大13 spawn）
2. fixed run-root/layout 配下への host inspection / result / scratch 書込
3. control fixture / evidence の固定ファイル集合生成（`host-inspection.json`、
   `container-result/control-evidence.json`、`container-result/result-marker.txt`、
   `host/completion.json`、`host/comparison.json`）

Docker `cp`はpermissiveのevidence/result/scratchとconstrainedのevidence/resultだけに限定する。
Container-owned canonical evidenceは固定result rootに保持するが、temporary transfer copyとraw
stdout/stderr/inspect payloadは長期保持しない。

# Exact activation bytes and post-run check

命令は失敗時も含めて完了後にordinary sourceを上記hashへ戻し、
`tsc --project containers/profile-control/tsconfig.build.json`でordinary compiled outputを
再生成して上記hashを確認する。復元不能なら追加実行せず、その状態をhandoffする。

# Deliverables

- one-shot run-controls execution gate の実行境界文言
- builtImageDigest / profile pair / run-id / fixed profile command boundary の固定
- `npm run --silent m4:run:controls` 実行1回と completed step/failure code の記録
- 復元不可状態を含む remaining limitation の handoff
- `docs/m4-restart-issue-board.md` と `docs/milestones.md` の最小更新

# Verification

```sh
npm run m4:typecheck
npm run m4:static
npm run m4:test
npm run m4:verify
npm run check
git diff --check
git status --short
```

`npm run m4:doctor`、`npm run m4:build`、`npm run m4:recovery:offline-build`、
`npm run m4:verify:evidence`、直接のDocker/runtime commandは使わない。Docker CLIへ到達できる
唯一のactionは上記exact `m4:run:controls` invocation内部のreview済みfixed backendである。

# Completion report

- review済みsource/profile/activation/restoration hashの再現結果
- one-shot/no-retry の確認
- completed steps / primary failure
- ordinary source/compiled restorationとfixed pair run-rootの状態
- run-controls 以外の route/evidence には昇格していないこと
- direct runtime socket、external network、credential、host home、retained build state、
  remote Git、publication、deployment、external communicationを使っていないこと
