# Roulette rain and full-board conversion

Positive roulette payout first credits ammunition. If resulting stock is at least10, the excess above9 is committed to top rain. Existing live/captured/launching balls and GO/rain reservations share3slots. Only free slots are reserved; excess is immediately consumed into score at the user-confirmed10points per x1 ball. Example0+160 with one captured owner: stock9,2rain reservations,149converted balls=1490score. No millions-sized queue or per-award-ball loop.

A GO at capacity consumes its selectedN stock once and adds10*N score, without spawning or reserving. If the launcher alone is occupied while capacity exists, retain the paid immutable stake reservation. Unexpected capacity changes trim pending reservations once, retaining earlier GO slots before rain. Converted balls never reappear.

Rain remains paced0.2seconds, x1, above-board validated side portals; initial10 and generic credits do not trigger it. Pause/hidden/settings freeze simulation, restart clears old state. Score/BEST use existing exact safe-integer arithmetic and compact gold HUD; unsupported overflow is rejected before mutation, never silently clamped. Experiment rain-v3 preserves old records.

Regression: million-ball credit arithmetic,10x mixed stakes, lane-only waits, dynamic cap changes, no duplicate conversion, safe-range atomicity, natural zero-stock payout and all color/reset tests. Runtime/browser verification recorded in final report.

Historical12-slot browser fixture (before current3-slot override):12live balls plus100award produced stock9,score910,no GO/rain reservation. Full-board x5 GO produced stock0,score50,no reservation; console errors empty. This was synthetic setup through a local test button, not a natural gameplay observation. Existing seeded natural roulette tests independently verify award/reset and converted accounting.

## Three-ball limit verification
Latest user sets maximum3 committed slots: live/captured/guided balls plus GO/rain reservations. Initial stock stays10. Explicit0..3 occupancy fixtures include captured and launch phases, million-ball arithmetic and competing GO/rain. In ordinary browser gameplay10GO clicks yielded3launches, peak3,stock0,overflow70 and no console errors. Existing6/12ball renderer benchmarks remain synthetic stress probes, not selectable gameplay capacity.
