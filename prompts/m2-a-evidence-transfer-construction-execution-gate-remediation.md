# Goal

Remediate only M2A-CGR01 through M2A-CGR03 in frozen-research issue #43's
M0/M2-A construction/execution-gate contract. Close the constructor toolchain
and manifest schema, exact offline image-build packet, and exact host
copy/result transaction without implementing any constructor or production
entry, acquiring a dependency, constructing a context or image, calling
Docker, or accessing runtime/result state.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, and `experiments/AGENTS.md`
- `docs/index.md` and the issue #43 documents routed there
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md` deferred high-assurance section
- `docs/milestones.md` M0, M2-A, and frozen-research sections
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `docs/experiment-protocol.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/spike-npm12.md`
- `docs/m2-a-npm-lifecycle-adapter.md`
- `docs/reviews/m2-a-npm-lifecycle-adapter.md`
- `docs/m2-a-evidence-transfer-contract.md`
- every issue #43 implementation/remediation review routed by `docs/index.md`
- `docs/m2-a-evidence-transfer-construction-execution-gate.md`
- `prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-review.md`
- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate.md`
- this prompt

# Scope

Change only the contract in
`docs/m2-a-evidence-transfer-construction-execution-gate.md` and the minimal
handoff records in:

- `docs/m2-a-evidence-transfer-contract.md`
- `docs/m2-a-npm-lifecycle-adapter.md`
- `docs/index.md`
- `docs/milestones.md`
- `docs/frozen-research-execution-plan.md`

This saved remediation/re-review prompt pair remains unchanged. Preserve the
blocking review as an immutable review result. Do not change implementation,
verification, package scripts, the existing Containerfile or manifest,
container entries, adapter/probe source, fixtures, scenarios, result paths,
Expected, or `Observed`.

## M2A-CGR01 — exact constructor authority and canonical schema

1. Add one separate, not-yet-authorized constructor-toolchain receipt at the
   fixed future private path:

   ```text
   experiments/npm12-install/.work/m2a-transfer-toolchain-20260721-01/toolchain.json
   ```

   The contract must make the receipt a prerequisite, not create or inspect it
   in this task. Its canonical one-line schema is
   `m2a-transfer-toolchain/v1`, with ordered top-level keys:

   ```text
   schemaVersion, generation, runtime, packages, inventory,
   inventoryAggregate, status, evidenceReview
   ```

   `runtime` has ordered keys `logicalId, version, platform, architecture,
   executableSize, executableSha256, loadedRuntimeInventoryAggregate` and
   binds fixed `/usr/bin/node`, Node `v20.18.2`, Linux, `x64`, its regular-file
   bytes, and every loader/shared-library byte admitted by the reviewed
   runtime inventory. `packages` is exactly this order, with ordered keys
   `name, version, integrity, inventoryAggregate`:

   ```text
   typescript / 5.9.3
   @types/node / 20.19.43
   undici-types / 6.21.0
   ```

   Their exact registry integrity strings are, in the same order:

   ```text
   sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==
   sha512-6oYBAi5ikg4Pl+kGsoYtawUMBT2zZMCvPNF7pVLnHZfd1zf38DRiWn/gT01RYCdUqkv7Fhr+C9ot4/tb+2sVvA==
   sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==
   ```

   `undici-types` must remain the exact lockfile dependency of `@types/node`.
   `inventory` is one lexical array of every admitted regular file from the
   runtime closure and the exact repository-local package roots, using ordered
   rows `logicalPath, mode, size, sha256`. Reject directories as implied input,
   symlinks, hard-link aliases, special/sparse files, extra/missing/reordered
   rows, host absolute paths in the record, and any unbound resolver input.
   Define the aggregate as SHA-256 over the canonical JSON inventory array.
   `status` is `complete`; `evidenceReview` remains `not-performed` until a
   separate fresh review records the receipt SHA-256 and aggregate. Neither
   this remediation nor the later constructor may infer acceptance from the
   self-described receipt.

