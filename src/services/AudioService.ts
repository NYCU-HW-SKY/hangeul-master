import { AudioLoadError } from '../utils/errors';

export type SpeedMode = 'slow' | 'normal' | 'fast';

export const SPEED_MAP: Record<SpeedMode, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.25,
};

export class AudioService {
  private synthesis: SpeechSynthesis | null;
  private koreaVoice: SpeechSynthesisVoice | null = null;
  private chineseVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;

  constructor() {
    this.synthesis = typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;

    if (!this.synthesis) {
      return;
    }

    this.loadVoices();
    
    // Listen for voices changed event (some browsers load voices asynchronously)
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (!this.synthesis) return;

    const voices = this.synthesis.getVoices();
    // Try to find Korean voice (ko-KR)
    this.koreaVoice = voices.find(voice => voice.lang.startsWith('ko')) || null;
    // Try to find Chinese voice (zh-TW for Traditional Chinese, or zh-CN)
    this.chineseVoice = voices.find(voice => 
      voice.lang.startsWith('zh-TW') || voice.lang.startsWith('zh-HK') || voice.lang.startsWith('zh')
    ) || null;
    this.voicesLoaded = true;
    
    if (this.koreaVoice) {
      console.log('[AudioService] Korean voice loaded:', this.koreaVoice.name);
    } else {
      console.warn('[AudioService] No Korean voice found, will use default voice');
    }
    
    if (this.chineseVoice) {
      console.log('[AudioService] Chinese voice loaded:', this.chineseVoice.name);
    } else {
      console.warn('[AudioService] No Chinese voice found, will use default voice');
    }
  }

  async speak(text: string, speed: SpeedMode = 'normal'): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any currently playing speech
      this.stop();

      if (!text || text.trim() === '') {
        reject(new AudioLoadError('沒有要朗讀的文字'));
        return;
      }

      // Check if speech synthesis is supported
      if (!this.synthesis) {
        reject(new AudioLoadError('您的瀏覽器不支援語音合成功能'));
        return;
      }

      // Wait for voices to load if not loaded yet
      if (!this.voicesLoaded) {
        this.loadVoices();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set Korean voice if available
      if (this.koreaVoice) {
        utterance.voice = this.koreaVoice;
      }
      
      // Set language to Korean
      utterance.lang = 'ko-KR';
      
      // Set speech rate based on speed mode
      utterance.rate = SPEED_MAP[speed];
      
      // Set other properties
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Event handlers
      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        let errorMessage = '語音播放失敗';
        switch (event.error) {
          case 'network':
            errorMessage = '網絡連接失敗';
            break;
          case 'not-allowed':
            errorMessage = '瀏覽器不允許播放語音';
            break;
          case 'synthesis-unavailable':
            errorMessage = '語音合成功能不可用';
            break;
          case 'synthesis-failed':
            errorMessage = '語音合成失敗';
            break;
          case 'language-unavailable':
            errorMessage = '韓語語音不可用，將使用預設語音';
            break;
        }
        
        reject(new AudioLoadError(errorMessage));
      };

      try {
        this.synthesis.speak(utterance);
      } catch (err) {
        reject(new AudioLoadError(`無法開始播放: ${(err as Error).message}`));
      }
    });
  }

  async playAudio(text: string, speed: SpeedMode = 'normal'): Promise<void> {
    // Use TTS to speak the text
    return this.speak(text, speed);
  }

  stop(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices().filter(voice => voice.lang.startsWith('ko'));
  }

  isKoreanVoiceAvailable(): boolean {
    return this.koreaVoice !== null;
  }

  async speakKorean(text: string, speed: SpeedMode = 'normal'): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any currently playing speech
      this.stop();

      if (!text || text.trim() === '') {
        reject(new AudioLoadError('沒有要朗讀的文字'));
        return;
      }

      // Check if speech synthesis is supported
      if (!this.synthesis) {
        reject(new AudioLoadError('您的瀏覽器不支援語音合成功能'));
        return;
      }

      // Wait for voices to load if not loaded yet
      if (!this.voicesLoaded) {
        this.loadVoices();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set Korean voice if available
      if (this.koreaVoice) {
        utterance.voice = this.koreaVoice;
      }
      
      // Set language to Korean
      utterance.lang = 'ko-KR';
      
      // Set speech rate based on speed mode
      utterance.rate = SPEED_MAP[speed];
      
      // Set other properties
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Event handlers
      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        let errorMessage = '語音播放失敗';
        switch (event.error) {
          case 'network':
            errorMessage = '網絡連接失敗';
            break;
          case 'not-allowed':
            errorMessage = '瀏覽器不允許播放語音';
            break;
          case 'synthesis-unavailable':
            errorMessage = '語音合成功能不可用';
            break;
          case 'synthesis-failed':
            errorMessage = '語音合成失敗';
            break;
          case 'language-unavailable':
            errorMessage = '韓語語音不可用，將使用預設語音';
            break;
        }
        
        reject(new AudioLoadError(errorMessage));
      };

      try {
        this.synthesis.speak(utterance);
      } catch (err) {
        reject(new AudioLoadError(`無法開始播放: ${(err as Error).message}`));
      }
    });
  }

  async speakChinese(text: string, speed: SpeedMode = 'normal'): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any currently playing speech
      this.stop();

      if (!text || text.trim() === '') {
        reject(new AudioLoadError('沒有要朗讀的文字'));
        return;
      }

      // Check if speech synthesis is supported
      if (!this.synthesis) {
        reject(new AudioLoadError('您的瀏覽器不支援語音合成功能'));
        return;
      }

      // Wait for voices to load if not loaded yet
      if (!this.voicesLoaded) {
        this.loadVoices();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set Chinese voice if available
      if (this.chineseVoice) {
        utterance.voice = this.chineseVoice;
      }
      
      // Set language to Traditional Chinese (prefer zh-TW, fallback to zh-CN)
      utterance.lang = this.chineseVoice?.lang || 'zh-TW';
      
      // Set speech rate based on speed mode
      utterance.rate = SPEED_MAP[speed];
      
      // Set other properties
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Event handlers
      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        let errorMessage = '語音播放失敗';
        switch (event.error) {
          case 'network':
            errorMessage = '網絡連接失敗';
            break;
          case 'not-allowed':
            errorMessage = '瀏覽器不允許播放語音';
            break;
          case 'synthesis-unavailable':
            errorMessage = '語音合成功能不可用';
            break;
          case 'synthesis-failed':
            errorMessage = '語音合成失敗';
            break;
          case 'language-unavailable':
            errorMessage = '中文語音不可用，將使用預設語音';
            break;
        }
        
        reject(new AudioLoadError(errorMessage));
      };

      try {
        this.synthesis.speak(utterance);
      } catch (err) {
        reject(new AudioLoadError(`無法開始播放: ${(err as Error).message}`));
      }
    });
  }

  isChineseVoiceAvailable(): boolean {
    return this.chineseVoice !== null;
  }
}

export const audioService = new AudioService();
