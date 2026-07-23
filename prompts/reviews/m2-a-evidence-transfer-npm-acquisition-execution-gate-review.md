# Goal

Perform a fresh independent Docker-free read-only review of frozen-research
issue #43's npm-acquisition producer execution-gate contract. Decide
M2A-NG01 through M2A-NG06 and whether only the exact one-occurrence candidate
may become eligible after separate explicit human authorization. Do not
execute or import the producer, inspect or create the fixed acquisition root,
access the host environment or Node executable, or use external
communication.

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
- the complete issue #43 transfer and construction/execution-gate contract,
  implementation, remediation, and review chain routed by `docs/index.md`
- `docs/m2-a-evidence-transfer-dependency-input-boundary.md`
- its complete contract/remediation/implementation/review chain
- `docs/reviews/m2-a-evidence-transfer-dependency-input-boundary-implementation-identity-verification-remediation.md`
- `docs/m2-a-evidence-transfer-npm-acquisition-execution-gate.md`
- the exact three-file executable closure named by that contract
- the existing M2-A transfer static verifier and focused test, without
  importing either producer entry
- this prompt

# Scope

Review only the proposed producer execution-gate contract, this saved review
prompt, its minimal status records, and tracked repository source needed to
reproduce the fixed boundary. Treat every source hash, import edge, call-graph
exclusion, command, transport, publication, settlement, and future authority
statement as a claim to verify.

Preserve all unrelated accumulated worktree changes and every immutable prior
review record. The only permitted repository writes are:

```text
docs/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate.md
experiments/npm12-install/README.md
docs/m2-a-evidence-transfer-npm-acquisition-execution-gate.md
docs/m2-a-evidence-transfer-dependency-input-boundary.md
docs/m2-a-evidence-transfer-construction-execution-gate.md
docs/m2-a-evidence-transfer-contract.md
docs/m2-a-npm-lifecycle-adapter.md
docs/index.md
docs/milestones.md
docs/frozen-research-execution-plan.md
```

# Out of scope

- Editing implementation source/declaration, static verifier, tests, this
  review prompt, package scripts, lockfiles, manifests,
  Containerfiles/container source, adapters/probes/packages, fixtures,
  scenarios, historical/results, Expected, or `Observed`
- Importing or executing either input producer; reading, listing, statting, or
  creating the acquisition/toolchain/construction/result roots; reading
  `/usr/bin/node`, a process report, installed package bytes, environment,
  home/cache, credentials, proxy or certificate configuration, or retained
  runtime state
- DNS, external/loopback/Unix-socket communication, npm acquisition,
  install/pack/approve/rebuild, lifecycle execution, child processes,
  compiler/constructor execution, image build, Docker/runtime socket,
  transfer, result validation, cleanup, repair, retry, signaling, Remote Git,
  publication, deployment, or third-party communication
- Approving the external occurrence, substituting standing authorization,
  choosing observed npm integrity/digests/identities, updating construction
  bindings, accepting a candidate, or promoting evidence

# Required decisions

## M2A-NG01 — exact source and invocation identity

1. Recompute the exact size and SHA-256 of all three ordered executable
   closure paths and their aggregate. Reject any missing, extra, reordered,
   generated, ignored, package, or dynamic executable edge.
2. Derive the complete static import graph. Confirm the entry has only the
   input-library local edge, the input library has only the construction local
   edge, and the construction module has no local import.
3. Inspect import-time reachability and the production acquisition call graph.
   Confirm no constructor, compiler, child-process, archive-construction,
   Docker, transfer, result, producer, or evidence action occurs on import or
   is reachable from the acquisition entry.
4. Confirm the entry rejects every argv shape except the fixed no-argument
   script process and rejects every environment own key before calling the
   producer.
5. Assess the Linux/`x64`/Node.js `v20.18.2` cooperative-host floor, exact
   adjacency preflight, unbound executable/loader/trust-anchor bytes, and
   same-UID/host limitation. A positive decision must not silently turn those
   limitations into hostile-host guarantees.

## M2A-NG02 — credential-empty transport

6. Reproduce the exact `/usr/bin/env -i -- /usr/bin/node ...` serialized
   launch and the resulting Node executable/argv/cwd/empty-environment/stdin
   contract. Confirm no caller `PATH`, interpolation, inherited key, npm
   configuration, home/cache, proxy, certificate override, credential, token,
   cookie, stdin, URL, version, or root becomes authority.
7. Reproduce the exact ordered metadata/tarball HTTPS plans, hostname/TLS
   server name/port/TLS floor/headers/content rules, DNS boundary, no
   redirect/proxy/reuse/retry, and no third request or child.
8. Trace the request state machine through deadline, destroy grace,
   request/response close, status/header/length/size/EOF, write-chain, and
   terminal settlement. Confirm late success cannot replace an earlier
   failure.
