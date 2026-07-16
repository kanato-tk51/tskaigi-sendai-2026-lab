# tskaigi-sendai-2026-lab

TypeScript ツールチェーンにおける依存コードの実行経路を、安全なローカル条件で比較するための実験ラボです。M-1 の repository scaffold、独立した M0 npm 12 marker-only spike、M1 の副作用なしで import できる `@tskaigi-lab/probe-core`、M2-A の固定 npm lifecycle adapter、M2-B の固定 ESLint adapter、M2-C の固定 Vitest `setupFiles` adapter、M2-D の固定 Vite plugin adapter、M2-E の固定 code-generation CLI adapter を実装しています。M2-A の container evidence-transfer boundary と共通 harness はまだ未実装です。M2-A/D/E は独立実装レビュー済みですが、M2-A の runtime gate と experiment-matrix Observed は未実測です。詳細は[M2-A adapter contract](docs/m2-a-npm-lifecycle-adapter.md)、[M2-A implementation review](docs/reviews/m2-a-npm-lifecycle-adapter.md)、[M2-D implementation review](docs/reviews/m2-d-vite-plugin-adapter.md)、[M2-E implementation review](docs/reviews/m2-e-codegen-adapter.md)を参照してください。

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

M2-C は `packages/vitest-setup-probe` の private ESM package `@tskaigi-lab/adapter-vitest-setup` `0.0.0` です。Vitest exact `3.2.7`、`forks` pool、single fork/worker、setup file/test file/test case 各1件を固定します。2 route eventは別callbackではなく、同じawaited setup-module import内のlate module-evaluation checkpointとsetup-body checkpointです。worker ID は `null`、session/segment はworker所有、tool API changeはnot applicableです。

```sh
npm run m2c:verify
npm run m2c:run
```

`m2c:run` は引数を受けず、意味上 `vitest run --config vitest.scenario.config.ts --configLoader runner fixture/designated.test.ts` だけを adapter workspace で起動します。Coordinatorにはrun固有のtool tempを`TMPDIR`/`TMP`/`TEMP`として渡し、timeout/output-limitではLinuxの専用process groupをsettleしてからinventory/cleanupします。検証済みproducer segmentはignored `results/runs/m2-c-vitest/<run-id>/`へ保存されます。詳細は[M2-C Vitest setupFiles adapter note](docs/m2-c-vitest-setup-adapter.md)を参照してください。

M2-A は `packages/npm-lifecycle-probe` の private ESM package `@tskaigi-lab/adapter-npm-lifecycle` です。Node.js `v24.18.0`、npm `12.0.1`、固定 `postinstall` entry、route 1、capability 6、tool API change 0、total 7を固定します。Host側はmanifest、fixture、static verifier、probe-core preparationだけを検証し、instrumented lifecycleのpack/install/runはdisposable container内に限定します。

```sh
npm run m2a:verify
```

M0のDocker `29.6.1` tmpfs-to-`docker cp` evidence-transfer制約が未解決のため、container executionとexperiment-matrix ObservedはBlocked/Inconclusiveのままです。詳細は[M2-A npm lifecycle adapter note](docs/m2-a-npm-lifecycle-adapter.md)を参照してください。

M2-D は `packages/vite-plugin-probe` の private ESM package `@tskaigi-lab/adapter-vite-plugin` `0.0.0` です。Vite exact `6.4.3`をworkspaceからdirect pinし、Rollup `4.62.2`、esbuild `0.25.12`、single production build、fixed entry/designated fixtureを固定します。Observe/APIともroute 6、`buildStart`直後のcapability 6、tool API change 3、total 15、producer sequence `0..14`、producer 1、worker ID `null`です。

```sh
npm run m2d:verify
npm run m2d:run:observe
npm run m2d:run:api
```

Vite coordinatorは意味上 `vite build --config vite.scenario.config.ts --configLoader runner --mode production`だけをfixed argv/cwdで起動します。Observeは3 operationを開始せず`skipped/NOT_APPLICABLE`、APIはmodule transform、fixed emitted asset、entry bundle mutationを各1件実行します。Probe direct marker、official API result、通常のVite/Rollup output writeは別evidenceです。Local runnerは検証済みproducer segmentとsanitized summaryをignored `results/runs/m2-d-vite/<variant>/<run-id>/`へ保存しますが、これはexperiment-matrix Observed、profile比較、M3 collector/global sequence/reportではありません。詳細は[M2-D Vite plugin adapter note](docs/m2-d-vite-plugin-adapter.md)を参照してください。

M2-E は `packages/codegen-probe` の private ESM package `@tskaigi-lab/adapter-codegen` `0.0.0` です。固定 explicit CLI は `observe`、`api`、`dry-run` のみを受け付け、route 5、capability 6、tool API change 1、total 12、producer sequence `0..11` を記録します。

```sh
npm run m2e:verify
npm run m2e:run:observe
npm run m2e:run:api
npm run m2e:run:dry-run
```

Observe は direct filesystem write、API は documented generator API と fixed artifact materialization、dry-run は変更なしを記録します。Local runner は sanitized results を ignored `results/runs/m2-e-codegen/<mode>/<run-id>/` に保存しますが、これは experiment-matrix Observed、profile 比較、M3 collector/report ではありません。詳細は[M2-E code-generation adapter note](docs/m2-e-codegen-adapter.md)を参照してください。

M0 は通常の regression check に含めず、Docker を明示して個別実行します。

```sh
npm run m0:build
npm run m0:doctor
npm run m0:run
npm run m0:verify
npm run m0:clean
```
