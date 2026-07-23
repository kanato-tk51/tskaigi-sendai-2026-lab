# M0/M2-A npm-acquisition producer execution-gate contract

Status: **M2A-NGR01/M2A-NGR02 Docker-free remediation candidate complete;
M2A-NG02, M2A-NG04, M2A-NG05, and M2A-NG06 retain contract-scope closure;
M2A-NG01/M2A-NG03 remain open pending fresh independent read-only re-review;
the producer was not imported or executed, and the fixed acquisition root,
host environment/runtime, external communication, npm candidate,
construction, Docker, runtime/result, and evidence remain untouched**

Contract date: 2026-07-23

This issue #43 contract follows the independently approved Docker-free
dependency-input implementation. It binds the current npm-acquisition
producer, its complete repository-local executable closure, one
credential-empty two-request external boundary, the durable one-shot
occurrence, bounded process result, and a later read-only candidate review. It
does not execute or import the producer, inspect or create the acquisition
root, access the host Node executable or environment, communicate externally,
observe npm bytes, accept an input, update construction bindings, or promote
evidence.

## Decision IDs and maximum review decision

The fresh contract review must decide:

- **M2A-NG01 — exact producer source and invocation identity**
- **M2A-NG02 — credential-empty external transport boundary**
- **M2A-NG03 — durable one-shot occurrence and publication transaction**
- **M2A-NG04 — bounded process settlement and no-retry disposition**
- **M2A-NG05 — candidate review and evidence separation**
- **M2A-NG06 — explicit external-communication authority boundary**

The maximum positive decision closes only M2A-NG01 through M2A-NG06 at
contract scope. It may make exactly one later producer occurrence eligible
only after a person explicitly authorizes the fixed external communication and
fixed-root side effects described here. It does not itself authorize or
execute that occurrence. The continuing-work standing authorization cannot
substitute for that explicit authorization because the occurrence performs
external communication.

No positive decision approves a second attempt, alternate registry, changed
source, fixed-root inspection, npm extraction, package execution,
constructor-toolchain capture, construction, compilation, image work, Docker,
transfer, result acceptance, evidence ingestion, matrix/presentation use, or
an `Observed` value.

## Preserved upstream boundary

The following independently reviewed values remain unchanged:

| Role | Exact value |
| --- | --- |
| Generation | `20260721-01` |
| Package | `npm` |
| Version | `12.0.1` |
| Acquisition root | `experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01` |
| Archive | `experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01/npm-12.0.1.tgz` |
| Receipt | `experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01/acquisition.json` |
| Construction root | `experiments/npm12-install/.work/m2a-transfer-construction-20260721-01` |
| Result root | `results/runs/m2-a/m2a-npm-lifecycle-20260721000000000000000000000001` |
| Source aggregate | `sha256:4fcdb65f903e257fc6eb0ac3d12f028312ed5e8c14d09c9a68f4cc3b536aef04` |
| Construction baseline aggregate | `sha256:fe3da65eaf3a727892599bc8c5ecc30fedded5ef0b44614c5629762539f56526` |

M2A-TR01 through M2A-TR06, M2A-CG01 through M2A-CG06,
M2A-CGI01 through M2A-CGI04, M2A-IB01 through M2A-IB06, and
M2A-IBI01/M2A-IBI02 retain their recorded Docker-free contract or
static/unit cooperative-host closure. Both reviewed acquisition bindings in
`M2A_CONSTRUCTION` remain `null`, `runtimeExecutionApproved` remains `false`,
and every `evidenceReview` remains `not-performed`.

Historical results and images, retained runtime state, home/cache directories,
global installations, ordinary root `node_modules`, credentials, proxy
configuration, caller environment, and the future toolchain/construction/
result roots are not acquisition inputs. The producer may not inspect, repair,
reuse, remove, or derive an acceptance decision from them.

## M2A-NG01 — exact producer source and invocation identity

### Complete repository-local executable closure

The current executable closure has exactly these three paths in this order:

| Order | Repository-relative path | Bytes | SHA-256 |
| ---: | --- | ---: | --- |
| 1 | `experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs` | 1,166 | `bd4066ad6788aca2847c257907f91a29aec7f85d7a249d2789edbce4c9f5f7df` |
| 2 | `experiments/npm12-install/scripts/m2a-transfer-inputs.mjs` | 112,299 | `edac896625a2b534438d4ff9cfd4f92d06a69ee902dbfb892876a72f6fd250b7` |
| 3 | `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` | 81,269 | `578235922220093be45eee6a2d18c6f21d624f2dab4e6109562890f7693d4755` |

