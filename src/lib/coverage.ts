/**
 * Which area codes serve which polygon, and vice versa.
 *
 * Two facts about the data make this more than a lookup:
 * - Many overlay codes were drawn as exact copies of the parent polygon, so
 *   several shapes share one footprint.
 * - Some overlays (917, 878, 778, 587) were drawn as the union of the codes
 *   they overlay, and some codes drawn separately (213/323, 480/602/623) have
 *   since become a single overlay complex.
 *
 * NANPA's overlay complex is the truth for "serves the same area", so a code
 * is on a shape when it is joined onto that footprint or when it shares a
 * complex with a code that owns a shape in the footprint.
 */
import { areaCodes, getAreaCode, type AreaCode } from "./areacodes";
import { SHAPES, getShape } from "./geo/model";

const shapesByFootprint = new Map<string, string[]>();
for (const s of SHAPES) {
  shapesByFootprint.set(s.footprint, [...(shapesByFootprint.get(s.footprint) ?? []), s.id]);
}

const codesByFootprint = new Map<string, AreaCode[]>();
const shapesByCode = new Map<string, string[]>();

for (const [footprint, owners] of shapesByFootprint) {
  const ownerSet = new Set(owners);
  const codes = areaCodes.filter(
    (a) =>
      a.shapeIds.some((id) => ownerSet.has(id)) ||
      a.overlayComplex.some((npa) => ownerSet.has(npa)),
  );
  codes.sort((a, b) => a.npa.localeCompare(b.npa));
  codesByFootprint.set(footprint, codes);
  for (const a of codes) {
    shapesByCode.set(a.npa, [...(shapesByCode.get(a.npa) ?? []), ...owners]);
  }
}

/** Every area code that serves the polygon (its whole overlay complex). */
export function codesOnShape(shapeId: string): readonly AreaCode[] {
  const s = getShape(shapeId);
  return (s && codesByFootprint.get(s.footprint)) ?? [];
}

/** The code the polygon was drawn for, falling back to the first code on it. */
export function primaryCodeOnShape(shapeId: string): AreaCode | undefined {
  return getAreaCode(shapeId) ?? codesOnShape(shapeId)[0];
}

/** Every shape an area code should paint, including shapes it shares via its complex. */
export function shapesForCode(npa: string): readonly string[] {
  return shapesByCode.get(npa) ?? getAreaCode(npa)?.shapeIds ?? [];
}

/** Sum a per-NPA count map onto shapes. */
export function countsByShape(counts: ReadonlyMap<string, number>): Map<string, number> {
  const out = new Map<string, number>();
  for (const s of SHAPES) {
    let total = 0;
    for (const a of codesOnShape(s.id)) total += counts.get(a.npa) ?? 0;
    if (total > 0) out.set(s.id, total);
  }
  return out;
}
