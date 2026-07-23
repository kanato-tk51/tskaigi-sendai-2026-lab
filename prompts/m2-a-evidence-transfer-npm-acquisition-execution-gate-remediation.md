# Goal

Remediate only frozen-research issue #43 findings M2A-NGR01 and M2A-NGR02 in
the Docker-free npm-acquisition producer execution gate. Bind the exact
host-command/process authority without claiming that Node exposes the original
lexical script spelling, align the acquisition-root directory-link contract
with the existing positive-link-count production rule, and produce one
contract/static candidate for a fresh independent read-only re-review. Do not
import or execute the producer, access the fixed acquisition root or host
environment/runtime, or use external communication.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, and `experiments/AGENTS.md`
- `docs/index.md` and the complete issue #43 chain routed there
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md`, especially the resumed/deferred
  high-assurance boundary
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
- the complete issue #43 transfer, construction/execution-gate, and
  dependency-input contract/implementation/remediation/review chain routed by
  `docs/index.md`
- `docs/m2-a-evidence-transfer-npm-acquisition-execution-gate.md`
- `prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-review.md`
- `docs/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate.md`
- this prompt and its paired fresh remediation re-review prompt

# Scope

Implementation repair is limited to:

```text
experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs
experiments/npm12-install/scripts/verify-m2a-transfer-static.mjs
tests/m2a-evidence-transfer.test.ts
```

Contract and minimal status updates are limited to:

```text
docs/m2-a-evidence-transfer-npm-acquisition-execution-gate.md
experiments/npm12-install/README.md
docs/m2-a-evidence-transfer-dependency-input-boundary.md
docs/m2-a-evidence-transfer-construction-execution-gate.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
```

Resolve both findings as one bounded entry/contract/static repair:

1. Preserve the exact host launch:

   ```text
   executable: /usr/bin/env
   argv: [-i, --, /usr/bin/node, experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs]
   cwd: exact repository root
   environment own keys: []
   shell: false
   ```

   Keep the contract's displayed serialized command unchanged. Treat its
   repository-relative script token as a host-command-plan constraint, not as
   a string that Node promises to retain in `process.argv[1]`.
2. Make the producer entry reject before
   `runFixedNpmAcquisitionEntry()` unless all process-observable authority is
   exact:

   - `process.execPath === "/usr/bin/node"`
   - `process.argv0 === "/usr/bin/node"`
   - `process.argv.length === 2`
   - `process.argv[0] === "/usr/bin/node"`
   - `process.argv[1] === fileURLToPath(import.meta.url)`
   - `process.cwd()` equals the repository root derived from this entry's
     fixed `experiments/npm12-install/scripts/` location and
     `import.meta.url`
   - `Object.getOwnPropertyDescriptors(process.env)` has no own key

   Use the entry's current `M2A_INPUT_AUTHORITY_REJECTED` terminal. Do not add
   a caller-selected path, environment key, URL, version, root, executable,
   loader, shell, stdin authority, or fallback.
3. Make the contract explicitly distinguish:

   - the exact lexical host command object checked by the adjacent preflight
     and supplied directly with `shell: false`; and
   - the exact canonical executable, argv, cwd, and empty-environment state
     independently checked inside Node.

   State that the entry cannot reconstruct the pre-Node lexical spelling once
   Node has canonicalized the script path. Do not claim that an equivalent
   absolute or `./`-prefixed host token is distinguishable inside the entry.
   Such an alternate token remains ineligible because it is not the reviewed
   host command, not because the entry can observe its spelling.
4. Keep the existing self-entry test bound to the same canonical entry URL.
   The repaired guard must not make import itself execute the producer and
   must not introduce an import-time filesystem, environment, process,
   request, constructor, Docker, transfer, result, or evidence action.
5. Add focused static inverse coverage that extracts the acquisition-entry
   guard as one exact source boundary. It must reject an in-memory source
   variant that removes or weakens each executable path, original argv zero,
   canonical argv zero, argv length, canonical argv one, repository cwd, or
   empty-environment relation. A list of disconnected source markers is
   insufficient: the verifier must require the relations in the pre-producer
   guard and prove its own required substitutions fail.
6. Preserve `createHeldDirectoryChild()` and its existing production rule:
   an acquisition-root directory is valid only when its link count is a
   positive integer observation (`links >= 1`), not when it is exactly one.
   Do not change file publication: staging and final archive/receipt files
   still require `links === 1`.
7. Replace every exact-one-link claim for the acquisition-root directory in
   the contract, later candidate-review requirements, and status prose with
   the exact positive-link-count predicate. Require the observed positive
   value to remain part of each identity correlation where the current
   production boundary already compares identities. Do not invent a
   filesystem-independent exact directory link value or weaken file-link
   checks.
8. Add function-scoped static inverse coverage proving
   `createHeldDirectoryChild()` rejects a zero link count, admits positive
   directory link counts, and does not use the regular-file
   `links !== 1` predicate for the created directory. Ensure an in-memory
   replacement of the positive predicate with an exact-one predicate fails
   verification while the existing file exact-one checks remain required.
9. After the entry changes, recompute all three exact executable-closure
   sizes/SHA-256 values and the ordered aggregate over
   `<lowercase-hex><two spaces><repository-relative-path><LF>` rows. Update
   only the contract's current source-identity table/aggregate and status
   summaries that quote them. Preserve the exact two-local-edge import graph
   and closed acquisition call graph.

# Out of scope

- Editing `m2a-transfer-inputs.mjs`, its declaration, the toolchain producer
  entry, construction source/declaration, package scripts, lockfiles,
  manifests, Containerfiles/container source, adapters/probes/packages,
  fixtures, scenarios, historical/results, Expected, or `Observed`
- Importing or executing either producer; reading, listing, statting, or
  creating the fixed acquisition/toolchain/construction/result roots; reading
  the host Node executable, process report, installed packages, environment,
  home/cache, credentials, proxy/certificate configuration, or retained
  runtime state
- DNS, external/loopback/Unix-socket communication, npm acquisition,
  install/pack/approve/rebuild, lifecycle execution, child processes,
  compiler/constructor execution, image build, Docker/runtime socket,
  transfer, candidate/result validation, cleanup, repair, retry, signaling,
  Remote Git, publication, deployment, or third-party communication
- Reopening M2A-NG02, M2A-NG04, M2A-NG05, or M2A-NG06 without a newly
  reproduced contradiction; changing request plans, publication files,
  receipt bytes, process terminals, no-retry disposition, later candidate
  review, or explicit-human external authority
- Updating reviewed construction bindings, accepting npm bytes, approving the
  external occurrence, using standing authorization for it, or promoting
  evidence

# Constraints

- The host command and entry guard are complementary authorities. Do not turn
  Node's canonical script path into a false claim about original lexical argv.
- Derive repository cwd only from the fixed entry module location; do not use
  a caller environment key, package discovery, Git, home, or an arbitrary
  upward search.
- All guards must run before the acquisition function. Static verification
  must fail if any guard can be moved after that call.
- Keep the executable closure at exactly the same three repository-local
  paths and preserve the two current local import edges. Do not add a wrapper,
  package entry, dynamic loader, generated file, or fourth executable source.
- Preserve the cooperative Linux/`x64`/Node.js `v20.18.2` limitation. The
  guard does not bind executable, loader, trust-anchor, DNS, registry, kernel,
  or hostile same-authority bytes.
- A positive directory link count is a precise accepted predicate, not proof
  of directory authenticity. Preserve no-follow, mode, owner, identity,
  inventory, held-descriptor, and retention constraints already present.
- Passing verification remains Docker-free static/unit cooperative-host
  evidence. It is not an external occurrence, accepted npm input,
  construction, Docker/runtime result, or `Observed` evidence.
- Keep both reviewed acquisition construction bindings `null`,
  `runtimeExecutionApproved: false`, and every `evidenceReview` value
  `not-performed`.
- Standing authorization is not used in this remediation and cannot authorize
  the later external occurrence.

# Deliverables

- Exact producer-entry process authority for executable, canonical argv, cwd,
  and empty environment, with the lexical-host/canonical-Node distinction
- Exact positive-link-count acquisition-root contract while preserving
  exact-one regular-file publication rules
- Focused static inverse coverage for every repaired entry guard and the
  directory/file link-rule distinction
- Fresh three-file sizes, SHA-256 values, and ordered aggregate after the
  entry repair
- Remediated execution-gate contract resolving only M2A-NGR01/M2A-NGR02 and
  minimal status updates naming the fresh independent re-review as next

# Verification

Run only:

```sh
npm run m2a:transfer:verify
npm run m2a:verify
npm run typecheck
npm test
npm run check
git diff --check
git status --short
```

Also run focused Prettier checking over the exact implementation/contract
allowlists, this saved prompt pair, and changed status files. Recompute the
three source identities and ordered aggregate with ordinary read-only
source-file hashing. Record aggregate failures exactly without repairing
unrelated files.

Do not run either producer, `m0:doctor`, `m0:build`, `m0:run`, `m0:verify`,
npm acquisition/install/pack/approve/rebuild, a lifecycle fixture, compiler,
constructor, image build, Docker, transfer, fixed-root inspection, or result
validation.

# Completion report

- M2A-NGR01 exact host/process authority and lexical/canonical distinction
- M2A-NGR02 positive directory-link rule and preserved exact-one file rules
- Static inverse coverage and fresh three-file identity/aggregate
- Resulting M2A-NG01 through M2A-NG06 contract-scope status
- Preserved transport, publication, process/result, no-retry, external
  authority, construction-binding, and evidence boundaries
- Changed files and commands actually run with observed results
- Intentionally unrun commands, preserved unrelated work, cooperative-host
  limitations, and evidence class
- Confirmation that no producer, fixed root, host environment/runtime,
  external communication, npm candidate, construction, Docker, runtime/result,
  or `Observed` evidence was accessed or produced
- One concrete `Next:` task naming the fresh independent Docker-free re-review
  under
  `prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation-review.md`
