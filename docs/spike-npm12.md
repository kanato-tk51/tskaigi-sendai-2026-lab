# npm 12 install lifecycle minimal spike

This document separates version-specific Official evidence, pre-run Expected hypotheses, local Observed results, Unknowns, and Inconclusive findings for M0. It does not describe M1 or later behavior.

## Environment

- Container runtime: Docker `29.6.1` on Linux
- Base tag: `node:24.18.0-bookworm-slim`
- Resolved base digest: `sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5`
- Container Node.js: `v24.18.0`
- Container npm: `12.0.1`
- Dependency: private local tarball `@tskaigi-lab/m0-install-marker@1.0.0`
- Lifecycle: only `postinstall`, writing `/m0-output/marker.jsonl`
- Raw run: `results/runs/m0/m0-20260713t201443z-79b976f8/` (Git-ignored)
- Sanitized example: `results/examples/m0-npm12/`

Preparation network and experiment runtime network were separate. `m0:build` used network only to pull the Docker Official Image and install exact `npm@12.0.1`; it packed the dependency with `npm pack --ignore-scripts`. Official-evidence and all five scenario containers used `--network none`, `offline=true`, and the image-local tarball.

## Official

The following statements are limited to npm `12.0.1`'s captured `npm approve-scripts --help` and bundled `npm-approve-scripts.md` / `config.md`:

- `npm approve-scripts <pkg> [<pkg> ...]` is the basic approval usage; `--all` and read-only `--allow-scripts-pending` modes also exist.
- The command manages the project's `package.json#allowScripts` and is the recommended way to maintain that field.
- Dependency install scripts are blocked by default when no matching `allowScripts` entry exists. Install completes with a skipped-package warning unless stricter policy applies.
- The documented install-script set includes `preinstall`, `install`, `postinstall`, and `prepare` for non-registry sources.
- `ignore-scripts=true` means npm does not run scripts declared in package files. Explicit script commands have a documented exception for their intended script, while pre/post scripts remain disabled.
- `strict-allow-scripts=true` changes an unreviewed install script from a warning/block into an install error; `--ignore-scripts` overrides that setting.
- `allow-file=root` permits local tarball files declared in the root project's `package.json`; `allow-directory=none`, `allow-git=none`, and `allow-remote=none` reject those source forms under their documented rules.
- Approval pinning defaults to true for documented package/version approvals, with `--no-allow-scripts-pin` selecting name-only approval.

`npm help approve-scripts` was attempted and exited `1` because the slim image had no help renderer (`ENOENT`). The bundled command documentation was present and saved instead. The Official text does not document the exact `allowScripts` key produced for this local tarball, so that representation is not claimed as Official.

## Expected

These hypotheses were defined before measurement and were not rewritten to match the run:

- Unapproved dependency install: marker count `0`.
- Official approval followed by rebuild: marker count `1`.
- Official approval plus explicit `--ignore-scripts`: marker count `0`.
- Approval retained across reinstall: marker count `1`.
- Approval retained for valid `npm ci`: marker count `1`.

Marker count was never an implementation acceptance condition.

## Observed

- All measured npm commands exited `0` without timeout.
- Unapproved `npm install` emitted npm's blocked install-script warning and produced no marker.
- `npm approve-scripts @tskaigi-lab/m0-install-marker` changed `allowScripts` from absent to `{ "file:/work/input/m0-install-marker-1.0.0.tgz": true }` in every approval scenario. The runner did not construct this entry.
- Approved rebuild, reinstall, and `npm ci` each produced one valid `postinstall` marker. Approved `npm ci --ignore-scripts` produced no marker.
- Every initial unapproved setup install had marker count `0`; approval itself did not create a marker.
- Approval did not change the generated lockfile hash. The stable hash in approval scenarios was `sha256:2339f5466496976c6c4fb68af213a00abd475a18217ccd7e0cb51064915a4dff` before and after the measured command.
- Container inspection for every scenario reported user `1000:1000`, network mode `none`, read-only rootfs, `CapDrop=["ALL"]`, no added capabilities, `no-new-privileges`, no bind mounts, and tmpfs only at `/work`, `/tmp`, and `/m0-output`.
- The allowlisted npm config values were captured individually. Cache, user config, and global config resolved to fixed `/work` locations, not the root repository configuration.

The npm observations above are scenario-level success. The overall M0 run is nevertheless Inconclusive for the output-transfer requirement described below.

## Unknown

