<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useChatSend } from '@/composables/useChatSend'
import { parseSSEStream } from '@/composables/useChatSend'
import MessageList from '@/components/MessageList.vue'
import WelcomePrompts from '@/components/WelcomePrompts.vue'
import MessageSender from '@/components/MessageSender.vue'
import TopicList from '@/components/TopicList.vue'
import ImportDialog from '@/components/ImportDialog.vue'
import ExportDialog from '@/components/ExportDialog.vue'
import type { MessageBlock } from '@/types'
import type { MessageView } from '@/stores/app'
import type { SSEEvent } from '@/api/types'

const app = useAppStore()

const sidebarOpen = ref(false)
const inspectorOpen = ref(true)
const isMobile = ref(window.innerWidth <= 759)
const importDialogVisible = ref(false)
const exportDialogVisible = ref(false)

function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }

function handleCreateTopic() {
  app.createTopic()
  sidebarOpen.value = false
  ElMessage.success('已创建新话题')
}

const hasMessages = computed(() => (app.activeTopic?.messages.length ?? 0) > 0)
const selectedModelName = computed(() => app.activeAssistant?.model?.name ?? 'GPT-4o')

const messageListRef = ref<InstanceType<typeof MessageList>>()
const generating = computed(() => messageListRef.value?.generating ?? false)

// ===== Real streaming via useChatSend =====
function getActiveProvider() {
  const assistant = app.activeAssistant
  if (!assistant?.model) return null
  return app.providers.find(p => p.id === assistant.model!.provider) ?? null
}

async function onSend(text: string) {
  if (!text?.trim()) return
  if (!app.activeTopic) app.createTopic()
  const topicId = app.activeTopicId

  // 1. user message
  const userMsg = app.addMessage(topicId, {
    role: 'user', status: 'success',
    blocks: [{ id: crypto.randomUUID(), messageId: '', type: 'main_text', createdAt: new Date().toISOString(), status: 'success', content: text }],
  })
  if (!userMsg) return
  app.autoNameTopic(topicId, text)

  // 2. assistant placeholder (status: pending)
  const thinkingBlockId = crypto.randomUUID()
  const mainBlockId = crypto.randomUUID()
  const assistantMsg = app.addMessage(topicId, {
    role: 'assistant', status: 'pending', askId: userMsg.id,
    blocks: [
      { id: thinkingBlockId, messageId: '', type: 'thinking', createdAt: new Date().toISOString(), status: 'pending', content: '', thinking_millsec: 0 },
      { id: mainBlockId, messageId: '', type: 'main_text', createdAt: new Date().toISOString(), status: 'pending', content: '' },
    ],
  })
  if (!assistantMsg) return
  const assistantMsgId = assistantMsg.id

  // 3. provider
  const provider = getActiveProvider()
  if (!provider || !provider.apiKey || provider.apiKey === 'your-api-key') {
    simulateResponse(topicId, assistantMsgId, mainBlockId)
    return
  }

  // 4. real streaming
  const startTime = Date.now()
  let firstTokenTime = 0
  const thinkingStartTime = Date.now()
  let contentBuffer = ''
  let thinkingBuffer = ''

  const apiMessages = (app.activeTopic?.messages ?? [])
    .filter(m => m.status === 'success')
    .map(m => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.blocks.find(b => b.type === 'main_text')?.content ?? '',
    }))
  apiMessages.push({ role: 'user' as const, content: text })

  const assistant = app.activeAssistant
  const modelId = assistant.model?.id ?? 'gpt-4o'
  const aSettings = assistant.settings

  try {
    const { chatApi } = await import('@/api/chat')
    const stream = await chatApi.chatStream({
      provider,
      model: modelId,
      messages: apiMessages,
      temperature: aSettings?.temperature,
      maxTokens: aSettings?.enableMaxTokens ? aSettings?.maxTokens : undefined,
      topP: aSettings?.enableTopP ? aSettings?.topP : undefined,
      stream: true,
    })

    await parseSSEStream(stream, {
      onMessage(event: SSEEvent) {
        if (!firstTokenTime) firstTokenTime = Date.now()
        const delta = event.choices?.[0]?.delta
        if (delta?.content) {
          contentBuffer += delta.content
          app.updateBlock(topicId, assistantMsgId, mainBlockId, { content: contentBuffer, status: 'pending' })
        }
        if (delta?.reasoning_content) {
          thinkingBuffer += delta.reasoning_content
          app.updateBlock(topicId, assistantMsgId, thinkingBlockId, { content: thinkingBuffer, status: 'pending' })
        }
        if (event.usage) app.updateMessage(topicId, assistantMsgId, { usage: event.usage })
      },
      onError(error: Error) {
        app.updateMessage(topicId, assistantMsgId, { status: 'error' })
        app.addBlock(topicId, assistantMsgId, {
          id: crypto.randomUUID(), messageId: assistantMsgId, type: 'error',
          createdAt: new Date().toISOString(), status: 'error',
          error: { name: error.name, message: error.message, originalMessage: error.message, stack: error.stack ?? '' },
        })
        ElMessage.error(`请求失败: ${error.message}`)
      },
      onAbort() { finalizeMessage('success') },
      onFinish() { finalizeMessage('success') },
    })
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    app.updateMessage(topicId, assistantMsgId, { status: 'error' })
    app.addBlock(topicId, assistantMsgId, {
      id: crypto.randomUUID(), messageId: assistantMsgId, type: 'error',
      createdAt: new Date().toISOString(), status: 'error',
      error: { name: error.name, message: error.message, originalMessage: error.message, stack: error.stack ?? '' },
    })
    ElMessage.error(`请求失败: ${error.message}`)
  }

  function finalizeMessage(status: 'success' | 'error') {
    app.updateBlock(topicId, assistantMsgId, thinkingBlockId, { status: 'success', thinking_millsec: Date.now() - thinkingStartTime })
    app.updateBlock(topicId, assistantMsgId, mainBlockId, { status: 'success' })
    app.updateMessage(topicId, assistantMsgId, {
      status,
      metrics: {
        completion_tokens: contentBuffer.length,
        time_completion_millsec: Date.now() - startTime,
        time_first_token_millsec: firstTokenTime ? firstTokenTime - startTime : 0,
        time_thinking_millsec: Date.now() - thinkingStartTime,
      },
    })
  }
}

