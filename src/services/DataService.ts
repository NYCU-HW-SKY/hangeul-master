import type { VocabularyData, Flashcard, Category } from '../types';
import { NetworkError, ValidationError } from '../utils/errors';
import { storageService, STORAGE_KEYS } from './StorageService';
import { vocabularyData as embeddedVocabularyData } from '@/data/vocabulary';

const FALLBACK_VOCABULARY: VocabularyData = {
  version: '1.0.0',
  lastUpdated: new Date('2024-01-01T00:00:00.000Z'),
  categories: [
    {
      id: 'numbers',
      name: '數字',
      description: '韓文數字 1 到 3',
      icon: '🔢',
      color: '#4F46E5',
      order: 1,
      cardIds: ['num-001', 'num-002', 'num-003'],
    },
  ],
  flashcards: [
    {
      id: 'num-001',
      korean: '일',
      chinese: '一（1）',
      romanization: 'il',
      audioUrl: '/audio/numbers/num-001.mp3',
      category: 'numbers',
      difficulty: 1,
      tags: ['number'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'num-002',
      korean: '이',
      chinese: '二（2）',
      romanization: 'i',
      audioUrl: '/audio/numbers/num-002.mp3',
      category: 'numbers',
      difficulty: 1,
      tags: ['number'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'num-003',
      korean: '삼',
      chinese: '三（3）',
      romanization: 'sam',
      audioUrl: '/audio/numbers/num-003.mp3',
      category: 'numbers',
      difficulty: 1,
      tags: ['number'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ],
};

export class DataService {
  private vocabularyCache: VocabularyData | null = null;

  async loadVocabulary(): Promise<VocabularyData> {
    // Return in-memory cache first
    if (this.vocabularyCache) {
      return this.vocabularyCache;
    }

    // Try localStorage cache
    const cached = this.getCachedVocabularyData();
    if (cached) {
      this.vocabularyCache = cached;
      return cached;
    }

    // Fetch from embedded data
    try {
      const raw = embeddedVocabularyData;
      const data = this.parseVocabularyData(raw);
      this.validateVocabularyData(data);
      this.cacheVocabularyData(data);
      this.vocabularyCache = data;
      return data;
    } catch (err) {
      if (err instanceof NetworkError || err instanceof ValidationError) {
        console.warn('[DataService] Failed to load vocabulary:', err.message);
      } else {
        console.warn('[DataService] Unexpected error loading vocabulary:', err);
      }
      return this.getFallbackVocabularyData();
    }
  }

  validateVocabularyData(data: VocabularyData): void {
    if (!data.version || typeof data.version !== 'string') {
      throw new ValidationError('Missing or invalid "version" field');
    }
    if (!Array.isArray(data.categories) || data.categories.length === 0) {
      throw new ValidationError('Missing or empty "categories" array');
    }
    if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
      throw new ValidationError('Missing or empty "flashcards" array');
    }

    // Validate category required fields
    const categoryIds = new Set<string>();
    for (const cat of data.categories) {
      if (!cat.id || !cat.name) {
        throw new ValidationError(`Category missing required fields: ${JSON.stringify(cat)}`);
      }
      if (categoryIds.has(cat.id)) {
        throw new ValidationError(`Duplicate category ID: ${cat.id}`);
      }
      categoryIds.add(cat.id);
    }

    // Validate flashcard required fields and unique IDs
    const cardIds = new Set<string>();
    for (const card of data.flashcards) {
      if (!card.id || !card.korean || !card.chinese) {
        throw new ValidationError(`Flashcard missing required fields: ${JSON.stringify(card)}`);
      }
      if (cardIds.has(card.id)) {
        throw new ValidationError(`Duplicate flashcard ID: ${card.id}`);
      }
      cardIds.add(card.id);

      // Validate category reference
      if (!categoryIds.has(card.category)) {
        throw new ValidationError(
          `Flashcard "${card.id}" references unknown category "${card.category}"`
        );
      }
    }
  }

  cacheVocabularyData(data: VocabularyData): void {
    try {
      storageService.save(STORAGE_KEYS.VOCABULARY_CACHE, data);
    } catch (err) {
      console.warn('[DataService] Failed to cache vocabulary data:', err);
    }
  }

  getCachedVocabularyData(): VocabularyData | null {
    try {
      const cached = storageService.load<VocabularyData>(STORAGE_KEYS.VOCABULARY_CACHE);
      if (!cached) return null;
      // Re-parse dates since JSON serialization loses Date objects
      return this.rehydrateDates(cached);
    } catch {
      return null;
    }
  }

  getFallbackVocabularyData(): VocabularyData {
    return FALLBACK_VOCABULARY;
  }

  private parseVocabularyData(raw: unknown): VocabularyData {
    if (typeof raw !== 'object' || raw === null) {
      throw new ValidationError('Vocabulary data must be an object');
    }
    const obj = raw as Record<string, unknown>;
    return {
      version: String(obj['version'] ?? ''),
      lastUpdated: new Date(String(obj['lastUpdated'] ?? '')),
      categories: this.parseCategories(obj['categories']),
      flashcards: this.parseFlashcards(obj['flashcards']),
    };
  }

  private parseCategories(raw: unknown): Category[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((item: unknown) => {
      const c = item as Record<string, unknown>;
      return {
        id: String(c['id'] ?? ''),
        name: String(c['name'] ?? ''),
        description: String(c['description'] ?? ''),
        icon: String(c['icon'] ?? ''),
        color: String(c['color'] ?? ''),
        order: Number(c['order'] ?? 0),
        cardIds: Array.isArray(c['cardIds']) ? c['cardIds'].map(String) : [],
      };
    });
  }

  private parseFlashcards(raw: unknown): Flashcard[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((item: unknown) => {
      const f = item as Record<string, unknown>;
      return {
        id: String(f['id'] ?? ''),
        korean: String(f['korean'] ?? ''),
        chinese: String(f['chinese'] ?? ''),
        romanization: f['romanization'] !== undefined ? String(f['romanization']) : undefined,
        audioUrl: String(f['audioUrl'] ?? ''),
        category: String(f['category'] ?? ''),
        difficulty: (f['difficulty'] as 1 | 2 | 3) ?? 1,
        tags: Array.isArray(f['tags']) ? f['tags'].map(String) : [],
        createdAt: new Date(String(f['createdAt'] ?? '')),
        updatedAt: new Date(String(f['updatedAt'] ?? '')),
      };
    });
  }

  private rehydrateDates(data: VocabularyData): VocabularyData {
    return {
      ...data,
      lastUpdated: new Date(data.lastUpdated),
      flashcards: data.flashcards.map((f) => ({
        ...f,
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt),
      })),
    };
  }
}

export const dataService = new DataService();
