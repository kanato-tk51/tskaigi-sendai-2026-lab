# AGENTS.md

These instructions apply to instrumented experiments under `experiments/`.

## Execution boundary

- Use disposable canary data only. Never access or enumerate real credentials.
- Read only manifest-listed environment keys prefixed with `PROBE_CANARY_`.
- Access only paths explicitly allowed by the experiment manifest.
- Network probes are loopback-only or use an experiment-owned Unix socket.
- Child probes may execute only `process.execPath` with the fixed
  repository-owned script and arguments declared by the manifest, with
  `shell: false`.
- Run instrumented install lifecycle packaging, installation, and execution
  only inside its disposable experiment container. Never run it from the root
  workspace or directly on the host.
- Do not mount or forward the host home, credentials, SSH agent, runtime socket,
  host network namespace, devices, or unrelated repository paths.
- Experiment build and execution are offline. Dependency acquisition is a
  separate phase and requires an exact user-authorized boundary.

## Results

- Preserve expected conditions before execution and record observed outcomes
  without changing the experiment to force a match.
- Store only bounded, sanitized evidence in the declared result path.
