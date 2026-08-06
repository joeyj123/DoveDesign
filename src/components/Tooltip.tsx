import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

/**
 * Data Flow Pipeline: Tooltip (New Order 5.1, portal + edge-aware New Order 6.3)
 *
 * INPUT: an `info` object (label, description, optional keyboard shortcut)
 *   passed in by whichever control is wrapping itself — the rail buttons,
 *   panel fields, and Entities row icons each own their own metadata. This
 *   component never hardcodes tooltip copy itself, so it stays a single
 *   reusable pattern.
 *
 * CALCULATION: purely hover-state UI chrome, not board geometry. New Order
 *   6.3 fix 1: the bubble's on-screen position is measured against the
 *   trigger's own getBoundingClientRect() and the viewport, then flipped to
 *   the opposite side if the preferred side would overflow — the same
 *   measure-then-flip pattern ToolRail.tsx's Transform/Create flyout already
 *   uses (New Order 6.2). Root cause of the Profile panel's Line/Arc/
 *   Freehand tooltips getting clipped: they were absolutely-positioned
 *   descendants of PropertiesPanel's scrollable, overflow-hidden content
 *   area, so even a tooltip that stayed within the viewport could still get
 *   clipped by that ANCESTOR's overflow — a plain side-flip alone can't fix
 *   that. Fixed at the structural level instead: the bubble now renders via
 *   a portal straight to document.body (`position: fixed`), so no ancestor's
 *   overflow can ever clip it, full stop — the edge-aware flip on top of
 *   that keeps it fully on-screen too.
 *
 * OUTPUT: none stored — purely a rendering wrapper around its children.
 *
 * FOLLOWS-BOARD CHECK: n/a — UI chrome only.
 */
export interface TooltipInfo {
  label: string;
  description: string;
  shortcut?: string;
}

const GAP = 8; // px between trigger and bubble — matches the old mb-2/mr-2 (0.5rem)
const VIEWPORT_MARGIN = 8; // px minimum clearance kept from every viewport edge

export default function Tooltip({
  info,
  side = 'top',
  children,
  className,
}: {
  info: TooltipInfo;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!visible) {
      setPos(null);
      return;
    }
    const anchor = anchorRef.current;
    const bubble = bubbleRef.current;
    if (!anchor || !bubble) return;

    const anchorRect = anchor.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    let resolved = side;
    if (side === 'left' && anchorRect.left - bubbleRect.width - GAP < VIEWPORT_MARGIN) resolved = 'right';
    else if (side === 'right' && anchorRect.right + bubbleRect.width + GAP > vw - VIEWPORT_MARGIN) resolved = 'left';
    else if (side === 'top' && anchorRect.top - bubbleRect.height - GAP < VIEWPORT_MARGIN) resolved = 'bottom';
    else if (side === 'bottom' && anchorRect.bottom + bubbleRect.height + GAP > vh - VIEWPORT_MARGIN) resolved = 'top';

    let top = 0;
    let left = 0;
    if (resolved === 'top') {
      top = anchorRect.top - bubbleRect.height - GAP;
      left = anchorRect.left + anchorRect.width / 2 - bubbleRect.width / 2;
    } else if (resolved === 'bottom') {
      top = anchorRect.bottom + GAP;
      left = anchorRect.left + anchorRect.width / 2 - bubbleRect.width / 2;
    } else if (resolved === 'left') {
      top = anchorRect.top + anchorRect.height / 2 - bubbleRect.height / 2;
      left = anchorRect.left - bubbleRect.width - GAP;
    } else {
      top = anchorRect.top + anchorRect.height / 2 - bubbleRect.height / 2;
      left = anchorRect.right + GAP;
    }

    // Clamp against the OTHER pair of edges too (e.g. a top/bottom tooltip
    // near the screen's left or right side) — the side flip above only
    // handles the axis the tooltip actually opens along.
    left = Math.min(Math.max(left, VIEWPORT_MARGIN), vw - bubbleRect.width - VIEWPORT_MARGIN);
    top = Math.min(Math.max(top, VIEWPORT_MARGIN), vh - bubbleRect.height - VIEWPORT_MARGIN);

    setPos({ top, left });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, side]);

  return (
    <span
      ref={anchorRef}
      className={`inline-flex ${className ?? ''}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible &&
        createPortal(
          <span
            ref={bubbleRef}
            role="tooltip"
            className="pointer-events-none fixed z-[100] w-max max-w-56 rounded border border-charcoal-700 bg-charcoal-900 px-2 py-1.5 text-xs shadow-lg"
            style={{
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              visibility: pos ? 'visible' : 'hidden',
            }}
          >
            <span className="block font-semibold text-white">
              {info.label}
              {info.shortcut && <span className="ml-1 font-normal text-charcoal-400">({info.shortcut})</span>}
            </span>
            <span className="block text-charcoal-400">{info.description}</span>
          </span>,
          document.body
        )}
    </span>
  );
}
