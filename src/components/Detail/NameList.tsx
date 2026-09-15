import type { ImportResult } from "../../lib/contacts";

interface Props {
  result: ImportResult;
  npa: string;
}

/**
 * "Glenn Duggan (3), Jane Doe, and 2 unnamed numbers": names with a count when
 * one contact has several numbers in the area code, plus the numbers that
 * arrived without a name (pasted text, nameless vCards).
 */
export function NameList({ result, npa }: Props) {
  const names = result.names.get(npa) ?? [];
  const total = result.counts.get(npa) ?? 0;
  const named = names.reduce((sum, n) => sum + n.count, 0);
  const unnamed = Math.max(0, total - named);
  if (names.length === 0 && unnamed === 0) return null;

  const parts = names.map((n) => (n.count > 1 ? `${n.name} (${n.count})` : n.name));
  let text = parts.join(", ");
  if (unnamed > 0) {
    const tail = `${unnamed} unnamed ${unnamed === 1 ? "number" : "numbers"}`;
    text = parts.length ? `${text}, and ${tail}` : tail;
  }
  return <span className="card-names">{text}</span>;
}
