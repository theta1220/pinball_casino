---
name: image-pinball-workflow
description: 参考画像を盤面に使うWebGLピンボールの制作・修正。背景と透過素材の分離、原画とのサイズ比較、模様と配置の整合、回転・接地影・自作物理の調整に使う。
---

# 参考画像から作るピンボール

ユーザーが指定したエンジン、操作、速度などを保持し、既存実装を確認してから修正する。本スキルは画像ベースのピンボール向けで、一般的な画像編集や別ジャンルのゲームに固定の構成を押し付けない。

音の実装・調整には `game-audio`、視覚効果には `game-vfx`、動作と遷移には `game-animation`、実操作や性能検証には `game-playtest` を必要に応じて併用する。ゲーム全体の構成を変更するときは `game-development` を参照する。

## 盤面と素材

- 元画像を表示して確認し、原画座標で主要オブジェクトの中心・外形・サイズ・接地点を記録する。見た目の一致は目視による近似とピクセル一致を区別する。
- 先に障害物のない背景を生成し、その上に独立した透過素材を順に配置する。既存の障害物を色付き図形や背景の継ぎ貼りで隠さない。元画像は保存する。
- 人物の同一性と外枠・照明・フェルトの画風を保持する。人物は背景から分離し、背景には人物を焼き込まない。必要部分だけ再生成する。生成には環境のimagegenスキルを使い、素材とプロンプトをプロジェクトへ保存する。
- スプライトの透明余白を含む画像寸法ではなく、実際の輪郭寸法で原画と比較する。小型のチップ山を別物のバンパーで代用しない。
- 配置変更後は背景の放射模様・輪・左右の装飾も再照合する。SPINの放射模様など位置に意味がある装飾は同じ中心座標に合わせる。物理調整済みの配置を模様に合わせて無断で戻さず、背景を修正する。図形で古い模様を塗り隠さない。
- 生成画像への座標指定だけで位置精度を保証しない。模様の中心が繰り返しずれる場合は、背景から当該模様だけを生成編集で除去し、独立した透過の印刷模様素材を作る。模様・対象物・判定で配置定義を共有し、実合成画面で中心と露出範囲を確認する。

## 回転・接地・影

- 複数リールの間隔はCSSの均等配置を正解とせず、筐体素材の各窓の内側と仕切りの左右端から求める。中央窓の偏り、左右の隙間、元の絵柄の露出を合成画面で照合する。回転方向の確認は同じ絵柄を低速の複数時点で追う。

- リール窓は元の絵柄を覆う矩形と考えず、筐体の奥にある円筒面として組み込む。生成素材の縦横比を保持し、周囲と同じ照明・色温度に合わせる。拡大図と実際のプレイサイズで二重の縁、絵柄の伸び、平面感を比較し、見た目を確認する前にテスト成功だけで完了しない。

- ルーレットは固定外枠、円形の回転盤、固定支柱を分離する。円盤を自身の平面で回転してから盤面へ楕円投影する。楕円画像全体を回して外枠を揺らさない。回転角を継続加算し、加減速を滑らかにする。
- 支柱の配置基準は画像中心ではなく台座の接地楕円中心。フリッパーは実際の銀色ピボットを回転原点にする。素材ごとのアンカーを明示する。
- 接地影は素材のアルファ輪郭から柔らかく生成し、原画の光源方向に合わせる。影を物理形状にしない。動く球・フリッパー・バネに影を追従させ、描画順と二重影を確認する。

## 判定と修正ループ

- 見た目を拡大・移動したら判定も更新する。物理エンジン不使用を求められた場合は、固定刻み・速度に応じた分割・連続衝突・接触点のフリッパー速度・摩擦と反発を使う。
- ボール速度倍率はチャージやUI演出の実時間と分離する。現行の通常操作は画像GOの1回操作によるランダム発射と自動フリッパー。長押しチャージは旧方式の内部回帰確認だけで、通常UIへ戻さない。
- 原画の装飾は球の通路幅を保証しない。球直径より狭い隙間や、バンパーとルーレット外周が作る袋小路を確認する。停滞救済の力を強める前に通路を直す。必要な配置差はユーザーへ説明する。
- 素材生成→実画面比較→修正を繰り返す。生成しただけで完了にしない。背景、原画、実際の合成画面を比較し、サイズ・模様・透過縁・影・回転軸を確認する。
- 変更に応じて高速衝突、動くフリッパー、ルーレット開口部、複数発射強度の自動プレイを検証する。滞留と救済回数を分けて記録し、未解決の失敗を成功と報告しない。物理モックテストと実ブラウザーでの表示・操作確認を区別する。

