# tskaigi-sendai-2026-lab

TypeScript ツールチェーンにおける依存コードの実行経路を、安全なローカル条件で比較するための実験ラボです。M-1 の repository scaffold、独立した M0 npm 12 marker-only spike、M1 の副作用なしで import できる `@tskaigi-lab/probe-core`、M2-B の固定 ESLint adapter を実装しています。M2-A/C/D/E と共通 harness はまだ未実装です。

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

M1 の package 単位の確認には次を使用します。`probe-core` は `probe-event/v2` でcapability attempt、route invocation、official tool API changeを分離し、manifest allowlist内の複数phaseとproducerごとのJSONL segmentまでを担当します。segment collector、global sequence、adapter実測はM2/M3以降の対象です。

```sh
npm run probe-core:build
npm run probe-core:typecheck
npm run probe-core:test
npm run probe-core:static
```

M2-B は `packages/eslint-plugin-probe` の private ESM package `@tskaigi-lab/adapter-eslint` です。ESLint `9.39.5`、1 JavaScript fixture、flat config、cache/watch/config discovery 無効の `lint-only` と `fix` を固定し、module evaluation、plugin initialization、rule create、Program visitor、fixer callbackを記録します。direct filesystem writeはprobe-core capability、source fixはESLint official fixer APIのtool changeとして別eventにします。

```sh
npm run m2b:verify
npm run m2b:run:lint
npm run m2b:run:fix
```

Runnerはschema validation済みのproducer-local raw segmentだけをignored `results/runs/m2-b-eslint/`へ保存します。Global sequence、collector、summary/Markdown reportはM3の責務です。詳細は[M2-B ESLint adapter note](docs/m2-b-eslint-adapter.md)を参照してください。

M0 は通常の regression check に含めず、Docker を明示して個別実行します。

```sh
npm run m0:build
npm run m0:doctor
npm run m0:run
npm run m0:verify
npm run m0:clean
```
