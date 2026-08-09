<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAppStore } from '@/stores/app'
import { Icon } from '@iconify/vue'
import { MarkdownRenderer } from 'x-markdown-vue'
import { Thinking } from 'vue-element-plus-x'
import { useTheme } from '@/composables/useTheme'
import 'x-markdown-vue/style'
import type { ChatMessage, MessageBlock } from '@/types'

const store = useChatStore()
const appStore = useAppStore()
const { isDark } = useTheme()
const messageScroller = ref<HTMLElement | null>(null)
const codeViewer = ref<{ language: string; code: string } | null>(null)

const mermaidConfig = {
  showToolbar: true,
  showFullscreen: true,
  showZoomIn: true,
  showZoomOut: true,
  showReset: true,
  showDownload: true,
  toolbarStyle: {},
  toolbarClass: 'mermaid-config-toolbar',
}

const viewCodeModalOptions = {
  mode: 'drawer',
  customClass: '',
  dialogOptions: {
    closeOnClickModal: true,
    closeOnPressEscape: true,
  },
  drawerOptions: {
    direction: 'rtl',
    size: 'min(720px, 100vw)',
  },
}

const codeBlockActions = [{
  key: 'view-code',
  title: '查看代码',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 9l-3 3 3 3M16 9l3 3-3 3M14 5l-4 14"/></svg>',
  onClick: (props: { code: string; language?: string }) => {
    codeViewer.value = { language: props.language || 'text', code: props.code }
  },
}]

const markdownRendererOptions = computed(() => ({
  enableShiki: true,
  enableMermaid: true,
  isDark: isDark.value,
  showCodeBlockHeader: true,
  stickyCodeBlockHeader: true,
  enableCodeLineNumber: codeShowLineNumbers.value,
  codeMaxHeight: '560px',
  codeBlockActions,
  mermaidConfig,
}))

// ─── Settings-driven style computeds ───
const fontSize = computed(() => `${appStore.settings?.fontSize ?? 14}px`)
const isPlainMode = computed(() => appStore.settings?.messageStyle === 'plain')
const showMessageDivider = computed(() => appStore.settings?.showMessageDivider ?? false)
const codeShowLineNumbers = computed(() => appStore.settings?.codeShowLineNumbers ?? false)
const codeWrappable = computed(() => appStore.settings?.codeWrappable ?? false)

// Dynamic CSS class for message styling
const messageClass = computed(() => ({
  'plain-mode': isPlainMode.value,
  'show-divider': showMessageDivider.value,
  'code-wrappable': codeWrappable.value,
  'code-line-numbers': codeShowLineNumbers.value,
}))

// ─── Block helpers ───
function getBlocks(message: ChatMessage): MessageBlock[] | null {
  const blocks = message.blocks
  if (blocks && blocks.length > 0) return blocks
  return null
}

function hasUsage(message: ChatMessage): boolean {
  return Boolean(message.usage)
}

function getUsage(message: ChatMessage) {
  return message.usage
}

// Thinking collapse state per message
const thinkingExpanded = ref<Record<string, boolean>>({})

function isThinkingExpanded(messageId: string, isLoading: boolean): boolean {
  // During loading, always expand
  if (isLoading) return true
  // After loading, check manual override; default collapsed
  if (thinkingExpanded.value[messageId] !== undefined) {
    return thinkingExpanded.value[messageId]
  }
  return false
}

function toggleThinking(messageId: string) {
  thinkingExpanded.value[messageId] = !isThinkingExpanded(messageId, false)
}

function closeCodeViewer() {
  codeViewer.value = null
}

async function copyCodeViewer() {
  if (!codeViewer.value) return
  try {
    await navigator.clipboard.writeText(codeViewer.value.code)
    store.showToast('代码已复制')
  } catch {
    store.showToast('浏览器未授予剪贴板权限')
  }
}

function handleScroll() {
  if (!messageScroller.value) return
  const el = messageScroller.value
  const dist = el.scrollHeight - el.scrollTop - el.clientHeight
  store.nearBottom = dist < 100
}

