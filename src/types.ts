// ─── Wood Classification ───────────────────────────────────────────────────

export type WoodCategory =
  | 'Hardwood'
  | 'Softwood'
  | 'Engineered'
  | 'Construction';

export type NominalSize =
  | '1x2' | '1x3' | '1x4' | '1x6' | '1x8' | '1x10' | '1x12'
  | '2x2' | '2x4' | '2x6' | '2x8' | '2x10' | '2x12'
  | '4x4' | '4x6'
  | 'Custom';

export const NOMINAL_DIMENSIONS: Record<
  Exclude<NominalSize, 'Custom'>,
  { thickness: number; width: number }
> = {
  '1x2':  { thickness: 0.75, width: 1.5   },
  '1x3':  { thickness: 0.75, width: 2.5   },
  '1x4':  { thickness: 0.75, width: 3.5   },
  '1x6':  { thickness: 0.75, width: 5.5   },
  '1x8':  { thickness: 0.75, width: 7.25  },
  '1x10': { thickness: 0.75, width: 9.25  },
  '1x12': { thickness: 0.75, width: 11.25 },
  '2x2':  { thickness: 1.5,  width: 1.5   },
  '2x4':  { thickness: 1.5,  width: 3.5   },
  '2x6':  { thickness: 1.5,  width: 5.5   },
  '2x8':  { thickness: 1.5,  width: 7.25  },
  '2x10': { thickness: 1.5,  width: 9.25  },
  '2x12': { thickness: 1.5,  width: 11.25 },
  '4x4':  { thickness: 3.5,  width: 3.5   },
  '4x6':  { thickness: 3.5,  width: 5.5   },
};

// ─── Tool Operations (CSG cuts) ────────────────────────────────────────────

export type CutType =
  | 'crossCut'
  | 'ripCut'
  | 'miterCut'
  | 'bevelCut'
  | 'pocketHole'
  | 'fingerJoint'
  | 'dovetail'
  | 'boxJoint';

/** Position along board length from the start face (inches). */
export type CutEnd = 'start' | 'end';

export interface CutOperation {
  id: string;
  type: CutType;
  /** Offset along board length from start face (inches). Used by crossCut. */
  position?: number;
  /** Offset along board width from center (inches). Legacy ripCut field. */
  ripOffset?: number;
  /** Final board width after rip (inches). Removes outer waste via CSG. */
  targetWidth?: number;
  /** Which width edge to keep when ripping. */
  ripKeepEdge?: 'start' | 'end';
  /** Which end face for miter/bevel/joinery (inches from that end). */
  end?: CutEnd;
  /** Blade angle in degrees (45 = standard miter). */
  angle?: number;
  /** Cut width / kerf zone (inches). */
  width?: number;
  /** Cut depth (inches) — pocket holes, partial rips. */
  depth?: number;
  /** Partner member for mating joinery. */
  partnerMemberId?: string;
  /** Finger/dovetail count. */
  fingerCount?: number;
  /** Pocket hole diameter (inches). */
  diameter?: number;
}

// ─── Wood Member ───────────────────────────────────────────────────────────

export type BeamOrientation = 'flat' | 'onEdge';
export type MaterialKind = 'dimensional' | 'sheet';
export type PriceUnit = 'LF' | 'BF' | 'SF';

export type WoodShapeType =
  | 'box'
  | 'cylinder'
  | 'sphere'
  | 'cone'
  | 'triangularPrism'
  | 'hexagonalPrism'
  | 'customPolygon';

// ─── Centerline Markers ───────────────────────────────────────────────────

export interface CenterlineMarker {
  id: string;
  /** Which face (0=xMin 1=xMax 2=yMin 3=yMax 4=zMin 5=zMax) */
  faceIndex: number;
  /** Which axis the centerline runs along */
  axis: 'x' | 'y' | 'z';
  /** Face normal direction (face index converted) */
  faceNormal: [number, number, number];
}

// ─── Board Finish ────────────────────────────────────────────────────────

export type BoardFinishType = 'none' | 'stain' | 'paint' | 'clear_coat' | 'oil';
export type FinishSheen = 'matte' | 'satin' | 'gloss';

