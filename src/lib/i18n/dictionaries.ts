/**
 * The locale registry, kept free of React so build scripts can import it.
 *
 * Adding a language means two edits in this file: import its dictionary and
 * add it to LOCALE_NAMES and DICTIONARIES. Everything else — the header
 * selector, the drift check, the type-level key checking — picks it up.
 */
import { en } from "./en";
import { es } from "./es";

export const LOCALE_NAMES = {
  en: "English",
  es: "Español",
} as const;

export type Locale = keyof typeof LOCALE_NAMES;
export const LOCALES = Object.keys(LOCALE_NAMES) as Locale[];

export type MessageKey = keyof typeof en;
/** Every locale must define exactly the keys English defines. */
export type Messages = Record<MessageKey, string>;
/** "map.numbers" for the pair "map.numbers.one" / "map.numbers.other". */
type StripOther<K> = K extends `${infer Base}.other` ? Base : never;
export type PluralKey = StripOther<MessageKey>;

export const DICTIONARIES: Record<Locale, Messages> = { en, es };

/** English is the source every other locale is translated from. */
export const SOURCE_LOCALE: Locale = "en";
