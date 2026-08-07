<!--
  Orbit 侧栏：品牌 + 排序/归档切换 + Conversations（Element-Plus-X） + 标签/批量操作 + profile
-->
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { OrbitState } from './useOrbitState';
import { Conversations } from 'vue-element-plus-x';
import SvgIcon from '@/components/SvgIcon/index.vue';

const props = defineProps<{
  state: OrbitState;
}>();

const { state } = props;

// —— 标签编辑器 ——
const tagEditorChatId = ref<string | null>(null);
const tagDraft = ref<string[]>([]);
const PRESET_TAGS = ['工作', '个人', '学习', '项目'];
const TAG_COLORS: Record<string, string> = {
  '工作': '#1890ff',
  '个人': '#52c41a',
  '学习': '#722ed1',
  '项目': '#fa8c16',
};

function openTagEditor(id: string) {
  const chat = state.chats.value.find(c => c.id === id);
  tagEditorChatId.value = id;
  tagDraft.value = [...(chat?.tags || [])];
}

function toggleTag(tag: string) {
  const idx = tagDraft.value.indexOf(tag);
  if (idx === -1) {
    tagDraft.value.push(tag);
  } else {
    tagDraft.value.splice(idx, 1);
  }
}

function confirmTags() {
  if (tagEditorChatId.value) {
    state.editChatTags(tagEditorChatId.value, [...tagDraft.value]);
  }
  tagEditorChatId.value = null;
  tagDraft.value = [];
}

function cancelTags() {
  tagEditorChatId.value = null;
  tagDraft.value = [];
}

function getTagColor(tag: string) {
  return TAG_COLORS[tag] || 'var(--muted)';
}

// —— 菜单 ——
const menuItems = [
  { key: 'pin', label: '置顶' },
  { key: 'favorite', label: '收藏' },
  { key: 'tags', label: '管理标签' },
  { key: 'archive', label: '归档' },
  { key: 'delete', label: '删除' },
];

function handleMenuCommand({ key, item }: { key: string; item: any }) {
  const id = item.key || item.id;
  if (!id) return;
  const chat = state.chats.value.find(c => c.id === id);

  switch (key) {
    case 'pin':
      state.pinChat(id);
      break;
    case 'favorite':
      state.favoriteChat(id);
      break;
    case 'tags':
      openTagEditor(id);
      break;
    case 'archive':
      if (chat?.archived) {
        state.unarchiveChat(id);
      } else {
        state.archiveChat(id);
      }
      break;
    case 'delete':
      state.deleteChatTopic(id);
      break;
  }
}

function handleSelect(id: string | number) {
  if (state.batchMode.value) {
    state.toggleSelectChat(String(id));
  } else {
    state.openConversation(String(id));
  }
}
</script>

