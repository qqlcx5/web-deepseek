<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'

const app = useAppStore()

function toggleTheme() {
  app.toggleTheme()
  ElMessage.info(app.isDark ? '已切换为深色模式' : '已切换为浅色模式')
}
</script>

<template>
  <div class="app-layout">
    <!-- 导航导轨（全局共享） -->
    <aside class="rail">
      <div class="logo">
        <i class="i-tabler-circle text-xl text-white" />
      </div>
      <nav class="rail-nav">
        <RouterLink to="/" class="rail-btn" title="对话">
          <i class="i-tabler-message-circle" />
        </RouterLink>
        <RouterLink to="/search" class="rail-btn" title="搜索">
          <i class="i-tabler-search" />
        </RouterLink>
        <RouterLink to="/providers" class="rail-btn" title="Provider">
          <i class="i-tabler-plug" />
        </RouterLink>
        <RouterLink to="/assistants" class="rail-btn" title="助手">
          <i class="i-tabler-sparkles" />
        </RouterLink>
        <RouterLink to="/settings" class="rail-btn" title="设置">
          <i class="i-tabler-settings" />
        </RouterLink>
      </nav>
      <div class="rail-bottom">
        <button class="rail-btn" title="切换主题" @click="toggleTheme">
          <i :class="app.isDark ? 'i-tabler-sun' : 'i-tabler-moon'" />
        </button>
        <div class="avatar">L</div>
      </div>
    </aside>

    <main class="layout-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ===== 导轨 ===== */
.rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 68px;
  shrink: 0;
  border-right: 1px solid #e5e7eb;
  background: #fff;
  padding: 16px 0;
  position: fixed;
  inset-block: 0;
  left: 0;
  z-index: 40;

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 16px;
    background: #5b56d6;
    margin-bottom: 32px;
    box-shadow: 0 4px 12px rgba(91, 86, 214, 0.3);
  }

  .rail-nav {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rail-bottom {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #e0e7ff;
    color: #5b56d6;
    font-size: 12px;
    font-weight: 700;
  }
}

.rail-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: #667085;
  transition: all 0.15s;
  text-decoration: none;

  &:hover { background: #f3f4f6; }
  &.router-link-active {
    background: #efefff;
    color: #5b56d6;
  }
}

.layout-main {
  margin-left: 68px;
  flex: 1;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

@media (max-width: 759px) {
  .rail { display: none; }
  .layout-main { margin-left: 0; }
}
</style>
