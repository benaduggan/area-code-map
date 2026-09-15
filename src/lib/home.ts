import { displayCities, getAreaCode } from "./areacodes";

/** "Raleigh, North Carolina" for a known code, or a gentle note for an unknown one. */
export function describeHome(npa: string): string {
  const a = getAreaCode(npa);
  if (!a) return "We don’t know that one yet, but we’ll still mark it as yours.";
  const city = displayCities(a)[0];
  if (a.regionName === a.country) return a.regionName;
  return city ? `${city}, ${a.regionName}` : a.regionName;
}
