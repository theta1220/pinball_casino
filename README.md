# ROYAL FLUSH — GO Casino Pinball

## サーバー不要の起動

**PLAY_OFFLINE.html をブラウザーで開いてください。** Windows上の場所は C:\Users\nkcta\pinball_casino\PLAY_OFFLINE.html。画像・人物アトラス・音声・CSS・JavaScriptを内包する約52.1MBのHTMLで、実行時のNode/ビルド/サーバー/ネット接続は不要な構成です。

ブラウザー操作ツールはfile:を禁止しており、直接ファイルを開く実機確認は未完了です。同じ配布HTMLのHTTP上での描画/GO動作と、外部依存なしの静的検査を実施しています。安全設定を変える必要はありません。iOSではこのWindowsパスを直接開けません。ファイルを端末へ転送し、JavaScript/WebGLを実行できる環境での確認が別途必要です。Filesのプレビューで動くとは保証していません。

## 操作

画面下の赤い **GO** でランダム出力の1球を予約。初期残弾は暫定3球。払い出しは同じ残弾へ加算され、勝手には発射されません。GO受付時に1球を予約し、発射口が空くまで保持します。フリッパーは自動です。右上の歯車設定またはP/Escapeで一時停止。GOは在庫切れや停止中に暗くなり、再開後も正当な発射予約を保持します。ゲーム終了後のGOで再開。

黒/赤BET、SPIN倍率、緑は両色を含む追加球配当、清算後BET両色0・倍率1。BETゼロではルーレット中央ピン以外の衝突/入場は無効。同時12球の上限ではGO予約を削除せず待機します。獲得残弾にこの上限はありません。現行詳細は GAME_DESIGN.md / BET_REDESIGN_PROTOCOL.md。

## ファイルと開発

- PLAY_OFFLINE.html: 生成済み配布物。これ1つで依存ファイルを内包。
- index.html、game.js、physics.js、rules.js、各補助JS、style.css: 編集用ソース。
- assets/ と bgm/: 原素材。人物は独立した単一状態12FPSアトラスと明示マスク合成。元画像保持。
- build-offline.cjs: ソース変更後に npm run build:offline で配布物を再生成（開発時のみ）。
- npm test / npm run check: 回帰検証。
- npm start: 従来の任意HTTP起動。http://127.0.0.1:5173/ の既存サーバーは停止していません。

音は初期ON（明示したミュートは保存）。ブラウザー制約により最初のGOまたは音ボタン操作で開始します。SE初期85%、SEバス2倍、BGM初期30%。以前の保存済み音量は保持します。実機試聴とプログラム上の開始成功は区別しています。

計測は任意・ローカルのみ。通常自動フリッパーは手動GOセッションを自動扱いしません。診断AUTOのGOだけを自動/混在へ分類。file:の保存領域はHTTP版と別または利用不可になり得ます。記録の移行は行っておらず、既存HTTP記録を削除しません。保存不可でもゲームは動く設計です。D1/D7はローカルプロファイルの経過時間であり、人の人数や楽しさではありません。

GOは assets/go-button-v1.png の生成画像で、盤面を覆わない絵柄のある盤面画像内の最下部に配置。押下は画像の剛体移動、使用不可は減光で示します。現在の実験版は go-ammo-v3。以前の自動払い出し発射の記録は変更しません。

右上の歯車でゲーム内設定ダイアログを開きます。開いている間はゲームを停止し、閉じると直前の再生/停止状態へ戻ります。外部パネルは撤去。音声・停止・リセットは設定内、AUTO/計測/描画診断は「詳細・検証」内です。リセットと計測記録の消去には確認操作が必要です。設定を開くと診断AUTOは解除され、再開は明示操作のみです。

UIの許可範囲は絵柄のある盤面画像そのものです。GO・HUD・歯車・設定ダイアログを画像内に重ね、無地の上下操作バーや外部UIは設けません。画像の実表示矩形に合わせ、縦横比を維持して配置します。

## Rich English UI and project instructions
PLAY_OFFLINE.html includes generated image GO/gear,9-slice panel/backing plates and three bold rich ASCII text atlases. Rebuild with npm run build:offline after changes; npm run test:offline checks embedded consistency. CSS textures decode locally to blob URLs; no server/network dependency. Direct-file execution is not yet browser-tool verified. Source glyph regeneration: npm run build:text using locally installed Windows fonts; font binaries are not redistributed.
Project AGENTS.md automatically routes reusable new user requirements to .agents/skills/instruction-skill-maintenance/SKILL.md. Canonical topic skills remain in skill-draft; no global chat monitoring. See PROJECT_REQUIREMENTS_AUDIT.md and ITERATION18_UI_ATLAS_CHECKPOINT.md for coverage and evidence limits.

Launch stake: click the in-board xN plate to cycle affordable1/5/10/50/100/500 tiers. GO spendsN stock for ONE ball. Each ball keeps its stake; roulette pays shared winningBET x SPIN bonus x captured-ball stake. Automatic flippers do not classify ordinary play as bots; diagnostic AUTO explicitly launchesx1.

Current launch economy: initial ammunition10; choose affordable BETx1/x5/x10/x50/x100/x500, one GO spends that stake for one immutable-stake ball. Bumper contributions stay1. Captured-ball stake multiplies winning sharedBET times BONUS; green includes both; rewards add stock only. Compact HUD uses one decimal,K/M/G/T/P, while exact totals remain in advanced rendering diagnostics. Maximum supported arithmetic is JavaScript safe integers, not unlimited precision.
UI skins now have independent opaque goldframe and translucent felt images; mainHUD gold, BONUS and BET explicitly labeled. The rejected generated side background is disabled; seamless extension remains unresolved.

Background status correction: the generated side extension was rejected for a visible join and is disabled/omitted from PLAY_OFFLINE.html. Original clean surrounding framing is active; seamless extension remains unfinished.

## Publication
The existing remote is https://github.com/theta1220/pinball_casino. Git LFS stores binary artwork/audio. Install Git LFS and run `git lfs pull` after cloning. Main pushes run tests and build a restricted static `_site` artifact before GitHub Pages deployment. Configure repository Pages source as GitHub Actions after authentication. `node build-site.cjs` requires an empty `_site`; it rejects LFS pointers. `build-info.json` identifies the deployed commit. Local `PLAY_OFFLINE.html` remains available via `npm run build:offline`, and is deliberately not duplicated in the website or Git. Private study/evidence files and unfinished background candidates are excluded. Publishing does not migrate local browser records.
