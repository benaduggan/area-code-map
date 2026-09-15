/**
 * Pre-computes SVG path strings for every area code polygon, split across a
 * main North America view and four fixed insets. Computed once at module load;
 * the map component only concatenates strings after that.
 */
import { geoAlbers, geoConicConformal, geoMercator, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import shapesTopo from "../../data/shapes.topo.json";
import { getAreaCode } from "../areacodes";

export const VIEW_WIDTH = 975;
export const VIEW_HEIGHT = 640;

export type InsetId = "main" | "alaska" | "hawaii" | "pacific" | "caribbean";

export interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Inset {
  id: InsetId;
  label: string;
  frame: Frame;
}

export interface ShapeGeometry {
  id: string;
  inset: InsetId;
  /** SVG path in viewBox coordinates. */
  path: string;
  centroid: [number, number];
  bounds: [[number, number], [number, number]];
  /** True when the projected shape is too small to see; render a marker instead. */
  tiny: boolean;
  /** Projected area, used to draw large (union) polygons beneath smaller ones. */
  area: number;
  /** Shapes with identical geometry share a footprint id (the first shape's id). */
  footprint: string;
}

const TINY_PX = 7;
const PAD = 6;
/** Space reserved at the bottom of each inset for its label. */
const LABEL_STRIP = 14;

export const INSETS: readonly Inset[] = [
  { id: "main", label: "", frame: { x: 0, y: 0, width: VIEW_WIDTH, height: VIEW_HEIGHT } },
  { id: "alaska", label: "Alaska", frame: { x: 8, y: VIEW_HEIGHT - 168, width: 190, height: 160 } },
  {
    id: "pacific",
    label: "Pacific territories",
    frame: { x: 206, y: VIEW_HEIGHT - 168, width: 130, height: 64 },
  },
  { id: "hawaii", label: "Hawaii", frame: { x: 206, y: VIEW_HEIGHT - 96, width: 130, height: 88 } },
  {
    id: "caribbean",
    label: "Caribbean & Bermuda",
    frame: { x: VIEW_WIDTH - 232, y: VIEW_HEIGHT - 208, width: 224, height: 200 },
  },
];

const topology = shapesTopo as unknown as Topology<{ shapes: GeometryCollection }>;
const collection = feature(topology, topology.objects.shapes);
const features = collection.features as Feature<Geometry>[];

function insetFor(shapeId: string): InsetId {
  const a = getAreaCode(shapeId);
  if (!a) return "main";
  if (a.country === "US") {
    switch (a.region) {
      case "AK":
        return "alaska";
      case "HI":
        return "hawaii";
      case "GU":
      case "MP":
      case "AS":
        return "pacific";
      case "PR":
      case "VI":
        return "caribbean";
      default:
        return "main";
    }
  }
  if (a.country === "CA") return "main";
  return "caribbean";
}

function inner(frame: Frame): [[number, number], [number, number]] {
  return [
    [frame.x + PAD, frame.y + PAD],
    [frame.x + frame.width - PAD, frame.y + frame.height - PAD - LABEL_STRIP],
  ];
}

/**
 * A lon/lat box, densified so conic projections fit it accurately. The ring
 * must wind clockwise: d3-geo treats counterclockwise rings as the complement
 * (the whole sphere minus the box).
 */
function box(lon0: number, lat0: number, lon1: number, lat1: number): Feature<Geometry> {
  const ring: [number, number][] = [];
  const step = 1;
  for (let lat = lat0; lat < lat1; lat += step) ring.push([lon0, lat]);
  for (let lon = lon0; lon < lon1; lon += step) ring.push([lon, lat1]);
  for (let lat = lat1; lat > lat0; lat -= step) ring.push([lon1, lat]);
  for (let lon = lon1; lon > lon0; lon -= step) ring.push([lon, lat0]);
  ring.push([lon0, lat0]);
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } };
}

