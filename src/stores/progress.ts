import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { StudyRecord, CategoryProgress, Category, Flashcard } from '../types';
import { storageService, STORAGE_KEYS } from '../services/StorageService';
import { useAchievementStore } from './achievement';

export const useProgressStore = defineStore('progress', () => {
  // State
  const studyRecords = ref<StudyRecord[]>([]);
  const categoryProgress = ref<CategoryProgress[]>([]);
  const totalStudied = ref<number>(0);
  const totalCards = ref<number>(0);
  
  // Debounce timer for save operations
  let saveTimer: number | null = null;
  const SAVE_DEBOUNCE_MS = 500;

  // Getters
  const overallPercentage = computed(() => {
    if (totalCards.value === 0) return 0;
    return Math.round((totalStudied.value / totalCards.value) * 100);
  });

  function getCategoryProgress(categoryId: string): CategoryProgress | undefined {
    return categoryProgress.value.find((cp) => cp.categoryId === categoryId);
  }

  // Actions
  function markCardStudied(cardId: string, categoryId: string): void {
    const record: StudyRecord = { cardId, studiedAt: new Date() };
    studyRecords.value.push(record);

    // Update unique studied count
    const uniqueStudied = new Set(studyRecords.value.map((r) => r.cardId));
    totalStudied.value = uniqueStudied.size;

    // Update category progress
    const categoryIdx = categoryProgress.value.findIndex((cp) => cp.categoryId === categoryId);
    if (categoryIdx !== -1) {
      const cp = categoryProgress.value[categoryIdx];
      if (!cp.studiedCardIds.includes(cardId)) {
        cp.studiedCardIds.push(cardId);
        cp.percentage = cp.totalCards > 0
          ? Math.round((cp.studiedCardIds.length / cp.totalCards) * 100)
          : 0;
        cp.lastStudiedAt = new Date();
      }
    }

    calculateCategoryProgress();
    saveProgress();
    
    // Check achievements after updating progress
    const achievementStore = useAchievementStore();
    achievementStore.checkAchievements({
      totalStudied: totalStudied.value,
    });
  }

  function calculateCategoryProgress(): void {
    // Update each category's progress
    categoryProgress.value = categoryProgress.value.map((cp) => {
      const lastRecord = studyRecords.value
        .filter((r) => cp.studiedCardIds.includes(r.cardId))
        .sort((a, b) => new Date(b.studiedAt).getTime() - new Date(a.studiedAt).getTime())[0];

      return {
        ...cp,
        percentage: cp.totalCards > 0
          ? Math.round((cp.studiedCardIds.length / cp.totalCards) * 100)
          : 0,
        lastStudiedAt: lastRecord ? new Date(lastRecord.studiedAt) : cp.lastStudiedAt,
      };
    });
  }

  function loadProgress(): void {
    const saved = storageService.load<{
      studyRecords: StudyRecord[];
      categoryProgress: CategoryProgress[];
      totalStudied: number;
      totalCards: number;
    }>(STORAGE_KEYS.USER_PROGRESS);

    if (saved) {
      studyRecords.value = saved.studyRecords.map((r) => ({
        ...r,
        studiedAt: new Date(r.studiedAt),
      }));
      categoryProgress.value = saved.categoryProgress.map((cp) => ({
        ...cp,
        lastStudiedAt: cp.lastStudiedAt ? new Date(cp.lastStudiedAt) : undefined,
      }));
      totalStudied.value = saved.totalStudied;
      totalCards.value = saved.totalCards;
    }
  }

  function saveProgress(): void {
    storageService.save(STORAGE_KEYS.USER_PROGRESS, {
      studyRecords: studyRecords.value,
      categoryProgress: categoryProgress.value,
      totalStudied: totalStudied.value,
      totalCards: totalCards.value,
    });
  }

  function debouncedSaveProgress(): void {
    if (saveTimer !== null) {
      clearTimeout(saveTimer);
    }
    saveTimer = window.setTimeout(() => {
      saveProgress();
      saveTimer = null;
    }, SAVE_DEBOUNCE_MS);
  }

  function flushSave(): void {
    if (saveTimer !== null) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    saveProgress();
  }

  function initializeCategoryProgress(categories: Category[], flashcards: Flashcard[]): void {
    totalCards.value = flashcards.length;
    
    // Initialize category progress if not already loaded
    if (categoryProgress.value.length === 0) {
      categoryProgress.value = categories.map((cat) => {
        const categoryCards = flashcards.filter((card) => card.category === cat.id);
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          totalCards: categoryCards.length,
          studiedCardIds: [],
          percentage: 0,
          lastStudiedAt: undefined,
        };
      });
    } else {
      // Update total cards for existing categories
      categoryProgress.value = categoryProgress.value.map((cp) => {
        const categoryCards = flashcards.filter((card) => card.category === cp.categoryId);
        return {
          ...cp,
          totalCards: categoryCards.length,
          percentage: categoryCards.length > 0
            ? Math.round((cp.studiedCardIds.length / categoryCards.length) * 100)
            : 0,
        };
      });
    }
    
    saveProgress();
  }

  function unmarkCardStudied(cardId: string, categoryId: string): void {
    // Remove all study records for this card
    studyRecords.value = studyRecords.value.filter((r) => r.cardId !== cardId);

    // Update unique studied count
    const uniqueStudied = new Set(studyRecords.value.map((r) => r.cardId));
    totalStudied.value = uniqueStudied.size;

    // Update category progress
    const categoryIdx = categoryProgress.value.findIndex((cp) => cp.categoryId === categoryId);
    if (categoryIdx !== -1) {
      const cp = categoryProgress.value[categoryIdx];
      cp.studiedCardIds = cp.studiedCardIds.filter((id) => id !== cardId);
      cp.percentage = cp.totalCards > 0
        ? Math.round((cp.studiedCardIds.length / cp.totalCards) * 100)
        : 0;
      
      // Update lastStudiedAt to the most recent remaining record
      const remainingRecords = studyRecords.value
        .filter((r) => cp.studiedCardIds.includes(r.cardId))
        .sort((a, b) => new Date(b.studiedAt).getTime() - new Date(a.studiedAt).getTime());
      
      cp.lastStudiedAt = remainingRecords.length > 0 
        ? new Date(remainingRecords[0].studiedAt) 
        : undefined;
    }

    calculateCategoryProgress();
    debouncedSaveProgress();
    
    // Check achievements after updating progress
    const achievementStore = useAchievementStore();
    achievementStore.checkAchievements({
      totalStudied: totalStudied.value,
    });
  }

  function toggleCardStudied(cardId: string, categoryId: string): boolean {
    const isStudied = isCardStudied(cardId);
    if (isStudied) {
      unmarkCardStudied(cardId, categoryId);
    } else {
      markCardStudied(cardId, categoryId);
    }
    return !isStudied;
  }

  function isCategoryFullyStudied(_categoryId: string, cardIds: string[]): boolean {
    if (cardIds.length === 0) return false;
    return cardIds.every(cardId => isCardStudied(cardId));
  }

  function markCategoryStudied(categoryId: string, cardIds: string[]): void {
    const now = new Date();
    
    // Add study records for all cards in the category that aren't already studied
    cardIds.forEach(cardId => {
      if (!isCardStudied(cardId)) {
        studyRecords.value.push({ cardId, studiedAt: now });
      }
    });

    // Update unique studied count
    const uniqueStudied = new Set(studyRecords.value.map((r) => r.cardId));
    totalStudied.value = uniqueStudied.size;

    // Update category progress
    const categoryIdx = categoryProgress.value.findIndex((cp) => cp.categoryId === categoryId);
    if (categoryIdx !== -1) {
      const cp = categoryProgress.value[categoryIdx];
      cp.studiedCardIds = [...new Set([...cp.studiedCardIds, ...cardIds])];
      cp.percentage = cp.totalCards > 0
        ? Math.round((cp.studiedCardIds.length / cp.totalCards) * 100)
        : 0;
      cp.lastStudiedAt = now;
    }

    calculateCategoryProgress();
    debouncedSaveProgress();
    
    // Check achievements after updating progress
    const achievementStore = useAchievementStore();
    achievementStore.checkAchievements({
      totalStudied: totalStudied.value,
    });
  }

  function unmarkCategoryStudied(categoryId: string, cardIds: string[]): void {
    // Remove all study records for cards in this category
    studyRecords.value = studyRecords.value.filter((r) => !cardIds.includes(r.cardId));

    // Update unique studied count
    const uniqueStudied = new Set(studyRecords.value.map((r) => r.cardId));
    totalStudied.value = uniqueStudied.size;

    // Update category progress
    const categoryIdx = categoryProgress.value.findIndex((cp) => cp.categoryId === categoryId);
    if (categoryIdx !== -1) {
      const cp = categoryProgress.value[categoryIdx];
      cp.studiedCardIds = cp.studiedCardIds.filter((id) => !cardIds.includes(id));
      cp.percentage = cp.totalCards > 0
        ? Math.round((cp.studiedCardIds.length / cp.totalCards) * 100)
        : 0;
      
      // Update lastStudiedAt to the most recent remaining record
      const remainingRecords = studyRecords.value
        .filter((r) => cp.studiedCardIds.includes(r.cardId))
        .sort((a, b) => new Date(b.studiedAt).getTime() - new Date(a.studiedAt).getTime());
      
      cp.lastStudiedAt = remainingRecords.length > 0 
        ? new Date(remainingRecords[0].studiedAt) 
        : undefined;
    }

    calculateCategoryProgress();
    debouncedSaveProgress();
    
    // Check achievements after updating progress
    const achievementStore = useAchievementStore();
    achievementStore.checkAchievements({
      totalStudied: totalStudied.value,
    });
  }

  function isCardStudied(cardId: string): boolean {
    return studyRecords.value.some((r) => r.cardId === cardId);
  }

  // Initialize
  loadProgress();

  return {
    studyRecords,
    categoryProgress,
    totalStudied,
    totalCards,
    overallPercentage,
    getCategoryProgress,
    markCardStudied,
    unmarkCardStudied,
    toggleCardStudied,
    markCategoryStudied,
    unmarkCategoryStudied,
    isCategoryFullyStudied,
    calculateCategoryProgress,
    loadProgress,
    saveProgress,
    debouncedSaveProgress,
    flushSave,
    initializeCategoryProgress,
    isCardStudied,
  };
});
