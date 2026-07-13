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

The measured environment resolved the base digest to `sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5` and used Docker `29.6.1`.

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

Official/scenario `docker create` uses `--pull never`; image acquisition is confined to the explicit build preparation step.

Runtime containers are configured with:

- `--network none`
- `--read-only`
- `--cap-drop ALL`
- `--security-opt no-new-privileges`
- `--user 1000:1000`
- bounded memory, CPU, and PID count
- tmpfs only at `/work`, `/tmp`, and `/m0-output`
- no bind mounts, Docker socket, host home, SSH agent, credential directory, or repository mount

Docker `29.6.1` did not expose a running container's tmpfs content through `docker cp`: a fixed control file was present according to its writer, while copy reported it absent. Stopping the container also removes tmpfs data. The runner therefore emits one fixed framed JSON bundle through `docker start --attach`; the host enforces mode-specific relative paths, file count/size bounds, and per-file SHA-256 integrity before writing raw results. This fallback preserves the no-bind/no-socket boundary but does not satisfy the requested `docker cp` flow, so the run remains Inconclusive. The inspection policy is validated before startup and stored afterward. Static checks do not prove runtime isolation; the full marker script, Docker arguments, transfer fallback, and resulting inspection require human review.

## Reproduction and current limitation

The latest committed sanitized example contains all five measured scenarios. Their marker counts are respectively `0`, `1`, `0`, `1`, and `1`; every measured command exited `0`. npm recorded approval as the observed local tarball entry `allowScripts["file:/work/input/m0-install-marker-1.0.0.tgz"] = true`, and approval-scenario lock hashes were unchanged. The overall summary is Inconclusive only because the required tmpfs-to-`docker cp` evidence transfer was unavailable and the validated stdout fallback was used. Consequently `m0:run` and `m0:verify` return nonzero after preserving and checking the evidence.

The marker uses one small `appendFile` call per invocation. This supports record counting, but filesystem-level append atomicity is not proven. M0 measures only this package's `postinstall` behavior and must not be generalized to all dependency execution.
