---
name: game-development
description: ゲームの新規制作や複数機能にまたがる改修を、ゲームループ・入力・物理・素材・UI・演出・検証まで統合する。単独の音や演出修正には対応する専門スキルを優先する。
---

# ゲーム開発の統合

既存プロジェクトの動作を確認し、指定された技術、操作、速度、アート方針を引き継ぐ。WebGLや特定エンジンを全案件へ強制しない。最初に遊びの核（入力→判断→結果→再挑戦）を一巡できる状態を作り、その後に表現を磨く。

## 作業の分け方

- 音・BGM・ミックスは `game-audio`、視覚効果は `game-vfx`、動き・遷移は `game-animation`、動作検証・性能は `game-playtest` を必要な範囲で読む。全部を毎回ロードしない。
- 参考画像からピンボールを作る場合は `image-pinball-workflow` を併用する。別ジャンルへその座標や物理係数を持ち込まない。
- アセット生成が必要な場合だけ利用可能な画像生成スキルを使う。音声生成ツールの存在は仮定せず、利用可能な手段と権利を確認する。

## 実装の境界

システム全体を設計・見直す場合は、先に [コンセプトと仕様](references/concept-to-spec.md) を読み、面白さの仮説と実装の対応を仕様書へ記録してから変更する。

実装前に [行動とリアクションの設計](references/action-reaction.md) に沿って、主要な操作・接触・結果ごとの反応を定義する。機能が動くことと、プレイヤーに手応えが伝わることを別々に検証する。

- ゲーム状態・得点・衝突を正とし、音・粒子・揺れは結果を購読する側にする。演出を止めても勝敗や衝突結果が変わらない構成にする。
- 入力、シミュレーション、描画、音声の時計を区別する。固定更新と補間を必要に応じて使い、速度倍率を音楽やUIへ無条件に掛けない。復帰時に長い停止時間を一気に消化しない。
- 入力は開始・保持・終了を持たせる。キーリピート、pointercancel、フォーカス喪失、一時停止、画面回転、ゲーム終了で押しっぱなしが残らないようにする。
- 物理には見た目と一致した形状と単位を使う。高速物体には連続衝突または妥当な分割を使い、静止接触で得点や効果が連打されないよう接触開始・インパルスを扱う。
- 共通の配置定義から描画・判定・模様のアンカーを参照する。画像の透明余白と接地点を区別し、素材を拡大・交換したら同時に見直す。
- 素材は原本、採用版、参照メタデータを区別する。画像なら寸法・アルファ・アンカー、音なら長さ・ループ区間・音量、共通で出典・利用条件を記録する。
- リスタート時に古いタイマー、イベント購読、音源、粒子、GPU資源が残らないよう所有者と破棄処理を決める。小さなゲームに大規模な基盤を強制しない。

演出を複数系統で同期するときは [イベントと時計](references/events-and-time.md) を読む。完成報告は実装したこと、実際に試したこと、未確認のことを分ける。


## Retention experiments and boredom-risk evidence

Use the project ENGAGEMENT_STUDY.md protocol. Freeze baseline, experiment and metric versions before comparing. Report repetition, feedback gaps, failed launches, recovery counts and observed goal clarity separately. An unvalidated proxy score is not human boredom or retention. Do not optimize its weights after seeing a result. Keep source groups separate; count interrupted sessions and censored follow-up, denominators, sample sizes and uncertainty. A scripted restart is never voluntary human replay. D1/D7 local-profile return measurement requires consent and mature elapsed-time cohorts; human-retention interpretation additionally requires actual participant data. Never infer either from session length. Keep one counter-hypothesis and regression guardrail per experiment. No forced waiting, blocked exits, obligation loops or reward inflation to improve retention. Use paired fixed-input simulations for mechanics and actual UI testing for presentation; human observation is a separate next experiment. Telemetry stays local, bounded and erasable.


### Coverage and alternate-input experiments

