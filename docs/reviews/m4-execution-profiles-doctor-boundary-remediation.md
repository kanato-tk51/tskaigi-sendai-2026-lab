# M4 fixed doctor boundary remediation independent re-review

## Review target and decision

- Target: the current uncommitted B-08 through B-10 doctor remediation working tree
- Base HEAD: `463dc6118ed682ed3e0b215b04f18b1e57dfe7ff`
- Fixed doctor remediation static/unit gate: **BLOCKED**
- Existing M4 static/unit implementation gate: **APPROVED; unchanged**
- Doctor execution gate: **PENDING / BLOCKED; not executed**
- Runtime enforcement gate: **PENDING / BLOCKED; not executed**
- Findings closed: B-08, B-10
- Finding still blocking: B-09
- Profile-control Observed: unmeasured
- Experiment-matrix route Observed: unchanged

The remediation binds the second and third doctor observations to the same
sanitized image identity and replaces line-oriented environment output with a
structured key-only array. The parser rejects identity drift, malformed keys,
control characters, delimiters, duplicates, canary keys, and the covered JSON
text variants. B-08 and B-10 are therefore closed for the reviewed static/unit
boundary.

B-09 is not closed. `lineText()` decodes the original bytes with a default
`TextDecoder`, and `assertCanonicalJsonText()` compares the decoded string with
`JSON.stringify()` output. A default UTF-8 `TextDecoder` consumes a leading BOM,
so canonical JSON prefixed with bytes `EF BB BF` becomes the same decoded text
as the canonical byte sequence and can pass the text comparison. The promised
raw-byte identity check therefore remains incomplete.

This decision does not revoke the approved M4 profile-control static/unit gate,
B-08 closure, or B-10 closure. It blocks the fixed doctor gate and every later
step that depends on an accepted doctor inventory. Doctor execution remains
unapproved and unexecuted.

## Reviewed snapshot identity

The hashes below identify the reviewed working-tree bytes before this review
record, its follow-up prompt, and status metadata were added. They establish
byte identity only, not runtime approval or correctness by themselves.

| Target | SHA-256 |
|---|---|
| Sorted SHA-256 manifest of `containers/profile-control/**`, `containers/permissive/**`, `containers/constrained/**`, `profiles/permissive/**`, and `profiles/constrained/**` | `d1771bf02a21af8516e8eae160e8abc4eb50c548d162b3cb503f9c29a5679cbf` |
| `package.json` | `48bfb4d86e26a06e005b4301f8259aa6398714aa748d24d2c4bc51c6fa85dce5` |
| `package-lock.json` | `f01e2501c1db1d1cf58d8408f868d2a975d0b0054f282bd82e7b0560b18052a4` |
| `tsconfig.json` | `b2e243162f37e81de4d8286f9b524facdca631351bd0f183144c26ef2ba2682b` |
| `vitest.config.ts` | `ff43056d444a4096a5649c6627bd18c5876f1e45c6f1497f013828d530949943` |
| `docs/m4-execution-profiles.md` | `e5bce68b266bde070f60e3924fdd6450164f60a04bc60a1fea8c162066febbfc` |
| `docs/milestones.md` | `a576730692010eba55c19eb100748a825dc00d739ca13a1d73787a2dfeed3d73` |
| `docs/architecture.md` | `fb734e1cb90cc51e17f7a94bd48f370462c7a3883bab4c5a611eedd3c4163700` |
| `docs/reviews/m4-execution-profiles-doctor-boundary.md` | `8f7761106b58244300d5284b02dcdd825e69c7aa3f6d45a257710dea7045daeb` |
| `prompts/m4-execution-profiles-doctor-boundary-remediation.md` | `119b8207cd487beb0f0bb15be0650fc1b951d933efc2f21fca159036a0cd7110` |
| `prompts/reviews/m4-execution-profiles-doctor-boundary-remediation-review.md` | `89b9c123b447b404e25dd9225ad1c1b5d87561bb3ebfacb79dfbf35e8fc85049` |

