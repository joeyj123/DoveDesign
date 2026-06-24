import type { Project } from '../types';
import type { DesignSuggestion } from '../types';
import * as THREE from 'three';
import { getMemberWorldCorners } from './screenProjection';

const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 };

function boxesOverlap(a: THREE.Box3, b: THREE.Box3): boolean {
  return a.intersectsBox(b);
}

function memberBox(member: import('../types').WoodMember): THREE.Box3 {
  const corners = getMemberWorldCorners(member);
  const box = new THREE.Box3();
  for (const c of corners) box.expandByPoint(c);
  return box;
}

export function getDesignSuggestions(project: Project): DesignSuggestion[] {
  const suggestions: DesignSuggestion[] = [];
  const { members, mates, fasteners, estimating } = project;

  for (const m of members) {
    if (m.length > 36 && m.orientation === 'flat') {
      suggestions.push({
        id: `span-${m.id}`,
        category: 'Structural',
        severity: 'warning',
        message: `"${m.label}" spans ${m.length.toFixed(1)}" — consider a center support for shelves over 36".`,
        relatedMemberIds: [m.id],
      });
    }
  }

  for (const mate of mates) {
    const hasFasteners = fasteners.some((f) => f.mateId === mate.id);
    if (
      mate.joinMethod !== 'Unset' &&
      !hasFasteners &&
      mate.joinMethod !== 'Glue' &&
      mate.joinMethod !== 'Mortise & Tenon'
    ) {
      suggestions.push({
        id: `no-fastener-${mate.id}`,
        category: 'Joinery',
        severity: 'info',
        message: `Mated joint has no fasteners placed yet — select a join method and place hardware.`,
        relatedMemberIds: [mate.memberAId, mate.memberBId],
      });
    }
    if (mate.joinMethod === 'Unset') {
      suggestions.push({
        id: `unset-join-${mate.id}`,
        category: 'Joinery',
        severity: 'info',
        message: `A mate connection has no join method set — use the radial wheel Join Method option.`,
        relatedMemberIds: [mate.memberAId, mate.memberBId],
      });
    }
  }

  const pricedKeys = new Set(Object.keys(estimating.materialPrices));
  for (const m of members) {
    const key = `${m.species}|${m.nominalSize}|${m.materialKind}`;
    if (!pricedKeys.has(key) && m.costPerBoardFoot <= 0) {
      suggestions.push({
        id: `no-price-${m.id}`,
        category: 'Estimating',
        severity: 'info',
        message: `"${m.label}" has no unit price — set material prices in the Estimating tab.`,
        relatedMemberIds: [m.id],
      });
    }
  }

  const dimMap = new Map<string, string[]>();
  for (const m of members) {
    const key = `${m.thickness.toFixed(2)}|${m.width.toFixed(2)}|${m.length.toFixed(2)}`;
    const ids = dimMap.get(key) ?? [];
    ids.push(m.id);
    dimMap.set(key, ids);
  }
  for (const [, ids] of dimMap) {
    if (ids.length >= 2) {
      suggestions.push({
        id: `dup-dim-${ids.join('-')}`,
        category: 'Cut List',
        severity: 'info',
        message: `${ids.length} boards share identical dimensions — you may be able to cut them from the same stock layout.`,
        relatedMemberIds: ids,
      });
    }
  }

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = memberBox(members[i]);
      const b = memberBox(members[j]);
      if (boxesOverlap(a, b)) {
        suggestions.push({
          id: `overlap-${members[i].id}-${members[j].id}`,
          category: 'Clearance',
          severity: 'warning',
          message: `"${members[i].label}" and "${members[j].label}" bounding boxes overlap — check positions.`,
          relatedMemberIds: [members[i].id, members[j].id],
        });
      }
    }
  }

  const left = members.filter((m) => m.position[0] < 0).length;
  const right = members.filter((m) => m.position[0] > 0).length;
  if (left > 0 && right > 0 && Math.abs(left - right) >= 2) {
    suggestions.push({
      id: 'symmetry',
      category: 'Symmetry',
      severity: 'info',
      message: `Left side has ${left} boards and right side has ${right} — check for missing mirror parts.`,
    });
  }

  return suggestions
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, 5);
}
