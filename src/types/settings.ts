export interface UserSettings {
  language: 'zh-TW';
  audioSpeed: 'slow' | 'normal' | 'fast';
  autoPlayAudio: boolean;
  animationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    dailyReminder: boolean;
    achievementUnlock: boolean;
    streakReminder: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

export interface AppState {
  isInitialized: boolean;
  currentRoute: string;
  isLoading: boolean;
  error: string | null;
}
