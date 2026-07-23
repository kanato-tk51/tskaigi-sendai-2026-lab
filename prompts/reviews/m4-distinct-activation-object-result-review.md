# Goal

Freshly and independently perform a Docker-free read-only result review of the
exact issue #45 M4 activation-object `20260720-02` one-shot outcome. Reconcile
the fixed exit-70/empty-output handoff with only the two exact new result roots,
then accept or block only the classification of this exhausted generation. Do
not retry, repair, clean up, or call Docker.

# Read first

- root `AGENTS.md`
- `containers/AGENTS.md`
- `docs/index.md`
- `docs/frozen-research-execution-plan.md`
- `docs/presentation-scope.md` deferred high-assurance boundary
- `docs/milestones.md` M4 and frozen-research sections
- `docs/codex-workflow.md`
- `docs/m4-execution-profiles.md`
- `docs/m4-execution-profiles-exact-input.md`
- `docs/m4-exact-filesystem-identity.md`
- `docs/m4-distinct-activation-object.md`
- `docs/m4-distinct-activation-object-execution-gate.md`
- `docs/reviews/m4-execution-profiles-run-controls-remediation.md`
- all M4 distinct-activation-object execution-gate review and remediation
  records under `docs/reviews/`
- all corresponding execution-gate review and remediation prompts under
  `prompts/` and `prompts/reviews/`
- `docs/decisions/0001-separate-profile-controls-from-route-evidence.md`
- `docs/threat-model.md`
- `docs/architecture.md`
- `docs/experiment-matrix.md`
- this prompt

# Fixed exhausted result

The only approved argument-free occurrence was:

```sh
npm run --silent m4:execute:frozen-research
```

The execution worker first reproduced the independently reviewed identities,
established only the two new-root absence facts, and ran the immediately
adjacent `npm run m4:static` trust preflight successfully. It then used the
`continue-repository-work` standing authorization for exactly one candidate
occurrence. This was not a separate human review. The occurrence exited `70`,
emitted exactly zero stdout bytes and zero stderr bytes, and was not retried.
Each empty stream therefore has SHA-256
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

Bind the review to the exact gate Expected revision
`m4-activation-expected-20260720-02`, unchanged control profile revision
`m4-profile-v1`, unchanged fixed image digest
`sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd`,
and only these two result roots:

- permissive:
  `results/runs/m4-profile-controls/m4-profile-control-p-20260720-02`
- constrained:
  `results/runs/m4-profile-controls/m4-profile-control-c-20260720-02`

Do not enumerate their parent or access the exhausted `20260720-01` roots, the
historical offline-build/recovery root, the retained image tag, any container,
or any other result or evidence root.

Before interpreting root state, reproduce the approved repository inputs from
the M4-AGI01/M4-AGI02 remediation re-review. At minimum reproduce these complete
objects, not same-prefix or inferred replacements:

| Object | Bytes | SHA-256 |
|---|---:|---|
| constants source | 4,635 | `60d0512bd55c87b990f1476fa4634e54661feac81d2abf59dc7975058ac96f65` |
| constants JavaScript | 4,298 | `2e6109fcf9f6cb779b7f402ff9e172f18ecfe95771033f21b490a538ddb465cb` |
| constants declaration | 4,628 | `d4fc330fee498a9b4c3f1c6d2e9be35ef793a3412d43d8059910bbd516319651` |
| activation source | 774 | `580c2926e9904213eb8db1d89367ce438f1bc88aadaeb1111c84964f5621578d` |
| activation JavaScript | 788 | `34ecc462630642d136d42fe8724d4872b9b36d9d378787595fd57496d9fa92d7` |
| activation declaration | 11 | `8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881` |
| wrapper source | 42,865 | `80829982f10266f27382393cb07faa8c41eff1de677788e018f671b7752a3174` |
| wrapper JavaScript | 41,159 | `ab36b509837ea32353df60f5319bbdca865c284ed809b313c0de32692dd7294d` |
| wrapper declaration | 1,244 | `ed1e6145b9f3adc43234bd82720e22041f61a514124b3531cf99560dbd9d92f5` |
| Docker-free static verifier | 54,926 | `35233a6457ac626fcf92969e3535e370516088d769d496c647395d172a13f9fc` |
| focused wrapper test | 37,835 | `6a3ca71eb9bcb734557f54d45d395c17c963d3acd361f6f75db02bbb63fd6b29` |
| permissive profile | 1,402 | `243915063e04f4009bf2132d74ae6172a763583560ce6534c3520bbda4ddde7c` |
| constrained profile | 1,411 | `a41bc401830f4079607fb3720b1dbdf636b283fadf0db4082d0113bf3238838e` |
| root package manifest | 7,438 | `370ffa822b913a98b56d5ef6f83e92c97cdbcd7f59d94b9a759c0a4ef5c78af1` |

