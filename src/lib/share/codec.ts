/**
 * Share-link payload: per-area-code counts and nothing else.
 *
 * Format (before base64url): [version=1] then, for each (npa, count) pair
 * sorted by NPA: varint(delta of the NPA's index in the sorted NPA table
 * from the previous pair) varint(count). Two bytes per pair in the common
 * case, so a hundred area codes is well under 300 characters.
 */
import { areaCodes } from "../areacodes";

const VERSION = 1;
const PREFIX = "v1.";

const npaList = areaCodes.map((a) => a.npa); // sorted by NPA already
const indexByNpa = new Map(npaList.map((npa, i) => [npa, i]));

function writeVarint(out: number[], value: number): void {
  let v = value >>> 0;
  while (v >= 0x80) {
    out.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  out.push(v);
}

function readVarint(bytes: Uint8Array, pos: { i: number }): number {
  let result = 0;
  let shift = 0;
  for (;;) {
    const b = bytes[pos.i];
    if (b === undefined) throw new Error("Truncated payload");
    pos.i++;
    result |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) return result >>> 0;
    shift += 7;
    if (shift > 28) throw new Error("Varint too long");
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeCounts(counts: ReadonlyMap<string, number>): string {
  const pairs = [...counts.entries()]
    .filter(([npa, n]) => indexByNpa.has(npa) && Number.isInteger(n) && n > 0)
    .map(([npa, n]) => [indexByNpa.get(npa)!, n] as const)
    .sort((a, b) => a[0] - b[0]);
  const out: number[] = [VERSION];
  let prev = 0;
  for (const [idx, n] of pairs) {
    writeVarint(out, idx - prev);
    writeVarint(out, n);
    prev = idx;
  }
  return PREFIX + toBase64Url(Uint8Array.from(out));
}

export function decodeCounts(text: string): Map<string, number> | null {
  if (!text.startsWith(PREFIX)) return null;
  try {
    const bytes = fromBase64Url(text.slice(PREFIX.length));
    if (bytes[0] !== VERSION) return null;
    const pos = { i: 1 };
    const counts = new Map<string, number>();
    let idx = 0;
    while (pos.i < bytes.length) {
      idx += readVarint(bytes, pos);
      const n = readVarint(bytes, pos);
      const npa = npaList[idx];
      if (!npa || n <= 0) return null;
      counts.set(npa, n);
    }
    return counts.size ? counts : null;
  } catch {
    return null;
  }
}

/** Read a share payload from a URL hash like "#v1.AbC…". */
export function countsFromHash(hash: string): Map<string, number> | null {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  return h ? decodeCounts(h) : null;
}

/** Absolute URL for the current page carrying the counts in its hash. */
export function shareUrlFor(counts: ReadonlyMap<string, number>): string {
  return `${location.origin}${location.pathname}#${encodeCounts(counts)}`;
}
