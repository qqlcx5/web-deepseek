<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { useTheme } from '@/composables/useTheme'
import { Icon } from '@iconify/vue'
import type { Settings } from '@/types'

const appStore = useAppStore()
const uiStore = useUiStore()
const { isDark, setTheme } = useTheme()

const settingsGroup = ref('appearance')

interface NavItem {
  id: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { id: 'appearance', label: '外观', icon: 'sun' },
  { id: 'input', label: '输入', icon: 'keyboard' },
  { id: 'providers', label: 'Provider 与模型', icon: 'bolt' },
  { id: 'assistants', label: '助手', icon: 'robot' },
  { id: 'context', label: '上下文', icon: 'adjustments-horizontal' },
  { id: 'sync', label: '同步与存储', icon: 'cloud' },
  { id: 'data', label: '数据管理', icon: 'database' },
]

const settings = computed(() => appStore.settings)

function updateSetting(key: keyof Settings, value: unknown) {
  appStore.updateSettings({ [key]: value } as Partial<Settings>)
}

function setThemeMode(mode: 'light' | 'dark') {
  appStore.updateSettings({ theme: mode })
  setTheme(mode)
}

function handleExport() {
  appStore.exportData()
  uiStore.showToast('数据已导出')
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = () => {
    if (input.files?.[0]) {
      // Access chat store via uiStore's parent — we emit an event instead
      uiStore.showToast('请通过对话页面导入数据')
    }
  }
  input.click()
}

const emit = defineEmits<{ 'switch-view': [view: 'chat' | 'search' | 'settings'] }>()
</script>

