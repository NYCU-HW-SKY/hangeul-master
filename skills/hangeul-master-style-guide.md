# 戰神風格主題系統 (God of War Theme)
## Nordic Epic UI Design System

這個 skill 定義了一套靈感來自《戰神》(God of War) 遊戲的視覺設計系統，適用於任何需要史詩感、力量感和北歐神話風格的 Web 應用。

---

## 🎨 設計哲學 Design Philosophy

### 核心理念
- **史詩感與力量感**：深色背景、冰霜藍和戰神紅的配色，營造北歐神話氛圍
- **克制的動畫**：動畫緩慢而有力，避免過度華麗，每個動作都有重量感
- **符文裝飾**：使用簡潔的幾何線條作為裝飾元素，模仿古代符文
- **層次分明**：通過深邃陰影和漸變營造空間深度
- **戰鬥美學**：UI 元素如同武器般精準、有力、可靠

### 適用場景
- 遊戲相關應用
- 學習平台（需要激勵感）
- 工具類應用（需要專業感）
- 任何需要史詩氛圍的項目

---

## 🎨 配色系統 Color System

### 主色調 - 冰霜藍 (Frost Blue)
```css
--color-primary: #9fc5e8;        /* 主要藍色 */
--color-primary-light: #c5dff8;  /* 淺藍色 */
--color-primary-dark: #6fa8dc;   /* 深藍色 */
--color-primary-glow: rgba(159, 197, 232, 0.25); /* 光暈效果 */
```

### 強調色 - 戰神紅 (War Red)
```css
--color-accent: #c1440e;         /* 主要紅色 */
--color-accent-light: #e06c3a;   /* 淺紅色 */
--color-accent-dark: #8b2f0a;    /* 深紅色 */
--color-accent-glow: rgba(193, 68, 14, 0.3); /* 光暈效果 */
```

### 次要色 - 符文金 (Rune Gold)
```css
--color-secondary: #d4af37;      /* 金色 */
--color-secondary-light: #f4d03f;
--color-secondary-dark: #b8941f;
```

### 中性色 - 北歐石灰 (Nordic Stone)
```css
--color-background: #0d0f12;     /* 主背景 */
--color-background-alt: #1a1d23; /* 次要背景 */
--color-surface: #1e2329;        /* 卡片表面 */
--color-surface-elevated: #282d35; /* 懸浮表面 */
```

### 文字色
```css
--color-text-primary: #e8e6e3;   /* 主要文字 */
--color-text-secondary: #b8b5b2; /* 次要文字 */
--color-text-tertiary: #6b6866;  /* 三級文字 */
```

---

## 📐 間距系統 Spacing System

使用 4px 網格系統：

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

---

## 🔤 字體系統 Typography

### 字體家族
```css
--font-display: 'Cinzel', 'Noto Serif TC', serif;  /* 標題字體 */
--font-body: 'Lato', 'Noto Sans TC', sans-serif;   /* 正文字體 */
--font-korean: 'Spoqa Han Sans Neo', sans-serif;   /* 韓文字體 */
--font-chinese: 'Noto Sans TC', sans-serif;        /* 中文字體 */
```

### 字體大小階層
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### 字重
```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;
```

---

## 🎭 陰影系統 Shadow System

深邃的陰影營造層次感：

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.6);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.7);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.8);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.85);
--shadow-2xl: 0 24px 64px rgba(0, 0, 0, 0.9);
--shadow-glow: 0 4px 24px var(--color-primary-glow);
--shadow-glow-accent: 0 4px 24px var(--color-accent-glow);
--shadow-inset: inset 0 2px 8px rgba(0, 0, 0, 0.5);
```

---

## 🔄 動畫系統 Animation System

### 動畫時長 (緩慢而有力)
```css
--duration-fast: 150ms;
--duration-base: 300ms;
--duration-slow: 500ms;
--duration-epic: 800ms;
```

### 緩動函數
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-epic: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 關鍵動畫

#### 懸停上升效果
```css
.hover-lift {
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}
```

#### 符文光暈動畫
```css
@keyframes runeGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(159, 197, 232, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(159, 197, 232, 0.6);
  }
}
```

---

## 🎯 UI 組件風格指南 Component Style Guide

### 按鈕 Button

#### 設計原則
- 使用漸變背景營造立體感
- 2px 邊框增加銳利感
- 懸停時上升 4px，模擬物理重量
- 字母間距 0.05em，增加可讀性

#### 變體 (Variants)
- **Primary (冰霜藍)**: 主要操作，如「開始」、「確認」
- **Secondary (戰神紅)**: 危險或強調操作，如「刪除」、「挑戰」
- **Outline (透明)**: 次要操作，如「取消」、「返回」
- **Ghost (極簡)**: 最小視覺重量，如導航按鈕

#### 尺寸規範
- **Small**: 36px 高度，適用於密集界面
- **Medium**: 48px 高度，標準尺寸
- **Large**: 64px 高度，適用於英雄區域

#### 關鍵 CSS
```css
.btn {
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  letter-spacing: 0.05em;
  transition: all var(--duration-base) var(--ease-out);
}