The ordered aggregate is
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`,
calculated over one
`<lowercase-hex><two spaces><repository-relative-path><LF>` row per table row.

The entry has one repository-local static edge to
`./m2a-transfer-inputs.mjs`; that module has one repository-local static edge
to `./m2a-transfer-construction.mjs`; the construction module has no
repository-local import. The declaration file is a static/unit construction
object, not an executable input. No package export, root package script,
workspace entry, dynamic import, `require`, `createRequire`, evaluation-based
loader, symlink, generated output, or ignored path belongs to this closure.

The construction module is present only because the shared input module
imports its frozen constants and aggregate helper. A positive review must
prove that import is side-effect-free and that the acquisition call graph does
not reach its child-process, archive, compiler, construction, Docker, transfer,
or result functions. Merely observing that those functions were not called in
a unit test is insufficient.

The fixed Node target is `/usr/bin/node`. The contract inherits the repository
host floor of Linux, `x64`, and Node.js `v20.18.2`; it does not claim the
executable bytes, loader closure, default trust-anchor bytes, or a hostile-host
guarantee. The exact lexical host command object is an adjacent-preflight
constraint. Inside Node, the production entry independently requires
`process.execPath`, `process.argv0`, and `process.argv[0]` to equal
`/usr/bin/node`; `process.argv.length` to equal `2`; `process.argv[1]` to equal
the canonical `fileURLToPath(import.meta.url)` entry path; `process.cwd()` to
equal the repository root derived only from that fixed module location; and
the environment descriptor object to have zero own keys. Every mismatch
reaches `M2A_INPUT_AUTHORITY_REJECTED` before the acquisition function.

Node canonicalizes the script path before the entry can inspect
`process.argv[1]`. The entry therefore cannot reconstruct whether the
host-command script token was repository-relative, absolute, or
`./`-prefixed. Alternate lexical spellings remain ineligible because the
adjacent preflight admits only the exact reviewed host command below, not
because the entry can distinguish their original spelling.

### Fresh adjacency preflight

Before a later occurrence can be presented for explicit authorization, a
fresh worker must independently reproduce:

1. all three exact path/size/SHA-256 rows and the ordered aggregate;
2. the exact two-local-edge closure and its import-time side-effect absence;
3. the fixed request plan, publication transaction, terminal output, and
   producer-entry argument/environment checks;
4. `npm run m2a:transfer:verify` with no producer import or execution; and
5. unchanged null construction bindings, false execution approval, and
   `not-performed` evidence state.

The successful final full-byte/hash preflight and the later command occurrence
must be adjacent. No formatter, test, compiler, filesystem write, repository
mutation, dependency operation, or other command may intervene. Any source,
path, import-edge, status, or worktree drift makes the reviewed command
ineligible and requires a new contract decision.

This is a cooperative-host adjacency boundary. It is not an atomic
path-execution primitive and does not prevent a hostile same-UID process,
kernel, loader, DNS resolver, trust store, or registry from changing after
preflight.

## M2A-NG02 — credential-empty external transport boundary

The only eligible lexical host launch has:

```text
executable: /usr/bin/env
argv: [-i, --, /usr/bin/node, experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs]
cwd: exact repository root
environment own keys: []
shell: false
```

The host-side serialized command is fixed as:

```sh
/usr/bin/env -i -- /usr/bin/node experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs
```

`/usr/bin/env -i --` is only the fixed credential-empty host launch prefix; it
must not add an environment key, argument, retry, redirect, alternate
executable, or shell-visible interpolation. The adjacent preflight binds that
exact lexical object and supplies it directly with `shell: false`. The Node
entry separately binds the exact process-observable executable, original argv
zero, canonical argv, repository cwd, and empty environment described in
M2A-NG01. It cannot observe the original lexical script spelling after Node
canonicalization. A reviewer must reject any alternate host command or
execution route that depends on a caller `PATH`, inherited environment, npm
configuration, home, cache, proxy, certificate override, credential, token,
cookie, stdin, command substitution, or user-selected URL/version/root.

After the acquisition root has durably committed, the producer may make only
these two sequential in-process Node HTTPS GET requests:

```text
1. https://registry.npmjs.org/npm/12.0.1
2. https://registry.npmjs.org/npm/-/npm-12.0.1.tgz
```

Both fix hostname and TLS server name `registry.npmjs.org`, port `443`,
`rejectUnauthorized: true`, minimum TLS `1.2`, no client certificate, no
proxy, no redirect, no connection reuse, and `Accept-Encoding: identity`.
Apart from Node's required `Host` header, the exact headers are the reviewed
`Accept`, `Accept-Encoding`, and `Connection: close` rows. Normal DNS
resolution for that hostname and the two HTTPS response streams are the whole
external boundary. No other hostname, address, protocol, registry fallback,
loopback endpoint, Unix socket, child, npm process, or package script is
authorized.

Each request retains the reviewed 30,000 ms absolute deadline, 250 ms destroy
grace, 1,000 ms request/response close deadline, exact status/content
type/encoding/length/EOF checks, and 1,048,576-byte metadata or
67,108,864-byte archive bound. No request is retried. Metadata remains
untrusted until its exact package/version/tarball URL and canonical SHA-512 SRI
pass validation. The streamed archive remains untrusted until its held bytes
match that SRI and its independently calculated byte length, SHA-256, and
SHA-512.

This boundary does not pin a registry certificate, DNS answer, CDN address, or
actual npm archive digest. HTTPS server authentication and the registry's SRI
are transport/candidate checks, not evidence acceptance. Those remaining
observations must be reported by the later candidate review.

## M2A-NG03 — durable one-shot occurrence and publication transaction

The producer must prove the final acquisition-root name absent from its held
repository-relative parent before external communication. It then exclusively
creates that exact effective-user-owned, non-symlink mode-`0700` directory
whose observed link count is a positive integer (`links >= 1`). That positive
value remains part of every existing identity correlation; it is not a
filesystem-independent exact-link or authenticity claim. The durable
directory commit starts and consumes the acquisition occurrence. No DNS lookup
or request may start before that commit.

A present or uncertain root stops without inspection, communication, cleanup,
repair, overwrite, or retry. A known root-creation failure before commit starts
no external occurrence, but this gate still authorizes no automatic or second
invocation. Any process loss or failure at or after the commit retains the
root as the durable non-evidence occurrence and consumes this generation.

The only permitted children and publication order are:

```text
npm-12.0.1.tgz.next -> npm-12.0.1.tgz
acquisition.next    -> acquisition.json
```

The archive transaction must complete the bounded response write, sync,
same-descriptor reread and byte/digest comparison, mode change to `0444`,
identity revalidation, known close, exact rename, and held-root sync before
receipt creation begins. The receipt must be the reviewed canonical one-line
`m2a-transfer-acquisition/v1` record binding the same held archive length,
SHA-256, and registry SRI with `scriptsRun: false`,
`credentialsUsed: false`,
`externalNetworkPhase: "dependency-acquisition-only"`, and
`evidenceReview: "not-performed"`.

The receipt transaction must complete its exclusive mode-`0600` staging
write, sync, same-descriptor reread, mode change to `0444`, identity
revalidation, known close, exact rename, and held-root sync. Success requires
exactly the final archive and receipt as one-link effective-user-owned
mode-`0444` regular files and no staging child.

Any request, stream, validation, digest, filesystem, identity, sync, rename,
close, inventory, or terminal-output failure retains the exact reached root
state. No branch deletes, repairs, resumes, republishes, or converts that state
to evidence.

## M2A-NG04 — bounded process settlement and no-retry disposition

The production entry emits only fixed sanitized terminal lines:

| Process terminal | Stdout | Stderr | Natural exit |
| --- | --- | --- | ---: |
| acquisition function fulfilled and exact success line observed by the host | `M2A_INPUT_ACQUISITION_COMPLETE\n` | empty | `0` |
| acquisition function rejected before success output | empty | `M2A_INPUT_ACQUISITION_FAILED\n` | `1` |

The later executor must capture stdout and stderr separately without
interpolation and require natural process settlement. A signal, lost process
settlement, output mismatch, both streams nonempty, extra byte, output
truncation, host-tool failure, or contradiction between exit and output is
`Inconclusive`. It never authorizes another occurrence. A success line or exit
zero is only a candidate projection and does not prove the archive/receipt
transaction.

The in-process request deadlines and byte bounds are exact. Local descriptor
and directory operations rely on the cooperative repository filesystem and do
not establish a hostile-kernel or machine-crash deadline. A person authorizing
the occurrence must be told that an externally interrupted or host-lost
process consumes the generation once the root may have committed.

Exactly one command occurrence is the maximum. There is no automated retry,
manual retry under the same review, cleanup, root inspection in the execution
session, signal-driven recovery, alternate command, or second registry
attempt. The execution session records only bounded process output, natural
exit/signal settlement, and whether the command occurrence was issued. It does
not classify root contents.

## M2A-NG05 — candidate review and evidence separation

After the one occurrence, a separate fresh Docker-free read-only result review
must use a saved prompt that is bound to the exact command occurrence and only
the fixed acquisition root. The execution worker must not inspect that root or
accept the candidate.

The result review must independently determine:

- root presence/type/mode/owner/positive-link-count/identity and exact
  two-child inventory, retaining the observed positive link value through
  identity correlation;
- absence of both staging names and every extra child;
- exact archive type/mode/link/size/SHA-256/SHA-512;
- canonical receipt bytes, schema, key order, values, and receipt SHA-256;
- receipt/archive length, SHA-256, and SRI cross-binding;
- whether process output/exit and durable filesystem state agree; and
- whether the candidate is accepted, rejected, or Inconclusive without repair.

Visibility is not acceptance. Before that review,
`reviewedAcquisitionReceiptSha256` and
`reviewedAcquisitionTarballSha256` stay `null`. The review may record accepted
candidate identities for a later separately reviewed construction-binding
change; it may not perform that change, extract or execute npm, capture the
toolchain, construct an image, run Docker, ingest evidence, or promote
`Observed`.

Contract definition, static/unit verification, an external producer
occurrence, bounded process output, durable candidate bytes, candidate review,
construction binding, construction, runtime result, and `Observed` are
separate evidence classes.

## M2A-NG06 — explicit external-communication authority boundary

The fresh contract review is Docker-free and read-only. It may inspect only
tracked repository source and documentation, compute in-memory/source-file
hashes, run the existing Docker-free static/unit verification, and write its
review/status records. It must not import or execute the producer, access the
fixed acquisition root, inspect `/usr/bin/node` bytes or host environment,
resolve DNS, open a socket, or observe future npm bytes.

If M2A-NG01 through M2A-NG06 close, the review may name only the exact
adjacent-preflight and one-occurrence candidate above. Execution still pauses
for a person's explicit authorization covering:

1. the exact two HTTPS requests and normal DNS for
   `registry.npmjs.org`;
2. exclusive creation and retained failure state under the one fixed ignored
   acquisition root;
3. the fact that one issued occurrence is generation-consuming and never
   retried; and
4. a later separate read-only review of that fixed candidate root.

Standing authorization was not used to define this contract and cannot be
used for that external occurrence. Approval of ordinary repository work,
dependency acquisition for development, Remote Git, or a different network
purpose is not equivalent.

## Contract-task evidence and handoff

This prompt-only contract task read only tracked repository documentation and
source needed to bind the candidate. It calculated the three tracked-source
sizes/hashes and ordered aggregate. It did not import or execute the producer,
access the acquisition/toolchain/construction/result roots, inspect
`/usr/bin/node`, environment, credentials, home/cache, proxy or certificate
configuration, resolve DNS, communicate externally, run npm, acquire or
inspect npm bytes, construct, compile, build an image, call Docker, transfer,
review a candidate, update a construction binding, promote evidence, or use
standing authorization.

Actual registry SRI, archive bytes/size/SHA-256, receipt bytes/SHA-256,
filesystem identities, process result, and candidate decision remain unknown.

Next: perform the fresh independent Docker-free read-only M2A-NG01 through
M2A-NG06 contract review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-review.md`;
do not execute or import the producer, access the acquisition root or host
environment, inspect `/usr/bin/node`, or use external communication.

