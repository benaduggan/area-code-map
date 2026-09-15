import { useEffect, useMemo, useRef, useState } from "react";
import { AreaCodeMap, type AreaCodeMapHandle } from "./components/Map/AreaCodeMap";
import { Legend } from "./components/Map/Legend";
import { SearchBox } from "./components/Search/SearchBox";
import { AreaCodeCard } from "./components/Detail/AreaCodeCard";
import { ImportPanel } from "./components/Import/ImportPanel";
import { ResultsPanel } from "./components/Results/ResultsPanel";
import { areaCodeDataDate, areaCodes, overlayLabel, type AreaCode } from "./lib/areacodes";
import { codesOnShape, countsByShape, primaryCodeOnShape, shapesForCode } from "./lib/coverage";
import { searchAreaCodes } from "./lib/search";
import { DARK_RAMP, LIGHT_RAMP, makeCountScale } from "./lib/choropleth";
import { mergeResults, type ImportResult } from "./lib/contacts";
import { countsFromHash } from "./lib/share/codec";
import { COMPARE_DARK, COMPARE_LABELS, COMPARE_LIGHT, compareCounts } from "./lib/compare";
import { computeStats } from "./lib/stats";
import { getAreaCode } from "./lib/areacodes";
import "./components/Share/ShareBar.css";
import {
  clearStored,
  isRememberEnabled,
  loadResult,
  saveResult,
  setRememberEnabled,
} from "./lib/contacts/store";
import { PrivacyDialog } from "./components/Privacy/PrivacyDialog";
import { useTheme, type Theme } from "./lib/useTheme";
import { GitHubIcon } from "./components/Icons";
import { useOnline } from "./lib/useOnline";
import "./App.css";

function resultFromCounts(counts: Map<string, number>): ImportResult {
  const nanp = [...counts.values()].reduce((a, b) => a + b, 0);
  return {
    summary: { source: "paste", contacts: 0, numbers: nanp, nanp, foreign: 0, unrecognised: 0 },
    counts,
    names: new Map(),
    skipped: { foreign: [], unrecognised: [] },
  };
}

function restoredResult(): ImportResult | null {
  return loadResult();
}

function sharedFromLocation(): Map<string, number> | null {
  return typeof location === "undefined" ? null : countsFromHash(location.hash);
}

const NEXT_THEME: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
const THEME_LABEL: Record<Theme, string> = { system: "Auto", light: "Light", dark: "Dark" };
const THEME_ICON: Record<Theme, string> = { system: "◐", light: "☀", dark: "☾" };

