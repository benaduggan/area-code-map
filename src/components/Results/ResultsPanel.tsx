import { useMemo, useState } from "react";
import { displayCities, getAreaCode, type AreaCode } from "../../lib/areacodes";
import type { ImportResult } from "../../lib/contacts";
import { computeHomeStats, computeStats } from "../../lib/stats";
import { COMPARE_LABELS } from "../../lib/compare";
import { AreaCodeCard } from "../Detail/AreaCodeCard";
import { NameList } from "../Detail/NameList";
import { ShareBar } from "../Share/ShareBar";
import { SkippedDialog } from "./SkippedDialog";
import type { Comparison } from "../../lib/compare";
import { InfoTip, REMEMBER_TIP } from "../InfoTip";
import { HomeRow } from "../Home/HomeRow";
import "./ResultsPanel.css";

interface Props {
  result: ImportResult;
  selectedCode: AreaCode | null;
  onSelectCode: (code: AreaCode) => void;
  onForget: () => void;
  remember: boolean;
  onRememberChange: (on: boolean) => void;
  getExportRoot: () => HTMLElement | null;
  /** Import controls, rendered above the long list so they are easy to find. */
  addMore?: React.ReactNode;
  /** Legend swatches for the exported image (count classes). */
  scaleLegend: { color: string; label: string }[];
  compareColors: Record<"mine" | "theirs" | "both", string>;
  /** Present when comparing against a shared map. */
  comparison?: { theirs: ReadonlyMap<string, number>; result: Comparison } | null;
  /** The user's own area code. */
  home: string | null;
  onHomeChange: (npa: string | null) => void;
}

export function ResultsPanel({
  result,
  selectedCode,
  onSelectCode,
  onForget,
  remember,
  onRememberChange,
  getExportRoot,
  addMore,
  comparison,
  scaleLegend,
  compareColors,
  home,
  onHomeChange,
}: Props) {
  const stats = useMemo(() => computeStats(result), [result]);
  const homeStats = useMemo(() => (home ? computeHomeStats(result, home) : null), [result, home]);
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

      <HomeRow home={home} onChange={onHomeChange} />

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
        {home && homeStats && (
          <li>
            From your home area code (<strong>{home}</strong>): {homeStats.fromHome}{" "}
            {homeStats.fromHome === 1 ? "number" : "numbers"}
            {homeStats.fromHome > 0 &&
              `, ${Math.round(homeStats.fromHomeShare * 100)}% of your map`}
          </li>
        )}
        {homeStats?.farthest && (
          <li>
            Farthest from home: <strong>{homeStats.farthest.npa}</strong> (
            {placeOf(homeStats.farthest)}), about{" "}
            {Math.round(homeStats.farthestMiles / 10) * 10 >= 100
              ? (Math.round(homeStats.farthestMiles / 100) * 100).toLocaleString()
              : Math.round(homeStats.farthestMiles)}{" "}
            miles away
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
        {stats.foreignCountries.length > 0 && (
          <li>
            Also:{" "}
            {stats.foreignCountries
              .slice(0, 4)
              .map((f) => `${f.count} in ${f.country}`)
              .join(", ")}
            {stats.foreignCountries.length > 4 && `, and ${stats.foreignCountries.length - 4} more`}
          </li>
        )}
        {skippedCount > 0 && (
          <li className="muted">
            <a
              href="#not-mapped"
              className="link link-muted"
              onClick={(e) => {
                e.preventDefault();
                setSkippedOpen(true);
              }}
              title="See which numbers could not be placed"
            >
              Not on the map: {summary.foreign > 0 && `${summary.foreign} outside North America`}
              {summary.foreign > 0 && summary.unrecognised > 0 && ", "}
              {summary.unrecognised > 0 && `${summary.unrecognised} unrecognised`} ›
            </a>
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
        caption={`${summary.nanp} numbers across ${result.counts.size} area codes`}
        cards={[
          { value: summary.nanp, label: "numbers" },
          { value: result.counts.size, label: "area codes" },
          {
            value: stats.regions,
            label: stats.regions === 1 ? "state or province" : "states & provinces",
          },
          { value: stats.countries, label: stats.countries === 1 ? "country" : "countries" },
        ]}
        legend={
          comparison
            ? (["mine", "both", "theirs"] as const).map((c) => ({
                color: compareColors[c],
                label: COMPARE_LABELS[c],
              }))
            : scaleLegend
        }
        getExportRoot={getExportRoot}
        home={home}
      />
      <SkippedDialog
        open={skippedOpen}
        onClose={() => setSkippedOpen(false)}
        skipped={result.skipped}
      />

      <label className="remember">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => onRememberChange(e.target.checked)}
        />
        <span>Remember this map on this device</span>
        <InfoTip text={REMEMBER_TIP} />
      </label>

      {addMore}

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
              selectedCode?.npa === code.npa ? (
                <NameList result={result} npa={code.npa} />
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
