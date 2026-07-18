# ADR-0002: Prioritize the presentation MVP

- Status: Accepted
- Date: 2026-07-18
- Decider: project human
- Related: [Product requirements](../product-requirements.md), [presentation scope](../presentation-scope.md), [ADR-0001](0001-separate-profile-controls-from-route-evidence.md)

## Context

The repository was created to support a 20-minute TSKaigi presentation, while
also leaving room for a reusable security lab. The M3/M4 path expanded into
generic canonicalization, hostile-input hardening, repeated independent gates,
offline image bootstrapping, and cleanup-recovery machinery. That work produced
substantial static/unit assurance but did not yet produce the selected
permissive/constrained route observations, the small artifact demo, or the
presentation evidence map.

The latest recovery review passed 211 M4 tests while still finding B-16/B-17.
This is evidence that continuing the assurance loop can consume the remaining
delivery effort without completing the talk's observed evidence.

## Decision

The presentation MVP in `docs/presentation-scope.md` is the active delivery
track and supersedes earlier recorded M4 next-task clauses for scheduling.

- Freeze the existing high-assurance M4 recovery track with B-16/B-17 open.
  Keep its ordinary entry fail closed; do not activate, retry, inspect, repair,
  or delete its retained state as part of the MVP.
- Preserve ADR-0001's evidence distinction: profile-control evidence does not
  automatically become adapter route Observed. Its requirement that every route
  wait for the generic profile-control/recovery gate is no longer the delivery
  sequence.
- Collect a compact evidence inventory before implementing another runner.
- Restrict profile route evidence to the selected Vite and codegen pairs, using
  fixed same-image inputs and the existing non-negotiable safety boundary.
- Implement only the minimal build-once/digest/verify/copy/tamper artifact demo.
- Replace remediation-by-remediation presentation gates with one focused review
  of the final claim/evidence map. Existing historical review records remain
  immutable context.
- Apply strict probe/container rules through scoped agent instructions and
  runtime manifests/orchestrators. Root agent instructions retain high-level
  repository safety without treating normal documentation work as a probe.
- Separate explicitly authorized online dependency acquisition from offline
  probe, build, verification, and deploy phases.

## Consequences

- The talk can finish without closing every full-lab finding or measuring every
  matrix row.
- Existing hardening code and review documents remain available as appendix and
  future research material.
- The MVP may provide narrower assurance and fewer profile routes; the evidence
  map must display those limits rather than generalize them.
- Any future resumption of the high-assurance track requires an explicit task
  that revalidates its stale assumptions and open findings.
- The selected profile runner still requires fixed commands, same-image pairs,
  source/read-write separation, offline execution, sanitized evidence, and
  observed attempts. This decision does not waive runtime safety.

## Alternatives considered

- **Continue B-16/B-17 and the recovery execution gate.** Rejected for the active
  delivery path because it establishes image recovery machinery rather than a
  presentation claim.
- **Delete or simplify the existing high-assurance implementation in place.**
  Rejected because it would discard useful work and introduce unrelated
  regression risk.
- **Use only local adapter tests without profile evidence.** Rejected because the
  central claim concerns runtime reach, not trigger timing alone.
- **Measure every route under both profiles before writing the talk.** Deferred;
  it is useful research but unnecessary for the selected claims.

## Validation

P0 is complete when the presentation scope, milestone/workflow routing, scoped
agent rules, and phase-specific network policy are consistent and root checks
pass. P1 through P4 are validated by the observed evidence and acceptance rules
in `docs/presentation-scope.md`; they are not complete merely because static or
unit tests pass.

## Follow-up

Create `docs/presentation-evidence-inventory.md` without running Docker. Map each
claim to existing evidence, classify its evidence level, and list only the
smallest missing runtime observations.
