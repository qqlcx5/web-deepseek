<script setup lang="ts">
/**
 * NetworkStatusBar — 网络状态提示条
 *
 * 监听浏览器 online/offline 事件，在离线/恢复在线时展示提示横幅。
 * 使用 useSystemStore.showToast() 展示网络状态变更通知。
 */

import { ref, onMounted, onBeforeUnmount } from 'vue';

/** 是否在线 */
const isOnline = ref(navigator.onLine);
/** 是否显示恢复在线提示 */
const showOnlineBanner = ref(false);

let onlineTimer: ReturnType<typeof setTimeout> | null = null;

/** 处理离线事件 */
function handleOffline(): void {
  isOnline.value = false;
  showOnlineBanner.value = false;
}

/** 处理在线事件 */
function handleOnline(): void {
  isOnline.value = true;
  showOnlineBanner.value = true;

  // 3s 后自动隐藏恢复在线提示
  if (onlineTimer) clearTimeout(onlineTimer);
  onlineTimer = setTimeout(() => {
    showOnlineBanner.value = false;
  }, 3000);
}

onMounted(() => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});

onBeforeUnmount(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  if (onlineTimer) clearTimeout(onlineTimer);
});
</script>

<template>
  <Teleport to="body">
    <!-- 离线提示条 -->
    <Transition name="network-banner">
      <div
        v-if="!isOnline"
        class="network-bar network-bar--offline"
        role="alert"
      >
        <svg
          class="network-bar__icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
        <span class="network-bar__text">网络连接已断开</span>
      </div>
    </Transition>

    <!-- 恢复在线提示条 -->
    <Transition name="network-banner">
      <div
        v-if="showOnlineBanner && isOnline"
        class="network-bar network-bar--online"
        role="status"
      >
        <svg
          class="network-bar__icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
        </svg>
        <span class="network-bar__text">网络已恢复</span>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.network-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  pointer-events: none;

  &--offline {
    background: #f56c6c;
    color: #fff;
  }

  &--online {
    background: #67c23a;
    color: #fff;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__text {
    line-height: 1.4;
  }
}

// 过渡动画
.network-banner-enter-active,
.network-banner-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.network-banner-enter-from,
.network-banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
