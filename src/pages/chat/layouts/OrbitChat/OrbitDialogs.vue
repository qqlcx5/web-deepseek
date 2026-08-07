<!--
  Orbita AI 弹窗：command palette + model picker + prompt editor + settings + toast
-->
<script setup lang="ts">
import type { OrbitState } from './useOrbitState';

const props = defineProps<{ state: OrbitState }>();
const { state } = props;
const commandInput = ref<HTMLInputElement | null>(null);

function focusCommand() {
  setTimeout(() => commandInput.value?.focus(), 60);
}
</script>

<template>
  <!-- overlay -->
  <div
    v-if="state.modal.value || state.toast.value"
    class="orbit-overlay"
    @click.self="state.modal.value = ''"
  />

  <!-- command palette -->
  <div
    v-if="state.modal.value === 'command'"
    class="orbit-command"
    @vue:mounted="focusCommand"
  >
    <div class="orbit-command-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        ref="commandInput"
        v-model="state.commandQuery.value"
        type="text"
        placeholder="搜索命令、对话或操作…"
        class="orbit-command-input"
      />
      <span class="orbit-command-kbd">ESC</span>
    </div>
    <div class="orbit-command-body orbit-scroll">
      <div v-if="state.filteredCommands.value.length" class="orbit-command-group">
        <div class="orbit-command-group-title">快捷操作</div>
        <button
          v-for="cmd in state.filteredCommands.value"
          :key="cmd.id"
          class="orbit-command-item"
          @click="state.runCommand(cmd)"
        >
          <span class="orbit-command-icon">
            <svg v-if="cmd.icon === 'plus'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <svg v-else-if="cmd.icon === 'sparkles'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2" />
            </svg>
            <svg v-else-if="cmd.icon === 'edit'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            <svg v-else-if="cmd.icon === 'eye'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else-if="cmd.icon === 'settings'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M2 8.5A2.5 2.5 0 0 1 4.5 6h11A2.5 2.5 0 0 1 18 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 15.5z" />
              <path d="M8 6V4M16 6V4M2 11h20" />
            </svg>
          </span>
          <div class="orbit-command-text">
            <div class="orbit-command-title">{{ cmd.title }}</div>
            <div class="orbit-command-desc">{{ cmd.description }}</div>
          </div>
          <span v-if="cmd.shortcut" class="orbit-command-shortcut">{{ cmd.shortcut }}</span>
        </button>
      </div>
      <div v-if="state.filteredCommandChats.value.length" class="orbit-command-group">
        <div class="orbit-command-group-title">最近对话</div>
        <button
          v-for="chat in state.filteredCommandChats.value"
          :key="chat.id"
          class="orbit-command-item"
          @click="state.openConversation(chat.id)"
        >
          <span class="orbit-command-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <div class="orbit-command-text">
            <div class="orbit-command-title">{{ chat.title }}</div>
            <div class="orbit-command-desc">{{ chat.preview }}</div>
          </div>
        </button>
      </div>
    </div>
  </div>

  <!-- model picker -->
  <div v-if="state.modal.value === 'model'" class="orbit-dialog">
    <div class="orbit-dialog-head">
      <div>
        <div class="orbit-dialog-title">选择模型</div>
        <div class="orbit-dialog-sub">价格估算值随上下文窗口大小变化，请以实际账单为准。</div>
      </div>
      <button class="icon-btn" @click="state.modal.value = ''">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="orbit-dialog-body orbit-scroll">
      <div class="orbit-model-list">
        <button
          v-for="model in state.models.value"
          :key="model.id"
          class="orbit-model-option"
          :class="{ selected: model.id === state.selectedModel.value.id }"
          @click="state.selectModel(model)"
        >
          <span class="orbit-model-dot" :style="{ background: model.color }" />
          <div class="orbit-model-info">
            <div class="orbit-model-name">{{ model.name }}</div>
            <div class="orbit-model-desc">{{ model.description }}</div>
            <div class="orbit-model-tags">
              <span v-for="tag in model.tags" :key="tag" class="orbit-model-tag">{{ tag }}</span>
            </div>
          </div>
          <svg
            v-if="model.id === state.selectedModel.value.id"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="orbit-model-check"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </button>
      </div>

      <!-- 模型参数 -->
      <div class="orbit-params-section">
        <div class="orbit-params-label">模型参数</div>

        <div class="orbit-param-row">
          <div class="orbit-param-header">
            <span class="orbit-param-name">Temperature</span>
            <span class="orbit-param-value">{{ state.temperature.value.toFixed(1) }}</span>
          </div>
          <input
            type="range"
            class="orbit-param-slider"
            min="0"
            max="2"
            step="0.1"
            :value="state.temperature.value"
            @input="state.temperature.value = +($event.target as HTMLInputElement).value"
          />
          <div class="orbit-param-labels">
            <span>精确</span>
            <span>创意</span>
          </div>
        </div>

        <div class="orbit-param-row">
          <div class="orbit-param-header">
            <span class="orbit-param-name">Max Tokens</span>
            <span class="orbit-param-value">{{ state.maxTokens.value }}</span>
          </div>
          <input
            type="number"
            class="orbit-param-input"
            min="256"
            max="131072"
            step="256"
            :value="state.maxTokens.value"
            @input="state.maxTokens.value = +($event.target as HTMLInputElement).value"
          />
        </div>

        <div class="orbit-param-row">
          <div class="orbit-param-header">
            <span class="orbit-param-name">Top P</span>
            <span class="orbit-param-value">{{ state.topP.value.toFixed(2) }}</span>
          </div>
          <input
            type="range"
            class="orbit-param-slider"
            min="0"
            max="1"
            step="0.05"
            :value="state.topP.value"
            @input="state.topP.value = +($event.target as HTMLInputElement).value"
          />
          <div class="orbit-param-labels">
            <span>0</span>
            <span>1</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- prompt editor -->
  <div v-if="state.modal.value === 'prompt'" class="orbit-dialog">
    <div class="orbit-dialog-head">
      <div>
        <div class="orbit-dialog-title">编辑系统提示词</div>
        <div class="orbit-dialog-sub">用于设定助手的角色、语气与回复风格。</div>
      </div>
      <button class="icon-btn" @click="state.modal.value = ''">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="orbit-dialog-body">
      <div class="orbit-prompt-presets">
        <button
          v-for="preset in state.promptPresets.value"
          :key="preset.id"
          class="orbit-preset"
          @click="state.promptDraft.value = preset.body"
        >
          {{ preset.title }}
        </button>
      </div>
      <div class="orbit-field-label">当前提示词</div>
      <textarea
        v-model="state.promptDraft.value"
        class="orbit-field-area"
        rows="6"
      />
    </div>
    <div class="orbit-dialog-footer">
      <button class="secondary" @click="state.modal.value = ''">取消</button>
      <button class="primary" @click="state.savePrompt()">保存版本</button>
    </div>
  </div>

  <!-- settings -->
  <div v-if="state.modal.value === 'settings'" class="orbit-dialog">
    <div class="orbit-dialog-head">
      <div>
        <div class="orbit-dialog-title">设置</div>
        <div class="orbit-dialog-sub">管理偏好、数据和应用配置</div>
      </div>
      <button class="icon-btn" @click="state.modal.value = ''">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="orbit-dialog-body orbit-scroll">
      <!-- 深色模式 -->
      <div class="orbit-settings-group">
        <div class="orbit-settings-label">外观</div>
        <label class="orbit-settings-row">
          <span class="orbit-settings-row-text">深色模式</span>
          <input
            type="checkbox"
            class="orbit-toggle"
            :checked="state.settingsDarkMode.value"
            @change="state.toggleDarkMode()"
          />
        </label>
      </div>

      <!-- 语言 -->
      <div class="orbit-settings-group">
        <div class="orbit-settings-label">语言</div>
        <select v-model="state.settingsLanguage.value" class="orbit-settings-select">
          <option value="zh-CN">简体中文</option>
          <option value="en">English</option>
        </select>
      </div>

      <!-- 紧凑模式 & 默认模型 -->
      <div class="orbit-settings-group">
        <div class="orbit-settings-label">界面</div>
        <label class="orbit-settings-row">
          <span class="orbit-settings-row-text">紧凑模式</span>
          <input
            type="checkbox"
            class="orbit-toggle"
            :checked="state.compactMode.value"
            @change="state.toggleCompactMode()"
          />
        </label>
      </div>

      <div class="orbit-settings-group">
        <div class="orbit-settings-label">默认模型</div>
        <select
          class="orbit-settings-select"
          :value="state.defaultModelId.value"
          @change="state.setDefaultModel(($event.target as HTMLSelectElement).value)"
        >
          <option value="">跟随当前选择</option>
          <option
            v-for="m in state.models.value"
            :key="m.id"
            :value="m.id"
          >
            {{ m.name }}
          </option>
        </select>
      </div>

      <!-- 数据管理 -->
      <div class="orbit-settings-group">
        <div class="orbit-settings-label">数据管理</div>
        <div class="orbit-settings-actions">
          <button class="secondary" @click="state.handleImport()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            导入数据
          </button>
          <button class="secondary" @click="state.handleExport()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            导出数据
          </button>
        </div>
      </div>

      <!-- 危险区域 -->
      <div class="orbit-settings-group">
        <div class="orbit-settings-label">危险区域</div>
        <button class="orbit-btn-danger" @click="state.handleClearData()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4h8v4" />
          </svg>
          清除所有数据
        </button>
      </div>
    </div>
    <div class="orbit-dialog-footer">
      <button class="primary" @click="state.modal.value = ''">完成</button>
    </div>
  </div>

  <!-- toast -->
  <transition name="orbit-toast">
    <div v-if="state.toast.value" class="orbit-toast">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <span>{{ state.toast.value.text }}</span>
      <button v-if="state.toast.value.undo" class="orbit-toast-action" @click="state.undo()">
        撤销
      </button>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.orbit-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(16, 24, 40, 0.34);
  backdrop-filter: blur(2px);
}

