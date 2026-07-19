# P2 selected Vite promotion consistency review

## Review target and decision

- Target: the local Docker-free restoration candidate for `P2-V08` through `P2-V11`
  that restores the accepted boundary for the selected Vite slice after the
  unsupported candidate promotion.
- Review type: fresh independent Docker-non-executing, retained-state-free
  consistency review.
- Decision: **accepted**.
- Blocking findings: none.
- Non-blocking findings: one unchanged limitation remains — the ignored fixed staging
  path `staging/vite.pre-p2-vite-diagnostic-96e81f81` is a pre-existing drift and
  is not treated as active runtime evidence.
- Retry or execution gate: no execution gate is newly approved; existing `20260719-03`
  runtime state remains non-retryable.
- Experiment-matrix Observed: unchanged.
- P2 disposition: selected Vite remains three immutable Inconclusive attempts
  (`20260719-01` / `20260719-02` / `20260719-03`), explicit and unchanged.

This re-review confirms the restored state is a non-executing consistency
fix; it does not create, mutate, or reinterpret runtime evidence as `selected
Vite` `Observed`.

## Accepted restoration evidence

The reviewed candidate re-aligns:

- P2-V08: `profiles.json`, generator assertions, evidence map, presentation
  scope/inventory, selected-profile contract, and P4 review to the accepted
  three-attempt projection baseline.
- P2-V09: ordered profile execution remains terminal after an incomplete first
  outcome; paired run remains blocked to one-shot Inconclusive behavior.
- P2-V10: child-residue handling remains as accepted in re-reviewed P2-V03/P2-V07
  behavior.
- P2-V11: fixed-staging fixture verification moved to isolated test-owned
  disposable storage and does not mutate fixed runtime staging.

No `experiment-matrix.md` edits occur in this change set.

## Reviewed identities

| Target | SHA-256 |
|---|---|
| `containers/presentation-profiles/src/plan.ts` | `0cdd5f6a4d3d6680acfe174e91b4937b67b8e58ecaddcad6018656637eee388b` |
| `containers/presentation-profiles/src/vite-executor.ts` | `92f61dbd2f1b6a80ed5017b398149e005daefa373c96a3b301c4eb8bb76c26df` |
| `containers/presentation-profiles/src/vite-projection.ts` | `bcefcdbf54823361f1f8d3d674701334536c6a1f91f5279a693d748e6f31fe3e` |
| `containers/presentation-profiles/runner/vite-runner.js` | `40830b9b66153f8258eee42aed476d23f564ed0e5fef834f679a9834f4dc0f4e` |
| `containers/presentation-profiles/test/plan.test.ts` | `765eb6b1d79a95454504cd09947e0032c1b22a8fed4fa79f3b36e6e3b157e8aa` |
| `containers/presentation-profiles/test/vite-executor.test.ts` | `d6fdc1cb7bbb09716226e39428fca5d8ecda5d51da8da2a81b25f931730fea2e` |
| `containers/presentation-profiles/test/vite-projection.test.ts` | `1c9fb59b7df4e9218f6d153110e1d02b19d211db7562ca5151205072b8d97f4d` |
| `containers/presentation-profiles/test/vite-runner.test.ts` | `dd98788607fb7d3c00226f54131d8cac7a8c5ad007f14b8c3c24806f342b1614` |
| `packages/vite-plugin-probe/src/scenario-context.ts` | `1ec9e08a4070306fc9d8a6e57e86c78cd0664391d9b2cb8366e4a033bd0a27a9` |
| `packages/vite-plugin-probe/test/scenario-context.test.ts` | `85b63b2f4e9992f46250f22184ac22e7b083c26dcce5b476e93edde30d3b88fa` |
| `results/examples/presentation-mvp/profiles.json` | `9760bbf3f7448518712ecd056de0030d04b2471eb96a51f52758ed9dbe394e33` |
| `scripts/presentation-evidence.mjs` | `3a0adfe164a2acf49444d4b0f3a3bc3a9df90f8d1357a53ab51be7a255ea17af` |
| `docs/evidence-map.md` | `0d81145b7480b46974b8f09fa5794559f561ab10818df2934245f6cf2b5ae6ad` |

## Verification observed

| Command or assertion | Observed result |
|---|---|
| `npm run p2:verify` | Exit 0; P2 typecheck and 9 files / 124 tests passed. |
| `npm run p4:verify` | Exit 0; 1 focused file / 2 tests passed. |
| `npm run m2d:verify` | Exit 0; 12 files / 75 tests passed. |
| `npm run p2:build` | Exit 0. |
| `npm run check` | Exit 0; root formatting, lint, typecheck and 101 files / 699 tests passed. |
| `git diff --check` | Exit 0. |

No Docker command, runtime socket, retention of historical result state, external
network, credentials, Remote Git, publication, or deployment action was used.
This is a Docker-free, retained-state-free review.

## Conclusion

- `P2-V08`: accepted; the projection and matrix are restored to last accepted baseline.
- `P2-V09`: accepted; ordered one-shot pair-stop semantics are preserved.
- `P2-V10`: accepted; accepted child-residue behavior remains intact.
- `P2-V11`: accepted; disposable staging verification is non-mutating to fixed
  production staging.

The candidate is approved as a non-executing consistency restoration and does not
change `selected Vite Observed`, `candidates` promotion, or the already accepted
presentation MVP conclusions.

Next: none.
