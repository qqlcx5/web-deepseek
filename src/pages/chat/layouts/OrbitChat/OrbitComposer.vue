<!--
  Orbit 输入区：基于 Element-Plus-X Sender
  - reply-context
  - attachments
  - textarea
  - 工具栏 + 上下文 + 提示 + 发送
-->
<script setup lang="ts">
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';
import type { OrbitState } from './useOrbitState';
import { Attachments, Sender } from 'vue-element-plus-x';

const props = defineProps<{ state: OrbitState }>();
const { state } = props;
const senderRef = ref<any>(null);

const fileItems = computed(
  () =>
    state.attachments.value.map((a) => ({
      uid: String(a.id),
      name: a.name,
      fileSize: 0,
      showDelIcon: true,
    })) as unknown as FilesCardProps[],
);

function handleDeleteCard(_item: FilesCardProps, idx: number) {
  const target = state.attachments.value[idx];
  if (target) state.removeAttachment(target.id);
}

function handleSubmit() {
  state.sendMessage();
}

function handleCancel() {
  state.stopGeneration();
}
</script>

<template>
  <div class="orbit-composer-wrap">
    <!-- reply context -->
    <div v-if="state.replyingTo.value" class="orbit-reply-context">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="6" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M6 8v8M8 18h8" />
      </svg>
      <span>正在从「{{ state.replyingTo.value }}」创建新分支</span>
      <button class="orbit-reply-close" @click="state.replyingTo.value = ''">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="orbit-composer">
      <!-- attachments -->
      <div v-if="fileItems.length" class="orbit-attachments">
        <Attachments :items="fileItems" :hide-upload="true" @delete-card="handleDeleteCard" />
      </div>

      <!-- Sender -->
      <Sender
        ref="senderRef"
        v-model="state.draft.value"
        class="orbit-sender"
        :auto-size="{ minRows: 2, maxRows: 9 }"
        variant="updown"
        clearable
        :loading="state.generating.value"
        :placeholder="'输入消息或粘贴图片和文件'"
        @submit="handleSubmit"
        @cancel="handleCancel"
      >
        <template #prefix>
          <div class="orbit-prefix-tools">
            <label class="orbit-icon-btn tooltip" data-tip="附件">
              <input
                type="file"
                multiple
                class="orbit-hidden-input"
                @change="(e: any) => state.addFiles(e.target.files)"
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M21.4 11.6 12 21l-9-9 9.4-9.4a4 4 0 0 1 5.6 5.6l-9 9a2 2 0 0 1-2.8-2.8l8.5-8.5" />
              </svg>
            </label>
            <label class="orbit-icon-btn tooltip" data-tip="图片">
              <input
                type="file"
                accept="image/*"
                multiple
                class="orbit-hidden-input"
                @change="(e: any) => state.addFiles(e.target.files)"
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </label>
          </div>
        </template>
      </Sender>

      <!-- toolbar -->
      <div class="orbit-toolbar">
        <span class="orbit-context-chip tooltip" data-tip="上下文用量 38%">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
            <path d="M3 12h18" />
          </svg>
          <span>上下文 38%</span>
        </span>
        <span class="orbit-toolbar-spacer" />
        <span class="orbit-composer-hint">Enter 发送 · Shift+Enter 换行</span>
        <button
          class="orbit-send-btn"
          :disabled="!state.canSend.value && !state.generating.value"
          @click="state.generating.value ? state.stopGeneration() : state.sendMessage()"
        >
          <svg v-if="!state.generating.value" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.orbit-composer-wrap {
  position: relative;
  padding: 10px 18px max(10px, env(safe-area-inset-bottom));
  background: linear-gradient(to bottom, transparent, #fff 16px);
}

// —— reply context ——
.orbit-reply-context {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  font-size: 11px;
  color: var(--muted);
  background: var(--surface-2);
  border-bottom: 1px solid var(--line);
  border-radius: 8px 8px 0 0;

  svg {
    width: 14px;
    height: 14px;
    color: var(--brand);
  }
  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.orbit-reply-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--muted);
  border-radius: 4px;

  svg {
    width: 12px;
    height: 12px;
  }
  &:hover {
    background: var(--surface-3);
  }
}

// —— composer box ——
.orbit-composer {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  background: var(--surface);
  border-radius: 8px;
  box-shadow: var(--orbit-shadow-composer);
  transition: box-shadow 0.2s;

  &:focus-within {
    box-shadow:
      0 6px 20px rgba(16, 24, 40, 0.08),
      0 0 0 1px var(--brand-soft);
  }
}

// —— attachments ——
.orbit-attachments {
  padding: 9px 10px 0;
  overflow-x: auto;
}
:deep(.elx-attachments-card) {
  gap: 6px;
}
:deep(.elx-attachments-file-card-wrap) {
  max-width: 190px;
}

// —— Sender 覆盖 ——
.orbit-sender {
  :deep(.el-sender) {
    border: 0;
    box-shadow: none;
    background: transparent;
    border-radius: 0;
  }
  :deep(.el-sender-content) {
    padding: 0;
    background: transparent;
  }
  :deep(.el-sender-content .el-sender-prefix) {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 4px 0 12px;
    height: 44px;
  }
  :deep(.el-sender-content .el-sender-input) {
    padding: 6px 12px 4px;
  }
  :deep(.el-sender-content .el-textarea__inner) {
    min-height: 44px !important;
    max-height: 160px !important;
    padding: 0;
    font-size: 13px;
    line-height: 1.55;
    color: var(--text);
    background: transparent;
    border: 0;
    box-shadow: none;
    resize: none;
  }
  :deep(.el-sender-updown-wrap) {
    flex-direction: column;
    gap: 0;
    padding: 0;
  }
  :deep(.el-sender-updown-wrap .el-sender-prefix) {
    width: 100%;
    height: auto;
    padding: 8px 12px 0;
  }
  :deep(.el-sender-updown-wrap .el-sender-action-list) {
    padding: 8px 12px;
    border-top: 1px solid var(--line);
  }
  :deep(.el-sender-action-list .el-sender-action-list-presets) {
    gap: 6px;
  }
  :deep(.el-sender-header) {
    border-bottom: 0;
  }
}

// —— prefix icons ——
.orbit-prefix-tools {
  display: flex;
  align-items: center;
  gap: 4px;
}
.orbit-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--muted);
  border-radius: var(--orbit-radius-base);
  transition: all 0.15s;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: var(--text);
    background: var(--surface-3);
  }
}
.orbit-hidden-input {
  display: none;
}

// —— toolbar ——
.orbit-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 4px 8px 7px 12px;
  border-top: 1px solid transparent;
}
.orbit-context-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 8px;
  font-size: 11px;
  color: var(--text);
  background: var(--surface-2);
  border-radius: 5px;

  svg {
    width: 12px;
    height: 12px;
    color: var(--brand);
  }
}
.orbit-toolbar-spacer {
  flex: 1;
}
.orbit-composer-hint {
  font-size: 9px;
  color: var(--faint);
}
.orbit-send-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #fff;
  background: var(--brand);
  border-radius: var(--orbit-radius-base);
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: var(--brand-hover);
  }

  &:disabled {
    color: var(--faint);
    background: var(--surface-3);
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
}

// —— 响应式 ——
@media (max-width: 760px) {
  .orbit-composer-wrap {
    padding: 6px 10px max(6px, env(safe-area-inset-bottom));
  }
  .orbit-composer-hint {
    display: none;
  }
  .orbit-context-chip span {
    display: none;
  }
  .orbit-context-chip {
    width: 28px;
    padding: 0;
    justify-content: center;
  }
}
</style>