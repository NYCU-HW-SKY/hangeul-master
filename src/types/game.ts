export interface MemoryCard {
  id: string;
  flashcardId: string;
  type: 'korean' | 'chinese';
  content: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameState {
  gameId: string;
  cards: MemoryCard[];
  flippedCardIds: string[];
  matchedPairIds: string[];
  moves: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
}

export interface GameHistory {
  gameId: string;
  categoryId: string;
  moves: number;
  duration: number;
  completedAt: Date;
}
