---
name: game-vfx
description: ゲームの衝突・得点・チャージ・成功演出を粒子、光、残像、接地影、カメラ効果で実装し、視認性と描画負荷を調整する。
---

# ゲームの視覚効果

エフェクトは状態を伝えるために設計する。原画の質感、視点、照明、背景密度を確認し、派手さだけを増やさない。画像ベースの作品を不自然な図形や全画面白フラッシュで覆わない。

## イベントから見た目へ

- 演出の追加を依頼されたら、光・素材粒子・対象の動き・SE・必要ならカメラ反動を1つのリアクションとして設計する。たとえば「コインが出る」指定には実際のコイン素材を使い、汎用の点や星で代用しない。強弱と収束を決め、連打時の過剰反応を制限する。

- 接触位置・法線・強度・材質から方向と量を決める。得点対象の中心から一律に粒子を出すより、実際の接触点を優先する。
- 弱い接触、通常ヒット、特別成功を階層化する。まず「一瞬の反応」「短い減衰」「残る情報」を選び、すべての効果を全イベントに付けない。
- 粒子・揺れ・光の乱数を物理の乱数から分離する。描画を無効にしてもゲーム結果が変わらないようにする。
- ワールド座標・画面座標・UI座標を明示し、リサイズやDPRで放出位置・文字・カメラがずれないようにする。
- 球、敵、照準など必要な対象を隠さない。Bloomや加算描画で色が白く飽和する場合は面積と露出を減らす。高速物体の残像を別の実体に見せない。
- 光源と影の方向を揃える。接地影は接地点、アルファ輪郭、物体の高さに応じて調整し、素材に焼き込まれた影との二重化を避ける。

## 負荷と快適さ

- 粒子数、同時エミッター、寿命、最大画面占有率を予算化する。画面外や低優先の効果から削減し、重要情報を残す。予算は対象端末で測って決める。
- 透明な大判スプライトの重なりは粒子数が少なくても重い。オーバードロー、draw call、テクスチャ切替、割り当てとGCを測る。必要なときだけプールやバッチ化を導入する。
- カメラ揺れはゲーム座標を動かさず表示に適用し、強度と時間を制限する。入力座標変換とUIの扱いを確認する。
- 強い点滅・揺れ・大量の残像を減らす設定を尊重し、必要な情報は別の表現で残す。

具体的な組み合わせと検証は [効果のレシピ](references/recipes.md) を読む。




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

## Illustrated goal invitation
When ambient lighting masks a static target-brightness difference, stage a slow material highlight and bounded rigid motion of the actual illustrated object; never add symbolic target markers or explanatory state prose. Use current BET/multiplier/roulette availability: upper bumper BETs accumulate repeatedly, SPIN sets a multiplier, roulette awards balls. Do not restore the obsolete three-target collection gate. Preserve collision readability, pause/reduced-motion lifecycle and exact paired gameplay outcomes. Treat clearer intention as a hypothesis until player observation, and check whether sequential emphasis falsely implies a required order. Record user-reported smoothness as user-observed, not an FPS measurement; do not block unrelated work on automation-only cadence.


## Actionability and cue-budget audit
Gate target invitations by actionable play and competing slot resolution, not obsolete collection flags. Audit intro, ready, launch, captured roulette, drain, settling, over, pause/hidden, rapid hits and replay. Preserve active-play spectacle; suppress stale invitations rather than globally dimming animation. Report simulated eligibility duty separately from perceived brightness/browser-frame duty. Measure simultaneous particle totals directly; never sum independent peaks and call that concurrency. Prefer existing illustrated-object transforms/material light with zero extra draws; verify exact gameplay invariance and disclose unchanged visual/physics silhouette differences.


