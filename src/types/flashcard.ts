export interface Flashcard {
  id: string;
  korean: string;
  chinese: string;
  romanization?: string;
  category: string;
  difficulty?: 1 | 2 | 3;
  tags?: string[];
  example?: string;
  exampleTranslation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  cardIds: string[];
  order: number;
}

export interface VocabularyData {
  version: string;
  categories: Category[];
  flashcards: Flashcard[];
  lastUpdated: Date;
}
