import { useMemo, useRef, useState } from "react";
import { AreaCodeMap, type AreaCodeMapHandle } from "./components/Map/AreaCodeMap";
import { SearchBox } from "./components/Search/SearchBox";
import { AreaCodeCard } from "./components/Detail/AreaCodeCard";
import {
  areaCodeDataDate,
  areaCodes,
  areaCodesForShape,
  getAreaCode,
  overlayLabel,
  type AreaCode,
} from "./lib/areacodes";
import { searchAreaCodes } from "./lib/search";
import "./App.css";

export function App() {
  const mapRef = useRef<AreaCodeMapHandle>(null);
  const [query, setQuery] = useState("");
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<AreaCode | null>(null);

  const results = useMemo(() => searchAreaCodes(query), [query]);

  const highlighted = useMemo(() => {
    const s = new Set<string>();
    if (query.trim()) for (const r of results) for (const id of r.shapeIds) s.add(id);
    return s;
  }, [results, query]);

  const selectedShapes = useMemo(() => {
    const s = new Set<string>();
    if (selectedCode) for (const id of selectedCode.shapeIds) s.add(id);
    else if (selectedShape) s.add(selectedShape);
    return s;
  }, [selectedCode, selectedShape]);

  const selectCode = (code: AreaCode) => {
    setSelectedCode(code);
    setSelectedShape(code.shapeIds[0] ?? null);
    mapRef.current?.zoomToShapes(code.shapeIds);
  };

  const selectShape = (shapeId: string | null) => {
    setSelectedShape(shapeId);
    setSelectedCode(null);
  };

  const shapeCodes = selectedShape ? areaCodesForShape(selectedShape) : [];
  const showingSearch = query.trim().length > 0;

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
                  />
                ))}
              </div>
            </section>
          ) : selectedShape ? (
            <section className="panel">
              <div className="panel-head">
                <h2 className="panel-title">{shapeCodes[0]?.regionName ?? "Region"}</h2>
                <button type="button" className="link" onClick={() => selectShape(null)}>
                  Clear
                </button>
              </div>
              <div className="card-list">
                {shapeCodes.map((code) => (
                  <AreaCodeCard
                    key={code.npa}
                    code={code}
                    selected={selectedCode?.npa === code.npa}
                    onSelect={selectCode}
                  />
                ))}
              </div>
            </section>
          ) : (
            <section className="panel intro">
              <p>
                Search for an area code, or click a region on the map to see which codes serve it.
              </p>
              <p className="privacy-note">
                Soon: drop in your contacts to light up the map. Everything stays in your browser.
              </p>
            </section>
          )}
        </aside>

        <main className="map-area">
          <AreaCodeMap
            ref={mapRef}
            selectedShapeIds={selectedShapes}
            highlightedShapeIds={highlighted}
            onSelectShape={selectShape}
            renderTooltip={(shapeId) => {
              const codes = areaCodesForShape(shapeId);
              const primary = getAreaCode(shapeId) ?? codes[0];
              if (!primary) return shapeId;
              return (
                <>
                  <strong>{overlayLabel(primary)}</strong>
                  <br />
                  {primary.regionName}
                </>
              );
            }}
          />
        </main>
      </div>

      <footer className="app-footer">
        {areaCodes.length} area codes · NANPA data as of {areaCodeDataDate} ·{" "}
        <a href="https://github.com/benaduggan/area-code-map">Source</a>
      </footer>
    </div>
  );
}
