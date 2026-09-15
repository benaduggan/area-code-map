/**
 * Builds src/data/areacodes.json from the NANPA NPA database.
 *
 *   bun run data:areacodes           # use data/source/npa_report.csv
 *   bun run data:areacodes --fetch   # re-download the CSV first
 *
 * Fails if any in-service geographic NPA cannot be mapped onto a polygon in
 * src/data/shapes.topo.json (run data:shapes first).
 */
import { join } from "node:path";
import { buildAreaCodes, parseNanpaCsv } from "./lib/nanpa";

const ROOT = join(import.meta.dir, "..");
const CSV = join(ROOT, "data/source/npa_report.csv");
const SHAPES = join(ROOT, "src/data/shapes.topo.json");
const CITIES = join(ROOT, "data/source/cities.json");
const OUT = join(ROOT, "src/data/areacodes.json");
const NANPA_URL = "https://reports.nanpa.com/public/npa_report.csv";

if (process.argv.includes("--fetch")) {
  console.log(`Downloading ${NANPA_URL}`);
  const res = await fetch(NANPA_URL);
  if (!res.ok) throw new Error(`NANPA download failed: ${res.status} ${res.statusText}`);
  await Bun.write(CSV, await res.text());
}

const { fileDate, rows } = parseNanpaCsv(await Bun.file(CSV).text());
console.log(`NANPA file date: ${fileDate ?? "unknown"}, ${rows.length} rows`);

const topo = (await Bun.file(SHAPES).json()) as {
  objects: { shapes: { geometries: { id: string }[] } };
};
const shapeIds = new Set(topo.objects.shapes.geometries.map((g) => g.id));

const cities = (await Bun.file(CITIES).json()) as Record<string, string[]>;

const { areaCodes, unmapped } = buildAreaCodes(rows, shapeIds, cities);

const usedShapes = new Set(areaCodes.flatMap((a) => a.shapeIds));
const orphanShapes = [...shapeIds].filter((s) => !usedShapes.has(s));
if (orphanShapes.length) {
  console.warn(`Shapes with no in-service NPA (retired codes?): ${orphanShapes.join(", ")}`);
}
const unknownCityCodes = Object.keys(cities).filter((c) => !areaCodes.some((a) => a.npa === c));
if (unknownCityCodes.length) {
  throw new Error(`cities.json lists NPAs not in service: ${unknownCityCodes.join(", ")}`);
}
if (unmapped.length) {
  throw new Error(
    `${unmapped.length} in-service NPA(s) have no polygon: ${unmapped.join(", ")}. ` +
      `Add geometry to data/source or a hand-drawn polygon in scripts/build-shapes.ts.`,
  );
}

const byCountry = new Map<string, number>();
for (const a of areaCodes) byCountry.set(a.country, (byCountry.get(a.country) ?? 0) + 1);
const withCities = areaCodes.filter((a) => a.cities.length > 0).length;

await Bun.write(
  OUT,
  JSON.stringify({ source: NANPA_URL, fileDate, generated: new Date().toISOString(), areaCodes }),
);
console.log(
  `Wrote ${OUT}: ${areaCodes.length} area codes (US ${byCountry.get("US") ?? 0}, CA ${byCountry.get("CA") ?? 0}, other ${areaCodes.length - (byCountry.get("US") ?? 0) - (byCountry.get("CA") ?? 0)}), ${withCities} with cities`,
);
