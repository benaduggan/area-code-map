/** One in-service geographic area code (Numbering Plan Area). */
export interface AreaCode {
  /** Three-digit NPA, e.g. "212". */
  npa: string;
  /** Short region code: US state / CA province abbreviation, or a country name for the Caribbean. */
  region: string;
  /** Human-readable region name, e.g. "New York" or "Ontario". */
  regionName: string;
  /** ISO-ish country code: "US", "CA", or a Caribbean country name. */
  country: string;
  /** Year the code went into service. */
  inService: number;
  /** All NPAs sharing this code's footprint, including itself. Sorted. */
  overlayComplex: string[];
  /** NPA this one was split from, if NANPA records one. */
  parent: string | null;
  /** NANPA time zone letters (E, C, M, P, A, N, ...). */
  timeZone: string;
  /** Ids of polygons in shapes.topo.json that make up this code's footprint. */
  shapeIds: string[];
  /** Curated list of notable cities, largest first. */
  cities: string[];
}
