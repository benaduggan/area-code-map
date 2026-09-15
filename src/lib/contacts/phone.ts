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
  | { kind: "foreign"; e164: string; country: string | null }
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

  const first = parsePhoneNumberFromString(cleaned, "US");
  if (first && first.countryCallingCode === "1") {
    const national = first.nationalNumber;
    if (national.length === 10 && isAreaCode(national.slice(0, 3))) {
      return { kind: "nanp", number: { e164: first.number, npa: national.slice(0, 3) } };
    }
  } else if (first && first.isPossible()) {
    // A "+" or "011" prefix made the country explicit.
    return { kind: "foreign", e164: first.number, country: first.country ?? null };
  }

  // Not a North American number. Contacts saved abroad often lack the "+":
  // "0044 20 …" (00 is the international prefix outside North America) or
  // just "44 20 …". Retry as international, but only accept a fully valid
  // number so a mistyped US number does not become a foreign one.
  const digits = cleaned.replace(/\D/g, "");
  const intl = digits.startsWith("00") ? digits.slice(2) : digits;
  if (intl.length >= 8 && intl.length <= 15 && !cleaned.startsWith("+")) {
    const retry = parsePhoneNumberFromString("+" + intl);
    if (retry && retry.countryCallingCode !== "1" && retry.isValid()) {
      return { kind: "foreign", e164: retry.number, country: retry.country ?? null };
    }
  }
  return { kind: "unrecognised" };
}
