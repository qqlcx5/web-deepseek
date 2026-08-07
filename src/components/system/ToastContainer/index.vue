<script setup lang="ts">
/**
 * ToastContainer — 全局 Toast 容器
 *
 * Toast 通知通过 useSystemStore.showToast() 命令式调用，
 * 内部使用 Element Plus 的 ElMessage / ElNotification。
 * 本组件仅提供 Pinia store 的响应式上下文挂载点。
 *
 * 用法：
 *   const systemStore = useSystemStore();
 *   systemStore.showToast({ type: 'success', title: '操作成功' });
 */

import { useSystemStore } from '@/stores';

// 初始化 store 以确保响应式上下文挂载
const systemStore = useSystemStore();
</script>

<template>
  <!-- ElMessage / ElNotification 是命令式 API，不需要模板 -->
  <div class="toast-container" style="display: none" aria-hidden="true" />
</template>

<style scoped lang="scss">
.toast-container {
  pointer-events: none;
}
</style>
