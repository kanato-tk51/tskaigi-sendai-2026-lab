# Goal

Issue #40 fresh reviewのB-18/B-19/B-20を、recovery trailのfixed digestとproject
humanが確定したexact pair run IDへbindしたまま、Docker非実行のstatic/unit境界で
remediateする。Canonical profile bytes、existing-image executor、production control
backend、exact temporary activation/restorationをfresh independent re-reviewへ渡す。

# Read first

- root `AGENTS.md`、`containers/AGENTS.md`
- `docs/index.md`
- `docs/milestones.md`のM4 section
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/m4-restart-issue-board.md`
- `docs/reviews/m4-execution-profiles-run-controls-gate.md`
- `docs/reviews/m4-execution-profiles-offline-build-recovery-gate.md`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`、`docs/architecture.md`、`docs/experiment-matrix.md`
- `prompts/m4-execution-profiles-run-controls-gate.md`
- this prompt

# Fixed binding

- built image digest:
  `sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`
- permissive run ID: `m4-profile-control-p-20260720-01`
- constrained run ID: `m4-profile-control-c-20260720-01`
- derived container names:
  `tskaigi-m4-p-m4-profile-control-p-20260720-01` and
  `tskaigi-m4-c-m4-profile-control-c-20260720-01`
- repository-owned run roots are the two run IDs under
  `results/runs/m4-profile-controls/`; both must be absent before initialization
- `profiles/permissive/profile.json` and `profiles/constrained/profile.json` are
  canonical single-line JSON plus one final LF and bind the same digest

These values are immutable. The remediation/review/execution worker must not choose a new
digest, run ID, tag, profile, root, container name, command, or option.

# Required remediation

## B-18 profile/digest/run binding

- Parse exact canonical `profile.json` bytes with strict schema validation and reject
  whitespace, key-order, profile-ID, digest, or byte substitution.
- Reconstruct the fixed pair and require byte equality with both versioned profiles.
- Derive exact distinct layouts/container names from the two fixed run IDs.
- Production backend creation must check both run roots absent before creating either.
- Do not inspect/read/mutate the retained build run root or fixed staged tag.

## B-19 production control boundary

- Implement a fixed production existing-image backend with `/usr/bin/docker`,
  `shell: false`, no inherited environment, and only a credential-empty run-owned
  `DOCKER_CONFIG`.
- Fix the lifecycle to `create -> inspect -> start -> transfer -> remove` for permissive,
  then the same for constrained. Reject command object/argv/order substitution before spawn.
- Create only exact run-owned input/host/result/scratch/config/transfer roots beneath a
  private `0700` run root. Input is fixed `0555` with canonical `0444` manifest;
  result/scratch are fixed `0733` so container UID/GID `10001:10001` can create its fixed
  `0600` files without exposing the private parent path.
- Evidence transfer uses only fixed `docker cp` commands from the stopped fixed container:
  result evidence and marker for both profiles, plus the permissive scratch marker, each to
  an exact absent run-owned transfer destination. Validate the copied regular-file bytes,
  delete only those exact temporary copies, and retain the original container result files.
- Write canonical manifests,
  validate regular-file identity/inventory/limits, persist only canonical sanitized host
  inspection/completion/comparison, and remove only the two owned config files/directories.
- Keep active-child settlement, timeout/output limits, first-failure and cleanup failure
  fail-closed. Do not retain stdout/stderr/raw inspect/error text.
- Keep the backend and production runner unreachable from ordinary `orchestrator.ts`,
  ordinary `orchestrator-entry.ts`, and `src/index.ts`.

## B-20 no-rebuild executor

- Add a separate existing-image pair executor. It must not call `stageBuildContext`,
  `readBuildContext`, `doctor`, `build`, or `inspect-image`.
- Both create commands consume the reviewed digest directly with `--pull never`.
- Preserve profile inspect/evidence/manifest/completion validation and always attempt the
  fixed remove step without retry.
- The former build-first executor remains available only for its historical static/unit
  contract; the production control runner must not call it.

# Exact future temporary activation

Fresh re-review must hash and approve the following complete temporary replacement for
`containers/profile-control/src/orchestrator-entry.ts`. It is not applied in this
remediation task.

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

Activation source SHA-256: `580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d`.

The mandatory restoration bytes are the current complete ordinary
`orchestrator-entry.ts` source, which imports `runApprovedOrchestrator`, writes only a
sanitized error code, and remains fail closed. Fresh review must record its source and
compiled-output hashes. The ordinary source SHA-256 is
`73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` and the current
ordinary `dist/orchestrator-entry.js` SHA-256 is
`02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4`.
The later execution gate must restore and recompile these bytes
on every outcome before any status/evidence follow-up.

# Out of scope

- temporary activation, `npm run m4:run:controls`, Docker/runtime/socket access, retained
  tag/run-root inspection, build/doctor/image inspect, container execution, retry, cleanup
  of retained build state, or profile-control Observed
- profile/digest/run ID changes, adapter/experiment-matrix route promotion, raw evidence,
  external network, credential, host home/environment, arbitrary input, remote Git,
  publication, deployment, or external communication

# Deliverables

- canonical fixed `profile.json` pair and strict byte tests
- existing-image executor with explicit no-build regression
- production control backend/runner with focused lifecycle/filesystem/transfer tests
- ordinary entry/index import-unreachability and static safety regression
- this remediation contract and a fresh independent re-review prompt
- milestone/issue-board/status metadata updated to remediation implemented/re-review pending

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

Do not run `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:recovery:offline-build`, `npm run m4:run:controls`,
`npm run m4:verify:evidence`, or any Docker/container command.

# Completion report

- Changed files and B-18/B-19/B-20 implementation evidence
- Commands run, exit status, observed test counts
- Exact fixed digest/run/profile/container/root binding and activation/restoration hashes
- Docker/runtime commands and temporary activation not executed
- Ordinary fail-closed entry preserved; runtime enforcement/Observed remain unmeasured
- External network, credential, host home, runtime socket, retained build state, remote Git,
  publication, deployment, and external communication not used
