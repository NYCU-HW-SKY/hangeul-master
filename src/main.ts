import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { errorHandler } from './utils/errorHandler'
import '@/assets/styles/global.css'

const app = createApp(App)

// 設定全域錯誤處理器
app.config.errorHandler = (err, _instance, info) => {
  errorHandler.handleError(err as Error, info)
}

// 處理未捕獲的 Promise 錯誤
window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(
    event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
    'Unhandled Promise Rejection'
  )
})

app.use(createPinia())
app.use(router)

app.mount('#app')
