# M4 exact filesystem-object identity contract remediation re-review

## Review target and decision

- Target: the remediated Docker-free issue #45 contract in
  [`m4-exact-filesystem-identity.md`](../m4-exact-filesystem-identity.md)
- Review type: fresh independent read-only contract and exact tracked-source
  re-review
- Decision: **BLOCKED; do not implement the first identity task yet**
- M4-FS01 ownership/full-mode closure: **OPEN on one residual runtime-CLI
  configuration-state transition**
- M4-FS02 activation sequencing: **CLOSED at contract scope**
- M4-FS03 public projection and implementation scope: **CLOSED at contract
  scope**
- M4-FS04 result/scratch roles: **CLOSED at contract scope**
- New independent finding IDs: none; the blocker is residual M4-FS01
- Docker, retained M4 state, runtime evidence, and `Observed`: not accessed,
  executed, or changed

The remediation closes the original activation, public-transfer, and nine-row
result/scratch ambiguities. It also defines coherent private BigInt ownership
relations for existing repository objects, run-owned host objects,
container-created result objects, and fixed Docker `cp` destinations.

The first implementation is not yet internally closed, however. Its acceptance
explicitly requires the shared identity implementation to cover the
offline-build and offline-build-recovery production paths, while its exhaustive
mode-transition list has no role for runtime-CLI-created Docker configuration
state. The exact tracked recovery inventory contains such objects and includes
a regular file with full mode `0644`; every regular-file mode currently listed
by the remediated contract is `0600` or `0444`. The implementer would therefore
have to choose an unrecorded ownership/mode/settlement policy or reject a fixed
state the same contract requires the recovery path to bind. That is the
remaining M4-FS01 contract gap. This review records it without repairing the
contract.

## Reviewed snapshot identity

The hashes below identify the reviewed contract and handoff bytes before this
review record and its status updates were added. They establish review input
identity only; they do not establish a runtime identity chain.

| Target | SHA-256 |
|---|---|
| `docs/m4-exact-filesystem-identity.md` | `3061c43823636708867033e8436a43ddc0564cea8c13caa5003d400f6390d175` |
| Initial independent review | `5c5a675991123648aa04592cb05772fd9d95d5b588152bfd6a3a34fd3d08a48d` |
| Contract remediation prompt | `856339a18e9ea6125ec44da679410fbe94ca8ccf3149beb024b1f75a812f27d3` |
| This re-review prompt | `87c2740679b3b6a505b72f94746c1a0c6e2322452b3d62ca832d62fa0481cfda` |
| Sorted SHA-256 manifest of the 14 exact tracked source/test/static paths allowed by the review prompt | `88d96e7cf749f0da09d0a96b15882bc091d688d7fda3ed5eed7f0f0f1957eb7a` |
| Ordinary `orchestrator-entry.ts` | `73eff2d1190b054057212a2466b3fd7d84a95ad1f5157807e0b1f0fe05b51b1f` |
| Ordinary compiled `orchestrator-entry.js` | `02cfa31820dbf595d2b37438fa3eead5505f619b3a854e49b625f01982cc74b4` |

The tracked aggregate covers the six exact source paths, seven existing focused
test paths, and `verify-static.mjs`. The proposed new identity helper and its new
focused test do not exist in the current baseline and were not treated as
reviewed implementation.

## Independently reproduced current static baseline

### Loader and private identity baseline

`run-controls.ts` still obtains `image-input.json`, the four fixed staging
sources, and both canonical profiles with path-based `readFile`. The
offline-build and control backends use short-lived `O_NOFOLLOW` handles for
selected reads but close them before the full consumer settlement boundary.
The offline-build, recovery, and control backends still compare numeric
`dev`/`ino` values. These are expected current static facts; they do not satisfy
or contradict the proposed future BigInt guarantee by themselves.

### Public transfer baseline

`control-host-backend.ts` still derives a public `m4-file-*` value from numeric
device/inode identity. `execution.ts` and its focused test still require the two
identity strings plus the four type/symlink keys. That reproduced baseline is
why an atomic backend/executor/test/static migration is necessary. The old
shape is not reported as a new finding against the remediated future contract.

### Recovery configuration-state baseline

