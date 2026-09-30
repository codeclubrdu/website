# `/live` — in-meeting dashboard

Spec + build plan. Read this first in every session that touches `/live`.

Decided 2026-09-29 via a grilling session + independent review. Decisions below are settled; don't re-litigate them in a build session. Open items are marked **OPEN**.

## What it is

A single page, `/live`, shown on the venue TV (AirPlay) for the whole 90-minute meetup. OBS/Twitch-overlay style: six fixed "windows" on a 16:9 canvas with y2k/Geocities chrome. Fully wall-clock driven. Nobody touches it during the event.

Not a slide deck. Guest talks and Share & Tell bring their own laptop.

## Non-goals

- No manual advance, no persisted state, no backend.
- No phone/attendee sync. It's a public URL, anyone may open it, but nothing is shared beyond the schedule.
- No wifi credentials on screen. Public page.
- Not linked from site nav. `noindex`.

## AI policy exemption

This repo's `CONTRIBUTING.md` forbids AI-generated contributions. The owner (Jordan) exempts `/live` explicitly:

- Every file under the paths below carries this header as its first comment:
  `AI-coded (Claude) under the owner's /live exemption — see docs/live-dashboard.md`
- Paths: `src/pages/live.astro`, `src/layouts/live.astro`, `src/components/live/**`, `src/lib/live/**`, `src/styles/live.css`, `src/data/live/**`, `docs/live-dashboard.md`.
- `CONTRIBUTING.md` gets a short "Exemption: `/live`" paragraph pointing here (S1).
- PR description states the branch is AI-coded under this exemption.
- **Hand-written glue** (Jordan writes these; sessions leave `// TODO(jordan)` markers, never fill them): see "Glue list" at the bottom.

## Behavior

### Event + time selection (all client-side)

Build-time date logic is wrong here: Render builds in UTC and a static build's "today" is the build day. So:

- Frontmatter embeds **all** events' schedules + all decks as inline JSON (`<script type="application/json" data-live-schedule>`).
- Browser picks the event: `?date=YYYY-MM-DD` → else today's local date if an event matches → else the next upcoming by date.
- Times are constructed as local `new Date(y, m-1, d, hh, mm)` (DST-safe). Clock display uses `Intl.DateTimeFormat` with `timeZone: 'America/New_York'`. Segment math uses the presenting laptop's clock.
- Rehearsal overrides: `?now=HH:MM` (anchor), `?speed=N` (multiplier). `virtualNow = anchor + (Date.now() - realStart) * speed`.
- Dev-only clock panel (`pnpm dev` only, gated by `import.meta.env.DEV`, absent from the production build): pick event, set HH:MM + speed, or snap back to real time, without reloading. Same virtual clock as the URL params.
- `?motion=1` forces animation on even if the OS reports `prefers-reduced-motion` (macOS Reduce Motion propagates to Safari/Chrome and would silently freeze the ticker).

### Schedule data

`Agenda` in `src/data/events.ts` gains structured times:

```ts
export type Agenda = { start: string; end: string; item: string }; // 24h 'HH:MM'
```

- `formatRange(start, end)` helper renders the existing display string for `events.astro`. Migrate all three events (~15 lines). `Event.time` stays as-is for now.
- `src/lib/live/schedule.ts` is pure and isomorphic (no DOM): validates at module scope (throws → `pnpm build` fails) that every agenda is contiguous, non-overlapping, and inside the event window. Exports `computeState(schedule, nowMs)`.

### State model

```
phase: 'before' | 'during' | 'after' | 'idle'
segmentIndex: number | null
msToSegmentEnd: number        // negative only when phase==='after' and past final end
```

- `before`: event day, before first `start` → overlay "code club rdu event N in DD:HH:MM:SS".
- `idle`: no event today → same countdown text, targeting next upcoming event. No upcoming event → "see you next time" + Discord QR.
- `during`: segment = the window containing now. Countdown = time to that segment's `end`. Never negative here (contiguous agenda guarantees it).
- `after`: past final `end` → overlay "THANKS 4 COMING" + next event date + Discord QR. Countdown counts **up** from 7:00 in y2k blink for the first 10 min (the only overrun that matters), then hides.

One `setInterval` (1s) in `live.astro` computes state and dispatches a `live:tick` CustomEvent on `document` with the state payload. Window components are markup-only and subscribe via a single script in `live.astro` targeting `data-*` hooks. **Six components, one script, one interval.**

### Canvas

Design at 1920×1080. `transform: scale(min(innerWidth/1920, innerHeight/1080))`, `transform-origin: top left`, letterboxed, `overflow: hidden` on html/body. Own layout `src/layouts/live.astro` (no `<Header/>`, no `max-w`). Font sizes are fixed px; legible from across a room at 1080p is the bar.

Screen Wake Lock on load (`navigator.wakeLock.request('screen')`, re-request on `visibilitychange`). `f` key or click → fullscreen. Fonts bundled locally, no CDN (venue wifi is a single point of failure). `pnpm preview` is the offline fallback.

### Windows