export function App() {
  const mapRef = useRef<AreaCodeMapHandle>(null);
  const [query, setQuery] = useState("");
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<AreaCode | null>(null);
  const [result, setResult] = useState<ImportResult | null>(() => restoredResult());
  const [remember, setRemember] = useState(() => isRememberEnabled());
  const [shared, setShared] = useState<Map<string, number> | null>(() => sharedFromLocation());
  const { theme, setTheme, dark } = useTheme();
  const online = useOnline();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const el = sidebarRef.current;
    const update = () => setShowTop((el?.scrollTop ?? 0) > 400 || window.scrollY > 400);
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("scroll", update);
    };
  }, []);

  const scrollToTop = () => {
    sidebarRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onHash = () => setShared(sharedFromLocation());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const dismissShared = () => {
    setShared(null);
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  };

  const comparing = Boolean(shared && result);
  const comparison = useMemo(
    () => (shared && result ? compareCounts(result.counts, shared) : null),
    [shared, result],
  );
  const sharedResult = useMemo(() => (shared ? resultFromCounts(shared) : null), [shared]);
  const sharedStats = useMemo(
    () => (sharedResult ? computeStats(sharedResult) : null),
    [sharedResult],
  );

  useEffect(() => {
    if (result && remember) saveResult(result);
  }, [result, remember]);

  const results = useMemo(() => searchAreaCodes(query), [query]);
  const showingSearch = query.trim().length > 0;

  const highlighted = useMemo(() => {
    const s = new Set<string>();
    if (showingSearch) for (const r of results) for (const id of shapesForCode(r.npa)) s.add(id);
    return s;
  }, [results, showingSearch]);

  const selectedShapes = useMemo(() => {
    const s = new Set<string>();
    if (selectedCode) for (const id of shapesForCode(selectedCode.npa)) s.add(id);
    else if (selectedShape)
      for (const c of codesOnShape(selectedShape)) for (const id of shapesForCode(c.npa)) s.add(id);
    return s;
  }, [selectedCode, selectedShape]);

  // What the map shows: my import, or a shared map when I have none yet.
  const displayed = result ?? sharedResult;
  const shapeCounts = useMemo(
    () => (displayed ? countsByShape(displayed.counts) : null),
    [displayed],
  );
  const scale = useMemo(
    () => (displayed ? makeCountScale(displayed.counts.values()) : null),
    [displayed],
  );
  const ramp = dark ? DARK_RAMP : LIGHT_RAMP;
  const compareColors = dark ? COMPARE_DARK : COMPARE_LIGHT;

  const fillFor = useMemo(() => {
    if (comparison) {
      return (shapeId: string) => {
        const c = comparison.shapeClass.get(shapeId);
        return c ? compareColors[c] : undefined;
      };
    }
    if (!shapeCounts || !scale) return undefined;
    return (shapeId: string) => {
      const n = shapeCounts.get(shapeId);
      if (!n) return undefined;
      return ramp[scale.classFor(n)];
    };
  }, [comparison, compareColors, shapeCounts, scale, ramp]);

  const selectCode = (code: AreaCode) => {
    setSelectedCode(code);
    setSelectedShape(code.shapeIds[0] ?? null);
    mapRef.current?.zoomToShapes(shapesForCode(code.npa));
  };

  const selectShape = (shapeId: string | null) => {
    setSelectedShape(shapeId);
    setSelectedCode(null);
  };

  const handleImport = (incoming: ImportResult) => {
    setResult((prev) => (prev ? mergeResults([prev, incoming]) : incoming));
    setQuery("");
    setSelectedCode(null);
    setSelectedShape(null);
    mapRef.current?.resetZoom();
  };

  const forget = () => {
    setResult(null);
    clearStored();
    setSelectedCode(null);
    setSelectedShape(null);
  };

  const handleRemember = (on: boolean) => {
    setRemember(on);
    setRememberEnabled(on, result);
  };

  const shapeCodes = selectedShape ? codesOnShape(selectedShape) : [];

  const sharedBanner = shared && sharedResult && sharedStats && (
    <div className="compare-banner" role="status">
      <p>
        {comparing ? (
          <>
            Comparing with a shared map of <strong>{sharedResult.summary.nanp}</strong> numbers in{" "}
            <strong>{shared.size}</strong> area codes.
          </>
        ) : (
          <>
            You&rsquo;re viewing someone&rsquo;s shared map:{" "}
            <strong>{sharedResult.summary.nanp}</strong> numbers in <strong>{shared.size}</strong>{" "}
            area codes
            {sharedStats.top && (
              <>
                , mostly <strong>{sharedStats.top.npa}</strong> ({sharedStats.top.regionName})
              </>
            )}
            . Add your own contacts below to compare.
          </>
        )}
      </p>
      <button type="button" className="btn" onClick={dismissShared}>
        {comparing ? "Stop comparing" : "Dismiss"}
      </button>
    </div>
  );

  const badgeFor = (npa: string) =>
    result ? result.counts.get(npa) : shared ? shared.get(npa) : undefined;

  return (
    <div className="app">
      <header className="app-header">
        <div className="title-block">
          <h1>Area Code Map</h1>
          <p className="tagline">See where the people you know are from.</p>
        </div>
        <div className="header-links">
          <button
            type="button"
            className={"pill net-badge" + (online ? "" : " is-offline")}
            onClick={() => setPrivacyOpen(true)}
            title="How your data stays on your device"
          >
            {online ? "Works offline" : "Offline"}
          </button>
          <button
            type="button"
            className="pill"
            onClick={() => setTheme(NEXT_THEME[theme])}
            title="Switch theme"
            aria-label={`Theme: ${THEME_LABEL[theme]}. Switch theme`}
          >
            {THEME_ICON[theme]} {THEME_LABEL[theme]}
          </button>
          <a
            className="pill"
            href="https://github.com/benaduggan/area-code-map"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon /> Source code
          </a>
          <a
            className="pill coffee"
            href="https://buymeacoffee.com/benaduggan"
            target="_blank"
            rel="noopener noreferrer"
          >
            ☕ Buy me a coffee
          </a>
        </div>
      </header>
      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} online={online} />

      <div className="layout">
        <aside className="sidebar" ref={sidebarRef}>
          <SearchBox value={query} onChange={setQuery} />
          {!showingSearch && !selectedShape && sharedBanner}

          {showingSearch ? (
            <section className="panel" aria-live="polite">
              <h2 className="panel-title">
                {results.length === 0
                  ? "No matches"
                  : `${results.length} area code${results.length === 1 ? "" : "s"}`}
              </h2>
              <div className="card-list">
                {results.map((code) => (
                  <AreaCodeCard
                    key={code.npa}
                    code={code}
                    selected={selectedCode?.npa === code.npa}
                    onSelect={selectCode}
                    badge={badgeFor(code.npa)}
                  />
                ))}
              </div>
            </section>
          ) : selectedShape && !selectedCode ? (
            <section className="panel">
              <div className="panel-head">
                <h2 className="panel-title">{shapeCodes[0]?.regionName ?? "Region"}</h2>
                <button type="button" className="link" onClick={() => selectShape(null)}>
                  Back
                </button>
              </div>
              <div className="card-list">
                {shapeCodes.map((code) => (
                  <AreaCodeCard
                    key={code.npa}
                    code={code}
                    onSelect={selectCode}
                    badge={badgeFor(code.npa)}
                    badgeSecondary={comparing ? (shared!.get(code.npa) ?? 0) : undefined}
                    extra={
                      result?.names.get(code.npa)?.length ? (
                        <span className="card-names">{result.names.get(code.npa)!.join(", ")}</span>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            </section>
          ) : result ? (
            <div className="panel">
              <ResultsPanel
                result={result}
                selectedCode={selectedCode}
                onSelectCode={selectCode}
                onForget={forget}
                remember={remember}
                onRememberChange={handleRemember}
                getSvg={() => mapRef.current?.getSvg() ?? null}
                addMore={<ImportPanel onImport={handleImport} compact />}
                comparison={comparison && shared ? { theirs: shared, result: comparison } : null}
              />
            </div>
          ) : shared && sharedResult ? (
            <div className="panel">
              <ImportPanel onImport={handleImport} compact />
              <h2 className="panel-title">Their area codes</h2>
              <div className="card-list">
                {[...shared.entries()]
                  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
                  .map(([npa, count]) => {
                    const code = getAreaCode(npa);
                    return code ? (
                      <AreaCodeCard key={npa} code={code} onSelect={selectCode} badge={count} />
                    ) : null;
                  })}
              </div>
            </div>
          ) : (
            <div className="panel">
              <ImportPanel onImport={handleImport} />
              <p className="hint">Or search above, or click any region on the map.</p>
            </div>
          )}
          {showTop && (
            <button type="button" className="to-top" onClick={scrollToTop}>
              ↑ Top
            </button>
          )}
        </aside>

        <main className="map-area">
          <AreaCodeMap
            ref={mapRef}
            fillFor={fillFor}
            hatchFor={comparison ? (id) => comparison.shapeClass.get(id) === "both" : undefined}
            selectedShapeIds={selectedShapes}
            highlightedShapeIds={highlighted}
            onSelectShape={selectShape}
            renderTooltip={(shapeId) => {
              const primary = primaryCodeOnShape(shapeId);
              if (!primary) return shapeId;
              const n = shapeCounts?.get(shapeId);
              const cls = comparison?.shapeClass.get(shapeId);
              return (
                <>
                  <strong>{overlayLabel(primary)}</strong>
                  <br />
                  {primary.regionName}
                  {cls
                    ? ` · ${COMPARE_LABELS[cls]}`
                    : n
                      ? ` · ${n} ${n === 1 ? "number" : "numbers"}`
                      : ""}
                </>
              );
            }}
          />
          {comparison ? (
            <div className="legend" aria-label="Compare legend">
              {(["mine", "both", "theirs"] as const).map((c) => (
                <span key={c} className="legend-item">
                  <span
                    className={"legend-swatch" + (c === "both" ? " is-hatched" : "")}
                    style={{ background: compareColors[c] }}
                  />
                  {COMPARE_LABELS[c]}
                </span>
              ))}
            </div>
          ) : (
            scale && <Legend scale={scale} ramp={ramp} />
          )}
        </main>
      </div>

      <footer className="app-footer">
        {areaCodes.length} area codes · NANPA data as of {areaCodeDataDate} ·{" "}
        <button type="button" className="link" onClick={() => setPrivacyOpen(true)}>
          Nothing you import leaves your browser.
        </button>
      </footer>
    </div>
  );
}
