<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'
import { MarkdownRenderer } from 'x-markdown-vue'
import { FilesCard, Thinking, BubbleList } from 'vue-element-plus-x'
import type { PromptsItemsProps } from 'vue-element-plus-x/types/Prompts'
import { WELCOME_PROMPTS } from '@/config/welcome-prompts'
import { useTheme } from '@/composables/useTheme'
import WelcomeScreen from './WelcomeScreen.vue'
import 'x-markdown-vue/style'
import type { ChatMessage, MessageBlock } from '@/types'

const store = useChatStore()
const appStore = useAppStore()
const uiStore = useUiStore()
const { isDark } = useTheme()
const bubbleListRef = ref<{ scrollToBottom: (smooth?: boolean) => void } | null>(null)
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
const autoScroll = computed(() => appStore.settings?.autoScroll ?? true)

// Dynamic CSS class for message styling
const messageClass = computed(() => ({
  'plain-mode': isPlainMode.value,
  'show-divider': showMessageDivider.value,
  'code-wrappable': codeWrappable.value,
  'code-line-numbers': codeShowLineNumbers.value,
}))

// ─── BubbleList items: pure computed mapping from store.messages ───
// Each item is a plain object that BubbleList passes back via slot { item }
interface BubbleItem {
  key: string
  placement: 'start' | 'end'
  loading: boolean
  message: ChatMessage
}

const bubbleItems = computed<BubbleItem[]>(() =>
  store.messages.map((message) => ({
    key: message.id,
    placement: message.role === 'user' ? 'end' : 'start',
    loading: !!message.loading,
    message,
  })),
)

// ─── Welcome screen dynamic content ───
const welcomeIcon = computed(() => {
  const assistantId = store.currentChat?.assistantId ?? store.activeAssistantId
  const assistant = appStore.assistants.find(a => a.id === assistantId) ?? appStore.defaultAssistant
  return assistant?.emoji || 'tabler:sparkles'
})

const welcomeTitle = computed(() => {
  const assistantId = store.currentChat?.assistantId ?? store.activeAssistantId
  const assistant = appStore.assistants.find(a => a.id === assistantId) ?? appStore.defaultAssistant
  return assistant ? `与 ${assistant.name} 对话` : '开始新对话'
})

const welcomeDescription = computed(() => {
  const assistantId = store.currentChat?.assistantId ?? store.activeAssistantId
  const assistant = appStore.assistants.find(a => a.id === assistantId) ?? appStore.defaultAssistant
  return assistant?.description || '输入消息或粘贴文件，AI 将为你解答'
})

// ─── Preset prompts for empty state ───
const promptItems = WELCOME_PROMPTS

function handlePromptClick(item: PromptsItemsProps) {
  if (!item.label) return
  store.draft = item.label
  store.sendMessage()
}

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

function closeCodeViewer() {
  codeViewer.value = null
}

async function copyCodeViewer() {
  if (!codeViewer.value) return
  try {
    await navigator.clipboard.writeText(codeViewer.value.code)
    uiStore.showToast('代码已复制')
  } catch {
    uiStore.showToast('浏览器未授予剪贴板权限')
  }
}

// ─── Scroll handling delegated to BubbleList ───
function scrollToBottom(smooth = false) {
  bubbleListRef.value?.scrollToBottom(smooth)
  uiStore.nearBottom = true
}

function onScrollStateChange(state: 'AT_BOTTOM' | 'SCROLLED_UP' | 'HAS_NEW_MESSAGES') {
  uiStore.nearBottom = state === 'AT_BOTTOM'
}

// Watch messages length for auto-follow during generation
watch(
  () => store.messages.length,
  () => {
    if (autoScroll.value && (uiStore.nearBottom || store.generating)) {
      nextTick(() => scrollToBottom())
    }
  },
)

// Watch for content updates during streaming
watch(
  () => store.messages.map(m => m.content).join(''),
  () => {
    if (autoScroll.value && uiStore.nearBottom) nextTick(() => scrollToBottom())
  },
)

