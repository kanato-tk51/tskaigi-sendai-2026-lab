# Goal

After a person has explicitly authorized the exact M2A-NG06 external boundary,
perform at most one frozen-research issue #43 npm `12.0.1` acquisition
occurrence for generation `20260721-01`. Reproduce the approved producer
snapshot, keep the final full-byte/hash preflight immediately adjacent to one
direct `shell: false` launch, and retain only a bounded process handoff for a
separate fixed-root result review. Do not inspect or classify the acquisition
root in this session, and never retry.

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
- `prompts/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation.md`
- `docs/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation.md`
- `prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md`
- this prompt

# Scope

- Require a current, explicit human authorization that names this saved prompt
  and covers all four M2A-NG06 effects:

  1. normal DNS and exactly the two reviewed HTTPS GET requests to
     `registry.npmjs.org`;
  2. exclusive creation and retained success/failure state only under
     `experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01`;
  3. generation consumption with no retry after one issued occurrence,
     including interruption, lost settlement, or host loss; and
  4. a later separate Docker-free read-only review of only that fixed root.

- Independently reproduce the approved tracked producer identity, import/call
  graph, request/publication/process contract, verification result, and
  unchanged evidence-state sentinels without importing or executing the
  producer.
- If and only if every precondition is exact, issue one direct lexical host
  launch:

  ```text
  executable: /usr/bin/env
  argv: [-i, --, /usr/bin/node, experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs]
  cwd: exact repository root
  environment own keys: []
  shell: false
  ```

- Capture only whether the occurrence was issued, natural exit or signal
  settlement, bounded stdout/stderr size and SHA-256, truncation state, and the
  exact raw stream only when it equals one reviewed fixed terminal line or is
  empty.
- After natural settlement or a recorded unknown-settlement boundary, write
  only the minimal authoritative process handoff and name the saved fixed-root
  result review as next.

# Out of scope

- Treating this prompt, the continuing-work standing authorization, ordinary
  dependency acquisition, Remote Git authority, or an earlier approval as the
  required explicit human authorization
- Importing or executing either producer before the final eligible occurrence
- Reading, listing, statting, creating, repairing, removing, or classifying the
  fixed acquisition root outside the producer occurrence
- Reading `/usr/bin/node` bytes, a process report, caller or host environment,
  installed package trees, home/cache state, credentials, proxy/certificate
  configuration, or retained runtime state
- Any alternate command, shell launch, inherited environment, `PATH` lookup,
  stdin, argument, URL, version, root, executable, loader, registry, request,
  redirect, proxy, retry, resume, cleanup, repair, or signal-driven recovery
- npm install/pack/approve/rebuild, lifecycle execution, toolchain capture,
  compiler/constructor execution, construction, image build, Docker/runtime
  socket, transfer, result validation, construction binding, Expected,
  `Observed`, or evidence promotion
- Loopback or Unix-socket communication, any third HTTPS request, any other
  external host, Remote Git, publication, deployment, or third-party
  communication

# Constraints

## Explicit authority gate

1. If the exact four-part human authorization is absent, ambiguous, stale, or
   refers to a different prompt revision, do not begin the occurrence. Return
   `human_required` with the exact authorization boundary; do not substitute
   standing authorization.
2. Authorization is permission for at most one eligible occurrence, not a
   claim that the candidate will succeed or become evidence. Record who or what
   session supplied the authorization without recording credentials or private
   user data.
3. Any unresolved consequential choice, prompt drift, source drift, or
   authority mismatch blocks before external communication. Do not select a
   replacement generation, path, package version, registry, executable, or
   command.

## Approved producer snapshot

