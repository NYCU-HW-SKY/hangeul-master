// 學習模式類型定義

// 學習模式類型
export type LearningModeType = QuizModeType | 'matching';

export type QuizModeType = 
  | 'korean-to-chinese'  // 聽韓文選中文
  | 'chinese-to-korean'  // 聽中文選韓文
  | 'korean-to-korean';  // 聽韓文選韓文

// 測驗題目
export interface QuizQuestion {
  id: string;
  mode: QuizModeType;
  correctAnswer: string;
  options: QuizOption[];
  audioText: string;  // 要播放的文字（韓文或中文）
  vocabulary: VocabularyItem;  // 原始詞彙項目
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// 測驗會話
export interface QuizSession {
  id: string;
  mode: QuizModeType;
  totalQuestions: number;
  currentQuestionIndex: number;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  startTime: number;
  score: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}

// 測驗結果
export interface QuizResult {
  sessionId: string;
  mode: QuizModeType;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;  // 正確率百分比
  duration: number;  // 完成時間（毫秒）
  timestamp: number;
}

// 配對項目
export interface MatchItem {
  id: string;
  vocabularyId: string;
  text: string;
  type: 'korean' | 'chinese';
  isMatched: boolean;
}

export interface MatchPair {
  id: string;
  koreanItem: MatchItem;
  chineseItem: MatchItem;
}

// 配對會話
export interface MatchingSession {
  id: string;
  pairs: MatchPair[];
  matchedPairIds: string[];
  attemptCount: number;
  startTime: number;
}

// 配對結果
export interface MatchingResult {
  sessionId: string;
  totalPairs: number;
  attemptCount: number;
  duration: number;  // 完成時間（毫秒）
  timestamp: number;
}

// 會話歷史記錄
export interface SessionHistory {
  id: string;
  type: LearningModeType;
  result: QuizResult | MatchingResult;
  timestamp: number;
}

// 詞彙項目（擴展現有類型）
export interface VocabularyItem {
  id: string;
  korean: string;
  chinese: string;
  romanization?: string;
  category: string;
}

export interface ListeningQuizQuestion {
  id: string;
  korean: string;
  chinese: string;
  romanization?: string;
  category: string;
}