The aggregate manifest was produced by sorting the repository-relative file
list, hashing each file, and hashing that sorted manifest.

## Finding closure assessment

### B-08 — Same-image identity binding: closed for static/unit

The third doctor command now emits sanitized local image ID, repository digest,
OS, and architecture alongside the structured environment-key array. Both image
observations pass the same identity validator, and `sameImageIdentity()` compares
all accepted fields before environment keys can enter an inventory. Drift in
each field is covered by a focused negative test and produces no inventory.

Evidence: `doctor.ts:36-38`, `doctor.ts:438-486`,
`doctor.test.ts:267-302`.

### B-09 — Exact canonical byte validation: remains blocking

The remediation correctly rejects whitespace, alternate key order, duplicate
members, and trailing data by validating a normalized object and comparing its
`JSON.stringify()` result to decoded text. That closes the previously listed
JSON-text variants, but it does not compare the original `Uint8Array` with a
canonical encoded byte sequence.

`TextDecoder("utf-8", { fatal: true })` consumes a leading UTF-8 BOM by default.
The review reproduced a 50-byte BOM-prefixed runtime response decoding to the
same string as the 47-byte canonical response. No doctor negative test covers a
leading BOM. An accepted result can therefore still have noncanonical raw bytes.

Evidence: `doctor.ts:283-325`, `doctor.test.ts:304-349`, and the review command
recorded below.

Required remediation: compare the original response bytes byte-for-byte with
`TextEncoder` output for the normalized canonical JSON plus the single final LF,
or reject a BOM before decoding and still perform an equivalent exact-byte
comparison. Add leading-BOM negative tests for all three structured doctor
outputs while preserving the existing canonical positive and noncanonical
negative cases.

### B-10 — Structured key-only environment projection: closed for static/unit

The fixed format emits one escaped JSON array element per image environment
entry, with a fixed invalid marker for missing delimiters. It does not serialize
the raw entry or value. The parser validates the structured array with the
existing uppercase key allowlist, rejects the invalid marker, and requires
`PATH` and `NODE_VERSION`. Focused negative tests cover embedded LF, CR, NUL,
delimiter-bearing, empty, duplicate, canary, and missing required keys.

Evidence: `doctor.ts:36-38`, `doctor.ts:450-486`,
`image-input.ts:38-54`, `doctor.test.ts:351-403`.

## Regression assessment

| Area | Re-review result |
|---|---|
| Three fixed command IDs; no arbitrary command/path/option | Passes source/test review. Production commands remain runtime-branded. |
| Fixed executable/argv, no pull/build/create/start/run | Passes source/test review; no production execution was performed. |
| Same-image environment binding | Passes and closes B-08 for static/unit. |
| Canonical JSON text variants | Passes the covered tests, but raw-byte identity remains blocked by B-09's BOM case. |
| Structured raw-value-free environment projection | Passes and closes B-10 for static/unit. |
| Timeout/output/nonzero/malformed/cleanup failure | Remains fail-closed in the reviewed tests. |
| Import-time safety and orchestrator approval gate | Remains fail-closed before Docker access. |
| Runtime availability/enforcement evidence | Not assessed, not executed, and not approved. |

## Verification observed

The focused decoder reproduction used the following fixed synthetic bytes only:

```sh
node --input-type=module -e 'const canonical = new TextEncoder().encode("{\\"client\\":\\"29.6.1\\",\\"server\\":\\"29.6.1\\"}\n"); const withBom = Uint8Array.from([0xef,0xbb,0xbf,...canonical]); const decoded = new TextDecoder("utf-8", { fatal: true }).decode(withBom); process.stdout.write(JSON.stringify({canonicalBytes: canonical.byteLength,withBomBytes: withBom.byteLength,decodedMatchesCanonicalText: decoded === new TextDecoder().decode(canonical)})+"\n")'
```

