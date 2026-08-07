<script setup lang="ts">
/**
 * MobileLayout — 移动端布局
 *
 * 结构：
 * ┌──────────────────────────────┐
 * │    TopBar（汉堡菜单）         │
 * ├──────────────────────────────┤
 * │    MainContent               │
 * │    <router-view />           │
 * │                              │
 * ├──────────────────────────────┤
 * │    TabBar（对话/搜索/设置）    │
 * └──────────────────────────────┘
 *
 * ElDrawer：从左侧滑入的侧边栏，宽度 85vw
 * FAB：右下角新建对话浮动按钮
 */

import { ElDrawer } from 'element-plus';
import { Conversations } from 'vue-element-plus-x';
import TopBar from '@/components/system/TopBar/index.vue';
import TabBar from '@/components/system/TabBar/index.vue';
import FabButton from '@/components/system/FabButton/index.vue';
import { useLayoutStore } from '@/stores/modules/layout';

const layoutStore = useLayoutStore();
</script>

<template>
  <div class="mobile-layout">
    <!-- 顶部栏 -->
    <TopBar />

    <!-- 主内容区 -->
    <main class="mobile-layout__main">
      <router-view />
    </main>

    <!-- 底部 TabBar -->
    <TabBar />

    <!-- FAB 新建对话按钮 -->
    <FabButton />

    <!-- 侧边栏 Drawer -->
    <ElDrawer
      v-model="layoutStore.drawerOpen"
      title="对话列表"
      direction="ltr"
      size="85vw"
      :close-on-click-modal="true"
    >
      <Conversations />
    </ElDrawer>
  </div>
</template>

<style scoped lang="scss">
.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: var(--color-bg);

  &__main {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
</style>
