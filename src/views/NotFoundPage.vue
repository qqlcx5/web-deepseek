<script setup lang="ts">
/**
 * NotFoundPage — 404 页面
 */
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found-page">
    <h1 class="not-found-page__code">404</h1>
    <p class="not-found-page__message">页面未找到</p>
    <p class="not-found-page__hint">您访问的页面不存在或已被移除</p>
    <div class="not-found-page__actions">
      <el-button type="primary" @click="router.push('/')">返回首页</el-button>
      <el-button @click="router.go(-1)">返回上页</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 24px;

  &__code {
    font-size: 96px;
    font-weight: 800;
    color: var(--color-primary, #3b82f6);
    margin: 0;
    line-height: 1;
  }

  &__message {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
    margin: 16px 0 8px;
  }

  &__hint {
    font-size: 14px;
    color: var(--color-text-muted, #9ca3af);
    margin: 0 0 32px;
  }

  &__actions {
    display: flex;
    gap: 12px;
  }
}
</style>
