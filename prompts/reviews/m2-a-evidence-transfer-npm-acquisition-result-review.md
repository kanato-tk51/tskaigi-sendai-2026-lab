# Goal

Freshly and independently perform one Docker-free read-only result review of
the exact frozen-research issue #43 npm-acquisition occurrence for generation
`20260721-01`. Reconcile its bounded process handoff with only the fixed
acquisition root, then decide `ACCEPTED`, `REJECTED`, or `INCONCLUSIVE` for the
candidate without repair, retry, external communication, construction
binding, or evidence promotion.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, and `experiments/AGENTS.md`
- `docs/index.md` and the complete frozen-research issue #43 chain routed there
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md` deferred high-assurance boundary
- `docs/milestones.md` M0, M2-A, and frozen-research sections
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `docs/experiment-protocol.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- `docs/spike-npm12.md`
- `docs/m2-a-npm-lifecycle-adapter.md`
- `docs/m2-a-evidence-transfer-contract.md`
- `docs/m2-a-evidence-transfer-dependency-input-boundary.md`
- `docs/m2-a-evidence-transfer-npm-acquisition-execution-gate.md`
- `docs/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate.md`
- `docs/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation.md`
- `prompts/m2-a-evidence-transfer-npm-acquisition-execution.md`
- the authoritative bounded one-occurrence handoff produced under that prompt
- this prompt

# Scope

- Confirm the handoff names exactly one issued direct occurrence of:

  ```text
  executable: /usr/bin/env
  argv: [-i, --, /usr/bin/node, experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs]
  cwd: exact repository root
  environment own keys: []
  shell: false
  ```

- Reproduce the approved three-file producer identity and the saved execution
  and result-review prompt identities before interpreting any root state.
- Inspect only the exact fixed path
  `experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01`
  and, if safely present, only its exact expected children
  `npm-12.0.1.tgz`, `acquisition.json`,
  `npm-12.0.1.tgz.next`, and `acquisition.next`.
- Use fixed-path, no-follow, bounded reads to determine durable root state,
  archive/receipt identity, canonical receipt validity, archive/receipt
  cross-binding, and agreement with the process handoff.
- Write one independent candidate review and minimal authoritative status
  updates. If accepted, record only the two reviewed SHA-256 identities as
  eligible inputs for a later separately reviewed construction-binding task;
  do not perform that binding here.

# Out of scope

- Starting this review without an authoritative handoff proving exactly one
  occurrence was issued under the saved execution prompt
- Running or importing either producer, using DNS or any external/loopback/Unix
  socket, making an HTTPS request, or observing registry state
- Enumerating the acquisition-root parent, `.work`, another ignored path,
  toolchain/construction/result roots, historical results, images, retained
  runtime state, home/cache, installed packages, credentials, environment,
  proxy/certificate configuration, or `/usr/bin/node` bytes
- Following a symlink, opening an unexpected child, recursive traversal,
  archive extraction, npm install/pack/approve/rebuild, lifecycle execution,
  package script execution, toolchain capture, compiler/constructor execution,
  construction, image build, Docker/runtime socket, transfer, or runtime
  result access
- Root/file creation, chmod/chown, repair, rename, deletion, cleanup, resume,
  retry, signaling, quarantine, copy, or alternate generation
- Updating `reviewedAcquisitionReceiptSha256`,
  `reviewedAcquisitionTarballSha256`, `runtimeExecutionApproved`,
  `evidenceReview`, construction inputs, Expected, experiment-matrix
  `Observed`, presentation evidence, or any historical result
- Remote Git, publication, deployment, third-party communication, or standing
  authorization use

# Constraints

## Exact occurrence handoff

1. Before accessing the fixed root, require an immutable authoritative handoff
   that records:

   - exact execution/result-review prompt identities;
   - the approved three-file aggregate;
   - explicit human authority for the four M2A-NG06 effects;
   - successful final adjacent full-byte/hash preflight;
   - `occurrenceIssued: true` exactly once;
   - natural exit, signal, or unknown settlement;
   - bounded stdout/stderr byte length, SHA-256, and truncation state;
   - exact raw stream only when it is an allowed fixed line or empty; and
   - a no-retry disposition.

   If any field is absent, contradictory, or names another command/generation,
   return `BLOCKED` without touching the root.
