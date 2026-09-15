import { useState } from "react";
import { shareUrlFor } from "../../lib/share/codec";
import { downloadBlob, mapToPngBlob } from "../../lib/share/png";
import "./ShareBar.css";

interface Props {
  counts: ReadonlyMap<string, number>;
  caption: string;
  getSvg: () => SVGSVGElement | null;
}

export function ShareBar({ counts, caption, getSvg }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 2500);
  };

  const copyLink = async () => {
    const url = shareUrlFor(counts);
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied. It contains only your per-area-code counts.");
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const downloadPng = async () => {
    const svg = getSvg();
    if (!svg) return;
    setBusy(true);
    try {
      const cs = getComputedStyle(document.documentElement);
      const blob = await mapToPngBlob(svg, {
        caption,
        background: cs.getPropertyValue("--map-bg").trim() || "#ffffff",
        textColor: cs.getPropertyValue("--fg").trim() || "#000000",
      });
      downloadBlob(blob, "area-code-map.png");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Could not create the image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="share">
      <button type="button" className="btn btn-primary" onClick={() => void copyLink()}>
        Copy share link
      </button>
      <button type="button" className="btn" onClick={() => void downloadPng()} disabled={busy}>
        Download image
      </button>
      {status && (
        <span className="share-status" role="status">
          {status}
        </span>
      )}
    </div>
  );
}