このプロジェクトの具体的な経緯・確認コマンドが必要なら [references/pinball-casino.md](references/pinball-casino.md) を読む。座標や数値は他の盤面へ流用せず、実ファイルを正として再確認する。




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


## Image GO at the bottom of play
Use a real generated raster red/brass GO asset, not CSS geometry presented as artwork. Put it at the bottom INSIDE the illustrated artwork rectangle itself, not below the board or in a blank control strip. Keep HUD and gear inside the same painted bounds; no external controls. Preserve semantic button keyboard/click activation exactly once, >=44px touch target, disabled material dimming and rigid pressed travel; this is not frame animation. Respect portrait/short viewport and safe-area inset. Embed the asset in PLAY_OFFLINE.html; inspect pixels and final browser layout. One-state-per-atlas remains required if animated frames are authored.


## All UI within the game screen
The actual illustrated image/content rectangle is the UI boundary, NOT its wrapper or letterbox. Overlay HUD, bottom image GO and top-right gear (explicitly permitted icon) inside that rectangle. Never extend it with a blank control strip. Remove external panels from HTML. Gear opens an internally scrolling modal with functional labels; put sound/pause/restart there and AUTO/study/render diagnostics under advanced disclosure. Opening freezes physics and animations, releases input and stops diagnostic AUTO; closing restores prior play/pause without launching or resetting. Inert background, GO guard, keyboard focus trap/return and Escape/cancel required. Restart and local record deletion require explicit in-dialog confirmation; cancel preserves state. Starting diagnostic AUTO is an explicit close-and-run action. Test narrow/short views, no page overflow, mute persistence, exact ammunition preservation and final offline bundle.

Acceptance: compare every visible control/HUD/modal rectangle to the displayed artwork/canvas bounds at desktop and390x667 (including aspect-fit letterboxing). Modal must clip and scroll internally within those bounds. Keep flippers and the active drain path readable; place GO in the lower decorative area beyond the drain cutoff, not over the live lane.


## Current instruction precedence and continuous spectacle
Maintain continuous idle sprite motion for illustrated characters/objects during active play, plus clear event reactions. User wants boldly expressive, lavish motion, not microscopic idle as the primary style. Use large authored poses/anticipation/overshoot for organic characters; only small skin corrections smooth sprite steps. Inorganic motion remains rigid/mechanical. Pause/background/reduced-motion lifecycle and ball readability remain guardrails. Current English-only functional UI, generated image gear/GO and9-slice modal are explicit exceptions to the ban on symbolic state markers; no explanatory in-play prose. See ../../PROJECT_REQUIREMENTS_AUDIT.md for requirement coverage and implementation evidence limits.

## English bitmap typography and nine-slice UI acceptance
All player-facing labels, diagnostics, errors, tooltips and accessibility names are English. Generate illustrated gear and dialog skin with supported image tools; inspect saved pixels. Render the panel as9 slices with explicit source insets and fixed destination corners; stretch only edges/center, test seams and padding at narrow/desktop sizes inside actual artwork bounds. Rasterize exact Latin upper/lowercase, digits, space and needed basic ASCII punctuation from available licensed fonts; do not generate spelling. Multiple rich styles must be used by the renderer, not merely stored. Bake outlines, shadows/extrusion, bevel-like volume and glossy highlights into atlas pixels; keep small body style high-contrast and counters recognizable. Use genuinely bold filled glyph strokes AND noticeably larger rendered sizes; decorative outlines alone do not satisfy weight. Keep counters open and use wrapping/internal scrolling rather than shrinking text to fit. Record baseline/advance/kerning/ink bounds, include decoration padding, reject clipping/bleed and test wrapping/alignment/DPR/fallback. Preserve nonvisual semantic controls for keyboard/accessibility; visible fields, carets, selections and menus must use the shared WebGL atlas renderer. Embed atlas images/metadata/renderer and skins in final offline artifact. Inspect actual small text, not just enlarged sheets.