## Fresh independent contract-review decision

The fresh Docker-free read-only review is `BLOCKED` on M2A-NGR01 and
M2A-NGR02. M2A-NG02, M2A-NG04, M2A-NG05, and M2A-NG06 close at contract
scope. M2A-NG01 remains open because the entry checks argument count, empty
environment, and resolved self URL but does not bind `process.argv[0]` to
`/usr/bin/node` or `process.argv[1]` to the contract's sole lexical script
argument. M2A-NG03 remains open because the contract requires a one-link
acquisition-root directory while production accepts every positive directory
link count.

The review reproduced the three source sizes/hashes and
`sha256:c47ea6028eb2326d3a7dbbd334d59268656d62c5b627bcf59dfc654759cf4df6`
aggregate, exact two-local-edge import closure, closed acquisition call graph,
credential-empty two-request direction, root-first retained transaction,
process/result separation, and explicit-human authority boundary. Focused
transfer verification passes 1 file / 62 tests.

No producer, fixed root, host environment/runtime, external communication,
npm candidate, construction, Docker, runtime/result, evidence, Expected, or
`Observed` boundary was used. Standing authorization was not used and cannot
authorize the external occurrence.

Next: save the exact bounded Docker-free M2A-NGR01/M2A-NGR02
contract-remediation prompt and fresh independent re-review prompt; do not
repair contract/source/tests or execute the producer in that prompt-only task.

