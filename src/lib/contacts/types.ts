/** A contact as extracted from any import source. Lives in memory only. */
export interface Contact {
  name: string | null;
  /** Raw phone strings exactly as found. */
  phones: string[];
}

export type ImportSource = "paste" | "vcard" | "csv" | "picker" | "example";

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
  /** Distinct toll-free numbers: valid, but tied to no place. */
  nonGeographic: number;
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
  /** What could not be mapped, so the user can see why. Saved with the rest of
   * the map when "Remember on this device" is on, so it holds raw numbers. */
  skipped: SkippedNumbers;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface ForeignNumber {
  e164: string;
  /** ISO 3166-1 alpha-2 code, or null when the calling code is shared by several countries. */
  country: string | null;
}

export interface SkippedNumbers {
  /** Valid numbers outside +1, with the country they belong to. */
  foreign: ForeignNumber[];
  /** Raw strings that did not parse, or +1 numbers with an unknown area code. */
  unrecognised: string[];
  /** Valid toll-free numbers, which belong to no geographic area code. */
  nonGeographic: string[];
}