function scrollToBottom() {
  nextTick(() => {
    if (!messageScroller.value) return
    messageScroller.value.scrollTop = messageScroller.value.scrollHeight
    store.nearBottom = true
  })
}

// Scroll to bottom when messages change or generating
watch(
  () => store.messages.length,
  () => {
    if (store.nearBottom || store.generating) scrollToBottom()
  },
)

// Watch for content updates during streaming
watch(
  () => store.messages.map(m => m.content).join(''),
  () => {
    if (store.nearBottom) scrollToBottom()
  },
)

// Also watch reasoning content updates
watch(
  () => store.messages.map(m => m.reasoningContent ?? '').join(''),
  () => {
    if (store.nearBottom) scrollToBottom()
  },
)

nextTick(() => scrollToBottom())

defineExpose({ scrollToBottom })
</script>

<template>
  <section class="chat-area">
    <div ref="messageScroller" class="messages scroll" @scroll="handleScroll">
      <div class="message-list">
        <div v-if="store.messages.length === 0" class="empty-state">
          <span class="empty-icon"><Icon icon="tabler:sparkles" /></span>
          <strong class="empty-title">开始新对话</strong>
          <span class="empty-hint">输入消息或粘贴文件，AI 将为你解答</span>
        </div>

        <div v-else class="date-divider">今天</div>

        <article
          v-for="message in store.messages"
          :key="message.id"
          class="message"
          :class="[message.role, messageClass]"
        >
          <!-- Assistant message -->
          <template v-if="message.role === 'assistant'">
            <div class="assistant-avatar">
              <Icon icon="tabler:sparkles" />
            </div>
            <div class="message-content">
              <div class="message-meta">
                <span class="message-author">Assistant</span>
                <span v-if="message.model" class="message-model">{{ message.model }}</span>
                <span class="message-time">{{ new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}</span>
              </div>

              <!-- Block-based rendering (if blocks exist) -->
              <template v-if="getBlocks(message)">
                <template v-for="(block, blockIdx) in getBlocks(message)" :key="block.id || blockIdx">
                  <!-- Thinking block -->
                  <Thinking
                    v-if="block.type === 'thinking'"
                    :content="block.content"
                    :status="message.loading ? 'thinking' : 'end'"
                    :auto-collapse="true"
                  />

                  <!-- Main text block -->
                  <div v-else-if="block.type === 'main_text'" class="markdown" :style="{ fontSize }">
                    <div v-if="message.loading && !block.content" class="typing">
                      <i /><i /><i />
                    </div>
                    <MarkdownRenderer v-if="block.content" :markdown="block.content" v-bind="markdownRendererOptions" />
                  </div>

                  <!-- Error block -->
                  <div v-else-if="block.type === 'error'" class="message-error">
                    <Icon icon="tabler:alert-circle" width="14" />
                    {{ block.content }}
                  </div>

                  <!-- Citation block -->
                  <div v-else-if="block.type === 'citation'" class="citation-block">
                    <div class="citation-title">
                      <Icon icon="tabler:quote" width="14" />
                      引用
                    </div>
                    <div class="citation-content">{{ block.content }}</div>
                  </div>

                  <!-- Tool block -->
                  <div v-else-if="block.type === 'tool'" class="tool-block">
                    <div class="tool-title">
                      <Icon icon="tabler:tool" width="14" />
                      工具调用
                    </div>
                    <pre class="tool-content">{{ block.content }}</pre>
                  </div>
                </template>
              </template>

              <!-- Fallback: legacy rendering (no blocks) -->
              <template v-else>
                <!-- Reasoning content (Thinking component) -->
                <Thinking
                  v-if="message.reasoningContent"
                  :content="message.reasoningContent"
                  :status="message.loading ? 'thinking' : 'end'"
                  :auto-collapse="true"
                />

                <div v-if="message.loading && !message.content" class="typing">
                  <i /><i /><i />
                </div>

                <div v-if="message.content" class="markdown" :style="{ fontSize }">
                  <MarkdownRenderer :markdown="message.content" v-bind="markdownRendererOptions" />
                </div>
              </template>

              <!-- Error indicator (legacy, for messages without error block) -->
              <div v-if="message.error && !getBlocks(message)?.some(b => b.type === 'error')" class="message-error">
                <Icon icon="tabler:alert-circle" width="14" />
                {{ message.error }}
              </div>

              <!-- Usage info -->
              <div v-if="hasUsage(message) && !message.loading" class="message-usage">
                <Icon icon="tabler:chart-bar" width="12" />
                <span>输入 {{ getUsage(message)?.prompt_tokens ?? '?' }}</span>
                <span class="usage-sep">/</span>
                <span>输出 {{ getUsage(message)?.completion_tokens ?? '?' }}</span>
                <span class="usage-sep">/</span>
                <span>总计 {{ getUsage(message)?.total_tokens ?? '?' }} tokens</span>
              </div>

              <!-- Sources -->
              <div v-if="message.sources?.length" class="sources">
                <div class="sources-title">
                  <Icon icon="tabler:books" width="14" />
                  引用来源
                </div>
                <div class="source-list">
                  <a
                    v-for="(source, idx) in message.sources"
                    :key="source.name"
                    class="source"
                    :href="source.url"
                    target="_blank"
                  >
                    <span class="source-index">{{ idx + 1 }}</span>
                    <span class="source-copy">
                      <span class="source-name">{{ source.name }}</span>
                      <span class="source-domain">{{ source.domain }}</span>
                    </span>
                  </a>
                </div>
              </div>

              <!-- Artifact -->
              <div v-if="message.artifact" class="artifact">
                <span class="artifact-icon">
                  <Icon icon="tabler:file-code-2" width="16" />
                </span>
                <span class="artifact-copy">
                  <span class="artifact-name">{{ message.artifact.name }}</span>
                  <span class="artifact-meta">{{ message.artifact.meta }}</span>
                </span>
                <button class="secondary" @click="store.showToast('已在右侧打开产物预览')">
                  <Icon icon="tabler:layout-sidebar-right-expand" width="13" />
                  打开
                </button>
              </div>

              <!-- Message tools -->
              <div v-if="!message.loading" class="message-tools">
                <button class="message-tool tooltip" data-tip="复制" @click="store.copyMessage(message)">
                  <Icon icon="tabler:copy" />
                </button>
                <button
                  class="message-tool tooltip"
                  data-tip="有帮助"
                  :class="{ active: message.rating === 'up' }"
                  @click="store.rateMessage(message, 'up')"
                >
                  <Icon icon="tabler:thumb-up" />
                </button>
                <button
                  class="message-tool tooltip"
                  data-tip="没有帮助"
                  :class="{ active: message.rating === 'down' }"
                  @click="store.rateMessage(message, 'down')"
                >
                  <Icon icon="tabler:thumb-down" />
                </button>
                <button class="message-tool tooltip" data-tip="重新生成" @click="store.regenerate(message)">
                  <Icon icon="tabler:rotate-clockwise" />
                </button>
                <button class="message-tool tooltip" data-tip="从这里分支" @click="store.branchFrom(message)">
                  <Icon icon="tabler:git-branch" />
                </button>
                <div v-if="(message.branches ?? 0) > 1" class="branch-switcher">
                  <button><Icon icon="tabler:chevron-left" /></button>
                  {{ message.activeBranch }}/{{ message.branches }}
                  <button><Icon icon="tabler:chevron-right" /></button>
                </div>
              </div>
            </div>
          </template>

          <!-- User message -->
          <template v-else>
            <div class="message-content">
              <div class="user-bubble">{{ message.content }}</div>
              <div class="user-time">{{ new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}</div>
              <div class="message-tools" style="justify-content:flex-end">
                <button class="message-tool tooltip" data-tip="编辑并重新发送" @click="store.editMessage(message)">
                  <Icon icon="tabler:pencil" />
                </button>
                <button class="message-tool tooltip" data-tip="复制" @click="store.copyMessage(message)">
                  <Icon icon="tabler:copy" />
                </button>
              </div>
            </div>
            <div class="avatar">我</div>
          </template>
        </article>
      </div>
    </div>

    <button v-if="!store.nearBottom && store.messages.length > 0" class="jump-bottom" @click="scrollToBottom">
      <Icon icon="tabler:arrow-down" />
      回到底部
    </button>

    <Teleport to="body">
      <div v-if="codeViewer" class="code-viewer-backdrop" @click.self="closeCodeViewer">
        <aside
          class="code-viewer-drawer"
          :class="viewCodeModalOptions.customClass"
          :style="{ width: viewCodeModalOptions.drawerOptions.size }"
          role="dialog"
          aria-modal="true"
          aria-label="查看代码"
        >
          <header class="code-viewer-head">
            <span>{{ codeViewer.language }}</span>
            <div class="code-viewer-actions">
              <button class="message-tool tooltip" data-tip="复制代码" @click="copyCodeViewer">
                <Icon icon="tabler:copy" />
              </button>
              <button class="message-tool tooltip" data-tip="关闭" @click="closeCodeViewer">
                <Icon icon="tabler:x" />
              </button>
            </div>
          </header>
          <pre class="code-viewer-content"><code>{{ codeViewer.code }}</code></pre>
        </aside>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.chat-area { position: relative; min-height: 0; flex: 1; }
.messages { position: absolute; inset: 0; overflow-y: auto; overscroll-behavior: contain; }
.message-list { width: min(100%, 820px); margin: 0 auto; padding: 32px 24px 120px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 24px;
  color: var(--faint);
}
.empty-icon { color: var(--line-strong); }
.empty-title { font-size: 16px; font-weight: 600; color: var(--muted); }
.empty-hint { font-size: 12px; }

.date-divider { display: flex; align-items: center; gap: 12px; margin: 4px 0 28px; color: var(--faint); font-size: 10px; }
.date-divider::before, .date-divider::after { height: 1px; flex: 1; background: var(--line); content: ""; }
.message { display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 11px; margin-bottom: 28px; }
.message.user { grid-template-columns: minmax(0, 1fr) 30px; }
.assistant-avatar { display: flex; width: 30px; height: 30px; align-items: center; justify-content: center; color: var(--brand); background: var(--brand-soft); border: 1px solid var(--line-strong); border-radius: 7px; }
.assistant-avatar :deep(svg) { width: 15px; }
.message-content { min-width: 0; }
.message.user .message-content { justify-self: end; max-width: min(82%, 660px); }
.message-meta { display: flex; align-items: center; gap: 7px; height: 23px; margin-bottom: 3px; font-size: 11px; }
.message-author { font-weight: 700; }
.message-model, .message-time { color: var(--faint); font-size: 10px; }
.user-bubble { padding: 10px 13px; color: var(--text); background: var(--brand-soft); border: 1px solid var(--line); border-radius: 8px 2px 8px 8px; font-size: 13px; line-height: 1.65; white-space: pre-wrap; }
.user-time { margin-top: 5px; color: var(--faint); font-size: 10px; text-align: right; }
.markdown { color: var(--text-secondary); font-size: 13px; line-height: 1.75; overflow-wrap: anywhere; }
.markdown :deep(p) { margin: 0 0 10px; }
.markdown :deep(h2), .markdown :deep(h3) { margin: 18px 0 8px; color: var(--text); font-size: 14px; }
.markdown :deep(ul), .markdown :deep(ol) { margin: 8px 0; padding-left: 21px; }
.markdown :deep(li) { margin: 4px 0; }
.markdown :deep(table) { width: 100%; margin: 12px 0; border-collapse: collapse; font-size: 12px; }
.markdown :deep(th), .markdown :deep(td) { padding: 8px; border: 1px solid var(--line); text-align: left; }
.markdown :deep(th) { background: var(--surface-3); }
.markdown :deep(blockquote) { margin: 12px 0; padding: 7px 11px; color: var(--muted); background: var(--surface-2); border-left: 3px solid var(--brand); }
.markdown :deep(code:not(pre code)) { padding: 2px 5px; color: var(--brand); background: var(--brand-soft); border-radius: 4px; font-size: 0.9em; }
.markdown :deep(pre) { position: relative; overflow: auto; margin: 12px 0; padding: 35px 13px 13px; color: var(--code-text); background: var(--code-bg); border-radius: 7px; font-size: 12px; line-height: 1.6; }

.message-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 10px;
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 8%, transparent);
  border-radius: 6px;
  font-size: 11px;
}

