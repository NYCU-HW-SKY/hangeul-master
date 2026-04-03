import { StorageError } from '../utils/errors';

export const STORAGE_KEYS = {
  USER_PROGRESS: 'korean-learning-progress',
  ACHIEVEMENTS: 'korean-learning-achievements',
  DAILY_CHALLENGES: 'korean-learning-challenges',
  GAME_HISTORY: 'korean-learning-game-history',
  USER_SETTINGS: 'korean-learning-settings',
  VOCABULARY_CACHE: 'korean-learning-vocab-cache',
  SESSION_HISTORY: 'korean-learning-session-history',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

interface StorageData<T> {
  version: string;
  timestamp: number;
  data: T;
}

const CURRENT_VERSION = '1.0.0';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export class StorageService {
  private memoryStore = new Map<string, string>();
  private useMemory: boolean;

  constructor() {
    this.useMemory = !isLocalStorageAvailable();
  }

  save<T>(key: string, data: T): void {
    const payload: StorageData<T> = {
      version: CURRENT_VERSION,
      timestamp: Date.now(),
      data,
    };
    const serialized = JSON.stringify(payload);

    if (this.useMemory) {
      this.memoryStore.set(key, serialized);
      return;
    }

    try {
      localStorage.setItem(key, serialized);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        this.clearOldData();
        try {
          localStorage.setItem(key, serialized);
        } catch {
          // Fall back to memory after clearing
          this.memoryStore.set(key, serialized);
          throw new StorageError('localStorage quota exceeded; data saved to memory only');
        }
      } else {
        throw new StorageError(`Failed to save data for key "${key}": ${String(err)}`);
      }
    }
  }

  load<T>(key: string): T | null {
    let raw: string | null = null;

    if (this.useMemory) {
      raw = this.memoryStore.get(key) ?? null;
    } else {
      try {
        raw = localStorage.getItem(key);
      } catch (err) {
        throw new StorageError(`Failed to load data for key "${key}": ${String(err)}`);
      }
    }

    if (raw === null) return null;

    try {
      const parsed: StorageData<T> = JSON.parse(raw);
      return parsed.data;
    } catch {
      return null;
    }
  }

  remove(key: string): void {
    if (this.useMemory) {
      this.memoryStore.delete(key);
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (err) {
      throw new StorageError(`Failed to remove key "${key}": ${String(err)}`);
    }
  }

  clearOldData(): void {
    const now = Date.now();

    if (this.useMemory) {
      for (const [key, value] of this.memoryStore.entries()) {
        try {
          const parsed: StorageData<unknown> = JSON.parse(value);
          if (now - parsed.timestamp > THIRTY_DAYS_MS) {
            this.memoryStore.delete(key);
          }
        } catch {
          this.memoryStore.delete(key);
        }
      }
      return;
    }

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed: StorageData<unknown> = JSON.parse(raw);
        if (now - parsed.timestamp > THIRTY_DAYS_MS) {
          keysToRemove.push(key);
        }
      } catch {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }
}

export const storageService = new StorageService();
