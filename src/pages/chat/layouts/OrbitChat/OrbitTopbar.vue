<!--
  Orbit 顶部栏：focus 按钮 + 标题块 + 模型按钮 + 工具按钮
-->
<script setup lang="ts">
import type { OrbitState } from './useOrbitState';

defineProps<{ state: OrbitState }>();
</script>

<template>
  <header class="orbit-topbar">
    <!-- 移动端菜单 -->
    <button class="icon-btn orbit-only-mobile" @click="state.sidebarOpen.value = true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>

    <!-- focus 时显示「退出专注」 -->
    <button
      v-if="state.focusMode.value"
      class="icon-btn tooltip"
      data-tip="退出专注"
      @click="state.toggleFocusMode()"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M15 3h6v6M21 3l-7 7M9 21H3v-6M3 21l7-7" />
      </svg>
    </button>

    <!-- 标题块 -->
    <div class="orbit-title-block">
      <div class="orbit-chat-heading">
        {{ state.currentChat.value?.title }}
      </div>
      <div class="orbit-save-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M18 10a6 6 0 1 0-12 0c0 4 6 9 6 9s6-5 6-9z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        刚刚保存 · {{ state.messages.value.length }} 条消息
      </div>
    </div>

    <!-- 模型按钮 -->
    <button class="orbit-model-button" @click="state.modal.value = 'model'">
      <span class="orbit-model-dot" />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M12 3l1.8 4.5L18 9l-4.2 1.5L12 15l-1.8-4.5L6 9l4.2-1.5L12 3z" />
      </svg>
      <span>{{ state.selectedModel.value.name }}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <!-- focus & 信息 -->
    <button class="icon-btn tooltip" data-tip="专注模式" @click="state.toggleFocusMode()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
    <button class="icon-btn tooltip" data-tip="会话信息" @click="state.toggleInspector()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    </button>
  </header>
</template>

<style scoped lang="scss">
.orbit-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--header);
  padding: 0 16px;
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}
.orbit-only-mobile {
  display: none;
}

// —— 标题块 ——
.orbit-title-block {
  flex: 1;
  min-width: 0;
}
.orbit-chat-heading {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.orbit-save-state {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 10px;
  color: var(--success);

  svg {
    width: 11px;
    height: 11px;
  }
}

// —— 模型按钮 ——
.orbit-model-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  max-width: 180px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--orbit-radius-base);
  transition: all 0.15s;

  svg {
    width: 14px;
    height: 14px;
    color: var(--brand);
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background: var(--surface-3);
    border-color: var(--line-strong);
  }
}
.orbit-model-dot {
  width: 7px;
  height: 7px;
  background: var(--orbit-online);
  border-radius: 50%;
}

// —— 响应式 ——
@media (max-width: 760px) {
  .orbit-only-mobile {
    display: inline-flex;
  }
}

@media (max-width: 390px) {
  .orbit-model-button {
    width: 34px;
    max-width: 34px;
    padding: 0;
    justify-content: center;
  }
  .orbit-model-button span,
  .orbit-model-button svg:last-of-type {
    display: none;
  }
}
</style>