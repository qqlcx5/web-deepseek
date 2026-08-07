<script setup lang="ts">
/**
 * ErrorBoundary — 全局错误边界
 *
 * 捕获子组件树中的渲染错误，
 * 展示友好的错误回退 UI，支持重试和刷新。
 *
 * 实现策略：Vue 3 onErrorCaptured + 全局 system-error 事件总线。
 */

import { ref, onMounted, onBeforeUnmount, type ComponentPublicInstance } from 'vue';
import { useSystemStore } from '@/stores';

const errorMessage = ref<string | null>(null);
const errorDetail = ref<string | null>(null);
const hasError = ref(false);

const systemStore = useSystemStore();

/** 错误类型映射 */
const ERROR_MAP: Record<string, string> = {
  'Failed to fetch dynamically imported module': '模块加载失败，可能是网络问题或新版本已部署',
  'ChunkLoadError': '代码块加载失败，请尝试刷新页面',
};

/** 解析错误原因 */
function resolveErrorReason(err: unknown): string {
  if (err instanceof Error) {
    for (const [keyword, desc] of Object.entries(ERROR_MAP)) {
      if (err.message.includes(keyword)) return desc;
    }
    return err.message;
  }
  return String(err);
}

/** 全局 system-error 事件处理 */
function handleSystemError(event: Event): void {
  const customEvent = event as CustomEvent<{ error: Error }>;
  if (customEvent.detail?.error) {
    errorMessage.value = resolveErrorReason(customEvent.detail.error);
    errorDetail.value = customEvent.detail.error.stack ?? null;
    hasError.value = true;
    systemStore.setGlobalError(customEvent.detail.error);
  }
}

/** 重试 */
function retry(): void {
  errorMessage.value = null;
  errorDetail.value = null;
  hasError.value = false;
  systemStore.clearGlobalError();
}

/** 刷新页面 */
function reloadPage(): void {
  window.location.reload();
}

onMounted(() => {
  window.addEventListener('system-error', handleSystemError);
});

onBeforeUnmount(() => {
  window.removeEventListener('system-error', handleSystemError);
});
</script>

<template>
  <!-- 正常：渲染子内容 -->
  <template v-if="!hasError">
    <slot />
  </template>

  <!-- 错误回退 UI -->
  <div v-else class="error-fallback">
    <div class="error-fallback__card">
      <div class="error-fallback__icon">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 class="error-fallback__title">出错了</h2>
      <p class="error-fallback__message">{{ errorMessage }}</p>
      <details v-if="errorDetail" class="error-fallback__details">
        <summary>查看错误详情</summary>
        <pre>{{ errorDetail }}</pre>
      </details>
      <div class="error-fallback__actions">
        <button class="error-fallback__btn error-fallback__btn--primary" @click="retry">
          重试
        </button>
        <button class="error-fallback__btn" @click="reloadPage">
          刷新页面
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;

  &__card {
    text-align: center;
    max-width: 420px;
    padding: 48px 32px;
    border-radius: 16px;
    background: var(--el-bg-color, #fff);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  &__icon {
    color: var(--el-color-danger, #f56c6c);
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
  }

  &__message {
    margin: 0 0 20px;
    font-size: 14px;
    color: var(--el-text-color-regular, #606266);
    line-height: 1.6;
  }

  &__details {
    text-align: left;
    margin-bottom: 20px;

    summary {
      cursor: pointer;
      font-size: 12px;
      color: var(--el-text-color-secondary, #909399);
      margin-bottom: 8px;
    }

    pre {
      padding: 12px;
      border-radius: 8px;
      background: var(--el-fill-color-light, #f5f7fa);
      font-size: 12px;
      line-height: 1.5;
      overflow-x: auto;
      max-height: 200px;
      color: var(--el-text-color-regular, #606266);
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  &__btn {
    padding: 8px 24px;
    border: 1px solid var(--el-border-color, #dcdfe6);
    border-radius: 8px;
    background: var(--el-bg-color, #fff);
    color: var(--el-text-color-regular, #606266);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-primary, #409eff);
      color: var(--el-color-primary, #409eff);
    }

    &--primary {
      background: var(--el-color-primary, #409eff);
      border-color: var(--el-color-primary, #409eff);
      color: #fff;

      &:hover {
        background: var(--el-color-primary-light-3, #66b1ff);
        border-color: var(--el-color-primary-light-3, #66b1ff);
      }
    }
  }
}
</style>
