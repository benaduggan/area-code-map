import { parseNumber } from "./phone";
import type { Contact, ImportResult, ImportSource, NamedCount } from "./types";

/**
 * Reduce contacts to per-area-code counts. Numbers are de-duplicated by their
 * E.164 form so a contact with the same number filed twice counts once, but a
 * contact with a home and a mobile in one area code counts twice. Each name
 * carries how many of the area code's numbers belong to it.
 */
export function aggregateContacts(contacts: Contact[], source: ImportSource): ImportResult {
  const seen = new Set<string>();
  const counts = new Map<string, number>();
  const names = new Map<string, NamedCount[]>();
  const skipped = { foreign: [] as string[], unrecognised: [] as string[] };

  for (const contact of contacts) {
    for (const raw of contact.phones) {
      const parsed = parseNumber(raw);
      if (parsed.kind === "unrecognised") {
        skipped.unrecognised.push(raw.trim());
        continue;
      }
      const key = parsed.kind === "nanp" ? parsed.number.e164 : parsed.e164;
      if (seen.has(key)) continue;
      seen.add(key);
      if (parsed.kind === "foreign") {
        skipped.foreign.push(parsed.e164);
        continue;
      }
      const { npa } = parsed.number;
      counts.set(npa, (counts.get(npa) ?? 0) + 1);
      if (contact.name) addName(names, npa, contact.name, 1);
    }
  }

  for (const list of names.values()) sortNames(list);

  const nanp = [...counts.values()].reduce((a, b) => a + b, 0);
  return {
    summary: {
      source,
      contacts: contacts.length,
      numbers: seen.size,
      nanp,
      foreign: skipped.foreign.length,
      unrecognised: skipped.unrecognised.length,
    },
    counts,
    names,
    skipped,
  };
}

/** Merge several imports (e.g. two files) into one result. Counts add; names union with counts added. */
export function mergeResults(results: ImportResult[]): ImportResult | null {
  if (results.length === 0) return null;
  if (results.length === 1) return results[0]!;
  const counts = new Map<string, number>();
  const names = new Map<string, NamedCount[]>();
  const summary = {
    ...results[0]!.summary,
    contacts: 0,
    numbers: 0,
    nanp: 0,
    foreign: 0,
    unrecognised: 0,
  };
  const skipped = { foreign: [] as string[], unrecognised: [] as string[] };
  for (const r of results) {
    skipped.foreign.push(...r.skipped.foreign);
    skipped.unrecognised.push(...r.skipped.unrecognised);
    for (const [npa, n] of r.counts) counts.set(npa, (counts.get(npa) ?? 0) + n);
    for (const [npa, list] of r.names) {
      for (const { name, count } of list) addName(names, npa, name, count);
    }
    summary.contacts += r.summary.contacts;
    summary.numbers += r.summary.numbers;
    summary.nanp += r.summary.nanp;
    summary.foreign += r.summary.foreign;
    summary.unrecognised += r.summary.unrecognised;
  }
  for (const list of names.values()) sortNames(list);
  return { summary, counts, names, skipped };
}

function addName(names: Map<string, NamedCount[]>, npa: string, name: string, count: number): void {
  const list = names.get(npa) ?? [];
  const existing = list.find((n) => n.name === name);
  if (existing) existing.count += count;
  else list.push({ name, count });
  names.set(npa, list);
}

function sortNames(list: NamedCount[]): void {
  list.sort((a, b) => a.name.localeCompare(b.name));
}
