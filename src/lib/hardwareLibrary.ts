import type { HardwareLibraryId } from '../types';

export const HARDWARE_LIBRARY_COSTS: Record<HardwareLibraryId, number> = {
  'drawer-slide': 12,
  'cabinet-hinge': 4.5,
  'drawer-pull': 6,
  'shelf-pin': 0.25,
  'cam-lock': 2,
  'corner-bracket': 3,
  'barrel-bolt': 8,
};

export const HARDWARE_LIBRARY_LABELS: Record<HardwareLibraryId, string> = {
  'drawer-slide': 'Drawer slide (full extension)',
  'cabinet-hinge': 'Cabinet hinge (Euro cup)',
  'drawer-pull': 'Drawer pull / handle',
  'shelf-pin': 'Shelf pin',
  'cam-lock': 'Cam lock connector',
  'corner-bracket': 'Corner bracket',
  'barrel-bolt': 'Barrel bolt',
};
