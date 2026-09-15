import type { AreaCode } from "../../src/lib/areacodes/types";
import { parseCsvRecords } from "../../src/lib/csv";
import { regionForLocation } from "./regions";

/** Raw row from https://reports.nanpa.com/public/npa_report.csv (only the columns we read). */
export interface NanpaRow {
  NPA_ID: string;
  USE: string; // "G" geographic, "N" non-geographic
  IN_SERVICE: string; // "Y" / "N"
  IN_SERVICE_DT: string; // "01-Jan-1947"
  LOCATION: string;
  COUNTRY: string;
  OVERLAY_COMPLEX: string; // "212/332/646/917, 347/465/718/917/929"
  PARENT_NPA_ID: string;
  TIME_ZONE: string;
}

/** The NANPA file starts with a "File Date,MM/DD/YYYY" line before the header. */
export function parseNanpaCsv(text: string): { fileDate: string | null; rows: NanpaRow[] } {
  let fileDate: string | null = null;
  let body = text;
  const firstNewline = text.indexOf("\n");
  const firstLine = text.slice(0, firstNewline).replace(/^\uFEFF/, "");
  if (firstLine.startsWith("File Date,")) {
    fileDate = firstLine.slice("File Date,".length).trim();
    body = text.slice(firstNewline + 1);
  }
  const rows = parseCsvRecords(body) as unknown as NanpaRow[];
  return { fileDate, rows };
}

export function inServiceGeographic(rows: NanpaRow[]): NanpaRow[] {
  return rows.filter((r) => r.USE === "G" && r.IN_SERVICE === "Y" && /^\d{3}$/.test(r.NPA_ID));
}

/** "206/564, 360/564 " -> ["206", "360", "564"] (includes self, sorted, unique). */
export function parseOverlayComplex(value: string, self: string): string[] {
  const set = new Set<string>([self]);
  for (const part of value.split(/[/,\s]+/)) {
    if (/^\d{3}$/.test(part)) set.add(part);
  }
  return [...set].sort();
}

export function parseInServiceYear(value: string): number {
  const m = /(\d{4})$/.exec(value.trim());
  if (!m) throw new Error(`Unparseable IN_SERVICE_DT "${value}"`);
  return Number(m[1]);
}

/**
 * Pick the polygons for an NPA: its own shape if one exists, otherwise the
 * shapes of every overlay sibling that has one. Returns [] if nothing matches.
 */
export function resolveShapeIds(
  npa: string,
  overlayComplex: string[],
  availableShapes: ReadonlySet<string>,
): string[] {
  if (availableShapes.has(npa)) return [npa];
  return overlayComplex.filter((s) => s !== npa && availableShapes.has(s)).sort();
}

export interface BuildResult {
  areaCodes: AreaCode[];
  unmapped: string[];
}

export function buildAreaCodes(
  rows: NanpaRow[],
  availableShapes: ReadonlySet<string>,
  cities: Record<string, string[]>,
): BuildResult {
  const unmapped: string[] = [];
  const areaCodes = inServiceGeographic(rows)
    .map((r): AreaCode => {
      const region = regionForLocation(r.LOCATION, r.COUNTRY);
      const overlayComplex = parseOverlayComplex(r.OVERLAY_COMPLEX, r.NPA_ID);
      const shapeIds = resolveShapeIds(r.NPA_ID, overlayComplex, availableShapes);
      if (shapeIds.length === 0) unmapped.push(r.NPA_ID);
      return {
        npa: r.NPA_ID,
        region: region.code,
        regionName: region.name,
        country: region.country,
        inService: parseInServiceYear(r.IN_SERVICE_DT),
        overlayComplex,
        parent: /^\d{3}$/.test(r.PARENT_NPA_ID) ? r.PARENT_NPA_ID : null,
        timeZone: r.TIME_ZONE.trim(),
        shapeIds,
        cities: cities[r.NPA_ID] ?? [],
      };
    })
    .sort((a, b) => a.npa.localeCompare(b.npa));
  return { areaCodes, unmapped };
}
