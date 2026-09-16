import type { ImportResult } from "../../lib/contacts";
import { useI18n } from "../../lib/i18n";

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
  const { t, tn } = useI18n();
  const names = result.names.get(npa) ?? [];
  const total = result.counts.get(npa) ?? 0;
  const named = names.reduce((sum, n) => sum + n.count, 0);
  const unnamed = Math.max(0, total - named);
  if (names.length === 0 && unnamed === 0) return null;

  const parts = names.map((n) =>
    n.count > 1 ? t("names.withCount", { name: n.name, count: n.count }) : n.name,
  );
  let text = parts.join(", ");
  if (unnamed > 0) {
    const tail = tn("names.unnamed", unnamed);
    text = parts.length ? t("names.andTail", { names: text, tail }) : tail;
  }
  return <span className="card-names">{text}</span>;
}