When sessions cannot reach the playfield, a null risk score excludes the most unsuccessful experience. Always report scored/unscored counts and launch returns over all sessions; do not compare conditional means across different sample distributions. Preserve the metric formula. Separate identical-effective-input regression comparisons from capability comparisons that intentionally change the input. For alternate controls, test pause, repeated activation, invalid values and equality with the original route. Browser UI input, a mocked rendering simulation, and human observation are three different evidence types. Never silently call selectable power a validated sustained hold. EXPERIMENT_LAUNCH_CHOICE.md is historical: current ordinary input is GO-only random launch with automatic flippers.




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


## Input-choice experiment coverage

- A fixed launch-lane exit can force the first target while later inputs still alter reachability. Report first-contact bias separately from subsequent target diversity. Compare paired input phases, not only a single bot.
- Derive aiming fixtures from real incoming trajectories and stratify whether they are inside flipper reach. A ball in an outlane is not evidence that a flipper timing is ineffective. Keep full-world replay separate from isolated ball-state fixtures.
- Report scheduled conditions and unique effective inputs separately: clamped negative delay may duplicate zero delay. Censored no-drain trials are not confirmed saves; observed drains are not automatically unfair. Do not change payout or suppress legitimate rebounds to improve a proxy score.


## Deterministic branch replay

Reconstruct the common input prefix in a fresh simulator, capture all mutable simulation state (including world clock, contact cooldowns, flipper motion, roulette and pending payout), and verify a restored branch against uninterrupted continuation. Preserve non-finite sentinels explicitly; ordinary JSON changes Infinity to null. Compare checkpoint hashes across fresh runs and repeated trajectory hashes, not only final scores. State which renderer/audio/telemetry systems are absent. Phase sweeps change a sequence of pulses and cannot alone establish a single-contact aiming window. Report sampled contiguous spans and hypothetical jitter tolerances as engineering proxies, never measured human skill.

## Contact-level causal diagnosis

Before changing sensitive timing controls, compare successful and failing restored trajectories at successive contacts: contact point/normal, incoming/outgoing and moving-surface velocity, flipper angle/angular/tip speed, substep duration, and restitution/boost threshold conditions. Verify instrumentation preserves the original full trajectory hash. A repeated-pulse phase sweep changes later contacts too; near-identical first impacts do not establish a narrow first-contact acceptance window. Distinguish cumulative trace counters from restored simulation time, filtered positive impulses from all contact attempts, and selected boundary cases from population rates. An internal timing threshold is not validated human fairness. If no specific defect emerges, retain mechanics and move to an evidenced unfinished requirement rather than indefinitely repeating sweeps.

For event diagnostics, distinguish natural gameplay triggers from previews and completion from cancellation on replay/reset. Do not infer a frozen animation merely from started minus completed; account for active and cancelled clips. Such diagnostic counters are not retention or enjoyment measures.


## Reaction accounting and manual takeover
Maintain per-source started/completed/cancelled/coalesced diagnostics with started = completed + cancelled + active; pause is not completion, repeated reset is not a second cancellation, and previews are not gameplay or participant evidence. Mark manual input after an AUTO stop as mixed even when the controller is already idle. Preserve origin source, fixed continuation windows, censored denominators, opt-in and historical rows; never relabel manual-input replay as proven voluntary human replay.


## Observation maturity and consent writes
Report a live unresolved follow-up as pending, a closed/reloaded unresolved follow-up as censored, and only resolved replay/expiry outcomes in the denominator. Assert completed = pending + censored + denominator within every mode. Test exact window boundaries and invalid elapsed deltas with isolated synthetic storage. With consent off, ordinary AUTO/manual activity must perform zero study writes; explicit clear remains permitted and must not erase unrelated settings. Keep implemented D1/D7 local-profile return separate from same-tab continuation; disclose missing real observations and never treat device sessions as people.


## Local return-v1 measurement
D1/D7 are now implemented separately from same-tab continuation: [24,48) and [168,192) elapsed hours from first eligible session start. Effective session >=10 active simulation seconds plus a launch, accepted at finish. One local profile epoch is not a human or independent population sample. Mature denominator at window end; pending successes separate; index-mode partition and return mode/initiator separate. Exclude developer, synthetic, preview-tainted and accelerated sessions. Preserve legacy rows and unknown metadata, keep one bounded cohort summary across100-row eviction, clear it only with explicit study deletion, and never write while consent is off. Test with isolated injected clocks/storage; never change system time or seed genuine browser records. Disclose missing consent/device/deletion/clock/multi-tab limits and n<=1 uncertainty.


