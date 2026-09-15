import { areaCodes, type AreaCode } from "./areacodes";

interface Entry {
  code: AreaCode;
  text: string;
}

const index: Entry[] = areaCodes.map((code) => ({
  code,
  text: [code.region, code.regionName, code.country, ...code.cities].join(" ").toLowerCase(),
}));

export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Digits match NPA prefixes; text matches region codes, region names, and
 * city names. Exact NPA matches sort first, then by NPA.
 */
export function searchAreaCodes(query: string, limit = 50): AreaCode[] {
  const q = normalizeQuery(query);
  if (!q) return [];
  const results: { code: AreaCode; rank: number }[] = [];
  const digits = /^\d+$/.test(q);
  for (const { code, text } of index) {
    if (digits) {
      if (code.npa === q) results.push({ code, rank: 0 });
      else if (code.npa.startsWith(q)) results.push({ code, rank: 1 });
      else if (code.overlayComplex.some((s) => s.startsWith(q))) results.push({ code, rank: 2 });
      continue;
    }
    if (code.region.toLowerCase() === q) results.push({ code, rank: 0 });
    // One- or two-letter queries are almost certainly a state/province code;
    // substring matching them would pull in every city containing those letters.
    else if (q.length <= 2) continue;
    else if (code.regionName.toLowerCase().startsWith(q)) results.push({ code, rank: 1 });
    else if (code.cities.some((c) => c.toLowerCase().startsWith(q)))
      results.push({ code, rank: 1 });
    else if (text.includes(q)) results.push({ code, rank: 2 });
  }
  results.sort((a, b) => a.rank - b.rank || a.code.npa.localeCompare(b.code.npa));
  return results.slice(0, limit).map((r) => r.code);
}
