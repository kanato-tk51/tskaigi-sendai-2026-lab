# Goal

Perform one fresh independent Docker-free read-only implementation and
execution-gate review of the selected-Vite `20260723-01` init/reaping
candidate. Decide `APPROVED` or `BLOCKED`; do not repair the candidate or call
Docker.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `packages/AGENTS.md`
- `docs/index.md`
- `docs/presentation-scope.md`
- `docs/p2-vite-completion.md`
- `docs/p2-vite-init-reaper-contract.md`
- `docs/reviews/p2-vite-init-reaper-contract.md`
- `docs/frozen-research-execution-plan.md`
- `docs/milestones.md`
- `docs/codex-workflow.md`
- `docs/threat-model.md`
- this prompt

# Candidate identity

Reproduce these exact tracked candidate SHA-256 values before review:

| Path | SHA-256 |
|---|---|
| `containers/presentation-profiles/src/plan.ts` | `d9bea3ae3cf423fed30b78d991e6cfe265bea8890008569b2f35528ab1c1cd67` |
| `containers/presentation-profiles/src/vite-executor.ts` | `a22a5f4495ed0ab214bb7a042f0a6edeb7cd06aad496b883f4968b4c531591dc` |
| `containers/presentation-profiles/src/vite-projection.ts` | `6867db19debc466506297e54755f38542df54cfd49b4bf3281b7e727339d6f63` |
| `containers/presentation-profiles/runner/vite-runner.js` | `4c5f2c49e6b9837ae33f9cb31237a6ce980e7d720753b7c2ad1b706b5edac291` |
| `containers/presentation-profiles/test/plan.test.ts` | `1dc30f12fc4877bcebc2d68afe730ed5b22a7628e874d0175dce65087fe20b91` |
| `containers/presentation-profiles/test/vite-executor.test.ts` | `056e4a06e645a0c962419e4da4ff7276b65838fe67e085d459e395055bb698ad` |
| `containers/presentation-profiles/test/vite-projection.test.ts` | `0e604555adc7d3bd071870a6f1ce67941e29e682e8901bc677c753720cf99197` |
| `containers/presentation-profiles/test/vite-runner.test.ts` | `0ee0057bfaad30d3cd3f704f8a6d76f0fbbbc300dc0bf536dfb4f4bb15efa28b` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `0df6d8c1d6a497b39c59c45575530d56bd3a578b48720276c943b18e80859f6e` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `dae8ec15118adb8257c8c8e3964d493ada08dcf51df83de331bf84b10679292b` |

The rebuilt ignored Vite staging tree must contain exactly 128 source-equal
regular non-symlink files with their declared `0444` or `0555` modes. The
SHA-256 of the plan-order canonical JSON array of
`{targetPath,mode,sha256}` records is
`8803f5b5cec7dedb2168a03087f9e574f1d380e81602ebc2c8d722783859bd20`
(`plan-order-json[path,mode,sha256]/v1`). Staged Vite/Rollup/esbuild versions
are `6.4.3` / `4.62.2` / `0.25.12`.

# Review scope

- Confirm only selected Vite create arrays contain literal value-free `--init`
  exactly once at index 1, before `--name`; missing, duplicate, or repositioned
  flags fail closed.
- Confirm both codegen create arrays are byte-for-byte unchanged. Their
  repository-path-bound JSON-array SHA-256 values in this checkout remain
  `ab856cdef8ad5517ca841a82d453d385082167173eb15050f98ad12f6212089b`
  and
  `b6cec25b06911189cb981870cfc92981046b70a27665ae0b98bf8987cab6bd04`.
- Confirm the inspect format is exactly six fields with
  `HostConfig.Init` fourth, only literal `true` parses, and both created and
  final inspections require the retained `initConfigured: true` fact.
- Confirm missing, false, differently cased, empty, extra, duplicated, and
  changed final init fields fail closed before evidence or receipt acceptance.
- Confirm exact Expected/run/container identity is only `20260723-01` across
  plan, M2-D context, runner, projection, executor, progress, attempt, receipt,
  and pair paths. Confirm all five historical generations and obsolete static
  tuples are rejected.
- Confirm post-close residue remains child known failure even after later
  group absence. Preserve unknown-settlement, transfer, regular-evidence,
  receipt, permissive-first, same-image, cooperative-trust, and no-retry gates.
- Reproduce the candidate hashes, compiled import safety, exact staging
  identity, and focused/full Docker-free test evidence.
- Check absence of only these two exact paths without enumerating their parent:

  - `results/runs/p2-selected-profiles/p2-vite-observe-p-20260723-01`
  - `results/runs/p2-selected-profiles/p2-vite-observe-c-20260723-01`

- If and only if no blocking finding remains, approve at most one later
  argument-free `npm run p2:execute:vite` pair invocation with permissive
  completion before constrained setup and no retry.

# Recorded verification context

- Focused P2 plan/executor/projection/runner: 4 files / 77 tests passed.
- Focused M2-D scenario context: 1 file / 19 tests passed.
- `npm run p2:verify`: 9 files / 122 tests passed.
- `npm run p2:build`: passed, including compiled host output.
- Compiled executor/entry import: passed without runtime execution.
- `npm run m2d:verify`: typecheck, build, and static verification passed, then
  23 integration tests failed exclusively at the fixed Node version guard
  because the implementation host reported Node `v22.23.1` instead of the
  fixed contract value `v20.18.2`; 9 files / 60 tests passed. Preserve this as
  an environment/toolchain observation. Do not change the fixed Node contract
  or use Docker to force a pass.
- The exact staging replacement/rebuild used the
  `continue-repository-work` standing authorization for the already reviewed
  fixed action. This was not a separate human review.

# Prohibited

- Candidate source, test, staging, Expected, or evidence repair
- Docker/container commands, runtime-socket access, image operations,
  `npm run p2:execute:vite`, probe/lifecycle execution, or result creation
- Parent/result enumeration, historical root/container access, retained-state
  mutation, retry, cleanup, or reinterpretation
- Selected-Vite or experiment-matrix `Observed` change, presentation
  projection change, codegen/P3/P4/M4 mutation
- External network, credentials, Remote Git, publication, deployment, or
  third-party communication

# Verification

Use fixed-path SHA-256 and source assertions, focused Docker-free tests,
`npm run p2:verify`, `npm run p2:build`, compiled import checks, and an
independent exact staging byte/mode/manifest assertion. A fresh
`npm run m2d:verify` may be recorded, but do not weaken the version contract or
claim its integration tests passed unless the exact fixed toolchain is
actually present. Run focused Prettier checks over review-owned Markdown and
`git diff --check`.

# Deliverables

- `docs/reviews/p2-vite-init-reaper-implementation.md`
- Minimal authoritative handoff updates with decision, findings, exact
  candidate/staging identities, commands, observed results, limitations, and
  one concrete `Next:` item
