# AGENTS.md

These instructions apply to container definitions, profile controls, and host
orchestration under `containers/`.

## Runtime safety

- Never access or mount the user's home, real credentials, SSH agent, credential
  stores, cloud metadata, devices, or a container-runtime socket.
- A host orchestrator may invoke only its reviewed fixed container-runtime CLI
  operation. Do not call the runtime socket directly or mount/forward it into a
  container.
- Use a credential-empty disposable runtime CLI configuration. Do not inherit a
  user Docker configuration or perform login.
- Container build, probe execution, verification, and deploy simulation are
  offline. Runtime probes are loopback-only inside their experiment boundary.
- Accept no arbitrary image, command, argument, mount, environment, path,
  network, or runtime option from callers.
- Keep source read-only and writes limited to run-owned disposable staging,
  scratch, and result paths.
- Do not run Docker or mutate retained production state during static/unit
  implementation or review tasks.

## Current M4 freeze

- The high-assurance offline-build recovery backend is frozen with B-16/B-17
  open. Do not remediate, activate, retry, inspect the retained tag, or delete
  retained state unless the user explicitly resumes that research track.
- The ordinary profile-control entry must remain fail closed. Presentation-MVP
  profile work must use a separately reviewed minimal fixed runner and must not
  claim that the frozen recovery backend is production-approved.
