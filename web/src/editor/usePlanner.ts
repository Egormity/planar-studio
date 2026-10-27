import { useCallback, useRef, useState } from 'react';
import { createHistory, historyReducer } from '../model/history';
import { parseDocument, validateDocument } from '../model/serialization';
import { TEMPLATES } from '../model/templates';
import type { Furniture, FurnitureKind, PlanDocument, Room } from '../model/types';
import { addFurniture, changeItem, changeRoom, duplicateFurniture } from './commands';
import { browserStorage, loadSavedPlan, saveDocument } from './persistence';

export function usePlanner() {
  const [initial] = useState(() => {
    const storage = browserStorage();
    return { ...loadSavedPlan(storage, TEMPLATES[0].document), storage };
  });
  const [history, setHistory] = useState(() => createHistory(initial.document));
  const historyRef = useRef(history);
  const recoveryRaw = useRef(initial.recoveryRaw);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initial.error);
  const [saveStatus, setSaveStatus] = useState(initial.saveStatus);

  const persist = useCallback(
    (document: PlanDocument) => {
      if (saveDocument(initial.storage, document, recoveryRaw.current)) {
        recoveryRaw.current = null;
        setSaveStatus('saved');
      } else {
        setSaveStatus('unavailable');
        setError(
          'Your changes are available for this visit, but could not be saved on this device. Export JSON to keep them.',
        );
      }
    },
    [initial.storage],
  );

  const commit = useCallback(
    (document: PlanDocument): boolean => {
      try {
        const valid = validateDocument(document);
        const next = historyReducer(historyRef.current, { type: 'commit', document: valid });
        if (next === historyRef.current) {
          if (recoveryRaw.current !== null) {
            setError(null);
            persist(next.present);
          }
          return true;
        }
        historyRef.current = next;
        setHistory(next);
        setSelectedId((id) => (next.present.items.some((item) => item.id === id) ? id : null));
        setError(null);
        persist(next.present);
        return true;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'This layout could not be updated.');
        return false;
      }
    },
    [persist],
  );

  const select = useCallback((id: string | null) => {
    setSelectedId(
      id && historyRef.current.present.items.some((item) => item.id === id) ? id : null,
    );
  }, []);
  const updateItem = useCallback(
    (id: string, patch: Partial<Furniture>) => {
      commit(changeItem(historyRef.current.present, id, patch));
    },
    [commit],
  );
  const updateRoom = useCallback(
    (patch: Partial<Room>) => {
      commit(changeRoom(historyRef.current.present, patch));
    },
    [commit],
  );
  const addItem = useCallback(
    (kind: FurnitureKind) => {
      try {
        const id = crypto.randomUUID();
        if (commit(addFurniture(historyRef.current.present, kind, id))) select(id);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'The piece could not be added.');
      }
    },
    [commit, select],
  );
  const duplicateSelected = useCallback(() => {
    const item = historyRef.current.present.items.find(({ id }) => id === selectedId);
    if (!item) return;
    try {
      const id = crypto.randomUUID();
      if (commit(duplicateFurniture(historyRef.current.present, item, id))) select(id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The piece could not be duplicated.');
    }
  }, [commit, select, selectedId]);
  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    const current = historyRef.current.present;
    if (commit({ ...current, items: current.items.filter((item) => item.id !== selectedId) }))
      select(null);
  }, [commit, select, selectedId]);
  const rotateSelected = useCallback(
    (degrees = 90) => {
      const item = historyRef.current.present.items.find(({ id }) => id === selectedId);
      if (item) updateItem(item.id, { rotation: item.rotation + degrees });
    },
    [selectedId, updateItem],
  );
  const travelHistory = useCallback(
    (type: 'undo' | 'redo') => {
      const next = historyReducer(historyRef.current, { type });
      if (next === historyRef.current) return;
      historyRef.current = next;
      setHistory(next);
      setSelectedId((id) => (next.present.items.some((item) => item.id === id) ? id : null));
      setError(null);
      persist(next.present);
    },
    [persist],
  );
  const loadTemplate = useCallback(
    (id: string) => {
      const template = TEMPLATES.find((entry) => entry.id === id);
      if (template && commit(template.document)) select(null);
    },
    [commit, select],
  );
  const importJson = useCallback(
    (source: string): boolean => {
      try {
        if (!commit(parseDocument(source))) return false;
        select(null);
        return true;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'This layout could not be imported.');
        return false;
      }
    },
    [commit, select],
  );

  return {
    document: history.present,
    selectedId,
    selectedItem: history.present.items.find((item) => item.id === selectedId),
    select,
    commit,
    updateItem,
    updateRoom,
    addItem,
    duplicateSelected,
    removeSelected,
    rotateSelected,
    undo: () => travelHistory('undo'),
    redo: () => travelHistory('redo'),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    loadTemplate,
    importJson,
    error,
    clearError: () => setError(null),
    saveStatus,
  };
}
