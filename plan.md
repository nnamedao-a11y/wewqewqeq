# BIBI Cars — Development Plan

## Project context
Large existing CRM / Auto-Import platform (FastAPI + MongoDB + React 19 + Tailwind + shadcn/ui).
Repository: https://github.com/nnamedao-a11y/13123122djb23 (cloned and synced into `/app`).

Public preview: `https://commit-tracker-18.preview.emergentagent.com`

## Active work — Single Car Page wiring

### User complaint
Clicking a car card on the homepage "Top Watchlist Deals of the Week" navigated to
`/cars/<VIN>` but the page always rendered the same **hard-coded "Lucid Motors Air Pure"** mock,
regardless of which VIN was clicked.

### Root cause
`SingleCarPage` (`/app/frontend/src/pages/public/SingleCarPage/`) was a pixel-perfect Figma port,
but it had no data fetching — every prop was a default placeholder.

### Fix shipped (this session)
1. Added `useCarByVin` hook (`useCarByVin.js`) + `formatters.js`
   - Fetches `GET /api/vin/<VIN>` (LIVE-FIRST chain: bidmotors SEARCH → WESTMOTORS → LEMON → PAGE
     + parallel stat.vin enrichment).
   - Normalises payload → UI view-model (title casing, mileage with separators, drivetrain abbrev,
     engine "2.5l 4" → "2.5 L", status chip logic, auto-generated description, image dedup).
2. Rewrote `SingleCarPage.jsx`
   - Pulls VIN from `:slug` / `:query` route params.
   - Loading / `not_found` / error states with branded UI.
   - Auto-calls `POST /api/calculator/calculate` with the lot's price → real cost breakdown.
   - Pushes calculator's grand total into the right info panel as "Estimated total price".
3. Rewrote `ImageGrid.jsx`
   - Real photos (hero + 7 thumbs + ALL-IMAGES tile with live image count).
   - Lightbox gallery (Escape / ArrowLeft / ArrowRight keyboard nav).
   - "View on source auction →" link to the underlying bidmotors.bg page.
   - All 11 vehicle-info rows + 4 auction-detail rows fully prop-driven.
4. Updated `NavigationHeader.jsx`
   - Accepts dynamic `title` and `loading` props.
5. CSS additions: state-box (loading/error), lightbox styling, photo-button reset, source-link.

### Verification
`testing_agent_v3` (iteration_1) — **100 % pass on 10 user stories**:
- Homepage card click → correct `/cars/<VIN>` data (no more Lucid mock)
- Nissan Altima `1N4AL3AP4FC574557` — H1 "2015 Nissan Altima", real photo, 22-image gallery,
  LOT 80694245, Auction COPART, "LIVE" chip
- Toyota RAV4 `JTMK1RFV7ND089501` — Bid €4,250, Estimated total €9,778, full cost breakdown
- Status chip (LIVE/TRADED/SOLD/AVAILABLE), lightbox, source-auction link
- Invalid VIN → friendly "VIN not found" with Browse catalog CTA
- `/vin/:query` route works identically to `/cars/:slug`
- No critical console errors

### Files touched
- `frontend/src/pages/public/SingleCarPage/SingleCarPage.jsx` (rewrite)
- `frontend/src/pages/public/SingleCarPage/useCarByVin.js` (new)
- `frontend/src/pages/public/SingleCarPage/formatters.js` (new)
- `frontend/src/pages/public/SingleCarPage/components/ImageGrid.jsx` (rewrite)
- `frontend/src/pages/public/SingleCarPage/components/NavigationHeader.jsx` (rewrite)
- `frontend/src/pages/public/SingleCarPage/SingleCarPage.module.css` (state-box styles)
- `frontend/src/pages/public/SingleCarPage/components/ImageGrid.module.css` (lightbox + reset)

## Next steps (queued)
- **SimilarCars block** at the bottom of SingleCarPage is still showing the static placeholder
  "Lucid Motors Air Pure × 3" — should be wired to `GET /api/public/featured` or to a
  "similar by make/model" endpoint.
- Layout polish around responsiveness on smaller breakpoints (≤ 925 px).
- Optional: clean up font-preload warnings (low priority, perf only).

## ✅ Session 2 — VIN typeahead dropdown (parsers wired live)

**Goal:** Connect real parser logic to the public site's search inputs — header and
welcome-page hero. As the user types ≥ 2 characters, show a live dropdown of suggestions
pulled from the real BidMotors parser via `GET /api/public/search/suggest`. Clicking a
suggestion navigates straight to `/cars/<VIN>` (the canonical SingleCarPage).

**Shipped:**
- New reusable component `frontend/src/components/public/VinSearchDropdown.{jsx,css}`
  - Debounced input (320 ms), 2-char minimum, ≤ 8 results.
  - Mini-card per suggestion: thumbnail, title (title-case), `Lot · Year · Mileage · Location`,
    VIN in monospace yellow, LIVE / CACHE chip from `_src` field.
  - Keyboard nav: ArrowUp/Down highlights, Enter opens highlighted, Escape closes.
  - Click outside closes; click on item navigates to `/cars/<VIN>`.
  - Dark theme matched to BIBI chrome (#16161a + #FEAE00 accent).
  - States: loading spinner, "Search unavailable" error, "No matches" + fallback CTA
    "Open full lookup for <Q>".
- Wired into `figma_home/components/header1.jsx` — original Figma layout untouched,
  dropdown anchored via `position: relative` on the form.
- Wired into `figma_home/components/frame-component22.jsx` ("Calculate a car yourself"
  welcome hero) with the same component and same behaviour.

**Verification (testing_agent_v3 iteration_2 — 10/10 user stories PASS):**
- Header partial `1N4AL` → 1 LIVE/CACHE suggestion (Nissan Altima) → click → /cars/<VIN> ✓
- Header `nissan` → 8 LIVE Nissan suggestions from real-time BidMotors parser ✓
- Welcome hero full VIN → 1 LIVE suggestion → click → /cars/<VIN> rendered correctly ✓
- 1-char query → dropdown doesn't appear (min 2) ✓
- Invalid query → "No matches" state + fallback CTA ✓
- Keyboard nav: ArrowUp/Down/Enter/Esc all functional ✓
- Click-outside closes ✓
- Two inputs independent ✓
- No console errors / no failed unexpected network calls ✓

**Files changed (this session):**
- (new) `frontend/src/components/public/VinSearchDropdown.jsx`
- (new) `frontend/src/components/public/VinSearchDropdown.css`
- `frontend/src/figma_home/components/header1.jsx`
- `frontend/src/figma_home/components/frame-component22.jsx`

## Backend safety warnings (deferred, not blocking)
On startup the FastAPI server warns:
- `JWT_SECRET` is the placeholder value
- `EXT_SHARED_SECRET` is empty (HMAC protection disabled)
- `CORS_ORIGINS="*"` is incompatible with credentialed CORS — fell back to localhost-only
These should be set in `backend/.env` before any production deployment, but they don't affect
the dev preview.
