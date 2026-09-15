# Contributing

Thanks for taking a look. This is a small, deliberately dependency-light static
site — no server, no build-time API calls, no analytics. Most of the rules below
exist to keep it that way.

## Getting started

Requires [Bun](https://bun.sh). (There is also a `default.nix` / `.envrc` if you
use direnv.)

```sh
bun install
bun run dev          # dev server
bun run check        # typecheck, lint, format check, unit tests
```

`bun run check` is what CI runs, give or take the build and the end-to-end pass.
Run it before opening a PR.

| Script               | What it does                                                |
| -------------------- | ----------------------------------------------------------- |
| `bun run dev`        | Vite dev server                                             |
| `bun run check`      | typecheck + lint + format check + unit tests                |
| `bun run build`      | production build to `dist/`                                 |
| `bun run e2e`        | privacy end-to-end check against the build (needs Chromium) |
| `bun run format`     | Prettier, write mode                                        |
| `bun run data:build` | regenerate `src/data` from `data/source`                    |
| `bun run i18n:bless` | re-stamp `translations.lock.json` after re-translating      |

For `bun run e2e` locally, point `CHROME_PATH` at a Chromium binary; CI uses
`playwright install chromium`.

## The privacy constraint

The app's central promise is that contacts never leave the browser, and it is
enforced, not just documented:

- The page ships a Content-Security-Policy (see `vite.config.ts`) that refuses
  connections to any other origin.
- `e2e/privacy.e2e.ts` drives a real build through import, search, share, and
  image export, and **fails if the page makes any network request** that is not
  to the preview server itself.

So: no runtime dependency that phones home, no font or script loaded from a CDN,
no telemetry. If a change makes the e2e check fail on a network request, the
change is wrong, not the check.

## Copy and translations

Every user-facing string lives in `src/lib/i18n/en.ts`, a flat dictionary of
dotted keys. Nothing else in the app holds English text, so editing copy means
editing that one file.

Components read it through `useI18n()`:

```tsx
const { t, tx, tn, n, locale } = useI18n();

t("results.title"); // "Your map"
t("card.since", { year: 1947 }); // "since 1947"
tx("home.summary", { npa: <strong>919</strong> }); // a ReactNode, sentence intact
tn("map.numbers", 2); // "2 numbers" (Intl.PluralRules)
n(1234); // "1,234" / "1234", per locale
```

Two conventions worth following:

- **Use `tx` rather than splitting a sentence around markup.** A message broken
  into `"You have "` + `<strong>{n}</strong>` + `" numbers"` forces English word
  order on every other language. `tx` takes elements as placeholders and keeps
  the sentence whole.
- **Give a plural its own `foo.one` / `foo.other` pair** instead of a ternary at
  the call site. Plural rules are the translator's to decide, not the
  component's.

Place names (cities, states, provinces) come from NANPA and stay as they are;
country names come from `Intl.DisplayNames` and localise themselves.

Non-component code takes the translator as an argument rather than reaching for
a global — see `describeHome(npa, t)` in `src/lib/home.ts`.

### Editing copy

Edit `en.ts` and the translations do **not** update themselves — there is no
model in the loop. What you get instead is a check for every way they can fall
out of step:

| Change to `en.ts`              | Caught by                                              |
| ------------------------------ | ------------------------------------------------------ |
| Add, delete, or rename a key   | `bun run typecheck` — `Messages` is typed from `en.ts` |
| Change a `{placeholder}`       | `bun run test` — placeholder parity                    |
| **Reword an existing message** | `bun run test` — drift check, see below                |

That last one is the case types can't see: the translation still has a string
for the key, just the old one. `translations.lock.json` records a fingerprint of
the English each translation was made from, so rewording English fails the test
with the specific keys:

```
English was reworded since these were translated:
  results.title
  results.forget

Re-translate them in es.ts, then run: bun run i18n:bless es
```

So the loop is: edit `en.ts` → run `bun run check` → it names what went stale →
fix those messages in each locale → `bun run i18n:bless` to re-stamp.

**Only run `bless` once the translation actually reflects the new English.** It
is not a way to quiet the test; blessing a stale translation hides exactly the
problem the lock file exists to surface.

### Adding a locale

1. Copy `src/lib/i18n/es.ts`, translate the values, and keep every key.
2. Add it to `LOCALE_NAMES` and `DICTIONARIES` in `src/lib/i18n/dictionaries.ts`.
3. `bun run i18n:bless <locale>`.

The header selector, the drift check, and the parity tests all read that
registry, so there is nothing else to wire up.

The English copy has a deliberate voice ("Where your people started.", "Light up
your map"). Machine translation flattens that into something serviceable and
dead — a new locale is worth a native-speaker read before it ships.

Two known limits, both cheap to lift when something needs them:

- **Plurals are one/other only.** `Messages` requires exactly the English keys,
  so a locale needing `.few` / `.many` (Russian, Polish, Arabic) can't add them
  without widening the type. `tn` already looks up whatever category
  `Intl.PluralRules` returns, so only the type is in the way.
- **No RTL.** Arabic or Hebrew would need a `dir` attribute and a pass over the
  CSS to replace physical properties with logical ones.

## Data

`src/data/*.json` is generated — don't hand-edit it. It is committed so the app
builds without network access, and regenerated from `data/source` with:

```sh
bun run data:build      # shapes + area codes
bun run data:areacodes --fetch   # re-pull the NANPA report first
```

See the README for where each dataset comes from.

## Tests

Unit tests live next to what they cover (`foo.ts` → `foo.test.ts`). Components
read copy from the i18n context, so render them with the helper rather than
`@testing-library/react` directly:

```tsx
import { renderWithI18n as render } from "../../test/render";
```

`useI18n` throws outside the provider on purpose — a component rendered without
one would otherwise quietly ship untranslated.

## Style

Prettier and ESLint settle formatting and lint; `bun run format` before you
commit, or let `bun run check` tell you. Beyond that, match the surrounding
code — comments in this repo tend to explain _why_ a thing is the way it is
rather than restate the code, and that is worth keeping.
