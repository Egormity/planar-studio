import type { Room } from '../model/types';

export interface Point {
  x: number;
  y: number;
}
export const VIEW_MARGIN = 75;

export function viewBox(room: Room, zoom: number, pan: Point) {
  const factor = Math.max(0.5, Math.min(2.5, zoom));
  const width = (room.width + VIEW_MARGIN * 2) / factor;
  const height = (room.depth + VIEW_MARGIN * 2) / factor;
  return {
    x: room.width / 2 + pan.x - width / 2,
    y: room.depth / 2 + pan.y - height / 2,
    width,
    height,
  };
}

export function constrainPan(point: Point, room: Room): Point {
  return {
    x: Math.max(-room.width / 2, Math.min(room.width / 2, point.x)),
    y: Math.max(-room.depth / 2, Math.min(room.depth / 2, point.y)),
  };
}

export function worldPoint(svg: SVGSVGElement, clientX: number, clientY: number): Point | null {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  return Number.isFinite(point.x) && Number.isFinite(point.y) ? { x: point.x, y: point.y } : null;
}
