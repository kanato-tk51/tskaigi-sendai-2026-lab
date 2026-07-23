# M0/M2-A npm-acquisition producer execution-gate contract review

## Review target and decision

- Target: frozen-research issue #43's proposed npm-acquisition producer
  execution gate
- Review type: fresh independent Docker-free read-only contract review
- Review prompt:
  [m2-a-evidence-transfer-npm-acquisition-execution-gate-review](../../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-review.md)
- Decision: **BLOCKED; no producer occurrence or external communication is
  approved**
- Blocking findings: M2A-NGR01 and M2A-NGR02 below
- Closed in this review: M2A-NG02, M2A-NG04, M2A-NG05, and M2A-NG06 at
  contract scope
- Remaining open: M2A-NG01 and M2A-NG03, and therefore the complete
  one-occurrence execution gate
- Contract/source repair or producer execution performed in this review: none

The credential-empty two-request transport, bounded process/no-retry
disposition, later candidate review, and explicit external-communication
authority boundary are coherent at contract scope. The exact invocation and
durable-root identity are not: the entry accepts executable and script-argv
shapes beyond the contract's sole serialized command, while the contract
requires a one-link directory that production accepts with any positive link
count.

No positive execution handoff follows this decision. Standing authorization
was not needed or used, and could not authorize the external occurrence in any
case.

## Reproduced executable closure

The current regular-file closure reproduced exactly:

| Order | Repository-relative path | Bytes | SHA-256 |
| ---: | --- | ---: | --- |
| 1 | `experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs` | 789 | `97901fa507da68e31e1598e8ba1570daa6cc74c9f8c22a2c334fe8fb1707505a` |
| 2 | `experiments/npm12-install/scripts/m2a-transfer-inputs.mjs` | 112,299 | `edac896625a2b534438d4ff9cfd4f92d06a69ee902dbfb892876a72f6fd250b7` |
| 3 | `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` | 81,269 | `578235922220093be45eee6a2d18c6f21d624f2dab4e6109562890f7693d4755` |

The ordered
`<lowercase-hex><two spaces><repository-relative-path><LF>` aggregate is
`sha256:c47ea6028eb2326d3a7dbbd334d59268656d62c5b627bcf59dfc654759cf4df6`.
None of the three paths is a symlink.

The repository remains an accumulated uncommitted multi-session worktree, and
all three paths are untracked relative to `main`. As in the preceding
dependency-input implementation review, Git alone cannot attribute these
older candidate paths to one worker. This review used their exact recorded and
current byte identities without resetting, staging, or rewriting them.

Static import inspection reproduced:

```text
acquire-m2a-transfer-npm.mjs
  -> ./m2a-transfer-inputs.mjs
       -> ./m2a-transfer-construction.mjs
```

The entry has no other repository-local edge, the input module has no other
repository-local edge, and the construction module has none. None of the three
contains a dynamic import, `require`, `createRequire`, evaluation loader, or
top-level filesystem, network, process, compiler, constructor, Docker,
transfer, result, or evidence action. Construction's top-level work is
constant creation and recursive freezing only.

The acquisition call graph reaches the two fixed `https.request()` operations,
held-parent/root operations, archive and receipt publication transactions,
canonical validators, digests, and final inventory validation. It does not
reach construction's `spawn`, compiler, archive-construction, context,
Docker, transfer, result, or evidence functions. Root package scripts do not
name either producer entry. The focused test and static verifier import only
the side-effect-free support modules and read the producer entry as source
text.

## M2A-NG decision summary

| Item | Contract-scope decision |
| --- | --- |
| M2A-NG01 — exact producer source and invocation identity | **BLOCKED by M2A-NGR01** |
| M2A-NG02 — credential-empty external transport boundary | **CLOSED at contract scope; external occurrence remains separately unauthorized** |
| M2A-NG03 — durable one-shot occurrence and publication transaction | **BLOCKED by M2A-NGR02** |
| M2A-NG04 — bounded process settlement and no-retry disposition | **CLOSED at contract scope** |
| M2A-NG05 — candidate review and evidence separation | **CLOSED at contract scope** |
| M2A-NG06 — explicit external-communication authority boundary | **CLOSED at contract scope; standing authorization cannot substitute** |

