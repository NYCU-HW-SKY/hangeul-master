<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { errorHandler } from './utils/errorHandler';
import ToastContainer from './components/common/ToastContainer.vue';

// 全域載入狀態
const isLoading = ref(false);

// 錯誤邊界：捕獲子組件的錯誤
onErrorCaptured((err, _instance, info) => {
  errorHandler.handleError(err, `Component Error: ${info}`);
  // 返回 false 阻止錯誤繼續向上傳播
  return false;
});
</script>

<template>
  <div id="app-root" class="bg-hanji">
    <!-- 主內容區：路由視圖 -->
    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition :name="(route.meta.transition as string) || 'fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- Toast 容器 -->
    <ToastContainer />

    <!-- 全域載入覆蓋層（選用） -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<style scoped>
#app-root {
  min-height: 100vh;
  position: relative;
}

.main-content {
  min-height: 100vh;
}

/* 全域載入覆蓋層 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-neutral-200);
  border-top-color: var(--color-primary-500);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all var(--duration-base) var(--ease-out);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Scale transition */
.scale-enter-active,
.scale-leave-active {
  transition: all var(--duration-base) var(--ease-out);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