## M2A-NGR01/M2A-NGR02 remediation prompt handoff

The exact bounded Docker-free remediation prompt is saved at
`../prompts/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation.md`,
with its fresh independent re-review prompt saved under `../prompts/reviews/`
before any contract, entry, verifier, or focused-test repair. The later task
must preserve the sole serialized host command while distinguishing its
lexical script token from Node's canonical process-observable argv, enforce
the exact executable/argv/cwd/empty-environment entry guard, and use the
existing positive-link-count rule for the acquisition-root directory without
weakening exact-one archive/receipt files.

Only the saved prompt pair and this minimal status record changed. No
execution-gate requirement, implementation, verifier, test, producer, fixed
root, host environment/runtime, external communication, npm candidate,
construction, Docker, runtime/result, evidence, Expected, or `Observed`
boundary changed or was used. Standing authorization was not used and cannot
authorize the external occurrence. M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06
retain contract-scope closure; M2A-NG01/M2A-NG03 remain open.

Next: perform the exact bounded Docker-free M2A-NGR01/M2A-NGR02 remediation
under the saved prompt; do not import or execute the producer, access the
fixed acquisition root or host environment/runtime, or use external
communication.

## M2A-NGR01/M2A-NGR02 remediation candidate

The bounded Docker-free remediation now separates the exact lexical host
command from Node's canonical process-observable state. The acquisition entry
requires exact `process.execPath`, original and canonical argv zero, argv
length, canonical entry path, repository cwd derived from the fixed module
location, and zero environment own keys before producer reachability. Static
verification extracts that one guard boundary and proves its executable,
argv, cwd, environment, and pre-producer-order weakening variants fail.