.btn-primary {
  background: var(--gradient-primary);
  border-color: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}
```

---

### 卡片 Card

#### 設計原則
- 深色半透明背景，融入環境
- 毛玻璃效果 (backdrop-filter)
- 四角符文裝飾，增加神秘感
- 懸停時輕微上升，提供反饋

#### 關鍵特徵
- 1px 邊框分隔
- 深邃陰影營造層次
- 懸停時邊框變為主色調
- 可選的光暈效果

#### 關鍵 CSS
```css
.card {
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  position: relative;
}

/* 符文裝飾 - 左上角 */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-top: 2px solid var(--color-primary);
  border-left: 2px solid var(--color-primary);
  opacity: 0.6;
}

/* 符文裝飾 - 右下角 */
.card::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-bottom: 2px solid var(--color-primary);
  border-right: 2px solid var(--color-primary);
  opacity: 0.6;
}

.card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}
```

---

### 輸入框 Input

#### 設計原則
- 深色背景，低對比度
- 聚焦時顯示主色調邊框
- 內陰影增加深度感

#### 關鍵 CSS
```css
.input {
  background: var(--color-surface-elevated);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  padding: var(--space-3) var(--space-4);
  box-shadow: var(--shadow-inset);
  transition: var(--transition-colors);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-inset), var(--shadow-glow);
}
```

---

### 模態框 Modal

#### 設計原則
- 深色半透明遮罩
- 中央卡片式內容區
- 符文裝飾框架
- 淡入縮放動畫

#### 關鍵 CSS
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(13, 15, 18, 0.9);
  backdrop-filter: blur(8px);
  z-index: var(--z-modal);
}

.modal-content {
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-2xl), var(--shadow-glow);
  max-width: 600px;
  animation: scaleIn var(--duration-slow) var(--ease-spring);
}
```

---

## 📱 響應式設計 Responsive Design

### 斷點系統
```css
--breakpoint-sm: 640px;   /* 手機 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 桌面 */
--breakpoint-xl: 1280px;  /* 大桌面 */
--breakpoint-2xl: 1536px; /* 超大桌面 */
```

### 響應式按鈕範例
```css
@media (max-width: 640px) {
  .btn-small {
    padding: var(--space-2) var(--space-4);
    font-size: 0.625rem;
    min-height: 32px;
  }

  .btn-medium {
    padding: var(--space-3) var(--space-5);
    font-size: var(--text-sm);
    min-height: 40px;
  }
}
```

---

## 🎮 互動效果 Interaction Patterns

### 懸停效果
1. **上升效果** (Lift): 向上移動 4px，增加陰影
2. **縮放效果** (Scale): 放大至 102%
3. **光暈效果** (Glow): 添加發光陰影

### 點擊反饋
1. **按下狀態**: 向上移動 2px，減少陰影
2. **波紋效果**: 從點擊位置擴散的圓形波紋

### 載入狀態
1. **旋轉圖標**: 使用 SVG 圓形進度指示器
2. **內容隱藏**: 原內容淡出，顯示載入圖標

---

## 🎨 背景與紋理 Backgrounds & Textures

### 主背景
```css
body {
  background: linear-gradient(
    135deg,
    #0d0f12 0%,
    #1a1d24 50%,
    #0d0f12 100%
  );
}

/* 添加紋理層 */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 100px,
      rgba(159, 197, 232, 0.02) 100px,
      rgba(159, 197, 232, 0.02) 200px
    );
  opacity: 0.5;
  pointer-events: none;
}
```

### 英雄區域背景
```css
.hero {
  background: linear-gradient(
    180deg,
    rgba(13, 15, 18, 0) 0%,
    #0d0f12 100%
  );
}
```

### 卡片漸變背景
```css
.card-gradient {
  background: linear-gradient(
    135deg,
    rgba(159, 197, 232, 0.03) 0%,
    rgba(193, 68, 14, 0.03) 100%
  );
}
```

