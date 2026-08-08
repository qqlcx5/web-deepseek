<template>
  <div class="provider-settings">
    <div class="provider-settings__header">
      <h3 class="provider-settings__title">模型提供商</h3>
      <ElButton type="primary" size="small" @click="showAddForm = true">
        添加自定义 Provider
      </ElButton>
    </div>

    <div class="provider-list">
      <ElCard
        v-for="provider in modelStore.providers"
        :key="provider.id"
        shadow="never"
        class="provider-card"
      >
        <div class="provider-card__header">
          <div class="provider-card__info">
            <span class="provider-card__logo">{{ provider.logo || '🔌' }}</span>
            <div>
              <div class="provider-card__name">{{ provider.name }}</div>
              <div class="provider-card__url">{{ provider.apiHost }}</div>
            </div>
          </div>
          <div class="provider-card__actions">
            <span
              class="connection-dot"
              :class="`connection-dot--${provider.connectionStatus || 'unknown'}`"
              :title="connectionTitle(provider.connectionStatus)"
            />
            <ElSwitch
              :model-value="provider.enabled"
              @change="() => {}"
            />
          </div>
        </div>

        <div class="provider-card__body">
          <ElForm label-position="top" size="small">
            <ElFormItem label="API Key">
              <ElInput
                :model-value="provider.apiKey || ''"
                type="password"
                show-password
                placeholder="输入 API Key"
                @change="(val: string) => handleSaveKey(provider.id, val)"
              />
            </ElFormItem>

            <ElFormItem v-if="provider.isCustom" label="Base URL">
              <ElInput
                :model-value="provider.apiHost"
                placeholder="https://api.example.com/v1"
              />
            </ElFormItem>
          </ElForm>

          <div class="provider-card__actions-row">
            <ElButton size="small" @click="handleTest(provider.id)">
              测试连接
            </ElButton>
            <ElButton size="small" type="danger" plain @click="handleRemoveKey(provider.id)">
              移除 Key
            </ElButton>
            <ElButton
              v-if="provider.isCustom"
              size="small"
              type="danger"
              plain
              @click="handleDelete(provider.id)"
            >
              删除
            </ElButton>
          </div>
        </div>
      </ElCard>

      <div v-if="modelStore.providers.length === 0 && !showAddForm" class="provider-list__empty">
        暂无 Provider，请添加
      </div>
    </div>

    <!-- 添加自定义 Provider 弹窗 -->
    <ElDialog
      v-model="showAddForm"
      title="添加自定义 Provider"
      width="480px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <ElForm ref="addFormRef" :model="addForm" :rules="addFormRules" label-position="top">
        <ElFormItem label="Provider 名称" prop="name">
          <ElInput v-model="addForm.name" placeholder="如: My OpenAI Endpoint" maxlength="50" />
        </ElFormItem>
        <ElFormItem label="Base URL" prop="baseUrl">
          <ElInput v-model="addForm.baseUrl" placeholder="https://api.openai.com/v1" />
        </ElFormItem>
        <ElFormItem label="API Key" prop="apiKey">
          <ElInput v-model="addForm.apiKey" type="password" show-password placeholder="sk-..." />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="showAddForm = false">取消</ElButton>
        <ElButton type="primary" :loading="adding" @click="handleAdd">添加</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElSwitch,
  ElButton,
  ElDialog,
  ElMessageBox,
} from 'element-plus'
import { useModelStore } from '@/stores/modules/model'
import type { FormInstance, FormRules } from 'element-plus'

const modelStore = useModelStore()

const showAddForm = ref(false)
const adding = ref(false)
const addFormRef = ref<FormInstance>()

const addForm = reactive({
  name: '',
  baseUrl: '',
  apiKey: '',
})

const addFormRules: FormRules = {
  name: [{ required: true, message: '请输入 Provider 名称', trigger: 'blur' }],
  baseUrl: [{ required: true, message: '请输入 Base URL', trigger: 'blur' }],
  apiKey: [{ required: true, message: '请输入 API Key', trigger: 'blur' }],
}

function connectionTitle(status?: string): string {
  switch (status) {
    case 'connected': return '已连接'
    case 'disconnected': return '连接失败'
    default: return '未测试'
  }
}

async function handleSaveKey(providerId: string, key: string) {
  if (!key) return
  await modelStore.saveApiKey({ providerId, apiKey: key })
}

async function handleTest(providerId: string) {
  await modelStore.testConnection(providerId)
}

async function handleRemoveKey(providerId: string) {
  try {
    await ElMessageBox.confirm('确定要移除 API Key 吗？', '提示', { type: 'warning' })
    await modelStore.removeApiKey(providerId)
  } catch {
    // 取消
  }
}

async function handleDelete(providerId: string) {
  try {
    await ElMessageBox.confirm('确定要删除此自定义 Provider 吗？此操作不可撤销。', '删除 Provider', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
    })
    await modelStore.deleteCustomProvider(providerId)
  } catch {
    // 取消
  }
}

async function handleAdd() {
  const valid = await addFormRef.value?.validate().catch(() => false)
  if (!valid) return

  adding.value = true
  try {
    await modelStore.addCustomProvider({
      name: addForm.name,
      baseUrl: addForm.baseUrl,
      apiKey: addForm.apiKey,
    })
    showAddForm.value = false
  } finally {
    adding.value = false
  }
}

onMounted(() => {
  if (modelStore.providers.length === 0) {
    modelStore.fetchProviders()
  }
})
</script>

<script lang="ts">
export default { name: 'ProviderSettingsPage' }
</script>

<style lang="scss" scoped>
.provider-settings {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 0;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
}

.provider-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__empty {
    text-align: center;
    padding: 48px 0;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.provider-card {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  &__logo {
    font-size: 28px;
    flex-shrink: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
  }

  &__url {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  &__body {
    padding-top: 8px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &__actions-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.connection-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;

  &--connected {
    background-color: #67c23a;
  }

  &--disconnected {
    background-color: #f56c6c;
  }

  &--unknown {
    background-color: #c0c4cc;
  }
}
</style>
