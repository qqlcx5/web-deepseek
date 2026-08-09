<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { ConfigProvider } from 'vue-element-plus-x'
import { Icon } from '@iconify/vue'
import ChatSidebar from '@/components/chat/ChatSidebar.vue'
import ChatTopbar from '@/components/chat/ChatTopbar.vue'
import ChatMessages from '@/components/chat/ChatMessages.vue'
import ChatComposer from '@/components/chat/ChatComposer.vue'
import ChatInspector from '@/components/chat/ChatInspector.vue'
import CommandPalette from '@/components/chat/CommandPalette.vue'
import ModelSelector from '@/components/chat/ModelSelector.vue'
import PromptEditor from '@/components/chat/PromptEditor.vue'
import SettingsPanel from '@/components/chat/SettingsPanel.vue'
import ProviderSettings from '@/components/chat/ProviderSettings.vue'
import AssistantSettings from '@/components/chat/AssistantSettings.vue'
import ToastNotification from '@/components/chat/ToastNotification.vue'

const store = useChatStore()

function handleResize() {
  const { tabletBreakpoint, focusMode } = store
  if (window.innerWidth > tabletBreakpoint && !focusMode) {
    store.inspectorVisible = true
    store.inspectorOpen = false
  } else {
    store.inspectorVisible = false
  }
  if (window.innerWidth > store.mobileBreakpoint) {
    store.sidebarOpen = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey
  if (meta && e.key.toLowerCase() === 'k') { e.preventDefault(); store.modal = 'command' }
  if (meta && e.key.toLowerCase() === 'n') { e.preventDefault(); store.newConversation() }
  if (meta && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); store.toggleFocusMode() }
  if (e.key === 'Escape') { store.modal = ''; store.closeDrawers() }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', handleKeydown)
  // Initialize app data from IndexedDB
  store.initApp()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <ConfigProvider>
    <div
      class="app"
      :class="{
        'inspector-hidden': !store.inspectorVisible,
        'sidebar-open': store.sidebarOpen,
        'inspector-panel-open': store.inspectorOpen,
        'focus-mode': store.focusMode,
      }"
    >
      <div
        class="mobile-backdrop"
        :class="{ visible: store.sidebarOpen || store.inspectorOpen }"
        @click="store.closeDrawers()"
      />

      <ChatSidebar />
      <main class="main">
        <ChatTopbar />
        <ChatMessages />
        <ChatComposer />
      </main>
      <ChatInspector />

      <nav class="mobile-nav">
        <button class="active" @click="store.sidebarOpen = true">
          <Icon icon="tabler:messages" />
          对话
        </button>
        <button @click="store.modal = 'command'">
          <Icon icon="tabler:search" />
          搜索
        </button>
        <button @click="store.modal = 'command'">
          <Icon icon="tabler:folder-open" />
          文件
        </button>
        <button @click="store.inspectorOpen = true">
          <Icon icon="tabler:adjustments-horizontal" />
          会话
        </button>
      </nav>

      <div v-if="store.modal && store.modal !== 'provider' && store.modal !== 'settings' && store.modal !== 'assistant'" class="overlay" @click="store.modal = ''" />
      <CommandPalette v-if="store.modal === 'command'" />
      <ModelSelector v-if="store.modal === 'model'" />
      <PromptEditor v-if="store.modal === 'prompt'" />
      <SettingsPanel v-if="store.modal === 'settings'" />
      <ProviderSettings v-if="store.modal === 'provider'" />
      <AssistantSettings v-if="store.modal === 'assistant'" />
      <ToastNotification />
    </div>
  </ConfigProvider>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-columns: var(--sidebar) minmax(0, 1fr) var(--inspector);
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.app.inspector-hidden {
  grid-template-columns: var(--sidebar) minmax(0, 1fr);
}

.app.focus-mode {
  grid-template-columns: 0 minmax(0, 1fr);
}

.app.focus-mode .sidebar { display: none; }

.main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface);
}

.mobile-backdrop { display: none; }
.mobile-nav { display: none; }

.overlay {
  position: fixed;
  z-index: 70;
  inset: 0;
  background: color-mix(in srgb, var(--text) 34%, transparent);
  backdrop-filter: blur(2px);
}

@media (max-width: 1180px) {
  .app, .app.inspector-hidden {
    grid-template-columns: var(--sidebar) minmax(0, 1fr);
  }
  .app.focus-mode {
    grid-template-columns: 0 minmax(0, 1fr);
  }
  .mobile-backdrop.visible {
    position: fixed;
    z-index: 55;
    inset: 0;
    display: block;
    background: color-mix(in srgb, var(--text) 26%, transparent);
  }
}

@media (max-width: 760px) {
  .app, .app.inspector-hidden, .app.focus-mode {
    display: block;
  }
  .main {
    width: 100%;
    height: 100%;
    padding-bottom: var(--mobile-nav);
  }
  .mobile-nav {
    position: fixed;
    z-index: 25;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    height: calc(var(--mobile-nav) + env(safe-area-inset-bottom));
    grid-template-columns: repeat(4, 1fr);
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--surface);
    border-top: 1px solid var(--line);
  }
  .mobile-nav button {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: var(--faint);
    background: transparent;
    font-size: 9px;
  }
  .mobile-nav button.active { color: var(--brand); }
  .mobile-nav svg { width: 18px; }
}
</style>
