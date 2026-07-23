# M3 production raw-to-derived collector contract remediation re-review

## Review target

- Target: frozen-research issue #47's remediated codegen `observe`
  raw-to-derived collector contract
- Review type: fresh independent Docker-free read-only contract re-review
- Review scope: M3-PC02 through M3-PC05 remediation, with M3-PC01 and M3-PC06
  preservation checks
- Reviewer implementation changes: none
- Review-owned changes: this record and minimal contract/status metadata only
- Runtime and evidence boundary: no adapter, collector, fixture, Docker command,
  retained/result root, historical P2 root, or `Observed` value was accessed or
  changed

## Gate decision

- Decision: **`APPROVED`**
- Closed at contract scope: M3-PC01 through M3-PC06
- New findings: none
- Implementation approval: at most one bounded Docker-free static/unit
  implementation under the unchanged M3-PC06 path and verification allowlist

The remediation closes the former content-identity and publication-terminal
contradictions. Initial capture, R1 post-render, and R2 precommit bind content
bytes to the originally held no-follow descriptors independently from object,
logical-path, and ancestor identity. Every operation that can fail before
publication, including every descriptor close, settles while only the
non-evidence `derived.staging/` name can exist. The final rename is the sole
publication commit and last fallible operation.

## Finding decisions

| ID | Decision | Re-review result |
|---|---|---|
| M3-PC01 | **Closed** | The codegen `observe`-only adapter family, additive v3/v2 separation, exact manifest and identity-bearing Expected records, unavailable source/tool deltas, runtime-context boundary, and historical P2 exclusion are unchanged. |
| M3-PC02 | **Closed** | Initial capture and both named checkpoints use only each originally held descriptor, prove the exact accepted byte count and immediate EOF, reproduce SHA-256, and separately repeat full descriptor, logical-path, and ancestor identity. Reopen, path-derived digest, and metadata-as-content shortcuts are forbidden. |
| M3-PC03 | **Closed** | Raw-only, in-memory, staged, precommit-settled, rename-failed, and committed states now have exact meanings. Every check, serialization, classification, sync, result construction, and close settles before the successful rename, which is the sole commit and last fallible operation. |
| M3-PC04 | **Closed** | The negative matrix covers R1/R2 same-size content mutation, descriptor/path/ancestor drift, staged identity/read-back, every close, and rename failure. Each filesystem branch preserves raw, publishes nothing, retains at most exact staging, returns a sanitized fixed failure, and performs no cleanup or retry. |
| M3-PC05 | **Closed** | Staging and every precommit failure remain non-evidence. Only an exact successfully renamed two- or five-file inventory is derived evidence, and neither inventory promotes profile, matrix, presentation, runtime-enforcement, or other `Observed` evidence. |
| M3-PC06 | **Closed** | The previously approved 11 production paths and 11 scenario/verification paths remain exact and unchanged. The package-root, runner/fixture, adapter/probe/container, compiled-output, runtime/result, and evidence exclusions still prevent activation or ingestion. |

## Content and filesystem identity trace

The content and filesystem checks remain separate at all three required
boundaries:

| Boundary | Content proof | Filesystem proof | Output state |
|---|---|---|---|
| Initial accepted capture | Positioned read from offset zero through the descriptor-recorded size, immediate EOF, fresh non-shared byte copy, and SHA-256 before parse/render | Private full type/mode and BigInt device/inode/uid/gid/link-count/size plus canonical run/raw/segments and logical-file identities | Both output names absent |
| R1 post-render | The same originally held descriptor is reread from offset zero for the exact accepted byte count, EOF is reproved, and SHA-256 must equal the capture digest | Full descriptor metadata plus no-follow logical path and every held ancestor are rechecked independently | Complete decided inventory exists only in private memory; both output names absent |
| R2 precommit | The same full positioned reread, exact byte count, EOF, and baseline digest comparison is repeated on every held raw descriptor | Descriptor, logical path, and run/raw/segments ancestor identities are rechecked independently; staged files and inventory have already passed exact read-back/identity checks | Only exact `derived.staging/` may exist |

No path is reopened to obtain content. A matching digest does not excuse object
or path drift, and matching metadata does not excuse a content change. Any R1
or R2 mismatch is a precommit filesystem rejection and cannot publish raw
digests or a derived inventory.

## Transaction state machine and fallible-operation trace

| State | Completed work | Permitted durable interpretation |
|---|---|---|
| Raw-only | Exact inventory, canonical ownership/mode/link/type, held-descriptor capture, parse/validation/reduction/render, and R1 | No derived evidence |
| In-memory decided | Either the complete/Expected-mismatch five-file bytes or sanitized Inconclusive two-file bytes are fully decided | No derived evidence |
| Staged | Private staging directory and only the decided files are exclusively created, written, synced, read back, and identity/inventory checked | Retained diagnostic state only; never evidence |
| R2 checked | Every held raw descriptor repeats content and identity checks; staged read-back/inventory, serialization, classification, directory sync, immutable success result, and fixed failure result are complete | Still retained diagnostic state only |
| Precommit settled | Every raw-file, staged-file, run/raw/segments, and staging-directory close was attempted and awaited; any rejected or uncertain close suppresses rename | Still only exact staging; no derived evidence |
| Rename failed | The final atomic rename failed and the preconstructed sanitized failure result is returned | `derived/` absent; at most exact staging retained; no cleanup or retry |
| Committed | The exact staging inventory was atomically renamed to previously absent `derived/` | Exact two- or five-file derived evidence only |

