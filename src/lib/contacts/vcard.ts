import type { Contact } from "./types";

/**
 * Parse a vCard 2.1 / 3.0 / 4.0 file into contacts. Only FN, N and TEL are
 * read. Handles folded lines, parameters, tel: URIs and quoted-printable
 * values (old Android exports).
 */
export function parseVcards(text: string): Contact[] {
  const lines = unfold(text);
  const contacts: Contact[] = [];
  let current: Contact | null = null;
  let fallbackName: string | null = null;

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper.startsWith("BEGIN:VCARD")) {
      current = { name: null, phones: [] };
      fallbackName = null;
      continue;
    }
    if (upper.startsWith("END:VCARD")) {
      if (current) {
        current.name ??= fallbackName;
        contacts.push(current);
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const head = line.slice(0, colon);
    let value = line.slice(colon + 1);
    const [rawName, ...params] = head.split(";");
    // Strip a group prefix like "item1.TEL".
    const name = (rawName ?? "").replace(/^[^.]+\./, "").toUpperCase();
    const paramText = params.join(";").toUpperCase();
    if (paramText.includes("QUOTED-PRINTABLE")) value = decodeQuotedPrintable(value);

    if (name === "FN") {
      current.name = unescapeValue(value) || current.name;
    } else if (name === "N") {
      // N:Last;First;Middle;Prefix;Suffix
      const parts = value.split(";").map(unescapeValue);
      const assembled = [parts[3], parts[1], parts[2], parts[0], parts[4]]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (assembled) fallbackName = assembled;
    } else if (name === "TEL") {
      const tel = unescapeValue(value).trim();
      if (tel) current.phones.push(tel);
    }
  }
  return contacts;
}

/** Join continuation lines (those starting with a space or tab) onto the previous line. */
function unfold(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/\r\n|\r|\n/)) {
    if ((raw.startsWith(" ") || raw.startsWith("\t")) && out.length) {
      out[out.length - 1] += raw.slice(1);
    } else if (raw.length) {
      out.push(raw);
    }
  }
  return out;
}

function unescapeValue(v: string): string {
  return v.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
}

function decodeQuotedPrintable(v: string): string {
  const bytes: number[] = [];
  const s = v.replace(/=\r?\n/g, "");
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(s.slice(i + 1, i + 3))) {
      bytes.push(parseInt(s.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(s.charCodeAt(i));
    }
  }
  try {
    return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
  } catch {
    return String.fromCharCode(...bytes);
  }
}
