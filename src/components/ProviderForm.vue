<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Provider, ProviderType } from '@/types'

const props = defineProps<{
  visible: boolean
  provider?: Provider
}>()

const emit = defineEmits<{
  save: [data: Partial<Provider>]
  cancel: []
}>()

const formRef = ref<FormInstance>()
const isEdit = computed(() => !!props.provider)

const providerTypes: { label: string; value: ProviderType }[] = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Gemini', value: 'gemini' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'Azure OpenAI', value: 'azure-openai' },
  { label: 'Mistral', value: 'mistral' },
  { label: 'Vertex AI', value: 'vertexai' },
]

const form = reactive({
  name: '',
  type: 'openai' as ProviderType,
  apiHost: '',
  apiKey: '',
  enabled: true,
  isNotSupportArrayContent: false,
  isNotSupportDeveloperRole: false,
  isNotSupportStreamOptions: false,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  apiHost: [
    { required: true, message: '请输入 API Host', trigger: 'blur' },
    { pattern: /^https?:\/\//, message: '需以 http:// 或 https:// 开头', trigger: 'blur' },
  ],
}

watch(() => props.visible, (v) => {
  if (!v) return
  if (props.provider) {
    form.name = props.provider.name
    form.type = props.provider.type
    form.apiHost = props.provider.apiHost
    form.apiKey = props.provider.apiKey ?? ''
    form.enabled = props.provider.enabled
    const opts = props.provider.apiOptions ?? {
      isNotSupportArrayContent: props.provider.isNotSupportArrayContent ?? false,
      isNotSupportDeveloperRole: props.provider.isNotSupportDeveloperRole ?? false,
      isNotSupportStreamOptions: props.provider.isNotSupportStreamOptions ?? false,
    }
    form.isNotSupportArrayContent = opts.isNotSupportArrayContent
    form.isNotSupportDeveloperRole = opts.isNotSupportDeveloperRole
    form.isNotSupportStreamOptions = opts.isNotSupportStreamOptions
  } else {
    form.name = ''
    form.type = 'openai'
    form.apiHost = ''
    form.apiKey = ''
    form.enabled = true
    form.isNotSupportArrayContent = false
    form.isNotSupportDeveloperRole = false
    form.isNotSupportStreamOptions = false
  }
})

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    emit('save', {
      name: form.name,
      type: form.type,
      apiHost: form.apiHost,
      apiKey: form.apiKey,
      enabled: form.enabled,
      apiOptions: {
        isNotSupportArrayContent: form.isNotSupportArrayContent,
        isNotSupportDeveloperRole: form.isNotSupportDeveloperRole,
        isNotSupportStreamOptions: form.isNotSupportStreamOptions,
      },
    })
  })
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    :title="isEdit ? '编辑 Provider' : '新增 Provider'"
    width="560px"
    @close="emit('cancel')"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px" label-position="top">
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="form.name" placeholder="例如 OpenAI" />
      </ElFormItem>
      <ElFormItem label="类型" prop="type">
        <ElSelect v-model="form.type" placeholder="选择类型" style="width: 100%">
          <ElOption v-for="t in providerTypes" :key="t.value" :label="t.label" :value="t.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="API Host" prop="apiHost">
        <ElInput v-model="form.apiHost" placeholder="https://api.openai.com/v1" />
      </ElFormItem>
      <ElFormItem label="API Key" prop="apiKey">
        <ElInput v-model="form.apiKey" type="password" show-password placeholder="sk-..." />
      </ElFormItem>
      <ElFormItem label="启用">
        <ElSwitch v-model="form.enabled" />
      </ElFormItem>
      <ElDivider content-position="left">API 兼容选项</ElDivider>
      <ElFormItem label="不支持 Array Content">
        <ElSwitch v-model="form.isNotSupportArrayContent" />
      </ElFormItem>
      <ElFormItem label="不支持 Developer Role">
        <ElSwitch v-model="form.isNotSupportDeveloperRole" />
      </ElFormItem>
      <ElFormItem label="不支持 Stream Options">
        <ElSwitch v-model="form.isNotSupportStreamOptions" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="emit('cancel')">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>
