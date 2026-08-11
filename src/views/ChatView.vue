<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import type { ChatMessage } from '@/types'

const app = useAppStore()

// 视图状态
const sidebarOpen = ref(false)
const inspectorOpen = ref(true)
const isMobile = ref(window.innerWidth <= 759)
const generating = ref(false)
const draft = ref('')
const attachments = ref<string[]>([])

// 侧边栏
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function handleCreateTopic() {
  app.createTopic()
  draft.value = ''
  sidebarOpen.value = false
  ElMessage.success('已创建新话题')
}

function handleSelectTopic(id: string) {
  app.selectTopic(id)
  sidebarOpen.value = false
}

async function handleDeleteTopic(id: string) {
  try {
    await ElMessageBox.confirm('删除后无法恢复，确认删除？', '删除话题', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    app.deleteTopic(id)
    ElMessage.success('已删除')
  } catch { /* cancelled */ }
}

function handleTogglePin(id: string) {
  app.togglePin(id)
}

function handleRenameTopic(id: string) {
  ElMessageBox.prompt('输入新的话题名称', '重命名', {
    confirmButtonText: '保存',
    cancelButtonText: '取消',
    inputValue: app.topics.find(t => t.id === id)?.name ?? '',
  }).then(({ value }) => {
    if (value?.trim()) app.renameTopic(id, value.trim())
  }).catch(() => {})
}

function handleClearMessages(id: string) {
  ElMessageBox.confirm('清空所有消息？此操作不可撤销。', '清空消息', {
    type: 'warning',
  }).then(() => {
    app.clearTopicMessages(id)
    ElMessage.success('已清空')
  }).catch(() => {})
}

// 欢迎页提示词
const prompts = [
  { key: 'doc', label: '整理一份文档', description: '把零散内容整理成清晰的结构和行动计划' },
  { key: 'brainstorm', label: '头脑风暴', description: '围绕一个目标生成多个可执行的想法' },
  { key: 'code', label: '解释代码', description: '逐步解释代码逻辑，并指出潜在问题' },
  { key: 'translate', label: '翻译文本', description: '保持原意和语气，翻译成自然的中文' },
]

function onPromptClick(description: string) {
  draft.value = description
}

// 发送消息（模拟流式）
async function send() {
  if (!draft.value.trim() || generating.value) return
  const text = draft.value.trim()
  draft.value = ''
  attachments.value = []

  app.addMessage(app.activeTopicId, {
    role: 'user',
    content: text,
    status: 'complete',
  })

  generating.value = true

  await nextTick()
  const assistantMsg = app.addMessage(app.activeTopicId, {
    role: 'assistant',
    content: '我正在整理你的请求，请稍候…',
    status: 'streaming',
    model: 'gpt-4o',
  })

  scrollToBottom()

  setTimeout(() => {
    app.updateMessage(app.activeTopicId, assistantMsg.id, {
      status: 'complete',
      usage: 126,
      content: '这是一个可交互的 Orbit Chat 原型。你可以继续发送消息、切换搜索和设置视图，并在移动端查看响应式布局。\n\n下一步可以接入真实的 IndexedDB、Provider 适配器和流式响应。',
    })
    generating.value = false
    scrollToBottom()
  }, 1500)
}

function stopGeneration() {
  generating.value = false
  const msgs = app.activeTopic?.messages
  const last = msgs?.[msgs.length - 1]
  if (last?.status === 'streaming') {
    app.updateMessage(app.activeTopicId, last.id, { status: 'stopped' })
  }
  ElMessage.info('生成已停止，已保留已接收内容')
}

function retryMessage(msg: ChatMessage) {
  if (msg.role !== 'assistant') return
  const idx = app.activeTopic.messages.findIndex(m => m.id === msg.id)
  if (idx >= 0) {
    app.activeTopic.messages.splice(idx, 1)
  }
  const prevUserMsg = app.activeTopic.messages[idx - 1]
  if (prevUserMsg) {
    draft.value = prevUserMsg.content
    prevUserMsg.status = 'complete'
    send()
  }
}

function copyMessage(msg: ChatMessage) {
  navigator.clipboard.writeText(msg.content)
  ElMessage.success('已复制到剪贴板')
}

// 滚动
const messageAreaRef = ref<HTMLElement>()
function scrollToBottom() {
  nextTick(() => {
    if (messageAreaRef.value) {
      messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight
    }
  })
}

watch(() => app.activeTopicId, () => {
  scrollToBottom()
})

const selectedModelName = computed(() => {
  const a = app.activeAssistant
  return a?.model ?? 'GPT-4o'
})

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 759
})

