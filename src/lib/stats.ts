import { getAreaCode, type AreaCode } from "./areacodes";
import type { ImportResult } from "./contacts";
import { shapesForCode } from "./coverage";
import { milesBetween } from "./geo/model";

export interface Stats {
  regions: number;
  /** North American countries with a mapped area code plus other countries among foreign numbers. */
  countries: number;
  /** Foreign numbers per country name, most first. */
  foreignCountries: { country: string; code: string | null; count: number }[];
  top: AreaCode | null;
  topCount: number;
  oldest: AreaCode | null;
  newest: AreaCode | null;
}

const regionNames = new Map<string, Intl.DisplayNames | null>();

function displayNamesFor(locale: string): Intl.DisplayNames | null {
  if (!regionNames.has(locale)) {
    try {
      regionNames.set(locale, new Intl.DisplayNames([locale], { type: "region" }));
    } catch {
      regionNames.set(locale, null);
    }
  }
  return regionNames.get(locale) ?? null;
}

/**
 * A country name in the caller's locale. The browser supplies the translation,
 * so no country list ships with the app. `unknownLabel` covers numbers whose
 * country we could not determine at all.
 */
export function countryName(code: string | null, locale = "en", unknownLabel?: string): string {
  if (!code) return unknownLabel ?? "Unknown country";
  try {
    return displayNamesFor(locale)?.of(code) ?? code;
  } catch {
    return code;
  }
}

export function computeStats(result: ImportResult): Stats {
  const regions = new Set<string>();
  const countries = new Set<string>();
  let top: AreaCode | null = null;
  let topCount = 0;
  let oldest: AreaCode | null = null;
  let newest: AreaCode | null = null;
  for (const [npa, count] of result.counts) {
    const a = getAreaCode(npa);
    if (!a) continue;
    regions.add(`${a.country}:${a.region}`);
    countries.add(a.country);
    if (count > topCount || (count === topCount && top && a.npa < top.npa)) {
      top = a;
      topCount = count;
    }
    if (!oldest || a.inService < oldest.inService) oldest = a;
    if (!newest || a.inService > newest.inService) newest = a;
  }

  const foreign = new Map<string | null, number>();
  for (const f of result.skipped.foreign) foreign.set(f.country, (foreign.get(f.country) ?? 0) + 1);
  const foreignCountries = [...foreign.entries()]
    .map(([code, count]) => ({ code, country: countryName(code), count }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
  for (const code of foreign.keys()) if (code) countries.add(code);

  return {
    regions: regions.size,
    countries: countries.size,
    foreignCountries,
    top,
    topCount,
    oldest,
    newest,
  };
}

export interface HomeStats {
  /** Numbers that share the user's own area code (its whole overlay complex). */
  fromHome: number;
  /** Share of all mapped numbers, 0..1. */
  fromHomeShare: number;
  /** The mapped area code farthest from home, when distances are known. */
  farthest: AreaCode | null;
  farthestMiles: number;
}

/** Facts about an import relative to the user's own area code. */
export function computeHomeStats(result: ImportResult, home: string): HomeStats {
  const homeCode = getAreaCode(home);
  const homeShape = shapesForCode(home)[0];
  const complex = new Set(homeCode?.overlayComplex ?? [home]);
  let fromHome = 0;
  let total = 0;
  let farthest: AreaCode | null = null;
  let farthestMiles = 0;
  for (const [npa, count] of result.counts) {
    total += count;
    if (complex.has(npa)) fromHome += count;
    const a = getAreaCode(npa);
    if (!a || !homeShape) continue;
    const shape = shapesForCode(npa)[0];
    const miles = shape ? milesBetween(homeShape, shape) : null;
    if (miles !== null && (miles > farthestMiles || (miles === farthestMiles && !farthest))) {
      farthest = a;
      farthestMiles = miles;
    }
  }
  return {
    fromHome,
    fromHomeShare: total ? fromHome / total : 0,
    farthest: farthestMiles > 0 ? farthest : null,
    farthestMiles,
  };
}
