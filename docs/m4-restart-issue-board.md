# M4 再開 Issue ボード（ローカル起票）

**前提:** `docs/milestones.md` のM4 section が示す通り、`#39` の handoff 以降は
`#40`（`run:controls` runtime enforcement gate）→`#41`（profile-control Observed 境界整合）の順で前進する。  
本書は GitHub Issue 同様の起票状態をローカルで明示し、再開時の最小行動を固定する。

| Issue | 件名 | 現在の状態 | 受けるべき完了条件 | 次アクション |
|---|---|---|---|---|
| #37 | M4凍結トラック（run:controls/runtime enforcement/profile-control）をcompletionまで進める | 完了（`#40` Inconclusive固定、`#41`境界整合済み） | `#40` の承認と実行、`#41` の証拠境界整合が完了し、実行境界と観測境界を明文化すること | なし |
| #39 | M4: offline-build recovery trail更新と control-binding/runtime handoff | 完了（recovery trailと`#40` handoffを保持） | 回収済みの trail を保持し、次工程（`#40`）への handoff が壊れていないことを確認 | なし |
| #40 | M4: profile-control `run:controls` runtime enforcement gate を一回限定で定義 | one-shot実行完了（Inconclusive / `COMMAND_FAILURE`、再実行不可） | `run:controls` の one-shot/non-retry、`profile.json` 固定、`builtImageDigest` 境界、実行経路固定（Docker経路）を定義し、独立reviewで承認 | なし |
| #41 | M4: profile-control 観測境界の最終整合（Observed化条件を明記） | 完了（Inconclusive非Observed、route非昇格を固定） | `run:controls` 実行結果が `Observed` 化可能/不可の条件（expected mismatch、inconclusive、failure扱い）を実証路と照合したうえで明文化 | なし |

## 進行順（完了）

1. #40（run:controls runtime enforcement gate）の実装境界確定・承認: 完了
2. #40 one-shot 実行と結果固定: 完了（Inconclusive、再実行不可）
3. #41 profile-control Observed受理条件の最終整合: 完了
4. #37 の完了状態への遷移: 完了

## 完了後も維持する境界

- `run:controls` の再実行、run-id変更、tag再利用、profile binding の勝手変更を行わない
- `profile-control Observed` を `experiment-matrix` へ自動昇格しない
- `docker/socket` への直接アクセスや credential を伴う経路を証拠証明と混在させない

## #40 fresh review handoff（2026-07-20）

[`run-controls` execution-gate fresh independent review](reviews/m4-execution-profiles-run-controls-gate.md)
はcandidateをB-18/B-19/B-20でblockした。Recovered digestは記録上再現したが、canonical
`profile.json`、exact pair run ID、production `FixedExecutionBackend`、temporary activation
bytesがなく、現executorはrecovered imageを使う代わりに新しいbuildを行う。Project humanは
2026-07-20の継続指示でpermissive=`m4-profile-control-p-20260720-01`、constrained=
`m4-profile-control-c-20260720-01`を確定した。次はこの2値を変更せずB-18/B-19/B-20を
Docker非実行でremediateした。Canonical profile bytes、existing-image/no-rebuild executor、
production control backend、exact activation/restoration candidateは
[`run-controls remediation contract`](../prompts/m4-execution-profiles-run-controls-remediation.md)
に固定済みである。次は[fresh remediation review](../prompts/reviews/m4-execution-profiles-run-controls-remediation-review.md)。
Fresh re-review前にtemporary activation、Docker、`run:controls`へ進まない。

## #40 remediation re-review handoff（2026-07-20）

[Fresh remediation re-review](reviews/m4-execution-profiles-run-controls-remediation.md)は
B-18/B-19/B-20をstatic/unit境界でclosureし、canonical profile/digest/exact run pair、
existing-image/no-rebuild executor、production backend、activation/restoration hashesを
one-time execution gateとして承認した。Reviewはtemporary activation、Docker、
`run:controls`、retained build state access、Observed更新を行っていない。次は
[`updated execution gate`](../prompts/m4-execution-profiles-run-controls-gate.md)に従う
exact `npm run --silent m4:run:controls` 1回だけであり、standing authorizationの使用は
別のhuman reviewを意味しない。結果後も#41のevidence-class整合より前にprofile-controlや
experiment-matrix routeをObservedへ昇格しない。

## #40 one-shot execution handoff（2026-07-20）

Fresh workerはreview済み67-file aggregate、critical source/profile/activation/restoration
hash、両exact run-root absenceを再現し、`continue-repository-work` standing authorizationを
使用して`npm run --silent m4:run:controls`をちょうど1回実行した。これは別のhuman reviewを
意味しない。Commandはexit 1で、pair/permissive/constrainedはいずれも
`validity=inconclusive`、`primaryFailure=COMMAND_FAILURE`、`completedSteps=[]`、
`comparison=null`、`completion=null`である。Retry、追加Docker command、retained build
state accessは行っていない。

両exact run rootは作成済みで、各rootにcanonical `input/control-manifest.json`と空の
`host` / `container-result` / `scratch` directoryだけが残る。Control evidence、completion、
comparisonは生成されていない。Temporary entry sourceとcompiled outputはreview済みordinary
hashへ復元済みである。このone-shotはruntime enforcement、profile-control Observed、
experiment-matrix route Observedを確立しない。次は#41のdocumentation/evidence-class整合であり、
このpairを再実行または別run IDへ置換しない。

## #41 evidence-class closure（2026-07-20）

Profile-control Observedの必要条件は、固定permissive/constrained両runがともに
`complete`で、同じreview済みimage/control pairに対するimmutable input、full host
inspection、canonical container control evidence、completion、Expected/Observed comparisonが
全て揃うことである。実際に試行されたcapabilityの`failure`はcomplete evidence chain内では
有効な観測になり得る。Expected mismatchもcomplete run内のObserved mismatchとして保持するが、
Expectedどおりのenforcement成立とは扱わない。

`inconclusive`、harness/command/inspection/transfer/evidence/cleanup failure、manifest skip、
未試行、host inspectionだけ、static/unitだけではprofile-control Observedにならない。さらにcomplete
profile-control evidenceであってもcontrol fixture専用であり、別review済みadapter/profile scenarioと
complete route runなしにadapter evidence、experiment-matrix route Observed、presentation evidenceへ
昇格しない。

固定one-shotは全resultが`inconclusive / COMMAND_FAILURE`、`completedSteps=[]`で、host inspection、
control evidence、completion、comparisonがないため、runtime enforcementもprofile-control Observedも
確立しない。`experiment-matrix.md`は変更していない。Prior executionで使用したstanding authorizationは
exact fixed command 1回だけへのauthorizationで、別human reviewを意味しない。Retry、新run ID、
replacement gateは作らず、#41と親#37をこの明示的Inconclusive limitationで完了とする。

Next: none.
