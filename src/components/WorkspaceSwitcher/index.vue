<template>
  <div class="workspace-switcher">
    <ElDropdown trigger="click" @command="handleDropdownCommand">
      <div class="workspace-switcher__trigger">
        <span class="workspace-switcher__icon">{{ currentIcon }}</span>
        <span class="workspace-switcher__name">{{ currentName }}</span>
        <span class="workspace-switcher__arrow">
          <i class="el-icon-arrow-down" />
        </span>
      </div>

      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem
            v-for="ws in workspaceStore.workspaces"
            :key="ws.id"
            :command="{ action: 'switch', id: ws.id }"
            :class="{ 'is-active': ws.id === workspaceStore.currentWorkspaceId }"
          >
            <span class="dropdown-item__icon">{{ ws.icon || '📁' }}</span>
            <span class="dropdown-item__name">{{ ws.name }}</span>
            <span v-if="ws.id === workspaceStore.currentWorkspaceId" class="dropdown-item__check">✓</span>
          </ElDropdownItem>
          <ElDropdownItem divided :command="{ action: 'create' }">
            + 新建工作区
          </ElDropdownItem>
          <ElDropdownItem :command="{ action: 'manage' }">
            管理工作区
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>

    <!-- 创建工作区弹窗 -->
    <ElDialog
      v-model="createModalVisible"
      title="新建工作区"
      width="480px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <ElForm
        ref="createFormRef"
        :model="createForm"
        :rules="createFormRules"
        label-position="top"
      >
        <ElFormItem label="工作区名称" prop="name">
          <ElInput v-model="createForm.name" placeholder="输入工作区名称" maxlength="50" show-word-limit />
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="createForm.description"
            type="textarea"
            placeholder="可选，简要描述工作区用途"
            maxlength="200"
            show-word-limit
            :rows="3"
          />
        </ElFormItem>
        <ElFormItem label="图标" prop="icon">
          <div class="icon-picker">
            <span
              v-for="emoji in emojiOptions"
              :key="emoji"
              class="icon-picker__option"
              :class="{ 'is-selected': createForm.icon === emoji }"
              @click="createForm.icon = emoji"
            >
              {{ emoji }}
            </span>
          </div>
        </ElFormItem>
        <ElFormItem label="默认模型" prop="defaultModelId">
          <ElSelect v-model="createForm.defaultModelId" placeholder="选择默认模型" clearable>
            <ElOption
              v-for="model in modelStore.modelList"
              :key="model.modelName"
              :label="model.modelName"
              :value="model.modelName"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="createModalVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="creating" @click="handleCreate">创建</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElMessage,
} from 'element-plus'
import { useWorkspaceStore } from '@/stores/modules/workspace'
import { useModelStore } from '@/stores/modules/model'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const workspaceStore = useWorkspaceStore()
const modelStore = useModelStore()

const createModalVisible = ref(false)
const creating = ref(false)
const createFormRef = ref<FormInstance>()

const emojiOptions = ['📁', '🚀', '💼', '🏠', '📚', '🎯', '💡', '⭐']

interface CreateForm {
  name: string
  description: string
  icon: string
  defaultModelId: string
}

const createForm = ref<CreateForm>({
  name: '',
  description: '',
  icon: '📁',
  defaultModelId: '',
})

const createFormRules: FormRules = {
  name: [
    { required: true, message: '请输入工作区名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度 1-50 字符', trigger: 'blur' },
  ],
}

const currentIcon = computed(() => workspaceStore.currentWorkspace?.icon || '📁')
const currentName = computed(() => workspaceStore.currentWorkspace?.name || '默认工作区')

function handleDropdownCommand(command: { action: string; id?: string }) {
  switch (command.action) {
    case 'switch':
      if (command.id) {
        workspaceStore.setCurrentWorkspace(command.id)
        ElMessage.success(`已切换到「${workspaceStore.currentWorkspace?.name}」`)
      }
      break
    case 'create':
      createForm.value = { name: '', description: '', icon: '📁', defaultModelId: '' }
      createModalVisible.value = true
      break
    case 'manage':
      router.push({ path: '/settings', query: { section: 'workspace' } })
      break
  }
}

async function handleCreate() {
  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) return

  creating.value = true
  try {
    await workspaceStore.createWorkspace({
      name: createForm.value.name,
      description: createForm.value.description || undefined,
      icon: createForm.value.icon,
      defaultModelId: createForm.value.defaultModelId || undefined,
    })
    createModalVisible.value = false
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  if (workspaceStore.workspaces.length === 0) {
    workspaceStore.fetchWorkspaces()
  }
})
</script>

<style lang="scss" scoped>
.workspace-switcher {
  &__trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    user-select: none;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  &__icon {
    font-size: 18px;
    line-height: 1;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 160px;
  }

  &__arrow {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    transition: transform 0.2s;
  }
}

.dropdown-item {
  &__icon {
    margin-right: 6px;
  }

  &__name {
    flex: 1;
  }

  &__check {
    margin-left: auto;
    color: var(--el-color-primary);
  }
}

.el-dropdown-menu__item.is-active {
  color: var(--el-color-primary);
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
