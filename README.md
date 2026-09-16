# Hometowns

Most people keep their first phone number. Their area code tells a story.
Drop in your contacts and see how far your contacts reach across North America.
Everything runs locally in your browser, and nothing is uploaded or scraped.

**Live site:** https://benaduggan.github.io/area-code-map/

## What it does

- **Interactive map** of every in-service area code in the US, Canada, and the Caribbean, with search by number, city, state, or province.
- **Your own area code**: you can add your area code to show your home marked on the map. Then we can show some stats are framed around it as well.
- **Import your contacts** pick them from your phone, upload a vCard or CSV export, or paste anything with phone numbers in it.
- **Your map**: a choropleth of how many numbers you have per area code, with the names behind each region.
- **Share**: copy a link that encodes only your per-area-code counts (and your own area code, if you tick the box), or download the map as an image. Friends who open your link can add their own contacts and see an interesting comparison.
- **English and Spanish**, picked from your browser and switchable from the header.

## Privacy

- This is a static site. There is no server, no database, and no accounts.
- Your contacts are parsed in your browser. By default, raw phone numbers and names are held in memory only, and are gone when you close the tab.
- Tick the box and the app saves your map to this browser's local storage: the count per area code, the names, your own area code, and any numbers it could not map. It never syncs anywhere, and "Forget everything" erases it.
- A share link can only ever carry a count per area code, plus your own area code if you choose to include it.
- The source is this repository and the site is deployed from it by GitHub Actions, so what you read here is what runs.

## Data sources

- **Area code metadata**: the public [NANPA NPA database](https://www.nanpa.com/reports/npa-reports)
  (`data/source/npa_report.csv`, refreshed with `bun run data:areacodes --fetch`).
- **Boundaries**: public-domain HSIP/HIFLD area code polygons from 2010,
  simplified to TopoJSON. Area codes added since then are overlays, which the
  build joins onto the polygon they share via NANPA's overlay complexes. One
  polygon (721, Sint Maarten) is hand-drawn.
- **Cities**: a curated list in `data/source/cities.json`.