2. Bind the constructor itself and both compiler children to that exact
   receipt. The constructor is the fixed no-argument `/usr/bin/node` entry and
   accepts no inherited environment or alternate executable/tool root. It
   builds a private compiler workspace from held and revalidated tracked
   source/config/package descriptors plus exact regular copies of the three
   receipt-bound package trees. It must not resolve through the ordinary root
   `node_modules`, a global cache, home directory, caller path, or network.

   The private compiler workspace mirrors `tsconfig.base.json`, both package
   config/source/package trees, and the receipt-bound `node_modules` layout.
   Fix exactly two compiler steps in this order, each with compiler-workspace
   cwd and these exact logical argv arrays:

   ```text
   compile-probe-core:
   ["node_modules/typescript/bin/tsc","--project","packages/probe-core/tsconfig.build.json","--outDir","packages/probe-core/dist","--pretty","false","--incremental","false"]

   compile-npm-lifecycle-probe:
   ["node_modules/typescript/bin/tsc","--project","packages/npm-lifecycle-probe/tsconfig.build.json","--outDir","packages/npm-lifecycle-probe/dist","--pretty","false","--incremental","false"]
   ```

   Each uses `/usr/bin/node` as executable. Before the second step, the
   workspace contains a regular-file copy of the first package's already
   validated `package.json` and complete `dist` at
   `node_modules/@tskaigi-lab/probe-core`. Both use `shell: false`, an exactly
   empty environment, a 30,000 ms absolute deadline, 65,536-byte combined
   output bound, TERM then 250 ms KILL grace, a 1,000 ms final close deadline,
   null-signal/exit-zero/no-truncation success, and all-settled descriptor and
   output-capture closure. Unknown settlement is Inconclusive and forbids
   publication. The private compiler workspace is never context input and all
   of its deletion/close settlement must finish before manifest construction.

3. Replace every prose-only part of `m2a-transfer-construction/v1` with one
   complete canonical shape. Ordered top-level keys are:

   ```text
   schemaVersion, generation, expectedRevision, runId, scenarioId,
   trackedInputs, npmAcquisition, constructorToolchain, constructor,
   contextInventory, contextAggregate
   ```

   The ordered nested keys are:

   - `trackedInputs`: `sourceAggregate, constructionBaselineAggregate`
   - `npmAcquisition`: `receiptSha256, tarballSize, tarballSha256, integrity`
   - `constructorToolchain`: `receiptSha256, runtimeSha256,
     inventoryAggregate`
   - `constructor`: `sourceSha256, compilerSteps`
   - each `compilerSteps` row: `stepId, executableLogicalId, argvLogicalId,
     cwdLogicalId, environmentKeys, deadlineMs, combinedOutputLimitBytes,
     termToKillGraceMs, closeDeadlineMs`
   - each `contextInventory` row: `path, type, mode, size, sha256, mtimeNs`

   Fix nullability: directory rows alone use null `size`/`sha256`; regular rows
   require integer size and `sha256:` digest; every `mtimeNs` is decimal `0`.
   `contextAggregate` is SHA-256 over canonical `contextInventory` bytes. The
   canonical manifest must bind the separately reviewed npm and toolchain
   receipt SHA-256 values and the later review-approved constructor source
   SHA-256. Reject unknown keys, order, type, descriptor, prototype, byte, or
   aggregate drift without trusting caller projections.

## M2A-CGR02 — exact offline image-build and binding packet

1. Fix the private build root to
   `experiments/npm12-install/.work/m2a-transfer-image-build-20260721-01`.
   It contains only mode-`0700`, effective-user-owned, non-symlink `home/` and
   `docker-config/`, plus mode-`0600` regular
   `docker-config/config.json` with exact bytes `{"auths":{}}\n`. Every path is
   exclusively created, held, and identity-revalidated. No cleanup occurs;
   the root and image are retained on every build outcome.