The acquisition-root contract now matches production's exact positive
directory-link predicate (`links >= 1`) and retains the observed positive
value through existing identity correlation. Function-scoped static inverse
coverage rejects zero links and an exact-one directory substitution while
requiring the existing exact-one staging, final archive/receipt, and final
inventory file checks.

The three-file executable closure remains the same two-local-edge graph. Its
fresh ordered identities are:

| Order | Repository-relative path | Bytes | SHA-256 |
| ---: | --- | ---: | --- |
| 1 | `experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs` | 1,166 | `bd4066ad6788aca2847c257907f91a29aec7f85d7a249d2789edbce4c9f5f7df` |
| 2 | `experiments/npm12-install/scripts/m2a-transfer-inputs.mjs` | 112,299 | `edac896625a2b534438d4ff9cfd4f92d06a69ee902dbfb892876a72f6fd250b7` |
| 3 | `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` | 81,269 | `578235922220093be45eee6a2d18c6f21d624f2dab4e6109562890f7693d4755` |

The ordered aggregate is
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.
Focused transfer verification passes 1 file / 62 tests, existing M2-A
verification passes 4 files / 5 tests, and root typecheck passes. Aggregate
root tests retain 99 passing / 10 failing files and 826 passing / 39 failing
tests; aggregate `check` stops at eight pre-existing out-of-scope formatting
warnings.

M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 retain contract-scope closure.
M2A-NG01/M2A-NG03 and M2A-NGR01/M2A-NGR02 remain open pending the saved fresh
independent re-review. Neither reviewed construction binding changed,
`runtimeExecutionApproved` remains `false`, and every `evidenceReview` remains
`not-performed`.

