import { ITEM_MAX, ITEM_MIN } from './constants';
import type { Furniture, Room } from './types';

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function normalizeRotation(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

export function snapPosition(value: number, step = 10): number {
  return Number.isFinite(step) && step > 0 ? Math.round(value / step) * step : value;
}

export function rotatedHalfExtents(item: Pick<Furniture, 'width' | 'depth' | 'rotation'>): {
  x: number;
  y: number;
} {
  const radians = (item.rotation * Math.PI) / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  return {
    x: (item.width * cosine + item.depth * sine) / 2,
    y: (item.width * sine + item.depth * cosine) / 2,
  };
}

export function isInsideRoom(item: Furniture, room: Room, tolerance = 1e-6): boolean {
  const half = rotatedHalfExtents(item);
  return (
    item.x >= half.x - tolerance &&
    item.y >= half.y - tolerance &&
    item.x + half.x <= room.width + tolerance &&
    item.y + half.y <= room.depth + tolerance
  );
}

export function constrainItem(item: Furniture, room: Room): Furniture {
  const rotation = normalizeRotation(Number.isFinite(item.rotation) ? item.rotation : 0);
  let width = clamp(Number.isFinite(item.width) ? item.width : ITEM_MIN, ITEM_MIN, ITEM_MAX);
  let depth = clamp(Number.isFinite(item.depth) ? item.depth : ITEM_MIN, ITEM_MIN, ITEM_MAX);
  const fits = (scale: number) => {
    const half = rotatedHalfExtents({
      width: Math.max(ITEM_MIN, width * scale),
      depth: Math.max(ITEM_MIN, depth * scale),
      rotation,
    });
    return half.x * 2 <= room.width && half.y * 2 <= room.depth;
  };
  if (!fits(1)) {
    let low = 0;
    let high = 1;
    for (let step = 0; step < 40; step++) {
      const middle = (low + high) / 2;
      if (fits(middle)) low = middle;
      else high = middle;
    }
    // Preserve aspect ratio until a dimension reaches the minimum editable size.
    width = Math.max(ITEM_MIN, Math.floor(width * low * 100) / 100);
    depth = Math.max(ITEM_MIN, Math.floor(depth * low * 100) / 100);
  }
  const half = rotatedHalfExtents({ width, depth, rotation });
  const x = Number.isFinite(item.x) ? item.x : room.width / 2;
  const y = Number.isFinite(item.y) ? item.y : room.depth / 2;
  return {
    ...item,
    width,
    depth,
    rotation,
    x: clamp(x, half.x, room.width - half.x),
    y: clamp(y, half.y, room.depth - half.y),
  };
}
