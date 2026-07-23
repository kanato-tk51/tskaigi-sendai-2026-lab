# Goal

Freshly and independently perform a Docker-free read-only result review of the
exact selected Vite `20260723-01` init/reaping one-shot outcome. Decide whether
to accept or reject the two candidate receipts, their same-image pair, and any
smallest corresponding tracked presentation projection. Do not rerun, repair,
or call Docker.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/presentation-evidence-inventory.md`
- `docs/p2-selected-profile-contract.md`
- `docs/p2-vite-completion.md`
- `docs/p2-vite-init-reaper-contract.md`
- `docs/reviews/p2-vite-init-reaper-contract.md`
- `docs/reviews/p2-vite-init-reaper-implementation.md`
- the five historical selected-Vite result reviews cited by
  `docs/p2-vite-completion.md`, without accessing their ignored result roots
- `docs/milestones.md` selected-Vite addenda
- `docs/codex-workflow.md`
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- `prompts/reviews/p2-vite-init-reaper-implementation-review.md`
- this prompt

# Fixed execution handoff

The one approved argument-free `npm run p2:execute:vite` invocation exited 0
and was not retried. Standing authorization covered that already reviewed
fixed occurrence; it was not a separate human review. The execution worker did
not inspect or classify either result root after the invocation.

The exact bounded direct stdout line is:

```json
{"status":"completed","pair":{"schemaVersion":"p2-vite-pair/v4","expectedRevision":"p2-vite-expected-20260723-01","validity":"same-image","imageId":"sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0","progressTrust":"repository-cooperative-fixture","issues":[]},"scenarios":[{"scenarioId":"vite-observe-p","profileId":"permissive","completion":"complete","attemptRecord":"written","evidence":"inspected","receipt":"written","validity":"matches-expected","issues":[]},{"scenarioId":"vite-observe-c","profileId":"constrained","completion":"complete","attemptRecord":"written","evidence":"inspected","receipt":"written","validity":"matches-expected","issues":[]}]}
```

With its one trailing LF, the line is exactly 684 bytes with SHA-256
`683b78cd5f181e083657c76382eb94612ccdb989cea1bc8efe6075d9b6997aac`.
Treat it as an unreviewed direct projection until independently reconstructed
from fixed records and approved pure projectors.

The execution preflight reproduced:

- the ten tracked candidate SHA-256 identities in
  `docs/reviews/p2-vite-init-reaper-implementation.md`;
- the exact 128-file source-equal regular non-symlink staging closure with
  declared `0444`/`0555` modes and plan-order manifest SHA-256
  `8803f5b5cec7dedb2168a03087f9e574f1d380e81602ebc2c8d722783859bd20`;
- staged Vite/Rollup/esbuild versions `6.4.3` / `4.62.2` / `0.25.12`;
- the exact package script
  `npm run p2:build && node containers/presentation-profiles/runner/vite-executor-entry.js`;
  and
- absence of only the two exact new roots before execution.

# Exact review roots and paths

Bind this review only to these two roots without enumerating their parent or
any historical result root:

- `results/runs/p2-selected-profiles/p2-vite-observe-p-20260723-01`
- `results/runs/p2-selected-profiles/p2-vite-observe-c-20260723-01`

Within each exact root, use no-follow bounded reads and inspect only the root's
bounded name/mode inventory plus these contract-fixed paths:

- `attempt.json`
- `summary.json`
- `progress/runner-progress.json`
- `progress/runner-progress.next`
- `result/vite-coordinator.jsonl`
- `direct-write/direct-write-marker.json`
- `tool/out`
- `tool/out/entry.js`
- `docker-config/config.json` only to confirm the fixed credential-empty
  content and mode if the root inventory requires it

Do not inspect `tool/canary`, arbitrary descendants, any raw canary value, or
any path not fixed above. Do not print or copy raw event bytes. The bounded
event parser may read each exact event segment only to reconstruct its
sanitized projection.

# Review scope

- Reproduce all ten approved tracked candidate hashes, the exact package
  script, source-equal staging inventory/modes/manifest/versions, and compiled
  import safety without executing an entry or rebuilding staging.
- Independently establish the exact type, no-symlink state, mode, bounded size,
  SHA-256, and canonical one-line bytes of both `attempt.json` and
  `summary.json`. Do not assume either exists merely because stdout says it was
  written.
- Validate each `p2-vite-attempt/v4` against its exact scenario/profile/run/
  Expected identity, fixed image, natural container exit, Docker/container/
  runner settlement, cleanup, complete v2 progress terminal, unchanged source
  hashes, cooperative trust marker, output availability, and empty ordered
  issues.
- Validate each `p2-vite-execution/v4` receipt against the attempt, fixed
  versions, image, exit, cleanup, runner disposition, source hashes, bounded
  output inventory, sanitized `p2-vite-profile-summary/v1`, expected counts and
  order, capability outcomes, limitations, and issues.
- Use the approved fixed evidence reader and pure projectors to reconstruct
  both sanitized profile projections, both receipts, the same-image pair, and
  the exact 684-byte entry line. Do not treat stdout alone as receipt evidence.
- Confirm permissive completed before constrained setup, both receipts bind
  the same inspected fixed image ID, and no missing/extra member or identity is
  accepted.
- Keep configured init, actual init availability, observed group absence,
  natural runner settlement, sanitized capability outcomes, and higher-level
  inference as distinct evidence classes. Do not claim that init/reaping caused
  the successful outcome or that the fifth attempt's residue was a zombie.
- Decide `ACCEPTED` or `BLOCKED`. If accepted, make only the smallest
  deterministic tracked presentation/evidence-map update required to represent
  the reviewed pair while preserving exactly three talk tables, and explicitly
  decide the selected-Vite and experiment-matrix `Observed` boundaries. If
  blocked, record the smallest Docker-free record/projection follow-up. Never
  authorize a retry or result repair.

# Prohibited

- Docker/container commands, direct runtime-socket access, image operations,
  probe/lifecycle execution, or any execution/retry command
- Result repair, permission change, staging rebuild/mutation, move, deletion,
  cleanup, or receipt manufacture
- Parent or historical result enumeration, historical container access, or
  arbitrary result-subtree traversal
- Reading or printing raw canary values, host paths, credentials, unsanitized
  errors, or unbounded raw output
- Changing Expected outcomes to fit the result or weakening child settlement,
  transfer, evidence, receipt, same-image, trust, or no-retry predicates
- Changing accepted codegen/P3/M4 evidence
- External network, credentials, Remote Git, publication, deployment, or
  third-party communication

# Constraints

- Use fixed-path, no-follow, bounded Docker-free reads only. Stop and record a
  finding if a required path is a symlink, unsafe type/mode, unstable, too
  large, non-canonical, or cannot be reviewed within this boundary.
- Keep the direct stdout handoff, canonical filesystem records, configuration
  intent, static/unit evidence, runtime observations, and reviewed
  presentation evidence separate.
- Never print raw event segments. Pass them only through the bounded sanitized
  projector and report canonical hashes, sizes, counts, outcomes, and issues.
- Preserve all five earlier Inconclusive attempts as immutable history and do
  not access their ignored roots.
- Standing authorization is not needed for this non-executing review.

# Deliverables

- `docs/reviews/p2-vite-init-reaper-result.md` with the decision, exact
  fixed-root/control/evidence identities, independently reconstructed
  receipts/pair/stdout, evidence classification, findings, limitations, and
  safety boundary
- If accepted, only the minimal deterministic tracked presentation
  projection/generator/evidence-map update needed for the reviewed pair
- Minimal authoritative status and handoff updates

# Verification

Use only Docker-free ordinary-development and fixed-path review commands. At
minimum:

- reproduce the ten approved hashes, fixed script, exact staging identity,
  modes, versions, and manifest;
- validate the exact two roots and only the fixed paths above using no-follow
  bounded reads, including canonical attempt/receipt/progress identities;
- run `npm run p2:build`, then use only approved pure readers/projectors to
  reconstruct both receipts, the pair, and exact stdout without executing an
  entry;
- run relevant P2/P4 verification only if needed by changed tracked
  presentation bytes;
- run focused Prettier checks over changed Markdown/data, `git diff --check`,
  and `git status --short`.

Record exact exits and test counts. Do not inspect ignored paths except the
fixed Vite staging root, the two exact active roots, and the exact allowed
paths listed above.

# Completion report

- Decision and findings
- Exact root/control/evidence modes, sizes, hashes, and canonical identities
- Independently reconstructed receipts, pair, and bounded stdout
- Evidence classification and any selected-Vite/matrix/presentation decision
- Changed files and commands with observed exits/test counts
- Commands intentionally not run and remaining limitations
- One concrete `Next:` item
