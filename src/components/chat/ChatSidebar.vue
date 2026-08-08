<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { Icon } from '@iconify/vue'

const store = useChatStore()
</script>

<template>
  <aside class="sidebar" :class="{ open: store.sidebarOpen }">
    <div class="brand">
      <div class="brand-mark">
        <Icon icon="tabler:rocket" width="17" />
      </div>
      <div class="brand-copy">
        <div class="brand-name">Orbit AI</div>
        <div class="brand-state">
          <span class="status-dot" />
          {{ store.online ? '云端已同步' : '离线使用中' }}
        </div>
      </div>
      <button
        class="icon-btn tooltip desktop-only"
        data-tip="收起侧栏"
        @click="store.focusMode = true"
      >
        <Icon icon="tabler:layout-sidebar-left-collapse" />
      </button>
      <button class="icon-btn mobile-only" @click="store.sidebarOpen = false">
        <Icon icon="tabler:x" />
      </button>
    </div>

    <div class="sidebar-actions">
      <button class="primary new-chat" @click="store.newConversation()">
        <Icon icon="tabler:edit" width="15" />
        新建对话
      </button>
      <button class="search-trigger" @click="store.modal = 'command'">
        <Icon icon="tabler:search" />
        搜索或执行命令
        <span class="shortcut">⌘ K</span>
      </button>
    </div>

    <div class="sidebar-scroll scroll">
      <div class="section-label">工作区</div>
      <button
        v-for="ws in store.workspaces"
        :key="ws.id"
        class="workspace-row"
      >
        <span class="workspace-dot" :style="{ backgroundColor: ws.color }" />
        <span>{{ ws.name }}</span>
        <span class="workspace-count">{{ ws.count }}</span>
      </button>

      <div class="section-label" style="margin-top:10px">最近对话</div>
      <button
        v-for="chat in store.chats"
        :key="chat.id"
        class="chat-row"
        :class="{ active: store.activeChatId === chat.id }"
        @click="store.openConversation(chat.id)"
      >
        <Icon
          :icon="chat.pinned ? 'tabler:pin' : 'tabler:message'"
          class="chat-icon"
        />
        <span class="chat-copy">
          <span class="chat-title">{{ chat.title }}</span>
          <span class="chat-preview">{{ chat.preview }}</span>
        </span>
      </button>
    </div>

    <button class="profile" @click="store.showToast('账户菜单已打开')">
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
.brand-copy { min-width: 0; flex: 1; }
.brand-name { font-size: 14px; font-weight: 750; color: var(--text); }
.brand-state { display: flex; align-items: center; gap: 5px; margin-top: 2px; color: var(--success); font-size: 10px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.sidebar-actions { padding: 7px 10px 10px; }
.new-chat { width: 100%; }
.search-trigger {
  display: flex; width: 100%; height: 36px; align-items: center; gap: 8px;
  margin-top: 8px; padding: 0 10px; color: var(--muted);
  background: var(--surface); border: 1px solid var(--line); border-radius: 6px;
  font-size: 12px; text-align: left;
}
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
.workspace-row, .chat-row {
  display: flex; width: 100%; min-width: 0; align-items: center; gap: 8px;
  color: var(--text-secondary); background: transparent; border-radius: 6px; text-align: left;
}
.workspace-row { height: 34px; padding: 0 8px; font-size: 12px; }
.workspace-row:hover, .chat-row:hover { background: var(--surface-3); }
.workspace-dot { width: 8px; height: 8px; border-radius: 2px; }
.workspace-count { margin-left: auto; color: var(--faint); font-size: 10px; }
.chat-row { min-height: 48px; padding: 7px 8px; }
.chat-row.active { color: var(--brand); background: var(--brand-soft); }
.chat-icon { width: 16px; flex: 0 0 16px; color: var(--faint); }
.chat-copy { min-width: 0; flex: 1; }
.chat-title { display: block; overflow: hidden; font-size: 12px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; color: var(--text); }
.chat-preview { display: block; overflow: hidden; margin-top: 3px; color: var(--faint); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.profile {
  display: flex; height: 58px; flex: 0 0 58px; align-items: center; gap: 9px;
  padding: 0 12px; background: var(--surface); border-top: 1px solid var(--line); text-align: left;
}
.avatar { display: flex; width: 30px; height: 30px; flex: 0 0 30px; align-items: center; justify-content: center; color: var(--brand); background: var(--brand-soft); border-radius: 50%; font-size: 11px; font-weight: 750; }
.profile-copy { min-width: 0; flex: 1; }
.profile-name { font-size: 12px; font-weight: 650; }
.profile-plan { margin-top: 2px; color: var(--faint); font-size: 10px; }

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
