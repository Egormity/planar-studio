import { HISTORY_LIMIT } from './constants';
import type { PlanDocument } from './types';

export interface HistoryState {
  past: PlanDocument[];
  present: PlanDocument;
  future: PlanDocument[];
}

export type HistoryAction =
  | { type: 'commit'; document: PlanDocument }
  | { type: 'undo' }
  | { type: 'redo' };
export const createHistory = (document: PlanDocument): HistoryState => ({
  past: [],
  present: structuredClone(document),
  future: [],
});

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  if (action.type === 'commit') {
    if (JSON.stringify(state.present) === JSON.stringify(action.document)) return state;
    return {
      past: [...state.past, state.present].slice(-HISTORY_LIMIT),
      present: structuredClone(action.document),
      future: [],
    };
  }
  if (action.type === 'undo') {
    const previous = state.past.at(-1);
    return previous
      ? {
          past: state.past.slice(0, -1),
          present: previous,
          future: [state.present, ...state.future],
        }
      : state;
  }
  const next = state.future[0];
  return next
    ? {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: next,
        future: state.future.slice(1),
      }
    : state;
}
