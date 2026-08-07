<!--
  Orbit 侧栏：品牌 + 新建/搜索 + workspace + chats + profile
  移植自 chat.html 的 .sidebar
-->
<script setup lang="ts">
import type { OrbitState } from './useOrbitState';
import SvgIcon from '@/components/SvgIcon/index.vue';

const props = defineProps<{
  state: OrbitState;
}>();

const { state } = props;
</script>

<template>
  <aside class="orbit-sidebar" :class="{ 'orbit-sidebar-open': state.sidebarOpen.value }">
    <!-- 品牌区 -->
    <div class="orbit-brand">
      <div class="orbit-brand-mark">O</div>
      <div class="orbit-brand-copy">
        <div class="orbit-brand-name">Orbit AI</div>
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
        <span class="orbit-shortcut">⌘K</span>
      </button>
    </div>

    <!-- 滚动列表 -->
    <div class="orbit-sidebar-scroll orbit-scroll">
      <!-- 工作区 -->
      <div class="orbit-section">
        <div class="orbit-section-label">工作区</div>
        <button
          v-for="ws in state.workspaces.value"
          :key="ws.id"
          class="orbit-workspace-row"
        >
          <span class="orbit-workspace-dot" :style="{ background: ws.color }" />
          <span class="orbit-workspace-name">{{ ws.name }}</span>
          <span class="orbit-workspace-count">{{ ws.count }}</span>
        </button>
      </div>

      <!-- 最近对话 -->
      <div class="orbit-section">
        <div class="orbit-section-label">最近对话</div>
        <button
          v-for="chat in state.chats.value"
          :key="chat.id"
          class="orbit-chat-row"
          :class="{ active: chat.id === state.activeChatId.value }"
          @click="state.openConversation(chat.id)"
        >
          <svg
            v-if="chat.pinned"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="orbit-chat-pin"
          >
            <path d="M16 2l-2 5h-3l-1 2 4 4-2 4 3 3 1-2 4 1-1-4 3-3-4-2-1-3-4 2-1-3z" />
          </svg>
          <div class="orbit-chat-text">
            <div class="orbit-chat-title">{{ chat.title }}</div>
            <div class="orbit-chat-preview">{{ chat.preview }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Profile -->
    <div class="orbit-profile">
      <div class="orbit-avatar">林</div>
      <div class="orbit-profile-info">
        <div class="orbit-profile-name">林晓舟</div>
        <div class="orbit-profile-plan">个人空间 · 免费计划</div>
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

// —— 品牌 ——
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

  &.offline {
    background: var(--warning);
  }
}

// —— 操作区 ——
.orbit-sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 3px 12px 8px;
}
.orbit-new-chat {
  gap: 8px;
  font-weight: 600;

  svg {
    width: 16px;
    height: 16px;
  }
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

  svg {
    width: 15px;
    height: 15px;
  }

  span:first-of-type {
    flex: 1;
    text-align: left;
  }

  &:hover {
    background: var(--surface-3);
  }
}
.orbit-shortcut {
  padding: 1px 6px;
  font-size: 10px;
  color: var(--muted);
  background: var(--surface-3);
  border-radius: 4px;
}

// —— 滚动列表 ——
.orbit-sidebar-scroll {
  flex: 1;
  padding: 3px 8px 12px;
  overflow-y: auto;
}
.orbit-section {
  margin-bottom: 8px;
}
.orbit-section-label {
  height: 28px;
  padding: 6px 12px 0;
  font-size: 10px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

// —— 工作区 ——
.orbit-workspace-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 34px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  text-align: left;
  border-radius: var(--orbit-radius-base);
  transition: background 0.15s;

  &:hover {
    background: var(--surface-3);
  }
}
.orbit-workspace-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.orbit-workspace-name {
  flex: 1;
}
.orbit-workspace-count {
  font-size: 11px;
  color: var(--faint);
}

// —— 对话 ——
.orbit-chat-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  min-height: 48px;
  padding: 7px 8px;
  text-align: left;
  border-radius: var(--orbit-radius-base);
  transition: background 0.15s;

  &:hover {
    background: var(--surface-3);
  }

  &.active {
    background: var(--brand-soft);

    .orbit-chat-title {
      color: var(--brand-strong);
    }
  }
}
.orbit-chat-pin {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--brand);
}
.orbit-chat-text {
  flex: 1;
  min-width: 0;
}
.orbit-chat-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.orbit-chat-preview {
  margin-top: 2px;
  font-size: 10px;
  color: var(--faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// —— Profile ——
.orbit-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 58px;
  padding: 0 14px;
  background: var(--surface);
  border-top: 1px solid var(--line);
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

// —— 移动端 ——
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

    &.orbit-sidebar-open {
      transform: translateX(0);
    }
  }
}
</style>