export interface BoardFinish {
  type: BoardFinishType;
  color?: string;   // hex (for stain and paint)
  sheen?: FinishSheen;
}

export interface WoodMember {
  id: string;
  label: string;
  category: WoodCategory;
  species: string;
  nominalSize: NominalSize;
  thickness: number;              // inches (actual/surfaced)
  width: number;                  // inches
  length: number;                 // inches
  position: [number, number, number];
  rotation: [number, number, number];
  costPerBoardFoot: number;
  color: string;                  // hex wood tone
  isSelected: boolean;
  /** Sequential CSG tool operations applied to this board. */
  cuts: CutOperation[];
  /** Structural orientation for deflection calc. */
  orientation: BeamOrientation;
  /** User-defined uniform load in lbs (for deflection). */
  loadLbs: number;
  /** Dimensional lumber vs sheet goods — drives estimating formulas. */
  materialKind: MaterialKind;
  /** Permanent structural mates linking this member to others. */
  mateIds?: string[];
  /** Primitive shape type — box is default dimensional lumber. */
  shapeType?: WoodShapeType;
  /** Footprint vertices for custom polygon extrusions (x,z in inches). */
  polygonPoints?: [number, number][];
  /** Radius for cylinder, sphere, cone. */
  radius?: number;
  /** When true, member is stashed in the scrap box and hidden from the viewport. */
  inScrapBox?: boolean;
  /** Visual-only joint planning markers on this board. */
  jointMarkers?: JointMarker[];
  /** Visual-only centerline markers on this board. */
  centerlineMarkers?: CenterlineMarker[];
  /** Surface finish for 3D preview */
  finish?: BoardFinish;
  /** Modify > Chamfer features (New Order — Modify tools). Each edgeId is
   * the two adjacent StandardFaceId faces sorted and joined with '|' (e.g.
   * 'xMax|yMax') — see Engine.ts's CHAMFER_EDGE_KINDS. Only meaningful for
   * shapeType 'box' boards; fed into CADGeometryEngine.evaluateFeatures. */
  chamfers?: { id: string; edgeId: string; size: number; sizeB?: number }[];
}

// ─── Assembly Mates ─────────────────────────────────────────────────────────

export type FaceId = 'xMin' | 'xMax' | 'yMin' | 'yMax' | 'zMin' | 'zMax';

export type JoinMethod =
  | 'Unset'
  | 'Screws'
  | 'Nails'
  | 'Glue'
  | 'Pocket Holes'
  | 'Biscuit'
  | 'Dowel'
  | 'Bracket / Hardware'
  | 'Mortise & Tenon';

export interface MemberMate {
  id: string;
  memberAId: string;
  memberBId: string;
  faceA: FaceId;
  faceB: FaceId;
  joinMethod: JoinMethod;
  /** Offset from face center on member A (inches, face-local). */
  offsetA?: [number, number, number];
  /** Offset from face center on member B (inches, face-local). */
  offsetB?: [number, number, number];
}

export interface AttachmentPoint {
  id: string;
  memberId: string;
  faceIndex: FaceId;
  offset: [number, number, number];
  name: string;
  /** Connected attachment point id for point-to-point mating. */
  connectedToId?: string;
}

export interface Fastener {
  id: string;
  mateId: string;
  type: JoinMethod;
  /**
   * Face-relative storage per CAD_MANIFESTO.md Law 1 / VECTOR_PROJECTION_MATH.md
   * (Phase 19). World position/rotation are re-derived fresh every render from
   * these three fields via mating.ts's getFaceAlignedPlacement — never cached.
   */
  memberId?: string;
  faceId?: FaceId;
  /** Face-local (u, v, 0) offset from face center, inches. */
  offset?: [number, number, number];
  /**
   * @deprecated Legacy world-space fields from before Phase 19. Only present on
   * fasteners placed prior to this migration; used as a render fallback only
   * when memberId/faceId/offset are absent. Never written by new code.
   */
  position?: [number, number, number];
  rotation?: [number, number, number];
}

// ─── Estimating ────────────────────────────────────────────────────────────

export interface MaterialPriceEntry {
  unit: PriceUnit;
  pricePerUnit: number;
}

