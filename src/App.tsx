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
  loadCounts,
  saveCounts,
  setRememberEnabled,
} from "./lib/contacts/store";
import { usePrefersDark } from "./lib/usePrefersDark";
import { useOnline } from "./lib/useOnline";
import "./App.css";

function resultFromCounts(counts: Map<string, number>): ImportResult {
  const nanp = [...counts.values()].reduce((a, b) => a + b, 0);
  return {
    summary: { source: "paste", contacts: 0, numbers: nanp, nanp, foreign: 0, unrecognised: 0 },
    counts,
    names: new Map(),
  };
}

function restoredResult(): ImportResult | null {
  const counts = loadCounts();
  return counts ? resultFromCounts(counts) : null;
}

function sharedFromLocation(): Map<string, number> | null {
  return typeof location === "undefined" ? null : countsFromHash(location.hash);
}

export function App() {
  const mapRef = useRef<AreaCodeMapHandle>(null);
  const [query, setQuery] = useState("");
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<AreaCode | null>(null);
  const [result, setResult] = useState<ImportResult | null>(() => restoredResult());
  const [remember, setRemember] = useState(() => isRememberEnabled());
  const [shared, setShared] = useState<Map<string, number> | null>(() => sharedFromLocation());
  const dark = usePrefersDark();
  const online = useOnline();

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
    if (result && remember) saveCounts(result);
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
        <div>
          <h1>Area Code Map</h1>
          <p className="tagline">See where the people you know are from.</p>
        </div>
        <div className="header-links">
          <span
            className={"net-badge" + (online ? "" : " is-offline")}
            title={
              online
                ? "This page never sends your contacts anywhere. Try airplane mode: it keeps working."
                : "You are offline and everything still works, because nothing here needs the network."
            }
          >
            {online ? "Works offline" : "Offline · still working"}
          </span>
          <a
            className="coffee"
            href="https://buymeacoffee.com/benaduggan"
            target="_blank"
            rel="noopener noreferrer"
          >
            ☕ Buy me a coffee
          </a>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
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
                comparison={comparison && shared ? { theirs: shared, result: comparison } : null}
              />
              <ImportPanel onImport={handleImport} compact />
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
        </aside>

        <main className="map-area">
          <AreaCodeMap
            ref={mapRef}
            fillFor={fillFor}
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
                  <span className="legend-swatch" style={{ background: compareColors[c] }} />
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
        <a href="https://github.com/benaduggan/area-code-map">Source</a> · Nothing you import leaves
        your browser.
      </footer>
    </div>
  );
}
