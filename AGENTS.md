# AGENTS.md

Read `docs/index.md` and only the documents relevant to the current task.

## Safety

- Never access, enumerate, validate, or expose real credentials.
- Keep ordinary development work inside this repository unless the user
  explicitly authorizes a narrower external path or service for the current
  task. Do not inspect the user's home directory, SSH agent, credential stores,
  browser data, cloud metadata, or runtime sockets.
- Do not execute a probe, lifecycle fixture, container experiment, or Docker
  operation unless the applicable nested `AGENTS.md`, experiment manifest, and
  repository-recorded command allow that exact action.
- Experiment and probe restrictions are scoped in `packages/AGENTS.md`,
  `experiments/AGENTS.md`, and `containers/AGENTS.md`. Those files define the
  runtime safety boundary; this root file does not substitute for enforcement.
- Record observed results without changing the experiment to force expectations.
- Treat expected behavior, configuration intent, static/unit evidence, and
  runtime observations as distinct evidence classes.

## Git and network

- External network access is prohibited by default. It may be used for ordinary
  documentation research or dependency acquisition only when the user
  explicitly authorizes the exact purpose and boundary. Probe execution,
  credential-free build, verification, and deploy simulation remain offline;
  probe network attempts are governed by the nested instructions and manifest.
- Remote Git operations are prohibited by default.
- Exception: When the user explicitly requests publication and confirms the
  target branch, pushing the current reviewed commits to that branch is allowed.
- Do not fetch, pull, force-push, delete remote branches, or push directly to
  the default branch unless the user explicitly requests that exact action.

## Engineering

- Follow the active presentation-MVP critical path in
  `docs/presentation-scope.md`; treat the older full-lab milestones as a frozen
  research track unless the user explicitly resumes them.
- Work on one milestone, adapter, or presentation deliverable at a time.
- Use TypeScript strict mode.
- Avoid import-time side effects in `probe-core`.
- Distinguish direct filesystem writes from changes through official tool APIs.
- Distinguish expected behavior from observed behavior.
- Make the smallest coherent change and add relevant tests.

## Verification

Use the commands and acceptance criteria defined in `docs/milestones.md`
and `package.json`.

Never claim a check passed unless it was run.

Report:

- changed files
- commands run
- observed results
- remaining limitations
- next task

After completing each task, end the completion report with one concrete
`Next:` item that states the smallest actionable task to do next. If no work
remains, end with `Next: none`.
