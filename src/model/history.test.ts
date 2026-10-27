import { describe, expect, it } from 'vitest';
import { HISTORY_LIMIT } from './constants';
import { createHistory, historyReducer } from './history';
import { TEMPLATES } from './templates';

const original = TEMPLATES[0].document;

describe('document history', () => {
  it('records one completed operation and returns to the exact previous document', () => {
    const initial = createHistory(original);
    const edited = structuredClone(original);
    edited.items[0].x += 10;
    edited.items[0].y += 20;
    const committed = historyReducer(initial, { type: 'commit', document: edited });
    expect(committed.past).toHaveLength(1);
    edited.name = 'Mutated source';
    expect(committed.present.name).toBe(original.name);
    const undone = historyReducer(committed, { type: 'undo' });
    expect(undone.present).toEqual(original);
    expect(historyReducer(undone, { type: 'redo' }).present).toEqual(committed.present);
  });

  it('ignores no-ops, bounds memory, and clears redo after a new branch', () => {
    let state = createHistory(original);
    expect(historyReducer(state, { type: 'commit', document: structuredClone(original) })).toBe(
      state,
    );
    for (let index = 0; index < 80; index++)
      state = historyReducer(state, {
        type: 'commit',
        document: { ...original, name: `Revision ${index}` },
      });
    expect(state.past).toHaveLength(HISTORY_LIMIT);
    state = historyReducer(state, { type: 'undo' });
    expect(state.future).toHaveLength(1);
    state = historyReducer(state, {
      type: 'commit',
      document: { ...state.present, name: 'New direction' },
    });
    expect(state.future).toHaveLength(0);
    expect(historyReducer(state, { type: 'redo' })).toBe(state);
  });
});