`offline-build-recovery-host-backend.ts` fixes a 15-entry retained inventory.
The objects below the fixed `docker-config` root were created by the settled
runtime CLI rather than by the host-direct creation helpers. Their current
contract includes `0700` directories, `0600` files, and this exact `0644`
regular file:

```text
docker-config/buildx/refs/default/default/tdjwufr4i7552r09bibchdkva
```

The recovery backend validates that file as a one-link, 281-byte regular file
with full mode `0644` and deliberately does not read its content. The focused
recovery test and static verifier bind the fixed retained inventory. This is
static source evidence only; the review did not inspect the retained object or
reproduce its host ownership.

### Ordinary reachability

The ordinary source and compiled entry hashes reproduce the previously reviewed
fail-closed bytes. The package root does not import or export the production
control runner/backend. The existing root `m4:run:controls` script reaches the
ordinary entry, which remains fail closed without a separately reviewed future
activation object.

## Finding-by-finding closure analysis

### M4-FS01 — residual runtime-CLI configuration state keeps closure blocked

The remediation correctly adds BigInt `uid`/`gid` to every accepted private
observation and defines these exact relations:

- repository inputs and ancestors preserve their captured owner pair;
- each exclusive run root establishes `runOwner`, which host-direct run state
  must retain;
- all expected container-created result/scratch files share one private
  `containerOwner`, without inferring a host mapping from in-container
  `10001:10001`; and
- each fixed Docker `cp` destination must be created as `runOwner` with full
  mode `0600`, with no host `chown`, `chmod`, or copy normalization.

Those decisions close the original three-producer result ownership ambiguity.
The contract also correctly rejects unsupported ownership reporting, special
bits, and unlisted ownership or mode changes.

The residual contradiction is in the larger first-implementation acceptance
boundary. That boundary requires the new identity record to cover
`offline-build-host-backend.ts` and
`offline-build-recovery-host-backend.ts`, including offline-build/recovery state
identity. The exhaustive transition table lists host-direct private/config
directories at `0700`, host-direct `config.json` at `0600`, and
CLI-materialized result/scratch files at `0600`; it does not list the settled
runtime CLI's additional Docker configuration files and directories. The fixed
recovery inventory's `0644` file cannot be assigned to any listed regular-file
transition.

The broad phrase that Docker configuration belongs to `runOwner` does not close
the missing full-mode and producer/settlement rule, and it does not say whether
every fixed runtime-created recovery entry establishes or must equal
`runOwner`. Because the contract says no unlisted transition is permitted, this
is not an implementation detail that can be inferred safely.

Required residual remediation: add one exhaustive runtime-CLI Docker
configuration-state role table, or an equivalently exact closed rule, covering
every fixed recovery inventory role and every offline-build creation boundary.
It must fix producer/origin, absent or pre-existing parent state, exact full
mode including the `0644` exception, private owner relation, permitted content
non-read versus bounded size/hash treatment, child `close` settlement,
pre/post identity checks, and retention/identity-checked cleanup. If future
runtime-created names or modes are not fixed inputs, the contract must choose
the exact fail-closed disposition rather than leave discovery or normalization
to the implementer. No retained-state access is needed for that remediation.

M4-FS01 therefore remains open at contract scope.

### M4-FS02 — closed

The first implementation contains no activation source, compiled output, path,
test, or acceptance item. The ordinary fail-closed source and compiled output
remain unchanged. Only the separately named **M4 distinct activation-object
contract task**, sequenced after the first implementation and its fresh review,
may choose source/compiled paths, construction bytes, reachability assertions,
and focused tests. No activation command, Expected revision, run ID, result
root, container identity, or output hash is selected here.

### M4-FS03 — closed

The remediated public transfer record has exactly the ordered keys
`manifestBefore`, `manifestAfter`, `manifestIdentityStable`, `controlEvidence`,
`resultFiles`, and `scratchFiles`. The stable field is literal `true` only after
private handle/path/ancestor/ownership/full-mode/content validation and relevant
child `close` settlement. The two identity, two type, and two symlink keys plus
all `m4-file-*` values are removed together, with no compatibility form.

The source allowlist names the new private helper, loader, three host backends,
executor, and types. The verification allowlist names the new helper test, all
focused loader/backend/executor/import/static tests, and the static verifier.
The exact current-source trace found the old public shape only in allowlisted
backend/executor/test paths. No public value in the replacement is derived only
from private device/inode data.

