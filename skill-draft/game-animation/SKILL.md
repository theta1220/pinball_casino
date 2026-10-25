---
name: game-animation
description: ゲーム内オブジェクトやUIの動き、遷移、回転、チャージ、反動を設計・実装し、フレーム依存、アンカーずれ、割り込み時の破綻を修正する。
---

# ゲームアニメーション

物理で決まる動き、装飾的な動き、UIの遷移を分ける。物理オブジェクトの位置をtweenで上書きして衝突と見た目を食い違わせない。実際に動く当たり判定が必要ならシミュレーション側の姿勢と表面速度を更新する。

## 動きの設計

- リールの方向は数値の正負ではなく、同じ絵柄が画面内でどちらへ移動するかで検証する。UVの上下反転で方向を変えると絵柄も反転するため、絵柄の正立を保って位相の進行方向と停止目標を一緒に変更する。負の位相も正の剰余へ正規化し、全結果の停止を確認する。

- 機械式リールは平面の画像帯を動かすだけでは立体感を保証しない。円筒の角度からUVを求め、中央と上下端で投影圧縮率を変える。絵柄の縦横比、隣の絵柄の見切れ、筐体内の遮蔽影を静止・低速・高速それぞれで実画面確認する。ハイライトは回転する印刷模様ではなく固定光源に属する。

- バンパーの圧縮と復帰、リールの連続回転と減速など、対象の機構が読める動きを作る。単なる明滅や文字置換だけで「弾む」「回る」を実装済みと扱わない。必要な素材がなければ追加する。

- 状態ごとに開始値・終了値・継続時間・割り込み・復帰先を決める。idle、charging、released等、既存ゲーム状態で表現できるものに別の曖昧なフラグを増やさない。
- 操作に対する反応をすぐ見せる。予備動作が必要でも入力受付の表示を遅らせない。物理の速度と演出のタイミングを別々に調整する。
- 変形の支点を実物に合わせる。透明画像の中央、回転軸、台座の接地点は一致しないことがある。親子変換の順番、ミラー時の支点、影の追従を確認する。
- 一定角速度は角度をdtで積分し、目標へ近づける動きはフレーム非依存の減衰等を使う。毎フレーム固定量の加算や固定係数lerpで速度を決めない。
- ループは位置・速度・必要なら加速度が境界で連続するか確認する。角度の0/2π境界で逆回転させない。ホイール全体の楕円を回転させず、円形平面内で回してから投影する。
- 急な目標変更は現在値・必要なら現在速度から再計算する。連打でtweenが積み上がり、終了コールバックが古い状態を復元しないようにする。
- squash/stretch、反動、overshootは読みやすさのために使い、材質を無視して金属やUIを一律に弾ませない。操作を妨げる長い入力ロックを付けない。

時間・補間・検証の具体例は [タイミング](references/timing.md) を読む。




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


## Current instruction precedence and continuous spectacle
Maintain continuous idle sprite motion for illustrated characters/objects during active play, plus clear event reactions. User wants boldly expressive, lavish motion, not microscopic idle as the primary style. Use large authored poses/anticipation/overshoot for organic characters; only small skin corrections smooth sprite steps. Inorganic motion remains rigid/mechanical. Pause/background/reduced-motion lifecycle and ball readability remain guardrails. Current English-only functional UI, generated image gear/GO and9-slice modal are explicit exceptions to the ban on symbolic state markers; no explanatory in-play prose. See ../../PROJECT_REQUIREMENTS_AUDIT.md for requirement coverage and implementation evidence limits.

## Original-reference occlusion acceptance
Compare original image.png, current character-free board and animated composite side by side before adjusting foreground masks. Trace the actual outer foreground rail in artwork coordinates; do not mistake the inner felt edge for the occluding silhouette. Keep independent character positions and identity; no rectangular patches. Apply the mask after skin deformation in board coordinates. Check every idle/event frame and interpolation extremes at portrait/desktop scale for spill, missing intended hands, halos and seams. Record reference filename, before/after evidence and visual limits separately from passing mask math tests.
