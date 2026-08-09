<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'
import type { Provider, ModelInfo } from '@/types'

const appStore = useAppStore()
const uiStore = useUiStore()

const searchQuery = ref('')
const expandedId = ref<string | null>(null)
const editingProvider = ref<Provider | null>(null)
const newModelId = ref('')
const newModelName = ref('')
const modelIdError = ref('')
const providerNameError = ref('')
const showNewProvider = ref(false)
const newProvider = ref<Provider>({ id: '', name: '', apiHost: '', apiKey: '', models: [], enabled: true })
const deleteConfirmId = ref<string | null>(null)
const deleteWarning = ref('')
const filterEnabled = ref<'all' | 'enabled' | 'disabled'>('all')

const filteredProviders = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let list = [...appStore.providers].sort((a, b) => {
    if (a.isSystem !== b.isSystem) return a.isSystem ? 1 : -1
    return a.name.localeCompare(b.name)
  })
  if (filterEnabled.value === 'enabled') list = list.filter(p => p.enabled)
  else if (filterEnabled.value === 'disabled') list = list.filter(p => !p.enabled)
  if (!q) return list
  return list.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.apiHost.toLowerCase().includes(q) ||
    p.models.some(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)),
  )
})

const totalModels = computed(() =>
  appStore.providers.reduce((sum, p) => sum + p.models.length, 0),
)

function maskKey(key?: string): string {
  if (!key) return '未配置'
  if (key.length <= 8) return '••••'
  return key.slice(0, 4) + '••••' + key.slice(-4)
}

function toggleProvider(provider: Provider) {
  appStore.updateProvider(provider.id, { enabled: !provider.enabled })
}

function startEdit(provider: Provider) {
  editingProvider.value = JSON.parse(JSON.stringify(provider))
  expandedId.value = provider.id
  providerNameError.value = ''
  modelIdError.value = ''
  newModelId.value = ''
  newModelName.value = ''
}

function cancelEdit() {
  editingProvider.value = null
  expandedId.value = null
}

function saveEdit() {
  if (!editingProvider.value) return
  if (!editingProvider.value.name.trim()) {
    providerNameError.value = '名称不能为空'
    return
  }
  appStore.updateProvider(editingProvider.value.id, {
    name: editingProvider.value.name.trim(),
    apiHost: editingProvider.value.apiHost.trim(),
    apiKey: editingProvider.value.apiKey,
    models: editingProvider.value.models,
  })
  editingProvider.value = null
  expandedId.value = null
  uiStore.showToast('Provider 已更新')
}

function addModel() {
  if (!editingProvider.value || !newModelId.value.trim()) return
  const id = newModelId.value.trim()
  if (editingProvider.value.models.some(m => m.id === id)) {
    modelIdError.value = `模型 ID "${id}" 已存在`
    return
  }
  modelIdError.value = ''
  editingProvider.value.models.push({
    id,
    name: newModelName.value.trim() || id,
    enabled: true,
  })
  newModelId.value = ''
  newModelName.value = ''
}

function removeModel(modelId: string) {
  if (!editingProvider.value) return
  editingProvider.value.models = editingProvider.value.models.filter(m => m.id !== modelId)
}

function startNewProvider() {
  newProvider.value = {
    id: `provider-${crypto.randomUUID()}`,
    name: '',
    apiHost: '',
    apiKey: '',
    models: [],
    enabled: true,
  }
  showNewProvider.value = true
  providerNameError.value = ''
}

function saveNewProvider() {
  if (!newProvider.value.name.trim()) {
    providerNameError.value = '名称不能为空'
    return
  }
  appStore.addProvider({
    ...newProvider.value,
    name: newProvider.value.name.trim(),
    apiHost: newProvider.value.apiHost.trim(),
  })
  showNewProvider.value = false
  uiStore.showToast('Provider 已创建')
}

function requestDelete(provider: Provider) {
  deleteWarning.value = ''
  deleteConfirmId.value = provider.id
}

