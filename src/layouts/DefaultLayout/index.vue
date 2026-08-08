<script setup lang="ts">
/**
 * DefaultLayout — 公开页面布局
 *
 * 结构：Header + <router-view /> + Footer
 */
</script>

<template>
  <div class="default-layout">
    <header class="default-layout__header">
      <div class="default-layout__header-inner">
        <router-link to="/" class="default-layout__logo">Cherry Studio</router-link>
        <nav class="default-layout__nav">
          <router-link to="/chat" class="default-layout__nav-link">开始对话</router-link>
          <router-link to="/login" class="default-layout__nav-link">登录</router-link>
        </nav>
      </div>
    </header>

    <main class="default-layout__main">
      <router-view />
    </main>

    <footer class="default-layout__footer">
      <p>&copy; 2026 Cherry Studio. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg, #fff);

  &__header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--color-border-light, #e5e7eb);
    padding: 0 24px;
    height: 56px;
    display: flex;
    align-items: center;
  }

  &__header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  &__logo {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-primary, #3b82f6);
    text-decoration: none;
  }

  &__nav {
    display: flex;
    gap: 24px;
  }

  &__nav-link {
    font-size: 14px;
    color: var(--color-text-secondary, #6b7280);
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: var(--color-primary, #3b82f6);
    }
  }

  &__main {
    flex: 1;
  }

  &__footer {
    flex-shrink: 0;
    text-align: center;
    padding: 16px;
    font-size: 13px;
    color: var(--color-text-muted, #9ca3af);
    border-top: 1px solid var(--color-border-light, #e5e7eb);
  }
}
</style>