</script>

<template>
  <div class="chat-layout">
    <!-- 移动遮罩 -->
    <div v-if="sidebarOpen && isMobile" class="sidebar-overlay" @click="sidebarOpen = false" />

    <!-- 对话侧栏 -->
    <aside :class="['sidebar', { open: sidebarOpen || !isMobile }]">
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon">
            <i class="i-tabler-circle text-sm" />
          </div>
          <span class="sidebar-brand-text">Orbit Chat</span>
        </div>
        <button class="icon-btn" title="新建话题" @click="handleCreateTopic">
          <i class="i-tabler-plus text-sm" />
        </button>
      </div>

      <div class="sidebar-new">
        <button class="new-topic-btn" @click="handleCreateTopic">
          <i class="i-tabler-pencil text-sm" />
          新建对话
        </button>
      </div>

      <div class="sidebar-assistant">
        <div class="sidebar-section-label">Assistants</div>
        <button class="assistant-btn">
          <div class="assistant-icon">
            <i class="i-tabler-sparkles text-sm" />
          </div>
          <div class="assistant-info">
            <div class="assistant-name">Orbit Assistant</div>
            <div class="assistant-model">GPT-4o · OpenAI</div>
          </div>
          <i class="i-tabler-chevron-down text-sm text-muted" />
        </button>
      </div>

      <div class="sidebar-topics-header">
        <span class="sidebar-section-label">Topics</span>
        <RouterLink to="/search" class="icon-btn-sm" title="搜索历史">
          <i class="i-tabler-search text-sm" />
        </RouterLink>
      </div>

      <div class="sidebar-topics scrollbar">
        <template v-if="app.sortedTopics.length === 0">
          <div class="empty-topics">
            <i class="i-tabler-message-circle-off text-2xl text-slate-300" />
            <p class="text-sm font-medium mt-2">还没有话题</p>
            <p class="text-xs text-muted mt-1">开始一次新的对话</p>
          </div>
        </template>
        <template v-else>
          <div v-if="app.sortedTopics.some(t => t.pinned)" class="topic-group-label">置顶</div>
          <button
            v-for="topic in app.sortedTopics.filter(t => t.pinned)"
            :key="topic.id"
            :class="['topic-item', { active: app.activeTopicId === topic.id }]"
            @click="handleSelectTopic(topic.id)"
          >
            <i class="i-tabler-pin text-xs text-brand shrink-0" />
            <span class="topic-name">{{ topic.name }}</span>
            <el-dropdown trigger="click" @command="(cmd: string) => {
              if (cmd === 'rename') handleRenameTopic(topic.id)
              else if (cmd === 'pin') handleTogglePin(topic.id)
              else if (cmd === 'clear') handleClearMessages(topic.id)
              else if (cmd === 'delete') handleDeleteTopic(topic.id)
            }">
              <span class="topic-more" @click.stop><i class="i-tabler-dots text-sm" /></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="rename">重命名</el-dropdown-item>
                  <el-dropdown-item command="pin">取消置顶</el-dropdown-item>
                  <el-dropdown-item command="clear">清空消息</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </button>

          <div class="topic-group-label mt-4">最近</div>
          <button
            v-for="topic in app.sortedTopics.filter(t => !t.pinned)"
            :key="topic.id"
            :class="['topic-item', { active: app.activeTopicId === topic.id }]"
            @click="handleSelectTopic(topic.id)"
          >
            <i class="i-tabler-message text-xs text-slate-400 shrink-0" />
            <span class="topic-name">{{ topic.name }}</span>
            <el-dropdown trigger="click" @command="(cmd: string) => {
              if (cmd === 'rename') handleRenameTopic(topic.id)
              else if (cmd === 'pin') handleTogglePin(topic.id)
              else if (cmd === 'clear') handleClearMessages(topic.id)
              else if (cmd === 'delete') handleDeleteTopic(topic.id)
            }">
              <span class="topic-more" @click.stop><i class="i-tabler-dots text-sm" /></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="rename">重命名</el-dropdown-item>
                  <el-dropdown-item command="pin">置顶</el-dropdown-item>
                  <el-dropdown-item command="clear">清空消息</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </button>
        </template>
      </div>

      <div class="sidebar-footer">
        <div class="status-bar">
          <span class="status-dot" />
          <span class="text-xs text-muted">本地数据已保存</span>
          <i class="i-tabler-database text-sm text-muted ml-auto" />
        </div>
      </div>
    </aside>

    <!-- 主区 -->
    <main class="chat-main">
      <!-- Header -->
      <header class="chat-header">
        <div class="header-left">
          <button class="icon-btn mobile-only" title="侧栏" @click="toggleSidebar">
            <i class="i-tabler-menu text-lg" />
          </button>
          <button class="icon-btn desktop-only" title="侧栏" @click="toggleSidebar">
            <i class="i-tabler-layout-sidebar text-sm" />
          </button>
          <div class="header-info">
            <div class="header-title">{{ app.activeTopic?.name ?? '新对话' }}</div>
            <div class="header-sub">
              <span class="status-dot" />
              GPT-4o · 已就绪
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-btn" title="检查器" @click="inspectorOpen = !inspectorOpen">
            <i class="i-tabler-layout-sidebar-right-collapse text-sm" />
          </button>
          <RouterLink to="/settings" class="icon-btn" title="设置">
            <i class="i-tabler-settings text-sm" />
          </RouterLink>
        </div>
      </header>

      <div class="chat-body">
        <section class="chat-section">
          <!-- 消息区 -->
          <div ref="messageAreaRef" class="message-area scrollbar">
            <div class="message-container">
              <!-- 欢迎页 -->
              <div v-if="app.activeTopic && app.activeTopic.messages.length === 0" class="welcome-wrap">
                <div class="welcome-icon">
                  <i class="i-tabler-sparkles text-2xl text-brand" />
                </div>
                <h1 class="welcome-title">今天想聊点什么？</h1>
                <p class="welcome-desc">本地优先 · 多 Provider · 数据自主可控</p>
                <div class="prompts-grid">
                  <button
                    v-for="p in prompts"
                    :key="p.key"
                    class="prompt-card"
                    @click="onPromptClick(p.description)"
                  >
                    <div class="prompt-label">
                      <i class="i-tabler-bulb text-sm text-brand" />
                      {{ p.label }}
                    </div>
                    <p class="prompt-text">{{ p.description }}</p>
                  </button>
                </div>
              </div>

              <!-- 消息列表 -->
              <div v-for="msg in app.activeTopic?.messages" :key="msg.id" class="message-row">
                <!-- Assistant 头像 -->
                <div v-if="msg.role === 'assistant'" class="message-avatar">
                  <i class="i-tabler-circle text-sm text-white" />
                </div>

                <!-- 消息内容 -->
                <div :class="msg.role === 'user' ? 'message-bubble-user' : 'message-bubble-assistant'">
                  <!-- 思考过程 -->
                  <div v-if="msg.reasoningContent" class="thinking-block">
                    <div class="thinking-header">
                      <i class="i-tabler-brain text-xs" />
                      思考过程
                    </div>
                    <div class="thinking-content">{{ msg.reasoningContent }}</div>
                  </div>

                  <!-- 消息正文 -->
                  <div class="message-content" v-html="msg.content.replace(/\n/g, '<br>')" />

                  <!-- 流式中 -->
                  <div v-if="msg.status === 'streaming'" class="streaming-indicator">
                    <span class="dots">
                      <span class="dot" />
                      <span class="dot delay-1" />
                      <span class="dot delay-2" />
                    </span>
                    生成中
                  </div>

                  <!-- 已停止 -->
                  <div v-if="msg.status === 'stopped'" class="stopped-text">已停止生成</div>

                  <!-- 错误 -->
                  <div v-if="msg.error" class="error-block">
                    {{ msg.error }}
                    <button class="retry-link" @click="retryMessage(msg)">重试</button>
                  </div>

                  <!-- 操作栏 -->
                  <div v-if="msg.role === 'assistant' && msg.status === 'complete'" class="message-actions">
                    <button class="action-btn" title="复制" @click="copyMessage(msg)">
                      <i class="i-tabler-copy text-xs" />
                    </button>
                    <button class="action-btn" title="点赞">
                      <i class="i-tabler-thumb-up text-xs" />
                    </button>
                    <button class="action-btn" title="点踩">
                      <i class="i-tabler-thumb-down text-xs" />
                    </button>
                    <button class="action-btn" title="重新生成" @click="retryMessage(msg)">
                      <i class="i-tabler-refresh text-xs" />
                    </button>
                    <span v-if="msg.usage" class="token-count">{{ msg.usage }} tokens</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Composer -->
          <div class="composer-wrap">
            <div class="composer-inner">
              <!-- 附件 -->
              <div v-if="attachments.length" class="attachments-row">
                <div v-for="file in attachments" :key="file" class="attachment-chip">
                  <i class="i-tabler-file-text text-sm text-brand" />
                  {{ file }}
                  <button class="remove-attachment" @click="attachments = []">
                    <i class="i-tabler-x text-xs" />
                  </button>
                </div>
              </div>

              <!-- 输入框 -->
              <div class="composer-box">
                <textarea
                  v-model="draft"
                  :disabled="generating"
                  rows="2"
                  placeholder="输入消息，按 Enter 发送 · Shift + Enter 换行"
                  class="composer-input"
                  @keydown.enter.exact.prevent="send"
                />
                <div class="composer-actions">
                  <div class="composer-left">
                    <button class="icon-btn-sm" title="添加附件" @click="attachments = ['research-notes.txt']">
                      <i class="i-tabler-paperclip text-sm" />
                    </button>
                    <button class="icon-btn-sm" title="预估 Token">
                      <i class="i-tabler-calculator text-sm" />
                    </button>
                    <span class="model-label">{{ selectedModelName }}</span>
                  </div>
                  <button v-if="generating" class="stop-btn" @click="stopGeneration">
                    <i class="i-tabler-square text-xs fill-current" />
                    停止
                  </button>
                  <button v-else class="send-btn" :disabled="!draft.trim()" @click="send">
                    发送
                    <i class="i-tabler-arrow-up text-sm" />
                  </button>
                </div>
              </div>
              <p class="composer-hint">Orbit Chat 可能生成不准确内容，请核验重要信息</p>
            </div>
          </div>
        </section>

        <!-- 检查器 -->
        <aside v-if="inspectorOpen" class="inspector">
          <div class="inspector-header">
            <span class="text-sm font-semibold">检查器</span>
            <button class="icon-btn" title="关闭" @click="inspectorOpen = false">
              <i class="i-tabler-x text-sm" />
            </button>
          </div>
          <div class="inspector-stats">
            <div class="inspector-tabs">
              <button class="inspector-tab active">消息大纲</button>
              <button class="inspector-tab">元信息</button>
            </div>
            <div class="stats-list">
              <div class="stat-row"><span>消息数量</span><b>{{ app.activeTopic?.messages.length ?? 0 }}</b></div>
              <div class="stat-row"><span>上下文窗口</span><b>128K</b></div>
              <div class="stat-row"><span>当前模型</span><b>GPT-4o</b></div>
            </div>
          </div>
          <div class="inspector-assistant">
            <div class="inspector-section-label">当前 Assistant</div>
            <div class="assistant-card">
              <div class="assistant-card-header">
                <div class="assistant-icon">
                  <i class="i-tabler-sparkles text-sm" />
                </div>
                <div>
                  <div class="text-sm font-medium">Orbit Assistant</div>
                  <div class="text-xs text-muted">通用对话助手</div>
                </div>
              </div>
              <p class="assistant-desc">帮助用户分析问题、整理信息并生成清晰可执行的方案。</p>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <!-- 移动底部导航 -->
    <nav class="mobile-nav">
      <RouterLink to="/" class="mobile-nav-btn" :class="{ active: $route.path === '/' }">
        <i class="i-tabler-message-circle text-lg" />
        对话
      </RouterLink>
      <RouterLink to="/search" class="mobile-nav-btn" :class="{ active: $route.path === '/search' }">
        <i class="i-tabler-search text-lg" />
        搜索
      </RouterLink>
      <RouterLink to="/settings" class="mobile-nav-btn" :class="{ active: $route.path === '/settings' }">
        <i class="i-tabler-settings text-lg" />
        设置
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped lang="scss">
.chat-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #667085;
  transition: all 0.15s;
  text-decoration: none;

  &:hover { background: #f3f4f6; color: #172033; }
}

