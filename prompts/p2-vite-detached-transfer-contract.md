# P2 Vite detached lifecycle / transfer contract

## Objective

Define the smallest Docker-free contract that can distinguish and safely carry
the lifecycle facts between `child-launched` and `child-settled` for a fresh P2
selected-Vite measurement generation. The contract must remove the evidence
path's dependence on a long-running `docker start --attach` stream without
weakening fail-closed, offline, credential-empty, fixed-input, bounded-output,
or same-image requirements.

This task is diagnosis and contract design only. Do not implement or execute
the experiment.

## Fixed generation identity

- generation: `20260720-02`
- expected contract: `p2-vite-expected-20260720-02`
- permissive run/root: `p2-vite-observe-p-20260720-02`
- constrained run/root: `p2-vite-observe-c-20260720-02`
- permissive container: `tskaigi-p2-vite-observe-p-20260720-02`
- constrained container: `tskaigi-p2-vite-observe-c-20260720-02`

All earlier P2 run IDs, roots, containers, receipts, progress prefixes, and
result files are immutable historical evidence. The new contract must reject
their reuse.

## Required analysis

1. Explain precisely why the previous attached-start transfer could establish
   `child-launched` but not `child-settled`, keeping Docker CLI/container,
   runner, and child-process settlement as separate facts.
2. Specify an exact detached start, bounded settlement, and post-settlement
   transfer sequence suitable for later independent review. Do not authorize
   evidence reads before the applicable settlement predicates hold.
3. Specify a durable, run-owned, fixed-path progress artifact independent of
   stdout/stderr and raw container logs. Define its schema, allowed values,
   ordering, maximum bytes/records, ownership/mode expectations, symlink and
   file-type checks, atomicity or append semantics, and failure behavior.
4. Define the minimum sanitized stages needed to localize the interval from
   child launch through normal exit or bounded termination. Consider, but do
   not automatically adopt, facts such as watch armed, deadline reached,
   terminate sent, force sent, close observed, and process group absent.
5. Define which predicates establish container/CLI settlement, runner
   settlement, and child settlement. A progress prefix alone must never create
   a receipt or an `Observed` result.
6. Preserve the permissive-first rule. Constrained execution remains forbidden
   until permissive evidence is complete and reviewable.
7. State exact fixed bounds and failure classes. Increasing a timeout, replaying
   a run, or collecting unrestricted/raw output is not a remediation.
8. Map the proposed contract to the existing P2 acceptance criteria and list
   every implementation, unit/static verification, staging, gate, execution,
   and result-review step still required.

## Safety boundary

- Follow the root and nested `AGENTS.md` files.
- Do not invoke Docker or access a Docker/runtime socket.
- Do not run a lifecycle fixture, probe, build, verification, or deploy
  simulation.
- Do not create either new result root or container.
- Do not access staging inputs.
- Do not access credentials, credential stores, environment secrets, or the
  external network.
- Do not mutate the completed `20260720-01` generation or any earlier attempt.
- Do not claim runtime evidence, receipts, matrix promotion, or `Observed`.
- Do not resume M4 or another frozen research track.

## Deliverable

Create `docs/p2-vite-detached-transfer-contract.md` as the authoritative
Docker-free diagnosis and proposed exact contract. Update the active P2 records
only as needed to point to that document and to name one concrete next task:
an independent Docker-free review of the proposed contract.

Report changed files, commands run, observed results, remaining limitations,
and the concrete `Next:` item required by the repository instructions.
