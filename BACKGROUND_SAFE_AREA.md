# Reflected safe-area scene

The latest user explicitly allows reflection with gradual blur and fade. The previous rejected generated panorama stays inactive.

## Implementation
- Character-free source-edge reflection, baked blur/fade, assets/reflection-backdrop.webp (2048x1152, 733770 bytes, 9MiB RGBA).
- Original941x1672 artwork, masks, physics and semantic UI fit rectangle unchanged. One viewport-sized WebGL canvas/context; one cached background texture and one added draw. No live blur or DPR multiplier.
- Projection, reel viewport, UI snapshot and pointer mapping use the protected board rectangle. Scissor clips gameplay to that rectangle. Background shares the existing illumination parameters and fades illumination outward.
- Reference fit remains1080x1920 portrait /1920x1080 landscape with60FPS target, now applied to the full viewport. CSS393x852: framebuffer886x1920, board886x1574.1280x900:1536x1080, board608x1080.3440x1440:1920x804, board452x804. This trades central raster detail at wide aspect for a fixed total budget; it is not unchanged board resolution or evidence of lower device temperature.

## Verification
- Browser screenshots inspected at390x667,393x852,1280x900,1920x1080,3440x1440 (center/right crop because screenshot backend limits width),844x390. No abrupt rectangular color boundary was observed; reflected rails remain visibly symmetric. This is decorative reflection, not new room outpainting.
- GO10->9, settings open/close/quality switch, resize and one-context recovery exercised. Recovery preserved stock10/BET0/bonus1/score0. No browser error logs.
- Layout fixtures cover asymmetric safe insets and inverse input; real desktop browser safe insets are zero. Physical iPhone cutouts, temperature and sustained FPS remain unmeasured.
- Offline source bytes embedded and inline scripts parsed; same standalone HTML opened over HTTP and GO10->9. Direct file:// not tested due existing denied route.
- Existing rain/economy rules remain unchanged. Rain deployment78a3b4a was independently successful before this change.
