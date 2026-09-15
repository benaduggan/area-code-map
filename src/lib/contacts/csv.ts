import { parseCsv } from "../csv";
import { extractPhoneCandidates } from "./phone";
import type { Contact } from "./types";

const PHONE_HEADER = /phone|mobile|cell|tel|fax/i;
/** Google exports "Phone 1 - Type" next to "Phone 1 - Value"; only the value column holds numbers. */
const PHONE_HEADER_EXCLUDE = /type|label/i;
const NAME_HEADER =
  /^(name|full ?name|display ?name|first ?name|last ?name|given ?name|family ?name|nickname|file as)$/i;

/**
 * Extract contacts from a CSV export (Google Contacts, Outlook, iCloud/Numbers).
 * Uses phone-ish header names when present, otherwise treats any cell that
 * looks like a phone number as one.
 */
export function parseContactsCsv(text: string): Contact[] {
  const rows = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ""));
  const header = rows[0];
  if (!header || rows.length < 2) return [];

  const phoneCols = header
    .map((h, i) => (PHONE_HEADER.test(h) && !PHONE_HEADER_EXCLUDE.test(h) ? i : -1))
    .filter((i) => i >= 0);
  const nameCols = header
    .map((h, i) => (NAME_HEADER.test(h.trim()) ? i : -1))
    .filter((i) => i >= 0);
  // Google puts "First Name" before "Last Name"; Outlook uses "First Name","Last Name" too.
  const orderedNameCols = [...nameCols].sort((a, b) => {
    const rank = (i: number) => {
      const h = header[i]!.toLowerCase();
      if (/^(name|full|display|file)/.test(h)) return 0;
      if (/first|given|nick/.test(h)) return 1;
      if (/last|family/.test(h)) return 2;
      return 3;
    };
    return rank(a) - rank(b);
  });

  const contacts: Contact[] = [];
  for (const row of rows.slice(1)) {
    const name =
      orderedNameCols
        .map((i) => row[i]?.trim() ?? "")
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .join(" ") || null;
    const phones: string[] = [];
    if (phoneCols.length) {
      for (const i of phoneCols) {
        const cell = row[i]?.trim();
        if (!cell) continue;
        // Google separates multiple values with " ::: ".
        for (const part of cell.split(/\s*:::\s*|\s*[;\n]\s*/)) if (part) phones.push(part);
      }
    } else {
      for (const cell of row) phones.push(...extractPhoneCandidates(cell));
    }
    contacts.push({ name, phones });
  }
  return contacts;
}
