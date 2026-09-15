import { useEffect, useMemo, useRef, useState } from "react";
import { AreaCodeMap, type AreaCodeMapHandle } from "./components/Map/AreaCodeMap";
import { Legend } from "./components/Map/Legend";
import { SearchBox } from "./components/Search/SearchBox";
import { AreaCodeCard } from "./components/Detail/AreaCodeCard";
import { NameList } from "./components/Detail/NameList";
import { ImportPanel } from "./components/Import/ImportPanel";
import { ResultsPanel } from "./components/Results/ResultsPanel";
import { areaCodeDataDate, areaCodes, overlayLabel, type AreaCode } from "./lib/areacodes";
import { codesOnShape, countsByShape, primaryCodeOnShape, shapesForCode } from "./lib/coverage";
import { searchAreaCodes } from "./lib/search";
import { DARK_RAMP, LIGHT_RAMP, makeCountScale } from "./lib/choropleth";
import { mergeResults, type ImportResult } from "./lib/contacts";
import { shareFromHash, type SharePayload } from "./lib/share/codec";
import { COMPARE_DARK, COMPARE_LABELS, COMPARE_LIGHT, compareCounts } from "./lib/compare";
import { computeStats } from "./lib/stats";
import { getAreaCode } from "./lib/areacodes";
import "./components/Share/ShareBar.css";
import {
  clearStored,
  isRememberEnabled,
  loadHome,
  loadResult,
  saveHome,
  saveResult,
  setRememberEnabled,
} from "./lib/contacts/store";
import { Welcome } from "./components/Welcome/Welcome";
import { HomeRow } from "./components/Home/HomeRow";
import { describeHome } from "./lib/home";
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