function grouped(): Record<InsetId, Feature<Geometry>[]> {
  const out: Record<InsetId, Feature<Geometry>[]> = {
    main: [],
    alaska: [],
    hawaii: [],
    pacific: [],
    caribbean: [],
  };
  for (const f of features) out[insetFor(String(f.id))].push(f);
  return out;
}

function buildProjections(
  groups: Record<InsetId, Feature<Geometry>[]>,
): Record<InsetId, GeoProjection> {
  const frame = (id: InsetId) => INSETS.find((i) => i.id === id)!.frame;
  const fc = (fs: Feature<Geometry>[]) => ({ type: "FeatureCollection" as const, features: fs });

  // Lower 48 plus southern Canada drive the fit; the Arctic archipelago of
  // area code 867 is allowed to run off the top of the view.
  const main = geoConicConformal()
    .rotate([96, 0])
    .parallels([33, 60])
    .fitExtent(
      [
        [PAD, PAD],
        [VIEW_WIDTH - PAD, VIEW_HEIGHT - PAD],
      ],
      box(-127, 24.5, -60, 63),
    );

  const alaska = geoAlbers()
    .rotate([154, 0])
    .center([0, 63])
    .parallels([55, 65])
    .fitExtent(inner(frame("alaska")), fc(groups.alaska));

  const hawaii = geoMercator().fitExtent(inner(frame("hawaii")), fc(groups.hawaii));

  // Guam and the Marianas sit near 145°E, American Samoa near 170°W: rotate so
  // the Pacific is in the middle rather than split at the antimeridian.
  const pacific = geoMercator()
    .rotate([-170, 0])
    .fitExtent(inner(frame("pacific")), fc(groups.pacific));

  const caribbean = geoMercator().fitExtent(inner(frame("caribbean")), fc(groups.caribbean));

  return { main, alaska, hawaii, pacific, caribbean };
}

function build(): ShapeGeometry[] {
  const groups = grouped();
  const projections = buildProjections(groups);
  const out: ShapeGeometry[] = [];
  for (const inset of INSETS) {
    const path = geoPath(projections[inset.id]);
    for (const f of groups[inset.id]) {
      const d = path(f) ?? "";
      const b = path.bounds(f);
      const c = path.centroid(f);
      const w = b[1][0] - b[0][0];
      const h = b[1][1] - b[0][1];
      out.push({
        id: String(f.id),
        inset: inset.id,
        path: d,
        centroid: [c[0], c[1]],
        bounds: b,
        // Dense urban codes in the main view are small too, but there the user
        // can zoom; markers would just stack on top of each other in Manhattan.
        tiny: inset.id !== "main" && w < TINY_PX && h < TINY_PX,
        area: Math.abs(path.area(f)),
        footprint: "",
      });
    }
  }
  // Overlay codes drawn as exact copies of another polygon share a footprint.
  const byPath = new Map<string, string>();
  for (const s of out) {
    const first = byPath.get(s.path);
    if (first) s.footprint = first;
    else {
      byPath.set(s.path, s.id);
      s.footprint = s.id;
    }
  }
  // Largest first, so a polygon that is the union of its neighbours (917 over
  // 212/646/718/347, 878 over 412/724) is painted underneath them.
  out.sort((a, b) => b.area - a.area);
  return out;
}

export const SHAPES: readonly ShapeGeometry[] = build();

const byId = new Map(SHAPES.map((s) => [s.id, s]));

export function getShape(id: string): ShapeGeometry | undefined {
  return byId.get(id);
}

/** Union of the bounds of several shapes (main inset only makes sense to zoom to). */
export function unionBounds(ids: readonly string[]): [[number, number], [number, number]] | null {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  let any = false;
  for (const id of ids) {
    const s = byId.get(id);
    if (!s || s.inset !== "main") continue;
    any = true;
    x0 = Math.min(x0, s.bounds[0][0]);
    y0 = Math.min(y0, s.bounds[0][1]);
    x1 = Math.max(x1, s.bounds[1][0]);
    y1 = Math.max(y1, s.bounds[1][1]);
  }
  return any
    ? [
        [x0, y0],
        [x1, y1],
      ]
    : null;
}
