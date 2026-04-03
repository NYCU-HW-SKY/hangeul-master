<template>
  <div class="home-page">
    <div class="rune-pattern" aria-hidden="true"></div>
    
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="navbar-content">
        <h1 class="logo">
          <span class="logo-rune">◈</span>
          <span class="logo-text">한글</span>
          <span class="logo-divider">|</span>
          <span class="logo-sub">LEARNING</span>
        </h1>
        <div class="nav-links">
          <router-link to="/hangul40" class="nav-link">
            <span class="nav-link-text">40音</span>
          </router-link>
          <router-link to="/study" class="nav-link">
            <span class="nav-link-text">學習</span>
          </router-link>
          <router-link to="/game" class="nav-link">
            <span class="nav-link-text">遊戲</span>
          </router-link>
          <router-link to="/progress" class="nav-link">
            <span class="nav-link-text">進度</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-ornament">⟨ 開始旅程 ⟩</div>
      <h2 class="hero-title">
        <span class="title-line">MASTER</span>
        <span class="title-line title-highlight">KOREAN</span>
        <span class="title-line">LANGUAGE</span>
      </h2>
      <p class="hero-subtitle">透過互動式學習、挑戰與進度追蹤，踏上語言精通之路</p>
      <ButtonComponent 
        variant="primary" 
        size="large" 
        @click="startLearning"
        class="hero-button"
      >
        開始學習
      </ButtonComponent>
    </section>

    <!-- Statistics Overview -->
    <section class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon-wrapper">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="stat-value">{{ todayStudied }}</div>
        <div class="stat-label">今日學習</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-value">{{ overallPercentage }}%</div>
        <div class="stat-label">總進度</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <div class="stat-value">{{ currentStreak }}</div>
        <div class="stat-label">連續天數</div>
      </div>
    </section>

    <!-- Feature Cards Grid -->
    <section class="features-grid">
      <div 
        class="feature-card"
        @click="navigateTo('/hangul40')"
        role="button"
        tabindex="0"
        @keydown.enter="navigateTo('/hangul40')"
        @keydown.space.prevent="navigateTo('/hangul40')"
      >
        <div class="feature-corner-tl"></div>
        <div class="feature-corner-br"></div>
        <div class="feature-icon-wrapper">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h3 class="feature-title">韓文40音</h3>
        <p class="feature-description">從基礎開始，學習韓文字母的發音與書寫，打好韓語基礎</p>
        <div class="feature-stats">
          <div class="feature-stat">
            <span class="stat-number">40</span>
            <span class="stat-text">個字母</span>
          </div>
          <div class="feature-stat">
            <span class="stat-number">3</span>
            <span class="stat-text">個分類</span>
          </div>
        </div>
      </div>

      <div 
        class="feature-card"
        @click="navigateTo('/study')"
        role="button"
        tabindex="0"
        @keydown.enter="navigateTo('/study')"
        @keydown.space.prevent="navigateTo('/study')"
      >
        <div class="feature-corner-tl"></div>
        <div class="feature-corner-br"></div>
        <div class="feature-icon-wrapper">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <h3 class="feature-title">單字卡學習</h3>
        <p class="feature-description">透過互動式單字卡學習韓文詞彙，支援音訊播放和多種速度</p>
        <div class="feature-stats">
          <div class="feature-stat">
            <span class="stat-number">{{ totalCards }}</span>
            <span class="stat-text">張卡片</span>
          </div>
          <div class="feature-stat">
            <span class="stat-number">{{ categories.length }}</span>
            <span class="stat-text">個分類</span>
          </div>
        </div>
      </div>

      <div 
        class="feature-card"
        @click="navigateTo('/game')"
        role="button"
        tabindex="0"
        @keydown.enter="navigateTo('/game')"
        @keydown.space.prevent="navigateTo('/game')"
      >
        <div class="feature-corner-tl"></div>
        <div class="feature-corner-br"></div>
        <div class="feature-icon-wrapper">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
            <polyline points="17 2 12 7 7 2"/>
          </svg>
        </div>
        <h3 class="feature-title">記憶遊戲</h3>
        <p class="feature-description">透過有趣的配對遊戲加深記憶，挑戰你的記憶力</p>
        <div class="feature-stats">
          <div class="feature-stat">
            <span class="stat-number">3</span>
            <span class="stat-text">種難度</span>
          </div>
          <div class="feature-stat">
            <span class="stat-number">∞</span>
            <span class="stat-text">無限挑戰</span>
          </div>
        </div>
      </div>

      <div 
        class="feature-card"
        @click="navigateTo('/progress')"
        role="button"
        tabindex="0"
        @keydown.enter="navigateTo('/progress')"
        @keydown.space.prevent="navigateTo('/progress')"
      >
        <div class="feature-corner-tl"></div>
        <div class="feature-corner-br"></div>
        <div class="feature-icon-wrapper">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <h3 class="feature-title">學習進度</h3>
        <p class="feature-description">追蹤你的學習進度，查看各分類的掌握程度</p>
        <div class="feature-stats">
          <div class="feature-stat">
            <span class="stat-number">{{ totalStudied }}</span>
            <span class="stat-text">已學習</span>
          </div>
          <div class="feature-stat">
            <span class="stat-number">{{ overallPercentage }}%</span>
            <span class="stat-text">完成度</span>
          </div>
        </div>
      </div>

      <div 
        class="feature-card"
        @click="navigateTo('/progress')"
        role="button"
        tabindex="0"
        @keydown.enter="navigateTo('/progress')"
        @keydown.space.prevent="navigateTo('/progress')"
      >
        <div class="feature-corner-tl"></div>
        <div class="feature-corner-br"></div>
        <div class="feature-icon-wrapper">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <h3 class="feature-title">每日挑戰</h3>
        <p class="feature-description">完成每日挑戰，保持學習連續性，解鎖成就徽章</p>
        <div class="feature-stats">
          <div class="feature-stat">
            <span class="stat-number">{{ currentStreak }}</span>
            <span class="stat-text">天連續</span>
          </div>
          <div class="feature-stat">
            <span class="stat-number">{{ todayChallengeProgress }}%</span>
            <span class="stat-text">今日進度</span>
          </div>
        </div>
      </div>

      <div 
        class="feature-card"
        @click="navigateTo('/learning-modes')"
        role="button"
        tabindex="0"
        @keydown.enter="navigateTo('/learning-modes')"
        @keydown.space.prevent="navigateTo('/learning-modes')"
      >
        <div class="feature-corner-tl"></div>
        <div class="feature-corner-br"></div>
        <div class="feature-icon-wrapper">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </div>
        <h3 class="feature-title">互動式學習</h3>
        <p class="feature-description">透過聽力測驗和快速配對，提升韓文聽力和反應能力</p>
        <div class="feature-stats">
          <div class="feature-stat">
            <span class="stat-number">4</span>
            <span class="stat-text">種模式</span>
          </div>
          <div class="feature-stat">
            <span class="stat-number">∞</span>
            <span class="stat-text">無限練習</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVocabularyStore } from '../stores/vocabulary';
