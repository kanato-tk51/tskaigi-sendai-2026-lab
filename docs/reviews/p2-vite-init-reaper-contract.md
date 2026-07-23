# P2 selected Vite `20260723-01` init/reaping contract independent review

## Review target and decision

- Target: the fixed Docker-free contract in
  [`p2-vite-init-reaper-contract.md`](../p2-vite-init-reaper-contract.md)
- Review type: fresh independent Docker-free tracked-source/static contract
  review
- Decision: **APPROVED for one later bounded Docker-free implementation and
  focused static/unit task**
- Blocking findings: none
- Non-blocking findings: none
- Docker execution or execution gate: not approved and not performed
- Selected Vite and experiment-matrix `Observed`: unchanged and unmeasured

The contract keeps the fifth execution outcome as immutable `Inconclusive`
evidence and describes possible orphan reaping only as a design hypothesis. It
adds one fixed configuration prerequisite for a sixth generation; it does not
claim that unreaped state caused the fifth failure or that configured init will
change a later result.

This is an independent Codex review, not a separate human review. It approves
only the bounded Docker-free implementation boundary below. It establishes no
implementation correctness, daemon support, process settlement, capability
outcome, runtime evidence, receipt, or `Observed` result.

## Independently traced evidence

### Fifth immutable attempt

The tracked deterministic presentation projection contains exactly five
selected-Vite attempts. Its fifth row and the accepted result review agree on:

- fixed attempt `20260720-02`, permissive run
  `p2-vite-observe-p-20260720-02`, and missing constrained member;
- primary `container-wait / P2_EXECUTOR_DOCKER_TIMEOUT`;
- a retained prefix through natural `child-close-observed: exit-0`,
  `child-residue-detected: post-close-group-present`, and
  `child-force-sent: sent`; and
- an `Inconclusive` conclusion with permissive evidence not inspected and no
  constrained result.

The accepted result review further records null inspected container exit,
force-removed container settlement, force-stopped runner-process settlement,
invalid terminal projection, no receipt, and no capability result. These are
reviewed historical observations, not facts re-read from a result root in this
review. They establish neither a live descendant nor an exited-but-unreaped
process, the process retaining the group, final group absence, nor the cause of
the host wait timeout.

### Current tracked source boundary

The current source still provides the pre-contract baseline:

- the selected create plan begins `create`, `--name`, contains no `--init`, and
  directly starts fixed Node with the fixed presentation runner;
- the fixed inspect projection has five fields and is parsed at the created and
  final owned-container inspection sites;
- the Vite child is launched with `shell: false` and `detached: true`, its
  positive PID becomes the process-group ID, and group presence is checked with
  `process.kill(-processGroupId, 0)`; and
- a close-first path with detected post-close residue can reach only
  `child-settled: known-failure` after proved group absence. Only a natural
  close with immediate group absence can reach `child-settled: success`.

The reproduced SHA-256 values are
`ea65004eb8a4b3dd57933fa3d9961afb72f1c82e9656d976958a4507d6c13e5b`
for `src/plan.ts`,
`2a602b54f9c3f1c83ed43a8da18273a4b69b17f83eb6b020d87ef381deb0ce2f`
for `src/vite-executor.ts`, and
`6dcd832eda1acad1ec443ded36b7613eae1c2d98277ef878b3533875c61c53a5`
for `runner/vite-runner.js`. These are tracked source identities and static
reachability evidence only.

### Fixed init and inspect contract

The reviewed contract fixes the Vite-only create prefix to:

```text
create
--init
--name
<fixed selected-Vite container name>
--pull
never
```

`--init` is literal, value-free, and occurs exactly once. No init path, custom
binary, image, executable, argument source, mount, namespace, device,
capability, socket, network option, or environment input is added. The shared
plan may add the flag only in the Vite branch; both codegen create arrays must
remain byte-for-byte equal to their pre-implementation values.

The inspect projection becomes exactly:

```text
{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.HostConfig.Init}}|{{.State.Status}}|{{.State.ExitCode}}
```

The fourth field accepts only literal `true`. Both created and final
owned-container inspection paths must retain `initConfigured: true` together
with the existing exact container, configured-image, image-ID, state, and exit
checks. Missing, false, differently cased, duplicated, extra, or malformed init
state is inspect-invalid. A valid created inspection is required before start;
a final mismatch cannot produce a receipt.

Configured init is therefore only configuration intent. It is not a natural
close, group-absence observation, runner/container settlement, transfer
validation, evidence-access predicate, receipt, same-image member, capability
outcome, or `Observed` result.

## Settlement, identity, and evidence closure

