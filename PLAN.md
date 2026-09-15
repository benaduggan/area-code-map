# Area Code Map — Project Plan (v2 re-imagining)

## The idea, in one line

Drop in your contacts and watch North America light up with the area codes of the
people you know. Everything runs in your browser. Nothing is uploaded. Share the
picture, not the phone numbers.

## Why re-start rather than continue

The current repo is a 2021 Parcel 2 RC + React 17 scaffold with a search box and
no map. The toolchain (Parcel RC, Node 16 via nix, `styled-components` 5) is
stale enough that upgrading costs about the same as starting clean, and none of
the existing code encodes decisions we want to keep. What *is* worth keeping:

- The polygon dataset (`areacodegeojsonsmall.json`, 336 shapes, 7 MB). See the
  data section below for why and how.
- The repo, license, and GitHub Actions habit.

## Product principles

1. **Client-side only.** A static site. No backend, no accounts, no analytics that
   see phone numbers. The privacy story is the pitch, so it has to be provably
   true: a strict Content-Security-Policy with no `connect-src`, and a PWA that
   works with the network turned off.
2. **Numbers are transient.** Raw phone numbers live in memory only while the
   page is open. What we keep (optionally, in `localStorage`) is aggregate
   counts per area code. Nothing else survives a reload unless the user says so.
3. **The map is the payoff.** The emotional moment is "oh, that's where my
   college friends are." Choropleth by contact count, clear labels, one click to
   see who is behind a region.
4. **Sharing = a URL or a PNG.** A share link encodes only area-code counts. A
   friend opening it sees your map and can overlay their own for a comparison.

## What we are building (MVP scope)

| # | Feature | Notes |
|---|---------|-------|
| 1 | Interactive map of all NANP area codes (US, Canada, Caribbean) | SVG, pan/zoom, hover + click, insets for AK/HI/Caribbean |
| 2 | Search / browse | By area code, city, state or province. Overlays grouped ("212 / 646 / 332 / 917 — Manhattan") |
| 3 | Import contacts | Four paths: paste text, `.vcf` (vCard), `.csv` (Google/Outlook/iCloud exports), and the browser Contact Picker API on mobile |
| 4 | Your map | Choropleth by count, ranked list, click a region to see the names in it (in-memory only) |
| 5 | Fun stats | "You know people in 23 area codes across 14 states." Most common, rarest, oldest code, farthest apart, etc. |
| 6 | Share | Copy link (counts encoded in the URL hash), download PNG, compare mode when opening someone else's link |
| 7 | Works offline | PWA install, service worker caches everything |

Explicitly **out** of the MVP: user accounts, server sync, historical
area-code timelines, international (non-+1) numbers beyond counting them as
"outside North America."

## Data plan

### Findings from the existing dataset

- 336 features, 335 unique NPAs, `Polygon` and `MultiPolygon`, WGS84 lon/lat.
- Fields: `NPA`, `STATE`, `COUNTRY`, `TYPE` (`""`, `S` split, `O` overlay),
  `PREVNPA`. Date fields are junk (`1899-11-30` / `0200-10-21`).
- **It is a ~2010 snapshot.** Against the current NANPA list it is missing 119
  of 454 in-service geographic codes.
- The good news: 118 of those 119 are **overlays**, i.e. they share their
  footprint with a code that *is* in the file (332 = 212's shape, 984 = 919's,
  929 = 718/347's, 437 = 416/647's). So the geometry is still right; only the
  labelling is stale. Full join results below.

### Where current data actually lives (researched Sept 2026)

| Source | What it is | Currency | License | Verdict |
|--------|-----------|----------|---------|---------|
| **NANPA NPA Database** `https://reports.nanpa.com/public/npa_report.csv` | Authoritative list of every NPA: location, country, in-service date, overlay complex, parent NPA, time zone, status | File dated 2026-09-14; 454 in-service geographic codes (378 US, 55 Canada, 21 Caribbean) | Public | **Use it.** This is the metadata source. |
| The repo's `areacodegeojsonsmall.json` | 336 polygons (US, Canada, Caribbean), from the HSIP/HIFLD federal dataset | ~2010 snapshot | Public domain | **Keep as geometry.** See join results below. |
| `github.com/1ec5/nanp-boundaries` | Same lineage via UCLA Geoportal | 2015 | Public domain | Marginally newer than ours; not worth switching for |
| HIFLD Open "Area Code Boundaries" | Federal polygon layer | Portal shut down Aug 2025; item 404s | Public domain | Gone; archives only |
| Esri Living Atlas "USA Telephone Area Code Boundaries" | 356 polygons, TomTom/iconectiv sourced | 2024, annual updates, marked "retiring Dec 2026" | Esri third-party redistribution terms | **Do not bundle.** US-only (no Canada/Caribbean) and the license does not allow shipping it in an MIT app |
| GeoTel, Pitney Bowes/Precisely, zip-codes.com | Commercial NPA boundary products | Current | Paid, no redistribution | Only if we ever need true post-2010 split geometry |

