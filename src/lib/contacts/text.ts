import { extractPhoneCandidates } from "./phone";
import type { Contact } from "./types";

/** Pasted free text: every phone-looking string becomes an anonymous contact. */
export function parsePastedText(text: string): Contact[] {
  return extractPhoneCandidates(text).map((p) => ({ name: null, phones: [p] }));
}
