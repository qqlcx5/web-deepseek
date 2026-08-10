<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'
import { ElMessage } from 'element-plus'
import type { Assistant } from '@/types'

const appStore = useAppStore()
const uiStore = useUiStore()

const expandedId = ref<string | null>(null)
const editingAssistant = ref<Assistant | null>(null)
const isNew = ref(false)
const showDeleteDialog = ref(false)
const deletingId = ref('')
const migrationTargetId = ref('')

const availableModels = computed(() =>
  appStore.providers
    .filter(p => p.enabled)
    .flatMap(p =>
      p.models
        .filter(m => m.enabled)
        .map(m => ({ id: m.id, name: m.name, providerName: p.name })),
    ),
)

const migrationTargets = computed(() =>
  appStore.assistants.filter(a => a.id !== deletingId.value),
)

function startEdit(assistant: Assistant) {
  editingAssistant.value = JSON.parse(JSON.stringify(assistant))
  expandedId.value = assistant.id
  isNew.value = false
}

function startNew() {
  const createdAt = new Date().toISOString()
  editingAssistant.value = {
    id: `assistant-${crypto.randomUUID()}`,
    name: '新助手',
    prompt: '',
    enabled: true,
    isDefault: false,
    emoji: '🤖',
    temperature: 0.7,
    createdAt,
    updatedAt: createdAt,
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

function requestDelete(assistant: Assistant) {
  const topicCount = appStore.topicCountByAssistant(assistant.id)
  if (topicCount === 0) {
    const result = appStore.removeAssistant(assistant.id)
    if (result.ok) uiStore.showToast('助手已删除')
    else ElMessage.error(result.error ?? '删除失败')
    return
  }
  deletingId.value = assistant.id
  migrationTargetId.value = migrationTargets.value[0]?.id ?? ''
  showDeleteDialog.value = true
}

async function completeDelete(cascade: boolean) {
  if (!deletingId.value) return
  const result = appStore.removeAssistant(
    deletingId.value,
    cascade ? { cascade: true } : { targetAssistantId: migrationTargetId.value },
  )
  if (!result.ok) {
    ElMessage.error(result.error ?? '删除失败')
    return
  }
  if (expandedId.value === deletingId.value) {
    expandedId.value = null
    editingAssistant.value = null
  }
  showDeleteDialog.value = false
  deletingId.value = ''
  uiStore.showToast(cascade ? '助手及其 Topic 已删除' : 'Topic 已迁移，助手已删除')
}

function setDefault(assistant: Assistant) {
  if (assistant.isDefault) return
  appStore.updateAssistant(assistant.id, { isDefault: true })
  uiStore.showToast(`已将「${assistant.name}」设为默认助手`)
}

function close() {
  uiStore.modal = ''
}
</script>

<template>
  <el-drawer
    :model-value="uiStore.modal === 'assistant'"
    title="助手管理"
    direction="rtl"
    size="480px"
    @close="close"
  >
    <template #header>
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <span style="font-size: 16px; font-weight: 600;">助手管理</span>
        <span style="font-size: 12px; color: var(--el-text-color-secondary);">
          管理 AI 助手配置（{{ appStore.assistants.length }} 个）
        </span>
      </div>
    </template>

    <template #default>
      <div class="assistant-list">
        <el-card
          v-for="assistant in appStore.assistants"
          :key="assistant.id"
          shadow="never"
          class="assistant-card"
          :class="{ expanded: expandedId === assistant.id }"
          body-style="padding: 0;"
        >
          <!-- Collapsed -->
          <div
            v-if="expandedId !== assistant.id"
            class="assistant-header"
            @click="startEdit(assistant)"
          >
            <span class="assistant-emoji">{{ assistant.emoji || '🤖' }}</span>
            <div class="assistant-info">
              <div class="assistant-name">{{ assistant.name }}</div>
              <div class="assistant-meta">
                {{ assistant.model || '默认模型' }}
                <span v-if="assistant.enableWebSearch"> · 🔍 联网</span>
                <span v-if="assistant.isDefault"> · 默认</span>
              </div>
            </div>
            <el-button
              v-if="!assistant.isDefault"
              text
              circle
              size="small"
              @click.stop="setDefault(assistant)"
            >
              <Icon icon="tabler:star" width="14" />
            </el-button>
            <el-button
              v-if="!assistant.isDefault"
              text
              circle
              size="small"
              type="danger"
              @click.stop="requestDelete(assistant)"
            >
              <Icon icon="tabler:trash" width="14" />
            </el-button>
          </div>

          <!-- Expanded -->
          <div v-else class="assistant-edit">
            <div class="edit-header">
              <span class="edit-title">{{ isNew ? '新建助手' : '编辑助手' }}</span>
              <el-button text circle @click="cancelEdit">
                <Icon icon="tabler:x" width="16" />
              </el-button>
            </div>

            <el-form label-position="top" class="edit-form">
              <el-form-item label="名称">
                <el-input v-model="editingAssistant!.name" />
              </el-form-item>
              <el-form-item label="Emoji">
                <el-input v-model="editingAssistant!.emoji" maxlength="4" style="width: 80px;" />
              </el-form-item>
              <el-form-item label="系统提示词">
                <el-input
                  v-model="editingAssistant!.prompt"
                  type="textarea"
                  :rows="4"
                  placeholder="输入系统提示词..."
                />
              </el-form-item>
              <el-form-item label="模型">
                <el-select
                  v-model="editingAssistant!.model"
                  clearable
                  placeholder="默认模型"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="m in availableModels"
                    :key="m.id"
                    :value="m.id"
                    :label="`${m.providerName} · ${m.name}`"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Temperature: {{ editingAssistant!.temperature ?? 0.7 }}">
                <el-slider
                  v-model="editingAssistant!.temperature"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  show-input
                  :show-input-controls="false"
                  style="width: 100%;"
                />
              </el-form-item>
              <el-form-item>
                <div class="toggle-row">
                  <span>联网搜索</span>
                  <el-switch v-model="editingAssistant!.enableWebSearch" />
                </div>
              </el-form-item>
            </el-form>

            <div class="edit-actions">
              <el-button
                v-if="!isNew"
                type="danger"
                plain
                @click="requestDelete(editingAssistant!)"
              >
                <Icon icon="tabler:trash" width="13" style="margin-right: 4px;" />
                删除
              </el-button>
              <el-button @click="cancelEdit">取消</el-button>
              <el-button type="primary" @click="saveEdit">保存</el-button>
            </div>
          </div>
        </el-card>

        <el-empty
          v-if="appStore.assistants.length === 0"
          description="暂无助手"
          :image-size="60"
        />
      </div>
    </template>

    <template #footer>
      <el-button type="primary" @click="startNew">
        <Icon icon="tabler:plus" width="15" style="margin-right: 4px;" />
        新建助手
      </el-button>
    </template>
  </el-drawer>

  <!-- Delete with migration dialog -->
  <el-dialog
    v-model="showDeleteDialog"
    title="处理关联 Topic"
    width="400px"
    align-center
  >
    <p style="margin-bottom: 12px;">
      该助手仍有关联 Topic。迁移可保留对话；级联删除不可撤销。
    </p>
    <el-select
      v-model="migrationTargetId"
      placeholder="选择迁移目标助手"
      style="width: 100%;"
    >
      <el-option
        v-for="a in migrationTargets"
        :key="a.id"
        :value="a.id"
        :label="a.name"
      />
    </el-select>
    <template #footer>
      <el-button @click="showDeleteDialog = false">取消</el-button>
      <el-button type="warning" :disabled="!migrationTargetId" @click="completeDelete(false)">
        迁移并删除
      </el-button>
      <el-button type="danger" @click="completeDelete(true)">级联删除</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.assistant-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assistant-card {
  border: 1px solid var(--el-border-color-lighter);
  transition: border-color 0.2s;
}
.assistant-card.expanded {
  border-color: var(--el-color-primary);
}

.assistant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  cursor: pointer;
}
.assistant-header:hover {
  background: var(--el-fill-color-light);
}

.assistant-emoji {
  font-size: 20px;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}

.assistant-info {
  min-width: 0;
  flex: 1;
}
.assistant-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.assistant-meta {
  margin-top: 3px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.assistant-edit {
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
.edit-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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
</style>
