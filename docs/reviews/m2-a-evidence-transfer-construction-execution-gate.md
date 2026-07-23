# M0/M2-A construction and execution-gate contract review

## Review target and decision

- Target: frozen-research issue #43's proposed M0/M2-A construction and
  execution-gate contract
- Review type: fresh independent Docker-free read-only contract review
- Review prompt:
  [m2-a-evidence-transfer-construction-execution-gate-review](../../prompts/reviews/m2-a-evidence-transfer-construction-execution-gate-review.md)
- Decision: **BLOCKED; no implementation, acquisition, construction, image
  build, or execution task is approved**
- Blocking findings: M2A-CGR01 through M2A-CGR03 below
- Non-blocking findings: none
- Contract repair, implementation, or runtime execution performed in this
  review: none

The proposal fixes useful source, npm-acquisition, context, image, phase, and
evidence boundaries, but it does not yet close the complete constructor
toolchain, image-build packet, or host result-publication identities. The
maximum positive decision is therefore not reached. Standing authorization
cannot fill these contract choices and was not used.

## Independently reproduced identities and preserved boundaries

The review reproduced the exact existing 31-row input inventory and aggregate:

```text
sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04
```

Appending the contract's ten rows in their exact order produced 41 rows and
the proposed aggregate:

```text
sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526
```

The manifest and pure transfer library agreed on all ten reproduced tuple
fields: generation, expected revision, scenario, run ID, result root,
container run root, both container names, transfer volume, and candidate tag.
The pinned base digest in the proposal matches the current Containerfile and
the historical M0 record.

All eight current Containerfile `COPY` sources trace to exactly one proposed
context family:

```text
m2a-context/npm/
m2a-context/npm-cli.js
m2a-context/probe-core/
m2a-context/npm-lifecycle-probe/
m2a-context/consumer/package.json
m2a-context/m2a-install-probe-1.0.0.tgz
container/initialize-m2a-volume.mjs
container/run-m2a-transfer.mjs
```

The current pure plan still validates an exact local `sha256:` image ID, uses
`/usr/bin/docker`, retains `executionApproved: false`, and exposes the reviewed
absence/create/inspect/start/wait/copy lifecycle. Root `package.json` exposes
only M2-A verification scripts; no production constructor, build, or executor
script exists. The existing Containerfile, manifest, container entries,
adapter/probe source, fixtures, scenarios, results, Expected, and `Observed`
bytes remain outside this review delta.

## M2A-CG decision summary

| Item | Contract-scope decision |
| --- | --- |
| M2A-CG01 — immutable source and acquisition closure | **BLOCKED** by M2A-CGR01 |
| M2A-CG02 — complete deterministic construction manifest | **BLOCKED** by M2A-CGR01 |
| M2A-CG03 — offline one-build image identity and retention | **BLOCKED** by M2A-CGR02 |
| M2A-CG04 — exact production entry and one-shot lifecycle | **BLOCKED** by M2A-CGR03 |
| M2A-CG05 — failure, result, and evidence separation | **BLOCKED** by M2A-CGR03 |
| M2A-CG06 — later implementation and verification allowlist | **BLOCKED** by all three findings |

## Blocking findings

### M2A-CGR01 — compiler authority and construction schema are not closed

The 41-row baseline binds source, configuration, the lockfile, and existing
container inputs, and the separate npm `12.0.1` receipt adequately withholds
external acquisition authority. The constructor nevertheless must execute the
locally installed TypeScript compiler and resolve its library/type inputs.
Those installed bytes are neither members of the 41-row baseline nor bound by
a separate reviewed acquisition/inventory packet. A `5.9.3` version check and
the lockfile bytes do not prove which compiler, TypeScript library, Node type,
or transitive resolver bytes produced `dist`.

The proposal also does not fix the compiler executable/runtime path, exact
argv and environment, process deadline/output/terminal-settlement contract, or
the ordered top-level keys and nested shape of
`m2a-transfer-construction/v1`. It fixes the context-row shape, but leaves the
rest of the canonical manifest representation to the implementer. Therefore
the complete source/acquisition-to-context chain is not independently
reproducible before implementation.

The smallest remediation must bind every compiler/runtime/resolver input by an
exact reviewed inventory or separately reviewed artifact, fix the no-argument
compiler process plan and settlement bounds, and specify the complete ordered
construction-manifest schema and aggregate inputs. It must preserve the npm
acquisition boundary and must not acquire a dependency or construct a context.

