import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        { path: '', name: 'chat', component: () => import('@/views/ChatView.vue') },
        { path: 'search', name: 'search', component: () => import('@/views/SearchView.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
        { path: 'providers', name: 'providers', component: () => import('@/views/ProviderView.vue') },
        { path: 'assistants', name: 'assistants', component: () => import('@/views/AssistantView.vue') },
      ],
    },
  ],
})

export default router