### M4-FS04 — closed

The exhaustive table covers all nine fixed basenames: three container-direct
objects, three Docker-`cp` transfer objects, and three host-direct canonical
records. Its common precondition fixes empty parents, absent basenames, and the
exact ordered inventory prefix. Each row fixes origin, one-link type, full mode,
private owner relation, canonical or literal bytes, size/SHA relation,
descriptor lifetime, start/copy `close` or host sync boundary, post-use
validation, and retention or identity-checked unlink. Constrained scratch
absence is explicit.

Docker `cp` metadata mismatch is terminal transfer Inconclusive. Archive
preservation and host copy/`chmod`/`chown` normalization are not compatibility
branches. The wider M4-FS01 recovery-state blocker does not reopen the nine
result/scratch row decisions.

## Preserved evidence and safety boundary

- Process settlement still requires `close`; `exit`, timeout, output failure,
  or signal request alone cannot authorize evidence reads or acceptance.
- Unsupported BigInt/platform/descriptor semantics and every identity drift
  remain fail-closed Inconclusive outcomes with no repair or retry.
- Cleanup is limited to exact privately matched owned objects and preserves the
  primary failure when cleanup also fails.
- Host-direct, container-direct, fixed runtime-CLI materialization, and
  route-specific official tool API evidence remain distinct origins.
- Contract and current tracked-source assertions are configuration/static
  evidence only. They establish no Docker behavior, runtime enforcement,
  profile-control Observed, adapter-route Observed, matrix Observed, or
  presentation claim.
- The cooperative-host limitation remains explicit. Held descriptors and
  pre/use/post observations do not provide atomic race resistance for a
  path-only external tool or defeat a same-UID swap-and-restore adversary.

No historical Expected value, run/result, container identity, evidence class,
or `Observed` status was changed or reinterpreted.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, routed M4/frozen-research documents, initial review, remediation prompt, and re-review prompt | Read without Docker, retained-state access, or external communication. |
| Exact `git grep` over the six tracked source paths, corresponding focused tests, and `verify-static.mjs` for numeric identity, old transfer keys, filesystem operations, settlement, fixed basenames, modes, and retained inventory | Exit 0; reproduced numeric `dev`/`ino`, `m4-file-*`, short-lived handles, fixed `close` listeners, all nine result basenames, and the fixed runtime-CLI recovery inventory including its `0644` file. |
| Exact `git ls-files` plus sorted SHA-256 manifest and critical `sha256sum` | Exit 0; reproduced the reviewed aggregate and ordinary entry/output hashes above. |
| Exact ordinary entry/package reachability scan | Exit 0; reproduced the fail-closed source/output boundary and no package-root production export. |
| `git diff --check` before review edits | Exit 0. |
| Focused Prettier check over this review and the two status records | Exit 0; all three files matched repository formatting. |
| `git diff --check` after review/status edits | Exit 0 for tracked changes; the new review/status files were also covered by the focused formatter check. |

No test, typecheck, build, broad verification, staging rebuild, Docker/container
command, runtime-socket operation, result-root or retained-state read, external
network, credential, host-home access, Remote Git, publication, deployment, or
third-party communication was used. Standing authorization was not needed
because this review did not reach an approved execution action.

## Exact blocked boundary and next task

No M4 identity source, type, test, static-verifier, activation object, compiled
output, profile, runtime identity, or execution gate may be changed from this
snapshot. The next task is one Docker-free contract-only residual M4-FS01
remediation limited to:

1. closing the ownership/full-mode/settlement/disposition contract for every
   fixed runtime-CLI-created Docker configuration and recovery-state role;
2. reconciling that rule with the first implementation allowlist, acceptance,
   negative tests, cooperative-host limitation, and content-non-read boundary;
3. updating only `docs/m4-exact-filesystem-identity.md`, minimal authoritative
   status records, and one new fresh independent re-review prompt; and
4. using exact tracked-source assertions only, without tests, Docker, retained
   state, runtime identities, or `Observed` changes.

Next: perform the bounded Docker-free residual M4-FS01 contract remediation,
then request a fresh independent read-only re-review before any implementation.
