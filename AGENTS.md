# pinball_casino project instructions

## Automatic instruction maintenance
When a user provides a reusable project requirement, preference or correction, automatically read and apply [.agents/skills/instruction-skill-maintenance/SKILL.md](.agents/skills/instruction-skill-maintenance/SKILL.md). Reconcile existing rules before adding new skills and audit coverage after implementation checkpoints. This applies only to agents working in this project; it creates no background watcher and expands no authorization.

## Canonical topic guidance
Read relevant skill-draft/<topic>/SKILL.md before implementation: game-development, game-playtest, game-animation, game-vfx, game-audio, image-pinball-workflow. These are the existing canonical project topic skills; do not duplicate them. Read PROJECT_REQUIREMENTS_AUDIT.md for current instruction precedence and verification limits. Preserve the existing game, records and server; no external telemetry or real-money features.

## Parallel independent requests
When the user gives multiple independent orders, split them across agents where practical. Declare file/output ownership first; one integration owner handles shared runtime and offline rebuild. Avoid concurrent writes and shared-browser contention. Asset exploration uses an isolated new directory/report and cannot change runtime until coordinated. Preserve authorization and do not duplicate another active owner's task.

## Authorized project publication
User explicitly authorized completed, tested work to be committed and pushed to main of the existing https://github.com/theta1220/pinball_casino repository and published through its GitHub Pages site. After future requested work passes checks, perform this same workflow and report commit/site/deployment status. Use Git LFS for binary assets and fetch real LFS bytes in CI. Exclude private study records, diagnostic logs, temporary output and unaccepted candidates. No force push, history rewrite, repository visibility change, paid upgrade, new credentials or unrelated repository authorization is implied. Authentication/security approval boundaries still apply. Never claim deployment before terminal CI and public commit/asset verification.
