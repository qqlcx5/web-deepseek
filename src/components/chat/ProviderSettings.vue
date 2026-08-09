<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'
import type { Provider, ModelInfo } from '@/types'

const appStore = useAppStore()
const uiStore = useUiStore()

const searchQuery = ref('')
const expandedId = ref<string | null>(null)
const editingProvider = ref<Provider | null>(null)
const newModelDraft = ref<ModelInfo>({ id: '', name: '', enabled: true })
const showNewProvider = ref(false)
const newProvider = ref<Provider>({ id: '', name: '', apiHost: '', apiKey: '', models: [], enabled: true })
const modelIdError = ref('')
const providerNameError = ref('')
const deleteConfirmId = ref<string | null>(null)
const deleteWarning = ref('')

const filteredProviders = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const sorted = [...appStore.providers].sort((a, b) => a.name.localeCompare(b.name))
  if (!q) return sorted
  return sorted.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.apiHost.toLowerCase().includes(q) ||
    p.models.some(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)),
  )
})

function maskKey(key?: string): string {
  if (!key) return '—'
  if (key.length <= 8) return '••••'
  return key.slice(0, 4) + '••••' + key.slice(-4)
}

function toggleProvider(provider: Provider) {
  appStore.updateProvider(provider.id, { enabled: !provider.enabled })
}

function toggleModel(provider: Provider, model: ModelInfo) {
  const updatedModels = provider.models.map(m =>
    m.id === model.id ? { ...m, enabled: !m.enabled } : m,
  )
  appStore.updateProvider(provider.id, { models: updatedModels })
}

function checkModelIdDuplicate(models: ModelInfo[], id: string): boolean {
  return models.some(m => m.id === id)
}

function checkProviderName(name: string): boolean {
  providerNameError.value = ''
  if (!name.trim()) {
    providerNameError.value = '名称不能为空'
    return false
  }
  return true
}

function checkProviderHost(host: string): boolean {
  if (!host.trim()) {
    providerNameError.value = 'API Host 不能为空'
    return false
  }
  return true
}

function startEdit(provider: Provider) {
  editingProvider.value = JSON.parse(JSON.stringify(provider))
  expandedId.value = provider.id
}

function cancelEdit() {
  editingProvider.value = null
}

function saveEdit() {
  if (!editingProvider.value) return
  if (!checkProviderName(editingProvider.value.name) || !checkProviderHost(editingProvider.value.apiHost)) return
  const result = appStore.updateProvider(editingProvider.value.id, {
    name: editingProvider.value.name.trim(),
    apiHost: editingProvider.value.apiHost.trim(),
    apiKey: editingProvider.value.apiKey,
    models: editingProvider.value.models,
  })
  if (!result.ok) {
    providerNameError.value = result.error ?? 'Provider 更新失败'
    return
  }
  editingProvider.value = null
  uiStore.showToast('Provider 已更新')
}

function addModel() {
  if (!editingProvider.value || !newModelDraft.value.id.trim()) return
  const id = newModelDraft.value.id.trim()
  if (checkModelIdDuplicate(editingProvider.value.models, id)) {
    modelIdError.value = `模型 ID "${id}" 已存在`
    return
  }
  modelIdError.value = ''
  const model: ModelInfo = {
    id,
    name: newModelDraft.value.name.trim() || id,
    enabled: true,
  }
  editingProvider.value.models.push(model)
  newModelDraft.value = { id: '', name: '', enabled: true }
}

function toggleEditingModel(modelId: string) {
  if (!editingProvider.value) return
  editingProvider.value.models = editingProvider.value.models.map(model =>
    model.id === modelId ? { ...model, enabled: !model.enabled } : model,
  )
}

function removeModel(modelId: string) {
  if (!editingProvider.value) return
  const dependent = appStore.assistantUsingModel(modelId)
  if (dependent) {
    modelIdError.value = `Assistant “${dependent.name}”仍在使用该模型`
    return
  }
  editingProvider.value.models = editingProvider.value.models.filter(model => model.id !== modelId)
}

function startNewProvider() {
  newProvider.value = { id: `provider-${crypto.randomUUID()}`, name: '', apiHost: '', apiKey: '', models: [], enabled: true }
  showNewProvider.value = true
  providerNameError.value = ''
}