The approved detached create/inspect/start/wait/final-inspect/remove graph,
known-versus-unknown CLI settlement, earliest-failure rule, writer-stop
predicate, progress transfer, regular-evidence barrier, and cleanup
consequences remain conjunctive with the new init checks.

In particular, once `child-residue-detected: post-close-group-present` is
published, later force delivery, reaping, or proved group absence can reach
only child known failure. It cannot reach output export, a completed terminal,
regular evidence access, a receipt, constrained setup, pair completion, or
capability `Observed`. The `repository-cooperative-fixture` limitation remains
unchanged and `--init` supplies no same-UID writer isolation.

The sixth generation is separated by exactly:

- Expected revision `p2-vite-expected-20260723-01`;
- runs `p2-vite-observe-p-20260723-01` and
  `p2-vite-observe-c-20260723-01`; and
- containers `tskaigi-p2-vite-observe-p-20260723-01` and
  `tskaigi-p2-vite-observe-c-20260723-01`.

A later implementation must accept only that scenario/profile/run/container/
Expected cross-product and reject all five historical generations and obsolete
static tuples. The revision changes identity only: the image, fixed invocation,
15-event order, counts, capability hypotheses, bounds, offline/no-pull policy,
permissive-first progression, same-image requirement, and no-retry rule remain
unchanged.

## Exact approved implementation boundary

Exactly one later Docker-free task may:

1. rebind only the selected Vite plan, M2-D scenario context, runner/executor
   identity gates, projections, their focused tests, and existing staging
   declarations to `20260723-01`;
2. add one Vite-only `--init` in the fixed create position while proving both
   codegen create arrays and every other image/command/mount/network option are
   unchanged;
3. extend only the closed inspect type, parser, format, created-state check,
   final-state check, and internal lifecycle fact needed to require literal
   `initConfigured: true`;
4. add focused negative regressions for missing, false, malformed, extra, and
   changed init fields; missing, duplicate, and repositioned Vite `--init`;
   old identities; and codegen non-change;
5. preserve the existing post-close-residue, force, unknown-settlement,
   transfer, evidence, receipt, permissive-first, same-image, trust-marker, and
   no-retry tests without weakening their assertions;
6. run only the focused Docker-free P2/M2-D static/unit verification fixed by
   `docs/milestones.md`; and
7. after those checks, perform only the separately fixed source-equal,
   fixed-mode Vite staging rebuild required by the contract.

The task may update only minimal implementation handoff documentation in
addition to those paths. It may not call Docker, inspect or create a result
root, authorize a one-shot execution, accept a receipt, change Expected event
values, update selected-Vite or experiment-matrix `Observed`, or change the
tracked presentation projection. A fresh independent implementation/execution-
gate review remains mandatory before any runtime action.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/nested instructions, routed documentation, contract, prompts, prior gate/result reviews, tracked plan/executor/runner, workflow, and threat-model inspection | Completed without Docker, build, staging, execution, or result-state access. |
| Contract/prompt identity assertion | Exit 0; reproduced 13,468-byte contract SHA-256 `2459c603...`, 3,762-byte task-prompt SHA-256 `f9af6a89...`, and 3,957-byte review-prompt SHA-256 `83eb3d4b...`. |
| Fixed source and tracked projection assertion | The first reviewer-authored command exited 1 on a JavaScript quoting error before evaluating assertions; it changed no state and supplies no evidence. |
| Corrected fixed source and tracked projection assertion | Exit 0; reproduced five tracked attempts, the exact fifth primary diagnostic, current `create/--name` no-init prefix, five-field inspect with two parse sites, fixed runner predicates, and the reserved contract tuple. |
| Focused Prettier check over the review and handoff documents | Exit 0; all named files matched repository formatting. |
| `git diff --check` after review edits | Exit 0. |

No build or unit suite was run merely to restate prior reports. Passing this
review's fixed-path assertions proves only documentation/source consistency; it
does not prove future implementation behavior or any runtime effect.

## Safety boundary and remaining limitations

This review did not call Docker, access a runtime socket, run a probe or
lifecycle fixture, build, stage, execute, inspect or enumerate a historical or
proposed result root, inspect retained state, pull an image, use external
network or credentials, access frozen M4 state, perform Remote Git, publish,
deploy, or communicate with a third party. Standing authorization was not used
because this review reached no repository-recorded execution or approval-only
action.

Docker `--init` availability, the exact init implementation selected by the
daemon, subreaping behavior, whether the fifth residue was live or unreaped,
whether the sixth process group will become absent, and every future capability
outcome remain unresolved runtime facts.

Next: implement the independently approved `20260723-01` Vite-only `--init`
and six-field inspect binding with focused Docker-free regressions, then rebuild
only the exact fixed Vite staging candidate; do not call Docker or access result
roots.