// Watch reasoning content updates
watch(
  () => store.messages.map(m => m.reasoningContent ?? '').join(''),
  () => {
    if (autoScroll.value && uiStore.nearBottom) nextTick(() => scrollToBottom())
  },
)

nextTick(() => scrollToBottom())

defineExpose({ scrollToBottom })
</script>

<template>
  <section class="chat-area" :class="messageClass">
    <!-- Empty state: Welcome + Prompts -->
    <WelcomeScreen
      v-if="store.messages.length === 0"
      :icon="welcomeIcon"
      :title="welcomeTitle"
      :description="welcomeDescription"
      :prompts="promptItems"
      @item-click="handlePromptClick"
    />

    <!-- BubbleList -->
    <BubbleList
      v-else
      ref="bubbleListRef"
      :list="bubbleItems"
      :auto-scroll="autoScroll"
      :virtual="false"
      item-key="key"
      :show-back-button="true"
      :back-button-threshold="80"
      @scroll-state-change="onScrollStateChange"
    >
      <!-- ─── Header slot: model name / time / status ─── -->
      <template #header="{ item }">
        <template v-if="item.message.role === 'assistant'">
          <div class="message-meta">
            <span class="message-author">Assistant</span>
            <span v-if="item.message.model" class="message-model">{{ item.message.model }}</span>
            <span class="message-time">{{ new Date(item.message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}</span>
          </div>
        </template>
        <template v-else>
          <div class="user-meta">
            <span class="message-time">{{ new Date(item.message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}</span>
          </div>
        </template>
      </template>

      <!-- ─── Avatar slot ─── -->
      <template #avatar="{ item }">
        <template v-if="item.message.role === 'assistant'">
          <div class="assistant-avatar">
            <Icon icon="tabler:sparkles" />
          </div>
        </template>
        <template v-else>
          <div class="avatar">我</div>
        </template>
      </template>

      <!-- ─── Content slot: blocks rendering ─── -->
      <template #content="{ item }">
        <!-- Assistant content -->
        <template v-if="item.message.role === 'assistant'">
          <!-- Block-based rendering (if blocks exist) -->
          <template v-if="getBlocks(item.message)">
            <template v-for="(block, blockIdx) in getBlocks(item.message)" :key="block.id || blockIdx">
              <!-- Thinking block -->
              <Thinking
                v-if="block.type === 'thinking'"
                :content="block.content"
                :status="item.message.loading ? 'thinking' : 'end'"
                :auto-collapse="true"
              />

              <!-- Main text block -->
              <div v-else-if="block.type === 'main_text'" class="markdown" :style="{ fontSize }">
                <div v-if="item.message.loading && !block.content" class="typing">
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
            <Thinking
              v-if="item.message.reasoningContent"
              :content="item.message.reasoningContent"
              :status="item.message.loading ? 'thinking' : 'end'"
              :auto-collapse="true"
            />

            <div v-if="item.message.loading && !item.message.content" class="typing">
              <i /><i /><i />
            </div>

            <div v-if="item.message.content" class="markdown" :style="{ fontSize }">
              <MarkdownRenderer :markdown="item.message.content" v-bind="markdownRendererOptions" />
            </div>
          </template>

          <!-- Error indicator (legacy, for messages without error block) -->
          <div v-if="item.message.error && !getBlocks(item.message)?.some(b => b.type === 'error')" class="message-error">
            <Icon icon="tabler:alert-circle" width="14" />
            {{ item.message.error }}
          </div>

          <!-- Sources -->
          <div v-if="item.message.sources?.length" class="sources">
            <div class="sources-title">
              <Icon icon="tabler:books" width="14" />
              引用来源
            </div>
            <div class="source-list">
              <a
                v-for="(source, idx) in item.message.sources"
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
          <div v-if="item.message.artifact" class="artifact">
            <span class="artifact-icon">
              <Icon icon="tabler:file-code-2" width="16" />
            </span>
            <span class="artifact-copy">
              <span class="artifact-name">{{ item.message.artifact.name }}</span>
              <span class="artifact-meta">{{ item.message.artifact.meta }}</span>
            </span>
            <button class="secondary" @click="uiStore.showToast('已在右侧打开产物预览')">
              <Icon icon="tabler:layout-sidebar-right-expand" width="13" />
              打开
            </button>
          </div>
        </template>

        <!-- User content -->
        <template v-else>
          <div class="user-bubble">{{ item.message.content }}</div>
          <div v-if="item.message.attachments?.length" class="user-attachments">
            <FilesCard
              v-for="att in item.message.attachments"
              :key="att.id"
              :uid="att.id"
              :name="att.name"
              :file-size="att.fileSize"
              :url="att.url"
              :img-preview="true"
              :img-preview-mask="true"
            />
          </div>
        </template>
      </template>

      <!-- ─── Footer slot: tools + usage ─── -->
      <template #footer="{ item }">
        <!-- Assistant footer -->
        <template v-if="item.message.role === 'assistant'">
          <!-- Usage info -->
          <div v-if="hasUsage(item.message) && !item.message.loading" class="message-usage">
            <Icon icon="tabler:chart-bar" width="12" />
            <span>输入 {{ getUsage(item.message)?.prompt_tokens ?? '?' }}</span>
            <span class="usage-sep">/</span>
            <span>输出 {{ getUsage(item.message)?.completion_tokens ?? '?' }}</span>
            <span class="usage-sep">/</span>
            <span>总计 {{ getUsage(item.message)?.total_tokens ?? '?' }} tokens</span>
          </div>

          <!-- Message tools -->
          <div v-if="!item.message.loading" class="message-tools">
            <button class="message-tool tooltip" data-tip="复制" aria-label="复制消息" @click="store.copyMessage(item.message)">
              <Icon icon="tabler:copy" />
            </button>
            <button
              class="message-tool tooltip"
              data-tip="有帮助"
              aria-label="有帮助"
              :class="{ active: item.message.rating === 'up' }"
              @click="store.rateMessage(item.message, 'up')"
            >
              <Icon icon="tabler:thumb-up" />
            </button>
            <button
              class="message-tool tooltip"
              data-tip="没有帮助"
              aria-label="没有帮助"
              :class="{ active: item.message.rating === 'down' }"
              @click="store.rateMessage(item.message, 'down')"
            >
              <Icon icon="tabler:thumb-down" />
            </button>
            <button class="message-tool tooltip" data-tip="重新生成" aria-label="重新生成" @click="store.regenerate(item.message)">
              <Icon icon="tabler:rotate-clockwise" />
            </button>
            <button class="message-tool tooltip" data-tip="从这里分支" aria-label="从这里分支" @click="store.branchFrom(item.message)">
              <Icon icon="tabler:git-branch" />
            </button>
            <div v-if="(item.message.branches ?? 0) > 1" class="branch-switcher">
              <button><Icon icon="tabler:chevron-left" /></button>
              {{ item.message.activeBranch }}/{{ item.message.branches }}
              <button><Icon icon="tabler:chevron-right" /></button>
            </div>
          </div>
        </template>

        <!-- User footer -->
        <template v-else>
          <div class="message-tools" style="justify-content:flex-end">
            <button class="message-tool tooltip" data-tip="编辑并重新发送" aria-label="编辑并重新发送" @click="store.editMessage(item.message)">
              <Icon icon="tabler:pencil" />
            </button>
            <button class="message-tool tooltip" data-tip="复制" aria-label="复制消息" @click="store.copyMessage(item.message)">
              <Icon icon="tabler:copy" />
            </button>
          </div>
        </template>
      </template>

      <!-- ─── Loading slot ─── -->
      <template #loading="{ item }">
        <div v-if="item.message.role === 'assistant' && item.message.loading" class="typing">
          <i /><i /><i />
        </div>
      </template>

      <!-- ─── Custom back-to-bottom button ─── -->
      <template #backToBottom>
        <button class="jump-bottom">
          <Icon icon="tabler:arrow-down" />
          回到底部
        </button>
      </template>
    </BubbleList>

    <!-- Code Viewer Drawer (Teleport) -->
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

/* ─── BubbleList wrapper ─── */
.chat-area :deep(.elx-bubble-list) {
  width: min(100%, 820px);
  margin: 0 auto;
  padding: 32px 24px 120px;
}

/* ─── Date divider ─── */
.date-divider { display: flex; align-items: center; gap: 12px; margin: 4px 0 28px; color: var(--faint); font-size: 10px; }
.date-divider::before, .date-divider::after { height: 1px; flex: 1; background: var(--line); content: ""; }

/* ─── Avatars ─── */
.assistant-avatar {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid var(--line-strong);
  border-radius: 7px;
}
.assistant-avatar :deep(svg) { width: 15px; }

.avatar {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 50%;
  font-size: 11px;
  font-weight: 750;
}

/* ─── Message meta ─── */
.message-meta { display: flex; align-items: center; gap: 7px; height: 23px; margin-bottom: 3px; font-size: 11px; }
.message-author { font-weight: 700; }
.message-model, .message-time { color: var(--faint); font-size: 10px; }
.user-meta { display: flex; justify-content: flex-end; height: 18px; margin-bottom: 2px; }

/* ─── User bubble ─── */
.user-bubble {
  padding: 10px 13px;
  color: var(--text);
  background: var(--brand-soft);
  border: 1px solid var(--line);
  border-radius: 8px 2px 8px 8px;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* User attachments */
.user-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
  justify-content: flex-end;
}

/* ─── Typing indicator ─── */
.typing { display: flex; height: 30px; align-items: center; gap: 4px; }
.typing i { width: 5px; height: 5px; background: var(--brand); border-radius: 50%; animation: typing 1.1s infinite; }
.typing i:nth-child(2) { animation-delay: 140ms; }
.typing i:nth-child(3) { animation-delay: 280ms; }
@keyframes typing { 0%,65%,100% { opacity: 0.35; transform: translateY(0); } 32% { opacity: 1; transform: translateY(-3px); } }

/* ─── Message tools ─── */
.message-tools { display: flex; min-height: 30px; align-items: center; gap: 2px; margin-top: 6px; opacity: 0; transition: opacity 140ms; }
.chat-area :deep(.elx-bubble):hover .message-tools,
.chat-area :deep(.elx-bubble-list__item):hover .message-tools,
.message-tools:focus-within { opacity: 1; }
.message-tool {
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  color: var(--faint);
  background: transparent;
  border-radius: 5px;
  border: 0;
  cursor: pointer;
}
.message-tool:hover, .message-tool.active { color: var(--brand); background: var(--brand-soft); }
.message-tool :deep(svg) { width: 14px; }
.branch-switcher { display: flex; align-items: center; gap: 3px; margin-left: 4px; color: var(--faint); font-size: 10px; }
.branch-switcher button { display: flex; width: 24px; height: 24px; align-items: center; justify-content: center; color: inherit; background: transparent; border-radius: 4px; border: 0; cursor: pointer; }
.branch-switcher :deep(svg) { width: 12px; }

/* ─── Error ─── */
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

/* ─── Sources ─── */
.sources { margin-top: 14px; }
.sources-title { display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 11px; font-weight: 650; }
.source-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; margin-top: 7px; }
.source { display: flex; min-width: 0; align-items: center; gap: 8px; padding: 8px; color: var(--text-secondary); background: var(--surface-2); border: 1px solid var(--line); border-radius: 6px; text-decoration: none; }
.source:hover { border-color: var(--brand); }
.source-index { display: flex; width: 21px; height: 21px; flex: 0 0 21px; align-items: center; justify-content: center; color: var(--brand); background: var(--brand-soft); border-radius: 4px; font-size: 10px; font-weight: 700; }
.source-copy { min-width: 0; }
.source-name { display: block; overflow: hidden; font-size: 10px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.source-domain { display: block; overflow: hidden; margin-top: 2px; color: var(--faint); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }

/* ─── Artifact ─── */
.artifact { display: flex; align-items: center; gap: 10px; margin-top: 13px; padding: 10px; background: color-mix(in srgb, var(--success) 5%, var(--surface)); border: 1px solid color-mix(in srgb, var(--success) 20%, var(--line)); border-radius: 7px; }
.artifact-icon { display: flex; width: 34px; height: 34px; flex: 0 0 34px; align-items: center; justify-content: center; color: var(--success); background: var(--surface); border: 1px solid var(--line); border-radius: 6px; }
.artifact-copy { min-width: 0; flex: 1; }
.artifact-name { overflow: hidden; font-size: 11px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.artifact-meta { margin-top: 3px; color: var(--faint); font-size: 9px; }

/* ─── Jump to bottom button ─── */
.jump-bottom {
  position: absolute;
  z-index: 5;
  bottom: 10px;
  left: 50%;
  display: flex;
  height: 32px;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  color: var(--text-secondary);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  font-size: 11px;
  transform: translateX(-50%);
  cursor: pointer;
}
.jump-bottom :deep(svg) { width: 13px; }

/* ─── Usage ─── */
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

/* ─── Citation block ─── */
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

/* ─── Tool block ─── */
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

/* ─── Secondary button ─── */
.secondary {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 11px;
  color: var(--text-secondary);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.secondary:hover { background: var(--surface-2); }

/* ─── Code viewer drawer ─── */
.code-viewer-backdrop { position: fixed; z-index: 120; inset: 0; display: flex; justify-content: flex-end; background: color-mix(in srgb, var(--text) 28%, transparent); }
.code-viewer-drawer { display: flex; width: min(720px, 100vw); max-width: 100%; flex-direction: column; background: var(--surface); border-left: 1px solid var(--line); box-shadow: var(--shadow-lg); }
.code-viewer-head { display: flex; min-height: var(--header); align-items: center; gap: 8px; padding: 0 12px; color: var(--text-secondary); background: var(--surface-2); border-bottom: 1px solid var(--line); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }
.code-viewer-actions { display: flex; margin-left: auto; }
.code-viewer-content { min-height: 0; flex: 1; overflow: auto; margin: 0; padding: 16px; color: var(--code-text); background: var(--code-bg); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.65; white-space: pre; }

/* ─── Settings-driven styles ─── */

/* Plain mode: remove bubble styling from user messages */
.chat-area.plain-mode :deep(.elx-bubble--end .elx-bubble__content) {
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: 4px 0;
}

/* Show divider between messages */
.chat-area.show-divider :deep(.elx-bubble-list__item) {
  border-bottom: 1px solid var(--line);
  padding-bottom: 20px;
}

/* ─── Bubble customization ─── */
.chat-area :deep(.elx-bubble) {
  margin-bottom: 28px;
}
.chat-area :deep(.elx-bubble--start) {
  --elx-bubble-max-width: none;
}
.chat-area :deep(.elx-bubble--end) {
  --elx-bubble-max-width: min(82%, 660px);
}
.chat-area :deep(.elx-bubble__content) {
  min-width: 0;
}

/* ─── Mobile responsive ─── */
@media (max-width: 760px) {
  .chat-area :deep(.elx-bubble-list) { padding: 22px 13px 125px; }
  .chat-area :deep(.elx-bubble) { margin-bottom: 23px; }
  .message-tools { opacity: 1; }
  .source-list { grid-template-columns: 1fr; }
}
@media (max-width: 390px) {
  .chat-area :deep(.elx-bubble-list) { padding-right: 10px; padding-left: 10px; }
}
</style>
