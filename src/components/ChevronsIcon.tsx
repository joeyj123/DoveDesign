/**
 * Shared double-chevron (») expand/collapse indicator (New Order 5.3).
 *
 * Every expand/collapse affordance in the app (Board Properties, Entities,
 * the Transform/Create rail flyouts, the right-panel collapse toggle) now
 * renders this exact glyph instead of each owning its own arrow icon —
 * previously PropertiesPanel had its own two-path double-chevron and
 * ToolRail had a smaller single-arrow style; those diverged visually even
 * though they mean the same thing to the user ("click to expand/collapse").
 *
 * The base glyph points down. `direction` rotates it: 'down' (open/expand-
 * downward, the default rest state), 'right' (collapsed, more content this
 * way), 'left' (re-expand, pointing back into the screen), 'up' (rarer,
 * included for completeness).
 */
type Direction = 'down' | 'up' | 'left' | 'right';

const ROTATION: Record<Direction, string> = {
  down: 'rotate-0',
  right: '-rotate-90',
  left: 'rotate-90',
  up: 'rotate-180',
};

export default function ChevronsIcon({
  direction,
  className,
}: {
  direction: Direction;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-150 ${ROTATION[direction]} ${className ?? ''}`}
    >
      <path d="M7 8l5 5 5-5" />
      <path d="M7 14l5 5 5-5" />
    </svg>
  );
}