1. **AGENDA** — full list, states `done` / `now` / `next` / `later`.
2. **NOW** — big current segment title + embedded reveal.js deck (below).
3. **UP NEXT** — next segment title + start time. Empty state during last segment: "then: wrap".
4. **CLOCK** — current time (large) + countdown to segment end. Wall clock is shown only while `during`; before/idle/after phases show the overlay countdown alone.
5. **UTILITY** — Discord QR (build-time SVG), floor/bathroom note, next event date. No wifi. No repo QR.
6. **TICKER** — bottom bar, ESPN-style continuous scroll of the full agenda, "▶ NOW" tag on the current segment, `callToAction` appended at the end of each loop, ~60s per loop.

Layout grid: TICKER full-width bottom strip; NOW largest (left ~60%); AGENDA right column top; UP NEXT + CLOCK stacked right column; UTILITY bottom-right above ticker. Exact px in S2.

### NOW deck (reveal.js, real)

- `src/data/live/<date>/<NN>.md`, `NN` = agenda index (00-based). Reveal markdown format (`---` between slides). Missing file → "NO SIGNAL" y2k placeholder.
- Loaded at build via `import.meta.glob('/src/data/live/**/*.md', { query: '?raw', eager: true })`, embedded as `<section data-markdown><textarea data-template>` per deck.
- Import reveal **only in `<script>`** (SSR has no `document`). Import `reveal.js/dist/reveal.css` only, never `reset.css`.
- Options: `embedded: true, keyboard: false, hash: false, respondToHashChanges: false, controls: false, progress: false, touch: false, autoSlide: 8000, loop: true, autoSlideStoppable: false, transition: 'fade'`.
- Segment change = `deck.destroy()` then `new Reveal(el, opts).initialize()`. Reveal sizes from `offsetWidth/Height`, unaffected by the canvas transform.
- Deck content is glue (Jordan writes). Sessions ship placeholder decks that say "PLACEHOLDER".

### y2k chrome (chrome only)

Window titlebars w/ fake buttons, bevel borders, starfield background (CSS or a local gif), marquee, visitor counter (fake, seeded from date), blink keyframes, pixel font for titles + ticker. **Body text = large clean system sans.** `prefers-reduced-motion`: marquee becomes a static strip that pages every 8s on tick, blink solid, starfield static, unless `?motion=1`.

### Dependencies (install all in S1 so parallel sessions never touch the lockfile)

`reveal.js`, `@types/reveal.js`, `uqr` (dev, build-time QR).

Discord invite URL hoisted to `src/data/links.ts` and shared with `Header.astro`. **OPEN:** confirm invite is non-expiring.

## File map

```
docs/live-dashboard.md
src/pages/live.astro            # page: embeds JSON, one <script>, one interval, live:tick
src/layouts/live.astro          # bare layout, noindex, canvas scaler, wake lock, fullscreen
src/lib/live/schedule.ts        # pure: validate + computeState
src/lib/live/decks.ts           # glob decks, index by date/segment
src/lib/live/qr.ts              # build-time SVG via uqr
src/components/live/Window.astro   # titlebar/bevel shell
src/components/live/{Agenda,Now,UpNext,Clock,Utility,Ticker,Overlay}.astro
src/styles/live.css             # y2k chrome, imported by live layout only
src/data/live/<date>/NN.md      # decks (glue)
src/data/links.ts               # DISCORD_INVITE
```

## Session plan

Estimates include ~25k fixed overhead. Target 60–100k each. S1 → S2 → {S3 ∥ S4 ∥ S5} → S6.

**S1 (~70k) — data migration, schedule core, skeleton.** `Agenda` start/end migration + `formatRange`; `schedule.ts` w/ validation + `computeState`; `live.astro` layout + page skeleton that embeds JSON and prints `phase / segment / countdown` as plain text; install deps; `links.ts`; CONTRIBUTING exemption paragraph; one placeholder deck. DoD: `pnpm build` green; corrupt an agenda time → build fails clearly → revert; `/live?now=17:52` prints during/seg 1; `?now=17:00` before; `?now=19:30` after; `?date=2026-09-03` picks Event 7; `events.astro` renders unchanged.

**S1 — DONE 2026-09-29 (uncommitted on `jordan/live-dashboard`).** Deviations from the spec above, all settled:

- Viewer copy (from a UX review): never print phase / segment index / ISO dates / mm:ss during a segment. `before`: "Code Club RDU · Event N" / "Starts 5:30 — in H:MM:SS" / venue. `idle`: "Code Club RDU" / "Next: Event N · Thu, Oct 1, 5:30pm" / "in 2 days" (day granularity). `during`: "NOW <title> / until 5:55" + "NEXT <title> / 5:55" + small clock "5:52 pm"; last segment → "THEN That's a wrap / 7:00". `after`: "Thanks for coming!" / "Next: …" or "See you next time" / "running over M:SS" for 10 min. S2 overlays + windows use this copy, not the older overlay text in State model.
- Wall clock only while `during`. Waiting states show a countdown alone.
- `LiveSchedule` gained `place` (venue line). Exports: `schedules`, `selectSchedule(all, todayISO, dateParam)` → `{schedule, eventDay} | null`, `computeState(schedule, nowMs, eventDay)`, `localMs(date, hhmm)`.
- Any `?now=` rehearsal counts as event day (so `before`, never `idle`).
- Dev-only clock panel in `live.astro` (`import.meta.env.DEV`): event select, HH:MM, speed, `set`, `real time`, rehearsal tag. Keep it working through S2; the `tick()` refactor into `live:tick` must not break it.
- Helpers currently inline in `live.astro` script (`hm`, `hms`, `mss`, `dayLabel`, `nextAfter`, `daysUntil`): S2 should move them to `src/lib/live/format.ts` (pure) when windows need them.

