<script setup lang="ts">
/**
 * AdminPage — 管理端页面
 */
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="admin-page">
    <h2 class="admin-page__title">
      {{ route.params.section ? `${String(route.params.section)} 管理` : '管理概览' }}
    </h2>

    <div v-if="!route.params.section" class="admin-page__dashboard">
      <div class="admin-page__card">
        <h3>用户总数</h3>
        <p class="admin-page__stat">--</p>
      </div>
      <div class="admin-page__card">
        <h3>活跃对话</h3>
        <p class="admin-page__stat">--</p>
      </div>
      <div class="admin-page__card">
        <h3>API 调用</h3>
        <p class="admin-page__stat">--</p>
      </div>
      <div class="admin-page__card">
        <h3>存储用量</h3>
        <p class="admin-page__stat">--</p>
      </div>
    </div>

    <div v-else class="admin-page__section">
      <el-empty :description="`${route.params.section} 管理（待 admin-console 模块实现）`" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-page {
  &__title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 24px;
    color: var(--color-text-primary, #111827);
  }

  &__dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }

  &__card {
    background: var(--color-bg, #fff);
    border: 1px solid var(--color-border-light, #e5e7eb);
    border-radius: 10px;
    padding: 24px;

    h3 {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-muted, #9ca3af);
      margin: 0 0 12px;
    }
  }

  &__stat {
    font-size: 32px;
    font-weight: 700;
    color: var(--color-primary, #3b82f6);
    margin: 0;
  }

  &__section {
    padding: 60px 0;
  }
}
</style>