import { useProgressStore } from '../stores/progress';
import { useAchievementStore } from '../stores/achievement';
import { useDailyChallengeStore } from '../stores/dailyChallenge';
import ButtonComponent from '../components/common/ButtonComponent.vue';

const router = useRouter();
const vocabularyStore = useVocabularyStore();
const progressStore = useProgressStore();
const achievementStore = useAchievementStore();
const dailyChallengeStore = useDailyChallengeStore();

// Computed properties for statistics
const categories = computed(() => vocabularyStore.categories);
const totalCards = computed(() => vocabularyStore.flashcards.length);
const totalStudied = computed(() => progressStore.totalStudied);
const overallPercentage = computed(() => progressStore.overallPercentage);
const currentStreak = computed(() => dailyChallengeStore.streakRecord.currentStreak);

// Today's studied cards count
const todayStudied = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return progressStore.studyRecords.filter(record => {
    const recordDate = new Date(record.studiedAt).toISOString().slice(0, 10);
    return recordDate === today;
  }).length;
});

// Today's challenge progress
const todayChallengeProgress = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  const todayChallenge = dailyChallengeStore.challenges.find(c => c.date === today);
  return todayChallenge ? todayChallenge.progress : 0;
});

// Navigation functions
const navigateTo = (path: string) => {
  router.push(path);
};

