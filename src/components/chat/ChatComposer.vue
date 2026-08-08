<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { Icon } from '@iconify/vue'

const store = useChatStore()
const composer = ref<HTMLTextAreaElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function resizeComposer() {
  if (!composer.value) return
  composer.value.style.height = 'auto'
  composer.value.style.height = `${Math.min(composer.value.scrollHeight, 160)}px`
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    store.sendMessage()
    nextTick(() => {
      resizeComposer()
      composer.value?.focus()
    })
  }
}

function handleFiles(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    store.addFiles(Array.from(input.files))
    input.value = ''
  }
}

function handlePaste(e: ClipboardEvent) {
  const pasted = Array.from(e.clipboardData?.files || [])
  if (pasted.length) store.addFiles(pasted)
}

defineExpose({ composer, resizeComposer })
</script>

<template>
  <div class="composer-wrap">
    <div class="composer">
      <!-- Reply context -->
      <div v-if="store.replyingTo" class="reply-context">
        <Icon icon="tabler:git-branch" />
        <span>正在从"{{ store.replyingTo }}"创建新分支</span>
        <button class="icon-btn" style="width:24px;height:24px;flex-basis:24px" @click="store.replyingTo = ''">
          <Icon icon="tabler:x" width="12" />
        </button>
      </div>

      <!-- Attachments -->
      <div v-if="store.attachments.length" class="attachments scroll">
        <div v-for="file in store.attachments" :key="file.id" class="attachment">
          <span class="file-icon"><Icon icon="tabler:file-text" /></span>
          <span class="file-copy">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-state">已加入上下文 · {{ file.size }}</span>
          </span>
          <button class="icon-btn" style="width:23px;height:23px;flex-basis:23px" @click="store.removeAttachment(file)">
            <Icon icon="tabler:x" width="12" />
          </button>
        </div>
      </div>

      <!-- Textarea -->
      <textarea
        ref="composer"
        v-model="store.draft"
        rows="1"
        maxlength="12000"
        placeholder="输入消息，或粘贴图片和文件"
        @input="resizeComposer"
        @keydown="handleKeydown"
        @paste="handlePaste"
      />

      <!-- Toolbar -->
      <div class="composer-toolbar">
        <input ref="fileInput" type="file" hidden multiple @change="handleFiles" />
        <button class="icon-btn tooltip" data-tip="添加附件" @click="fileInput?.click()">
          <Icon icon="tabler:paperclip" />
        </button>
        <button class="icon-btn tooltip" data-tip="添加图片" @click="fileInput?.click()">
          <Icon icon="tabler:image" />
        </button>
        <span class="composer-hint">Enter 发送 · Shift + Enter 换行</span>

        <button v-if="store.generating" class="send-btn stop" @click="store.stopGeneration()">
          <Icon icon="tabler:square" />
        </button>
        <button v-else class="send-btn" :disabled="!store.canSend" @click="store.sendMessage()">
          <Icon icon="tabler:arrow-up" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.composer-wrap {
  position: relative; z-index: 8; flex: 0 0 auto;
  padding: 10px 18px max(10px, env(safe-area-inset-bottom));
  background: linear-gradient(to bottom, transparent, var(--surface) 16px);
}
.composer {
  width: min(100%, 820px); margin: 0 auto; background: var(--surface);
  border: 1px solid var(--line-strong); border-radius: 8px;
  box-shadow: var(--shadow-md);
}
.reply-context {
  display: flex; min-height: 34px; align-items: center; gap: 7px;
  padding: 6px 10px; color: var(--text-secondary); background: var(--surface-2);
  border-bottom: 1px solid var(--line); border-radius: 8px 8px 0 0; font-size: 10px;
}
.reply-context :deep(svg) { width: 13px; color: var(--brand); }
.reply-context span { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attachments { display: flex; gap: 7px; overflow-x: auto; padding: 9px 10px 0; }
.attachment { display: flex; width: 190px; min-width: 190px; align-items: center; gap: 8px; padding: 7px; background: var(--surface-2); border: 1px solid var(--line); border-radius: 6px; }
.file-icon { display: flex; width: 29px; height: 29px; flex: 0 0 29px; align-items: center; justify-content: center; color: var(--muted); background: var(--surface); border: 1px solid var(--line); border-radius: 5px; }
.file-icon :deep(svg) { width: 14px; }
.file-copy { min-width: 0; flex: 1; }
.file-name { display: block; overflow: hidden; font-size: 10px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; color: var(--text); }
.file-state { display: block; margin-top: 2px; color: var(--success); font-size: 9px; }
.composer textarea {
  display: block; width: 100%; min-height: 48px; max-height: 160px; resize: none;
  padding: 12px 12px 6px; color: var(--text); background: transparent; border: 0;
  outline: 0; font-size: 13px; line-height: 1.55; font-family: inherit;
}
.composer textarea::placeholder { color: var(--faint); }
.composer-toolbar { display: flex; min-height: 42px; align-items: center; gap: 2px; padding: 4px 7px 7px; }
.composer-hint { margin-left: auto; color: var(--faint); font-size: 9px; }
.send-btn { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; margin-left: 6px; color: white; background: var(--brand); border-radius: 6px; border: 0; cursor: pointer; }
.send-btn:disabled { color: var(--faint); background: var(--surface-3); cursor: not-allowed; }
.send-btn.stop { background: var(--danger); }
.send-btn :deep(svg) { width: 16px; }

.icon-btn { display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; border-radius: 6px; color: var(--muted); background: transparent; border: 0; cursor: pointer; transition: background 140ms, color 140ms; }
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }

@media (max-width: 760px) {
  .composer-wrap { padding: 7px 8px max(7px, env(safe-area-inset-bottom)); }
  .composer { border-radius: 7px; }
  .composer-hint { display: none; }
}
@media (max-width: 390px) {
  .composer-toolbar { padding-right: 5px; padding-left: 5px; }
}
</style>
