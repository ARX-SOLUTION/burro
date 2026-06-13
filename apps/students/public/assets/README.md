# Student app assets — Figma export manifest

Drop exported Figma assets here. Vite serves `public/` at the web root, so a file at
`apps/students/public/assets/backgrounds/burro-mosque-bg.png` is reachable at
`/assets/backgrounds/burro-mosque-bg.png`. The code already references these exact paths.

Canvas / parity target: **402 × 874** (Telegram Mini App). Export @1x for parity and, where possible, @2x for retina crispness (same filename + `@2x`).

## Required (needed for pixel-perfect; code already points here)

| Path | What | Size / format |
|---|---|---|
| `assets/backgrounds/burro-mosque-bg.png` | Dark navy patterned background used on ALL main screens (dashboard, modules, exercise, leaderboard, stats, profile) | 402×874 PNG/WebP (+ `@2x` 804×1748) |
| `assets/backgrounds/welcome-bg.png` | Photographic welcome/hero background (screen 02) | 402×874 PNG/WebP (+ `@2x`) |
| `assets/brand/logo.svg` | Cyan squircle "B" Burro logo (welcome). SVG preferred | SVG (or `logo@512.png`) |
| `assets/brand/mascot.png` | Donkey mascot / default student avatar (dashboard header, profile, podium default) | ≥256×256, transparent PNG |

## Optional (I will recreate these as inline SVG if not provided)

| Path | What |
|---|---|
| `assets/icons/*.svg` | Bottom-nav icons (home, grid, play, trophy, profile), streak fire, XP star, heart, close, speaker, lock, check — only if the Figma uses bespoke icons you want 1:1 |
| `assets/illustrations/module-complete.png` | Celebration graphic on the module-completed screen (16) |
| `assets/illustrations/sound-info.png` | Any decorative art on the sound-info screen (13/14) |
| `assets/audio/placeholder.mp3` | Replaces the seeded silent-audio data URI with a real clip (optional) |

## Notes
- If the welcome and main backgrounds are actually the **same** image with a different overlay, export once as `burro-mosque-bg.png` and tell me — I'll apply the lighter overlay for welcome.
- Avatars in the leaderboard/podium are per-student Telegram photos; the seed uses placeholder URLs. Only the **default** avatar/mascot is needed here.
- Tell me the moment files land — I'll wire `AppBackground`, the welcome logo, and the header/podium avatars and re-run the parity check.