## Illustrated goal invitation
When ambient lighting masks a static target-brightness difference, stage a slow material highlight and bounded rigid motion of the actual illustrated object; never add symbolic target markers or explanatory state prose. Use current BET/multiplier/roulette availability: upper bumper BETs accumulate repeatedly, SPIN sets a multiplier, roulette awards balls. Do not restore the obsolete three-target collection gate. Preserve collision readability, pause/reduced-motion lifecycle and exact paired gameplay outcomes. Treat clearer intention as a hypothesis until player observation, and check whether sequential emphasis falsely implies a required order. Record user-reported smoothness as user-observed, not an FPS measurement; do not block unrelated work on automation-only cadence.


## Actionability and cue-budget audit
Gate target invitations by actionable play and competing slot resolution, not obsolete collection flags. Audit intro, ready, launch, captured roulette, drain, settling, over, pause/hidden, rapid hits and replay. Preserve active-play spectacle; suppress stale invitations rather than globally dimming animation. Report simulated eligibility duty separately from perceived brightness/browser-frame duty. Measure simultaneous particle totals directly; never sum independent peaks and call that concurrency. Prefer existing illustrated-object transforms/material light with zero extra draws; verify exact gameplay invariance and disclose unchanged visual/physics silhouette differences.


## Multiball casino loop (current user rules)
Upper left/right bumpers add black/red BET; default 1 ball-unit per accepted hit. SPIN replaces the bonus multiplier (1/2/3/5x), never directly pays. Roulette awards integer additional balls for black/red; green includes both; settlement atomically resets BOTH BET to zero and multiplier to1. Winnings add exactly to the common ammunition stock, then the payout-rain exception below applies. Start with10 stock balls. Each accepted GO consumes/reserves its selected stakeN for one ball; launcher-obstructed GO reservations wait while board capacity exists; full-capacity paid balls convert once to10times their immutable stake in score. GO reservations launch at seeded safe strengths; separately reserved roulette rain enters from above. A drain removes only that ball; end only when stock, GO reservations, rain reservations and live/captured balls are all empty. New game cancels old reservations. Diagnostic AUTO may simulate GO only when explicitly enabled; default OFF. Test zero-stock recovery and queued GO plus a win, with no launch outside GO or the payout-triggered rain exception.
Use stable per-ball IDs, physics/phase/trail/recovery state. Shared substeps advance flippers/world once; latest user thermal override removes ALL ball-to-ball contact work, including free/free and free/guided-or-captured pairs. Balls pass through each other without impulse or separation; board/bumper/flipper/pin/roulette contacts remain; only one roulette owner settles, other balls remain in play. Check high speeds, dense contacts, walls/flippers, pause/hidden, manual takeover and queue conservation. Bound cosmetic draws globally, not gameplay awards. Report simulated stress separately from browser playback and human retention. Keep all existing atlas/mask/12FPS/skin/lighting rules.

### BET-gated roulette physics
At red=black=0, disable roulette rim/disk collision AND capture checks for every ball; central pin remains solid. Multiplier alone never enables roulette. Positive BET restores the rim, but balls already overlapping it get a per-ID exit grace to prevent activation ejection. Keep existing capture ownership through reset and release, with no duplicate settlement. Test both colors, green/reset, multiple crossings and broad/narrow-phase consistency. Snapshot BET/multiplier at stop, including accepted in-flight hits, then atomically clear both BET and multiplier.