.typing { display: flex; height: 30px; align-items: center; gap: 4px; }
.typing i { width: 5px; height: 5px; background: var(--brand); border-radius: 50%; animation: typing 1.1s infinite; }
.typing i:nth-child(2) { animation-delay: 140ms; }
.typing i:nth-child(3) { animation-delay: 280ms; }
@keyframes typing { 0%,65%,100% { opacity: 0.35; transform: translateY(0); } 32% { opacity: 1; transform: translateY(-3px); } }

.message-tools { display: flex; min-height: 30px; align-items: center; gap: 2px; margin-top: 6px; opacity: 0; transition: opacity 140ms; }
.message:hover .message-tools, .message-tools:focus-within { opacity: 1; }
.message-tool { display: flex; width: 28px; height: 28px; align-items: center; justify-content: center; color: var(--faint); background: transparent; border-radius: 5px; border: 0; cursor: pointer; }
.message-tool:hover, .message-tool.active { color: var(--brand); background: var(--brand-soft); }
.message-tool :deep(svg) { width: 14px; }
.branch-switcher { display: flex; align-items: center; gap: 3px; margin-left: 4px; color: var(--faint); font-size: 10px; }
.branch-switcher button { display: flex; width: 24px; height: 24px; align-items: center; justify-content: center; color: inherit; background: transparent; border-radius: 4px; border: 0; cursor: pointer; }
.branch-switcher :deep(svg) { width: 12px; }