4. Reproduce these exact regular, non-symlink repository paths, sizes, and
   SHA-256 values:

   | Order | Path | Bytes | SHA-256 |
   | ---: | --- | ---: | --- |
   | 1 | `experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs` | 1,166 | `bd4066ad6788aca2847c257907f91a29aec7f85d7a249d2789edbce4c9f5f7df` |
   | 2 | `experiments/npm12-install/scripts/m2a-transfer-inputs.mjs` | 112,299 | `edac896625a2b534438d4ff9cfd4f92d06a69ee902dbfb892876a72f6fd250b7` |
   | 3 | `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` | 81,269 | `578235922220093be45eee6a2d18c6f21d624f2dab4e6109562890f7693d4755` |

   The ordered
   `<lowercase-hex><two spaces><repository-relative-path><LF>` aggregate must be
   `sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.
5. Reproduce exactly one local static edge from the entry to
   `./m2a-transfer-inputs.mjs`, exactly one from that module to
   `./m2a-transfer-construction.mjs`, and none from construction. Confirm no
   dynamic/package/generated/fourth executable edge and no import-time side
   effect. Do not import the modules to make this decision.
6. Trace the acquisition call graph statically. It must not reach construction,
   child-process, compiler, archive construction, Docker, transfer, result, or
   evidence functions.
7. Reproduce the exact credential-empty two-request plan, root-first durable
   transaction, archive-before-receipt publication, fixed terminal lines,
   natural-settlement/no-retry rule, and positive-directory versus exact-one
   file-link distinction from the approved contract.
8. Confirm `reviewedAcquisitionReceiptSha256` and
   `reviewedAcquisitionTarballSha256` remain `null`,
   `runtimeExecutionApproved` remains `false`, and every relevant
   `evidenceReview` remains `not-performed`.
9. Run `npm run m2a:transfer:verify` without importing or executing the
   producer. Any nonzero result blocks the occurrence.

## Adjacent one-occurrence executor

10. Use one fixed, in-memory host orchestrator whose final preflight and child
    launch happen in the same live process. Do not save a wrapper, add a package
    script, compile, format, test, or write between them.
11. The final preflight must re-read all three complete source objects, require
    their exact regular/non-symlink path, size, SHA-256, ordered aggregate, two
    local edges, pre-producer entry guard, fixed request/publication/output
    markers, and unchanged null/false/`not-performed` sentinels. Its final
    successful operation is the full-byte/hash decision.
12. Immediately after that successful decision, the orchestrator must call a
    direct process API with the exact executable, argv, cwd, empty environment,
    and `shell: false` object above. Do not pass the producer launch through a
    shell or serialize it into a shell command. The shell, if any, used only to
    start the in-memory orchestrator is not the producer launch.
13. No command, tool call, filesystem write, repository mutation, formatter,
    test, compiler, dependency operation, root probe, or user interaction may
    intervene between the final full-byte/hash decision and the direct launch.
    Any drift or preflight failure makes the occurrence ineligible.
14. The orchestrator may issue the producer child only once. It must capture
    stdout and stderr separately with a 1,024-byte maximum per stream, retain
    overflow as a boolean, and await natural `close` settlement. It must not
    send a signal or impose a host retry/recovery path.
15. The only complete projections are:

    - natural exit `0`, stdout exactly
      `M2A_INPUT_ACQUISITION_COMPLETE\n`, and empty stderr; or
    - natural exit `1`, empty stdout, and stderr exactly
      `M2A_INPUT_ACQUISITION_FAILED\n`.

    Any signal, lost settlement, truncation, extra byte, both streams nonempty,
    exit/output mismatch, orchestrator failure after issuance, or interruption
    is `Inconclusive` and still consumes the generation. Do not inspect the root
    to refine it.
16. Before issuance, an orchestrator/preflight failure records
    `occurrenceIssued: false` and consumes no external occurrence. It still
    authorizes no automatic rerun; a new contract/authority decision is
    required. At or after issuance, record `occurrenceIssued: true` exactly
    once and prohibit every retry.

## Durable handoff

17. Do not place arbitrary child output in a status record. Record exact text
    only for the two allowed terminal lines or empty streams; otherwise record
    only bounded byte length, SHA-256, truncation, natural exit, signal/unknown
    settlement, and the `Inconclusive` projection.
18. The handoff must distinguish explicit human authority, preflight evidence,
    direct execution observation, unknown external npm bytes, durable root
    state not inspected, candidate review not performed, null construction
    bindings, inactive construction/runtime, and no `Observed` evidence.
19. Do not run any post-occurrence root, Docker, retained-state, npm, network,
    repair, cleanup, or classification command. Minimal Markdown/status writes,
    focused formatting of those records, `git diff --check`, and
    `git status --short` are allowed only after process settlement and must not
    access the ignored acquisition root.

# Deliverables

- One exact issuance or pre-issuance-block handoff recording the authority,
  approved snapshot decision, final-preflight decision, occurrence-issued
  state, bounded process settlement/output identities, and no-retry
  disposition
- Minimal authoritative issue #43 status updates that do not inspect or
  classify the fixed root
- No producer, package, manifest, lockfile, implementation, test, construction
  binding, result, historical evidence, Expected, or `Observed` change
- If and only if an occurrence was issued, the saved
  `prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md` as
  the next task; otherwise one exact human/contract blocker with no rerun

# Verification

Before the adjacency boundary, use only:

```sh
npm run m2a:transfer:verify
```

Also perform ordinary read-only path/type/size/SHA-256/aggregate, static
import/call-graph, request/publication/output, and sentinel checks over the
exact tracked allowlist. The final full-byte/hash check and direct producer
launch must be one uninterrupted in-memory orchestrator operation as specified
above.

After settlement, run only focused Prettier checking over changed Markdown,
`git diff --check`, and `git status --short`. Do not run either producer again,
`m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, npm
install/pack/approve/rebuild, a lifecycle fixture, toolchain capture, compiler,
constructor, image build, Docker, transfer, fixed-root inspection, or result
validation.

# Completion report

- Exact explicit-human authority received, or the exact missing authority
- Reproduced three-file identities/aggregate, import/call graph, contract
  sentinels, and `npm run m2a:transfer:verify` result
- Final adjacent preflight result and whether the exact direct occurrence was
  issued
- Natural exit/signal/unknown settlement and bounded stdout/stderr
  length/SHA-256/truncation/fixed-line projection
- Confirmation of no retry and no fixed-root inspection or classification
- Changed files, commands actually run, observed exits/counts, and commands
  intentionally not run
- Evidence classes, unknown npm/root facts, preserved null bindings/false
  runtime approval, and remaining cooperative-host limitations
- One concrete `Next:` item naming either the saved fixed-root result review or
  the exact authority/contract blocker
