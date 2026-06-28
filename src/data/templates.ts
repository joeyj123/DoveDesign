import type { WoodMember } from '../types';

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
  return [
    board('Bench Top',                72,   1.5, 24,  [0,    34.5, 0   ]),
    board('Leg - Front Left',         3.5,  33,  3.5, [-33,  16.5, -9  ]),
    board('Leg - Front Right',        3.5,  33,  3.5, [ 33,  16.5, -9  ]),
    board('Leg - Back Left',          3.5,  33,  3.5, [-33,  16.5,  9  ]),
    board('Leg - Back Right',         3.5,  33,  3.5, [ 33,  16.5,  9  ]),
    board('Long Stretcher - Front',   65,   3.5, 1.5, [0,    6,    -9  ]),
    board('Long Stretcher - Back',    65,   3.5, 1.5, [0,    6,     9  ]),
    board('Short Stretcher - Left',   1.5,  3.5, 17,  [-33,  6,     0  ]),
    board('Short Stretcher - Right',  1.5,  3.5, 17,  [ 33,  6,     0  ]),
  ];
}

function buildBookshelf(): WoodMember[] {
  return [
    board('Side - Left',   0.75,  72,  12, [-17.625, 36,     0]),
    board('Side - Right',  0.75,  72,  12, [ 17.625, 36,     0]),
    board('Top',           34.5,  0.75,12, [0,       71.625, 0]),
    board('Bottom',        34.5,  0.75,12, [0,       0.375,  0]),
    board('Shelf 1',       34.5,  0.75,12, [0,       18,     0]),
    board('Shelf 2',       34.5,  0.75,12, [0,       36,     0]),
    board('Shelf 3',       34.5,  0.75,12, [0,       54,     0]),
  ];
}

function buildCabinet(): WoodMember[] {
  return [
    board('Side - Left',   0.75, 36,  18,   [-11.625, 18,     0     ]),
    board('Side - Right',  0.75, 36,  18,   [ 11.625, 18,     0     ]),
    board('Top',           22.5, 0.75,18,   [0,       35.625, 0     ]),
    board('Bottom',        22.5, 0.75,18,   [0,       0.375,  0     ]),
    board('Door - Left',   11,   34.5,0.75, [-5.625,  18,    -9.375 ]),
    board('Door - Right',  11,   34.5,0.75, [ 5.625,  18,    -9.375 ]),
    board('Back Panel',    22.5, 36,  0.25, [0,       18,     9.125 ]),
    board('Shelf',         22.5, 0.75,17.5, [0,       18,     0     ]),
  ];
}

function buildSideTable(): WoodMember[] {
  return [
    board('Top',          18,   1.5,  18,   [0,      25.25, 0     ]),
    board('Leg - FL',     1.5,  24,   1.5,  [-7.25,  12,   -7.25  ]),
    board('Leg - FR',     1.5,  24,   1.5,  [ 7.25,  12,   -7.25  ]),
    board('Leg - BL',     1.5,  24,   1.5,  [-7.25,  12,    7.25  ]),
    board('Leg - BR',     1.5,  24,   1.5,  [ 7.25,  12,    7.25  ]),
    board('Apron - Front',15,   3,    0.75, [0,      22,   -7.625 ]),
    board('Apron - Back', 15,   3,    0.75, [0,      22,    7.625 ]),
    board('Apron - Left', 0.75, 3,    15,   [-7.625, 22,    0     ]),
    board('Apron - Right',0.75, 3,    15,   [ 7.625, 22,    0     ]),
  ];
}

function buildBedFrame(): WoodMember[] {
  return [
    board('Headboard',        62,   36,  0.75, [0,       24,  -41]),
    board('Side Rail - Left', 1.5,  6,   80,   [-30.625, 8,     0]),
    board('Side Rail - Right',1.5,  6,   80,   [ 30.625, 8,     0]),
    board('Footboard',        62,   18,  0.75, [0,       14,   41]),
    board('Slat 1',           59,   0.75,3.5,  [0,       5,   -20]),
    board('Slat 2',           59,   0.75,3.5,  [0,       5,     0]),
    board('Slat 3',           59,   0.75,3.5,  [0,       5,    20]),
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
    description: '36" wide bookcase with sides, top, bottom, and three shelves.',
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