export interface EstimatingSettings {
  taxRatePercent: number;
  wasteBufferEnabled: boolean;
  wasteBufferPercent: number;
  materialPrices: Record<string, MaterialPriceEntry>;
}

export interface MaterialLedgerGroup {
  key: string;
  species: string;
  nominalSize: NominalSize;
  thickness: number;
  width: number;
  materialKind: MaterialKind;
  memberCount: number;
  totalLinearFeet: number;
  totalBoardFeet: number;
  totalSquareFeet: number;
  priceUnit: PriceUnit;
  pricePerUnit: number;
  subtotal: number;
}

// ─── Hardware & Fasteners ──────────────────────────────────────────────────

export type HardwareCategory =
  | 'Screw' | 'Nail' | 'Bolt' | 'Dowel'
  | 'Bracket' | 'Hinge' | 'Glue' | 'Other';

export type EdgeTreatmentType =
  | 'none'
  | 'chamfer'
  | 'fillet'
  | 'cove'
  | 'ogee'
  | 'rabbet'
  | 'beading';

export interface EdgeTreatment {
  id: string;
  memberId: string;
  edgeIndex: number;
  type: EdgeTreatmentType;
  depth: number;
  radius: number;
}

export type HardwareLibraryId =
  | 'drawer-slide'
  | 'cabinet-hinge'
  | 'drawer-pull'
  | 'shelf-pin'
  | 'cam-lock'
  | 'corner-bracket'
  | 'barrel-bolt';

