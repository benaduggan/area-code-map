/**
 * Sequential color scale for contact counts. One hue (blue), light -> dark on
 * a light surface and dark -> light on a dark surface so "near zero" always
 * recedes toward the page background. Steps come from the validated palette.
 */
export const CLASS_COUNT = 5;

export const LIGHT_RAMP = ["#9ec5f4", "#5598e7", "#2a78d6", "#1c5cab", "#0d366b"] as const;
export const DARK_RAMP = ["#184f95", "#256abf", "#3987e5", "#6da7ec", "#b7d3f6"] as const;

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