## GO-only ordinary play and offline delivery
The red physical GO button is explicitly requested and allowed. It is the sole ordinary gameplay action: random safe launch strength, 10 initial stock balls, atomic single click consumption, queued legitimate presses when blocked. Flippers respond automatically to all nearby balls in ordinary play; they do NOT make a session a bot. Only diagnostic autonomous GO marks automation/mixed; use go-ammo-v3 experiment version and do not compare old input-risk totals as player agency. Keep pause/settings accessible, remove obsolete long-press/arrow controls from the player UI. Test mouse/native keyboard activation, rapid clicks, empty stock, queue concurrency, auto flippers, pause, replay and portrait layout. Disclose actual touch/iOS testing separately.
For server-free delivery, generate PLAY_OFFLINE.html with inline classic scripts, data-URI images/atlases/audio and no remote fonts. Preserve editable source/build script; runtime must not require Node, HTTP, fetch or unsafe browser flags. Audit dependencies and test the final file:// entry when permitted. HTTP tests of the bundle are useful but never substitute for direct-file evidence. A denied file protocol test must be reported, not circumvented. Local file storage differs from HTTP; never claim migrated records or distinct human cohorts. Keep existing HTTP server running unless asked to stop it.

## Default-on audio and dense-ball gain staging
Fresh/unset sound preference is ON, but unlock AudioContext/media only from a legitimate GO or sound/AUTO button gesture. Persist explicit mute separately and preserve it on reload. Legacy music/SFX levels alone are NOT evidence of mute; preserve ambiguous saved levels, report migration uncertainty. SFX default85% (was65%) and bus multiplier2; BGM30% and master.65 unchanged. Compressor ratio12 at-12dB plus bounded soft ceiling; retain18 active voices and cue cooldowns. Test pause/resume, repeated unlock, mute races, rapid GO and source/bundle consistency. Programmatic peak/curve checks are not listening; disclose audition limits. Never bypass file: tool restrictions to test the offline artifact.


## Image GO at the bottom of play
Use a real generated raster red/brass GO asset, not CSS geometry presented as artwork. Put it at the bottom INSIDE the illustrated artwork rectangle itself, not below the board or in a blank control strip. Keep HUD and gear inside the same painted bounds; no external controls. Preserve semantic button keyboard/click activation exactly once, >=44px touch target, disabled material dimming and rigid pressed travel; this is not frame animation. Respect portrait/short viewport and safe-area inset. Embed the asset in PLAY_OFFLINE.html; inspect pixels and final browser layout. One-state-per-atlas remains required if animated frames are authored.


## All UI within the game screen
The actual illustrated image/content rectangle is the UI boundary, NOT its wrapper or letterbox. Overlay HUD, bottom image GO and top-right gear (explicitly permitted icon) inside that rectangle. Never extend it with a blank control strip. Remove external panels from HTML. Gear opens an internally scrolling modal with functional labels; put sound/pause/restart there and AUTO/study/render diagnostics under advanced disclosure. Opening freezes physics and animations, releases input and stops diagnostic AUTO; closing restores prior play/pause without launching or resetting. Inert background, GO guard, keyboard focus trap/return and Escape/cancel required. Restart and local record deletion require explicit in-dialog confirmation; cancel preserves state. Starting diagnostic AUTO is an explicit close-and-run action. Test narrow/short views, no page overflow, mute persistence, exact ammunition preservation and final offline bundle.

Acceptance: compare every visible control/HUD/modal rectangle to the displayed artwork/canvas bounds at desktop and390x667 (including aspect-fit letterboxing). Modal must clip and scroll internally within those bounds. Keep flippers and the active drain path readable; place GO in the lower decorative area beyond the drain cutoff, not over the live lane.


## Current instruction precedence and continuous spectacle
Maintain continuous idle sprite motion for illustrated characters/objects during active play, plus clear event reactions. User wants boldly expressive, lavish motion, not microscopic idle as the primary style. Use large authored poses/anticipation/overshoot for organic characters; only small skin corrections smooth sprite steps. Inorganic motion remains rigid/mechanical. Pause/background/reduced-motion lifecycle and ball readability remain guardrails. Current English-only functional UI, generated image gear/GO and9-slice modal are explicit exceptions to the ban on symbolic state markers; no explanatory in-play prose. See ../../PROJECT_REQUIREMENTS_AUDIT.md for requirement coverage and implementation evidence limits.

