# M4 execution profile Expected 契約

## 状態と責任範囲

状態: **Expected-only 契約は independent review 済みで、2026-07-17 にプロジェクトの human reviewer が明示的に承認済み。B-03/B-04/B-07は独立read-only re-reviewでclosureし、static/unit implementation gateは承認済み。固定doctor remediationの独立re-reviewはB-08/B-10をclosureし、canonical-byte remediationのfresh独立read-only re-reviewはB-09をclosureした。Runtime-template compatibility correctionもfresh独立read-only re-reviewで承認され、現在のfixed doctor static/unit gateは承認済み。Post-bootstrap fixed doctorはreview済みbytesでaccepted candidate inventoryを取得済み。Exact-input proposalは実装済み・fresh independent read-only review待ちで、adoption、image build、controls、runtime enforcementは未承認・未実行、Observed は未実測**。契約の承認判断は[契約の独立レビュー記録](reviews/m4-execution-profiles-contract.md)、exact-input proposalは[M4 exact-input proposal](m4-execution-profiles-exact-input.md)、元の実装gate判断は[実装の独立レビュー記録](reviews/m4-execution-profiles.md)、B-01〜B-06 remediation判断は[remediation re-review記録](reviews/m4-execution-profiles-remediation.md)、現在のstatic/unit gate判断は[input-binding remediation re-review記録](reviews/m4-execution-profiles-input-binding-remediation.md)、元のdoctor gate判断は[fixed doctor boundary independent review](reviews/m4-execution-profiles-doctor-boundary.md)、B-08/B-10判断は[doctor remediation independent re-review](reviews/m4-execution-profiles-doctor-boundary-remediation.md)、B-09判断とdoctor実行履歴は[canonical-byte remediation independent re-review](reviews/m4-execution-profiles-doctor-canonical-bytes-remediation.md)、現在のdoctor bytesとpost-review execution handoffは[runtime-template compatibility independent re-review](reviews/m4-execution-profiles-runtime-template-compatibility.md)に残している。Doctorはfixed 3 command、pull/build/create/start/runなし、通常時のDocker access前`M4_EXECUTION_NOT_APPROVED`、step 2/3 identity cross-binding、structured key-only framing、original-byte canonical comparisonを維持する。`continue-repository-work`のstanding authorizationを一回限定実行の承認に使用したが、これは別のhuman reviewが行われたことを意味しない。Doctor後はorchestrator sourceを通常のfail-closed状態へ戻した。次のtaskは`prompts/reviews/m4-execution-profiles-exact-input-contract-review.md`に従うfresh independent read-only reviewである。Image buildとcontrol実行はさらに別の後続gateである。

Current exact-input update (supersedes the exact-input pending/next-task clauses above): [fresh independent review](reviews/m4-execution-profiles-exact-input-contract.md)がblockしたB-11/B-12へのnon-executing remediationを実装済みである。Profile pre-start inspectはDocker `29.6.1`互換の`json` helperだけでfull projectionを直接構成し、pre-build stepはclient/server両方のexact `29.6.1` canonical bytesをbuild前に検証する。B-11/B-12 closureとfixed host-backend/runtime contractは`prompts/reviews/m4-execution-profiles-exact-input-backend-remediation-review.md`に従うfresh independent read-only re-review待ちであり、exact-input adoption、Docker/build/control、runtime enforcement、Observedは進めない。

Backend remediation re-review update (2026-07-18): [fresh independent read-only re-review](reviews/m4-execution-profiles-exact-input-backend-remediation.md)はB-11/B-12をstatic/unit境界でclosureし、base/staging/fixed-backend contractを承認した。これはexact-inputのproduction採用、production backend有効化、Docker access、image build、`profile.json`、control実行、runtime enforcement、Observedを承認しない。次のtaskはreview済みsnapshotとfixed planだけへbindするproduction offline-build backendのnon-executing implementation contractと独立review promptを作ることであり、Dockerは実行しない。

