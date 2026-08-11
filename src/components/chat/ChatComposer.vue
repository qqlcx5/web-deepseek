<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'
import { Attachments, XSender, useSend } from 'vue-element-plus-x'
import { estimateTokens } from '@/utils/token-counter'

const store = useChatStore()
const appStore = useAppStore()
const uiStore = useUiStore()
const fileInput = ref<HTMLInputElement | null>(null)
const senderRef = ref<InstanceType<typeof XSender> | null>(null)

// ─── useSend: manage loading state for send/abort ───────────────────────────
const { send, abort, loading } = useSend({
  sendHandler: () => {
    void store.sendMessage()
  },
  abortHandler: () => {
    store.stopGeneration()
  },
})

// Map store attachments to Element-Plus-X Attachments format
function getAttachmentItems() {
  return store.attachments.map(f => ({
    uid: f.id,
    name: f.name,
    description: `已加入上下文 · ${f.size}`,
    status: 'done' as const,
  }))
}

// Token estimation
const showTokenEstimate = computed(() => appStore.settings?.showInputEstimatedTokens ?? false)
const estimatedTokens = computed(() => estimateTokens(store.draft))
const tokenLabel = computed(() => {
  const t = estimatedTokens.value
  if (t < 1000) return `~${t} tokens`
  return `~${(t / 1000).toFixed(1)}k tokens`
})

// Shortcut label
const shortcutLabel = computed(() => {
  const sc = appStore.settings?.sendShortcut ?? 'Enter'
  if (sc === 'Enter') return 'Enter 发送 · Shift + Enter 换行'
  if (sc === 'Ctrl+Enter') return 'Ctrl + Enter 发送 · Enter 换行'
  if (sc === 'Shift+Enter') return 'Shift + Enter 发送 · Enter 换行'
  return 'Enter 发送 · Shift + Enter 换行'
})

// Map sendShortcut to XSender submitType
const submitType = computed<'enter' | 'shiftEnter'>(() => {
  const sc = appStore.settings?.sendShortcut ?? 'Enter'
  return sc === 'Enter' ? 'enter' : 'shiftEnter'
})

// XSender disabled state
const senderDisabled = computed(() => !store.canSend && !store.generating)

// ─── Sync store.draft → XSender text ────────────────────────────────────────
// XSender doesn't support v-model; we use setText() to push external changes.
// The @change event pulls text back into store.draft.
let isInternalUpdate = false

watch(() => store.draft, (newDraft) => {
  if (isInternalUpdate) return
  // External change to draft (e.g. store cleared it after send, or editMessage)
  const currentText = senderRef.value?.getModelValue()?.text ?? ''
  if (newDraft !== currentText) {
    senderRef.value?.setText(newDraft ?? '')
  }
})

// ─── XSender event handlers ─────────────────────────────────────────────────
function handleChange() {
  // Pull text from XSender into store.draft
  const model = senderRef.value?.getModelValue()
  if (model) {
    isInternalUpdate = true
    store.draft = model.text
    // Reset flag on next tick to allow external updates again
    requestAnimationFrame(() => { isInternalUpdate = false })
  }
}

function handleSubmit() {
  // Sync text before sending
  const model = senderRef.value?.getModelValue()
  if (model) {
    store.draft = model.text
  }
  send()
}

function handlePasteFile(firstFile: File, fileList: FileList) {
  const files = Array.from(fileList)
  if (files.length) store.addFiles(files)
}

function handlePaste(e: ClipboardEvent) {
  const clipboardData = e.clipboardData
  if (!clipboardData) return
  // Only intercept text-only paste (no files/images)
  if (clipboardData.files.length > 0) return
  const text = clipboardData.getData('text/plain')
  if (!text) return

  const threshold = appStore.settings?.pasteLongTextThreshold ?? 500
  const enabled = appStore.settings?.pasteLongTextAsFile ?? false
  if (!enabled || text.length <= threshold) return

  e.preventDefault()
  e.stopPropagation()
  const file = new File([text], `pasted-${Date.now()}.txt`, { type: 'text/plain' })
  store.addFiles([file])
}

function handleFiles(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    store.addFiles(Array.from(input.files))
    input.value = ''
  }
}

defineExpose({ senderRef })
</script>

