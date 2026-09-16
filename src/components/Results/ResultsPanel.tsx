import { useMemo, useState } from "react";
import { displayCities, getAreaCode, type AreaCode } from "../../lib/areacodes";
import type { ImportResult } from "../../lib/contacts";
import { computeHomeStats, computeStats, countryName } from "../../lib/stats";
import { compareLabels } from "../../lib/compare";
import { useI18n } from "../../lib/i18n";
import { AreaCodeCard } from "../Detail/AreaCodeCard";
import { NameList } from "../Detail/NameList";
import { ShareBar } from "../Share/ShareBar";
import { SkippedDialog } from "./SkippedDialog";
import type { Comparison } from "../../lib/compare";
import { InfoTip } from "../InfoTip";
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
  const { t, tx, tn, n, locale } = useI18n();
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
  const skippedCount = summary.foreign + summary.unrecognised + summary.nonGeographic;
  const labels = compareLabels(t);

  const notMappedParts = [
    summary.foreign > 0 ? t("results.notMapped.foreign", { count: n(summary.foreign) }) : null,
    summary.nonGeographic > 0
      ? t("results.notMapped.tollFree", { count: n(summary.nonGeographic) })
      : null,
    summary.unrecognised > 0
      ? t("results.notMapped.unrecognised", { count: n(summary.unrecognised) })
      : null,
  ].filter(Boolean);

  return (
    <section className="results">
      <div className="panel-head">
        <h2 className="panel-title">{t("results.title")}</h2>
        <button type="button" className="link" onClick={onForget}>
          {t("results.forget")}
        </button>
      </div>

      <HomeRow home={home} onChange={onHomeChange} />

      <div className="stat-grid">
        <Stat value={summary.nanp} label={t("results.stat.numbers")} />
        <Stat value={result.counts.size} label={t("results.stat.areaCodes")} />
        <Stat value={stats.regions} label={tn("results.stat.regions", stats.regions)} />
        <Stat value={stats.countries} label={tn("results.stat.countries", stats.countries)} />
      </div>

      <ul className="facts">
        {stats.top && (
          <li>
            {tx("results.fact.top", {
              npa: <strong>{stats.top.npa}</strong>,
              region: stats.top.regionName,
              count: tn("map.numbers", stats.topCount),
            })}
          </li>
        )}
        {home && homeStats && (
          <li>
            {tx("results.fact.fromHome", {
              npa: <strong>{home}</strong>,
              count: tn("map.numbers", homeStats.fromHome),
            })}
            {homeStats.fromHome > 0 &&
              t("results.fact.fromHomeShare", {
                percent: n(Math.round(homeStats.fromHomeShare * 100)),
              })}
          </li>
        )}
        {homeStats?.farthest && (
          <li>
            {tx("results.fact.farthest", {
              npa: <strong>{homeStats.farthest.npa}</strong>,
              place: placeOf(homeStats.farthest),
              miles: n(roundMiles(homeStats.farthestMiles)),
            })}
          </li>
        )}
        {stats.oldest && (
          <li>
            {tx("results.fact.oldest", {
              npa: <strong>{stats.oldest.npa}</strong>,
              place: placeOf(stats.oldest),
              year: stats.oldest.inService,
            })}
          </li>
        )}
        {stats.newest && stats.newest.inService >= 2010 && (
          <li>
            {tx("results.fact.newest", {
              npa: <strong>{stats.newest.npa}</strong>,
              place: placeOf(stats.newest),
              year: stats.newest.inService,
            })}
          </li>
        )}
        {stats.foreignCountries.length > 0 && (
          <li>
            {t("results.fact.also", {
              list: stats.foreignCountries
                .slice(0, 4)
                .map((f) =>
                  t("results.fact.alsoItem", {
                    count: n(f.count),
                    country: countryName(f.code, locale, t("skipped.unknownCountry")),
                  }),
                )
                .join(", "),
            })}
            {stats.foreignCountries.length > 4 &&
              t("results.fact.alsoMore", { count: n(stats.foreignCountries.length - 4) })}
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
              title={t("results.notMapped.title")}
            >
              {t("results.notMapped", { parts: notMappedParts.join(", ") })}
            </a>
          </li>
        )}
      </ul>

      {comparison && (
        <ul className="facts">
          <li>
            {tx(
              comparison.result.both.length === 1
                ? "compare.fact.both.one"
                : "compare.fact.both.other",
              { count: <strong>{n(comparison.result.both.length)}</strong> },
            )}
            {comparison.result.both.length > 0 &&
              t("compare.fact.bothList", { list: comparison.result.both.join(", ") })}
          </li>
          <li>
            {t("compare.fact.only", {
              mine: n(comparison.result.mineOnly.length),
              theirs: n(comparison.result.theirsOnly.length),
            })}
          </li>
        </ul>
      )}

      <ShareBar
        counts={result.counts}
        cards={[
          { value: summary.nanp, label: t("results.stat.numbers") },
          { value: result.counts.size, label: t("results.stat.areaCodes") },
          { value: stats.regions, label: tn("results.stat.regions", stats.regions) },
          { value: stats.countries, label: tn("results.stat.countries", stats.countries) },
        ]}
        legend={
          comparison
            ? (["mine", "both", "theirs"] as const).map((c) => ({
                color: compareColors[c],
                label: labels[c],
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
        <span>{t("results.remember")}</span>
        <InfoTip text={t("tip.remember")} />
      </label>

      {addMore}

      <h3 className="panel-title">{t("results.byAreaCode")}</h3>
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

/** Round to a tidy distance: hundreds once we are past 100 miles. */
function roundMiles(miles: number): number {
  return Math.round(miles / 10) * 10 >= 100 ? Math.round(miles / 100) * 100 : Math.round(miles);
}

/** "St. Louis, Missouri" or just the region when no city is curated. */
function placeOf(a: AreaCode): string {
  const city = displayCities(a)[0];
  if (a.regionName === a.country) return a.regionName; // Caribbean
  return city ? `${city}, ${a.regionName}` : a.regionName;
}

function Stat({ value, label }: { value: number; label: string }) {
  const { n } = useI18n();
  return (
    <div className="stat">
      <span className="stat-value">{n(value)}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
