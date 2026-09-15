import type { CountScale } from "../../lib/choropleth";
import { useI18n } from "../../lib/i18n";
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
  const { t } = useI18n();
  if (!scale && !items?.length && !home && !theirHome) return null;
  return (
    <div className="legend" aria-label={label ?? t("legend.aria")}>
      {scale && ramp && (
        <>
          <span className="legend-title">{t("legend.numbers")}</span>
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
          {t("legend.yourHome")}
        </span>
      )}
      {theirHome && (
        <span className="legend-item">
          <span className="legend-home is-theirs">
            <HomeIcon />
          </span>
          {t("legend.theirHome")}
        </span>
      )}
    </div>
  );
}
