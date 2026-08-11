<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSearchStore } from '@/stores/search'
import { useAppStore } from '@/stores/app'
import { Icon } from '@iconify/vue'
import type { IndexedDoc } from '@/services/search/index'
import type { ChatMessage } from '@/types'

const chatStore = useChatStore()
const appStore = useAppStore()
const searchStore = useSearchStore()

const searchQuery = ref('')
const selectedScope = ref<'all' | 'current'>('all')
const previewDoc = ref<IndexedDoc | null>(null)

// Two-way sync
watch(() => searchStore.query, (v) => { if (searchQuery.value !== v) searchQuery.value = v })
watch(searchQuery, (v) => {
  searchStore.setQuery(v)
})

watch(selectedScope, (s) => {
  searchStore.setScope(s, chatStore.activeAssistantId)
})

onMounted(() => {
  if (!searchStore.indexReady) {
    searchStore.rebuild()
  }
})

const resultCountLabel = computed(() => `${searchStore.results.length}`)

function highlight(text: string, query: string): string {
  const display = text.length > 300 ? text.slice(0, 300) + '…' : text
  if (!query.trim()) return escapeHtml(display)
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return escapeHtml(display).replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="search-highlight">$1</mark>',
  )
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function shortTime(iso: string): string {
  try {
    const d = new Date(iso)
    const y = d.getFullYear()
    const mo = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${mo}-${day} ${h}:${mi}`
  } catch {
    return iso
  }
}

function openTopic(topicId: string) {
  chatStore.openConversation(topicId)
  emitView('chat')
}

// ─── Preview Drawer ───
const previewMessages = ref<ChatMessage[]>([])

function openPreview(doc: IndexedDoc) {
  previewDoc.value = doc
  const topic = appStore.topicById(doc.topicId)
  if (!topic) return
  const idx = topic.messages.findIndex(m => m.id === doc.messageId)
  if (idx < 0) return
  const start = Math.max(0, idx - 2)
  const end = Math.min(topic.messages.length, idx + 3)
  previewMessages.value = topic.messages.slice(start, end)
}

function closePreview() {
  previewDoc.value = null
  previewMessages.value = []
}

function scrollToMessage(topicId: string, messageId: string) {
  chatStore.openConversation(topicId)
  closePreview()
  // @ts-expect-error runtime scroll target
  window.__searchScrollTarget = messageId
}

const emit = defineEmits<{ 'switch-view': [view: 'chat' | 'search' | 'settings'] }>()
function emitView(v: 'chat' | 'search' | 'settings') {
  emit('switch-view', v)
}

const searchInputRef = ref<HTMLInputElement | null>(null)
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchInputRef.value?.focus()
  }
  if (e.key === 'Escape' && previewDoc.value) {
    closePreview()
  }
}
</script>

<template>
  <section class="search-view scroll" @keydown="onKeydown">
    <div class="search-container">
      <div class="search-header">
        <div class="search-title-row">
          <div>
            <h1 class="search-heading">搜索历史</h1>
            <p class="search-subtitle">跨 Assistant 和 Topic 搜索消息内容</p>
          </div>
          <div class="search-index-badge">
            <Icon icon="tabler:search" :size="14" />
            <span v-if="searchStore.indexReady">已索引 {{ searchStore.docCount }} 条</span>
            <span v-else class="index-loading">索引导入中…</span>
          </div>
        </div>

        <div class="search-input-row">
          <div class="search-input-wrap">
            <Icon icon="tabler:search" :size="18" class="search-input-icon" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              autofocus
              placeholder="搜索 Topic、消息正文……"
              class="search-input"
            />
            <kbd class="search-shortcut">Ctrl K</kbd>
          </div>
          <select v-model="selectedScope" class="search-scope">
            <option value="all">全部助手</option>
            <option value="current">当前助手</option>
          </select>
        </div>
      </div>

      <div v-if="searchStore.results.length" class="search-results">
        <div class="search-result-count">
          找到 {{ resultCountLabel }} 个话题
        </div>

        <article
          v-for="group in searchStore.results"
          :key="group.topicId"
          class="search-result-card"
        >
          <div class="search-result-top">
            <div
              class="search-result-info"
              @click="openTopic(group.topicId)"
            >
              <div class="search-result-title-row">
                <h2 class="search-result-title">{{ group.topicName }}</h2>
                <Icon v-if="group.pinned" icon="tabler:pinned" :size="13" class="search-result-pin" />
              </div>
              <div class="search-result-meta">
                {{ group.assistantName }} · {{ shortTime(group.updatedAt) }}
              </div>
            </div>
            <Icon
              icon="tabler:external-link"
              :size="16"
              class="search-result-link"
              @click="openTopic(group.topicId)"
            />
          </div>

          <div v-if="group.messages.length" class="search-result-messages">
            <div
              v-for="msg in group.messages.slice(0, 3)"
              :key="msg.messageId"
              class="search-result-message"
              @click="openPreview(msg)"
            >
              <span
                class="search-result-message-icon"
                :class="msg.role === 'user' ? 'user' : 'assistant'"
              >
                <Icon :icon="msg.role === 'user' ? 'tabler:user' : 'tabler:robot'" :size="13" />
              </span>
              <div class="search-result-message-body">
                <p
                  class="search-result-message-text"
                  v-html="highlight(msg.content, searchQuery)"
                />
                <span class="search-result-message-time">{{ shortTime(msg.createdAt) }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="search-empty">
        <Icon icon="tabler:search" :size="36" class="search-empty-icon" />
        <template v-if="searchQuery">
          <h2 class="search-empty-title">没有找到相关内容</h2>
          <p class="search-empty-hint">尝试搜索其他关键词，或扩大搜索范围</p>
        </template>
        <template v-else>
          <h2 class="search-empty-title">输入关键词开始搜索</h2>
          <p class="search-empty-hint">
            搜索跨 {{ searchStore.indexReady ? `全部 ${searchStore.docCount} 条` : '全部' }} 消息
          </p>
        </template>
      </div>
    </div>

    <!-- Preview Drawer -->
    <Teleport to="body">
      <div v-if="previewDoc" class="preview-backdrop" @click="closePreview" />
      <aside v-if="previewDoc" class="preview-drawer">
        <div class="preview-header">
          <div class="preview-header-left">
            <Icon icon="tabler:eye" :size="16" />
            <span class="preview-title">上下文预览</span>
          </div>
          <button class="preview-close" @click="closePreview">
            <Icon icon="tabler:x" :size="16" />
          </button>
        </div>

        <div class="preview-meta">
          <div class="preview-meta-topic">{{ previewDoc.topicName }}</div>
          <div class="preview-meta-assistant">{{ previewDoc.assistantName }}</div>
        </div>

        <div class="preview-messages">
          <div
            v-for="msg in previewMessages"
            :key="msg.id"
            class="preview-message"
            :class="{
              'preview-target': msg.id === previewDoc.messageId,
              [`preview-${msg.role}`]: true,
            }"
            @click="scrollToMessage(previewDoc.topicId, msg.id)"
          >
            <div class="preview-message-role">
              <Icon
                :icon="msg.role === 'user' ? 'tabler:user' : msg.role === 'assistant' ? 'tabler:robot' : 'tabler:settings'"
                :size="14"
              />
              <span>{{ msg.role === 'user' ? '用户' : msg.role === 'assistant' ? '助手' : '系统' }}</span>
            </div>
            <p
              class="preview-message-content"
              v-html="highlight(msg.content, searchQuery)"
            />
            <div class="preview-message-time">{{ shortTime(msg.createdAt) }}</div>
          </div>
        </div>

        <div class="preview-actions">
          <button class="preview-btn preview-btn-primary" @click="openTopic(previewDoc.topicId)">
            <Icon icon="tabler:arrow-right" :size="14" />
            打开完整对话
          </button>
        </div>
      </aside>
    </Teleport>
  </section>
</template>

<style scoped>
.search-view {
  height: 100%;
  overflow-y: auto;
}

.search-container {
  width: min(100%, 1000px);
  margin: 0 auto;
  padding: 32px 20px;
}

@media (min-width: 1024px) {
  .search-container { padding: 32px 40px; }
}

.search-header { margin-bottom: 32px; }

.search-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.search-heading {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.search-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--muted);
}

.search-index-badge {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--surface-2);
  border-radius: 8px;
  font-size: 12px;
  color: var(--muted);
}

.search-index-badge .index-loading {
  color: var(--warning);
}

@media (min-width: 640px) {
  .search-index-badge { display: flex; }
}

.search-input-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

@media (min-width: 640px) {
  .search-input-row { flex-direction: row; }
}

.search-input-wrap {
  position: relative;
  flex: 1;
}

.search-input-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  color: var(--muted);
  transform: translateY(-50%);
}

.search-input {
  width: 100%;
  height: 48px;
  padding: 0 60px 0 40px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 140ms ease;
}

.search-input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 10%, transparent);
}

.search-shortcut {
  position: absolute;
  top: 50%;
  right: 12px;
  display: none;
  padding: 4px 8px;
  background: var(--surface-3);
  border-radius: 4px;
  font-size: 10px;
  color: var(--muted);
  transform: translateY(-50%);
}

@media (min-width: 640px) {
  .search-shortcut { display: block; }
}

.search-scope {
  height: 48px;
  padding: 0 16px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.search-scope:focus {
  border-color: var(--brand);
}

.search-result-count {
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--muted);
}

.search-result-card {
  margin-bottom: 12px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  transition: border-color 140ms ease, box-shadow 140ms ease;
}

.search-result-card:hover {
  border-color: var(--brand);
  box-shadow: var(--shadow-sm);
}

.search-result-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.search-result-info {
  min-width: 0;
  flex: 1;
  cursor: pointer;
}

.search-result-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-result-title {
  margin: 0;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
}

.search-result-pin { color: var(--brand); flex-shrink: 0; }

.search-result-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
}

.search-result-link {
  flex-shrink: 0;
  color: var(--muted);
  cursor: pointer;
}

.search-result-messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.search-result-message {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--surface-2);
  border-radius: 8px;
  cursor: pointer;
  transition: background 140ms ease;
}

.search-result-message:hover {
  background: var(--surface-3);
}

.search-result-message-icon {
  display: flex;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.search-result-message-icon.user {
  color: white;
  background: var(--brand);
}

.search-result-message-icon.assistant {
  color: var(--brand);
  background: var(--surface);
  border: 1px solid var(--line);
}

.search-result-message-body {
  min-width: 0;
  flex: 1;
}

.search-result-message-text {
  margin: 0;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.search-result-message-time {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--muted);
}

:deep(.search-highlight) {
  padding: 0 2px;
  background: color-mix(in srgb, var(--warning) 30%, transparent);
  border-radius: 2px;
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 380px;
  text-align: center;
}

.search-empty-icon { color: var(--line-strong); }

.search-empty-title {
  margin: 16px 0 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
}

.search-empty-hint {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--muted);
}

/* ═══ Preview Drawer ═══ */
.preview-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  background: color-mix(in srgb, var(--text) 30%, transparent);
}

.preview-drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 101;
  display: flex;
  width: min(420px, 90vw);
  height: 100%;
  flex-direction: column;
  background: var(--surface);
  border-left: 1px solid var(--line);
  box-shadow: -4px 0 24px rgb(0 0 0 / 8%);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
}

.preview-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.preview-close {
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.preview-close:hover {
  background: var(--surface-2);
}

.preview-meta {
  padding: 12px 20px;
  border-bottom: 1px solid var(--line);
  background: var(--surface-2);
}

.preview-meta-topic {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.preview-meta-assistant {
  margin-top: 2px;
  font-size: 12px;
  color: var(--muted);
}

.preview-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.preview-message {
  padding: 10px 20px;
  margin: 0 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 140ms ease;
}

.preview-message:hover {
  background: var(--surface-2);
}

.preview-message.preview-target {
  background: color-mix(in srgb, var(--brand) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand) 20%, transparent);
}

.preview-message-role {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
}

.preview-message-content {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-secondary);
}

.preview-message-time {
  margin-top: 6px;
  font-size: 11px;
  color: var(--muted);
}

.preview-actions {
  padding: 12px 20px;
  border-top: 1px solid var(--line);
}

.preview-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 0;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 140ms ease;
}

.preview-btn-primary {
  color: white;
  background: var(--brand);
  border-color: var(--brand);
}

.preview-btn-primary:hover {
  opacity: 0.9;
}
</style>
