import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import "d3-transition";
import {
  INSETS,
  SHAPES,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  getShape,
  unionBounds,
  type Inset,
  type ShapeGeometry,
} from "../../lib/geo/model";
import { HOUSE_PATH } from "../Icons";
import "./AreaCodeMap.css";

export interface AreaCodeMapProps {
  /** Optional fill color per shape id; undefined falls back to the base fill. */
  fillFor?: (shapeId: string) => string | undefined;
  /** Shapes that also get a diagonal hatch, so a class is not carried by color alone. */
  hatchFor?: (shapeId: string) => boolean;
  selectedShapeIds?: ReadonlySet<string>;
  highlightedShapeIds?: ReadonlySet<string>;
  /** The user's own area code: outlined, with a house marker on the first shape. */
  homeShapeIds?: readonly string[];
  /** A shared map's home, drawn as a hollow marker so both can show at once. */
  theirHomeShapeIds?: readonly string[];
  onSelectShape?: (shapeId: string | null) => void;
  onHoverShape?: (shapeId: string | null) => void;
  /** Rendered inside the tooltip for the hovered shape. */
  renderTooltip?: (shapeId: string) => React.ReactNode;
}

export interface AreaCodeMapHandle {
  zoomToShapes: (shapeIds: readonly string[]) => void;
  resetZoom: () => void;
  /** The element holding the main map and the inset SVGs, for image export. */
  getExportRoot: () => HTMLElement | null;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 12;

export const AreaCodeMap = forwardRef<AreaCodeMapHandle, AreaCodeMapProps>(function AreaCodeMap(
  {
    fillFor,
    hatchFor,
    selectedShapeIds,
    highlightedShapeIds,
    homeShapeIds,
    theirHomeShapeIds,
    onSelectShape,
    onHoverShape,
    renderTooltip,
  },
  ref,
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .translateExtent([
        [-VIEW_WIDTH * 0.5, -VIEW_HEIGHT * 0.5],
        [VIEW_WIDTH * 1.5, VIEW_HEIGHT * 1.5],
      ])
      .filter((event: Event) => {
        // d3's default filter: no right-click, ctrl+wheel allowed.
        const me = event as MouseEvent;
        return (!me.ctrlKey || event.type === "wheel") && !me.button;
      })
      .on("start", () => {
        dragging.current = false;
      })
      .on("zoom", (event) => {
        if (event.sourceEvent?.type === "mousemove" || event.sourceEvent?.type === "touchmove") {
          dragging.current = true;
        }
        setTransform(event.transform);
      });
    select(svg).call(z);
    zoomRef.current = z;
    return () => {
      select(svg).on(".zoom", null);
    };
  }, []);