## Multiball casino loop (current user rules)
Upper left/right bumpers add black/red BET; default 1 ball-unit per accepted hit. SPIN replaces the bonus multiplier (1/2/3/5x), never directly pays. Roulette awards integer additional balls for black/red; green includes both; settlement atomically resets BOTH BET to zero and multiplier to1. Winnings add exactly to the common ammunition stock, then the payout-rain exception below applies. Start with3 stock balls and cap spendable STOCK at3. Each accepted GO consumes/reserves one ball; GO is accepted only when it can immediately fire; otherwise disable and reject without debit, score or deferred shot. Accepted GO launches immediately at seeded safe strengths; separately reserved roulette rain enters from above. A drain removes only that ball; end only when stock, GO reservations, rain reservations and live/captured balls are all empty. New game cancels old reservations. Diagnostic AUTO may simulate GO only when explicitly enabled; default OFF. Test zero-stock recovery and rejected GO plus a win, with no launch outside GO or the payout-triggered rain exception.
Use stable per-ball IDs, physics/phase/trail/recovery state. Shared substeps advance flippers/world once; balls pass through each other without pair impulses/separation (latest thermal override); only one roulette owner settles, other balls remain in play. Check high speeds, dense contacts, walls/flippers, pause/hidden, manual takeover and queue conservation. Bound cosmetic draws globally, not gameplay awards. Report simulated stress separately from browser playback and human retention. Keep all existing atlas/mask/12FPS/skin/lighting rules.

## GO-only ordinary play and offline delivery
The red physical GO button is explicitly requested and allowed. It is the sole ordinary gameplay action: random safe launch strength, three provisional stock balls, atomic single click consumption, rejected presses with no payment or queue when blocked. Flippers respond automatically to all nearby balls in ordinary play; they do NOT make a session a bot. Only diagnostic autonomous GO marks automation/mixed; use go-ammo-v3 experiment version and do not compare old input-risk totals as player agency. Keep pause/settings accessible, remove obsolete long-press/arrow controls from the player UI. Test mouse/native keyboard activation, rapid clicks, empty stock, queue concurrency, auto flippers, pause, replay and portrait layout. Disclose actual touch/iOS testing separately.
For server-free delivery, generate PLAY_OFFLINE.html with inline classic scripts, data-URI images/atlases/audio and no remote fonts. Preserve editable source/build script; runtime must not require Node, HTTP, fetch or unsafe browser flags. Audit dependencies and test the final file:// entry when permitted. HTTP tests of the bundle are useful but never substitute for direct-file evidence. A denied file protocol test must be reported, not circumvented. Local file storage differs from HTTP; never claim migrated records or distinct human cohorts. Keep existing HTTP server running unless asked to stop it.


## Image GO at the bottom of play
Use a real generated raster red/brass GO asset, not CSS geometry presented as artwork. Put it at the bottom INSIDE the illustrated artwork rectangle itself, not below the board or in a blank control strip. Keep HUD and gear inside the same painted bounds; no external controls. Preserve semantic button keyboard/click activation exactly once, >=44px touch target, disabled material dimming and rigid pressed travel; this is not frame animation. Respect portrait/short viewport and safe-area inset. Embed the asset in PLAY_OFFLINE.html; inspect pixels and final browser layout. One-state-per-atlas remains required if animated frames are authored.


## All UI within the game screen
The actual illustrated image/content rectangle is the UI boundary, NOT its wrapper or letterbox. Overlay HUD, bottom image GO and top-right gear (explicitly permitted icon) inside that rectangle. Never extend it with a blank control strip. Remove external panels from HTML. Gear opens an internally scrolling modal with functional labels; put sound/pause/restart there and AUTO/study/render diagnostics under advanced disclosure. Opening freezes physics and animations, releases input and stops diagnostic AUTO; closing restores prior play/pause without launching or resetting. Inert background, GO guard, keyboard focus trap/return and Escape/cancel required. Restart and local record deletion require explicit in-dialog confirmation; cancel preserves state. Starting diagnostic AUTO is an explicit close-and-run action. Test narrow/short views, no page overflow, mute persistence, exact ammunition preservation and final offline bundle.

Acceptance: compare every visible control/HUD/modal rectangle to the displayed artwork/canvas bounds at desktop and390x667 (including aspect-fit letterboxing). Modal must clip and scroll internally within those bounds. Keep flippers and the active drain path readable; place GO in the lower decorative area beyond the drain cutoff, not over the live lane.


