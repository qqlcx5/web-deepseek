<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import type { Assistant } from '@/types'
import AssistantForm from '@/components/AssistantForm.vue'

const app = useAppStore()

// ===== Assistant 表单 =====
const assistantFormVisible = ref(false)
const editingAssistant = ref<Assistant | undefined>()

function openCreateAssistant() {
  editingAssistant.value = undefined
  assistantFormVisible.value = true
}

function openEditAssistant(a: Assistant) {
  editingAssistant.value = a
  assistantFormVisible.value = true
}

function handleAssistantSave(data: Partial<Assistant>) {
  if (editingAssistant.value) {
    app.updateAssistant(editingAssistant.value.id, data)
    ElMessage.success('助手已更新')
  } else {
    app.createAssistant(data)
    ElMessage.success('助手已创建')
  }
  assistantFormVisible.value = false
}

// ===== 启用/禁用 =====
function toggleEnabled(a: Assistant) {
  app.updateAssistant(a.id, { enabled: !a.enabled })
}

// ===== 设为默认 =====
function handleSetDefault(a: Assistant) {
  if (a.isDefault) return
  app.setDefaultAssistant(a.id)
  ElMessage.success(`已将「${a.name}」设为默认助手`)
}

// ===== 删除（带 Topic 迁移/级联） =====
async function handleDeleteAssistant(a: Assistant) {
  if (a.id === 'default') {
    ElMessage.warning('默认助手不可删除')
    return
  }
  const topicCount = app.topics.filter(t => t.assistantId === a.id).length
  if (topicCount === 0) {
    try {
      await ElMessageBox.confirm(`确认删除助手「${a.name}」？`, '删除确认', { type: 'warning' })
      app.deleteAssistant(a.id)
      ElMessage.success('助手已删除')
    } catch { /* cancelled */ }
    return
  }
  // 有 Topic，选择迁移或级联
  const otherAssistants = app.assistants.filter(x => x.id !== a.id)

  const choice = await new Promise<'migrate' | 'cascade' | null>((resolve) => {
    ElMessageBox.confirm(
      `助手「${a.name}」有 ${topicCount} 个关联话题。\n点击「迁移话题」将话题迁移到其他助手，点击「级联删除」将同时删除话题。`,
      '删除助手',
      { confirmButtonText: '迁移话题', cancelButtonText: '级联删除', distinguishCancelAndClose: true, type: 'warning' }
    ).then(() => resolve('migrate')).catch((err) => {
      if (err === 'cancel') resolve('cascade')
      else resolve(null)
    })
  })

  if (choice === null) return

  if (choice === 'migrate') {
    if (otherAssistants.length === 0) {
      ElMessage.warning('没有其他助手可迁移')
      return
    }
    const targetIds = otherAssistants.map(x => `${x.emoji} ${x.name} (${x.id})`)
    let selectedTarget = ''
    try {
      const result = await ElMessageBox.prompt(
        `可迁移目标：\n${targetIds.join('\n')}\n\n请输入目标助手 ID：`,
        '选择迁移目标',
        { confirmButtonText: '迁移', cancelButtonText: '取消' }
      )
      selectedTarget = result.value
    } catch { return }

    const target = otherAssistants.find(x => x.id === selectedTarget || x.name === selectedTarget)
    if (!target) {
      ElMessage.error('未找到目标助手')
      return
    }
    app.deleteAssistant(a.id, { migrateTo: target.id })
    ElMessage.success(`助手已删除，话题已迁移到「${target.name}」`)
  } else {
    app.deleteAssistant(a.id, { cascade: true })
    ElMessage.success(`助手及 ${topicCount} 个话题已删除`)
  }
}

// ===== 导入助手 =====
const importDialogVisible = ref(false)
const importText = ref('')

function openImportDialog() {
  importText.value = ''
  importDialogVisible.value = true
}

function handleImportFromText() {
  try {
    const data = JSON.parse(importText.value)
    const arr = Array.isArray(data) ? data : [data]
    const result = app.importAssistants(arr)
    ElMessage.success(`导入完成：成功 ${result.imported}，跳过 ${result.skipped}`)
    importDialogVisible.value = false
  } catch {
    ElMessage.error('JSON 解析失败')
  }
}

function handleImportFile(file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string)
      const arr = Array.isArray(data) ? data : [data]
      const result = app.importAssistants(arr)
      ElMessage.success(`导入完成：成功 ${result.imported}，跳过 ${result.skipped}`)
    } catch {
      ElMessage.error('文件解析失败')
    }
  }
  reader.readAsText(file)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) handleImportFile(input.files[0])
}
</script>

<template>
  <main class="assistant-main">
    <header class="page-header">
      <h1 class="text-lg font-semibold">助手管理</h1>
      <div style="display: flex; gap: 8px;">
        <ElButton @click="openImportDialog">导入</ElButton>
        <ElButton type="primary" @click="openCreateAssistant">新增助手</ElButton>
      </div>
    </header>

    <section class="assistant-body scrollbar">
      <ElTable :data="app.assistants" stripe>
        <ElTableColumn label="" width="60">
          <template #default="{ row }">
            <span style="font-size: 20px;">{{ row.emoji }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="name" label="名称" />
        <ElTableColumn label="模型" width="200">
          <template #default="{ row }">{{ row.model?.name ?? '未设置' }}</template>
        </ElTableColumn>
        <ElTableColumn label="默认" width="80">
          <template #default="{ row }">
            <ElTag v-if="row.isDefault" size="small" type="success">默认</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <ElSwitch :model-value="row.enabled" @change="toggleEnabled(row)" size="small" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="240">
          <template #default="{ row }">
            <ElButton size="small" link @click="openEditAssistant(row)">编辑</ElButton>
            <ElButton size="small" link :disabled="row.isDefault" @click="handleSetDefault(row)">设为默认</ElButton>
            <ElButton size="small" link type="danger" :disabled="row.id === 'default'" @click="handleDeleteAssistant(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </section>

    <AssistantForm
      :visible="assistantFormVisible"
      :assistant="editingAssistant"
      @save="handleAssistantSave"
      @cancel="assistantFormVisible = false"
    />

    <ElDialog v-model="importDialogVisible" title="导入助手" width="560px">
      <ElUpload :auto-upload="false" :show-file-list="false" accept=".json" :on-change="onFileChange" drag>
        <div style="padding: 20px; text-align: center;">
          <i class="i-tabler-upload" style="font-size: 32px; color: #999;" />
          <div style="margin-top: 8px; color: #667085;">点击或拖拽 JSON 文件到此处</div>
        </div>
      </ElUpload>
      <ElDivider>或粘贴 JSON</ElDivider>
      <ElInput v-model="importText" type="textarea" :rows="6" placeholder='[{ "id": "...", "name": "..." }]' />
      <template #footer>
        <ElButton @click="importDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleImportFromText">从文本导入</ElButton>
      </template>
    </ElDialog>
  </main>
</template>

<style scoped lang="scss">
.assistant-main {
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
.assistant-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
