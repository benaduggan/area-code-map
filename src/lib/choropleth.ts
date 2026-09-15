/**
 * Sequential color scale for contact counts. One hue (brand amber), light ->
 * dark on a light surface and dark -> light on a dark surface so "near zero"
 * always recedes toward the page background. Both ramps are monotone in
 * OKLCH lightness, which is what keeps them readable under color vision
 * deficiency.
 */
export const CLASS_COUNT = 5;

export const LIGHT_RAMP = ["#fde68a", "#fbbf24", "#f59e0b", "#d97706", "#92400e"] as const;
export const DARK_RAMP = ["#78350f", "#b45309", "#d97706", "#f59e0b", "#fcd34d"] as const;

export interface CountScale {
  /** Upper bound (inclusive) of each class; the last class is open-ended. */
  breaks: number[];
  labels: string[];
  classFor: (count: number) => number;
  max: number;
}

/**
 * Log-spaced class breaks so a handful of very common area codes do not wash
 * out everything else. For small maxima this degrades to 1, 2, 3, 4, 5+.
 */
export function makeCountScale(values: Iterable<number>): CountScale {
  let max = 0;
  for (const v of values) if (v > max) max = v;
  const breaks: number[] = [];
  if (max <= CLASS_COUNT) {
    for (let i = 1; i < CLASS_COUNT; i++) breaks.push(i);
  } else {
    let prev = 0;
    for (let i = 1; i < CLASS_COUNT; i++) {
      let b = Math.round(Math.pow(max, i / CLASS_COUNT));
      if (b <= prev) b = prev + 1;
      breaks.push(b);
      prev = b;
    }
  }
  const labels = breaks.map((b, i) => {
    const lo = i === 0 ? 1 : breaks[i - 1]! + 1;
    return lo === b ? `${b}` : `${lo}–${b}`;
  });
  labels.push(`${breaks[breaks.length - 1]! + 1}+`);
  const classFor = (count: number) => {
    if (count <= 0) return -1;
    for (let i = 0; i < breaks.length; i++) if (count <= breaks[i]!) return i;
    return breaks.length;
  };
  return { breaks, labels, classFor, max };
}
