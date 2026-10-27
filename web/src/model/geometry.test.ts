import { describe, expect, it } from 'vitest';
import { changeRoom } from '../editor/commands';
import {
  constrainItem,
  isInsideRoom,
  normalizeRotation,
  rotatedHalfExtents,
  snapPosition,
} from './geometry';
import { TEMPLATES } from './templates';
import type { Furniture } from './types';

const room = { width: 640, depth: 480, floor: 'oak' as const };
const item: Furniture = {
  id: 'test',
  kind: 'sofa',
  label: 'Test',
  x: 320,
  y: 240,
  width: 210,
  depth: 90,
  rotation: 0,
  color: '#112233',
};

describe('shared world geometry', () => {
  it('keeps a rotated footprint inside every room edge', () => {
    for (const rotation of [0, 30, 45, 90, 135, 270, -450, 720]) {
      for (const [x, y] of [
        [-100, -100],
        [1000, 1000],
        [-100, 1000],
        [1000, -100],
      ]) {
        const result = constrainItem({ ...item, x, y, rotation }, room);
        expect(isInsideRoom(result, room)).toBe(true);
        expect(result.rotation).toBeGreaterThanOrEqual(0);
        expect(result.rotation).toBeLessThan(360);
      }
    }
    expect(rotatedHalfExtents({ ...item, rotation: 90 }).x).toBeCloseTo(45);
  });

  it('shrinks oversize furniture proportionately until minimum dimensions are reached', () => {
    const smallRoom = { ...room, width: 200, depth: 200 };
    const result = constrainItem({ ...item, width: 600, depth: 600, rotation: 45 }, smallRoom);
    expect(result.width).toEqual(result.depth);
    expect(result.width).toBeLessThan(142);
    expect(isInsideRoom(result, smallRoom)).toBe(true);
    const thin = constrainItem({ ...item, width: 600, depth: 20, rotation: 45 }, smallRoom);
    expect(thin.depth).toBe(20);
    expect(isInsideRoom(thin, smallRoom)).toBe(true);
  });

  it('applies the same constraints when shrinking a furnished room', () => {
    const source = structuredClone(TEMPLATES[0].document);
    const result = changeRoom(source, { width: 200, depth: 200 });
    expect(result.items.every((piece) => isInsideRoom(piece, result.room))).toBe(true);
    expect(source.room.width).toBe(640);
    expect(result.items.every((piece) => piece.width >= 20 && piece.depth >= 20)).toBe(true);
  });

  it('snaps in world units and normalizes rotation independently of the viewport', () => {
    expect(snapPosition(47)).toBe(50);
    expect(snapPosition(47, 5)).toBe(45);
    expect(snapPosition(47, 0)).toBe(47);
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(450)).toBe(90);
  });
});