function saveNewProvider() {
  if (!checkProviderName(newProvider.value.name) || !checkProviderHost(newProvider.value.apiHost)) return
  if (appStore.providers.some(p => p.id === newProvider.value.id)) {
    providerNameError.value = 'Provider ID 已存在'
    return
  }
  const result = appStore.addProvider({ ...newProvider.value, name: newProvider.value.name.trim(), apiHost: newProvider.value.apiHost.trim() })
  if (!result.ok) {
    providerNameError.value = result.error ?? 'Provider 创建失败'
    return
  }
  showNewProvider.value = false
  uiStore.showToast('Provider 已创建')
}

function requestDeleteProvider(provider: Provider) {
  deleteWarning.value = ''
  deleteConfirmId.value = provider.id
}

function confirmDeleteProvider() {
  if (!deleteConfirmId.value) return
  const providerId = deleteConfirmId.value
  const result = appStore.removeProvider(providerId)
  if (!result.ok) {
    deleteWarning.value = result.error ?? '无法删除 Provider'
    return
  }
  if (expandedId.value === providerId) {
    expandedId.value = null
    editingProvider.value = null
  }
  deleteConfirmId.value = null
  uiStore.showToast('Provider 已删除')
}

function close() {
  uiStore.modal = ''
}
</script>

