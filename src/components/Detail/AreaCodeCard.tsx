import { displayCities, type AreaCode } from "../../lib/areacodes";
import { useI18n } from "../../lib/i18n";
import "./AreaCodeCard.css";

interface Props {
  code: AreaCode;
  selected?: boolean;
  onSelect?: (code: AreaCode) => void;
  /** Extra line, e.g. contact names, rendered under the cities. */
  extra?: React.ReactNode;
  /** A count shown at the right edge. */
  badge?: number;
  /** The other person's count in compare mode. */
  badgeSecondary?: number;
}

export function AreaCodeCard({ code, selected, onSelect, extra, badge, badgeSecondary }: Props) {
  const { t, n } = useI18n();
  const cities = displayCities(code);
  const siblings = code.overlayComplex.filter((s) => s !== code.npa);
  return (
    <button
      type="button"
      className={"card" + (selected ? " is-selected" : "")}
      onClick={() => onSelect?.(code)}
      aria-pressed={selected}
    >
      <span className="card-npa">{code.npa}</span>
      <span className="card-body">
        <span className="card-title">{cities.length ? cities.join(", ") : code.regionName}</span>
        <span className="card-meta">
          {code.regionName}
          {code.country !== "US" && code.country !== "CA" ? "" : ` · ${code.country}`}
          {" · "}
          {t("card.since", { year: code.inService })}
          {siblings.length > 0 && ` · ${t("card.overlays", { list: siblings.join(", ") })}`}
        </span>
        {extra}
      </span>
      {badge !== undefined && (
        <span className="card-badge">
          {n(badge)}
          {badgeSecondary !== undefined && (
            <span className="card-badge-secondary"> · {n(badgeSecondary)}</span>
          )}
        </span>
      )}
    </button>
  );
}
