import type { Contact } from "./types";

interface ContactPickerResult {
  name?: string[];
  tel?: string[];
}

interface ContactsManager {
  select(properties: string[], options?: { multiple?: boolean }): Promise<ContactPickerResult[]>;
  getProperties?(): Promise<string[]>;
}

function manager(): ContactsManager | null {
  const nav = navigator as Navigator & { contacts?: ContactsManager };
  return typeof nav.contacts?.select === "function" ? nav.contacts : null;
}

/** True on browsers with the Contact Picker API (Chrome on Android, Safari on iOS). */
export function supportsContactPicker(): boolean {
  return manager() !== null;
}

/** Opens the system contact picker. Must be called from a user gesture. */
export async function pickContacts(): Promise<Contact[]> {
  const m = manager();
  if (!m) throw new Error("Contact Picker API is not available in this browser");
  const picked = await m.select(["name", "tel"], { multiple: true });
  return picked.map((p) => ({ name: p.name?.[0] ?? null, phones: p.tel ?? [] }));
}