**S2 (~90k) — engine + stage + text windows.** Canvas scaler, `Window.astro`, AGENDA / UP NEXT / CLOCK, `Overlay.astro` (before/idle/after), stubs for NOW/UTILITY/TICKER, `live:tick` contract, wake lock, fullscreen, noindex. DoD: `/live?now=17:49&speed=60` shows six windows in a scaled 16:9 grid, segment flips at 17:50, AGENDA states update, after 19:00 counts up + blinks; `pnpm typecheck && pnpm lint` green. Commit.

**S2 — DONE 2026-09-29.** Notes for S3–S5:

- `live:tick` contract in `src/lib/live/tick.ts`: `CustomEvent<LiveTick>` on `document`, `{ now, schedule, state, all, segmentChanged }`. `segmentChanged` is true on the first tick and whenever date/phase/segmentIndex changed — S4 re-inits reveal on it, S5 re-tags the ticker on it. Nothing else runs its own interval.
- `src/lib/live/format.ts`: `clock`, `hm`, `hms`, `mss`, `dayLabel`, `nextAfter(all, date)`, `daysUntil`.
- `Window.astro` props `{ title, name }`; `name` is the grid-area. Canvas grid + row px live in `live.css` (`.canvas`). S3 restyles `.win`, `.win-title`, `.win-title-buttons`, `.overlay`, `.ticker`; keep the selectors.
- live.astro fills: `[data-agenda] li[data-state]`, `[data-now-item]`, `[data-upnext-label|item|at]`, `[data-clock-time|left]`, `[data-utility-next]`, `[data-ticker-track] > span[data-state]`, `[data-overlay][data-phase]` + `[data-overlay-title|main|sub]`. Stubs: `Now.astro` (`[data-now-deck]` hosts reveal, S4), `Utility.astro` (`[data-utility-qr]`, S5), `Ticker.astro` (track is built once per schedule; S5 duplicates it for the scroll), `Overlay.astro` (`[data-overlay-qr]`, S5).
- Layout owns scaler / wake lock / `f`+click fullscreen. Dev panel is in a `slot="outside"` so it's not scaled, and is omitted from the prod build.
- After-overrun blink is in `live.css` (`.overlay[data-phase='after'] .overlay-sub`); S3 can restyle but keep it blinking.

**S3 (~70k) — y2k chrome.** `live.css`, `Window.astro`, starfield, bevels, counter, blink, pixel titles, reduced-motion handling + `?motion=1`. Touches no other window component. Sub-branch `jordan/live-chrome`, merge back.

**S4 (~80k) — NOW / reveal.js.** `Now.astro`, `decks.ts`, placeholder decks 00–04, destroy/re-init on segment change, NO SIGNAL. DoD: `?now=17:52&speed=30` plays deck 01, swaps at 17:55; delete a deck → NO SIGNAL; `pnpm preview` confirms reveal CSS bundles. Sub-branch `jordan/live-now`.

**S5 (~60k) — UTILITY + TICKER.** `qr.ts`, `Utility.astro`, `Ticker.astro` (duplicated track, `translateX(0 → -50%)`, ▶ NOW tag), QR into after-overlay. DoD: QR scans on a phone, ticker loops ~60s w/o jank. Sub-branch `jordan/live-utility`.

**S6 (~70k) — integrate + rehearse + hand off.** Merge S3–S5, fix seams, full rehearsal `/live?date=2026-10-01&now=17:25&speed=60` before → 5 segments → after, no console errors, single interval confirmed; audit AI headers on every file; finalize glue list; `format:check && lint && typecheck && build`; draft PR w/ exemption note.

Each session starts with: read this doc, `git log --oneline -15`, and the files named for that session. Nothing else needs carrying over.

## Glue list (Jordan hand-writes; sessions leave `TODO(jordan)`)

- Deck content: `src/data/live/2026-10-01/00–04.md`
- Floor/bathroom note text in `Utility.astro`
- Discord invite constant value in `links.ts` (+ confirm non-expiring)
- Any gif/asset under `public/live/`
- TV/AirPlay setup + deployment (Jordan owns deploy; not in scope here)

## Rehearsal checklist (pre-event)

- `/live?date=2026-10-01&now=17:25&speed=60` end-to-end on the actual laptop that will AirPlay
- Reduce Motion off on that laptop, or use `?motion=1`
- Press `f`; confirm wake lock (no screen sleep in 5 min)
- Phone-scan the Discord QR from across the room