Also reproduce the exact 32-source/64-output parent inventories, the
22-source/22-JavaScript-construction/22-declaration-construction/21-executable
activation sets, the seven-built-in/zero-local singleton wrapper closure, and
the three construction manifests recorded by the approved review. These are
repository construction inputs, not runtime-result observations.

# Exact fixed-path review boundary

Determine each fixed root independently as absent or as a non-symlink directory.
For an existing root, use fixed-path, no-follow reads and inspect only:

- the root's bounded name/type/mode inventory;
- the bounded name/type/mode inventories of the exact children `input`, `host`,
  `container-result`, `scratch`, `docker-config`, and `transfer` when present;
- `input/control-manifest.json`;
- `host/host-inspection.json`, `host/completion.json`, and
  `host/comparison.json`;
- `container-result/control-evidence.json` and
  `container-result/result-marker.txt`;
- `scratch/scratch-marker.txt`;
- `docker-config/config.json`; and
- `transfer/control-evidence.json`, `transfer/result-marker.txt`, and
  `transfer/scratch-marker.txt`.

Do not follow a symlink. Do not recurse into or open an unexpected child. If a
bounded inventory contains an extra name, record an invalid-inventory finding
without opening or copying that child's bytes. Do not read opaque Docker CLI
configuration state. Do not serialize private device, inode, owner, group,
timestamp, absolute-host-path, canary, environment-value, PID, or raw process
data into the review record.

Validate every present known object against the contract rather than assuming
that either backend initialization, child creation, child `close`, transfer,
recording, cleanup, or wrapper release occurred. In particular:

- a settled run root is mode `0700`; `input` is `0555`; `host` and
  `docker-config` are `0700`; `container-result` and `scratch` are `0733`; and
  a retained `transfer` is `0700`, with complete special-bit checks;
- a present control manifest is a non-symlink one-link `0444` regular file and
  exact canonical `lab-profile-control-manifest/v1` bytes bound to the fixed
  profile, run ID, image digest, Node version, limits, order, and Expected
  controls;
- known container, scratch, transfer, host, and configuration files have the
  exact contracted type, one-link relation, full mode, size bound or literal
  bytes, canonical framing, and SHA-256/cross-copy relation for their role;
- `docker-config/config.json`, if present, is exactly the credential-empty
  13-byte `{"auths":{}}\n` object; no other Docker configuration content may be
  read or normalized;
- a present container evidence record, host inspection, completion, or
  comparison is parsed through the approved strict validators or an
  independently equivalent exact-key/canonical-byte check and cross-bound to
  the fixed manifest, profile, run, image, inventory, and peer hashes; and
- a partial directory or file prefix is retained diagnostic state only. Do not
  infer an unrecorded Docker operation, child settlement, transfer settlement,
  cleanup, or wrapper identity check from presence, absence, or equal bytes.

Transfer files are temporary official-tool materializations, not accepted
evidence. If retained, their fixed metadata and exact equality with a present
source may be reported only as diagnostic state. Missing or partial records,
invalid canonical bytes, unsafe types/modes, extra inventory, or failed
cross-binding are findings; never repair them.

# Classification decision

