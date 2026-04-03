import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { Flashcard, Category } from '../types';
import { dataService } from '../services/DataService';

export const useVocabularyStore = defineStore('vocabulary', () => {
  // State
  const categories = ref<Category[]>([]);
  const flashcards = ref<Flashcard[]>([]);
  const currentCategory = ref<string>('');
  const currentCardIndex = ref<number>(0);

  // Getters
  const currentCategoryCards = computed(() => {
    if (!currentCategory.value) return flashcards.value;
    return flashcards.value.filter((card) => card.category === currentCategory.value);
  });

  const currentCard = computed<Flashcard | null>(() => {
    const cards = currentCategoryCards.value;
    if (cards.length === 0) return null;
    const idx = Math.min(currentCardIndex.value, cards.length - 1);
    return cards[idx] ?? null;
  });

  const totalCards = computed(() => currentCategoryCards.value.length);

  // Actions
  async function loadVocabulary(): Promise<void> {
    const data = await dataService.loadVocabulary();
    categories.value = data.categories;
    flashcards.value = data.flashcards;
    if (!currentCategory.value && data.categories.length > 0) {
      currentCategory.value = data.categories[0].id;
    }
    currentCardIndex.value = 0;
  }

  function setCategory(categoryId: string): void {
    currentCategory.value = categoryId;
    currentCardIndex.value = 0;
  }

  function nextCard(): void {
    const max = currentCategoryCards.value.length - 1;
    if (currentCardIndex.value < max) {
      currentCardIndex.value++;
    }
  }

  function previousCard(): void {
    if (currentCardIndex.value > 0) {
      currentCardIndex.value--;
    }
  }

  // Initialize on store creation
  loadVocabulary();

  return {
    categories,
    flashcards,
    currentCategory,
    currentCardIndex,
    currentCard,
    currentCategoryCards,
    totalCards,
    loadVocabulary,
    setCategory,
    nextCard,
    previousCard,
  };
});