- The captured Official documentation does not specify why a local tarball approval is keyed by its fixed `file:` path rather than package name/version; only the observed representation is known.
- Results for registry, remote tarball, git, directory, transitive, optional, or multi-version dependencies remain unknown.
- Results under a different Docker release, kernel, architecture, npm patch, or Node.js version remain unknown.
- Whether another approved container runtime exposes tmpfs content through its copy API is unknown.
- M0 does not establish any environment, file-read, network, child-process, or general capability behavior.

## Inconclusive

The required `docker cp` collection step is Inconclusive in Docker `29.6.1`. A fixed control process successfully wrote an 11-byte file and reported it present inside the running `/m0-output` tmpfs, while `docker cp` reported that path absent. Stopping the container removes tmpfs contents, so post-exit copy cannot recover them either.

To preserve the npm observations without weakening isolation, the runner emitted one fixed framed JSON bundle through `docker start --attach`. The host accepted only mode-specific relative paths, bounded file counts/sizes, and matching per-file SHA-256 digests before materializing raw evidence. This uses no bind mount, socket forwarding, container exec, or runtime network. It is a documented fallback, not fulfillment of the requested `docker cp` flow; therefore summary status is `inconclusive` with `DOCKER_CP_TMPFS_UNAVAILABLE`, and `m0:run` / `m0:verify` return nonzero.

## Scenario results

| Scenario | Measured command | Scenario status | Exit | Marker count | Approval before / after | Lock before / after |
|---|---|---|---:|---:|---|---|
| `unapproved-install` | `npm install` | Success | `0` | `0` | absent / absent | absent / `2339…4dff` |
| `approved-rebuild` | `npm rebuild @tskaigi-lab/m0-install-marker` | Success | `0` | `1` | absent / local `file:` key `true` | `2339…4dff` / same |
| `approved-scripts-disabled` | `npm ci --ignore-scripts` | Success | `0` | `0` | absent / local `file:` key `true` | `2339…4dff` / same |
| `approved-reinstall` | `npm install` | Success | `0` | `1` | absent / local `file:` key `true` | `2339…4dff` / same |
| `approved-ci` | `npm ci` | Success | `0` | `1` | absent / local `file:` key `true` | `2339…4dff` / same |

## Approval representation

Observed after the official command in all four approval scenarios:

```json
{
  "allowScripts": {
    "file:/work/input/m0-install-marker-1.0.0.tgz": true
  }
}
```

This is an Observed npm edit, not a runner-written value and not an Official general rule. Approval was absent before the command and remained present through rebuild, reinstall, scripts-disabled `npm ci`, and approved `npm ci`.

## Lockfile behavior

The initial unapproved install created the lockfile. The official approval command changed `package.json` but not the lockfile. Rebuild, reinstall, scripts-disabled `npm ci`, and approved `npm ci` retained the same captured lockfile hash. This is one fixture/run observation, not a guarantee for other dependency sources.

## Limitations

- The required tmpfs-to-`docker cp` transfer did not work; the hash-validated stdout bundle is an explicitly Inconclusive fallback.
- During manual boundary diagnosis, one incorrect runtime image name caused Docker to attempt and fail an implicit registry pull outside the allowed preparation-network operations. No scenario ran, no credential/home path was read, and no package was obtained. Fixed official/scenario `docker create` arguments now include `--pull never` in addition to the pre-create image inspection.
- `npm help approve-scripts` was unavailable in the slim image; captured help output and bundled npm documentation supplied Official evidence.
- The marker uses one small `appendFile` operation; filesystem-level append atomicity is not proven.
- PID and timestamp vary by invocation and are evidence fields, not deterministic content.
- Static checks do not prove runtime isolation or lifecycle harmlessness; a human must review the complete marker script, fixed Docker arguments, image digest, and inspection evidence.
- M0 is marker-only. It implements no common probe, capability attempt, profile comparison, adapter, or general harness.
- Container escape and Docker/Node/npm vulnerability testing remain out of scope.

## Reproduction

After Docker group membership is active in the shell, review the lifecycle script and boundary, then run:

```sh
npm run m0:build
npm run m0:doctor
npm run m0:run
npm run m0:verify
```

`m0:build` must resolve the recorded base digest and verify exact Node/npm versions. `m0:run` currently returns nonzero after saving all evidence because the required copy method is Inconclusive. `m0:verify` validates structure, safety policy, schema, and sanitization, then also returns nonzero rather than treating the Inconclusive summary as success.

## Implications for later milestones

M1 review may use this M0 result only as version-specific marker baseline evidence. It must not generalize the local `file:` approval key or lifecycle counts to other source types. Before M2-A, decide and review a supported evidence-transfer boundary; do not silently carry the stdout fallback into a general harness. No probe-core, adapter, capability probe, report harness, or M1+ behavior was implemented by this milestone.
