# P2 selected Vite `20260723-01` init/reaping contract

Status: **PROPOSED; fresh independent Docker-free contract review required
before implementation**

Contract date: 2026-07-23

## Decision and evidence boundary

Issue #54 may proceed only with a sixth immutable selected-Vite generation
whose one changed runtime prerequisite is a fixed container init process. The
proposal adds Docker's fixed `--init` create option and binds its configured
state through the existing owned-container inspections. It does not change the
probe, Vite invocation, image, Expected capability values, progress semantics,
child settlement predicates, output bounds, permissive-first rule, or
same-image requirement.

This is a Docker-free contract decision, not implementation approval,
execution approval, runtime evidence, or a claim that init/reaping caused or
will resolve the fifth attempt's failure. The five reviewed attempts remain
immutable `Inconclusive` evidence. None may be retried, repaired, cleaned up,
reinterpreted, or reused.

The exact task and fresh independent review inputs are:

- [`prompts/p2-vite-init-reaper-contract.md`](../prompts/p2-vite-init-reaper-contract.md)
- [`prompts/reviews/p2-vite-init-reaper-contract-review.md`](../prompts/reviews/p2-vite-init-reaper-contract-review.md)

## Evidence classification

| Class | Fixed conclusion |
|---|---|
| Reviewed runtime observation | The `20260720-02` permissive Vite child published natural `exit-0`, then `post-close-group-present`, then `child-force-sent: sent`. The bounded host wait did not establish natural container exit; the canonical attempt has null inspected container exit, force-removed container settlement, force-stopped runner-process settlement, invalid terminal projection, no evidence read, and no receipt. |
| Tracked static/unit boundary | The fixed container command directly starts the Node runner. The runner starts the Vite CLI with `detached: true`, uses the child's positive PID as process-group ID, detects group presence with `process.kill(-pgid, 0)`, and requires actual group absence before known child settlement. The Vite create plan does not currently include `--init`. |
| Supported design hypothesis | A fixed init process acting as PID 1 and subreaper may allow orphaned descendants in the Vite process group to be reaped before or after bounded force settlement. This makes `--init` a reviewable single-variable prerequisite for a fresh generation. |
| Unresolved runtime fact | The retained bytes do not distinguish a live descendant from an exited but unreaped process, identify which process retained the group, prove why bounded force did not establish absence, or prove that Docker `--init` will change the next outcome. |

The supported hypothesis must never be restated as an observed cause. Static
presence of `--init` and inspect value `true` establish only configuration
intent. Child, runner, container, and capability facts still require the later
runtime and result-review predicates below.

## Fixed fresh-generation identity

The sixth generation reserves exactly:

- generation: `20260723-01`
- Expected revision: `p2-vite-expected-20260723-01`
- permissive run/root: `p2-vite-observe-p-20260723-01`
- constrained run/root: `p2-vite-observe-c-20260723-01`
- permissive container: `tskaigi-p2-vite-observe-p-20260723-01`
- constrained container: `tskaigi-p2-vite-observe-c-20260723-01`

These values are reserved configuration intent, not active implementation or
runtime state. A later implementation must accept only this exact
scenario/profile/run/container/Expected tuple and reject all five historical
generations plus every obsolete static tuple.

The Expected revision is identity-only. The following contract remains
unchanged:

- fixed image reference
  `node@sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`
  and required inspected image ID
  `sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`;
- the existing 15-event order and producer sequence `0..14`;
- per-profile counts: route `6`, capability `6`, tool API change `3`, total
  `15`;
- three observe tool changes remain `skipped / NOT_APPLICABLE`;
- permissive environment, file read, source hash, direct write, loopback, and
  fixed child remain Expected `success`;
- constrained environment remains absent, file missing/denied, source hash
  successful and unchanged, direct write denied, loopback failure, and fixed
  child successful with the existing tool-required-child limitation; and
- the fixed Node/Vite invocation, offline/no-pull boundary, mounts, non-root
  user, read-only root, capability drop, no-new-privileges, resource bounds,
  credential-empty Docker CLI configuration, and network `none` boundary.

Expected remains a pre-run hypothesis and cannot be changed in response to a
future outcome.

## Exact fixed init configuration

Only selected Vite create plans gain one literal `--init` argument. The exact
Docker argument prefix becomes:

```text
create
--init
--name
<the fixed selected-Vite container name>
--pull
never
...
```

`--init` appears exactly once, before `--name`, and takes no value. No
`--init-path`, custom binary, image change, arbitrary executable, caller input,
environment input, additional mount, host namespace, device, capability,
socket, or network option is permitted. Codegen create plans must remain byte-
for-byte unchanged by the Vite-only branch.

The current fixed inspect projection expands from five to exactly six
pipe-delimited fields in this order:

```text
{{.Id}}|{{.Image}}|{{.Config.Image}}|{{.HostConfig.Init}}|{{.State.Status}}|{{.State.ExitCode}}
```

The parser must accept the fourth field only as literal `true`. Missing,
`false`, null-like, differently cased, duplicated, extra-field, or malformed
values fail with the existing sanitized inspect-invalid boundary. Both the
created-state inspection before detached start and the final inspection after
known-settled wait must preserve this same `initConfigured: true` fact along
with exact container ID, image reference/ID, state, and exit validation.

Configured init is necessary for this generation but is not process-settlement
evidence. If create rejects `--init`, create output is malformed, created
inspection cannot prove the exact owned container and literal `true`, or any
Docker CLI settlement is unknown, the attempt remains fail-closed
`Inconclusive` under the existing first-failure and cleanup barriers. There is
no fallback create without `--init`, no retry, and no alternate init binary.

## Child, runner, and transfer predicates remain closed