Offline-build backend contract handoff (2026-07-18): [non-executing implementation contract](../prompts/m4-execution-profiles-offline-build-backend.md)と[独立review prompt](../prompts/reviews/m4-execution-profiles-offline-build-backend-review.md)を作成した。Contractはbuild-only executor、fixed production host filesystem/process backend、canonical sanitized build resultをaccepted snapshot/branded layout/fixed 3-command image build planだけへbindし、通常entry/package rootからproduction backendへ到達させない。次のtaskはこのcontractのstatic/unit実装であり、Docker、image build、`profile.json`、controls、runtime enforcement、Observedは未承認・未実行のままである。

Offline-build backend implementation update (2026-07-18; supersedes the next-task clause immediately above): build-only executor、canonical `lab-profile-offline-build-result/v1`、fixed production host filesystem/process/cleanup backendをnon-executing static/unit境界で実装した。Accepted snapshot、branded layout、fixed doctor/build/image-ID inspect planのidentityだけを受け、private exact staging copy/read-back、credential-empty config、no inherited environment、bounded process close/output/cleanupを要求する。通常entry/package rootはproduction backendをimport/construct/exportせず`M4_EXECUTION_NOT_APPROVED`を維持する。次のtaskは[`prompts/reviews/m4-execution-profiles-offline-build-backend-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-backend-review.md)に従うfresh independent read-only reviewである。Docker、image build、built-image digest、`profile.json`、control実行、runtime enforcement、Observedは未承認・未実行のままである。

Offline-build backend independent review update (2026-07-18; supersedes the next-task clause immediately above): [fresh independent read-only review](reviews/m4-execution-profiles-offline-build-backend.md)はaccepted base/staging/fixed planとbuild-only filesystem/activation boundaryを再確認したが、production offline-build backendのstatic/unit gateをB-13〜B-15でblockした。Known synthetic image digestがcomplete resultへ入り得ること、canonical resultがfailure/completed-stepの不可能な組合せを受理すること、host processのtimeout後のoutput overflowがfirst failureを上書きし得ることがblockerである。次のtaskは[`prompts/m4-execution-profiles-offline-build-result-remediation.md`](../prompts/m4-execution-profiles-offline-build-result-remediation.md)に従うnon-executing remediationである。Docker、image build、built-image/profile binding、control実行、runtime enforcement、Observedは未承認・未実行のままである。

Offline-build result remediation implementation update (2026-07-18; supersedes the next-task clause immediately above): known synthetic digestをinspect/plain/canonical resultで拒否し、failure codeをexact completed-step prefixとversion/digest状態へbindした。Production process backendはtimeout/output/process errorの最初のeventだけをlatchし、後続drain eventで書き換えず、untrusted contradictory flagsをexecutorでfail closedにする。Accepted input/fixed planと通常entry/package rootの非到達性は維持している。次のtaskは[`prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-result-remediation-review.md)に従うfresh independent read-only re-reviewである。Docker、image build、built-image/profile binding、control実行、runtime enforcement、Observedは未承認・未実行のままである。

Offline-build result remediation re-review update (2026-07-18; supersedes the next-task clause immediately above): [fresh independent read-only re-review](reviews/m4-execution-profiles-offline-build-result-remediation.md)はB-13/B-14/B-15をstatic/unit境界でclosureし、production offline-build backend static/unit gateを承認した。これはexact-input production採用、backend activation、Docker access、offline build、built-image digest、`profile.json`、control実行、runtime enforcement、Observedを承認しない。次のtaskはreview済みsnapshot、exact run ID/layout/plan、side-effect/cleanup、sanitized result、post-run restoration/verificationだけを固定する一回限定offline-build execution gateの作成であり、そのtaskではDockerを実行しない。

