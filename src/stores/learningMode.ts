import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type {
  LearningModeType,
  QuizModeType,
  QuizSession,
  MatchingSession,
  QuizQuestion,
  QuizOption,
  MatchPair,

  QuizResult,
  MatchingResult,
  SessionHistory,
} from '../types/learningMode';
import { useVocabularyStore } from './vocabulary';
import { storageService, STORAGE_KEYS } from '../services/StorageService';

export const useLearningModeStore = defineStore('learningMode', () => {
  // State
  const currentMode = ref<LearningModeType | null>(null);
  const quizSession = ref<QuizSession | null>(null);
  const matchingSession = ref<MatchingSession | null>(null);
  const history = ref<SessionHistory[]>([]);

  // Getters
  const isSessionActive = computed(() => {
    return quizSession.value !== null || matchingSession.value !== null;
  });

  const currentProgress = computed(() => {
    if (quizSession.value) {
      const total = quizSession.value.totalQuestions;
      const current = quizSession.value.currentQuestionIndex;
      return total > 0 ? (current / total) * 100 : 0;
    }
    if (matchingSession.value) {
      const total = matchingSession.value.pairs.length;
      const matched = matchingSession.value.matchedPairIds.length;
      return total > 0 ? (matched / total) * 100 : 0;
    }
    return 0;
  });

  // Actions
  function startQuizSession(mode: QuizModeType, totalQuestions: number = 10): void {
    const vocabularyStore = useVocabularyStore();
    const availableVocabulary = vocabularyStore.currentCategoryCards;

    if (availableVocabulary.length < 4) {
      throw new Error('詞彙數量不足，至少需要 4 個詞彙才能開始測驗');
    }

    currentMode.value = mode;
    quizSession.value = {
      id: generateSessionId(),
      mode,
      totalQuestions: Math.min(totalQuestions, availableVocabulary.length),
      currentQuestionIndex: 0,
      questions: [],
      answers: [],
      startTime: Date.now(),
      score: 0,
    };
  }

  function startMatchingSession(_pairCount: number = 6): void {
    currentMode.value = 'matching';
    matchingSession.value = {
      id: generateSessionId(),
      pairs: [],
      matchedPairIds: [],
      attemptCount: 0,
      startTime: Date.now(),
    };
  }

  function generateQuizQuestion(): QuizQuestion {
    if (!quizSession.value) {
      throw new Error('沒有活動的測驗會話');
    }

    const vocabularyStore = useVocabularyStore();
    const availableVocabulary = vocabularyStore.currentCategoryCards;

    if (availableVocabulary.length < 4) {
      throw new Error('詞彙數量不足，至少需要 4 個詞彙才能生成題目');
    }

    // 隨機選擇一個詞彙作為正確答案
    const correctVocabulary = availableVocabulary[
      Math.floor(Math.random() * availableVocabulary.length)
    ];

    // 根據模式決定正確答案和音訊文字
    const mode = quizSession.value.mode;
    let correctAnswer: string;
    let audioText: string;

    switch (mode) {
      case 'korean-to-chinese':
        correctAnswer = correctVocabulary.chinese;
        audioText = correctVocabulary.korean;
        break;
      case 'chinese-to-korean':
        correctAnswer = correctVocabulary.korean;
        audioText = correctVocabulary.chinese;
        break;
      case 'korean-to-korean':
        correctAnswer = correctVocabulary.korean;
        audioText = correctVocabulary.korean;
        break;
    }

    // 生成選項
    const options = generateQuizOptions(correctVocabulary, availableVocabulary, mode);

    const question: QuizQuestion = {
      id: `question_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      mode,
      correctAnswer,
      options,
      audioText,
      vocabulary: {
        id: correctVocabulary.id,
        korean: correctVocabulary.korean,
        chinese: correctVocabulary.chinese,
        romanization: correctVocabulary.romanization,
        audioUrl: correctVocabulary.audioUrl,
        category: correctVocabulary.category,
      },
    };

    return question;
  }

  function generateQuizOptions(
    correctVocabulary: any,
    availableVocabulary: any[],
    mode: QuizModeType
  ): QuizOption[] {
    // 決定選項應該顯示什麼內容
    const getOptionText = (vocab: any): string => {
      switch (mode) {
        case 'korean-to-chinese':
          return vocab.chinese;
        case 'chinese-to-korean':
          return vocab.korean;
        case 'korean-to-korean':
          return vocab.korean;
      }
    };

    const correctAnswer = getOptionText(correctVocabulary);

    // 從相同類別中選擇干擾選項
    const sameCategoryVocabulary = availableVocabulary.filter(
      (vocab) =>
        vocab.category === correctVocabulary.category &&
        vocab.id !== correctVocabulary.id
    );

    // 從其他類別中選擇干擾選項（作為備用）
    const otherCategoryVocabulary = availableVocabulary.filter(
      (vocab) =>
        vocab.category !== correctVocabulary.category &&
        vocab.id !== correctVocabulary.id
    );

    // 收集干擾選項
    const distractors: string[] = [];
    const usedTexts = new Set<string>([correctAnswer]);

    // 優先從相同類別選擇
    for (const vocab of sameCategoryVocabulary) {
      if (distractors.length >= 3) break;
      const text = getOptionText(vocab);
      if (!usedTexts.has(text)) {
        distractors.push(text);
        usedTexts.add(text);
      }
    }

    // 如果相同類別不足，從其他類別選擇
    if (distractors.length < 3) {
      for (const vocab of otherCategoryVocabulary) {
        if (distractors.length >= 3) break;
        const text = getOptionText(vocab);
        if (!usedTexts.has(text)) {
          distractors.push(text);
          usedTexts.add(text);
        }
      }
    }

    // 如果仍然不足 3 個干擾選項，拋出錯誤
    if (distractors.length < 3) {
      throw new Error('無法生成足夠的干擾選項');
    }

    // 創建選項陣列
    const options: QuizOption[] = [
      {
        id: `option_correct_${Date.now()}`,
        text: correctAnswer,
        isCorrect: true,
      },
      ...distractors.slice(0, 3).map((text, index) => ({
        id: `option_${index}_${Date.now()}`,
        text,
        isCorrect: false,
      })),
    ];

    // 隨機打亂選項順序
    return shuffleArray(options);
  }

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function submitAnswer(answer: string): boolean {
    if (!quizSession.value) {
      throw new Error('沒有活動的測驗會話');
    }

    const currentQuestion = quizSession.value.questions[quizSession.value.currentQuestionIndex];
    if (!currentQuestion) {
      throw new Error('沒有當前題目');
    }

    const isCorrect = answer === currentQuestion.correctAnswer;

    // 記錄答案
    quizSession.value.answers.push({
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect,
      timestamp: Date.now(),
    });

    // 更新分數
    if (isCorrect) {
      quizSession.value.score++;
    }

    return isCorrect;
  }

  function calculateScore(): { score: number; accuracy: number } {
    if (!quizSession.value) {
      throw new Error('沒有活動的測驗會話');
    }

    const totalQuestions = quizSession.value.answers.length;
    const correctAnswers = quizSession.value.score;

    if (totalQuestions === 0) {
      return {
        score: 0,
        accuracy: 0,
      };
    }

    const accuracy = (correctAnswers / totalQuestions) * 100;

    return {
      score: correctAnswers,
      accuracy,
    };
  }

  function nextQuestion(): void {
    if (!quizSession.value) {
      throw new Error('沒有活動的測驗會話');
    }

    quizSession.value.currentQuestionIndex++;
  }

  function generateMatchingPairs(): MatchPair[] {
    if (!matchingSession.value) {
      throw new Error('沒有活動的配對會話');
    }

    const vocabularyStore = useVocabularyStore();
    const availableVocabulary = vocabularyStore.currentCategoryCards;

    const pairCount = 6; // 預設 6 對
    if (availableVocabulary.length < pairCount) {
      throw new Error(`詞彙數量不足，至少需要 ${pairCount} 個詞彙才能生成配對`);
    }

    // 隨機選擇詞彙
    const selectedVocabulary = shuffleArray([...availableVocabulary]).slice(0, pairCount);

    // 生成配對項目
    const pairs: MatchPair[] = selectedVocabulary.map((vocab) => {
      const pairId = `pair_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      return {
        id: pairId,
        koreanItem: {
          id: `korean_${pairId}`,
          vocabularyId: vocab.id,
          text: vocab.korean,
          type: 'korean',
          isMatched: false,
        },
        chineseItem: {
          id: `chinese_${pairId}`,
          vocabularyId: vocab.id,
          text: vocab.chinese,
          type: 'chinese',
          isMatched: false,
        },
      };
    });

    // 更新會話中的配對項目
    matchingSession.value.pairs = pairs;

    return pairs;
  }

  function checkMatch(koreanId: string, chineseId: string): boolean {
    if (!matchingSession.value) {
      return false;
    }

    // 增加嘗試次數
    matchingSession.value.attemptCount++;

    // 查找對應的配對項目
    const matchedPair = matchingSession.value.pairs.find(
      (pair) => pair.koreanItem.id === koreanId && pair.chineseItem.id === chineseId
    );

    if (matchedPair) {
      // 配對正確，標記為已配對
      matchedPair.koreanItem.isMatched = true;
      matchedPair.chineseItem.isMatched = true;
      
      // 將配對 ID 加入已配對列表
      if (!matchingSession.value.matchedPairIds.includes(matchedPair.id)) {
        matchingSession.value.matchedPairIds.push(matchedPair.id);
      }
      
      return true;
    }

    return false;
  }

  function isMatchingComplete(): boolean {
    if (!matchingSession.value) {
      return false;
    }

    const totalPairs = matchingSession.value.pairs.length;
    const matchedPairs = matchingSession.value.matchedPairIds.length;

    return totalPairs > 0 && matchedPairs === totalPairs;
  }

  function endQuizSession(): QuizResult {
    if (!quizSession.value) {
      throw new Error('沒有活動的測驗會話');
    }

    const endTime = Date.now();
    const duration = endTime - quizSession.value.startTime;
    const { score, accuracy } = calculateScore();

    const result: QuizResult = {
      sessionId: quizSession.value.id,
      mode: quizSession.value.mode,
      totalQuestions: quizSession.value.totalQuestions,
      correctAnswers: score,
      accuracy,
      duration,
      timestamp: endTime,
    };

    // Save to history
    saveSessionHistory(result);

    return result;
  }

  function endMatchingSession(): MatchingResult {
    if (!matchingSession.value) {
      throw new Error('沒有活動的配對會話');
    }

    const endTime = Date.now();
    const duration = endTime - matchingSession.value.startTime;

    const result: MatchingResult = {
      sessionId: matchingSession.value.id,
      totalPairs: matchingSession.value.pairs.length,
      attemptCount: matchingSession.value.attemptCount,
      duration,
      timestamp: endTime,
    };

    // Save to history
    saveSessionHistory(result);

    return result;
  }

  function saveSessionHistory(result: QuizResult | MatchingResult): void {
    const sessionHistory: SessionHistory = {
      id: generateSessionId(),
      type: currentMode.value!,
      result,
      timestamp: result.timestamp,
    };

    // Add to history array
    history.value.push(sessionHistory);

    // Load existing history from storage
    const existingHistory = storageService.load<SessionHistory[]>(STORAGE_KEYS.SESSION_HISTORY) || [];
    
    // Append new session
    existingHistory.push(sessionHistory);

    // Save to storage
    try {
      storageService.save(STORAGE_KEYS.SESSION_HISTORY, existingHistory);
    } catch (error) {
      console.error('[LearningMode] Failed to save session history:', error);
      // Don't throw - allow the session to complete even if storage fails
    }
  }

  function clearSession(): void {
    currentMode.value = null;
    quizSession.value = null;
    matchingSession.value = null;
  }

  // Helper functions
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  return {
    // State
    currentMode,
    quizSession,
    matchingSession,
    history,

    // Getters
    isSessionActive,
    currentProgress,

    // Actions
    startQuizSession,
    startMatchingSession,
    generateQuizQuestion,
    generateMatchingPairs,
    checkMatch,
    isMatchingComplete,
    submitAnswer,
    calculateScore,
    nextQuestion,
    endQuizSession,
    endMatchingSession,
    saveSessionHistory,
    clearSession,
  };
});