2. Reproduce the three ordered producer paths at 1,166 / 112,299 / 81,269
   bytes with hashes `bd4066ad...`, `edac8966...`, and `57823592...`, and the
   exact ordered aggregate
   `sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.
   Reproduce both saved prompt hashes from the prompt-only handoff. Drift blocks
   before root access.
3. Confirm the reviewed construction bindings remain `null`,
   `runtimeExecutionApproved` remains `false`, and relevant `evidenceReview`
   values remain `not-performed`. Do not repair drift.

## Fixed-path and identity boundary

4. Determine the exact root itself as absent, unsafe, or a non-symlink
   directory. Do not list its parent. An absent root is a durable observation
   but cannot prove where a pre-commit failure occurred.
5. For a directory, require effective-user ownership, mode `0700` with no
   special bits, and a positive observed link count. Retain that positive
   value through before/after identity correlation without serializing raw
   device, inode, uid, gid, timestamp, absolute host path, PID, environment,
   or unsanitized error data.
6. Hold and revalidate the root identity before and after inventory and after
   all file reads. Inventory only the root itself, sort names by byte order,
   and never recurse. The only complete inventory is exactly:

   ```text
   acquisition.json
   npm-12.0.1.tgz
   ```

   The only recognized partial names are those two plus
   `acquisition.next` and `npm-12.0.1.tgz.next`. If any other name appears,
   record an invalid-inventory finding without opening it.
7. Open each recognized child from the held root with no-follow semantics.
   Require a regular non-symlink effective-user-owned file, no special bits,
   and exactly one link. A final archive or receipt must be mode `0444`; a
   staging file is retained partial diagnostic state and never accepted.
8. Treat an unsafe type, identity change, close uncertainty, extra child,
   inaccessible required metadata, or failed no-follow operation as a finding.
   Do not retry the read through an alternate path or turn it into absence.

## Archive and receipt

9. A complete archive must have a positive size no greater than 67,108,864
   bytes. Read it once through the held no-follow file authority with a strict
   bound, compute SHA-256, SHA-512, and canonical `sha512-<base64>` SRI, then
   revalidate identity and known close. Do not list or extract archive entries.
10. A complete receipt must be at most 65,536 bytes and exactly one canonical
    newline-terminated JSON line with this key order:

    ```text
    schemaVersion
    generation
    packageName
    version
    tarballSize
    tarballSha256
    integrity
    status
    scriptsRun
    credentialsUsed
    externalNetworkPhase
    evidenceReview
    ```

    Require `m2a-transfer-acquisition/v1`, `20260721-01`, `npm`, `12.0.1`, a
    positive bounded integer size, lowercase `sha256:<64 hex>`, canonical
    SHA-512 SRI, `complete`, `false`, `false`,
    `dependency-acquisition-only`, and `not-performed` respectively. Require
    exact parse/reserialize byte equality and compute receipt SHA-256.
11. Require receipt `tarballSize`, `tarballSha256`, and `integrity` to equal
    the independently read archive size, SHA-256, and SRI. Receipt visibility
    alone, an exit-zero projection, or equal filenames is not acceptance.
12. Report the receipt's registry SRI as an observed durable candidate field.
    Do not claim independent registry freshness, DNS/certificate/CDN identity,
    or external provenance; no network observation occurs in this review.

## Process/filesystem reconciliation

13. Reconcile the root state with exactly one of these bounded process
    projections:

    - natural exit `0`, stdout exactly
      `M2A_INPUT_ACQUISITION_COMPLETE\n`, empty stderr, and no truncation;
    - natural exit `1`, empty stdout, stderr exactly
      `M2A_INPUT_ACQUISITION_FAILED\n`, and no truncation; or
    - `Inconclusive` for every signal, unknown settlement, truncation, extra
      byte, both streams nonempty, exit/output mismatch, or orchestrator
      uncertainty after issuance.

14. `ACCEPTED` requires the exact success process projection, stable complete
    two-child root, exact root/file metadata, canonical receipt, archive
    hashes/SRI, and every cross-binding above. It accepts only an npm
    acquisition candidate at this cooperative-host review boundary.
15. `REJECTED` may record a safely established non-acceptable candidate or
    exact failure projection, but it must name only the bounded contradiction
    actually observed. It does not identify an unstored request, DNS, TLS,
    registry, stream, filesystem, or process cause.
16. Use `INCONCLUSIVE` for unsafe/unreadable identity, partial retained state,
    absent root after issuance, process/filesystem contradiction, unknown
    settlement, or insufficient data. Never manufacture a complete receipt,
    infer a missing staging transition, or use the root to replace missing
    process settlement.
17. Every `ACCEPTED`, `REJECTED`, or `INCONCLUSIVE` decision exhausts this
    occurrence. No decision authorizes retry, cleanup, repair, a new
    generation, or another registry request.

## Evidence separation

18. Distinguish the approved contract/static snapshot, explicit external
    authority, direct process observation, durable fixed-root observation,
    candidate review decision, future construction binding, construction,
    runtime result, and `Observed` as separate evidence classes.
19. Even an `ACCEPTED` candidate updates no source binding in this task.
    Record receipt/archive SHA-256 only in the review/status handoff for a later
    contract task. Keep both reviewed acquisition bindings `null`, runtime
    approval false, and evidence review `not-performed`.
20. Passing Docker-free static/unit checks and fixed-root validation do not
    establish lifecycle behavior, scripts execution, container behavior,
    runtime enforcement, presentation evidence, or experiment-matrix
    `Observed`.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-npm-acquisition-result.md` with one
  `ACCEPTED`, `REJECTED`, `INCONCLUSIVE`, or pre-root `BLOCKED` decision;
  exact process handoff; bounded root/inventory/mode/link/size/hash/SRI/receipt
  observations; cross-binding; findings; evidence classification; and
  cooperative-host limitations
