# M4 distinct activation-object execution-gate implementation remediation re-review

## Review target and decision

- Target: the issue #45 M4-AGI01/M4-AGI02 bounded Docker-free remediation
- Review type: fresh independent Docker-free read-only implementation/gate
  re-review
- Decision: **APPROVED at implementation scope; one exact later command
  occurrence is approved only under the gate below**
- M4-AGI01 external reviewed-object trust input: **CLOSED**
- M4-AGI02 complete focused negative acceptance: **CLOSED**
- M4-AG01 through M4-AG06: **CLOSED at implementation scope**
- Blocking findings: none
- Non-blocking findings: none

The remediation does not claim that the production wrapper authenticates its
own bytes. Instead, it makes the current Docker-free static verifier the
non-circular external trust decision over the independently reviewed complete
wrapper objects and keeps production descriptor capture as the stability lease
after that input. The expanded 40-test wrapper suite covers the missing edge,
identity, process, output, and projection matrix without changing the wrapper
source or compiler outputs.

This is implementation/static/unit approval, not runtime evidence. The review
did not run either frozen-research production entry, the candidate command, a
Docker operation, or a result/retained-state probe. It approves only the exact
at-most-one later occurrence described below.

## Reviewed snapshot identity

These hashes identify the review inputs before this review record and its
minimal status updates were added. They are tracked byte identities, not
runtime filesystem observations.

| Target | Bytes | SHA-256 |
|---|---:|---|
| Remediated execution-gate contract | — | `3d6f5f51a7e3a498a169b4e91f36279f396db63c93672ed527243e1e69b0e206` |
| Initial execution-gate contract review | — | `ce547624f4ec169e0676c008ab8a00b98e5e5a93310639ebee44dff2454904b0` |
| M4-AGR01 through M4-AGR03 remediation prompt | — | `f2fa5437b1130a1231a652ec294a5dde83c1a35f4c585c61b137c9a1a5eaa488` |
| M4-AGR01 through M4-AGR03 remediation re-review | — | `fae14cc67c52a9a9365cf7984c054214fb1c3030f68d5c5836b8ad2fd521988c` |
| Wrapper implementation prompt | — | `a122a1bb07e6f05456b9390e039501ce26da2e4d383ff5fc7b130ac50dee01dd` |
| Blocking implementation/gate review | — | `bfa30f600ea1e1cea7191c5ae5c07dc51296d9f7d3e66025d89f935c85e2259f` |
| M4-AGI01/M4-AGI02 remediation prompt | — | `85b114595c6585b5f3b47eafc5aaf9f0c672b185f921cefa5f6f6c00e710d5ca` |
| This remediation re-review prompt | — | `ceb4ff14888a700a1815671198368660fbbd536cb49042e752490364e458dcbe` |
| Docker-free static verifier | — | `35233a6457ac626fcf92969e3535e370516088d769d496c647395d172a13f9fc` |
| Focused wrapper test | — | `6a3ca71eb9bcb734557f54d45d395c17c963d3acd361f6f75db02bbb63fd6b29` |
| Wrapper source | 42,865 | `80829982f10266f27382393cb07faa8c41eff1de677788e018f671b7752a3174` |
| Wrapper JavaScript | 41,159 | `ab36b509837ea32353df60f5319bbdca865c284ed809b313c0de32692dd7294d` |
| Wrapper declaration | 1,244 | `ed1e6145b9f3adc43234bd82720e22041f61a514124b3531cf99560dbd9d92f5` |
| Root package manifest | 7,438 | `370ffa822b913a98b56d5ef6f83e92c97cdbcd7f59d94b9a759c0a4ef5c78af1` |

The complete changed/untracked inventory and diff summary were inspected. The
existing uncommitted issue #45 work was preserved. No implementation edit was
made in this review.

## Reproduced fixed construction

Independent repository-only byte, inventory, manifest, and TypeScript AST
checks reproduced:

- fixed activation Expected revision `m4-activation-expected-20260720-02`;
- run IDs `m4-profile-control-p-20260720-02` and
  `m4-profile-control-c-20260720-02`, with their exact derived result roots and
  container names, without probing either root;
- unchanged `m4-profile-v1`, input ID `m4-profile-control-image-v1`, and image
  digest
  `sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`;
- constants source/JavaScript/declaration at 4,635 / 4,298 / 4,628 bytes with
  hashes `60d0512b...`, `2e6109fc...`, and `d4fc330f...`;
