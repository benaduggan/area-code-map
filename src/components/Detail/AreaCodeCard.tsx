import { displayCities, type AreaCode } from "../../lib/areacodes";
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
          {" · since "}
          {code.inService}
          {siblings.length > 0 && <> · overlays {siblings.join(", ")}</>}
        </span>
        {extra}
      </span>
      {badge !== undefined && (
        <span className="card-badge">
          {badge.toLocaleString()}
          {badgeSecondary !== undefined && (
            <span className="card-badge-secondary"> · {badgeSecondary.toLocaleString()}</span>
          )}
        </span>
      )}
    </button>
  );
}