<template>
  <section class="settings-view scroll">
    <div class="settings-container">
      <!-- Left nav -->
      <div class="settings-nav">
        <h1 class="settings-page-title">设置</h1>
        <p class="settings-page-desc">配置 Orbit Chat</p>

        <nav class="settings-nav-list">
          <button
            v-for="item in navItems"
            :key="item.id"
            class="settings-nav-btn"
            :class="{ active: settingsGroup === item.id }"
            @click="settingsGroup = item.id"
          >
            <Icon :icon="`tabler:${item.icon}`" :size="17" />
            {{ item.label }}
          </button>
        </nav>
      </div>

      <!-- Right panel -->
      <div class="settings-panel">
        <!-- Appearance -->
        <template v-if="settingsGroup === 'appearance'">
          <div class="setting-header">
            <h2 class="setting-header-title">外观</h2>
            <p class="setting-header-desc">调整界面显示方式，修改会立即生效。</p>
          </div>

          <div class="setting-row">
            <div class="setting-row-info">
              <div class="setting-row-title">主题</div>
              <div class="setting-row-desc">选择浅色、深色或跟随系统</div>
            </div>
            <div class="setting-row-control">
              <button
                class="theme-btn"
                :class="{ active: !isDark }"
                @click="setThemeMode('light')"
              >
                <Icon icon="tabler:sun" :size="15" />
                浅色
              </button>
              <button
                class="theme-btn"
                :class="{ active: isDark }"
                @click="setThemeMode('dark')"
              >
                <Icon icon="tabler:moon" :size="15" />
                深色
              </button>
              <button class="theme-btn hidden sm:flex">
                <Icon icon="tabler:device-desktop" :size="15" />
                自动
              </button>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-row-info">
              <div class="setting-row-title">消息样式</div>
              <div class="setting-row-desc">选择消息的视觉密度</div>
            </div>
            <select
              :value="settings.messageStyle"
              class="setting-select"
              @change="(e) => updateSetting('messageStyle', (e.target as HTMLSelectElement).value)"
            >
              <option value="plain">简洁</option>
              <option value="bubble">气泡</option>
            </select>
          </div>

          <div class="setting-row">
            <div class="setting-row-info">
              <div class="setting-row-title">字体大小</div>
              <div class="setting-row-desc">调整消息正文和界面文字大小</div>
            </div>
            <input
              type="range"
              min="12"
              max="18"
              :value="settings.fontSize || 14"
              class="setting-range"
              @input="(e) => updateSetting('fontSize', Number((e.target as HTMLInputElement).value))"
            >
          </div>

          <div class="setting-row">
            <div class="setting-row-info">
              <div class="setting-row-title">显示分隔线</div>
              <div class="setting-row-desc">在不同内容区域之间显示分隔线</div>
            </div>
            <el-switch
              :model-value="settings.showMessageDivider ?? false"
              @change="(val) => updateSetting('showMessageDivider', val)"
            />
          </div>
        </template>

        <!-- Input -->
        <template v-if="settingsGroup === 'input'">
          <div class="setting-header">
            <h2 class="setting-header-title">输入</h2>
            <p class="setting-header-desc">配置消息发送和输入区行为。</p>
          </div>

          <div class="setting-row">
            <div class="setting-row-info">
              <div class="setting-row-title">发送快捷键</div>
              <div class="setting-row-desc">选择 Enter 是否直接发送消息</div>
            </div>
            <select
              :value="settings.sendShortcut"
              class="setting-select"
              @change="(e) => updateSetting('sendShortcut', (e.target as HTMLSelectElement).value)"
            >
              <option value="Enter">Enter 发送</option>
              <option value="Ctrl+Enter">⌘ Enter 发送</option>
            </select>
          </div>

          <div class="setting-row">
            <div class="setting-row-info">
              <div class="setting-row-title">自动滚动</div>
              <div class="setting-row-desc">生成时自动跟随最新消息</div>
            </div>
            <el-switch
              :model-value="settings.autoScroll ?? true"
              @change="(val) => updateSetting('autoScroll', val)"
            />
          </div>

          <div class="setting-row">
            <div class="setting-row-info">
              <div class="setting-row-title">Token 预估</div>
              <div class="setting-row-desc">在输入区显示预计 Token 数量</div>
            </div>
            <el-switch
              :model-value="settings.showInputEstimatedTokens ?? false"
              @change="(val) => updateSetting('showInputEstimatedTokens', val)"
            />
          </div>

          <div class="setting-row">
            <div class="setting-row-info">
              <div class="setting-row-title">粘贴长文本转文件</div>
              <div class="setting-row-desc">超过阈值的文本自动转换为附件</div>
            </div>
            <el-switch
              :model-value="settings.pasteLongTextAsFile ?? false"
              @change="(val) => updateSetting('pasteLongTextAsFile', val)"
            />
          </div>
        </template>

        <!-- Providers -->
        <template v-if="settingsGroup === 'providers'">
          <div class="setting-header">
            <h2 class="setting-header-title">Provider 与模型</h2>
            <p class="setting-header-desc">管理 API 连接和可用模型。</p>
          </div>

          <div
            v-for="provider in appStore.providers"
            :key="provider.id"
            class="provider-card"
          >
            <div class="provider-info">
              <div class="provider-icon">
                <Icon icon="tabler:bolt" :size="19" />
              </div>
              <div>
                <div class="provider-name">{{ provider.name }}</div>
                <div class="provider-host">{{ provider.apiHost }}</div>
              </div>
            </div>
            <div class="provider-status">
              <span class="provider-status-dot" />
              已连接
            </div>
          </div>

          <div class="provider-models">
            <div class="provider-models-head">
              <div>
                <div class="provider-models-title">模型</div>
                <div class="provider-models-desc">启用的模型会出现在对话顶部</div>
              </div>
              <button class="setting-action-btn" @click="uiStore.modal = 'provider'">
                <Icon icon="tabler:plus" :size="14" />
                管理模型
              </button>
            </div>

            <div
              v-for="provider in appStore.providers"
              :key="provider.id"
              class="provider-model-group"
            >
              <div
                v-for="model in provider.models"
                :key="model.id"
                class="provider-model-row"
              >
                <div>
                  <div class="provider-model-name">{{ model.name }}</div>
                  <div class="provider-model-desc">
                    {{ model.description || `${provider.name} · ${model.name}` }}
                    <template v-if="model.contextLength"> · {{ Math.round(model.contextLength / 1000) }}K context</template>
                  </div>
                </div>
                <el-switch
                  :model-value="model.enabled"
                  @change="(val) => {
                    model.enabled = val
                    appStore.updateProvider(provider.id, { models: provider.models })
                  }"
                />
              </div>
            </div>

            <div v-if="appStore.providers.length === 0" class="provider-empty">
              <p>尚未配置 Provider</p>
              <button class="setting-action-btn" @click="uiStore.modal = 'provider'">
                <Icon icon="tabler:plus" :size="14" />
                添加 Provider
              </button>
            </div>
          </div>
        </template>

        <!-- Assistants -->
        <template v-if="settingsGroup === 'assistants'">
          <div class="setting-header">
            <h2 class="setting-header-title">助手</h2>
            <p class="setting-header-desc">为不同任务配置独立的系统提示词和模型参数。</p>
          </div>

          <div class="assistant-list">
            <div
              v-for="assistant in appStore.assistants"
              :key="assistant.id"
              class="assistant-card"
            >
              <div class="assistant-card-info">
                <span class="assistant-card-emoji">{{ assistant.emoji || assistant.name.slice(0, 1) }}</span>
                <div>
                  <div class="assistant-card-name">{{ assistant.name }}</div>
                  <div class="assistant-card-desc">
                    {{ assistant.model || '默认模型' }} · 默认上下文 20 条
                  </div>
                </div>
              </div>
              <button class="setting-edit-btn" @click="uiStore.modal = 'assistant'">
                编辑
              </button>
            </div>
          </div>
        </template>

        <!-- Context -->
        <template v-if="settingsGroup === 'context'">
          <div class="setting-header">
            <h2 class="setting-header-title">上下文</h2>
            <p class="setting-header-desc">控制发送给模型的历史内容。</p>
          </div>

          <div class="setting-row">
            <div class="setting-row-info">
              <div class="setting-row-title">显示 Token 数</div>
              <div class="setting-row-desc">在检查器中显示 Token 统计信息</div>
            </div>
            <el-switch
              :model-value="settings.showTokens ?? true"
              @change="(val) => updateSetting('showTokens', val)"
            />
          </div>

          <div class="setting-row">
            <div class="setting-row-info">
              <div class="setting-row-title">自动命名话题</div>
              <div class="setting-row-desc">根据首条消息自动生成话题标题</div>
            </div>
            <el-switch
              :model-value="settings.enableTopicNaming ?? true"
              @change="(val) => updateSetting('enableTopicNaming', val)"
            />
          </div>

          <div class="setting-row">
            <div class="setting-row-info">
              <div class="setting-row-title">显示消息大纲</div>
              <div class="setting-row-desc">在检查器中显示消息大纲</div>
            </div>
            <el-switch
              :model-value="settings.showMessageOutline ?? false"
              @change="(val) => updateSetting('showMessageOutline', val)"
            />
          </div>
        </template>

        <!-- Sync -->
        <template v-if="settingsGroup === 'sync'">
          <div class="setting-header">
            <h2 class="setting-header-title">同步与存储</h2>
            <p class="setting-header-desc">使用 S3 或 WebDAV 备份 Cherry Studio 兼容快照。</p>
          </div>

          <div class="sync-saved-card">
            <Icon icon="tabler:circle-check" :size="18" class="sync-saved-icon" />
            <div>
              <div class="sync-saved-title">本地数据已保存</div>
              <div class="sync-saved-desc">
                最后保存：刚刚 · {{ appStore.topics.length }} 个 Topic ·
                {{ appStore.topics.reduce((sum, t) => sum + t.messages.length, 0) }} 条消息
              </div>
            </div>
          </div>

          <div class="sync-remote-card">
            <div class="sync-remote-head">
              <div>
                <div class="sync-remote-title">远端备份</div>
                <div class="sync-remote-desc">当前未配置远端存储</div>
              </div>
              <button class="setting-edit-btn">配置</button>
            </div>

            <div class="sync-remote-options">
              <button class="sync-remote-option">
                <Icon icon="tabler:cloud" :size="19" class="sync-remote-option-icon" />
                <span>
                  <b class="sync-remote-option-name">S3</b>
                  <small class="sync-remote-option-desc">兼容 AWS S3 存储</small>
                </span>
              </button>
              <button class="sync-remote-option">
                <Icon icon="tabler:database" :size="19" class="sync-remote-option-icon" />
                <span>
                  <b class="sync-remote-option-name">WebDAV</b>
                  <small class="sync-remote-option-desc">自托管文件服务器</small>
                </span>
              </button>
            </div>
          </div>
        </template>

        <!-- Data Management -->
        <template v-if="settingsGroup === 'data'">
          <div class="setting-header">
            <h2 class="setting-header-title">数据管理</h2>
            <p class="setting-header-desc">导入、导出或清理本地数据。</p>
          </div>

          <div class="data-grid">
            <button class="data-action" @click="handleExport">
              <Icon icon="tabler:download" :size="19" class="data-action-icon" />
              <span>
                <b class="data-action-name">导出数据</b>
                <small class="data-action-desc">默认不包含 API Key</small>
              </span>
            </button>

            <button class="data-action" @click="handleImport">
              <Icon icon="tabler:upload" :size="19" class="data-action-icon" />
              <span>
                <b class="data-action-name">导入数据</b>
                <small class="data-action-desc">兼容 Cherry Studio v5</small>
              </span>
            </button>

            <button class="data-action" @click="uiStore.showToast('搜索索引重建完成')">
              <Icon icon="tabler:refresh" :size="19" class="data-action-icon" />
              <span>
                <b class="data-action-name">重建索引</b>
                <small class="data-action-desc">重新扫描所有消息</small>
              </span>
            </button>

            <button class="data-action danger" @click="uiStore.showToast('请确认后执行')">
              <Icon icon="tabler:trash" :size="19" class="data-action-icon" />
              <span>
                <b class="data-action-name">清空本地数据</b>
                <small class="data-action-desc">此操作不可撤销</small>
              </span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings-view {
  height: 100%;
  overflow-y: auto;
}

