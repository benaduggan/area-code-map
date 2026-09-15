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
import {
  clearStored,
  isRememberEnabled,
  loadCounts,
  saveCounts,
  setRememberEnabled,
} from "./lib/contacts/store";
import { usePrefersDark } from "./lib/usePrefersDark";
import "./App.css";

function restoredResult(): ImportResult | null {
  const counts = loadCounts();
  if (!counts) return null;
  const nanp = [...counts.values()].reduce((a, b) => a + b, 0);
  return {
    summary: { source: "paste", contacts: 0, numbers: nanp, nanp, foreign: 0, unrecognised: 0 },
    counts,
    names: new Map(),
  };
}

export function App() {
  const mapRef = useRef<AreaCodeMapHandle>(null);
  const [query, setQuery] = useState("");
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<AreaCode | null>(null);
  const [result, setResult] = useState<ImportResult | null>(() => restoredResult());
  const [remember, setRemember] = useState(() => isRememberEnabled());
  const dark = usePrefersDark();

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

  const shapeCounts = useMemo(() => (result ? countsByShape(result.counts) : null), [result]);
  const scale = useMemo(() => (result ? makeCountScale(result.counts.values()) : null), [result]);
  const ramp = dark ? DARK_RAMP : LIGHT_RAMP;

  const fillFor = useMemo(() => {
    if (!shapeCounts || !scale) return undefined;
    return (shapeId: string) => {
      const n = shapeCounts.get(shapeId);
      if (!n) return undefined;
      return ramp[scale.classFor(n)];
    };
  }, [shapeCounts, scale, ramp]);

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Area Code Map</h1>
        <p className="tagline">See where the people you know are from.</p>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <SearchBox value={query} onChange={setQuery} />

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
                    badge={result?.counts.get(code.npa)}
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
                    badge={result?.counts.get(code.npa)}
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
              />
              <ImportPanel onImport={handleImport} compact />
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
              return (
                <>
                  <strong>{overlayLabel(primary)}</strong>
                  <br />
                  {primary.regionName}
                  {n ? ` · ${n} ${n === 1 ? "number" : "numbers"}` : ""}
                </>
              );
            }}
          />
          {scale && <Legend scale={scale} ramp={ramp} />}
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