## M2A-NG02 transport decision

The request plan fixes two sequential in-process HTTPS GETs to
`registry.npmjs.org:443`: metadata
`/npm/12.0.1`, then archive `/npm/-/npm-12.0.1.tgz`. Each plan fixes HTTPS,
GET, server name, port, certificate verification, TLS 1.2 minimum, no agent
reuse, exact `Accept`, `Accept-Encoding: identity`, and
`Connection: close` headers, exact content types, 30,000 ms absolute
deadline, 250 ms destroy grace, 1,000 ms close deadline, and
1,048,576/67,108,864-byte bounds.

Production issues only those two `https.request()` calls and no child,
redirect, proxy, retry, alternate registry, loopback, or Unix-socket request.
It rejects bad status/header/encoding/length/bounds/EOF/close state and settles
the write chain before success. Metadata must bind npm `12.0.1`, the exact
archive URL, and canonical SHA-512 SRI. The held archive must reproduce that
SRI while separately binding byte length and SHA-256.

The serialized `/usr/bin/env -i -- /usr/bin/node ...` command supplies no
caller environment, stdin authority, shell interpolation, npm configuration,
home/cache, proxy, certificate override, credential, token, or cookie. This
contract closure does not pin DNS, certificate, CDN, trust-store bytes, actual
registry SRI, archive length, or archive digest. Those remain unknown future
transport/candidate observations.

## M2A-NG03 transaction direction

Production checks the final root name absent from a held `.work` parent,
exclusively creates the fixed mode-`0700` child, revalidates the parent and
new child, syncs the held parent, and closes it before the first request.
Present or uncertain state fails without opening the root. A root committed
before later failure remains the generation-consuming non-evidence
occurrence; no code path retries, repairs, removes, or resumes it.

Archive and receipt publication each use exclusive mode-`0600` staging,
complete held-descriptor write, sync, reread, mode-`0444` transition,
identity validation, known close, exact rename, held-directory inventory
correlation, and held-directory sync. The archive completes before receipt
creation. The canonical receipt binds the archive length, SHA-256, registry
SRI, `scriptsRun: false`, `credentialsUsed: false`,
`externalNetworkPhase: "dependency-acquisition-only"`, and
`evidenceReview: "not-performed"`. Final success requires only the two
mode-`0444`, one-link regular files.

Those publication and retention semantics are coherent. M2A-NG03 remains
blocked only because the root directory link contract does not match
production.

## M2A-NG04 through M2A-NG06 decisions

The entry's nominal terminals are the fixed success stdout line with natural
exit `0` or fixed failure stderr line with exit `1`. A future executor must
classify signal, lost settlement, write/capture failure, both streams,
extra/truncated output, exit/output contradiction, or interruption as
Inconclusive and never retry. Request timers and byte bounds are exact; local
descriptor/directory work remains a cooperative-filesystem assumption rather
than a hostile-kernel or machine-crash deadline.

A separate fresh read-only result review must correlate fixed-root identity,
exact two-child inventory, staging absence, archive size/SHA-256/SHA-512/SRI,
canonical receipt bytes/hash, receipt/archive cross-binding, and process/
filesystem agreement. Visibility cannot update either null reviewed
acquisition binding, execute npm, construct, run Docker, ingest evidence, or
promote `Observed`.

Contract review, static/unit verification, explicit external occurrence,
process projection, durable candidate, candidate review, construction
binding, construction, runtime result, and `Observed` remain separate.
M2A-NG06 correctly requires separate explicit human authorization for DNS and
the two HTTPS requests, the fixed-root retained side effects, the
generation-consuming no-retry occurrence, and the later fixed-root review.
Continuing-work standing authorization, dependency acquisition for ordinary
development, Remote Git authority, or any earlier review cannot substitute.

## Blocking findings

### M2A-NGR01 — the producer entry does not bind the exact executable/argv identity

The contract says the entry independently rejects every `process.argv` shape
except the fixed Node executable plus its own script path and names the exact
serialized command as the final authority. The current entry checks only:

