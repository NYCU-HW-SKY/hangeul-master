export interface StudyRecord {
  cardId: string;
  studiedAt: Date;
  correct?: boolean;
}

export interface CategoryProgress {
  categoryId: string;
  categoryName: string;
  studiedCardIds: string[];
  totalCards: number;
  percentage: number;
  lastStudiedAt?: Date;
}

export interface UserProgress {
  userId?: string;
  studyRecords: StudyRecord[];
  categoryProgress: CategoryProgress[];
  totalStudied: number;
  totalCards: number;
  overallPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}