.icon-btn-sm {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #667085;
  transition: all 0.15s;
  text-decoration: none;

  &:hover { background: #f3f4f6; color: #5b56d6; }
}

/* ===== 侧边栏 ===== */
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 68px;
  width: 276px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
  background: #fff;
  z-index: 30;
  transition: transform 0.2s ease;

  &.open { transform: translateX(0); }
  &:not(.open) { transform: translateX(-105%); }
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(15, 23, 42, 0.25);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 16px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 8px;

  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 12px;
    background: #efefff;
    color: #5b56d6;
  }

  &-text {
    font-weight: 600;
    letter-spacing: -0.02em;
  }
}

.sidebar-new {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px;
}

.new-topic-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  border-radius: 12px;
  background: #5b56d6;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  transition: background 0.15s;

  &:hover { background: #4a45bd; }
}

.sidebar-assistant {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px;
}

.sidebar-section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #667085;
  margin-bottom: 8px;
}

.assistant-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  border-radius: 12px;
  background: #efefff;
  padding: 8px 12px;
  text-align: left;

  .assistant-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: #fff;
    color: #5b56d6;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }

  .assistant-info { flex: 1; min-width: 0; }
  .assistant-name { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .assistant-model { font-size: 12px; color: #667085; }
}

.sidebar-topics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px;
}

