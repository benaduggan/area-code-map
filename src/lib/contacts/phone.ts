import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { isAreaCode } from "../areacodes";
import type { NanpNumber } from "./types";

/**
 * Loose candidate matcher for free text: runs of digits with optional
 * punctuation, at least 7 digits total. Filtering happens in parseNanp.
 */
const CANDIDATE = /(?:\+?\(?\d[\d\s().-]{5,}\d)/g;

export function extractPhoneCandidates(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(CANDIDATE)) {
    const digits = m[0].replace(/\D/g, "");
    if (digits.length >= 7 && digits.length <= 15) out.push(m[0].trim());
  }
  return out;
}

export type ParsedNumber =
  | { kind: "nanp"; number: NanpNumber }
  | { kind: "foreign"; e164: string }
  | { kind: "unrecognised" };

/** Strip common vCard/URI wrappers and extension suffixes before parsing. */
export function cleanPhoneString(raw: string): string {
  return raw
    .replace(/^tel:/i, "")
    .replace(/;.*$/, "") // tel URI params
    .replace(/\s*(?:ext\.?|x|extension|#)\s*\d+\s*$/i, "")
    .trim();
}

/**
 * Parse one raw phone string with US as the default region. Returns the NPA
 * for +1 numbers whose area code is in service, flags other countries, and
 * calls everything else unrecognised.
 */
export function parseNumber(raw: string): ParsedNumber {
  const cleaned = cleanPhoneString(raw);
  if (!cleaned) return { kind: "unrecognised" };
  const parsed = parsePhoneNumberFromString(cleaned, "US");
  if (!parsed) return { kind: "unrecognised" };
  if (parsed.countryCallingCode !== "1") return { kind: "foreign", e164: parsed.number };
  const national = parsed.nationalNumber;
  if (national.length !== 10) return { kind: "unrecognised" };
  const npa = national.slice(0, 3);
  if (!isAreaCode(npa)) return { kind: "unrecognised" };
  return { kind: "nanp", number: { e164: parsed.number, npa } };
}
