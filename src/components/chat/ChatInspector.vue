<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'
import { estimateTokens, estimateContextPercent } from '@/utils/token-counter'
import type { ChatMessage } from '@/types'

const store = useChatStore()
const appStore = useAppStore()
const uiStore = useUiStore()

// ─── Settings-driven visibility ───
const showTokens = computed(() => appStore.settings?.showTokens ?? true)

const contextPercent = computed(() => {
  const ctxLen = uiStore.selectedModel?.contextLength || 64000
  return estimateContextPercent(store.messages, ctxLen)
})

const tokenCount = computed(() =>
  store.messages.reduce((sum, m) => sum + estimateTokens(m.content), 0),
)

const meterColor = computed(() => {
  const pct = contextPercent.value
  if (pct < 60) return 'var(--success)'
  if (pct < 85) return 'var(--warning)'
  return 'var(--danger)'
})

// ─── Real usage from messages (if available) ───
function getRealUsage(msg: ChatMessage) {
  return msg.usage
}

// Sum of real usage from assistant messages
const realInputTokens = computed(() => {
  const usages = store.messages
    .filter(m => m.role === 'assistant')
    .map(m => getRealUsage(m))
    .filter(Boolean)
  if (usages.length === 0) return null
  return usages.reduce((sum, u) => sum + (u?.prompt_tokens ?? 0), 0)
})

const realOutputTokens = computed(() => {
  const usages = store.messages
    .filter(m => m.role === 'assistant')
    .map(m => getRealUsage(m))
    .filter(Boolean)
  if (usages.length === 0) return null
  return usages.reduce((sum, u) => sum + (u?.completion_tokens ?? 0), 0)
})

const hasRealUsage = computed(() => realInputTokens.value !== null || realOutputTokens.value !== null)

// Session stats — prefer real usage, fall back to estimates
const inputTokens = computed(() =>
  hasRealUsage.value
    ? realInputTokens.value!
    : store.messages
        .filter(m => m.role === 'user')
        .reduce((sum, m) => sum + estimateTokens(m.content), 0),
)
const outputTokens = computed(() =>
  hasRealUsage.value
    ? realOutputTokens.value!
    : store.messages
        .filter(m => m.role === 'assistant')
        .reduce((sum, m) => sum + estimateTokens(m.content) + estimateTokens(m.reasoningContent ?? ''), 0),
)
const isRealUsage = computed(() => hasRealUsage.value)
const estimatedCost = computed(() => {
  const pricing = uiStore.selectedModel?.pricing
  if (!pricing) return '—'
  const cost = (inputTokens.value / 1_000_000) * pricing.input + (outputTokens.value / 1_000_000) * pricing.output
  return cost < 0.01 ? '<$0.01' : `$${cost.toFixed(2)}`
})
const messageCount = computed(() => store.messages.length)
const assistantCount = computed(() => store.messages.filter(m => m.role === 'assistant').length)
</script>

