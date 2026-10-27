import { parseDocument, serializeDocument } from '../model/serialization';
import type { PlanDocument } from '../model/types';

export const STORAGE_KEY = 'planar.document.v1';
export const RECOVERY_KEY = 'planar.document.recovery.v1';
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
export interface SavedPlan {
  document: PlanDocument;
  saveStatus: 'saved' | 'unavailable';
  error: string | null;
  recoveryRaw: string | null;
}

export function browserStorage(): StorageLike | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadSavedPlan(storage: StorageLike | undefined, fallback: PlanDocument): SavedPlan {
  const empty = {
    document: structuredClone(fallback),
    saveStatus: 'saved' as const,
    error: null,
    recoveryRaw: null,
  };
  if (!storage)
    return {
      ...empty,
      saveStatus: 'unavailable',
      error: 'Saving on this device is unavailable. Export JSON to keep your layout.',
    };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return {
      ...empty,
      saveStatus: 'unavailable',
      error: 'Saving on this device is blocked. Export JSON to keep your layout.',
    };
  }
  if (!raw) return empty;
  try {
    return { ...empty, document: parseDocument(raw) };
  } catch {
    return {
      ...empty,
      saveStatus: 'unavailable',
      recoveryRaw: raw,
      error:
        'The saved layout could not be read. Your previous save is preserved; edit this example or import a valid layout to continue.',
    };
  }
}

export function saveDocument(
  storage: StorageLike | undefined,
  document: PlanDocument,
  recoveryRaw: string | null = null,
): boolean {
  if (!storage) return false;
  try {
    const serialized = serializeDocument(document);
    // Preserve unreadable data before a deliberate edit replaces it, never on initial mount.
    if (recoveryRaw !== null) storage.setItem(RECOVERY_KEY, recoveryRaw);
    storage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}
