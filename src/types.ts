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
  position: [number, number, number];
  rotation: [number, number, number];
  type: JoinMethod;
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
}

// ─── UI State (not persisted to disk) ─────────────────────────────────────

export type ActiveTool =
  | 'select' | 'addBoard' | 'drawBoard'
  | 'cut' | 'rip' | 'miter' | 'joinery'
  | 'trimExtend' | 'mate' | 'edge'
  | 'shapeCylinder' | 'shapeSphere' | 'shapeCone'
  | 'shapeTriPrism' | 'shapeHexPrism' | 'shapePolygon'
  | 'placeHardware';

export type ViewportMode = 'design' | 'assembly';

export type DisplayMode = 'shaded' | 'wireframe' | 'shadedEdges' | 'xray';

export type RightPanelTab =
  | 'inspector' | 'estimating' | 'cutlist' | 'engineering' | 'tutorial' | 'hardware';

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
  /** Boundary board for trim/extend operations. */
  trimBoundaryId: string | null;
  /** When set, only this member is visible in the viewport. */
  isolatedMemberId: string | null;
  /** Lock OrbitControls during draw-board drag. */
  orbitControlsEnabled: boolean;
  /** Increment camera reset from context menu. */
  cameraResetNonce: number;
  angleSnapEnabled: boolean;
  angleSnapIncrement: AngleSnapIncrement;
  contextMenu: ContextMenuState;
  /** Incremented to cancel in-progress draw-board drag from Escape handler. */
  drawBoardCancelNonce: number;
  /** Draw-board defaults while dragging. */
  drawDefaults: {
    species: string;
    thickness: number;
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
  /** Hovered face for mate grid overlay. */
  mateHoverFace: { memberId: string; face: FaceId } | null;
  /** Confirmed grid snap offset on a face. */
  mateGridOffset: { memberId: string; face: FaceId; offset: [number, number, number] } | null;
  /** Fastener placement mode after join method selected. */
  fastenerPlacementMode: boolean;
  fastenerPlacementMateId: string | null;
  selectedFastenerId: string | null;
  selectedMateId: string | null;
  /** Pepe assistant UI */
  pepePanelOpen: boolean;
  pepeTab: 'suggestions' | 'ask';
  pepeExpression: 'neutral' | 'thinking' | 'happy';
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
