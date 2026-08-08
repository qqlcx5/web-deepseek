<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useTheme } from '@/composables/useTheme'
import { Icon } from '@iconify/vue'

const store = useChatStore()
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <header class="topbar">
    <button
      v-if="store.focusMode"
      class="icon-btn tooltip desktop-only"
      data-tip="显示侧栏"
      @click="store.focusMode = false"
    >
      <Icon icon="tabler:panel-left-open" />
    </button>
    <button class="icon-btn mobile-only" @click="store.sidebarOpen = true">
      <Icon icon="tabler:menu" />
    </button>

    <div class="title-block">
      <div class="title-line">
        <h1 class="chat-heading">{{ store.currentChat?.title || 'DeepSeek Chat' }}</h1>
        <button
          v-if="store.currentChat"
          class="icon-btn tooltip desktop-only"
          data-tip="重命名对话"
          style="width:26px;height:26px;flex-basis:26px"
          @click="store.showToast('标题编辑状态已开启')"
        >
          <Icon icon="tabler:pencil" width="13" />
        </button>
      </div>
      <div class="save-state">
        <Icon icon="tabler:cloud-check" />
        {{ store.saving ? '正在保存...' : (store.currentChat ? '刚刚保存' : '就绪') }}
        <template v-if="store.currentChat">· {{ store.messages.length }} 条消息</template>
      </div>
    </div>

    <button class="model-button" @click="store.modal = 'model'">
      <Icon icon="tabler:sparkles" width="14" />
      <span>{{ store.selectedModel?.name }}</span>
      <Icon icon="tabler:chevron-down" width="13" />
    </button>

    <button
      class="icon-btn tooltip"
      data-tip="切换主题"
      @click="toggleTheme"
    >
      <Icon :icon="isDark ? 'tabler:sun' : 'tabler:moon'" />
    </button>

    <button
      class="icon-btn tooltip desktop-only"
      data-tip="专注模式"
      :class="{ active: store.focusMode }"
      @click="store.toggleFocusMode()"
    >
      <Icon icon="tabler:maximize-2" />
    </button>

    <button
      class="icon-btn tooltip"
      data-tip="会话信息"
      :class="{ active: store.inspectorVisible || store.inspectorOpen }"
      @click="store.toggleInspector()"
    >
      <Icon icon="tabler:panel-right" />
    </button>
  </header>

  <div v-if="!store.online" class="network-banner">
    <Icon icon="tabler:wifi-off" />
    网络已断开。消息将保存在本地，恢复连接后自动发送。
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  height: var(--header);
  flex: 0 0 var(--header);
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  background: color-mix(in srgb, var(--surface) 96%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
}
.mobile-only { display: none; }
.title-block { min-width: 0; flex: 1; }
.title-line { display: flex; min-width: 0; align-items: center; gap: 7px; }
.chat-heading { overflow: hidden; margin: 0; font-size: 14px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; color: var(--text); }
.save-state { display: flex; align-items: center; gap: 4px; margin-top: 3px; color: var(--faint); font-size: 10px; }
.save-state :deep(svg) { width: 12px; height: 12px; color: var(--success); }
.model-button {
  display: flex; height: 34px; max-width: 180px; align-items: center; gap: 7px;
  padding: 0 10px; color: var(--text-secondary); background: var(--surface);
  border: 1px solid var(--line-strong); border-radius: 6px;
  font-size: 12px; font-weight: 600; cursor: pointer;
}
.model-button span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.network-banner {
  display: flex; min-height: 34px; align-items: center; justify-content: center;
  gap: 7px; padding: 6px 14px; color: var(--warning); background: color-mix(in srgb, var(--warning) 8%, var(--surface));
  border-bottom: 1px solid color-mix(in srgb, var(--warning) 20%, var(--line)); font-size: 11px; text-align: center;
}
.network-banner :deep(svg) { width: 14px; }

.icon-btn {
  display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px;
  align-items: center; justify-content: center; border-radius: 6px;
  color: var(--muted); background: transparent; border: 0; cursor: pointer;
  transition: background 140ms, color 140ms;
}
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn.active { color: var(--brand); background: var(--brand-soft); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }

@media (max-width: 760px) {
  .topbar { padding: 0 9px; }
  .mobile-only { display: inline-flex; }
  .desktop-only { display: none !important; }
  .title-block { text-align: center; }
  .title-line { justify-content: center; }
  .save-state { justify-content: center; }
  .model-button { max-width: 102px; padding: 0 8px; }
}
@media (max-width: 390px) {
  .model-button { width: 34px; }
  .model-button span,
  .model-button :deep(svg) { display: none; }
}
</style>
