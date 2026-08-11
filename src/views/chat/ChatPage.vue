<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useUiStore } from '@/stores/ui'
import { useSearchStore } from '@/stores/search'
import { useKeyboardShortcuts } from '@/composables/useKeyboard'
import { ConfigProvider } from 'vue-element-plus-x'
import { Icon } from '@iconify/vue'
import AppRail from '@/components/chat/AppRail.vue'
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
import SearchView from '@/components/chat/SearchView.vue'
import SettingsView from '@/components/chat/SettingsView.vue'

type AppView = 'chat' | 'search' | 'settings'

const route = useRoute()
const store = useChatStore()
const uiStore = useUiStore()
const searchStore = useSearchStore()

const defaultView = (route.meta?.defaultView as AppView | undefined) ?? 'chat'
const activeView = ref<AppView>(defaultView)
const { handleKeydown } = useKeyboardShortcuts(uiStore, { newConversation: store.newConversation })
const handleResize = () => uiStore.handleResize()

function switchView(view: AppView) {
  activeView.value = view
  if (view !== 'chat') {
    uiStore.closeDrawers()
  }
}

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', handleKeydown)
  await store.initApp()
  // Rebuild search index after app data loads
  if (!searchStore.indexReady) {
    searchStore.rebuild()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <ConfigProvider>
    <div class="app-root" :class="{ dark: false }">
      <!-- ═══ Mobile header (≤760px) ═══ -->
      <header class="mobile-header">
        <button @click="uiStore.sidebarOpen = true" title="打开菜单" aria-label="打开菜单">
          <Icon icon="tabler:menu" :size="21" />
        </button>
        <div class="mobile-brand">
          <div class="mobile-brand-icon">
            <Icon icon="tabler:rocket" :size="16" />
          </div>
          Orbit Chat
        </div>
        <button @click="uiStore.modal = 'command'" title="命令面板" aria-label="命令面板">
          <Icon icon="tabler:command" :size="20" />
        </button>
      </header>

      <!-- ═══ Main flex row: rail + sidebar + content + inspector ═══ -->
      <div class="app-body">
        <!-- Desktop rail (68px, md+ only) -->
        <AppRail :view="activeView" @update:view="switchView" />

        <!-- Chat view -->
        <template v-if="activeView === 'chat'">
          <!-- Mobile sidebar backdrop -->
          <div
            v-if="uiStore.sidebarOpen"
            class="mobile-backdrop"
            @click="uiStore.sidebarOpen = false"
          />

          <!-- Chat sidebar -->
          <ChatSidebar />

          <!-- Main chat area -->
          <main class="chat-main">
            <ChatTopbar />
            <ChatMessages />
            <ChatComposer />
          </main>

          <!-- Inspector backdrop (tablet/mobile drawer) -->
          <div
            v-if="uiStore.inspectorOpen"
            class="inspector-backdrop"
            @click="uiStore.closeInspector()"
          />

          <!-- Inspector (xl+ only, drawer on tablet/mobile) -->
          <ChatInspector />
        </template>

        <!-- Search view -->
        <template v-else-if="activeView === 'search'">
          <main class="full-view">
            <SearchView @switch-view="switchView" />
          </main>
        </template>

        <!-- Settings view -->
        <template v-else-if="activeView === 'settings'">
          <main class="full-view">
            <SettingsView @switch-view="switchView" />
          </main>
        </template>
      </div>

      <!-- ═══ Mobile bottom nav (≤760px) ═══ -->
      <nav class="mobile-nav">
        <button :class="{ active: activeView === 'chat' }" @click="switchView('chat')">
          <Icon icon="tabler:message-circle" :size="19" />
          <span>对话</span>
        </button>
        <button :class="{ active: activeView === 'search' }" @click="switchView('search')">
          <Icon icon="tabler:search" :size="19" />
          <span>搜索</span>
        </button>
        <button @click="uiStore.sidebarOpen = !uiStore.sidebarOpen">
          <Icon icon="tabler:folder" :size="19" />
          <span>文件</span>
        </button>
        <button @click="uiStore.sidebarOpen = !uiStore.sidebarOpen">
          <Icon icon="tabler:history" :size="19" />
          <span>会话</span>
        </button>
      </nav>

      <!-- ═══ Modals & overlays ═══ -->
      <div
        v-if="uiStore.modal && !['provider', 'settings', 'assistant'].includes(uiStore.modal)"
        class="overlay"
        @click="uiStore.modal = ''"
      />
      <CommandPalette v-if="uiStore.modal === 'command'" />
      <ModelSelector v-if="uiStore.modal === 'model'" />
      <PromptEditor v-if="uiStore.modal === 'prompt'" />
      <SettingsPanel v-if="uiStore.modal === 'settings'" />
      <ProviderSettings v-if="uiStore.modal === 'provider'" />
      <AssistantSettings v-if="uiStore.modal === 'assistant'" />
      <ToastNotification />
    </div>
  </ConfigProvider>
</template>

<style scoped>
/* ═══ Root: full viewport, column on mobile, row on desktop ═══ */
.app-root {
  display: flex;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: var(--surface-2);
}

/* ═══ App body: horizontal flex (rail + sidebar + main + inspector) ═══ */
.app-body {
  display: flex;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

/* ═══ Chat main area ═══ */
.chat-main {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface);
}

/* ═══ Full-width view (search/settings) ═══ */
.full-view {
  display: flex;
  min-width: 0;
  flex: 1;
  overflow-y: auto;
  background: var(--surface-2);
}

/* ═══ Overlay ═══ */
.overlay {
  position: fixed;
  z-index: var(--z-overlay);
  inset: 0;
  background: color-mix(in srgb, var(--text) 34%, transparent);
  backdrop-filter: blur(2px);
}

/* ═══ Mobile-only elements (hidden on desktop) ═══ */
.mobile-header { display: none; }
.mobile-backdrop { display: none; }
.inspector-backdrop { display: none; }
.mobile-nav { display: none; }

/* ═══ Responsive: tablet (761–1180px) — inspector drawer backdrop ═══ */
@media (max-width: 1180px) {
  .inspector-backdrop {
    position: fixed;
    z-index: 50;
    inset: 0;
    display: block;
    background: color-mix(in srgb, var(--text) 26%, transparent);
  }
}

/* ═══ Responsive: mobile layout (≤760px) ═══ */
@media (max-width: 760px) {
  .app-root {
    flex-direction: column;
  }

  /* Mobile header */
  .mobile-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 30;
    display: flex;
    height: 56px;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: var(--surface);
    border-bottom: 1px solid var(--line);
  }

  .mobile-header button {
    display: flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    color: var(--muted);
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
  }

  .mobile-brand-icon {
    display: flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
    color: white;
    background: var(--brand);
    border-radius: 8px;
  }

  /* App body starts below header, above bottom nav */
  .app-body {
    padding-top: 56px;
    padding-bottom: 58px;
  }

  /* Mobile sidebar backdrop */
  .mobile-backdrop {
    position: fixed;
    z-index: 40;
    inset: 0;
    display: block;
    background: color-mix(in srgb, var(--text) 26%, transparent);
  }

  /* Mobile bottom nav */
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 30;
    display: grid;
    height: 58px;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    background: var(--surface);
    border-top: 1px solid var(--line);
  }

  .mobile-nav button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: var(--muted);
    background: transparent;
    border: 0;
    font-size: 10px;
    cursor: pointer;
  }

  .mobile-nav button.active {
    color: var(--brand);
  }
}
</style>
