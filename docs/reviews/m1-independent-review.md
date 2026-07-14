# M1 independent review record

## Gate decision

- Decision: `APPROVE WITH NON-BLOCKING FOLLOW-UPS`
- Target: the current M1 uncommitted working tree
- Blockers: none
- Critical / High findings: none
- M-08: resolved
- M0 regression: none
- The approval applies to the reviewed uncommitted worktree, not to a named commit.

This record preserves the decision supplied for the final independent review. It does not recreate or invent review prose that was not provided.

## Follow-up state

At review time, the open follow-ups were L-05, L-06, and I-04.

| ID | Closure state | Result |
|---|---|---|
| L-05 | complete in this closure task | The static verifier now rejects undeclared/external bare imports and all unapproved package `imports` aliases while retaining explicit builtin and package-internal relative imports. |
| L-06 | complete in this closure task | The M0 verification path now names the existing `experiments/npm12-install/scripts/verify-static.mjs`; a documentation consistency test checks the known M0 and M1 command lists. |
| I-04 | accepted non-blocking limitation | No cleanup implementation was added. The limitation remains tracked below. |

Closure verification on 2026-07-14 ran root `npm run check` successfully after L-05 and L-06 (23 test files, 177 tests). The focused M0 test and M0 static verifier also succeeded. These results belong to the closure task and are not represented as additional independent-review work.

## L-05 module policy after closure

The canonical runtime source scan is `packages/probe-core/src/` only. It scans `.ts`, `.mts`, `.cts`, `.js`, `.mjs`, and `.cjs`; `.tsx` and `.jsx` are rejected. Tests, fixtures, and generated `dist/` output are outside this source scan and are checked by their own test/build consistency steps.

Allowed references are Node.js builtins recognized by `module.isBuiltin()` in either `node:` or recognized bare form, relative imports that remain inside `src/`, and TypeScript `paths` aliases whose every resolved target remains inside `src/`. Static, side-effect, type-only, export-from, literal dynamic import, TypeScript import-equals, and literal `require` forms are inspected.

External bare packages are forbidden regardless of declaration. Runtime `dependencies`, `optionalDependencies`, and `peerDependencies` remain forbidden; a `devDependency` does not authorize runtime-source import. Package self-reference is also rejected because M1 source does not need it.

Package `imports` is currently unused and all `#` aliases are fail-closed. Exact internal aliases are not implicitly approved; external/tool/workspace targets, root escapes, unknown aliases, conditional targets, arrays, and wildcard patterns fail. To approve an internal alias later, a separate reviewed change must define exact target semantics, prove the resolved target stays inside the package/source boundary, retain external/workspace rejection, add positive and negative tests, update this policy, and rerun the M1 static and root checks. Unsupported Node.js resolution forms must continue to fail closed.

Computed dynamic import and nonliteral `require` are rejected. Static AST inspection does not prove runtime isolation and may not detect every custom or aliased loader; that residual limitation remains subject to human review.

## I-04 accepted limitation

After exclusive creation succeeds, a direct file-write failure during write, sync, validation, or close can leave a partial output file. The attempt is not reported as success: it remains a capability failure, distinct from a later event-persistence failure. M1 does not guarantee automatic rollback.

Runs therefore use disposable directories, and a retry must use a new clean directory. M1 does not delete an existing output as cleanup. A future I-04 cleanup hardening follow-up would need to confirm that the path still identifies the inode created by the failed attempt and preserve the original failure even if cleanup also fails.

## Adapter readiness

- M2-A: M1-side boundary is ready; the M0 transport decision is still required.
- M2-B through M2-E: ready from the M1 boundary perspective.

No M2 adapter is implemented or approved by this record.
