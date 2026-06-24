/** .wcad file envelope — canonical on-disk format. */
import type { Project } from '../types';

export const WCAD_FORMAT = 'wcad' as const;
export const WCAD_VERSION = 1;

export interface WcadFile {
  format: typeof WCAD_FORMAT;
  version: number;
  savedAt: string;
  project: Project;
}

export function serializeWcad(project: Project): string {
  const payload: WcadFile = {
    format: WCAD_FORMAT,
    version: WCAD_VERSION,
    savedAt: new Date().toISOString(),
    project,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseWcad(text: string): Project {
  const parsed = JSON.parse(text);
  if (parsed.format === WCAD_FORMAT && parsed.project) {
    return parsed.project;
  }
  if (parsed.id && Array.isArray(parsed.members)) {
    return parsed;
  }
  throw new Error('Invalid .wcad file format.');
}