.sidebar-topics {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.empty-topics {
  padding: 40px 12px;
  text-align: center;
}

.topic-group-label {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  color: #667085;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border-radius: 8px;
  padding: 8px 12px;
  text-align: left;
  font-size: 14px;
  color: #667085;
  transition: background 0.1s;

  &:hover { background: #f9fafb; color: #172033; }
  &.active { background: #f3f4f6; color: #172033; }

  .topic-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .topic-more {
    opacity: 0;
    transition: opacity 0.15s;
    display: flex;
    align-items: center;
  }

  &:hover .topic-more { opacity: 1; }
}

.sidebar-footer {
  border-top: 1px solid #e5e7eb;
  padding: 12px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  background: #f8fafc;
  padding: 10px 12px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
}

/* ===== 主区 ===== */
.chat-main {
  margin-left: 276px;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 0;
  background: #fff;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  shrink: 0;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.header-info { min-width: 0; }
.header-title {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.header-sub {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #667085;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chat-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.chat-section {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.message-area {
  flex: 1;
  overflow-y: auto;
  padding: 32px 24px 144px;
}

.message-container {
  max-width: 820px;
  margin: 0 auto;
}

/* ===== 欢迎页 ===== */
.welcome-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 54vh;
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 24px;
  background: #efefff;
  color: #5b56d6;
  margin-bottom: 20px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
}

.welcome-desc {
  margin-top: 8px;
  font-size: 14px;
  color: #667085;
}

.prompts-grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  width: 100%;
  max-width: 620px;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
}

.prompt-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 16px;
  text-align: left;
  transition: all 0.15s;

  &:hover {
    border-color: #5b56d6;
    background: #efefff;
  }

  .prompt-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .prompt-text {
    font-size: 12px;
    line-height: 1.5;
    color: #667085;
    margin: 0;
  }
}

/* ===== 消息行 ===== */
.message-row {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}

.message-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  shrink: 0;
  border-radius: 12px;
  background: #5b56d6;
  color: #fff;
  margin-top: 4px;
}

.message-bubble-user {
  margin-left: auto;
  max-width: 78%;
  border-radius: 16px 16px 4px 16px;
  background: #5b56d6;
  padding: 12px 16px;
  color: #fff;
  font-size: 14px;
  line-height: 1.75;
}

.message-bubble-assistant {
  max-width: 86%;
  padding-top: 4px;
  font-size: 14px;
  line-height: 1.75;
}

.message-content {
  :deep(p) { margin: 0 0 10px; }
  :deep(p:last-child) { margin-bottom: 0; }
  :deep(code) {
    color: #c7d2fe;
    background: #18212f;
    border-radius: 5px;
    padding: 2px 5px;
    font-size: 12px;
  }
  :deep(pre) {
    overflow: auto;
    color: #dbe5f1;
    background: #18212f;
    border-radius: 10px;
    padding: 14px;
    margin-top: 12px;
    font-size: 12px;
    line-height: 1.6;
  }
}

/* ===== 思考块 ===== */
.thinking-block {
  margin-bottom: 12px;
  border-radius: 12px;
  border: 1px solid #ddd6fe;
  background: #f5f3ff;
  padding: 12px;
  font-size: 12px;
  color: #6d28d9;
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 4px;
}

.thinking-content {
  line-height: 1.5;
  opacity: 0.8;
}

/* ===== 流式中 ===== */
.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: #667085;
}

.dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5b56d6;
  animation: bounce 1s infinite;

  &.delay-1 { animation-delay: 120ms; }
  &.delay-2 { animation-delay: 240ms; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.stopped-text {
  margin-top: 8px;
  font-size: 12px;
  color: #667085;
}

.error-block {
  margin-top: 12px;
  border-radius: 12px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  padding: 12px;
  font-size: 12px;
  color: #b91c1c;
}

.retry-link {
  margin-left: 12px;
  font-weight: 500;
  text-decoration: underline;
}

/* ===== 消息操作栏 ===== */
.message-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  color: #667085;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.1s;

  &:hover { background: #f3f4f6; }
}

.token-count {
  margin-left: 8px;
  font-size: 11px;
}

/* ===== Composer ===== */
.composer-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, #fff, #fff, transparent);
  padding: 40px 16px 20px;
}

.composer-inner {
  max-width: 820px;
  margin: 0 auto;
}

.attachments-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.attachment-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 8px 12px;
  font-size: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.remove-attachment {
  display: flex;
  align-items: center;
  color: #667085;
}

.composer-box {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(16,24,40,0.06);

  &:focus-within {
    border-color: #5b56d6;
    box-shadow: 0 0 0 4px rgba(91, 86, 214, 0.08);
  }
}

.composer-input {
  width: 100%;
  resize: none;
  border: 0;
  background: transparent;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;

  &::placeholder { color: #9ca3af; }
  &:disabled { opacity: 0.5; }
}

.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 4px;
}

