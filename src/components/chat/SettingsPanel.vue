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
  <section class="dialog settings-dialog">
    <header class="dialog-head">
      <div>
        <div class="dialog-title">设置</div>
        <div class="dialog-subtitle">管理应用偏好设置</div>
      </div>
      <button class="icon-btn" @click="close">
        <Icon icon="tabler:x" />
      </button>
    </header>

    <div class="dialog-body scroll">
      <section class="panel-section management-section">
        <div class="panel-heading">
          <Icon icon="tabler:tool" width="14" />
          模型与助手
        </div>
        <div class="management-grid">
          <button
            v-for="action in managementActions"
            :key="action.modal"
            class="management-action"
            @click="uiStore.modal = action.modal"
          >
            <Icon :icon="`tabler:${action.icon}`" width="16" />
            <span class="management-copy">
              <span>{{ action.label }}</span>
              <small>{{ action.description }}</small>
            </span>
            <Icon icon="tabler:chevron-right" width="14" />
          </button>
        </div>
      </section>

      <section
        v-for="group in groups"
        :key="group.title"
        class="panel-section"
      >
        <div class="panel-heading">
          <Icon :icon="`tabler:${group.icon}`" width="14" />
          {{ group.title }}
        </div>

        <div
          v-for="item in group.items"
          :key="String(item.key)"
          class="setting-row"
        >
          <label class="setting-label">{{ item.label }}</label>

          <label v-if="item.type === 'toggle'" class="toggle">
            <input
              type="checkbox"
              :checked="Boolean(settings[item.key])"
              @change="updateSetting(item.key, ($event.target as HTMLInputElement).checked)"
            />
            <span class="toggle-slider" />
          </label>

          <select
            v-else-if="item.type === 'select'"
            :value="String(settings[item.key] ?? '')"
            class="setting-select"
            @change="updateSetting(item.key, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">未设置</option>
            <option v-for="opt in item.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <input
            v-else-if="item.type === 'number'"
            type="number"
            :value="settings[item.key] as number ?? ''"
            :placeholder="item.placeholder"
            class="setting-input"
            @change="updateSetting(item.key, Number(($event.target as HTMLInputElement).value))"
          />

          <input
            v-else-if="item.type === 'input'"
            type="text"
            :value="String(settings[item.key] ?? '')"
            :placeholder="item.placeholder"
            class="setting-input"
            @change="updateSetting(item.key, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.settings-dialog {
  position: fixed; z-index: 80; top: 50%; left: 50%;
  width: min(520px, calc(100vw - 28px));
  max-height: min(680px, calc(100dvh - 28px));
  display: flex; flex-direction: column;
  overflow: hidden; background: var(--surface); border: 1px solid var(--line);
  border-radius: 8px; box-shadow: var(--shadow-lg);
  transform: translate(-50%, -50%);
}
.dialog-head { display: flex; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line); flex-shrink: 0; }
.dialog-title { font-size: 13px; font-weight: 750; color: var(--text); }
.dialog-subtitle { margin-top: 3px; color: var(--faint); font-size: 10px; }
.dialog-head .icon-btn { margin-top: -4px; }
.dialog-body { padding: 12px 16px; overflow-y: auto; }

.panel-section { padding: 3px 0 15px; border-bottom: 1px solid var(--line); }
.panel-section + .panel-section { padding-top: 15px; }
.panel-section:last-child { border-bottom: 0; }
.panel-heading { display: flex; align-items: center; gap: 6px; margin-bottom: 9px; color: var(--text-secondary); font-size: 11px; font-weight: 700; }
.management-grid { display: grid; gap: 6px; }
.management-action { display: flex; width: 100%; min-width: 0; align-items: center; gap: 9px; padding: 8px; color: var(--text-secondary); background: var(--surface-2); border: 1px solid var(--line); border-radius: 6px; text-align: left; cursor: pointer; }
.management-action:hover { color: var(--text); border-color: var(--brand); }
.management-action > :first-child { color: var(--brand); flex: 0 0 auto; }
.management-action > :last-child { color: var(--faint); flex: 0 0 auto; }
.management-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 2px; font-size: 11px; font-weight: 650; }
.management-copy small { overflow: hidden; color: var(--faint); font-size: 9px; font-weight: 400; text-overflow: ellipsis; white-space: nowrap; }

.setting-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 0; }
.setting-label { font-size: 11px; color: var(--text-secondary); }

.setting-select {
  height: 28px; padding: 0 6px; color: var(--text); background: var(--surface-2);
  border: 1px solid var(--line); border-radius: 5px; font-size: 10px; outline: 0; min-width: 120px;
}
.setting-select:focus { border-color: var(--brand); }
.setting-input {
  height: 28px; width: 100px; padding: 0 6px; color: var(--text); background: var(--surface-2);
  border: 1px solid var(--line); border-radius: 5px; font-size: 10px; outline: 0;
}
.setting-input:focus { border-color: var(--brand); }

.toggle { position: relative; display: inline-block; width: 32px; height: 18px; flex-shrink: 0; cursor: pointer; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: var(--line-strong); border-radius: 999px; transition: 140ms; }
.toggle-slider::before { content: ''; position: absolute; width: 14px; height: 14px; top: 2px; left: 2px; background: white; border-radius: 50%; transition: 140ms; }
.toggle input:checked + .toggle-slider { background: var(--brand); }
.toggle input:checked + .toggle-slider::before { transform: translateX(14px); }

.icon-btn { display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; border-radius: 6px; color: var(--muted); background: transparent; border: 0; cursor: pointer; transition: background 140ms, color 140ms; }
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }

@media (max-width: 760px) {
  .settings-dialog { top: auto; right: 0; bottom: 0; left: 0; width: 100%; max-height: 88dvh; border-right: 0; border-bottom: 0; border-left: 0; border-radius: 8px 8px 0 0; transform: none; }
}
</style>
