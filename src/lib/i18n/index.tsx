/**
 * A tiny i18n layer: no dependency, no runtime parser, no network.
 *
 * Copy lives in one flat dictionary per locale (`en.ts` is the source of
 * truth). `t` returns a string, `tx` returns a ReactNode so a message can take
 * `<strong>` or a link as a placeholder without splitting the sentence, and
 * `tn` picks a plural form with Intl.PluralRules. Keys are typed, so a typo or
 * a message dropped from a translation fails `bun run typecheck`.
 */
import { Fragment, createContext, useContext, type ReactNode } from "react";
import {
  DICTIONARIES,
  LOCALE_NAMES,
  type Locale,
  type MessageKey,
  type PluralKey,
} from "./dictionaries";
import { en } from "./en";

export {
  DICTIONARIES,
  LOCALES,
  LOCALE_NAMES,
  SOURCE_LOCALE,
  type Locale,
  type MessageKey,
  type Messages,
  type PluralKey,
} from "./dictionaries";

export type Params = Record<string, string | number>;
export type NodeParams = Record<string, ReactNode>;

const TOKEN = /\{(\w+)\}/g;

function fill(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(TOKEN, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

function fillNodes(template: string, params?: NodeParams): ReactNode {
  if (!params) return template;
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of template.matchAll(TOKEN)) {
    const name = match[1]!;
    if (!(name in params)) continue;
    const at = match.index;
    if (at > last) parts.push(template.slice(last, at));
    parts.push(params[name]);
    last = at + match[0].length;
  }
  if (last === 0) return template;
  if (last < template.length) parts.push(template.slice(last));
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>{part}</Fragment>
      ))}
    </>
  );
}

export interface Translator {
  locale: Locale;
  /** A message as a plain string. */
  t: (key: MessageKey, params?: Params) => string;
  /** A message as a ReactNode, so placeholders can be elements. */
  tx: (key: MessageKey, params?: NodeParams) => ReactNode;
  /** The plural form of `base` for `count`, with `{count}` already filled in. */
  tn: (base: PluralKey, count: number, params?: Params) => string;
  /** A number formatted for the locale. */
  n: (value: number) => string;
}

/**
 * A translator outside React, for tests and for helpers that are not
 * components. Components should use `useI18n` so a locale switch re-renders.
 */
export function makeTranslator(locale: Locale): Translator {
  const dict = DICTIONARIES[locale] ?? en;
  const plurals = new Intl.PluralRules(locale);

  const lookup = (key: string): string =>
    (dict as Record<string, string | undefined>)[key] ??
    (en as Record<string, string | undefined>)[key] ??
    key;

  const t = (key: MessageKey, params?: Params) => fill(lookup(key), params);

  return {
    locale,
    t,
    tx: (key, params) => fillNodes(lookup(key), params),
    tn: (base, count, params) => {
      const category = plurals.select(count);
      // The dictionaries carry one/other; anything else falls back to other.
      const exact = `${base}.${category}`;
      const template =
        (dict as Record<string, string | undefined>)[exact] ?? lookup(`${base}.other`);
      return fill(template, { count: count.toLocaleString(locale), ...params });
    },
    n: (value) => value.toLocaleString(locale),
  };
}

/**
 * The NANPA file date arrives as "MM/DD/YYYY", which reads as a different day
 * in most of the world. Show it the way the locale writes dates instead.
 */
export function formatDate(raw: string | null, locale: Locale): string {
  if (!raw) return "";
  const parts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  if (!parts) return raw;
  const [, month, day, year] = parts;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
  } catch {
    return raw;
  }
}

const STORAGE_KEY = "hometowns:locale";

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && value in LOCALE_NAMES;
}

/** A stored choice wins; otherwise the first browser language we ship. */
export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // Private mode or storage disabled: fall through to the browser language.
  }
  const preferred =
    typeof navigator === "undefined" ? [] : [...(navigator.languages ?? []), navigator.language];
  for (const tag of preferred) {
    if (!tag) continue;
    const base = tag.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return "en";
}

export interface I18nValue extends Translator {
  setLocale: (locale: Locale) => void;
}

export const I18nContext = createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}

export { STORAGE_KEY as LOCALE_STORAGE_KEY };
