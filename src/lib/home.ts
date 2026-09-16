import { displayCities, getAreaCode } from "./areacodes";
import type { Translator } from "./i18n";

/**
 * "Raleigh, North Carolina" for a known code, or a gentle note for an unknown
 * one. Place names come from the data and are not translated; only the note is.
 */
export function describeHome(npa: string, t: Translator["t"]): string {
  const a = getAreaCode(npa);
  if (!a) return t("home.unknown");
  const city = displayCities(a)[0];
  if (a.regionName === a.country) return a.regionName;
  return city ? `${city}, ${a.regionName}` : a.regionName;
}
