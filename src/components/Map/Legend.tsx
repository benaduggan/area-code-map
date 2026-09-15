import type { CountScale } from "../../lib/choropleth";
import "./Legend.css";

interface Props {
  scale: CountScale;
  ramp: readonly string[];
}

export function Legend({ scale, ramp }: Props) {
  return (
    <div className="legend" aria-label="Contacts per area code">
      <span className="legend-title">Numbers</span>
      {scale.labels.map((label, i) => (
        <span key={label} className="legend-item">
          <span className="legend-swatch" style={{ background: ramp[i] }} />
          {label}
        </span>
      ))}
    </div>
  );
}
