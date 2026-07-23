# M0/M2-A npm-acquisition execution-gate remediation re-review

## Review target and decision

- Target: frozen-research issue #43 M2A-NGR01/M2A-NGR02 remediation
- Review type: fresh independent Docker-free read-only remediation re-review
- Review prompt:
  [m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation-review](../../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-execution-gate-remediation-review.md)
- Decision: **APPROVED at contract/static entry-guard scope; no producer
  occurrence or external communication is authorized**
- Closed in this review: M2A-NGR01, M2A-NGR02, M2A-NG01, and M2A-NG03
- Preserved closed: M2A-NG02, M2A-NG04, M2A-NG05, and M2A-NG06
- Remaining blocking finding in this remediation boundary: none
- Contract/source/test repair performed in this review: none

The remediation makes the exact lexical host command and Node's independently
observable process state complementary authorities rather than falsely
claiming that the entry can recover the original script spelling. It also
aligns every acquisition-root rule with production's positive directory-link
predicate while preserving exact-one staging, archive, and receipt files.
M2A-NG01 through M2A-NG06 are therefore closed only at Docker-free
contract/static entry-guard scope.

This decision names no eligible external occurrence by itself. A saved exact
adjacent preflight/one-occurrence prompt and a separate fixed-root result-review
prompt are still required before requesting explicit human authority for DNS,
the two HTTPS requests, the fixed-root retained side effects, generation
consumption with no retry, and the later read-only review. Continuing-work
standing authorization was not used and cannot substitute for that authority.

## Reproduced executable closure

The exact regular-file closure is:

| Order | Repository-relative path | Bytes | SHA-256 |
| ---: | --- | ---: | --- |
| 1 | `experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs` | 1,166 | `bd4066ad6788aca2847c257907f91a29aec7f85d7a249d2789edbce4c9f5f7df` |
| 2 | `experiments/npm12-install/scripts/m2a-transfer-inputs.mjs` | 112,299 | `edac896625a2b534438d4ff9cfd4f92d06a69ee902dbfb892876a72f6fd250b7` |
| 3 | `experiments/npm12-install/scripts/m2a-transfer-construction.mjs` | 81,269 | `578235922220093be45eee6a2d18c6f21d624f2dab4e6109562890f7693d4755` |

The ordered
`<lowercase-hex><two spaces><repository-relative-path><LF>` aggregate is
`sha256:88a7e55d63a8579d3ce7de58d2f65c20e2524665e2f412b3f9d3213ec12d9515`.
All three paths are regular, non-symlink repository source paths.

The entry has the sole repository-local edge
`./m2a-transfer-inputs.mjs`; that module has the sole repository-local edge
`./m2a-transfer-construction.mjs`; construction has no repository-local import.
The latter two paths retain exactly the hashes reproduced by the preceding
review, so the remediation's only executable-closure byte change is the entry.
No dynamic import, `require`, `createRequire`, evaluation loader, package
entry, root command, generated output, or fourth executable edge was found.

The entry imports functions but performs no filesystem, environment, network,
child-process, compiler, constructor, Docker, transfer, result, or evidence
action on ordinary import. The acquisition call graph still reaches only the
fixed input producer path; construction's child-process/compiler and
archive-construction functions are definitions outside that reachability.

## M2A-NGR01 and M2A-NG01 decision

The only reviewed lexical host command object remains:

```text
executable: /usr/bin/env
argv: [-i, --, /usr/bin/node, experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs]
cwd: exact repository root
environment own keys: []
shell: false
```

Its serialized display is exactly:

```sh
/usr/bin/env -i -- /usr/bin/node experiments/npm12-install/scripts/acquire-m2a-transfer-npm.mjs
```

The contract assigns that lexical object to the adjacent host preflight. It
adds no caller `PATH`, environment, shell, interpolation, stdin, URL, version,
root, executable, or retry authority.

Before the first producer call, the entry derives its canonical path from
`fileURLToPath(import.meta.url)` and derives the repository root only by
resolving `../../..` from that fixed module location. One exact guard requires:

- `process.execPath === "/usr/bin/node"`;
- `process.argv0 === "/usr/bin/node"`;
- `process.argv.length === 2`;
- `process.argv[0] === "/usr/bin/node"`;
- `process.argv[1]` equal to the canonical entry path;
- `process.cwd()` equal to the derived repository root; and
- zero own keys on the environment descriptor object.

Every mismatch reaches `M2A_INPUT_AUTHORITY_REJECTED` before
`runFixedNpmAcquisitionEntry()`. The existing canonical self-entry condition
remains separate and ordinary imports do not call `main()`.

The contract now states the residual limit accurately: after Node
canonicalizes the script path, the entry cannot distinguish whether the
pre-Node token was repository-relative, absolute, or `./`-prefixed. Those
alternate lexical commands are excluded by the adjacent preflight, while the
entry independently validates only observable canonical process state. The
boundary does not bind executable, loader, trust-anchor, kernel, or hostile
same-authority bytes and does not claim original-command-line proof.

The static verifier extracts the complete `main()` boundary, exact guard, and
unique producer call. In-memory variants weaken each executable, original
argv-zero, argument-count, canonical argv-zero, canonical argv-one, cwd, and
empty-environment relation; another moves the exact guard after the producer.
Every variant must fail the verifier's boundary predicate. The focused test
also confirms producer rejection precedes producer reachability without
importing the entry.

M2A-NGR01 and M2A-NG01 are closed at contract/static entry-guard scope.

## M2A-NGR02 and M2A-NG03 decision

