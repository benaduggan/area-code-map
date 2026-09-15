import { useMemo, useState } from "react";
import { displayCities, getAreaCode, type AreaCode } from "../../lib/areacodes";
import type { ImportResult } from "../../lib/contacts";
import { computeStats } from "../../lib/stats";
import { AreaCodeCard } from "../Detail/AreaCodeCard";
import { ShareBar } from "../Share/ShareBar";
import { SkippedDialog } from "./SkippedDialog";
import type { Comparison } from "../../lib/compare";
import "./ResultsPanel.css";

interface Props {
  result: ImportResult;
  selectedCode: AreaCode | null;
  onSelectCode: (code: AreaCode) => void;
  onForget: () => void;
  remember: boolean;
  onRememberChange: (on: boolean) => void;
  getSvg: () => SVGSVGElement | null;
  /** Present when comparing against a shared map. */
  comparison?: { theirs: ReadonlyMap<string, number>; result: Comparison } | null;
}

export function ResultsPanel({
  result,
  selectedCode,
  onSelectCode,
  onForget,
  remember,
  onRememberChange,
  getSvg,
  comparison,
}: Props) {
  const stats = useMemo(() => computeStats(result), [result]);
  const ranked = useMemo(() => {
    // In compare mode, codes only the other person has are listed too (with 0).
    const npas = new Set([...result.counts.keys(), ...(comparison?.theirs.keys() ?? [])]);
    return [...npas]
      .map((npa) => ({
        code: getAreaCode(npa)!,
        count: result.counts.get(npa) ?? 0,
        theirs: comparison?.theirs.get(npa) ?? 0,
      }))
      .filter((r) => r.code)
      .sort(
        (a, b) => b.count - a.count || b.theirs - a.theirs || a.code.npa.localeCompare(b.code.npa),
      );
  }, [result, comparison]);
  const { summary } = result;
  const [skippedOpen, setSkippedOpen] = useState(false);
  const skippedCount = summary.foreign + summary.unrecognised;

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
        <Stat value={stats.countries} label={stats.countries === 1 ? "country" : "countries"} />
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
            Oldest area code you know: <strong>{stats.oldest.npa}</strong> ({placeOf(stats.oldest)}
            ), in service since {stats.oldest.inService}
          </li>
        )}
        {stats.newest && stats.newest.inService >= 2010 && (
          <li>
            Newest area code: <strong>{stats.newest.npa}</strong> ({placeOf(stats.newest)}), added
            in {stats.newest.inService}
          </li>
        )}
        {skippedCount > 0 && (
          <li className="muted">
            Not mapped: {summary.foreign > 0 && `${summary.foreign} outside North America`}
            {summary.foreign > 0 && summary.unrecognised > 0 && ", "}
            {summary.unrecognised > 0 && `${summary.unrecognised} unrecognised`}
            {result.skipped.foreign.length + result.skipped.unrecognised.length > 0 && (
              <>
                {" · "}
                <button type="button" className="link" onClick={() => setSkippedOpen(true)}>
                  see which
                </button>
              </>
            )}
          </li>
        )}
      </ul>

      {comparison && (
        <ul className="facts">
          <li>
            You both know people in <strong>{comparison.result.both.length}</strong>{" "}
            {comparison.result.both.length === 1 ? "area code" : "area codes"}
            {comparison.result.both.length > 0 && `: ${comparison.result.both.join(", ")}`}
          </li>
          <li>
            Only you: {comparison.result.mineOnly.length} · Only them:{" "}
            {comparison.result.theirsOnly.length}
          </li>
        </ul>
      )}

      <ShareBar
        counts={result.counts}
        caption={`${summary.nanp} numbers across ${result.counts.size} area codes · area code map`}
        getSvg={getSvg}
      />
      <SkippedDialog
        open={skippedOpen}
        onClose={() => setSkippedOpen(false)}
        skipped={result.skipped}
      />

      <label
        className="remember"
        title="Saved in this browser's local storage on this device only. Local storage is never sent to a server or synced anywhere."
      >
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => onRememberChange(e.target.checked)}
        />
        <span>
          Remember this map on this device
          <span className="remember-hint">
            Saved in this browser&rsquo;s local storage, which never leaves your device. Use
            &ldquo;Forget everything&rdquo; to erase it.
          </span>
        </span>
      </label>

      <h3 className="panel-title">By area code</h3>
      <div className="card-list">
        {ranked.map(({ code, count, theirs }) => (
          <AreaCodeCard
            key={code.npa}
            code={code}
            selected={selectedCode?.npa === code.npa}
            onSelect={onSelectCode}
            badge={count}
            badgeSecondary={comparison ? theirs : undefined}
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

/** "St. Louis, Missouri" or just the region when no city is curated. */
function placeOf(a: AreaCode): string {
  const city = displayCities(a)[0];
  if (a.regionName === a.country) return a.regionName; // Caribbean
  return city ? `${city}, ${a.regionName}` : a.regionName;
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="stat">
      <span className="stat-value">{value.toLocaleString()}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