function simulateResponse(topicId: string, msgId: string, mainBlockId: string) {
  const startTime = Date.now()
  const reply = '这是 Orbit Chat 的模拟回复。配置 Provider API Key 后将接入真实流式响应。\n\n**功能特点：**\n- 本地优先，数据存于 IndexedDB\n- 多 Provider 支持（OpenAI / Anthropic / Gemini 等）\n- Cherry Studio v5 导入导出\n\n```typescript\nconsole.log("Hello Orbit Chat!")\n```'

  let i = 0
  const interval = setInterval(() => {
    i += 3
    app.updateBlock(topicId, msgId, mainBlockId, { content: reply.slice(0, i), status: 'pending' })
    if (i >= reply.length) {
      clearInterval(interval)
      app.updateBlock(topicId, msgId, mainBlockId, { content: reply, status: 'success' })
      app.updateMessage(topicId, msgId, {
        status: 'success',
        metrics: { completion_tokens: reply.length, time_completion_millsec: Date.now() - startTime, time_first_token_millsec: 100, time_thinking_millsec: 0 },
      })
    }
  }, 30)
}

function onPromptClick(text: string) { onSend(text) }

function stopGeneration() {
  messageListRef.value?.stopGeneration()
}

function onRetry(msg: MessageView) {
  const topic = app.activeTopic
  if (!topic) return
  const idx = topic.messages.findIndex(m => m.id === msg.id)
  app.deleteMessage(topic.id, msg.id)
  const prevUserMsg = idx > 0 ? topic.messages[idx - 1] : undefined
  if (prevUserMsg) onSend(getMainText(prevUserMsg))
}

function getMainText(msg: MessageView): string {
  const b = msg.blocks.find(x => x.type === 'main_text')
  return b && 'content' in b ? b.content : ''
}