## English bitmap typography and nine-slice UI acceptance
All player-facing labels, diagnostics, errors, tooltips and accessibility names are English. Generate illustrated gear and dialog skin with supported image tools; inspect saved pixels. Render the panel as9 slices with explicit source insets and fixed destination corners; stretch only edges/center, test seams and padding at narrow/desktop sizes inside actual artwork bounds. Rasterize exact Latin upper/lowercase, digits, space and needed basic ASCII punctuation from available licensed fonts; do not generate spelling. Multiple rich styles must be used by the renderer, not merely stored. Bake outlines, shadows/extrusion, bevel-like volume and glossy highlights into atlas pixels; keep small body style high-contrast and counters recognizable. Use genuinely bold filled glyph strokes AND noticeably larger rendered sizes; decorative outlines alone do not satisfy weight. Keep counters open and use wrapping/internal scrolling rather than shrinking text to fit. Record baseline/advance/kerning/ink bounds, include decoration padding, reject clipping/bleed and test wrapping/alignment/DPR/fallback. Preserve nonvisual semantic controls for keyboard/accessibility; visible fields, carets, selections and menus must use the shared WebGL atlas renderer. Embed atlas images/metadata/renderer and skins in final offline artifact. Inspect actual small text, not just enlarged sheets.

## Iteration communication and rule audit
Give factual progress at meaningful milestones and about every1–2minutes during work: completed, running, failed and blocked must be distinct. Continue the existing project, preserve work/server/records and avoid unrelated global skill edits. After requested changes, compare trusted user instructions with current project skills, replace superseded rules instead of contradictory appends, and provide requirement-to-section coverage plus unverified implementation limits. Provisional amounts/power/caps are implementation defaults, not user mandates. No external telemetry, purchases or real-money mechanics. Publication follows the explicit project authorization in AGENTS.md.

## Functional nine-slice readability plates
Back the image gear and every visible text/HUD/new stake group with separate actual nine-slice frame and base images. The frame center must be transparent; only the base is translucent, never parent/frame/text opacity. Reuse compatible generated panel art, preserve corners and scale edges/center. Size plates from text metrics plus padding; keep bold large atlas lettering and English semantics. Avoid nested frames and blocking lanes or characters; all plates remain inside painted artwork. These explicitly requested functional bases are allowed, not symbolic gameplay state markers.

## Per-ball stake: confirmed current economy
Clickable affordable tiers cycle1,5,10,50,100,500. GO atomically spendsN available/unreserved ammo for ONE immutable xN ball; reservations snapshotN, selector changes never alter queued/live/captured balls. If selection becomes unaffordable choose largest affordable tier no higher than it; zero disables. Bumper BET increment stays1 regardless of stake. Confirmed user choice: roulette capture owner multiplies entire winning shared BET x SPIN bonus x owner stake exactly once; green uses both colors. First captured owner cannot be replaced by reentry; reset bothBET0/SPIN1 after settlement, other ball stakes persist. Winnings credit stock first, then reserve threshold-triggered top rain as specified below. Guard safe-integer arithmetic before destructive reset. Diagnostic AUTO explicitly usesx1 and records stake/source, not human play. Test mixed stakes, boundaries500, capture/selector changes, queue returns, collisions and no overspending.

Confirmed initial stock is10 for fresh/new game and intentional restart, replacing provisional3. Default launch selectionx1. Never overwrite ongoing earned stock on settings/selector changes. Test initialx10 launch leaves stock0 with one live ball, not premature gameover.


## Coarse luxury UI and numeric type (latest user correction)
Use visibly large, simple corner ornaments and thick border forms in generated nine-slice art AND its effective destination dimensions. Tiny filigree enlarged only in source does not qualify. Keep compact plates readable without crushing content; inspect desktop and390px artwork-bound layouts. Numeric glyphs require a genuinely heavier luxury display typeface, not just a thicker outline on the old mono face. Preserve metallic bevel/gloss/shadow, open counters, tabular digit advances, x companions,500 and large-award coverage. Body text remains independently readable.

Compact totals use one decimal and K/M/G/T/P suffixes (12345 ->12.3K), promote on rounding (999950 ->1.0M), allow conventional100-999 mantissas. Keep exact safe-integer gameplay and diagnostics separate; never parse HUD values for stakes or rewards. Test0, small totals, boundaries and high magnitudes in the numeric atlas. No claim of unlimited inflation beyond safe integers.

