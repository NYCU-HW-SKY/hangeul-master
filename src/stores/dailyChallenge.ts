import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { DailyChallenge, StreakRecord } from '../types';
import { storageService, STORAGE_KEYS } from '../services/StorageService';
import { useAchievementStore } from './achievement';

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function pickRandomCards(cardIds: string[], count: number, seed: string): string[] {
  // Deterministic shuffle based on date seed so same day always yields same cards
  const hash = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const shuffled = [...cardIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (hash * (i + 1) * 2654435761) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function isConsecutiveDay(prev: string, current: string): boolean {
  const prevDate = new Date(prev);
  const currDate = new Date(current);
  const diffMs = currDate.getTime() - prevDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export const useDailyChallengeStore = defineStore('dailyChallenge', () => {
  // State
  const challenges = ref<DailyChallenge[]>([]);
  const streakRecord = ref<StreakRecord>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: undefined,
    totalChallengesCompleted: 0,
  });

  // Actions
  function generateDailyChallenge(availableCardIds: string[]): DailyChallenge {
    const today = getTodayDate();
    const existing = challenges.value.find((c) => c.date === today);
    if (existing) return existing;

    const cardIds = pickRandomCards(availableCardIds, 5, today);
    const challenge: DailyChallenge = {
      id: `challenge-${today}`,
      date: today,
      cardIds,
      completed: false,
      progress: 0,
    };
    challenges.value.push(challenge);
    saveChallenges();
    return challenge;
  }

  function completeChallenge(date: string): void {
    const challenge = challenges.value.find((c) => c.date === date);
    if (!challenge || challenge.completed) return;

    challenge.completed = true;
    challenge.completedAt = new Date();
    challenge.progress = 100;

    updateStreak();
    saveChallenges();
    
    // Check achievements after completing challenge
    const achievementStore = useAchievementStore();
    achievementStore.checkAchievements({
      currentStreak: streakRecord.value.currentStreak,
    });
  }

  function updateStreak(): void {
    const today = getTodayDate();
    const last = streakRecord.value.lastCompletedDate;

    if (!last) {
      streakRecord.value.currentStreak = 1;
    } else if (last === today) {
      // Already counted today
      return;
    } else if (isConsecutiveDay(last, today)) {
      streakRecord.value.currentStreak++;
    } else {
      // Streak broken
      streakRecord.value.currentStreak = 1;
    }

    streakRecord.value.lastCompletedDate = today;
    streakRecord.value.totalChallengesCompleted++;

    if (streakRecord.value.currentStreak > streakRecord.value.longestStreak) {
      streakRecord.value.longestStreak = streakRecord.value.currentStreak;
    }
  }

  function loadChallenges(): void {
    const saved = storageService.load<{
      challenges: DailyChallenge[];
      streakRecord: StreakRecord;
    }>(STORAGE_KEYS.DAILY_CHALLENGES);

    if (saved) {
      challenges.value = saved.challenges.map((c) => ({
        ...c,
        completedAt: c.completedAt ? new Date(c.completedAt) : undefined,
      }));
      streakRecord.value = saved.streakRecord;
    }
  }

  function saveChallenges(): void {
    storageService.save(STORAGE_KEYS.DAILY_CHALLENGES, {
      challenges: challenges.value,
      streakRecord: streakRecord.value,
    });
  }

  // Initialize
  loadChallenges();

  return {
    challenges,
    streakRecord,
    generateDailyChallenge,
    completeChallenge,
    updateStreak,
    loadChallenges,
    saveChallenges,
  };
});
