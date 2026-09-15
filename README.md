# Area Code Map

See where the people you know are from.

Drop in your contacts and watch North America light up with the area codes of
the people you know. Everything runs in your browser. Nothing is uploaded.
Share the picture, not the phone numbers.

**Live site:** https://benaduggan.github.io/area-code-map/

## What it does

- **Interactive map** of every in-service area code in the US, Canada, and the
  Caribbean, with search by number, city, state, or province.
- **Import your contacts** four ways: pick them from your phone (Chrome on
  Android, Safari on iOS), upload a vCard or CSV export, or paste anything with
  phone numbers in it.
- **Your map**: a choropleth of how many numbers you have per area code, with
  the names behind each region one click away, plus a few stats (most common,
  oldest, newest code you know).
- **Share**: copy a link that encodes only your per-area-code counts, or
  download the map as an image. Friends who open your link can add their own
  contacts and see a side-by-side comparison.
- **Works offline** once loaded, as an installable web app.

## Privacy, concretely

- This is a static site. There is no server, no database, and no account.
- Contacts are parsed in your browser tab. Raw phone numbers and names are held
  in memory only and are gone when you close the tab.
- The only thing the app keeps (and only if you tick the box) is a count per
  area code. That is also the only thing a share link contains.
- The production page ships a Content-Security-Policy that forbids the browser
  from connecting anywhere but the page's own origin, and the test suite
  includes an end-to-end check that fails if any request leaves the page
  during an import.
- The source is this repository and the site is deployed from it by GitHub
  Actions, so what you read here is what runs.

## Data sources

- **Area code metadata**: the public [NANPA NPA database](https://www.nanpa.com/reports/npa-reports)
  (`data/source/npa_report.csv`, refreshed with `bun run data:areacodes --fetch`).
- **Boundaries**: public-domain HSIP/HIFLD area code polygons from 2010,
  simplified to TopoJSON. Area codes added since then are overlays, which the
  build joins onto the polygon they share via NANPA's overlay complexes. One
  polygon (721, Sint Maarten) is hand-drawn.
- **Cities**: a curated list in `data/source/cities.json`. Pull requests welcome.

See [PLAN.md](./PLAN.md) for the design and the reasoning behind these choices.

## Development

Requires [Bun](https://bun.sh).

```sh
bun install
bun run dev          # dev server
bun run check        # typecheck, lint, format check, unit tests
bun run build        # production build to dist/
bun run e2e          # privacy end-to-end check against the build (needs Chromium)
bun run data:build   # regenerate src/data from data/source
```

## License

MIT
