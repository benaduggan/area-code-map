# Area Code Map

See where the people you know are from.

Drop in your contacts and watch North America light up with the area codes of
the people you know. Everything runs in your browser. Nothing is uploaded.
Share the picture, not the phone numbers.

**Live site:** https://benaduggan.github.io/area-code-map/

## Privacy, concretely

- This is a static site. There is no server, no database, and no account.
- Your contacts are parsed in your browser tab. Raw phone numbers and names
  are held in memory only and are gone when you close the tab.
- The only thing the app keeps (and only if you ask it to) is a count per
  area code. That is also the only thing a share link contains.
- The source code is this repository, and the site is deployed from it by
  GitHub Actions, so what you read here is what runs.

## Data sources

- **Area code metadata**: the public [NANPA NPA database](https://www.nanpa.com/reports/npa-reports),
  refreshed with `bun run data:build`.
- **Boundaries**: public-domain HSIP/HIFLD area code polygons, simplified to TopoJSON.
  See [PLAN.md](./PLAN.md) for how the two are joined and kept current.

## Development

Requires [Bun](https://bun.sh).

```sh
bun install
bun run dev        # start the dev server
bun run check      # typecheck, lint, format check, tests
bun run build      # production build to dist/
```

## Roadmap

See [PLAN.md](./PLAN.md).

## License

MIT