2. Fix `/usr/bin/docker`, `shell: false`, repository-root cwd, no inherited
   environment, and only `DOCKER_CONFIG`, `HOME`, and `PATH=/usr/bin:/bin`.
   Record these exact commands in this exact order, with the bracketed format
   strings copied literally into the remediated contract:

   ```text
   ["version","--format","{\"client\":{{json .Client.Version}},\"server\":{{json .Server.Version}}}"]
   ["image","ls","--no-trunc","--quiet","--filter","reference=tskaigi-m2a-transfer:20260721-01"]
   ["image","inspect","--format","{\"architecture\":{{json .Architecture}},\"id\":{{json .Id}},\"os\":{{json .Os}},\"repoDigests\":{{json .RepoDigests}}}","node:24.18.0-bookworm-slim@sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5"]
   ["build","--network","none","--pull=false","--no-cache","--platform","linux/amd64","--provenance=false","--sbom=false","--tag","tskaigi-m2a-transfer:20260721-01","--file","experiments/npm12-install/.work/m2a-transfer-construction-20260721-01/context/Containerfile.m2a-transfer","experiments/npm12-install/.work/m2a-transfer-construction-20260721-01/context"]
   ["image","inspect","--format","{\"architecture\":{{json .Architecture}},\"cmd\":{{json .Config.Cmd}},\"entrypoint\":{{json .Config.Entrypoint}},\"environmentNames\":[{{range $index, $entry := .Config.Env}}{{if $index}},{{end}}{{if lt (len (split $entry \"=\")) 2}}{{json \"M2A_INVALID_ENV_ENTRY\"}}{{else}}{{json (index (split $entry \"=\") 0)}}{{end}}{{end}}],\"id\":{{json .Id}},\"labels\":{{json .Config.Labels}},\"os\":{{json .Os}},\"repoTags\":{{json .RepoTags}},\"user\":{{json .Config.User}},\"workingDir\":{{json .Config.WorkingDir}}}","tskaigi-m2a-transfer:20260721-01"]
   ```

   The version must be exact client/server `29.6.1`; tag absence is exit zero,
   null signal, and empty stdout; base projection must bind the pinned digest,
   `linux/amd64`, and one local `sha256:` ID. Build is exactly one occurrence.
   Candidate projection requires one exact local `sha256:` ID, `linux/amd64`,
   user `1000:1000`, null entrypoint, command
   `["node","/opt/m2a-transfer/run-m2a-transfer.mjs"]`, empty working
   directory, environment names exactly
   `["PATH","NODE_VERSION","YARN_VERSION"]`, repo tags exactly
   `["tskaigi-m2a-transfer:20260721-01"]`, and `labels: null`. The base
   projection requires repo digests exactly
   `["node@sha256:cb4e8f7c443347358b7875e717c29e27bf9befc8f5a26cf18af3c3dec80e58c5"]`.
   No raw environment value is persisted.

3. Use a 5,000 ms deadline for version, absence, base inspect, and candidate
   inspect; 300,000 ms for the sole build; 65,536 combined output bytes per
   command; TERM then 250 ms KILL grace; 1,000 ms final close deadline; and
   exact exit-zero/null-signal/no-timeout/no-truncation success. Unknown close
   or ambiguous absence is Inconclusive. No pull, login, registry fallback,
   load/import/save/push/tag/remove/prune, container/volume action, retry, or
   cleanup is available.

4. Define complete ordered `m2a-transfer-image-binding/v1` top-level keys:

   ```text
   schemaVersion, generation, expectedRevision, runId, scenarioId, imageTag,
   baseImage, construction, build, localImage, retention,
   runtimeExecutionApproved, evidenceReview
   ```

   Nested key order is:

   - `baseImage`: `reference, id, repositoryDigest, os, architecture`
   - `construction`: `manifestSha256, contextAggregate,
     npmAcquisitionSha256, constructorToolchainSha256`
   - `build`: `dockerClientVersion, dockerServerVersion, platform, network,
     pull, noCache, provenance, sbom, occurrences`
   - `localImage`: `id, os, architecture, user, entrypoint, cmd, workingDir,
     environmentNames, repoTags, labels`
   - `retention`: `image, constructionRoot, buildRoot`

   Fix values to the packet above, `runtimeExecutionApproved: false`, and
   `evidenceReview: "not-performed"`. Publish canonically and atomically only
   after every command/output/descriptor settles and the context is revalidated.

## M2A-CGR03 — exact host transaction and unknown-settlement rule

1. Preserve the existing runtime CLI work root
   `experiments/npm12-install/.work/m2a-transfer-20260721-01` and its exact
   three-key Docker environment. Bind every runtime Docker child cwd to the
   fixed result root, so the existing relative destinations
   `transfer/<fixed-file>` cannot resolve anywhere else.

2. Before the first Docker mutator, require the result root absent, then create
   exactly a mode-`0700`, effective-user-owned, one-link, non-symlink result
   root containing mode-`0700` `transfer/` and canonical mode-`0600`
   `attempt.json`. The only temporary publication name is `attempt.next`;
   fixed copy destinations start absent. Hold result/transfer identities,
   require exact owner/mode/type/link/ancestor identity on every operation,
   use no-follow same-descriptor reads, and reject extra entries outside the
   exact in-progress inventory. No host absolute path, uid/gid, device/inode,
   or Docker-managed source path is persisted.

