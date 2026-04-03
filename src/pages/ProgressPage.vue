<template>
  <div class="progress-page">
    <!-- Top Navigation -->
    <header class="progress-header">
      <button 
        class="back-button" 
        @click="handleBack"
        aria-label="返回首頁"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <h1 class="page-title">學習進度</h1>
      
      <div class="header-spacer"></div>
    </header>

    <!-- Main Content -->
    <main class="progress-content">
      <!-- Two Column Layout -->
      <div class="content-grid">
        <!-- Daily Challenge Section -->
        <section class="content-card">
          <h2 class="card-title">每日挑戰</h2>
          <DailyChallengeComponent
            :challenge="todayChallenge"
            :streak="currentStreak"
            :longest-streak="longestStreak"
          />
        </section>

        <!-- Achievements Section -->
        <section class="content-card">
          <h2 class="card-title">成就徽章</h2>
          <div class="achievements-grid">
            <AchievementBadgeComponent
              v-for="achievement in achievements"
              :key="achievement.id"
              v-memo="[achievement.id, getUserAchievement(achievement.id)?.unlockedAt]"
              :achievement="achievement"
              :user-achievement="getUserAchievement(achievement.id)"
              size="large"
            />
          </div>
          
          <div v-if="achievements.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
            </div>
            <p class="empty-text">尚未有成就資料</p>
          </div>
        </section>
      </div>

      <!-- Overall Progress Section (Bottom) -->
      <section class="progress-overview">
        <ProgressTrackerComponent
          :category-progress="categoryProgress"
          :total-studied="totalStudied"
          :total-cards="totalCards"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProgressStore } from '../stores/progress';
import { useAchievementStore } from '../stores/achievement';
import { useDailyChallengeStore } from '../stores/dailyChallenge';
import ProgressTrackerComponent from '../components/progress/ProgressTrackerComponent.vue';
import AchievementBadgeComponent from '../components/progress/AchievementBadgeComponent.vue';
import DailyChallengeComponent from '../components/progress/DailyChallengeComponent.vue';

const router = useRouter();
const progressStore = useProgressStore();
const achievementStore = useAchievementStore();
const dailyChallengeStore = useDailyChallengeStore();

// Progress data
const categoryProgress = computed(() => progressStore.categoryProgress);
const totalStudied = computed(() => progressStore.totalStudied);
const totalCards = computed(() => progressStore.totalCards);

// Achievement data
const achievements = computed(() => achievementStore.achievements);
const getUserAchievement = (achievementId: string) => {
  return achievementStore.userAchievements.find(ua => ua.achievementId === achievementId);
};

// Daily challenge data
const todayChallenge = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return dailyChallengeStore.challenges.find(c => c.date === today);
});

const currentStreak = computed(() => dailyChallengeStore.streakRecord.currentStreak);
const longestStreak = computed(() => dailyChallengeStore.streakRecord.longestStreak);

// Navigation
const handleBack = () => {
  router.push('/');
};

// Check achievements on mount
onMounted(() => {
  achievementStore.checkAchievements({
    totalStudied: totalStudied.value,
    currentStreak: currentStreak.value,
  });
});
</script>

<style scoped>
/* --------------------------------------------------------
   Progress Page Layout
   -------------------------------------------------------- */

.progress-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

/* --------------------------------------------------------
   Progress Header
   -------------------------------------------------------- */

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  background-color: color-mix(in srgb, var(--color-surface) 95%, transparent);
  border-bottom: var(--rule-thin) solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: var(--transition-colors);
}

.back-button:hover {
  background-color: var(--color-divider);
}

.back-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.page-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
  text-align: center;
}

.header-spacer {
  width: 44px;
}

/* --------------------------------------------------------
   Progress Content
   -------------------------------------------------------- */

.progress-content {
  flex: 1;
  max-width: var(--container-xl);
  width: 100%;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.progress-overview {
  width: 100%;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  width: 100%;
}

.content-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: 0.02em;
}

/* --------------------------------------------------------
   Achievements Grid
   -------------------------------------------------------- */

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--space-4);
  width: 100%;
  justify-items: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10);
  background: var(--color-background-alt);
  border-radius: var(--radius-md);
  width: 100%;
}

.empty-icon {
  width: 60px;
  height: 60px;
  color: var(--color-text-tertiary);
  opacity: 0.4;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile (≤640px) */
@media (max-width: 640px) {
  .progress-header {
    padding: var(--space-3) var(--space-4);
  }

  .back-button {
    width: 40px;
    height: 40px;
  }

  .page-title {
    font-size: var(--text-lg);
  }

  .header-spacer {
    width: 40px;
  }

  .progress-content {
    padding: var(--space-4);
    gap: var(--space-4);
  }

  .content-grid {
    gap: var(--space-4);
  }

  .content-card {
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .card-title {
    font-size: var(--text-lg);
  }

  .achievements-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--space-3);
  }

  .empty-state {
    padding: var(--space-8);
  }

  .empty-icon {
    width: 48px;
    height: 48px;
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .progress-header {
    padding: var(--space-4) var(--space-6);
  }

  .page-title {
    font-size: var(--text-xl);
  }

  .progress-content {
    padding: var(--space-6);
    gap: var(--space-6);
  }

  .content-grid {
    gap: var(--space-6);
  }

  .content-card {
    padding: var(--space-5);
  }

  .card-title {
    font-size: var(--text-xl);
  }

  .achievements-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: var(--space-4);
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .progress-header {
    padding: var(--space-4) var(--space-8);
  }

  .back-button {
    width: 44px;
    height: 44px;
  }

  .page-title {
    font-size: var(--text-2xl);
  }

  .header-spacer {
    width: 44px;
  }

  .progress-content {
    padding: var(--space-8);
    gap: var(--space-8);
  }

  .content-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-8);
  }

  .content-card {
    padding: var(--space-6);
  }

  .card-title {
    font-size: var(--text-2xl);
  }

  .achievements-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--space-5);
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .back-button {
    transition-duration: 0.01ms;
  }
}
</style>
