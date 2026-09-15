/**
 * Compare mode: your counts against a shared map. Three fixed categorical
 * colors (palette slots 1, 2 and 7), validated for both surfaces.
 */
import { countsByShape } from "./coverage";

export type CompareClass = "mine" | "theirs" | "both";

export const COMPARE_LIGHT: Record<CompareClass, string> = {
  mine: "#2a78d6",
  theirs: "#eb6834",
  both: "#4a3aa7",
};

export const COMPARE_DARK: Record<CompareClass, string> = {
  mine: "#3987e5",
  theirs: "#d95926",
  both: "#9085e9",
};

export const COMPARE_LABELS: Record<CompareClass, string> = {
  mine: "Only you",
  theirs: "Only them",
  both: "Both of you",
};

export interface Comparison {
  /** Per-shape class for painting. */
  shapeClass: Map<string, CompareClass>;
  /** Per-NPA breakdown for the list. */
  mineOnly: string[];
  theirsOnly: string[];
  both: string[];
}

export function compareCounts(
  mine: ReadonlyMap<string, number>,
  theirs: ReadonlyMap<string, number>,
): Comparison {
  const mineShapes = countsByShape(mine);
  const theirShapes = countsByShape(theirs);
  const shapeClass = new Map<string, CompareClass>();
  for (const id of new Set([...mineShapes.keys(), ...theirShapes.keys()])) {
    const m = mineShapes.has(id);
    const t = theirShapes.has(id);
    shapeClass.set(id, m && t ? "both" : m ? "mine" : "theirs");
  }
  const mineOnly: string[] = [];
  const theirsOnly: string[] = [];
  const both: string[] = [];
  for (const npa of new Set([...mine.keys(), ...theirs.keys()])) {
    const m = (mine.get(npa) ?? 0) > 0;
    const t = (theirs.get(npa) ?? 0) > 0;
    (m && t ? both : m ? mineOnly : theirsOnly).push(npa);
  }
  const sort = (a: string, b: string) => a.localeCompare(b);
  return {
    shapeClass,
    mineOnly: mineOnly.sort(sort),
    theirsOnly: theirsOnly.sort(sort),
    both: both.sort(sort),
  };
}