Offline-build execution-gate definition update (2026-07-18; supersedes the next-task clause immediately above): [`prompts/m4-execution-profiles-offline-build-execution.md`](../prompts/m4-execution-profiles-offline-build-execution.md)はreview済みaggregate/source hashes、fixed run ID `m4-offline-build-20260718-01`、repository-owned layout、fixed staged tag、review対象temporary activation bytes、exact one-time command、3-command side-effect/cleanup境界、canonical sanitized result、ordinary source/compiled output restorationを固定した。Temporary activationはcompile-onlyでtypecheckし、source hashを記録した後に通常entryへ戻しており、Docker/buildは実行していない。Gate candidateはまだ実行を承認しない。次のtaskは[`prompts/reviews/m4-execution-profiles-offline-build-execution-gate-review.md`](../prompts/reviews/m4-execution-profiles-offline-build-execution-gate-review.md)に従うfresh independent read-only reviewである。承認後のfresh `continue-repository-work` invocationだけがstanding authorizationをexact one-time buildへ使用でき、これは別human reviewを意味しない。Profile binding、controls、runtime enforcement、Observedは後続gateのままである。

Offline-build execution-gate independent review update (2026-07-18; supersedes the next-task clause immediately above): [fresh independent read-only review](reviews/m4-execution-profiles-offline-build-execution-gate.md)はsource/staging/activation/ordinary restoration hashes、fixed run/layout/tag、accepted snapshot/plan/backend identity、3-command side-effect/cleanup、canonical result、one-time/no-retry boundaryを独立照合し、新しいblocking findingなしでexact one-time execution gateを承認した。Reviewはtemporary activation、Docker、buildを実行していない。次のtaskはfresh workerが[`prompts/m4-execution-profiles-offline-build-execution.md`](../prompts/m4-execution-profiles-offline-build-execution.md)に従い、review済みsnapshotを再検証してstanding authorizationで`npm run --silent m4:build`をちょうど1回実行し、通常source/compiled outputを即時復元してcanonical sanitized resultを記録することである。これは別human reviewを意味しない。Profile binding、controls、runtime enforcement、Observedは後続gateのままである。

One-time offline-build execution follow-up (2026-07-18; supersedes the next-task clause immediately above): fresh workerはreview済みsnapshotとrun-root absenceを再検証し、standing authorizationで`npm run --silent m4:build`をちょうど1回実行した。これは別human reviewではない。Commandはexit 1、canonical resultは`inconclusive / CLEANUP_FAILURE`で、4 build-only stepとDocker client/server `29.6.1`を記録したが、`builtImageDigest`は`null`である。Fixed planにimage removalはなく、inspect済みfixed staged tagは後続recovery gateへ残り、追加Docker commandでは再inspectしていない。Fixed run rootはruntime-created buildx/token-seed stateを`docker-config`に保持し、`staging`と`docker-config/config.json`は存在しない。Retryやforced cleanupは行っていない。通常source/compiled outputはreview済みhashへ即時復元し、post-restoration `m4:verify`（17 files / 176 tests）とroot `check`（84 files / 507 tests）は成功した。次のtaskはexisting fixed tagとretained run rootだけへbindし、exact digest inspect最大1回とidentity-checked owned-state treatmentを固定するDocker非実行のpost-cleanup-failure recovery contractと独立review promptの作成である。Profile binding、controls、runtime enforcement、Observedは未確立のままである。

Offline-build recovery contract handoff (2026-07-18; supersedes the next-task clause immediately above): [non-executing recovery implementation contract](../prompts/m4-execution-profiles-offline-build-recovery.md)と[独立review prompt](../prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md)を作成した。Contractはrecorded `CLEANUP_FAILURE`、fixed run ID/tag、retained exact treeだけへbindし、fixed local image-ID inspectを最大1回に制限する。Run-owned stateはcontentsをread/hashせずpre/post identity検証して常に保持し、削除・修復しない。次のtaskはrecovery-only executor/result/production host backendのDocker非実行static/unit実装である。Recovery execution、built-image digest、profile binding、controls、runtime enforcement、Observedは未確立のままである。

