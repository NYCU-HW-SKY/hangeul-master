import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { UserSettings } from '../types';
import { storageService, STORAGE_KEYS } from '../services/StorageService';

const DEFAULT_SETTINGS: UserSettings = {
  language: 'zh-TW',
  audioSpeed: 'normal',
  autoPlayAudio: false,
  animationsEnabled: true,
  theme: 'light',
  notifications: {
    dailyReminder: true,
    achievementUnlock: true,
    streakReminder: true,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
  },
};

export const useSettingsStore = defineStore('settings', () => {
  // State
  const userSettings = ref<UserSettings>({ ...DEFAULT_SETTINGS });

  // Actions
  function updateSettings(partial: Partial<UserSettings>): void {
    userSettings.value = {
      ...userSettings.value,
      ...partial,
      notifications: {
        ...userSettings.value.notifications,
        ...(partial.notifications ?? {}),
      },
      accessibility: {
        ...userSettings.value.accessibility,
        ...(partial.accessibility ?? {}),
      },
    };
    saveSettings();
  }

  function loadSettings(): void {
    const saved = storageService.load<UserSettings>(STORAGE_KEYS.USER_SETTINGS);
    if (saved) {
      userSettings.value = {
        ...DEFAULT_SETTINGS,
        ...saved,
        notifications: {
          ...DEFAULT_SETTINGS.notifications,
          ...(saved.notifications ?? {}),
        },
        accessibility: {
          ...DEFAULT_SETTINGS.accessibility,
          ...(saved.accessibility ?? {}),
        },
      };
    }
  }

  function saveSettings(): void {
    storageService.save(STORAGE_KEYS.USER_SETTINGS, userSettings.value);
  }

  // Initialize
  loadSettings();

  return {
    userSettings,
    updateSettings,
    loadSettings,
    saveSettings,
  };
});