const startLearning = () => {
  router.push('/study');
};

// Initialize data on mount
onMounted(() => {
  // Initialize progress tracking with vocabulary data
  progressStore.initializeCategoryProgress(
    vocabularyStore.categories,
    vocabularyStore.flashcards
  );
  
  // Generate today's challenge if not exists
  if (vocabularyStore.flashcards.length > 0) {
    const cardIds = vocabularyStore.flashcards.map(card => card.id);
    dailyChallengeStore.generateDailyChallenge(cardIds);
  }
  
  // Check achievements on page load
  achievementStore.checkAchievements({
    totalStudied: totalStudied.value,
    currentStreak: currentStreak.value,
  });
});
</script>

<style scoped>
/* --------------------------------------------------------
   Home Page - 戰神風格 (God of War)
   -------------------------------------------------------- */
.home-page { 
  min-height: 100vh; 
  position: relative;
}

.rune-pattern {
  position: fixed;
  inset: 0;
  background-image: 
    linear-gradient(rgba(159, 197, 232, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(159, 197, 232, 0.02) 1px, transparent 1px);
  background-size: 80px 80px;
  pointer-events: none;
  z-index: 0;
}

/* --------------------------------------------------------
   Navigation Bar
   -------------------------------------------------------- */

.navbar {
  border-bottom: 1px solid var(--color-border);
  background: rgba(30, 35, 41, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-5) var(--space-8);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: 0.05em;
}

.logo-rune {
  font-size: 1.5em;
  color: var(--color-accent);
}

.logo-text {
  color: var(--color-text-primary);
}

.logo-divider {
  color: var(--color-border);
  font-weight: 300;
}

.logo-sub {
  font-size: 0.5em;
  font-weight: 400;
  color: var(--color-text-secondary);
  letter-spacing: 0.2em;
}

.nav-links {
  display: flex;
  gap: var(--space-6);
}

.nav-link {
  position: relative;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
  padding: var(--space-2) 0;
  transition: color var(--duration-base) var(--ease-out);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-base) var(--ease-out);
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-link:hover::after {
  transform: scaleX(1);
}

.nav-link.router-link-active {
  color: var(--color-primary);
}

.nav-link.router-link-active::after {
  transform: scaleX(1);
}

/* --------------------------------------------------------
   Hero Section
   -------------------------------------------------------- */

.hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(4rem, 12vw, 8rem) var(--space-8) clamp(3rem, 8vw, 6rem);
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-ornament {
  display: inline-block;
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 400;
  letter-spacing: 0.3em;
  color: var(--color-secondary);
  padding: var(--space-2) var(--space-6);
  border-top: 1px solid var(--color-secondary);
  border-bottom: 1px solid var(--color-secondary);
  margin-bottom: var(--space-8);
  position: relative;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  line-height: 1.1;
  margin: 0 0 var(--space-6);
  letter-spacing: 0.02em;
}

.title-line {
  display: block;
  animation: titleSlideIn 0.8s ease-out backwards;
}

.title-line:nth-child(1) { animation-delay: 0.1s; }
.title-line:nth-child(2) { animation-delay: 0.2s; }
.title-line:nth-child(3) { animation-delay: 0.3s; }

@keyframes titleSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title-highlight {
  color: var(--color-primary);
  position: relative;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: var(--color-text-secondary);
  margin: 0 auto var(--space-10);
  max-width: 600px;
  line-height: 1.7;
  animation: fadeIn 0.8s ease-out 0.5s backwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.hero-button {
  animation: fadeIn 0.8s ease-out 0.7s backwards;
}

/* --------------------------------------------------------
   Statistics Overview
   -------------------------------------------------------- */

.stats-overview {
  max-width: 1400px;
  margin: 0 auto var(--space-16);
  padding: 0 var(--space-8);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  position: relative;
  z-index: 1;
}

.stat-card {
  position: relative;
  background: var(--gradient-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  transition: all var(--duration-base) var(--ease-out);
  box-shadow: var(--shadow-md);
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-xl);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-primary);
  padding: var(--space-2);
  position: relative;
}

.stat-icon {
  width: 100%;
  height: 100%;
  color: var(--color-primary);
}

.stat-value {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: 400;
  letter-spacing: 0.05em;
}

/* --------------------------------------------------------
   Feature Cards Grid
   -------------------------------------------------------- */

.features-grid {
  max-width: 1400px;
  margin: 0 auto var(--space-24);
  padding: 0 var(--space-8);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
  position: relative;
  z-index: 1;
}

.feature-card {
  position: relative;
  background: var(--gradient-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  padding: var(--space-10);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  box-shadow: var(--shadow-md);
}

.feature-corner-tl,
.feature-corner-br {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-secondary);
  opacity: 0.3;
  transition: all var(--duration-base) var(--ease-out);
}

.feature-corner-tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.feature-corner-br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.feature-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(159, 197, 232, 0.05) 0%, transparent 50%);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-out);
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-xl);
}