3. Resolve outcome preservation with a pessimistic write-ahead checkpoint.
   Before launching each Docker child, atomically replace `attempt.json` with
   canonical `m2a-transfer-attempt/v1` bytes that conservatively mark that
   exact next step `M2A_SETTLEMENT_UNKNOWN`. Create `attempt.next` exclusively,
   write/sync/reread the full canonical bytes, close it, rename over
   `attempt.json`, and sync the held result directory. Launch only after that
   checkpoint fully settles. After a known child close and all owned output/
   descriptor settlement, replace it with the next exact checkpoint or final
   known outcome. A checkpoint/publication failure launches no next command
   and is never retried.

   If a Docker CLI child fails to emit a known close after the fixed TERM/KILL
   sequence, perform no later Docker, inspect, copy, validation, cleanup, or
   filesystem publication. The already synced prelaunch checkpoint remains as
   the durable sanitized Inconclusive record for the exhausted occurrence.
   Thus unknown container/CLI settlement suppresses all post-unknown action
   without suppressing the already committed write-ahead attempt. A known
   failure may publish its exact final issue only after every launched child
   and owned descriptor settles. After final known publication, neither
   `attempt.json` nor transfer bytes are changed.

4. Preserve completion-first conditional copy and the existing plan order.
   Each `docker cp` writes only one absent exact relative destination from the
   stopped measurement container, while its prelaunch checkpoint identifies
   that copy step. Validate only after known close using the held transfer
   parent and same destination descriptor. Close every descriptor before the
   next checkpoint. Preserve chronological write-once first issue, exact
   segment/conditional-marker correlation, natural-exit requirement, no
   directory/wildcard/stdout/log/archive fallback, and no restart/stop/kill/
   remove/repair/retry/cleanup.

5. State explicitly that checkpointing is a cooperative-host durability
   protocol, not an atomic transaction with Docker daemon state. Another
   same-authority client, kernel/runtime faults, or storage failure can still
   leave Inconclusive state. A candidate remains unaccepted until the later
   fresh Docker-free result review.

# Out of scope

- Editing source, tests, declarations, package scripts, Containerfile,
  manifests, container entries, adapter/probe packages, fixtures, scenarios,
  results, Expected, or `Observed`
- Creating or reading the fixed npm/toolchain acquisition, construction,
  build, runtime work, result, or retained-state roots
- Computing a current host runtime/library receipt, compiling, constructing a
  context, building/inspecting an image, or executing a lifecycle/transfer
- Changing the fixed tuple, 31-row/41-row identities, npm acquisition
  separation, transfer event contract, evidence class, or implementation
  allowlist beyond the minimum paths needed later to implement these exact
  contract requirements

# Constraints

- Use repository-controlled documentation and tracked source inspection only.
- Preserve M2A-TR01 through M2A-TR06 static/unit closure and all historical
  M0/M2-A runtime bytes.
- The remediation must make every schema key, argv, path identity, numeric
  bound, terminal condition, and unknown-settlement action reviewable before
  implementation. Do not defer a listed choice to an implementer.
- Do not use standing authorization; there is no approved runtime command in
  this task.
- No credentials, host home/environment/cache inspection, external network,
  Docker/runtime socket, lifecycle/probe/transfer execution, Remote Git,
  publication, deployment, or third-party communication.

# Deliverables

- remediated
  `docs/m2-a-evidence-transfer-construction-execution-gate.md`, retaining
  M2A-CG01 through M2A-CG06 and closing only the contract gaps for fresh review
- minimal status updates in the five scoped handoff records
- one concrete `Next:` item naming the saved fresh Docker-free remediation
  re-review prompt

# Verification

- Recompute the existing ordered 31-row and 41-row aggregates in memory and
  confirm the remediation changed neither baseline.
- Run focused Prettier checking over this prompt pair, the remediated contract,
  and five status records.
- Run `git diff --check`.
- No test, compiler build, constructor, npm, Docker, lifecycle, transfer, or
  result command is required or permitted for this contract-only remediation.

# Completion report

- Exact M2A-CGR01 through M2A-CGR03 contract changes and M2A-CG01 through
  M2A-CG06 status
- Reproduced 31-row/41-row identities and unchanged tuple/evidence boundaries
- Changed files and commands actually run
- Intentionally unrun commands, remaining limitations, and preserved unrelated
  work
- One concrete `Next:` task naming the fresh independent Docker-free
  construction/execution-gate remediation re-review