<template>
  <section class="dialog settings-dialog">
    <header class="dialog-head">
      <div>
        <div class="dialog-title">Provider 管理</div>
        <div class="dialog-subtitle">管理 API 服务商和模型配置（{{ appStore.providers.length }} 个）</div>
      </div>
      <button class="icon-btn" @click="close">
        <Icon icon="tabler:x" />
      </button>
    </header>

    <div class="dialog-body">
      <div class="search-bar">
        <Icon icon="tabler:search" />
        <input
          v-model="searchQuery"
          placeholder="搜索 Provider 或模型..."
          class="search-input"
        />
        <button class="add-provider-btn" @click="startNewProvider">
          <Icon icon="tabler:plus" width="15" />
          新建
        </button>
      </div>

      <!-- New Provider Form -->
      <div v-if="showNewProvider" class="provider-card expanded">
        <div class="provider-edit">
          <div class="edit-row">
            <label class="field-label">名称</label>
            <input v-model="newProvider.name" class="field-input" placeholder="例如：OpenAI" />
          </div>
          <div class="edit-row">
            <label class="field-label">API Host</label>
            <input v-model="newProvider.apiHost" class="field-input" placeholder="https://api.example.com" />
          </div>
          <div class="edit-row">
            <label class="field-label">API Key</label>
            <input v-model="newProvider.apiKey" class="field-input" type="password" placeholder="sk-..." />
          </div>
          <div v-if="providerNameError" class="field-error">{{ providerNameError }}</div>
          <div class="edit-actions">
            <button class="secondary" @click="showNewProvider = false">取消</button>
            <button class="primary" @click="saveNewProvider">
              <Icon icon="tabler:check" width="14" />
              创建
            </button>
          </div>
        </div>
      </div>

      <div v-if="deleteConfirmId" class="delete-confirm" role="alertdialog" aria-modal="true">
        <div class="delete-confirm-copy">
          <strong>删除 Provider</strong>
          <span>{{ deleteWarning || '该操作不可撤销。确认后将删除 Provider 及其未被引用的模型。' }}</span>
        </div>
        <div class="edit-actions">
          <button class="secondary" @click="deleteConfirmId = null; deleteWarning = ''">取消</button>
          <button class="danger-primary" @click="confirmDeleteProvider">确认删除</button>
        </div>
      </div>

      <div class="provider-list scroll">
        <div
          v-for="provider in filteredProviders"
          :key="provider.id"
          class="provider-card"
          :class="{ expanded: expandedId === provider.id }"
        >
          <div class="provider-header" @click="expandedId === provider.id && !editingProvider ? (expandedId = null) : startEdit(provider)">
            <div class="provider-info">
              <div class="provider-name">{{ provider.name }}</div>
              <div class="provider-meta">
                {{ maskKey(provider.apiKey) }} · {{ provider.models.length }} 个模型 · {{ provider.apiHost || '无 API Host' }}
              </div>
            </div>
            <button class="icon-btn danger-btn tooltip" data-tip="删除 Provider" @click.stop="requestDeleteProvider(provider)">
              <Icon icon="tabler:trash" width="14" />
            </button>
            <label class="toggle" @click.stop>
              <input
                type="checkbox"
                :checked="provider.enabled"
                @change="toggleProvider(provider)"
              />
              <span class="toggle-slider" />
            </label>
          </div>

          <div v-if="expandedId === provider.id && editingProvider" class="provider-edit">
            <div class="edit-row">
              <label class="field-label">名称</label>
              <input v-model="editingProvider.name" class="field-input" />
            </div>
            <div class="edit-row">
              <label class="field-label">API Host</label>
              <input v-model="editingProvider.apiHost" class="field-input" placeholder="https://api.example.com" />
            </div>
            <div class="edit-row">
              <label class="field-label">API Key</label>
              <input v-model="editingProvider.apiKey" class="field-input" type="password" placeholder="sk-..." />
            </div>

            <div class="model-section">
              <div class="model-section-head">
                <span class="field-label">模型列表 ({{ editingProvider.models.length }})</span>
                <button class="panel-edit" @click="addModel" v-if="newModelDraft.id">添加</button>
              </div>

              <div class="model-add-row">
                <input
                  v-model="newModelDraft.id"
                  class="field-input model-id-input"
                  placeholder="模型 ID"
                  @keydown.enter="addModel"
                />
                <input
                  v-model="newModelDraft.name"
                  class="field-input model-name-input"
                  placeholder="显示名称（可选）"
                  @keydown.enter="addModel"
                />
              </div>
              <div v-if="modelIdError" class="field-error">{{ modelIdError }}</div>

              <div
                v-for="model in editingProvider.models"
                :key="model.id"
                class="model-row"
              >
                <input v-model="model.name" class="model-row-name field-input" aria-label="模型显示名称" />
                <span class="model-row-id">{{ model.id }}</span>
                <label class="toggle small-toggle" :aria-label="model.enabled ? '禁用模型' : '启用模型'">
                  <input type="checkbox" :checked="model.enabled" @change="toggleEditingModel(model.id)" />
                  <span class="toggle-slider" />
                </label>
                <button class="icon-btn danger-btn tooltip" data-tip="删除模型" @click="removeModel(model.id)">
                  <Icon icon="tabler:trash" width="14" />
                </button>
              </div>
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

        <div v-if="filteredProviders.length === 0" class="empty-hint">
          未找到匹配的 Provider
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings-dialog {
  position: fixed; z-index: 80; top: 50%; left: 50%;
  width: min(560px, calc(100vw - 28px));
  max-height: min(680px, calc(100dvh - 28px));
  display: flex; flex-direction: column;
  overflow: hidden; background: var(--surface); border: 1px solid var(--line);
  border-radius: 8px; box-shadow: var(--shadow-lg);
  transform: translate(-50%, -50%);
}
.dialog-head { display: flex; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line); flex-shrink: 0; }
.dialog-title { font-size: 13px; font-weight: 750; color: var(--text); }
.dialog-subtitle { margin-top: 3px; color: var(--faint); font-size: 10px; }
.dialog-head .icon-btn { margin-top: -4px; }
.dialog-body { padding: 12px 16px; display: flex; flex-direction: column; min-height: 0; flex: 1; overflow: hidden; }

.search-bar { position: relative; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; flex-shrink: 0; }
.search-bar :deep(svg) { position: absolute; top: 10px; left: 10px; width: 15px; color: var(--faint); }
.search-input { width: auto; min-width: 0; height: 34px; flex: 1; padding: 0 10px 0 32px; color: var(--text); background: var(--surface-2); border: 1px solid var(--line); border-radius: 6px; font-size: 11px; outline: 0; }
.search-input:focus { border-color: var(--brand); }
.add-provider-btn { display: inline-flex; height: 34px; align-items: center; gap: 4px; padding: 0 10px; color: white; background: var(--brand); border: 0; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
.add-provider-btn:hover { filter: brightness(1.08); }
.field-error { color: var(--danger); font-size: 10px; margin-top: 2px; }

.provider-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 4px; }

