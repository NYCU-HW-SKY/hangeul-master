import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Achievement, UserAchievement } from '../types';
import { storageService, STORAGE_KEYS } from '../services/StorageService';

const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first-card',
    name: '初學者',
    description: '學習第一張單字卡',
    icon: '🌱',
    type: 'study',
    requirement: { type: 'totalStudied', value: 1 },
    rarity: 'common',
  },
  {
    id: 'ten-cards',
    name: '努力學習',
    description: '學習 10 張單字卡',
    icon: '📚',
    type: 'study',
    requirement: { type: 'totalStudied', value: 10 },
    rarity: 'common',
  },
  {
    id: 'fifty-cards',
    name: '學習達人',
    description: '學習 50 張單字卡',
    icon: '🏆',
    type: 'study',
    requirement: { type: 'totalStudied', value: 50 },
    rarity: 'rare',
  },
  {
    id: 'all-cards',
    name: '韓語征服者',
    description: '學習全部 30 張單字卡',
    icon: '👑',
    type: 'milestone',
    requirement: { type: 'totalStudied', value: 30 },
    rarity: 'epic',
  },
  {
    id: 'first-game',
    name: '遊戲玩家',
    description: '完成第一場遊戲',
    icon: '🎮',
    type: 'game',
    requirement: { type: 'gamesCompleted', value: 1 },
    rarity: 'common',
  },
  {
    id: 'streak-3',
    name: '三日連勝',
    description: '連續 3 天完成每日挑戰',
    icon: '🔥',
    type: 'streak',
    requirement: { type: 'currentStreak', value: 3 },
    rarity: 'common',
  },
  {
    id: 'streak-7',
    name: '一週挑戰',
    description: '連續 7 天完成每日挑戰',
    icon: '⚡',
    type: 'streak',
    requirement: { type: 'currentStreak', value: 7 },
    rarity: 'rare',
  },
  {
    id: 'streak-30',
    name: '月度傳奇',
    description: '連續 30 天完成每日挑戰',
    icon: '💎',
    type: 'streak',
    requirement: { type: 'currentStreak', value: 30 },
    rarity: 'legendary',
  },
];

interface AchievementStats {
  totalStudied?: number;
  gamesCompleted?: number;
  currentStreak?: number;
}

export const useAchievementStore = defineStore('achievement', () => {
  // State
  const achievements = ref<Achievement[]>([...ACHIEVEMENTS_LIST]);
  const userAchievements = ref<UserAchievement[]>(
    ACHIEVEMENTS_LIST.map((a) => ({
      achievementId: a.id,
      unlocked: false,
      progress: 0,
      notified: false,
    }))
  );

  // Actions
  function unlockAchievement(id: string): void {
    const ua = userAchievements.value.find((u) => u.achievementId === id);
    if (ua && !ua.unlocked) {
      ua.unlocked = true;
      ua.unlockedAt = new Date();
      ua.notified = false;
      saveAchievements();
    }
  }

  function checkAchievements(stats: AchievementStats): void {
    for (const achievement of achievements.value) {
      const ua = userAchievements.value.find((u) => u.achievementId === achievement.id);
      if (!ua || ua.unlocked) continue;

      const { type, value } = achievement.requirement;
      let current = 0;

      if (type === 'totalStudied') current = stats.totalStudied ?? 0;
      else if (type === 'gamesCompleted') current = stats.gamesCompleted ?? 0;
      else if (type === 'currentStreak') current = stats.currentStreak ?? 0;

      ua.progress = Math.min(current, value);

      if (current >= value) {
        unlockAchievement(achievement.id);
      }
    }
  }

  function loadAchievements(): void {
    const saved = storageService.load<UserAchievement[]>(STORAGE_KEYS.ACHIEVEMENTS);
    if (saved && Array.isArray(saved)) {
      userAchievements.value = saved.map((ua) => ({
        ...ua,
        unlockedAt: ua.unlockedAt ? new Date(ua.unlockedAt) : undefined,
      }));
    }
  }

  function saveAchievements(): void {
    storageService.save(STORAGE_KEYS.ACHIEVEMENTS, userAchievements.value);
  }

  // Initialize
  loadAchievements();

  return {
    achievements,
    userAchievements,
    checkAchievements,
    unlockAchievement,
    loadAchievements,
    saveAchievements,
  };
});
