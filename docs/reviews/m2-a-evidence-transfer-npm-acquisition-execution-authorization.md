# M0/M2-A npm-acquisition execution authorization handoff

Authorization date: 2026-07-23

Status: **EXPLICIT HUMAN AUTHORIZATION RECEIVED FOR AT MOST ONE ELIGIBLE
OCCURRENCE**

## Authorization source

The current repository user replied `承認します。` in the Codex conversation
immediately after being shown the exact prompt identities and the four-part
M2A-NG06 boundary below. This record carries that explicit reply into the fresh
execution worker without recording credentials, private identity data, or a
claim that a separate review occurred.

This is direct human authorization for the named boundary. It is not
continuing-work standing authorization, evidence that the occurrence succeeds,
or permission for an alternate command, path, generation, package, registry,
request, retry, cleanup, construction, Docker, publication, or evidence
promotion.

## Authorized prompt identities

- `prompts/m2-a-evidence-transfer-npm-acquisition-execution.md`
  - bytes: `12,829`
  - SHA-256:
    `cab8482f8ace0b3ad1460e95b1419965a92bd3e00e2ebd501b5e8f82757b0d8f`
- `prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md`
  - bytes: `13,241`
  - SHA-256:
    `a62a49b16a94bcd75a289e8b6da97eba6cb2e1973f893fa60c013fb5a856aa8b`

Any prompt-identity mismatch makes this authorization ineligible.

## Authorized M2A-NG06 boundary

The user explicitly authorized all four items presented together:

1. normal DNS and exactly the two reviewed HTTPS GET requests to
   `registry.npmjs.org` for npm `12.0.1`;
2. exclusive creation and retained success/failure state only under
   `experiments/npm12-install/.work/m2a-transfer-acquisition-20260721-01`;
3. consumption of generation `20260721-01` after one issued occurrence, with
   no retry after interruption, unknown settlement, or host loss; and
4. a later separate Docker-free read-only no-follow review of only that fixed
   acquisition root.

The permission is valid for at most one occurrence that satisfies every
preflight and adjacency constraint in the authorized execution prompt. Before
issuance, source, prompt, command, authority, or preflight drift blocks without
communication. At or after issuance, the generation is exhausted regardless
of result.

No producer, fixed root, host runtime, DNS, HTTPS, npm candidate, construction,
Docker, runtime/result, evidence, Expected, or `Observed` boundary was accessed
or produced while recording this authorization.

Next: execute the exact authorized adjacent-preflight/one-occurrence task under
`../../prompts/m2-a-evidence-transfer-npm-acquisition-execution.md`; do not
substitute standing authorization, inspect the fixed root in the execution
session, or retry.

## Authorized occurrence disposition

The exact adjacent preflight passed and the direct command was issued once.
The process settled naturally with exit `1`, empty stdout, and the exact
29-byte `M2A_INPUT_ACQUISITION_FAILED\n` stderr line. The generation is
exhausted without retry, and the execution worker did not inspect or classify
the fixed root. The authoritative bounded handoff is
[`m2-a-evidence-transfer-npm-acquisition-execution.md`](m2-a-evidence-transfer-npm-acquisition-execution.md).

Continuing-work standing authorization was not used for the external
occurrence; this record's direct human authorization was the authority.

Next: perform the fresh independent Docker-free fixed-root result review under
`../../prompts/reviews/m2-a-evidence-transfer-npm-acquisition-result-review.md`;
do not run either producer, communicate externally, repair, or retry.
