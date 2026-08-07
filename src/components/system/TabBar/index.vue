<script setup lang="ts">
/**
 * TabBar — 移动端底部导航栏
 *
 * 三个入口：对话 / 搜索 / 设置
 */

import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Tab {
  key: string;
  label: string;
  icon: string;
  route: string;
}

const tabs: Tab[] = [
  { key: 'chat', label: '对话', icon: 'chat', route: '/chat' },
  { key: 'search', label: '搜索', icon: 'search', route: '/search' },
  { key: 'settings', label: '设置', icon: 'settings', route: '/settings' },
];

const route = useRoute();
const router = useRouter();

const activeTab = computed(() => {
  if (route.path.startsWith('/chat')) return 'chat';
  if (route.path.startsWith('/search')) return 'search';
  if (route.path.startsWith('/settings')) return 'settings';
  return 'chat';
});

function navigateTo(tab: Tab): void {
  router.push(tab.route);
}
</script>

<template>
  <nav class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="tab-bar__item"
      :class="{ 'tab-bar__item--active': activeTab === tab.key }"
      @click="navigateTo(tab)"
    >
      <span class="tab-bar__icon">
        <!-- 对话图标 -->
        <svg v-if="tab.icon === 'chat'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <!-- 搜索图标 -->
        <svg v-else-if="tab.icon === 'search'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <!-- 设置图标 -->
        <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </span>
      <span class="tab-bar__label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
.tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  padding: 0 8px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light);
  flex-shrink: 0;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    flex: 1;
    padding: 4px 0;
    border: none;
    background: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color 0.2s;
    -webkit-tap-highlight-color: transparent;

    &--active {
      color: var(--color-primary);
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  &__label {
    font-size: 10px;
    line-height: 1.2;
    font-weight: 500;
  }
}
</style>