.feature-card:hover::after {
  opacity: 1;
}

.feature-card:hover .feature-corner-tl,
.feature-card:hover .feature-corner-br {
  opacity: 1;
  border-color: var(--color-primary);
}

.feature-card:hover .feature-corner-tl {
  width: 30px;
  height: 30px;
}

.feature-card:hover .feature-corner-br {
  width: 30px;
  height: 30px;
}

.feature-card:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

.feature-icon-wrapper {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-primary);
  margin-bottom: var(--space-5);
  position: relative;
  transition: all var(--duration-base) var(--ease-out);
}

.feature-card:hover .feature-icon-wrapper {
  border-color: var(--color-accent);
}

.feature-icon {
  width: 32px;
  height: 32px;
  color: var(--color-primary);
  transition: color var(--duration-base) var(--ease-out);
}

.feature-card:hover .feature-icon {
  color: var(--color-accent);
}

.feature-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4);
  letter-spacing: 0.02em;
}

.feature-description {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0 0 var(--space-6);
}

.feature-stats {
  display: flex;
  gap: var(--space-8);
  margin-top: auto;
}

.feature-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-number {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-primary);
}

.stat-text {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  letter-spacing: 0.05em;
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

@media (max-width: 640px) {
  .navbar-content {
    padding: var(--space-4);
  }

  .logo {
    font-size: var(--text-xl);
  }

  .logo-rune {
    font-size: 1.2em;
  }

  .nav-links {
    gap: var(--space-3);
  }

  .nav-link {
    font-size: 0.625rem;
  }

  .hero {
    padding: var(--space-16) var(--space-4) var(--space-12);
  }

  .hero-ornament {
    font-size: 0.625rem;
  }

  .hero-title {
    font-size: var(--text-4xl);
  }

  .stats-overview {
    grid-template-columns: 1fr;
    padding: 0 var(--space-4);
    gap: var(--space-4);
    margin-bottom: var(--space-12);
  }

  .stat-card {
    padding: var(--space-6);
  }

  .features-grid {
    grid-template-columns: 1fr;
    padding: 0 var(--space-4);
    gap: var(--space-4);
    margin-bottom: var(--space-16);
  }

  .feature-card {
    padding: var(--space-6);
  }

  .feature-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .feature-icon {
    width: 24px;
    height: 24px;
  }

  .feature-title {
    font-size: var(--text-xl);
  }

  .feature-description {
    font-size: var(--text-sm);
  }
}

@media (min-width: 641px) and (max-width: 1023px) {
  .stats-overview {
    grid-template-columns: repeat(3, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rune-pattern,
  .title-line,
  .hero-subtitle,
  .hero-button {
    animation: none;
  }

  .feature-card:hover,
  .stat-card:hover {
    transform: none;
  }
}
</style>
