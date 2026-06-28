import type { WoodMember } from '../types';

const PINE_T = 0.75; // standard 1x board thickness

function board(
  label: string,
  length: number,
  thickness: number,
  width: number,
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0]
): WoodMember {
  return {
    id: crypto.randomUUID(),
    label,
    category: 'Softwood',
    species: 'Pine',
    nominalSize: 'Custom',
    thickness,
    width,
    length,
    position,
    rotation,
    costPerBoardFoot: 2.5,
    color: '#c8a870',
    isSelected: false,
    cuts: [],
    orientation: 'flat',
    loadLbs: 0,
    materialKind: 'dimensional',
    shapeType: 'box',
    inScrapBox: false,
    jointMarkers: [],
  };
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  dimensions: string;
  members: WoodMember[];
}

function buildWorkbench(): WoodMember[] {
  const legH = 33, legW = 3.5, legT = 3.5;
  return [
    board('Bench Top', 72, 1.5, 24, [0, 33.75, 0]),
    board('Leg - Front Left',  legT, legH, legW, [-33, legH / 2, -10]),
    board('Leg - Front Right', legT, legH, legW, [ 33, legH / 2, -10]),
    board('Leg - Back Left',   legT, legH, legW, [-33, legH / 2,  10]),
    board('Leg - Back Right',  legT, legH, legW, [ 33, legH / 2,  10]),
    board('Long Stretcher - Front', 60, 1.5, 3.5, [0, 6, -10]),
    board('Long Stretcher - Back',  60, 1.5, 3.5, [0, 6,  10]),
    board('Short Stretcher - Left',  17, 1.5, 3.5, [-33, 6, 0]),
    board('Short Stretcher - Right', 17, 1.5, 3.5, [ 33, 6, 0]),
  ];
}

function buildBookshelf(): WoodMember[] {
  const sideH = 72, sideD = 12, sideT = 0.75;
  const shelfW = 34.5;
  const shelfY = [4.5, 18, 32, 46, 60];
  const sides: WoodMember[] = [
    board('Side - Left',  sideD, sideH, sideT, [-17.625, sideH / 2,  0], [0, 0, Math.PI / 2]),
    board('Side - Right', sideD, sideH, sideT, [ 17.625, sideH / 2,  0], [0, 0, Math.PI / 2]),
  ];
  const shelves = shelfY.map((y, i) =>
    board(i === 0 ? 'Bottom' : i === shelfY.length - 1 ? 'Top' : `Shelf ${i}`, shelfW, sideD, sideT, [0, y, 0])
  );
  const back = board('Back Panel', 36, 72, 0.25, [0, 36, 6.125]);
  return [...sides, ...shelves, back];
}

function buildCabinet(): WoodMember[] {
  const t = 0.75;
  return [
    board('Side - Left',   18, 36, t,   [-11.625, 18, 0], [0, 0, Math.PI / 2]),
    board('Side - Right',  18, 36, t,   [ 11.625, 18, 0], [0, 0, Math.PI / 2]),
    board('Top',           22.5, 18, t, [0, 35.625, 0]),
    board('Bottom',        22.5, 18, t, [0,  0.375, 0]),
    board('Shelf',         22.5, 18, t, [0,     18, 0]),
    board('Back Panel',    24, 36, 0.25,[0,     18, 9.125]),
    board('Door - Left',   11, 34.5, t, [-5.75, 18, -9.375]),
    board('Door - Right',  11, 34.5, t, [ 5.75, 18, -9.375]),
  ];
}

function buildSideTable(): WoodMember[] {
  const legH = 24, legS = 1.5;
  return [
    board('Top',          18, 1.5, 18, [0, 25.75, 0]),
    board('Leg - FL', legS, legH, legS, [-7.25, legH / 2, -7.25]),
    board('Leg - FR', legS, legH, legS, [ 7.25, legH / 2, -7.25]),
    board('Leg - BL', legS, legH, legS, [-7.25, legH / 2,  7.25]),
    board('Leg - BR', legS, legH, legS, [ 7.25, legH / 2,  7.25]),
    board('Apron - Front', 15, 3, PINE_T, [0, 21, -7.25]),
    board('Apron - Back',  15, 3, PINE_T, [0, 21,  7.25]),
    board('Apron - Left',  15, 3, PINE_T, [-7.25, 21, 0], [0, Math.PI / 2, 0]),
    board('Apron - Right', 15, 3, PINE_T, [ 7.25, 21, 0], [0, Math.PI / 2, 0]),
  ];
}

function buildBedFrame(): WoodMember[] {
  return [
    board('Headboard',      62, 36, 0.75, [0, 30, -41]),
    board('Side Rail - Left',  80, 6, 1.5, [-31.25, 7, 0], [0, Math.PI / 2, 0]),
    board('Side Rail - Right', 80, 6, 1.5, [ 31.25, 7, 0], [0, Math.PI / 2, 0]),
    board('Footboard',      62, 18, 0.75, [0, 12, 41]),
    board('Support Slat 1', 60, 3.5, 0.75,[0, 14, -20]),
    board('Support Slat 2', 60, 3.5, 0.75,[0, 14,   0]),
    board('Support Slat 3', 60, 3.5, 0.75,[0, 14,  20]),
  ];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'workbench',
    name: 'Workbench',
    description: 'Classic 6 ft shop workbench with thick top, four legs, and stretchers.',
    icon: '🪵',
    dimensions: '72" × 24" × 34.5" tall',
    members: buildWorkbench(),
  },
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    description: '36" wide bookcase with sides, top, bottom, and four shelves.',
    icon: '📚',
    dimensions: '36" × 12" × 72" tall',
    members: buildBookshelf(),
  },
  {
    id: 'cabinet',
    name: 'Cabinet',
    description: 'Face-frame cabinet with sides, top, bottom, two doors, back, and a shelf.',
    icon: '🗄️',
    dimensions: '24" × 18" × 36" tall',
    members: buildCabinet(),
  },
  {
    id: 'side-table',
    name: 'Side Table',
    description: 'Simple 18" square side table with four legs and aprons.',
    icon: '🪑',
    dimensions: '18" × 18" × 26" tall',
    members: buildSideTable(),
  },
  {
    id: 'bed-frame',
    name: 'Bed Frame (Queen)',
    description: 'Queen-size bed frame with headboard, rails, footboard, and support slats.',
    icon: '🛏️',
    dimensions: '62" × 82" × 14" tall',
    members: buildBedFrame(),
  },
];
