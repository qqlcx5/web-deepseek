<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import ToastContainer from '@/components/system/ToastContainer/index.vue';
import ConfirmDialog from '@/components/system/ConfirmDialog/index.vue';
import ErrorBoundary from '@/components/system/ErrorBoundary/index.vue';
import NetworkStatusBar from '@/components/system/NetworkStatusBar/index.vue';

// Service Worker 更新检测
let swRegistration: ServiceWorkerRegistration | null = null;

async function checkForUpdate(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    swRegistration = await navigator.serviceWorker.getRegistration();
    if (!swRegistration) return;

    // 监听新 Service Worker 安装完成
    swRegistration.addEventListener('updatefound', () => {
      const newWorker = swRegistration!.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 新版本已就绪，通知用户
          window.dispatchEvent(new CustomEvent('sw-update-ready'));
        }
      });
    });

    // 定期检查更新
    setInterval(() => {
      swRegistration?.update();
    }, 60 * 60 * 1000); // 每小时检查一次
  } catch {
    // Service Worker 不可用，静默忽略
  }
}

onMounted(() => {
  checkForUpdate();
});

onBeforeUnmount(() => {
  swRegistration = null;
});
</script>

<template>
  <ErrorBoundary>
    <router-view />
  </ErrorBoundary>
  <ToastContainer />
  <ConfirmDialog />
  <NetworkStatusBar />
</template>

<style scoped lang="scss"></style>