export interface PlacedHardwareItem {
  id: string;
  libraryId: HardwareLibraryId;
  memberId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export interface AssemblyStep {
  stepIndex: number;
  mateId: string;
  description: string;
}

export interface HardwareItem {
  id: string;
  label: string;
  category: HardwareCategory;
  quantity: number;
  unitCost: number;
}

// ─── Surface Finishes ──────────────────────────────────────────────────────

export type FinishType =
  | 'Sanding' | 'Stain' | 'Paint'
  | 'Polyurethane' | 'Oil' | 'Wax' | 'Other';

export interface FinishItem {
  id: string;
  label: string;
  finishType: FinishType;
  sandingGrit?: number;           // populated when finishType === 'Sanding'
  coats: number;
  unitCost: number;
  quantity: number;
}

// ─── Physics Hook ─────────────────────────────────────────────────────────

export interface StructuralAnalysis {
  weightLoadCapacity?: number;    // lbs — placeholder for future physics engine
  isStructuralFailure?: boolean;  // true when load exceeds calculated capacity
  analysisRunAt?: string;         // ISO timestamp of last simulation
}

// ─── Joint Markers (Joinery Visualization) ────────────────────────────────

export type JointMarkerType = 'mortise' | 'tenon' | 'pocket_hole' | 'dovetail' | 'biscuit';

export interface JointMarker {
  id: string;
  type: JointMarkerType;
  /** Position in the board's local space (inches). */
  position: { x: number; y: number; z: number };
  /** Which face of the board (0=xMin 1=xMax 2=yMin 3=yMax 4=zMin 5=zMax). */
  faceIndex: number;
  /** For mortise/tenon pairs, the partnered board id. */
  pairedMemberId?: string;
}

// ─── Dimension Lines (New Order 8 — Revit-style 3-click callout) ──────────
// A dimension line is never two world-space points — it is a faceId on ONE
// board plus two face-local (u,v) points (what's being measured) and a
// signed face-local perpendicular offset (the 3rd click, how far/which side
// the callout sits off the A-B segment). World geometry is always re-derived
// fresh from these parameters + the parent board's CURRENT placement — see
// BoardAnnotations.tsx, which renders every board's lines as children of a
// <group> driven by that board's live position/rotation (CAD_MANIFESTO.md
// Law 1/2). Never cached, never a stored world coordinate.
export interface DimensionLine {
  id: string;
  anchorMemberId: string;
  /** A rectangular board's StandardFaceId, OR (for a customPolygon extruded board) 'top'/'bottom'/'side-N' — see Engine.ts's Face.id comment. Widened to string rather than FaceId so both shapes share this one type without a parallel structure. */
  anchorFaceId: string;
  startUV: { u: number; v: number };
  endUV: { u: number; v: number };
  /** Signed perpendicular distance (face-local units) offsetting the dimension line from the A-B segment — set by the 3rd click. */
  offsetUV: number;
  /** Per-endpoint lock — a locked endpoint is skipped by nudgeDimensionLine, even when nudging "both" ends together. */
  startLocked?: boolean;
  endLocked?: boolean;
  /**
   * Tri-state visibility override for the Entities list toggle. undefined
   * (default) = auto — only shown while anchorMemberId is the selected
   * board. true = forced visible regardless of selection ("toggled visible"
   * per the Order). false = force-hidden regardless of selection.
   */
  visible?: boolean;
}

// ─── Reference / Measuring Lines (New Order 8) ────────────────────────────
// A permanent geometric reference drawn directly on one board's face —
// NOT a dimension callout (no length text, no offset). Each endpoint is
// either snapped to that face's own boundary edge (u or v pinned exactly to
// 0 or the face's widthU/heightV) or a free point on the face interior.
// Stored as faceId + two (u,v) points + their snap status — exactly what a
// future cut-plane tool (New Order 9) needs to consume, with no schema
// change, per the Order's explicit requirement.
export interface ReferenceLinePoint {
  u: number;
  v: number;
  snapped: boolean;
  /** Locked endpoint — skipped by nudgeReferenceLine, even when nudging "both" ends together. */
  locked?: boolean;
}

export interface ReferenceLine {
  id: string;
  anchorMemberId: string;
  anchorFaceId: string;
  start: ReferenceLinePoint;
  end: ReferenceLinePoint;
  /** Same tri-state visibility convention as DimensionLine.visible above. */
  visible?: boolean;
}

// ─── Wood Joints (Phase 20 — real geometric joinery) ──────────────────────
// A WoodJoint is a standing, declarative joint definition between two board
// faces (CAD_MANIFESTO.md Law 1/2). The joint's geometry (dovetail sockets,
// mortise void, tenon shoulders, dado channel) is DERIVED fresh from these
// parameters + both boards' CURRENT dimensions/placements on every render —
// see src/core/JointFeatures.ts. Nothing baked, nothing decorative.

export interface WoodJointParams {
  /** Dovetail: number of tails. */
  tailCount?: number;
  /** Dovetail: flare angle in degrees (typical 8–14). */
  tailAngleDeg?: number;
  /** Mortise/tenon: fraction of the tenon board's thickness kept as tenon (default 1/3). */
  tenonThicknessRatio?: number;
  /** Mortise/tenon: fraction of the tenon board's width kept as tenon (default 0.7). */
  tenonWidthRatio?: number;
  /** Seat depth override in inches (how far board B embeds into board A). */
  depth?: number;
}

export interface WoodJoint {
  id: string;
  type: WoodJointType;
  /** Receiving board (gets the socket/mortise/dado/notch). */
  memberAId: string;
  faceAId: FaceId;
  /** Inserted board (gets the tails/tenon/embedded end). */
  memberBId: string;
  faceBId: FaceId;
  /** Face-local (u, v, 0) offset from faceA's center where the joint centers. */
  offsetA: [number, number, number];
  params: WoodJointParams;
}

// ─── Mate Groups ──────────────────────────────────────────────────────────

export interface MateGroup {
  id: string;
  memberIds: string[];
}

// ─── Mate Constraints (CAD_MANIFESTO.md Law 1/2 — Phase 16) ───────────────
// A standing relationship between two board faces, solved fresh every time
// either board moves — never a one-time coordinate copy. See
// src/core/Engine.ts (CADGeometryEngine.solveConstraints).
import type { MateConstraint } from './core/Engine';
export type { MateConstraint };

// ─── Project Root ──────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members: WoodMember[];
  hardware: HardwareItem[];
  finishes: FinishItem[];
  structural: StructuralAnalysis; // physics hook always present, fields optional
  estimating: EstimatingSettings;
  mates: MemberMate[];
  attachmentPoints: AttachmentPoint[];
  fasteners: Fastener[];
  edgeTreatments: EdgeTreatment[];
  placedHardware: PlacedHardwareItem[];
  assemblySteps: AssemblyStep[];
  dimensionLines: DimensionLine[];
  /** New Order 8: permanent on-face reference/measuring lines. */
  referenceLines: ReferenceLine[];
  mateGroups: MateGroup[];
  /** Phase 16: standing face-to-face mate constraints, solved fresh every change. */
  mateConstraints: MateConstraint[];
  /** Phase 20: real geometric wood joints (dovetail/mortise-tenon/dado/lap). */
  woodJoints: WoodJoint[];
}