No producer was imported or executed; no fixed root, host environment/runtime,
external communication, npm candidate, construction, Docker, runtime/result,
Expected, or `Observed` boundary was accessed or produced. Standing
authorization was not used and cannot authorize the later external
occurrence.

Next: perform the fresh independent Docker-free read-only M2A-NGR01/M2A-NGR02
remediation re-review under
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation-review.md`;
do not repair source/tests, execute the producer, access fixed or host runtime
state, or use external communication.

## M2A-NGR01/M2A-NGR02 remediation re-review decision

The fresh independent Docker-free read-only re-review is `APPROVED` at
contract/static entry-guard scope. It independently reproduces the exact
lexical `/usr/bin/env -i -- /usr/bin/node ...` host object, the separate
canonical executable/argv/cwd/empty-environment entry guard before producer
reachability, the honest post-Node lexical limitation, and the guard's
in-memory weakening failures.

Production and the contract consistently use positive acquisition-root
directory links while exact-one staging, archive, receipt, and final inventory
file checks remain required. Function-scoped weakening cases preserve that
distinction. The three-file aggregate remains
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.

M2A-NGR01/M2A-NGR02 and M2A-NG01/M2A-NG03 close. M2A-NG02/M2A-NG04/
M2A-NG05/M2A-NG06 retain closure, so M2A-NG01 through M2A-NG06 are complete
only at Docker-free contract/static entry-guard scope. Null acquisition
bindings, false runtime approval, `not-performed` evidence, and the
explicit-human external authority boundary remain unchanged.

No producer, fixed root, host environment/runtime, external communication,
npm candidate, construction, Docker, runtime/result, Expected, or `Observed`
boundary was accessed or produced. Standing authorization was not used and
cannot authorize the later external occurrence.

Next: save the exact adjacent-preflight/one-occurrence execution prompt and
separate Docker-free fixed-root result-review prompt; do not execute the
producer, access fixed or host runtime state, or use external communication in
that prompt-only task.

## One-occurrence execution/result-review prompt handoff

The exact execution prompt is saved at
`../prompts/m2-a-evidence-transfer-npm-acquisition-execution.md`:

```text
bytes: 12829
sha256: cab8482f8ace0b3ad1460e95b1419965a92bd3e00e2ebd501b5e8f82757b0d8f
```

The separate Docker-free result-review prompt is saved at
`../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md`:

```text
bytes: 13241
sha256: a62a49b16a94bcd75a289e8b6da97eba6cb2e1973f893fa60c013fb5a856aa8b
```

The execution prompt:

- requires a current explicit human authorization naming its exact four-part
  M2A-NG06 DNS/HTTPS, retained fixed-root, generation-consuming no-retry, and
  later-review boundary;
- reproduces the approved three-file closure and all static sentinels without
  producer import;
- binds the final full-byte/hash decision immediately to one direct
  `/usr/bin/env` child with fixed argv/cwd, empty environment, and
  `shell: false`;
- records only bounded natural/unknown settlement and stream identities; and
- forbids fixed-root inspection, classification, cleanup, recovery, and every
  retry.

The separate result-review prompt starts only from an authoritative exact
one-occurrence handoff. It allows no-follow bounded inspection only of
`experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01` and its
four recognized final/staging names. It requires exact root/file identity,
inventory, mode/link, archive SHA-256/SHA-512/SRI, canonical receipt, and
process/filesystem cross-binding before an `ACCEPTED`, `REJECTED`, or
`INCONCLUSIVE` decision. It cannot run the producer, communicate externally,
retry, repair, update construction bindings, construct, call Docker, or
promote evidence.

Only the prompt pair and minimal routing/status records changed. No producer,
fixed root, host environment/runtime, external communication, npm candidate,
construction, Docker, runtime/result, Expected, or `Observed` boundary was
accessed or produced. Standing authorization was not used and cannot authorize
the later external occurrence. All M2A-NG items remain complete only at
Docker-free contract/static entry-guard scope.

Next: a person must freshly review the exact saved prompt pair and explicitly
authorize all four M2A-NG06 effects before the one-occurrence execution prompt
may run; absent that authorization, stop without preflight, root access, or
external communication.
