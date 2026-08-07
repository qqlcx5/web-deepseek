<script setup lang="ts">
/**
 * FabButton — 浮动操作按钮（移动端专用）
 *
 * 固定在右下角，点击新建对话。
 * 带缩放弹入/弹出动画。
 */

import { useRouter } from 'vue-router';

const router = useRouter();

function handleClick(): void {
  router.push('/chat');
  // 触发新对话创建 — 后续由 conversation store 处理
}
</script>

<template>
  <button
    class="fab-button"
    aria-label="新建对话"
    @click="handleClick"
  >
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  </button>
</template>

<style scoped lang="scss">
.fab-button {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: scale(0.92);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  }
}
</style>