### Join test: current NANPA list against our polygons

Ran the join (NANPA in-service geographic NPAs → polygon by NPA, else by any
sibling in `OVERLAY_COMPLEX`, else by `PARENT_NPA_ID`):

- 454 current codes. 335 have a polygon by their own number.
- 119 do not. **118 of those are overlays** and resolve to an existing shape via
  their overlay complex.
- **1 is unresolvable: 721 (Sint Maarten, 2011).** It is an island with no
  parent shape, so we draw one small polygon by hand.
- 0 polygons in our file belong to codes that are no longer in service.

So there have been no true geographic splits in the NANP since the polygons
were drawn that we cannot represent. The "stale dataset" problem is entirely a
labelling problem, and the NANPA CSV fixes it.

### Decision: keep the shapes, source metadata from NANPA

- **Geometry**: run the small GeoJSON through `mapshaper` (simplify ~5–10%,
  snap, drop the junk fields), convert to **TopoJSON**, and give each shape a
  stable `shapeId` (the NPA it was drawn for, e.g. `212`). Add a hand-drawn
  Sint Maarten polygon for 721. Target ≤ 400 KB gzipped. Checked into
  `src/data/shapes.topo.json`, regenerated by a script.
- **Area code metadata**: `src/data/areacodes.json`, one row per in-service
  geographic NPA, generated from the NANPA CSV. Fields we keep: `npa`,
  `region` (`LOCATION`), `country`, `inService` (year from `IN_SERVICE_DT`),
  `overlayComplex` (parsed from `OVERLAY_COMPLEX`), `parent`, `timeZone`,
  `shapeIds` (the join into the TopoJSON), and a curated `cities` list.
- **Join rule**: `shapeIds` = the polygon(s) for this NPA if one exists, else
  the polygons of every sibling in its overlay complex that has one. Note the
  plural: a few codes span two complexes (e.g. 564 overlays both 206 and 360),
  so they map to more than one shape. The build fails if any active NPA has
  zero shapes, which is how a future geographic split gets noticed.
- **Refresh**: `bun run data:build` re-downloads the NANPA CSV, re-runs the
  join, and prints anything unmapped. New area codes go live several times a
  year and this is a one-command update. Refreshing shapes is manual and
  expected to be rare.
- **Fallback if the polygons ever become a problem**: same join, but render
  centroid bubbles on a state/province basemap. The metadata table and the
  contact pipeline are unchanged; only the renderer swaps.

Delete the 85 MB `areacodegeojson.json` and the 7 MB copy from the working
tree once the TopoJSON is generated (they stay in git history; that is fine).

## Contact import pipeline (all in the browser)

```
source ──► extract strings ──► parse phone numbers ──► normalise to E.164 ──► take NPA of +1 numbers
                                                                                 │
                       names kept in memory only ◄───────────────────────────────┤
                                                                                 ▼
                                                     counts: Map<npa, number>  (this is the only persisted/shared thing)
```

- **Sources**
  - *Paste*: a textarea. Regex out anything that looks like a phone number.
    Zero-friction demo path and works everywhere.
  - *vCard (.vcf)*: iCloud, Google Contacts, Android all export this. Parse
    `TEL` lines (handle folded lines, `TYPE=` params, `tel:` URIs). Small
    hand-written parser; the format is simple enough that a library is not
    worth the bytes.
  - *CSV*: Google Contacts CSV and Outlook CSV have different headers. Sniff the
    header row, take every column whose name contains "phone", and fall back
    to "any cell that parses as a phone number."
  - *Contact Picker API* (`navigator.contacts.select(['name','tel'], {multiple:true})`):
    Chrome on Android and Safari on iOS. Not on desktop. Show the button only
    when the API exists.
