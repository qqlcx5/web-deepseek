<!--
  Orbita AI 聊天主页面
  接入 useAppStore 真实数据层 + Element-Plus-X 组件
-->
<script setup lang="ts">
import { useOrbitState } from './useOrbitState';
import { Welcome } from 'vue-element-plus-x';
import OrbitAttachmentPreview from './OrbitAttachmentPreview.vue';
import OrbitComposer from './OrbitComposer.vue';
import OrbitDialogs from './OrbitDialogs.vue';
import OrbitInspector from './OrbitInspector.vue';
import OrbitMessage from './OrbitMessage.vue';
import OrbitSearch from './OrbitSearch.vue';
import OrbitSidebar from './OrbitSidebar.vue';
import OrbitTopbar from './OrbitTopbar.vue';

const state = useOrbitState();
const messagesScroller = ref<HTMLElement | null>(null);

/** 最后一条 assistant 消息的 id（用于「重新生成」按钮显示） */
const lastAssistantId = computed(() => {
  const msgs = state.messages.value;
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === 'assistant') return msgs[i].id;
  }
  return '';
});

// 全局快捷键
function handleGlobalKeydown(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey;
  if (meta && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    state.openSearch();
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
    if (state.searchOpen.value) {
      state.closeSearch();
      return;
    }
    state.modal.value = '';
    state.closeDrawers();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
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

// 从搜索结果跳转到目标消息
watch(
  () => state.scrollTargetId.value,
  (targetId) => {
    if (!targetId) return;
    nextTick(() => {
      const el = document.querySelector(`[data-msg-id="${targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('orbit-msg-flash');
        setTimeout(() => el.classList.remove('orbit-msg-flash'), 2000);
      }
      state.scrollTargetId.value = '';
    });
  },
);
</script>

<template>
  <div class="orbit-app" :class="{ 'orbit-focus': state.focusMode.value, 'orbit-compact': state.compactMode.value }">
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
        <!-- 空状态：Welcome -->
        <div v-if="state.messages.value.length === 0" class="orbit-welcome-area">
          <Welcome
            variant="page"
            :title="'Orbita AI'"
            :description="'智能助手，随时为你提供帮助'"
            :suggestions="[
              { label: '写一份项目计划', value: '写一份项目计划' },
              { label: '解释量子计算', value: '解释量子计算' },
              { label: '帮我起草一封邮件', value: '帮我起草一封邮件' },
              { label: '分析这组数据', value: '分析这组数据' },
            ]"
            @select="(item: any) => { state.draft.value = item.value || item.label; state.sendMessage(); }"
          />
        </div>

        <!-- 消息列表 -->
        <div v-else class="orbit-message-list">
          <!-- 日期分隔线 -->
          <div class="orbit-date-divider">
            <span>今天</span>
          </div>

          <OrbitMessage
            v-for="msg in state.messages.value"
            :key="msg.id"
            :message="msg"
            :state="state"
            :is-last-assistant="msg.id === lastAssistantId"
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

    <OrbitSearch :state="state" />

    <OrbitAttachmentPreview :state="state" />
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

// 欢迎区
.orbit-welcome-area {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 24px;
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

// 消息高亮闪烁（搜索结果跳转）
:deep(.orbit-msg-flash) {
  animation: orbit-flash 2s ease-out;
}
@keyframes orbit-flash {
  0% { background-color: rgba(138, 133, 227, 0.18); }
  100% { background-color: transparent; }
}

// 紧凑模式
.orbit-app.orbit-compact {
  .orbit-message-list {
    padding-top: 16px;
    padding-bottom: 80px;
  }
  :deep(.orbit-chat-heading) {
    font-size: 13px;
  }
  :deep(.orbit-save-state) {
    font-size: 9px;
  }
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
