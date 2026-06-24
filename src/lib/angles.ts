/** Snap a radian angle to the nearest increment (degrees). */
export function snapAngleRadians(radians: number, incrementDeg: number): number {
  const deg = (radians * 180) / Math.PI;
  const snapped = Math.round(deg / incrementDeg) * incrementDeg;
  return (snapped * Math.PI) / 180;
}

export function snapEuler(
  rotation: [number, number, number],
  incrementDeg: number
): [number, number, number] {
  return [
    snapAngleRadians(rotation[0], incrementDeg),
    snapAngleRadians(rotation[1], incrementDeg),
    snapAngleRadians(rotation[2], incrementDeg),
  ];
}

export function radToDeg(r: number): number {
  return (r * 180) / Math.PI;
}

export function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

export const ANGLE_SNAP_OPTIONS = [15, 45, 90] as const;
export type AngleSnapIncrement = (typeof ANGLE_SNAP_OPTIONS)[number];

/** Quick orientation presets for framing (radians). */
export const ROTATION_PRESETS = [
  { label: 'Flat (0°)', rotation: [0, 0, 0] as [number, number, number] },
  { label: 'On edge (90° X)', rotation: [Math.PI / 2, 0, 0] as [number, number, number] },
  { label: 'Vertical leg (90° Z)', rotation: [0, 0, Math.PI / 2] as [number, number, number] },
  { label: 'Turn 90° Y', rotation: [0, Math.PI / 2, 0] as [number, number, number] },
];
