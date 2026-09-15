/**
 * A stable short hash of an English message.
 *
 * `translations.lock.json` records one of these per translated key: the
 * fingerprint of the English text as it read when the translation was written.
 * When the English is reworded, the fingerprint stops matching and the drift
 * test names the key. FNV-1a, so it needs no imports and behaves identically
 * in the browser, in vitest, and in a Bun script.
 */
export function fingerprint(message: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < message.length; i++) {
    hash ^= message.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
