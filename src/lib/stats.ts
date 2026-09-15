import { getAreaCode, type AreaCode } from "./areacodes";
import type { ImportResult } from "./contacts";

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

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

export function countryName(code: string | null): string {
  if (!code) return "Unknown country";
  try {
    return regionNames?.of(code) ?? code;
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
