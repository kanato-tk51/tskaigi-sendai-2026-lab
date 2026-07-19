# Presentation MVP sanitized examples

These three JSON files are the tracked, talk-facing inputs for P4:

- `routes.json`: the five-route trigger/phase/count projection accepted by the
  P1 inventory review;
- `profiles.json`: the accepted one-local-pair codegen observations and all
  three exhausted Vite attempts' explicit `not-inspected` / `missing`
  limitation; and
- `artifact.json`: the accepted one-local-run P3 build/verify/copy/tamper
  projection.

They were derived from the repository-tracked source records named in each
file. P4 did not open, enumerate, copy, or transform an ignored run root. The
projection omits raw events, canary values, file contents, host paths,
container identities, stdout/stderr, timestamps, PIDs, durations, and
unsanitized errors. Exact reviewed P2 run IDs and the P3 build ID are retained
only to bind each example to its recorded source observation; local M2 run IDs
remain omitted by the reviewed P1 projection.

`docs/evidence-map.md` and its three talk tables are generated from these files.
Use `npm run p4:generate` after an intentional example change and
`npm run p4:verify` to prove that the tracked document is current. Neither
command reads `results/runs/**` or performs a probe, build, Docker, network, or
deployment operation. The
[`focused final review`](../../../docs/reviews/p4-evidence-map.md) approved the
P4 baseline, and the later
[`selected Vite result review`](../../../docs/reviews/p2-vite-diagnostic-result.md)
accepted the three-attempt projection without promoting selected Vite Observed.
