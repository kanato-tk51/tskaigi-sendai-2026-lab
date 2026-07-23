# M4 distinct activation-object exhausted-generation result review

## Review target and decision

- Target: the exact issue #45 M4 activation-object `20260720-02`
  one-occurrence outcome
- Review type: fresh independent Docker-free read-only result review
- Decision: **ACCEPTED only as one immutable exhausted Inconclusive attempt**
- Canonical activation result: **absent from the fixed zero-byte stdout**
- Permissive result root: **absent**
- Constrained result root: **absent**
- Blocking findings: none
- Non-blocking findings: none
- Retry, repair, cleanup, alternate generation, Docker recovery, and
  `Observed` promotion: not authorized

The recorded candidate occurrence exited `70`, emitted zero stdout and zero
stderr bytes, and was not retried. This review independently reproduced the
approved repository construction and inspected only the two fixed new result
root paths. Both paths are absent. There is consequently no durable manifest,
host record, container record, transfer record, marker, or Docker
configuration object to validate or cross-bind.

The classification is accepted because the gate requires every missing or
noncanonical activation output to remain Inconclusive. Acceptance does not
manufacture a wrapper failure code, infer whether a child or Docker operation
started or settled, or turn path absence into a canonical activation result.
Issue #45 closes only at this reviewed Inconclusive and cooperative-host
boundary.

## Fixed generation and stream handoff

The review remained bound to these immutable values:

| Role | Exact value |
|---|---|
| Activation Expected revision | `m4-activation-expected-20260720-02` |
| Profile revision | `m4-profile-v1` |
| Image digest | `sha256:20ba341937bfaee4fe8d1adc722aed4c7dc96d055371bf7b48ba3cd12e15e3dd` |
| Permissive run ID | `m4-profile-control-p-20260720-02` |
| Constrained run ID | `m4-profile-control-c-20260720-02` |
| Permissive root | `results/runs/m4-profile-controls/m4-profile-control-p-20260720-02` |
| Constrained root | `results/runs/m4-profile-controls/m4-profile-control-c-20260720-02` |
| Candidate exit | `70` |
| stdout | 0 bytes; SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| stderr | 0 bytes; SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

The empty stdout contains no `lab-m4-activation-result/v1`, completed-step
prefix, public failure code, `identityStable: true`, or child
`controlResult`. Empty stderr contains neither optional sanitized terminal
line. Its absence does not distinguish preflight, identity, release, spawn,
process, or internal failure.

The preceding execution worker used the `continue-repository-work` standing
authorization for the one independently approved command occurrence. That was
not a separate human review. This non-executing result review did not need or
use standing authorization.

## Reproduced repository construction

The complete repository objects fixed by the review prompt reproduced before
either root was interpreted:

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

The Docker-free static verifier also reproduced the exact 32-source and
64-output parent inventories; the activation 22-source,
22-JavaScript-construction, 22-declaration-construction, and 21-executable
sets; the seven-built-in/zero-local singleton wrapper closure; the fixed
generation and package edge; and these construction manifests:

| Manifest | Bytes | SHA-256 |
|---|---:|---|
| ordered 22-source | 2,582 | `d9e68b20edfc7d46af59e91a25ebc4c179f24dcae5080c6182860842a80c6158` |
| ordered 44-output | 5,232 | `04623a67b7b8129dda41ecae2eee524e0e8dcb0e7d3d2b0f38844ed9136b8953` |
| combined construction | 7,814 | `7ef97d35e8d9f8e04e1134dabd558ce7c2d757ad0d334616048f4e0f222362ec` |

These are repository construction and static/unit facts, not runtime-result
observations.

## Exact fixed-root observations

The bounded no-follow helper treated each fixed path independently and did
not enumerate their parent:

| Profile | Exact root state | Child inventory | Known control records |
|---|---|---|---|
| permissive | absent (`ENOENT`) | not present | none |
| constrained | absent (`ENOENT`) | not present | none |

