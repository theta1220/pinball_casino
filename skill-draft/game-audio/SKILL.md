---
name: game-audio
description: ゲームの効果音・BGM・音量バランス・イベント同期・再生ライフサイクルを設計、実装、試聴して調整する。ブラウザー音声の開始制約や連打時の破綻も扱う。
---

# ゲームサウンド

最初に既存素材と再生経路を確認する。音の追加だけでなく「何をプレイヤーへ伝える音か」を決める。既存BGMや音量設定を勝手に置き換えず、素材の利用条件を記録する。

## 音の設計

- 操作受付、接触、危険、成功、失敗、環境を聞き分けられるようにする。小さな接触は短く低優先度、重要な成功は固有の音程・音色・長さを与える。同じ高音ビープを全イベントへ割り当てない。
- 素材・強度・状況ごとにキューを整理する。各キューにトリガー、強度への応答、重複規則、優先度、停止条件を持たせる。必要なイベントだけ実装する。
- 音量とピッチの変化は狭く意図的に使う。音楽的な旋律のピッチを無作為に変えない。衝突用の変種を用意する場合は同じ音の連続を避ける。
- 鋭い瞬間変化によるクリックを防ぐため、開始・終了・ミュート・voice打ち切りを短くランプする。素材末尾の残響を不必要に切らない。

## ミックスと応答

- Master / Music / SFX / UI等を必要に応じて分離し、ミュートと音量を保持する。ゲームの音量制御にOS全体の音量変更を使わない。
- 多数の接触で重要音が埋もれないよう、最大同時再生数・同一音の間隔・優先度を決める。上限超過は古い低優先音からフェードして解放する。
- 単音が良くても合計でクリップする。通常プレイと最大同時発音でピークと聴感を確認する。BGMが得点音を隠す場合、必要な場面だけ穏やかにダッキングする。全衝突で音楽を揺らさない。
- 短い操作音は即応性を優先する。チャージ音は1つの連続音をパラメータ更新し、フレームごとに音源を生成しない。リリース・キャンセル・終了で必ず止める。
- 音だけを唯一の重要情報にしない。ミュートでもプレイできる表示を用意する。

Web実装では [ブラウザー音声](references/browser-audio.md)、キュー作成と調整では [キューと試聴](references/cues-and-listening.md) を読む。試聴していなければ「試聴済み」と報告しない。




## Current project visual policy — supersedes earlier presentation preferences

- Generate a character-free background and independent transparent character sprite-sheet atlases. Never animate people by warping regions of a background with baked-in people. Preserve originals, identities, scene layout and collision alignment; verify no residual/duplicated people after separation.
- Generate each character-state pair's animation frames TOGETHER in its own coherent atlas, not unrelated frame images or mixed-state sheets. Record actual cell rectangles, alpha padding, frame order, scale and measured root anchors. Validate bounds, neighbor bleed and transparent edges. Prefer generous margins; generation may miss requested padding and must be inspected, repaired or explicitly recorded as a gap.
- Primary character animation is approximately 12 FPS frame playback. This cadence never throttles the physics or render loop. Use expressive organic actions in their separate state atlases: breath, anticipation, gesture, blink and follow-through. Prefer sufficient chronological drawings for natural motion. If only four key poses with held exposures at a 12 Hz timeline exist, disclose that this is not 12 unique drawings per second and that smoothness remains a limitation. Small optional local skin motion is secondary only. Large background warps and rubbery skin are obsolete.
- Inorganic objects move mechanically: rigid rotation, sliding, opening, spring compression, recoil and settling. Do not give metal bumpers, casings or balls organic breathing/squash. Keep spectacle through character poses, physical reactions and illustrated motion. Preserve ball/current collision readability through staging and draw order.
- Complement actual motion with dynamic lighting of illustrated surfaces: smooth warm/cool sweeps and material highlights, bounded brightness and event response, no strobes. Procedural albedo lighting is not normal-mapped physical lighting.
- No visible textual state explanations or abstract symbolic state indicators (rings, arrows, checkmarks, pause bars). Accessible semantic labels and diagnostics inside the in-artwork settings modal remain. Explicit functional image GO and image gear are allowed. Illustrated mechanical controls are permitted. Original painted scene decoration is not a newly drawn state indicator.
- Latest explicit allowance: artistic POINTS AND LINES are welcome for magical effects and ball trails. Use flowing tapered arcs, fading sparkles and textured afterimages, not UI markers. Preserve a crisp current ball above effects; cap lifetime/length/count, clear across teleport/drain/relaunch/reset, freeze pause/background and honor reduced motion. Do not interpret the earlier indicator ban as prohibiting these requested artistic effects.
- Inspect temporal browser frames, alpha/atlas playback, loop boundaries and event transitions. Test pause, background, reduced motion, AUTO/manual takeover and repeated games. Log measured CPU work separately from browser frame delivery and GPU/FPS; accelerated fixed-step browser runs are not real-time human play. State exactly what audio was listened to versus only tested programmatically.
- AUTO uses ordinary input/physics, seeded bounded policies and no payout cheats. Preserve local opt-in records, combined/manual-only/auto-only/mixed-auto continuation with automatic/manual replay initiation, denominators and uncertainty. Configured replay can mechanically inflate 60-second same-tab continuation; it is not enjoyment or D1/D7. No human outcome without human data.

