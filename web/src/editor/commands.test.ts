import { describe, expect, it } from 'vitest';
import { ITEM_LIMIT } from '../model/constants';
import { isInsideRoom } from '../model/geometry';
import { TEMPLATES } from '../model/templates';
import { addFurniture, changeItem, duplicateFurniture } from './commands';

const initial = TEMPLATES[0].document;

describe('editor document operations', () => {
  it('adds and duplicates independent pieces within the room', () => {
    const added = addFurniture(initial, 'bed', 'added-bed');
    expect(added.items).toHaveLength(initial.items.length + 1);
    const bed = added.items.at(-1)!;
    expect(isInsideRoom(bed, added.room)).toBe(true);
    const duplicated = duplicateFurniture(added, bed, 'copied-bed');
    expect(duplicated.items.at(-1)?.id).toBe('copied-bed');
    expect(duplicated.items.at(-1)?.label).toBe('Double bed copy');
    expect(initial.items).toHaveLength(6);
  });

  it('routes inspector geometry through the same boundary rules and protects IDs', () => {
    const edited = changeItem(initial, 'living-sofa', {
      id: 'different',
      x: -50,
      y: 900,
      rotation: 405,
    });
    const sofa = edited.items.find(({ id }) => id === 'living-sofa')!;
    expect(sofa.rotation).toBe(45);
    expect(isInsideRoom(sofa, edited.room)).toBe(true);
    expect(edited.items.some(({ id }) => id === 'different')).toBe(false);
  });

  it('reports the item limit without changing a full document', () => {
    const full = {
      ...initial,
      items: Array.from({ length: ITEM_LIMIT }, (_, index) => ({
        ...initial.items[0],
        id: `item-${index}`,
      })),
    };
    expect(() => addFurniture(full, 'chair', 'extra')).toThrow('60');
    expect(() => duplicateFurniture(full, full.items[0], 'extra')).toThrow('60');
    expect(full.items).toHaveLength(ITEM_LIMIT);
  });
});