.composer-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.model-label {
  margin-left: 8px;
  font-size: 12px;
  color: #667085;
}

.stop-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  border-radius: 8px;
  background: #111827;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;

  &:hover { background: #1f2937; }
}

.send-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  border-radius: 8px;
  background: #5b56d6;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;

  &:hover { background: #4a45bd; }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
}

.composer-hint {
  margin-top: 8px;
  text-align: center;
  font-size: 11px;
  color: #9ca3af;
}

/* ===== 检查器 ===== */
.inspector {
  width: 304px;
  shrink: 0;
  border-left: 1px solid #e5e7eb;
  background: #f8fafc;

  @media (max-width: 1179px) { display: none; }
}

.inspector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 16px;
}

.inspector-stats {
  border-bottom: 1px solid #e5e7eb;
  padding: 16px;
}

.inspector-tabs {
  display: flex;
  gap: 4px;
  border-radius: 8px;
  background: rgba(229, 231, 235, 0.7);
  padding: 4px;
  margin-bottom: 12px;
}

.inspector-tab {
  flex: 1;
  border-radius: 6px;
  padding: 6px 0;
  font-size: 12px;
  font-weight: 500;
  color: #667085;

  &.active {
    background: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 12px;
  color: #667085;
}

.stat-row {
  display: flex;
  justify-content: space-between;

  b { color: #172033; font-weight: 600; }
}

.inspector-assistant {
  padding: 16px;
}

.inspector-section-label {
  font-size: 12px;
  font-weight: 600;
  color: #172033;
  margin-bottom: 12px;
}

.assistant-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 12px;
}

.assistant-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .assistant-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: #efefff;
    color: #5b56d6;
  }
}

.assistant-desc {
  font-size: 12px;
  line-height: 1.5;
  color: #667085;
  margin: 0;
}

/* ===== 移动导航 ===== */
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 58px;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

.mobile-nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #667085;
  text-decoration: none;

  &.active { color: #5b56d6; }
}

/* ===== 响应式 ===== */
.mobile-only { display: none; }

@media (max-width: 759px) {
  .mobile-only { display: flex; }
  .mobile-nav { display: flex; }
  .chat-main {
    margin-left: 0;
    padding-bottom: 58px;
  }
  .composer-wrap { bottom: 58px; }
  .message-area { padding-left: 16px; padding-right: 16px; }
  .sidebar {
    left: 0;
    box-shadow: 10px 0 30px rgba(16,24,40,0.14);
  }
}
</style>