  const zoomToBounds = useCallback((b: [[number, number], [number, number]]) => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!svg || !z) return;
    const w = b[1][0] - b[0][0];
    const h = b[1][1] - b[0][1];
    const cx = (b[0][0] + b[1][0]) / 2;
    const cy = (b[0][1] + b[1][1]) / 2;
    const k = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, 0.7 / Math.max(w / VIEW_WIDTH, h / VIEW_HEIGHT)),
    );
    const t = zoomIdentity.translate(VIEW_WIDTH / 2 - k * cx, VIEW_HEIGHT / 2 - k * cy).scale(k);
    select(svg).transition().duration(500).call(z.transform, t);
  }, []);

  const resetZoom = useCallback(() => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (svg && z) select(svg).transition().duration(400).call(z.transform, zoomIdentity);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      zoomToShapes: (ids) => {
        const b = unionBounds(ids);
        if (b) zoomToBounds(b);
      },
      resetZoom,
      getExportRoot: () => containerRef.current,
    }),
    [zoomToBounds, resetZoom],
  );

  const handleEnter = (id: string) => {
    setHovered(id);
    onHoverShape?.(id);
  };
  const handleLeave = () => {
    setHovered(null);
    setPointer(null);
    onHoverShape?.(null);
  };
  const handleMove = (e: ReactPointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleClick = (id: string) => {
    if (dragging.current) return;
    onSelectShape?.(id);
  };

  const byInset = useMemo(() => {
    const m = new Map<string, ShapeGeometry[]>();
    for (const inset of INSETS)
      m.set(
        inset.id,
        SHAPES.filter((s) => s.inset === inset.id),
      );
    return m;
  }, []);

  const homeSet = useMemo(() => new Set(homeShapeIds), [homeShapeIds]);

  const classFor = (id: string) =>
    [
      "shape",
      selectedShapeIds?.has(id) ? "is-selected" : "",
      highlightedShapeIds?.has(id) ? "is-highlighted" : "",
      homeSet.has(id) ? "is-home" : "",
      hovered === id ? "is-hovered" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const renderShapes = (insetId: string, scale = 1) =>
    byInset.get(insetId)?.map((s) => {
      const fill = fillFor?.(s.id);
      const style = fill ? { fill } : undefined;
      if (s.tiny) {
        return (
          <circle
            key={s.id}
            className={classFor(s.id) + " is-marker"}
            cx={s.centroid[0]}
            cy={s.centroid[1]}
            r={4 / scale}
            style={style}
            data-shape={s.id}
            onPointerEnter={() => handleEnter(s.id)}
            onPointerLeave={handleLeave}
            onClick={() => handleClick(s.id)}
          />
        );
      }
      const hatched = hatchFor?.(s.id) ?? false;
      return (
        <g key={s.id}>
          <path
            className={classFor(s.id)}
            d={s.path}
            style={style}
            data-shape={s.id}
            onPointerEnter={() => handleEnter(s.id)}
            onPointerLeave={handleLeave}
            onClick={() => handleClick(s.id)}
          />
          {hatched && <path className="hatch" d={s.path} fill="url(#hatch)" />}
        </g>
      );
    });

  /**
   * A house at the centroid of the first shape of a home code, drawn after
   * the shapes so it sits on top. Scaled by 1/k so it stays the same size on
   * screen at any zoom. Pointer events pass through to the shape beneath.
   */
  const renderHome = (insetId: string, ids: readonly string[] | undefined, mine: boolean) => {
    const shape = ids?.[0] ? getShape(ids[0]) : undefined;
    if (!shape || shape.inset !== insetId) return null;
    const k = insetId === "main" ? transform.k : 1;
    const [cx, cy] = shape.centroid;
    return (
      <g
        className={"home-marker" + (mine ? "" : " is-theirs")}
        transform={`translate(${cx} ${cy}) scale(${1 / k})`}
        data-home={mine ? "mine" : "theirs"}
      >
        <circle className="home-marker-disc" r={9} />
        <path
          className="home-marker-house"
          d={HOUSE_PATH}
          transform="translate(-6 -6) scale(0.5)"
        />
      </g>
    );
  };

  const zoomed = transform.k !== 1 || transform.x !== 0 || transform.y !== 0;

  const zoomBy = (factor: number) => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (svg && z) select(svg).transition().duration(250).call(z.scaleBy, factor);
  };

  // Each inset is its own SVG cropped to its frame, so CSS can pin them to the
  // bottom of the map area whatever the container's shape.
  const renderInset = (inset: Inset) => (
    <svg
      key={inset.id}
      className={`inset inset-${inset.id}`}
      viewBox={`${inset.frame.x} ${inset.frame.y} ${inset.frame.width} ${inset.frame.height}`}
      role="img"
      aria-label={inset.label}
      data-inset={inset.id}
    >
      <rect
        className="inset-frame"
        x={inset.frame.x}
        y={inset.frame.y}
        width={inset.frame.width}
        height={inset.frame.height}
        rx={4}
      />
      <text
        className="inset-label"
        x={inset.frame.x + 6}
        y={inset.frame.y + inset.frame.height - 5}
      >
        {inset.label}
      </text>
      {renderShapes(inset.id)}
      {renderHome(inset.id, theirHomeShapeIds, false)}
      {renderHome(inset.id, homeShapeIds, true)}
    </svg>
  );
  const inset = (id: string) => INSETS.find((i) => i.id === id)!;

  return (
    <div className="map-container" ref={containerRef} onPointerMove={handleMove}>
      <svg
        ref={svgRef}
        className="map-svg"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-label="Map of North American area codes"
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelectShape?.(null);
        }}
      >
        <defs>
          <pattern
            id="hatch"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="6" className="hatch-line" />
          </pattern>
        </defs>
        <g className="main" transform={transform.toString()}>
          {renderShapes("main", transform.k)}
          {renderHome("main", theirHomeShapeIds, false)}
          {renderHome("main", homeShapeIds, true)}
        </g>
      </svg>

      <div className="insets">
        <div className="insets-left">
          {renderInset(inset("alaska"))}
          <div className="insets-stack">
            {renderInset(inset("pacific"))}
            {renderInset(inset("hawaii"))}
          </div>
        </div>
        {renderInset(inset("caribbean"))}
      </div>

      <div className="map-controls">
        <button
          type="button"
          className="map-control"
          aria-label="Zoom in"
          title="Zoom in"
          disabled={transform.k >= MAX_ZOOM}
          onClick={() => zoomBy(1.6)}
        >
          +
        </button>
        <button
          type="button"
          className="map-control"
          aria-label="Zoom out"
          title="Zoom out"
          disabled={transform.k <= MIN_ZOOM}
          onClick={() => zoomBy(1 / 1.6)}
        >
          −
        </button>
        {zoomed && (
          <button
            type="button"
            className="map-control map-reset"
            aria-label="Reset view"
            title="Reset view"
            onClick={resetZoom}
          >
            ⟲
          </button>
        )}
      </div>
      {hovered && pointer && renderTooltip && (
        <div className="map-tooltip" style={{ left: pointer.x, top: pointer.y }} role="tooltip">
          {renderTooltip(hovered)}
        </div>
      )}
    </div>
  );
});
