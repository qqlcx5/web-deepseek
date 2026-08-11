<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import { createWebDAVRemote } from '@/services/remote/webdav.client'
import type { WebDAVConfig } from '@/services/remote/types'

const props = defineProps<{
  modelValue: WebDAVConfig
  autoSync: boolean
  autoSyncInterval: number
}>()

const emit = defineEmits<{
  'update:modelValue': [v: WebDAVConfig]
  'update:autoSync': [v: boolean]
  'update:autoSyncInterval': [v: number]
}>()

const testing = ref(false)
const testResult = ref<{ ok: boolean; message: string } | null>(null)

const local = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function patch<K extends keyof WebDAVConfig>(key: K, value: WebDAVConfig[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

async function handleTest() {
  const cfg = props.modelValue
  if (!cfg.url) {
    ElMessage.warning('请先填写 WebDAV 地址')
    return
  }
  testing.value = true
  testResult.value = null
  try {
    const transport = createWebDAVRemote(cfg)
    const result = await transport.test()
    testResult.value = result
  } catch (e) {
    testResult.value = { ok: false, message: e instanceof Error ? e.message : String(e) }
  } finally {
    testing.value = false
  }
}
</script>

<template>
  <div class="webdav-form">
    <div class="form-row">
      <label>地址 <span class="required">*</span></label>
      <el-input
        :model-value="local.url"
        size="small"
        placeholder="https://dav.example.com/dav"
        @update:model-value="(v: string) => patch('url', v)"
      />
    </div>
    <div class="form-row">
      <label>用户名</label>
      <el-input
        :model-value="local.username"
        size="small"
        placeholder="admin"
        @update:model-value="(v: string) => patch('username', v)"
      />
    </div>
    <div class="form-row">
      <label>密码</label>
      <el-input
        :model-value="local.password"
        size="small"
        type="password"
        show-password
        placeholder="****"
        @update:model-value="(v: string) => patch('password', v)"
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
      <label>自动同步</label>
      <el-switch
        :model-value="autoSync"
        size="small"
        @change="(val: string | number | boolean) => emit('update:autoSync', Boolean(val))"
      />
    </div>
    <div v-if="autoSync" class="form-row">
      <label>间隔（分钟）</label>
      <el-input-number
        :model-value="autoSyncInterval"
        :min="1"
        :max="1440"
        size="small"
        controls-position="right"
        style="width: 120px;"
        @change="(v: number | undefined) => emit('update:autoSyncInterval', v ?? 30)"
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
.webdav-form { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
.form-row { display: flex; align-items: center; gap: 8px; }
.form-row label { width: 100px; font-size: 12px; color: var(--el-text-color-secondary); flex-shrink: 0; text-align: right; }
.form-row label .required { color: var(--el-color-danger); }
.form-row :deep(.el-input) { flex: 1; }
.toggle-row { justify-content: flex-start; }
.test-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.test-status { font-size: 12px; display: flex; align-items: center; gap: 4px; }
.test-status.ok { color: var(--el-color-success); }
.test-status.fail { color: var(--el-color-danger); }
</style>
