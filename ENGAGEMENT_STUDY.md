# Engagement experiment: goals-v1 / design-risk-v1

## Hypothesis fixed before comparison

Persistent collected/missing target labels and a current SPIN multiplier can help players choose their next target. A returned weak launch explains how to retry and that no ball was lost. The existing collection, score, physics, assets and mechanical reel outcomes stay unchanged.

Counter-hypothesis: extra text adds clutter, and the board's repeated left-chip contacts dominate any benefit. Guardrails: paired identical inputs must keep scores, drains, trajectories and recovery counts unchanged; restart/pause and existing checks must pass. If comprehension does not improve in human observation, simplify or remove the panel. Do not tune the scoring formula to make this UI experiment win.

## Local measurement

Optional study controls are below sound settings. Recording is OFF on every page load, begins only on future game starts after opt-in, stores at most 100 session aggregates in localStorage, and can be erased. No requests, identifiers, raw input traces, dates or external tracking. Storage failures are reported. A session is a start through three-ball game over; restart before game over and page exit produce interrupted sessions. Blur pauses game and interrupts study recording conservatively. Abrupt browser termination can lose the current session: missing sessions cannot be estimated. No cross-tab reconciliation; use one tab. Clearing history, storage blocking and sample truncation limit inference.

Voluntary same-tab replay proxy: a new start within 60 visible wall-clock seconds of game over. Positive observations mature on replay; negative observations mature at 60 seconds; tab departure/reload before maturity is censored, never a non-return. Report version/source groups separately, numerator/denominator, censored and interrupted counts, and Wilson 95% interval. Intervals assume independent observations, which repeated sessions from one person violate; they are descriptive only. Browser observations are `browser-unverified` and may be bots/developers. Simulation has its own source. Neither is actual human retention. D1/D7 are unavailable by design.

Active exposure excludes ready, intro, pause and over. Counts include launches, returned launches, drains, scored contact targets, consecutive repeats, new collections, flipper presses and recovery nudges. Longest feedback gap is active time between scored target contacts (not every kind of audiovisual response).

Frozen custom design-risk-v1 = 100 * mean(consecutive repeated scored targets / (scored targets - 1), returned launches / launches, min(longest active gap / 10 seconds, 1)). Requires >=2 hits, >=1 launch and >=10 active seconds; otherwise null. Scores are not probabilities, boredom questionnaires or enjoyment. Repeated hits may be satisfying; a gap may be deliberate aiming. Show component values and exposure, never optimize the aggregate alone. No automated score for agency, mastery, clarity or fatigue without evidence.

## Repeatable comparison

Use paired-v1: 24 deterministic sessions (12 launch powers 45–100%, reactive/passive flippers), 1/240-second step, 90-second cap, 0.5-second ready delay. Incomplete sessions at the cap remain censored; automatic relaunch is scripted and cannot measure voluntary replay. Compare raw rows with identical inputs; risk formula remains fixed. The harness observes scored collision targets, excluding roulette settlement in this first protocol; in-game diagnostics include roulette, so do not mix these risk samples. Baseline snapshots and the harness are retained in the task workspace.

## Next human experiment, not yet run

Recruit consenting participants; counterbalance baseline/goals-v1 order, keep three-ball rules, allow exit anytime and record prior pinball experience. Before looking at results set sample target, primary outcome (correctly identify missing targets and multiplier), exclusion rules and replay observation window. Report participant count and session count separately; use participant-level paired differences and uncertainty, not pooled independent sessions.

Optional 0–4 ratings: monotony, lack of agency, lack of mastery, unclear feedback, audiovisual fatigue, lack of next goals. Any mean is an unvalidated custom questionnaire, not a diagnostic scale. Ask exit reason: satisfied, time constraint, confusion, fatigue, boredom, other/skip. Do not equate every exit with boredom. Record voluntary replay separately from completion and session length. D1/D7 require a separately consented longitudinal protocol: exact 24–48h / 168–192h windows, mature eligible participants as denominators, missing follow-up and confidence intervals. This implementation does not collect those data.
