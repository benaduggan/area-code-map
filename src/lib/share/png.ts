/**
 * Render the map to a PNG in the browser: the main map at its home view
 * (whatever the current pan/zoom) plus the inset SVGs where they sit on
 * screen, with the stat cards and the legend painted on top and a single header
 * bar carrying the title and the site. CSS classes do not carry into a
 * serialized SVG, so computed fill/stroke are copied onto each mark first.
 * Nothing here touches the network.
 */
const EXPORT_SCALE = 2;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export interface PngColors {
  background: string;
  page: string;
  card: string;
  border: string;
  text: string;
  muted: string;
}

export interface PngOptions {
  title: string;
  cards: { value: number; label: string }[];
  legend: { color: string; label: string }[];
  colors: PngColors;
  /** Selector for elements to leave out of the image, e.g. a home marker. */
  exclude?: string;
}

interface Piece {
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
}

export async function mapToPngBlob(root: HTMLElement, options: PngOptions): Promise<Blob> {
  const rootRect = root.getBoundingClientRect();
  const width = Math.round(rootRect.width);
  const height = Math.round(rootRect.height);
  const headerHeight = 44;

  const pieces: Piece[] = [];
  const urls: string[] = [];
  try {
    for (const svg of Array.from(root.querySelectorAll<SVGSVGElement>("svg"))) {
      const rect = svg.getBoundingClientRect();
      const clone = inlineStyles(svg, options.exclude);
      const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(clone)], {
          type: "image/svg+xml;charset=utf-8",
        }),
      );
      urls.push(url);
      pieces.push({
        img: await loadImage(url),
        x: rect.left - rootRect.left,
        y: rect.top - rootRect.top,
        w: rect.width,
        h: rect.height,
      });
    }

    const canvas = document.createElement("canvas");
    canvas.width = width * EXPORT_SCALE;
    canvas.height = (headerHeight + height) * EXPORT_SCALE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
    const c = options.colors;

    ctx.fillStyle = c.page;
    ctx.fillRect(0, 0, width, headerHeight + height);
    ctx.fillStyle = c.background;
    ctx.fillRect(0, headerHeight, width, height);
    for (const p of pieces) ctx.drawImage(p.img, p.x, headerHeight + p.y, p.w, p.h);

    // Header: title on the left, where the image came from on the right. The
    // stat cards already say what the caption used to, so there is no footer.
    ctx.textBaseline = "middle";
    ctx.fillStyle = c.text;
    ctx.font = `700 20px ${FONT}`;
    ctx.fillText(options.title, 16, headerHeight / 2);
    ctx.fillStyle = c.muted;
    ctx.font = `400 12px ${FONT}`;
    const site = location.host + location.pathname.replace(/\/$/, "");
    ctx.fillText(site, width - 16 - ctx.measureText(site).width, headerHeight / 2);

    // Stat cards, top-left of the map (open ocean in this projection)
    const cardH = 48;
    const gap = 8;
    let x = 12;
    const y = headerHeight + 12;
    for (const card of options.cards) {
      ctx.font = `400 11px ${FONT}`;
      const cardW = Math.max(96, ctx.measureText(card.label).width + 22);
      roundRect(ctx, x, y, cardW, cardH, 8, c.card, c.border);
      ctx.fillStyle = c.text;
      ctx.font = `700 20px ${FONT}`;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(card.value.toLocaleString(), x + 10, y + 24);
      ctx.fillStyle = c.muted;
      ctx.font = `400 11px ${FONT}`;
      ctx.fillText(card.label, x + 10, y + 39);
      x += cardW + gap;
    }

    // Legend, under the cards
    if (options.legend.length) {
      const ly = y + cardH + 10;
      let lx = 12;
      ctx.textBaseline = "middle";
      ctx.font = `400 12px ${FONT}`;
      for (const item of options.legend) {
        roundRect(ctx, lx, ly, 12, 12, 2, item.color, null);
        ctx.fillStyle = c.text;
        ctx.fillText(item.label, lx + 17, ly + 6);
        lx += 17 + ctx.measureText(item.label).width + 14;
      }
    }

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("PNG encoding failed"))),
        "image/png",
      ),
    );
  } finally {
    for (const u of urls) URL.revokeObjectURL(u);
  }
}

/** Clone an SVG with computed styles inlined and the main group reset to the home view. */
function inlineStyles(svg: SVGSVGElement, exclude?: string): SVGSVGElement {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const originals = svg.querySelectorAll<SVGElement>("path, circle, rect, text, line");
  const copies = clone.querySelectorAll<SVGElement>("path, circle, rect, text, line");
  originals.forEach((el, i) => {
    const copy = copies[i];
    if (!copy) return;
    const cs = getComputedStyle(el);
    copy.removeAttribute("class");
    copy.setAttribute("fill", cs.fill);
    copy.setAttribute("stroke", cs.stroke);
    copy.setAttribute("stroke-width", cs.strokeWidth);
    copy.setAttribute("stroke-linejoin", cs.strokeLinejoin);
    copy.setAttribute("opacity", cs.opacity);
    if (el instanceof SVGTextElement) {
      copy.setAttribute("font-size", cs.fontSize);
      copy.setAttribute("font-family", cs.fontFamily);
    }
    copy.style.transition = "";
  });
  clone.querySelector(".main")?.setAttribute("transform", "");
  if (exclude) clone.querySelectorAll(exclude).forEach((el) => el.remove());
  // Home markers are scaled by 1/zoom on screen; the export shows the home view.
  clone.querySelectorAll<SVGElement>(".home-marker").forEach((el) => {
    el.setAttribute(
      "transform",
      (el.getAttribute("transform") ?? "").replace(/scale\([^)]*\)/, ""),
    );
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const rect = svg.getBoundingClientRect();
  clone.setAttribute("width", String(Math.max(1, Math.round(rect.width))));
  clone.setAttribute("height", String(Math.max(1, Math.round(rect.height))));
  return clone;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  stroke: string | null,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not render map image"));
    img.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
