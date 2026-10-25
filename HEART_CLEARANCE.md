# Right-heart corridor correction

The old right heart ellipse reached x799. At y524 the shooter divider inner face is x831.8833:32.8833px free space for a34px ball. The old isolated World fixture at(814,430), velocity(0,180), remained near(813.8266,505.1239) after8seconds with26 contact events.

Only the right half of the collider is inset6px: rightmost793, leftmost643 unchanged; clearance38.8833px. The original blue-heart texture, placement, wall, physics solver and contact debounce are unchanged. The inset corresponds to the decorative right gold bevel. Timed recovery remains a fallback, not the corridor solution.

## Verification
heart-clearance-test.cjs compares the old blocked geometry with current source geometry, with no game recovery available. Eighteen cases cover six entries (up/down, oblique, speeds180 through2500) at stakes1/5/500. All escape within8seconds, retain stake, remain finite and avoid sustained penetration. Stationary zero-gravity contact generates no repeated hit events. Moving trajectories can rebound several times before exit; those are not mislabeled as stationary farming.

Existing heart/chip bumpers add baseBET1 and intentionally have no score award; score-bearing bumpers keep score times immutable stake. No economy change or new award was introduced.

Browser QA uses an excluded controlled fixture, not a naturally reached manual/rain trajectory or human retention observation. Full aggregate, offline and deployed checks are recorded after completion. No iPhone thermal inference. Direct-file browser navigation remains restricted; standalone artifact is checked over HTTP and statically.

## Final local results
All40 aggregate suites and syntax checks passed. Browser controlled x5 entry sampled y438 ->492 ->569 ->669 ->794 with unchanged stake and zero recovery records, then continued through the board. Console errors were empty. Offline rebuilt77612908bytes;31texture bytes match,26inline scripts parse. Its browser tab opened overHTTP but the inspection transport exceeded its frame limit; no standalone runtime pass claimed. Public runtime verification follows deployment.