- **One state = one generated atlas image, per character.** Never pack idle/cheer/surprise/blink actions together or simply rename a mixed sheet. Regenerate rejected sheets. Each atlas contains chronological frames of ONE action, with an explicit state/loop/frameStates manifest. Any future event state needs its own image and explicit transition/return; reject mixed state metadata. Inventory: three separate idle atlases and one bartender toast atlas. Other character event states remain unimplemented.
- **Masks are required for board/character compositing.** Combine the character alpha silhouette with an explicit board foreground occlusion mask; use soft edge feathering appropriate to source resolution. Preserve rail/hand/body overlap and inspect it across every frame. Masks are compositing data, not forbidden visible geometric indicators. Never hide duplicates with rectangular color patches. Preserve clean background and original references.

- Sprite stepping smoothing: use small temporally coherent local mesh correction derived from adjacent authored pose landmarks at render cadence. Keep stable roots/masks and bound displacement; test both sides of frame boundaries and the loop seam. Never substitute arbitrary wobble or doubled-silhouette crossfades for missing drawings. Inorganic objects interpolate rigid transforms only. Report residual landmark/identity drift that bounded correction cannot remove.


## Cadence and continuity acceptance

- Measure actual requestAnimationFrame timestamp deltas separately from screenshot polling. Record focus, visibility, long tasks and normal versus accelerated execution. Use a no-game local control before attributing low cadence to rendering. Never change browser/OS settings to mask a test limitation.
- At sprite boundaries, share a midpoint between adjacent root-relative landmarks using small bounded correction on both sides. Validate all authored frame pairs including last-to-first, not only a synthetic example. Do not increase the deformation cap to conceal inconsistent source art. Mesh/silhouette continuity still needs visual inspection.


## Event-state acceptance

Use a separate chronological one-action atlas for a meaningful existing game event. Trigger from settled results, never alter physics or payout. Coalesce repeated triggers while a clip runs rather than restarting anticipation indefinitely. Non-looping playback clamps endpoints, returns to idle, freezes on pause/background and resets on new game. Validate authored frames, alpha gutters, root/scale registration and occlusion throughout the gesture. Diagnostic preview is not proof of a naturally triggered gameplay event; label each evidence source. Preserve existing sound lifecycle and do not add a duplicate victory sound without listening.

## Default-on audio and dense-ball gain staging
Fresh/unset sound preference is ON, but unlock AudioContext/media only from a legitimate GO or sound/AUTO button gesture. Persist explicit mute separately and preserve it on reload. Legacy music/SFX levels alone are NOT evidence of mute; preserve ambiguous saved levels, report migration uncertainty. SFX default85% (was65%) and bus multiplier2; BGM30% and master.65 unchanged. Compressor ratio12 at-12dB plus bounded soft ceiling; retain18 active voices and cue cooldowns. Test pause/resume, repeated unlock, mute races, rapid GO and source/bundle consistency. Programmatic peak/curve checks are not listening; disclose audition limits. Never bypass file: tool restrictions to test the offline artifact.


## Current instruction precedence and continuous spectacle
Maintain continuous idle sprite motion for illustrated characters/objects during active play, plus clear event reactions. User wants boldly expressive, lavish motion, not microscopic idle as the primary style. Use large authored poses/anticipation/overshoot for organic characters; only small skin corrections smooth sprite steps. Inorganic motion remains rigid/mechanical. Pause/background/reduced-motion lifecycle and ball readability remain guardrails. Current English-only functional UI, generated image gear/GO and9-slice modal are explicit exceptions to the ban on symbolic state markers; no explanatory in-play prose. See ../../PROJECT_REQUIREMENTS_AUDIT.md for requirement coverage and implementation evidence limits.

## Roulette settlement result feedback (explicit text exception)
User explicitly requests large centered WIN+NN / LOSE... after actual roulette settlement, narrowly overriding the no explanatory gameplay text rule. NN is gross awarded ammunition before rain/overflow, formatted with the shared compact number formatter. Render gold atlas text in the existing WebGL context inside painted artwork; no DOM overlay or per-frame texture uploads. Use a brief nonblocking pop/fade (currently2.4s); one active result, newest settlement replaces it. Trigger distinct win/lose cues exactly once per settlement, respect mute/volume/pause, freeze presentation hidden/paused and clear on restart. ZeroBET without a real settlement is not a loss. Test actual red/black/green settlement, bonus and immutable stake, gross reward versus stock/score, duplicates, replacement, lifecycle and large-number fit. Programmatic sound checks are not audition.