// —— Command palette ——
.orbit-command {
  position: fixed;
  z-index: 80;
  top: 14%;
  left: 50%;
  width: min(580px, calc(100vw - 24px));
  max-height: 70vh;
  background: var(--surface);
  border-radius: var(--orbit-radius-md);
  box-shadow: 0 24px 60px rgba(16, 24, 40, 0.18);
  transform: translateX(-50%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.orbit-command-search {
  position: relative;
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 46px 0 16px;
  border-bottom: 1px solid var(--line);

  svg {
    position: absolute;
    left: 16px;
    width: 16px;
    height: 16px;
    color: var(--muted);
  }
}
.orbit-command-input {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0;
  font-size: 14px;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--text);

  &::placeholder {
    color: var(--muted);
  }
}
.orbit-command-kbd {
  position: absolute;
  right: 14px;
  padding: 1px 6px;
  font-size: 10px;
  color: var(--muted);
  background: var(--surface-2);
  border-radius: 4px;
}
.orbit-command-body {
  flex: 1;
  padding: 6px 8px 12px;
  overflow-y: auto;
}
.orbit-command-group {
  margin-bottom: 6px;
}
.orbit-command-group-title {
  padding: 6px 12px 4px;
  font-size: 9px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.orbit-command-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 40px;
  padding: 6px 12px;
  text-align: left;
  border-radius: 5px;

  &:hover {
    background: var(--surface-2);
  }
}
.orbit-command-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--brand-soft);
  color: var(--brand);
  border-radius: 5px;
  flex-shrink: 0;

  svg {
    width: 14px;
    height: 14px;
  }
}
.orbit-command-text {
  flex: 1;
  min-width: 0;
}
.orbit-command-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
}
.orbit-command-desc {
  font-size: 11px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.orbit-command-shortcut {
  padding: 1px 6px;
  font-size: 10px;
  color: var(--muted);
  background: var(--surface-2);
  border-radius: 4px;
}

// —— Dialog ——
.orbit-dialog {
  position: fixed;
  z-index: 80;
  top: 50%;
  left: 50%;
  min-width: 520px;
  max-width: calc(100vw - 28px);
  max-height: min(720px, calc(100dvh - 28px));
  background: var(--surface);
  border-radius: var(--orbit-radius-md);
  box-shadow: 0 24px 60px rgba(16, 24, 40, 0.2);
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.orbit-dialog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--line);
}
.orbit-dialog-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}
.orbit-dialog-sub {
  margin-top: 4px;
  font-size: 11px;
  color: var(--muted);
}
.orbit-dialog-body {
  flex: 1;
  padding: 16px 18px;
  overflow-y: auto;
}
.orbit-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  background: var(--surface-2);
  border-top: 1px solid var(--line);
}

