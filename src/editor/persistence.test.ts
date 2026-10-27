import { describe, expect, it } from 'vitest';
import { TEMPLATES } from '../model/templates';
import {
  loadSavedPlan,
  RECOVERY_KEY,
  saveDocument,
  STORAGE_KEY,
  type StorageLike,
} from './persistence';

const fallback = TEMPLATES[0].document;
const memory = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
};

describe('optional local persistence', () => {
  it('loads saves and preserves unreadable content until an explicit edit', () => {
    const storage = memory({ [STORAGE_KEY]: '{broken' });
    const loaded = loadSavedPlan(storage, fallback);
    expect(loaded.document).toEqual(fallback);
    expect(loaded.saveStatus).toBe('unavailable');
    expect(storage.getItem(STORAGE_KEY)).toBe('{broken');
    expect(storage.getItem(RECOVERY_KEY)).toBeNull();
    expect(saveDocument(storage, fallback, loaded.recoveryRaw)).toBe(true);
    expect(storage.getItem(RECOVERY_KEY)).toBe('{broken');
    expect(loadSavedPlan(storage, fallback).document).toEqual(fallback);
  });

  it('keeps the previous raw save when its recovery copy cannot be written', () => {
    const storage = memory({ [STORAGE_KEY]: '{broken' });
    const blocked: StorageLike = {
      getItem: storage.getItem,
      setItem: () => {
        throw new Error('Quota');
      },
    };
    expect(saveDocument(blocked, fallback, '{broken')).toBe(false);
    expect(storage.getItem(STORAGE_KEY)).toBe('{broken');
  });

  it('keeps a usable fallback when storage is blocked or unavailable', () => {
    const blocked: StorageLike = {
      getItem: () => {
        throw new Error('Blocked');
      },
      setItem: () => {
        throw new Error('Blocked');
      },
    };
    expect(loadSavedPlan(blocked, fallback).document).toEqual(fallback);
    expect(loadSavedPlan(blocked, fallback).saveStatus).toBe('unavailable');
    expect(loadSavedPlan(undefined, fallback).saveStatus).toBe('unavailable');
    expect(saveDocument(undefined, fallback)).toBe(false);
    expect(saveDocument(blocked, fallback)).toBe(false);
  });
});