```text
process.argv.length === 2
empty own-key environment
import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
```

It never requires `process.argv[0] === "/usr/bin/node"` and does not require
`process.argv[1]` to equal the single repository-relative string
`experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs`. A different
Node executable with an empty environment and an absolute, `./`-prefixed, or
otherwise equivalent resolved script spelling can therefore pass the entry's
own gate and call `runFixedNpmAcquisitionEntry()`.

The contract can forbid alternate commands, but that is not the independent
entry enforcement it claims and does not satisfy M2A-NG01's exact invocation
identity requirement. The smallest remediation must choose and bind one exact
coherent authority: either make the entry validate the fixed executable and
script argv representation with focused inverse/static coverage, or weaken
the false entry-enforcement claim while defining an exact separately reviewed
executor that supplies and validates the sole command. No producer occurrence
may precede a fresh re-review.

### M2A-NGR02 — the acquisition-root link requirement contradicts production

The contract requires the final acquisition root to be a “one-link”,
non-symlink mode-`0700` directory and asks later review to reproduce its link
identity. `createHeldDirectoryChild()` rejects the new directory only when
`added.identity.links < 1`; it therefore accepts every positive directory link
count and never proves an exact one-link root. This is materially different
from publication files, for which production requires `links === 1`.

The smallest remediation must choose the exact supported directory-link
semantics and make the contract, production transition, focused fake/inverse
coverage, and later result-review rule agree. It must not infer regular-file
one-link semantics for a Linux directory or claim an exact value while
production accepts an open range.

## Verification and observed results

| Command | Observed result |
| --- | --- |
| `git status --short` and scoped AGENTS/document/source inspection | Existing accumulated dirty worktree preserved; no cleanup, reset, staging, or unrelated edit. |
| `wc -c` and `sha256sum` over the exact ordered three-file closure, followed by `sha256sum` of the emitted rows | Reproduced 789 / 112,299 / 81,269 bytes, all three recorded hashes, and aggregate `c47ea6…f4df6`; all three paths are regular and untracked relative to `main`. |
| Static import/call-graph, entry, request, publication, receipt, root-link, construction-binding, and root-script inspection | Reproduced the two local import edges, closed acquisition call graph, exact request/publication direction, null bindings, false runtime approval, evidence separation, and both blocking contradictions. |
| `npm run m2a:transfer:verify` | Exit `0`; static verification passed and 1 focused file / 62 tests passed without importing or executing either producer entry. |
| Focused Prettier check over the contract, review prompt, this review, and eight other status records | Exit `0`; all selected files matched Prettier style. |
| `git diff --check` | Exit `0`; no whitespace error was reported in the accumulated tracked diff. |

Passing checks are Docker-free static/unit cooperative-host evidence only.
They do not establish live DNS/TLS/registry behavior, candidate bytes,
filesystem/process settlement, hostile-host resistance, external occurrence,
candidate acceptance, construction, Docker, runtime result, or `Observed`.

`m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, either producer entry, the
fixed acquisition/toolchain/construction/result roots, host environment or
`/usr/bin/node` inspection, npm acquisition/install/pack/approve/rebuild,
lifecycle fixtures, DNS, external/loopback/Unix-socket communication, child
producer/compiler/constructor execution, image build, Docker, transfer,
candidate/result validation, cleanup, retry, Remote Git, publication,
deployment, construction binding, evidence promotion, and standing
authorization were intentionally not used.

## Exact smallest next boundary

Save one exact bounded Docker-free M2A-NGR01/M2A-NGR02 contract-remediation
prompt and one fresh independent re-review prompt before changing the contract
or source. That prompt-only task may bind only the exact producer invocation
authority and acquisition-root directory-link semantics, focused static/unit
coverage required by those choices, this contract, and minimal status records.
It must not execute/import the producer, access a fixed root or host
environment/runtime, communicate externally, acquire npm bytes, construct,
call Docker, inspect runtime/result state, or promote evidence.

Next: save the exact bounded Docker-free M2A-NGR01/M2A-NGR02
contract-remediation prompt and fresh independent re-review prompt; do not
repair contract/source/tests or execute the producer in that prompt-only task.
