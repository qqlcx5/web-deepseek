<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { AssistantObject as Assistant, ModelRef, AssistantSettings } from '@/types'
import { useAppStore } from '@/stores/app'

const props = defineProps<{
  visible: boolean
  assistant?: Assistant
}>()

const emit = defineEmits<{
  save: [data: Partial<Assistant>]
  cancel: []
}>()

const app = useAppStore()
const formRef = ref<FormInstance>()
const activeTab = ref('basic')
const isEdit = computed(() => !!props.assistant)

const defaultSettings: AssistantSettings = {
  temperature: 0.7,
  contextCount: 20,
  enableMaxTokens: false,
  maxTokens: 4096,
  streamOutput: true,
  topP: 1,
  enableTopP: false,
  toolUseMode: 'prompt',
  customParameters: [],
}

const form = reactive({
  name: '',
  emoji: '🤖',
  description: '',
  prompt: '',
  enabled: true,
  modelId: '',
  defaultModelId: '',
  settings: { ...defaultSettings },
  enableWebSearch: false,
  knowledgeRecognition: 'off' as 'off',
  mcpServersText: '',
  regularPhrasesText: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
}

// 构建按 Provider 分组的模型列表
const groupedModels = computed(() => {
  return app.providers
    .filter(p => p.enabled)
    .map(p => ({
      providerName: p.name,
      providerId: p.id,
      models: p.models,
    }))
    .filter(g => g.models.length > 0)
})

// 将模型 id 映射到 ModelRef
function findModel(modelId: string): ModelRef | undefined {
  for (const p of app.providers) {
    const m = p.models.find(m => m.id === modelId)
    if (m) return { id: m.id, provider: m.provider, name: m.name, group: m.group, supported_text_delta: m.supported_text_delta }
  }
  return undefined
}

watch(() => props.visible, (v) => {
  if (!v) return
  activeTab.value = 'basic'
  if (props.assistant) {
    form.name = props.assistant.name
    form.emoji = props.assistant.emoji
    form.description = props.assistant.description ?? ''
    form.prompt = props.assistant.prompt
    form.enabled = true
    form.modelId = props.assistant.model?.id ?? ''
    form.defaultModelId = props.assistant.defaultModel?.id ?? ''
    form.settings = { ...defaultSettings, ...props.assistant.settings }
    form.enableWebSearch = props.assistant.enableWebSearch ?? false
    form.knowledgeRecognition = props.assistant.knowledgeRecognition ?? 'off'
    form.mcpServersText = (props.assistant.mcpServers ?? []).join(', ')
    form.regularPhrasesText = (props.assistant.regularPhrases ?? []).join('\n')
  } else {
    form.name = ''
    form.emoji = '🤖'
    form.description = ''
    form.prompt = ''
    form.enabled = true
    form.modelId = ''
    form.defaultModelId = ''
    form.settings = { ...defaultSettings }
    form.enableWebSearch = false
    form.knowledgeRecognition = 'off'
    form.mcpServersText = ''
    form.regularPhrasesText = ''
  }
})

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    const model = form.modelId ? findModel(form.modelId) : undefined
    const defaultModel = form.defaultModelId ? findModel(form.defaultModelId) : undefined
    const mcpServers = form.mcpServersText.split(',').map(s => s.trim()).filter(Boolean)
    const regularPhrases = form.regularPhrasesText.split('\n').map(s => s.trim()).filter(Boolean)
    emit('save', {
      name: form.name,
      emoji: form.emoji,
      description: form.description,
      prompt: form.prompt,
      model,
      defaultModel,
      settings: { ...form.settings },
      enableWebSearch: form.enableWebSearch,
      knowledgeRecognition: form.knowledgeRecognition,
    })
  })
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    :title="isEdit ? '编辑助手' : '新增助手'"
    width="680px"
    @close="emit('cancel')"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
      <ElTabs v-model="activeTab">
        <!-- 基本信息 -->
        <ElTabPane label="基本信息" name="basic">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <ElFormItem style="width: 80px;">
              <ElInput v-model="form.emoji" maxlength="2" style="text-align: center; font-size: 20px;" />
            </ElFormItem>
            <ElFormItem label="名称" prop="name" style="flex: 1;">
              <ElInput v-model="form.name" placeholder="助手名称" />
            </ElFormItem>
          </div>
          <ElFormItem label="描述">
            <ElInput v-model="form.description" placeholder="简短描述" />
          </ElFormItem>
          <ElFormItem label="Prompt">
            <ElInput v-model="form.prompt" type="textarea" :rows="5" placeholder="系统提示词" />
          </ElFormItem>
          <ElFormItem label="启用">
            <ElSwitch v-model="form.enabled" />
          </ElFormItem>
        </ElTabPane>

        <!-- 模型 -->
        <ElTabPane label="模型" name="model">
          <ElFormItem label="模型">
            <ElSelect v-model="form.modelId" placeholder="选择模型" filterable clearable style="width: 100%">
              <ElOptionGroup v-for="g in groupedModels" :key="g.providerId" :label="g.providerName">
                <ElOption v-for="m in g.models" :key="m.id" :label="m.name" :value="m.id" />
              </ElOptionGroup>
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="默认模型">
            <ElSelect v-model="form.defaultModelId" placeholder="选择默认模型" filterable clearable style="width: 100%">
              <ElOptionGroup v-for="g in groupedModels" :key="g.providerId" :label="g.providerName">
                <ElOption v-for="m in g.models" :key="m.id" :label="m.name" :value="m.id" />
              </ElOptionGroup>
            </ElSelect>
          </ElFormItem>
        </ElTabPane>

        <!-- 设置 -->
        <ElTabPane label="设置" name="settings">
          <ElFormItem label="启用 Temperature">
            <ElSwitch v-model="form.settings.enableTemperature" />
          </ElFormItem>
          <ElFormItem label="Temperature">
            <ElSlider v-model="form.settings.temperature" :min="0" :max="2" :step="0.1" :disabled="!form.settings.enableTemperature" show-input />
          </ElFormItem>
          <ElFormItem label="上下文条数">
            <ElInputNumber v-model="form.settings.contextCount" :min="0" :max="100" />
          </ElFormItem>
          <ElFormItem label="启用 Max Tokens">
            <ElSwitch v-model="form.settings.enableMaxTokens" />
          </ElFormItem>
          <ElFormItem label="Max Tokens">
            <ElInputNumber v-model="form.settings.maxTokens" :min="1" :max="32768" :disabled="!form.settings.enableMaxTokens" />
          </ElFormItem>
          <ElFormItem label="流式输出">
            <ElSwitch v-model="form.settings.streamOutput" />
          </ElFormItem>
          <ElFormItem label="启用 Top P">
            <ElSwitch v-model="form.settings.enableTopP" />
          </ElFormItem>
          <ElFormItem label="Top P">
            <ElSlider v-model="form.settings.topP" :min="0" :max="1" :step="0.05" :disabled="!form.settings.enableTopP" show-input />
          </ElFormItem>
          <ElFormItem label="Tool Use Mode">
            <ElSelect v-model="form.settings.toolUseMode" style="width: 100%">
              <ElOption label="Prompt" value="prompt" />
              <ElOption label="Function" value="function" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Reasoning Effort">
            <ElSelect v-model="form.settings.reasoning_effort" clearable placeholder="不设置" style="width: 100%">
              <ElOption label="low" value="low" />
              <ElOption label="medium" value="medium" />
              <ElOption label="high" value="high" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Qwen Think Mode">
            <ElSwitch v-model="form.settings.qwenThinkMode" />
          </ElFormItem>
        </ElTabPane>

        <!-- 功能 -->
        <ElTabPane label="功能" name="features">
          <ElFormItem label="启用 Web 搜索">
            <ElSwitch v-model="form.enableWebSearch" />
          </ElFormItem>
          <ElFormItem label="知识识别">
            <ElSelect v-model="form.knowledgeRecognition" style="width: 100%">
              <ElOption label="关闭" value="off" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="MCP Servers（逗号分隔）">
            <ElInput v-model="form.mcpServersText" placeholder="server1, server2" />
          </ElFormItem>
          <ElFormItem label="常用短语（每行一条）">
            <ElInput v-model="form.regularPhrasesText" type="textarea" :rows="4" placeholder="每行一条" />
          </ElFormItem>
        </ElTabPane>
      </ElTabs>
    </ElForm>
    <template #footer>
      <ElButton @click="emit('cancel')">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>
