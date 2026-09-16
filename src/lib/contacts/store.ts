import type { ForeignNumber, ImportResult, NamedCount } from "./types";

/**
 * Opt-in persistence of an import in this browser's localStorage: counts,
 * names (with per-name counts), the summary, and the numbers that could not
 * be mapped. Local storage never leaves the device and is not synced by the
 * browser to any account. Every access is wrapped because storage can be
 * unavailable (private mode, blocked site data).
 */
const KEY = "area-code-map:import:v2";
const LEGACY_KEY = "area-code-map:counts:v1";
const OPT_IN_KEY = "area-code-map:remember";
const HOME_KEY = "area-code-map:home";

interface Stored {
  summary: ImportResult["summary"];
  counts: Record<string, number>;
  /** Older saves stored plain strings, one per name. */
  names: Record<string, (NamedCount | string)[]>;
  skipped?: ImportResult["skipped"];
  savedAt: string;
}

export function isRememberEnabled(): boolean {
  try {
    return localStorage.getItem(OPT_IN_KEY) === "1";
  } catch {
    return false;
  }
}

export function setRememberEnabled(
  on: boolean,
  result: ImportResult | null,
  home: string | null = null,
): void {
  try {
    if (on) {
      localStorage.setItem(OPT_IN_KEY, "1");
      if (result) saveResult(result);
      saveHome(home);
    } else {
      localStorage.removeItem(OPT_IN_KEY);
      clearStored();
    }
  } catch {
    /* storage unavailable */
  }
}

/** The user's own area code. Only written while remembering is on. */
export function saveHome(home: string | null): void {
  try {
    if (!isRememberEnabled()) return;
    if (home && /^\d{3}$/.test(home)) localStorage.setItem(HOME_KEY, home);
    else localStorage.removeItem(HOME_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function loadHome(): string | null {
  try {
    if (!isRememberEnabled()) return null;
    const v = localStorage.getItem(HOME_KEY);
    return v && /^\d{3}$/.test(v) ? v : null;
  } catch {
    return null;
  }
}

export function saveResult(result: ImportResult): void {
  try {
    if (!isRememberEnabled()) return;
    const stored: Stored = {
      summary: result.summary,
      counts: Object.fromEntries(result.counts),
      names: Object.fromEntries(result.names),
      skipped: result.skipped,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    /* storage unavailable */
  }
}

function readCounts(raw: unknown): Map<string, number> {
  const counts = new Map<string, number>();
  if (raw && typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (/^\d{3}$/.test(k) && Number.isInteger(v) && (v as number) > 0) counts.set(k, v as number);
    }
  }
  return counts;
}

function readNames(raw: unknown, counts: Map<string, number>): Map<string, NamedCount[]> {
  const names = new Map<string, NamedCount[]>();
  if (!raw || typeof raw !== "object") return names;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!counts.has(k) || !Array.isArray(v)) continue;
    const list: NamedCount[] = [];
    for (const entry of v as unknown[]) {
      if (typeof entry === "string") list.push({ name: entry, count: 1 });
      else if (entry && typeof entry === "object") {
        const { name, count } = entry as { name?: unknown; count?: unknown };
        if (typeof name === "string" && Number.isInteger(count) && (count as number) > 0) {
          list.push({ name, count: count as number });
        }
      }
    }
    if (list.length) names.set(k, list);
  }
  return names;
}

function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

/** Foreign numbers were plain E.164 strings before countries were recorded. */
function foreignNumbers(v: unknown): ForeignNumber[] {
  if (!Array.isArray(v)) return [];
  const out: ForeignNumber[] = [];
  for (const entry of v as unknown[]) {
    if (typeof entry === "string") out.push({ e164: entry, country: null });
    else if (entry && typeof entry === "object") {
      const { e164, country } = entry as { e164?: unknown; country?: unknown };
      if (typeof e164 === "string")
        out.push({ e164, country: typeof country === "string" ? country : null });
    }
  }
  return out;
}

function summaryFor(counts: Map<string, number>, partial?: Partial<ImportResult["summary"]>) {
  const nanp = [...counts.values()].reduce((a, b) => a + b, 0);
  return {
    source: "paste" as const,
    contacts: 0,
    numbers: nanp,
    nanp,
    foreign: 0,
    unrecognised: 0,
    nonGeographic: 0,
    ...partial,
  };
}

export function loadResult(): ImportResult | null {
  try {
    if (!isRememberEnabled()) return null;
    const raw = localStorage.getItem(KEY);
    if (!raw) return loadLegacyCounts();
    const parsed = JSON.parse(raw) as Partial<Stored>;
    const counts = readCounts(parsed.counts);
    if (!counts.size) return null;
    return {
      summary: summaryFor(counts, parsed.summary),
      counts,
      names: readNames(parsed.names, counts),
      skipped: {
        foreign: foreignNumbers(parsed.skipped?.foreign),
        unrecognised: strings(parsed.skipped?.unrecognised),
        nonGeographic: strings(parsed.skipped?.nonGeographic),
      },
    };
  } catch {
    return null;
  }
}

/** Reads the counts-only format from before names were stored. */
function loadLegacyCounts(): ImportResult | null {
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { counts?: Record<string, number> };
  const counts = readCounts(parsed.counts);
  if (!counts.size) return null;
  return {
    summary: summaryFor(counts),
    counts,
    names: new Map(),
    skipped: { foreign: [], unrecognised: [], nonGeographic: [] },
  };
}

export function clearStored(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_KEY);
    localStorage.removeItem(HOME_KEY);
  } catch {
    /* storage unavailable */
  }
}
