import { displayCities, type AreaCode } from "../../lib/areacodes";
import "./AreaCodeCard.css";

interface Props {
  code: AreaCode;
  selected?: boolean;
  onSelect?: (code: AreaCode) => void;
  /** Extra line, e.g. contact counts, rendered under the cities. */
  extra?: React.ReactNode;
}

export function AreaCodeCard({ code, selected, onSelect, extra }: Props) {
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
    </button>
  );
}