// —— Prompt ——
.orbit-prompt-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.orbit-preset {
  padding: 5px 10px;
  font-size: 11px;
  color: var(--text);
  background: var(--surface-2);
  border-radius: 5px;
  transition: all 0.15s;

  &:hover {
    color: var(--brand);
    background: var(--brand-soft);
  }
}
.orbit-field-label {
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.orbit-field-area {
  width: 100%;
  min-height: 150px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: var(--orbit-radius-base);
  resize: vertical;

  &:focus {
    outline: 0;
    border-color: #8a85e3;
    box-shadow: var(--orbit-focus-ring);
  }
}

// —— Models ——
.orbit-model-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.orbit-model-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  text-align: left;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--orbit-radius-base);
  transition: all 0.15s;

  &:hover,
  &.selected {
    background: var(--brand-soft-2);
    border-color: var(--orbit-source-hover);
  }
}
.orbit-model-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 3px;
  flex-shrink: 0;
}
.orbit-model-info {
  flex: 1;
  min-width: 0;
}
.orbit-model-name {
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
}
.orbit-model-desc {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
}
.orbit-model-tags {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}
.orbit-model-tag {
  padding: 1px 6px;
  font-size: 8px;
  font-weight: 700;
  color: var(--muted);
  background: var(--surface-3);
  border-radius: 3px;
}
.orbit-model-check {
  width: 16px;
  height: 16px;
  color: var(--brand);
  flex-shrink: 0;
}