window.addEventListener('resize', () => { isMobile.value = window.innerWidth <= 759 })
</script>

<template>
  <div class="chat-layout">
    <div v-if="sidebarOpen && isMobile" class="sidebar-overlay" @click="sidebarOpen = false" />

    <aside :class="['sidebar', { open: sidebarOpen || !isMobile }]">
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon"><i class="i-tabler-circle text-sm" /></div>
          <span class="sidebar-brand-text">Orbit Chat</span>
        </div>
        <button class="icon-btn" title="新建话题" @click="handleCreateTopic"><i class="i-tabler-plus text-sm" /></button>
      </div>

      <div class="sidebar-new">
        <button class="new-topic-btn" @click="handleCreateTopic"><i class="i-tabler-pencil text-sm" />新建对话</button>
      </div>

      <div class="sidebar-assistant">
        <div class="sidebar-section-label">Assistant</div>
        <RouterLink to="/assistants" class="assistant-btn">
          <div class="assistant-icon"><i class="i-tabler-sparkles text-sm" /></div>
          <div class="assistant-info">
            <div class="assistant-name">{{ app.activeAssistant?.emoji }} {{ app.activeAssistant?.name }}</div>
            <div class="assistant-model">{{ selectedModelName }}</div>
          </div>
          <i class="i-tabler-chevron-right text-sm text-muted" />
        </RouterLink>
      </div>

      <div class="sidebar-topics-header">
        <span class="sidebar-section-label">Topics</span>
        <div class="header-actions-sm">
          <button class="icon-btn-sm" title="导入" @click="importDialogVisible = true"><i class="i-tabler-upload text-sm" /></button>
          <button class="icon-btn-sm" title="导出" @click="exportDialogVisible = true"><i class="i-tabler-download text-sm" /></button>
          <RouterLink to="/search" class="icon-btn-sm" title="搜索"><i class="i-tabler-search text-sm" /></RouterLink>
        </div>
      </div>

      <div class="sidebar-topics scrollbar">
        <TopicList @select="sidebarOpen = false" />
      </div>

      <div class="sidebar-footer">
        <div class="status-bar">
          <span class="status-dot" :class="{ saving: app.saveStatus === 'saving' }" />
          <span class="text-xs text-muted">{{ app.saveStatus === 'saving' ? '保存中…' : app.saveStatus === 'error' ? '保存失败' : '本地数据已保存' }}</span>
          <i class="i-tabler-database text-sm text-muted ml-auto" />
        </div>
      </div>
    </aside>

    <main class="chat-main">
      <header class="chat-header">
        <div class="header-left">
          <button class="icon-btn mobile-only" title="侧栏" @click="toggleSidebar"><i class="i-tabler-menu text-lg" /></button>
          <button class="icon-btn desktop-only" title="侧栏" @click="toggleSidebar"><i class="i-tabler-layout-sidebar text-sm" /></button>
          <div class="header-info">
            <div class="header-title">{{ app.activeTopic?.name ?? '新对话' }}</div>
            <div class="header-sub"><span class="status-dot" />{{ selectedModelName }} · {{ generating ? '生成中' : '已就绪' }}</div>
          </div>
        </div>
        <div class="header-actions">
          <button v-if="generating" class="stop-btn-header" @click="stopGeneration"><i class="i-tabler-square text-xs fill-current" />停止</button>
          <button class="icon-btn" title="导入 Cherry JSON" @click="importDialogVisible = true"><i class="i-tabler-upload text-sm" /></button>
          <button class="icon-btn" title="导出 Cherry JSON" @click="exportDialogVisible = true"><i class="i-tabler-download text-sm" /></button>
          <button class="icon-btn" title="检查器" @click="inspectorOpen = !inspectorOpen"><i class="i-tabler-layout-sidebar-right-collapse text-sm" /></button>
          <RouterLink to="/settings" class="icon-btn" title="设置"><i class="i-tabler-settings text-sm" /></RouterLink>
        </div>
      </header>

      <div class="chat-body">
        <section class="chat-section">
          <div class="message-area scrollbar">
            <div class="message-container">
              <WelcomePrompts v-if="!hasMessages" @prompt-click="onPromptClick" />
              <MessageList v-else ref="messageListRef" @retry="onRetry" />
            </div>
          </div>

          <div class="composer-wrap">
            <MessageSender @send="onSend" />
          </div>
        </section>

        <aside v-if="inspectorOpen" class="inspector">
          <div class="inspector-header">
            <span class="text-sm font-semibold">检查器</span>
            <button class="icon-btn" title="关闭" @click="inspectorOpen = false"><i class="i-tabler-x text-sm" /></button>
          </div>
          <div class="inspector-stats">
            <div class="inspector-tabs"><button class="inspector-tab active">消息大纲</button><button class="inspector-tab">元信息</button></div>
            <div class="stats-list">
              <div class="stat-row"><span>消息数量</span><b>{{ app.activeTopic?.messages.length ?? 0 }}</b></div>
              <div class="stat-row"><span>上下文窗口</span><b>128K</b></div>
              <div class="stat-row"><span>当前模型</span><b>{{ selectedModelName }}</b></div>
            </div>
          </div>
          <div class="inspector-assistant">
            <div class="inspector-section-label">当前 Assistant</div>
            <div class="assistant-card">
              <div class="assistant-card-header">
                <div class="assistant-icon"><i class="i-tabler-sparkles text-sm" /></div>
                <div>
                  <div class="text-sm font-medium">{{ app.activeAssistant?.emoji }} {{ app.activeAssistant?.name }}</div>
                  <div class="text-xs text-muted">{{ app.activeAssistant?.description }}</div>
                </div>
              </div>
              <p class="assistant-desc">{{ app.activeAssistant?.prompt }}</p>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <nav class="mobile-nav">
      <RouterLink to="/" class="mobile-nav-btn" :class="{ active: $route.path === '/' }"><i class="i-tabler-message-circle text-lg" />对话</RouterLink>
      <RouterLink to="/search" class="mobile-nav-btn" :class="{ active: $route.path === '/search' }"><i class="i-tabler-search text-lg" />搜索</RouterLink>
      <RouterLink to="/settings" class="mobile-nav-btn" :class="{ active: $route.path === '/settings' }"><i class="i-tabler-settings text-lg" />设置</RouterLink>
    </nav>

    <!-- Import / Export dialogs -->
    <ImportDialog v-model:visible="importDialogVisible" />
    <ExportDialog v-model:visible="exportDialogVisible" />
  </div>
