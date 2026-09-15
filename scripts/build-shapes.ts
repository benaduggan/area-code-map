/**
 * Builds src/data/shapes.topo.json from the public-domain 2010 area code
 * polygons plus a hand-drawn Sint Maarten (721) polygon.
 *
 *   bun run data:shapes
 *
 * Each TopoJSON geometry carries { id: <shapeId> } where shapeId is the NPA
 * the polygon was originally drawn for. Overlay codes are joined onto these
 * shapes by scripts/build-areacodes.ts.
 */
import mapshaper from "mapshaper";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const SOURCE = join(ROOT, "data/source/area-codes-2010.geojson");
const OUT = join(ROOT, "src/data/shapes.topo.json");
const SIMPLIFY = process.env.SHAPE_SIMPLIFY ?? "20%";

interface Feature {
  type: "Feature";
  geometry: unknown;
  properties: Record<string, unknown>;
}

// Rough outline of the Dutch (southern) half of the island of Saint Martin.
// The 2010 source predates 721's assignment in 2011.
const SINT_MAARTEN: Feature = {
  type: "Feature",
  properties: { NPA: "721" },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-63.138, 18.036],
        [-63.125, 18.02],
        [-63.1, 18.008],
        [-63.06, 18.002],
        [-63.02, 18.01],
        [-63.008, 18.03],
        [-63.012, 18.055],
        [-63.04, 18.062],
        [-63.08, 18.06],
        [-63.11, 18.058],
        [-63.135, 18.05],
        [-63.138, 18.036],
      ],
    ],
  },
};

const source = (await Bun.file(SOURCE).json()) as { type: string; features: Feature[] };
const features = source.features.map((f) => ({
  type: "Feature" as const,
  geometry: f.geometry,
  properties: { id: String(f.properties.NPA) },
}));
features.push({ ...SINT_MAARTEN, properties: { id: "721" } });

// The 2010 file draws one NPA (270) as two rows: a Polygon and a MultiPolygon.
// Merge duplicates into one MultiPolygon here. We deliberately do NOT use
// mapshaper's -dissolve or -clean: overlay codes are drawn as exact copies of
// their parent polygon, and both of those commands treat coincident polygons
// as one shape and drop the rest.
const byId = new Map<string, Feature>();
for (const f of features) {
  const existing = byId.get(f.properties.id);
  if (!existing) {
    byId.set(f.properties.id, f);
    continue;
  }
  console.log(`Merging duplicated shape id: ${f.properties.id}`);
  existing.geometry = {
    type: "MultiPolygon",
    coordinates: [...polygons(existing.geometry), ...polygons(f.geometry)],
  };
}
const merged = [...byId.values()];
const ids = merged.map((f) => String(f.properties.id));

function polygons(geometry: unknown): unknown[] {
  const g = geometry as { type: string; coordinates: unknown[] };
  if (g.type === "Polygon") return [g.coordinates];
  if (g.type === "MultiPolygon") return g.coordinates;
  throw new Error(`Unexpected geometry type ${g.type}`);
}

const commands = [
  "-i in.geojson",
  `-simplify ${SIMPLIFY} keep-shapes`,
  "-o out.topojson format=topojson quantization=1e5 id-field=id",
].join(" ");

const outputs = await mapshaper.applyCommands(commands, {
  "in.geojson": { type: "FeatureCollection", features: merged },
});
const topo = outputs["out.topojson"];
if (!topo) throw new Error("mapshaper produced no output");
const text = typeof topo === "string" ? topo : topo.toString();

// Sanity-check: every input id survives.
const parsed = JSON.parse(text) as {
  objects: Record<string, { geometries: { id?: string; type?: string; arcs?: unknown[] }[] }>;
};
const objectName = Object.keys(parsed.objects)[0];
if (!objectName) throw new Error("TopoJSON has no objects");
const geometries = parsed.objects[objectName]!.geometries;
const outIds = new Set(geometries.map((g) => g.id));
const lost = ids.filter((id) => !outIds.has(id));
if (lost.length) throw new Error(`Shapes lost during build: ${lost.join(", ")}`);
const empty = geometries.filter((g) => !g.type || !g.arcs || g.arcs.length === 0).map((g) => g.id);
if (empty.length) throw new Error(`Shapes with empty geometry: ${empty.join(", ")}`);

// Rename the object to something stable regardless of input filename.
if (objectName !== "shapes") {
  parsed.objects.shapes = parsed.objects[objectName]!;
  delete parsed.objects[objectName];
}

await Bun.write(OUT, JSON.stringify(parsed));
const bytes = Buffer.byteLength(JSON.stringify(parsed));
const gz = Bun.gzipSync(JSON.stringify(parsed)).byteLength;
console.log(
  `Wrote ${OUT}: ${outIds.size} shapes, ${(bytes / 1024).toFixed(0)} KB (${(gz / 1024).toFixed(0)} KB gzipped), simplify=${SIMPLIFY}`,
);
