# Payout rain — confirmed rule and implementation defaults

The user requested real balls raining from random positions above the board after roulette winnings increase stock to at least10, and explicitly confirmed stock consumption. This overrides the previous no-reward-autofire rule only for this trigger.

- Credit the exact roulette award first. A positive award bringing available stock to10 or more atomically reserves the excess above9; spendable stock becomes9. Example0+160 => credit160, stock9, rain reservation151. Zero awards do not trigger.
- Each reserved ball costs1 and has immutable x1, independent of the captured payout owner's stake. No double multiplier. Separate seeded RNG preserves GO's launch RNG.
- Spawn at most one every0.2seconds, within existing12live-ball cap. Reservations are a count, not a huge allocated array. Full board delays, never discards. GO reserves only spendable stock and retains its original launcher path.
- Rain enters at y=-20,x370..700, descends through the top-boundary entry corridor, and joins ordinary board physics at y250 (logical941x1672). No ball-ball collision. This entry phase is analogous to the guided launcher; it is not a teleport directly into the playfield.
- Initial10/newgame and generic test credits do not trigger. Pause, settings and hidden state freeze simulation/queue; restart clears old-game reservations. Pending rain prevents premature game over. No background timers.
- Logs distinguish stockAfterCredit, stockAfter, rainPending and rainLaunched. Experiment versiongo-ammo-v4+stake-v1+rain-v1 preserves old records. Ordinary rain is not diagnostic AUTO or voluntary user input.

9retained/0.2s/12cap/x1 are coherent implementation defaults, not amounts explicitly specified by the user. 60FPS target, reference resolution and shared WebGL UI remain unchanged.

Validation: threshold9/10/large award, zero stock, GO competition, repeated payouts, cadence/cap, pause/hidden/restart, deterministic top entry and all-ball-drain pending queue. Legacy payout tests now assert credited value plus reservation conservation; isolated capture-release fixtures hold rain cadence to test their original subject. Dedicated tests exercise actual rain progression.

Actual browser manual x10GO with seed168 naturally awarded160: stock9/pending151, then rain visibly entered from above and active count reached12 without exceeding cap. Later ordinary roulette wins reserved more rain; GO count stayed1. No score/award injection. iPhone thermal effect is unmeasured; a long cascade can persist at the cap. Directfile:// route remains untested under prior tool restriction; regenerated HTML tested over HTTP and statically.
