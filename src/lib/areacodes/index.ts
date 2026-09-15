import type { AreaCode } from "./types";
import raw from "../../data/areacodes.json";

export type { AreaCode } from "./types";

interface AreaCodeFile {
  source: string;
  fileDate: string | null;
  generated: string;
  areaCodes: AreaCode[];
}

const data = raw as AreaCodeFile;

/** All in-service geographic area codes, sorted by NPA. */
export const areaCodes: readonly AreaCode[] = data.areaCodes;

/** When the NANPA source file was published (MM/DD/YYYY). */
export const areaCodeDataDate = data.fileDate;

const byNpa = new Map<string, AreaCode>(areaCodes.map((a) => [a.npa, a]));

/** Every area code whose footprint includes the given polygon. */
const byShape = new Map<string, AreaCode[]>();
for (const a of areaCodes) {
  for (const s of a.shapeIds) {
    const list = byShape.get(s) ?? [];
    list.push(a);
    byShape.set(s, list);
  }
}

export function getAreaCode(npa: string): AreaCode | undefined {
  return byNpa.get(npa);
}

export function isAreaCode(npa: string): boolean {
  return byNpa.has(npa);
}

export function areaCodesForShape(shapeId: string): readonly AreaCode[] {
  return byShape.get(shapeId) ?? [];
}

/**
 * Cities for display. Overlay codes added after the polygon was drawn often
 * have no curated cities of their own, so fall back to a sibling's list.
 */
export function displayCities(a: AreaCode): readonly string[] {
  if (a.cities.length) return a.cities;
  for (const sib of a.overlayComplex) {
    const c = byNpa.get(sib)?.cities;
    if (c?.length) return c;
  }
  return [];
}

/** "212 / 332 / 646 / 917" style label for an overlay complex. */
export function overlayLabel(a: AreaCode): string {
  return a.overlayComplex.join(" / ");
}
