import { NetworkError, StorageError, AudioLoadError, ValidationError } from './errors';
import { useToast } from '../composables/useToast';

/**
 * ErrorHandler 類別
 * 處理應用程式中的錯誤，提供使用者友善的錯誤訊息
 */
class ErrorHandler {
  private toast = useToast();

  /**
   * 處理錯誤
   * @param error - 錯誤物件
   * @param context - 錯誤發生的上下文（選用）
   */
  handleError(error: Error, context?: string): void {
    // 記錄到控制台
    console.error('[ErrorHandler]', context ? `[${context}]` : '', error);

    // 顯示使用者友善的 Toast 訊息
    const userMessage = this.getUserFriendlyMessage(error);
    this.showErrorToast(userMessage);

    // 可選：回報到錯誤追蹤服務（例如 Sentry）
    // this.reportToErrorTracking(error, context);
  }

  /**
   * 將技術錯誤轉換為使用者友善的繁體中文訊息
   * @param error - 錯誤物件
   * @returns 使用者友善的錯誤訊息
   */
  getUserFriendlyMessage(error: Error): string {
    if (error instanceof NetworkError) {
      return '網路連線失敗，請檢查您的網路連線。';
    }

    if (error instanceof StorageError) {
      return '儲存資料時發生錯誤，請確保瀏覽器允許儲存資料。';
    }

    if (error instanceof AudioLoadError) {
      return '音訊載入失敗，請稍後再試。';
    }

    if (error instanceof ValidationError) {
      return '資料驗證失敗，請檢查輸入的內容。';
    }

    // 預設錯誤訊息
    return '發生未預期的錯誤，請稍後再試。';
  }

  /**
   * 顯示錯誤 Toast 通知
   * @param message - 要顯示的訊息
   */
  showErrorToast(message: string): void {
    this.toast.error(message, 5000);
  }
}

// 匯出單例實例
export const errorHandler = new ErrorHandler();
