import * as THREE from 'three';

export interface DimDragState {
  lineId: string;
  endpoint: 'start' | 'end';
  ndc: THREE.Vector2;
}

type Handler = (state: DimDragState) => void;

let activeHandler: Handler | null = null;

/**
 * Tiny pub-sub so dimension-line endpoint handles rendered deep inside a board's
 * mesh (BoardDimensionLines, mounted via WoodBlock) can kick off a drag that's
 * actually driven by the single global DimensionLineRenderer mounted in Viewport.
 */
export const registerDimDragHandler = {
  set(fn: Handler) {
    activeHandler = fn;
  },
  start(state: DimDragState) {
    activeHandler?.(state);
  },
};