<template>
  <aside class="orbit-sidebar" :class="{ 'orbit-sidebar-open': state.sidebarOpen.value }">
    <!-- 品牌区 -->
    <div class="orbit-brand">
      <div class="orbit-brand-mark">O</div>
      <div class="orbit-brand-copy">
        <div class="orbit-brand-name">Orbita AI</div>
        <div class="orbit-brand-state">
          <span class="orbit-status-dot" :class="{ offline: !state.online.value }" />
          {{ state.online.value ? '云端已同步' : '离线使用中' }}
        </div>
      </div>
      <button class="icon-btn tooltip ml-auto" data-tip="关闭侧栏">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M11 19l-7-7 7-7M21 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- 顶部操作 -->
    <div class="orbit-sidebar-actions">
      <button class="primary w-full orbit-new-chat" @click="state.newConversation()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>新建对话</span>
      </button>
      <button class="orbit-search-trigger" @click="state.openCommand()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span>搜索或执行命令</span>
        <span class="orbit-shortcut">Cmd K</span>
      </button>
    </div>

    <!-- 排序 & 归档切换 -->
    <div class="orbit-sidebar-toolbar">
      <div class="orbit-sort-wrap">
        <select
          class="orbit-sort-select"
          :value="state.sortBy.value"
          @change="state.setSortBy(($event.target as HTMLSelectElement).value as any)"
        >
          <option value="updated">最近更新</option>
          <option value="created">创建时间</option>
          <option value="title">标题</option>
        </select>
      </div>
      <button
        class="orbit-archive-toggle"
        :class="{ active: state.showArchived.value }"
        @click="state.toggleShowArchived()"
        title="已归档"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M21 8v13H3V8M23 3H1v5h22V3zM10 12h4" />
        </svg>
      </button>
      <button
        class="orbit-batch-toggle"
        :class="{ active: state.batchMode.value }"
        @click="state.toggleBatchMode()"
        title="批量操作"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      </button>
    </div>

    <!-- Conversations 组件 -->
    <div class="orbit-sidebar-scroll">
      <!-- 批量模式 -->
      <template v-if="state.batchMode.value">
        <div
          v-for="item in state.conversationItems.value"
          :key="item.key"
          class="orbit-chat-item batch-item"
          :class="{ selected: state.selectedChatIds.value.has(item.key) }"
          @click="state.toggleSelectChat(item.key)"
        >
          <span class="batch-checkbox" :class="{ checked: state.selectedChatIds.value.has(item.key) }">
            <svg v-if="state.selectedChatIds.value.has(item.key)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <div class="orbit-chat-item-icon" :style="{ color: (item as any).color || 'var(--muted)' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div class="orbit-chat-item-body">
            <div class="orbit-chat-item-title">
              <svg v-if="item.favorite" class="orbit-star-icon" viewBox="0 0 24 24" fill="var(--warning)" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {{ item.label }}
            </div>
            <div class="orbit-chat-item-desc">{{ item.description }}</div>
            <div class="orbit-chat-item-tags" v-if="item.tags?.length">
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="orbit-tag-chip"
                :style="{ '--tag-color': getTagColor(tag) }"
              >{{ tag }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 正常模式 -->
      <Conversations
        v-else
        :items="state.conversationItems.value"
        :active-key="state.activeChatId.value"
        :menu-items="menuItems"
        @select="handleSelect"
        @menu-command="handleMenuCommand"
      />

      <!-- 空态 -->
      <div v-if="!state.batchMode.value && state.conversationItems.value.length === 0" class="orbit-sidebar-empty">
        暂无对话
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="state.batchMode.value" class="orbit-batch-bar">
      <button class="orbit-batch-cancel" @click="state.toggleBatchMode()">取消</button>
      <span class="orbit-batch-count">已选 {{ state.selectedChatIds.value.size }}</span>
      <button
        class="orbit-batch-delete"
        :disabled="state.selectedChatIds.value.size === 0"
        @click="state.batchDeleteChats()"
      >
        删除所选
      </button>
    </div>

    <!-- 标签编辑弹窗 -->
    <div v-if="tagEditorChatId" class="orbit-tag-overlay" @click.self="cancelTags">
      <div class="orbit-tag-editor">
        <div class="orbit-tag-editor-title">管理标签</div>
        <div class="orbit-tag-editor-presets">
          <span
            v-for="tag in PRESET_TAGS"
            :key="tag"
            class="orbit-tag-chip orbit-tag-chip--editable"
            :class="{ active: tagDraft.includes(tag) }"
            :style="{ '--tag-color': getTagColor(tag) }"
            @click="toggleTag(tag)"
          >{{ tag }}</span>
        </div>
        <div class="orbit-tag-editor-actions">
          <button class="orbit-tag-btn orbit-tag-btn--cancel" @click="cancelTags">取消</button>
          <button class="orbit-tag-btn orbit-tag-btn--confirm" @click="confirmTags">确定</button>
        </div>
      </div>
    </div>

    <!-- Profile -->
    <div class="orbit-profile">
      <div class="orbit-avatar">我</div>
      <div class="orbit-profile-info">
        <div class="orbit-profile-name">个人空间</div>
        <div class="orbit-profile-plan">Orbita AI</div>
      </div>
      <SvgIcon name="expand-up-down-line" size="14" class="orbit-profile-icon" />
    </div>
  </aside>
</template>

<style scoped lang="scss">
.orbit-sidebar {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: var(--sidebar);
  height: 100%;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--line);
  transition: transform 0.3s;
}

.orbit-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--header);
  padding: 0 14px;
  flex-shrink: 0;
}
.orbit-brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 31px;
  height: 31px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: var(--brand);
  border-radius: 7px;
}
.orbit-brand-copy {
  flex: 1;
  min-width: 0;
}
.orbit-brand-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}
.orbit-brand-state {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--success);
}
.orbit-status-dot {
  width: 6px;
  height: 6px;
  background: var(--success);
  border-radius: 50%;
  &.offline { background: var(--warning); }
}

