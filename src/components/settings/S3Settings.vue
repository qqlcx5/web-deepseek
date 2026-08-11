<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import { createS3Remote } from '@/services/remote/s3.client'
import type { S3Config } from '@/services/remote/types'

const props = defineProps<{
  modelValue: S3Config
}>()

const emit = defineEmits<{
  'update:modelValue': [v: S3Config]
}>()

const testing = ref(false)
const testResult = ref<{ ok: boolean; message: string } | null>(null)
const showSecret = ref(false)

const local = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function patch<K extends keyof S3Config>(key: K, value: S3Config[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

async function handleTest() {
  const cfg = props.modelValue
  if (!cfg.endpoint || !cfg.bucket) {
    ElMessage.warning('请先填写 Endpoint 和 Bucket')
    return
  }
  testing.value = true
  testResult.value = null
  try {
    const transport = createS3Remote(cfg)
    const result = await transport.test()
    testResult.value = result
  } catch (e) {
    testResult.value = { ok: false, message: e instanceof Error ? e.message : String(e) }
  } finally {
    testing.value = false
  }
}

function maskValue(v: string | undefined): string {
  if (!v) return ''
  return v.length > 16 ? v.slice(0, 4) + '****' + v.slice(-4) : '****'
}
</script>

<template>
  <div class="s3-form">
    <div class="form-row">
      <label>Endpoint <span class="required">*</span></label>
      <el-input
        :model-value="local.endpoint"
        size="small"
        placeholder="https://s3.amazonaws.com"
        @update:model-value="(v: string) => patch('endpoint', v)"
      />
    </div>
    <div class="form-row">
      <label>Region</label>
      <el-input
        :model-value="local.region"
        size="small"
        placeholder="us-east-1"
        @update:model-value="(v: string) => patch('region', v)"
      />
    </div>
    <div class="form-row">
      <label>Bucket <span class="required">*</span></label>
      <el-input
        :model-value="local.bucket"
        size="small"
        placeholder="my-bucket"
        @update:model-value="(v: string) => patch('bucket', v)"
      />
    </div>
    <div class="form-row">
      <label>Access Key ID</label>
      <el-input
        :model-value="showSecret ? local.accessKeyId : maskValue(local.accessKeyId)"
        size="small"
        placeholder="AKIA..."
        @focus="showSecret = true"
        @update:model-value="(v: string) => patch('accessKeyId', v)"
      />
    </div>
    <div class="form-row">
      <label>Secret Access Key</label>
      <el-input
        :model-value="showSecret ? local.secretAccessKey : maskValue(local.secretAccessKey)"
        size="small"
        type="password"
        show-password
        placeholder="****"
        @focus="showSecret = true"
        @update:model-value="(v: string) => patch('secretAccessKey', v)"
      />
    </div>
    <div class="form-row">
      <label>Base Path</label>
      <el-input
        :model-value="local.basePath"
        size="small"
        placeholder="/orbit-chat"
        @update:model-value="(v: string) => patch('basePath', v)"
      />
    </div>
    <div class="form-row toggle-row">
      <label>Path-Style 寻址</label>
      <el-switch
        :model-value="local.forcePathStyle"
        size="small"
        @change="(val: string | number | boolean) => patch('forcePathStyle', Boolean(val))"
      />
    </div>

    <div class="test-row">
      <el-button size="small" :loading="testing" @click="handleTest">
        <Icon icon="tabler:plug-connected" width="14" style="margin-right: 4px;" />
        测试连接
      </el-button>
      <span v-if="testResult" class="test-status" :class="testResult.ok ? 'ok' : 'fail'">
        <Icon :icon="testResult.ok ? 'tabler:circle-check' : 'tabler:alert-circle'" width="14" />
        {{ testResult.message }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.s3-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
.form-row { display: flex; align-items: center; gap: 8px; }
.form-row label { width: 110px; font-size: 12px; color: var(--el-text-color-secondary); flex-shrink: 0; text-align: right; }
.form-row label .required { color: var(--el-color-danger); }
.form-row :deep(.el-input) { flex: 1; }
.toggle-row { justify-content: flex-start; }
.test-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.test-status { font-size: 12px; display: flex; align-items: center; gap: 4px; }
.test-status.ok { color: var(--el-color-success); }
.test-status.fail { color: var(--el-color-danger); }
</style>