All inventory/canonicalization, open/read/hash, parse, validation, reduction,
render, serialization, classification, exclusive creation, write, sync,
read-back, identity check, result construction, and close branches precede the
rename. A close rejection is latched while the remaining closes settle and
prevents rename. Rename is therefore the only remaining fallible operation.
After rename success, the implementation may only return the preconstructed
immutable success result; stat, read-back, close, sync, cleanup, serialization,
classification, callback, accessor, and other failure edges are forbidden.

## Rejection, sanitization, staging, and evidence decisions

| Branch | Raw state | Staging/published state | Returned/evidence state |
|---|---|---|---|
| Safely captured content is invalid, partial, corrupt, timed out, or incomplete | Preserved byte-for-byte with names and modes | Exact sanitized two-file inventory may pass through staging and the sole rename | Inconclusive derived evidence only; counts/deltas unavailable and no event/comparison/hash file |
| Same-size content mutation at R1 | Preserved; rejection does not rewrite raw | Both output names absent | Fixed sanitized filesystem failure; no evidence |
| Same-size content mutation at R2 | Preserved | `derived/` absent; at most exact reached staging retained | Fixed sanitized filesystem failure; no evidence |
| Descriptor, logical-path, or ancestor drift | Preserved | `derived/` absent; staging absent or retained only at its exact reached state | Fixed sanitized filesystem failure; no evidence |
| Staged file/inventory alias, replacement, byte/read-back, sync, or identity failure | Preserved | `derived/` absent; at most exact reached staging retained | Fixed sanitized filesystem failure; no evidence |
| Any raw, staged, or directory close rejection/uncertainty | Preserved; every other close still settles | `derived/` absent; exact reached staging retained | Preconstructed fixed sanitized filesystem failure; no evidence |
| Final rename failure | Preserved | `derived/` absent; exact precommit-settled staging retained | Preconstructed fixed sanitized filesystem failure; no evidence |
| Successful final rename | Preserved | Exactly the decided two- or five-file `derived/`; no staging name | Only contract-bounded derived evidence; no automatic promotion |

No failed branch cleans, rewrites, retries, salvages a prefix, publishes a
rejected-input digest, or classifies staging as evidence. Derived bytes exclude
raw canary/environment values, file contents, host paths, commands, container
identities, output streams, private filesystem identities, rejected-input
hashes, and unsanitized errors. There is intentionally no postcommit failure
hook or branch.

The exact two-file inventory remains evidence only of a sanitized Inconclusive
collector result. The five-file inventory is eligible only for this contract's
complete or Expected-mismatch `adapter-run` projection. A separate fresh result
review remains necessary before either can support another evidence class.

## Preserved adapter and implementation boundaries

Read-only source/status inspection found no working-tree change under
`packages/lab-cli`, `packages/codegen-probe`, `scenarios`, or `results/runs`.
The two proposed v3 scenario files and production collector module remain
absent. The current codegen source still fixes the five route IDs, six attempt
IDs, one tool-change ID, source/artifact target IDs, and `observe`'s skipped
generator operation used by the already closed M3-PC01 decision. No P2 result
root was opened or treated as collector input.

The next implementation may change only the exact M3-PC06 production,
scenario, test, static-verifier, prompt, and status paths already listed in the
contract and must run its exact verification boundary. It may not add a
runtime entry, activate a raw bundle, inspect historical results, change
Expected/Observed outside the two new scenarios, or proceed to a runtime gate.

## Verification

- Inspected the complete working-tree name/size summary and confirmed all
  current M3/codegen/scenario/result paths have no tracked or untracked change.
- Ran focused read-only contract/reference assertions over the three content
  checkpoints, transaction ordering, failure terminals, evidence rules,
  preserved codegen IDs, and unchanged implementation allowlist.
- Ran a focused formatter check over this review and the four status files.
- Ran `git diff --check`.

M3 tests, typecheck, build, filesystem-writing fixtures, adapters, probes,
Docker, the production collector, historical/result-root inspection, and broad
verification were intentionally not run because this was a Docker-free
contract-only re-review.

## Remaining limitations

- This approval is contract/static evidence, not proof that the future
  filesystem implementation or an adapter occurrence works.
- SHA-256 establishes byte identity, not authenticity or semantic harmlessness.
- The contract retains its cooperative repository-owned Linux filesystem and
  same-UID race limitation and makes no hostile-kernel or crash-durability
  claim. In particular, the no-postcommit-operation rule intentionally omits a
  fallible parent-directory sync after rename.
- No runtime identity, raw adapter bundle, collector result, profile/matrix
  evidence, presentation claim, or `Observed` promotion was selected.

## Safety statement

This re-review used no external network, credentials, environment enumeration,
home-directory access, Docker/runtime socket, retained or historical result
state, Remote Git, publication, cleanup, retry, or standing authorization.
Existing unrelated M4, presentation, and user changes were preserved.

Next: perform exactly one bounded Docker-free static/unit implementation under
the unchanged M3-PC06 allowlist, saving its implementation prompt before the
first source change; do not activate or ingest the collector.