Layered UI acceptance: verify source and embedded frame/base bytes, transparent frame center, independent base opacity, and actual per-element computed image bindings. Include gear, SCORE/BEST, stock, bothBET, bonus,stake selector, modal and settings groups. Check legacy high-specificity overrides (pause previously lost its base).

## Responsive illustrated side extension
On wide viewports the scene must appear continuously extended, NOT repeated board tiles. Use edge-aware continuation or the later explicitly authorized reflected-edge method; match joins first. Progressive outer blur/fade are secondary aids, not seam concealment. Use static cached/layered filters, not per-frame full-screen processing. Never duplicate characters/UI, stretch physics or extend allowed UI beyond the central painted board. Test portrait/landscape/ultrawide, resize/zoom, seams, overflow, hit alignment and modal bounds.

Main HUD text is uniformly rich gold (settings may retain alternate readable styles). Label SPIN multiplier BONUS and per-ball launch stake BET, keeping their values distinct from accumulated black/redBET. Include suffixes and labels in glyph coverage and layered9slice bounds checks.

HUD regression lesson: individually verify SCORE and BEST base/frame computed sources are distinct, not merely that border-image is present. A more-specific legacy selector can bind the transparent frame to both layers. Check every existing/new group at actual size after bundle reload.

Latest spacing correction permits responsive text-size adjustment. Retain heavy premium glyph forms, use hierarchy and practical padding clear of sculpted corners; add label/value and inter-panel gaps. Reflow long settings labels, scroll internally, and verify390px/narrow/desktop, not uniform oversized type everywhere. Suggested pixel values are implementation tuning, not user mandates.

Rejected experiment: casino-panorama-v1 did not match center-edge perspective and showed a visible seam. Do not reuse it as accepted extension or hide that seam with more blur. Keep active clean framing until a different continuation is visually proven at multiple widths; source history may remain.

Bumper score rule: multiply existing score-awarding contact base points by the actual hitting ball immutable stake, exactly once. Dice/chips-stack currently score; upper black/red bumpers remainBET+1 without new score,SPIN setsbonus only. Never use current selector/global stale owner or multiply BET. Preserve contact debounce and safe-integer checks; test mixedx1/x5/x10/x500 and score/BEST compact display.

## Roulette visual/economic consistency regression
Never infer roulette boundaries from approximate equally-spaced centers. Validate color lookup against actual rendered atlas crop and painted sector pixels; gold divider/annular-rail pixels are not colored pockets. Reproduce visible-win/zero-award cases before claiming ammo fix. Store sourceimage hash and measured boundaries, freeze rotor during resolved hold, and record capture vsstop BET/BONUS, ownerstake, settlementID, creditedstock and later1s/3s values. Keep bounded diagnostics in memory, no personal data or external telemetry; build fingerprint distinguishes artifacts. A corrected reproducible cause need not explain every unseen user report.

## Authorized project publication
User explicitly authorized completed, tested work to be committed and pushed to main of the existing https://github.com/theta1220/pinball_casino repository and published through its GitHub Pages site. After future requested work passes checks, perform this same workflow and report commit/site/deployment status. Use Git LFS for binary assets and fetch real LFS bytes in CI. Exclude private study records, diagnostic logs, temporary output and unaccepted candidates. No force push, history rewrite, repository visibility change, paid upgrade, new credentials or unrelated repository authorization is implied. Authentication/security approval boundaries still apply. Never claim deployment before terminal CI and public commit/asset verification.

## Protected central art and seamless safe-area continuation
The safe area includes both inset-safe controls and visually continuous scenic coverage outside the protected central board. CSS env padding alone does not satisfy seamless-background acceptance. Preserve central original pixels, aspect ratio, physics coordinates, masks and UI bounds. When source edges cut through furniture, continue the exact clipped contours before room/floor; do not repeat boards or conceal mismatched joins with blur. Inspect unblurred overlap first, then portrait, desktop, ultrawide and short landscape with safe insets and resize. Keep rejected candidates inactive; do not deploy until visual evidence supports continuity. Record asset provenance, exact center rectangle and remaining limits. Independent numeric/rendering work must retain separate ownership until integration.


