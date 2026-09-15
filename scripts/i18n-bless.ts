/**
 * Re-stamp `translations.lock.json` after re-translating drifted messages.
 *
 *   bun run i18n:bless          # every locale
 *   bun run i18n:bless es       # just one
 *
 * The lock records, per locale and key, the fingerprint of the English text
 * the translation was made from. `i18n.test.tsx` fails when English has moved
 * since — so run this only once the translation actually reflects the new
 * English, never to quiet the test.
 */
import { DICTIONARIES, LOCALES, SOURCE_LOCALE, type Locale } from "../src/lib/i18n/dictionaries";
import { fingerprint } from "../src/lib/i18n/fingerprint";

const LOCK = new URL("../src/lib/i18n/translations.lock.json", import.meta.url).pathname;

const requested = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const targets = (requested.length ? requested : LOCALES).filter(
  (l): l is Locale => l !== SOURCE_LOCALE && (LOCALES as string[]).includes(l),
);

const unknown = requested.filter((r) => !(LOCALES as string[]).includes(r));
if (unknown.length) {
  console.error(`Unknown locale(s): ${unknown.join(", ")}. Known: ${LOCALES.join(", ")}`);
  process.exit(1);
}

const existing: Record<string, Record<string, string>> = await Bun.file(LOCK)
  .json()
  .catch(() => ({}));

const source = DICTIONARIES[SOURCE_LOCALE];
const lock: Record<string, Record<string, string>> = { ...existing };

for (const locale of targets) {
  const before = existing[locale] ?? {};
  const after: Record<string, string> = {};
  let stamped = 0;
  let orphaned = 0;

  // Sorted so the file diffs cleanly when a key is added or removed.
  for (const key of Object.keys(source).sort()) {
    const mark = fingerprint(source[key as keyof typeof source]);
    if (before[key] !== mark) stamped++;
    after[key] = mark;
  }
  for (const key of Object.keys(before)) if (!(key in after)) orphaned++;

  lock[locale] = after;
  console.log(
    `${locale}: ${Object.keys(after).length} keys stamped` +
      (stamped ? `, ${stamped} updated` : ", already current") +
      (orphaned ? `, ${orphaned} orphaned key(s) dropped` : ""),
  );
}

// Drop locales that no longer exist, so the lock never outlives its dictionary.
for (const locale of Object.keys(lock)) {
  if (!(LOCALES as string[]).includes(locale)) {
    delete lock[locale];
    console.log(`${locale}: removed (no dictionary)`);
  }
}

await Bun.write(LOCK, JSON.stringify(lock, null, 2) + "\n");
console.log(`Wrote ${LOCK}`);
