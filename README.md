# tskaigi-sendai-2026-lab

TypeScript ツールチェーンにおける依存コードの実行経路を、安全なローカル条件で比較するための実験ラボです。M-1 の repository scaffold と、独立した M0 npm 12 marker-only spike を実装しています。`probe-core`、adapter、共通 harness はまだ未実装です。

## Development baseline

- Node.js: `>=20.18.2 <21`
- npm: `11.12.1`（`packageManager` で固定）
- module system: Node.js ESM
- npm workspaces: `packages/*` のみ

M0 の npm 12 lifecycle 実験は、この root toolchain とは独立した Docker image に固定します。`experiments/` と `fixtures/` は root workspace に含まれません。root install は package script を実行しない設定です。全5 scenario の npm 観測は保存済みですが、Docker `29.6.1` の tmpfs を `docker cp` できず、検証付き stdout fallback を用いたため M0 全体は Inconclusive です。実行方法と制約は [experiments/npm12-install/README.md](experiments/npm12-install/README.md) を参照してください。

依存関係は lockfile どおり、script を無効化して導入します。

```sh
npm ci --ignore-scripts
```

## Quality commands

```sh
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test
npm run check
```

`npm run check` は format check、lint、typecheck、unit test の順に実行します。`lab:*` や `artifact:*` の planned command は後続 milestone の対象であり、現在は存在しません。

M0 は通常の regression check に含めず、Docker を明示して個別実行します。

```sh
npm run m0:build
npm run m0:doctor
npm run m0:run
npm run m0:verify
npm run m0:clean
```
