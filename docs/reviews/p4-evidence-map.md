# P4 evidence map focused final review

## Review target and decision

- Target: the current P4 tracked sanitized projections, deterministic
  generator/check, three generated talk tables, and C-01 through C-07 evidence
  map
- Review type: fresh independent Docker-free read-only safety/validity review
- Decision: **APPROVE; P4 and the presentation MVP are complete**
- Blocking findings: none
- Non-blocking findings: none
- Experiment-matrix Observed: unchanged
- Next: none

The three tracked JSON projections reproduce `docs/evidence-map.md` exactly and
retain the reviewed evidence classes without promoting the Inconclusive M0 or
Vite attempts, local adapter observations, static/unit evidence, or missing
Vite outcome. The generated document contains exactly the required five-route,
selected-profile/capability, and artifact-result tables. Every C-01 through
C-07 section links eligible tracked evidence and displays its material
limitation.

Review-owned changes are this record and the smallest authoritative
completion/status metadata. No implementation, tracked projection, source
record, Expected value, Observed value, matrix cell, or runtime result was
remediated or changed. This independent Codex review is not a separate human
review. The `continue-repository-work` standing authorization was not needed
because the review and its verification were ordinary non-executing work.

## Claim-by-claim assessment

| Claim | Review result | Evidence and retained boundary |
|---|---|---|
| C-01 | Accepted | The five-route table matches the reviewed P1 projection: M0 remains overall Inconclusive with only its version-specific marker counts, while ESLint, Vitest, Vite, and codegen remain fixed local adapter evidence. |
| C-02 | Accepted with displayed gap | Trigger metadata is separated from privilege. Only the exact codegen pair supplies an accepted profile comparison; Vite has no capability receipt or constrained attempt. |
| C-03 | Accepted | The table retains exactly environment, file read, direct write, loopback, and fixed child as separate capability outcomes. The successful source-hash integrity attempt stays outside that denominator. |
| C-04 | Accepted with displayed gap | The exact one-local-pair codegen evidence remains `same-image`; it is not generalized to repeated reproducibility or a general sandbox. The selected Vite pair is explicitly missing rather than inferred. |
| C-05 | Accepted | The reviewed ESLint, Vite, and codegen local facts continue to distinguish direct markers/writes from fixer, in-memory/bundle, and generator API changes. |
| C-06 | Accepted | The artifact table retains one build invocation, separate verification, copy with zero deployment builds, cross-copy byte identity, and rejection before copy after exactly one changed byte. |
| C-07 | Accepted | Semantic harmlessness, unsigned-receipt authenticity, no-OS-egress-evidence, SLSA/in-toto, exact-local-scope, and cross-machine limitations remain adjacent to the artifact evidence. |

## Table, generator, and source-record assessment

- Exact regeneration from `routes.json`, `profiles.json`, and `artifact.json`
  matched the tracked Markdown byte-for-byte.
- The generated Markdown contains three and only three table separator rows:
  one five-route table, one five-capability/profile table, and one four-stage
  artifact table.
- Route order, counts, trigger labels, direct/tool-API descriptions, and
  evidence classes match the P1 inventory and independent review.
- All five codegen permissive outcomes are `success`; the constrained reasons
  are exactly `ENVIRONMENT_VARIABLE_ABSENT`, `READ_DENIED`, `WRITE_DENIED`,
  `NETWORK_FAILURE`, and `CHILD_PROCESS_FAILURE`.
- Every Vite permissive capability remains `not-inspected`, every constrained
  capability remains `missing`, and the pair remains Inconclusive with no
  same-image or selected-profile Observed claim.
- The artifact projection matches the accepted P3 result review: build count
  one, separate digest verification, zero deployment builds, identical
  handoff/verification/deployment bytes, exactly one changed tamper byte, and
  `rejected-before-copy`.
- Every repository-relative `sourceRecords` target exists. No source record
  cites `results/runs/**`.

## Sanitization and safety assessment

The three tracked JSON files and generated evidence map contain no ignored-root
citation, host absolute path, raw canary key/value, credential field, raw
content, stdout/stderr field, unsanitized error, PID/PPID field, timestamp, or
duration. The retained run/build IDs and SHA-256 values are the reviewed bounded
identity fields, not credentials or raw runtime content.

The review did not open, stat, enumerate, copy, re-permission, or mutate an
ignored/retained runtime tree. It did not run P2/P3 production commands,
Docker, a probe, a lifecycle fixture, an artifact build, deployment,
dependency acquisition, external network, remote Git, publication, credential
access, home-directory access, runtime-socket access, or third-party
communication.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Independent exact-file Node assertion | An initial reviewer-authored assertion exited 1 because its limitation search omitted the artifact evidence-class field that contained `exact one-local-run scope`; no file was changed. The corrected assertion exited 0 and reproduced exact generation, three tables, seven evidence/limitation pairs, reviewed route/profile/artifact values, source-link existence, and bounded sanitization. |
| `npm run p4:verify` | Exit 0; exact regeneration passed and 1 focused file / 2 tests passed. |
| `npm run check` | Exit 0; formatting, lint, typecheck, and 101 files / 689 tests passed. |
| `git diff --check` | Exit 0 after the review record and completion metadata were finalized. |
| `git status --short` | Captured the existing uncommitted presentation-MVP work plus this review record and completion metadata; no unrelated change was reverted. |

## Remaining limitations

- M0 remains an overall Inconclusive, version-specific marker observation.
- The four tool rows are reviewed local adapter evidence, not profile or matrix
  Observed.
- Codegen profile evidence is one exact local same-image pair; it does not prove
  repeated-run reproducibility, arbitrary isolation, or a general sandbox.
- The Vite attempt remains Inconclusive with permissive evidence
  `not-inspected`, no constrained attempt, no same-image pair, and no selected
  Vite profile Observed evidence.
- P3 is one exact local run. Its unsigned receipt and digests establish bounded
  byte identity and recorded inputs, not semantic harmlessness, authenticity
  against joint replacement, OS-level egress enforcement, SLSA/in-toto
  compliance, or cross-machine reproducibility.

Next: none