.orbit-sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 3px 12px 8px;
}
.orbit-new-chat {
  gap: 8px;
  font-weight: 600;
  svg { width: 16px; height: 16px; }
}
.orbit-search-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 36px;
  padding: 0 12px;
  font-size: 12px;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--orbit-radius-base);
  svg { width: 15px; height: 15px; }
  span:first-of-type { flex: 1; text-align: left; }
  &:hover { background: var(--surface-3); }
}
.orbit-shortcut {
  padding: 1px 6px;
  font-size: 10px;
  color: var(--muted);
  background: var(--surface-3);
  border-radius: 4px;
}

// 排序 / 归档 / 批量 工具栏
.orbit-sidebar-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px 6px;
}
.orbit-sort-wrap {
  flex: 1;
}
.orbit-sort-select {
  width: 100%;
  height: 28px;
  padding: 0 6px;
  font-size: 11px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 6px;
  outline: none;
  cursor: pointer;
}
.orbit-archive-toggle,
.orbit-batch-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  svg { width: 15px; height: 15px; }
  &:hover { background: var(--surface-3); }
  &.active {
    color: var(--brand);
    background: var(--surface-3);
    border-color: var(--line);
  }
}

// 会话滚动
.orbit-sidebar-scroll {
  flex: 1;
  padding: 3px 8px 12px;
  overflow-y: auto;
}
.orbit-sidebar-empty {
  padding: 24px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--faint);
}

// 批量模式 - 自定义列表项
.batch-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: var(--surface-3); }
  &.selected { background: var(--surface-3); }
}
.batch-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  border: 2px solid var(--line);
  border-radius: 5px;
  flex-shrink: 0;
  svg { width: 14px; height: 14px; color: var(--brand); }
  &.checked {
    border-color: var(--brand);
    background: var(--brand);
  }
}
.orbit-chat-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: color-mix(in srgb, currentColor 10%, transparent);
  flex-shrink: 0;
  svg { width: 15px; height: 15px; }
}
.orbit-chat-item-body {
  flex: 1;
  min-width: 0;
}
.orbit-chat-item-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.orbit-star-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}
.orbit-chat-item-desc {
  margin-top: 2px;
  font-size: 11px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.orbit-chat-item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

// 标签芯片
.orbit-tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 500;
  color: var(--tag-color, var(--brand));
  background: color-mix(in srgb, var(--tag-color, var(--brand)) 12%, transparent);
  border-radius: 4px;
  line-height: 1.5;
}

// 标签编辑器
.orbit-tag-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}
.orbit-tag-editor {
  width: 260px;
  padding: 18px;
  background: var(--surface);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
.orbit-tag-editor-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}
.orbit-tag-editor-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.orbit-tag-chip--editable {
  cursor: pointer;
  padding: 4px 10px;
  font-size: 12px;
  border: 1.5px solid transparent;
  border-radius: 6px;
  transition: border-color 0.15s;
  &:hover { border-color: var(--tag-color, var(--brand)); }
  &.active {
    border-color: var(--tag-color, var(--brand));
    background: color-mix(in srgb, var(--tag-color, var(--brand)) 22%, transparent);
  }
}
.orbit-tag-editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.orbit-tag-btn {
  padding: 5px 14px;
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
}
.orbit-tag-btn--cancel {
  color: var(--muted);
  background: var(--surface-3);
}
.orbit-tag-btn--confirm {
  color: #fff;
  background: var(--brand);
}

// 批量操作栏
.orbit-batch-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--surface);
  border-top: 1px solid var(--line);
  flex-shrink: 0;
}
.orbit-batch-cancel {
  font-size: 12px;
  color: var(--muted);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  &:hover { background: var(--surface-3); }
}
.orbit-batch-count {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: var(--text);
}
.orbit-batch-delete {
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: var(--danger, #e53935);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// Profile
.orbit-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 58px;
  padding: 0 14px;
  background: var(--surface);
  border-top: 1px solid var(--line);
  flex-shrink: 0;
}
.orbit-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 12px;
  font-weight: 700;
  color: var(--orbit-avatar-color);
  background: var(--orbit-avatar-bg);
  border-radius: 50%;
}
.orbit-profile-info {
  flex: 1;
  min-width: 0;
}
.orbit-profile-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}
.orbit-profile-plan {
  font-size: 10px;
  color: var(--faint);
}
.orbit-profile-icon {
  color: var(--faint);
}

@media (max-width: 760px) {
  .orbit-sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 60;
    width: min(290px, calc(100vw - 44px));
    transform: translateX(-105%);
    box-shadow: 12px 0 40px rgba(16, 24, 40, 0.06);
    &.orbit-sidebar-open { transform: translateX(0); }
  }
}
</style>
