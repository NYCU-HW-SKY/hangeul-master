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
    calculateCategoryProgress,
    loadProgress,
    saveProgress,
    initializeCategoryProgress,
    isCardStudied,
  };
});