- activation source/JavaScript/declaration at 774 / 788 / 11 bytes with hashes
  `580c2926...`, `34ecc462...`, and `8e609bb7...`;
- exact 32-source/64-output parent inventories and activation
  22-source/22-JavaScript-construction/22-declaration-construction/
  21-executable sets; and
- the 2,582-byte source, 5,232-byte output, and 7,814-byte combined manifests
  with hashes `d9e68b20...`, `04623a67...`, and `7ef97d35...`.

The canonical permissive and constrained profiles remain 1,402 and 1,411
bytes with hashes `24391506...` and `a41bc401...`. The package has exactly the
candidate edge
`node containers/profile-control/dist/frozen-research-profile-control-executor.js`.

## M4-AGI01 — external trust anchor closed

The three complete wrapper objects reproduce at the exact identities above.
The final fresh-worker `npm run m4:static` occurrence compares all three full
lengths and SHA-256 values, not only their import prefixes. It also derives the
exact source and emitted bindings, ordered seven built-in edges, zero
repository edges, singleton source/executable closures, package-only inbound
edge, 32/64 parent inventories, root package, canonical profiles, fixed
generation, activation sets, and construction manifests.

An independently mutated same-prefix source object failed the full-object
trust predicate. Each appended dynamic import, computed import, `require`,
`createRequire`, property-based loader, evaluation form, or builtin-loader
form also failed before command eligibility because its complete length/hash
no longer matched the reviewed object.

The split is explicit and non-circular:

1. A fresh worker first reproduces all reviewed identities and only the two
   exact new-root absence facts.
2. `npm run m4:static` is then the final filesystem-reading trust preflight.
3. On success, the candidate command must be the immediately following command
   occurrence. No compiler, formatter, test, filesystem write, repository
   mutation, or other command may intervene.
4. During that occurrence, complete retained descriptors and twice-pre/
   twice-post validations prove stability after the external input. They do
   not claim self-authentication.

The cooperative-host limitation remains: this adjacency and descriptor lease
do not eliminate an out-of-scope same-UID swap-and-restore race wholly between
observations. M4-AGI01 and the implementation portions of M4-AG02/M4-AG03 are
closed.

## M4-AGI02 — focused negative matrix closed

The source and emitted objects independently derive the ordered built-ins
`node:child_process`, `node:crypto`, `node:fs`, `node:fs/promises`,
`node:path`, `node:process`, and `node:url`, with their exact contracted
bindings. Both repository-edge sets are empty and both wrapper closures are
singletons.

The focused suite now directly rejects missing, extra, reordered, and
alternate source bindings; alternate emitted bindings; absolute, relative,
`file:`, package, subpath, and import-map specifiers; dynamic/computed imports;
`require`, `createRequire`, property and evaluation loaders; activation,
ordinary-entry, backend, runner, export, and otherwise unleased edges; a
same-prefix body change; and an appended loader.

The process/output matrix separately covers:

- third and fourth no-child validations and reverse-release suppression;
- null stdout/stderr, invalid PID, missing/duplicate/contradictory exit-close
  tuples, asynchronous error with and without later `close`, and retention
  until `close`;
- TERM and KILL delivery failure without replacing the initiating timeout or
  output failure;
- valid complete and valid Inconclusive child bytes after every prior timeout,
  output, process, TERM-failure, and KILL-failure class;
- exact private one/two-step no-output branches and public four/five-step
  outputs, null `controlResult` after wrapper failure, exact outer/activation
  key order, and private-field suppression; and
- both post-use validations, reverse release before output, identity/release
  output suppression, and source instrumentation containing exactly two new
  root checks and no old-root, parent-listing, cleanup, or retry access.

