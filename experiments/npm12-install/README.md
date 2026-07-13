# M0: npm 12 install lifecycle minimal spike

This experiment measures npm 12 dependency install-lifecycle approval behavior with a marker-only local package. It is deliberately independent of the root npm workspace and does not implement `probe-core`, an adapter, a common event schema, profiles, or a general report harness.

## Fixed environment

- Node.js: `24.18.0`
- npm: `12.0.1`
- Docker base: `node:24.18.0-bookworm-slim`
- dependency: `@tskaigi-lab/m0-install-marker@1.0.0`
- dependency supply: image-built local `.tgz`
- lifecycle: `postinstall`
- marker: `/m0-output/marker.jsonl`
- approval command: `npm approve-scripts`

`npm run m0:build` first pulls the exact base tag, resolves its `sha256` repository digest, and passes `node:24.18.0-bookworm-slim@sha256:...` as the `BASE_IMAGE` build argument. The build fails instead of using a different tag or version when Docker, the base image, npm `12.0.1`, or the expected toolchain is unavailable.

## Network boundary

Network availability is separated by phase:

- Preparation may use external network only for the Docker Official Image pull and `npm@12.0.1` installation during image build.
- Dependency packaging happens in the image build with `npm pack --ignore-scripts`; the dependency is never published.
- Every official-evidence and scenario container is created with `--network none`.
- Scenario npm commands use the local tarball plus `offline=true`; registry acquisition is not part of a scenario.

## Scenarios

Each ID gets a fresh container and fresh `/work`, `/tmp`, and `/m0-output` tmpfs:

1. `unapproved-install`: measures `npm install` with no `allowScripts` entry.
2. `approved-rebuild`: performs an initial install, invokes the official approval command, clears the marker, then measures `npm rebuild @tskaigi-lab/m0-install-marker`.
3. `approved-scripts-disabled`: retains official approval and lock state, removes `node_modules` and the marker, then measures `npm ci --ignore-scripts`.
4. `approved-reinstall`: retains approval, removes `node_modules` and the marker, then measures `npm install`.
5. `approved-ci`: retains approval and the generated lockfile, removes `node_modules` and the marker, then measures `npm ci`.

The runner records what happens. A particular marker count is not an implementation success condition.

## Commands

From the repository root:

```sh
npm run m0:build
npm run m0:doctor
npm run m0:run
npm run m0:verify
```

`m0:build` resolves the base digest and builds the image. `m0:doctor` requires the fixed image and validates static inputs plus the image labels. `m0:run` captures npm help/config evidence before starting the five scenarios. `m0:verify` validates static safety, summary shape, scenario completeness, container inspection policy, and sanitized output. A failure or Inconclusive run makes `m0:run`/`m0:verify` exit nonzero after preserving evidence.

`npm run m0:clean` removes only the fixed M0 image and disposable `experiments/npm12-install/.work` state. It preserves raw and sanitized evidence.

## Outputs

Raw results are written under `results/runs/m0/<run-id>/` and remain ignored by Git. The stable, minimal derived example is written to `results/examples/m0-npm12/`.

Each completed scenario records measured stdout/stderr, package and lockfile snapshots when present, marker JSONL when present, exact command argument arrays, and Docker inspection. Missing evidence is represented as `absent` in `result.json`; an empty file is not manufactured. The sanitizer omits raw package/lock snapshots and retains summary, commands, toolchain metadata, scenario results, approval fragments, minimal logs, and projected container policy.

## Safety boundary

The host orchestrator invokes only fixed Docker operations with `shell: false` and a disposable Docker CLI config directory, so it does not read host Docker credentials. It never accepts an image name, Docker option, mount path, or arbitrary command from user input.

Runtime containers are configured with:

- `--network none`
- `--read-only`
- `--cap-drop ALL`
- `--security-opt no-new-privileges`
- `--user 1000:1000`
- bounded memory, CPU, and PID count
- tmpfs only at `/work`, `/tmp`, and `/m0-output`
- no bind mounts, Docker socket, host home, SSH agent, credential directory, or repository mount

The host uses `docker cp` only after the container exits. The inspection policy is validated before scenario startup and stored afterward. Static checks do not prove runtime isolation; the full marker script, Docker arguments, and resulting inspection require human review.

## Reproduction and current limitation

The latest committed sanitized example is Inconclusive because the execution environment did not contain the Docker CLI. Consequently no base image was pulled, no digest was resolved, no image was built, and no npm lifecycle scenario ran. Install Docker, review the boundary, then rerun the commands above to obtain actual npm 12 evidence; do not substitute another runtime or version.

The marker uses one small `appendFile` call per invocation. This supports record counting, but filesystem-level append atomicity is not proven. M0 measures only this package's `postinstall` behavior and must not be generalized to all dependency execution.
