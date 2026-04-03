export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  cardIds: string[];
  completed: boolean;
  completedAt?: Date;
  progress: number;
}

export interface StreakRecord {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  totalChallengesCompleted: number;
}

export interface DailyChallengeState {
  challenges: DailyChallenge[];
  streakRecord: StreakRecord;
}
