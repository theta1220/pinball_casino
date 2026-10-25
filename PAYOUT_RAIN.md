# Roulette rain and full-board conversion

Positive roulette payout first credits ammunition. If resulting stock is at least10, the excess above9 is committed to top rain. Existing live/captured/launching balls and GO/rain reservations share3slots. Only free slots are reserved; excess is immediately consumed into score at the user-confirmed10points per x1 ball. Example0+160 with one captured owner: stock9,2rain reservations,149converted balls=1490score. No millions-sized queue or per-award-ball loop.

GO uses one shared canLaunch predicate for disabled WebGL appearance, semantic input and model guard. Full slots, blocked launcher, cooldown, insufficient selected stake, pause/modal/loading/hidden/game-over reject without debit, score or queued shot. Valid GO immediately spawns one immutable-stake ball at seeded random strength. Game-over requires explicit New game/replay before firing. Roulette/rain overflow still converts to score; the manual overflow rule is superseded.

Rain remains paced0.2seconds, x1, above-board validated side portals; initial10 and generic credits do not trigger it. Pause/hidden/settings freeze simulation, restart clears old state. Score/BEST use existing exact safe-integer arithmetic and compact gold HUD; unsupported overflow is rejected before mutation, never silently clamped. Experiment rain-v3+go-ready-v1 preserves old records.

Regression: million-ball credit arithmetic,10x mixed stakes, lane-only rejection and re-enable, dynamic cap changes, no duplicate conversion, safe-range atomicity, controlled zero-stock payout and all color/reset tests. Runtime/browser verification recorded in final report.

Historical12-slot browser fixture (before current3-slot override):12live balls plus100award produced stock9,score910,no GO/rain reservation. Full-board x5 GO produced stock0,score50,no reservation; console errors empty. This was synthetic setup through a local test button, not a natural gameplay observation. Existing seeded natural roulette tests independently verify award/reset and converted accounting.

## Historical three-ball verification (before GO-readiness override)
Latest user sets maximum3 committed slots: live/captured/guided balls plus GO/rain reservations. Initial stock stays10. Explicit0..3 occupancy fixtures include captured and launch phases, million-ball arithmetic and competing GO/rain. In ordinary browser gameplay10GO clicks yielded3launches, peak3,stock0,overflow70 and no console errors. Existing6/12ball renderer benchmarks remain synthetic stress probes, not selectable gameplay capacity.

## Current GO-readiness verification
All40 suites pass. Full-board stationary browser input fixture (gravity/recovery frozen only in excluded test page) shows dimmed disabled GO,stock10,score0. Browser automation refuses keyboard activation of the disabled control; no stock/score change or console error. Ordinary browser play confirms immediate debit/launch, transient disabled state and later readiness. Historical seed2/168 natural trajectories change with immediate launch timing; prior painted-color defect remains tested by replaying its recorded settlement state, explicitly not a current natural win.