- Minimal authoritative issue #43 status updates with the generation exhausted
  and no retry
- If accepted, only the reviewed receipt/archive SHA-256 handoff for a later
  separately reviewed construction-binding contract task
- No producer, implementation, test, manifest, lockfile, construction binding,
  result, historical evidence, Expected, or `Observed` change

# Verification

Use only Docker-free tracked-source checks and the exact fixed-path no-follow
reads above:

```sh
npm run m2a:transfer:verify
npm run m2a:verify
npm run typecheck
git diff --check
git status --short
```

Also reproduce the three-file and saved-prompt identities, exact handoff
projection, root/file metadata, archive SHA-256/SHA-512/SRI, receipt canonical
bytes/SHA-256, and cross-bindings with a bounded read-only inspector. Run
focused Prettier checking over changed Markdown. Record exact exits and test
counts.

Do not run either producer, `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`,
npm acquisition/install/pack/approve/rebuild, a lifecycle fixture, toolchain
capture, compiler, constructor, image build, Docker, transfer, construction,
runtime-result validation, cleanup, retry, Remote Git, publication, deployment,
or external communication.

# Completion report

- Decision and exact bounded findings
- Reproduced occurrence/prompt/producer identities and no-retry handoff
- Exact root/inventory/mode/link/size/hash/SRI/receipt/cross-binding
  observations without private identity values
- Process/filesystem reconciliation and evidence classification
- Preserved null construction bindings, false runtime approval,
  `not-performed` evidence, and inactive lifecycle/runtime boundaries
- Changed files and commands actually run with exits/test counts
- Commands intentionally not run, retained-state safety boundary, and
  remaining cooperative-host/external-provenance limitations
- One concrete `Next:` task: if accepted, save the separately reviewed
  construction-binding contract prompt; otherwise name only the smallest
  Docker-free record/contract follow-up, with no retry