Offline-build recovery implementation update (2026-07-18; supersedes the next-task clause immediately above): recorded failed-build identity、fixed run ID/tag、retained exact inventoryへbindしたrecovery-only executor/resultとproduction host backendをnon-executing static/unit境界で実装した。Pre/post validationはtype/mode/size/link/device/inode identityをprivateに照合し、runtime-created contentsをread/hash/serializeせず、exact local image-ID inspectをinstance最大1回に制限して全outcomeでstateを保持する。通常entry/package rootからは到達不能である。次のtaskは[独立review prompt](../prompts/reviews/m4-execution-profiles-offline-build-recovery-review.md)に従うfresh independent read-only reviewである。Docker、recovery execution、state deletion、built-image digest、profile binding、controls、runtime enforcement、Observedは未確立のままである。

Offline-build recovery independent review update (2026-07-18; supersedes the next-task clause immediately above): [fresh independent read-only review](reviews/m4-execution-profiles-offline-build-recovery.md)はfailed-build/run/tag、content non-read/retention-only、single-inspect/digest/result、ordinary non-reachabilityをstatic/unitでacceptしたが、recovery backend gateをB-16/B-17でblockした。Retained mode比較がspecial bitsを拒否せず、abnormal closeでactive childが残ったままpost-attempt state validationを成功扱いできる。次のtaskは[recovery remediation prompt](../prompts/m4-execution-profiles-offline-build-recovery-remediation.md)に従うnon-executing exact-mode/process-settlement remediationである。Docker、recovery execution、state deletion、built-image/profile binding、controls、runtime enforcement、Observedは引き続き未承認・未実行である。

Standing-authorization clarification (2026-07-18): 次のgateで人に必要なのはreview済みoffline sourceからexact fixed tagをlocal runtimeへ供給または復元する外部状態変更である。その後の`continue-repository-work` invocationが新しい一回限定doctor再実行のstanding authorizationを与えるため、承認文言だけを別途要求しない。

One-time registry bootstrap update (2026-07-18): project humanはM4 bootstrapだけに、credential-empty disposable Docker configと固定`/usr/bin/docker` CLIでexact tag/platformを1回pullする外部network例外を明示的に承認した。Pullはexit 0で、sanitized inspectは`linux` / `amd64`、local image ID `sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`、唯一のrepository digest `node@sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`を観測した。Disposable configは削除済みで、login、credential、再pull、別image、build、control実行はなかった。この限定bootstrapはlocal availabilityだけを確立し、doctor inventory、exact-input adoption、runtime enforcement、Observedを確立しない。

Post-bootstrap fixed doctor update (2026-07-18): fresh workerはreview済みaggregate/source/package/toolchain SHA-256を再検証し、`npm run m4:verify`（13 files / 115 tests）後にstanding authorizationで`npm run m4:doctor`をちょうど1回実行した。これは別のhuman reviewではない。Doctorは3 stepすべてを完了して`accepted`となり、client/server `29.6.1`、exact tag `node:20.18.2-bookworm-slim`、base/local digest `sha256:4ada13d4258db3809cbff56d605f80af8383bf1f823168d0518d8dce799e7cf0`、`linux` / `amd64`、key-only inventory `PATH`、`NODE_VERSION`、`YARN_VERSION`を観測した。Environment value、stderr、raw error、host path、credentialは保存せず、pull/build/create/start/run/controlも実行していない。Entry sourceとcompiled outputは直後に通常のfail-closed状態へ戻し、post-restoration `m4:verify`（13 / 115）とroot `check`（80 / 446）が成功した。このinventoryはexact-input candidateであり、adoption、runtime enforcement、Observedを単独では確立しない。

