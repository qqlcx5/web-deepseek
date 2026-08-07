<script setup lang="ts">
/**
 * TopBar — 顶部导航栏
 *
 * 桌面端：面包屑导航
 * 移动端：汉堡菜单按钮 + 页面标题
 *
 * 用法：
 *   桌面端 (DesktopLayout) 中作为侧边栏折叠按钮
 *   移动端 (MobileLayout) 中作为 Drawer 触发按钮
 */

import { useLayoutStore } from '@/stores/modules/layout';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const layoutStore = useLayoutStore();
const route = useRoute();

/** 当前页面标题（从路由 meta 或 path 派生） */
const pageTitle = computed(() => {
  const metaTitle = route.meta?.title as string | undefined;
  if (metaTitle) return metaTitle;

  const path = route.path;
  if (path.includes('/chat')) return '对话';
  if (path.includes('/search')) return '搜索';
  if (path.includes('/settings')) return '设置';
  if (path.includes('/cherry')) return 'Cherry Studio';
  return 'Cherry Studio';
});

function handleHamburgerClick(): void {
  layoutStore.toggleSidebar();
}
</script>

<template>
  <header class="top-bar">
    <div class="top-bar__left">
      <!-- 汉堡菜单按钮 -->
      <button
        class="top-bar__hamburger"
        aria-label="切换侧边栏"
        @click="handleHamburgerClick"
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <!-- 移动端页面标题 -->
      <span
        v-if="layoutStore.isMobile"
        class="top-bar__title"
      >
        {{ pageTitle }}
      </span>

      <!-- 桌面端面包屑 -->
      <nav
        v-else
        class="top-bar__breadcrumb"
        aria-label="面包屑导航"
      >
        <span class="top-bar__breadcrumb-item">Cherry Studio</span>
        <span class="top-bar__breadcrumb-separator">/</span>
        <span class="top-bar__breadcrumb-item top-bar__breadcrumb-item--active">
          {{ pageTitle }}
        </span>
      </nav>
    </div>

    <!-- 右侧插槽（可由父组件扩展） -->
    <div class="top-bar__right">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--topbar-height);
  padding: 0 16px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: var(--color-surface-hover);
    }
  }

  &__title {
    font-size: 17px;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__breadcrumb-item {
    &--active {
      color: var(--color-text);
      font-weight: 500;
    }
  }

  &__breadcrumb-separator {
    color: var(--color-text-placeholder);
  }
}
</style>