## Original-reference occlusion acceptance
Compare original image.png, current character-free board and animated composite side by side before adjusting foreground masks. Trace the actual outer foreground rail in artwork coordinates; do not mistake the inner felt edge for the occluding silhouette. Keep independent character positions and identity; no rectangular patches. Apply the mask after skin deformation in board coordinates. Check every idle/event frame and interpolation extremes at portrait/desktop scale for spill, missing intended hands, halos and seams. Record reference filename, before/after evidence and visual limits separately from passing mask math tests.

## Functional nine-slice readability plates
Back the image gear and every visible text/HUD/new stake group with separate actual nine-slice frame and base images. The frame center must be transparent; only the base is translucent, never parent/frame/text opacity. Reuse compatible generated panel art, preserve corners and scale edges/center. Size plates from text metrics plus padding; keep bold large atlas lettering and English semantics. Avoid nested frames and blocking lanes or characters; all plates remain inside painted artwork. These explicitly requested functional bases are allowed, not symbolic gameplay state markers.

Original-reference QA lesson: use actual renderer contact sheets for every frame at start/mid/end skin phase and real play scales. Distinguish an incorrect occlusion boundary from source-pose registration: do not expand a foreground mask to rescue a misregistered face. Any registration correction must cite a visible original landmark and quantify the offset; preserve unrelated positions/art. Record frame/state coverage and source-art differences explicitly. See ../../MASK_VISUAL_QA.md.


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

## Roulette visual/economic consistency regression
Never infer roulette boundaries from approximate equally-spaced centers. Validate color lookup against actual rendered atlas crop and painted sector pixels; gold divider/annular-rail pixels are not colored pockets. Reproduce visible-win/zero-award cases before claiming ammo fix. Store sourceimage hash and measured boundaries, freeze rotor during resolved hold, and record capture vsstop BET/BONUS, ownerstake, settlementID, creditedstock and later1s/3s values. Keep bounded diagnostics in memory, no personal data or external telemetry; build fingerprint distinguishes artifacts. A corrected reproducible cause need not explain every unseen user report.

## Protected central art and seamless safe-area continuation
The safe area includes both inset-safe controls and visually continuous scenic coverage outside the protected central board. CSS env padding alone does not satisfy seamless-background acceptance. Preserve central original pixels, aspect ratio, physics coordinates, masks and UI bounds. When source edges cut through furniture, continue the exact clipped contours before room/floor; do not repeat boards or conceal mismatched joins with blur. Inspect unblurred overlap first, then portrait, desktop, ultrawide and short landscape with safe insets and resize. Keep rejected candidates inactive; do not deploy until visual evidence supports continuity. Record asset provenance, exact center rectangle and remaining limits. Independent numeric/rendering work must retain separate ownership until integration.


## Shared WebGL UI and reference-resolution acceptance
Render all visible HUD, nine-slice layers, atlas text, GO/gear, reels, settings, menus, sliders, numeric caret/selection and diagnostics in the scene WebGL context. Keep layout-bearing semantic DOM invisible for input/accessibility; no duplicate visible DOM/2D canvas. Cache static textures and dirty geometry; changing a number must not upload a text texture or erase it for a frame. Rebind complete GL state between passes and rebuild resources after context loss without resetting economy. Test pointer ownership/cancel, keyboard, popup scrolling, invalid numeric paste/bounds, modal clipping and narrow layouts.
Framebuffer policy: s=min(referenceWidth/CSSCanvasWidth,referenceHeight/CSSCanvasHeight), round both scaled dimensions. The single canvas now covers the viewport; use1080x1920 portrait or1920x1080 landscape by its actual aspect, without DPR multiplication. Map the protected941x1672 board into its unchanged CSS fit rectangle and use that rectangle for all input/UI/reel coordinates and clipping. Total pixel budget is shared with the surround: disclose reduced board raster dimensions in wide viewports. Both quality modes target60FPS; never infer device cooling from this allocation.

## Reflected surround — latest authorized method
User explicitly permits reflection with gradual blur/fade. Use cached character-free edge reflection with matching join coordinates; no runtime full-screen blur, additional WebGL context, duplicated characters/UI or stretched center. Original board stays sharp and logically unchanged; all UI remains inside its original painted rectangle. Reflective rails may remain recognizable; inspect actual lit joins on all four edges/corners, tall/narrow/wide/ultrawide layouts, inset-safe input and modal bounds. Report texture memory, changed board pixel allocation and visual limits; old rejected panorama remains inactive.
