# AGENTS.md

Read `docs/index.md` and only the documents relevant to the current task.

## Safety

- Use disposable canary data only. Never access or enumerate real credentials.
- Only read environment variables prefixed with `PROBE_CANARY_`.
- Only access paths explicitly allowed by the experiment manifest.
- Never access the user's home directory, SSH agent, credential stores,
  Docker socket directly, cloud metadata endpoints, or external network hosts,
  except for the narrowly authorized Remote Git push described below.
  An approved host orchestrator may invoke a fixed container-runtime CLI, but
  must never mount or forward its socket into an experiment container.
- Network probes must be loopback-only.
- Child-process probes may execute only `process.execPath` with a fixed
  repository-owned script and `shell: false`.
- Run instrumented install lifecycle experiments only inside their disposable
  experiment container.
- Record observed results without changing the experiment to force expectations.

## Git and network

- Remote Git operations are prohibited by default.
- Exception: When the user explicitly requests publication and confirms the
  target branch, pushing the current reviewed commits to that branch is allowed.
- Do not fetch, pull, force-push, delete remote branches, or push directly to
  the default branch unless the user explicitly requests that exact action.

## Engineering

- Work on one milestone or adapter at a time.
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
