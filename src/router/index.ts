import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { 
    path: '/', 
    name: 'home', 
    component: () => import('../pages/HomePage.vue') 
  },
  { 
    path: '/hangul40', 
    name: 'hangul40', 
    component: () => import('../pages/Hangul40Page.vue') 
  },
  { 
    path: '/study', 
    name: 'study', 
    component: () => import('../pages/StudyPage.vue') 
  },
  { 
    path: '/game', 
    name: 'game', 
    component: () => import('../pages/GamePage.vue') 
  },
  { 
    path: '/progress', 
    name: 'progress', 
    component: () => import('../pages/ProgressPage.vue') 
  },
  { 
    path: '/learning-modes', 
    name: 'learning-modes', 
    component: () => import('../pages/LearningModePage.vue') 
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
