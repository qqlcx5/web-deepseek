<!--
  Orbit AI 聊天主页面
  移植自 chat.html 的视觉与交互逻辑
  组件用 Element-Plus-X，请求用 hook-fetch（流式对话已就绪）
-->
<script setup lang="ts">
import { useOrbitState } from './useOrbitState';
import OrbitComposer from './OrbitComposer.vue';
import OrbitDialogs from './OrbitDialogs.vue';
import OrbitInspector from './OrbitInspector.vue';
import OrbitMessage from './OrbitMessage.vue';
import OrbitSidebar from './OrbitSidebar.vue';
import OrbitTopbar from './OrbitTopbar.vue';

const state = useOrbitState();
const messagesScroller = ref<HTMLElement | null>(null);

// 全局快捷键
function handleGlobalKeydown(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey;
  if (meta && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    state.openCommand();
    return;
  }
  if (meta && e.key.toLowerCase() === 'n') {
    e.preventDefault();
    state.newConversation();
    return;
  }
  if (meta && e.shiftKey && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    state.toggleFocusMode();
    return;
  }
  if (e.key === 'Escape') {
    state.modal.value = '';
    state.closeDrawers();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
  // 初始化滚到底部
  state.scrollToBottom();
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

watch(
  () => state.messages.value.length,
  () => {
    nextTick(() => {
      if (messagesScroller.value && state.nearBottom.value) {
        messagesScroller.value.scrollTop = messagesScroller.value.scrollHeight;
      }
    });
  },
);

function handleScroll() {
  if (!messagesScroller.value) return;
  const el = messagesScroller.value;
  state.nearBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
}
</script>

<template>
  <div class="orbit-app" :class="{ 'orbit-focus': state.focusMode.value }">
    <!-- 移动端 backdrop -->
    <div
      v-if="state.sidebarOpen.value"
      class="orbit-mobile-backdrop"
      @click="state.closeDrawers()"
    />

    <OrbitSidebar :state="state" />

    <!-- 主区 -->
    <main class="orbit-main">
      <OrbitTopbar :state="state" />

      <!-- offline banner -->
      <div v-if="!state.online.value" class="orbit-network-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M2 8.5A2.5 2.5 0 0 1 4.5 6h11A2.5 2.5 0 0 1 18 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 15.5z" />
        </svg>
        当前处于离线状态 - 消息将保存在本地，恢复网络后自动发送
      </div>

      <!-- 消息区 -->
      <div
        ref="messagesScroller"
        class="orbit-chat-area orbit-scroll"
        @scroll="handleScroll"
      >
        <div class="orbit-message-list">
          <!-- 日期分隔线 -->
          <div class="orbit-date-divider">
            <span>今天</span>
          </div>

          <OrbitMessage
            v-for="msg in state.messages.value"
            :key="msg.id"
            :message="msg"
            :state="state"
          />
        </div>

        <!-- jump bottom -->
        <transition name="orbit-jump">
          <button
            v-if="!state.nearBottom.value && state.messages.value.length > 1"
            class="orbit-jump-bottom"
            @click="state.scrollToBottom()"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </transition>
      </div>

      <OrbitComposer :state="state" />
    </main>

    <OrbitInspector :state="state" />

    <OrbitDialogs :state="state" />
  </div>
</template>

<style scoped lang="scss">
.orbit-app {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: var(--sidebar) minmax(0, 1fr) var(--inspector);
  width: 100%;
  height: 100dvh;
  background: var(--surface-2);
  overflow: hidden;

  &.orbit-focus {
    grid-template-columns: 0 minmax(0, 1fr) 0;
  }
}

.orbit-mobile-backdrop {
  position: fixed;
  inset: 0;
  z-index: 55;
  background: rgba(16, 24, 40, 0.26);
  display: none;
}

// —— 主区 ——
.orbit-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  background: var(--surface-2);
}

.orbit-network-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 14px;
  font-size: 11px;
  font-weight: 500;
  color: var(--orbit-offline-text);
  background: var(--orbit-offline-bg);
  border: 1px solid var(--orbit-offline-border);
  border-left: 0;
  border-right: 0;

  svg {
    width: 14px;
    height: 14px;
  }
}

// 消息区
.orbit-chat-area {
  position: relative;
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.orbit-message-list {
  width: min(100%, 820px);
  margin: 0 auto;
  padding: 32px 24px 120px;
}

// 日期分隔线
.orbit-date-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  font-size: 10px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--line);
  }
}

// 跳到底部
.orbit-jump-bottom {
  position: absolute;
  bottom: 10px;
  left: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--muted);
  background: var(--surface);
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(16, 24, 40, 0.08);
  transform: translateX(-50%);

  svg {
    width: 14px;
    height: 14px;
  }
}
.orbit-jump-enter-from,
.orbit-jump-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
.orbit-jump-enter-active,
.orbit-jump-leave-active {
  transition: all 0.2s;
}

// —— 响应式 ——
@media (max-width: 1180px) {
  .orbit-app {
    grid-template-columns: var(--sidebar) minmax(0, 1fr);
  }
}

@media (max-width: 760px) {
  .orbit-app {
    display: block;
  }
  .orbit-mobile-backdrop {
    display: block;
  }
  .orbit-main {
    height: 100%;
    padding-bottom: var(--mobile-nav);
  }
  .orbit-message-list {
    padding: 16px 12px 100px;
  }
}

@media (max-width: 390px) {
  .orbit-message-list {
    padding: 10px 10px 90px;
  }
}
</style>