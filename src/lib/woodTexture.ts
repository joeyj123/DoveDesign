import * as THREE from 'three';

// Cached base textures (shared by all boards of the same color/type)
const grainCache = new Map<string, THREE.CanvasTexture>();
let roughnessTex: THREE.CanvasTexture | null = null;

// ─── Seeded pseudo-random (deterministic per color) ────────────────────────
function makeRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Face grain texture (runs along board length) ─────────────────────────
export function getWoodGrainTexture(hexColor: string): THREE.CanvasTexture {
  if (grainCache.has(hexColor)) return grainCache.get(hexColor)!;

  const W = 512, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const seed = r * 65521 + g * 257 + b;
  const rng = makeRng(seed);

  // Base colour
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, W, H);

  // Subtle base variation — lighter stripe down centre (ray-fleck effect)
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,   `rgba(255,255,255,0.04)`);
  grad.addColorStop(0.5, `rgba(255,255,255,0.10)`);
  grad.addColorStop(1,   `rgba(255,255,255,0.04)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Long grain lines — run horizontally (along board length = U direction)
  for (let i = 0; i < 70; i++) {
    const y0     = rng() * H;
    const dark   = 0.06 + rng() * 0.28;
    const lw     = 0.4 + rng() * 2.8;
    const freq   = 0.015 + rng() * 0.04;
    const phase  = rng() * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(0, y0);
    for (let x = 0; x <= W; x += 4) {
      ctx.lineTo(x, y0 + Math.sin(x * freq + phase) * 4);
    }
    ctx.lineWidth = lw;
    ctx.strokeStyle = `rgba(${Math.round(r * (1 - dark))},${Math.round(g * (1 - dark))},${Math.round(b * (1 - dark))},${0.5 + rng() * 0.5})`;
    ctx.stroke();
  }

  // Occasional knot
  if (rng() > 0.35) {
    const kx = W * 0.2 + rng() * W * 0.6;
    const ky = H * 0.2 + rng() * H * 0.6;
    const kg = ctx.createRadialGradient(kx, ky, 0, kx, ky, 28 + rng() * 18);
    kg.addColorStop(0,   `rgba(${Math.round(r * 0.45)},${Math.round(g * 0.35)},${Math.round(b * 0.25)},0.55)`);
    kg.addColorStop(0.5, `rgba(${Math.round(r * 0.75)},${Math.round(g * 0.68)},${Math.round(b * 0.6)},0.30)`);
    kg.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = kg;
    ctx.save();
    ctx.translate(kx, ky);
    ctx.scale(1, 0.55);
    ctx.translate(-kx, -ky);
    ctx.beginPath();
    ctx.arc(kx, ky, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  // Tile once along length, once across width — looks natural at standard sizes
  tex.repeat.set(2, 1);
  grainCache.set(hexColor, tex);
  return tex;
}

// ─── Roughness map (grayscale — bright = rough, dark = smooth) ────────────
export function getRoughnessTexture(): THREE.CanvasTexture {
  if (roughnessTex) return roughnessTex;

  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const d = ctx.createImageData(S, S);

  for (let i = 0; i < d.data.length; i += 4) {
    const x = (i / 4) % S;
    const y = Math.floor((i / 4) / S);
    // Multi-octave sine noise — gives fibre-like micro-texture
    const v = Math.round(
      155 +
      Math.sin(x * 0.35) * 22 +
      Math.sin(y * 0.28 + x * 0.08) * 18 +
      Math.sin(x * 1.1  + y * 0.9)  * 12 +
      Math.sin(x * 2.3  - y * 1.7)  *  6
    );
    const c = Math.max(0, Math.min(255, v));
    d.data[i] = d.data[i + 1] = d.data[i + 2] = c;
    d.data[i + 3] = 255;
  }
  ctx.putImageData(d, 0, 0);

  roughnessTex = new THREE.CanvasTexture(canvas);
  roughnessTex.wrapS = THREE.RepeatWrapping;
  roughnessTex.wrapT = THREE.RepeatWrapping;
  roughnessTex.repeat.set(3, 3);
  return roughnessTex;
}

// ─── End-grain texture (concentric rings for board ends) ──────────────────
export function getEndGrainTexture(hexColor: string): THREE.CanvasTexture {
  // Reuse per-color cache with a prefix
  const key = `endgrain-${hexColor}`;
  if (grainCache.has(key)) return grainCache.get(key)!;

  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, S, S);

  const cx = S / 2, cy = S / 2;
  for (let ring = 3; ring < 110; ring += 4 + Math.sin(ring) * 2) {
    const dark = 0.05 + (ring % 8 < 4 ? 0.12 : 0);
    ctx.beginPath();
    ctx.arc(cx, cy, ring, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = `rgba(${Math.round(r * (1 - dark))},${Math.round(g * (1 - dark))},${Math.round(b * (1 - dark))},0.6)`;
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  grainCache.set(key, tex);
  return tex;
}