Independently decide `ACCEPTED` or `BLOCKED` for only this result
classification. The fixed facts constrain the decision:

- exit `70` plus empty stdout contains no canonical
  `lab-m4-activation-result/v1`, no completed activation-step prefix, no public
  activation failure code, no `identityStable: true`, and no child
  `controlResult`;
- empty stderr contains neither of the optional sanitized terminal lines, but
  its absence does not identify preflight, identity, release, spawn, process,
  or internal failure;
- root state may establish bounded durable filesystem observations, but it
  cannot manufacture suppressed wrapper output, prove the wrapper's close and
  post-use identity protocol, or choose an unrecorded failure code; and
- the gate contract requires every missing-output, invalid-output,
  identity-failure, unknown-settlement, or otherwise noncanonical outcome to
  remain Inconclusive and never be retried or repaired.

An accepted decision therefore accepts at most one immutable exhausted
Inconclusive activation attempt with no canonical activation result. It must
not invent a schema field or primary-failure code. Even if both roots contain
individually valid control records, the missing activation result cannot become
a complete activation result, profile-control Observed, runtime-enforcement
proof, adapter evidence, experiment-matrix Observed, or presentation evidence.
Expected/profile bytes, static/unit evidence, direct execution observations,
fixed-root records, and any inference remain separate evidence classes.

If the classification is accepted, record the exact fixed-root state and close
issue #45 only at this reviewed Inconclusive/cooperative-host boundary; the next
ordered issue may then begin as a separate Docker-free contract task. If it is
blocked, record one smallest Docker-free review/record follow-up. In either
case, do not authorize a retry, new run IDs, root repair, cleanup, retained-state
mutation, Docker recovery, or `Observed` promotion.

# Out of scope

- Any Docker/container command, direct runtime-socket access, image/tag
  inspection, probe/lifecycle execution, process signaling, or production
  execution command
- `npm run m4:execute:frozen-research`, `npm run m4:run:controls`,
  `npm run m4:doctor`, `npm run m4:build`,
  `npm run m4:recovery:offline-build`, or `npm run m4:verify:evidence`
- Root/file repair, chmod/chown, move, deletion, cleanup, retry, alternate
  generation, canonical-result manufacture, or evidence promotion
- Parent or historical result enumeration, retained offline-build/recovery
  access, unexpected-file content reads, or arbitrary recursive traversal
- External network, credentials, host home, Remote Git, publication,
  deployment, or third-party communication

# Deliverables

- `docs/reviews/m4-distinct-activation-object-result.md` with the decision,
  exact root/path/mode/size/hash observations, canonical/cross-binding
  assessment, empty-output reconciliation, evidence classification, findings,
  and remaining limitations
- Minimal authoritative issue #45 status and handoff updates
- No implementation, test, compiled output, profile, package, result-root,
  historical-evidence, or experiment-matrix change

# Verification

Use only Docker-free repository checks and the exact fixed-path reads above. At
minimum:

- reproduce the approved repository identities, inventories, manifests, edge
  sets, generation, package command, and the two zero-byte stream identities;
- run `npm run m4:static` and `npm run m4:verify` without invoking either
  frozen-research production entry;
- independently assert only the two exact root states and allowed bounded paths
  with no-follow reads, then reproduce every accepted canonical byte, mode,
  size, SHA-256, literal, and cross-binding;
- use only side-effect-free compiled validators/pure reconstruction helpers;
  do not compile to disk or import either production entry;
- run focused formatting for changed Markdown, `git diff --check`, and
  `git status --short`.

Record exact exits and test counts. A helper-command mistake is not a result
finding; correct it without changing candidate or root bytes and record both
observations. Standing authorization is not needed for this non-executing
review.

# Completion report

- `ACCEPTED` or `BLOCKED` decision and findings
- Exact fixed-root/control-record/mode/size/hash observations
- Empty-output reconciliation and evidence classification
- Changed files and commands run with observed exits/test counts
- Commands intentionally not run and remaining cooperative-host/runtime
  limitations
- One concrete `Next:` item
