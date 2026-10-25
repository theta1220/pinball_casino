# Ball-pair removal — 2026-10-25

Latest user authorization supersedes the original ball-ball collision requirement. All free/free and free/guided/captured pair testing, impulses and separation are removed. Board/flipper/bumper/roulette/pin collision solver, CCD subdivision and contact passes remain unchanged. Framebuffer reference policy and 60 FPS target are unchanged.

Other bounded changes: shared damping factors per stepMany call; scalar maximum speed; stable linear highest-y ball selection; unchanged GO/selector disabled values are not rewritten. No stock, stake, payout or launch changes.

## CPU comparison
Baseline physics is commit6821145. Alternating warmed trials on the connected Windows desktop; no GPU or temperature measurement. Synthetic free-flight fixtures reset identical positions/speeds each step,10000steps,5repeats,median milliseconds:

| Balls | Before | After |
|---|---:|---:|
|1|54.01|24.08|
|6|470.25|64.23|
|12|1438.99|108.77|

This intentionally isolates the removed pair work and overstates its contribution to a complete game. A separate actual14-board-shape fixture (200steps,3alternating repeats,no moving flippers/render) measured1ball273.20→282.65ms,6balls1624.79→1643.07ms,12balls4043.91→4069.82ms. No overall board-work speedup is established by this small noisy sample. Do not present free-flight percentages as whole-game/thermal improvement.

## Validation
All35aggregate suites and syntax checks passed, including crossing/coincident balls with unchanged velocities, board CCD/flippers/pin, stock conservation, mixed stakes and red/black/green payouts.20requested launches reached12live balls with zero pair contacts and no nonfinite state. GO attribute model:100unchanged syncs write zero disabled attributes; zero-stock and award transitions still update.

Actual browser rapid10GO:5live+5reservations,stock0,BET8,paircontacts0; pause/resume retained state. Observed desktop RAF600samples median16.7ms/p9516.8ms,not iPhone evidence. Offline bundle rebuilt and checked separately. Directfile execution remains unverified under existing tooling restriction. iPhone15 heat and native gestures remain unmeasured.
