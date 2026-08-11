import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Chat',
      component: () => import('@/views/chat/ChatPage.vue'),
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/chat/ChatPage.vue'),
      meta: { defaultView: 'search' },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/chat/ChatPage.vue'),
      meta: { defaultView: 'settings' },
    },
  ],
})

export default router