.sources { margin-top: 14px; }
.sources-title { display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 11px; font-weight: 650; }
.source-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; margin-top: 7px; }
.source { display: flex; min-width: 0; align-items: center; gap: 8px; padding: 8px; color: var(--text-secondary); background: var(--surface-2); border: 1px solid var(--line); border-radius: 6px; text-decoration: none; }
.source:hover { border-color: var(--brand); }
.source-index { display: flex; width: 21px; height: 21px; flex: 0 0 21px; align-items: center; justify-content: center; color: var(--brand); background: var(--brand-soft); border-radius: 4px; font-size: 10px; font-weight: 700; }
.source-copy { min-width: 0; }
.source-name { display: block; overflow: hidden; font-size: 10px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.source-domain { display: block; overflow: hidden; margin-top: 2px; color: var(--faint); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }

.artifact { display: flex; align-items: center; gap: 10px; margin-top: 13px; padding: 10px; background: color-mix(in srgb, var(--success) 5%, var(--surface)); border: 1px solid color-mix(in srgb, var(--success) 20%, var(--line)); border-radius: 7px; }
.artifact-icon { display: flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; color: var(--success); background: var(--surface); border: 1px solid var(--line); border-radius: 6px; }
.artifact-copy { min-width: 0; flex: 1; }
.artifact-name { overflow: hidden; font-size: 11px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.artifact-meta { margin-top: 3px; color: var(--faint); font-size: 9px; }

.jump-bottom {
  position: absolute; z-index: 5; bottom: 10px; left: 50%;
  display: flex; height: 32px; align-items: center; gap: 6px; padding: 0 10px;
  color: var(--text-secondary); background: var(--surface); border: 1px solid var(--line-strong); border-radius: 16px;
  box-shadow: var(--shadow-md); font-size: 11px;
  transform: translateX(-50%); cursor: pointer;
}
.jump-bottom :deep(svg) { width: 13px; }

.markdown :deep(.mermaid-config-toolbar) { display: flex; align-items: center; gap: 4px; margin: 8px 0; padding: 4px; background: var(--surface-2); border: 1px solid var(--line); border-radius: 5px; }
.markdown :deep(.mermaid-config-toolbar button) { display: inline-flex; width: 28px; height: 28px; align-items: center; justify-content: center; color: var(--muted); background: transparent; border: 0; border-radius: 4px; cursor: pointer; }
.markdown :deep(.mermaid-config-toolbar button:hover) { color: var(--brand); background: var(--brand-soft); }

.code-viewer-backdrop { position: fixed; z-index: 120; inset: 0; display: flex; justify-content: flex-end; background: color-mix(in srgb, var(--text) 28%, transparent); }
.code-viewer-drawer { display: flex; width: min(720px, 100vw); max-width: 100%; flex-direction: column; background: var(--surface); border-left: 1px solid var(--line); box-shadow: var(--shadow-lg); }
.code-viewer-head { display: flex; min-height: var(--header); align-items: center; gap: 8px; padding: 0 12px; color: var(--text-secondary); background: var(--surface-2); border-bottom: 1px solid var(--line); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }
.code-viewer-actions { display: flex; margin-left: auto; }
.code-viewer-content { min-height: 0; flex: 1; overflow: auto; margin: 0; padding: 16px; color: var(--code-text); background: var(--code-bg); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.65; white-space: pre; }

.avatar { display: flex; width: 30px; height: 30px; flex: 0 0 30px; align-items: center; justify-content: center; color: var(--brand); background: var(--brand-soft); border-radius: 50%; font-size: 11px; font-weight: 750; }

.secondary {
  display: inline-flex; min-height: 34px; align-items: center; justify-content: center;
  gap: 7px; padding: 0 11px; color: var(--text-secondary); background: var(--surface);
  border: 1px solid var(--line-strong); border-radius: 6px;
  font-size: 12px; font-weight: 600; cursor: pointer;
}
.secondary:hover { background: var(--surface-2); }

/* ─── Block-based styles ─── */

.message-usage {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px 8px;
  color: var(--faint);
  background: var(--surface-2);
  border-radius: 4px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.message-usage :deep(svg) { width: 11px; opacity: 0.7; }
.usage-sep { opacity: 0.4; }

.citation-block {
  margin-top: 10px;
  padding: 8px 10px;
  background: var(--surface-2);
  border-left: 3px solid var(--brand);
  border-radius: 4px;
}
.citation-title {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
}
.citation-content {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}

.tool-block {
  margin-top: 10px;
  padding: 8px 10px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 6px;
}
.tool-title {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 6px;
}
.tool-content {
  margin: 0;
  padding: 8px;
  color: var(--code-text);
  background: var(--code-bg);
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

/* ─── Settings-driven styles ─── */

/* Plain mode: remove bubble styling from user messages */
.message.plain-mode .user-bubble {
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: 4px 0;
}

/* Show divider between messages */
.message.show-divider {
  border-bottom: 1px solid var(--line);
  padding-bottom: 20px;
}

/* Code block: wrappable (applied via message class) */
.message.code-wrappable .markdown :deep(pre) {
  white-space: pre-wrap !important;
  word-break: break-word;
}

/* Code block: line numbers (applied via message class) */
.message.code-line-numbers .markdown :deep(pre) {
  counter-reset: line;
  padding-left: 3.5em !important;
}
.message.code-line-numbers .markdown :deep(pre > code) {
  counter-reset: line;
  display: block;
}
.message.code-line-numbers .markdown :deep(pre > code > span) {
  counter-increment: line;
}
.message.code-line-numbers .markdown :deep(pre > code > span::before) {
  content: counter(line);
  display: inline-block;
  width: 2em;
  margin-right: 1em;
  margin-left: -3em;
  color: var(--faint);
  text-align: right;
  user-select: none;
}

@media (max-width: 760px) {
  .message-list { padding: 22px 13px 125px; }
  .message { grid-template-columns: 26px minmax(0, 1fr); gap: 8px; margin-bottom: 23px; }
  .message.user { grid-template-columns: minmax(0, 1fr); }
  .message.user > .avatar { display: none; }
  .assistant-avatar { width: 26px; height: 26px; }
  .message.user .message-content { max-width: 90%; }
  .message-tools { opacity: 1; }
  .source-list { grid-template-columns: 1fr; }
}
@media (max-width: 390px) {
  .message-list { padding-right: 10px; padding-left: 10px; }
}
</style>