Exact-input proposal update (2026-07-18): candidateのbase digestとordered key-only environment inventoryをversion管理された[`containers/profile-control/image-input.json`](../containers/profile-control/image-input.json)へ固定し、repository staging bytesのordered aggregate `sha256:81d6cfee361eee3f211f1a296626b335979281eff617319fab39a1a989146a03`を採用した。Exact-key/fixed-value validator、repository-byte再計算test、host backendとbuild/profile/controlの分離gateは[M4 exact-input proposal](m4-execution-profiles-exact-input.md)に記録した。これは実装済みproposalであり、fresh independent read-only review前のadoption、Docker access、build、`profile.json`、runtime enforcement、Observedを承認しない。

Exact-input review update (2026-07-18): doctor-to-input traceとrepository staging bytesはacceptされた。Fixed host-backend/runtime contractをblockしたB-11/B-12のremediationは実装済みで、closureはfresh independent read-only re-review待ちである。

Runtime-template compatibility correction (2026-07-18): 上記statusの「最初のstepで`COMMAND_FAILURE`」という観測は、Docker runtime停止ではなく、固定formatがDocker 29.6.1で提供されないGo-template `dict` helperを使用した実装不具合だった。固定CLIをcredential-empty環境で診断したところ、client/serverはいずれも`29.6.1`で到達可能だった。Doctor formatを`json` helperだけで同じcanonical key orderを直接構成する形へ修正し、`dict`再導入を拒否するunit/static regressionを追加した。修正後の一回限定doctorは`runtime-version`を完了し、2番目の`base-image-identity`で`COMMAND_FAILURE`となった。Exact tag `node:20.18.2-bookworm-slim`はローカルinspectに成功せず、external network、pull、credentialを使わずに供給できるrepository-owned image archiveも存在しないため、candidate inventoryとObservedは引き続き未取得である。[Fresh compatibility re-review](reviews/m4-execution-profiles-runtime-template-compatibility.md)は現在の修正bytesをstatic/unit gateで承認したが、doctorを再実行せず、exact input/runtime/Observedを承認していない。このcorrectionは上記の古い外部runtime readiness説明を置き換える。

この文書は、最初の M4 profile enforcement control を定義する。安全方針は [threat-model.md](threat-model.md)、container/data-flow 境界は [architecture.md](architecture.md)、dependency route の Expected/Observed catalog は [experiment-matrix.md](experiment-matrix.md)を正とする。M4 control は dependency route scenario ではないため、その Expected 表はこの文書が管理し、experiment matrix は変更しない。profile control と adapter route evidence を恒久的に分離する判断は [ADR-0001](decisions/0001-separate-profile-controls-from-route-evidence.md)で承認済みである。

この文書内の outcome は、いずれも Observed evidence ではない。実装は[保存済み実装 prompt](../prompts/m4-execution-profiles.md)に従う別タスクである。固定 orchestrator とローカルで利用可能な pinned input の実装および静的検証が完了し、実行が明示的に承認されるまで control を実行してはならない。

## 目的

レビュー済み capability exposure だけが異なる 2 つの固定 execution profile を定義し、その差を host 側の container inspection と container 内の無害な control の両方で証明する。M4 gate が成功して確立するのは profile 境界であり、npm、ESLint、Vitest、Vite、codegen の dependency route を測定するものではない。

## 固定 control pair

| 項目 | Permissive | Constrained |
|---|---|---|
| Control ID | `m4-profile-control-p` | `m4-profile-control-c` |
| Profile ID | `permissive` | `constrained` |
| Control manifest | `lab-profile-control-manifest/v1` | 同じ schema |
| Control evidence | `lab-profile-control-evidence/v1` | 同じ schema |
| Container input | 同じ immutable image digest | 同じ immutable image digest |
| Runtime | 承認済み host orchestrator 経由の固定 Docker CLI | 同じ |
| Network namespace | external network 利用不可 | external network 利用不可 |
| Root filesystem | read-only | read-only |
| Process identity | 固定 non-root UID/GID | 同じ |
| Privilege boundary | 全 capability を drop、no-new-privileges | 同じ |
| Result channel | 厳密に 1 つの disposable result mount または volume | 同じ policy の run 固有 destination |