Because each root is absent, there is no root mode, size, hash, or child name
to report. In particular, `input`, `host`, `container-result`, `scratch`,
`docker-config`, and `transfer` are not present beneath either fixed root, and
none of their named files was opened. No unexpected child exists inside an
absent root. No canonical-byte, file-mode, one-link, marker-literal,
cross-copy, completion, or comparison assertion can be established from
nonexistent objects.

The parent result directory was not listed. The exhausted `20260720-01`
roots, historical offline-build/recovery root, retained image tag, containers,
other result/evidence roots, and opaque Docker CLI configuration state were
not accessed.

## Canonical reconciliation and classification

The direct observations reconcile without inventing an unrecorded branch:

1. The fixed stdout has no canonical activation result.
2. Both permitted roots are absent and therefore add no durable control or
   settlement record.
3. Root absence cannot prove that backend initialization, child creation,
   child `close`, wrapper post-use identity checks, transfer, recording,
   cleanup, or Docker access did or did not occur.
4. No canonical failure code can be selected from exit `70`, empty streams,
   and root absence.
5. The gate's mandatory ceiling is therefore one exhausted Inconclusive
   activation attempt with no accepted child result.

No fixed-root finding blocks that classification. Missing roots would block a
complete result, but complete classification is neither claimed nor required
for accepting the exact Inconclusive outcome.

## Evidence classes and limitations

- Expected revision, profile and gate contracts remain Expected/configuration
  evidence.
- Hashes, inventories, manifests, static verification, typecheck, and tests
  are construction/static/unit evidence.
- Exit `70` and the two empty streams are direct execution observations from
  the exhausted command handoff.
- The two exact absent paths are bounded filesystem observations from this
  review.
- There is no canonical activation result, identity-stability proof, runner or
  child settlement, container/service/output receipt, profile pair,
  same-image runtime result, or capability observation.
- Profile-control `Observed`, adapter-route evidence, experiment-matrix
  `Observed`, presentation evidence, and every historical result remain
  unchanged.
- Stable-boundary checks retain the cooperative-host limitation and do not
  eliminate an out-of-scope same-UID swap-and-restore race wholly between
  observations.

## Verification observed

| Command or assertion | Observed result |
|---|---|
| Applicable root/container instructions, active plan, routed issue #45 contract/review packet, safety/evidence documents, and saved result-review prompt | Read within the repository without Docker, runtime-socket, retained-state, external-network, credential, Remote Git, publication, deployment, or external-communication access. |
| `sha256sum` and `wc -c` over the 14 fixed repository objects | Exit 0; every byte count and SHA-256 in the construction table reproduced. |
| `npm run m4:static` | Exit 0; the exact static construction, inventories, manifests, activation sets, wrapper closure, generation, profiles, and package edge verified without invoking the wrapper. |
| `npm run m4:verify` | Exit 0; typecheck and static verification passed, then 24 test files and all 292 tests passed. |
| Exact two-root bounded no-follow inspector | Exit 0; both fixed paths returned `ENOENT`; no parent, old root, unexpected child, or other result path was accessed. |
| Independent zero-byte SHA-256 assertion | Exit 0; both empty streams reproduced `e3b0c442...b855`. |

No frozen-research production entry, `npm run m4:doctor`, `npm run m4:build`,
`npm run m4:recovery:offline-build`, `npm run m4:run:controls`, `npm run
m4:verify:evidence`, Docker/container/runtime-socket action, process signal,
root mutation, repair, chmod/chown, move, deletion, cleanup, retry, alternate
generation, external network, credential, host-home access, Remote Git,
publication, deployment, or third-party communication was used.

## Decision and next task

The exact `20260720-02` outcome is accepted only as one immutable exhausted
Inconclusive activation attempt. Issue #45 is complete at that bounded result
classification; no runtime enforcement or `Observed` claim is established.

Next: begin issue #46 with one Docker-free public-input-hardening contract and
fresh independent contract-review prompt; do not implement the hardening in
that contract task.
