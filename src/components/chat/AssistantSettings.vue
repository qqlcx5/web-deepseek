<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'
import type { Assistant } from '@/types'

const appStore = useAppStore()
const uiStore = useUiStore()

const expandedId = ref<string | null>(null)
const editingAssistant = ref<Assistant | null>(null)
const isNew = ref(false)

const availableModels = computed(() =>
  appStore.providers
    .filter(p => p.enabled)
    .flatMap(p =>
      p.models
        .filter(m => m.enabled)
        .map(m => ({ id: m.id, name: m.name, providerName: p.name })),
    ),
)

function startEdit(assistant: Assistant) {
  editingAssistant.value = JSON.parse(JSON.stringify(assistant))
  expandedId.value = assistant.id
  isNew.value = false
}

function startNew() {
  editingAssistant.value = {
    id: `assistant-${Date.now()}`,
    name: '新助手',
    prompt: '',
    enabled: true,
    emoji: '🤖',
    temperature: 0.7,
  }
  expandedId.value = editingAssistant.value.id
  isNew.value = true
}

function cancelEdit() {
  editingAssistant.value = null
  expandedId.value = null
  isNew.value = false
}

function saveEdit() {
  if (!editingAssistant.value) return
  if (isNew.value) {
    appStore.addAssistant(editingAssistant.value)
    uiStore.showToast('助手已创建')
  } else {
    appStore.updateAssistant(editingAssistant.value.id, {
      name: editingAssistant.value.name,
      emoji: editingAssistant.value.emoji,
      prompt: editingAssistant.value.prompt,
      model: editingAssistant.value.model,
      temperature: editingAssistant.value.temperature,
      enableWebSearch: editingAssistant.value.enableWebSearch,
    })
    uiStore.showToast('助手已更新')
  }
  editingAssistant.value = null
  expandedId.value = null
  isNew.value = false
}

function deleteAssistant(id: string) {
  appStore.removeAssistant(id)
  uiStore.showToast('助手已删除')
  if (expandedId.value === id) {
    expandedId.value = null
    editingAssistant.value = null
  }
}

function close() {
  uiStore.modal = ''
}
</script>

<template>
  <section class="dialog settings-dialog">
    <header class="dialog-head">
      <div>
        <div class="dialog-title">助手管理</div>
        <div class="dialog-subtitle">管理 AI 助手配置（{{ appStore.assistants.length }} 个）</div>
      </div>
      <div class="head-actions">
        <button class="primary small" @click="startNew">
          <Icon icon="tabler:plus" width="14" />
          新建
        </button>
        <button class="icon-btn" @click="close">
          <Icon icon="tabler:x" />
        </button>
      </div>
    </header>

    <div class="dialog-body">
      <div class="assistant-list scroll">
        <div
          v-for="assistant in appStore.assistants"
          :key="assistant.id"
          class="assistant-card"
          :class="{ expanded: expandedId === assistant.id }"
        >
          <div class="assistant-header" @click="expandedId === assistant.id && !editingAssistant ? (expandedId = null) : startEdit(assistant)">
            <span class="assistant-emoji">{{ assistant.emoji || '🤖' }}</span>
            <div class="assistant-info">
              <div class="assistant-name">{{ assistant.name }}</div>
              <div class="assistant-meta">
                {{ assistant.model || '默认模型' }}
                <span v-if="assistant.enableWebSearch"> · 🔍 联网</span>
                <span v-if="assistant.isDefault"> · 默认</span>
              </div>
            </div>
            <button
              v-if="!assistant.isDefault"
              class="icon-btn danger-btn"
              @click.stop="deleteAssistant(assistant.id)"
            >
              <Icon icon="tabler:trash" width="14" />
            </button>
          </div>

          <div v-if="expandedId === assistant.id && editingAssistant" class="assistant-edit">
            <div class="edit-row">
              <label class="field-label">名称</label>
              <input v-model="editingAssistant.name" class="field-input" />
            </div>
            <div class="edit-row">
              <label class="field-label">Emoji</label>
              <input v-model="editingAssistant.emoji" class="field-input emoji-input" maxlength="4" />
            </div>
            <div class="edit-row">
              <label class="field-label">系统提示词</label>
              <textarea v-model="editingAssistant.prompt" class="field-area" rows="4" placeholder="输入系统提示词..." />
            </div>
            <div class="edit-row">
              <label class="field-label">模型</label>
              <select v-model="editingAssistant.model" class="field-input">
                <option value="">默认模型</option>
                <option v-for="m in availableModels" :key="m.id" :value="m.id">
                  {{ m.providerName }} · {{ m.name }}
                </option>
              </select>
            </div>
            <div class="edit-row">
              <label class="field-label">Temperature: {{ editingAssistant.temperature ?? 0.7 }}</label>
              <input
                v-model.number="editingAssistant.temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                class="field-range"
              />
            </div>
            <div class="edit-row toggle-row">
              <label class="field-label">联网搜索</label>
              <label class="toggle">
                <input type="checkbox" v-model="editingAssistant.enableWebSearch" />
                <span class="toggle-slider" />
              </label>
            </div>

            <div class="edit-actions">
              <button class="secondary" @click="cancelEdit">取消</button>
              <button class="primary" @click="saveEdit">
                <Icon icon="tabler:check" width="14" />
                保存
              </button>
            </div>
          </div>
        </div>

        <div v-if="appStore.assistants.length === 0" class="empty-hint">
          暂无助手，点击右上角"新建"创建
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings-dialog {
  position: fixed; z-index: 80; top: 50%; left: 50%;
  width: min(520px, calc(100vw - 28px));
  max-height: min(640px, calc(100dvh - 28px));
  display: flex; flex-direction: column;
  overflow: hidden; background: var(--surface); border: 1px solid var(--line);
  border-radius: 8px; box-shadow: var(--shadow-lg);
  transform: translate(-50%, -50%);
}
.dialog-head { display: flex; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line); align-items: center; flex-shrink: 0; }
.dialog-title { font-size: 13px; font-weight: 750; color: var(--text); }
.dialog-subtitle { margin-top: 3px; color: var(--faint); font-size: 10px; }
.head-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.dialog-body { padding: 12px 16px; display: flex; flex-direction: column; min-height: 0; flex: 1; overflow: hidden; }