- **Parsing**: `libphonenumber-js` (min metadata build, ~70 KB) for
  normalisation with `US` as the default region. Numbers that fail to parse
  are counted as "unrecognised" and shown to the user as a number, never as a
  list.
- **Dedup**: by E.164 string, so one contact with home and mobile in the same
  area code counts once per distinct number.
- **Privacy affordances**: a visible "nothing left this tab" badge linking to a
  short explanation, a "forget everything" button, and persistence to
  `localStorage` only behind an explicit toggle.

## Share format

- URL hash, not query string, so it never reaches a server log even on a
  future host. Shape: `#v1.<base64url>` where the payload is a compact list of
  `(npa, count)` pairs. Plan: varint-encode `npa` as an index into the sorted
  NPA table (fits in 2 bytes) plus a varint count, then `deflate-raw` via the
  built-in `CompressionStream`. A 100-area-code map is well under 300 bytes.
- Opening a link renders that map read-only with a "compare with my contacts"
  button that overlays the visitor's own import (two-colour diverging scale;
  shared area codes highlighted).
- PNG export: render the current SVG to a canvas at 2x and download. Includes
  the headline stat as a caption so the image stands alone on social.

## Tech stack

| Concern | Choice | Why |
|---------|--------|-----|
| Build | **Vite** + TypeScript | Fast, boring, replaces the Parcel RC |
| UI | **React 19** | Familiar; we are not doing anything framework-specific |
| Map | **d3-geo** + **topojson-client**, rendered as SVG | No tiles, no network, tiny, fully styleable. Custom Albers projection with Alaska / Hawaii / Caribbean insets |
| Phone parsing | **libphonenumber-js** (min) | The one hard problem we should not hand-roll |
| State | React state + a small store (Zustand or plain context) | Import results and view state are small |
| Styling | CSS modules or vanilla CSS with custom properties | Drop styled-components; light/dark via `prefers-color-scheme` |
| Runtime / package manager | **Bun** | Installs, runs scripts, executes the data-pipeline scripts as plain TypeScript with no `ts-node` or build step |
| Tests | **Vitest** for parsing/encoding logic, **Playwright** for one import-to-map smoke test | Vitest shares Vite's config (aliases, jsdom); `bun test` would need a parallel setup for DOM tests |
| Lint/format | ESLint (flat config) + Prettier | Same as today, updated |
| Hosting | **GitHub Pages** via Actions | Static, free, enforces "no backend" |
| Offline | `vite-plugin-pwa` | Service worker + manifest with one plugin |

Bun 1.x as the package manager and script runner (drop yarn v1, `nle.sh`,
`local.nix`, `.envrc`). Vite still does the bundling; Bun's own bundler is not
a drop-in for Vite's plugin ecosystem (PWA plugin, HMR). If Bun ever misbehaves
on a dependency, `npm i` against the same `package.json` is the escape hatch.
CI uses `oven-sh/setup-bun`.

## Repository layout (target)

```
scripts/
  build-shapes.ts         mapshaper → TopoJSON, assigns shapeId (run with bun)
  build-areacodes.ts      NANPA CSV → areacodes.json, validates join (run with bun)
src/
  data/                   shapes.topo.json, areacodes.json, cities.json (curated)
  lib/
    phone/                extract.ts, parse.ts, vcard.ts, csv.ts, picker.ts
    share/                encode.ts, decode.ts
    geo/                  projection.ts, shapes.ts
    stats.ts
  components/
    Map/                  Map.tsx, Region.tsx, Insets.tsx, Tooltip.tsx
    Import/               ImportPanel.tsx, PasteImport.tsx, FileImport.tsx, PickerImport.tsx
    Results/              RankedList.tsx, StatsCards.tsx, RegionDetail.tsx
    Share/                ShareBar.tsx, CompareBanner.tsx
    Search/
  App.tsx, main.tsx
tests/                    vitest specs next to lib/, playwright/ for e2e
```

## Phases

Each phase ends with a deployable site. Order chosen so the risky parts
(geometry pipeline, phone parsing) are de-risked first.

### Phase 0 — Reset the scaffold
- New Vite + React + TS project in place; remove Parcel, styled-components,
  react-router, nix/direnv files, yarn.lock, `.envrc`, `nle.sh`.
- ESLint flat config, Prettier, Vitest, GitHub Actions: lint + typecheck + test
  on PR, build + deploy to Pages on `main`.
