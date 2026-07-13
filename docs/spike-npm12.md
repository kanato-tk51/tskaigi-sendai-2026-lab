# npm 12 install lifecycle minimal spike

This document separates version-specific official evidence, pre-run expectations, local observations, unknowns, and inconclusive results for M0. It does not describe M1 or later behavior.

## Environment

The experiment definition fixes Node.js `24.18.0`, npm `12.0.1`, Docker, and `node:24.18.0-bookworm-slim`. The marker dependency is the private local tarball `@tskaigi-lab/m0-install-marker@1.0.0`; its only lifecycle is `postinstall`, writing `/m0-output/marker.jsonl`.

The attempted run is represented by the committed sanitized example at `results/examples/m0-npm12/`. Its raw source is under the ignored `results/runs/m0/<run-id>/` hierarchy. The environment had root Node.js `v20.18.2` and npm `11.12.1`, but no Docker CLI.

Preparation network and experiment runtime network are distinct. Image pull and `npm@12.0.1` image installation are the only preparation operations allowed external network. Scenario containers are configured for `--network none` and local offline tarball installation. Because Docker was unavailable, neither preparation network nor a runtime network namespace was actually used.

## Official

No npm `12.0.1` help or bundled documentation was captured. Therefore this run establishes no Official claim about unapproved dependency scripts, `allowScripts`, `ignore-scripts`, or local tarball approval representation.

`npm approve-scripts` is a fixed experiment input required by the M0 task. It is not reclassified here as version-verified Official evidence. The container runner is prepared to save `npm approve-scripts --help`, optionally `npm help approve-scripts`, bundled `npm-approve-scripts.md`, exact versions, and each allowlisted config value before scenarios begin.

## Expected

These are pre-run hypotheses and were not changed to match the attempted run:

- An unapproved dependency install has zero install-lifecycle invocations.
- Official approval followed by rebuild, reinstall, or a valid `npm ci` produces one `postinstall` marker.
- Explicit `--ignore-scripts` prevents the marker even when approval state is retained.

The first hypothesis comes from the npm lifecycle rows in `docs/experiment-matrix.md`; the additional commands are mapped controls for M0. Marker count is not an acceptance condition.

## Observed

The only valid local observations are:

- The host root toolchain reported Node.js `v20.18.2` and npm `11.12.1`.
- The Docker availability check failed with `ENOENT`, normalized as `DOCKER_CLI_UNAVAILABLE`.
- The runner preserved one summary containing all five fixed scenario IDs with status `inconclusive`.
- No measured npm command ran. Marker counts, approval entries, and lockfile hashes remain `null`, not zero.
- Sanitization produced the minimal example without repository absolute paths, host home paths, ANSI escapes, Docker IDs, or npm cache paths.

Configured Docker flags, fixed Node/npm versions, and scenario command arguments are implementation inputs, not Observed runtime enforcement in this run.

## Unknown

The following remain unknown until Docker-backed execution succeeds:

- The resolved manifest digest for `node:24.18.0-bookworm-slim`.
- Whether the final image reports Node.js `v24.18.0` and npm `12.0.1` under this Docker installation.
- npm `12.0.1`'s captured approval help and bundled documentation content.
- How the local tarball dependency is represented in `package.json#allowScripts`.
- Whether approval uses a name-only or version-pinned key.
- Marker counts and command exit codes for all five scenarios.
- Lockfile creation and hash changes for install, reinstall, rebuild, and `npm ci`.
- The actual Docker server version and inspection evidence for mounts, network, user, capabilities, and security options.

## Inconclusive

M0 as a whole is Inconclusive because Docker was unavailable. The build, doctor, run, and verify commands failed nonzero where required; `m0:run` still persisted the infrastructure failure and `m0:verify` rejected the latest run because its summary status is not `success`.

This is not evidence that npm skipped or executed any script. It is also not evidence that the configured container isolation was enforced.

## Scenario results

| Scenario | Setup | Measured command | Status | Exit | Marker count | Approval before/after | Lock before/after |
|---|---|---|---|---:|---:|---|---|
| `unapproved-install` | not run | `npm install` not run | Inconclusive | `null` | `null` | `null` / `null` | `null` / `null` |
| `approved-rebuild` | not run | `npm rebuild @tskaigi-lab/m0-install-marker` not run | Inconclusive | `null` | `null` | `null` / `null` | `null` / `null` |
| `approved-scripts-disabled` | not run | `npm ci --ignore-scripts` not run | Inconclusive | `null` | `null` | `null` / `null` | `null` / `null` |
| `approved-reinstall` | not run | `npm install` not run | Inconclusive | `null` | `null` | `null` / `null` | `null` / `null` |
| `approved-ci` | not run | `npm ci` not run | Inconclusive | `null` | `null` | `null` / `null` | `null` / `null` |

## Approval representation

No `allowScripts` change was observed. Each sanitized scenario stores an approval fragment with `before: null`, `after: null`, and `changed: false` solely because the scenario did not run. These values must not be interpreted as npm's representation.

The implemented runner invokes only `npm approve-scripts @tskaigi-lab/m0-install-marker` and records the resulting complete `allowScripts` object without constructing or editing an entry itself.

## Lockfile behavior

No lockfile was created, so no install or `npm ci` lock behavior was observed. Missing snapshots are represented as `absent` in scenario evidence; summary hashes are `null`.

## Limitations

- Docker absence prevented base image acquisition, npm 12 installation, official evidence capture, container inspection, and all lifecycle measurements.
- Static checks confirm the configured argument allowlist but cannot prove the runtime boundary.
- The marker's single small append supports counting but does not prove filesystem-level atomicity.
- The dependency is a local tarball root dependency; results must not be generalized to registry, git, directory, or transitive dependencies.
- M0 is marker-only and measures no environment, file-read, network, child-process, or general capability behavior.
- Container escape and Docker/Node/npm vulnerabilities are out of scope.

## Reproduction

After installing Docker, review the complete lifecycle script and Docker boundary, then run:

```sh
npm run m0:build
npm run m0:doctor
npm run m0:run
npm run m0:verify
```

Do not substitute another Node.js/npm version, base image, approval command, or container runtime. `m0:build` resolves and records the exact base digest; `m0:run` performs official evidence capture before five fresh scenario containers; `m0:verify` rejects incomplete or Inconclusive evidence.

## Implications for later milestones

M2-A must not consume marker counts or approval semantics from this Inconclusive run. Before M1 review advances toward lifecycle adapter work, a human must review the marker script, Docker create arguments, resolved digest, official npm help, all five scenario results, sanitization, and the distinction between configured and observed isolation. No probe-core or adapter behavior has been implemented or validated by M0.
