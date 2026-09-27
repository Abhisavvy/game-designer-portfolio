import type { MouseEvent } from "react";

/** Left click, no modifier keys, default not already prevented — the only clicks this feature intercepts. */
export function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.defaultPrevented
  );
}

export interface ArtworkSnapshot {
  top: number;
  left: number;
  width: number;
  height: number;
  /** `img.currentSrc` — the exact srcset candidate the browser already
   *  decoded, not the raw `src`/poster URL — so a clone painted from it
   *  never has to re-fetch or paint progressively. */
  currentSrc: string;
  objectPosition: string;
}

/** Finds the `<img>` inside `container` (a card's artwork box, filled via
 *  next/image's `fill`, so the img's own rect exactly matches that box) and
 *  snapshots exactly what's needed to clone it pixel-for-pixel: shared by
 *  both CollectibleCard and LoomCard's activation handlers. */
export function captureArtwork(container: HTMLElement | null): ArtworkSnapshot | null {
  const img = container?.querySelector("img");
  if (!img) return null;
  const rect = img.getBoundingClientRect();
  const objectPosition = getComputedStyle(img).objectPosition || "center";
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    currentSrc: img.currentSrc || img.src,
    objectPosition,
  };
}