### M2A-CGR02 — the image-build plan and binding packet are descriptive, not exact

The image phase is correctly offline, single-build, no-retry, retained, and
separate from runtime execution. However, the proposal calls its Docker plan
exact while providing no complete argv arrays, numeric deadlines, output
limit, fixed CLI environment/layout, explicit `linux/amd64` build selection,
or exact inspect projection. It says `image-binding.json` contains a
"sanitized platform/config identity" without fixing that identity's ordered
keys, accepted values, or the complete ordered
`m2a-transfer-image-binding/v1` schema.

As written, different implementations can satisfy the prose while selecting
different process bounds, platform arguments, inspect fields, or image-config
projections. The later fresh review would then be asked to approve choices that
this contract was required to make.

The smallest remediation must record the exact absence/base/build/candidate-
inspect argv, CLI environment and private layout, deadlines/output/settlement
rules, platform/config projection, and complete canonical binding schema. It
must not inspect the local base or candidate tag and must not call Docker.

### M2A-CGR03 — execution has no exact host transaction and contradicts outcome preservation

The proposal correctly reuses the reviewed Docker lifecycle order and forbids
fallback, retry, repair, and cleanup. The current fixed plan's copy
destinations are relative `transfer/...` paths, though, and the proposal does
not bind the executor's exact cwd, private staging/result-root inventory,
directory/file modes and ownership, descriptor/identity checks, or atomic
candidate-attempt publication transaction. Those missing choices determine
where official copy writes and how a one-shot outcome is preserved.

There is also a direct contract conflict. M2A-CG05 says any one-shot outcome is
preserved, and M2A-CG04 ends in atomic candidate-attempt publication, while the
same proposal says unknown settlement suppresses publication. Unknown Docker
CLI/container settlement must suppress later Docker inspection, transfer, and
cleanup, but the contract must decide whether and how the already known
sanitized Inconclusive attempt is durably recorded. It cannot both require and
forbid that publication.

The smallest remediation must fix one exact host filesystem transaction from
absence preflight through bounded copies and canonical attempt commit,
including the relative-copy cwd binding and all descriptor settlement, and
must resolve unknown-settlement publication consistently without inspecting or
mutating runtime/result state.

## Evidence classes and remaining limitations

- This is contract review evidence only. The reproduced hashes establish
  current repository byte identity, not compiler, filesystem, Docker, image,
  lifecycle, named-volume, transfer, or result behavior.
- The npm distribution is still absent from the repository contract and its
  separately authorized credential-empty acquisition remains unperformed.
- No constructor or production entry exists, no context or image ID has been
  produced, and the named-volume transfer remains unobserved.
- Historical M0 remains Inconclusive. M3 ingestion, profile/matrix/
  presentation evidence, and `Observed` remain unchanged.

## Verification observed

| Command | Observed result |
| --- | --- |
| `git status --short --branch` | Existing multi-session dirty worktree inventoried and preserved; no cleanup or reset. |
| Repository-controlled read-only Node identity/context/plan audit | Reproduced 31 and 41 rows with both exact aggregates; matched ten tuple fields; traced eight Containerfile `COPY` sources; validated the pure fixed plan; found no production M2-A root script. |
| Targeted read-only source and documentation inspection | Reproduced the pinned base, existing transfer order, absent production entries, undefined compiler/build/schema values, relative copy targets, and publication conflict without importing either container entry. |
| Focused Prettier check over the proposal, review prompt, review record, and five status records | Exit `0`; all matched files use Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error reported in the accumulated working tree. |

No test is required for this documentation-only review. No compiler build,
npm pack/install/approve/rebuild, lifecycle entry, adapter, probe, constructor,
production entry, Docker/container/runtime-socket command, transfer, ignored
acquisition/construction/result-root access, retained-state access, external
network, Remote Git, publication, deployment, or third-party communication was
used.

## Decision and next boundary

M2A-CG01 through M2A-CG06 remain open. No static/unit implementation may begin
until one bounded Docker-free contract remediation fixes M2A-CGR01 through
M2A-CGR03 and a fresh independent read-only re-review closes them.

Next: save the exact bounded Docker-free M2A-CGR01 through M2A-CGR03 contract-
remediation prompt and fresh independent re-review prompt; do not acquire npm,
construct a context or image, call Docker, or access runtime/result state.
