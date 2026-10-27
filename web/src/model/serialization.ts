import { CATALOG } from './catalog';
import {
  DOCUMENT_BYTE_LIMIT,
  ITEM_LIMIT,
  ITEM_MAX,
  ITEM_MIN,
  ROOM_MAX,
  ROOM_MIN,
} from './constants';
import { isInsideRoom } from './geometry';
import type { FloorMaterial, Furniture, FurnitureKind, PlanDocument, Room } from './types';

const kinds = new Set(CATALOG.map(({ kind }) => kind));
const fail = (message: string): never => {
  throw new Error(message);
};

function record(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return fail(`${label} must be an object.`);
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some((key) => !keys.includes(key)))
    return fail(`${label} contains an unsupported property.`);
  return result;
}

function number(value: unknown, minimum: number, maximum: number, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    return fail(`${label} must be a finite number between ${minimum} and ${maximum}.`);
  }
  return value;
}

function text(value: unknown, maximum: number, label: string): string {
  if (
    typeof value !== 'string' ||
    value.trim().length === 0 ||
    value.length > maximum ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return fail(`${label} must contain 1–${maximum} printable characters.`);
  }
  return value.trim();
}

function readRoom(value: unknown): Room {
  const room = record(value, ['width', 'depth', 'floor'], 'Room');
  if (!['oak', 'stone', 'plain'].includes(String(room.floor)))
    return fail('Unknown floor material.');
  return {
    width: number(room.width, ROOM_MIN, ROOM_MAX, 'Room width'),
    depth: number(room.depth, ROOM_MIN, ROOM_MAX, 'Room depth'),
    floor: room.floor as FloorMaterial,
  };
}

function readItem(value: unknown, room: Room): Furniture {
  const item = record(
    value,
    ['id', 'kind', 'label', 'x', 'y', 'width', 'depth', 'rotation', 'color'],
    'Furniture',
  );
  const id = text(item.id, 64, 'Furniture ID');
  if (!/^[a-zA-Z0-9_-]+$/.test(id))
    return fail('Furniture IDs may contain letters, numbers, underscores and hyphens.');
  if (!kinds.has(item.kind as FurnitureKind)) return fail('Unknown furniture kind.');
  if (typeof item.color !== 'string' || !/^#[a-fA-F0-9]{6}$/.test(item.color))
    return fail('Furniture color must be a six-digit hex color.');
  const result: Furniture = {
    id,
    kind: item.kind as FurnitureKind,
    label: text(item.label, 64, 'Furniture label'),
    x: number(item.x, 0, room.width, 'Furniture X'),
    y: number(item.y, 0, room.depth, 'Furniture Y'),
    width: number(item.width, ITEM_MIN, ITEM_MAX, 'Furniture width'),
    depth: number(item.depth, ITEM_MIN, ITEM_MAX, 'Furniture depth'),
    rotation: number(item.rotation, 0, 359.99999999999994, 'Furniture rotation'),
    color: item.color.toLowerCase(),
  };
  if (!isInsideRoom(result, room))
    return fail(`“${result.label}” extends beyond the room. Move or resize it before importing.`);
  return result;
}

export function validateDocument(value: unknown): PlanDocument {
  const document = record(value, ['version', 'name', 'room', 'items'], 'Layout');
  if (document.version !== 1)
    return fail('This layout version is unsupported. Expected version 1.');
  const room = readRoom(document.room);
  if (!Array.isArray(document.items) || document.items.length > ITEM_LIMIT)
    return fail(`A layout supports at most ${ITEM_LIMIT} furniture pieces.`);
  const items = document.items.map((value) => readItem(value, room));
  if (new Set(items.map(({ id }) => id)).size !== items.length)
    return fail('Furniture IDs must be unique.');
  return { version: 1, name: text(document.name, 80, 'Layout name'), room, items };
}

export function parseDocument(source: string): PlanDocument {
  if (new TextEncoder().encode(source).byteLength > DOCUMENT_BYTE_LIMIT)
    return fail('This layout is too large. The limit is 1 MB.');
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    return fail('This file is not valid JSON. Choose a Planar layout export.');
  }
  return validateDocument(value);
}

export function serializeDocument(document: PlanDocument): string {
  return JSON.stringify(validateDocument(document), null, 2);
}
