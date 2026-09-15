/**
 * Share-link payload: per-area-code counts, optionally the sharer's own
 * (home) area code, and nothing else.
 *
 * v1 (before base64url): [1] then, for each (npa, count) pair sorted by NPA:
 * varint(delta of the NPA's index in the sorted NPA table from the previous
 * pair) varint(count). Two bytes per pair in the common case, so a hundred
 * area codes is well under 300 characters.
 *
 * v2 adds one varint after the version byte: the home NPA's index plus one,
 * or 0 for none. Links without a home code are still written as v1 so they
 * look exactly as they always have.
 */
import { areaCodes } from "../areacodes";

const npaList = areaCodes.map((a) => a.npa); // sorted by NPA already
const indexByNpa = new Map(npaList.map((npa, i) => [npa, i]));

export interface SharePayload {
  counts: Map<string, number>;
  /** The sharer's own area code, when they chose to include it. */
  home: string | null;
}

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

export function encodeShare(counts: ReadonlyMap<string, number>, home?: string | null): string {
  const pairs = [...counts.entries()]
    .filter(([npa, n]) => indexByNpa.has(npa) && Number.isInteger(n) && n > 0)
    .map(([npa, n]) => [indexByNpa.get(npa)!, n] as const)
    .sort((a, b) => a[0] - b[0]);
  const homeIdx = home ? indexByNpa.get(home) : undefined;
  const version = homeIdx === undefined ? 1 : 2;
  const out: number[] = [version];
  if (version === 2) writeVarint(out, homeIdx! + 1);
  let prev = 0;
  for (const [idx, n] of pairs) {
    writeVarint(out, idx - prev);
    writeVarint(out, n);
    prev = idx;
  }
  return `v${version}.` + toBase64Url(Uint8Array.from(out));
}

/** Counts only; kept for callers that never include a home code. */
export function encodeCounts(counts: ReadonlyMap<string, number>): string {
  return encodeShare(counts, null);
}

export function decodeShare(text: string): SharePayload | null {
  const m = /^v([12])\.(.*)$/s.exec(text);
  if (!m) return null;
  const version = Number(m[1]);
  try {
    const bytes = fromBase64Url(m[2] ?? "");
    if (bytes[0] !== version) return null;
    const pos = { i: 1 };
    let home: string | null = null;
    if (version === 2) {
      const h = readVarint(bytes, pos);
      if (h > 0) {
        home = npaList[h - 1] ?? null;
        if (!home) return null;
      }
    }
    const counts = new Map<string, number>();
    let idx = 0;
    while (pos.i < bytes.length) {
      idx += readVarint(bytes, pos);
      const n = readVarint(bytes, pos);
      const npa = npaList[idx];
      if (!npa || n <= 0) return null;
      counts.set(npa, n);
    }
    return counts.size ? { counts, home } : null;
  } catch {
    return null;
  }
}

export function decodeCounts(text: string): Map<string, number> | null {
  return decodeShare(text)?.counts ?? null;
}

/** Read a share payload from a URL hash like "#v1.AbC…". */
export function shareFromHash(hash: string): SharePayload | null {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  return h ? decodeShare(h) : null;
}

export function countsFromHash(hash: string): Map<string, number> | null {
  return shareFromHash(hash)?.counts ?? null;
}

/** Absolute URL for the current page carrying the payload in its hash. */
export function shareUrlFor(counts: ReadonlyMap<string, number>, home?: string | null): string {
  return `${location.origin}${location.pathname}#${encodeShare(counts, home)}`;
}