## Numeric atlas update continuity
HUD value writes preserve existing atlas run/canvas and repaint changed semantic/raster text synchronously, before the next paint. Never remove a rich canvas and defer reconstruction through MutationObserver plus requestAnimationFrame. Cache identical formatted text only; arithmetic stays exact and immediate. Test zero recovery, digit-width/K/M/G boundaries, stake labels, hidden/reopen, resize and unloaded fallback. Distinguish lifecycle models from browser pixels; retain gold glyph and nine-slice readability.


## Performance and device-heat evidence
Remove redundant paused/hidden work, unchanged DOM writes and transient allocations; the later thermal request also authorizes bounded decorative quality reduction while maintaining the requested 60 FPS target. Preserve physics/contact order, rewards, authored12FPS poses and vivid effects. Validate render invalidation on pause entry, visibility return, resize/DPR, assets and motion preference. Compare paired inputs and separate CPU/allocation/submission measurements from GPU timing, RAF cadence and actual temperature. Mock/CPU workload savings are not thermal measurements. Keep explicit tests for numeric continuity after integration; candidate folders never ship.

## Low-power presentation and rapid GO (latest thermal correction)
User reports strong heat on iPhone 15 even after CPU micro-optimizations. Default to a bounded low-power presentation profile, with optional English quality setting; measure pixel budget, render cadence and shader/overdraw work, not CPU vertices alone. Decorative complexity/frequency may be reduced to lower load while preserving exact fixed-step physics, stock/rewards, authored 12 FPS sprite clock, ball visibility and essential feedback. The latest resolution request supersedes the former 400k/DPR1 budget: fit the actual canvas aspect into a 1080x1920 portrait (or 1920x1080 landscape) reference without DPR multiplication, and retain a 60 FPS target. Sleep RAF while paused/hidden; wake on resize, input, assets and visibility without accumulated-time bursts. Compare 1/6/12-ball deterministic states across profiles. Never claim device cooling from desktop/workload evidence.
Keep GO rapid taps from browser double-tap zoom using local touch-action rules; preserve pinch elsewhere and settings scrolling, semantic click/keyboard accessibility and one consumption per activation. No global user-scalable=no or duplicate touchend launch path. Actual iPhone gesture/temperature validation must be reported separately.

## Shared WebGL UI and reference-resolution acceptance
Render all visible HUD, nine-slice layers, atlas text, GO/gear, reels, settings, menus, sliders, numeric caret/selection and diagnostics in the scene WebGL context. Keep layout-bearing semantic DOM invisible for input/accessibility; no duplicate visible DOM/2D canvas. Cache static textures and dirty geometry; changing a number must not upload a text texture or erase it for a frame. Rebind complete GL state between passes and rebuild resources after context loss without resetting economy. Test pointer ownership/cancel, keyboard, popup scrolling, invalid numeric paste/bounds, modal clipping and narrow layouts.
Framebuffer policy: s=min(referenceWidth/CSSCanvasWidth,referenceHeight/CSSCanvasHeight), round both scaled dimensions. The single canvas now covers the viewport; use1080x1920 portrait or1920x1080 landscape by its actual aspect, without DPR multiplication. Map the protected941x1672 board into its unchanged CSS fit rectangle and use that rectangle for all input/UI/reel coordinates and clipping. Total pixel budget is shared with the surround: disclose reduced board raster dimensions in wide viewports. Both quality modes target60FPS; never infer device cooling from this allocation.


## Many-ball thermal override
User reports heat with many balls and authorizes removing ball-to-ball collisions. This supersedes the earlier pair-contact requirement. Keep 60 FPS target and current1080x1920-reference aspect policy, shared WebGL UI, immutable stakes and stock-credit rewards and the explicit payout-triggered rain exception. Preserve CCD/substep/contact passes for the board. Benchmark alternating warmed baseline/final CPU workloads at1/6/12balls; disclose synthetic higher counts and no GPU/temperature inference. Guard unchanged DOM attributes observed by UI invalidation. Regression-test crossing/coincident balls, guided/captured pass-through, board collisions, queue/stock conservation and all roulette colors.