function confirmDelete() {
  if (!deleteConfirmId.value) return
  const result = appStore.removeProvider(deleteConfirmId.value)
  if (!result.ok) {
    deleteWarning.value = result.error ?? '无法删除'
    return
  }
  if (expandedId.value === deleteConfirmId.value) {
    expandedId.value = null
    editingProvider.value = null
  }
  deleteConfirmId.value = null
  uiStore.showToast('Provider 已删除')
}

function close() {
  uiStore.modal = ''
}

watch(searchQuery, () => {
  if (expandedId.value && !filteredProviders.value.some(p => p.id === expandedId.value)) {
    expandedId.value = null
    editingProvider.value = null
  }
})
</script>

<template>
  <el-drawer
    v-model="showNewProvider"
    title="新建 Provider"
    direction="rtl"
    size="420px"
    :before-close="(done) => { showNewProvider = false; done() }"
  >
    <el-form label-position="top" class="provider-form">
      <el-form-item label="名称">
        <el-input v-model="newProvider.name" placeholder="例如：OpenAI" />
      </el-form-item>
      <el-form-item label="API Host">
        <el-input v-model="newProvider.apiHost" placeholder="https://api.example.com" />
      </el-form-item>
      <el-form-item label="API Key">
        <el-input v-model="newProvider.apiKey" type="password" show-password placeholder="sk-..." />
      </el-form-item>
      <el-form-item v-if="providerNameError">
        <el-text type="danger">{{ providerNameError }}</el-text>
      </el-form-item>
      <el-form-item>
        <el-button @click="showNewProvider = false">取消</el-button>
        <el-button type="primary" @click="saveNewProvider">创建</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>

  <el-dialog
    v-model="deleteConfirmId"
    title="确认删除"
    width="360px"
    align-center
  >
    <div v-if="deleteWarning" style="color: var(--el-color-danger); margin-bottom: 8px;">
      {{ deleteWarning }}
    </div>
    <span>该操作不可撤销，确定要删除此 Provider 吗？</span>
    <template #footer>
      <el-button @click="deleteConfirmId = null">取消</el-button>
      <el-button type="danger" @click="confirmDelete">删除</el-button>
    </template>
  </el-dialog>

  <el-drawer
    :model-value="uiStore.modal === 'provider'"
    title="Provider 管理"
    direction="rtl"
    size="500px"
    @close="close"
  >
    <template #header>
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span style="font-size: 16px; font-weight: 600;">Provider 管理</span>
        <span style="font-size: 12px; color: var(--el-text-color-secondary);">
          {{ appStore.providers.length }} 个服务商 · {{ totalModels }} 个模型
        </span>
      </div>
    </template>

    <div class="toolbar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索 Provider 或模型..."
        clearable
        :prefix-icon="''"
      >
        <template #prefix>
          <Icon icon="tabler:search" width="15" />
        </template>
      </el-input>
      <el-radio-group v-model="filterEnabled" size="small">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="enabled">启用</el-radio-button>
        <el-radio-button value="disabled">禁用</el-radio-button>
      </el-radio-group>
      <el-button type="primary" :icon="''" @click="startNewProvider">
        <Icon icon="tabler:plus" width="15" style="margin-right: 4px;" />
        新建
      </el-button>
    </div>

    <div class="provider-list">
      <el-card
        v-for="provider in filteredProviders"
        :key="provider.id"
        shadow="never"
        class="provider-card"
        :class="{ expanded: expandedId === provider.id }"
        body-style="padding: 0;"
      >
        <!-- Collapsed -->
        <div
          v-if="expandedId !== provider.id"
          class="provider-header"
          @click="startEdit(provider)"
        >
          <el-tag
            :type="provider.enabled ? 'success' : 'info'"
            effect="dot"
            size="small"
            round
          />
          <div class="provider-info">
            <div class="provider-name-row">
              <span class="provider-name">{{ provider.name }}</span>
              <el-tag v-if="provider.isSystem" size="small" type="info" effect="plain">系统</el-tag>
              <el-tag v-if="!provider.apiHost" size="small" type="warning" effect="plain">无 Host</el-tag>
            </div>
            <div class="provider-meta">
              <Icon icon="tabler:server" width="11" />
              <span class="truncate">{{ provider.apiHost || '未配置 API Host' }}</span>
              <span class="sep">·</span>
              <Icon icon="tabler:key" width="11" />
              <span>{{ maskKey(provider.apiKey) }}</span>
              <span class="sep">·</span>
              <span>{{ provider.models.length }} 模型</span>
            </div>
          </div>
          <el-switch
            :model-value="provider.enabled"
            @click.stop
            @change="toggleProvider(provider)"
          />
        </div>

        <!-- Expanded -->
        <div v-else class="provider-edit">
          <div class="edit-header">
            <span class="edit-title">编辑 Provider</span>
            <el-button text circle @click="cancelEdit">
              <Icon icon="tabler:x" width="16" />
            </el-button>
          </div>

          <el-form label-position="top" class="edit-form">
            <el-form-item label="名称">
              <el-input v-model="editingProvider!.name" />
            </el-form-item>
            <el-form-item label="API Host">
              <el-input v-model="editingProvider!.apiHost" placeholder="https://api.example.com" />
            </el-form-item>
            <el-form-item label="API Key">
              <el-input v-model="editingProvider!.apiKey" type="password" show-password placeholder="sk-..." />
            </el-form-item>
          </el-form>

          <div class="model-section">
            <div class="model-section-head">
              <span>模型列表 ({{ editingProvider!.models.length }})</span>
            </div>
            <div class="model-add-row">
              <el-input v-model="newModelId" placeholder="模型 ID" @keydown.enter="addModel" />
              <el-input v-model="newModelName" placeholder="显示名（可选）" @keydown.enter="addModel" />
              <el-button type="primary" plain @click="addModel">添加</el-button>
            </div>
            <el-text v-if="modelIdError" type="danger" size="small">{{ modelIdError }}</el-text>

            <div class="model-list">
              <div v-for="model in editingProvider!.models" :key="model.id" class="model-row">
                <div class="model-info">
                  <span class="model-name">{{ model.name }}</span>
                  <span class="model-id">{{ model.id }}</span>
                  <el-tag v-if="model.group" size="small" effect="plain">{{ model.group }}</el-tag>
                </div>
                <el-button text circle size="small" type="danger" @click="removeModel(model.id)">
                  <Icon icon="tabler:trash" width="13" />
                </el-button>
              </div>
              <el-empty v-if="editingProvider!.models.length === 0" description="暂无模型" :image-size="40" />
            </div>
          </div>

          <div class="edit-actions">
            <el-button type="danger" plain @click="requestDelete(editingProvider!)">
              <Icon icon="tabler:trash" width="13" style="margin-right: 4px;" />
              删除
            </el-button>
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" @click="saveEdit">保存</el-button>
          </div>
        </div>
      </el-card>

      <el-empty
        v-if="filteredProviders.length === 0"
        description="未找到匹配的 Provider"
        :image-size="60"
      />
    </div>
  </el-drawer>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}
.toolbar .el-button {
  align-self: flex-start;
}

.provider-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.provider-card {
  border: 1px solid var(--el-border-color-lighter);
  transition: border-color 0.2s;
}
.provider-card.expanded {
  border-color: var(--el-color-primary);
}

.provider-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  cursor: pointer;
}
.provider-header:hover {
  background: var(--el-fill-color-light);
}

.provider-info {
  min-width: 0;
  flex: 1;
}
.provider-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.provider-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.provider-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.provider-meta .truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 220px;
}
.sep {
  opacity: 0.5;
}

.provider-edit {
  padding: 14px;
}
.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.edit-title {
  font-size: 14px;
  font-weight: 600;
}
.edit-form {
  margin-bottom: 8px;
}
.edit-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.model-section {
  margin-top: 8px;
}
.model-section-head {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.model-add-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.model-add-row .el-input {
  flex: 1;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
}
.model-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}
.model-info {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.model-name {
  font-size: 13px;
  font-weight: 600;
}
.model-id {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-family: ui-monospace, monospace;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}
.edit-actions .el-button--danger {
  margin-right: auto;
}

.provider-form {
  padding: 0 4px;
}
.provider-form :deep(.el-form-item) {
  margin-bottom: 16px;
}
</style>
