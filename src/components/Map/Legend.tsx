import type { CountScale } from "../../lib/choropleth";
import { HomeIcon } from "../Icons";
import "./Legend.css";

export interface LegendItem {
  label: string;
  color: string;
  hatched?: boolean;
}

interface Props {
  /** Choropleth steps. */
  scale?: CountScale | null;
  ramp?: readonly string[];
  /** Categorical entries (compare mode). */
  items?: readonly LegendItem[];
  /** Show a "Your home" entry. */
  home?: boolean;
  /** Show a "Their home" entry (shared maps). */
  theirHome?: boolean;
  label?: string;
}

export function Legend({ scale, ramp, items, home, theirHome, label }: Props) {
  if (!scale && !items?.length && !home && !theirHome) return null;
  return (
    <div className="legend" aria-label={label ?? "Map legend"}>
      {scale && ramp && (
        <>
          <span className="legend-title">Numbers</span>
          {scale.labels.map((l, i) => (
            <span key={l} className="legend-item">
              <span className="legend-swatch" style={{ background: ramp[i] }} />
              {l}
            </span>
          ))}
        </>
      )}
      {items?.map((it) => (
        <span key={it.label} className="legend-item">
          <span
            className={"legend-swatch" + (it.hatched ? " is-hatched" : "")}
            style={{ background: it.color }}
          />
          {it.label}
        </span>
      ))}
      {home && (
        <span className="legend-item">
          <span className="legend-home">
            <HomeIcon />
          </span>
          Your home
        </span>
      )}
      {theirHome && (
        <span className="legend-item">
          <span className="legend-home is-theirs">
            <HomeIcon />
          </span>
          Their home
        </span>
      )}
    </div>
  );
}