- README rewrite with the pitch and privacy statement.
- **Done when**: empty app deploys to GitHub Pages from CI.

### Phase 1 — Data pipeline
- `build-shapes.ts`: simplify + TopoJSON + `shapeId`. Commit output.
- `build-areacodes.ts`: download NANPA CSV, produce `areacodes.json`, fail on
  unmapped active NPAs. Commit output.
- Curated `cities.json` (top 1–3 cities per NPA). Start with the ~100 most
  populous and fill in over time.
- Remove the two large GeoJSON files from the tree.
- **Done when**: every active NPA resolves to a shape and a region name; bundle
  data ≤ 500 KB gzipped.

### Phase 2 — The map (finishes the original README TODO)
- Projection with insets; SVG render; pan/zoom (`d3-zoom`).
- Hover tooltip, click → detail panel (region, overlays, cities, in-service year).
- Search box: by NPA prefix, city, state/province. Result click zooms the map.
- Overlay handling: one shape, label lists all NPAs in the complex.
- Responsive: map on top on phones, side-by-side on desktop. Light/dark.
- **Done when**: you can find any area code by number or place and see it on
  the map on a phone and a laptop.

### Phase 3 — Import your contacts
- Phone extraction + normalisation with unit tests against ugly real-world
  strings (`(919) 555-0100`, `+1 919.555.0100 ext 4`, `1-919-555-0100`,
  `9195550100`, numbers embedded in notes).
- Paste import, then vCard, then CSV, then Contact Picker.
- Choropleth colour scale by count; ranked list; click region → names (in
  memory).
- Stats cards.
- Privacy UI: badge, explainer, forget button, opt-in persistence.
- **Done when**: a Google Contacts export and an iCloud vCard export both
  produce a correct map with zero network requests after page load (verified
  in devtools and by a Playwright test that fails on any fetch).

### Phase 4 — Share
- Hash encoding/decoding with round-trip tests.
- Copy-link, open-link (read-only view), compare mode.
- PNG export.
- **Done when**: two people can exchange links and see a comparison map.

### Phase 5 — Polish and ship
- PWA + offline; strict CSP meta tag; Lighthouse pass.
- Accessibility: keyboard navigation of regions, ARIA on the list, colour scale
  with a pattern or label fallback.
- Empty states and onboarding copy ("try pasting a few numbers").
- Optional nice-to-haves if time allows: animated "reveal" when a map loads,
  per-state roll-up view, "area codes I have vs. area codes near me."

## Risks and how the plan handles them

| Risk | Mitigation |
|------|-----------|
| Stale geometry as new splits happen | Build-time check for unmapped NPAs (currently 0 after the 721 polygon); documented manual shape refresh; centroid fallback renderer |
| Contact Picker API is mobile-only and permission-gated | It is one of four import paths and only shown when available |
| Phone strings are messy | `libphonenumber-js` plus a test corpus built from real exports; unrecognised numbers reported as a count |
| Users distrust "client-side only" claims | CSP with no `connect-src`, offline mode, a test that fails on any post-load network call, open source |
| SVG performance with 336 complex shapes on mobile | Simplify aggressively; render at one detail level; only re-render on data change, not on pan |
| Caribbean / Alaska / Hawaii layout | Inset panels, same approach as standard US Albers maps |

## Decisions I made that you may want to revisit

- **Vite + React** over something lighter (Svelte, Solid). React is the least
  surprising choice and the app is small enough that it does not matter much.
- **SVG over Canvas/WebGL** for the map. 336 simplified shapes is comfortably
  within SVG territory and it makes hover, focus, and styling trivial.
- **Keep the polygons** rather than scrapping the dataset. The overlay finding
  makes them cheap to keep and the choropleth is the whole point.
- **Bun over yarn/npm**, **drop nix**. Bun handles install + scripts; Vite and
  Vitest stay. Easy to undo.
- **Counts only in share links**, never names or numbers, even hashed. Keeps
  the privacy claim simple to state and simple to verify.

## Immediate next steps (Phase 0 kickoff)

1. Scaffold Vite + React + TS with Bun in this repo; delete the old toolchain files.
2. Add lint/typecheck/test/deploy workflows; enable GitHub Pages on the repo.
3. Write `scripts/build-shapes.ts` and check the first TopoJSON output.
4. Write `scripts/build-areacodes.ts` against the NANPA CSV (already verified
   downloadable and current) and draw the Sint Maarten polygon.
