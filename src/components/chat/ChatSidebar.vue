<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'
import { Conversations } from 'vue-element-plus-x'
import { ElMessageBox } from 'element-plus'
import type { ConversationItem, ConversationMenuCommand } from 'vue-element-plus-x/types/Conversations'
import type { Chat } from '@/types'

interface ChatConversationItem extends ConversationItem {
  id: string
  data: Chat
  updatedAt: string
}

const store = useChatStore()
const appStore = useAppStore()
const uiStore = useUiStore()
const fileInput = ref<HTMLInputElement | null>(null)
const renamingId = ref<string | null>(null)
const renameValue = ref('')

function handleImport(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    store.importData(input.files[0])
    input.value = ''
  }
}

// Map store.chats → Conversations items
const conversationItems = computed<ConversationItem[]>(() =>
  store.chats.map(chat => ({
    id: chat.id,
    label: chat.title,
    group: appStore.settings.pinTopicsToTop && chat.pinned ? '置顶' : '最近',
    data: chat,
    updatedAt: chat.updatedAt,
  })),
)

// Active binding
const activeId = computed(() => store.activeChatId ?? '')

function handleChange(item: ConversationItem) {
  const id = (item as ChatConversationItem).id
  if (id) store.openConversation(id)
}

// Menu: pin/unpin, rename, clear messages, delete
function handleMenuCommand(command: ConversationMenuCommand, item: ConversationItem) {
  const ci = item as ChatConversationItem
  const chat = ci.data
  const id = chat?.id ?? ci.id
  if (!id) return

  switch (command) {
    case 'pin':
      store.togglePin(id)
      break
    case 'rename':
      renamingId.value = id
      renameValue.value = chat?.title ?? ci.label ?? ''
      break
    case 'clear':
      ElMessageBox.confirm('确定要清空此对话的所有消息吗？', '清空消息', {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        store.clearConversation(id)
      }).catch(() => {})
      break
    case 'delete': {
      const doDelete = () => store.deleteConversation(id)
      if (appStore.settings.confirmDeleteMessage) {
        ElMessageBox.confirm('确定要删除此对话吗？删除后不可恢复。', '删除对话', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(doDelete).catch(() => {})
      } else {
        doDelete()
      }
      break
    }
  }
}

function confirmRename() {
  if (renamingId.value && renameValue.value.trim()) {
    store.renameTopic?.(renamingId.value, renameValue.value.trim())
  }
  renamingId.value = null
}


</script>

<template>
  <aside class="sidebar" :class="{ open: uiStore.sidebarOpen }">
    <div class="brand">
      <div class="brand-mark">
        <Icon icon="tabler:rocket" width="17" />
      </div>
      <div class="brand-copy">
        <div class="brand-name">Orbit AI</div>
        <div class="brand-state">
          <span class="status-dot" />
          {{ uiStore.online ? '云端已同步' : '离线使用中' }}
        </div>
      </div>
      <button
        class="icon-btn tooltip desktop-only"
        data-tip="收起侧栏"
        @click="uiStore.focusMode = true"
      >
        <Icon icon="tabler:layout-sidebar-left-collapse" />
      </button>
      <button class="icon-btn mobile-only" @click="uiStore.sidebarOpen = false" title="关闭菜单" aria-label="关闭菜单">
        <Icon icon="tabler:x" />
      </button>
    </div>

    <div class="sidebar-actions">
      <button class="primary new-chat" @click="store.newConversation()" title="新建对话" aria-label="新建对话">
        <Icon icon="tabler:edit" width="15" />
        新建对话
      </button>
      <button class="search-trigger" @click="uiStore.modal = 'command'" title="搜索或执行命令" aria-label="搜索或执行命令">
        <Icon icon="tabler:search" />
        搜索或执行命令
        <span class="shortcut">⌘ K</span>
      </button>
      <div class="sidebar-data-actions">
        <button class="data-btn tooltip" data-tip="导入 Cherry Studio 数据" @click="fileInput?.click()">
          <Icon icon="tabler:upload" width="14" />
          导入
        </button>
        <button class="data-btn tooltip" data-tip="导出为 JSON 文件" @click="store.exportData()">
          <Icon icon="tabler:download" width="14" />
          导出
        </button>
        <button class="data-btn tooltip" data-tip="设置" @click="uiStore.modal = 'settings'">
          <Icon icon="tabler:settings" width="14" />
          设置
        </button>
        <input ref="fileInput" type="file" hidden accept=".json" @change="handleImport" />
      </div>
    </div>

    <div class="sidebar-scroll scroll">
      <div class="section-label assistant-section-label">
        <span>助手</span>
        <button class="assistant-add tooltip" data-tip="管理 Assistant" @click="uiStore.modal = 'assistant'">
          <Icon icon="tabler:plus" width="14" />
        </button>
      </div>
      <div class="assistant-tabs" role="tablist" aria-label="Assistant 会话筛选">
        <button
          v-for="assistant in store.assistantTabs"
          :key="assistant.id"
          class="assistant-tab"
          :class="{ active: store.activeAssistantId === assistant.id }"
          role="tab"
          :aria-selected="store.activeAssistantId === assistant.id"
          @click="store.selectAssistant(assistant.id)"
        >
          <span class="assistant-tab-emoji">{{ assistant.emoji || assistant.name.slice(0, 1) }}</span>
          <span class="assistant-tab-name">{{ assistant.name }}</span>
          <span class="assistant-tab-count">{{ store.assistantTopicCount(assistant.id) }}</span>
        </button>
      </div>

      <div class="section-label" style="margin-top:10px">会话</div>

      <!-- Rename overlay -->
      <div v-if="renamingId" class="rename-overlay" @click.stop>
        <input
          v-model="renameValue"
          class="rename-input"
          placeholder="输入新名称"
          @keydown.enter="confirmRename"
          @keydown.escape="renamingId = null"
          @blur="confirmRename"
        />
      </div>

      <Conversations
        :items="conversationItems"
        :active="activeId"
        :groupable="{ sort: (a: string, b: string) => (a === '置顶' ? -1 : b === '置顶' ? 1 : 0) }"
        row-key="id"
        label-key="label"
        @change="handleChange"
        @menu-command="handleMenuCommand"
        :items-style="{
          borderRadius: '6px',
          padding: '7px 8px',
          minHeight: '48px',
        }"
        :items-hover-style="{
          background: 'var(--surface-3)',
        }"
        :items-active-style="{
          color: 'var(--brand)',
          background: 'var(--brand-soft)',
        }"
        :style="{
          width: '100%',
          height: 'auto',
          padding: '0',
          background: 'transparent',
        }"
      >
        <!-- Custom label: title + preview (two lines) -->
        <template #label="{ item }">
          <div class="conv-label">
            <span class="conv-title">{{ (item as any).data?.title ?? item.label }}</span>
            <span class="conv-preview">{{ (item as any).data?.preview }}</span>
          </div>
        </template>

        <!-- Custom menu -->
        <template #menu="{ item, handleOpen }">
          <div class="conv-menu" @click.stop>
            <button class="menu-item" @click="handleMenuCommand('pin', item); handleOpen(false)">
              <Icon icon="tabler:pinned" width="13" />
              {{ (item as any).data?.pinned ? '取消置顶' : '置顶' }}
            </button>
            <button class="menu-item" @click="handleMenuCommand('rename', item); handleOpen(false)">
              <Icon icon="tabler:edit" width="13" />
              重命名
            </button>
            <button class="menu-item" @click="handleMenuCommand('clear', item); handleOpen(false)">
              <Icon icon="tabler:eraser" width="13" />
              清空消息
            </button>
            <button class="menu-item danger" @click="handleMenuCommand('delete', item); handleOpen(false)">
              <Icon icon="tabler:trash" width="13" />
              删除
            </button>
          </div>
        </template>
      </Conversations>
    </div>

    <button class="profile" @click="uiStore.showToast('账户菜单已打开')">
      <span class="avatar">林</span>
      <span class="profile-copy">
        <span class="profile-name">林晓舟</span>
        <span class="profile-plan">个人空间 · 免费计划</span>
      </span>
      <Icon icon="tabler:selector" width="15" />
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  z-index: 30;
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface-2);
  border-right: 1px solid var(--line);
}
.brand {
  display: flex;
  height: var(--header);
  flex: 0 0 var(--header);
  align-items: center;
  gap: 10px;
  padding: 0 14px;
}
.brand-mark {
  display: flex;
  width: 31px; height: 31px;
  flex: 0 0 31px;
  align-items: center;
  justify-content: center;
  color: white;
  background: var(--brand);
  border-radius: 7px;
}
.brand-mark :deep(svg) { width: 17px; height: 17px; }
.brand-copy { min-width: 0; flex: 1; }
.brand-name { font-size: 14px; font-weight: 750; color: var(--text); }
.brand-state { display: flex; align-items: center; gap: 5px; margin-top: 2px; color: var(--success); font-size: 10px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.sidebar-actions { padding: 7px 10px 10px; }
.sidebar-data-actions { display: flex; gap: 6px; margin-top: 8px; }
.data-btn {
  display: flex; flex: 1; height: 30px; align-items: center; justify-content: center; gap: 5px;
  color: var(--muted); background: var(--surface); border: 1px solid var(--line); border-radius: 5px;
  font-size: 11px; cursor: pointer; transition: border-color 140ms, color 140ms;
}
.data-btn:hover { color: var(--text); border-color: var(--brand); }
.data-btn :deep(svg) { width: 14px; height: 14px; }
.new-chat { width: 100%; }
.new-chat :deep(svg) { width: 15px; height: 15px; }
.search-trigger {
  display: flex; width: 100%; height: 36px; align-items: center; gap: 8px;
  margin-top: 8px; padding: 0 10px; color: var(--muted);
  background: var(--surface); border: 1px solid var(--line); border-radius: 6px;
  font-size: 12px; text-align: left;
}
.search-trigger :deep(svg) { width: 15px; height: 15px; }
.shortcut {
  margin-left: auto; padding: 2px 5px; color: var(--faint);
  background: var(--surface-3); border: 1px solid var(--line);
  border-radius: 4px; font-size: 10px;
}
.sidebar-scroll { min-height: 0; flex: 1; overflow-y: auto; padding: 3px 8px 12px; }
.section-label {
  display: flex; height: 28px; align-items: center; padding: 0 7px;
  color: var(--faint); font-size: 10px; font-weight: 700; text-transform: uppercase;
}
.assistant-section-label { justify-content: space-between; }
.assistant-add { display: inline-flex; width: 24px; height: 24px; align-items: center; justify-content: center; color: var(--muted); background: transparent; border: 0; border-radius: 4px; cursor: pointer; }
.assistant-add:hover { color: var(--brand); background: var(--brand-soft); }
.assistant-add :deep(svg) { width: 14px; height: 14px; }
.assistant-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; padding: 0 3px; }
.assistant-tab { display: flex; min-width: 0; height: 34px; align-items: center; gap: 5px; padding: 0 6px; color: var(--text-secondary); background: var(--surface); border: 1px solid var(--line); border-radius: 5px; font-size: 10px; text-align: left; cursor: pointer; }
.assistant-tab:hover { color: var(--text); border-color: var(--brand); }
.assistant-tab.active { color: var(--brand); background: var(--brand-soft); border-color: var(--brand); }
.assistant-tab-emoji { width: 16px; flex: 0 0 16px; overflow: hidden; text-align: center; font-size: 12px; }
.assistant-tab-name { min-width: 0; flex: 1; overflow: hidden; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.assistant-tab-count { color: var(--faint); font-size: 9px; font-variant-numeric: tabular-nums; }

/* Conversations component overrides */
.sidebar-scroll :deep(.el-conversations) {
  width: 100% !important;
}
.sidebar-scroll :deep(.el-conversations__list) {
  padding: 0 !important;
  background: transparent !important;
  height: auto !important;
  width: 100% !important;
}
.sidebar-scroll :deep(.el-conversations__scroll-wrapper) {
  padding-right: 2px;
}
.sidebar-scroll :deep(.el-scrollbar__view) {
  padding: 0 !important;
}
.sidebar-scroll :deep(.el-conversations__group-title) {
  color: var(--faint);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 6px 7px 4px;
}

/* Conversation item label */
.conv-label {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  gap: 2px;
}
.conv-title {
  display: block;
  overflow: hidden;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
}
.conv-preview {
  display: block;
  overflow: hidden;
  color: var(--faint);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Custom menu */
.conv-menu {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 120px;
  padding: 4px;
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  box-shadow: var(--shadow-md);
}
.menu-item {
  display: flex; width: 100%; align-items: center; gap: 7px; padding: 6px 8px; color: var(--text-secondary); background: transparent; border: 0; border-radius: 4px; font-size: 11px; text-align: left; cursor: pointer;
}
.menu-item:hover { color: var(--text); background: var(--surface-3); }
.menu-item :deep(svg) { width: 13px; height: 13px; }
.menu-item.danger { color: var(--danger); }
.menu-item.danger:hover { background: color-mix(in srgb, var(--danger) 10%, transparent); }

/* Rename overlay */
.rename-overlay {
  padding: 4px 8px;
  margin-bottom: 4px;
}
.rename-input {
  width: 100%;
  padding: 4px 6px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--brand);
  border-radius: 4px;
  font-size: 12px;
  outline: 0;
}

.profile {
  display: flex; height: 58px; flex: 0 0 58px; align-items: center; gap: 9px;
  padding: 0 12px; background: var(--surface); border-top: 1px solid var(--line); text-align: left;
}
.avatar { display: flex; width: 30px; height: 30px; flex: 0 0 30px; align-items: center; justify-content: center; color: var(--brand); background: var(--brand-soft); border-radius: 50%; font-size: 11px; font-weight: 750; }
.profile-copy { min-width: 0; flex: 1; }
.profile-name { font-size: 12px; font-weight: 650; }
.profile-plan { margin-top: 2px; color: var(--faint); font-size: 10px; }

.profile :deep(svg) { width: 15px; height: 15px; }

.icon-btn {
  display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px;
  align-items: center; justify-content: center; border-radius: 6px;
  color: var(--muted); background: transparent; border: 0; cursor: pointer;
  transition: background 140ms, color 140ms;
}
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn.active { color: var(--brand); background: var(--brand-soft); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }
.mobile-only { display: none; }

.primary {
  display: inline-flex; min-height: 36px; align-items: center; justify-content: center;
  gap: 7px; padding: 0 13px; color: white; background: var(--brand); border-radius: 6px;
  font-size: 13px; font-weight: 650; border: 0; cursor: pointer;
}
.primary:hover { background: var(--brand-hover); }

@media (max-width: 760px) {
  .sidebar {
    position: fixed; top: 0; bottom: 0; left: 0;
    width: min(290px, calc(100vw - 44px));
    box-shadow: 14px 0 40px rgba(16, 24, 40, 0.16);
    transform: translateX(-105%);
    transition: transform 180ms ease;
  }
  .sidebar.open { transform: translateX(0); }
  .mobile-only { display: inline-flex; }
  .desktop-only { display: none !important; }
}
</style>