## Current instruction precedence and continuous spectacle
Maintain continuous idle sprite motion for illustrated characters/objects during active play, plus clear event reactions. User wants boldly expressive, lavish motion, not microscopic idle as the primary style. Use large authored poses/anticipation/overshoot for organic characters; only small skin corrections smooth sprite steps. Inorganic motion remains rigid/mechanical. Pause/background/reduced-motion lifecycle and ball readability remain guardrails. Current English-only functional UI, generated image gear/GO and9-slice modal are explicit exceptions to the ban on symbolic state markers; no explanatory in-play prose. See ../../PROJECT_REQUIREMENTS_AUDIT.md for requirement coverage and implementation evidence limits.

## Functional nine-slice readability plates
Back the image gear and visible text/HUD groups with actual textured nine-slice image bases. Reuse compatible generated panel art, preserve corners and scale edges/center. Size plates from text metrics plus padding; keep bold large atlas lettering and English semantics. Avoid nested frames and blocking lanes or characters; all plates remain inside painted artwork. These explicitly requested functional bases are allowed, not symbolic gameplay state markers.


## Payout-triggered stock-consuming rain (latest override)
Winnings first credit common ammunition. A positive roulette payout fills STOCK to3 and reserves only the excess above3 for paced top-entry rain. Reservations immediately reduce spendable stock, x1 rain balls cost1 each, and GO cannot double-spend them. Initial3/newgame, ordinary GO and generic non-roulette credits do not trigger rain. The current defaults are0.2second spacing and3live cap; reserve only free board slots (including existing reservations), convert excess once to100score per x1 ball. Pause/hidden/settings freeze the queue; restart cancels it. No ball-ball collisions. Preserve stake-weighted roulette rewards and reset bothBET0/bonus1. Manual GO remains available for unreserved stock; rain source is roulette-rain, not diagnostic AUTO or a user input.
Entry balls descend visibly from above in a bounded entry phase, crossing the top boundary before normal board physics takes over. Do not use the launcher, increase stake or double-apply a multiplier. Report credited stock separately from reserved/spawned rain so reservation deductions cannot look like missing rewards. Test3/4/large awards, repeated payout, GO competition, cap/pacing, freeze/reset, immutable x1 and all settlement colors.

## Roulette settlement result feedback (explicit text exception)
User explicitly requests large centered WIN+NN / LOSE... after actual roulette settlement, narrowly overriding the no explanatory gameplay text rule. NN is gross awarded ammunition before rain/overflow, formatted with the shared compact number formatter. Render gold atlas text in the existing WebGL context inside painted artwork; no DOM overlay or per-frame texture uploads. Use a brief nonblocking pop/fade (currently2.4s); one active result, newest settlement replaces it. Trigger distinct win/lose cues exactly once per settlement, respect mute/volume/pause, freeze presentation hidden/paused and clear on restart. ZeroBET without a real settlement is not a loss. Test actual red/black/green settlement, bonus and immutable stake, gross reward versus stock/score, duplicates, replacement, lifecycle and large-number fit. Programmatic sound checks are not audition.

## Terminal game-over and explicit retry
User explicitly permits centered GAMEOVER... and RETRY text, in addition to settlement WIN/LOSE. Render through the shared WebGL gold atlas and existing image nine-slice frame/translucent base; semantic DOM remains invisible. Only terminal stock0 with no live/captured balls, authorized launch/rain commitments or pending spin can enter game-over. Prioritize terminal presentation over old settlement text. RETRY is one explicit guarded action: clear transient results/rain/inputs/audio, restart with STOCK3 and defaultx1, preserve BEST/settings, and never auto-fire. Ignore repeated/held activation and modal/hidden retries; focus a safe control afterward, not GO. Test natural final drain and pending positive payout separately, keyboard/touch, repeated activation, restart and portrait bounds. Current fade is250ms with no texture uploads and reduced-motion bypass.
