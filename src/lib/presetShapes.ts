/**
 * Preset Shape catalog — regular shapes (circle, square, ...) and joinery-
 * pocket presets (mortise, dovetail socket, ...), each a pure normalized
 * point template scaled by one live "size" number (the Preset Shape tool's
 * single drag-or-type dimension, CutoutDrawTools.tsx) and translated to a
 * placement center. Consumed by the SAME `CutoutProfile.points` shape any
 * hand-sketched Line/Arc profile already produces — no second geometry
 * representation, no engine changes.
 *
 * Scope note: these templates are all defined as INTERIOR pockets — placed
 * fully inside the face, they stay interior pockets. But the Cutout engine
 * (Engine.ts's CUTOUT case) now ALSO detects when a profile's placement
 * carries it across one edge of the face and reshapes both that face and
 * its adjacent neighbor into a real rabbet/edge-notch (see
 * `buildEdgeNotchFeature` in Engine.ts) — so dragging any of these presets
 * (a Rectangular Slot, a Mortise, ...) out to touch a face edge produces a
 * genuine edge-crossing cut, not just a pocket that happens to look clipped.
 * A profile crossing TWO edges at once (a corner notch) isn't supported yet
 * and is a safe no-op — a separate future capability.
 */

export type ShapeCategory = 'regular' | 'joinery-simple' | 'joinery-intermediate' | 'joinery-advanced';

export interface PresetShapeDef {
  id: string;
  label: string;
  category: ShapeCategory;
  /** What the single drag/type dimension represents, for the live readout. */
  sizeLabel: string;
  defaultSize: number;
  /** Unit template scaled by `size`, centered on (0, 0) — never pre-translated. */
  template: (size: number) => { u: number; v: number }[];
}

function regularPolygon(sides: number, size: number, rotationOffset = -Math.PI / 2): { u: number; v: number }[] {
  const pts: { u: number; v: number }[] = [];
  for (let i = 0; i < sides; i++) {
    const a = rotationOffset + (i / sides) * Math.PI * 2;
    pts.push({ u: Math.cos(a) * size, v: Math.sin(a) * size });
  }
  return pts;
}

function rectangleTemplate(halfU: number, halfV: number) {
  return (size: number) => [
    { u: -halfU * size, v: -halfV * size },
    { u: halfU * size, v: -halfV * size },
    { u: halfU * size, v: halfV * size },
    { u: -halfU * size, v: halfV * size },
  ];
}

/** A trapezoid "female" dovetail socket — narrow mouth flaring wider toward
 * the base, at the given half-angle (common woodworking ratios: 1:4 steep,
 * 1:6 standard, 1:8 subtle). `size` is the socket's own half-depth. */
function dovetailSocketTemplate(halfAngleDeg: number) {
  return (size: number) => {
    const depth = size;
    const mouthHalfWidth = size * 0.5;
    const flare = depth * Math.tan((halfAngleDeg * Math.PI) / 180);
    return [
      { u: -mouthHalfWidth, v: -depth },
      { u: mouthHalfWidth, v: -depth },
      { u: mouthHalfWidth + flare, v: depth },
      { u: -mouthHalfWidth - flare, v: depth },
    ];
  };
}

export const PRESET_SHAPES: PresetShapeDef[] = [
  // Regular shapes
  { id: 'circle', label: 'Circle', category: 'regular', sizeLabel: 'Radius', defaultSize: 1.5, template: (s) => regularPolygon(32, s) },
  { id: 'square', label: 'Square', category: 'regular', sizeLabel: 'Half-Width', defaultSize: 1.5, template: rectangleTemplate(1, 1) },
  { id: 'rectangle', label: 'Rectangle', category: 'regular', sizeLabel: 'Scale', defaultSize: 1.2, template: rectangleTemplate(1.6, 1) },
  { id: 'triangle', label: 'Triangle', category: 'regular', sizeLabel: 'Radius', defaultSize: 1.5, template: (s) => regularPolygon(3, s) },
  { id: 'hexagon', label: 'Hexagon', category: 'regular', sizeLabel: 'Radius', defaultSize: 1.5, template: (s) => regularPolygon(6, s) },
  { id: 'octagon', label: 'Octagon', category: 'regular', sizeLabel: 'Radius', defaultSize: 1.5, template: (s) => regularPolygon(8, s) },

  // Joinery — Simple
  { id: 'bore-hole', label: 'Bore Hole', category: 'joinery-simple', sizeLabel: 'Radius', defaultSize: 0.75, template: (s) => regularPolygon(24, s) },
  { id: 'square-socket', label: 'Square Socket', category: 'joinery-simple', sizeLabel: 'Half-Width', defaultSize: 1, template: rectangleTemplate(1, 1) },
  { id: 'rect-slot', label: 'Rectangular Slot', category: 'joinery-simple', sizeLabel: 'Half-Height', defaultSize: 0.75, template: rectangleTemplate(3, 1) },

  // Joinery — Intermediate
  { id: 'mortise', label: 'Mortise', category: 'joinery-intermediate', sizeLabel: 'Half-Height', defaultSize: 1, template: rectangleTemplate(2.2, 1) },
  { id: 'blind-dado', label: 'Blind Dado', category: 'joinery-intermediate', sizeLabel: 'Half-Height', defaultSize: 0.6, template: rectangleTemplate(5, 1) },
  { id: 'hex-socket', label: 'Hex Socket', category: 'joinery-intermediate', sizeLabel: 'Radius', defaultSize: 1, template: (s) => regularPolygon(6, s) },

  // Joinery — Advanced (dovetail-family sockets)
  { id: 'dovetail-1-4', label: 'Dovetail Socket (1:4)', category: 'joinery-advanced', sizeLabel: 'Half-Depth', defaultSize: 1, template: dovetailSocketTemplate(14.04) },
  { id: 'dovetail-1-6', label: 'Dovetail Socket (1:6)', category: 'joinery-advanced', sizeLabel: 'Half-Depth', defaultSize: 1, template: dovetailSocketTemplate(9.46) },
  { id: 'dovetail-1-8', label: 'Dovetail Socket (1:8)', category: 'joinery-advanced', sizeLabel: 'Half-Depth', defaultSize: 1, template: dovetailSocketTemplate(7.13) },
];

export const SHAPE_CATEGORY_ORDER: ShapeCategory[] = ['regular', 'joinery-simple', 'joinery-intermediate', 'joinery-advanced'];

export const SHAPE_CATEGORY_LABELS: Record<ShapeCategory, string> = {
  regular: 'Regular Shapes',
  'joinery-simple': 'Joinery — Simple',
  'joinery-intermediate': 'Joinery — Intermediate',
  'joinery-advanced': 'Joinery — Advanced',
};

export function getPresetShape(id: string): PresetShapeDef | undefined {
  return PRESET_SHAPES.find((s) => s.id === id);
}

/** Minimum size floor — keeps a bare click (no drag, no typed value) from
 * committing a degenerate zero-area loop that would stall/produce nothing
 * once it reaches Engine.ts's keyhole triangulation. */
const MIN_SIZE = 0.05;

export function generatePresetShapePoints(
  id: string,
  size: number,
  center: { u: number; v: number }
): { u: number; v: number }[] {
  const def = getPresetShape(id);
  if (!def) return [];
  const clamped = Math.max(size, MIN_SIZE);
  return def.template(clamped).map((p) => ({ u: p.u + center.u, v: p.v + center.v }));
}