.provider-card { background: var(--surface-2); border: 1px solid var(--line); border-radius: 7px; overflow: hidden; }
.provider-card.expanded { border-color: var(--brand); }
.provider-header { display: flex; align-items: center; gap: 10px; padding: 9px 11px; cursor: pointer; }
.provider-header:hover { background: var(--surface-3); }
.provider-info { min-width: 0; flex: 1; }
.provider-name { font-size: 12px; font-weight: 650; color: var(--text); }
.provider-meta { margin-top: 2px; color: var(--faint); font-size: 9px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.toggle { position: relative; display: inline-block; width: 32px; height: 18px; flex-shrink: 0; cursor: pointer; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: var(--line-strong); border-radius: 999px; transition: 140ms; }
.toggle-slider::before { content: ''; position: absolute; width: 14px; height: 14px; top: 2px; left: 2px; background: white; border-radius: 50%; transition: 140ms; }
.toggle input:checked + .toggle-slider { background: var(--brand); }
.toggle input:checked + .toggle-slider::before { transform: translateX(14px); }

.provider-edit { padding: 10px 11px 12px; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 9px; }
.edit-row { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-size: 10px; font-weight: 650; color: var(--text-secondary); }
.field-input { height: 30px; padding: 0 8px; color: var(--text); background: var(--surface); border: 1px solid var(--line); border-radius: 5px; font-size: 11px; outline: 0; }
.field-input:focus { border-color: var(--brand); }

.model-section { display: flex; flex-direction: column; gap: 5px; }
.model-section-head { display: flex; align-items: center; justify-content: space-between; }
.model-add-row { display: flex; gap: 5px; }
.model-id-input { flex: 1; }
.model-name-input { flex: 1; }
.model-row { display: flex; align-items: center; gap: 8px; padding: 5px 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 5px; }
.model-row-name { min-width: 0; height: 26px; flex: 1; font-size: 10px; font-weight: 600; color: var(--text); }
.model-row-id { min-width: 0; color: var(--faint); flex: 1; overflow: hidden; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.small-toggle { transform: scale(0.8); }
.danger-btn { width: 24px; height: 24px; flex: 0 0 24px; color: var(--danger); }
.danger-btn:hover { background: color-mix(in srgb, var(--danger) 10%, transparent); }

.edit-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 4px; }
.primary { display: inline-flex; min-height: 30px; align-items: center; justify-content: center; gap: 5px; padding: 0 11px; color: white; background: var(--brand); border-radius: 5px; font-size: 11px; font-weight: 600; border: 0; cursor: pointer; }
.primary:hover { filter: brightness(1.08); }
.secondary { display: inline-flex; min-height: 30px; align-items: center; justify-content: center; gap: 5px; padding: 0 10px; color: var(--text-secondary); background: var(--surface); border: 1px solid var(--line-strong); border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; }
.secondary:hover { background: var(--surface-3); }
.panel-edit { color: var(--brand); background: transparent; font-size: 10px; border: 0; cursor: pointer; }

.delete-confirm { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; padding: 10px 11px; color: var(--danger); background: color-mix(in srgb, var(--danger) 8%, var(--surface)); border: 1px solid color-mix(in srgb, var(--danger) 30%, var(--line)); border-radius: 6px; }
.delete-confirm-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 3px; font-size: 10px; }
.delete-confirm-copy span { color: var(--text-secondary); line-height: 1.5; }
.danger-primary { display: inline-flex; min-height: 30px; align-items: center; justify-content: center; padding: 0 11px; color: white; background: var(--danger); border: 0; border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; }
.empty-hint { text-align: center; padding: 24px 0; color: var(--faint); font-size: 11px; }

.icon-btn { display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; border-radius: 6px; color: var(--muted); background: transparent; border: 0; cursor: pointer; transition: background 140ms, color 140ms; }
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }

@media (max-width: 760px) {
  .settings-dialog { top: auto; right: 0; bottom: 0; left: 0; width: 100%; max-height: 88dvh; border-right: 0; border-bottom: 0; border-left: 0; border-radius: 8px 8px 0 0; transform: none; }
}
</style>
