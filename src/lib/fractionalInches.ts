/**
 * Shared fractional-inch display/parse layer (New Order 1.3). All board
 * dimensions are stored internally as plain decimal inches (CAD_MANIFESTO.md
 * Law 1) — this module only converts at the display/input boundary and never
 * becomes a second source of truth.
 */

/**
 * 1/64" is the real-world ceiling for wood measurement (a standard tape
 * measure/rule's finest marking) — do not extend this further (e.g. 1/256).
 */
const DEFAULT_DENOMINATOR = 64;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Format decimal inches as a mixed-number fractional string, e.g. 24.5 -> `24 1/2"`. */
export function formatFractionalInches(
  value: number,
  denominator = DEFAULT_DENOMINATOR
): string {
  const negative = value < 0;
  const abs = Math.abs(value);
  let whole = Math.floor(abs);
  let numerator = Math.round((abs - whole) * denominator);

  if (numerator === denominator) {
    whole += 1;
    numerator = 0;
  }

  let denom = denominator;
  if (numerator > 0) {
    const d = gcd(numerator, denom);
    numerator /= d;
    denom /= d;
  }

  const sign = negative ? '-' : '';
  if (numerator === 0) return `${sign}${whole}"`;
  if (whole === 0) return `${sign}${numerator}/${denom}"`;
  return `${sign}${whole} ${numerator}/${denom}"`;
}

/**
 * Parse a fractional/mixed/decimal inch string back to decimal inches.
 * Accepts "24", "24.5", "1/2", "24 1/2", "24-1/2", with or without a
 * trailing `"`. Returns null if the text can't be parsed.
 */
export function parseFractionalInches(input: string): number | null {
  const cleaned = input.trim().replace(/"/g, '');
  if (!cleaned) return null;

  const negative = cleaned.startsWith('-');
  const body = negative ? cleaned.slice(1).trim() : cleaned;

  const match = body.match(
    /^(\d+(?:\.\d+)?)?\s*[- ]?\s*(\d+)\/(\d+)$|^(\d+(?:\.\d+)?)$/
  );
  if (!match) return null;

  let value: number;
  if (match[4] !== undefined) {
    value = parseFloat(match[4]);
  } else {
    const whole = match[1] ? parseFloat(match[1]) : 0;
    const numerator = parseFloat(match[2]);
    const denominator = parseFloat(match[3]);
    if (denominator === 0) return null;
    value = whole + numerator / denominator;
  }

  if (!Number.isFinite(value)) return null;
  return negative ? -value : value;
}