</template>

<style scoped lang="scss">
.chat-layout { display: flex; height: 100vh; overflow: hidden; }
.icon-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #667085; transition: all 0.15s; text-decoration: none; &:hover { background: #f3f4f6; color: #172033; } }
.icon-btn-sm { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; color: #667085; transition: all 0.15s; text-decoration: none; &:hover { background: #f3f4f6; color: #5b56d6; } }

.sidebar { position: fixed; top: 0; bottom: 0; left: 68px; width: 276px; display: flex; flex-direction: column; border-right: 1px solid #e5e7eb; background: #fff; z-index: 30; transition: transform 0.2s ease; &.open { transform: translateX(0); } &:not(.open) { transform: translateX(-105%); } }
.sidebar-overlay { position: fixed; inset: 0; z-index: 50; background: rgba(15, 23, 42, 0.25); }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; height: 60px; border-bottom: 1px solid #e5e7eb; padding: 0 16px; }
.sidebar-brand { display: flex; align-items: center; gap: 8px; &-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 12px; background: #efefff; color: #5b56d6; } &-text { font-weight: 600; letter-spacing: -0.02em; } }
.sidebar-new { border-bottom: 1px solid #e5e7eb; padding: 12px; }
.new-topic-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; border-radius: 12px; background: #5b56d6; padding: 10px 12px; font-size: 14px; font-weight: 500; color: #fff; transition: background 0.15s; &:hover { background: #4a45bd; } }
.sidebar-assistant { border-bottom: 1px solid #e5e7eb; padding: 12px; }
.sidebar-section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #667085; margin-bottom: 8px; }
.assistant-btn { display: flex; align-items: center; gap: 12px; width: 100%; border-radius: 12px; background: #efefff; padding: 8px 12px; text-align: left; text-decoration: none; .assistant-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; background: #fff; color: #5b56d6; box-shadow: 0 1px 2px rgba(0,0,0,0.04); } .assistant-info { flex: 1; min-width: 0; } .assistant-name { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .assistant-model { font-size: 12px; color: #667085; } }
.sidebar-topics-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 16px 8px; }
.header-actions-sm { display: flex; gap: 4px; }
.sidebar-topics { flex: 1; overflow-y: auto; padding: 0 8px; }
.sidebar-footer { border-top: 1px solid #e5e7eb; padding: 12px; }
.status-bar { display: flex; align-items: center; gap: 8px; border-radius: 12px; background: #f8fafc; padding: 10px 12px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block; &.saving { background: #f59e0b; animation: pulse 1s infinite; } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.chat-main { margin-left: 276px; flex: 1; display: flex; flex-direction: column; height: 100vh; min-width: 0; background: #fff; }
.chat-header { display: flex; align-items: center; justify-content: space-between; height: 60px; shrink: 0; border-bottom: 1px solid #e5e7eb; padding: 0 20px; }
.header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.header-info { min-width: 0; }
.header-title { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.header-sub { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #667085; }
.header-actions { display: flex; align-items: center; gap: 4px; }
.stop-btn-header { display: flex; align-items: center; gap: 6px; height: 32px; border-radius: 8px; background: #111827; padding: 0 12px; font-size: 12px; font-weight: 500; color: #fff; &:hover { background: #1f2937; } }

.chat-body { display: flex; flex: 1; min-height: 0; }
.chat-section { position: relative; display: flex; flex-direction: column; flex: 1; min-width: 0; }
.message-area { flex: 1; overflow-y: auto; padding: 32px 24px 144px; }
.message-container { max-width: 820px; margin: 0 auto; }
.composer-wrap { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, #fff, #fff, transparent); padding: 40px 16px 20px; }

.inspector { width: 304px; shrink: 0; border-left: 1px solid #e5e7eb; background: #f8fafc; @media (max-width: 1179px) { display: none; } }
.inspector-header { display: flex; align-items: center; justify-content: space-between; height: 60px; border-bottom: 1px solid #e5e7eb; padding: 0 16px; }
.inspector-stats { border-bottom: 1px solid #e5e7eb; padding: 16px; }
.inspector-tabs { display: flex; gap: 4px; border-radius: 8px; background: rgba(229, 231, 235, 0.7); padding: 4px; margin-bottom: 12px; }
.inspector-tab { flex: 1; border-radius: 6px; padding: 6px 0; font-size: 12px; font-weight: 500; color: #667085; &.active { background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.04); } }
.stats-list { display: flex; flex-direction: column; gap: 12px; font-size: 12px; color: #667085; }
.stat-row { display: flex; justify-content: space-between; b { color: #172033; font-weight: 600; } }
.inspector-assistant { padding: 16px; }
.inspector-section-label { font-size: 12px; font-weight: 600; color: #172033; margin-bottom: 12px; }
.assistant-card { border-radius: 12px; border: 1px solid #e5e7eb; background: #fff; padding: 12px; }
.assistant-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; .assistant-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; background: #efefff; color: #5b56d6; } }
.assistant-desc { font-size: 12px; line-height: 1.5; color: #667085; margin: 0; }

.mobile-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; height: 58px; align-items: center; justify-content: space-around; border-top: 1px solid #e5e7eb; background: #fff; }
.mobile-nav-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10px; color: #667085; text-decoration: none; &.active { color: #5b56d6; } }

.mobile-only { display: none; }
@media (max-width: 759px) {
  .mobile-only { display: flex; }
  .mobile-nav { display: flex; }
  .chat-main { margin-left: 0; padding-bottom: 58px; }
  .composer-wrap { bottom: 58px; }
  .message-area { padding-left: 16px; padding-right: 16px; }
  .sidebar { left: 0; box-shadow: 10px 0 30px rgba(16,24,40,0.14); }
}
</style>