## Payout-triggered stock-consuming rain (latest override)
Winnings first credit common ammunition. Only a positive roulette payout whose resulting stock is at least10 reserves the excess above9 for paced top-entry rain. Reservations immediately reduce spendable stock, x1 rain balls cost1 each, and GO cannot double-spend them. Initial10/newgame, ordinary GO and generic non-roulette credits do not trigger rain. The current defaults are0.2second spacing and12live cap; reserve only free board slots (including existing reservations), convert excess once to10score per x1 ball. Pause/hidden/settings freeze the queue; restart cancels it. No ball-ball collisions. Preserve stake-weighted roulette rewards and reset bothBET0/bonus1. Manual GO remains available for unreserved stock; rain source is roulette-rain, not diagnostic AUTO or a user input.
Entry balls descend visibly from above in a bounded entry phase, crossing the top boundary before normal board physics takes over. Do not use the launcher, increase stake or double-apply a multiplier. Report credited stock separately from reserved/spawned rain so reservation deductions cannot look like missing rewards. Test9/10/large awards, repeated payout, GO competition, cap/pacing, freeze/reset, immutable x1 and all settlement colors.

## Reflected surround — latest authorized method
User explicitly permits reflection with gradual blur/fade. Use cached character-free edge reflection with matching join coordinates; no runtime full-screen blur, additional WebGL context, duplicated characters/UI or stretched center. Original board stays sharp and logically unchanged; all UI remains inside its original painted rectangle. Reflective rails may remain recognizable; inspect actual lit joins on all four edges/corners, tall/narrow/wide/ultrawide layouts, inset-safe input and modal bounds. Report texture memory, changed board pixel allocation and visual limits; old rejected panorama remains inactive.

## Ball-entry and bounded recovery reliability
Rain must hand off through a full-radius clearance-tested free corridor, never enable collisions inside slot art/solid geometry. Close reverse shooter mouths for free balls while guided GO bypasses those gates. Already-in-lane free balls and repeated failed-nudge pockets return the same ID/stake/source to a validated playable portal; no ammo credit/debit, replacement ball or fabricated score. Exclude captured roulette owner and normal drains. Preserve no ball-ball collisions and fixed timing. Track failed nudges across small oscillations; automatic flipper pulses must not reset another ball's recovery timer. Test exact concave pocket, lane occupants, seeded rain handoffs, sustained multi-ball progress and conservation.

## First-paint loading and shared WebGL reveal
Hide placeholder gameplay DOM and relocated canvas in critical inline HTML CSS before external resources. Keep semantic layout, but make gameplay inert until all required textures and a complete board/background/UI frame are submitted. Show the explicitly requested accessible indeterminate loading indicator; no fake percent. On slow load offer wait/reload, and on failure or context loss keep placeholder UI hidden with deliberate status. Browser-native timer callbacks must retain valid receiver binding. Test actual cold/warm completion and context restoration in addition to mock readiness; direct-file restrictions remain explicit.

## Bumper-wall corridor regression
For an unintended bumper/wall trap, measure the free corridor against the full ball diameter and inspect the illustrated bevel before changing colliders. Correct the specific solid contact boundary before relying on timed rescue; preserve the opposite face and artwork where possible. Test both entry directions, slow/fast/oblique approaches and immutable stakes without recovery enabled. Separate legitimate repeated moving rebounds from resting-contact reward farming; assert stationary contacts do not emit repeated hits. Retain board collision, settlement and long multiball/rain regressions. The right-heart 6px bevel inset is a measured implementation value, not a universal user rule.

## Full-board overflow (latest confirmed override)
Full board includes already committed spawn slots, capped at12. User changed overflow conversion to10score per x1,10*N per paid xN ball. Convert once and consume the reservation; no refund, duplicate debit, ghost queue or deferred cap backlog. Rain retains only available slots with paced entry; large excess uses arithmetic, not per-ball loops. Temporary launcher occupancy with free capacity still waits. Safe-integer limits must reject before mutating credit/reset or payment; never silently clamp earned amounts. Test conservation including converted stake units, repeated calls, all roulette colors, zero stock, pause/hidden/restart, SCORE/BEST and actual UI. Preserve ball collision removal,60FPS and reference-resolution policy.
