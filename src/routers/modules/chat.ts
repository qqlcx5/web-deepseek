/**
 * V2 路由表 — 12 条路由
 */
import type { RouteRecordRaw } from 'vue-router'

export const chatRouter: RouteRecordRaw[] = [
  // ---- Landing 首页 ----
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: { title: 'Cherry Studio', layout: 'default' },
  },

  // ---- 对话主界面 ----
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/layouts/AppLayout/index.vue'),
    children: [
      {
        path: '',
        name: 'ChatIndex',
        component: () => import('@/views/chat/ChatPage.vue'),
        meta: { title: '对话', auth: true },
      },
      {
        path: ':conversationId',
        name: 'ChatConversation',
        component: () => import('@/views/chat/ChatPage.vue'),
        meta: { title: '对话', auth: true },
      },
    ],
  },

  // ---- 工作区详情 ----
  {
    path: '/workspace/:workspaceId',
    name: 'WorkspaceDetail',
    component: () => import('@/views/workspace/WorkspacePage.vue'),
    meta: { title: '工作区', auth: true },
  },

  // ---- 回收站 ----
  {
    path: '/trash',
    name: 'Trash',
    component: () => import('@/views/trash/TrashPage.vue'),
    meta: { title: '回收站', auth: true },
  },

  // ---- 设置 ----
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/SettingsPage.vue'),
    meta: { title: '设置', auth: true },
  },
  {
    path: '/settings/:section',
    name: 'SettingsSection',
    component: () => import('@/views/settings/SettingsPage.vue'),
    meta: { title: '设置', auth: true },
  },

  // ---- 全局搜索 ----
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/search/SearchPage.vue'),
    meta: { title: '搜索', auth: true },
  },

  // ---- 分享页（公开） ----
  {
    path: '/share/:shareId',
    name: 'ShareView',
    component: () => import('@/layouts/MinimalLayout/index.vue'),
    children: [
      {
        path: '',
        name: 'ShareViewPage',
        component: () => import('@/views/share/ShareViewPage.vue'),
        meta: { title: '分享', layout: 'minimal' },
      },
    ],
  },

  // ---- 管理端（管理员） ----
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/layouts/AdminLayout/index.vue'),
    meta: { title: '管理后台', admin: true },
    children: [
      {
        path: '',
        name: 'AdminIndex',
        component: () => import('@/views/admin/AdminPage.vue'),
        meta: { title: '管理后台', admin: true },
      },
      {
        path: ':section',
        name: 'AdminSection',
        component: () => import('@/views/admin/AdminPage.vue'),
        meta: { title: '管理后台', admin: true },
      },
    ],
  },

  // ---- 登录页 ----
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/layouts/AuthLayout/index.vue'),
    children: [
      {
        path: '',
        name: 'LoginPage',
        component: () => import('@/views/LoginPage.vue'),
        meta: { title: '登录' },
      },
    ],
  },

  // ---- 404 兜底 ----
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/layouts/MinimalLayout/index.vue'),
    children: [
      {
        path: '',
        name: 'NotFoundPage',
        component: () => import('@/views/NotFoundPage.vue'),
        meta: { title: '404' },
      },
    ],
  },
]