9. Confirm metadata exactness and archive SRI/SHA-256/length correlation while
   preserving actual registry values as unknown candidate observations.
   Explicitly assess the unpinned certificate/DNS/CDN and registry-SRI trust
   limitations.

## M2A-NG03 — durable occurrence and publication

10. Prove the final root exclusively commits before DNS/request activity and
    that a present/uncertain root stops without inspection or communication.
11. Trace known no-create, process loss before/at/after commit, every request
    and publication failure, and fresh-invocation behavior. Confirm no
    automated or gate-authorized second occurrence exists even when a known
    pre-commit failure leaves no root.
12. Reproduce the archive and receipt staging names, exact transaction order,
    held descriptor/identity/mode/link/owner rules, same-descriptor reread,
    sync/close/rename/root-sync settlement, exact final inventory, and
    retention-only failure disposition.
13. Reproduce canonical receipt schema/key order/fixed values and exact
    cross-binding to the held archive observations. Confirm visibility never
    changes `evidenceReview` or the null reviewed construction bindings.

## M2A-NG04 — process settlement and no retry

14. Trace exact stdout/stderr/natural-exit terminals and every contradiction:
    signal, lost settlement, write failure, both streams, extra/truncated
    output, tool failure, exit/output mismatch, and externally interrupted
    process. Confirm each is Inconclusive and never retryable.
15. Decide whether the in-process request deadlines plus the cooperative local
    filesystem assumption are bounded honestly. Do not claim a hostile-kernel,
    machine-crash, or atomic process/filesystem transaction.
16. Confirm the execution session records only bounded process settlement and
    never inspects or classifies the root.

## M2A-NG05 — result and evidence separation

17. Reproduce the exact later read-only result-review requirements: fixed-root
    identity/inventory, staging absence, archive hash/SRI/size, canonical
    receipt hash/bytes, cross-binding, and process/filesystem agreement.
18. Confirm contract, static/unit result, explicit external occurrence,
    process projection, durable candidate, candidate review, construction
    binding, construction, runtime result, and `Observed` remain distinct.
19. Confirm no historical M0/M2-A result, retained state, ordinary
    dependency/cache/home source, future toolchain, or construction/result
    root can fill or approve the candidate.

## M2A-NG06 — authority boundary

20. Confirm a positive contract review can only name the adjacent preflight
    and exact one-occurrence candidate, not execute or authorize it.
21. Confirm explicit human authorization must separately cover the two HTTPS
    requests/DNS, one fixed-root commit and retained failures, generation
    consumption/no retry, and later read-only root review.
22. Confirm continuing-work standing authorization, ordinary development
    dependency acquisition, Remote Git authority, or any earlier approval
    cannot substitute for that explicit external-communication authorization.
23. If blocked, assign only the smallest exact contract contradiction and
    permit no source repair or execution. If approved, close only
    M2A-NG01 through M2A-NG06 at contract scope and return a human handoff for
    the exact external occurrence only after every other safe recorded task is
    exhausted.

# Review method and safety boundary

- Use only tracked repository source/documentation inspection and in-memory or
  ordinary source-file hash calculations.
- Do not run a command that imports either producer entry. The existing
  `npm run m2a:transfer:verify` is permitted only after independently
  confirming its static/test closure excludes producer import/execution and
  fixed-root/network access.
- Run focused Prettier checking over the proposed contract, this prompt, the
  new review record, and changed status files, plus `git diff --check`.
- Preserve expected behavior, static/unit evidence, a future external
  occurrence, candidate bytes, accepted input, runtime result, and `Observed`
  as distinct evidence classes.

# Deliverables

- `docs/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate.md` with
  an `APPROVED` or `BLOCKED` decision; M2A-NG01 through M2A-NG06 status;
  independently reproduced source/import/call-graph, transport, occurrence,
  publication, process, result, and authority analysis; commands; limitations;
  and one exact next boundary
- Minimal authoritative status updates only after the decision
- One concrete `Next:` item

# Completion report

- Decision and M2A-NG01 through M2A-NG06 status
- Reproduced three-file identity/aggregate and executable closure
- Reproduced credential-empty two-request transport and exact limitations
- Reproduced root-first one-shot transaction, process terminals, and no-retry
  disposition
- Preserved candidate/result/construction/evidence separation
- Changed files and commands actually run with observed results
- Intentionally unrun commands, cooperative-host/external limitations, and
  preserved unrelated work
- Confirmation that no producer, fixed root, host environment/runtime,
  external communication, npm bytes, construction, Docker, runtime/result, or
  `Observed` evidence was accessed or produced
- If approved, an exact human-authorization handoff without claiming
  execution authority; if blocked, only the smallest contract remediation
