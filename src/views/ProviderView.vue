<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import type { Provider, ModelInfo } from '@/types'
import ProviderForm from '@/components/ProviderForm.vue'

const app = useAppStore()

// ===== Provider 表单 =====
const providerFormVisible = ref(false)
const editingProvider = ref<Provider | undefined>()
const expandedProvider = ref<string[]>([])

function openCreateProvider() {
  editingProvider.value = undefined
  providerFormVisible.value = true
}

function openEditProvider(p: Provider) {
  editingProvider.value = p
  providerFormVisible.value = true
}

function handleProviderSave(data: Partial<Provider>) {
  if (editingProvider.value) {
    app.updateProvider(editingProvider.value.id, data)
    ElMessage.success('Provider 已更新')
  } else {
    app.createProvider(data)
    ElMessage.success('Provider 已创建')
  }
  providerFormVisible.value = false
}

async function handleDeleteProvider(p: Provider) {
  if (p.isSystem) return
  try {
    await ElMessageBox.confirm(`确认删除 Provider「${p.name}」？`, '删除确认', { type: 'warning' })
  } catch { return }
  const result = app.deleteProvider(p.id)
  if (!result.ok) {
    ElMessageBox.alert(`无法删除，以下助手正在引用：\n${result.refs.join('、')}`, '引用保护', { type: 'warning' })
  } else {
    ElMessage.success('Provider 已删除')
  }
}

function toggleProviderEnabled(p: Provider) {
  app.updateProvider(p.id, { enabled: !p.enabled })
}

// ===== 模型 CRUD =====
const modelDialogVisible = ref(false)
const modelEditingProvider = ref<Provider | undefined>()
const modelForm = ref({ id: '', name: '', group: '', enabled: true })
const isModelEdit = ref(false)

function openCreateModel(p: Provider) {
  modelEditingProvider.value = p
  isModelEdit.value = false
  modelForm.value = { id: '', name: '', group: p.name, enabled: true }
  modelDialogVisible.value = true
}

function openEditModel(p: Provider, m: ModelInfo) {
  modelEditingProvider.value = p
  isModelEdit.value = true
  modelForm.value = { id: m.id, name: m.name, group: m.group, enabled: m.enabled }
  modelDialogVisible.value = true
}

function handleModelSave() {
  const p = modelEditingProvider.value
  if (!p) return
  if (!modelForm.value.id || !modelForm.value.name) {
    ElMessage.warning('模型 ID 和名称不能为空')
    return
  }
  if (isModelEdit.value) {
    app.updateModel(p.id, modelForm.value.id, {
      name: modelForm.value.name,
      group: modelForm.value.group,
      enabled: modelForm.value.enabled,
    })
    ElMessage.success('模型已更新')
  } else {
    app.createModel(p.id, {
      id: modelForm.value.id,
      name: modelForm.value.name,
      group: modelForm.value.group,
      enabled: modelForm.value.enabled,
    })
    ElMessage.success('模型已创建')
  }
  modelDialogVisible.value = false
}

async function handleDeleteModel(p: Provider, m: ModelInfo) {
  try {
    await ElMessageBox.confirm(`确认删除模型「${m.name}」？`, '删除确认', { type: 'warning' })
  } catch { return }
  const result = app.deleteModel(p.id, m.id)
  if (!result.ok) {
    ElMessageBox.alert(`无法删除，以下助手正在引用：\n${result.refs.join('、')}`, '引用保护', { type: 'warning' })
  } else {
    ElMessage.success('模型已删除')
  }
}

function toggleModelEnabled(p: Provider, m: ModelInfo) {
  app.updateModel(p.id, m.id, { enabled: !m.enabled })
}
</script>

<template>
  <main class="provider-main">
    <header class="page-header">
      <h1 class="text-lg font-semibold">Provider 管理</h1>
      <ElButton type="primary" @click="openCreateProvider">新增 Provider</ElButton>
    </header>

    <section class="provider-body scrollbar">
      <ElTable
        :data="app.providers"
        row-key="id"
        :expand-row-keys="expandedProvider"
        @expand-change="(rows: Provider[]) => expandedProvider = rows.map(r => r.id)"
        stripe
      >
        <ElTableColumn type="expand">
          <template #default="{ row }">
            <div class="model-expand">
              <div class="model-expand-header">
                <span class="model-expand-title">模型列表（{{ row.models.length }}）</span>
                <ElButton size="small" type="primary" @click="openCreateModel(row)">添加模型</ElButton>
              </div>
              <ElTable :data="row.models" size="small" border>
                <ElTableColumn prop="id" label="ID" width="200" />
                <ElTableColumn prop="name" label="名称" />
                <ElTableColumn prop="group" label="分组" width="120" />
                <ElTableColumn label="状态" width="100">
                  <template #default="{ row: m }">
                    <ElSwitch :model-value="m.enabled" @change="toggleModelEnabled(row, m)" size="small" />
                  </template>
                </ElTableColumn>
                <ElTableColumn label="操作" width="160">
                  <template #default="{ row: m }">
                    <ElButton size="small" link @click="openEditModel(row, m)">编辑</ElButton>
                    <ElButton size="small" link type="danger" @click="handleDeleteModel(row, m)">删除</ElButton>
                  </template>
                </ElTableColumn>
              </ElTable>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="name" label="名称" />
        <ElTableColumn prop="type" label="类型" width="140" />
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <ElSwitch :model-value="row.enabled" @change="toggleProviderEnabled(row)" size="small" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="模型数" width="80">
          <template #default="{ row }">{{ row.models.length }}</template>
        </ElTableColumn>
        <ElTableColumn label="系统" width="80">
          <template #default="{ row }">
            <ElTag v-if="row.isSystem" size="small" type="info">系统</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="180">
          <template #default="{ row }">
            <ElButton size="small" link @click="openEditProvider(row)">编辑</ElButton>
            <ElButton size="small" link type="danger" :disabled="row.isSystem" @click="handleDeleteProvider(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </section>

    <ProviderForm
      :visible="providerFormVisible"
      :provider="editingProvider"
      @save="handleProviderSave"
      @cancel="providerFormVisible = false"
    />

    <ElDialog v-model="modelDialogVisible" :title="isModelEdit ? '编辑模型' : '新增模型'" width="460px">
      <ElForm :model="modelForm" label-position="top">
        <ElFormItem label="模型 ID">
          <ElInput v-model="modelForm.id" :disabled="isModelEdit" placeholder="例如 gpt-4o" />
        </ElFormItem>
        <ElFormItem label="显示名称">
          <ElInput v-model="modelForm.name" placeholder="例如 GPT-4o" />
        </ElFormItem>
        <ElFormItem label="分组">
          <ElInput v-model="modelForm.group" placeholder="例如 OpenAI" />
        </ElFormItem>
        <ElFormItem label="启用">
          <ElSwitch v-model="modelForm.enabled" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="modelDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleModelSave">保存</ElButton>
      </template>
    </ElDialog>
  </main>
</template>

<style scoped lang="scss">
.provider-main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  shrink: 0;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  background: #fff;
}
.provider-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
.model-expand {
  padding: 16px 24px;
  background: #fafbfc;
}
.model-expand-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.model-expand-title {
  font-weight: 500;
  font-size: 14px;
}
</style>
