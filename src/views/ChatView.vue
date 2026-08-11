<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import MessageList from '@/components/MessageList.vue'
import WelcomePrompts from '@/components/WelcomePrompts.vue'
import MessageSender from '@/components/MessageSender.vue'
import type { ChatMessage } from '@/types'

const app = useAppStore()

const sidebarOpen = ref(false)
const inspectorOpen = ref(true)
const isMobile = ref(window.innerWidth <= 759)

function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }

function handleCreateTopic() {
  app.createTopic()
  sidebarOpen.value = false
  ElMessage.success('已创建新话题')
}

function handleSelectTopic(id: string) {
  app.selectTopic(id)
  sidebarOpen.value = false
}

async function handleDeleteTopic(id: string) {
  try {
    await ElMessageBox.confirm('删除后无法恢复，确认删除？', '删除话题', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
    app.deleteTopic(id)
    ElMessage.success('已删除')
  } catch { /* cancelled */ }
}

function handleTogglePin(id: string) { app.togglePin(id) }

function handleRenameTopic(id: string) {
  ElMessageBox.prompt('输入新的话题名称', '重命名', {
    confirmButtonText: '保存', cancelButtonText: '取消',
    inputValue: app.topics.find(t => t.id === id)?.name ?? '',
  }).then(({ value }) => {
    if (value?.trim()) app.renameTopic(id, value.trim())
  }).catch(() => {})
}

function handleClearMessages(id: string) {
  ElMessageBox.confirm('清空所有消息？此操作不可撤销。', '清空消息', { type: 'warning' })
    .then(() => { app.clearTopicMessages(id); ElMessage.success('已清空') })
    .catch(() => {})
}

const hasMessages = computed(() => (app.activeTopic?.messages.length ?? 0) > 0)
const selectedModelName = computed(() => app.activeAssistant?.model?.name ?? 'GPT-4o')

const messageListRef = ref<InstanceType<typeof MessageList>>()
const generating = computed(() => messageListRef.value?.generating ?? false)

function onSend(text: string) {
  if (!app.activeTopic) {
    app.createTopic()
  }
  const topicId = app.activeTopicId
  const userMsg = app.addMessage(topicId, {
    role: 'user',
    status: 'complete',
    blocks: [{
      id: crypto.randomUUID(),
      messageId: '',
      type: 'main_text',
      createdAt: new Date().toISOString(),
      status: 'success',
      content: text,
    }],
  })
  if (userMsg.blocks[0]) userMsg.blocks[0].messageId = userMsg.id
  app.autoNameTopic(topicId, text)

  // Simulate assistant response
  const assistantMsg = app.addMessage(topicId, {
    role: 'assistant',
    status: 'streaming',
    askId: userMsg.id,
    blocks: [{
      id: crypto.randomUUID(),
      messageId: '',
      type: 'main_text',
      createdAt: new Date().toISOString(),
      status: 'streaming',
      content: '',
    }],
  })
  if (assistantMsg.blocks[0]) assistantMsg.blocks[0].messageId = assistantMsg.id

  setTimeout(() => {
    app.updateMessage(topicId, assistantMsg.id, {
      status: 'complete',
      metrics: {
        completion_tokens: 126,
        time_completion_millsec: 1500,
        time_first_token_millsec: 200,
        time_thinking_millsec: 0,
      },
      blocks: [{
        id: assistantMsg.blocks[0]?.id ?? crypto.randomUUID(),
        messageId: assistantMsg.id,
        type: 'main_text',
        createdAt: assistantMsg.blocks[0]?.createdAt ?? new Date().toISOString(),
        status: 'success',
        content: '这是一个可交互的 Orbit Chat 原型。你可以继续发送消息、切换搜索和设置视图，并在移动端查看响应式布局。\n\n下一步可以接入真实的 IndexedDB、Provider 适配器和流式响应。',
      }],
    })
  }, 1500)
}

function onPromptClick(text: string) {
  onSend(text)
}

function stopGeneration() {
  messageListRef.value?.stopGeneration()
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
        <div class="sidebar-section-label">Assistants</div>
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
        <RouterLink to="/search" class="icon-btn-sm" title="搜索历史"><i class="i-tabler-search text-sm" /></RouterLink>
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
            v-for="topic in app.sortedTopics.filter(t => t.pinned)" :key="topic.id"
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
            v-for="topic in app.sortedTopics.filter(t => !t.pinned)" :key="topic.id"
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
            <div class="header-sub"><span class="status-dot" />{{ selectedModelName }} · 已就绪</div>
          </div>
        </div>
        <div class="header-actions">
          <button v-if="generating" class="stop-btn-header" @click="stopGeneration"><i class="i-tabler-square text-xs fill-current" />停止</button>
          <button class="icon-btn" title="检查器" @click="inspectorOpen = !inspectorOpen"><i class="i-tabler-layout-sidebar-right-collapse text-sm" /></button>
          <RouterLink to="/settings" class="icon-btn" title="设置"><i class="i-tabler-settings text-sm" /></RouterLink>
        </div>
      </header>

      <div class="chat-body">
        <section class="chat-section">
          <div class="message-area scrollbar">
            <div class="message-container">
              <WelcomePrompts v-if="!hasMessages" @prompt-click="onPromptClick" />
              <MessageList v-else ref="messageListRef" />
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
  </div>
</template>

<style scoped lang="scss">
.chat-layout { display: flex; height: 100vh; overflow: hidden; }
.icon-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; color: #667085; transition: all 0.15s; text-decoration: none; &:hover { background: #f3f4f6; color: #172033; } }
.icon-btn-sm { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; color: #667085; transition: all 0.15s; text-decoration: none; &:hover { background: #f3f4f6; color: #5b56d6; } }

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
.sidebar-topics { flex: 1; overflow-y: auto; padding: 0 8px; }
.empty-topics { padding: 40px 12px; text-align: center; }
.topic-group-label { padding: 4px 8px; font-size: 11px; font-weight: 500; color: #667085; }
.topic-item { display: flex; align-items: center; gap: 8px; width: 100%; border-radius: 8px; padding: 8px 12px; text-align: left; font-size: 14px; color: #667085; transition: background 0.1s; &:hover { background: #f9fafb; color: #172033; } &.active { background: #f3f4f6; color: #172033; } .topic-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .topic-more { opacity: 0; transition: opacity 0.15s; display: flex; align-items: center; } &:hover .topic-more { opacity: 1; } }
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