// ─── UI State (not persisted to disk) ─────────────────────────────────────

export type ActiveTool =
  | 'select' | 'move' | 'rotate' | 'addBoard' | 'drawBoard'
  | 'cut' | 'rip' | 'miter' | 'joinery'
  | 'trimExtend' | 'mate' | 'edge'
  | 'shapeCylinder' | 'shapeSphere' | 'shapeCone'
  | 'shapeTriPrism' | 'shapeHexPrism' | 'shapePolygon'
  | 'placeHardware' | 'measure' | 'joint'
  | 'centerline' | 'connection'
  | 'template' | 'referenceLine' | 'chamfer' | 'fillet' | 'cutout';

// ─── Workspace Modes (Phase 20 — 3-Mode Unified UX) ──────────────────────
// One global mode filters the Left Toolbar and Right Inspector. Modes never
// own geometry state — they are pure UI routing on top of activeTool.

export type WorkspaceMode = 'model' | 'assembly' | 'detail' | 'template';

// ─── Template Mode (New Order 6, rebuilt/renamed by New Order 7 — 2D sketch
// space for drawing a custom shape to extrude into a solid) ───────────────
// The plane a Template sketch is locked to. Stored as parameters (origin +
// normal), never as hardcoded camera math, per CAD_MANIFESTO.md Law 1 — the
// camera-lock render step reads these fresh every transition. Only 'ground'
// is populated this Order; a future Order adds a 'face' variant (faceId +
// derived origin/normal from that board face) without changing this shape.
export interface TemplatePlane {
  kind: 'ground';
  origin: [number, number, number];
  normal: [number, number, number];
}

// ─── Template Sketch (2D draw tools) ──────────────────────────────────────
// A template sketch is an ordered chain of 2D edges. Every edge stores its
// endpoints as plane-local (u,v) parameters, never raw world coordinates —
// the same convention FaceAnnotation already uses (CAD_MANIFESTO.md Law 1/2).
// World position is always re-derived fresh from ui.templatePlane's current
// origin/normal via src/lib/templateSketchMath.ts's planeUVToWorld, never
// cached. Committed edges are the source of truth the New Order 7 extrude
// step reads; nothing here is a mesh or vertex buffer.
export type TemplateDrawTool = 'line' | 'arc' | 'freehand';

export interface TemplatePoint2D {
  u: number;
  v: number;
}

export interface TemplateEdge {
  id: string;
  type: TemplateDrawTool;
  start: TemplatePoint2D;
  end: TemplatePoint2D;
  /** Arc only: signed bulge (DXF-style tan(includedAngle/4)); omitted/0 = straight chord. */
  bulge?: number;
  /** Freehand only: intermediate sampled points between start and end, in stroke order. */
  points?: TemplatePoint2D[];
}

// ─── Template Shapes (closed-loop fill) ────────────────────────────────────
// A TemplateShape is a closed loop of already-committed TemplateEdges (by id,
// in chain order — never a duplicated copy of their geometry). Its fill
// polygon is always rebuilt fresh from those edges' current (u,v) parameters
// via src/lib/templateSketchMath.ts's buildLoopPolygon, per CAD_MANIFESTO.md
// Law 1 — nothing here is a cached vertex buffer.
export interface TemplateShape {
  id: string;
  /** Ordered edge ids forming the closed loop (last edge's end === first edge's start). */
  edgeIds: string[];
  /** Wood species this shape is filled with — independently swappable per shape, live. */
  species: string;
}

/** Real wood joinery types that alter board topology (Connections palette). */
export type WoodJointType = 'dovetail' | 'mortiseTenon' | 'dado' | 'lap';

/**
 * One discriminated union for every multi-click tool sequence. Every
 * half-picked anchor is stored as memberId + FaceId (+ face-local offset) —
 * never a world-space point (CAD_MANIFESTO.md Law 1) — so camera orbiting or
 * board movement can never invalidate a pending pick.
 */
