# Burro Student Design QA

source refs:
- `docs/design/reference-screens/contact-sheet.jpg`
- `docs/design/reference-screens/04-home-dashboard.png`
- `docs/design/reference-screens/05-exercise-letter-default.png`
- `docs/design/reference-screens/19-modules-grid.png`
- `docs/design/reference-screens/01-leaderboard.png`

implementation screenshots:
- `/private/tmp/burro-design-qa/dashboard-500.png`
- `/private/tmp/burro-design-qa/modules-500.png`
- `/private/tmp/burro-design-qa/exercise-500.png`
- `/private/tmp/burro-design-qa/leaderboard-500.png`

checks:
- Dark mobile canvas, blue/navy background texture, and white rounded textured cards now follow the reference visual language.
- Dashboard now has avatar header, continue card, green daily task, result cards, horizontal module cards, and bottom nav.
- Modules now default to a dense 2-column grid with compact module cards and icon toggle.
- Exercise now uses the reference-like top progress pill, large glyph card, 2x2 answers, info button, and bottom CTA.
- Leaderboard now uses podium cards, rank rows, pinned user rank, and the same bottom nav treatment.
- Replaced old emoji/text-button primitives with CSS-rendered icon primitives where local icon libraries were unavailable.

verification:
- `pnpm --filter @burro/students typecheck`
- `pnpm --filter @burro/students build`
- Headless Chrome screenshots captured against `http://127.0.0.1:5173/`.

known differences:
- Podium avatars are initials rather than the exact illustrated Figma avatars because no avatar image assets are present in the repo.
- Chrome CLI screenshots were captured at 500px layout width to avoid Chrome's minimum inner-width crop; the app phone remains constrained to 402px.

final result: passed
