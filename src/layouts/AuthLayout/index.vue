<script setup lang="ts">
/**
 * AuthLayout — 认证页面布局
 *
 * 结构：居中卡片容器 + <router-view />
 */
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__card">
      <div class="auth-layout__branding">
        <h1 class="auth-layout__title">Cherry Studio</h1>
        <p class="auth-layout__subtitle">AI 驱动的智能对话平台</p>
      </div>
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-bg-secondary, #f9fafb);
  padding: 24px;
}

.auth-layout__card {
  width: 100%;
  max-width: 420px;
  background: var(--color-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 40px 32px;
}

.auth-layout__branding {
  text-align: center;
  margin-bottom: 32px;
}

.auth-layout__title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary, #3b82f6);
  margin: 0 0 8px;
}

.auth-layout__subtitle {
  font-size: 14px;
  color: var(--color-text-muted, #9ca3af);
  margin: 0;
}
</style>
