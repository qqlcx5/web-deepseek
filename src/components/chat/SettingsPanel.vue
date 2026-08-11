<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { useTheme } from '@/composables/useTheme'
import { Icon } from '@iconify/vue'
import type { Settings } from '@/types'
import StorageSettings from '@/components/settings/StorageSettings.vue'
import SyncPanel from '@/components/settings/SyncPanel.vue'
import DataManager from '@/components/settings/DataManager.vue'

const appStore = useAppStore()
const uiStore = useUiStore()
const { setTheme } = useTheme()

const settings = computed(() => appStore.settings)

// ── PRD 4.6 field whitelist ────────────────────────────────────────────────────
// Only these Settings fields are rendered/persisted by this panel.
const WHITELIST = new Set<keyof Settings>([
  'theme',
  'fontSize',
  'messageStyle',
  'messageFont',
  'showMessageDivider',
  'codeShowLineNumbers',
  'codeWrappable',
  'codeCollapsible',
  'foldDisplayMode',
  'mathEngine',
  'sendShortcut',
  'autoScroll',
  'showInputEstimatedTokens',
  'renderInputMessageAsMarkdown',
  'confirmDeleteMessage',
  'confirmRegenerateMessage',
  'showTokens',
  'showMessageOutline',
  'messageNavigation',
  'enableTopicNaming',
  'pinTopicsToTop',
  'showTopics',
  'showTopicTime',
  'pasteLongTextAsFile',
  'pasteLongTextThreshold',
  'language',
])

// ── Management shortcuts ──────────────────────────────────────────────────────
const managementActions = [
  { label: 'Provider 与模型', description: 'API 服务商、密钥和模型列表', icon: 'server', modal: 'provider' as const },
  { label: 'Assistant', description: '提示词、默认助手和话题归属', icon: 'robot', modal: 'assistant' as const },
  { label: '系统提示词', description: '编辑当前会话的回答规则', icon: 'message-cog', modal: 'prompt' as const },
]

