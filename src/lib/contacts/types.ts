/** A contact as extracted from any import source. Lives in memory only. */
export interface Contact {
  name: string | null;
  /** Raw phone strings exactly as found. */
  phones: string[];
}

export type ImportSource = "paste" | "vcard" | "csv" | "picker";

/** A single parsed phone number that belongs to the North American Numbering Plan. */
export interface NanpNumber {
  e164: string;
  npa: string;
}

export interface ImportSummary {
  source: ImportSource;
  /** Contacts seen (rows / vCards / picked entries). */
  contacts: number;
  /** Distinct phone numbers after normalisation. */
  numbers: number;
  /** Distinct +1 numbers with a recognised area code. */
  nanp: number;
  /** Distinct numbers outside +1. */
  foreign: number;
  /** Strings that looked like phone numbers but could not be parsed, or +1 numbers with an unknown NPA. */
  unrecognised: number;
}

/**
 * Everything the app keeps about an import. `counts` is the only part that is
 * ever persisted or shared; `names` stays in memory for the session.
 */
export interface ImportResult {
  summary: ImportSummary;
  counts: Map<string, number>;
  /** Per area code: each contact name seen there and how many of that code's numbers belong to it. Sorted by name. */
  names: Map<string, NamedCount[]>;
  /** What could not be mapped, so the user can see why. Memory only, never persisted. */
  skipped: SkippedNumbers;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface SkippedNumbers {
  /** E.164 numbers outside +1. */
  foreign: string[];
  /** Raw strings that did not parse, or +1 numbers with an unknown area code. */
  unrecognised: string[];
}
