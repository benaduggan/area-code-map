import { useMemo } from "react";
import { getAreaCode, type AreaCode } from "../../lib/areacodes";
import type { ImportResult } from "../../lib/contacts";
import { computeStats } from "../../lib/stats";
import { AreaCodeCard } from "../Detail/AreaCodeCard";
import "./ResultsPanel.css";

interface Props {
  result: ImportResult;
  selectedCode: AreaCode | null;
  onSelectCode: (code: AreaCode) => void;
  onForget: () => void;
  remember: boolean;
  onRememberChange: (on: boolean) => void;
}

export function ResultsPanel({
  result,
  selectedCode,
  onSelectCode,
  onForget,
  remember,
  onRememberChange,
}: Props) {
  const stats = useMemo(() => computeStats(result), [result]);
  const ranked = useMemo(
    () =>
      [...result.counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([npa, count]) => ({ code: getAreaCode(npa)!, count }))
        .filter((r) => r.code),
    [result],
  );
  const { summary } = result;

  return (
    <section className="results">
      <div className="panel-head">
        <h2 className="panel-title">Your map</h2>
        <button type="button" className="link" onClick={onForget}>
          Forget everything
        </button>
      </div>

      <div className="stat-grid">
        <Stat value={summary.nanp} label="numbers" />
        <Stat value={result.counts.size} label="area codes" />
        <Stat
          value={stats.regions}
          label={stats.regions === 1 ? "state or province" : "states & provinces"}
        />
        {stats.countries > 1 && <Stat value={stats.countries} label="countries" />}
      </div>

      <ul className="facts">
        {stats.top && (
          <li>
            Most common: <strong>{stats.top.npa}</strong> ({stats.top.regionName}), {stats.topCount}{" "}
            {stats.topCount === 1 ? "number" : "numbers"}
          </li>
        )}
        {stats.oldest && (
          <li>
            Oldest code you know: <strong>{stats.oldest.npa}</strong>, in service since{" "}
            {stats.oldest.inService}
          </li>
        )}
        {stats.newest && stats.newest.inService >= 2010 && (
          <li>
            Newest: <strong>{stats.newest.npa}</strong>, added in {stats.newest.inService}
          </li>
        )}
        {(summary.foreign > 0 || summary.unrecognised > 0) && (
          <li className="muted">
            Not mapped: {summary.foreign > 0 && `${summary.foreign} outside North America`}
            {summary.foreign > 0 && summary.unrecognised > 0 && ", "}
            {summary.unrecognised > 0 && `${summary.unrecognised} unrecognised`}
          </li>
        )}
      </ul>

      <label className="remember">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => onRememberChange(e.target.checked)}
        />
        Remember my counts on this device (never names or numbers)
      </label>

      <h3 className="panel-title">By area code</h3>
      <div className="card-list">
        {ranked.map(({ code, count }) => (
          <AreaCodeCard
            key={code.npa}
            code={code}
            selected={selectedCode?.npa === code.npa}
            onSelect={onSelectCode}
            badge={count}
            extra={
              selectedCode?.npa === code.npa && result.names.get(code.npa)?.length ? (
                <span className="card-names">{result.names.get(code.npa)!.join(", ")}</span>
              ) : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="stat">
      <span className="stat-value">{value.toLocaleString()}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