export type PendingInteraction =
  | {
      kind: 'trimExtend';
      step: 'pickBoardToAdjust';
      targetMemberId: string;
      targetFaceId: FaceId;
    }
  | {
      kind: 'joinery';
      step: 'pickFaceA';
      jointType: WoodJointType;
    }
  | {
      kind: 'joinery';
      step: 'pickFaceB';
      jointType: WoodJointType;
      memberAId: string;
      faceAId: FaceId;
      /** Face-local (u, v) offset from face center where the user clicked. */
      offsetA: [number, number, number];
    }
  | {
      kind: 'fastener';
      step: 'pickFace';
      fastenerType: JoinMethod;
    };

export type ViewportMode = 'design' | 'assembly';

export type DisplayMode = 'shaded' | 'wireframe' | 'shadedEdges' | 'xray';

export type RightPanelTab =
  | 'inspector' | 'estimating' | 'cutlist' | 'engineering' | 'tutorial' | 'hardware' | 'optimizer'
  | 'connections';

export type TransformMode = 'translate' | 'rotate' | 'scale';

export type AngleSnapIncrement = 15 | 45 | 90;

export interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  memberId: string | null;
}

export interface UIState {
  activeTool: ActiveTool;
  selectedMemberId: string | null;
  rightPanelTab: RightPanelTab;
  transformMode: TransformMode;
  transformGizmoActive: boolean;
  /** Boundary board for trim/extend operations. */
  trimBoundaryId: string | null;
  /** When set, only this member is visible in the viewport. */
  isolatedMemberId: string | null;
  /** Lock OrbitControls during draw-board drag. */
  orbitControlsEnabled: boolean;
  /** Increment camera reset from context menu. */
  cameraResetNonce: number;
  /** Camera preset to animate to (e.g. 'top', 'front', 'left', 'right', 'back', 'bottom', 'iso-front-top-right'). */
  cameraPreset: string | null;
  angleSnapEnabled: boolean;
  angleSnapIncrement: AngleSnapIncrement;
  /** Dimension/Reference Line edge/end snapping toggle — off means every click is a free point on the face (no edge magnetism). */
  annotationSnapEnabled: boolean;
  /** Which single endpoint of a SELECTED Dimension/Reference line arrow-key
   * nudge should target — set by clicking that endpoint's marker in the
   * viewport. null means "nudge both (unlocked) ends together," the
   * whole-line behavior. */
  activeAnnotationEndpoint: { lineId: string; kind: 'dimension' | 'reference'; end: 'start' | 'end' } | null;
  /** Modify > Chamfer: which board+edge is currently picked (armed for size
   * entry/drag), and a live hover preview before a pick is committed. */
  chamferEdge: { memberId: string; edgeId: string } | null;
  chamferHoverEdge: { memberId: string; edgeId: string } | null;
  contextMenu: ContextMenuState;
  /** Incremented to cancel in-progress draw-board drag from Escape handler. */
  drawBoardCancelNonce: number;
  /** Draw-board defaults while dragging. */
  drawDefaults: {
    species: string;
    thickness: number;
    width: number;
    nominalSize: NominalSize;
    category: WoodCategory;
    color: string;
  };
  /** Viewport display toggles */
  gridVisible: boolean;
  orthographic: boolean;
  /** Face-mate tool selections */
  mateFaceA: { memberId: string; face: FaceId; offset?: [number, number, number] } | null;
  mateFaceB: { memberId: string; face: FaceId; offset?: [number, number, number] } | null;
  /** Which mate slot viewport clicks assign to */
  matePickTarget: 'A' | 'B';
  /** Screen-space bounds of selected member (viewport pixels). */
  memberScreenBounds: { left: number; top: number; right: number; bottom: number } | null;
  /** Show floating quick-dimensions panel. */
  quickDimensionsOpen: boolean;
  /** Radial orbital selector visibility. */
  radialWheelOpen: boolean;
  radialWheelMode: 'full' | 'joinOnly';
  /** Screen position where the radial wheel was opened (viewport client coords). */
  radialWheelAnchor: { x: number; y: number } | null;
  /** Hovered face for mate grid overlay. */
  mateHoverFace: { memberId: string; face: FaceId } | null;
  /** Hovered boundary face preview for the Trim/Extend tool (New Order),
   * before it's committed into ui.pendingInteraction's targetFaceId. */
  trimHoverFace: { memberId: string; face: FaceId } | null;
  /** Confirmed grid snap offset on a face. */
  mateGridOffset: { memberId: string; face: FaceId; offset: [number, number, number] } | null;
  /** Fastener placement mode after join method selected. */
  fastenerPlacementMode: boolean;
  fastenerPlacementMateId: string | null;
  selectedFastenerId: string | null;
  selectedMateId: string | null;
  /** Pepe assistant UI */
  pepePanelOpen: boolean;
  pepeTab: 'suggestions' | 'ask' | 'notebook';
  pepeExpression: 'neutral' | 'thinking' | 'happy';
  /** Ask Pepe queries that received thumbs-down (not persisted). */
  missedQueries: string[];
  /** Ephemeral design suggestions (not persisted). */
  designSuggestions: DesignSuggestion[];
  suggestionHighlightIds: string[];
  /** Pending dimension edits awaiting history commit. */
  dimensionEditPending: boolean;
  /** Attachment point being connected (first pick). */
  attachmentPointPickA: string | null;
  /** Edge treatment tool */
  edgeToolMemberId: string | null;
  edgeHoverIndex: number | null;
  edgeSelectedIndex: number | null;
  /** Viewport and display modes */
  viewportMode: ViewportMode;
  displayMode: DisplayMode;
  /** Hardware library placement */
  hardwareLibraryPick: HardwareLibraryId | null;
  /** Custom polygon drawing vertices */
  polygonDrawPoints: [number, number][];
  /** Assembly guide panel */
  assemblyGuideOpen: boolean;
  /** Saved member poses before assembly explode (restored when leaving assembly mode). */
  assemblyDesignSnapshot: {
    memberId: string;
    position: [number, number, number];
    rotation: [number, number, number];
  }[] | null;
  /** Rubber-band multi-select member ids */
  multiSelection: string[];
  /** Combined screen bounds of current selection (single or multi) */
  combinedSelectionBounds: { left: number; top: number; right: number; bottom: number } | null;
  /** Active box-select drag in viewport pixels */
  boxSelectRect: { left: number; top: number; right: number; bottom: number } | null;
  /** Pointer-down on empty space — starts rubber-band */
  boxSelectPending: { x: number; y: number; shiftKey: boolean } | null;
  /** Radial wheel collapsed but selection retained */
  radialWheelCollapsed: boolean;
  /** Continuous draw: last placed board for edge chaining */
  lastPlacedMemberId: string | null;
  /** Candidate join links from chained draw (attachment point pairs) */
  drawChainLinks: { fromApId: string; toApId: string }[];
  /** Snap indicator during chained draw */
  drawSnapIndicator: { x: number; z: number } | null;
  /** Quick join miter axis picker */
  quickJoinMiterAxis: 'x' | 'y' | 'z' | null;
  /** Measure tool: start point of in-progress dimension line */
  measureStartPoint: { x: number; y: number; z: number } | null;
  /** Selected dimension line id */
  selectedDimensionLineId: string | null;
  /** New Order 8: selected reference/measuring line id (for the Entities list + edit affordance). */
  selectedReferenceLineId: string | null;
  /**
   * New Order 8: the in-progress Dimension Line click sequence (click A,
   * click B, click offset). `editingId` set means the 3rd click UPDATES that
   * existing DimensionLine instead of creating a new one ("re-drag its
   * points" per the Order's edit requirement) — never a world-space point,
   * always a faceId + face-local (u,v).
   */
  dimensionDraft: {
    memberId: string;
    faceId: string;
    startUV: { u: number; v: number };
    endUV?: { u: number; v: number };
    editingId?: string;
  } | null;
  /** New Order 8: the in-progress Reference Line click sequence (click start, click end). */
  referenceDraft: {
    memberId: string;
    faceId: string;
    start: ReferenceLinePoint;
    editingId?: string;
  } | null;
  /** Selected centerline marker id (for click-to-select + delete) */
  selectedCenterlineId: string | null;
  /** Whether dimension lines are visible in the viewport */
  dimensionLinesVisible: boolean;
  /** Cross cut preview position along board length (inches from start), or null when not active */
  crossCutPreviewPosition: number | null;
  /** Rip cut preview position (target width in inches), or null when not active */
  ripCutPreviewPosition: number | null;
  /** Whether boards snap to the 1-inch grid when moved */
  snapToGrid: boolean;
  /** Currently selected joint marker type for placement */
  selectedJointType: JointMarkerType | null;
  /** Selected joint marker id (for removal) */
  selectedJointMarkerId: string | null;
  /** Whether the scrap box panel is expanded */
  scrapBoxOpen: boolean;
  /** Rotation axis locked for rotation ring (default y) */
  rotationAxis: 'x' | 'y' | 'z';
  /** Template picker modal open */
  templatePickerOpen: boolean;
  /** Bill of Materials panel open */
  bomPanelOpen: boolean;
  /** Currently selected draw material species */
  selectedDrawMaterial: string;
  /** Finishing panel open */
  finishPanelOpen: boolean;
  /** Phase 18: "Project name" prompt shown before the first Ctrl+S save of an unnamed project */
  saveNameModalOpen: boolean;
  /** Phase 20: global workspace mode — filters Left Toolbar + Right Inspector. */
  workspaceMode: WorkspaceMode;
  /** Phase 20: current half-finished multi-click tool sequence (parameter-form only). */
  pendingInteraction: PendingInteraction | null;
  /**
   * New Order 2 (Move tool): true only while a left-button board-move drag is
   * actively in progress. Distinct from orbitControlsEnabled — the Move tool
   * never fully disables OrbitControls (so right/middle-button camera control
   * keeps working mid-drag per spec); this flag instead tells Viewport.tsx to
   * remap OrbitControls' LEFT mouse button off (via `mouseButtons`) so left-drag
   * doesn't also rotate the camera while dragging a board.
   */
  moveDragActive: boolean;
  /** Which plane the current Template sketch is locked to. */
  templatePlane: TemplatePlane;
  /** Species selected for the template's eventual extruded solid. */
  templateMaterial: string;
  /** Which Template draw tool is armed (Line/Arc/Freehand), or null if none. */
  templateDrawTool: TemplateDrawTool | null;
  /** Committed template sketch edges — parameter source of truth for the extrude step. */
  templateEdges: TemplateEdge[];
  /** Committed closed-loop shapes (each a species-filled polygon over a subset of templateEdges). */
  templateShapes: TemplateShape[];
  /** The filled shape currently selected (Template-space click-to-select, independent of selectedMemberId). */
  selectedTemplateShapeId: string | null;
  /** New Order 7: sticky last-used extrude thickness (inches), same "remember last input" convention as InsertPanel. */
  templateExtrudeThickness: number;
  /** New Order 7.1 Feature 10: which click of the 3-point Arc flow (start -> via -> end) is next, for TemplatePanel's staged inline hint. Meaningless (stays 'start') for Line/Freehand. */
  templateArcStage: 'start' | 'via' | 'end';
  /** New Order 7.1 Feature 10: mirrors the in-progress arc's bulge to the opposite side of its live chord — toggled by Tab or the on-canvas Flip control, reset per segment. */
  templateArcFlipped: boolean;
}

export interface DesignSuggestion {
  id: string;
  category: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  relatedMemberIds?: string[];
}

// ─── Nesting output types ──────────────────────────────────────────────────

export interface NestingPart {
  memberId: string;
  label: string;
  length: number;
}

export interface NestingStock {
  stockLength: number;
  parts: NestingPart[];
  waste: number;
}

export interface NestingGroup {
  key: string;
  species: string;
  nominalSize: NominalSize;
  thickness: number;
  width: number;
  stocks: NestingStock[];
  totalWaste: number;
  totalStockUsed: number;
}

export interface NestingPlan {
  groups: NestingGroup[];
  kerfInches: number;
}

// ─── Engineering output ───────────────────────────────────────────────────

export interface DeflectionResult {
  memberId: string;
  label: string;
  deflectionIn: number;
  limitIn: number;
  exceedsLimit: boolean;
  spanIn: number;
  species: string;
}
