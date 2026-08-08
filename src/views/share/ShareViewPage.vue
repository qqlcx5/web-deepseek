<script setup lang="ts">
/**
 * ShareViewPage — 公开分享查看页
 */
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="share-page">
    <div class="share-page__header">
      <h2>Cherry Studio</h2>
      <p class="share-page__badge">分享的对话</p>
    </div>
    <div class="share-page__content">
      <el-empty description="该分享不存在或已过期" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.share-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
  min-height: 100vh;

  &__header {
    text-align: center;
    margin-bottom: 32px;

    h2 {
      font-size: 22px;
      font-weight: 600;
      color: var(--color-primary, #3b82f6);
      margin: 0 0 8px;
    }
  }

  &__badge {
    display: inline-block;
    background: var(--color-bg-secondary, #f3f4f6);
    color: var(--color-text-secondary, #6b7280);
    font-size: 13px;
    padding: 4px 12px;
    border-radius: 12px;
    margin: 0;
  }

  &__content {
    text-align: center;
    padding: 60px 0;
  }
}
</style>