`createHeldDirectoryChild()` opens the no-follow parent directory, holds and
correlates its identity and children, exclusively creates the mode-`0700`
child, and accepts the created directory only when its observed link count is
positive (`links >= 1`). It also retains directory type, effective owner/group,
unchanged sibling inventory, parent identity, sync, and known close checks.

The contract uses the same positive-link-count rule for the acquisition root
and requires the later result review to retain the observed positive value
through identity correlation. It makes no exact-one or filesystem-independent
directory-link claim. The positive predicate remains a cooperative-filesystem
observation, not authenticity, hostile-kernel, or machine-crash evidence.

The file boundaries remain distinct:

- the newly created mode-`0600` staging file requires `links === 1`;
- the held mode-`0444` identity before rename requires `links === 1`;
- final archive and receipt inventory requires `links === 1`.

Function-scoped verifier variants remove the positive directory predicate,
replace it with exact-one, and separately weaken each staging/final/final-
inventory file predicate. The validator also checks representative positive
directory values and rejects zero/negative values. Every weakening variant
must fail, so source-wide marker counts cannot conflate directory and file
transitions.

M2A-NGR02 and M2A-NG03 are closed at contract/static scope.

## Preserved decisions and evidence separation

The unchanged input and construction hashes preserve the previously reviewed:

- exact two sequential credential-empty HTTPS request plans, deadlines,
  bounds, close settlement, no redirect/proxy/reuse/retry, and unknown future
  DNS/certificate/CDN/registry observations;
- root-first retained occurrence, exact archive-before-receipt publication,
  canonical receipt, fixed terminal lines, bounded process projection, and
  no automated or gate-authorized retry;
- separate later fixed-root candidate review and process/filesystem
  correlation; and
- requirement for explicit human external-communication authority.

Both `reviewedAcquisitionReceiptSha256` and
`reviewedAcquisitionTarballSha256` remain `null`.
`runtimeExecutionApproved` remains `false`, and every relevant
`evidenceReview` remains `not-performed`. Contract definition, static/unit
evidence, an external occurrence, bounded process output, durable candidate
bytes, candidate review, accepted construction input, construction, runtime
result, and `Observed` remain distinct evidence classes.

M2A-NG02/M2A-NG04/M2A-NG05/M2A-NG06 retain contract-scope closure. Together
with this review's closure of M2A-NG01/M2A-NG03, M2A-NG01 through M2A-NG06 are
complete only at the Docker-free contract/static entry-guard boundary.

## Verification and observed results

| Command or inspection | Observed result |
| --- | --- |
| Applicable AGENTS, saved prompts, contract/review/status chain, exact remediation allowlists, and source inspection | Completed without producer import/execution, fixed-root or host-runtime access, communication, child execution, Docker, or result access. |
| `wc -c` and `sha256sum` over the ordered three-file closure | Reproduced 1,166 / 112,299 / 81,269 bytes and all three recorded hashes. |
| Ordered `sha256sum ... \| sha256sum` | Reproduced `88a7e55d…12d9515`. |
| Exact regular/non-symlink checks over the three source paths | Exit `0`; all three are regular and none is a symlink. |
| Exact import/entry/link/call-graph/static-inverse and binding inspection | Reproduced the two local edges, closed acquisition reachability, complementary host/process authority, positive directory links, exact-one files, null bindings, false runtime approval, and evidence separation. |
| `npm run m2a:transfer:verify` | Exit `0`; static verification passed and 1 focused file / 62 tests passed. |
| `npm run m2a:verify` | Exit `0`; 4 files / 5 tests passed after adapter typecheck, build, and static verification. |
| `npm run typecheck` | Exit `0`. |
| `npm test` | Exit `1`; 99 files / 826 tests passed and 10 files / 39 tests failed in the pre-recorded out-of-scope M2-C/M2-D/M2-E and probe-core aggregate baseline. |
| Focused Prettier check over the exact remediation allowlists, saved prompt pair, this review, and changed status files | Exit `0`; all selected files matched Prettier style. |
| `npm run check` | Exit `1` during `format:check` on seven `.serena/` files and `containers/profile-control/test/control-host-backend.test.ts`; lint, typecheck, and tests were not reached by this aggregate command. |
| `git diff --check` | Exit `0`; no whitespace error was reported in the accumulated tracked diff. |
| `git status --short` | Preserved the accumulated dirty worktree; this review added only its allowlisted review/status records. |

Passing checks are Docker-free static/unit cooperative-host evidence only.
Aggregate failures were recorded without repair and do not contradict the
focused remediation boundary.

`m0:doctor`, `m0:build`, `m0:run`, `m0:verify`, either producer, the lifecycle
fixture, fixed acquisition/toolchain/construction/result roots, host
environment or `/usr/bin/node` inspection, npm acquisition/install/pack/
approve/rebuild, DNS, external/loopback/Unix-socket communication, child
producer/compiler/constructor execution, image build, Docker, transfer,
candidate/result validation, cleanup, retry, Remote Git, publication,
deployment, construction binding, evidence promotion, and standing
authorization were intentionally not used.

## Exact smallest next boundary

Save one exact prompt for the adjacent full-byte/hash preflight and the
generation-consuming one-occurrence executor, plus a separate Docker-free
read-only fixed-root result-review prompt. The prompt-only task must not run
the producer, inspect or create the fixed root, access host runtime/environment,
communicate externally, authorize the occurrence, accept npm bytes, update
construction bindings, construct, call Docker, or promote evidence.

Only after those prompts receive fresh review may a person be asked for exact
external-communication and fixed-side-effect authority. Standing continuing-
work authorization cannot provide it.

Next: save the exact adjacent-preflight/one-occurrence execution prompt and
separate Docker-free fixed-root result-review prompt; do not execute the
producer, access fixed or host runtime state, or use external communication in
that prompt-only task.
