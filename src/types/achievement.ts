export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'study' | 'game' | 'streak' | 'milestone';
  requirement: { type: string; value: number };
  reward?: { type: string; value: any };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  achievementId: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  notified: boolean;
}

export interface AchievementState {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
}