function sharedFromLocation(): SharePayload | null {
  return typeof location === "undefined" ? null : shareFromHash(location.hash);
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
  const [home, setHome] = useState<string | null>(() => loadHome());
  const [shared, setShared] = useState<SharePayload | null>(() => sharedFromLocation());
  // The welcome screen shows until something is remembered, shared, or
  // skipped. Typing a home code on it must not dismiss it, so this keys off
  // what was remembered when the page loaded, not the live home state.
  const [skippedWelcome, setSkippedWelcome] = useState(() => loadHome() !== null);
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
    () => (shared && result ? compareCounts(result.counts, shared.counts) : null),
    [shared, result],
  );
  const sharedResult = useMemo(() => (shared ? resultFromCounts(shared.counts) : null), [shared]);
  const sharedStats = useMemo(
    () => (sharedResult ? computeStats(sharedResult) : null),
    [sharedResult],
  );

  useEffect(() => {
    if (result && remember) saveResult(result);
  }, [result, remember]);

  useEffect(() => {
    if (remember) saveHome(home);
  }, [home, remember]);

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
    setHome(null);
    clearStored();
    setSelectedCode(null);
    setSelectedShape(null);
    setSkippedWelcome(false);
  };

  const handleRemember = (on: boolean) => {
    setRemember(on);
    setRememberEnabled(on, result, home);
  };

  const homeShapes = useMemo(() => (home ? shapesForCode(home) : []), [home]);
  const theirHomeShapes = useMemo(() => (shared?.home ? shapesForCode(shared.home) : []), [shared]);
  const homeShapeSet = useMemo(() => new Set(homeShapes), [homeShapes]);

  const shapeCodes = selectedShape ? codesOnShape(selectedShape) : [];

  const sharedBanner = shared && sharedResult && sharedStats && (
    <div className="compare-banner" role="status">
      <p>
        {comparing ? (
          <>
            Comparing with a shared map of <strong>{sharedResult.summary.nanp}</strong> numbers in{" "}
            <strong>{shared.counts.size}</strong> area codes.
            {shared.home && (
              <>
                {" "}
                They&rsquo;re from <strong>{shared.home}</strong>.
              </>
            )}
          </>
        ) : (
          <>
            You&rsquo;re viewing someone&rsquo;s shared map:{" "}
            <strong>{sharedResult.summary.nanp}</strong> numbers in{" "}
            <strong>{shared.counts.size}</strong> area codes
            {sharedStats.top && (
              <>
                , mostly <strong>{sharedStats.top.npa}</strong> ({sharedStats.top.regionName})
              </>
            )}
            .
            {shared.home && (
              <>
                {" "}
                They&rsquo;re from <strong>{shared.home}</strong> ({describeHome(shared.home)}).
              </>
            )}{" "}
            Add yours below to compare.
          </>
        )}
      </p>
      <button type="button" className="btn" onClick={dismissShared}>
        {comparing ? "Stop comparing" : "Dismiss"}
      </button>
    </div>
  );

  const badgeFor = (npa: string) =>
    result ? result.counts.get(npa) : shared ? shared.counts.get(npa) : undefined;

  const showWelcome = !result && !shared && !skippedWelcome;

  return (
    <div className="app">
      <header className="app-header">
        <div className="title-block">
          <h1>Hometowns</h1>
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
        </div>
      </header>
      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} online={online} />

      {showWelcome ? (
        <Welcome
          home={home}
          onHomeChange={setHome}
          remember={remember}
          onRememberChange={handleRemember}
          onImport={(r) => {
            handleImport(r);
            setSkippedWelcome(true);
          }}
          onSkip={() => setSkippedWelcome(true)}
          onOpenPrivacy={() => setPrivacyOpen(true)}
        />
      ) : (
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
                      badgeSecondary={comparing ? (shared!.counts.get(code.npa) ?? 0) : undefined}
                      extra={result ? <NameList result={result} npa={code.npa} /> : undefined}
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
                  getExportRoot={() => mapRef.current?.getExportRoot() ?? null}
                  addMore={<ImportPanel onImport={handleImport} compact />}
                  scaleLegend={
                    scale ? scale.labels.map((label, i) => ({ color: ramp[i]!, label })) : []
                  }
                  compareColors={compareColors}
                  comparison={
                    comparison && shared ? { theirs: shared.counts, result: comparison } : null
                  }
                  home={home}
                  onHomeChange={setHome}
                />
              </div>
            ) : shared && sharedResult ? (
              <div className="panel">
                <HomeRow home={home} onChange={setHome} />
                <ImportPanel onImport={handleImport} compact />
                <h2 className="panel-title">Their area codes</h2>
                <div className="card-list">
                  {[...shared.counts.entries()]
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
                <HomeRow home={home} onChange={setHome} />
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
              homeShapeIds={homeShapes}
              theirHomeShapeIds={theirHomeShapes}
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
                    {homeShapeSet.has(shapeId) && " · your home"}
                  </>
                );
              }}
            />
            {comparison ? (
              <Legend
                label="Compare legend"
                items={(["mine", "both", "theirs"] as const).map((c) => ({
                  label: COMPARE_LABELS[c],
                  color: compareColors[c],
                  hatched: c === "both",
                }))}
                home={homeShapes.length > 0}
                theirHome={theirHomeShapes.length > 0}
              />
            ) : (
              <Legend
                scale={scale}
                ramp={ramp}
                home={homeShapes.length > 0}
                theirHome={theirHomeShapes.length > 0}
              />
            )}
          </main>
        </div>
      )}

      <footer className="app-footer">
        <span>
          {areaCodes.length} area codes · NANPA data as of {areaCodeDataDate} ·{" "}
          <button type="button" className="link" onClick={() => setPrivacyOpen(true)}>
            Nothing you import leaves your browser.
          </button>
        </span>
        <span className="credits">
          Made by{" "}
          <a href="https://digdug.dev/" target="_blank" rel="noopener noreferrer">
            Ben Duggan
          </a>
          {" · "}
          <a href="https://buymeacoffee.com/benaduggan" target="_blank" rel="noopener noreferrer">
            ☕ Buy me a coffee
          </a>
        </span>
      </footer>
    </div>
  );
}