各 run には、新規かつ検証済みの run ID、result destination、scratch state、canary instance を割り当てる。2 つの run は writable state を共有しない。runtime、image、fixture、control code、上限、Expected control order は同一に保つ。

## version 管理する profile 定義

`lab-execution-profile/v1` は exact-key の構造検証を使い、sanitization 済みの論理値だけを含める。

- schema version、profile ID、profile revision
- immutable container input ID/digest と固定 Node.js version
- non-root/read-only-root/capability-drop/no-new-privileges/resource-limit policy
- external-network policy と loopback-control-service exposure
- environment-canary、file-canary、scratch-write、source-write、child-process、result-channel policy
- deny する各 capability の enforcement mechanism: `container`、`filesystem`、`node-runtime`、`target-absent`、`manifest-skip`
- 論理 evidence location と上限付き timeout/output limit

host absolute path、raw canary value、任意の command/argument、external address、credential reference、runtime-socket path は含めてはならない。profile と control manifest の不一致は preflight error とし、harness が暗黙に厳しい方の値を適用してはならない。

constrained child policy は、child-process permission を付与しない固定 Node.js `v20.18.2` permission model を使う想定である。正確な Node flag と filesystem allowlist は、独立レビュー対象の実装 input とする。その仕組みで control を起動しつつ固定 child attempt を deny できない場合、Expected result は mismatch のままとし、child-denial claim は承認しない。`manifest-skip` への変更には、新しい Expected 契約レビューが必要である。

## Expected control outcome

すべての operation は固定し、上限を設ける。確認できる environment key は、指定された `PROBE_CANARY_` key だけである。file target は image 内の repository-owned synthetic bytes または disposable control state に限定する。child operation が実行できるのは、固定の repository-owned child script を指定した `process.execPath` と `shell: false` だけである。

| 順序付き control | Permissive Expected | Constrained Expected | enforcement の解釈 |
|---|---|---|---|
| Environment canary | `success / ENV_PRESENT` | `failure / ENV_ABSENT` | environment からの omission を観測する。raw value は出力しない |
| Canary file read | `success / FILE_READABLE` | `failure / FILE_NOT_FOUND` | constrained canary target は存在しないか mask される。存在しない場合に permission denial と報告しない |
| Disposable scratch write | `success / WRITE_CREATED` | `failure / WRITE_DENIED` | レビュー済み writable/read-only 境界に対して実際に write を試みる |
| Source mutation control | `failure / WRITE_DENIED` | `failure / WRITE_DENIED` | 両 profile で source を read-only に保つ |
| Fixed loopback protocol | `success / LOOPBACK_PROTOCOL_VERIFIED` | `failure / NETWORK_FAILURE` | constrained が証明するのは固定 service に到達できないことだけで、すべての loopback operation の kernel-level block ではない |
| Fixed child Node.js | `success / CHILD_PROTOCOL_VERIFIED` | `failure / CHILD_PROCESS_DENIED` | constrained では manifest skip ではなく、実際の Node/runtime denial を必須とする |
| Result/evidence write | `success / RESULT_WRITTEN` | `success / RESULT_WRITTEN` | result access は control-plane capability であり、両 profile で writable のままとする |

control は external network host、cloud metadata、host path、credential location、任意の executable/argument、Docker/runtime socket を probe しない。

## Host orchestrator 契約

host orchestrator は trusted control-plane code だが、input を固定し fail-closed にする。

1. 受け付ける operation は `doctor`、`build`、`run-controls`、`verify`、`clean` だけとし、user-provided image、command、mount、environment、path、Docker option は一切受け付けない。
2. host registry credential を読まない disposable Docker CLI configuration を使う。
3. ローカルで利用可能な digest-pinned base と repository-owned staged file から offline build する。registry、package manager、その他の external network access を使わない。runtime 作成には `--pull never` を使い、external network を無効にする。
4. container を起動せずに作成し、完全な runtime policy を inspect する。想定外の mount、environment key、namespace、capability、privilege、user、command、resource limit、socket exposure があれば拒否する。
5. inspection 成功後に限って起動する。runtime、output bytes、file 数、evidence bytes に上限を設け、最初の failure を保持する。
6. outcome を受理する前に canonical evidence、厳密な inventory、run/profile/image identity、completion を検証する。
7. 削除対象は固定 M4 container/image と disposable run state に限定する。user-selected resource は削除しない。