// ── Setting item types ────────────────────────────────────────────────────────
interface SettingItem {
  key: keyof Settings
  label: string
  desc?: string
  type: 'toggle' | 'select' | 'input' | 'number' | 'slider'
  options?: { value: string; label: string }[]
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

interface SettingGroup {
  title: string
  icon: string
  desc: string
  items: SettingItem[]
}

// ── Groups per PRD 4.6 ────────────────────────────────────────────────────────
const groups: SettingGroup[] = [
  {
    title: '外观',
    icon: 'palette',
    desc: '界面显示与消息样式，修改后立即生效',
    items: [
      {
        key: 'theme',
        label: '主题',
        desc: '亮色 / 暗色 / 跟随系统',
        type: 'select',
        options: [
          { value: 'light', label: '亮色' },
          { value: 'dark', label: '暗色' },
          { value: 'auto', label: '跟随系统' },
        ],
      },
      {
        key: 'fontSize',
        label: '字体大小',
        desc: '消息正文与界面文字大小',
        type: 'slider',
        min: 12,
        max: 20,
        step: 1,
      },
      {
        key: 'messageStyle',
        label: '消息样式',
        desc: '平铺或气泡',
        type: 'select',
        options: [
          { value: 'plain', label: '平铺' },
          { value: 'bubble', label: '气泡' },
        ],
      },
      {
        key: 'messageFont',
        label: '消息字体',
        desc: '消息正文字体族',
        type: 'select',
        options: [
          { value: 'system', label: '系统默认' },
          { value: 'serif', label: '衬线' },
          { value: 'mono', label: '等宽' },
        ],
      },
      {
        key: 'showMessageDivider',
        label: '消息分隔线',
        desc: '在消息之间显示分隔线',
        type: 'toggle',
      },
      {
        key: 'codeShowLineNumbers',
        label: '代码行号',
        desc: '代码块中显示行号',
        type: 'toggle',
      },
      {
        key: 'codeWrappable',
        label: '代码可换行',
        desc: '长代码行自动换行',
        type: 'toggle',
      },
      {
        key: 'codeCollapsible',
        label: '代码可折叠',
        desc: '允许折叠代码块',
        type: 'toggle',
      },
      {
        key: 'foldDisplayMode',
        label: '折叠显示模式',
        desc: '折叠后的展示方式',
        type: 'select',
        options: [
          { value: 'full', label: '完整' },
          { value: 'compact', label: '简洁' },
        ],
      },
      {
        key: 'mathEngine',
        label: '数学公式引擎',
        desc: '渲染数学公式的方式',
        type: 'select',
        options: [
          { value: 'katex', label: 'KaTeX（快速）' },
          { value: 'mathjax', label: 'MathJax（兼容）' },
        ],
      },
    ],
  },
  {
    title: '输入',
    icon: 'keyboard',
    desc: '消息发送与输入区行为',
    items: [
      {
        key: 'sendShortcut',
        label: '发送快捷键',
        desc: '选择发送消息的快捷键',
        type: 'select',
        options: [
          { value: 'Enter', label: 'Enter 发送' },
          { value: 'Ctrl+Enter', label: 'Ctrl+Enter 发送' },
          { value: 'Shift+Enter', label: 'Shift+Enter 发送' },
        ],
      },
      {
        key: 'autoScroll',
        label: '自动滚动',
        desc: '流式生成时自动跟随最新消息',
        type: 'toggle',
      },
      {
        key: 'showInputEstimatedTokens',
        label: 'Token 预估',
        desc: '在输入区显示预计 Token 数',
        type: 'toggle',
      },
      {
        key: 'renderInputMessageAsMarkdown',
        label: '输入预览 Markdown',
        desc: '输入框中渲染 Markdown 格式',
        type: 'toggle',
      },
      {
        key: 'confirmDeleteMessage',
        label: '确认删除消息',
        desc: '删除消息前弹出确认',
        type: 'toggle',
      },
      {
        key: 'confirmRegenerateMessage',
        label: '确认重新生成',
        desc: '重新生成前弹出确认',
        type: 'toggle',
      },
    ],
  },
  {
    title: '话题',
    icon: 'messages',
    desc: '话题列表与自动命名',
    items: [
      {
        key: 'enableTopicNaming',
        label: '自动命名话题',
        desc: '根据首条消息自动生成标题',
        type: 'toggle',
      },
      {
        key: 'pinTopicsToTop',
        label: '置顶话题',
        desc: '置顶的话题显示在列表顶部',
        type: 'toggle',
      },
      {
        key: 'showTopics',
        label: '显示话题列表',
        desc: '侧边栏显示话题列表',
        type: 'toggle',
      },
      {
        key: 'showTopicTime',
        label: '显示话题时间',
        desc: '话题列表中显示创建时间',
        type: 'toggle',
      },
    ],
  },
  {
    title: '高级',
    icon: 'adjustments',
    desc: '粘贴行为、语言与显示选项',
    items: [
      {
        key: 'language',
        label: '界面语言',
        desc: '选择界面显示语言',
        type: 'select',
        options: [
          { value: 'zh-CN', label: '简体中文' },
          { value: 'en-US', label: 'English' },
        ],
      },
      {
        key: 'pasteLongTextAsFile',
        label: '长文本粘贴为文件',
        desc: '超过阈值的粘贴文本转为附件',
        type: 'toggle',
      },
      {
        key: 'pasteLongTextThreshold',
        label: '长文本阈值（字符）',
        desc: '触发转文件的字符数',
        type: 'number',
        placeholder: '1500',
        min: 100,
        max: 100000,
        step: 100,
      },
      {
        key: 'showTokens',
        label: '显示 Token 数',
        desc: '在消息检查器中显示 Token 统计',
        type: 'toggle',
      },
      {
        key: 'showMessageOutline',
        label: '消息大纲',
        desc: '在检查器中显示消息大纲',
        type: 'toggle',
      },
      {
        key: 'messageNavigation',
        label: '消息导航',
        desc: '启用消息间快速导航',
        type: 'toggle',
      },
    ],
  },
]

// ── Update logic: instant + persisted ─────────────────────────────────────────
function updateSetting(key: keyof Settings, value: unknown) {
  // Only write whitelisted fields
  if (!WHITELIST.has(key)) return
  appStore.updateSettings({ [key]: value } as Partial<Settings>)

  // Theme needs composable sync for data-theme attribute
  if (key === 'theme') {
    setTheme(value as 'light' | 'dark' | 'auto')
  }
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
        <p v-if="group.desc" class="group-desc">{{ group.desc }}</p>

        <div
          v-for="item in group.items"
          :key="String(item.key)"
          class="setting-row"
        >
          <div class="setting-label-block">
            <span class="setting-label">{{ item.label }}</span>
            <span v-if="item.desc" class="setting-sublabel">{{ item.desc }}</span>
          </div>

          <!-- Toggle -->
          <el-switch
            v-if="item.type === 'toggle'"
            :model-value="Boolean(settings[item.key])"
            @change="(val: string | number | boolean) => updateSetting(item.key, val)"
          />

          <!-- Select -->
          <el-select
            v-else-if="item.type === 'select'"
            :model-value="String(settings[item.key] ?? '')"
            size="small"
            style="width: 150px;"
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

          <!-- Slider -->
          <div v-else-if="item.type === 'slider'" class="slider-row">
            <el-slider
              :model-value="Number(settings[item.key] ?? 14)"
              :min="item.min ?? 12"
              :max="item.max ?? 20"
              :step="item.step ?? 1"
              style="width: 120px;"
              @change="(val: number | number[]) => updateSetting(item.key, Array.isArray(val) ? val[0] : val)"
            />
            <span class="slider-value">{{ settings[item.key] }}px</span>
          </div>

          <!-- Number -->
          <el-input-number
            v-else-if="item.type === 'number'"
            :model-value="settings[item.key] as number ?? 0"
            :placeholder="item.placeholder"
            :min="item.min"
            :max="item.max"
            :step="item.step ?? 1"
            size="small"
            controls-position="right"
            style="width: 130px;"
            @change="(val: number | undefined) => updateSetting(item.key, val ?? 0)"
          />

          <!-- Input -->
          <el-input
            v-else-if="item.type === 'input'"
            :model-value="String(settings[item.key] ?? '')"
            :placeholder="item.placeholder"
            size="small"
            style="width: 150px;"
            @change="(val: string) => updateSetting(item.key, val)"
          />
        </div>
      </div>

      <!-- Sync & Storage -->
      <div class="setting-group">
        <div class="section-title">
          <Icon icon="tabler:cloud-cog" width="15" />
          同步与存储
        </div>
        <p class="group-desc">远端存储配置与数据同步</p>
        <StorageSettings />
        <SyncPanel style="margin-top: 10px;" />
      </div>

      <!-- Data management -->
      <div class="setting-group">
        <div class="section-title">
          <Icon icon="tabler:database" width="15" />
          数据管理
        </div>
        <p class="group-desc">导入导出与索引维护</p>
        <DataManager />
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
  margin-bottom: 8px;
}

.group-desc {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
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

.setting-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.setting-label {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.setting-sublabel {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slider-value {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-width: 32px;
  text-align: right;
}

.data-actions {
  display: flex;
  gap: 8px;
  padding: 4px 0;
}
</style>
