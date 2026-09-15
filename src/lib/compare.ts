/**
 * Compare mode: your counts against a shared map. Three fixed categorical
 * colors: brand amber for you, blue for them, green for both. Validated for
 * CVD separation and contrast on both surfaces; "both" is also hatched.
 */
import { countsByShape } from "./coverage";
import type { MessageKey, Translator } from "./i18n";

export type CompareClass = "mine" | "theirs" | "both";

export const COMPARE_LIGHT: Record<CompareClass, string> = {
  mine: "#d97706",
  theirs: "#2a78d6",
  both: "#008300",
};

export const COMPARE_DARK: Record<CompareClass, string> = {
  mine: "#c2660a",
  theirs: "#3987e5",
  both: "#199e70",
};

const COMPARE_LABEL_KEYS: Record<CompareClass, MessageKey> = {
  mine: "compare.mine",
  theirs: "compare.theirs",
  both: "compare.both",
};

/** The three legend labels in the active locale. */
export function compareLabels(t: Translator["t"]): Record<CompareClass, string> {
  return {
    mine: t(COMPARE_LABEL_KEYS.mine),
    theirs: t(COMPARE_LABEL_KEYS.theirs),
    both: t(COMPARE_LABEL_KEYS.both),
  };
}

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
