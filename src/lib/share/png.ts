/**
 * Render the live map SVG to a PNG in the browser. CSS classes do not carry
 * into a serialized SVG, so computed fill/stroke are copied onto each mark
 * before serializing. Nothing here touches the network.
 */
const EXPORT_SCALE = 2;

export interface PngOptions {
  caption?: string;
  background: string;
  textColor: string;
}

export async function mapToPngBlob(svg: SVGSVGElement, options: PngOptions): Promise<Blob> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const originals = svg.querySelectorAll<SVGElement>("path, circle, rect, text");
  const copies = clone.querySelectorAll<SVGElement>("path, circle, rect, text");
  originals.forEach((el, i) => {
    const copy = copies[i];
    if (!copy) return;
    const cs = getComputedStyle(el);
    copy.removeAttribute("class");
    copy.setAttribute("fill", cs.fill);
    copy.setAttribute("stroke", cs.stroke);
    copy.setAttribute("stroke-width", cs.strokeWidth);
    copy.setAttribute("stroke-linejoin", cs.strokeLinejoin);
    if (el instanceof SVGTextElement) {
      copy.setAttribute("font-size", cs.fontSize);
      copy.setAttribute("font-family", cs.fontFamily);
    }
    // Inline fills set via style attribute survive cloning; drop transitions.
    copy.style.transition = "";
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const viewBox = svg.viewBox.baseVal;
  const width = viewBox.width;
  const height = viewBox.height;
  const captionHeight = options.caption ? 40 : 0;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = width * EXPORT_SCALE;
    canvas.height = (height + captionHeight) * EXPORT_SCALE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height + captionHeight);
    ctx.drawImage(img, 0, 0, width, height);
    if (options.caption) {
      ctx.fillStyle = options.textColor;
      ctx.font = "600 16px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(options.caption, 16, height + captionHeight / 2);
    }
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("PNG encoding failed"))),
        "image/png",
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
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
