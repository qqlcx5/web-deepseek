<template>
  <div class="workspace-settings-panel">
    <template v-if="workspace">
      <!-- 通用设置 -->
      <ElCard shadow="never" class="settings-section">
        <template #header>
          <span class="section-title">通用设置</span>
        </template>

        <ElForm :model="generalForm" label-position="top" :disabled="saving">
          <ElFormItem label="工作区名称">
            <ElInput v-model="generalForm.name" placeholder="输入工作区名称" maxlength="50" show-word-limit />
          </ElFormItem>

          <ElFormItem label="图标">
            <div class="icon-picker">
              <span
                v-for="emoji in emojiOptions"
                :key="emoji"
                class="icon-picker__option"
                :class="{ 'is-selected': generalForm.icon === emoji }"
                @click="generalForm.icon = emoji"
              >
                {{ emoji }}
              </span>
            </div>
          </ElFormItem>

          <ElFormItem label="描述">
            <ElInput
              v-model="generalForm.description"
              type="textarea"
              placeholder="可选，简要描述工作区用途"
              maxlength="200"
              show-word-limit
              :rows="3"
            />
          </ElFormItem>
        </ElForm>
      </ElCard>

      <!-- 默认值设置 -->
      <ElCard shadow="never" class="settings-section">
        <template #header>
          <span class="section-title">默认值设置</span>
        </template>

        <ElForm :model="defaultsForm" label-position="top" :disabled="saving">
          <ElFormItem label="默认模型">
            <ElSelect v-model="defaultsForm.defaultModelId" placeholder="选择默认模型" clearable>
              <ElOption
                v-for="model in modelStore.modelList"
                :key="model.modelName"
                :label="model.modelName"
                :value="model.modelName"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="系统提示词">
            <ElInput
              v-model="defaultsForm.defaultPrompt"
              type="textarea"
              placeholder="设置此工作区的默认系统提示词"
              :rows="4"
              maxlength="2000"
              show-word-limit
            />
          </ElFormItem>

          <ElFormItem label="Temperature">
            <div class="slider-wrapper">
              <ElSlider
                v-model="defaultsForm.defaultTemperature"
                :min="0"
                :max="2"
                :step="0.1"
                :marks="temperatureMarks"
                show-input
                :show-tooltip="false"
              />
            </div>
          </ElFormItem>

          <ElFormItem label="Top-P">
            <div class="slider-wrapper">
              <ElSlider
                v-model="defaultsForm.defaultTopP"
                :min="0"
                :max="1"
                :step="0.05"
                :marks="topPMarks"
                show-input
                :show-tooltip="false"
              />
            </div>
          </ElFormItem>
        </ElForm>
      </ElCard>

      <!-- 操作区 -->
      <ElCard shadow="never" class="settings-section settings-section--danger">
        <template #header>
          <span class="section-title">操作</span>
        </template>

        <div class="action-buttons">
          <ElButton type="primary" :loading="saving" @click="handleSave">
            保存设置
          </ElButton>
          <ElButton @click="handleExport">
            导出工作区
          </ElButton>
          <ElButton type="danger" @click="handleDelete">
            删除工作区
          </ElButton>
        </div>
      </ElCard>
    </template>

    <div v-else class="workspace-settings-panel__empty">
      请先选择一个工作区
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import {
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElSlider,
  ElButton,
} from 'element-plus'
import { useWorkspaceStore } from '@/stores/modules/workspace'
import { useModelStore } from '@/stores/modules/model'

const workspaceStore = useWorkspaceStore()
const modelStore = useModelStore()

const saving = ref(false)

const emojiOptions = ['📁', '🚀', '💼', '🏠', '📚', '🎯', '💡', '⭐']

const temperatureMarks = { 0: '0', 0.5: '0.5', 1: '1', 1.5: '1.5', 2: '2' }
const topPMarks = { 0: '0', 0.5: '0.5', 1: '1' }

const workspace = ref(workspaceStore.currentWorkspace)

const generalForm = reactive({
  name: '',
  icon: '📁',
  description: '',
})

const defaultsForm = reactive({
  defaultModelId: '',
  defaultPrompt: '',
  defaultTemperature: 1,
  defaultTopP: 1,
})

function syncFromWorkspace() {
  const ws = workspaceStore.currentWorkspace
  workspace.value = ws
  if (ws) {
    generalForm.name = ws.name
    generalForm.icon = ws.icon || '📁'
    generalForm.description = ws.description || ''
    defaultsForm.defaultModelId = ws.defaultModelId || ''
    defaultsForm.defaultPrompt = ws.defaultPrompt || ''
    defaultsForm.defaultTemperature = ws.defaultTemperature ?? 1
    defaultsForm.defaultTopP = ws.defaultTopP ?? 1
  }
}

syncFromWorkspace()

watch(() => workspaceStore.currentWorkspaceId, () => {
  syncFromWorkspace()
})

async function handleSave() {
  if (!workspace.value) return

  saving.value = true
  try {
    await workspaceStore.updateWorkspace(workspace.value.id, {
      name: generalForm.name,
      description: generalForm.description || undefined,
      icon: generalForm.icon,
      defaultModelId: defaultsForm.defaultModelId || undefined,
      defaultPrompt: defaultsForm.defaultPrompt || undefined,
      defaultTemperature: defaultsForm.defaultTemperature,
      defaultTopP: defaultsForm.defaultTopP,
    })
  } finally {
    saving.value = false
  }
}

function handleExport() {
  if (workspace.value) {
    workspaceStore.exportWorkspace(workspace.value.id)
  }
}

function handleDelete() {
  if (workspace.value) {
    workspaceStore.deleteWorkspace(workspace.value.id)
  }
}
</script>

<style lang="scss" scoped>
.workspace-settings-panel {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 0;

  &__empty {
    text-align: center;
    padding: 48px 0;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.settings-section {
  margin-bottom: 16px;

  &--danger {
    border-color: var(--el-color-danger-light-5);
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.icon-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  &__option {
    font-size: 24px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.2s, background-color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.is-selected {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }
}

.slider-wrapper {
  padding: 0 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
