import { CATALOG } from '../model/catalog';
import { ITEM_LIMIT, ROOM_MAX, ROOM_MIN } from '../model/constants';
import { clamp, constrainItem } from '../model/geometry';
import type { Furniture, FurnitureKind, PlanDocument, Room } from '../model/types';

export function changeItem(
  document: PlanDocument,
  id: string,
  patch: Partial<Furniture>,
): PlanDocument {
  return {
    ...document,
    items: document.items.map((item) =>
      item.id === id ? constrainItem({ ...item, ...patch, id: item.id }, document.room) : item,
    ),
  };
}

export function changeRoom(document: PlanDocument, patch: Partial<Room>): PlanDocument {
  const room: Room = { ...document.room, ...patch };
  room.width = clamp(
    Number.isFinite(room.width) ? room.width : document.room.width,
    ROOM_MIN,
    ROOM_MAX,
  );
  room.depth = clamp(
    Number.isFinite(room.depth) ? room.depth : document.room.depth,
    ROOM_MIN,
    ROOM_MAX,
  );
  return { ...document, room, items: document.items.map((item) => constrainItem(item, room)) };
}

export function addFurniture(
  document: PlanDocument,
  kind: FurnitureKind,
  id: string,
): PlanDocument {
  if (document.items.length >= ITEM_LIMIT)
    throw new Error(
      `This layout already has ${ITEM_LIMIT} pieces. Remove one before adding another.`,
    );
  const catalog = CATALOG.find((entry) => entry.kind === kind);
  if (!catalog) throw new Error('This furniture type is unavailable.');
  const { label, width, depth, color } = catalog;
  const item = constrainItem(
    {
      id,
      kind,
      label,
      width,
      depth,
      color,
      rotation: 0,
      x: document.room.width / 2,
      y: document.room.depth / 2,
    },
    document.room,
  );
  return { ...document, items: [...document.items, item] };
}

export function duplicateFurniture(
  document: PlanDocument,
  item: Furniture,
  id: string,
): PlanDocument {
  if (document.items.length >= ITEM_LIMIT)
    throw new Error(`This layout already has ${ITEM_LIMIT} pieces. Remove one before duplicating.`);
  const label = `${item.label.slice(0, 59)} copy`;
  const duplicate = constrainItem(
    { ...item, id, label, x: item.x + 25, y: item.y + 25 },
    document.room,
  );
  return { ...document, items: [...document.items, duplicate] };
}