.settings-container {
  display: flex;
  width: min(100%, 1060px);
  margin: 0 auto;
  gap: 48px;
  padding: 32px 20px;
}

@media (max-width: 1023px) {
  .settings-container { flex-direction: column; gap: 32px; }
}

@media (min-width: 1024px) {
  .settings-container { padding: 32px 40px; }
}

/* Left nav */
.settings-nav { flex: 0 0 210px; }

@media (max-width: 1023px) {
  .settings-nav { flex: none; }
}

.settings-page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.settings-page-desc {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--muted);
}

.settings-nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 28px;
}

.settings-nav-btn {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  color: var(--muted);
  background: transparent;
  border: 0;
  border-radius: 8px;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease;
}

.settings-nav-btn:hover {
  color: var(--text);
  background: var(--surface-2);
}

.settings-nav-btn.active {
  color: var(--brand);
  background: var(--brand-soft);
  font-weight: 500;
}

/* Right panel */
.settings-panel { min-width: 0; flex: 1; }

.setting-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
}

.setting-header-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.setting-header-desc {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--muted);
}

.setting-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid var(--line);
}

@media (min-width: 640px) {
  .setting-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.setting-row-info { min-width: 0; }

.setting-row-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.setting-row-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
}

.setting-row-control { flex-shrink: 0; }

.theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 140ms ease, background 140ms ease;
}

.theme-btn:hover { border-color: var(--brand); }

.theme-btn.active {
  color: var(--brand);
  background: var(--brand-soft);
  border-color: var(--brand);
}

.setting-select {
  height: 38px;
  padding: 0 12px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.setting-select:focus { border-color: var(--brand); }

.setting-range { accent-color: var(--brand); width: 160px; }

/* Provider cards */
.provider-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.provider-info { display: flex; align-items: center; gap: 12px; }

.provider-icon {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  color: var(--success);
  background: color-mix(in srgb, var(--success) 10%, transparent);
  border-radius: 8px;
}

.provider-name { font-size: 14px; font-weight: 500; color: var(--text); }
.provider-host { margin-top: 2px; font-size: 12px; color: var(--muted); }

.provider-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--success);
}

.provider-status-dot {
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
}

.provider-models {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}

.provider-models-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--line);
}

.provider-models-title { font-size: 14px; font-weight: 500; color: var(--text); }
.provider-models-desc { margin-top: 2px; font-size: 12px; color: var(--muted); }

.provider-model-group { display: flex; flex-direction: column; }

.provider-model-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--line);
}

.provider-model-row:last-child { border-bottom: 0; }

.provider-model-name { font-size: 14px; font-weight: 500; color: var(--text); }
.provider-model-desc { margin-top: 2px; font-size: 12px; color: var(--muted); }

