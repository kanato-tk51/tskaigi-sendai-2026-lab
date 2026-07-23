# Goal

Perform a fresh independent Docker-free read-only review of frozen-research
issue #43's M0/M2-A construction and execution-gate contract. Decide whether
M2A-CG01 through M2A-CG06 close the complete source/acquisition/context/image/
entry identity chain while preserving every reviewed transfer boundary. Do not
repair the contract, implement a constructor or production entry, acquire npm,
construct a context or image, call Docker, execute lifecycle/transfer code, or
access result/retained state.

# Read first

- root `AGENTS.md`, `packages/AGENTS.md`, `experiments/AGENTS.md`, and
  `containers/AGENTS.md`
- `docs/index.md` and the issue #43 documents routed there
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md`'s deferred high-assurance boundary
- `docs/milestones.md`'s M0, M2-A, and frozen-research sections
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
- this prompt

# Review target

Review only the proposed construction/execution-gate contract, this saved
review prompt, its minimal five status records, and the repository-controlled
source needed to reproduce the fixed boundaries. Preserve unrelated M3, M4,
presentation, and user working-tree changes. Treat every hash, identity,
absence, reachability, and future approval statement as a claim to verify.

# Required decision

1. **M2A-CG01:** reproduce the fixed tuple, 31-row aggregate, exact ordered
   41-row baseline and aggregate, pinned base, immutable historical exclusion,
   and acquisition non-authority. Confirm the npm distribution is not silently
   sourced from a global cache, home, historical image/result, caller input, or
   runtime network. Decide whether the future receipt has enough exact fields
   to bind one independently reviewed npm `12.0.1` tarball before construction.
2. **M2A-CG02:** trace every Containerfile `COPY` source to exactly one
   constructed context family. Check the compile, npm archive parsing,
   deterministic fixture tar, path/type/link/mode/mtime/byte rules, held-input
   and close settlement, full lexical manifest, clean derivation, and sole
   publication commits. Reject a contract that can omit or add a build-context
   byte, trust caller projections, access a prohibited path, or publish success
   before all fallible work settles.
3. **M2A-CG03:** verify the later image phase is offline, credential-empty,
   argument-free, one-build/no-retry, fixed-base/tag/context/Containerfile, and
   unable to reach runtime operations. Confirm the successful binding packet
   must contain the complete context aggregate and exact local `sha256:` image
   ID and remains `runtimeExecutionApproved: false` pending another review.
4. **M2A-CG04:** reproduce the three separate no-argument phase entries and the
   exact existing Docker state-machine order. Confirm import safety, phase
   non-reachability, fixed image-ID adoption, exact object absence, natural
   settlement, completion-first conditional copy, chronological first issue,
   and no fallback/retry/cleanup/alternate identity.
5. **M2A-CG05:** confirm acquisition, static/unit construction evidence, a
   Docker build observation, candidate execution, and accepted result remain
   distinct. No contract statement may promote historical M0/M2-A, M3,
   profile/matrix/presentation, or `Observed` evidence.
6. **M2A-CG06:** confirm the later implementation allowlist is closed and its
   negative matrix covers every authority, identity, archive, context,
   publication, image, command, settlement, phase, retry, and evidence bypass.
   The existing Containerfile, manifest, container sources, package scripts,
   adapter/probe source, fixtures, scenarios, results, and Expected/Observed
   bytes must remain outside that implementation delta.

# Review method and safety boundary

- Use read-only repository-controlled source inspection and in-memory hash/
  inventory calculations only.
- Recompute the ordered 31-row and 41-row aggregates; inspect all current
  Containerfile copy sources, fixed plan values, manifest identities, and
  verification-only package reachability.
- Run focused Prettier checking over only the proposed contract, this review
  prompt, and five changed status records, plus `git diff --check`. No test run
  is required for this documentation-only proposal; if any static/unit command
  is run, report it exactly and do not treat it as construction evidence.
- Do not read ignored acquisition/construction/result roots or retained state.
  Do not inspect host home/environment, npm caches, credentials, runtime
  sockets, Docker state, or historical result contents.
- Do not run npm pack/install/approve/rebuild, a compiler build, a lifecycle
  entry, adapter, probe, constructor, production entry, Docker/container
  command, transfer, cleanup, Remote Git, publication, deployment, external
  network, or third-party communication.

# Decision boundary

The maximum positive decision closes M2A-CG01 through M2A-CG06 only at
contract scope and approves one bounded Docker-free static/unit implementation
under M2A-CG06. It does not approve dependency acquisition, construction,
image build/inspect, exact local image acceptance, Docker execution, standing
authorization, result access/review, evidence acceptance, M3 ingestion,
profile/matrix/presentation evidence, or `Observed`.

A `BLOCKED` decision must name the smallest contract remediation. Do not defer
an exact design choice to the implementer or use later runtime observation to
paper over a source/acquisition/context/image/entry identity gap.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-construction-execution-gate.md` with an
  `APPROVED` or `BLOCKED` decision, M2A-CG01 through M2A-CG06 statuses,
  reproduced identities, findings, commands actually run, evidence-class
  limits, and one permitted next boundary
- minimal status updates in `docs/m2-a-evidence-transfer-contract.md`,
  `docs/m2-a-npm-lifecycle-adapter.md`, `docs/index.md`,
  `docs/milestones.md`, and `docs/frozen-research-execution-plan.md`
- one concrete `Next:` item

# Completion report

- Decision and M2A-CG01 through M2A-CG06 status
- Reproduced source/acquisition/context/image/entry identity chain and
  preserved transfer/evidence boundaries
- Changed files and commands actually run
- Intentionally unrun commands, remaining limitations, and exact next boundary
