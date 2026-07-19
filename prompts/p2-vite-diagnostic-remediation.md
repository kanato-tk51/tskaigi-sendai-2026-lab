# Goal

Implement the Docker-non-executing diagnostic-state and timeout remediation in
`docs/p2-vite-completion.md`, then bind only the selected Vite pair to its fixed
`p2-vite-expected-20260719-03` Expected revision and `20260719-03` run/container
identities. Produce a review-ready candidate without calling Docker or creating
runtime evidence.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/p2-vite-completion.md`
- `docs/p2-selected-profile-contract.md`
- `docs/reviews/p2-selected-profile-vite-failure.md`
- `docs/milestones.md` Presentation MVP / P2 sections
- `docs/experiment-matrix.md`
- `docs/threat-model.md`
- this prompt

# Scope

- Add a new canonical attempt schema for new Vite attempts that retains only a
  closed primary lifecycle-stage enum and sanitized failure code.
- Preserve the original failure while making at most one fixed final inspect
  after an attached-start command failure with known Docker settlement. Retain
  only validated bounded state; never inspect after unknown settlement.
- Change only the fixed outer attached-start timeout from 40 to 60 seconds; keep
  all runner-internal limits unchanged.
- Add focused fake-command/process tests for every stage, known/unknown
  settlement behavior, original-failure ordering, final-inspect retention, and
  the 60-second versus inner-timeout ordering.
- Bind the Vite plan, M2-D selected context, runner, projection, executor, and
  tests to the exact `-03` tuples in `docs/p2-vite-completion.md`.
- Represent the exact Expected revision in the fixed plan and canonical new
  attempt/receipt identity so both profiles are cross-bound to it. Do not change
  the Expected event order, counts, or outcomes.
- Rebuild and verify the exact fixed Vite staging closure with the ordinary
  argument-free staging command, preserving any existing verified staging tree
  under a new exact ignored backup path rather than deleting it.
- Keep codegen source, identities, receipts, result state, and Observed
  unchanged.
- Record candidate hashes, staging identity, test results, classification, and
  a single fresh-review next action in `docs/p2-vite-completion.md` and
  `docs/milestones.md`.

# Constraints

- Do not call Docker, access a runtime socket, or run `npm run p2:execute:vite`.
- Do not read, stat, enumerate, move, chmod, delete, or recover either historical
  Vite result root or historical container state.
- Check absence only for the two exact `-03` result paths; do not enumerate
  `results/runs/**`.
- Do not pull an image. The newly fixed image identity is the unchanged exact
  digest in `docs/p2-vite-completion.md`.
- Do not change raw Expected values, experiment-matrix Observed, accepted
  codegen/P3 evidence, tracked P4 result projections, or retained M4 state.
- Do not add caller-selected image, command, arguments, mounts, paths,
  environment, network, runtime options, or generic recovery machinery.
- Static/unit evidence is not runtime or profile Observed. This task does not
  approve an execution gate.

# Verification

Run the focused Vite context/plan/runner/projection/executor/staging tests and:

```sh
npm run m2d:verify
npm run p2:verify
npm run p2:build
npm run p2:stage:vite
npm run check
git diff --check
git status --short
```

Also verify compiled imports are side-effect free, calculate candidate hashes,
reproduce the staging file/byte/mode/version manifest, verify codegen identity
non-change, and check only the two exact `-03` result paths are absent.

# Completion report

- Changed files
- Commands and observed results
- New schema/stage/failure-code and timeout behavior
- Exact Expected/image/run/container bindings
- Historical Inconclusive preservation and unchanged evidence classifications
- Remaining limitations
- `Next:` one fresh independent Docker-non-executing review under the recorded
  review prompt
