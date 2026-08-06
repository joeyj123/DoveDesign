/**
 * Dove Design mark — two open dovetail-flare pin outlines (not filled),
 * left pin spruce green, right pin orange (mirrored), small center dot.
 * Source shape/colors are the exact SVG in `dovedesign_logo_final_v7.svg`
 * (final design); only the viewBox is cropped tightly to the mark itself
 * (the source's 400x300 canvas + background rect are dropped) so it drops
 * straight into the rail's reserved logo slot at any size via `className`.
 *
 * Unrelated to the disabled Pepe rail placeholder — do not merge/reuse.
 */
export default function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-53 -88 106 176" className={className} aria-hidden="true">
      <polyline points="-50,-35 -16,-85 -16,85 -50,35"
        fill="none" stroke="#7a8b6f" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points="50,-35 16,-85 16,85 50,35"
        fill="none" stroke="#d9772e" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="0" cy="0" r="6" fill="#c9c2b8" />
    </svg>
  );
}
