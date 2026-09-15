# Notes for Claude

Read [CONTRIBUTING.md](CONTRIBUTING.md) — it is the real guide, and everything
below is either a pointer into it or a mistake that is easy to make here.

Hometowns is a static, fully client-side map of the area codes in your contacts.
Bun, Vite, React 19, TypeScript. No server, no runtime dependencies that touch
the network.

## Before saying you're done

```sh
bun run check    # typecheck, lint, format check, unit tests
```

Use `bun`, never `npm` or `yarn`. If you touched the map, the import flow, or
sharing, also run `bun run build && bun run e2e` (needs `CHROME_PATH` set to a
Chromium binary).

## Never add a network call

The privacy promise is enforced by CSP and by `e2e/privacy.e2e.ts`, which fails
on _any_ request that leaves the page. No CDN fonts or scripts, no telemetry, no
dependency that phones home. A change that trips that check is the thing that's
wrong.

## All user-facing copy goes in `src/lib/i18n/en.ts`

No string that a person reads belongs in a component — that includes
`aria-label`, `title`, `placeholder`, and error messages. In components use
`useI18n()`; elsewhere take the translator as a parameter.

When you add a key, add it to **every** dictionary (`en.ts` and `es.ts`) and
then run `bun run i18n:bless`, or the drift test will fail. When you _reword_
an existing English message, update the translations too — `typecheck` cannot
see that one, which is exactly why the drift check exists.

Do not run `bun run i18n:bless` to make a failing test pass. It re-stamps
translations as current; if they haven't actually been re-translated, blessing
hides the problem instead of fixing it. If you can't translate a message
faithfully, say so and leave the test failing.

## Two things that look like bugs but aren't

- `useI18n` throws outside `<I18nProvider>`. That's deliberate. Tests render via
  `renderWithI18n` from `src/test/render`, not `@testing-library/react` directly.
- `src/data/*.json` is committed but generated. Don't hand-edit it; regenerate
  with `bun run data:build`.

## Existing copy has a voice

"Where your people started.", "Light up your map", "whose people you have in
common." New copy should sound like a person wrote it, not like UI microcopy.
Match what's already in `en.ts` before inventing a new register.
