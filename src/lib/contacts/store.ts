import type { ImportResult } from "./types";

/**
 * Opt-in persistence of an import in this browser's localStorage: counts,
 * names and the summary. Local storage never leaves the device and is not
 * synced by the browser to any account. Every access is wrapped because
 * storage can be unavailable (private mode, blocked site data).
 */
const KEY = "area-code-map:import:v2";
const LEGACY_KEY = "area-code-map:counts:v1";
const OPT_IN_KEY = "area-code-map:remember";

interface Stored {
  summary: ImportResult["summary"];
  counts: Record<string, number>;
  names: Record<string, string[]>;
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
      if (result) saveResult(result);
    } else {
      localStorage.removeItem(OPT_IN_KEY);
      clearStored();
    }
  } catch {
    /* storage unavailable */
  }
}

export function saveResult(result: ImportResult): void {
  try {
    if (!isRememberEnabled()) return;
    const stored: Stored = {
      summary: result.summary,
      counts: Object.fromEntries(result.counts),
      names: Object.fromEntries(result.names),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    /* storage unavailable */
  }
}

export function loadResult(): ImportResult | null {
  try {
    if (!isRememberEnabled()) return null;
    const raw = localStorage.getItem(KEY);
    if (!raw) return loadLegacyCounts();
    const parsed = JSON.parse(raw) as Partial<Stored>;
    const counts = new Map<string, number>();
    for (const [k, v] of Object.entries(parsed.counts ?? {})) {
      if (/^\d{3}$/.test(k) && Number.isInteger(v) && v > 0) counts.set(k, v);
    }
    if (!counts.size) return null;
    const names = new Map<string, string[]>();
    for (const [k, v] of Object.entries(parsed.names ?? {})) {
      if (counts.has(k) && Array.isArray(v))
        names.set(
          k,
          v.filter((n) => typeof n === "string"),
        );
    }
    const nanp = [...counts.values()].reduce((a, b) => a + b, 0);
    const summary = {
      source: "paste" as const,
      contacts: 0,
      numbers: nanp,
      nanp,
      foreign: 0,
      unrecognised: 0,
      ...parsed.summary,
    };
    return { summary, counts, names, skipped: { foreign: [], unrecognised: [] } };
  } catch {
    return null;
  }
}

/** Reads the counts-only format from before names were stored. */
function loadLegacyCounts(): ImportResult | null {
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { counts?: Record<string, number> };
  const counts = new Map<string, number>();
  for (const [k, v] of Object.entries(parsed.counts ?? {})) {
    if (/^\d{3}$/.test(k) && Number.isInteger(v) && v > 0) counts.set(k, v);
  }
  if (!counts.size) return null;
  const nanp = [...counts.values()].reduce((a, b) => a + b, 0);
  return {
    summary: { source: "paste", contacts: 0, numbers: nanp, nanp, foreign: 0, unrecognised: 0 },
    counts,
    names: new Map(),
    skipped: { foreign: [], unrecognised: [] },
  };
}

export function clearStored(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* storage unavailable */
  }
}
