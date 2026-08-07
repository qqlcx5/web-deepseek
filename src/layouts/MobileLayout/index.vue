<!-- 移动端布局：Drawer + 主内容 + TabBar + FAB -->
<script setup lang="ts">
import { useLayoutStore } from '@/stores/modules/layout';
import Aside from '@/layouts/components/Aside/index.vue';
import Main from '@/layouts/components/Main/index.vue';
import TabBar from '@/components/system/TabBar/index.vue';
import FabButton from '@/components/system/FabButton/index.vue';
import { useSessionStore } from '@/stores/modules/session';

const layoutStore = useLayoutStore();
const sessionStore = useSessionStore();

const drawerOpen = computed(() => layoutStore.drawerOpen);

function handleCreateChat(): void {
  sessionStore.createSessionBtn();
  layoutStore.closeDrawer();
}
</script>

<template>
  <div class="mobile-layout">
    <!-- Drawer 遮罩层 -->
    <transition name="drawer-overlay">
      <div
        v-if="drawerOpen"
        class="drawer-overlay"
        @click="layoutStore.closeDrawer()"
      />
    </transition>

    <!-- Drawer 侧边栏 -->
    <transition name="drawer">
      <aside v-if="drawerOpen" class="mobile-drawer">
        <Aside />
      </aside>
    </transition>

    <!-- 主内容区 -->
    <div class="mobile-main">
      <Main />
    </div>

    <!-- 底部 TabBar -->
    <TabBar />

    <!-- 新建对话 FAB -->
    <FabButton @click="handleCreateChat" />
  </div>
</template>

<style lang="scss" scoped>
.mobile-layout {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background-color: var(--color-bg);
}

// ==================== Drawer 遮罩 ====================
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  background-color: rgba(0, 0, 0, 0.4);
}

.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity var(--layout-transition-duration) var(--layout-transition-easing);
}

.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

// ==================== Drawer 侧边栏 ====================
.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: var(--mobile-drawer-width);
  height: 100vh;
  height: 100dvh;
  background-color: var(--color-bg);
  box-shadow: 2px 0 16px var(--color-shadow);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform var(--layout-transition-duration) var(--layout-transition-easing);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}

// ==================== 主内容 ====================
.mobile-main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