The chronological write-once latch and output trace agree with those tests.
No later child byte can restore eligibility after an earlier failure. M4-AGI02
and M4-AG02 through M4-AG05 are closed at implementation scope. M4-AG01 and
M4-AG06 remain closed.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, active plan, issue #45 contract/review/remediation packet, safety/evidence documents, and saved re-review prompt | Read inside the repository without Docker, runtime-socket, result/retained-state, external-network, credential, Remote Git, publication, or external-communication access. |
| `git status --short --branch --untracked-files=all`, `git diff --name-status`, `git diff --numstat`, scoped source/test/static trace, `sha256sum`, and `wc -c` | Preserved prior work and reproduced the fixed identities and boundaries above. |
| `npm run m4:typecheck` | Exit 0 with no diagnostics. |
| `npm run m4:static` | Both standalone review occurrences exited 0, including the post-status-edit rerun; the verifier authenticated the exact construction and reported that the wrapper was constructed but not invoked. The nested `m4:verify` occurrence also exited 0. These were review evidence, not the final adjacent pre-command occurrence. |
| `npm run m4:test -- containers/profile-control/test/frozen-research-profile-control-executor.test.ts` | Exit 0; one focused file and all 40 tests passed. |
| `npm run m4:verify` | Exit 0; typecheck and static verification passed, then 24 test files and all 292 tests passed. |
| Independent repository-owned Node/TypeScript AST, closure, inventory, hash, manifest, trust-mutation, and exact-root-source assertion | Corrected assertion exit 0; reproduced 32/64, 22/22/22/21, exact manifests, seven/zero/singleton edges, all three wrapper hashes, ten appended-loader trust rejections, and exactly two source-level new-root checks without probing either root. |
| Permission-bounded ordinary compiled import assertion | Exit 0; imported ten ordinary modules with repository filesystem read only and timer creation rejected; imported neither frozen-research entry. |
| Focused Prettier check | Exit 0; all scoped files matched. |
| `npm run format:check` | The command completed but reported the pre-existing formatting warning in `containers/profile-control/test/control-host-backend.test.ts`, outside this review and remediation boundary. |
| `git diff --check` before review edits | Exit 0. |

The first independent assertion used a literal phrase that crossed a Markdown
line break and exited 1. The corrected assertion normalized documentation
whitespace and passed. This helper-format error is not repository drift or an
implementation finding.

No candidate command, production wrapper/activation entry, `npm run
m4:doctor`, `npm run m4:build`, `npm run m4:recovery:offline-build`, `npm run
m4:run:controls`, Docker/container/runtime-socket action, result-root or
retained-state probe, cleanup, repair, retry, process signal, external network,
credential, host-home access, Remote Git, publication, deployment, or
third-party communication was used. Standing authorization was not used in
this read-only review.

## Exact one-occurrence execution gate

One fresh worker may proceed only in this order:

1. Reproduce every reviewed source, compiled, verifier, package, profile,
   inventory, manifest, edge, generation, and command identity recorded here.
2. Check only the two exact `20260720-02` result roots and establish that both
   are absent. Do not list their parent or access any old root, retained state,
   Docker state, or evidence subtree.
3. Run `npm run m4:static` as the final filesystem-reading trust preflight.
4. If and only if it exits 0, issue no intervening command or write and use the
   `continue-repository-work` standing authorization for exactly one
   argument-free occurrence of:

   ```sh
   npm run --silent m4:execute:frozen-research
   ```

This standing authorization is the user's recorded authorization for the
exact reviewed action; it is not a separate human review. A failed identity or
absence check, failed final static preflight, any intervening command/write, or
the one candidate occurrence exhausts this gate. No retry, replacement root,
repair, cleanup, post-attempt Docker command, or alternate generation is
authorized on any outcome. Preserve the bounded stdout/stderr and exit status
for a later fresh Docker-free result review; do not classify or promote the
result in the execution worker.

## Evidence classification and remaining limitations

- The execution-gate documents and this approval are contract/review evidence.
- Hashes, compiler correspondence, inventories, AST graphs, static verification,
  and focused tests are construction/static/unit evidence.
- The production wrapper and activation child were not run, so descriptor
  identity, child settlement, Docker behavior, exact result-root state, and
  profile enforcement remain unobserved.
- The cooperative-host same-UID race limitation remains.
- A successful candidate command would create only a candidate immutable
  attempt. A separate Docker-free result review must reconcile bounded output
  with both exact root states before any complete classification.
- Historical attempts and evidence classes remain immutable. Profile-control,
  adapter-route, experiment-matrix, and presentation `Observed` remain
  unestablished.
- The unrelated pre-existing format warning remains in
  `containers/profile-control/test/control-host-backend.test.ts`.

## Decision and next task

M4-AGI01 and M4-AGI02 close with no new finding; M4-AG01 through M4-AG06 are
closed at implementation scope. The exact gate above approves at most one
later command occurrence. It does not itself establish runtime evidence or a
result classification.

Next: in a fresh worker, reproduce the approved identities and exact two-root
absence, run `npm run m4:static` as the final trust preflight, then—with no
intervening command or write—use standing authorization for exactly one
`npm run --silent m4:execute:frozen-research` occurrence and do not retry.