orchestrator は固定 Docker CLI を介して間接的に runtime socket を使用できる。repository code が socket を直接開くことはなく、experiment container に mount/forward することもない。実行環境でこの orchestrator が明示的に承認されていない場合、`doctor`、`build`、`run-controls` を実行してはならない。

## Evidence と妥当性

各 run は、immutable control input、host inspection、canonical control evidence、completion、そこから導出した Expected/Observed comparison を、version control 対象外の M4 run root 配下に保存する。evidence に含められるのは、logical ID、version、image digest、normalized outcome、上限付き count、論理的な enforcement mechanism である。raw canary/file/child/loopback payload、host absolute path、raw environment、stdout/stderr、stack/error text、credential、runtime-socket detail は含めてはならない。

host inspection と container 内 control evidence の両方を必須とする。いずれかが欠落、malformed、oversized、noncanonical、mismatched、incomplete、または承認済み channel 外で転送された場合、run は inconclusive とする。Expected mismatch は可視のまま保持し、profile 定義を書き換えない。access `failure` は有効な observation になりうるが、harness/collector failure は別の run validity として扱う。

profile-control evidence は、M1 producer evidence、adapter evidence、experiment-matrix route Observed evidence、presentation evidence のいずれでもない。昇格には、別途レビューした adapter/profile scenario と、後続 M6 の sanitization/evidence mapping が必要である。

## 実装とレビューの境界

今後の実装で変更できるのは、M4 milestone が列挙した path と、最小限の root script/typecheck wiring だけである。source 変更前に implementation prompt を作成しなければならない。container 実行は、static/unit check と approved-orchestrator preflight の後に行う、独立した明示的 step とする。

static/unit phase では、read-only input、host-owned inspection/completion、container-owned result、独立scratchのdata flow、same-image/two-run pair validator、pre-start inspection projection、typed canonical transfer、semantic evidence validation、bounded fake-backend executorとexplicit inconclusive resultを `containers/profile-control/` に実装済みである。B-07 remediationでは、private copied bytes、exact inventory/digest、base environment keysを1つのnominalかつruntime-branded accepted snapshotへ保持し、profile pair、image build plan、runtime layout、inspection allowlistを同じsnapshot identityへbindした。Executorはそのsnapshotからfixed build contextへbytesを渡し、backendがstaged pathから返したexact inventory、順序、bytes、aggregate digestをbuild前に再検証する。Staged byte replacement、extra/missing/reordered inventory、accepted base-environment snapshot substitution、build-layout substitutionはfail closedにする。Expected mismatchはcomplete observation内で可視のまま保持し、staging、timeout、output limit、transfer、immutable-input、cleanup failureはcompletionを持たないinconclusiveにする。

