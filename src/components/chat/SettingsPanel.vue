<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'
import type { Settings } from '@/types'

const appStore = useAppStore()
const uiStore = useUiStore()

const settings = computed(() => appStore.settings)

const managementActions = [
  { label: 'Provider 与模型', description: 'API 服务商、密钥和模型列表', icon: 'server', modal: 'provider' as const },
  { label: 'Assistant', description: '提示词、默认助手和话题归属', icon: 'robot', modal: 'assistant' as const },
  { label: '系统提示词', description: '编辑当前会话的回答规则', icon: 'message-cog', modal: 'prompt' as const },
]

interface SettingItem {
  key: keyof Settings
  label: string
  type: 'toggle' | 'select' | 'input' | 'number'
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface SettingGroup {
  title: string
  icon: string
  items: SettingItem[]
}

const groups: SettingGroup[] = [
  {
    title: '通用',
    icon: 'settings',
    items: [
      { key: 'language', label: '语言', type: 'select', options: [
        { value: 'zh-CN', label: '简体中文' },
        { value: 'en-US', label: 'English' },
      ] },
      { key: 'theme', label: '主题', type: 'select', options: [
        { value: 'light', label: '亮色' },
        { value: 'dark', label: '暗色' },
        { value: 'auto', label: '跟随系统' },
      ] },
      { key: 'fontSize', label: '字体大小', type: 'number', placeholder: '14' },
      { key: 'sendShortcut', label: '发送消息快捷键', type: 'select', options: [
        { value: 'Enter', label: 'Enter' },
        { value: 'Ctrl+Enter', label: 'Ctrl+Enter' },
        { value: 'Shift+Enter', label: 'Shift+Enter' },
      ] },
      { key: 'autoCheckUpdate', label: '自动检查更新', type: 'toggle' },
    ],
  },
  {
    title: '外观',
    icon: 'palette',
    items: [
      { key: 'messageStyle', label: '消息样式', type: 'select', options: [
        { value: 'plain', label: '平铺' },
        { value: 'bubble', label: '气泡' },
      ] },
      { key: 'messageFont', label: '消息字体', type: 'select', options: [
        { value: 'system', label: '系统默认' },
        { value: 'serif', label: '衬线' },
        { value: 'mono', label: '等宽' },
      ] },
      { key: 'codeShowLineNumbers', label: '代码显示行号', type: 'toggle' },
      { key: 'codeWrappable', label: '代码可换行', type: 'toggle' },
      { key: 'codeCollapsible', label: '代码可折叠', type: 'toggle' },
      { key: 'foldDisplayMode', label: '折叠显示模式', type: 'select', options: [
        { value: 'full', label: '完整' },
        { value: 'compact', label: '简洁' },
      ] },
    ],
  },
  {
    title: '消息',
    icon: 'message',
    items: [
      { key: 'confirmDeleteMessage', label: '确认删除消息', type: 'toggle' },
      { key: 'confirmRegenerateMessage', label: '确认重新生成', type: 'toggle' },
      { key: 'showTokens', label: '显示 Token 数', type: 'toggle' },
      { key: 'showMessageDivider', label: '显示消息分隔线', type: 'toggle' },
      { key: 'showMessageOutline', label: '显示消息大纲', type: 'toggle' },
      { key: 'messageNavigation', label: '消息导航', type: 'toggle' },
    ],
  },
  {
    title: '话题',
    icon: 'messages',
    items: [
      { key: 'enableTopicNaming', label: '自动命名话题', type: 'toggle' },
      { key: 'pinTopicsToTop', label: '置顶话题', type: 'toggle' },
      { key: 'showTopics', label: '显示话题列表', type: 'toggle' },
      { key: 'showTopicTime', label: '显示话题时间', type: 'toggle' },
    ],
  },
  {
    title: '高级',
    icon: 'adjustments',
    items: [
      { key: 'pasteLongTextAsFile', label: '长文本粘贴为文件', type: 'toggle' },
      { key: 'pasteLongTextThreshold', label: '长文本阈值（字符）', type: 'number', placeholder: '1500' },
      { key: 'renderInputMessageAsMarkdown', label: '输入消息渲染 Markdown', type: 'toggle' },
      { key: 'mathEngine', label: '数学公式引擎', type: 'select', options: [
        { value: 'katex', label: 'KaTeX' },
        { value: 'mathjax', label: 'MathJax' },
      ] },
      { key: 'targetLanguage', label: '目标翻译语言', type: 'input', placeholder: '中文' },
    ],
  },
]

function updateSetting(key: keyof Settings, value: unknown) {
  appStore.updateSettings({ [key]: value } as Partial<Settings>)
}

function close() {
  uiStore.modal = ''
}
</script>

<template>
  <el-drawer
    :model-value="uiStore.modal === 'settings'"
    title="设置"
    direction="rtl"
    size="480px"
    @close="close"
  >
    <div class="settings-body">
      <!-- Management shortcuts -->
      <div class="management-section">
        <div class="section-title">
          <Icon icon="tabler:tool" width="15" />
          模型与助手
        </div>
        <div class="management-grid">
          <div
            v-for="action in managementActions"
            :key="action.modal"
            class="management-action"
            @click="uiStore.modal = action.modal"
          >
            <Icon :icon="`tabler:${action.icon}`" width="18" />
            <div class="management-copy">
              <span class="management-label">{{ action.label }}</span>
              <span class="management-desc">{{ action.description }}</span>
            </div>
            <Icon icon="tabler:chevron-right" width="16" />
          </div>
        </div>
      </div>

      <!-- Setting groups -->
      <div
        v-for="group in groups"
        :key="group.title"
        class="setting-group"
      >
        <div class="section-title">
          <Icon :icon="`tabler:${group.icon}`" width="15" />
          {{ group.title }}
        </div>

        <div
          v-for="item in group.items"
          :key="String(item.key)"
          class="setting-row"
        >
          <span class="setting-label">{{ item.label }}</span>

          <el-switch
            v-if="item.type === 'toggle'"
            :model-value="Boolean(settings[item.key])"
            @change="(val: string | number | boolean) => updateSetting(item.key, val)"
          />

          <el-select
            v-else-if="item.type === 'select'"
            :model-value="String(settings[item.key] ?? '')"
            size="small"
            style="width: 140px;"
            @change="(val: string) => updateSetting(item.key, val)"
          >
            <el-option value="" label="未设置" />
            <el-option
              v-for="opt in item.options"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            />
          </el-select>

          <el-input-number
            v-else-if="item.type === 'number'"
            :model-value="settings[item.key] as number ?? 0"
            :placeholder="item.placeholder"
            size="small"
            controls-position="right"
            style="width: 120px;"
            @change="(val: number | undefined) => updateSetting(item.key, val ?? 0)"
          />

          <el-input
            v-else-if="item.type === 'input'"
            :model-value="String(settings[item.key] ?? '')"
            :placeholder="item.placeholder"
            size="small"
            style="width: 140px;"
            @change="(val: string) => updateSetting(item.key, val)"
          />
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.settings-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 10px;
}

.management-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.management-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.management-action {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.management-action:hover {
  border-color: var(--el-color-primary);
}
.management-action > :first-child {
  color: var(--el-color-primary);
  flex-shrink: 0;
}
.management-action > :last-child {
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}
.management-copy {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}
.management-label {
  font-size: 13px;
  font-weight: 600;
}
.management-desc {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.setting-group {
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.setting-group:last-child {
  border-bottom: none;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
}
.setting-label {
  font-size: 13px;
  color: var(--el-text-color-primary);
}
</style>
