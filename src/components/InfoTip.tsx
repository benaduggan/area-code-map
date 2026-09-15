import { useCallback, useEffect, useRef } from "react";
import "./InfoTip.css";

/**
 * A small ⓘ with a hover/focus tooltip; the text is also read by screen readers.
 *
 * The bubble is a popover, so it renders in the top layer rather than inside
 * the sidebar or the welcome form. Both of those scroll, which makes them clip
 * on *both* axes — an absolutely positioned bubble gets sliced by them however
 * high its z-index. The top layer is outside that clip, but it also means the
 * bubble no longer inherits the anchor's position, so we place it by hand and
 * clamp it to the viewport.
 */
export function InfoTip({ text }: { text: string }) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const bubble = bubbleRef.current;
    if (!anchor || !bubble) return;
    const a = anchor.getBoundingClientRect();
    const b = bubble.getBoundingClientRect();
    const margin = 8;

    // Above the icon by preference, below it when there is no room up there.
    const above = a.top - b.height - 6;
    const top = above < margin ? a.bottom + 6 : above;

    // Right-aligned to the icon, then pulled back inside the viewport.
    const ideal = a.right - b.width;
    const max = Math.max(margin, window.innerWidth - b.width - margin);
    const left = Math.min(Math.max(ideal, margin), max);

    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
  }, []);

  const open = useCallback(() => {
    const bubble = bubbleRef.current;
    if (!bubble || bubble.matches(":popover-open")) return;
    bubble.showPopover();
    place();
  }, [place]);

  const close = useCallback(() => {
    const bubble = bubbleRef.current;
    if (bubble?.matches(":popover-open")) bubble.hidePopover();
  }, []);

  // The sidebar scrolls under the bubble, so follow the anchor while open.
  useEffect(() => {
    const onMove = () => {
      if (bubbleRef.current?.matches(":popover-open")) place();
    };
    window.addEventListener("scroll", onMove, { capture: true, passive: true });
    window.addEventListener("resize", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onMove, { capture: true });
      window.removeEventListener("resize", onMove);
    };
  }, [place]);

  return (
    <span
      ref={anchorRef}
      className="info-tip"
      tabIndex={0}
      role="note"
      aria-label={text}
      onPointerEnter={open}
      onPointerLeave={close}
      onFocus={open}
      onBlur={close}
      onClick={() => (bubbleRef.current?.matches(":popover-open") ? close() : open())}
      onKeyDown={(e) => e.key === "Escape" && close()}
    >
      i{/* The label above already carries this text, so it is decorative here. */}
      <span ref={bubbleRef} className="info-tip-bubble" popover="manual" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
