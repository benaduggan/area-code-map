import { getAreaCode, type AreaCode } from "./areacodes";
import type { ImportResult } from "./contacts";

export interface Stats {
  regions: number;
  countries: number;
  top: AreaCode | null;
  topCount: number;
  oldest: AreaCode | null;
  newest: AreaCode | null;
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
  return { regions: regions.size, countries: countries.size, top, topCount, oldest, newest };
}
