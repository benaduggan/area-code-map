import type { ImportResult } from "./types";

/**
 * Opt-in persistence of aggregate counts only. Names and numbers are never
 * written anywhere. Every access is wrapped because storage can be
 * unavailable (private mode, blocked site data).
 */
const KEY = "area-code-map:counts:v1";
const OPT_IN_KEY = "area-code-map:remember";

interface Stored {
  counts: Record<string, number>;
  savedAt: string;
}

export function isRememberEnabled(): boolean {
  try {
    return localStorage.getItem(OPT_IN_KEY) === "1";
  } catch {
    return false;
  }
}

export function setRememberEnabled(on: boolean, result: ImportResult | null): void {
  try {
    if (on) {
      localStorage.setItem(OPT_IN_KEY, "1");
      if (result) saveCounts(result);
    } else {
      localStorage.removeItem(OPT_IN_KEY);
      localStorage.removeItem(KEY);
    }
  } catch {
    /* storage unavailable */
  }
}

export function saveCounts(result: ImportResult): void {
  try {
    if (!isRememberEnabled()) return;
    const stored: Stored = {
      counts: Object.fromEntries(result.counts),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    /* storage unavailable */
  }
}

export function loadCounts(): Map<string, number> | null {
  try {
    if (!isRememberEnabled()) return null;
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    const m = new Map<string, number>();
    for (const [k, v] of Object.entries(parsed.counts)) {
      if (/^\d{3}$/.test(k) && Number.isInteger(v) && v > 0) m.set(k, v);
    }
    return m.size ? m : null;
  } catch {
    return null;
  }
}

export function clearStored(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}