// —— Model params ——
.orbit-params-section {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}
.orbit-params-label {
  margin-bottom: 14px;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.orbit-param-row {
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
}
.orbit-param-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.orbit-param-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text);
}
.orbit-param-value {
  font-size: 11px;
  font-weight: 700;
  color: var(--brand);
  font-variant-numeric: tabular-nums;
}
.orbit-param-slider {
  width: 100%;
  height: 4px;
  appearance: none;
  background: var(--surface-3);
  border-radius: 2px;
  outline: 0;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    background: var(--brand);
    border-radius: 50%;
    cursor: pointer;
  }
}
.orbit-param-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 3px;
  font-size: 10px;
  color: var(--muted);
}
.orbit-param-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 4px;
  outline: 0;
  font-variant-numeric: tabular-nums;

  &:focus {
    border-color: #8a85e3;
    box-shadow: var(--orbit-focus-ring);
  }
}

// —— Settings ——
.orbit-settings-group {
  margin-bottom: 20px;
}
.orbit-settings-label {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.orbit-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--orbit-radius-base);
  cursor: pointer;
}
.orbit-settings-row-text {
  font-size: 13px;
  color: var(--text);
}
.orbit-toggle {
  width: 36px;
  height: 20px;
  appearance: none;
  background: var(--surface-3);
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  &:checked {
    background: var(--brand);

    &::after {
      transform: translateX(16px);
    }
  }
}
.orbit-settings-select {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--orbit-radius-base);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;

  &:focus {
    outline: 0;
    border-color: #8a85e3;
    box-shadow: var(--orbit-focus-ring);
  }
}
.orbit-settings-actions {
  display: flex;
  gap: 8px;

  button {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
}
.orbit-btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 38px;
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--orbit-radius-base);
  transition: all 0.15s;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background: #fee2e2;
  }
}

// —— Toast ——
.orbit-toast {
  position: fixed;
  z-index: 100;
  bottom: 20px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 240px;
  padding: 9px 14px;
  font-size: 11px;
  color: #fff;
  background: var(--orbit-tooltip-bg);
  border-radius: 7px;
  transform: translateX(-50%);
  box-shadow: 0 12px 30px rgba(16, 24, 40, 0.18);

  svg {
    width: 14px;
    height: 14px;
    color: #75e0a7;
  }

  span {
    flex: 1;
  }
}
.orbit-toast-action {
  font-size: 11px;
  font-weight: 600;
  color: #b9b6ff;
  padding: 0 4px;
}
.orbit-toast-enter-from,
.orbit-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
.orbit-toast-enter-active,
.orbit-toast-leave-active {
  transition: all 0.2s;
}

// 移动端
@media (max-width: 760px) {
  .orbit-command {
    top: 8%;
    right: 8px;
    left: 8px;
    width: auto;
    transform: none;
  }
  .orbit-dialog {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    min-width: 0;
    max-width: 100%;
    max-height: 80dvh;
    transform: none;
    border-radius: 8px 8px 0 0;
  }
  .orbit-settings-actions {
    flex-direction: column;
  }
}
</style>
