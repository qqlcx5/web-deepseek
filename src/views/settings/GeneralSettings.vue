<template>
  <div class="general-settings">
    <h2 class="section-title">通用设置</h2>
    <el-form label-width="140px" label-position="left">
      <!-- 语言 -->
      <el-form-item label="语言">
        <el-select
          :model-value="settingsStore.settings.language"
          @update:model-value="onUpdate('language', $event)"
        >
          <el-option label="中文" value="zh-CN" />
          <el-option label="English" value="en-US" />
          <el-option label="自动" value="auto" />
        </el-select>
      </el-form-item>

      <!-- 主题 -->
      <el-form-item label="主题">
        <el-radio-group
          :model-value="settingsStore.settings.theme"
          @update:model-value="onUpdate('theme', $event)"
        >
          <el-radio value="light">亮色</el-radio>
          <el-radio value="dark">暗色</el-radio>
          <el-radio value="system">跟随系统</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 字体大小 -->
      <el-form-item label="字体大小">
        <el-select
          :model-value="settingsStore.settings.fontSize"
          @update:model-value="onUpdate('fontSize', $event)"
        >
          <el-option label="小" value="small" />
          <el-option label="中" value="medium" />
          <el-option label="大" value="large" />
        </el-select>
      </el-form-item>

      <!-- Enter 发送 -->
      <el-form-item label="Enter 发送">
        <el-switch
          :model-value="settingsStore.settings.sendOnEnter"
          @update:model-value="onUpdate('sendOnEnter', $event)"
        />
        <span class="form-hint">关闭后使用 Ctrl+Enter 发送</span>
      </el-form-item>

      <!-- 自动生成标题 -->
      <el-form-item label="自动生成标题">
        <el-switch
          :model-value="settingsStore.settings.autoGenerateTitle"
          @update:model-value="onUpdate('autoGenerateTitle', $event)"
        />
      </el-form-item>

      <!-- 流式响应 -->
      <el-form-item label="默认流式响应">
        <el-switch
          :model-value="settingsStore.settings.streamResponse"
          @update:model-value="onUpdate('streamResponse', $event)"
        />
      </el-form-item>

      <!-- 保存对话历史 -->
      <el-form-item label="保存对话历史">
        <el-switch
          :model-value="settingsStore.settings.saveHistory"
          @update:model-value="onUpdate('saveHistory', $event)"
        />
        <span class="form-hint">关闭后不会在服务端保存对话记录</span>
      </el-form-item>

      <!-- 分享使用数据 -->
      <el-form-item label="分享使用数据">
        <el-switch
          :model-value="settingsStore.settings.shareUsageData"
          @update:model-value="onUpdate('shareUsageData', $event)"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/modules/settings'
import type { UserSettings } from '@/types/settings'

const settingsStore = useSettingsStore()

function onUpdate<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
  settingsStore.updateSettings({ [key]: value })
}
</script>

<style scoped lang="scss">
.general-settings {
  max-width: 600px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px;
  color: var(--text-primary, #111827);
}

.form-hint {
  margin-left: 12px;
  font-size: 13px;
  color: var(--text-muted, #9ca3af);
}
</style>