<template>
  <div class="composer-wrap">
    <!-- Offline banner -->
    <div v-if="!uiStore.online" class="offline-banner">
      <Icon icon="tabler:wifi-off" width="14" />
      <span>网络已断开。消息将保存在本地，网络恢复后可重试。</span>
    </div>

    <XSender
      ref="senderRef"
      :placeholder="'输入消息，或粘贴图片和文件'"
      :auto-focus="false"
      :submit-type="submitType"
      :loading="loading"
      :disabled="senderDisabled"
      :clearable="false"
      :tip-config="false"
      class="composer-sender"
      @paste.capture="handlePaste"
      @change="handleChange"
      @submit="handleSubmit"
      @paste-file="handlePasteFile"
    >
      <!-- Header: reply context + attachments -->
      <template #header>
        <div v-if="store.replyingTo" class="reply-context">
          <Icon icon="tabler:git-branch" />
          <span>正在从"{{ store.replyingTo }}"创建新分支</span>
          <button class="icon-btn" style="width:24px;height:24px;flex-basis:24px" @click="store.replyingTo = ''">
            <Icon icon="tabler:x" width="12" />
          </button>
        </div>

        <Attachments
          v-if="store.attachments.length"
          :items="getAttachmentItems()"
          :hide-upload="true"
          overflow="scrollX"
          class="composer-attachments"
          @delete-card="(item: any, index: number) => store.removeAttachment(store.attachments[index])"
        />
      </template>

      <!-- Prefix: attachment buttons + token estimate -->
      <template #prefix>
        <input ref="fileInput" type="file" hidden multiple @change="handleFiles" />
        <button class="icon-btn tooltip" data-tip="添加附件" @click="fileInput?.click()">
          <Icon icon="tabler:paperclip" />
        </button>
        <button class="icon-btn tooltip" data-tip="添加图片" @click="fileInput?.click()">
          <Icon icon="tabler:photo" />
        </button>
        <span v-if="showTokenEstimate && store.draft.trim()" class="token-estimate">
          {{ tokenLabel }}
        </span>
      </template>

      <!-- Action list: stop button during generation, or send button -->
      <template #action-list>
        <button
          v-if="loading || store.generating"
          class="send-btn stop"
          title="停止生成"
          aria-label="停止生成"
          @click="abort"
        >
          <Icon icon="tabler:square" />
        </button>
        <button
          v-else
          class="send-btn"
          :disabled="!store.canSend"
          title="发送消息"
          aria-label="发送消息"
          @click="handleSubmit"
        >
          <Icon icon="tabler:arrow-up" />
        </button>
      </template>

      <!-- Footer: shortcut hint -->
      <template #footer>
        <span class="composer-hint">{{ shortcutLabel }}</span>
      </template>
    </XSender>
  </div>
</template>

<style scoped>
.composer-wrap {
  position: relative; z-index: 8; flex: 0 0 auto;
  padding: 10px 18px max(10px, env(safe-area-inset-bottom));
  background: linear-gradient(to bottom, transparent, var(--surface) 16px);
}
.offline-banner {
  width: min(100%, 820px); margin: 0 auto 6px;
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; color: var(--warning-text, #92400e);
  background: color-mix(in srgb, var(--warning, #f59e0b) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--warning, #f59e0b) 25%, transparent);
  border-radius: 6px; font-size: 11px;
}
.offline-banner :deep(svg) { width: 14px; height: 14px; }

.composer-sender {
  width: min(100%, 820px);
  margin: 0 auto;
}

/* XSender inner styling overrides */
.composer-sender :deep(.elx-x-sender) {
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
}
.composer-sender :deep(.elx-x-sender:focus-within) {
  border-color: var(--brand);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--brand) 30%, transparent);
}
.composer-sender :deep(.elx-x-sender__content) {
  align-items: flex-end;
}
.composer-sender :deep(.chat-rich-text) {
  font-size: 13px;
  line-height: 1.55;
  font-family: inherit;
  color: var(--text);
  min-height: 48px;
  max-height: 160px;
}
.composer-sender :deep(.chat-placeholder-wrap) {
  font-size: 13px;
  color: var(--faint);
}

/* Header */
.reply-context {
  display: flex; min-height: 34px; align-items: center; gap: 7px;
  padding: 6px 10px; color: var(--text-secondary); background: var(--surface-2);
  border-bottom: 1px solid var(--line); border-radius: 8px 8px 0 0; font-size: 10px;
}
.reply-context :deep(svg) { width: 13px; color: var(--brand); }
.reply-context span { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.composer-attachments {
  padding: 9px 10px 0;
}

/* Prefix */
.composer-sender :deep(.elx-x-sender__prefix) {
  gap: 2px;
  height: auto;
  padding-left: 6px;
}

/* Token estimate */
.token-estimate {
  padding: 2px 6px; color: var(--faint); background: var(--surface-3);
  border: 1px solid var(--line); border-radius: 4px; font-size: 9px;
  white-space: nowrap;
  margin-left: 4px;
}

/* Action list */
.composer-sender :deep(.elx-x-sender__action-list) {
  padding-right: 7px;
  padding-bottom: 7px;
  height: auto;
}

/* Send / Stop button */
.send-btn { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; margin-left: 6px; color: white; background: var(--brand); border-radius: 6px; border: 0; cursor: pointer; }
.send-btn:disabled { color: var(--faint); background: var(--surface-3); cursor: not-allowed; }
.send-btn.stop { background: var(--danger); }
.send-btn :deep(svg) { width: 16px; height: 16px; }

/* Footer */
.composer-sender :deep(.elx-x-sender__footer) {
  padding: 4px 10px 6px;
}
.composer-hint { color: var(--faint); font-size: 9px; }

/* Icon buttons */
.icon-btn { display: inline-flex; width: 30px; height: 30px; flex: 0 0 30px; align-items: center; justify-content: center; border-radius: 6px; color: var(--muted); background: transparent; border: 0; cursor: pointer; transition: background 140ms, color 140ms; }
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn :deep(svg) { width: 16px; height: 16px; }

@media (max-width: 760px) {
  .composer-wrap { padding: 7px 8px max(7px, calc(env(safe-area-inset-bottom) + 8px)); }
  .composer-sender :deep(.elx-x-sender) { border-radius: 7px; }
  .composer-hint { display: none; }
  .token-estimate { display: none; }
}
</style>
