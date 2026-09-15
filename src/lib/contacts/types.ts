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
  names: Map<string, string[]>;
}