.assistant-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 4px; }

.assistant-card { background: var(--surface-2); border: 1px solid var(--line); border-radius: 7px; overflow: hidden; }
.assistant-card.expanded { border-color: var(--brand); }
.assistant-header { display: flex; align-items: center; gap: 10px; padding: 9px 11px; cursor: pointer; }
.assistant-header:hover { background: var(--surface-3); }
.assistant-emoji { font-size: 18px; flex-shrink: 0; width: 24px; text-align: center; }
.assistant-info { min-width: 0; flex: 1; }
.assistant-name { font-size: 12px; font-weight: 650; color: var(--text); }
.assistant-meta { margin-top: 2px; color: var(--faint); font-size: 9px; }

.assistant-edit { padding: 10px 11px 12px; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 9px; }
.edit-row { display: flex; flex-direction: column; gap: 4px; }
.toggle-row { flex-direction: row; align-items: center; justify-content: space-between; }
.field-label { font-size: 10px; font-weight: 650; color: var(--text-secondary); }
.field-input { height: 30px; padding: 0 8px; color: var(--text); background: var(--surface); border: 1px solid var(--line); border-radius: 5px; font-size: 11px; outline: 0; }
.field-input:focus { border-color: var(--brand); }
.emoji-input { width: 60px; text-align: center; font-size: 16px; }
.field-area { width: 100%; resize: vertical; padding: 8px; color: var(--text); background: var(--surface); border: 1px solid var(--line); border-radius: 5px; outline: 0; font-size: 11px; line-height: 1.55; font-family: inherit; }
.field-area:focus { border-color: var(--brand); }
.field-range { width: 100%; accent-color: var(--brand); }

.toggle { position: relative; display: inline-block; width: 32px; height: 18px; flex-shrink: 0; cursor: pointer; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: var(--line-strong); border-radius: 999px; transition: 140ms; }
.toggle-slider::before { content: ''; position: absolute; width: 14px; height: 14px; top: 2px; left: 2px; background: white; border-radius: 50%; transition: 140ms; }
.toggle input:checked + .toggle-slider { background: var(--brand); }
.toggle input:checked + .toggle-slider::before { transform: translateX(14px); }

.edit-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 4px; }
.primary { display: inline-flex; min-height: 30px; align-items: center; justify-content: center; gap: 5px; padding: 0 11px; color: white; background: var(--brand); border-radius: 5px; font-size: 11px; font-weight: 600; border: 0; cursor: pointer; }
.primary:hover { filter: brightness(1.08); }
.primary.small { min-height: 28px; padding: 0 9px; font-size: 10px; }
.secondary { display: inline-flex; min-height: 30px; align-items: center; justify-content: center; gap: 5px; padding: 0 10px; color: var(--text-secondary); background: var(--surface); border: 1px solid var(--line-strong); border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; }
.secondary:hover { background: var(--surface-3); }

.empty-hint { text-align: center; padding: 24px 0; color: var(--faint); font-size: 11px; }

.icon-btn { display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; border-radius: 6px; color: var(--muted); background: transparent; border: 0; cursor: pointer; transition: background 140ms, color 140ms; }
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }
.danger-btn { width: 26px; height: 26px; flex: 0 0 26px; color: var(--danger); }
.danger-btn:hover { background: color-mix(in srgb, var(--danger) 10%, transparent); }

@media (max-width: 760px) {
  .settings-dialog { top: auto; right: 0; bottom: 0; left: 0; width: 100%; max-height: 88dvh; border-right: 0; border-bottom: 0; border-left: 0; border-radius: 8px 8px 0 0; transform: none; }
}
</style>
