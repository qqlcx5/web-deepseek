<!-- 桌面端布局：固定侧边栏 + 主内容区 + 可选右侧面板 -->
<script setup lang="ts">
import { useLayoutStore } from '@/stores/modules/layout';
import Aside from '@/layouts/components/Aside/index.vue';
import Header from '@/layouts/components/Header/index.vue';
import Main from '@/layouts/components/Main/index.vue';

const layoutStore = useLayoutStore();

const sidebarCollapsed = computed(() => layoutStore.sidebarCollapsed);
const rightPanelOpen = computed(() => layoutStore.rightPanelOpen);
const rightPanelContent = computed(() => layoutStore.rightPanelContent);
</script>

<template>
  <div class="desktop-layout">
    <!-- 侧边栏 -->
    <aside
      class="desktop-sidebar"
      :class="{ 'is-collapsed': sidebarCollapsed }"
    >
      <div class="sidebar-content">
        <Aside />
      </div>
    </aside>

    <!-- 折叠按钮（侧边栏顶部的 hamburger 图标） -->
    <button
      class="sidebar-toggle"
      :class="{ 'is-collapsed': sidebarCollapsed }"
      @click="layoutStore.toggleSidebar()"
      :title="sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'"
    >
      <span class="hamburger-icon">
        <span />
        <span />
        <span />
      </span>
    </button>

    <!-- 主内容区 -->
    <div class="desktop-main">
      <Header />
      <div class="desktop-content">
        <Main />
      </div>
    </div>

    <!-- 右侧面板 -->
    <transition name="right-panel">
      <aside
        v-if="rightPanelOpen"
        class="desktop-right-panel"
      >
        <div class="right-panel-header">
          <span class="right-panel-title">
            {{ rightPanelContent === 'context' ? '上下文信息' : '附件列表' }}
          </span>
          <button
            class="right-panel-close"
            @click="layoutStore.closeRightPanel()"
          >
            ✕
          </button>
        </div>
        <div class="right-panel-body">
          <div v-if="rightPanelContent === 'context'" class="panel-placeholder">
            上下文信息（待实现）
          </div>
          <div v-else-if="rightPanelContent === 'attachments'" class="panel-placeholder">
            附件列表（待实现）
          </div>
        </div>
      </aside>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.desktop-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg);
}

// ==================== 侧边栏 ====================
.desktop-sidebar {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  width: var(--sidebar-width);
  height: 100vh;
  transition:
    width var(--layout-transition-duration) var(--layout-transition-easing);

  &.is-collapsed {
    width: var(--sidebar-collapsed-width);
  }

  .sidebar-content {
    width: var(--sidebar-width);
    min-width: var(--sidebar-width);
    height: 100%;
    overflow: hidden;
  }
}

// ==================== 折叠按钮 ====================
.sidebar-toggle {
  position: absolute;
  top: 12px;
  left: calc(var(--sidebar-width) - 12px);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  cursor: pointer;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 50%;
  box-shadow: 0 1px 4px var(--color-shadow);
  transition:
    left var(--layout-transition-duration) var(--layout-transition-easing),
    opacity var(--layout-transition-duration) var(--layout-transition-easing);

  &.is-collapsed {
    left: 12px;
  }

  &:hover {
    background: var(--color-surface-hover);
  }

  .hamburger-icon {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 14px;
    height: 12px;

    span {
      display: block;
      width: 100%;
      height: 2px;
      background-color: var(--color-text-secondary);
      border-radius: 1px;
      transition: background-color 0.2s;
    }
  }
}

// ==================== 主内容区 ====================
.desktop-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;

  .desktop-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}

// ==================== 右侧面板 ====================
.desktop-right-panel {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: var(--right-panel-width);
  height: 100vh;
  background-color: var(--color-bg);
  border-left: 1px solid var(--color-border-light);

  .right-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border-lighter);

    .right-panel-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
    }

    .right-panel-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      font-size: 14px;
      color: var(--color-text-secondary);
      cursor: pointer;
      background: none;
      border: none;
      border-radius: 4px;

      &:hover {
        background-color: var(--color-surface-hover);
        color: var(--color-text);
      }
    }
  }

  .right-panel-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;

    .panel-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-size: 14px;
      color: var(--color-text-placeholder);
    }
  }
}

// ==================== 右侧面板动画 ====================
.right-panel-enter-active,
.right-panel-leave-active {
  transition:
    width var(--layout-transition-duration) var(--layout-transition-easing),
    opacity var(--layout-transition-duration) var(--layout-transition-easing);
}

.right-panel-enter-from,
.right-panel-leave-to {
  width: 0;
  opacity: 0;
}
</style>
