# AGENTS.md

These instructions apply to probe and adapter packages under `packages/`.

## Probe safety

- Use repository-owned disposable fixtures and canary data only. Never access
  or enumerate real credentials.
- Probe environment access is limited to manifest-listed keys prefixed with
  `PROBE_CANARY_`. Do not enumerate the host environment.
- Probe file access is limited to paths explicitly allowed by the validated
  experiment manifest. Keep writes in disposable output, artifact staging, or
  result directories.
- Network probes are loopback-only or use a manifest-listed experiment Unix
  socket. Do not contact external hosts.
- Child probes may execute only `process.execPath` with a fixed
  repository-owned script, fixed arguments, and `shell: false`.
- Tests must use disposable repository-owned fixtures and must not turn a
  denied or missing attempt into a success.

## Evidence

- Keep direct filesystem writes distinct from changes through official tool
  APIs.
- Do not record raw canary values, file contents, host absolute paths, or
  unsanitized errors.
- Local adapter verification is not automatically profile, experiment-matrix,
  or presentation evidence.