<template>
  <aside v-if="uiStore.inspectorVisible || uiStore.inspectorOpen" class="inspector" :class="{ open: uiStore.inspectorOpen }">
    <div class="inspector-head">
      <span class="inspector-title">会话信息</span>
      <button class="icon-btn tooltip" data-tip="关闭" @click="uiStore.closeInspector()">
        <Icon icon="tabler:x" />
      </button>
    </div>

    <div class="inspector-scroll scroll">
      <!-- System prompt -->
      <section class="panel-section">
        <div class="panel-heading">
          系统提示词
          <button class="panel-edit" @click="uiStore.modal = 'prompt'">编辑</button>
        </div>
        <div class="prompt-preview">{{ uiStore.promptDraft }}</div>
      </section>

      <!-- Context usage -->
      <section v-if="showTokens" class="panel-section">
        <div class="panel-heading">上下文用量</div>
        <div class="meter-head">
          <span>{{ store.messages.length }} 条消息 · ~{{ tokenCount }} tokens</span>
          <span>{{ store.generating ? '生成中...' : '就绪' }}</span>
        </div>
        <div class="meter-bar">
          <div class="meter-fill" :style="{ width: contextPercent + '%', backgroundColor: meterColor }" />
        </div>
        <div class="meter-note">{{ contextPercent }}% 已用 · 上下文窗口 {{ (uiStore.selectedModel?.contextLength || 64000) / 1000 }}K tokens</div>
      </section>

      <!-- Context files -->
      <section class="panel-section">
        <div class="panel-heading">
          上下文文件
          <button class="panel-edit">添加</button>
        </div>
        <div v-if="store.attachments.length === 0" class="empty-hint">
          暂无上下文文件
        </div>
        <div
          v-for="file in store.attachments"
          :key="file.id"
          class="context-item"
        >
          <span class="context-item-icon"><Icon icon="tabler:file-text" /></span>
          <span class="context-item-copy">
            <span class="context-item-name">{{ file.name }}</span>
            <span class="context-item-meta">{{ file.size }} · 已加入上下文</span>
          </span>
          <button class="icon-btn" style="width:24px;height:24px;flex-basis:24px" @click="store.removeAttachment(file)">
            <Icon icon="tabler:x" width="13" />
          </button>
        </div>
      </section>

      <!-- Model info -->
      <section class="panel-section">
        <div class="panel-heading">当前模型</div>
        <div class="model-info">
          <span class="model-dot" :style="{ backgroundColor: uiStore.selectedModel?.color }" />
          <div>
            <div class="model-info-name">{{ uiStore.selectedModel?.name }}</div>
            <div class="model-info-desc">{{ uiStore.selectedModel?.description }}</div>
            <div v-if="uiStore.selectedModel?.contextLength" class="model-info-meta">
              上下文 {{ (uiStore.selectedModel.contextLength / 1000).toFixed(0) }}K tokens
            </div>
          </div>
        </div>
      </section>

      <!-- Session stats -->
      <section v-if="showTokens" class="panel-section">
        <div class="panel-heading">
          会话消耗
          <span v-if="isRealUsage" class="usage-badge">真实</span>
          <span v-else class="usage-badge estimate">估算</span>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">消息总数</span>
            <span class="stat-value">{{ messageCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">AI 回复</span>
            <span class="stat-value">{{ assistantCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">输入 Token</span>
            <span class="stat-value">{{ isRealUsage ? '' : '~' }}{{ inputTokens }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">输出 Token</span>
            <span class="stat-value">{{ isRealUsage ? '' : '~' }}{{ outputTokens }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">预计费用</span>
            <span class="stat-value">{{ estimatedCost }}</span>
          </div>
        </div>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.inspector {
  z-index: 20; display: flex; min-width: 0; flex-direction: column;
  overflow: hidden; background: var(--surface-2); border-left: 1px solid var(--line);
}
.inspector-head {
  display: flex; height: var(--header); flex: 0 0 var(--header); align-items: center;
  gap: 7px; padding: 0 12px; background: var(--surface); border-bottom: 1px solid var(--line);
}
.inspector-title { min-width: 0; flex: 1; font-size: 12px; font-weight: 700; color: var(--text); }
.inspector-scroll { min-height: 0; flex: 1; overflow-y: auto; padding: 12px; }
.panel-section { padding: 3px 0 15px; border-bottom: 1px solid var(--line); }
.panel-section + .panel-section { padding-top: 15px; }
.panel-section:last-child { border-bottom: 0; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; color: var(--text-secondary); font-size: 11px; font-weight: 700; }
.panel-edit { color: var(--brand); background: transparent; font-size: 10px; border: 0; cursor: pointer; }
.prompt-preview { display: -webkit-box; overflow: hidden; color: var(--muted); font-size: 10px; line-height: 1.6; -webkit-box-orient: vertical; -webkit-line-clamp: 4; }
.meter-head { display: flex; justify-content: space-between; color: var(--muted); font-size: 10px; }
.meter-bar { height: 4px; margin: 7px 0; background: var(--surface-3); border-radius: 2px; overflow: hidden; }
.meter-fill { height: 100%; border-radius: 2px; transition: width 300ms ease; }
.meter-note { margin-top: 7px; color: var(--faint); font-size: 9px; line-height: 1.5; }
.empty-hint { color: var(--faint); font-size: 10px; padding: 8px 0; }
.context-item { display: flex; align-items: center; gap: 8px; margin-top: 7px; padding: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 6px; }
.context-item-icon { display: flex; width: 28px; height: 28px; align-items: center; justify-content: center; color: var(--muted); background: var(--surface-3); border-radius: 5px; }
.context-item-icon :deep(svg) { width: 14px; }
.context-item-copy { min-width: 0; flex: 1; }
.context-item-name { overflow: hidden; font-size: 10px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; color: var(--text); }
.context-item-meta { margin-top: 2px; color: var(--faint); font-size: 9px; }
.model-info { display: flex; gap: 10px; align-items: flex-start; }
.model-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
.model-info-name { font-size: 11px; font-weight: 650; color: var(--text); }
.model-info-desc { margin-top: 2px; color: var(--muted); font-size: 9px; line-height: 1.4; }
.model-info-meta { margin-top: 4px; color: var(--faint); font-size: 9px; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.stat-item { display: flex; flex-direction: column; gap: 3px; padding: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 5px; }
.stat-label { color: var(--faint); font-size: 9px; }
.stat-value { color: var(--text); font-size: 14px; font-weight: 650; }

.usage-badge {
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 600;
  color: var(--success);
  background: color-mix(in srgb, var(--success) 12%, transparent);
}
.usage-badge.estimate {
  color: var(--warning);
  background: color-mix(in srgb, var(--warning) 12%, transparent);
}

.icon-btn { display: inline-flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; border-radius: 6px; color: var(--muted); background: transparent; border: 0; cursor: pointer; transition: background 140ms, color 140ms; }
.icon-btn:hover { color: var(--text); background: var(--surface-3); }
.icon-btn :deep(svg) { width: 17px; height: 17px; }

@media (max-width: 1180px) {
  .inspector {
    position: fixed; z-index: 60; top: 0; right: 0; bottom: 0;
    width: min(var(--inspector), calc(100vw - 48px));
    box-shadow: -12px 0 40px rgba(16, 24, 40, 0.14);
    transform: translateX(105%);
    transition: transform 180ms ease;
  }
  .inspector.open { transform: translateX(0); }
}
@media (max-width: 760px) {
  .inspector { width: 100%; }
}
</style>
