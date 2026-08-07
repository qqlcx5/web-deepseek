<script setup lang="ts">
/**
 * ConfirmDialog — 全局确认对话框
 *
 * 确认对话框通过 useSystemStore.showConfirm() 命令式调用，
 * 内部使用 Element Plus 的 ElMessageBox。
 * 本组件仅提供 Pinia store 的响应式上下文挂载点。
 *
 * 用法：
 *   const systemStore = useSystemStore();
 *   const confirmed = await systemStore.showConfirm({
 *     type: 'danger',
 *     title: '删除确认',
 *     description: '确定要删除这个对话吗？此操作不可撤销。',
 *   });
 *   if (confirmed) { ... }
 */

import { useSystemStore } from '@/stores';

// 初始化 store 以确保响应式上下文挂载
const systemStore = useSystemStore();
</script>

<template>
  <!-- ElMessageBox 是命令式 API，不需要模板 -->
  <div class="confirm-dialog" style="display: none" aria-hidden="true" />
</template>

<style scoped lang="scss">
.confirm-dialog {
  pointer-events: none;
}
</style>