.provider-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: var(--muted);
  font-size: 14px;
}

.setting-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  color: white;
  background: var(--brand);
  border: 0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.setting-action-btn:hover { background: var(--brand-hover); }

/* Assistants */
.assistant-list { display: flex; flex-direction: column; gap: 12px; }

.assistant-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.assistant-card-info { display: flex; align-items: center; gap: 12px; }

.assistant-card-emoji {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background: var(--brand-soft);
  color: var(--brand);
  border-radius: 8px;
  font-size: 16px;
}

.assistant-card-name { font-size: 14px; font-weight: 500; color: var(--text); }
.assistant-card-desc { margin-top: 2px; font-size: 12px; color: var(--muted); }

.setting-edit-btn {
  padding: 8px 12px;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.setting-edit-btn:hover { background: var(--surface-2); }

/* Sync */
.sync-saved-card {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: color-mix(in srgb, var(--success) 8%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--success) 20%, var(--line));
  border-radius: 12px;
}

.sync-saved-icon { color: var(--success); flex-shrink: 0; margin-top: 2px; }
.sync-saved-title { font-size: 14px; font-weight: 500; color: var(--text); }
.sync-saved-desc { margin-top: 4px; font-size: 12px; color: var(--muted); }

.sync-remote-card {
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.sync-remote-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sync-remote-title { font-size: 14px; font-weight: 500; color: var(--text); }
.sync-remote-desc { margin-top: 2px; font-size: 12px; color: var(--muted); }

.sync-remote-options {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .sync-remote-options { grid-template-columns: 1fr 1fr; }
}

.sync-remote-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  text-align: left;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 140ms ease;
}

.sync-remote-option:hover { border-color: var(--brand); }
.sync-remote-option-icon { color: var(--brand); flex-shrink: 0; }
.sync-remote-option-name { display: block; font-size: 14px; font-weight: 500; color: var(--text); }
.sync-remote-option-desc { display: block; margin-top: 2px; font-size: 12px; color: var(--muted); }

/* Data */
.data-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .data-grid { grid-template-columns: 1fr 1fr; }
}

.data-action {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  text-align: left;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 140ms ease;
}

.data-action:hover { border-color: var(--brand); }

.data-action.danger {
  background: color-mix(in srgb, var(--danger) 5%, var(--surface));
  border-color: color-mix(in srgb, var(--danger) 25%, var(--line));
  color: var(--danger);
}

.data-action.danger:hover { background: color-mix(in srgb, var(--danger) 10%, var(--surface)); }

.data-action-icon { color: var(--brand); flex-shrink: 0; }
.data-action.danger .data-action-icon { color: var(--danger); }

.data-action-name { display: block; font-size: 14px; font-weight: 500; color: var(--text); }
.data-action.danger .data-action-name { color: var(--danger); }

.data-action-desc { display: block; margin-top: 2px; font-size: 12px; color: var(--muted); }
.data-action.danger .data-action-desc { color: color-mix(in srgb, var(--danger) 70%, var(--muted)); }
</style>
