<script setup lang="ts">
/**
 * WorkspacePage — 工作区详情页
 */
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="workspace-page">
    <div class="workspace-page__header">
      <h2>工作区详情</h2>
      <p class="workspace-page__id">ID: {{ route.params.workspaceId }}</p>
    </div>
    <div class="workspace-page__content">
      <el-empty description="工作区详情（待 workspace 模块完善）" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.workspace-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;

  &__header {
    margin-bottom: 24px;

    h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px;
    }
  }

  &__id {
    font-size: 14px;
    color: var(--color-text-muted, #9ca3af);
    margin: 0;
  }

  &__content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