| Command | Observed result |
|---|---|
| Focused `node --input-type=module -e` BOM decoder check above | Exit 0; canonical response 47 bytes, BOM-prefixed response 50 bytes, decoded texts equal. |
| `npm run m4:typecheck` | Exit 0. |
| `npm run m4:static` | Exit 0; reported no Docker execution and no runtime-enforcement claim. |
| `npm run m4:test` | Exit 0; 13 test files, 111 tests passed. |
| `npm run m4:verify` | Exit 0; repeated typecheck/static and 13 files / 111 tests. |
| `npm run check` | Exit 0; format, lint, typecheck, and 80 test files / 442 tests passed. |
| `git diff --check` | Exit 0 before review-owned files were added. |
| `git status --short` | Confirmed that the target is an uncommitted working tree containing existing M3/M4 changes. |

After adding this review record, follow-up prompt, and status metadata,
`npm run m4:verify` and `npm run check` were repeated with the same passing
file/test counts. `git diff --check` also remained successful.

The following commands were not run: `npm run m4:doctor`,
`npm run m4:build`, `npm run m4:run:controls`, and
`npm run m4:verify:evidence`. No Docker/container command, runtime-socket access,
local image/runtime/host-environment enumeration, external network access,
credential access, host-home access, package install, host lifecycle experiment,
remote Git operation, commit, or publication was performed.

## Non-blocking findings and remaining limitations

### N-01 — Top-level M3 status remains stale

`README.md` still says the M3 independent re-review gate is pending, while the
M3 milestone and remediation review record say it is approved with non-blocking
follow-ups. This separate documentation issue does not change the doctor gate.

### N-02 — Cleanup failure remains non-retryable and secondary-hidden

The original doctor review's N-02 remains unchanged. Cleanup failure is
fail-closed, but cleanup becomes non-retryable once marked closed and a prior
primary failure hides a secondary cleanup failure. This does not permit an
accepted inventory and is outside the B-08 through B-10 remediation scope.

The fixed Docker client/server `29.6.1`, local Node base identity, and base
environment inventory remain candidates only. No version-controlled
`profile.json`, accepted image-input file, built-image digest, runtime
inspection, control evidence, or profile Observed result exists.

## Gate conclusion and next task

The fixed doctor remediation gate remains blocked because B-09's exact raw-byte
requirement is incomplete. B-08 and B-10 are closed for static/unit. The next
task is the narrow BOM/canonical-byte remediation defined in
[`prompts/m4-execution-profiles-doctor-canonical-bytes-remediation.md`](../../prompts/m4-execution-profiles-doctor-canonical-bytes-remediation.md),
followed by a fresh independent read-only re-review. Doctor execution, image
build, and control execution remain later steps requiring separate explicit
approval.

Canonical-byte remediation handoff update (2026-07-18): the working tree now
compares the original response length and every byte with the encoded validated
canonical JSON plus one final LF. Focused negative tests cover a leading UTF-8
BOM on runtime version, image identity, and environment snapshot output. This is
implementation status, not an independent B-09 closure decision; the doctor
gate remains blocked until a fresh read-only re-review follows
[`prompts/reviews/m4-execution-profiles-doctor-canonical-bytes-remediation-review.md`](../../prompts/reviews/m4-execution-profiles-doctor-canonical-bytes-remediation-review.md).
Doctor execution remains unapproved and unexecuted.

Canonical-byte remediation re-review update (2026-07-18): the subsequent
[canonical-byte remediation independent re-review](m4-execution-profiles-doctor-canonical-bytes-remediation.md)
confirmed original-byte identity and the three leading-BOM negative tests,
closed B-09, and approved the fixed doctor static/unit gate. This record
preserves its historical blocked decision. Doctor execution remains unapproved
and unexecuted pending a separate project-human decision.
