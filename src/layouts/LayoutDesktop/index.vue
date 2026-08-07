<script setup lang="ts">
/**
 * DesktopLayout — 桌面端布局
 *
 * 结构：
 * ┌──────────────┬──────────────────────┬─────────────┐
 * │  Sidebar     │    MainContent       │ RightPanel  │
 * │ (260px)      │    (flex: 1)         │ (320px)     │
 * │ Conversations│    <router-view />   │ ElDrawer    │
 * └──────────────┴──────────────────────┴─────────────┘
 */

import { ElDrawer } from 'element-plus';
import { Conversations } from 'vue-element-plus-x';
import TopBar from '@/components/system/TopBar/index.vue';
import { useLayoutStore } from '@/stores/modules/layout';
import { computed } from 'vue';

const layoutStore = useLayoutStore();

const sidebarWidth = computed(() =>
  layoutStore.sidebarCollapsed ? '0px' : 'var(--sidebar-width)',
);

const sidebarVisible = computed(() => !layoutStore.sidebarCollapsed);

const rightPanelTitle = computed(() => {
  if (layoutStore.rightPanelContent === 'context') return '上下文信息';
  if (layoutStore.rightPanelContent === 'attachments') return '附件列表';
  return '面板';
});
</script>

<template>
  <div class="desktop-layout">
    <!-- 侧边栏 -->
    <Transition name="sidebar-slide">
      <aside
        v-if="sidebarVisible"
        class="desktop-layout__sidebar"
      >
        <div class="desktop-layout__sidebar-header">
          <TopBar />
        </div>
        <div class="desktop-layout__conversations">
          <Conversations />
        </div>
      </aside>
    </Transition>

    <!-- 主内容区 -->
    <main class="desktop-layout__main">
      <router-view />
    </main>

    <!-- 右侧面板（ElDrawer） -->
    <ElDrawer
      v-model="layoutStore.rightPanelOpen"
      :title="rightPanelTitle"
      :size="320"
      direction="rtl"
      :close-on-click-modal="true"
    >
      <div v-if="layoutStore.rightPanelContent === 'context'" class="desktop-layout__panel-content">
        <p class="desktop-layout__panel-placeholder">上下文信息面板（待实现）</p>
      </div>
      <div v-else-if="layoutStore.rightPanelContent === 'attachments'" class="desktop-layout__panel-content">
        <p class="desktop-layout__panel-placeholder">附件列表面板（待实现）</p>
      </div>
    </ElDrawer>
  </div>
</template>

<style scoped lang="scss">
.desktop-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  &__sidebar {
    width: v-bind(sidebarWidth);
    min-width: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--sidebar-background-color);
    border-right: 1px solid var(--color-border-light);
    overflow: hidden;
    transition: width var(--layout-transition-duration) var(--layout-transition-easing);
  }

  &__sidebar-header {
    flex-shrink: 0;
    padding: 12px 16px;
  }

  &__conversations {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px 8px;
  }

  &__main {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &__panel-content {
    padding: 16px;
  }

  &__panel-placeholder {
    color: var(--color-text-secondary);
    font-size: 14px;
    text-align: center;
    padding: 40px 0;
  }
}

// 侧边栏滑入/滑出动画
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: width var(--layout-transition-duration) var(--layout-transition-easing),
              opacity var(--layout-transition-duration) var(--layout-transition-easing);
  overflow: hidden;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  width: 0 !important;
  opacity: 0;
}
</style>
