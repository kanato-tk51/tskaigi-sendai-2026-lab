# P4 evidence map focused final review

## Goal

Perform one fresh independent Docker-free, read-only safety/validity review of
the P4 tracked sanitized examples, deterministic generator/check, three talk
tables, and C-01 through C-07 evidence map. Decide whether the presentation MVP
completion criteria are met without promoting missing, Inconclusive, local, or
static evidence.

## Read first

- `AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/presentation-evidence-inventory.md`
- `docs/evidence-map.md`
- `docs/product-requirements.md`
- `docs/milestones.md`
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- `docs/artifact-pipeline.md`
- `docs/reviews/presentation-evidence-inventory.md`
- `docs/reviews/p2-selected-profile-codegen-receipts.md`
- `docs/reviews/p2-selected-profile-vite-failure.md`
- `docs/reviews/p3-artifact-demo-result.md`
- `results/examples/README.md`
- `results/examples/presentation-mvp/README.md`
- `results/examples/presentation-mvp/routes.json`
- `results/examples/presentation-mvp/profiles.json`
- `results/examples/presentation-mvp/artifact.json`
- `scripts/presentation-evidence.mjs`
- `scripts/presentation-evidence.d.mts`
- `tests/presentation-evidence.test.ts`

## Review boundary

- Review the current P4 candidate bytes and repository-tracked source records.
- Do not open, stat, enumerate, copy, re-permission, or mutate
  `results/runs/**` or another ignored/retained runtime tree.
- Do not run P2/P3 production commands, Docker, a probe, a lifecycle fixture,
  an artifact build, dependency acquisition, deployment, external network,
  remote Git, publication, or third-party communication.
- Do not inspect credentials, home directories, runtime sockets, or retained M4
  state.
- Treat configuration intent, static/unit evidence, local adapter evidence,
  Observed, Inconclusive, not-inspected, and missing as separate classes.
- The review may add only its review record and the smallest authoritative
  status/handoff metadata. Do not remediate an implementation finding in the
  review session.

## Required checks

1. Reproduce the exact generator/check relationship between the three tracked
   JSON projections and `docs/evidence-map.md`.
2. Confirm that the document contains exactly one five-route table, one
   selected profile/capability table, and one artifact result table.
3. Confirm that C-01 through C-07 each link to eligible tracked evidence and
   display the limitation required by the presentation scope.
4. Reconcile every route count and direct/tool-API distinction with the P1
   inventory/review without reading ignored adapter roots.
5. Reconcile all five codegen capability outcomes with the accepted exact
   same-image pair and keep source hash outside the capability denominator.
6. Confirm that every Vite capability remains `not-inspected` or `missing`, no
   constrained attempt or same-image pair is implied, and the attempt is only
   Inconclusive.
7. Reconcile build count 1, separate digest verification, zero deployment
   builds, cross-copy identity, exactly one changed byte, and rejection before
   copy with the accepted P3 review.
8. Confirm that the unsigned-receipt, identity-not-harmlessness,
   no-OS-egress-evidence, exact-local-scope, and cross-machine limitations stay
   visible next to the relevant claim/table.
9. Check that tracked examples contain no ignored-root citation, raw canary,
   raw content, host absolute path, credential, unsanitized error/output, PID,
   timestamp, or duration.
10. Decide `APPROVE` or record each blocking/non-blocking finding precisely.

## Verification

Run only ordinary offline development checks:

```sh
npm run p4:verify
npm run check
git diff --check
git status --short
```

Do not run `npm run p4:generate` unless independently proving a mismatch in a
disposable comparison; the tracked candidate must remain unchanged during the
read-only review.

## Deliverable and handoff

Create `docs/reviews/p4-evidence-map.md` with the target, decision, findings,
claim-by-claim assessment, sanitization/table assessment, exact commands and
observed results, remaining limitations, and next task. If approved, update the
authoritative presentation records to mark P4 and the presentation MVP
complete, with `Next: none` unless a concrete in-scope deliverable remains. If
blocked, name only the smallest coherent remediation task; do not create a
remediation-specific review loop for non-critical appendix code.