The init prerequisite does not change the current child transition graph:

1. Natural child close `exit-0` is success only when the exact process group is
   already absent at the existing check. Only that path may publish
   `child-group-absent: confirmed` followed by `child-settled: success`.
2. Any detected post-close group presence must publish
   `child-residue-detected: post-close-group-present`. Even if bounded force
   delivery and later reaping establish group absence, the path remains
   `child-settled: known-failure`; it cannot verify output, export evidence,
   write a receipt, or become capability `Observed`.
3. Failed force delivery, unproved group absence, contradictory close state,
   timeout, output limit, process error, transfer failure, or unknown server
   settlement remains unknown or known failure exactly as the approved v2
   progress graph requires. Init configuration cannot override the record-to-
   terminal validator.
4. The existing `repository-cooperative-fixture` trust marker remains on every
   attempt, receipt, pair, and talk projection. `--init` does not add writer
   isolation to the same-UID progress mount.
5. The fixed child timeout, termination grace, force-settlement, server-
   settlement, record-count, byte, Docker command, and pair bounds remain
   unchanged. Increasing a timeout or collecting raw logs is not part of this
   contract.

A complete permissive receipt still requires all of the following: exact
identity and image, configured init proved by both applicable owned-container
inspections, known Docker CLI settlement, natural inspected container exit
`0`, valid completed progress with child and server known settled, output
exported, bounded evidence read and validation, canonical receipt write, and
completed cleanup. No prefix, force removal, force-stopped runner, configured
init, or missing evidence may substitute for any predicate.

Constrained setup remains forbidden unless the permissive member produces that
complete reviewable receipt. Pair completion still requires both exact members
and one exact inspected image ID. Any other outcome stops the pair and is never
retried.

## Host command graph and failure behavior

The approved detached host order remains:

```text
create --init
created inspect with HostConfig.Init=true
detached start
bounded wait
one final inspect with HostConfig.Init=true
fixed remove
```

Known- versus unknown-settlement, first-failure preservation, final-inspect,
remove, progress-read, evidence-read, attempt-write, and cleanup-suppression
rules remain those in the approved `20260720-02` detached-transfer contract.
The only command-graph change is the fixed create flag and its inspect binding.

An owned created container whose inspect reports anything except literal
`HostConfig.Init=true` is not eligible to start. The existing known-settled
cleanup rule may remove that exact owned container, while the canonical attempt
retains created-inspect failure as primary and no progress/evidence/receipt
claim. Unknown CLI settlement continues to suppress every later Docker and
filesystem action allowed by that barrier.

## Docker-free implementation acceptance criteria

A later implementation is review-ready only when one bounded task:

1. rebinds only selected Vite plan, context, runner/executor identity gates,
   projections, tests, and staging declarations to the exact `20260723-01`
   tuple while rejecting every older tuple;
2. inserts one Vite-only `--init` at the exact fixed create position and proves
   codegen create-plan bytes are unchanged;
3. extends the closed inspect type/parser/format to six fields, requires literal
   `true`, and checks it at created and final inspect boundaries;
4. adds negative regressions for absent, false, malformed, extra, and changed
   init fields and for a Vite create plan missing, duplicating, or repositioning
   `--init`;
5. preserves all existing post-close-residue, force, unknown-settlement,
   transfer, evidence, receipt, same-image, permissive-first, and no-retry
   regressions without weakening their assertions;
6. proves no raw output, host path, init path, runtime-selected value, or
   unsanitized error enters a canonical attempt, receipt, or direct projection;
7. runs the focused Docker-free P2/M2-D verification required by
   `docs/milestones.md`; and
8. rebuilds exact source-equal fixed-mode Vite staging only after a fresh
   contract review approves this implementation boundary and only under a
   separately fixed staging action.

Static/unit acceptance proves source behavior and configuration intent only.
It cannot prove daemon init availability, subreaping, process-group absence,
runtime policy enforcement, capability outcomes, or `Observed`.

## Ordered remaining work

1. **Complete:** this Docker-free contract and the fresh independent contract-
   review prompt are saved without implementation, staging, or execution.
2. **Next:** a fresh independent Docker-free read-only review must decide
   `APPROVED` or `BLOCKED` for exactly one bounded implementation task.
3. If approved, one later Docker-free implementation and focused static/unit
   verification task may encode the reviewed contract.
4. A separate fresh implementation/execution-gate review must reproduce exact
   candidate and staging identities, fixed command and init binding, protected
   evidence non-change, and absence of only the two exact new roots.
5. Only an approved exact gate may authorize one argument-free pair execution.
   It is never retried, and permissive must complete before constrained setup.
6. Any produced state requires a fresh Docker-free fixed-root result review
   before receipt acceptance or any selected-Vite/presentation/matrix change.

## Safety boundary and limitations

This task did not invoke Docker, access a runtime socket, execute a probe or
lifecycle fixture, run a build or staging command, inspect or mutate a result
root, container, ignored staging path, evidence subtree, or historical attempt,
pull an image, use external network or credentials, access frozen M4 state,
perform Remote Git, publish, deploy, or communicate with a third party.
Standing authorization was not used because the task reached no execution or
repository-recorded approval gate.

The fifth attempt's live-versus-unreaped residue, lower-level process identity,
and failure cause remain unresolved. Docker `--init` availability and behavior
on the future fixed runtime are also unresolved. This contract deliberately
keeps those as limitations and retains fail-closed behavior if the hypothesis
does not improve settlement.

Next: perform the fresh independent Docker-free contract review under
`../prompts/reviews/p2-vite-init-reaper-contract-review.md`; do not implement,
stage, call Docker, access result roots, or change Expected/Observed in that
review.