---

## 🎨 符文裝飾系統 Rune Decoration System

### 四角裝飾
```css
.rune-corners::before,
.rune-corners::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-primary);
}

.rune-corners::before {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.rune-corners::after {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}
```

### 光暈效果
```css
.animate-rune-glow {
  animation: runeGlow 2s var(--ease-in-out) infinite;
}

@keyframes runeGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(159, 197, 232, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(159, 197, 232, 0.6);
  }
}
```

---

## ♿ 無障礙設計 Accessibility

### 焦點樣式
```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### ARIA 屬性
```vue
<button
  :aria-busy="loading"
  :aria-disabled="disabled"
  :aria-label="ariaLabel"
>
  <!-- 按鈕內容 -->
</button>
```

### 視覺隱藏
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 減少動畫
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## � 快速應用 Quick Implementation

### 步驟 1: 設置 CSS 變數

在你的全域 CSS 文件中導入變數：

```css
/* styles/variables.css */
@import url('path/to/god-of-war-variables.css');
```

或直接在 `:root` 中定義所有變數（參考上方的配色系統、間距系統等）。

### 步驟 2: 應用基礎樣式

```css
/* styles/global.css */
body {
  font-family: var(--font-body);
  color: var(--color-text-primary);
  background: linear-gradient(135deg, #0d0f12 0%, #1a1d24 50%, #0d0f12 100%);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}
```

### 步驟 3: 創建基礎組件

使用上方的組件風格指南創建 Button、Card、Input 等基礎組件。

### 步驟 4: 應用符文裝飾

在需要的元素上添加符文裝飾類：

```html
<div class="card rune-corners">
  <!-- 內容 -->
</div>
```

---

## 🎨 主題變體 Theme Variants

### 亮色模式適配（可選）

如果需要亮色模式，可以覆蓋部分變數：

```css
@media (prefers-color-scheme: light) {
  :root {
    --color-background: #e8e6e3;
    --color-surface: #f5f4f2;
    --color-text-primary: #1a1d23;
    --color-text-secondary: #4a4d53;
    /* 保持主色調不變 */
  }
}
```

### 其他配色變體

**火焰主題** (替換冰霜藍為火焰橙)：
```css
--color-primary: #ff6b35;
--color-primary-light: #ff8c61;
--color-primary-dark: #e85a2a;
```

**森林主題** (替換為翠綠色)：
```css
--color-primary: #4a9d5f;
--color-primary-light: #6bc47f;
--color-primary-dark: #3a7d4f;
```

---

## 🎯 設計原則總結

1. **一致性**: 所有 UI 元素使用統一的設計 token
2. **層次感**: 通過深邃陰影和漸變營造空間深度
3. **克制**: 動畫緩慢而有力，每個動作都有重量感
4. **無障礙**: 支持鍵盤導航、螢幕閱讀器和減少動畫模式
5. **響應式**: 適配各種螢幕尺寸，從手機到桌面
6. **性能**: 使用 transform 和 will-change 優化動畫性能
7. **神秘感**: 符文裝飾和光暈效果增加視覺趣味

---

## � 使用建議

### 適合的項目類型
- ✅ 遊戲相關應用
- ✅ 學習平台（需要激勵感）
- ✅ 工具類應用（需要專業感）
- ✅ 儀表板和數據可視化
- ✅ 作品集網站

### 不太適合的場景
- ❌ 電商網站（過於深色）
- ❌ 新聞媒體（可讀性優先）
- ❌ 兒童應用（需要更明亮的色彩）

### 自定義建議
- 可以調整主色調以匹配品牌色
- 可以增加或減少符文裝飾的使用
- 可以調整動畫速度以適應不同節奏
- 可以簡化陰影系統以提升性能

---

## 📚 參考資源

- [God of War Art Direction](https://www.artstation.com/search?q=god%20of%20war)
- [CSS Variables MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [WCAG 無障礙指南](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Motion](https://material.io/design/motion)

---

## 📄 授權與使用

這個主題系統是開源的，你可以：
- ✅ 在任何項目中使用
- ✅ 修改和自定義
- ✅ 商業使用
- ✅ 分享給其他開發者

建議在使用時保留靈感來源的註釋。

---

**版本**: 1.0.0  
**類型**: UI 主題系統  
**風格**: 北歐史詩 / 戰神風格  
**靈感來源**: God of War (戰神) 遊戲系列