後続doctor境界は、absolute fixed Docker CLI、`runtime-version`、`base-image-identity`、`base-environment-keys`の3 command ID、fixed Node `v20.18.2` base tag、Docker client/server `29.6.1`候補、Linux/amd64、key-only environment projectionを固定する。Production backendはrepository-owned doctor work rootのdisposable `DOCKER_CONFIG`だけを渡し、host environmentを継承せず、shellを使用せず、timeoutとcombined output limitを適用してstderr contentを捨てる。Malformed、mismatch、timeout、output、command、cleanup failureはaccepted inventoryにならない。Post-bootstrapの一回限定doctorは3 stepを完了し、candidate version、local base identity、base environment keysをaccepted inventoryとして観測したが、runtime enforcement evidenceではない。orchestrator entry は通常時、5 つの固定 operationだけを受け付けたうえでproduction backendを生成せず、Docker access前に `M4_EXECUTION_NOT_APPROVED` を返す。B-07 closureとstatic/unit gateは[input-binding remediation re-review](reviews/m4-execution-profiles-input-binding-remediation.md)で承認済みである。[Doctor boundary review](reviews/m4-execution-profiles-doctor-boundary.md)がblockingにしたB-08〜B-10へのremediationでは、3番目のsanitized projectionへlocal image ID/repository digest/OS/architectureを再掲してstep 2とcross-validateし、environment entryごとのdelimiter前keyだけをescaped JSON arrayとして出力することでB-08/B-10をclosureした。B-09 remediationはvalidated plain snapshotをcanonical JSONとsingle final LFへencodeし、original responseのlengthと全byteを比較する。Runtime version、image identity、environment snapshotのleading BOM negative testを含むfresh独立read-only re-reviewがB-09をclosureし、fixed doctor static/unit gateを承認した。Version管理されたaccepted exact-input proposalは存在するがindependent review待ちである。`profile.json`、runtime executorのbuild/control有効化、すべてのruntime evidenceはbuilt-image digestを含む後続の別reviewと明示的な実行承認待ちである。

独立レビューでは、固定 Docker argument 構築の全体、image staging/inventory、profile schema、container inspection validator、control fixture、transfer validator、negative test、raw evidence を確認しなければならない。unit suite の成功だけでは runtime enforcement を承認できない。

## 現在の制約

- Final profile-control container image digest はまだbuildも観測もしていない。Docker client/server `29.6.1`、exact local base tagのidentity、base environment key inventoryはpost-bootstrap fixed doctorでaccepted candidateとして観測され、version管理されたexact-input proposalへbind済みだが、fresh independent review前なので未採用である。
- 上記exact-input pending記述はfresh reviewで更新され、base/staging/fixed-backend contractはstatic/unit境界でacceptされた。B-11/B-12はclosureしたが、exact-inputのproduction採用、production backend、build execution gateは引き続き未承認・未実行である。
- Doctor remediationの独立re-reviewはB-08/B-10をclosureし、canonical-byte remediationのfresh独立read-only re-reviewはB-09をclosureした。後続診断でDocker 29.6.1非対応の`dict` template helperが最初のstepを壊していたことを特定し、fixed `json`-only formatと再発防止checkへremediateした。Fresh compatibility re-reviewは現在のdoctor bytesをstatic/unit gateで承認した。One-time registry bootstrap後の一回限定doctorは全3 stepを完了してaccepted candidate inventoryを得た。Candidateはexact-input proposalへbind済みで、次はそのfresh independent read-only reviewである。
- version管理されたimage-input proposal、B-11/B-12 backend remediation、production offline-build backendのB-13〜B-15 remediationはstatic/unit review済みで、production offline-build backend static/unit gateは承認済みである。Production adoption、activation、一回限定build execution gateは未承認・未実行である。Permissive/constrained `profile.json`はoffline buildでbuilt-image digestを観測するまで意図的に存在しない。Syntheticな非0 SHA-256値はtest dataにすぎず、build resultではexact known placeholderを拒否する。
- Base/staging/fixed-backend contractはreview済みだがproduction採用、production backend、buildは未承認・未実行である。Permissive/constrained `profile.json`が存在しない境界は変わらない。
- 固定 command plan は実装済みだが、別工程のレビューと実行承認より前に orchestrator が Docker を呼び出すことは意図的にできない。
- Node permission-model による child denial は Expected implementation mechanism であり、Observed fact ではない。
- fixed loopback-service が存在しないことで証明できるのは、指定 target に到達できないことだけである。
- container は kernel/runtime vulnerability や container escape への耐性を証明しない。
- profile-control Expected catalog は dependency-route experiment matrix と分離している。今後の adapter/profile task では、実行前に独自の Expected-only matrix review が必要である。
- adapter/profile route measurement、matrix Observed result、presentation claim は未実測のままである。
